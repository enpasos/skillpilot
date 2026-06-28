# Goal Visualization Review - Mathematik Batch 005

Review date: 2026-06-28

Scope: canonical `DE Gymnasium Mathematik`, atomic goals.

Generator:

- Provider: Google Gemini / Nano Banana Pro
- Model: `gemini-3-pro-image`
- MIME type: `image/jpeg`
- Aspect ratio: `16:9`
- Review status in JSON links: `pilot`

Prompt policy:

- Provider prompts use only title and learning-goal description plus targeted regeneration constraints where needed.
- SkillPilot IDs are not sent to the image model.
- IDs remain only in filenames, directories, JSON links, and prompt metadata.
- No SVG or hand-drawn replacement assets are used in this lane.

## Reviewed Assets

| Goal ID | Title | Decision | Notes |
| --- | --- | --- | --- |
| `191c67db-44a8-4f63-994a-d85e8e301194` | Rechenvorteile mit Kommutativ- und Assoziativgesetz nutzen | `accepted_pilot_after_regeneration` | First attempt was rejected because countable cube/object groups did not reliably match the shown numbers. Regenerated without countable object groups. Current asset uses number cards and exact equations `7 + 5 = 5 + 7 = 12` and `13 + 4 + 7 + 6 -> (13 + 7) + (4 + 6) = 20 + 10 = 30`; acceptable for pilot use. |
| `11e3cf89-9224-5894-8e4a-ae8ff5af0119` | Einfache additive Gleichungen durch Umkehraufgaben lösen | `accepted_pilot_after_regeneration` | First attempt was rejected because one final result line was ambiguous and abstract formula headers were unnecessary for grade 5. Regenerated as three concrete missing-number examples: `? + 18 = 45 -> 45 - 18 = 27 -> ? = 27`, `? - 7 = 12 -> 12 + 7 = 19 -> ? = 19`, and `30 - ? = 6 -> 30 - 6 = 24 -> ? = 24`. Current asset is acceptable. |
| `54148506-c23f-41b8-959b-068dd194cf15` | Einfache multiplikative Gleichungen durch Umkehroperationen lösen | `accepted_pilot` | Shows correct inverse operations for `3 · ? = 12`, `? : 5 = 4`, and `30 : ? = 6`. Header formulas are somewhat abstract, but the concrete examples are mathematically correct and suitable for controlled pilot use. |
| `f2d4a7de-57c3-5749-bbb4-6cd4b57b7562` | Teilbarkeitsregeln prüfen und Primfaktorzerlegungen angeben | `accepted_pilot` | Divisibility examples for `2`, `3`, `5`, and `10` are correct. The factor tree and result `36 = 2 · 2 · 3 · 3 = 2^2 · 3^2` are correct. Layout is dense, but no gross mathematical error is visible. |
| `eb993c0c-9b1d-52af-97c8-4a534fd78be3` | Potenzen mit natürlichen Exponenten und Zehnerpotenzen verwenden | `accepted_pilot_after_regeneration` | First attempt was rejected because a cube graphic for `2^3 = 8` looked like a `3 × 3 × 3` cube and could imply `27`. Regenerated without that misleading cube. Current asset correctly shows `2^3 = 2 · 2 · 2 = 8`, `10^1 = 10`, `10^2 = 100`, `10^3 = 1000`, and `10^4 = 10 000`; acceptable for pilot use. |

## Checks

- No current Batch 005 provider request contains a concrete SkillPilot goal ID.
- The current Batch 005 provider requests contain the generic negative phrase `no SkillPilot IDs` in the shared prompt append. This did not leak any concrete ID, but future prompt appends should use `no technical IDs` to avoid mentioning SkillPilot at all.
- Current reviewed assets do not visibly contain SkillPilot IDs.
- Regenerated assets replaced both canonical and public image copies.

## Follow-Up

For arithmetic visuals, prefer number cards and symbolic transformations over countable decorative object groups unless object counts are trivial and visually unambiguous. Future shared prompt appends should say `no technical IDs` instead of `no SkillPilot IDs`.
