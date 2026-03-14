# Altersbestimmung von Zirkonen (Abitur BY 2017 Ph12-1 A3)

Quelle: https://www.leifiphysik.de/kern-teilchenphysik/radioaktivitaet-fortfuehrung/aufgabe/altersbestimmung-von-zirkonen-abitur-2017-ph12-1-a3
Originaldatei: `curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/abi/Physik/input/leifiphysik_abitur/pages/kern-teilchenphysik/radioaktivitaet-fortfuehrung/aufgabe/altersbestimmung-von-zirkonen-abitur-2017-ph12-1-a3.html`
Schwierigkeitsgrad: mittelschwere Aufgabe

## Aufgabe

Zirkone sind Minerale, deren Entstehungszeitpunkt mit der Uran-Blei-Methode bestimmt werden kann. Daraus lässt sich oftmals auch das Alter des Gesteins ermitteln, in welchem sie enthalten sind. Die Uran-Blei-Methode basiert darauf, dass ${}_{}^{238}{\rm{U}}$ über mehrere Zwischenprodukte in das stabile ${}_{}^{206}{\rm{Pb}}$ zerfällt.

a)Erkläre, dass ${}_{}^{232}{\rm{Th}}$ kein Zwischenprodukt dieser Zerfallsreihe sein kann. (3 BE)

Die Zerfallsreihe kann in guter Näherung als direkter Zerfall von ${}_{}^{238}{\rm{U}}$ nach ${}_{}^{206}{\rm{Pb}}$ mit einer Halbwertszeit $T$ von 4,5 Milliarden Jahren beschrieben werden. ${N_{{\rm{Pb}}}}\left( t \right)$ bezeichnet die Anzahl der ${}_{}^{206}{\rm{Pb}}$-Atome und ${N_{{\rm{U}}}}\left( t \right)$ die Anzahl der ${}_{}^{238}{\rm{U}}$-Atome in einer Gesteinsprobe zur Zeit $t$ nach der Entstehung des Minerals. Es soll vereinfachend angenommen werden, dass zum Zeitpunkt der Entstehung kein Blei in der Probe vorhanden war.

b)Begründe den Zusammenhang ${N_{{\rm{Pb}}}}\left( t \right) = {N_0} - {N_{\rm{U}}}\left( t \right)$. Gehe insbesondere darauf ein, wofür die Konstante ${N_0}$ steht. (4 BE)

Für das Verhältnis der Teilchenzahlen in Abhängigkeit von der Zeit ergeben sich die in der folgenden Tabelle dargestellten Werte.

|  |  |  |  |  |  |
| --- | --- | --- | --- | --- | --- |
| **$t$** | $0$ | $0{,}5 \cdot T$ | $T$ | $2 \cdot T$ | $3 \cdot T$ |
| **$\frac{{{N_{{\rm{Pb}}}}\left( t \right)}}{{{N_{\rm{U}}}\left( t \right)}}$** | $0$ | $0{,}41$ | $1$ | $3$ | $7$ |

c)Begründe ohne Rechnung, dass die Werte dieses Verhältnisses mit der Zeit zunehmen. (4 BE)

d)Bestätige für $t = 3 \cdot T$ den Wert von $\frac{{{N_{{\rm{Pb}}}}}}{{{N_{\rm{U}}}}}$ in der Tabelle. (5 BE)

e)Für die untersuchte Gesteinsprobe wird ein Verhältnis von $\frac{{{N_{{\rm{Pb}}}}}}{{{N_{\rm{U}}}}} = 0{,}75$ gemessen.

Erstelle anhand der Tabelle ein Diagramm, in welchem das Verhältnis ${{N_{{\rm{Pb}}}}}$ zu ${{N_{\rm{U}}}}$ in Abhängigkeit von der Zeit dargestellt wird.

Bestimme graphisch das Alter des Minerals. (5 BE)

## Lösung

**Hinweis:** Bei dieser Lösung von LEIFIphysik handelt es sich nicht um den amtlichen Lösungsvorschlag des bayr. Kultusministeriums.

