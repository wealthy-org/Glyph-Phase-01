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
| `DECISION_REGISTRY_CONTRACT_ADDRESS` | `<TBD>` | **REQUIRES DEPLOYMENT** | Must deploy `contracts/DecisionRegistry.sol` to mainnet after approval & funding. |

---

## 3. Agent Identity & Wallet Strategy

| Environment Variable | Mainnet Value | Status | Action Required |
| :--- | :--- | :--- | :--- |
| `GLYPH_AGENT_ID` | `<TBD>` | **Awaiting Registration** | Returned when calling `register("/agents/glyph.json")` on IdentityRegistry. |
| `NEXT_PUBLIC_GLYPH_AGENT_ID` | `<TBD>` | **Awaiting Registration** | Matches `GLYPH_AGENT_ID` for UI components. |
| `NEXT_PUBLIC_GLYPH_WALLET_ADDRESS` | `<TBD>` | **Awaiting Wallet Init** | Mainnet operational wallet / smart account. |
| `NEXT_PUBLIC_REGISTRATION_TX` | `<TBD>` | **Awaiting Registration** | Transaction hash from ERC-8004 registration on mainnet. |

---

## 4. Operational Signer Key

| Environment Variable | Mainnet Strategy | Status |
| :--- | :--- | :--- |
| `SMART_ACCOUNT_OWNER_PRIVATE_KEY` | Reuses existing EOA signer (`0xB635eFd761D352ed8a74166a292c8969AD541c8E`) | Ready (Requires gas funding on mainnet before transactions) |

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
