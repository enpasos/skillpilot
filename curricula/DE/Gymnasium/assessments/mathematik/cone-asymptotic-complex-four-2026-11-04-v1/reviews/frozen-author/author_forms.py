"""Original role-neutral whole content only; no canonical proposal or activation."""
from pathlib import Path
import json,re
H=Path(__file__).resolve().parent
assert not (H/'content-review-handoff.json').exists(), 'Author batch is frozen.'
frozen=json.loads((H/'frozen-input.json').read_text());by={g['id']:g for g in frozen['wholeGoals']}
FORMS=[]

FORMS.append(dict(key='cone-limit',id='50612a57-7b9d-45fd-bc08-e95556444760',
task_de=r'''# Vom Pyramidenvolumen zum Kegelvolumen

Ein gerader Kreiskegel hat Grundkreisradius $r=4\,\mathrm{cm}$ und
senkrechte Höhe $h=9\,\mathrm{cm}$. Seine Spitze $S$ liegt senkrecht über
dem Mittelpunkt $M$ des Grundkreises. Die Pyramidenformel
$V=\frac13Gh$ darfst du verwenden. Insgesamt sind **20 BE** erreichbar.

**1. Geeignete Pyramiden beschreiben (6 BE)**

Denke dir in der Grundkreisebene regelmäßige Vielecke mit $4,8,16,32,\ldots$
Seiten. Bei einer Folge liegen alle Ecken auf dem Kreis; bei einer zweiten
Folge berühren die Seiten den Kreis von außen. Verbinde jeweils die
Vielecksfläche mit **derselben Spitze $S$**.

Beschreibe, welche Pyramiden innerhalb des Kegels und welche um ihn herum
liegen. Erläutere, was beim Verdoppeln der Seitenzahl verändert wird und
was gleich bleibt. Begründe, warum diese Körper zur Annäherung an den
gegebenen Kegel geeignet sind. Eine Skizze darf deine Erklärung unterstützen.

**2. Die Volumina vergleichen (4 BE)**

Die Grundflächeninhalte sind hier vorgegeben; eine trigonometrische
Herleitung ist nicht verlangt. Alle Werte stehen in $\mathrm{cm}^2$ und
sind gegebenenfalls gerundet.

| Seitenzahl $n$ | innere Grundfläche $G_n^-$ | äußere Grundfläche $G_n^+$ |
|---:|---:|---:|
| 4 | 32,000 | 64,000 |
| 8 | 45,255 | 53,019 |
| 16 | 48,983 | 50,922 |
| 32 | 49,943 | 50,428 |

Berechne aus den angegebenen Werten jeweils beide Pyramidenvolumina.
Erkläre, welche unteren und oberen Schranken für das Kegelvolumen entstehen
und wie sich die Einschließung verbessert.

**3. Den Grenzfall begründen (6 BE)**

Erkläre anschaulich, welchem Flächeninhalt die inneren und äußeren
Vielecksflächen bei immer weiterer Verfeinerung zustreben. Begründe mit
den Pyramidenvolumina, weshalb daraus für den Kegel
$V_K=\frac13\pi r^2h$ plausibel wird. Gehe dabei ausdrücklich auf die
unveränderte Höhe und den Faktor $\frac13$ ein. Ein analytischer
Grenzwertbeweis ist nicht verlangt; eine bloße Wiederholung der gesuchten
Kegelformel ersetzt die Begründung nicht.

**4. Anwenden und unterscheiden (4 BE)**

Berechne das Kegelvolumen exakt und auf zwei Dezimalstellen in
$\mathrm{cm}^3$. Beurteile begründet: „Bei immer mehr Ecken entsteht
schließlich ein Zylinder; deshalb verschwindet der Faktor $\frac13$.“
''',
task_en=r'''# From pyramid volume to cone volume

A right circular cone has base radius $r=4\,\mathrm{cm}$ and perpendicular
height $h=9\,\mathrm{cm}$. Its apex $S$ is directly above the base-circle
centre $M$. You may use the pyramid formula $V=\frac13Gh$.
A total of **20 points** is available.

**1. Describe suitable pyramids (6 points)**

In the base plane, consider regular polygons with $4,8,16,32,\ldots$ sides.
In one sequence all vertices lie on the circle; in a second sequence the
sides are tangent to the circle from outside. Join each polygonal base
to **the same apex $S$**.

Describe which pyramids lie inside the cone and which surround it.
Explain what changes and what stays fixed when the side count doubles.
Justify why these solids are suitable approximations to this cone.
A sketch may support your explanation.

**2. Compare the volumes (4 points)**

Base areas are supplied; no trigonometric derivation is required.
All entries are in $\mathrm{cm}^2$ and rounded where necessary.

| Side count $n$ | inner base area $G_n^-$ | outer base area $G_n^+$ |
|---:|---:|---:|
| 4 | 32.000 | 64.000 |
| 8 | 45.255 | 53.019 |
| 16 | 48.983 | 50.922 |
| 32 | 49.943 | 50.428 |

Calculate both pyramid volumes for every row using the supplied values.
Explain the resulting lower and upper bounds on the cone volume and
how the enclosure improves.

**3. Explain the limiting case (6 points)**

Explain intuitively which area the inner and outer polygonal bases
approach under continued refinement. Use the pyramid volumes to make
$V_K=\frac13\pi r^2h$ plausible for the cone. Explicitly address the fixed
height and the factor $\frac13$. An analytic limit proof is not required;
merely repeating the cone formula does not supply the justification.

**4. Apply and distinguish (4 points)**

Calculate the cone volume exactly and to two decimal places in
$\mathrm{cm}^3$. Evaluate with reasons: “With more and more sides we
eventually obtain a cylinder, so the factor $\frac13$ disappears.”
''',
solution_de=r'''# Referenzlösung: Kegel als Grenzfall

**1.** Alle Pyramiden haben dieselbe Spitze, dieselbe Grundebene und
dieselbe senkrechte Höhe $9\,\mathrm{cm}$. Die inneren regelmäßigen
Vielecke liegen innerhalb der Kreisscheibe, die äußeren enthalten sie.
Jede Verbindungsstrecke von $S$ zu einem Punkt der inneren Grundfläche
liegt daher auch im Kegel; entsprechend liegt der Kegel innerhalb der
äußeren Pyramide. Die Grundflächen und Seitenflächen werden bei größerer
Seitenzahl feiner. Die Höhe bleibt fest, und die Körper haben weiterhin
eine gemeinsame Spitze. So nähern sich die Pyramiden dem Kegel, ohne dass
eine andere Körperhöhe oder ein geschlossener Deckkreis eingeführt wird.

**2.** Wegen $h=9$ gilt für jede Grundfläche
$V_n^-=3G_n^-$ beziehungsweise $V_n^+=3G_n^+$.
Aus den ausdrücklich gerundeten Tabellenwerten erhält man:

| $n$ | $V_n^-$ in $\mathrm{cm}^3$ | $V_n^+$ in $\mathrm{cm}^3$ |
|---:|---:|---:|
| 4 | 96,000 | 192,000 |
| 8 | 135,765 | 159,057 |
| 16 | 146,949 | 152,766 |
| 32 | 149,829 | 151,284 |

Geometrisch gilt $V_n^-\leq V_K\leq V_n^+$. Die angezeigten Werte sind
gerundete Näherungen an diese Schranken, keine Behauptung exakter
Schranken bis zur letzten Dezimalstelle. Der Abstand wird deutlich
kleiner; beispielsweise sinkt er von $96$ auf ungefähr
$1{,}455\,\mathrm{cm}^3$.

**3.** Beim Verdoppeln der Seitenzahl füllen die inneren Vielecke die
Kreisscheibe immer genauer aus, während die äußeren überstehenden Ecken
immer kleiner werden. Beide Grundflächeninhalte nähern sich dem
Kreisflächeninhalt $\pi r^2$. Da Höhe und Drittelfaktor bei jeder
Pyramide gleich bleiben, nähern sich beide Volumenfolgen demselben Wert:
$$
V_n^-=\frac13G_n^-h\ \longrightarrow\ \frac13\pi r^2h,
\qquad
V_n^+=\frac13G_n^+h\ \longrightarrow\ \frac13\pi r^2h.
$$
Der dazwischen liegende Kegel hat damit plausibel genau dieses Volumen.
Hier wird die bereits verfügbare Pyramidenformel auf immer feinere
Grundflächen angewandt; der Faktor $\frac13$ muss nicht neu hergeleitet
werden. Eine knappe gleichwertige Erklärung mit einer geeigneten
Pyramidenannäherung zählt ebenfalls. Eine endliche Zahlenreihe allein
beweist keine unendliche Annäherung; entscheidend ist der geometrische
Gedanke der immer feineren Kreisannäherung.

**4.**
$$
V_K=\frac13\pi\cdot4^2\cdot9
=48\pi\,\mathrm{cm}^3\approx150{,}80\,\mathrm{cm}^3.
$$
Die Behauptung ist falsch. Die feste Spitze bleibt erhalten, also entsteht
ein Kegel, kein Zylinder mit einer zweiten parallelen Kreisfläche.
Jede Pyramide hat bei derselben Grundfläche und Höhe ein Drittel des
entsprechenden Prismenvolumens; die Verfeinerung ändert diesen Faktor
nicht. Das Vergleichszylindervolumen wäre $144\pi\,\mathrm{cm}^3$.
''',
solution_en=r'''# Reference solution: the cone as a limiting case

**1.** All pyramids share the same apex, base plane and perpendicular
height of $9\,\mathrm{cm}$. The inner polygons lie inside the circular
disc and the outer polygons contain it. Every segment joining $S$ to an
inner-base point therefore also lies inside the cone; similarly, the
cone lies inside each outer pyramid. Increasing the side count refines
the base and lateral faces. Height stays fixed and the solids retain a
common apex. Thus they approach the cone without introducing another
height or a second circular end face.

**2.** With $h=9$, each volume is $V_n^-=3G_n^-$ or $V_n^+=3G_n^+$.
Using the explicitly rounded table entries:

| $n$ | $V_n^-$ in $\mathrm{cm}^3$ | $V_n^+$ in $\mathrm{cm}^3$ |
|---:|---:|---:|
| 4 | 96.000 | 192.000 |
| 8 | 135.765 | 159.057 |
| 16 | 146.949 | 152.766 |
| 32 | 149.829 | 151.284 |

Geometrically, $V_n^-\leq V_K\leq V_n^+$. The displayed numbers are
rounded approximations to those bounds, not exact bounds to their last
decimal place. The gap shrinks substantially, for example from 96 to
approximately $1.455\,\mathrm{cm}^3$.

**3.** As the side count doubles, the inner polygons fill the disc more
closely and the projecting outer corners become smaller. Both base areas
approach the circle area $\pi r^2$. Since the height and one-third factor
stay fixed for every pyramid, both volume sequences approach the same value:
$$
V_n^-=\frac13G_n^-h\ \longrightarrow\ \frac13\pi r^2h,
\qquad
V_n^+=\frac13G_n^+h\ \longrightarrow\ \frac13\pi r^2h.
$$
The enclosed cone plausibly has this volume. The established pyramid
formula is applied to progressively finer bases; the one-third factor
need not be derived again. A concise equivalent argument using suitable
pyramids is equally acceptable. A finite numerical table alone does not
prove convergence: the essential justification is the geometric process
of increasingly close approximation to the circle.

**4.**
$$
V_K=\frac13\pi\cdot4^2\cdot9
=48\pi\,\mathrm{cm}^3\approx150.80\,\mathrm{cm}^3.
$$
The claim is false. The fixed apex remains, producing a cone rather than
a cylinder with a second parallel circular face. Each pyramid occupies
one third of the corresponding prism with the same base and height;
refining the base does not change that factor. The comparison cylinder
would have volume $144\pi\,\mathrm{cm}^3$.
''',
steps=[
('cone-family',6,'Gemeinsame Spitze/Grundebene und feste senkrechte Höhe erklärt (2); innere und äußere Lage aus den Grundflächen begründet (2); zunehmende Seitenzahl als geeignete Annäherung statt Höhenänderung beschrieben (2).','Explains common apex/base plane and fixed perpendicular height (2); justifies inner/outer containment from the bases (2); describes increasing side count as a suitable approximation rather than a height change (2).'),
('cone-table',4,'Acht Volumina aus V=3G nachvollziehbar berechnet (zusammen 3); untere/obere Einordnung und Verbesserung der Einschließung erklärt (1).','Traceably computes eight volumes using V=3G (3 together); explains lower/upper enclosure and its improvement (1).'),
('cone-limit',6,'Geometrische Annäherung der Grundflächen an πr² erklärt (2); unveränderte Höhe und Drittelfaktor auf die Pyramidenvolumina übertragen (2); gemeinsamen Grenzwert auf das eingeschlossene Kegelvolumen bezogen (2).','Explains geometric base-area approach to πr² (2); carries the fixed height and one-third factor into the pyramid volumes (2); connects their common limit to the enclosed cone volume (2).'),
('cone-apply',2,'48π cm³ nachvollziehbar angesetzt (1); etwa 150,80 cm³ sinnvoll gerundet mit Volumeneinheit (1).','Traceable expression 48π cm³ (1); sensible rounding to about 150.80 cm³ with volume unit (1).'),
('cone-distinguish',2,'Zylinderbehauptung durch erhaltene Spitze und unveränderten Drittelfaktor fachlich verworfen.','Rejects the cylinder claim using the retained apex and unchanged one-third factor.')],
essential_de='Kernleistungen sind die geeignete Pyramidenannäherung und die begründete Übertragung ihres Volumens im Grenzfall. Kappe die normale Gesamtpunktzahl auf höchstens 14 BE, wenn in der gesamten Abgabe eine dieser Handlungen vollständig fehlt: keine fachlich geeignete Pyramidenannäherung oder keinerlei tragfähiger Zusammenhang von Kreisannäherung, fester Höhe und Pyramidenformel zum Kegelvolumen. Eine bloße Tabelle oder wiederholte Kegelformel ersetzt den Grenzgedanken nicht. Eine knappe richtige Erklärung an beliebiger Stelle genügt; nicht jedes Detail muss perfekt sein. Ein lokaler Tabellen-, Zahlen- oder Einheitenfehler allein löst keine Kappung aus.',
essential_en='The core actions are a suitable pyramid approximation and justified passage of its volume relation to the limiting cone. Cap the ordinary total at 14 points if either action is wholly absent across the submission: no suitable pyramid approximation, or no sound link from circular approximation, fixed height and the pyramid formula to cone volume. A table or repeated cone formula alone does not replace the limiting argument. A concise correct explanation anywhere suffices; perfection in every detail is not required. A local table, numerical or unit error alone does not trigger the cap.'))

