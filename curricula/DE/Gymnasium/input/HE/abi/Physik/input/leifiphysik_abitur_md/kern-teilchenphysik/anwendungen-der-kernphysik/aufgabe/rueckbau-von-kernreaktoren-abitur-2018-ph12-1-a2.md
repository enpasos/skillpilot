# Rückbau von Kernreaktoren (Abitur BY 2018 Ph12-1 A2)

Quelle: https://www.leifiphysik.de/kern-teilchenphysik/anwendungen-der-kernphysik/aufgabe/rueckbau-von-kernreaktoren-abitur-2018-ph12-1-a2
Originaldatei: `curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/abi/Physik/input/leifiphysik_abitur/pages/kern-teilchenphysik/anwendungen-der-kernphysik/aufgabe/rueckbau-von-kernreaktoren-abitur-2018-ph12-1-a2.html`
Schwierigkeitsgrad: mittelschwere Aufgabe

## Aufgabe

Der Rückbau eines Reaktordruckbehälters ist mit einer großen Strahlenbelastung für die Arbeiter verbunden, weil das Material während des Betriebs durch Neutronenstrahlung hochradioaktiv geworden ist. Ein großer Teil dieser Aktivität stammt dabei vom Kobalt-Isotop ${}^{60}{\rm{Co}}$ (Halbwertszeit $T_{1/2} = 5{,}27\,\rm{a}$).

a)

Die Innenseite des Reaktordruckbehälters besitzt nach Modellrechnungen eine ${}^{60}{\rm{Co}}$-Aktivität von $1{,}0 \cdot 10^5\,\rm{Bq}$ pro Gramm Stahl.

Berechne die Zeitdauer, in der diese Aktivität auf $10\,\rm{Bq}$ pro Gramm Stahl sinkt. (5 BE)

Durch $\beta^-$-Zerfall geht ${}^{60}{\rm{Co}}$ in einen angeregten Zustand des Nickel-Isotops ${}^{60}{\rm{Ni}}$ über, das kurz darauf nacheinander zwei $\gamma $-Quanten der Energien $1{,}17\,\rm{MeV}$ und $1{,}33\,\rm{MeV}$ aussendet und dabei in den Grundzustand übergeht.

b)

Gib die Zerfallsgleichung für den $\beta^-$-Zerfall an.

Zeige rechnerisch, dass dabei eine Gesamtenergie von $2{,}82\,\rm{MeV}$ freigesetzt wird. (5 BE)

c)

Berechne die Energiedifferenz des oben beschriebenen Übergangs von ${}^{60}{\rm{Co}}$ zum angeregten Zustand des ${}^{60}{\rm{Ni}}$.

Begründe, dass nur $\beta^-$-Teilchen mit geringerer Energie detektiert werden können. (4 BE)

d)

![](https://www.leifiphysik.de/sites/default/files/2026/01/image/rueckbau-von-kernreaktoren-abitur-by-2018-ph12-1-a2_diagramme_0.svg)

Abb. 1 Diagramme zu Aufgabenteil d)

[CC-BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/deed.de) / FWU Institut für Film und Bild;

Zwei der Diagramme I bis IV in Abb. 1 zeigen Energiespektren von Teilchen, die beim $\beta^-$-Zerfall emittiert werden.

Ordne diesen Diagrammen das jeweils passende Teilchen begründet zu.

Erläutere dabei auch den Zusammenhang der beiden Energiespektren. (6 BE)

Im Folgenden soll nun die Belastung eines Arbeiters aufgrund der Strahlung des Kobalt-Isotops ${}^{60}{\rm{Co}}$ beim Rückbau des Reaktordruckbehälters abgeschätzt werden.

e)

Berechne dazu die Äquivalentdosis, die ein Arbeiter der Masse $80\,\rm{kg}$ in einer Stunde aufnehmen würde, wenn er ungeschützt der Strahlung ausgesetzt ist. Lege eine Aktivität von $1{,}0\,\rm{GBq}$ zugrunde und nimm an, dass $25\,\%$ der bei jedem ${}^{60}{\rm{Co}}$-Zerfall freiwerdenden Gesamtenergie vom Körper absorbiert werden.

Interpretiere dein Ergebnis in Bezug auf die in der Strahlenschutzverordnung festgelegte Grenze für beruflich strahlenexponierte Personen von $20\,\rm{mSv}$ pro Jahr. (7 BE)

f)

Erläutere, inwiefern der Arbeiter durch einen Ganzkörperschutzanzug aus Kunststofffolie und eine Atemschutzmaske beim Zerlegen des Reaktordruckbehälters vor Strahlenschäden geschützt wird. (3 BE)

## Lösung

**Hinweis:** Bei dieser Lösung von LEIFIphysik handelt es sich nicht um den amtlichen Lösungsvorschlag des bayr. Kultusministeriums.

a)


$$
 A(t) = A(0) \cdot e^{ - \frac{\ln(2)}{T_{1/2}} \, t } \Leftrightarrow e^{ - \frac{\ln(2)}{T_{1/2}} \, t } = \frac{A(t)}{A(0)} \Leftrightarrow - \frac{\ln(2)}{T_{1/2}} \, t = \ln \left( \frac{A(t)}{A(0)} \right) \Leftrightarrow t = - T_{1/2} \cdot \frac{\ln \left( \frac{A(t)}{A(0)} \right)}{\ln(2)} 
$$

 Einsetzen der gegebenen Werte liefert (mit zwei gültigen Ziffern Genauigkeit) 

$$
 t = -5{,}27\,{\rm a} \cdot \frac{ \ln \left( \frac{10}{1{,}0 \cdot 10^{5}} \right) }{ \ln(2) } = 70\,{\rm a} 
