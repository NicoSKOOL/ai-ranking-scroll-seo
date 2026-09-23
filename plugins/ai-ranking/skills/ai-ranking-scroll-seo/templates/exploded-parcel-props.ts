// Illustrative props for the exploded parcel: house, street, utilities, trees.
// Plain primitives with PBR materials; sizes are in lot units (lw x lh is the
// lot footprint) so the same builders fit any lot the template is pointed at.
import * as THREE from 'three';

const std = (color: number, roughness = 0.8, extra: THREE.MeshStandardMaterialParameters = {}) =>
  new THREE.MeshStandardMaterial({ color, roughness, metalness: 0, ...extra });

function mesh(geo: THREE.BufferGeometry, mat: THREE.Material, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

// ---- surface textures, painted on a canvas (no download) --------------------
// Aggregate speckle for asphalt; slabs with expansion joints for concrete.
function surface(kind: 'asphalt' | 'concrete', repeatX: number, repeatY = 1) {
  const n = 256, c = document.createElement('canvas');
  c.width = c.height = n;
  const x = c.getContext('2d')!;
  x.fillStyle = kind === 'asphalt' ? '#34383a' : '#bdb7aa';
  x.fillRect(0, 0, n, n);
  let seed = kind === 'asphalt' ? 7 : 11;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < (kind === 'asphalt' ? 5200 : 2600); i++) {
    const v = rnd(), light = kind === 'asphalt' ? 30 + v * 80 : 150 + v * 70;
    x.fillStyle = `rgba(${light},${light},${light - 4},${0.25 + rnd() * 0.45})`;
    const r = kind === 'asphalt' ? rnd() * 1.6 + 0.4 : rnd() * 1.1 + 0.3;
    x.fillRect(rnd() * n, rnd() * n, r, r);
  }
  if (kind === 'asphalt') {
    // wheel-track wear: two slightly darker, smoother bands
    x.fillStyle = 'rgba(20,22,24,0.18)';
    x.fillRect(0, n * 0.18, n, n * 0.14); x.fillRect(0, n * 0.68, n, n * 0.14);
  } else {
    x.strokeStyle = 'rgba(90,86,78,0.7)'; x.lineWidth = 2;
    x.beginPath(); x.moveTo(0, 1); x.lineTo(n, 1); x.moveTo(1, 0); x.lineTo(1, n); x.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(repeatX, repeatY);
  t.anisotropy = 4;
  return t;
}

// ---- street: asphalt, curbs, dashed centre line, sidewalk, driveway ---------
type Ground = (fu: number, fv: number) => number; // lot-local height at a fraction of the lot (-0.5..0.5)

export function buildStreet(lw: number, lh: number, y: number, houseZ: number, gy: Ground) {
  const g = new THREE.Group();
  const len = lw * 1.6, width = 0.26, z = lh / 2 + width / 2 + 0.07;
  g.add(mesh(new THREE.BoxGeometry(len, 0.03, width), std(0xffffff, 0.92, { map: surface('asphalt', len / width, 1) }), 0, y, z));
  const curbMat = std(0xc9c4b8, 0.9);
  g.add(mesh(new THREE.BoxGeometry(len, 0.045, 0.018), curbMat, 0, y + 0.008, z - width / 2));
  g.add(mesh(new THREE.BoxGeometry(len, 0.045, 0.018), curbMat, 0, y + 0.008, z + width / 2));
  const dashMat = new THREE.MeshStandardMaterial({ color: 0xf0d27a, roughness: 0.6, emissive: 0x3a2c05 });
  for (let x = -len / 2 + 0.06; x < len / 2; x += 0.13) g.add(mesh(new THREE.BoxGeometry(0.07, 0.034, 0.012), dashMat, x, y + 0.001, z));
  // sidewalk on the lot side
  g.add(mesh(new THREE.BoxGeometry(len, 0.036, 0.06), std(0xffffff, 0.95, { map: surface('concrete', len / 0.06, 1) }), 0, y + 0.004, lh / 2 + 0.035));
  // driveway from the street up to the house
  const dLen = Math.max(0.05, lh / 2 - houseZ);
  const zMid = houseZ + dLen / 2;
  const drive = mesh(new THREE.BoxGeometry(0.11, 0.012, dLen), std(0xd8d2c4, 0.95, { map: surface('concrete', 1, dLen / 0.11) }), lw * 0.12, (gy(0.12, zMid / lh) + y) / 2 + 0.01, zMid);
  drive.rotation.x = Math.atan2(gy(0.12, houseZ / lh) - y, dLen); // follow the slope down to the street
  g.add(drive);
  return g;
}

// ---- utilities: power line with poles, transformer, water meter + pipe -------
export function buildUtilities(lw: number, lh: number, y: number, gy: Ground) {
  const g = new THREE.Group();
  const wood = std(0x5c4430, 0.9), insul = std(0x7fb0b8, 0.3), metal = std(0x8e959a, 0.45, { metalness: 0.6 });
  const z = lh / 2 + 0.035, h = 0.62;
  const tops: THREE.Vector3[][] = [];
  for (const x of [-lw * 0.5, lw * 0.5]) {
    g.add(mesh(new THREE.CylinderGeometry(0.011, 0.016, h, 10), wood, x, y + h / 2, z));
    g.add(mesh(new THREE.BoxGeometry(0.2, 0.018, 0.018), wood, x, y + h - 0.05, z));
    const row: THREE.Vector3[] = [];
    for (const dx of [-0.085, 0, 0.085]) {
      g.add(mesh(new THREE.CylinderGeometry(0.007, 0.007, 0.03, 8), insul, x + dx, y + h - 0.025, z));
      row.push(new THREE.Vector3(x + dx, y + h - 0.01, z));
    }
    tops.push(row);
  }
  g.add(mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.07, 12), metal, -lw * 0.5 + 0.035, y + h - 0.17, z)); // transformer
  const wireMat = new THREE.MeshStandardMaterial({ color: 0x151515, roughness: 0.6 });
  for (let k = 0; k < 3; k++) {
    const a = tops[0][k], b = tops[1][k], mid = a.clone().lerp(b, 0.5); mid.y -= 0.06;
    g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(a, mid, b), 40, 0.0028, 5), wireMat));
  }
  // service drop from the pole to the house side of the lot
  const drop = new THREE.QuadraticBezierCurve3(tops[1][1], new THREE.Vector3(lw * 0.25, y + 0.42, lh * 0.2), new THREE.Vector3(lw * 0.05, y + 0.3, 0));
  g.add(new THREE.Mesh(new THREE.TubeGeometry(drop, 40, 0.0025, 5), wireMat));
  // water: meter box at the front, blue service pipe to the house, on the ground
  const mY = gy(-0.18, 0.5 - 0.03 / lh);
  g.add(mesh(new THREE.BoxGeometry(0.06, 0.03, 0.05), std(0x6f7478, 0.7), -lw * 0.18, mY + 0.015, lh / 2 - 0.03));
  g.add(mesh(new THREE.BoxGeometry(0.05, 0.006, 0.04), std(0x2f6fb0, 0.4), -lw * 0.18, mY + 0.033, lh / 2 - 0.03));
  const pts = [[-0.18, 0.5 - 0.03 / lh], [-0.16, 0.3], [-0.12, 0.12], [-0.06, 0.02]].map(([fu, fv]) =>
    new THREE.Vector3(fu * lw, gy(fu, fv) + 0.012, fv * lh));
  g.add(mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 30, 0.009, 8), std(0x3d8fd6, 0.35, { emissive: 0x0a2b4a })));
  return g;
}

