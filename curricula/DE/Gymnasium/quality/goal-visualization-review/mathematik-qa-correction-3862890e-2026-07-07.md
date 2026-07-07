# Goal visualization review - Mathematik correction 3862890e

Date: 2026-07-07
Subject: Mathematik
Goal ID: 3862890e-9ea9-4c62-bcf2-e354c9d8f306
Title: Bestimmtes Integral als Grenzwert von Ober- und Untersummen sowie als rekonstruierter Bestand deuten
Status: accepted_after_user_issue_correction

## User issue

In the upper-sum panels, the red rectangles were too high. For an increasing line, each upper-sum rectangle must have the height of the function value at the right endpoint of its subinterval, so the right upper edge/corner touches the rising line.

## Generation

- Pipeline: Nano Banana Pro via existing project script.
- Original public asset hash before correction: `sha256:f1b33d348cd0757ac14dcff46214e7c63a854ac8641c964caefd68c6a2ed8da9`
- Reference image: existing public asset for this goal.
- Prompt append: `tmp/goal-visualization-prompt-appends/mathematik-corrections/3862890e-9ea9-4c62-bcf2-e354c9d8f306.md`
- Accepted candidate: `tmp/goal-visualizations/3862890e-9ea9-4c62-bcf2-e354c9d8f306/generated/3862890e-9ea9-4c62-bcf2-e354c9d8f306.generated.2026-07-07T06-15-34-089Z.jpg`
- Imported public asset: `app/public/assets/goal-visualizations/mathematik/3862890e-9ea9-4c62-bcf2-e354c9d8f306/3862890e-9ea9-4c62-bcf2-e354c9d8f306.jpg`
- Canonical asset: `curricula/DE/Gymnasium/visualizations/mathematik/3862890e-9ea9-4c62-bcf2-e354c9d8f306/3862890e-9ea9-4c62-bcf2-e354c9d8f306.jpg`
- Asset hash: `sha256:8b740604120ea8efdd8ea96c1f40626691e72762641bf9ad94cb9e761141963d`

## Provider request safety

The provider-facing text prompt was checked separately from embedded image bytes.

- Technical goal ID in prompt text: no
- Product/platform name in prompt text: no
- Internal repository path in prompt text: no
- School-form label in prompt text: no

## Rejected candidates

None. The first generated candidate was accepted.

## Review decision

Accepted.

- The function remains `f(t)=t+1` on `[0,4]`.
- In the `n=4` upper-sum diagram, the red rectangles now use right endpoint heights and touch the rising line at the right upper edge/corner.
- In the `n=8` upper-sum diagram, the red rectangles follow the same right-endpoint rule.
- The blue lower-sum rectangles remain aligned with the left endpoints for the increasing function.
- The displayed values remain correct: lower sum `n=4` is `10`, upper sum `n=4` is `14`, lower sum `n=8` is `11`, upper sum `n=8` is `13`.
- The common limit remains `integral_0^4 (t+1) dt = 12`.
- The reconstructed stock remains `B(4)=7+12=19`.
- Visible German text and umlauts are correct.
