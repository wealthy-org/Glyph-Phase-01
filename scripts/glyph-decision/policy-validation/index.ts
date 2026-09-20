#!/usr/bin/env node
import "dotenv/config";

import { readFile } from "node:fs/promises";
import { prisma } from "../../../src/lib/prisma";
import { runSingleAssetDecision } from "../llm-decision";
import { POLICY_CONFIG } from "./config";
import { evaluatePolicy } from "./policy";
import { PolicyResult } from "./types";

interface CliOptions {
    agentId: string;
    asset?: string;
    decisionFile?: string;
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
        if (argument === "--help" || argument === "-h") options.help = true;
        else if (argument === "--agent") {
            options.agentId = args[index + 1] || options.agentId;
            index += 1;
        } else if (argument === "--asset" || argument === "-a") {
            options.asset = args[index + 1]?.toUpperCase();
            index += 1;
        } else if (argument === "--decision-file") {
            options.decisionFile = args[index + 1];
            index += 1;
        } else if (argument === "--json") options.json = true;
        else throw new Error(`Unknown argument: ${argument}`);
    }
    return options;
}

function printHelp(): void {
    console.log(`
GLYPH POLICY VALIDATION

Usage:
    npm run policy:validate
    npm run policy:validate -- --asset NVDA
  npm run policy:validate -- --asset NVDA --decision-file ./decision.json --json

Options:
    -a, --asset <TICKER>       Validate one allowed asset; default: validate every allowed asset
      --agent <ID>           Agent identifier; default: GLYPH_AGENT_ID or 1
      --decision-file <PATH> Read a structured decision JSON instead of calling llm-decision
      --json                 Print machine-readable policy output
  -h, --help                 Show this help
`);
}

async function loadDecision(options: CliOptions, asset: string) {
    if (options.decisionFile) {
        const raw = JSON.parse(await readFile(options.decisionFile, "utf8")) as unknown;
        const candidate = raw && typeof raw === "object" && "decisions" in raw && Array.isArray(raw.decisions)
            ? raw.decisions.find((item) => item && typeof item === "object" && (item as { asset?: unknown }).asset === asset)
            : raw;
        return candidate;
    }
    return runSingleAssetDecision(asset, true);
}

export async function loadState(agentId: string, decision: { asset: string; source: { marketAnalysisSnapshotId: string } }) {
    const agent = await prisma.agent.findUnique({
        where: { agentId },
        include: { treasury: true, policy: true },
    });
    if (!agent) throw new Error(`Agent #${agentId} was not found in the database.`);
    if (!agent.treasury) throw new Error(`Agent #${agentId} does not have a treasury record.`);
    if (!agent.policy) throw new Error(`Agent #${agentId} does not have an active policy.`);
    if (!agent.policy.allowedAssets.map((asset) => asset.toUpperCase()).includes(decision.asset)) {
        throw new Error(`Asset ${decision.asset} is not allowed by Agent #${agentId}.`);
    }

    const snapshot = await prisma.researchSnapshot.findUnique({
        where: { id: decision.source.marketAnalysisSnapshotId },
        select: { id: true, asset: true, marketData: true, sourceMetadata: true },
    });
    if (!snapshot || snapshot.asset.toUpperCase() !== decision.asset) {
        throw new Error(`Market-analysis snapshot ${decision.source.marketAnalysisSnapshotId} is missing or belongs to another asset.`);
    }

    const marketData = snapshot.marketData;
    const metadata = snapshot.sourceMetadata;
    const quote = marketData && typeof marketData === "object" && !Array.isArray(marketData)
        ? (marketData as { quote?: { price?: unknown } }).quote
        : undefined;
    const metadataRecord = metadata && typeof metadata === "object" && !Array.isArray(metadata)
        ? metadata as { dataQuality?: unknown; riskContext?: { regime?: unknown; level?: unknown; details?: unknown } | null }
        : undefined;
    const riskContext = metadataRecord?.riskContext;
    const positions = await prisma.position.findMany({
        where: { agentId: agent.id, isOpen: true },
        select: { asset: true, side: true },
    });

    return {
        state: {
            availableCash: Number(agent.treasury.currentBalance),
            positions: positions.map((position) => ({ asset: position.asset, side: position.side })),
            marketPrice: typeof quote?.price === "number" ? quote.price : Number(quote?.price),
            marketAnalysisValid: snapshot.id === decision.source.marketAnalysisSnapshotId && metadataRecord?.dataQuality === "PROVIDER_DATA",
            riskValid: Boolean(riskContext && riskContext.regime && riskContext.level && riskContext.details),
        },
        config: {
            minConviction: agent.policy.minConfidence,
            minRemainingCash: POLICY_CONFIG.minRemainingCash,
            positionAllocationPercent: Number(agent.policy.maxPositionPercent),
        },
    };
}

