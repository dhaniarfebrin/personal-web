# Setup Project Portofolio Frontend Developer

## Deskripsi
Tugas ini bertujuan untuk melakukan setup awal project portofolio personal menggunakan framework **Astro.js** yang dikombinasikan dengan utility-first CSS framework, **Tailwind CSS**. Instruksi ini merupakan panduan *high-level* untuk menyiapkan fondasi sebelum fitur dan halaman lain dikembangkan. Package manager yang wajib digunakan pada project ini adalah **Bun**.

## Prasyarat Lingkungan
- **Bun** (versi terbaru) sudah terinstall di sistem.

## Langkah-Langkah Eksekusi (Tasks)

1. **Inisialisasi Project Astro**
   - Buat project Astro baru di dalam repositori/direktori kerja ini menggunakan Bun (misal: `bun create astro@latest .`).
   - Gunakan template dasar/kosong (seperti `empty` atau `basics`) agar project tetap bersih dari *boilerplate* yang tidak perlu.
   - Pilih opsi penggunaan **TypeScript** (opsi standar/strict) untuk menjaga skalabilitas (*best practice*).
   - Pastikan untuk memilih opsi agar dependensi langsung diinstall via Bun.

2. **Integrasi Tailwind CSS**
   - Lakukan instalasi dan integrasi Tailwind CSS menggunakan CLI Astro via Bun (misal: `bunx astro add tailwind`).
   - Verifikasi bahwa file konfigurasi Astro (`astro.config.mjs`) telah memuat integrasi Tailwind, dan file `tailwind.config.mjs` telah terbuat dengan benar.

3. **Penataan Struktur Folder Dasar**
   - Pastikan struktur direktori di dalam folder `src/` rapi dan terorganisir untuk project skala portofolio.
   - Buat direktori berikut jika belum ada:
     - `src/components/` : Untuk menyimpan komponen UI (*button*, *card*, *navbar*, dll).
     - `src/layouts/` : Untuk menyimpan kerangka tata letak halaman.
     - `src/assets/` : Untuk menyimpan aset statis seperti gambar atau ikon.

4. **Pembuatan Base Layout**
   - Buat sebuah file layout utama bernama `BaseLayout.astro` di dalam direktori `src/layouts/`.
   - Susun struktur standar dokumen HTML5.
   - Pastikan komponen ini memiliki tag `<slot />` agar dapat merender konten dari halaman-halaman yang akan dibungkus oleh layout ini.

5. **Pengujian Halaman Utama (Homepage)**
   - Perbarui file halaman utama di `src/pages/index.astro`.
   - Bungkus konten halaman menggunakan `BaseLayout` yang telah dibuat.
   - Tambahkan elemen UI sederhana (misalnya judul "Portofolio Frontend Developer").
   - Berikan beberapa *utility classes* dari Tailwind CSS (contoh: `text-center text-blue-600 font-bold min-h-screen`) pada elemen tersebut untuk memastikan integrasi Tailwind telah berhasil.

6. **Pembersihan (Clean Up)**
   - Hapus komponen bawaan atau halaman contoh dari template Astro yang tidak diperlukan.

## Kriteria Penerimaan (Acceptance Criteria)
- [ ] Terdapat file `bun.lockb` atau `bun.lock` (bukan `package-lock.json` atau `yarn.lock`).
- [ ] Perintah untuk menjalankan server *development* (`bun run dev`) dapat berjalan tanpa *error* di terminal.
- [ ] Halaman utama berhasil diakses melalui browser (biasanya di `http://localhost:4321`).
- [ ] Gaya visual dari *class* Tailwind CSS terbukti merender dengan benar di halaman utama.
- [ ] Struktur folder dasar sudah tersedia dan siap digunakan.
