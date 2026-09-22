# GLYPH — PHASE 0 SNAPSHOT
# Pre-Migration Testnet State Record

Created: 2026-09-22
Branch: feat/mainnet-migration
Status: FROZEN — Do not modify this file after migration begins.

---

## Git State

| Field | Value |
|---|---|
| Branch at freeze | `main` |
| HEAD Commit (full) | `dc2b2f8b55e938d99436bc36e64ea84730dea919` |
| HEAD Commit (short) | `dc2b2f8` |
| Commit Message | `feat(decision): implement asset-specific historical research context` |
| Migration Branch | `feat/mainnet-migration` |
| Remote | `origin/main` |
| Working Tree Note | `docs/MAINNET_MIGRATION_TASK.md` had unstaged changes at freeze time |

---

## Current Network — Robinhood Chain Testnet

| Field | Value |
|---|---|
| Network Name | Robinhood Chain Testnet |
| Chain ID | `46630` |
| RPC URL | `https://rpc.testnet.chain.robinhood.com` |
| Block Explorer | `https://explorer.testnet.chain.robinhood.com` |

---

## Contract Addresses (Testnet)

| Contract | Address |
|---|---|
| Identity Registry (ERC-8004) | `0x66399E25D3FBb5De462d06dE835D07B2957060D2` |
| Decision Registry | `0x7Ae7f962DC15e65De46a5b4d43744C7ed750B525` |
| Levera Market Registry | *(empty — DORMANT)* |
| Levera Leverage Router | *(empty — DORMANT)* |
| Levera Short Router | *(empty — DORMANT)* |
| Levera Auto Protect Module | *(empty — DORMANT)* |
| Levera Vault | *(empty — DORMANT)* |

Contract source files:
- `contracts/IdentityRegistry.sol`
- `contracts/DecisionRegistry.sol`

---

## Glyph Identity (ERC-8004)

| Field | Value |
|---|---|
| Glyph Agent ID | `5` |
| NEXT_PUBLIC_GLYPH_AGENT_ID | `5` |
| Identity Registry Contract | `0x66399E25D3FBb5De462d06dE835D07B2957060D2` |

---

## Wallet / Smart Account (Testnet)

| Field | Value |
|---|---|
| Smart Account (Public Wallet) | `0x1Ba1BBeC38CAf4454252f8Bd87245a41919dd27C` |
| Owner Private Key | **REDACTED — see .env (never commit)** |
| Safe Transaction Service URL | *(empty)* |

---

## Database

| Field | Value |
|---|---|
| Provider | Supabase PostgreSQL |
| Host Region | `aws-0-ap-southeast-1` |
| Project ID | `roknwfhjkjgzighuktvg` |
| Connection Mode | PgBouncer (port 6543) |
| Direct URL Port | 5432 |
| Backup File | `backup.sql` (exists in project root) |
| ORM | Prisma |
| Schema File | `prisma/schema.prisma` |

DO NOT reset or delete the database. Historical research, decisions, and trades must be preserved.

---

## LLM Configuration

| Field | Value |
|---|---|
| Provider | OpenRouter |
| Model | `openai/gpt-4.1-mini` |
| API Key | **REDACTED — see .env** |

---

## Market Data Providers

| Field | Value |
|---|---|
| Primary | Alpha Vantage (MARKET_DATA_API_KEY) |
| Backup | Alpha Vantage (MARKET_DATA_BACKUP_API_KEY) |
| StockFit | STOCKFIT_API_KEY present |
| Twelve Data | TWELVE_DATA_API_KEY present |

---

## Cron Configuration

| Field | Value |
|---|---|
| Provider | cron-job.org |
| Secret | **REDACTED — see .env (CRON_SECRET)** |

---

## Levera Protocol

| Field | Value |
|---|---|
| Status | **DORMANT / DISABLED** |
| Enable Flag | `ENABLE_LEVERA_PROTOCOL=false` |
| Note | All contract addresses are empty. Do not activate during migration. |

---

## Environment Variables — Full Key List

All keys present in `.env` at freeze time (values REDACTED for secrets):

