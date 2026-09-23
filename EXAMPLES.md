# Fingerprints

A worked reference registry: twelve reference builds with their six
fingerprint dimensions, plus the builds made with this skill. Use it to see
what "different on 4 of 6 dimensions" looks like in practice. Your own registry
lives in your workspace (`templates/FINGERPRINTS.md` seeds it empty). The registry exists so the next build can prove it is a different page
rather than a re-skin of an existing one.

The rules, the six dimensions and the gate itself live in
`plugins/ai-ranking/skills/ai-ranking-scroll-seo/references/uniqueness.md`. Short version:

**A new build must differ from EVERY row below on at least 4 of the 6
dimensions.** Four against each row individually, not four on average across the
table. If a planned build fails, change the plan. Never edit a row to make room
for it.

The six dimensions are: **grammar**, **nav treatment**, **hero device**,
**act-sequence shape**, **close pattern**, **signature move**.

---

## Why this file exists

The first four builds were run before there was a structure axis. Read the rows
and the collision is obvious: **all four sit in the same grammar**, with the same
nav, the same hero device, the same close, and no signature move on any of them.
`saas` (Vesper) and `perkform` are the pair the owner named, but the problem is
the whole table. Only the act order and the palette actually moved.

Those four rows are recorded as-built, warts included. They are the baseline any
fifth build has to clear, and clearing them is not hard, because they occupy one
cell of a very large space.

---

## The registry

