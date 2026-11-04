# Referenzlösung: vollständige Fixpunktmengen

**1.** Für einen Ortsvektor $\vec x$ gilt
$$
M\vec x=\vec x\ \Longleftrightarrow\ M\vec x-I\vec x=\vec0
\ \Longleftrightarrow\ (M-I)\vec x=\vec0.
$$
Dies ist ein homogenes lineares Gleichungssystem. $\vec x=\vec0$ ist
immer eine Lösung, da $M\vec0=\vec0$; der Ursprung ist also stets fest.

**2.** Mit $\vec x=\begin{pmatrix}x_1\\x_2\\x_3\end{pmatrix}$ lautet
$A\vec x=\vec x$:
$$
x_1+x_2=x_1,\qquad x_2=x_2,\qquad 2x_3=x_3.
$$
Also $x_2=0$, $x_3=0$, $x_1$ ist frei. Damit
$$
\operatorname{Fix}(A)=\left\{t\begin{pmatrix}1\\0\\0\end{pmatrix}:t\in\mathbb R\right\}.
$$
Dies ist die ganze $x_1$-Achse. Für jeden reellen Parameter gilt
$A\begin{pmatrix}t\\0\\0\end{pmatrix}=\begin{pmatrix}t\\0\\0\end{pmatrix}$.
Das gelöste System zeigt zugleich, dass es keine weiteren Fixpunkte gibt.

**3.** Das System für $B$ ist
$$
-x_3=x_1,\qquad x_2=x_2,\qquad -x_1=x_3.
$$
Erste und dritte Gleichung sind äquivalent; $x_1=-x_3$ ist die einzige
Bedingung, während $x_2$ und $x_3$ frei sind. Somit
$$
\operatorname{Fix}(B)=\left\{
\lambda\begin{pmatrix}0\\1\\0\end{pmatrix}
+\mu\begin{pmatrix}-1\\0\\1\end{pmatrix}:
\lambda,\mu\in\mathbb R\right\}.
$$
Das ist die Ursprungsebene $x_1+x_3=0$. Einsetzen von
$\begin{pmatrix}-\mu\\\lambda\\\mu\end{pmatrix}$ ergibt denselben Vektor;
jeder Punkt dieser Ebene bleibt **einzeln** an seinem Ort. Es ist mehr
als die bloße Aussage, dass die Ebene als Menge auf sich abgebildet wird.

**4.** Für $C$ ergibt sich
$$
-x_2=x_1,\qquad x_1=x_2,\qquad 2x_3=x_3.
$$
Die ersten beiden Gleichungen geben $x_1=-x_1$, also $x_1=x_2=0$;
die letzte liefert $x_3=0$. Daher
$\operatorname{Fix}(C)=\{\vec0\}$. Keine der drei Standardrichtungen
liefert einen festen Einheitsvektor, aber der Ursprung bleibt dennoch
fest. Die Behauptung ist falsch: Eine lineare Abbildung hat mindestens
diesen Fixpunkt. Das System beweist hier, dass es genau dieser eine ist.

**5.** $D=I$, deshalb ist $(D-I)\vec x=\vec0$ das System
$0=0$, $0=0$, $0=0$. Alle drei Koordinaten sind frei und
$\operatorname{Fix}(D)=\mathbb R^3$. Die Abbildung ist die Identität;
jeder Raumpunkt bleibt fest. Es gibt keine zusätzliche Bedingung, die
die Lösung auf eine Gerade oder Ebene beschränkt.
