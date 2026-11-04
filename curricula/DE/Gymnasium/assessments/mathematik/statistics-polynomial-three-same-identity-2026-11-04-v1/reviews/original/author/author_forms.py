"""Finite original author drafts. Never writes root or an approval decision."""
from pathlib import Path
from copy import deepcopy
from hashlib import sha256
import json
import re

HERE=Path(__file__).resolve().parent
assert not (HERE/'content-review-handoff.json').exists(), 'Frozen author batch.'
frozen=json.loads((HERE/'frozen-input.json').read_text())
by={g['id']:g for g in frozen['wholeGoals']}
FORMS=[]

FORMS.append(dict(key='decision',id='613871f6-ccb2-51fe-aba2-0dd17b86a89e',
task_de=r'''# Eine sparsame und verlässliche Prüfregel entwickeln

Ein Betrieb untersucht eine große Lieferung durch unabhängige, zufällig
ausgewählte Teile. Jedes Teil ist mit derselben Wahrscheinlichkeit $p$
fehlerhaft. In diesem vereinfachten Entscheidungsmodell kommen **nur**
$H_0:p=0{,}10$ und $H_1:p=0{,}30$ infrage. „Beanstanden“ bedeutet,
$H_0$ zu verwerfen; „nicht beanstanden“ bedeutet keine Gewissheit über $H_0$.

Gesucht ist eine Regel mit
$P_{0{,}10}(\text{beanstanden})\leq0{,}05$ und
$P_{0{,}30}(\text{beanstanden})\geq0{,}90$.
Unter den zulässigen Regeln soll die **erwartete Anzahl geprüfter Teile bei
$p=0{,}10$** möglichst klein sein. Verglichen werden ausschließlich die
folgenden Entwürfe. Ein Rechner für Binomialwahrscheinlichkeiten ist erlaubt;
gib die Ereignisse beziehungsweise Summen an, die du berechnest.
Insgesamt sind **20 BE** erreichbar.

**1. Feste Stichproben (5 BE)**

Für $n=20$ und $n=40$ wird beanstandet, wenn die Fehlerzahl $X_n\geq k_n$
ist. Bestimme jeweils die kleinste ganzzahlige Schwelle $k_n$, die die
erste Fehlergrenze einhält. Belege die Grenze auch durch die unmittelbar
kleinere Schwelle. Prüfe dann die geforderte Entdeckungswahrscheinlichkeit.
Erläutere, weshalb unter diesen Schwellen eine größere Schwelle keine
bessere Entdeckungswahrscheinlichkeit bringt.

**2. Zweistufige Regeln entwickeln und prüfen (8 BE)**

Zunächst werden $20$ Teile geprüft; ihre Fehlerzahl ist $X$. Wähle
$r\in\{5,6\}$ und vervollständige damit folgende Regel:

- Falls $X\geq r$: sofort beanstanden.
- Falls $X\leq2$: sofort nicht beanstanden.
- Falls $3\leq X\leq r-1$: weitere $20$ unabhängige Teile prüfen.
  Ihre Fehlerzahl sei $Y$. Beanstanden genau dann, wenn $X+Y\geq8$.

Leite für beliebiges $p$ eine Formel für die Beanstandungswahrscheinlichkeit
dieser **gesamten** Regel her. Berechne sie für beide Werte von $r$ jeweils
bei $p=0{,}10$ und $p=0{,}30$. Entscheide, welche Entwürfe beide Grenzen
einhalten. Erkläre, warum die Fehlerwahrscheinlichkeit der zweistufigen
Regel nicht einfach $P_p(X+Y\geq8)$ ist.

**3. Aufwand und endgültige Entscheidung (5 BE)**

Bestimme für die zulässige zweistufige Regel die erwartete Anzahl $N$
geprüfter Teile bei $p=0{,}10$. Vergleiche sie mit den zulässigen festen
Regeln. Formuliere eine eindeutige vollständige Handlungsvorschrift für
den Betrieb und begründe deine Wahl durch beide Fehlergrenzen und das
Aufwandsziel. Ordne auch $X=2$, $X=5$ und $X=6$ ausdrücklich ein.

**4. Aussagegrenze (2 BE)**

Beurteile: „Unsere Rechnung beweist die verlangten Fehlergrenzen für jeden
denkbaren Fehleranteil einer realen Lieferung.“ Nenne zwei Annahmen oder
Einschränkungen, die für deine Entscheidung wichtig sind.
''',
task_en=r'''# Develop an economical and reliable inspection rule

A company inspects a large shipment using independent, randomly selected
items. Every item has the same probability $p$ of being defective.
This simplified decision model allows **only** $H_0:p=0.10$ and
$H_1:p=0.30$. “Flag” means reject $H_0$; “do not flag” does not establish
that $H_0$ is certainly true.

The rule must satisfy $P_{0.10}(\text{flag})\leq0.05$ and
$P_{0.30}(\text{flag})\geq0.90$. Among admissible rules, minimise the
**expected number of inspected items when $p=0.10$**. Compare only the
designs below. A calculator for binomial probabilities is allowed; state
the events or sums evaluated. A total of **20 points** is available.

**1. Fixed samples (5 points)**

For $n=20$ and $n=40$, flag when the number of defective items
$X_n\geq k_n$. For each sample size find the smallest integer threshold
meeting the first error bound. Also test the immediately smaller
threshold to establish the boundary. Then check the required detection
probability. Explain why a larger threshold cannot improve detection.

**2. Develop and check two-stage rules (8 points)**

First inspect $20$ items, with defective count $X$. Choose $r\in\{5,6\}$
to complete this rule:

- If $X\geq r$: flag immediately.
- If $X\leq2$: do not flag; stop immediately.
- If $3\leq X\leq r-1$: inspect another $20$ independent items, with
  defective count $Y$. Flag exactly when $X+Y\geq8$.

For arbitrary $p$, derive the probability of flagging under this **whole**
rule. Calculate it for both values of $r$, at both $p=0.10$ and $p=0.30$.
Decide which designs meet both bounds. Explain why the two-stage error
probability is not simply $P_p(X+Y\geq8)$.

**3. Effort and final decision (5 points)**

For the admissible two-stage rule, calculate the expected number $N$ of
inspected items when $p=0.10$. Compare it with the admissible fixed-sample
rules. State a complete, unambiguous procedure for the company, justifying
your choice by both error bounds and the effort objective. Explicitly
include the cases $X=2$, $X=5$ and $X=6$.

**4. Limits of the conclusion (2 points)**

Evaluate: “Our calculation proves the required error bounds for every
possible defect rate in a real shipment.” State two assumptions or
restrictions important to your decision.
''',
solution_de=r'''# Referenzlösung: Entscheidungsregel

Für $Z\sim\operatorname{Bin}(n,p)$ sei
$$
T_{n,p}(k)=P_p(Z\geq k)=\sum_{j=k}^{n}\binom njp^j(1-p)^{n-j}.
$$
Mit wachsender Schwelle schrumpft das Verwerfungsereignis. Deshalb sinkt
seine Wahrscheinlichkeit sowohl unter $H_0$ als auch unter $H_1$.
Die kleinste zulässige Schwelle hat die größte Entdeckungswahrscheinlichkeit
unter den hier erlaubten festen Schwellenregeln.

| $n$ | $k_n$ | $T_{n,0{,}10}(k_n-1)$ | $T_{n,0{,}10}(k_n)$ | $T_{n,0{,}30}(k_n)$ |
|---:|---:|---:|---:|---:|
| 20 | 5 | 0,132953 | 0,043174 | 0,762492 |
| 40 | 8 | 0,099516 | 0,041902 | 0,944717 |

Die feste 20er-Regel scheidet aus: Schon ihre unter der ersten Grenze
leistungsfähigste Schwelle erreicht nur etwa $76{,}25\%$ Entdeckung.
Die feste 40er-Regel mit Schwelle $8$ erfüllt beide Grenzen.

**Zweistufige Regeln.** $X,Y$ sind unabhängig und jeweils
$\operatorname{Bin}(20,p)$-verteilt. Die Beanstandungsereignisse
$\{X\geq r\}$ und $\{X=j,Y\geq8-j\}$ für $j=3,\ldots,r-1$
sind paarweise disjunkt. Daher ist
$$
B_r(p)=T_{20,p}(r)+\sum_{j=3}^{r-1}\binom{20}{j}p^j(1-p)^{20-j}
T_{20,p}(8-j).
$$
Eine gleichwertige vollständige Falltabelle oder direkte Summation über
die Paare $(X,Y)$ genügt ebenfalls.

| $r$ | $B_r(0{,}10)$ | $B_r(0{,}30)$ | beide Grenzen? |
|---:|---:|---:|---|
| 5 | 0,063319 | 0,933544 | nein: erste Grenze überschritten |
| 6 | 0,041711 | 0,927197 | ja |

Auch wenn der anfängliche Test mit Schwelle $5$ allein ein Niveau unter
$5\%$ hätte, kommt durch Fortsetzen und spätere Beanstandungen weitere
Wahrscheinlichkeit hinzu. Man muss die gesamte Regel prüfen.
$X+Y\geq8$ allein beschreibt sie nicht: Bei beispielsweise $X=6,Y=0$
beanstandet die Regel mit $r=6$ sofort, obwohl die gedachte Gesamtsumme
kleiner als $8$ ist. Bei $X=2,Y=10$ würde sie sofort ohne Beanstandung
stoppen. Ein hypothetisches $Y$ darf zur Wahrscheinlichkeitsrechnung
mitgedacht werden, wird bei frühem Stoppen aber nicht erhoben.

**Aufwand.** Bei $r=6$ sind $N=20$ oder $N=40$ möglich, und
$$
E_p(N)=20+20P_p(3\leq X\leq5).
$$
Bei $p=0{,}10$ ist die Fortsetzungswahrscheinlichkeit $0{,}311820$;
somit $E_{0{,}10}(N)\approx26{,}2364$. Das ist weniger als die stets
$40$ Prüfungen der zulässigen festen 40er-Regel. Unter den ausdrücklich
vorgegebenen Entwürfen wird die zweistufige Regel mit $r=6$ gewählt:

1. $20$ Teile prüfen und $X$ zählen.
2. Bei $X\leq2$ ohne Beanstandung stoppen; bei $X\geq6$ sofort beanstanden.
3. Bei $X=3,4,5$ weitere $20$ Teile prüfen und $Y$ zählen; genau bei
   $X+Y\geq8$ beanstanden, sonst nicht beanstanden.

Also stoppt $X=2$ ohne Beanstandung, $X=5$ führt zur zweiten Stufe
(Beanstandung dann bei $Y\geq3$), $X=6$ zur sofortigen Beanstandung.
Die Regel hält etwa $4{,}17\%$ Fehlbeanstandung und $92{,}72\%$
Entdeckung ein und hat im maßgeblichen Fall den kleineren Erwartungsaufwand.
Eine größere feste 40er-Schwelle kann diesen Aufwand von $40$ nicht senken.
Eine globale Optimalität unter allen denkbaren Prüfplänen wird nicht behauptet.

**Grenzen.** Die zitierte Behauptung ist falsch. Die numerischen Grenzen
wurden für genau die beiden zugelassenen Werte von $p$ berechnet, nicht
für sämtliche realen Anteile. Das Binomialmodell setzt unabhängige
Prüfungen mit gleichbleibendem $p$ voraus; starke Abhängigkeit, ein kleiner
Bestand ohne Zurücklegen oder eine nicht zufällige Auswahl können es
unpassend machen. Auch die Aufwandsoptimierung gilt hier ausdrücklich
bei $p=0{,}10$, nicht automatisch unter jeder anderen Bewertung.
''',
solution_en=r'''# Reference solution: decision rule

For $Z\sim\operatorname{Bin}(n,p)$ write
$$
T_{n,p}(k)=P_p(Z\geq k)=\sum_{j=k}^{n}\binom njp^j(1-p)^{n-j}.
$$
Increasing the threshold shrinks the rejection event, reducing its
probability under either hypothesis. Thus the smallest admissible
threshold has the greatest detection probability among the allowed
fixed-threshold rules.

| $n$ | $k_n$ | $T_{n,0.10}(k_n-1)$ | $T_{n,0.10}(k_n)$ | $T_{n,0.30}(k_n)$ |
|---:|---:|---:|---:|---:|
| 20 | 5 | 0.132953 | 0.043174 | 0.762492 |
| 40 | 8 | 0.099516 | 0.041902 | 0.944717 |

The fixed sample of 20 is inadmissible: even its most powerful threshold
meeting the first bound detects only about $76.25\%$. The fixed sample
of 40, with threshold 8, meets both bounds.

**Two stages.** $X,Y$ are independent and both distributed as
$\operatorname{Bin}(20,p)$. The flagging events $\{X\geq r\}$ and
$\{X=j,Y\geq8-j\}$, for $j=3,\ldots,r-1$, are pairwise disjoint. Hence
$$
B_r(p)=T_{20,p}(r)+\sum_{j=3}^{r-1}\binom{20}{j}p^j(1-p)^{20-j}
T_{20,p}(8-j).
$$
An equivalent complete case table or direct sum over pairs $(X,Y)$ is
equally valid.

| $r$ | $B_r(0.10)$ | $B_r(0.30)$ | both bounds? |
|---:|---:|---:|---|
| 5 | 0.063319 | 0.933544 | no: first bound exceeded |
| 6 | 0.041711 | 0.927197 | yes |

Even though the initial test with threshold 5 alone has error below
$5\%$, continuation adds further flagging probability. The entire rule
must be evaluated. The event $X+Y\geq8$ alone is different: for example,
with $r=6$, $X=6,Y=0$ flags immediately despite the hypothetical total
being below 8; $X=2,Y=10$ stops without flagging. An independent potential
$Y$ may be used for probability calculations but is not actually observed
after an early stop.

**Effort.** For $r=6$, $N$ is either 20 or 40, with
$$
E_p(N)=20+20P_p(3\leq X\leq5).
$$
At $p=0.10$ the continuation probability is $0.311820$, giving
$E_{0.10}(N)\approx26.2364$, below the constant 40 inspections of the
admissible fixed rule. Among the specified designs choose the two-stage
rule with $r=6$:

1. Inspect 20 items and count $X$.
2. Stop without flagging if $X\leq2$; flag immediately if $X\geq6$.
3. If $X=3,4,5$, inspect 20 further items and count $Y$; flag exactly when
   $X+Y\geq8$, otherwise do not flag.

Thus $X=2$ stops without flagging, $X=5$ continues (then flag if $Y\geq3$),
and $X=6$ flags immediately. The rule has about $4.17\%$ false flagging
and $92.72\%$ detection, with less expected effort in the specified case.
A larger fixed-40 threshold cannot reduce its sample count of 40.
No global optimality over every conceivable sampling plan is asserted.

**Limits.** The claim is false. The numerical bounds were checked at the
two specified values of $p$, not every real defect rate. The binomial
model assumes independent trials with constant $p$; dependence, a small
finite population sampled without replacement, or nonrandom selection
may invalidate it. The effort objective is explicitly evaluated at
$p=0.10$, rather than automatically under every other criterion.
''',
steps=[
('fixed-model',1,'Binomialereignis und Schrumpfen des Verwerfungsbereichs bei wachsender Schwelle richtig erklärt.','Correct binomial event and explanation that increasing the threshold shrinks the rejection region.'),
('fixed-thresholds',2,'Schwellen 5 und 8 samt jeweils unmittelbar kleinerer unzulässiger Schwelle nachvollziehbar bestimmt (je 1).','Derives thresholds 5 and 8 and checks each immediately smaller inadmissible threshold (1 each).'),
('fixed-power',2,'Beide Entdeckungswahrscheinlichkeiten und Zulässigkeit der festen Regeln richtig beurteilt (je 1).','Correct detection probabilities and admissibility of both fixed rules (1 each).'),
('two-stage-events',3,'Gesamtereignis in sofortige und spätere disjunkte Beanstandungen zerlegt (1); passende Summe oder gleichwertige Fallrechnung (1); Unabhängigkeit für Produkte genutzt (1).','Separates immediate and later disjoint flagging events (1), supplies a valid sum or case calculation (1), and uses independence for products (1).'),
('two-stage-values',3,'Vier Wahrscheinlichkeiten angemessen genau bestimmt (zusammen 2); nur r=6 als zulässig erkannt (1).','Calculates the four probabilities to suitable precision (2 together); identifies only r=6 as admissible (1).'),
('stopping-distinction',2,'Mindestens einen konkreten Unterschied zur festen Gesamtschwelle erklärt (1); zusätzlichen Fehler durch Fortsetzung bei r=5 erkannt (1).','Explains at least one concrete difference from a fixed total threshold (1); recognises additional error from continuation for r=5 (1).'),
('effort',2,'E(N)=20+20P(3≤X≤5) begründet (1); etwa 26,2364 gegenüber 40 berechnet (1).','Justifies E(N)=20+20P(3≤X≤5) (1); calculates about 26.2364 versus 40 (1).'),
('final-rule',3,'Vollständige eindeutige Regel mit X=2,5,6 (1); Wahl an beiden Grenzen (1) und Aufwandsziel im vorgegebenen Vergleich (1) begründet.','Complete unambiguous rule including X=2,5,6 (1); justifies selection by both bounds (1) and the effort objective within the specified comparison (1).'),
('limits',2,'Unzulässige Verallgemeinerung verworfen und zwei passende Annahmen/Einschränkungen erklärt (je 1).','Rejects the unsupported generalisation and explains two relevant assumptions or restrictions (1 each).')],
cap_de='Kappe die Gesamtpunktzahl auf höchstens 14 BE, wenn in der gesamten Abgabe keine mathematisch begründete vollständige Entscheidungsregel für die komplexe Situation entwickelt wird. Insbesondere ersetzen bloße Endschwellen ohne nachvollziehbare Prüfung beider Fehleranforderungen oder das ungeprüfte Übertragen einer festen Schwelle auf das zweistufige Verfahren die Kernleistung nicht. Ein tragfähiges Ereignismodell mit korrekter Fallunterscheidung und begründeter Regelwahl genügt auch bei einem lokalen Zahlenfehler; dieser allein löst keine Kappung aus. Die Erklärung darf knapp sein und an beliebiger Stelle stehen. Eine besondere Bezeichnung oder eine neue, über die vorgegebenen Entwürfe hinausgehende Regel ist nicht verlangt.',
cap_en='Cap the total at 14 points if the submission as a whole develops no mathematically justified complete decision rule for the complex situation. Merely listing thresholds without a traceable check of both error requirements, or transferring a fixed threshold to the two-stage procedure without evaluating it, does not demonstrate the core competence. A sound event model with correct cases and justified rule selection suffices even with a local numerical error; that alone does not trigger the cap. Concise reasoning anywhere in the submission counts. No particular term or additional design beyond those specified is required.'))

