# Induktion im Drahtrahmen (Abitur BY 1999 GK A1-2)

Quelle: https://www.leifiphysik.de/elektrizitaetslehre/elektromagnetische-induktion/aufgabe/induktion-im-drahtrahmen-abitur-1999-gk-a1-2
Originaldatei: `curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/abi/Physik/input/leifiphysik_abitur/pages/elektrizitaetslehre/elektromagnetische-induktion/aufgabe/induktion-im-drahtrahmen-abitur-1999-gk-a1-2.html`
Schwierigkeitsgrad: schwere Aufgabe

## Aufgabe

![](https://www.leifiphysik.de/sites/default/files/images/570d4008e9cda8c02c61e29bfd119a2d/327induktion-im-drahtrahmen-abitur-by-1999-gk-a1-2_skizze1.gif)

Abb. 1 Skizze zur Aufgabe

[CC-BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/deed.de) / FWU Institut für Film und Bild;

Ein waagrecht angeordneter und auf der rechten Seite offener Drahtrahmen der Breite $l=10\,\rm{cm}$ wird von einem homogenen Magnetfeld der Feldstärke $B=0{,}90\,\rm{T}$ senkrecht durchsetzt (s. Abb. 1).

Ein Leiterstück liegt auf dem Drahtrahmen und wird durch eine äußere Kraft $\vec F$ mit der konstanten Geschwindigkeit $v = 25\,\frac{\rm{cm}}{\rm{s}}$ nach rechts bewegt. Der Widerstand im linken Teil des Drahtbügels besitzt den Wert $R = 0{,}50\,\Omega $, der Widerstand des restlichen Drahtbügels und des Leiterstücks sowie Kontaktwiderstände sind vernachlässigbar.

a)

Bestimme unter Verwendung des Induktionsgesetzes die Spannung $U_{\rm{ind}}$, die in der Leiterschleife induziert wird.

Bestimme die Stärke $I$ des im geschlossenen Kreis fließenden Stroms. [zur Kontrolle: $I=46\,\rm{mA}$] (8 BE)

b)

Berechne den Betrag $F$ der Kraft, mit der am Leiterstück gezogen werden muss. Reibungskräfte sollen unberücksichtigt bleiben. [zur Kontrolle: $F=4{,}1\,\rm{mN}$] (4 BE)

c)

Bestimme die mechanische Arbeit $W_{\rm{mech}}$, die während der Zeitspanne $\Delta t = 10\,\rm{s}$ verrichtet wird.

Bestimme ebenfalls die im Widerstand $R$ umgesetzte elektrische Energie $\Delta E_{\rm{el}}$ für diese Zeitspanne unter Verwendung der Ergebnisse der Teilaufgaben a) und b).

Vergleiche die beiden Werte und interpretiere das Ergebnis.

Zeige, dass für den Betrag $F$ der magnetischen Kraft auf den Leiter gilt $ F = \frac{B^2 \cdot l^2 \cdot v}{R} $. (10 BE)

d)

Der mit $v = 25\,\frac{\rm{cm}}{\rm{s}}$ bewegte Leiter wird nun losgelassen.

Begründe, warum die Geschwindigkeit des Leiters zeitlich nicht linear abnimmt.

Skizziere qualitativ das zugehörige $t$-$v$-Diagramm. (9 BE)

## Lösung

**Hinweis:** Bei dieser Lösung von LEIFIphysik handelt es sich nicht um den amtlichen Lösungsvorschlag des bayr. Kultusministeriums.

a)

Das Induktionsgesetz besagt 

$$
 U_{\rm ind} = -N \cdot \frac{d\Phi}{dt} 
$$

 und mit $ N = 1 $ 

$$
 |U_{\rm ind}| = \frac{d\Phi}{dt} 
$$

 Daraus erhält man 

$$
 |U_{\rm ind}| = \frac{d\Phi}{dt} = \frac{d(B \cdot A)}{dt} = B \cdot \frac{dA}{dt} = B \cdot \frac{d(l \cdot x)}{dt} = B \cdot l \cdot \frac{dx}{dt} = B \cdot l \cdot v 
$$

 Einsetzen der gegebenen Werte liefert (mit zwei gültigen Ziffern Genauigkeit) 

$$
 |U_{\rm ind}| = 0{,}90\,\frac{\rm V\,s}{\rm m^2} \cdot 0{,}10\,\rm m \cdot 0{,}25\,\frac{\rm m}{\rm s} = 23\,\rm mV 
$$

 Für den Induktionsstrom gilt dann 

$$
 I = \frac{|U_{\rm ind}|}{R}
$$

Einsetzen der gegebenen Werte liefert (mit zwei gültigen Ziffern Genauigkeit)

