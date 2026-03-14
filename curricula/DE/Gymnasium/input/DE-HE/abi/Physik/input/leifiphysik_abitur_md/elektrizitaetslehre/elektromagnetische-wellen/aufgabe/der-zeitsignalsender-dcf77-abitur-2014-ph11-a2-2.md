# Der Zeitsignalsender DCF77 (Abitur BY 2014 Ph11 A2-2)

Quelle: https://www.leifiphysik.de/elektrizitaetslehre/elektromagnetische-wellen/aufgabe/der-zeitsignalsender-dcf77-abitur-2014-ph11-a2-2
Originaldatei: `curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/abi/Physik/input/leifiphysik_abitur/pages/elektrizitaetslehre/elektromagnetische-wellen/aufgabe/der-zeitsignalsender-dcf77-abitur-2014-ph11-a2-2.html`
Schwierigkeitsgrad: mittelschwere Aufgabe

## Aufgabe

In der Nähe von Frankfurt strahlt der Langwellensender DCF77 mit der Frequenz $f=77{,}5\,\rm{kHz}$ ein Zeitsignal für Funkuhren aus.

a)

Zeige, dass die Wellenlänge $\lambda=3{,}87\,\rm{km}$ beträgt.

Begründe, dass für den Empfang des Signals durch Funkuhren eine Dipolantenne in der Grundschwingung nicht geeignet ist. (5 BE)

In einer Funkuhr dient eine auf einem Ferritstab gewickelte zylinderförmige Spule zum Empfang des Signals. Die Spule besitzt $N=150$ Windungen, den Radius $r=5{,}8\,\rm{mm}$ und die Länge$l=4{,}5\,\rm{cm}$. Gemeinsam mit einem Kondensator der Kapazität $C=3{,}3\,\rm{nF}$ bildet sie einen auf die Sendefrequenz $f$ abgestimmten Schwingkreis.

b)

Berechne die Induktivität

$$
L_0 = \mu_0 \cdot \frac{\pi \cdot r^2 \cdot N^2}{l}
$$

der Spule ohne Ferritstab sowie die Induktivität $L$, die der Schwingkreis benötigt, um auf die Frequenz $f$ abgestimmt zu sein.

Bestimme mithilfe des Zusammenhangs $L=\mu_{\rm r} \cdot L_0$ die sogenannte Permeabilitätszahl $\mu_{\rm r}$ des Ferritstabs. (8 BE)

![](https://www.leifiphysik.de/sites/default/files/2026/01/image/der-zeitsignalsender-dcf77-abitur-by-2014-ph11-a2-2_skizze1.svg)

Abb. 1 Skizze zu den Aufgabenteilen c) - e)

[CC-BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/deed.de) / FWU Institut für Film und Bild;

Bei einem Empfänger, der $819\,\rm{km}$ vom Sender entfernt ist, trifft das Signal auf zwei Wegen mit näherungsweise gleicher Intensität ein: Die Bodenwelle breitet sich parallel zur Erdoberfläche aus, die zunächst vereinfachend als ebene Fläche angenommen wird. Die Raumwelle wird in der Höhe $h = 80{,}0\,\rm{km}$ an einer Atmosphärenschicht in Richtung des Empfängers reflektiert.

c)

Bestätige rechnerisch, dass die Raumwelle einen $15{,}5\,\rm{km}$ längeren Weg zum Empfänger zurücklegt als die Bodenwelle.

Begründe im Anschluss, dass man bei ausschließlicher Berücksichtigung dieser Wegdifferenz ein Interferenzmaximum beim Empfänger vermuten müsste. (8 BE)

d)

Tatsächlich findet beim Empfänger eine Auslöschung des Signals statt, da die Reflexion der Raumwelle an der Atmosphärenschicht einen sogenannten Phasensprung der Welle bewirkt, der den Gangunterschied von Boden- und Raumwelle um den Bruchteil $z$ mit $0 < z \le 1$ einer Wellenlänge vergrößert.

Gib $z$ an.

Begründe deine Antwort. (3 BE)

e)

Beim Empfang des Zeitsignals in größeren Entfernungen vom Sender DCF77 ist die Erdkrümmung zu berücksichtigen.

Veranschauliche in einer Zeichnung, dass die Raumwelle bei einmaliger Reflexion an einer Atmosphärenschicht eine begrenzte Reichweite hat. (5 BE)

## Lösung

**Hinweis:** Bei dieser Lösung von LEIFIphysik handelt es sich nicht um den amtlichen Lösungsvorschlag des bayr. Kultusministeriums.

