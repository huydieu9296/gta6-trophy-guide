// render.js — draws the checklist and the detail pane, and keeps the progress
// header in step. It reads the tracker and the filters, and nothing else.

import { isEarned, earnedCount, toggleEarned, setEarned } from './tracker.js';
import { applyFilters, isSpoilerHidden } from './filters.js';

const GRADE_LABEL = {
  platinum: 'Platinum',
  gold: 'Gold',
  silver: 'Silver',
  bronze: 'Bronze',
};

const KIND_LABEL = {
  story: 'Story',
  missable: 'Missable',
  collectibles: 'Collectibles',
  activities: 'Activities',
  online: 'Online',
};

let selectedId = null;

function gradeBadge(grade) {
  return `<span class="grade grade-${grade}">${GRADE_LABEL[grade] || grade}</span>`;
}

function countTag(trophy) {
  if (!trophy.count) return '';
  const label = trophy.countLabel || 'target';
  const shown = trophy.count >= 1000 ? `$${trophy.count.toLocaleString('en-US')}` : trophy.count;
  return `<span class="tag tag-count">${shown} ${label}</span>`;
}

function trophyRow(trophy, state) {
  const earned = isEarned(trophy.id);
  const hidden = isSpoilerHidden(trophy, state.spoilersOn, earned);
  const name = hidden ? 'Hidden story trophy — earn it to reveal' : escapeHtml(trophy.name);
  const desc = hidden
    ? 'Spoiler mode is on. Tick this trophy once you have earned it in the game to reveal its name and description.'
    : escapeHtml(trophy.description);
  const missableTag = trophy.missable ? '<span class="tag tag-missable">Missable</span>' : '';
  const kindTag = `<span class="tag">${KIND_LABEL[trophy.kind] || trophy.kind}</span>`;
  return `<li data-id="${trophy.id}" class="${earned ? 'earned' : ''} ${selectedId === trophy.id ? 'selected' : ''}">
    <input type="checkbox" ${earned ? 'checked' : ''} aria-label="Earned: ${escapeHtml(trophy.name)}">
    <div class="trophy-main">
      <div class="trophy-name">${name}</div>
      <div class="trophy-desc">${desc}</div>
      <div class="trophy-meta">${gradeBadge(trophy.grade)}${kindTag}${missableTag}${countTag(trophy)}</div>
    </div>
  </li>`;
}

export function renderChecklist(trophies, state) {
  const list = document.getElementById('trophyList');
  const visible = applyFilters(trophies, {
    kind: state.kind,
    query: state.query,
    isEarnedFn: (id) => isEarned(id),
  });
  if (visible.length === 0) {
    list.innerHTML = `<li class="empty-note">No trophies match that filter. The game lists no online trophies, so the Online filter is empty by design.</li>`;
  } else {
    list.innerHTML = visible.map((t) => trophyRow(t, state)).join('');
  }
  list.querySelectorAll('li[data-id]').forEach((li) => {
    const id = Number(li.dataset.id);
    li.addEventListener('click', (event) => {
      if (event.target.tagName === 'INPUT') return;
      selectTrophy(id, trophies, state);
    });
    li.querySelector('input').addEventListener('change', () => {
      toggleEarned(id);
      renderChecklist(trophies, state);
      renderProgress(trophies);
      renderDetail(trophies, state);
    });
  });
}

export function selectTrophy(id, trophies, state) {
  selectedId = id;
  renderChecklist(trophies, state);
  renderDetail(trophies, state);
}

export function renderDetail(trophies, state) {
  const pane = document.getElementById('detailPane');
  const trophy = trophies.find((t) => t.id === selectedId);
  if (!trophy) {
    pane.innerHTML = '<p class="detail-empty">Select a trophy to see its guide, steps and sources.</p>';
    return;
  }
  const earned = isEarned(trophy.id);
  const hidden = isSpoilerHidden(trophy, state.spoilersOn, earned);
  const steps = (trophy.steps || []).map((s) => `<li>${escapeHtml(s)}</li>`).join('');
  const sources = (trophy.sources || [])
    .map((s) => {
      const label = escapeHtml(s.label);
      return s.url
        ? `<li><a href="${escapeHtml(s.url)}" target="_blank" rel="noopener">${label}</a></li>`
        : `<li>${label}</li>`;
    })
    .join('');
  const countLine = trophy.count
    ? `<p class="count-line">PSN tracks this one: ${trophy.count.toLocaleString('en-US')} ${escapeHtml(trophy.countLabel || '')}.</p>`
    : '';
  const warn = trophy.missable
    ? '<p class="warn">Missable — do this before the final mission. The guide says why, above.</p>'
    : '';
  pane.innerHTML = `
    <h2>${hidden ? 'Hidden story trophy' : escapeHtml(trophy.name)}</h2>
    <p class="official">${hidden ? 'Name and description hidden by the spoiler setting until earned.' : `“${escapeHtml(trophy.description)}” — official description, ${GRADE_LABEL[trophy.grade]} trophy.`}</p>
    <div class="trophy-meta">${gradeBadge(trophy.grade)}<span class="tag">${KIND_LABEL[trophy.kind] || trophy.kind}</span>${trophy.missable ? '<span class="tag tag-missable">Missable</span>' : ''}${countTag(trophy)}</div>
    ${countLine}
    <h3>Guide</h3>
    <p>${escapeHtml(trophy.guide)}</p>
    ${steps ? `<h3>Steps</h3><ol>${steps}</ol>` : ''}
    ${warn}
    <h3>Sources</h3>
    <ul class="sources">${sources}</ul>
    <p><label><input type="checkbox" id="detailEarned" ${earned ? 'checked' : ''}> I have earned this trophy</label></p>`;
  pane.querySelector('#detailEarned').addEventListener('change', () => {
    setEarned(trophy.id, pane.querySelector('#detailEarned').checked);
    renderChecklist(trophies, state);
    renderProgress(trophies);
    renderDetail(trophies, state);
  });
}

export function renderProgress(trophies) {
  const total = trophies.length;
  const earned = earnedCount();
  document.getElementById('earnedCount').textContent = String(earned);
  const fill = document.getElementById('progressFill');
  fill.style.width = `${total ? Math.round((earned / total) * 100) : 0}%`;
  const bar = document.getElementById('progressBar');
  bar.setAttribute('aria-valuenow', String(earned));
  const byGrade = {};
  trophies.forEach((t) => {
    byGrade[t.grade] = byGrade[t.grade] || { total: 0, earned: 0 };
    byGrade[t.grade].total += 1;
    if (isEarned(t.id)) byGrade[t.grade].earned += 1;
  });
  const totals = { platinum: 1, gold: 2, silver: 6, bronze: 46 };
  document.getElementById('gradeCounts').textContent = ['platinum', 'gold', 'silver', 'bronze']
    .map((g) => `${GRADE_LABEL[g]} ${(byGrade[g]?.earned || 0)}/${totals[g]}`)
    .join(' · ');
}

export function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}
