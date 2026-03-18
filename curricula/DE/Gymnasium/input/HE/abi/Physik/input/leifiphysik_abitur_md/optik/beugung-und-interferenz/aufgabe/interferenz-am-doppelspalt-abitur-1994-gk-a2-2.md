# Interferenz am Doppelspalt (Abitur BY 1994 GK A2-2)

Quelle: https://www.leifiphysik.de/optik/beugung-und-interferenz/aufgabe/interferenz-am-doppelspalt-abitur-1994-gk-a2-2
Originaldatei: `curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/abi/Physik/input/leifiphysik_abitur/pages/optik/beugung-und-interferenz/aufgabe/interferenz-am-doppelspalt-abitur-1994-gk-a2-2.html`
Schwierigkeitsgrad: mittelschwere Aufgabe

## Aufgabe

Monochromatisches Licht der Wellenlänge $\lambda $ trifft senkrecht auf einen Doppelspalt mit dem Spaltabstand $b$. In der Entfernung $a$ ($a \gg b$) vom Doppelspalt ist ein Schirm aufgestellt.

a)

Zeige, dass für den Abstand $d$ je zweier benachbarter Helligkeitsmaxima auf dem Schirm näherungsweise die Beziehung $d = \lambda \cdot \frac{a}{b}$ gilt. (10 BE)

b)

Der Doppelspalt wird nun mit Laserlicht der Wellenlänge ${\lambda_1} = 620\,\rm{nm}$ beleuchtet. Die beiden Maxima 2. Ordnung haben auf dem Schirm einen Abstand von $5{,}20\,\rm{cm}$.

Beleuchtet man dagegen einen Doppelspalt bei gleicher Anordnung mit einem anderen Laser (Wellenlänge ${\lambda _2}$), so haben in diesem Fall die beiden Maxima $2.$ Ordnung auf dem Schirm den Abstand $4{,}70\,\rm{cm}$.

Bestimme ${\lambda_2}$.

Erläutere kurz dein Vorgehen. (8 BE)

## Lösung

**Hinweis:** Bei dieser Lösung von LEIFIphysik handelt es sich nicht um den amtlichen Lösungsvorschlag des bayr. Kultusministeriums.

a)

![](https://www.leifiphysik.de/sites/default/files/2024/01/image/Interferenz_Doppelspalt_allgemeinerWinkel.svg)

[CC-BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/deed.de) / FWU Institut für Film und Bild;

Für die Maxima gilt

$$
\Delta s = k \cdot \lambda 
$$

und für $a \gg b$

$$
 b \cdot \sin \left( {{\alpha _k}} \right) = k \cdot \lambda  \Leftrightarrow \sin \left( {{\alpha _k}} \right) = \frac{{k \cdot \lambda }}{b}  \quad(1) 
$$

Für kleine Winkel kann außerdem der Sinus eines Winkels durch dessen Tangens angenähert werden:

$$
\sin\left( {{\alpha _k}} \right) \approx \tan \left( {{\alpha _k}} \right)
$$

Es gilt (vgl. Zeichnung)

$$
\tan \left( {{\alpha _k}} \right) = \frac{{{d_k}}}{a}
$$

und mit der Kleinwinkelnäherung $\sin\left( {{\alpha _k}} \right) \approx \tan \left( {{\alpha _k}} \right)$ ergibt sich

$$
 \sin \left( {{\alpha _k}} \right) \approx \frac{{{d_k}}}{a} \quad(2) 
$$

Setzt man $(2)$ in $(1)$ ein, so folgt

$$
 b \cdot \frac{{{d_k}}}{a} = k \cdot \lambda  \Leftrightarrow {d_k} = k \cdot \lambda  \cdot \frac{a}{b} \quad(3) 
$$

Für den Abstand $d$ benachbarter Maxima gilt dann

$$
d = {d_{k + 1}} - {d_k} = \left[ {(k + 1) - k} \right] \cdot \lambda  \cdot \frac{a}{b} = \lambda  \cdot \frac{a}{b}
$$


b)

**gegeben:** $ 2 \cdot d_{2, \lambda_1} = 5{,}20\,\rm{cm};\; 2 \cdot d_{2, \lambda_2} = 4{,}70\,\rm{cm} $

**gesucht:** $\lambda_2$

Setzt man in Gleichung $(3)$ von Teilaufgabe **a)** einmal $d_{2, \lambda_1}$ und einmal $d_{2, \lambda_2}$ ein, so erhält man

$$
{d_{2,{\lambda _1}}} = 2 \cdot {\lambda _1} \cdot \frac{a}{b}\;{\rm{bzw.}}\;{d_{2,{\lambda _2}}} = 2 \cdot {\lambda _2} \cdot \frac{a}{b}
$$

Dividiert man das jeweils Doppelte (da oben das Dopppelte von $d_{2, \lambda_1}$ bzw. $d_{2, \lambda_2}$ gegeben ist) der dieser beiden Gleichungen durcheinander, so erhält man

$$
\frac{{2 \cdot {d_{2,{\lambda _2}}}}}{{2 \cdot {d_{2,{\lambda _1}}}}} = \frac{{2 \cdot 2 \cdot {\lambda _2} \cdot \frac{a}{b}}}{{2 \cdot 2 \cdot {\lambda _1} \cdot \frac{a}{b}}} = \frac{{{\lambda _2}}}{{{\lambda _1}}} \Leftrightarrow {\lambda _2} = {\lambda _1} \cdot \frac{{2 \cdot {d_{2,{\lambda _2}}}}}{{2 \cdot {d_{2,{\lambda _1}}}}}
$$

Einsetzen der gegebenen Werte liefert (mit drei gültigen Ziffern Genauigkeit)

$$
\lambda_2 = 620\,\rm{nm} \cdot \frac{{4{,}70\,\rm{cm}}}{{5{,}20\,\rm{cm}}} = 560\,\rm{nm}
$$


## Grundwissen
- [Doppelspalt](https://www.leifiphysik.de/optik/beugung-und-interferenz/grundwissen/doppelspalt)
