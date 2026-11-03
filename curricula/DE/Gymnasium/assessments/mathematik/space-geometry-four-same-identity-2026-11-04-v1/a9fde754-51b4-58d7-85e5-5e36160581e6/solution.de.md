# Musterlösung: Spurpunkte

Auf $g$ gelten gleichzeitig $x=2+r$, $y=-3+2r$ und $z=6-2r$.

**1. Schnittpunkte und Proben**

Für die $xy$-Ebene ist $6-2r=0$, also $r=3$. Damit ist
$T_{xy}(5\mid3\mid0)$. Die Probe an der Geraden liefert

$$
\begin{pmatrix}2\\-3\\6\end{pmatrix}
+3\begin{pmatrix}1\\2\\-2\end{pmatrix}
=\begin{pmatrix}5\\3\\0\end{pmatrix}.
$$

Die dritte Koordinate ist null, also liegt der Punkt auch in der $xy$-Ebene.

Für die $xz$-Ebene ist $-3+2r=0$, also $r=\frac32$. Damit ist
$T_{xz}(\frac72\mid0\mid3)$. Die Geradenprobe ist

$$
\begin{pmatrix}2\\-3\\6\end{pmatrix}
+\frac32\begin{pmatrix}1\\2\\-2\end{pmatrix}
=\begin{pmatrix}\frac72\\0\\3\end{pmatrix}.
$$

Die zweite Koordinate ist null, also ist auch die Ebenenbedingung erfüllt.

Für die $yz$-Ebene ist $2+r=0$, also $r=-2$. Damit ist
$T_{yz}(0\mid-7\mid10)$. Die Geradenprobe ist

$$
\begin{pmatrix}2\\-3\\6\end{pmatrix}
-2\begin{pmatrix}1\\2\\-2\end{pmatrix}
=\begin{pmatrix}0\\-7\\10\end{pmatrix}.
$$

Die erste Koordinate ist null; damit gilt auch die Ebenenbedingung.
Jede der drei Ebenenbedingungen bestimmt hier genau einen Parameterwert.

**2. Geometrische Bedeutung**

Ein Spurpunkt liegt gleichzeitig auf der Geraden und in der jeweiligen
Koordinatenebene. An ihm durchstößt $g$ diese Ebene. Beim Verändern von
$r$ ändern sich hier alle drei Koordinaten zusammen. Nur eine Koordinate
eines beliebigen Geradenpunkts auf null zu setzen führt zwar zu einem
Punkt in der betreffenden Ebene, im Allgemeinen aber weg von $g$.
Beispielsweise liegt $(2\mid-3\mid0)$ in der $xy$-Ebene, aber nicht auf
$g$: Aus $x=2$ würde $r=0$ folgen, was auf $g$ die Höhe $z=6$ ergibt.

**3. Sonderfälle**

Bei $h$ ist die dritte Koordinate für jedes $s$ gleich null. Die
Ebenenbedingung lautet $0=0$ und ist für alle Parameter erfüllt.
Die ganze Gerade liegt in der $xy$-Ebene; es gibt unendlich viele
gemeinsame Punkte und keinen einzelnen eindeutigen Durchstoßpunkt.

Bei $k$ ist die dritte Koordinate stets $4$. Die Bedingung $z=0$ würde
$4=0$ verlangen, ist also für keinen Parameter erfüllt. Die Gerade ist
zur $xy$-Ebene parallel und liegt außerhalb dieser Ebene. Es gibt keinen
gemeinsamen Punkt und damit keinen Durchstoßpunkt.
