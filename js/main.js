import { load, setCurrentTab, setTotalPreference } from './state.js';
import { render } from './render.js';
import { openAddModal } from './modal.js';

load();
render();

document.querySelectorAll('.tab').forEach(tab => {
  tab.onclick = () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    setCurrentTab(tab.dataset.tab);
    render();
  };
});

document.getElementById('addBtn').onclick = () => openAddModal();
document.getElementById('searchInput').oninput = render;
document.getElementById('filterSelect').onchange = render;

document.getElementById('totalSourceSelect').onchange = e => {
  setTotalPreference(e.target.value);
  render();
};
