# Analogie (Abitur BY 2002 GK A2-1)

Quelle: https://www.leifiphysik.de/elektrizitaetslehre/elektromagnetische-schwingungen/aufgabe/analogie-abitur-2002-gk-a2-1
Originaldatei: `curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/abi/Physik/input/leifiphysik_abitur/pages/elektrizitaetslehre/elektromagnetische-schwingungen/aufgabe/analogie-abitur-2002-gk-a2-1.html`
Schwierigkeitsgrad: mittelschwere Aufgabe

## Aufgabe

Die harmonische Schwingung eines Federpendels mit der Masse $m$ und der Federkonstante $D$ ist ein mechanisches Analogon zur ungedämpften Schwingung eines elektromagnetischen Schwingkreises. Dabei wird die (momentane) Auslenkung $x$ des Federpendels als die zur (momentanen) Ladung $Q$ des Kondensators analoge Größe betrachtet.

a)

Begründe, dass dann der (momentanen) Geschwindigkeit des Federpendels die (momentane) Stromstärke $I$ im Schwingkreis entspricht. (4 BE)

b)

Gib an, welche Formen elektromagnetischer Energie im Rahmen dieser Analogiebetrachtung der kinetischen Energie bzw. der potentiellen Energie des Federpendels entsprechen. Gib eine kurze Begründung an. (4 BE)

c)

Charakterisiere die Phasen der elektromagnetischen Schwingung, die den Phasen maximaler Auslenkung bzw. maximaler Geschwindigkeit des Federpendels entsprechen. (5 BE)

$Q_{\max}$ sei die maximale Ladung des Kondensators, $I_{\max}$ sei der Scheitelwert der Stromstärke in der Spule des Schwingkreises.

d)

Erläuter, warum die Gleichung

$$
\frac{1}{2} \cdot L \cdot I_{\max}^2 = \frac{1}{2} \cdot \frac{1}{C} \cdot Q_{\max}^2
$$

gilt. (4 BE)

$U_{\max}$ sei der Scheitelwert der Spannung am Kondensator des Schwingkreises.

e)

Entwickle (unter Verwendung der bei Teilaufgabe d) angegebenen Gleichung) die Beziehung

$$
I_{\max}= 2\,\pi \cdot f_0 \cdot C \cdot U_{\max}
$$

wenn $f_0$ die Eigenfrequenz des Schwingkreises bezeichnet. (5 BE)

In einem ungedämpft mit der Frequenz $f_0=2{,}0\,\rm Hz$ schwingenden Schwingkreis S beobachtet man die Scheitelwerte $U_{\max}=15\,\rm V$ und $I_{\max}=7{,}5\,\rm mA$.

f)

Berechne Kapazität $C$ und Induktivität $L$ des Schwingkreises. (6 BE)

Mit dem oben genannten Schwingkreis S wird ein Schwingkreis S' mit gleicher Kapazität $C'=C$ und einer zwischen $4 \cdot L$ und $L$ veränderlichen Induktivität $L'$ zu erzwungenen Schwingungen angeregt.

g)

Beschreibe qualitativ, wie sich die Frequenz bzw. die Amplitude der erzwungenen Schwingung des Schwingkreises S' verhält, wenn $L'$ allmählich von $4 \cdot L$ auf $L$ verringert wird. (4 BE)

## Lösung

**Hinweis:** Bei dieser Lösung von LEIFIphysik handelt es sich nicht um den amtlichen Lösungsvorschlag des bayr. Kultusministeriums.

a)

Wenn der Auslenkung $x$ die Ladung $Q$ entspricht, so ist die Ableitung der momentanen Auslenkung die analoge Größe zur Ableitung der Ladung. Da $ \frac{dx}{dt} = v$ und $\frac{dQ}{dt} = I$ gilt, sind die Geschwindigkeit und der Stromstärke die einander entsprechenden Größen.

b)

Für die potenzielle Energie der Feder gilt 

$$
 E_{\rm Spann} = \frac{1}{2} \cdot D \cdot x^2 
$$

 Die entsprechende Größe im Schwingkreis ist die elektrische Energie des Kondensators: 

$$
 E_{\rm el} = \frac{1}{2} \cdot \frac{1}{C} \cdot Q^2 
