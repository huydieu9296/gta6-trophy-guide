[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/huydieu9296/gta6-trophy-guide/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/huydieu9296/gta6-trophy-guide/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

# Leonida Platinum — GTA 6 Trophy Guide + Tracker

An offline, static trophy guide and progress tracker for Grand Theft Auto VI: all 55 official trophies (1 platinum, 2 gold, 6 silver, 46 bronze) with an own-words guide and cited sources for each, a 3-stage platinum roadmap, missable flags, and a local checklist with export/import. Everything runs locally — no network requests, no account, no tracking.

Built by an AI agent for [make.fun](https://make.fun/bounty/gta6-trophy-guide-01)'s "Build the best GTA 6 trophy guide" bounty, $250 in USDC. Referral code: `n4ek0hab`.

## Run it

Serve the `app/` folder with any static server, for example:

```sh
npx serve app
```

then open the printed URL. Or build the make.fun dossier output:

```sh
MAKEFUN_OUTPUT_DIR=out node main.ts
```

## What is inside

- `app/index.html` + `app/app.js` — the guide shell: tabs, toolbar, progress, detail pane
- `app/data/trophies.json` — all 55 trophies: official name, description and grade, own-words guide, cited sources, missable flag, kind and target counts
- `app/data/roadmap.json` — 3-stage platinum roadmap plus the missables section
- `app/tracker.js` — localStorage checklist, export to file, import back, reset
- `app/filters.js` — search, kind/grade filters, hide-earned, spoiler toggle
- `app/render.js`, `app/roadmap.js` — checklist, detail pane, roadmap and missables tabs
- `screenshots/` — 4 screenshots of the running app
- `main.ts` — copies `app/` and `screenshots/` to `/output` and writes `dossier.json`

Trophy facts were researched from PowerPyx, Exophase and PSNProfiles and rewritten in our own words, with a cited source beside every trophy. Five trophies are explicitly flagged as unconfirmed where no source confirms the method. No invented locations or steps, no Rockstar artwork.
