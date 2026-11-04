# Musterlösung: Parabelbahn

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


## Eine Gesamtbewertung

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

| Kriterium | BE |
|---|---:|
| Alle drei Koordinaten korrekt zu einer räumlichen Parameterdarstellung verbunden (3, je Koordinate 1); Zeitbereich [0,3] (1); Zeit/Anfangsort und waagerechte Koeffizienten gedeutet (1); negativer quadratischer Höhenterm passend zur Bewegung erklärt (1). | 6 |
| Position nach 1 s (1); Fangpunkt (1); höchster Zeitpunkt innerhalb des Intervalls aus Scheitelform begründet (1); Höhe (1); beide übrigen Raumkoordinaten des höchsten Punkts (1 zusammen). | 5 |
| t=(x−1)/4 gewonnen und y-Beziehung richtig (1); z(x) richtig (1); Bereich 1≤x≤13 (1); vertikale Ebene erklärt (1); Parabel in dieser Ebene aus nicht verschwindendem quadratischem Term und linearer horizontaler Koordinate begründet (1). | 5 |
| Neue vollständige Vektordarstellung (1); u-Bereich [0,6] (1); korrespondierendes Zahlenbeispiel richtig geprüft (1); Parameteränderung von unveränderten Geschwindigkeiten pro Sekunde unterschieden (1). | 4 |

Begrenze die normale Gesamtpunktzahl auf 14 BE, wenn in der ganzen Abgabe keine tragfähige räumliche Parameterdarstellung mit einer tatsächlich quadratischen Höhenkomponente vorliegt oder jede Deutung des Parameters in Bezug auf den zeitlichen Bewegungskontext vollständig fehlt. Bloß einzelne Punkte oder eine reine Ortskurve z(x) ohne Parameterdarstellung ersetzen die Kernleistung nicht. Eine knappe gültige Darstellung und Deutung zählt. Ein lokaler Koeffizienten-, Einsetz- oder Übertragungsfehler bei erkennbarem quadratischem Modell löst keine Kappung aus.

Mehrere Kappungsgründe ergeben dieselbe Obergrenze von 14 BE. Es bleibt bei einem Gesamtpass ohne weitere Teilbestehensbedingungen.
