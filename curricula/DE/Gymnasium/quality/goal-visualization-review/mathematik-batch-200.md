# Goal Visualization Review - Mathematik Batch 200

Review date: 2026-07-16

Scope: targeted correction of six rejected assets from the fresh shard-3 AI review.

Status: `completed_with_two_open_provider_credit_exhausted_corrections`

Context:

- Every produced candidate was generated through the existing Nano Banana Pro pipeline with `--no-import` and inspected at original resolution before an import decision.
- Provider-facing prompt append files contain no technical ID, filename, product or platform name, path, or school-form label.
- Four replacements passed visual mathematical and orthographic review and were imported as generated raster assets. No SVG or manual fallback was used.
- Two first candidates remained visually ambiguous. Their targeted second requests produced no image because the provider reported exhausted prepaid credits.
- Those two corrections remain open with `provider_credit_exhausted`; they are not classified as `deferred_provider_limitation`, because there were not three generated-but-rejected candidates. Their existing active assets and links remain unchanged.
- This review does not alter QA AI fields or generated aggregate and rollout status artifacts.

## Review Result

| Goal ID | Title | Decision | Review notes |
| --- | --- | --- | --- |
| `4fc77ab5-90aa-4aa7-941f-6c807dde54fe` | Volumen von schiefen Prismen und Pyramiden plausibilisieren | `correction_open_provider_credit_exhausted` | The candidate adds a useful `1/3`, `2/3`, `3/3` sequence, but its source pyramid is not visibly full to the rim. A targeted clarification could not be generated after provider credits were exhausted. No replacement was imported. |
| `57fbbf31-9b8c-5408-9af5-fbc73acd12bb` | Volumeneinheiten deuten und umrechnen | `accepted_pilot_after_regeneration` | The full cubic metre is correctly `1000 dm³`, an individual small cube is `1 dm³`, and all litre and millilitre conversions are consistent. |
| `1f89d69e-ead1-424b-8221-fae37fdea2bc` | Volumina und Oberflächen einfacher Körper berechnen | `accepted_pilot_after_regeneration` | The `50 cm × 30 cm × 40 cm` cuboid consistently yields `60000 cm³ = 60 dm³ = 60 l` and `9400 cm²`. |
| `01acfcc8-7204-5c22-8774-13f6383f4fd4` | Von der Ableitung an einer Stelle zur Ableitungsfunktion übergehen | `accepted_pilot_after_regeneration` | Tangents, the `−2, 0, 2` derivative table, and the line `f′(x)=2x` agree at all three marked points. |
| `27b63e2e-6a34-483e-8e5a-fe0f49670d1d` | Wachstums- und Abklingvorgänge exponentiell modellieren und Ergebnisse im Kontext bewerten | `accepted_pilot_after_regeneration` | The exponent is clearly `t/4`; the table and graph correctly implement a four-hour half-life and name both assumption and model limit. |
| `d8305a49-6d45-52aa-ab88-9163c3b9f198` | Wahrscheinlichkeiten anhand von Termen vergleichen | `correction_open_provider_credit_exhausted` | Although colors and terms are correct, an underbrace groups only part of the even-number event. The targeted brace-free request could not generate after provider credits were exhausted. No replacement was imported. |

## Attempts and Active State

- `4fc77ab5-90aa-4aa7-941f-6c807dde54fe`: attempt 1 rejected (`sha256:68f33d6fad9d69c7774a53b46a7234211ea800cc750f748e3db61e007a58fb98`); attempt 2 produced no candidate (`provider_credit_exhausted`). Existing active asset retained at `sha256:cb3df0ae97dd66630ca0d8a410a36f57d7e1875d430341f79b299eb148082da0`.
- `57fbbf31-9b8c-5408-9af5-fbc73acd12bb`: attempt 1 accepted and imported, `sha256:82defa70bb8a352c648903d9ec6e18c22bd072f7d49a2f9f9dc47cbf9b956b08`.
- `1f89d69e-ead1-424b-8221-fae37fdea2bc`: attempt 1 accepted and imported, `sha256:e783c47c4ba3f59b7da191250ddeabab870eb3f61224817163cfb3bc433a1d5b`.
- `01acfcc8-7204-5c22-8774-13f6383f4fd4`: attempt 1 accepted and imported, `sha256:4d6a0fe35a50b498a3003de5f21fb687c405f34018f609de525302e682bb7463`.
- `27b63e2e-6a34-483e-8e5a-fe0f49670d1d`: attempt 1 accepted and imported, `sha256:3d31355a685bfc018d54490f5f33230c3a73f665bbbc8c3d7418b0fadcb96fc2`.
- `d8305a49-6d45-52aa-ab88-9163c3b9f198`: attempt 1 rejected (`sha256:a4da49c196b94ce0911418cd13c60dff4213079a4bb275a72757063d7707fca6`); attempt 2 produced no candidate (`provider_credit_exhausted`). Existing active asset retained at `sha256:c7485cde3b8c0b3f8f0335b5679c827ef43296ac10e6349c9c5749c91d055105`.

Human mathematical, accessibility, and rights approval remains open for every accepted pilot asset.
