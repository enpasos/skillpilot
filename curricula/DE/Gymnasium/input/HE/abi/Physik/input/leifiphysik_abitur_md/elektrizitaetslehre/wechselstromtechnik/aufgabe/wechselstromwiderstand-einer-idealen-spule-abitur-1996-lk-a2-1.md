# Wechselstromwiderstand einer idealen Spule (Abitur BY 1996 LK A2-1)

Quelle: https://www.leifiphysik.de/elektrizitaetslehre/wechselstromtechnik/aufgabe/wechselstromwiderstand-einer-idealen-spule-abitur-1996-lk-a2-1
Originaldatei: `curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/abi/Physik/input/leifiphysik_abitur/pages/elektrizitaetslehre/wechselstromtechnik/aufgabe/wechselstromwiderstand-einer-idealen-spule-abitur-1996-lk-a2-1.html`
Schwierigkeitsgrad: mittelschwere Aufgabe

## Aufgabe

Ein Sinusgenerator wird an eine Spule der Induktivität $L$ angeschlossen. Der OHMsche Widerstand der Spule ist zu vernachlässigen.

a)

Man will experimentell den Zusammenhang zwischen dem Wechselstromwiderstand ${X_L}$ der Spule und der Frequenz $f$ herausfinden.

Zeichne eine geeignete Schaltung mit den erforderlichen Messgeräten.

Erläutere, wie ${X_L}$ damit bestimmt wird. (4 BE)

b)

Mit Hilfe der Messwerte aus obigem Versuch wurde folgende Tabelle Tab. 1 ermittelt:

Tab. 1 Messwerte zu Aufgabenteil b)

|  |  |  |  |
| --- | --- | --- | --- |
| $f\;{\rm{in}}\;{\rm{kHz}}$ | $0{,}60$ | $0{,}80$ | $1{,}4$ |
| ${X_L}\;{\rm{in}}\;{\rm{k\Omega }}$ | $0{,}21$ | $0{,}28$ | $0{,}49$ |

Werten Sie die Tabelle graphisch aus.

Ermittle den Zusammenhang zwischen ${X_L}$ und $f$ für diese Spule. (5 BE)

c)

Leite den Zusammenhang zwischen ${X_L}$ und $f$ für eine ideale Spule allgemein her.

Berechne die Induktivität der oben benutzten Spule. (8 BE)

d)

Am Sinusgenerator werden nun der Effektivwert der Spannung $U_{\rm{eff}} = 7{,}1\,\rm{V}$ und die Frequenz $f = 1{,}5\,\rm{kHz}$ eingestellt.

Berechne die Scheitelwerte von Strom und Spannung. (4 BE)

e)

Skizziere in einem Diagramm den zeitlichen Verlauf von Stromstärke und Spannung, wobei zur Zeit $t = 0\,\rm{s}$ die Spannung ihren maximalen Wert annehmen soll.

Kennzeichne in der Zeichnung alle Zeitabschnitte, in denen die magnetische Feldenergie der Spule zunimmt.

Begründe kurz ihr Vorgehen. (6 BE)

## Lösung

**Hinweis:** Bei dieser Lösung von LEIFIphysik handelt es sich nicht um den amtlichen Lösungsvorschlag des bayr. Kultusministeriums.

a)

![](https://www.leifiphysik.de/sites/default/files/images/8e948b943e3c53c3e2c2e5d514a6eb19/171wechselstromwiderstand-einer-idealen-spule-abitur-by-1996-lk-a2-1_skizze.gif)

Abb. 1 Schaltskizze zur Lösung von Aufgabenteil a)

[CC-BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/deed.de) / FWU Institut für Film und Bild;

Der Wechselstromwiderstand wird aus den Effektivwerten von Spannung und Strom bestimmt. Die Frequenz wird z.B. mit einem Digitalzähler oder einem Oszilloskop bestimmt.

$$
{X_L} = \frac{{{U_{{\rm{eff}}}}}}{{{I_{{\rm{eff}}}}}}
$$


b)

![](https://www.leifiphysik.de/sites/default/files/images/8225a31ab614e90c58a63fcbe1c4cfe2/349wechselstromwiderstand-einer-idealen-spule-abitur-by-1996-lk-a2-1_diagramm1.gif)

Abb. 2 Skizze zur Lösung von Aufgabenteil b)

[CC-BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/deed.de) / FWU Institut für Film und Bild;


$$
 X_L(f) = \frac{0{,}49 \cdot 10^3 \, \Omega}{1{,}4 \cdot 10^3 \, \rm{Hz}} \cdot f = 0{,}35 \frac{\Omega}{\rm{Hz}} \cdot f 
$$


c)


$$
 U(t) + U_{ind}(t) = 0 \Leftrightarrow \hat{U} \cdot \sin(\omega t) - L \cdot \dot{I}(t) = 0 \Leftrightarrow \dot{I}(t) = \frac{\hat{U}}{L} \cdot \sin(\omega t) 
$$

 Daraus ergibt sich durch Integration 

$$
 \begin{aligned} I(t) &= -\frac{1}{\omega} \cdot \frac{\hat{U}}{L} \cdot \cos(\omega t) \\ &= \frac{\hat{U}}{\omega L} \cdot \sin\left( \omega t - \frac{\pi}{2} \right). \end{aligned} 
$$

 Daraus ergibt sich weiter 

$$
 X_L = \frac{U_{\rm{eff}}}{I_{\rm{eff}}} \Rightarrow X_L = \frac{\hat{U}}{\frac{\hat{U}}{\omega L}} = \omega L = 2\pi f L \Leftrightarrow L = \frac{X_L}{2\pi f}. 
$$

 Einsetzen der gegebenen Werte liefert 

$$
 L = \frac{0{,}35 \frac{\Omega}{\rm{Hz}} \cdot f}{2\pi f} = \frac{0{,}35 \frac{\Omega}{\rm{Hz}}}{2\pi} = 5{,}6 \cdot 10^{-2} \, \rm{H} = 56 \, \rm{mH}. 
$$


d)


$$
 \hat{U} = \sqrt{2} \cdot U_{\rm{eff}} \Rightarrow \hat{U} = \sqrt{2} \cdot 7{,}1 \, \rm{V} = 10 \, \rm{V} 
$$

$$
 \hat{I} = \frac{\hat{U}}{X_L} \Rightarrow \hat{I} = \frac{10 \, \rm{V}}{0{,}35 \frac{\Omega}{\rm{Hz}} \cdot 1{,}5 \cdot 10^3 \, \rm{Hz}} = 1{,}9 \cdot 10^2 \, \rm{A} = 19 \, \rm{mA} 
$$


e)

![](https://www.leifiphysik.de/sites/default/files/images/6d874cd11cca40b781720cb1e21657c7/207wechselstromwiderstand-einer-idealen-spule-abitur-by-1996-lk-a2-1_diagramm2.gif)

Abb. 3 Diagramm zur Lösung von Aufgabenteil e)

[CC-BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/deed.de) / FWU Institut für Film und Bild;

Die Energie $W_{\rm{mag}} = \frac{1}{2} \cdot L \cdot {I^2}$ des Magnetischen Feldes nimmt zu, wenn $\left| I \right|$ zunimmt. Dies ist in den grau markierten Bereichen der Fall.

## Grundwissen
- [Wechselstromwiderstände](https://www.leifiphysik.de/elektrizitaetslehre/wechselstromtechnik/grundwissen/wechselstromwiderstaende)
