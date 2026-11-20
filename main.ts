// Leonida Platinum — the entry program (Node 22, standard library only).
//
// What it does: copies this repository's app/ (the static guide) and
// screenshots/ (the four renders) into the output directory, then writes
// /output/dossier.json with the vendored make.fun library — the summary the
// judge reads. vendor/makefun-frontend.ts is the kit's copy, unchanged; the
// scorer rebuilds the dossier with its own copy and compares the two byte
// for byte, so this file must not touch the library.
//
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// Serve the result locally with `node serve.ts`, then open http://localhost:8080.

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// The guide itself must be there — refuse loudly instead of handing in an
// empty output if the repository is ever moved or renamed around this file.
if (!existsSync(join(repoRoot, 'app', 'index.html'))) {
  throw new Error('Leonida Platinum: app/index.html is missing beside main.ts — nothing to hand in.');
}

// Fresh output every run: the dossier must describe exactly what is handed in.
mkdirSync(outputDir, { recursive: true });
cpSync(join(repoRoot, 'app'), join(outputDir, 'app'), { recursive: true });
mkdirSync(join(outputDir, 'screenshots'), { recursive: true });
if (existsSync(join(repoRoot, 'screenshots'))) {
  cpSync(join(repoRoot, 'screenshots'), join(outputDir, 'screenshots'), { recursive: true });
}

// The scorer's own caps (reference/gate.json): only text_max_bytes shapes the
// bytes; the others refuse an entry the scorer would refuse — more than 4
// screenshots or one over 256 KiB, more than 993 files and directories in app/
// or 48 MiB of app files, against /output's own 1000-entry and 64 MiB caps.
writeFileSync(
  join(outputDir, 'dossier.json'),
  buildDossier(outputDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
  }),
);

// One line on stdout so a run's success is visible without opening the output.
console.log(`Leonida Platinum handed in: ${outputDir}/dossier.json written.`);
