#!/usr/bin/env python3
"""subset-fonts.py: shrink self-hosted variable fonts to the glyphs the site uses.

Usage:
  python3 subset-fonts.py --text-from dist --out public/fonts \
      --font "Display:path/to/display-wght.woff2:400:500" \
      --font "Text:path/to/text-wght.woff2:400:700"

For each --font "Family:file:minWeight:maxWeight":
  1. pins the wght axis to the range actually used (fontTools instancer),
  2. keeps only characters found in the built HTML/TXT files under --text-from
     (all languages at once) plus printable ASCII,
  3. writes <out>/<family>.woff2 and prints an @font-face block to paste.

Fonts are the usual hidden cost on a phone: two variable Latin faces are about
100 KB and sit on the first-paint path. Subsetting typically removes 50-70%.
Needs: pip install fonttools brotli
"""
import argparse, pathlib, re, html
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer
from fontTools import subset

ap = argparse.ArgumentParser()
ap.add_argument('--text-from', required=True)
ap.add_argument('--out', required=True)
ap.add_argument('--font', action='append', required=True)
a = ap.parse_args()

chars = set(chr(c) for c in range(0x20, 0x7F))
for f in pathlib.Path(a.text_from).rglob('*'):
    if f.suffix in ('.html', '.txt') and f.is_file():
        t = f.read_text(encoding='utf-8', errors='ignore')
        t = re.sub(r'<script.*?</script>|<style.*?</style>|<[^>]+>', ' ', t, flags=re.S)
        chars |= set(html.unescape(t))
chars |= set('“”‘’…·•×−→€$£')
text = ''.join(sorted(c for c in chars if c.isprintable()))

out = pathlib.Path(a.out); out.mkdir(parents=True, exist_ok=True)
for spec in a.font:
    family, path, lo, hi = spec.split(':')
    font = TTFont(path)
    if 'fvar' in font:
        font = instancer.instantiateVariableFont(font, {'wght': (int(lo), int(hi))})
    opts = subset.Options(); opts.flavor = 'woff2'; opts.layout_features = ['*']; opts.name_IDs = ['*']
    sub = subset.Subsetter(opts); sub.populate(text=text); sub.subset(font)
    slug = re.sub(r'\W+', '-', family.lower())
    dest = out / f'{slug}.woff2'
    font.flavor = 'woff2'; font.save(dest)
    before, after = pathlib.Path(path).stat().st_size, dest.stat().st_size
    print(f'/* {family}: {before//1024} KB -> {after//1024} KB, {len(text)} chars */')
    print(f"@font-face {{ font-family: '{family}'; font-style: normal; font-display: swap; "
          f"font-weight: {lo} {hi}; src: url(/fonts/{dest.name}) format('woff2'); }}")
