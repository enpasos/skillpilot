# Radioisotopen-Generator (Abitur BY 2005 LK A4-2)

Quelle: https://www.leifiphysik.de/kern-teilchenphysik/anwendungen-der-kernphysik/aufgabe/radioisotopen-generator-abitur-2005-lk-a4-2
Originaldatei: `curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/abi/Physik/input/leifiphysik_abitur/pages/kern-teilchenphysik/anwendungen-der-kernphysik/aufgabe/radioisotopen-generator-abitur-2005-lk-a4-2.html`
Schwierigkeitsgrad: schwere Aufgabe

## Aufgabe

![](https://www.leifiphysik.de/sites/default/files/images/fbb14ee87063f54121de25a4b87fb876/1200Himmelskoerper_Cassini_Huygens_Titan.jpg)

Abb. 1 Raumsonde Cassini

[NASA](https://commons.wikimedia.org/wiki/File:Cassini_Huygens_Titan.jpg), Public domain, via Wikimedia Commons

Am 15.10.1997 wurde die Raumsonde Cassini gestartet, die am 01.07.2004 den Planeten Saturn erreicht hat. Weil bei so großer Sonnendistanz die Stromversorgung durch Solarzellen versagt, hat Cassini einen Radioisotopen-Generator an Bord. In ihm wird Wärme, die als Folge von radioaktivem Zerfall auftritt, in elektrische Energie umgewandelt.

Der Radioisotopen-Generator von Cassini enthielt beim Start eine größere Menge des $\alpha$-Strahlers ${}^{238}{\rm{Pu}}$, dessen Halbwertszeit $87{,}7$ Jahre beträgt, in Form von Plutoniumdioxid ($\rm{PuO}_2$). Zum Zeitpunkt des Starts lieferte der Generator eine elektrische Leistung von $870\,\rm{W}$.

a)

Stelle die Gleichung des ${}^{238}{\rm{Pu}}$-Zerfalls auf.

Gib an, zu welcher Zerfallsreihe der Tochterkern gehört.

Erläutere, warum der Zerfall dieses Tochterkerns und nachfolgende Zerfälle für die Stromversorgung von Cassini praktisch keine Rolle spielen. (5 BE)

b)

Die elektrische Leistung des Generators ist ungefähr proportional zur ${}^{238}{\rm{Pu}}$-Aktivität.

Berechne, um welchen Prozentsatz die Leistung im Verlauf des Flugs zum Saturn sank. (5 BE)

$71\,\%$ der $\alpha$-Zerfälle von ${}^{238}{\rm{Pu}}$ führen direkt in den Grundzustand des Tochterkerns, wobei jeweils ein $\alpha$-Teilchen mit einer kinetischen Energie von $5{,}499\,\rm{MeV}$ emittiert wird.

$29\,\%$ der Zerfälle führen zum ersten angeregten Zustand des Tochterkerns. Dabei beträgt die kinetische Energie des emittierten $\alpha$-Teilchens $5{,}456\rm{MeV}$ und es wird anschließend ein $\gamma$-Quant mit der Energie $43{,}5\,\rm{keV}$ ausgesandt.

c)

Skizziere auf Grund dieser Angaben das Energieniveauschema für den $\alpha$-Zerfall von ${}^{238}{\rm{Pu}}$.

Zeige durch Rechnung, dass in beiden Fällen eine Gesamtenergie von $5{,}593\,\rm{MeV}$ freigesetzt wird. **Beachten Sie:** Im Gegensatz zum Rückstoß bei der $\alpha$-Emission ist der Rückstoß bei der $\gamma$-Emission vernachlässigbar. (9 BE)

d)

Der Wirkungsgrad für die Umsetzung von Wärmeenergie in elektrische Energie beträgt rund $5{,}3\,\%$.

Berechne die erforderliche Masse an $\rm{PuO}_2$ zum Zeitpunkt des Starts. (7 BE)

## Lösung

**Hinweis:** Bei dieser Lösung von LEIFIphysik handelt es sich nicht um den amtlichen Lösungsvorschlag des bayr. Kultusministeriums.

a)

Die Kernreaktionsgleichung lautet 

$$
{}_{94}^{238}{\rm{Pu}} \to {}_{92}^{234}{\rm{U}} + {}_2^4{\rm{He}}
$$

 Das Tochterelement Uran gehört zur Uran-Radium-Reihe ($4n+2$) und hat eine Halbwertszeit von $2{,}5 \cdot 10^5$ Jahren, während das Ausgangselement Plutonium nur eine Halbwertszeit von $87{,}7$ Jahren hat.

Da ${T_{1/2}}\left( {{}_{94}^{238}{\rm{U}}} \right) \gg {T_{1/2}}\left( {{}_{92}^{234}{\rm{Pu}}} \right)$, ist die Aktivität der Tochternuklide klein. Die Zerfälle, die nach ${{}_{}^{238}{\rm{U}}}$ folgen, spielen während der Mission von Cassini keine Rolle.

b)

Da die elektrische Leistung proportional zur Aktivität ist, lässt sich die folgende Proportion aufstellen: 

$$
\begin{aligned} \frac{P_{\rm el}(t)}{P_0} &= \frac{A(t)}{A_0}\\ &= \frac{\lambda N(t)}{\lambda N_0}\\ &= \frac{N(t)}{N_0}\\ = e^{-\lambda t} \end{aligned} 
$$

 Unter Benutzung von $\lambda = \frac{\ln 2}{T_{1/2}}$ ergibt sich 

