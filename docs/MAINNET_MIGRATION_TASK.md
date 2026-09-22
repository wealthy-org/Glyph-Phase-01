# GLYPH — MAINNET MIGRATION CHECKLIST
## Updated Status — 2026-09-22

> Final state: **Robinhood Chain Mainnet + Paper Trading**
>
> Glyph does **not** perform real-money stock trading. Paper trades remain USD-SIM. The live blockchain action is limited to recording the decision proof with `commitDecision(bytes32)`.

---

## PHASE 0 — PRE-MIGRATION SNAPSHOT

- [x] Migration branch created
- [x] Git commit recorded
- [x] Working tree audited
- [x] Testnet chain `46630` recorded
- [x] Testnet RPC/explorer recorded
- [x] Testnet contracts recorded
- [x] Testnet wallet recorded
- [x] Testnet ERC-8004 Agent `#5` recorded
- [x] Network ENV variables recorded
- [x] Secrets redacted
- [x] `docs/PHASE0_SNAPSHOT.md` created and committed

## PHASE 1 — CODEBASE AUDIT

- [x] Testnet network dependencies identified
- [x] Hardcoded testnet references audited
- [x] Research pipeline confirmed chain-agnostic
- [x] ResearchSnapshot confirmed chain-agnostic
- [x] Historical research confirmed chain-agnostic
- [x] Decision engine confirmed chain-agnostic
- [x] Policy Engine confirmed chain-agnostic
- [x] Paper trading confirmed chain-agnostic
- [x] Memory/Reputation confirmed chain-agnostic
- [x] Life Log explorer dependency identified
- [x] `docs/PHASE1_AUDIT.md` completed
- [x] Human approval received

## PHASE 2 — MAINNET MIGRATION PLAN

- [x] Mainnet defined: Robinhood Chain Mainnet
- [x] Chain ID: `4663`
- [x] Mainnet RPC defined
- [x] Mainnet explorer defined
- [x] Wallet strategy defined
- [x] ERC-8004 strategy defined
- [x] DecisionRegistry requirement identified
- [x] ENV/code changes identified
- [x] Deployment and verification plan defined
- [x] Rollback strategy defined
- [x] Human approval received

## PHASE 3 — MAINNET INFRASTRUCTURE

- [x] Mainnet chain configured
- [x] Mainnet RPC verified
- [x] Mainnet explorer configured
- [x] Dynamic Testnet/Mainnet selection implemented
- [x] Mainnet gas reviewed
- [x] Mainnet ENV template created
- [x] TypeScript check passed
- [x] No secrets committed
- [x] Canonical ERC-8004 IdentityRegistry verified
- [x] DecisionRegistry identified for Mainnet deployment

Mainnet IdentityRegistry:
`0x8004A169FB4a3325136EB29fA0ceB6D2e539a432`

## PHASE 4 — MAINNET IDENTITY

- [x] Mainnet IdentityRegistry confirmed
- [x] Mainnet identity registered
- [x] Identity verified
- [x] Agent ID: `#485`
- [x] Owner/Agent Wallet: `0x1Ba1BBeC38CAf4454252f8Bd87245a41919dd27C`
- [x] Agent URI: `/agents/glyph.json`
- [x] Registration TX recorded
- [x] Application resolves Agent `#485`
- [x] Testnet Agent `#5` preserved

Registration TX:
`0x7bdb016a6ae01709d2fe5548593644ace465fae607e9cf51fe4a22a07556e794`

## PHASE 5 — MAINNET WALLET

Current implementation: **Direct EOA Relayer**, not Safe execution.

- [x] Mainnet owner EOA verified
- [x] Agent Wallet verified
- [x] Backend operational signer verified
- [x] Relayer: `0xB635eFd761D352ed8a74166a292c8969AD541c8E`
- [x] Mainnet wallet configuration verified
- [x] Gas requirement reviewed
- [x] Mainnet gas funding completed
- [x] Private key remains server-side
- [x] No private key exposed

## PHASE 6 — MAINNET CONTRACTS

- [x] DecisionRegistry source reviewed
- [x] Deployment approved
- [x] DecisionRegistry deployed
- [x] Contract verified
- [x] ENV updated
- [x] Mainnet explorer verified
- [x] `nextDecisionId()` verified at deployment
- [x] `commitDecision(bytes32)` successfully executed in controlled cycle

Mainnet DecisionRegistry:
`0x4ce11C76a6BBe68d8F0694f668c2Aa2e4c7280Df`

Deployment TX:
`0x467c5803a33f123b14e5d3a6d3f8ed356b23bc303c3637989793c4035e66a95c`

## PHASE 7 — DATABASE & DATA

- [x] Database backup confirmed
- [x] Prisma schema checked
- [x] No destructive migration
- [x] Historical records preserved
- [x] ResearchSnapshot history preserved
- [x] Decision/Trade history preserved
- [x] Memory/Reputation history preserved
- [x] Testnet history preserved
- [x] DB Agent ID corrected from `5` to `485`
- [x] Agent UUID preserved
- [x] No schema mutation required

Post-cycle state:
- Agents: `1`
- Decisions: `1`
- Trades: `1`
- Positions: `1`
- ResearchSnapshots: `7`
- NVDA: `4`
- AAPL: `3`
- AgentRuns: `6`
- EconomicEvents: `10`

## PHASE 8 — GLYPH ENGINE VERIFICATION

