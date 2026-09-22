# GLYPH — PHASE 1 AUDIT REPORT
# Testnet → Mainnet Codebase Analysis

Created: 2026-09-22
Branch: feat/mainnet-migration
Status: COMPLETE — Awaiting human review before Phase 2 execution.

---

## A. Current Testnet Configuration

| Parameter | Value |
|---|---|
| Network Name | Robinhood Chain Testnet |
| Chain ID | `46630` |
| RPC URL | `https://rpc.testnet.chain.robinhood.com` |
| Block Explorer | `https://explorer.testnet.chain.robinhood.com` |
| Identity Registry Contract | `0x66399E25D3FBb5De462d06dE835D07B2957060D2` |
| Decision Registry Contract | `0x7Ae7f962DC15e65De46a5b4d43744C7ed750B525` |
| Glyph Agent ID (ERC-8004) | `5` |
| Smart Account (Wallet) | `0x1Ba1BBeC38CAf4454252f8Bd87245a41919dd27C` |
| Registration Tx | `0x651f3838a424c489bbb1f5792f8c20c2346d8cf542a604ce4853a07381b138da` |
| Genesis Block | `121,888,511` |
| Blockchain Stack | Ethereum L2 (Arbitrum Nitro) |
| DNS Bypass IPs | `104.20.46.209`, `172.66.147.70` (ISP bypass for Telkomsel/Indihome) |

---

## B. Testnet Dependencies Found

### B1. Hardcoded Chain ID `46630`

| File | Line | Context |
|---|---|---|
| `src/lib/onchain/registry.ts` | L20 | `id: 46630` in `defineChain()` — **CRITICAL** |
| `src/lib/activity.ts` | L371 | `chainId: 46630` in ActivityLog data payload |
| `src/features/identity/data.ts` | L42 | `chainId: 46630` in identity data object |
| `src/features/trades/queries.ts` | L32 | `networkChain: "TESTNET // 46630"` in UI label |
| `src/features/trades/components/TradesSection.tsx` | L295 | `NETWORK: ROBINHOOD TESTNET // 46630` — UI display |
| `src/features/landing/components/Reputation.tsx` | L210 | `46630` in UI display |
| `src/features/landing/components/Hero.tsx` | L1369 | `NETWORK: ROBINHOOD TESTNET // 46630` — UI display |
| `src/features/life/components/LifeLogSection.tsx` | L738 | `NETWORK: ROBINHOOD TESTNET // 46630` — UI display |
| `src/features/identity/components/IdentitySection.tsx` | L41 | `CHAIN 46630` — UI display |
| `src/features/about/components/AboutSection.tsx` | L50 | `ROBINHOOD TESTNET 46630` — UI display |
| `src/features/about/data.ts` | L38, L155 | `Chain ID: 46630` in about data |
| `prisma/schema.prisma` | (AgentWallet, Transaction) | `@default(46630)` in DB schema defaults |

### B2. Hardcoded Testnet RPC URL

| File | Line | Context |
|---|---|---|
| `src/lib/onchain/registry.ts` | L27 | Hardcoded fallback: `https://rpc.testnet.chain.robinhood.com` |

### B3. Hardcoded Testnet Contract Addresses

| File | Line | Context |
|---|---|---|
| `src/lib/onchain/registry.ts` | L124 | DecisionRegistry fallback: `0x7Ae7f962...` |

Note: `IDENTITY_REGISTRY_CONTRACT_ADDRESS` is only in ENV (no hardcoded fallback — SAFE).

### B4. Hardcoded Testnet Explorer URLs

| File | Line | Context |
|---|---|---|
| `src/lib/onchain/registry.ts` | L36, L77 | `https://explorer.testnet.chain.robinhood.com` (2 occurrences) |
| `src/features/life/components/LifeLogSection.tsx` | L380, L568 | Hardcoded explorer URL in JSX links |
| `src/features/life/components/LifeLogItem.tsx` | L125 | Hardcoded explorer URL in JSX link |
| `src/features/identity/data.ts` | L55 | `explorerBaseUrl` hardcoded to testnet |

### B5. Testnet-Only DNS Bypass

| File | Line | Context |
|---|---|---|
| `src/lib/dns-fix.ts` | L4, L12 | Hardcoded IPs `104.20.46.209`, `172.66.147.70` for `robinhood.com` hostname — ISP bypass |

> **Note:** This file may need updating for mainnet since RPC domain changes from
> `rpc.testnet.chain.robinhood.com` to `rpc.mainnet.chain.robinhood.com`.
> The bypass logic uses `hostname.includes("robinhood.com")` which will still
> match — but the target IPs may differ for mainnet.

### B6. Testnet-Specific Identity Data

