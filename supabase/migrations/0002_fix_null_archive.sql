-- ============================================================
-- KampusFind — Perbaikan: isi NULL pada kolom is_archived
-- Jalankan jika feed user kosong setelah migrasi 0001.
-- Penyebab: postingan lama yang dibuat sebelum kolom is_archived
-- ada, nilainya NULL, dan filter is_archived = false mengecualikannya.
-- ============================================================

-- 1. Set semua data lama menjadi NOT archived
UPDATE public.lostfound SET is_archived = false WHERE is_archived IS NULL;
UPDATE public.nebeng   SET is_archived = false WHERE is_archived IS NULL;

-- 2. Jamin kolom selalu NOT NULL dan default false
--    (aman dijalankan meski kolom sudah benar)
ALTER TABLE public.lostfound
  ALTER COLUMN is_archived SET NOT NULL,
  ALTER COLUMN is_archived SET DEFAULT false;
ALTER TABLE public.nebeng
  ALTER COLUMN is_archived SET NOT NULL,
  ALTER COLUMN is_archived SET DEFAULT false;

-- 3. (Opsional) Verifikasi — harus mengembalikan 0 baris
-- SELECT count(*) FROM public.lostfound WHERE is_archived IS NULL;
-- SELECT count(*) FROM public.nebeng   WHERE is_archived IS NULL;
