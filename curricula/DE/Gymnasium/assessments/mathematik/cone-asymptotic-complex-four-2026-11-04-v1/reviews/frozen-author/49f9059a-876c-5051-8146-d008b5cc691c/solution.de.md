# Referenzlösung: asymptotischer Vergleich

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
