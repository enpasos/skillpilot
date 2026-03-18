# Sperrkreis (Abitur BY 2003 LK A2-1)

Quelle: https://www.leifiphysik.de/elektrizitaetslehre/wechselstromtechnik/aufgabe/sperrkreis-abitur-2003-lk-a2-1
Originaldatei: `curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/abi/Physik/input/leifiphysik_abitur/pages/elektrizitaetslehre/wechselstromtechnik/aufgabe/sperrkreis-abitur-2003-lk-a2-1.html`
Schwierigkeitsgrad: mittelschwere Aufgabe

## Aufgabe

![](https://www.leifiphysik.de/sites/default/files/images/42bbe41882e13a4f8e0a0680d0dd7d35/227sperrkreis-abitur-by-2003-lk-a2-1_skizze.gif)

Abb. 1 Schaltskizze eines Sperrkreises

[CC-BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/deed.de) / FWU Institut für Film und Bild;

Eine ideale Spule mit der Induktivität $L_0$ und ein Kondensator mit der Kapazität $C$ sind parallel geschaltet und an einen Sinusgenerator mit der Effektivspannung $U_{\rm{eff}}= 200\,\rm{V}$ und der Frequenz $f = 50\,\rm{Hz}$ angeschlossen. Der OHMsche Widerstand des gesamten Kreises sei vernachlässigbar klein.

a)

Zeige allgemein: Sind die Effektivstromstärken in der Spule und im Kondensator gleich groß, schwingt der Kreis mit seiner Eigenfrequenz. (6 BE)

b)

Die Messgeräte für $I_L$ und $I_C$ zeigen jeweils die Effektivstromstärke $0{,020\,\rm{A}$.

Berechne die Induktivität $L_0$ und die Kapazität $C$.

Bestimme mit kurzer Begründung die Stromstärke $I_{\rm{G}}$ in der Zuleitung. (8 BE)

c)

In die Spule wird nun ein Eisenkern geschoben.

Erläutere, wie sich dadurch die Stromstärken in den Messgeräten und die Eigenfrequenz $f_0$ des Schwingkreises ändern. (6 BE)

## Lösung

**Hinweis:** Bei dieser Lösung von LEIFIphysik handelt es sich nicht um den amtlichen Lösungsvorschlag des bayr. Kultusministeriums.

a)

Da es sich um eine Parallelschaltung von Spule und Kondensator handelt, gilt

$$
{U_{{\rm{eff}}{\rm{,}}\;L}} = {U_{{\rm{eff}}{\rm{,}}\;C}}
$$

Zusätzlich mit der Bedingung ${I_{{\rm{eff}}{\rm{,}}\;L}} = {I_{{\rm{eff}}{\rm{,}}\;C}}$ ergibt sich dann durch Division der beiden Gleichungen

$$
\frac{{{U_{{\rm{eff}}{\rm{,}}\;L}}}}{{{I_{{\rm{eff}}{\rm{,}}\;L}}}} = \frac{{{U_{{\rm{eff}}{\rm{,}}\;C}}}}{{{I_{{\rm{eff}}{\rm{,}}\;C}}}} \Leftrightarrow \omega  \cdot L = \frac{1}{{\omega  \cdot C}} \Leftrightarrow \omega  = \frac{1}{{\sqrt {L \cdot C} }} \Rightarrow f = \frac{1}{{2 \cdot \pi  \cdot \sqrt {L \cdot C} }}
$$

Dies ist aber genau die Formel für die Eigenfrequenz des Schwingkreises.

b)

Es ergibt sich

$$
\frac{{{U_{{\rm{eff}}{\rm{,}}\;L}}}}{{{I_{{\rm{eff}}{\rm{,}}\;L}}}} = \omega  \cdot {L_0} = 2 \cdot \pi  \cdot f \cdot {L_0} \Leftrightarrow {L_0} = \frac{{{U_{{\rm{eff}}{\rm{,}}\;L}}}}{{2 \cdot \pi  \cdot f \cdot {I_{{\rm{eff}}{\rm{,}}\;L}}}} \Rightarrow {L_0} = \frac{{200{\rm{V}}}}{{2 \cdot \pi  \cdot 50{\rm{Hz}} \cdot 0,20{\rm{A}}}} = 3,2{\rm{H}}
$$

und

$$
\frac{{{U_{{\rm{eff}}{\rm{,}}\;C}}}}{{{I_{{\rm{eff}}{\rm{,}}\;C}}}} = \frac{1}{{\omega  \cdot C}} = \frac{1}{{2 \cdot \pi  \cdot f \cdot C}} \Leftrightarrow C = \frac{{{I_{{\rm{eff}}{\rm{,}}\;C}}}}{{2 \cdot \pi  \cdot f \cdot {U_{{\rm{eff}}{\rm{,}}\;C}}}} \Rightarrow C = \frac{{0,20{\rm{A}}}}{{2 \cdot \pi  \cdot 50{\rm{Hz}} \cdot 200{\rm{V}}}} = 3,2{\rm{\mu F}}
$$

Da ${I_L}$ und ${I_C}$ gegenphasig und betraglich gleich groß sind, ist ihre Summe ${I_{\rm{G}}} = 0$.

c)

Bei Einschieben des Eisenkerns wird $L$ größer und damit ${X_L}$ größer und ${{I_{{\rm{eff}}{\rm{,}}\;L}}}$ kleiner. Im Kondensatorzweig ändert sich nichts. Dadurch überwiegt der Strom im Kondensatorzweig und ${I_{\rm{G}}}$ wird größer und gleichphasig zum Kondensatorzweig. Die Eigenfrequenz wird (siehe Formel) geringer.

## Grundwissen
- [Wechselstromwiderstände](https://www.leifiphysik.de/elektrizitaetslehre/wechselstromtechnik/grundwissen/wechselstromwiderstaende)
