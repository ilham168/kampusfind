// ---------- Nebeng CRUD & Render ----------
document.getElementById('nb-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!currentUser) return;

  const submitBtn = document.getElementById('nb-submit-btn');
  submitBtn.disabled = true;

  const type = document.getElementById('nb-type').value;
  const from = document.getElementById('nb-from').value.trim();
  const to = document.getElementById('nb-to').value.trim();
  const date = document.getElementById('nb-date').value;
  const time = document.getElementById('nb-time').value;
  const note = document.getElementById('nb-note').value.trim();
  const contact = document.getElementById('nb-contact').value.trim();
  const mapsLink = document.getElementById('nb-maps').value.trim();

  try {
    const { error } = await supabase.from('nebeng').insert({
      type, from, to, date, time, note, contact, maps_link: mapsLink || null,
      user_id: currentUser.uid,
      user_name: currentUser.name
    });
    if (error) throw error;
    e.target.reset();
    showToast('Posting nebeng berhasil dipublikasikan!');
    loadNebeng();
  } catch (err) {
    alert('Gagal posting nebeng: ' + err.message);
  } finally {
    submitBtn.disabled = false;
  }
});

// ---------- Helper: Link WhatsApp ----------
// Ubah "08xxxxxxxxxx" -> "628xxxxxxxxxx", selain itu kembalikan null.
function waLink(contact) {
  const raw = String(contact || '').trim().replace(/\s+/g, '');
  if (raw.startsWith('08')) return 'https://wa.me/62' + raw.slice(1);
  return null;
}

// ---------- Update status kuota (open <-> full) ----------
async function setNebengStatus(id, status) {
  try {
    const { error } = await supabase
      .from('nebeng')
      .update({ status })
      .eq('id', id);
    if (error) throw error;
    showToast(status === 'full' ? 'Postingan ditandai Penuh.' : 'Postingan dibuka kembali (Tersedia).');
    loadNebeng();
  } catch (err) {
    alert('Gagal mengubah status: ' + err.message);
  }
}

function deleteNB(id) {
  openDeleteModal('Postingan Nebeng ini akan dihapus secara permanen.', async () => {
    try {
      const { error } = await supabase.from('nebeng').delete().eq('id', id);
      if (error) throw error;
      showToast('Posting nebeng dihapus.');
      loadNebeng();
    } catch (err) {
      alert('Gagal menghapus: ' + err.message);
    }
  });
}

function renderNB() {
  const filter = document.getElementById('nb-filter').value;
  const search = document.getElementById('nb-search').value.toLowerCase();
  const container = document.getElementById('nb-list');
  const empty = document.getElementById('nb-empty');

  const filtered = nbPosts.filter(p => {
    const matchFilter = filter === 'all' || p.type === filter;
    const matchSearch = (p.from || '').toLowerCase().includes(search) ||
                        (p.to || '').toLowerCase().includes(search) ||
                        (p.note || '').toLowerCase().includes(search);
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
    const isFull = p.status === 'full';

    const typeBadgeClass = 'badge-nebeng';
    const typeBadgeLabel = p.type === 'offer' ? 'Nawarin Tumpangan' : 'Cari Tumpangan';

    const statusClass = isFull ? 'badge-full' : 'badge-open';
    const statusLabel = isFull ? 'Penuh' : 'Tersedia';

    // Kontak: link WA kalau diawali "08" & belum penuh, selain itu teks biasa.
    const wa = waLink(p.contact);
    const contactHtml = isFull
      ? `<span class="text-slate-500 font-semibold">📞 ${escapeHtml(p.contact)}</span>`
      : wa
        ? `<a href="${wa}" target="_blank" rel="noopener" class="text-emerald-300 font-semibold hover:text-emerald-200 hover:underline">📞 ${escapeHtml(p.contact)} ↗</a>`
        : `<span class="text-emerald-300 font-semibold">📞 ${escapeHtml(p.contact)}</span>`;

    const ownerActions = isOwner ? `
      <div class="flex items-center gap-2">
        ${isFull
          ? `<button onclick="setNebengStatus('${p.id}', 'open')" class="text-emerald-400 hover:text-emerald-300 font-bold">Tandai Tersedia</button>`
          : `<button onclick="setNebengStatus('${p.id}', 'full')" class="text-amber-400 hover:text-amber-300 font-bold">Tandai Penuh</button>`}
        <button onclick="deleteNB('${p.id}')" class="text-red-400 hover:text-red-300 font-bold">Hapus</button>
      </div>` : '';

    const mapsHtml = p.maps_link
      ? `<a href="${escapeHtml(p.maps_link)}" target="_blank" rel="noopener" class="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg text-cyan-300 bg-cyan-400/10 border border-cyan-400/25 hover:bg-cyan-400/20 transition">📍 Buka rute di Maps</a>`
      : '';

    return `
      <div class="glass rounded-2xl p-4 space-y-2 relative fade-in${isFull ? ' opacity-60' : ''}">
        <div class="flex items-center justify-between gap-2">
          <div class="flex items-center gap-2">
            <span class="text-[11px] font-bold px-2.5 py-0.5 rounded-lg ${typeBadgeClass}">${typeBadgeLabel}</span>
            <span class="text-[11px] font-bold px-2.5 py-0.5 rounded-lg ${statusClass}">${statusLabel}</span>
          </div>
          <span class="text-[10px] text-slate-400">${formatTime(p.created_at)}</span>
        </div>
        <h3 class="font-bold text-white text-base">${escapeHtml(p.from)} ➔ ${escapeHtml(p.to)}</h3>
        <p class="text-xs text-slate-300 font-medium">📅 ${escapeHtml(p.date)} · ⏰ ${escapeHtml(p.time)}</p>
        ${mapsHtml}
        ${p.note ? `<p class="text-xs text-slate-400 leading-relaxed">${escapeHtml(p.note)}</p>` : ''}
        <div class="pt-2 border-t border-slate-700/50 flex items-center justify-between gap-2 text-xs">
          <span class="text-slate-400">Oleh: <strong class="text-slate-200">${escapeHtml(p.user_name || 'Anonim')}</strong></span>
          <div class="flex items-center gap-2">
            ${contactHtml}
            ${ownerActions}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

document.getElementById('nb-filter').addEventListener('change', renderNB);
document.getElementById('nb-search').addEventListener('input', renderNB);
