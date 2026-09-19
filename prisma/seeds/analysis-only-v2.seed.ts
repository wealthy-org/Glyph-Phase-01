import {
    DecisionAction,
    EconomicEventType,
    PolicyResult,
    PrismaClient,
} from "../../src/generated/prisma/client";
import { seedAgent } from "./agent.seed";
import { seedPolicy } from "./policy.seed";
import { seedTreasury } from "./treasury.seed";

const SEED_VERSION = "v2";
const SCENARIO = "analysis-only";
const PROMPT_VERSION = "SEED_V2_ANALYSIS_ONLY";
const CYCLE_KEY = `seed:${SEED_VERSION}:${SCENARIO}`;
const metadata = { seedVersion: SEED_VERSION, scenario: SCENARIO };

const ALLOWED_ASSETS = ["NVDA", "MSFT", "AAPL", "TSLA"] as const;
// NVDA is intentionally the final analysis in the lifecycle.
const ANALYSIS_ORDER = ["MSFT", "AAPL", "TSLA", "NVDA"] as const;

const ASSET_NAMES: Record<(typeof ANALYSIS_ORDER)[number], string> = {
    MSFT: "Microsoft Corporation",
    AAPL: "Apple Inc.",
    TSLA: "Tesla, Inc.",
    NVDA: "NVIDIA Corporation",
};

const GLYPHS_VIEWS: Record<(typeof ANALYSIS_ORDER)[number], string> = {
    MSFT:
        "MSFT shows durable enterprise demand through cloud and productivity software. Technical conditions are neutral in this deterministic snapshot, while execution risk remains outside the scope of this analysis-only lifecycle. Glyph records the thesis and will not authorize execution.",
    AAPL:
        "AAPL combines a resilient ecosystem with recurring services revenue and strong consumer reach. Near-term momentum is treated as balanced rather than actionable. Glyph considers the asset worth monitoring but stops at analysis and will not create an order.",
    TSLA:
        "TSLA retains long-term innovation and platform optionality, but delivery sensitivity and valuation volatility increase uncertainty. Glyph recognizes the opportunity and the risk without converting either into an execution instruction.",
    NVDA:
        "NVDA shows strong fundamental momentum supported by continued demand for accelerated computing and AI infrastructure. Technical conditions remain constructive, but elevated valuation and volatility increase execution risk. Glyph considers the setup interesting but will not authorize execution in this analysis-only lifecycle.",
};

type AnalysisSymbol = (typeof ANALYSIS_ORDER)[number];

interface AnalysisRecord {
    symbol: AnalysisSymbol;
    assetName: string;
    analysisTimestamp: string;
    marketDataReference: {
        provider: string;
        assetId: string;
        observedAt: string;
    };
    fundamentalAnalysis: string;
    technicalAnalysis: string;
    riskAnalysis: string;
    marketContext: string;
    glyphsView: string;
    decision: DecisionAction;
    metadata: typeof metadata;
}

