# Elektrische Zahnbürste (Abitur BY 2017 Ph11 A2-2)

Quelle: https://www.leifiphysik.de/elektrizitaetslehre/elektromagnetische-induktion/aufgabe/elektrische-zahnbuerste-abitur-2017-ph11-a2-2
Originaldatei: `curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/abi/Physik/input/leifiphysik_abitur/pages/elektrizitaetslehre/elektromagnetische-induktion/aufgabe/elektrische-zahnbuerste-abitur-2017-ph11-a2-2.html`
Schwierigkeitsgrad: mittelschwere Aufgabe

## Aufgabe

![](https://www.leifiphysik.de/sites/default/files/2018/12/image/elektrische_zahnbuerste_2017_bild.svg)

Abb. 1 Aufbau und Funktionsweise der Ladestation einer elektrischen Zahnbürste

[CC-BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/deed.de) / FWU Institut für Film und Bild;

Im Rahmen einer W-Seminar-Arbeit wird das Funktionsprinzip einer elektrischen Zahnbürste untersucht. Deren Ladestation besteht im Wesentlichen aus einer Spule mit Eisenkern, an die eine Wechselspannung $U_{\rm{L}}$ angelegt wird. Dadurch wird im Eisenkern ein magnetisches Wechselfeld $B$ der Frequenz $f$ erzeugt, das näherungsweise durch $B\left( t \right) = {B_0} \cdot \cos \left( {2 \cdot \pi  \cdot f \cdot t} \right)$ beschrieben wird. Stellt man die Zahnbürste auf die Ladestation, so wird die in der Zahnbürste eingebaute Spule auf den Eisenkern gesteckt. Diese Sekundärspule ist über eine elektrische Schaltung mit einem Akku verbunden.

a)Erläutere, dass in der Sekundärspule eine Spannung induziert wird.

Gehe dabei auch kurz auf die Funktion des Eisenkerns ein. (5 BE)

In der Ladestation wird die Frequenz von $50\,\rm{Hz}$ (Haushaltsnetz) auf die Frequenz $f = 24\,\rm{kHz}$ erhöht. Der Scheitelwert der Flussdichte beträgt $B_0 = 1{,}5\,\rm{mT}$. Die vom Magnetfeld durchsetzte Fläche der Sekundärspule (Windungszahl $N$) beträgt $A = 0{,}80\,\rm{cm^2}$.

b)Zeige, dass für die in der Sekundärspule induzierte Spannung gilt: $U\left( t \right) = N \cdot {B_0} \cdot A \cdot 2 \cdot \pi  \cdot f \cdot \sin \left( {2 \cdot \pi  \cdot f \cdot t} \right)$. (5 BE)

Im Weiteren soll der Scheitelwert der induzierten Spannung $1{,}7\,\rm{V}$ betragen.

c)Berechne die nötige Windungszahl $N$. (3 BE)

d)Untersuche, ob man die Sekundärspule in der Praxis so modifizieren kann, dass die Zahnbürste direkt mit der Netzfrequenz $50\,\rm{Hz}$ geladen werden kann. Nimm an, dass sich der Scheitelwert $B_0$ nicht verändert. (5 BE)

In der Seminararbeit soll auch untersucht werden, ob als Energiespeicher der Akku durch einen Kondensator der Kapazität $10\,\rm{F}$ ersetzt werden kann. Dazu wird die Zahnbürste gegen eine selbstgewickelte Spule ausgetauscht, an deren Enden der Kondensator angeschlossen wird.

e)Der Schüler stellt fest, dass der Kondensator mithilfe dieser Anordnung nicht geladen wird.

Erkläre diese Beobachtung.

Beschreibe daran anknüpfend eine Funktion der in der Zahnbürste eingebauten elektrischen Schaltung. (5 BE)

f)Berechne den Energieinhalt des Kondensators, wenn dieser mit einer konstanten Spannung von $1{,}7\,\rm{V}$ geladen ist. [zur Kontrolle: $14\,\rm{J}$] (2 BE)

g)Für den Betrieb der Zahnbürste ist ein Elektromotor mit der mittleren Leistung $1{,}1\,\rm{W}$ eingebaut.

Begründe, dass der Kondensator aus Teilaufgabe **f)** als Ersatz für den Akku nicht geeignet ist. (4 BE)

## Lösung

**Hinweis:** Bei dieser Lösung von LEIFIphysik handelt es sich nicht um den amtlichen Lösungsvorschlag des bayr. Kultusministeriums.

a)Das durch die Primärspule der Ladestation erzeugte magnetische Wechselfeld durchsetzt die Sekundärspule und bewirkt in dieser eine ständige Änderung des magnetischen Flusses. Aufgrund des Induktionsgesetzes ${U_{{\rm{ind}}}} = - N \cdot \dot \Phi $ entsteht in der Sekundärspule der Zahnbürste eine induzierte Wechselspannung.

Durch den Eisenkern, in dem sich sehr viele sogenannte Elementarmagnete befinden, wird das von der Primärspule erzeugte magnetische Wechselfeld erheblich verstärkt.

