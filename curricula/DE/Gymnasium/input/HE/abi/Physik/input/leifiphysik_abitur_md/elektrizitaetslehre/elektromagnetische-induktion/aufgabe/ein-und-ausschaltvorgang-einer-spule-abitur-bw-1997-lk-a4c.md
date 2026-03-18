# Ein- und Ausschaltvorgang einer Spule (Abitur BW 1997 LK A4c)

Quelle: https://www.leifiphysik.de/elektrizitaetslehre/elektromagnetische-induktion/aufgabe/ein-und-ausschaltvorgang-einer-spule-abitur-bw-1997-lk-a4c
Originaldatei: `curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/abi/Physik/input/leifiphysik_abitur/pages/elektrizitaetslehre/elektromagnetische-induktion/aufgabe/ein-und-ausschaltvorgang-einer-spule-abitur-bw-1997-lk-a4c.html`
Schwierigkeitsgrad: mittelschwere Aufgabe

## Aufgabe

![](https://www.leifiphysik.de/sites/default/files/images/9d2dff2cf3458c6aaae6524c7e89de75/233ein-und-ausschaltvorgang-einer-spule-abitur-bw-1997-lk-a4c_skizze.gif)

Abb. 1 Skizze zur Aufgabe

[CC-BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/deed.de) / FWU Institut für Film und Bild;

In der nebenstehenden Schaltung wird eine Gleichspannungsquelle mit $U_0=100\,\rm{V}$ verwendet. Folgende Idealisierungen sollen gelten:

- Der Widerstand $R_{\rm G}$ der Glühlampe sei konstant.
- Die Spule besitze keinen OHM'schen Widerstand.
- Der Sperrwiderstand der Diode sei unendlich groß, ihr Durchlasswiderstand vernachlässigbar klein.

a)

Zunächst wird der Schalter S geschlossen.

Berechne die die maximale Stromstärke in der Spule.

Berechne die in der Spule induzierte Spannung unmittelbar nach dem Schließen des Schalters.

Skizziere für den Einschaltvorgang den zeitlichen Verlauf

- der Stärke $I_{L}(t)$ des Stroms durch die Spule sowie
- der in der Spule induzierten Spannung $U_{\rm ind}(t)$.

Begründe den jeweiligen Kurvenverlauf.

b)

Nun wird der Schalter S geöffnet.

Berechne die in der Spule induzierte Spannung unmittelbar nach dem Öffnen des Schalters.

Skizziere wiederum $I_{L}(t)$ und $U_{\rm ind}(t)$.

Begründe den jeweiligen Kurvenverlauf.

Erläutere, warum die Lampe nur beim Öffnen des Schalters aufleuchtet.

## Lösung

**Hinweis:** Bei dieser Lösung von LEIFIphysik handelt es sich nicht um den amtlichen Lösungsvorschlag des bayr. Kultusministeriums.

a)

![](https://www.leifiphysik.de/sites/default/files/images/c9cbed49468e5de1e11eb3d9c93e894a/301ein-und-ausschaltvorgang-einer-spule-abitur-bw-1997-lk-a4c_diagramm1.gif)

Abb. 2 $t$-$I_L$-Diagramm zu den Aufgabenteilen a) und b)

[CC-BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/deed.de) / FWU Institut für Film und Bild;

![](https://www.leifiphysik.de/sites/default/files/images/717283c01662a551250e874b2bf7666e/301ein-und-ausschaltvorgang-einer-spule-abitur-bw-1997-lk-a4c_diagramm2.gif)

Abb. 3 $t$-$U_{\rm{ind}}$-Diagramm zu den Aufgabenteilen a) und b)

[CC-BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/deed.de) / FWU Institut für Film und Bild;

Beim Einschalten fließt ein Strom durch den OHM'schen Widerstand und die Spule. Die Glühlampe leitet nicht, da die Diode in Sperrrichtung gepolt ist.

