import { data, currentTab, totalPreference } from './state.js';
import { saveToFirebase } from './firebase.js';
import { getSortedItems, calculateGlobalTotal, getTabStats } from './utils.js';
import { openEditModal, openAddModal } from './modal.js';

const listEl = document.getElementById('list');
const globalTotalEl = document.getElementById('globalTotal');
const searchInput = document.getElementById('searchInput');
const filterSelect = document.getElementById('filterSelect');
const totalSourceSelect = document.getElementById('totalSourceSelect');

export function render() {
  listEl.innerHTML = '';

  document.querySelectorAll('.tab').forEach(tabEl => {
    const tab = tabEl.dataset.tab;
   
    if (tab === 'Total') return;
    
    const { found, total, missing } = getTabStats(tab);
    
    tabEl.textContent = `${tab} ${found}/${total} (${missing} missing)`;
  });
   
  const search = searchInput.value.toLowerCase();
  const filter = filterSelect.value;

  const total = calculateGlobalTotal();
  if (currentTab === 'Total' && total > 0) {
    globalTotalEl.textContent = `Total count: ${total}`;
    globalTotalEl.classList.remove('hidden');
  } else {
    globalTotalEl.classList.add('hidden');
  }

  const items = getSortedItems();

  for (const { number: i } of items) {
    const m = data.Marira[i];
    const s = data.Soriris[i];

    let entry = null;
    let origin = null;
    let totalCount = 0;

    if (currentTab === 'Total') {
      if (m) totalCount += m.count || 1;
      if (s) totalCount += s.count || 1;

      if (m && s) {
        entry = totalPreference === 'Marira' ? m : s;
        origin = totalPreference;
      } else if (m) {
        entry = m;
        origin = 'Marira';
      } else if (s) {
        entry = s;
        origin = 'Soriris';
      }
    } else {
      entry = data[currentTab][i];
      origin = currentTab;
    }

    if (filter === 'found' && !entry) continue;
    if (filter === 'missing' && entry) continue;

    if (search) {
      const txt = String(i) + (entry?.text || '');
      if (!txt.toLowerCase().includes(search)) continue;
    }

    const li = document.createElement('li');
    li.className = 'card';
    if (!entry && currentTab !== 'Total') {
      li.onclick = () => openAddModal(i);
    }
    if (entry?.glow) li.classList.add('glow');

    const left = document.createElement('div');
    left.className = 'card-left';
    left.innerHTML = `<div class="card-number">#${i}</div>`;
    if (entry) left.innerHTML += `<div class="card-text">${entry.text}</div>`;

    const right = document.createElement('div');
    right.className = 'card-right';

    if (entry && currentTab !== 'Total') {
      const counter = document.createElement('div');
      counter.className = 'counter';

      const minus = document.createElement('button');
      minus.textContent = '−';
      minus.onclick = () => {
        
        if (entry.count > 1) {
          entry.count--;
          saveToFirebase();
          render();
        }
      };

      const value = document.createElement('span');
      value.textContent = entry.count;

      const plus = document.createElement('button');
      plus.textContent = '+';
      plus.onclick = () => {
        
        entry.count++;
        saveToFirebase();
        render();
      };

      counter.append(minus, value, plus);
      right.appendChild(counter);
    }

    if (currentTab === 'Total' && entry) {
      const sum = document.createElement('div');
      sum.className = 'counter total';
      sum.textContent = totalCount;
      right.appendChild(sum);
    }

    if (entry && currentTab !== 'Total') {
      const glow = document.createElement('span');
      glow.textContent = '💎';
      glow.className = 'icon';
      glow.onclick = () => {
        
        entry.glow = !entry.glow;
        saveToFirebase();
        render();
      };

      const edit = document.createElement('span');
      edit.textContent = '✏';
      edit.className = 'icon';
      edit.onclick = () => {
        
        openEditModal(i, entry);
      }

      const del = document.createElement('span');
      del.textContent = '🗑';
      del.className = 'icon';
      del.onclick = () => {
        
        delete data[currentTab][i];
        saveToFirebase();
        render();
      };

      right.append(glow, edit, del);
    }

    li.append(left, right);
    listEl.appendChild(li);
  }
}