$$

 Für die kinetische Energie des Schwingers gilt 

$$
 E_{\rm kin} = \frac{1}{2} \cdot m \cdot v^2 
$$

 Die entsprechende Größe im Schwingkreis ist die magnetische Energie der Spule 

$$
 E_{\rm mag} = \frac{1}{2} \cdot L \cdot I^2 
$$


c)

![](https://www.leifiphysik.de/sites/default/files/images/6d9853bb3aa6f53f128125d3062e49cb/638analogie-abitur-by-2002-gk-a2-1_skizze.gif)

Abb. 1 Skizze zur Lösung von Aufgabenteil c)

[CC-BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/deed.de) / FWU Institut für Film und Bild;

d)

Diese Gleichung drückt aus, dass im Schwingkreis die Energie erhalten bleibt: Die maximale magnetische Energie der Spule $\frac{1}{2} \cdot L \cdot I_{\max}^2 $ (z.B. erste Spalte bei Teilaufgabe c)) ist gleich der maximalen elektrischen Energie des Kondensators $ \frac{1}{2} \cdot \frac{1}{C} \cdot Q_{\max}^2 $, die zu einem späteren Zeitpunkt erreicht wird (z.B. zweite Spalte bei Teilaufgabe c)).

e)

Mit dem Ergebnis von Teilaufgabe d) folgt 

$$
 \frac{1}{2} \cdot L \cdot I_{\rm max}^2 = \frac{1}{2} \cdot \frac{1}{C} \cdot Q_{\rm max}^2 \Leftrightarrow I_{\rm max}^2 = \frac{1}{L \cdot C} \cdot Q_{\rm max}^2 \Leftrightarrow I_{\rm max} = \sqrt{\frac{1}{L \cdot C}} \cdot Q_{\rm max} 
$$

 Da $Q_{\rm max} = C \cdot U_{\rm max}$ ist, folgt 

$$
I_{\rm max} = \sqrt{\frac{1}{L \cdot C}} \cdot C \cdot U_{\rm max} \quad (1)
$$

 Mit der THOMSON-Formel 

$$
\omega_0 = \sqrt{\frac{1}{L \cdot C}}
$$

 bzw. 

$$
2 \, \pi \cdot f_0 = \sqrt{\frac{1}{L \cdot C}}
$$

 folgt aus $(1)$ 

$$
 I_{\rm max} = 2 \, \pi \cdot f_0 \cdot C \cdot U_{\rm max} 
$$


f)

Mit dem Ergebnis von Teilaufgabe e) folgt 

$$
 C = \frac{I_{\rm max}}{2\,\pi \cdot f_0 \cdot U_{\rm max}} \Rightarrow C = \frac{7{,}5 \cdot 10^{-3}}{2\,\pi \cdot 2{,}0 \cdot 15}\,\rm F = 4{,}0 \cdot 10^{-5}\,\rm F 
$$

 Mit der THOMSON-Formel folgt 

$$
 \omega_0 = \sqrt{\frac{1}{L \cdot C}} 
$$

 bzw. 

$$
 2\,\pi \cdot f_0 = \sqrt{\frac{1}{L \cdot C}} \Rightarrow 4 \, \pi^2 \cdot f_0^2 = \frac{1}{L \cdot C} \Rightarrow L = \frac{1}{4 \pi^2 \cdot f_0^2 \cdot C} = \frac{1}{4 \,\pi^2 \cdot (2{,}0)^2 \cdot 4{,}0 \cdot 10^{-5}}\,\rm H = 1{,}6 \cdot 10^2\,\rm H 
$$


g)

Die Frequenz des Schwingkreises S' ist stets gleich der des Schwingkreises S (also $f_0$), da es sich um eine erzwungene Schwingung handelt.

Die Amplitude der erzwungenen Schwingung wird umso größer, je mehr sich der Wert von $L'$ an den Wert von $L$ annähert.

## Grundwissen
- [Elektromagnetischer Schwingkreis angeregt](https://www.leifiphysik.de/elektrizitaetslehre/elektromagnetische-schwingungen/grundwissen/elektromagnetischer-schwingkreis-angeregt)
