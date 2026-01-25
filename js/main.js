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
  renameMyRoom,
  importDefaultIntoMyRoom
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

  try {
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
  } catch (e) {
    console.error(e);
    if (statusText) statusText.textContent = `Error: ${e?.code || 'unknown'}`;
    alert(`Error: ${e?.code || e?.message || e}`);
  }
})();

/* =========================
   JOIN ROOM
   ========================= */
const joinBtn = document.getElementById('mergeBtn');
if (joinBtn) {
  joinBtn.onclick = async () => {
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
}

/* =========================
   IMPORT DEFAULT
   ========================= */
const importBtn = document.getElementById('importDefaultBtn');
if (importBtn) {
  importBtn.onclick = importDefaultIntoMyRoom;
}

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
      prompt('Copy this code:', code);
    }
  };
}

/* =========================
   SAVE LOCAL
   ========================= */
const saveLocalBtn = document.getElementById('exportBtn');
if (saveLocalBtn) {
  saveLocalBtn.onclick = () => {
    const snapshot = {
      savedAt: Date.now(),
      tabLabels,
      tabRoomIds,
      data
    };
    localStorage.setItem('op_rooms_local_v1', JSON.stringify(snapshot));
    alert('Saved locally ✅');
  };
}

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
    if (tab.disabled) return;

    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');

    setCurrentTab(tab.dataset.tab);
    render();
  };
});

/* =========================
   SORT
   ========================= */
const sortSelect = document.getElementById('sortSelect');
if (sortSelect) {
  sortSelect.onchange = e => {
    setSortMode(e.target.value);
    render();
  };
}

/* =========================
   ADD CARD
   ========================= */
const addBtn = document.getElementById('addBtn');
if (addBtn) {
  addBtn.onclick = () => openAddModal();
}

/* =========================
   SEARCH & FILTER
   ========================= */
const searchInput = document.getElementById('searchInput');
if (searchInput) searchInput.oninput = render;

const filterSelect = document.getElementById('filterSelect');
if (filterSelect) filterSelect.onchange = render;

/* =========================
   TOTAL TAB PREFERENCE
   ========================= */
const totalSourceSelect = document.getElementById('totalSourceSelect');
if (totalSourceSelect) {
  totalSourceSelect.onchange = e => {
    setTotalPreference(e.target.value);
    render();
  };
}

/* =========================
   TRADE
   ========================= */
const tradeBtn = document.getElementById('tradeBtn');
if (tradeBtn) tradeBtn.onclick = openTradeModal;
