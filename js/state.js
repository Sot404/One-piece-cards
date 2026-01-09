export let data = {
  Marira: {},
  Soriris: {}
};

export let currentTab = 'Marira';
export let totalPreference = 'Marira';
export let sortMode = 'number'; // 'number' | 'count'

export function setSortMode(mode) {
  sortMode = mode;
}

export function setCurrentTab(tab) {
  currentTab = tab;
}

export function setTotalPreference(tab) {
  totalPreference = tab;
}
