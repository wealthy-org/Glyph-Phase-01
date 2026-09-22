import "dotenv/config";
import { prisma } from "../../src/lib/prisma";

async function main() {
  const agent = await prisma.agent.findFirst({
    select: { agentId: true, id: true, name: true },
  });
  console.log("DB Agent:", JSON.stringify(agent, null, 2));
  console.log("ENV GLYPH_AGENT_ID:", process.env.GLYPH_AGENT_ID);
  console.log("Match:", agent?.agentId === process.env.GLYPH_AGENT_ID);
}

main().finally(() => prisma.$disconnect());
