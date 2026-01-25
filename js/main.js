import {
  setCurrentTab,
  setTotalPreference,
  setSortMode,
  data,
  tabLabels,
  tabRoomIds
} from './state.js';

import { render } from './render.js';
import { openAddModal } from './modal.js';
import {
  ensureAuth,
  getOrCreateMyRoomId,
  listenMyRoom,
  joinRoom,
  renameMyRoom
} from './firebase.js';
import { openTradeModal } from './trade.js';

/* =========================
   DOM helpers
   ========================= */
const joinedTabBtn = document.querySelector('.tab[data-tab="Soriris"]');
const myCodeEl = document.getElementById('myRoomCode');
const copyBtn = document.getElementById('copyCodeBtn');
const statusText = document.getElementById('statusText');

function setJoinedEnabled(enabled) {
  if (!joinedTabBtn) return;
  joinedTabBtn.disabled = !enabled;
  joinedTabBtn.style.opacity = enabled ? '1' : '0.5';
}

/* =========================
   INITIALIZATION
   ========================= */
(async () => {
  setJoinedEnabled(false);
  if (statusText) statusText.textContent = 'Connecting…';

  await ensureAuth();

  const myRoomId = await getOrCreateMyRoomId('My Room');
  listenMyRoom(myRoomId);

  if (myCodeEl) myCodeEl.textContent = myRoomId;
  if (statusText) statusText.textContent = 'Connected ✅';

  // auto-join last joined room (optional UX)
  const lastJoined = localStorage.getItem('op_joined_room_id');
  if (lastJoined) {
    await joinRoom(lastJoined);
    setJoinedEnabled(true);
  }

  render();
})();

/* =========================
   JOIN ROOM
   ========================= */
document.getElementById('mergeBtn').onclick = async () => {
  const code = prompt('Join room code:');
  if (!code) return;

  const roomId = code.trim();
  await joinRoom(roomId);

  // αν πέτυχε, θα έχει μπει tabRoomIds.Soriris
  if (tabRoomIds.Soriris) {
    localStorage.setItem('op_joined_room_id', tabRoomIds.Soriris);
    setJoinedEnabled(true);
  }

  render();
};

/* =========================
   COPY MY CODE
   ========================= */
if (copyBtn) {
  copyBtn.onclick = async () => {
    const code = myCodeEl?.textContent?.trim();
    if (!code || code === '—') return;

    try {
      await navigator.clipboard.writeText(code);
      alert('Copied ✅');
    } catch {
      // fallback
      prompt('Copy this code:', code);
    }
  };
}

/* =========================
   SAVE LOCAL
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
    // ignore clicks on disabled joined tab
    if (tab.disabled) return;

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
