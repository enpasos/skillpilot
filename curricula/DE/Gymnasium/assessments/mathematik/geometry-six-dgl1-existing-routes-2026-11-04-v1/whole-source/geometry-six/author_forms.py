from pathlib import Path
import json
H=Path(__file__).resolve().parent
assert not (H/'review-input-manifest.json').exists(),'Frozen package; create a new version for revisions.'
FORMS=[]
FORMS.append(dict(id='bd3576b8-f4e5-542a-a8a2-74524d9cee21',key='finite-roof-shadow-model',
task_de=r'''# Trifft der Schatten die Dachfläche?

Ein Modell verwendet Meter als Koordinateneinheit. Eine ebene Dachfläche
hat in dieser Randreihenfolge die Ecken
$$
\begin{gathered}
A(0\mid0\mid3),\quad B(6\mid0\mid6),\\
C(6\mid4\mid6),\quad D(0\mid4\mid3).
\end{gathered}
$$
Das Dach liegt genau über dem Rechteck $0\le x\le6$, $0\le y\le4$.
Die Dachfläche wird für die Rechnung als undurchsichtig und ohne Dicke
angenommen. Andere Hindernisse werden nicht betrachtet.

Ein senkrechter Mast steht mit seinem Fuß bei $M(8\mid2\mid0)$ und
ist $9\,\mathrm m$ hoch. Die Sonnenstrahlen verlaufen geradlinig in der Richtung
$$
\vec v=\begin{pmatrix}-1\\0\\-1\end{pmatrix}.
$$
Der Strahl von der Mastspitze darf nur in dieser Richtung laufen.

Zeige deine Modellansätze, Rechnungen und Begründungen. Insgesamt sind
**20 BE** erreichbar.

**1. Die Dachfläche modellieren (6 BE)**

Stelle aus den Eckpunkten eine Parametergleichung der unendlich
ausgedehnten Dachebene $E$ auf und gib die Parameterbeschränkungen an,
die genau die Dachfläche beschreiben. Bestimme außerdem eine
Koordinatengleichung von $E$ und prüfe einen der übrigen Eckpunkte.

**2. Das Licht modellieren (4 BE)**

Bestimme die Mastspitze $S$. Stelle eine Parametergleichung für den
Lichtstrahl ab $S$ auf. Erkläre, wie sich sein Parameterbereich vom
Parameterbereich einer vollständigen Geraden unterscheidet.

**3. Schnitt und Schatten unterscheiden (5 BE)**

Berechne den Schnitt des Lichtstrahls mit $E$ und prüfe dein Ergebnis
an beiden Gleichungen. Entscheide unter Beachtung aller Beschränkungen,
ob der Schatten der Mastspitze tatsächlich auf die Dachfläche fällt.

**4. Eine geänderte Aufstellung beurteilen (3 BE)**

Der Mast wird bei gleicher Höhe nach $M'(8\mid5\mid0)$ versetzt;
Dach und Sonnenrichtung bleiben gleich. Ermittle den neuen Schnitt mit
der Dachebene und entscheide begründet, ob auch ein Schattenpunkt auf
der Dachfläche entsteht. Eine sachlich begründete Übertragung der
vorherigen Rechnung ist erlaubt.

**5. Das Modell einordnen (2 BE)**

Erkläre an einem konkreten Aspekt dieser Situation, welche reale
Eigenschaft das Modell idealisiert und wie sich diese Idealisierung
auf die Aussage über den Schatten auswirken kann.
''',
task_en=r'''# Does the shadow hit the roof surface?

Coordinates are measured in metres. A flat roof surface has the following corners in boundary order:
$$
\begin{gathered}
A(0,0,3),\quad B(6,0,6),\\
C(6,4,6),\quad D(0,4,3).
\end{gathered}
$$
The roof lies exactly above the rectangle $0\le x\le6$, $0\le y\le4$.
For the calculation, treat it as opaque with zero thickness. Ignore
other obstacles.

A vertical mast has base $M(8,2,0)$ and height $9\,\mathrm m$.
Sunlight travels along straight rays in the direction
$$
\vec v=\begin{pmatrix}-1\\0\\-1\end{pmatrix}.
$$
The ray from the mast tip travels only in this direction.

Show your model setups, calculations and reasoning. Total: **20 points**.

**1. Model the roof (6 points)**

Use the corners to construct a parametric equation of the infinite
roof plane $E$. Give parameter restrictions that describe exactly the
finite roof surface. Also find a coordinate equation of $E$ and check
one of the remaining corners.

**2. Model the light (4 points)**

Find the mast tip $S$ and set up a parametric equation for the ray
starting at $S$. Explain how its parameter domain differs from the
domain of a complete line.

**3. Distinguish intersection from a roof shadow (5 points)**

Calculate the intersection of the ray with $E$ and check it in both
equations. Use all relevant restrictions to decide whether the shadow
of the mast tip actually falls on the roof surface.

**4. Assess a changed position (3 points)**

The mast is moved to base $M'(8,5,0)$ with the same height. The roof
and sunlight direction stay fixed. Find the new intersection with the
roof plane and decide, with reasons, whether it is a shadow point on
the finite roof surface. A justified transfer of the earlier calculation
is allowed.

**5. Assess the model (2 points)**

Choose one concrete aspect of this situation and explain which real
property the model idealises and how that idealisation can affect the
claim about the shadow.
''',
solution_de=r'''# Musterlösung: Dach und Lichtstrahl

**1.** Aus $\overrightarrow{AB}=(6,0,3)^{\mathsf T}$ und
$\overrightarrow{AD}=(0,4,0)^{\mathsf T}$ folgt
$$
E:\quad\vec x=\begin{pmatrix}0\\0\\3\end{pmatrix}
+u\begin{pmatrix}6\\0\\3\end{pmatrix}
+w\begin{pmatrix}0\\4\\0\end{pmatrix}.
$$
Für die ganze Ebene sind $u,w\in\mathbb R$ unabhängig;
für die Dachfläche gilt $0\le u\le1$, $0\le w\le1$.
Die nicht parallelen Richtungen spannen die Ebene auf.
Aus $x=6u$, $y=4w$, $z=3+3u$ ergibt sich
$$
E:\quad z=3+\frac{x}{2},\qquad\text{gleichwertig }x-2z=-6.
$$
Zum Beispiel erfüllt $C$ die Gleichung $6-2\cdot6=-6$ und
entspricht $u=w=1$. Auch eine andere gültige Eckpunktprobe zählt.

**2.** Die Mastspitze ist $S(8\mid2\mid9)$. Der Lichtstrahl ist
$$
\vec x=\begin{pmatrix}8\\2\\9\end{pmatrix}
+t\begin{pmatrix}-1\\0\\-1\end{pmatrix},\qquad t\ge0.
$$
Negative Werte würden entgegen der vorgegebenen Ausbreitungsrichtung
laufen. Bei der vollständigen Geraden wäre $t\in\mathbb R$ erlaubt.
$t$ ist hier ein geometrischer Laufparameter, keine vorgegebene Zeit.

**3.** Einsetzen ergibt
$$
9-t=3+\frac{8-t}{2},\qquad t=4.
$$
Damit ist $P(4\mid2\mid5)$. Die Strahlgleichung liefert bei $t=4$
genau diesen Punkt; in $E$ gilt $4-2\cdot5=-6$.
$t=4\ge0$ liegt auf dem Lichtstrahl. Mit $u=4/6=2/3$ und
$w=2/4=1/2$ liegt $P$ auch in der begrenzten Dachfläche.
Der Schatten der Mastspitze fällt im Modell auf das Dach.
Die eindeutige Lösung folgt auch daraus, dass die Sonnenrichtung nicht
parallel zur Ebene ist.

**4.** Die neue Spitze ist $S'(8\mid5\mid9)$. Nur die konstante
$y$-Koordinate ändert sich; die Ebenengleichung enthält $y$ nicht.
Deshalb bleibt $t=4$ und der Ebenenschnitt ist $P'(4\mid5\mid5)$.
Er liegt auf dem richtigen Strahl und auf der unendlichen Ebene,
aber $y=5>4$ bzw. $w=5/4>1$ verletzt die Dachbegrenzung.
Er ist also kein Schattenpunkt auf dieser Dachfläche.

**5.** Zum Beispiel sind parallele Strahlen eine Idealisierung des Lichts von der räumlich
ausgedehnten Sonne: In der Realität entsteht ein Übergangsbereich statt
einer beliebig scharfen Schattengrenze. Oder: Das Dach wird als
exakt eben angenommen; reale Aufbauten oder eine Krümmung könnten den
getroffenen Ort verändern oder einen Strahl vorher abfangen.
Eine konkrete andere, zum Modell passende Erklärung ist gleichwertig.
Die bloße Aussage „Das ist nur ein Modell“ erklärt noch keine Auswirkung.
''',
solution_en=r'''# Worked solution: roof and light ray

**1.** The edge vectors are $\overrightarrow{AB}=(6,0,3)^{\mathsf T}$
and $\overrightarrow{AD}=(0,4,0)^{\mathsf T}$, giving
$$
E:\quad\vec x=\begin{pmatrix}0\\0\\3\end{pmatrix}
+u\begin{pmatrix}6\\0\\3\end{pmatrix}
+w\begin{pmatrix}0\\4\\0\end{pmatrix}.
$$
For the whole plane, $u,w\in\mathbb R$ independently; the roof surface
requires $0\le u\le1$, $0\le w\le1$. The nonparallel directions span
a plane. From $x=6u$, $y=4w$, $z=3+3u$ we obtain
$$
E:\quad z=3+\frac{x}{2},\qquad\text{equivalently }x-2z=-6.
$$
For example, $C$ satisfies $6-2\cdot6=-6$ and has $u=w=1$.
Accept another valid corner check.

**2.** The mast tip is $S=(8,2,9)$. Its light ray is
$$
\vec x=\begin{pmatrix}8\\2\\9\end{pmatrix}
+t\begin{pmatrix}-1\\0\\-1\end{pmatrix},\qquad t\ge0.
$$
Negative values travel against the specified light direction. A complete
line allows $t\in\mathbb R$. Here $t$ is a geometric parameter, not a
specified elapsed time.

**3.** Substitution gives
$$
9-t=3+\frac{8-t}{2},\qquad t=4.
$$
Thus $P=(4,2,5)$. Substituting $t=4$ into the ray gives this point,
and $4-2\cdot5=-6$ checks the plane equation. Since $t\ge0$, the point
is on the ray. Moreover $u=2/3$, $w=1/2$ satisfy both finite-surface
restrictions. In this model, the mast-tip shadow falls on the roof.
Uniqueness also follows because the light direction is not parallel
to the plane.

**4.** The new tip is $S'=(8,5,9)$. Only the constant $y$ coordinate
changes, and the plane equation does not involve $y$. Hence $t=4$
again and $P'=(4,5,5)$. It is on the correct ray and the infinite plane,
but $y=5>4$, or $w=5/4>1$, violates the roof boundary. It is not a
shadow point on this finite roof surface.

**5.** For example, perfectly parallel rays simplify the light from the spatially
extended Sun: a real shadow has a
transition region rather than an arbitrarily sharp boundary. Or the
roof is assumed perfectly flat; real roof structures or curvature could
change the hit point or intercept a ray first. Accept another concrete
explanation consistent with the model. Merely saying “it is only a
model” does not explain an effect.
''',
steps=[('roof',6,'Tragfähige Ebenenparameterform aus zwei unabhängigen Dachkanten (2); korrekte Beschränkungen beider Parameter (2); Koordinatengleichung (1); gültige Eckpunktprobe (1).','Sound plane parameterisation using independent roof edges (2); correct restrictions on both parameters (2); coordinate equation (1); valid corner check (1).'),('ray',4,'Mastspitze (1); Strahlgleichung mit passendem Stütz- und Richtungsvektor (2); t≥0 gegenüber vollständiger Geraden erklärt (1).','Mast tip (1); ray equation with appropriate position and direction vectors (2); explains t≥0 versus a full line (1).'),('hit',5,'Schnittgleichung aus den Modellen (1); t und P berechnet (1); Probe an Strahl und Ebene (1); richtiger Strahlbereich (1); endliche Dachgrenzen begründet geprüft (1).','Intersection equation from the models (1); calculates t and P (1); checks ray and plane (1); correct ray domain (1); justified finite-roof check (1).'),('moved',3,'Neue Spitze und unveränderter Schnittparameter begründet bzw. richtig neu gerechnet (1); P′ (1); Ebenenschnitt von realem Dachtreffer über y bzw. Flächenparameter unterschieden (1).','Justifies the new tip and unchanged parameter, or correctly recalculates (1); P′ (1); uses y or a surface parameter to distinguish plane intersection from a roof hit (1).'),('limits',2,'Konkrete zum Modell passende Idealisierung benannt (1); mögliche Auswirkung auf die Schattensaussage erklärt (1).','Identifies a concrete appropriate idealisation (1); explains a possible effect on the shadow claim (1).')],
cap_de='Begrenze die normale Gesamtpunktzahl auf 14 BE, wenn über die ganze Abgabe kein tragfähiges Paar aus einem selbst aufgestellten Dach-Ebenenmodell und einem Licht-Geraden-/Strahlmodell vorliegt oder wenn die Interpretation der Schnittlösung unter den Strahl- und Dachbeschränkungen vollständig fehlt bzw. konzeptionell durch „Ebenenschnitt bedeutet immer Dachtreffer“ ersetzt wird. Eine knappe gültige Modellierung und Kontextprüfung zählt; äquivalente Gleichungen sind gleichwertig. Ein lokaler Rechenfehler bei tragfähigen Modellen und nachvollziehbarer Kontextprüfung löst keine Kappung aus.',
cap_en='Cap the ordinary total at 14 if the whole submission contains no sound pair of a learner-constructed roof-plane model and light line/ray model, or if interpretation using the ray and roof restrictions is entirely absent or conceptually replaced by “a plane intersection always hits the roof”. Concise valid modelling and context checks count; equivalent equations are equally valid. A local arithmetic slip with sound models and traceable contextual checking does not trigger the cap.'))

