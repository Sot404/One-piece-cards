import {
  ref, set, get, onValue, off, update
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

import {
  getAuth, signInAnonymously, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import { data, currentTab, tabRoomIds, setTabLabel, setTabRoomId } from "./state.js";
import { render } from "./render.js";

const auth = getAuth(window.firebaseApp);

// κρατάμε listeners για να τους κλείνουμε
let myRoomRef = null;
let joinedRoomRef = null;

function makeRoomId(len = 28) {
  const bytes = new Uint8Array(len);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, b => (b % 36).toString(36)).join("");
}

export async function ensureAuth() {
  return new Promise((resolve, reject) => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      try {
        if (!user) await signInAnonymously(auth);
        unsub();
        resolve(auth.currentUser);
      } catch (e) {
        reject(e);
      }
    });
  });
}

export async function getOrCreateMyRoomId(defaultName = "My Room") {
  const user = await ensureAuth();
  const uid = user.uid;

  const myRoomIdRef = ref(window.firebaseDB, `userRooms/${uid}`);
  const snap = await get(myRoomIdRef);

  if (snap.exists()) return snap.val();

  const roomId = makeRoomId();
  await set(ref(window.firebaseDB, `rooms/${roomId}`), {
    owner: uid,
    meta: {
      name: defaultName,
      createdAt: Date.now(),
      updatedAt: Date.now()
    },
    Marira: {},
    Soriris: {}
  });

  await set(myRoomIdRef, roomId);
  return roomId;
}

/* =========================
   LISTEN MY ROOM -> fills data.Marira, label Marira
   ========================= */
export function listenMyRoom(roomId) {
  // close old listener
  if (myRoomRef) off(myRoomRef);

  setTabRoomId("Marira", roomId);
  myRoomRef = ref(window.firebaseDB, `rooms/${roomId}`);

  onValue(myRoomRef, (snap) => {
    if (!snap.exists()) return;
    const incoming = snap.val() || {};

    // label
    const name = incoming?.meta?.name || "My Room";
    setTabLabel("Marira", name);

    // items
    data.Marira = incoming.Marira || {};
    render();
  });
}

/* =========================
   JOIN ROOM -> fills data.Soriris, label Soriris
   ========================= */
export async function joinRoom(roomCode) {
  const roomId = (roomCode || "").trim();
  if (!roomId) return;

  // stop previous joined
  if (joinedRoomRef) off(joinedRoomRef);

  // check exists once (για να μην “αδειάζει” το tab αν έβαλε λάθος)
  const checkRef = ref(window.firebaseDB, `rooms/${roomId}`);
  const snap = await get(checkRef);
  if (!snap.exists()) {
    alert("Room not found");
    return;
  }

  setTabRoomId("Soriris", roomId);
  joinedRoomRef = checkRef;

  onValue(joinedRoomRef, (s) => {
    if (!s.exists()) return;
    const incoming = s.val() || {};

    const name = incoming?.meta?.name || "Joined Room";
    setTabLabel("Soriris", name);

    // IMPORTANT: εδώ κρατάμε μόνο το "Marira" κομμάτι του joined room ή όλο;
    // Για το use-case σου (2 tabs = 2 rooms), θέλουμε το joined room να “γεμίζει” το Soriris tab.
    // Άρα διαβάζουμε incoming.Marira (ή incoming.items) θα ήταν καλύτερα, αλλά κρατάμε το ήδη υπάρχον schema:
    data.Soriris = incoming.Marira || {}; // fallback
    render();
  });
}

/* =========================
   RENAME MY ROOM (μόνο το δικό μας - rules επιτρέπουν write μόνο owner)
   ========================= */
export async function renameMyRoom(newName) {
  const roomId = tabRoomIds.Marira;
  if (!roomId) return;

  const name = (newName || "").trim();
  if (!name) return;

  await update(ref(window.firebaseDB, `rooms/${roomId}/meta`), {
    name,
    updatedAt: Date.now()
  });
}

/* =========================
   SAVE TO FIREBASE
   - γράφει στο room που αντιστοιχεί στο currentTab
   - Total δεν γράφει
   ========================= */
export async function saveToFirebase() {
  // Δεν αποθηκεύουμε τίποτα όταν βλέπουμε Total ή Joined (read-only)
  if (currentTab !== "Marira") return;

  const roomId = tabRoomIds.Marira;
  if (!roomId) return;

  try {
    await update(ref(window.firebaseDB, `rooms/${roomId}`), {
      Marira: data.Marira,
      meta: { updatedAt: Date.now() }
    });
  } catch (e) {
    console.error("Save failed:", e);
    alert("Save failed (permission?)");
  }
}

