// DOM refs
const authScreen = document.getElementById('auth-screen');
const appScreen = document.getElementById('app-screen');
const adminScreen = document.getElementById('admin-screen');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const navUsername = document.getElementById('nav-username');
const adminUsername = document.getElementById('admin-username');

function showScreen(screen) {
  [authScreen, appScreen, adminScreen].forEach(s => s.classList.add('hidden-strict'));
  screen.classList.remove('hidden-strict');
}

// ---------- Auth UI switch ----------
document.getElementById('to-register').addEventListener('click', () => {
  loginForm.classList.add('hidden');
  registerForm.classList.remove('hidden');
  setAuthError('');
});
document.getElementById('to-login').addEventListener('click', () => {
  registerForm.classList.add('hidden');
  loginForm.classList.remove('hidden');
  setAuthError('');
});

// ---------- Register ----------
registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  setAuthError('');
  setAuthLoading(true);

  const name = document.getElementById('reg-name').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const password = document.getElementById('reg-password').value;

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } }
    });
    if (error) throw error;

    if (data.user) {
      const { error: perr } = await supabase
        .from('users')
        .upsert({ id: data.user.id, name, email }, { onConflict: 'id' });
      if (perr) console.error('Gagal simpan profil:', perr.message);
    }

    if (data.session) {
      showToast('Pendaftaran berhasil!');
    } else {
      showToast('Cek email kamu untuk verifikasi, lalu login.');
      registerForm.classList.add('hidden');
      loginForm.classList.remove('hidden');
    }
  } catch (err) {
    setAuthError(mapAuthError(err));
  } finally {
    setAuthLoading(false);
  }
});

// ---------- Login ----------
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  setAuthError('');
  setAuthLoading(true);

  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;

  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;

    const name = data.user.user_metadata?.full_name || email.split('@')[0] || 'User';
    const { error: perr } = await supabase
      .from('users')
      .upsert({ id: data.user.id, name, email: data.user.email }, { onConflict: 'id' });
    if (perr) console.error('Gagal simpan profil:', perr.message);

    showToast('Login berhasil!');
  } catch (err) {
    setAuthError(mapAuthError(err));
  } finally {
    setAuthLoading(false);
  }
});

// ---------- Logout ----------
async function handleLogout() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    showToast('Berhasil logout.');
  } catch (err) {
    alert('Gagal logout: ' + err.message);
  }
}

document.getElementById('logout-btn').addEventListener('click', handleLogout);
document.getElementById('admin-logout-btn').addEventListener('click', handleLogout);

// ---------- Auth Observer ----------
supabase.auth.onAuthStateChange(async (_event, session) => {
  const user = session?.user;
  if (!user) {
    currentUser = null;
    if (supabaseChannel) supabaseChannel.unsubscribe();
    showScreen(authScreen);
    return;
  }

  const name = user.user_metadata?.full_name || user.email.split('@')[0] || 'User';

  // Ambil role dari tabel users (default 'user' jika belum ada).
  let role = 'user';
  const { data } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();
  if (data && data.role) role = data.role;

  currentUser = { uid: user.id, email: user.email, name, role };
  navUsername.textContent = name;
  adminUsername.textContent = name;

  if (role === 'admin') {
    showScreen(adminScreen);
    adminFetchData();
  } else {
    showScreen(appScreen);
    initRealtimeListeners();
  }
});
