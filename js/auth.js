/* ============================================================
   KampusFind — Authentication (register, login, logout)
   ============================================================ */

// --- Auth UI switch (login <-> register) ---
document.getElementById('to-register').addEventListener('click', () => {
  document.getElementById('login-form').classList.add('hidden');
  document.getElementById('register-form').classList.remove('hidden');
  setAuthError('');
});

document.getElementById('to-login').addEventListener('click', () => {
  document.getElementById('register-form').classList.add('hidden');
  document.getElementById('login-form').classList.remove('hidden');
  setAuthError('');
});

// --- Register ---
document.getElementById('register-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  setAuthError('');
  setAuthLoading(true);

  const name = document.getElementById('reg-name').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const password = document.getElementById('reg-password').value;

  try {
    const cred = await auth.createUserWithEmailAndPassword(email, password);
    await cred.user.updateProfile({ displayName: name });
    await db.collection('users').doc(cred.user.uid).set({
      name: name,
      email: email,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    showToast('Pendaftaran berhasil!');
  } catch (err) {
    setAuthError(mapAuthError(err));
  } finally {
    setAuthLoading(false);
  }
});

// --- Login ---
document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  setAuthError('');
  setAuthLoading(true);

  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;

  try {
    await auth.signInWithEmailAndPassword(email, password);
    showToast('Login berhasil!');
  } catch (err) {
    setAuthError(mapAuthError(err));
  } finally {
    setAuthLoading(false);
  }
});

// --- Logout ---
document.getElementById('logout-btn').addEventListener('click', async () => {
  try {
    await auth.signOut();
    showToast('Berhasil logout.');
  } catch (err) {
    alert('Gagal logout: ' + err.message);
  }
});
