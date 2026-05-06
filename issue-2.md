# Implementasi Struktur Halaman & Desain Portofolio (Astro + Tailwind)

## Deskripsi
Issue ini bertujuan untuk mengimplementasikan arsitektur halaman website portofolio untuk **Dhaniar Febrin**, menggunakan sistem desain *Dark Mode* (Dark Navy + Purple) dan *Astro Content Collections* untuk mengelola konten Blog dan Projects berbasis file Markdown (`.md`).

## Sistem Desain & Warna
Website ini akan menggunakan tema **Dark Mode Exclusive**:
- **Background Utama**: `bg-slate-900`
- **Surface/Cards**: `bg-slate-800`
- **Teks Utama**: `text-slate-50`
- **Teks Sekunder (Muted)**: `text-slate-400`
- **Warna Aksen**: `violet-500` / `violet-600` (untuk tombol/interaktivitas)
- **Teks Aksen**: `violet-400` (untuk *highlight* teks)

## Tasks (Langkah Implementasi)

### 1. Setup & Konfigurasi Tambahan
- [ ] Install plugin `@tailwindcss/typography` menggunakan Bun (`bun add -D @tailwindcss/typography`).
- [ ] Daftarkan plugin typography di dalam file `tailwind.config.mjs`.

### 2. Setup Astro Content Collections
- [ ] Buat direktori `src/content/blog/` untuk menyimpan file markdown artikel blog.
- [ ] Buat direktori `src/content/projects/` untuk menyimpan file markdown daftar proyek.
- [ ] Buat file `src/content/config.ts` untuk mendefinisikan *schema validation* (misal menggunakan Zod) untuk koleksi `blog` dan `projects`.

### 3. Pembuatan Komponen UI (UI Components)
- [ ] Buat `Navbar.astro` dengan efek *glassmorphism* dan navigasi (*Home, Blog, Projects*).
- [ ] Buat `Footer.astro` berisi informasi hak cipta sederhana.
- [ ] Perbarui `BaseLayout.astro` agar menyertakan Navbar dan Footer, serta *wrapper container* utama.

### 4. Implementasi Halaman Utama (`/`)
- [ ] **Hero Section**: Judul besar "Dhaniar Febrin", teks perkenalan, dan tombol Call to Action.
- [ ] **About Section**: Penjelasan singkat tentang keahlian frontend developer dan daftar *Tech Stack* (badges).
- [ ] **Featured Projects Section**: Menarik (fetch) dan menampilkan maksimal 3 proyek terbaru dari koleksi *Markdown projects*.
- [ ] **Contact Section**: Teks ajakan untuk menghubungi via email.

### 5. Implementasi Halaman Blog
- [ ] Buat halaman `src/pages/blog/index.astro` (Blog List) untuk menampilkan daftar semua artikel dari direktori markdown.
- [ ] Buat *Dynamic Route* `src/pages/blog/[slug].astro` (Blog Detail) untuk merender isi markdown ke dalam HTML menggunakan gaya dari Tailwind Typography (`prose`).

### 6. Implementasi Halaman Project Detail
- [ ] Buat *Dynamic Route* `src/pages/projects/[slug].astro` untuk merender isi markdown detail proyek.

## Acceptance Criteria
- [ ] Plugin `@tailwindcss/typography` terpasang dan berfungsi pada file markdown.
- [ ] Terdapat setidaknya 1 file markdown dummy (contoh) di masing-masing folder `blog` dan `projects` untuk memastikan *Content Collections* berjalan.
- [ ] Tema *Dark Mode* (Slate & Violet) teraplikasikan dengan baik pada semua halaman.
- [ ] Routing multi-halaman (`/`, `/blog`, `/blog/[slug]`, `/projects/[slug]`) berfungsi tanpa *error* di server lokal.
- [ ] Implementasi selesai tanpa *error* kompilasi saat dijalankan via `bun run build`.