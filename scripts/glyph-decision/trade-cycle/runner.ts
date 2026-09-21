import { prisma } from "../../../src/lib/prisma";
import { runSingleAssetDecision } from "../llm-decision";
import { executePaperTrade } from "../paper-trade";
import { PaperTradeExecution } from "../paper-trade/types";
import { loadState } from "../policy-validation";
import { evaluatePolicy } from "../policy-validation/policy";
import { getGlyphDecisionMarketStatus } from "./market-gate";

export interface TradeCycleRunOptions {
    agentId?: string;
    asset?: string;
    cycleId?: string;
    marketOpen?: boolean;
}

export interface TradeCycleAssetResult {
    asset: string;
    decisionId?: string;
    action?: "LONG" | "SHORT" | "NO_TRADE";
    conviction?: number;
    policyResult?: "APPROVED" | "REJECTED";
    policyRejectReason?: string;
    execution: PaperTradeExecution | null;
    error?: string;
}

export interface TradeCycleRunResult {
    agentId: string;
    assets: string[];
    results: TradeCycleAssetResult[];
    status: "COMPLETED" | "FAILED";
}

function actionForDatabase(action: "LONG" | "SHORT" | "NO_TRADE") {
    return action === "LONG" ? "OPEN_LONG" : action === "SHORT" ? "OPEN_SHORT" : "NO_TRADE";
}

export async function loadAllowedAssets(agentId: string, requestedAsset?: string): Promise<string[]> {
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
    policyResult: ReturnType<typeof evaluatePolicy>,
    cycleId?: string
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
            cycleId,
            promptVersion: "LLM_DECISION_PHASE01",
        },
        select: { id: true },
    });
    return record.id;
}

async function processAsset(
    agentId: string,
    asset: string,
    cycleId: string | undefined,
    marketOpen: boolean
): Promise<TradeCycleAssetResult> {
    try {
        const decision = await runSingleAssetDecision(asset, true);
        const { state, config } = await loadState(agentId, decision, { marketOpen });
        const policyResult = evaluatePolicy(decision, state, config);
        const decisionId = await persistDecision(agentId, decision, policyResult, cycleId);

        console.log(`[Glyph Decision Cron] ${asset}: decision ${decision.action} (${decision.conviction})`);
        console.log(`[Glyph Decision Cron] ${asset}: policy ${policyResult.result}`);

        if (policyResult.result === "REJECTED" || !policyResult.allocation) {
            console.log(`[Glyph Decision Cron] ${asset}: paper trade skipped`);
            return {
                asset,
                decisionId,
                action: decision.action,
                conviction: decision.conviction,
                policyResult: policyResult.result,
                policyRejectReason: policyResult.reason,
                execution: null,
            };
        }

        const instruction = policyResult.paperTradeInstruction;
        if (!instruction) {
            return {
                asset,
                decisionId,
                action: decision.action,
                conviction: decision.conviction,
                policyResult: policyResult.result,
                execution: null,
                error: "Approved policy did not produce a paper-trade instruction.",
            };
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
                cycleId,
                conviction: decision.conviction,
                thesis: JSON.parse(JSON.stringify(decision.thesis)),
            });
            console.log(`[Glyph Decision Cron] ${asset}: paper trade completed (${execution.tradeNumber})`);
            return {
                asset,
                decisionId,
                action: decision.action,
                conviction: decision.conviction,
                policyResult: policyResult.result,
                execution,
            };
        } catch (error) {
            return {
                asset,
                decisionId,
                action: decision.action,
                conviction: decision.conviction,
                policyResult: policyResult.result,
                execution: null,
                error: error instanceof Error ? error.message : String(error),
            };
        }
    } catch (error) {
        return {
            asset,
            execution: null,
            error: error instanceof Error ? error.message : String(error),
        };
    }
}

export async function runTradeCycle(options: TradeCycleRunOptions = {}): Promise<TradeCycleRunResult> {
    const agentId = options.agentId || process.env.GLYPH_AGENT_ID || "1";
    const assets = await loadAllowedAssets(agentId, options.asset?.toUpperCase());
    if (assets.length === 0) throw new Error("No allowed assets are configured.");
    const marketOpen = options.marketOpen ?? (await getGlyphDecisionMarketStatus()).isOpen;

    if (!marketOpen) {
        console.log("[Glyph Decision Cron] Trade-cycle skipped because market is closed");
        return { agentId, assets, results: [], status: "COMPLETED" };
    }

    console.log(`[Glyph Decision Cron] Starting trade-cycle for ${assets.join(", ")}`);
    const results: TradeCycleAssetResult[] = [];
    for (const asset of assets) results.push(await processAsset(agentId, asset, options.cycleId, marketOpen));

    return {
        agentId,
        assets,
        results,
        status: results.some((result) => result.error) ? "FAILED" : "COMPLETED",
    };
}
