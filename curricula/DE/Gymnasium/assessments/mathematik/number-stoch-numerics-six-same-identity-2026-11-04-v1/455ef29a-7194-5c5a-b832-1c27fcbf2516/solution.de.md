# Musterlösung: Exponentielle Wartezeiten

**1. Stetige Wartezeit**

Es gilt $T\geq0$; das Modell erlaubt jede nichtnegative reelle Wartezeit und
hat keine endliche obere Grenze. $P(T>3)$ ist die Wahrscheinlichkeit,
dass nach drei Minuten noch keine Ausgabe erfolgt ist.
Ein einzelner Wert hat Wahrscheinlichkeit $P(T=3)=0$. Dagegen ist
$$P(2<T\leq3)=e^{-0{,}5}-e^{-0{,}75}\approx0{,}1342>0.$$
Ein stetiges Modell verteilt Wahrscheinlichkeit auf Intervalle, nicht auf
einzelne Zeitpunkte. Messwerte mit endlicher Genauigkeit stehen praktisch
für kleine Intervalle; Wahrscheinlichkeit null heißt hier nicht, dass eine
beobachtete Wartezeit nie als „3 Minuten“ angegeben werden darf.

**2. Wahrscheinlichkeiten und Quantil**

$$P(T\leq2)=1-e^{-0{,}5}\approx0{,}3935,$$
$$P(2<T\leq6)=e^{-0{,}5}-e^{-1{,}5}\approx0{,}3834.$$
Aus $1-e^{-0{,}25t_{90}}=0{,}90$ folgt
$$t_{90}=\frac{\ln(10)}{0{,}25}\approx9{,}21\text{ Minuten}.$$
Das ist eine 90-Prozent-Grenze, keine sichere maximale Wartezeit.

**3. Bereits verstrichene Zeit**

$$P(T>8\mid T>5)=\frac{P(T>8)}{P(T>5)}
=\frac{e^{-2}}{e^{-1{,}25}}=e^{-0{,}75}\approx0{,}4724.$$
Dies ist gleich $P(T>3)$. Im Modell beeinflusst die bisherige Wartezeit die
Verteilung der weiteren Wartezeit nicht (Gedächtnislosigkeit). Das ist eine
Aussage über das Modell, keine Garantie für jede reale Ausgabestelle.
Die Vier-Minuten-Behauptung ist falsch: $P(T>4)=e^{-1}\approx0{,}3679$.
Das Modell lässt also mit positiver Wahrscheinlichkeit längere Wartezeiten zu.

**4. Modellannahme und Grenze**

Plausibel ist beispielsweise ein zeitlich gleichbleibender zufälliger
Ausgabemechanismus, bei dem das Ausbleiben bisheriger Ausgaben die Chance
im nächsten kurzen Zeitabschnitt nicht verändert. Die erzwungene Ausgabe
spätestens nach vier Minuten widerspricht $P(T>4)>0$ und der unbegrenzt
möglichen Wartezeit. Dasselbe Modell beschreibt diese neue Situation daher
nicht genau. Es müsste angepasst werden; auch zuvor war die konstante
Ausgabechance nur eine zu prüfende Annahme. Gleichwertige konkrete Annahmen
und fachlich passende Modellgrenzen sind anzuerkennen.
