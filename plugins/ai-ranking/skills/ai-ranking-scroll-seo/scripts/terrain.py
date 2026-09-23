#!/usr/bin/env python3
"""terrain.py: real terrain + real aerial for any US location, ready for Three.js.

Usage:
  python3 terrain.py --lat 36.2944 --lon -91.5449 --size 700 --grid 128 --out public/terrain/cv

Writes:
  <out>-height.bin   grid x grid little-endian uint16, row 0 = north, 0..65535
                     mapped linearly to [min_m, max_m]
  <out>-aerial.png   size-matched orthophoto (convert with optimize-images.mjs)
  <out>.json         { lat, lon, size_m, grid, min_m, max_m, bbox, sources }

Sources (public domain, US only):
  elevation  USGS 3DEP ImageServer (1/3 arc-second or better)
  imagery    USDA NAIP via USGS ImageServer (~0.6-1 m)
Outside the US, swap in any DEM (e.g. Copernicus GLO-30) and orthophoto with the
same output format; the page code does not care where the grid came from.
Needs: pip install pillow numpy
"""
import argparse, json, math, pathlib, subprocess, urllib.parse, io
import numpy as np
from PIL import Image

ap = argparse.ArgumentParser()
ap.add_argument('--lat', type=float, required=True)
ap.add_argument('--lon', type=float, required=True)
ap.add_argument('--size', type=float, default=700, help='square side in metres')
ap.add_argument('--grid', type=int, default=128)
ap.add_argument('--aerial', type=int, default=2048, help='aerial pixels per side')
ap.add_argument('--out', required=True)
a = ap.parse_args()

dlat = (a.size / 2) / 111320
dlon = (a.size / 2) / (111320 * math.cos(math.radians(a.lat)))
bbox = [a.lon - dlon, a.lat - dlat, a.lon + dlon, a.lat + dlat]
bb = ','.join(f'{v:.6f}' for v in bbox)

def fetch(url, params):
    # curl, not urllib: the python.org macOS build ships without root
    # certificates and fails the TLS handshake until Install Certificates runs.
    q = urllib.parse.urlencode(params)
    return subprocess.run(['curl', '-sfL', '-m', '180', f'{url}?{q}'], check=True, capture_output=True).stdout

dem = fetch('https://elevation.nationalmap.gov/arcgis/rest/services/3DEPElevation/ImageServer/exportImage', {
    'bbox': bb, 'bboxSR': 4326, 'imageSR': 4326, 'size': f'{a.grid},{a.grid}',
    'format': 'tiff', 'pixelType': 'F32', 'interpolation': 'RSP_BilinearInterpolation', 'f': 'image'})
h = np.array(Image.open(io.BytesIO(dem)), dtype='float32')
lo, hi = float(h.min()), float(h.max())
q = np.round((h - lo) / max(hi - lo, 1e-6) * 65535).astype('<u2')

img = fetch('https://imagery.nationalmap.gov/arcgis/rest/services/USGSNAIPImagery/ImageServer/exportImage', {
    'bbox': bb, 'bboxSR': 4326, 'imageSR': 4326, 'size': f'{a.aerial},{a.aerial}', 'format': 'jpg', 'f': 'image'})

out = pathlib.Path(a.out); out.parent.mkdir(parents=True, exist_ok=True)
pathlib.Path(f'{out}-height.bin').write_bytes(q.tobytes())
Image.open(io.BytesIO(img)).convert('RGB').save(f'{out}-aerial.png')
meta = {'lat': a.lat, 'lon': a.lon, 'size_m': a.size, 'grid': a.grid, 'min_m': round(lo, 2), 'max_m': round(hi, 2),
        'bbox': bbox, 'sources': {'elevation': 'USGS 3DEP', 'imagery': 'USDA NAIP (USGS ImageServer)'}}
pathlib.Path(f'{out}.json').write_text(json.dumps(meta, indent=2))
print(f'terrain {a.grid}x{a.grid}, {lo:.1f}-{hi:.1f} m ({hi - lo:.1f} m relief), '
      f'{pathlib.Path(f"{out}-height.bin").stat().st_size // 1024} KB; aerial {a.aerial}px')
