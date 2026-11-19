// Renders the checklist rows and the guide detail pane.
// The detail pane is where each trophy's guide and its sources are read.
import { isSpoilerHidden, spoilerPlaceholder } from './filters.js';

export function gradeLabel(grade) {
  return grade.charAt(0).toUpperCase() + grade.slice(1);
}

export function kindLabel(kind) {
  return kind.charAt(0).toUpperCase() + kind.slice(1);
}

function tagElement(text, className) {
  const span = document.createElement('span');
  span.className = `tag ${className}`;
  span.textContent = text;
  return span;
}

export function renderTrophyList(listEl, trophies, { earned, spoilersOn, selectedId, onToggle, onSelect }) {
  listEl.replaceChildren();
  for (const trophy of trophies) {
    const hidden = isSpoilerHidden(trophy, spoilersOn, earned);
    const li = document.createElement('li');
    li.className = 'trophy-row';
    if (earned.has(trophy.name)) li.classList.add('is-earned');
    if (trophy.id === selectedId) li.classList.add('is-selected');
    li.dataset.id = String(trophy.id);

    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = earned.has(trophy.name);
    box.setAttribute('aria-label', `Mark ${hidden ? 'this trophy' : trophy.name} as earned`);
    box.addEventListener('change', (event) => {
      event.stopPropagation();
      onToggle(trophy, box.checked);
    });
    li.append(box);

    const badge = document.createElement('span');
    badge.className = `grade-badge grade-${trophy.grade}`;
    badge.textContent = trophy.grade;
    li.append(badge);

    const main = document.createElement('div');
    const name = document.createElement('div');
    name.className = hidden ? 'trophy-name spoiler-name' : 'trophy-name';
    name.textContent = hidden ? 'Hidden story trophy' : trophy.name;
    main.append(name);
    const desc = document.createElement('div');
    desc.className = 'trophy-desc';
    desc.textContent = hidden ? spoilerPlaceholder(trophy) : trophy.description;
    main.append(desc);
    const meta = document.createElement('div');
    meta.className = 'trophy-meta';
    meta.append(tagElement(kindLabel(trophy.kind), `tag-kind-${trophy.kind}`));
    if (trophy.missable) meta.append(tagElement('Missable', 'tag-missable'));
    if (trophy.count != null) {
      const count = document.createElement('span');
      count.className = 'trophy-count';
      count.textContent = `Target: ${trophy.count.toLocaleString('en-US')}`;
      meta.append(count);
    }
    main.append(meta);
    li.append(main);

    const countCell = document.createElement('div');
    countCell.className = 'trophy-count';
    countCell.textContent = trophy.count != null ? `× ${trophy.count.toLocaleString('en-US')}` : '';
    li.append(countCell);

    li.addEventListener('click', (event) => {
      if (event.target === box) return;
      onSelect(trophy);
    });
    listEl.append(li);
  }
}

export function renderDetail(detailEl, trophy, { earned, spoilersOn }) {
  detailEl.replaceChildren();
  if (!trophy) {
    const empty = document.createElement('p');
    empty.className = 'detail-empty';
    empty.textContent = 'Select a trophy to read its guide, what it asks for, and where each fact comes from.';
    detailEl.append(empty);
    return;
  }
  const hidden = isSpoilerHidden(trophy, spoilersOn, earned);
  const heading = document.createElement('h2');
  heading.textContent = hidden ? 'Hidden story trophy' : trophy.name;
  detailEl.append(heading);

  const official = document.createElement('p');
  official.className = 'official';
  if (hidden) {
    official.textContent = 'This is a story trophy. Its name and official description stay hidden until you earn it — turn off “Hide story spoilers” above to reveal them now.';
  } else {
    official.textContent = `Official: “${trophy.description}” — ${gradeLabel(trophy.grade)}`;
  }
  detailEl.append(official);

  if (!hidden) {
    const guideHeading = document.createElement('h3');
    guideHeading.textContent = 'Guide';
    detailEl.append(guideHeading);
    const guide = document.createElement('p');
    guide.className = 'guide-text';
    guide.textContent = trophy.guide;
    detailEl.append(guide);

    if (/NOT YET CONFIRMED/i.test(trophy.guide)) {
      const note = document.createElement('p');
      note.className = 'unconfirmed';
      note.textContent = 'Not yet confirmed: no source has pinned down this trophy’s method since the game’s launch. This guide says so instead of guessing.';
      detailEl.append(note);
    }

    const sourcesHeading = document.createElement('h3');
    sourcesHeading.textContent = 'Sources';
    detailEl.append(sourcesHeading);
    const list = document.createElement('ul');
    list.className = 'source-list';
    for (const source of trophy.sources ?? []) {
      const item = document.createElement('li');
      const link = document.createElement('a');
      link.href = source.url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.textContent = source.name;
      item.append(link);
      list.append(item);
    }
    detailEl.append(list);

    const status = document.createElement('p');
    status.className = 'official';
    status.textContent = trophy.missable
      ? 'Missable: yes — see the Missables tab before you leave Chapter 1.'
      : 'Missable: no — this stays available after the story.';
    detailEl.append(status);
  }
}
