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

Alurnya:

```text
Market Analysis
  -> LLM Decision
  -> Policy Validation
  -> Paper Trade jika APPROVED
  -> Treasury dan Position diperbarui
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