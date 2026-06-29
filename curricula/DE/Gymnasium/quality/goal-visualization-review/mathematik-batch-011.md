# Goal Visualization Review - Mathematik Batch 011

Review date: 2026-06-28

Scope: canonical `DE Gymnasium Mathematik`, atomic goals.

Generator:

- Provider: Google Gemini / Nano Banana Pro
- Model: `gemini-3-pro-image`
- MIME type: `image/jpeg`
- Aspect ratio: `16:9`
- Review status in JSON links: `pilot`

Prompt policy:

- Provider prompts use only title and learning-goal description plus batch-level mathematical constraints.
- Concrete SkillPilot IDs are not sent to the image model.
- Provider-facing constraints use neutral wording such as `technical IDs`.
- IDs remain only in filenames, directories, JSON links, and prompt metadata.
- No SVG or hand-drawn replacement assets are used in this lane.

## Reviewed Assets

| Goal ID | Title | Decision | Notes |
| --- | --- | --- | --- |
| `491e0858-e977-516e-a339-1cc2f9e9690f` | Flächenformeln ebener Figuren durch Zerlegen und Ergänzen herleiten | `accepted_pilot` | Shows rectangle-based transformations for parallelogram, triangle, and trapezoid. The formulas `A = g * h`, `A = g * h / 2`, and `A = (a + c) * h / 2` are correct. The visual wording around the enclosing rectangle is a minor polish issue, but it does not create a mathematical error. |
| `b44f038c-fb1f-527e-b9ad-382214d0328a` | Volumenformel des Quaders mit Einheitswürfeln plausibilisieren | `accepted_pilot_after_regeneration` | First attempt was rejected because the base area was labeled with volume units. The replacement correctly separates base area `12 FE`, height `5 LE`, and volume `60 VE`, and it supports the unit-cube justification of `V = G * h`. |
| `57fbbf31-9b8c-5408-9af5-fbc73acd12bb` | Volumeneinheiten deuten und umrechnen | `accepted_pilot` | Correctly connects `1 dm^3 = 1 L`, `1 cm^3 = 1 mL`, and a factor of `1000` between neighboring cubic units. The example `2.5 dm^3 = 2500 cm^3 = 2.5 L` is mathematically correct. |
| `87c55be5-06a9-41e2-a0d4-c60f7c8b8078` | Flächeninhalte ebener Figuren berechnen | `accepted_pilot_after_regeneration` | Earlier attempts with a composite figure were rejected because the visual calculation and marked dimensions were inconsistent. The accepted replacement removes the composite figure and uses three safe standard examples: parallelogram `6 cm * 4 cm = 24 cm^2`, triangle `8 cm * 5 cm / 2 = 20 cm^2`, and trapezoid `(7 cm + 3 cm) / 2 * 4 cm = 20 cm^2`. |
| `1f89d69e-ead1-424b-8221-fae37fdea2bc` | Volumina und Oberflächen einfacher Körper berechnen | `accepted_pilot_after_regeneration` | First attempt was rejected because the cubic-unit ladder was misleading. The replacement shows correct unit relations such as `1 cm^3 = 1000 mm^3` and `1 dm^3 = 1000 cm^3`, and the cuboid example `50 * 30 * 40 = 60000 cm^3 = 60 dm^3` is correct. |

## Checks

- No current Batch 011 provider request contains a concrete SkillPilot goal ID.
- No current Batch 011 provider request contains the string `SkillPilot`.
- Current reviewed assets do not visibly contain SkillPilot IDs.
- Rejected attempts were replaced with Nano Banana Pro regenerations, not with SVG fallback assets.
- No Batch 011 asset is marked `deferred_provider_limitation`.