| Build | Grammar | Nav treatment | Hero device | Act-sequence shape | Close pattern | Signature move | World | Port |
|---|---|---|---|---|---|---|---|---|
| `perkform` | Filmic one-shot | Fixed minimal bar: wordmark + one CTA | Full-bleed `scrub` 2.6vh, lead-corner kinetic `h1`, greet cue `0 0.78 0` | `scrub > pin > flow > scrub > pan > pin`, 6 acts, ~13.7vh | `pin` 1.15vh, `data-sc-spotlight` stage, `data-sc-magnet="0.26"` CTA, footer inside the stage | **none** | Low-key cinematic. Charcoal `#0A0807`, lime accent `#C8FF3D` | 4500 |
| `creator-portfolio` | Filmic one-shot | Fixed minimal bar: wordmark + one CTA | Full-bleed `scrub` 2.5vh, lead-corner kinetic `h1`, greet cue `0 0.82 0` | `scrub > pin > flow > scrub > flow > pan > pin`, 7 acts, 13.8vh | `pin` 1.15vh, spotlight stage, magnet `0.26` CTA, plus a social sub-nav in the footer | **none** | High-key editorial. Warm paper `#F2F0EB`, navy accent `#14589B` | 4501 |
| `agency` | Filmic one-shot | Fixed minimal bar: wordmark + one CTA | Full-bleed `scrub` 2.4vh, lead-corner kinetic `h1`, greet cue `0 0.86 0` | `scrub > flow > pin > scrub > pan > flow > pin`, 7 acts, 13.6vh | `pin` 1.15vh, spotlight stage, magnet `0.26` CTA on a dusk ground | **none** | Natural documentary. Woodland dark `#0B1013`, weathered copper `#C97B3E` | 4502 |
| `saas` | Filmic one-shot | Fixed minimal bar: wordmark + one CTA | Full-bleed `scrub` 2.5vh, lead-corner kinetic `h1`, greet cue `0 0.76 0 0.48` | `scrub > pin > flow > pan > scrub > pin`, 6 acts, 13.8vh | `pin` 1.15vh, spotlight stage, magnet `0.26` CTA, cue opened early for the tab stop | **none** | Nocturne. Ink-blue `#050A10`, sodium amber `#FF8A3C` | 4503 |
| `vesper-v2` | Live surface, on one continuous incident timeline | Console status chrome: process line, incident id, live timecode bound to scroll. No CTA in the chrome. Navigation is the playhead rail fixed to the bottom edge | Cold open as the product surface: pinned ops console, status board plus a log stream already tailing, `h1` set as the incident title in the panel header. No media, no kinetic type, no scrub | `pin > flow > pin > pan > pin > flow > pin`, 7 acts, **12.1vh** (12.5vh at 390px). Zero `scrub` acts, zero `tilt`, one `pan` carrying the trace itself | Command prompt: `vesper init` types itself on approach, caret blinking, real Copy button, install-style lines, concept disclosure in a footer inside the stage. No spotlight, no magnet | **Scroll is the playhead.** A persistent trace rail spans the whole page, drawing a real latency series; scroll scrubs a piecewise-linear incident clock that crawls through the run and jumps six hours in the gap. Log lines and spans materialise when the clock passes their own printed timecode; waypoints stamp as they are passed and stay stamped; keyboard focus scrubs the playhead to the focused span | Code-rendered console. Deep ink `#05080D` to warm black `#0A0708`, sodium amber `#FF8A3C` as the alarm only, one muted state green `#5FA98D` in status glyphs. Zero generated imagery | 4504 |
| `descent` | **Continuous world**, on the kits **worldflight** mode. One water column on one `position:fixed` stage; the seven zones are depths passed through. Zero acts, zero `sc-section`, zero `flow`, zero `pan`, zero `data-sc-drift`, and the only element in document flow is the spacer | The nav is a **map**: a left-edge depth gauge carrying a metre readout bound to journey progress, the current zone, and seven clickable waypoints on a hairline scale with a travelling tick. No wordmark-plus-CTA bar; no CTA anywhere in the chrome | The world already in motion with no title stage, and **no block anywhere on the page**: a seam-locked nine-leg flight scrubbing from the first notch on one fixed stage. The `h1` is set at `--md`, anchored **top-right** in the dawn sky band on the fixed copy layer, and greets on the `hero` window rather than fading in. The largest thing on the first screen is the depth readout at `0 m` | **One worldflight track, nine legs, 8.18vh of film over a 9.18vh spacer** (the mode adds a closing viewport). Weights 0.95 / 0.92 / 0.94 / 0.95 / **0.95 + 0.95** / 0.90 / 0.80 + 0.82, capped by the ~1.5vh-per-8s rule, so the peak buys its room by **owning two legs (1.90vh) against a 0.95vh next-largest zone** rather than by a bigger span. Copy anchors run TR, BR, BL, TL, BC, MR, C, never repeating adjacently | Arrival in the same canvas, still flying: two ascent legs carry the camera off the seafloor and up into the daylight ceiling, the authored grade lifts to surface blue, the depth number **falls** to 0 for the only time on the page, and the CTA is an etched plate resting in that light on a close window with `rOut` 0, so nothing fades out under the reader. No spotlight, no magnet, no `1.15` pin | **The dark that answers.** In the midnight zone the page stops lighting itself: a near-opaque mask covers the water and the pointer carries the only hole in it, a lamp cone driven off `--sc-mx`/`--sc-my` published by the page's own handler. Stop scrolling for ~0.6s inside that zone and bioluminescent motes fade up and drift toward wherever the lamp is pointing, then scatter the moment the wheel moves. Ramps out before the bloom so it never fights the peak | Underwater nocturne, real deep-water photographic. Ink `#03070C`, bioluminescent cyan `#35E6DA` | 4505 |
| `airfield` | Rhythmic cutlist | Full-width split-flap **departures strip** fixed to the top: wordmark, one live board row that flips as the page advances, one CTA at equal weight. Loud, not minimal. No progress bar | Static full-bleed still at 1.00vh that cuts away in under a viewport. `<h1>` set small in the top-left corner as stencilled signage, over a corner scrim. No clip, no scrub, no display-scale greet, no kinetic hero | `flow x15`, **15 acts, 13.19vh**. **Zero pinned acts** (no `scrub`, `pin` or `pan` anywhere), zero video. Full-bleed frames at ~1.00vh alternating with 0.30-0.42vh type slabs; `reveal` on every frame in a different direction; grounds hard-cut per section rather than drifted | Abrupt full-bleed slab: eyebrow, one amber CTA block at 11vw, footer with the concept disclosure inside it. No spotlight, no magnet, no fade-down. The strip stamps FINAL CALL and holds | **The departures board.** The lineup is a real split-flap board in real markup, 320 flaps, each walking forward through a 40-character set. Scroll drives it: stop half way and it holds half flipped. The strip flips through the lineup as the page advances; at the peak the board unfurls out of the strip to fill the screen, populates top to bottom, empties itself row by row to DEPARTED, and the one row that was never filled in flips up to poster scale as the headliner | Hard-light graphic. Dusk blue-black `#0B1119` with two full-bleed inversions (concrete `#E7E1D5`, amber `#FFC400`), flap amber `#FFC400` accent, `#FF4A2B` as the board's alarm state only | 4506 |
| `pigment` | **Gallery / catalog.** Seven specimens in a walkable museum index, every one labelled on the same schema (number, name, composition, origin, period, what it did, status), facts only, zero persuasion, zero kinetic type | A clickable **specimen index** set in the top margin like a running head: catalog numerals I to VII plus ST, each with a swatch dot in its pigment's hue, current entry underlined via scroll spy. No bar, no CTA in the chrome, no numeric readout | **Object one, already in view and already labelled.** A framed specimen plate (generated still on a mat) with the museum label beside it on greet cues; `h1` is the specimen name. No full-bleed media, no title treatment, no display-scale stack | `pin > flow > pin > flow > pan > flow > scrub > flow > pin`, **9 acts, ~13.4vh** (shares maison's vh band; differs on everything else in the shape: 9 acts not 11, one scrub one pan, zero kinetic, one constant bone ground, flows carrying reveal / parallax / iris). Peak = the only clip at 2.7vh with dwell 0.4, silence act (0.5vh) directly before it | **The acquisition plate.** The close is Specimen VII: Visitor: a framed canvas live-mirroring every smear the visitor left, labelled on the same schema (composition: the pigments they touched; acquired: just now), colophon and a "walk the room again" link inside the stage, hold cues, nothing fades to empty | **The visitor's brush.** The pointer is a brush loaded with the pigment of the specimen in view; strokes deposit chalky color on a fixed multiply canvas and never come off; every specimen passed also auto-stamps a small smear (so touch visits accumulate a record); the close frames the canvas as the newest specimen. Distinct from descent's lamp (reveals vs deposits) and maison's tray (authored tokens vs visitor-made marks) | High-key editorial museum-specimen photography, macro grain, bone-white seamless. First light canvas since `creator-portfolio`. Palette rule: chrome strictly achromatic ink `#1A1611` on bone `#F2EEE3`; ALL saturation belongs to the eight specimen hues and the visitor's smears. Fraunces + Instrument Sans, first use of either | 4509 |
| `maison` | Chaptered editorial. Three chapters as printed intertitle-plus-spread pairs, hard cuts between grounds, no interpolation anywhere | No bar. A folio in the top margin carrying the house and the current chapter, updating as chapters pass, suppressed on the title page and the colophon the way a running head is in print. Beside it a fixed margin tray (the accord) that accumulates. Neither is clickable; the page has no navigation, only position | **Title page.** Type on a paper ground, no media above the fold at all: masthead, one `h1`, and a contents list of three chapter names that arrives on the first notch of scroll. No scrub, no kinetic hero, no corner anchor | `kinetic > reveal > parallax > reveal > pan > reveal > kinetic > drift > pin > scrub > flow`, **11 acts, 13.38vh**. Both clips confined to one chapter; the intertitle `reveal` recurs as the chapter boundary and is never adjacent to itself | Full-screen paper **colophon plate** that bookends the title page: masthead rule, the ask set as a line of running text with an italic underlined link inside it, a spec list as museum-label rows, concept disclosure in the foot. Smallest type on the site. No spotlight, no magnet, no button island | **The accord.** Three empty vial marks sit in a margin tray from the first screen. Each chapter's spread stamps its own token as it is read, and the stamps never come off. At the turn the three tokens leave the tray, travel into the frame, stack into a column, compress, and hand over to the bottle that appears inside the footprint they just made; the labels re-set from `Pluie / Zeste / Fumée` to `Tête / Cœur / Fond` and the tray collapses to the scent's name. The visitor's scroll assembled the product | Macro texture (worlds.md #5) at millimetre scale. Grounds hard-cut paper `#E9E5DA` → wet slate `#0B0D0D` → bone `#F2F1EA` → ember `#12100C` → void `#070808` → paper. One citron accent hue at two lightness stops, `#C9D36A` on dark and `#57601F` on light, because the page alternates. Bodoni Moda and Archivo | 4507 |
| `orrery` | **Continuous world**, on the kit's **worldflight** mode. One handmade scale model of the Earth on a single `position:fixed` stage; the three destinations are places the camera falls into and climbs back out of. Zero acts, zero `sc-section`, and the only element in document flow is the spacer | The nav is a **map that is an object, not a readout**: a bearing dial on an instrument plate fixed bottom-left, wordmark at its hub, whose disc turns exactly **once** across the page and carries a pip at each destination's real longitude (135.8E, 73W, 4W), so a pip arrives under the needle when the flight does. **No number anywhere on the page**, which is the thing `descent` and `vesper-v2` had both spent. Three clickable stops; the current one is marked with an accent square, never recoloured | The world **at rest**. The model globe sitting still on a workbench under a slow push-in, with the `h1` at **display scale** (`--sc-t-3xl`, held to two lines) as the largest thing on the first screen. No chrome readout, no small headline, no kinetic split, no corner greet cue | **One worldflight track, ten legs, 11.97vh of film over a 12.97vh spacer.** **One pace for the whole flight**: every 5s leg carries 1.08vh and the 10s peak carries **2.25**, so the film advances at 0.212-0.225vh per second everywhere and never surges between legs (measured spread 6%, down from 36% on the first cut). `data-sc-seam` 0.16, `data-sc-lerp` 0.12. The peak buys its room by being **one leg carrying the page's only 10-second clip at slightly over double every other weight**, rather than by owning two adjacent legs the way `descent`'s did. Copy anchors run BL, BR, C, BR, BL, TL, ML, TL, never repeating adjacently; two of those anchors (TL, ML) are not in the kit | **A return, not an arrival.** The flight climbs off the model and lands back on the workbench it opened on, so the last frame rhymes with the first instead of reaching somewhere new. The CTA is a letterpress card resting in that light, beside the folded card and pencil that are actually in the shot. No spotlight, no magnet, no fade-out | **The elsewhere field.** Sixty markers for places this route is not going ride over the world for the entire page, parallaxed by their own depth. Sixteen are named and interactive. During the fall they **streak**: a radial burst driven off the page's own reading of `--sc-seg`/`--sc-segp`, tearing past the camera. **Point at one and it stops**: the held marker simply stops being written to, so it freezes exactly where it was while everything else keeps moving, and its name and one line arrive. Click or tab to keep it held, Escape releases. At the close every one of them lights vermilion in an index-ordered cascade under the line that says the list is too small | Handmade physical scale model, macro tilt-shift. Milled brass, painted plaster, real moss, poured resin, sifted sand, fibre-optic practicals. Cold off-black `#07080A`, vermilion `#F0492A` with one lifted stop `#FF7A5E` for small marks. Space Grotesk and IBM Plex Sans | 4510 |
| `scrollcraft-showcase` | **Typographic poster.** Type is the imagery; one Kie.ai material texture is visible only inside the peak letterforms. No photographic ground, scrub, card, rail, tilt, parallax, spotlight or magnet | **No navigation.** `SCROLLCRAFT` is set as composition-scale metadata and the hero word is the wordmark. No persistent chrome, progress, index or CTA above the close | A single real-text `SCROLL` fills the first screen at 24.5vw. Its characters breathe on opposing baselines as the pinned hero advances. No media, corner-anchored copy, scrub or separate logo | Engine acts `pin > flow > flow > pin > flow`; device score `kinetic > flow/in > reveal > bespoke pin > flow`. **5 acts, 10.8vh desktop / 10.5vh mobile**, zero video. The peak owns 4.4vh and the act before it is authored silence | Full-screen bone inversion in normal flow. Smallest type on the site, `Make one` as a plain underlined mail link, disclosure in a hairline footer. No button island, pin, spotlight, magnet or fade-down | **Borrowed momentum.** Page-local physics measures real scroll velocity and gives each `ALIVE` letter a different mass, offset, skew and settle rate. Fast motion breaks the baseline and reveals physical pigment; stillness returns all five letters to exact alignment. Fine pointers add a directional bias, touch keeps the velocity behavior, reduced motion shows the resolved form | Typographic material poster. Off-black `#070707`, bone `#F3F0E8`, cobalt `#174CFF`; Arial Black and Helvetica Neue. One generated physical cobalt-and-bone pigment image, confined to glyph interiors | 4508 |
| `phase` | **Split stage.** One fixed viewport carries matched cold and ready worlds for the full page; the seam is the composition and collapses only at the resolve | The divider is the only chrome: state labels, a six-dot clickable chapter rail, current marker and progress share one moving vertical seam. No bar, menu, numeric readout or CTA in chrome | The exact same full-bleed product frame exists twice at once, cold-filtered left and cobalt right, with a real-text `PHASE` crossing the seam at 22vw. No playback begins above the fold | `flow x6`, **11.0vh**. Image score `hero > hero > macro > macro > hand > table`; one custom-scrubbed five-second clip, zero engine scrub/pan/tilt. The peak owns 2.65vh after a 1.25vh authored silence act | The seam retreats from 62% to 0%, so READY physically takes the entire frame. `NOW.` and one dark full-width CTA land over the final product scene; concept disclosure sits in the same bottom rule. No spotlight, magnet or fade to empty | **Heatprint.** Pointer and touch paths bloom the cobalt ready-state photograph through a cold base, then expand and cool away. Scroll adds a deterministic heat front for touch and screenshots; reduced motion shows one stable partial bloom. Nobody else may take temporary thermochromic path painting whose reveal is the product behavior | Physical macro product campaign. Porcelain bone `#EEE9DD`, soot `#060808`, electric cobalt `#0C46FF`; one product invariant across six generated stills and one five-second macro shot | 4511 |

