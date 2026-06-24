# J8 Terminal Autonomy Assessment - Mathematik

Status: released

Canonical goal: `5fb3ee61-059c-47f4-8c6f-7285d7982a41` (`canonical_math_sek1_practice_j8`)

## Coverage

Covered goal IDs:

- `f9d284a3-1a47-4aaa-bde2-3dac1c3bb0f0`
- `e09072f9-67d9-412c-b872-24ecbf329232`
- `ae772695-d55e-4cc5-81bc-6605272759b4`
- `4acca6ef-5344-4dd1-b53d-506907573cf7`
- `2f598bc7-c117-47d7-bb81-0f08ad679b91`
- `e6eb42c7-454f-49bf-b598-64d2935d2735`
- `fa72cf74-a31e-402e-90d7-422c118f4a5b`
- `797ee047-b8dd-45cf-880e-98571a56c690`
- `0a154cbd-1218-4553-835c-a754e9901bba`
- `e42c208d-9555-43cc-92f5-5bb4c0688726`
- `fa0b6b69-ce54-4711-90e6-26f27249cd71`
- `36728db8-da44-4add-97b8-0fdd7cfd9c41`
- `647ec09d-68ae-57db-9ca4-aeb2da4218f1`
- `34ba4714-a0ff-4a48-857f-d2481cbe0441`
- `0c8b59cb-62c0-5cc7-afd0-7e6e89cbee43`
- `be18cef8-ad5b-56d4-9ecf-9ba45bad211e`
- `f7a9a0b4-ec64-468f-8da4-59c5055eac1d`
- `15512e77-31e3-5222-8a6b-84791618e5ce`
- `76478e47-5ff9-5de1-b601-5e6e436ad855`
- `415bd48b-8a76-4d4f-bfdd-d085573e7ac3`
- `f65ab452-1884-57b0-9be3-c7d9e4944891`
- `1842da92-ca2c-5fed-a946-e6413a6285bb`
- `f6574cdc-e29c-5a8f-a009-9f28b3bcf9be`
- `fc34449a-fbf4-574c-884f-ecdf48b42d2e`
- `cf8c5677-f3c5-5563-8f0a-68443fbab7bf`
- `797c4b05-96c4-59a7-85b2-f2690e22918f`

Covered strands: `L1`, `L2`, `L4`, `L5`

Demand levels: `AB1`, `AB2`, `AB3`

## Task

Eine Schule plant einen Fahrrad-Aktionstag. Zwei Anbieter verleihen Fahrräder, ein Getränkestand arbeitet mit zylindrischen Tanks, und die Finanzierung wird tabellarisch überprüft.

Fahrradverleih:

| Anbieter | Kostenmodell |
| --- | --- |
| A | Grundpreis `40 EUR`, zusätzlich `6 EUR` je Fahrrad |
| B | Grundpreis `10 EUR`, zusätzlich `9 EUR` je Fahrrad |

Getränketank:

Ein zylindrischer Tank hat Radius `0.4 m` und Höhe `1.2 m`. Verwende `π≈3.14`.

Finanzierung:

Die Schule spart monatlich einen festen Betrag. Startkapital: `120 EUR`.

| Monat | Kontostand bei `35 EUR` Sparrate |
| ---: | ---: |
| 0 | `120` |
| 1 | `155` |
| 2 | `190` |
| 3 | `225` |

Konstruktionsskizze:

Ein Kreis hat Mittelpunkt `M(4|3)` und Radius `3`. Der Punkt `P(10|3)` liegt außerhalb des Kreises.

1. Stelle für beide Anbieter lineare Kostenfunktionen auf. Berechne die Kosten für `8` und `12` Fahrräder. Bestimme die Nullstelle der Funktion `D(x)=A(x)-B(x)` und deute sie als Schnittpunkt der beiden Kostenmodelle. Stelle die Werte in einer Tabelle dar und beschreibe, wie die Graphen verlaufen. `(8 BE)`

2. Löse das Gleichungssystem der beiden Kostenmodelle rechnerisch. Untersuche außerdem die Gleichung `2(3x-5)=4x+14` und die Ungleichung `6x+40<9x+10`. Deute die Ergebnisse im Kontext. `(6 BE)`

3. Für die Getränkeausgabe gilt näherungsweise `y=120/x`, wobei `x` die Anzahl gleich großer Gruppen und `y` die Liter pro Gruppe beschreibt. Bestimme die Definitionsmenge im Sachkontext, berechne die Achsenschnittpunkte, soweit sie existieren, und beschreibe den Parametereinfluss, wenn statt `120` Litern `180` Liter vorhanden sind. `(6 BE)`

4. Vereinfache die Bruchterme und nutze formale Schreibweise sauber:\n\n`1/(x+2)+3/(x+2)`, `(2a)/(5b) * (15b)/(4a)`, `((x+1)/x) : ((x+1)/(2x))`. Gib jeweils sinnvolle Einschränkungen für Variablen an. `(6 BE)`

