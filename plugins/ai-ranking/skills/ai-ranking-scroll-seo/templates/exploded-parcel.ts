// Exploded parcel: real Cherokee Village terrain (USGS 3DEP + NAIP) as a 3D
// block; an illustrative lot lifts out and separates into labelled layers.
// Loaded on demand (see mountParcel in page.ts), so none of this is on the
// first-paint path. Progress comes from the engine's --sc-p on the act.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { buildStreet, buildUtilities, buildHouse, buildTrees } from './exploded-parcel-props.ts';
import { loadModel, place } from './exploded-parcel-models.ts';

type Meta = { grid: number; min_m: number; max_m: number; size_m: number };

const SIZE = 10;            // world units across the block
const EXAG = 2.6;           // vertical exaggeration so 47 m reads on screen
const BASE = -1.1;          // bottom of the soil slab
const LOT = { u: 0.56, v: 0.655, w: 0.15, h: 0.105 }; // illustrative lot (0..1, v from north)
const GAP = 0.68, LIFT = 0.9;

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const smooth = (x: number) => { x = clamp01(x); return x * x * (3 - 2 * x); };
const range = (p: number, a: number, b: number) => smooth((p - a) / (b - a));

export async function mountParcel(section: HTMLElement) {
  const stage = section.querySelector<HTMLElement>('.parcel__stage')!;
  const canvasHost = section.querySelector<HTMLElement>('.parcel__canvas')!;
  const labels = [...section.querySelectorAll<HTMLElement>('.parcel__layer')];
  const small = matchMedia('(max-width: 860px)').matches;

  const [meta, buf] = await Promise.all([
    fetch('/terrain/cv.json').then(r => r.json() as Promise<Meta>),
    fetch('/terrain/cv-height.bin').then(r => r.arrayBuffer()),
  ]);
  const N = meta.grid;
  const raw = new Uint16Array(buf);
  const metresPerUnit = meta.size_m / SIZE;
  const hm = (i: number) => meta.min_m + (raw[i] / 65535) * (meta.max_m - meta.min_m);
  const yOf = (m: number) => ((m - meta.min_m) / metresPerUnit) * EXAG;
  // bilinear height in metres at (u, v), v from north
  const heightAt = (u: number, v: number) => {
    const x = clamp01(u) * (N - 1), y = clamp01(v) * (N - 1);
    const x0 = Math.floor(x), y0 = Math.floor(y), x1 = Math.min(x0 + 1, N - 1), y1 = Math.min(y0 + 1, N - 1);
    const fx = x - x0, fy = y - y0;
    const a = hm(y0 * N + x0), b = hm(y0 * N + x1), c = hm(y1 * N + x0), d = hm(y1 * N + x1);
    return (a * (1 - fx) + b * fx) * (1 - fy) + (c * (1 - fx) + d * fx) * fy;
  };
  const wx = (u: number) => (u - 0.5) * SIZE, wz = (v: number) => (v - 0.5) * SIZE;

  // ---- renderer / scene --------------------------------------------------
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, small ? 1.5 : 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  canvasHost.appendChild(renderer.domElement);
  renderer.domElement.setAttribute('aria-hidden', 'true');

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(small ? 42 : 34, 1, 0.1, 200);
  // soft image-based light for the props, a warm low sun for shadows
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.35;
  scene.add(new THREE.HemisphereLight(0xfdf1dc, 0x1c3a31, 0.9));
  const sun = new THREE.DirectionalLight(0xffe2b8, 2.4);
  scene.add(sun, sun.target);

  const tex = await new THREE.TextureLoader().loadAsync(small ? '/terrain/cv-aerial-1024.webp' : '/terrain/cv-aerial-1024.webp');
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());

  // ---- terrain block -------------------------------------------------------
  const block = new THREE.Group();
  scene.add(block);
  const tg = new THREE.PlaneGeometry(SIZE, SIZE, N - 1, N - 1);
  tg.rotateX(-Math.PI / 2);
  const tp = tg.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < tp.count; i++) tp.setY(i, yOf(hm(i)));
  tg.computeVertexNormals();
  const terrainMat = new THREE.MeshStandardMaterial({ map: tex, roughness: 1, metalness: 0 });
  const terrainMesh = new THREE.Mesh(tg, terrainMat);
  terrainMesh.receiveShadow = true;
  block.add(terrainMesh);

  // soil skirts: four walls from the terrain edge down to BASE
  const skirt = (pts: [number, number][]) => {
    const pos: number[] = [], col: number[] = [], idx: number[] = [];
    const top = new THREE.Color(0x6b4a2e), bot = new THREE.Color(0x2a1a10);
    pts.forEach(([u, v], k) => {
      const y = yOf(heightAt(u, v));
      pos.push(wx(u), y, wz(v), wx(u), BASE, wz(v));
      col.push(top.r, top.g, top.b, bot.r, bot.g, bot.b);
      if (k) { const a = (k - 1) * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
    });
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    g.setIndex(idx); g.computeVertexNormals();
    return new THREE.Mesh(g, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1, side: THREE.DoubleSide }));
  };
  const edge = (f: (t: number) => [number, number]) => Array.from({ length: N }, (_, i) => f(i / (N - 1)));
  block.add(skirt(edge(t => [t, 0])), skirt(edge(t => [t, 1])), skirt(edge(t => [0, t])), skirt(edge(t => [1, t])));

  // ---- the lot and its layers ---------------------------------------------
  const cu = LOT.u, cv = LOT.v;
  const lotY = yOf(heightAt(cu, cv));
  const lotCentre = new THREE.Vector3(wx(cu), lotY, wz(cv));
  const lotSurface = (seg = 24) => {
    const g = new THREE.PlaneGeometry(LOT.w * SIZE, LOT.h * SIZE, seg, seg);
    g.rotateX(-Math.PI / 2);
    const p = g.attributes.position as THREE.BufferAttribute, uv = g.attributes.uv as THREE.BufferAttribute;
    const hs: number[] = [];
    for (let i = 0; i < p.count; i++) {
      const u = cu + p.getX(i) / SIZE, v = cv + p.getZ(i) / SIZE;
      const m = heightAt(u, v); hs.push(m);
      p.setY(i, yOf(m) - lotY + 0.012);
      uv.setXY(i, u, 1 - v);
    }
    g.setAttribute('hm', new THREE.Float32BufferAttribute(hs, 1));
    g.computeVertexNormals();
    return g;
  };
  const lotEdge = (steps = 40): THREE.Vector3[] => {
    const hw = LOT.w / 2, hh = LOT.h / 2, pts: THREE.Vector3[] = [];
    const corners: [number, number][] = [[-hw, -hh], [hw, -hh], [hw, hh], [-hw, hh], [-hw, -hh]];
    for (let k = 0; k < 4; k++) for (let s = 0; s < steps; s++) {
      const t = s / steps, [a, b] = corners[k], [c, d] = corners[k + 1];
      const u = cu + a + (c - a) * t, v = cv + b + (d - b) * t;
      pts.push(new THREE.Vector3((u - cu) * SIZE, yOf(heightAt(u, v)) - lotY + 0.03, (v - cv) * SIZE));
    }
    pts.push(pts[0].clone());
    return pts;
  };

  const lot = new THREE.Group();
  lot.position.copy(lotCentre);
  scene.add(lot);
  // shadows only where they matter: a tight shadow camera around the lot
  sun.position.copy(lotCentre).add(new THREE.Vector3(-3, 6, 2.5));
  sun.target.position.copy(lotCentre);
  sun.castShadow = true;
  sun.shadow.mapSize.set(small ? 1024 : 2048, small ? 1024 : 2048);
  Object.assign(sun.shadow.camera, { left: -2.2, right: 2.2, top: 2.2, bottom: -2.2, near: 0.5, far: 20 });
  sun.shadow.bias = -0.0006;
  sun.shadow.normalBias = 0.02;
  sun.shadow.radius = 3; // soft edges with PCF (PCFSoft was removed in three r18x)
  const layers: THREE.Group[] = [];
  const addLayer = () => { const g = new THREE.Group(); lot.add(g); layers.push(g); return g; };

  // 1 · ground (real aerial on real relief) with a thin soil slab
  const l1 = addLayer();
  const groundMesh = new THREE.Mesh(lotSurface(), new THREE.MeshStandardMaterial({ map: tex, roughness: 1 }));
  groundMesh.receiveShadow = true;
  l1.add(groundMesh);
  const slab = new THREE.Mesh(new THREE.BoxGeometry(LOT.w * SIZE, 0.12, LOT.h * SIZE), new THREE.MeshStandardMaterial({ color: 0x4a3120, roughness: 1 }));
  slab.position.y = -0.07; l1.add(slab);

  // 2 · topography: contour lines every metre, drawn in the fragment shader
  const l2 = addLayer();
  l2.add(new THREE.Mesh(lotSurface(48), new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, side: THREE.DoubleSide,
    uniforms: { uOpacity: { value: 1 } },
    vertexShader: 'attribute float hm; varying float vH; void main(){ vH = hm; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: `uniform float uOpacity; varying float vH;
      void main(){ float f = fract(vH / 1.0); float w = fwidth(vH / 1.0) * 1.4;
        float line = 1.0 - smoothstep(0.0, w, min(f, 1.0 - f));
        vec3 gold = vec3(0.81, 0.67, 0.38);
        gl_FragColor = vec4(mix(vec3(0.08,0.2,0.17), gold, line), (0.28 + line * 0.72) * uOpacity); }`,
  })));

  // 3 · boundary: coral ribbon along the edge + translucent fill + corner stakes
  const l3 = addLayer();
  const edgePts = lotEdge();
  const tube = new THREE.Mesh(
    new THREE.TubeGeometry(new THREE.CatmullRomCurve3(edgePts, false, 'catmullrom', 0), 320, 0.022, 6, false),
    new THREE.MeshStandardMaterial({ color: 0xf28e72, emissive: 0xf28e72, emissiveIntensity: 0.55, roughness: 0.5 }));
  l3.add(tube);
  l3.add(new THREE.Mesh(lotSurface(12), new THREE.MeshStandardMaterial({ color: 0xf28e72, transparent: true, opacity: 0.22, depthWrite: false, side: THREE.DoubleSide })));
  const stakeMat = new THREE.MeshStandardMaterial({ color: 0xff7a3c, emissive: 0x662200 });
  [0, 40, 80, 120].forEach(k => {
    const s = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.22, 8), stakeMat);
    s.position.copy(edgePts[k]).add(new THREE.Vector3(0, 0.11, 0)); l3.add(s);
  });
  const boundaryTotal = tube.geometry.index!.count;

  // 4 · access and utilities (illustrative): street, power line, water.
  // Layers 4 and 5 sit on a translucent plate shaped like the lot's terrain, as
  // in an exploded diagram, so props rest on something and shadows land.
  const plate = () => {
    const m = new THREE.Mesh(lotSurface(24), new THREE.MeshStandardMaterial({ color: 0x1d4a3e, transparent: true, opacity: 0.62, roughness: 0.9, side: THREE.DoubleSide }));
    m.receiveShadow = true; return m;
  };
  const l4 = addLayer();
  const lw = LOT.w * SIZE, lh = LOT.h * SIZE;
  const frontY = edgePts[100].y - 0.02;
  const houseZ = -lh * 0.05;
  const groundY = (du: number, dv: number) => yOf(heightAt(cu + du * LOT.w, cv + dv * LOT.h)) - lotY + 0.012;
  l4.add(plate());
  l4.add(buildStreet(lw, lh, frontY, houseZ + lh * 0.15, groundY));
  l4.add(buildUtilities(lw, lh, frontY, groundY));

  // 5 · a future home (illustrative) with a little landscaping
  const l5 = addLayer();
  l5.add(plate());
  const house = buildHouse(lw, lh);
  house.position.set(0, groundY(0, -0.05), houseZ);
  l5.add(house);
  const treeSpots: [number, number][] = [[-0.38, -0.3], [0.36, -0.32], [-0.34, 0.22], [0.4, 0.12], [-0.1, -0.4], [0.18, -0.42]];
  const trees = buildTrees(lw, lh, treeSpots.map(([u, v]) => [u, v, groundY(u, v)] as [number, number, number]));
  l5.add(trees);

  // swap the primitive house and trees for the real models once they arrive
  Promise.all([
    loadModel('/models/house.glb', lw * 0.42, 'x', -Math.PI / 2), // porch faces the street
    loadModel('/models/oak.glb', 0.34, 'y'),
    loadModel('/models/pine.glb', 0.42, 'y'),
  ]).then(([houseModel, oak, pine]) => {
    houseModel.position.copy(house.position);
    l5.remove(house, trees);
    l5.add(houseModel);
    treeSpots.forEach(([u, v], i) => {
      const s = 0.85 + ((i * 37) % 30) / 100;
      l5.add(place(i % 2 ? pine : oak, u * lw, groundY(u, v), v * lh, s, i * 1.7));
    });
    last = -1; // redraw with the models
  }).catch(() => { /* keep the primitive props */ });

  // ---- choreography --------------------------------------------------------
  const target = new THREE.Vector3(), camPos = new THREE.Vector3();
  const overview = { r: small ? 21 : 16.5, polar: 0.98, az: -0.62 };
  const close = { r: small ? 11.5 : 8.4, polar: 1.15, az: -0.2 };
  const tmp = new THREE.Vector3();
  const anchors = layers.map(() => new THREE.Vector3());

  function frame(p: number) {
    const rise = range(p, 0, 0.18);
    const draw = range(p, 0.16, 0.34);
    const dolly = range(p, 0.3, 0.5);
    const collapse = range(p, 0.86, 0.98);
    block.position.y = (1 - rise) * -3;
    terrainMat.color.setScalar(1 - dolly * 0.5);

    // boundary draws on the terrain before anything lifts
    tube.geometry.setDrawRange(0, Math.floor(boundaryTotal * draw / 3) * 3);

    // the whole lot lifts out as one piece, then fans apart: top layers travel
    // furthest, so layers never pass through each other
    const lift = range(p, 0.44, 0.56), spread = range(p, 0.52, 0.74);
    layers.forEach((g, i) => {
      const e = (lift * LIFT + spread * i * GAP) * (1 - collapse);
      g.position.y = e + (1 - rise) * -3;
      g.visible = i === 2 ? draw > 0 : i === 0 || spread > 0.001 || (i === 4 && collapse > 0);
      if (i === 0) slab.visible = lift > 0.05 && collapse < 0.95;
      anchors[i].set(lw / 2 + 0.1, g.position.y + 0.1, 0).add(lot.position);
    });
    // the house lands last when the stack settles back
    (l2.children[0] as THREE.Mesh<THREE.BufferGeometry, THREE.ShaderMaterial>).material.uniforms.uOpacity.value = 1 - collapse * 0.9;

    const s = (a: number, b: number) => a + (b - a) * dolly;
    const orbit = (p - 0.5) * 0.35;
    // at the hold, push in on the top of the stack (street, utilities, house)
    const push = range(p, 0.72, 0.8) * (1 - range(p, 0.86, 0.94));
    const r = s(overview.r, close.r) * (1 - push * (small ? 0.4 : 0.45));
    const polar = s(overview.polar, close.polar) + push * 0.08, az = s(overview.az, close.az) + orbit;
    target.set(0, 0.4, 0).lerp(tmp.copy(lotCentre).add(new THREE.Vector3(0, small ? 2.1 : 2.05, 0)), dolly);
    target.y += push * (LIFT + 3.4 * GAP - (small ? 2.1 : 2.05) + 0.15);
    camPos.set(Math.sin(polar) * Math.sin(az), Math.cos(polar), Math.sin(polar) * Math.cos(az)).multiplyScalar(r).add(target);
    camera.position.copy(camPos);
    camera.lookAt(target);
    renderer.render(scene, camera);

    // labels follow their layer's right edge, then get pushed apart so a
    // label never covers the one below it (layers can sit closer on screen
    // than a label is tall)
    const w = stage.clientWidth, h = stage.clientHeight;
    const pos = labels.map((el, i) => {
      tmp.copy(anchors[i]).project(camera);
      return { el, i, x: (tmp.x * 0.5 + 0.5) * w, y: (-tmp.y * 0.5 + 0.5) * h, hh: el.offsetHeight };
    });
    // bottom layer first (largest y), each label must sit above the previous
    const order = [...pos].sort((a, b) => b.y - a.y);
    let floor = Infinity;
    for (const q of order) {
      const top = Math.min(q.y - q.hh / 2, floor - q.hh - 6);
      q.y = top + q.hh / 2;
      floor = top;
    }
    pos.forEach(({ el, i, x, y, hh }) => {
      const e = range(p, 0.56 + i * 0.035, 0.64 + i * 0.035) * (1 - range(p, 0.84, 0.9));
      el.style.transform = `translate(${Math.min(x + 12, w - el.offsetWidth - 12)}px, ${Math.max(8, y - hh / 2)}px)`;
      // a layer pushed out of frame by the close-up takes its label with it
      const inFrame = y > hh * 0.6 && y < h - hh * 0.6 ? 1 : 0;
      el.style.opacity = String(e * inFrame);
    });
  }

  // ---- loop ----------------------------------------------------------------
  const resize = () => {
    const w = stage.clientWidth, h = stage.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.setViewOffset(w, h, small ? 0 : -w * 0.14, small ? -h * 0.1 : -h * 0.03, w, h);
    camera.updateProjectionMatrix();
    last = -1;
  };
  let last = -1, on = true, raf = 0;
  new ResizeObserver(resize).observe(stage);
  new IntersectionObserver(([e]) => { on = e.isIntersecting; if (on && !raf) raf = requestAnimationFrame(loop); }).observe(section);
  function loop() {
    raf = 0;
    if (!on) return;
    const p = parseFloat(section.style.getPropertyValue('--sc-p')) || 0;
    if (Math.abs(p - last) > 0.0004) { frame(p); last = p; }
    raf = requestAnimationFrame(loop);
  }
  resize();
  section.classList.add('is-3d');
  raf = requestAnimationFrame(loop);
}
