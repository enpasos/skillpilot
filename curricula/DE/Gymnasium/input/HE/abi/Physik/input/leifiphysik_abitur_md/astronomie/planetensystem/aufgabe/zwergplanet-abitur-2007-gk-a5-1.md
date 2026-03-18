# Zwergplanet (Abitur BY 2007 GK A5-1)

Quelle: https://www.leifiphysik.de/astronomie/planetensystem/aufgabe/zwergplanet-abitur-2007-gk-a5-1
Originaldatei: `curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/abi/Physik/input/leifiphysik_abitur/pages/astronomie/planetensystem/aufgabe/zwergplanet-abitur-2007-gk-a5-1.html`
Schwierigkeitsgrad: mittelschwere Aufgabe

## Aufgabe

Im Jahr 2005 wurde auf Himmelsaufnahmen aus dem Jahr 2003 ein planetenähnliches Objekt entdeckt, das sich auf einer stark exzentrischen Bahn um die Sonne bewegt. Dieses Objekt wurde im August 2006 in die neue Gruppe der Zwergplaneten eingeordnet und erhielt den Namen Eris (nach der griechischen Göttin der Zwietracht). Inzwischen geht man von folgenden Daten aus: Durchmesser: $D = 2400\,\rm{km}$; Aphelentfernung: $r_{\rm{A}} = 98\,\rm{AE}$; Perihelentfernung: $r_{\rm{P}} = 38\,\rm{AE}$.

a)

Bestimme die große Halbachse der Eris-Bahn sowie die numerische Exzentrizität der Bahn.

Vergleiche letztere mit dem Wert der Plutobahn. (5 BE)

b)

Berechne, in wie vielen Jahren Eris das nächste Mal das Perihel seiner Bahn durchlaufen wird, wenn seine Sonnenentfernung zur Zeit $98\,\rm{AE}$ beträgt. (4 BE)

Etwa $3{,}6 \cdot 10^4\,\rm{km}$ vom Eris-Mittelpunkt entfernt wurde ein kleiner Mond mit dem Durchmesser von $250\,\rm{km}$ entdeckt, dessen Umlaufzeit um Eris etwa $14$ Tage beträgt.

c)

Untersuche, welche Masse sich für den Planeten Eris unter folgenden Annahmen ergibt:

- Die Mondbahn ist kreisförmig,
- die Mondmasse ist klein im Vergleich zur Erismasse. (5 BE)

d)

Bestimme die maximale scheinbare Helligkeit der Sonne für einen Beobachter auf Eris. (7 BE)

e)

Beurteile, ob es auf Eris ringförmige bzw. totale Sonnenfinsternisse geben kann. (7 BE)

f)

Untersuche, welche Temperatur auf Eris im Perihel etwa herrschen dürfte, wenn man davon ausgeht, dass $40\% $ der eingestrahlten Sonnenenergie reflektiert werden und die von Eris absorbierte Sonnenstrahlung von der gesamten Planetenoberfläche gleichmäßig wieder abgegeben wird. (6 BE)

## Lösung

**Hinweis:** Bei dieser Lösung von LEIFIphysik handelt es sich nicht um den amtlichen Lösungsvorschlag des bayr. Kultusministeriums.

a)

Für die große Halbachse gilt 

$$
 a = \frac{r_{\rm A} + r_{\rm P}}{2}
$$

Einsetzen der gegebenen Werte liefert (mit zwei gültigen Ziffern Genauigkeit)

$$
a = \frac{98 \,\rm AE + 38 \,\rm AE}{2} = 68 \,\rm AE 
$$

 Die lineare Exzentrizität beträgt 

$$
 e = r_{\rm A} - a = 98 \,\rm AE - 68 \,\rm AE = 30 \,\rm AE 
$$

 Für die numerische Exzentrizität gilt 

$$
 \varepsilon = \frac{e}{a}
$$

Einsetzen der gegebenen Werte liefert (mit zwei gültigen Ziffern Genauigkeit)

$$
 \varepsilon = \frac{30 \,\rm AE}{68 \,\rm AE} = 0{,}44 
$$

 Sie ist größer als die des Pluto mit $\varepsilon = 0{,}25$.

b)

Nach dem 3. KEPLERschen Gesetz ergibt sich 

$$
 \frac{T_{\rm Eris}^2}{T_{\rm Erde}^2} = \frac{a_{\rm Eris}^3}{a_{\rm Erde}^3} \Rightarrow T_{\rm Eris} = \sqrt{\frac{a_{\rm Eris}^3}{a_{\rm Erde}^3}} \cdot T_{\rm Erde}
$$

Einsetzen der gegebenen Werte liefert (mit zwei gültigen Ziffern Genauigkeit)

$$
T_{\rm Eris} = \sqrt{68^3} \cdot 1 \,\rm a = 5{,}6 \cdot 10^2 \,\rm a 
$$

 Die Umlaufzeit von Eris ist $5{,}6 \cdot 10^2 \,\rm a$, die Zeit vom Aphel zum Perihel ist die Hälfte, also $2{,}8 \cdot 10^2 \,\rm a$.

c)

