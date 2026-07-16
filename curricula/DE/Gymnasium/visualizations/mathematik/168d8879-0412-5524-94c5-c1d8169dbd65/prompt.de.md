# Lernzielvisualisierung: Eigene Abbildungen modellieren und interpretieren

## SkillPilot-Ziel

- SkillPilot-ID: `168d8879-0412-5524-94c5-c1d8169dbd65`
- Titel: Eigene Abbildungen modellieren und interpretieren
- Beschreibung: Die lernende Person kann zu gegebenen geometrischen Anforderungen (z. B. Spiegelung an einer schrägen Geraden, Streckung in einer beliebigen Richtung) passende Abbildungsmatrizen konstruieren, testen und im Kontext begründen.

## Generator

- Provider: Google Gemini / Nano Banana Pro
- Status: pilot
- Quellbild: `168d8879-0412-5524-94c5-c1d8169dbd65.jpg`
- Public Asset: `/assets/goal-visualizations/mathematik/168d8879-0412-5524-94c5-c1d8169dbd65/168d8879-0412-5524-94c5-c1d8169dbd65.jpg`

## Prompt

```text
Bitte visualisiere das folgende Lernziel im einfachen Cartoon-Stil.

Rahmen:
- Stil und Anspruch: klar, anschaulich und fachlich präzise; keine Zielgruppen-, Fach- oder Publikumshinweise als Bildtext.
- Erzeuge eine klare, gut lesbare Infografik im Querformat.
- Visualisiere genau dieses eine Lernziel; keine Zusatzthemen und keine Aufgabenlösung.
- Nutze plausible fachliche Beispiele nur, wenn sie das Lernziel unmittelbar erklären.
- Keine Drittanbieterlogos, keine Arbeitsblatt-Kopie, keine geschützten Figuren.
- Verwende wenig Text: kurze deutsche Labels statt langer Sätze.
- Beschriftungen und mathematische Schreibweisen müssen fachlich korrekt und auch in kleiner Darstellung lesbar sein.

Titel: Eigene Abbildungen modellieren und interpretieren
Beschreibung: Die lernende Person kann zu gegebenen geometrischen Anforderungen (z. B. Spiegelung an einer schrägen Geraden, Streckung in einer beliebigen Richtung) passende Abbildungsmatrizen konstruieren, testen und im Kontext begründen.

Zusatzanweisung:
Rebuild the coordinate diagram so every plotted point exactly matches its label. Demonstrate reflection across the line y = x using the matrix [[0,1],[1,0]]. Plot P(3|1) and P′(1|3), Q(−2|4) and Q′(4|−2), plus the fixed point R(2|2). Use a square coordinate grid with equal axis scales, draw y = x clearly, and connect each original point to its reflected point in a visually unambiguous way. Include the rule (x|y) → (y|x). No extra point values, logos, watermarks, or course labels.

Targeted plotting correction: place every dot by counting grid units from the origin, not merely near its label. Q must be exactly two squares left and four squares up from the origin; Q′ must be exactly four squares right and two squares down. P must be three squares right and one square up; P′ one square right and three squares up; R exactly two squares right and two squares up on y=x. Use a clearly marked origin and integer ticks from −4 through 4 so these positions are visually verifiable.

Final reconstruction instruction: discard the previous layout and create a minimal two-panel infographic with no hands, speech bubbles, decorative sketches or perspective. The right panel must be one large square Cartesian grid from −4 to 4 on both axes with equal-sized cells. Draw and label only five dots: P at grid intersection (3|1), P′ at (1|3), Q at (−2|4), Q′ at (4|−2), and R at (2|2). The red diagonal y=x must pass through the origin and R. Do not move dots to make labels fit; place labels beside the exact intersections. The left panel shows only the coordinate-swap rule and matrix. Mathematical coordinate accuracy is more important than decoration.
```

## Review-Notiz

Dieses Asset muss vor breitem Rollout gegen die Visualisierungs-Checkliste geprüft werden: mathematische Korrektheit, Alters- und Kontextpassung, Textlesbarkeit, Barrierefreiheit und Lizenz-/Copyright-Risiko.
