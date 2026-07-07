# Goal visualization review - Mathematik correction 367a59ce

Date: 2026-07-07
Subject: Mathematik
Goal ID: 367a59ce-a388-5c93-b6f9-a3b0c6c3b45e
Title: Begriffe des Zinseszinses erläutern
Status: accepted_after_user_issue_correction

## User issue

The previous year-ladder used attractive coin stacks, but visually exaggerated the compound-interest effect after only four years. For `K0=1000 Euro` and `p=3%`, simple interest after four years is `120.00 Euro`, while the additional compound-interest effect is only `5.51 Euro`. The visualization should make clear that the effect becomes large only after many more years.

## Generation

- Pipeline: Nano Banana Pro via existing project script.
- Original public asset hash before correction: `sha256:33030e09ae3453a27f8c7945a9fce4b7e432f26f11db487989cb68fbd6e81e3e`
- Corrected reference guide: `tmp/goal-visualizations/367a59ce-a388-5c93-b6f9-a3b0c6c3b45e/reference-correct-zinseszins-guide.png`
- Prompt append: `tmp/goal-visualization-prompt-appends/mathematik-corrections/367a59ce-a388-5c93-b6f9-a3b0c6c3b45e.md`
- Accepted candidate: `tmp/goal-visualizations/367a59ce-a388-5c93-b6f9-a3b0c6c3b45e/generated/367a59ce-a388-5c93-b6f9-a3b0c6c3b45e.generated.2026-07-07T05-59-36-143Z.jpg`
- Imported public asset: `app/public/assets/goal-visualizations/mathematik/367a59ce-a388-5c93-b6f9-a3b0c6c3b45e/367a59ce-a388-5c93-b6f9-a3b0c6c3b45e.jpg`
- Canonical asset: `curricula/DE/Gymnasium/visualizations/mathematik/367a59ce-a388-5c93-b6f9-a3b0c6c3b45e/367a59ce-a388-5c93-b6f9-a3b0c6c3b45e.jpg`
- Asset hash: `sha256:5eb58fe1f26676cdf5f9e8ab9ad5d47cbc036a7335c6f2b90bc9fa35405de66b`

## Provider request safety

The provider-facing text prompt was checked separately from embedded image bytes.

- Technical goal ID in prompt text: no
- Product/platform name in prompt text: no
- Internal repository path in prompt text: no
- School-form label in prompt text: no

## Rejected candidates

None. The first generated candidate based on the corrected long-horizon reference was accepted.

## Review decision

Accepted.

- The misleading coin-stack year ladder has been replaced by a numeric and graphical comparison.
- The image correctly states `K0 = 1000 €`, `p = 3% pro Jahr`, `q = 1,03`, and `K_n = K0 * 1,03^n`.
- The four-year comparison is correctly scaled: simple interest is `120,00 €`, the additional compound-interest effect is only `5,51 €`, and the final capital is `1125,51 €`.
- The long-horizon values are correct: after 30 years `K30 = 2427,26 €` and the additional effect versus simple interest is `527,26 €`; after 50 years `K50 = 4383,91 €` and the additional effect is `1883,91 €`.
- The graph correctly shows the compound-interest curve close to the simple-interest line at year 4 and clearly above it after many years.
- Visible German text and umlauts are correct.
