# Erzeugung von Wechselspannung (Abitur BY 2001 GK A1-3)

Quelle: https://www.leifiphysik.de/elektrizitaetslehre/elektromagnetische-induktion/aufgabe/erzeugung-von-wechselspannung-abitur-2001-gk-a1-3
Originaldatei: `curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/abi/Physik/input/leifiphysik_abitur/pages/elektrizitaetslehre/elektromagnetische-induktion/aufgabe/erzeugung-von-wechselspannung-abitur-2001-gk-a1-3.html`
Schwierigkeitsgrad: mittelschwere Aufgabe

## Aufgabe

![](https://www.leifiphysik.de/sites/default/files/images/5cb06c3f7bc042e99903cd9390ece580/287erzeugung-von-wechselspannung-abitur-by-2001-gk-a1-3_skizze.gif)

Abb. 1 Skizze zur Aufgabe

[CC-BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/deed.de) / FWU Institut für Film und Bild;

Das homogene Magnetfeld im Inneren einer langen Feldspule (Windungszahl $N_{\rm{F}} = 1200$; Länge $l = 30\,\rm{cm}$) hat die Feldstärke $5{,}0\,\rm{mT}$. Dort befindet sich eine drehbar gelagerte Induktionsspule (Windungszahl $N_{\rm{ind}} = 200$; Querschnittsfläche $A = 25\,\rm{cm}^2$), wobei die Drehachse der Induktionsspule und die Feldspulenachse zueinander senkrecht sind (siehe Abbildung).

a)

Berechne die Stromstärke in der Feldspule. (5 BE)

b)

Beim Einschalten des Feldstroms stehen die Querschnittsflächen der Spulen senkrecht aufeinander.

Gib begründet an, ob sich hierbei eine Wirkung auf die Induktionsspule ergibt. (4 BE)

c)

Nun soll durch Drehung der Induktionsspule eine sinusförmige Wechselspannung mit dem Effektivwert $U_{\rm{eff}} = 25\,\rm{mV}$ erzeugt werden. **Hinweis:** Für den Effektivwert einer Wechselspannung gilt ${U_{\rm{eff}}} = \frac{{\hat U}}{{\sqrt 2 }}$

Wähle hierzu für die Zeit $t = 0$ eine geeignete Anfangsstellung der Induktionsspule.

Leite den Term für die induzierte Spannung $U_{\rm{ind}}(t)$ her.

Berechne damit die Drehfrequenz. (9 BE)

## Lösung

**Hinweis:** Bei dieser Lösung von LEIFIphysik handelt es sich nicht um den amtlichen Lösungsvorschlag des bayr. Kultusministeriums.

a)


$$
 B = \mu_0 \cdot \frac{N_{\rm F} \cdot I}{l}\Leftrightarrow I = \frac{B \cdot l}{\mu_0 \cdot N_{\rm F}} 
$$

 Einsetzen der gegebenen Werte liefert (mit zwei gültigen Ziffern Genauigkeit) 

$$
 I = \frac{5{,}0 \cdot 10^{-3} \frac{\rm{V\,s}}{\rm m^2} \cdot 0{,}30\,\rm{m}}{4 \, \pi \cdot 10^{-7} \frac{\rm{V\,s}}{\rm A\,m} \cdot 1200} = 0{,}99\,\rm{A} 
$$


b)

Wenn die Fläche der Feldspule senkrecht auf der Fläche der Induktionsspule steht, so wird die Induktionsspule (im Idealfall) von keinem Magnetfeld durchsetzt, somit ändert sich beim Einschalten auch der magnetische Fluss durch die Induktionsspule nicht und damit entsteht auch keine Induktionsspannung.

c)

Als Nullstellung der Induktionsspule stellen wir die Induktionsspule so, dass sie senkrecht zu den Feldlinien steht und damit Feldstärkevektor und Flächenvektor parallel verlaufen. Weiter gilt für die zeitliche Abhängigkeit der Winkelweite $\varphi$ zwischen Feldstärkevektor und Flächenvektor 

$$
 \varphi(t) = \omega \cdot t 
$$

 Für die induzierte Spannung gilt dann nach dem Induktionsgesetz (differentielle Form) \begin{aligned} U\_{\rm ind} &= - N\_{\rm ind} \cdot \frac{{\rm d}\Phi}{{\rm d}t}\\ &= - N\_{\rm ind} \cdot \frac{{\rm d}}{{\rm d}t}\Bigl( B \cdot A \cdot \cos \left( \omega \cdot t \right) \Bigr)\\ &= - N\_{\rm ind} \cdot B \cdot A \cdot \Bigl( -\sin \left( \omega \cdot t \right) \cdot \omega \Bigr) \\ &= N\_{\rm ind} \cdot B \cdot A \cdot \omega \cdot \sin \left( \omega \cdot t \right) \end{aligned} Mit $\hat U = N_{\rm ind} \cdot B \cdot A \cdot \omega$ folgt dann 

$$
 U_{\rm ind} = \hat U \cdot \sin \left( \omega \cdot t \right) 
$$

 Für den Zusammenhang zwischen Scheitelwert $\hat U$ und Effektivwert gilt 

$$
 U_{\rm eff} = \frac{\hat U}{\sqrt{2}}= \frac{N_{\rm ind} \cdot B \cdot A \cdot 2 \, \pi \cdot f}{\sqrt{2}} 
$$

 Für die Frequenz gilt 

$$
 f = \frac{U_{\rm eff} \cdot \sqrt{2}}{N_{\rm ind} \cdot B \cdot A \cdot 2 \, \pi} 
$$

 Einsetzen der gegebenen Werte liefert (mit zwei gültigen Ziffern Genauigkeit) 

$$
 f = \frac{25 \cdot 10^{-3}\,\rm{V} \cdot \sqrt{2}}{200 \cdot 5{,}0 \cdot 10^{-3} \frac{\rm{V\,s}}{\rm m^2} \cdot 25 \cdot 10^{-4} \,\rm{m^2} \cdot 2 \, \pi} = 2{,}3\,\rm{Hz} 
$$


## Grundwissen
- [Induktion durch Änderung der Winkelweite](https://www.leifiphysik.de/elektrizitaetslehre/elektromagnetische-induktion/grundwissen/induktion-durch-aenderung-der-winkelweite)
