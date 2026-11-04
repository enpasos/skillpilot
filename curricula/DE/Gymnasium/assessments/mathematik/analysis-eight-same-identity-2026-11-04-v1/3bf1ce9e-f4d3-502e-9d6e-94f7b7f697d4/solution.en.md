# Worked solution: logarithm as an antiderivative

**1. Relationship**

For $x>0$, $(\ln x)'=1/x$, exactly the defining condition for an
antiderivative. All antiderivatives on $(0,\infty)$ are $\ln x+C$ with
$C\in\mathbb R$: an additive constant has derivative zero.

**2. Application**

$$
H(x)=3\ln x+x^2+C,\qquad H'(x)=\frac3x+2x=h(x).
$$

Using $\ln(e^2)=2$ and $\ln1=0$ gives

$$
\int_1^{e^2}\left(\frac3x+2x\right)\,dx
=(6+e^4)-(0+1)=e^4+5.
$$

The constant cancels in the difference.

**3. Bounds**

Both bounds are positive, so the relationship applies throughout the
integration interval:

$$
J(a)=\ln(ea)-\ln a=\ln e+\ln a-\ln a=1.
$$

The ratio of upper to lower bound is always $e$; the logarithm difference,
and hence the integral, is independent of $a$.

**4. Domain boundary**

$0$ is outside the domains of $1/x$ and the real natural logarithm.
$\ln(0)$ is not a real function value. The usual evaluation by two
finite antiderivative values therefore does not apply. No limit
conclusion is asserted here.
