# 🎓 KampusFind

**Lost & Found + Nebeng Kampus** — platform web untuk mahasiswa dalam satu kampus. Temukan barang hilang, laporkan barang ditemukan, atau cari/tawarkan tumpangan pulang-pergi kuliah. Semua data diperbarui **real-time**.

> 🔗 **Demo:** [kampusfind.netlify.app](https://kampusfound.netlify.app/)

> Dibangun dengan HTML, Tailwind CSS, Vanilla JavaScript, dan Supabase sebagai backend.

---

## ✨ Fitur

### 🔐 Autentikasi
- Registrasi dengan **email kampus** (nama & NIM)
- Login/logout, konfirmasi email otomatis
- Profil mahasiswa: NIM, program studi, angkatan, bio, nomor WhatsApp

### 🔍 Lost & Found
- Posting barang **hilang / ditemukan**
- Unggah **foto barang** (disimpan di Supabase Storage)
- Filter berdasarkan kategori + pencarian judul/lokasi/deskripsi
- Hubungi pemilik langsung via **link WhatsApp**
- Pemilik bisa menghapus postingannya sendiri

### 🚗 Nebeng Kampus
- Tawarkan tumpangan atau cari tumpangan
- Rute dari–ke, tanggal & **waktu menunggu sampai jam** (presisi menit)
- Postingan otomatis **kadaluarsa & diarsipkan** begitu jam menunggu lewat
- **Link Google Maps** untuk buka rute
- Tandai status **Penuh / Tersedia** oleh pemilik postingan
- Kontak langsung via WhatsApp

### ⚡ Real-time
- Feed Lost & Found dan Nebeng ter-update **otomatis** tanpa reload berkat Supabase Realtime

### 🛡️ Admin Panel
- Dasbor statistik total postingan
- Kelola semua postingan (moderasi)
- **Arsip / Restore** (soft delete) — postingan tidak hilang permanen

---

## 🧰 Teknologi

| Bagian | Teknologi |
| --- | --- |
| Frontend | HTML5, Tailwind CSS (CDN), Vanilla JavaScript |
| Backend | Supabase (PostgreSQL + Auth + Storage + Realtime) |
| Font | Plus Jakarta Sans (Google Fonts) |
| Hosting | Netlify |

---

## 📁 Struktur Proyek

```
kampusfind/
├── index.html                  # Aplikasi utama (auth, feed, profil, admin)
├── css/
│   └── style.css               # Styling tambahan
├── js/                         # Modul JavaScript terpisah
│   ├── main.js                 # Inisialisasi & alur utama
│   ├── auth.js                 # Autentikasi
│   ├── lostfound.js            # Logika Lost & Found
│   ├── nebeng.js               # Logika Nebeng
│   ├── admin.js                # Admin panel (arsip/restore)
│   ├── tabs.js                 # Navigasi tab
│   ├── utils.js                # Util (toast, modal, format WA)
│   └── supabase-config.js      # Inisialisasi klien Supabase
└── supabase/
    └── migrations/             # SQL migrasi untuk Supabase
        ├── 0001_admin_soft_delete.sql
        ├── 0002_fix_null_archive.sql
        ├── 0003_add_status_column_nebeng.sql
        ├── 0004_profile_email_archive_guard.sql
        ├── 0005_add_is_active_users.sql
        └── 0006_add_expired_at_nebeng.sql   # Auto-archive nebeng (expired_at + pg_cron)
```

---

## 🚀 Menjalankan Secara Lokal

Aplikasi ini murni statis — cukup buka lewat server lokal:

```bash
# Opsi 1: server Python
python3 -m http.server 8080

# Opsi 2: VS Code Live Server
# atau tarik index.html langsung ke browser
```

Lalu buka `http://localhost:8080`.

> Catatan: aplikasi butuh konfigurasi Supabase agar fitur login & data berfungsi (lihat di bawah).

---

## 🗄️ Setup Supabase

1. Buat proyek baru di [supabase.com](https://supabase.com).
2. Buka **SQL Editor** dan jalankan migrasi dari folder `supabase/migrations/` secara berurutan:
   - `0001_admin_soft_delete.sql` — tambah kolom `is_archived`, `role`, dll.
   - `0002_fix_null_archive.sql` — perbaiki data lama yang `NULL`.
   - `0003_add_status_column_nebeng.sql` — tambah kolom `status` pada tabel `nebeng`.
   - `0004_profile_email_archive_guard.sql` — guard kolom email profile.
   - `0005_add_is_active_users.sql` — kolom suspend akun `is_active`.
   - `0006_add_expired_at_nebeng.sql` — kolom `expired_at` + auto-archive nebeng (pg_cron, opsional).
3. Buat tabel yang dibutuhkan:

   **Tabel `lostfound`** — `id` (uuid, primary key), `type` (text), `title` (text), `location` (text), `desc` (text), `contact` (text), `image_url` (text, nullable), `user_id` (uuid), `user_name` (text), `created_at` (timestamptz), `is_archived` (boolean default `false`).

   **Tabel `nebeng`** — `id` (uuid), `type` (text), `from` (text), `to` (text), `date` (date), `time` (time), `expired_at` (timestamptz, nullable), `note` (text), `contact` (text), `maps_link` (text), `user_id` (uuid), `user_name` (text), `status` (text default `'open'`), `created_at` (timestamptz), `is_archived` (boolean default `false`).

   **Tabel `users`** — `id` (uuid), `name` (text), `email` (text), `role` (text default `'user'`).

   **Tabel `profiles`** — `id` (uuid), `full_name` (text), `nim` (text), `email` (text), `prodi` (text), `angkatan` (text), `phone` (text), `bio` (text), `updated_at` (timestamptz).

4. Aktifkan **Realtime** (Supabase Dashboard → *Database* → *Replication*) untuk tabel `lostfound` dan `nebeng`.
5. Buat **Storage bucket** `posts-images` dengan akses *public* untuk unggah foto.
6. Salin **Project URL** dan **anon/public key** dari halaman *Settings → API*, lalu isi ke `index.html` (dan `js/supabase-config.js`).

---

## 👑 Menjadikan Akun Admin

Setelah login, jadikan akun sebagai admin lewat **SQL Editor**:

```sql
UPDATE public.users SET role = 'admin' WHERE email = 'email_kamu@kampus.ac.id';
```

Logout lalu login kembali — tab **Admin Panel** akan muncul.

---

## 🌐 Deploy ke Netlify

1. Push repo ke GitHub.
2. Di Netlify: **Add new site → Import an existing project** → pilih repo.
3. Build command & publish directory: **kosongkan**, publish directory biarkan **`/`** (folder root).
4. Deploy selesai — aplikasi langsung jalan.

---

## 🔒 Keamanan

- Hanya **anon/publishable key** yang dipakai di frontend — **jangan pernah** memasukkan `service_role` key ke kode atau repo.
- File `.env`, `.env.local`, dan `supabase-secret.json` sudah di-ignore oleh `.gitignore`.

---

## 👥 Kontributor

- **Fidelia Ping**
- **Ilham Risanjaya**

---

> KampusFind · Lost & Found + Board Nebeng kampus
