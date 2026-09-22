# GLYPH — TESTNET TO MAINNET MIGRATION

## Objective

Migrate Glyph from the current testnet environment to mainnet
while preserving the existing Phase 01 architecture and behavior.

Final state:

TESTNET
→ MAINNET

The system must remain PAPER TRADING.
Mainnet migration must NOT introduce real-money trading.

---

# RULES

- Do not redesign Glyph architecture.
- Do not remove existing functionality.
- Do not reset or delete production database data.
- Do not modify database schema unless strictly required.
- Do not expose private keys or secrets.
- Do not execute irreversible mainnet transactions without explicit approval.
- Do not deploy mainnet contracts without explicit approval.
- Do not fund mainnet wallets without explicit approval.
- Do not assume a testnet resource can simply be reused on mainnet.
- Identify every resource that must be newly created on mainnet.
- Preserve the existing Decision → Policy → Paper Trade → Onchain Proof lifecycle.
- Preserve asset-specific historical ResearchSnapshot logic.
- All network-specific configuration must come from environment/configuration.
- No hardcoded testnet configuration may remain in production.

---

# PHASE 0 — BACKUP & FREEZE

- [ ] Create migration branch
- [ ] Record current git commit
- [ ] Backup database
- [ ] Record current testnet configuration
- [ ] Record current contract addresses
- [ ] Record current wallet/smart account addresses
- [ ] Record current ERC-8004 identity
- [ ] Record current environment variables
- [ ] Freeze unrelated feature development

---

# PHASE 1 — CODEBASE AUDIT

- [ ] Identify current testnet chain
- [ ] Identify current chain ID
- [ ] Identify all RPC configuration
- [ ] Identify all contract addresses
- [ ] Identify wallet configuration
- [ ] Identify smart account configuration
- [ ] Identify ERC-8004 configuration
- [ ] Identify explorer URLs
- [ ] Identify cron configuration
- [ ] Identify network-specific environment variables
- [ ] Search for hardcoded testnet chain IDs
- [ ] Search for hardcoded testnet RPC URLs
- [ ] Search for hardcoded testnet contract addresses
- [ ] Search for hardcoded testnet explorer URLs
- [ ] Search for testnet-only logic

### Deliverable

AI must produce an audit report containing:

- Current testnet dependencies
- Mainnet dependencies required
- Resources that can be reused
- Resources that must be recreated
- Files that require modification
- Potential migration risks

STOP HERE FOR HUMAN REVIEW.

---

# PHASE 2 — MAINNET MIGRATION PLAN

- [ ] Define target mainnet
- [ ] Define target chain ID
- [ ] Define mainnet RPC
- [ ] Define mainnet explorer
- [ ] Define required contracts
- [ ] Define mainnet wallet architecture
- [ ] Define mainnet ERC-8004 identity
- [ ] Define required ENV variables
- [ ] Define deployment order
- [ ] Define verification steps
- [ ] Define rollback strategy

### Deliverable

AI must produce a detailed implementation plan.

STOP HERE FOR HUMAN REVIEW.

---

# PHASE 3 — MAINNET INFRASTRUCTURE

- [ ] Configure mainnet network
- [ ] Configure mainnet RPC
- [ ] Configure mainnet chain ID
- [ ] Configure mainnet explorer
- [ ] Configure gas configuration
- [ ] Create mainnet ENV configuration
- [ ] Ensure secrets are not committed
- [ ] Ensure testnet ENV remains isolated

---

# PHASE 4 — GLYPH IDENTITY

- [ ] Determine mainnet ERC-8004 requirements
- [ ] Create/register mainnet Glyph identity
- [ ] Verify identity
- [ ] Record mainnet identity reference
- [ ] Update application configuration
- [ ] Verify application resolves the correct identity

IMPORTANT:
Do not overwrite the historical testnet identity record.

---

# PHASE 5 — GLYPH WALLET / SMART ACCOUNT

- [ ] Determine whether existing wallet architecture can be reused
- [ ] Create/initialize mainnet smart account if required
- [ ] Verify owner
- [ ] Verify smart account address
- [ ] Configure mainnet wallet address
- [ ] Verify signer configuration
- [ ] Verify permissions
- [ ] Fund required gas ONLY after explicit approval
- [ ] Perform controlled wallet verification

---

# PHASE 6 — MAINNET CONTRACTS

