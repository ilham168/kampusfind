/* ============================================================
   KampusFind — Board Nebeng (posting, render, delete)
   ============================================================ */

// --- Create post ---
document.getElementById('nb-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!currentUser) return;

  const type = document.getElementById('nb-type').value;
  const from = document.getElementById('nb-from').value.trim();
  const to = document.getElementById('nb-to').value.trim();
  const date = document.getElementById('nb-date').value;
  const time = document.getElementById('nb-time').value;
  const note = document.getElementById('nb-note').value.trim();
  const contact = document.getElementById('nb-contact').value.trim();

  try {
    await db.collection('nebeng').add({
      type, from, to, date, time, note, contact,
      userId: currentUser.uid,
      userName: currentUser.name,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    e.target.reset();
    showToast('Posting nebeng berhasil dipublikasikan!');
  } catch (err) {
    alert('Gagal posting nebeng: ' + err.message);
  }
});

// --- Delete post ---
async function deleteNB(id) {
  if (!confirm('Hapus postingan ini?')) return;
  try {
    await db.collection('nebeng').doc(id).delete();
    showToast('Posting nebeng dihapus.');
  } catch (err) {
    alert('Gagal menghapus: ' + err.message);
  }
}

// --- Render list ---
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
    const isOwner = currentUser && p.userId === currentUser.uid;
    const badgeClass = 'badge-nebeng';
    const badgeLabel = p.type === 'offer' ? 'Nawarin Tumpangan' : 'Cari Tumpangan';

    return `
      <div class="glass rounded-2xl p-4 space-y-2 relative fade-in">
        <div class="flex items-center justify-between gap-2">
          <span class="text-[11px] font-bold px-2.5 py-0.5 rounded-lg ${badgeClass}">${badgeLabel}</span>
          <span class="text-[10px] text-slate-400">${formatTime(p.createdAt)}</span>
        </div>
        <h3 class="font-bold text-white text-base">${escapeHtml(p.from)} ➔ ${escapeHtml(p.to)}</h3>
        <p class="text-xs text-slate-300 font-medium">📅 ${escapeHtml(p.date)} · ⏰ ${escapeHtml(p.time)}</p>
        ${p.note ? `<p class="text-xs text-slate-400 leading-relaxed">${escapeHtml(p.note)}</p>` : ''}
        <div class="pt-2 border-t border-slate-700/50 flex items-center justify-between gap-2 text-xs">
          <span class="text-slate-400">Oleh: <strong class="text-slate-200">${escapeHtml(p.userName || 'Anonim')}</strong></span>
          <div class="flex items-center gap-2">
            <span class="text-emerald-300 font-semibold">📞 ${escapeHtml(p.contact)}</span>
            ${isOwner ? `<button onclick="deleteNB('${p.id}')" class="text-red-400 hover:text-red-300 font-bold ml-2">Hapus</button>` : ''}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

document.getElementById('nb-filter').addEventListener('change', renderNB);
document.getElementById('nb-search').addEventListener('input', renderNB);
