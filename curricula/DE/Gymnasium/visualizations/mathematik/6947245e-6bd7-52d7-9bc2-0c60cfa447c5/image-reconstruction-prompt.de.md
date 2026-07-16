# Bildrekonstruktionsprompt: Parameterwerte aus vorgegebenen Funktionseigenschaften bestimmen

## SkillPilot-Ziel

- SkillPilot-ID: `6947245e-6bd7-52d7-9bc2-0c60cfa447c5`
- Titel: Parameterwerte aus vorgegebenen Funktionseigenschaften bestimmen
- Beschreibung: Die lernende Person kann in ganzrationalen Funktionstermen einzelne Parameterwerte aus vorgegebenen Eigenschaften wie Nullstelle, Extremstelle oder Wendestelle bestimmen und die Bedingungen begründen.

## Generator

- Provider: Google Gemini / Nano Banana Pro
- Quellbild: `6947245e-6bd7-52d7-9bc2-0c60cfa447c5.jpg`

## Zweck

Dieser Alternativprompt beschreibt das erzeugte Bild als eigenständige Promptbasis für spätere Korrekturen. Er ist keine fachliche Freigabe und ersetzt nicht den Review.

## Prompt

```text
Ein klares, lehrreiches Flussdiagramm im Stil einer Infografik mit abgerundeten Rechtecken und Pfeilen, die den Prozess der Parameterbestimmung aus Funktionseigenschaften darstellen. Der Hintergrund ist weiß.

Oben mittig steht der große, dunkelblaue Titel: "Parameter aus Eigenschaften bestimmen".

Das Diagramm ist in fünf vertikale Spalten unterteilt, die von links nach rechts einen Prozessfluss darstellen:

**Spalte 1: GEGEBEN**
Ein großes, hellblaues Rechteck mit abgerundeten Ecken und dunkelblauem Rand. Oben mittig steht der dunkelblaue Titel "GEGEBEN".
In diesem Rechteck befinden sich vier kleinere Elemente, vertikal angeordnet:
1.  Ein violettes, gerolltes Pergament-Symbol mit weißem Hintergrund. Darauf steht in dunkelvioletter Schrift:
    `f(x) =`
    `x³ + ax² + bx + c`
2.  Ein hellgrünes Rechteck mit abgerundeten Ecken und dunkelgrünem Rand. Oben steht der dunkelblaue Text "Nullstelle bei x = 0". Darunter ist ein schwarzes Koordinatensystem mit einer violetten Kurve, die durch den Ursprung verläuft.
3.  Ein hellgrünes Rechteck mit abgerundeten Ecken und dunkelgrünem Rand. Oben steht der dunkelblaue Text "Extremstelle bei x = 1". Darunter ist ein schwarzes Koordinatensystem mit einer orangefarbenen Kurve, die einen lokalen Hoch- und Tiefpunkt zeigt, markiert mit zwei orangefarbenen Punkten.
4.  Ein hellgrünes Rechteck mit abgerundeten Ecken und dunkelgrünem Rand. Oben steht der dunkelblaue Text "Wendestelle bei x = 2". Darunter ist ein schwarzes Koordinatensystem mit einer violetten Kurve, die einen Wendepunkt zeigt, markiert mit zwei orangefarbenen Punkten.

Ein großer, hellblauer Pfeil zeigt von der Mitte der ersten Spalte nach rechts zur zweiten Spalte. Auf dem Pfeil steht in dunkelblauer Schrift "Gleichungen aufstellen".

**Spalte 2: GLEICHUNGEN**
Ein großes, hellgelbes Rechteck mit abgerundeten Ecken und orangefarbenem Rand. Oben mittig steht der dunkelblaue Titel "GLEICHUNGEN".
In diesem Rechteck befinden sich vier kleinere Elemente, vertikal angeordnet:
1.  Ein hellgelbes Rechteck mit weißem Hintergrund. Darauf steht in dunkelvioletter Schrift:
    `f'(x) = 3x² + 2ax + b`
    `f''(x) = 6x + 2a`
2.  Ein hellgrünes Rechteck mit abgerundeten Ecken und dunkelgrünem Rand. Oben steht der dunkelblaue Text "Nullstelle". Darunter auf weißem Hintergrund in dunkelvioletter Schrift:
    `f(0) = 0`
    `→ 0³ + a(0)² + b(0) + c = 0`
    Darunter ein kleines, hellgrünes Rechteck mit abgerundeten Ecken und dunkelgrünem Rand, das in dunkelvioletter Schrift `c = 0` enthält.
    Ein dunkelgrauer Pfeil zeigt von der Unterseite dieses Rechtecks nach unten.
