# Musterlösung: Exponential- und Polynomverknüpfungen

**1. Produkt**

Der Ansatz liefert $F'(x)=[a+ax+b]e^x=[ax+(a+b)]e^x$.
Der Vergleich mit $(2x+1)e^x$ ergibt $a=2$ und $a+b=1$, also $b=-1$.
Somit ist $F(x)=(2x-1)e^x$ eine Stammfunktion. Die Probe ist

$$
F'(x)=2e^x+(2x-1)e^x=(2x+1)e^x.
$$

Es folgt

$$
\int_0^1f(x)\,dx=F(1)-F(0)=e-(-1)=e+1.
$$

**2. Verkettung**

$G(x)=e^{x^2+1}$ ist geeignet, denn die Kettenregel liefert
$G'(x)=e^{x^2+1}\cdot2x=g(x)$.

$$
\int_0^1g(x)\,dx=G(1)-G(0)=e^2-e.
$$

**3. Summe**

Eine Stammfunktion ist $H(x)=\frac12e^{2x}+x^3$.
Die Probe ergibt $H'(x)=\frac12\cdot2e^{2x}+3x^2=h(x)$.

$$
\int_0^1h(x)\,dx=\left(\frac12e^2+1\right)-\frac12
=\frac{e^2+1}{2}.
$$

Zu jeder Stammfunktion darf eine beliebige additive Konstante treten;
sie verändert keine der bestimmten Integralrechnungen.
