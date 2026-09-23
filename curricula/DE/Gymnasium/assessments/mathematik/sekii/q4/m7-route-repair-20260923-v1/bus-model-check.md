# Busmodell dokumentieren, prüfen und verbessern · GK/LK · Kandidat

Geprüfte Ziele: `ae2ca565-928d-55f4-b804-7155cf210120`, `4a630596-6e2f-593e-bac6-2a6d8fa58e2f`, `fb4dcd2a-a6a9-5371-a2fc-95348ee130e0`. Vorgeschlagene Bewertung: 16 BE, Bestehensgrenze 8 BE. Bearbeitungszeit etwa 20 Minuten. Keine Veröffentlichung ohne unabhängige Prüfung.

## Aufgabe (DE)

Eine Schule plant einen Ausflug. Für einen Bus mit höchstens 50 Plätzen fallen eine feste Gebühr von 180 € und zusätzlich 8 € je mitfahrender Person an. Für 1 bis 50 Personen verwendet die Schule das Modell $K(n)=180+8n$ in Euro.

1. Für eine Fahrt mit einem Bus soll ein Budget von 420 € genau ausgeschöpft werden. Löse $K(n)=420$ nach $n$ auf. Dokumentiere jede Äquivalenzumformung mit der jeweils auf beiden Seiten ausgeführten Operation und prüfe das Ergebnis durch Einsetzen sowie an der Kapazitätsgrenze. (4 BE)
2. Im Planungsblatt steht: „Bei 40 Personen betragen die Gesamtkosten 520 € und die Kosten pro Person 13 €.“ Prüfe beide Angaben unabhängig am Modell und korrigiere sie gegebenenfalls. Erkläre, wie deine Kontrolle die Korrektur belegt. (5 BE)
3. Für 75 Personen mietet die Schule zwei Busse mit derselben Preisregel: Pro Bus fallen 180 € Grundgebühr an; die 8 € variablen Kosten fallen insgesamt einmal pro tatsächlich mitfahrender Person an. Erkläre, warum das ursprüngliche Modell hier nicht gilt. Schlage einen Modellzweig für 51 bis 100 Personen vor und vergleiche sein Ergebnis für $n=75$ mit einer bloß formalen Fortsetzung der alten Formel außerhalb ihres Gültigkeitsbereichs. (7 BE)

## Musterlösung und Bewertung (DE)

1. $180+8n=420\ \mid-180$ (auf beiden Seiten 180 subtrahieren), also $8n=240\ \mid:8$ (beide Seiten durch 8 teilen), somit $n=30$. Probe: $K(30)=180+8\cdot30=420$ € und $1\le30\le50$. 1 BE für die korrekt angesetzte Gleichung, 1 BE für den ersten dokumentierten Äquivalenzschritt, 1 BE für den zweiten dokumentierten Äquivalenzschritt samt Ergebnis, 1 BE für die Probe einschließlich Gültigkeitsbereich. Ein bloßes Ergebnis ohne benannte Operationen erfüllt die Dokumentationsanforderung nicht.
2. Das Planungsblatt liegt bei den Gesamtkosten um 20 € zu hoch: $K(40)=500$ €. Die Kosten pro Person betragen $500/40=12{,}50$ €, nicht 13 €. Als unabhängige Probe kann man $180/40+8=4{,}50+8=12{,}50$ € berechnen und anschließend $40\cdot12{,}50=500$ € kontrollieren. 1 BE für den überprüften Gesamtbetrag, 1 BE für dessen Korrektur, 1 BE für den überprüften Pro-Kopf-Betrag, 1 BE für eine tragfähige unabhängige Probe und 1 BE für die erklärte Korrektur. Äquivalente Proben zählen gleich.
3. Ein einzelner Bus hat für 75 Personen nicht genügend Plätze. Bei zwei Bussen fällt die Grundgebühr zweimal an, die Gebühr je mitfahrender Person aber nur einmal. Neben $K_1(n)=180+8n$ für $1\le n\le50$ lautet der zweite Zweig $K_2(n)=2\cdot180+8n=360+8n$ für $51\le n\le100$. Damit ist $K_2(75)=960$ €. Der Wert $180+8\cdot75=780$ € ist nur eine **unzulässige formale Fortsetzung** von $K_1$ über dessen Definitionsbereich hinaus, keine gültige Vorhersage des alten Modells. Der Unterschied der beiden Rechenausdrücke beträgt 180 €; die Modellkorrektur berücksichtigt die zweite Grundgebühr, ohne weitere Kosten oder eine bestimmte Sitzverteilung zu behaupten. 2 BE für die Kapazitätsgrenze, 2 BE für die zweite Grundgebühr und den verbesserten Zweig, 2 BE für den rechnerisch und fachlich korrekt eingeordneten Vergleich bei 75 Personen, 1 BE für die qualitative Wirkung. Eine gleichwertige stückweise Beschreibung ohne geschlossene Formel ist fachlich zulässig.

