# Goal visualization review - Mathematik correction 91571d3f

Date: 2026-07-06
Subject: Mathematik
Goal ID: 91571d3f-3651-4477-ba21-320fc4077453
Title: Absolute und relative Haeufigkeiten bestimmen und darstellen
Status: accepted_after_user_issue_correction

## User issue

The image used the phrase "Klasse von 20" in the survey speech bubble. The requested wording is "20 Schüler".

## Generation

- Pipeline: Nano Banana Pro via existing project script.
- Reference image: existing public asset for this goal.
- Batch file: `tmp/goal-visualization-correction-91571d3f.txt`
- Prompt append: `tmp/goal-visualization-prompt-appends/mathematik-corrections/91571d3f-3651-4477-ba21-320fc4077453.md`
- Accepted candidate: `tmp/goal-visualizations/91571d3f-3651-4477-ba21-320fc4077453/generated/91571d3f-3651-4477-ba21-320fc4077453.generated.2026-07-06T10-58-25-614Z.jpg`
- Imported public asset: `app/public/assets/goal-visualizations/mathematik/91571d3f-3651-4477-ba21-320fc4077453/91571d3f-3651-4477-ba21-320fc4077453.jpg`
- Canonical asset: `curricula/DE/Gymnasium/visualizations/mathematik/91571d3f-3651-4477-ba21-320fc4077453/91571d3f-3651-4477-ba21-320fc4077453.jpg`
- Asset hash: `sha256:d0d08400f0681d49e844367e47a0118e396628ffcf9c9fecabb996b43bd3e3b5`

## Provider request safety

The provider-facing text prompt was checked separately from embedded image bytes.

- Technical goal ID in prompt text: no
- Product/platform name in prompt text: no
- Internal repository path in prompt text: no
- School-form label in prompt text: no

## Review decision

Accepted.

- The speech bubble now says `20 Schüler` and no longer says `Klasse von 20`.
- The table remains consistent: `8/20 = 0,40 = 40%`, `6/20 = 0,30 = 30%`, `4/20 = 0,20 = 20%`, `2/20 = 0,10 = 10%`.
- The sum row remains `20` and `100%`.
- The bar chart shows matching absolute frequencies `8`, `6`, `4`, `2`.
- The conversion example `1/4 = 0,25 = 25%` is still correct.
- Visible German umlauts are correct.