FORMS.append(dict(key='symmetry',id='0190e463-51a7-4860-9b35-d875530a85ba',
task_de=r'''# Symmetrie am Funktionsterm prüfen

Alle Funktionen haben den Definitionsbereich $\mathbb R$. Untersucht werden
ausschließlich **Symmetrie zur y-Achse** und **Punktsymmetrie zum Ursprung**.
Begründe rechnerisch und anhand der Termstruktur. Insgesamt **20 BE**.

**1. Drei Polynomterme (9 BE)**

Untersuche jede Funktion auf beide genannten Symmetrien. Berechne dazu
$f(-x)$, $g(-x)$ beziehungsweise $h(-x)$ und vergleiche mit dem
ursprünglichen Term und seinem Negativen. Erkläre außerdem, was die
vorkommenden Potenzen über die jeweilige Symmetrie aussagen.
$$
f(x)=2x^6-3x^4+5,\qquad g(x)=-x^5+4x^3-2x,\qquad h(x)=x^4+x^3-2.
$$

**2. Verdeckte Struktur (4 BE)**

Untersuche $u(x)=(x+1)^2+(x-1)^2$ auf beide Symmetrien.
Zeige durch eine geeignete Umformung oder Einsetzung, weshalb die
äußere Form mit den beiden Klammern allein keine verlässliche
Symmetrieentscheidung erlaubt.

**3. Eine Regel mit Sonderfällen (3 BE)**

Formuliere für einen zusammengefassten Polynomterm eine Regel zur
Entscheidung über die beiden Symmetrien. Ordne dabei auch die konstante
Funktion $v(x)=7$ und die Nullfunktion $z(x)=0$ ein. Berücksichtige,
dass der konstante Summand zum Exponenten $0$ gehört.

**4. Zwei Prüfbehauptungen (4 BE)**

Beurteile und begründe:

- „Ein Polynom geraden Grades ist immer y-achsensymmetrisch.“
- „Wenn $F(1)=F(-1)$ gilt, ist der ganze Polynomgraph
  y-achsensymmetrisch.“

Gib bei einer falschen Behauptung jeweils ein geeignetes Polynom als
Gegenbeispiel an und prüfe die entscheidenden Eigenschaften.
''',
task_en=r'''# Check symmetry from polynomial expressions

All functions have domain $\mathbb R$. Consider only **symmetry about the
y-axis** and **point symmetry about the origin**. Use calculations and
expression structure to justify your decisions. Total: **20 points**.

**1. Three polynomial expressions (9 points)**

Check each function for both symmetries. Calculate $f(-x)$, $g(-x)$ and
$h(-x)$, comparing with the original expression and its negative.
Also explain what the powers occurring in each expression imply.
$$
f(x)=2x^6-3x^4+5,\qquad g(x)=-x^5+4x^3-2x,\qquad h(x)=x^4+x^3-2.
$$

**2. Hidden structure (4 points)**

Check $u(x)=(x+1)^2+(x-1)^2$ for both symmetries. Use suitable algebra
or substitution to show why the outer form with two brackets alone
does not reliably decide symmetry.

**3. A rule including special cases (3 points)**

For a polynomial expression with like terms collected, state a rule for
deciding both symmetries. Include the constant function $v(x)=7$ and the
zero function $z(x)=0$. Remember that a constant term has exponent 0.

**4. Two proposed tests (4 points)**

Evaluate and justify:

- “Every polynomial of even degree is symmetric about the y-axis.”
- “If $F(1)=F(-1)$, the whole polynomial graph is symmetric about the y-axis.”

For each false statement, give a suitable polynomial counterexample and
check the decisive properties.
''',
solution_de=r'''# Referenzlösung: Symmetrie

Die Identitäten sind für **alle** reellen $x$ zu prüfen:
y-Achsensymmetrie bedeutet $F(-x)=F(x)$, Ursprungssymmetrie
$F(-x)=-F(x)$. Ein einzelnes passendes Wertepaar reicht nicht aus.

**1.**
$$
f(-x)=2x^6-3x^4+5=f(x).
$$
$f$ ist y-achsensymmetrisch. Es kommen nur gerade Exponenten einschließlich
$0$ vor. Ursprungssymmetrie liegt nicht vor: etwa $f(0)=5\ne0$.
$$
g(-x)=x^5-4x^3+2x=-g(x).
$$
$g$ ist punktsymmetrisch zum Ursprung. Alle vorhandenen Potenzen sind
ungerade; der konstante Summand ist $0$. Y-Achsensymmetrie liegt nicht vor,
etwa $g(1)=1$ und $g(-1)=-1$.
$$
h(-x)=x^4-x^3-2.
$$
Dieser Term ist weder identisch mit $h(x)=x^4+x^3-2$ noch mit
$-h(x)=-x^4-x^3+2$. Es liegen also beide untersuchten Symmetrien nicht
vor. Im zusammengefassten Term sind nicht verschwindende gerade und
ungerade Anteile enthalten. Ein rein formaler Vergleich oder passende
konkrete Gegenwerte für die jeweils verworfene Identität sind zulässig.

**2.**
$$
u(x)=x^2+2x+1+x^2-2x+1=2x^2+2.
$$
Die linearen Summanden heben sich auf. Daher $u(-x)=u(x)$:
y-Achsensymmetrie, aber keine Ursprungssymmetrie, etwa wegen $u(0)=2$.
Auch direktes Einsetzen ergibt $u(-x)=(-x+1)^2+(-x-1)^2=u(x)$.
Verschobene Einzelquadrate können zusammen also einen geraden Term ergeben.

**3.** Im zusammengefassten Polynom ist $F(-x)=F(x)$ genau dann erfüllt,
wenn alle Koeffizienten ungerader Potenzen null sind. Für
$F(-x)=-F(x)$ müssen alle Koeffizienten gerader Potenzen einschließlich
des konstanten Koeffizienten null sein. Nicht verschwindende Koeffizienten
sind entscheidend; bloß hingeschriebene Nullsummanden zählen nicht.
$v(x)=7$ ist nur y-achsensymmetrisch, denn $7\ne-7$.
$z(x)=0$ erfüllt beide Identitäten und besitzt beide Symmetrien.
Eine knappe sachlich gleichwertige Regel genügt.

**4.** Beide Behauptungen sind falsch:

- $F(x)=x^2+x$ hat Grad $2$, aber $F(-x)=x^2-x\ne F(x)$ als Identität;
  beispielsweise $F(1)=2\ne F(-1)=0$. Ein gerader höchster Exponent
  schließt ungerade niedrigere Summanden nicht aus.
- $F(x)=x^3-x$ erfüllt $F(1)=F(-1)=0$. Trotzdem ist es nicht
  y-achsensymmetrisch: $F(2)=6\ne F(-2)=-6$. Zwei passende Funktionswerte
  beweisen keine Identität für alle $x$.

Andere überprüfte Gegenbeispiele erhalten denselben Kredit. Ob eine
Funktion zusätzlich eine andere Symmetrieachse oder ein anderes Zentrum
besitzt, ist hier nicht verlangt.
''',
solution_en=r'''# Reference solution: symmetry

The identities must hold for **all** real $x$: y-axis symmetry means
$F(-x)=F(x)$, and origin symmetry means $F(-x)=-F(x)$. One matching pair
of values is insufficient.

**1.**
$$
f(-x)=2x^6-3x^4+5=f(x).
$$
Thus $f$ has y-axis symmetry: only even exponents, including 0, occur.
It lacks origin symmetry; for example, $f(0)=5\ne0$.
$$
g(-x)=x^5-4x^3+2x=-g(x).
$$
Thus $g$ has origin symmetry: only odd powers occur and the constant term
is zero. It lacks y-axis symmetry: $g(1)=1$ whereas $g(-1)=-1$.
$$
h(-x)=x^4-x^3-2.
$$
This is neither identically $h(x)=x^4+x^3-2$ nor
$-h(x)=-x^4-x^3+2$. Thus $h$ has neither symmetry under investigation.
Its collected expression has both nonzero even and odd parts. Formal
identity comparisons or suitable countervalues for each rejected
identity are acceptable.

**2.**
$$
u(x)=x^2+2x+1+x^2-2x+1=2x^2+2.
$$
The linear terms cancel. Hence $u(-x)=u(x)$: it has y-axis symmetry,
but not origin symmetry, since $u(0)=2$. Direct substitution also works:
$u(-x)=(-x+1)^2+(-x-1)^2=u(x)$. Shifted individual squares can therefore
combine into an even expression.

**3.** In a collected polynomial, $F(-x)=F(x)$ holds exactly when every
coefficient of an odd power is zero. For $F(-x)=-F(x)$, every coefficient
of an even power, including the constant coefficient, must be zero.
Nonzero coefficients matter; written zero terms do not change the result.
$v(x)=7$ has y-axis symmetry only, because $7\ne-7$.
$z(x)=0$ satisfies both identities and has both symmetries. A concise
equivalent rule is sufficient.

**4.** Both claims are false:

- $F(x)=x^2+x$ has degree 2, but $F(-x)=x^2-x$ is not identically
  $F(x)$; for example, $F(1)=2\ne F(-1)=0$. An even highest exponent
  does not exclude lower odd powers.
- $F(x)=x^3-x$ satisfies $F(1)=F(-1)=0$, but is not y-axis symmetric:
  $F(2)=6\ne F(-2)=-6$. Two matching function values do not prove
  an identity for all $x$.

Other checked counterexamples receive equal credit. Symmetry about a
different axis or centre is not requested.
''',
steps=[
('sym-f',3,'f(-x) richtig (1); beide Symmetrieentscheidungen begründet (1); gerade Struktur einschließlich Konstantem erklärt (1).','Correct f(-x) (1); justifies both symmetry decisions (1); explains the even structure including the constant (1).'),
('sym-g',3,'g(-x) richtig (1); beide Symmetrieentscheidungen begründet (1); ungerade Struktur erklärt (1).','Correct g(-x) (1); justifies both symmetry decisions (1); explains the odd structure (1).'),
('sym-h',3,'h(-x) richtig (1); beide Identitäten verworfen (1); gemischte nicht verschwindende Struktur erklärt (1).','Correct h(-x) (1); rejects both identities (1); explains the mixed nonzero structure (1).'),
('sym-hidden',4,'Umformung oder gleichwertige direkte Einsetzung (2); y-Achse ja, Ursprung nein begründet (1); Aufhebung der linearen Summanden bzw. gleichwertige Strukturbegründung (1).','Expansion or equivalent direct substitution (2); justifies y-axis yes, origin no (1); explains cancellation of linear terms or equivalent structure reasoning (1).'),
('sym-rules',3,'Beide Koeffizientenregeln einschließlich Exponent 0 (1,5); v nur y-Achse (0,5); Nullfunktion beide (1).','Both coefficient rules including exponent 0 (1.5); v only y-axis (0.5); zero function both (1).'),
('sym-claims',4,'Je falsche Behauptung ein passendes überprüftes Gegenbeispiel mit Erklärung (je 2).','For each false claim, gives and checks an appropriate counterexample with explanation (2 each).')],
cap_de='Kappe die Gesamtpunktzahl auf höchstens 14 BE, wenn in der gesamten Abgabe eine der beiden im Kompetenzvertrag genannten Prüfweisen vollständig fehlt: Es gibt entweder keine tragfähige rechnerische Prüfung einer Symmetrieidentität oder keine tragfähige Erklärung aus der zusammengefassten Termstruktur. Reines Etikettieren als „gerade/ungerade“ ohne erkennbaren Zusammenhang genügt nicht. Eine korrekte Gleichungskette mit kurzer Strukturbegründung an beliebiger Stelle genügt; nicht jede Teilaufgabe muss dieselbe Erklärung wiederholen. Ein lokaler Vorzeichenfehler, ein einzelner falsch eingeordneter Sonderfall oder ein knappes richtiges Argument löst allein keine Kappung aus.',
cap_en='Cap the total at 14 points if either method named in the competence is entirely absent across the submission: there is no sound calculation checking a symmetry identity, or no sound explanation from the collected expression structure. Bare labels “even/odd” without an identifiable connection are insufficient. A correct equation chain and concise structural explanation anywhere suffice; the same explanation need not be repeated in every part. A local sign error, one misclassified special case or a concise correct argument alone does not trigger the cap.'))

