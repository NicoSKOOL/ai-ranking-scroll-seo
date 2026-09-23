# Trust mode

For businesses where the visitor is deciding whether to believe you (land, real
estate, finance, health, legal, anything sold to people who cannot inspect it
first), generated imagery is allowed for impact but must never pass as evidence.

- Every generated image of a place, product or result carries a small visible
  caption in the page language: "Imagen ilustrativa" / "Illustrative image" /
  "Imagem ilustrativa". The footer says what that means.
- Real photographs are kept apart and captioned as real ("Area photographs
  published by the project").
- Numbers on the page (prices, distances, counts) come from the client's
  published material or a calculation you can show. A counter animates a real
  figure or does not exist.
- Anything the owners have not confirmed is phrased as what the buyer will
  verify ("you review the plat before reserving"), not as a promise.
- Never generate: documents that could be read as real deeds or contracts,
  customer faces or testimonials, team members' identities, certification marks.
- Keep an `asset-manifest.json` (fal.mjs writes it): prompt, model, date, and
  whether the image is generated, for every shipped image.
