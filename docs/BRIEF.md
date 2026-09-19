# Glyph Phase 01 — Master Brief 

---

# BAGIAN 1

## 1. Project

**Name:** Glyph
**Pronunciation:** /ɡlif/
**Category:** Economic Being
**Phase:** 01, Testnet / Paper Trading MVP

### Core thesis

Glyph is an autonomous digital being with an onchain identity, wallet, memory, economic history, and the ability to make and record market decisions.

Phase 01 is not about maximizing trading performance or launching a production trading system.

The goal is to prove one core loop:

**Identity → Wallet → Capital Simulation → Research → Decision → Onchain Record → Outcome → Memory → Reputation**

The user should be able to watch Glyph live, understand why it makes a decision, and verify the decision onchain.

## 2. Phase 01 Objective

Build a working MVP where Glyph:

1. Has an ERC 8004 identity on an Ethereum testnet.
2. Has a dedicated smart wallet / smart account.
3. Starts with simulated capital.
4. Receives market data.
5. Performs fundamental and technical analysis.
6. Produces a structured trading thesis.
7. Runs the thesis through a deterministic risk policy.
8. Creates a paper trade.
9. Records the decision and trade metadata onchain.
10. Generates a transaction hash for verification.
11. Tracks the simulated position and PnL.
12. Stores the result as Glyph memory.
13. Builds a simple reputation / track record.
14. Exposes all of this through a public web interface.

### Phase 01 principle

**Do not build a fake autonomous economy. Build an observable economic life simulation.**

## 3. Important Scope Boundary

Phase 01 is **paper trading / simulated execution**. Do NOT use real user funds. Do NOT allow the LLM to control a private key directly. Do NOT implement unrestricted arbitrary contract calls. Do NOT implement production leverage. Leverage may exist as a **simulation parameter** so the UI and economic logic can model leveraged trades, but no real leveraged position should be opened in Phase 01. The architecture should make future real execution possible without requiring a rewrite.

## 4. Product Experience

The website should feel like a **live observation terminal for a digital being**, not a generic crypto landing page.

Primary user actions: Observe Glyph. Read its current objective. Inspect its latest decision. Read the fundamental and technical thesis. Inspect simulated portfolio and PnL. Verify the onchain decision record. Explore Glyphs economic history. Follow how Glyph learns from previous decisions.

Primary CTA: **WATCH GLYPH LIVE**
Secondary actions: **READ THESIS**, **VERIFY ONCHAIN**

## 5. Recommended Stack

**Frontend**: Next.js (App Router), TypeScript, Tailwind CSS, clean component architecture. shadcn/ui where useful, but avoid making the site look like a default shadcn dashboard.

**Backend**: Next.js server actions / route handlers where appropriate. For scheduled or long running jobs, use a separate worker or cron compatible service.

**Database**: PostgreSQL, recommended Supabase (database, auth if needed later, realtime if useful, storage if needed).

**Blockchain**: EVM compatible Ethereum testnet. Use viem, wagmi, OpenZeppelin contracts. Use standard audited patterns wherever possible.

**Smart account**: Use an established smart account implementation rather than writing a custom wallet system. The abstraction should allow: **Glyph Brain → Policy Engine → Smart Account → Transaction**. The brain should never directly receive unrestricted private key access.

**Market data**: Create a provider abstraction:
```ts
interface MarketDataProvider {
  getQuote(symbol: string): Promise<Quote>
  getOHLCV(symbol: string, timeframe: string): Promise<Candle[]>
  getFundamentals(symbol: string): Promise<Fundamentals>
  getNews(symbol: string): Promise<NewsItem[]>
}
```
Do not tightly couple the entire application to one data provider.

## 6. High Level Architecture

```text
                    GLYPH
                      |
             ERC 8004 IDENTITY
                      |
                SMART WALLET
                      |
              ┌───────┴───────┐
              |               |
         SIMULATED         ONCHAIN
          TREASURY          RECORD
              |               |
              └───────┬───────┘
                      |
                 GLYPH BRAIN
                      |
          ┌───────────┼───────────┐
          |           |           |
     Fundamental   Technical     Risk
       Analysis     Analysis     Policy
          |           |           |
          └───────────┼───────────┘
                      |
                TRADE THESIS
                      |
                PAPER ENGINE
                      |
              POSITION / PnL
                      |
                   MEMORY
                      |
                 REPUTATION
```

