# Positronen-Emissions-Tomographie (Abitur BY 2005 LK A4-1)

Quelle: https://www.leifiphysik.de/kern-teilchenphysik/anwendungen-der-kernphysik/aufgabe/positronen-emissions-tomographie-abitur-2005-lk-a4-1
Originaldatei: `curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/abi/Physik/input/leifiphysik_abitur/pages/kern-teilchenphysik/anwendungen-der-kernphysik/aufgabe/positronen-emissions-tomographie-abitur-2005-lk-a4-1.html`
Schwierigkeitsgrad: mittelschwere Aufgabe

## Aufgabe

Ein diagnostisches Verfahren der Nuklearmedizin ist die sogenannte Positronen-Emissions-Tomographie (PET). Hierfür benötigt man künstlich erzeugte $\beta^{+}$-Strahler mit nicht zu langer Halbwertszeit, die leicht in geeignete Trägersubstanzen ("Tracer") eingebaut werden können. Diese Eigenschaften besitzt Kohlenstoff-Iosotop${}^{11}{\rm{C}}$- dessen Atommasse $11{,}011433\,\rm{u}$ beträgt.

${}^{11}{\rm{C}}$ lässt sich durch Bestrahlung von ruhenden ${}^{14}{\rm{N}}$-Atomen mit Protonen der Geschwindigkeit $v_{\rm{p}} = 2{,}8 \cdot 10^7\,\frac{\rm{m}}{\rm{s}}$ erzeugen. Für die beiden folgenden Teilaufgaben genügt eine nicht-relativistische Rechnung.

**Hinweis:** Die hier angegebene Atommasse wurde der AME2016 des [AMDC-Atomic Mass Data Center](https://www-nds.iaea.org/amdc/) entnommen.

a)

Stelle die Gleichung dieser Kernreaktion auf.

Begründe durch eine Energiebetrachtung, dass Protonen der Geschwindigkeit $v_{\rm p}$ für die Erzeugung von ${}^{11}{\rm{C}}$ aus ${}^{14}{\rm{N}}$ geeignet sind. (6 BE)

b)

Die Protonen zur Produktion von ${}^{11}{\rm{C}}$ sollen in einem Zyklotron auf die Geschwindigkeit $v_{\rm{p}}$ beschleunigt werden. Die magnetische Flussdichte im Zyklotron beträgt $1{,}0\,\rm{T}$.

Berechne die Umlauffrequenz der Protonen im Zyklotron und den maximalen Bahnradius. (6 BE)

Das erzeugte ${}^{11}{\rm{C}}$ wird chemisch aufbereitet und dem zu untersuchenden Patienten verabreicht. Bei den meisten Zerfällen von ${}^{11}{\rm{C}}$ entstehen Positronen, die innerhalb einer Strecke von wenigen Millimetern vollständig abgebremst werden.

c)

Gib die Zerfallsgleichung für den $\beta^{+}$-Zerfall von ${}^{11}{\rm{C}}$ an.

Zeige, dass dieser Zerfall energetisch möglich ist. (6 BE)

d)

Das abgebremste Positron reagiert mit einem Elektron aus der Umgebung, wobei die Teilchen in zwei Photonen zerstrahlen.

Berechne deren Wellenlänge.

Begründe, warum der Zerfall in ein einziges Photon ausgeschlossen ist. (5 BE)

e)

![](https://www.leifiphysik.de/sites/default/files/2023/12/image/Positronen-Emissions-Tomographie.svg)

Abb. 1 Skizze zu Aufgabenteil e)

[CC-BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/deed.de) / FWU Institut für Film und Bild;

In der in Abb. 1 gezeigten Anordnung treffen die beiden Photonen aus der Vernichtung eines Elektron-Positron-Paares auf zwei geeignete Detektoren im Abstand $60\,\rm{cm}$. Detektor 1 spricht um $0{,}80\,\rm{ns}$ später an als Detektor 2.

Bestimme den Zerfallsort und gib ihn eindeutig an.

Begründe kurz dein Vorgehen. (5 BE)

f)

Gib an, welche andere Umwandlung eines ${}^{11}{\rm{C}}$-Atoms in ${}^{11}{\rm{B}}$ neben dem $\beta^{+}$-Zerfall noch möglich ist.

