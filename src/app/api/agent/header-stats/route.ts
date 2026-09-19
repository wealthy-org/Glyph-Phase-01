import { NextResponse } from "next/server";
import { getHeaderMetrics } from "@/lib/header-stats";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const stats = await getHeaderMetrics();
    return NextResponse.json(stats);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
