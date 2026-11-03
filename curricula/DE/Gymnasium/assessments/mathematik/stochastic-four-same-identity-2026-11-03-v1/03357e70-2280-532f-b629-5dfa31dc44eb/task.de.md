# Zwei Testregeln für dieselbe Qualitätskontrolle

Ein Betrieb prüft Steckverbinder. Die unbekannte Fehlerquote einer stabilen Produktionsphase heißt $p$. Eine Stichprobe wird im Modell als $100$ unabhängige Prüfungen mit derselben Fehlerwahrscheinlichkeit $p$ betrachtet. $X$ zählt die fehlerhaften Steckverbinder, also $X\sim B(100;p)$.

Untersucht wird $H_0:p\leq0{,}05$ gegen $H_1:p>0{,}05$. Das Verwerfen von $H_0$ löst eine zusätzliche Untersuchung der Produktionsphase aus. Zwei vorgegebene Regeln werden verglichen:

| Regel | $H_0$ verwerfen | $H_0$ nicht verwerfen |
|---|---|---|
| A | $X\geq10$ | $X\leq9$ |
| B | $X\geq8$ | $X\leq7$ |

Fehler 1. Art werden am Nullrand $p_0=0{,}05$ berechnet. Fehler 2. Art und Teststärke beziehen sich in dieser Aufgabe auf die feste Alternative $p_1=0{,}12$.

1. Bestimme für **beide** Regeln die Wahrscheinlichkeit eines Fehlers 1. Art, die Wahrscheinlichkeit eines Fehlers 2. Art bei $p_1$ und die Teststärke bei $p_1$. Gib jeweils das berechnete Ereignis mit dem zugehörigen Parameter an. Erläutere beide Fehlerarten im Sachkontext und vergleiche die beiden Regeln hinsichtlich Fehlalarmen, übersehenen Abweichungen und Teststärke.
2. In einer Stichprobe werden $9$ fehlerhafte Steckverbinder gefunden. Welche Entscheidung ergibt jede Regel? Erläutere auch, welche sichere Aussage über die wahre Fehlerquote daraus **nicht** folgt.
3. Der Betrieb hat zwei unterschiedliche Einsatzziele. Wähle jeweils A oder B, oder begründe, warum keine der beiden Regeln geeignet ist. Prüfe für deine Empfehlung die genannten Anforderungen und begründe anhand der berechneten Werte, warum die andere Regel geeignet oder ungeeignet ist.

   - **Routinekontrolle:** Fehlalarmwahrscheinlichkeit am Nullrand höchstens $5\,\%$ und Teststärke bei $p_1$ mindestens $75\,\%$.
   - **Zeitweise gezielte Fehlersuche:** Fehlalarmwahrscheinlichkeit am Nullrand höchstens $15\,\%$ und Teststärke bei $p_1$ mindestens $90\,\%$.

Ein Taschenrechner, eine Binomialtabelle oder entsprechende Berechnungssoftware darf verwendet werden. Rechne im angegebenen Binomialmodell und gib Wahrscheinlichkeiten mindestens auf vier Nachkommastellen oder Prozentwerte mindestens auf zwei Nachkommastellen an. Ein mathematisch gleichwertiger Lösungsweg ist zulässig; eine eigene neue Testregel wird nicht verlangt.

