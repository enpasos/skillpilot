# Referenzlösung: Ein Tetraeder wird geteilt

Die folgende Lösung ist ein möglicher vollständiger Weg. Fachlich gleichwertige Wege und Darstellungen sind ebenso richtig.

**a) Ebenen und Geraden.** Die drei Punkte $O$, $A$ und $B$ haben die dritte Koordinate $0$ und sind nicht kollinear. Daher ist $F:\ z=0$. Die Ebenen $E$ und $F$ haben dieselbe Normalenrichtung, etwa $\vec n=\begin{pmatrix}0\\0\\1\end{pmatrix}$, aber unterschiedliche konstante $z$-Werte. Sie sind echt parallel; sie haben keinen gemeinsamen Punkt. Geometrisch verläuft $E$ parallel zur Grundfläche in halber Höhe des Tetraeders.

Auf $g$ gilt $z=6-t$. Einsetzen in $E$ liefert
$$
6-t=3\quad\Longrightarrow\quad t=3,\qquad P(6\mid0\mid3).
$$
Da der $z$-Anteil des Richtungsvektors $-1$ ist, gibt es genau einen passenden Parameter. Die Gerade $g$ durchstößt $E$ im Punkt $P$; sie ist weder enthalten noch parallel zu $E$.

Auf $h$ gilt für jeden Parameter $z=0$. Die Gleichung $0=3$ hat keine Lösung. Die Gerade hat keinen Punkt mit $E$ gemeinsam und ihre Richtung verläuft parallel zur Ebene: $h$ ist echt parallel zu $E$.

Auf $k$ gilt für jeden Parameter $z=3$. Die Ebenengleichung ist für alle $r$ erfüllt. Daher liegt die gesamte Gerade $k$ in $E$. Der konstante $z$-Wert allein bedeutet also nicht automatisch „echt parallel“: Entscheidend ist, ob er zur Ebenengleichung passt.

**b) Geradenpaare.** Die Geraden $h$ und $k$ haben denselben Richtungsvektor. Sie sind verschieden, weil auf $h$ stets $z=0$ und auf $k$ stets $z=3$ gilt. Also sind sie echt parallel.

Die Behauptung über $g$ und $k$ ist falsch. Ein gemeinsamer Punkt müsste in $E$ liegen und wäre deshalb der bereits berechnete einzige Schnittpunkt $P$ von $g$ mit $E$. Für einen Punkt von $k$ mit zweiter Koordinate $0$ folgt aus $2r=0$ jedoch $r=0$; dieser Punkt ist $(0\mid0\mid3)$ und nicht $P(6\mid0\mid3)$. Somit ist $P$ kein Punkt von $k$, und $g$ und $k$ haben keinen Schnittpunkt. Ihre Richtungsvektoren $\begin{pmatrix}2\\0\\-1\end{pmatrix}$ und $\begin{pmatrix}-3\\2\\0\end{pmatrix}$ sind keine Vielfachen voneinander. Sie sind also auch nicht parallel: $g$ und $k$ sind **windschief**. Eine Gerade kann eine Ebene in einem Punkt treffen, der nicht auf einer bestimmten Geraden dieser Ebene liegt.

**c) Schnittfigur.** Auf den drei Strecken von $C$ zur Grundfläche verwenden wir jeweils einen Parameter $\lambda\in[0,1]$:
$$
\begin{aligned}
\overrightarrow{CX}&=\lambda\overrightarrow{CO},&X&=(0\mid0\mid6-6\lambda),\\
\overrightarrow{CY}&=\lambda\overrightarrow{CA},&Y&=(12\lambda\mid0\mid6-6\lambda),\\
\overrightarrow{CZ}&=\lambda\overrightarrow{CB},&Z&=(0\mid8\lambda\mid6-6\lambda).
\end{aligned}
$$
Für $z=3$ folgt jeweils $\lambda=\frac12$. Daher sind
$$
U(0\mid0\mid3),\qquad V(6\mid0\mid3),\qquad W(0\mid4\mid3).
$$
Die Parameter liegen im Streckenintervall. Die übrigen drei Kanten $OA$, $OB$ und $AB$ liegen vollständig in $z=0$ und werden von $E$ nicht geschnitten. Der Schnitt durch den konvexen Tetraeder verbindet die drei gefundenen Kantenpunkte: Die gesamte Schnittfigur ist die Dreiecksfläche $UVW$. Sie ist rechtwinklig bei $U$, weil $\overrightarrow{UV}=(6,0,0)^{\mathsf T}$ und $\overrightarrow{UW}=(0,4,0)^{\mathsf T}$ senkrecht sind. Auch die Beschreibung als zur Grundfläche paralleles Dreieck mit halbierten Seitenlängen begründet die Form.

**d) Teilvolumina.** Die Grundfläche $OAB$ ist ein rechtwinkliges Dreieck mit Kathetenlängen $12$ und $8$; die Tetraederhöhe beträgt $6$. Somit gilt
$$
\begin{aligned}
G&=\frac12\cdot12\cdot8=48\,\mathrm{LE}^2,\\
V_{\mathrm{gesamt}}&=\frac13\cdot48\cdot6=96\,\mathrm{LE}^3.
\end{aligned}
$$
Der Teilkörper mit Spitze $C$ ist die Pyramide $CUVW$. Ihre Grundfläche ist $UVW$ mit Kathetenlängen $6$ und $4$; ihre Höhe ist der Abstand von $C$ zu $E$, also $3$. Daher
$$
\begin{aligned}
G_{UVW}&=\frac12\cdot6\cdot4=12\,\mathrm{LE}^2,\\
V_{\mathrm{oben}}&=\frac13\cdot12\cdot3=12\,\mathrm{LE}^3.
\end{aligned}
$$
Der übrige Teil ist ein Pyramidenstumpf; sein Volumen ergibt sich durch Subtraktion:
$$
\begin{aligned}
V_{\mathrm{unten}}&=96-12=84\,\mathrm{LE}^3,\\
V_{\mathrm{oben}}:V_{\mathrm{unten}}&=12:84=1:7.
\end{aligned}
$$
Damit entfallen $\frac18$ des Gesamtvolumens auf den Teil mit Spitze $C$ und $\frac78$ auf den übrigen Teil. Der übrige Teil hat das siebenfache Volumen.

**e) Höhenhälften sind keine Volumenhälften.** Die Behauptung ist falsch. Alle drei Strecken von $C$ zur Grundfläche werden im selben Verhältnis halbiert. Der obere Teil ist deshalb eine zum ganzen Tetraeder ähnliche Pyramide mit Längenfaktor $\frac12$, Grundflächenfaktor $\frac14$ und Höhenfaktor $\frac12$. Aus $V=\frac13Gh$ folgt
$$
\frac{V_{\mathrm{oben}}}{V_{\mathrm{gesamt}}}
=\frac14\cdot\frac12=\frac18.
$$
Die unteren und oberen Höhen sind zwar gleich groß, aber die Querschnitte werden zur Spitze hin kleiner. Gleiche Höhen liefern hier keine gleichen Volumina; auf die übrigen $\frac78$ folgt gerade das Teilungsverhältnis $1:7$.

Alternativ kann der Längenfaktor direkt mit der bekannten Volumenskalierung $\left(\frac12\right)^3$ begründet werden, wenn die Ähnlichkeit des oberen Teilkörpers zum gesamten Tetraeder erklärt wird. Ein Vektorprodukt, Spatprodukt, Integral oder eine spezielle Pyramidenstumpfformel wird nicht benötigt.
