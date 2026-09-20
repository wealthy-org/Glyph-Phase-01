# Glyph Phase 01 — Developer Operations & Tooling Guide

> **Buku Panduan Operasional & Tooling Mandiri Developer**  
> Dokumen ini dirancang agar developer baru maupun existing dapat mengelola on-chain identity, smart contract, wallet, database, testing, serta siklus kognitif Glyph secara mandiri tanpa bergantung pada AI assistant.

---

## Daftar Isi

1. [Daftar Alat & Skrip CLI (Tooling Catalog)](#1-daftar-alat--skrip-cli-tooling-catalog)
2. [SOP Penggantian Primary Wallet](#2-sop-penggantian-primary-wallet)
3. [Manajemen Akun On-Chain & Testnet ETH](#3-manajemen-akun-on-chain--testnet-eth)
4. [Eksekusi Siklus Kognitif & Testing](#4-eksekusi-siklus-kognitif--testing)
5. [Operasi Database & Seeding](#5-operasi-database--seeding)
6. [Troubleshooting Mandiri (Gotchas & Solusi)](#6-troubleshooting-mandiri-gotchas--solusi)

---

## 1. Daftar Alat & Skrip CLI (Tooling Catalog)

Seluruh skrip otomasi berada di direktori `scripts/`. Anda dapat menjalankannya langsung via `npx tsx <path>` atau menggunakan shortcut `npm run`.

### 1.1 Skrip On-Chain & Wallet (`scripts/onchain/`)

| Skrip | Perintah | Fungsi & Kapan Digunakan |
|---|---|---|
| **update-wallet.ts** | `npx tsx scripts/onchain/update-wallet.ts` | Sinkronisasi wallet baru ke Database (`agent_wallets`) dan memanggil `setAgentWallet()` pada smart contract `IdentityRegistry`. |
| **verify-wallet.ts** | `npx tsx scripts/onchain/verify-wallet.ts` | Membaca blockchain dan DB untuk memverifikasi apakah wallet on-chain cocok 100% dengan database. |
| **generate-wallet.ts** | `npx tsx scripts/onchain/generate-wallet.ts` | Membuat private key & public address Ethereum baru untuk kebutuhan testnet / smart account signer. |
| **transfer-eth.ts** | `npx tsx scripts/onchain/transfer-eth.ts` | Mengirim native ETH (Robinhood Testnet) dari signer account ke Glyph wallet untuk biaya gas transaksi. |
| **register-agent.ts** | `npx tsx scripts/onchain/register-agent.ts` | Mencetak NFT ERC-8004 Identity baru di kontrak `IdentityRegistry` jika mendaftarkan agent baru. |
| **verify-setup.ts** | `npx tsx scripts/onchain/verify-setup.ts` | Audit menyeluruh konektivitas RPC, saldo signer, kontrak identity, dan decision registry. |
| **verify-trade-onchain.ts** | `npx tsx scripts/onchain/verify-trade-onchain.ts` | Memvalidasi apakah decision hash sebuah trade tercatat di `DecisionRegistry`. |
| **execute-decision-once.ts** | `npx tsx scripts/onchain/execute-decision-once.ts` | Menulis 1 keputusan trade langsung ke `DecisionRegistry` on-chain untuk pengetesan. |

### 1.2 Skrip Pengujian & Simulasi (`scripts/test/`)

| Shortcut NPM | Skrip Sumber | Fungsi |
|---|---|---|
| `npm run test:analysis` | `scripts/test/preview-risk-analysis.ts` | Melihat output analisis fundamental, teknikal, dan risk engine tanpa membuat trade. |
| `npm run test:decision` | `scripts/test/test-decision.ts` | Menguji pipeline pembentukan keputusan trading oleh LLM (OpenRouter). |
| `npm run test:lifecycle` | `scripts/test/test-lifecycle.ts` | Menguji alur lengkap dari snapshot riset → analisis → evaluasi polis risiko. |
| `npm run test:cycle` | `scripts/test/test-cycle.ts` | Menjalankan 1 siklus kognitif penuh lokal (serupa dengan cron). |
| `npm run test:research` | `scripts/test/test-research.ts` | Menguji fetching live data pasar dari Alpha Vantage / Finnhub. |
| `npm run test:decision-coverage`| `scripts/test/test-decision-coverage.ts` | Menguji variasi skenario market (bullish, bearish, volatile) pada decision engine. |

### 1.3 Skrip Database & Seeding (`scripts/seed/`)

| Shortcut NPM | Skrip Sumber | Fungsi |
|---|---|---|
| `npm run db:reset` | `prisma/seed.ts` | Hard reset database Supabase dan mengisi data awal (Agent, Safe Wallet, Treasury $1,000, Policy). |
| `npm run seed:v2` | `scripts/seed/seed-v2.ts` | Mengisi data simulasi historis siklus kognitif versi 2. |
| `npm run seed:trades` | `scripts/seed/seed-trades.ts` | Mengisi riwayat trade contoh untuk pengujian tabel `/trades`. |
| `npm run reset:trades` | `scripts/seed/reset-trades.ts` | Menghapus data posisi dan trade tanpa menghapus profil agent. |

---

## 2. SOP Penggantian Primary Wallet

Setiap kali Anda ingin mengganti alamat Primary Wallet Glyph (misal: mengganti ke wallet Safe baru atau EOA baru), pahami bahwa ada **4 layer** yang harus sinkron:

```
[1. .env file] ────────► [3. Database (agent_wallets)]
       │                               ▲
       ▼                               │ (disinkronkan via script)
[2. UI Fallback (data.ts)]     [4. Smart Contract (IdentityRegistry.sol)]
```

### Langkah Cepat (3 Langkah):

#### Langkah 1: Update `.env`
Buka file `.env` di root project dan ganti nilai variabel berikut dengan wallet baru:
```env
NEXT_PUBLIC_GLYPH_WALLET_ADDRESS=0xAlamatWalletBaruAnda
```

#### Langkah 2: Jalankan Skrip Sinkronisasi Otomatis
Jalankan skrip berikut di terminal:
```bash
npx tsx scripts/onchain/update-wallet.ts
```

Skrip ini akan secara otomatis:
1. Meng-update record pada tabel database `agent_wallets`.
2. Menghubungi RPC Robinhood Testnet.
3. Memeriksa apakah signer (`SMART_ACCOUNT_OWNER_PRIVATE_KEY`) adalah pemilik NFT Agent #3.
4. Menjalankan fungsi `setAgentWallet(agentId, newWallet)` ke smart contract `IdentityRegistry`.
5. Menunggu receipt transaksi hingga terkonfirmasi on-chain.

#### Langkah 3: Verifikasi Hasilnya
Pastikan semuanya 100% valid dengan menjalankan:
```bash
npx tsx scripts/onchain/verify-wallet.ts
```
Jika sukses, output terminal akan menunjukkan:
```text
DB Wallet Address:   0xAlamatWalletBaruAnda
Expected Wallet:     0xAlamatWalletBaruAnda
Apakah Cocok:        TERBUKTI 100% VALID ✅
```

*(Opsional)* Perbarui juga nilai fallback di file [src/features/identity/data.ts](file:///c:/Users/ASUS/Desktop/glyph-phase01/src/features/identity/data.ts) pada baris `primaryWallet:` agar jika koneksi database sedang offline, tampilan UI tetap konsisten.

---

## 3. Manajemen Akun On-Chain & Testnet ETH

### 3.1 Detail Jaringan (Robinhood Chain Testnet)

| Parameter | Nilai |
|---|---|
| **Network Name** | Robinhood Chain Testnet |
| **Chain ID** | `46630` |
| **RPC URL** | `https://rpc.testnet.chain.robinhood.com` |
| **Currency** | `ETH` |
| **Block Explorer** | `https://explorer.testnet.chain.robinhood.com` |

### 3.2 Kontrak Utama yang Terdeploy

| Kontrak | Alamat Kontrak Testnet |
|---|---|
| **Identity Registry (ERC-8004)** | `0x66399E25D3FBb5De462d06dE835D07B2957060D2` |
| **Decision Registry** | `0x7Ae7f962DC15e65De46a5b4d43744C7ed750B525` |

### 3.3 Membuat Keypair Wallet Baru
Jika Anda butuh membuat private key / wallet address baru untuk signer atau agent:
```bash
npx tsx scripts/onchain/generate-wallet.ts
```
Skrip akan mencetak:
- `Address`: Public address (simpan di `.env` sebagai `NEXT_PUBLIC_GLYPH_WALLET_ADDRESS`)
- `Private Key`: Private key signer (simpan di `.env` sebagai `SMART_ACCOUNT_OWNER_PRIVATE_KEY` — **JANGAN PERNAH DIBAGIKAN KE PUBLIK**)

### 3.4 Mengisi Saldo Gas Testnet ETH
Signer akun (`SMART_ACCOUNT_OWNER_PRIVATE_KEY`) harus memiliki saldo ETH untuk membayar gas fee transaksi on-chain.
Jika signer Anda memiliki saldo ETH berlebih dan ingin mengirimkan sebagian ke Glyph Wallet:
```bash
npx tsx scripts/onchain/transfer-eth.ts
```

---

## 4. Eksekusi Siklus Kognitif & Testing

Siklus kognitif Glyph berjalan otomatis tiap hari via cron, namun developer dapat memicu dan mengujinya kapan saja secara lokal.

### 4.1 Menjalankan Siklus Penuh secara Lokal
```bash
npm run test:cycle
```
Alur eksekusi internal yang dijalankan:
1. **Research Stage**: Mengambil live price & technical indicators aset (NVDA, AAPL, MSFT, dsb.).
2. **Analysis Stage**: Menjalankan evaluasi fundamental, teknikal, dan katalis pasar melalui LLM.
3. **Risk Stage**: Memeriksa batasan polis risiko (leverage maksimal, exposure modal, drawdown).
4. **Decision Stage**: Menentukan aksi (`OPEN_LONG`, `OPEN_SHORT`, `HOLD`, atau `NO_TRADE`).
5. **On-Chain Attestation**: Menulis hash keputusan ke smart contract `DecisionRegistry`.
6. **Execution / Simulation**: Mengupdate floating position atau menutup trade dan merefleksikan lesson ke memori adaptif.

### 4.2 Memicu Siklus via Endpoint API (Mirip Cron Production)
Jika Next.js development server Anda sedang berjalan di `http://localhost:3000`:
```bash
curl -X POST http://localhost:3000/api/cron/glyph-cycle \
  -H "Authorization: Bearer <CRON_SECRET_DARI_ENV>"
```
*Catatan: Nilai `CRON_SECRET` dapat dilihat di file `.env`.*

### 4.3 Menguji Ketahanan Polis Risiko (Risk Policy Preview)
Untuk melihat bagaimana Risk Engine mengevaluasi keputusan tanpa mengubah saldo treasury:
```bash
npm run test:analysis
```

---

## 5. Operasi Database & Seeding

Project ini menggunakan Prisma ORM terhubung ke PostgreSQL (Supabase).

### 5.1 Sinkronisasi Skema Prisma ke Database
Jika Anda mengubah file `prisma/schema.prisma`:
```bash
# 1. Regenerasi Prisma Client TypeScript
npx prisma generate

# 2. Push perubahan skema ke database tanpa migration file (khusus dev/testnet)
npx prisma db push
```

### 5.2 Reset Database Bersih
Jika database kotor atau Anda ingin mengembalikan kondisi awal demo:
```bash
npm run db:reset
```
*Peringatan: Perintah ini menghapus seluruh data tabel dan mengisinya kembali dari `prisma/seed.ts`.*

---

## 6. Troubleshooting Mandiri (Gotchas & Solusi)

### Masalah 1: "Signer is not NFT owner, skipped on-chain contract update"
* **Penyebab**: Private key yang ada di `SMART_ACCOUNT_OWNER_PRIVATE_KEY` bukan merupakan address pemilik NFT Agent #3 di smart contract `IdentityRegistry`.
* **Solusi**:
  1. Jalankan `npx tsx scripts/onchain/verify-wallet.ts` untuk melihat address pemilik NFT (`NFT Identity Owner`).
  2. Pastikan `SMART_ACCOUNT_OWNER_PRIVATE_KEY` di `.env` adalah private key milik address tersebut.

### Masalah 2: Hydration Error pada UI (`Text content does not match server-rendered HTML`)
* **Penyebab**: Penggunaan objek tanggal `new Date()` atau `Date.now()` langsung pada rendering pertama komponen `"use client"`. SSR server merender detik yang berbeda dengan saat browser melakukan re-render hidrasi.
* **Solusi Baku**:
  1. Gunakan state `mounted`:
     ```tsx
     const [mounted, setMounted] = useState(false);
     useEffect(() => { setMounted(true); }, []);
     ```
  2. Berikan fallback statis sebelum `mounted === true` (contoh: `"--:--:-- UTC"`).
  3. Tambahkan atribut `suppressHydrationWarning` pada elemen `<span>` pembungkus timestamp live.

### Masalah 3: Transaksi On-Chain Gagal / Timeout
* **Penyebab**: RPC Robinhood Testnet sedang lambat atau signer kehabisan saldo ETH untuk gas.
* **Solusi**:
  1. Jalankan `npx tsx scripts/onchain/verify-setup.ts` untuk melihat status saldo ETH signer.
  2. Buka explorer testnet `https://explorer.testnet.chain.robinhood.com` untuk memastikan jaringan tidak mengalami reorg / outage.

### Masalah 4: Conflict 409 pada Siklus Cron ("Cycle already running")
* **Penyebab**: Siklus kognitif sebelumnya masih berjalan di background (durasi maksimal 3 menit).
* **Solusi**: Tunggu 2-3 menit hingga `agent_runs` selesai, atau periksa log error di terminal terminal dev server.

---

> **Dokumentasi Terkait Lainnya:**
> - [DOCS.md](file:///c:/Users/ASUS/Desktop/glyph-phase01/docs/DOCS.md) — Dokumentasi arsitektur umum & panduan deployment Vercel
> - [BRIEF.md](file:///c:/Users/ASUS/Desktop/glyph-phase01/docs/BRIEF.md) — Spesifikasi produk lengkap & tokenomik Phase 01
> - [IdentityRegistry.sol](file:///c:/Users/ASUS/Desktop/glyph-phase01/contracts/IdentityRegistry.sol) — Source code smart contract ERC-8004 Identity Registry
