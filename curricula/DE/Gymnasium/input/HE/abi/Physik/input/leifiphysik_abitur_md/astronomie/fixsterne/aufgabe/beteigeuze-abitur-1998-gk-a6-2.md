# Beteigeuze (Abitur BY 1998 GK A6-2)

Quelle: https://www.leifiphysik.de/astronomie/fixsterne/aufgabe/beteigeuze-abitur-1998-gk-a6-2
Originaldatei: `curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/abi/Physik/input/leifiphysik_abitur/pages/astronomie/fixsterne/aufgabe/beteigeuze-abitur-1998-gk-a6-2.html`
Schwierigkeitsgrad: mittelschwere Aufgabe

## Aufgabe

Beteigeuze ist ein sogenannter Überriese mit einer Masse von etwa $20$ Sonnenmassen. Er hat sein Hauptreihenstadium bereits hinter sich.

a)

Gib an, wodurch das Hauptreihenstadium eines Sterns gekennzeichnet ist. (3 BE)

b)

Leite eine Formel zur Abschätzung der Verweildauer eines Sterns auf der Hauptreihe (Entwicklungszeit) her.

Berechne daraus die Zeit, die Beteigeuze auf der Hauptreihe verbracht hat (Verweildauer der Sonne auf der Hauptreihe: $\tau = 7 \cdot 10^9\,\rm{a}$). (5 BE)

Beteigeuze ist ein potentieller Kandidat für eine Supernovaerscheinung, die bei einer Entfernung von $540$ Lichtjahren praktisch "vor unserer Haustür" stattfinden würde. Supernovae haben eine mittlere absolute Maximalhelligkeit von etwa $M=-19$.

c)

Berechne, mit welcher scheinbaren Helligkeit man die hypothetische Supernovaexplosion von Beteigeuze auf der Erde beobachten würde.

Vergleiche diese mit der scheinbaren Helligkeit des Vollmonds, die $m=-12{,}5$ beträgt. (5 BE)

Bei einer Supemova kann als Stemrest ein Neutronenstem entstehen. Solche Sterne haben eine große Dichte und rotieren mit hoher Frequenz. Ein Neutronenstern hat z. B. eine Periode $T=30\,\rm{ms}$ (Crab-Pulsar). Trotz dieser schnellen Rotation wird er gravitativ zusammengehalten.

d)

Für die Mindestdichte $\bar{\rho}$ eines Neutronenstems gilt folgende Abschätzung : $ \bar{\rho} > \frac{3 \cdot \pi}{G \cdot T^2}$   ($G$: Gravitationskonstante).

Leite diese Beziehung her.

Berechne den Wert für die Mindestdichte des Crab-Pulsars als Vielfaches der Dichte von Wasser. (9 BE)

## Lösung

**Hinweis:** Bei dieser Lösung von LEIFIphysik handelt es sich nicht um den amtlichen Lösungsvorschlag des bayr. Kultusministeriums.

a)

Ein Stern bleibt solange in der Hauptreihe wie Wasserstoff im Kern zu Helium fusioniert. Ist der Kernwasserstoff "verbrannt" verlässt der Stern die Hauptreihe.

b)

$\tau \sim m$ (Die Verweildauer ist dem Vorrat an "Wasserstoff" direkt proportional)

$\tau \sim \frac{1}{L}$ (Die Verweildauer ist zum "Verbrauch pro Zeit" indirekt proportional)

Wegen der empirischen Masse Leuchtkraftbeziehung für Hauptreihensterne $L \sim M^3$ ergibt sich

$$
\tau \sim \frac{m}{L} \Leftrightarrow \tau \sim \frac{m}{m^3} = \frac{1}{m^2} \Leftrightarrow \tau_B = \frac{1}{20^2} \cdot 7 \cdot 10^9\,\rm{a} = 1{,}8 \cdot 10^7\,\rm{a}
$$


c)


$$
M = m - 5 \cdot lg \frac{r}{10\,\rm{pc}} \Rightarrow m= -19 + 5 \cdot lg \frac{540\,\rm{Lj}}{32{,}6\,\rm{Lj}} = -12{,}9\,\rm{mag}\text{     (etwas heller als der Vollmond)}
$$


d)

Für Äquatorpunkt muss die Gravitationskraft größer als die Zentrifugalkraft sein: $F_{\rm G} > F_{\rm ZF}$

Weitere benötigte Formeln: Kreisfrequenz, Kugelvolumen, Dichte.


$$
\begin{aligned} \frac{{G \cdot m \cdot M}}{{{R^2}}} &> \frac{{m \cdot R \cdot 4 \cdot {\pi ^2}}}{{{T^2}}} \\ \frac{M}{{{R^3}}} &> \frac{{4 \cdot {\pi ^2}}}{{G \cdot {T^2}}} \\ \frac{{3 \cdot M}}{{4 \cdot {R^3} \cdot \pi }} &> \frac{{3 \cdot \pi }}{{G \cdot {T^2}}} \\ \bar \rho &> \frac{3 \cdot \pi }{G \cdot T^2} \\ \end{aligned} 
$$


Einsetzen der gegebenen Werte liefert (mit zwei gültigen Ziffern Genauigkeit) 

$$
\bar{\rho} > \frac{3 \cdot \pi} {6{,}67 \cdot 10^{-11}\,\frac{\rm{m}^3}{\rm{kg\,s}^2} \cdot \left(0{,}030\,\rm{s}\right)^2} = 1{,}6 \cdot 10^{14}\,\frac{\rm{kg}}{\rm{m}^3} = 1{,}6 \cdot 10^{11}\,\rho_W
$$


## Grundwissen
- [Entwicklung schwerer Sterne](https://www.leifiphysik.de/astronomie/fixsterne/grundwissen/entwicklung-schwerer-sterne)
