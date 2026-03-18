# Ungedämpfter Schwingkreis (Abitur BY 2000 GK A2-1)

Quelle: https://www.leifiphysik.de/elektrizitaetslehre/elektromagnetische-schwingungen/aufgabe/ungedaempfter-schwingkreis-abitur-2000-gk-a2-1
Originaldatei: `curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/abi/Physik/input/leifiphysik_abitur/pages/elektrizitaetslehre/elektromagnetische-schwingungen/aufgabe/ungedaempfter-schwingkreis-abitur-2000-gk-a2-1.html`
Schwierigkeitsgrad: leichte Aufgabe

## Aufgabe

Ein Kondensator mit der Kapazität $C$ und eine Spule mit der Induktivität $L$ bilden einen elektromagnetischen Schwingkreis, der ungedämpft mit der Eigenfrequenz $f_0$ schwingt. Die Kapazität des Kondensators beträgt $C = 22\,\rm{nF}$. Bei der Spule handelt es sich um eine lang gestreckte Spule mit der Querschnittsfläche $A = 31\,\rm{cm}^2$, der Länge $l = 30\,\rm{cm}$ und der Windungszahl $N = 20000$.

a)

Berechne die Induktivität der Spule. [zur Kontrolle: $L = 5{,}2\,\rm{H}$] (3 BE)

b)

Untersuche, ob sich mit den gegebenen Bauteilen ein Schwingkreis aufbauen lässt, dessen Eigenfrequenz höchstens um $10\%$ von $500\,\rm{Hz}$ abweichen soll. (4 BE)

c)

Berechne den Maximalwert $I_{\rm{max}}$ der Stromstärke in diesem Schwingkreis, wenn der Maximalwert der Spannung $U_{\rm{max}} = 3{,}8\,\rm{V}$ beträgt. (8 BE)

## Lösung

**Hinweis:** Bei dieser Lösung von LEIFIphysik handelt es sich nicht um den amtlichen Lösungsvorschlag des bayr. Kultusministeriums.

a)

Für die Induktivität der langestreckten Zylinderspule gilt

$$
L = \mu_0 \cdot N^2 \cdot \frac{A}{l} \Rightarrow L = 4\,\pi  \cdot 10^{-7}\,\frac{\rm{V\,s}}{\rm{A\,m}} \cdot 20000^2 \cdot \frac{31 \cdot 10^{-4}\,\rm{m}^2}{0{,}30\,\rm{m}} = 5{,}2\,\rm{H}
$$


b)

Nach der THOMSON-Formel beträgt die Eigenfrequenz des Schwingkreises

$$
{f_0} = \frac{1}{{2 \cdot \pi }} \cdot \frac{1}{{\sqrt {L \cdot C} }} \Rightarrow {f_0} = \frac{1}{{2 \cdot \pi }} \cdot \frac{1}{{\sqrt {5{,}2\,\frac{{\rm{V}\,\rm{s}}}{\rm{A}} \cdot 22 \cdot {{10}^{ - 9}}\,\frac{{\rm{A}\,\rm{s}}}{\rm{V}}} }} = 4{,}7 \cdot {10^2}\,{\rm{Hz}}
$$

Der vorgegebene Toleranzbereich ist $\left] {\;450\,{\rm{Hz}}\;;\;550\,{\rm{Hz}}\;} \right[$, also liegt die berechnete Frequenz im tolerierten Bereich.

c)

Da der Kreis als ungedämpft angenommen werden kann, wandelt sich die elektrische Energie des Kondensators verlustlos in die magnetische Energie der Spule um:

$$
E_{\rm{mag,max}} = E_{\rm{el,max}} \Leftrightarrow \frac{1}{2} \cdot L \cdot I_{\rm{max}}^2 = \frac{1}{2} \cdot C \cdot U_{\rm{max}}^2 \Rightarrow {I_{\rm{max}}} = {U_{\rm{max}}} \cdot \sqrt {\frac{C}{L}}  \Rightarrow {I_{\rm{max}}} = 3{,}8\,{\rm{V}} \cdot \sqrt {\frac{22 \cdot 10^{-9}\,\frac{\rm{A\,s}}{\rm{V}}}{{5{,}2\,\frac{\rm{V\,s}}{\rm{A}}}}} = 0{,}25 \cdot 10^{-3}\,{\rm{A}}
$$


## Grundwissen
- [Elektromagnetischer Schwingkreis ungedämpft](https://www.leifiphysik.de/elektrizitaetslehre/elektromagnetische-schwingungen/grundwissen/elektromagnetischer-schwingkreis-ungedaempft)
