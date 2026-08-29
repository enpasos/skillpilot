# Lösung: Kreisbewegung, periodische Modellierung und trigonometrische Ableitungen verknüpfen

1. Ein Punkt des Einheitskreises hat beim Winkel $\varphi$ die Koordinaten
$$
P(\varphi)=(\cos\varphi,\sin\varphi).
$$
Der Kosinus ist daher die waagerechte, der Sinus die senkrechte Projektion des Radiusvektors. Beide Funktionen haben Amplitude $1$ und Periode $2\pi$. Im Intervall $[0,2\pi]$ hat der Sinus die Nullstellen $0$, $\pi$ und $2\pi$, der Kosinus die Nullstellen $\frac{\pi}{2}$ und $\frac{3\pi}{2}$. Die Skizzen müssen außerdem die korrekte Phasenlage zeigen. (2 BE für den Kreis-Koordinaten-Zusammenhang, 2 BE für beide korrekten Skizzen, 1 BE für Amplituden und Nullstellen)

2. Mit $\sin(x+u)=\sin x\cos u+\cos x\sin u$ erhält man
$$
\frac{\sin(x+u)-\sin x}{u}
=\sin x\frac{\cos u-1}{u}+\cos x\frac{\sin u}{u}
\longrightarrow \cos x.
$$
Mit $\cos(x+u)=\cos x\cos u-\sin x\sin u$ folgt
$$
\frac{\cos(x+u)-\cos x}{u}
=\cos x\frac{\cos u-1}{u}-\sin x\frac{\sin u}{u}
\longrightarrow-\sin x.
$$
Das Minuszeichen stammt aus dem Term $-\sin x\sin u$ im Additionstheorem des Kosinus. Der Grenzwert $\sin u/u=1$ gilt in dieser Form nur im Bogenmaß; bei Gradmaß entstünde der zusätzliche Faktor $\pi/180$. (je 2 BE für die beiden Herleitungen, je 1 BE für Minuszeichen und Rolle des Bogenmaßes)

3. Aus Minimum $2\,\mathrm m$ und Maximum $22\,\mathrm m$ folgen Mittellinie $12\,\mathrm m$ und Amplitude $10\,\mathrm m$. Eine Umdrehung dauert $40\,\mathrm s$, also ist
$$
\omega=\frac{2\pi}{40}=\frac{\pi}{20}.
$$
Da die Gondel bei $t=0$ im Tiefpunkt startet, passt
$$
h(t)=12-10\cos\left(\frac{\pi}{20}t\right).
$$
Äquivalente Sinusdarstellungen sind ebenfalls richtig. Die $12$ beschreibt die Höhe der Radachse, $10$ den Radius und $40\,\mathrm s$ die Umlaufdauer. Mögliche Modellannahmen sind eine annähernd konstante Winkelgeschwindigkeit, ein fester Radius und eine konstante Höhe der Radachse sowie ein stabiler Bewegungsablauf während der betrachteten Umdrehung. Für die Kontrollmessung gilt
$$
h(12)=12-10\cos\left(\frac{3\pi}{5}\right)\approx15{,}09\,\mathrm m,
$$
also stimmt das Modell bis auf die Messrundung mit $15{,}1\,\mathrm m$ überein. Eine konkrete Grenze ist beispielsweise, dass Anfahr-, Brems- oder Geschwindigkeitsschwankungen und Messfehler nicht erfasst werden; außerhalb eines stabilen Umlaufs ist die Prognose daher nur eingeschränkt verlässlich. (3 BE für datenbasierte Parameter und Modellterm, 1 BE für die Kontextdeutung, 1 BE für mindestens zwei begründete Annahmen, 1 BE für die unabhängige Prüfung, 1 BE für eine konkrete Modellgrenze)

4. Für
$$
h(t)=12-10\cos\left(\frac{\pi}{20}t\right)
$$
ist
$$
h'(t)=\frac{\pi}{2}\sin\left(\frac{\pi}{20}t\right).
$$
Auf $0<t<20$ ist $h'(t)>0$, also steigt die Gondel; auf $20<t<40$ ist $h'(t)<0$, also fällt sie. Bei $t=20$ liegt das Maximum mit $h(20)=22\,\mathrm m$. Bei $t=0$ und $t=40$ liegen die periodisch aufeinanderfolgenden Minima mit $h=2\,\mathrm m$. Das stimmt mit den Messwerten überein. (2 BE für $h'$, 2 BE für Vorzeichen und Monotonie, 1 BE für Extremstellen und Höhen, 1 BE für den Datenabgleich)

## Bewertungsraster

| Teil | BE | Kriterium |
| --- | ---: | --- |
| `e_trig_deep_1` | 5 | Kreis-Koordinaten-Zusammenhang, Sinus- und Kosinusgraphen, Amplituden und Nullstellen korrekt erklärt beziehungsweise dargestellt |
| `e_trig_deep_2` | 6 | Beide trigonometrischen Ableitungsregeln im Bogenmaß hergeleitet sowie Minuszeichen und Rolle des Bogenmaßes begründet |
| `e_trig_deep_3` | 7 | Periodisches Modell aus Messdaten entwickelt, Parameter gedeutet, Annahmen begründet, unabhängig geprüft und eine Modellgrenze benannt |
| `e_trig_deep_4` | 6 | Modell abgeleitet, Monotonie und Extremstellen untersucht und die Ergebnisse mit den Messdaten abgeglichen |

Maximal: 24 BE. Bestehensgrenze: 12 BE.
