**1 · Punktbedingungen**

Ein Punkt $(x,y)$ liegt auf dem Graphen, wenn $f(x)=y$ gilt. Einsetzen der drei gegebenen Koordinatenpaare liefert das LGS in den zunächst unbekannten Koeffizienten:
$$\begin{aligned}
\text{I:}\quad &c=1,\\
\text{II:}\quad &4a+2b+c=3,\\
\text{III:}\quad &16a+4b+c=1.
\end{aligned}$$
Die erste Punktbedingung bestimmt hier sofort $c$. Das ist eine zulässige erste Reduktion des selbst aufgestellten Dreivariablensystems. Die Form $0a+0b+c=1$ ist gleichwertig.

**2 · Eine mögliche systematische Lösung**

Setze $c=1$ in II und III ein. Es bleiben
$$4a+2b=2,\qquad 16a+4b=0.$$
Teilen durch $2$ beziehungsweise $4$ ergibt
$$2a+b=1,\qquad 4a+b=0.$$
Subtrahiere die erste dieser beiden Gleichungen von der zweiten. Damit verschwindet $b$:
$$2a=-1,\qquad a=-\frac12.$$
Rückeinsetzen in $2a+b=1$ liefert $-1+b=1$, also $b=2$. Mit $c=1$ folgt
$$f(x)=-\frac12x^2+2x+1.$$
Gleichwertige Systemlösungen sind ausdrücklich zulässig, etwa aus $4a+2b=2$ zunächst $b=1-2a$ zu bestimmen und in die andere Gleichung einzusetzen. Auch die direkte Kombination der beiden reduzierten Gleichungen zu $8a=-4$ ist gleichwertig. Die abschließende Form $f(x)=-\frac12(x-2)^2+3$ ist ebenfalls richtig, wenn die verlangte LGS-Herleitung zuvor erkennbar geleistet wurde. Ein Symmetriegedanke kann die Systemlösung kontrollieren, ersetzt aber deren ausdrücklich verlangte Durchführung nicht.

**3 · Kontrolle an den ursprünglichen Punkten**

$$\begin{aligned}
f(0)&=1,\\
f(2)&=-\frac12\cdot4+2\cdot2+1=-2+4+1=3,\\
f(4)&=-\frac12\cdot16+2\cdot4+1=-8+8+1=1.
\end{aligned}$$
Damit erfüllt der Term alle drei gegebenen Punktbedingungen. Gleichwertig ist die numerische Kontrolle aller drei ursprünglichen LGS-Gleichungen nach Einsetzen der gefundenen Koeffizienten.

**4 · Wiederholbares Verfahren**

Für jeden Punkt setze ich seine $x$-Koordinate in $ax^2+bx+c$ ein und setze den Ausdruck gleich seiner $y$-Koordinate. So erhalte ich drei gleichzeitig zu erfüllende lineare Gleichungen für die Koeffizienten. Durch Einsetzen bereits bestimmter Größen oder durch passende Gleichungskombinationen entferne ich schrittweise Unbekannte. Sobald eine Unbekannte bestimmt ist, setze ich ihren Wert in frühere Gleichungen zurück und gewinne die übrigen Koeffizienten. Schließlich baue ich den Funktionsterm und prüfe durch Einsetzen, ob er die ursprünglichen Punktbedingungen erfüllt. Hier ist $c$ sofort bestimmt; danach werden $b$ eliminiert, $a$ berechnet und $b$ zurückgewonnen.

Diese kurze Beschreibung ist eine mögliche Erklärung. Gleichwertige mathematische Kommentare an den tatsächlichen Umformungen, etwa „$c$ in die beiden übrigen Bedingungen einsetzen“, „Gleichungen subtrahieren, damit $b$ wegfällt“, „$a$ zurückeinsetzen“ und eine entsprechend erklärte Kontrolle, genügen. Es sind weder ein bestimmter Gaußalgorithmus noch Programmcode oder ein allgemeiner Eindeutigkeitsbeweis verlangt.

**Normale Gesamtbewertung und Kappung:** Die Teilpunkte ergeben eine einzige Rohsumme von höchstens 16 BE. Die einzige Bestehensschwelle beträgt 12 BE. Vor diesem Vergleich wird die Gesamtpunktzahl auf höchstens 11 BE begrenzt, wenn über die gesamte eingereichte Arbeit eine der folgenden Kernhandlungen fehlt oder nur auf einem grundlegend ungeeigneten Modell beruht:

- Es ist kein selbst aus den Punktbedingungen aufgestelltes LGS mit den zunächst drei unbekannten Koeffizienten erkennbar.
- Dieses LGS wird nicht erkennbar systematisch zur Bestimmung der Koeffizienten verwendet; eine reine Ein-Parameter-Symmetrie- oder Scheitellösung ersetzt die verlangte LGS-Handlung nicht.
- Es fehlt jede fachlich sinnvolle konkrete Kontrolle, bei der gefundene Koeffizienten beziehungsweise der gefundene Term in wenigstens eine der ursprünglichen Punktbedingungen zurückeingesetzt und mit dem gegebenen Wert verglichen werden.
- Es fehlt jede nachvollziehbare algorithmische Erläuterung einer wiederholbaren Vorgehensweise; richtige Endwerte oder bloße Verfahrensnamen ohne erklärte Schritte genügen dafür nicht.