---

## What is taken

Read this before planning, not after. Each line is a shape that a new build
cannot reuse without spending one of its six dimensions.

- **Grammar:** filmic one-shot is used four times. The other seven grammars in
  uniqueness.md §2 are all unclaimed.
- **Nav:** fixed minimal top bar with a wordmark and exactly one CTA, four
  times. No build has yet tried app chrome, a folio, a waypoint map, an object
  index, a divider, a loud bar, or no nav at all.
- **Hero:** full-bleed `scrub` with corner-anchored kinetic type on a greet cue,
  four times. Spans cluster at 2.4 to 2.6vh.
- **Act shape:** 6 or 7 acts, 13.6 to 13.8vh, two `scrub` acts, one `pan` rail
  of `data-sc-tilt="6"` cards. Every build lands in the same band.
- **Close:** `pin` at exactly `data-sc-span="1.15"` with `data-sc-spotlight` on
  the stage and `data-sc-magnet="0.26"` on the CTA, four times.
- **Signature move:** claimed once, by `vesper-v2`: scroll as a playhead over a
  persistent trace rail with a piecewise-linear clock. Nobody else may take a
  scroll-position-as-time-axis rail; the rest of §3's list is still open.
- **Palette formula:** one dark-or-paper canvas plus exactly one accent, five
  times. Not a gate dimension, but the same reflex, and it is still worth
  breaking. `vesper-v2` bends it only by adding one semantic state colour.

