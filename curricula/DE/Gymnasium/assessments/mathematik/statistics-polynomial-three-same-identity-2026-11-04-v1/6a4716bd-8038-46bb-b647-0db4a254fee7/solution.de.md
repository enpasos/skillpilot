# Referenzlösung: Graph, Grad und Term

**1.** Man liest $A=(-2,0)$, $B=(1,0)$ und $P=(0,1)$ ab.
Bei $-2$ kreuzt der Graph die Achse: Die Nullstellenvielfachheit ist
ungerade, mindestens $1$. Bei $1$ berührt der Graph die Achse ohne
Vorzeichenwechsel: gerade Vielfachheit, mindestens $2$.

**2.** Bereits die beiden Vielfachheiten erfordern Grad mindestens $3$.
Auch zwei echte Umkehrstellen sind bei einem Polynom vom Grad $1$ oder
$2$ nicht möglich; allgemein sind es höchstens Grad minus eins.
Die entgegengesetzten gesicherten Endrichtungen erfordern ungeraden
Grad. Zusammen mit $3\leq\deg F\leq4$ folgt $\deg F=3$.
Rechts nach oben und links nach unten bedeutet positiven Leitkoeffizienten.
Ein kleines sichtbares Graphenfenster allein würde ein Verhalten im
Unendlichen nicht beweisen; hier ist es ausdrücklich gegeben.

**3.** Im Grad $3$ sind die Vielfachheiten damit genau $1$ und $2$:

$$
F(x)=a(x+2)(x-1)^2.
$$

Aus $P=(0,1)$ folgt $1=a\cdot2\cdot1$, also $a=\tfrac12$.
Ein passender Term ist

$$
F(x)=\tfrac12(x+2)(x-1)^2=\tfrac12x^3-\tfrac32x+1.
$$

Gleichwertige Termformen und eine andere nachvollziehbare Bestimmung
des Polynoms erhalten denselben Kredit.

**4.** Nahe $-2$ bleibt $(x-1)^2$ positiv, während $x+2$ sein Vorzeichen
wechselt: eine Kreuzung. Nahe $1$ ist $x+2$ positiv und das Quadrat
beiderseits nicht negativ: Berührung ohne Vorzeichenwechsel.
Für $-2<x<1$ sind $x+2>0$ und $(x-1)^2>0$, also $F(x)>0$,
passend zum oberhalb der x-Achse liegenden Kurvenstück.

**5.** Ohne obere Gradgrenze legen die genannten Daten nur Mindestgrad
und Parität fest. Zum Beispiel ist

$$
H(x)=\tfrac12(x+2)(x-1)^2(1+x^2)
$$

vom Grad $5$ mit positivem Leitkoeffizienten. Da $1+x^2>0$ für alle
reellen $x$, entstehen keine weiteren reellen Nullstellen und die
Vielfachheiten sowie Kreuzung/Berührung bleiben erhalten. Ferner ist
$H(0)=1$, und wegen des ungeraden Grades und positiven Leitkoeffizienten
bleiben beide Endrichtungen gleich. $H$ muss nicht mit der gesamten
gezeichneten Kurve übereinstimmen; diese zusätzliche Forderung wurde in
Teil 5 ausdrücklich nicht gestellt. Beliebig viele größere ungerade
Grade wären beispielsweise durch Faktoren $(1+x^2)^m$ möglich.
