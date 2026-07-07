# Goal visualization review - Mathematik correction 809ef78a mean stock

Date: 2026-07-07
Subject: Mathematik
Goal ID: 809ef78a-f282-5593-89be-0f2cb95570ac
Title: Bestände und Mittelwerte modellieren
Status: accepted_after_user_issue_correction

## User issue

In the "Mittlerer Bestand" panel, the line for `13 Liter` should sit slightly lower so that the visible area represented by the horizontal mean-stock line and the area under the curve match conceptually.

## Generation

- Pipeline: Nano Banana Pro via existing project script.
- Original public asset hash before correction: `sha256:fc29f924fb89c6b92c4e43d6e6f02cb6e63aef25723388dd4ce62d113588d848`
- Reference image: existing public asset for this goal.
- Prompt append: `tmp/goal-visualization-prompt-appends/mathematik-corrections/809ef78a-f282-5593-89be-0f2cb95570ac.md`
- Accepted candidate: `tmp/goal-visualizations/809ef78a-f282-5593-89be-0f2cb95570ac/generated/809ef78a-f282-5593-89be-0f2cb95570ac.generated.2026-07-07T07-14-25-819Z.jpg`
- Imported public asset: `app/public/assets/goal-visualizations/mathematik/809ef78a-f282-5593-89be-0f2cb95570ac/809ef78a-f282-5593-89be-0f2cb95570ac.jpg`
- Canonical asset: `curricula/DE/Gymnasium/visualizations/mathematik/809ef78a-f282-5593-89be-0f2cb95570ac/809ef78a-f282-5593-89be-0f2cb95570ac.jpg`
- Asset hash: `sha256:027da3a06ec3b0f2f59a2d5a694b3caf0679f71f6e11040bf60f7182a291b9de`

## Provider request safety

The provider-facing text prompt was checked separately from embedded image bytes.

- Technical goal ID in prompt text: no
- Product/platform name in prompt text: no
- Internal repository path in prompt text: no
- School-form label in prompt text: no

## Rejected candidates

None. The first generated candidate for the 13-liter mean-stock-line correction was accepted.

## Review decision

Accepted.

- The right panel keeps the calculation for the mean stock:
  `(1/(3-0)) * integral_0^3 (10 + t^2) dt = 13 Liter`.
- The small graph now represents `B(t)=10+t^2` on `[0,3]`: it starts at `10 Liter` and ends at `19 Liter`.
- The dashed horizontal line labelled `13 Liter` is placed visibly lower than before and clearly below the midpoint between `10 Liter` and `19 Liter`.
- The graph now supports the equal-area idea for the mean stock over `[0,3]`.
- The earlier water-flow correction remains intact: the water stream starts at the faucet and enters the measuring beaker.
- All values, formulas, units, and German umlauts remain correct.
