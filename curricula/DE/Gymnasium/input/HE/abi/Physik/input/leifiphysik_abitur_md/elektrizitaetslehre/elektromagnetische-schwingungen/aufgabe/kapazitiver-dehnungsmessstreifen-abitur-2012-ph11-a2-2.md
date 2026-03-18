# Kapazitiver Dehnungsmessstreifen (Abitur BY 2012 Ph11 A2-2)

Quelle: https://www.leifiphysik.de/elektrizitaetslehre/elektromagnetische-schwingungen/aufgabe/kapazitiver-dehnungsmessstreifen-abitur-2012-ph11-a2-2
Originaldatei: `curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/abi/Physik/input/leifiphysik_abitur/pages/elektrizitaetslehre/elektromagnetische-schwingungen/aufgabe/kapazitiver-dehnungsmessstreifen-abitur-2012-ph11-a2-2.html`
Schwierigkeitsgrad: mittelschwere Aufgabe

## Aufgabe

![](https://www.leifiphysik.de/sites/default/files/images/c399e43c0b815a377c424cc3e3c7af11/419kapazitiver-dehnungsmessstreifen-abitur-by-2012-ph11-a2-2_skizze.gif)

Abb. 1 Skizze zur Aufgabe

[CC-BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/deed.de) / FWU Institut für Film und Bild;

In einem Dehnungsmessstreifen wird der Plattenabstand $d$ eines eingebauten Messkondensators durch Dehnung verringert. Als Kondensator wird ein luftgefüllter Plattenkondensator mit quadratischen Platten der Seitenlänge $4{,}0\,\rm{mm}$ verwendet, der im ungedehnten Ausgangszustand des Messstreifens einen Plattenabstand von $1{,}0\,\rm{mm}$ hat.

a)

Berechne die Kapazität $C$ des Messkondensators im Ausgangszustand.

Berechne die Ladung auf dem Kondensator bei einer anliegenden Spannung von $12{,}0\,\rm{V}$. [zur Kontrolle: $C=0{,}14\,\rm{pF}$] (5 BE)

b)

Der Messkondensator wird nach dem Ladevorgang von der Stromquelle getrennt.

Beschreibe und begründe, ob und gegebenenfalls wie sich die Ladung, die Kapazität und die Spannung des Kondensators bei Dehnung des Messstreifens ändern. (5 BE)

Nun bildet der Messkondensator zusammen mit einer Spule ($L=20\,\rm{mH}$) einen elektromagnetischen Schwingkreis.

c)

Berechne die Eigenfrequenz des Schwingkreises ohne Dehnung des Messstreifens. (3 BE)

d)

Leite eine Formel für die Eigenfrequenz $f$ des Schwingkreises in Abhängigkeit vom Plattenabstand $d$ her.

Erläutere, wie sich die Eigenfrequenz des Schwingkreises verändert, wenn aufgrund einer Dehnung des Messstreifens der Plattenabstand halbiert wird. (5 BE)

## Lösung

**Hinweis:** Bei dieser Lösung von LEIFIphysik handelt es sich nicht um den amtlichen Lösungsvorschlag des bayr. Kultusministeriums.

a)

Für die Kapazität $C$ des Kondensators gilt 

$$
 C = \varepsilon_0 \cdot \frac{A}{d}
$$

Einsetzen der gegebenen Werte liefert (mit zwei gültigen Ziffern Genauigkeit)

$$
C = 8{,}85 \cdot 10^{-12}\,\frac{\rm A\,s}{\rm V\,m} \cdot \frac{(4{,}0 \cdot 10^{-3}\,\rm m)^2}{1{,}0 \cdot 10^{-3}\,\rm m} = 0{,}14 \cdot 10^{-12}\,\rm F = 0{,}14\,\rm pF 
$$

 Für die Ladung $Q$ des Kondensators gilt 

$$
 Q = C \cdot U
$$

Einsetzen der gegebenen Werte liefert (mit zwei gültigen Ziffern Genauigkeit)

$$
Q = 0{,}14 \cdot 10^{-12}\,\rm F \cdot 12\,\rm V = 1{,}7 \cdot 10^{-12}\,\rm A\,s 
$$


b)

Da der Kondensator von der Quelle getrennt ist, bleibt die Kondensatorladung konstant. Durch die Dehnung verringert sich der Abstand $d$ und somit wird wegen $C = \varepsilon_0 \cdot \frac{A}{d}$ die Kapazität des Kondensators größer. Wegen $U = \frac{Q}{C}$ sinkt damit die Kondensatorspannung $U$.

c)

Berechnung der Eigenfrequenz $f$ des Schwingkreises nach der THOMSON-Formel: 

$$
 f = \frac{1}{2 \,\pi \cdot \sqrt{L \cdot C}}
$$

Einsetzen der gegebenen Werte liefert (mit zwei gültigen Ziffern Genauigkeit)

$$
f = \frac{1}{2 \,\pi \cdot \sqrt{20 \cdot 10^{-3}\,\frac{\rm V\,s}{\rm A} \cdot 0{,}14 \cdot 10^{-12}\,\frac{\rm A\,s}{\rm V}}} = 3{,}0\,\rm MHz 
$$


d)

Herleitung der Formel: 

$$
 f = \frac{1}{2 \pi \cdot \sqrt{L \cdot C}} = \frac{1}{2 \,\pi \cdot \sqrt{L \cdot \varepsilon_0 \cdot \frac{A}{d}}} = \frac{1}{2 \,\pi \cdot \sqrt{L \cdot \varepsilon_0 \cdot A}} \cdot \sqrt{d} 
$$

 Wenn der Plattenabstand $d$ halbiert wird, verkleinert sich die Eigenfrequenz $f$. Bezeichnet man die neue Eigenfrequenz mit $f^\*$, so gilt 

$$
 f^\* = \frac{f}{\sqrt{2}} = \frac{\sqrt{2}}{2} \cdot f 
$$


## Grundwissen
- [Elektromagnetischer Schwingkreis ungedämpft](https://www.leifiphysik.de/elektrizitaetslehre/elektromagnetische-schwingungen/grundwissen/elektromagnetischer-schwingkreis-ungedaempft)
