# Worked solution: transformed functions

**1. Antiderivatives and checks**

$$
F(x)=-\frac12e^{-2x+1},\qquad
F'(x)=-\frac12(-2)e^{-2x+1}=f(x).
$$

$$
G(x)=-\frac13\cos\bigl(3(x-\pi/6)\bigr),\qquad
G'(x)=-\frac13(-\sin(3(x-\pi/6)))\cdot3=g(x).
$$

$$
H(x)=-\frac12\sin\bigl(-2(x-\pi/4)\bigr),\qquad
H'(x)=-\frac12\cos(-2(x-\pi/4))\cdot(-2)=h(x).
$$

Arbitrary additive constants are allowed. Equivalent expressions using
trigonometric symmetries are also correct.

**2. Integral**

The upper bound gives $3(\pi/2-\pi/6)=\pi$, and the lower bound gives
$3(\pi/6-\pi/6)=0$. Hence

$$
\int_{\pi/6}^{\pi/2}g(x)\,dx
=-\frac13\cos\pi-\left(-\frac13\cos0\right)=\frac23.
$$

**3. Explanation**

Differentiating a composition introduces the inner slope as an extra
factor. Its reciprocal compensates for that factor so the derivative
is the original function. For example, $F$ uses
$(-\frac12)\cdot(-2)=1$. The negative sign matters here.
All examples have nonzero inner slopes.

**4. Correction**

$K'(x)=-2\cos(-2(x-\pi/4))=-2h(x)$, rather than $h(x)$.
The required prefactor is $-\frac12$, giving $H$ from part 1.
