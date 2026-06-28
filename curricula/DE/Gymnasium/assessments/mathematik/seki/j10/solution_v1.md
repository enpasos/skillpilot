# J10 Mathematics Exam Solution v1

Status: promoted after simulated internal review

Total: 64 BE

---

## Task 1 - Akkusensor und Förderkonto (10 BE)

$B$ hat Anfangswert $1200$, Wachstumsfaktor $0.82<1$, ist streng fallend und hat die waagerechte Asymptote $y=0$.

$B(0)=1200$, $B(3)=1200\cdot 0.82^3≈661.7 Wh$.

$1200\cdot 0.82^t<500$ ergibt $t>\log(500/1200)/\log(0.82)≈4.41$. Die Halbwertszeit erfüllt $0.82^t=0.5$, also $t=\log(0.5)/\log(0.82)≈3.49$. Logarithmen sind nötig, weil die gesuchte Zeit im Exponenten steht.

$K(5)=2500\cdot 1.035^5≈2969.22$. Anfangskapital $2500 EUR$, Zinssatz $3.5 %$, Laufzeit $5$ Jahre, Endkapital etwa $2969.22 EUR$; Zinseszins bedeutet, dass Zinsen in Folgejahren mitverzinst werden.

Scoring notes:

- 10 BE - Exponentialmodelle, Logarithmen, Halbwertszeit, Asymptotik und Zinseszins im Kontext deuten.

---

## Task 2 - Riesenradmodell (12 BE)

Mittellinie $18$, Amplitude $14$, Periode $40$, Minimum $4$, Maximum $32$.

$H(5)=18$ und $H(15)=32$.

Ein passender Term ist $q(t)=6+2\cdot \cos((\pi/6)\cdot (t-3))$, weil $2\pi/(\pi/6)=12$ und bei $t=3$ ein Maximum liegt.

$150^\circ = 5\pi/6$.

Aus $\sin(\alpha)=0.6$ folgt $\cos(\alpha)=0.8$, da der Winkel spitz ist. $\tan(\alpha)=0.6/0.8=0.75$; $\sin(90^\circ-\alpha)=\cos(\alpha)=0.8$.

$H'(t)=14\cdot (\pi/20)\cdot \cos((\pi/20)\cdot (t-5))$. Bei $t=15$ ist der Sensor im Maximum; $H'(15)=0$, die momentane Höhenänderung ist dort null.

Scoring notes:

- 12 BE - Trigonometrische Graphen, Bogenmaß, Einheitskreisbeziehungen, Modellterme und trigonometrische Ableitungen nutzen.

---

## Task 3 - Profil einer Führungsschiene (14 BE)

$f$ ist kubisch mit positivem Leitkoeffizienten; für $x\to\infty$ gilt $f(x)\to\infty$, für $x\to-\infty$ gilt $f(x)\to-\infty$. $f'(x)=0.3x^2-1.2x+0.9=0.3(x-1)(x-3)$, $f''(x)=0.6x-1.2$.

$f(0)=2$, $f'(0)=0.9$; Tangente $y=0.9x+2$, Normale $y=-(10/9)x+2$. Linear ergibt sich $f(0.2)≈2.18$.

$f''(x)=0$ bei $x=2$, $f(2)=2.2$. Links davon ist $f''<0$, rechts davon $f''>0$; die Krümmung wechselt.

Wegen der Vorzeichen von $f'$ ist $f$ auf $(-\infty,1)$ steigend, auf $(1,3)$ fallend und auf $(3,\infty)$ steigend. Die Umkehrung ist nicht allgemein gültig: $x^3$ ist streng steigend, obwohl die Ableitung bei $0$ gleich $0$ ist.

$g$ ist achsensymmetrisch zur y-Achse, weil nur gerade Potenzen vorkommen. $h$ ist punktsymmetrisch zum Ursprung, weil $h(-x)=-h(x)$. Drei Extremstellen bei beiden Enden nach oben erfordern mindestens Grad $4$ mit positivem Leitkoeffizienten.

Scoring notes:

- 14 BE - Ganzrationale Funktionen mit Ableitungen, Tangenten, Approximation, Krümmung, Symmetrie und Monotonie untersuchen.

---

## Task 4 - Prüfgleichungen im CAS-Protokoll (8 BE)

Bei $\sqrt{x+5}=x-1$ muss $x\ge1$ gelten. Quadrieren liefert $x+5=x^2-2x+1$, also $x^2-3x-4=0$ und $x=4$ oder $x=-1$; durch Definitionsbedingung und Einsetzen bleibt nur $x=4$.

Aus $x^4=81$ folgen die reellen Lösungen $x=3$ und $x=-3$.

Setze $z=x^2$; dann $z^2-5z+4=0$, also $z=1$ oder $z=4$. Rücksubstitution ergibt $x=\pm1$ oder $x=\pm2$.

Scoring notes:

- 8 BE - Wurzel-, Potenz- und Substitutionsgleichungen lösen und mögliche Scheinlösungen prüfen.

---

## Task 5 - Wartungsdrohne und Wassertank (10 BE)

$r(t)$ beschreibt eine geradlinige Bewegung vom Startpunkt $(1|2|0)$ mit Richtungsvektor $(2|1|1)$. Für $t=2$ liegt die Drohne bei $(5|4|2)$.

Für einen Schnitt mit $s$ löst man $(1+2t,2+t,t)=(5+u,4-u,2)$. Aus der dritten Koordinate folgt $t=2$, dann aus der ersten $u=0$ und aus der zweiten ebenfalls $u=0$; Schnittpunkt ist $(5|4|2)$.

$k$ hat denselben Richtungsvektor wie $r$; der Verbindungsvektor der Stützpunkte $(1|2|-1)$ ist kein Vielfaches von $(2|1|1)$, also sind die Geraden echt parallel.

$V=(1/3)\cdot \pi\cdot r^2\cdot h=(1/3)\cdot \pi\cdot 2.4^2\cdot 6=11.52\pi≈36.2 m^3$. Die Formel ist plausibel, weil ein Kegel als Grenzfall von Pyramiden mit immer mehr Ecken in der Grundfläche verstanden werden kann.

Scoring notes:

- 10 BE - Geraden im Raum, vektorielle Bewegungen, Lagebeziehungen und Kegelvolumen in einer technischen Anwendung bearbeiten.

---

## Task 6 - Sensortest mit Simulation (10 BE)

Es gibt $C(8,2)=28$ mögliche Zweierauswahlen.

Günstig sind $C(3,2)=3$ Auswahlen mit zwei fehlerhaften Sensoren, also $P=3/28≈0.107$.

Die Simulation liefert $1060/10000=0.106$; das liegt nahe am exakten Wert. Abweichungen entstehen durch Zufallsschwankungen und werden bei vielen Durchläufen typischerweise kleiner.

Ohne Zurücklegen verändert sich die Zusammensetzung nach der ersten Auswahl. Mit Zurücklegen wären die Pfadwahrscheinlichkeiten anders.

Scoring notes:

- 10 BE - Kombinatorische Anzahlen, Wahrscheinlichkeiten und Monte-Carlo-Approximationen bestimmen und kritisch deuten.

---

