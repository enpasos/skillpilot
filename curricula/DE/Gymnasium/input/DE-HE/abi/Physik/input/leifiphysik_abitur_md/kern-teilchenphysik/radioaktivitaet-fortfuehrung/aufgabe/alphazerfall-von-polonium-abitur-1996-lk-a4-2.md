# Alphazerfall von Polonium (Abitur BY 1996 LK A4-2)

Quelle: https://www.leifiphysik.de/kern-teilchenphysik/radioaktivitaet-fortfuehrung/aufgabe/alphazerfall-von-polonium-abitur-1996-lk-a4-2
Originaldatei: `curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/abi/Physik/input/leifiphysik_abitur/pages/kern-teilchenphysik/radioaktivitaet-fortfuehrung/aufgabe/alphazerfall-von-polonium-abitur-1996-lk-a4-2.html`
Schwierigkeitsgrad: mittelschwere Aufgabe

## Aufgabe

Das Polonium-Isotop ${{}^{210}{\rm{Po}}}$ geht durch $\alpha$-Zerfall mit einer Halbwertszeit von $138\,\rm{d}$ in ${{}^{206}{\rm{Pb}}}$ über. Atommassen: ${{m_{\rm{A}}}\left( {{}^{210}{\rm{Po}}} \right) = 209{,}982874\,\rm{u}}$; ${{m_{\rm{A}}}\left( {{}^{206}{\rm{Pb}}} \right) = 205{,}974465\,\rm{u}}$.

**Hinweis:** Die hier angegebenen Atommassen wurden der AME2016 des [AMDC-Atomic Mass Data Center](https://www-nds.iaea.org/amdc/) entnommen.

a)

Ermittle die Energiebilanz ($Q$-Wert) des Prozesses. [zur Kontrolle: $Q = 5{,}4\,\rm{MeV}$] (4 BE)

b)

Berechne die maximale kinetische Energie des $\alpha$-Teilchens, wenn man annimmt, dass der Ausgangskern ruht (Nichtrelativistische Rechnung).

Erläutere, warum auch andere diskrete Energiewerte von $\alpha$-Teilchen vorkommen können. (8 BE)

Es liegt ein Präparat von $1{,}00\,\rm{mg}$ ${{}^{210}{\rm{Po}}}$ vor, das in einer gasdichten, ansonsten zunächst evakuierten Kapsel mit einem Innenvolumen von $12\,\rm{mm}^3$ eingeschlossen ist.

c)

Berechne die totale Wärmeabgabe des Präparats während der ersten $100$ Tage, wenn die gesamte freiwerdende Energie in Wärme umgesetzt wird. (7 BE)

d)

Berechne den Gasdruck, der nach $100$ Tagen bei $20^\circ {\rm{C}}$ in der Kapsel herrscht, wenn alles gebildete Helium dort verbleibt. (6 BE)

## Lösung

**Hinweis:** Bei dieser Lösung von LEIFIphysik handelt es sich nicht um den amtlichen Lösungsvorschlag des bayr. Kultusministeriums.

a)


$$
 \begin{aligned} Q &= \Delta m \cdot c^2 \\ &= \bigl[ m_{\rm A}({}_{84}^{210}\rm Po) - m_{\rm A}({}_{82}^{206}\rm Pb) - m_{\rm A}({}_{2}^{4}\rm He) \bigr] c^2 \\ &= [209{,}982874\,\rm u - 205{,}974465\,\rm u - 4{,}0026036\,\rm u] \cdot c^2 \\ &= 0{,}0058054\,\rm u \cdot c^2 \\ &= 0{,}0058054 \cdot 931{,}49\,\rm MeV \\ &= 5{,}408\,\rm MeV \end{aligned} 
$$


b)

Setzt man den Impulserhaltungssatz 

$$
 m_{\rm \alpha} \cdot v_{\rm \alpha} = m_{\rm Pb} \cdot v_{\rm Pb} \Leftrightarrow v_{\rm Pb} = \frac{m_{\rm \alpha}}{m_{\rm Pb}} \cdot v_{\rm \alpha} 
$$

 in den Energieerhaltungssatz 

