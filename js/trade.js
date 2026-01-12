import { getTradeCandidates } from './utils.js';

const overlay = document.getElementById('tradeOverlay');
const mariraList = document.getElementById('tradeMarira');
const soririsList = document.getElementById('tradeSoriris');

export function openTradeModal() {
  const { marira, soriris } = getTradeCandidates();

  mariraList.innerHTML = '';
  soririsList.innerHTML = '';

  marira.forEach(c => {
    const li = document.createElement('li');
    li.textContent = `#${c.number} – ${c.text} (x${c.count})`;
    mariraList.appendChild(li);
  });

  soriris.forEach(c => {
    const li = document.createElement('li');
    li.textContent = `#${c.number} – ${c.text} (x${c.count})`;
    soririsList.appendChild(li);
  });

  overlay.classList.remove('hidden');
}

document.getElementById('tradeClose').onclick = () => {
  overlay.classList.add('hidden');
};