| File | Field | Value |
|---|---|---|
| `src/features/identity/data.ts` | `network.name` | `"Robinhood Chain Testnet"` |
| `src/features/identity/data.ts` | `registrationNetwork` | `"ROBINHOOD CHAIN TESTNET"` |
| `src/features/identity/data.ts` | `registrationTx` | `0x651f3838...` (testnet tx) |
| `src/features/identity/data.ts` | `explorerBaseUrl` | testnet explorer URL |
| `src/features/about/data.ts` | description | `"Anchored to Robinhood Chain Testnet (Chain ID 46630)"` |

### B7. Testnet-Only Logic

| File | Logic |
|---|---|
| `src/lib/dns-fix.ts` | DNS bypass specifically for `robinhood.com` — works for testnet domain |
| `src/lib/onchain/registry.ts` | `const robinhoodTestnet = defineChain({...})` — name is "Testnet" specific |
| `src/features/about/components/AboutSection.tsx` | `ROBINHOOD TESTNET 46630` UI label |

---

## C. Mainnet Requirements

| Requirement | Value |
|---|---|
| Network Name | Robinhood Chain (Mainnet) |
| Chain ID | `4663` |
| RPC URL | `https://rpc.mainnet.chain.robinhood.com` |
| Block Explorer | `https://robinhoodchain.blockscout.com` |
| Identity Registry Contract | **Must be deployed to mainnet** |
| Decision Registry Contract | **Must be deployed to mainnet** |
| Glyph Smart Account | **Must be created/derived on mainnet** |
| Glyph Agent ID | **Must be registered on mainnet IdentityRegistry** |
| DNS bypass IPs | **Must be verified for mainnet RPC hostname** |

---

## D. Reusable Resources

These resources require NO changes for mainnet:

| Resource | Reason |
|---|---|
| Database (Supabase) | Chain-agnostic, stores data from any network |
| Prisma schema (structure) | Only default values need updating |
| LLM (OpenRouter + GPT-4.1-mini) | Chain-agnostic |
| Market data APIs (Alpha Vantage, StockFit, Twelve Data) | Chain-agnostic |
| CRON_SECRET | Not network-specific |
| Paper trading engine | Fully simulated, no network calls |
| Decision engine (LLM logic) | Chain-agnostic |
| Policy engine | Chain-agnostic |
| Research pipeline | Chain-agnostic |
| Memory / Reputation system | Chain-agnostic |
| Smart Account owner EOA key | Same key can own mainnet wallet |
| Contract source code | `DecisionRegistry.sol` and `IdentityRegistry.sol` are chain-agnostic Solidity |

---

## E. Resources Requiring Recreation on Mainnet

| Resource | Action |
|---|---|
| `IDENTITY_REGISTRY_CONTRACT_ADDRESS` | Deploy `IdentityRegistry.sol` to mainnet, record new address |
| `DECISION_REGISTRY_CONTRACT_ADDRESS` | Deploy `DecisionRegistry.sol` to mainnet, record new address |
| Glyph Agent ID | Call `register()` on mainnet IdentityRegistry → new agent ID |
| Smart Account address | Derive or create new Safe smart account on mainnet chain |
| `NEXT_PUBLIC_GLYPH_WALLET_ADDRESS` | Update to mainnet smart account address |
| Registration Tx hash | New mainnet registration tx will replace testnet tx in `identity/data.ts` |
| DNS bypass IPs | Verify correct IPs for `rpc.mainnet.chain.robinhood.com` |

---

## F. Files Requiring Modification

### CRITICAL — Must change for mainnet to work

| File | What Changes | Risk |
|---|---|---|
| `src/lib/onchain/registry.ts` | Rename `robinhoodTestnet` → `robinhoodMainnet`, update `id`, `name`, fallback RPC, fallback explorer | **HIGH** — core onchain client |
| `src/lib/activity.ts` | L371: Replace hardcoded `chainId: 46630` with `process.env.NEXT_PUBLIC_CHAIN_ID` | **HIGH** — activity log stores wrong chain ID |
| `src/features/identity/data.ts` | Update `network.name`, `chainId`, `registrationNetwork`, `registrationTx`, `explorerBaseUrl` | **HIGH** — identity page shows testnet info |
| `prisma/schema.prisma` | Update `@default(46630)` → `@default(4663)` in `AgentWallet` and `Transaction` models | **MEDIUM** — only affects new records |
| `.env` (production) | Update 7 network-specific variables | **HIGH** — entire network config |

### MEDIUM — Must change for correct UI display

