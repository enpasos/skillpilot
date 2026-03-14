# Induktion in rotierender Spule (Abitur BY 1998 GK A1-3)

Quelle: https://www.leifiphysik.de/elektrizitaetslehre/elektromagnetische-induktion/aufgabe/induktion-rotierender-spule-abitur-1998-gk-a1-3
Originaldatei: `curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/abi/Physik/input/leifiphysik_abitur/pages/elektrizitaetslehre/elektromagnetische-induktion/aufgabe/induktion-rotierender-spule-abitur-1998-gk-a1-3.html`
Schwierigkeitsgrad: leichte Aufgabe

## Aufgabe

In einem homogenen magnetischen Feld mit der Feldstärke $B$ befindet sich eine flache Induktionsspule mit der Querschnittsfläche $A = 40\,\rm{cm}^2$ und der Windungszahl $N = 500$. Die Drehachse liegt in der Spulenebene und steht senkrecht auf den Feldlinien des Magnetfelds. Wenn die Induktionsspule mit konstanter Frequenz $f$ rotiert, wird in ihr eine sinusförmige Wechselspannung mit dem Scheitelwert $\widehat U_{\rm{i}}$ induziert. Indem $f$ auf verschiedene Werte eingestellt wird, ermittelt man die folgende Messreihe:

**Tab. 1** Messwerte

|  |  |  |  |  |
| --- | --- | --- | --- | --- |
| $f\;\rm{in\;Hz}$ | $16$ | $22$ | $28$ | $36$ |
| $\widehat U_{\rm{ind}}\;\rm{in\;V}$ | $0{,}34$ | $0{,}46$ | $0{,}59$ | $0{,}75$ |

a)

Zeige durch graphische Auswertung, dass $\widehat U_{\rm{ind}}$ zu $f$ direkt proportional ist.

Ermittle den Wert des Proportionalitätsfaktors $k$. (6 BE)

b)

Bestätige, ausgehend vom Induktionsgesetz, dass für den Proportionalitätsfaktor $k$ aus Teilaufgabe a) gilt

$$
k = 2 \, \pi \cdot N \cdot A \cdot B
$$


Berechne den Wert von $B$. (9 BE)

## Lösung

**Hinweis:** Bei dieser Lösung von LEIFIphysik handelt es sich nicht um den amtlichen Lösungsvorschlag des bayr. Kultusministeriums.

a)

![](https://www.leifiphysik.de/sites/default/files/images/bbe282fea1a23b67154fe9830d7ce562/175induktion-in-rotierender-spule-abitur-by-1998-gk-a1-3_diagramm.gif)

Abb. 1 Skizze zur Lösung von Aufgabenteil a)

[CC-BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/deed.de) / FWU Institut für Film und Bild;

Das Diagramm in Abb. 1 (mit $U_0$ statt $\widehat U_{\rm{ind}}$) zeigt die Proportionalität. Somit gilt ${\widehat U_{\rm{ind}}} = k \cdot f \quad(1)$.

Der Proportionalitätsfaktor ergibt sich aus der Steigung der Geraden:

$$
k=\frac{0{,}75\,\rm{V}}{36\,\rm{Hz}} = 0{,}021\,\rm{V\,s} \quad(2)
$$


b)

Für den Fall einer Spule mit $N$ Windungen lautet das Induktionsgesetz \begin{aligned} U\_{\rm ind} &= - N \cdot \frac{{\rm d}\Phi}{{\rm d}t}\\ &= - N \cdot \frac{{\rm d}}{{\rm d}t}\left( B \cdot A \cdot \cos \left( \omega t \right) \right)\\ &= - N \cdot \left( B \cdot A \cdot \left( - \sin \left( \omega t \right) \right) \cdot \omega \right)\\ &= \underbrace{N \cdot B \cdot A \cdot \omega}\_{{\widehat U}\_{\rm ind}} \cdot \sin \left( \omega t \right) \end{aligned} Mit $\omega = 2 \, \pi \cdot f$ ergibt sich somit 

$$
 {\widehat U}_{\rm ind} = 2 \, \pi \cdot f \cdot N \cdot A \cdot B 
$$

 Mit Gleichung $(1)$ ergibt sich dann 

$$
 k = 2 \, \pi \cdot N \cdot A \cdot B 
$$

 Auflösen nach $B$ ergibt 

$$
 B = \frac{k}{2 \cdot \pi \cdot N \cdot A} 
$$

 Einsetzen der gegebenen und berechneten Werten liefert (mit zwei gültigen Ziffern Genauigkeit) 

$$
 B = \frac{0{,}021\,\rm{V\,s}}{2 \, \pi \cdot 500 \cdot 40 \cdot 10^{-4}\,\rm{m}^2} = 1{,}7 \cdot 10^{-3}\,\rm{T} = 1{,}7\,\rm{mT} 
$$


## Grundwissen
- [Induktion durch Änderung der Winkelweite](https://www.leifiphysik.de/elektrizitaetslehre/elektromagnetische-induktion/grundwissen/induktion-durch-aenderung-der-winkelweite)
