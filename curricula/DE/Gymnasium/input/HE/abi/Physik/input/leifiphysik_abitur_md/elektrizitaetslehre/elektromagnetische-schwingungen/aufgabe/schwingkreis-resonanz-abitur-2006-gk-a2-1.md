# Schwingkreis in Resonanz (Abitur BY 2006 GK A2-1)

Quelle: https://www.leifiphysik.de/elektrizitaetslehre/elektromagnetische-schwingungen/aufgabe/schwingkreis-resonanz-abitur-2006-gk-a2-1
Originaldatei: `curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/abi/Physik/input/leifiphysik_abitur/pages/elektrizitaetslehre/elektromagnetische-schwingungen/aufgabe/schwingkreis-resonanz-abitur-2006-gk-a2-1.html`
Schwierigkeitsgrad: mittelschwere Aufgabe

## Aufgabe

![](https://www.leifiphysik.de/sites/default/files/images/1518f15f259ae0a730e937d278885d13/217schwingkreis-in-resonanz-abitur-by-2006-gk-a2-1_skizze1.gif)

Abb. 1 Schaltskizze zur Aufgabe

[CC-BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/deed.de) / FWU Institut für Film und Bild;

Aus einer Spule (Länge $25{,}0\,\rm{mm}$, Durchmesser $6{,}0\,\rm{mm}$, $160$ Windungen) und einem Kondensator der Kapazität $4{,}2\,\rm{nF}$ wird ein Schwingkreis aufgebaut (Abb. 1).

a)

Durch einen Resonanzversuch soll die Eigenfrequenz des Schwingkreises bestimmt werden. Es steht ein Frequenzgenerator sowie ein Oszilloskop zur Verfügung.

Skizziere einen geeigneten Versuchsaufbau.

Beschreibe, wie die Eigenfrequenz am Oszilloskop bestimmt werden kann. (7 BE)

b)

Berechne die Frequenz, für die Resonanz zu erwarten ist. (5 BE)

c)

Die tatsächlich gemessene Resonanzfrequenz stimmt mit dem Ergebnis von Teilaufgabe b) nicht genau überein.

Gib eine kurze Begründung dafür an. (2 BE)

## Lösung

**Hinweis:** Bei dieser Lösung von LEIFIphysik handelt es sich nicht um den amtlichen Lösungsvorschlag des bayr. Kultusministeriums.

a)

![](https://www.leifiphysik.de/sites/default/files/images/d2e0b8c154d621618ad91dd2dd624886/217schwingkreis-in-resonanz-abitur-by-2006-gk-a2-1_skizze2.gif)

Abb. 2 Schaltskizze zur Lösung von Aufgabenteil a)

[CC-BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/deed.de) / FWU Institut für Film und Bild;

Man baut z.B. den Frequenzgenerator in den Kreis ein. Damit entsteht ein sogenannter Serienresonanzkreis. Das Oszilloskop wird z.B. parallel zum Kondensator angebracht. Man steigert nun mit dem Generator - bei niedrigen Frequenzen beginnend - die Frequenz. Im Resonanzfall weist der Serienresonanzkreis ein Strommaximum auf. Dies erkennt man daran, dass die am Kondensator abfallende, mit dem Oszilloskop nachweisbare Spannung dann maximal ist (erkennbar an der maximalen Amplitude der am Oszilloskop sichtbaren Sinusschwingung).

b)

Berechnung der Induktivität $L$ aus den Spulendaten: 

$$
L = \mu_0 \cdot A \cdot \frac{N^2}{l} = \mu_0 \cdot \left( \frac{d}{2} \right)^2 \cdot \pi \cdot \frac{N^2}{l}
$$

Einsetzen der gegebenen Werte liefert (mit zwei gültigen Ziffern Genauigkeit)

$$
L = 1{,}256 \cdot 10^{-6}\,\frac{\rm{V\,s}}{\rm{A\,m}} \cdot \left( \frac{6,0 \cdot 10^{-3}\,\rm{m}}{2} \right)^2 \cdot \pi \cdot \frac{160^2}{25{,}0 \cdot 10^{-3}\,\rm{m}}= 36{,}4\,\rm{\mu H}
$$

 Berechnung der Resonanzfrequenz mit Hilfe der THOMSON-Formel: 

$$
f = \frac{1}{2 \, \pi } \cdot \sqrt {\frac{1}{L \cdot C}} 
$$

Einsetzen der gegebenen Werte liefert (mit zwei gültigen Ziffern Genauigkeit)

$$
f = \frac{1}{{2 \, \pi }} \cdot \sqrt {\frac{1}{36{,}4 \cdot 10^{-6}\,\rm{H} \cdot 4{,}2 \cdot 10^{-9}\,\rm{F}}} = 0{,}41\rm{MHz}
$$


c)

Die Formel für die Berechnung der Induktivität bezieht sich auf langgestreckte Zylinderspulen, bei denen $\ell  \gg d$ ist. Diese Bedingung ist bei den gegebenen Werten nicht gut erfüllt.

Bei Verwendung einer realen Spule ist der Schwingkreis gedämpft. Die Resonanzfrequenz beim gedämpften Schwingkreis ist gegenüber dem ungedämpften Fall leicht verschoben.

## Grundwissen
- [Elektromagnetischer Schwingkreis angeregt](https://www.leifiphysik.de/elektrizitaetslehre/elektromagnetische-schwingungen/grundwissen/elektromagnetischer-schwingkreis-angeregt)
