# Goal Visualization Review - Mathematik Batch 192

Review date: 2026-07-16

Scope: targeted correction of the first six rejected assets from the fresh shard-3 AI review, in result order.

Status: `mixed_completed`

Context:

- Every candidate was generated through the existing Nano Banana Pro pipeline with `--no-import` and inspected at original resolution before any import.
- The targeted prompt append files live under `tmp/fresh-ai-review/corrections/`. Their provider-facing instructions contain no technical ID, filename, product name, or school-form label.
- Five corrected assets were accepted and imported as technical pilots. One asset was withdrawn after three rejected attempts and marked `deferred_provider_limitation`.
- No SVG or manually drawn replacement was used.

## Review Result

| Goal ID | Title | Decision | Review notes |
| --- | --- | --- | --- |
| `410221ed-540c-5daf-8c42-d8dd12e9100a` | Stichprobenumfang für vorgegebene Konfidenzniveaus planen (LK) | `accepted_pilot_after_regeneration` | The replacement removes all overlapping lower labels. It keeps one common interval center, shows the `n = 100` interval about twice as wide as the `n = 400` interval, and gives the correct conservative formula `n >= z^2 / (4 e^2)` with the correct 95%-and-0.05 example `n` approximately 385. |
| `b35f8254-dfcc-5d4d-b77f-7b182999617f` | Stil und Präzision verbessern (LK) | `accepted_pilot_after_second_regeneration` | The accepted second candidate uses `größer` and `präzise` with correct umlauts, shows the exact interval-specific monotonicity statement and a matching rising graph, and removes the course suffix that remained in the first candidate. |
| `95aa25c9-bf7f-53ee-bde2-df67cad3d46b` | Strategien optimieren (LK) | `accepted_pilot_after_second_regeneration` | The accepted second candidate removes branded devices and the English fragment retained by the first candidate. The function, derivative, critical point, marked maximum at `x = 25`, and value `1250` are mutually consistent. |
| `0190e463-51a7-4860-9b35-d875530a85ba` | Symmetrie ganzrationaler Funktionsgraphen am Term prüfen | `accepted_pilot_after_regeneration` | All three term rules are correct. The even quartic has its central maximum at `y = 1` above the x-axis and two minima below it; the odd cubic has the required left maximum and right minimum and is origin-symmetric; the mixed polynomial is shown without either claimed symmetry. |
| `f39c49c7-003b-471a-a33e-6cfea1d7b7b1` | Tabellen erstellen und beschriften | `accepted_pilot_after_regeneration` | The table contains exactly the correct time-distance pairs and units. The checklist now spells `passende Überschrift` correctly with `Ü`; all other visible labels are legible and correct. |
| `5d9c156b-e5a4-5e91-9da3-22e858eb1f8e` | Teilungsverhältnisse bei Strecken untersuchen | `deferred_provider_limitation` | No candidate was fully correct. Attempts 1 and 2 visibly placed `T` around one third of the diagonal despite the stated one-quarter ratio. Attempt 3 corrected the geometry by dividing a cuboid edge into four parts, but introduced the grammatically incorrect visible heading `Innere Teilungsverhältnis`. The active link and all deployed asset copies were removed. |

## Attempts

1. `410221ed-540c-5daf-8c42-d8dd12e9100a`
   - Attempt 1: `sha256:9aed038150f5038f5722f6d7d729a1a763b56938c7e812e306e742a9fac6d430` - accepted and imported.
2. `b35f8254-dfcc-5d4d-b77f-7b182999617f`
   - Attempt 1: `sha256:697bec578b8e0b5d5b8ccd7c38f8acf2f0a2109977c74bf57400c9dd13ca2789` - rejected because the reference-driven title still contained a course suffix.
   - Attempt 2: `sha256:76a7b64719d0837cc03701d8c6c41dfed496c67763a066f99b3edb25798254fe` - accepted and imported.
3. `95aa25c9-bf7f-53ee-bde2-df67cad3d46b`
   - Attempt 1: `sha256:72c19f9fb6ed17209e0a5c4e85b835030eb2fe1b71d42bb1d705e2a5e3e45154` - rejected because the reference-driven image retained the visible English fragment `no no insight`.
   - Attempt 2: `sha256:cab7058022835e3e55d2f489d60f17f31a97522b3ff910139944b1aa91127271` - accepted and imported.
4. `0190e463-51a7-4860-9b35-d875530a85ba`
   - Attempt 1: `sha256:571d28fd54dff3decbb19ae2ca1f39673e20b442a84cb2806f78c1d51070e328` - accepted and imported.
5. `f39c49c7-003b-471a-a33e-6cfea1d7b7b1`
   - Attempt 1: `sha256:d211d7ff5e51e946a197b08753026d92f800420a83f5c1272a01de414b0ed92e` - accepted and imported.
6. `5d9c156b-e5a4-5e91-9da3-22e858eb1f8e`
   - Attempt 1: `sha256:0fc5925be9b824bf32892930981205e130b075d36670c5e0a504626dbff47f74` - rejected; `T` was visibly about one third of the way along the space diagonal.
   - Attempt 2: `sha256:d625f1fb2d9da90f38e696287027de1a17bba19a45ecf3517154df1ec1e38eed` - rejected; color separation improved but `T` remained at about one third.
   - Attempt 3: `sha256:dcfc53c9a44861ff491c1d05b25a40dabcc4073b605596dfd691f6efa7a9d694` - rejected; the four-part cuboid-edge geometry was acceptable, but the visible German heading was grammatically wrong.

## Active Asset Hashes

- `410221ed-540c-5daf-8c42-d8dd12e9100a`: `sha256:9aed038150f5038f5722f6d7d729a1a763b56938c7e812e306e742a9fac6d430`
- `b35f8254-dfcc-5d4d-b77f-7b182999617f`: `sha256:76a7b64719d0837cc03701d8c6c41dfed496c67763a066f99b3edb25798254fe`
- `95aa25c9-bf7f-53ee-bde2-df67cad3d46b`: `sha256:cab7058022835e3e55d2f489d60f17f31a97522b3ff910139944b1aa91127271`
- `0190e463-51a7-4860-9b35-d875530a85ba`: `sha256:571d28fd54dff3decbb19ae2ca1f39673e20b442a84cb2806f78c1d51070e328`
- `f39c49c7-003b-471a-a33e-6cfea1d7b7b1`: `sha256:d211d7ff5e51e946a197b08753026d92f800420a83f5c1272a01de414b0ed92e`
- `5d9c156b-e5a4-5e91-9da3-22e858eb1f8e`: no active asset; provider-deferred.

Human mathematical, accessibility, and rights approval remains open for every accepted pilot asset.
