# Operations Guide — Glyph Phase 01

Panduan ringkas perintah operasional terminal untuk database, treasury, dan pengujian sistem.

---

## 1. Manajemen Database & Seeding

| Perintah | Deskripsi Singkat |
|---|---|
| `npm run seed:genesis` | **Kembali ke status awal lahir (06:30:00 UTC)**. Menghapus semua trade/keputusan, kas `$0.00`, dan Life Log hanya berisi 3 event Genesis. *(Tanpa perlu reset DB dulu)*. |
| `npm run db:reset-genesis` | **Reset database total lalu kembali ke Genesis**. Menghapus seluruh tabel dan data, termasuk snapshot riset serta activity log, lalu membuat ulang agent, policy, treasury kosong, dan 3 event Genesis. |
| `npm run fund:treasury` | **Menambah modal kas Treasury**. Menambah saldo kas dan otomatis tercatat sebagai event `TREASURY_FUNDED` di Life Log. |
| `npm run db:reset` | **Reset skema penuh & seed simulasi 7 hari**. Menghapus seluruh tabel Supabase dan mengisi data demo (Day 1–7, 4 trade, modal $1,000). |
| `npm run db:seed` | **Isi ulang data demo 7 hari**. Menjalankan seed simulasi penuh tanpa menghapus ulang tabel database. |
| `npm run reset:trades` | **Bersihkan trade saja**. Menghapus histori trade, keputusan, dan memori ke 0, tanpa mengubah identitas Agent. |

### 1.1. Mengubah `allowedAssets`

`allowedAssets` adalah whitelist asset yang boleh diproses oleh Glyph. Untuk menggantinya, misalnya hanya menjadi `NVDA` dan `AAPL`, sinkronkan tiga tempat berikut.

1. Ubah whitelist hardcoded di `src/lib/policy.ts`:

  ```ts
  export const ALLOWED_ASSETS = ["NVDA", "AAPL"] as const;
  ```

2. Ubah nilai `allowedAssets` pada bagian `update` dan `create` di `prisma/seeds/policy.seed.ts`:

  ```ts
  allowedAssets: ["NVDA", "AAPL"],
  ```

3. Ubah nilai yang dipakai script sinkronisasi database di `scripts/db/update-policy-db.ts`:

  ```ts
  allowedAssets: ["NVDA", "AAPL"],
  ```

4. Jalankan script update policy terhadap database aktif:

  ```bash
  npx tsx scripts/db/update-policy-db.ts
  ```

5. Verifikasi hasilnya:

  ```bash
  npx tsx scripts/onchain/verify-setup.ts
  ```

  Atau buka Prisma Studio dengan `npx prisma studio`, lalu periksa field `AgentPolicy.allowedAssets`. Nilai akhirnya harus tepat `["NVDA", "AAPL"]`.

> **Penting:** `npm run db:reset-genesis` menjalankan seed Genesis dan dapat mengisi ulang policy dari `prisma/seeds/policy.seed.ts`. Setelah reset database, jalankan kembali `npx tsx scripts/db/update-policy-db.ts` bila diperlukan. Jika menggunakan `analysis-only-v2.seed.ts`, sesuaikan juga konstanta `ALLOWED_ASSETS` dan `ANALYSIS_ORDER` di file tersebut karena seed V2 memiliki aturan asset sendiri.

---

## 2. Contoh Penggunaan

### A. Reset Bersih ke Awal Lahir (Genesis)
Gunakan saat ingin memulai observasi Glyph dari nol:
```bash
npm run seed:genesis
```
> **Hasil:** Life Log hanya berisi *Glyph Born* (06:00), *ERC-8004 Identity* (06:15), dan *Wallet Created* (06:30). Saldo Treasury `$0.00`.

### A.1. Reset Database Total lalu Genesis
Gunakan jika ingin menghapus seluruh data database, termasuk `ResearchSnapshot` dan `ActivityLog`, kemudian membuat ulang state Genesis:
```bash
npm run db:reset-genesis
```
> **Peringatan:** perintah ini menjalankan `prisma db push --force-reset`. Semua data database akan dihapus permanen sebelum state Genesis dibuat ulang.

### B. Menambah Modal Treasury
Suntik modal kas ke akun Glyph:
```bash
# Tambah modal $500
npm run fund:treasury -- --amount 500 --note "Top-up modal riset"

# Atau jumlah bebas:
npm run fund:treasury -- --amount 1000
```
> Saldo kas Glyph akan langsung bertambah dan event `TREASURY_FUNDED` otomatis muncul di Life Log.

