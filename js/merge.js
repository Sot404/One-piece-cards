import { data } from './state.js';
import { saveToFirebase } from './firebase.js';
import { render } from './render.js';

export function mergeFromJSON() {
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
            if (!data[tab][key]) {
              data[tab][key] = incoming[tab][key];
            }
          }
        });

        saveToFirebase();
        render();
      } catch {
        alert('Invalid JSON file');
      }
    };

    reader.readAsText(file);
  };

  input.click();
}
