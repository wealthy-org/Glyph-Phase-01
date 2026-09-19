# Glyph Phase 01 — Internal Documentation

> This document is intended for developers who will be setting up, maintaining, or re-deploying Glyph Phase 01 components.

---

## 1. Project Setup from Scratch

### 1.1 Prerequisites

| Tool | Minimum Version | Notes |
|---|---|---|
| Node.js | ≥ 18 | Latest LTS recommended |
| PostgreSQL | ≥ 14 | Supabase (recommended) or local |
| Git | Any | For clone & version control |
| npm | ≥ 9 | Bundled with Node.js |

### 1.2 Setup Steps

```bash
# 1. Clone the repository
git clone <repo-url> glyph-phase01
cd glyph-phase01

# 2. Install dependencies
npm install

# 3. Copy environment variables
cp .env.example .env
# → Fill in all values (see Section 2 below)

# 4. Generate Prisma client & push schema to database
npx prisma generate
npx prisma db push

# 5. Seed initial data (agent, wallet, treasury, policy)
npm run db:seed

# 6. Start development server
npm run dev
```

Open `http://localhost:3000` to verify.

### 1.3 Available Scripts

| Script | Command | Purpose |
|---|---|---|
| Dev server | `npm run dev` | Start Next.js development server |
| Build | `npm run build` | Build production bundle |
| Start | `npm run start` | Start production server |
| Lint | `npm run lint` | Run ESLint |
| DB Reset | `npm run prisma:reset` | Generate Prisma + push schema + seed |
| DB Seed | `npm run db:seed` | Seed initial data only |

---

## 2. Environment Variables

All env vars are defined in `.env`. Full reference available in `BRIEF.md §3.1`.

### 2.1 Database

| Variable | Example | Description |
|---|---|---|
| `DATABASE_URL` | `postgresql://user:pass@host:5432/glyph` | PostgreSQL connection string. If using Supabase, get it from Settings → Database → Connection String ("Transaction" mode for Vercel). |

### 2.2 LLM (Glyph Brain)