Die eigenständige Kontrolle in Teil 2 wird unabhängig vom Rechenweg in Teil 1 bewertet. Gesamt: 16 BE.

## Task (EN)

A school is planning a trip. A bus with at most 50 seats costs a fixed €180 plus €8 per passenger. For 1 to 50 passengers the school uses the model $K(n)=180+8n$ euros.

1. A €420 budget is to be used up exactly for a trip using one bus. Solve $K(n)=420$ for $n$. Document every equivalence transformation by naming the operation applied to both sides, then check the result by substitution and against the capacity limit. (4 points)
2. A planning sheet says: “For 40 passengers, the total cost is €520 and the cost per person is €13.” Independently check both statements against the model and correct them if necessary. Explain how your check supports the correction. (5 points)
3. For 75 passengers the school hires two buses under the same pricing rule: each bus incurs a fixed €180 fee; the variable €8 is charged once overall for each actual passenger. Explain why the original model does not apply. Propose a model branch for 51 to 100 passengers and compare its result at $n=75$ with a merely formal extension of the old formula beyond its valid domain. (7 points)

## Solution and scoring (EN)

1. $180+8n=420\ \mid-180$ (subtract 180 from both sides), hence $8n=240\ \mid:8$ (divide both sides by 8), giving $n=30$. Check: $K(30)=180+8\cdot30=420$ euros and $1\le30\le50$. Award 1 point for the correct equation, 1 for the first documented equivalence step, 1 for the second documented step and result, and 1 for substitution and domain check. An answer without the named operations does not meet the documentation requirement.
2. The sheet overstates the total by €20: $K(40)=500$ euros. The per-person cost is $500/40=12.50$ euros, not €13. An independent check is $180/40+8=4.50+8=12.50$ euros per person, followed by $40\cdot12.50=500$ euros. Award 1 point each for checking the total, correcting the total, checking and correcting the per-person cost, a valid independent check, and explaining the correction. Equivalent checks receive equal credit.
3. One bus has too few seats for 75 passengers. Hiring two buses incurs the fixed fee twice but the per-passenger charge only once for each actual passenger. Alongside $K_1(n)=180+8n$ for $1\le n\le50$, the second branch is $K_2(n)=2\cdot180+8n=360+8n$ for $51\le n\le100$. It gives $K_2(75)=960$ euros. The value $180+8\cdot75=780$ euros is only an **inadmissible formal extension** of $K_1$ beyond its domain, not a valid prediction by the old model. The expressions differ by €180; the corrected model includes the second fixed fee but asserts neither additional unmentioned costs nor a particular distribution between the buses. Award 2 points for the capacity limit, 2 for the second fixed fee and improved branch, 2 for the numerical and conceptually correct comparison at 75 passengers, and 1 for the qualitative effect. An equivalent piecewise description without a closed formula is acceptable.

Score the independent check in part 2 separately from the working in part 1. Total: 16 points.
