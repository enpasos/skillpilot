# Reference solution: symmetry

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
