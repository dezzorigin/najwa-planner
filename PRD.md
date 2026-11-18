# PRD — Najwa Planner

## 1. Informasi Proyek

| Field | Nilai |
|---|---|
| Nama Proyek | Najwa Planner |
| Live | https://najwa-planner.pages.dev |
| Tech Stack | HTML/CSS/JavaScript murni (satu file `index.html`), tanpa build step |
| Status | Live — fungsional penuh, data lokal |
| Penanggung Jawab | Nabil Aulia Dika (dezzorigin) |
| Versi Dokumen | 2.0 (ditulis ulang 2026-11-18 agar sesuai aplikasi sebenarnya) |
| Tanggal | 2026-11-18 |

## 2. Latar Belakang

Perencana harian pribadi untuk satu pengguna yang butuh satu tempat untuk agenda, kebiasaan harian, dan stok barang — tanpa membuat akun, tanpa server, dan tetap bisa dibuka saat offline. Aplikasi ini dipakai sehari-hari dari HP: buka, lihat agenda hari ini, centang rutinitas, selesai.

## 3. Masalah yang Diselesaikan

- Agenda harian tersebar: event tidak terlihat dalam satu pandangan.
- Rutinitas (mis. baca 10 halaman) tidak terlacak — tidak ada bukti sudah dikerjakan atau belum.
- Stok barang (mis. buku, alat tulis) tidak tercatat; kehabisan baru ketahuan saat butuh.
- Aplikasi planner umumnya butuh akun + cloud; pengguna ini mau data tetap di perangkat sendiri.

## 4. Tujuan & Sasaran

- Satu halaman yang dibuka langsung bisa dipakai: agenda hari ini terlihat tanpa langkah setup.
- Rutinitas selesai tercatat sebagai bukti (catatan + foto), bukan sekadar centang.
- Semua data tersimpan lokal (IndexedDB) dan bisa diekspor (PDF) atau dipindah ke perangkat lain (P2P).
- Bisa di-install sebagai PWA dan dibuka offline.
- Catatan sensitif bisa dikunci PIN (enkripsi AES-GCM).

## 5. Ruang Lingkup

### In Scope (sudah ada, terverifikasi jalan)

- Landing page: hero + fitur + cara kerja + CTA ke aplikasi; tampil pertama kali bagi pengguna baru, kunjungan berikut langsung masuk aplikasi.
- Agenda harian (Home): event hari ini, urut berdasarkan jam, lengkap dengan lokasi.
- Rutinitas harian: tambah/ubah/hapus, urut berdasarkan jam; selesaikan lewat Proof of Work (catatan + foto opsional, kompres otomatis < 150 KB); sekali sehari per rutinitas; confetti saat selesai.
- Inventory: tambah/ubah/hapus item + jumlah + ikon; tombol Consume mengurangi stok 1.
- Logbook: riwayat Proof of Work per tanggal (filter tanggal), lengkap dengan catatan dan foto; heatmap 30 hari (klik untuk membuka).
- Kalender: grid sebulan, navigasi bulan, ketuk tanggal untuk melihat/menambah agenda tanggal itu.
- Pengaturan: tema Dark/Light/Pink; sinkronisasi P2P (PeerJS — Device ID + hubungkan ke ID lain, kirim/terima seluruh database); laporan PDF (riwayat/agenda/inventaris); wipe semua data.
- Vault PIN: enkripsi AES-GCM untuk catatan Proof of Work dan deskripsi event; PIN 4 digit diminta saat membuka/mengubah yang terkunci.
- PWA: manifest + ikon PNG 192/512 + service worker terdaftar dan men-cache halaman serta library CDN.

### Out of Scope

- Akun, login, atau sinkronisasi cloud (sengaja tidak ada).
- Pengingat/notifikasi terjadwal (tidak ada alarm atau push notification).
- Berbagi data dengan banyak pengguna — sync P2P hanya satu-ke-satu dan manual.

## 6. Fitur & Persyaratan Fungsional

| Fitur | Perilaku terverifikasi |
|---|---|
| Landing | Navbar (logo + Fitur/Cara Kerja + logo GitHub ke repo), hero dua kolom + pratinjau aplikasi, 8 kartu fitur, 3 langkah cara kerja, strip privasi + footer. CTA "Buka Planner" masuk aplikasi dan dicatat (`najwaEntered`). |
| Agenda | `loadHUD()` memuat event hari ini dari store `events` (filter `date` = hari ini, urut `time`). Setelah tambah/hapus event, kartu ikut segar (perbaikan v1.1.0). |
| Rutinitas | Store `routines` (`id`, `name`, `time`); urut jam; yang sudah selesai hari ini tampil dicoret + tombol nonaktif. |
| Proof of Work | Modal PoW: catatan + foto (kompres < 150 KB, base64) + toggle Vault; `saveLog()` menulis ke store `logs` (autoIncrement) dengan `date` logis. |
| Inventory | Store `inventory` (`id`, `name`, `qty`, `icon`); kartu horizontal; Consume mengurangi 1 (item qty 0 disembunyikan). |
| Logbook | Store `logs` difilter per tanggal (`logbook-date`); kartu berisi nama tugas, catatan, foto, dan tombol hapus per log. Heatmap: 30 kotak terakhir dari `logs`. |
| Kalender | `renderCalendar()` membangun grid bulan berjalan (42 sel maks, tampil 30/31 + sisa); `renderAgenda()` menampilkan event tanggal terpilih. |
| Sync P2P | `initPeer()` membuat Peer (broker publik PeerJS); `connectAndSync()` mengirim seluruh isi 4 store; penerima menimpa database lokalnya. |
| Laporan PDF | `generatePDF()` membangun div cetak terisolasi lalu `html2pdf()` — tipe riwayat (rentang tanggal), agenda kalender (per bulan), inventaris. |
| Vault | `CryptoUtils` (AES-GCM, Web Crypto): `encrypt`/`decrypt` dengan PIN; `requestPIN()` memakai modal PIN; PIN salah → "Wrong PIN", isi tetap terenkripsi. |
| Tema | `setTheme()` mengganti class di `<html>` (`theme-dark`/`theme-light`/`theme-pink`) + `meta theme-color`; tersimpan di `localStorage`. |
| PWA offline | `sw.js` terdaftar saat load (perbaikan v1.1.0); cache `najwa-planner-cache-v2` berisi halaman + manifest + ikon + library CDN; fetch jatuh ke cache saat offline. |

