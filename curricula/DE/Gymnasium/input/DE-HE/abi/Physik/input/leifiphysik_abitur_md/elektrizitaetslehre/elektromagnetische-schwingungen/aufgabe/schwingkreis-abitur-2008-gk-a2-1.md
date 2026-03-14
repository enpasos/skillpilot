# Schwingkreis (Abitur BY 2008 GK A2-1)

Quelle: https://www.leifiphysik.de/elektrizitaetslehre/elektromagnetische-schwingungen/aufgabe/schwingkreis-abitur-2008-gk-a2-1
Originaldatei: `curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/abi/Physik/input/leifiphysik_abitur/pages/elektrizitaetslehre/elektromagnetische-schwingungen/aufgabe/schwingkreis-abitur-2008-gk-a2-1.html`
Schwierigkeitsgrad: leichte Aufgabe

## Aufgabe

![](https://www.leifiphysik.de/sites/default/files/images/10de88801c43e7bbd96e77c13b79f855/368schwingkreis-abitur-by-2008-gk-a2-1_skizze.gif)

Abb. 1 Schaltskizze des Schwingkreises

[CC-BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/deed.de) / FWU Institut für Film und Bild;

In der abgebildeten Schaltung ist die Kapazität $C=1{,}2\,\rm{mF}$ und die Spannung $U_0=5{,}0\,\rm{V}$. Die Resonanzfrequenz des Schwingkreises beträgt $f_0=2{,}0\,\rm{Hz}$.

a)

Wenn der Schalter S in die Stellung (1) gebracht wird, leuchtet das Lämpchen B kurz auf.

Erkläre diese Beobachtung. (3 BE)

b)

Der Schalter wird nun in die Stellung (2) gebracht.

Beschreibe und erläutere die zu erwartende Beobachtung am Strommessgerät über einen längeren Zeitraum. (5 BE)

c)

Skizziere den zeitlichen Verlauf der Kondensatorspannung $U_C(t)$ für die erste Sekunde nach dem Umschalten auf (2). (4 BE)

d)

Berechne die Induktivität $L$. Die OHMschen Widerstände von Messgerät und Spule können dabei vernachlässigt werden. [zur Kontrolle: $L=5{,}3\,\rm{H}$] (4 BE)

e)

Berechne, um wie viel Prozent sich die Resonanzfrequenz $f_0$ ändert, wenn man den Kondensator durch einen sonst baugleichen Kondensator mit doppelter Plattenfläche ersetzt.

Gib an, ob $f_0$ kleiner oder größer wird. (5 BE)

## Lösung

**Hinweis:** Bei dieser Lösung von LEIFIphysik handelt es sich nicht um den amtlichen Lösungsvorschlag des bayr. Kultusministeriums.

a)

In Stellung (1) wird der Kondensator durch die Gleichspannungsquelle aufgeladen. Während des Ladevorgangs fließt Strom. Ist der Kondensator voll aufgeladen ist I = 0. Dementsprechend leuchtet die Lampe B nur kurzzeitig während des Ladevorgangs auf.

b)

Wird der Schalter in Stellung (2) gebracht, so entlädt sich der Kondensator über die Spule. Durch das Strommessgerät fließt ein bei Null beginnender Strom, der sinusförmig bis zu einem Höchstwert anwächst. In dieser Phase wird die elektrische Energie des Kondensators in magnetische Energie der Spule gewandelt. Aufgrund der Selbstinduktion in der Spule fließt der Strom nach dem Erreichen des Höchstwertes in die gleiche Richtung weiter, nimmt jedoch vom Betrag her (sinusförmig) ab. Die magnetische Energie der Spule wird zum Teil in elektrische Energie des Kondensators gewandelt. Ein anderer Teil der Energie wird im ohmschen Widerstand der Schaltung (Zuleitungen; ohmscher Spulenwiderstand) in Wärme umgesetzt. Der Kondensator ist nun umgekehrt und nicht mehr so stark wie im Anfangszustand geladen. Nun wiederholt sich der beschriebene Vorgang, die Stromrichtung ist jedoch jetzt umgekehrt. Insgesamt ist eine gedämpfte Stromschwingung zu beobachten (Verlauf des Stroms siehe Skizze in Teilaufgabe c).

c)

![](https://www.leifiphysik.de/sites/default/files/images/eb7020b94181abf7d8f1325c9355aa74/593schwingkreis-abitur-by-2008-gk-a2-1_diagramm.gif)

Abb. 2 Lösung zu Aufgabenteil c)

[CC-BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/deed.de) / FWU Institut für Film und Bild;

Für den Zusammenhang zwischen Schwingungsdauer und Frequenz gilt

$$
T_0 = \frac{1}{f_0} \Rightarrow T_0 = \frac{1}{2{,}0\,\rm{Hz}}=0{,}50\,\rm{s}
$$


d)

Nach der THOMSON-Formel gilt

$$
2 \cdot \pi  \cdot {f_0} = \frac{1}{{\sqrt {L \cdot C} }} \Rightarrow L = \frac{1}{\left( 2 \cdot \pi  \cdot f_0 \right)^2 \cdot C}
$$

Einsetzen der gegebenen Größen liefert (mit zwei gültigen Ziffern Genauigkeit)

$$
L = \frac{1}{\left( 2 \cdot \pi  \cdot 2{,}0\,\rm{Hz} \right)^2 \cdot 1{,}2 \cdot 10^{-6}\,\rm{F}}=5{,}3\,\rm{H}
$$


e)

Durch die Verdoppelung der Plattenfläche wird die Kapazität des Kondensators verdoppelt, da gilt

$$
C = \varepsilon_0 \cdot \frac{A}{d}
$$

Für die neue Resonanzfrequenz ${f_0}^\*$ gilt

$$
{f_0}^\* = \frac{1}{{2 \cdot \pi  \cdot \sqrt {L \cdot 2 \cdot C} }} = \frac{1}{{2 \cdot \pi  \cdot \sqrt {L \cdot C} }}\frac{1}{{\sqrt 2 }} = {f_0} \cdot \frac{1}{{\sqrt 2 }}
$$

Die neue Resonanzfrequenz ist kleiner als die ursprüngliche Resonanzfrequenz.

Bestimmung der prozentualen Abweichung:

$$
p\%  = \frac{{{f_0}^\*-f_0}}{f_0} = \frac{\textstyle{f_0 \over \sqrt{2}}-f_0}{f_0} = \frac{1}{\sqrt {2} } - 1 =  - 0{,}29
$$

 Die Abnahme beträgt $29\%$.

## Grundwissen
- [Elektromagnetischer Schwingkreis gedämpft](https://www.leifiphysik.de/elektrizitaetslehre/elektromagnetische-schwingungen/grundwissen/elektromagnetischer-schwingkreis-gedaempft)
