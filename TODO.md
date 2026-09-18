# GLYPH — Todo List Pengerjaan (Fase 01)

Urutan ini disusun berdasarkan prioritas P0 → P8 dari brief, karena tiap tahap butuh fondasi dari tahap sebelumnya. **Jangan lompat urutan** — misalnya jangan mulai bikin Decision Engine (P4) sebelum Policy Engine & database (P0-P2) siap, karena nanti kamu akan bongkar ulang.

---

## TAHAP 0 — Fondasi (P0)

- [x] Setup project Next.js (App Router) + TypeScript + Tailwind CSS
- [x] Setup Supabase (database PostgreSQL)
- [x] Buat semua tabel database dasar sesuai §18: `agents`, `agent_wallets`, `agent_policies`, `market_assets`, `market_snapshots`, `research_snapshots`, `decisions`, `trades`, `positions`, `transactions`, `memories`, `reputation_metrics`, `economic_events`
- [x] Install `viem`, `wagmi`, OpenZeppelin contracts
- [x] Konfigurasi koneksi ke testnet Robinhood Chain (Chain ID `46630`, RPC `https://rpc.testnet.chain.robinhood.com`)
- [x] Setup smart account Glyph pakai **Safe** (`@safe-global/protocol-kit`, `@safe-global/api-kit`) — ini dilakukan di **backend/server**, bukan tombol connect di frontend
- [x] Isi semua environment variable dasar (lihat daftar lengkap §3.1)

> **💡 Tips:**
> - Bikin dulu skema database-nya di atas kertas/diagram sebelum ngoding — tabel `decisions` vs `trades` itu paling gampang salah desain di awal (lihat poin B di bawah).
> - Deploy Safe di testnet duluan, jangan buru-buru connect ke mainnet. Ambil test ETH dari faucet Robinhood Chain.
> - Baca ulang **Bagian 3.0** (poin A-D) sebelum mulai ngoding apa pun — ini daftar salah paham paling umum yang bikin kerja ulang.

---

## TAHAP 1 — Identitas (P1)

- [x] Ambil kode `IdentityRegistry.sol` dari repo resmi ERC-8004 (`github.com/erc-8004/erc-8004-contracts`), baca dulu sebelum deploy
- [x] Deploy `IdentityRegistry.sol` ke testnet Robinhood Chain, catat alamat kontraknya
- [x] Siapkan metadata JSON Glyph (`/public/agents/glyph.json`), harus bisa diakses publik via URL
- [x] Panggil `register(agentURI)` sekali → simpan `agentId` yang didapat
- [x] Simpan `agentId` & alamat wallet Glyph ke database
- [x] Buat halaman profil identitas dasar (badge "Verified Agent · ID #")

> **💡 Tips:**
> - Standar ERC-8004 masih **DRAFT** — jangan overselling di copy/UI seolah ini "sertifikasi resmi Ethereum". Cukup bilang "agent terdaftar dengan ID onchain".
> - Kalau pakai `setAgentWallet`, pastikan pakai signature+deadline, jangan di-skip — ini pencegah signature-replay.
> - Test dulu di testnet sampai benar-benar yakin sebelum mikirin mainnet.

---

## TAHAP 2 — Simulasi Ekonomi (P2)

- [x] Buat sistem treasury simulasi (mulai dari modal awal, misal $1.000)
- [x] Buat logic portofolio: posisi terbuka, ukuran posisi, leverage simulasi
- [x] Buat kalkulasi PnL (untung/rugi belum realisasi & sudah realisasi)
- [x] Implementasikan **Policy Engine** (`GLYPH_POLICY`) sebagai kode biasa, terpisah dari AI:
  - `maxPositionPercent`, `maxLeverage`, `maxDailyLossPercent`, `maxOpenPositions`, `allowedAssets`, `minConfidence`
- [x] Pastikan `allowedAssets` di-hardcode di kode (bukan disimpan di database yang bisa diubah)
- [x] Buat logic simulasi fee transaksi (default saran: 0.1% per transaksi, jadikan konstanta)
- [x] Buat logic simulasi likuidasi (kalau kena threshold → status `LIQUIDATED`, catat sebagai `LOSS_RECORDED`)

> **💡 Tips:**
> - Policy Engine ini adalah "rem" untuk AI — pastikan dia jalan sebagai kode deterministik biasa, bukan dipengaruhi prompt AI sama sekali.
> - Leverage yang nanti diusulkan AI **wajib di-clamp** ulang di sini terhadap `maxLeverage` — jangan percaya angka mentah dari AI (lihat poin C di §3.0).
> - Test Policy Engine-nya sendirian dulu (unit test) sebelum disambung ke AI, biar gampang debug kalau ada trade yang lolos padahal seharusnya ditolak.

---

## TAHAP 3 — Mesin Riset (P3)

