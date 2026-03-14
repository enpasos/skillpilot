# Uran-Blei-Methode (Abitur BY 1995 LK A4-2)

Quelle: https://www.leifiphysik.de/kern-teilchenphysik/anwendungen-der-kernphysik/aufgabe/uran-blei-methode-abitur-1995-lk-a4-2
Originaldatei: `curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/abi/Physik/input/leifiphysik_abitur/pages/kern-teilchenphysik/anwendungen-der-kernphysik/aufgabe/uran-blei-methode-abitur-1995-lk-a4-2.html`
Schwierigkeitsgrad: schwere Aufgabe

## Aufgabe

Die Altersbestimmung von Gesteinen aus der Frühzeit der Erdgeschichte kann mit der Uran-Blei-Methode erfolgen. Es kann angenommen werden, dass zum Zeitpunkt der Gesteinsbildung kein Blei im Gestein vorhanden war. Eine mögliche Fehlerquelle der Altersbestimmung besteht darin, dass Gesteine in späteren Umwandlungsphasen einen Teil ihres Bleigehalts verlieren können. Um diesen Fehler auszuschließen, kann man den Zerfall von ${}^{238}{\rm{U}}$ und ${}^{235}{\rm{U}}$ getrennt untersuchen. Führen beide Uran-Blei-Isotopenverhältnisse zum gleichen Alter, so spricht man von einer "ungestörten" Gesteinsprobe.

a)

Uran zerfällt nicht direkt, sondern über mehrere Zwischenprodukte zu Blei.

Erläutere, warum man bei der rechnerischen Behandlung des Uranzerfalls in guter Näherung einen direkten Zerfall in das stabile Endprodukt Blei annehmen kann. (2 BE)

b)

Leite für das Alter $t$ eines Gesteins die Gleichung 

$$
t = \frac{T_{1/2}}{{\ln \left( 2 \right)}} \cdot \ln \left( 1 + \frac{N_{\rm{Pb}}(t)}{N_{\rm{U}}(t)} \right)
$$

 her, wobei $N_{\rm{Pb}}(t)$ und $N_{\rm{U}}(t)$ die heutigen Teilchenzahlen von "zusammengehörigen" Blei- bzw. Uranisotopen bezeichnen. (6 BE)

c)

Bei den ältesten "ungestörten" Gesteinsproben ergibt die Untersuchung ein Massenverhältnis der Nuklide ${}^{206}{\rm{Pb}}$ und ${}^{238}{\rm{U}}$ von $\frac{m_{{}^{206}{\rm{Pb}}}}{m_{{}^{238}{\rm{U}}}} = 0{,}77$.

Zeige, dass man als Alter des Gesteins $4{,}1$ Milliarden Jahre erhält. (5 BE)

d)

Berechne, welches Massenverhältnis $\frac{m_{{}^{207}{\rm{Pb}}}}{m_{{}^{235}{\rm{U}}}}$ der Isotope ${}^{207}{\rm{Pb}}$ und ${}^{235}{\rm{U}}$ man in der Probe der Teilaufgabe c) erhält. (7 BE)

Die Massenverhältnisse werden bestimmt, indem etwas Material mittels eines Ionenstrahls aus der Gesteinsprobe herausgelöst und mit einem Massenspektrographen untersucht wird.

e)

Erläutere anhand einer beschrifteten Zeichnung den Aufbau und die Funktionsweise eines Massenspektrographen. (6 BE)

## Lösung

**Hinweis:** Bei dieser Lösung von LEIFIphysik handelt es sich nicht um den amtlichen Lösungsvorschlag des bayr. Kultusministeriums.

a)

${}^{238}{\rm{U}}$ zerfällt als Ausgangsnuklid der Uran-Radium-Reihe letztendlich in das stabile Bleiisotop ${}^{206}{\rm{Pb}}$. Die Halbwertszeit des Ausgangsnuklids ${}^{238}{\rm{U}}$ ist hierbei wesentlich länger als die Halbwertszeiten der verschiedenen Zwischennuklide, so dass man über die lange Zeit gesehen von einem "direkten" Zerfall von Uran in Blei ausgehen kann. Analoges gilt für ${}^{235}{\rm{U}}$ als Ausgangsnuklid der Uran-Actinium-Reihe.

b)

Das Zerfallsgesetz für das Uran lautet 

$$
 N_{\rm U}(t) = N_{\rm U}(0) \cdot e^{-\lambda \cdot t} \Leftrightarrow N_{\rm U}(0) = N_{\rm U}(t) \cdot e^{\lambda \cdot t} 
$$

 Für die Anzahl der Bleiisotope ergibt sich dann 

