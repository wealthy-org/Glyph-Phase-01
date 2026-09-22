# GLYPH — PHASE 2 MAINNET MIGRATION PLAN

Created: 2026-09-22
Branch: feat/mainnet-migration
Status: AWAITING HUMAN APPROVAL — Do NOT execute Phase 3 until approved.

---

## Overview

This document converts the Phase 1 audit into an exact, ordered implementation plan.

No code, contracts, or configuration will be changed until this plan receives
explicit human approval.

---

## Target Mainnet

| Parameter | Testnet (Current) | Mainnet (Target) |
|---|---|---|
| Network Name | Robinhood Chain Testnet | Robinhood Chain |
| Chain ID | `46630` | `4663` |
| RPC URL | `https://rpc.testnet.chain.robinhood.com` | `https://rpc.mainnet.chain.robinhood.com` |
| Block Explorer | `https://explorer.testnet.chain.robinhood.com` | `https://robinhoodchain.blockscout.com` |
| Stack | Arbitrum Nitro L2 | Arbitrum Nitro L2 |
| Native Token | ETH | ETH |

---

## Resource Migration Map

### Network Configuration

| Testnet Resource | Mainnet Resource | Action | Approval? | Verification |
|---|---|---|---|---|
| Chain ID `46630` | Chain ID `4663` | Update code + ENV | No | `NEXT_PUBLIC_CHAIN_ID=4663` in env |
| `rpc.testnet.chain.robinhood.com` | `rpc.mainnet.chain.robinhood.com` | Update ENV + code fallback | No | `eth_chainId` RPC call returns `0x1237` |
| `explorer.testnet.chain.robinhood.com` | `robinhoodchain.blockscout.com` | Update ENV + code fallback | No | Open URL, verify working |
| DNS bypass IPs for testnet | DNS bypass IPs for mainnet | Verify & update `dns-fix.ts` | No | Ping/resolve `rpc.mainnet.chain.robinhood.com` |

### Contracts

| Testnet Resource | Mainnet Resource | Action | Approval? | Verification |
|---|---|---|---|---|
| IdentityRegistry @ `0x66399E25...` (testnet) | Canonical ERC-8004 @ `0x8004A169FB4a3325136EB29fA0ceB6D2e539a432` (mainnet) | **Verified on Mainnet** (No deployment needed). Function `register(string)` and `setAgentWallet(uint256, address)` active. | No (Already deployed) | Verified via mainnet RPC call + gas estimation |
| DecisionRegistry @ `0x7Ae7f962...` (testnet) | DecisionRegistry @ `TBD` (mainnet) | **REQUIRES DEPLOYMENT** (`contracts/DecisionRegistry.sol`) | **YES — REQUIRED** | Deploy, then call `commitDecision()` on mainnet |

### Identity (ERC-8004)

| Testnet Resource | Mainnet Resource | Action | Approval? | Verification |
|---|---|---|---|---|
| Agent ID `5` (testnet registry) | Agent ID `?` (mainnet registry) | Call `register()` after IdentityRegistry deployed | **YES — REQUIRED** | Read `agentId` from tx event |
| Registration TX `0x651f38...` | New mainnet TX | Update `identity/data.ts` after registration | No (code only) | Check Blockscout explorer |
| `registrationNetwork: ROBINHOOD CHAIN TESTNET` | `registrationNetwork: ROBINHOOD CHAIN` | Update `identity/data.ts` | No | Visual check identity page |

### Wallet / Smart Account

| Testnet Resource | Mainnet Resource | Action | Approval? | Verification |
|---|---|---|---|---|
| Primary Wallet `0x1Ba1BBeC...` (MetaMask EOA) | Same Primary Wallet `0x1Ba1BBeC...` | Reused as mainnet agent wallet | Approved | Public reference in UI + linked via `setAgentWallet()` onchain |
| Server Signer `0xB635eFd...` | Same Server Signer `0xB635eFd...` | Preserved as backend relayer | Approved | Signs automated `commitDecision()` calls |
| `NEXT_PUBLIC_GLYPH_WALLET_ADDRESS` | `0x1Ba1BBeC38CAf4454252f8Bd87245a41919dd27C` | Already configured in ENV | No change | Verify UI shows correct address |

### Environment Variables

