from pathlib import Path
import json
H=Path(__file__).resolve().parent
assert not (H/'content-review-handoff.json').exists(),'Frozen author package.'
FORMS=[]
FORMS.append(dict(id='803d910d-96d1-5118-b9ca-29e93d0da76d',key='oblique-origin-plane',
task_de=r'''# Eine schräge Parallelprojektion untersuchen

In einem räumlichen Modell wird entlang der Richtung
$$
\vec{d}=\begin{pmatrix}1\\1\\1\end{pmatrix}
$$
auf die Ursprungsebene $E:x_1+2x_2-x_3=0$ projiziert.
Jedem Punkt $X$ wird der Schnittpunkt seiner Projektionsgeraden mit $E$
zugeordnet. Es geht um Geraden, nicht um auf eine Richtung beschränkte
Lichtstrahlen. Zeige deine Ansätze und begründe deine Ergebnisse.
Insgesamt sind **20 BE** erreichbar.

**1. Die Matrix aus der Geometrie bestimmen (6 BE)**

Stelle für einen beliebigen Ortsvektor
$\vec{x}=\begin{pmatrix}x_1\\x_2\\x_3\end{pmatrix}$ die
Projektionsgerade auf. Bestimme ihren Schnittparameter mit $E$ und daraus
den Bildvektor. Gib die Abbildungsmatrix $P$ bezüglich der Standardbasis
an. Begründe, warum der Schnittpunkt für jeden Ausgangspunkt eindeutig ist.

**2. Einen Bildpunkt prüfen (3 BE)**

Berechne das Bild von $X(4|1|2)$. Prüfe sowohl die Zugehörigkeit des
Bildpunkts zu $E$ als auch die vorgegebene Projektionsrichtung.

**3. Die Matrix als Projektion untersuchen (6 BE)**

Zeige: Jeder Punkt aus $E$ bleibt an seinem Ort, und $P^2=P$.
Bestimme außerdem alle Vektoren, die auf $\vec{0}$ abgebildet werden,
und den gesamten Bildraum. Deute beide Mengen geometrisch.

**4. Auf eine beliebige Ursprungsebene übertragen (5 BE)**

Sei nun $F:\vec{n}\cdot\vec{x}=0$ mit $\vec{n}\ne\vec{0}$ eine
beliebige Ursprungsebene. Es soll entlang einer Richtung
$\vec{v}\ne\vec{0}$ projiziert werden. Leite aus dem Geradenschnitt eine
Matrixformel für den Fall $\vec{n}\cdot\vec{v}\ne0$ her; dabei ist $I$
die Einheitsmatrix und $\vec{n}^{\mathsf T}$ der zu $\vec n$ gehörige
Zeilenvektor. Eine auswendig angegebene Formel allein genügt nicht.

Untersuche auch, warum bei $\vec{n}\cdot\vec{v}=0$ auf diese Weise
keine auf dem ganzen Raum eindeutig definierte Projektion entsteht.
Unterscheide Ausgangspunkte in $F$ und außerhalb von $F$.
''',
task_en=r'''# Investigate an oblique parallel projection

In a spatial model, projection onto the plane through the origin
$E:x_1+2x_2-x_3=0$ is along the direction
$$
\vec{d}=\begin{pmatrix}1\\1\\1\end{pmatrix}.
$$
Each point $X$ is mapped to the intersection of its projection line with
$E$. These are full lines, not light rays restricted to one direction.
Show your setups and justify your results. Total: **20 points**.

**1. Determine the matrix from the geometry (6 points)**

For an arbitrary position vector
$\vec{x}=\begin{pmatrix}x_1\\x_2\\x_3\end{pmatrix}$, set up the
projection line. Find its intersection parameter with $E$, then its image
vector. State the mapping matrix $P$ in the standard basis. Justify why
every starting point has exactly one intersection.

**2. Check an image point (3 points)**

Calculate the image of $X(4|1|2)$. Check both that the image belongs to
$E$ and that the displacement follows the prescribed projection direction.

**3. Analyze the matrix as a projection (6 points)**

Show that every point in $E$ stays fixed and that $P^2=P$.
Also determine all vectors mapped to $\vec{0}$ and the entire image space.
Interpret both sets geometrically.

**4. Transfer to any plane through the origin (5 points)**

Let $F:\vec{n}\cdot\vec{x}=0$, with $\vec{n}\ne\vec{0}$, be any
plane through the origin. Projection is to be along a direction
$\vec{v}\ne\vec{0}$. Derive a matrix formula from the line intersection
when $\vec{n}\cdot\vec{v}\ne0$. Here $I$ is the identity matrix and
$\vec{n}^{\mathsf T}$ is the row vector associated with $\vec n$.
A memorised formula alone is insufficient.

Explain also why $\vec{n}\cdot\vec{v}=0$ does not give a uniquely defined
projection on the whole space by this construction. Distinguish starting
points in $F$ from those outside $F$.
''',
solution_de=r'''# Referenzlösung: Parallelprojektion

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
''',
solution_en=r'''# Reference solution: parallel projection

**1.** The line through $X$ is $\vec y=\vec x+t\vec d$, $t\in\mathbb R$.
Substitution into $E$ gives
$$
x_1+t+2(x_2+t)-(x_3+t)=0,
\qquad t=-\frac{x_1+2x_2-x_3}{2}.
$$
The coefficient of $t$ is $2$, so every $\vec x$ has exactly one solution.
With $\vec n=\begin{pmatrix}1\\2\\-1\end{pmatrix}$,
$\vec n\cdot\vec d=2$, so the direction does not lie in $E$.
Thus
$$
P\vec x=\vec x-\frac{x_1+2x_2-x_3}{2}\begin{pmatrix}1\\1\\1\end{pmatrix},
\qquad P=\begin{pmatrix}
\frac12&-1&\frac12\\
-\frac12&0&\frac12\\
-\frac12&-1&\frac32
\end{pmatrix}.
$$
The columns are the ordered standard-basis images. Deriving them individually
is an equally valid method.

**2.** For $\vec x=\begin{pmatrix}4\\1\\2\end{pmatrix}$, $t=-2$, hence
$$
P\vec x=\begin{pmatrix}2\\-1\\0\end{pmatrix}.
$$
We have $2+2(-1)-0=0$ and
$\overrightarrow{XX'}=\begin{pmatrix}-2\\-2\\-2\end{pmatrix}=-2\vec d$.
Both conditions hold.

**3.** For $\vec x\in E$, $x_1+2x_2-x_3=0$, so $P\vec x=\vec x$.
Every image lies in $E$, since the general image satisfies
$\vec n\cdot(P\vec x)=\vec n\cdot\vec x-(\vec n\cdot\vec x)(\vec n\cdot\vec d)/2=0$.
Projecting again therefore changes nothing: $P(P\vec x)=P\vec x$ for all
$\vec x$, hence $P^2=P$. Direct matrix multiplication is equally valid.

If $P\vec x=\vec0$, then
$\vec x=\frac{x_1+2x_2-x_3}{2}\vec d$, so $\vec x$ is a multiple of
$\vec d$. Conversely, $P\vec d=\vec0$. Thus
$$
\ker P=\left\{\lambda\begin{pmatrix}1\\1\\1\end{pmatrix}:\lambda\in\mathbb R\right\}.
$$
This is the origin line in the projection direction. All images lie in
$E$ and every plane vector is its own image, so $\operatorname{im}P=E$:
every target-plane point actually occurs as an image.
Here the projection is oblique rather than orthogonal because $\vec d$
is not parallel to $\vec n$; this extra observation is not required for credit.

**4.** On $\vec y=\vec x+t\vec v$, the plane condition becomes
$\vec n\cdot\vec x+t(\vec n\cdot\vec v)=0$. Hence
$$
t=-\frac{\vec n\cdot\vec x}{\vec n\cdot\vec v},\qquad
\vec y=\left(I-\frac{\vec v\vec n^{\mathsf T}}{\vec n\cdot\vec v}\right)\vec x.
$$
The matrix is $P_F=I-\frac{\vec v\vec n^{\mathsf T}}{\vec n\cdot\vec v}$.
When $\vec n\cdot\vec v=0$, the value
$\vec n\cdot\vec y=\vec n\cdot\vec x$ stays constant on the line.
If $X$ is outside $F$, there is no intersection; if $X$ is in $F$, the
whole line is in $F$, with infinitely many intersections. Therefore the
intersection does not define a unique map on the whole space. An undefined
division alone would not yet explain the geometry.
''',
steps=[('derive',6,'Projektionsgerade (1); Schnittparameter richtig hergeleitet (2); Matrix aus Bildvektor/Basisbildern richtig aufgebaut (2); Eindeutigkeit begründet (1).','Projection line (1); derives intersection parameter (2); correctly assembles matrix from image vector/basis images (2); justifies uniqueness (1).'),('point',3,'Bildpunkt (1); Ebenenprobe (1); Verschiebung parallel zur Projektionsrichtung geprüft (1).','Image point (1); plane check (1); checks displacement parallel to projection direction (1).'),('analyze',6,'Punkte der Ebene bleiben fest (1); alle Bilder liegen in der Ebene und jeder Ebenenpunkt ist Bild (1); P²=P begründet (1); Kern vollständig in beiden Richtungen bestimmt (2); Kern und Bild geometrisch gedeutet (1).','Plane points stay fixed (1); all images lie in the plane and every plane point is an image (1); justifies P²=P (1); determines entire kernel in both directions (2); interprets kernel and image geometrically (1).'),('general',5,'Allgemeinen Schnittansatz und Parameter hergeleitet (1); Matrixformel richtig gewonnen (2); keinen Schnitt außerhalb bei paralleler Richtung erklärt (1); ganze Gerade und damit fehlende Eindeutigkeit innerhalb erklärt (1).','Derives general intersection setup and parameter (1); obtains correct matrix formula (2); explains no intersection outside for a parallel direction (1); explains full line and lack of uniqueness inside (1).')],
cap_de='Kappe die normale Gesamtpunktzahl auf 14 BE, wenn in der gesamten Abgabe entweder keine Matrix aus einer tragfähigen Projektions- bzw. Schnittüberlegung gewonnen wird oder jede begründete Untersuchung einer Projektionsstruktur (feste Zielebene, Bild/Kern oder erneute Projektion) vollständig fehlt. Die allgemeine oder die konkrete Herleitung kann die erste Kernleistung erbringen. Eine richtige Einzelpunktrechnung allein ersetzt die Matrixbestimmung und -untersuchung nicht. Eine knappe tragfähige Begründung zählt; ein lokaler Rechenfehler bei sonst richtigem Ansatz löst keine Kappung aus.',
cap_en='Cap the ordinary total at 14 if the entire submission contains either no matrix obtained from sound projection/intersection reasoning or no justified analysis at all of a projection structure (fixed target plane, image/kernel, or repeated projection). The general or concrete derivation can supply the first core action. One correct point calculation alone does not replace determining and analyzing the matrix. Concise sound reasoning counts; a local arithmetic slip with otherwise valid reasoning does not trigger the cap.'))

