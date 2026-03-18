# Low-Cost-Zyklotron (Abitur BY 2003 GK A1-2)

Quelle: https://www.leifiphysik.de/elektrizitaetslehre/bewegte-ladungen-feldern/aufgabe/low-cost-zyklotron-abitur-2003-gk-a1-2
Originaldatei: `curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/abi/Physik/input/leifiphysik_abitur/pages/elektrizitaetslehre/bewegte-ladungen-feldern/aufgabe/low-cost-zyklotron-abitur-2003-gk-a1-2.html`
Schwierigkeitsgrad: mittelschwere Aufgabe

## Aufgabe

![](https://www.leifiphysik.de/sites/default/files/images/e5deb37a07ec6e641ce15799387da203/243low-cost-zyklotron-abitur-by-2003-gk-a1-2_skizze.gif)

Abb. 1 Skizze zur Aufgabe

[CC-BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/deed.de) / FWU Institut für Film und Bild;

in Zyklotron (siehe Abb. 1) dient zur Beschleunigung geladener Teilchen auf nichtrelativistische Geschwindigkeiten. Es wird mit einem homogenen Magnetfeld mit der Feldstärke $B$ und einer Wechselspannung konstanter Frequenz betrieben.

a)

Leite an Hand einer geeigneten Kräftebetrachtung den Zusammenhang zwischen dem Bahnradius und der Geschwindigkeit der Teilchen (Ladung $q$; Masse $m$) her.

Zeige, dass für die Frequenz gilt

$$
f = \frac{q \cdot B}{2 \,\pi \cdot m}
$$

Erläutere damit, dass mit diesem Zyklotron Teilchen nicht auf relativistische Geschwindigkeiten beschleunigt werden können. (8 BE)

Im Folgenden soll ein "Low-Cost-Zyklotron" für Protonen betrachtet werden, das mit der Haushaltwechselspannung (Frequenz: $50{,}0\,\rm{Hz}$) betrieben wird. Die Energiezufuhr findet dabei für ein Proton immer dann statt, wenn die Spannung ihren Scheitelwert $325\,\rm{V}$ annimmt.

b)

Berechne den Zuwachs an kinetischer Energie, den die Protonen bei einem Umlauf erhalten. (3 BE)

c)

Berechne die magnetische Flussdichte $B$, mit der dieses Zyklotron betrieben werden muss. [zur Kontrolle: $B = 3{,}28\,\rm{\mu T}$] (3 BE)

d)

Berechne, wie lange es dauert, bis dieses Zyklotron ein anfangs ruhendes Proton auf $1{,}0\,\%$ der Lichtgeschwindigkeit beschleunigt hat.

Berechne den Radius $r$ der Kreisbahn, die auf $1{,}0\,\%$ der Lichtgeschwindigkeit beschleunigte Protonen durchlaufen. (9 BE)

e)

Erläutere, ob du ein solches "Low-Cost-Zyklotron" für realisierbar hältst. (3 BE)

## Lösung

**Hinweis:** Bei dieser Lösung von LEIFIphysik handelt es sich nicht um den amtlichen Lösungsvorschlag des bayr. Kultusministeriums.

a)

Die LORENTZ-Kraft wirkt als Zentripetalkraft:

$$
F_{\rm{L}} = F_{\rm{ZP}} \Leftrightarrow q \cdot v \cdot B = \frac{m \cdot v^2}{r} \Leftrightarrow \frac{r}{v} = \frac{m}{{q \cdot B}} \quad(1)
$$

Multiplizieren wir beide Seiten der Gleichung mit $2 \cdot \pi$ erhalten wir

$$
\frac{2 \cdot \pi \cdot r}{v} = \frac{2 \cdot \pi \cdot m}{q \cdot B} \quad(2)
$$

Bei einer gleichförmigen Kreisbewegung gilt nun

$$
v = \frac{{2 \cdot \pi  \cdot r}}{T} \Leftrightarrow T = \frac{{2 \cdot \pi  \cdot r}}{v}
$$

Damit erhalten wir aus $(2)$

$$
T = \frac{2 \cdot \pi \cdot m }{q \cdot B}
$$

und mit $f=\frac{1}{T}$

