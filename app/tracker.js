// Tracker state: which trophies are earned, saved in localStorage, with export/import.
// The storage key is versioned so a future format change never corrupts an old save.
export const STORAGE_KEY = 'leonida-platinum-v1';

export function loadEarned() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((name) => typeof name === 'string'));
  } catch {
    return new Set();
  }
}

export function saveEarned(earned) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...earned].sort()));
  } catch {
    // Storage may be full or unavailable (private mode): progress still works in memory.
  }
}

// Keep only names that exist in the trophy list; drop anything else (e.g. a typo'd file).
export function cleanEarned(earned, trophies) {
  const known = new Set(trophies.map((t) => t.name));
  return new Set([...earned].filter((name) => known.has(name)));
}

export function earnedCounts(earned, trophies) {
  const counts = { platinum: 0, gold: 0, silver: 0, bronze: 0, total: 0 };
  for (const t of trophies) {
    if (earned.has(t.name)) {
      counts[t.grade] += 1;
      counts.total += 1;
    }
  }
  return counts;
}

export function totalCounts(trophies) {
  const counts = { platinum: 0, gold: 0, silver: 0, bronze: 0, total: trophies.length };
  for (const t of trophies) counts[t.grade] += 1;
  return counts;
}

export function exportProgress(earned) {
  const payload = {
    app: 'Leonida Platinum — GTA VI trophy tracker',
    exportedAt: new Date().toISOString(),
    earned: [...earned].sort(),
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'leonida-platinum-progress.json';
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return payload.earned.length;
}

export async function importProgress(file, trophies) {
  const text = await file.text();
  const parsed = JSON.parse(text);
  const names = Array.isArray(parsed) ? parsed : parsed.earned;
  if (!Array.isArray(names)) throw new Error('That file has no earned list in it.');
  return cleanEarned(new Set(names), trophies);
}
