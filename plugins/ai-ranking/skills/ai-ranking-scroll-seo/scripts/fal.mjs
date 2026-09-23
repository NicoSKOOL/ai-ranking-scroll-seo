#!/usr/bin/env node
/* fal.mjs: image generation through fal.ai, next to kie.mjs.

   Usage:
     node fal.mjs still "<prompt>" out/hero.png [--size 1536x1024 | --size landscape_16_9]
                  [--transparent] [--quality high] [--model openai/gpt-image-2.5/flare/text-to-image]
                  [--ref path/or/url.png]            # uses the model's /edit endpoint
                  [--manifest assets/asset-manifest.json] [--id hero-back]
     node fal.mjs model assets/models/src/house.png assets/models/raw/house.glb
                  [--endpoint fal-ai/meshy/v7.1/image-to-3d] [--polys 20000] [--no-pbr]
                  [--manifest assets/asset-manifest.json] [--id model-house]
                                                     # image-to-3D: textured PBR glb (Meshy 7.1, USD 0.80 each)
     node fal.mjs video assets/masters/hero-back.jpg assets/video/hero-raw.mp4 "<motion prompt>"
                  [--endpoint fal-ai/kling-video/v3/pro/image-to-video] [--duration 10] [--loop]
                  [--manifest assets/asset-manifest.json] [--id hero-loop]
                                                     # image-to-video; --loop pins the last frame to the first
     node fal.mjs probe                              # checks FAL_KEY and the default model

   Reads FAL_KEY from the environment (or a .env found walking up from cwd).
   Every successful call appends {id, file, model, prompt, size, background,
   request_id, date} to the manifest so each shipped image has provenance. */

import fs from 'node:fs';
import path from 'node:path';

const DEFAULT_MODEL = 'openai/gpt-image-2.5/flare/text-to-image';

function loadKey() {
  if (process.env.FAL_KEY) return process.env.FAL_KEY;
  let dir = process.cwd();
  while (true) {
    const f = path.join(dir, '.env');
    if (fs.existsSync(f)) {
      const m = fs.readFileSync(f, 'utf8').match(/^FAL_KEY=(.+)$/m);
      if (m) return m[1].trim().replace(/^["']|["']$/g, '');
    }
    const up = path.dirname(dir);
    if (up === dir) break;
    dir = up;
  }
  console.error('FAL_KEY not set (env or .env).');
  process.exit(2);
}

function parseArgs(argv) {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const k = a.slice(2);
      const next = argv[i + 1];
      if (next === undefined || next.startsWith('--')) out[k] = true;
      else { out[k] = next; i++; }
    } else out._.push(a);
  }
  return out;
}

function sizeArg(s) {
  if (!s) return 'landscape_16_9';
  const m = String(s).match(/^(\d+)x(\d+)$/);
  return m ? { width: +m[1], height: +m[2] } : s;
}

async function toDataUri(ref) {
  if (/^https?:|^data:/.test(ref)) return ref;
  const buf = fs.readFileSync(ref);
  const ext = path.extname(ref).slice(1).toLowerCase().replace('jpg', 'jpeg');
  return `data:image/${ext};base64,${buf.toString('base64')}`;
}

async function run(model, input, key, maxMs = 600000) {
  const headers = { Authorization: `Key ${key}`, 'Content-Type': 'application/json' };
  const sub = await fetch(`https://queue.fal.run/${model}`, { method: 'POST', headers, body: JSON.stringify(input) });
  if (!sub.ok) throw new Error(`submit ${sub.status}: ${await sub.text()}`);
  const { request_id, status_url, response_url } = await sub.json();
  const t0 = Date.now();
  while (true) {
    await new Promise(r => setTimeout(r, 2500));
    const st = await (await fetch(status_url, { headers })).json();
    if (st.status === 'COMPLETED') break;
    if (st.status === 'FAILED' || st.error) throw new Error(`failed: ${JSON.stringify(st)}`);
    if (Date.now() - t0 > maxMs) throw new Error(`timeout after ${maxMs / 60000} min`);
  }
  const res = await fetch(response_url, { headers });
  if (!res.ok) throw new Error(`result ${res.status}: ${await res.text()}`);
  return { request_id, data: await res.json() };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const [cmd, prompt, outFile] = args._;
  const key = loadKey();
  const model = args.model || DEFAULT_MODEL;

  if (cmd === 'probe') {
    const r = await fetch(`https://api.fal.ai/v1/models?endpoint_id=${model}`, { headers: { Authorization: `Key ${key}` } });
    console.log(r.ok ? `ok: key accepted, ${model} reachable` : `error ${r.status}`);
    process.exit(r.ok ? 0 : 1);
  }
  if (cmd === 'model') return model3d(args, prompt, outFile, key); // prompt slot holds the image path
  if (cmd === 'video') return video(args, prompt, outFile, args._[3], key);
  if (cmd !== 'still' || !prompt || !outFile) {
    console.error('usage: fal.mjs still "<prompt>" out.png [--size WxH] [--transparent] [--ref img] [--manifest file --id name]');
    process.exit(2);
  }

  const input = {
    prompt,
    image_size: sizeArg(args.size),
    quality: args.quality || 'high',
    background: args.transparent ? 'transparent' : 'opaque',
    output_format: 'png',
    num_images: 1,
  };
  let endpoint = model;
  if (args.ref) {
    endpoint = model.replace(/text-to-image$/, 'edit');
    input.image_urls = [await toDataUri(args.ref)];
  }

  const { request_id, data } = await run(endpoint, input, key);
  const img = data.images?.[0];
  if (!img?.url) throw new Error(`no image in response: ${JSON.stringify(data).slice(0, 400)}`);
  const buf = Buffer.from(await (await fetch(img.url)).arrayBuffer());
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, buf);
  console.log(`saved ${outFile} (${(buf.length / 1024).toFixed(0)} KB, ${img.width || '?'}x${img.height || '?'})`);

  if (args.manifest) {
    const mf = args.manifest;
    const list = fs.existsSync(mf) ? JSON.parse(fs.readFileSync(mf, 'utf8')) : [];
    list.push({
      id: args.id || path.basename(outFile, path.extname(outFile)),
      file: outFile, model: endpoint, prompt, size: input.image_size,
      background: input.background, ref: args.ref || null,
      request_id, generated: true, date: new Date().toISOString(),
    });
    fs.mkdirSync(path.dirname(mf), { recursive: true });
    fs.writeFileSync(mf, JSON.stringify(list, null, 2));
  }
}