FORMS.append(dict(key='asymptotic-by-content',id='49f9059a-876c-5051-8146-d008b5cc691c',
task_de=r'''# Natürliches Exponentialwachstum und Potenzen vergleichen

Begründe die Aussagen zum Grenzverhalten. Als Hilfsmittel darfst du ohne
Beweis verwenden: Für $x\geq0$ und jede positive ganze Zahl $m$ gilt
$$
e^x\geq\frac{x^m}{m!}.
$$
Zum Beispiel ist $4!=24$. Eine andere mathematisch tragfähige Begründung
ist gleichwertig. Ein Taschenrechner ist für die Wertetabelle erlaubt.
Insgesamt sind **20 BE** erreichbar.

**1. Werte und Wachstumsbehauptung (4 BE)**

Vergleiche $e^x$ und $x^3$ für $x=1,4,20$ anhand einer Wertetabelle.
Beurteile: „Weil $e^x$ auf lange Sicht schneller wächst als $x^3$, ist
$e^x$ schon für jedes positive $x$ größer als $x^3$."
Erkläre auch, was eine endliche Wertetabelle über das Verhalten im
Unendlichen belegen kann und was nicht.

**2. Vergleich für $x\to+\infty$ (6 BE)**

Begründe plausibel
$$
\lim_{x\to+\infty}\frac{x^3}{e^x}=0
\qquad\text{und}\qquad
\lim_{x\to+\infty}\frac{e^x}{x^3}=+\infty.
$$
Wähle dazu zum Beispiel ein geeignetes $m$ im Hilfsmittel und vergleiche
mit einem einfacheren Term. Erläutere, wie sich der Gedanke auf jede
fest gewählte positive ganze Potenz $x^n$ übertragen lässt.

**3. Die andere Richtung im Unendlichen (6 BE)**

Bestimme und begründe
$$
\lim_{x\to-\infty}x^3e^x
\qquad\text{und}\qquad
\lim_{x\to-\infty}x^4e^x.
$$
Führe den Vergleich auf die bereits betrachtete positive Richtung
zurück, zum Beispiel durch $u=-x$. Gib außerdem an, von welcher Seite
sich die Funktionswerte jeweils dem Grenzwert nähern.

**4. Auf veränderte Terme übertragen (4 BE)**

Bestimme beide Grenzwerte für $x\to+\infty$ mit einer kurzen passenden
Begründung:
$$
(3x^2-4x+1)e^{-x},\qquad\frac{e^x}{x^3+1}.
$$
Bloße Schlagwörter ohne erkennbaren Vergleich der gegebenen Faktoren
genügen nicht.
''',
task_en=r'''# Compare natural exponential growth and powers

Justify the limiting behaviour. You may use the following auxiliary
inequality without proof: for $x\geq0$ and every positive integer $m$,
$$
e^x\geq\frac{x^m}{m!}.
$$
For example, $4!=24$. Any other mathematically sound justification is
equally acceptable. A calculator is allowed for the numerical table.
Total: **20 points**.

**1. Values and a growth claim (4 points)**

Compare $e^x$ and $x^3$ in a table for $x=1,4,20$. Evaluate:
“Because $e^x$ eventually grows faster than $x^3$, it is already larger
than $x^3$ for every positive $x$.” Explain what a finite numerical
table can and cannot establish about behaviour at infinity.

**2. Comparison as $x\to+\infty$ (6 points)**

Give a plausible justification of
$$
\lim_{x\to+\infty}\frac{x^3}{e^x}=0
\qquad\text{and}\qquad
\lim_{x\to+\infty}\frac{e^x}{x^3}=+\infty.
$$
For example, choose a suitable $m$ in the auxiliary inequality and
compare with a simpler expression. Explain how the idea extends to any
fixed positive integer power $x^n$.

**3. The other direction at infinity (6 points)**

Find and justify
$$
\lim_{x\to-\infty}x^3e^x
\qquad\text{and}\qquad
\lim_{x\to-\infty}x^4e^x.
$$
Reduce the comparison to the positive direction already considered,
for example using $u=-x$. Also state from which side the function values
approach the limit in each case.

**4. Transfer to changed expressions (4 points)**

Find both limits as $x\to+\infty$, with a concise suitable justification:
$$
(3x^2-4x+1)e^{-x},\qquad\frac{e^x}{x^3+1}.
$$
Bare slogans without an identifiable comparison of the given factors
are insufficient.
''',
solution_de=r'''# Referenzlösung: asymptotischer Vergleich

**1.** Eine mögliche Tabelle ist:

| $x$ | $e^x$ ungefähr | $x^3$ |
|---:|---:|---:|
| 1 | 2,718 | 1 |
| 4 | 54,598 | 64 |
| 20 | 485165195,41 | 8000 |

Bei $x=4$ ist $e^4<4^3$, also ist die Behauptung falsch. Asymptotischer
Vergleich beschreibt das Verhalten für immer größere Argumente, nicht
eine überall geltende Größenordnung. Die Tabelle illustriert Beispiele
und kann die universelle Behauptung widerlegen, beweist allein aber
keinen Grenzwert im Unendlichen.

**2.** Wähle $m=4$. Für $x>0$ folgt
$$
0\leq\frac{x^3}{e^x}\leq\frac{24}{x}.
$$
Der obere Vergleichsterm geht gegen $0$, daher auch $x^3/e^x$.
Da dieser Quotient positiv ist und gegen $0$ geht, wächst sein
Kehrwert $e^x/x^3$ ohne obere Schranke und hat Grenzwert $+\infty$.
Für eine beliebige fest gewählte positive ganze Zahl $n$ wählt man
$m=n+1$ und erhält
$$
0\leq\frac{x^n}{e^x}\leq\frac{(n+1)!}{x}\longrightarrow0.
$$
So wird das schnellere Wachstum von $e^x$ gegenüber jeder solchen
festen Potenz durch einen Vergleich begründet, nicht nur behauptet.
Eine richtige alternative Begründung, etwa über andere passende
Abschätzungen, erhält denselben Kredit.

**3.** Setze $u=-x$. Für $x\to-\infty$ gilt $u\to+\infty$, und
$$
x^3e^x=-u^3e^{-u}=-\frac{u^3}{e^u}\longrightarrow0.
$$
Für negatives $x$ sind diese Funktionswerte negativ; sie nähern sich
$0$ von unten. Ebenso
$$
x^4e^x=u^4e^{-u}=\frac{u^4}{e^u}\longrightarrow0.
$$
Hier gilt der positive Vergleich mit $n=4$, etwa unter Verwendung
von $e^u\geq u^5/120$. Die Werte sind positiv und nähern sich $0$
von oben. Dass $e^x\to0$ allein folgt, würde ein Produkt mit einem
unbeschränkt großen Potenzfaktor noch nicht begründen.

**4.**
$$
(3x^2-4x+1)e^{-x}
=3\frac{x^2}{e^x}-4\frac{x}{e^x}+\frac1{e^x}\longrightarrow0.
$$
Die ersten beiden Quotienten verschwinden nach dem begründeten
Potenzvergleich, der letzte wegen $e^x\to+\infty$.
Ferner
$$
\frac{e^x}{x^3+1}
=\frac{e^x/x^3}{1+1/x^3}\longrightarrow+\infty,
$$
weil der Zähler gegen $+\infty$ und der Nenner gegen $1$ geht und
für große positive $x$ positiv ist. Gleichwertige Umformungen zählen.
''',
solution_en=r'''# Reference solution: asymptotic comparison

**1.** One possible table is:

| $x$ | approximate $e^x$ | $x^3$ |
|---:|---:|---:|
| 1 | 2.718 | 1 |
| 4 | 54.598 | 64 |
| 20 | 485165195.41 | 8000 |

Since $e^4<4^3$, the claim is false. An asymptotic comparison concerns
arbitrarily large arguments rather than an inequality valid everywhere.
The table illustrates examples and can refute the universal claim, but
alone cannot establish a limit at infinity.

**2.** Choose $m=4$. For $x>0$,
$$
0\leq\frac{x^3}{e^x}\leq\frac{24}{x}.
$$
The upper comparison tends to zero, so $x^3/e^x$ does too. Since this
ratio is positive and tends to zero, its reciprocal $e^x/x^3$ tends to
$+\infty$. For any fixed positive integer $n$, choose $m=n+1$:
$$
0\leq\frac{x^n}{e^x}\leq\frac{(n+1)!}{x}\longrightarrow0.
$$
This justifies faster exponential growth relative to each such fixed
power instead of merely asserting it. Correct alternative arguments,
such as other suitable bounds, receive equal credit.

**3.** Put $u=-x$. As $x\to-\infty$, $u\to+\infty$, and
$$
x^3e^x=-u^3e^{-u}=-\frac{u^3}{e^u}\longrightarrow0.
$$
For negative $x$, these values are negative, so they approach zero from
below. Similarly,
$$
x^4e^x=u^4e^{-u}=\frac{u^4}{e^u}\longrightarrow0.
$$
Here the positive-direction comparison for $n=4$ applies, for example
using $e^u\geq u^5/120$. The values are positive and approach zero
from above. Merely stating $e^x\to0$ does not by itself justify a
product with an unbounded power factor.

**4.**
$$
(3x^2-4x+1)e^{-x}
=3\frac{x^2}{e^x}-4\frac{x}{e^x}+\frac1{e^x}\longrightarrow0.
$$
The first two terms vanish by the justified power comparison, the last
because $e^x\to+\infty$. Also,
$$
\frac{e^x}{x^3+1}
=\frac{e^x/x^3}{1+1/x^3}\longrightarrow+\infty,
$$
because the numerator tends to $+\infty$ while the denominator tends
to 1 and is positive for large positive $x$. Equivalent rearrangements
receive equal credit.
''',
steps=[
('asym-finite',4,'Tabelle richtig (2); e⁴<64 als Gegenbeispiel genutzt (1); endliche Beispiele von begründetem Verhalten im Unendlichen unterschieden (1).','Correct table (2); uses e⁴<64 as counterexample (1); distinguishes finite examples from justified behaviour at infinity (1).'),
('asym-positive',6,'Tragfähigen positiven Vergleich etwa mit m=4 und Schranke 24/x hergeleitet (2); Nullgrenzwert daraus begründet (2); positiven Kehrwertgrenzwert +∞ erklärt (1); Übertragung auf festes n mit geeignetem m begründet (1).','Derives a sound positive-direction comparison, e.g. m=4 and bound 24/x (2); justifies zero limit (2); explains positive reciprocal limit +∞ (1); justifies transfer to fixed n with suitable m (1).'),
('asym-negative',6,'Richtungswechsel u=−x bzw. gleichwertigen Vergleich erklärt (1); ungeraden Fall mit richtigem Vorzeichen auf positiven Quotienten zurückgeführt (2); Nullgrenzwert und Annäherung von unten begründet (1); geraden Fall samt Annäherung von oben begründet (2).','Explains u=−x and direction change or an equivalent comparison (1); transforms the odd case with correct sign to a positive-direction quotient (2); justifies zero limit from below (1); justifies the even case and approach from above (2).'),
('asym-transfer',4,'Beide veränderten Terme mit nachvollziehbarer Übertragung richtig behandelt (je 2).','Correctly handles both changed expressions with traceable transfer (2 each).')],
essential_de='Kernleistungen sind begründete Wachstumsvergleiche in der positiven und in der negativen Richtung. Kappe die normale Gesamtpunktzahl auf höchstens 14 BE, wenn eine dieser beiden Begründungen in der gesamten Abgabe vollständig fehlt. Bloß richtige Grenzwerte oder die unbegründete Aussage „die Exponentialfunktion gewinnt“ ersetzen sie nicht. Eine knappe richtige Übertragung durch u=−x oder ein gleichwertiger Vergleich genügt für die negative Richtung; der Vergleich muss nicht in jedem Teil wiederholt werden. Ein lokaler Vorzeichen-, Zahlen- oder Schreibfehler bei sonst tragfähigem Argument allein löst keine Kappung aus.',
essential_en='The core actions are justified growth comparisons in positive and negative directions. Cap the ordinary total at 14 points if either justification is wholly absent across the submission. Correct limits alone or an unsupported slogan that the exponential wins do not replace it. A concise correct transfer using u=−x or an equivalent comparison suffices for the negative direction; the argument need not be repeated in every part. A local sign, numerical or notation slip alone does not trigger the cap when the reasoning is otherwise sound.'))

