export const POLICY_CONFIG = {
    minConviction: 60,
    minRemainingCash: 100,
    positionAllocationPercent: 10,
} as const;

export type PolicyConfig = {
    minConviction: number;
    minRemainingCash: number;
    positionAllocationPercent: number;
};

export function validatePolicyConfig(config: PolicyConfig): void {
    if (!Number.isFinite(config.minConviction) || config.minConviction < 0 || config.minConviction > 100) {
        throw new Error("Policy minConviction must be between 0 and 100.");
    }
    if (!Number.isFinite(config.minRemainingCash) || config.minRemainingCash < 0) {
        throw new Error("Policy minRemainingCash must be non-negative.");
    }
    if (!Number.isFinite(config.positionAllocationPercent) || config.positionAllocationPercent < 0 || config.positionAllocationPercent > 100) {
        throw new Error("Policy positionAllocationPercent must be between 0 and 100.");
    }
}