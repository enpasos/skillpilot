# Musterlösung: quadratisches Sieb

**1. Idee und mathematischer Grund**

Das Verfahren sucht kleine Werte von $Q(x)=x^2-N$, deren Primfaktoren
vollständig in einer kleinen Faktorbasis liegen. Solche Werte heißen
über der Basis glatt. Sieben markiert für jede Basisprimzahl regelmäßig
wiederkehrende teilbare Werte und entfernt deren Primzahlpotenzen.
Exponentenvektoren halten die Zerlegungen fest. Wählt man Beziehungen so,
dass alle Exponentensummen gerade sind, ist ihr Produkt ein Quadrat $Y^2$.
Wegen $Q(x)\equiv x^2\pmod N$ ist es gleichzeitig zum Quadrat des
Produkts der zugehörigen $x$ kongruent, also zu $X^2$.

Aus $X^2\equiv Y^2\pmod N$ folgt

$$
N\mid(X^2-Y^2)=(X-Y)(X+Y).
$$

Die Faktoren von $N$ können sich auf die beiden Klammern verteilen.
$\operatorname{ggT}(X-Y,N)$ oder $\operatorname{ggT}(X+Y,N)$ kann dann
einen Teiler $d$ mit $1<d<N$ liefern. Nicht jede Quadratkongruenz liefert
einen solchen Teiler; die ggT-Werte müssen geprüft werden.

**2. Sieben**

$40^2<N<41^2$. Nahe bei $\sqrt N$ sind die Differenzen $x^2-N$ klein;
das begünstigt vollständige Zerlegungen über der kleinen Basis, ohne sie
für jeden Wert zu garantieren. Da $N\equiv1\pmod2$, ist $Q(x)$ für
ungerade $x$ durch $2$ teilbar. Wegen $N\equiv4\pmod5$ sind modulo $5$
die Klassen $x\equiv2$ und $x\equiv3$ passend. Diese Klassen wiederholen
sich im Abstand $2$ beziehungsweise $5$; so findet man die zu markierenden
Stellen ohne jedes Mal alle Teilbarkeiten neu zu suchen.

| $x$ | $Q(x)$ | Entfernte Basisfaktoren | Rest | Behalten? |
|---:|---:|---|---:|---|
| 41 | 32 | $2^5$ | 1 | ja |
| 42 | 115 | $5$ | 23 | nein |
| 43 | 200 | $2^3\cdot5^2$ | 1 | ja |
| 44 | 287 | keine | 287 | nein |
| 45 | 376 | $2^3$ | 47 | nein |

Nur die Beziehungen zu $41$ und $43$ sind vollständig über $B$ zerlegt:
Der verbleibende Rest ist jeweils $1$. Ein Rest wie $23$ ist kein
zulässiger neuer Faktorbasiseintrag in diesem festgelegten Lauf.

**3. Kombination und Faktorgewinn**

In der Reihenfolge $(2,5)$ sind die Exponentenvektoren $(5,0)$ und $(3,2)$.
Ihre Paritäten sind beide $(1,0)$; ihre Summe modulo $2$ ist $(0,0)$.
Daher kann man beide Beziehungen kombinieren:

$$
Q(41)Q(43)=32\cdot200=2^8\cdot5^2=80^2.
$$

Mit $X=41\cdot43=1763$ und $Y=80$ ist also $X^2\equiv Y^2\pmod{1649}$.
Der kleinere Vertreter $X=114$ ist gleichwertig. Somit

$$
\operatorname{ggT}(114-80,1649)=\operatorname{ggT}(34,1649)=17,
$$


$$
\operatorname{ggT}(114+80,1649)=\operatorname{ggT}(194,1649)=97.
$$

Die Probe $17\cdot97=1649$ bestätigt die Faktorisierung. Beide Faktoren
sind echt zwischen $1$ und $N$. Ihre Primzahleigenschaft kann bei Bedarf
an den Primteilern bis zur jeweiligen Quadratwurzel geprüft werden; sie
ist für die hier verlangte nichttriviale Faktorgewinnung nicht zusätzlich
nachzuweisen. Nicht die Zerlegung eines einzelnen $Q(x)$, sondern erst
die Kombination zum Quadrat und die anschließende ggT-Rechnung faktorisiert
hier $N$.

**4. Grenzen des einzelnen Schritts**

Bei $X=Y=32$ gilt zwar die Quadratkongruenz, aber

$$
\operatorname{ggT}(0,1649)=1649,\qquad
\operatorname{ggT}(64,1649)=1.
$$

Beide Teiler sind trivial. Das ist kein Nachweis, dass $N$ prim ist, und
auch kein Widerspruch zum Verfahren. Man benötigt eine andere geeignete
Kombination beziehungsweise weitere glatte Beziehungen; reichen sie nicht,
kann man das Siebintervall oder die Faktorbasis erweitern. Ein Primzahltest
untersucht, ob eine Zahl prim ist (je nach Test mit unterschiedlicher
Aussagestärke); ein Faktorisierungsverfahren sucht eine Zerlegung in
nichttriviale Faktoren. Die Behauptung, beide lieferten stets dieselbe
Art von Ergebnis, wäre falsch.