$$
f = \frac{q \cdot B}{2 \cdot \pi \cdot m}\quad(3)
$$

Das Zyklotron wird mit einer konstanten Frequenz der Beschleunigungsspannung betrieben. Da $q$ und $B$ zeitlich konstant sind, funktioniert das wiederholte Beschleunigen nur, solange die Masse des beschleunigten Teilchens als konstant betrachtet werden kann. Dies gilt nur im nichtrelativistischen Fall mit $v < 0{,}1 \, c$.

b)

Bei einem Umlauf wird das Proton zweimal zwischen den Duanten beschleunigt. Damit ergibt sich

$$
\Delta E = 2 \cdot e \cdot U
$$

Einsetzen der gegebenen Werte liefert (mit zwei gültigen Ziffern Genauigkeit)

$$
\Delta E = 2 \cdot e \cdot 325\,\rm{V} = 650\,\rm{eV} = 1{,}04 \cdot 10^{-16}\,\rm{J}
$$


c)

Aus der in Teilaufgabe a) hergeleiteten Beziehung $(3)$ erhalten wir

$$
f = \frac{q \cdot B}{2 \, \pi  \cdot m_{\rm{p}}} \Leftrightarrow B = \frac{2 \cdot \pi  \cdot f \cdot m_{\rm{p}}}{q}
$$

Einsetzen der gegebenen Werte liefert (mit drei gültigen Ziffern Genauigkeit)

$$
B = \frac{2 \, \pi  \cdot 50{,}0\,\rm{Hz} \cdot 1{,}67 \cdot 10^{-27}\,\rm{kg}}{1{,}60 \cdot 10^{-19}\,\rm{A\,s}} = 3{,}28 \cdot 10^{-6}\,\rm{T} = 3{,}28\,\rm{\mu T}
$$


d)

Die Anzahl der benötigten Umläufe ergibt sich durch

$$
N = \frac{E_{\rm{kin}}}{\Delta E}= \frac{\frac{1}{2} \cdot m_{\rm{p}} \cdot (0{,}01 \cdot c)^2}{\Delta E}
$$

Einsetzen der gegebenen Werte liefert (mit zwei gültigen Ziffern Genauigkeit)

$$
N = \frac{\frac{1}{2} \cdot 1{,}67 \cdot 10^{-27}\,\rm{kg} \cdot (0{,}01 \cdot 3{,}0 \cdot 10^8\,\frac{\rm{m}}{\rm{s}})^2}{1{,}04  \cdot 10^{-16}\,\rm{J}} = 72
$$

Die für die $N$ Umläufe benötigte Zeit $t$ ergibt sich

$$
t = N \cdot T = \frac{N}{f}
$$

Einsetzen der gegebenen Werte liefert (mit zwei gültigen Ziffern Genauigkeit)

$$
t = \frac{72}{50{,}0\,\rm{Hz}} = 1{,}4\,\rm{s}
$$

Aus der in Teilaufgabe a) entwickelten Beziehung $(1)$ lässt sich nun $r$ berechnen:

$$
\frac{r}{v} = \frac{m}{q \cdot B}     \Leftrightarrow     r = \frac{m \cdot v}{q \cdot B}
$$

Einsetzen der gegebenen Werte liefert (mit zwei gültigen Ziffern Genauigkeit)

$$
r =\frac{1{,}67 \cdot 10^{-27}\,\rm{kg} \cdot 0{,}01 \cdot 3{,}0 \cdot 10^8\,\frac{\rm{m}}{\rm{s}}}{1{,}60 \cdot 10^{-19}\,{\rm{A\,s}} \cdot 3{,}28 \cdot 10^{-6}\,\rm{T}} = 9{,}5 \cdot 10^3\,\rm{m} = 9{,}5\,\rm{km}
$$


e)

Das "Low-Cost-Zyklotron" ist aufgrund des sehr großen Radius von $9{,}5\,\rm{km}$, über den eine homogenes Magnetfeld wirken müsste, nicht realisierbar.

## Grundwissen
- [Geladene Teilchen im magnetischen Querfeld](https://www.leifiphysik.de/elektrizitaetslehre/bewegte-ladungen-feldern/grundwissen/geladene-teilchen-im-magnetischen-querfeld)