Claimed by `airfield`, so also now taken:

- **Grammar:** rhythmic cutlist. Five grammars remain unclaimed (chaptered
  editorial, continuous world, typographic poster, gallery/catalog, split
  stage).
- **Nav:** a loud full-width bar whose content is itself the signature move.
- **Hero:** a still frame that cuts away in under a viewport, with the `<h1>`
  set small rather than at display scale.
- **Act shape:** 15 short acts at 13.19vh with **zero pinned acts of any kind**
  and no generated video. The old 13.6-13.8vh band and vesper-v2's ~12.1vh are
  still the things to avoid; ~13.2vh is now also spent, as is "6 or 7 acts".
- **Close:** an abrupt full-bleed accent slab with the CTA as the last cut.
- **Signature move:** split-flap character animation driven by scroll. Nobody
  else may take flipping-character type as their bespoke move.
- **Palette:** the one-canvas-plus-one-accent formula is finally broken. This
  page cuts to two full-bleed inverted grounds (a light one and a saturated
  accent one) mid-page. That option is now demonstrated, not taken.
- **Ground handling:** per-section painted backgrounds instead of
  `data-sc-drift`. Worth knowing: drift is scoped to the first act whose
  progress is strictly between 0 and 1, so on a page with several short acts on
  screen at once it lags roughly one section behind.

