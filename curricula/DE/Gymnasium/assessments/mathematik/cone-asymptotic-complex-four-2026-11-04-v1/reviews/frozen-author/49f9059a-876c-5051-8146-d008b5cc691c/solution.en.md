# Reference solution: asymptotic comparison

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
