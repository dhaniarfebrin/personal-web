## Latar Belakang
Area Hero saat ini sudah berfungsi dengan baik, namun secara visual masih terlihat terlalu "polos" (hanya teks rata tengah). Kita perlu meningkatkan *visual impact* di pandangan pertama tanpa mengorbankan performa (Lighthouse score harus tetap tinggi).

## Ide & Rencana Implementasi (Lightweight)

1. **[CSS] Ambient Glowing Background**
   - Tambahkan elemen background *blobs* (radial gradients dengan blur sangat tinggi) berwarna violet/indigo yang beranimasi perlahan.
   - Harus murni CSS (`@keyframes`, `filter: blur`, `opacity`) agar di-render oleh GPU dan tidak membebani main thread.

2. **[Layout] Modern Split-Screen**
   - Ubah layout desktop menjadi 2 kolom:
     - **Kiri**: Teks utama, efek ketik, dan tombol CTA.
     - **Kanan**: Area visual (bisa placeholder untuk Foto Profil dengan frame *glassmorphism*, atau elemen ilustrasi kustom).

3. **[JS] Vanilla Typing/Morph Effect**
   - Tambahkan efek animasi teks berganti pada bagian subtitle (contoh peran/fokus keahlian).
   - Gunakan Vanilla JS sederhana (tanpa library eksternal) untuk memanipulasi DOM dengan performa optimal.

4. **[CSS] Floating Elements**
   - Tambahkan beberapa *tech badges* (Astro, Tailwind, TypeScript) yang melayang menggunakan animasi CSS `translateY` berulang.

## Task List
- [ ] Refactor struktur HTML `Hero.astro` menjadi grid 2 kolom (md:grid-cols-2).
- [ ] Buat animasi CSS `ambient-glow` dan letakkan di layer paling belakang (z-index negatif).
- [ ] Buat placeholder visual yang elegan di kolom kanan (Glassmorphism card + glow).
- [ ] Implementasi script Vanilla JS untuk teks berganti pada subtitle.
- [ ] Rapihkan responsivitas (tetap stacked di layar mobile).
- [ ] Verifikasi Lighthouse score tetap hijau setelah penambahan animasi.
