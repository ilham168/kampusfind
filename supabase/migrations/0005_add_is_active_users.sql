-- ============================================================
-- KampusFind — Manajemen Pengguna: kolom is_active
-- Jalankan di Supabase SQL Editor. Idempotent (aman diulang).
-- ============================================================

-- 1. Tambahkan kolom is_active (default true = akun aktif)
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;

-- 2. Perbaiki data lama yang masih NULL
UPDATE public.users SET is_active = true WHERE is_active IS NULL;

-- 3. Jamin kolom selalu NOT NULL default true
ALTER TABLE public.users
  ALTER COLUMN is_active SET NOT NULL,
  ALTER COLUMN is_active SET DEFAULT true;

-- 4. (Opsional) Verifikasi
-- SELECT id, name, email, role, is_active FROM public.users;
