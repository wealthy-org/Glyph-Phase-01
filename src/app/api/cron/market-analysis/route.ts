import { TwelveDataProvider } from "@/lib/market/twelve-data";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { runMarketAnalysis } from "../../../../../scripts/glyph-decision/market-analysis";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isAuthorized(request: NextRequest): boolean {
    const secret = process.env.CRON_SECRET;
    const authorization = request.headers.get("authorization");
    if (!secret || !authorization?.startsWith("Bearer ")) return false;
    const token = authorization.slice(7).trim();
    const tokenBuffer = Buffer.from(token, "utf8");
    const secretBuffer = Buffer.from(secret, "utf8");
    return tokenBuffer.length === secretBuffer.length && crypto.timingSafeEqual(tokenBuffer, secretBuffer);
}

export async function POST(request: NextRequest): Promise<NextResponse> {
    if (!isAuthorized(request)) {
        return NextResponse.json({ status: "UNAUTHORIZED", message: "Invalid or missing cron authorization." }, { status: 401 });
    }

    const agentId = process.env.GLYPH_AGENT_ID || "1";
    let body: { asset?: string; force?: boolean } = {};
    try {
        body = await request.json();
    } catch {
        // Empty request body is valid.
    }

    try {
        const activeRun = await prisma.agentRun.findFirst({
            where: {
                cycleKey: { startsWith: `market-analysis:${agentId}:` },
                startedAt: { gt: new Date(Date.now() - 60 * 60 * 1000) },
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

        if (!body.force) {
            const marketStatus = await new TwelveDataProvider().getMarketStatus("United States");
            if (!marketStatus.isOpen) {
                return NextResponse.json({
                    status: "MARKET_CLOSED",
                    message: `Market analysis skipped because the US market is ${marketStatus.status.toUpperCase()}.`,
                    checkedAt: marketStatus.checkedAt,
                }, { status: 200 });
            }

            const recentRun = await prisma.agentRun.findFirst({
                where: {
                    cycleKey: { startsWith: `market-analysis:${agentId}:` },
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
                        message: `Market analysis cooldown active; retry in ${Math.ceil(60 - elapsedMinutes)} minute(s).`,
                    }, { status: 429 });
                }
            }
        }

        const result = await runMarketAnalysis({ agentId, asset: body.asset });
        const httpStatus = result.status === "COMPLETED" ? 200 : 500;
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

export async function GET(): Promise<NextResponse> {
    return NextResponse.json({
        status: "METHOD_NOT_ALLOWED",
        message: "Use POST /api/cron/market-analysis.",
    }, { status: 405 });
}