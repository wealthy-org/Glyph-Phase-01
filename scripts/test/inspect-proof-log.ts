import "dotenv/config";
import { prisma } from "../../src/lib/prisma";

async function main() {
  const onchainProofLog = await prisma.activityLog.findFirst({
    where: { activityType: "ONCHAIN_PROOF" },
  });
  console.log("=== ONCHAIN PROOF LOG ===");
  console.log(JSON.stringify(onchainProofLog, null, 2));
}

main().finally(() => prisma.$disconnect());