| Variable | Testnet Value | Mainnet Value | Change Required |
|---|---|---|---|
| `NEXT_PUBLIC_CHAIN_ID` | `46630` | `4663` | YES |
| `NEXT_PUBLIC_RPC_URL` | `https://rpc.testnet.chain.robinhood.com` | `https://rpc.mainnet.chain.robinhood.com` | YES |
| `BLOCK_EXPLORER_URL` | `https://explorer.testnet.chain.robinhood.com` | `https://robinhoodchain.blockscout.com` | YES |
| `IDENTITY_REGISTRY_CONTRACT_ADDRESS` | `0x66399E25D3FBb5De462d06dE835D07B2957060D2` | TBD (after deploy) | YES |
| `DECISION_REGISTRY_CONTRACT_ADDRESS` | `0x7Ae7f962DC15e65De46a5b4d43744C7ed750B525` | TBD (after deploy) | YES |
| `NEXT_PUBLIC_GLYPH_WALLET_ADDRESS` | `0x1Ba1BBeC38CAf4454252f8Bd87245a41919dd27C` | TBD (after wallet creation) | YES |
| `GLYPH_AGENT_ID` | `5` | TBD (after registration) | YES |
| `NEXT_PUBLIC_GLYPH_AGENT_ID` | `5` | TBD (after registration) | YES |
| `SMART_ACCOUNT_OWNER_PRIVATE_KEY` | (current key) | Same key — no change | NO |
| `DATABASE_URL` | Supabase | Same — no change | NO |
| `OPENROUTER_API_KEY` | (current) | Same — no change | NO |
| `CRON_SECRET` | (current) | Same — no change | NO |
| All market data keys | (current) | Same — no change | NO |

---

## Required Code Changes

### CRITICAL — Must change before mainnet works

#### 1. `src/lib/onchain/registry.ts`

**What:** Rename `robinhoodTestnet` → `robinhoodMainnet`, update chain definition.

```ts
// BEFORE
export const robinhoodTestnet = defineChain({
  id: 46630,
  name: "Robinhood Chain Testnet",
  rpcUrls: {
    default: { http: [process.env.NEXT_PUBLIC_RPC_URL || "https://rpc.testnet.chain.robinhood.com"] }
  },
  blockExplorers: {
    default: { name: "Blockscout", url: process.env.BLOCK_EXPLORER_URL || "https://explorer.testnet.chain.robinhood.com" }
  }
});

// AFTER
export const robinhoodMainnet = defineChain({
  id: parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || "4663"),
  name: "Robinhood Chain",
  rpcUrls: {
    default: { http: [process.env.NEXT_PUBLIC_RPC_URL || "https://rpc.mainnet.chain.robinhood.com"] }
  },
  blockExplorers: {
    default: { name: "Blockscout", url: process.env.BLOCK_EXPLORER_URL || "https://robinhoodchain.blockscout.com" }
  }
});
```

Also update L124 to remove hardcoded DecisionRegistry fallback address.
Also update all references from `robinhoodTestnet` → `robinhoodMainnet` (L136, L141).

**Risk:** HIGH — Core onchain client. Must be done with correct contract address.

---

#### 2. `src/lib/activity.ts` (L371)

**What:** Replace hardcoded chainId with ENV value.

```ts
// BEFORE
chainId: 46630,

// AFTER
chainId: parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || "4663"),
```

**Risk:** HIGH — ActivityLog stores wrong chain ID for all onchain proof records.

---

#### 3. `src/features/identity/data.ts`

**What:** Update all testnet references after mainnet registration is complete.

Fields to update: `network.name`, `network.chainId`, `registrationTx`,
`registrationNetwork`, `explorerBaseUrl`.

**Risk:** HIGH — Identity page shows wrong network info.

**Timing:** Must be done AFTER mainnet IdentityRegistry is deployed and
Glyph is registered.

---

#### 4. `prisma/schema.prisma`

**What:** Update `@default(46630)` → `@default(4663)` in `AgentWallet` and
`Transaction` models.

**Risk:** MEDIUM — Only affects NEW records. Existing records retain their
original chainId (which is correct for historical data).

A Prisma migration must be run after schema change:
```
npx prisma migrate dev --name mainnet-chain-id-defaults
```

**Note:** This must NOT reset existing data.

---

#### 5. `src/lib/dns-fix.ts`

