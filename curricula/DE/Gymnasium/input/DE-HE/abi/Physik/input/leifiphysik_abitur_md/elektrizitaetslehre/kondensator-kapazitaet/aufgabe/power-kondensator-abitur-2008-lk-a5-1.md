# Power-Kondensator (Abitur BY 2008 LK A5-1)

Quelle: https://www.leifiphysik.de/elektrizitaetslehre/kondensator-kapazitaet/aufgabe/power-kondensator-abitur-2008-lk-a5-1
Originaldatei: `curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/abi/Physik/input/leifiphysik_abitur/pages/elektrizitaetslehre/kondensator-kapazitaet/aufgabe/power-kondensator-abitur-2008-lk-a5-1.html`
Schwierigkeitsgrad: schwere Aufgabe

## Aufgabe

![](https://www.leifiphysik.de/sites/default/files/images/f2cab5d540d47472ed5c2b942b2046d8/234power-kondensator-abitur-by-2008-lk-a5-1_skizze1.gif)

Abb. 1 Schaltskizze zur Aufgabe

[CC-BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/deed.de) / FWU Institut für Film und Bild;

Ein Power-Kondensator wird im Auto zur Stabilisierung der $U = 12\,\rm{V}$-Betriebsspannung bei kurzzeitig erhöhtem Strombedarf eingesetzt. Bei der Konstruktion dieses Kondensators wird u. a. auf eine hohe Energiedichte $w_{\rm el}$ Wert gelegt:

$$
w_{\rm el} = \frac{\rm{gespeicherte\;elektrische\;Energie}}{\rm{Volumen\;des\;Kondensators}}
$$


**Daten des Power-Kondensators:** Zylinderform (Durchmesser $d_1 = 8{,}0\,\rm{cm}$, Höhe $h = 28\,\rm{cm}$), Kapazität $C = 1{,}5\,\rm{F}$, Innenwiderstand $R_{\rm i} = 20\,\rm{m\Omega }$ , Ladespannung $U = 12{,}0\,\rm{V}$.

a)

Berechne die gespeicherte Energie und die Energiedichte des vollständig geladenen Kondensators. (5 BE)

b)

Berechne den Durchmesser $D$, den die kreisförmigen Platten eines Kondensators mit Luft im Zwischenraum und einem Plattenabstand $d'$ von $1{,}0\,\rm{mm}$ hätten, wenn dessen Kapazität ebenfalls $1{,}5\,\rm{F}$ beträgt.

Berechne die Energiedichte, die das elektrische Feld dieses Plattenkondensators bei einer Spannung von $12{,}0\,\rm{V}$ hätte. (5 BE)

![](https://www.leifiphysik.de/sites/default/files/images/fbb4baafb1b48c2e1c974e47576e8250/408power-kondensator-abitur-by-2008-lk-a5-1_diagramm1.gif)

Abb. 2 $t$-$I$-Diagramm der Entladung

[CC-BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/deed.de) / FWU Institut für Film und Bild;

Der geladene Power-Kondensator wird über einen Lastwiderstand $R_{\rm{a}}$ entladen. Das Diagramm in Abb. 2 stellt den zeitlichen Verlauf der Entladestromstärke $I$ dar.

c)

Entnimm dem Diagramm die momentanen Entladestromstärken für $t_1 = 0\,\rm{s}$ bis $t_7 = 0{,}3\,\rm{s}$ in Abständen von $50\,\rm{ms}$.

Erstelle hierzu eine Wertetabelle.

Zeichne das zugehörige $t$-$\ln \left( \frac{I}{I_0} \right)$-Diagramm. (7 BE)

d)

Der Entladevorgang wird durch die Funktion $I(t) = I_0 \cdot {e^{-\;k \cdot t}}$ mit $k = \frac{1}{\left( R_{\rm i} + R_{\rm a} \right) \cdot C}$ beschrieben.

Erläutere, wie dieser Zusammenhang mit dem in Teilaufgabe c) erstellten Diagramm bestätigt werden kann.

Ermittle die Konstante $k$ aus diesem Diagramm.

Berechne damit $R_{ \rm a}$. [zur Kontrolle: $R_{ \rm a} = 78\,\rm{m\Omega}$ ] (6 BE)

e)

Schätze die elektrische Energie ab, die der Power-Kondensator während der ersten $50\,\rm{ms}$ bei der Entladung abgibt. (4 BE)

## Lösung

**Hinweis:** Bei dieser Lösung von LEIFIphysik handelt es sich nicht um den amtlichen Lösungsvorschlag des bayr. Kultusministeriums.

a)

Berechnung der elektrischen Energie: 

$$
 W_{\rm el} = \frac{1}{2} \cdot C \cdot U^2
$$

Einsetzen der gegebenen Werte liefert (mit drei gültigen Ziffern Genauigkeit)

$$
 W_{\rm el} = \frac{1}{2} \cdot 1{,}50 \cdot 12{,}0^2 \,\rm J = 108 \,\rm J 
$$

 Berechnung der Energiedichte: 

$$
 w_{\rm el} = \frac{W_{\rm el}}{V} = \frac{W_{\rm el}}{\left( \frac{d}{2} \right)^2 \cdot \pi \cdot h}
$$

Einsetzen der gegebenen Werte liefert (mit zwei gültigen Ziffern Genauigkeit)

$$
 w_{\rm el} = \frac{108\,\rm J}{\left( \frac{0{,}080}{2} \right)^2 \cdot \pi \cdot 0{,}28\,\rm m^3} = 77 \,\frac{\rm kJ}{\rm m^3} 
$$


b)