### C. Reset Database Penuh (Data Simulasi Demo)
Gunakan jika ingin mengisi ulang seluruh data demo untuk presentasi/dashboard:
```bash
npm run db:reset
```

---

## 3. Pengujian & Eksekusi Siklus

### Scheduled Market Analysis
Market Analysis dapat dipanggil oleh scheduler eksternal tanpa menjalankan LLM, Policy, atau Paper Trade:

```bash
curl -X POST \
  -H "Authorization: Bearer $CRON_SECRET" \
  https://your-domain.com/api/cron/market-analysis
```

Endpoint mengembalikan `401` jika secret salah, `200` saat analisis selesai, `200` dengan status `MARKET_CLOSED` saat market tutup, dan `500` jika salah satu asset gagal dianalisis. Cooldown default adalah 60 menit; gunakan body `{ "force": true }` hanya untuk pengujian.

Setiap execution tercatat di `AgentRun`, snapshot tetap disimpan melalui runner existing, dan satu event `Market Analysis Completed` atau `Market Analysis Failed` ditulis ke Life Log.

### Perintah Market Analysis
Gunakan perintah ini untuk mengambil dan menyimpan analisis pasar tanpa membuat keputusan trade:

```bash
npm run market:analysis
```

Perintah ini:
- mengambil data market untuk asset yang diizinkan;
- menjalankan analisis fundamental, technical, dan risk;
- menyimpan `ResearchSnapshot` ke database;
- mencatat hasil analisis di Life Log.

Untuk satu asset saja:

```bash
npm run market:analysis -- --asset AAPL
```

### Perintah Trade Cycle
Gunakan perintah ini untuk menjalankan alur lengkap secara berurutan:

```bash
npm run trade:cycle
```

`trade:cycle` selalu membuat market-analysis snapshot baru dalam cycle yang sama. Asset yang dianalisis adalah gabungan asset yang diizinkan policy dan asset yang masih memiliki posisi aktif. Untuk posisi aktif, Glyph menerima konteks posisi lalu memilih `HOLD` atau `CLOSE`; `CLOSE` memakai executor portfolio yang sama untuk menghitung PnL, fee, treasury, status trade, dan memory.

Alurnya:

```text
Market Analysis
  -> LLM Decision
  -> Policy Validation
  -> Paper Trade jika OPEN dan APPROVED
  -> HOLD tanpa mutasi accounting
  -> CLOSE melalui closeSimulatedPosition jika APPROVED
  -> Treasury, Position, Trade, dan Memory diperbarui sesuai action
```

Setiap asset membaca state database terbaru sebelum diproses. Jika policy `REJECTED`, tidak ada trade atau perubahan treasury.

Untuk menjalankan satu asset saja:

```bash
npm run trade:cycle -- --asset AAPL
```

| Perintah | Deskripsi Simpel | Kapan Digunakan |
|---|---|---|
| `npm run test:cycle` | **Tes siklus otonom standar**. Memeriksa apakah bursa buka. Jika tutup, siklus berhenti dengan aman tanpa buang token/biaya. | Cek rutin apakah sistem berjalan sesuai jadwal pasar. |
| `npm run test:cycle -- --force` | **Tes siklus paksa (Bypass jam bursa)**. Menjalankan seluruh alur (riset, AI reasoning, simpan trade, bukti on-chain) meskipun bursa US sedang tutup. | Tes cepat kapan saja tanpa menunggu malam hari (jam bursa AS). |
| `npm run cli:decision` | **Tes interaktif via terminal**. Dialog tanya-jawab untuk memilih aset (NVDA/MSFT/AAPL), action, leverage, atau biarkan AI memilih otomatis. | Ingin mencoba skenario manual atau bereksperimen dengan parameter sendiri. |
| `npm run test:decision-coverage` | **Tes cakupan seluruh aksi AI**. Memvalidasi schema dan aturan policy untuk semua 5 aksi (`OPEN_LONG`, `OPEN_SHORT`, `HOLD`, `CLOSE`, `NO_TRADE`). | Verifikasi cepat logika guardrail dan Zod schema. |
| `npm run test:lifecycle` | **Tes aturan transisi posisi & rumus PnL**. Memastikan tidak bisa buka posisi ganda dan perhitungan untung/rugi akurat. | Verifikasi integritas matematika trading. |

---

## 4. Cara Melihat & Memverifikasi Hasil Tes

