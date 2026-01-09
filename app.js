/* =========================
   STATE & CONSTANTS
   ========================= */

const STORAGE_KEY = 'interactive-list-save';

let data = {
  Marira: {},
  Soriris: {}
};

let currentTab = 'Marira';

// Ποιο tab προτιμά το Total όταν υπάρχουν και τα δύο
let totalPreference = 'Marira';

/* =========================
   DOM REFERENCES
   ========================= */

const listEl = document.getElementById('list');
const searchInput = document.getElementById('searchInput');
const filterSelect = document.getElementById('filterSelect');
const totalSourceSelect = document.getElementById('totalSourceSelect');

const modalOverlay = document.getElementById('modalOverlay');
const modalTitle = document.getElementById('modalTitle');
const modalNumber = document.getElementById('modalNumber');
const modalText = document.getElementById('modalText');
const modalGlow = document.getElementById('modalGlow');

/* =========================
   LOCAL STORAGE
   ========================= */

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function load() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) data = JSON.parse(saved);
}

/* =========================
   RENDER
   ========================= */

function render() {
  listEl.innerHTML = '';

  const search = searchInput.value.toLowerCase();
  const filter = filterSelect.value;

  for (let i = 1; i <= 200; i++) {
    const m = data.Marira[i];
    const s = data.Soriris[i];

    let entry = null;
    let origin = null;

    if (currentTab === 'Total') {
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
    if (entry?.glow) li.classList.add('glow');

    const left = document.createElement('div');
    left.className = 'card-left';

    left.innerHTML = `<div class="card-number">#${i}</div>`;
    if (entry) {
      left.innerHTML += `<div class="card-text">${entry.text}</div>`;
    }

    const right = document.createElement('div');
    right.className = 'card-right';

    /* TOTAL ORIGIN */
    if (currentTab === 'Total' && entry) {
      const badge = document.createElement('span');
      badge.className = 'origin';
      badge.textContent = origin === 'Marira' ? 'M' : 'S';
      right.appendChild(badge);

      if (m && s) {
        const toggle = document.createElement('span');
        toggle.className = 'origin-toggle';
        toggle.textContent = '>';
        toggle.onclick = () => {
          totalPreference = origin === 'Marira' ? 'Soriris' : 'Marira';
          totalSourceSelect.value = totalPreference;
          render();
        };
        right.appendChild(toggle);
      }
    }

    /* ACTIONS */
    if (entry && currentTab !== 'Total') {
      const glow = document.createElement('span');
      glow.className = 'icon glow' + (entry.glow ? ' active' : '');
      glow.textContent = '💎';
      glow.onclick = () => {
        entry.glow = !entry.glow;
        save();
        render();
      };

      const edit = document.createElement('span');
      edit.className = 'icon edit';
      edit.textContent = '✏';
      edit.onclick = () => openEditModal(i, entry);

      const del = document.createElement('span');
      del.className = 'icon delete';
      del.textContent = '🗑';
      del.onclick = () => {
        delete data[currentTab][i];
        save();
        render();
      };

      right.append(glow, edit, del);
    }

    li.append(left, right);
    listEl.appendChild(li);
  }
}

/* =========================
   MODAL
   ========================= */

function openAddModal() {
  modalTitle.textContent = 'Add Card';
  modalNumber.disabled = false;
  modalNumber.value = '';
  modalText.value = '';
  modalGlow.checked = false;
  modalOverlay.classList.remove('hidden');
}

function openEditModal(num, entry) {
  modalTitle.textContent = 'Edit Card';
  modalNumber.value = num;
  modalNumber.disabled = true;
  modalText.value = entry.text;
  modalGlow.checked = entry.glow;
  modalOverlay.classList.remove('hidden');
}

function closeModal() {
  modalOverlay.classList.add('hidden');
}

/* =========================
   EVENTS
   ========================= */

document.querySelectorAll('.tab').forEach(tab => {
  tab.onclick = () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    currentTab = tab.dataset.tab;

    totalSourceSelect.classList.toggle('hidden', currentTab !== 'Total');
    render();
  };
});

document.getElementById('addBtn').onclick = () => {
  if (currentTab !== 'Total') openAddModal();
};

document.getElementById('modalCancel').onclick = closeModal;

document.getElementById('modalSave').onclick = () => {
  const num = Number(modalNumber.value);
  const text = modalText.value.trim();
  if (!num || !text) return;

  data[currentTab][num] = { text, glow: modalGlow.checked };
  save();
  closeModal();
  render();
};

searchInput.oninput = render;
filterSelect.onchange = render;

totalSourceSelect.onchange = () => {
  totalPreference = totalSourceSelect.value;
  render();
};

document.getElementById('exportBtn').onclick = () => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'save.json';
  a.click();
};

document.getElementById('mergeBtn').onclick = () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'application/json';
  input.onchange = e => {
    const reader = new FileReader();
    reader.onload = () => {
      const incoming = JSON.parse(reader.result);
      ['Marira', 'Soriris'].forEach(tab => {
        for (const k in incoming[tab]) {
          if (!data[tab][k]) data[tab][k] = incoming[tab][k];
        }
      });
      save();
      render();
    };
    reader.readAsText(e.target.files[0]);
  };
  input.click();
};

/* =========================
   INIT
   ========================= */

load();
render();
