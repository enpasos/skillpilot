# J5 Terminal Autonomy Assessment - Mathematik

Status: released

Canonical goal: `81c8da58-9258-488e-9ab8-48500ab31652` (`canonical_math_sek1_practice_j5`)

## Coverage

Covered goal IDs:

- `31a89d59-7d45-5e60-a8e8-561001b05f2d`
- `1a25ef44-f310-4c23-9ba8-44baec60d3b0`
- `8d1bb6ce-2433-4637-94ba-3bdc35fa5b10`
- `191c67db-44a8-4f63-994a-d85e8e301194`
- `11e3cf89-9224-5894-8e4a-ae8ff5af0119`
- `54148506-c23f-41b8-959b-068dd194cf15`
- `b5de0574-93ed-409c-80ee-312211420cd6`
- `03a87896-088d-4b21-a37b-d0604d784540`
- `9ef6c4fa-b97a-5d7a-86c1-96690f02d916`
- `d825f7ce-e19b-594a-8181-eff199c21d93`
- `e82d8d3a-9012-5482-afe6-ab0d727a49bb`
- `d07ef7b1-8bd2-56e0-9e74-d90c3c3e02fe`
- `3fde4db5-9e92-5f3a-98e1-d386a42b9e01`
- `0bd7dc9b-c7f9-52e6-b374-a019edfd821c`

Covered strands: `L1`, `L2`, `L4`

Demand levels: `AB1`, `AB2`, `AB3`

## Task

Die Klasse 5c plant einen Projekttag auf dem Schulhof. Der Lageplan wird in ein Koordinatensystem eingetragen. Eine Einheit entspricht `1 m`.

Schulhof: `A(0|0)`, `B(18|0)`, `C(18|12)`, `D(0|12)`.

Spielzone: `E(2|2)`, `F(10|2)`, `G(10|7)`, `H(2|7)`.

Materialtisch: `T(14|3)`.

Bestellliste:

| Material | Anzahl |
| --- | ---: |
| 8 Klassensets mit je 24 Aufgabenkarten | |
| 6 Stationen mit je 35 Stickern | |
| 4 Kreidepakete mit je 125 Kreidestücken | |

Kasse:

| Vorgang | Änderung |
| --- | ---: |
| Startguthaben | `+850 EUR` |
| Dekoration | `-260 EUR` |
| Material | `-135 EUR` |
| Klassenbeiträge | `+192 EUR` |

1. Berechne die Gesamtzahl der Aufgabenkarten, Sticker und Kreidestücke. Nutze mindestens einen Rechenvorteil und ordne dein Ergebnis zusammen mit `1 000` und `10 000` der Größe nach. Erkläre außerdem kurz, warum es keine größte natürliche Zahl gibt. `(6 BE)`

2. Bestimme den Kassenstand nach allen vier Vorgängen. Prüfe die Aussage: "Schon nach den beiden Ausgaben sind noch mindestens `500 EUR` in der Kasse." Gib ein Gegenbeispiel oder eine Rechnung an. `(6 BE)`

3. Bestimme die Seitenlängen und den Flächeninhalt der Spielzone. Erkläre am Rechteck, warum die Flächenformel `Länge * Breite` hier passt. `(7 BE)`

4. Markiere alle Punkte auf waagerechten oder senkrechten Linien durch `T`, die genau `4 m` von `T` entfernt sind. Entscheide, welche davon noch auf dem Schulhof liegen. `(5 BE)`

5. Löse die beiden Planungsgleichungen und kontrolliere jeweils mit der Umkehraufgabe: `x + 17 = 43` und `4y = 72`. Deute `x` als fehlende Helferinnen und Helfer und `y` als Anzahl der Viererbänke. `(6 BE)`

## Solution

1. `8 * 24 + 6 * 35 + 4 * 125 = 192 + 210 + 500 = 902`. Ein Rechenvorteil ist zum Beispiel, zuerst `4 * 125 = 500` zu rechnen. Ordnung: `902 < 1 000 < 10 000`. Es gibt keine größte natürliche Zahl, weil man zu jeder natürlichen Zahl noch `1` addieren kann.

2. Nach allen Vorgängen: `850 - 260 - 135 + 192 = 647`, also `647 EUR`. Nach den beiden Ausgaben sind es `850 - 260 - 135 = 455`, also nicht mindestens `500 EUR`; `455 < 500` widerlegt die Aussage.

3. Die Spielzone ist `8 m` lang und `5 m` breit, weil `10 - 2 = 8` und `7 - 2 = 5`. Der Flächeninhalt beträgt `8 * 5 = 40`, also `40 m^2`. Die Formel passt, weil sich das Rechteck in `8` Spalten und `5` Reihen aus Einheitsquadraten zerlegen lässt.

4. Von `T(14|3)` aus liegen die Punkte im Abstand `4 m` auf den waagerechten oder senkrechten Linien bei `(10|3)`, `(18|3)`, `(14|7)` und `(14|-1)`. Auf dem Schulhof liegen `(10|3)`, `(18|3)` und `(14|7)`. Der Punkt `(14|-1)` liegt außerhalb, weil die y-Koordinate kleiner als `0` ist.

5. `x + 17 = 43` ergibt `x = 26`, Kontrolle: `26 + 17 = 43`. Es fehlen `26` Helferinnen und Helfer. `4y = 72` ergibt `y = 18`, Kontrolle: `18 * 4 = 72`. Es werden `18` Viererbänke benötigt.

## Scoring

Max points: 30

Passing points: 15

Steps:

- `j5_released_1` - 6 BE - Materialmengen mit natürlichen Zahlen korrekt berechnet, Rechenvorteil genutzt und Zahlen geordnet.
- `j5_released_2` - 6 BE - Kassenänderungen mit ganzen Zahlen korrekt verarbeitet und eine falsche Aussage durch Rechnung widerlegt.
- `j5_released_3` - 7 BE - Rechteckmaße und Flächeninhalt aus Koordinaten bestimmt und die Flächenformel über Einheitsquadrate erklärt.
- `j5_released_4` - 5 BE - Punktmenge mit Abstand `4 m` zu `T` bestimmt und Schulhoflage geprüft.
- `j5_released_5` - 6 BE - Additive und multiplikative Gleichungen gelöst, kontrolliert und im Kontext gedeutet.
