# J9: Quadratische Gleichungen selbstständig lösen und prüfen

Stand 2026-09-28: fachlich geprüfte, maschinell freigegebene Fassung; nicht menschlich erprobt und kein M7-Nachweis. Das Ziel `9023226b-fc17-412b-807c-2bb45cd551d5` behandelt das Lösen **gegebener** Gleichungen; die Modellierung eines Sachproblems ist die getrennte Kompetenz `a7ccb7a9…`.

## Aufgabe (20 BE)

Löse die vier gegebenen Gleichungen. Wähle für jeden Fall einen zweckmäßigen **rechnerischen** Weg, bestimme und begründe die Anzahl reeller Lösungen und kontrolliere die Ergebnisse durch Einsetzen und eine geeignete Skizze. Eine Skizze allein ersetzt die Rechnung nicht.

1. `x² − 5x + 6 = 0`: Wähle einen kurzen Weg und bestimme alle Lösungen. (4 BE)
2. `2x² + 4x + 5 = 0`: Zeige, ob es reelle Lösungen gibt. (4 BE)
3. `x² − 4x + 4 = 0`: Zeige, wie viele **verschiedene** reelle Lösungen vorliegen und wie der Parabelgraph die x-Achse berührt oder schneidet. (4 BE)
4. `3x² + 2x − 2 = 0`: Löse mit der **Lösungsformel**, gib exakte Werte an und überprüfe dein Ergebnis. (6 BE)

Begründe abschließend, warum Faktorisieren in 1, quadratische Ergänzung in 2 und 3 sowie die Lösungsformel in 4 jeweils zweckmäßig sind und wie die Fälle null, eine und zwei reelle Lösungen graphisch sichtbar werden. (2 BE)

## Musterlösung

1. `x² − 5x + 6 = (x − 2)(x − 3)`; die zwei Lösungen sind `x = 2` und `x = 3`. Einsetzen ergibt `4 − 10 + 6 = 0` und `9 − 15 + 6 = 0`; der Graph schneidet die x-Achse an diesen zwei Stellen.
2. `2x² + 4x + 5 = 2(x + 1)² + 3 > 0` für jedes reelle `x`. Es gibt **keine** reelle Lösung. Der Scheitel `(-1|3)` liegt über der x-Achse; der nach oben geöffnete Graph schneidet sie nicht. Alternativ ergibt die Diskriminante `4² − 4·2·5 = −24 < 0`.
3. `x² − 4x + 4 = (x − 2)²`. Es gibt **genau eine verschiedene** reelle Lösung `x = 2` (doppelte Nullstelle). Die Probe ergibt `4 − 8 + 4 = 0`. Der Graph berührt die x-Achse im Scheitel `(2|0)`, ohne sie dort zu kreuzen.
4. Für `a = 3`, `b = 2`, `c = −2` ist die Diskriminante `b² − 4ac = 4 + 24 = 28 > 0`. Die Lösungsformel liefert `x = (−2 ± √28)/6 = (−1 ± √7)/3`, also zwei verschiedene reelle, irrationale Lösungen. Einsetzen in `3x² + 2x − 2` bestätigt jeweils `0`; die nach oben geöffnete Parabel schneidet die x-Achse an beiden Stellen.

Die Wahl des Verfahrens hängt von der Form ab. Die x-Achsen-Schnittpunkte entsprechen den reellen Gleichungslösungen; ein Abstand, eine Berührung und zwei Schnittpunkte liefern die Fälle null, eine und zwei Lösungen.

## Bewertung und Haltegrenze

| Schritt | BE |
| --- | ---: |
| 1: geeignete Faktorisierung, beide Lösungen, Kontrolle | 4 |
| 2: positive Scheitelform, keine reelle Lösung, Graphkontrolle | 4 |
| 3: doppelte Nullstelle, genau eine verschiedene Lösung, Berührung | 4 |
| 4: Lösungsformel mit korrekter Diskriminante, exakte Lösungen, Kontrolle | 6 |
| Verfahrenswahl und Zusammenhang von null/einer/zwei Lösungen begründet | 2 |
| **Summe** | **20** |

Für eine kriterientreue Bewertung gelten zusätzlich diese harten Punkteobergrenzen:

- In 1 gibt es ohne **beide** korrekt berechneten Nullstellen und die Begründung „zwei reelle Lösungen“ höchstens 1/4 BE. Die übrigen Punkte betreffen Einsetzprobe und graphische Kontrolle.
- In 2 gibt es ohne rechnerischen Nachweis, dass der Ausdruck für alle reellen `x` positiv ist, und die Aussage „keine reelle Lösung“ höchstens 1/4 BE.
- In 3 gibt es ohne rechnerischen Nachweis der doppelten Nullstelle und „genau eine verschiedene reelle Lösung“ höchstens 1/4 BE.
- In 4 gibt es ohne **angewandte Lösungsformel**, korrekte Diskriminante und beide exakten Lösungen höchstens 3/6 BE. Kontrollprobe und Skizze ersetzen die Formelarbeit nicht.

`passingPoints: 18` erzwingt damit bei kriterientreuer Bepunktung mindestens 2/4 Punkte in jedem der ersten drei Fälle und 4/6 Punkten im Formelfall; keine der vier Kernleistungen lässt sich auslassen. Die abschließenden 2 BE sind eine zusätzliche Begründung und keine alleinige Pflichtschwelle: Wer die vier Fälle vollständig rechnet, zeigt die Verfahrenswahl und die Lösungsanzahlen bereits innerhalb der Teilaufgaben. Der Server prüft derzeit nur den Gesamtpunktwert, nicht diese Schrittobergrenzen. Der Coach muss nach dem vorliegenden Raster bewerten; das Verhalten im echten Host ist getrennt zu erproben. Fachprüfung der vier Rechnungen und der negativen Bestehensfälle ist keine menschliche Erprobung und keine D-/P-/A-/M-/V-Freigabe.