FORMS.append(dict(id='d3c42193-f1b7-5c6d-a991-bf034d99359f',key='spatial-fixed-point-sets',
task_de=r'''# Welche Punkte bleiben im Raum fest?

Vier lineare geometrische Abbildungen des $\mathbb R^3$ sind durch die
folgenden Matrizen bezüglich der Standardbasis gegeben:
$$
A=\begin{pmatrix}1&1&0\\0&1&0\\0&0&2\end{pmatrix},\quad
B=\begin{pmatrix}0&0&-1\\0&1&0\\-1&0&0\end{pmatrix},\quad
C=\begin{pmatrix}0&-1&0\\1&0&0\\0&0&2\end{pmatrix},\quad
D=\begin{pmatrix}1&0&0\\0&1&0\\0&0&1\end{pmatrix}.
$$
Ein Fixpunkt ist ein Punkt, dessen Ortsvektor nach der Abbildung gleich
bleibt. Bestimme jeweils **alle** Fixpunkte, nicht nur einzelne Beispiele.
Zeige die linearen Gleichungssysteme und ihre Lösung; eine knappe
nachvollziehbare Rechnung genügt. Insgesamt sind **20 BE** erreichbar.

**1. Die allgemeine Bedingung aufstellen (3 BE)**

Leite für eine beliebige Abbildungsmatrix $M$ die Gleichung
$(M-I)\vec x=\vec0$ aus der Fixpunktbedingung her. Erkläre, warum eine
lineare Abbildung immer mindestens einen Fixpunkt besitzt. Dabei ist $I$
die Einheitsmatrix.

**2. Die Fixpunkte von $A$ bestimmen (5 BE)**

Stelle das konkrete Gleichungssystem auf, löse es vollständig und gib die
Fixpunktmenge in Parameterform an. Beschreibe ihre räumliche Gestalt und
prüfe mit einem allgemeinen Punkt dieser Menge.

**3. Die Fixpunkte von $B$ bestimmen (5 BE)**

Gehe ebenso vor. Gib eine vollständige Parameterform an und deute, was
die Abbildung mit den Punkten der gefundenen Menge macht.

**4. Die Fixpunkte von $C$ bestimmen (5 BE)**

Löse wieder das Fixpunktgleichungssystem vollständig. Beurteile mit deiner
Rechnung die Behauptung: „Wenn keiner der drei Standardbasisvektoren fest
bleibt, besitzt die lineare Abbildung gar keinen Fixpunkt.“

**5. Den Sonderfall $D$ erklären (2 BE)**

Bestimme aus der Fixpunktgleichung die gesamte Fixpunktmenge von $D$.
Erkläre, weshalb hier nicht nur eine Gerade oder eine Ebene fest bleibt.
''',
task_en=r'''# Which points in space remain fixed?

Four linear geometric maps of $\mathbb R^3$ have the following matrices
in the standard basis:
$$
A=\begin{pmatrix}1&1&0\\0&1&0\\0&0&2\end{pmatrix},\quad
B=\begin{pmatrix}0&0&-1\\0&1&0\\-1&0&0\end{pmatrix},\quad
C=\begin{pmatrix}0&-1&0\\1&0&0\\0&0&2\end{pmatrix},\quad
D=\begin{pmatrix}1&0&0\\0&1&0\\0&0&1\end{pmatrix}.
$$
A fixed point has the same position vector after the map. Determine
**all** fixed points in each case, rather than just examples. Show the
linear systems and their solutions; concise traceable work suffices.
Total: **20 points**.

**1. Set up the general condition (3 points)**

For any mapping matrix $M$, derive $(M-I)\vec x=\vec0$ from the fixed-point
condition. Explain why a linear map always has at least one fixed point.
Here $I$ is the identity matrix.

**2. Determine the fixed points of $A$ (5 points)**

Set up the concrete system, solve it completely and give the fixed-point
set in parametric form. Describe its shape in space and check a general
point of this set.

**3. Determine the fixed points of $B$ (5 points)**

Proceed similarly. Give a complete parametric form and interpret what
the map does to the points in the resulting set.

**4. Determine the fixed points of $C$ (5 points)**

Again solve the fixed-point system completely. Use your work to evaluate:
“If none of the three standard-basis vectors stays fixed, the linear map
has no fixed point at all.”

**5. Explain the special case $D$ (2 points)**

Use the fixed-point equation to determine the entire fixed-point set of
$D$. Explain why more than just a line or a plane stays fixed here.
''',
solution_de=r'''# Referenzlösung: vollständige Fixpunktmengen

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
''',
solution_en=r'''# Reference solution: complete fixed-point sets

**1.** For a position vector $\vec x$,
$$
M\vec x=\vec x\ \Longleftrightarrow\ M\vec x-I\vec x=\vec0
\ \Longleftrightarrow\ (M-I)\vec x=\vec0.
$$
This is a homogeneous linear system. $\vec x=\vec0$ is always a solution
because $M\vec0=\vec0$, so the origin always stays fixed.

**2.** With $\vec x=\begin{pmatrix}x_1\\x_2\\x_3\end{pmatrix}$,
$A\vec x=\vec x$ gives
$$
x_1+x_2=x_1,\qquad x_2=x_2,\qquad 2x_3=x_3.
$$
Thus $x_2=0$, $x_3=0$ and $x_1$ is free. Hence
$$
\operatorname{Fix}(A)=\left\{t\begin{pmatrix}1\\0\\0\end{pmatrix}:t\in\mathbb R\right\}.
$$
This is the whole $x_1$-axis. For every real parameter,
$A\begin{pmatrix}t\\0\\0\end{pmatrix}=\begin{pmatrix}t\\0\\0\end{pmatrix}$.
The solved system also proves that there are no further fixed points.

**3.** For $B$ the system is
$$
-x_3=x_1,\qquad x_2=x_2,\qquad -x_1=x_3.
$$
The first and third equations are equivalent: $x_1=-x_3$ is the only
condition, while $x_2$ and $x_3$ are free. Thus
$$
\operatorname{Fix}(B)=\left\{
\lambda\begin{pmatrix}0\\1\\0\end{pmatrix}
+\mu\begin{pmatrix}-1\\0\\1\end{pmatrix}:
\lambda,\mu\in\mathbb R\right\}.
$$
This is the origin plane $x_1+x_3=0$. Substituting
$\begin{pmatrix}-\mu\\\lambda\\\mu\end{pmatrix}$ returns the same vector.
Every point in this plane stays individually in place; this says more
than merely mapping the plane onto itself as a set.

**4.** For $C$ we obtain
$$
-x_2=x_1,\qquad x_1=x_2,\qquad 2x_3=x_3.
$$
The first two equations give $x_1=-x_1$, hence $x_1=x_2=0$; the last gives
$x_3=0$. Therefore $\operatorname{Fix}(C)=\{\vec0\}$.
None of the standard unit vectors is fixed, but the origin still is.
The claim is false: a linear map always has at least that fixed point.
The system proves that here it is the only one.

**5.** $D=I$, so $(D-I)\vec x=\vec0$ is the system
$0=0$, $0=0$, $0=0$. All three coordinates are free, giving
$\operatorname{Fix}(D)=\mathbb R^3$. The map is the identity; every point
in space stays fixed. There is no extra condition restricting the solution
to a line or plane.
''',
steps=[('condition',3,'Ausschreiben der Fixpunktbedingung und äquivalente homogene Form (2); Ursprung mit Linearität begründet (1).','Fixed-point condition and equivalent homogeneous form (2); justifies the origin using linearity (1).'),('line',5,'Konkretes A-System (1); Bedingungen x₂=x₃=0 systematisch gewonnen (1); freie Koordinate und ganze Parameterlösung (1); Fixgerade gedeutet (1); allgemeine Probe (1).','Concrete A system (1); systematically obtains x₂=x₃=0 (1); free coordinate and entire parametric solution (1); line interpretation (1); general check (1).'),('plane',5,'Konkretes B-System (1); äquivalente Bedingungen und zwei freie Koordinaten erkannt (1); vollständige Parameterlösung (1); Fixebene und punktweise Fixierung gedeutet (1); allgemeine Probe (1).','Concrete B system (1); recognizes equivalent conditions and two free coordinates (1); complete parametric solution (1); plane and pointwise fixation interpreted (1); general check (1).'),('origin',5,'Konkretes C-System (1); erste zwei Gleichungen gemeinsam gelöst (1); dritte Gleichung und vollständige Lösungsmenge (1); Behauptung widerlegt (1); Ursprung als verbleibenden Fixpunkt begründet (1).','Concrete C system (1); solves first two equations jointly (1); third equation and complete solution set (1); refutes claim (1); justifies the origin as the remaining fixed point (1).'),('identity',2,'Nullsystem erklärt (1); alle drei Koordinaten frei und ganzer Raum als Fixpunktmenge gedeutet (1).','Explains zero system (1); all three coordinates free and whole space interpreted as fixed set (1).')],
cap_de='Kappe die normale Gesamtpunktzahl auf 14 BE, wenn in der gesamten Abgabe keine tragfähige Aufstellung und Lösung eines konkreten dreidimensionalen Fixpunktgleichungssystems erkennbar ist oder bei A und B zusammen ausschließlich einzelne Probepunkte statt irgendeiner vollständig hergeleiteten nichttrivialen Fixpunktmenge vorkommen. Die Kernhandlung ist das Bestimmen aller Lösungen über ein LGS; eine bloße Matrixbezeichnung oder Bildprobe ersetzt sie nicht. Ein knapper gültiger Lösungsweg, auch in anderer Form, genügt. Lokale Rechenfehler oder eine einzelne unvollständige Teilaufgabe lösen diese Kappung nicht allein aus.',
cap_en='Cap the ordinary total at 14 if no sound setup and solution of any concrete three-dimensional fixed-point system appears anywhere, or if A and B together contain only isolated checked points without any fully derived nontrivial fixed-point set. The core action is finding all solutions through a linear system; a matrix label or image check alone does not replace it. Concise valid work in another form counts. Local arithmetic slips or one incomplete part alone do not trigger this cap.'))

