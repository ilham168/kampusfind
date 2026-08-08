-- ============================================================
-- KampusFind — Admin Soft Delete (Archive) Migration
-- Jalankan di Supabase SQL Editor.
-- ============================================================

-- 1. Kolom is_archived pada tabel lostfound
ALTER TABLE public.lostfound
  ADD COLUMN IF NOT EXISTS is_archived boolean NOT NULL DEFAULT false;

-- 2. Kolom is_archived pada tabel nebeng
ALTER TABLE public.nebeng
  ADD COLUMN IF NOT EXISTS is_archived boolean NOT NULL DEFAULT false;

-- 3. Kolom role pada tabel users (default 'user')
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'user';

-- 4. Set akun admin secara manual (ganti dengan email admin kamu)
-- UPDATE public.users SET role = 'admin' WHERE email = 'admin@kampus.ac.id';

-- ============================================================
-- (Opsional) Row Level Security:
-- Jika tabel lostfound/nebeng memakai RLS, admin perlu izin UPDATE
-- untuk bisa mengarsipkan/memulihkan postingan milik siapa pun.
-- ============================================================
-- DROP POLICY IF EXISTS "Admin dapat arsipkan lostfound" ON public.lostfound;
-- CREATE POLICY "Admin dapat arsipkan lostfound"
--   ON public.lostfound FOR UPDATE
--   USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));
--
-- DROP POLICY IF EXISTS "Admin dapat arsipkan nebeng" ON public.nebeng;
-- CREATE POLICY "Admin dapat arsipkan nebeng"
--   ON public.nebeng FOR UPDATE
--   USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));
