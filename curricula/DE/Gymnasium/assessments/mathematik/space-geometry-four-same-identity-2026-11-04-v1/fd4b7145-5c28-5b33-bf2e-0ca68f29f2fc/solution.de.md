# Musterlösung: Ebenenschar

**1. Normalenvektor und einzelne Ebenen**

Ein Normalenvektor ist

$$
\vec n_a=\begin{pmatrix}a-1\\1\\a\end{pmatrix}.
$$

Wegen seiner zweiten Komponente $1$ ist er für kein $a$ der Nullvektor.
Damit beschreibt die Gleichung für jedes $a$ eine Ebene. Es gilt

$$
E_0:\ -x+y=1,\qquad E_1:\ y+z=2.
$$

**2. Lage zu $F$**

Subtraktion der Gleichung von $F$ von der Gleichung von $E_a$ ergibt

$$
 (a-1)x+(a-1)z=a-1,
$$

also $(a-1)(x+z-1)=0$.

Für $a=1$ ist diese Gleichung für jeden Punkt von $F$ erfüllt, und
$E_1$ ist genau $F$. Die gemeinsame Punktmenge ist die ganze Ebene.

Für $a\neq1$ darf durch $a-1$ geteilt werden. Gemeinsam gelten dann

$$
x+z=1,\qquad y+z=2.
$$

Mit $x=t$ folgt $z=1-t$ und $y=1+t$. Die Schnittgerade ist

$$
L:\quad\vec x=\begin{pmatrix}0\\1\\1\end{pmatrix}
+t\begin{pmatrix}1\\1\\-1\end{pmatrix},\qquad t\in\mathbb R.
$$

Genau diese Punkte liegen in beiden Ebenen. Somit schneiden sich
$E_a$ und $F$ für jedes $a\neq1$ in derselben Geraden $L$.
Ein Fall echter Parallelität zu $F$ tritt nicht auf.

**3. Gemeinsame Gerade**

Für einen beliebigen Punkt $(t,1+t,1-t)$ von $L$ gilt

$$
(a-1)t+(1+t)+a(1-t)=a+1
$$

für jedes $a$. Also liegt die ganze Gerade in jeder Scharebene.
Umgekehrt muss ein Punkt, der in allen Scharebenen liegt, insbesondere
in $E_0$ und $E_1$ liegen. Deren Gleichungen $-x+y=1$ und $y+z=2$
liefern genau $y=1+x$ und $z=1-x$, also genau die Gerade $L$.
Weitere gemeinsame Punkte gibt es deshalb nicht.
Die verschiedenen Ebenen der Schar haben somit eine gemeinsame Achse:
Sie liegen wie aufgeschlagene Buchseiten um dieselbe Gerade.
Die Schar besteht tatsächlich aus verschiedenen Ebenen: Weil der
$y$-Koeffizient immer $1$ ist, können zwei Gleichungen nur dann
proportional und damit identisch sein, wenn ihre Parameter gleich sind.

**4. Punktbedingung und Parallelität zu $G$**

Einsetzen von $P$ ergibt

$$
2(a-1)+a=a+1\quad\Longleftrightarrow\quad2a=3,
$$

also $a=\frac32$. Die Probe in
$E_{3/2}:\ \frac12x+y+\frac32z=\frac52$ liefert
$1+0+\frac32=\frac52$.

Der Normalenvektor von $G$ ist $(0,1,1)^{\mathsf T}$.
Für parallele Ebenen müssen die Normalenvektoren parallel sein.
Da beide zweite Komponente $1$ haben, wäre ihr Proportionalitätsfaktor
$1$. Es müssen also $a-1=0$ und $a=1$ gelten: genau $a=1$.
Dann ist $E_1:\ y+z=2$ von $G:\ y+z=3$ verschieden, also **echt parallel**.
Für $a\neq1$ sind die Normalenvektoren nicht parallel; die Ebenen
schneiden sich daher in einer Geraden. Es gibt keinen Parameterwert,
für den $E_a$ und $G$ identisch sind.