GRAPH_URL='/assets/assessment-materials/mathematik/6a4716bd-8038-46bb-b647-0db4a254fee7/polynomial-graph-v1.png'
FORMS.append(dict(key='graph-inference',id='6a4716bd-8038-46bb-b647-0db4a254fee7',
task_de=r'''# Vom Polynomgraphen zu Grad und Term

Die Abbildung zeigt den Graphen einer ganzrationalen Funktion $F$.
Das Gitter hat auf jeder Achse die Schrittweite $1$; $A,B,P$ sind
markierte Graphenpunkte. Die Pfeile kennzeichnen das **gesicherte**
Randverhalten: links unten für $x\to-\infty$, rechts oben für $x\to+\infty$.
Zusätzlich ist bekannt: Der Grad von $F$ ist **höchstens 4**.
Insgesamt sind **20 BE** erreichbar. Ein Ableitungsverfahren ist nicht nötig.

![Polynomgraph im Einheitsgitter. Die Kurve kreuzt die x-Achse bei A=(-2,0), berührt sie bei B=(1,0), geht durch P=(0,1) und hat zwei sichtbare Umkehrstellen. Die gesicherten Enden zeigen links nach unten und rechts nach oben.](/assets/assessment-materials/mathematik/6a4716bd-8038-46bb-b647-0db4a254fee7/polynomial-graph-v1.png)

**1. Graphinformationen gewinnen (4 BE)**

Lies die Koordinaten von $A,B,P$ ab. Beschreibe, an welcher Nullstelle
der Graph die x-Achse kreuzt und an welcher er sie nur berührt. Gib an,
welche Mindestvielfachheiten sich daraus ergeben.

**2. Den Grad eingrenzen (4 BE)**

Begründe mit Nullstellen, Kreuzungs-/Berührungsverhalten und/oder
Umkehrstellen, welchen Grad der Graph mindestens haben muss. Nutze das
gesicherte Randverhalten und die zusätzliche obere Gradgrenze, um den
Grad eindeutig zu bestimmen. Was folgt über das Vorzeichen des
Leitkoeffizienten?

**3. Einen passenden Term entwickeln (5 BE)**

Bestimme einen passenden Funktionsterm aus den abgelesenen Nullstellen,
ihren nun festgelegten Vielfachheiten und $P$. Zeige den Ansatz und die
Bestimmung des noch unbekannten Faktors. Eine mathematisch gleichwertige
Darstellungsform ist zulässig.

**4. Am Bild kontrollieren (3 BE)**

Prüfe am gefundenen Term die Kreuzung bei $A$, die Berührung bei $B$
und das Vorzeichen des Graphen für $-2<x<1$. Erläutere den Bezug zur
Abbildung; nur einen bereits verwendeten Punkt erneut einzusetzen genügt nicht.

**5. Grenzen des Rückschlusses (4 BE)**

Nun entfällt die Information „Grad höchstens 4“. Beibehalten werden nur
die Nullstellen mit Kreuzung beziehungsweise Berührung, der Punkt $P$
und die gesicherten Endrichtungen. Die genaue gezeichnete Kurvenform
wird in diesem Teil **nicht** als zusätzliche Information übernommen.
Begründe, warum diese Daten den Grad nicht mehr eindeutig festlegen.
Konstruiere einen Term höheren Grades mit genau denselben reellen
Nullstellen, demselben Punkt $P$ und denselben Endrichtungen und prüfe
dein Beispiel. Ein selbst gewählter überall positiver Faktor kann helfen.
''',
task_en=r'''# Infer degree and expression from a polynomial graph

The figure shows the graph of a polynomial function $F$. Each grid step
is 1 on either axis; $A,B,P$ are marked points on the graph. The arrows
indicate **known** end behaviour: down on the left as $x\to-\infty$,
up on the right as $x\to+\infty$. Additional information: the degree
of $F$ is **at most 4**. Total: **20 points**. Differentiation is not needed.

![Polynomial graph on a unit grid. The curve crosses the x-axis at A=(-2,0), touches it at B=(1,0), passes through P=(0,1) and has two visible turning points. Its known ends point down on the left and up on the right.](/assets/assessment-materials/mathematik/6a4716bd-8038-46bb-b647-0db4a254fee7/polynomial-graph-v1.png)

**1. Obtain information from the graph (4 points)**

Read the coordinates of $A,B,P$. Describe which zero crosses the x-axis
and which merely touches it. State the minimum multiplicities implied.

**2. Restrict the degree (4 points)**

Use zeros, crossing/touching and/or turning points to justify a minimum
degree. Combine the known end behaviour and upper degree bound to
determine the degree uniquely. What follows about the sign of the
leading coefficient?

**3. Develop a fitting expression (5 points)**

Find a fitting expression from the observed zeros, their now determined
multiplicities and $P$. Show your form and determine its unknown factor.
An equivalent expression form is accepted.

**4. Check against the figure (3 points)**

Check the crossing at $A$, touching at $B$ and the sign for $-2<x<1$
using your expression. Relate the checks to the figure; merely
substituting a previously used point again is insufficient.

**5. Limits of inference (4 points)**

Remove the information “degree at most 4”. Retain only the zeros with
their crossing or touching behaviour, the point $P$ and the known end
directions. The exact drawn curve shape is **not** retained as further
information in this part. Explain why these data no longer determine
the degree uniquely. Construct and check a higher-degree expression
with exactly the same real zeros, the same point $P$ and the same end
directions. A factor chosen to be positive everywhere may help.
''',
solution_de=r'''# Referenzlösung: Graph, Grad und Term

**1.** Man liest $A=(-2,0)$, $B=(1,0)$ und $P=(0,1)$ ab.
Bei $-2$ kreuzt der Graph die Achse: Die Nullstellenvielfachheit ist
ungerade, mindestens $1$. Bei $1$ berührt der Graph die Achse ohne
Vorzeichenwechsel: gerade Vielfachheit, mindestens $2$.

**2.** Bereits die beiden Vielfachheiten erfordern Grad mindestens $3$.
Auch zwei echte Umkehrstellen sind bei einem Polynom vom Grad $1$ oder
$2$ nicht möglich; allgemein sind es höchstens Grad minus eins.
Die entgegengesetzten gesicherten Endrichtungen erfordern ungeraden
Grad. Zusammen mit $3\leq\deg F\leq4$ folgt $\deg F=3$.
Rechts nach oben und links nach unten bedeutet positiven Leitkoeffizienten.
Ein kleines sichtbares Graphenfenster allein würde ein Verhalten im
Unendlichen nicht beweisen; hier ist es ausdrücklich gegeben.

**3.** Im Grad $3$ sind die Vielfachheiten damit genau $1$ und $2$:
$$
F(x)=a(x+2)(x-1)^2.
$$
Aus $P=(0,1)$ folgt $1=a\cdot2\cdot1$, also $a=\tfrac12$.
Ein passender Term ist
$$
F(x)=\tfrac12(x+2)(x-1)^2=\tfrac12x^3-\tfrac32x+1.
$$
Gleichwertige Termformen und eine andere nachvollziehbare Bestimmung
des Polynoms erhalten denselben Kredit.

**4.** Nahe $-2$ bleibt $(x-1)^2$ positiv, während $x+2$ sein Vorzeichen
wechselt: eine Kreuzung. Nahe $1$ ist $x+2$ positiv und das Quadrat
beiderseits nicht negativ: Berührung ohne Vorzeichenwechsel.
Für $-2<x<1$ sind $x+2>0$ und $(x-1)^2>0$, also $F(x)>0$,
passend zum oberhalb der x-Achse liegenden Kurvenstück.

**5.** Ohne obere Gradgrenze legen die genannten Daten nur Mindestgrad
und Parität fest. Zum Beispiel ist
$$
H(x)=\tfrac12(x+2)(x-1)^2(1+x^2)
$$
vom Grad $5$ mit positivem Leitkoeffizienten. Da $1+x^2>0$ für alle
reellen $x$, entstehen keine weiteren reellen Nullstellen und die
Vielfachheiten sowie Kreuzung/Berührung bleiben erhalten. Ferner ist
$H(0)=1$, und wegen des ungeraden Grades und positiven Leitkoeffizienten
bleiben beide Endrichtungen gleich. $H$ muss nicht mit der gesamten
gezeichneten Kurve übereinstimmen; diese zusätzliche Forderung wurde in
Teil 5 ausdrücklich nicht gestellt. Beliebig viele größere ungerade
Grade wären beispielsweise durch Faktoren $(1+x^2)^m$ möglich.
''',
solution_en=r'''# Reference solution: graph, degree and expression

**1.** Read $A=(-2,0)$, $B=(1,0)$ and $P=(0,1)$. The crossing at $-2$
implies odd multiplicity, at least 1; touching without a sign change
at 1 implies even multiplicity, at least 2.

**2.** These multiplicities already require degree at least 3. Two
genuine turning points also rule out degrees 1 and 2; in general a
polynomial has at most degree minus one turning points. The opposite
known end directions require odd degree. Together with
$3\leq\deg F\leq4$, this gives $\deg F=3$. Up to the right and down
to the left imply a positive leading coefficient. A small graph window
alone would not prove behaviour at infinity; here it is explicitly given.

**3.** With degree 3 the multiplicities must be exactly 1 and 2, so
$$
F(x)=a(x+2)(x-1)^2.
$$
The point $P=(0,1)$ gives $1=a\cdot2\cdot1$, hence $a=\tfrac12$.
A fitting expression is
$$
F(x)=\tfrac12(x+2)(x-1)^2=\tfrac12x^3-\tfrac32x+1.
$$
Equivalent forms and other traceable ways of determining the polynomial
receive equal credit.

**4.** Near $-2$, $(x-1)^2$ remains positive while $x+2$ changes sign:
there is a crossing. Near 1, $x+2$ is positive and the square is
nonnegative on both sides, giving touching without a sign change.
For $-2<x<1$, both $x+2$ and $(x-1)^2$ are positive, hence $F(x)>0$,
matching the portion above the x-axis.

**5.** Without an upper degree bound, the retained data give only a
minimum degree and parity. For example,
$$
H(x)=\tfrac12(x+2)(x-1)^2(1+x^2)
$$
has degree 5 with positive leading coefficient. The factor $1+x^2$ is
positive for every real $x$, so no extra real zeros appear and the
multiplicities and crossing/touching behaviour remain unchanged.
Also $H(0)=1$, and the odd degree and positive leading coefficient
preserve the end directions. $H$ need not match the entire drawn curve:
part 5 explicitly removed that additional requirement. Factors
$(1+x^2)^m$ provide arbitrarily larger odd degrees.
''',
steps=[
('graph-read',2,'A, B und P korrekt abgelesen (je 0,5); Kreuzung/Berührung richtig beschrieben (0,5).','Reads A, B and P correctly (0.5 each); identifies crossing/touching (0.5).'),
('graph-multiplicity',2,'Kreuzung ungerade mindestens 1 und Berührung gerade mindestens 2 begründet (je 1).','Justifies odd multiplicity at least 1 for crossing and even multiplicity at least 2 for touching (1 each).'),
('graph-degree',4,'Mindestgrad 3 begründet (1); ungerader Grad aus gesicherten Enden (1); mit oberer Grenze exakt 3 (1); positiver Leitkoeffizient (1).','Justifies minimum degree 3 (1), odd degree from known ends (1), exactly 3 using the upper bound (1), and positive leading coefficient (1).'),
('graph-expression',5,'Passender Ansatz mit richtigen Faktoren/Vielfachheiten (2); P für Faktorbestimmung genutzt (1); a=1/2 (1); vollständiger passender Term (1).','Appropriate form with correct factors/multiplicities (2); uses P to determine the factor (1); a=1/2 (1); complete fitting expression (1).'),
('graph-check',3,'Kreuzung bei A, Berührung bei B und positives Vorzeichen zwischen -2 und 1 jeweils am Term und im Bild erklärt (je 1).','Explains crossing at A, touching at B and positive sign between -2 and 1 using the expression and figure (1 each).'),
('graph-limits',4,'Fehlende Eindeutigkeit ohne Gradgrenze erklärt (1); geeigneten höheren Term konstruiert (1); gleiche reelle Nullstellen/Punkt (1) und Endrichtungen (1) überprüft.','Explains lack of uniqueness without the degree bound (1); constructs a suitable higher-degree expression (1); checks identical real zeros/point (1) and end directions (1).')],
cap_de='Kappe die Gesamtpunktzahl auf höchstens 14 BE, wenn in der gesamten Abgabe keinerlei tragfähiger Rückschluss vom gegebenen Graphen auf einen Grad oder einen passenden Funktionsterm erkennbar ist. Ein bloß behaupteter oder kopierter Term ohne nachvollziehbaren Bezug zu abgelesenen Merkmalen ersetzt die Kernleistung nicht. Eine nachvollziehbare Gradbegründung oder eine aus den Graphdaten entwickelte Termbestimmung genügt; der Kompetenzvertrag verlangt nicht zwei getrennte Teilbestehensentscheidungen. Lokale Ablese-, Vorzeichen- oder Rechenfehler bei sonst nachvollziehbarer Auswertung lösen allein keine Kappung aus. Korrekte Folgearbeit erhält ihren Kredit.',
cap_en='Cap the total at 14 points if the whole submission contains no sound inference from the given graph to either a degree or a fitting expression. Merely asserting or copying an expression without a traceable link to observed features does not demonstrate the core action. A traceable degree argument or an expression developed from graph data is sufficient; the competence does not impose two separate part-pass decisions. Local reading, sign or arithmetic errors alone do not trigger the cap when the graph analysis is otherwise traceable. Credit correct follow-through.'))

