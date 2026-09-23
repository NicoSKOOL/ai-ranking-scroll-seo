#!/usr/bin/env node
/* lighthouse-gate.mjs: the 95+ gate, every URL on mobile and desktop.

   Usage:
     node lighthouse-gate.mjs https://site/ https://site/en/ https://site/pt/
          [--min 95] [--staging] [--out lab/lighthouse] [--runs 1]

   Categories checked: performance, accessibility, best-practices, seo, and
   agentic-browsing when the installed Lighthouse has it (13.3+).
   --staging  a noindex staging deploy fails SEO's is-crawlable audit by design.
              The SEO score is recomputed without that one audit and the report
              says so. Never use it on production.
   --runs N   performance varies run to run; the gate takes the median of N.
   Runs sequentially (parallel runs starve each other and skew performance).
   Exit code 1 if any category on any URL/form factor is below --min. */

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const argv = process.argv.slice(2);
const opt = (n, d) => { const i = argv.indexOf(n); return i > -1 ? argv[i + 1] : d; };
const urls = argv.filter((a, i) => /^https?:/.test(a) && !['--out', '--min', '--runs'].includes(argv[i - 1]));
const MIN = +opt('--min', 95) / 100;
const OUT = opt('--out', 'lab/lighthouse');
const RUNS = +opt('--runs', 1);
const STAGING = argv.includes('--staging');
if (!urls.length) { console.error('usage: lighthouse-gate.mjs <url>... [--min 95] [--staging]'); process.exit(2); }
fs.mkdirSync(OUT, { recursive: true });

function run(url, ff, i) {
  const slug = `${new URL(url).pathname.replace(/\W+/g, '_') || 'root'}-${ff}-${i}`;
  const file = path.join(OUT, `${slug}.json`);
  const args = ['-y', 'lighthouse@latest', url, '--quiet', '--output=json', `--output-path=${file}`,
    '--chrome-flags=--headless=new'];
  if (ff === 'desktop') args.push('--preset=desktop');
  execFileSync('npx', args, { stdio: 'ignore' });
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function seoWithoutCrawlable(r) {
  const cat = r.categories.seo;
  let sum = 0, w = 0;
  for (const ref of cat.auditRefs) {
    if (ref.id === 'is-crawlable' || !ref.weight) continue;
    const s = r.audits[ref.id]?.score;
    if (s === null || s === undefined) continue;
    sum += s * ref.weight; w += ref.weight;
  }
  return w ? sum / w : cat.score;
}

const median = xs => xs.sort((a, b) => a - b)[Math.floor(xs.length / 2)];
let failed = 0;
const rows = [];

for (const url of urls) for (const ff of ['mobile', 'desktop']) {
  const reps = Array.from({ length: RUNS }, (_, i) => run(url, ff, i));
  const r = reps[0];
  const scores = {};
  for (const k of Object.keys(r.categories)) {
    scores[k] = median(reps.map(x => (k === 'seo' && STAGING ? seoWithoutCrawlable(x) : x.categories[k].score) ?? 0));
  }
  const bad = Object.entries(scores).filter(([, s]) => s < MIN);
  if (bad.length) failed++;
  const fails = [];
  for (const [k] of bad) for (const ref of r.categories[k].auditRefs) {
    const a = r.audits[ref.id];
    if (ref.weight && a?.score !== null && a?.score < 0.9 && !(STAGING && ref.id === 'is-crawlable')) fails.push(`${k}:${ref.id}`);
  }
  const a = r.audits;
  rows.push({ url, ff, scores, lcp: a['largest-contentful-paint']?.displayValue, cls: a['cumulative-layout-shift']?.displayValue, tbt: a['total-blocking-time']?.displayValue, fails });
  const fmt = Object.entries(scores).map(([k, s]) => `${k.replace('best-practices', 'bp').replace('agentic-browsing', 'agentic').replace('performance', 'perf').replace('accessibility', 'a11y')} ${Math.round(s * 100)}`).join('  ');
  console.log(`${bad.length ? 'FAIL' : 'ok  '} ${ff.padEnd(7)} ${url}\n       ${fmt}   LCP ${rows.at(-1).lcp}  CLS ${rows.at(-1).cls}  TBT ${rows.at(-1).tbt}${fails.length ? `\n       below 0.9: ${fails.join(', ')}` : ''}`);
}

fs.writeFileSync(path.join(OUT, 'gate.json'), JSON.stringify({ min: MIN, staging: STAGING, rows }, null, 2));
if (STAGING) console.log('\nnote: --staging, SEO scored without is-crawlable (noindex is intentional on staging)');
process.exit(failed ? 1 : 0);
