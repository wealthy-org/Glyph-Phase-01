import { NextRequest, NextResponse } from "next/server";
import { fundTreasury } from "@/lib/treasury";
import { z } from "zod";

export const dynamic = "force-dynamic";

const fundSchema = z.object({
  amount: z.number().positive("Amount must be a positive number greater than 0"),
  description: z.string().optional(),
  txHash: z.string().optional().nullable(),
  agentId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = fundSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid input parameters",
          details: parsed.error.format(),
        },
        { status: 400 }
      );
    }

    const result = await fundTreasury({
      amount: parsed.data.amount,
      description: parsed.data.description,
      txHash: parsed.data.txHash,
      agentId: parsed.data.agentId,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error("[API /api/treasury/fund] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Internal server error occurred while funding treasury",
      },
      { status: 500 }
    );
  }
}
