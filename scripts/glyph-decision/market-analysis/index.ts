#!/usr/bin/env node
import "dotenv/config";

import { AlphaVantageProvider } from "../../../src/lib/market/alpha-vantage";
import { StockfitProvider } from "../../../src/lib/market/stockfit";
import { TwelveDataProvider } from "../../../src/lib/market/twelve-data";
import { prisma } from "../../../src/lib/prisma";
import { createResearchSnapshot } from "../../../src/lib/research";
import { Candle, Fundamentals, MarketDataProvider, NewsItem, Quote, SynthesizedResearch } from "../../../src/types/market";

interface CliOptions {
    agentId: string;
    asset?: string;
    json: boolean;
    help: boolean;
}

export interface AnalysisResult {
    asset: string;
    ok: boolean;
    snapshotId?: string;
    research?: SynthesizedResearch;
    error?: string;
}

export interface MarketAnalysisRunOptions {
    agentId?: string;
    asset?: string;
    executionId?: string;
    provider?: MarketDataProvider;
}

export interface MarketAnalysisRunResult {
    executionId: string;
    agentId: string;
    assets: string[];
    results: AnalysisResult[];
    status: "COMPLETED" | "FAILED";
    startedAt: string;
    completedAt: string;
    durationMs: number;
}

class CompositeMarketProvider implements MarketDataProvider {
    public name = "StockFit Free + Twelve Data Free";

    constructor(
        private readonly prices: StockfitProvider,
        private readonly technical: TwelveDataProvider
    ) { }

    getQuote(symbol: string): Promise<Quote> {
        return this.prices.getQuote(symbol);
    }

    getOHLCV(symbol: string, timeframe?: string): Promise<Candle[]> {
        return this.technical.getOHLCV(symbol, timeframe);
    }

    getFundamentals(symbol: string): Promise<Fundamentals> {
        return this.prices.getFundamentals(symbol);
    }

    getNews(symbol: string): Promise<NewsItem[]> {
        return this.prices.getNews(symbol);
    }
}

export function resolveMarketProvider(): MarketDataProvider {
    // 1. Prefer AlphaVantage if API key is configured (standard production provider with disk caching)
    const hasAlphaVantageKey = Boolean(
        process.env.MARKET_DATA_API_KEY ||
        process.env.MARKET_DATA_BACKUP_API_KEY ||
        process.env.ALPHA_VANTAGE_API_KEY ||
        process.env.ALPHA_VANTAGE_BACKUP_API_KEY
    );
    if (hasAlphaVantageKey) {
        return new AlphaVantageProvider();
    }

    // 2. Try Composite Stockfit + Twelve Data if both keys are present
    const hasStockfitKey = Boolean(process.env.STOCKFIT_API_KEY);
    const hasTwelveDataKey = Boolean(process.env.TWELVE_DATA_API_KEY);
    if (hasStockfitKey && hasTwelveDataKey) {
        try {
            return new CompositeMarketProvider(
                new StockfitProvider(),
                new TwelveDataProvider()
            );
        } catch (err) {
            console.warn("[MarketAnalysis] Failed to initialize composite provider:", err);
        }
    }

    // 3. Fallback to AlphaVantageProvider (handles cached data gracefully)
    return new AlphaVantageProvider();
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
GLYPH MARKET ANALYSIS

Usage:
  npm run market:analysis
  npm run market:analysis -- --asset TSLA
  npm run market:analysis -- --json

Pipeline:
  Fundamental Analysis -> Technical Analysis -> Risk Analysis

Options:
  -a, --asset <TICKER>  Analyze one policy asset; default analyzes every allowed asset
      --agent <ID>      Agent identifier; default: GLYPH_AGENT_ID or 1
      --json             Print machine-readable analysis output
  -h, --help             Show this help
`);
}

async function resolveAgent(agentIdentifier?: string) {
    if (agentIdentifier) {
        const byAgentId = await prisma.agent.findUnique({
            where: { agentId: agentIdentifier },
            include: { policy: true },
        });
        if (byAgentId) return byAgentId;
    }
    const envAgentId = process.env.GLYPH_AGENT_ID;
    if (envAgentId && envAgentId !== agentIdentifier) {
        const byEnv = await prisma.agent.findUnique({
            where: { agentId: envAgentId },
            include: { policy: true },
        });
        if (byEnv) return byEnv;
    }
    const fallback = await prisma.agent.findFirst({
        include: { policy: true },
    });
    if (!fallback) throw new Error("No Agent found in the database.");
    return fallback;
}

async function loadAllowedAssets(agent: Awaited<ReturnType<typeof resolveAgent>>): Promise<string[]> {
    if (!agent.policy) throw new Error(`Agent #${agent.agentId} does not have an active policy.`);

    const activePositions = await prisma.position.findMany({
        where: { agentId: agent.id, isOpen: true },
        select: { asset: true },
    });
    return Array.from(new Set([
        ...(agent.policy.allowedAssets || []).map((asset) => asset.trim().toUpperCase()).filter(Boolean),
        ...activePositions.map((position) => position.asset.trim().toUpperCase()),
    ]));
}