3.  Ein hellgrünes Rechteck mit abgerundeten Ecken und dunkelgrünem Rand. Oben steht der dunkelblaue Text "Extremstelle". Darunter auf weißem Hintergrund in dunkelvioletter Schrift:
    `f'(1) = 0`
    `→ 3(1)² + 2a(1) + b = 0`
    Darunter ein kleines, hellgrünes Rechteck mit abgerundeten Ecken und dunkelgrünem Rand, das in dunkelvioletter Schrift `3 + 2a + b = 0` enthält.
    Ein dunkelgrauer Pfeil zeigt von der Unterseite dieses Rechtecks nach unten.
4.  Ein hellgrünes Rechteck mit abgerundeten Ecken und dunkelgrünem Rand. Oben steht der dunkelblaue Text "Wendestelle". Darunter auf weißem Hintergrund in dunkelvioletter Schrift:
    `f''(2) = 0`
    `→ 6(2) + 2a = 0`
    Darunter ein kleines, hellgrünes Rechteck mit abgerundeten Ecken und dunkelgrünem Rand, das in dunkelvioletter Schrift `12 + 2a = 0` enthält.

Ein großer, orangefarbener Pfeil zeigt von der Mitte der zweiten Spalte nach rechts zur dritten Spalte. Auf dem Pfeil steht in dunkelblauer Schrift "Parameter lösen".

**Spalte 3: GELÖSTE PARAMETER**
Ein großes, hellorangefarbenes Rechteck mit abgerundeten Ecken und dunkelorangefarbenem Rand. Oben mittig steht der dunkelblaue Titel "GELÖSTE PARAMETER".
In diesem Rechteck befinden sich drei kleinere Elemente, vertikal angeordnet:
1.  Ein kleines, hellorangefarbenes Rechteck mit abgerundeten Ecken und dunkelorangefarbenem Rand, das in dunkelvioletter Schrift `a = -6` enthält. Darunter auf weißem Hintergrund in dunkelvioletter Schrift `a = -12 / 2`.
2.  Ein kleines, hellorangefarbenes Rechteck mit abgerundeten Ecken und dunkelorangefarbenem Rand, das in dunkelvioletter Schrift `b = 9` enthält. Darunter auf weißem Hintergrund in dunkelvioletter Schrift:
    `3 + 2(-6) + b = 0`
    `→ 3 - 12 + b = 0`
    `→ -9 + b = 0`
3.  Ein kleines, hellorangefarbenes Rechteck mit abgerundeten Ecken und dunkelorangefarbenem Rand, das in dunkelvioletter Schrift `c = 0` enthält.

Ein großer, roter Pfeil zeigt von der Mitte der dritten Spalte nach rechts zur vierten Spalte. Auf dem Pfeil steht in dunkelblauer Schrift "Ergebnis einsetzen".

**Spalte 4: ERGEBNIS: FUNKTION**
Ein großes, hellrotes Rechteck mit abgerundeten Ecken und dunkelrotem Rand. Oben mittig steht der dunkelblaue Titel "ERGEBNIS: FUNKTION".
In diesem Rechteck befindet sich auf weißem Hintergrund in dunkelvioletter Schrift:
`f(x) = x³ - 6x² + 9x`
Darunter ist ein gelbes Glühbirnen-Symbol, das leuchtet. Daneben ist eine weiße, wolkenförmige Sprechblase mit rotem Rand, die den dunkelblauen Text "Alle Parameter gefunden!" enthält.

Ein großer, hellblauer Pfeil zeigt von der Mitte der vierten Spalte nach rechts zur fünften Spalte. Auf dem Pfeil steht in dunkelblauer Schrift "Überprüfen".

**Spalte 5: ÜBERPRÜFUNG**
Ein großes, hellviolettes Rechteck mit abgerundeten Ecken und dunkelviolettem Rand. Oben mittig steht der dunkelblaue Titel "ÜBERPRÜFUNG".
In diesem Rechteck befinden sich drei kleinere, hellviolette Rechtecke mit abgerundeten Ecken und dunkelviolettem Rand, vertikal angeordnet. Jedes hat einen weißen Hintergrund und enthält dunkelvioletten Text:
1.  `f(0) =`
    `0³ - 6(0)² + 9(0)`
    `= 0`
    Daneben ein dunkelviolettes Häkchen-Symbol.
2.  `f'(1) =`
    `3(1)² - 12(1) + 9`
    `= 3 - 12 + 9 = 0`
    Daneben ein dunkelviolettes Häkchen-Symbol.
3.  `f''(2) = 6(2) - 12`
    `= 12 - 12 = 0`
    Daneben ein dunkelviolettes Häkchen-Symbol.
```
