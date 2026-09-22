#!/usr/bin/env node
import "dotenv/config";

import { prisma } from "../../../src/lib/prisma";
import { FundamentalSummary, NewsItem, RiskContext, SynthesizedResearch, TechnicalSummary } from "../../../src/types/market";
import { callOpenRouterForDecision } from "./openrouter";
import { ActivePositionContext } from "./prompt";
import { LlmDecisionOutput } from "./types";

interface CliOptions {
    agentId: string;
    asset?: string;
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
        } else if (argument === "--asset" || argument === "-a") {
            options.asset = args[index + 1]?.toUpperCase();
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
GLYPH LLM DECISION

Usage:
  npm run decision:llm
  npm run decision:llm -- --asset NVDA
  npm run decision:llm -- --agent 5 --json

Options:
  -a, --asset <TICKER>  Process one allowed asset; default processes all allowed assets
      --agent <ID>      Agent identifier; default: GLYPH_AGENT_ID or 1
      --json             Print machine-readable decision output
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

import {
    getHistoricalResearchSnapshots,
    ValidatedHistoricalSnapshot,
} from "../../../src/lib/research/historical-context";

export interface SingleAssetDecisionResult extends LlmDecisionOutput {
    source: {
        marketAnalysisSnapshotId: string;
        researchSnapshotIds: string[];
    };
    insufficientHistory?: {
        availableSnapshots: number;
        requiredSnapshots: number;
        reason: string;
    };
}

export async function runSingleAssetDecision(
    asset: string,
    quiet = false,
    position?: ActivePositionContext | null
): Promise<SingleAssetDecisionResult> {
    const normAsset = asset.trim().toUpperCase();

    // Query strictly for the exact target asset: newest -> previous -> oldest
    const history = await getHistoricalResearchSnapshots(normAsset, 3);

    if (!history.ok) {
        if (!quiet) {
            console.log(`\n[TRADE-DECISION]\nAsset: ${normAsset}\n\nAvailable Snapshots: ${history.availableSnapshots}\nRequired Snapshots: 3\n\nDecision: NO_TRADE\nReason: INSUFFICIENT_HISTORICAL_RESEARCH\n`);
        }

        return {
            asset: normAsset,
            action: "NO_TRADE",
            conviction: 0,
            thesis: {
                fundamental: `Market analysis history for ${normAsset} is incomplete (${history.availableSnapshots}/3 required snapshots found).`,
                technical: `Technical trend progression requires at least 3 historical snapshots of ${normAsset}.`,
                risk: `Risk Policy mandates at least 3 valid research snapshots before capital deployment.`,
                invalidation: `Thesis invalidation: will re-evaluate once 3 valid ${normAsset} research snapshots are recorded.`,
            },
            source: {
                marketAnalysisSnapshotId: history.snapshots[0]?.id || "",
                researchSnapshotIds: history.snapshots.map((s) => s.id),
            },
            insufficientHistory: {
                availableSnapshots: history.availableSnapshots,
                requiredSnapshots: 3,
                reason: "INSUFFICIENT_HISTORICAL_RESEARCH",
            },
        };
    }

    const [snapshot1, snapshot2, snapshot3] = history.snapshots;

    if (!quiet) {
        console.log(`\n[TRADE-DECISION]\nAsset: ${normAsset}\n\nHistorical Research:\n1. ${snapshot1.id} (${snapshot1.createdAt.toISOString()})\n2. ${snapshot2.id} (${snapshot2.createdAt.toISOString()})\n3. ${snapshot3.id} (${snapshot3.createdAt.toISOString()})\n\nSnapshot Count: 3\nAsset Match: PASS\nHistorical Context: READY\n`);
    }

    const metadata = snapshot1.sourceMetadata as Record<string, unknown>;
    const ageMs = Date.now() - snapshot1.createdAt.getTime();
    const maxAgeMs = Number(process.env.RESEARCH_SNAPSHOT_MAX_AGE_MS || 24 * 60 * 60 * 1000);
    if (!Number.isFinite(maxAgeMs) || maxAgeMs <= 0) {
        throw new Error("RESEARCH_SNAPSHOT_MAX_AGE_MS must be a positive number.");
    }
    if (ageMs > maxAgeMs) {
        throw new Error(
            `Stale market-analysis snapshot for ${normAsset}: ${Math.round(ageMs / 60000)} minutes old.`
        );
    }

    const research: SynthesizedResearch = {
        asset: snapshot1.asset,
        timestamp: String(metadata.researchTimestamp || snapshot1.createdAt.toISOString()),
        marketData: snapshot1.marketData as unknown as SynthesizedResearch["marketData"],
        fundamentalData: snapshot1.fundamentalData as unknown as FundamentalSummary,
        technicalData: snapshot1.technicalData as unknown as TechnicalSummary,
        riskContext: metadata.riskContext as RiskContext | undefined,
        newsData: snapshot1.newsData as unknown as NewsItem[],
        sourceMetadata: {
            provider: String(metadata.provider),
            fetchedAt: String(metadata.fetchedAt || snapshot1.createdAt.toISOString()),
            isCached: Boolean(metadata.isCached),
        },
    };

    const decision = await callOpenRouterForDecision(research, position, history.snapshots);
    return {
        ...decision,
        source: {
            marketAnalysisSnapshotId: snapshot1.id,
            researchSnapshotIds: history.snapshotIds,
        },
    };
}


function printDecisionSummary(asset: string, decision: LlmDecisionOutput): void {
    console.log(`
Asset: ${asset}
Decision:
  Action     : ${decision.action}
  Conviction : ${decision.conviction}

Thesis:
  Fundamental: ${decision.thesis.fundamental}
  Technical: ${decision.thesis.technical}
  Risk: ${decision.thesis.risk}
  Invalidation: ${decision.thesis.invalidation}
`);
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
            `Asset(s) [${invalidAssets.join(", ")}] are not in policy allowedAssets [${allowedAssets.join(", ")}] .`
        );
    }

    if (assets.length === 0) {
        throw new Error(`Policy for agent #${options.agentId} has no allowedAssets.`);
    }

    const decisions: LlmDecisionOutput[] = [];
    const errors: Array<{ asset: string; error: string }> = [];

    console.log("========================================");
    console.log("GLYPH LLM DECISION");
    console.log("========================================\n");

    for (const asset of assets) {
        console.log(`Asset: ${asset}`);
        console.log("Loading latest market-analysis snapshot...");

        try {
            const decision = await runSingleAssetDecision(asset);
            decisions.push(decision);
            printDecisionSummary(asset, decision);
            console.log("----------------------------------------");
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            errors.push({ asset, error: message });
            console.error(`❌ ${asset} failed: ${message}`);
            console.log("----------------------------------------");
            process.exitCode = 1;
        }
    }

    console.log("========================================");
    console.log("LLM DECISION COMPLETE");
    console.log("========================================");

    if (options.json) {
        console.log(
            JSON.stringify(
                {
                    allowedAssets,
                    decisions,
                    errors,
                },
                null,
                2
            )
        );
    }
}

if (process.argv[1]?.replaceAll("\\", "/").endsWith("/llm-decision/index.ts")) {
    main()
        .catch((error) => {
            console.error(`LLM decision failed: ${error instanceof Error ? error.message : String(error)}`);
            process.exitCode = 1;
        })
        .finally(async () => {
            await prisma.$disconnect();
        });
}