FORMS.append(dict(key='roots-of-unity',id='8e18154d-41d6-592e-ba98-537edad338e8',
task_de=r'''# Einheitswurzeln bestimmen und geometrisch deuten

Verwende $i^2=-1$. Winkel dürfen im Bogenmaß oder konsistent in Grad
angegeben werden. Für Polarformen darfst du
$(re^{i\varphi})^n=r^ne^{in\varphi}$ verwenden. Insgesamt **20 BE**.

**1. Alle sechsten Einheitswurzeln bestimmen (6 BE)**

Löse $z^6=1$ in den komplexen Zahlen. Begründe mit Betrag und Argument,
weshalb deine Liste alle Lösungen enthält. Gib zunächst die Lösungen
in Polarform an und vermeide doppelte Einträge.

**2. Algebraische Form (3 BE)**

Schreibe alle sechs Lösungen exakt in der Form $a+bi$.

**3. Am Einheitskreis deuten (6 BE)**

Fertige in der Gaußschen Zahlenebene eine eigene Skizze mit Einheitskreis,
bezeichneten Achsen und allen sechs Lösungspunkten an. Erläutere,
warum sie auf diesem Kreis liegen, wie groß der Winkelabstand
benachbarter Punkte ist und welche regelmäßige Figur sie bilden.
Erkläre auch geometrisch, was die Multiplikation einer Einheitswurzel
mit $e^{i\pi/3}$ bewirkt.

**4. Auf einen anderen Exponenten übertragen (3 BE)**

Bestimme alle Lösungen von $z^4=1$. Gib ihre algebraischen Werte an
und beschreibe ihre Anordnung am Einheitskreis.

**5. Innerhalb der Liste unterscheiden (2 BE)**

Welche deiner sechsten Einheitswurzeln erfüllen zusätzlich $z^3=1$?
Begründe deine Auswahl rechnerisch oder über ihre Winkel.
''',
task_en=r'''# Determine roots of unity and interpret them geometrically

Use $i^2=-1$. Give angles in radians or consistently in degrees.
For polar forms you may use $(re^{i\varphi})^n=r^ne^{in\varphi}$.
Total: **20 points**.

**1. Find all sixth roots of unity (6 points)**

Solve $z^6=1$ over the complex numbers. Use modulus and argument to
justify that your list contains every solution. First give the solutions
in polar form, without duplicates.

**2. Algebraic form (3 points)**

Write all six solutions exactly as $a+bi$.

**3. Interpret on the unit circle (6 points)**

Draw your own sketch in the complex plane, with a unit circle, labelled
axes and all six solution points. Explain why they lie on that circle,
the angular spacing between neighbours, and the regular figure they
form. Also explain geometrically what multiplication of a root by
$e^{i\pi/3}$ does.

**4. Transfer to another exponent (3 points)**

Find all solutions of $z^4=1$, give their algebraic values, and describe
their arrangement on the unit circle.

**5. Distinguish within the list (2 points)**

Which of your sixth roots also satisfy $z^3=1$? Justify your selection
using calculations or angles.
''',
solution_de=r'''# Referenzlösung: Einheitswurzeln

**1.** Aus $|z|^6=|1|=1$ folgt $|z|=1$. In der Form $z=e^{i\varphi}$
muss $e^{6i\varphi}=1$ gelten, also $6\varphi=2\pi k$ mit ganzzahligem
$k$. Verschiedene Lösungen erhält man durch
$$
z_k=e^{ik\pi/3},\qquad k=0,1,2,3,4,5.
$$
Die Winkel $0,\pi/3,2\pi/3,\pi,4\pi/3,5\pi/3$ sind in einer vollen
Umdrehung verschieden. Weitere ganze $k$ wiederholen diese Punkte wegen
der Periode $2\pi$. Betrag und Winkelbedingung lassen keine anderen
Lösungen zu. Äquivalente Winkel, etwa negative Vertreter, zählen voll,
wenn keine Lösung fehlt oder doppelt gezählt wird.

**2.** In derselben Reihenfolge:
$$
1,\quad\frac12+\frac{\sqrt3}{2}i,\quad
-\frac12+\frac{\sqrt3}{2}i,\quad-1,\quad
-\frac12-\frac{\sqrt3}{2}i,\quad
\frac12-\frac{\sqrt3}{2}i.
$$

**3.** In der Skizze liegt die reelle Achse waagerecht und die imaginäre
senkrecht. Die sechs Punkte haben Koordinaten
$(1,0)$, $(1/2,\sqrt3/2)$, $(-1/2,\sqrt3/2)$, $(-1,0)$,
$(-1/2,-\sqrt3/2)$, $(1/2,-\sqrt3/2)$ auf dem Kreis mit Mittelpunkt
Ursprung und Radius $1$. Der Betrag ist jeweils der Abstand zum Ursprung.
Die Winkelabstände sind $\pi/3=60^\circ$; die Punkte bilden die Ecken
eines regelmäßigen Sechsecks. Multiplikation mit $e^{i\pi/3}$ addiert
$\pi/3$ zum Argument und lässt den Betrag $1$ unverändert. Sie dreht
jeden Punkt um $60^\circ$ gegen den Uhrzeigersinn auf den nächsten
Punkt; der letzte geht wieder auf den ersten über. Diese Angaben
beschreiben die erwartete Skizze vollständig.

![Referenzskizze nur zur Lösung: sechs markierte sechste Einheitswurzeln mit ihren Argumenten auf dem Einheitskreis; sie bilden ein regelmäßiges Sechseck.](/assets/assessment-materials/mathematik/8e18154d-41d6-592e-ba98-537edad338e8/sixth-roots-solution-v1.png)

**4.** Analog sind die Winkel $0,\pi/2,\pi,3\pi/2$ und die Lösungen
$1,i,-1,-i$. Sie bilden ein Quadrat mit Mittelpunkt Ursprung und
Ecken auf den Achsen.

**5.** Für $z_k$ ist $z_k^3=e^{ik\pi}=(-1)^k$.
Also sind genau $k=0,2,4$ zulässig:
$$
1,\qquad-\frac12+\frac{\sqrt3}{2}i,\qquad
-\frac12-\frac{\sqrt3}{2}i.
$$
Ihre Winkel haben Abstand $2\pi/3$; sie bilden ein gleichseitiges
Dreieck. Insbesondere ist $e^{i\pi/3}$ zwar eine sechste, aber keine
dritte Einheitswurzel, weil ihre dritte Potenz $-1$ ist.
''',
solution_en=r'''# Reference solution: roots of unity

**1.** Since $|z|^6=1$, we get $|z|=1$. Writing $z=e^{i\varphi}$
gives $e^{6i\varphi}=1$, hence $6\varphi=2\pi k$ for integer $k$.
Distinct solutions are
$$
z_k=e^{ik\pi/3},\qquad k=0,1,2,3,4,5.
$$
The angles $0,\pi/3,2\pi/3,\pi,4\pi/3,5\pi/3$ are distinct in one
full turn. Other integers repeat these points by period $2\pi$.
The modulus and argument conditions leave no other solutions. Equivalent
angle representatives, including negative angles, receive full credit
if no solution is missing or counted twice.

**2.** In the same order:
$$
1,\quad\frac12+\frac{\sqrt3}{2}i,\quad
-\frac12+\frac{\sqrt3}{2}i,\quad-1,\quad
-\frac12-\frac{\sqrt3}{2}i,\quad
\frac12-\frac{\sqrt3}{2}i.
$$

**3.** The sketch has a horizontal real axis and vertical imaginary
axis. Its six points have coordinates $(1,0)$, $(1/2,\sqrt3/2)$,
$(-1/2,\sqrt3/2)$, $(-1,0)$, $(-1/2,-\sqrt3/2)$,
$(1/2,-\sqrt3/2)$ on the circle centred at the origin with radius 1.
Modulus is distance from the origin. Adjacent angles differ by
$\pi/3=60^\circ$, forming a regular hexagon. Multiplication by
$e^{i\pi/3}$ adds $\pi/3$ to the argument without changing modulus 1:
it rotates every point $60^\circ$ anticlockwise to the next point,
with the last returning to the first. These details fully describe
the expected sketch.

![Reference sketch for the solution only: six labelled sixth roots with their arguments on the unit circle, forming a regular hexagon.](/assets/assessment-materials/mathematik/8e18154d-41d6-592e-ba98-537edad338e8/sixth-roots-solution-v1.png)

**4.** Similarly, angles $0,\pi/2,\pi,3\pi/2$ give $1,i,-1,-i$,
forming a square centred at the origin with vertices on the axes.

**5.** We have $z_k^3=e^{ik\pi}=(-1)^k$, so exactly $k=0,2,4$ work:
$$
1,\qquad-\frac12+\frac{\sqrt3}{2}i,\qquad
-\frac12-\frac{\sqrt3}{2}i.
$$
Their angular spacing is $2\pi/3$, forming an equilateral triangle.
In particular $e^{i\pi/3}$ is a sixth root but not a third root,
since its cube is $-1$.
''',
steps=[
('unity-solve',6,'Betrag 1 hergeleitet (1); Winkelbedingung 6φ=2πk begründet (2); alle sechs verschiedenen Polarformen angegeben (2); Vollständigkeit und Wiederholung nach 2π erklärt (1).','Derives modulus 1 (1); justifies angle condition 6φ=2πk (2); lists all six distinct polar forms (2); explains completeness and repetition after 2π (1).'),
('unity-algebra',3,'Sechs exakte algebraische Werte richtig (je 0,5).','Six correct exact algebraic values (0.5 each).'),
('unity-geometry',6,'Betrag mit Einheitskreis verknüpft (1); eigene Skizze mit Achsen und sechs passenden Punkten (2); Winkelabstand (1); regelmäßiges Sechseck (1); Multiplikation als Drehung zum nächsten Punkt erklärt (1).','Connects modulus to unit circle (1); own sketch with axes and six suitable points (2); angular spacing (1); regular hexagon (1); explains multiplication as rotation to next point (1).'),
('unity-fourth',3,'Vier vierte Einheitswurzeln vollständig (2); Quadrat am Einheitskreis passend gedeutet (1).','Complete four fourth roots (2); correct square interpretation on unit circle (1).'),
('unity-subset',2,'Genau drei gemeinsame Lösungen gewählt (1); durch dritte Potenz oder Winkelbedingung begründet (1).','Chooses exactly the three common roots (1); justifies by cubing or argument condition (1).')],
essential_de='Kernleistungen sind die begründete Lösungsbestimmung und die geometrische Deutung am Einheitskreis. Kappe die normale Gesamtpunktzahl auf höchstens 14 BE, wenn in der gesamten Abgabe keinerlei tragfähige Methode zur Bestimmung der Einheitswurzeln oder keinerlei tragfähige geometrische Deutung erkennbar ist. Eine passende Skizze mit verständlicher Erklärung oder eine gleichwertige geometrische Erläuterung an anderer Stelle zählt. Die ausdrücklich verlangte eigene Skizze hat zusätzlich ihre angegebenen 2 BE innerhalb der Gesamtbewertung; ihr Fehlen allein löst bei sonst vorhandener Deutung keine Kappung aus. Eine einzelne vergessene Wurzel, ein lokaler Winkelfehler oder eine andere Nummerierung löst allein ebenfalls keine Kappung aus.',
essential_en='The core actions are justified solution and geometric interpretation on the unit circle. Cap the ordinary total at 14 points if the whole submission contains no sound method of determining roots of unity or no sound geometric interpretation. A suitable explained sketch or equivalent geometric explanation elsewhere counts. The explicitly requested own sketch has its stated 2 points within the total; its absence alone does not trigger a cap when the interpretation is otherwise present. One missing root, a local angular slip or a different numbering alone does not trigger the cap either.'))