async function analyzeAsset(
    provider: MarketDataProvider,
    asset: string,
    executionId: string,
    agentId: string
): Promise<AnalysisResult> {
    try {
        const { snapshotId, research } = await createResearchSnapshot(asset, provider, {
            cycleId: executionId,
            agentId,
            recordLifeLog: false,
        });
        return { asset, ok: true, snapshotId, research };
    } catch (error) {
        return {
            asset,
            ok: false,
            error: error instanceof Error ? error.message : String(error),
        };
    }
}

function printAnalysis(result: AnalysisResult): void {
    if (!result.ok || !result.research) {
        console.log(`\n${result.asset} ERROR: ${result.error}`);
        return;
    }

    const research = result.research;
    const quote = research.marketData.quote;
    const fundamental = research.fundamentalData;
    const technical = research.technicalData;
    const risk = research.riskContext;

    console.log(`\n${research.asset} MARKET ANALYSIS`);
    console.log(`Snapshot ID        : ${result.snapshotId || "not persisted"}`);
    console.log("===============================================================");
    console.log("FUNDAMENTAL ANALYSIS");
    console.log(`Classification     : ${fundamental.sector || research.asset}`);
    if (fundamental.marketCap) console.log(`Market Cap         : $${fundamental.marketCap.toLocaleString()}`);
    if (fundamental.peRatio) console.log(`P/E                : ${fundamental.peRatio}`);
    if (fundamental.earningsPerShare) console.log(`EPS                : ${fundamental.earningsPerShare}`);
    if (fundamental.revenueGrowthPercent) console.log(`Revenue Growth     : ${fundamental.revenueGrowthPercent}%`);
    if (fundamental.profitMarginPercent) console.log(`Profit Margin      : ${fundamental.profitMarginPercent}%`);
    console.log(`Fundamental Score  : ${fundamental.fundamentalScore}/100`);

    console.log("\nTECHNICAL ANALYSIS");
    console.log(`Price              : $${quote.price.toFixed(2)}`);
    console.log(`Trend              : ${technical.trend}`);
    console.log(`SMA 20 / SMA 50    : $${technical.sma20.toFixed(2)} / $${technical.sma50.toFixed(2)}`);
    console.log(`RSI 14             : ${technical.rsi14.toFixed(2)}`);
    console.log(`Support / Resist.  : $${technical.supportLevel.toFixed(2)} / $${technical.resistanceLevel.toFixed(2)}`);
    console.log(`Volatility         : ${technical.volatilityPercent.toFixed(2)}%`);
    console.log(`Volume Ratio       : ${technical.volumeRatio.toFixed(2)}x`);
    console.log(`Technical Score    : ${technical.technicalScore}/100`);

    console.log("\nRISK ANALYSIS");
    console.log(`Regime             : ${risk?.regime || "uncertain"}`);
    console.log(`Risk Level         : ${risk?.level || "moderate"}`);
    console.log(`Risk Details       : ${risk?.details || "No additional risk context"}`);
    console.log(`Decision Signal    : ${getDecisionSignal(fundamental.fundamentalScore, technical.technicalScore)}`);
}

function getDecisionSignal(fundamentalScore: number, technicalScore: number): "WATCH / QUALIFIED" | "CAUTION" {
    return technicalScore >= 70 && fundamentalScore >= 60 ? "WATCH / QUALIFIED" : "CAUTION";
}

