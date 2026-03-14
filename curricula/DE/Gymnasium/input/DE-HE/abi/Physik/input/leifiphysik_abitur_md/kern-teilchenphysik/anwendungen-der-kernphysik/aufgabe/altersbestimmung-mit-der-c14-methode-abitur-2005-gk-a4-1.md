# Altersbestimmung mit der C14-Methode (Abitur BY 2005 GK A4-1)

Quelle: https://www.leifiphysik.de/kern-teilchenphysik/anwendungen-der-kernphysik/aufgabe/altersbestimmung-mit-der-c14-methode-abitur-2005-gk-a4-1
Originaldatei: `curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/abi/Physik/input/leifiphysik_abitur/pages/kern-teilchenphysik/anwendungen-der-kernphysik/aufgabe/altersbestimmung-mit-der-c14-methode-abitur-2005-gk-a4-1.html`
Schwierigkeitsgrad: mittelschwere Aufgabe

## Aufgabe

Durch die kosmische Strahlung entstehen in der Atmosphäre schnelle Neutronen. Trifft ein solches Neutron auf einen Stickstoffkern ${}^{14}{\rm{N}}$, so kommt es gelegentlich zur Kernumwandlung in das Kohlenstoffisotop ${}^{14}{\rm{C}}$.

a)

Gib die Reaktionsgleichung an. (3 BE)

${}^{14}{\rm{C}}$ ist radioaktiv. Es zerfällt unter Aussendung eines $\beta^{-}$-Teilchens mit einer Halbwertszeit von $5{,}7 \cdot 10^3$ Jahren.

b)

Erläutere die Entstehung des $\beta^{-}$-Teilchens.

Gib die Zerfallsgleichung beim ${}^{14}{\rm{C}}$-Zerfall an. (3 BE)

c)

Die entstandenen $\beta^{-}$-Teilchen besitzen keine einheitliche Energie.

Skizziere das Energiespektrum der $\beta^{-}$-Teilchen.

Erkläre das Zustandekommen dieses Energiespektrums. (4 BE)

In der Atmosphäre stellt sich zwischen dem radioaktiven und dem stabilen Kohlenstoff ein Gleichgewicht ein, so dass pro Gramm Kohlenstoff $15{,}3$ Zerfälle pro Minute stattfinden. In diesem Gleichgewichtsverhältnis findet man den radioaktiven Kohlenstoff auch in lebenden Organismen. Beim Absterben des Organismus hört jegliche Aufnahme von Kohlenstoff auf und die Aktivität nimmt im Lauf der Zeit ab.

In einem alten Holzstück ist Kohlenstoff der Masse $50\,\rm{g}$ enthalten; der ${}^{14}{\rm{C}}$-Anteil beträgt $4{,}4 \cdot 10^{-12}\,\rm{g}$.

d)

Berechne für diese Probe die Anzahl der darin enthaltenen ${}^{14}{\rm{C}}$-Atome und damit die Aktivität pro $1\,\rm{g}$ Kohlenstoff. [zur Kontrolle: $\frac{A}{m} = 0{,}015\,\frac{\rm{Bq}}{\rm{g}}$] (9 BE)

e)

Schätze mit Hilfe der Halbwertszeit ab, ob die Probe älter als $20\,000$ Jahre sein kann. (5 BE)

## Lösung

**Hinweis:** Bei dieser Lösung von LEIFIphysik handelt es sich nicht um den amtlichen Lösungsvorschlag des bayr. Kultusministeriums.

a)

Die Reaktionsgleichung lautet 

$$
{}_7^{14}{\rm{N}} + {}_0^1{\rm{n}} \to {}_6^{14}{\rm{C}} + {}_1^1{\rm{p}}
$$


b)

Im zerfallenden Kern wandelt sich ein Neutron in ein Proton um. Aus Gründen der Ladungserhaltung muss somit ein negatives Teilchen emittiert werden.

$$
{}_6^{14}{\rm{C}} \to {}_7^{14}{\rm{N}} + {}_{ - 1}^0{\rm{e}} + \bar \nu_{\rm{e}} 
$$


c)

![](https://www.leifiphysik.de/sites/default/files/images/8443e8c35d71d6f2393cd0d87f208f0d/265altersbestimmung-mit-der-c14-methode-abitur-by-2005-gk-a4-1_diagramm.gif)

Abb. 1 Skizze zur Lösung von Aufgabenteil c)

[CC-BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/deed.de) / FWU Institut für Film und Bild;

Das kontinuierliche Spektrum der emittierten Elektronen kann dadurch verstanden werden, dass sich die Reaktionsenergie und der Impuls nicht nur auf zwei Endprodukte (Elektron und Stickstoffkern), sondern auf drei Endprodukte verteilt. Nur durch die Existenz des Anti-Elektronneutrinos wird das kontinuierliche $\beta^{-}$-Spektrum verständlich.

d)

Die Teilchenzahl $N$ berechnet man durch 

$$
 N = \frac{m(^{14}\rm C)}{m_{\rm A}(^{14}\rm C)} = \frac{4{,}4 \cdot 10^{-15}\,\rm kg}{14 \cdot 1{,}66 \cdot 10^{-27}\,\rm kg} = 1{,}9 \cdot 10^{11} 
$$

 Für den Zusammenhang zwischen der Zahl der noch unzerfallenen Teilchen und der Aktivität gilt 

$$
 A(t) = \lambda \cdot N(t) = \frac{\ln 2}{T_{1/2}} \cdot N(t) \Leftrightarrow \frac{A(t)}{m(\rm C)} = \frac{\ln 2}{T_{1/2} \cdot m(\rm C)} \cdot N(t) 
$$

 Einsetzen der gegebenen Werte liefert (mit zwei gültigen Ziffern Genauigkeit) 

$$
 \frac{A(t)}{m(\rm C)} = \frac{\ln 2}{5{,}7 \cdot 10^3 \cdot 365 \cdot 24 \cdot 3600\,\rm s \cdot 50\,\rm g} \cdot 1{,}9 \cdot 10^{11} = 0{,}015\,\frac{\rm Bq}{\rm g} 
$$


e)

Für den zeitlichen Verlauf der Aktivität gilt 

$$
 \begin{aligned} A(t) &= A_0 \cdot e^{ -\lambda t}\\ -\lambda t &= \ln \left( \frac{A(t)}{A_0} \right) \\ t &= \frac{ -\ln \left( \frac{A(t)}{A_0} \right) }{\lambda}\\ &= \frac{ -\ln \left( \frac{A(t)}{A_0} \right) }{\ln 2} \cdot T_{1/2} \end{aligned} 
$$

 Einsetzen der gegebenen Werte liefert (mit zwei gültigen Ziffern Genauigkeit) 

$$
 t = \frac{ -\ln \left( \frac{0{,}015\,\rm Bq}{15{,}3 \cdot \frac{1}{60\,\rm s}} \right) }{\ln 2} \cdot 5{,}7 \cdot 10^3\,\rm a = 2{,}3 \cdot 10^4\,\rm a = 23000\,\rm a 
$$

 Die Probe ist also älter als 20\,000 Jahre.

## Grundwissen
- [Altersbestimmung mit der Radiocarbonmethode](https://www.leifiphysik.de/kern-teilchenphysik/anwendungen-der-kernphysik/grundwissen/altersbestimmung-mit-der-radiocarbonmethode)
