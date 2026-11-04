# Worked solution: quadratic sieve

**1. Idea and mathematical basis**

The method seeks small values of $Q(x)=x^2-N$ whose prime factors all
belong to a small factor base. Such values are smooth over that base.
Sieving marks periodically recurring values divisible by each base prime
and removes their prime powers. Exponent vectors record the
factorizations. Choosing relations with all exponent sums even makes
their product a square $Y^2$. Since $Q(x)\equiv x^2\pmod N$, it is also
congruent to the square of the product of the corresponding $x$ values,
namely $X^2$.

From $X^2\equiv Y^2\pmod N$ it follows that

$$
N\mid(X^2-Y^2)=(X-Y)(X+Y).
$$

The factors of $N$ may be distributed between these two brackets. Then
$\gcd(X-Y,N)$ or $\gcd(X+Y,N)$ can yield a divisor $d$ with $1<d<N$.
Not every square congruence yields such a divisor; the gcd values must
be checked.

**2. Sieving**

We have $40^2<N<41^2$. Near $\sqrt N$, the differences $x^2-N$ are small,
which favours complete factorizations over the small base without
ensuring this for every value. Since $N\equiv1\pmod2$, $Q(x)$ is divisible
by $2$ when $x$ is odd. Since $N\equiv4\pmod5$, the suitable classes modulo
$5$ are $x\equiv2$ and $x\equiv3$. These classes repeat at intervals of
$2$ and $5$ respectively, identifying positions to mark without
independently searching all divisibility conditions again.

| $x$ | $Q(x)$ | Removed base factors | Remainder | Keep? |
|---:|---:|---|---:|---|
| 41 | 32 | $2^5$ | 1 | yes |
| 42 | 115 | $5$ | 23 | no |
| 43 | 200 | $2^3\cdot5^2$ | 1 | yes |
| 44 | 287 | none | 287 | no |
| 45 | 376 | $2^3$ | 47 | no |

Only the relations for $41$ and $43$ factor completely over $B$: each
leaves remainder $1$. A remainder such as $23$ is not an admissible new
factor-base prime in this specified run.

**3. Combination and factor extraction**

In the order $(2,5)$ the exponent vectors are $(5,0)$ and $(3,2)$.
Both have parity $(1,0)$; their sum modulo $2$ is $(0,0)$.
They can therefore be combined:

$$
Q(41)Q(43)=32\cdot200=2^8\cdot5^2=80^2.
$$

Thus $X=41\cdot43=1763$ and $Y=80$ satisfy
$X^2\equiv Y^2\pmod{1649}$. The smaller representative $X=114$ is equivalent.
Consequently,

$$
\gcd(114-80,1649)=\gcd(34,1649)=17,
$$


$$
\gcd(114+80,1649)=\gcd(194,1649)=97.
$$

The check $17\cdot97=1649$ confirms the factorization. Both factors lie
strictly between $1$ and $N$. Their primality could, if needed, be checked
using primes up to their respective square roots; no additional primality
proof is required for the nontrivial factor extraction asked for here.
Factoring an individual $Q(x)$ alone does not factor $N$: the combination
into a square followed by gcd extraction does so in this example.

**4. Limits of an individual step**

For $X=Y=32$, the square congruence does hold, but

$$
\gcd(0,1649)=1649,\qquad\gcd(64,1649)=1.
$$

Both divisors are trivial. This neither establishes that $N$ is prime nor
contradicts the method. One needs a different suitable combination or
additional smooth relations; if these are insufficient, the sieving
interval or factor base can be enlarged. A primality test investigates
whether a number is prime (with a strength of conclusion depending on
the test); a factorization method seeks a decomposition into nontrivial
factors. Claiming that they always return the same kind of result would
be false.
