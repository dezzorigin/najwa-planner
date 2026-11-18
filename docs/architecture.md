# Arsitektur — Najwa Planner

Satu halaman statis, tanpa framework, tanpa build step, tanpa server. Semua
yang dibutuhkan aplikasi tinggal di tiga file (`index.html`, `manifest.json`,
`sw.js`) plus dua ikon PNG dan satu logo SVG.

```
Pengguna
  │  buka URL / install PWA
  ▼
index.html ──► Tailwind lokal (tailwind.js), Font Awesome CDN, Plus Jakarta Sans
  │            html2pdf.js, PeerJS, canvas-confetti (CDN, di-cache SW)
  ├─► Landing (view-landing) ──► enterApp() ──► Aplikasi
  │                                                  │
  │                              ┌───────────────────┼───────────────────┐
  │                              ▼                   ▼                   ▼
  │                            Home                Logbook            Kalender
  │                         (agenda,           (riwayat PoW,       (grid bulan,
  │                          rutinitas,         heatmap 30 hari)    agenda/tanggal)
  │                          inventory)              │                   │
  │                              │                   │                   │
  │                              └─────────┬─────────┴─────────┬─────────┘
  │                                        ▼                   ▼
  │                                   Pengaturan ──► Sync P2P (PeerJS)
  │                                   (tema, PDF,           (WebRTC,
  │                                    wipe data)            broker publik)
  ▼
IndexedDB NajwaPlannerDB_v2 ──► store routines / logs / inventory / events
localStorage ──► najwaTheme, najwaEntered, confetti_<tanggal>
Service Worker (sw.js) ──► cache-first: halaman + manifest + ikon + library CDN
```

## Tampilan

Satu `<main>` berisi lima `<section>` yang saling bergantian lewat
`switchView(viewId)`: `view-landing`, `view-hud`, `view-logbook`,
`view-calendar`, `view-settings`. Header aplikasi dan navigasi bawah
disembunyikan saat landing tampil. `switchView()` mengambil status aktif
dari tombol nav berdasarkan `viewId` (bukan dari `event.currentTarget` —
lihat CHANGELOG v1.1.0).

| Tampilan | Fungsi utama |
|---|---|
| `view-landing` | Navbar, hero + pratinjau, fitur, cara kerja, privasi, footer. |
| `view-hud` | `loadHUD()`: agenda hari ini + rutinitas + inventory. |
| `view-logbook` | `renderLogbook()`: riwayat Proof of Work per tanggal + heatmap. |
| `view-calendar` | `renderCalendar()` + `renderAgenda()`: grid bulan + event tanggal terpilih. |
| `view-settings` | Tema, sync P2P, laporan PDF, wipe data, kembali ke landing. |

## Data

IndexedDB `NajwaPlannerDB_v2`, empat object store:

| Store | Key | Isi |
|---|---|---|
| `routines` | `id` | `name`, `time` |
| `logs` | autoIncrement | `taskName`, `date` (tanggal logis), `note`, `image` (base64), `isSecure` |
| `inventory` | `id` | `name`, `qty`, `icon` (kelas Font Awesome) |
| `events` | `id` | `date`, `title`, `time`, `location`, `description`, `isSecure` (+ indeks tanggal) |

`localStorage` hanya menyimpan preferensi: `najwaTheme` (tema),
`najwaEntered` (sudah pernah masuk aplikasi), `confetti_<tanggal>`
(confetti sekali sehari). Tidak ada data pengguna di `localStorage`.

Tanggal logis (`getLogicalDate()`) dipakai agar rutinitas yang diselesaikan
lewat tengah malam tetap tercatat di hari sebelumnya — detail perilaku
aplikasi, bukan asumsi dokumen ini.

## Alur data penting

- **Tambah rutinitas/event/item** → `putStoreData()` → `loadHUD()` me-render
  ulang kartu Home (perbaikan v1.1.0: event kini ikut menyegarkan Home).
- **Selesaikan rutinitas** → `triggerPoW()` → modal Proof of Work →
  `saveLog()` (foto dikompres < 150 KB, enkripsi bila Vault aktif) →
  `logs` + confetti sekali sehari.
- **Sync P2P** → `initPeer()` (broker publik PeerJS) → `connectAndSync()`
  mengirim seluruh isi keempat store; penerima menimpa database lokalnya.
  Tidak ada server milik aplikasi yang terlibat.
- **Laporan PDF** → `generatePDF()` membangun div cetak terisolasi lalu
  `html2pdf()` menyimpan PDF (riwayat/agenda/inventaris).
- **Vault** → `CryptoUtils` (Web Crypto, AES-GCM). PIN diminta lewat modal
  `requestPIN()`; PIN tidak pernah disimpan di mana pun.

## PWA / offline

- `manifest.json`: `display: standalone`, ikon PNG 192 (`any`) + 512
  (`any` + `maskable`), `start_url: ./index.html`.
- `sw.js` didaftarkan saat `load` (perbaikan v1.1.0 — sebelumnya tidak pernah
  didaftarkan). Cache `najwa-planner-cache-v2` berisi halaman, manifest,
  ikon, logo, dan library CDN; strategi cache-first dengan fallback fetch.
- Service worker hanya aktif lewat `http(s)://`, tidak lewat `file://`.

## Keamanan

- Tidak ada secret, token, atau kredensial di repo ini.
- Catatan sensitif dienkripsi AES-GCM di sisi klien; kunci berasal dari PIN
  yang diketik pengguna dan tidak disimpan.
- PIN 4 digit bukan pengganti kunci perangkat: bila PIN lupa, data
  terenkripsi tidak bisa dipulihkan.

## Deploy

Situs statis di Cloudflare Pages, tanpa fungsi server. Setiap push ke `main`
di-deploy ulang oleh Pages; tidak ada langkah build.