## 7. Persyaratan Non-Fungsional

- **Performa:** satu file, tanpa build; muatan awal hanya HTML + 4 library CDN; render pertama tidak menunggu IndexedDB.
- **Keamanan:** rahasia (`.env`) tidak boleh ter-commit — repo ini tidak memakai secret sama sekali; catatan sensitif dienkripsi AES-GCM di sisi klien; PIN tidak pernah disimpan.
- **Maintainability:** seluruh logika aplikasi dalam satu `<script>` di `index.html` dengan fungsi bernama jelas per tampilan (`loadHUD`, `renderCalendar`, `renderLogbook`, `saveEvent`, dst.).
- **Portabilitas:** jalan di browser modern (Chrome/Edge/Firefox/Safari) di HP maupun desktop; PWA install di Chrome/Edge Android & desktop.
- **Aksesibilitas:** semua tombol punya `type="button"` dan teks/aria-label; viewport mengizinkan zoom; HTML lolos `html-validate` aturan default; Lighthouse accessibility ≥ 0.9.

## 8. Arsitektur & Tech Stack

Satu halaman statis, tanpa framework dan tanpa build step. Detail di [docs/architecture.md](./docs/architecture.md) dan diagram alur di [docs/diagrams/app-flow.svg](./docs/diagrams/app-flow.svg).

- **UI:** HTML + Tailwind CSS v3.4.17 (di-vendor lokal sebagai `tailwind.js`) + Font Awesome 6.4 (CDN) + font Plus Jakarta Sans.
- **Data:** IndexedDB `NajwaPlannerDB_v2` (store `routines`, `logs`, `inventory`, `events` + indeks tanggal event).
- **Klien:** vanilla JS; Web Crypto (AES-GCM); PeerJS 1.5.2 (WebRTC); html2pdf.js 0.10.1; canvas-confetti 1.6.0.
- **PWA:** `manifest.json` + `sw.js` (cache-first untuk aset lokal & CDN).
- **Deploy:** Cloudflare Pages (situs statis, tanpa fungsi server).

## 9. Milestone / Roadmap

| Fase | Status |
|---|---|
| Inisialisasi & scaffolding | ✅ (2024) |
| Pengembangan fitur inti | ✅ |
| Perbaikan bug + landing + PWA (v1.1.0) | ✅ 2026-11-18 |
| CI (validate + Lighthouse incl. PWA) | ✅ 2026-11-18 |
| Deployment (Cloudflare Pages) | ✅ 2026-11-18 |
| Dokumentasi (README + PRD + arsitektur + diagram) | ✅ 2026-11-18 |

## 10. Risiko & Mitigasi

| Risiko | Mitigasi |
|---|---|
| Broker PeerJS publik tidak terjangkau | Sync gagal dengan pesan "Sync Error" (bukan diam-diam); data lokal tetap aman; pengguna bisa coba lagi. |
| Service worker gagal install (satu URL cache gagal) | Daftar cache hanya berisi URL yang dipakai aplikasi (v1.1.0 menghapus entri flaticon mati); kegagalan install tercatat di console. |
| Foto PoW membesarkan IndexedDB | Foto dikompres otomatis < 150 KB sebelum disimpan; pengguna bisa hapus log lama per tanggal. |
| PIN 4 digit terlupakan | Tidak ada pemulihan — data terenkripsi tidak bisa dibuka tanpa PIN; ini perilaku yang disengaja, ditulis di README. |
| Library CDN berubah/hilang | Versi di-pin (Font Awesome 6.4.0, html2pdf 0.10.1, PeerJS 1.5.2, confetti 1.6.0); service worker men-cache salinan setelah kunjungan pertama. |

## 11. Kriteria Keberhasilan

- Aplikasi berjalan tanpa error di lingkungan dev maupun di URL live (play-test end-to-end: landing → masuk aplikasi → tambah rutinitas → Proof of Work → logbook → kalender → pengaturan → mode offline).
- README & PRD sesuai aplikasi sebenarnya (tidak ada klaim fiktif — README/PRD lama yang menyebut `npm install` dan Next.js sudah dibuang).
- Tidak ada secret yang ter-commit; `.gitignore` tersedia.
- CI hijau (html-validate + markdown-link-check + Lighthouse: a11y ≥ 0.9, best-practices ≥ 0.9, PWA ≥ 0.8).

## 12. Lampiran

- Arsitektur: [docs/architecture.md](./docs/architecture.md)
- Diagram alur: [docs/diagrams/app-flow.svg](./docs/diagrams/app-flow.svg)
- Lisensi: MIT ([LICENSE](./LICENSE))
