# Zyklotron (Abitur BY 1993 LK A2-2)

Quelle: https://www.leifiphysik.de/elektrizitaetslehre/bewegte-ladungen-feldern/aufgabe/zyklotron-abitur-1993-lk-a2-2
Originaldatei: `curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/abi/Physik/input/leifiphysik_abitur/pages/elektrizitaetslehre/bewegte-ladungen-feldern/aufgabe/zyklotron-abitur-1993-lk-a2-2.html`
Schwierigkeitsgrad: schwere Aufgabe

## Aufgabe

![](https://www.leifiphysik.de/sites/default/files/images/8955fa18d09be8938d3b5d7be1a91c89/315zyklotron-abitur-by-1993-lk-a2-2_skizze.gif)

Abb. 1 Skizze zur Aufgabe

[CC-BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/deed.de) / FWU Institut für Film und Bild;

Mit dem sogenannten klassischen Zyklotron lassen sich Teilchengeschwindigkeiten bis zu $v=0{,}1\,c$ erreichen.

a)

Erläutere die Wirkungsweise des abgebildeten Zyklotrons. Gehe dabei u.a. auf die in der Skizze markierten Bauteile ein. (9 BE)

b)

Zeige, dass beim klassischen Zyklotron die Zeit $T_0$, die ein Teilchen mit der Ladung $q$ und der Masse $m$ zum Durchlaufen eines Duanten (D1, D2) benötigt, unabhängig von $r$ ist. (6 BE)

c)

Berechne die Radien $r_n$ der Halbkreisbahnen im oberen Duanten D1 in Abhängigkeit von der Zahl der Umläufe $n$. Gehe dabei von folgendem aus: Ein Teilchen tritt in den oberen Duanten D1 mit der Anfangsenergie $W_1$ ein und beschreibt dort eine Halbkreisbahn mit Radius $r_1$. Es nimmt bei jedem Durchlaufen des Spaltes die Energie $\Delta E = W_1$ auf.

Zeige anhand des Ergebnisses, dass die äquidistante Bahndarstellung in der Skizze nicht realistisch ist. (8 BE)

d)

In einem Zyklotron sollen Protonen auf die Geschwindigkeit $v=0{,}1\,c$ gebracht werden. Die magnetische Feldstärke beträgt $B_0=0{,}40\,\rm{T}$.

Berechne (nichtrelativistisch)

- die Frequenz $f_0$ der beschleunigenden Wechselspannung,
- den Durchmesser der äußersten Teilchenbahn sowie
- die erreichte kinetische Energie der Protonen in $\rm{MeV}$. (6 BE)

Relativistische Effekte begrenzen die in einem klassischen Zyklotron erreichbare kinetische Energie.

e)

Zeige dies, indem du ausrechnest, um wie viel Prozent bei den Protonen der Teilaufgabe d) die Umlauffrequenz auf der äußersten Bahn von $f_0$ abweicht. (9 BE)

Beim sogenannten Synchrozyklotron wird die Frequenz des beschleunigenden Wechselfeldes an die Umlauffrequenz des Teilchens angepasst.

f)

Berechne, welchen Durchmesser ein Synchrozyklotron mit der magnetischen Feldstärke $B=1{,}00\,\rm{T}$ mindestens haben muss, wenn Protonen auf $150\,\rm{MeV}$ beschleunigt werden sollen. (12 BE)

## Lösung

**Hinweis:** Bei dieser Lösung von LEIFIphysik handelt es sich nicht um den amtlichen Lösungsvorschlag des bayr. Kultusministeriums.

a)

Beim Normalzyklotron liegt eine hochfrequente Wechselspannung konstanter Frequenz zwischen den Duanten an. Die Duanten-Anordnung befindet sich in einer Vakuumkammer. Senkrecht zur Ebene, in der die Duanten liegen, wirkt ein starkes homogenes Magnetfeld, erzeugt durch Spulen mit Joch. Dieses zwingt die von der Teilchenquelle ausgehenden Ladungsträger auf Kreisbahnen. Die Beschleunigung der - von der im Zentrum liegenden Teilchenquelle ausgehenden - Ladungen erfolgt im Raum zwischen den Duanten. Bei der Kreisbewegung muss ständig die Richtung der geladenen Teilchen geändert werden. Dazu ist die sogenannte Kreisbeschleunigung erforderlich, die jedoch den Geschwindigkeitsbetrag der Teilchen nicht erhöht. Beschleunigte Ladung strahlen aber elektromagnetische Energie ab. Dies ist ein Nachteil der Kreisbeschleuniger.

b)

Die LORENTZ-Kraft wirkt als Zentripetalkraft. Daraus ergibt sich 

$$
 F_{\rm L} = F_{\rm ZP} \Leftrightarrow q \cdot v \cdot B = \frac{m \cdot v^2}{r} \Leftrightarrow r = \frac{m \cdot v}{q \cdot B} \quad (1) 
$$

 Setzt man nun dies in $\Delta t = \frac{r \cdot \pi}{v}$ ein, so erhält man für $ T_0 $ 

$$
 T_0 = \Delta t = \frac{m \cdot v \cdot \pi}{q \cdot B \cdot v} = \frac{m \cdot \pi}{q \cdot B} 