- [ ] Identify contracts required by Glyph
- [ ] Determine which contracts actually need mainnet deployment
- [ ] Prepare deployment configuration
- [ ] Review deployment configuration
- [ ] Deploy contracts ONLY after explicit approval
- [ ] Verify deployed contracts
- [ ] Record mainnet contract addresses
- [ ] Configure contract addresses through ENV
- [ ] Test contract interaction

---

# PHASE 7 — DATABASE & DATA

- [ ] Review existing database structure
- [ ] Review testnet-specific records
- [ ] Determine which historical records must remain
- [ ] Determine whether network metadata is required
- [ ] Do NOT delete historical research
- [ ] Do NOT delete decisions
- [ ] Do NOT delete trades
- [ ] Do NOT delete Glyph memory
- [ ] Do NOT reset the database
- [ ] Update only records that explicitly require mainnet references

---

# PHASE 8 — GLYPH DECISION ENGINE

Verify that the existing lifecycle remains unchanged:

Market Data
→ Research
→ Historical Research Context
→ Decision
→ Zod Validation
→ Policy Engine
→ Paper Trade
→ Onchain Proof
→ Memory / Reputation

- [ ] Verify allowed assets
- [ ] Verify same-asset ResearchSnapshot isolation
- [ ] Verify minimum 3 valid historical snapshots
- [ ] Verify NO_TRADE behavior when history is insufficient
- [ ] Verify Decision creation
- [ ] Verify Policy Engine
- [ ] Verify Paper Trade
- [ ] Verify onchain commit
- [ ] Verify transaction hash
- [ ] Verify memory update
- [ ] Verify reputation update

Do not modify this logic unless required by the network migration.

---

# PHASE 9 — CRON / AUTOMATION

- [ ] Verify cron endpoint
- [ ] Verify CRON_SECRET
- [ ] Verify market-open check
- [ ] Verify market-closed behavior
- [ ] Verify mainnet environment
- [ ] Disable automatic execution during migration
- [ ] Run controlled manual test
- [ ] Verify successful cycle
- [ ] Re-enable scheduled execution only after approval

---

# PHASE 10 — TESTING

## Build

- [ ] TypeScript passes
- [ ] Lint passes
- [ ] Build passes
- [ ] Deployment succeeds

## Network

- [ ] Correct chain ID
- [ ] Correct RPC
- [ ] Correct explorer
- [ ] Correct wallet
- [ ] Correct smart account
- [ ] Correct identity
- [ ] Correct contract addresses

## Application

- [ ] Homepage works
- [ ] Glyph observation works
- [ ] Research works
- [ ] Decision works
- [ ] Paper trading works
- [ ] Life Log works
- [ ] Onchain verification works

## Security

- [ ] No private key exposed
- [ ] No secret committed
- [ ] No testnet credentials used in production
- [ ] No testnet address accidentally used by production
- [ ] No unintended real-money trading path exists

---

# PHASE 11 — CONTROLLED MAINNET TEST

- [ ] Confirm human approval
- [ ] Run one controlled Glyph cycle
- [ ] Verify market data
- [ ] Verify research
- [ ] Verify decision
- [ ] Verify policy
- [ ] Verify paper trade
- [ ] Verify onchain transaction
- [ ] Verify transaction hash
- [ ] Verify database record
- [ ] Verify Life Log
- [ ] Verify public UI

STOP if any unexpected behavior occurs.

---

# PHASE 12 — GO LIVE

- [ ] Confirm all previous phases completed
- [ ] Confirm no testnet configuration remains in production
- [ ] Confirm mainnet wallet
- [ ] Confirm mainnet identity
- [ ] Confirm mainnet contracts
- [ ] Confirm cron configuration
- [ ] Confirm security checks
- [ ] Enable mainnet production configuration
- [ ] Enable scheduled Glyph cycle
- [ ] Monitor first production cycles
- [ ] Record migration completion

---

# FINAL ACCEPTANCE CRITERIA

Glyph is considered successfully migrated when:

- [ ] Production runs on mainnet
- [ ] Glyph has valid mainnet identity
- [ ] Glyph uses the correct mainnet wallet/smart account
- [ ] Required contracts are deployed and verified
- [ ] Production uses mainnet configuration
- [ ] No testnet dependency remains unintentionally
- [ ] Existing Phase 01 logic still works
- [ ] Glyph remains paper trading
- [ ] Research history remains intact
- [ ] Decision history remains intact
- [ ] Onchain proof works
- [ ] Cron works
- [ ] Public Glyph interface works