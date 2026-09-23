# SEO and performance gates

A scroll site that nobody finds, or that scores 60 on a phone, has failed at its
job, however good it looks. This skill ships nothing until five gates pass.
Each one is a script, so "done" is a green run, not an opinion.

| Gate | Pass condition | Script |
|---|---|---|
| 1. Speed and images | Every shipped raster is WebP/AVIF, responsive, with width/height; phone-size files inside their budgets | `optimize-images.mjs`, `verify-seo.mjs` |
| 2. Schema | JSON-LD parses; Organization + WebSite + WebPage (+ FAQPage when there is a FAQ, + business type from [schema.md](schema.md)); nothing in schema that the page does not visibly say | `verify-seo.mjs` |
| 3. Keywords | One primary keyword per language, in the `<title>` (first half, ≤ 60 chars), the single `<h1>` and the meta description | `verify-seo.mjs` |
| 4. Lighthouse | Performance, Accessibility, Best Practices, SEO ≥ 95, mobile AND desktop, every language route | `lighthouse-gate.mjs` |
| 5. Agentic browsing | Lighthouse Agentic Browsing category passes; llms.txt, robots.txt, sitemap.xml exist; content present without JS | `lighthouse-gate.mjs`, `verify-seo.mjs`, [agentic.md](agentic.md) |

Run them in this order after every meaningful change:

```bash
node <skill>/scripts/optimize-images.mjs --in assets/masters --out public/img --budgets assets/budgets.json
npm run build
node <skill>/scripts/verify-seo.mjs --dist dist --pages seo-pages.json
# deploy to staging, warm the cache once, then:
node <skill>/scripts/lighthouse-gate.mjs https://staging/ https://staging/en/ --staging --runs 3
```

`--staging` scores SEO without `is-crawlable`, because a staging deploy is
noindex on purpose. `--runs 3` takes the median, because a cold CDN edge on the
first run can cost 5 points of mobile Performance on its own.

## Keywords come from data, not from the headline you like

Pull volumes (DataForSEO `kw_data_google_ads_search_volume`) for 5 to 10
variants per language before writing the H1. Pick the primary by fit first,
volume second: a 210/month phrase with a $4.42 CPC that matches the offer beats
a 12,100/month phrase whose searchers compare you against $500 listings. Then
write the H1 so the keyword reads naturally inside it. The title front-loads it.
Put the higher-volume secondary terms in body copy, not in a second H1.

## How a scroll site reaches 95+ on a phone

These are the fixes that actually moved the score on the first build (Terrenos
Arkansas, 2026-09-23: mobile Performance 83 to 97).

1. **Reserve pinned-act heights before the engine mounts.** Author
   `style="--sc-span:N"` next to `data-sc-span="N"`; the engine CSS turns it into
   the final height. Without it the page is short until JS runs, lazy images five
   viewports down fall inside the browser's lazy-load distance, and they download
   during the hero's critical window. Also removes the layout shift.
2. **Art-direct the hero for phones with `<picture>`.** A 16:9 plane shown with
   `object-fit: cover` on a portrait phone is cropped to its middle third, so the
   phone downloads three times the pixels it shows. Crop portrait masters
   (`<name>-m`), ship them at 640w, and switch with
   `<source media="(max-aspect-ratio: 4/5)">`. Preload the phone and desktop
   versions separately with `media` on the preload link.
3. **Know which layer is the LCP.** With layered heroes it is usually the
   largest opaque-ish plane (the forest, not the sky). Give that one
   `fetchpriority="high"` and a preload, and budget it hardest.
4. **Subset the fonts.** Two variable Latin faces are about 95 KB and sit on the
   first-paint path. `subset-fonts.py` pins the weight axis to what the CSS uses
   and keeps only the glyphs in the built pages (all languages at once): 92 KB
   became 39 KB. Preload the display face. Drop italic files you barely use.
5. **Load the engine only when motion is on.** Dynamic `import()` behind the
   `html.sc-js` gate: reduced-motion and motion-off visits never download it.
6. **Inline the CSS** (`build.inlineStylesheets: 'always'` in Astro). One less
   render-blocking request on a phone is worth more than cacheability here.
7. **Budget the file that ships**, not the master. Alpha planes of dense foliage
   are the heaviest thing on the page: accept q42 on a moving, partly covered
   plane rather than blowing the LCP.

Measured budgets that passed: phone hero total ≈ 80 KB (sky 19, forest 42,
foreground 18), 960w stills ≤ 150 KB, fonts 39 KB, engine 8 KB gzipped.

## Accessibility traps specific to scroll pages

- Scroll-driven colour: an element whose background animates (a price block that
  fills) must keep readable text in its initial state too. Mix the text colour
  with the same progress variable as the background.
- `aria-label` on a `<p>` or `<span>` is prohibited; use a visually hidden span.
- Decorative planes get `alt=""` (minifiers print it as bare `alt`, which is fine).
- Tap targets ≥ 44 px, including the language switcher.