FORMS.append(dict(id='5748633c-113f-5ea8-9041-24da55919de7',key='coordinate-plane-views',
task_de=r'''# Ansichten einer räumlichen Konstruktion

Eine Konstruktion wird in einem räumlichen Koordinatensystem beschrieben;
$1\,\mathrm{LE}=1\,\mathrm m$. Bei einer **orthogonalen** Projektion auf
eine Koordinatenebene verlaufen die Projektionsgeraden senkrecht zu dieser
Ebene. Nur in Teil 4 ist eine andere Richtung vorgegeben. Zeige deine
Rechnung und deute die Ansichten. Insgesamt sind **20 BE** erreichbar.

**1. Einen Punkt in drei Ansichten darstellen (4 BE)**

Bestimme die orthogonalen Projektionen von $Q(2|-1|3)$ auf die
$x_1x_2$-, $x_1x_3$- und $x_2x_3$-Ebene. Erkläre jeweils, welche
Koordinate warum verschwindet. Formuliere eine allgemeine Regel für
einen Punkt $X(x_1|x_2|x_3)$.

**2. Geraden projizieren (5 BE)**

Projiziere die gesamten Geraden
$$
g:\vec x=\begin{pmatrix}1\\2\\3\end{pmatrix}
+t\begin{pmatrix}2\\-1\\2\end{pmatrix},\qquad
h:\vec x=\begin{pmatrix}2\\1\\0\end{pmatrix}
+t\begin{pmatrix}0\\0\\1\end{pmatrix},\quad t\in\mathbb R,
$$
auf die $x_1x_2$-Ebene. Gib beide Bildmengen an und erkläre ihren
Unterschied. Prüfe auch, ob $R(3|1|0)$ zum Bild von $g$ gehört.

**3. Eine Dreiecksfläche in zwei Ansichten deuten (7 BE)**

Ein dreieckiges Segel ist die ausgefüllte Fläche mit den Eckpunkten
$A(1|1|2)$, $B(5|1|2)$ und $C(1|4|5)$.
Bestimme seine orthogonalen Projektionen auf die $x_1x_2$- und die
$x_2x_3$-Ebene. Gib die projizierten Eckpunkte und die jeweils gesamte
Bildfläche bzw. Bildstrecke an. Zeichne beide Ansichten mit beschrifteten
Achsen; eine einfache maßstäbliche Skizze genügt. Bestimme den
Flächeninhalt beider Bilder und erkläre geometrisch, warum eine der
Ansichten keine flächige Gestalt mehr zeigt. Beurteile damit die Aussage:
„Eine räumliche Fläche behält bei jeder solchen Ansicht ihren Flächeninhalt.“

**4. Draufsicht und schrägen Schatten unterscheiden (4 BE)**

Die Spitze einer Stütze liegt in $S(2|1|4)$. Lichtstrahlen laufen ab $S$
in Richtung $\vec d=\begin{pmatrix}1\\0\\-2\end{pmatrix}$ auf die
Bodenebene $x_3=0$. Bestimme den Schattenpunkt durch einen Geradenschnitt
und vergleiche ihn mit der orthogonalen Draufsicht von $S$. Erkläre,
weshalb in diesem Fall bloßes Nullsetzen der dritten Koordinate nicht
den Schattenpunkt liefert. Prüfe, dass der Schnitt auf dem vorwärts
laufenden Lichtstrahl liegt.
''',
task_en=r'''# Views of a spatial structure

A structure is described in a three-dimensional coordinate system,
with $1\,\mathrm{unit}=1\,\mathrm m$. In an **orthogonal** projection
onto a coordinate plane, the projection lines are perpendicular to that
plane. Only part 4 specifies a different direction. Show your calculations
and interpret the views. Total: **20 points**.

**1. Show a point in three views (4 points)**

Find the orthogonal projections of $Q(2|-1|3)$ onto the $x_1x_2$-,
$x_1x_3$- and $x_2x_3$-planes. Explain which coordinate disappears and
why in each case. State a general rule for a point $X(x_1|x_2|x_3)$.

**2. Project lines (5 points)**

Project the entire lines
$$
g:\vec x=\begin{pmatrix}1\\2\\3\end{pmatrix}
+t\begin{pmatrix}2\\-1\\2\end{pmatrix},\qquad
h:\vec x=\begin{pmatrix}2\\1\\0\end{pmatrix}
+t\begin{pmatrix}0\\0\\1\end{pmatrix},\quad t\in\mathbb R,
$$
onto the $x_1x_2$-plane. State both image sets and explain their difference.
Also check whether $R(3|1|0)$ belongs to the image of $g$.

**3. Interpret a triangular surface in two views (7 points)**

A triangular sail is the filled surface with vertices $A(1|1|2)$,
$B(5|1|2)$ and $C(1|4|5)$. Find its orthogonal projections onto the
$x_1x_2$- and $x_2x_3$-planes. Give the projected vertices and the entire
image surface or segment in each case. Draw both views with labelled
axes; a simple sketch to scale suffices. Calculate the area of both images
and explain geometrically why one view no longer has a two-dimensional
shape. Use this to evaluate: “A spatial surface retains its area in every
such view.”

**4. Distinguish a top view from an oblique shadow (4 points)**

The tip of a support is $S(2|1|4)$. Light rays from $S$ travel in direction
$\vec d=\begin{pmatrix}1\\0\\-2\end{pmatrix}$ towards the ground plane
$x_3=0$. Find the shadow point by intersecting a line with the plane and
compare it with the orthogonal top view of $S$. Explain why simply
setting the third coordinate to zero does not give the shadow here.
Check that the intersection lies on the forward light ray.
''',
solution_de=r'''# Referenzlösung: Koordinatenansichten

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
''',
solution_en=r'''# Reference solution: coordinate views

**1.** The images are $Q_{12}(2|-1|0)$, $Q_{13}(2|0|3)$ and
$Q_{23}(0|-1|3)$. Generally,
$$
\begin{pmatrix}x_1\\x_2\\x_3\end{pmatrix}
\longmapsto\begin{pmatrix}x_1\\x_2\\0\end{pmatrix},\quad
\begin{pmatrix}x_1\\0\\x_3\end{pmatrix},\quad
\begin{pmatrix}0\\x_2\\x_3\end{pmatrix},
$$
for the three planes in that order. The perpendicular coordinate direction
is set to zero; the two coordinates within the plane are retained.
Different heights can therefore have the same top view.

**2.** Projecting every line point gives
$$
g_{12}:\vec x=\begin{pmatrix}1\\2\\0\end{pmatrix}
+t\begin{pmatrix}2\\-1\\0\end{pmatrix},\quad t\in\mathbb R.
$$
The image direction is nonzero, so this image is a line. At $t=1$ it
gives $R(3|1|0)$, so $R$ belongs to the image. All points on $h$ have
first coordinates $2$ and $1$, so all map to $H(2|1|0)$. The image set is
the single point $\{H\}$, not a line with a zero direction vector.
The line $h$ is perpendicular to the target plane, along the viewing direction.

**3.** The top view gives $A_{12}(1|1|0)$, $B_{12}(5|1|0)$ and
$C_{12}(1|4|0)$. The whole filled sail maps to the filled triangle
$A_{12}B_{12}C_{12}$. This also follows by applying projection componentwise
to $\vec a+s(\vec b-\vec a)+t(\vec c-\vec a)$ with $s,t\ge0$,
$s+t\le1$. Its perpendicular image sides have lengths $4$ and $3$,
so its area is $\frac12\cdot4\cdot3=6\,\mathrm m^2$.

The side view gives $A_{23}=B_{23}=(0|1|2)$ and $C_{23}=(0|4|5)$.
The **entire image set** is the segment
$$
\vec x=\begin{pmatrix}0\\1\\2\end{pmatrix}
+\lambda\begin{pmatrix}0\\3\\3\end{pmatrix},\quad 0\le\lambda\le1.
$$
Its area is $0\,\mathrm m^2$. Edge $AB$ lies in the $x_1$ viewing direction
and disappears, so the whole sail collapses to a segment in this view.
The sketches show the right triangle with the stated $x_1,x_2$ coordinates
and the segment from $(1|2)$ to $(4|5)$ in the $x_2x_3$ view, with both
$A_{23},B_{23}$ at the first endpoint.
The claim is false: the original triangle has two independent edges and
positive area, yet one view has area zero. Projection generally does not
preserve spatial area; calculating the original area is not required here.

**4.** The light ray is on
$$
\vec x=\begin{pmatrix}2\\1\\4\end{pmatrix}
+t\begin{pmatrix}1\\0\\-2\end{pmatrix},\quad t\ge0.
$$
The ground condition is $4-2t=0$, so $t=2\ge0$. The shadow point is
$S_L(4|1|0)$, whereas the orthogonal top view is $S_{12}(2|1|0)$.
The light rays are oblique to the ground: as $x_3$ decreases, $x_1$ also
changes. Perpendicular viewing would keep $x_1,x_2$ unchanged, so the
actual light direction must be used.
''',
steps=[('point-views',4,'Drei Punktbilder richtig (je 1); allgemeine Regeln mit senkrechter Richtung und erhaltenen Koordinaten erklärt (1).','Three correct point images (1 each); explains general rules using perpendicular direction and retained coordinates (1).'),('line-views',5,'Ganze Bildgerade von g richtig (2); R durch gemeinsamen Parameter geprüft (1); Bild von h als einzelnen Punkt bestimmt (1); Kollaps mit Richtung begründet (1).','Entire image line of g correct (2); checks R using common parameter (1); determines single-point image of h (1); explains collapse using direction (1).'),('surface-views',7,'Eckpunktbilder beider Ansichten richtig (2); ausgefülltes Dreieck und ganze Bildstrecke statt nur Eckpunkte identifiziert (1); beide beschrifteten Skizzen plausibel (1); Bildflächeninhalte 6 und 0 m² richtig (1); Kollaps geometrisch erklärt (1); Flächenerhaltung begründet widerlegt (1).','Correct vertex images in both views (2); identifies filled triangle and entire image segment rather than only vertices (1); plausible labelled sketches of both views (1); areas 6 and 0 m² (1); geometric collapse explained (1); refutes area preservation with reasons (1).'),('shadow',4,'Geradenansatz und Schnittparameter (1); richtiger Schattenpunkt mit t≥0 (1); orthogonale Draufsicht (1); Unterschied der Richtungen und der erhaltenen Koordinaten erklärt (1).','Line setup and intersection parameter (1); correct shadow point with t≥0 (1); orthogonal top view (1); explains direction and retained-coordinate difference (1).')],
cap_de='Kappe die normale Gesamtpunktzahl auf 14 BE, wenn in der gesamten Abgabe die mathematische Bestimmung einer ganzen projizierten Geraden oder Fläche durch bloßes Nennen vereinzelter Punktbilder ersetzt wird oder jede geometrische bzw. sachliche Deutung der Projektion vollständig fehlt. Für die erste Kernleistung genügt eine nachvollziehbare ganze Bildgerade, Bildfläche oder Bildstrecke; nicht jede Objektart muss dafür fehlerfrei sein. Eine knappe Erklärung eines Kollapses oder des Richtungsunterschieds zählt als Deutung. Eine einzelne fehlende Skizze, ein lokaler Rechenfehler oder eine einzelne unvollständige Ansicht allein löst keine Kappung aus.',
cap_en='Cap the ordinary total at 14 if the entire submission replaces determining an entire projected line or surface by isolated point images only, or contains no geometric or contextual interpretation of projection at all. One traceable entire image line, surface or segment supplies the first core action; every object type need not be flawless. A concise explanation of collapse or different directions counts as interpretation. One missing sketch, a local arithmetic slip or one incomplete view alone does not trigger the cap.'))

