import { prisma } from "@/lib/prisma";
import { MarketStatusResult } from "@/types/market";
import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { runMarketAnalysis } from "../../../../../scripts/glyph-decision/market-analysis";
import { getGlyphDecisionMarketStatus } from "../../../../../scripts/glyph-decision/trade-cycle/market-gate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isAuthorized(request: NextRequest): boolean {
    const secret = process.env.CRON_SECRET;
    if (!secret) {
        console.warn("[MarketAnalysisCron] CRON_SECRET is not configured in environment variables.");
        return false;
    }

    // 1. Check Bearer token in Authorization header (standard Vercel Cron header)
    const authorization = request.headers.get("authorization");
    if (authorization?.startsWith("Bearer ")) {
        const token = authorization.slice(7).trim();
        const tokenBuffer = Buffer.from(token, "utf8");
        const secretBuffer = Buffer.from(secret, "utf8");
        if (tokenBuffer.length === secretBuffer.length && crypto.timingSafeEqual(tokenBuffer, secretBuffer)) {
            return true;
        }
    }

    // 2. Check query parameter `key` or `secret` (for manual browser / external test invocation)
    const queryKey = request.nextUrl.searchParams.get("key") || request.nextUrl.searchParams.get("secret");
    if (queryKey) {
        const keyBuffer = Buffer.from(queryKey.trim(), "utf8");
        const secretBuffer = Buffer.from(secret, "utf8");
        if (keyBuffer.length === secretBuffer.length && crypto.timingSafeEqual(keyBuffer, secretBuffer)) {
            return true;
        }
    }

    return false;
}

export async function handleMarketAnalysisRequest(request: NextRequest): Promise<NextResponse> {
    if (!isAuthorized(request)) {
        return NextResponse.json({
            status: "UNAUTHORIZED",
            message: "Invalid or missing cron authorization. Ensure Bearer token or key parameter matches CRON_SECRET.",
        }, { status: 401 });
    }

    let body: { asset?: string; force?: boolean; agentId?: string } = {};
    if (request.method === "POST") {
        try {
            body = await request.json();
        } catch {
            // Empty body is valid
        }
    }

    const searchParams = request.nextUrl.searchParams;
    const forceParam = searchParams.get("force");
    const isForce = body.force === true || forceParam === "true" || forceParam === "1";
    const targetAsset = (body.asset || searchParams.get("asset") || undefined)?.toUpperCase();
    const agentIdentifier = body.agentId || searchParams.get("agentId") || process.env.GLYPH_AGENT_ID || "485";

    try {
        // 1. Concurrency lock check
        const activeRun = await prisma.agentRun.findFirst({
            where: {
                cycleKey: { startsWith: `market-analysis:${agentIdentifier}:` },
                startedAt: { gt: new Date(Date.now() - 30 * 60 * 1000) },
                completedAt: null,
            },
            select: { id: true, startedAt: true },
        });
        if (activeRun) {
            return NextResponse.json({
                status: "CONFLICT",
                message: "A market analysis execution is already running.",
                startedAt: activeRun.startedAt,
            }, { status: 409 });
        }

        // 2. Market gate check (unless force is requested)
        if (!isForce) {
            let marketStatus: MarketStatusResult | null = null;
            try {
                marketStatus = await getGlyphDecisionMarketStatus();
            } catch (statusError) {
                console.warn("[MarketAnalysisCron] Failed to verify market status:", statusError);
            }

            if (marketStatus && marketStatus.status === "closed") {
                return NextResponse.json({
                    status: "MARKET_CLOSED",
                    message: "Market analysis skipped because the US market is CLOSED. Use ?force=true to override.",
                    marketStatus,
                    checkedAt: marketStatus.checkedAt,
                }, { status: 200 });
            }

            if (marketStatus && marketStatus.status === "unknown") {
                return NextResponse.json({
                    status: "MARKET_STATUS_UNKNOWN",
                    message: "Market analysis skipped because US market status could not be verified. Use ?force=true to override.",
                    marketStatus,
                    checkedAt: marketStatus.checkedAt,
                }, { status: 200 });
            }

            // 3. Cooldown check (60 minutes)
            const recentRun = await prisma.agentRun.findFirst({
                where: {
                    cycleKey: { startsWith: `market-analysis:${agentIdentifier}:` },
                    completedAt: { not: null },
                },
                orderBy: { completedAt: "desc" },
                select: { completedAt: true },
            });
            if (recentRun?.completedAt) {
                const elapsedMinutes = (Date.now() - recentRun.completedAt.getTime()) / 60000;
                if (elapsedMinutes < 60) {
                    return NextResponse.json({
                        status: "COOLDOWN",
                        message: `Market analysis cooldown active; retry in ${Math.ceil(60 - elapsedMinutes)} minute(s). Use ?force=true to override.`,
                    }, { status: 429 });
                }
            }
        }

        // 4. Run market analysis
        const result = await runMarketAnalysis({
            agentId: agentIdentifier,
            asset: targetAsset,
        });

        const httpStatus = result.status === "COMPLETED" ? 200 : 200; // Return 200 with result payload for cron observability
        return NextResponse.json({
            status: result.status,
            executionId: result.executionId,
            startedAt: result.startedAt,
            completedAt: result.completedAt,
            durationMs: result.durationMs,
            assets: result.assets,
            results: result.results.map((item) => ({
                asset: item.asset,
                ok: item.ok,
                snapshotId: item.snapshotId,
                error: item.error,
            })),
        }, { status: httpStatus });
    } catch (error) {
        console.error("[MarketAnalysisCron] Execution failed:", error);
        return NextResponse.json({
            status: "FAILED",
            message: error instanceof Error ? error.message : String(error),
        }, { status: 500 });
    }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
    return handleMarketAnalysisRequest(request);
}

export async function POST(request: NextRequest): Promise<NextResponse> {
    return handleMarketAnalysisRequest(request);
}