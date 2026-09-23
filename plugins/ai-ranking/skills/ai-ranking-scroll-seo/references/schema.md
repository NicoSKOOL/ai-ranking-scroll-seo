# JSON-LD by business type

One `@graph` per page. Always: `Organization` (plus the specific type), `WebSite`,
`WebPage` (with `inLanguage`), `BreadcrumbList`. Add the rest only when the page
visibly shows the same facts. `verify-seo.mjs` fails a FAQPage whose questions or
answers are not on the page verbatim.

| Business | Types to add | Notes |
|---|---|---|
| Real estate / land | `RealEstateAgent` on the org, `Offer` with `priceSpecification` (down payment, monthly × count), `itemOffered: Place` with address locality | No `address` on the agent until the owners confirm one; `RealEstateListing` only for real, individual listings |
| Local service | `LocalBusiness` subtype (`Plumber`, `Dentist`...), `address`, `geo`, `openingHoursSpecification`, `areaServed` | NAP must match the Google Business Profile exactly |
| Product / DTC | `Product` with `offers`, `brand`, `aggregateRating` only with real reviews | |
| SaaS | `SoftwareApplication` with `offers`, `applicationCategory` | |
| Restaurant / food | `Restaurant` or `FoodEstablishment`, `servesCuisine`, `menu` | |
| Any page with a FAQ | `FAQPage` | Questions and answers copied from the rendered FAQ |

Multi-language: one graph per language page, same `@id`s for the org and website
across languages, `WebPage.inLanguage` per route, `WebSite.inLanguage` as the list.
Founders/team: `founder: [{ @type: Person, name, sameAs: <LinkedIn> }]`, only for
people shown on the page.
