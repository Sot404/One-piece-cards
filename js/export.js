import { data } from './state.js';

export function exportToJSON() {
  const blob = new Blob(
    [JSON.stringify(data, null, 2)],
    { type: 'application/json' }
  );

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'interactive-list-backup.json';
  a.click();
  URL.revokeObjectURL(url);
}