Setelah menjalankan perintah tes, Anda bisa memeriksa hasilnya lewat 4 cara:

### A. Langsung di Terminal
Setiap perintah tes akan mencetak log per langkah:
- **`[STEP 1]`**: Cek posisi portofolio yang sedang aktif.
- **`[STEP 1.5]`**: Cek status bursa AS (Open / Closed).
- **`[STEP 2]`**: Snapshot riset pasar (harga, skor teknikal & fundamental).
- **`[STEP 3]`**: Keputusan Glyph Brain (Action, Conviction, Tesis, dan Status Policy: `APPROVED`/`REJECTED`).
- **`Tx Hash & Explorer`**: Tautan transaksi bukti on-chain di Robinhood Chain testnet jika trade/keputusan terbit.

### B. Lewat Web Dashboard (Browser)
Pastikan `npm run dev` berjalan di background, lalu buka di browser:
- [http://localhost:3000](http://localhost:3000):
  - **Hero Section**: Melihat ringkasan arah trade terbaru (`DIRECTION`, `CONVICTION`, `ACTION`).
  - **Economic Activity**: Melihat linimasa *Autonomous Activity Stream* (kegiatan riset, keputusan, dan eksekusi).
- [http://localhost:3000/life](http://localhost:3000/life): Melihat log observasi memori dan jejak hidup Glyph.
- [http://localhost:3000/trades](http://localhost:3000/trades): Melihat daftar paper trade yang sedang aktif atau sudah ditutup.

### C. Lewat Database GUI (Prisma Studio)
Untuk melihat data mentah yang tersimpan di database:
```bash
npx prisma studio
```
Buka [http://localhost:5555](http://localhost:5555) di browser untuk memeriksa tabel:
- `Decision`: Mencatat setiap keputusan AI beserta alasan dan status policy.
- `ActivityLog`: Rekaman berurutan dari `MARKET_DATA` hingga `ONCHAIN_PROOF`.
- `EconomicEvent`: Linimasa kejadian ekonomi.
- `Trade`: Posisi trade yang berhasil dibuka.

---

## 5. Proteksi Jam Bursa Saham (Market Status API)

Glyph secara otomatis memverifikasi status buka/tutup bursa saham AS (**NASDAQ, NYSE**) secara real-time via **Alpha Vantage `MARKET_STATUS` API**:
- **Jam Bursa Reguler**: Senin – Jumat, 09:30 – 16:15 US Eastern Time (ET) *(sekitar 20:30 – 03:15 WIB)*.
- **Ketika Bursa Tutup**:
  - Panggilan cron `/api/cron/glyph-cycle` akan otomatis berhenti dengan status `MARKET_CLOSED`.
  - Tidak ada kredit LLM OpenRouter atau kuota Alpha Vantage yang terbuang sia-sia.
  - Tidak ada trade simulasi yang dibuka di luar jam pasar sesungguhnya.
- **Bypass untuk Pengujian**:
  - Untuk menguji eksekusi manual kapan saja di luar jam bursa, tambahkan flag `--force`:
    ```bash
    npm run test:cycle -- --force
    ```

---

## 6. Glyph Wallet Rotation

Wallet Glyph dapat diganti tanpa mereset database atau merusak kontinuitas trading history, PnL, identity, dan memory.

### Core Principle

```
Glyph Identity   ≠   Wallet Identity   ≠   Trading Portfolio   ≠   Historical Transactions
```

Pergantian wallet **tidak** berarti membuat Glyph baru.

---

### 6.1 Check current wallet

```bash
npm run glyph:wallet:status
```

Menampilkan:
- Network dan Chain ID
- ENV wallet (`NEXT_PUBLIC_GLYPH_WALLET_ADDRESS`)
- DB wallet (`agent_wallets.walletAddress`)
- On-chain wallet (via IdentityRegistry, jika contract terkonfigurasi)
- Portfolio continuity: trades, decisions, memories, treasury
- Last wallet rotation date
- Overall status: `READY` atau `ATTENTION REQUIRED`

---

### 6.2 Change wallet

```bash
npm run glyph:wallet:set -- 0xNEW_WALLET_ADDRESS
```

CLI akan secara otomatis:

1. Validate format address (hex, 42 karakter)
2. Validate EIP-55 checksum
3. Load current wallet dari database
4. Deteksi apakah address sudah aktif (early exit jika sama)
5. Tampilkan ringkasan rotation: current vs new wallet
6. Tampilkan impact: apa yang **TIDAK** berubah
7. **Require explicit `y` confirmation** (default: `N`)
8. Update `agent_wallets.walletAddress` di database
9. Update `NEXT_PUBLIC_GLYPH_WALLET_ADDRESS` di file `.env`
10. Buat event `WALLET_ROTATED` di Life Log
11. Verifikasi perubahan database
12. Tampilkan migration summary

> **Penting:** CLI ini **tidak** melakukan on-chain transaction secara otomatis. Lihat §6.4 untuk on-chain update.

---

### 6.3 Verify wallet

```bash
npm run glyph:wallet:verify
```

Menjalankan full verification:

| Check | Critical |
|---|---|
| ENV wallet address valid | ✓ |
| Network ENV set | — |
| Database connection | ✓ |
| Glyph identity exists | ✓ |
| DB wallet configured | ✓ |
| DB wallet === ENV wallet | ✓ |
| Onchain wallet match | — |
| Trading history | — |
| Memory | — |
| Paper portfolio | — |

Jika ada critical check yang gagal:
```
STATUS: ✗ BLOCKED
```
Tidak ada production changes yang diapply. Resolve dulu sebelum melanjutkan.

---

### 6.4 On-chain wallet update (optional, manual step)

Mengubah konfigurasi wallet tidak otomatis mengubah `setAgentWallet` di IdentityRegistry on-chain.

Setelah menjalankan `glyph:wallet:set`, jika perlu sinkronisasi on-chain:

```bash
npx tsx scripts/onchain/update-wallet.ts
```

Script ini:
1. Membaca wallet aktif dari database dan ENV
2. Memeriksa apakah signer adalah NFT owner
3. **Hanya** memanggil `setAgentWallet()` jika signer adalah NFT owner
4. Menampilkan tx hash dan blok konfirmasi

> ⚠ **Catatan:** On-chain update membutuhkan `SMART_ACCOUNT_OWNER_PRIVATE_KEY` dikonfigurasi. Script tidak akan melanjutkan jika signer bukan NFT owner.

---

### 6.5 Automated tests

```bash
npm run test:wallet:rotation
```

Menjalankan 13 automated tests:

| Test | Scope |
|---|---|
| T01–T04 | Address validation dan EIP-55 checksum |
| T05 | Same-wallet detection |
| T06 | DB rotation update |
| T07–T10 | Historical continuity: trades, decisions, memories, treasury |
| T11 | Life log event creation |
| T12–T13 | Second rotation dan continuity |

Semua mutasi di-reverse setelah test selesai. Database dikembalikan ke state semula.

---

### 6.6 Safety guarantees

Wallet rotation:

- ✓ does NOT reset database
- ✓ does NOT reset paper portfolio
- ✓ does NOT delete trades
- ✓ does NOT delete decisions
- ✓ does NOT delete memory
- ✓ does NOT delete life log
- ✓ does NOT recreate Glyph identity
- ✓ does NOT automatically move assets
- ✓ does NOT automatically change Safe ownership
- ✗ never prints private keys
- ✗ never stores private keys in database
- ✗ never broadcasts mainnet transaction without explicit approval

---

### 6.7 Example flow

**Before rotation:**
```
Glyph
Wallet: 0xOLD...
PnL: +$150
Trades: 25
Decisions: 40
Memories: 18
```

**Run rotation:**
```bash
npm run glyph:wallet:set -- 0xNEW_ADDRESS
# → Confirm: y
```

**After rotation:**
```
Glyph
Wallet: 0xNEW...    ← changed
PnL: +$150          ← unchanged
Trades: 25          ← unchanged
Decisions: 40       ← unchanged
Memories: 18        ← unchanged
```

Historical records tetap terhubung dengan wallet/address yang aktif pada saat transaksi terjadi.

Life Log akan menampilkan:
```
WALLET_ROTATED — Wallet Rotated
0xOLD... → 0xNEW...
(Glyph identity, trading history, PnL, memories unchanged)
```

---

### 6.8 Peringatan: Vercel / Production ENV

File `.env` lokal diupdate otomatis oleh `glyph:wallet:set`. Namun jika project di-deploy ke Vercel atau hosting lain:

1. Login ke Vercel dashboard
2. Settings → Environment Variables
3. Update `NEXT_PUBLIC_GLYPH_WALLET_ADDRESS` ke wallet baru
4. Redeploy

Tanpa langkah ini, production UI akan tetap menampilkan wallet lama sampai redeploy.