function logManifest(args, entry) {
  if (!args.manifest) return;
  const mf = args.manifest;
  const list = fs.existsSync(mf) ? JSON.parse(fs.readFileSync(mf, 'utf8')) : [];
  list.push({ ...entry, generated: true, date: new Date().toISOString() });
  fs.mkdirSync(path.dirname(mf), { recursive: true });
  fs.writeFileSync(mf, JSON.stringify(list, null, 2));
}

// image-to-3D. Feed it an isolated object on a transparent or plain background,
// three-quarter view from slightly above; it returns one textured glb.
async function model3d(args, image, outFile, key) {
  if (!image || !outFile) {
    console.error('usage: fal.mjs model <image.png> out.glb [--polys 20000] [--no-pbr] [--endpoint id]');
    process.exit(2);
  }
  const endpoint = args.endpoint || 'fal-ai/meshy/v7.1/image-to-3d';
  const tripo = /tripo/.test(endpoint);
  const input = tripo ? {
    image_url: await toDataUri(image),
    texture: true, pbr: !args['no-pbr'], texture_quality: args.texture || 'detailed',
    face_limit: +(args.polys || 20000), delight: true, export_uv: true,
  } : {
    image_url: await toDataUri(image),
    model_type: 'standard',
    topology: 'triangle',
    target_polycount: +(args.polys || 20000),
    should_remesh: true,
    should_texture: true,
    enable_pbr: !args['no-pbr'],
    symmetry_mode: 'auto',
    pose_mode: '',
  };
  const t0 = Date.now();
  const { request_id, data } = await run(endpoint, input, key, 1200000);
  const file = data.model_glb || data.model_urls?.glb || data.pbr_model || data.model_mesh || data.base_model;
  if (!file?.url) throw new Error(`no glb in response: ${JSON.stringify(data).slice(0, 400)}`);
  const buf = Buffer.from(await (await fetch(file.url)).arrayBuffer());
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, buf);
  console.log(`saved ${outFile} (${(buf.length / 1048576).toFixed(1)} MB) in ${((Date.now() - t0) / 1000).toFixed(0)} s`);
  logManifest(args, { id: args.id || path.basename(outFile, '.glb'), file: outFile, model: endpoint, source_image: image, polys: input.target_polycount, pbr: input.enable_pbr, request_id });
}

// image-to-video for ambient loops. Kling v3 Pro takes an end frame, so --loop
// pins both ends to the same still; the page still ping-pongs or crossfades,
// because models drift (usually a slow push-in) between the pinned ends.
async function video(args, image, outFile, motion, key) {
  if (!image || !outFile || !motion) {
    console.error('usage: fal.mjs video <image> out.mp4 "<motion prompt>" [--duration 10] [--loop] [--endpoint id]');
    process.exit(2);
  }
  const endpoint = args.endpoint || 'fal-ai/kling-video/v3/pro/image-to-video';
  const img = await toDataUri(image);
  const kling = /kling/.test(endpoint);
  const input = kling
    ? { start_image_url: img, prompt: motion, duration: String(args.duration || 10), generate_audio: false,
        negative_prompt: 'camera shake, zoom, pan, cut, people, birds, text, blur, distortion, low quality' }
    : { image_url: img, prompt: motion, duration: /seedance/.test(endpoint) ? String(args.duration || 10) : +(args.duration || 10),
        resolution: '1080p', generate_audio: false };
  if (args.loop) input.end_image_url = img;
  const t0 = Date.now();
  const { request_id, data } = await run(endpoint, input, key, 1800000);
  const file = data.video;
  if (!file?.url) throw new Error(`no video in response: ${JSON.stringify(data).slice(0, 400)}`);
  const buf = Buffer.from(await (await fetch(file.url)).arrayBuffer());
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, buf);
  console.log(`saved ${outFile} (${(buf.length / 1048576).toFixed(1)} MB) in ${((Date.now() - t0) / 1000).toFixed(0)} s`);
  logManifest(args, { id: args.id || path.basename(outFile, path.extname(outFile)), file: outFile, model: endpoint, source_image: image, prompt: motion, duration: input.duration, loop: !!args.loop, request_id });
}

main().catch(e => { console.error(e.message); process.exit(1); });