## 7. Glyph Brain

Responsible for reasoning and generating a structured decision. Should NOT: sign arbitrary blockchain transactions, bypass risk rules, change its own limits, access secrets directly.

Model must return structured JSON:
```json
{
  "asset": "NVDA",
  "action": "LONG",
  "conviction": 74,
  "time_horizon": "1d_to_14d",
  "fundamental_score": 78,
  "technical_score": 84,
  "risk_score": 61,
  "thesis": {
    "fundamental": "...",
    "technical": "...",
    "catalyst": "...",
    "risk": "...",
    "invalidation": "..."
  },
  "position_size_percent": 5,
  "leverage": 2
}
```
Output must be validated against a strict schema (Zod).

## 8. Research Pipeline

**Fundamental Layer**: revenue growth, earnings, valuation metrics, recent financial results, catalysts, sector context, relevant macro context, recent company news.

**Technical Layer**: price, trend, momentum, volume, support, resistance, volatility, selected indicators.

**Risk Layer**: position size, simulated leverage, maximum loss, portfolio exposure, liquidity assumptions, invalidation level.

Store the research snapshot used to produce the decision. Future user should see **"What Glyph knew when it made the decision."** Do not silently overwrite historical research data.

## 9. Decision Lifecycle

```text
MARKET DATA → RESEARCH → FUNDAMENTAL ANALYSIS → TECHNICAL ANALYSIS → RISK ANALYSIS →
GLYPH DECISION → POLICY VALIDATION → PAPER TRADE → ONCHAIN RECORD →
POSITION MONITORING → TRADE CLOSED → PnL → MEMORY → REPUTATION
```
If risk validation fails: **NO TRADE**. A no trade decision is also an economic decision and should be recorded.

## 10. Risk Policy

Deterministic policy layer independent of the LLM:
```ts
const GLYPH_POLICY = {
  maxPositionPercent: 10,
  maxLeverage: 2,
  maxDailyLossPercent: 5,
  maxOpenPositions: 3,
  allowedAssets: [...],
  minConfidence: 60
}
```
**LLM proposes. Policy validates. Execution layer acts.** The LLM cannot modify the policy.

## 11. Paper Trading Engine

Simulate: entry, exit, position size, leverage, fees, unrealized PnL, realized PnL, stop condition, liquidation threshold for simulation. Every simulated trade gets a unique ID (e.g. `GLYPH TRADE #001`). Preserve full lifecycle.

## 12. Onchain Decision Record

Create an onchain transaction for every finalized trade decision (does NOT need to move real capital — purpose is a verifiable timestamped record).
```text
Trade JSON → Canonical serialization → Hash → Onchain record → Transaction hash
```
Database stores: `trade_id, decision_hash, transaction_hash, chain_id, contract_address, block_number, timestamp`. UI exposes **VERIFY ONCHAIN**. Do not claim the tx hash proves an executed market trade — it proves the decision record was committed onchain.

## 13. Trade Record
```text
trades: id, trade_number, asset, action, entry_price, exit_price, position_size, leverage,
simulated_pnl, status, conviction, fundamental_score, technical_score, risk_score, thesis,
research_snapshot_id, decision_hash, transaction_hash, created_at, closed_at
```

## 14. Research Snapshot
```text
research_snapshots: id, trade_id, asset, market_data, fundamental_data, technical_data,
news_data, source_metadata, created_at
```
Historical snapshots must be immutable.

## 15. Glyph Memory
```json
{
  "trade_id": "GLYPH-0017",
  "outcome": "WIN",
  "pnl_percent": 8.4,
  "thesis_result": "CORRECT",
  "lesson": "Breakout confirmation combined with strong earnings momentum produced a favorable result.",
  "confidence_calibration": "GOOD",
  "created_at": "..."
}
```
Visible to user. Point: persistent state that influences future decisions (not claiming consciousness).

