// ========== ADMIN PANEL (layar terpisah) ==========

// State khusus admin: SEMUA data (aktif + arsip).
let adminLF = [];
let adminNB = [];

// ---------- Navigasi internal admin ----------
const adminTabActive = document.getElementById('admin-tab-active');
const adminTabArchive = document.getElementById('admin-tab-archive');
const adminPanelActive = document.getElementById('admin-panel-active');
const adminPanelArchive = document.getElementById('admin-panel-archive');

function showAdminView(active) {
  adminTabActive.classList.toggle('tab-active', active);
  adminTabActive.classList.toggle('text-slate-400', !active);
  adminTabArchive.classList.toggle('tab-active', !active);
  adminTabArchive.classList.toggle('text-slate-400', active);
  adminPanelActive.classList.toggle('hidden', !active);
  adminPanelArchive.classList.toggle('hidden', active);
}

adminTabActive.addEventListener('click', () => showAdminView(true));

adminTabArchive.addEventListener('click', () => showAdminView(false));

// ---------- Fetch semua data (aktif + arsip) ----------
async function adminFetchData() {
  const [lfRes, nbRes] = await Promise.all([
    supabase.from('lostfound').select('*').order('created_at', { ascending: false }),
    supabase.from('nebeng').select('*').order('created_at', { ascending: false })
  ]);
  if (lfRes.error) console.error('Admin LF fetch error:', lfRes.error.message);
  if (nbRes.error) console.error('Admin NB fetch error:', nbRes.error.message);

  adminLF = lfRes.data || [];
  adminNB = nbRes.data || [];
  renderAdminDashboard();
}

// ---------- Render Dasbor ----------
function renderAdminDashboard() {
  if (!currentUser || currentUser.role !== 'admin') return;

  const activeLF = adminLF.filter(p => !p.is_archived);
  const activeNB = adminNB.filter(p => !p.is_archived);
  const archiveLF = adminLF.filter(p => p.is_archived);
  const archiveNB = adminNB.filter(p => p.is_archived);

  document.getElementById('admin-total-lf').textContent = activeLF.length;
  document.getElementById('admin-total-nb').textContent = activeNB.length;

  renderAdminRows(activeLF, 'admin-active-lf-rows', 'admin-active-lf-empty', 'lf');
  renderAdminRows(activeNB, 'admin-active-nb-rows', 'admin-active-nb-empty', 'nb');
  renderAdminRows(archiveLF, 'admin-archive-lf-rows', 'admin-archive-lf-empty', 'lf', true);
  renderAdminRows(archiveNB, 'admin-archive-nb-rows', 'admin-archive-nb-empty', 'nb', true);
}

function renderAdminRows(posts, containerId, emptyId, type, archived = false) {
  const tbody = document.getElementById(containerId);
  const empty = document.getElementById(emptyId);
  if (posts.length === 0) {
    tbody.innerHTML = '';
    empty.classList.remove('hidden');
    return;
  }
  empty.classList.add('hidden');

  tbody.innerHTML = posts.map(p => {
    if (type === 'lf') {
      return `
        <tr class="border-b border-slate-700/40">
          <td class="py-2 pr-3 text-white font-semibold">${escapeHtml(p.title)}</td>
          <td class="py-2 pr-3">
            <span class="px-2 py-0.5 rounded-lg text-[10px] font-bold ${p.type === 'lost' ? 'badge-lost' : 'badge-found'}">${p.type === 'lost' ? 'Hilang' : 'Ditemukan'}</span>
          </td>
          <td class="py-2 pr-3 text-slate-300">${escapeHtml(p.location)}</td>
          <td class="py-2 pr-3 text-slate-300">${escapeHtml(p.user_name || 'Anonim')}</td>
          <td class="py-2 pr-3 text-slate-400">${formatTime(p.created_at)}</td>
          <td class="py-2 text-right">
            ${archived
              ? `<button onclick="adminRestoreLF('${p.id}')" class="text-emerald-400 hover:text-emerald-300 font-bold">Restore</button>`
              : `<button onclick="adminArchiveLF('${p.id}')" class="text-amber-400 hover:text-amber-300 font-bold">Arsipkan</button>`}
          </td>
        </tr>
      `;
    }
    return `
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
          ${archived
            ? `<button onclick="adminRestoreNB('${p.id}')" class="text-emerald-400 hover:text-emerald-300 font-bold">Restore</button>`
            : `<button onclick="adminArchiveNB('${p.id}')" class="text-amber-400 hover:text-amber-300 font-bold">Arsipkan</button>`}
        </td>
      </tr>
    `;
  }).join('');
}

// ---------- Soft Delete: Archive / Restore ----------
// Admin tidak menghapus permanen, cukup mengubah is_archived.
async function setArchived(table, id, isArchived) {
  try {
    const { error } = await supabase
      .from(table)
      .update({ is_archived: isArchived })
      .eq('id', id);
    if (error) throw error;
    showToast(isArchived ? 'Postingan diarsipkan.' : 'Postingan dipulihkan dari arsip.');
    adminFetchData();
  } catch (err) {
    alert('Gagal mengubah status arsip: ' + err.message);
  }
}

function adminArchiveLF(id) {
  if (confirm('Arsipkan postingan Lost & Found ini?')) setArchived('lostfound', id, true);
}

function adminArchiveNB(id) {
  if (confirm('Arsipkan postingan Nebeng ini?')) setArchived('nebeng', id, true);
}

function adminRestoreLF(id) {
  if (confirm('Pulihkan postingan Lost & Found ini dari arsip?')) setArchived('lostfound', id, false);
}

function adminRestoreNB(id) {
  if (confirm('Pulihkan postingan Nebeng ini dari arsip?')) setArchived('nebeng', id, false);
}
