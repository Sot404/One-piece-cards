import { ref, set, get, onValue } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
import { data } from './state.js';
import { render } from './render.js';

let currentRoom = null;

/* =========================
   JOIN ROOM
   ========================= */
export function joinRoom(roomCode) {
  currentRoom = roomCode;

  const roomRef = ref(window.firebaseDB, `rooms/${roomCode}`);

  // Live sync
  onValue(roomRef, snapshot => {
    if (snapshot.exists()) {
      const incoming = snapshot.val();
      data.Marira = incoming.Marira || {};
      data.Soriris = incoming.Soriris || {};
      render();
    }
  });
}

/* =========================
   SAVE
   ========================= */
export function saveToFirebase() {
  if (!currentRoom) return;

  const roomRef = ref(window.firebaseDB, `rooms/${currentRoom}`);

  set(roomRef, {
    Marira: data.Marira,
    Soriris: data.Soriris
  });
   
export async function mergeFromRoom(roomCode) {
  const refRoom = ref(window.firebaseDB, `rooms/${roomCode}`);
  const snap = await get(refRoom);

  if (!snap.exists()) {
    alert('Room not found');
    return;
  }

  const incoming = snap.val();

  ['Marira', 'Soriris'].forEach(tab => {
    for (const key in incoming[tab]) {
      if (!data[tab][key]) {
        data[tab][key] = incoming[tab][key];
      }
    }
  });

  saveToFirebase();
  render();
}
   
}
