# Rotierende Spule im Erdmagnetfeld (Abitur BY 2015 Ph11 A2-2)

Quelle: https://www.leifiphysik.de/elektrizitaetslehre/elektromagnetische-induktion/aufgabe/rotierende-spule-im-erdmagnetfeld-abitur-2015-ph11-a2-2
Originaldatei: `curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/abi/Physik/input/leifiphysik_abitur/pages/elektrizitaetslehre/elektromagnetische-induktion/aufgabe/rotierende-spule-im-erdmagnetfeld-abitur-2015-ph11-a2-2.html`
Schwierigkeitsgrad: mittelschwere Aufgabe

## Aufgabe

![](https://www.leifiphysik.de/sites/default/files/2025/12/image/rotierende-spule-im-erdmagnetfeld-abitur-by-2015-ph11%20A2-2_skizze1.svg)

Abb. 1 Skizze zur Aufgabe

[CC-BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/deed.de) / FWU Institut für Film und Bild;

Eine rechteckige Spule mit $N$ Windungen und den Seitelängen $a$ und $b$ ist auf eine Rotationsachse montiert, die in senkrechter Position in eine Bohrmaschine eingespannt ist. Die Drehzahl, mit der die Spule im Erdmagnetfeld der Flussdichte $B_{\rm{Erde}} = 49\,\rm{\mu T}$ rotiert, beträgt $300$ Umdrehungen pro Minute. Für den magnetischen Fluss durch die Spule gilt $\Phi (t)=a \cdot b \cdot B_1 \cdot \cos(\omega \cdot t)$, wobei $\omega$ die Winkelgeschwindigkeit und $B_1$ eine Komponente von $B_{\rm{Erde}}$ sind.

a)

Die magnetischen Feldlinien treten unter einem Winkel von $66^\circ$ gegenüber der Horizontalen in den Erdboden ein.

Beschrifte zunächst die entsprechenden Pfeile in obiger Abbildung mit $\vec B_{\rm{Erde}}$ und $\vec B_1$ sowie $\vec B_2$, der anderen Komponente von $\vec B_{\rm{Erde}}$.

Berechne dann $B_1$. [zur Kontrolle: $B_1=20\,\rm{\mu T}$] (5 BE)

b)

Zeige, dass für den Scheitelwert $U_0$ der an den Schleifringen messbaren Induktionsspannung $U_{\rm{i}}(t)$ die Beziehung $U_0 = N\cdot a\cdot b\cdot B_1\cdot \omega$ gilt.

Zeichne unter der Annahme, dass dieser Scheitelwert $1{,}0\,\rm{mV}$ beträgt, den zeitlichen Verlauf von $U_{\rm{i}}(t)$ für $t = 0$ bis $t = 0{,}40\,\rm{s}$. (7 BE)

c)

Gib sinnvolle Werte für $a$, $b$ und $N$ an, sodass der in Teilaufgabe b) gezeichnete Graph von $U_{\rm{i}}(t)$ tatsächlich beobachtet werden kann. (5 BE)

## Lösung

**Hinweis:** Bei dieser Lösung von LEIFIphysik handelt es sich nicht um den amtlichen Lösungsvorschlag des bayr. Kultusministeriums.

a)

![](https://www.leifiphysik.de/sites/default/files/2025/12/image/rotierende-spule-im-erdmagnetfeld-abitur-by-2015-ph11%20A2-2_skizze2.svg)

Abb. 2 Skizze zur Lösung von Aufgabenteil a)

[CC-BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/deed.de) / FWU Institut für Film und Bild;

$\vec B_{\rm{1}}$ ist die Horizontalkomponente des Erdmagnetfeldes.

${\vec B_{\rm{2}}}$ ist die Vertikalkomponente des Erdmagnetfeldes.

Berechnung des Betrages von $\vec{B}_{\rm 1}$: 

$$
 B_1 = B_{\rm Erde} \cdot \cos(66^\circ) \Rightarrow B_1 = 49 \cdot 10^{-6} \,\frac{\rm V\,s}{\rm m^2} \cdot \cos(66^\circ) = 20 \cdot 10^{-6} \,\frac{\rm V\,s}{\rm m^2} = 20\,\rm\mu T 
$$


b)

Das Induktionsgesetz lautet 

$$
 U_{\rm i}(t) = -N \cdot \frac{d\Phi}{dt} \quad (1) 
$$

 Setzt man in $(1)$ den in der Angabe vorgegebenen Ausdruck für den magnetischen Fluss $\Phi(t) = a \cdot b \cdot B_1 \cdot \cos(\omega \cdot t)$ ein, so ergibt sich 

$$
 U_{\rm i}(t) = -N \cdot \frac{d[a \cdot b \cdot B_1 \cdot \cos(\omega \cdot t)]}{dt} = -N \cdot a \cdot b \cdot B_1 \cdot \frac{d\cos(\omega \cdot t)}{dt} = N \cdot a \cdot b \cdot B_1 \cdot \omega \cdot \sin(\omega \cdot t) 
$$

 Der Faktor vor der Sinusfunktion stellt die Amplitude $U_0$ der auftretenden Induktionsspannung dar. Es gilt also 

$$
 U_0 = N \cdot a \cdot b \cdot B_1 \cdot \omega 
$$

 Bei $300$ Umdrehungen pro Minute dreht sich die Spule wegen $300:60=5$ in der Sekunde fünf Mal. Dieser Frequenz von $5\,\rm{Hz}$ entspricht wegen $T = \frac{1}{f}$ eine Umlaufdauer $T$ von $0{,}20\,\rm{s}$.

![](https://www.leifiphysik.de/sites/default/files/2025/12/image/rotierende-spule-im-erdmagnetfeld-abitur-by-2015-ph11%20A2-2_diagramm.svg)

Abb. 3 $t$-$U_{\rm{i}}$-Diagramm

[CC-BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/deed.de) / FWU Institut für Film und Bild;

c)

Der Wert für $U_0$ soll $1{,}0 \cdot 10^{-3} \,\rm V$ sein, die Frequenz $f$ soll den Wert $f = 300 \,\frac{1}{\rm min} = 5{,}00 \,\frac{1}{\rm s}$ haben. Somit gilt für das Produkt aus $N$, $a$ und $b$ 

$$
 U_0 = N \cdot a \cdot b \cdot B_1 \cdot \omega \Leftrightarrow N \cdot a \cdot b = \frac{U_0}{B_1 \cdot \omega} = \frac{U_0}{B_1 \cdot 2 \cdot \pi \cdot f} 
$$

 Einsetzen der gegebenen Werte liefert 

$$
 N \cdot a \cdot b = \frac{1{,}0 \cdot 10^{-3} \,\rm V}{20 \cdot 10^{-6} \,\frac{\rm V \cdot s}{\rm m^2} \cdot 2 \cdot \pi \cdot 5{,}00 \,\frac{1}{\rm s}} = 1{,}6 \,\rm m^2 
$$

 Dieser Wert für das Produkt aus $N$, $a$ und $b$ ist z.B. für $N = 80$; $b = 0{,}20 \,\rm m$ und $a = 0{,}10 \,\rm m$ zu erreichen.

## Grundwissen
- [Induktion durch Änderung der Winkelweite](https://www.leifiphysik.de/elektrizitaetslehre/elektromagnetische-induktion/grundwissen/induktion-durch-aenderung-der-winkelweite)