| File | What Changes | Risk |
|---|---|---|
| `src/features/life/components/LifeLogSection.tsx` | L380, L568: Replace hardcoded testnet explorer URL with ENV-based URL | **MEDIUM** — broken links in Life Log |
| `src/features/life/components/LifeLogItem.tsx` | L125: Replace hardcoded testnet explorer URL | **MEDIUM** — broken links |
| `src/features/trades/queries.ts` | L32: Update `"TESTNET // 46630"` label | **LOW** — UI label only |
| `src/features/about/data.ts` | L38, L155: Update chain ID references and description | **LOW** — UI text only |
| `src/features/identity/components/IdentitySection.tsx` | L41: Update `CHAIN 46630` label | **LOW** — UI label only |
| `src/features/about/components/AboutSection.tsx` | L50: Update `ROBINHOOD TESTNET 46630` label | **LOW** — UI label only |

### LOW — May need updating

| File | What Changes | Risk |
|---|---|---|
| `src/lib/dns-fix.ts` | Verify bypass IPs work for mainnet RPC hostname | **LOW** — may cause RPC failures on some ISPs if IPs differ |
| `src/features/trades/components/TradesSection.tsx` | L295: Update network label | **LOW** — UI only |
| `src/features/landing/components/Hero.tsx` | L1369: Update network label | **LOW** — UI only |
| `src/features/landing/components/Reputation.tsx` | L210: Update chain ID display | **LOW** — UI only |
| `src/features/life/components/LifeLogSection.tsx` | L738: Update network label | **LOW** — UI only |

---

## G. Database Impact

**Schema changes required:** YES (minor — default values only)

| Model | Field | Current Default | New Default |
|---|---|---|---|
| `AgentWallet` | `chainId` | `@default(46630)` | `@default(4663)` |
| `Transaction` | `chainId` | `@default(46630)` | `@default(4663)` |

**Data changes required:**

| Table | Action |
|---|---|
| `agent_wallets` | Update `walletAddress`, `chainId`, `network` for Glyph agent record |
| All other tables | NO changes — historical records are chain-agnostic |

**Critical:** Historical `decisions`, `trades`, `research_snapshots`, `memories`, `reputation_metrics`, `economic_events` MUST NOT be touched.

---

## H. Security Risks

| Risk | Severity | Mitigation |
|---|---|---|
| Private key re-use on mainnet | HIGH | Same key owns mainnet account — do NOT rotate key, just deploy new smart account |
| Accidentally committing mainnet `.env` | CRITICAL | `.gitignore` already excludes `.env` — verify before any push |
| Hardcoded DecisionRegistry fallback in registry.ts | HIGH | Must be removed or replaced — if ENV is missing, code will use testnet contract on mainnet |
| Hardcoded testnet explorer URLs in Life Log | MEDIUM | All links will point to wrong network |
| DNS bypass IP mismatch on mainnet | MEDIUM | Verify Cloudflare IPs for mainnet RPC hostname |
| testnet registration TX stored in identity/data.ts | LOW | Will show testnet tx on public identity page |

---

## I. Migration Risks

| Risk | Impact | Probability |
|---|---|---|
| Mainnet contracts not yet deployed | Onchain proof fails completely | HIGH — must be done before go-live |
| Prisma schema default value migration | New records get wrong chainId if schema not updated | MEDIUM |
| DNS bypass fails for mainnet RPC | Onchain transactions fail on Indonesian ISPs | MEDIUM |
| Life Log explorer links broken post-migration | Historical links broken | LOW — links still point to testnet for historical records, which is correct |
| DNS caching of old IPs | RPC calls fail temporarily | LOW |

---

## J. Unknowns

| Unknown | Impact |
|---|---|
| **Target mainnet confirmed?** The search results indicate Robinhood Chain Mainnet launched July 1, 2026 with Chain ID `4663`. This must be confirmed by the operator before Phase 2 proceeds. | CRITICAL |
| **Are mainnet contracts already deployed?** IdentityRegistry and DecisionRegistry may or may not exist on Robinhood Chain Mainnet. This cannot be confirmed from the codebase alone — needs manual check via block explorer. | HIGH |
| **DNS bypass IPs for mainnet.** The IPs `104.20.46.209`, `172.66.147.70` work for testnet. Mainnet RPC may resolve to different Cloudflare IPs. Needs manual DNS resolution. | MEDIUM |
| **Mainnet gas availability.** The smart account needs ETH on mainnet for gas. Amount unknown without estimating actual transaction costs on mainnet. | MEDIUM |
| **Glyph Agent ID on mainnet.** The testnet Agent ID is `5`. The mainnet Agent ID will be different (depends on who registers first on the mainnet IdentityRegistry). | LOW |

---

## Summary

| Category | Count |
|---|---|
| Critical files to modify | 5 |
| Medium-priority UI files | 7 |
| Hardcoded chain IDs found | 12 locations |
| Hardcoded testnet RPC/Explorer fallbacks | 4 locations |
| Resources reusable as-is | 11 |
| Resources requiring recreation | 7 |
| Confirmed unknowns | 5 |

---

STOP — Human review required before Phase 2.