FORMS.append(dict(id='58f613da-03be-5c6a-90a9-ff0958aa7849',key='special-lines-axes-planes',
task_de=r'''# Geraden an Achsen und Koordinatenebenen einordnen

Es werden vollständige Geraden mit reellen Laufparametern betrachtet:
$$
g:\quad\vec x=\begin{pmatrix}0\\0\\0\end{pmatrix}
+t\begin{pmatrix}1\\0\\0\end{pmatrix},
$$
$$
h:\quad\vec x=\begin{pmatrix}0\\2\\0\end{pmatrix}
+r\begin{pmatrix}1\\0\\0\end{pmatrix},
$$
$$
k:\quad\vec x=\begin{pmatrix}1\\1\\2\end{pmatrix}
+s\begin{pmatrix}1\\1\\0\end{pmatrix}.
$$
Die Koordinatenebenen sind $xy:z=0$, $xz:y=0$ und $yz:x=0$.
„Echt parallel“ bedeutet hier parallel und ohne gemeinsame Punkte.
Begründe rechnerisch und deute geometrisch. Insgesamt: **20 BE**.

**1. Die Gerade $g$ einordnen (4 BE)**

Untersuche ihre Lage zu allen drei Koordinatenachsen und zu allen drei
Koordinatenebenen. Gib gegebenenfalls gemeinsame Punkte an.

**2. Die Gerade $h$ einordnen (8 BE)**

Untersuche ebenfalls ihre Lage zu jeder Koordinatenachse und jeder
Koordinatenebene. Unterscheide bei Achsen identische, echt parallele,
schneidende und windschiefe Geraden; bei Ebenen „liegt in“, „echt
parallel“ und „schneidet in genau einem Punkt“. Begründe mit den
Koordinatenbedingungen und den Richtungen. Gib vorhandene Schnittpunkte
an. Eine Tabelle mit knappen Rechnungen ist erlaubt.

**3. Eine weitere Gerade prüfen (5 BE)**

Untersuche $k$ zur $xy$-Ebene und zur $z$-Achse. Eine Person behauptet:
„Weil die dritte Komponente ihres Richtungsvektors null ist, liegt $k$
in der $xy$-Ebene und kann die $z$-Achse nicht schneiden.“ Beurteile
beide Folgerungen anhand deiner Rechnungen.

**4. Ein allgemeines Kriterium formulieren (3 BE)**

Sei $l:\vec x=\vec p+u\vec d$ mit $\vec d\ne\vec0$.
Formuliere mithilfe von $p_3$ und $d_3$, wann $l$ in der $xy$-Ebene
liegt, wann sie echt parallel dazu ist und wann sie diese in genau
einem Punkt schneidet. Erkläre, warum eine Richtungskomponente mit dem Wert null
allein die Lage noch nicht festlegt.
''',
task_en=r'''# Locate lines relative to axes and coordinate planes

Consider the complete lines with real parameters:
$$
g:\quad\vec x=\begin{pmatrix}0\\0\\0\end{pmatrix}
+t\begin{pmatrix}1\\0\\0\end{pmatrix},
$$
$$
h:\quad\vec x=\begin{pmatrix}0\\2\\0\end{pmatrix}
+r\begin{pmatrix}1\\0\\0\end{pmatrix},
$$
$$
k:\quad\vec x=\begin{pmatrix}1\\1\\2\end{pmatrix}
+s\begin{pmatrix}1\\1\\0\end{pmatrix}.
$$
The coordinate planes are $xy:z=0$, $xz:y=0$ and $yz:x=0$.
“Strictly parallel” here means parallel with no common points.
Justify algebraically and interpret geometrically. Total: **20 points**.

**1. Locate $g$ (4 points)**

Determine its position relative to each of the three coordinate axes
and each coordinate plane. Give common points where appropriate.

**2. Locate $h$ (8 points)**

Again investigate every coordinate axis and coordinate plane. For axes,
distinguish identical, distinct parallel, intersecting and skew lines;
for planes distinguish “contained in”, “strictly parallel” and “meets
in exactly one point”. Use coordinate conditions and directions to
justify your decisions, and give any intersection points. A table with
concise calculations is allowed.

**3. Check another line (5 points)**

Investigate $k$ relative to the $xy$-plane and the $z$-axis. Someone
claims: “Its direction vector has third component zero, so $k$ lies
in the $xy$-plane and cannot meet the $z$-axis.” Assess both conclusions
using your calculations.

**4. State a general criterion (3 points)**

Let $l:\vec x=\vec p+u\vec d$ with $\vec d\ne\vec0$.
Use $p_3$ and $d_3$ to state when $l$ is contained in the $xy$-plane,
when it is strictly parallel, and when it meets that plane in exactly
one point. Explain why a zero direction component alone does not decide
the position.
''',
solution_de=r'''# Musterlösung: besondere Geradenlagen

**1.** $g$ besteht aus allen Punkten $(t,0,0)$ und ist daher die
$x$-Achse selbst. Mit der $y$- und der $z$-Achse hat sie jeweils nur
den Ursprung gemeinsam. Sie liegt ganz in $xy$ und $xz$, weil stets
$z=0$ und $y=0$ gilt. Mit $yz$ hat sie wegen $x=t=0$ genau den
Ursprung gemeinsam. Die Aussagen folgen aus Punktmengen, nicht nur aus
parallelen Richtungen.

**2.** Auf $h$ gilt $(x,y,z)=(r,2,0)$.

- Zur $x$-Achse ist $h$ echt parallel: gleiche Richtung, aber $y=2$
  statt $y=0$, also kein gemeinsamer Punkt.
- Die $y$-Achse verlangt $x=z=0$. Bei $r=0$ erhält man genau
  $Y(0\mid2\mid0)$; die Richtungen sind verschieden, also schneiden
  sich die beiden Geraden in diesem Punkt.
- Die $z$-Achse verlangt $x=y=0$. $y=2$ macht einen Schnitt unmöglich.
  Die Richtungen $(1,0,0)^{\mathsf T}$ und $(0,0,1)^{\mathsf T}$ sind
  nicht parallel. Daher sind die Geraden windschief, nicht echt parallel.
- $h$ liegt in $xy$, denn $z=0$ gilt für jedes $r$.
- Zu $xz$ ist $h$ echt parallel: Ihre Richtung hat $y$-Komponente null,
  aber alle Punkte haben $y=2\ne0$.
- $yz$ verlangt $x=0$, also $r=0$. Es gibt genau den Schnittpunkt $Y$.

**3.** Auf $k$ ist $z=2$ konstant. Daher ist $k$ zur $xy$-Ebene echt
parallel und liegt nicht in ihr. Für die $z$-Achse müssen gleichzeitig
$x=1+s=0$ und $y=1+s=0$ gelten. Beide Gleichungen liefern $s=-1$;
$Z(0\mid0\mid2)$ ist der Schnittpunkt. Die Richtungen sind nicht
parallel, also handelt es sich um einen eindeutigen Schnitt.
Beide Folgerungen der Behauptung sind falsch. $d_3=0$ sagt nur, dass
sich die Höhe längs der Geraden nicht ändert. Die Höhe selbst wird vom
Stützpunkt festgelegt. Eine solche Gerade kann eine vertikale Achse
sehr wohl schneiden.

**4.** Die Ebenenbedingung auf $l$ lautet $p_3+ud_3=0$.

- $d_3=0$ und $p_3=0$: Alle $u$ lösen die Gleichung, die Gerade liegt
  in der Ebene.
- $d_3=0$ und $p_3\ne0$: Kein $u$ löst sie, die Gerade ist echt parallel.
- $d_3\ne0$: Genau $u=-p_3/d_3$ löst sie; es gibt genau einen Schnitt.

Bei $d_3=0$ muss also zusätzlich die Lage des Stützpunkts geprüft werden.
''',
solution_en=r'''# Worked solution: special line positions

**1.** $g$ consists of all $(t,0,0)$ and is the $x$-axis itself.
Its only common point with the $y$-axis and the $z$-axis is the origin.
It is contained in both $xy$ and $xz$ because $z=0$ and $y=0$ hold
throughout. For $yz$, $x=t=0$ gives exactly the origin. These conclusions
use the point sets, not just parallel directions.

**2.** Points on $h$ have $(x,y,z)=(r,2,0)$.

- It is distinct and parallel to the $x$-axis: the directions agree,
  but $y=2$ rather than $0$, so there is no common point.
- The $y$-axis requires $x=z=0$. At $r=0$ the unique common point is
  $Y=(0,2,0)$. Their directions differ, so they intersect there.
- The $z$-axis requires $x=y=0$. Since $y=2$, no intersection is possible.
  Directions $(1,0,0)^{\mathsf T}$ and $(0,0,1)^{\mathsf T}$ are not
  parallel. The lines are therefore skew, rather than parallel.
- $h$ is contained in $xy$ because $z=0$ for every $r$.
- It is strictly parallel to $xz$: its direction has zero $y$ component,
  while every point has $y=2\ne0$.
- For $yz$, $x=0$ gives $r=0$ and exactly the intersection point $Y$.

**3.** On $k$, $z=2$ is constant, so the line is strictly parallel to
the $xy$-plane, rather than contained in it. For the $z$-axis we require
both $x=1+s=0$ and $y=1+s=0$. Both give $s=-1$, producing $Z=(0,0,2)$.
The directions are not parallel, so this is a unique line intersection.
Both parts of the claim are false. $d_3=0$ only means that height stays
constant along a line; the position vector determines that height.
Such a line can certainly intersect a vertical axis.

**4.** The plane condition on $l$ is $p_3+ud_3=0$.

- If $d_3=0$ and $p_3=0$, every $u$ solves it: the line is in the plane.
- If $d_3=0$ and $p_3\ne0$, there is no solution: it is strictly parallel.
- If $d_3\ne0$, exactly $u=-p_3/d_3$ solves it: there is one intersection.

Thus for $d_3=0$, the position vector must also be checked.
''',
steps=[('g',4,'g als x-Achse durch gesamte Punktmenge begründet (1); Schnitte mit y/z jeweils O (1 zusammen); in xy und xz begründet (1 zusammen); eindeutiger Schnitt mit yz im Ursprung (1).','Justifies g as the entire x-axis (1); y/z intersections both at O (1 together); containment in xy and xz justified (1 together); unique yz intersection at O (1).'),('h-axes',5,'Echte Parallelität zur x-Achse aus Richtung und fehlendem gemeinsamen Punkt (1); eindeutiger Schnitt mit y-Achse und Punkt (2: Bedingung/Parameter 1, Punkt/Deutung 1); Windschiefe zur z-Achse aus Nichtschneiden UND nicht parallelen Richtungen (2, je 1).','Distinct parallel position to x-axis using direction and disjointness (1); unique y-axis intersection and point (2: conditions/parameter 1, point/interpretation 1); skewness relative to z-axis from disjointness AND nonparallel directions (2, 1 each).'),('h-planes',3,'In xy wegen z=0 für alle r (1); echt parallel zu xz wegen konstant y=2 (1); Schnitt mit yz bei r=0 und Y (1).','Contained in xy since z=0 for all r (1); strictly parallel to xz since y=2 throughout (1); meets yz at r=0 and Y (1).'),('k',5,'Konstantes z=2 und echte Parallelität zu xy begründet (2); beide Achsenbedingungen und s=-1 (1); Schnittpunkt Z (1); beide falschen Folgerungen mit richtigem Stützpunkt-/Richtungsbezug erklärt (1).','Justifies constant z=2 and strict parallelism to xy (2); both axis conditions and s=-1 (1); point Z (1); explains both false inferences using position and direction appropriately (1).'),('general',3,'Ebenenbedingung p3+u d3=0 und drei vollständige Fälle (2: je 0,5 für Fälle, 0,5 für den gemeinsamen Ansatz); zusätzliche Rolle des Stützpunkts erklärt (1).','Plane condition p3+u d3=0 and all three cases (2: 0.5 per case, 0.5 for the common setup); explains the position vector’s additional role (1).')],
cap_de='Begrenze die normale Gesamtpunktzahl auf 14 BE, wenn in der ganzen Abgabe entweder keine rechnerisch begründete Achsen-Lageuntersuchung oder keine rechnerisch begründete Koordinatenebenen-Lageuntersuchung vorkommt. Ebenfalls gilt die Kappung, wenn alle Lageaussagen ausschließlich aus Richtungskomponenten abgelesen werden, ohne irgendeine zugehörige Punkt- oder Stützpunktbedingung zu prüfen. Ein einzelner verfehlter Fall löst keine Kappung aus; eine knappe gültige Koordinatenbegründung zählt.',
cap_en='Cap the ordinary total at 14 if the whole submission contains either no algebraically justified axis-position investigation or no algebraically justified coordinate-plane investigation. Also apply the cap if every positional claim is inferred solely from direction components without checking any relevant point or position-vector condition. One mistaken case does not trigger the cap; concise valid coordinate reasoning counts.'))

