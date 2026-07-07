# Goal visualization review - Mathematik correction c3b9c561

Date: 2026-07-07
Subject: Mathematik
Goal ID: c3b9c561-dd83-5903-9ec6-49c7f51bafd5
Title: Bedingte Wahrscheinlichkeiten berechnen
Status: accepted_after_user_issue_correction

## User issue

The arrows in the relative-frequency table were not correct. Only the two values relevant for the selected conditional probability should be marked, and the labels `nicht A` and `nicht B` should be replaced by overbar notation.

## Generation

- Pipeline: Nano Banana Pro via existing project script.
- Initial reference image: existing public asset for this goal.
- Corrected reference guide: `tmp/goal-visualizations/c3b9c561-dd83-5903-9ec6-49c7f51bafd5/reference-correct-conditional-guide.png`
- Prompt append: `tmp/goal-visualization-prompt-appends/mathematik-corrections/c3b9c561-dd83-5903-9ec6-49c7f51bafd5.md`
- Accepted candidate: `tmp/goal-visualizations/c3b9c561-dd83-5903-9ec6-49c7f51bafd5/generated/c3b9c561-dd83-5903-9ec6-49c7f51bafd5.generated.2026-07-07T05-46-16-593Z.jpg`
- Imported public asset: `app/public/assets/goal-visualizations/mathematik/c3b9c561-dd83-5903-9ec6-49c7f51bafd5/c3b9c561-dd83-5903-9ec6-49c7f51bafd5.jpg`
- Canonical asset: `curricula/DE/Gymnasium/visualizations/mathematik/c3b9c561-dd83-5903-9ec6-49c7f51bafd5/c3b9c561-dd83-5903-9ec6-49c7f51bafd5.jpg`
- Asset hash: `sha256:5d78516976cd24e1c9a78e1558a4798109b1c2c160115a98d85826ba65e0ee10`

## Provider request safety

The provider-facing text prompt was checked separately from embedded image bytes.

- Technical goal ID in prompt text: no
- Product/platform name in prompt text: no
- Internal repository path in prompt text: no
- School-form label in prompt text: no

## Rejected candidates

- `2026-07-07T05-32-34-090Z`: rejected because formulas and table annotations drifted; the wrong relative `0.40` in row `B̄`, column `Ā` was still treated as relevant.
- `2026-07-07T05-35-03-090Z`: rejected because visible `nicht A` / `nicht B` labels remained and a formula label was corrupted.
- `2026-07-07T05-40-51-304Z`: rejected because the temporary reference guide still contained wrong endpoint values for the `Ā` branch, which propagated into the candidate.

## Review decision

Accepted.

- The image contains no visible `nicht A` or `nicht B` labels.
- The relative four-field table uses overbar notation for the complementary column and row.
- The table values are consistent: row `B` is `0.30, 0.20, 0.50`, row `B̄` is `0.10, 0.40, 0.50`, and the sum row is `0.40, 0.60, 1.00`.
- Only the two values needed for `P(B|A)` are circled: `0.30` for `P(A∩B)` and the column-sum `0.40` for `P(A)`.
- The other `0.40` in row `B̄`, column `Ā` is not circled.
- The calculation `P(B|A)=P(A∩B)/P(A)=0.30/0.40=0.75` is correct.
- The tree diagram values are consistent with the table: `P(B|A)=0.75`, `P(B̄|A)=0.25`, `P(B|Ā)=0.33`, `P(B̄|Ā)=0.67`, with endpoint values `0.30`, `0.10`, `0.20`, and `0.40`.
- Visible German text uses correct umlauts, including `Häufigkeiten`.