Claimed by `vesper-v2`, so also now taken:

- **Grammar:** live surface. Six grammars remain unclaimed (chaptered editorial,
  continuous world, typographic poster, gallery/catalog, split stage, rhythmic
  cutlist).
- **Nav:** app/console chrome with a scroll-bound readout, plus a fixed bottom
  rail acting as the page's navigation.
- **Hero:** the product surface already in a state, with no media and no
  display-scale headline.
- **Act shape:** 7 acts at ~12.1vh with **no** `scrub` act at all. The old
  13.6-13.8vh band is still the thing to avoid; ~12.1vh is now also spent.
- **Close:** a typed command prompt with a copy control.
- **Assets:** the first build with **zero** generated imagery. Uniqueness does
  not require a kie.ai spend, and a page that proves it is worth having in the
  table.

Claimed by `maison`, so also now taken:

- **Grammar:** chaptered editorial. Five grammars remain unclaimed (continuous
  world, typographic poster, gallery/catalog, split stage, rhythmic cutlist).
- **Nav:** a margin folio that names the current chapter, plus a persistent
  accumulating tray. Also the first build with a nav that is deliberately not
  clickable.
- **Hero:** a title page. Type on a ground with no media above the fold at all.
- **Act shape:** 11 acts at ~13.4vh, alternating light and dark grounds on hard
  cuts. The 13.6-13.8vh band and ~12.1vh are both still the thing to avoid; a
  build landing near 13.4 now has to differ elsewhere.
