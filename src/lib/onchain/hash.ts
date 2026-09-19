// ============================================================================
// GLYPH PHASE 01 — CANONICAL DECISION HASH ENGINE
// Derived from: BRIEF.md (§12, §3.5)
// Deterministic canonical serialization and keccak256 hash generation.
// ============================================================================

import { Hex, keccak256, toHex } from "viem";

/**
 * Recursively sorts all keys in an object to produce a canonical deterministic JSON string.
 */
export function canonicalJsonStringify(obj: any): string {
  if (obj === null || typeof obj !== "object") {
    return JSON.stringify(obj);
  }

  if (Array.isArray(obj)) {
    return `[${obj.map((item) => canonicalJsonStringify(item)).join(",")}]`;
  }

  const sortedKeys = Object.keys(obj).sort();
  const pairs = sortedKeys.map(
    (key) => `${JSON.stringify(key)}:${canonicalJsonStringify(obj[key])}`
  );
  return `{${pairs.join(",")}}`;
}

export interface CanonicalDecisionPayload {
  decisionId: string;
  agentId: string;
  asset: string;
  action: "OPEN_LONG" | "OPEN_SHORT" | "HOLD" | "CLOSE" | "NO_TRADE";
  conviction: number;
  fundamentalScore?: number | null;
  technicalScore?: number | null;
  riskScore?: number | null;
  positionSizePercent?: number | null;
  leverage?: number | null;
  thesis: {
    fundamental: string;
    technical: string;
    catalyst: string;
    risk: string;
    invalidation: string;
  };
  policyResult: "APPROVED" | "REJECTED";
  promptVersion: string;
  createdAt: string;
}

/**
 * Computes canonical keccak256 32-byte hash for an agent decision (§12).
 */
export function calculateDecisionHash(payload: CanonicalDecisionPayload): {
  decisionHash: Hex;
  canonicalJson: string;
} {
  const canonicalJson = canonicalJsonStringify(payload);
  const decisionHash = keccak256(toHex(canonicalJson));

  return {
    decisionHash,
    canonicalJson,
  };
}