Die Kappung verlangt keine fehlerfreie oder wortgleiche Musterlösung. Eine knappe richtige Erklärung, eine andere Reihenfolge der Unbekannten oder ein anderes geeignetes LGS-Verfahren zählen gleichwertig. Fachliche Leistungen zählen überall in der Abgabe, auch als Kommentare an der Rechnung; fehlende Teilnummern oder eine nicht wiederholte Erklärung lösen keine Kappung aus. Eine klar erkennbare Punktgleichung kann ebenso in den Lösungsschritten stehen. Die sofortige Bestimmung von $c$ aus der ersten selbst aufgestellten Gleichung bleibt eine Drei-Unbekannten-Systemlösung.

Einen isolierten Rechen-, Vorzeichen- oder Abschreibfehler nur einmal abziehen. Richtig ausgeführte Folgeoperationen und eine zutreffende Feststellung, dass eine Probe nicht passt, erhalten den dafür vorgesehenen Kredit; falsche Gleichheiten werden nicht als richtig gewertet. Ein einzelner fehlender oder fehlerhafter Punktcheck ist ein Teilpunktverlust und keine pauschale Kappung, wenn eine echte Kontrolle vorhanden ist. Einzelne Lücken in einer erkennbar sinnvollen Verfahrensbeschreibung sind ebenfalls nach der Rubrik zu bewerten. Es gibt genau eine Gesamtpunktzahl und ein binäres Ergebnis, keine Teilpassfelder oder zusätzliche Voraussetzungsevidenz. Diese gewöhnliche Rubrik des neuen Auftrags ändert keine Graphregel und qualifiziert bestehende Mastery nicht nach. Nur verlässlich lesbare eingereichte Arbeit bewerten; keine nicht gezeigten Leistungen unterstellen.

point-P · 1 BE: P richtig in eine Koeffizientengleichung übersetzt: c=1; 0a+0b+c=1 ist gleichwertig.

point-Q · 1 BE: Q richtig übersetzt: 4a+2b+c=3.

point-R · 1 BE: R richtig übersetzt: 16a+4b+c=1. Die drei Bedingungen beziehen sich auf dieselben unbekannten Koeffizienten.

substitute-c · 1 BE: Die durch die erste Bedingung bestimmte Größe c tatsächlich in die übrigen Gleichungen eingesetzt; ein gleichwertiger erster Eliminationsschritt zählt ebenfalls.

reduced-system · 1 BE: Zwei geeignete verbleibende lineare Bedingungen nachvollziehbar erhalten, etwa 4a+2b=2 und 16a+4b=0 oder skalierte Äquivalente. Folgefehlerregel beachten.

eliminate-and-a · 2 BE: Gültiger nachvollziehbarer weiterer Einsetzungs-/Eliminationsschritt 1; a=-1/2 korrekt 1. Gleichwertige Reihenfolge und Verfahren anerkennen.

back-substitute-b · 1 BE: Die weitere Unbekannte durch Rückeinsetzen bestimmt: hier b=2. Gleichwertige umgekehrte Reihenfolge anerkennen.

function-equation · 1 BE: Vollständigen Funktionsterm aus den bestimmten Koeffizienten zusammengestellt; bei fehlerfreier Vorarbeit -x^2/2+2x+1 oder eine äquivalente Form. Konsistente Folgearbeit nicht nochmals für denselben Fehler abwerten.

check-P · 1 BE: Term oder gefundene Koeffizienten in die ursprüngliche P-Bedingung eingesetzt und mit 1 verglichen. Eine richtig erkannte Abweichung bei Folgefehler zählt als Kontrolle.

check-Q · 1 BE: Ursprüngliche Q-Bedingung durch tatsächliches Einsetzen und Vergleich mit 3 kontrolliert. Folgefehler und zutreffende Fehlererkennung fair bewerten.

check-R · 1 BE: Ursprüngliche R-Bedingung durch tatsächliches Einsetzen und Vergleich mit 1 kontrolliert. Keine Wiederholung nötig, wenn diese Kontrolle anderswo bereits erkennbar steht.

algorithm-translate · 1 BE: Erklärt, wie je ein Punkt durch Einsetzen von x und Zuordnen von y eine Gleichung für dieselben Koeffizienten liefert. Verständliche mathematische Kommentare zählen.

algorithm-reduce · 1 BE: Erklärt das schrittweise Reduzieren der Unbekannten durch geeignete Einsetzungen oder Gleichungskombinationen, etwa warum b beim Subtrahieren entfällt.

algorithm-recover · 1 BE: Erklärt das Rückeinsetzen bekannter Werte, um die verbleibenden Koeffizienten und den Term zu erhalten.

algorithm-verify · 1 BE: Erklärt die Rückkontrolle am ursprünglichen Datenauftrag durch Einsetzen und Vergleich mit den gegebenen Funktionswerten. Kommentare zur echten Probe können dies leisten.
