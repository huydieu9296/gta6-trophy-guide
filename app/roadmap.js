// Renders the Roadmap to the Platinum and the Missables tab from data/roadmap.json.
// Both are built from the official trophy descriptions and PowerPyx's roadmap:
// the stages name the chapters, missions, collectibles and counts in order.
import { gradeLabel } from './render.js';

function byId(trophies) {
  const map = new Map();
  for (const t of trophies) map.set(t.id, t);
  return map;
}

function stageTrophyChips(container, stage, trophiesById, earned) {
  const chips = document.createElement('div');
  chips.className = 'stage-trophies';
  for (const id of stage.trophy_ids) {
    const trophy = trophiesById.get(id);
    if (!trophy) continue;
    const chip = document.createElement('span');
    chip.className = 'stage-trophy';
    if (earned.has(trophy.name)) chip.classList.add('is-earned');
    if (trophy.missable) chip.classList.add('is-missable');
    chip.textContent = `${trophy.name} · ${gradeLabel(trophy.grade)}`;
    chips.append(chip);
  }
  container.append(chips);
}

export function renderRoadmap(root, roadmap, trophies, earned) {
  root.replaceChildren();
  const intro = document.createElement('p');
  intro.className = 'roadmap-intro';
  intro.textContent = roadmap.subtitle;
  root.append(intro);

  const trophiesById = byId(trophies);
  for (const stage of roadmap.stages) {
    const section = document.createElement('section');
    section.className = 'stage';
    const heading = document.createElement('h3');
    heading.textContent = `Stage ${stage.stage}: ${stage.name} `;
    const hours = document.createElement('span');
    hours.className = 'stage-hours';
    hours.textContent = `(${stage.hours})`;
    heading.append(hours);
    section.append(heading);

    const summary = document.createElement('p');
    summary.textContent = stage.summary;
    section.append(summary);

    if (stage.checklist) {
      const box = document.createElement('ul');
      box.className = 'checklist-box';
      for (const item of stage.checklist) {
        const li = document.createElement('li');
        li.textContent = item;
        box.append(li);
      }
      section.append(box);
    }

    if (stage.tips) {
      const tips = document.createElement('ul');
      for (const tip of stage.tips) {
        const li = document.createElement('li');
        li.textContent = tip;
        tips.append(li);
      }
      section.append(tips);
    }

    stageTrophyChips(section, stage, trophiesById, earned);
    root.append(section);
  }
}

export function renderMissables(root, roadmap, trophies) {
  root.replaceChildren();
  const miss = roadmap.missables;
  const intro = document.createElement('p');
  intro.textContent = miss.body;
  root.append(intro);

  const hero = document.createElement('div');
  hero.className = 'missable-hero';
  const heading = document.createElement('h3');
  heading.textContent = `⚠ ${miss.headline}: ${trophies.find((t) => t.id === miss.the_one.trophy_id)?.name ?? ''}`;
  hero.append(heading);
  const what = document.createElement('p');
  what.textContent = miss.the_one.what;
  hero.append(what);
  const why = document.createElement('p');
  why.textContent = miss.the_one.why_it_matters;
  hero.append(why);
  const save = document.createElement('p');
  const saveStrong = document.createElement('strong');
  saveStrong.textContent = 'Save advice: ';
  save.append(saveStrong, document.createTextNode(miss.the_one.save_advice));
  hero.append(save);
  root.append(hero);

  const safeHeading = document.createElement('h3');
  safeHeading.textContent = 'What is NOT missable';
  root.append(safeHeading);
  const safe = document.createElement('ul');
  safe.className = 'safe-list';
  for (const item of miss.not_missable) {
    const li = document.createElement('li');
    li.textContent = item;
    safe.append(li);
  }
  root.append(safe);
}
