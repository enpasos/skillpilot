# Referenzlösung: Entscheidungsregel

Für $Z\sim\operatorname{Bin}(n,p)$ sei

$$
T_{n,p}(k)=P_p(Z\geq k)=\sum_{j=k}^{n}\binom njp^j(1-p)^{n-j}.
$$

Mit wachsender Schwelle schrumpft das Verwerfungsereignis. Deshalb sinkt
seine Wahrscheinlichkeit sowohl unter $H_0$ als auch unter $H_1$.
Die kleinste zulässige Schwelle hat die größte Entdeckungswahrscheinlichkeit
unter den hier erlaubten festen Schwellenregeln.

| $n$ | $k_n$ | $T_{n,0{,}10}(k_n-1)$ | $T_{n,0{,}10}(k_n)$ | $T_{n,0{,}30}(k_n)$ |
|---:|---:|---:|---:|---:|
| 20 | 5 | 0,132953 | 0,043174 | 0,762492 |
| 40 | 8 | 0,099516 | 0,041902 | 0,944717 |

Die feste 20er-Regel scheidet aus: Schon ihre unter der ersten Grenze
leistungsfähigste Schwelle erreicht nur etwa $76{,}25\%$ Entdeckung.
Die feste 40er-Regel mit Schwelle $8$ erfüllt beide Grenzen.

**Zweistufige Regeln.** $X,Y$ sind unabhängig und jeweils
$\operatorname{Bin}(20,p)$-verteilt. Die Beanstandungsereignisse
$\{X\geq r\}$ und $\{X=j,Y\geq8-j\}$ für $j=3,\ldots,r-1$
sind paarweise disjunkt. Daher ist

$$
B_r(p)=T_{20,p}(r)+\sum_{j=3}^{r-1}\binom{20}{j}p^j(1-p)^{20-j}
T_{20,p}(8-j).
$$

Eine gleichwertige vollständige Falltabelle oder direkte Summation über
die Paare $(X,Y)$ genügt ebenfalls.

| $r$ | $B_r(0{,}10)$ | $B_r(0{,}30)$ | beide Grenzen? |
|---:|---:|---:|---|
| 5 | 0,063319 | 0,933544 | nein: erste Grenze überschritten |
| 6 | 0,041711 | 0,927197 | ja |

Auch wenn der anfängliche Test mit Schwelle $5$ allein ein Niveau unter
$5\%$ hätte, kommt durch Fortsetzen und spätere Beanstandungen weitere
Wahrscheinlichkeit hinzu. Man muss die gesamte Regel prüfen.
$X+Y\geq8$ allein beschreibt sie nicht: Bei beispielsweise $X=6,Y=0$
beanstandet die Regel mit $r=6$ sofort, obwohl die gedachte Gesamtsumme
kleiner als $8$ ist. Bei $X=2,Y=10$ würde sie sofort ohne Beanstandung
stoppen. Ein hypothetisches $Y$ darf zur Wahrscheinlichkeitsrechnung
mitgedacht werden, wird bei frühem Stoppen aber nicht erhoben.

**Aufwand.** Bei $r=6$ sind $N=20$ oder $N=40$ möglich, und

$$
E_p(N)=20+20P_p(3\leq X\leq5).
$$

Bei $p=0{,}10$ ist die Fortsetzungswahrscheinlichkeit $0{,}311820$;
somit $E_{0{,}10}(N)\approx26{,}2364$. Das ist weniger als die stets
$40$ Prüfungen der zulässigen festen 40er-Regel. Unter den ausdrücklich
vorgegebenen Entwürfen wird die zweistufige Regel mit $r=6$ gewählt:

1. $20$ Teile prüfen und $X$ zählen.
2. Bei $X\leq2$ ohne Beanstandung stoppen; bei $X\geq6$ sofort beanstanden.
3. Bei $X=3,4,5$ weitere $20$ Teile prüfen und $Y$ zählen; genau bei
   $X+Y\geq8$ beanstanden, sonst nicht beanstanden.

Also stoppt $X=2$ ohne Beanstandung, $X=5$ führt zur zweiten Stufe
(Beanstandung dann bei $Y\geq3$), $X=6$ zur sofortigen Beanstandung.
Die Regel hält etwa $4{,}17\%$ Fehlbeanstandung und $92{,}72\%$
Entdeckung ein und hat im maßgeblichen Fall den kleineren Erwartungsaufwand.
Eine größere feste 40er-Schwelle kann diesen Aufwand von $40$ nicht senken.
Eine globale Optimalität unter allen denkbaren Prüfplänen wird nicht behauptet.

**Grenzen.** Die zitierte Behauptung ist falsch. Die numerischen Grenzen
wurden für genau die beiden zugelassenen Werte von $p$ berechnet, nicht
für sämtliche realen Anteile. Das Binomialmodell setzt unabhängige
Prüfungen mit gleichbleibendem $p$ voraus; starke Abhängigkeit, ein kleiner
Bestand ohne Zurücklegen oder eine nicht zufällige Auswahl können es
unpassend machen. Auch die Aufwandsoptimierung gilt hier ausdrücklich
bei $p=0{,}10$, nicht automatisch unter jeder anderen Bewertung.
