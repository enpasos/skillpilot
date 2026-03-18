# Doppelspalt mit Mikrowellen (Abitur BY 1996 GK A2-2)

Quelle: https://www.leifiphysik.de/elektrizitaetslehre/elektromagnetische-wellen/aufgabe/doppelspalt-mit-mikrowellen-abitur-1996-gk-a2-2
Originaldatei: `curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/abi/Physik/input/leifiphysik_abitur/pages/elektrizitaetslehre/elektromagnetische-wellen/aufgabe/doppelspalt-mit-mikrowellen-abitur-1996-gk-a2-2.html`
Schwierigkeitsgrad: mittelschwere Aufgabe

## Aufgabe

![](https://www.leifiphysik.de/sites/default/files/images/0fd4dd9be5d1a3c3dc39e3ff992d8723/462doppelspalt-mit-mikrowellen-abitur-by-1996-gk-a2-2_skizze.gif)

Abb. 1 Skizze zur Aufgabe

[CC-BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/deed.de) / FWU Institut für Film und Bild;

Von einem fest angeordneten Sender MS treffen Mikrowellen senkrecht auf ein Metallblech B mit zwei vertikalen Schlitzen, die den Mittenabstand $b=20\,\rm{cm}$ haben. Der Empfänger ME hinter dem Doppelspalt ist längs eines Halbkreises verschiebbar (siehe Abb. 1).

Beim Verschieben von ME werden unter den Winkeln $\alpha_0 = 0^\circ $ und $\alpha_1 = 12^\circ$ aufeinanderfolgende Maxima des Empfangs festgestellt.

a)

Berechne die Sendefrequenz $f$. (4 BE)

b)

Untersuche, wie viele Maxima insgesamt höchstens auftreten können. (6 BE)

Anstelle von MS wird nun ein Sender verwendet, der ein kontinuierliches Frequenzspektrum von $6{,}5\,\rm{GHz}$ bis $15\,\rm{GHz}$ abstrahlt.

c)

Untersuche, ob sich die Doppelspaltspektren 1. und 2. Ordnung überlappen. (8 BE)

## Lösung

**Hinweis:** Bei dieser Lösung von LEIFIphysik handelt es sich nicht um den amtlichen Lösungsvorschlag des bayr. Kultusministeriums.

a)

Für das 1. Maximum gilt 

$$
 b \cdot \sin \left(\alpha_1\right) = \lambda = \frac{c}{f} \Leftrightarrow f = \frac{c}{b \cdot \sin \left( \alpha_1\right)}
$$

Einsetzen der gegebenen Werte liefert (mit zwei gültigen Ziffern Genauigkeit)

$$
 f = \frac{3{,}0 \cdot 10^8\,\frac{\rm m}{\rm s}}{0{,}20\,\rm m \cdot \sin 12^\circ} = 7{,}2 \cdot 10^9\,\rm Hz 
$$


b)

Da der Sinus eines Winkels stets kleiner oder gleich $1$ ist, kann man $k$ mit Hilfe der allgemeinen Maximumsbedingung bestimmen: 

$$
 b \cdot \sin \left(\alpha_k\right) = k \cdot \lambda \Leftrightarrow \sin \left(\alpha_k\right) = \frac{k \cdot \lambda}{b} \;;\; k \in \mathbb{N} 
$$

 und somit 

$$
 \frac{k \cdot \lambda}{b} = \frac{k \cdot c}{b \cdot f} \le 1 \Leftrightarrow k \le \frac{b \cdot f}{c} \Rightarrow k \le 4{,}8 
$$

 Dies bedeutet, dass $k$ die Werte $0$, $1$, $2$, $3$ und $4$ annehmen kann. Für $k=0$ gibt es nur ein Maximum (auf der Symmetrieachse), für $k=1$, $k=2$ und $k=3$ jeweils zwei Maxima. Somit gibt es insgesamt $9$ Maxima.

c)

Je höher die Frequenz ist, desto kleiner ist bei einer bestimmten Ordnung der Ablenkwinkel.

Überlappung tritt ein, wenn der größtmögliche Winkel bei der 1. Ordnung größer ist als der kleinstmögliche Winkel bei der 2. Ordnung:

Maximum 1. Ordnung für $f_1 = 6{,}5 \cdot 10^9\,\rm{Hz}$: $b \cdot \sin \left( \alpha_1 \right) = \frac{c}{f_1} \Rightarrow \alpha_1 = 13^\circ $

Maximum 2. Ordnung für $f_2 = 15 \cdot 10^9\,\rm{Hz}$: $b \cdot \sin \left( \alpha_2 \right) = \frac{c}{f_2} \Rightarrow \alpha_2 = 12^\circ $

Da $\alpha_2 < \alpha_1$ überlappen sich die Spektren.

## Grundwissen
- [Ausbreitung Elektromagnetischer Wellen](https://www.leifiphysik.de/elektrizitaetslehre/elektromagnetische-wellen/grundwissen/ausbreitung-elektromagnetischer-wellen)
