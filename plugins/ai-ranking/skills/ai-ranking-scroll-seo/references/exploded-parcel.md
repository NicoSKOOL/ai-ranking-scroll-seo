# Exploded parcel (3D device)

A real 3D block of the actual ground, then one lot lifts out and fans apart into
labelled layers. Built for land, real estate, construction, landscaping, solar,
anything sold as "a piece of the earth". The terrain and aerial are real public
data; the lot boundary, utilities and building are illustrative and captioned so.

Reference build: Terrenos Arkansas, section "Your lot, layer by layer".

## Pipeline

```bash
# 1. real terrain + aerial for any US point (USGS 3DEP + NAIP, public domain)
python3 <skill>/scripts/terrain.py --lat 36.2944 --lon -91.5449 --size 700 --grid 128 --out assets/terrain/site
cp assets/terrain/site-height.bin assets/terrain/site.json public/terrain/
cwebp -q 68 -resize 1024 0 assets/terrain/site-aerial.png -o public/terrain/site-aerial-1024.webp
# 2. scene: copy templates/exploded-parcel.ts and exploded-parcel-props.ts into the build, set LOT (u, v, w, h
#    in 0..1 of the block, v from north) on an undeveloped patch next to a road
npm i three
```

`--size 700` (metres) with `--grid 128` gives ~5.5 m cells: enough relief to
read, small enough that a 100 m lot is visible. A 128² grid is 32 KB.

## Markup contract

```html
<section class="parcel" data-sc-act="pin" data-sc-span="3.4" style="--sc-span:3.4">
  <div data-sc-stage class="parcel__stage">
    <div class="parcel__head"><h2>...</h2><p>...</p></div>
    <figure class="parcel__figure"><img class="parcel__poster" ...><div class="parcel__canvas"></div></figure>
    <ol class="parcel__layers"><li class="parcel__layer">...</li> x5</ol>
    <p class="caption">Real terrain (USGS). Boundary, utilities and house illustrative.</p>
  </div>
</section>
```

Static (no JS, reduced motion, motion off, no WebGL2): poster + ordered list,
a normal document. 3D mode adds `.is-3d`: the canvas fills the stage and the
same `<li>`s become floating labels projected next to their layer.

## Loading rule (keeps Lighthouse at 95+)

Three.js is ~150 KB gzipped. Import it with a dynamic `import()` from an
IntersectionObserver with `rootMargin: '150% 0px'`, only in cinematic mode and
only if `getContext('webgl2')` succeeds. Lighthouse scores the first screen,
so nothing 3D is on that path. Result on the reference build: mobile
Performance unchanged (97-98), TBT under 100 ms.

The render loop reads `--sc-p` from the act's inline style (cheap), renders
only when progress changed, and stops while the section is off screen.

## Choreography that works

| p | What happens |
|---|---|
| 0 to .18 | the block rises from below |
| .16 to .34 | the lot boundary draws on the terrain (tube `setDrawRange`) |
| .30 to .50 | camera dollies from overview to the lot; terrain dims to 50% |
| .44 to .56 | the whole lot lifts out as ONE slice |
| .52 to .74 | it fans apart, top layers travel furthest; labels arrive per layer |
| .74 to .86 | hold: the money shot |
| .86 to .98 | the stack settles back and the house lands |

## Making the props read as real objects

First pass (plain boxes, a cone roof, no shadows) looked like placeholders on
camera. What fixed it:

- **Light:** `RoomEnvironment` through PMREM as `scene.environment` (intensity
  ~0.35) plus one warm directional sun with PCF soft shadows. Keep the shadow
  camera tight around the lot (±2.2 units): shadows only where the eye is.
- **Detail at the right scale:** a house = plinth, walls, glowing windows with
  sills, door, two roof slabs with overhang and gable ends, chimney, covered
  porch. A street = asphalt, curbs, dashed centre line, sidewalk, driveway. A
  power line = poles, crossarms, insulators, three sagging wires, transformer,
  service drop. Water = meter box and a pipe that follows the ground.
- **Plates:** layers that hold props (utilities, house) sit on a translucent
  plate shaped like the lot's terrain. Without it, props float in black and
  anything running away from the camera (pipe, driveway) reads as sticking up.
- **Push in at the hold:** between the explode and the collapse, the camera
  dollies ~45% closer and raises its target to the top of the stack, so the
  house and street fill the frame. Labels whose layer leaves the frame fade out.

## Real models (house, trees)

Primitive props read as toys once the camera pushes in. Replace them with
image-to-3D models, loaded after the scene first renders:

1. Generate an isolated reference per object with GPT Image 2.5
   (`--transparent`, three-quarter view from ~25 degrees above, whole object in
   frame, even overcast light, no cast shadow).
2. `fal.mjs model ref.png raw/house.glb --endpoint fal-ai/tripo3d/p2/image-to-3d`
   (or the default Meshy 7.1, USD 0.80 each). On the reference build Tripo P2
   gave the cleaner house (crisp siding, clean metal roof); Meshy's roof came
   out streaky. Meshy did well on trees. Render both in a lab page before
   choosing.
3. Compress: `npx @gltf-transform/cli optimize raw.glb public/models/x.glb
   --compress meshopt --texture-compress webp --texture-size 1024` (512 and
   `--simplify-ratio 0.35` for trees). 10-16 MB raw became 0.5-0.8 MB with no
   visible loss.
4. `templates/exploded-parcel-models.ts` loads with the meshopt decoder,
   grounds, centres and scales each model (`fit` by width or height, `rotY`
   before measuring, since the generator picks its own front: check the porch
   faces the street). Trees are clones of one loaded model, so six cost the
   same as one.
5. Keep the primitive props: the scene renders with them at once and swaps in
   the models when they arrive. A slow link never blanks the section.

Street surfaces get canvas-painted textures (asphalt speckle with wheel-track
wear, concrete slabs with joints): zero bytes, no request.

## Traps

- **Layers rising one after another from the bottom** pass through each other
  (the house ended up under the ground layer). Lift the whole stack, then
  spread with offset `i * GAP`: order is preserved at every frame.
- **Labels collide** when layers are closer on screen than a label is tall.
  Project, sort bottom-up, push each label above the previous one.
- **A soil slab under the lot pokes through dips** in the terrain before it
  lifts. Show it only once the lift starts.
- **The stack runs off the top** of the frame: aim the camera at the middle of
  the exploded stack, not the lot, and shift the frame with
  `camera.setViewOffset` (right on desktop so it clears the heading, down on
  phones).
- **python.org macOS Python has no root certificates**: terrain.py downloads
  with curl for that reason.
- **`PCFSoftShadowMap` is gone** in current three (warns, falls back). Use
  `PCFShadowMap` with `shadow.radius`.
- **Poster**: capture it from the page itself at p ≈ 0.8 with the head, labels
  and caption hidden, so static mode shows the same money shot.
