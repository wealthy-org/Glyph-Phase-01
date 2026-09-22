# GLYPH — TESTNET → MAINNET MIGRATION

## 1. OBJECTIVE

Migrate the existing Glyph Phase 01 application from its current
testnet environment to the target mainnet environment.

The migration must preserve the existing Glyph Phase 01 architecture,
business logic, database structure, and paper-trading behavior.

### Final State

Current:

Testnet + Paper Trading

Target:

Mainnet + Paper Trading

IMPORTANT:

Moving Glyph to mainnet does NOT mean enabling real-money trading.

Glyph must continue to simulate trades using the existing paper-trading
system.

---

# 2. NON-NEGOTIABLE RULES

These rules apply to every phase.

## Architecture

- Do NOT redesign Glyph architecture.
- Do NOT refactor unrelated code.
- Do NOT remove existing functionality.
- Do NOT introduce new features unrelated to the migration.
- Do NOT change the existing decision lifecycle unless the migration
  technically requires it.

## Database

- Do NOT reset the database.
- Do NOT delete existing records.
- Do NOT delete ResearchSnapshot records.
- Do NOT delete Decision records.
- Do NOT delete Trade records.
- Do NOT delete Glyph memory or reputation history.
- Do NOT modify the database schema unless technically required.
- If schema modification appears necessary, STOP and request approval.

## Security

- Never expose private keys.
- Never print secrets in reports.
- Never commit secrets.
- Never copy production secrets into source code.
- Never commit `.env` files containing secrets.

## Mainnet Actions

The following actions require explicit human approval:

- Deploying a mainnet contract
- Sending a mainnet transaction
- Funding a mainnet wallet
- Registering a mainnet identity
- Changing production wallet configuration
- Enabling autonomous mainnet execution
- Enabling the production cron

AI must NOT perform these actions automatically.

## Network Isolation

- Testnet and mainnet configurations must remain clearly separated.
- Production must not accidentally use testnet RPCs.
- Production must not accidentally use testnet contracts.
- Production must not accidentally use testnet wallet addresses.
- Production must not accidentally use testnet identities.
- Do NOT assume a testnet resource can be reused on mainnet.
- Explicitly determine which resources must be recreated.

## Scope

The migration concerns network/infrastructure configuration.

The following existing Glyph behavior must remain unchanged:

Market Data
→ Research
→ Historical Research Context
→ Decision
→ Zod Validation
→ Policy Engine
→ Paper Trade
→ Onchain Proof
→ Memory / Reputation

---

# 3. EXECUTION PROTOCOL

AI MUST follow this order:

Phase 0
→ Phase 1
→ STOP

Human review

Phase 2
→ STOP

Human approval

Phase 3+
→ Execute approved migration

AI must NOT skip phases.

AI must NOT continue past a STOP point without explicit approval.

If unexpected behavior or ambiguity is discovered:

STOP
→ Explain the issue
→ Explain the risk
→ Propose options
→ Wait for approval

---

# PHASE 0 — PRE-MIGRATION SNAPSHOT

## Objective

Record the current working testnet state before modifying anything.

## Tasks

- [x] Create migration branch — `feat/mainnet-migration` (2026-09-22)
- [x] Record current Git commit — `dc2b2f8b55e938d99436bc36e64ea84730dea919`
- [x] Confirm current branch state — on `main`, 1 commit ahead of origin
- [x] Confirm working tree state — only migration docs modified
- [x] Confirm Glyph currently builds — `npm run dev` running ✓
- [x] Confirm Glyph currently runs on testnet — dev server active ✓
- [ ] Confirm database backup exists — ⚠️ Take fresh backup from Supabase before Phase 1
- [x] Record current testnet chain — Robinhood Chain Testnet
- [x] Record current chain ID — `46630`
- [x] Record current RPC configuration — `https://rpc.testnet.chain.robinhood.com`
- [x] Record current explorer — `https://explorer.testnet.chain.robinhood.com`
- [x] Record current contract addresses — IdentityRegistry + DecisionRegistry recorded
- [x] Record current wallet/smart account address — `0x1Ba1BBeC38CAf4454252f8Bd87245a41919dd27C`
- [x] Record current ERC-8004 identity — Agent ID: `5`
- [x] Record network-related environment variable names — all 22 keys recorded
- [x] Redact all secrets in the snapshot — secrets redacted in PHASE0_SNAPSHOT.md
- [x] Create `docs/PHASE0_SNAPSHOT.md` — created 2026-09-22
- [x] Commit the snapshot — commit `2938e27` on `feat/mainnet-migration`

## Restrictions

Do NOT:

- modify application logic
- deploy anything
- send mainnet transactions
- modify production database
- change production ENV
- rotate production wallets