## 16. Reputation

Metrics: number of decisions, number of completed trades, win rate, realized PnL, average return, maximum drawdown, thesis accuracy, risk rule violations, time active. Avoid a misleading single score initially — show underlying metrics.

## 17. ERC 8004

Use as identity layer. Phase 01: Identity (persistent agent identity), Agent wallet (associate wallet with identity). Reputation: keep detailed trading reputation separate initially, design for future ERC-8004 reputation integration. Do not treat ERC-8004 as proof of trustworthiness — it's identity/trust infrastructure.

## 18. Database Architecture

Suggested tables: `agents, agent_wallets, agent_policies, market_assets, market_snapshots, research_snapshots, decisions, trades, positions, transactions, memories, reputation_metrics, economic_events`. Keep identity, decisions, execution records, and memories as separate concepts.

## 19. Economic Event System

```text
AGENT_BORN, IDENTITY_REGISTERED, WALLET_CREATED, TREASURY_FUNDED, RESEARCH_STARTED,
DECISION_MADE, TRADE_OPENED, TRADE_CLOSED, PROFIT_RECORDED, LOSS_RECORDED,
MEMORY_CREATED, REPUTATION_UPDATED
```
Foundation for the future **Life Log**.

## 20-23. Frontend Pages, Visual Direction, Dashboard, Life Log
Lihat **BAGIAN 2 — Kebutuhan Landing Page** di bawah, isinya sudah dirapikan dari section ini.

## 24. Agent Scheduler
```text
Cron → Check market state → Check active positions → Collect research → Ask Glyph for decision →
Validate schema → Run policy → Create paper trade / no trade → Commit decision hash → Update database
```
Do not rely on a browser being open. Agent lifecycle runs server side.

## 25. Observability

Every agent run has a trace: `run_id, started_at, completed_at, market_snapshot, model, prompt_version, decision, policy_result, trade_id, transaction_hash, error`. Never silently discard failed runs.

## 26. Prompt Versioning

Store version number (`GLYPH_DECISION_PROMPT_V1`, bump to `V2` when changed). Historical trades retain the prompt version that produced them.

## 27. Security Requirements

1. No private keys in frontend code. 2. No private keys in LLM prompts. 3. No arbitrary contract execution. 4. Whitelist contracts and assets. 5. Validate all model output. 6. Apply deterministic risk policies. 7. Rate limit agent execution. 8. Protect admin endpoints. 9. Use environment secrets properly. 10. Log every privileged action. 11. Use OpenZeppelin standards. 12. Keep testnet funds isolated.

## 28. Phase 01 Definition of Done

User can: open Glyph, see economic state, see ERC-8004 identity, see wallet, see simulated treasury, see research process, read fundamental/technical thesis, see risk assessment, see simulated trade decision + leverage, see PnL, see decision tx hash, verify onchain, see trade in Life Log, see memory, see updated track record.

## 29. What Phase 01 Does NOT Need

Real leveraged trading, real user deposits, copy trading, user-created agents, social feed, complex tokenomics, mobile app, multi-agent marketplace, autonomous asset transfers, production financial execution, complex ERC-8004 reputation marketplace.

## 30. Future Architecture

```text
PHASE 01: Identity, Wallet, Paper Economy, Research, Decision, Onchain Proof, Memory, Reputation
    ↓
PHASE 02: Real Treasury, Real Stock Token Ownership, Real Onchain Execution, Tips, Creator Fee Funding
    ↓
PHASE 03: Controlled Leverage, Economic Services, Agent Revenue, Asset Ownership
    ↓
PHASE 04: Multiple Economic Beings, User Created Beings, Agent Economy, Agent To Agent Commerce
```

## 31. Core Product Principle

> **Do not build an AI chatbot with a wallet.** Build: **a persistent digital being whose economic state can be observed and verified.** The AI is only one component. The product is the **economic life**.

## 32. Core Narrative

