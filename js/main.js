import { setCurrentTab, setTotalPreference, setSortMode, data, tabLabels, tabRoomIds } from './state.js';
import { render } from './render.js';
import { openAddModal } from './modal.js';
import { ensureAuth, getOrCreateMyRoomId, listenMyRoom, joinRoom, renameMyRoom } from './firebase.js';
import { openTradeModal } from './trade.js';

/* =========================
   INITIALIZATION
   ========================= */
(async () => {
  await ensureAuth();

  // δημιουργεί/βρίσκει το δικό σου room και κάνει listen
  const myRoomId = await getOrCreateMyRoomId('My Room');
  listenMyRoom(myRoomId);

  render();
})();

/* =========================
   JOIN ROOM (αντί για merge)
   ========================= */
document.getElementById('mergeBtn').onclick = async () => {
  const code = prompt('Join room code:');
  if (code) {
    await joinRoom(code.trim());
    render();
  }
};

/* =========================
   SAVE LOCAL (αντί για export)
   ========================= */
document.getElementById('exportBtn').onclick = () => {
  const snapshot = {
    savedAt: Date.now(),
    tabLabels,
    tabRoomIds,
    data
  };
  localStorage.setItem('op_rooms_local_v1', JSON.stringify(snapshot));
  alert('Saved locally ✅');
};

/* =========================
   RENAME MY ROOM
   ========================= */
const renameBtn = document.getElementById('renameBtn');
if (renameBtn) {
  renameBtn.onclick = async () => {
    const name = prompt('Rename your room:');
    if (name) await renameMyRoom(name.trim());
  };
}

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

/* =========================
   TRADE
   ========================= */
document.getElementById('tradeBtn').onclick = openTradeModal;