FORMS.append(dict(key='transformations',id='e33e75e3-eae5-5a09-862f-d1a11176373f',
task_de=r'''# Reine Transformationen in Funktionenscharen

Gegeben sind die drei Scharen
$$
G_t(x)=(x-t)^2+1\ (t\in\mathbb R),\qquad
H_a(x)=a e^x\ (a>0),\qquad K_b(x)=\sin(bx)\ (b>0).
$$
Die Grundfunktionen sind $x^2$, $e^x$ und $\sin x$; Winkel im Bogenmaß.
Begründe die Parameterwirkungen durch die Zuordnung von Graphenpunkten
und passende Graphmerkmale. Du darfst Skizzen ergänzen; ein Computerplot
oder Ableitungen sind nicht verlangt. Insgesamt **20 BE**.

**1. Verschiebungsschar (6 BE)**

Beschreibe, wie der Graph von $G_t$ aus $y=x^2$ entsteht. Gib Definitions-
und Wertebereich, Scheitelpunkt und Symmetrieachse in Abhängigkeit von
$t$ an. Zeige, wohin ein beliebiger Punkt $(u,u^2)$ der Grundparabel
übergeht. Vergleiche konkret $t=-2$ und $t=3$ und begründe, weshalb die
Parabelform unverändert bleibt.

**2. Vertikale Streckung und Stauchung (6 BE)**

Untersuche die Parameterwirkung bei $H_a$: Beschreibe die Veränderung
von $y=e^x$ für $a>1$ und für $0<a<1$. Gib Definitions- und Wertebereich,
y-Achsenabschnitt und waagerechte Asymptote an. Zeige die Zuordnung
$(u,e^u)\mapsto\ldots$. Vergleiche $a=2$ und $a=\tfrac12$ an $x=0$
und erkläre, ob die beiden Graphen einen gemeinsamen Punkt haben.

**3. Horizontale Streckung und Stauchung (6 BE)**

Untersuche $K_b$: Gib die Zuordnung eines Grundgraphenpunkts
$(u,\sin u)$, Wertebereich, Amplitude, Periode und sämtliche Nullstellen
in Abhängigkeit von $b$ an. Erkläre konkret die Wirkung von $b=2$ und
$b=\tfrac12$ und gib jeweils die Lage des ersten Hochpunkts rechts vom
Ursprung an. Begründe, weshalb die Amplitude dabei unverändert bleibt.

**4. Parameter genau lesen (2 BE)**

Beurteile: „Ein positiver Parameter macht den Graphen immer schmaler.“
Widerlege die Behauptung mit zwei verschiedenen Beispielen aus den
gegebenen Scharen und erläutere die jeweilige Wirkung.
''',
task_en=r'''# Pure transformations in function families

Consider these three families:
$$
G_t(x)=(x-t)^2+1\ (t\in\mathbb R),\qquad
H_a(x)=a e^x\ (a>0),\qquad K_b(x)=\sin(bx)\ (b>0).
$$
The base functions are $x^2$, $e^x$ and $\sin x$; angles are in radians.
Justify the parameter effects using point mappings and appropriate graph
features. Sketches may be added; computer plots and derivatives are not
required. Total: **20 points**.

**1. A family of shifts (6 points)**

Describe how the graph of $G_t$ is obtained from $y=x^2$. State its domain,
range, vertex and axis of symmetry in terms of $t$. Show where an
arbitrary base-parabola point $(u,u^2)$ is mapped. Compare $t=-2$ and
$t=3$, explaining why the parabola shape remains unchanged.

**2. Vertical stretching and compression (6 points)**

Analyse the parameter in $H_a$: describe the transformation of $y=e^x$
for $a>1$ and $0<a<1$. State domain, range, y-intercept and horizontal
asymptote. Give the mapping $(u,e^u)\mapsto\ldots$. Compare $a=2$ and
$a=\tfrac12$ at $x=0$, and explain whether the two graphs intersect.

**3. Horizontal stretching and compression (6 points)**

Analyse $K_b$: give the mapping of a base point $(u,\sin u)$, range,
amplitude, period and all zeros in terms of $b$. Explain the effects
of $b=2$ and $b=\tfrac12$, and locate the first maximum to the right
of the origin in each case. Explain why the amplitude is unchanged.

**4. Read the parameter precisely (2 points)**

Evaluate: “A positive parameter always makes the graph narrower.”
Refute this using two different examples from the given families,
explaining each actual effect.
''',
solution_de=r'''# Referenzlösung: Transformationsscharen

**1.** $G_t$ verschiebt die Normalparabel um $t$ in x-Richtung und um
$1$ nach oben. Für negatives $t$ geht es nach links. Aus einem beliebigen
Grundpunkt wird
$$
(u,u^2)\longmapsto(u+t,u^2+1),
$$
denn $G_t(u+t)=u^2+1$. Definitionsbereich ist $\mathbb R$,
Wertebereich $[1,\infty)$, Scheitel $S_t=(t,1)$, Symmetrieachse $x=t$.
Für $t=-2$ liegt der Scheitel bei $(-2,1)$, für $t=3$ bei $(3,1)$.
Alle Punkte werden jeweils um denselben Vektor verschoben; Abstände und
Parabelform ändern sich nicht. Der Parameter ändert hier nur die
horizontale Lage, während die vertikale Verschiebung $1$ fest ist.

**2.** Bei $H_a$ werden die y-Koordinaten mit $a$ multipliziert:
$$
(u,e^u)\longmapsto(u,ae^u).
$$
Für $a>1$ liegt eine vertikale Streckung, für $0<a<1$ eine vertikale
Stauchung vor; die x-Koordinaten bleiben gleich. Definitionsbereich
$\mathbb R$, Wertebereich $(0,\infty)$, y-Achsenabschnitt $(0,a)$,
waagerechte Asymptote $y=0$ für $x\to-\infty$.
$H_2(0)=2$ und $H_{1/2}(0)=\tfrac12$. Sie schneiden sich nicht,
denn $2e^x=\tfrac12e^x$ wäre bei $e^x>0$ unmöglich; der erste Graph
liegt überall über dem zweiten. Es geht um eine reine vertikale
Transformation, nicht um eine Änderung des Exponentialtyps.

**3.** Aus $u=bx$ folgt $x=u/b$; daher
$$
(u,\sin u)\longmapsto(u/b,\sin u).
$$
Der Graph wird in x-Richtung mit dem Faktor $1/b$ gestreckt beziehungsweise
gestaucht. Wertebereich $[-1,1]$, Amplitude $1$, Periode $2\pi/b$,
Nullstellen $x=k\pi/b$ für $k\in\mathbb Z$.
Für $b=2$ beträgt der horizontale Faktor $\tfrac12$, die Periode
$\pi$ und der erste Hochpunkt $(\pi/4,1)$.
Für $b=\tfrac12$ beträgt der horizontale Faktor $2$, die Periode
$4\pi$ und der erste Hochpunkt $(\pi,1)$.
Die Punktzuordnung verändert nur x-Koordinaten, deshalb bleiben
die Extremwerte $-1,1$ und die Amplitude erhalten.

**4.** Die Behauptung ist falsch. Beispielsweise verschiebt $G_3$
die Parabel nach rechts und nach oben ohne Formänderung; $K_{1/2}$
wird gegenüber $\sin x$ horizontal breiter (Faktor $2$), obwohl der
Parameter positiv ist. Auch korrekt erklärte andere Beispiele zählen,
etwa die vertikale Stauchung bei $H_{1/2}$. Die Position des Parameters
im Term und sein Bereich bestimmen die konkrete Wirkung.
''',
solution_en=r'''# Reference solution: transformation families

**1.** $G_t$ shifts the standard parabola by $t$ horizontally and 1
upward; negative $t$ means leftward. A base point maps as
$$
(u,u^2)\longmapsto(u+t,u^2+1),
$$
since $G_t(u+t)=u^2+1$. The domain is $\mathbb R$, range $[1,\infty)$,
vertex $S_t=(t,1)$ and symmetry axis $x=t$. For $t=-2$ and $t=3$
the vertices are $(-2,1)$ and $(3,1)$. Every point is translated by
the same vector, preserving distances and parabola shape. The parameter
changes only horizontal position; the vertical shift of 1 is fixed.

**2.** $H_a$ multiplies y-coordinates by $a$:
$$
(u,e^u)\longmapsto(u,ae^u).
$$
This is a vertical stretch for $a>1$ and a vertical compression for
$0<a<1$; x-coordinates stay fixed. Domain $\mathbb R$, range
$(0,\infty)$, y-intercept $(0,a)$, horizontal asymptote $y=0$ as
$x\to-\infty$. We have $H_2(0)=2$ and $H_{1/2}(0)=\tfrac12$.
They do not intersect: $2e^x=\tfrac12e^x$ is impossible since $e^x>0$.
The first graph lies above the second everywhere. This is a pure vertical
transformation, with no change to the exponential function type.

**3.** From $u=bx$ we get $x=u/b$, hence
$$
(u,\sin u)\longmapsto(u/b,\sin u).
$$
The horizontal scale factor is $1/b$. The range is $[-1,1]$, amplitude 1,
period $2\pi/b$, and zeros $x=k\pi/b$ for $k\in\mathbb Z$.
For $b=2$, the horizontal factor is $\tfrac12$, period $\pi$, and first
maximum $(\pi/4,1)$. For $b=\tfrac12$, the factor is 2, period $4\pi$,
and first maximum $(\pi,1)$. Only x-coordinates change in the mapping,
so the extreme values $-1,1$ and amplitude remain unchanged.

**4.** The claim is false. For example, $G_3$ shifts the parabola right
and up without changing its shape; $K_{1/2}$ is horizontally wider than
$\sin x$ (factor 2), although its parameter is positive. Other correctly
explained examples also count, such as vertical compression in $H_{1/2}$.
The parameter's position in the expression and its range determine
the actual effect.
''',
steps=[
('trans-shift-map',2,'Punktzuordnung (u+t,u²+1) rechnerisch begründet (1); Vorzeichen von t und unveränderte Form erklärt (1).','Justifies point mapping (u+t,u²+1) by calculation (1); explains the sign of t and preserved shape (1).'),
('trans-shift-features',4,'Definitions-/Wertebereich (1); Scheitel/Symmetrieachse allgemein (1,5); beide konkreten Scheitel (1); feste und parameterabhängige Verschiebung unterschieden (0,5).','Domain/range (1); general vertex/axis (1.5); both specific vertices (1); distinguishes fixed and parameter-dependent shifts (0.5).'),
('trans-exp-map',2,'Punktzuordnung und vertikale Richtung (1); Streckung bei a>1 sowie Stauchung bei 0<a<1 erklärt (1).','Point mapping and vertical direction (1); explains stretching for a>1 and compression for 0<a<1 (1).'),
('trans-exp-features',4,'Definitions-/Wertebereich (1); Achsenabschnitt/Asymptote (1); beide Werte bei x=0 (1); keine Schnittpunkte begründet (1).','Domain/range (1); intercept/asymptote (1); both values at x=0 (1); justifies no intersections (1).'),
('trans-sine-map',2,'Zuordnung x=u/b begründet (1); Kehrwertwirkung und unveränderte Amplitude erklärt (1).','Justifies x=u/b mapping (1); explains reciprocal scaling and unchanged amplitude (1).'),
('trans-sine-features',4,'Wertebereich/Amplitude (0,5); Periode/alle Nullstellen allgemein (1,5); beide konkreten Perioden/Hochpunkte (2).','Range/amplitude (0.5); general period/all zeros (1.5); both specific periods/maxima (2).'),
('trans-claim',2,'Behauptung mit zwei unterschiedlichen passenden, erklärten Beispielen widerlegt (je 1).','Refutes the claim using two different appropriate explained examples (1 each).')],
cap_de='Kappe die Gesamtpunktzahl auf höchstens 14 BE, wenn in der gesamten Abgabe keine tragfähige Begründung erkennbar ist, wie die Parameteränderung durch eine reine Verschiebung, Streckung oder Stauchung auf einen Graphen wirkt. Eine bloße Liste auswendig angegebener Merkmale ohne Bezug zwischen Parameter, Punktkoordinaten und Graphänderung genügt nicht. Eine korrekt begründete Punktzuordnung oder eine gleichwertige geometrische beziehungsweise algebraische Erklärung an beliebiger Stelle genügt; nicht jede Schar benötigt dieselbe Formulierung. Ein lokaler Vorzeichen-/Kehrwertfehler, ein einzelner falsch angegebener Hochpunkt oder eine knappe richtige Erklärung löst allein keine Kappung aus.',
cap_en='Cap the total at 14 points if the whole submission contains no sound justification of how changing a parameter acts on a graph through a pure shift, stretch or compression. A memorised list of features without a link between the parameter, point coordinates and graph change is insufficient. A correctly justified point mapping or equivalent geometric or algebraic explanation anywhere is sufficient; the same wording need not appear for every family. A local sign/reciprocal error, one incorrect maximum or a concise correct explanation alone does not trigger the cap.'))