- [x] Daftar API key Alpha Vantage (atau Finnhub sebagai alternatif)
- [x] Buat interface `MarketDataProvider` (`getQuote`, `getOHLCV`, `getFundamentals`, `getNews`)
- [x] Implementasikan provider Alpha Vantage di belakang interface itu (endpoint `OVERVIEW`, `TIME_SERIES_DAILY`, `NEWS_SENTIMENT`)
- [x] Buat layer fundamental: revenue growth, earnings, valuasi, berita, konteks sektor/makro
- [x] Buat layer teknikal: harga, tren, momentum, volume, support/resistance, volatilitas
- [x] Simpan setiap hasil riset sebagai snapshot yang **immutable** ke tabel `research_snapshots`

> **💡 Tips:**
> - Karena free tier Alpha Vantage cuma 25 request/hari, desain sistemnya untuk 1 siklus riset per hari dulu — jangan sampai boros quota buat testing manual berkali-kali (cache hasil kalau perlu).
> - Selalu simpan snapshot riset SEBELUM kirim ke AI, supaya kalau AI gagal/error, kamu masih tahu data apa yang seharusnya dianalisis.
> - Jangan pernah menimpa snapshot riset lama — kalau perlu update, buat entri baru.

---

## TAHAP 4 — Mesin Keputusan (P4)

- [x] Daftar OpenRouter, pilih model gratis (`:free`) yang reputasinya bagus di structured output
- [x] Tulis prompt yang minta output JSON eksplisit (asset, action, conviction, scores, thesis, position_size_percent, leverage)
- [x] Buat skema validasi **Zod** yang strict untuk output AI
- [x] Implementasikan logic retry: gagal validasi → retry maksimal 2x → masih gagal → fallback `NO_TRADE`
- [x] Buat konstanta versi prompt (`GLYPH_DECISION_PROMPT_VERSION = "V1"`) di kode
- [x] Sambungkan output AI ke Policy Engine dari Tahap 2 (validasi & clamp leverage/ukuran posisi)
- [x] Buat tabel `decisions` terpisah dari `trades` (lihat poin B §3.0) — simpan **semua** keputusan termasuk `NO_TRADE`
- [x] Trade baru dibuat di tabel `trades` **hanya jika** `policy_result = 'APPROVED'` dan `action != 'NO_TRADE'`

> **💡 Tips:**
> - Ini bagian paling rawan salah desain — kalau bingung, gambar dulu diagramnya: satu keputusan bisa menghasilkan nol atau satu trade, tapi keputusan selalu dicatat.
> - Jangan taruh data sensitif (private key, secrets) di prompt AI, sekecil apapun.
> - Saat naik versi prompt, commit git dulu (jangan cuma ganti konstanta lalu lupa commit) — biar riwayatnya jelas dan trade lama tetap tahu versi prompt yang dipakai.

---

## TAHAP 5 — Bukti Onchain (P5)

- [x] Tulis kontrak `DecisionRegistry.sol` (custom, lihat §3.5)
- [x] Deploy `DecisionRegistry.sol` ke testnet Robinhood Chain, catat alamatnya
- [x] Buat logic: serialize keputusan (JSON) → hash `keccak256` → panggil `commitDecision(hash)` via Safe SDK dari server
- [x] Simpan hasilnya ke database: `decision_hash`, `transaction_hash`, `chain_id`, `contract_address`, `block_number`, `timestamp`
- [x] Buat tombol/link "Verify Onchain" yang mengarah ke `robinhoodchain.blockscout.com/tx/<hash>`

> **💡 Tips:**
> - Pastikan Safe di kontrak ini **hanya** boleh memanggil `DECISION_REGISTRY_CONTRACT_ADDRESS` dan `IDENTITY_REGISTRY_CONTRACT_ADDRESS` — bukan kontrak sembarangan.
> - Selalu jelaskan ke user (lewat copy di UI) bahwa hash ini membuktikan **keputusan tercatat**, bukan bukti trade dieksekusi di market asli — supaya tidak menyesatkan.
> - Test alur hash → commit → tx hash → verify di block explorer beberapa kali di testnet sebelum lanjut ke tahap berikutnya.

---

## TAHAP 6 — Memori (P6)

- [x] Buat logic yang menghasilkan entri memori setelah trade ditutup: outcome (WIN/LOSS), pnl_percent, thesis_result (CORRECT/INCORRECT), lesson, confidence_calibration
- [x] Simpan memori ke tabel `memories`, terhubung ke `trade_id`
- [x] Tampilkan memori ini di UI (bagian dari halaman detail trade dan/atau Life Log)
- [x] (Opsional tapi disarankan) Pastikan memori lama bisa "dibaca ulang" saat AI membuat keputusan baru — supaya benar-benar mempengaruhi keputusan berikutnya, bukan cuma catatan pasif

