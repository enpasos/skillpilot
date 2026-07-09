# Bildrekonstruktionsprompt: Aussagen anhand von Diagrammen prüfen

## SkillPilot-Ziel

- SkillPilot-ID: `fcfbff12-bd03-52ec-b242-a693212b3d2b`
- Titel: Aussagen anhand von Diagrammen prüfen
- Beschreibung: Die lernende Person kann Aussagen anhand von Diagrammen prüfen, Belege aus dem Diagramm anführen und irreführende Darstellungen (z. B. abgeschnittene Achsen) erkennen.

## Generator

- Provider: Google Gemini (gemini-2.5-flash)
- Quellbild: `fcfbff12-bd03-52ec-b242-a693212b3d2b.jpg`

## Zweck

Dieser Alternativprompt beschreibt das erzeugte Bild als eigenständige Promptbasis für spätere Korrekturen. Er ist keine fachliche Freigabe und ersetzt nicht den Review.

## Prompt

```text
Ein Bild im handgezeichneten, pädagogischen Stil auf einem hellbeigen Hintergrund. Oben mittig steht der Titel "Aussagen am Diagramm prüfen" in blauer, handgeschriebener Sans-Serif-Schrift.

Links befindet sich ein Säulendiagramm mit handgezeichneten, leicht unregelmäßigen schwarzen Umrissen. Über dem Diagramm steht "Gelesene Seiten" in schwarzer, handgeschriebener Sans-Serif-Schrift. Die vertikale Y-Achse ist von 0 bis 40 in Zehnerschritten beschriftet (0, 10, 20, 30, 40) mit schwarzen, handgeschriebenen Zahlen. Von jeder Y-Achsen-Markierung gehen hellgraue horizontale Gitterlinien aus. Die horizontale X-Achse ist mit "Mo", "Di", "Mi", "Do", "Fr" in schwarzer, handgeschriebener Schrift beschriftet.

Die Säulen des Diagramms sind von links nach rechts wie folgt gefärbt und dimensioniert:
- 'Mo': Eine blaue Säule, deren Höhe der Marke 10 auf der Y-Achse entspricht.
- 'Di': Eine grüne Säule, deren Höhe der Marke 20 auf der Y-Achse entspricht.
- 'Mi': Eine gelbe Säule, deren Höhe der Marke 15 auf der Y-Achse entspricht (mittig zwischen 10 und 20).
- 'Do': Eine rote Säule, deren Höhe der Marke 30 auf der Y-Achse entspricht.
- 'Fr': Eine orangefarbene Säule, deren Höhe der Marke 25 auf der Y-Achse entspricht (mittig zwischen 20 und 30).

Rechts neben dem Diagramm sind zwei Informationsfelder vertikal angeordnet.

Das obere Feld ist ein rechteckiger Kasten mit abgerundeten Ecken, weißer Füllung und einem dicken grünen Umriss. Darin befindet sich eine grüne Sprechblase mit dickem grünem Umriss, die den Text "Do: 30 Seiten" in schwarzer, handgeschriebener Schrift enthält. Rechts neben der Sprechblase ist ein großes grünes Häkchen-Symbol. Darunter steht "Richtig" in grüner, handgeschriebener Schrift. Eine dicke grüne Pfeillinie zeigt von der Spitze der roten 'Do'-Säule im Diagramm zur linken Seite dieses grünen Kastens.

Das untere Feld ist ein rechteckiger Kasten mit abgerundeten Ecken, weißer Füllung und einem dicken roten Umriss. Darin befindet sich eine rote Sprechblase mit dickem rotem Umriss, die den Text "Fr: 15 Seiten" in schwarzer, handgeschriebener Schrift enthält. Unterhalb der Sprechblase steht "Fr: 25" in roter, handgeschriebener Schrift. Rechts neben der Sprechblase und dem Text "Fr: 25" ist ein großes rotes 'X'-Symbol. Darunter steht "Falsch" in roter, handgeschriebener Schrift. Eine dicke rote Pfeillinie zeigt von der Spitze der orangefarbenen 'Fr'-Säule im Diagramm zur linken Seite dieses roten Kastens.
```