FORMS.append(dict(id='7bb3c312-f714-55e6-a31f-f31605a93760',key='cross-product-normal-area',
task_de=r'''# Eine räumliche Dreiecksplatte untersuchen

Eine dreieckige Platte hat die Eckpunkte $A(1|0|1)$, $B(3|1|1)$ und
$C(1|2|3)$, wobei $1\,\mathrm{LE}=1\,\mathrm m$ gilt.
Verwende das **Vektorprodukt** und dokumentiere deine Rechnung;
ein bloß angegebener Normalenvektor oder Flächenwert genügt nicht.
Insgesamt sind **20 BE** erreichbar.

**1. Einen Normalenvektor bestimmen und prüfen (7 BE)**

Berechne $\vec a=\overrightarrow{AB}$ und
$\vec b=\overrightarrow{AC}$ sowie $\vec n=\vec a\times\vec b$.
Begründe, warum $\vec n$ ein Normalenvektor der Plattenebene ist.
Prüfe dies zusätzlich durch beide Skalarprodukte.

**2. Die Plattenebene angeben (3 BE)**

Stelle mit deinem Normalenvektor und einem Eckpunkt eine
Koordinatengleichung der Ebene auf. Prüfe die beiden anderen Eckpunkte.

**3. Flächeninhalte berechnen und deuten (5 BE)**

Berechne mit dem Vektorprodukt den Flächeninhalt des von $\vec a$ und
$\vec b$ aufgespannten Parallelogramms sowie den Flächeninhalt der
Dreiecksplatte. Erkläre den Zusammenhang zwischen dem Vektor, seinem
Betrag und beiden Flächeninhalten. Beurteile: „Vertauscht man die
Reihenfolge im Vektorprodukt, wird der Flächeninhalt negativ.“

**4. Eine veränderte Platte und den Grenzfall untersuchen (5 BE)**

$A$ und $B$ bleiben fest. Die dritte Ecke $C_t$ ist durch
$\overrightarrow{AC_t}=t\vec b$ mit $t\in\mathbb R$ gegeben.
Bestimme das zugehörige Vektorprodukt und den Dreiecksflächeninhalt in
Abhängigkeit von $t$. Erkläre die Fälle $t<0$ und $t=0$.
Entscheide für $t=0$, ob das Vektorprodukt noch einen Normalenvektor
liefert und ob die drei angegebenen Punkte eine eindeutige Plattenebene
bestimmen.
''',
task_en=r'''# Investigate a triangular plate in space

A triangular plate has vertices $A(1|0|1)$, $B(3|1|1)$ and $C(1|2|3)$,
with $1\,\mathrm{unit}=1\,\mathrm m$. Use the **vector (cross) product**
and show your calculations; just stating a normal vector or area value
is insufficient. Total: **20 points**.

**1. Determine and check a normal vector (7 points)**

Calculate $\vec a=\overrightarrow{AB}$ and $\vec b=\overrightarrow{AC}$,
then $\vec n=\vec a\times\vec b$. Justify why $\vec n$ is a normal
vector of the plate plane. Additionally check this using both dot products.

**2. State the plate plane (3 points)**

Use your normal vector and one vertex to obtain a coordinate equation
of the plane. Check the other two vertices.

**3. Calculate and interpret areas (5 points)**

Use the cross product to calculate the area of the parallelogram spanned
by $\vec a,\vec b$ and the area of the triangular plate. Explain the
connection between the vector, its magnitude and both areas. Evaluate:
“Reversing the order of the cross product makes the area negative.”

**4. Investigate a changed plate and the degenerate case (5 points)**

Keep $A$ and $B$ fixed. The third vertex $C_t$ is specified by
$\overrightarrow{AC_t}=t\vec b$, $t\in\mathbb R$. Find the associated
cross product and triangle area as functions of $t$. Explain the cases
$t<0$ and $t=0$. For $t=0$, decide whether the cross product still
provides a normal vector and whether the three given points determine
a unique plate plane.
''',
solution_de=r'''# Referenzlösung: Vektorprodukt und Flächen

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
''',
solution_en=r'''# Reference solution: cross product and areas

**1.** We have
$$
\vec a=\begin{pmatrix}2\\1\\0\end{pmatrix},\qquad
\vec b=\begin{pmatrix}0\\2\\2\end{pmatrix},\qquad
\vec n=\vec a\times\vec b=
\begin{pmatrix}1\cdot2-0\cdot2\\0\cdot0-2\cdot2\\2\cdot2-1\cdot0\end{pmatrix}
=\begin{pmatrix}2\\-4\\4\end{pmatrix}.
$$
It is nonzero and, by the cross-product property, perpendicular to both
spanning vectors, hence normal to the plane. The checks give
$\vec n\cdot\vec a=4-4+0=0$ and
$\vec n\cdot\vec b=0-8+8=0$.
Other nonzero multiples are also valid plane normals; the requested
cross product itself has the stated value.

**2.** Using $A$,
$$
2(x_1-1)-4x_2+4(x_3-1)=0,
\qquad E:x_1-2x_2+2x_3=3.
$$
For $B$, $3-2+2=3$; for $C$, $1-4+6=3$. Both belong to $E$.

**3.** The magnitude is
$$
\|\vec a\times\vec b\|=\sqrt{2^2+(-4)^2+4^2}=6.
$$
The spanned parallelogram has area $6\,\mathrm m^2$ and the triangle
half that, $3\,\mathrm m^2$. Geometrically,
$\|\vec a\times\vec b\|=\|\vec a\|\,\|\vec b\|\sin\theta$, where
$\theta$ is the angle between the spanning vectors: base times height.
The cross product is a directed vector; its magnitude is a nonnegative
number. Reversing order gives $\vec b\times\vec a=-\vec n$, leaving
magnitude and areas unchanged. The claim is false.

**4.** Linearity in one factor gives
$$
\vec a\times(t\vec b)=t\begin{pmatrix}2\\-4\\4\end{pmatrix},
\qquad F_\triangle(t)=\frac12\|t\vec n\|=3|t|\,\mathrm m^2.
$$
Componentwise calculation is equally valid. For $t<0$, $C_t$ is on the
opposite side of $A$ along line $AC$; the ordered cross-product normal
reverses direction, while area remains positive and scales by $|t|$.
For $t=0$, $C_t=A$, the cross product is $\vec0$ and triangle area is zero.
The zero vector has no normal direction and is not a plane normal vector.
The remaining distinct points $A,B$ determine only a line, through which
infinitely many planes pass. Thus no unique plate plane is determined.
For $t\ne0$, the spanning vectors remain independent and the plane is still $E$.
''',
steps=[('normal',7,'Kantenvektoren richtig (2); Vektorprodukt nachvollziehbar berechnet (3); beide Skalarproduktproben (1); nichtverschwindenden Vektor als Ebenennormale begründet (1).','Correct edge vectors (2); traceable cross-product calculation (3); both dot-product checks (1); justifies nonzero vector as plane normal (1).'),('plane',3,'Punkt-Normalen-Ansatz (1); richtige Koordinatengleichung (1); beide Eckpunktproben (1).','Point-normal setup (1); correct coordinate equation (1); both vertex checks (1).'),('areas',5,'Betrag des Vektorprodukts richtig berechnet (1); Parallelogrammfläche (1); halbe Dreiecksfläche (1); Zusammenhang als Grundseite mal Höhe erklärt (1); Vorzeichenumkehr von unverändertem Betrag und Fläche unterschieden (1).','Correct cross-product magnitude (1); parallelogram area (1); half-sized triangle area (1); explains base-times-height link (1); distinguishes vector sign reversal from unchanged magnitude and area (1).'),('degenerate',5,'Skaliertes Vektorprodukt richtig (1); Dreiecksfläche 3|t| richtig (1); negative Parameter mit Richtungsumkehr bei positiver Fläche erklärt (1); t=0 mit zusammenfallenden Punkten und Fläche null (1); Nullvektor keine Ebenennormale und keine eindeutig bestimmte Ebene begründet (1).','Correct scaled cross product (1); correct triangle area 3|t| (1); explains negative parameter with direction reversal and positive area (1); t=0 with coinciding points and zero area (1); justifies zero vector not a plane normal and no unique plane (1).')],
cap_de='Kappe die normale Gesamtpunktzahl auf 14 BE, wenn in der gesamten Abgabe keine nachvollziehbare Anwendung des Vektorprodukts zur Normalenbestimmung erkennbar ist oder jede Verwendung seines Betrags zur Flächenberechnung fehlt. Dies sind die beiden im Lernziel ausdrücklich verbundenen Anwendungen; bloß erratene Zahlen oder eine Normale ohne erkennbaren Vektorproduktbezug ersetzen sie nicht. Die Anwendungen können auch im veränderten Fall gezeigt werden. Knappe richtige Argumente und richtige Folgearbeit nach einem lokalen Rechenfehler zählen; ein solcher Fehler allein löst keine Kappung aus.',
cap_en='Cap the ordinary total at 14 if, across the entire submission, no traceable application of the cross product to determining a normal is evident, or if every use of its magnitude for area calculation is absent. These are the two applications explicitly joined in the goal; guessed numbers or a normal without identifiable cross-product reasoning do not replace them. The changed case can also demonstrate these applications. Concise valid reasoning and correct follow-through after a local arithmetic slip count; such a slip alone does not trigger the cap.'))

