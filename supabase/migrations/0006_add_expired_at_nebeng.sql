-- ============================================================
-- KampusFind — Auto-archive Nebeng (expired_at)
-- Jalankan di Supabase SQL Editor.
--
-- Fitur: postingan nebeng otomatis diarsipkan (is_archived = true)
-- saat waktu menunggu (date + time) sudah lewat.
-- ============================================================

-- 1. Kolom expired_at (timestamp dengan timezone) pada tabel nebeng
ALTER TABLE public.nebeng
  ADD COLUMN IF NOT EXISTS expired_at timestamptz;

-- 2. Backfill data lama: hitung dari kolom date + time (asumsi WIB)
UPDATE public.nebeng
SET expired_at = (date + time) AT TIME ZONE 'Asia/Jakarta'
WHERE expired_at IS NULL AND date IS NOT NULL AND time IS NOT NULL;

-- 3. (Opsional) Auto-archive di server setiap menit via pg_cron.
--    Jika pg_cron belum aktif, frontend tetap mengarsipkan sendiri.
DO $$
BEGIN
  BEGIN
    PERFORM cron.schedule(
      'archive-expired-nebeng',
      '* * * * *',
      $$ UPDATE public.nebeng
         SET is_archived = true
         WHERE is_archived = false AND expired_at < now() $$
    );
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'pg_cron belum aktif — auto-archive dijalankan oleh frontend.';
  END;
END $$;

-- (Opsional) Verifikasi:
-- SELECT id, date, time, expired_at, is_archived
--   FROM public.nebeng ORDER BY created_at DESC LIMIT 10;
