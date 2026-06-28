# Goal Visualization Review - Mathematik Batch 006

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
- Concrete SkillPilot IDs are not sent to the image model.
- Provider-facing constraints use neutral wording such as `technical IDs`.
- IDs remain only in filenames, directories, JSON links, and prompt metadata.
- No SVG or hand-drawn replacement assets are used in this lane.

## Reviewed Assets

| Goal ID | Title | Decision | Notes |
| --- | --- | --- | --- |
| `5d1decb2-b01b-5c85-88fc-9fc255ff9776` | Klammerterme und Rechenreihenfolge sicher auswerten | `accepted_pilot` | Shows the correct order for `(3 + 4) * 2 - 5`: parentheses first, multiplication before subtraction, final result `9`. Suitable for controlled pilot use. |
| `2ae76eae-799c-463e-9ec9-82327f8209a8` | Einfache Zählprinzipien in Sachsituationen anwenden | `accepted_pilot_after_regeneration` | First attempt contained an ambiguous unpaired icon row; second attempt contradicted its table axes. Third attempt uses only a tree diagram with exactly two shirt choices, three trouser choices per shirt, six clear leaves, and `2 * 3 = 6 Möglichkeiten`. Current asset is acceptable. |
| `b5de0574-93ed-409c-80ee-312211420cd6` | Problemstellungen mit ganzen Zahlen heuristisch lösen und Rechenwege dokumentieren | `accepted_pilot` | Uses a temperature context, a number line, and documented steps `(-3) + (+5) = +2`. It also shows checking the documented path without replacing the reasoning. Acceptable for pilot use. |
| `314854a0-4e97-462e-9486-9fd83652e91d` | Taschenrechner situationsgerecht nutzen | `accepted_pilot_after_regeneration` | First attempt contained a random wrong calculator display; second attempt introduced advanced and grade-inappropriate notation. Third attempt restricts visible arithmetic to `5 * 10 = 50`, `487 + 268 = 755` with an estimate, `3 / 10 = 0.3` clearly marked implausible for the bread context, `3 * 10 = 30`, and `19 + 21 = 40` checked by `20 + 20 = 40`. Current asset is acceptable. |
| `c3cce9a1-9adc-4470-b2d8-aea81d6d7b65` | Messungen in Umwelt und Quellenmaterial durchführen | `accepted_pilot_after_regeneration` | First attempt had visible language defects such as a misspelled measuring-tool label and English text. Regenerated with four German panels for `Bandmaß`, `Digitalwaage`, `Rezept`, and `Wetter-App`; conversions `1 m 25 cm = 1,25 m`, `450 g = 0,450 kg`, `0,5 l = 500 ml`, and `-2 °C` on a number line are correct. |

## Checks

- No current Batch 006 provider request contains a concrete SkillPilot goal ID.
- No current Batch 006 provider request contains the string `SkillPilot`.
- Current reviewed assets do not visibly contain SkillPilot IDs.
- Regenerated assets replaced both canonical and public image copies.

## Follow-Up

The batch planner now skips goals marked `deferred_provider_limitation` in review ledgers by default. Use `--include-deferred` only for an explicit future retry.
