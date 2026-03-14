# Wechselstromwiderstand einer realen Spule (Abitur BY 2009 LK A2-1)

Quelle: https://www.leifiphysik.de/elektrizitaetslehre/wechselstromtechnik/aufgabe/wechselstromwiderstand-einer-realen-spule-abitur-2009-lk-a2-1
Originaldatei: `curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/abi/Physik/input/leifiphysik_abitur/pages/elektrizitaetslehre/wechselstromtechnik/aufgabe/wechselstromwiderstand-einer-realen-spule-abitur-2009-lk-a2-1.html`
Schwierigkeitsgrad: mittelschwere Aufgabe

## Aufgabe

![](https://www.leifiphysik.de/sites/default/files/images/ac5b39d2c26cc3e76eeda1c9bc7bde33/396wechselstromwiderstand-einer-realen-spule-abitur-by-2009-lk-2-1_skizze.gif)

Abb. 1 Schaltskizze einer realen Spule

[CC-BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/deed.de) / FWU Institut für Film und Bild;

Um die Frequenzabhängigkeit des Widerstands einer realen Spule bei sinusförmiger Wechselspannung zu untersuchen, betrachtet man die reale Spule als Serienschaltung eines rein OHMschen Widerstandes $R = 12\,\Omega $ und einer idealen Spule der Induktivität $L = 36\,\rm{mH}$. Für den Wechselstromwiderstand $X$ einer realen Spule gilt $X = \sqrt {{R^2} + {{\left( {2 \cdot \pi  \cdot f \cdot L} \right)}^2}} $ (Herleitung nicht erforderlich).

a)

Berechne den Wechselstromwiderstand $X$ der realen Spule für die Frequenzen $0\,{\rm{Hz}}$, $20\,{\rm{Hz}}$, $40\,{\rm{Hz}}$, $60\,{\rm{Hz}}$, $80\,{\rm{Hz}}$ und $100\,{\rm{Hz}}$.

Fertige mit Hilfe dieser Werte ein $f$-$X$-Diagramm für den Bereich $0 \le f \le 100\,{\rm{Hz}}$ an. (6 BE)

b)

Trage in das Diagramm von Teilaufgabe a) auch den Graphen für den rein induktiven Widerstand $X_L$ der Spule in Abhängigkeit von $f$ ein.

Berechne, ab welcher Frequenz der Wechselstromwiderstand $X$ vom induktiven Widerstand $X_L$ um weniger als $1\% $ abweicht. (8 BE)

c)

Nun schaltet man die reale Spule mit einem Kondensator in Reihe, legt eine Wechselspannung variabler Frequenz $f$ an und misst die Stromstärke $I$.

Entscheide, welche der folgenden Diagramme könnten mit dieser Versuchsanordnung aufgezeichnet worden sein.

Begründe deine Entscheidung an Hand des Wechselstromverhaltens der verwendeten Bauteile. (6 BE)

![](https://www.leifiphysik.de/sites/default/files/images/e8145e773b810aa3224673c323c87b8b/729wechselstromwiderstand-einer-realen-spule-abitur-by-2009-lk-2-1_diagramm1.gif)

Abb. 2 Mögliche $f$-$I$-Diagramme

[CC-BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/deed.de) / FWU Institut für Film und Bild;

## Lösung

**Hinweis:** Bei dieser Lösung von LEIFIphysik handelt es sich nicht um den amtlichen Lösungsvorschlag des bayr. Kultusministeriums.

a)

Man erhält folgende Tabelle:

Tab. 1 $f$-$X$-Tabelle

|  |  |  |  |  |  |  |
| --- | --- | --- | --- | --- | --- | --- |
| $f\;{\rm{in}}\;{\rm{Hz}}$ | $0$ | $20$ | $40$ | $60$ | $80$ | $100$ |
| $X\;{\rm{in}}\;{\rm{\Omega }}$ | $12$ | $13$ | $15$ | $18$ | $22$ | $26$ |

![](https://www.leifiphysik.de/sites/default/files/images/15b44957a0615e1f29a620aa48ed77d0/458wechselstromwiderstand-einer-realen-spule-abitur-by-2009-lk-2-1_diagramm2.gif)

Abb. 3 $f$-$X$-Diagramm

[CC-BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/deed.de) / FWU Institut für Film und Bild;

Man erhält das Diagramm in Abb. 3.

b)

Der Graph des rein induktiven Widerstands ist eine Ursprungsgerade (z.B. durch $\left( {80{\rm{Hz}}|18\Omega } \right)$).

Berechnung des Frequenzbereichs, in dem $\frac{{X - {X_L}}}{{{X_L}}} < 0,01$ist:

$$
{\frac{{X - {X_L}}}{{{X_L}}} < 0,01 \Leftrightarrow X - {X_L} < 0,01 \cdot {X_L} \Leftrightarrow X < 1,01 \cdot {X_L} \Rightarrow {X^2} < {{\left( {1,01 \cdot {X_L}} \right)}^2} = {{1,01}^2} \cdot {X_L}^2}
$$

Einsetzen der bekannten Terme für $X$ und $X_L$ liefert dann

$$
{{R^2} + {{\left( {2 \cdot \pi \cdot f \cdot L} \right)}^2} < {{1,01}^2} \cdot {{\left( {2 \cdot \pi \cdot f \cdot L} \right)}^2} \Leftrightarrow {R^2} < \underbrace {\left( {{{1,01}^2} - 1} \right)}_{0,0201} \cdot {{\left( {2 \cdot \pi  \cdot f \cdot L} \right)}^2} \Rightarrow R < 0,142 \cdot 2 \cdot \pi  \cdot f \cdot L}
$$

Auflösen nach $f$ ergibt schließlich

$$
{f > \frac{R}{{0,284 \cdot \pi  \cdot L}}}
$$

Einsetzen der gegebenen Werte liefert

$$
f > \frac{{12\frac{{\rm{V}}}{{\rm{A}}}}}{{0,284 \cdot \pi  \cdot 36 \cdot {{10}^{ - 3}}\frac{{{\rm{V}} \cdot {\rm{s}}}}{{\rm{A}}}}} = 0{,}37\,{\rm{kHz}}
$$


c)

Für sehr niedere Frequenzen „sperrt“ in dieser Serienschaltung aus Spule und Kondensator der Kondensator, d.h. der Gesamtstrom muss sehr klein ausfallen. Daher scheiden die Diagramme 3 und 4 aus.

Für sehr hohe Frequenzen „sperrt“ die Spule, d.h. der Gesamtstrom muss sehr klein ausfallen. Daher scheidet das Diagramm1 aus.

Nur Diagramm 2 ist möglich, es zeigt den typischen Verlauf einer Serienresonanz.

![](https://www.leifiphysik.de/sites/default/files/images/c6fcac254959fd1c5f44b0eec301106f/729wechselstromwiderstand-einer-realen-spule-abitur-by-2009-lk-2-1_diagramm3.gif)

Abb. 4 Mögliche $f$-$I$-Diagramme mit korrekter Lösung

[CC-BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/deed.de) / FWU Institut für Film und Bild;

## Grundwissen
- [Wechselstromwiderstände](https://www.leifiphysik.de/elektrizitaetslehre/wechselstromtechnik/grundwissen/wechselstromwiderstaende)
