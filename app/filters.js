// Filters: search text, kind, grade, hide-earned and the spoiler setting.
// A trophy is "story" when its kind is story; "missable" comes from its missable flag;
// "online" matches nothing in this list (there are no online trophies) and says so.
export const KIND_LABELS = {
  all: 'All kinds',
  story: 'Story',
  missable: 'Missable',
  collectibles: 'Collectibles',
  activities: 'Activities',
  online: 'Online',
  platinum: 'Platinum',
};

export function kindOf(trophy) {
  return trophy.kind;
}

export function matchesKind(trophy, kind) {
  if (kind === 'all') return true;
  if (kind === 'missable') return trophy.missable === true;
  if (kind === 'online') return false;
  return trophy.kind === kind;
}

export function matchesGrade(trophy, grade) {
  return grade === 'all' || trophy.grade === grade;
}

export function matchesSearch(trophy, query) {
  if (!query) return true;
  const haystack = `${trophy.name} ${trophy.description} ${trophy.guide}`.toLowerCase();
  return query.toLowerCase().split(/\s+/).every((word) => word === '' || haystack.includes(word));
}

export function applyFilters(trophies, { kind, grade, query, hideEarned, earned }) {
  return trophies.filter((t) => {
    if (!matchesKind(t, kind)) return false;
    if (!matchesGrade(t, grade)) return false;
    if (!matchesSearch(t, query)) return false;
    if (hideEarned && earned.has(t.name)) return false;
    return true;
  });
}

// The spoiler setting hides a story trophy's name and description until it is earned.
// The platinum stays visible (it names no story beat), and earned story trophies reveal.
export function isSpoilerHidden(trophy, spoilersOn, earned) {
  return spoilersOn && trophy.kind === 'story' && !earned.has(trophy.name);
}

export function spoilerPlaceholder(trophy) {
  return `Hidden story trophy — earn it to reveal its name and description. (${trophy.grade})`;
}
