# Lernzielvisualisierung: Linsenauge mit geometrischer Optik modellieren

## SkillPilot-Ziel

- SkillPilot-ID: `84ddb244-e560-592f-9d43-e84c801fe5b4`
- Titel: Linsenauge mit geometrischer Optik modellieren
- Beschreibung: Die lernende Person kann das Linsenauge mit Strahlenkonstruktion, Linsengleichung und Simulationen modellieren, Bedingungen scharfen Sehens quantitativ deuten und Modellgrenzen benennen.

## Generator

- Provider: Google Gemini / Nano Banana Pro
- Status: pilot
- Quellbild: `84ddb244-e560-592f-9d43-e84c801fe5b4.jpg`
- Public Asset: `/assets/goal-visualizations/physik/84ddb244-e560-592f-9d43-e84c801fe5b4/84ddb244-e560-592f-9d43-e84c801fe5b4.jpg`

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

Titel: Linsenauge mit geometrischer Optik modellieren
Beschreibung: Die lernende Person kann das Linsenauge mit Strahlenkonstruktion, Linsengleichung und Simulationen modellieren, Bedingungen scharfen Sehens quantitativ deuten und Modellgrenzen benennen.

Zusatzanweisung:
Use case: precise-object-edit
Asset type: German educational optics diagram.
Input image 1: edit target, not a loose style reference. Preserve its composition, cartoon line style, pastel background, labels, formula card, lens, object and retina. This is a LOCAL CORRECTION, not a new illustration.

Primary request: Correct only the two gray light paths and the resulting inverted image-arrow tip in the existing diagram.
- Erase the current curved/slightly bent diagonal ray completely, including ghost traces. Replace it with ONE ruler-straight gray line from the top tip of the left object arrow through the exact intersection of the horizontal optical axis and lens center, and continue that same straight line without a kink until it intersects the retina on the right.
- In homogeneous space a light ray must not curve. The center ray is ONE collinear segment before, inside and after the ideal thin lens. Do not bend it to preserve the old image point.
- The correct retina intersection of that straight center ray lies lower than the current image-arrow tip, approximately at two thirds of the canvas height. Move/extend only the downward image arrow so its tip lands exactly at that intersection and its base remains on the optical axis.
- Keep the second ray horizontal from the same object tip to the lens central plane. At that plane give it exactly one kink, then ONE straight segment to exactly the same new retina intersection. Both light paths meet at the image-arrow TIP on the retina, neither before nor behind it.
- Keep exactly two thin gray light paths, with no ray arrowheads, no extra dashed constructions and no extra focus markers.
- The horizontal optical axis stays straight and unchanged. Object and lens positions and sizes stay unchanged. Do not move the object to accommodate the old, wrong image point.

Text (verbatim, unchanged): "Linsenauge als Modell", "Gegenstand", "Linse", "Netzhaut", "scharf auf Netzhaut", "1/f = 1/g + 1/b", "Modellgrenze: vereinfachte Linse".
Constraints: Change only the ray geometry and necessary inverted-arrow length. Keep all other content, colors, framing, typography, formula and layout as close to the input as possible. No new labels, numeric coordinates, technical IDs, watermark, anatomical details, correction lenses or decorative elements. Output one corrected full landscape image.
```

## Review-Notiz

Dieses Asset muss vor breitem Rollout gegen die Visualisierungs-Checkliste geprüft werden: mathematische Korrektheit, Alters- und Kontextpassung, Textlesbarkeit, Barrierefreiheit und Lizenz-/Copyright-Risiko.