- **Close:** a full-screen colophon plate bookending the hero, CTA as running
  text inside a sentence.
- **Signature:** an accumulating margin tray whose contents merge into the
  product at the turn. Nobody else may take collect-then-assemble; it is
  distinct from `vesper-v2`'s rail in that nothing here is a time axis and
  nothing here is navigable.
- **Palette:** the first build to run one accent hue at **two** lightness stops,
  keyed to whether the current ground is light or dark. Any page that hard-cuts
  between light and dark grounds needs this; a single stop cannot clear 4.5:1 on
  both.
- **Type:** the first serif. Bodoni Moda, justified in BRIEF.md against
  taste.md's serif rule rather than reached for as a luxury reflex.

---

Claimed by `descent`, so also now taken:

- **Grammar:** continuous world, **and with it worldflight mode**. Five grammars
  remain unclaimed (chaptered editorial, typographic poster, gallery/catalog,
  split stage, rhythmic cutlist). Worldflight is not itself a grammar and a
  later build may need it, but a second continuous-world page would be the same
  page: this one has the water column, the depth axis and the route rail.
- **Nav:** a map. A fixed edge gauge with a scroll-bound numeric readout and a
  clickable waypoint list with a travelling position marker. This is close
  enough to `vesper-v2`'s scroll-bound console readout that the next build
  should treat "chrome that reports your scroll position as a number" as spent
  twice over.
- **Hero:** generated media already in motion on a fixed stage, with the
  headline set *small* on a `hero` greet window and a chrome readout as the
  largest element on the first screen.
- **Act shape:** no acts at all. **A nine-leg worldflight track, 8.18vh of legs
  over a 9.18vh spacer**, where the peak takes its room by owning two legs
  rather than by a longer span. The 13.6-13.8vh, ~13.1vh and ~12.1vh bands are
  still the ones to avoid, and ~9.2vh is now also spent. So is the shape itself:
  a page whose peak is two adjacent legs of one flight.
- **Close:** the flight keeps flying to the last pixel and lands somewhere new,
  with the CTA as an object inside the world rather than a button over it, on a
  window with no fade-out.
- **Assets:** the first build to use a **seam-locked chain** (nine legs: seven
  chained with `--tail` on kling, two more chained on start images only, every
  joint out of the encoded file at 22-45 dB PSNR) and the first to derive its
  poster ladder from the encoded clips themselves. Chaining is now spent; the
  SKILL.md warning against it stands for everyone else.
- **Signature move:** a pointer-driven mask that reveals the world, plus
  dwell-triggered particles. Nobody else may take "the pointer is the light".

---

Claimed by `scrollcraft-showcase`, so also now taken:

- **Grammar:** typographic poster. Gallery/catalog and split stage remain unbuilt.
- **Nav:** no navigation at all, with the wordmark absorbed into the composition instead of placed in chrome.
- **Hero:** one extreme-scale real-text word as the entire first screen, with character baselines breathing in opposing directions and no media.
- **Act shape:** 5 acts at 10.8vh desktop and 10.5vh mobile, zero video. Engine sequence `pin > flow > flow > pin > flow`; device score `kinetic > flow/in > reveal > bespoke pin > flow`.
- **Close:** a full bone inversion in normal flow, with the smallest type on the site and a plain underlined mail link.
- **Signature move:** measured scroll velocity gives letters different physical masses, breaking the baseline under speed and returning it to exact alignment under stillness. Nobody else may take velocity-responsive letter physics.
- **Assets:** one generated physical pigment still, never used as a ground and visible only through live text. This is distinct from both zero-imagery builds and full-bleed generated worlds.
- **Shared ground:** it shares zero video with `vesper-v2` and `airfield`, and a quiet small-type ending with `maison`; all six gated dimensions still differ from each of them.

Claimed by `pigment`, so also now taken:

