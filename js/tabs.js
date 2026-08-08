// ---------- Tabs ----------
const tabLF = document.getElementById('tab-lostfound');
const tabNB = document.getElementById('tab-nebeng');
const panelLF = document.getElementById('panel-lostfound');
const panelNB = document.getElementById('panel-nebeng');

function activateTab(tab, panel) {
  [tabLF, tabNB].forEach(t => {
    t.classList.remove('tab-active');
    t.classList.add('text-slate-400');
  });
  [panelLF, panelNB].forEach(p => p.classList.add('hidden'));
  tab.classList.add('tab-active');
  tab.classList.remove('text-slate-400');
  panel.classList.remove('hidden');
}

tabLF.addEventListener('click', () => activateTab(tabLF, panelLF));

tabNB.addEventListener('click', () => activateTab(tabNB, panelNB));
