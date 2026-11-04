# Referenzlösung: Transformationsscharen

**1.** $G_t$ verschiebt die Normalparabel um $t$ in x-Richtung und um
$1$ nach oben. Für negatives $t$ geht es nach links. Aus einem beliebigen
Grundpunkt wird

$$
(u,u^2)\longmapsto(u+t,u^2+1),
$$

denn $G_t(u+t)=u^2+1$. Definitionsbereich ist $\mathbb R$,
Wertebereich $[1,\infty)$, Scheitel $S_t=(t,1)$, Symmetrieachse $x=t$.
Für $t=-2$ liegt der Scheitel bei $(-2,1)$, für $t=3$ bei $(3,1)$.
Alle Punkte werden jeweils um denselben Vektor verschoben; Abstände und
Parabelform ändern sich nicht. Der Parameter ändert hier nur die
horizontale Lage, während die vertikale Verschiebung $1$ fest ist.

**2.** Bei $H_a$ werden die y-Koordinaten mit $a$ multipliziert:

$$
(u,e^u)\longmapsto(u,ae^u).
$$

Für $a>1$ liegt eine vertikale Streckung, für $0<a<1$ eine vertikale
Stauchung vor; die x-Koordinaten bleiben gleich. Definitionsbereich
$\mathbb R$, Wertebereich $(0,\infty)$, y-Achsenabschnitt $(0,a)$,
waagerechte Asymptote $y=0$ für $x\to-\infty$.
$H_2(0)=2$ und $H_{1/2}(0)=\tfrac12$. Sie schneiden sich nicht,
denn $2e^x=\tfrac12e^x$ wäre bei $e^x>0$ unmöglich; der erste Graph
liegt überall über dem zweiten. Es geht um eine reine vertikale
Transformation, nicht um eine Änderung des Exponentialtyps.

**3.** Aus $u=bx$ folgt $x=u/b$; daher

$$
(u,\sin u)\longmapsto(u/b,\sin u).
$$

Der Graph wird in x-Richtung mit dem Faktor $1/b$ gestreckt beziehungsweise
gestaucht. Wertebereich $[-1,1]$, Amplitude $1$, Periode $2\pi/b$,
Nullstellen $x=k\pi/b$ für $k\in\mathbb Z$.
Für $b=2$ beträgt der horizontale Faktor $\tfrac12$, die Periode
$\pi$ und der erste Hochpunkt $(\pi/4,1)$.
Für $b=\tfrac12$ beträgt der horizontale Faktor $2$, die Periode
$4\pi$ und der erste Hochpunkt $(\pi,1)$.
Die Punktzuordnung verändert nur x-Koordinaten, deshalb bleiben
die Extremwerte $-1,1$ und die Amplitude erhalten.

**4.** Die Behauptung ist falsch. Beispielsweise verschiebt $G_3$
die Parabel nach rechts und nach oben ohne Formänderung; $K_{1/2}$
wird gegenüber $\sin x$ horizontal breiter (Faktor $2$), obwohl der
Parameter positiv ist. Auch korrekt erklärte andere Beispiele zählen,
etwa die vertikale Stauchung bei $H_{1/2}$. Die Position des Parameters
im Term und sein Bereich bestimmen die konkrete Wirkung.
