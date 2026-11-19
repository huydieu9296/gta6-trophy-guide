// Leonida Platinum — bootstrap: loads the trophy list and the roadmap, then wires
// the tabs, the toolbar, the checklist and the detail pane together.
// Everything runs offline: the only fetches are the app's own data files.
import { loadEarned, saveEarned, cleanEarned, earnedCounts, totalCounts, exportProgress, importProgress } from './tracker.js';
import { KIND_LABELS, applyFilters } from './filters.js';
import { renderTrophyList, renderDetail } from './render.js';
import { renderRoadmap, renderMissables } from './roadmap.js';

const listEl = document.getElementById('trophy-list');
const detailEl = document.getElementById('detail');
const emptyNote = document.getElementById('empty-note');
const filterLine = document.getElementById('filter-line');
const searchInput = document.getElementById('search');
const gradeSelect = document.getElementById('grade');
const hideEarnedBox = document.getElementById('hide-earned');
const spoilerBox = document.getElementById('spoiler');
const kindFiltersEl = document.getElementById('kind-filters');

const trophiesDoc = await (await fetch('data/trophies.json')).json();
const roadmapDoc = await (await fetch('data/roadmap.json')).json();
const trophies = trophiesDoc.trophies;
const totals = totalCounts(trophies);

let earned = cleanEarned(loadEarned(), trophies);
saveEarned(earned);

const state = {
  kind: 'all',
  grade: 'all',
  query: '',
  hideEarned: false,
  spoilersOn: spoilerBox.checked,
  selectedId: null,
};

function renderProgress() {
  const counts = earnedCounts(earned, trophies);
  const pct = Math.round((counts.total / totals.total) * 100);
  document.getElementById('progress-count').textContent = `${counts.total} of ${totals.total} earned`;
  document.getElementById('progress-pct').textContent = `${pct}%`;
  const fill = document.getElementById('progress-fill');
  fill.style.width = `${pct}%`;
  document.getElementById('progress-bar').setAttribute('aria-valuenow', String(counts.total));
  document.getElementById('progress-grades').textContent =
    `Platinum ${counts.platinum}/${totals.platinum} · Gold ${counts.gold}/${totals.gold} · ` +
    `Silver ${counts.silver}/${totals.silver} · Bronze ${counts.bronze}/${totals.bronze}`;
}

function renderAll() {
  renderProgress();
  const shown = applyFilters(trophies, {
    kind: state.kind,
    grade: state.grade,
    query: state.query,
    hideEarned: state.hideEarned,
    earned,
  });
  emptyNote.hidden = shown.length > 0;
  filterLine.textContent = shown.length === trophies.length
    ? `Showing all ${trophies.length} trophies.`
    : `Showing ${shown.length} of ${trophies.length} trophies.`;
  const selected = trophies.find((t) => t.id === state.selectedId) ?? null;
  renderTrophyList(listEl, shown, {
    earned,
    spoilersOn: state.spoilersOn,
    selectedId: state.selectedId,
    onToggle: (trophy, checked) => {
      if (checked) earned.add(trophy.name);
      else earned.delete(trophy.name);
      saveEarned(earned);
      renderAll();
      renderRoadmap(document.getElementById('roadmap-root'), roadmapDoc, trophies, earned);
    },
    onSelect: (trophy) => {
      state.selectedId = trophy.id;
      renderDetail(detailEl, trophy, { earned, spoilersOn: state.spoilersOn });
      renderAll();
    },
  });
  renderDetail(detailEl, selected, { earned, spoilersOn: state.spoilersOn });
}

function buildKindFilters() {
  kindFiltersEl.replaceChildren();
  for (const kind of ['all', 'story', 'missable', 'collectibles', 'activities', 'online', 'platinum']) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'chip';
    button.dataset.kind = kind;
    button.textContent = KIND_LABELS[kind];
    if (kind === state.kind) button.classList.add('is-active');
    button.addEventListener('click', () => {
      state.kind = kind;
      kindFiltersEl.querySelectorAll('.chip').forEach((c) => c.classList.toggle('is-active', c.dataset.kind === kind));
      renderAll();
    });
    kindFiltersEl.append(button);
  }
}

function buildTabs() {
  document.querySelectorAll('.tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach((t) => t.classList.toggle('is-active', t === tab));
      document.querySelectorAll('.panel').forEach((p) => p.classList.toggle('is-active', p.id === `panel-${tab.dataset.tab}`));
    });
  });
}

searchInput.addEventListener('input', () => {
  state.query = searchInput.value.trim();
  renderAll();
});
gradeSelect.addEventListener('change', () => {
  state.grade = gradeSelect.value;
  renderAll();
});
hideEarnedBox.addEventListener('change', () => {
  state.hideEarned = hideEarnedBox.checked;
  renderAll();
});
spoilerBox.addEventListener('change', () => {
  state.spoilersOn = spoilerBox.checked;
  renderAll();
});
document.getElementById('export').addEventListener('click', () => {
  const count = exportProgress(earned);
  filterLine.textContent = `Exported ${count} earned trophies to leonida-platinum-progress.json.`;
});
document.getElementById('import').addEventListener('change', async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  try {
    earned = await importProgress(file, trophies);
    saveEarned(earned);
    renderAll();
    renderRoadmap(document.getElementById('roadmap-root'), roadmapDoc, trophies, earned);
    filterLine.textContent = `Imported progress from ${file.name}: ${earned.size} trophies earned.`;
  } catch (error) {
    filterLine.textContent = `Could not import ${file.name}: ${error.message}`;
  }
  event.target.value = '';
});
document.getElementById('reset').addEventListener('click', () => {
  if (!window.confirm('Clear all earned trophies in this browser?')) return;
  earned = new Set();
  saveEarned(earned);
  renderAll();
  renderRoadmap(document.getElementById('roadmap-root'), roadmapDoc, trophies, earned);
});

// About tab: the entry's own sources, from the trophy file's source list.
const aboutSources = document.getElementById('about-sources');
for (const source of trophiesDoc.sources ?? []) {
  const item = document.createElement('li');
  const link = document.createElement('a');
  link.href = source.url;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.textContent = source.name;
  item.append(link);
  aboutSources.append(item);
}

buildKindFilters();
buildTabs();
renderRoadmap(document.getElementById('roadmap-root'), roadmapDoc, trophies, earned);
renderMissables(document.getElementById('missables-root'), roadmapDoc, trophies);
renderAll();