Beschreibe diese Umwandlun.

Gib die zugehörige Reaktionsgleichung an.

Gib an, welche ionisierende Strahlung dabei auftritt. (6 BE)

## Lösung

**Hinweis:** Bei dieser Lösung von LEIFIphysik handelt es sich nicht um den amtlichen Lösungsvorschlag des bayr. Kultusministeriums.

a)

Die Kernreaktionsgleichung lautet 

$$
 {}_7^{14}\rm N + {}_1^1\rm H \to {}_6^{11}\rm C + {}_2^4\rm He 
$$

 Der $Q$-Wert berechnet sich zu 

$$
 \begin{aligned} Q &= \Delta m \cdot c^2 \\ &= \Bigl[ m_{\rm A}({}_7^{14}\rm N) + m_{\rm A}({}_1^1\rm H) - m_{\rm A}({}_6^{11}\rm C) - m_{\rm A}({}_2^4\rm He) \Bigr] \cdot c^2 \\ &= [14{,}003074\,\rm u + 1{,}007825\,\rm u - 11{,}011433\,\rm u - 4{,}002603\,\rm u] \cdot c^2 \\ &= -0{,}003137\,{\rm u} \cdot c^2 \\ &= -0{,}003137 \cdot 931{,}49\,\rm MeV \\ &= -2{,}92\,\rm MeV \end{aligned} 
$$

 Es handelt sich also um eine endotherme Reaktion.

Die kinetische Energie des Protons berechnet sich aus 

$$
 E_{\rm kin,p} = \frac{1}{2} m_{\rm p,0} v_{\rm p}^2 
$$

Einsetzen der gegebenen Werte liefert (mit zwei gültigen Ziffern Genauigkeit)

$$
 E_{\rm kin,p} = \frac{1}{2} \cdot 1{,}67262 \cdot 10^{-27}\,\rm kg \cdot (2{,}8 \cdot 10^7\,\frac{\rm m}{\rm s})^2 = 6{,}6 \cdot 10^{-13}\,\rm J = 4{,}1\,\rm MeV 
$$

 Da die kinetische Energie des Protons größer als der Betrag des $Q$-Wertes ist, kann die Reaktion eintreten.

b)

Für die Kreisbewegung gilt 

$$
 \frac{1}{f} = T = \frac{2 \pi r}{v} \Leftrightarrow f = \frac{v}{2 \pi r} \quad (1) 
$$

 Da die LORENTZ-Kraft als Zentripetalkraft wirkt, gilt 

$$
 F_{\rm L} = F_{\rm ZP} \Leftrightarrow e \cdot v_{\rm p} \cdot B = \frac{m_{\rm p} \cdot v_{\rm p}^2}{r} \Leftrightarrow \frac{v_{\rm p}}{r} = \frac{e \cdot B}{m_{\rm p}} \quad (2) 
$$

 Setzt man $(2)$ in $(1)$ ein, so ergibt sich die Frequenz zu 

$$
 f = \frac{e \cdot B}{2\,\pi \cdot m_{\rm p}}
$$

Einsetzen der gegebenen Werte liefert (mit zwei gültigen Ziffern Genauigkeit)

$$
 f= \frac{1{,}6 \cdot 10^{-19}\,\rm As \cdot 1{,}0\,\rm T} {2 \pi \cdot 1{,}7 \cdot 10^{-27}\,\rm kg} = 1{,}5 \cdot 10^7\,\rm Hz 
$$

 Aus $(2)$ ergibt sich dann der Bahnradius zu 

$$
 \frac{v_{\rm p}}{r} = \frac{e \cdot B}{m_{\rm p}} \Leftrightarrow r = \frac{m_{\rm p} \cdot v_{\rm p}}{e \cdot B}
$$

Einsetzen der gegebenen Werte liefert (mit zwei gültigen Ziffern Genauigkeit)

$$
 r= \frac{1{,}7 \cdot 10^{-27}\,\rm kg \cdot 2{,}8 \cdot 10^7\,\frac{\rm m}{\rm s}} {1{,}6 \cdot 10^{-19}\,\rm As \cdot 1{,}0\,\rm T} = 0{,}29\,\rm m 
$$


c)

