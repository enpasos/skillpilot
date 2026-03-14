# Altersbestimmung von Gesteinsproben (Abitur BY 2008 LK A4-2)

Quelle: https://www.leifiphysik.de/kern-teilchenphysik/anwendungen-der-kernphysik/aufgabe/altersbestimmung-von-gesteinsproben-abitur-2008-lk-a4-2
Originaldatei: `curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/abi/Physik/input/leifiphysik_abitur/pages/kern-teilchenphysik/anwendungen-der-kernphysik/aufgabe/altersbestimmung-von-gesteinsproben-abitur-2008-lk-a4-2.html`
Schwierigkeitsgrad: schwere Aufgabe

## Aufgabe

Die Kalium-Argon-Methode ist geeignet, das Alter von Gesteinsproben zu ermitteln. Beim Zerfall von ${}^{40}{\rm{K}}$ mit der Halbwertszeit $1{,}28 \cdot {10^9}\,{\rm{a}}$ führen $10{,}7\% $ der Zerfälle zu stabilem ${}^{40}{\rm{Ar}}$, in den übrigen Fällen entsteht stabiles ${}^{40}{\rm{Ca}}$. Beim Erhitzen des Gesteins, z. B. infolge vulkanischer Tätigkeit, entweicht das enthaltene Argon. Mit dem Erstarren des Gesteins wird das ab diesem Zeitpunkt entstehende Argon eingeschlossen und die radiologische Uhr gestartet.

Bei einer Probe aus vulkanischem Gestein wird zunächst die Masse des enthaltenen ${}^{40}{\rm{K}}$ (Atommasse ${m_{\rm{A}}} = 39{,}963591\,\rm{u}$) zu $2{,}18\,{\rm{mg}}$ gemessen. Anschließend extrahiert man das in der Probe enthaltene ${}^{40}{\rm{Ar}}$ durch starkes Erhitzen und bestimmt dessen Masse zu $184\,{\rm{\mu g}}$.

a)

Berechne, welches Alter sich für die Gesteinsprobe ergibt. (10 BE)

b)

Gib an, ob die Probe zu jung oder zu alt eingeschätzt würde, wenn das ${}^{40}{\rm{Ar}}$ durch die vulkanische Tätigkeit nicht vollständig entfernt worden wäre.

Begründe deine Antwort. (4 BE)

c)

Die Erdatmosphäre enthält in bekanntem Verhältnis Argon in Form der Isotope ${}^{36}{\rm{Ar}}$, ${}^{38}{\rm{Ar}}$ und ${}^{40}{\rm{Ar}}$. Es besteht daher die Gefahr, dass die Altersbestimmung verfälscht wird, wenn das Gestein im Laufe der Zeit ${}^{40}{\rm{Ar}}$ aus der Luft aufgenommen hat.

Erkläre, wie sich dieses Problem durch eine massenspektroskopische Analyse des Argons aus der Probe umgehen lässt.

Erläutere, welche Annahme dabei zugrunde gelegt wird. (5 BE)

