# Schwingende Ladung (Abitur SL 1996 LK A1-3.1-3.4)

Quelle: https://www.leifiphysik.de/elektrizitaetslehre/ladungen-elektrisches-feld/aufgabe/schwingende-ladung-abitur-sl-1996-lk-a1-31-34
Originaldatei: `curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/abi/Physik/input/leifiphysik_abitur/pages/elektrizitaetslehre/ladungen-elektrisches-feld/aufgabe/schwingende-ladung-abitur-sl-1996-lk-a1-31-34.html`
Schwierigkeitsgrad: schwere Aufgabe

## Aufgabe

![](https://www.leifiphysik.de/sites/default/files/2019/11/image/schwingende_ladung_aufgabe_0.svg)

**Abb. 1** Skizze zur Aufgabe

Die beiden punktförmigen Ladungen an den Orten A und B sind ortsfest und haben den gleichen positiven Wert $Q$. In der Mitte der Strecke $\overline {{\rm{AB}}} $ befindet sich die punktförmige negative Ladung $q$. Durch eine Störung wird die Ladung $q$ senkrecht zu $\overline {{\rm{AB}}} $ in $x$-Richtung ausgelenkt und beginnt daher um die Ruhelage zu schwingen.

a)

Zeige , dass für die Rückstellkraft $\vec F$ gilt:

$$
F(x) = - \frac{{\left| {q \cdot Q} \right|}}{{2 \cdot \pi \cdot {\varepsilon _0}}} \cdot \frac{x}{{{{\left( {{a^2} + {x^2}} \right)}^{{\textstyle{3 \over 2}}}}}}
$$


b)

Zeige, dass für kleine Auslenkung ${\left| x \right| \ll a}$ die Rückstellkraft entgegengesetzt proportional zur Auslenkung $x$ ist mit dem Proportionalitätsfaktor

$$
D = \frac{{\left| {q \cdot Q} \right|}}{{2 \cdot \pi \cdot {\varepsilon _0} \cdot {a^3}}}
$$


c)

Bestimme die Maßeinheit von $D$.

d)

Nun soll der schwingende Körper, der die Ladung $q$ trägt, ein Elektron sein und sich in den Punkten A und B jeweils die positive Elementarladung $e$ befinden. Die Länge der Strecke $\overline {{\rm{AB}}}$ ist $2 \cdot a = 0{,}2\,\rm{nm}$.

Berechne mit der Federhärte $D$ die Schwingungsdauer des Elektrons.

## Lösung

**Hinweis:** Bei dieser Lösung von LEIFIphysik handelt es sich nicht um den amtlichen Lösungsvorschlag des saarländischen Kultusministeriums.

a)

![](https://www.leifiphysik.de/sites/default/files/2019/11/image/schwingende_ladung_loesung.svg)

**Abb. 2** Skizze zur Lösung

Berechnung der COULOMB-Kraft, die von der Ladung bei A auf die Probeladung $q$ ausgeübt wird:

$$
{F_{{\rm{schräg}}}} = \frac{1}{{4 \cdot \pi  \cdot {\varepsilon _0}}} \cdot \frac{{\left| {Q \cdot q} \right|}}{{{a^2} + {x^2}}}
$$

Berechnung des Betrages der zu $\overline {{\rm{AB}}}$ senkrechten Komponente von ${\vec F_{{\rm{schräg}}}}$:Zum einen gilt

$$
\cos \left( \alpha  \right) = \frac{x}{{\sqrt {{a^2} + {x^2}} }}
$$

Damit ergibt sich nun

$$
{F_{{\rm{senkrecht}}}} = {F_{{\rm{schräg}}}} \cdot \cos \left( \alpha  \right) = \frac{1}{{4 \cdot \pi  \cdot {\varepsilon _0}}} \cdot \frac{{\left| {Q \cdot q} \right|}}{{{a^2} + {x^2}}} \cdot \frac{x}{{\sqrt {{a^2} + {x^2}} }}
$$

Da die Ladung bei B eine gleich große Kraft in horizonaler Richtung bewirkt, ist die gesamte Kraft in der zu $\overline {{\rm{AB}}}$ senkrechten Richtung

$$
{F_{{\rm{senkrecht,ges}}}} = 2 \cdot \frac{1}{{4 \cdot \pi  \cdot {\varepsilon _0}}} \cdot \frac{{\left| {Q \cdot q} \right|}}{{{{\left( {{a^2} + {x^2}} \right)}^{\frac{3}{2}}}}} \cdot x = \frac{1}{{2 \cdot \pi  \cdot {\varepsilon _0}}} \cdot \frac{{\left| {Q \cdot q} \right|}}{{{{\left( {{a^2} + {x^2}} \right)}^{\frac{3}{2}}}}} \cdot x
$$


b)

Für den Nenner im zweiten Bruch des Ergebnisses von Teilaufgabe **a)** kann man schreiben

