-- ============================================================
-- KampusFind — Guard Archive + Update Email (Profile)
-- Jalankan di Supabase SQL Editor.
-- Idempotent: aman dijalankan berulang kali.
-- ============================================================

-- 1. Pastikan kolom is_archived ada di tabel lostfound & nebeng
ALTER TABLE public.lostfound
  ADD COLUMN IF NOT EXISTS is_archived boolean NOT NULL DEFAULT false;
ALTER TABLE public.nebeng
  ADD COLUMN IF NOT EXISTS is_archived boolean NOT NULL DEFAULT false;

-- 2. Perbaiki data lama yang masih NULL
UPDATE public.lostfound SET is_archived = false WHERE is_archived IS NULL;
UPDATE public.nebeng   SET is_archived = false WHERE is_archived IS NULL;

-- 3. Jamin kolom selalu NOT NULL default false
ALTER TABLE public.lostfound
  ALTER COLUMN is_archived SET NOT NULL,
  ALTER COLUMN is_archived SET DEFAULT false;
ALTER TABLE public.nebeng
  ALTER COLUMN is_archived SET NOT NULL,
  ALTER COLUMN is_archived SET DEFAULT false;

-- 4. Pastikan kolom email ada di tabel users (untuk fitur Update Email)
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS email text;