b)Für die in der Sekundärspule induzierte Spannung gilt

$$
U = - N \cdot \dot \Phi = - N \cdot \frac{d}{{dt}}\left( {B\left( t \right) \cdot A} \right) = - N \cdot A \cdot \frac{d}{{dt}}\left( {{B_0} \cdot \cos \left( {2 \cdot \pi \cdot f \cdot t} \right)} \right) = N \cdot {B_0} \cdot A \cdot 2 \cdot \pi \cdot f \cdot \sin \left( {2 \cdot \pi \cdot f \cdot t} \right)
$$


c)Aus Aufgabenteil **b)** erhält man

$$
{U_0} = N \cdot {B_0} \cdot A \cdot 2 \cdot \pi \cdot f \Leftrightarrow N = \frac{{{U_0}}}{{{B_0} \cdot A \cdot 2 \cdot \pi \cdot f}}
$$

und mit $U_0=1{,}7\,\rm{V}$

$$
N = \frac{{1{,}7\,{\rm{V}}}}{{1{,}5 \cdot {{10}^{ - 3}}\,\frac{{{\rm{Vs}}}}{{{{\rm{m}}^{\rm{2}}}}} \cdot 0{,}80 \cdot {{10}^{ - 4}}\,{{\rm{m}}^{\rm{2}}} \cdot 2 \cdot \pi  \cdot 24 \cdot {{10}^3}\,\frac{1}{{\rm{s}}}}} = 94
$$


d)Durch Verändern von $N$ bzw. $A$ kann die Spule modifiziert werden. Berechnung von ${N^\*} \cdot {A^\*}$ für die Frequenz von $f^\*=50\,\rm{Hz}$:

$$
{N^\*} \cdot {A^\*} = \frac{{{U_0}}}{{{B_0} \cdot 2 \cdot \pi \cdot {f^\*}}} \Rightarrow {N^\*} \cdot {A^\*} = \frac{{1{,}7\,{\rm{V}}}}{{1{,}5 \cdot 1{0^{ - 3}}\,\frac{{{\rm{Vs}}}}{{{{\rm{m}}^{\rm{2}}}}} \cdot 2 \cdot \pi \cdot 50\,\frac{1}{{\rm{s}}}}} = 3{,}6\,{{\rm{m}}^2}
$$

Würde man bei einer Fläche von $0{,}80\,\rm{cm^2}$ bei der Sekundärspule bleiben (sehr viel größere Flächen würden zu eine unhandlichen Griff führen), so ergäbe sich für die Windungszahl $N^\*$

$$
{N^\*} \cdot {A^\*} = 3{,}6\,{{\rm{m}}^2} \Leftrightarrow {N^\*} = \frac{{3{,}6\,{{\rm{m}}^2}}}{{{A^\*}}} \Rightarrow {N^\*} = \frac{{3{,}6\,{{\rm{m}}^2}}}{{0{,}80 \cdot {{10}^{ - 4}}\,{{\rm{m}}^2}}} = 4{,}5 \cdot {10^4}
$$

Diese hohe Windungszahl ist bei dem begrenzten zur Verfügung stehenden Raum nur schwerlich unterzubringen.

e)Der Kondensator stellt zusammen mit der Sekundärspule einen Schwingkreis dar. In diesem Kreis wird der Kondensator zunächst aufgeladen, dann wieder entladen und anschließend wieder mit umgekehrter Polarität wie vorher aufgeladen usw. Fazit: Es kommt zu keiner dauerhaften Aufladung des Kondensators und somit auch nicht des Akkus. Damit der Akku ständig aufgeladen wird, muss die elektrische Schaltung dafür sorgen, dass der Strom, welcher in den Akku fließt stets nur eine Richtung hat (Gleichrichtung!). Die elektrische Schaltung muss also dafür sorgen, dass die Wechselspannung in eine Gleichspannung gewandelt wird.

f)Energieinhalt des Kondensators:

$$
{W_{{\rm{el}}}} = \frac{1}{2} \cdot C \cdot {U^2} \Rightarrow {W_{{\rm{el}}}} = \frac{1}{2} \cdot 10\,\frac{{{\rm{As}}}}{{\rm{V}}} \cdot {\left( {1{,}7\,{\rm{V}}} \right)^2} = 14\,{\rm{J}}
$$


g)Wegen

$$
{W_{{\rm{el}}}} = P \cdot \Delta t \Leftrightarrow \Delta t = \frac{{{W_{{\rm{el}}}}}}{P} \Rightarrow \Delta t = \frac{{14\,{\rm{J}}}}{{1{,}1\,{\rm{W}}}} = 13\,{\rm{s}}
$$

würde der geladene Kondensator würde $13\,\rm{s}$ wieder entladen sein. Diese Zeit ist für das Reinigen der Zähne viel zu kurz.

## Grundwissen
- [Induktion durch Änderung der magnetischen Flussdichte](https://www.leifiphysik.de/elektrizitaetslehre/elektromagnetische-induktion/grundwissen/induktion-durch-aenderung-der-magnetischen-flussdichte)
