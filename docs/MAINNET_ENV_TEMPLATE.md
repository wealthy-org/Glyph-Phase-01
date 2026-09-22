# GLYPH PHASE 01 — MAINNET ENVIRONMENT CONFIGURATION TEMPLATE

> **SECURITY NOTICE:**
> Never commit `.env` or any file containing private keys, secrets, or API keys to version control.
> This template only defines keys, variable names, and public network parameters.

---

## 1. Network Configuration (Robinhood Chain Mainnet)

| Environment Variable | Mainnet Value | Status | Description |
| :--- | :--- | :--- | :--- |
| `NEXT_PUBLIC_CHAIN_ID` | `4663` | **Ready** | Robinhood Chain Mainnet Chain ID (Arbitrum Nitro L2) |
| `NEXT_PUBLIC_RPC_URL` | `https://rpc.mainnet.chain.robinhood.com` | **Ready** | Public mainnet RPC endpoint |
| `BLOCK_EXPLORER_URL` | `https://robinhoodchain.blockscout.com` | **Ready** | Mainnet Blockscout explorer base URL |
| `NEXT_PUBLIC_BLOCK_EXPLORER_URL` | `https://robinhoodchain.blockscout.com` | **Ready** | Client-facing Blockscout explorer base URL |

---

## 2. Onchain Smart Contracts

| Environment Variable | Mainnet Value | Status | Action Required |
| :--- | :--- | :--- | :--- |
| `IDENTITY_REGISTRY_CONTRACT_ADDRESS` | `0x8004A169FB4a3325136EB29fA0ceB6D2e539a432` | **Verified on Mainnet** | Official ERC-8004 canonical IdentityRegistry. No deployment needed. |
| `DECISION_REGISTRY_CONTRACT_ADDRESS` | `0x4ce11C76a6BBe68d8F0694f668c2Aa2e4c7280Df` | **Verified on Mainnet (Block 69636942)** | Deployed via `contracts/DecisionRegistry.sol` (Sourcify Verified). |

---

## 3. Agent Identity & Wallet Strategy

| Environment Variable | Mainnet Value | Status | Action Required |
| :--- | :--- | :--- | :--- |
| `GLYPH_AGENT_ID` | `485` | **Registered on Mainnet** | Minted via `register("/agents/glyph.json")` (Block 69599556). |
| `NEXT_PUBLIC_GLYPH_AGENT_ID` | `485` | **Registered on Mainnet** | Matches `GLYPH_AGENT_ID` for UI components. |
| `NEXT_PUBLIC_GLYPH_WALLET_ADDRESS` | `0x1Ba1BBeC38CAf4454252f8Bd87245a41919dd27C` | **Configured** | User's MetaMask EOA — Primary Glyph wallet & onchain owner/agent wallet. |
| `NEXT_PUBLIC_REGISTRATION_TX` | `0x7bdb016a6ae01709d2fe5548593644ace465fae607e9cf51fe4a22a07556e794` | **Confirmed (Block 69599556)** | Transaction hash from ERC-8004 registration on mainnet. |

---

## 4. Operational Signer Key (Backend Only)

| Environment Variable | Mainnet Strategy | Status | Purpose |
| :--- | :--- | :--- | :--- |
| `SMART_ACCOUNT_OWNER_PRIVATE_KEY` | Server-side relayer key (`0xB635eFd761D352ed8a74166a292c8969AD541c8E`) | Funded (0.000978 ETH) | Automated backend signer to pay gas for `commitDecision()` during cron cycles. Never exposed to frontend or client. |

---

## 5. Unchanged Core Variables

The following environment variables are network-agnostic and remain unchanged from testnet:
- `DATABASE_URL` (Supabase PostgreSQL)
- `DIRECT_URL` (Supabase Session Pooler / direct connection)
- `OPENROUTER_API_KEY` (LLM inference)
- `OPENROUTER_MODEL`
- `FINNHUB_API_KEY` (Market data)
- `POLYGON_API_KEY` (Market data)
- `CRON_SECRET` (Authorization bearer token for autonomous cron cycle)

---

## 6. Migration Application Sequence

```
[1] Deploy DecisionRegistry.sol
        │
        ▼
[2] Obtain DecisionRegistry address → set DECISION_REGISTRY_CONTRACT_ADDRESS
        │
        ▼
[3] Call IdentityRegistry.register("/agents/glyph.json")
        │
        ▼
[4] Obtain Agent ID & Tx Hash → set GLYPH_AGENT_ID, NEXT_PUBLIC_GLYPH_AGENT_ID, NEXT_PUBLIC_REGISTRATION_TX
        │
        ▼
[5] Initialize/link Mainnet Wallet → set NEXT_PUBLIC_GLYPH_WALLET_ADDRESS
        │
        ▼
[6] Apply mainnet .env to production and verify application builds cleanly
```
