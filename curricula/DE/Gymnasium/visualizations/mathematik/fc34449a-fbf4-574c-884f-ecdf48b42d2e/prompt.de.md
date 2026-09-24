# Lernzielvisualisierung: Laufzeit tabellarisch näherungsweise bestimmen

## SkillPilot-Ziel

- SkillPilot-ID: `fc34449a-fbf4-574c-884f-ecdf48b42d2e`
- Titel: Laufzeit tabellarisch näherungsweise bestimmen
- Beschreibung: Die lernende Person kann mit einer Tabellenkalkulation die Laufzeit in einfachen Finanzsituationen als Anzahl der Zins- oder Zahlungsperioden näherungsweise bestimmen und das Ergebnis im Kontext prüfen.

## Generator

- Provider: OpenAI/Codex image_gen.imagegen (model version not exposed)
- Status: pilot
- Quellbild: `fc34449a-fbf4-574c-884f-ecdf48b42d2e.png`
- Public Asset: `/assets/goal-visualizations/mathematik/fc34449a-fbf4-574c-884f-ecdf48b42d2e/fc34449a-fbf4-574c-884f-ecdf48b42d2e.png`

## Prompt

```text
# Prompt provenance: finance duration table

Generator: built-in OpenAI/Codex `image_gen.imagegen`, model version not exposed.

Initial generated image:
`/home/enpasos/.codex/generated_images/01a03a32-5c3d-7122-a394-13d4f26b0054/exec-195dd2a1-a41d-400d-8d42-ffac3f734d12.png`

Actual initial prompt:

> Use case: scientific-educational. Asset type: a friendly abstract, clear 2D comic-style PNG learning-goal illustration for German grade-8 mathematics, landscape and readable at 360px mobile width. Show a simple spreadsheet-like table for estimating the NUMBER OF INTEREST PERIODS until a target balance is first reached. Exactly three data rows under two column headers: 'Periode n' and 'Guthaben'. Rows: n=0, 100 €; n=1, 110 €; n=2, 121 €. A small adjacent badge says exactly '10 % Zins je Periode', and a distinct target line reads exactly 'Ziel: mindestens 120 €'. Highlight ONLY the n=2 row as the first row reaching the target, with a friendly hand-drawn check mark and the concise label '2 Perioden'. The n=1 row is visibly below target; n=0 is the start, not a completed interest period. Style: gently rounded cream card, pastel blues with warm coral highlight, crisp navy text, light hand-drawn comic personality, generous whitespace. No photorealism, no sterile vector spreadsheet screenshot, no people, no extra data or labels. Mathematically exact: 100*1.10=110 and 110*1.10=121; first amount >=120 is after two complete interest periods, not year 3 or one period. Ensure no text overflow or gibberish; if unsure, simplify decorative elements instead of changing numbers.

First candidate was not accepted. Edited generated image:
`/home/enpasos/.codex/generated_images/01a03a32-5c3d-7122-a394-13d4f26b0054/exec-0f814839-47cf-4ae6-ace3-8282daf10d74.png`

Actual edit prompt (with the initial image as reference):

> Edit this educational math comic into a MUCH SIMPLER, bright, high-contrast mobile-friendly layout. Preserve exact mathematical values and logic in the central spreadsheet table: columns 'Periode n' and 'Guthaben'; rows 0→100 €, 1→110 €, 2→121 €; 10 % interest each period, threshold 'Ziel: mindestens 120 €', and mark only row n=2 as first reaching target. Keep concise '2 Perioden'. Remove the large dark top title and remove BOTH bottom explanatory speech clouds entirely; do not replace them with other text. Use a pale cream/light-blue background, dark navy legible lettering, warm coral only on the final table row, generous whitespace, one crisp compact panel. Keep the friendly soft comic style without photorealism or a sterile vector look. At 360px width the table values and result must be readable. Avoid all extra text, digits, symbols, and invented rows. Math and German spelling exactly correct.
```

## Review-Notiz

Dieses Asset muss vor breitem Rollout gegen die Visualisierungs-Checkliste geprüft werden: mathematische Korrektheit, Alters- und Kontextpassung, Textlesbarkeit, Barrierefreiheit und Lizenz-/Copyright-Risiko.