FORMS.append(dict(id='bda6a659-9640-53a5-8be0-24705ab623ef',key='plane-angle-gap-option',
task_de=r'''# Den Schnittwinkel zweier Ebenen bestimmen

Gegeben sind die Ebenen
$$
E:\quad x+2y+2z=3
$$
und
$$
\begin{aligned}
F:\quad\vec x&=\begin{pmatrix}0\\1\\0\end{pmatrix}
+s\begin{pmatrix}1\\1\\0\end{pmatrix}\\
&\quad+t\begin{pmatrix}2\\0\\1\end{pmatrix},\qquad s,t\in\mathbb R.
\end{aligned}
$$
Gesucht ist jeweils der nichtstumpfe Winkel zwischen den unorientierten
Ebenen, also ein Winkel zwischen $0^\circ$ und $90^\circ$.
Zeige deine Rechnung und Begründung. Insgesamt: **20 BE**.

**1. Geeignete Normalen finden (6 BE)**

Bestimme je einen von null verschiedenen Normalenvektor von $E$ und
$F$. Begründe für $F$ rechnerisch, dass dein Vektor zu beiden
Spannrichtungen orthogonal ist. Das Lösen der beiden
Orthogonalitätsgleichungen ist ein möglicher Weg; ein Kreuzprodukt
wird nicht vorausgesetzt.

**2. Den Winkel berechnen (6 BE)**

Berechne den Schnittwinkel von $E$ und $F$. Gib einen exakten
trigonometrischen Ausdruck und einen Gradwert auf eine Nachkommastelle
an. Erkläre, wie du aus einem eventuell stumpfen Normalenwinkel den
verlangten Ebenenwinkel erhältst.

**3. Die Geometrie erklären (4 BE)**

Erkläre, weshalb geeignete Normalen zur Berechnung des Ebenenwinkels
dienen können. Beschreibe dazu einen ebenen Schnitt senkrecht zur
Schnittgeraden und die dort sichtbaren Richtungen. Eine beschriftete
eigene Skizze oder eine genaue sprachliche Erklärung ist möglich.
Eine Skizze ist kein zusätzliches Abgabeformat.

**4. Die Wahl der Normalen und einen Grenzfall prüfen (4 BE)**

Prüfe, ob dein Ergebnis gleich bleibt, wenn du die Normale von $F$
durch ihr negatives Doppeltes ersetzt. Begründe außerdem den Winkel
zwischen $E$ und $G:2x+4y+4z=10$. Erkläre dabei, ob die Ebenen $E$
und $G$ identisch sind und welche Bedeutung der Winkel $0^\circ$ hat.
''',
task_en=r'''# Determine the angle between two planes

The planes are
$$
E:\quad x+2y+2z=3
$$
and
$$
\begin{aligned}
F:\quad\vec x&=\begin{pmatrix}0\\1\\0\end{pmatrix}
+s\begin{pmatrix}1\\1\\0\end{pmatrix}\\
&\quad+t\begin{pmatrix}2\\0\\1\end{pmatrix},\qquad s,t\in\mathbb R.
\end{aligned}
$$
In each case find the nonobtuse angle between the unoriented planes,
from $0^\circ$ to $90^\circ$. Show calculations and reasons.
Total: **20 points**.

**1. Find suitable normals (6 points)**

Find a nonzero normal vector for each plane. For $F$, check algebraically
that your vector is orthogonal to both spanning directions. Solving
the two orthogonality equations is one possible method; no cross
product is required.

**2. Calculate the angle (6 points)**

Calculate the angle between $E$ and $F$. Give an exact trigonometric
expression and a value in degrees to one decimal place. Explain how
to obtain the required plane angle if your normal-vector angle is obtuse.

**3. Explain the geometry (4 points)**

Explain why suitable normal vectors can be used to calculate the plane
angle. Describe a planar cross-section perpendicular to the intersection
line and the directions visible there. You may give a labelled sketch
or a precise verbal explanation; no separate drawing submission is required.

**4. Check the choice of normals and a limiting case (4 points)**

Check that replacing the normal of $F$ by minus twice itself leaves
the result unchanged. Also justify the angle between $E$ and
$G:2x+4y+4z=10$. State whether $E$ and $G$ coincide and explain what
the angle $0^\circ$ means.
''',
solution_de=r'''# Musterlösung: Ebenenwinkel

**1.** Für $E$ eignet sich $\vec n=(1,2,2)^{\mathsf T}$.
Für $F$ muss $\vec m\cdot(1,1,0)^{\mathsf T}=0$ und
$\vec m\cdot(2,0,1)^{\mathsf T}=0$ gelten. Das ergibt
$m_1+m_2=0$ und $2m_1+m_3=0$. Wähle $m_1=1$, also
$\vec m=(1,-1,-2)^{\mathsf T}$. Beide Skalarprodukte sind null,
und $\vec m\ne\vec0$. Die zwei unabhängigen Spannrichtungen
bestimmen die Ebene, daher ist $\vec m$ eine Normale von $F$.
Jedes von null verschiedene Vielfache ist ebenso geeignet.

**2.** Es gilt $\vec n\cdot\vec m=-5$,
$\|\vec n\|=3$ und $\|\vec m\|=\sqrt6$.
Für den nichtstumpfen Ebenenwinkel folgt
$$
\cos\varphi=\frac{|\vec n\cdot\vec m|}{\|\vec n\|\|\vec m\|}
=\frac{5}{3\sqrt6},\qquad
\varphi=\arccos\!\left(\frac5{3\sqrt6}\right)\approx47{,}1^\circ.
$$
Ohne Betrag erhält man mit diesen Normalen den stumpfen Winkel
$132{,}9^\circ$. Die zugehörigen unorientierten Richtungen und Ebenen
werden durch den kleineren Ergänzungswinkel beschrieben:
$180^\circ-132{,}9^\circ\approx47{,}1^\circ$.

**3.** Die Normalen sind nicht parallel, also schneiden sich $E$ und
$F$ in einer Geraden. Eine dazu senkrechte Schnittebene zeigt zwei
sich schneidende Geraden als Spuren von $E$ und $F$.
Beide Normalenrichtungen liegen parallel zu dieser Schnittebene und
stehen dort jeweils senkrecht auf der zugehörigen Spur.
Das gemeinsame Drehen beider Spurrichtungen um $90^\circ$ verändert
ihren kleineren Winkel nicht. Deshalb stimmt der kleinere Winkel der
Normalenrichtungen mit dem Schnittwinkel der Ebenen überein.
Eine passende genaue Skizze kann diese Begründung ausdrücken.

**4.** Für $\vec m'=-2\vec m$ gilt
$$
\frac{|\vec n\cdot\vec m'|}{\|\vec n\|\|\vec m'\|}
=\frac{2|\vec n\cdot\vec m|}{2\|\vec n\|\|\vec m\|}
=\frac5{3\sqrt6}.
$$
Orientierung und Länge der gewählten Normale ändern den Ebenenwinkel
also nicht. $G$ hat eine zu $E$ parallele Normale, aber nach Division
durch $2$ die Gleichung $x+2y+2z=5$ statt $3$. Die Ebenen sind echt
parallel, nicht identisch, und ihr Richtungswinkel ist $0^\circ$.
Dieser Winkel allein sagt nicht aus, dass die Punktmengen identisch sind;
hier gibt es keine gemeinsame Schnittgerade.
''',
solution_en=r'''# Worked solution: angle between planes

**1.** For $E$, use $\vec n=(1,2,2)^{\mathsf T}$.
For $F$, require $\vec m\cdot(1,1,0)^{\mathsf T}=0$ and
$\vec m\cdot(2,0,1)^{\mathsf T}=0$, giving $m_1+m_2=0$ and
$2m_1+m_3=0$. Set $m_1=1$ to obtain $\vec m=(1,-1,-2)^{\mathsf T}$.
Both dot products vanish and the vector is nonzero. The independent
spanning directions determine the plane, so this is a normal to $F$.
Any nonzero scalar multiple is equally suitable.

**2.** We have $\vec n\cdot\vec m=-5$, $\|\vec n\|=3$ and
$\|\vec m\|=\sqrt6$. The nonobtuse plane angle satisfies
$$
\cos\varphi=\frac{|\vec n\cdot\vec m|}{\|\vec n\|\|\vec m\|}
=\frac5{3\sqrt6},\qquad
\varphi=\arccos\!\left(\frac5{3\sqrt6}\right)\approx47.1^\circ.
$$
Without the absolute value, these normals give the obtuse angle
$132.9^\circ$. The unoriented normal directions and planes use the
smaller supplementary angle, $180^\circ-132.9^\circ\approx47.1^\circ$.

**3.** The normals are nonparallel, so $E$ and $F$ meet in a line.
A cross-section perpendicular to that line shows two intersecting
trace lines from $E$ and $F$. Both normal directions are parallel to
this cross-section, each perpendicular to its own trace line.
Rotating both trace directions through $90^\circ$ preserves their
smaller angle. Thus the smaller angle between normal directions equals
the plane angle. A precise suitable sketch can express this argument.

**4.** For $\vec m'=-2\vec m$,
$$
\frac{|\vec n\cdot\vec m'|}{\|\vec n\|\|\vec m'\|}
=\frac{2|\vec n\cdot\vec m|}{2\|\vec n\|\|\vec m\|}
=\frac5{3\sqrt6}.
$$
Thus changing a normal’s orientation or length does not change the
plane angle. $G$ has a normal parallel to that of $E$, but division by
$2$ gives $x+2y+2z=5$, rather than $3$. The planes are distinct and
parallel, not identical, and their directional angle is $0^\circ$.
This angle alone does not imply identical point sets; here there is
no common intersection line.
''',
steps=[('normals',6,'Geeignete Normale von E (1); beide Orthogonalitätsbedingungen für F (2); eine richtige von null verschiedene Lösung (1); beide Proben (je 1).','Suitable E normal (1); both F orthogonality equations (2); a correct nonzero solution (1); both checks (1 each).'),('angle',6,'Skalarprodukt (1); beide Normen (1 zusammen); geeigneter orientierungsunabhängiger Kosinusansatz (2); exakter Ausdruck (1); Gradwert bzw. richtiger nichtstumpfer Ergänzungswinkel (1).','Dot product (1); both norms (1 together); suitable orientation-independent cosine setup (2); exact expression (1); degree value or correct nonobtuse supplementary angle (1).'),('meaning',4,'Schnitt senkrecht zur Schnittgeraden und beide Ebenenspuren beschrieben (2); Normalen dort als Senkrechte zu den Spuren verortet (1); Gleichheit der kleineren Winkel durch gemeinsame 90°-Drehung oder gleichwertig begründet (1).','Describes a perpendicular cross-section and both plane traces (2); locates normals perpendicular to their traces in that section (1); justifies equality of smaller angles by a common 90° rotation or equivalent reasoning (1).'),('checks',4,'Unveränderter Quotient bei negativem Skalieren rechnerisch begründet (2); bei G proportionale Normalen und Winkel 0° (1); unterschiedliche rechte Seiten und deshalb echte Parallelität statt Identität erklärt (1).','Algebraically justifies invariance under negative scaling (2); proportional normals for G and angle 0° (1); explains different constants and hence distinct parallel planes rather than identity (1).')],
cap_de='Begrenze die normale Gesamtpunktzahl auf 14 BE, wenn über die ganze Abgabe keine tragfähige Berechnung des nichtstumpfen Winkels über geeignete Ebenennormalen vorliegt oder jede geometrische Deutung dieses Winkels als Ebenenwinkel vollständig fehlt. Eine knappe korrekte Schnitt-/Senkrechtenbegründung zählt; eine vorgeschriebene Skizze oder Formulierung gibt es nicht. Ein lokaler Rechenfehler in einer sonst tragfähigen Winkelrechnung löst die Kappung nicht aus.',
cap_en='Cap the ordinary total at 14 if the whole submission contains no sound calculation of the nonobtuse angle using suitable plane normals, or no geometric interpretation at all of that angle as the angle between planes. Concise correct cross-section/perpendicular reasoning counts; no particular sketch or wording is prescribed. A local arithmetic slip in an otherwise sound angle calculation does not trigger the cap.'))

