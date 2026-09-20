import { getLandingPageData } from "@/features/landing/server";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
    const data = await getLandingPageData();

    return NextResponse.json(
        {
            latestDecision: data.latestDecision,
            latestAnalysis: data.latestAnalysis,
            latestActivity: data.latestActivity,
        },
        { headers: { "Cache-Control": "no-store" } }
    );
}