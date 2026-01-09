/* =========================
   STATE & CONSTANTS
   ========================= */

const STORAGE_KEY = 'interactive-list-save';

// Main application state
let data = {
  Marira: {},
  Soriris: {}
};

let currentTab = 'Marira';
let editMode = null; // null | number being edited

/* =========================
   DOM REFERENCES
   ========================= */

const listEl = document.getElementById('list');
const modalOverlay = document.getElementById('modalOverlay');
const modalTitle = document.getElementById('modalTitle');
const modalNumber = document.getElementById('modalNumber');
const modalText = document.getElementById('modalText');
const modalGlow = document.getElementById('modalGlow');

const searchInput = document.getElementById('searchInput');
const filterSelect = document.getElementById('filterSelect');

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
   RENDERING
   ========================= */

function render() {
  listEl.innerHTML = '';

  const search = searchInput.value.toLowerCase();
  const filter = filterSelect.value;

  // Merge data for Total tab
  const source = currentTab === 'Total'
    ? { ...data.Marira, ...data.Soriris }
    : data[currentTab];

  for (let i = 1; i <= 200; i++) {
    const entry = source[i];

    // Filter logic
    if (filter === 'found' && !entry) continue;
    if (filter === 'missing' && entry) continue;

    if (search) {
      const s = String(i) + (entry?.text || '');
      if (!s.toLowerCase().includes(search)) continue;
    }

    const li = document.createElement('li');
    li.className = 'card';
    if (entry?.glow) li.classList.add('glow');

    /* Left side (number + text) */
    const left = document.createElement('div');
    left.className = 'card-left';

    const num = document.createElement('div');
    num.className = 'card-number';
    num.textContent = `#${i}`;
    left.appendChild(num);

    if (entry) {
      const txt = document.createElement('div');
      txt.className = 'card-text';
      txt.textContent = entry.text;
      left.appendChild(txt);
    }

    /* Right side (icons) */
    const right = document.createElement('div');
    right.className = 'card-right';

    if (entry && currentTab !== 'Total') {
      // Glow toggle
      const glow = document.createElement('span');
      glow.className = 'icon glow' + (entry.glow ? ' active' : '');
      glow.textContent = '💎';
      glow.onclick = () => {
        entry.glow = !entry.glow;
        save();
        render();
      };

      // Edit
      const edit = document.createElement('span');
      edit.className = 'icon edit';
      edit.textContent = '✏';
      edit.onclick = () => openEditModal(i, entry);

      // Delete
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
   MODAL HANDLING
   ========================= */

function openAddModal() {
  editMode = null;
  modalTitle.textContent = 'Add Card';
  modalNumber.disabled = false;
  modalNumber.value = '';
  modalText.value = '';
  modalGlow.checked = false;
  modalOverlay.classList.remove('hidden');
}

function openEditModal(number, entry) {
  editMode = number;
  modalTitle.textContent = 'Edit Card';
  modalNumber.value = number;
  modalNumber.disabled = true;
  modalText.value = entry.text;
  modalGlow.checked = entry.glow;
  modalOverlay.classList.remove('hidden');
}

function closeModal() {
  modalOverlay.classList.add('hidden');
}

/* =========================
   EVENT LISTENERS
   ========================= */

// Tabs
document.querySelectorAll('.tab').forEach(tab => {
  tab.onclick = () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    currentTab = tab.dataset.tab;
    render();
  };
});

// Add card
document.getElementById('addBtn').onclick = () => {
  if (currentTab !== 'Total') openAddModal();
};

// Modal buttons
document.getElementById('modalCancel').onclick = closeModal;

document.getElementById('modalSave').onclick = () => {
  const number = Number(modalNumber.value);
  const text = modalText.value.trim();

  if (!number || number < 1 || number > 200 || !text) return;

  data[currentTab][number] = {
    text,
    glow: modalGlow.checked
  };

  save();
  closeModal();
  render();
};

// Search & filter
searchInput.oninput = render;
filterSelect.onchange = render;

// Export
document.getElementById('exportBtn').onclick = () => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'save.json';
  a.click();
  URL.revokeObjectURL(url);
};

// Merge import
document.getElementById('mergeBtn').onclick = () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'application/json';
  input.onchange = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const incoming = JSON.parse(reader.result);
        ['Marira', 'Soriris'].forEach(tab => {
          for (const key in incoming[tab]) {
            if (!data[tab][key]) data[tab][key] = incoming[tab][key];
          }
        });
        save();
        render();
      } catch {
        alert('Invalid file');
      }
    };
    reader.readAsText(file);
  };
  input.click();
};

/* =========================
   INIT
   ========================= */

load();
render();
