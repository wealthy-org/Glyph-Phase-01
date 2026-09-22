# GLYPH — TESTNET → MAINNET MIGRATION TODO

## P0 — Audit & Preparation

- [ ] Audit all Testnet configurations
- [ ] Find all chain ID references
- [ ] Find all RPC URL references
- [ ] Find all wallet address references
- [ ] Find all contract address references
- [ ] Find all Smart Account / Safe configurations
- [ ] Find all explorer URL references
- [ ] Find all blockchain-related environment variables
- [ ] Find all transaction execution logic
- [ ] Find all cron endpoints
- [ ] Identify all hardcoded Testnet values
- [ ] Ensure historical Testnet data will not be modified

---

## P1 — Mainnet Network Configuration

- [ ] Add Mainnet network configuration
- [ ] Set Mainnet chain ID
- [ ] Set Mainnet RPC URL
- [ ] Set Mainnet explorer URL
- [ ] Centralize blockchain network configuration
- [ ] Separate Testnet and Mainnet configuration
- [ ] Add `GLYPH_ENV=mainnet`
- [ ] Add `GLYPH_EXECUTION_MODE`
- [ ] Add `GLYPH_MAINNET_ENABLED`

---

## P2 — Mainnet Wallet

- [ ] Create / configure Glyph Mainnet wallet
- [ ] Verify Mainnet wallet address
- [ ] Configure Mainnet Smart Account
- [ ] Configure Safe if applicable
- [ ] Update wallet configuration
- [ ] Update database references if required
- [ ] Ensure private keys are server-side only
- [ ] Ensure private keys are not committed to Git
- [ ] Ensure private keys are not exposed to frontend
- [ ] Ensure private keys are not stored in database
- [ ] Ensure private keys are not written to logs

---

## P3 — Mainnet Contracts

- [ ] Audit all Testnet contracts used by Glyph
- [ ] Prepare Mainnet deployment
- [ ] Deploy `DecisionRegistry` to Mainnet
- [ ] Save Mainnet contract address
- [ ] Save deployment transaction hash
- [ ] Verify contract on Mainnet explorer
- [ ] Test contract read functions
- [ ] Test contract write functions
- [ ] Update contract configuration
- [ ] Verify ABI matches deployed contract
- [ ] Preserve Testnet contract addresses for historical data

---

## P4 — Database

- [ ] Audit blockchain-related database models
- [ ] Support `TESTNET` and `MAINNET` networks
- [ ] Store chain ID where required
- [ ] Store wallet address where required
- [ ] Store contract address where required
- [ ] Store transaction hash where required
- [ ] Mark historical records as Testnet
- [ ] Ensure Testnet records are not overwritten
- [ ] Ensure new records use Mainnet
- [ ] Run Prisma generate
- [ ] Run database migration / push
- [ ] Verify database after migration

---

## P5 — Transaction Layer

- [ ] Update blockchain client to Mainnet
- [ ] Update wallet client
- [ ] Update Smart Account
- [ ] Update contract addresses
- [ ] Update chain validation
- [ ] Update transaction execution
- [ ] Update transaction receipt handling
- [ ] Verify gas handling
- [ ] Verify nonce handling
- [ ] Only mark transactions successful after receipt confirmation
- [ ] Prevent duplicate transaction execution
- [ ] Ensure failed transactions are not recorded as successful

---

## P6 — Decision Engine

- [ ] Verify Market Data pipeline
- [ ] Verify Fundamental Analysis
- [ ] Verify Technical Analysis
- [ ] Verify Market Context
- [ ] Verify Glyph's View / Thesis
- [ ] Verify Decision generation
- [ ] Verify Zod validation
- [ ] Verify Policy Engine
- [ ] Ensure no trade/action happens without a valid Thesis
- [ ] Ensure LLM cannot directly control the wallet
- [ ] Ensure Policy Engine remains deterministic

---

## P7 — Cron

- [ ] Audit `/api/cron/glyph-cycle`
- [ ] Audit `/api/cron/trade-decision`
- [ ] Verify `CRON_SECRET`
- [ ] Verify POST-only behavior
- [ ] Update cron configuration for Mainnet
- [ ] Verify market-open check
- [ ] Ensure market closed = no trade/action
- [ ] Prevent duplicate cron execution
- [ ] Update cron-job.org configuration
- [ ] Test cron manually
- [ ] Test cron through cron-job.org

---

## P8 — Explorer & Verification

- [ ] Update transaction explorer URLs
- [ ] Update wallet explorer URLs
- [ ] Update contract explorer URLs
- [ ] Keep historical Testnet links pointing to Testnet explorer
- [ ] Ensure Mainnet transactions use Mainnet explorer
- [ ] Test explorer links
- [ ] Test transaction hash verification

