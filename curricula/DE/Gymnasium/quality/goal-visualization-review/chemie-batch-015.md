# Goal Visualization Review - Chemie Batch 015

Review date: 2026-07-06

Scope: canonical `DE Gymnasium Chemie`, user-triggered correction of one Nano Banana Pro visualization after visible umlaut/ß audit.

Status: `completed_with_user_review_correction`

Batch file: `tmp/goal-visualization-chemie-batch-015.txt`

Prompt append dir:

- `tmp/goal-visualization-prompt-appends/chemie-batch-015-umlaut-correction`
- Earlier rejected attempts are preserved under `tmp/goal-visualization-prompt-appends/chemie-umlaut-corrections-001` through `tmp/goal-visualization-prompt-appends/chemie-umlaut-corrections-004`.

Audit inputs:

- Full public asset audit: `tmp/goal-visualization-umlaut-audit.jsonl`
- Human-readable report: `tmp/goal-visualization-umlaut-audit.md`
- TSV issue list: `tmp/goal-visualization-umlaut-issues.tsv`
- Focused public re-check for the corrected image: `tmp/goal-visualization-umlaut-audit-1f354a60-public.jsonl`

Audit summary:

- `1258` public goal-visualization images scanned.
- `0` OCR/API scan errors.
- `156` images flagged with likely visible umlaut/ß spelling issues.
- Subject split: `20` Chemie, `34` Mathematik, `102` Physik.

Context:

- This correction replaces one previously accepted discussion visualization after user review identified visible ASCII umlaut spellings in the image.
- The original accepted Batch 004 asset used `Begruendung`, `Standpunkt pruefen`, and `Saeure + Carbonat`.
- Several image-to-image correction attempts fixed some words but not all, or introduced extra notation.
- The accepted replacement keeps the learning goal visual: evidence-based chemical discussion about whether vinegar cleaner should be used on marble.
- Final accepted asset is a Nano Banana Pro output. No SVG fallback was used as a final asset.

Generator/prompt policy:

- Final live provider text input does not contain the string `SkillPilot`.
- Final live provider text input does not contain the canonical goal ID.
- Final live provider text input does not contain `Mathematik`.
- Final live provider text input does not contain `Physik`.
- Final live provider text input does not contain `DE_DEU`.
- Final live provider text input does not contain `Gymnasium`.
- Final live provider text input does not contain product/model names.
- Canonical IDs are used only for local paths, metadata, JSON links, and deployment.

Provider notes:

- The accepted correction succeeded without provider quota failure.
- `1` Chemie learning-goal asset was replaced after user review.
- `0` goals were deferred for provider limitations.
- Full correction of the remaining audit findings is not closed by this batch; the remaining known findings stay in `tmp/goal-visualization-umlaut-issues.tsv`.

## Reviewed Assets

| Goal ID | Title | Decision | Review notes |
| --- | --- | --- | --- |
| `1f354a60-be44-512b-8f8b-f67c8c456035` | original Batch 004 accepted asset | `rejected_after_user_review_replaced` | Rejected after user review because the original image visibly used ASCII umlaut substitutes: `Begruendung`, `Standpunkt pruefen`, and `Saeure + Carbonat`. Replaced asset path: `app/public/assets/goal-visualizations/chemie/1f354a60-be44-512b-8f8b-f67c8c456035/1f354a60-be44-512b-8f8b-f67c8c456035.jpg`. |
| `1f354a60-be44-512b-8f8b-f67c8c456035` | Chemische Sachverhalte fachlich diskutieren | `accepted_pilot_after_user_review_correction` | Accepted. The replacement uses a four-card evidence chain: `Aussage`, `Beleg`, `Grund`, `Standpunkt bewerten`; shows `Soll Essigreiniger auf Marmor?`, `Beobachtung: Blasenbildung`, `Reaktion: Essig + Carbonat`, `Schluss: nicht geeignet`, and a crossed-out `nur Meinung` card. The visual chemistry is limited to vinegar cleaner, marble/carbonate, bubbles, and the conclusion that the cleaner is unsuitable. Focused OCR re-check reported `0` umlaut issues and no uncertain findings. |

## Rejected Candidates

| Goal ID | Candidate | Decision | Reason |
| --- | --- | --- | --- |
| `1f354a60-be44-512b-8f8b-f67c8c456035` | `tmp/goal-visualizations/1f354a60-be44-512b-8f8b-f67c8c456035/generated/1f354a60-be44-512b-8f8b-f67c8c456035.generated.2026-07-06T04-25-36-725Z.jpg` | `rejected_regenerated` | Corrected `Begründung` and `prüfen`, but still displayed `Saeure + Carbonat`. |
| `1f354a60-be44-512b-8f8b-f67c8c456035` | `tmp/goal-visualizations/1f354a60-be44-512b-8f8b-f67c8c456035/generated/1f354a60-be44-512b-8f8b-f67c8c456035.generated.2026-07-06T04-26-39-970Z.jpg` | `rejected_regenerated` | Still displayed `Saeure + Carbonat` and added unnecessary equation text. |
| `1f354a60-be44-512b-8f8b-f67c8c456035` | `tmp/goal-visualizations/1f354a60-be44-512b-8f8b-f67c8c456035/generated/1f354a60-be44-512b-8f8b-f67c8c456035.generated.2026-07-06T04-27-50-369Z.jpg` | `rejected_regenerated` | Avoided `Saeure` by changing to `Essig + Carbonat`, but reintroduced `Begruendung` and `pruefen`. |
| `1f354a60-be44-512b-8f8b-f67c8c456035` | `tmp/goal-visualizations/1f354a60-be44-512b-8f8b-f67c8c456035/generated/1f354a60-be44-512b-8f8b-f67c8c456035.generated.2026-07-06T04-28-59-051Z.jpg` | `rejected_regenerated` | Removed the umlaut issue but added formula-like notation on the `Grund` card that could be read as unsupported chemical structure notation. |

## Batch Checks

- `1` Chemie learning-goal asset was imported and accepted after user review correction.
- `1` previously accepted asset was replaced after user review.
- `0` Chemie learning-goal visualizations remain deferred from this correction.
- `0` provider quota failures occurred during Batch 015.
- The accepted replacement image was imported to canonical and public Chemie asset paths.
- Focused public OCR re-check for `1f354a60-be44-512b-8f8b-f67c8c456035` reported `0` issues.
- Every visible card arrow in the accepted replacement was checked for source-target consistency: statement/question -> observation/evidence -> reaction reason -> conclusion/standpoint.
- The accepted replacement avoids visible ASCII umlaut substitutes.
- No Batch 015 asset used an SVG fallback as the final asset.
- No final live Batch 015 provider text input contains the string `SkillPilot`.
- No final live Batch 015 provider text input contains its canonical goal ID.
- No final live Batch 015 provider text input contains `Mathematik`.
- No final live Batch 015 provider text input contains `Physik`.
- No final live Batch 015 provider text input contains `DE_DEU`.
- No final live Batch 015 provider text input contains `Gymnasium`.
- No final live Batch 015 provider text input contains product/model names.
