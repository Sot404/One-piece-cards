import { setCurrentTab, setTotalPreference, setSortMode } from './state.js';
import { render } from './render.js';
import { openAddModal } from './modal.js';
import { joinRoom, mergeFromRoom } from './firebase.js';
import { exportToJSON } from './export.js';
import { mergeFromJSON } from './merge.js';

/* =========================
   INITIALIZATION
   ========================= */

// ⚠️ Για αρχή σταθερό room
// Μπορείς αργότερα να το κάνεις input
joinRoom('DEFAULT');

document.getElementById('mergeBtn').onclick = () => {
  const code = prompt('Merge from room:');
  if (code) mergeFromRoom(code.trim());
};
document.getElementById('mergeBtn').onclick = mergeFromJSON;
document.getElementById('exportBtn').onclick = exportToJSON;

/* =========================
   TAB HANDLING
   ========================= */

document.querySelectorAll('.tab').forEach(tab => {
  tab.onclick = () => {
    document.querySelectorAll('.tab').forEach(t =>
      t.classList.remove('active')
    );

    tab.classList.add('active');
    setCurrentTab(tab.dataset.tab);
    render();
  };
});

/* =========================
   SORT
   ========================= */

document.getElementById('sortSelect').onchange = e => {
  setSortMode(e.target.value);
  render();
};

/* =========================
   ADD CARD
   ========================= */

document.getElementById('addBtn').onclick = () => {
  openAddModal();
};

/* =========================
   SEARCH & FILTER
   ========================= */

document.getElementById('searchInput').oninput = render;
document.getElementById('filterSelect').onchange = render;

/* =========================
   TOTAL TAB PREFERENCE
   ========================= */

document.getElementById('totalSourceSelect').onchange = e => {
  setTotalPreference(e.target.value);
  render();
};