COMMON_DE=r'''# Eine Gesamtbewertung

20 BE insgesamt, genau ein binäres Ergebnis: **bestanden ab 15 BE**,
sonst nicht bestanden. Es gibt keine Teilbestehensgrenzen und keine
zusätzlichen qualifizierenden Mastery-Belege.

Fachlich gleichwertige Schreibweisen, Parameterformen und zulässige Methoden
zählen gleich. Die ausdrücklich verlangten Handlungen bleiben verbindlich.
Eine knappe richtige Begründung genügt und zählt unabhängig davon, wo sie
in der Abgabe steht. Identische Leistung nur einmal werten. Teilpunkte wie
angegeben, sonst 0,5 BE für eine sinnvolle unvollständige Teilleistung.
Einen lokalen Rechen-, Vorzeichen- oder Übertragungsfehler nicht mehrfach
bestrafen; richtige nachvollziehbare Folgearbeit behält ihren Kredit.
Die begründete Kappung betrifft ausschließlich die eine normale
Gesamtpunktzahl vor dem Vergleich mit 15 BE, kein zweites Ergebnis.

| Kriterium | BE |
|---|---:|
'''
COMMON_EN=r'''# One overall assessment

20 points in total, exactly one binary result: **pass at 15 points**,
otherwise not passed. No separate part-pass thresholds or additional
qualifying mastery evidence.

Credit equivalent notation, parametrisations and permitted methods equally.
Explicitly requested actions remain binding. Concise correct reasoning
counts wherever it appears. Count identical work only once. Award partial
marks as specified, otherwise 0.5 for meaningful incomplete work. Do not
repeatedly penalise one local arithmetic, sign or copying error; credit
correct traceable follow-through. The justified cap applies only to the
one ordinary total before comparison with 15, without a second outcome.

| Criterion | Points |
|---|---:|
'''
pack={'status':'CONTENT_PROPOSALS_PENDING_GENUINE_INDEPENDENT_WHOLE_REVIEW_NO_ROLE_ACTIVATION','forms':[]}
for f in FORMS:
 if f['key']=='spatial-fixed-point-sets':
  for lang in ['task_de','task_en']:
   f[lang]=f[lang].replace(r'\end{pmatrix},\quad',r'\end{pmatrix}.'+'\n$$\n\n$$\n')
 if f['key']=='coordinate-plane-views':
  for lang in ['task_de','task_en']:
   f[lang]=f[lang].replace(r'\end{pmatrix},\qquad',r'\end{pmatrix}.'+'\n$$\n\n$$\n')
   f[lang]=f[lang].replace(r'\end{pmatrix},\quad t\in\mathbb R,',r'\end{pmatrix},\quad t\in\mathbb R,')
 folder=H/f['id'];steps=[dict(id=a,points=b,description=c,descriptionEn=d) for a,b,c,d in f['steps']]
 if f['key']=='coordinate-plane-views':
  figure=json.loads((H/'solution-figure-boundary.json').read_text())
  f['solution_de']=f['solution_de'].replace('\n**4.**','\n![Referenzskizzen: gefülltes Bilddreieck in der Draufsicht und zusammengefallene Bildstrecke in der Seitenansicht.]('+figure['runtimeUrl']+')\n\n**4.**')
  f['solution_en']=f['solution_en'].replace('\n**4.**','\n![Reference sketches: filled image triangle in the top view and collapsed image segment in the side view.]('+figure['runtimeUrl']+')\n\n**4.**')
 esc=lambda text:text.replace('|',r'\|')
 rubric_de=COMMON_DE+''.join(f'| {esc(s["description"])} | {s["points"]} |\n' for s in steps)+'\n'+f['cap_de']+'\n'
 rubric_en=COMMON_EN+''.join(f'| {esc(s["descriptionEn"])} | {s["points"]} |\n' for s in steps)+'\n'+f['cap_en']+'\n'
 assert sum(s['points'] for s in steps)==20
 data={'reviewStatus':'draft','taskContent':f['task_de'],'taskContentEn':f['task_en'],'solutionContent':f['solution_de']+'\n'+rubric_de,'solutionContentEn':f['solution_en']+'\n'+rubric_en,'coveredGoalIds':[f['id']],'coveredStrands':['L3'],'demandLevels':['AB3' if f['id'] in ['803d910d-96d1-5118-b9ca-29e93d0da76d','d3c42193-f1b7-5c6d-a991-bf034d99359f'] else 'AB2'],'scoring':{'maxPoints':20,'passingPoints':15,'steps':steps}}
 for n,s in [('task.de.md',f['task_de']),('task.en.md',f['task_en']),('solution.de.md',f['solution_de']),('solution.en.md',f['solution_en']),('rubric.de.md',rubric_de),('rubric.en.md',rubric_en)]: (folder/n).write_text(s)
 draft={'status':'WHOLE_CONTENT_DRAFT_ROLE_NEUTRAL','assessmentOfExistingGoalId':f['id'],'examDataContent':data,'canonicalGoalMutation':False,'newAssessmentIdAssigned':False,'reviewDecision':'PENDING_GENUINE_INDEPENDENT_CONTENT_REVIEW','mastery':'One ordinary total-score binary result; no qualifying extra evidence or automatic prerequisite mastery.'}
 (folder/'whole-form-content.draft.json').write_text(json.dumps(draft,ensure_ascii=False,indent=2)+'\n');pack['forms'].append({'goalId':f['id'],'key':f['key'],'contentPath':f['id']+'/whole-form-content.draft.json'})
(H/'author-package.json').write_text(json.dumps(pack,ensure_ascii=False,indent=2)+'\n')
