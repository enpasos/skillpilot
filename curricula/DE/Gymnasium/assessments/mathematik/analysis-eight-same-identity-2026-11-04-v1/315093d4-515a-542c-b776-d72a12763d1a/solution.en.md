# Worked solution: the e-series and Taylor polynomials

**1. Taylor polynomial**

All derivative values at $0$ are $1$. Hence

$$
P_4(x)=1+x+\frac{x^2}{2!}+\frac{x^3}{3!}+\frac{x^4}{4!}
=1+x+\frac{x^2}{2}+\frac{x^3}{6}+\frac{x^4}{24}.
$$

**2. Series**

$$
e=\sum_{k=0}^{\infty}\frac1{k!}
=1+1+\frac12+\frac16+\frac1{24}+\cdots.
$$

The index starts at $0$, so the first two terms are $1/0!=1$ and
$1/1!=1$. For $k\geq1$, $k!=1\cdot2\cdots k$.
The infinite sum means $e=\lim_{n\to\infty}S_n$, rather than a finite
addition with a final term.

**3. Partial sums**

$$
S_4=\frac{65}{24}\approx2.708333,\qquad
S_6=\frac{65}{24}+\frac1{120}+\frac1{720}
=\frac{1957}{720}\approx2.718056.
$$

The added terms have indices $k=5$ and $k=6$: $1/5!$ and $1/6!$.

**4. Connection**

Substituting $x=1$ into $P_n(x)=\sum_{k=0}^n x^k/k!$ gives exactly
$S_n$. Thus the e-series comes from the Taylor expansion of $e^x$
about $0$, evaluated at $1$.
Every finite partial sum omits further positive terms and is therefore
less than $e$. At $x=0$, only the constant term $1$ remains in each
$P_n$, giving the value of $e^x$ at $0$.

**5. Error and rounding**

For $n=6$,

$$
\frac{1957}{720}<e<\frac{1957}{720}+\frac1{6\cdot720}
=\frac{11743}{4320}.
$$

The bounds are approximately $2.718055556$ and $2.718287037$.
Both lie between $2.7175$ and $2.7185$; the entire interval rounds to
$2.718$ at three decimal places.
As $n!\geq1$, $1/(n\,n!)\leq1/n\to0$. The positive error therefore
becomes arbitrarily small, so $S_n\to e$.
