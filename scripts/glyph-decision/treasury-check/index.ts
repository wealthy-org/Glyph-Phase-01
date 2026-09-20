#!/usr/bin/env node
import "dotenv/config";

import { prisma } from "../../../src/lib/prisma";
import { getTreasurySummary } from "../../../src/lib/treasury";

interface CliOptions {
    agentId: string;
    json: boolean;
    help: boolean;
}

function parseArgs(): CliOptions {
    const args = process.argv.slice(2);
    const options: CliOptions = {
        agentId: process.env.GLYPH_AGENT_ID || "1",
        json: false,
        help: false,
    };

    for (let index = 0; index < args.length; index += 1) {
        const argument = args[index];

        if (argument === "--help" || argument === "-h") {
            options.help = true;
        } else if (argument === "--agent") {
            options.agentId = args[index + 1] || options.agentId;
            index += 1;
        } else if (argument === "--json") {
            options.json = true;
        } else {
            throw new Error(`Unknown argument: ${argument}`);
        }
    }

    return options;
}

function printHelp(): void {
    console.log(`
GLYPH TREASURY / CAPITAL CHECK

Usage:
  npm run treasury:check
  npm run treasury:check -- --agent 1
  npm run treasury:check -- --agent 1 --json

Options:
      --agent <ID>  Agent database identifier; default: GLYPH_AGENT_ID or 1
      --json         Print machine-readable JSON output
  -h, --help        Show this help
`);
}

async function main(): Promise<void> {
    const options = parseArgs();
    if (options.help) {
        printHelp();
        return;
    }

    await prisma.$connect();
    await prisma.$queryRaw`SELECT 1`;

    const agent = await prisma.agent.findUnique({
        where: { agentId: options.agentId },
        select: { agentId: true, name: true },
    });

    if (!agent) {
        throw new Error(`Agent #${options.agentId} was not found in the database.`);
    }

    const treasury = await getTreasurySummary(agent.agentId);
    const result = {
        database: "connected",
        agentId: treasury.agentId,
        agentName: agent.name,
        currency: treasury.currency,
        availableCapital: treasury.currentBalance,
        currentBalance: treasury.currentBalance,
        allocatedMargin: treasury.allocatedMargin,
        unrealizedPnl: treasury.unrealizedPnl,
        totalEquity: treasury.totalEquity,
        initialCapital: treasury.initialCapital,
        pnlDollar: treasury.pnlDollar,
        pnlPercent: treasury.pnlPercent,
    };

    if (options.json) {
        console.log(JSON.stringify(result, null, 2));
        return;
    }

    console.log("===============================================================");
    console.log("GLYPH TREASURY / CAPITAL CHECK");
    console.log("===============================================================");
    console.log(`Database          : ${result.database}`);
    console.log(`Agent             : #${result.agentId} (${result.agentName})`);
    console.log(`Available Capital : ${result.currency} ${result.availableCapital.toFixed(2)}`);
    console.log(`Total Equity      : ${result.currency} ${result.totalEquity.toFixed(2)}`);
    console.log(`Initial Capital   : ${result.currency} ${result.initialCapital.toFixed(2)}`);
    console.log(`Allocated Margin  : ${result.currency} ${result.allocatedMargin.toFixed(2)}`);
    console.log(`Unrealized PnL    : ${result.currency} ${result.unrealizedPnl.toFixed(2)}`);
    console.log(`Total PnL         : ${result.currency} ${result.pnlDollar.toFixed(2)} (${result.pnlPercent.toFixed(2)}%)`);
}

main()
    .catch((error) => {
        console.error(`Treasury check failed: ${error instanceof Error ? error.message : String(error)}`);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
