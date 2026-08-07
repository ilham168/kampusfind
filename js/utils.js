// ---------- State Global ----------
let currentUser = null; // { uid, email, name }
let lfPosts = [];
let nbPosts = [];
let supabaseChannel = null;

// ---------- Utils ----------
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.remove('hidden');
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => t.classList.add('hidden'), 2600);
}

function setAuthError(msg) {
  const authError = document.getElementById('auth-error');
  if (!msg) {
    authError.classList.add('hidden');
    authError.textContent = '';
    return;
  }
  authError.textContent = msg;
  authError.classList.remove('hidden');
}

function setAuthLoading(on) {
  document.getElementById('auth-loading').classList.toggle('hidden', !on);
  document.getElementById('login-btn').disabled = on;
  document.getElementById('register-btn').disabled = on;
}

function mapAuthError(err) {
  const code = err && err.code ? err.code : '';
  const status = err && err.status ? err.status : '';
  const msg = err && err.message ? err.message.toLowerCase() : '';
  const map = {
    'user_already_exists': 'Email sudah terdaftar.',
    'email_exists': 'Email sudah terdaftar.',
    'invalid_credentials': 'Email atau password salah.',
    'invalid_email': 'Format email tidak valid.',
    'email_not_confirmed': 'Email belum diverifikasi. Cek inbox kamu.',
    'weak_password': 'Password terlalu lemah (min. 6 karakter).',
    'over_request_rate_limit': 'Terlalu banyak percobaan. Coba lagi nanti.',
    'validation_failed': 'Format email tidak valid.'
  };
  if (map[code]) return map[code];
  if (msg.includes('already registered')) return 'Email sudah terdaftar.';
  if (msg.includes('invalid login credentials')) return 'Email atau password salah.';
  if (msg.includes('weak password')) return 'Password terlalu lemah (min. 6 karakter).';
  if (msg.includes('email not confirmed')) return 'Email belum diverifikasi. Cek inbox kamu.';
  if (msg.includes('network') || msg.includes('fetch failed')) return 'Gagal jaringan. Periksa koneksi Anda.';
  if (status === 429) return 'Terlalu banyak percobaan. Coba lagi nanti.';
  return err.message || 'Terjadi kesalahan autentikasi.';
}

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatTime(ts) {
  try {
    const d = ts?.toDate ? ts.toDate() : (ts instanceof Date ? ts : new Date(ts));
    return d.toLocaleString('id-ID', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  } catch {
    return '-';
  }
}

// Ubah "08xxxxxxxxxx" -> "628xxxxxxxxxx", selain itu tetap di-format ke nomor internasional.
function formatWAUrl(phone) {
  if (!phone) return '#';
  let cleaned = String(phone).replace(/\D/g, '');
  if (cleaned.startsWith('0')) cleaned = '62' + cleaned.slice(1);
  return `https://wa.me/${cleaned}`;
}

// ---------- Modal Konfirmasi Hapus ----------
let deleteModalOnConfirm = null;

function openDeleteModal(message, onConfirm) {
  const msgEl = document.getElementById('delete-modal-msg');
  if (msgEl && message) msgEl.textContent = message;
  deleteModalOnConfirm = onConfirm;
  document.getElementById('delete-modal').classList.remove('hidden');
}

function closeDeleteModal() {
  deleteModalOnConfirm = null;
  document.getElementById('delete-modal').classList.add('hidden');
}

document.getElementById('modal-cancel-btn').addEventListener('click', closeDeleteModal);

document.getElementById('modal-confirm-btn').addEventListener('click', async () => {
  const cb = deleteModalOnConfirm;
  closeDeleteModal();
  if (cb) await cb();
});
