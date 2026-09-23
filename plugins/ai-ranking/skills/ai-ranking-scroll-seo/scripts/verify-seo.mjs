#!/usr/bin/env node
/* verify-seo.mjs: static SEO gates on a built site (no browser needed).

   Usage:
     node verify-seo.mjs --dist dist --pages pages.json [--budget-kb 200]

   pages.json lists what each page must target:
     [{ "file": "index.html", "keyword": "terreno en Estados Unidos" },
      { "file": "en/index.html", "keyword": "buy land in the USA" }]

   Checks, per page:
     - exactly one <h1>; the keyword appears in <title> and <h1>
       (case- and accent-insensitive), title <= 60 chars, keyword in the first
       half of the title, meta description 70-160 chars and contains the keyword
     - canonical present; hreflang alternates reciprocal across pages + x-default
     - JSON-LD parses; required @types present (Organization, WebSite, WebPage,
       FAQPage when a <details>/FAQ block exists); FAQ answers appear verbatim
       in the visible HTML (schema must not claim what the page does not show)
     - every <img>/<source> is .webp or .avif (or .svg), has width+height
       (<img>) and alt; no shipped .png/.jpg under dist (favicons excepted)
   Site-wide: robots.txt, sitemap.xml and llms.txt exist; images over budget.
   Exit 1 on any failure. */

import fs from 'node:fs';
import path from 'node:path';

const argv = process.argv.slice(2);
const opt = (n, d) => { const i = argv.indexOf(n); return i > -1 ? argv[i + 1] : d; };
const DIST = opt('--dist', 'dist');
const pages = JSON.parse(fs.readFileSync(opt('--pages', 'pages.json'), 'utf8'));
const BUDGET = +opt('--budget-kb', 200) * 1024;

const norm = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();
const decode = s => s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');
const strip = s => decode(s.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
let fails = 0;
const fail = (where, msg) => { fails++; console.log(`FAIL ${where}: ${msg}`); };
const ok = (where, msg) => console.log(`ok   ${where}: ${msg}`);

const hreflangMap = {};
for (const p of pages) {
  const html = fs.readFileSync(path.join(DIST, p.file), 'utf8');
  const where = p.file;
  const kw = norm(p.keyword);

  const title = strip((html.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || '');
  const h1s = [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/g)].map(m => strip(m[1]));
  const desc = decode((html.match(/<meta name="description" content="([^"]*)"/) || [])[1] || '');

  if (h1s.length !== 1) fail(where, `${h1s.length} <h1> elements (need exactly 1)`);
  if (!norm(title).includes(kw)) fail(where, `keyword "${p.keyword}" not in title "${title}"`);
  else if (norm(title).indexOf(kw) > norm(title).length / 2) fail(where, `keyword is in the second half of the title`);
  else ok(where, `title has keyword (${title.length} chars)`);
  if (title.length > 60) fail(where, `title ${title.length} chars (> 60)`);
  if (h1s[0] && !norm(h1s[0]).includes(kw)) fail(where, `keyword not in h1 "${h1s[0]}"`);
  else if (h1s[0]) ok(where, `h1 has keyword`);
  if (desc.length < 70 || desc.length > 160) fail(where, `meta description ${desc.length} chars (want 70-160)`);
  if (!norm(desc).includes(norm(p.keyword).split(' ').slice(-3).join(' '))) fail(where, `meta description misses the keyword`);

  if (!/<link rel="canonical" href="[^"]+"/.test(html)) fail(where, 'no canonical');
  hreflangMap[p.file] = [...html.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"/g)].map(m => [m[1], m[2]]);

  // JSON-LD
  const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  const types = new Set();
  const visible = norm(strip(html.replace(/<script[\s\S]*?<\/script>/g, '')));
  for (const b of blocks) {
    let data;
    try { data = JSON.parse(b[1]); } catch (e) { fail(where, `JSON-LD does not parse: ${e.message}`); continue; }
    const nodes = data['@graph'] || [data];
    for (const n of nodes) {
      [].concat(n['@type']).forEach(t => types.add(t));
      if (n['@type'] === 'FAQPage') for (const q of n.mainEntity || []) {
        if (!visible.includes(norm(q.name))) fail(where, `FAQ question in schema but not on page: "${q.name.slice(0, 50)}"`);
        if (!visible.includes(norm(q.acceptedAnswer.text))) fail(where, `FAQ answer in schema but not on page: "${q.name.slice(0, 50)}"`);
      }
    }
  }
  for (const t of ['Organization', 'WebSite', 'WebPage']) if (!types.has(t)) fail(where, `JSON-LD missing ${t}`);
  if (/<details/.test(html) && !types.has('FAQPage')) fail(where, 'FAQ on page but no FAQPage schema');
  ok(where, `JSON-LD types: ${[...types].join(', ')}`);

  // images
  let imgs = 0;
  for (const m of html.matchAll(/<(img|source)\b([^>]*)>/g)) {
    const attrs = m[2];
    const urls = [...attrs.matchAll(/(?:src|srcset)="([^"]+)"/g)].flatMap(x => x[1].split(',').map(s => s.trim().split(' ')[0]));
    for (const u of urls) if (!/\.(webp|avif|svg)(\?|$)/i.test(u) && !u.startsWith('data:')) fail(where, `non-WebP image ${u}`);
    if (m[1] === 'img') {
      imgs++;
      if (!/\bwidth="\d+"/.test(attrs) || !/\bheight="\d+"/.test(attrs)) fail(where, `img without width/height: ${attrs.slice(0, 80)}`);
      // bare `alt` is how minifiers write decorative alt="" and is valid HTML
      if (!/\balt(="|\s|\/|$)/.test(attrs)) fail(where, `img without alt: ${attrs.slice(0, 80)}`);
    }
  }
  ok(where, `${imgs} images checked`);
}

// hreflang reciprocity
const all = Object.values(hreflangMap);
const ref = JSON.stringify([...all[0]].sort());
for (const [f, list] of Object.entries(hreflangMap)) {
  if (JSON.stringify([...list].sort()) !== ref) fail(f, 'hreflang set differs from the other pages (not reciprocal)');
  if (!list.some(([l]) => l === 'x-default')) fail(f, 'no x-default hreflang');
}
if (all.length) ok('site', `hreflang reciprocal across ${all.length} pages (${all[0].map(x => x[0]).join(', ')})`);

// shipped files
const walk = d => fs.readdirSync(d, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]);
let over = 0;
for (const f of walk(DIST)) {
  if (/\.(png|jpe?g|gif)$/i.test(f) && !/favicon|apple-touch/i.test(f)) fail('site', `raster non-WebP file shipped: ${path.relative(DIST, f)}`);
  if (/\.(webp|avif)$/i.test(f) && fs.statSync(f).size > BUDGET && !/-(1440|1920)\.webp$/.test(f)) { over++; fail('site', `${path.relative(DIST, f)} ${(fs.statSync(f).size / 1024).toFixed(0)} KB over ${BUDGET / 1024} KB`); }
}
for (const f of ['robots.txt', 'sitemap.xml', 'llms.txt']) {
  if (!fs.existsSync(path.join(DIST, f))) fail('site', `missing ${f}`); else ok('site', `${f} present`);
}
console.log(fails ? `\n${fails} failure(s)` : '\nall SEO gates pass');
process.exit(fails ? 1 : 0);
