# Lernzielvisualisierung: Matrizen multiplizieren

## SkillPilot-Ziel

- SkillPilot-ID: `304111dd-426b-520b-a275-3fa37da1b0e0`
- Titel: Matrizen multiplizieren
- Beschreibung: Die lernende Person kann Matrizenprodukte berechnen, Dimensionsbedingungen prüfen und typische Fehlerquellen bei der Reihenfolge vermeiden.

## Generator

- Provider: OpenAI / ChatGPT-Codex image generation (image_gen)
- Status: pilot
- Quellbild: `304111dd-426b-520b-a275-3fa37da1b0e0.png`
- Public Asset: `/assets/goal-visualizations/mathematik/304111dd-426b-520b-a275-3fa37da1b0e0/304111dd-426b-520b-a275-3fa37da1b0e0.png`

## Prompt

```text
Use case: scientific-educational
Input image 1 is a style and content reference for correcting a German educational illustration about matrix multiplication. Preserve its approachable hand-drawn lettering, pale-blue background, blue/orange/green matrix outlines, roomy landscape format and three-column learning sequence. Replace the mathematically ambiguous equality chain and misleading reversed-order example with the following precisely correct content. Recompose inside the panels as needed for large, uncrowded formulas.
Title exactly: "Matrizen multiplizieren".
LEFT PANEL, heading "1. Dimensionen prüfen": Define A = [1, 2, 0; 3, 1, 2] as 2×3 and B = [2, 1; 0, 3; 4, 2] as 3×2, each separately with its own equals sign and square matrix brackets. Explain compactly "Innere Dimensionen gleich: 3 = 3" and "A · B hat die Größe 2×2". Matrix rows and columns must visibly match their dimensions.
MIDDLE PANEL, heading "2. Zeile mal Spalte": Highlight row 1 of A [1,2,0] and column 2 of B [1,3,2] clearly as the ingredients of c₁₂; a single well-anchored callout gives "c₁₂ = 1·1 + 2·3 + 0·2 = 7". Show the correct compact main result "C = A · B = [2, 7; 14, 10]". Do NOT label expanded factor matrices inside an equality chain as A=[A]·B=[B]. No additional factors.
RIGHT PANEL, heading "3. Reihenfolge beachten": For those exact same A and B, show "B · A = [5, 5, 2; 9, 3, 6; 10, 10, 4]" as a full 3×3 matrix. Under it: "Hier: B · A ist 3×3, A · B ist 2×2." This reversed product IS defined. Do not claim dimensions fail in this example. A compact final note may read "Nicht eintragsweise multiplizieren." No crossed-out unrelated column-vector product.
Every entry must be correct and legible, each bracket must enclose the intended complete matrix, equals signs connect only equal objects. Keep text brief. This image supports understanding, not a learner assessment. No extra topics, characters, logos, watermarks or technical IDs. Return one landscape raster image.
```

## Review-Notiz

Dieses Asset muss vor breitem Rollout gegen die Visualisierungs-Checkliste geprüft werden: mathematische Korrektheit, Alters- und Kontextpassung, Textlesbarkeit, Barrierefreiheit und Lizenz-/Copyright-Risiko.