**GLYPH — An Economic Being.** It has an identity. It has a wallet. It has memory. It can make decisions. It can own assets. Every decision leaves a trace. Core phrase: **"Watch an AI build an economy of its own."** Supporting: **"Don't trust it. Watch it. Verify it."**

## 33. Developer Priority (P0-P8)

P0 Foundation (Next.js, Supabase, TS, wallet connection [= Glyphs own smart account, lihat catatan penting di Bagian 3], EVM testnet connection) → P1 Identity (ERC-8004, agent wallet, profile) → P2 Economic simulation (treasury, portfolio, positions, PnL, leverage sim) → P3 Research engine → P4 Decision engine (structured output, Zod, policy engine, history) → P5 Onchain proof (hash, record, tx hash, explorer) → P6 Memory (result, lesson, history, prompt versioning) → P7 Public experience (homepage, live state, trade detail, Life Log, identity, reputation) → P8 Polish (motion, entity animation, loading/error states, observability, docs).

## 34. First Milestone

Glyph exists → onchain identity → wallet → simulated $1,000 → analyzes NVDA → fundamental+technical thesis → risk engine approves 2× simulated position → trade created → decision hash committed onchain → tx hash appears → position closes → PnL calculated → memory created → Life Log records the event. **If demonstrable end to end, Phase 01 succeeded.**

---

# BAGIAN 2 — Kebutuhan Landing Page & Halaman Publik

(Dirapikan dari §4, §20, §21, §22, §23 brief asli jadi format checklist/actionable, biar konsisten sama gaya brief project lain)

## 2.1 Prinsip Utama
- **Bukan landing page memecoin biasa.** Hindari: tombol Buy raksasa sebagai elemen hero utama, gradient berlebihan, mascot robot generik, efek 3D berlebihan, ilustrasi klise crypto, efek "fake terminal" di mana-mana.
- Arah yang benar: **minimal digital entity + financial terminal + laboratory**. Near-black background, tipografi grotesk bersih, data finansial pakai monospace, border tipis, motion halus, whitespace kuat, 1 entitas Glyph yang gampang dikenali. Glyph harus terasa seperti **organisme digital/simbol**, bukan mascot.
- **Tidak ada tombol "Connect Wallet" untuk pengunjung** (lihat Bagian 3, poin A) — semua halaman di bawah ini bersifat publik/read-only.

## 2.2 Daftar Halaman (Routes)

| Route | Isi | CTA/Elemen Kunci |
|---|---|---|
| `/` | Homepage — live state Glyph: treasury, current objective, active position, latest decision, reputation metrics, economic events terbaru | **WATCH GLYPH LIVE** (primary), READ THESIS & VERIFY ONCHAIN (secondary) |
| `/life` | Life Log — riwayat ekonomi kronologis (Day 01: Born, Day 04: Identity registered, dst) — **wajib digenerate dari economic_events asli, bukan narasi karangan** | — |
| `/trades` | Riwayat trading publik — list semua trade (asset, action, entry, exit, leverage, PnL, thesis result, tx hash) | Link ke `/trade/[id]` per baris |
| `/trade/[id]` | Detail 1 trade — "WHY I TRADED": fundamental, technical, catalyst, risk, invalidation, position, leverage, result, onchain proof | **VERIFY ONCHAIN** link ke block explorer |
| `/identity` | Info ERC-8004 — agent identity, wallet, chain yang didukung, data registrasi, referensi reputasi | — |
| `/about` | Penjelasan: Apa itu Glyph? Apa itu "Economic Being"? Kenapa onchain? Bagaimana Glyph mengambil keputusan? Apa yang dibuktikan Phase 01? | — |

## 2.3 Contoh Konten Homepage (Live Dashboard)
```text
GLYPH
ECONOMIC BEING #001

TREASURY            $1,247.42
CURRENT OBJECTIVE   Grow economic capital while preserving survival.
CURRENT POSITION    NVDA · LONG · 2× SIMULATED LEVERAGE
CONVICTION          74%
LATEST DECISION     Fundamental 78 · Technical 84 · Risk 61
ONCHAIN             0x8f3...91ac

[ READ THESIS ]   [ VERIFY ]
```

