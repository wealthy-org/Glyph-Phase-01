#!/usr/bin/env node
import "dotenv/config";

import { prisma } from "../../../src/lib/prisma";
import { FundamentalSummary, NewsItem, RiskContext, SynthesizedResearch, TechnicalSummary } from "../../../src/types/market";
import { callOpenRouterForDecision } from "./openrouter";
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

export async function runSingleAssetDecision(asset: string, quiet = false): Promise<LlmDecisionOutput & {
    source: { marketAnalysisSnapshotId: string };
}> {
    const snapshots = await prisma.researchSnapshot.findMany({
        where: { asset },
        orderBy: { createdAt: "desc" },
        take: 20,
    });
    const snapshot = snapshots.find((candidate) => {
        const metadata = candidate.sourceMetadata;
        return candidate.marketData !== null &&
            candidate.fundamentalData !== null &&
            candidate.technicalData !== null &&
            Array.isArray(candidate.newsData) &&
            metadata !== null &&
            typeof metadata === "object" &&
            !Array.isArray(metadata) &&
            "provider" in metadata &&
            metadata.dataQuality === "PROVIDER_DATA" &&
            "riskContext" in metadata &&
            metadata.riskContext !== null;
    });

    if (!snapshot) {
        throw new Error(
            `Missing market-analysis snapshot for ${asset}. Run market:analysis first.`
        );
    }

    const metadata = snapshot.sourceMetadata as Record<string, unknown>;
    const ageMs = Date.now() - snapshot.createdAt.getTime();
    const maxAgeMs = Number(process.env.RESEARCH_SNAPSHOT_MAX_AGE_MS || 24 * 60 * 60 * 1000);
    if (!Number.isFinite(maxAgeMs) || maxAgeMs <= 0) {
        throw new Error("RESEARCH_SNAPSHOT_MAX_AGE_MS must be a positive number.");
    }
    if (ageMs > maxAgeMs) {
        throw new Error(
            `Stale market-analysis snapshot for ${asset}: ${Math.round(ageMs / 60000)} minutes old.`
        );
    }

    const research: SynthesizedResearch = {
        asset: snapshot.asset,
        timestamp: String(metadata.researchTimestamp || snapshot.createdAt.toISOString()),
        marketData: snapshot.marketData as unknown as SynthesizedResearch["marketData"],
        fundamentalData: snapshot.fundamentalData as unknown as FundamentalSummary,
        technicalData: snapshot.technicalData as unknown as TechnicalSummary,
        riskContext: metadata.riskContext as RiskContext | undefined,
        newsData: snapshot.newsData as unknown as NewsItem[],
        sourceMetadata: {
            provider: String(metadata.provider),
            fetchedAt: String(metadata.fetchedAt || snapshot.createdAt.toISOString()),
            isCached: Boolean(metadata.isCached),
        },
    };

    if (!quiet) {
        console.log(`✓ Snapshot ${snapshot.id} (${research.sourceMetadata.provider})`);
        console.log(`✓ Snapshot age: ${Math.round(ageMs / 60000)} minutes`);
    }
    const decision = await callOpenRouterForDecision(research);
    return {
        ...decision,
        source: { marketAnalysisSnapshotId: snapshot.id },
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