$$

 was unabhängig von $ r $ ist.

c)

Aus dem Energieerhaltungssatz gilt nach $n$ Umläufen und der dadurch bedingten $2 \cdot n - 1$ Energiezufuhr 

$$
 \frac{1}{2} \cdot m_0 \cdot v_n^2 = (2 \cdot n - 1) \cdot W_1 \Rightarrow v_n = \sqrt{\frac{2 \cdot (2 \cdot n - 1) \cdot W_1}{m_0}} 
$$

 Setzt man dies in Gleichung $(1)$ ein, so erhält man 

$$
 r_n = \frac{m_0}{q \cdot B} \cdot \sqrt{\frac{2 \cdot (2 \cdot n - 1) \cdot W_1}{m_0}} 
$$

 Daraus ergibt sich 

$$
 r_1 : r_2 : r_3 : \dots : r_n = 1 : \sqrt{3} : \sqrt{5} : \sqrt{7} : \dots : \sqrt{2 \cdot n - 1} 
$$

 Hieraus wird klar, dass die Radien nicht äquidistant sind.

d)

Mit $ T = 2 \cdot \Delta t $ ($\Delta t$ aus Teilaufgabe b)) ergibt sich 

$$
 f_0 = \frac{1}{T} = \frac{1}{2 \cdot \Delta t} = \frac{1}{2 \cdot \frac{m \cdot \pi}{q \cdot B}} = \frac{q \cdot B}{2 \cdot \pi \cdot m} 
$$

 und nach Einsetzen der gegebenen Werte ergibt sich (mit zwei gültigen Ziffern Genauigkeit) 

$$
 f_0 = \frac{1{,}60 \cdot 10^{-19}\,\rm{As \cdot 0{,}40\,T}}{2 \cdot \pi \cdot 1{,}67 \cdot 10^{-27}\,\rm{kg}} = 6{,}1 \cdot 10^6\,\rm{Hz} = 6{,}1\,\rm{MHz} 
$$

 Aus $ d = 2 \cdot r = 2 \cdot \frac{m \cdot v}{q \cdot B} $ erhält man durch Einsetzen der gegebenen Werte (mit zwei gültigen Ziffern Genauigkeit) 

$$
 d = 2 \cdot \frac{1{,}67 \cdot 10^{-27}\,\rm{kg \cdot 0{,}1 \cdot 3{,}0 \cdot 10^8\,m/s}}{1{,}60 \cdot 10^{-19}\,\rm{As \cdot 0{,}40\,T}} = 1{,}6\,\rm m 
$$

 sowie 

$$
 E_{\rm kin} = \frac{1}{2} \cdot m_0 \cdot v^2 
$$

Einsetzen der gegebenen Werte liefert (mit zwei gültigen Ziffern Genauigkeit)

$$
E_{\rm kin} = \frac{1}{2} \cdot 1{,}67 \cdot 10^{-27}\,\rm{kg} \cdot \left( 0{,}1 \cdot 3{,}0 \cdot 10^8\,\frac{\rm m}{\rm s} \right)^2 = 7{,}5 \cdot 10^{-13}\,\rm J = 4{,}7\,\rm{MeV} 
$$


e)

Man berechnet 

$$
 p\,\% = \frac{f_{\rm rel}}{f_0} = \frac{\frac{e \cdot B_0}{2 \cdot \pi \cdot m_{\rm rel}}}{\frac{e \cdot B_0}{2 \cdot \pi \cdot m_0}} = \frac{m_0}{m_{\rm rel}} = \sqrt{1 - \left( \frac{v}{c} \right)^2} 
$$

Einsetzen der gegebenen Werte liefert (mit zwei gültigen Ziffern Genauigkeit)

$$
p\,\% = \sqrt{1 - 0{,}1^2} = 0{,}995 
$$

 woraus sich eine Abweichung von $ 0{,}5\,\% $ ergibt.

f)

Aus Teilaufgabe b) erhält man $ r = \frac{m \cdot v}{e \cdot B} = \frac{p}{e \cdot B} $ und aus der Energie-Impulsbeziehung $ p = \frac{\sqrt{E^2 - E_0^2}}{c} $ mit $ E = E_{\rm kin} + E_0 $ folgt 

$$
 d = 2 \cdot \frac{\sqrt{(E_{\rm kin} + E_0)^2 - E_0^2}}{c \cdot e \cdot B} 
$$

 Einsetzen der gegebenen Werte liefert (mit drei gültigen Ziffern Genauigkeit) 

$$
 d = 2 \cdot \frac{\sqrt{(150\,\rm{MeV} + 938\,\rm{MeV})^2 - 938\,\rm{MeV}^2}}{3{,}00 \cdot 10^8\,\frac{\rm m}{\rm s} \cdot 1{,}60 \cdot 10^{-19}\,\rm{As \cdot 1{,}00\,T}} = 3{,}68\,\rm m 
$$


## Grundwissen
- [Geladene Teilchen im magnetischen Querfeld](https://www.leifiphysik.de/elektrizitaetslehre/bewegte-ladungen-feldern/grundwissen/geladene-teilchen-im-magnetischen-querfeld)