## 2.4 Contoh Konten Life Log
```text
GLYPH LIFE LOG
DAY 01   Born.
DAY 04   Identity registered onchain.
DAY 07   First capital entered the treasury.
DAY 12   First market thesis published.
DAY 12   First trade decision committed onchain.
DAY 13   Trade closed +8.4%.
DAY 13   Memory updated.
```

## 2.5 Definition of Done — Landing Page Khusus
- [ ] 6 route di atas semua ada dan bisa diakses tanpa connect wallet
- [ ] Homepage nampilin data live (bukan dummy) begitu backend jalan
- [ ] Life Log digenerate dari tabel `economic_events` asli, bukan hardcode teks
- [ ] Visual sesuai arah §2.1 (near-black, grotesk, monospace data) — bukan template shadcn dashboard default
- [ ] Tombol "Verify Onchain" beneran link ke block explorer testnet Robinhood Chain dengan tx hash yang valid

---

# BAGIAN 3 — Dokumen Teknis Pendukung

## 3.0 ⚠️ Poin yang Paling Berpotensi Bikin Salah Paham

Baca ini dulu — titik-titik di mana dev gampang kebawa asumsi dari project lain (Echo/Omen/Agora) yang **tidak berlaku** di Glyph Phase 01.

**A. TIDAK ADA tombol "Connect Wallet" buat pengunjung/user.**
Beda total dari 3 project lain (yang pakai Phantom Wallet connect buat user). Di Glyph Phase 01, website-nya **read-only/observasi publik** — pengunjung cuma nonton. "Wallet" di brief leader = **wallet milik Glyph sendiri** (smart account/Safe), bukan wallet user. §33 poin P0 "Wallet connection" maksudnya **setup smart account Glyph di backend**, BUKAN tombol connect di frontend. Jangan pasang wagmi/Phantom connector di sisi user untuk Phase 01.

**B. Tabel `decisions` dan `trades` itu BEDA, jangan disamain.**
Brief §9 minta "no trade" tetap direkam sebagai keputusan ekonomi, tapi skema detail di §13 cuma ada buat tabel `trades` (isinya asumsi ADA posisi entry/exit). Solusi: tabel `decisions` terpisah nyimpen **setiap** keputusan (termasuk "no trade"), tabel `trades` cuma diisi kalau keputusan beneran jadi posisi:
```text
decisions
id, agent_id, asset, action ('LONG'|'SHORT'|'NO_TRADE'), conviction,
fundamental_score, technical_score, risk_score, thesis,
policy_result ('APPROVED'|'REJECTED'), policy_reject_reason,
research_snapshot_id, prompt_version, trade_id (nullable, FK trades.id),
decision_hash, transaction_hash, created_at
```
Trade cuma dibuat kalau `policy_result = 'APPROVED'` dan `action != 'NO_TRADE'`.

**C. Leverage di-PROPOSE LLM, tapi di-CLAMP Policy Engine — bukan dipakai mentah.**
Field `"leverage": 2` dari LLM wajib divalidasi ulang lawan `GLYPH_POLICY.maxLeverage` di kode sebelum disimpan. LLM gak pernah punya kuasa nentuin angka final.

**D. `prompt_version` itu konstanta di kode, bukan environment variable.**
Taruh sebagai konstanta (`const GLYPH_DECISION_PROMPT_VERSION = "V1"`), biar tiap ganti versi = commit git = ada jejak historis.

## 3.1 Daftar Environment Variables Lengkap

