# Kondensator-Mikrofon (Abitur BY 2004 LK A1-1)

Quelle: https://www.leifiphysik.de/elektrizitaetslehre/kondensator-kapazitaet/aufgabe/kondensator-mikrofon-abitur-2004-lk-a1-1
Originaldatei: `curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/abi/Physik/input/leifiphysik_abitur/pages/elektrizitaetslehre/kondensator-kapazitaet/aufgabe/kondensator-mikrofon-abitur-2004-lk-a1-1.html`
Schwierigkeitsgrad: schwere Aufgabe

## Aufgabe

![](https://www.leifiphysik.de/sites/default/files/images/d4380e36a5be6ce38972b960eda6937a/280kondensator-mikrofon-abitur-by-2004-lk-a1-1_skizze.gif)

Abb. 1 Skizze eines Kondensator-Mikrofons

[CC-BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/deed.de) / FWU Institut für Film und Bild;

Über einer festen Metallplatte M1 ist auf zwei elastischen, isolierten Puffern P eine bewegliche, leitende Membran M2 befestigt. Der aus M1 und M2 gebildete Kondensator ist über einen Widerstand $R = 10\,\rm{k\Omega }$ an eine Gleichspannungsquelle mit $U = 40\,\rm{V}$ angeschlossen. Der Flächeninhalt der Kondensatorplatten beträgt $A = 100\,\rm{cm}^2$, der Plattenabstand $d = 0{,}20\,\rm{mm}$.

a)

Berechne die Ladung $Q_0$ des Kondensators. [zur Kontrolle: $Q_0 = 18\,\rm{nC}$] (3 BE)

b)

Die Membran wird um $\Delta x \ll d$ nach unten bewegt.

Zeige, dass dadurch die zusätzliche Ladung $\Delta Q \approx \frac{Q_0}{d} \cdot \Delta x$ auf den Kondensator fließt. (5 BE)

c)

In einem Zeitraum $\Delta t = 2{,}5 \cdot {10^{-4}}\,\rm{s}$ wird M2 um $\Delta x = 10\,\rm{\mu m}$ nach unten bewegt.

Berechne mit Hilfe von Teilaufgabe b) die mittlere Stärke des Ladestroms während der Zeit $\Delta t$ und die mittlere Spannung $U_{12}$ zwischen den Anschlusspunkten 1 und 2. (4 BE)

d)

Begründe, warum die Anordnung als Mikrofon benutzt werden kann. (5 BE)

e)

Für den Einsatz in einem Handy müssten das beschriebene Kondensatormikrofon und die Betriebsspannung $U$ modifiziert werden.

Erläutere die notwendigen Änderungen sowie der Auswirkungen auf die "Mikrofon-Spannung" $U_{12}$. (4 BE)

## Lösung

**Hinweis:** Bei dieser Lösung von LEIFIphysik handelt es sich nicht um den amtlichen Lösungsvorschlag des bayr. Kultusministeriums.

a)

Für die Ladung eines Plattenkondensators gilt

$$
{Q_0} = C \cdot U = {\varepsilon _0} \cdot \frac{A}{d} \cdot U \Rightarrow {Q_0} = 8,85 \cdot {10^{ - 12}}\frac{{{\rm{As}}}}{{{\rm{Vm}}}} \cdot \frac{{100 \cdot {{10}^{ - 4}}{{\rm{m}}^2}}}{{0,20 \cdot {{10}^{ - 3}}{\rm{m}}}} \cdot 40{\rm{V}} = 1,8 \cdot {10^{ - 8}} = 18{\rm{nC}}
$$


b)

Berechnung der Ladungsänderung bei Verringerung des Plattenabstandes:

$$
\Delta Q = \left( {C' - C} \right) \cdot U = \left( {{\varepsilon _0} \cdot \frac{A}{{d - \Delta x}} - {\varepsilon _0} \cdot \frac{A}{d}} \right) \cdot U = \left( {\frac{1}{{d - \Delta x}} - \frac{1}{d}} \right) \cdot {\varepsilon _0} \cdot A \cdot U
$$

Umformungen liefern

$$
\Delta Q = \frac{{d - \left( {d - \Delta x} \right)}}{{\left( {d - \Delta x} \right) \cdot d}} \cdot {\varepsilon _0} \cdot A \cdot U = \frac{{\Delta x}}{{{d^2} - \Delta x \cdot d}} \cdot {\varepsilon _0} \cdot A \cdot U
$$

Mit $\Delta x \cdot d \ll {d^2}$ ergibt sich

$$
\Delta Q \approx \frac{{\Delta x}}{{{d^2}}} \cdot {\varepsilon _0} \cdot A \cdot U = \frac{{\Delta x}}{d} \cdot \frac{{{\varepsilon _0} \cdot A \cdot U}}{d} = \frac{{\Delta x}}{d} \cdot {Q_0}
$$


c)

Berechnung der mittleren Stromstärke:

$$
\bar I = \frac{{\Delta Q}}{{\Delta t}} = \frac{{\Delta x \cdot {Q_0}}}{{\Delta t \cdot d}} \Rightarrow \bar I = \frac{{10 \cdot {{10}^{ - 6}}{\rm{m}} \cdot 18 \cdot {{10}^{ - 9}}{\rm{As}}}}{{2,5 \cdot {{10}^{ - 4}}{\rm{s}} \cdot 0,20 \cdot {{10}^{ - 3}}{\rm{m}}}} = 3,6 \cdot {10^{ - 6}}{\rm{A}}
$$

Für die am Widerstand abfallende Spannung gilt dann

$$
{U_{12}} = R \cdot \bar I \Rightarrow {U_{12}} = 10 \cdot {10^3}\Omega  \cdot 3,6 \cdot {10^{ - 6}}{\rm{A}} = 36{\rm{mV}}
$$


d)

Durch die auftreffenden Schallwellen wird die Membran in Schwingungen versetzt. Dadurch entstehen Kapazitätsschwankungen im Rhythmus der Schwingungen. Diese wiederum rufen am Widerstand Spannungsschwankungen hervor, die verstärkt werden können.

e)

Auf jeden Fall wäre eine Verkleinerung der Kondensatorfläche $A$ und eine Verringerung der Betriebsspannung $U$ notwendig. Beide Veränderung würden kleinere Ladungs- und damit Stromschwankungen bedeuten (Teilaufgaben a) und b)). Dies hätte nach Teilaufgabe c) eine kleinere Spannung $U_{12}$ zur Folge.

## Grundwissen
- [Kapazität des Plattenkondensators](https://www.leifiphysik.de/elektrizitaetslehre/kondensator-kapazitaet/grundwissen/kapazitaet-des-plattenkondensators)
