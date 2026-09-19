import "dotenv/config";
import { seedAnalysisOnlyV2 } from "../../prisma/seeds/analysis-only-v2.seed";
import { prisma } from "../../src/lib/prisma";

seedAnalysisOnlyV2(prisma as any)
    .catch((error) => {
        console.error("Seeding V2 failed:", error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });