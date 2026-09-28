# Kandidat: eigene Q2-Prüfung zur Lagebeziehung zweier Ebenen

**Fachlich geprüfte, maschinell freigegebene Aufgaben- und Routenfassung vom 28. September 2026.** Die Aufgabe steht kanonisch unter `8d314e15-69e9-5af1-a10a-be820b2f821d`; ihre Inhaltsprüfung ist weder eine menschliche Erprobung noch eine D-/P-/A-/M-/V-Freigabe. Das vorhandene Q2-Exam `2f8a3a90-717d-5ac1-b54e-facca26e9008` verwendet eine Gerade und **nur eine** Ebene; deshalb wurde dessen fälschliche Bindung an das Zweiebenenziel `0f4f9957-8afe-4aab-9dd8-c26c9aee2afd` aus `requires` und `coveredGoalIds` entfernt. Alle übrigen Ansprüche des alten Exams sind getrennt zu prüfen.

## Vorgeschlagene Zielbindung

- Eigenständiger `examData`-Assessmentknoten `8d314e15-69e9-5af1-a10a-be820b2f821d` unter `14b19ee4-364e-50bd-b6a3-499471356ef3` („Übungen Q2“).
- Titel: „Zwei Ebenen: Schnittgerade, echte Parallelität oder Identität“; DE/EN-Zieltext bei Integration fachgleich ausformulieren.
- `tags: ["LK", "Practice", "Assessment"]`, `contains: []`, `requires: ["0f4f9957-8afe-4aab-9dd8-c26c9aee2afd"]`, `examData.coveredGoalIds: ["0f4f9957-8afe-4aab-9dd8-c26c9aee2afd"]`, `examData.reviewStatus: "released"`.
- `extendedData.applicabilityFromRequires: true` und `applicabilityMappingInheritance: "boundary"`: Sichtbarkeit nur dort, wo `0f4f…` tatsächlich als LK-Target belegt ist. Der Kandidat behebt **keine** offene BY-/BW-/SH-Quellenfrage für das Atom.
- `0f4f…` ist aus **beiden** Listen (`requires`, `coveredGoalIds`) des alten `2f8a…` entfernt; dessen andere, tatsächlich geprüfte Ansprüche sind getrennt zu auditieren. Die neue Aufgabe ist kein Ersatz für die ganze alte Raumgeometrieprüfung.

## Lernendenaufgabe (20 BE)

Untersuche die drei angegebenen Paare von Ebenen im Raum. Stelle jeweils das zugehörige lineare Gleichungssystem auf, entscheide anhand seiner **gesamten Lösungsmenge**, ob sich die Ebenen in einer Geraden schneiden, echt parallel oder identisch sind, und begründe die geometrische Deutung. Eine bloße Skizze oder eine Vermutung aus den Normalenvektoren genügt nicht.

**A — Schnittfall.** Gegeben sind

$$
E_1:\;x+y+z=3,\qquad E_2:\;x-y+z=1.
$$

Bestimme die Menge aller gemeinsamen Punkte in Parameterform und kontrolliere durch Einsetzen, dass deine Gerade auf beiden Ebenen liegt. (8 BE)

**B — keine gemeinsamen Punkte.** Gegeben sind

$$
E_3:\;x+2y-z=1,\qquad E_4:\;2x+4y-2z=3.
$$

Löse bzw. untersuche das LGS und gib die genaue Lagebeziehung an. (6 BE)

**C — alle Punkte gemeinsam.** Vergleiche $E_3$ aus B mit

$$
E_5:\;2x+4y-2z=2.
$$

Untersuche das LGS, beschreibe seine gemeinsame Punktmenge mit zwei freien Parametern und erkläre, warum diese nicht bloß eine Schnittgerade ist. (6 BE)

## Vollständig gerechnete Musterlösung

**A.** Subtraktion der zweiten Gleichung von der ersten ergibt $2y=2$, also $y=1$. Eingesetzt folgt $x+z=2$. Mit $z=t\in\mathbb R$ ist $x=2-t$; alle Lösungen sind

$$
\vec X=\begin{pmatrix}2\\1\\0\end{pmatrix}
  +t\begin{pmatrix}-1\\0\\1\end{pmatrix},\quad t\in\mathbb R.
$$

Probe für jedes $t$: $(2-t)+1+t=3$ und $(2-t)-1+t=1$. Die Normalenvektoren $(1,1,1)$ und $(1,-1,1)$ sind nicht proportional; die Lösungsmenge ist eine **Schnittgerade** (eine freie Variable, nicht nur ein einzelner Punkt).

**B.** Das Doppelte der Gleichung von $E_3$ fordert $2x+4y-2z=2$; $E_4$ fordert für denselben Ausdruck $3$. Das LGS führt also auf $0=1$ und hat **keine Lösung**. Die Normalenvektoren $(1,2,-1)$ und $(2,4,-2)$ sind proportional, die Ebenen wegen verschiedener rechter Seiten aber nicht identisch: Sie sind **echt parallel** und besitzen keinen gemeinsamen Punkt.

**C.** $E_5=2E_3$ als ganze Gleichung einschließlich rechter Seite. Die zweite LGS-Zeile ist redundant ($0=0$). Mit $y=s$, $z=t$ ergibt $E_3$ den Wert $x=1-2s+t$. Daher ist die gesamte gemeinsame Punktmenge

$$
\vec X=\begin{pmatrix}1\\0\\0\end{pmatrix}
  +s\begin{pmatrix}-2\\1\\0\end{pmatrix}
  +t\begin{pmatrix}1\\0\\1\end{pmatrix},\quad s,t\in\mathbb R.
$$

Die zwei Richtungsvektoren sind unabhängig; die Menge ist eine **Ebene** mit zwei freien Parametern. $E_3$ und $E_5$ sind **identisch**: Jeder Punkt der einen liegt auf der anderen, nicht nur die Punkte einer Geraden.

## Bewertungsraster und Freigabehinweis

| Fall | Teilkriterium | BE |
| --- | --- | ---: |
| A | LGS richtig kombiniert und $y=1$, $x+z=2$ hergeleitet | 2 |
| A | Vollständige Parametergerade mit freiem $t\in\mathbb R$ | 3 |
| A | Beide Gleichungen geprüft und geometrisch als Schnittgerade gedeutet | 3 |
| B | Proportionale Koeffizienten/Normalen erkannt | 1 |
| B | Widerspruch $2\ne3$ bzw. $0=1$ im LGS belegt | 3 |
| B | Echte Parallelität und leere Schnittmenge unterschieden | 2 |
| C | Ganze Gleichung $E_5=2E_3$ und Redundanz gezeigt | 2 |
| C | Zwei-Parameter-Darstellung der vollständigen gemeinsamen Ebene | 2 |
| C | Identität, zweidimensionale Lösungsmenge und Abgrenzung zur Schnittgeraden erklärt | 2 |
| | **Summe** | **20** |

Geprüftes Raster: `maxPoints: 20`, `passingPoints: 18`. Zusätzlich gelten bei der Punktevergabe diese fachlichen Obergrenzen: A höchstens **5/8**, falls nicht sowohl eine vollständige Parametergerade als auch die Einordnung als Schnittgerade begründet sind; B höchstens **3/6**, falls nicht sowohl der LGS-Widerspruch als auch echte Parallelität erklärt sind; C höchstens **3/6**, falls nicht sowohl die vollständige Zweiparametermenge als auch die Ebenenidentität erklärt sind. Fehlt einer dieser drei Kerne, sind selbst mit voller Punktzahl in den anderen beiden Fällen höchstens `5+6+6=17`, `8+3+6=17` oder `8+6+3=17` Punkte möglich. Ein bloßes Ergebnis oder eine Normalen-Vermutung erfüllt den jeweiligen Kern nicht. Die Obergrenzen sind fachliche Anweisungen für die kriterientreue Coach-Bewertung; der Server erzwingt aktuell nur die Gesamtpunktzahl und keine Teilfallgrenzen.

Die Rechenwerte wurden unabhängig von der Formulierung durch Einsetzen mehrerer Parameterwerte kontrolliert: In A erfüllen alle getesteten Punkte beide Ebenen; in B verlangt die verdoppelte $E_3$-Gleichung rechts 2 statt 3; in C erfüllen die Zweiparameterpunkte $E_3$ und $E_5$, deren Gleichungen exakt proportional sind. Die fachliche Prüfung der Lösungen und der drei negativen Bestehensfälle ist keine Lernenden- oder Real-Host-Erprobung. Letztere bleibt als Beta-Akzeptanz offen und darf aus `released` nicht abgeleitet werden.