Aus dem 3. KEPLERschen Gesetz in Verbindung mit dem NEWTONschen Gravitationsgesetz ergibt sich 

$$
 \frac{T_{\rm Mond}^2}{r_{\rm Mond}^3} = \frac{4 \pi^2}{G \cdot M_{\rm Eris}} \Rightarrow M_{\rm Eris} = \frac{4 \pi^2 \cdot r_{\rm Mond}^3}{G \cdot T_{\rm Mond}^2} 
$$

Einsetzen der gegebenen Werte liefert (mit zwei gültigen Ziffern Genauigkeit)

$$
M_{\rm Eris} = \frac{ 4 \pi^2 \cdot (3{,}6 \cdot 10^7 \,\rm m)^3 }{ 6{,}67 \cdot 10^{-11} \,\rm{\frac{m^3}{kg \cdot s^2}} \cdot (14 \cdot 24 \cdot 3600 \,\rm s)^2 } = 1{,}9 \cdot 10^{22} \,\rm kg 
$$


d)

Die maximale scheinbare Helligkeit der Sonne für einen Beobachter auf Eris ergibt sich, wenn Eris im Perihel ist. Es gilt 

$$
 m_{\rm Eris,max} - m_{\rm Erde} = -2{,}5 \cdot \log \frac{E_{\rm Eris}}{E_{\rm Erde}} 
$$

 und 

$$
 \frac{E_{\rm Eris}}{E_{\rm Erde}} = \frac{\frac{L}{4 \pi \cdot r_{\rm Eris}^2}}{\frac{L}{4 \pi \cdot r_{\rm Erde}^2}} = \frac{r_{\rm Erde}^2}{r_{\rm Eris}^2}. 
$$

 Mit $r_{\rm Eris} = r_{\rm A}$ und $r_{\rm Erde} = 1 \,\rm AE$ folgt 

$$
 m_{\rm Eris,max} = -2{,}5 \cdot \log \frac{(1 \,\rm AE)^2}{r_{\rm P}^2} + m_{\rm Erde}
$$

Einsetzen der gegebenen Werte liefert (mit zwei gültigen Ziffern Genauigkeit)

$$
m_{\rm Eris,max} = -2{,}5 \cdot \log \frac{1}{38^2} - 26{,}8 = -19. 
$$


e)

Der Öffnungswinkel (im Bogenmaß), unter dem man auf Eris den Mond sieht, ist 

$$
 \alpha_{\rm Mond} = \frac{D_{\rm Mond}}{r_{\rm Mond} - \frac{1}{2} D_{\rm Eris}} 
$$

Einsetzen der gegebenen Werte liefert (mit zwei gültigen Ziffern Genauigkeit)

$$
 \alpha_{\rm Mond} = \frac{250 \,\rm km}{36000 \,\rm km - 1200 \,\rm km} = 7{,}2 \cdot 10^{-3}. 
$$

 Der Öffnungswinkel (im Bogenmaß), unter dem man auf Eris im Perihel die Sonne sieht, ist 

$$
 \alpha_{\rm Sonne,Perihel} = \frac{D_{\rm Sonne}}{r_{\rm P}} 
$$

Einsetzen der gegebenen Werte liefert (mit zwei gültigen Ziffern Genauigkeit)

$$
\alpha_{\rm Sonne,Perihel} = \frac{2 \cdot 6{,}96 \cdot 10^5 \,\rm km}{38 \cdot 1{,}5 \cdot 10^8 \,\rm km} = 2{,}4 \cdot 10^{-4}. 
$$

 Der größte Winkel, unter dem man auf Eris die Sonne sieht, ist viel kleiner als der Winkel, unter dem man den Mond sieht. Deshalb gibt es dort bei geeigneter Lage eventuell totale Sonnenfinsternis, aber keine Ringfinsternis.

f)

Die abgestrahlte Leistung muss gleich der eingestrahlten Leistung sein. Die eingestrahlte Leistung ergibt sich aus der Solarkonstante mittels des quadratischen Abstandsgesetzes und dem Absorptionsfaktor von $0{,}6$. Die abgestrahlte Leistung ergibt sich nach dem Stefan-Boltzmann-Gesetz: 

$$
 P_{\rm ein} = P_{\rm ab} \Rightarrow 0{,}6 \cdot R^2 \cdot \pi \cdot S \cdot \frac{1 \,\rm AE^2}{r_{\rm P}^2} = \sigma \cdot 4 \cdot R^2 \cdot \pi \cdot T^4 \Rightarrow T = \sqrt[4]{\frac{0{,}6 \cdot S}{\sigma \cdot 4 \cdot 38^2}}. 
$$

 Einsetzen der gegebenen Werte liefert 

$$
 T = \sqrt[4]{ \frac{ 0{,}6 \cdot 1360 \,\rm{\frac{W}{m^2}} }{ 5{,}67 \cdot 10^{-8} \,\rm{\frac{W}{m^2 K^4}} \cdot 4 \cdot 38^2 } } = 40 \,\rm K. 
$$


## Grundwissen
- [Drittes KEPLERsches Gesetz](https://www.leifiphysik.de/astronomie/planetensystem/grundwissen/drittes-keplersches-gesetz)
