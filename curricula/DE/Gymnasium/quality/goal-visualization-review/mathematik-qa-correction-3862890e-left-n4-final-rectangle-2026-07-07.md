# Goal visualization review - Mathematik correction 3862890e left n4 final rectangle

Date: 2026-07-07
Subject: Mathematik
Goal ID: 3862890e-9ea9-4c62-bcf2-e354c9d8f306
Title: Bestimmtes Integral als Grenzwert von Ober- und Untersummen sowie als rekonstruierter Bestand deuten
Status: accepted_after_user_issue_correction

## User issue

In the upper-sum panels, the red rectangles must be exactly high enough that the upper edge touches the rising line at the right endpoint. This was mostly fixed, but in the left graph with `n=4`, the red rectangle on the interval `[3,4]` was still too high.

## Generation

- Pipeline: Nano Banana Pro via existing project script.
- Original public asset hash before correction: `sha256:8b740604120ea8efdd8ea96c1f40626691e72762641bf9ad94cb9e761141963d`
- Reference image: existing public asset for this goal.
- Prompt append: `tmp/goal-visualization-prompt-appends/mathematik-corrections/3862890e-9ea9-4c62-bcf2-e354c9d8f306.md`
- Accepted candidate: `tmp/goal-visualizations/3862890e-9ea9-4c62-bcf2-e354c9d8f306/generated/3862890e-9ea9-4c62-bcf2-e354c9d8f306.generated.2026-07-07T07-24-26-582Z.jpg`
- Imported public asset: `app/public/assets/goal-visualizations/mathematik/3862890e-9ea9-4c62-bcf2-e354c9d8f306/3862890e-9ea9-4c62-bcf2-e354c9d8f306.jpg`
- Canonical asset: `curricula/DE/Gymnasium/visualizations/mathematik/3862890e-9ea9-4c62-bcf2-e354c9d8f306/3862890e-9ea9-4c62-bcf2-e354c9d8f306.jpg`
- Asset hash: `sha256:f8e2a6af14f8a5f930174fdbeb05af3af0a38728bfee0a4c41a72cf8d53609a8`

## Provider request safety

The provider-facing text prompt was checked separately from embedded image bytes.

- Technical goal ID in prompt text: no
- Product/platform name in prompt text: no
- Internal repository path in prompt text: no
- School-form label in prompt text: no

## Rejected candidates

- `tmp/goal-visualizations/3862890e-9ea9-4c62-bcf2-e354c9d8f306/generated/3862890e-9ea9-4c62-bcf2-e354c9d8f306.generated.2026-07-07T07-22-02-885Z.jpg`: rejected because the critical final red rectangle in the left `n=4` graph still appeared essentially unchanged and too high.

## Review decision

Accepted.

- The function remains `f(t)=t+1` on `[0,4]`.
- In the left `n=4` upper-sum graph, the final red rectangle on `[3,4]` is lowered so its upper right corner touches the line at `t=4`.
- The final red rectangle no longer visibly extends above the rising line at the right endpoint.
- The other red upper-sum rectangles stay consistent with right endpoint heights.
- The blue lower-sum rectangles remain aligned with left endpoint heights.
- The displayed values remain correct: lower sum `n=4` is `10`, upper sum `n=4` is `14`, lower sum `n=8` is `11`, upper sum `n=8` is `13`.
- The common limit remains `integral_0^4 (t+1) dt = 12`.
- The reconstructed stock remains `B(4)=7+12=19`.
- Visible German text and umlauts are correct.