async function recordAnalysisLifeEvent(
    agent: Awaited<ReturnType<typeof resolveAgent>>,
    executionId: string,
    results: AnalysisResult[]
): Promise<void> {
    const day = Math.max(1, Math.floor((Date.now() - agent.createdAt.getTime()) / (24 * 60 * 60 * 1000)) + 1);
    for (const analysis of results) {
        const alreadyRecorded = await prisma.economicEvent.findFirst({
            where: {
                agentId: agent.id,
                cycleId: executionId,
                eventType: "RESEARCH_STARTED",
                title: { startsWith: `${analysis.asset} Market Analysis` },
            },
            select: { id: true },
        });
        if (alreadyRecorded) continue;

        const title = analysis.ok
            ? `${analysis.asset} Market Analysis Completed`
            : `${analysis.asset} Market Analysis Failed`;
        const description = analysis.ok && analysis.research
            ? `Glyph analyzed ${analysis.asset} at $${analysis.research.marketData.quote.price.toFixed(2)}. Fundamental: ${analysis.research.fundamentalData.fundamentalScore}/100. Technical: ${analysis.research.technicalData.technicalScore}/100. Risk: ${(analysis.research.riskContext?.level || "N/A").toUpperCase()}. Signal: ${getDecisionSignal(analysis.research.fundamentalData.fundamentalScore, analysis.research.technicalData.technicalScore)}. Snapshot: ${analysis.snapshotId}.`
            : `Market analysis failed for ${analysis.asset}: ${analysis.error || "Unknown error"}.`;
        await prisma.economicEvent.create({
            data: {
                agentId: agent.id,
                cycleId: executionId,
                eventType: "RESEARCH_STARTED",
                title,
                description,
                day,
                result: analysis.ok ? "COMPLETED" : "FAILED",
            },
        });
    }
}

export async function runMarketAnalysis(
    options: MarketAnalysisRunOptions = {}
): Promise<MarketAnalysisRunResult> {
    const startedAt = new Date();
    const agent = await resolveAgent(options.agentId);
    const allowedAssets = await loadAllowedAssets(agent);
    const assets = options.asset ? [options.asset] : allowedAssets;
    const invalidAssets = assets.filter((asset) => !allowedAssets.includes(asset));

    if (invalidAssets.length > 0) {
        throw new Error(`Asset(s) [${invalidAssets.join(", ")}] are not in policy allowedAssets [${allowedAssets.join(", ")}].`);
    }
    if (assets.length === 0) throw new Error(`Policy for agent #${agent.agentId} has no allowedAssets.`);

    const executionId = options.executionId || `market-analysis:${agent.agentId}:${startedAt.getTime()}`;
    const run = await prisma.agentRun.create({
        data: { agentId: agent.id, cycleKey: executionId, startedAt },
        select: { id: true },
    });

    const provider = options.provider || resolveMarketProvider();
    try {
        const results: AnalysisResult[] = [];
        for (const asset of assets) results.push(await analyzeAsset(provider, asset, executionId, agent.id));

        const status = results.some((result) => !result.ok) ? "FAILED" : "COMPLETED";
        const completedAt = new Date();
        await recordAnalysisLifeEvent(agent, executionId, results);
        await prisma.agentRun.update({
            where: { id: run.id },
            data: {
                completedAt,
                marketSnapshot: { assets: results.map((result) => ({ asset: result.asset, snapshotId: result.snapshotId })) },
                error: status === "FAILED" ? results.filter((result) => !result.ok).map((result) => `${result.asset}: ${result.error}`).join("; ") : null,
            },
        });

        return {
            executionId,
            agentId: agent.agentId,
            assets,
            results,
            status,
            startedAt: startedAt.toISOString(),
            completedAt: completedAt.toISOString(),
            durationMs: completedAt.getTime() - startedAt.getTime(),
        };
    } catch (error) {
        await prisma.agentRun.update({
            where: { id: run.id },
            data: {
                completedAt: new Date(),
                error: error instanceof Error ? error.message : String(error),
            },
        }).catch((updateError) => {
            console.error("[MarketAnalysis] Failed to finalize failed run:", updateError);
        });
        throw error;
    }
}

async function main(): Promise<void> {
    const options = parseArgs();
    if (options.help) return printHelp();
    const result = await runMarketAnalysis(options);
    if (options.json) {
        console.log(JSON.stringify(result, null, 2));
    } else {
        console.log(`Allowed Assets    : ${result.assets.join(", ")}`);
        result.results.forEach(printAnalysis);
        console.log(`\nMARKET ANALYSIS ${result.status} (${result.durationMs}ms)`);
    }
    if (result.status === "FAILED") process.exitCode = 1;
}

if (process.argv[1]?.replaceAll("\\", "/").endsWith("/market-analysis/index.ts")) {
    main()
        .catch((error) => {
            console.error(`Market analysis failed: ${error instanceof Error ? error.message : String(error)}`);
            process.exitCode = 1;
        })
        .finally(async () => {
            await prisma.$disconnect();
        });
}
