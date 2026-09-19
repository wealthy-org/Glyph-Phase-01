# Glyph Phase 01 — Critical Test Checklist

> Fokus: testing yang paling penting untuk membuktikan bahwa Glyph benar-benar berjalan sesuai brief, bukan hanya UI-nya tampil.
>
> Prinsip utama: **Frontend → Backend → Database → Blockchain harus konsisten.**

---

## 1. Treasury & Portfolio

- [ ] Initial treasury sesuai konfigurasi (contoh: $1,000)
- [ ] Treasury tidak bisa dimanipulasi dari frontend
- [ ] Open position mengurangi available capital sesuai logic
- [ ] Position size dihitung oleh backend, bukan dipercaya dari frontend
- [ ] Leverage simulasi mengikuti batas policy
- [ ] Open position tersimpan benar di database
- [ ] Duplicate request tidak membuat position/trade ganda

### PnL

- [ ] Unrealized PnL LONG benar
- [ ] Unrealized PnL SHORT benar jika SHORT didukung
- [ ] Realized PnL setelah close position benar
- [ ] Equity / balance setelah trade benar
- [ ] Tidak terjadi double counting PnL

---

## 2. Market Data

- [ ] Backend menerima market data dengan asset, price, dan timestamp yang valid
- [ ] Price yang digunakan untuk perhitungan backend sama dengan yang ditampilkan frontend
- [ ] Market data stale / invalid ditolak
- [ ] Jika market data gagal, sistem tidak membuat trade dengan data invalid

---

## 3. AI Analysis & Trading Thesis

- [ ] Glyph menerima market data yang benar
- [ ] Fundamental analysis dan technical analysis masuk ke proses decision
- [ ] Output AI mengikuti schema yang ditentukan
- [ ] Invalid JSON / field / nilai dari AI ditolak
- [ ] AI tidak dapat mengubah treasury atau melakukan transaksi langsung
- [ ] AI hanya menghasilkan **thesis/decision**, bukan melewati risk policy

---

## 4. Policy Engine

> **Ini critical. Policy Engine harus menjadi gatekeeper sebelum paper trade dibuat.**

- [ ] Thesis valid → dapat PASS
- [ ] Risk melebihi limit → REJECT
- [ ] Position size melebihi limit → REJECT
- [ ] Treasury tidak mencukupi → REJECT
- [ ] Leverage melebihi batas → REJECT
- [ ] Asset yang tidak diizinkan → REJECT
- [ ] Input AI yang dimanipulasi tidak dapat bypass policy
- [ ] User/frontend tidak dapat membuat trade tanpa melewati policy

### Critical Test

Simulasikan AI menghasilkan:

```text
BUY
Position Size = $999,999
```

Expected:

```text
REJECTED
```

Bukan membuat paper trade.

---

## 5. Paper Trade Lifecycle

Test satu alur lengkap:

```text
Market Data
    ↓
Analysis
    ↓
Trading Thesis
    ↓
Policy Engine
    ↓
Position Sizing
    ↓
Paper Trade
    ↓
Open Position
    ↓
Price Update
    ↓
PnL
    ↓
Close Position
```

- [ ] Trade yang di-approve membuat position
- [ ] Entry price benar
- [ ] Quantity / position size benar
- [ ] Position status `OPEN`
- [ ] Price update mengubah unrealized PnL
- [ ] Close position mengubah status menjadi `CLOSED`
- [ ] Realized PnL tersimpan benar
- [ ] Treasury diperbarui benar
- [ ] Trade history sesuai database

---

## 6. Onchain Decision Proof

Test flow:

```text
Decision
   ↓
Serialize
   ↓
keccak256
   ↓
commitDecision(hash)
   ↓
Transaction
   ↓
Transaction Hash
```

- [ ] Decision di-serialize secara deterministic
- [ ] Hash dihasilkan backend
- [ ] Hash tersimpan di database
- [ ] `commitDecision()` berhasil di testnet
- [ ] Transaction hash tersimpan
- [ ] Hash database sama dengan hash yang tercatat onchain
- [ ] Contract address dan network benar
- [ ] Jika transaksi gagal, backend tidak mengklaim sebagai verified

---

## 7. Memory & Reputation

- [ ] Decision tersimpan sebagai memory
- [ ] Trade result / PnL tersimpan sebagai memory
- [ ] Memory memiliki reference ke decision/trade yang benar
- [ ] Trade yang closed memperbarui track record
- [ ] Total trade benar
- [ ] Total PnL benar
- [ ] Win/loss record benar
- [ ] Duplicate trade tidak menggandakan reputation

---

## 8. Frontend ↔ Backend Consistency

Untuk data utama, pastikan:

- [ ] Treasury UI = Treasury backend
- [ ] Position UI = Position database
- [ ] PnL UI = hasil kalkulasi backend
- [ ] Trade history UI = database
- [ ] Decision UI = decision yang sebenarnya
- [ ] Onchain transaction hash UI = hash yang sebenarnya
- [ ] Agent identity UI = identity yang sebenarnya

> **Tidak boleh ada mock/hardcoded value yang membuat UI terlihat benar padahal backend salah.**

---

## 9. Security Critical Test

- [ ] Private key tidak pernah dikirim ke frontend
- [ ] Secret/API key tidak masuk client bundle
- [ ] User tidak dapat mengubah treasury
- [ ] User tidak dapat mengubah PnL
- [ ] User tidak dapat mengubah trade result
- [ ] User tidak dapat membuat arbitrary blockchain transaction
- [ ] User tidak dapat bypass Policy Engine
- [ ] Server melakukan validasi ulang semua data penting dari frontend
- [ ] Phase 01 tidak memiliki jalur untuk menggunakan real user funds

---

# 10. End-to-End Acceptance Test

### Happy Path

- [ ] Glyph memiliki identity
- [ ] Glyph memiliki wallet
- [ ] Treasury memiliki simulated capital
- [ ] Market data diterima
- [ ] Analysis berhasil
- [ ] Glyph menghasilkan thesis
- [ ] Policy Engine melakukan validation
- [ ] Paper trade dibuat
- [ ] Position terbuka
- [ ] PnL dihitung
- [ ] Position ditutup
- [ ] Decision dicatat
- [ ] Decision memiliki transaction hash onchain
- [ ] Memory tersimpan
- [ ] Reputation diperbarui
- [ ] Semua data tampil benar di frontend

### Negative Path

- [ ] AI menghasilkan decision berisiko → ditolak
- [ ] Treasury tidak cukup → ditolak
- [ ] Position size terlalu besar → ditolak
- [ ] Market data invalid → tidak boleh trade
- [ ] Blockchain transaction gagal → status tidak boleh `verified`

---

# Definition of Done

Phase 01 dianggap lolos testing apabila:

- [ ] Critical backend logic benar
- [ ] Policy Engine tidak dapat dibypass
- [ ] Treasury, position, dan PnL konsisten
- [ ] Paper trade lifecycle berjalan end-to-end
- [ ] Decision benar-benar tercatat onchain
- [ ] Database dan blockchain record konsisten
- [ ] Memory dan reputation mengikuti hasil trade sebenarnya
- [ ] Frontend hanya menampilkan data yang berasal dari state sebenarnya
- [ ] Tidak ada real-fund execution
- [ ] Happy path berhasil
- [ ] Critical negative path berhasil

**Prioritas testing:**

1. Policy Engine
2. Treasury / Portfolio / PnL
3. Paper Trade Lifecycle
4. Onchain Decision Proof
5. Backend ↔ Database ↔ Frontend consistency
6. Security
7. Memory / Reputation
8. End-to-End
