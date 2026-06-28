# Goal Visualization Review - Mathematik Batch 001

Review date: 2026-06-28

Scope: canonical `DE Gymnasium Mathematik`, atomic goals.

Generator:

- Provider: Google Gemini / Nano Banana Pro
- Model: `gemini-3-pro-image`
- MIME type: `image/jpeg`
- Aspect ratio: `16:9`
- Review status in JSON links: `pilot`

Prompt policy:

- Provider prompts use only title and learning-goal description.
- SkillPilot IDs are not sent to the image model.
- IDs remain only in filenames, directories, JSON links, and prompt metadata.

## Reviewed Assets

| Goal ID | Title | Decision | Notes |
| --- | --- | --- | --- |
| `4b67bed9-06da-40b2-a306-24e9e7dfd390` | Ganze Zahlen addieren | `accepted_pilot_after_regeneration` | First attempt rejected because chip labels made the value representation misleading. Regenerated as a single number-line model for `(-3)+(+5)=+2`; current asset has no gross mathematical error. |
| `d07ef7b1-8bd2-56e0-9e74-d90c3c3e02fe` | Ganze Zahlen ordnen und an der Zahlengeraden darstellen | `accepted_pilot_after_regeneration` | First attempt rejected because example text and marked positions did not match. Regenerated as a constrained number-line asset showing `-4 < -2 < +1`; current asset has no gross mathematical error. |
| `3fde4db5-9e92-5f3a-98e1-d386a42b9e01` | Ganze Zahlen subtrahieren | `accepted_pilot` | Shows subtraction of a negative number, inverse check, number-line idea, and context examples. Layout is busy but mathematically acceptable. |
| `9ef6c4fa-b97a-5d7a-86c1-96690f02d916` | Natürliche Zahlen ordnen und vergleichen | `accepted_pilot` | Comparisons and ascending order are correct. Minor wording polish possible, no blocker. |
| `d825f7ce-e19b-594a-8181-eff199c21d93` | Mit natürlichen Zahlen in Grundsituationen rechnen | `accepted_pilot` | Basic operations, strategy choice, and plausibility check are coherent. No blocker. |
| `e82d8d3a-9012-5482-afe6-ab0d727a49bb` | Rechnungen mit Umkehroperationen überprüfen | `accepted_pilot` | Inverse operations for addition/subtraction and multiplication/division are shown correctly. No blocker. |

## Checks

- No current Batch 001 provider request contains a SkillPilot ID.
- No current Batch 001 provider request contains the string `SkillPilot`.
- Current reviewed assets do not visibly contain SkillPilot IDs.
- `npm --prefix app run validate:graph` passed after import.

## Follow-Up

For larger batches, keep the same rule: every generated image must be visually reviewed before being treated as more than `pilot`. Reject and regenerate assets with wrong values, mismatched markers, invalid notation, misspelled core mathematical terms, or misleading representations.