$$
 N_{\rm Pb}(t) = N_{\rm U}(0) - N_{\rm U}(t) = N_{\rm U}(t) \cdot e^{\lambda \cdot t} - N_{\rm U}(t) = N_{\rm U}(t) \cdot \left( e^{\lambda \cdot t} - 1 \right) 
$$

 Löst man diese Gleichung nach $ t $ auf, so ergibt sich 

$$
 N_{\rm Pb}(t) = N_{\rm U}(t) \cdot \left( e^{\lambda \cdot t} - 1 \right) \Leftrightarrow e^{\lambda \cdot t} = 1 + \frac{N_{\rm Pb}(t)}{N_{\rm U}(t)} \Leftrightarrow \lambda \cdot t = \ln \left( 1 + \frac{N_{\rm Pb}(t)}{N_{\rm U}(t)} \right) \Leftrightarrow t = \frac{1}{\lambda} \cdot \ln \left( 1 + \frac{N_{\rm Pb}(t)}{N_{\rm U}(t)} \right) 
$$

 Mit $ \lambda = \frac{\ln(2)}{T_{1/2}} $ ergibt sich schließlich 

$$
 t = \frac{T_{1/2}}{\ln(2)} \cdot \ln \left( 1 + \frac{N_{\rm Pb}(t)}{N_{\rm U}(t)} \right) \quad (1) 
$$


c)

Für das Verhältnis der Teilchenmassen ergibt sich 

$$
 \frac{m_{^{206}\rm{Pb}}}{m_{^{238}\rm{U}}} = \frac{N_{\rm Pb}(t) \cdot m_{\rm A}(^{206}\rm{Pb})}{N_{\rm U}(t) \cdot m_{\rm A}(^{238}\rm{U})} \Leftrightarrow \frac{N_{\rm Pb}(t)}{N_{\rm U}(t)} = \frac{m_{\rm A}(^{238}\rm{U})}{m_{\rm A}(^{206}\rm{Pb})} \cdot \frac{m_{^{206}\rm{Pb}}}{m_{^{238}\rm{U}}} = \frac{238\,\rm u}{206\,\rm u} \cdot 0{,}77 = 0{,}89 \quad (2) 
$$

 Setzt man $(2)$ in $(1)$ ein und benutzt die Halbwertszeit von $ ^{238}\rm U $ von $ 4{,}5 \cdot 10^9\,\rm a $, so ergibt sich 

$$
 t = \frac{T_{1/2}}{\ln(2)} \cdot \ln(1 + 0{,}89) 
$$

Einsetzen der gegebenen Werte liefert (mit zwei gültigen Ziffern Genauigkeit)

$$
 t = \frac{4{,}5 \cdot 10^9\,\rm a}{\ln(2)} \cdot \ln(1 + 0{,}89) = 4{,}1 \cdot 10^9\,\rm a 
$$


d)

Die Halbwertszeit für den Zerfall von $ ^{235}\rm U $ ist $ 7{,}0 \cdot 10^8\,\rm a $. Damit ergibt sich 

$$
 N'_{\rm Pb}(t) = N'_{\rm U}(t) \cdot \left( e^{\lambda' \cdot t} - 1 \right) \Leftrightarrow \frac{N'_{\rm Pb}(t)}{N'_{\rm U}(t)} = e^{\lambda' \cdot t} - 1 = e^{\frac{\ln(2)}{T'_{1/2}} \cdot t} - 1 
$$

 Einsetzen der gegebenen Werte liefert (mit zwei gültigen Ziffern Genauigkeit) 

$$
 \frac{N'_{\rm Pb}(4{,}1 \cdot 10^9\,\rm a)}{N'_{\rm U}(4{,}1 \cdot 10^9\,\rm a)} = e^{\frac{\ln(2)}{7{,}0 \cdot 10^8\,\rm a} \cdot 4{,}1 \cdot 10^9\,\rm a} - 1 = 57 \quad (3) 
$$

 und damit 

$$
 \frac{m_{^{207}\rm{Pb}}}{m_{^{235}\rm{U}}} = \frac{N'_{\rm Pb}(4{,}1 \cdot 10^9\,\rm a) \cdot m_{\rm A}(^{207}\rm{Pb})} {N'_{\rm U}(4{,}1 \cdot 10^9\,\rm a) \cdot m_{\rm A}(^{235}\rm{U})} = 57 \cdot \frac{207\,\rm u}{235\,\rm u} = 50 
$$


e)

Darstellung eines Massenspektrometers z.B. nach [THOMSON](/node/7699) oder [BAINBRIDGE.](/node/8000)

## Grundwissen
- [Altersbestimmung mit der Radiocarbonmethode](https://www.leifiphysik.de/kern-teilchenphysik/anwendungen-der-kernphysik/grundwissen/altersbestimmung-mit-der-radiocarbonmethode)
