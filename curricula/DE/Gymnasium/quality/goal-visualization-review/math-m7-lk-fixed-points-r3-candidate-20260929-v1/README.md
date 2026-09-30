# Ungebundene Bildkandidatin: Fixpunkte im Raum

- Ziel: `d3c42193-f1b7-5c6d-a991-bf034d99359f` (Mathematik, Q2, LK).
- Aktueller Zielkern: Fixpunkte linearer geometrischer Abbildungen in `R³` über `A\vec{x}=\vec{x}` bestimmen.
- Befund am bisher gebundenen Bild: Die Darstellung der Spiegelung an `y=x` und die 2×2-Matrix sind für sich mathematisch richtig, illustrieren aber nur `R²` und damit nicht die inzwischen ausdrücklich dreidimensionale Zielbeschreibung. Das aktive Bild bleibt unverändert.
- Aktives PNG, SHA-256: `48c574d439a89bb8ef221be70781ed83f1ef4815836920cd48d3b1896702d978`.
- Neue, **nicht gebundene** Kandidatin: [`candidate.png`](candidate.png), PNG RGB, 1774×887, SHA-256 `54103114a99dfd9d8a296c808dedfe57a1afa668334427acac764e61974583bf`.
- Herkunft: OpenAI/ChatGPT-Codex eingebautes `image_gen`-Werkzeug, 29. September 2026. Ein konkreter Modellname wurde vom Werkzeug nicht ausgewiesen. Keine fremden Vorlagen, keine privaten Lernenden-, Klassen-, Sitzungs- oder Chatdaten im Prompt. Das alte aktive Bild wurde vorher visuell geprüft und diente nur als Stilkontext.
- Status: **Kandidatin**, keine aktive Ressource, keine maschinelle oder menschliche Freigabe. Vor Integration sind eine unabhängige fachliche/visuelle Prüfung und die gezielte Erneuerung betroffener Bild-, Kontext-, D-/P- und QA-Bindungen erforderlich.

## Tatsächlicher Erzeugungsprompt

```text
Use case: scientific-educational. Asset type: a single landscape PNG learning-goal illustration for German upper-secondary mathematics, friendly and clear comic-like math infographic matching an approachable school visual library. Create a NEW image, not a revision of a 2D y=x graphic. Main idea: fixed points of a LINEAR map IN THREE-DIMENSIONAL SPACE. Use a warm white background, strong navy text, soft blue/cyan 3D coordinate drawing, a translucent mint-green horizontal plane, orange moving points, generous whitespace, crisp legible typography, mild hand-drawn warmth but precise math. Layout: title at top exactly 'Fixpunkte im Raum'. Left: an unambiguous three-dimensional xyz coordinate system with x and y axes receding across the horizontal plane, z axis vertical through origin O. The green plane is exactly the xy-plane, label 'z = 0'. Show P=(0,0,1) as an orange dot on the positive z axis above the plane and P′=(0,0,−1) as an orange dot on the negative z axis below it, with a small vertical downward reflection arrow between them. The plane is midway between these points. Mark O=(0,0,0) as a green fixed dot on the plane. Do not show coordinates unless placement is mathematically exact. Right: a tidy large math block with exact matrix 'A = ((1,0,0),(0,1,0),(0,0,−1))' displayed clearly as a 3x3 matrix with three rows and three columns, then exactly '(x,y,z) → (x,y,−z)'. Below, state exactly 'A x⃗ = x⃗ ⇔ z = 0' and 'Alle Punkte der Ebene z = 0 bleiben fest.' No other formulas or labels. Absolutely avoid a 2x2 matrix, y=x, plane/axis ambiguity, extra points, inaccurate coordinates, decorative mathematical symbols, wrong signs, or photorealism. This is an educational illustration; prioritize mathematical accuracy and reading at small screen size.
```

Der erste erzeugte Entwurf ist als [`attempt-01-short-arrow.png`](attempt-01-short-arrow.png) erhalten. Seine orange Abbildungspfeilspitze endete oberhalb der Ebene und konnte eine Abbildung auf die Ebene nahelegen. Deshalb wurde genau dieses Detail mit `image_gen` korrigiert:

```text
Use case: precise-object-edit. Edit target: the attached mathematics infographic, preserving its layout, style, colors, axes, translucent plane, exact text, exact 3x3 matrix, point positions and labels. Make ONE targeted correction: the short orange downward arrow beside the z-axis currently ends just above the green z=0 plane. Extend this orange arrow continuously downward from P=(0,0,1), across the plane, until its arrowhead points clearly to P′=(0,0,−1) below the plane. Keep it slightly offset from the z-axis so the axis and green origin remain visible; it may be interrupted behind the translucent plane but the visual trajectory must clearly continue to P′. The arrow must NOT point merely to the plane. Everything else must remain unchanged and mathematically exact. Do not add text or extra marks.
```

## Sicht- und Fachprüfung der tatsächlichen Kandidatin

- Die Matrix hat genau drei Zeilen und drei Spalten und ist `diag(1,1,-1)`. Sie bildet `(x,y,z)` auf `(x,y,-z)` ab.
- `A\vec{x}=\vec{x}` ist genau dann erfüllt, wenn `-z=z`, also `z=0`; `x` und `y` bleiben frei. Der festbleibende Punktbestand ist die **ganze** grün dargestellte `xy`-Ebene, nicht nur der Ursprung.
- `P=(0,0,1)` und `P′=(0,0,-1)` liegen auf gegenüberliegenden Seiten der Ebene auf derselben `z`-Achse. Der korrigierte Pfeil durchquert die Ebene und zeigt zu `P′`; `O` liegt auf der Fixebene.
- Titel, Achsen, Punktnamen, Matrix, Abbildungsvorschrift und Fixpunktgleichung sind bei Prüfung des PNG in Originalgröße lesbar; keine sichtbare falsche Zahl, Vorzeichenumkehr oder zusätzliche Formel. Der Stil ist hell, abstrahiert und freundlich. Die einzige farbliche Zuordnung der Fixebene ist Grün; die bewegten Punkte sind Orange.
- Die Skizze zeigt die Lösungsidee an einem Beispiel. Sie ersetzt weder ein vollständiges LGS-Verfahren für beliebige 3×3-Matrizen noch Quellen- oder Lernzielnachweise.

Diese Eigenprüfung ist kein unabhängiger Review und keine Freigabe. Vorschlag für einen späteren Alt-Text: „Spiegelung im Raum an der Ebene z=0 mit Matrix diag(1,1,-1): P=(0,0,1) wird zu P′=(0,0,-1); alle Punkte der xy-Ebene bleiben fest, denn A x gleich x gilt genau für z=0.“