**What:** Verify that bypass IPs work for `rpc.mainnet.chain.robinhood.com`.

The hostname check `hostname.includes("robinhood.com")` will still match mainnet.
However, the hardcoded IPs `104.20.46.209`, `172.66.147.70` must be verified
for the mainnet RPC hostname (may resolve to same Cloudflare IPs).

**Risk:** MEDIUM — If IPs differ, onchain transactions fail on Indonesian ISPs.

---

### MEDIUM — UI display fixes

#### 6. `src/features/life/components/LifeLogSection.tsx` (L380, L568)
#### 7. `src/features/life/components/LifeLogItem.tsx` (L125)

**What:** Replace hardcoded `https://explorer.testnet.chain.robinhood.com/tx/` with
`getExplorerTxUrl()` from `@/lib/onchain/registry`.

These components already call `getExplorerTxUrl` in some places but still have
3 hardcoded instances.

---

### LOW — Label/text updates

8. `src/features/trades/queries.ts` L32 — `"TESTNET // 46630"` → `"MAINNET // 4663"`
9. `src/features/about/data.ts` L38, L155 — chain ID and description text
10. `src/features/identity/components/IdentitySection.tsx` L41 — `CHAIN 46630`
11. `src/features/about/components/AboutSection.tsx` L50 — `ROBINHOOD TESTNET 46630`
12. `src/features/trades/components/TradesSection.tsx` L295 — `ROBINHOOD TESTNET // 46630`
13. `src/features/landing/components/Hero.tsx` L1369 — `ROBINHOOD TESTNET // 46630`
14. `src/features/landing/components/Reputation.tsx` L210 — `46630`
15. `src/features/life/components/LifeLogSection.tsx` L738 — `ROBINHOOD TESTNET // 46630`

---

## Gas Requirements & Estimation (Robinhood Chain Mainnet)

| Operation | Gas Limit (Est.) | Base Fee / Gas Price | Estimated Cost (ETH) | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **1. Deploy `DecisionRegistry.sol`** | ~150,000 gas | ~0.0525 Gwei + L1 calldata | ~0.00006 ETH | Simple contract, no dependencies |
| **2. Identity `register(agentURI)`** | ~135,000 gas | ~0.0525 Gwei + L1 calldata | ~0.00006 ETH | Simulated on live RPC: 134,804 gas |
| **3. `setAgentWallet(agentId, wallet)`** | ~45,000 gas | ~0.0525 Gwei | ~0.00001 ETH | Mapping update in IdentityRegistry |
| **4. Operational `commitDecision`** | ~50,000 gas/cycle | ~0.0525 Gwei | ~0.00001 ETH/cycle | ~0.0003 ETH for 30 daily cycles |
| **Total Buffer Recommended** | — | — | **0.002 – 0.005 ETH** | Ample buffer (~$5–$15 USD) for months of cycles |

> **Current Deployer Status:**
> - EOA Address: `0xB635eFd761D352ed8a74166a292c8969AD541c8E`
> - Mainnet Balance: `0.0 ETH`
> - Nonce: `0`
> - Funding required before Step 4. **STOP: Awaiting Human Approval before funding.**

---

## Deployment Order

This order must be followed exactly. Each step depends on the previous.

```
Step 1 — Verify mainnet RPC connectivity & DNS bypass
  └── [COMPLETED in Phase 3] eth_chainId returns 4663 (0x1237), block ~69.5M

Step 2 — Audit onchain contracts
  └── [COMPLETED in Phase 3]
      - Canonical ERC-8004 IdentityRegistry ALREADY DEPLOYED: 0x8004A169FB4a3325136EB29fA0ceB6D2e539a432
      - DecisionRegistry NOT DEPLOYED: Marked as REQUIRES DEPLOYMENT

Step 3 — Fund deployer EOA with minimal mainnet gas (0.002 - 0.005 ETH)
  └── REQUIRES EXPLICIT APPROVAL (involves real ETH funding)
  └── Verify balance on mainnet RPC

Step 4 — Deploy DecisionRegistry.sol to mainnet
  └── REQUIRES EXPLICIT APPROVAL
  └── Record deployed address to DECISION_REGISTRY_CONTRACT_ADDRESS

Step 5 — Register Glyph identity on canonical IdentityRegistry
  └── REQUIRES EXPLICIT APPROVAL (involves mainnet tx)
  └── Calls register("/agents/glyph.json") on 0x8004A169FB4a3325136EB29fA0ceB6D2e539a432
  └── Record new Agent ID and registrationTx

Step 6 — Configure mainnet Smart Account / Wallet
  └── REQUIRES EXPLICIT APPROVAL
  └── Record new wallet address to NEXT_PUBLIC_GLYPH_WALLET_ADDRESS

Step 7 — Update ENV variables & database Agent record
  └── Non-destructive config update
  └── Set NEXT_PUBLIC_CHAIN_ID=4663

Step 8 — Controlled mainnet test (Phase 11)
  └── REQUIRES EXPLICIT APPROVAL
  └── Run exactly 1 cycle in paper trading mode
  └── Verify decision hash committed on mainnet Blockscout

Step 9 — Resume cron-job.org (Phase 12 Go Live)
  └── REQUIRES EXPLICIT APPROVAL
```

