# Biologie E.3: Bildkandidat zur freien Trisomie 21

Stand: 2026-10-01 (Europe/Berlin). Ziel-ID:
`0dd8380d-b542-5126-8d8e-f95d9ccded90`.

## Anlass und Formfaktor

Für dieses aktuelle Ziel fehlt ein primäres Lernzielbild. Der neue Kandidat ist
ein vereinfachtes **Chromosom-21-Zahlmodell**, keine vollständige Darstellung
der Meiose und kein diagnostisches Karyogramm. 4:3 statt des allgemeinen
16:9-Ausgangsformats gibt den drei ausreichend großen Zellen und der lesbaren
Modellkennzeichnung auf einem 360-Pixel-Handy mehr Höhe. Die tatsächlichen
360- und 680-Pixel-Vorschauen liegen im selben Verzeichnis. Alle drei
Chromosom-21-Kopien müssen in der Ergebniszelle einzeln zu erkennen sein.

## Erzeugung und Varianten

- Werkzeug: eingebaute ChatGPT/Codex-Bildgenerierung (`image_gen`), PNG.
- V1-Original: `/home/enpasos/.codex/generated_images/01a0f2c0-2182-78f3-8b44-9fcdfd2c8634/exec-7e665fc0-bd04-46bb-8d25-142d3745bbd5.png`.
- V2-Original: `/home/enpasos/.codex/generated_images/01a0f2c0-2182-78f3-8b44-9fcdfd2c8634/exec-00b6e287-acb5-40c5-8c53-f76b26bbe9f8.png`.
- V2-Kandidat: `candidate-0dd8380d-v2.png`, 1448 × 1086 Pixel, RGB-PNG,
  SHA-256 `be3ca040c15dea30ffd6bf15bde444cdc603b7ffe36d11d8db0276da1fde8c3b`.
- V1 bleibt als `candidate-0dd8380d-v1.png` erhalten. Seine kleine
  Modellkennzeichnung und der transparente Hintergrund waren auf dem Handy
  weniger gut geeignet; V2 vergrößert die Beschriftung und nutzt einen
  cremefarbenen Hintergrund.

### V1-Prompt

> Use case: scientific-educational. Asset type: one SkillPilot German Gymnasium biology goal visualization, friendly raster PNG illustration for a phone and desktop. Make a clean, warm, abstract comic-like educational diagram about FREE TRISOMY 21 as an illustrative chromosome-number model. Aim for a 4:3 landscape canvas with generous white/cream negative space and very large simple shapes. Composition: upper row shows TWO separate gamete circles side by side. Left gamete contains EXACTLY TWO distinct chromosome-21 single-rod icons, one coral red and one deep blue. Right gamete contains EXACTLY ONE distinct chromosome-21 single-rod icon, green. Two broad arrows from these gametes converge to ONE larger cell circle in the lower center containing EXACTLY THREE distinct single-rod chromosome-21 icons in those same colors red, blue, green. Preserve equal icon size; clearly separate each rod; no other chromosome-like objects anywhere. Top small but bold readable heading: 'Chromosom 21'. Between top and bottom, large text '2 + 1 = 3'. Bottom small readable label: 'vereinfachtes Modell'. Use soft mint, pale peach, lavender cell circles and hand-drawn dark outlines; match a friendly comic textbook illustration, not photo-realistic or sterile technical vector. No people, babies, faces, diagnoses, or phenotype clues. The image should support number counting without implying that the picture itself shows full meiosis or proves a biological diagnosis. No tiny legend, no cropped panels, no watermark. Accuracy is critical: two rods in left gamete, one rod in right gamete, exactly three rods in bottom cell. Form factor must remain legible when scaled to about 360 px wide.

### V2-Edit-Prompt

> Use case: scientific-educational image edit. Edit target: the attached chromosome-21 classroom diagram. Preserve exactly the two top gametes and bottom cell, their 2 red/blue plus 1 green equals 3 red/blue/green chromosome-21 rod counts, all arrows, the 4:3 aspect ratio, friendly comic style, and generous spacing. Change only mobile-readability and background: add a uniform soft warm cream opaque background instead of transparency; make the title 'Chromosom 21' substantially larger and cleanly readable; make the bottom caption 'vereinfachtes Modell' substantially larger and cleanly readable at 360px total image width, with space under the bottom circle. Keep the central '2 + 1 = 3' clear. Exact German text as quoted; do not introduce any other text, chromosome symbols, people or detailed meiosis claims. Output a PNG.

## Grenze

Eine unabhängige fachlich-visuelle Prüfung ist noch erforderlich. Die
Erzeugung, die Vorschau und der numerisch richtige erste Eindruck sind keine
maschinelle Visualisierungsfreigabe, keine menschliche Freigabe und kein
Lernnachweis. Das Bild stellt den möglichen Zustand einer Keimzelle mit zwei
Chromosomen 21 dar; es zeigt die Fehlverteilung selbst nicht.

Amtlicher Bezug: Hessen, Biologie Kerncurriculum gymnasiale Oberstufe,
E.3 „Mutation (Prinzip) am Beispiel Trisomie 21“:
https://kultus.hessen.de/sites/kultus.hessen.de/files/2024-11/kerncurriculum_gymnasiale_oberstufe-biologie.pdf

Fachliche Einordnung der freien Trisomie und Nichttrennung:
https://medlineplus.gov/genetics/condition/down-syndrome/
