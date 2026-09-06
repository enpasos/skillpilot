# Lernzielvisualisierung: Sehschwaechen mit dem Linse-Schirm-Modell untersuchen

## SkillPilot-Ziel

- SkillPilot-ID: `ce14a7e7-7e2a-517f-a465-78ba3fbe414d`
- Titel: Sehschwaechen mit dem Linse-Schirm-Modell untersuchen
- Beschreibung: Die lernende Person kann Kurz- und Weitsichtigkeit mit dem Linse-Schirm-Modell experimentell untersuchen und Ergebnisse mit Vorhersagen der Linsengleichung vergleichen.

## Generator

- Provider: Google Gemini / Nano Banana Pro (gemini-3-pro-image)
- Status: candidate
- Quellbild: `ce14a7e7-7e2a-517f-a465-78ba3fbe414d.jpg`
- Public Asset: `/assets/goal-visualizations/physik/ce14a7e7-7e2a-517f-a465-78ba3fbe414d/ce14a7e7-7e2a-517f-a465-78ba3fbe414d.jpg`

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

Titel: Sehschwaechen mit dem Linse-Schirm-Modell untersuchen
Beschreibung: Die lernende Person kann Kurz- und Weitsichtigkeit mit dem Linse-Schirm-Modell experimentell untersuchen und Ergebnisse mit Vorhersagen der Linsengleichung vergleichen.

Zusatzanweisung:
Use case: precise-object-edit
Input image 1 is the edit target. One last LOCAL PHYSICS CORRECTION: replace only the outgoing red beam in the rightmost "weitsichtig" panel. The previous edit still contains the error: the four solid red rays meet at a red dot on the gray screen. That entire red convergence on the screen MUST be erased, not retained or enlarged.

Use this exact construction in the existing 2752 by 1536 layout (coordinates are editing instructions, NEVER print coordinates in the image):
1. Remove the red outgoing lines, arrowheads, dashed duplicate lines and red common dot from the region after the rightmost lens (approximately x=2105 to x=2720, y=635 to y=860). Preserve the lens, incoming rays, gray screen, black text and the one yellow focus centered at approximately (2670,743).
2. Replace them with exactly FOUR thin straight red line paths. All four end at the same existing yellow focus (2670,743), but they start at FOUR DIFFERENT heights just after the lens:
   upper path: start around (2110,648);
   inner upper path: start around (2125,714);
   inner lower path: start around (2125,777);
   lower path: start around (2110,840).
3. Draw each of these four paths SOLID only from its lens exit to the screen plane around x=2450. At that screen plane their heights are approximately y=706,731,757,781. These are FOUR distinct intercepts, with a clearly visible vertical spread. There must be NO single red meeting point at (2450,743), and no crossing of any two paths before the yellow focus.
4. Continue EACH line along precisely the same slope as DASHES from its distinct screen intercept to the existing yellow focus at (2670,743), representing the hypothetical continuation after removing the opaque screen. Do not draw a second divergent slope, do not begin a separate dashed family at the lens, and do not kink the rays at the screen.
5. Keep a faint diffuse vertical blur on the screen behind the four separated intercepts. There is NO yellow or red sharp focus on the screen in this right panel. The ONLY focus in the right panel is the existing yellow circle to the right of the screen.
6. For this local beam, omit large triangular arrowheads if they obstruct the separated paths. Four thin straight paths are enough. Do not alter arrows in other panels.

Invariants: Keep title, every existing German label, left normalsichtig panel, middle kurzsichtig panel, all screens and lenses, optical benches, colors, typography, aspect ratio and cartoon style unchanged. No correction lenses, new text, numbers, ruler, coordinates, watermarks or technical identifiers. Return the full image with only this local right-panel beam replacement.
```

## Review-Notiz

Dieses Asset muss vor breitem Rollout gegen die Visualisierungs-Checkliste geprüft werden: mathematische Korrektheit, Alters- und Kontextpassung, Textlesbarkeit, Barrierefreiheit und Lizenz-/Copyright-Risiko.