FORMS.append(dict(id='5f90df42-8a71-534d-b995-b8f7dcaf1661',key='parameter-line-plane-angles',
task_de=r'''# Winkel in einer räumlichen Parametersituation

Für jedes $a\in\mathbb R$ seien gegeben:
$$
F:\ y+z=0,\qquad E_a:\ ax+y=1,
$$
$$
g_a:\quad\vec x=\begin{pmatrix}0\\0\\1\end{pmatrix}
+t\begin{pmatrix}1\\0\\a\end{pmatrix},\qquad t\in\mathbb R.
$$
Mit $\alpha_a$ wird der nichtstumpfe Winkel zwischen $g_a$ und $F$
bezeichnet, mit $\beta_a$ der nichtstumpfe Winkel zwischen $E_a$ und
$F$. Beide Winkel liegen zwischen $0^\circ$ und $90^\circ$.
Zeige deine Ansätze und die vollständigen Parameterrechnungen.
Insgesamt: **20 BE**.

**1. Die Konfiguration vorbereiten (3 BE)**

Gib geeignete Normalen und den Geradenrichtungsvektor an. Begründe,
warum für jedes reelle $a$ eine echte Ebene $E_a$ und eine echte
Gerade $g_a$ vorliegen. Unterscheide die Rollen von $a$ und $t$.

**2. Den Gerade–Ebene-Winkel untersuchen (6 BE)**

Leite einen Ausdruck für $\sin\alpha_a$ her. Bestimme daraus **alle**
Werte von $a$, für die $\alpha_a=30^\circ$ gilt. Prüfe die gefundenen
Werte in der ursprünglichen Winkelbedingung. Einzelne ausprobierte
Parameterwerte ersetzen die Herleitung nicht.

**3. Den Ebene–Ebene-Winkel untersuchen (6 BE)**

Leite einen Ausdruck für $\cos\beta_a$ her und bestimme **alle** Werte
von $a$, für die $\beta_a=60^\circ$ gilt. Prüfe dein Ergebnis und
erkläre, weshalb hier der Winkel zwischen den Normalenrichtungen
verwendet werden kann.

**4. Eine Lagebedingung klären (2 BE)**

Untersuche $g_0$ relativ zu $F$. Erkläre anhand von Richtung und
Stützpunkt, ob die Gerade in der Ebene liegt, echt parallel zu ihr
ist oder sie in genau einem Punkt schneidet.

**5. Eine Winkelbehauptung prüfen (3 BE)**

Eine Person behauptet: „$\alpha_a+\beta_a=90^\circ$ gilt für alle
$a$, weil die eine Rechnung einen Sinus und die andere einen Kosinus
verwendet.“ Bestimme rechnerisch, für welche $a$ die Gleichheit
wirklich gilt, und deute das Ergebnis.
''',
task_en=r'''# Angles in a spatial configuration with a parameter

For every $a\in\mathbb R$, let
$$
F:\ y+z=0,\qquad E_a:\ ax+y=1,
$$
$$
g_a:\quad\vec x=\begin{pmatrix}0\\0\\1\end{pmatrix}
+t\begin{pmatrix}1\\0\\a\end{pmatrix},\qquad t\in\mathbb R.
$$
Let $\alpha_a$ be the nonobtuse angle between $g_a$ and $F$, and
$\beta_a$ the nonobtuse angle between $E_a$ and $F$. Both angles lie
between $0^\circ$ and $90^\circ$. Show setups and complete parameter
calculations. Total: **20 points**.

**1. Prepare the configuration (3 points)**

Give suitable normal vectors and the line direction. Explain why
$E_a$ is a genuine plane and $g_a$ a genuine line for every real $a$.
Distinguish the roles of $a$ and $t$.

**2. Investigate the line–plane angle (6 points)**

Derive an expression for $\sin\alpha_a$. Use it to find **every** value
of $a$ for which $\alpha_a=30^\circ$. Check the solutions in the
original angle condition. Trying a few values does not replace derivation.

**3. Investigate the plane–plane angle (6 points)**

Derive an expression for $\cos\beta_a$. Find **every** value of $a$
for which $\beta_a=60^\circ$. Check the result and explain why the
angle between normal directions can be used here.

**4. Resolve a positional condition (2 points)**

Investigate $g_0$ relative to $F$. Use its direction and position vector
to decide whether it is contained in the plane, is strictly parallel
to it, or meets it in exactly one point.

**5. Assess an angle claim (3 points)**

Someone claims: “$\alpha_a+\beta_a=90^\circ$ for every $a$, because
one calculation uses a sine and the other a cosine.” Determine
algebraically exactly when this equality holds, and interpret the result.
''',
solution_de=r'''# Musterlösung: Parameterwinkel

**1.** Geeignet sind $\vec n_F=(0,1,1)^{\mathsf T}$,
$\vec n_a=(a,1,0)^{\mathsf T}$ und $\vec u_a=(1,0,a)^{\mathsf T}$.
Wegen der festen Komponenten $1$ sind die beiden letzten Vektoren
für kein $a$ null. Die Ebenen- und Geradengleichungen sind daher für
alle reellen $a$ zulässig. $a$ wählt eine Konfiguration; nach dieser
Wahl durchläuft $t$ die Punkte auf der einen Geraden $g_a$.

**2.** Mit $\vec u_a\cdot\vec n_F=a$,
$\|\vec u_a\|=\sqrt{1+a^2}$ und $\|\vec n_F\|=\sqrt2$ gilt
$$
\sin\alpha_a=\frac{|a|}{\sqrt2\sqrt{1+a^2}}.
$$
Für $\alpha_a=30^\circ$ ist der Quotient $1/2$. Beide Seiten sind
nichtnegativ, der Nenner ist immer positiv; Quadrieren ist hier
äquivalent. Es folgt
$$
\frac{a^2}{2(1+a^2)}=\frac14
\quad\Longleftrightarrow\quad a^2=1.
$$
Also $a=-1$ oder $a=1$. Beide liefern im ursprünglichen Quotienten
$1/(\sqrt2\sqrt2)=1/2$, also tatsächlich den nichtstumpfen Winkel
$30^\circ$. Die äquivalenten Umformungen schließen weitere Lösungen aus.

**3.** $\vec n_a\cdot\vec n_F=1$ und
$\|\vec n_a\|=\sqrt{1+a^2}$, daher
$$
\cos\beta_a=\frac1{\sqrt2\sqrt{1+a^2}}.
$$
Der Betrag des Skalarprodukts ändert hier die $1$ nicht. Im Schnitt
senkrecht zur Schnittgeraden stehen beide Normalenrichtungen senkrecht
auf ihren jeweiligen Ebenenspuren; die kleineren Winkel sind deshalb
gleich. Die Normalen können für kein $a$ parallel sein, da ihre
dritten Komponenten $0$ und $1$ sind und die zweite jeweils $1$ ist;
es liegt somit tatsächlich eine Schnittkonfiguration vor.

Für $\beta_a=60^\circ$ ist der Quotient $1/2$. Wegen positiver
Seiten gilt äquivalent
$$
\frac1{2(1+a^2)}=\frac14
\quad\Longleftrightarrow\quad a^2=1.
$$
Wieder ist $a=\pm1$. Beide liefern den ursprünglichen Kosinus $1/2$
und damit $\beta_a=60^\circ$; es gibt keine weiteren Lösungen.

**4.** $g_0$ hat Richtung $(1,0,0)^{\mathsf T}$ und $y+z=1$
für jeden seiner Punkte. Seine Richtung ist orthogonal zu $\vec n_F$,
also parallel zur Ebene. Sein Stützpunkt liegt nicht in $F$; folglich
ist die Gerade echt parallel und nicht in $F$ enthalten.

**5.** Weil beide Winkel nichtstumpf sind, ist
$\alpha_a+\beta_a=90^\circ$ genau dann erfüllt, wenn
$\sin\alpha_a=\cos\beta_a$. Mit dem gemeinsamen positiven Nenner
folgt $|a|=1$, also genau $a=\pm1$. Dort sind die Winkel tatsächlich
$30^\circ$ und $60^\circ$. Zum Beispiel ist für $a=0$ hingegen
$\alpha_0=0^\circ$, $\beta_0=45^\circ$. Verschiedene Richtungen bzw.
Normalen in den zwei Formeln begründen keine allgemeine
Ergänzungswinkelbeziehung.
''',
solution_en=r'''# Worked solution: parameter-dependent angles

**1.** Use $\vec n_F=(0,1,1)^{\mathsf T}$,
$\vec n_a=(a,1,0)^{\mathsf T}$ and $\vec u_a=(1,0,a)^{\mathsf T}$.
Their fixed components $1$ keep the latter two vectors nonzero, so the
plane and line are defined for every real $a$. Choosing $a$ selects a
configuration; afterwards $t$ runs through the points of that one line.

**2.** We have $\vec u_a\cdot\vec n_F=a$,
$\|\vec u_a\|=\sqrt{1+a^2}$ and $\|\vec n_F\|=\sqrt2$, hence
$$
\sin\alpha_a=\frac{|a|}{\sqrt2\sqrt{1+a^2}}.
$$
For $\alpha_a=30^\circ$ this equals $1/2$. Both sides are nonnegative
and the denominator is positive, so squaring is equivalent:
$$
\frac{a^2}{2(1+a^2)}=\frac14
\quad\Longleftrightarrow\quad a^2=1.
$$
Thus $a=-1$ or $1$. In the original quotient, both give
$1/(\sqrt2\sqrt2)=1/2$, hence the required nonobtuse angle $30^\circ$.
Equivalent transformations exclude further solutions.

**3.** Since $\vec n_a\cdot\vec n_F=1$ and
$\|\vec n_a\|=\sqrt{1+a^2}$,
$$
\cos\beta_a=\frac1{\sqrt2\sqrt{1+a^2}}.
$$
The absolute value does not change the dot product $1$ here. In a
cross-section perpendicular to the intersection line, the normals are
perpendicular to their respective plane traces, so their smaller angle
equals the plane angle. The normals can never be parallel: their third
components are $0$ and $1$, while both second components are $1$.
Thus the planes really do intersect for every $a$.

For $\beta_a=60^\circ$, set the quotient to $1/2$. Positivity makes
squaring equivalent:
$$
\frac1{2(1+a^2)}=\frac14
\quad\Longleftrightarrow\quad a^2=1.
$$
Again $a=\pm1$, both giving the original cosine $1/2$ and hence
$\beta_a=60^\circ$. There are no other solutions.

**4.** $g_0$ has direction $(1,0,0)^{\mathsf T}$ and satisfies
$y+z=1$ at every point. Its direction is perpendicular to $\vec n_F$
and thus parallel to $F$, but its position point is outside $F$.
The line is distinct and parallel to the plane, rather than contained in it.

**5.** For two nonobtuse angles,
$\alpha_a+\beta_a=90^\circ$ is equivalent to
$\sin\alpha_a=\cos\beta_a$. Their positive common denominator gives
$|a|=1$, so exactly $a=\pm1$. The angles are then $30^\circ$ and
$60^\circ$. At $a=0$, for example, the angles instead are $0^\circ$
and $45^\circ$. Using sine and cosine with different geometric
vectors does not create a universal complementary-angle relationship.
''',
steps=[('prepare',3,'Beide Normalen und Geradenrichtung richtig (1 zusammen); Zulässigkeit für alle a aus nicht verschwindenden Vektoren (1); Rollen a/t unterschieden (1).','Both normals and line direction correct (1 together); justifies validity for all a with nonzero vectors (1); distinguishes roles of a and t (1).'),('line-angle',6,'Gerade–Ebene-Sinus aus Skalarprodukt und Normen hergeleitet (2); vollständige Gleichung für 30° und äquivalentes Quadrieren (1); beide Parameterwerte und Vollständigkeit (2); Probe im ursprünglichen Quotienten (1).','Derives line–plane sine from dot product and norms (2); equation for 30° and equivalent squaring (1); both parameter values and completeness (2); checks original quotient (1).'),('plane-angle',6,'Ebene–Ebene-Kosinus aus geeigneten Normalen hergeleitet (2); Gleichung für 60° korrekt gelöst (2); beide Werte im ursprünglichen Quotienten geprüft (1); Normalenwinkel geometrisch auf Ebenenwinkel bezogen (1).','Derives plane–plane cosine using suitable normals (2); correctly solves 60° condition (2); checks both values in original quotient (1); geometrically relates normal angle to plane angle (1).'),('position',2,'Parallele Richtung begründet (1); Stützpunkt außerhalb und echte Parallelität statt Enthaltensein begründet (1).','Justifies parallel direction (1); uses outside position point to justify strict parallelism rather than containment (1).'),('claim',3,'Ergänzungsbedingung auf Gleichheit der Quotienten zurückgeführt (1); genau |a|=1 hergeleitet (1); nur dort gültige Winkelbeziehung gedeutet, z. B. mit Gegenbeispiel a=0 (1).','Reduces complementary-angle condition to equality of quotients (1); derives exactly |a|=1 (1); interprets the restricted validity, e.g. with counterexample a=0 (1).')],
cap_de='Begrenze die normale Gesamtpunktzahl auf 14 BE, wenn die ganze Abgabe keine parameterabhängige Winkeluntersuchung für eine der beiden beschriebenen Konfigurationsarten enthält, alle Parameterwerte ausschließlich durch Ausprobieren statt aus einer Winkel-/Lagebedingung gewonnen werden oder jede geometrische Deutung der verwendeten Winkel bzw. der untersuchten Lage vollständig fehlt. Die ODER-Liste möglicher Bedingungsarten im ursprünglichen Kompetenztext verlangt nicht, dass alle Winkel-, Orthogonalitäts-, Parallelitäts- und Lagevarianten als getrennte Teilprüfungen bestanden werden. Hier gibt es einen Gesamtpass für die konkret gestellten Aufgaben. Eine knappe allgemeine Herleitung zählt; lokale Rechenfehler lösen keine Kappung aus.',
cap_en='Cap the ordinary total at 14 if the whole submission contains no parameter-dependent angle investigation for one of the two stated configuration types, all parameter values are obtained solely by trial rather than derived from an angle/position condition, or every geometric interpretation of the angles used or the position investigated is absent. The OR-list of possible condition types in the original competency does not require separate passes for every angle, orthogonality, parallelism and positional variant. This form has one overall pass for the actual tasks set. Concise general derivations count; local arithmetic errors do not trigger the cap.'))