// ---- house: plinth, walls, windows, door, gable roof with overhang, porch ---
export function buildHouse(lw: number, lh: number) {
  const g = new THREE.Group();
  const W = lw * 0.32, D = lh * 0.3, H = 0.17;
  const wall = std(0xefe6d6, 0.85), trim = std(0xfaf7f0, 0.6), roofMat = std(0x2c3533, 0.75);
  const glass = new THREE.MeshStandardMaterial({ color: 0x1d2a2c, roughness: 0.15, metalness: 0.2, emissive: 0xffb866, emissiveIntensity: 0.55 });
  g.add(mesh(new THREE.BoxGeometry(W + 0.02, 0.03, D + 0.02), std(0x8a8177, 0.95), 0, 0.015, 0));          // stone plinth
  g.add(mesh(new THREE.BoxGeometry(W, H, D), wall, 0, 0.03 + H / 2, 0));
  // windows: front and sides
  const win = (w: number, h: number) => new THREE.BoxGeometry(w, h, 0.006);
  const frontZ = D / 2 + 0.003;
  for (const x of [-W * 0.3, W * 0.3]) {
    g.add(mesh(win(0.075, 0.07), glass, x, 0.03 + H * 0.55, frontZ));
    g.add(mesh(new THREE.BoxGeometry(0.087, 0.008, 0.01), trim, x, 0.03 + H * 0.55 - 0.039, frontZ + 0.002)); // sill
  }
  const side = (sx: number) => {
    const m = mesh(win(0.08, 0.065), glass, sx, 0.03 + H * 0.55, 0);
    m.rotation.y = Math.PI / 2; return m;
  };
  g.add(side(W / 2 + 0.003), side(-W / 2 - 0.003));
  g.add(mesh(new THREE.BoxGeometry(0.05, 0.1, 0.008), std(0x7a4b2a, 0.6), 0, 0.03 + 0.05, frontZ));         // door
  // gable roof: two slabs meeting at the ridge, with overhang
  const pitch = 0.62, over = 0.035, slabW = (W / 2 + over) / Math.cos(pitch);
  for (const s of [-1, 1]) {
    const slab = mesh(new THREE.BoxGeometry(slabW, 0.016, D + over * 2), roofMat);
    slab.rotation.z = -s * pitch;
    slab.position.set(s * (W / 4 + over / 2) , 0.03 + H + Math.tan(pitch) * (W / 4) + 0.004, 0);
    g.add(slab);
  }
  // gable ends
  const tri = new THREE.Shape([new THREE.Vector2(-W / 2, 0), new THREE.Vector2(W / 2, 0), new THREE.Vector2(0, Math.tan(pitch) * W / 2)]);
  for (const z of [D / 2 - 0.003, -D / 2 - 0.003]) {
    const gab = mesh(new THREE.ExtrudeGeometry(tri, { depth: 0.006, bevelEnabled: false }), wall, 0, 0.03 + H, z);
    g.add(gab);
  }
  g.add(mesh(new THREE.BoxGeometry(0.035, 0.09, 0.035), std(0x8c4a35, 0.9), W * 0.25, 0.03 + H + 0.07, -D * 0.2)); // chimney
  // covered porch: deck, posts, flat roof
  const pd = 0.07;
  g.add(mesh(new THREE.BoxGeometry(W * 0.6, 0.018, pd), std(0x9a6b43, 0.8), 0, 0.02, D / 2 + pd / 2));
  for (const x of [-W * 0.28, W * 0.28]) g.add(mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.12, 8), trim, x, 0.03 + 0.06, D / 2 + pd - 0.008));
  g.add(mesh(new THREE.BoxGeometry(W * 0.64, 0.012, pd + 0.02), roofMat, 0, 0.03 + 0.125, D / 2 + pd / 2));
  return g;
}

// ---- trees: a few low-poly pines and oaks for landscaping ------------------
export function buildTrees(lw: number, lh: number, spots: [number, number, number][]) {
  const g = new THREE.Group();
  const trunk = std(0x5a4030, 0.9), pine = std(0x2f5a3a, 0.85), oak = std(0x6f8a3a, 0.85);
  spots.forEach(([u, v, y], i) => {
    const x = u * lw, z = v * lh, s = 0.8 + (i % 3) * 0.15;
    g.add(mesh(new THREE.CylinderGeometry(0.008 * s, 0.012 * s, 0.07 * s, 6), trunk, x, y + 0.035 * s, z));
    if (i % 2) {
      g.add(mesh(new THREE.ConeGeometry(0.05 * s, 0.12 * s, 7), pine, x, y + 0.11 * s, z));
      g.add(mesh(new THREE.ConeGeometry(0.038 * s, 0.09 * s, 7), pine, x, y + 0.17 * s, z));
    } else {
      g.add(mesh(new THREE.IcosahedronGeometry(0.055 * s, 0), oak, x, y + 0.11 * s, z));
    }
  });
  return g;
}
