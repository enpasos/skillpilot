# Öl auf Pfütze (Abitur BY 2005 LK A2-3)

Quelle: https://www.leifiphysik.de/optik/beugung-und-interferenz/aufgabe/oel-auf-pfuetze-abitur-2005-lk-a2-3
Originaldatei: `curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/abi/Physik/input/leifiphysik_abitur/pages/optik/beugung-und-interferenz/aufgabe/oel-auf-pfuetze-abitur-2005-lk-a2-3.html`
Schwierigkeitsgrad: mittelschwere Aufgabe

## Aufgabe

![](https://www.leifiphysik.de/sites/default/files/2020/04/image/Oel_auf_Pfuetze_Bild.svg)

Abb. 1 Skizze zur Aufgabe

[CC-BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/deed.de) / FWU Institut für Film und Bild;

Joachim Herz Stiftung

Dünne Ölschichten auf Wasser schimmern bei Tageslicht in verschiedenen Farben. Zur Erklärung wird Licht betrachtet, das unter dem Winkel der Weite $\alpha $ auf eine Ölschicht der Dicke $d$ fällt.

a)

Erläutere mit Hilfe von Abb. 1 das Zustandekommen der Interferenz bei Reflexion.

Gib den optischen Gangunterschied $\Delta s$ der parallelen Strahlen 1 und 2 mit den Bezeichnungen aus der Zeichnung an. Verwende dabei, dass Wasser optisch dichter ist als Öl und dass die optische Weglänge gleich dem Produkt aus geometrischer Weglänge und der Brechzahl ist. (5 BE)

Die mathematische Auswertung des in Teilaufgabe a) verlangten Ansatzes liefert $\Delta s = 2 \cdot d \cdot \sqrt{n^2 - (\sin{\alpha})^2}$ (Herleitung nicht erforderlich).

b)

Erkläre, weshalb die Ölschicht bei Tageslicht farbig schimmert. (5 BE)

c)

Auf einer Wasserpfütze hat sich Öl mit der Brechzahl $n = 1{,}20$ in einer $560\,\rm{nm}$ dicken Schicht ausgebreitet.

Berechne, für welche Einfallswinkel grünes Licht der Wellenlänge $510\,\rm{nm}$ unterdrückt wird. (9 BE)

## Lösung

**Hinweis:** Bei dieser Lösung von LEIFIphysik handelt es sich nicht um den amtlichen Lösungsvorschlag des bayr. Kultusministeriums.

a)

Da beide Strahlen am optisch dichteren Medium reflektiert werden, egalisieren sich die beiden dabei auftretenden Phasensprünge. Der Gangunterschied $\Delta s$ der beiden Strahlen 1 und 2 ergibt sich bei einer Brechzahl $n_{\rm{Luft}}=1$ und einer Brechzahl von $n_{\rm{Öl}} > 1$ aus

$$
\Delta s = n_{\rm{Öl}} \cdot \left( {\left| {\overline {AB} } \right| + \left| {\overline {BC} } \right|} \right) -n_{\rm{Luft}} \cdot \left| {\overline {AD} } \right|
$$


b)

Auf die Ölschicht trifft weißes Tageslicht (Licht in dem alle "sichtbaren Frequenzen" vorkommen). Durch die Interferenz an der Ölschicht kommt es – abhängig vom Winkel $\alpha$ - für bestimmte Frequenzen zu destruktiver Interferenz, d.h. diese Frequenzen fehlen im reflektierten Licht, so dass sich in Reflexion nicht mehr weißes Licht ergibt.

c)

Die Bedingung für destruktive Interferenz lautet

$$
\Delta s = (2 \cdot k - 1) \cdot \frac{\lambda }{2}\;;\;k \in \mathbb{\{1; 2; 3; ...\}}
$$

Damit berechnen sich die Winkelweiten, bei denen grünes Licht unterdrückt wird, durch

$$
2 \cdot d \cdot \sqrt{{{n^2} - \left(\sin {\alpha _k} \right)}^2}=\left( {2 \cdot k - 1} \right) \cdot \frac{\lambda }{2}
$$

$$
 \Rightarrow {n^2} - {{\left(\sin {{\alpha _k}} \right)}^2}=\frac{{{{\left( {2 \cdot k - 1} \right)}^2}}}{{4 \cdot {d^2}}} \cdot \frac{{{\lambda ^2}}}{4} 
$$

$$
{\Rightarrow \sin \left( {{\alpha _k}} \right) = \sqrt {{n^2} - \frac{{{{\left( {2 \cdot k - 1} \right)}^2} \cdot {\lambda ^2}}}{{16 \cdot {d^2}}}} }
$$


Für $k = 1$ gilt

$$
\sin \left( {{\alpha _1}} \right) = \sqrt {{{1{,}20}^2} - \frac{{{{(2 \cdot 1 - 1)}^2} \cdot {{(510 \cdot {{10}^{ - 9}}\,\rm{m})}^2}}}{{16 \cdot {{(560 \cdot {{10}^{ - 9}}\,\rm{m})}^2}}}}=1{,}13
$$

Da also ${\sin \left( {{\alpha _1}} \right)} > 1$ ist keine Auslöschung möglich.

Für $k = 2$ gilt

$$
\sin \left( {{\alpha _2}} \right)= \sqrt {{{1{,}20}^2} - \frac{{{{(2 \cdot 2 - 1)}^2} \cdot {{(510 \cdot {{10}^{ - 9}}\,\rm{m})}^2}}}{{16 \cdot {{(560 \cdot {{10}^{ - 9}}\,\rm{m})}^2}}}}  = 0{,}987 \Rightarrow {\alpha _2} = 80{,}6^\circ 
$$

Für $k = 3$ gilt

$$
\sin \left( {{\alpha _3}} \right) = \sqrt {{{1{,}20}^2} - \frac{{{{(2 \cdot 3 - 1)}^2} \cdot {{(510 \cdot {{10}^{ - 9}}\,\rm{m})}^2}}}{{16 \cdot {{(560 \cdot {{10}^{ - 9}}\,\rm{m})}^2}}}}  = 0{,}380 \Rightarrow {\alpha _3} = 22{,}3^\circ 
$$


Für $k = 4$ wird der Radikand negativ.

## Grundwissen
- [Interferenz an dünnen Schichten](https://www.leifiphysik.de/optik/beugung-und-interferenz/grundwissen/interferenz-duennen-schichten)