5. Berechne das Volumen des zylindrischen Tanks. Begründe geometrisch, warum die Grundfläche mit der Höhe multipliziert wird. Ein Schlauch soll tangential an einen kreisförmigen Anschluss geführt werden. Beschreibe eine Konstruktion der Tangente von `P` an den Kreis um `M` und nutze den Satz des Thales zur Begründung. `(7 BE)`

6. Die Schule möchte mindestens `400 EUR` erreichen. Bestimme aus der Tabelle und rechnerisch, nach wie vielen Monaten dies mit `35 EUR` Sparrate erstmals gelingt. Bestimme außerdem näherungsweise, welche monatliche Sparrate bei einer Laufzeit von `8` Monaten nötig wäre. `(5 BE)`

7. Eine Schülerin sagt: "Bei Anbieter A ist der Preis pro Fahrrad immer `6 EUR`, weil die Funktionsgleichung `A(x)=40+6x` die Steigung `6` hat." Erkläre das Missverständnis und korrigiere die Aussage. `(6 BE)`

## Solution

1. `A(x)=40+6x`, `B(x)=10+9x`. Für `8` Fahrräder: `A(8)=88`, `B(8)=82`. Für `12` Fahrräder: `A(12)=112`, `B(12)=118`. `D(x)=A(x)-B(x)=30-3x`; die Nullstelle ist `x=10`. Bei `10` Fahrrädern kosten beide Anbieter `100 EUR`. Die Graphen sind Geraden; A startet höher und steigt flacher, B startet niedriger und steigt steiler.

2. `40+6x=10+9x` ergibt `30=3x`, also `x=10`. Die Kosten betragen `100 EUR`. `2(3x-5)=4x+14` ergibt `6x-10=4x+14`, also `2x=24` und `x=12`. Die Ungleichung `6x+40<9x+10` ergibt `30<3x`, also `x>10`; ab mehr als `10` Fahrrädern ist Anbieter A günstiger.

3. Im Sachkontext gilt `x` als positive Gruppenzahl, also `x>0`, meistens ganzzahlig. Für `y=120/x` gibt es keinen Achsenschnittpunkt mit der y-Achse, weil `x=0` nicht erlaubt ist, und keinen mit der x-Achse, weil `120/x` nie `0` wird. Bei `180` Litern wird `y=180/x`; für gleiche Gruppenzahl erhält jede Gruppe mehr Liter, der Graph liegt oberhalb.

4. `1/(x+2)+3/(x+2)=4/(x+2)` mit `x≠-2`. `(2a)/(5b)*(15b)/(4a)=3/2` mit `a≠0`, `b≠0`. `((x+1)/x):((x+1)/(2x))=2` mit `x≠0` und `x≠-1`.

5. Volumen: `V=πr^2h≈3.14*0.4^2*1.2=0.60288`, also etwa `0.603 m^3`. Die Kreisfläche beschreibt eine Schicht; durch Multiplikation mit der Höhe werden gleich große Schichten aufsummiert. Zur Tangente: Konstruiere den Kreis mit Durchmesser `MP`. Seine Schnittpunkte mit dem gegebenen Kreis sind Berührpunkte. Nach dem Satz des Thales ist der Winkel am Berührpunkt rechtwinklig, daher steht der Radius senkrecht auf der Tangente.

6. Gesucht ist `120+35m≥400`. Also `35m≥280` und `m≥8`. Nach `8` Monaten wird `400 EUR` erreicht. Bei `8` Monaten und Ziel `400 EUR` ist die Sparrate `(400-120)/8=35 EUR`; bei anderen Zielbeträgen würde man entsprechend `Sparrate=(Ziel-Start)/Monate` verwenden.

7. Die Steigung `6` bedeutet: Wenn ein weiteres Fahrrad dazukommt, steigen die Kosten um `6 EUR`. Der durchschnittliche Preis pro Fahrrad ist bei Anbieter A aber `(40+6x)/x`, also wegen des Grundpreises größer als `6 EUR` und abhängig von `x`.

## Scoring

Max points: 44

Passing points: 22

Steps:

- `j8_released_1` - 8 BE - Lineare Funktionen aufgestellt, Werte berechnet, Darstellungen gewechselt, Nullstelle/Schnittpunkt gedeutet.
- `j8_released_2` - 6 BE - Lineares Gleichungssystem, Gleichung und Ungleichung gelöst und kontextbezogen interpretiert.
- `j8_released_3` - 6 BE - Umgekehrt proportionale Funktion mit Definitionsmenge, Achsenschnittpunkten und Parametereinfluss beschrieben.
- `j8_released_4` - 6 BE - Bruchterme addiert, multipliziert, dividiert und Variableneinschränkungen formal korrekt angegeben.
- `j8_released_5` - 7 BE - Zylindervolumen berechnet, Kreis-Zylinder-Beziehung begründet, Tangente konstruktiv über Thales erklärt.
- `j8_released_6` - 5 BE - Laufzeit und Sparrate tabellarisch sowie rechnerisch bestimmt.
- `j8_released_7` - 6 BE - Steigungs-/Durchschnittskosten-Missverständnis an einer linearen Funktion fachlich korrigiert.
