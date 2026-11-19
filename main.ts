// Leonida Platinum — the hand-in program (Node 22, standard library only).
// The guide is plain static files in app/ (index.html, its modules and styles, and
// data/trophies.json with the 55 official trophies and our own guides), plus 3-4
// screenshots in screenshots/. This program copies both folders into the output
// directory and writes dossier.json with the vendored make.fun library, which is
// the summary the judge reads: the screenshots, the first load's files and bytes,
// and the source outline. Leave vendor/makefun-frontend.ts untouched — the scorer
// rebuilds the dossier with its own copy and the two must match byte for byte.
//
// Run it outside the grader with MAKEFUN_OUTPUT_DIR standing in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });

// The gate's caps (from the kit's reference/gate.json): at most 4 screenshots,
// each at most 256 KiB; app/ at most 993 files and directories and 48 MiB in all.
// text_max_bytes caps the dossier's text at 160 KiB.
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, { text_max_bytes: 163840, screenshots: { max: 4, max_bytes: 262144 }, app_max_files: 993, app_max_bytes: 50331648 }),
);
