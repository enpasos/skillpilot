# Worked solution: integrals of the family

**1. Antiderivative**

When integrating with respect to $x$, treat $a$ as constant. For example,
$$F_a(x)=\frac{x^3}{3}-ax^2+2ax.$$
Differentiation gives $F_a'(x)=x^2-2ax+2a=f_a(x)$.
An additional term $C_a$ constant with respect to $x$ is also valid; it
need not be included when choosing one antiderivative.

**2. Parameter-dependent integral**

$$I(a)=F_a(1)-F_a(0)=\frac13-a+2a=a+\frac13.$$
$I(a)=0$ exactly when $a=-1/3$. If $a>-1/3$, $I(a)>0$;
if $a<-1/3$, $I(a)<0$.

**3. Signed area balance**

The integral is the contribution above the $x$-axis minus the magnitude
of the contributions below it. At $a=-1/3$, these contributions cancel.
However, $f_{-1/3}(0)=-2/3$ and $f_{-1/3}(1)=1$. The continuous function
therefore has negative and positive portions and is not the zero function.
Its total geometric area is positive and is found by adding nonnegative
subareas rather than allowing them to cancel. A suitable sketch or equivalent
argument using values suffices.

**4. Another interval**

$$J(a)=F_a(2)-F_a(0)=\frac83-4a+4a=\frac83.$$
$I$ depends linearly on $a$, whereas $J$ is independent of $a$.
On $[0,2]$, the integral of the parameter-dependent term $2a(1-x)$ is zero:
the contributions on either side of $x=1$ cancel. The individual graphs still
change; for example, $f_a(0)=2a$.
