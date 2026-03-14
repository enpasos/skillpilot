# Kondensator und Spule (Abitur BY 2008 LK A2-1)

Quelle: https://www.leifiphysik.de/elektrizitaetslehre/wechselstromtechnik/aufgabe/kondensator-und-spule-abitur-2008-lk-a2-1
Originaldatei: `curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/abi/Physik/input/leifiphysik_abitur/pages/elektrizitaetslehre/wechselstromtechnik/aufgabe/kondensator-und-spule-abitur-2008-lk-a2-1.html`
Schwierigkeitsgrad: leichte Aufgabe

## Aufgabe

![](https://www.leifiphysik.de/sites/default/files/images/3a3ce047bae3195c89ab49e068f3a894/386kondensator-und-spule-abitur-by-2008-lk-a2-1_diagramm1.gif)

Abb. 1 $t$-$U$-Diagramm zur Aufgabe

[CC-BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/deed.de) / FWU Institut für Film und Bild;

Eine Spule mit vernachlässigbarem ohmschen Widerstand wird an eine sinusförmige Wechselspannung $U(t)$ angeschlossen. Der zeitliche Verlauf der Wechselspannung ist im folgenden Diagramm dargestellt. Die effektive Stromstärke in der Spule beträgt $4{,}8\,\rm{mA}$.

a)

Berechne den induktiven Widerstand und die Induktivität der Spule. [zur Kontrolle: $L = 7{,}0\,\rm{H}$] (6 BE)

b)

Gib einen Funktionsterm $I(t)$ für die Stromstärke in der Spule an und zeichne ein $t$-$I$-Diagramm für das Zeitintervall $\left[ 0\;;\;20\,\rm{ms} \right]$. (6 BE)

Nun wird die Spule durch einen Kondensator ersetzt.

c)

Berechne, welche Kapazität dieser Kondensator besitzen muss, damit die effektive Stromstärke wie bei der Spule $4,8{\rm{mA}}$ beträgt. [zur Kontrolle: $C = 1{,}4\,\rm{\mu F}$] (5 BE)

d)

Nimm begründet Stellung, ob die folgenden Aussagen richtig oder falsch sind. (9 BE)

(1)

Wenn die Kapazität des Kondensators $1{,}4\,\rm{\mu F}$ beträgt, ergibt sich für die Stromstärke dasselbe $t$-$I$-Diagramm, wie es in Teilaufgabe b) zu zeichnen ist.

(2)

Bei oben skizzierter Wechselspannung sind die Kapazität des Kondensators und die effektive Stromstärke zueinander direkt proportional.

(3)

Verdoppelt man bei gleich bleibendem Scheitelwert die Frequenz der Wechselspannung, so vervierfacht sich die effektive Stromstärke im Kondensator.

## Lösung

**Hinweis:** Bei dieser Lösung von LEIFIphysik handelt es sich nicht um den amtlichen Lösungsvorschlag des bayr. Kultusministeriums.

a)

Der Wechselstromwiderstand berechnet sich durch 

$$
 X_L = \frac{U_{\rm eff}}{I_{\rm eff}} = \frac{\hat U}{\sqrt{2} \cdot I_{\rm eff}} \Rightarrow X_L = \frac{15\,\rm V}{\sqrt{2} \cdot 4{,}8 \cdot 10^{-3}\,\rm A} = 2{,}2\,\rm k\Omega 
$$

 Die Induktivität berechnet sich dann durch 

$$
 X_L = \omega \cdot L = \frac{2\pi}{T} \cdot L \Leftrightarrow L = \frac{X_L \cdot T}{2\pi} \Rightarrow L = \frac{2{,}2 \cdot 10^3\,\Omega \cdot 20 \cdot 10^{-3}\,\rm s}{2\pi} = 7{,}0\,\rm H . 
$$


b)

![](https://www.leifiphysik.de/sites/default/files/images/6f29347c1490d3d4207e3d8825bcd3b3/389kondensator-und-spule-abitur-by-2008-lk-a2-1_diagramm2.gif)

Abb. 2 $t$-$I$-Diagramm zur Lösung von Aufgabenteil b)

[CC-BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/deed.de) / FWU Institut für Film und Bild;

Die Stromstärke in der Spule hinkt der Spannung um eine viertel Periode nach. Es gilt dann 

$$
 I(t) = -\hat I \cdot \cos(\omega \cdot t) 
$$

 mit 

$$
 \omega = \frac{2\pi}{T} \Rightarrow \omega = \frac{2\pi}{20\,\rm ms} = 314\,\rm s^{-1} 
$$

 und damit 

$$
 \hat I = I_{\rm eff} \cdot \sqrt{2} \Rightarrow \hat I = 4{,}8\,\rm mA \cdot \sqrt{2} = 6{,}8\,\rm mA . 
$$


c)

Aus 

$$
 X_C = X_L = \frac{U_{\rm eff}}{I_{\rm eff}} = \frac{\hat U}{\hat I} 
$$

 und 

$$
 X_C = \frac{1}{\omega \cdot C} 
$$

 erhält man 

$$
 C = \frac{I_{\rm eff}}{\omega \cdot U_{\rm eff}} = \frac{6{,}8 \cdot 10^{-3}\,\rm A}{314\,\rm s^{-1} \cdot 15\,\rm V} = 1{,}4\,\mu F . 
$$


d)

(1)

Die Aussage ist falsch, da bei der Spule die Stromstärke der Spannung um eine viertel Periode nachhinkt, beim Kondensator aber um eine viertel Periode vorauseilt.

(2)

Die Aussage ist richtig. Wegen $\frac{U_{\rm{eff}}}{I_{\rm{eff}}}=\frac{1}{\omega  \cdot C} \Leftrightarrow I_{\rm{eff}} = U_{\rm{eff}} \cdot \omega \cdot C $ ist bei konstanter Effektivspannung die effektive Stromstärke zur Kapazität direkt proportional.

(3)

Die Aussage ist falsch. Wegen $I_{\rm{eff}} \sim \omega  \cdot C$ bedeutet eine Verdoppelung der Frequenz eine Verdoppelung (und nicht Vervierfachung) der effektiven Stromstärke.

## Grundwissen
- [Wechselstromwiderstände](https://www.leifiphysik.de/elektrizitaetslehre/wechselstromtechnik/grundwissen/wechselstromwiderstaende)
