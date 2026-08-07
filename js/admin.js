// ========== ADMIN PANEL ==========

// Tampilkan/sembunyikan tab Admin berdasarkan role pengguna.
function updateAdminAccess() {
  const tab = document.getElementById('tab-admin');
  if (!tab) return;
  if (currentUser && currentUser.role === 'admin') {
    tab.classList.remove('hidden-strict');
  } else {
    tab.classList.add('hidden-strict');
  }
}

// Dasbor: statistik + daftar semua postingan.
function renderAdminDashboard() {
  if (!currentUser || currentUser.role !== 'admin') return;

  document.getElementById('admin-total-lf').textContent = lfPosts.length;
  document.getElementById('admin-total-nb').textContent = nbPosts.length;

  renderAdminLF();
  renderAdminNB();
}

function renderAdminLF() {
  const tbody = document.getElementById('admin-lf-rows');
  const empty = document.getElementById('admin-lf-empty');
  if (lfPosts.length === 0) {
    tbody.innerHTML = '';
    empty.classList.remove('hidden');
    return;
  }
  empty.classList.add('hidden');
  tbody.innerHTML = lfPosts.map(p => `
    <tr class="border-b border-slate-700/40">
      <td class="py-2 pr-3 text-white font-semibold">${escapeHtml(p.title)}</td>
      <td class="py-2 pr-3">
        <span class="px-2 py-0.5 rounded-lg text-[10px] font-bold ${p.type === 'lost' ? 'badge-lost' : 'badge-found'}">${p.type === 'lost' ? 'Hilang' : 'Ditemukan'}</span>
      </td>
      <td class="py-2 pr-3 text-slate-300">${escapeHtml(p.location)}</td>
      <td class="py-2 pr-3 text-slate-300">${escapeHtml(p.user_name || 'Anonim')}</td>
      <td class="py-2 pr-3 text-slate-400">${formatTime(p.created_at)}</td>
      <td class="py-2 text-right">
        <button onclick="adminDeleteLF('${p.id}')" class="text-red-400 hover:text-red-300 font-bold">Hapus Permanen</button>
      </td>
    </tr>
  `).join('');
}

function renderAdminNB() {
  const tbody = document.getElementById('admin-nb-rows');
  const empty = document.getElementById('admin-nb-empty');
  if (nbPosts.length === 0) {
    tbody.innerHTML = '';
    empty.classList.remove('hidden');
    return;
  }
  empty.classList.add('hidden');
  tbody.innerHTML = nbPosts.map(p => `
    <tr class="border-b border-slate-700/40">
      <td class="py-2 pr-3 text-white font-semibold">${escapeHtml(p.from)} ➔ ${escapeHtml(p.to)}</td>
      <td class="py-2 pr-3">
        <span class="px-2 py-0.5 rounded-lg text-[10px] font-bold badge-nebeng">${p.type === 'offer' ? 'Nawarin' : 'Cari'}</span>
      </td>
      <td class="py-2 pr-3 text-slate-300">${escapeHtml(p.date)}</td>
      <td class="py-2 pr-3 text-slate-300">${escapeHtml(p.user_name || 'Anonim')}</td>
      <td class="py-2 pr-3 text-slate-300">${escapeHtml(p.contact)}</td>
      <td class="py-2 pr-3">
        <span class="px-2 py-0.5 rounded-lg text-[10px] font-bold ${p.status === 'full' ? 'badge-full' : 'badge-open'}">${p.status === 'full' ? 'Penuh' : 'Tersedia'}</span>
      </td>
      <td class="py-2 text-right">
        <button onclick="adminDeleteNB('${p.id}')" class="text-red-400 hover:text-red-300 font-bold">Hapus Permanen</button>
      </td>
    </tr>
  `).join('');
}

// Hapus permanen (tanpa peduli pemilik).
function adminDeleteLF(id) {
  openDeleteModal('Hapus permanen postingan Lost & Found ini?', async () => {
    try {
      const { error } = await supabase.from('lostfound').delete().eq('id', id);
      if (error) throw error;
      showToast('Postingan dihapus permanen.');
      loadLostFound();
    } catch (err) {
      alert('Gagal menghapus: ' + err.message);
    }
  });
}

function adminDeleteNB(id) {
  openDeleteModal('Hapus permanen postingan Nebeng ini?', async () => {
    try {
      const { error } = await supabase.from('nebeng').delete().eq('id', id);
      if (error) throw error;
      showToast('Postingan dihapus permanen.');
      loadNebeng();
    } catch (err) {
      alert('Gagal menghapus: ' + err.message);
    }
  });
}