## Deliverable

Create:

`docs/PHASE0_SNAPSHOT.md`

The snapshot must describe the current testnet state without exposing
secrets.

## STOP

After Phase 0, report the result and STOP.

---

# PHASE 1 — CODEBASE AUDIT

## Objective

Identify every part of the codebase that depends on the current
testnet environment.

This phase is AUDIT ONLY.

No migration should be performed yet.

## Network Audit

- [x] Identify current testnet network — Robinhood Chain Testnet
- [x] Identify chain ID — `46630` (hardcoded in 10+ locations)
- [x] Identify RPC configuration — `src/lib/onchain/registry.ts` + ENV
- [x] Identify explorer configuration — `src/lib/onchain/registry.ts` + ENV
- [x] Identify contract addresses — `src/lib/onchain/registry.ts` (hardcoded fallback)
- [x] Identify wallet configuration — `src/lib/onchain/registry.ts` reads `SMART_ACCOUNT_OWNER_PRIVATE_KEY`
- [x] Identify smart account configuration — `createWalletClient` + `privateKeyToAccount` in registry.ts
- [x] Identify ERC-8004 configuration — `src/features/identity/data.ts` (hardcoded explorerBaseUrl)
- [x] Identify cron configuration — `src/app/api/cron/glyph-cycle/route.ts` reads `CRON_SECRET`
- [x] Identify network-specific ENV variables — `NEXT_PUBLIC_CHAIN_ID`, `NEXT_PUBLIC_RPC_URL`, `BLOCK_EXPLORER_URL`, `IDENTITY_REGISTRY_CONTRACT_ADDRESS`, `DECISION_REGISTRY_CONTRACT_ADDRESS`, `SMART_ACCOUNT_OWNER_PRIVATE_KEY`, `NEXT_PUBLIC_GLYPH_WALLET_ADDRESS`

## Hardcoded Configuration Audit

Search the entire repository for:

- [x] Testnet chain IDs — found in 10 files (registry.ts, activity.ts, UI components, Prisma schema defaults)
- [x] Testnet RPC URLs — found in `src/lib/onchain/registry.ts` L27 (hardcoded fallback)
- [x] Testnet contract addresses — found in `src/lib/onchain/registry.ts` L124 (hardcoded fallback for DecisionRegistry)
- [x] Testnet explorer URLs — found in 5 files (registry.ts, LifeLogSection.tsx x2, LifeLogItem.tsx, identity/data.ts)
- [x] Testnet wallet addresses — UI display only via `NEXT_PUBLIC_GLYPH_WALLET_ADDRESS` ENV (safe)
- [x] Testnet ERC-8004 references — `src/features/identity/data.ts` L55 (hardcoded explorerBaseUrl)
- [x] Testnet-specific environment variables — all identified (see Network Audit above)
- [x] Testnet-only conditionals — `src/lib/dns-fix.ts` checks `robinhood.com` hostname
- [x] Testnet-only deployment scripts — none found
- [x] Testnet-only contract configuration — Levera Protocol contracts are DORMANT/empty

## Dependency Audit

Identify:

- [x] Resources that can remain unchanged — DB, LLM, market data APIs, cron secret, paper trade logic
- [x] Resources that can be reused — same owner EOA key can derive mainnet smart account
- [x] Resources that must be recreated on mainnet — chain config, RPC, contracts, identity, wallet address
- [x] Resources that require new addresses — IdentityRegistry, DecisionRegistry, smart account
- [x] Resources that require new ENV variables — 7 network-specific ENVs need mainnet values
- [x] Resources that require code changes — 5 files with hardcoded testnet values

## Critical Glyph Logic Audit

Verify that the following are NOT accidentally tied to testnet:

- [x] Research pipeline — not tied to testnet (uses market data API, chain-agnostic)
- [x] ResearchSnapshot — not tied to testnet (DB records only)
- [x] Historical research context — not tied to testnet (DB query by asset)
- [x] Decision engine — not tied to testnet (LLM call, chain-agnostic)
- [x] Policy Engine — not tied to testnet (deterministic logic, no network calls)
- [x] Paper trading — not tied to testnet (simulated, no onchain calls)
- [x] Memory — not tied to testnet (DB records only)
- [x] Reputation — not tied to testnet (DB records only)
- [x] Life Log — ⚠️ contains hardcoded testnet explorer URL in 3 components

## Required Deliverable

Create:

`docs/PHASE1_AUDIT.md`

The report MUST contain:

### A. Current Testnet Configuration

What Glyph currently uses.

### B. Testnet Dependencies

Every testnet dependency found.

### C. Mainnet Requirements

