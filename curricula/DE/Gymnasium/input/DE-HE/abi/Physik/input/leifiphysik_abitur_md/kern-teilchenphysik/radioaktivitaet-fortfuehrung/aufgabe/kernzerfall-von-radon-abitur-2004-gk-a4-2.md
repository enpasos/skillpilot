# Kernzerfall von Radon (Abitur BY 2004 GK A4-2)

Quelle: https://www.leifiphysik.de/kern-teilchenphysik/radioaktivitaet-fortfuehrung/aufgabe/kernzerfall-von-radon-abitur-2004-gk-a4-2
Originaldatei: `curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/abi/Physik/input/leifiphysik_abitur/pages/kern-teilchenphysik/radioaktivitaet-fortfuehrung/aufgabe/kernzerfall-von-radon-abitur-2004-gk-a4-2.html`
Schwierigkeitsgrad: schwere Aufgabe

## Aufgabe

Das gasförmige radioaktive $^{220}\rm{Rn}$ entsteht durch zwei aufeinander folgende Zerfälle aus $^{228}\rm{Th}$. Der Zerfall von $^{220}\rm{Rn}$ soll mit Hilfe einer Ionisationskammer untersucht und damit eine Gesetzmäßigkeit des radioaktiven Zerfalls festgestellt werden. Ein Experiment ergibt die folgende Messtabelle für die Ionisationsstromstärke $I$ in Abhängigkeit von der Zeit $t$:

|  |  |  |  |  |  |
| --- | --- | --- | --- | --- | --- |
| $t\,\rm{in}\,\rm{s}$ | 0 | 30 | 60 | 120 | 180 |
| $I(t)\,\rm{in}\,10^{-12}\,\rm{A}$ | 30 | 21 | 14 | 6,6 | 3,0 |

a)

Geben Sie die dabei entstehenden Zerfallsprodukte an. (2 BE)

b)

Beschreiben Sie anhand einer Schaltskizze den Aufbau und die Funktionsweise einer Ionisationskammer als Nachweisgerät für ionisierende Strahlung. (8 BE)

c)

Zeichnen Sie zu der Messreihe ein Diagramm, in dem $\ln \left( \frac{I(t)}{I(0)} \right) $ gegen $t$ aufgetragen wird. (7 BE)

d)

Die sich in diesem Diagramm ergebende Gerade ist Konsequenz des Zerfallsgesetzes $N(t) = N_0 \cdot e^{-\lambda \cdot t}$.
Erläutern Sie, welche Beziehung zwischen der Teilchenzahl $N(t)$ und der Stromstärke $I(t)$ besteht und welche Bedeutung die Zerfallskonstante $\lambda$ im Diagramm besitzt.
Bestimmen Sie aus den Messdaten die Zerfallskonstante $\lambda$ und die Halbwertszeit $T_{1/2}$ des verwendeten $\rm{Rn}$-Isotops. (7 BE)

e)

Das zur Messung der Ionisationsstromstärke $I$ benutzte Messgerät zeigt praktisch keinen Ausschlag mehr an, wenn die Stromstärke unter $\frac{1}{64}$ der Anfangsstromstärke $I(0)$ sinkt. Berechnen Sie damit die bei diesem Experiment sinnvolle Gesamtmessdauer in Minuten. (6 BE)

## Lösung

a)

Die Zerfallsprodukte sind

$$
^{228}{\rm{Th}}{ \to ^{224}}{\rm{Ra}}{ + ^4}{\rm{He}}\qquad{\;^{224}}{\rm{Ra}}{ \to ^{220}}{\rm{Rn}}{ + ^4}{\rm{He}}
$$


b)

