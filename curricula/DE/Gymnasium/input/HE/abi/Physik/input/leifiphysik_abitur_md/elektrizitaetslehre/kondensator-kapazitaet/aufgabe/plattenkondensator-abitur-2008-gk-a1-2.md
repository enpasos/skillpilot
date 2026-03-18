# Plattenkondensator (Abitur BY 2008 GK A1-2)

Quelle: https://www.leifiphysik.de/elektrizitaetslehre/kondensator-kapazitaet/aufgabe/plattenkondensator-abitur-2008-gk-a1-2
Originaldatei: `curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/abi/Physik/input/leifiphysik_abitur/pages/elektrizitaetslehre/kondensator-kapazitaet/aufgabe/plattenkondensator-abitur-2008-gk-a1-2.html`
Schwierigkeitsgrad: mittelschwere Aufgabe

## Aufgabe

![](https://www.leifiphysik.de/sites/default/files/2022/02/image/Aufgabe-Plattenkondensator_03.svg)

Abb. 1 Skizze des Versuchsaufbaus

[CC-BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/deed.de) / FWU Institut für Film und Bild;

Zwei kreisförmige Metallplatten mit Radius $r = 30\,\rm{cm}$, die parallel im Abstand $d = 10\,\rm{cm}$ angeordnet sind, bilden einen Plattenkondensator. In der Mitte zwischen den Platten hängt an einem isolierten Faden ($l = 1{,}2\,\rm{m}$) eine kleine, geladene Metallkugel ($m = 0{,}25\,\rm{g}$).

a)

Berechne die Kapazität des Kondensators. (4 BE)

Legt man an den Kondensator die Spannung $U = 2{,}0\,\rm{kV}$ an, so wird die Kugel horizontal um $\Delta x = 4{,}0\,\rm{cm}$ aus ihrer Ruhelage ausgelenkt. Influenzeffekte sollen nicht berücksichtigt werden, das Feld im Inneren des Kondensators darf als homogen angenommen werden.

b)

Ermittle die Weite $\alpha$ des Auslenkwinkels.

Berechne mit Hilfe der Gewichtskraft den Betrag $F_{\rm{el}}$ der elektrischen Kraft auf die Metallkugel. [zur Kontrolle: $F_{\rm{el}} = 8{,}2 \cdot 10^{-5}\,\rm{N}$] (7 BE)

c)

Berechne den Betrag $E$ der Feldstärke des homogenen elektrischen Feldes zwischen den Kondensatorplatten.

Berechne den Betrag $Q$ der Ladung, die die Metallkugel trägt. [zur Kontrolle: $E = 20\,\frac{\rm{kV}}{\rm{m}}$] (6 BE)

d)

Begründe kurz, wie sich die Auslenkung der Kugel ändert, wenn bei konstanter Spannung der ursprüngliche Plattenabstand vergrößert wird. (4 BE)

e)

Nun wird der Faden durchtrennt.

Beschreibe qualitativ die Bewegung der Metallkugel innerhalb des Kondensators und begründe deine Antwort. (6 BE)

Die geladene Metallkugel wird anschließend wieder an den Faden gehängt, doch anstelle der Gleichspannung wird jetzt eine Wechselspannung an die Kondensatorplatten angelegt.

f)

Erläutere, welche Beobachtungen jeweils zu erwarten sind, wenn die angelegte Wechselspannung beginnend bei sehr niedrigen Frequenzen über die Eigenfrequenz des Pendels bis hin zu sehr hohen Frequenzen variiert wird.

Begründe deine Antwort ausführlich. (9 BE)

## Lösung

**Hinweis:** Bei dieser Lösung von LEIFIphysik handelt es sich nicht um den amtlichen Lösungsvorschlag des bayr. Kultusministeriums.

a)

Für die Kapazität des Plattenkondensators gilt 

$$
C = \varepsilon_0 \cdot \frac{A}{d} = \varepsilon_0 \cdot \frac{r^2 \cdot \pi }{d}
$$

Einsetzen der gegebenen Werte liefert (mit zwei gültigen Ziffern Genauigkeit)

$$
C = 8{,}85 \cdot 10^{-12}\,\frac{\rm{A\,s}}{\rm{V\,m}}  \cdot \frac{ \left( 0{,}30\,\rm{m} \right)^2 \cdot \pi}{0{,}10\,\rm{m}} = 2{,}5 \cdot 10^{-11}\,\rm{F}
$$


b)

Die Zeichnung suggeriert, dass zur Berechnung von $\alpha$ im Dreieck mit $\Delta x$ als Gegenkathete und $l$ als Ankathete und damit mit dem Tangenssatz im rechtwinkligen Dreieck gerechnet werden soll. Durch das Auslenken der Kugel wird diese aber auch leicht angehoben, so dass die Ankathete gar nicht mehr die Länge $l$ hat. Die Strecke von der Aufhängung bis zum Kugelmittelpunkt behält aber die Länge $l$. Deshalb muss man $\Delta x$ als Gegenkathete und $l$ als Hypotenuse und damit den Sinussatz im rechtwinkligen Dreieck nutzen. Es gilt 

