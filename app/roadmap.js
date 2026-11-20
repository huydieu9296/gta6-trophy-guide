// roadmap.js — draws the Roadmap to Platinum stages and the Missable list,
// both built from the official descriptions in app/data/roadmap.json.

import { isEarned } from './tracker.js';
import { escapeHtml } from './render.js';

export function renderRoadmap(roadmap, trophies) {
  const list = document.getElementById('roadmapList');
  const byId = new Map(trophies.map((t) => [t.id, t]));
  list.innerHTML = roadmap.stages
    .map((stage) => {
      const done = stage.trophies.filter((id) => isEarned(id)).length;
      const names = stage.trophies
        .map((id) => {
          const t = byId.get(id);
          if (!t) return '';
          const mark = isEarned(id) ? '✓ ' : '';
          return `<span>${mark}${escapeHtml(t.name)}</span>`;
        })
        .filter(Boolean)
        .join(' · ');
      const tips = (stage.tips || []).map((tip) => `<li>${escapeHtml(tip)}</li>`).join('');
      return `<li>
        <h2>${escapeHtml(stage.title)}</h2>
        <p class="stage-goal">${escapeHtml(stage.goal)}</p>
        <p class="stage-progress">${done} of ${stage.trophies.length} trophies earned in this stage</p>
        ${tips ? `<ul>${tips}</ul>` : ''}
        <p class="stage-trophies">${names}</p>
      </li>`;
    })
    .join('');
}

export function renderMissables(trophies, state) {
  const list = document.getElementById('missableList');
  const missable = trophies.filter((t) => t.missable);
  list.innerHTML = missable
    .map((t) => {
      const earned = isEarned(t.id);
      const countTag = t.count
        ? `<span class="tag tag-count">${t.count.toLocaleString('en-US')} ${escapeHtml(t.countLabel || '')}</span>`
        : '';
      return `<li data-id="${t.id}" class="${earned ? 'earned' : ''}">
        <input type="checkbox" ${earned ? 'checked' : ''} aria-label="Earned: ${escapeHtml(t.name)}">
        <div class="trophy-main">
          <div class="trophy-name">${escapeHtml(t.name)}</div>
          <div class="trophy-desc">${escapeHtml(t.description)}</div>
          <div class="trophy-meta"><span class="grade grade-${t.grade}">${t.grade}</span><span class="tag tag-missable">Missable — before the finale</span>${countTag}</div>
        </div>
      </li>`;
    })
    .join('');
  list.querySelectorAll('li[data-id]').forEach((li) => {
    const id = Number(li.dataset.id);
    li.addEventListener('click', (event) => {
      if (event.target.tagName === 'INPUT') return;
      // Jump to the checklist and open this trophy's guide there.
      document.querySelector('[data-view="checklist"]').click();
      state.selectTrophy(id);
    });
    li.querySelector('input').addEventListener('change', () => {
      import('./tracker.js').then((tracker) => {
        tracker.toggleEarned(id);
        renderMissables(trophies, state);
        import('./render.js').then((r) => r.renderProgress(trophies));
      });
    });
  });
}
