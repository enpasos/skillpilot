# Der Ringbeschleuniger LHC (Abitur BY 2015 Ph11 A1-2)

Quelle: https://www.leifiphysik.de/elektrizitaetslehre/bewegte-ladungen-feldern/aufgabe/der-ringbeschleuniger-lhc-abitur-2015-ph11-a1-2
Originaldatei: `curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/abi/Physik/input/leifiphysik_abitur/pages/elektrizitaetslehre/bewegte-ladungen-feldern/aufgabe/der-ringbeschleuniger-lhc-abitur-2015-ph11-a1-2.html`
Schwierigkeitsgrad: mittelschwere Aufgabe

## Aufgabe

Vorbeschleunigte Protonen treten mit der Anfangsenergie $E_{\rm{min}} = 0{,}450\,\rm{TeV}$ in den ringförmigen Beschleuniger LHC ein. Im LHC werden die Protonen durch hochfrequente elektrische Felder in der Zeit $\Delta t=20{,}0\,\rm{min}$ weiter auf die Endenergie $E_{\rm{max}} = 4{,}00\,\rm{TeV}$ beschleunigt. Hierbei wird vereinfachend angenommen, dass die Teilchen durch ein homogenes Magnetfeld stets auf der gleichen Kreisbahn mit Radius $r=4{,}24\,\rm{km}$ gehalten werden.

a)

Zeige, dass für ein Proton mit Anfangsenergie $E_{\rm{min}}$ der LORENTZ-Faktor $\gamma = 480$ beträgt.

Weise rechnerisch nach, dass sich ein Proton bereits beim Eintritt in den LHC näherungsweise mit Lichtgeschwindigkeit $c$ bewegt. (8 BE)

Vereinfachend wird im Folgenden für die Geschwindigkeit der Protonen während der gesamten Zeit $\Delta t$ die Näherung $v=c$ verwendet.

b)

Die Flussdichte $B$ des Magnetfeldes steigt in der Zeit $\Delta t$ vom Wert $B_{\rm{min}}$ kontinuiertlich auf den Wert $B_{\rm{max}}$ an.

Zeige, dass für die Energie $E$ eines Protons näherungsweise $E=r \cdot e \cdot c \cdot B$ gilt, und berechnen Sie $B_{\rm{max}}$. (6 BE)

c)

Berechne die Anzahl der Umläufe bis zum Erreichen von $E_{\rm{max}}$ und die Energie, die einem Proton pro Umlauf durchschnittlich zugeführt wird. Gehe dabei von der vereinfachenden Annahme aus, dass ein Proton Energie, die ihm einmal zugeführt wurde, nicht wieder abgibt. [zur Kontrolle: $263\,\rm{keV}$] (6 BE)

Tatsächlich gibt ein kreisendes Proton elektromagnetische Strahlung ab. Für die Energie $E_{\rm{S}}$ der sogenannten Synchrotronstrahlung, die ein Teilchen (Ladung $q$, Ruheenergie $E_0$) mit konstant angenommener Energie $E$ während des Umlaufs abstrahlt, gilt die Beziehung: 

$$
E_{\rm{S}}=\frac{q^2}{3\cdot \epsilon_0 \cdot r}\cdot \left( \frac{E}{E_0} \right)^4
$$


d)

Berechne die Energie, die einem Proton mit Endenergie $E_{max}$ pro Umlauf zugeführt werden muss, um die Energieabgabe durch Synchrotronstrahlung auszugleichen.

Begründe, ob die in Teilaufgabe **c)** getroffene vereinfachende Annahme gerechtfertigt war. [zur Kontrolle: $0{,}470\, \rm{keV}$] (5 BE)

Der Ringtunnel des LHC wurde ursprünglich für einen anderen Beschleuniger, den "Large Elektron Positron Collider" (LEP), erbaut. Im LEP wurden Elektronen und Positronen bei hoher Energie zur Kollision gebracht.

e)

Vergleiche quantitativ die beiden Beschleuniger im Hinblick auf die Energieabgabe durch Synchrotronstrahlung. Gehe davon aus, dass die Protonen die gleiche Energie $E$ wie die Elektronen bzw. Positronen haben. (5 BE)

## Lösung

**Hinweis:** Bei dieser Lösung von LEIFIphysik handelt es sich nicht um den amtlichen Lösungsvorschlag des bayr. Kultusministeriums.

a)

Für die Gesamtenergie $E$ eines Teilchens gilt - relativistisch korrekt - die EINSTEINsche Energieformel 

$$
 E = m \cdot c^2 \Rightarrow E_0 + E_{\rm kin} = \frac{m_0 \cdot c^2}{\sqrt{1 - \left( \frac{v}{c} \right)^2}} \Rightarrow E_0 + E_{\rm kin} = \gamma \cdot m_0 \cdot c^2 
$$

 Da die Ruheenergie der Protonen $E_0 = 0{,}93827 \,\mathrm{GeV}$ wesentlich kleiner ist als deren kinetische Energie $E_{\rm kin} = 450 \,\mathrm{GeV}$ gilt näherungsweise 

$$
 E_{\rm kin} \approx \gamma \cdot m_0 \cdot c^2 \Leftrightarrow \gamma \approx \frac{E_{\rm kin}}{m_0 \cdot c^2} \Rightarrow \gamma \approx \frac{450}{0{,}938} \approx 480 
$$


b)

