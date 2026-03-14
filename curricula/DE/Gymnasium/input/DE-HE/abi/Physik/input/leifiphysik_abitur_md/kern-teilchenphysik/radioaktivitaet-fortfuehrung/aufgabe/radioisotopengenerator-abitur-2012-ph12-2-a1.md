# Radioisotopengenerator (Abitur BY 2012 Ph12-2 A1)

Quelle: https://www.leifiphysik.de/kern-teilchenphysik/radioaktivitaet-fortfuehrung/aufgabe/radioisotopengenerator-abitur-2012-ph12-2-a1
Originaldatei: `curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/abi/Physik/input/leifiphysik_abitur/pages/kern-teilchenphysik/radioaktivitaet-fortfuehrung/aufgabe/radioisotopengenerator-abitur-2012-ph12-2-a1.html`
Schwierigkeitsgrad: mittelschwere Aufgabe

## Aufgabe

![](https://www.leifiphysik.de/sites/default/files/images/abf44be27714fb79236bde4f00e208da/435Mars_Rover_Curiosity.jpg)

Abb. 1 Marsrover Curiosity

NASA

Seit August 2012 erkundet das Roboterfahrzeug „Curiosity“ die Marsoberfläche. Das Fahrzeug ist mit einem Radioisotopengenerator ausgestattet, der die beim $\alpha$-Zerfall des Isotops $^{{\rm{238}}}{\rm{Pu}}$ entstehende Wärmeleistung nutzt und sie mit Hilfe von Thermoelementen des Wirkungsgrads $5{,}5\,\%$ in elektrische Leistung umwandelt. Die Halbwertszeit von $^{\rm{238}}{\rm{Pu}}$ beträgt $87{,}7\,\rm{a}$, die Atommasse $238{,}049560\,\rm{u}$ ($1\,\rm{u} = 1{,}66054 \cdot 10^{-27}\,\rm{kg}$).

**Hinweis:** Die hier angegebenen Atommassen wurden der AME2016 des [AMDC-Atomic Mass Data Center](https://www-nds.iaea.org/amdc/) entnommen.

a)

Stelle die Zerfallsgleichung für den $\alpha$-Zerfall von$^{{\rm{238}}}{\rm{Pu}}$ auf.

Berechne die gesamte pro Zerfall freiwerdende Energie $Q$. Die Atommasse eines $^{\rm{4}}{\rm{He}}$-Atoms beträgt $4{,}002603\,\rm{u}$, die des Zerfallsprodukts $234{,}040952\,\rm{u}$. [zur Kontrolle: $Q = 5{,}59\,\rm{MeV}$] (6 BE)

b)

Berechne die Wärmeleistung $P$, die in $1{,}0\,\rm{g}$ des Plutoniumisotops aufgrund der Aktivität entsteht. [zur Kontrolle: $P = 0{,}57\,\rm{W}$] (6 BE)

c)

Nach der 250 Tage dauernden Anreise zum Mars soll „Curiosity“ dort ein Marsjahr (687 Tage) lang aktiv sein.

Berechne, um wie viel Prozent die Aktivität des Plutoniums während des Zeitraums vom Start auf der Erde bis zum Ende der Mission gesunken ist. (5 BE)

Für den Betrieb des Marsrovers muss vom Zeitpunkt des Starts bis zum Ende der Mission eine elektrische Leistung von rund $0{,}1\,\rm{kW}$ dauerhaft bereitgestellt werden.

d)

Ermittle unter Berücksichtigung des Wirkungsgrads des Thermoelements die Masse an $^{\rm{238}}{\rm{Pu}}$, die zum Zeitpunkt des Starts im Isotopengenerator dafür eingebaut sein muss. (4 BE)

e)

Vor 40 Jahren wurde im Radioisotopengenerator des sowjetischen Mondrovers „Lunochod“ der $\alpha$-Strahler $^{\rm{210}}{\rm{Po}}$ verwendet.

Tab. 1 Informationen

| Isotop | Atommasse | Wärmeleistung pro Gramm | Halbwertszeit |
| --- | --- | --- | --- |
| $^{\rm{238}}{\rm{Pu}}$ | $238{,}049558\,\rm{u}$ | $0{,}57\,\rm{W}$ | $87{,}7\,\rm{a}$ |
| $^{\rm{210}}{\rm{Po}}$ | $209{,}982874\,\rm{u}$ | $144\,\rm{W}$ | $138\,\rm{d}$ |

Beurteile, ob auch $^{\rm{210}}{\rm{Po}}$ für den Marsrover als Energiequelle geeignet wäre. (5 BE)

## Lösung

**Hinweis:** Bei dieser Lösung von LEIFIphysik handelt es sich nicht um den amtlichen Lösungsvorschlag des bayr. Kultusministeriums.

a)

Zerfallsgleichung: 

$$
 {}_{94}^{238}\mathrm{Pu} \to {}_{92}^{234}\mathrm{U} + {}_{2}^{4}\mathrm{He} 
$$

 Berechnung des $Q$-Wertes der Reaktion: 

