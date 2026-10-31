# Skalarprodukt über eine orthogonale Projektion erklären

Notation correction dated 31 October 2026 for the existing task `dot-projection`
in `../m7-route-repair-20260929-v1/tasks.md`. The original source remains as
historical evidence. Vector arrows and column vectors make the school notation
explicit; the redundant nonzero condition is removed for the specified vector.
The task demands, numerical values and 4 + 6 point rubric are unchanged.

## dot-projection

### Aufgabe

Gegeben sind die Vektoren
$$
\vec a=\begin{pmatrix}3\\4\\0\end{pmatrix}
\quad\text{und}\quad
\vec b=\begin{pmatrix}4\\0\\0\end{pmatrix}.
$$

1. Bestimme die orthogonale Projektion von $\vec a$ auf die Richtung von $\vec b$ und den dazu senkrechten Restvektor. Prüfe die Orthogonalität. (4 BE)
2. Berechne $\vec a\cdot\vec b$ und veranschauliche die Definition $\vec a\cdot\vec b=|\vec b|\,s$ mit der vorzeichenbehafteten Projektionslänge $s$ von $\vec a$ auf $\vec b$. Erkläre auch $s=|\vec a|\cos\theta$. Dabei bezeichnet $\theta$ den Winkel zwischen $\vec a$ und $\vec b$. (6 BE)

### Lösung

Der Projektionsvektor ist
$$
\vec p=\frac{\vec a\cdot\vec b}{\vec b\cdot\vec b}\,\vec b
=\frac{12}{16}\,\vec b
=\begin{pmatrix}3\\0\\0\end{pmatrix}.
$$
Für den Restvektor gilt
$$
\vec r=\vec a-\vec p=\begin{pmatrix}0\\4\\0\end{pmatrix},
\qquad\vec r\cdot\vec b=0.
$$
Der Restvektor steht somit senkrecht auf $\vec b$ und auf dem Projektionsvektor.
Die gerichtete Projektionslänge ist $s=3$ und $|\vec b|=4$, also
$\vec a\cdot\vec b=|\vec b|\,s=4\cdot3=12$.
Weil $|\vec a|=5$, folgt $\cos\theta=3/5$ und $s=|\vec a|\cos\theta$.
Die Projektion liefert damit die geometrische Bedeutung der algebraischen
Definition des Skalarprodukts.