Im homogen angenommenen Magnetfeld durchlaufen die Protonen Kreisbahnen, auf denen die LORENTZ-Kraft als Zentripetalkraft wirkt. Damit gilt 

$$
 F_{\rm ZP} = F_{\rm L} \Leftrightarrow \frac{m \cdot v^2}{r} = e \cdot v \cdot B 
$$

 Wegen $v \approx c$ ergibt sich 

$$
 \frac{m \cdot c^2}{r} = e \cdot c \cdot B \Leftrightarrow m \cdot c^2 = r \cdot e \cdot c \cdot B \Leftrightarrow E = r \cdot e \cdot c \cdot B 
$$

 Weiter berechnet sich die Magnetische Flussdichte $B_{\rm max}$, um die Teilchen mit der maximalen Energie $E_{\rm max}$ auf der Kreisbahn zu halten, durch 

$$
 E_{\rm max} = r \cdot e \cdot c \cdot B_{\rm max} \Leftrightarrow B_{\rm max} = \frac{E_{\rm max}}{r \cdot e \cdot c} 
$$

 Einsetzen der gegebenen Werte liefert 

$$
 B_{\rm max} = \frac{4{,}00 \cdot 10^{12} \cdot 1{,}60 \cdot 10^{-19} \,\rm As \cdot V}{4{,}24 \cdot 10^3 \,\rm m \cdot 1{,}60 \cdot 10^{-19} \,\rm As \cdot 2{,}997 \cdot 10^8 \,\frac{\rm m}{\rm s}} = 3{,}15 \,\rm T 
$$


c)

Für die Berechnung der Zahl der Umläufe $N$ kann man näherungsweise davon ausgehen, dass sich die Teilchen mit nahezu Lichtgeschwindigkeit auf Kreisbahnen mit konstantem Radius bewegen. Es gilt 

$$
 N \cdot 2 \cdot \pi \cdot r = c \cdot \Delta t \Leftrightarrow N = \frac{c \cdot \Delta t}{2 \cdot \pi \cdot r} \Rightarrow N = \frac{2{,}997 \cdot 10^8 \,\frac{\rm m}{\rm s} \cdot 20{,}0 \cdot 60 \,\rm s}{2 \cdot \pi \cdot 4{,}24 \cdot 10^3 \,\rm m} = 1{,}35 \cdot 10^7 
$$

 Berechnung der Energiezunahme $\Delta E$ pro Umlauf: 

$$
 \Delta E = \frac{E_{\rm max} - E_{\rm min}}{N} \Rightarrow \Delta E = \frac{4{,}00 \cdot 10^{12} \,\rm eV - 0{,}450 \cdot 10^{12} \,\rm eV}{1{,}35 \cdot 10^7} = 263 \,\rm keV 
$$


d)

Zur Berechnung der zum Ausgleich der Energieabgabe durch Synchronisationsstrahlung zuzuführenden Energie pro Umlauf ($E = E_{\rm max}$) nutzt man die gegebene Formel 

$$
 E_{\rm S,max} = \frac{e^2}{3 \cdot \varepsilon_0 \cdot r} \cdot \left( \frac{E_{\rm max}}{E_0} \right)^4 
$$

 Einsetzen der gegebenen Werte liefert 

$$
 E_{\rm S,max} = \frac{(1{,}602 \cdot 10^{-19} \,\rm As)^2}{3 \cdot 8{,}854 \cdot 10^{-12} \,\frac{\rm As}{\rm Vm} \cdot 4{,}24 \cdot 10^3 \,\rm m} \cdot \left( \frac{4{,}00 \cdot 10^{12} \,\rm eV}{938{,}27 \cdot 10^6 \,\rm eV} \right)^4 = 7{,}527 \cdot 10^{-17} \,\rm J = 470 \,\rm eV 
$$

 Die bei einem Umlauf abgestrahlte Energie ($0{,}470 \,\rm keV$) ist im Vergleich zu der pro Umlauf aufgenommenen Energie eines Protons ($263 \,\rm keV$) wesentlich kleiner, so dass die vereinfachende Annahme in Teilaufgabe c) gerechtfertigt war.

e)

Bei der Formel für die durch Synchrotronstrahlung abgegebene Energie pro Umlauf geht die Ruheenergie des umlaufenden Teilchens im Nenner in vierter Potenz ein. Somit wird der Anteil der abgestrahlten Energie beim LEP wesentlich höher sein; man berechnet das Verhältnis der Ruheenergien von Proton und Elektron (bzw. Positron) durch 

$$
 \frac{E_{0,p}}{E_{0,e}} = \frac{936{,}27 \,\rm MeV}{0{,}511 \,\rm MeV} = 1{,}84 \cdot 10^3 
$$

 Geht man von gleicher Maximalenergie der betrachteten Teilchen aus, so wird der Term $\left( \frac{E_{\rm max}}{E_0} \right)^4$ um den Faktor $\left(1{,}84 \cdot 10^3 \right)^4 \approx 1{,}1 \cdot 10^{13}$ größer.

## Grundwissen
- [Geladene Teilchen im magnetischen Querfeld](https://www.leifiphysik.de/elektrizitaetslehre/bewegte-ladungen-feldern/grundwissen/geladene-teilchen-im-magnetischen-querfeld)
- [Teilchenphysikaspekte in der klassischen Physik](https://www.leifiphysik.de/kern-teilchenphysik/teilchenphysik/grundwissen/teilchenphysikaspekte-der-klassischen-physik)
