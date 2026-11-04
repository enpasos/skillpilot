# Worked solution: approximating e

**1. Expression**

There are $n$ identical growth factors, so

$$
a_n=\left(1+\frac1n\right)^n.
$$

The base is the factor for one step and the exponent is the number of steps.

**2. Table**

| $n$ | Expression | $a_n$ to six decimal places |
|---:|---|---:|
| 1 | $(1+1/1)^1$ | 2.000000 |
| 10 | $(1+1/10)^{10}$ | 2.593742 |
| 100 | $(1+1/100)^{100}$ | 2.704814 |
| 1000 | $(1+1/1000)^{1000}$ | 2.716924 |
| 10000 | $(1+1/10000)^{10000}$ | 2.718146 |
| 100000 | $(1+1/100000)^{100000}$ | 2.718268 |

**3. Approximation**

A suitable approximation is $e\approx2.718$.
The last two values round alike to three decimal places and are close
together. This supports the approximation within the given limit model.
A finite table, however, proves neither the exact limit nor a particular
maximum error. Thus $2.718$ is stated with an approximation sign.

**4. Natural exponential function**

$e$ is the fixed base of the natural exponential function, not a variable
initial amount. We have $f(0)=e^0=1$ and $f(1)=e$.
The exact constant is approximated, not replaced, by the rounded finite decimal.

**5. Initial value $200$**

After $n$ steps, the value is

$$
200\left(1+\frac1n\right)^n=200a_n.
$$

After one time unit this gives approximately $200e\approx543.6$ using
the previous three-place approximation. In $B(t)=200e^t$, the prefactor,
and hence the initial value $B(0)=200$, changes. The base $e$ and the
relative growth procedure stay the same.
