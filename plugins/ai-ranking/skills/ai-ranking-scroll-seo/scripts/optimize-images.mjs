#!/usr/bin/env node
/* optimize-images.mjs: masters (PNG/JPG) -> responsive WebP with byte budgets.

   Usage:
     node optimize-images.mjs --in assets/masters --out public/img
          [--widths 640,960,1440,1920] [--q 72] [--budgets budgets.json]

   budgets.json maps a master basename (or "*") to a max KB for the 960w file,
   which is the size a typical phone downloads:
     { "hero-back": 120, "*": 200 }

   Needs cwebp (brew install webp) and sips or ImageMagick for dimensions.
   Alpha is preserved. Quality steps down (to a floor of 45) until the 960w file
   fits its budget; if it still does not fit, the script exits non-zero.
   Writes <out>/images.json: { name: { widths:[...], w, h, alpha } } for the page. */

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const args = Object.fromEntries(process.argv.slice(2).reduce((a, v, i, arr) => {
  if (v.startsWith('--')) a.push([v.slice(2), arr[i + 1]]);
  return a;
}, []));
const inDir = args.in || 'assets/masters';
const outDir = args.out || 'public/img';
const widths = (args.widths || '640,960,1440,1920').split(',').map(Number);
const baseQ = +(args.q || 72);
const budgets = args.budgets && fs.existsSync(args.budgets) ? JSON.parse(fs.readFileSync(args.budgets, 'utf8')) : { '*': 200 };

function dims(file) {
  const out = execFileSync('sips', ['-g', 'pixelWidth', '-g', 'pixelHeight', '-g', 'hasAlpha', file]).toString();
  return {
    w: +out.match(/pixelWidth: (\d+)/)[1],
    h: +out.match(/pixelHeight: (\d+)/)[1],
    alpha: /hasAlpha: yes/.test(out),
  };
}

function encode(src, dst, w, q, alpha) {
  const a = ['-quiet', '-q', String(q), '-m', '6', '-resize', String(w), '0', '-metadata', 'none'];
  if (alpha) a.push('-alpha_q', '60', '-exact');
  execFileSync('cwebp', [...a, src, '-o', dst]);
  return fs.statSync(dst).size;
}

fs.mkdirSync(outDir, { recursive: true });
// merge with earlier runs so several master folders can share one output dir
const reportFile = path.join(outDir, 'images.json');
const report = fs.existsSync(reportFile) ? JSON.parse(fs.readFileSync(reportFile, 'utf8')) : {};
let failed = 0;

for (const f of fs.readdirSync(inDir).filter(f => /\.(png|jpe?g)$/i.test(f)).sort()) {
  const name = path.basename(f, path.extname(f));
  const src = path.join(inDir, f);
  const d = dims(src);
  const budgetKB = budgets[name] ?? budgets['*'];
  const ws = widths.filter(w => w <= d.w);
  // The budget applies to the phone-sized file: 960w, or the largest requested
  // width below it when a run only ships small files (e.g. --widths 640 for
  // art-directed mobile crops). Quality steps down to a floor of 40.
  const bw = ws.includes(960) || !ws.length ? 960 : Math.max(...ws.filter(w => w < 960), 640);
  let q = baseQ, size960;
  while (true) {
    size960 = encode(src, path.join(outDir, `${name}-${bw}.webp`), Math.min(bw, d.w), q, d.alpha);
    if (size960 / 1024 <= budgetKB || q <= 40) break;
    q -= 4;
  }
  for (const w of ws) if (w !== bw) encode(src, path.join(outDir, `${name}-${w}.webp`), w, q, d.alpha);
  // srcset truth: a file named for a width larger than the master is really d.w wide
  const srcset = [...new Set([...ws, bw])].sort((a, b) => a - b)
    .map(w => ({ file: `${name}-${w}.webp`, w: Math.min(w, d.w) }));
  const ok = size960 / 1024 <= budgetKB;
  if (!ok) failed++;
  report[name] = { srcset, w: d.w, h: d.h, alpha: d.alpha, q };
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${name}: ${bw}w ${(size960 / 1024).toFixed(0)} KB (budget ${budgetKB}), q${q}, ${ws.join('/')}`);
}

fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
if (failed) { console.error(`${failed} image(s) over budget`); process.exit(1); }
