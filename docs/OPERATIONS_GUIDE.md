# Operations Guide — Glyph Phase 01

Panduan ringkas perintah operasional terminal untuk database, treasury, dan pengujian sistem.

---

## 1. Manajemen Database & Seeding

| Perintah | Deskripsi Singkat |
|---|---|
| `npm run seed:genesis` | **Kembali ke status awal lahir (06:30:00 UTC)**. Menghapus semua trade/keputusan, kas `$0.00`, dan Life Log hanya berisi 3 event Genesis. *(Tanpa perlu reset DB dulu)*. |
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

| Perintah | Fungsi |
|---|---|
| `npm run test:cycle` | Menjalankan 1 siklus trading otonom secara manual (audit posisi → status bursa → riset → analisis LLM → validasi policy → trade → onchain). |
| `npm run test:decision` | Menjalankan pengujian keputusan Glyph Brain secara terisolasi. |
| `npm run test:analysis` | Menjalankan analisis fundamental & teknikal pasar untuk preview. |

---

## 4. Proteksi Jam Bursa Saham (Market Status API)

Glyph secara otomatis memverifikasi status buka/tutup bursa saham AS (**NASDAQ, NYSE**) secara real-time via **Alpha Vantage `MARKET_STATUS` API**:
- **Jam Bursa Reguler**: Senin – Jumat, 09:30 – 16:15 US Eastern Time (ET).
- **Ketika Bursa Tutup**:
  - Panggilan cron `/api/cron/glyph-cycle` akan otomatis berhenti dengan status `MARKET_CLOSED`.
  - Tidak ada kredit LLM OpenRouter atau kuota Alpha Vantage yang terbuang sia-sia.
  - Tidak ada trade simulasi yang dibuka di luar jam pasar sesungguhnya.
- **Bypass untuk Pengujian**:
  - Untuk menguji eksekusi manual di luar jam bursa (misal siang hari WIB), kirim payload `{ "force": true }` pada endpoint cron atau gunakan script `npm run test:cycle`.