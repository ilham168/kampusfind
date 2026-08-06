/* ============================================================
   KampusFind — Core App (init, state, observers, listeners)
   ============================================================ */

// --- Firebase init ---
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// --- Global state ---
let currentUser = null; // { uid, email, name }
let lfPosts = [];
let nbPosts = [];
let unsubLF = null;
let unsubNB = null;

// --- DOM refs ---
const authScreen = document.getElementById('auth-screen');
const appScreen = document.getElementById('app-screen');
const navUsername = document.getElementById('nav-username');

// ============================================================
// Auth Observer
// ============================================================
auth.onAuthStateChanged((user) => {
  if (user) {
    currentUser = {
      uid: user.uid,
      email: user.email,
      name: user.displayName || user.email.split('@')[0] || 'User'
    };
    navUsername.textContent = currentUser.name;
    authScreen.classList.add('hidden-strict');
    appScreen.classList.remove('hidden-strict');

    initRealtimeListeners();
  } else {
    currentUser = null;
    if (unsubLF) unsubLF();
    if (unsubNB) unsubNB();
    appScreen.classList.add('hidden-strict');
    authScreen.classList.remove('hidden-strict');
  }
});

// ============================================================
// Tabs (Lost & Found / Nebeng)
// ============================================================
const tabLF = document.getElementById('tab-lostfound');
const tabNB = document.getElementById('tab-nebeng');
const panelLF = document.getElementById('panel-lostfound');
const panelNB = document.getElementById('panel-nebeng');

tabLF.addEventListener('click', () => {
  tabLF.classList.add('tab-active');
  tabLF.classList.remove('text-slate-400');
  tabNB.classList.remove('tab-active');
  tabNB.classList.add('text-slate-400');
  panelLF.classList.remove('hidden');
  panelNB.classList.add('hidden');
});

tabNB.addEventListener('click', () => {
  tabNB.classList.add('tab-active');
  tabNB.classList.remove('text-slate-400');
  tabLF.classList.remove('tab-active');
  tabLF.classList.add('text-slate-400');
  panelNB.classList.remove('hidden');
  panelLF.classList.add('hidden');
});

// ============================================================
// Realtime Firestore Listeners
// ============================================================
function initRealtimeListeners() {
  if (unsubLF) unsubLF();
  if (unsubNB) unsubNB();

  // Lost & Found Listener
  unsubLF = db.collection('lostfound')
    .orderBy('createdAt', 'desc')
    .onSnapshot((snapshot) => {
      lfPosts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      renderLF();
    }, (err) => console.error('LF Listen error:', err));

  // Nebeng Listener
  unsubNB = db.collection('nebeng')
    .orderBy('createdAt', 'desc')
    .onSnapshot((snapshot) => {
      nbPosts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      renderNB();
    }, (err) => console.error('NB Listen error:', err));
}
