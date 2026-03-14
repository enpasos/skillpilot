# Lawinenverschütteten-Suchgerät (Abitur BY 2021 Ph 11-1 A2)

Quelle: https://www.leifiphysik.de/elektrizitaetslehre/elektromagnetische-induktion/aufgabe/lawinenverschuetteten-suchgeraet-abitur-2021-ph-11-1-a2
Originaldatei: `curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/abi/Physik/input/leifiphysik_abitur/pages/elektrizitaetslehre/elektromagnetische-induktion/aufgabe/lawinenverschuetteten-suchgeraet-abitur-2021-ph-11-1-a2.html`
Schwierigkeitsgrad: mittelschwere Aufgabe

## Aufgabe

![](https://www.leifiphysik.de/sites/default/files/2022/08/image/Abitur_BY_2021_Abb_4_Lawinenschuettsuchgeraet.svg)

**Abb. 1** Lawinenverschütteten-Suchgerät (LVS-Gerät)

[CC-BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/deed.de) / FWU Institut für Film und Bild;

LVS-Geräte dienen zur Ortung von in Lawinen verschütteten Personen. Sie besitzen zwei Betriebsarten, den Sende- und den Empfangsmodus. Das Gerät ${\rm{S}}$ des Verschütteten befindet sich im Sendemodus. Mit Hilfe einer Spule, die um einen Eisenkern gewickelt ist, wird ein magnetisches Wechselfeld mit einer Frequenz von ${457\,\rm{kHz}}$ erzeugt. **Abb. 1** zeigt eine Momentaufnahme des Feldlinienbildes. Die Retter betreiben ihre LVS-Geräte ${\rm{E_{1}}}$ und ${\rm{E_{2}}}$ im Empfangsmodus, bei dem an den Anschlüssen der jeweiligen Spulen eine Wechselspannung gemessen werden kann.

a)

Im Sendebetrieb wird das Gerät im Abstand von einer Sekunde für jeweils ${70\,\rm{ms}}$ betrieben.

Bestimme die Anzahl der Umpolungen des Magnetfeldes innerhalb eines Pulses. (4 BE)

b)

Erläutere die Entstehung der Wechselspannung an den Spulenanschlüssen im Empfänger ${\rm{E_{1}}}$.

Gehe dabei auf die Funktion des Eisenkerns ein. (5 BE)

c)

Erkläre, dass in der in **Abb. 1** dargestellten Situation nur ${\rm{E_{1}}}$, aber nicht ${\rm{E_{2}}}$, ein deutliches Signal empfängt. (3 BE)

Das LVS-Gerät zeigt die aktuelle Signalstärke durch einen Ton entsprechender Lautstärke an.

d)

Gehe zunächst davon aus, dass die Zeichenebene in **Abb. 1** parallel zur Erdoberfläche liegt. Die Sendespule befindet sich in geringer Tiefe. Bei der Suche nach dem Verschütteten soll der Empfänger entlang einer in **Abb. 1** dargestellten Feldlinie zum Sender geführt werden.

Formuliere Handlungsanweisungen für den dafür erforderlichen Umgang mit dem Gerät, wenn der Suchende bei ${\rm{P}}$ startet. (5 BE)

e)

Entscheide begründet, welche Orientierung der Sendespule für die Suchstrategie aus Teilaufgabe **d)** am ungünstigsten ist. (3 BE)

## Lösung

**Hinweis:** Bei dieser Lösung von LEIFIphysik handelt es sich nicht um den amtlichen Lösungsvorschlag des bayr. Kultusministeriums.

a)

Mit der gegebenen Frequenz des magnetischen Wechselfeldes ${f = 457 \,\rm{kHz} = 457\cdot 10^{3} \,\rm{Hz}}$ nutzen wir den Zusammenhang zwischen der Frequenz und der Periodendauer

$$
f =\frac{1}{T} \Leftrightarrow T=\frac{1}{f}
$$

Einsetzen des gegebenen Wertes liefert (bei drei gültigen Ziffern Genauigkeit)

$$
{ T = \frac{1}{457\cdot 10^{3}\,\rm{Hz}} = 2{,}19 \cdot 10^{-6}\,\rm{s} = 2{,}19 \,\rm{\mu s} } 
$$

