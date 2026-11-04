# Worked solution: exponential and polynomial combinations

**1. Product**

The proposed form gives $F'(x)=[a+ax+b]e^x=[ax+(a+b)]e^x$.
Comparison with $(2x+1)e^x$ gives $a=2$ and $a+b=1$, hence $b=-1$.
Thus $F(x)=(2x-1)e^x$ is an antiderivative. Checking gives

$$
F'(x)=2e^x+(2x-1)e^x=(2x+1)e^x.
$$

Therefore

$$
\int_0^1f(x)\,dx=F(1)-F(0)=e-(-1)=e+1.
$$

**2. Composition**

$G(x)=e^{x^2+1}$ works because the chain rule gives
$G'(x)=e^{x^2+1}\cdot2x=g(x)$.

$$
\int_0^1g(x)\,dx=G(1)-G(0)=e^2-e.
$$

**3. Sum**

An antiderivative is $H(x)=\frac12e^{2x}+x^3$.
Checking gives $H'(x)=\frac12\cdot2e^{2x}+3x^2=h(x)$.

$$
\int_0^1h(x)\,dx=\left(\frac12e^2+1\right)-\frac12
=\frac{e^2+1}{2}.
$$

An arbitrary additive constant may be included in each antiderivative;
it does not change any definite integral calculation.