function printResult(result: PolicyResult): void {
    console.log("========================================");
    console.log("GLYPH POLICY VALIDATION");
    console.log("========================================");
    console.log(`\nAsset       : ${result.asset}`);
    console.log(`Action      : ${result.action}`);
    console.log(`Conviction  : ${result.conviction}`);
    console.log("\nChecks");
    for (const [name, passed] of Object.entries(result.checks)) console.log(`${passed ? "✓" : "✗"} ${name}`);
    if (result.allocation) {
        console.log("\nPosition Allocation");
        console.log(`Percent    : ${result.allocation.percent}%`);
        console.log(`Amount     : $${result.allocation.amount.toFixed(4)}`);
        console.log(`Quantity   : ${result.allocation.quantity}`);
        console.log(`Remaining  : $${result.allocation.remainingCash.toFixed(4)}`);
    }
    if (result.reason) console.log(`\nReason: ${result.reason}`);
    console.log(`\n----------------------------------------\nPOLICY RESULT: ${result.result}\n----------------------------------------`);
}

async function main(): Promise<void> {
    const options = parseArgs();
    if (options.help) return printHelp();
    const agent = await prisma.agent.findUnique({ where: { agentId: options.agentId }, select: { policy: { select: { allowedAssets: true } } } });
    if (!agent?.policy) throw new Error(`Agent #${options.agentId} does not have an active policy.`);
    const assets = options.asset ? [options.asset] : agent.policy.allowedAssets.map((asset) => asset.toUpperCase());
    if (assets.length === 0) throw new Error("No policy assets are available.");

    const results: PolicyResult[] = [];
    for (const asset of assets) {
        const rawDecision = await loadDecision(options, asset);
        const rawRecord = rawDecision && typeof rawDecision === "object" ? rawDecision as Record<string, unknown> : {};
        const source = rawRecord.source && typeof rawRecord.source === "object"
            ? rawRecord.source as { marketAnalysisSnapshotId?: unknown }
            : {};
        if (typeof source.marketAnalysisSnapshotId !== "string") {
            throw new Error(`Decision source.marketAnalysisSnapshotId is required for ${asset}.`);
        }
        const decisionContext = {
            asset: typeof rawRecord.asset === "string" ? rawRecord.asset.toUpperCase() : asset,
            source: { marketAnalysisSnapshotId: source.marketAnalysisSnapshotId },
        };
        const { state, config } = await loadState(options.agentId, decisionContext);
        const result = evaluatePolicy(rawDecision, state, config);
        results.push(result);
    }

    if (options.json) console.log(JSON.stringify(results, null, 2));
    else results.forEach(printResult);
    if (results.some((result) => result.result === "REJECTED")) process.exitCode = 1;
}

if (process.argv[1]?.replaceAll("\\", "/").endsWith("/policy-validation/index.ts")) {
    main()
        .catch((error) => {
            console.error(`Policy validation failed: ${error instanceof Error ? error.message : String(error)}`);
            process.exitCode = 1;
        })
        .finally(async () => prisma.$disconnect());
}