// Real 3D props for the exploded parcel: image-to-3D models (fal Meshy 7.1)
// compressed with meshopt + WebP textures. The scene first renders with the
// primitive props from parcel-props.ts; these replace them once they stream in,
// so a slow connection never holds the section back.
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';

const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);

// Load a glb, sit it on y = 0, centre it on x/z, and scale it so its width
// (fit: 'x') or height (fit: 'y') equals size.
// rotY turns the model before it is measured (image-to-3D picks its own front).
export async function loadModel(url: string, size: number, fit: 'x' | 'y' = 'x', rotY = 0) {
  const src = (await loader.loadAsync(url)).scene;
  src.rotation.y = rotY;
  src.updateMatrixWorld(true);
  src.traverse(o => {
    const m = o as THREE.Mesh;
    if (!m.isMesh) return;
    m.castShadow = true;
    m.receiveShadow = true;
    const mat = m.material as THREE.MeshStandardMaterial;
    if (mat.map) mat.map.anisotropy = 4;
  });
  const box = new THREE.Box3().setFromObject(src), dim = box.getSize(new THREE.Vector3());
  const k = size / (fit === 'x' ? dim.x : dim.y);
  const centre = box.getCenter(new THREE.Vector3());
  src.position.set(-centre.x, -box.min.y, -centre.z);
  const g = new THREE.Group();
  g.add(src);
  g.scale.setScalar(k);
  return g;
}

// Trees are placed many times: clone the loaded group (geometry and textures
// are shared, so a clone costs almost nothing).
export const place = (model: THREE.Object3D, x: number, y: number, z: number, s = 1, ry = 0) => {
  const c = model.clone();
  c.position.set(x, y, z);
  c.scale.multiplyScalar(s);
  c.rotation.y = ry;
  return c;
};
