# Musterlösung: Exponentielle Kontextmodelle

**1. Terme und Annahmen**

Die Zellzahl verdoppelt sich alle zwei Stunden:
$$N(t)=100\cdot2^{t/2}.$$
Die Stoffmenge halbiert sich alle drei Stunden:
$$M(t)=80\cdot\left(\frac12\right)^{t/3}.$$
Gleichwertige Terme mit Stundenfaktor $\sqrt2$ beziehungsweise
$2^{-1/3}$ sind richtig. Die Daten zeigen jeweils gleiche Faktoren in
gleichen Zeitabständen. Die Fortsetzung setzt voraus, dass diese relativen
Änderungen unter gleichbleibenden Bedingungen weiter gelten; drei Messwerte
allein beweisen den zeitlich unbegrenzten Modellansatz nicht.

**2. Graphen und Prognosen**

Der Wachstumsgraph beginnt bei 100, steigt und wird zunehmend steiler.
Der Abklinggraph beginnt bei 80 mg, fällt und nähert sich der Zeitachse.
Die Diagramme haben verschiedene Größen und daher getrennte y-Achsen.

Zum Zeichnen passen für N die Punkte (0,100),(2,200),(4,400),(6,800),(8,1600), für M die Punkte (0,80),(3,40),(6,20),(9,10). Die Kurven verlaufen glatt durch diese Punkte; beide Zeitachsen sind in Stunden beschriftet.

$$N(6)=100\cdot2^3=800\text{ Zellen},\qquad
M(9)=80\cdot(1/2)^3=10\text{ mg}.$$

**3. Verändertes Wachstum**

Nach vier Stunden liegen 400 Zellen vor. Ein anschließendes Modell ist
$$N_v(t)=400\cdot1{,}1^{t-4}\quad(t\geq4).$$
Es beginnt korrekt bei $N_v(4)=400$. Für acht Stunden liefern die Modelle
$N(8)=1600$ und $N_v(8)=400\cdot1{,}1^4=585{,}64$, also etwa
586 Zellen. Die verringerte relative Zunahme ergibt einen deutlich kleineren
Bestand. Die gebrochene Modellzahl ist eine Näherungsprognose, keine
Behauptung über einen Bruchteil einer tatsächlich gezählten Zelle.

**4. Modellgrenzen**

Unbegrenztes reales Wachstum ist etwa wegen begrenzter Nährstoffe oder
begrenzten Platzes nicht plausibel. Das ursprüngliche Modell würde trotzdem
weiter exponentiell steigen; es muss außerhalb geeigneter Bedingungen angepasst
werden. Drei Halbierungen ergeben noch $10$ mg, nicht null. Im Modell gilt
$M(t)>0$ für jede endliche Zeit; die Menge nähert sich nur der null.
Eine reale Mess- oder Nachweisgrenze ist von tatsächlicher Menge null zu
unterscheiden. Gleichwertige konkrete Grenzen sind zulässig.
