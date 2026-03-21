# Baden-Wuerttemberg Mathematics Structure Note

State: `2026-03-21`

This note records the first source-snapshot scope for the mathematics-first DE expansion track in Baden-Wuerttemberg.

Source files:

- combined Gymnasium mathematics PDF:
  `curricula/DE/Gymnasium/input/BW/BP2016BW_ALLG_GYM_M.pdf`

Initial source snapshots:

- Sek I:
  `curricula/DE/Gymnasium/input/BW/lower-secondary/source-json/DE_BAW_S_GYM_1_MATHEMATIK.de.json.snapshot`
- Sek II:
  `curricula/DE/Gymnasium/input/BW/upper-secondary/source-json/DE_BAW_S_GYM_2_MATHEMATIK.de.json.snapshot`

Current import boundary:

- the archived Baden-Wuerttemberg source snapshots are intentionally partial pilot subsets, not full subject imports
- the first active source snapshots currently cover the lower-secondary shared functions corridor and the first upper-secondary analysis corridor
- the imported Sek-I slice currently covers:
  - the curriculum-wide orientation layer from `1.1 Bildungswert des Faches Mathematik`
  - `3.1.4 Leitidee Funktionaler Zusammenhang` in `Klassen 5/6`
  - `3.2.4 Leitidee Funktionaler Zusammenhang` in `Klassen 7/8`
- the imported Kursstufe / Sek-II slice currently covers:
  - the shared orientation layer from `1.4 Basisfach und Leistungsfach in der Oberstufe`
  - `3.5.4 Leitidee Funktionaler Zusammenhang` in `Basisfach`
  - `3.4.4 Leitidee Funktionaler Zusammenhang` in `Leistungsfach`

Operational interpretation:

- the first Baden-Wuerttemberg canonical mapping work should start from these archived source goal IDs, not directly from the PDF
- the archived Sek-I function corridor has now already been refined once with a retained split on the former broad `JG7/8` representation atom `d45b4ec2-8604-490e-9c11-d3b8fc54251b`
- the first reviewed Baden-Wuerttemberg upper-secondary analysis mapping pass is now active on eleven rows:
  - the exact course-stage motivation anchor `f84004f9-0987-40f4-88dd-830c039b7bf6 -> 71cec9fb-3751-4d61-8b34-c5adbbf6e5f2`
  - the retained-split Basisfach e-function-properties bridge `e0769810-ba73-4a52-8e9c-660d1fb9d6e6 -> 4047af71-de53-5dc3-80c6-a7c78fb4bfe4`
  - the retained Basisfach antiderivative bridge `7bf62048-84ba-467f-ba23-f053c4e2989f -> a9ed219d-d497-55e5-a4e0-4d45d2554f6b`
  - the retained Basisfach composition bridge `46690ab9-0b1f-4bd9-9409-4976a40c6ec2 -> e9ad45b9-c0d2-5804-b6bf-79e5ce041d2c`
  - the retained Basisfach optimization / application bridge `c5739dd3-a261-4229-aff6-678d8ee618b3 -> 1511b39a-4094-5450-a755-4a3ad3339733`
  - the aligned Leistungsfach composition / asymptote bridge `13e285f3-522c-4eae-9fed-8b13b2af7b7d -> e9ad45b9-c0d2-5804-b6bf-79e5ce041d2c`
  - the aligned Leistungsfach optimization / function-family bridge `8ab263f6-a460-4ca2-bbe9-b7e9a22bbaa2 -> 1511b39a-4094-5450-a755-4a3ad3339733`
  - the exact introductory-integral child bridge `97ab0ab9-9444-410d-b2d9-1ac9fa935ad8 -> 2afba4a2-287d-5e8f-aeee-a3bcf8652236`
  - the partial Hauptsatz child bridge `e0c333ea-9873-4718-819c-d39b22ccee30 -> b9bbd2a8-1379-5ffb-817f-41467d48abef`
  - the retained-split Leistungsfach introductory-integral bridge `72d7ad67-e2ef-41a0-bb52-b62eb5d071e0 -> 2afba4a2-287d-5e8f-aeee-a3bcf8652236`
  - the retained-split Leistungsfach Hauptsatz / Integralfunktions bridge `fb742d93-6c9b-487a-bc7c-f54b363c0c01 -> b9bbd2a8-1379-5ffb-817f-41467d48abef`
- the former broad Basisfach e-function atom `d061f00d-6118-46de-a476-ec4c9112e222` now also survives only as a retained split parent over:
  - `e0769810-ba73-4a52-8e9c-660d1fb9d6e6` for the natural-e-function surface with derivative claim
  - `7bf62048-84ba-467f-ba23-f053c4e2989f` for the isolated Stammfunktionsaussage
- the former broad Basisfach integral atom `8f8c4bc8-5b0c-4a62-b6d7-f7fb263c7f1d` now survives only as a retained split parent over:
  - `97ab0ab9-9444-410d-b2d9-1ac9fa935ad8` for introductory integral / bestandsorientierte Deutung
  - `e0c333ea-9873-4718-819c-d39b22ccee30` for Hauptsatz / Stammfunktionsgraphen
- the former broad Leistungsfach integral atom `37d1e9d7-6909-4421-a9f1-11f7b41061ff` now also survives only as a retained split parent over:
  - `72d7ad67-e2ef-41a0-bb52-b62eb5d071e0` for introductory integral / Rekonstruktion aus Aenderungsraten
  - `fb742d93-6c9b-487a-bc7c-f54b363c0c01` for Hauptsatz / Integralfunktion / Stammfunktionsgraphen / Linearitaet
- the retained BW Kursstufe prerequisite bridge now also reaches through the approximate-area canonical leaf `94d63ad9-ae1c-5ff2-b05e-188a0f5ebec6`, because that is the smallest didactic prerequisite closure for the active Hauptsatz route
- the adjacent aligned Leistungsfach composition / application pair is now also active on the already opened upper-secondary analysis corridor, so the remaining cleaner follow-on should target the still-unmapped broad Leistungsfach e/logarithm front atom `fa4597c7-fabd-4a55-8be3-d06f7c432738`
