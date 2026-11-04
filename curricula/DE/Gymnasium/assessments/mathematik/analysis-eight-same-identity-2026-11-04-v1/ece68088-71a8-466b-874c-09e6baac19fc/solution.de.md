# Musterlösung: Bestände rekonstruieren

**1. Wasserbestand**

Die Rate liefert die Änderung, zu der der Anfangsbestand addiert wird:

$$
V(t)=20+\int_0^t(6-2s)\,ds=20+6t-t^2,\qquad0\leq t\leq5.
$$

Insbesondere ist $V(0)=20$.

**2. Bestand und Änderung**

$V(2)=28\,\mathrm{m}^3$ und $V(5)=25\,\mathrm{m}^3$.
Die Änderung ist

$$
V(5)-V(2)=\int_2^5(6-2t)\,dt=-3\,\mathrm{m}^3.
$$

Zwischen diesen Zeitpunkten gehen netto $3\,\mathrm{m}^3$ verloren.
Der Änderungswert ist die Differenz zweier Bestände, nicht der Endbestand
von $25\,\mathrm{m}^3$.

**3. Verlauf**

Für $0\leq t<3$ ist $r(t)>0$, also nimmt $V$ zu. Bei $t=3$ ist
$r=0$, danach ist $r<0$ und der Bestand nimmt ab. Die größte Wassermenge
ist daher $V(3)=29\,\mathrm{m}^3$. Eine negative Rate beschreibt einen
Abfluss pro Zeiteinheit, keinen negativen Bestand. Beispielsweise sind
bei $t=5$ die Rate $-4\,\mathrm{m}^3/\mathrm h$, aber der Bestand
$25\,\mathrm{m}^3$. Der Bestand bleibt im gesamten Modellzeitraum positiv.

**4. Mathematische Rekonstruktion**

$$
F(x)=3+\int_1^x(2s-4)\,ds
=3+(x^2-4x)-(1-4)=x^2-4x+6.
$$

Die Proben liefern $F'(x)=2x-4$ und $F(1)=1-4+6=3$.
Das Integral von $0$ bis $4$ bedeutet $F(4)-F(0)=0$, also gleiche
Randwerte. Hier sind beide Werte $6$, nicht null. Dazwischen muss $F$
nicht konstant sein; zum Beispiel ist $F(2)=2$.
