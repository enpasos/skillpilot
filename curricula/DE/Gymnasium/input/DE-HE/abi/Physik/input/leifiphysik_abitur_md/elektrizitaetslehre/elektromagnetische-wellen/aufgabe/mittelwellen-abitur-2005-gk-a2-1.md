# Mittelwellen (Abitur BY 2005 GK A2-1)

Quelle: https://www.leifiphysik.de/elektrizitaetslehre/elektromagnetische-wellen/aufgabe/mittelwellen-abitur-2005-gk-a2-1
Originaldatei: `curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/abi/Physik/input/leifiphysik_abitur/pages/elektrizitaetslehre/elektromagnetische-wellen/aufgabe/mittelwellen-abitur-2005-gk-a2-1.html`
Schwierigkeitsgrad: mittelschwere Aufgabe

## Aufgabe

Ein Mittelwellenempfänger soll Radiosignale im Frequenzbereich von $530\,\rm{kHz}$ bis $1600\,\rm{kHz}$ empfangen.

a)

Begründe durch eine Rechnung, dass selbst bei der kürzesten in Frage kommenden Wellenlänge die benötigten Empfangsdipole bei Resonanzanregung auf Grund ihrer Länge in der Praxis nicht geeignet sind. (5 BE)

Statt eines Empfangsdipols verwendet man im Mittelwellenbereich sogenannte Ferritantennen. Diese sind im Wesentlichen Spulen mit Ferritkern, die mit einem Kondensator einen Schwingkreis bilden. Der Schwingkreis wird in Resonanz mit der zu empfangenden elektromagnetischen Welle abgestimmt. Die im Empfänger benutzte Ferritantenne hat eine Induktivität von $0{,}22\,\rm{mH}$. Die Kapazität ist ein Drehkondensator und damit variabel.

b)

Berechne, zwischen welchen Kapazitätswerten der Drehkondensator variiert werden können muss, damit über den gesamten oben genannten Frequenzbereich Resonanz möglich ist (5 BE)

Im Gegensatz zum Empfang werden bei der Erzeugung von Mittelwellen durchaus Dipole eingesetzt.

c)

Begründe, warum die Dipolschwingungen stets gedämpft sind. (4 BE)

d)

Mit der Aufschrift AM bei der Wahltaste für den Mittelwellenempfang an einem Radiogerät bedeutet Amplitudenmodulation. Als Signal soll ein Ton mit bestimmter Frequenz übertragen werden.

Zeichne qualitativ in einem geeigneten Diagramm die amplitudenmodulierte Trägerschwingung.

Kennzeichne die Schwingungsdauern von Träger- und Signalschwingung. (4 BE)

## Lösung

**Hinweis:** Bei dieser Lösung von LEIFIphysik handelt es sich nicht um den amtlichen Lösungsvorschlag des bayr. Kultusministeriums.

a)

Auf dem Dipol kommt es zur Ausbildung stehender Wellen (z. B. E-Feld-Knoten an den Rändern). Die Dipollänge ist stets ein natürliches Vielfaches der halben Wellenlänge: 

$$
 l = k \cdot \frac{\lambda}{2} \;;\; k \in \mathbb{N} 
$$

 Für die minimale Dipollänge ($k = 1$) gilt dann 

$$
 l_{\rm min} = \frac{\lambda_{\rm min}}{2} = \frac{c}{2 \cdot f_{\rm max}}
$$

Einsetzen der gegebenen Werte liefert (mit zwei gültigen Ziffern Genauigkeit)

$$
l_{\rm min} = \frac{3{,}0 \cdot 10^8\,\frac{\rm m}{\rm s}}{2 \cdot 1600 \cdot 10^3\,\rm Hz} = 94\,\rm m 
$$


b)

Für die Resonanzfrequenz gilt die THOMSON-Formel 

$$
 f = \frac{1}{2\, \pi \cdot \sqrt{L \cdot C}} \Rightarrow C = \frac{1}{L \cdot (2\, \pi \cdot  f)^2} 
$$

 Für die maximale Frequenz braucht man den kleinsten Kapazitätswert: 

$$
 C_{\rm min} = \frac{1}{L \cdot (2\, \pi \cdot f_{\rm max})^2}
$$

Einsetzen der gegebenen Werte liefert (mit zwei gültigen Ziffern Genauigkeit)

$$
C_{\rm min} = \frac{1}{0{,}22 \cdot 10^{-3}\,\rm H \cdot (2\, \pi \cdot 1600 \cdot 10^3\,\rm Hz)^2} = 4{,}5 \cdot 10^{-11}\,\rm F 
$$

 Analog ergibt sich 

$$
 C_{\rm max} = \frac{1}{L \cdot (2 \, \pi \cdot f_{\rm min})^2}
$$

Einsetzen der gegebenen Werte liefert (mit zwei gültigen Ziffern Genauigkeit)

$$
C_{\rm max} = \frac{1}{0{,}22 \cdot 10^{-3}\,\rm H \cdot (2\, \pi \cdot 530 \cdot 10^3\,\rm Hz)^2} = 4{,}1 \cdot 10^{-10}\,\rm F 
$$


c)

Auch die Dipole haben einen – zwar sehr kleinen – OHMschen Widerstand. Entscheidender ist jedoch die sogenannte Strahlungsdämpfung. Durch die Abstrahlung von elektromagnetischen Wellen wird die Dipolschwingung gedämpft (Energieverlust durch Abstrahlung elektromagnetischer Energie).

d)

![](https://www.leifiphysik.de/sites/default/files/images/213103458218deece0f5ad748fb262c1/504mittelwellen-abitur-by-2005-gk-a2-1_diagramm.gif)

Abb. 1 Diagramm zur Lösung von Aufgabenteil d)

[CC-BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/deed.de) / FWU Institut für Film und Bild;

## Grundwissen
- [Ausbreitung Elektromagnetischer Wellen](https://www.leifiphysik.de/elektrizitaetslehre/elektromagnetische-wellen/grundwissen/ausbreitung-elektromagnetischer-wellen)