$$
I = \frac{23\,\rm mV}{0{,}50\,\Omega} = 46\,\rm mA 
$$


b)

Das bewegliche Leiterstück ist stromdurchflossen, die Stromrichtung ist senkrecht zum Magnetfeld: 

$$
 F = B \cdot I \cdot l
$$

Einsetzen der gegebenen Werte liefert (mit zwei gültigen Ziffern Genauigkeit)

$$
F = 0{,}90\,\frac{\rm V\,s}{\rm m^2} \cdot 46 \cdot 10^{-3}\,\rm A \cdot 0{,}10\,\rm m = 4{,}1 \cdot 10^{-3}\,\rm N = 4{,}1\,\rm mN 
$$


c)

![](https://www.leifiphysik.de/sites/default/files/images/fde9c63fbd98e47f6f2d061300c102e6/327induktion-im-drahtrahmen-abitur-by-1999-gk-a1-2_skizze2.gif)

Abb. 2 Skizze zur Lösung von Aufgabenteil c)

[CC-BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/deed.de) / FWU Institut für Film und Bild;

Aufgrund der vorgegebenen Leiterbewegung entsteht eine Spannung mit der skizzierten Polarität. Daraus resultiert ein Strom der Stärke $ I $ in der gezeichneten Richtung. Die bei Teilaufgabe b) berechnete Kraft zeigt daher nach links, somit muss die äußere Kraft zur Bewegung des Leiters nach rechts zeigen. Für die mechanische Arbeit $W_{\rm mech} $ gilt 

$$
 W_{\rm mech} = F \cdot \Delta s = F \cdot v \cdot \Delta t 
$$

 Einsetzen der gegebenen Werte liefert (mit zwei gültigen Ziffern Genauigkeit) 

$$
 W_{\rm mech} = 4{,}1 \cdot 10^{-3}\,\rm N \cdot 0{,}25\,\frac{\rm m}{\rm s} \cdot 10\,\rm s = 10\,\rm{mJ} 
$$

 Für die elektrische Energie $\Delta E_{\rm el} $, die am Widerstand $ R $ in innere Energie umgesetzt wird, gilt mit $ U = |U_{\rm ind}| $ 

$$
 \Delta E_{\rm el} = P \cdot \Delta t = U \cdot I \cdot \Delta t = |U_{\rm ind}| \cdot I \cdot \Delta t 
$$

 Einsetzen der gegebenen Werte liefert (mit zwei gültigen Ziffern Genauigkeit) 

$$
 \Delta E_{\rm el} = 22{,}5 \cdot 10^{-3}\,\rm V \cdot 45 \cdot 10^{-3}\,\rm A \cdot 10\,\rm s = 10\,\rm{mJ} 
$$

 Bei dem betrachteten Vorgang wird mechanische Energie in innere Energie umgewandelt. Der Energieerhaltungssatz ist erfüllt.

Setzt man in die Formel, welche in Teilaufgabe b) entwickelt wurde, die Ausdrücke von Teilaufgabe a) ein, so folgt 

$$
 F = B \cdot I \cdot l = B \cdot \frac{|U_{\rm ind}|}{R} \cdot l = B \cdot \frac{B \cdot l \cdot v}{R} \cdot l = \frac{B^2 \cdot l^2 \cdot v}{R} 
$$


d)

![](https://www.leifiphysik.de/sites/default/files/images/f5d3a953e1f48062953440cd029900b4/207induktion-im-drahtrahmen-abitur-by-1999-gk-a1-2_diagramm.gif)

Abb. 3 $t$-$v$-Diagramm zur Lösung von Aufgabenteil d)

[CC-BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/deed.de) / FWU Institut für Film und Bild;

Wird der Leiter losgelassen, so entfällt die nach rechts wirkende mechanische Kraft. Auf den Leiter wirkt zunächst nur die durch obige Formel beschriebene Kraft nach links. Dadurch erhält das Leiterstück nach dem 2. NEWTON'schen Axiom die Beschleunigung

$$
F = m \cdot a \Leftrightarrow a = \frac{F}{m} \Rightarrow a = \frac{B^2 \cdot l^2}{R \cdot m} \cdot v \sim v
$$


Es handelt sich also nicht um eine konstante Verzögerung, welche eine lineare Abnahme der Geschwindigkeit mit der Zeit bewirken würde. Die negative Beschleunigung ist geschwindigkeitsabhängig, d.h. die Beschleunigung (= Steigung im $t$-$v$-Diagramm) wird mit der Zeit betragsmäßig immer kleiner.

## Grundwissen
- [Induktion durch Änderung des Flächeninhalts](https://www.leifiphysik.de/elektrizitaetslehre/elektromagnetische-induktion/grundwissen/induktion-durch-aenderung-des-flaecheninhalts)
