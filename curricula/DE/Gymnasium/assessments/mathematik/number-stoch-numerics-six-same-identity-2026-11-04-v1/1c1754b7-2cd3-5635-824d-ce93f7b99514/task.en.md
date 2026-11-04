# Explain the quadratic sieve using a small example

The natural number $N=1649$ is to be factored. Explain how the
**quadratic sieve** works using the following small run. This is a
mathematical demonstration of the method, not a programming task.
Show your reasoning and calculations. A total of **20 points** is available.

Use $Q(x)=x^2-N$, the factor base $B=\{2,5\}$, and the interval
$x=41,42,43,44,45$. Every $Q(x)$ in this interval is positive.

**1. Explain the method (4 points)**

Give a connected explanation of the roles of the factor base, sieving,
exponent parities and gcd calculation. Explain why one seeks a congruence
$X^2\equiv Y^2\pmod N$ and how it can yield factors. A list of technical
terms alone is insufficient.

**2. Obtain relations by sieving (6 points)**

Explain why values of $x$ near $\sqrt N$ are useful. Find the residue
classes of $x$ modulo $2$ and modulo $5$ for which $Q(x)$ is divisible by
the respective factor-base prime. Explain how this lets you mark regularly
recurring positions in the interval. Divide out all powers of $2$ and $5$
from the corresponding $Q(x)$ and complete the table.

| $x$ | $Q(x)$ | Remainder after removing all factors 2 and 5 | Factors completely over B? |
|---:|---:|---:|---|
| 41 | | | |
| 42 | | | |
| 43 | | | |
| 44 | | | |
| 45 | | | |

Which relations do you keep for the next step, and why?

**3. Obtain a square congruence and factors (7 points)**

State the exponents of the factor-base primes in the retained relations.
Choose a combination whose exponent sums are all even and explain your
choice. Use it to obtain $X$ and $Y$ with $X^2\equiv Y^2\pmod N$;
representatives modulo $N$ are acceptable. Calculate $\gcd(X-Y,N)$ and
$\gcd(X+Y,N)$, check the resulting factorization, and connect your
calculation to the method described in part 1.

**4. Evaluate an apparent success (3 points)**

Someone instead proposes $X=Y=32$: “The square congruence holds, so we
have found a nontrivial factor.” Check this claim using both gcd values.
Explain what an unsuccessful gcd step means for the next step of the
method. Also distinguish the aim of a primality test from the aim of a
factorization method. You are not asked to carry out another primality test.
