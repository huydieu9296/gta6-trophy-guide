[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/huydieu9296/gta6-trophy-guide/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/huydieu9296/gta6-trophy-guide/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

# Leonida Platinum — GTA 6 Trophy Guide & Tracker

An offline, open-source guide and tracker for all **55 PlayStation 5 trophies** of Grand Theft Auto VI: 1 platinum, 2 gold, 6 silver and 46 bronze. Every trophy is shown with its official name, description and grade as PlayStation publishes them, plus a guide in our own words that cites its sources, a roadmap to the platinum, and the missable trophies flagged.

## What it does

- **Checklist tracker** — tick trophies off as you earn them; progress saves in the browser (localStorage) and can be exported to a file and imported back.
- **Filters** — by kind (story, missable, collectibles, activities, online) and by earned / not earned, plus search across names, descriptions and guides.
- **Spoiler setting** — hides story trophy names and descriptions until you earn them.
- **Roadmap to the platinum** — six stages built from the official descriptions: story, side strands, collectibles, activities, money & mayhem, then cleanup.
- **Missable flags** — 7 trophies tied to a partner outing, a one-time story moment or a single-chance event, with a warning to do them before the final mission.
- **Cited guides** — each trophy's guide names its sources beside it (the official list on Exophase and PSNProfiles for names, descriptions, grades and PSN counts; our own reading of the official description for the advice, labelled as not yet verified in-game where a place or step is not pinned down by the description).

## Run it

Serve `app/` with any static server — no build step, no network:

```sh
node serve.ts
# then open http://localhost:8080
```

Or serve the folder directly, e.g. `npx serve app` or `python3 -m http.server --directory app`.

Deep links open a view directly: `index.html#roadmap` for the roadmap, `index.html#missables` for the missable trophies.

Build the submission dossier (what `main.ts` hands in):

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## Files

- `app/index.html` — the page; `app/style.css` — the sunset-paper look
- `app/app.js` — boot and wiring; `app/render.js` — checklist and detail pane
- `app/tracker.js` — localStorage progress, export and import
- `app/filters.js` — kind filters, search and the spoiler rule
- `app/roadmap.js` — roadmap stages and the missable list
- `app/data/trophies.json` — the 55 official trophies with our guides and sources
- `app/data/roadmap.json` — the six roadmap stages
- `main.ts` — the entry program (copies `app/` + `screenshots/` to `/output`, writes `dossier.json`)
- `screenshots/` — four real renders of the app in a headless browser

## Notes

- Works with the network off: every file the app loads is under `app/`, and it makes no network request at runtime. Source links in the guides open only when the reader follows them.
- No Rockstar Games logo, official artwork or game screenshots are used. A fan guide, not affiliated with Rockstar Games or PlayStation.
- License: MIT (see `LICENSE`).

Referral code: `n4ek0hab`
