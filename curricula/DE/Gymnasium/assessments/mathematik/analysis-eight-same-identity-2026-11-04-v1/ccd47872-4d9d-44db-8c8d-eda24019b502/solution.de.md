# Musterlösung: e näherungsweise bestimmen

**1. Term**

Es werden $n$ gleiche Wachstumsfaktoren multipliziert, also

$$
a_n=\left(1+\frac1n\right)^n.
$$

Die Basis ist der Faktor eines Schritts, der Exponent die Anzahl der Schritte.

**2. Tabelle**

| $n$ | Term | $a_n$ auf sechs Dezimalstellen |
|---:|---|---:|
| 1 | $(1+1/1)^1$ | 2,000000 |
| 10 | $(1+1/10)^{10}$ | 2,593742 |
| 100 | $(1+1/100)^{100}$ | 2,704814 |
| 1000 | $(1+1/1000)^{1000}$ | 2,716924 |
| 10000 | $(1+1/10000)^{10000}$ | 2,718146 |
| 100000 | $(1+1/100000)^{100000}$ | 2,718268 |

**3. Näherung**

Eine passende Näherung ist $e\approx2{,}718$.
Die letzten beiden Werte runden auf drei Dezimalstellen gleich und
liegen nahe beieinander. Dies stützt die Näherung im gegebenen
Grenzwertmodell. Eine endliche Tabelle beweist jedoch weder den exakten
Grenzwert noch eine bestimmte maximale Abweichung. Die Zahl $2{,}718$
wird deshalb mit einem Näherungszeichen angegeben.

**4. Natürliche Exponentialfunktion**

$e$ ist die feste Basis der natürlichen Exponentialfunktion, keine
veränderliche Anfangsmenge. Es gilt $f(0)=e^0=1$ und $f(1)=e$.
Die exakte Konstante wird durch die gerundete endliche Dezimalzahl nur
angenähert, nicht ersetzt.

**5. Anfangswert $200$**

Nach $n$ Schritten ist der Wert

$$
200\left(1+\frac1n\right)^n=200a_n.
$$

Nach einer Zeiteinheit ergibt das näherungsweise $200e\approx543{,}6$
mit der zuvor verwendeten Dreistellennäherung. Im Modell $B(t)=200e^t$
ist der Vorfaktor und damit der Anfangswert $B(0)=200$ verändert.
Die Basis $e$ und das beschriebene relative Wachstumsverfahren bleiben gleich.