COMMON_DE='''# Eine Gesamtbewertung

20 BE insgesamt; **bestanden ab 15 BE**, sonst nicht bestanden. Es gibt genau
eine Gesamtentscheidung und keine getrennten Teilbestehensgrenzen.
Mathematisch gleichwertige Verfahren, Schreibweisen und knappe richtige
Erklärungen erhalten gleichen Kredit, unabhängig vom Ort in der Abgabe.
Identische Leistungen nur einmal werten. Teilpunkte wie angegeben, sonst
0,5 BE für eine sinnvolle unvollständige Teilleistung. Einen lokalen Fehler
nicht mehrfach bestrafen; nachvollziehbare richtige Folgearbeit zählt.
Zahlen auf etwa vier Dezimalstellen oder gleichwertige Genauigkeit runden;
Grenzentscheidungen mit ausreichender Genauigkeit treffen.

| Kriterium | BE |
|---|---:|
'''
COMMON_EN='''# One overall result

20 points in total; **pass at 15 points**, otherwise not passed. There is
one overall decision and no separate part-pass thresholds. Credit equivalent
methods, notation and concise correct explanations equally wherever they
appear. Count identical work only once. Award partial marks as specified,
otherwise 0.5 for meaningful incomplete work. Do not repeatedly penalise
one local error; credit correct traceable follow-through. Round numbers to
about four decimal places or equivalent accuracy; use sufficient precision
when deciding a boundary condition.

| Criterion | Points |
|---|---:|
'''

