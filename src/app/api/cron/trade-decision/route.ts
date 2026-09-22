import { NextRequest, NextResponse } from "next/server";
import { POST as runGlyphCycle } from "../glyph-cycle/route";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function dailyCycleId(agentIdentifier: string): string {
    return `${agentIdentifier}:${new Date().toISOString().slice(0, 10)}`;
}

export async function POST(request: NextRequest) {
    const upstreamResponse = await runGlyphCycle(request);
    const responseBody = await upstreamResponse.json().catch(() => null) as {
        status?: string;
        message?: string;
        error?: string;
        data?: {
            cycleKey?: string;
            decision?: {
                id?: string;
                action?: string;
                policyResult?: string;
            };
        };
    } | null;

    if (responseBody?.status === "MARKET_CLOSED") {
        return NextResponse.json(
            {
                success: true,
                status: "MARKET_CLOSED",
                message: responseBody.message,
                data: responseBody.data,
            },
            { status: 200 }
        );
    }

    if (upstreamResponse.status !== 200 || responseBody?.status !== "SUCCESS") {
        if (upstreamResponse.status === 401 || upstreamResponse.status === 403) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: upstreamResponse.status }
            );
        }

        const agentIdentifier = process.env.GLYPH_AGENT_ID || "1";
        return NextResponse.json(
            {
                success: false,
                cycleId: responseBody?.data?.cycleKey || dailyCycleId(agentIdentifier),
                error: responseBody?.error || responseBody?.message || "Trade decision cycle failed.",
            },
            { status: upstreamResponse.status }
        );
    }

    const decision = responseBody.data?.decision;
    return NextResponse.json({
        success: true,
        cycleId: responseBody.data?.cycleKey || dailyCycleId(process.env.GLYPH_AGENT_ID || "1"),
        decisionId: decision?.id || null,
        action: decision?.action || null,
        status: decision?.policyResult || "COMPLETED",
    });
}

export async function GET() {
    return NextResponse.json(
        {
            success: false,
            error: "Method Not Allowed",
        },
        { status: 405 }
    );
}
