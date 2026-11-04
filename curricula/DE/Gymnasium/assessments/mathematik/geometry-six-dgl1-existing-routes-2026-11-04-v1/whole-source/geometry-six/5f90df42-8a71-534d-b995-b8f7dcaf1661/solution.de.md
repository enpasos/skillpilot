# Musterlösung: Parameterwinkel

**1.** Geeignet sind $\vec n_F=(0,1,1)^{\mathsf T}$,
$\vec n_a=(a,1,0)^{\mathsf T}$ und $\vec u_a=(1,0,a)^{\mathsf T}$.
Wegen der festen Komponenten $1$ sind die beiden letzten Vektoren
für kein $a$ null. Die Ebenen- und Geradengleichungen sind daher für
alle reellen $a$ zulässig. $a$ wählt eine Konfiguration; nach dieser
Wahl durchläuft $t$ die Punkte auf der einen Geraden $g_a$.

**2.** Mit $\vec u_a\cdot\vec n_F=a$,
$\|\vec u_a\|=\sqrt{1+a^2}$ und $\|\vec n_F\|=\sqrt2$ gilt
$$
\sin\alpha_a=\frac{|a|}{\sqrt2\sqrt{1+a^2}}.
$$
Für $\alpha_a=30^\circ$ ist der Quotient $1/2$. Beide Seiten sind
nichtnegativ, der Nenner ist immer positiv; Quadrieren ist hier
äquivalent. Es folgt
$$
\frac{a^2}{2(1+a^2)}=\frac14
\quad\Longleftrightarrow\quad a^2=1.
$$
Also $a=-1$ oder $a=1$. Beide liefern im ursprünglichen Quotienten
$1/(\sqrt2\sqrt2)=1/2$, also tatsächlich den nichtstumpfen Winkel
$30^\circ$. Die äquivalenten Umformungen schließen weitere Lösungen aus.

**3.** $\vec n_a\cdot\vec n_F=1$ und
$\|\vec n_a\|=\sqrt{1+a^2}$, daher
$$
\cos\beta_a=\frac1{\sqrt2\sqrt{1+a^2}}.
$$
Der Betrag des Skalarprodukts ändert hier die $1$ nicht. Im Schnitt
senkrecht zur Schnittgeraden stehen beide Normalenrichtungen senkrecht
auf ihren jeweiligen Ebenenspuren; die kleineren Winkel sind deshalb
gleich. Die Normalen können für kein $a$ parallel sein, da ihre
dritten Komponenten $0$ und $1$ sind und die zweite jeweils $1$ ist;
es liegt somit tatsächlich eine Schnittkonfiguration vor.

Für $\beta_a=60^\circ$ ist der Quotient $1/2$. Wegen positiver
Seiten gilt äquivalent
$$
\frac1{2(1+a^2)}=\frac14
\quad\Longleftrightarrow\quad a^2=1.
$$
Wieder ist $a=\pm1$. Beide liefern den ursprünglichen Kosinus $1/2$
und damit $\beta_a=60^\circ$; es gibt keine weiteren Lösungen.

**4.** $g_0$ hat Richtung $(1,0,0)^{\mathsf T}$ und $y+z=1$
für jeden seiner Punkte. Seine Richtung ist orthogonal zu $\vec n_F$,
also parallel zur Ebene. Sein Stützpunkt liegt nicht in $F$; folglich
ist die Gerade echt parallel und nicht in $F$ enthalten.

**5.** Weil beide Winkel nichtstumpf sind, ist
$\alpha_a+\beta_a=90^\circ$ genau dann erfüllt, wenn
$\sin\alpha_a=\cos\beta_a$. Mit dem gemeinsamen positiven Nenner
folgt $|a|=1$, also genau $a=\pm1$. Dort sind die Winkel tatsächlich
$30^\circ$ und $60^\circ$. Zum Beispiel ist für $a=0$ hingegen
$\alpha_0=0^\circ$, $\beta_0=45^\circ$. Verschiedene Richtungen bzw.
Normalen in den zwei Formeln begründen keine allgemeine
Ergänzungswinkelbeziehung.


## Eine Gesamtbewertung

Es gibt genau eine Gesamtpunktzahl aus **20 BE** und genau ein binäres
Gesamtergebnis: **bestanden ab 15 BE**, sonst nicht bestanden.
Die Teilpunkte sind keine eigenen Bestehensgrenzen und erzeugen keine
Teilmasterys oder Mastery für vorausgesetzte Lernziele.

Bewerte nachvollziehbare mathematische Leistungen unabhängig davon, in
welchem Aufgabenteil sie stehen. Gleichwertige Verfahren und
Darstellungen erhalten denselben Kredit; dieselbe Leistung zählt nur
einmal. Teilpunkte wie angegeben, sonst 0,5 BE für eine sinnvolle,
aber unvollständige Teilleistung. Ein lokaler Rechen- oder
Übertragungsfehler wird nicht mehrfach bestraft; nachvollziehbare
richtige Folgearbeit behält ihren Kredit. Knappe korrekte Begründungen
zählen; weder bestimmte Schlüsselwörter noch eine bestimmte
Reihenfolge sind vorgeschrieben.

| Kriterium | BE |
|---|---:|
| Beide Normalen und Geradenrichtung richtig (1 zusammen); Zulässigkeit für alle a aus nicht verschwindenden Vektoren (1); Rollen a/t unterschieden (1). | 3 |
| Gerade–Ebene-Sinus aus Skalarprodukt und Normen hergeleitet (2); vollständige Gleichung für 30° und äquivalentes Quadrieren (1); beide Parameterwerte und Vollständigkeit (2); Probe im ursprünglichen Quotienten (1). | 6 |
| Ebene–Ebene-Kosinus aus geeigneten Normalen hergeleitet (2); Gleichung für 60° korrekt gelöst (2); beide Werte im ursprünglichen Quotienten geprüft (1); Normalenwinkel geometrisch auf Ebenenwinkel bezogen (1). | 6 |
| Parallele Richtung begründet (1); Stützpunkt außerhalb und echte Parallelität statt Enthaltensein begründet (1). | 2 |
| Ergänzungsbedingung auf Gleichheit der Quotienten zurückgeführt (1); genau \|a\|=1 hergeleitet (1); nur dort gültige Winkelbeziehung gedeutet, z. B. mit Gegenbeispiel a=0 (1). | 3 |

Begrenze die normale Gesamtpunktzahl auf 14 BE, wenn die ganze Abgabe keine parameterabhängige Winkeluntersuchung für eine der beiden beschriebenen Konfigurationsarten enthält, alle Parameterwerte ausschließlich durch Ausprobieren statt aus einer Winkel-/Lagebedingung gewonnen werden oder jede geometrische Deutung der verwendeten Winkel bzw. der untersuchten Lage vollständig fehlt. Die ODER-Liste möglicher Bedingungsarten im ursprünglichen Kompetenztext verlangt nicht, dass alle Winkel-, Orthogonalitäts-, Parallelitäts- und Lagevarianten als getrennte Teilprüfungen bestanden werden. Hier gibt es einen Gesamtpass für die konkret gestellten Aufgaben. Eine knappe allgemeine Herleitung zählt; lokale Rechenfehler lösen keine Kappung aus.

Mehrere Kappungsgründe ergeben dieselbe Obergrenze von 14 BE. Es bleibt bei einem Gesamtpass ohne weitere Teilbestehensbedingungen.
