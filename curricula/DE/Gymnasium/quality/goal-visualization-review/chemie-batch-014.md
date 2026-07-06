# Goal Visualization Review - Chemie Batch 014

Review date: 2026-07-06

Scope: canonical `DE Gymnasium Chemie`, user-triggered correction of one Nano Banana Pro visualization.

Status: `completed_with_user_review_correction`

Batch file: `tmp/goal-visualization-chemie-batch-014.txt`

Prompt append dir:

- `tmp/goal-visualization-prompt-appends/chemie-batch-014-user-correction`

Context:

- This correction replaces one previously accepted mass-conservation visualization after user review.
- The prior image was mostly correct, but in the right `nachher` panel the inflated balloon looked placed on the flask opening instead of visibly pulled over the flask neck.
- The replacement was generated through the existing Nano Banana Pro pipeline with the prior accepted image as a local image-to-image reference.
- The correction keeps the original layout, two-panel balance setup, `150 g` readings, separate particle inset, and closed-system message.
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

- The image-to-image correction succeeded without provider quota failure.
- `1` Chemie learning-goal asset was replaced after user review.
- `0` goals were deferred for provider limitations.

## Reviewed Assets

| Goal ID | Title | Decision | Review notes |
| --- | --- | --- | --- |
| `1bdaf7f2-ff3b-455a-a7fb-95a44642762a` | original Batch 006 accepted asset | `rejected_after_user_review_replaced` | Rejected after user review because the right `nachher` panel did not clearly show the inflated balloon pulled over and around the flask neck like the left `vorher` panel. The rest of the image was otherwise retained as the reference target. Replaced asset path: `app/public/assets/goal-visualizations/chemie/1bdaf7f2-ff3b-455a-a7fb-95a44642762a/1bdaf7f2-ff3b-455a-a7fb-95a44642762a.jpg`. |
| `1bdaf7f2-ff3b-455a-a7fb-95a44642762a` | Massenerhaltung bei Reaktionen erklären | `accepted_pilot_after_user_review_correction` | Accepted. The corrected image keeps both digital balance readings at `150 g`, preserves the two-panel `vorher`/`nachher` setup and the separate `A2 + B2 -> 2 AB` particle inset with exactly two red and two blue atoms before and after. In the right panel, the balloon neck is now visibly wrapped down over the outside rim of the flask neck, making the flask-balloon setup a closed system analogous to the left panel. No gas-escape cue or open-flask cue is shown. |

## Batch Checks

- `1` Chemie learning-goal asset was imported and accepted after user review correction.
- `1` previously accepted asset was replaced after user review.
- `0` Chemie learning-goal visualizations remain deferred from this correction.
- `0` provider quota failures occurred during Batch 014.
- The visible balloon-flask connection, digital mass readings, closed-system cue, particle counts, and reaction inset were checked for representational consistency.
- No Batch 014 asset used an SVG fallback as the final asset.
- No final live Batch 014 provider text input contains the string `SkillPilot`.
- No final live Batch 014 provider text input contains its canonical goal ID.
- No final live Batch 014 provider text input contains `Mathematik`.
- No final live Batch 014 provider text input contains `Physik`.
- No final live Batch 014 provider text input contains `DE_DEU`.
- No final live Batch 014 provider text input contains `Gymnasium`.
- No final live Batch 014 provider text input contains product/model names.