What must exist on mainnet.

### D. Reusable Resources

What can remain conceptually unchanged.

### E. Resources Requiring Recreation

What must be newly created on mainnet.

### F. Files Requiring Changes

List exact files and why they need modification.

### G. Database Impact

Explain whether database changes are required.

### H. Security Risks

Identify potential risks.

### I. Migration Risks

Identify anything that could break during migration.

### J. Unknowns

Explicitly list anything that cannot be determined from the codebase.

Do NOT guess.

## Restrictions

During Phase 1:

- Do NOT modify source code.
- Do NOT modify database.
- Do NOT modify production ENV.
- Do NOT deploy contracts.
- Do NOT create mainnet resources.
- Do NOT send transactions.

## STOP

After `PHASE1_AUDIT.md` is complete:

~~STOP.~~

`docs/PHASE1_AUDIT.md` — COMPLETE (2026-09-22). Human approved Phase 2.

---

# PHASE 2 — MAINNET MIGRATION PLAN

## Objective

Convert the Phase 1 audit into an exact implementation plan.

Do NOT execute the migration yet.

## Tasks

- [x] Define target mainnet — Robinhood Chain Mainnet
- [x] Define target chain ID — `4663`
- [x] Define mainnet RPC — `https://rpc.mainnet.chain.robinhood.com`
- [x] Define mainnet explorer — `https://robinhoodchain.blockscout.com`
- [x] Define mainnet wallet strategy — same EOA owner, new mainnet smart account
- [x] Define mainnet smart account strategy — derive new Safe on chain `4663`
- [x] Define mainnet ERC-8004 identity strategy — deploy IdentityRegistry to mainnet, call register()
- [x] Identify required contracts — IdentityRegistry + DecisionRegistry
- [x] Identify contracts that need deployment — both must be deployed to mainnet
- [x] Define required ENV variables — 7 network-specific vars updated
- [x] Define required code changes — 5 critical files + 7 UI files
- [x] Define deployment order — see PHASE2_MAINNET_PLAN.md
- [x] Define verification steps — see PHASE2_MAINNET_PLAN.md
- [x] Define rollback strategy — see PHASE2_MAINNET_PLAN.md

## Required Deliverable

Create:

`docs/PHASE2_MAINNET_PLAN.md`

The plan must map:

Testnet Resource
→ Mainnet Resource
→ Required Action
→ Required Approval
→ Verification Method

## STOP

Do NOT execute Phase 3.

Wait for explicit human approval.

---

# PHASE 3 — MAINNET INFRASTRUCTURE

Execute ONLY the approved Phase 2 plan.

- [ ] Configure mainnet chain
- [ ] Configure mainnet RPC
- [ ] Configure mainnet explorer
- [ ] Configure gas configuration
- [ ] Prepare mainnet ENV configuration
- [ ] Separate testnet and mainnet configuration
- [ ] Verify no secrets are committed
- [ ] Verify build configuration

Any unexpected requirement:

STOP and request approval.

---

# PHASE 4 — MAINNET IDENTITY

- [ ] Confirm approved ERC-8004 mainnet strategy
- [ ] Register/create mainnet identity
- [ ] Verify identity
- [ ] Record mainnet identity
- [ ] Configure application reference
- [ ] Verify application resolves correct identity

IMPORTANT:

Do NOT overwrite or delete the historical testnet identity.

Mainnet identity must be treated as a separate resource unless the
approved architecture explicitly states otherwise.

---

# PHASE 5 — MAINNET WALLET / SMART ACCOUNT

- [ ] Confirm approved wallet architecture
- [ ] Create/initialize mainnet account if required
- [ ] Verify owner
- [ ] Verify smart account
- [ ] Verify signer
- [ ] Verify permissions
- [ ] Configure mainnet address
- [ ] Confirm required gas

### Approval Gate

Before funding or sending any mainnet transaction:

STOP.

Request explicit human approval.

---

# PHASE 6 — MAINNET CONTRACTS

- [ ] Confirm required contracts
- [ ] Prepare deployment configuration
- [ ] Review deployment configuration
- [ ] Verify constructor/configuration values
- [ ] Verify target chain
- [ ] Verify deployer/account
- [ ] Obtain explicit approval

### Approval Gate

Do NOT deploy until explicit approval is received.

After deployment:

- [ ] Verify contract
- [ ] Record address
- [ ] Configure address through ENV
- [ ] Test contract interaction
- [ ] Verify explorer

---

# PHASE 7 — DATABASE & DATA

## Objective

Preserve Glyph history and avoid destructive migration.

