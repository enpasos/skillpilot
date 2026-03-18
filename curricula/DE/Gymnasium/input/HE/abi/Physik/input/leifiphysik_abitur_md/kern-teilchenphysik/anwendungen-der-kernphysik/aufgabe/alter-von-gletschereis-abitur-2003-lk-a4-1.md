# Alter von Gletschereis (Abitur BY 2003 LK A4-1)

Quelle: https://www.leifiphysik.de/kern-teilchenphysik/anwendungen-der-kernphysik/aufgabe/alter-von-gletschereis-abitur-2003-lk-a4-1
Originaldatei: `curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/abi/Physik/input/leifiphysik_abitur/pages/kern-teilchenphysik/anwendungen-der-kernphysik/aufgabe/alter-von-gletschereis-abitur-2003-lk-a4-1.html`
Schwierigkeitsgrad: schwere Aufgabe

## Aufgabe

Bei Bohrungen in Gletscher- bzw. Grönlandeis werden Eisproben aus Schichten verschiedener Tiefe entnommen. Ihr Alter lässt sich mit Hilfe ihres Tritiumgehalts bestimmen.

Das Nuklid Tritium ${{}^3{\rm{H}}}$ ist in der Atmosphäre auf Grund fehlender natürlicher Erzeugungsprozesse fast nicht vorhanden. In den 60er Jahren wurde es jedoch durch Kernwaffentests in höherem Maße freigesetzt. ${{}^3{\rm{H}}}$ ist radioaktiv ($T_{1/2} = 12{,}3\,\rm{a}$) und geht durch $\beta^{-}$-Zerfall in das stabile Edelgasisotop ${{}^3{\rm{He}}}$ über.

Das Zerfallsprodukt kann das Eis nicht verlassen und reichert sich darin an. Daher kann zur Altersbestimmung der Proben das Anzahlverhältnis von Mutter- und Tochterkernen des Tritiumzerfalls verwendet werden.

a)

Gehe zunächst davon aus, dass zum Zeitpunkt des Tritiumeinschlusses kein ${{}^3{\rm{He}}}$ im Eis vorhanden war.

Weise nach, dass dann für das Anzahlverhältnis $k$ von Mutter- zu Tochterkernen

$$
k = \frac{1}{e^{\lambda \cdot t} - 1}
$$

gilt, wobei $\lambda $ die Zerfallskonstante für Tritium ist.

Berechne, welches Alter sich für eine Eisprobe ergibt, bei der $k = 0{,}14$ gemessen wird. (9 BE)

b)

Gib an, ob das tatsächliche Alter der Probe größer oder kleiner als der berechnete Wert, wenn die zum Zeitpunkt der Entstehung der Probe bestehende ${{}^3{\rm{He}}}$-Konzentration nicht vernachlässigbar ist.

Begründe deine Antwort. (3 BE)

c)

Nenne zwei Gründe, warum die Tritiummethode zur Altersbestimmung von Eisschichten, die deutlich älter als 40 Jahre sind, nicht geeignet ist. (4 BE)

## Lösung

**Hinweis:** Bei dieser Lösung von LEIFIphysik handelt es sich nicht um den amtlichen Lösungsvorschlag des bayr. Kultusministeriums.

a)

Es gilt die folgende Zerfallsgleichung: 

$$
 {}^3_1\rm H \to {}^3_2\rm He + {}^0_{-1}\rm e + {}^0_0\bar{\nu} 
$$

 Für die nicht zerfallenen Tritiumkerne (Mutterkerne) gilt: 

$$
 N_{^3\rm H}(t) = N_{0,^3\rm H} \cdot e^{-\lambda t} 
$$

 Für die gebildeten $^3\rm He$-Kerne (Tochterkerne) gilt: 

$$
 N_{^3\rm He}(t) = N_{0,^3\rm H} - N_{^3\rm H}(t) 
$$

 Damit ergibt sich 

$$
\begin{aligned} k &= \frac{N_{^3\rm H}(t)}{N_{^3\rm He}(t)}\\ &= \frac{N_{^3\rm H}(t)}{N_{0,^3\rm H} - N_{^3\rm H}(t)}\\ &= \frac{N_{0,^3\rm H} e^{-\lambda \cdot t}}{N_{0,^3\rm H} - N_{0,^3\rm H} e^{-\lambda t}}\\ &= \frac{e^{-\lambda \cdot t}}{1 - e^{-\lambda \cdot t}}\\ &= \frac{1}{e^{\lambda \cdot t} - 1} \quad (1)\end{aligned} 
$$

 Mit $(1)$ berechnet sich die verstrichene Zeit zu 

$$
\begin{aligned} k &= \frac{1}{e^{\lambda \cdot t} - 1}\\ e^{\lambda \cdot t} &= 1 + \frac{1}{k}\\ \lambda \cdot t &= \ln\left(1 + \frac{1}{k}\right)\\ t &= \frac{1}{\lambda} \cdot \ln\left(1 + \frac{1}{k}\right) \end{aligned} 
$$

 Unter Benutzung von $\lambda = \frac{\ln(2)}{T_{1/2}}$ ergibt sich 

$$
 t = \frac{T_{1/2}}{\ln(2)} \cdot \ln\left(1 + \frac{1}{k}\right) 
$$

 Einsetzen der gegebenen Werte liefert (mit zwei gültigen Ziffern Genauigkeit) 

$$
 t = \frac{12{,}3\,\rm a}{\ln(2)}\cdot  \ln\left(1 + \frac{1}{0{,}14}\right) = 37\,\rm a 
$$


b)

Wenn bereits ${{}^3{\rm{He}}}$-Kerne vor den Tests in der Probe waren, so wird der Faktor $k$ kleiner (da mehr ${{}^3{\rm{He}}}$-Kerne vorhanden sind) und die nach Gleichung $(1)$ berechnete Zeit größer. Man berechnet also ein zu hohes Alter der Probe. Das tatsächliche Alter der Probe ist somit kleiner.

c)

Vierzig Jahre ist mehr als drei Halbwertszeiten. Die Muttersubstanz ist schon weitgehend zerfallen. Kleinere Fehler bei der Konzentrationsbestimmung von ${{}^3{\rm{H}}}$ wirken sich dann relativ gravierend aus, da sich $k$ und damit das berechnete Alter stark verändern.

Der Tritiumgehalt in der Atmosphäre hat sich seit 1960 markant verändert. Er war vor 1960 wesentlich kleiner.

## Grundwissen
- [Altersbestimmung mit der Radiocarbonmethode](https://www.leifiphysik.de/kern-teilchenphysik/anwendungen-der-kernphysik/grundwissen/altersbestimmung-mit-der-radiocarbonmethode)