a)Bei den radioaktiven Zerfällen ändern die ${\beta ^ - }$-Zerfälle und die $\gamma $-Zerfälle die Massenzahl überhaupt nicht; die $\alpha $-Zerfälle führen zu einer Abnahme der Massezahl um jeweils $4$ Einheiten. Da sich die Massezahl von ${}_{}^{238}{\rm{U}}$ und ${}_{}^{232}{\rm{Th}}$ um $6$ Einheiten unterscheiden, kann ${}_{}^{232}{\rm{Th}}$ nicht zur Uranreihe gehören (es wären nur Unterschiede in der Massenzahl um $4$; $8$; $12$ ... usw. denkbar).

b)${{N_0}}$ ist die Zahl der bei der Entstehung der Probe vorhandenen ${}_{}^{238}{\rm{U}}$-Kerne. Wenn ein ${}_{}^{238}{\rm{U}}$-Kern zerfällt, entsteht (natürlich erst nach einer langen Zeit) ein ${}_{}^{206}{\rm{Pb}}$-Kern. Dies bedeutet, dass die Gesamtzahl der in der Probe vorhandenen Kerne stets den Wert ${{N_0}}$ hat:

$$
{N_0} = {N_{\rm{U}}}\left( t \right) + {N_{{\rm{Pb}}}}\left( t \right) \Leftrightarrow {N_{{\rm{Pb}}}}\left( t \right) = {N_0} - {N_{\rm{U}}}\left( t \right)
$$


c)Die Zahl der Bleikerne (steht im Zähler des Bruches in der linken Spalte der Tabelle) nimmt mit zunehmender Zerfallszeit zu, die Zahl der radioaktiven Urankerne (steht im Nenner dieses Bruches) nimmt mit der Zeit ab. Wenn bei einem Bruch der Betrag des Zählers zu- und der Betrag des Nenners abnehmen, steigt der Wert des Bruches an.

d)Allgemein gilt

$$
\frac{{{N_{{\rm{Pb}}}}\left( t \right)}}{{{N_{\rm{U}}}\left( t \right)}} = \frac{{{N_0} - {N_{\rm{U}}}\left( t \right)}}{{{N_{\rm{U}}}\left( t \right)}} \Rightarrow \frac{{{N_{{\rm{Pb}}}}\left( t \right)}}{{{N_{\rm{U}}}\left( t \right)}} = \frac{{{N_0}}}{{{N_{\rm{U}}}\left( t \right)}} - 1 \Rightarrow \frac{{{N_{{\rm{Pb}}}}\left( t \right)}}{{{N_{\rm{U}}}\left( t \right)}} = \frac{{{N_0}}}{{{N_0} \cdot {e^{ - {\textstyle{{\ln \left( 2 \right)} \over T}} \cdot t}}}} - 1
$$

Speziell für $t = 3\cdot T$ gilt

$$
\frac{{{N_{{\rm{Pb}}}}(3 \cdot T)}}{{{N_{\rm{U}}}(3 \cdot T)}} = \frac{1}{{{e^{ - {\textstyle{{\ln \left( 2 \right)} \over T}} \cdot 3 \cdot {\rm T}}}}} - 1 = {e^{{\textstyle{{\ln \left( 2 \right)} \over T}} \cdot 3 \cdot {\rm T}}} - 1 = {e^{3 \cdot \ln \left( 2 \right)}} - 1 = {e^{\ln \left( {{2^3}} \right)}} - 1 = {2^3} - 1 = 8 - 1 = 7
$$


e)

![](https://default/sites/default/files/medien/altersbestimmung_von_zirkonen_diagramm.svg)

Für das Alter $t_{\rm{Probe}}$ der Gesteinsprobe ergibt sich ${t_{{\rm{Probe}}}} \approx 0{,}81 \cdot 4{,}5 \cdot {10^9}\,{\rm{a}} = 3{,}6 \cdot {10^9}\,{\rm{a}}$.