export async function seedAnalysisOnlyV2(prisma: PrismaClient) {
    console.log("Seeding V2 started");

    if (ANALYSIS_ORDER.length !== 4) {
        throw new Error("Seed V2 must analyze exactly 4 assets");
    }
    if (ANALYSIS_ORDER[ANALYSIS_ORDER.length - 1] !== "NVDA") {
        throw new Error("NVDA must be the final analysis");
    }
    if (new Set(ANALYSIS_ORDER).size !== 4) {
        throw new Error("Duplicate asset detected in Seed V2");
    }

    const configuredAgentId = process.env.GLYPH_AGENT_ID || "1";
    let agent = await prisma.agent.findFirst({
        where: { agentId: configuredAgentId },
        include: { policy: true, wallet: true, treasury: true },
    });

    if (!agent) {
        const seededAgent = await seedAgent(prisma);
        await seedPolicy(prisma, seededAgent.agent.id);
        await seedTreasury(prisma, seededAgent.agent.id);
        agent = await prisma.agent.findUniqueOrThrow({
            where: { id: seededAgent.agent.id },
            include: { policy: true, wallet: true, treasury: true },
        });
    }

    if (!agent.treasury) {
        await seedTreasury(prisma, agent.id);
    }

    if (!agent.policy) {
        await seedPolicy(prisma, agent.id);
        agent = await prisma.agent.findUniqueOrThrow({
            where: { id: agent.id },
            include: { policy: true, wallet: true, treasury: true },
        });
    }

    if (!agent.policy) {
        throw new Error("Unable to initialize Glyph market policy for V2 analysis seed.");
    }

    const allowedAssets = agent.policy.allowedAssets.map((symbol) => symbol.toUpperCase());
    const hasExactAllowedAssets =
        allowedAssets.length === ALLOWED_ASSETS.length &&
        ALLOWED_ASSETS.every((symbol) => allowedAssets.includes(symbol)) &&
        allowedAssets.every((symbol) => ALLOWED_ASSETS.includes(symbol as (typeof ALLOWED_ASSETS)[number]));
    if (!hasExactAllowedAssets) {
        throw new Error(
            `V2 requires policy allowedAssets exactly [${ALLOWED_ASSETS.join(", ")}]`
        );
    }

    const assets = [];
    for (const symbol of ANALYSIS_ORDER) {
        const asset = await prisma.marketAsset.upsert({
            where: { symbol },
            update: { name: ASSET_NAMES[symbol], assetType: "EQUITY", isActive: true },
            create: { symbol, name: ASSET_NAMES[symbol], assetType: "EQUITY", isActive: true },
        });
        assets.push(asset);
    }

    const cycleKey = `${CYCLE_KEY}:${agent.id}`;
    const existingRun = await prisma.agentRun.findUnique({
        where: { cycleKey },
        select: { id: true },
    });

    const lifecycleStart = Date.parse("2026-09-19T06:03:00.000Z");
    const timestamps = {
        glyphCreated: new Date("2026-09-19T06:00:00.000Z"),
        identityRegistered: new Date("2026-09-19T06:01:00.000Z"),
        walletCreated: new Date("2026-09-19T06:02:00.000Z"),
    };

    const analyses = assets.map((asset, index): AnalysisRecord => {
        const analysisTimestamp = new Date(lifecycleStart + index * 60_000);
        const symbol = asset.symbol as AnalysisSymbol;
        return {
            symbol,
            assetName: asset.name,
            analysisTimestamp: analysisTimestamp.toISOString(),
            marketDataReference: {
                provider: "seed-v2-deterministic-market-reference",
                assetId: asset.id,
                observedAt: analysisTimestamp.toISOString(),
            },
            fundamentalAnalysis: `${asset.name} is represented by the configured policy universe for this deterministic analysis fixture; no live quote is used.`,
            technicalAnalysis: `${symbol} technical conditions are recorded as neutral so this lifecycle remains analysis-only and does not imply an execution signal.`,
            riskAnalysis: `${symbol} remains subject to the active Glyph policy. Execution, order sizing, and PnL are intentionally outside this seed.`,
            marketContext: `The ${symbol} observation is part of Glyph's configured equity universe and is evaluated independently before the lifecycle hard stop.`,
            glyphsView: GLYPHS_VIEWS[symbol],
            decision: DecisionAction.NO_TRADE,
            metadata,
        };
    });

    const result = await prisma.$transaction(async (tx) => {
        if (existingRun) {
            const oldDecisions = await tx.decision.findMany({
                where: { agentId: agent.id, promptVersion: PROMPT_VERSION },
                select: { id: true, researchSnapshotId: true },
            });
            const oldDecisionIds = oldDecisions.map((decision) => decision.id);
            const oldSnapshotIds = oldDecisions
                .map((decision) => decision.researchSnapshotId)
                .filter((id): id is string => Boolean(id));

            await tx.economicEvent.deleteMany({
                where: {
                    agentId: agent.id,
                    OR: [
                        { description: { contains: '\"seedVersion\":\"v2\"' } },
                        { decisionId: { in: oldDecisionIds } },
                    ],
                },
            });
            await tx.decision.deleteMany({
                where: { agentId: agent.id, promptVersion: PROMPT_VERSION },
            });
            if (oldSnapshotIds.length > 0) {
                await tx.researchSnapshot.deleteMany({ where: { id: { in: oldSnapshotIds } } });
            }
        }

        await tx.economicEvent.createMany({
            data: [
                {
                    agentId: agent.id,
                    eventType: EconomicEventType.AGENT_BORN,
                    title: "[SYSTEM] GLYPH CREATED",
                    description: `Glyph autonomous agent initialized. Metadata: ${JSON.stringify(metadata)}.`,
                    day: 1,
                    result: "CREATED",
                    timestamp: timestamps.glyphCreated,
                },
                {
                    agentId: agent.id,
                    eventType: EconomicEventType.IDENTITY_REGISTERED,
                    title: "[SYSTEM] IDENTITY REGISTERED",
                    description: `ERC-8004 agent identity registered. Metadata: ${JSON.stringify(metadata)}.`,
                    day: 1,
                    result: "ERC-8004",
                    timestamp: timestamps.identityRegistered,
                },
                {
                    agentId: agent.id,
                    eventType: EconomicEventType.WALLET_CREATED,
                    title: "[SYSTEM] SMART ACCOUNT WALLET CREATED",
                    description: `Safe smart account deployed for autonomous execution (${agent.wallet?.walletAddress || "configured wallet"}). Metadata: ${JSON.stringify(metadata)}.`,
                    day: 1,
                    result: "SAFE-EVM",
                    timestamp: timestamps.walletCreated,
                },
            ],
        });

        const createdAnalyses: Array<{ snapshotId: string; decisionId: string }> = [];
        for (const analysis of analyses) {
            const analysisDate = new Date(analysis.analysisTimestamp);
            const snapshot = await tx.researchSnapshot.create({
                data: {
                    asset: analysis.symbol,
                    marketData: analysis.marketDataReference,
                    fundamentalData: { analysis: analysis.fundamentalAnalysis },
                    technicalData: { analysis: analysis.technicalAnalysis },
                    newsData: { context: analysis.marketContext },
                    sourceMetadata: { ...metadata, provider: analysis.marketDataReference.provider },
                    createdAt: analysisDate,
                },
            });

            const decision = await tx.decision.create({
                data: {
                    agentId: agent.id,
                    asset: analysis.symbol,
                    action: DecisionAction.NO_TRADE,
                    conviction: 74,
                    timeHorizon: "analysis_only",
                    fundamentalScore: 50,
                    technicalScore: 50,
                    riskScore: 0,
                    thesis: analysis as any,
                    policyResult: PolicyResult.REJECTED,
                    policyRejectReason: "Analysis-only seed hard stop; no execution is permitted.",
                    researchSnapshotId: snapshot.id,
                    promptVersion: PROMPT_VERSION,
                    createdAt: analysisDate,
                },
            });

            await tx.economicEvent.createMany({
                data: [
                    {
                        agentId: agent.id,
                        eventType: EconomicEventType.RESEARCH_STARTED,
                        title: "[ANALYSIS] MARKET ANALYSIS",
                        description: `${analysis.assetName} (${analysis.symbol}) analysis completed. Glyph's view: ${analysis.glyphsView} Decision: ${analysis.decision}.`,
                        day: 1,
                        result: "74",
                        decisionId: decision.id,
                        timestamp: analysisDate,
                    },
                ],
            });
            createdAnalyses.push({ snapshotId: snapshot.id, decisionId: decision.id });
        }

        const runData = {
            startedAt: new Date(analyses[0].analysisTimestamp),
            completedAt: new Date(analyses[analyses.length - 1].analysisTimestamp),
            marketSnapshot: { ...metadata, assets: analyses.map((analysis) => analysis.marketDataReference) } as any,
            promptVersion: PROMPT_VERSION,
            decision: { ...metadata, analyses, decisions: createdAnalyses } as any,
            policyResult: "REJECTED",
        };

        return existingRun
            ? tx.agentRun.update({ where: { id: existingRun.id }, data: runData })
            : tx.agentRun.create({ data: { ...runData, agentId: agent.id, cycleKey } });
    });

    console.log("✓ Glyph created");
    console.log("✓ Identity registered");
    console.log("✓ Smart account created");
    console.log(`✓ Market analysis created for ${ANALYSIS_ORDER.join(", ")}`);
    console.log("✓ Analysis completed");
    await validateAnalysisOnlyV2(prisma, agent.id, result.id);
    console.log("Seeding V2 completed");
}

