# Goal visualization review - Mathematik correction ffd1ae26

Date: 2026-07-06
Subject: Mathematik
Goal ID: ffd1ae26-c461-4439-9b18-d835c8f38e1a
Title: Aehnlichkeit und Strahlensatz anwenden
Status: accepted_after_user_issue_correction

## User issue

The prior image did not clearly show `SA'` and `SB'` as full distances from `S` to `A'` and `S` to `B'`. The relation boxes also mixed ratio notation, division-like marks, and fractions.

## Generation

- Pipeline: Nano Banana Pro via existing project script.
- Reference image: existing public asset for this goal.
- Batch file: `tmp/goal-visualization-correction-ffd1ae26.txt`
- Prompt append: `tmp/goal-visualization-prompt-appends/mathematik-corrections/ffd1ae26-c461-4439-9b18-d835c8f38e1a.md`
- Rejected candidate: `tmp/goal-visualizations/ffd1ae26-c461-4439-9b18-d835c8f38e1a/generated/ffd1ae26-c461-4439-9b18-d835c8f38e1a.generated.2026-07-06T12-53-49-857Z.jpg`
  - Reason: `AB = 5` was placed on the ray segment from `A` to `A'` instead of on the connecting segment `AB`.
- Rejected candidate: `tmp/goal-visualizations/ffd1ae26-c461-4439-9b18-d835c8f38e1a/generated/ffd1ae26-c461-4439-9b18-d835c8f38e1a.generated.2026-07-06T12-56-43-598Z.jpg`
  - Reason: `SA' = 6` did not clearly reach `A'`, and `SB = 4` was missing in the geometry.
- Accepted candidate: `tmp/goal-visualizations/ffd1ae26-c461-4439-9b18-d835c8f38e1a/generated/ffd1ae26-c461-4439-9b18-d835c8f38e1a.generated.2026-07-06T12-59-33-108Z.jpg`
- Imported public asset: `app/public/assets/goal-visualizations/mathematik/ffd1ae26-c461-4439-9b18-d835c8f38e1a/ffd1ae26-c461-4439-9b18-d835c8f38e1a.jpg`
- Canonical asset: `curricula/DE/Gymnasium/visualizations/mathematik/ffd1ae26-c461-4439-9b18-d835c8f38e1a/ffd1ae26-c461-4439-9b18-d835c8f38e1a.jpg`
- Asset hash: `sha256:c9057fd4a92659dc4edd2ced5a490b079b00c37573bc4e31bf85c96d79ff6829`

## Provider request safety

The provider-facing text prompt was checked separately from embedded image bytes.

- Technical goal ID in prompt text: no
- Product/platform name in prompt text: no
- Internal repository path in prompt text: no
- School-form label in prompt text: no

## Review decision

Accepted.

- `SA' = 6` is shown as the full stretch from `S` to `A'`.
- `SB' = 8` is shown as the full stretch from `S` to `B'`.
- `AB = 5` is shown on the short connecting segment from `A` to `B`.
- `A'B' = 10` is shown on the long connecting segment from `A'` to `B'`.
- The connecting segments `AB` and `A'B'` are visually parallel.
- The relation boxes use clean fraction notation:
  - `SA / SA' = 3 / 6 = 1 / 2`
  - `SB / SB' = 4 / 8 = 1 / 2`
  - `AB / A'B' = 5 / 10 = 1 / 2`
- Visible German umlauts are correct.

Residual risk: the accepted image is a didactic sketch rather than a ruler-perfect construction, but the marked source and target of each displayed segment match the labels.