- **Grammar:** gallery / catalog. Two grammars remain unclaimed (split stage; typographic poster went to `scrollcraft-showcase` in the same week).
- **Nav:** a clickable index of the collection's objects with per-object color swatches and a scroll-spy current marker. The museum-label chrome family (folio, index, colophon) is now well trodden; the next build should avoid margin-chrome entirely or do something else with it.
- **Hero:** the first object of the collection already in view, framed and labelled, `h1` as the object's name, no title treatment, no full-bleed media.
- **Act shape:** 9 acts at ~13.4vh with exactly one `scrub` and one `pan`, zero kinetic type, and one constant light ground. The ~13.4vh number is now shared with `maison` (they differ on every other shape property); treat both ~13.4 and "9 acts" as spent.
- **Close:** the last object in the collection is the visitor themself: a live canvas of their own accumulated marks framed and labelled on the collection's schema. Ending a page by accessioning the visitor is taken.
- **Signature move:** the pointer as a pigment-loaded brush depositing permanent marks, plus scroll-triggered auto-smears as the touch fallback, composited into the close. Nobody else may take cursor-paints-the-page or visitor-marks-become-the-product.
- **Palette:** an achromatic chrome with per-section object hues (eight saturated hues, none of them an accent role). A third way to break one-canvas-one-accent, after `airfield`'s inversions and `maison`'s two-stop accent.
- **Facts:** the first build whose copy is real-world history, web-verified at draft time (snail counts, 1964, 1826). Concept brands invent nothing; a factual catalog verifies everything.

---

Claimed by `phase`, so also now taken:

- **Grammar:** split stage. All eight documented grammars have now been built.
- **Nav:** the dividing seam as the only chrome, carrying opposing state labels,
  chapter ticks, current state, and progress while its own position changes.
- **Hero:** the exact same product frame simultaneously shown in cold and ready
  states, with one display-scale live headline crossing the seam.
- **Act shape:** six flow acts over 11.0vh, with one custom-scrubbed macro clip,
  a 1.25vh silence act, and a 2.65vh interactive peak.
- **Close:** the comparison mechanic resolves by physically giving the full
  viewport to one side. The divider retreats instead of cutting to a new page.
- **Signature move:** Heatprint, where touch and pointer paths temporarily bloom
  the ready-state product through its cold version, with deterministic scroll
  and reduced-motion fallbacks. The product behavior is the interaction.
- **Shared ground:** it shares cobalt, bone, and condensed grotesk type with
  `scrollcraft-showcase`; full-bleed generated photography with the early filmic
  builds; a fixed route rail with `descent`; and visitor marks with `pigment`.
  It clears the gate because its grammar, divider nav, simultaneous-state hero,
  six-flow shape, collapsing comparison close, and temporary thermochromic
  reveal are all different from every existing row.

---

Claimed by `orrery`, so also now taken:

- **Grammar:** continuous world for a **second** time, which is the one gate
  dimension it could not clear against `descent`. It clears the other five, and
  the two pages are not the same page: one is a water column with a depth axis,
  the other is an object on a table you fall into and climb off. A **third**
  continuous-world build has almost no room left and should pick another
  grammar.
- **Nav:** a map that is a physical instrument rather than a readout, turning
  once across the page against real longitudes, with **no number anywhere on the
  page**. That closes out the "chrome that reports your position" reflex in the
  other direction: `descent` and `vesper-v2` spent the numeric version, this one
  spends the analogue version.
- **Hero:** the world held still with a display-scale headline as the largest
  thing on screen. `descent` took world-already-moving with a small headline;
  those are now both gone.
- **Act shape:** ten legs, 11.97vh of film over a **12.97vh** spacer, every leg
  the same weight except the peak, which is the only long clip on the page and
  slightly over double the rest. The taken bands are now ~9.2, ~12.1, ~13.0,
  ~13.2, ~13.4 and 13.6-13.8vh. "Peak as one oversized leg" is spent, as is "peak as
  two adjacent legs".
- **Close:** a return to the opening frame. The page ends where it started, with
  the CTA as an object added to that first shot. Distinct from `descent`'s
  arrival somewhere new and from `maison`'s colophon bookend, which is a
  typographic rhyme rather than a spatial one.
- **Signature move:** a persistent population of *other* options that outnumbers
  the reader, is individually nameable, reacts by **stopping** rather than by
  lighting, and pays off as a mass cascade at the close. Nobody else may take
  "the things you are not choosing are on screen the whole time".
- **Assets:** the first build whose world is an explicitly **handmade physical
  model** rather than a photographic location or a code-rendered surface. It is
  how the owner's "tiny world, but not cheap" direction was resolved without
  reaching for the banned clay diorama, and it is worth reusing as a category:
  material truth (brass, moss, resin, glue seams) is what keeps a miniature from
  reading as a render.
