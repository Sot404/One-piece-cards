export const STORAGE_KEY = 'interactive-list-save';

export let data = {
  Marira: {},
  Soriris: {}
};

export let currentTab = 'Marira';
export let totalPreference = 'Marira';
export let sortMode = 'number'; 
// 'number' | 'count'

export function setSortMode(mode) {
  sortMode = mode;
}

export function setCurrentTab(tab) {
  currentTab = tab;
}

export function setTotalPreference(tab) {
  totalPreference = tab;
}

export function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function load() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) data = JSON.parse(saved);
}