Dabei müssen wir beachten, dass pro Periodendauer zwei Umpolungen stattfinden. Somit ergibt sich für die Anzahl der Umpolungen (bei zwei güligen Ziffern Genauigkeit)

$$
{n = \frac{70\cdot 10^{-3}\,\rm{s}}{2{,}19\cdot 10^{-6} \,\rm{s} } \cdot 2 = 6{,}4 \cdot 10^{4}}
$$


b)

Befindet sich das LVS-Gerät im Sendemodus, so fließt ein Wechselstrom durch die Spule mit Eisenkern, weshalb sich durch den Stromfluss in der leitenden Spule ein zeitlich änderndes Magnetfeld bildet. Die Spule ${\rm{E_1}}$ befindet sich im Empfangsmodus. Durchströmt nun das sich zeitlich ändernde Magnetfeld des LVS-Gerätes die Spule ${\rm{E_{1}}}$, so bildet sich nach dem Induktionsgesetz ${U_{\rm{i}} = - \frac{d\Phi_{\rm{E_1}}}{dt}}$ eine zeitlich ändernde Induktionsspannung in der Spule. Diese Induktionsspannung wird als Signal für den Empfang genutzt. Das Induktionsgesetz der Empfängerspule $\rm{E_1}$ kann auch über die Induktivität der Spule dargestellt werden

$$
U_{\rm{i}} = -\frac{d\Phi_{\rm{E_1}}}{dt} = - L_{\rm{E_1}} \frac{d I_{\rm{LVS}}}{dt}
$$

Dabei ist die Induktivität der Spule $L \sim \mu_{\rm{r}}$ proportional zur Permeabilität. Somit erhöht der Eisenkern als ferromagnetisches Material die Permeabilität $\mu_{\rm{r}}$ der Empfängerspule, weshalb die Induktivität dieser Spule größer wird. Dies hat zur Folge, dass bereits kleine Änderungen des magnetischen Flusses $\Phi_{\rm{E_1}}$ in der Empfängerspule eine aussreichende Induktionsspannung erzeugen können, wodurch man über größere Distanz zwischen LVS-Gerät und Empfängerspule ein Signal empfangen kann.

c)

Bei dem Gerät $\rm{E_{1}}$ verlaufen die magnetischen Feldlinien des vom Senders ${\rm{S}}$ erzeugten Magnetfeldes in der Empfängerspule annähernd parallel zur Spulenachse und sorgen somit für eine große Änderung des magnetischen Flusses ${\Phi_{\rm{E_{1}}}}$ und somit für eine große Induktionsspannung.

Bei dem Gerät ${E_{2}}$ jedoch verlaufen die magnetischen Feldlinien des vom Senders  ${\rm{S}}$ erzeugten Magnetfeldes in der Empfängerspule annähernd senkrecht zur Spulenachse, wodurch nur eine geringer Änderung des magnetischer Flusses ${\Phi_{\rm{E_{2}}}}$ und somit auch nur eine geringe Induktionsspannung erzeugt wird.

d)

Die Handlungsanweisungen könnten wie folgt aussehen:

- Drehe die Sendespule ${\rm{S}}$ parallel zur Erdoberfläche, solange bis das Signal bei einer Orientierung maximal ist
- Gehe nun so lange ein Stück in die Richtung der Sendespulenachse, bis das Signal wieder beginnt abzufallen
- Wiederhole die ersten beiden Handlungen, wobei die maximale Signalstärke insgesamt ansteigen muss. Sobald diese Signalstärke nicht mehr gesteigert werden kann, befindet man sich über der verschütteten Person.

e)

Am ungünstigsten wäre es, wenn die Sendespulenachse des LVS-Gerätes senkrecht auf der Erdoberfläche steht. Dann kann der Suchende nicht mehr einer Feldlinie seiner Spendespule entlang zur Empfangsspule eines Verschütteten folgen, da durch die Orientation seiner Sendespuleachse die waagerechte Komponente des magnetischen Feldvektors sehr klein ist.

## Grundwissen
- [Induktion durch Änderung der magnetischen Flussdichte](https://www.leifiphysik.de/elektrizitaetslehre/elektromagnetische-induktion/grundwissen/induktion-durch-aenderung-der-magnetischen-flussdichte)
