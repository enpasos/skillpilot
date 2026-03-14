# Mars-Roboter (Abitur BY 2005 LK A3-1)

Quelle: https://www.leifiphysik.de/atomphysik/roentgen-strahlung/aufgabe/mars-roboter-abitur-2005-lk-a3-1
Originaldatei: `curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/abi/Physik/input/leifiphysik_abitur/pages/atomphysik/roentgen-strahlung/aufgabe/mars-roboter-abitur-2005-lk-a3-1.html`
Schwierigkeitsgrad: schwere Aufgabe

## Aufgabe

![](https://www.leifiphysik.de/sites/default/files/images/85b141ff6e72c567bd3568fbc1a3e9d7/338Mars-Roboter_Bild_1.gif)

**Abb. 1** Schematischer Aufbau des APXS-Systems

[CC-BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/deed.de) / FWU Institut für Film und Bild;

Der im Januar 2004 auf dem Mars gelandete Roboter "Spirit" ist mit einem APXS-System ausgestattet, das Bodenproben analysieren soll. In einem Gehäuse von der Größe einer Getränkedose befinden sich eine Strahlungsquelle, mit der die Probe zur Emission charakteristischer Röntgenstrahlung angeregt wird, und ein energieauflösender Röntgendetektor. Die Strahlungsquelle emittiert u.a. Röntgenstrahlung der Energie $14,3\rm{keV}$, die zur Anregung von chemischen Elementen mit mittlerer Ordnungszahl dient.

a)

Erklären Sie das Zustandekommen der charakteristischen Röntgenstrahlung beim Beschuss einer Probe mit Photonen hinreichender Energie (Röntgenfluoreszenz). (5 BE)

b)

Bestimmen Sie, welches Element in einer Probe vorliegt, wenn im APXS-Detektor Röntgenquanten der Energie $6,9\rm{keV}$ nachgewiesen werden. **Hinweis:** Gehen Sie davon aus, dass diese Quanten zu einer Kα -Linie gehören. (4 BE)

Ein Teil der von der Strahlungsquelle emittierten Röntgenquanten wird von der Probe durch COMPTON-Effekt zurückgestreut und gelangt in den Detektor.

c)

Erklären Sie den COMPTON-Effekt mit einer Modellvorstellung. (5 BE)

d)

Gehen Sie von einem Streuwinkel von $160^\circ $ aus und berechnen Sie die Energie $E'$ der zurückgestreuten Quanten. (8 BE)

Die $14,3\rm{keV}$-Quanten dringen im Mittel einige Millimeter in das Probenmaterial ein. Die mittlere Reichweite von Röntgenquanten im Probenmaterial nimmt mit abnehmender Energie sehr stark ab.

e)

Begründen Sie, warum die im Inneren der Probe durch Röntgenfluoreszenz an Elementen mit niedriger Ordnungszahl entstehende Strahlung nicht mehr zum Detektor gelangt. (6 BE)

## Lösung

**Hinweis:** Bei dieser Lösung von LEIFIphysik handelt es sich nicht um den amtlichen Lösungsvorschlag des bayr. Kultusministeriums.

a)

Durch Beschuss mit Röntgenphotonen können bei Atomen der Probe innere Elektronen herausgeschlagen werden. Die dadurch entstandenen Lücken auf den inneren Schalen werden durch Elektronen aus höheren Schalen wieder aufgefüllt. Dabei kommt es zur Emission der charakteristischen Strahlung.

b)

Aus

$$
E = \frac{{h \cdot c}}{\lambda }
$$

und

$$
\frac{1}{\lambda } = \frac{3}{4} \cdot R \cdot {\left( {Z - 1} \right)^2}
$$

folgt

$$
E = \frac{3}{4} \cdot R \cdot h \cdot c \cdot {\left( {Z - 1} \right)^2} \Leftrightarrow Z = \sqrt {\frac{{4 \cdot E}}{{3 \cdot R \cdot h \cdot c}}}  + 1
$$

Einsetzen der gegebenen Werte liefert

$$
Z = \sqrt {\frac{{4 \cdot 6,9 \cdot {{10}^3} \cdot 1,60 \cdot {{10}^{ - 19}}{\rm{J}}}}{{3 \cdot 1,10 \cdot {{10}^7}\frac{{\rm{1}}}{{\rm{m}}} \cdot 6,63 \cdot {{10}^{ - 34}}{\rm{Js}} \cdot 3,00 \cdot {{10}^8}\frac{{\rm{m}}}{{\rm{s}}}}}}  + 1 = 26 + 1 = 27
$$

Bei dem in der Probe enthaltenen Element handelt es sich um Kobalt.

c)

![](https://www.leifiphysik.de/sites/default/files/images/74086f21c05c8dba1ade66b4e9e865da/419Mars-Roboter_Bild_2.gif)

**Abb. 2** Vor und nach dem Stoß

[CC-BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/deed.de) / FWU Institut für Film und Bild;

Ein primäres Photon führt mit einem quasifreien, ruhenden Elektron einen elastischen Stoß aus. Nachdem Stoß existiert ein sekundäres, energieärmeres Photon und ein Elektron mit einer gewissen kinetischen Energie.

d)

Berechnung der Wellenlänge des sekundären Quants:

$$
\lambda ' = \lambda  + {\lambda _{\rm{C}}} \cdot \left( {1 - \cos \left( \vartheta  \right)} \right) = \frac{{h \cdot c}}{E} + \frac{h}{{{m_{0,{\rm{e}}}} \cdot c}} \cdot \left( {1 - \cos \left( \vartheta  \right)} \right)
$$

Einsetzen der gegebenen Werte liefert

$$
\lambda ' = \frac{{6,63 \cdot {{10}^{ - 34}}{\rm{Js}} \cdot 3,00 \cdot {{10}^8}\frac{{\rm{m}}}{{\rm{s}}}}}{{14,3 \cdot {{10}^3} \cdot 1,60 \cdot {{10}^{ - 19}}{\rm{J}}}} + \frac{{6,63 \cdot {{10}^{ - 34}}{\rm{Js}}}}{{9,11 \cdot {{10}^{ - 31}}{\rm{kg}} \cdot 3,00 \cdot {{10}^8}\frac{{\rm{m}}}{{\rm{s}}}}} \cdot \left( {1 - \cos \left( {160^\circ } \right)} \right) = 9,14 \cdot {10^{ - 11}}{\rm{m}}
$$

Berechnung der Energie des rückgestreuten Quants:

$$
E' = \frac{{h \cdot c}}{{\lambda '}} \Rightarrow E' = \frac{{4,14 \cdot {{10}^{ - 15}}{\rm{eV}} \cdot {\rm{s}} \cdot 3,00 \cdot {{10}^8}\frac{{\rm{m}}}{{\rm{s}}}}}{{9,14 \cdot {{10}^{ - 11}}{\rm{m}}}} = 13,6{\rm{keV}}
$$


e)


$$
\frac{1}{\lambda } = \frac{3}{4} \cdot R \cdot {\left( {Z - 1} \right)^2}
$$

Aus dem Gesetz von MOSELEY kann man sehen, dass die charakteristische Kα-Linie von Elementen mit niedriger Ordnungszahl relativ groß ist und die Energie der entsprechenden Quanten demzufolge klein ist. Diese energiearmen Quanten können das Probenmaterial nicht mehr verlassen.

## Grundwissen
- [Charakteristische Strahlung](https://www.leifiphysik.de/atomphysik/roentgen-strahlung/grundwissen/charakteristische-strahlung)
