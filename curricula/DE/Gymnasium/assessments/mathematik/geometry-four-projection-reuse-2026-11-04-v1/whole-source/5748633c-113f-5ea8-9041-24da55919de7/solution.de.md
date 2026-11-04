# Referenzlösung: Koordinatenansichten

**1.** Die Bilder von $Q$ sind $Q_{12}(2|-1|0)$,
$Q_{13}(2|0|3)$ und $Q_{23}(0|-1|3)$. Allgemein gilt
$$
\begin{pmatrix}x_1\\x_2\\x_3\end{pmatrix}
\longmapsto\begin{pmatrix}x_1\\x_2\\0\end{pmatrix},\quad
\begin{pmatrix}x_1\\0\\x_3\end{pmatrix},\quad
\begin{pmatrix}0\\x_2\\x_3\end{pmatrix},
$$
für die drei genannten Ebenen in derselben Reihenfolge. Die zur Ebene
senkrechte Koordinatenrichtung wird auf null gesetzt; die beiden in
der Ebene liegenden Koordinaten bleiben erhalten. Verschiedene Höhen
können daher dieselbe Draufsicht erzeugen.

**2.** Beim Projizieren jedes Geradenpunkts erhält man
$$
g_{12}:\vec x=\begin{pmatrix}1\\2\\0\end{pmatrix}
+t\begin{pmatrix}2\\-1\\0\end{pmatrix},\quad t\in\mathbb R.
$$
Der Bildrichtungsvektor ist nicht null, daher ist das Bild wieder eine
Gerade. Für $t=1$ entsteht $R(3|1|0)$, also gehört $R$ zum Bild.
Auf $h$ sind die ersten beiden Koordinaten stets $2$ und $1$; alle
Geradenpunkte werden auf $H(2|1|0)$ abgebildet. Die Bildmenge ist der
einzelne Punkt $\{H\}$, keine Gerade mit dem Nullvektor als Richtung.
Die Gerade $h$ verläuft senkrecht zur Zielebene, also in Blickrichtung.

**3.** In der Draufsicht entstehen
$A_{12}(1|1|0)$, $B_{12}(5|1|0)$ und $C_{12}(1|4|0)$.
Die ganze ausgefüllte Dreiecksfläche wird auf das ausgefüllte Dreieck
$A_{12}B_{12}C_{12}$ abgebildet. Das folgt auch aus den Punkten
$\vec a+s(\vec b-\vec a)+t(\vec c-\vec a)$ mit $s,t\ge0$,
$s+t\le1$, auf die die Projektion komponentenweise angewandt wird.
Die rechtwinklig zueinander liegenden Bildseiten haben Längen $4$ und
$3$, also ist der Bildflächeninhalt $\frac12\cdot4\cdot3=6\,\mathrm m^2$.

In der Seitenansicht entstehen $A_{23}=B_{23}=(0|1|2)$ und
$C_{23}=(0|4|5)$. Die **ganze Bildmenge** ist die Strecke
$$
\vec x=\begin{pmatrix}0\\1\\2\end{pmatrix}
+\lambda\begin{pmatrix}0\\3\\3\end{pmatrix},\quad 0\le\lambda\le1.
$$
Sie hat Flächeninhalt $0\,\mathrm m^2$. Die Kante $AB$ liegt in
$x_1$-Blickrichtung und verschwindet, sodass das ganze Segel in dieser
Ansicht auf eine Strecke zusammenfällt. Die Skizzen zeigen ein
rechtwinkliges Dreieck mit den genannten $x_1,x_2$-Koordinaten und eine
Strecke von $(1|2)$ nach $(4|5)$ im $x_2x_3$-Bild mit zusammenfallenden
Beschriftungen $A_{23},B_{23}$ am ersten Ende.
Die Aussage ist falsch: Das ursprüngliche Dreieck hat zwei unabhängige
Kanten und damit positiven Flächeninhalt, eine Ansicht jedoch Fläche
null. Ein räumlicher Flächeninhalt wird durch eine Projektion im Allgemeinen
nicht erhalten; ihn selbst zu berechnen ist hier nicht verlangt.

![Referenzskizzen: gefülltes Bilddreieck in der Draufsicht und zusammengefallene Bildstrecke in der Seitenansicht.](/assets/assessment-materials/mathematik/5748633c-113f-5ea8-9041-24da55919de7/coordinate-views-solution-v1.png)

**4.** Der Lichtstrahl liegt auf
$$
\vec x=\begin{pmatrix}2\\1\\4\end{pmatrix}
+t\begin{pmatrix}1\\0\\-2\end{pmatrix},\quad t\ge0.
$$
Für den Boden gilt $4-2t=0$, also $t=2\ge0$. Der Schattenpunkt ist
$S_L(4|1|0)$, die orthogonale Draufsicht dagegen $S_{12}(2|1|0)$.
Die Lichtstrahlen verlaufen schräg zum Boden; während $x_3$ abnimmt,
ändert sich auch $x_1$. Bei senkrechter Draufsicht blieben $x_1,x_2$
unverändert. Daher muss die tatsächliche Richtung berücksichtigt werden.
