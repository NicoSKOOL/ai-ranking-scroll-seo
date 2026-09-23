#!/usr/bin/env node
/* fal.mjs: image generation through fal.ai, next to kie.mjs.

   Usage:
     node fal.mjs still "<prompt>" out/hero.png [--size 1536x1024 | --size landscape_16_9]
                  [--transparent] [--quality high] [--model openai/gpt-image-2.5/flare/text-to-image]
                  [--ref path/or/url.png]            # uses the model's /edit endpoint
                  [--manifest assets/asset-manifest.json] [--id hero-back]
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

async function run(model, input, key) {
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
    if (Date.now() - t0 > 600000) throw new Error('timeout after 10 min');
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

main().catch(e => { console.error(e.message); process.exit(1); });