- **Palette:** one hue at two lightness stops again, but for a different reason
  than `maison`. That page needed two stops because it alternates light and dark
  grounds; this one needs them because the accent is a **small mark** (a needle,
  a pip, a lit pin) over frames bright enough that the deep stop cannot clear
  3:1 at that size.

---

## Appending a row

After shipping, add one line to the table and one bullet to **What is taken** if
the build claimed something new. Fill every column. Say what the build shares
with existing rows, since the shared columns are the constraint the build after
this one inherits.

Rows are append-only. A build that has been superseded stays in the table,
because the space it occupies is still occupied.

---

## `lane`: PERKFORM, second variation

| Build | Grammar | Nav treatment | Hero device | Act-sequence shape | Close pattern | Signature move | World | Port |
|---|---|---|---|---|---|---|---|---|
| `lane` | **Rhythmic cutlist with a held overture.** Nine full-height hard-cut sections behind one act that pins. Shares the grammar cell with `airfield` and differs from it on the other five dimensions | **Two vertical Pulse Rails, one per margin, that merge into one.** Left COFFEE, right PROTEIN, each stamping named ticks as the acts that own them pass; a centred wordmark crowns them. No bar, no readout, no CTA in chrome. The rails are the only navigation and the ticks are its links | **A title alone, then a film.** Opens on a bare Roast Black ground with the `h1` centred at poster scale and nothing else on screen. As the reader scrolls, the title travels to the left column and settles while a ten-second locked-off clip fades up behind it and runs on a held stage across 3.5vh. No corner anchor, no kinetic split, no greet-over-footage: the type gets the first screen to itself | `pin(4.2) > flow x8` + one bespoke close, **10 sections / 9 engine acts, 12.91vh** (13.7vh at 390px). **Exactly one pinned act, and it is the first**: everything after act one is unpinned, under 1.4vh, with no `dwell`, no `pan` and no `scrub` device anywhere. Four clips scrubbed by page-local code, three of them simultaneously in one act, and two measured across their section's full height so a held stage keeps advancing as it leaves. Authored silence at 0.66vh directly before the peak | **The lane terminates in the ask.** The merged lane runs down into a bordered, blurred plate and stops in it: kicker, ask, one field, one button. Behind it a macro lid clip scrubs across the reachable range of the final section and arrives on its condensation frame. No gesture, no spotlight, no magnet, no fade-out | **The two-drink collapse.** Two chrome rails accumulate separately for two thirds of the page, then scroll drives them together: the ticks interleave into one column and the pair lands as the white Center Lane of the can. One rail carries the rest of the page. Distinct from `vesper-v2` (one horizontal time axis), `descent` (one depth gauge), `maison` (tokens that travel and stack), `pigment` (pointer deposits), `orrery` (markers that freeze), `airfield` (flipping characters), `phase` (pointer bloom) | Photoreal beverage campaign. **Six grounds, five hues**: Roast Black `#15110F`, Oat Cream `#F5EBDD`, Roast Brown `#3B241B`, Voltage Lime `#C8FF3D`, plus the three flavour colours as full-bleed plates. Archivo Black and Inter | 4512 |

Claimed by `lane`, so also now taken:

- **Nav:** margin chrome that is a *pair* and terminates by becoming one thing.
  Also the first nav whose items are the page's own argument rather than its
  sections.
- **Hero:** a staged overture. Title alone on a bare ground, then the title
  travels aside as the film fades up under it and runs on a held stage. The
  first screen of this page has no media on it at all.
- **Act shape:** exactly one pinned act, and it is act one. Worth knowing why
  the pin came back: an unpinned frame gives a clip 2vh of `--sc-p` at most, and
  a reader outruns ten seconds of footage inside that in one flick. If a page
  wants a film that plays out, the stage has to hold; the cutlist's 1.4vh cap
  and a ten-second shot cannot both be satisfied. The cap still governs acts two
  through ten.
- **Close:** an ask plate on a scrubbed macro, deliberately gestureless. Recorded
  because the build tried the alternative first and it failed a real reader: a
  pull-tab the visitor had to work out is the wrong ending for a landing page.
- **Signature move:** two chrome elements merging into one. Nobody else may take
  convergence-of-persistent-chrome as their bespoke move.
- **Palette:** six grounds and five hues, which is the furthest any row has gone
  from the one-canvas-plus-one-accent reflex.

What it shares, and what the next build has to avoid because of it: the
**rhythmic cutlist** grammar (with `airfield`) and **Archivo** as a display face
(with `maison`).