```
DATABASE_URL                                 # Supabase PostgreSQL (pooler)
DIRECT_URL                                   # Supabase PostgreSQL (direct)
OPENROUTER_API_KEY                           # SECRET
OPENROUTER_MODEL                             # openai/gpt-4.1-mini
NEXT_PUBLIC_CHAIN_ID                         # 46630 (testnet)
NEXT_PUBLIC_RPC_URL                          # https://rpc.testnet.chain.robinhood.com
BLOCK_EXPLORER_URL                           # https://explorer.testnet.chain.robinhood.com
SMART_ACCOUNT_OWNER_PRIVATE_KEY             # SECRET
SAFE_TRANSACTION_SERVICE_URL                # (empty)
IDENTITY_REGISTRY_CONTRACT_ADDRESS          # 0x66399E25D3FBb5De462d06dE835D07B2957060D2
GLYPH_AGENT_ID                              # 5
NEXT_PUBLIC_GLYPH_AGENT_ID                  # 5
DECISION_REGISTRY_CONTRACT_ADDRESS          # 0x7Ae7f962DC15e65De46a5b4d43744C7ed750B525
MARKET_DATA_API_KEY                          # Alpha Vantage
MARKET_DATA_BACKUP_API_KEY                  # Alpha Vantage (same key)
STOCKFIT_API_KEY                             # StockFit
TWELVE_DATA_API_KEY                          # Twelve Data
CRON_SECRET                                  # SECRET
NEXT_PUBLIC_GLYPH_WALLET_ADDRESS            # 0x1Ba1BBeC38CAf4454252f8Bd87245a41919dd27C
ENABLE_LEVERA_PROTOCOL                       # false
LEVERA_MARKET_REGISTRY_CONTRACT_ADDRESS     # (empty)
LEVERA_LEVERAGE_ROUTER_CONTRACT_ADDRESS     # (empty)
LEVERA_SHORT_ROUTER_CONTRACT_ADDRESS        # (empty)
LEVERA_AUTO_PROTECT_MODULE_CONTRACT_ADDRESS # (empty)
LEVERA_VAULT_CONTRACT_ADDRESS               # (empty)
```

---

## Resources That Can Be Reused on Mainnet

| Resource | Can Reuse? | Notes |
|---|---|---|
| DATABASE_URL | Yes | Same Supabase DB — do not reset |
| OPENROUTER_API_KEY | Yes | Chain-agnostic |
| OPENROUTER_MODEL | Yes | Chain-agnostic |
| MARKET_DATA_* API keys | Yes | Chain-agnostic |
| CRON_SECRET | Yes | Not chain-specific |
| Prisma schema | Likely | May need minor additions for network metadata |
| Smart Account Owner Key | Possibly | Same EOA can own mainnet smart account |

---

## Resources That Must Be Recreated on Mainnet

| Resource | Action Required |
|---|---|
| NEXT_PUBLIC_CHAIN_ID | Replace with mainnet chain ID |
| NEXT_PUBLIC_RPC_URL | Replace with mainnet RPC |
| BLOCK_EXPLORER_URL | Replace with mainnet explorer |
| IDENTITY_REGISTRY_CONTRACT_ADDRESS | Deploy IdentityRegistry to mainnet OR use existing mainnet contract |
| DECISION_REGISTRY_CONTRACT_ADDRESS | Deploy DecisionRegistry to mainnet OR use existing mainnet contract |
| GLYPH_AGENT_ID | Re-register Glyph identity on mainnet Identity Registry |
| NEXT_PUBLIC_GLYPH_WALLET_ADDRESS | Create/derive mainnet smart account address |

---

## Freeze Checklist

- [x] Migration branch created: `feat/mainnet-migration`
- [x] Current git commit recorded: `dc2b2f8b55e938d99436bc36e64ea84730dea919`
- [x] Database backup file confirmed: `backup.sql` exists in project root
- [x] Current testnet configuration recorded (this document)
- [x] Contract addresses recorded
- [x] Wallet/smart account address recorded
- [x] ERC-8004 identity recorded (Agent ID: 5)
- [x] Environment variable keys recorded (secrets redacted)
- [ ] Fresh database backup from Supabase dashboard (ACTION REQUIRED — see note)
- [x] Unrelated feature development frozen

NOTE on Database Backup:
A backup.sql already exists in the project root from a previous checkpoint.
Before proceeding to Phase 1, take a FRESH backup of the current database
from the Supabase dashboard (Project > Settings > Database > Backups) or
via pg_dump. This ensures the snapshot reflects the latest production data.

---

This file is a permanent record. Do not delete or modify once Phase 1 begins.
