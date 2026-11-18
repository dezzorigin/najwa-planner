# Changelog

Semua perubahan penting pada proyek ini dicatat di file ini.

Format mengikuti [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
dan proyek ini mengikuti [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2026-11-18

Rebuild proper: landing page, tiga perbaikan bug nyata, PWA benar-benar offline,
HTML bersih, CI + dokumentasi jujur. README/PRD/CHANGELOG lama dibuang dan ditulis
ulang — versi lama berisi klaim fiktif (`npm install`/`npm run dev` padahal tidak ada
`package.json`, Next.js, Supabase) yang tidak sesuai aplikasi sebenarnya.

### Added
- Landing page ala SaaS: navbar (logo + tautan Fitur/Cara Kerja + logo GitHub ke repo),
  hero dua kolom dengan pratinjau aplikasi, 8 kartu fitur, 3 langkah cara kerja,
  strip privasi, footer. Tampil pertama kali; kunjungan berikut langsung masuk aplikasi.
- Tombol "Lihat Halaman Depan" di Pengaturan untuk kembali ke landing.
- Ikon PWA PNG 192x192 dan 512x512 (any + maskable) dari logo; manifest diperbarui.
- CI: `html-validate` + `markdown-link-check` + Lighthouse (3 run; kategori PWA
  ditegakkan min. 0.8, a11y & best-practices 0.9, performance 0.5 warn).
- Dokumentasi: `docs/architecture.md`, diagram alur `docs/diagrams/app-flow.svg`,
  tangkapan layar, video demo.
- `.gitignore` (sebelumnya tidak ada).
- Tailwind CSS v3.4.17 di-vendor lokal (`tailwind.js`, MIT): `fetch()` ke
  `cdn.tailwindcss.com` gagal di sebagian jaringan/proxy, sehingga
  `cache.addAll()` service worker selalu gagal dan mode offline tidak pernah
  bisa aktif. Dengan file lokal, PWA sepenuhnya mandiri.

### Fixed
- Tombol "View All" melempar TypeError di tiap klik: `switchView()` memakai
  `event.currentTarget` dan mengasumsikan pemanggil selalu punya ikon `<i>`,
  padahal tombol itu tidak punya ikon — error tak tertangkap dan
  `renderCalendar()`/`renderAgenda()` tidak pernah jalan. Status aktif kini
  diambil dari tombol nav berdasarkan `viewId`, dengan guard null di semua akses ikon.
- Agenda hari ini tidak segar setelah tambah/hapus event: `saveEvent()` dan
  `deleteEvent()` hanya me-render ulang tampilan kalender, bukan kartu
  "Today's Agenda" di Home. Keduanya kini memanggil `loadHUD()`.
- Service worker tidak pernah didaftarkan: `sw.js` ada dan manifest mengklaim
  offline-first, tapi tidak ada kode yang memanggil
  `navigator.serviceWorker.register()` — mode offline sebenarnya tidak jalan.
  Sekarang didaftarkan saat load.
- Daftar cache service worker berisi URL flaticon yang tidak pernah dipakai
  aplikasi — `cache.addAll()` gagal total bila satu saja URL gagal di-fetch.
  Entri mati dihapus; ikon PNG ditambahkan ke daftar cache.
- Viewport sebelumnya `maximum-scale=1.0, user-scalable=no` (pengguna tidak bisa
  zoom) — kini mengizinkan zoom.
- HTML dibersihkan sampai lolos `html-validate` aturan default (sebelumnya 83 error):
  `type="button"` di semua tombol, teks/aria-label di tombol ikon-saja, nama unik
  untuk dua landmark `<nav>`, `div`/`p` di dalam `h2`/`button`/`label` diganti
  `span`, satu `</div>` nyasar di grid Home dihapus, `&` mentah di-encode,
  `img` pratinjau diberi `alt` + `src` data-URI.

## [1.0.0] - 2024-11-05

### Added
- Najwa Planner OS v1.0: agenda harian, rutinitas + Proof of Work (foto & catatan),
  inventory, logbook + heatmap, kalender, tema Dark/Light/Pink, sinkronisasi P2P
  (PeerJS), laporan PDF, Vault PIN (AES-GCM), PWA (manifest + service worker).
