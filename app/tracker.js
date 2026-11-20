// tracker.js — saved progress: localStorage, export to a file, import back.
// One job only: own the earned set and persist it. Nothing here touches the DOM
// except the file download it creates for an export.

const STORAGE_KEY = 'leonida-platinum-progress-v1';

// The earned set: trophy ids (numbers) the player has ticked.
let earned = new Set(loadFromStorage());

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((id) => Number.isInteger(id));
  } catch (_err) {
    return [];
  }
}

function saveToStorage() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...earned].sort((a, b) => a - b)));
  } catch (_err) {
    // Storage full or unavailable (private mode): progress still lives in memory.
  }
}

export function isEarned(id) {
  return earned.has(id);
}

export function earnedCount() {
  return earned.size;
}

export function earnedIds() {
  return [...earned].sort((a, b) => a - b);
}

export function setEarned(id, value) {
  if (value) earned.add(id);
  else earned.delete(id);
  saveToStorage();
}

export function toggleEarned(id) {
  setEarned(id, !earned.has(id));
  return earned.has(id);
}

// Export: download a JSON file the player can keep or move to another browser.
export function exportProgress() {
  const payload = {
    app: 'Leonida Platinum',
    version: 1,
    exportedAt: new Date().toISOString(),
    earned: earnedIds(),
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'leonida-platinum-progress.json';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return payload.earned.length;
}

// Import: read a file exported by exportProgress (or written by hand in the
// same shape) and replace the earned set with it. Returns how many ids it took.
export async function importProgress(file) {
  const text = await file.text();
  const parsed = JSON.parse(text);
  const ids = Array.isArray(parsed) ? parsed : parsed.earned;
  if (!Array.isArray(ids)) throw new Error('That file does not hold a progress list.');
  const clean = ids.filter((id) => Number.isInteger(id) && id >= 1 && id <= 55);
  earned = new Set(clean);
  saveToStorage();
  return clean.length;
}