$$
\sin \left( \alpha  \right) = \frac{\Delta x}{l } \Leftrightarrow \alpha = \arcsin \left(\frac{\Delta x}{l }\right)
$$

Einsetzen der gegebenen Werte liefert (mit zwei gültigen Ziffern Genauigkeit)

$$
 \alpha = \arcsin \left( \frac{0{,}040\,\rm{m}}{1{,}20\,\rm{m}} \right) = 1{,}9^\circ 
$$

Im Kräfteparallelogramm taucht der Auslenkwinkel auch auf. Dort gilt

$$
\tan \left( \alpha  \right) = \frac{F_{\rm{el}}}{F_{\rm{G}}} \Leftrightarrow F_{\rm{el}} = F_{\rm{G}} \cdot \tan \left( \alpha  \right) = m \cdot g \cdot \tan \left( \alpha  \right)
$$

Einsetzen der gegebenen und berechneten Werten liefert (mit zwei gültigen Ziffern Genauigkeit)

$$
F_{\rm{el}}= 0{,}25 \cdot 10^{-3}\,\rm{kg} \cdot 9{,}81\,\frac{\rm{N}}{\rm{kg}} \cdot \tan \left( {1{,}9^\circ} \right)= 8{,}2 \cdot 10^{-5}\,\rm{N}
$$


c)

Berechnung der elektrischen Feldstärke zwischen den Platten: 

$$
E = \frac{U}{d} \Rightarrow E = \frac{2{,}0 \cdot 10^3\,\rm{V}}{0{,}10\,\rm{m}} = 2{,}0 \cdot 10^4\,\frac{\rm{V}}{\rm{m}}
$$

Für die Ladung $Q$ auf der Kugel gilt dann 

$$
F_{\rm{el}} = Q \cdot E \Leftrightarrow Q = \frac{F_{\rm{el}}}{E} \Rightarrow Q = \frac{8{,}2 \cdot 10^{-5}\,\rm{N}}{2{,}0 \cdot 10^4\,\frac{\rm{V}}{\rm{m}}}=4{,}1 \cdot 10^{- }\,\rm{A\,s}
$$


d)

Bei gleichbleibender Spannung wird der Betrag $E=\frac{U}{d}$ der elektrischen Feldstärke kleiner. Da die Kugelladung gleich bleibt, wird dadurch der Kraftbetrag $F_{\rm{el}}=q \cdot E$ kleiner. Die Auslenkung der Kugel geht also zurück.

e)

Auf die Kugel wirkt die elektrische Kraft und die Gewichtskraft. Die Resultierende dieser beiden Kräfte zeigt in die Verlängerung des ausgelenkten Fadens. Die Kugel bewegt sich nach dem 2. NEWTONschen Axiom geradlinig konstant beschleunigt in Richtung der resultierenden Kraft.

f)

Es wird angenommen, dass die Kugel bei ihrer Bewegung keine der Platten berührt: Aufgrund der Wechselspannung werden die Kondensatorplatten periodisch umgepolt, so dass eine sich periodisch ändernde Kraft auf die Kugel wirkt. Die Frequenz der Wechselspannung sei $f$, die Resonanzfrequenz des schwingungsfähigen Systems Faden-Kugel sei $f_{\rm{res}}$. Dann gilt

- $f < f_{\rm{res}}$: Die Kugel kann dem zeitlichen Verlauf des elektrischen Feldes folgen. Sie schwingt (langsam) mit der Frequenz $f$ der Wechselspannung und kleiner Amplitude un in gleicher Phase hin und her.
- $f \approx f_{\rm{res}}$: In der Nähe der Resonanzfrequenz wächst die Auslenkung der Kugel stark an. Zwischen der Kugelschwingung und der "Feldschwingung" besteht eine Phasendifferenz von $90^\circ$.
- $f \gg f_{\rm{res}}$: Bei Frequenzen $f$ deutlich über der Resonanzfrequenz (Eigenfrequenz) ist die Trägheit der Kugel zu groß, als dass sie der schnellen Änderung des elektrischen Feldes folgen könnte. Zwischen der "Feldschwingung und der Kugelschwingung besteht eine Phasendifferenz von $180^\circ$. Bei sehr hohen Frequenzen ist keine Bewegung der Kugel mehr wahrnehmbar.

**Hinweis:** Die Bemerkungen zur Phasendifferenz waren nicht gefordert.

## Grundwissen
- [Kapazität des Plattenkondensators](https://www.leifiphysik.de/elektrizitaetslehre/kondensator-kapazitaet/grundwissen/kapazitaet-des-plattenkondensators)
