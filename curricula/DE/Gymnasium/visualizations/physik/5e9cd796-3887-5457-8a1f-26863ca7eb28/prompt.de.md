# Lernzielvisualisierung: Sonnenmasse aus Bahndaten abschätzen

## SkillPilot-Ziel

- SkillPilot-ID: `5e9cd796-3887-5457-8a1f-26863ca7eb28`
- Titel: Sonnenmasse aus Bahndaten abschätzen
- Beschreibung: Die lernende Person kann aus Bahndaten eines die Sonne umlaufenden Körpers mit einem Newton-Kepler-Modell die Sonnenmasse abschätzen und die dafür verwendeten Modellannahmen benennen.

## Generator

- Provider: image_gen
- Status: pilot
- Quellbild: `5e9cd796-3887-5457-8a1f-26863ca7eb28.png`
- Public Asset: `/assets/goal-visualizations/physik/5e9cd796-3887-5457-8a1f-26863ca7eb28/5e9cd796-3887-5457-8a1f-26863ca7eb28.png`

## Prompt

```text
# Tatsächlicher Generierungs- und Editverlauf

Provider: builtin image_gen. Die konkrete Modellversion wird von der Laufzeit nicht offengelegt. Dieses Dokument fasst zwei tatsächlich ausgeführte Prompts zusammen; es war NICHT ein einzelner neuer Generierungsaufruf.

## 1. Neue Inferenzgrafik ohne Bildreferenz

Unverändertes Ergebnis: SHA-256 29952bdf352980f0f48bf114b0fade48284d1d56b7219a51e4936ca11850f2e0. Das Ergebnis enthielt unerwünschte Transparenz; keine Übernahme.

Use case: scientific-educational
Asset type: eine deutschsprachige didaktische Rastergrafik für einen Physik-Lernzielatlas, gymnasiale Oberstufe, breites Querformat.

Erstelle genau eine klare, freundliche Infografik mit dem Titel „Sonnenmasse aus Bahndaten abschätzen“. Zeige einen verständlichen Rückschluss von Bahndaten über ein physikalisches Modell auf die Sonnenmasse.

Stil: heller, nahezu weißer hellblauer Hintergrund, ruhige hellblaue und helllila Akzente, warme gelborange Sonne, kräftige saubere dunkelblaue oder schwarze handgezeichnete Konturen und sehr gut lesbare freundliche Handschrift. Großzügiger Weißraum, wenige große Elemente. Eine schematische Unterrichtsgrafik, keine Fotografie.

Komposition: drei klar verbundene Stationen von links nach rechts. Links zwei große Eingangsdaten-Kärtchen mit einem einfachen Lineal-Symbol beziehungsweise Stoppuhr-Symbol: „Bahnradius r [m]“ und „Umlaufzeit T [s]“. Darüber „Bahndaten“. Darunter „Näherungsweise kreisförmige Planetenbahn um die Sonne“. KEINE Bahnlinie, KEIN Kreisbahn- oder Ellipsendiagramm zeichnen.

Von beiden Datenkärtchen führt ein klarer gemeinsamer Schluss-Pfeil zur mittleren Station „Newton-Kepler-Modell“. Diese enthält groß und klar den Erklärungssatz „Gravitation erklärt die Umlaufbewegung“. Dann ein weiterer Schluss-Pfeil zur rechten Station mit einem einzelnen warmen Sonnensymbol und „Erschlossene Sonnenmasse“. Direkt darunter die große zentrale Formel als echter waagerechter Bruch:
M☉ ≈ (4 π² r³) / (G T²)
Dabei muss der gesamte Ausdruck 4 π² r³ im Zähler und der gesamte Ausdruck G T² im Nenner stehen. Verwende das Sonnensymbol ☉ als tiefgestellten Index zu M, richtige Hochzahlen 2 und 3, das Näherungszeichen ≈ und einen durchgehenden Bruchstrich. Unter der Formel „M☉ in kg“ und kleiner „G: Gravitationskonstante (SI)“.

Unten ein kurzer gut lesbarer Modellrahmen mit exakt:
„Annahmen: Planetenmasse vernachlässigbar; Störungen vernachlässigt.“
Darunter als eine anschauliche Folgerung:
„Bei gleichem r: kürzeres T → größere Sonnenmasse“

Alle Pfeile stellen Informationsfluss oder die explizite Folgerung dar, keine Kraftpfeile. Das Sonnenmotiv ist ein Symbol für die erschlossene Zentralmasse, kein Größenvergleich. Keine Zahlenrechnung, keine Beispielwerte, keine Waage, keine direkte Massenmessung, keine weiteren Formeln, keine zusätzlichen Themen, keine Logos, keine technischen IDs, kein Wasserzeichen. Den genannten deutschen Text mit korrekten Umlauten vollständig und gut lesbar setzen; Text nicht überladen oder mit Symbolen überdecken.

## 2. Ausschließlich Deckkraft-/Hintergrundkorrektur

Einzige Bildreferenz: das vorstehende Ergebnis mit SHA-256 29952bdf352980f0f48bf114b0fade48284d1d56b7219a51e4936ca11850f2e0. Übernommenes Ergebnis: SHA-256 2fdb48b86910d17947ec4cca40168a8fe57ffcb5de4f31084460cff2dd416115. Es wurden keine programmatischen Bildänderungen vorgenommen.

Use case: precise-object-edit
Asset type: bestehende deutschsprachige Physik-Infografik.
Input images: Image 1 ist das einzige Edit-Ziel.

Ändere ausschließlich den Hintergrund und die unerwünschten Transparenz-/Freistellartefakte des Referenzbildes. Ersetze jede transparente oder teiltransparente Hintergrundstelle durch eine durchgehend deckende, ruhige, nahezu weiße sehr hellblaue Fläche. Das gesamte rechteckige Bild muss vollständig opak sein: keine Transparenz, kein Alphaloch, keine schwarzen Leerflächen, keine Schachbrettmuster, keine weißen Freistellränder, keine Sprenkel oder ausgefransten Artefakte. Säubere nur diese Artefakte am Übergang der vorhandenen Elemente zum neuen Hintergrund.

Alle eigentlichen Bildinhalte müssen exakt erhalten bleiben: identisches Querformat, Bildausschnitt, Dreispaltenlayout, Positionen, Abstände, Größen, Farben, Karten, Sonne, Lineal, Stoppuhr, Pfeile und handgezeichnete Typografie. Keine neue Gestaltung. Kein Hinzufügen oder Entfernen von fachlichen Bildobjekten. Die vorhandenen dunkelblauen Texte sollen auf der nun deckenden hellen Fläche stehen.

Alle Texte, Umlaute, Zeichen, Indizes, Potenzen und die Formel wort- und zeichengetreu an ihren bisherigen Positionen bewahren. Insbesondere die Sonnenmassenformel mit M und tiefgestelltem Sonnensymbol, Näherungszeichen und horizontalem Bruch: Zähler 4 π² r³; Nenner G T². Keine Änderung der Modellannahmen, Einheiten oder der Folgerung unten. Keine neuen Wörter, Logos oder Wasserzeichen.

Dies ist nur eine Reparatur des transparenten Hintergrundes, keine Neugenerierung des Inhalts.
```

## Review-Notiz

Dieses Asset muss vor breitem Rollout gegen die Visualisierungs-Checkliste geprüft werden: mathematische Korrektheit, Alters- und Kontextpassung, Textlesbarkeit, Barrierefreiheit und Lizenz-/Copyright-Risiko.
