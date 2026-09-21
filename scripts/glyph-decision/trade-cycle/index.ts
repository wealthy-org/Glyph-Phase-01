#!/usr/bin/env node
import "dotenv/config";

import { runTradeCycle } from "./runner";

interface CliOptions {
    agentId: string;
    asset?: string;
    help: boolean;
}

function parseArgs(): CliOptions {
    const args = process.argv.slice(2);
    const options: CliOptions = { agentId: process.env.GLYPH_AGENT_ID || "1", help: false };
    for (let index = 0; index < args.length; index += 1) {
        const argument = args[index];
        if (argument === "--help" || argument === "-h") options.help = true;
        else if (argument === "--agent") {
            options.agentId = args[index + 1] || options.agentId;
            index += 1;
        } else if (argument === "--asset" || argument === "-a") {
            options.asset = args[index + 1]?.toUpperCase();
            index += 1;
        } else throw new Error(`Unknown argument: ${argument}`);
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
`);
}

async function main(): Promise<void> {
    const options = parseArgs();
    if (options.help) return printHelp();
    const result = await runTradeCycle({ agentId: options.agentId, asset: options.asset });
    if (result.status === "FAILED") process.exitCode = 1;
}

if (process.argv[1]?.replaceAll("\\", "/").endsWith("/trade-cycle/index.ts")) {
    main()
        .catch((error) => {
            console.error(`Trade cycle failed: ${error instanceof Error ? error.message : String(error)}`);
            process.exitCode = 1;
        });
}