Berechnung des Durchmessers des "Luftkondensators": \begin{aligned} C &= \varepsilon\_0 \cdot \frac{A}{d'}\\&= \varepsilon\_0 \cdot \frac{\left( \frac{D}{2} \right)^2 \pi}{d'} \\ \left( \frac{D}{2} \right)^2 &=  \frac{C \cdot d'}{\varepsilon\_0 \cdot \pi} \\ D &= 2 \cdot \sqrt{\frac{C \cdot d'}{\varepsilon\_0 \cdot \pi}} \\ &= 2 \cdot \sqrt{\frac{1{,}50 \cdot 0{,}0010}{8{,}85 \cdot 10^{-12} \cdot \pi}} \,\rm m\\&= 15 \,\rm km \end{aligned} Berechnung der Energiedichte des "Luftkondensators": 

$$
w_{\rm el}= \frac{W_{\rm el}}{V} = \frac{W_{\rm el}}{\left( \frac{D}{2} \right)^2 \cdot \pi \cdot d'}
$$

Einsetzen der gegebenen Werte liefert (mit zwei gültigen Ziffern Genauigkeit)

$$
w_{\rm el} = \frac{108\,\rm J}{\left( \frac{14{,}69 \cdot 10^3}{2} \right)^2 \cdot \pi \cdot 0{,}0010\,\rm m^3} = 0{,}64 \,\frac{\rm mJ}{\rm m^3} 
$$


c)

![](https://www.leifiphysik.de/sites/default/files/images/bc8c53d1addde3ab9065ed3492b4312b/605power-kondensator-abitur-by-2008-lk-a5-1_diagramm2.gif)

Abb. 3 $t$-$\ln \left( \frac{I}{I_0} \right)$-Diagramm zur Lösung von Aufgabenteil c)

[CC-BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/deed.de) / FWU Institut für Film und Bild;

|  |  |  |  |  |  |  |  |
| --- | --- | --- | --- | --- | --- | --- | --- |
| $t\;{\rm{in}}\;{\rm{s}}$ | $0$ | $0{,}050$ | $0{,}10$ | $0{,}15$ | $0{,}20$ | $0{,}25$ | $0{,}30$ |
| $I\;{\rm{in}}\;{\rm{A}}$ | $116$ | $83$ | $59$ | $42$ | $30$ | $21$ | $14$ |
| $\ln \left( \frac{I}{I_0} \right)$ | $0$ | $-0{,}33$ | $-0{,}68$ | $-1{,}0$ | $-1{,}4$ | $-1{,}7$ | $-2{,}1$ |

d)

Durch Logarithmieren der Funktion 

$$
 I(t) = I_0 \cdot e^{-k \cdot t} 
$$

 erhält man 

$$
 \frac{I(t)}{I_0} = e^{-k \cdot t} \quad \Rightarrow \quad \ln \left( \frac{I(t)}{I_0} \right) = -k \cdot t 
$$

 Die Größe $-k$ ist somit die Steigung der Ursprungsgeraden in dem obigen Diagramm. Mit Hilfe eines Steigungsdreiecks erhält man $k = 6{,}8 \,\frac{1}{\rm s}$. Berechnung von $R_{\rm a}$: 

$$
k = \frac{1}{(R_{\rm a} + R_{\rm i}) \cdot C} \Leftrightarrow R_{\rm a} = \frac{1}{k \cdot C} - R_{\rm i}
$$

Einsetzen der gegebenen Werte liefert (mit zwei gültigen Ziffern Genauigkeit) 

$$
R_{\rm a}= \frac{1}{6{,}8 \cdot 1{,}50} \,\frac{\rm s \cdot \rm V}{\rm A \cdot \rm s} - 20 \cdot 10^{-3} \,\Omega = 78 \,\rm m\Omega
$$


e)

![](https://www.leifiphysik.de/sites/default/files/images/e10bcc72288cf7d901248afcfeaeabad/161power-kondensator-abitur-by-2008-lk-a5-1_diagramm3.gif)

Abb. 4 Skizze zur Lösung von Aufgabenteil e)

[CC-BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/deed.de) / FWU Institut für Film und Bild;

 Abschätzung der Ladung (Fläche unter der Zeit-Strom-Kurve) in den ersten $50 \,\rm ms$: Die mittlere Stromstärke in diesem Zeitintervall ist ca. $100 \,\rm A$. Somit gilt für die Ladung 

$$
 \Delta Q = \overline{I} \cdot \Delta t
$$

Einsetzen der gegebenen Werte liefert (mit zwei gültigen Ziffern Genauigkeit) 

$$
\Delta Q = 100 \cdot 50 \cdot 10^{-3} \,\rm A\,s = 5{,}0 \,\rm A\,s 
$$

 Für die elektrische Energie gilt 

$$
 \Delta W_{\rm el} = \Delta Q \cdot U = \Delta Q \cdot \overline{I} \cdot R_{\rm a}
$$

Einsetzen der gegebenen Werte liefert (mit zwei gültigen Ziffern Genauigkeit) 

$$
\Delta W_{\rm el} = 5{,}0 \cdot 100 \cdot 78 \cdot 10^{-3} \,\rm J = 39 \,\rm J 
$$


## Grundwissen
- [Ein- und Ausschalten von RC-Kreisen](https://www.leifiphysik.de/elektrizitaetslehre/kondensator-kapazitaet/grundwissen/ein-und-ausschalten-von-rc-kreisen)
- [Auswerten von Entladekurven](https://www.leifiphysik.de/elektrizitaetslehre/kondensator-kapazitaet/grundwissen/auswerten-von-entladekurven)
