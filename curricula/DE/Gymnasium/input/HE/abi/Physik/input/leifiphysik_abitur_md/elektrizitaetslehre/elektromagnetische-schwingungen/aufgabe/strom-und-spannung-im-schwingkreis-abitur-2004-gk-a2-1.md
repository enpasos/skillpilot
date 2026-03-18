# Strom und Spannung im Schwingkreis (Abitur BY 2004 GK A2-1)

Quelle: https://www.leifiphysik.de/elektrizitaetslehre/elektromagnetische-schwingungen/aufgabe/strom-und-spannung-im-schwingkreis-abitur-2004-gk-a2-1
Originaldatei: `curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/abi/Physik/input/leifiphysik_abitur/pages/elektrizitaetslehre/elektromagnetische-schwingungen/aufgabe/strom-und-spannung-im-schwingkreis-abitur-2004-gk-a2-1.html`
Schwierigkeitsgrad: mittelschwere Aufgabe

## Aufgabe

Ein idealer Schwingkreis, der aus der Kapazität $C = 44\,\rm{pF}$ und der Induktivität $L = 3{,}0\,\rm{\mu H}$ besteht, schwingt ungedämpft. Zum Zeitpunkt $t = 0$ ist der Kondensator vollständig aufgeladen, die Spannung beträgt dann $12\,\rm{V}$.

a)

Berechne die Schwingungsdauer $T$. [zur Kontrolle: $T = 7{,}2 \cdot 10^{-8}\,\rm{s}$] (2 BE).

b)

Ermittle den Zeitpunkt, zu dem der Kondensator nach $t = 0$ erstmals vollständig entladen ist. [zur Kontrolle: $t = 1{,}8 \cdot 10^{-8}\,\rm{s}$]

Bestimme die Stromstärke $I$ zu diesem Zeitpunkt [zur Kontrolle: $I = 46\,\rm{mA}$] (6 BE)

c)

Zeichne mit Hilfe der Teilaufgaben a) und b) den zeitlichen Verlauf der Spannung und der Stromstärke innerhalb einer Schwingungsdauer. (6 BE)

d)

Erläutere allgemein das Prinzip von Schaltungen, die es ermöglichen, einen realen Schwingkreis zu ungedämpften Schwingungen anzuregen. (6 BE)

## Lösung

**Hinweis:** Bei dieser Lösung von LEIFIphysik handelt es sich nicht um den amtlichen Lösungsvorschlag des bayr. Kultusministeriums.

a)

Berechnung der Schwingungsdauer nach der THOMSON-Formel 

$$
 T = 2 \,\pi \sqrt{L \cdot C}
$$

Einsetzen der gegebenen Werte liefert (mit zwei gültigen Ziffern Genauigkeit)

$$
T = 2 \,\pi \sqrt{3{,}0 \cdot 10^{-6}\, \frac{\rm{V\,s}}{\rm A} \cdot 44 \cdot 10^{-12}\, \frac{\rm{A\,s}}{V}} = 7{,}2 \cdot 10^{-8} \,\rm{s} 
$$


b)

Der Kondensator ist nach der Zeit $\frac{T}{4} = 1{,}8 \cdot 10^{-8}\, \rm{s}$ zum ersten Mal vollständig entladen. Berechnung der Stromstärke aus einer Energiebetrachtung: Zum Zeitpunkt $t = 0$ liegt die Gesamtenergie im Kreis ausschließlich als elektrische Energie im Kondensator vor. Zum Zeitpunkt $t = \frac{T}{4}$ liegt die Gesamtenergie ausschließlich als magnetische Energie der Spule vor. Da der Kreis ungedämpft schwingt, gilt 

$$
 \frac{1}{2}\cdot L \cdot I_{\rm{max}}^2 = \frac{1}{2} \cdot C \cdot U_{\rm{max}}^2 \Leftrightarrow I_{\rm{max}} = U_{\rm{max}} \cdot \sqrt{\frac{C}{L}}
$$

Einsetzen der gegebenen Werte liefert (mit zwei gültigen Ziffern Genauigkeit)

$$
I_{\rm{max}} = 12\,\rm{V} \cdot \sqrt{\frac{44 \cdot 10^{-12}\, \frac{\rm{A\,s}}{\rm{V}}} {3{,}0 \cdot 10^{-6} \frac{\rm{V\,s}}{\rm A}}} = 46\,\rm{mA} 
$$


c)

![](https://www.leifiphysik.de/sites/default/files/2026/01/image/strom-und-spannung-im-schwingkreis-abitur-by-2004-gk-a2-1_diagramm.svg)

Abb. 1 Diagramm zur Lösung von Aufgabenteil c)

[CC-BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/deed.de) / FWU Institut für Film und Bild;

d)

Das zur Erzeugung ungedämpfter Schwingungen benutzte Prinzip ist das der Rückkopplung. Man entnimmt dem Schwingkreis zum Beispiel durch eine Koppelspule ein Signal, das einem Verstärker zugeführt wird. Das verstärkte Signal wird zur phasenrichtigen Anregung des Schwingkreises benutzt.

![](https://www.leifiphysik.de/sites/default/files/2026/01/image/strom-und-spannung-im-schwingkreis-abitur-by-2004-gk-a2-1_skizze1.svg)

Abb. 2 Skizze zur Lösung von Aufagbenteil d)

[CC-BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/deed.de) / FWU Institut für Film und Bild;

Als Verstärker kann z.B. eine Triode dienen.

![](https://www.leifiphysik.de/sites/default/files/2026/01/image/strom-und-spannung-im-schwingkreis-abitur-by-2004-gk-a2-1_skizze2.svg)

Abb. 3 Skizze zur Lösung von Aufgabenteil d)

[CC-BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/deed.de) / FWU Institut für Film und Bild;

## Grundwissen
- [Elektromagnetischer Schwingkreis ungedämpft](https://www.leifiphysik.de/elektrizitaetslehre/elektromagnetische-schwingungen/grundwissen/elektromagnetischer-schwingkreis-ungedaempft)