- [ ] Confirm database backup
- [ ] Review schema
- [ ] Identify testnet-specific database fields
- [ ] Determine whether network metadata is required
- [ ] Determine whether existing records should remain unchanged
- [ ] Verify ResearchSnapshot history
- [ ] Verify Decision history
- [ ] Verify Trade history
- [ ] Verify Memory history
- [ ] Verify Reputation history

Do NOT:

- reset database
- delete historical records
- recreate historical trades
- recreate historical decisions

Any schema change:

STOP → request approval.

---

# PHASE 8 — GLYPH ENGINE VERIFICATION

The migration must NOT change the existing Glyph decision lifecycle.

Verify:

Market Data
→ Research
→ Historical Research Context
→ Decision
→ Zod
→ Policy
→ Paper Trade
→ Onchain Proof
→ Memory / Reputation

Verify specifically:

- [ ] Allowed assets remain correct
- [ ] Same-asset ResearchSnapshot isolation remains correct
- [ ] Minimum 3 valid same-asset snapshots remains enforced
- [ ] Insufficient history produces NO_TRADE
- [ ] Decision is created correctly
- [ ] Policy Engine works
- [ ] Paper Trade works
- [ ] Onchain proof works
- [ ] Transaction hash is stored
- [ ] Memory works
- [ ] Reputation works

Do NOT modify these systems unless Phase 1/2 proves that a network
migration change is technically required.

---

# PHASE 9 — CRON

- [ ] Verify cron endpoint
- [ ] Verify authentication
- [ ] Verify CRON_SECRET
- [ ] Verify market-open check
- [ ] Verify market-closed behavior
- [ ] Verify production environment
- [ ] Keep automatic execution disabled during migration
- [ ] Run controlled manual cycle
- [ ] Verify result

Do NOT enable scheduled production execution yet.

---

# PHASE 10 — FULL VALIDATION

## Build

- [ ] TypeScript passes
- [ ] Lint passes
- [ ] Build passes
- [ ] Deployment succeeds

## Network

- [ ] Correct chain
- [ ] Correct chain ID
- [ ] Correct RPC
- [ ] Correct explorer
- [ ] Correct wallet
- [ ] Correct smart account
- [ ] Correct identity
- [ ] Correct contracts

## Application

- [ ] Homepage
- [ ] Glyph observation
- [ ] Research
- [ ] Decision
- [ ] Paper trading
- [ ] Life Log
- [ ] Onchain verification

## Security

- [ ] No secrets exposed
- [ ] No private keys exposed
- [ ] No testnet credentials in production
- [ ] No testnet addresses in production
- [ ] No accidental real-money trading path
- [ ] No unintended autonomous transaction path

---

# PHASE 11 — CONTROLLED MAINNET TEST

## Approval Gate

Require explicit human approval before starting.

Then:

- [ ] Run exactly one controlled Glyph cycle
- [ ] Verify market data
- [ ] Verify research
- [ ] Verify historical context
- [ ] Verify decision
- [ ] Verify policy
- [ ] Verify paper trade
- [ ] Verify onchain proof
- [ ] Verify transaction hash
- [ ] Verify database
- [ ] Verify Life Log
- [ ] Verify public UI

If anything unexpected happens:

STOP immediately.

Do NOT automatically retry transactions.

---

# PHASE 12 — GO LIVE

## Final Approval Gate

Before enabling production:

- [ ] All previous phases completed
- [ ] Phase 10 passed
- [ ] Phase 11 passed
- [ ] Mainnet identity verified
- [ ] Mainnet wallet verified
- [ ] Mainnet contracts verified
- [ ] Production ENV verified
- [ ] Security review completed
- [ ] No unintended testnet dependency remains
- [ ] Glyph remains paper trading

### Human Approval Required

STOP.

Request explicit approval to enable production mainnet execution.

Only after approval:

- [ ] Enable mainnet production configuration
- [ ] Enable scheduled cron
- [ ] Monitor first production cycles
- [ ] Record migration completion

---

# FINAL ACCEPTANCE CRITERIA

Migration is COMPLETE only when:

- [ ] Glyph production runs on mainnet
- [ ] Mainnet identity is valid
- [ ] Mainnet wallet/smart account is valid
- [ ] Required mainnet contracts are verified
- [ ] Production uses mainnet configuration
- [ ] No unintended testnet dependency remains
- [ ] Phase 01 architecture is preserved
- [ ] Decision lifecycle is preserved
- [ ] Paper trading remains enabled
- [ ] Research history remains intact
- [ ] Decision history remains intact
- [ ] Trade history remains intact
- [ ] Memory/reputation remain intact
- [ ] Onchain proof works
- [ ] Cron works
- [ ] Public UI works
- [ ] No unintended real-money trading path exists
- [ ] Migration completion is documented