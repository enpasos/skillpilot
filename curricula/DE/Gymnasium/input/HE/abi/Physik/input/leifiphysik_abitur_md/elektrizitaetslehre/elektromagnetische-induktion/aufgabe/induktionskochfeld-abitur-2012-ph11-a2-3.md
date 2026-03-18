# Induktionskochfeld (Abitur BY 2012 Ph11 A2-3)

Quelle: https://www.leifiphysik.de/elektrizitaetslehre/elektromagnetische-induktion/aufgabe/induktionskochfeld-abitur-2012-ph11-a2-3
Originaldatei: `curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/abi/Physik/input/leifiphysik_abitur/pages/elektrizitaetslehre/elektromagnetische-induktion/aufgabe/induktionskochfeld-abitur-2012-ph11-a2-3.html`
Schwierigkeitsgrad: mittelschwere Aufgabe

## Aufgabe

Bei einem Induktionskochfeld durchsetzt ein magnetisches Wechselfeld der Flussdichte $B(t) = \hat B \cdot \sin \left( {\omega \cdot t} \right)$ einen metallischen Topfboden.

a)

![](https://www.leifiphysik.de/sites/default/files/images/c2b54631ad7914aaff767d4d930c558c/600Abitur_BY_2012_ph11_2_A3_bild1.png)

**Abb. 1** Induktions-Kochfeld

Staatsinstitut für Schulqualität und Bildungsforschung (ISB)

Erkläre, warum sich der Boden eines Eisentopfs, der auf dem eingeschalteten Kochfeld steht, erwärmt. (4 BE)

Nun wird anstelle des Topfs eine Induktionsspule mit $N = 500$ Windungen so auf das eingeschaltete Kochfeld gelegt, dass ihre Querschnittsfläche ($A = 30\,\rm{cm}^2$) vollständig und senkrecht vom Magnetfeld durchsetzt wird.

b)

Zeige, dass zwischen den Enden der Spule eine Induktionsspannung mit $U_{\rm{i}}\left(t\right) = - N \cdot A \cdot \hat B \cdot \omega \cdot \cos \left( {\omega \cdot t} \right)$ entsteht. (5 BE)

c)

![](https://www.leifiphysik.de/sites/default/files/images/a569a4422bd593b8822af96e8fd8b9a3/800Abitur_BY_2012_ph11_2_A3_bild2.png)

**Abb. 2** Oszilloskop-Bild

Staatsinstitut für Schulqualität und Bildungsforschung (ISB)

Ein an die Spule angeschlossenes Oszilloskop zeigt den nebenstehenden zeitlichen Verlauf der Induktionsspannung $U_{\rm{i}}\left(t\right)$.

Ermittle zusammen mit dem Ergebnis der Teilaufgabe **b)** den Scheitelwert $\hat B$ des magnetischen Wechselfeldes. (6 BE)

d)

Begründe, weshalb zur Erzeugung hoher Induktionsspannungen bei Induktionskochfeldern Wechselspannungen im $\rm{kHz}$-Bereich und nicht solche mit der Frequenz $50\,\rm{Hz}$ der Netz-Wechselspannung verwendet werden. (3 BE)

## Lösung

**Hinweis:** Bei dieser Lösung von LEIFIphysik handelt es sich nicht um den amtlichen Lösungsvorschlag des bayr. Kultusministeriums.

a)

Die an die Spule gelegte Wechselspannung erzeugt in der Spule einen Wechselstrom, der wiederum ein magnetische Wechselfeld bewirkt. Dieses magnetische Wechselfeld induziert im Topfboden Wirbelströme (vgl. auch das WALTENHOFsches Pendel), die den metallischen Topfboden erhitzen.

Nicht verlangtes Argument, das jedoch für die effektive Funktionsweise dieser Erhitzungsmethode wesentlich ist: Das ferromagnetische Material, das aufgrund des magnetischen Wechselfeldes ständig ummagnetisiert wird, verstärkt und bündelt das Magnetfeld im Bereich des Topfbodens.

b)

![](https://www.leifiphysik.de/sites/default/files/2023/03/image/Abitur_BY_2012_ph11_2_A3_bild3.svg)

**Abb. 3** zu Teilaufgabe **b)**

[CC-BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/deed.de) / FWU Institut für Film und Bild;

Für den magnetischen Fluss, welcher die (obere) Induktionsspule durchsetzt, gilt

$$
\Phi (t) = A \cdot B(t)  = A \cdot \hat B \cdot \sin \left( {\omega \cdot t} \right)
$$

Mit der differentiellen Form des Induktionsgesetzes gilt dann

$$
U_{\rm{i}}\left(t\right) = - N \cdot \frac{{d\Phi }}{{dt}} = - N \cdot A \cdot \hat B \cdot \omega \cdot \cos \left( \omega \cdot t \right)
$$


c)

Aus Teilaufgabe **b)** ergibt sich der folgende Zusammenhang zwischen der maximalen Induktionsspannung $\hat U_{\rm{i}}$ und der maximalen Flussdichte $\hat B$ des Magnetfeldes:

$$
\hat U_{\rm{i}} = N \cdot A \cdot \hat B \cdot \omega  \Leftrightarrow \hat B = \frac{\hat U_{\rm{i}}}{{N \cdot A \cdot \omega }}
$$

woraus sich mit ${\omega  = 2 \cdot \pi  \cdot f}$ und ${f = \frac{1}{T}}$ ergibt

$$
{\hat B = \frac{{{\hat U_{\rm{i}}} \cdot T}}{{N \cdot A \cdot 2 \cdot \pi }}}
$$

Einsetzen der gegebenen Werte liefert

$$
\hat B = \frac{{250\,{\rm{V}} \cdot 40 \cdot {{10}^{ - 6}}\,{\rm{s}}}}{{500 \cdot 30 \cdot {{10}^{ - 4}}\,{{\rm{m}}^2} \cdot 2 \cdot \pi }} = 1{,}1\,{\rm{mT}}
$$


d)

Aus Teilaufgabe **c)** sieht man, dass der Scheitelwert $\hat U_{\rm{i}}$ der induzierten Spannung linear mit der Frequenz der Wechselspannung steigt ($\omega = 2 \cdot \pi \cdot f$). Somit bewirkt eine höherfrequente Wechselspannung eine höhere Amplitude der induzierten Spannung. Dies hat höhere Induktionsströme im Boden des Kochtopfes und somit eine schnellere Erwärmung des Kochgutes zur Folge.

## Grundwissen
- [Induktion durch Änderung der magnetischen Flussdichte](https://www.leifiphysik.de/elektrizitaetslehre/elektromagnetische-induktion/grundwissen/induktion-durch-aenderung-der-magnetischen-flussdichte)
