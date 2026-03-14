# Gasthermometer (Abitur BY 1995 LK A5-3)

Quelle: https://www.leifiphysik.de/waermelehre/kinetische-gastheorie/aufgabe/gasthermometer-abitur-1995-lk-a5-3
Originaldatei: `curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/abi/Physik/input/leifiphysik_abitur/pages/waermelehre/kinetische-gastheorie/aufgabe/gasthermometer-abitur-1995-lk-a5-3.html`
Schwierigkeitsgrad: mittelschwere Aufgabe

## Aufgabe

![](https://www.leifiphysik.de/sites/default/files/images/b9f00e154f639448c21c1c434045ee73/258Gasthermometer_Bild.gif)

**Abb. 1** Skizze zur Aufgabe

[CC-BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/deed.de) / FWU Institut für Film und Bild;

Ein Glasrohr mit einer inneren Querschnittsfläche von $A=5{,}0\,\rm{mm}^2$ wird auf einer Seite durch einen Quecksilberfaden der Länge $l=10{,}0\,\rm{cm}$ verschlossen, die andere Seite ist zugeschmolzen. Im Rohr ist Stickstoff (N2-Moleküle) eingeschlossen, für den die Gesetze eines idealen Gases verwendet werden dürfen.

a)

In waagrechter Lage (Bild 1 in Abb. 1) betrage die Länge $h_0$ des eingeschlossenen Gasvolumens $50{,}0\,\rm{cm}$.

Berechne für die Temperatur $T_0=295\,\rm{K}$ und den Außendruck $p_0=980\,\rm{hPa}$ die Anzahl und die mittlere Geschwindigkeit der Stickstoffmoleküle. (6 BE)

b)

Nun wird das Rohr aufgerichtet (Bild 2 in Abb. 1). Dabei bleibt die Temperatur konstant ($T_1=T_0$).

Bestimme die neue Höhe $h_1$ des Gasvolumens. (6 BE)

c)

In der Stellung von Bild 2 wird das Gas auf $T_2=373\,\rm{K}$ aufgeheizt.

Berechne die neue Höhe $h_2$. (4 BE)

## Lösung

**Hinweis:** Bei dieser Lösung von LEIFIphysik handelt es sich nicht um den amtlichen Lösungsvorschlag des bayr. Kultusministeriums.

a)

Berechnung der Teilchenzahl: Nach der universellen Gasgleichung gilt 

$$
 p_0 \cdot V_0 = N \cdot k_{\rm B} \cdot T_0 \Leftrightarrow N = \frac{p_0 \cdot V_0}{k_{\rm B} \cdot T_0} = \frac{p_0 \cdot A \cdot h_0}{k_{\rm B} \cdot T_0} 
$$

 Einsetzen der gegebenen Werte liefert (mit zwei gültigen Ziffern Genauigkeit) 

$$
 N = \frac{980 \cdot 10^{2}\,\rm{Pa} \cdot 5{,}0 \cdot 10^{-6}\,\rm{m^2} \cdot 0{,}500\,\rm{m}} {1{,}38 \cdot 10^{-23}\,\rm{\frac{J}{K}} \cdot 295\,\rm K} = 6{,}0 \cdot 10^{19} 
$$

 Berechnung der mittleren Geschwindigkeit: Aus der kinetischen Deutung der Temperatur ergibt sich 

$$
 \bar E_{\rm kin} = \frac{3}{2} \cdot k_{\rm B} \cdot T \Leftrightarrow \frac{1}{2} \cdot m_{\rm A}(\rm{N}_2) \cdot \overline{v^2} = \frac{3}{2} \cdot k_{\rm B} \cdot T \Leftrightarrow \overline{v^2} = \frac{3 \cdot k_{\rm B} \cdot T}{m_{\rm A}(\mathrm{N}_2)} 
$$

 Mit $\bar v = 0{,}92 \cdot \sqrt{\overline{v^2}}$ ergibt sich (mit zwei gültigen Ziffern Genauigkeit) 

$$
 \bar v = 0{,}92 \cdot \sqrt{\frac{3 \cdot k_{\rm B} \cdot T}{m_{\rm A}(\rm{N}_2)}} = 0{,}92 \cdot \sqrt{\frac{3 \cdot 1{,}38 \cdot 10^{-23}\,\rm{\frac{J}{K}} \cdot 295\,\rm K} {28 \cdot 1{,}66 \cdot 10^{-27}\,\rm{kg}}} = 4{,}7 \cdot 10^{2}\,\rm{\frac{m}{s}} 
$$


b)

Es handelt sich um einen isothermen Prozess, bei dem das Gesetz von BOYLE-MARIOTTE gilt 

$$
 p_1 \cdot V_1 = p_0 \cdot V_0 \Leftrightarrow p_1 \cdot A \cdot h_1 = p_0 \cdot A \cdot h_0 \Leftrightarrow h_1 = \frac{p_0 \cdot h_0}{p_1} 
$$

 $ p_1 $ berechnet sich durch 

$$
 p_1 = b + p_{\rm Hg} 
$$

 wobei $ b $ den äußeren Luftdruck darstellt, der dem Druck $ p_0 $ gleich ist. Damit ergibt sich für $ p_1 $ 

$$
 p_1 = p_0 + \rho_{\rm Hg} \cdot g \cdot l = 980 \cdot 10^2\,\rm{Pa} + 13{,}55 \cdot 10^3\,\rm{\frac{kg}{m^3}} \cdot 9{,}81\,\rm{\frac{m}{s^2}} \cdot 0{,}100\,\rm m = 1{,}11 \cdot 10^5\,\rm{Pa} 
$$

 und damit für $ h_1 $ 

$$
 h_1 = \frac{980 \cdot 10^2\,\rm{Pa} \cdot 5{,}0 \cdot 10^{-2}\,\rm m}{1{,}11 \cdot 10^5\,\rm{Pa}} = 4{,}4 \cdot 10^{-1}\,\rm m = 44\,\rm{cm} 
$$


c)

Es handelt sich um einen isobaren Prozess, bei dem das Gesetz von GAY-LUSSAC gilt. Im Zustand 1 gilt $ T_1 = T_0 $: 

$$
 \frac{V_2}{T_2} = \frac{V_1}{T_1} \Leftrightarrow \frac{A \cdot h_2}{T_2} = \frac{A \cdot h_1}{T_1} \Leftrightarrow h_2 = \frac{T_2 \cdot h_1}{T_1} = \frac{T_2 \cdot h_1}{T_0} 
$$

 Einsetzen der gegebenen Werte liefert (mit zwei gültigen Ziffern Genauigkeit) 

$$
 h_2 = \frac{373\,\rm K \cdot 4{,}4 \cdot 10^{-1}\,\rm m}{295\,\rm K} = 5{,}6 \cdot 10^{-1}\,\rm m = 56\,\rm{cm} 
$$


## Grundwissen
- [Universelle Gasgleichung](https://www.leifiphysik.de/waermelehre/kinetische-gastheorie/grundwissen/universelle-gasgleichung)
