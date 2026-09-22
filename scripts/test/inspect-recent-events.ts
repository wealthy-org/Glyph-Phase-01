import "dotenv/config";
import { prisma } from "../../src/lib/prisma";

async function main() {
  const activities = await prisma.activityLog.findMany({
    orderBy: { timestamp: "desc" },
    take: 6,
  });
  console.log("=== LATEST 6 ACTIVITIES ===");
  for (const a of activities) {
    console.log(JSON.stringify(a, null, 2));
  }

  const events = await prisma.economicEvent.findMany({
    orderBy: { timestamp: "desc" },
    take: 6,
  });
  console.log("=== LATEST 6 ECONOMIC EVENTS ===");
  for (const e of events) {
    console.log(JSON.stringify(e, null, 2));
  }
}

main().finally(() => prisma.$disconnect());
