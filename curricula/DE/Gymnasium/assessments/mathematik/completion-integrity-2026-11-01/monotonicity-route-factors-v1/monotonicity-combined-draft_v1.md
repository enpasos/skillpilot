# Funktionsverlauf begründen und Monotonieaussagen prüfen

Status: Autorenkandidat, unabhängig noch nicht fachlich geprüft; keine kanonische Integration.

## Aufgabe

Eine Führungsschiene wird für $0 \le x \le 5$ modellhaft durch $f(x)=0.1x^3-0.6x^2+0.9x+2$ beschrieben.

1. Bestimme die erste Ableitung. Untersuche mit ihrem Vorzeichen die Monotonie auf dem gesamten Modellbereich und begründe deine Intervalle. (2 BE)
2. Bestimme die lokalen Extremstellen im Inneren des Modellbereichs und ihre Funktionswerte. Begründe die Einordnung durch Vorzeichenwechsel der ersten Ableitung. (2 BE)
3. Vergleiche alle für globale Extremwerte nötigen Funktionswerte einschließlich der Randwerte. Gib alle globalen Maximum- und Minimumstellen auf $[0;5]$ mit ihren Funktionswerten an und erläutere den Unterschied zwischen einer lokalen und einer globalen Extremwertaussage. (2 BE)

4. Erläutere den Monotoniesatz für eine auf einem Intervall differenzierbare Funktion mit überall strikt positiver beziehungsweise überall strikt negativer erster Ableitung. (1 BE)
5. Ein Mitschüler behauptet, eine streng monotone differenzierbare Funktion müsse an jeder Stelle ihres Intervalls eine strikt positive beziehungsweise strikt negative Ableitung haben. Prüfe diese Behauptung mit $g(x)=x^3$ und $h(x)=-x^3$ auf $\mathbb{R}$. Begründe ihre jeweilige strenge Monotonie, bestimme die Ableitungen und untersuche die Stelle $x=0$. Erkläre den Unterschied zwischen dem Monotoniesatz und seiner behaupteten Umkehrung. (2 BE)

## Lösung

$f'(x)=0.3x^2-1.2x+0.9=0.3(x-1)(x-3)$. Die Ableitung ist vor $x=1$ und nach $x=3$ positiv, dazwischen negativ. Somit steigt $f$ auf $[0;1]$, fällt auf $[1;3]$ und steigt auf $[3;5]$.

Bei $x=1$ wechselt $f'$ von positiv zu negativ: lokales Maximum $f(1)=2{,}4$. Bei $x=3$ wechselt es von negativ zu positiv: lokales Minimum $f(3)=2$.

Für die globale Aussage werden auch die Ränder geprüft: $f(0)=2$, $f(5)=4$. Das globale Maximum ist $4$ bei $x=5$. Das globale Minimum $2$ wird bei $x=0$ und $x=3$ erreicht. Lokal wird eine Umgebung, global der gesamte angegebene Bereich verglichen. Die Randwerte werden für die globale Aussage berücksichtigt; sie werden nicht als innere stationäre Stellen ausgegeben.

Ist die Ableitung an jeder Stelle des Intervalls strikt positiv, ist die Funktion dort streng steigend; ist sie an jeder Stelle strikt negativ, ist sie dort streng fallend. Die Differenzierbarkeit und die Aussage über das ganze Intervall sind Voraussetzungen dieser hinreichenden Folgerungen.

$g(x)=x^3$ ist auf $\mathbb{R}$ streng steigend, $h(x)=-x^3$ streng fallend. Zum Beispiel gilt für $a<b$: $b^3-a^3=(b-a)(a^2+ab+b^2)>0$; der zweite Faktor erfüllt $a^2+ab+b^2=(a+b/2)^2+3b^2/4>0$, weil bei $a<b$ nicht beide Zahlen null sein können. Für $h$ kehrt sich das Vorzeichen der Differenz um. Die Ableitungen sind $g'(x)=3x^2$ und $h'(x)=-3x^2$. Beide sind bei $x=0$ gleich $0$, also dort weder strikt positiv noch strikt negativ. Strenge Monotonie erzwingt deshalb nicht an jeder Stelle eine strikt von null verschiedene Ableitung. Der Monotoniesatz formuliert hinreichende Bedingungen; aus ihrer Nichterfüllung an einer Stelle folgt nicht, dass die Funktion ihre strenge Monotonie verliert.

## Bewertung

9 BE insgesamt; bestanden mit 9 BE. Die volle Punktzahl ist nötig, damit keine ausgewiesene Teilkompetenz ausgelassen werden kann.

- 2 BE: Beide Punkte nur mit korrekter erster Ableitung, allen drei Monotonieintervallen und passender Vorzeichenbegründung; ohne Ableitungsvorzeichenbegründung 0.
- 2 BE: Beide Punkte nur mit beiden inneren Extremstellen x=1 und x=3, den passenden Funktionswerten und beiden korrekt gedeuteten Vorzeichenwechseln; bloße Ableitungsnullstellen ohne Einordnung 0.
- 2 BE: Beide Punkte nur nach Randvergleich und Vergleich aller relevanten Kandidaten: globales Maximum bei x=5, globale Minima bei x=0 und x=3 samt Werten; lokale und globale Aussage fachlich unterscheiden. Ohne Randvergleich oder bei fehlendem zweiten globalen Minimum 0.
- 1 BE: 1 Punkt nur für beide korrekten hinreichenden Folgerungen: strikt positive Ableitung überall im Intervall ⇒ streng steigend; strikt negative überall ⇒ streng fallend, unter der genannten Differenzierbarkeit.
- 1 BE: 1 Punkt nur für begründete strenge Monotonie beider Kubikfunktionen sowie korrekte Ableitungen und deren Wert 0 bei x=0. Gleichwertige fachliche Begründungen sind zulässig; bloße Graphbehauptung ohne nachvollziehbaren Bezug reicht nicht.
- 1 BE: 1 Punkt nur für die logische Erklärung, warum die beiden Nullwerte der Ableitung die behauptete notwendige Vorzeichenbedingung widerlegen, aber die hinreichenden Bedingungen des Monotoniesatzes nicht verletzen.

## Herkunft und Grenzen

Ausgangspunkt ist Teilaufgabe 4 der unveränderten kanonischen Aufgabe `2f626446-4b32-5674-a687-9cd754bdfede`, gebunden an `derivative-split-2026-09-28/j10-task3-draft_v2.md`. Polynom, Modellbereich, kritische Stellen und Extremwerte werden fachlich wiederverwendet. Die Aufgabe wurde eigenständig auf diese Kompetenzsignatur begrenzt; die explizite Formulierung des Satzes und das fallende Kubikgegenbeispiel sind neue Ausarbeitungen. Ableitungen zweiter Ordnung, Tangenten, Normalen, lineare Approximation und Krümmung werden weder verlangt noch als geprüft ausgewiesen.

Die kanonische Phase J10 ist Kompatibilitätsmetadatum. Ob und wo diese Aufgabe in tatsächlichen Sek-I- oder Sek-II-Ansichten passend platziert werden kann, ist gesondert zu prüfen. Keine menschliche Freigabe, Lernendenerprobung, Host-Abnahme oder M7-Abnahme wird behauptet.