Die Kernreaktionsgleichung für den $\beta^{+}$-Zerfall lautet 

$$
 {}_6^{11}\rm C \to {}_5^{11}\rm B + {}_1^0\rm e^+ + {}_0^0\nu_e 
$$

 Der $Q$-Wert berechnet sich zu 

$$
 \begin{aligned} Q &= \Delta m \cdot c^2 \\ &= \Bigl[ m_{\rm A}({}_6^{11}\rm C) - m_{\rm A}({}_5^{11}\rm B) - 2 m_{0,\rm e} \Bigr] \cdot c^2 \\[6pt] &= [11{,}011433\,\rm u - 11{,}009305\,\rm u - 2 \cdot 5{,}48580 \cdot 10^{-4}\,\rm u] \cdot c^2 \\[6pt] &= 1{,}03084 \cdot 10^{-3}\,{\rm u} \cdot c^2 \\ &= 1{,}03084 \cdot 10^{-3} \cdot 931{,}49\,\rm MeV \\ &= 0{,}96\,\rm MeV \end{aligned} 
$$

 Da der $Q$-Wert positiv ist, ist der $\beta^{+}$-Zerfall energetisch möglich.

d)

Nachdem die kinetische Energie von Elektron und Positron zu vernachlässigen ist, besitzen die beiden Gammaquanten jeweils die Energie $0{,}511\,\rm MeV$ (Ruheenergie des Elektrons bzw. Positrons). 

$$
 E_\gamma = \frac{h \cdot c}{\lambda} \Leftrightarrow \lambda = \frac{h \cdot c}{E_\gamma} 
$$

Einsetzen der gegebenen Werte liefert (mit zwei gültigen Ziffern Genauigkeit)

$$
\lambda = \frac{6{,}63 \cdot 10^{-34}\,\rm J\,s \cdot 2{,}998 \cdot 10^8\,\frac{\rm m}{\rm s}} {0{,}511 \cdot 10^6 \cdot 1{,}602 \cdot 10^{-19}\,\rm eV} = 2{,}43 \cdot 10^{-12}\,\rm m 
$$

 Aufgrund der zu vernachlässigenden kinetischen Energie der Ausgangsprodukte ist auch der Impuls vor der Reaktion nahezu Null. Entstünde nur ein einziges Photon, so könnte der Impuls nach der Reaktion wegen eines Widerspruchs zum Impulserhaltungssatz nicht Null sein.

e)

Aufgrund des Impulserhaltungssatzes werden die beiden Photonen in entgegengesetzter Richtung emittiert. Sprechen die Detektoren an, so muss der Entstehungsort der Quanten auf der Verbindungslinie der Detektoren liegen. Der Laufstreckenunterschied berechnet sich dann zu 

$$
 \Delta x = c \Delta t 
$$

 Einsetzen der gegebenen Werte liefert (mit zwei gültigen Ziffern Genauigkeit) 

$$
 \Delta x = 2{,}99 \cdot 10^8\,\frac{\rm m}{\rm s} \cdot 0{,}80 \cdot 10^{-9}\,\rm s = 0{,}24\,\rm m 
$$

 Der Entstehungsort ist also etwa $18\,\rm cm$ von Detektor 2 entfernt.

f)

Neben dem $\beta^{+}$-Zerfall ist auch noch der Elektroneneinfang-Prozess (EC) möglich. Dabei wandelt sich ein Kernproton in ein Kernneutron und ein Neutrino um. Das erforderliche Elektron stammt in der Regel aus der K-Schale der Hülle vom Kohlenstoffatom. Beim Auffüllen der entstandenen Elektronenlücke kommt es zur Emission der charakteristischen Röntgenstrahlung. Die entsprechende Kernreaktionsgleichung lautet 

$$
_6^{11}{\rm{C + }}{}_{ - 1}^0{\rm{e}} \to _5^{11}{\rm{B}} + _0^0{\nu _e}
$$

 Beim Auffüllen der entstandenen Elektronenlücke kommt es zur Emission der charakteristischen Röntgenstrahlung.

## Grundwissen
- [Ionisierende Strahlung in der Medizin](https://www.leifiphysik.de/kern-teilchenphysik/anwendungen-der-kernphysik/grundwissen/ionisierende-strahlung-der-medizin)
