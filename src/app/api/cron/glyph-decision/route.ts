import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { runMarketAnalysis } from "../../../../../scripts/glyph-decision/market-analysis";
import { getGlyphDecisionMarketStatus } from "../../../../../scripts/glyph-decision/trade-cycle/market-gate";
import { runTradeCycle } from "../../../../../scripts/glyph-decision/trade-cycle/runner";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

class CronConflictError extends Error {
    constructor() {
        super("A Glyph Decision cron execution is already running.");
        this.name = "CronConflictError";
    }
}

const ACTIVE_LOCK_CODE = "GLYPH_DECISION_CRON_LOCK_ACTIVE";
const LOCK_STALE_AFTER_MS = 30 * 60 * 1000;

function isAuthorized(request: NextRequest): boolean {
    const secret = process.env.CRON_SECRET;
    const authorization = request.headers.get("authorization");
    if (!secret || !authorization?.startsWith("Bearer ")) return false;

    const token = authorization.slice(7).trim();
    const tokenBuffer = Buffer.from(token, "utf8");
    const secretBuffer = Buffer.from(secret, "utf8");
    return tokenBuffer.length === secretBuffer.length && crypto.timingSafeEqual(tokenBuffer, secretBuffer);
}

function isUniqueConstraintError(error: unknown): boolean {
    return typeof error === "object" && error !== null && "code" in error && error.code === "P2002";
}

async function acquireCronLock(agentIdentifier: string): Promise<string> {
    const agent = await prisma.agent.findUnique({
        where: { agentId: agentIdentifier },
        select: { id: true },
    });
    if (!agent) throw new Error(`Agent #${agentIdentifier} was not found in the database.`);

    const cycleKey = `glyph-decision-cron:${agentIdentifier}:lock`;
    const existing = await prisma.agentRun.findUnique({ where: { cycleKey } });
    if (
        existing?.errorCode === ACTIVE_LOCK_CODE &&
        Date.now() - existing.startedAt.getTime() < LOCK_STALE_AFTER_MS
    ) {
        throw new CronConflictError();
    }

    if (existing) {
        const claimed = await prisma.agentRun.updateMany({
            where: {
                id: existing.id,
                OR: [
                    { errorCode: null },
                    { errorCode: { not: ACTIVE_LOCK_CODE } },
                    { startedAt: { lt: new Date(Date.now() - LOCK_STALE_AFTER_MS) } },
                ],
            },
            data: {
                agentId: agent.id,
                startedAt: new Date(),
                // Keep completedAt non-null so Koki A does not see this as an active run.
                completedAt: new Date(),
                error: null,
                errorCode: ACTIVE_LOCK_CODE,
                decision: Prisma.JsonNull,
                policyResult: null,
                tradeId: null,
                transactionHash: null,
            },
        });
        if (claimed.count !== 1) throw new CronConflictError();
        return existing.id;
    }

    try {
        const lock = await prisma.agentRun.create({
            data: {
                agentId: agent.id,
                cycleKey,
                startedAt: new Date(),
                completedAt: new Date(),
                errorCode: ACTIVE_LOCK_CODE,
            },
            select: { id: true },
        });
        return lock.id;
    } catch (error) {
        if (isUniqueConstraintError(error)) throw new CronConflictError();
        throw error;
    }
}

async function releaseCronLock(lockId: string, error?: unknown): Promise<void> {
    await prisma.agentRun.update({
        where: { id: lockId },
        data: {
            completedAt: new Date(),
            error: error
                ? (error instanceof Error ? error.message : String(error))
                : "GLYPH_DECISION_CRON_LOCK_RELEASED",
            errorCode: error ? "GLYPH_DECISION_CRON_FAILED" : null,
        },
    });
}

export async function POST(request: NextRequest): Promise<NextResponse> {
    console.log("[Glyph Decision Cron] Started");
    if (!isAuthorized(request)) {
        return NextResponse.json(
            { success: false, status: "failed", error: "Unauthorized" },
            { status: 401 }
        );
    }

    let body: { agentId?: string; asset?: string } = {};
    try {
        body = await request.json();
    } catch {
        // Empty request body is valid.
    }

    const agentIdentifier = body.agentId || process.env.GLYPH_AGENT_ID || "1";
    let marketStatus;
    try {
        marketStatus = await getGlyphDecisionMarketStatus();
    } catch (error) {
        console.error("[Glyph Decision Cron] Market status check failed", error);
        return NextResponse.json(
            {
                success: false,
                status: "failed",
                error: error instanceof Error ? error.message : "Market status could not be verified.",
            },
            { status: 500 }
        );
    }
    console.log(`[Glyph Decision Cron] Market status: ${marketStatus.status.toUpperCase()}`);

    if (!marketStatus.isOpen) {
        console.log("[Glyph Decision Cron] Cycle skipped");
        return NextResponse.json({
            success: true,
            status: "skipped",
            reason: "MARKET_CLOSED",
            marketStatus,
        });
    }

    let lockId: string | undefined;
    const cycleId = `glyph-decision:${agentIdentifier}:${Date.now()}`;
    try {
        lockId = await acquireCronLock(agentIdentifier);
        console.log("[Glyph Decision Cron] Starting market analysis");
        const analysis = await runMarketAnalysis({
            agentId: agentIdentifier,
            asset: body.asset,
            executionId: `${cycleId}:analysis`,
        });
        if (analysis.status !== "COMPLETED") {
            const failedAssets = analysis.results
                .filter((result) => !result.ok)
                .map((result) => `${result.asset}: ${result.error || "analysis failed"}`)
                .join("; ");
            throw new Error(`Market analysis failed${failedAssets ? `: ${failedAssets}` : "."}`);
        }
        console.log("[Glyph Decision Cron] Market analysis completed");

        const tradeCycle = await runTradeCycle({
            agentId: agentIdentifier,
            asset: body.asset,
            cycleId,
            marketOpen: marketStatus.isOpen,
        });
        if (tradeCycle.status !== "COMPLETED") {
            const failedAssets = tradeCycle.results
                .filter((result) => result.error)
                .map((result) => `${result.asset}: ${result.error}`)
                .join("; ");
            throw new Error(`Trade-cycle failed${failedAssets ? `: ${failedAssets}` : "."}`);
        }

        console.log("[Glyph Decision Cron] Cycle completed");
        await releaseCronLock(lockId);
        lockId = undefined;
        return NextResponse.json({
            success: true,
            status: "completed",
            cycleId,
            assets: tradeCycle.assets,
            results: tradeCycle.results.map((result) => ({
                asset: result.asset,
                decisionId: result.decisionId || null,
                action: result.action || null,
                policyResult: result.policyResult || null,
                tradeId: result.execution?.tradeId || null,
                tradeNumber: result.execution?.tradeNumber || null,
            })),
        });
    } catch (error) {
        if (error instanceof CronConflictError) {
            return NextResponse.json(
                { success: false, status: "failed", error: error.message },
                { status: 409 }
            );
        }

        console.error("[Glyph Decision Cron] Cycle failed", error);
        if (lockId) await releaseCronLock(lockId, error);
        return NextResponse.json(
            {
                success: false,
                status: "failed",
                cycleId,
                error: error instanceof Error ? error.message : "Trade decision cycle failed.",
            },
            { status: 500 }
        );
    }
}

export async function GET(): Promise<NextResponse> {
    return NextResponse.json(
        { success: false, status: "failed", error: "Method Not Allowed" },
        { status: 405 }
    );
}