**Hinweis:** Die hier angegebene Atommasse wurde der AME2016 des [AMDC-Atomic Mass Data Center](https://www-nds.iaea.org/amdc/) entnommen.

## Lösung

![LEIFIphysik Aufgabenlösung: Altersbestimmung von Gesteinsproben](https://images.sodix.de/download/480/360/ds/media/SODIX-0001128166.webp)

Lade Video...

![](data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7)

Abb. 1 Video mit Aufgabenlösung

a)

Zunächst muss aus den gegebenen Massen die jeweilige Anzahl an Teilchen berechnet werden. Daraus kann dann die Anzahl der stattgefundenen Zerfälle und schließlich die ursprünglich vorhandene Anzahl an Kaliumatomen ermittelt werden. Zur Berechnung der Teilchenzahl aus den gegebenen Massen wird angenommen, dass die Atommassen von ${}^{40}{\rm{K}}$ und ${}^{40}{\rm{Ar}}$ nahezu gleich sind ($m_{\rm{A,Ar}} \approx m_{\rm{A,K}}$).

Bestimmung der Anzahl unzerfallene Kaliumatome:

$$
N(t)_{\rm{K}} =\frac{{{m_{\rm{K}}}}}{{{m_{\rm{A,K}}}}} = \frac{{2{,}18 \cdot {{10}^{ - 6}}\,{\rm{kg}}}}{{39{,}963591 \cdot {{1{,}66}^{ - 27}}\,{\rm{kg}}}} = 3{,}29 \cdot {10^{19}}
$$


Bestimmung der Anzahl Argonatome:

$$
{N_{{\rm{Ar}}}} = \frac{{{m_{{\rm{Ar}}}}}}{{{m_{\rm{A,Ar}}}}} = \frac{{184 \cdot {{10}^{ - 9}}{\rm{kg}}}}{{39{,}963591 \cdot 1{,}66 \cdot {{10}^{ - 27}}{\rm{kg}}}} = 2{,}77 \cdot {10^{18}}
$$


Anzahl der zerfallenen Atome: 

$$
{N_{{\rm{Zerf}}}} = \frac{{{N_{{\rm{Ar}}}}}}{{0{,}107}} = \frac{{2{,}77 \cdot {{10}^{18}}}}{{0{,}107}} = 2{,}59 \cdot {10^{19}}
$$


Anzahl der Mutteratome zum Zeitpunkt des Erstarrens:

$$
{N_{{0},\rm{K}}} = {N_{{\rm{Zerf}}}} + N\left( t \right)_{\rm{K}} = 2{,}59 \cdot {10^{19}} + 3{,}29 \cdot {10^{19}} = 5{,}88 \cdot {10^{19}}
$$


Aus dem Zerfallsgesetz ergibt sich schließlich 

$$
N(t)_{\rm{K}} = {N_{{0},\rm{K}}} \cdot {e^{ - \frac{{\ln \left( 2 \right) \cdot t}}{{{T_{1/2}}}}}} \Leftrightarrow t =  - \frac{{{T_{1/2}}}}{{\ln \left( 2 \right)}} \cdot \ln \left( {\frac{N(t)_{\rm{K}}}{{N_{{0},\rm{K}}}}} \right)
$$

Einsetzen der gegebenen Werte liefert

$$
t =- \frac{{1{,}28 \cdot {{10}^9}\,{\rm{a}}}}{{\ln \left( 2 \right)}} \cdot \ln \left( {\frac{{3{,}29 \cdot {{10}^{19}}}}{{5{,}88 \cdot {{10}^{19}}}}} \right) = 1{,}07 \cdot {10^9}\,{\rm{a}}
$$


b)

Wenn in der Probe noch ${}^{40}{\rm{Ar}}$ enthalten wäre, dass bereits vor dem Erstarren des Gesteins entstanden wäre, so wäre $N_{\rm{Zerf}}$ größer als es eigentlich sein sollte. Damit ist bei gleichem $N(t)$ das angenommene $N_0$ größer und man ginge davon aus, dass das Gestein früher erstarrt wäre.

c)

Nimmt man an, dass sich das Isotopenverhältnis von ${}^{36}{\rm{Ar}}$, ${}^{38}{\rm{Ar}}$ und ${}^{40}{\rm{Ar}}$ im Laufe der Zeit nicht ändert, so bestimmt man aus den Massen von ${}^{36}{\rm{Ar}}$ und ${}^{38}{\rm{Ar}}$ die zu erwartende Masse an ${}^{40}{\rm{Ar}}$. Was über diese ${}^{40}{\rm{Ar}}$ - Masse hinausgeht, muss aus dem Zerfall von ${}^{40}{\rm{K}}$ entstanden sein und darf bei der Altersbestimmung berücksichtigt werden.

## Grundwissen
- [Altersbestimmung mit der Radiocarbonmethode](https://www.leifiphysik.de/kern-teilchenphysik/anwendungen-der-kernphysik/grundwissen/altersbestimmung-mit-der-radiocarbonmethode)