$$
\begin{aligned} P_{\rm el}(t) &= P_0 \cdot e^{-\lambda t}\\ &= P_0 \cdot e^{ -\frac{\ln 2}{T_{1/2}} t }\end{aligned} 
$$

 Mit $t = 6{,}71\,\rm a$ ergibt sich 

$$
 P_{\rm el}(6{,}71\,\rm a) = P_0 \cdot e^{ -\frac{\ln 2}{87{,}7\,\rm a} \cdot 6{,}71\,\rm a } = P_0 \cdot 0{,}948 
$$

 Nach $6{,}71\,\rm a$ beträgt die elektrische Leistung also noch $94{,}8\,\%$ der Anfangsleistung. Sie hat also um $5{,}2\,\%$ abgenommen.

c)

![](https://www.leifiphysik.de/sites/default/files/2023/08/image/Radioisotopen-Generator_Loesung.svg)

Abb. 2 Energieniveauschema des $\alpha$-Zerfalls

[CC-BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/deed.de) / FWU Institut für Film und Bild;

Magdalena Kuom

Bei jedem $\alpha$-Zerfall erhält der Tochterkern eine Rückstoßenergie, die sich mit dem Impulssatz und der klassischen Energie-Impuls-Beziehung berechnen lässt. Geht man wieder davon aus, dass der Gesamtimpuls vor dem Zerfall Null war, so müssen die Impulse von Tochterkern und $\alpha$-Teilchen nach dem Zerfall gegengleich sein:

$$
 p_\alpha = p_{\rm U} \quad (1) 
$$

 Mit der klassischen Energie-Impulsbeziehung und $(1)$ drückt man nun die kinetische Rückstoßenergie $E_{\rm kin,U}$ des Urans durch die kinetische Energie $E_{\rm kin,\alpha}$ des Alphateilchens aus: 

$$
 E_{\rm kin,U} = \frac{p_{\rm U}^2}{2 m_{\rm U}} = \frac{p_\alpha^2}{2 m_{\rm U}} \quad (2) 
$$

$$
 E_{\rm kin,\alpha} = \frac{p_\alpha^2}{2 m_\alpha} \Leftrightarrow p_\alpha^2 = 2 m_\alpha E_{\rm kin,\alpha} \quad (3) 
$$

 Einsetzen von $(3)$ in $(2)$ liefert 

$$
 E_{\rm kin,U} = \frac{m_\alpha E_{\rm kin,\alpha}}{m_{\rm U}} 
$$

 Einsetzen der gegebenen Werte liefert (mit zwei gültigen Ziffern Genauigkeit) 

$$
 E_{\rm kin,U,1} = \frac{4{,}00\,\rm u \cdot 5{,}499\,\rm MeV}{234\,\rm u} = 0{,}094\,\rm MeV 
$$

$$
 E_{\rm kin,U,2} = \frac{4{,}00\,\rm u \cdot 5{,}456\,\rm MeV}{234\,\rm u} = 0{,}093\,\rm MeV 
$$

 Somit ergibt sich für die Gesamtenergie 

$$
 E_{\rm ges,1} = 5{,}499\,\rm MeV + 0{,}094\,\rm MeV > 5{,}593\,\rm MeV 
$$

$$
 E_{\rm ges,2} = 5{,}456\,\rm MeV + 0{,}093\,\rm MeV + 0{,}0435\,\rm MeV > 5{,}593\,\rm MeV 
$$


d)

Aus der Definition des Wirkungsgrades ergibt sich 

$$
 \eta = \frac{P_{\rm el,0}}{P_{\rm Wärme}} \Leftrightarrow P_{\rm Wärme} = \frac{P_{\rm el,0}}{\eta} 
$$

 Einsetzen der gegebenen Werte liefert (mit drei gültigen Ziffern Genauigkeit) 

$$
 P_{\rm Wärme} = \frac{870\,\rm W}{0{,}053} = 16{,}4\,\rm kW 
$$

 Die Wärmeleistung kann auch durch die Zahl der anfänglich vorhandenen Plutoniumatome ausgedrückt werden: 

$$
 P_{\rm Wärme} = A_0 \cdot E_{\rm ges} = \lambda N_0 E_{\rm ges} = \frac{\ln 2}{T_{1/2}} N_0 E_{\rm ges} 
$$

 Auflösen nach $N_0$ und Einsetzen der gegebenen Werte ergibt (mit drei gültigen Ziffern Genauigkeit) 

$$
 N_0 = \frac{P_{\rm Wärme} T_{1/2}}{\ln 2 \cdot E_{\rm ges}} = \frac{16{,}4 \cdot 10^3\,\rm W \cdot 87{,}7 \cdot 365 \cdot 24 \cdot 3600\,\rm s} {\ln 2 \cdot 5{,}593 \cdot 10^6 \cdot 1{,}602 \cdot 10^{-19}\,\rm eV} = 7{,}30 \cdot 10^{25} 
$$

 Für die Masse $m$ des Plutoniumdioxids gilt dann (mit drei gültigen Ziffern Genauigkeit) 

$$
 m = N_0 \cdot (238\,\rm u + 2 \cdot 16\,\rm u) = 7{,}30 \cdot 10^{25} \cdot 270 \cdot 1{,}66 \cdot 10^{-27}\,\rm kg = 32{,}7\,\rm kg 
$$


## Grundwissen
- [Ionisierende Strahlung in der Technik](https://www.leifiphysik.de/kern-teilchenphysik/anwendungen-der-kernphysik/grundwissen/ionisierende-strahlung-der-technik)