FORMS.append(dict(id='eb112b6f-4cc4-58af-975a-f1ea61b727f0',key='parameter-parabola-flight',
task_de=r'''# Eine Ballbahn durch einen Parameter beschreiben

Ein Ball wird in einem räumlichen Modell bei $S(1\mid-2\mid2)$
abgeworfen und nach genau $3\,\mathrm s$ gefangen. Alle Koordinaten
werden in Metern gemessen; $z$ ist die Höhe. Während dieses Abschnitts
sind die waagerechten Geschwindigkeitskomponenten konstant:
$4\,\mathrm{m/s}$ in $x$- und $3\,\mathrm{m/s}$ in $y$-Richtung.
Die Höhenänderung gegenüber $S$ wird im vereinfachten Modell für die
seit dem Abwurf verstrichene Zeit $t$ in Sekunden durch
$6t-2t^2$ Meter beschrieben. Luftwiderstand und weitere Einflüsse
werden im Modell nicht berücksichtigt. Es geht um diesen Abschnitt
bis zum Fangen, nicht um eine Fortsetzung nach dem Fang.

Zeige deine Ansätze und deute die Parameter. Insgesamt: **20 BE**.

**1. Eine räumliche Parameterdarstellung aufstellen (6 BE)**

Stelle eine Vektorgleichung $\vec x(t)$ für die Ballbahn auf und gib
den zur Situation passenden Parameterbereich an. Erkläre die
Bedeutung von $t$, des Anfangsvektors, der beiden waagerechten
Koeffizienten und des quadratischen Höhenterms.

**2. Besondere Orte der Bewegung bestimmen (5 BE)**

Bestimme die Ballposition nach einer Sekunde und den Fangpunkt.
Bestimme außerdem Zeitpunkt, Höhe und räumliche Position des höchsten
Punkts innerhalb des betrachteten Abschnitts. Du darfst dazu die
Identität
$$
2+6t-2t^2=\frac{13}{2}-2\left(t-\frac32\right)^2
$$
verwenden; Ableitungen werden nicht benötigt.

**3. Die geometrische Bahn erklären (5 BE)**

Eliminiere $t$ mithilfe der $x$-Koordinate. Gib den Zusammenhang von
$y$ mit $x$ und die Höhe $z$ als quadratische Funktion von $x$ an,
einschließlich des passenden $x$-Bereichs. Erkläre daraus, warum die
räumliche Bahn in einer vertikalen Ebene liegt und dort ein
Parabelbogen ist. Nur die Auflistung einiger Bahnpunkte genügt nicht.

**4. Einen anderen Laufparameter verwenden (4 BE)**

Setze $u=2t$. Gib eine Parameterdarstellung mit $u$ und den passenden
Parameterbereich an. Prüfe an einem Beispiel, dass beide
Darstellungen denselben Bahnpunkt beschreiben. Erkläre, ob die neuen
waagerechten Koeffizienten bedeuten, dass sich die tatsächlichen
Geschwindigkeitskomponenten des modellierten Balls halbiert haben.
''',
task_en=r'''# Describe a ball trajectory with a parameter

In a spatial model a ball is released at $S=(1,-2,2)$ and caught
exactly $3\,\mathrm s$ later. Coordinates are in metres and $z$
is height. During this interval the horizontal velocity components
are constant: $4\,\mathrm{m/s}$ in the $x$ direction and
$3\,\mathrm{m/s}$ in the $y$ direction. For elapsed time $t$ in
seconds, the height change from $S$ is modelled by $6t-2t^2$ metres.
The simplified model ignores air resistance and other influences.
Consider only the interval ending at the catch, with no continuation
afterwards.

Show your setups and interpret the parameters. Total: **20 points**.

**1. Construct a spatial parameterisation (6 points)**

Construct a vector equation $\vec x(t)$ for the trajectory and give
the parameter domain appropriate to the situation. Interpret $t$,
the starting vector, the two horizontal coefficients and the quadratic
height term.

**2. Find special positions (5 points)**

Find the position after one second and the catch point. Also find
the time, height and spatial position of the highest point during
this interval. You may use
$$
2+6t-2t^2=\frac{13}{2}-2\left(t-\frac32\right)^2;
$$
no differentiation is required.

**3. Explain the geometric path (5 points)**

Eliminate $t$ using the $x$ coordinate. Give $y$ in terms of $x$ and
$z$ as a quadratic function of $x$, including the appropriate $x$
domain. Explain why the spatial path lies in a vertical plane and is
a parabolic arc there. A list of a few trajectory points is insufficient.

**4. Use another running parameter (4 points)**

Set $u=2t$. Give the resulting parameterisation and its domain.
Check at one example that both parameterisations describe the same
trajectory point. Explain whether the new horizontal coefficients
mean that the ball’s actual modelled horizontal velocities have halved.
''',
solution_de=r'''# Musterlösung: Parabelbahn

**1.** Die gesuchte Darstellung lautet
$$
\vec x(t)=\begin{pmatrix}1+4t\\-2+3t\\2+6t-2t^2\end{pmatrix},
\qquad 0\le t\le3.
$$
$t$ ist die seit dem Abwurf verstrichene Zeit in Sekunden.
$\vec x(0)=(1,-2,2)^{\mathsf T}$ ist der Anfangsort.
$4$ und $3$ sind die konstanten waagerechten Geschwindigkeitskomponenten
in Metern pro Sekunde. $6t-2t^2$ ist die zeitabhängige Höhenänderung:
Der negative quadratische Anteil senkt die Bahn gegenüber dem
anfänglichen linearen Anstieg zunehmend ab. Er ist kein konstanter
Geschwindigkeitsvektor. Im angegebenen vereinfachten Modell ist die
geometrische Bahn ein Parabelbogen; es wird kein Anspruch auf eine
exakte reale Flugbahn erhoben.

**2.** Nach $1\,\mathrm s$ ist der Ball bei $P(5\mid1\mid6)$,
nach $3\,\mathrm s$ beim Fangpunkt $C(13\mid7\mid2)$.
Aus der gegebenen Scheitelform folgt die größte Höhe $13/2=6{,}5$
bei $t=3/2$, weil der abgezogene quadratische Ausdruck genau dort
null und sonst nichtnegativ ist. Dieser Zeitpunkt liegt im Intervall.
Der räumliche höchste Punkt ist
$$
H\left(7\,\middle|\,\frac52\,\middle|\,\frac{13}{2}\right).
$$
Die Höhe ist eine $z$-Koordinate, nicht die Länge des zurückgelegten Wegs.

**3.** Aus $x=1+4t$ folgt $t=(x-1)/4$.
$$
y=-2+\frac34(x-1),
$$
$$
z=2+\frac32(x-1)-\frac18(x-1)^2,\qquad 1\le x\le13.
$$
Die Gleichung $y=-2+3(x-1)/4$ ist unabhängig von $z$ und beschreibt
eine vertikale Ebene. In dieser Ebene bewegt sich der Ball horizontal
längs einer festen Richtung. Die waagerechte Entfernung $q$ vom
Anfangsort in Bewegungsrichtung ist $q=5t$ mit $0\le q\le15$,
weil $\sqrt{4^2+3^2}=5$. Daher gilt in orthogonalen Koordinaten dieser
vertikalen Ebene
$$
z=2+\frac65q-\frac2{25}q^2.
$$
Der von null verschiedene quadratische Koeffizient zeigt den
Parabelbogen. Die Erklärung über $q$ macht ausdrücklich sichtbar,
dass es eine Parabel in einer räumlichen Ebene ist, nicht nur ein
quadratischer Zusammenhang in einer Projektion. Eine gleichwertige
Erklärung über die lineare Skalierung der horizontalen Koordinate zählt.

**4.** Mit $t=u/2$ folgt
$$
\vec x(u)=\begin{pmatrix}1+2u\\-2+\frac32u\\2+3u-\frac12u^2\end{pmatrix},
\qquad0\le u\le6.
$$
Zum Beispiel entspricht $u=2$ genau $t=1$; beide liefern $P(5\mid1\mid6)$.
Die Parameterintervalle entsprechen einander eindeutig, daher ist die
ganze Punktmenge gleich. Der neue Parameter zählt doppelt so schnell
wie der Zahlenwert der Zeit in Sekunden. Die Koeffizienten $2$ und
$3/2$ sind Änderungen pro Einheit $u$, nicht pro Sekunde. Der Ball hat
im selben Modell weiterhin $4$ und $3\,\mathrm{m/s}$ als waagerechte
Geschwindigkeitskomponenten; es wurde nur umparametrisiert.
''',
solution_en=r'''# Worked solution: parabolic trajectory

**1.** The parameterisation is
$$
\vec x(t)=\begin{pmatrix}1+4t\\-2+3t\\2+6t-2t^2\end{pmatrix},
\qquad0\le t\le3.
$$
$t$ is elapsed time in seconds, and $\vec x(0)=(1,-2,2)^{\mathsf T}$
is the starting position. The coefficients $4$ and $3$ are constant
horizontal velocities in metres per second. The height change is
$6t-2t^2$: its negative quadratic term increasingly lowers the ball
relative to the initial linear rise. It is not a constant velocity
vector. This simplified model gives a parabolic arc without claiming
an exact real flight path.

**2.** At $1\,\mathrm s$ the ball is at $P=(5,1,6)$; at
$3\,\mathrm s$ the catch point is $C=(13,7,2)$.
The given completed square shows a maximum height of $13/2=6.5$
at $t=3/2$: the subtracted squared expression is zero there and
nonnegative elsewhere. This time is inside the interval.
The highest spatial point is $H=(7,5/2,13/2)$. Height is its $z$
coordinate, rather than the distance travelled along the path.

**3.** From $x=1+4t$, $t=(x-1)/4$, hence
$$
y=-2+\frac34(x-1),
$$
$$
z=2+\frac32(x-1)-\frac18(x-1)^2,\qquad1\le x\le13.
$$
The $y$ relation is independent of $z$ and defines a vertical plane.
Within that plane the ball travels horizontally in one fixed direction.
Its horizontal distance $q$ from the starting position is $q=5t$,
$0\le q\le15$, since $\sqrt{4^2+3^2}=5$. In orthogonal coordinates
of that vertical plane,
$$
z=2+\frac65q-\frac2{25}q^2.
$$
The nonzero quadratic coefficient establishes a parabolic arc. Using
$q$ explicitly shows a parabola in the spatial plane, rather than only
a quadratic relation in a projection. Equivalent reasoning using the
linear scaling of the horizontal coordinate is valid.

**4.** Substituting $t=u/2$ gives
$$
\vec x(u)=\begin{pmatrix}1+2u\\-2+\frac32u\\2+3u-\frac12u^2\end{pmatrix},
\qquad0\le u\le6.
$$
For example $u=2$ corresponds to $t=1$, and both give $P=(5,1,6)$.
The parameter intervals correspond bijectively, giving the same entire
point set. The new parameter runs twice as fast as the numerical time
in seconds. The coefficients $2$ and $3/2$ are changes per unit of $u$,
rather than per second. The physical horizontal velocities in the same
model remain $4$ and $3\,\mathrm{m/s}$; only the parameter has changed.
''',
steps=[('model',6,'Alle drei Koordinaten korrekt zu einer räumlichen Parameterdarstellung verbunden (3, je Koordinate 1); Zeitbereich [0,3] (1); Zeit/Anfangsort und waagerechte Koeffizienten gedeutet (1); negativer quadratischer Höhenterm passend zur Bewegung erklärt (1).','Combines all three coordinates into a spatial parameterisation (3, 1 per coordinate); time domain [0,3] (1); interprets time/start and horizontal coefficients (1); explains the negative quadratic height term in the motion (1).'),('positions',5,'Position nach 1 s (1); Fangpunkt (1); höchster Zeitpunkt innerhalb des Intervalls aus Scheitelform begründet (1); Höhe (1); beide übrigen Raumkoordinaten des höchsten Punkts (1 zusammen).','Position at 1 s (1); catch point (1); justifies maximum time inside the interval using the square form (1); height (1); remaining spatial coordinates of the highest point (1 together).'),('eliminate',5,'t=(x−1)/4 gewonnen und y-Beziehung richtig (1); z(x) richtig (1); Bereich 1≤x≤13 (1); vertikale Ebene erklärt (1); Parabel in dieser Ebene aus nicht verschwindendem quadratischem Term und linearer horizontaler Koordinate begründet (1).','Obtains t=(x−1)/4 and correct y relation (1); correct z(x) (1); domain 1≤x≤13 (1); explains vertical plane (1); justifies the parabola in it using a nonzero quadratic term and a linear horizontal coordinate (1).'),('reparameterise',4,'Neue vollständige Vektordarstellung (1); u-Bereich [0,6] (1); korrespondierendes Zahlenbeispiel richtig geprüft (1); Parameteränderung von unveränderten Geschwindigkeiten pro Sekunde unterschieden (1).','Complete new vector parameterisation (1); u domain [0,6] (1); checks a corresponding numerical example (1); distinguishes changed parameter from unchanged velocities per second (1).')],
cap_de='Begrenze die normale Gesamtpunktzahl auf 14 BE, wenn in der ganzen Abgabe keine tragfähige räumliche Parameterdarstellung mit einer tatsächlich quadratischen Höhenkomponente vorliegt oder jede Deutung des Parameters in Bezug auf den zeitlichen Bewegungskontext vollständig fehlt. Bloß einzelne Punkte oder eine reine Ortskurve z(x) ohne Parameterdarstellung ersetzen die Kernleistung nicht. Eine knappe gültige Darstellung und Deutung zählt. Ein lokaler Koeffizienten-, Einsetz- oder Übertragungsfehler bei erkennbarem quadratischem Modell löst keine Kappung aus.',
cap_en='Cap the ordinary total at 14 if the whole submission contains no sound spatial parameterisation with a genuinely quadratic height component, or no interpretation at all of the parameter in the temporal motion context. Isolated points or a parameter-free locus z(x) alone do not replace that core action. Concise valid parameterisation and interpretation count. A local coefficient, substitution or copying error in a recognisable quadratic model does not trigger the cap.'))

