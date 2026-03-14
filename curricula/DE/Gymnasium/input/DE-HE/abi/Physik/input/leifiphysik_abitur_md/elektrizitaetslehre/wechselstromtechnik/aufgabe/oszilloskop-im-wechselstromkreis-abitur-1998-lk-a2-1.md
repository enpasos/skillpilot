# Oszilloskop im Wechselstromkreis (Abitur BY 1998 LK A2-1)

Quelle: https://www.leifiphysik.de/elektrizitaetslehre/wechselstromtechnik/aufgabe/oszilloskop-im-wechselstromkreis-abitur-1998-lk-a2-1
Originaldatei: `curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/abi/Physik/input/leifiphysik_abitur/pages/elektrizitaetslehre/wechselstromtechnik/aufgabe/oszilloskop-im-wechselstromkreis-abitur-1998-lk-a2-1.html`
Schwierigkeitsgrad: mittelschwere Aufgabe

## Aufgabe

![](https://www.leifiphysik.de/sites/default/files/images/f2f37b1973b1b999bf912614afa3a3f7/264oszilloskop-im-wechselstromkreis-abitur-by-1998-lk-a2-1_skizze.gif)

Abb. 1 Schaltskizze zur Aufgabe

[CC-BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/deed.de) / FWU Institut für Film und Bild;

Ein Kondensator bzw. eine Spule mit vernachlässigbarem OHMschen Widerstand werden **einzeln** zwischen den Punkten A und B der nebenstehenden Schaltung an einen Sinusgenerator mit der Spannung $U(t) = U_0 \cdot \sin \left( \omega  \cdot t \right)$ angeschlossen.

![](https://www.leifiphysik.de/sites/default/files/images/e9bf8605834712cd338c4a8ffcb772e9/453oszilloskop-im-wechselstromkreis-abitur-by-1998-lk-a2-1_diagramm.gif)

Abb. 2 Diagramme zur Aufgabe

[CC-BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/deed.de) / FWU Institut für Film und Bild;

Ein Zweikanal-Oszilloskop zeigt jeweils die nebenstehende Darstellung der Spannung $U(t)$ und der sich einstellenden Stromstärke $I(t)$. Die Stromstärke wird dabei mit Hilfe des OHMschen Widerstandes $R = 1{,}0\,\Omega $ in ein Spannungssignal umgewandelt; der Einfluss von $R$ auf die Anzeige des Kanals 1 soll vernachlässigt werden.

Die Horizontalablenkung ist für beide Kanäle $1{,}0\,\frac{\rm{ms}}{\rm{cm}}$, die Vertikalablenkung ist für Kanal 1 $2{,}0\,\frac{\rm{V}}{\rm{cm}}$ und für Kanal 2 $10\,\frac{\rm{mV}}{\rm{cm}}$.

a)

Ordne jedes Oszilloskopbild dem richtigen Schaltelement (Kondensator oder Spule) zu.

Begründe kurz deine Aussage. (4 BE)

b)

Leite allgemein die Formel für den Wechselstromwiderstand $X_C$ eines Kondensators her. Verwende dabei z.B. die Definition der Kapazität. (7 BE)

c)

Bestimme anhand der Oszilloskopbilder die Kapazität $C$ des Kondensators sowie die Induktivität $L$ der Spule. (10 BE)

d)

Kondensator und Spule werden nun parallel zueinander zwischen die Punkte A und B geschaltet.

Erläutere, wie man aus den Abbildungen 1 und 2 den Scheitelwert der Stromstärke im Widerstand $R$ erhält.

Bestimme diesen. (5 BE)

## Lösung

**Hinweis:** Bei dieser Lösung von LEIFIphysik handelt es sich nicht um den amtlichen Lösungsvorschlag des bayr. Kultusministeriums.

a)

Vorüberlegung: Durch Kanal I wird die Spannung am jeweiligen Element dargestellt. Durch Kanal II wird eine Spannung dargestellt, die proportional zum Strom ist.

