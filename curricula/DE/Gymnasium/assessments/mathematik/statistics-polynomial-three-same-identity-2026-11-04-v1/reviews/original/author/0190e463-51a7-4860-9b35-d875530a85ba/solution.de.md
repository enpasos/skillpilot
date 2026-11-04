# Referenzlösung: Symmetrie

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