$$
 \begin{aligned} Q &= \Delta m \cdot c^2 \\ &= \bigl[ m_{\rm A}({}_{94}^{238}\rm{Pu}) - m_{\rm A}({}_{92}^{234}\rm{U}) - m_{\rm A}({}_{2}^{4}\rm{He}) \bigr] \cdot c^2 \\ &= [238{,}049558\,\rm u - 234{,}040952\,\rm u - 4{,}002603\,\rm u] \cdot c^2 \\ &= 0{,}006003\,\rm u \cdot c^2 \\ &= 0{,}006003 \cdot 931{,}49\,\rm MeV \\ &= 5{,}59\,\rm MeV \end{aligned} 
$$


b)

Die Wärmeleistung ergibt sich aus der Aktivität, das ist die Zahl der Zerfälle pro Sekunde der Probe mit der Masse $m = 1{,}0\,\rm g$ multipliziert mit der Energie, welche bei einer Reaktion frei wird, d.h. dem $Q$-Wert: 

$$
 P_{\rm therm} = A \cdot Q = \lambda \cdot N \cdot Q = \frac{\ln (2)}{T_{1/2}} \cdot \frac{m}{m_{A,0}({}_{94}^{238}\rm Pu)} \cdot Q 
$$

 Einsetzen der gegebenen Werte liefert (mit zwei gültigen Ziffern Genauigkeit) 

$$
 P_{\rm therm} = \frac{\ln (2)}{87{,}7 \cdot 365 \cdot 24 \cdot 3600\,\rm s} \cdot \frac{1{,}0 \cdot 10^{-3}\,\rm kg} {238{,}049560 \cdot 1{,}660540 \cdot 10^{-27}\,\rm kg} \cdot 5{,}591734 \cdot 10^6 \cdot 1{,}6022 \cdot 10^{-19}\,\rm J = 0{,}57\,\rm W 
$$


c)

Für den zeitlichen Verlauf der Aktivität gilt 

$$
 A(t) = A(0) \cdot e^{-\lambda t} \Leftrightarrow \frac{A(t)}{A(0)} = e^{-\lambda \cdot t} = e^{-\frac{\ln (2)}{T_{1/2}} \cdot t} 
$$

 Einsetzen der gegebenen Werte liefert (mit zwei gültigen Ziffern Genauigkeit) 

$$
 \frac{A(t)}{A(0)} = e^{-\frac{\ln (2)}{87{,}7 \cdot 365} \cdot (250 + 687)} = 0{,}980 = 1 - 0{,}020 
$$

 Die Aktivität sinkt bis zum Ende der Mission um ca. $2{,}0\,\%$.

d)

Für die elektrische Leistung der Thermoelemente gilt 

$$
 \eta = \frac{P^\*_{\rm elektr}}{P^\*_{\rm therm}} \Leftrightarrow P^\*_{\rm elektr} = \eta \cdot P^\*_{\rm therm} 
$$

 Berechnung der notwendigen thermischen Leistung $P^\*_{\rm therm}$, die man benötigt, damit eine elektrische Leistung von $0{,}1\,\rm kW$ zur Verfügung steht: 

$$
 P^\*_{\rm therm} = \frac{P^\*_{\rm elektr}}{\eta} 
$$

Einsetzen der gegebenen Werte liefert (mit zwei gültigen Ziffern Genauigkeit)

$$
 P^\*_{\rm therm} = \frac{0{,}1 \cdot 10^3\,\rm W }{0{,}055} = 1{,}8 \cdot 10^3\,\rm W 
$$

 Bei $1{,}0\,\rm g$ Plutonium ergab sich eine Wärmeleistung von ca. $0{,}57\,\rm W$. Mit Hilfe des Dreisatzes kann daher die erforderliche Plutoniummasse $m^\*$ berechnet werden, die man für eine elektrische Leistung von $0{,}1\,\rm kW$ benötigt: 

$$
 \frac{m^\*}{1{,}0 \cdot 10^{-3}\,\rm kg} = \frac{1{,}8 \cdot 10^3}{0{,}57} \Rightarrow m^\* \approx 3\,\rm kg 
$$


e)

Die Wärmeleistung von $^{210}\rm Po$ ist größer als die von $^{238}\rm Pu$. Deshalb könnte man schließen, dass weniger Masse benötigt wird. Allerdings ist die Halbwertszeit von $^{210}\rm Po$ wesentlich kleiner als die von $^{238}\rm Pu$. Am Ende der Mission (Dauer: $937\,\rm d \approx 6{,}8 \cdot T_{1/2}({}^{210}\rm Po)$) würde nur noch ein Bruchteil der Anfangsleistung zur Verfügung stehen. Um am Ende der Mission noch genügend Leistung zur Verfügung zu haben, benötigt man zwar weniger $^{210}\rm Po$ als $^{238}\rm Pu$, allerdings würde wahrscheinlich die sehr hohe Anfangsleistung von $^{210}\rm Po$ problematisch werden.

## Grundwissen
- [Energiebilanz beim Alpha-Zerfall](https://www.leifiphysik.de/kern-teilchenphysik/radioaktivitaet-fortfuehrung/grundwissen/energiebilanz-beim-alpha-zerfall)