$$

 Es dauert also ca. $70$ Jahre, bis die Aktivität auf $10\,\rm Bq$ abgesunken ist.

b)

Zerfallsgleichung: 

$$
 {}_{27}^{60}{\rm Co} \to {}_{28}^{60}{\rm Ni} + {}_{-1}^{0}{\rm e} + {}_{0}^{0}{\rm{\bar{\nu}}} 
$$

 Berechnung des $Q$-Wertes: 

$$
 \begin{aligned} Q &= \left[ m_{a0}\left( {}_{27}^{60}{\rm Co} \right) - m_{a0}\left( {}_{28}^{60}{\rm Ni} \right) \right] \cdot c^2 \\ &= \left[ 59{,}93381707 - 59{,}93078646 \right] \cdot u \cdot c^2 \\ &= 0{,}00303061 \cdot 931{,}49\,{\rm MeV} \\ &= 2{,}82\,{\rm MeV} \end{aligned} 
$$


c)

Für die Gesamtenergie ${E_{\max }}$der beim ${\beta ^ - }$-Zerfall auftretenden Teilchen müssen vom $Q$-Wert die Energien der beiden $\gamma $-Quanten subtrahiert werden:

$$
{E_{\max }} = Q - {E_{{\gamma _1}}} - {E_{{\gamma _2}}} \Rightarrow {E_{\max }} = 2{,}82\,{\rm{MeV}} - 1{,}17\,{\rm{MeV}} - 1{,}33\,{\rm{MeV}} = 0{,}32\,{\rm{MeV}}
$$

Die Maximalenergie der ${\beta ^ - }$-Teilchen ist kleiner als $0{,}32,\rm{MeV}$, da stets ein Teil der Energie auch noch auf das Antineutrino übergeht.

d)

Diagramm IV stellt das Energiespektrum der Elektronen dar:

Kontinuierliches Energiespektrum mit Energien kleiner als $E_{\max}$ und eine verschwindende relative Häufigkeit bei $E_{\max}$. Dieses Kriterium macht erst die Unterscheidung der Diagramme möglich.

Diagramm II stellt das Energiespektrum der Antineutrinos dar:

Begründung: Wenn ein Elektron die kinetische Energie $E_{\rm{kin,1}}$ hat, so muss das Neutrino aufgrund der Energieerhaltung und der identischen Zerfallsenergie bei jedem Zerfall die Energie $E_{\max }-E_{\rm{kin,1}}$ haben.

Für den sehr seltenen Spezialfall dass die kinetische Energie des Elektrons ganz nahe bei ${E_{\max }}$ liegt, gilt dann für die Energie des Antineutrinos

$$
E_{\bar \nu } = E_{\max } - E_{\rm{kin,el}} \approx E_{\max } - E_{\max} \approx 0
$$

Das Neutrino-Diagramm muss also bei der Neutrio-Energie von ungefähr Null eine sehr geringe Häufigkeit aufweisen. Dies ist nur beim Diagramm II der Fall.

e)

Näherungsweise kann man die Aktivität in **einer Stunde** als konstant ansetzen. Dann finden in einer Stunde $N = 1{,}0 \cdot {10^9} \cdot 3600 = 3{,}6 \cdot {10^{12}}$ Zerfälle statt.

Bei einem $\beta^{-}$-Zerfall wird eine Gesamtenergie von $2{,}82\,\rm{MeV}$ frei. Wenn $25\,\%$ der Gesamtenergie eines Zerfalls aufgenommen werden, so sind dies bei jedem Zerfall

$$
0{,}25 \cdot 2{,}82 \cdot {10^6}\,{\rm{eV}} = 70{,}5 \cdot {10^4}\,{\rm{eV}} = 8{,}00 \cdot {10^4} \cdot 1{,}60 \cdot {10^{ - 19}}\,{\rm{J}} = 1{,}13 \cdot {10^{ - 13}}\,{\rm{J}}
$$

Insgesamt ist also die in einer Stunde absorbierte Energie

$$
E = 1{,}13 \cdot {10^{ - 13}} \cdot 3{,}60 \cdot {10^{12}}\,{\rm{J}} = 40{,}6 \cdot {10^{ - 2}}\,{\rm{J}}
$$

Da der Arbeiter $80\,\rm{kg}$ wiegt, gilt für die Energiedosis $D$

$$
D = \frac{E}{m} \Rightarrow D = \frac{{40{,}6 \cdot {{10}^{ - 2}}\,{\rm{J}}}}{{80{\rm{kg}}}} = 5{,}1 \cdot {10^{ - 3}}\,{\rm{Gy}}
$$

Da der Bewertungsfaktor $q=1$ ist, gilt für die Äquivalentdosis $H$, die in einer Stunde erreicht ist

$$
H = q \cdot D \Rightarrow H = 5{,}1\,{\rm{mSv}}
$$

Damit ist der Jahresgrenzwert von $20\,\rm{mSv}$ in weniger als 4 Stunden erreicht.

f)

Die Atemschutzmaske verhindert die Aufnahme von radioaktivem Staub in den Körper. Der Anzug aus Kunststofffolie ist zur Abschirmung der ${\beta ^ - }$- und $\gamma $-Strahlung nicht besonders wirkungsvoll.

## Grundwissen
- [Ionisierende Strahlung in der Technik](https://www.leifiphysik.de/kern-teilchenphysik/anwendungen-der-kernphysik/grundwissen/ionisierende-strahlung-der-technik)
- [Dosimetrie und Dosiseinheiten](https://www.leifiphysik.de/kern-teilchenphysik/radioaktivitaet-fortfuehrung/grundwissen/dosimetrie-und-dosiseinheiten)
