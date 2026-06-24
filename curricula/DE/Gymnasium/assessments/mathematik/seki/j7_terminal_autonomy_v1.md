# J7 Terminal Autonomy Assessment - Mathematik

Status: released

Canonical goal: `811d6d09-130e-47b2-aba8-a5c401fe3251` (`canonical_math_sek1_practice_j7`)

## Coverage

Covered goal IDs:

- `59d5a330-61be-4590-ab46-cf7cefecd144`
- `8064088b-dc0a-4a67-ad63-360fdcc9869d`
- `bd8fd6d5-7155-45a5-96f0-008a4e9acb3a`
- `7dea79d2-67f2-4d92-b6cc-ad1b953dca3d`
- `f3167cab-bb23-4bb9-8a27-22e3c5015d44`
- `093397e0-eec8-45bb-9a5a-a24827876df5`
- `b819973b-4cad-48a4-9f7e-f74b5e75ea6c`
- `0afe00fe-8cbc-4ed4-8b50-84494067e362`
- `d668c22d-caeb-5e91-8980-721c931a2bcf`
- `804d7443-9976-5d81-a47d-1601f42f7e0e`
- `a6469c01-6ca3-5eb2-a82c-94f3d0560b32`
- `bc1a4cba-a8a8-5e59-9f3f-1e8fe7918004`
- `314854a0-4e97-462e-9486-9fd83652e91d`
- `c3cce9a1-9adc-4470-b2d8-aea81d6d7b65`
- `37bf2eb6-75a0-44c1-a988-ca0e203cb072`
- `2345ae25-5805-4c72-b830-32e63cc6262a`

Covered strands: `L1`, `L2`, `L4`, `L5`

Demand levels: `AB1`, `AB2`, `AB3`

## Task

Die Jahrgangsstufe 7 organisiert eine Sport- und Experimentierstation beim Schulfest.

Messdaten der Laufstation:

| Person | Strecke | Zeit |
| --- | ---: | ---: |
| A | `600 m` | `2 min 30 s` |
| B | `1.2 km` | `6 min` |

Rundenzeiten in Sekunden:

| Gruppe Nord | 84 | 86 | 90 | 92 | 93 | 95 | 100 |
| Gruppe Süd | 78 | 82 | 88 | 96 | 104 | 110 | 112 |

Materialpreise:

| Material | Preis |
| --- | ---: |
| Startgebühr für Werkzeug | `35 EUR` |
| Buttonrohling | `1.80 EUR` pro Stück |

Körpermodell:

Ein Messkeil wird als gerades Prisma modelliert. Die Grundfläche ist ein rechtwinkliges Dreieck mit Katheten `6 cm` und `8 cm`; die dritte Seite ist `10 cm`. Die Länge des Prismas beträgt `20 cm`. Die Masse beträgt `1200 g`.

Buttons:

Für ein Buttonmotiv wird ein Kreis mit Radius `4 cm` verwendet. Ein farbiger Halbkreis soll markiert werden.

1. Bestimme für Person A und Person B die Geschwindigkeit in `m/s`. Entscheide, wer schneller ist. Nutze die Angaben als Messwerte aus einer Quelle und beschreibe eine mögliche Messungenauigkeit. `(5 BE)`

2. Berechne Volumen und Oberfläche des Messkeils. Bestimme außerdem die Dichte des Materials in `g/cm^3`. `(7 BE)`

3. Berechne Umfang und Flächeninhalt des Buttonkreises sowie den Flächeninhalt des farbigen Halbkreises. Verwende `π≈3.14`. `(5 BE)`

4. Die Kosten für `n` Buttonrohlinge sind proportional. Stelle die proportionale Funktion `B(n)` auf, berechne die Kosten für `45` Rohlinge mit einem Dreisatz und beschreibe, warum der Graph eine Ursprungsgerade ist. Begründe außerdem, warum `B` eine Funktion ist. `(7 BE)`

5. Für die Gesamtkosten gilt `T(n)=35+1.80n`. Berechne `T(30)`. Forme den Term `3(n+4)-2n` äquivalent um und berechne seinen Wert für `n=30`. Eine Schülerin sagt: "`3(n+4)=3n+4`." Erkläre den Fehler und korrigiere ihn. `(7 BE)`

