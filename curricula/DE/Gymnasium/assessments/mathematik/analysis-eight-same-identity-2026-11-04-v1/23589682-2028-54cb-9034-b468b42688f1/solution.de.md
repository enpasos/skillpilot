# Musterlösung: transformierte Funktionen

**1. Stammfunktionen und Proben**

$$
F(x)=-\frac12e^{-2x+1},\qquad
F'(x)=-\frac12(-2)e^{-2x+1}=f(x).
$$

$$
G(x)=-\frac13\cos\bigl(3(x-\pi/6)\bigr),\qquad
G'(x)=-\frac13(-\sin(3(x-\pi/6)))\cdot3=g(x).
$$

$$
H(x)=-\frac12\sin\bigl(-2(x-\pi/4)\bigr),\qquad
H'(x)=-\frac12\cos(-2(x-\pi/4))\cdot(-2)=h(x).
$$

Beliebige additive Konstanten sind erlaubt. Gleichwertige Terme mit
trigonometrischen Symmetrien sind ebenfalls richtig.

**2. Integral**

Die obere Grenze liefert $3(\pi/2-\pi/6)=\pi$, die untere
$3(\pi/6-\pi/6)=0$. Deshalb

$$
\int_{\pi/6}^{\pi/2}g(x)\,dx
=-\frac13\cos\pi-\left(-\frac13\cos0\right)=\frac23.
$$

**3. Erklärung**

Beim Ableiten einer verketteten Funktion entsteht zusätzlich die
innere Steigung. Der Kehrwert davor kompensiert diesen Faktor, sodass
die Ableitung wieder die Ausgangsfunktion ist. Zum Beispiel gilt bei
$F$ genau $(-\frac12)\cdot(-2)=1$. Das negative Vorzeichen ist hier
wesentlich. Die Beispiele haben alle eine von null verschiedene innere Steigung.

**4. Korrektur**

$K'(x)=-2\cos(-2(x-\pi/4))=-2h(x)$ statt $h(x)$.
Der Vorfaktor muss deshalb $-\frac12$ sein; damit erhält man $H$ aus Teil 1.
