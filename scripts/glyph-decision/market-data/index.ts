#!/usr/bin/env node
import "dotenv/config";

import { StockfitProvider } from "../../../src/lib/market/stockfit";
import { prisma } from "../../../src/lib/prisma";
import { Quote } from "../../../src/types/market";

interface CliOptions {
    agentId: string;
    asset?: string;
    json: boolean;
    help: boolean;
}

interface AssetPriceResult {
    asset: string;
    ok: boolean;
    quote?: Quote;
    error?: string;
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
        if (argument === "--help" || argument === "-h") options.help = true;
        else if (argument === "--agent") {
            options.agentId = args[index + 1] || options.agentId;
            index += 1;
        } else if (argument === "--asset" || argument === "-a") {
            options.asset = args[index + 1]?.toUpperCase();
            index += 1;
        } else if (argument === "--json") options.json = true;
        else throw new Error(`Unknown argument: ${argument}`);
    }

    return options;
}

function printHelp(): void {
    console.log(`
GLYPH MARKET DATA CHECK

Usage:
  npm run market:data
  npm run market:data -- --asset AAPL
  npm run market:data -- --agent 1 --json

Options:
  -a, --asset <TICKER>  Check one asset; default checks every policy asset
      --agent <ID>      Agent database identifier; default: GLYPH_AGENT_ID or 1
      --json             Print machine-readable JSON output
  -h, --help             Show this help
`);
}

async function loadAllowedAssets(agentId: string): Promise<string[]> {
    const agent = await prisma.agent.findFirst({
        where: { agentId },
        select: { policy: { select: { allowedAssets: true } } },
    });

    if (!agent) throw new Error(`Agent #${agentId} was not found in the database.`);
    if (!agent.policy) throw new Error(`Agent #${agentId} does not have an active policy.`);

    return Array.from(
        new Set(
            agent.policy.allowedAssets
                .map((asset) => asset.trim().toUpperCase())
                .filter((asset) => asset.length > 0)
        )
    );
}

async function fetchAssetPrice(
    provider: StockfitProvider,
    asset: string
): Promise<AssetPriceResult> {
    try {
        return { asset, ok: true, quote: await provider.getQuote(asset) };
    } catch (error) {
        return {
            asset,
            ok: false,
            error: error instanceof Error ? error.message : String(error),
        };
    }
}

function printResult(result: AssetPriceResult): void {
    if (!result.ok || !result.quote) {
        console.log(`${result.asset.padEnd(6)} ERROR  ${result.error}`);
        return;
    }

    const sign = result.quote.change >= 0 ? "+" : "";
    console.log(
        `${result.quote.symbol} $${result.quote.price.toFixed(2)} ` +
        `(${sign}${result.quote.change.toFixed(2)}, ${sign}${result.quote.changePercent.toFixed(2)}%) ` +
        `range $${result.quote.low.toFixed(2)}-$${result.quote.high.toFixed(2)} ` +
        `volume ${result.quote.volume.toLocaleString()}`
    );
}

async function main(): Promise<void> {
    const options = parseArgs();
    if (options.help) {
        printHelp();
        return;
    }

    const allowedAssets = await loadAllowedAssets(options.agentId);
    const assets = options.asset ? [options.asset] : allowedAssets;
    const invalidAssets = assets.filter((asset) => !allowedAssets.includes(asset));

    if (invalidAssets.length > 0) {
        throw new Error(
            `Asset(s) [${invalidAssets.join(", ")}] are not in policy allowedAssets [${allowedAssets.join(", ")}].`
        );
    }
    if (assets.length === 0) {
        throw new Error(`Policy for agent #${options.agentId} has no allowedAssets.`);
    }

    const provider = new StockfitProvider();
    const results: AssetPriceResult[] = [];
    for (const asset of assets) {
        results.push(await fetchAssetPrice(provider, asset));
    }

    if (options.json) {
        console.log(JSON.stringify({ provider: provider.name, agentId: options.agentId, prices: results }, null, 2));
    } else {
        console.log(`Provider           : ${provider.name}`);
        console.log(`Allowed Assets     : ${allowedAssets.join(", ")}`);
        results.forEach(printResult);
    }

    if (results.some((result) => !result.ok)) process.exitCode = 1;
}

main()
    .catch((error) => {
        console.error(`Market data check failed: ${error instanceof Error ? error.message : String(error)}`);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