for f in FORMS:
    assert f['id'] in by
    folder=HERE/f['id'];folder.mkdir(exist_ok=True)
    for k in ('task_de','task_en','solution_de','solution_en'):
        f[k]=re.sub(r'\$\$(.*?)\$\$',lambda m:'\n$$\n'+m.group(1).strip()+'\n$$\n',f[k],flags=re.S)
    rd=COMMON_DE+''.join(f'| {de} | {p} |\n' for _,p,de,en in f['steps'])+'\n'+f['cap_de']+'\n\nNach einer gegebenenfalls anwendbaren Kappung wird nur die eine Gesamtpunktzahl mit 15 BE verglichen.\n'
    re_=COMMON_EN+''.join(f'| {en} | {p} |\n' for _,p,de,en in f['steps'])+'\n'+f['cap_en']+'\n\nAfter any applicable cap, compare only the one total score with 15 points.\n'
    files={'task.de.md':f['task_de'],'task.en.md':f['task_en'],'solution.de.md':f['solution_de'],'solution.en.md':f['solution_en'],'rubric.de.md':rd,'rubric.en.md':re_}
    for name,text in files.items():(folder/name).write_text(text)
    current=by[f['id']];assert not current.get('examData')
    proposed=deepcopy(current);proposed['nodeKind']='exam'
    proposed['examData']={'reviewStatus':'draft','taskContent':f['task_de'],'taskContentEn':f['task_en'],'solutionContent':f['solution_de']+'\n'+rd,'solutionContentEn':f['solution_en']+'\n'+re_,'coveredGoalIds':[f['id']],'coveredStrands':current['dimensionTags']['guidingIdeas'],'demandLevels':[current['dimensionTags']['demandLevel']],'scoring':{'maxPoints':20,'passingPoints':15,'steps':[{'id':i,'points':p,'description':de,'descriptionEn':en} for i,p,de,en in f['steps']]}}
    assert sum(s['points'] for s in proposed['examData']['scoring']['steps'])==20
    assert {k:v for k,v in proposed.items() if k not in ('nodeKind','examData')}==current
    (folder/'current-whole-goal.json').write_text(json.dumps(current,ensure_ascii=False,indent=2)+'\n')
    (folder/'proposed-whole-goal.draft.json').write_text(json.dumps(proposed,ensure_ascii=False,indent=2)+'\n')
    (folder/'role-neutral-whole-form-content.draft.json').write_text(json.dumps({'status':'CONTENT_ONLY_NO_FINAL_ROLE_OR_PLACEMENT_DECISION','assessmentOfExistingGoalId':f['id'],'originalGoalRemainsUnchanged':True,'examDataContent':proposed['examData'],'roleChoice':'The hypothetical Same-ID draft is a review input only. Separate protected assessment placement may be selected after genuine scope-effect review. No new goal ID, role or placement is authorised by this content package.'},ensure_ascii=False,indent=2)+'\n')
    (folder/'whole-contract.before-after.json').write_text(json.dumps({'goalId':f['id'],'before':current,'after':proposed,'onlyAddedFields':['nodeKind','examData'],'allPriorFieldsPreserved':True,'selfIdCoverageOnly':True,'sourceArtifactPathAndReleaseMetadata':'Reserved for actual independent review and integration; not authored as approved here.'},ensure_ascii=False,indent=2)+'\n')

(HERE/'author-package.json').write_text(json.dumps({'status':'FOUR_PRIVATE_WHOLE_CONTENT_FORMS_NO_FINAL_ROLE_OR_PLACEMENT_AWAITING_GENUINE_INDEPENDENT_REVIEW','authorAgent':'/root/sol_directed_prior_stage_qa','canonical':{'path':frozen['canonicalPath'],'sha256':frozen['canonicalSha256'],'head':frozen['head']},'forms':[{'key':f['key'],'goalId':f['id']} for f in FORMS],'hypotheticalSameIdDraftDelta':'Only nodeKind=exam and draft examData under four existing IDs. All original text/R/scope/source/AB fields preserved. Graph asset uses existing static Markdown image delivery.','finalRoleDecision':'PENDING actual scope-effect analysis. Content can be reused in a separate protected assessment. No global Same-ID activation assumed. Original 807 curricular atoms remain unchanged.','noNewGoals':True,'notClaimed':['independent content or A/M approval','global exam role or placement decision','integration or release','Stage/Native/M7/CI acceptance','scope or requires changes','prerequisite assessment coverage','host acceptance']},ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'forms':len(FORMS),'oneResultEach':'20 points, pass 15, reasoned cap14','rootWrites':False}))