$$
{\left( {{a^2} + {x^2}} \right)^{{\textstyle{3 \over 2}}}} = {\left[ {{a^2} \cdot \left( {1 + \frac{{{x^2}}}{{{a^2}}}} \right)} \right]^{{\textstyle{3 \over 2}}}} = {a^3} \cdot {\left( {1 + \frac{{{x^2}}}{{{a^2}}}} \right)^{{\textstyle{3 \over 2}}}}
$$

Wenn $\left| x \right| \ll a$ ist, dann ist ${\frac{{{x^2}}}{{{a^2}}}}\approx 0$. Damit ergibt sich

$$
{\left( {1 + \frac{{{x^2}}}{{{a^2}}}} \right)^{\frac{3}{2}}} \approx {\left( {1 + 0} \right)^{\frac{3}{2}}} = {1^{\frac{3}{2}}} = 1
$$

Somit gilt

$$
{\left( {{a^2} + {x^2}} \right)^{{\textstyle{3 \over 2}}}} \approx {a^3}
$$

Insgesamt lässt sich nach für die zu $\overline {{\rm{AB}}}$ senkrecht wirkende Gesamtkraft näherungsweise schreiben

$$
{F_{{\rm{senkrecht,ges}}}} = \frac{1}{{2 \cdot \pi  \cdot {\varepsilon _0}}} \cdot \frac{{\left| {Q \cdot q} \right|}}{{{a^3}}} \cdot x
$$

Es liegt somit ein lineares Kraftgesetz ${F_{\rm{senkrecht,ges}}} = - D \cdot x$ vor, bei dem die Richtgröße $D$ den folgenden Wert hat:

$$
D = \frac{{\left| {q \cdot Q} \right|}}{{2 \cdot \pi \cdot {\varepsilon _0} \cdot {a^3}}}
$$


c)

Für die Einheit von D ergibt sich

$$
\left[ D \right] = \frac{{{\rm{A}} \cdot {\rm{s}} \cdot {\rm{A}} \cdot {\rm{s}}}}{{\frac{{{\rm{A}} \cdot {\rm{s}}}}{{{\rm{V}} \cdot {\rm{m}}}} \cdot {{\rm{m}}^{\rm{3}}}}} = \frac{{{\rm{A}} \cdot {\rm{s}} \cdot {\rm{A}} \cdot {\rm{s}} \cdot {\rm{V}} \cdot {\rm{m}}}}{{{\rm{A}} \cdot {\rm{s}} \cdot {{\rm{m}}^{\rm{3}}}}}\; = \frac{{{\rm{A}} \cdot {\rm{s}} \cdot {\rm{V}}}}{{{\rm{m}} \cdot {\rm{m}}}} = \frac{{\rm{J}}}{{{\rm{m}} \cdot {\rm{m}}}} = \frac{{\rm{N}}}{{\rm{m}}}
$$


d)

Für die Schwingungsdauer eines - ähnlich wie die Masse bei einem Federpendel -  schwingenden Elektrons der Masse  $m_{\rm{e}}$ gilt

$$
T = 2 \cdot \pi  \cdot \sqrt {\frac{{{m_{\rm{e}}}}}{D}} \quad(1)
$$

Für $D$ gilt

$$
D = \frac{{\left| {q \cdot Q} \right|}}{{2 \cdot \pi  \cdot {\varepsilon _0} \cdot {a^3}}} \Rightarrow D = \frac{{{{\left( {1{,}60 \cdot {{10}^{-19}}\,{\rm{A}\,\rm{s}}} \right)}^2}}}{{2 \cdot \pi  \cdot 8{,}85 \cdot {{10}^{-12}}\,\frac{{{\rm{A}\,\rm{s}}}}{{{\rm{V}\,\rm{m}}}} \cdot {{\left( {0{,}1 \cdot {{10}^{-9}}\,{\rm{m}}} \right)}^3}}} = 4{,}6 \cdot {10^2}\,\frac{{\rm{N}}}{{\rm{m}}}
$$

Setzt man dieses Ergebnis in $(1)$ ein, so erhält man

$$
T = 2 \cdot \pi  \cdot \sqrt {\frac{{9{,}1 \cdot {{10}^{-31}}\,{\rm{kg}}}}{{4{,}6 \cdot {{10}^2}\,\frac{{\rm{N}}}{{\rm{m}}}}}}  = 2{,}8 \cdot {10^{-16}}\,{\rm{s}}
$$


## Grundwissen
- [Elektrische Kraft (2 Spezialfälle)](https://www.leifiphysik.de/elektrizitaetslehre/ladungen-elektrisches-feld/grundwissen/elektrische-kraft-2-spezialfaelle)
- [COULOMB-Gesetz](https://www.leifiphysik.de/elektrizitaetslehre/ladungen-elektrisches-feld/grundwissen/coulomb-gesetz)
