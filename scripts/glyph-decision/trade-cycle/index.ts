#!/usr/bin/env node
import "dotenv/config";

import { prisma } from "../../../src/lib/prisma";
import { runSingleAssetDecision } from "../llm-decision";
import { executePaperTrade } from "../paper-trade";
import { PaperTradeExecution } from "../paper-trade/types";
import { loadState } from "../policy-validation";
import { evaluatePolicy } from "../policy-validation/policy";

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

function actionForDatabase(action: "LONG" | "SHORT" | "NO_TRADE") {
    return action === "LONG" ? "OPEN_LONG" : action === "SHORT" ? "OPEN_SHORT" : "NO_TRADE";
}

async function loadAllowedAssets(agentId: string, requestedAsset?: string): Promise<string[]> {
    const agent = await prisma.agent.findUnique({
        where: { agentId },
        select: { policy: { select: { allowedAssets: true } } },
    });
    if (!agent?.policy) throw new Error(`Agent #${agentId} does not have an active policy.`);
    const assets = agent.policy.allowedAssets.map((asset) => asset.trim().toUpperCase()).filter(Boolean);
    if (requestedAsset) {
        if (!assets.includes(requestedAsset)) throw new Error(`Asset ${requestedAsset} is not allowed by Agent #${agentId}.`);
        return [requestedAsset];
    }
    return assets;
}

async function persistDecision(
    agentId: string,
    decision: Awaited<ReturnType<typeof runSingleAssetDecision>>,
    policyResult: ReturnType<typeof evaluatePolicy>
): Promise<string> {
    const agent = await prisma.agent.findUnique({ where: { agentId }, select: { id: true } });
    if (!agent) throw new Error(`Agent #${agentId} was not found in the database.`);
    const record = await prisma.decision.create({
        data: {
            agentId: agent.id,
            asset: decision.asset,
            action: actionForDatabase(decision.action),
            conviction: decision.conviction,
            thesis: JSON.parse(JSON.stringify(decision.thesis)),
            policyResult: policyResult.result,
            policyRejectReason: policyResult.reason ?? null,
            positionSizePercent: policyResult.allocation?.percent.toString() ?? null,
            leverage: "1",
            researchSnapshotId: decision.source.marketAnalysisSnapshotId,
            cycleId: undefined,
            promptVersion: "LLM_DECISION_PHASE01",
        },
        select: { id: true },
    });
    return record.id;
}

async function processAsset(agentId: string, asset: string): Promise<PaperTradeExecution | null> {
    const decision = await runSingleAssetDecision(asset, true);
    // This read occurs immediately before policy evaluation. The next asset repeats it.
    const { state, config } = await loadState(agentId, decision);
    const policyResult = evaluatePolicy(decision, state, config);
    const decisionId = await persistDecision(agentId, decision, policyResult);

    console.log(`\n[${asset}] ${decision.action} ${decision.conviction}`);
    console.log(`DATABASE STATE\nCash: $${state.availableCash.toFixed(4)}`);
    for (const [name, passed] of Object.entries(policyResult.checks)) console.log(`${passed ? "✓" : "✗"} ${name}`);
    console.log(`POLICY RESULT: ${policyResult.result}`);

    if (policyResult.result === "REJECTED" || !policyResult.allocation) {
        console.log(`Reason: ${policyResult.reason || "Mandatory policy check failed"}`);
        console.log("PAPER TRADE: SKIPPED\nDATABASE: UNCHANGED");
        return null;
    }

    const instruction = policyResult.paperTradeInstruction;
    if (!instruction) {
        console.error("PAPER TRADE: FAILED\nDATABASE: NOT CONFIRMED\nReason: Approved policy did not produce an instruction.");
        return null;
    }
    try {
        const execution = await executePaperTrade({
            agentId,
            decisionId,
            asset: decision.asset,
            action: instruction.action,
            executionPrice: instruction.executionPrice.toString(),
            allocationAmount: instruction.allocationAmount.toFixed(4),
            quantity: instruction.quantity.toFixed(12),
            researchSnapshotId: decision.source.marketAnalysisSnapshotId,
            conviction: decision.conviction,
            thesis: JSON.parse(JSON.stringify(decision.thesis)),
        });
        console.log(`PAPER TRADE CONFIRMED\nAsset: ${execution.asset}\nAction: ${execution.action}\nExecuted Amount: $${execution.allocationAmount}`);
        console.log(`TREASURY UPDATE\nBefore: $${state.availableCash.toFixed(4)}\nAfter:  $${execution.remainingCash}`);
        console.log(`DATABASE: UPDATED\nPrice: $${execution.executionPrice}\nQuantity: ${execution.quantity}\nPosition: ${execution.asset} ${execution.action}\nTrade: ${execution.tradeNumber}`);
        return execution;
    } catch (error) {
        console.error(`PAPER TRADE: FAILED\nDATABASE: NOT CONFIRMED\nReason: ${error instanceof Error ? error.message : String(error)}`);
        return null;
    }
}

async function main(): Promise<void> {
    const options = parseArgs();
    if (options.help) return printHelp();
    const assets = await loadAllowedAssets(options.agentId, options.asset);
    if (assets.length === 0) throw new Error("No allowed assets are configured.");
    console.log("==================================================\nGLYPH TRADE CYCLE\n==================================================");
    for (const asset of assets) await processAsset(options.agentId, asset);
}

if (process.argv[1]?.replaceAll("\\", "/").endsWith("/trade-cycle/index.ts")) {
    main()
        .catch((error) => {
            console.error(`Trade cycle failed: ${error instanceof Error ? error.message : String(error)}`);
            process.exitCode = 1;
        })
        .finally(async () => prisma.$disconnect());
}