a)

![](https://www.leifiphysik.de/sites/default/files/2026/01/image/der-zeitsignalsender-dcf77-abitur-by-2014-ph11-a2-2_skizze2.svg)

Abb. 2 Skizze zur Lösung von Aufgabenteil a)

[CC-BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/deed.de) / FWU Institut für Film und Bild;

Berechnung der Wellenlänge: 

$$
 c = f \cdot \lambda \Leftrightarrow \lambda = \frac{c}{f} \Rightarrow \lambda = \frac{300 \cdot 10^6\,\frac{\rm m}{\rm s}}{77{,}5 \cdot 10^3\,\rm Hz} = 3{,}87 \cdot 10^3\,\rm m 
$$

 Für eine Dipol-Antenne in der Grundschwingung gilt 

$$
 l = \frac{\lambda}{2} = 1{,}94\,\rm km 
$$

 Diese Dipollänge wäre für Funkuhren unrealistisch.

b)

Aus 

$$
 L_0 = \mu_0 \cdot \frac{\pi \cdot r^2 \cdot N^2}{l} 
$$

 ergibt sich durch Einsetzen der gegebenen Werte 

$$
 L_0 = 4 \,\pi \cdot 10^{-7}\,\frac{\rm V\,s}{\rm A\,m} \cdot \frac{\pi \cdot (5{,}8 \cdot 10^{-3}\,\rm m)^2 \cdot (150)^2}{4{,}5 \cdot 10^{-2}\,\rm m} = 6{,}6 \cdot 10^{-5}\,\frac{\rm V\,s}{\rm A} 
$$

 Berechnung der Induktivität $L$, bei welcher Schwingkreis auf die Sendefrequenz abgestimmt ist: 

$$
 f = \frac{1}{2 \, \pi \cdot \sqrt{L \cdot C}} \Rightarrow f^2 = \frac{1}{4 \, \pi^2 \cdot L \cdot C} \Leftrightarrow L = \frac{1}{4\, \pi^2 \cdot f^2 \cdot C} 
$$

 Einsetzen der gegebenen Werte liefert 

$$
 L = \frac{1}{4 \,\pi^2 \cdot (77{,}5 \cdot 10^3\,\rm Hz)^2 \cdot 3{,}3 \cdot 10^{-9}\,\frac{\rm A\,s}{\rm V}} = 1{,}3 \cdot 10^{-3}\,\frac{\rm V\,s}{\rm A} 
$$

 Berechnung der relativen Permeabilität des Ferritstabes: 

$$
 L = \mu_{\rm r} \cdot L_0 \Leftrightarrow \mu_{\rm r} = \frac{L}{L_0} \Rightarrow \mu_{\rm r} = \frac{1{,}3 \cdot 10^{-3}\,\frac{\rm V\,s}{\rm A}}{6{,}6 \cdot 10^{-5}\,\frac{\rm V\,s}{\rm A}} \approx 20 
$$


c)

Berechnung der Wegdifferenz $\Delta s$: 

$$
 \Delta s = 2 \cdot \sqrt{\left( \frac{819\,\rm km}{2} \right)^2 + (80\,\rm km)^2} - 819\,\rm km \approx 15{,}5\,\rm km 
$$

 Die Wegdifferenz entspricht der vierfachen Wellenlänge, was ohne besondere Umstände zu konstruktiver Interferenz führen würde.

d)

Wenn es zu einer Auslöschung der beiden Wellenzüge kommt, muss der Gangunterschied ein ungeradzahliges Vielfaches der halben Wellenlänge sein. Da $0 < z \le 1$ sein soll, bleibt für $z$ nur der Wert $\frac{1}{2}$.

e)

![](https://www.leifiphysik.de/sites/default/files/2026/01/image/der-zeitsignalsender-dcf77-abitur-by-2014-ph11-a2-2_skizze3.svg)

Abb. 3 Skizze zur Lösung von Aufgabenteil e)

[CC-BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/deed.de) / FWU Institut für Film und Bild;

Aus dieser - nicht maßstabsgetreuen - Zeichnung erkennt man, dass die Raumwelle bei einmaliger Reflexion eine begrenzte Reichweite hat.

## Grundwissen
- [Ausbreitung Elektromagnetischer Wellen](https://www.leifiphysik.de/elektrizitaetslehre/elektromagnetische-wellen/grundwissen/ausbreitung-elektromagnetischer-wellen)
