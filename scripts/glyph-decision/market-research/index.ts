#!/usr/bin/env node
import "dotenv/config";

import { StockfitProvider } from "../../../src/lib/market/stockfit";
import { prisma } from "../../../src/lib/prisma";
import { Fundamentals, NewsItem, Quote } from "../../../src/types/market";

interface CliOptions {
    agentId: string;
    asset?: string;
    json: boolean;
    help: boolean;
}

interface AssetResearchResult {
    asset: string;
    ok: boolean;
    research?: {
        quote: Quote;
        fundamentals: Fundamentals;
        news: NewsItem[];
    };
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
GLYPH MARKET RESEARCH (STOCKFIT FREE)

Usage:
  npm run market:research
  npm run market:research -- --asset AAPL
  npm run market:research -- --agent 5 --json

Options:
  -a, --asset <TICKER>  Research one policy asset; default researches every allowed asset
      --agent <ID>      Agent identifier; default: GLYPH_AGENT_ID or 1
      --json             Print complete machine-readable research output
  -h, --help             Show this help
`);
}

async function loadAllowedAssets(agentId: string): Promise<string[]> {
    const agent = await prisma.agent.findUnique({
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

async function fetchResearch(
    provider: StockfitProvider,
    asset: string
): Promise<AssetResearchResult> {
    try {
        const [quote, fundamentals, news] = await Promise.all([
            provider.getQuote(asset),
            provider.getFundamentals(asset),
            provider.getNews(asset),
        ]);
        return {
            asset,
            ok: true,
            research: {
                quote,
                fundamentals,
                news,
            },
        };
    } catch (error) {
        return { asset, ok: false, error: error instanceof Error ? error.message : String(error) };
    }
}

function printResult(result: AssetResearchResult): void {
    if (!result.ok || !result.research) {
        console.log(`\n${result.asset} ERROR: ${result.error}`);
        return;
    }

    const { quote, fundamentals, news } = result.research;
    const sign = quote.change >= 0 ? "+" : "";
    console.log(`\n${quote.symbol} MARKET RESEARCH (STOCKFIT FREE)`);
    console.log(`Price              : $${quote.price.toFixed(2)} (${sign}${quote.change.toFixed(2)}, ${sign}${quote.changePercent.toFixed(2)}%)`);
    console.log(`Trading Day        : ${quote.timestamp}`);
    console.log(`Volume             : ${quote.volume.toLocaleString()}`);
    console.log(`Company            : ${fundamentals.name}`);
    if (fundamentals.marketCap) console.log(`Market Cap         : $${fundamentals.marketCap.toLocaleString()}`);
    if (fundamentals.peRatio) console.log(`P/E                : ${fundamentals.peRatio}`);
    if (fundamentals.eps) console.log(`EPS                : ${fundamentals.eps}`);
    if (fundamentals.revenueGrowthTTM) console.log(`Revenue Growth     : ${fundamentals.revenueGrowthTTM}%`);
    if (fundamentals.profitMargin) console.log(`Profit Margin      : ${fundamentals.profitMargin}%`);
    if (news.length > 0) {
        console.log("Headlines:");
        news.slice(0, 3).forEach((item, index) => console.log(`  ${index + 1}. ${item.title}`));
    }
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
        throw new Error(`Asset(s) [${invalidAssets.join(", ")}] are not in policy allowedAssets [${allowedAssets.join(", ")}].`);
    }
    if (assets.length === 0) throw new Error(`Policy for agent #${options.agentId} has no allowedAssets.`);

    const provider = new StockfitProvider();
    const results: AssetResearchResult[] = [];
    for (const asset of assets) results.push(await fetchResearch(provider, asset));

    if (options.json) {
        console.log(JSON.stringify({ agentId: options.agentId, allowedAssets, research: results }, null, 2));
    } else {
        console.log(`Allowed Assets    : ${allowedAssets.join(", ")}`);
        results.forEach(printResult);
    }

    if (results.some((result) => !result.ok)) process.exitCode = 1;
}

main()
    .catch((error) => {
        console.error(`Market research failed: ${error instanceof Error ? error.message : String(error)}`);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
