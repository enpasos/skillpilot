# Musterlösung: uneigentliche Flächen

**1. Vorzeichen und Ansatz**

Da $x^3>0$ ist, ist $f$ auf $[\frac12,1)$ negativ, bei $1$ null und
für $x>1$ positiv. Deshalb ist

$$
A=-\int_{1/2}^{1}f(x)\,dx+\lim_{T\to\infty}\int_1^T f(x)\,dx.
$$

Das Minuszeichen macht den ersten Flächenbeitrag nichtnegativ.

**2. Berechnung**

Es gilt $f(x)=x^{-2}-x^{-3}$ mit

$$
F(x)=-\frac1x+\frac1{2x^2},\qquad F'(x)=x^{-2}-x^{-3}=f(x).
$$

Wegen $F(\frac12)=0$ und $F(1)=-\frac12$ ist die linke Teilfläche
$-(F(1)-F(\frac12))=\frac12$.
Für die rechte Teilfläche ergibt sich

$$
\lim_{T\to\infty}\left(-\frac1T+\frac1{2T^2}+\frac12\right)=\frac12.
$$

Damit ist $A=\frac12+\frac12=1$ Flächeneinheit. Der einzige
uneigentliche Grenzwert dieser Flächenzerlegung existiert und ist endlich;
unendliche Ausdehnung allein erzwingt keinen unendlichen Inhalt.

**3. Beide Seiten von $0$**

Links ist $g$ negativ, rechts positiv. Mit $G(x)=-\frac1{2x^2}$ gilt
für $0<\varepsilon<1$

$$
-\int_{-1}^{-\varepsilon}g(x)\,dx
=\frac1{2\varepsilon^2}-\frac12,
\qquad\int_\varepsilon^1g(x)\,dx=\frac1{2\varepsilon^2}-\frac12.
$$

Beide nichtnegativen Teilflächen gehen für $\varepsilon\to0^+$ gegen
$+\infty$. Es liegt kein endlicher Gesamtflächeninhalt vor.

**4. Keine Aufhebung von Flächen**

Die angegebene symmetrische Summe ist eine Summe orientierter Integrale,
keine Summe nichtnegativer Flächen. Die linke orientierte Teilintegralgrenze
ist $-\infty$, die rechte $+\infty$; sie dürfen nicht zu null verrechnet
werden. Die erforderlichen getrennten Grenzwerte sind nicht endlich.
Auch die beiden Flächenbeiträge selbst wachsen unbegrenzt.
