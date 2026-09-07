# Lernzielvisualisierung: Waagerechter Wurf analysieren

## SkillPilot-Ziel

- SkillPilot-ID: `89a8cf15-7ba4-46c1-b1dc-fd161b20d9c2`
- Titel: Waagerechter Wurf analysieren
- Beschreibung: Die lernende Person kann den waagerechten Wurf experimentell untersuchen, als Überlagerung von horizontaler und vertikaler Bewegung deuten und die Flugbahn im x-y-Diagramm darstellen.

## Generator

- Provider: Google Gemini / Nano Banana Pro (gemini-3-pro-image)
- Status: pilot
- Quellbild: `89a8cf15-7ba4-46c1-b1dc-fd161b20d9c2.jpg`
- Public Asset: `/assets/goal-visualizations/physik/89a8cf15-7ba4-46c1-b1dc-fd161b20d9c2/89a8cf15-7ba4-46c1-b1dc-fd161b20d9c2.jpg`

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

Titel: Waagerechter Wurf analysieren
Beschreibung: Die lernende Person kann den waagerechten Wurf experimentell untersuchen, als Überlagerung von horizontaler und vertikaler Bewegung deuten und die Flugbahn im x-y-Diagramm darstellen.

Zusatzanweisung:
Pflichtinhalt:
Korrigiere das vorhandene quantitative Schema „Waagerechter Wurf“ in einem hellen gut lesbaren Lehrstil. Vor allem muss die tatsächliche Kurve an JEDER Stelle zu Zahlen und linearem Raster passen.
Modell: Start (0,0), v_x=2 m/s konstant, v_y(0)=0, g=10 m/s² als ausdrücklich vereinfachter Modellwert; Luftwiderstand vernachlässigt. x-Achse nach RECHTS, y-Achse nach UNTEN positiv; Achsentitel x / m, y / m.
Linker Graph linear: x-Ticks0,1,2,3,4,5,6 mit gleichen Abständen; y-Ticks0,5,10,15,20,25,30,35,40,45,50 mit gleichen Abständen. Parabel y=1,25x², anfangs exakt waagerechte Tangente. Tatsächliche markierte Punkte: t=0s:(0,0);t=1s:(2,5);t=2s:(4,20);t=3s:(6,45). Jeder Punkt muss EXAKT am passenden Rasterkreuz liegen, insbesondere letzter Punkt (6,45), nicht (6,47,5) oder(6,50). Alle gestrichelten Hilfslinien enden am richtigen Tick und am Punkt. Keine Verbindungsknicke; glatte Parabel.
Rechts Formeln „x=v_x·t“, „y=½g·t²“, „y=(g/(2v_x²))·x²“ und ausdrücklich die Modellbedingungen. Darunter Tabelle t/s:0,1,2,3; x/m:0,2,4,6; y/m:0,5,20,45.
Erklärung: „In gleichen Zeiten gleich große x-Zuwächse; y-Zuwächse wachsen. Beide Bewegungen verwenden dieselbe Zeit.“ Keine zusätzliche Pfeilbewegung nötig.

Vermeiden:
Kein nichtlineares Raster, keine doppelte/fehlende/ungeordneten Ticks. Kein t=3-Punkt zwischen45und50. Keine positive y-Achse nach oben bei positiver Fallformel. Keine Gerade als Parabel. Keine Einheit m/s für Beschleunigung.
```

## Review-Notiz

Dieses Asset muss vor breitem Rollout gegen die Visualisierungs-Checkliste geprüft werden: mathematische Korrektheit, Alters- und Kontextpassung, Textlesbarkeit, Barrierefreiheit und Lizenz-/Copyright-Risiko.
