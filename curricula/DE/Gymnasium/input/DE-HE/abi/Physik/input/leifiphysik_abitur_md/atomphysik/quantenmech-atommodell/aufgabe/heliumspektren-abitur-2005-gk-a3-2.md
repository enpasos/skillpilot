# Heliumspektren (Abitur BY 2005 GK A3-2)

Quelle: https://www.leifiphysik.de/atomphysik/quantenmech-atommodell/aufgabe/heliumspektren-abitur-2005-gk-a3-2
Originaldatei: `curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/abi/Physik/input/leifiphysik_abitur/pages/atomphysik/quantenmech-atommodell/aufgabe/heliumspektren-abitur-2005-gk-a3-2.html`
Schwierigkeitsgrad: mittelschwere Aufgabe

## Aufgabe

Das Edelgas Helium wurde 1868 durch seine FRAUNHOFER-Linien im Sonnenspektrum entdeckt und erst 1895 in Erdgasquellen auf der Erde gefunden.

a)

Zum Spektrum von atomarem Helium ($\rm{He}$) gehört u.a. eine Linie mit der Wellenlänge $588\,\rm{nm}$.

Berechne die zugehörige Photonenenergie. (3 BE)

Daneben lassen sich aber auch Linien nachweisen, die von einfach ionisiertem Helium ($\rm{He}^+$-Ionen) stammen. $\rm{He}^+$ ist wie das $\rm{H}$-Atom ein Einelektronensystem. Der Wert der Bindungsenergie des Elektrons auf der $n$-ten Energiestufe berechnet sich durch

$$
E_n = - \frac{Z^2 \cdot R \cdot h \cdot c}{n^2}
$$

Hierbei ist $R$ die RYDBERG-Konstante und $Z$ die Ordnungszahl. Gehe zunächst davon aus, dass die RYDBERG-Konstante des Wasserstoffatoms und des $\rm{He}^+$-Ions gleich groß sind.

b)

Berechne die Ionisierungsenergie von $\rm{He}^+$, das sich im Grundzustand befindet. [zur Kontrolle: $54{,}4\,\rm{eV}$] (4 BE)

c)

Zeige, dass die 2., 4. und 6. Energiestufe des $\rm{He}^+$-Ions mit den ersten drei Stufen des $\rm{H}$-Atoms übereinstimmen. (6 BE)

d)

Die $\rm{H}_\alpha$-Linie hat die größte Wellenlänge in der BALMER-Serie des Wasserstoffatoms.

Gib an, welcher Übergang im $\rm{He}^+$-Ion zur Emission einer Strahlung mit dieser Wellenlänge führt.

Begründe deine Entscheidung. (4 BE)

e)

Tatsächlich ist die RYDBERG-Konstante des $\rm{He}^+$-Ions geringfügig größer als die des $\rm{H}$-Atoms.

Erläutere, was daraus für die Wellenlänge der $\rm{He}^+$-Linie aus Teilaufgabe **d)** im Vergleich zur $\rm{H}_\alpha$-Linie folgt. (4 BE)

## Lösung

**Hinweis:** Bei dieser Lösung von LEIFIphysik handelt es sich nicht um den amtlichen Lösungsvorschlag des bayr. Kultusministeriums.

a)


$$
{E_{{\rm{Ph}}}} = \frac{{h \cdot c}}{\lambda } \Rightarrow {E_{{\rm{Ph}}}} = \frac{{4{,}14 \cdot {{10}^{ - 15}}\,{\rm{eV}} \cdot {\rm{s}} \cdot 3{,}00 \cdot {{10}^8}\,\frac{{\rm{m}}}{{\rm{s}}}}}{{588 \cdot {{10}^{ - 9}}\,{\rm{m}}}} = 2{,}11\,{\rm{eV}}
$$


b)

Die Ionisierungsenergie bekommt man aus der Differenz der Energie im freien Zustand ($n = \infty $) und der Energie im Grundzustand ($n = 1$):

$$
{E_{{\rm{Ion}}}} = {E_\infty } - {E_1} = {2^2} \cdot R \cdot h \cdot c \cdot \left[ {\left( { - \frac{1}{{{\infty ^2}}}} \right) - \left( { - \frac{1}{{{1^2}}}} \right)} \right] = {2^2} \cdot R \cdot h \cdot c
$$

Einsetzen der gegebenen Werte liefert

$$
{E_{{\rm{Ion}}}} = {2^2} \cdot 1{,}10 \cdot {10^7}\,\frac{{\rm{1}}}{{\rm{m}}} \cdot 4{,}14 \cdot {10^{ - 15}}\,{\rm{eV}} \cdot {\rm{s}} \cdot 3{,}00 \cdot {10^8}\,\frac{{\rm{m}}}{{\rm{s}}} = 54{,}4\,{\rm{eV}}
$$


c)

![](https://www.leifiphysik.de/sites/default/files/images/b56f530e3143ae3a3d2b95b3b5f08601/330Heliumspektren_Bild.gif)

**Abb. 1** Termschema Helium

[CC-BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/deed.de) / FWU Institut für Film und Bild;

Für Wasserstoff gilt $E_{n,\rm{H}} = -\frac{R\cdot h \cdot c}{n^2}$ ; für He+ gilt $E_{n,\rm{He^+}} = -\frac{4\cdot R\cdot h \cdot c}{n^2}$. Damit ergibt sich folgende Tabelle:

| **Stufe für H** | **Stufe für He+** | **Energie** |
| --- | --- | --- |
| 1. | 2. | $-R \cdot h \cdot c$ |
| 2. | 4. | $-\frac{1}{4} \cdot R \cdot h \cdot c$ |
| 3. | 6. | $-\frac{1}{9} \cdot R \cdot h \cdot c$ |

d)

Die BALMER-Linie mit der größten Wellenlänge (Hα -Linie) ist diejenige mit dem kleinsten $\Delta E$, d.h. der Übergang von 3 nach 2.

$$
\frac{1}{\lambda } = R \cdot \left( {\frac{1}{{{2^2}}} - \frac{1}{{{3^2}}}} \right)
$$

Beim He+ kommt es zu dieser Wellenlänge, wenn der Übergang von 6 nach 4 erfolgt:

$$
\begin{eqnarray}\frac{1}{\lambda } &=& 4 \cdot R \cdot \left( {\frac{1}{{{4^2}}} - \frac{1}{{{6^2}}}} \right)\\ &=& R \cdot \left( {\frac{4}{{{4^2}}} - \frac{4}{{{6^2}}}} \right)\\ &=& R \cdot \left( {\frac{1}{{{2^2}}} - \frac{1}{{{3^2}}}} \right)\end{eqnarray}
$$


e)

Aus den Formeln von Teilaufgabe **d)** sieht man, dass $\lambda \sim \frac{1}{R}$ gilt. Wenn nun $R_{\rm{He^+}}$ etwas größer ist als $R_{\rm{H}}$, so bedeutet dies, dass die He+- Linie eine geringfügig kleinere Wellenlänge hat als die Hα -Linie.

## Grundwissen
- [Energiezustände von Wasserstoff und verwandten Atomen](https://www.leifiphysik.de/atomphysik/atomarer-energieaustausch/grundwissen/energiezustaende-von-wasserstoff-und-verwandten-atomen)
