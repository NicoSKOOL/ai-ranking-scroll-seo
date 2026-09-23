# ai-ranking-scroll-seo

**A Claude Code skill that builds premium scroll-driven websites that also rank.**

Most "wow" scroll sites are slow, invisible to Google and unreadable to AI
agents. This skill builds the cinematic version and then refuses to call it
done until it passes five hard gates: WebP images inside byte budgets, correct
schema, the researched keyword in the title and H1, Lighthouse 95+ on all four
scores (mobile and desktop), and agentic browsing readiness.

![Layered hero: sky, forest and foreground planes move at different depths as you scroll](media/arkansas-hero.webp)

## What it does

You describe the business. Claude runs a fixed process:

1. **Interview and brief.** Eight short questions: the vibe, the scroll journey
   in your words, the energy curve, the one moment a visitor should remember,
   the assets you already have. Everything downstream reads from `BRIEF.md`.
2. **Page plan.** Picks a page grammar, gives every section a different scroll
   device (pinned scenes, layered parallax, zoom reveals, lateral pans,
   counters, a real-terrain 3D exploded parcel) and invents one bespoke
   signature move for the site. A fingerprint
   gate stops two builds from sharing the same skeleton.
3. **Assets.** Generates photoreal imagery through fal.ai (GPT Image 2.5, with
   real transparency for layered heroes) or kie.ai, or uses your own photos.
   Converts everything to responsive WebP with per-image byte budgets and
   phone-specific crops. Every generated image is logged with its prompt.
4. **Build.** Real semantic HTML on a zero-dependency scroll engine (8 KB
   gzipped). Single-file output, or an Astro site for multiple languages with
   hreflang and a researched keyword per language. The page is a complete
   document without JavaScript, so search engines and AI agents read all of it.
5. **Gates.** It does not ship until all five pass on every route:

   | Gate | Pass condition |
   |---|---|
   | Speed and images | WebP/AVIF only, responsive srcset, width/height set, budgets met |
   | Schema | JSON-LD graph for the business type; nothing claimed that the page does not show |
   | Keywords | Primary keyword (from search data) in the `<title>` and the single `<h1>` |
   | Lighthouse | Performance, Accessibility, Best Practices, SEO ≥ 95, mobile and desktop |
   | Agentic browsing | Content without JS, real controls, `llms.txt`, WebMCP on the main action |

6. **Verify.** Screenshots every scroll position on desktop and phone, measures
   text contrast on the composited frames, and runs Lighthouse on a staging
   deploy (median of three runs).

## The reference build

Terrenos Arkansas: Spanish, English and Portuguese, built with this skill.

| | |
|---|---|
| ![Three flight routes from Buenos Aires, Santiago and São Paulo converge on Arkansas](media/arkansas-flight.webp) | ![The map dives into Arkansas and the state outline draws in](media/arkansas-arkansas.webp) |
| ![Zoom from an aerial of the lake community into one lot, whose boundary draws](media/arkansas-lot.webp) | ![The price fills block by block: down payment plus 24 monthly payments](media/arkansas-price.webp) |

![Real USGS terrain of Cherokee Village as a 3D block; one lot lifts out and fans into five labelled layers](media/arkansas-parcel.webp)

Result on the staging deploy (3-run median), including the lazy-loaded 3D section:

| Route | Performance | Accessibility | Best Practices | SEO | Agentic |
|---|---|---|---|---|---|
| es / en / pt, mobile | 97 / 97 / 98 | 100 | 100 | 100 | 100 |
| es / en / pt, desktop | 100 | 100 | 100 | 100 | 100 |

(SEO measured without the `is-crawlable` audit, since staging is noindex by design.)

## Install

**As a Claude Code plugin:**

```
/plugin marketplace add NicoSKOOL/ai-ranking-scroll-seo
/plugin install ai-ranking@ai-ranking
```

Then ask for it in plain words ("build me a scroll site for my landscaping
business") or call it directly with `/ai-ranking:ai-ranking-scroll-seo`.

**Or copy the skill folder** into your own skills directory:

```bash
git clone https://github.com/NicoSKOOL/ai-ranking-scroll-seo.git
cp -r ai-ranking-scroll-seo/plugins/ai-ranking/skills/ai-ranking-scroll-seo ~/.claude/skills/
```

## Requirements

| Tool | Why | Install |
|---|---|---|
| Node 18+ | scripts, Astro builds | nodejs.org |
| Google Chrome | screenshots and Lighthouse | google.com/chrome |
| `cwebp` | WebP conversion | `brew install webp` |
| Python 3 + fontTools, numpy, Pillow | font subsetting, terrain | `pip install fonttools brotli numpy pillow` |
| ffmpeg (full build) | only for scroll-scrubbed video | `brew install ffmpeg` |
| `FAL_KEY` or `KIE_AI_API_KEY` | only for generated imagery | see `.env.example` |
| DataForSEO | only for keyword volumes (any MCP or API access) | [dataforseo.com](https://app.dataforseo.com/?aff=182182) |

Check your setup with:

```bash
node plugins/ai-ranking/skills/ai-ranking-scroll-seo/scripts/doctor.mjs
```

## The scripts

| Script | What it does |
|---|---|
| `fal.mjs` | Generate stills (and transparent layers) with GPT Image 2.5 on fal.ai; `--ref` edits keep a scene consistent; writes a provenance manifest |
| `terrain.py` | Real elevation + aerial imagery for any US point (USGS), ready for the 3D exploded-parcel device |
| `kie.mjs` | Alternative generator, including 5 s video clips for scrub sections |
| `optimize-images.mjs` | Masters to responsive WebP, budgets enforced on the file phones download |
| `subset-fonts.py` | Cuts variable fonts to the glyphs and weights the site uses (92 KB to 39 KB on the reference build) |
| `verify-seo.mjs` | Title/H1 keyword, meta description, canonical, reciprocal hreflang, JSON-LD validity and visibility, WebP-only, alt and dimensions |
| `lighthouse-gate.mjs` | Every URL on mobile and desktop, four categories plus Agentic Browsing, fails below 95 |
| `shoot.mjs` | Walks every scroll act, screenshots, contact sheet, contrast on composited frames |

## What's inside

```
plugins/ai-ranking/skills/ai-ranking-scroll-seo/
  SKILL.md              the process Claude follows
  CHANGELOG.md          every build finding and the rule it produced
  engine/               scrollcraft.js + .css, the scroll runtime
  references/           seo-performance, schema, i18n, agentic, trust-mode,
                        exploded-parcel, devices, hero-depth, feel, taste,
                        uniqueness, worlds, verify
  scripts/              the tools above
  templates/            fingerprint registry, exploded-parcel.ts (3D scene)
```

The CHANGELOG is worth reading on its own: each entry is something that broke
on a real build and the rule that now prevents it.

## Trust mode

For businesses sold to people who cannot inspect the product first (land, real
estate, finance, health), generated imagery is allowed for impact but never
passes as evidence: every generated place or product carries an "illustrative
image" caption, numbers come only from the client's published material, and
unconfirmed claims are phrased as what the buyer will verify.

## Learn more

This skill is taught step by step in the AI Ranking community:
[skool.com/ai-ranking](https://skool.com/ai-ranking). Free AI Search Starter
Kit: [airankingskool.com](https://www.airankingskool.com/you-came-here-from-socials).

## License

MIT. See [LICENSE](LICENSE).