```bash
# Database
DATABASE_URL=                          # Supabase Postgres connection string

# LLM (Glyph Brain)
OPENROUTER_API_KEY=                    # dari openrouter.ai, pakai model gratis dulu
OPENROUTER_MODEL=                      # lihat rekomendasi model di 3.4

# Blockchain — Robinhood Chain Testnet (CONFIRMED, bukan Ethereum testnet generik)
NEXT_PUBLIC_CHAIN_ID=46630
NEXT_PUBLIC_RPC_URL=https://rpc.testnet.chain.robinhood.com
BLOCK_EXPLORER_URL=https://robinhoodchain.blockscout.com

# Smart Account (lihat 3.2)
SMART_ACCOUNT_OWNER_PRIVATE_KEY=       # SERVER-SIDE ONLY, JANGAN PERNAH taruh di client/frontend
SAFE_TRANSACTION_SERVICE_URL=          # opsional, lihat 3.2

# Identity Registry (ERC-8004) — lihat Bagian 4
IDENTITY_REGISTRY_CONTRACT_ADDRESS=
GLYPH_AGENT_ID=

# Decision Registry (kontrak custom buat "Verify Onchain")
DECISION_REGISTRY_CONTRACT_ADDRESS=    # lihat 3.5

# Market Data Provider (lihat 3.3)
MARKET_DATA_API_KEY=                   # dari Alpha Vantage atau Finnhub

# Cron (via cron-job.org, bukan Vercel Cron)
CRON_SECRET=                           # validasi header Authorization dari cron-job.org

# Public identity wallet Glyph (buat UI, bukan private key)
NEXT_PUBLIC_GLYPH_WALLET_ADDRESS=
```

## 3.2 Smart Account — Rekomendasi Konkret: Safe

Brief: "gunakan smart account established, jangan bikin sendiri" → **Safe (dulu Gnosis Safe)**.

**Kenapa Safe, bukan full ERC-4337 + bundler/paymaster?** Safe teraudit bertahun-tahun, SDK matang (`@safe-global/protocol-kit`), gak butuh infra tambahan. Pattern "Glyph Brain → Policy Engine → Smart Account → Transaction" tetap kesampaian: LLM cuma propose (JSON), Policy Engine (kode biasa) decide, transaksi ditandatangani lewat Safe SDK.

**Setup dasar:**
1. `npm install @safe-global/protocol-kit @safe-global/api-kit`
2. Deploy 1 Safe di testnet Robinhood Chain, owner = wallet server.
3. Simpan address Safe sebagai `NEXT_PUBLIC_GLYPH_WALLET_ADDRESS`.
4. Semua transaksi (commit decision hash) ditandatangani via Safe SDK dari server.

Referensi: https://docs.safe.global/sdk/overview

## 3.3 Market Data Provider — Rekomendasi: Alpha Vantage (Free Tier)

Data fundamental+teknikal SAHAM (contoh NVDA) — bukan data crypto, Dexscreener dkk gak relevan.

