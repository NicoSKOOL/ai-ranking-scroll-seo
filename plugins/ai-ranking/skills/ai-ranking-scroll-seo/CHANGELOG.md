# ai-ranking-scroll-seo changelog

Dated notes on what changed in the skill and which build's finding drove it.
Entries before 2026-09-23 are inherited from scroll-craft (MIT). Builds carry a
`BUILD-REPORT.md`.



## 2026-09-23 (night): a hero video that moves

Nico: "why on earth did you make a still image as a video?" The first loop
animated only the back plate (covered by the still planes) and pinned the end
frame to the start, which froze it (0.75 mean change per second). Now: animate
the sky+forest composite unpinned (7.6 per second), ping-pong loop, fade the
still forest out when it plays. `fal.mjs video` no longer implies `--loop` is
the way to loop, and hero-depth.md adds a motion measurement to run before
showing a clip. Mobile Performance 95/97/95, desktop 99-100.

## 2026-09-23 (evening): real 3D models, 4K hero, living back plate

Nico: "can these be rendered better, and the images in the first fold are not
the best high quality". Terrenos Arkansas after the change: mobile Performance
99/97/97, desktop 100, everything else 100, verify-seo green.

- fal.mjs: `model` (image-to-3D, Meshy 7.1 or Tripo P2) and `video`
  (image-to-video, Kling v3 Pro, `--loop` pins the last frame to the first).
- New templates/exploded-parcel-models.ts: meshopt glb loader that grounds,
  centres, scales and rotates models; the scene swaps them in after the
  primitive props render. Canvas street textures. PCFShadowMap + radius.