---

## P9 — Frontend

- [ ] Update network indicator
- [ ] Update wallet information
- [ ] Update contract information
- [ ] Update explorer links
- [ ] Remove incorrect Testnet information from production UI
- [ ] Keep Testnet labels for historical records
- [ ] Add Mainnet status
- [ ] Remove mock wallet data
- [ ] Remove mock transaction data
- [ ] Remove mock contract addresses

---

## P10 — Security

- [ ] Audit environment variables
- [ ] Audit `.gitignore`
- [ ] Ensure no secrets are committed
- [ ] Ensure private keys are not exposed
- [ ] Verify cron authentication
- [ ] Verify contract address allowlist
- [ ] Verify chain ID validation
- [ ] Verify wallet address validation
- [ ] Verify transaction limits
- [ ] Verify allowed assets
- [ ] Ensure LLM cannot bypass Policy Engine
- [ ] Add / verify emergency kill switch

---

## P11 — Testnet Regression

- [ ] Test market analysis
- [ ] Test Glyph's View
- [ ] Test Decision generation
- [ ] Test Zod validation
- [ ] Test Policy Engine
- [ ] Test trade creation
- [ ] Test onchain proof
- [ ] Test transaction hash
- [ ] Test Life Log
- [ ] Test Memory
- [ ] Test Dashboard
- [ ] Test Trades page
- [ ] Test Analysis page

---

## P12 — Mainnet Dry Run

- [ ] Deploy production with Mainnet configuration
- [ ] Set `GLYPH_EXECUTION_MODE=paper`
- [ ] Set `GLYPH_MAINNET_ENABLED=false`
- [ ] Test Mainnet RPC
- [ ] Test Mainnet chain detection
- [ ] Test Mainnet wallet detection
- [ ] Test Mainnet contract reads
- [ ] Test database writes
- [ ] Test analysis pipeline
- [ ] Test decision pipeline
- [ ] Test cron
- [ ] Test explorer links
- [ ] Verify no real economic action occurs

---

## P13 — Controlled Mainnet Test

- [ ] Enable Mainnet
- [ ] Keep execution limits enabled
- [ ] Execute one controlled transaction
- [ ] Verify transaction hash
- [ ] Verify transaction receipt
- [ ] Verify transaction on explorer
- [ ] Verify contract state
- [ ] Verify database record
- [ ] Verify frontend display
- [ ] Verify Life Log
- [ ] Verify Memory
- [ ] Disable Mainnet immediately if validation fails

---

## P14 — Production Deployment

- [ ] Configure production environment
- [ ] Configure Mainnet RPC
- [ ] Configure Mainnet chain ID
- [ ] Configure Mainnet wallet
- [ ] Configure Mainnet Smart Account
- [ ] Configure Mainnet contract addresses
- [ ] Configure Mainnet explorer
- [ ] Configure production secrets
- [ ] Deploy production
- [ ] Verify production build
- [ ] Verify database
- [ ] Verify cron
- [ ] Verify frontend
- [ ] Verify blockchain

---

## P15 — Final Verification

- [ ] Glyph is running on Mainnet
- [ ] Mainnet wallet is correct
- [ ] Mainnet Smart Account is correct
- [ ] Mainnet contract is correct
- [ ] Mainnet RPC is correct
- [ ] Mainnet chain ID is correct
- [ ] Mainnet explorer is correct
- [ ] Database stores network correctly
- [ ] Historical Testnet data is preserved
- [ ] Cron is working
- [ ] Market-open check is working
- [ ] Policy Engine is working
- [ ] Transaction verification is working
- [ ] Security audit is complete
- [ ] Rollback plan is ready

---

## P16 — Rollback

- [ ] Verify `GLYPH_MAINNET_ENABLED=false`
- [ ] Verify `GLYPH_EXECUTION_MODE=paper`
- [ ] Test emergency disable
- [ ] Verify cron can be stopped
- [ ] Verify no automatic transactions occur after disable
- [ ] Preserve transaction history
- [ ] Document rollback procedure

---

# FINAL STATUS

- [ ] TESTNET AUDIT COMPLETE
- [ ] MAINNET CONFIGURATION COMPLETE
- [ ] MAINNET WALLET COMPLETE
- [ ] MAINNET CONTRACT COMPLETE
- [ ] DATABASE MIGRATION COMPLETE
- [ ] TRANSACTION LAYER COMPLETE
- [ ] CRON MIGRATION COMPLETE
- [ ] SECURITY AUDIT COMPLETE
- [ ] MAINNET DRY RUN COMPLETE
- [ ] CONTROLLED MAINNET TEST COMPLETE
- [ ] PRODUCTION DEPLOYMENT COMPLETE
- [ ] MAINNET READY