---

## Rollback Strategy

If any step fails:

| Scenario | Rollback Action |
|---|---|
| Code change breaks build | `git revert` on migration branch, redeploy testnet config |
| Wrong contract deployed | Deploy new contract, update ENV — old contract abandoned |
| Wrong agent ID registered | Register again (creates new ID), use new ID |
| Smart account misconfigured | Create new safe, update ENV |
| Mainnet ENV accidentally deployed to production | Restore testnet ENV, redeploy immediately |
| Database record corrupted | Restore from `backup.sql` taken in Phase 0 |

**Critical rollback note:** The `feat/mainnet-migration` branch exists separately from
`main`. If migration fails, `main` branch still has full working testnet configuration.
Rollback = revert Vercel deployment to last `main` commit.

---

## Verification Steps

After each deployment step:

| Step | Verification Method |
|---|---|
| RPC connectivity | `curl -X POST https://rpc.mainnet.chain.robinhood.com -d '{"method":"eth_chainId","params":[],"id":1,"jsonrpc":"2.0"}'` → returns `0x1237` |
| Contract deployment | Contract appears on Blockscout, ABI verified |
| Smart account creation | Address visible on Blockscout, owner matches EOA |
| Identity registration | Event `AgentRegistered` visible on Blockscout |
| ENV update | `NEXT_PUBLIC_CHAIN_ID=4663` in Vercel/production config |
| Code deployment | Build passes, `npm run build` succeeds |
| Glyph onchain commit | Tx hash visible on `robinhoodchain.blockscout.com` |

---

## What Does NOT Change

| System | Reason |
|---|---|
| Paper trading engine | Fully simulated — network-agnostic |
| Decision engine (LLM) | Calls OpenRouter — network-agnostic |
| Policy engine | Deterministic logic — network-agnostic |
| Research pipeline | Market data APIs — network-agnostic |
| Memory/Reputation | Database-only — network-agnostic |
| Supabase database | Same instance — data preserved |
| Historical records | Never touched — preserved completely |
| CRON_SECRET | Not network-specific |
| Market data API keys | Not network-specific |
| OpenRouter API key | Not network-specific |

---

## Open Questions for Human Approval

Before Phase 3 can begin, the following must be confirmed:

1. **Confirm Robinhood Chain Mainnet (Chain ID 4663) is the correct target.**
   Chain launched July 1, 2026. Verify at `https://robinhoodchain.blockscout.com`.

2. **Confirm contracts must be newly deployed (not reused).**
   Are there existing IdentityRegistry / DecisionRegistry contracts on mainnet
   that Glyph can use instead of deploying new ones?

3. **Confirm gas funding source.**
   Who provides the ETH for mainnet gas? How much is available?

4. **Confirm DNS bypass IPs for mainnet.**
   Verify whether `104.20.46.209`, `172.66.147.70` resolve correctly for
   `rpc.mainnet.chain.robinhood.com`, or if different IPs are needed.

5. **Confirm cron disable during migration.**
   cron-job.org schedule must be paused during Phase 3–11.

---

## STOP

This plan is complete.

Do NOT execute Phase 3 until explicit human approval is received.

Approval must confirm:
- Target mainnet (Robinhood Chain, Chain ID 4663) is correct
- Contract deployment is approved in principle
- The operator has sufficient mainnet ETH for gas
- The cron will be disabled during migration
