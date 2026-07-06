# Goal visualization review - Mathematik correction ffd1ae26 v2

Date: 2026-07-06
Subject: Mathematik
Goal ID: ffd1ae26-c461-4439-9b18-d835c8f38e1a
Title: Ähnlichkeit und Strahlensatz anwenden
Status: accepted_after_second_user_issue_correction

## User issue

The previously accepted correction still displayed `SA'` and `SB'` too much like partial segments. In the Strahlensatz diagram, `SA'` must mean the full stretch from `S` to `A'`, and `SB'` must mean the full stretch from `S` to `B'`.

## Generation

- Pipeline: Nano Banana Pro via existing project script.
- Prompt append: `tmp/goal-visualization-prompt-appends/mathematik-corrections/ffd1ae26-c461-4439-9b18-d835c8f38e1a.md`
- Temporary reference sketch: `tmp/goal-visualizations/ffd1ae26-c461-4439-9b18-d835c8f38e1a/reference/correct-strahlensatz-reference.png`
- Accepted candidate: `tmp/goal-visualizations/ffd1ae26-c461-4439-9b18-d835c8f38e1a/generated/ffd1ae26-c461-4439-9b18-d835c8f38e1a.generated.2026-07-06T14-34-27-937Z.jpg`
- Imported public asset: `app/public/assets/goal-visualizations/mathematik/ffd1ae26-c461-4439-9b18-d835c8f38e1a/ffd1ae26-c461-4439-9b18-d835c8f38e1a.jpg`
- Canonical asset: `curricula/DE/Gymnasium/visualizations/mathematik/ffd1ae26-c461-4439-9b18-d835c8f38e1a/ffd1ae26-c461-4439-9b18-d835c8f38e1a.jpg`
- Asset hash: `sha256:94e4e79c3bc6fdcc3ac49936d2df66ae399b3463215dc56ab3455a591ac9d38b`

## Provider request safety

The provider-facing text prompt was checked separately from embedded image bytes.

- Technical goal ID in prompt text: no
- Product/platform name in prompt text: no
- Internal repository path in prompt text: no
- School-form label in prompt text: no

## Review decision

Accepted.

- `SA' = 6` is now shown as a long measurement line for the full stretch from the `S` side to the `A'` side, not as the partial segment from `A` to `A'`.
- `SB' = 8` is now shown as a long measurement line for the full stretch from the `S` side to the `B'` side, not as the partial segment from `B` to `B'`.
- `SA = 3` and `SB = 4` are shown as the shorter stretches from `S` to `A` and from `S` to `B`.
- `AB = 5` is shown on the short connecting segment from `A` to `B`, and `A'B' = 10` is shown on the long connecting segment from `A'` to `B'`.
- The connecting segments `AB` and `A'B'` are visually parallel.
- The relation boxes use clean fraction notation:
  - `SA / SA' = 3 / 6 = 1 / 2`
  - `SB / SB' = 4 / 8 = 1 / 2`
  - `AB / A'B' = 5 / 10 = 1 / 2`
- Visible German umlauts are correct, including `Ähnlichkeit` and `ähnliche`.

Residual risk: the measurement lines are offset schematic construction marks rather than ruler-perfect overlays on the rays. They no longer encode the wrong source-target relation that caused the human issue.