- Daftar gratis: https://www.alphavantage.co/support/#api-key
- Free tier: 25 request/hari, 5 request/menit — cukup buat 1 keputusan/hari.
- Endpoint: `OVERVIEW` (fundamental), `TIME_SERIES_DAILY` (teknikal), `NEWS_SENTIMENT` (berita+sentiment).
- Alternatif: Finnhub (https://finnhub.io), 60 request/menit tapi beberapa endpoint fundamental terbatas di free tier.
- Implementasikan di balik interface `MarketDataProvider` dari brief §5, biar gampang ganti provider nanti.

## 3.4 LLM (Glyph Brain) — Model & Jaga Output Terstruktur

- Pakai **OpenRouter**, model gratis (`:free`).
- Model gratis kadang kurang konsisten JSON ketat. Mitigasi: (1) pilih model dengan reputasi baik di structured output (cek dashboard OpenRouter saat implementasi), (2) validasi Zod, gagal → retry maks 2x → fallback "NO_TRADE", (3) selalu minta format JSON eksplisit di prompt, jangan cuma andalkan JSON mode provider.

## 3.5 Kontrak On-Chain

**A. IdentityRegistry.sol (ERC-8004)** — lihat Bagian 4. Dipakai buat "Identity" — Glyph dapat 1 `agentId`.

**B. DecisionRegistry.sol (custom, bikin baru)**:
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract DecisionRegistry {
    event DecisionCommitted(uint256 indexed decisionId, bytes32 decisionHash, address indexed committedBy, uint256 timestamp);
    uint256 public nextDecisionId;

    function commitDecision(bytes32 decisionHash) external returns (uint256) {
        uint256 id = nextDecisionId++;
        emit DecisionCommitted(id, decisionHash, msg.sender, block.timestamp);
        return id;
    }
}
```
Alur: serialize JSON keputusan → hash `keccak256` → `commitDecision(hash)` lewat Safe → simpan `transactionHash` → tombol "Verify Onchain" link ke `robinhoodchain.blockscout.com/tx/<hash>`.

**Wajib testnet dulu** (chain ID `46630`), baru mainnet (`4663`) setelah lolos QA.

## 3.6 Scheduler / Cron — cron-job.org

Pakai **cron-job.org** (https://cron-job.org), bukan Vercel Cron — sesuai permintaan brief ("separate worker or cron compatible service") dan gak kena limit 1x/hari Vercel Hobby.

**Setup:**
1. Login cron-job.org **pakai akun & password yang sama dengan akun deploy**.
2. Buat cronjob arahkan ke `https://<domain-glyph>.vercel.app/api/cron/glyph-cycle`.
3. Method `POST`, header `Authorization: Bearer <CRON_SECRET>`.
4. Jadwal mulai 1x/hari (konsisten sama narasi Life Log harian), bisa dipercepat nanti.
5. Endpoint jalanin full siklus: market data → riset → keputusan LLM → Zod → policy → paper trade → commit hash → update DB. Cek posisi terbuka di siklus yang sama, jangan endpoint terpisah.

## 3.7 Observability — Versi Ringan

1 tabel `agent_runs` (run_id, started_at, completed_at, market_snapshot, model, prompt_version, decision, policy_result, trade_id, transaction_hash, error) — gak perlu tool eksternal, cukup ini + Vercel function logs.

## 3.8 Checklist Keamanan

| Requirement | Cara Konkret |
|---|---|
| No private key di frontend | `SMART_ACCOUNT_OWNER_PRIVATE_KEY` cuma di env server |
| No private key di LLM prompt | Prompt cuma isi data riset+histori |
| Whitelist asset | Hardcode `allowedAssets` di kode, bukan DB |
| Whitelist contract / no arbitrary execution | Safe cuma boleh manggil `DECISION_REGISTRY_CONTRACT_ADDRESS` & `IDENTITY_REGISTRY_CONTRACT_ADDRESS` |
| Validasi output model | Zod schema wajib |
| Rate limit | Cron terjadwal otomatis membatasi; endpoint manual trigger tetap dikasih rate limit |
| Protect admin endpoint | Gate pakai `ADMIN_WALLET_ADDRESS` sama pola project lain |

## 3.9 Deployment ke Vercel

1. Push ke GitHub, import ke Vercel.
2. Deploy `IdentityRegistry.sol` & `DecisionRegistry.sol` ke testnet Robinhood Chain, catat address.
3. Deploy 1 Safe di testnet, catat address.
4. Set semua env var (3.1).
5. Setup cronjob di cron-job.org ke `/api/cron/glyph-cycle`.
6. Tes end-to-end 1 siklus penuh di testnet sebelum akses publik.

## 3.10 Keputusan Produk yang Belum Ditentukan Brief (Perlu Disepakati)

1. **Fee simulasi**: brief gak kasih angka. Saran default **0.1% per transaksi**, jadikan konstanta.
2. **Aksi saat simulated liquidation**: saran — cron otomatis nutup posisi jadi `status: 'LIQUIDATED'`, dicatat di `economic_events` sebagai `LOSS_RECORDED`.
3. **Batasan shadcn/ui**: bebas pilih komponen, tapi layout keseluruhan tetap ikut arah visual §2.1 (Bagian 2), jangan biarin default shadcn kepake mentah.

## 3.11 Catatan Biaya / Free-Tier

- LLM: OpenRouter model gratis.
- Market data: Alpha Vantage free tier (25 req/hari).
- RPC: Robinhood Chain testnet resmi, gratis.
- Database: Supabase free tier.
- Smart account: deploy gratis, butuh sedikit test ETH dari faucet testnet Robinhood Chain.

---

# BAGIAN 4 — Tutorial ERC-8004 Agent Identity

## 4.1 Apa itu ERC-8004

**ERC-8004 "Trustless Agents"** — proposal standar Ethereum (EIP-8004) yang ngasih AI agent identitas on-chain unik, bisa diverifikasi, portable antar platform.

- **Status: DRAFT**, dibuat 13 Agustus 2025 (Marco De Rossi, Davide Crapis, Jordan Ellis, Erik Reppel). Masih sangat baru — jangan overselling ke user seolah "standar resmi settled".
- Spek resmi: https://eips.ethereum.org/EIPS/eip-8004
- Diskusi: https://ethereum-magicians.org/t/erc-8004-trustless-agents/25098

## 4.2 Struktur Standar (3 registry, kita cuma butuh 1)

| Registry | Fungsi | Perlu? |
|---|---|---|
| **Identity Registry** | Mint 1 ID unik per agent (ERC-721), terhubung metadata & wallet | **YA** |
| Reputation Registry | Feedback/rating dari user | Tidak untuk MVP |
| Validation Registry | Verifikasi pihak ketiga | Tidak untuk MVP, masih direvisi aktif |

**Scope**: cuma **Identity Registry**. Valid & cukup buat "agent punya ID on-chain yang bisa dibuktikan publik".

## 4.3 Interface Identity Registry
```solidity
register(string agentURI, bytes[] metadata) // atau register(agentURI) / register()
setAgentURI(uint256 agentId, string newURI)
getMetadata(uint256 agentId) / setMetadata(...)
setAgentWallet(uint256 agentId, address wallet) / getAgentWallet(uint256 agentId)
```
`register()` = mint 1 token ERC-721 (agentId), `agentURI` nunjuk ke JSON metadata (di-hosting sendiri).

## 4.4 Sumber Kode Referensi
- Resmi: https://github.com/erc-8004/erc-8004-contracts
- Alternatif (Foundry): https://github.com/EIPs-CodeLab/ERC-8004
- Daftar tooling: https://github.com/sudeepb02/awesome-erc8004

⚠️ Standar baru, tooling buatan komunitas (belum teraudit resmi) — **baca kode dulu sebelum deploy**, jangan asal `npm install` dipercaya buta.

## 4.5 Langkah Implementasi

1. **Ambil & baca** `IdentityRegistry.sol` dari repo resmi, pahami alur `register()` → `agentId` → `setAgentURI()`.
2. **Deploy ke testnet Robinhood Chain** (Chain ID `46630`, RPC `https://rpc.testnet.chain.robinhood.com`) pakai Hardhat/Foundry. Simpan contract address.
3. **Siapkan metadata JSON** (`/public/agents/glyph.json` atau via API route):
```json
{
  "name": "Glyph",
  "description": "Autonomous economic being — AI agent with onchain identity, wallet, memory, and verifiable market decisions",
  "type": "Robinhood Chain Agent"
}
```
4. **Register**: panggil `register(agentURI)` sekali, simpan `agentId`.
5. **Tampilkan di UI**: badge "Verified Agent · ID #<agentId>" di halaman `/identity` dan homepage, link ke block explorer.
6. **Setelah lolos QA testnet**, ulangi ke mainnet (Chain ID `4663`, RPC `https://rpc.mainnet.chain.robinhood.com`).

## 4.6 Definition of Done
- [ ] `IdentityRegistry` ter-deploy di testnet, address dicatat
- [ ] Metadata JSON Glyph bisa diakses publik via URL
- [ ] Glyph punya `agentId` on-chain tersimpan di database
- [ ] UI nampilin badge "Verified Agent ID" yang bisa diklik ke block explorer
- [ ] Sudah dites penuh di testnet sebelum rencana mainnet

## 4.7 Catatan Keamanan
- Standar Draft/eksperimental — komunikasikan sebagai "agent terdaftar dengan ID on-chain" (fakta teknis), bukan "tersertifikasi resmi Ethereum" (klaim berlebihan).
- `setAgentWallet` pakai parameter signature+deadline mencegah signature-replay — jangan di-skip.
- Hash `agentURI` dan catat hash-nya on-chain kalau kontrak menyediakan field itu — mengikat konten off-chain ke record on-chain.