- Tripo P2 beat Meshy 7.1 on the house (Meshy's roof was streaky); Meshy fine
  for trees. gltf-transform took 10-16 MB models to 0.5-0.8 MB.
- Hero: re-master planes via the edit endpoint at 3840x2160 `--quality max`;
  soften the foreground and clip its alpha to the old silhouette (the
  re-master added a mist blob over the headline).
- Phone crops at 640/768/1080w: 768 is the Lighthouse device's pick.
- Preload srcsets now come from images.json (a stale hand-written preload
  downloaded the hero twice). Only the LCP plane is fetchpriority=high.
- verify-seo: 1440w+ files get a 600 KB large-display cap (`--large-kb`)
  instead of a blanket exemption, so a 2560w plane is checked, not skipped.
- Video loop requested 3 s after load; at 170 ms it dragged mobile Performance
  to 87.

## 2026-09-23 (later): exploded parcel, a 3D device on real terrain

Nico: "it feels like it's missing a wow element". Added a Three.js section to
the Terrenos Arkansas build: a real 700 m block of Cherokee Village (USGS 3DEP
elevation, NAIP aerial), a lot boundary that draws on it, then the lot lifts out
and fans into five labelled layers (terrain, contours every metre, boundary,
utilities, house) and settles back. Lazy-loaded: mobile Performance 97-98.

- New: scripts/terrain.py, references/exploded-parcel.md,
  templates/exploded-parcel.ts.
- Layers rising one by one from the bottom crossed each other; lift the stack as
  one piece, then spread.
- Floating labels collided; project, sort bottom-up, push apart.
- python.org Python on macOS failed TLS to USGS (no root certs); fetch via curl.
- Nico: "render the house and street better, zoom in more". Props moved to
  templates/exploded-parcel-props.ts with real detail, environment light and
  soft shadows; prop layers got terrain-shaped plates; the camera now pushes in
  on the top of the stack at the hold. Mobile Performance unchanged.

## 2026-09-23: ai-ranking-scroll-seo 1.0 (fork) and the first gated build

Forked from scroll-craft 0.3.0 (MIT) as ai-ranking-scroll-seo. First build:
Terrenos Arkansas flagship home, es/en/pt, Astro, Cloudflare Workers static
assets. Final: Lighthouse 96-100 on all four categories plus Agentic Browsing
100, on mobile and desktop, for all three routes; verify-seo green.

Engine
- Cue and flow-reveal hiding now gated on `html.sc-js`. Before, every
  `[data-sc-cue]` was opacity 0 for everyone: crawlers, AI agents and no-JS
  readers got a page of empty stages. Template sets the class in `<head>`.
- Pinned-act height reserved in CSS from `style="--sc-span:N"`. Without it the
  page was short until the engine mounted, so lazy images five viewports down
  loaded during the hero's LCP window (mobile Performance 83).
- Counters: `data-sc-count-locale="auto"` (Intl, grouping always) and
  `data-sc-count-step`. "15.000" in Spanish parsed as 15, and the running
  value showed 5,545 on a price built from USD 500 instalments.

Page authoring
- A section class with `position: relative` on the `[data-sc-stage]` element
  silently beat `.sc-stage { position: sticky }` (same specificity, later).
  Every pinned act scrolled away and the contact sheet was mostly empty frames.
- Hero headline behind the forest plane: the lede and CTA were hidden at load on
  desktop. Plan the copy block to end above the plane's tree line at p = 0.
- Hero exit exposed the plane's solid under-fill as a flat band; a fade to the
  next section's ground over the last 25% of the act resolves it.

New scripts: fal.mjs (GPT Image 2.5 on fal, alpha, --ref edits, provenance
manifest), optimize-images.mjs (WebP, srcset truth, budgets on the shipped
width), verify-seo.mjs, lighthouse-gate.mjs (--staging, --runs), subset-fonts.py.
New references: seo-performance, schema, i18n, agentic, trust-mode.

Map dive (Nico's review, same day)
- Flight routes broke into stubs mid-zoom: `vector-effect: non-scaling-stroke`
  also rescales the dash pattern a `pathLength="1"` draw relies on. Drawn
  (dashed) strokes now divide their width by the live scale instead; plain
  outlines keep non-scaling-stroke.
- The dive now singles out the destination: routes fade, the map scales about
  the target region's centre onto a build-time `after` position, neighbours
  appear, the region outline draws, labels land. Points and labels that must
  keep their size live outside the zoom group and move by the same linear
  offset (a point under translate+scale moves linearly in the zoom factor).
- An SVG `<title>` shows as a hover tooltip over a full-bleed map; use
  `aria-label` on the `role="img"` svg instead.
- A custom property that reads another (`--zs` from `--S`) resolves where it is
  declared: set both on the same element.

Tooling
- `wrangler deploy` autoconfig added @astrojs/cloudflare to astro.config and
  moved output to dist/client; a stale `.wrangler/deploy/config.json` then broke
  the next deploy. Pin `output: 'static'`, remove the adapter, delete `.wrangler`.
- shoot.mjs times out on reduced motion when the page (correctly) never loads
  the engine; use a plain Playwright screenshot for static modes.

## 2026-09-04: approved ten-site rebuild, public release 0.3.0

The owner approved the rebuilt ten-site collection and requested that its process
become the standard. Added `references/approved-collection.md`: authentic brand
research, layer contracts, photographic/3D selection, complete compositing
assets, meaningful pointer and scroll choreography, independent page structures,
useful controls, compact-phone art direction, exact WebGL posters, and final
package verification. All ten sites are documented as worked examples.

Explicit creative delegation now supports an authored brief without a forced
interview. Page length is a pacing guideline rather than a filler quota. The
verification harness disables native pointer lock/capture before navigation.
The public release also includes the Sonder hero-depth reference. No engine
behavior or existing video-decoder fixes are changed in this release.


## 2026-09-01: skill renamed to `scroll-craft` to match the repo

The repo, the skill and the invocation now share one spelling. The skill was
`scrollcraft` (no dash) while the repo was `scroll-craft`, so the two never
matched. The skill directory, its frontmatter `name`, and the invocation are
now `scroll-craft`: invoke it as `/ai-ranking:ai-ranking-scroll-seo`.

The engine is deliberately left as `scrollcraft`. The files `scrollcraft.js`
and `scrollcraft.css`, the `.scrollcraft.json` workspace config, the
`SCROLLCRAFT_*` environment variables, and the default `scrollcraft` workspace
folder keep their names. Every build already made copies the engine files by
those names and resolves its workspace by that config, so renaming them would
break existing builds and setups for no real gain. The skill is `scroll-craft`;
its engine is `scrollcraft`.

## 2026-09-01: counters tick up on entry; fade-in documented properly

Asked for directly: "numbers tick up when they come into view." The count
device existed only inside pinned acts, scrubbed by act progress, so a stat
row in an ordinary flow section could not count at all. The flow fade-in
existed, but the devices.md example lacked the `data-sc-in` attribute that
makes it fire.

**Engine, `engine/scrollcraft.js`**

- A `[data-sc-count]` outside any `data-sc-act` now ticks once on entry
  (IntersectionObserver at half visibility, fires once) from the first value
  to the second over `data-sc-count-ms` (default 1400ms), cubic ease-out, same
  `formatNum` rules as the act counter. Reduced motion writes the final value.
  Act counters are unchanged.

**Docs**

- `references/devices.md` §7 gains "Numbers that tick up when they come into
  view", with the pairing rule (counter inside a `data-sc-in` stack).
- §8 example fixed to carry `data-sc-in`, plus "What a premium fade-in is made
  of".

## 2026-09-01: layered scenes documented under `parallax`

Driven by a live homepage rebuilt on a reference site's layered hero. Three
cut-out planes plus the product, rates measured from the reference DOM (far
lags 31%, mid 17%, product 20%, foreground and copy at 1x), and four rounds of
fixes that are now rules: planes solid below their silhouette, a shaped
foreground so the product's button survives the scroll, a faded section floor
over the clip line, `max-width: none` on planes, no transform transition on a
parallaxed element, new filenames for replaced art.

**Docs**

- `references/devices.md` §6 gains "Layered scenes: where the premium feel
  actually comes from".
- `SKILL.md` Step 3 lists "Layer the hero" among the things that decide premium
  versus generated.

## 2026-08-23: iOS clip priming hardened; real-device diagnostic added

Driven by a build whose hero clip sat frozen on the owner's actual iPhone
through four rounds of fixes while every headless probe reported it scrubbing.
The working clip further down the same page was the clue; the only difference
between them was being first.

**Engine, `engine/scrollcraft.js`**

- Each clip is primed at `loadedmetadata`, not only on a later gesture. A
  muted inline `play()` needs no activation outside Low Power Mode; where it
  is rejected, gesture listeners retry per clip until every clip is primed.
  (The previous one-shot first-touch prime lost a race: the reader touches to
  scroll while the hero is still downloading, and the shot was spent on a
  sourceless element.)
- `touchend` and `click` joined the prime listeners. The HTML spec's
  activation-triggering events include `touchend` but not `touchstart`, so a
  Low Power Mode phone gets a valid attempt when the finger lifts.
- The priming flag releases on a 2s timer. iOS may leave a `play()` promise
  pending forever, which jammed the retry permanently.
- A seek stuck past 700ms is re-issued. `tick()` skips a clip while
  `el.seeking` is true, so one hung seek froze that clip for the life of the
  page through the guard meant to protect it.
- The poster reveal fires on a 2.5s timeout as well as on `seeked`, so a clip
  whose `seeked` never arrives cannot stay invisible forever.
- `muted` and `playsInline` are set as properties at load time, not only as
  attributes; iOS treats the two differently.

**Docs and references**

- `references/verify.md`: new sections "The phone is a different machine"
  (what headless cannot see, what the engine now handles on iOS), "Ship the
  diagnostic with the site", and "Ask what differs before asking what's
  broken", plus three failure-table rows. Mobile named a first-class target.
- `references/device-diag.html`: standalone real-device scrub diagnostic.
  Suspect clip loaded two ways beside a known-good clip, MOVING / FROZEN
  verdict per pane, prime results and distinct-frame counts on screen. Edit
  its TESTS array and deploy beside the site on the first mobile report.
- `SKILL.md` Step 5 now states the real-device gap explicitly.

## 2026-08-22: bespoke fixed-stage verification state

Driven by the owner's cold-scroll finding on PHASE: "Nothing happens when I
start scrolling. Like literally nothing's happening in the first couple of
scenes." The first pass had passed mechanically because the experience used
`flow` sections as invisible scroll markers around a page-local fixed stage.
Ordinary flow is deliberately excluded from dead-scroll detection, so the
harness never inspected the stage's visible timeline.

**Harness: `scripts/shoot.mjs`**

- Reads optional `data-sc-verify-state` signatures from bespoke fixed stages
  and includes them in the dead-scroll signature.
- Flow spans carrying a custom state are now checked like pinned spans.
- Reads `data-sc-verify-hold="true"` as an explicit authored hold, including
  resolved closes and deliberately stable reduced-motion frames.
- The contract requires rendered values, not raw scroll progress, so a page
  cannot make a static composition pass by publishing a changing percentage.

**Docs**

- `references/verify.md` documents the custom-state contract, the authored-hold
  escape hatch, the reduced-motion rule, and the failure mode.

**PHASE correction**

- Opening act now moves the split, product scale and position, headline, and
  metadata from the first wheel gestures.
- The frustration act now transfers dominance from the burn state to the
  forgotten state while the seam crosses the cup.
- Act progress no longer clamps early; the close reaches a true 0% divider.
- Dense six-samples-per-act sheets replaced the earlier coarse pass.

## 2026-08-21: worldflight mode and the global smoothed playhead

Driven by the owner's verdict on the act-based continuous world: "awful... you're
literally going from scrolling down to static page and then you start scrolling
down again... weird clear page lines scrolling up... very cheap looking."
Mechanics ported from oso95/scroll-world.

**Engine: `engine/scrollcraft.js`**

- New page mode `data-sc-mode="worldflight"`: one `position: fixed` stage, an
  empty spacer as the only element in document flow, legs mounted for the life
  of the page, and scroll driving only the film timeline and overlay opacity.
- Spacer height is (sum of `data-sc-w` + 1) viewport-heights, set in pixels so
  the track and the `svh`-sized stage share a ruler.
- One-sided crossfade over a `data-sc-seam` band (default 0.12vh): the incoming
  leg fades up while the outgoing one holds opaque underneath, so the page
  ground never shows through a seam. z-index 120 for the current leg, 100 +
  opacity × 10 for the rest. No `src` swapping, ever.
- Per-leg `data-sc-linger`, a monotone dwell remap capped at 0.6 with fixed
  endpoints, so seam frames are never touched.
- Copy windows against the whole track: `hero`, `finale`, or a `from to` pair
  with a plateau. Only transform is `translateY`, capped at 4vh across a window.
  Pointer events gated above opacity 0.5.
- Legs prefetch within ±1.6vh; until a real frame paints, the poster carries a
  push-in (`scale(1.03 + local × 0.14)`).
- Waypoints published as `--sc-seg` / `--sc-segp` plus a bubbling `sc:waypoint`
  event. The engine renders no rail UI.
- Reduced motion: no clip is ever fetched, posters cross-dissolve through the
  same seams and windows, all transforms dropped.
- **Playhead retrofit, all scrub clips everywhere.** Every clip now lives in one
  `playheads` list walked by one rAF loop: lerp 0.18 per frame (`data-sc-lerp`,
  clamped 0.02 to 1, 1.0 under reduced motion), 8ms/20ms deadband, seek coalescing,
  offscreen clips skipped within 0.002. Replaces the act-only 0.16 loop. Act
  behaviour is otherwise untouched.
- iOS priming: one muted play-pause across every clip on the first touch or
  pointer down, so a seeked-but-never-played clip is not left blank.
- `ScrollCraft.instances` collects mount handles, so the harness can ask whether
  the playhead has arrived instead of guessing with a timeout.
- Warns when a worldflight stage does not compute `position: fixed`, the same
  silent failure as an unpinned act one level worse.
- Synced byte-identical to all eight build folders and `cmp`-verified.

**Engine: `engine/scrollcraft.css`**

- `.sc-world`, `.sc-world__seg`, `.sc-world__poster`, `.sc-world__copy`,
  `.sc-world__scrim`, `.sc-world__spacer`, and `[data-sc-copy]` pre-paint state.
- `video[data-sc-scrub].sc-has-clip` lights a leg's clip, since a worldflight
  clip has no ancestor act to light it through.
- Reduced motion drops the poster push-in and the copy drift.

**Harness: `scripts/shoot.mjs`**

- Detects `[data-sc-mode="worldflight"]` and switches sampling to the track:
  per-leg fractions at the same density as per-act, plus four positions across
  every seam.
- `settle()` now waits for the playhead to ARRIVE (|cur - target| < 0.002 and not
  seeking) via `ScrollCraft.instances`, falling back to the old currentTime-goes-
  quiet method. Without this every worldflight frame is shot mid-lerp and no run
  is repeatable.
- Dead scroll for worldflight is no leg advancing `currentTime`, no crossfade
  progress, and no copy-window opacity change across a gap of 0.12vh. Skipped
  under reduced motion, where each leg holds one still frame by design.
- New findings: legs that never reach full opacity, and legs stuck on poster
  (suppressed under reduced motion).
- Cue and contrast passes now cover `[data-sc-copy]` alongside `[data-sc-cue]`.
- The fixed-chrome hide before the contrast shot skips anything inside
  `[data-sc-world]` or `[data-sc-world-copy]`: that stage IS the background
  behind every line and that layer carries the scrim, so hiding them graded the
  copy against the page ground and failed a page that looks fine.

**Docs**

- New `references/worldflight.md`: the mode, its attributes, the track maths,
  the one-sided seam, the copy-window contract, the waypoint contract, the seam
  law for assets (chain on start images only; connector frames via
  `ffmpeg -sseof -0.15` from the ENCODED mp4), GOP 8 / GOP 4, the ±1.6vh
  prefetch window, and a hard-rules table.
- `references/uniqueness.md` §2.4: the continuous-world grammar now REQUIRES
  worldflight mode, and says why, quoting the verdict on the act-based attempt.
- `references/devices.md` §1: new "The playhead is lerped" section covering the
  0.18 rate, the deadband, seek coalescing and `data-sc-lerp`.

**Verification**

- New rig at `OtherWorlds/Ultimate Websites/lab/worldflight-rig/` (3 descent legs,
  hero/mid/finale copy, page-drawn route rail) on port 4520, with
  `lab/worldflight-assert.mjs`: 24/24 assertions pass.
- `shoot.mjs` green on the rig desktop and reduced motion; no dead scroll, all
  three legs reach full opacity and paint a real frame, all copy clears 4.5:1.
- Regression on four act builds (perkform 4500, creator-portfolio 4501, vesper-v2 4504,
  maison 4507): all green, frame counts and poster counts identical to the
  pre-change baselines, zero console errors, zero weak cues.

## 2026-08-21: consolidation after the showcase trio (descent, airfield, maison)

**Engine: `engine/scrollcraft.js`**

- `focusin` now centres a focused control that sits inside a `[data-sc-act]` when
  its own cue computes under 0.85, with `behavior: 'instant'` because
  `scrollcraft.css` sets `scroll-behavior: smooth` and the default animated a
  multi-screen glide with focus off screen throughout. Promoted from airfield's
  page-local handler and guarded to the act stack. Verified: fixes the `flow`
  case; does **not** fix a pinned act, where the sticky stage means centring
  scrolls backwards out of the act and leaves the cue dark. That residue is
  documented in `verify.md` rather than fixed, because the correct scroll target
  needs an inverse of `dwell()`. (airfield, with the limit measured on descent's
  reported case)
- Synced byte-identical to all eight build folders.

**Harness: `scripts/shoot.mjs`**

- Null guard on the clip's owning act: `(v.closest("[data-sc-act]") ?? v)`. A
  `video[data-sc-scrub]` outside the act stack, which is the legitimate shape for
  a continuous world, threw a `TypeError` and took the whole run down before it
  wrote anything. Confirmed the old expression throws and the new one returns a
  boolean. (descent)

**Encoding: `scripts/encode.sh`**

- CRF is now overridable: fourth positional argument, or `SCROLLCRAFT_CRF`,
  positional winning. Defaults unchanged at 20 desktop / 24 mobile, and the
  echoed summary reports the value used. `assets.md` recommends 22-23 for
  grain-heavy worlds, which previously meant not using the script. (descent)

**Docs: `references/devices.md`**

- §2 `pin`: minimum useful span is ~1.2. At span ≤ 1 a pinned act has one pixel
  of travel, so progress jumps 0 to 1 and every cue and reveal inside it snaps.
  (maison)
- §4 `reveal`: `clip-path` is relative to the border box, so a reveal on type
  with `line-height` below 1 eats the ascenders and descenders and renders a
  figure as a plain bar. Give it room or wrap it. (maison)
- §10 `drift`: documented the scoping rule. Drift belongs to the first act whose
  progress is strictly between 0 and 1, so on a page of short acts several
  qualify at once and the ground lags a full section. Paint grounds per section
  instead, which is what a cutlist or chaptered page wants anyway. (airfield,
  with maison's §2.2 conflict resolved the same way)

**Docs: `references/taste.md`**

- Colour: redefining `--sc-ink` on a subtree does not re-ink text whose `color`
  already computed on `<body>`. Restate `color` on the subtree. (airfield)
- Colour: the "lock the accent" rule gains its exception. A page that hard-cuts
  between light and dark grounds may carry a two-stop accent, one hue at two
  lightnesses keyed to the ground. Still one accent per ground. (maison)
- Text over media: `width`/`height` HTML attributes are presentational hints and
  come in pairs. Overriding only one in CSS lets the other resolve to the
  attribute's pixel value. The reference template ships both, so this is a trap
  the template hands to every build. (maison)

**Docs: `references/uniqueness.md`**

- §2.8 rhythmic cutlist: named the peak collision. The grammar bans `pin` and
  `dwell` while feel.md demands the peak hold. Resolution is to hold in the fixed
  chrome layer and keep every act short and unpinned, generalised to "move the
  peak out of the act stack rather than breaking the grammar". (airfield)

**Docs: `references/verify.md`**

- Cue fade-outs should land between harness sample positions, or the sheet shows
  half-faded type that nothing grades. Fix `rampOut`, not the sampling. (descent)
- Keyboard section rewritten to say exactly what the engine's `focusin` handler
  covers and what it does not, with the pinned-act measurement.
- Six new rows in the failure table for the findings above.
- Credit accounting: per-call sums overstate real spend, same reason the probe
  delta overstates in the other direction.

**Docs: `references/assets.md`**

- seedream's aspect ratios: `16:9`, `9:16` and `3:4` verified working, `4:5`
  rejected with an error that does not list the alternatives. Returned pixel
  dimensions are near the ratio, not exact. (maison)
- Unit costs reframed as published planning rates. Two ledger reconciliations put
  actual debits at roughly 0.4x the per-call sum (1447 vs 530, 2252 vs 856), so
  every budget cap in the skill is conservative and a per-call sum must not be
  reported as measured spend. (orchestrator's ledger reconciliation)

**Verification**

Desktop and reduced-motion harness passes re-run on descent (4505), airfield
(4506) and maison (4507) after the engine sync. All six green: no dead scroll,
all cues clear 4.5:1 at their worst frame, no console errors, no failed
requests, and every clip reports `poster` under reduced motion.

## 2026-08-21: triage of three parallel builds (creator-portfolio, agency, saas)

**Engine: `engine/scrollcraft.js`**

- `data-sc-count` strips thousands separators before parsing, so a target can be
  written the way it should render (`"0 3,500"`). Previously any real figure
  between 1,000 and 9,999 was unrenderable. (creator-portfolio, merged from its local patch)

**Engine: `engine/scrollcraft.css`**

- Reduced motion no longer zeroes a `pan` rail into missing content. The stage
  becomes a native `overflow-x: auto` scroll region with proximity snapping, so
  every item stays reachable without motion. (agency and creator-portfolio both hit it;
  perkform and saas both had the hole)
- `.sc-scrim--trail` switches to a bottom band below 860px, where `.sc-copy--trail`
  re-anchors left and spans the full width. It was darkening the corner the copy
  had just left, which guaranteed a mobile contrast failure over any bright clip.
  (saas)
- New `.sc-scrim--band` utility: a bottom band, transparent above 58%, for copy
  that spans the frame. (saas)

**Harness: `scripts/shoot.mjs`**

- Cue opacity reads a kinetic heading through its `.sc-split__i` line units. The
  engine forces the element to 1, so kinetic headlines were reported as peaked on
  frames where every line was at 0. (agency)
- Contrast is direction-aware: the ink is compared to the mean background and
  graded against the darkest patch when it is dark type, the brightest when it is
  light type. A high-key page was being graded against its most lenient possible
  reading. Ported from the working checker creator-portfolio shipped at
  `lab/min-contrast.mjs`, along with its two corrections: the sampled rect is
  clamped to the viewport, and `position: fixed` chrome is hidden with the text
  because it paints in front of what scrolls under it. (creator-portfolio)

**Docs**

- `devices.md` §2: only the last act may use a one-value hold cue; a middle act's
  hold stays lit through the un-pin slide and crosses the header. (saas) Plus the
  "ground or greet" rule for any pinned act (agency) and the `"0 1 0 0"` greet-and-hold
  form (agency).
- `devices.md` §3: reduced-motion behaviour of `pan`, and the rail's copy
  constraint (headings are read cropped). (agency, saas)
- `devices.md` §6: `data-sc-parallax` documented in its real unit, hundreds of
  pixels rather than viewport fractions, with usable ranges. (agency)
- `devices.md` §7: `count` is unavailable to concept, fictional and pre-launch
  brands, because every number would be invented. (saas)
- `devices.md` §8: a flow section after a pinned act takes reduced padding. (saas)
- `devices.md` §9 and `references/template.html`: `magnet`, `parallax` and `cue`
  all write `transform` and cannot share an element; `data-sc-rise="0"` is the
  guard. The template taught the collision by example. (creator-portfolio)
- `assets.md`: a section on real supplied footage (measure with `signalstats`,
  expand levels in the pre-encode intermediate, trim before anyone walks into
  frame, target 24-30fps, never stream-copy). (creator-portfolio)
- `assets.md`: portrait `<picture>` poster-swap pattern and the hand-written
  ffmpeg portrait/crop recipe, since `encode.sh` has no portrait mode. (agency)
- `assets.md`: grain-heavy worlds run about double the size estimate; measured
  kie.ai unit costs (seedream 5-pro still 28, kling v2-1-pro 5s 160). (agency, saas)
- `worlds.md`: what inverts when the canvas is light (scrim direction, ink over
  media, `--sc-edge`, shadow alphas). (creator-portfolio) Naming the empty space is now
  stated as a per-shot requirement. (saas)
- `taste.md`: the positive case behind "no full-frame overlay" (corner, band,
  column, and masking the image away from the text), and stepping the hero
  display size down below ~700px. (agency, creator-portfolio, saas)
- `verify.md`: how the contrast pass now works, its four known limitations,
  checking that reduced motion did not delete content, and the fact that probe
  deltas cannot attribute credit spend when builds run in parallel.

**Deferred, deliberately**

- `kie.mjs probe --since <baseline>` and per-call cost logging. Documented in
  `assets.md` and `verify.md` instead.
- A `portrait` mode for `encode.sh`. The ffmpeg recipe is in `assets.md`.
- Keying harness cue rows by act and element rather than by text, and the 0.85
  opacity gate on the contrast pass. Both are real, neither blocked a build;
  written down in `verify.md` as known limitations.
- Lowering the `--sc-t-4xl` floor. It is a token every build inherits, and the
  fix belongs in a page's own phone media query.

## 2026-08-21, later the same day

- Reduced motion now settles `data-sc-reveal` wipes (`clip-path: none`), the
  same floor the block already applied to parallax, pan and kinetic type. Found
  by the creator-portfolio build; re-verified green on the three reveal-using builds
  (agency, creator-portfolio, vesper-v2).
- `references/uniqueness.md` added: the structure axis. Eight page grammars, a
  mandatory Step 0 interview, a required per-build signature move, and the
  fingerprint gate against `Ultimate Websites/FINGERPRINTS.md`. Driven by the
  owner's verdict that four builds shared one skeleton.
- Live-surface honesty rule: the labelled-sample-data escape is spelled out
  (vesper-v2's route to the grammar for a concept product).
- Ground-or-greet extended to any progress-gated content on a pinned act, not
  just engine cues.
- verify.md: two new measured failures (reduced-motion rail snap-centring a
  single wide track; keyboard focus landing off-screen on pinned acts) and the
  note that a shoot.mjs run can take the background server down with it.

## 2026-08-22: the `orrery` build (travel, continuous world)

First run of the skill start-to-finish as a new user would meet it: interview
first, nothing generated until the eight answers existed. Three findings, all
of them things that cost a full iteration to discover.

- **A scrim parented to the copy block is invisible to the contrast pass.**
  `shoot.mjs` hides `[data-sc-copy],[data-sc-copy] *` to photograph the film
  underneath a line, and `visibility: hidden` takes an element's `::before` with
  it. A per-block scrim written as `.copy::before` is therefore never composited
  into the measurement: six blocks reported 1.2-1.9:1 against means of 7-13:1,
  and **strengthening the scrim changed the reported numbers by exactly zero**,
  which is the tell. The identical-numbers-after-a-real-change signature is
  worth knowing on its own. Fix: the scrim must be a **sibling** of the copy
  block. `orrery` mounts one soft plate per block into the copy layer and drives
  its opacity from the block's own inline opacity, so it tracks the engine's
  window for free. Written up in taste.md and verify.md.
- **The worldflight spacer is sized once, inside mount, and a viewport that
  reports height 0 at that moment leaves the page with no scroll track at all.**
  The engine writes `height: 0px`, every mechanical check still passes, and the
  page looks like a frozen still. Seen in an embedded preview pane; a single
  dispatched `resize` corrected it to the exact expected 10.5vh. Page-level fix
  (the engine is not edited): dispatch a resize on `load` and on
  `document.fonts.ready`. That second one also absorbs the reflow when a webfont
  swaps in, which changes every copy block's measured height.
- **`encode.sh` finds a full ffmpeg, but the poster step in `assets.md` calls
  bare `ffmpeg`.** On a machine whose PATH ffmpeg is a stripped build, the
  documented `-frames:v 1 ... poster.webp` fails with "Unable to choose an
  output format", which reads like a filename problem rather than a missing
  muxer. Use the same resolved binary `encode.sh` uses. Also: PSNR seam checks
  need that binary, since the stripped build has no `psnr` filter.

Build notes worth carrying: the owner asked for a "tiny world" that does not
look cheap, which is one word away from the banned clay diorama. Resolving it as
a **handmade physical scale model** shot macro (brass, painted plaster, real
moss, poured resin, sifted sand, visible glue seams) satisfied both, and the
negative list in the preamble did the work. Ten legs chained head-to-tail on
pre-generated anchors rather than sequentially off encoded tails: every joint
came back 28.5-39.8 dB, inside the band `descent` shipped at, and all ten clips
generated **in parallel** instead of in a 45-minute serial chain.

Also confirmed the harness will happily photograph a **different site** if the
port is already occupied by another build's server. `serve.mjs` exits
EADDRINUSE in the background while `shoot.mjs` gets a clean 200 from the
squatter and produces a full, plausible, entirely wrong contact sheet. Check the
served `<title>` before trusting a run.

### Pacing pass, same day (owner note on `orrery`)

> "when you're building fly-through worlds like this, and most of the times when
> you're doing things with scroll, you need to slow it down a bit... it needs to
> feel smoother and consistent."

Two faults hide under "not smooth", and the skill only had guidance for one.

- **Inconsistent pace.** `orrery` shipped its first cut with leg weights from
  0.70 to 0.95vh for identical 5-second clips, a 36% spread in how fast the
  world moved per pixel. Nothing in the skill said to hold `weight / clip
  seconds` constant, so nothing caught it. Now a hard rule in worldflight.md,
  with `orrery` normalised to a 6% spread.
- **Too fast.** The `~1.5vh per 8s` line was being read as a target when it is a
  dead-scroll guardrail. It yields 0.14-0.19vh per second of film, which is
  brisk for a page the reader is steering. worldflight.md §7c now names
  **0.21-0.22vh/s as the floor for a fly-through** and says plainly that
  exceeding the guardrail is fine as long as the harness confirms no dead
  scroll. It did, at both viewport sizes.
- **`data-sc-lerp` 0.18 is the wrong default for this mode.** 0.12 is now the
  documented worldflight value, alongside a wider `data-sc-seam` (~0.16). The
  damping is what removes wheel judder; the weights are what remove the surging.

feel.md §5 gained the exception it was missing: pacing variety is how an act
page carries feeling, and a continuous world is the one grammar where it is
wrong. There the peak carries the shape by being the single long leg.

Also recorded: changing any weight moves every leg boundary, so every
`data-sc-window` must be recomputed and then re-checked against the frame it was
tuned to. `orrery`'s labels were re-verified on screen at Kyoto and Erg Chebbi
after the repace.

---

## Clip time is not cue time (the frozen-clip class)

Reported from a real read of `agency` / Fallowbank: "scenes are moving with a
scroll, but then they stop and then the whole site starts to move, so now we're
seeing an image that's still."

A pinned stage is on screen for one viewport **before** its pinned travel starts
and one viewport **after** it ends. Act progress `p` is 0 across the whole entry
slide and 1 across the whole exit slide, so a clip driven by `p` is parked on its
first frame while the stage slides in and on its last frame while it slides out.
The reader scrubs a film, the film stops, and the page then slides a still
photograph past them.

**What changed**

- **The engine now maps clip time across the stage's entire visible life by
  default**, with both ends clamped to scroll that actually exists so a hero at
  document top still starts on frame one and an act near the bottom still reaches
  its last frame. Cues still use `p`, because cues belong to the pin.
  `data-sc-clip-map="travel"` is the opt-out. The old `data-sc-runout` opt-in is
  accepted and ignored: it addressed only the exit half, and it was opt-in, which
  is why three of four builds carrying a scrub act shipped frozen anyway.
- **`shoot.mjs` samples each scrub act's entry and exit slides.** It previously
  sampled pinned acts only at `top + (h - vh) * p`, which never visits either
  slide. That sampling gap is the whole reason this survived four builds of
  verification: the defect lived precisely where the harness never looked.
- **New FROZEN CLIP finding**, graded against stage visibility rather than act
  progress. First/last-frame holds always report; mid-clip holds only report once
  they outlast a plausible `dwell` settle. Skipped under reduced motion.

**Validated, not assumed.** The detector was proven to discriminate before being
trusted: it fires on a clip deliberately opted out with `data-sc-clip-map="travel"`
and stays silent on the clip beside it in the same page.

**Do not pair this with a shorter dwell.** Dwell moves fast at the edges and
settles in the middle, which is exactly the shape the new mapping wants: fast
motion on the two slides, the settle inside the pin where the copy lands.

**Also found, unrelated and pre-existing:** `creator-portfolio`'s hero paragraph fails
contrast from `y=0` (1.01:1, dark ink over dark foliage in the sky clip). The new
slide sampling surfaced it; the old engine fails it identically, so it is not a
regression from this change.

## 2026-08-22, portability pass (v0.2.0)

The skill assumed one person's repo layout. Five references pointed at
`OtherWorlds/Ultimate Websites/`, so the fingerprint gate and the worked
worldflight rig dead-ended on every other machine. Packaging it as a plugin made
that a real defect rather than a note.

The fix is **not** a second templatised copy of the skill. Two copies drift, and
this one proved it inside a day: five files diverged between the working skill
and its published copy within an hour of the first push. There is one skill, and
it resolves its paths instead of assuming them.

- **`scripts/workspace.mjs`.** Resolves the workspace that holds builds and the
  registry: `SCROLLCRAFT_HOME`, then the nearest `.scrollcraft.json` walking up,
  then `<project root>/scrollcraft`. `--ensure` creates it and seeds an empty
  registry. Builds are `<workspace>/builds/<name>/`, the registry is
  `<workspace>/FINGERPRINTS.md`, and neither is hardcoded anywhere any more.
- **The registry is per-user and starts empty.** The gate exists to stop you
  repeating *yourself*, so a new user's first build has nothing to clear and
  every build after it does. Gating a newcomer against somebody else's twelve
  rows would block them out of grammars they have never used, which is the
  opposite of the point. `templates/FINGERPRINTS.md` is the seed; the author's
  twelve-row table ships separately as `EXAMPLES.md`, explicitly as
  illustration rather than constraint.
- **`scripts/doctor.mjs`.** Preflight, run before the interview. Checks node, a
  full ffmpeg build, playwright, Chrome, the API key and the resolved workspace,
  and separates required failures from optional ones. It exists because the
  three most common setup faults all surface later as misleading errors: a
  stripped ffmpeg reports a missing filter as a syntax error, a missing webp
  muxer reports as a bad filename, and playwright resolves from the wrong
  directory. On the author's machine it correctly picks the 585-filter build
  over the stripped one first on PATH.
- **`scripts/worldflight-assert.mjs` now ships with the skill.** It was
  URL-driven and generic all along, sitting in a lab folder nobody else had.
  Run it against any worldflight page before the contact sheet.
- **The API key is documented as optional in the right place.** Generation costs
  real money; a build from the user's own photos and footage needs no key and no
  spend, and that is now stated as a first-class route in Bootstrap rather than
  implied.

Nothing moved on the author's machine: a two-line `.scrollcraft.json` at the
project root points the workspace at the existing `OtherWorlds/Ultimate
Websites`, so twelve builds and the live registry resolve exactly as before.
