-- ============================================================
-- KampusFind — Tambah kolom status pada tabel nebeng
-- Jalankan di Supabase SQL Editor.
-- Kolom ini dipakai fitur "Tandai Penuh" (open / full).
-- ============================================================

ALTER TABLE public.nebeng
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'open';

-- (Opsional) Verifikasi:
-- SELECT column_name FROM information_schema.columns
--   WHERE table_name = 'nebeng' AND column_name = 'status';
