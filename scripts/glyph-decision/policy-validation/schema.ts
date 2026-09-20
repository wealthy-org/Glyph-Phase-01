import { z } from "zod";

export const PolicyDecisionSchema = z.object({
    asset: z.string().trim().min(1).transform((value) => value.toUpperCase()),
    action: z.enum(["LONG", "SHORT", "NO_TRADE"]),
    conviction: z.number().int().min(0).max(100),
    thesis: z.object({
        fundamental: z.string().min(1),
        technical: z.string().min(1),
        risk: z.string().min(1),
        invalidation: z.string().min(1),
    }),
    source: z.object({
        marketAnalysisSnapshotId: z.string().min(1),
    }),
});