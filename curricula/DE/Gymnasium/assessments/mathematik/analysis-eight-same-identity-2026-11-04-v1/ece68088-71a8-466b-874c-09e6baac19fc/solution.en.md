# Worked solution: reconstructing quantities

**1. Water volume**

The rate gives the change, to which the initial volume must be added:

$$
V(t)=20+\int_0^t(6-2s)\,ds=20+6t-t^2,\qquad0\leq t\leq5.
$$

In particular, $V(0)=20$.

**2. Quantity and change**

$V(2)=28\,\mathrm{m}^3$ and $V(5)=25\,\mathrm{m}^3$.
The change is

$$
V(5)-V(2)=\int_2^5(6-2t)\,dt=-3\,\mathrm{m}^3.
$$

The tank loses a net $3\,\mathrm{m}^3$ between these times.
The change is the difference of two quantities, not the final volume
of $25\,\mathrm{m}^3$.

**3. Behaviour**

For $0\leq t<3$, $r(t)>0$, so $V$ increases. At $t=3$, $r=0$;
afterwards $r<0$, so the volume decreases. Its greatest value is
therefore $V(3)=29\,\mathrm{m}^3$. A negative rate describes outflow
per unit time, not a negative volume. For example, at $t=5$ the rate
is $-4\,\mathrm{m}^3/\mathrm h$ but the volume is $25\,\mathrm{m}^3$.
The volume stays positive throughout the model interval.

**4. Mathematical reconstruction**

$$
F(x)=3+\int_1^x(2s-4)\,ds
=3+(x^2-4x)-(1-4)=x^2-4x+6.
$$

Checks give $F'(x)=2x-4$ and $F(1)=1-4+6=3$.
The integral from $0$ to $4$ means $F(4)-F(0)=0$, so the endpoint
values are equal. Here both are $6$, not zero. The function need not
be constant between them; for example, $F(2)=2$.
