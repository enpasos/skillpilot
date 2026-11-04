# Monotoniesatz und behauptete Umkehrung prüfen

Status: Autorenkandidat, unabhängig noch nicht fachlich geprüft; keine kanonische Integration.

## Aufgabe

1. Eine Funktion ist auf einem Intervall $I$ differenzierbar. Erläutere, was für ihre Monotonie folgt, wenn die erste Ableitung an jeder Stelle von $I$ strikt positiv ist, und was bei einer an jeder Stelle strikt negativen ersten Ableitung folgt. (1 BE)
2. Prüfe die behauptete Umkehrung: „Eine streng monotone differenzierbare Funktion muss an jeder Stelle ihres Intervalls eine strikt positive beziehungsweise strikt negative Ableitung haben.“ Nutze $g(x)=x^3$ und $h(x)=-x^3$ auf $\mathbb{R}$. Begründe ihre jeweilige strenge Monotonie, bestimme die Ableitungen und untersuche die Stelle $x=0$. Erkläre, weshalb dieses Ergebnis die behauptete Umkehrung widerlegt und dem Monotoniesatz nicht widerspricht. (2 BE)

## Lösung

Ist die Ableitung an jeder Stelle des Intervalls strikt positiv, ist die Funktion dort streng steigend; ist sie an jeder Stelle strikt negativ, ist sie dort streng fallend. Die Differenzierbarkeit und die Aussage über das ganze Intervall sind Voraussetzungen dieser hinreichenden Folgerungen.

$g(x)=x^3$ ist auf $\mathbb{R}$ streng steigend, $h(x)=-x^3$ streng fallend. Zum Beispiel gilt für $a<b$: $b^3-a^3=(b-a)(a^2+ab+b^2)>0$; der zweite Faktor erfüllt $a^2+ab+b^2=(a+b/2)^2+3b^2/4>0$, weil bei $a<b$ nicht beide Zahlen null sein können. Für $h$ kehrt sich das Vorzeichen der Differenz um. Die Ableitungen sind $g'(x)=3x^2$ und $h'(x)=-3x^2$. Beide sind bei $x=0$ gleich $0$, also dort weder strikt positiv noch strikt negativ. Strenge Monotonie erzwingt deshalb nicht an jeder Stelle eine strikt von null verschiedene Ableitung. Der Monotoniesatz formuliert hinreichende Bedingungen; aus ihrer Nichterfüllung an einer Stelle folgt nicht, dass die Funktion ihre strenge Monotonie verliert.

## Bewertung

3 BE insgesamt; bestanden mit 3 BE. Die volle Punktzahl ist nötig, damit keine ausgewiesene Teilkompetenz ausgelassen werden kann.

- 1 BE: 1 Punkt nur für beide korrekten hinreichenden Folgerungen: strikt positive Ableitung überall im Intervall ⇒ streng steigend; strikt negative überall ⇒ streng fallend, unter der genannten Differenzierbarkeit.
- 1 BE: 1 Punkt nur für begründete strenge Monotonie beider Kubikfunktionen sowie korrekte Ableitungen und deren Wert 0 bei x=0. Gleichwertige fachliche Begründungen sind zulässig; bloße Graphbehauptung ohne nachvollziehbaren Bezug reicht nicht.
- 1 BE: 1 Punkt nur für die logische Erklärung, warum die beiden Nullwerte der Ableitung die behauptete notwendige Vorzeichenbedingung widerlegen, aber die hinreichenden Bedingungen des Monotoniesatzes nicht verletzen.

## Herkunft und Grenzen

Ausgangspunkt ist das Gegenbeispiel $x^3$ zur behaupteten Umkehrung in Teilaufgabe 4 der unveränderten kanonischen Aufgabe `2f626446-4b32-5674-a687-9cd754bdfede`, gebunden an `derivative-split-2026-09-28/j10-task3-draft_v2.md`. Die explizite Formulierung des Monotoniesatzes für beide Vorzeichen und das fallende Kubikgegenbeispiel sind eigenständige neue Ausarbeitungen. Das Schienenpolynom, sein Modellbereich und seine Extremwertberechnung werden in diesem Kandidaten nicht verwendet. Ableitungen zweiter Ordnung, Tangenten, Normalen, lineare Approximation und Krümmung werden weder verlangt noch als geprüft ausgewiesen.

Die kanonische Phase J10 ist Kompatibilitätsmetadatum. Ob und wo diese Aufgabe in tatsächlichen Sek-I- oder Sek-II-Ansichten passend platziert werden kann, ist gesondert zu prüfen. Keine menschliche Freigabe, Lernendenerprobung, Host-Abnahme oder M7-Abnahme wird behauptet.
