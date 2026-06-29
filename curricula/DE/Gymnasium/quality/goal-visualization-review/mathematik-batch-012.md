# Goal Visualization Review - Mathematik Batch 012

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
| `59d5a330-61be-4590-ab46-cf7cefecd144` | Volumen und Oberflächen gerader Prismen berechnen | `accepted_pilot` | Uses a right triangular prism with base sides `3 cm`, `4 cm`, `5 cm` and prism length `10 cm`. The base area `G = 3 cm * 4 cm / 2 = 6 cm^2`, volume `V = 60 cm^3`, mantle `M = (3 cm + 4 cm + 5 cm) * 10 cm = 120 cm^2`, and surface area `O = 132 cm^2` are correct. |
| `8064088b-dc0a-4a67-ad63-360fdcc9869d` | Umfang und Flächeninhalt von Kreisen und Kreisteilen berechnen | `accepted_pilot` | Separates circumference and area for a full circle with `r = 3 cm` and shows a semicircle with `r = 4 cm`. The formulas and approximations `U = 6 pi cm approx. 18.85 cm`, `A = 9 pi cm^2 approx. 28.27 cm^2`, arc length `4 pi cm approx. 12.57 cm`, and total semicircle boundary `4 pi cm + 8 cm approx. 20.57 cm` are correct. |
| `8a691345-3216-522c-a898-d65e8e94db28` | Zahl Pi als Verhältnis am Kreis erklären | `accepted_pilot` | Focuses on `pi = U / d` only and avoids area formulas. Both examples, `31.4 / 10 approx. 3.14` and `18.8 / 6 approx. 3.14`, correctly illustrate the same circumference-to-diameter ratio. |
| `c823b5a2-82e3-5e22-9c27-c0f41cc5eac6` | Elementare Körper erkennen und benennen | `accepted_pilot` | Shows exactly the required solids: cube, cuboid, triangular prism, cylinder, pyramid, cone, and sphere. The labels are readable and the shapes are fachlich distinguishable without unnecessary formulas. |
| `1335dff9-db1e-5dd6-aa55-3938b6d3b0ec` | Achsenspiegelungen und Punktspiegelungen durchführen | `accepted_pilot_after_regeneration` | First attempt was rejected because the point-reflection panel added a segment that was not clearly reflected through `Z`. The replacement reduces the point-reflection panel to one point pair `P`, `P'` with `Z` as midpoint. The axis-reflection panel marks horizontal perpendicular segments to the vertical mirror line and equal distances on both sides. |

## Checks

- No current Batch 012 provider request contains a concrete SkillPilot goal ID.
- No current Batch 012 provider request contains the string `SkillPilot`.
- Current reviewed assets do not visibly contain SkillPilot IDs.
- The rejected reflection attempt was replaced with a Nano Banana Pro regeneration, not with an SVG fallback asset.
- No Batch 012 asset is marked `deferred_provider_limitation`.
