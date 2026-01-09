import { data, currentTab } from './state.js';
import { saveToFirebase } from './firebase.js';
import { render } from './render.js';

const modalOverlay = document.getElementById('modalOverlay');
const modalTitle = document.getElementById('modalTitle');
const modalNumber = document.getElementById('modalNumber');
const modalText = document.getElementById('modalText');
const modalGlow = document.getElementById('modalGlow');

export function openAddModal() {
  modalTitle.textContent = 'Add Card';
  modalNumber.disabled = false;
  modalNumber.value = '';
  modalText.value = '';
  modalGlow.checked = false;
  modalOverlay.classList.remove('hidden');
}

export function openEditModal(num, entry) {
  modalTitle.textContent = 'Edit Card';
  modalNumber.value = num;
  modalNumber.disabled = true;
  modalText.value = entry.text;
  modalGlow.checked = entry.glow;
  modalOverlay.classList.remove('hidden');
}

export function closeModal() {
  modalOverlay.classList.add('hidden');
}

document.getElementById('modalCancel').onclick = closeModal;

document.getElementById('modalSave').onclick = () => {
  const num = Number(modalNumber.value);
  const text = modalText.value.trim();

  if (!num || !text) return;

  data[currentTab][num] = {
    text,
    glow: modalGlow.checked,
    count: data[currentTab][num]?.count || 1
  };

  saveToFirebase();
  closeModal();
  render();
};
