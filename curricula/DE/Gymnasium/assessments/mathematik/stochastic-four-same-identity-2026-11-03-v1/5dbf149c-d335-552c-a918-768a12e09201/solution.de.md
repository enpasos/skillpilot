**1.** Die Häufigkeiten summieren sich zu $40$. Wegen der Symmetrie beziehungsweise durch die gewichtete Summe folgt $\bar x=100\,\mathrm{ml}$. Die gewichtete Quadratsumme der Abweichungen ist
$$2\bigl(1\cdot4^2+3\cdot3^2+5\cdot2^2+7\cdot1^2\bigr)=140\,\mathrm{ml}^2.$$
Somit sind $s^2=140/40=3{,}5\,\mathrm{ml}^2$ und $s=\sqrt{3{,}5}\approx1{,}8708\,\mathrm{ml}$. Die Häufigkeiten müssen berücksichtigt werden; die neun verschiedenen Messwerte sind nicht neun gleich gewichtete Beobachtungen.

**2.** Ein erster angepasster Ansatz ist
$$X\sim N(100;3{,}5)$$
mit geschätztem Mittelwert $100\,\mathrm{ml}$ und geschätzter Standardabweichung etwa $1{,}87\,\mathrm{ml}$. Die Daten sind annähernd glockenförmig, symmetrisch und eingipflig. Das spricht für einen ersten Versuch, beweist aber keine Normalverteilung. Stichprobenmittelwert und empirische Standardabweichung sind hier Parameterschätzungen, nicht die sicher bekannten Prozessparameter.

**3.** Mit $Z\sim N(0;1)$ ist
$$P(97{,}5\le X\le102{,}5)=\Phi\!\left(\frac{2{,}5}{\sqrt{3{,}5}}\right)-\Phi\!\left(\frac{-2{,}5}{\sqrt{3{,}5}}\right)\approx0{,}81855.$$
Das Modell ordnet dem Bereich also ungefähr $81{,}9\%$ der weiteren Füllungen zu. Außerdem
$$P(X>104)=1-\Phi\!\left(\frac4{\sqrt{3{,}5}}\right)\approx0{,}01625,$$
also etwa $1{,}63\%$ oberhalb $104\,\mathrm{ml}$. Die Zahlen sind Modellprognosen unter der Annahme eines weiterhin vergleichbaren Abfüllprozesses. Eine Stetigkeitskorrektur ist hier nicht nötig: Die Bereichsfrage ist für das stetige $X$ formuliert, keine Binomialapproximation und keine Frage nach gerundeten Kategorien.

**4.** Im Bereich liegen $5+7+8+7+5=32$ beobachtete Werte, also $32/40=0{,}80$. Das liegt nahe bei der Modellprognose $0{,}81855$ und ist in einer Stichprobe von 40 Werten kein offensichtlicher Widerspruch. Die Nähe eines einzigen Anteils belegt jedoch weder die gesamte Verteilungsform noch genaue Randwahrscheinlichkeiten. Geeignete konkrete Grenzen sind beispielsweise: begrenzter Stichprobenumfang und unsichere Parameterschätzung; Rundung der Messwerte; mögliche Drift oder Abhängigkeit der Füllungen; dünn belegte Randbereiche; die mathematisch unbeschränkte Normalverteilung gegenüber physisch nicht negativen Füllmengen. Eine einzige passende Grenze mit Erklärung genügt. Der extrem ferne negative Modellbereich wäre bei diesen Parametern praktisch unerheblich; das macht ihn nicht zu einem formalen Verteilungsbeweis.

**Teilpunkte:** 2 BE für den gewichteten Mittelwert; 2 BE für die passende gewichtete Varianzrechnung und 1 BE für die Standardabweichung. 2 BE für ein eindeutiges angepasstes Modell, 1 BE für die Datenform, 1 BE für den Schätzcharakter. 2 BE für Ansatz und Ergebnis der Intervallwahrscheinlichkeit plus 1 BE für die Deutung; 1 BE für Ansatz/Ergebnis des oberen Bereichs plus 1 BE für dessen Deutung. 2 BE für $32/40$, 2 BE für einen sachgerechten Vergleich ohne Verteilungsbeweis, 2 BE für eine konkret erläuterte Grenze. Ein konsequent verwendeter Divisor $m-1$ ist eine vom Auftrag abweichende Konvention: höchstens 1 BE bei der Varianzkonvention abziehen, passende Folgearbeit und ein sinnvoll damit angepasstes Modell weiter werten. In diesem Fall ändern sich die erwarteten numerischen Wahrscheinlichkeiten entsprechend.



**Gewöhnliche Gesamtbewertung:** Die Teilpunkte ergeben genau einen Gesamtwert. Vergleiche diesen nach der unten genannten gewöhnlichen Kappung mit der einen Bestehensschwelle. Es gibt keine Teil-PASS-Felder oder zusätzliche Voraussetzungsevidenz.

Fachlich passende Leistungen zählen überall in der Abgabe, auch in Tabellen, Skizzen, Rechenschritten oder knappen Kommentaren. Es ist keine wortgleiche Musterlösung und keine doppelte Begründung in mehreren Teilaufgaben nötig. Gleichwertige mathematische Verfahren sind zulässig. Lokale Rechen-, Ablese-, Vorzeichen- oder Übertragungsfehler werden gezielt und nur einmal abgezogen; richtig ausgeführte Folgearbeit erhält ihre Punkte. Ein einzelner falscher Wert bedeutet nicht, dass eine ganze Kernhandlung fehlt. Nicht gezeigte Arbeit darf nicht unterstellt werden. Die Rubrik bewertet nur diesen neuen Aufgabenauftrag; sie ändert weder die Graphregeln noch bereits bestehende Mastery.

Der Rohwert liegt zwischen 0 und 20; die eine Bestehensschwelle ist 15. Kappe den Gesamtwert auf höchstens 14, wenn über die gesamte Abgabe jede tatsächliche datengestützte Parameteranpassung fehlt oder keine Bereichswahrscheinlichkeit mit einem Normalmodell erkennbar bearbeitet wurde oder keine sachbezogene begründete Aussage zur begrenzten Aussagekraft des Vergleichs oder zu einer konkreten Modellgrenze erkennbar ist. Ein bloß falsch ausgerechnetes s trotz richtigen Datenansatzes löst keinen Cap aus. Eine knappe richtige Kritik oder eine bereits im Vergleich erläuterte konkrete Grenze zählt; keine feste Unsicherheitsformel und kein formaler Test sind erforderlich.