Wartet man den stationären Endzustand ab, so stellt sich die Stromstärke $I_{\max}$ ein, für welche gilt

$$
 I_{\max} = \frac{U_0}{R}
$$

Einsetzen der gegebenen Werte liefert (mit drei gültigen Ziffern Genauigkeit)

$$
I_{\max}= \frac{100\,\rm V}{250\,\Omega} = 0{,}400 \, \rm{A} 
$$

Die KIRCHHOFF'sche Maschenregel besagt für den Einschaltkreis: 

$$
 U_0 + U_\rm{ind} = I \cdot R \Leftrightarrow  U_0 = I \cdot R - U_\rm{ind}
$$

Wegen $U_\rm{ind} = - L \cdot \dot{I}$ ergibt sich

$$
U_0  = I \cdot R + L \cdot \dot{I} 
$$

Im Augenblick des Einschaltens fließt noch kein Strom, also gilt für $t = 0$:

$$
U_\rm{ind} = -U_0 = -100\,\rm V
$$

Für $t > 0$ steigt die Stromstärke an, jedoch nimmt die Steigung im $t$-$I$-Diagramm laufend ab, bis schließlich die Endstromstärke $I_{\max}$ erreicht ist. Wegen $ U_\rm{ind} = - L \cdot \dot{I} $ ist die induzierte Spannung beim Einschalten negativ, also der Batteriespannung entgegengerichtet. Da die Stromkurve abflacht wird $\dot{I}$ und damit auch der Betrag von $U_\rm{ind}$ immer kleiner.

**Hinweis:** Die Lösungen für die Differentialgleichungen beim Einschalten sind

$$
 I (t) = \frac{U_0}{R} \cdot \left( 1 - e^{-\frac{t \cdot R}{L}} \right)
$$

und

$$
U_\rm{ind} = - U_0 \cdot e^{-\frac{t \cdot R}{L}} 
$$


b)

Im Augenblick des Ausschaltens ist die Stromstärke immer noch $0{,}400\,\rm{A}$. Damit diese Stromstärke in dem Ausschaltkreis (bestehend aus $R$, $R_{\rm G}$ und dem nun vernachlässigbarem Widerstand der Diode - da Polung in Durchlassrichtung) fließen kann, muss die folgende Induktionsspannung vorhanden sein: 

$$
 U_\rm{ind} = I_{\max} \cdot \left( R + R_{\rm G} \right) \Leftrightarrow U_\rm{ind} = 0{,}400\,\rm{A} \cdot \left( 250\,\Omega + 250\,\Omega \right) = 200 \, \rm{V} 
$$

 Die in der Spule gespeicherte magnetische Energie wird nun an den Widerständen abgebaut. Strom und Induktionsspannung gehen asymptotisch gegen Null.

Da aufgrund der LENZ'schen Regel der Ausschaltstrom durch die Spule die gleiche Richtung besitzt wie der Einschaltstrom, ist die Diode im Ausschaltkreis in Durchlassrichtung gepolt. Es kann zum Aufleuchten der Glühlampe kommen, wenn die in der Spule gespeicherte magnetische Energie (abhängig von $L$ und $I_{\max}$) dazu ausreicht.

**Hinweis:** Die Lösungen für die Differentialgleichungen beim Ausschalten sind

$$
 I (t) = \frac{U_0}{R} \cdot e^{- \frac{t \cdot \left( R + R_\rm{G} \right)}{L}}
$$

und

$$
U_\rm{ind} = I_{\max} \cdot \left( R + R_\rm{G} \right) \cdot e^{- \frac{t \cdot \left( R + R_\rm{G} \right)}{L}} 
$$


## Grundwissen
- [Ein- und Ausschalten von RL-Kreisen](https://www.leifiphysik.de/elektrizitaetslehre/elektromagnetische-induktion/grundwissen/ein-und-ausschalten-von-rl-kreisen)