6. Die Klasse legt `350 EUR` für ein Jahr zu `2%` Zinsen an. Berechne den Zins und den neuen Kontostand. Danach gibt es einen Rabatt von `15%` auf eine Materialrechnung von `240 EUR`. Berechne den Rabatt und den Endpreis. `(4 BE)`

7. Entnimm den beiden Datenreihen die Minima, Mediane und Maxima. Bestimme für jede Gruppe das untere und obere Quartil und vergleiche die Verteilungen so, wie man es mit Boxplots tun würde. Beurteile auch, warum die Datenquelle "Sport-App" nicht automatisch fehlerfrei sein muss. `(5 BE)`

## Solution

1. Person A: `2 min 30 s = 150 s`, also `600/150=4 m/s`. Person B: `1.2 km = 1200 m`, `6 min = 360 s`, also `1200/360≈3.33 m/s`. Person A ist schneller. Mögliche Messungenauigkeiten entstehen zum Beispiel durch verzögertes Starten/Stoppen der Uhr oder ungenau markierte Strecken.

2. Grundfläche des rechtwinkligen Dreiecks: `A_G=6*8/2=24 cm^2`. Volumen: `V=24*20=480 cm^3`. Mantelfläche: `(6+8+10)*20=480 cm^2`. Oberfläche: `2*24+480=528 cm^2`. Dichte: `1200/480=2.5 g/cm^3`.

3. Kreisumfang: `U=2πr≈2*3.14*4=25.12 cm`. Kreisfläche: `A=πr^2≈3.14*16=50.24 cm^2`. Halbkreisfläche: `25.12 cm^2`.

4. `B(n)=1.80n`. Dreisatz: `1` Rohling kostet `1.80 EUR`, also kosten `45` Rohlinge `45*1.80=81 EUR`. Der Graph ist eine Ursprungsgerade, weil bei `0` Rohlingen `0 EUR` anfallen und der Preis je Rohling konstant ist. `B` ist eine Funktion, weil jeder Anzahl `n` genau ein Preis zugeordnet wird.

5. `T(30)=35+1.80*30=89`, also `89 EUR`. `3(n+4)-2n=3n+12-2n=n+12`; für `n=30` ergibt das `42`. Der Fehler ist, dass die `3` mit beiden Summanden in der Klammer multipliziert werden muss. Korrekt ist `3(n+4)=3n+12`.

6. Zins: `2%` von `350 EUR` sind `0.02*350=7 EUR`. Neuer Kontostand: `357 EUR`. Rabatt: `15%` von `240 EUR` sind `36 EUR`. Endpreis: `204 EUR`.

7. Gruppe Nord: Minimum `84`, Median `92`, Maximum `100`, unteres Quartil `86`, oberes Quartil `95`. Gruppe Süd: Minimum `78`, Median `96`, Maximum `112`, unteres Quartil `82`, oberes Quartil `110`. Gruppe Süd hat die größere Streuung und einen höheren Median; einzelne sehr schnelle Werte ändern nichts daran, dass die Zeiten insgesamt stärker schwanken. Eine Sport-App kann Messfehler enthalten, etwa durch falsches Antippen, GPS-/Sensorfehler oder falsch zugeordnete Personen.

## Scoring

Max points: 40

Passing points: 20

Steps:

- `j7_released_1` - 5 BE - Geschwindigkeiten aus Messdaten berechnet, verglichen und Messungenauigkeit beschrieben.
- `j7_released_2` - 7 BE - Volumen, Oberfläche und Dichte eines geraden Prismas korrekt bestimmt.
- `j7_released_3` - 5 BE - Umfang und Flächeninhalte von Kreis und Halbkreis berechnet.
- `j7_released_4` - 7 BE - Proportionale Funktion, Dreisatz, Ursprungsgerade und Funktionsbegriff korrekt genutzt.
- `j7_released_5` - 7 BE - Termwerte berechnet, Terme äquivalent umgeformt und ein Distributivgesetz-Missverständnis korrigiert.
- `j7_released_6` - 4 BE - Zinsrechnung und Prozentrechnung in Sachkontexten korrekt durchgeführt.
- `j7_released_7` - 5 BE - Daten aus Sekundärquelle entnommen, Boxplot-Kenngrößen bestimmt, Verteilungen verglichen und Datenquelle kritisch beurteilt.
