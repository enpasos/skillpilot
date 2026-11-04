# Worked solution: improper areas

**1. Signs and setup**

Since $x^3>0$, $f$ is negative on $[\frac12,1)$, zero at $1$, and
positive for $x>1$. Hence

$$
A=-\int_{1/2}^{1}f(x)\,dx+\lim_{T\to\infty}\int_1^T f(x)\,dx.
$$

The minus sign makes the first area contribution nonnegative.

**2. Calculation**

We have $f(x)=x^{-2}-x^{-3}$ and

$$
F(x)=-\frac1x+\frac1{2x^2},\qquad F'(x)=x^{-2}-x^{-3}=f(x).
$$

As $F(\frac12)=0$ and $F(1)=-\frac12$, the left subarea is
$-(F(1)-F(\frac12))=\frac12$.
The right subarea is

$$
\lim_{T\to\infty}\left(-\frac1T+\frac1{2T^2}+\frac12\right)=\frac12.
$$

Thus $A=\frac12+\frac12=1$ square unit. The only improper limit in
this decomposition exists and is finite. Infinite extent does not by
itself force infinite area.

**3. Both sides of $0$**

The function $g$ is negative on the left and positive on the right.
Using $G(x)=-\frac1{2x^2}$, for $0<\varepsilon<1$ we obtain

$$
-\int_{-1}^{-\varepsilon}g(x)\,dx
=\frac1{2\varepsilon^2}-\frac12,
\qquad\int_\varepsilon^1g(x)\,dx=\frac1{2\varepsilon^2}-\frac12.
$$

Both nonnegative subareas tend to $+\infty$ as $\varepsilon\to0^+$.
There is no finite total area.

**4. Areas do not cancel**

The symmetric sum consists of signed integrals, not nonnegative areas.
The left signed integral tends to $-\infty$ and the right one to
$+\infty$; they cannot be combined into zero. The required separate
limits are not finite. Both area contributions themselves grow without bound.
