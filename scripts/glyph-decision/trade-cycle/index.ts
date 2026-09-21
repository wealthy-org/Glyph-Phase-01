#!/usr/bin/env node
import "dotenv/config";

import { runTradeCycle } from "./runner";

interface CliOptions {
    agentId: string;
    asset?: string;
    force: boolean;
    help: boolean;
}

function parseArgs(): CliOptions {
    const args = process.argv.slice(2);
    const options: CliOptions = { agentId: process.env.GLYPH_AGENT_ID || "1", force: false, help: false };
    for (let index = 0; index < args.length; index += 1) {
        const argument = args[index];
        if (argument === "--help" || argument === "-h") options.help = true;
        else if (argument === "--agent") {
            options.agentId = args[index + 1] || options.agentId;
            index += 1;
        } else if (argument === "--asset" || argument === "-a") {
            options.asset = args[index + 1]?.toUpperCase();
            index += 1;
        } else if (argument === "--force") options.force = true;
        else throw new Error(`Unknown argument: ${argument}`);
    }
    return options;
}

function printHelp(): void {
    console.log(`
GLYPH TRADE CYCLE

Usage:
  npm run trade:cycle
  npm run trade:cycle -- --asset NVDA
  npm run trade:cycle -- --agent 1 --asset XENE
    npm run trade:cycle -- --force

    --force bypasses the market-hours gate for local paper-trade testing only.
`);
}

async function main(): Promise<void> {
    const options = parseArgs();
    if (options.help) return printHelp();
    if (options.force) console.warn("[Glyph Decision CLI] WARNING: --force bypasses market hours for testing.");
    const result = await runTradeCycle({
        agentId: options.agentId,
        asset: options.asset,
        marketOpen: options.force ? true : undefined,
    });
    if (result.status === "FAILED") process.exitCode = 1;
}

if (process.argv[1]?.replaceAll("\\", "/").endsWith("/trade-cycle/index.ts")) {
    main()
        .catch((error) => {
            console.error(`Trade cycle failed: ${error instanceof Error ? error.message : String(error)}`);
            process.exitCode = 1;
        });
}
