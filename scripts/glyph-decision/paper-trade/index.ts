import { Prisma } from "../../../src/generated/prisma/client";
import { prisma } from "../../../src/lib/prisma";
import { POLICY_CONFIG } from "../policy-validation/config";
import { PaperTradeExecution, PaperTradeInstruction } from "./types";

const Decimal = Prisma.Decimal;

function decimal(value: string, name: string): Prisma.Decimal {
    const result = new Decimal(value);
    if (!result.isFinite() || result.isNegative()) throw new Error(`${name} must be a non-negative finite decimal.`);
    return result;
}

/** Persists exactly one approved paper-trade instruction and nothing else. */
export async function executePaperTrade(
    instruction: PaperTradeInstruction
): Promise<PaperTradeExecution> {
    const allocation = decimal(instruction.allocationAmount, "allocationAmount");
    const executionPrice = decimal(instruction.executionPrice, "executionPrice");
    const quantity = decimal(instruction.quantity, "quantity");
    if (allocation.isZero() || executionPrice.isZero() || quantity.isZero()) {
        throw new Error("Paper-trade instruction amounts and price must be greater than zero.");
    }

    return prisma.$transaction(async (tx) => {
        const agent = await tx.agent.findUnique({
            where: { agentId: instruction.agentId },
            select: { id: true, createdAt: true, treasury: { select: { id: true, currentBalance: true } } },
        });
        if (!agent?.treasury) throw new Error(`Treasury for agent ${instruction.agentId} was not found.`);

        const decision = await tx.decision.findUnique({
            where: { id: instruction.decisionId },
            select: { id: true, agentId: true, policyResult: true, tradeId: true },
        });
        if (!decision || decision.agentId !== agent.id) throw new Error("Decision for paper trade was not found.");
        if (decision.policyResult !== "APPROVED") throw new Error("Paper trade requires an APPROVED decision.");
        if (decision.tradeId) throw new Error("Decision already has a paper trade.");

        const treasuryCash = new Decimal(agent.treasury.currentBalance.toString());
        const remainingCash = treasuryCash.minus(allocation);
        if (remainingCash.isNegative() || remainingCash.lessThan(POLICY_CONFIG.minRemainingCash)) {
            throw new Error(`Paper trade would leave less than the minimum remaining cash of $${POLICY_CONFIG.minRemainingCash.toFixed(2)}.`);
        }

        const existingPosition = await tx.position.findFirst({
            where: { agentId: agent.id, asset: instruction.asset, isOpen: true },
            select: { id: true },
        });
        if (existingPosition) throw new Error(`Existing position already exists for ${instruction.asset}.`);

        const tradeCount = await tx.trade.count({ where: { agentId: agent.id } });
        const tradeNumber = `GLYPH-${String(tradeCount + 1).padStart(4, "0")}`;
        const side = instruction.action;
        const trade = await tx.trade.create({
            data: {
                tradeNumber,
                agentId: agent.id,
                asset: instruction.asset,
                action: side,
                entryPrice: executionPrice,
                positionSize: allocation,
                quantity,
                leverage: 1,
                conviction: instruction.conviction,
                thesis: instruction.thesis as Prisma.InputJsonValue,
                researchSnapshotId: instruction.researchSnapshotId,
                status: "OPEN",
            },
        });
        const position = await tx.position.create({
            data: {
                agentId: agent.id,
                tradeId: trade.id,
                asset: instruction.asset,
                side,
                entryPrice: executionPrice,
                currentPrice: executionPrice,
                positionSize: allocation,
                quantity,
                leverage: 1,
                isOpen: true,
            },
        });
        const treasuryUpdate = await tx.agentTreasury.updateMany({
            where: {
                id: agent.treasury.id,
                currentBalance: { gte: allocation.plus(POLICY_CONFIG.minRemainingCash) },
            },
            data: { currentBalance: { decrement: allocation } },
        });
        if (treasuryUpdate.count !== 1) {
            throw new Error("Treasury changed before confirmation or minimum remaining cash would be violated.");
        }
        const confirmedTreasury = await tx.agentTreasury.findUnique({
            where: { id: agent.treasury.id },
            select: { currentBalance: true },
        });
        if (!confirmedTreasury) throw new Error("Treasury could not be read after paper-trade confirmation.");
        await tx.decision.update({
            where: { id: decision.id },
            data: { tradeId: trade.id },
        });
        const day = Math.max(1, Math.floor((Date.now() - agent.createdAt.getTime()) / (24 * 60 * 60 * 1000)) + 1);
        await tx.economicEvent.create({
            data: {
                agentId: agent.id,
                eventType: "TRADE_OPENED",
                title: `${trade.asset} ${trade.action} Trade Confirmed`,
                description: `Glyph opened a ${trade.action} position in ${trade.asset} with ${position.quantity.toString()} units at $${trade.entryPrice.toString()}, using $${trade.positionSize.toString()} of available cash. Cash after: $${confirmedTreasury.currentBalance.toString()}.`,
                day,
                result: "CONFIRMED",
                tradeId: trade.id,
                decisionId: decision.id,
                cycleId: instruction.cycleId,
            },
        });

        return {
            status: "CONFIRMED",
            tradeId: trade.id,
            positionId: position.id,
            tradeNumber,
            asset: instruction.asset,
            action: side,
            executionPrice: executionPrice.toFixed(4),
            allocationAmount: allocation.toFixed(4),
            quantity: quantity.toFixed(12),
            remainingCash: confirmedTreasury.currentBalance.toString(),
        };
    });
}