Im linken Bild eilt die Spannung dem Strom voraus, somit gehört dieses Bild zur Spule.

Im rechten Bild eilt der Strom der Spannung voraus, somit gehört dieses Bilde zum Kondensator.


$$
 U(t) = U_C \Leftrightarrow \hat{U}  \cdot \sin(\omega \cdot t) = \frac{Q(t)}{C} \Leftrightarrow Q(t) = C  \cdot \hat{U} \cdot  \sin(\omega  \cdot t) 
$$

 Differentiation liefert 

$$
 I(t) = \omega  \cdot C  \cdot \hat{U}  \cdot \cos(\omega t) 
$$

 Damit ist 

$$
 \hat{I} = \omega  \cdot C  \cdot \hat{U} 
$$

 und schließlich 

$$
 X_C = \frac{\hat{U}}{\hat{I}} = \frac{\hat{U}}{\omega  \cdot C  \cdot \hat{U}} = \frac{1}{\omega  \cdot C} 
$$


b)

Beim linken Bild in Abb. 2 ergibt sich $ \hat{U} = 6 \, \rm{V} $, wegen $ U_R \approx 19 \, \rm{mA} $ und $ R = 1 \, \Omega $ ist $ \hat{I} = 19 \, \rm{mA} $, $ T = 4{,}0 \, \rm{ms} $. Nun gilt 

$$
 X_L = 2\,\pi  \cdot f  \cdot L = \frac{2\,\pi  \cdot L}{T} \Leftrightarrow L = \frac{X_L  \cdot T}{2\,\pi} = \frac{\frac{\hat{U}}{\hat{I}} \cdot  T}{2\,\pi} = \frac{\hat{U} \cdot  T}{\hat{I} \cdot 2\,\pi}. 
$$

 Einsetzen der gegebenen Werte liefert 

$$
 L = \frac{6 \, \rm{V} \cdot 4{,}0 \cdot 10^{-3} \, \rm{s}}{19 \cdot 10^{-3} \, \rm{A} \cdot 2\,\pi} = 0{,}20 \, \rm{H}. 
$$


c)

Beim rechten Bild in Abb. 2 ergibt sich $ \hat{U} = 6 \, \rm{V} $, wegen $ U_R \approx 24 \, \rm{mV} $ und $ R = 1 \, \Omega $ ist $ \hat{I} = 24 \, \rm{mA} $, $ T = 4{,}0 \, \rm{ms} $. Nun gilt 

$$
 X_C = \frac{1}{2\,\pi  \cdot f  \cdot C} = \frac{T}{2\,\pi  \cdot C} \Leftrightarrow C = \frac{T}{2\,\pi  \cdot X_C} = \frac{T}{2\,\pi  \cdot \frac{\hat{U}}{\hat{I}}} = \frac{\hat{I} \cdot  T}{2\,\pi  \cdot \hat{U}}. 
$$

 Einsetzen der gegebenen Werte liefert 

$$
 C = \frac{24 \cdot 10^{-3} \, \rm{A} \cdot 4{,}0 \cdot 10^{-3} \, \rm{s}}{2\,\pi \cdot 6 \, \rm{V}} = 2{,}5 \, \mu\rm{F}. 
$$


d)

Um den Strom durch den Widerstand zu erhalten, muss man die beiden Teilströme addieren. Diese haben eine Phasenverschiebung von $ \pi $. Somit gilt für den Scheitelwert 

$$
 \hat{I}_R = \hat{I}_C - \hat{I}_L \Rightarrow \hat{I}_R = 24 \, \rm{mA} - 19 \, \rm{mA} = 5{,}0 \, \rm{mA}. 
$$


## Grundwissen
- [Wechselstromwiderstände](https://www.leifiphysik.de/elektrizitaetslehre/wechselstromtechnik/grundwissen/wechselstromwiderstaende)
