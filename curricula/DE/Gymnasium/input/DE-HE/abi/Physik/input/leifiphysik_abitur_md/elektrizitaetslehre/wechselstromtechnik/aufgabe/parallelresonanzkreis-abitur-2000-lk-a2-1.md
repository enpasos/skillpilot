# Parallelresonanzkreis (Abitur BY 2000 LK A2-1)

Quelle: https://www.leifiphysik.de/elektrizitaetslehre/wechselstromtechnik/aufgabe/parallelresonanzkreis-abitur-2000-lk-a2-1
Originaldatei: `curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/abi/Physik/input/leifiphysik_abitur/pages/elektrizitaetslehre/wechselstromtechnik/aufgabe/parallelresonanzkreis-abitur-2000-lk-a2-1.html`
Schwierigkeitsgrad: mittelschwere Aufgabe

## Aufgabe

![](https://www.leifiphysik.de/sites/default/files/images/2d946e1e8a25b29af73385c78bb3d621/350parallelresonanzkreis-abitur-by-2000-lk-a2-1_skizze.gif)

Abb. 1 Schaltskizze zur Aufgabe

[CC-BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/deed.de) / FWU Institut für Film und Bild;

Die skizzierte Schaltung enthält einen Kondensator, dessen Kapazität zwischen $50\,\rm{pF}$ und $500\,\rm{pF}$ verändert werden kann. Die Spule hat die Induktivität $45\,\rm{\mu H}$, ihr OHMscher Widerstand ist vernachlässigbar.

Die Spannungsquelle liefert die Wechselspannung $U(t) = \hat U \cdot \sin \left( \omega  \cdot t \right)$ mit dem Scheitelwert $\hat U = 6{,}0\,\rm{V}$ und der Frequenz $f = 1{,}5\,\rm{MHz}$.

Der Schalter ist zunächst geöffnet, der Kondensator auf kleinste Kapazität eingestellt.

a)

Berechne, welchen Effektivwert das Amperemeter anzeigt. [zur Kontrolle: $2{,}0\,\rm{mA}$] (2 BE)

b)

Zeichne den zeitlichen Verlauf der Stromstärke $I(t)$ und der Spannung $U(t)$ in ein gemeinsames Koordinatensystem. (6 BE)

Nun wird der Schalter geschlossen.

c)

Berechne den Effektivwert der Stromstärke in der Spule.

Gib an, welche Phasenbeziehung zwischen den Stromstärken in der Spule und im Kondensator besteht.

Bestimme den Wert, den das Amperemeter jetzt anzeigt. (5 BE)

d)

Die Kapazität des Kondensators wird nun kontinuierlich vergrößert.

Begründe, dass dabei die vom Amperemeter angezeigte Stromstärke zunächst abnimmt, ein Minimum erreicht und dann wieder ansteigt.

Berechne, bei welcher Kapazität das Amperemeter die kleinste Stromstärke anzeigt. (7 BE)

## Lösung

**Hinweis:** Bei dieser Lösung von LEIFIphysik handelt es sich nicht um den amtlichen Lösungsvorschlag des bayr. Kultusministeriums.

a)

Bei geöffnetem Schalter liegt nur der Kondensator an der Wechselspannungsquelle: 

$$
 X_C = \frac{U_{\rm{eff}}}{I_{\rm{eff}}} \Leftrightarrow I_{\rm{eff}} = \frac{U_{\rm{eff}}}{X_C} \quad (1) 
$$

 Weiter gilt 

$$
 X_C = \frac{1}{\omega C} = \frac{1}{2\pi f C} \Rightarrow X_C = \frac{1}{2\pi \cdot 1{,}5 \cdot 10^6 \, \rm{Hz} \cdot 50 \cdot 10^{-12} \, \rm{F}} = 2{,}1 \cdot 10^3 \, \Omega = 2{,}1 \, \rm{k\Omega} \quad (2) 
$$

 und außerdem 

$$
 U_{\rm{eff}} = \frac{\hat{U}}{\sqrt{2}} \Rightarrow U_{\rm{eff}} = \frac{6{,}0 \, \rm{V}}{\sqrt{2}} = 4{,}2 \, \rm{V} \quad (3). 