| Variable | Example | Description |
|---|---|---|
| `OPENROUTER_API_KEY` | `sk-or-v1-xxx...` | API key from [openrouter.ai](https://openrouter.ai). Free for `:free` models. |
| `OPENROUTER_MODEL` | `google/gemini-2.0-flash-exp:free` | Model ID from OpenRouter. Choose a free model with good structured JSON output reputation. Check the OpenRouter dashboard for latest models. |

### 2.3 Blockchain — Robinhood Chain Testnet

| Variable | Value | Description |
|---|---|---|
| `NEXT_PUBLIC_CHAIN_ID` | `46630` | Robinhood Chain testnet Chain ID. **Do not change.** |
| `NEXT_PUBLIC_RPC_URL` | `https://rpc.testnet.chain.robinhood.com` | Testnet RPC endpoint. **Do not change.** |
| `BLOCK_EXPLORER_URL` | `https://robinhoodchain.blockscout.com` | Blockscout explorer for tx verification. |

### 2.4 Smart Account (Server-Side Only)

| Variable | Example | Description |
|---|---|---|
| `SMART_ACCOUNT_OWNER_PRIVATE_KEY` | `0xabc...` | Private key of the server wallet that owns the Safe smart account. ⚠️ **SERVER ONLY — NEVER expose to frontend or LLM prompts.** |
| `SAFE_TRANSACTION_SERVICE_URL` | *(optional)* | Safe Transaction Service URL if available on Robinhood Chain. Can be left empty. |

### 2.5 Smart Contracts

| Variable | Example | Description |
|---|---|---|
| `IDENTITY_REGISTRY_CONTRACT_ADDRESS` | `0x1234...` | Address of `IdentityRegistry.sol` deployed to testnet. See Section 3 for deployment instructions. |
| `GLYPH_AGENT_ID` | `1` | Agent ID obtained after calling `register()` on IdentityRegistry. |
| `DECISION_REGISTRY_CONTRACT_ADDRESS` | `0x5678...` | Address of `DecisionRegistry.sol` deployed to testnet. See Section 3 for deployment instructions. |

### 2.6 Market Data

| Variable | Example | Description |
|---|---|---|
| `MARKET_DATA_API_KEY` | `ABCDEF12345` | API key from [Alpha Vantage](https://www.alphavantage.co/support/#api-key) (free tier: 25 req/day). Alternative: Finnhub. |

### 2.7 Cron / Scheduler

| Variable | Example | Description |
|---|---|---|
| `CRON_SECRET` | `my-secure-random-string` | Secret token sent by `cron-job.org` as `Authorization: Bearer <CRON_SECRET>`. Generate a long random string, store it here and on cron-job.org. |

### 2.8 Public (Frontend)

| Variable | Example | Description |
|---|---|---|
| `NEXT_PUBLIC_GLYPH_WALLET_ADDRESS` | `0x9abc...` | Glyphs Safe smart account address, displayed on the Identity page. This is a **public** address, not a private key. |

---

## 3. Smart Contract Re-deployment

### 3.1 When to Re-deploy?

- Changing contract logic (e.g., adding fields to the `DecisionCommitted` event)
- Migrating from testnet to mainnet (Chain ID `4663`)
- Previous contract is broken / inaccessible

### 3.2 Prerequisites

1. **Test ETH** in the server wallet — obtain from the Robinhood Chain testnet faucet
2. **Private key** filled in `SMART_ACCOUNT_OWNER_PRIVATE_KEY`
3. Deployment tool: Remix IDE, Hardhat, or Foundry

### 3.3 Deploy via Remix IDE (Easiest Method)

#### A. Deploy `IdentityRegistry.sol`

1. Open [Remix IDE](https://remix.ethereum.org)
2. Create a new file, paste the contents of `contracts/IdentityRegistry.sol`
3. Ensure OpenZeppelin imports are available (Remix auto-resolves from npm)
4. Compile with Solidity `^0.8.24`
5. In the Deploy tab:
   - Environment: **Injected Provider** (connect MetaMask to Robinhood Testnet)
   - Or: **External HTTP Provider** → `https://rpc.testnet.chain.robinhood.com`
6. Click **Deploy**
7. Copy the contract address → set `IDENTITY_REGISTRY_CONTRACT_ADDRESS`
8. Verify at `https://robinhoodchain.blockscout.com/address/<address>`

#### B. Deploy `DecisionRegistry.sol`

1. Repeat the steps above with `contracts/DecisionRegistry.sol`
2. This contract is simpler — no constructor arguments needed
3. Copy the contract address → set `DECISION_REGISTRY_CONTRACT_ADDRESS`

### 3.4 Register Glyph Identity (After Deploying IdentityRegistry)

```bash
# Run the register-agent script
npx tsx scripts/register-agent.ts
```

This script will:
1. Call `register(agentURI)` on IdentityRegistry
2. Save the `agentId` to the database
3. Output: the agent ID to be set in `GLYPH_AGENT_ID`

### 3.5 Post-deployment Checklist

- [ ] Update `IDENTITY_REGISTRY_CONTRACT_ADDRESS` in `.env` (and Vercel)
- [ ] Update `DECISION_REGISTRY_CONTRACT_ADDRESS` in `.env` (and Vercel)
- [ ] Update `GLYPH_AGENT_ID` if re-registering
- [ ] Verify contracts on Blockscout explorer
- [ ] Manual test: trigger 1 cycle via `POST /api/cron/glyph-cycle` and confirm the tx hash appears on the explorer
- [ ] If deploying to **mainnet** (`chain ID 4663`), also update:
  - `NEXT_PUBLIC_CHAIN_ID=4663`
  - `NEXT_PUBLIC_RPC_URL=https://rpc.mainnet.chain.robinhood.com`
  - `BLOCK_EXPLORER_URL` to the mainnet explorer URL

### 3.6 Deploy via Hardhat (Alternative)

To deploy via CLI, install Hardhat and create a config:

```bash
npm install --save-dev hardhat @nomicfoundation/hardhat-viem
npx hardhat init
```

Configure the network in `hardhat.config.ts`:
```ts
networks: {
  robinhoodTestnet: {
    url: "https://rpc.testnet.chain.robinhood.com",
    chainId: 46630,
    accounts: [process.env.SMART_ACCOUNT_OWNER_PRIVATE_KEY],
  },
}
```

---

## 4. Database Structure

Full schema is in `prisma/schema.prisma`. Key tables:

| Table | Purpose |
|---|---|
| `agents` | Glyph agent data (1 agent in Phase 01) |
| `agent_wallets` | Smart account (Safe) address |
| `agent_policies` | Risk policy parameters (maxLeverage, etc.) |
| `agent_treasuries` | Simulated balance ($1,000 initial) |
| `market_assets` | Whitelisted tradeable assets |
| `research_snapshots` | Immutable research snapshot per cycle |
| `decisions` | All decisions (including NO_TRADE) |
| `trades` | Trades that were actually opened |
| `positions` | Active positions (floating PnL) |
| `transactions` | Onchain transaction records |
| `memories` | Memories created after trade closure |
| `reputation_metrics` | Aggregated reputation metrics |
| `economic_events` | Events for Life Log generation |
| `agent_runs` | Observability trace for every cycle |

### Reset Database

```bash
# Full development reset: force-reset schema + seed demo data
npm run db:reset

# Or manually:
npx prisma db push --force-reset
npm run db:seed
```

⚠️ `--force-reset` will **delete all data**. Only use in development/testnet.

---

## 5. Deployment to Vercel

1. Push to GitHub
2. Import project on [Vercel](https://vercel.com)
3. Set all environment variables from Section 2 in Vercel Dashboard → Settings → Environment Variables
4. Deploy contracts to testnet (Section 3), note addresses
5. Set up cron job at [cron-job.org](https://cron-job.org):
   - URL: `https://<domain>.vercel.app/api/cron/glyph-cycle`
   - Method: `POST`
   - Header: `Authorization: Bearer <CRON_SECRET>`
   - Schedule: once/day (can be increased later)
6. Run end-to-end test of 1 full cycle before granting public access

---

## 6. Troubleshooting

| Issue | Solution |
|---|---|
| `Agent #1 not found` | Run `npm run db:seed` to seed initial data |
| `CRON_SECRET not defined` | Fill `CRON_SECRET` in `.env` |
| Tx hash not showing on explorer | Ensure server wallet has test ETH for gas fees |
| Alpha Vantage 429 error | Free tier exhausted (25 req/day). Wait for daily reset or switch to Finnhub |
| Prisma client error | Run `npx prisma generate` again |
| LLM output fails Zod validation | Normal — system auto-retries 2x then falls back to NO_TRADE |
| Concurrent cycle conflict (409) | Previous cycle still running. Wait for completion (max 3 minutes) |