GENERAL_DE=r'''## Eine Gesamtbewertung

Es gibt genau eine Gesamtpunktzahl aus **20 BE** und genau ein binäres
Gesamtergebnis: **bestanden ab 15 BE**, sonst nicht bestanden.
Die Teilpunkte sind keine eigenen Bestehensgrenzen und erzeugen keine
Teilmasterys oder Mastery für vorausgesetzte Lernziele.

Bewerte nachvollziehbare mathematische Leistungen unabhängig davon, in
welchem Aufgabenteil sie stehen. Gleichwertige Verfahren und
Darstellungen erhalten denselben Kredit; dieselbe Leistung zählt nur
einmal. Teilpunkte wie angegeben, sonst 0,5 BE für eine sinnvolle,
aber unvollständige Teilleistung. Ein lokaler Rechen- oder
Übertragungsfehler wird nicht mehrfach bestraft; nachvollziehbare
richtige Folgearbeit behält ihren Kredit. Knappe korrekte Begründungen
zählen; weder bestimmte Schlüsselwörter noch eine bestimmte
Reihenfolge sind vorgeschrieben.
'''
GENERAL_EN=r'''## One overall assessment

There is one total score out of **20 points** and one binary overall
result: **pass at 15 points or more**, otherwise not passed.
Part scores have no separate pass thresholds and create no partial
mastery or mastery of prerequisite goals.

Credit traceable mathematical work wherever it occurs. Equivalent
methods and representations receive equal credit; count the same
performance once. Award partial credit as specified, otherwise 0.5
points for meaningful but incomplete work. Do not repeatedly penalise
one local arithmetic or copying error; credit correct traceable
follow-through. Concise correct explanations count, with no prescribed
keywords or order.
'''
forms=[]
for f in FORMS:
 assert sum(s[1]for s in f['steps'])==20
 out=H/f['id'];out.mkdir(exist_ok=True)
 de=GENERAL_DE+'\n| Kriterium | BE |\n|---|---:|\n'+'\n'.join('| '+s[2].replace('|',r'\|')+' | '+str(s[1])+' |'for s in f['steps'])+'\n\n'+f['cap_de']+'\n\nMehrere Kappungsgründe ergeben dieselbe Obergrenze von 14 BE. Es bleibt bei einem Gesamtpass ohne weitere Teilbestehensbedingungen.\n'
 en=GENERAL_EN+'\n| Criterion | Points |\n|---|---:|\n'+'\n'.join('| '+s[3].replace('|',r'\|')+' | '+str(s[1])+' |'for s in f['steps'])+'\n\n'+f['cap_en']+'\n\nMultiple cap reasons give the same upper limit of 14 points. There is one overall pass without additional part-pass conditions.\n'
 for name,content in [('task.de.md',f['task_de']),('task.en.md',f['task_en']),('solution.de.md',f['solution_de']+'\n\n'+de),('solution.en.md',f['solution_en']+'\n\n'+en),('rubric.de.md',de),('rubric.en.md',en)]:
  (out/name).write_text(content.rstrip()+'\n')
 exam={'taskContent':f['task_de'].rstrip()+'\n','taskContentEn':f['task_en'].rstrip()+'\n','solutionContent':f['solution_de'].rstrip()+'\n\n'+de,'solutionContentEn':f['solution_en'].rstrip()+'\n\n'+en,'coveredGoalIds':[f['id']],'scoring':{'maxPoints':20,'passingPoints':15,'steps':[{'id':s[0],'points':s[1],'description':s[2],'descriptionEn':s[3]}for s in f['steps']]}}
 draft={'status':'CONTENT_ONLY_ORIGINAL_WHOLE_FORM_PENDING_GENUINE_INDEPENDENT_REVIEW','originalCompetencyId':f['id'],'newAssessmentIdAssigned':False,'canonicalRoleActivated':False,'scopeActivated':False,'preparationIsNotCoverage':True,'prerequisiteMasteryCertified':False,'binaryOverallResultOnly':True,'examDataContent':exam}
 (out/'whole-form-content.draft.json').write_text(json.dumps(draft,ensure_ascii=False,indent=2)+'\n')
 forms.append({'goalId':f['id'],'key':f['key'],'contentPath':f['id']+'/whole-form-content.draft.json','originalWholeContract':f['id']+'/competency-contract.current.json','newAssessmentIdAssigned':False,'canonicalRoleActivated':False,'conditionalScopeUse':'bda6-only 8 real T scopes unless independently selected as a voluntary alternative; avoid a second protected pass alongside 5f90'if f['id'].startswith('bda6')else'Only after independent role/scope review; ordinary/context/POnly is not a protected obligation.'})
(H/'author-package.json').write_text(json.dumps({'status':'FIVE_CONTENT_OPTIONS_ONLY_PENDING_INDEPENDENT_REVIEW','forms':forms,'existingWholeIntersectionReuse':'8d314e15-69e9-5af1-a10a-be820b2f821d','noNewIntersectionTask':True,'allOriginalIdsRemain':True,'all807CurricularAtomicObligationsRetained':True},ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'status':'FIVE_COMPLETE_BILINGUAL_CONTENT_OPTIONS_WRITTEN','forms':len(forms)}))