> **💡 Tips:**
> - Jaga narasinya tetap jujur: ini adalah "state yang persisten", bukan klaim bahwa Glyph "sadar" atau "belajar" seperti manusia.
> - `lesson` sebaiknya dibuat oleh AI juga (bagian dari output terstruktur saat trade ditutup) atau template sederhana berdasarkan hasil — pilih salah satu, jangan campur logic manual dan AI tanpa jelas siapa yang bikin apa.

---

## TAHAP 7 — Tampilan Publik (P7)

- [ ] Setup Agent Scheduler / cron:
  - [ ] Daftar di cron-job.org
  - [x] Buat endpoint `/api/cron/glyph-cycle` (method `POST`, validasi header `Authorization: Bearer <CRON_SECRET>`)
  - [ ] Jadwalkan 1x/hari, arahkan cron-job.org ke endpoint itu
  - [x] Pastikan 1 endpoint ini menjalankan siklus penuh: data market → riset → keputusan → validasi → policy → trade/no-trade → commit hash → update DB (termasuk cek posisi terbuka di siklus yang sama)
- [x] Bangun 6 halaman publik:
  - [x] `/` — Homepage (treasury, tujuan, posisi aktif, keputusan terbaru, reputasi, event terbaru)
  - [x] `/life` — Life Log, **digenerate dari tabel `economic_events` asli**
  - [x] `/trades` — daftar semua trade
  - [x] `/trade/[id]` — detail 1 trade ("Kenapa Saya Trading")
  - [x] `/identity` — info ERC-8004
  - [x] `/about` — penjelasan konsep
- [x] Terapkan visual direction: near-black background, tipografi grotesk, data pakai monospace, tanpa tombol "Connect Wallet" untuk pengunjung
- [x] Pastikan semua 6 halaman bisa diakses tanpa connect wallet apapun

> **💡 Tips:**
> - Bangun homepage paling akhir dari 6 halaman itu, setelah `/trades` dan `/trade/[id]` — karena homepage cuma nge-summary data yang sama.
> - Test cron-nya secara manual dulu (trigger via curl/Postman dengan header yang benar) sebelum benar-benar dijadwalkan otomatis.
> - Kalau visual masih terasa seperti dashboard shadcn default, itu tandanya perlu diulang — cek lagi §2.1, biasanya karena masih pakai spacing/warna default komponen.

---

## TAHAP 8 — Polish (P8)

- [X] Tambahkan motion/animasi halus (transisi, loading state)
- [X] Buat 1 entitas visual Glyph yang mudah dikenali (bukan mascot robot generik)
- [x] Tambahkan proper loading & error state di semua halaman
- [x] Setup observability ringan: tabel `agent_runs` (run_id, started_at, completed_at, market_snapshot, model, prompt_version, decision, policy_result, trade_id, transaction_hash, error)
- [x] Pastikan setiap run agent (gagal ataupun sukses) tercatat, tidak ada yang diam-diam dibuang
- [x] Tulis dokumentasi singkat internal (setup, env var, cara re-deploy kontrak)

> **💡 Tips:**
> - Jangan skip observability walau kesannya "cuma logging" — ini yang bikin kamu gampang debug kalau nanti ada trade aneh di production/testnet.
> - Animasi cukup halus & minim, jangan berlebihan — sesuai arah §2.1 (laboratory/terminal, bukan flashy).

---

## FINAL CHECK — Sebelum Dianggap "Selesai"

Jalankan skenario demo end-to-end ini (§34) minimal 1x penuh:

- [x] Glyph "lahir" → identitas onchain terdaftar → wallet dibuat
- [x] Treasury simulasi terisi $1.000
- [x] Glyph menganalisis 1 aset (misal NVDA)
- [x] Thesis fundamental + teknikal terbentuk
- [x] Risk engine menyetujui posisi (misal 2x leverage simulasi)
- [ ] Trade dibuat
- [ ] Hash keputusan berhasil dicommit onchain
- [ ] Tombol "Verify Onchain" berfungsi, tx hash valid di block explorer
- [ ] Posisi ditutup, PnL dihitung dengan benar
- [ ] Memori baru tercipta
- [ ] Life Log mencatat semua event di atas secara otomatis (bukan hardcode)

Kalau semua ini demonstrable dari awal sampai akhir tanpa campur tangan manual → **Fase 01 selesai.**

> **💡 Tips terakhir:**
> - Jangan uji tiap bagian secara terpisah terus lupa uji alur penuhnya — banyak bug baru muncul justru di persambungan antar-tahap (misal: hash yang dikirim ke blockchain beda dengan yang divalidasi di awal).
> - Setelah lolos testnet, baru pikirkan langkah ke mainnet/Fase 02 — brief ini sengaja membatasi scope biar kamu tidak kewalahan (lihat §29, hal-hal yang **tidak perlu** dikerjakan dulu).
