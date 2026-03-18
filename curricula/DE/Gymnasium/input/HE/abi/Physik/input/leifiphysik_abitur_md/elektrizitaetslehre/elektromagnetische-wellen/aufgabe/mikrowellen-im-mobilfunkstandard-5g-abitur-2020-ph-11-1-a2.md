# Mikrowellen im Mobilfunkstandard 5G (Abitur BY 2020 Ph 11–1 A2)

Quelle: https://www.leifiphysik.de/elektrizitaetslehre/elektromagnetische-wellen/aufgabe/mikrowellen-im-mobilfunkstandard-5g-abitur-2020-ph-11-1-a2
Originaldatei: `curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/abi/Physik/input/leifiphysik_abitur/pages/elektrizitaetslehre/elektromagnetische-wellen/aufgabe/mikrowellen-im-mobilfunkstandard-5g-abitur-2020-ph-11-1-a2.html`
Schwierigkeitsgrad: mittelschwere Aufgabe

## Aufgabe

Bei einem Experiment mit zwei phasengleichen Sendern werden Mikrowellen der Frequenz $30\,\rm{GHz}$ zur Interferenz gebracht.

a)

Zeige, dass die Wellenlänge dieser Mikrowellen $1{,}0\,\rm{cm}$ beträgt. (2 BE)

b)

![](https://www.leifiphysik.de/sites/default/files/2020/10/image/Mikrowellen%20im%20Mobilfunkstandard%205G%20-%20Intensit%C3%A4tsverteilung%20in%20Abh%C3%A4ngigkeit%20vom%20Winkel%20alpha_0.svg)

**Abb. 1a** Intensitätsverteilung in Abhängigkeit von der Winkelweite $\alpha$

[CC-BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/deed.de) / FWU Institut für Film und Bild;

![](https://www.leifiphysik.de/sites/default/files/2020/10/image/Mikrowellen%20im%20Mobilfunkstandard%205G%20-%20Skizze%20der%20Anordnung_0.svg)

**Abb. 1b** Skizze der Anordnung

[CC-BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/deed.de) / FWU Institut für Film und Bild;

**Abb. 1a** zeigt einen Ausschnitt der in sehr großem Abstand zu erwartenden Intensitätsverteilung in Abhängigkeit von der Winkelweite $\alpha$ (**Abb. 1b**).

Berechne den Abstand der beiden Sender. (5 BE)

c)

Erläutere qualitativ die Veränderung der Winkelweiten, unter denen Maxima beobachtet werden können, falls die Frequenz der Mikrowellen sinkt. (4 BE)

d)

Im Experiment werden nun an den mit Kreuzen markierten Stellen weitere phasengleiche Sender platziert (**Abb. 1b**), sodass eine Reihe von zehn gleichartigen, äquidistanten Sendern entsteht.

Zeichne qualitativ in **Abb. 1a** das sich nun ergebende Interferenzmuster ein. (3 BE)

Der neue Mobilfunkstandard 5G nutzt Mikrowellen der Frequenz $30\,\rm{GHz}$. Durch die im Vergleich zum bisherigen LTE-Standard fünfzehnfache Frequenz können mehr Daten in gleicher Zeit übertragen werden.

e)

Die von einem Sender auf einen Empfänger übertragene Leistung ist bei sonst vergleichbaren Bedingungen proportional zum Quadrat der Wellenlänge.

Vergleiche unter diesem Aspekt quantitativ die beiden Mobilfunkstandards. (3 BE)

f)

Das Vorgehen aus Teilaufgabe **d)** wird benutzt, um die auf einen Empfänger übertragene Leistung zu erhöhen.

Erläutere, dass dieses Vorgehen ohne zusätzliche Maßnahmen für den Mobilfunk nicht geeignet ist. (4 BE)

g)

Künftig sollen LKWs hintereinander „im Verband vernetzt autonom fahren“. Dabei soll der erste LKW Informationen zu seinem Bewegungszustand an nachfolgende LKWs übertragen. Im Vergleich zum LTE-Standard gelingt es mit 5G, die Latenzzeit (vereinfacht: die Zeitspanne, bis die Technik anspricht) von $70\,\rm{ms}$ auf $1{,}0\,\rm{ms}$ zu reduzieren.

Beurteile unter diesem Aspekt die Eignung der beiden Mobilfunkstandards für das vernetzte Fahren. Gehe dabei von einem Abstand der LKWs von nur $1{,}0\,\rm{m}$ auf gerader Strecke und von einer LKW-Geschwindigkeit von $80\,\frac{\rm{km}}{\rm{h}}$ aus. (5 BE)

## Lösung

**Hinweis:** Bei dieser Lösung von LEIFIphysik handelt es sich nicht um den amtlichen Lösungsvorschlag des bayerischen Kultusministeriums.

a)

Mit $c=3{,}0\cdot10^8\,\frac{\rm{m}}{\rm{s}}$ und $f=30\cdot10^9\,\rm{Hz}$ ergibt sich mit der Formel für den Zusammenhang zwischen Ausbreitungsgeschwindigkeit, Frequenz und Wellenlänge von Wellen

$$
c = \lambda \cdot f \Leftrightarrow \lambda = \frac{c}{f}
$$

Einsetzen der gegebenen Werte liefert

$$
\lambda = \frac{3{,}0\cdot10^8\,\frac{\rm{m}}{\rm{s}}}{30\cdot10^9\,\rm{Hz}}= 1{,}0\cdot10^{-2}\,\rm{m}
$$


b)