$$
 \frac{1}{2} \cdot m_{\rm \alpha} \cdot v_{\rm \alpha}^2 + \frac{1}{2} \cdot m_{\rm Pb} \cdot v_{\rm Pb}^2 = Q 
$$

 ein, so ergibt sich 

$$
 \frac{1}{2} \cdot m_{\rm \alpha} \cdot v_{\rm \alpha}^2 \cdot \left(1 + \frac{m_{\rm \alpha}}{m_{\rm Pb}}\right) = Q 
$$

 Damit erhält man 

$$
 E_{\rm kin,\alpha} = \frac{Q}{1 + \frac{m_{\rm \alpha}}{m_{\rm Pb}}} = Q \cdot \frac{m_{\rm Pb}}{m_{\rm Pb} + m_{\rm \alpha}} 
$$

 Einsetzen der gegebenen Werte liefert (mit zwei gültigen Ziffern Genauigkeit) 

$$
 E_{\rm kin,\alpha} = 5{,}41\,\rm MeV \cdot \frac{206\,\rm u}{206\,\rm u + 4\,\rm u} = 5{,}31\,\rm MeV 
$$

 Es sind auch andere diskrete $\alpha$-Energien möglich, weil diese dann zu Tochterkernen im angeregten Zustand führen, die unter $\gamma$-Emission in den Grundzustand übergehen.

c)

Die Anzahl der Atome, die sich in $1\,\rm mg$ Polonium befinden, berechnet sich zu 

$$
 N_0 = \frac{m}{m_{\rm A}(\rm Po)} 
$$

Einsetzen der gegebenen Werte liefert (mit zwei gültigen Ziffern Genauigkeit)

$$
 N_0 = \frac{1{,}00 \cdot 10^{-6}\,\rm kg}{210 \cdot 1{,}66 \cdot 10^{-27}\,\rm kg} = 2{,}87 \cdot 10^{18} 
$$

 Aus dem Zerfallsgesetz $N(t) = N_0 \cdot e^{-\lambda \cdot t}$ erhält man für die Anzahl der zerfallenen Kerne 

$$
 \Delta N = N_0 \cdot (1 - e^{-\lambda \cdot t}) 
$$

 Für die zu berechnende Wärmeabgabe erhält man damit 

$$
 \Delta W = \Delta N \cdot Q = N_0 \cdot \left(1 - e^{-\frac{\ln (2)}{T_{1/2}} \cdot t}\right) \cdot Q 
$$

Einsetzen der gegebenen Werte liefert (mit zwei gültigen Ziffern Genauigkeit)

$$
 \Delta W = 2{,}87 \cdot 10^{18} \cdot \left(1 - e^{-\frac{\ln 2}{138\,\rm d} \cdot 100\,\rm d}\right) \cdot Q = 1{,}13 \cdot 10^{18} \cdot Q = 6{,}1 \cdot 10^{24}\,\rm eV = 0{,}98\,\rm MJ 
$$


d)

Die Anzahl der Helium-Kerne ist gleich der oben berechneten Anzahl der in $100$ Tagen zerfallenen Polonium-Kerne, d.h. $N_{\rm He} = 1{,}13 \cdot 10^{18}$. Aus der Allgemeinen Gasgleichung 

$$
 p \cdot V = N \cdot k_{\rm B} \cdot T \Leftrightarrow p = \frac{N \cdot k_{\rm B} \cdot T}{V} 
$$

 ergibt sich durch Einsetzen der gegebenen Werte (mit zwei gültigen Ziffern Genauigkeit) 

$$
 p = \frac{1{,}13 \cdot 10^{18} \cdot 1{,}38 \cdot 10^{-23}\,\frac{\rm J}{\rm K} \cdot 293\,\rm K} {12 \cdot 10^{-9}\,\rm m^3} = 3{,}8 \cdot 10^5\,\rm Pa = 3{,}8\,\rm bar 
$$


## Grundwissen
- [Energiebilanz beim Alpha-Zerfall](https://www.leifiphysik.de/kern-teilchenphysik/radioaktivitaet-fortfuehrung/grundwissen/energiebilanz-beim-alpha-zerfall)
