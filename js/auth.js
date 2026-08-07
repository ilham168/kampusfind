// DOM refs
const authScreen = document.getElementById('auth-screen');
const appScreen = document.getElementById('app-screen');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const navUsername = document.getElementById('nav-username');

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
document.getElementById('logout-btn').addEventListener('click', async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    showToast('Berhasil logout.');
  } catch (err) {
    alert('Gagal logout: ' + err.message);
  }
});

// ---------- Auth Observer ----------
supabase.auth.onAuthStateChange(async (_event, session) => {
  const user = session?.user;
  if (user) {
    const name = user.user_metadata?.full_name || user.email.split('@')[0] || 'User';
    currentUser = { uid: user.id, email: user.email, name, role: 'user' };

    // Ambil role dari tabel users (default 'user' jika belum ada).
    const { data } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();
    if (data && data.role) currentUser.role = data.role;

    navUsername.textContent = name;
    authScreen.classList.add('hidden-strict');
    appScreen.classList.remove('hidden-strict');

    updateAdminAccess();
    initRealtimeListeners();
  } else {
    currentUser = null;
    if (supabaseChannel) supabaseChannel.unsubscribe();
    appScreen.classList.add('hidden-strict');
    authScreen.classList.remove('hidden-strict');
  }
});
