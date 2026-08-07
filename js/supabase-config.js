/*******************************************************
 * SUPABASE CONFIG — inisialisasi klien Supabase
 * Catatan: hanya publishable key yang dipakai di browser.
 * Secret key (service role) JANGAN pernah dimasukkan ke kode frontend.
 *******************************************************/
const SUPABASE_URL = 'https://hthflcgptpughhpqxbqn.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_JvRPBPQEs4HeUdKw5tqtPA_8XMqNCO0';

// Overwrite global `supabase` dari CDN dengan instance klien,
// agar semua file lain (auth.js, main.js, dst.) memakai klien yang sama.
window.supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
