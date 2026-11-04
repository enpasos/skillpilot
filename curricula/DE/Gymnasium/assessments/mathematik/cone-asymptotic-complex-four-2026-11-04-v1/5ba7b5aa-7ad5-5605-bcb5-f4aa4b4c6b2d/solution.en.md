# Reference solution: complex division

**1.** The conjugate of $1-2i$ is $1+2i$, so

$$
q_1=\frac{(3+4i)(1+2i)}{(1-2i)(1+2i)}
=\frac{3+10i+8i^2}{1-(2i)^2}
=\frac{-5+10i}{5}=-1+2i.
$$

Multiplying numerator and denominator by the same number introduces
the factor $(1+2i)/(1+2i)=1$, leaving the quotient unchanged.
The mixed imaginary terms cancel in the denominator; $i^2=-1$ gives
$1+4=5$. This uses conjugation deliberately rather than dividing
components separately.

**2.**

$$
q_2=\frac{(2-3i)(1-2i)}{(1+2i)(1-2i)}
=\frac{2-7i+6i^2}{5}
=-\frac45-\frac75i.
$$

For the purely imaginary denominator one can multiply both parts by $-2i$:

$$
q_3=\frac{(4-2i)(-2i)}{(2i)(-2i)}
=\frac{-4-8i}{4}=-1-2i.
$$

Using $1/i=-i$ also works.

$$
q_4=\frac{2-i}{(2+i)(2-i)}=\frac{2-i}{5}
=\frac25-\frac15i.
$$

Other correct algebraic methods for these three transfer calculations
receive equal credit.

**3.** The correct check is

$$
(-1+2i)(1-2i)=-1+4i-4i^2=3+4i.
$$

The incorrect proposal instead gives

$$
(3-2i)(1-2i)=3-8i+4i^2=-1-8i\ne3+4i.
$$

A quotient multiplied by the original denominator must recover the
numerator. Separate component division ignores the mixed products and
$i^2=-1$ in complex multiplication, so it cannot invert that operation.
The two checks demonstrate the distinction in the given example.
