# Referenzlösung: Vektorprodukt und Flächen

**1.** Es gilt
$$
\vec a=\begin{pmatrix}2\\1\\0\end{pmatrix},\qquad
\vec b=\begin{pmatrix}0\\2\\2\end{pmatrix},\qquad
\vec n=\vec a\times\vec b=
\begin{pmatrix}1\cdot2-0\cdot2\\0\cdot0-2\cdot2\\2\cdot2-1\cdot0\end{pmatrix}
=\begin{pmatrix}2\\-4\\4\end{pmatrix}.
$$
Der Vektor ist nicht null und steht nach der Eigenschaft des
Vektorprodukts senkrecht zu beiden Spannvektoren, also zur Ebene.
Die Kontrollen sind
$\vec n\cdot\vec a=4-4+0=0$ und
$\vec n\cdot\vec b=0-8+8=0$.
Andere von null verschiedene Vielfache sind als Ebenennormalen ebenfalls
richtig; das verlangte Vektorprodukt selbst hat den angegebenen Wert.

**2.** Mit $A$ folgt
$$
2(x_1-1)-4x_2+4(x_3-1)=0,
\qquad E:x_1-2x_2+2x_3=3.
$$
Für $B$ ist $3-2+2=3$, für $C$ ist $1-4+6=3$.
Beide Punkte liegen in $E$.

**3.** Der Betrag ist
$$
\|\vec a\times\vec b\|=\sqrt{2^2+(-4)^2+4^2}=6.
$$
Das aufgespannte Parallelogramm hat Fläche $6\,\mathrm m^2$, das
Dreieck die halbe Fläche $3\,\mathrm m^2$. Geometrisch ist
$\|\vec a\times\vec b\|=\|\vec a\|\,\|\vec b\|\sin\theta$ mit dem
Winkel $\theta$ zwischen den Spannvektoren: Grundseite mal Höhe.
Das Vektorprodukt ist ein gerichteter Vektor, sein Betrag dagegen eine
nichtnegative Zahl. Bei vertauschter Reihenfolge gilt
$\vec b\times\vec a=-\vec n$; der Betrag und die Flächeninhalte bleiben
unverändert. Die Behauptung ist falsch.

**4.** Wegen der Linearität in einem Faktor gilt
$$
\vec a\times(t\vec b)=t\begin{pmatrix}2\\-4\\4\end{pmatrix},
\qquad F_\triangle(t)=\frac12\|t\vec n\|=3|t|\,\mathrm m^2.
$$
Dies kann auch komponentenweise berechnet werden. Für $t<0$ liegt $C_t$
auf der anderen Seite von $A$ entlang der Geraden $AC$; die
Normalenrichtung des geordneten Vektorprodukts kehrt sich um, die Fläche
bleibt positiv und wird mit $|t|$ skaliert. Für $t=0$ ist $C_t=A$,
das Vektorprodukt ist $\vec0$ und die Dreiecksfläche $0$.
Der Nullvektor hat keine Normalenrichtung und ist kein Ebenennormalenvektor.
Die verbliebenen zwei verschiedenen Punkte $A,B$ bestimmen nur eine
Gerade; durch sie verlaufen unendlich viele Ebenen. Es ist also keine
eindeutige Plattenebene bestimmt. Für $t\ne0$ bleiben die Spannvektoren
unabhängig und die Plattenebene ist weiterhin $E$.
