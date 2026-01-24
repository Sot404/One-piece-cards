import { data, currentTab, sortMode } from './state.js';

export function calculateGlobalTotal() {
  let sum = 0;

  for (let i = 1; i <= 200; i++) {
    if (currentTab === 'Total') {
      if (data.Marira[i]) sum += data.Marira[i].count || 1;
      if (data.Soriris[i]) sum += data.Soriris[i].count || 1;
    } else {
      const entry = data[currentTab][i];
      if (entry) sum += entry.count || 1;
    }
  }

  return sum;
}

export function getSortedItems() {
  const items = [];

  for (let i = 1; i <= 200; i++) {
    let count = 0;

    if (currentTab === 'Total') {
      if (data.Marira[i]) count += data.Marira[i].count || 1;
      if (data.Soriris[i]) count += data.Soriris[i].count || 1;
    } else {
      const entry = data[currentTab][i];
      if (entry) count = entry.count || 1;
    }

    items.push({ number: i, count });
  }

  // 🔹 SORT LOGIC
  if (sortMode === 'count') {
    items.sort((a, b) => b.count - a.count || a.number - b.number);
  } else {
    items.sort((a, b) => a.number - b.number);
  }

  return items;
}

export function getTabStats(tab) {
  let found = 0;

  for (let i = 1; i <= 200; i++) {
    if (data[tab]?.[i]) found++;
  }

  return {
    found,
    total: 200,
    missing: 200 - found
  };
}

export function getTradeCandidates() {
  const marira = [];
  const soriris = [];

  for (let i = 1; i <= 200; i++) {
    const m = data.Marira[i];
    const s = data.Soriris[i];

    // Marira -> Soriris
    if (m && m.count >= 2 && !s) {
      marira.push({
        number: i,
        count: m.count,
        text: m.text
      });
    }

    // Soriris -> Marira
    if (s && s.count >= 2 && !m) {
      soriris.push({
        number: i,
        count: s.count,
        text: s.text
      });
    }
  }

  return { marira, soriris };
}
