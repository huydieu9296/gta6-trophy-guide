// filters.js — which trophies a view shows: kind filter, search text, and the
// spoiler rule. Pure functions over trophy objects; no DOM, no storage.

export const KINDS = ['all', 'story', 'missable', 'collectibles', 'activities', 'online', 'earned', 'todo'];

// A trophy matches the active kind filter. "missable" is a flag, not a kind;
// "online" matches nothing in this list (the game lists no online trophies),
// which the app says plainly instead of hiding the filter.
export function matchesKind(trophy, kind, isEarned) {
  switch (kind) {
    case 'all':
      return true;
    case 'story':
      return trophy.kind === 'story';
    case 'missable':
      return trophy.missable === true;
    case 'collectibles':
      return trophy.kind === 'collectibles';
    case 'activities':
      return trophy.kind === 'activities';
    case 'online':
      return trophy.kind === 'online';
    case 'earned':
      return isEarned;
    case 'todo':
      return !isEarned;
    default:
      return true;
  }
}

// A trophy matches the search box: name, official description, guide text,
// or the word "missable" for a trophy flagged missable.
export function matchesSearch(trophy, query) {
  const q = (query || '').trim().toLowerCase();
  if (!q) return true;
  if (q === 'missable') return trophy.missable === true;
  const haystack = [trophy.name, trophy.description, trophy.guide, trophy.kind]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return haystack.includes(q);
}

// The spoiler rule: with spoilers hidden, a story trophy the player has not
// earned yet shows a placeholder instead of its name and description.
export function isSpoilerHidden(trophy, spoilersOn, isEarned) {
  return spoilersOn && trophy.kind === 'story' && !isEarned;
}

export function applyFilters(trophies, { kind, query, isEarnedFn }) {
  return trophies.filter(
    (t) => matchesKind(t, kind, isEarnedFn(t.id)) && matchesSearch(t, query),
  );
}
