# Mathematik Q4: Caterer-Prüfungsaufgabe – aktuelle fokussierte QS

Stand: 23.09.2026. Gegenstand ist ausschließlich das aktuelle kanonische Prüfungsziel
`3095e125-fbb7-51c6-bf12-ffbb1735b9b7`. Historische Prüf- und
Reviewartefakte werden nicht umgeschrieben. Der reproduzierbare Vertrag steht
in `app/scripts/testMathQ4CatererExamScope.ts`; ausführbar mit
`npm --prefix app run test:math-q4-caterer-exam-scope`.

## Fachliche Entscheidung

Die Aufgabe prüft vier Schritte, für die `requires` und
`examData.coveredGoalIds` in derselben Reihenfolge genau diese aktuellen
GK/LK-`curricularAtomic`-Ziele enthalten müssen:

| Teil | Lernziel | Tatsächlich geprüfte Leistung |
| --- | --- | --- |
| 1 | `fde351a8-98b1-5d75-b4df-813beb2bbe3c` | Lineare Kostenbeziehungen aufstellen und Grundgebühr sowie Preis pro Essen deuten. |
| 2 | `8d2021d0-aa14-5023-998b-187356de7986` | Kostenmodelle rechnerisch vergleichen und die ganzzahlige Schwelle bestimmen. |
| 3 | `70f37fda-545f-51dc-a002-c8e435e5c4a5` | Das Ergebnis für 120 Essen als Entscheidung im Sachkontext begründen. |
| 4 | `5836c821-d43b-5c02-9ee5-e86bb87bb054` | Fehlende Einflussgrößen und damit die Grenzen der Aussagekraft benennen. |

Vier früher gebundene LK-only-Ziele zu Modellwahl sowie Differential- und
Integralrechnung werden von dieser Aufgabe nicht geprüft. Ein weiteres
früheres Ziel zum expliziten Prüfen eigener Ergebnisse wird ebenfalls nicht
eigens abgefragt. Die Aufgabe trägt deshalb keine derartigen Bindungen mehr.

Die Tarifangaben ergeben `K_A(x)=250+4,2x` und `K_B(x)=80+5,1x` für eine
nichtnegative ganze Zahl `x`. Aus `K_A(x)<K_B(x)` folgt `x>170/0,9`; die
kleinste zulässige Zahl ist **189** (bei 188 ist A noch teurer). Bei 120
Essen kostet A **754 €**, B **692 €**; B ist damit um **62 €** günstiger.
Teil 4 verlangt mindestens zwei tatsächlich ausgelassene Aspekte und die
Lösung nennt mehrere. Die geprüften Leitideen sind `L1` und `L4`, nicht
pauschal `L1`–`L5`. Das Punkteraster umfasst 4 + 6 + 4 + 6 = 20 Punkte.

## Projektion und Grenze der Freigabe

Der Test durchsucht alle aktuellen Mathematik-Kompositionsansichten mit der
nativen Projektion. Wo die Prüfung als `target` erscheint, müssen ihre vier
Voraussetzungen mindestens als `target` oder `prerequisiteOnly` verfügbar
sein. Zusätzlich verbietet er eine versteckte LK-only-Abhängigkeit in der
transitiven `requires`-Kette des GK-Prüfungswegs. Eine kanonische Freigabe
ersetzt keine Prüfung der veröffentlichten GoalBook-Seiten und ihrer
abhängigen Bindungen.

Der aktuelle Lauf am 23.09.2026 ist bestanden: **51** Ansichten haben die
Prüfung als `target`, darunter **26 GK-Ansichten**; in allen sind die vier
Voraussetzungen verfügbar. Die zuvor beobachtete Projektion der Q4-Prüfung
in reine Sek-I-Ansichten ohne ihre Voraussetzungen wurde gezielt korrigiert.
In den Rheinland-Pfalz-Ansichten liegt sie jetzt in der Oberstufe und bleibt
auch in den generierten G8-/G9-Ansichten als Ziel erhalten.
Die View-Zahlen sind ein beobachteter Stand, kein fest codiertes Soll: Der
Test prüft bei jedem Lauf alle aktuell targetenden Ansichten und schlägt bei
neuen Abweichungen fehl.

Dieser maschinelle QS-Nachweis ist keine menschliche Curriculumfreigabe und
kein Ersatz für die zentralen M7- und Layer-A-Prüfungen.