FORMS.append(dict(key='complex-division',id='5ba7b5aa-7ad5-5605-bcb5-f4aa4b4c6b2d',
task_de=r'''# Komplexe Quotienten algebraisch berechnen

Verwende $i^2=-1$ und gib Ergebnisse exakt in der Form $a+bi$ an.
Zeige nachvollziehbare Rechenschritte. Insgesamt **20 BE**.

**1. Konjugiert erweitern und erläutern (9 BE)**

Berechne
$$
q_1=\frac{3+4i}{1-2i}.
$$
Erweitere mit dem konjugiert komplexen Nenner. Erläutere an dieser
Rechnung, weshalb das Erweitern den Quotienten nicht verändert und
weshalb der neue Nenner reell ist.
Du darfst die Konjugationsrechnung mit Erklärung stattdessen an einem
Quotienten aus Teil 2 zeigen; $q_1$ ist in jedem Fall zu berechnen.

**2. Auf andere Nenner übertragen (7 BE)**

Berechne mit nachvollziehbarem Verfahren:
$$
q_2=\frac{2-3i}{1+2i}\quad(3\,\mathrm{BE}),\qquad
q_3=\frac{4-2i}{2i}\quad(2\,\mathrm{BE}),\qquad
q_4=\frac1{2+i}\quad(2\,\mathrm{BE}).
$$
Eine passende alternative algebraische Rechnung in diesen drei Fällen
ist zulässig.

**3. Kontrollieren und einen Fehler erklären (4 BE)**

Prüfe dein Ergebnis für $q_1$ durch Multiplikation mit $1-2i$.
Jemand behauptet, man dürfe Real- und Imaginärteile getrennt dividieren:
$$
\frac{3+4i}{1-2i}=\frac31+\frac4{-2}i=3-2i.
$$
Prüfe auch diesen Vorschlag durch Multiplikation mit dem ursprünglichen
Nenner und erläutere, warum das behauptete Verfahren nicht richtig ist.
''',
task_en=r'''# Calculate complex quotients algebraically

Use $i^2=-1$ and give exact results as $a+bi$. Show traceable calculation
steps. Total: **20 points**.

**1. Multiply by the conjugate and explain (9 points)**

Calculate
$$
q_1=\frac{3+4i}{1-2i}.
$$
Multiply numerator and denominator by the complex conjugate of the
denominator. Explain why this leaves the quotient unchanged and why
the new denominator is real.
You may instead demonstrate and explain the conjugate calculation on one
quotient from part 2; $q_1$ must still be calculated.

**2. Transfer to other denominators (7 points)**

Calculate by a traceable method:
$$
q_2=\frac{2-3i}{1+2i}\quad(3\text{ points}),\qquad
q_3=\frac{4-2i}{2i}\quad(2\text{ points}),\qquad
q_4=\frac1{2+i}\quad(2\text{ points}).
$$
A suitable alternative algebraic method is accepted in these three cases.

**3. Check and explain an error (4 points)**

Check your $q_1$ result by multiplying it by $1-2i$. Someone claims we
may divide real and imaginary parts separately:
$$
\frac{3+4i}{1-2i}=\frac31+\frac4{-2}i=3-2i.
$$
Also check this proposal by multiplying it by the original denominator,
and explain why the proposed procedure is incorrect.
''',
solution_de=r'''# Referenzlösung: komplexe Division

**1.** Der konjugierte Nenner zu $1-2i$ ist $1+2i$. Damit
$$
q_1=\frac{(3+4i)(1+2i)}{(1-2i)(1+2i)}
=\frac{3+10i+8i^2}{1-(2i)^2}
=\frac{-5+10i}{5}=-1+2i.
$$
Zähler und Nenner werden mit derselben Zahl multipliziert; der
zusätzliche Faktor $(1+2i)/(1+2i)$ ist $1$. Der Quotient bleibt
unverändert. Im Nenner heben sich die gemischten imaginären Summanden
auf; wegen $i^2=-1$ ergibt sich $1+4=5$. Das ist das gezielte Nutzen
der Konjugation, nicht eine getrennte Division der beiden Komponenten.

**2.**
$$
q_2=\frac{(2-3i)(1-2i)}{(1+2i)(1-2i)}
=\frac{2-7i+6i^2}{5}
=-\frac45-\frac75i.
$$
Für den rein imaginären Nenner kann man mit $-2i$ erweitern:
$$
q_3=\frac{(4-2i)(-2i)}{(2i)(-2i)}
=\frac{-4-8i}{4}=-1-2i.
$$
Ebenso ist eine Rechnung mit $1/i=-i$ passend.
$$
q_4=\frac{2-i}{(2+i)(2-i)}=\frac{2-i}{5}
=\frac25-\frac15i.
$$
Andere richtige algebraische Verfahren für die drei Transferrechnungen
werden gleichwertig bewertet.

**3.** Die richtige Probe lautet
$$
(-1+2i)(1-2i)=-1+4i-4i^2=3+4i.
$$
Beim falschen Vorschlag ergibt sich dagegen
$$
(3-2i)(1-2i)=3-8i+4i^2=-1-8i\ne3+4i.
$$
Das Ergebnis muss mit dem ursprünglichen Nenner multipliziert wieder
den Zähler ergeben. Die getrennte Division missachtet die gemischten
Produkte und $i^2=-1$ in der komplexen Multiplikation. Sie kann daher
nicht die Umkehroperation der Multiplikation sein. Die beiden Proben
belegen am konkreten Beispiel den Unterschied.
''',
solution_en=r'''# Reference solution: complex division

**1.** The conjugate of $1-2i$ is $1+2i$, so
$$
q_1=\frac{(3+4i)(1+2i)}{(1-2i)(1+2i)}
=\frac{3+10i+8i^2}{1-(2i)^2}
=\frac{-5+10i}{5}=-1+2i.
$$
Multiplying numerator and denominator by the same number introduces
the factor $(1+2i)/(1+2i)=1$, leaving the quotient unchanged.
The mixed imaginary terms cancel in the denominator; $i^2=-1$ gives
$1+4=5$. This uses conjugation deliberately rather than dividing
components separately.

**2.**
$$
q_2=\frac{(2-3i)(1-2i)}{(1+2i)(1-2i)}
=\frac{2-7i+6i^2}{5}
=-\frac45-\frac75i.
$$
For the purely imaginary denominator one can multiply both parts by $-2i$:
$$
q_3=\frac{(4-2i)(-2i)}{(2i)(-2i)}
=\frac{-4-8i}{4}=-1-2i.
$$
Using $1/i=-i$ also works.
$$
q_4=\frac{2-i}{(2+i)(2-i)}=\frac{2-i}{5}
=\frac25-\frac15i.
$$
Other correct algebraic methods for these three transfer calculations
receive equal credit.

**3.** The correct check is
$$
(-1+2i)(1-2i)=-1+4i-4i^2=3+4i.
$$
The incorrect proposal instead gives
$$
(3-2i)(1-2i)=3-8i+4i^2=-1-8i\ne3+4i.
$$
A quotient multiplied by the original denominator must recover the
numerator. Separate component division ignores the mixed products and
$i^2=-1$ in complex multiplication, so it cannot invert that operation.
The two checks demonstrate the distinction in the given example.
''',
steps=[
('division-conjugate',6,'Geeignete Konjugation tatsächlich benutzt (2); Erweitern beider Bruchteile als wertgleich erläutert (2); reellen Nenner durch Aufhebung der imaginären Terme und i²=−1 erklärt (2).','Actually uses an appropriate conjugate (2); explains preservation of the quotient by multiplying both parts (2); explains a real denominator through cancellation of imaginary terms and i²=−1 (2).'),
('division-q1',3,'Nachvollziehbare algebraische Ausführung für q1 (2); Ergebnis −1+2i (1). Beim konjugierten Erweitern entstehen beispielsweise −5+10i und 5; ein gleichwertiges algebraisches Verfahren zählt, wenn die Konjugationsleistung anderweitig gezeigt wird. Die bereits im Methodenkriterium bewertete bloße Wahl der Konjugierten zählt hier nicht nochmals.','Traceable algebraic calculation for q1 (2); result −1+2i (1). Conjugation gives, for example, −5+10i and 5; an equivalent algebraic method counts when conjugate work is demonstrated elsewhere. Do not award these calculation points again merely for choosing the conjugate already credited in the method criterion.'),
('division-q2',3,'Zähler-/Nennerrechnung oder gleichwertige algebraische Ausführung (2); −4/5−(7/5)i (1).','Numerator/denominator calculation or equivalent algebraic computation (2); −4/5−(7/5)i (1).'),
('division-q3',2,'Rein imaginären Nenner nachvollziehbar behandelt (1); −1−2i (1).','Traceably handles the purely imaginary denominator (1); −1−2i (1).'),
('division-q4',2,'Kehrwert nachvollziehbar bestimmt (1); 2/5−(1/5)i (1).','Traceably finds the reciprocal (1); 2/5−(1/5)i (1).'),
('division-check',4,'Richtige Produktprobe (1); falsches Ergebnis durch Produkt −1−8i widerlegt (1); Fehler der komponentenweisen Division fachlich erklärt (2).','Correct product check (1); refutes incorrect result by product −1−8i (1); explains why componentwise division is invalid (2).')],
essential_de='Der tatsächliche Gebrauch konjugiert komplexer Zahlen bei einer Division gehört zum ganzen Kompetenzvertrag. Kappe die normale Gesamtpunktzahl auf höchstens 14 BE, wenn in der gesamten Abgabe keine solche nachvollziehbare Quotientenrechnung erkennbar ist. Bloßes Nennen eines konjugierten Ausdrucks oder eine losgelöste Formel ohne Anwendung genügt nicht. Eine richtig kommentierte Konjugationsrechnung bei einem der vier Quotienten zählt für das Methodenkriterium; ausführliche Prosa ist nicht nötig. Ein lokaler Vorzeichen- oder Rechenfehler allein löst keine Kappung aus. Der verlangte Methodengebrauch muss erkennbar sein; für die übrigen Rechnungen sind andere richtige algebraische Verfahren vollständig gleichwertig.',
essential_en='Actual use of complex conjugates in division belongs to the complete competence. Cap the ordinary total at 14 points if the whole submission contains no traceable conjugate-based quotient calculation. Merely naming a conjugate or an isolated unused formula is insufficient. Correctly annotated conjugate work on any of the four quotients counts towards the method criterion; extended prose is not needed. A local sign or arithmetic error alone does not trigger the cap. The required method must be demonstrated; other correct algebraic methods are fully equivalent for the remaining calculations.'))

