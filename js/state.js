export let data = {
  Marira: {},  // my room items
  Soriris: {}  // joined room items
};

export let currentTab = 'Marira';
export let totalPreference = 'Marira';
export let sortMode = 'number'; // 'number' | 'count'

// ΝΕΟ: labels που θα φαίνονται στο UI
export let tabLabels = {
  Marira: 'My Room',
  Soriris: 'Joined Room'
};

// ΝΕΟ: ποιο roomId αντιστοιχεί σε κάθε tab
export let tabRoomIds = {
  Marira: null,   // myRoomId
  Soriris: null   // joinedRoomId
};

export function setSortMode(mode) {
  sortMode = mode;
}

export function setCurrentTab(tab) {
  currentTab = tab;
}

export function setTotalPreference(tab) {
  totalPreference = tab;
}

export function setTabLabel(tab, label) {
  tabLabels[tab] = label;
}

export function setTabRoomId(tab, roomId) {
  tabRoomIds[tab] = roomId;
}
