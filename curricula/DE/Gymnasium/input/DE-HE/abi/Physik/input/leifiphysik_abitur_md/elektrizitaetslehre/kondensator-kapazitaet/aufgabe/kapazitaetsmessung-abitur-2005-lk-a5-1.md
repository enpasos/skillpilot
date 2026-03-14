# Kapazitätsmessung (Abitur BY 2005 LK A5-1)

Quelle: https://www.leifiphysik.de/elektrizitaetslehre/kondensator-kapazitaet/aufgabe/kapazitaetsmessung-abitur-2005-lk-a5-1
Originaldatei: `curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/abi/Physik/input/leifiphysik_abitur/pages/elektrizitaetslehre/kondensator-kapazitaet/aufgabe/kapazitaetsmessung-abitur-2005-lk-a5-1.html`
Schwierigkeitsgrad: mittelschwere Aufgabe

## Aufgabe

Ein Kondensator der Kapazität $C$ wird über einen Widerstand $R$ entladen. Für den zeitlichen Verlauf der Stromstärke $I$ gilt dabei 

$$
I(t) = I_0 \cdot e^{-\;\frac{1}{R \cdot C} \cdot t}
$$


a)

Erläutere durch eine allgemeine Rechnung, dass sich bei logarithmischer Auftragung von $I(t)/I_0$ über $t$ eine Gerade ergibt. (4 BE)

Bei einem Kondensator mit unbekannter Kapazität $C$ wurden für $R = 10\,\rm{M\Omega}$ folgende Messwerte aufgenommen:

|  |  |  |  |  |  |
| --- | --- | --- | --- | --- | --- |
| $t\;{\rm{in\;s}}$ | $0$ | $45$ | $80$ | $115$ | $155$ |
| $I\;{\rm{in\;mA}}$ | $9{,}5$ | $3{,}9$ | $2{,}0$ | $1{,}0$ | $0{,}5$ |

b)

Zeichne das zugehörige $t$-$\ln \left( I(t)/I_0 \right)$-Diagramm.

Ermittle mit Hilfe der Steigung einer Ausgleichsgeraden die Kondensatorkapazität $C$. (9 BE)

## Lösung

**Hinweis:** Bei dieser Lösung von LEIFIphysik handelt es sich nicht um den amtlichen Lösungsvorschlag des bayr. Kultusministeriums.

a)

![](https://www.leifiphysik.de/sites/default/files/images/1d2746f40fc41543bdedaa43f93243c6/496kapazitaetsmessung-abitur-by-2005-kl-a5-1_diagramm.gif)

Abb. 1 $t$-$\ln \left( I(t)/I_0 \right)$-Diagramm

[CC-BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/deed.de) / FWU Institut für Film und Bild;


$$
I(t) = I_0 \cdot e^{-\;\frac{1}{{R \cdot C}} \cdot t} \Leftrightarrow \frac{I(t)}{I_0} = e^{-\;\frac{1}{R \cdot C} \cdot t} \Leftrightarrow \ln \left( \frac{I(t)}{I_0} \right) = -\;\frac{1}{R \cdot C} \cdot t
$$

Trägt man ${\ln \left( {I(t)/{I_0}} \right)}$ über $t$ auf, so ergibt sich eine Ursprungsgerade mit der Steigung $m = - \;\frac{1}{R \cdot C}$.

|  |  |  |  |  |  |
| --- | --- | --- | --- | --- | --- |
| $t\;{\rm{in\;s}}$ | $0$ | $45$ | $80$ | $115$ | $155$ |
| $I\;{\rm{in\;mA}}$ | $9{,}5$ | $3{,}9$ | $2{,}0$ | $1{,}0$ | $0{,}5$ |
| ${\ln \left( {I/{I_0}} \right)}$ | $0$ | $-0{,}89$ | $-1{,}56$ | $-2{,}25$ | $-2{,}94$ |

b)

Für die Steigung $m$ der Ausgleichsgeraden gilt 

$$
 m = \frac{-2{,}9}{150\,\rm s} = -0{,}019\,\frac{1}{\rm s} 
$$

 Berechnung von $C$: 

$$
 m = -\frac{1}{R \cdot C} \Leftrightarrow C = -\frac{1}{R \cdot m} \Rightarrow C = -\frac{1}{10 \cdot 10^6\,\Omega \cdot \left(-0{,}019\,\frac{1}{\rm s}\right)} = 5{,}3\,\rm {\mu F} 
$$


## Grundwissen
- [Ein- und Ausschalten von RC-Kreisen](https://www.leifiphysik.de/elektrizitaetslehre/kondensator-kapazitaet/grundwissen/ein-und-ausschalten-von-rc-kreisen)
- [Auswerten von Entladekurven](https://www.leifiphysik.de/elektrizitaetslehre/kondensator-kapazitaet/grundwissen/auswerten-von-entladekurven)