Aus **Abb. 1a** kann man recht genau ablesen, dass bei einer Wellenlänge von $\lambda = 1{,}0 \cdot 10^{-2}\,\rm{m}$ das Maximum 2. Ordnung bei einer Winkelweite von $\alpha_2 = 30^\circ$ liegt. Allgemein gilt für die Maxima bei Zwei-Quellen-Interferenz

$$
b \cdot \sin\left(\alpha_k\right)=k\cdot\lambda\quad(1)
$$

Für das Maximum 2. Ordnung mit $k = 2$ gilt somit

$$
b\cdot\sin\left(\alpha_2\right) = 2\cdot\lambda \Leftrightarrow b = \frac{2\cdot\lambda}{\sin\left(\alpha_2\right)}
$$

Einsetzen der gegebenen Werte liefert

$$
b = \frac{2 \cdot 1{,}0\cdot10^{-2}\,\rm{m}}{\sin\left(30^\circ\right)} = \frac{2\cdot1{,}0\cdot10^{-2}\,\rm{m}}{0{,}50} = 4{,}0\cdot10^{-2}\,\rm{m}
$$


c)

Wenn die Frequenz der Mikrowellen sinkt, nimmt wegen $\lambda = \frac{c}{f}$ die Wellenlänge der Mikrowellen zu. Aus Gleichung $(1)$ von Teilaufgaben **b)** folgt

$$
\sin\left(\alpha_k\right) = \frac{k\cdot\lambda}{b}\quad(2)
$$

Bei gleichbleibendem Abstand $b$ wird also die rechte Seite von Gleichung $(2)$ bei festem $k$ größer und damit auch die Winkelweite $\alpha_k$ unter dem das $k$-te Maximum zu beobachten ist.

d)

![](https://www.leifiphysik.de/sites/default/files/2020/10/image/Mikrowellen%20im%20Mobilfunkstandard%205G-%C3%84nderung%20der%20Intensit%C3%A4tsverteilung%20mit%20zunehmender%20Senderz_0.svg)

**Abb. 2** Änderung der Intensitätsverteilung mit zunehmender Senderzahl

[CC-BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/deed.de) / FWU Institut für Film und Bild;

Mit zunehmender Senderzahl aber gleichbleibendem $b$ treten die Maxima unter den gleichen Winkelweiten wie bei nur $2$ Sendern auf. Die Maxima werden jedoch schmäler und höher.

e)

Wenn die Frequenz $f_{\rm{5G}}=15\cdot f_{\rm{LTE}}$ ist, dann gilt für die Wellenlänge $\lambda_{\rm{5G}}$ wegen $c = \lambda \cdot f \Leftrightarrow \lambda = \frac{c}{f}$ 

$$
\lambda_{\rm{5G}} = \frac{c}{f_\rm{5G}} =\frac{c}{15\cdot f_{\rm{LTE}}}=\frac{1}{15}\lambda_{\rm{LTE}}
$$

Somit gilt für das Verhältnis von $P_{\rm 5G}$ zu $P_{\rm LTE}$

$$
\frac{P_{\rm 5G}}{P_{\rm LTE}} = \frac{{\lambda_{\rm 5G}}^2}{{\lambda_{\rm LTE}}^2} = \frac{(\frac{1}{15}\lambda_{\rm LTE})^2}{\lambda_{\rm LTE}^2} = \frac{1}{225}
$$


f)

Wie **Abb. 2**zeigt, treten bei Erhöhung der Senderzahl große Bereiche mit sehr geringer Intensität auf, in denen natürlich ein Mobilfunk-Empfänger nahezu keinen Empfang hat. Ohne zusätzliche Maßnahmen wäre so ein flächendeckender guter Empfang nicht gewährleistet.

g)

Entscheidend ist die Streckenlänge $\Delta x$, die der LKW in der Latenzzeit $\Delta t$ bei einer Geschwindigkeit von $v=80\,\frac{\rm{km}}{\rm{h}}=\frac{80}{3{,}6}\,\frac{\rm{m}}{\rm{s}}=22\,\frac{\rm{m}}{\rm{s}}$ zurücklegt.

- LTE-Standard: $\Delta x_{\rm{LTE}} = v \cdot \Delta t_{\rm{LTE}} \Rightarrow \Delta x_{\rm{LTE}} = 22\,\frac{\rm{m}}{\rm{s}} \cdot 70\cdot10^{-3}\,\rm{s} = 1{,}5\,\rm{m}$
- 5G-Standard: $\Delta x_{\rm{5G}} = v \cdot \Delta t_{\rm{5G}} \Rightarrow \Delta x_{\rm{5G}} = 22\,\frac{\rm{m}}{\rm{s}} \cdot 1{,}0\cdot10^{-3}\,\rm{s} = 2{,}2\cdot10^{-2}\,\rm{m}=2{,}2\,\rm{cm}$

Führt der erste LKW bei einer Geschwindigkeit von $80\,\rm \frac{km}{h}$ eine Vollbremsung aus, so reicht ein Abstand zwischen den LKWs von $1{,}0\,\rm m$ bei Verwendung des LTE-Standards nicht aus, da $\Delta x_{\rm{LTE}} \gt 1{,}0\,\rm{m}$ ist. Dagegen würde der Abstand der LKWs bei Verwendung des 5G-Standards ausreichen, da $\Delta x_{\rm{5G}} \ll 1{,}0\,\rm{m}$ ist.

## Grundwissen
- [Ausbreitung Elektromagnetischer Wellen](https://www.leifiphysik.de/elektrizitaetslehre/elektromagnetische-wellen/grundwissen/ausbreitung-elektromagnetischer-wellen)
