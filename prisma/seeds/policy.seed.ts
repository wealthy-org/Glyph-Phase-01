import { PrismaClient } from "../../src/generated/prisma/client";

export async function seedPolicy(prisma: PrismaClient, agentId: string) {
  console.log("  ↳ [3/5] Seeding Agent Risk Policy (Deterministic Engine)...");

  const policy = await prisma.agentPolicy.upsert({
    where: { agentId },
    update: {
      maxPositionPercent: 10,
      maxLeverage: 2,
      maxDailyLossPercent: 5,
      maxOpenPositions: 3,
      minConfidence: 60,
      allowedAssets: ["NVDA", "MSFT", "AAPL", "TSLA"],
      simulatedFeePercent: 0.1,
    },
    create: {
      agentId,
      maxPositionPercent: 10,
      maxLeverage: 2,
      maxDailyLossPercent: 5,
      maxOpenPositions: 3,
      minConfidence: 60,
      allowedAssets: ["NVDA", "MSFT", "AAPL", "TSLA"],
      simulatedFeePercent: 0.1,
    },
  });

  console.log(
    `    ✅ Risk Policy active: Max Pos: ${policy.maxPositionPercent}%, Max Lev: ${policy.maxLeverage}x, Allowed: [${policy.allowedAssets.join(", ")}]`
  );

  return policy;
}
