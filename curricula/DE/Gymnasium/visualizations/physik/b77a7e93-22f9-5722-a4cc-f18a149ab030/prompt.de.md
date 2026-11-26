# Lernzielvisualisierung: Pfeile für gerichtete Größen lesen und zeichnen

## SkillPilot-Ziel

- SkillPilot-ID: `b77a7e93-22f9-5722-a4cc-f18a149ab030`
- Titel: Pfeile für gerichtete Größen lesen und zeichnen
- Beschreibung: Die lernende Person kann in einer ebenen Skizze einen Größenpfeil dem zugehörigen Körper oder markierten Punkt zuordnen, ihn dort in der Richtung der Größe ansetzen und seinen Betrag mit einem vorgegebenen Pfeilmaßstab ablesen oder zeichnen. Sie erklärt an zwei Darstellungen derselben Situation, warum sich beim Wechsel des Pfeilmaßstabs die gezeichnete Spitze verschiebt, während Ort und physikalischer Betrag gleich bleiben.

## Generator

- Provider: OpenAI / Codex image_gen; calibrated scale legend rendered from SVG
- Status: pilot
- Quellbild: `b77a7e93-22f9-5722-a4cc-f18a149ab030.jpg`
- Public Asset: `/assets/goal-visualizations/physik/b77a7e93-22f9-5722-a4cc-f18a149ab030/b77a7e93-22f9-5722-a4cc-f18a149ab030.jpg`

## Prompt

```text
Erster tatsächlicher Anbieterprompt

Eine ruhige, lose handgezeichnete Unterrichtsillustration für ein deutschsprachiges Physikbuch, breites 16:9-Format, 1600 × 900. Für eine Ansicht von 360 px verständlich. Cremefarbenes Papier, dunkelblaue Konturen, warmer Ocker und sanftes Türkis. Zwei übereinander liegende, klar getrennte Ansichten derselben Situation im selben Augenblick und exakt derselben Größe: derselbe einfache türkisfarbene kleine Messwagen auf derselben waagerechten Schiene steht in beiden Zeilen auf derselben senkrechten Position links. Zeichne in jeder Zeile auf dem Wagen einen gut sichtbaren dunklen Punkt und genau einen dicken, waagerechten korallenroten Geschwindigkeitspfeil vom Punkt nach rechts ins leere Bild; der Anfang des Pfeils liegt auf dem Punkt. Die Länge des oberen Pfeils sei EXAKT doppelt so groß wie die des unteren. Keine Bewegungsstriche, keine Positionspfeile, keine zweiten Wagen. In einer eigenen ruhigen Legendenfläche RECHTS für jede Zeile ein kurzer waagerechter roter Bezugsstrich MIT ZWEI SERIFEN, keine Spitze, in BEIDEN Zeilen identische Länge, beschriftet oben „2 m/s“, unten „4 m/s“. Der obere Wagenpfeil ist genau ZWEI Bezugsstriche lang, der untere ist EINEN Bezugsstrich lang. Überschrift in großer gut lesbarer Druckschrift „Derselbe Wagen · 4 m/s“. Über der Legendenfläche als einzige weitere Beschriftung „Pfeilmaßstab“. Keine weiteren Texte, Ziffern, Symbole oder Pfeile. Wichtig: Die Schiene und der Wagen sind in beiden Zeilen wirklich deckungsgleich, nur die gezeichnete Pfeillänge ändert sich. Die Pfeilspitzen sind in beiden Fällen in freier Fläche, deutlich getrennt von der Legende. Vermeide dekorative Strahlen, Glitzer, Hintergrundeinfärbungen.

Tatsächlicher Überarbeitungsprompt mit dem ersten Anbieterbild als Referenz

Behalte Wagen, Beschriftungen, Maßstab-Panel und Schienen exakt bei. Korrigiere nur die beiden roten Geschwindigkeitspfeile: Der obere Pfeil soll EXAKT ZWEI Längen des roten Bezugsstrichs in der Legende haben. Der kleine Bezugsstrich im rechten Kasten ist 54 Bildpunkte lang bei 360 Pixeln Gesamtbreite. Im vorhandenen Bild ist der obere Pfeil vom schwarzen Punkt bis zur Spitze 167 Pixel lang und der untere 80. Mach den oberen Pfeil 108 Pixel lang, den unteren 54 Pixel lang bei dieser Ansicht, also ca. zwei Drittel ihrer jetzigen Längen. Beide beginnen unverändert am schwarzen Punkt auf dem Wagen. Oben zeigt er 4 m/s bei Skalenstrich 2 m/s; unten auch 4 m/s bei Skalenstrich 4 m/s. Alles bleibt groß, gut lesbar, freundlich, im Querformat 16:9.

Präzise gezeichnete Skalenlegende nach visueller Prüfung

Die senkrecht angeordneten Wagen und ihre Pfeile bleiben unverändert aus dem zweiten Anbieterbild. Zur physikalisch genauen Kalibrierung bekommt jede Wagenzeichnung rechts einen Bezugsstrich. Der obere ist halb so lang wie der obere 4-m/s-Pfeil, der untere so lang wie der untere 4-m/s-Pfeil.

Die gemeinsame rechte Legende nennt über den beiden Skalenbalken ausdrücklich „Geschwindigkeit“ und „Pfeilmaßstab“. Wagen, Ansatzpunkte, Pfeillängen und Zahlen bleiben wie im kalibrierten Vorgänger.
```

## Review-Notiz

Dieses Asset muss vor breitem Rollout gegen die Visualisierungs-Checkliste geprüft werden: mathematische Korrektheit, Alters- und Kontextpassung, Textlesbarkeit, Barrierefreiheit und Lizenz-/Copyright-Risiko.
