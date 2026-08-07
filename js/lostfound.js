// ---------- Lost & Found CRUD & Render ----------
document.getElementById('lf-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!currentUser) return;

  const submitBtn = document.getElementById('lf-submit-btn');
  submitBtn.disabled = true;

  const type = document.getElementById('lf-type').value;
  const title = document.getElementById('lf-title').value.trim();
  const location = document.getElementById('lf-location').value.trim();
  const desc = document.getElementById('lf-desc').value.trim();
  const contact = document.getElementById('lf-contact').value.trim();

  try {
    const { error } = await supabase.from('lostfound').insert({
      type, title, location, desc, contact,
      user_id: currentUser.uid,
      user_name: currentUser.name
    });
    if (error) throw error;
    e.target.reset();
    showToast('Postingan berhasil dipublikasikan!');
    loadLostFound();
  } catch (err) {
    alert('Gagal membuat postingan: ' + err.message);
  } finally {
    submitBtn.disabled = false;
  }
});

function deleteLF(id) {
  openDeleteModal('Postingan Lost & Found ini akan dihapus secara permanen.', async () => {
    try {
      const { error } = await supabase.from('lostfound').delete().eq('id', id);
      if (error) throw error;
      showToast('Postingan dihapus.');
      loadLostFound();
    } catch (err) {
      alert('Gagal menghapus: ' + err.message);
    }
  });
}

function renderLF() {
  const filter = document.getElementById('lf-filter').value;
  const search = document.getElementById('lf-search').value.toLowerCase();
  const container = document.getElementById('lf-list');
  const empty = document.getElementById('lf-empty');

  const filtered = lfPosts.filter(p => {
    const matchFilter = filter === 'all' || p.type === filter;
    const matchSearch = (p.title || '').toLowerCase().includes(search) ||
                        (p.location || '').toLowerCase().includes(search) ||
                        (p.desc || '').toLowerCase().includes(search);
    return matchFilter && matchSearch;
  });

  if (filtered.length === 0) {
    container.innerHTML = '';
    empty.classList.remove('hidden');
    return;
  }
  empty.classList.add('hidden');

  container.innerHTML = filtered.map(p => {
    const isOwner = currentUser && p.user_id === currentUser.uid;
    const badgeClass = p.type === 'lost' ? 'badge-lost' : 'badge-found';
    const badgeLabel = p.type === 'lost' ? 'Hilang' : 'Ditemukan';

    return `
      <div class="glass rounded-2xl p-4 space-y-2 relative fade-in">
        <div class="flex items-center justify-between gap-2">
          <span class="text-[11px] font-bold px-2.5 py-0.5 rounded-lg ${badgeClass}">${badgeLabel}</span>
          <span class="text-[10px] text-slate-400">${formatTime(p.created_at)}</span>
        </div>
        <h3 class="font-bold text-white text-base">${escapeHtml(p.title)}</h3>
        <p class="text-xs text-slate-300 font-medium">📍 ${escapeHtml(p.location)}</p>
        <p class="text-xs text-slate-400 leading-relaxed">${escapeHtml(p.desc)}</p>
        <div class="pt-2 border-t border-slate-700/50 flex items-center justify-between gap-2 text-xs">
          <span class="text-slate-400">Oleh: <strong class="text-slate-200">${escapeHtml(p.user_name || 'Anonim')}</strong></span>
          <div class="flex items-center gap-2">
            <a href="${formatWAUrl(p.contact)}" target="_blank" rel="noopener" class="text-cyan-300 font-semibold hover:underline">📞 ${escapeHtml(p.contact)}</a>
            ${isOwner ? `<button onclick="deleteLF('${p.id}')" class="text-red-400 hover:text-red-300 font-bold ml-2">Hapus</button>` : ''}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

document.getElementById('lf-filter').addEventListener('change', renderLF);
document.getElementById('lf-search').addEventListener('input', renderLF);