COMMON_DE='''# Eine Gesamtbewertung

20 BE insgesamt; genau ein Ergebnis: **bestanden ab 15 BE**, sonst nicht
bestanden. Keine getrennten Teilbestehensgrenzen und keine zusätzlichen
qualifizierenden Belege. Die normalen Kriterien bilden auch die jeweils
unverzichtbaren Kernhandlungen ab.

Bewerte fachlich gleichwertige Ergebnisse, Schreibweisen und zulässige
Methoden gleich; ausdrücklich verlangte Handlungen bleiben verbindlich.
Eine knappe richtige Begründung genügt und zählt unabhängig vom Ort in
der Abgabe. Identische Leistung nur einmal werten. Teilpunkte wie
angegeben, sonst 0,5 BE für eine sinnvolle unvollständige Teilleistung.
Einen lokalen Rechen-, Vorzeichen- oder Übertragungsfehler nicht mehrfach
bestrafen; richtige nachvollziehbare Folgearbeit behält ihren Kredit.
Rundungen aus vorgegebenen Näherungsdaten angemessen behandeln.
Die unten begründete Kappung betrifft ausschließlich die eine normale
Gesamtpunktzahl vor dem Vergleich mit 15 BE. Sie erzeugt weder ein
zweites Ergebnis noch zusätzliche Mastery-Belege.

| Kriterium | BE |
|---|---:|
'''
COMMON_EN='''# One overall result

20 points in total, exactly one result: **pass at 15 points**, otherwise
not passed. No separate part-pass thresholds or additional qualifying
evidence. The ordinary criteria include the indispensable core actions.

Credit equivalent results, notation and permitted methods equally;
explicitly requested actions remain binding. Concise correct reasoning
counts wherever it appears. Count identical work only once. Award partial
marks as specified, otherwise 0.5 for meaningful incomplete work. Do not
repeatedly penalise one local arithmetic, sign or transcription error;
credit correct traceable follow-through. Handle rounding from supplied
approximate data reasonably.
The justified cap below applies only to the one ordinary total before
comparison with 15. It creates neither a second outcome nor additional
mastery evidence.

| Criterion | Points |
|---|---:|
'''