- [x] Allowed assets verified: `NVDA`, `AAPL`
- [x] Same-asset snapshot isolation verified
- [x] Minimum 3 same-asset snapshots enforced
- [x] Insufficient history → `NO_TRADE`
- [x] Decision verified
- [x] Zod validation verified
- [x] Policy Engine verified
- [x] Paper Trade verified
- [x] Onchain proof verified
- [x] Transaction hash stored
- [x] Memory verified
- [x] Reputation verified

Controlled cycle:
- Cycle: `cycle_20260922135823_NVDA`
- Decision: `OPEN_LONG`
- Conviction: `74%`
- Policy: `APPROVED`
- Trade: `GLYPH-0001`
- Size: `$70 USD-SIM`
- Entry: `$222.27`
- Leverage: `2x`
- Fee: `$0.14`
- Real money used: `$0`

## PHASE 9 — CRON

Application-side safety:

- [x] Cron endpoint verified
- [x] POST enforced
- [x] Bearer `CRON_SECRET` authentication verified
- [x] Timing-safe secret comparison
- [x] Market-open check verified
- [x] Market-closed behavior verified
- [x] Closed market stops before research/trade/onchain execution
- [x] 3-minute concurrency lock
- [x] 30-minute cooldown
- [x] Production environment verified
- [x] Vercel Cron absent
- [x] cron-job.org selected as single scheduler
- [x] No manual cycle during cron setup

Production endpoint:
`https://www.glyphbeing.net/api/cron/glyph-cycle`

Method: `POST`

Body:
```json
{}
```

Schedule: once per day, Mon-Fri, around `14:30 UTC / 10:30 AM ET`.

External scheduler verification still required:

- [ ] Confirm cron-job.org job exists
- [ ] Confirm cron-job.org job is enabled
- [ ] Confirm URL/method/header/body
- [ ] Confirm once-daily schedule
- [ ] Confirm no `force=true`
- [ ] Confirm first scheduled request completes

## PHASE 10 — FULL VALIDATION

### Build
- [x] TypeScript passes
- [x] Policy tests pass
- [x] Production deployment verified

### Network
- [x] Chain `4663`
- [x] RPC
- [x] Explorer
- [x] Mainnet wallet
- [x] Mainnet Agent `#485`
- [x] DecisionRegistry
- [x] Testnet/Mainnet separation

### Application
- [x] Homepage
- [x] Glyph observation
- [x] Research
- [x] Decision
- [x] Paper trading
- [x] Life Log
- [x] Onchain verification
- [x] Mainnet Trade Detail UI

### Security
- [x] No secrets exposed
- [x] No private keys exposed
- [x] No unintended real-money trading path
- [x] Paper trading remains USD-SIM
- [x] Onchain proof uses `0 ETH` value
- [x] No broker order path
- [x] No DEX/token transfer path

## PHASE 11 — CONTROLLED MAINNET TEST

- [x] Approval received
- [x] Exactly one controlled Mainnet cycle
- [x] Market data verified
- [x] Research verified
- [x] Historical context verified
- [x] Decision verified
- [x] Policy verified
- [x] Paper Trade verified
- [x] Onchain proof verified
- [x] TX hash verified
- [x] Database verified
- [x] Life Log verified
- [x] Public UI verified
- [x] No real-money trade
- [x] No second controlled cycle

Proof TX:
`0x40191a87bf8f6c04488d997ac651bbb85b883c84165ec5a06f639195780d9978`

## PHASE 12 — PRODUCTION CRON

- [x] Production endpoint ready
- [x] Authentication ready
- [x] Market gate ready
- [x] Concurrency lock ready
- [x] Cooldown ready
- [x] Paper trading remains enabled
- [x] Mainnet DecisionRegistry configured
- [x] Mainnet proof path verified
- [x] Vercel Cron disabled
- [x] Single scheduler architecture selected
- [ ] First scheduled cron execution observed
- [ ] First scheduled `AgentRun` audited
- [ ] Research/Decision/Policy result audited
- [ ] Paper Trade result audited if applicable
- [ ] Onchain proof audited if applicable
- [ ] Life Log/Activity Log audited
- [ ] No duplicate execution confirmed
- [ ] No real-money trade confirmed for first scheduled run

> **Do not manually trigger the cron endpoint for this verification.**

---

# CURRENT STATUS

## Completed

The Mainnet migration, Mainnet identity, Mainnet DecisionRegistry, database migration, engine verification, controlled Mainnet cycle, and production cron application safety checks are completed.

## Remaining

The remaining operational task is:

```text
cron-job.org
    ↓
First scheduled request
    ↓
/api/cron/glyph-cycle
    ↓
Market Gate
    ↓
Glyph Cycle
    ↓
Paper Trade
    ↓
Onchain Proof if applicable
    ↓
Post-Cron Audit
```

Next deliverable:

`docs/FIRST_PRODUCTION_CRON_RUN_REPORT.md`

The first scheduled run must be evaluated from observed evidence as:

- `PASS`
- `PASS WITH FINDINGS`
- `FAIL`

---

# FINAL SAFETY BOUNDARY

**MAINNET + PAPER TRADING**

Not:

**MAINNET + REAL-MONEY STOCK TRADING**

The treasury is USD-SIM. A successful `commitDecision()` transaction records a decision hash onchain. It does not purchase NVDA/AAPL and does not move user funds.

**Updated: 2026-09-22**
