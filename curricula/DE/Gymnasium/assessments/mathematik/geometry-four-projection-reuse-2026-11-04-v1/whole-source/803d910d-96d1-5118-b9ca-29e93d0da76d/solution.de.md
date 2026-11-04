# Referenzlösung: Parallelprojektion

**1.** Die Gerade durch $X$ ist
$\vec{y}=\vec{x}+t\vec{d}$ mit $t\in\mathbb R$. Einsetzen in $E$ ergibt
$$
x_1+t+2(x_2+t)-(x_3+t)=0,
\qquad t=-\frac{x_1+2x_2-x_3}{2}.
$$
Der Koeffizient von $t$ ist $2$, also entsteht für jedes $\vec{x}$ genau
eine Lösung. Mit $\vec n=\begin{pmatrix}1\\2\\-1\end{pmatrix}$ gilt
$\vec n\cdot\vec d=2$: Die Projektionsrichtung liegt nicht in $E$.
Damit
$$
P\vec{x}=\vec{x}-\frac{x_1+2x_2-x_3}{2}
\begin{pmatrix}1\\1\\1\end{pmatrix},
\qquad
P=\begin{pmatrix}
\frac12&-1&\frac12\\
-\frac12&0&\frac12\\
-\frac12&-1&\frac32
\end{pmatrix}.
$$
Die Spalten sind die Bilder der geordneten Standardbasis. Eine passende
Herleitung über diese drei Basisbilder ist gleichwertig.

**2.** Für $\vec{x}=\begin{pmatrix}4\\1\\2\end{pmatrix}$ ist $t=-2$, also
$$
P\vec{x}=\begin{pmatrix}2\\-1\\0\end{pmatrix}.
$$
Es gilt $2+2(-1)-0=0$ und
$\overrightarrow{XX'}=\begin{pmatrix}-2\\-2\\-2\end{pmatrix}=-2\vec d$.
Beide Bedingungen sind erfüllt.

**3.** Für $\vec{x}\in E$ ist $x_1+2x_2-x_3=0$, also $P\vec{x}=\vec{x}$.
Jedes Bild liegt in $E$, wie Einsetzen des allgemeinen Bildvektors zeigt:
$\vec n\cdot(P\vec x)=\vec n\cdot\vec x-(\vec n\cdot\vec x)(\vec n\cdot\vec d)/2=0$.
Ein zweites Projizieren verändert es daher nicht: $P(P\vec{x})=P\vec{x}$
für jedes $\vec{x}$, also $P^2=P$. Direkte Matrixmultiplikation zählt ebenso.

Aus $P\vec{x}=\vec0$ folgt
$\vec{x}=\frac{x_1+2x_2-x_3}{2}\vec d$, also muss $\vec x$ ein
Vielfaches von $\vec d$ sein. Umgekehrt ist $P\vec d=\vec0$; somit
$$
\ker P=\left\{\lambda\begin{pmatrix}1\\1\\1\end{pmatrix}:\lambda\in\mathbb R\right\}.
$$
Das ist die Gerade durch den Ursprung in Projektionsrichtung.
Wegen der Ebenenzugehörigkeit aller Bilder und $P\vec x=\vec x$ für
jeden Ebenenvektor ist $\operatorname{im}P=E$: Jeder Punkt der Zielebene
tritt tatsächlich als Bild auf. Es handelt sich hier um eine schräge,
nicht um eine orthogonale Projektion, denn $\vec d$ ist nicht parallel
zu $\vec n$; diese zusätzliche Feststellung ist nicht für Punkte nötig.

**4.** Die Gerade ist $\vec y=\vec x+t\vec v$. Die Ebenenbedingung liefert
$\vec n\cdot\vec x+t(\vec n\cdot\vec v)=0$ und damit
$$
t=-\frac{\vec n\cdot\vec x}{\vec n\cdot\vec v},\qquad
\vec y=\left(I-\frac{\vec v\vec n^{\mathsf T}}{\vec n\cdot\vec v}\right)\vec x.
$$
Die Matrix ist also $P_F=I-\frac{\vec v\vec n^{\mathsf T}}{\vec n\cdot\vec v}$.
Bei $\vec n\cdot\vec v=0$ bleibt $\vec n\cdot\vec y=\vec n\cdot\vec x$
auf der ganzen Geraden konstant. Liegt $X$ außerhalb von $F$, gibt es
keinen Schnitt. Liegt $X$ in $F$, liegt die ganze Gerade in $F$ und es
gibt unendlich viele Schnittpunkte. Daher liefert der Schnitt keine
eindeutige Abbildung auf dem ganzen Raum. Das Versagen der Division
allein wäre noch keine geometrische Erklärung.