$$

 Setzt man $(2)$ und $(3)$ in $(1)$ ein, so erhält man 

$$
 I_{\rm{eff}} = \frac{4{,}2 \, \rm{V}}{2{,}1 \cdot 10^3 \, \Omega} = 2{,}0 \cdot 10^{-3} \, \rm{A} = 2{,}0 \, \rm{mA}. 
$$


b)

![](https://www.leifiphysik.de/sites/default/files/images/9e4f601a7b207716c5442c288cd82742/332parallelresonanzkreis-abitur-by-2000-lk-a2-1_diagramm.gif)

Abb. 2 Diagramm zur Lösung von Aufgabenteil b)

[CC-BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/deed.de) / FWU Institut für Film und Bild;

Für die Schwingungsdauer gilt 

$$
 T = \frac{1}{f} \Rightarrow T = \frac{1}{1{,}5 \cdot 10^6 \, \rm{Hz}} = 0{,}67 \, \mu\rm{s}. 
$$

 Für den Scheitelwert der Stromstärke gilt 

$$
 \hat{I} = I_{\rm{eff}} \cdot \sqrt{2} \Rightarrow \hat{I} = 2{,}0 \, \rm{mA} \cdot \sqrt{2} = 2{,}8 \, \rm{mA}. 
$$

 Beim Kondensator eilt der Strom der Spannung um $ \frac{\pi}{2} $ voraus.

c)


$$
 X_L = \omega L = 2\pi f L \Rightarrow X_L = 2\pi \cdot 1{,}5 \cdot 10^6 \, \rm{Hz} \cdot 45 \cdot 10^{-6} \, \rm{H} = 4{,}2 \cdot 10^2 \, \Omega 
$$

$$
 I_{\rm{eff}} = \frac{U_{\rm{eff}}}{X_L} \Rightarrow I_{\rm{eff}} = \frac{4{,}2 \, \rm{V}}{4{,}2 \cdot 10^2 \, \Omega} = 1{,}0 \cdot 10^{-2} \, \rm{A} = 10 \, \rm{mA}. 
$$

 Die Stromstärken in Spule und Kondensator sind gegenphasig.

Das Amperemeter zeigt jetzt den Strom $ I_{\rm{eff}} = I_{\rm{eff,L}} - I_{\rm{eff,C}} = 10 \, \rm{mA} - 2{,}0 \, \rm{mA} = 8{,}0 \, \rm{mA} $ an.

d)

Wenn der Kondensator im Bereich $ 50 \, \rm{pF} < C < 500 \, \rm{pF} $ variiert, so variiert der Wechselstromwiderstand im Bereich $ 2{,}1 \, \rm{k\Omega} < X_C < 0{,}21 \, \rm{k\Omega} $. Dies hat zur Folge, dass der Effektivstrom durch den Kondensator im Bereich $ 2{,}0 \, \rm{mA} < I_{\rm{eff,C}} < 20 \, \rm{mA} $ variiert. Der Effektivstrom durch die Spule ist konstant $ I_{\rm{eff,L}} = 10 \, \rm{mA} $. Der Effektivwert des Gesamtstroms in der Hauptleitung ist $ I_{\rm{eff}} = |I_{\rm{eff,L}} - I_{\rm{eff,C}}| $. Der Effektivwert nimmt also von $ 8{,}0 \, \rm{mA} $ auf $ 0 \, \rm{mA} $ ab und steigt dann wieder auf $ |10 \, \rm{mA} - 20 \, \rm{mA}| = 10 \, \rm{mA} $ an. Im Resonanzfall gilt 

$$
 X_C = X_L \Leftrightarrow \frac{1}{\omega C} = \omega L \Leftrightarrow C = \frac{1}{\omega^2 L} \Rightarrow C = \frac{1}{(2\pi \cdot 1{,}5 \cdot 10^6 \, \rm{Hz})^2 \cdot 45 \cdot 10^{-6} \, \rm{H}} = 2{,}5 \cdot 10^{-10} \, \rm{F} = 0{,}25 \, \rm{nF}. 
$$


## Grundwissen
- [Wechselstromwiderstände](https://www.leifiphysik.de/elektrizitaetslehre/wechselstromtechnik/grundwissen/wechselstromwiderstaende)