for f in FORMS:
 folder=H/f['id'];assert folder.is_dir()
 for key in ['task_de','task_en','solution_de','solution_en']:
  f[key]=re.sub(r'\$\$(.*?)\$\$',lambda m:'\n$$\n'+m.group(1).strip()+'\n$$\n',f[key],flags=re.S)
 rd=COMMON_DE+''.join(f'| {de} | {p} |\n' for _,p,de,en in f['steps'])+'\n'+f['essential_de']+'\n'
 re_=COMMON_EN+''.join(f'| {en} | {p} |\n' for _,p,de,en in f['steps'])+'\n'+f['essential_en']+'\n'
 for name,text in {'task.de.md':f['task_de'],'task.en.md':f['task_en'],'solution.de.md':f['solution_de'],'solution.en.md':f['solution_en'],'rubric.de.md':rd,'rubric.en.md':re_}.items():(folder/name).write_text(text)
 current=by[f['id']]
 payload={'reviewStatus':'draft','taskContent':f['task_de'],'taskContentEn':f['task_en'],'solutionContent':f['solution_de']+'\n'+rd,'solutionContentEn':f['solution_en']+'\n'+re_,'coveredGoalIds':[f['id']],'coveredStrands':current['dimensionTags']['guidingIdeas'],'demandLevels':[current['dimensionTags']['demandLevel']],'scoring':{'maxPoints':20,'passingPoints':15,'steps':[{'id':i,'points':p,'description':de,'descriptionEn':en} for i,p,de,en in f['steps']]}}
 assert sum(s['points'] for s in payload['scoring']['steps'])==20
 use='CONTENT_ONLY_NO_ROLE_ACTIVATION_OR_PLACEMENT'
 if f['key']=='asymptotic-by-content':use='CONTENT_ONLY_FOR_REMAINING_BY_GAP_KEEP_EXISTING_B2_REUSE_OUTSIDE_BY_NO_GLOBAL_EXTRA_OBLIGATION'
 (folder/'whole-form-content.draft.json').write_text(json.dumps({'status':use,'assessmentOfExistingGoalId':f['id'],'examDataContent':payload,'canonicalGoalMutation':False,'newAssessmentIdAssigned':False,'reviewDecision':'PENDING_GENUINE_INDEPENDENT_CONTENT_REVIEW','mastery':'Only one ordinary total-score binary result; no qualifying extra evidence or prerequisite mastery claim.'},ensure_ascii=False,indent=2)+'\n')

(H/'author-package.json').write_text(json.dumps({'status':'FOUR_ROLE_NEUTRAL_WHOLE_CONTENT_FORMS_PENDING_GENUINE_REVIEW_NO_ACTIVATION','canonicalOriginal':frozen['canonical'],'headAtContextFreeze':frozen['head'],'forms':[{'key':f['key'],'goalId':f['id']} for f in FORMS],'canonicalRoleAndPlacementChanges':False,'newGoalIdsOrRequires':False,'807SnapshotChanges':False,'sourceFidelity':'Actual document-specific sourceGoal/passsage bindings retained, not the first PDF header. Original missing EA formula images recovered from official linked SVGs without modifying source data.','assessmentSemantics':'One total 20, pass 15, transparent ordinary 14-point cap only for an entirely absent indispensable core action. No extra mastery qualification evidence or part-pass thresholds.','notClaimed':['independent approval','activation or placement','Native/Stage/CI/M7 acceptance','single-goal mastery from an existing broader exam','new source or scope adoption']},ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'wholeForms':len(FORMS),'scoreEach':'20/15','roleOrActivationChanges':False,'newAssessmentIds':False}))
