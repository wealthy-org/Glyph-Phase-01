// ============================================================================
// GLYPH PHASE 01 — AUTONOMOUS CRON ENDPOINT
// Derived from: BRIEF.md (§3.0B, §3.5, §25) and TODO.md (Tahap 7 line 122-126)
//
// POST /api/cron/glyph-cycle
// Protected by: Authorization: Bearer <CRON_SECRET>
// ============================================================================

import { runAutonomousGlyphCycle } from "@/lib/cycle/orchestrator";
import { TwelveDataProvider } from "@/lib/market/twelve-data";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Validates the Authorization header against CRON_SECRET using timing-safe comparison.
 */
function isAuthorized(req: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    console.error("[CronAuth] Server error: CRON_SECRET environment variable is not defined.");
    return false;
  }

  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return false;
  }

  const token = authHeader.slice(7).trim();
  if (!token) {
    return false;
  }

  try {
    const tokenBuffer = Buffer.from(token, "utf8");
    const secretBuffer = Buffer.from(cronSecret, "utf8");

    // Timing-safe comparison requires equal buffer lengths
    if (tokenBuffer.length !== secretBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(tokenBuffer, secretBuffer);
  } catch (err) {
    console.error("[CronAuth] Error during token verification:", err);
    return false;
  }
}

/**
 * POST /api/cron/glyph-cycle
 * Runs the daily autonomous cycle:
 * Market data -> Research -> Decision -> Policy -> Trade -> Onchain Hash -> DB Update
 */
export async function POST(req: NextRequest) {
  // 1. Verify Authorization
  if (!isAuthorized(req)) {
    return NextResponse.json(
      {
        error: "Unauthorized",
        message: "Invalid or missing Bearer token in Authorization header.",
      },
      { status: 401 }
    );
  }

  try {
    // Optional request body configuration
    let body: { asset?: string; agentId?: string; force?: boolean; skipIfClosed?: boolean } = {};
    try {
      body = await req.json();
    } catch {
      // Body is optional; empty/non-JSON is fine
    }

    const agentIdentifier = body.agentId || process.env.GLYPH_AGENT_ID || "1";

    // 2. Concurrency Lock: Check if a cycle is already currently running (§3.8)
    const activeRun = await prisma.agentRun.findFirst({
      where: {
        agentId: agentIdentifier,
        startedAt: { gt: new Date(Date.now() - 3 * 60 * 1000) }, // started within last 3 minutes
        completedAt: null,
      },
    });

    if (activeRun) {
      return NextResponse.json(
        {
          error: "Conflict",
          message: "A cycle execution is currently in progress. Concurrent runs are locked.",
        },
        { status: 409 }
      );
    }

    // 3. Rate Limit / Cooldown: Prevent spamming / free-tier API drain (§3.8 & §3.11)
    // Enforce 30-minute minimum cooldown unless explicit emergency override is passed
    const COOLDOWN_MINUTES = 30;
    const lastRun = await prisma.agentRun.findFirst({
      where: {
        completedAt: { not: null },
        error: null,
      },
      orderBy: { completedAt: "desc" },
    });

    if (lastRun?.completedAt && !body.force) {
      const elapsedMinutes = (Date.now() - new Date(lastRun.completedAt).getTime()) / (1000 * 60);
      if (elapsedMinutes < COOLDOWN_MINUTES) {
        const remainingMinutes = Math.ceil(COOLDOWN_MINUTES - elapsedMinutes);
        return NextResponse.json(
          {
            error: "Too Many Requests",
            message: `Rate limit active: A cycle was completed ${Math.round(elapsedMinutes)} min ago. Minimum cooldown interval is ${COOLDOWN_MINUTES} min (${remainingMinutes} min remaining).`,
          },
          { status: 429 }
        );
      }
    }

    // 4. Market Open Check via the configured Twelve Data provider (§Market Status)
    const bypassMarket = Boolean(body.force);
    const marketProvider = new TwelveDataProvider();
    const marketStatus = await marketProvider.getMarketStatus("United States");

    if (body.skipIfClosed && !marketStatus.isOpen && !bypassMarket) {
      return NextResponse.json(
        {
          status: "MARKET_CLOSED",
          message: `US Stock Market is currently ${marketStatus.status.toUpperCase()} (${marketStatus.primaryExchanges}, Regular Hours: ${marketStatus.localOpen} - ${marketStatus.localClose}). Cycle skipped as requested.`,
          data: {
            marketStatus,
            checkedAt: marketStatus.checkedAt,
            hint: "Remove skipIfClosed or use { force: true } to run full cycle.",
          },
        },
        { status: 200 }
      );
    }

    // 5. Run the Autonomous Cycle
    const cycleSummary = await runAutonomousGlyphCycle({
      targetAsset: body.asset,
      agentIdentifier,
      bypassMarketHours: bypassMarket,
    });

    // 6. Return structured response
    return NextResponse.json(
      {
        status: "SUCCESS",
        message: "Autonomous cycle executed successfully.",
        data: {
          timestamp: cycleSummary.timestamp,
          cycleKey: cycleSummary.cycleKey,
          cycleId: cycleSummary.cycleId,
          agentId: cycleSummary.agentId,
          targetAsset: cycleSummary.targetAsset,
          positionsAudited: cycleSummary.positionsChecked,
          liquidations: cycleSummary.liquidatedCount,
          marketClosed: cycleSummary.marketClosed,
          decision: {
            id: cycleSummary.decisionResult.decisionId,
            action: cycleSummary.decisionResult.action,
            conviction: cycleSummary.decisionResult.conviction,
            policyResult: cycleSummary.decisionResult.policyResult,
            policyRejectReason: cycleSummary.decisionResult.policyRejectReason,
            tradeId: cycleSummary.decisionResult.tradeId,
            tradeNumber: cycleSummary.decisionResult.tradeNumber,
          },
          onchainProof: {
            decisionHash: cycleSummary.decisionResult.decisionHash,
            transactionHash: cycleSummary.decisionResult.transactionHash,
            explorerUrl: cycleSummary.decisionResult.explorerUrl,
          },
          executionDurationMs: cycleSummary.executionDurationMs,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("[CronAPI] Failed to execute autonomous cycle:", error);
    if (error?.code === "P2002") {
      return NextResponse.json(
        {
          status: "ALREADY_PROCESSED",
          message: "A successful decision cycle already exists for this daily cycle key.",
        },
        { status: 409 }
      );
    }
    return NextResponse.json(
      {
        status: "ERROR",
        message: "Failed to complete autonomous cycle.",
        error: error.message || String(error),
      },
      { status: 500 }
    );
  }
}

/**
 * Handle unsupported HTTP methods
 */
export async function GET() {
  return NextResponse.json(
    {
      error: "Method Not Allowed",
      message: "The Glyph cycle endpoint must be triggered via POST request.",
    },
    { status: 405 }
  );
}
