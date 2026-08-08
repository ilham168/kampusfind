// ---------- Fetch dari Supabase ----------
// User biasa hanya melihat data yang TIDAK diarsipkan (is_archived = false).
async function loadLostFound() {
  const { data, error } = await supabase
    .from('lostfound')
    .select('*')
    .eq('is_archived', false)
    .order('created_at', { ascending: false });
  if (error) {
    console.error('LF fetch error:', error);
    return;
  }
  lfPosts = data;
  renderLF();
}

async function loadNebeng() {
  const { data, error } = await supabase
    .from('nebeng')
    .select('*')
    .eq('is_archived', false)
    .order('created_at', { ascending: false });
  if (error) {
    console.error('NB fetch error:', error);
    return;
  }
  nbPosts = data;
  renderNB();
}

// ---------- Realtime Listeners ----------
function initRealtimeListeners() {
  if (supabaseChannel) supabaseChannel.unsubscribe();

  loadLostFound();
  loadNebeng();

  // Butuh Realtime Postgres aktif di tabel lostfound & nebeng (Database > Replication di dashboard).
  // Jika tidak aktif, daftar tetap ter-update otomatis setelah submit/hapus.
  supabaseChannel = supabase
    .channel('db-changes')
    .on('postgres_changes',
      { event: '*', schema: 'public', table: 'lostfound' },
      () => loadLostFound())
    .on('postgres_changes',
      { event: '*', schema: 'public', table: 'nebeng' },
      () => loadNebeng())
    .subscribe();
}
