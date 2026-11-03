# Musterlösung: Geradenschar

**1. Scharparameter und Geradenparameter**

Ein fest gewählter Wert von $a$ wählt eine Gerade aus der Schar aus.
Auf dieser einen Geraden durchläuft $r$ alle reellen Werte.

$$
g_0:\quad\vec x=\begin{pmatrix}0\\-1\\0\end{pmatrix}
+r\begin{pmatrix}1\\0\\0\end{pmatrix},
$$

$$
g_1:\quad\vec x=\begin{pmatrix}0\\0\\0\end{pmatrix}
+r\begin{pmatrix}1\\1\\0\end{pmatrix},
$$

$$
g_2:\quad\vec x=\begin{pmatrix}0\\1\\2\end{pmatrix}
+r\begin{pmatrix}1\\2\\0\end{pmatrix}.
$$

Der Richtungsvektor $(1,a,0)^{\mathsf T}$ ist wegen seiner ersten
Komponente für kein $a$ der Nullvektor. Daher ist jedes $g_a$ eine Gerade.

**2. Lage zu $h$**

Gleichsetzen der Koordinaten liefert

$$
r=s,\qquad a-1+ar=0,\qquad a(a-1)=0.
$$

Die letzte Gleichung erlaubt einen Schnitt nur für $a=0$ oder $a=1$.

Für $a=0$ ist die zweite Gleichung $-1=0$, also unlösbar.
Die Richtungsvektoren von $g_0$ und $h$ sind gleich; $g_0$ liegt aber
bei $y=-1$ statt $y=0$. Die Geraden sind **echt parallel**.

Für $a=1$ ergibt die zweite Gleichung $r=0$, also auch $s=0$.
Die Geraden schneiden sich im Ursprung $O(0\mid0\mid0)$ und sind
wegen der nicht parallelen Richtungen verschieden.

Für $a\notin\{0,1\}$ verhindert die von null verschiedene konstante
dritte Koordinate $a(a-1)$ einen Schnitt mit $h$. Gleichzeitig ist
$(1,a,0)^{\mathsf T}$ nicht parallel zu $(1,0,0)^{\mathsf T}$, weil
$a\neq0$. Die Geraden sind daher **windschief**.

Identische Geraden gibt es in diesem Vergleich für keinen Wert von $a$:
Parallele Richtungen wären nur bei $a=0$ möglich, dort sind die Geraden
aber verschieden. Nichtschneiden allein beweist im Raum keine Parallelität;
es kann wie hier bei $a\notin\{0,1\}$ auch Windschiefe vorliegen.

**3. Schnitt mit $k$**

Die Koordinaten von $k$ verlangen $x=0$ und $z=2$. Aus $x=r=0$ folgt

$$
a(a-1)=2\quad\Longleftrightarrow\quad
a^2-a-2=(a-2)(a+1)=0.
$$

Somit ist $a=2$ oder $a=-1$.

Für $a=2$ ergibt $r=0$ auf $g_2$ den Punkt $(0\mid1\mid2)$.
Auf $k$ entsteht derselbe Punkt bei $u=1$.
Für $a=-1$ ergibt $r=0$ auf $g_{-1}$ den Punkt $(0\mid-2\mid2)$;
auf $k$ entsteht er bei $u=-2$.
Damit sind beide Schnittpunkte an beiden jeweiligen Geraden geprüft.
Weitere Schargeraden können $k$ nicht schneiden, da die notwendige
quadratische Bedingung keine weiteren Lösungen hat.
Die zwei gefundenen Schargeraden treffen $k$ an **verschiedenen** Punkten.