async function validateAnalysisOnlyV2(prisma: PrismaClient, agentId: string, runId: string) {
    const [decisions, trades, positions] = await Promise.all([
        prisma.decision.findMany({
            where: { agentId, promptVersion: PROMPT_VERSION },
            orderBy: { createdAt: "asc" },
            select: { id: true, asset: true, researchSnapshotId: true, action: true, thesis: true },
        }),
        prisma.trade.count({ where: { agentId } }),
        prisma.position.count({ where: { agentId } }),
    ]);

    const symbols = decisions.map((decision) => decision.asset);
    const expectedSymbols = [...ANALYSIS_ORDER];
    const glyphViewsAreReadable = decisions.every((decision) => {
        const thesis = decision.thesis as { glyphsView?: unknown };
        return typeof thesis.glyphsView === "string" && !thesis.glyphsView.trim().startsWith("{");
    });
    const analysisEvents = await prisma.economicEvent.findMany({
        where: {
            decisionId: { in: decisions.map((decision) => decision.id) },
            title: "[ANALYSIS] MARKET ANALYSIS",
        },
        select: { decisionId: true, title: true },
    });
    const eventTitlesByDecision = new Map<string, Set<string>>();
    for (const event of analysisEvents) {
        if (!event.decisionId) continue;
        const titles = eventTitlesByDecision.get(event.decisionId) || new Set<string>();
        titles.add(event.title);
        eventTitlesByDecision.set(event.decisionId, titles);
    }
    const cycleCountIsValid =
        analysisEvents.length === 4 &&
        decisions.every((decision) => {
            const titles = eventTitlesByDecision.get(decision.id);
            return titles?.size === 1 && titles.has("[ANALYSIS] MARKET ANALYSIS");
        });

    if (
        decisions.length !== 4 ||
        symbols.join(",") !== expectedSymbols.join(",") ||
        new Set(symbols).size !== 4 ||
        decisions.some((decision) => decision.action !== DecisionAction.NO_TRADE) ||
        !glyphViewsAreReadable ||
        !cycleCountIsValid ||
        trades !== 0 ||
        positions !== 0
    ) {
        throw new Error(
            `V2 validation failed: analyses=${decisions.length}, symbols=${symbols.join(",")}, cycles=${cycleCountIsValid}, trades=${trades}, positions=${positions}, readableViews=${glyphViewsAreReadable}`
        );
    }

    const snapshotIds = decisions
        .map((decision) => decision.researchSnapshotId)
        .filter((id): id is string => Boolean(id));
    const [linkedTrades, linkedPositions] = await Promise.all([
        prisma.trade.count({ where: { researchSnapshotId: { in: snapshotIds } } }),
        prisma.position.count({ where: { trade: { researchSnapshotId: { in: snapshotIds } } } }),
    ]);
    if (linkedTrades !== 0 || linkedPositions !== 0) {
        throw new Error(`V2 linked execution validation failed: trades=${linkedTrades}, positions=${linkedPositions}`);
    }

    console.log(`✓ Allowed assets: ${ALLOWED_ASSETS.join(", ")}`);
    console.log(`✓ Analysis count = ${decisions.length}`);
    console.log(`✓ Unique symbols = ${symbols.join(", ")}`);
    console.log(`✓ Last analysis = ${symbols[symbols.length - 1]}`);
    console.log("✓ Analysis cycles = 4 (1 linked event per asset)");
    console.log("✓ No trade created");
    console.log("✓ No position created");
    console.log("✓ No order created (Order model is not present in the schema)");
    console.log("✓ No execution or transaction created");
    console.log(`V2 analysis count = ${decisions.length}; trade count = ${trades}; position count = ${positions}; order count = 0`);
    void runId;
}