![](https://www.leifiphysik.de/sites/default/files/2023/10/image/Kernzerfall_von_Radon_Aufbau.svg)

Abb. 1 Der Versuchsaufbau mit der Ionisationskammer, der Spannungsversorgung und dem Messgerät.

[CC-BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/deed.de) / FWU Institut für Film und Bild;

![](https://www.leifiphysik.de/sites/default/files/2023/10/image/Kernzerfall_von_Radon_Diagramm.svg)

Abb. 2 Kurve für den Ionisationsstrom

[CC-BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/deed.de) / FWU Institut für Film und Bild;

Eine Ionisationskammer ist ein Metallbehälter mit zwei voneinander isolierten Elektroden, in den ein Präparat oder ein radioaktives Gas eingebracht werden kann. Legt man zwischen die Elektroden eine Spannung $U$, so fließt aufgrund der Primärionisation ein Strom, der zunächst auch davon abhängig ist, wie hoch die Spannung eingestellt wird. Ab einer gewissen Spannung ist der Ionisationsstrom $I$ dann unabhängig von der Spannung und nur noch abhängig von der Primärionisation, da Rekombination vermieden werden kann. In diesem Fall befindet man sich im sogenannten Ionisationskammerbereich, in dem das Nachweisgerät gewöhnlich betrieben wird.

c)

Zunächst berechnet man $\ln \left( \frac{I(t)}{I(0)} \right)$ mittels der gegebenen Messwerte:

|  |  |  |  |  |  |
| --- | --- | --- | --- | --- | --- |
| $t\text{ in s}$ | 0 | 30 | 60 | 120 | 180 |
| $I(t)\text{ in }10^{-12}\,\rm{A}$ | 30 | 21 | 14 | 6,6 | 3,0 |
| 

$$
\ln \left( {\frac{{I\left( t \right)}}{{I\left( 0 \right)}}} \right)
$$

 | 0 | -0,36 | -0,76 | -1,51 | -2,30 |

![](https://www.leifiphysik.de/sites/default/files/2023/10/image/Kernzerfall_von_Radon_Diagramm2.svg)

Abb. 3 Messkurve

[CC-BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/deed.de) / FWU Institut für Film und Bild;

d)

Aus dem Diagramm ersieht man die folgende Gesetzmäßigkeit: 

$$
\ln \left( {\frac{{I\left( t \right)}}{{I\left( 0 \right)}}} \right) =  - \lambda  \cdot t \Leftrightarrow \frac{{I\left( t \right)}}{{I\left( 0 \right)}} = {e^{ - \lambda  \cdot t}} \Leftrightarrow I\left( t \right) = I\left( 0 \right) \cdot {e^{ - \lambda  \cdot t}}
$$

Dabei bedeutet $\lambda$  eine positive Konstante. Die Steigung der Geraden ist $-\lambda$. Durch Vergleich mit dem Zerfallsgesetz erkennt man, dass $I(t)\sim N(t)$ ist.

Berechnung der Zerfallskonstanten: 

$$
 - \lambda  = \frac{{\Delta \left( {\ln \frac{{I\left( t \right)}}{{I\left( 0 \right)}}} \right)}}{{\Delta t}} \Rightarrow \lambda  = \frac{{ - 2,5}}{{195{\rm{s}}}} = 0,0129\frac{1}{{\rm{s}}}
$$

 Für die Halbwertszeit gilt dann 

$$
{T_{1/2}} = \frac{{\ln \left( 2 \right)}}{\lambda } \Rightarrow {T_{1/2}} = \frac{{\ln \left( 2 \right)}}{{0{,}0129}}\,{\rm{s}} = 54\,{\rm{s}}
$$


e)

Wegen $\frac{1}{{64}} = \frac{1}{{{2^6}}}$ ist nach etwa sechs Halbwertszeiten der Strom nicht mehr messbar. Somit ist eine sinnvolle Gesamtmessdauer $6\cdot54\,\rm{}\approx 5\,\rm{min}$.

## Grundwissen
- [Auswerten von Zerfallskurven](https://www.leifiphysik.de/kern-teilchenphysik/radioaktivitaet-fortfuehrung/grundwissen/auswerten-von-zerfallskurven)
