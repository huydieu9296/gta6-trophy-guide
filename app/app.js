// app.js — boot and wiring for Leonida Platinum. Loads the trophy data and the
// roadmap, draws every view, and wires the toolbar (search, kind filters,
// spoiler toggle, export and import) and the tabs. No network request is made
// except fetching this app's own data files.

import { renderChecklist, renderDetail, renderProgress, selectTrophy } from './render.js';
import { renderRoadmap, renderMissables } from './roadmap.js';
import { exportProgress, importProgress } from './tracker.js';

const state = {
  kind: 'all',
  query: '',
  spoilersOn: false,
  selectTrophy(id) {
    selectTrophy(id, trophies, state);
  },
};

let trophies = [];
let roadmap = null;

async function loadData() {
  const [trophyRes, roadmapRes] = await Promise.all([
    fetch('./data/trophies.json'),
    fetch('./data/roadmap.json'),
  ]);
  if (!trophyRes.ok) throw new Error('Could not load app/data/trophies.json');
  if (!roadmapRes.ok) throw new Error('Could not load app/data/roadmap.json');
  const trophyData = await trophyRes.json();
  trophies = trophyData.trophies || trophyData;
  roadmap = await roadmapRes.json();
}

function drawAll() {
  renderChecklist(trophies, state);
  renderDetail(trophies, state);
  renderProgress(trophies);
  renderRoadmap(roadmap, trophies);
  renderMissables(trophies, state);
}

function wireTabs() {
  document.querySelectorAll('.tab').forEach((tab) => {
    tab.addEventListener('click', () => openView(tab.dataset.view));
  });
  // Deep links: index.html#roadmap and index.html#missables open that view.
  const hash = (location.hash || '').replace('#', '');
  if (hash === 'roadmap' || hash === 'missables') openView(hash);
}

function openView(view) {
  document.querySelectorAll('.tab').forEach((t) => t.classList.toggle('active', t.dataset.view === view));
  document.querySelectorAll('.view').forEach((v) => v.classList.remove('active'));
  document.getElementById(`view${capitalize(view)}`).classList.add('active');
  if (view === 'roadmap') renderRoadmap(roadmap, trophies);
  if (view === 'missables') renderMissables(trophies, state);
}

function capitalize(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

function wireToolbar() {
  document.getElementById('searchBox').addEventListener('input', (event) => {
    state.query = event.target.value;
    renderChecklist(trophies, state);
  });

  document.querySelectorAll('#kindFilters .filter').forEach((button) => {
    button.addEventListener('click', () => {
      document.querySelectorAll('#kindFilters .filter').forEach((b) => b.classList.remove('active'));
      button.classList.add('active');
      state.kind = button.dataset.kind;
      renderChecklist(trophies, state);
    });
  });

  document.getElementById('spoilerToggle').addEventListener('change', (event) => {
    state.spoilersOn = event.target.checked;
    document.getElementById('spoilerNote').hidden = !state.spoilersOn;
    renderChecklist(trophies, state);
    renderDetail(trophies, state);
  });

  document.getElementById('exportBtn').addEventListener('click', () => {
    const count = exportProgress();
    document.getElementById('exportBtn').textContent = `Exported ${count} earned`;
    setTimeout(() => {
      document.getElementById('exportBtn').textContent = 'Export progress';
    }, 2500);
  });

  const importFile = document.getElementById('importFile');
  document.getElementById('importBtn').addEventListener('click', () => importFile.click());
  importFile.addEventListener('change', async () => {
    const file = importFile.files[0];
    if (!file) return;
    try {
      const count = await importProgress(file);
      document.getElementById('importBtn').textContent = `Imported ${count} earned`;
      drawAll();
    } catch (err) {
      document.getElementById('importBtn').textContent = 'Import failed — bad file';
    }
    setTimeout(() => {
      document.getElementById('importBtn').textContent = 'Import progress';
    }, 3000);
    importFile.value = '';
  });
}

try {
  await loadData();
  wireTabs();
  wireToolbar();
  drawAll();
} catch (err) {
  document.getElementById('trophyList').innerHTML =
    `<li class="empty-note">The guide could not load its data files: ${err.message}</li>`;
}
