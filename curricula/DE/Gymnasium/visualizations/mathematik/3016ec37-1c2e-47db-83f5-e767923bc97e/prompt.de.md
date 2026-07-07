# Lernzielvisualisierung: Definition des Skalarprodukts mithilfe orthogonaler Projektionen veranschaulichen

## SkillPilot-Ziel

- SkillPilot-ID: `3016ec37-1c2e-47db-83f5-e767923bc97e`
- Titel: Definition des Skalarprodukts mithilfe orthogonaler Projektionen veranschaulichen
- Beschreibung: Die lernende Person kann die orthogonale Projektion eines Vektors auf die durch einen anderen Vektor bestimmte Richtung nutzen, um die Definition des Skalarprodukts geometrisch zu veranschaulichen und fachsprachlich zu erläutern.

## Generator

- Provider: Google Gemini / Nano Banana Pro
- Status: pilot
- Quellbild: `3016ec37-1c2e-47db-83f5-e767923bc97e.jpg`
- Public Asset: `/assets/goal-visualizations/mathematik/3016ec37-1c2e-47db-83f5-e767923bc97e/3016ec37-1c2e-47db-83f5-e767923bc97e.jpg`

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

Titel: Definition des Skalarprodukts mithilfe orthogonaler Projektionen veranschaulichen
Beschreibung: Die lernende Person kann die orthogonale Projektion eines Vektors auf die durch einen anderen Vektor bestimmte Richtung nutzen, um die Definition des Skalarprodukts geometrisch zu veranschaulichen und fachsprachlich zu erläutern.

Zusatzanweisung:
Pflichtinhalt:

Korrigiere die bestehende Infografik gezielt nur im linken geometrischen Diagramm. Erhalte den Aufbau, den Titel, die Rechnungskarte und die Deutungskarte unverändert. Schreibe die Texte auf den Karten nicht neu und veraendere keine Woerter dort. Die Rechnung bleibt:

a = (4,0)
b = (3,2)
a·b = 4*3 + 0*2 = 12
|a| = 4
Projektionslänge von b auf a = 12/4 = 3

Die geometrische Darstellung muss zu diesen Zahlen passen:

- Erhalte den bestehenden koordinatenarmen Stil. Fuege kein neues großes Koordinatengitter und keine neue vertikale Achse hinzu.
- Wichtigste Prioritaet: Die kleine geometrische Skizze muss maßstaeblich sein. Wenn nötig, reduziere Pfeildicke und Pfeilkopfgröße, damit die Längen klar erkennbar bleiben.
- Verwende gleiche Einheitlaenge in x- und y-Richtung.
- Die horizontale Achse zeigt die gleich großen Einheiten 0, 1, 2, 3, 4.
- Optional darf eine sehr dezente y-Skala mit 0, 1, 2 nahe am Lot erscheinen, wenn dadurch sichtbar wird, dass die Lotlaenge genau 2 ist.
- Die grüne Projektion proj_a(b) reicht von 0 bis 3 und hat Länge 3.
- Die blaue Reststrecke auf der a-Richtung reicht nur von 3 bis 4 und hat Länge 1.
- Die blaue Reststrecke darf visuell nur ein Drittel so lang sein wie die grüne Projektion.
- Die Markierungen 0, 1, 2, 3, 4 auf der horizontalen Achse müssen gleichmäßig verteilt sein.
- Der Lotfußpunkt liegt bei 3.
- Das orange gestrichelte Lot geht senkrecht vom Lotfußpunkt bei (3,0) bis zur Spitze von b bei (3,2).
- Das orange gestrichelte Lot hat Länge 2 und muss visuell zwei vertikale Einheiten lang sein.
- Das Lot darf nicht wie Länge 3 aussehen.
- Der Vektor b soll weiterhin vom Ursprung zur Spitze (3,2) laufen: horizontal 3 Einheiten, vertikal 2 Einheiten.
- Der orange Vektor b darf nicht zur Höhe 3 oder 4 gezeichnet werden.
- Wenn es hilft, beschrifte das kurze blaue Stueck klein mit "Rest 1" und das gestrichelte Lot klein mit "Lot 2".
- Schreibe "Länge = 3" klar lesbar; kein verwischtes oder falsch geschriebenes Wort.
- Schreibe "Deutungskarte:" exakt so, falls der Text sichtbar bleibt.
- Schreibe "wie viel von b in Richtung a zeigt" exakt mit Leerzeichen zwischen "von" und "b".

Halte die Farben bei:
- grüne Projektion von 0 bis 3
- blaue Reststrecke von 3 bis 4
- orange Vektor b
- orange gestricheltes Lot

Sichtbarer deutscher Text soll korrekte Umlaute verwenden.

Vermeiden:

- Kein blauer Pfeil, der länger als die Strecke von 3 bis 4 wirkt.
- Kein blauer Pfeil, der zwei Tick-Abstände lang wirkt.
- Kein orange gestricheltes Lot, das länger als zwei vertikale Tick-Abstände wirkt.
- Kein orange gestricheltes Lot mit Länge 3.
- Kein Vektor b, der zur Höhe 3 oder 4 zeigt.
- Keine großen Pfeilkoepfe, die die blaue Reststrecke optisch auf mehr als eine Einheit verlängern.
- Keine zusaetzlichen blauen Tick-Markierungen innerhalb der kurzen Reststrecke, wenn sie die Laenge 1 unklar machen.
- Kein neues Koordinatengitter, das b=(3,2) visuell widerspricht.
- Keine Änderung der Werte a=(4,0), b=(3,2), |a|=4, Projektionslänge=3 oder a·b=12.
- Keine Änderung der Aussage, dass das Skalarprodukt die signierte Projektionslänge misst.
- Keine Schreibfehler in vorhandenen deutschen Woertern, insbesondere nicht bei "Deutungskarte", "Länge", "Projektionslänge" oder "von b".
- Keine technischen IDs, Dateinamen, Plattformnamen, Produktnamen, internen Pfade oder internen Zielgruppenlabels im Bild.
```

## Review-Notiz

Dieses Asset muss vor breitem Rollout gegen die Visualisierungs-Checkliste geprüft werden: mathematische Korrektheit, Alters- und Kontextpassung, Textlesbarkeit, Barrierefreiheit und Lizenz-/Copyright-Risiko.
