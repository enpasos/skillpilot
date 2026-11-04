# Reference solution: graph, degree and expression

**1.** Read $A=(-2,0)$, $B=(1,0)$ and $P=(0,1)$. The crossing at $-2$
implies odd multiplicity, at least 1; touching without a sign change
at 1 implies even multiplicity, at least 2.

**2.** These multiplicities already require degree at least 3. Two
genuine turning points also rule out degrees 1 and 2; in general a
polynomial has at most degree minus one turning points. The opposite
known end directions require odd degree. Together with
$3\leq\deg F\leq4$, this gives $\deg F=3$. Up to the right and down
to the left imply a positive leading coefficient. A small graph window
alone would not prove behaviour at infinity; here it is explicitly given.

**3.** With degree 3 the multiplicities must be exactly 1 and 2, so

$$
F(x)=a(x+2)(x-1)^2.
$$

The point $P=(0,1)$ gives $1=a\cdot2\cdot1$, hence $a=\tfrac12$.
A fitting expression is

$$
F(x)=\tfrac12(x+2)(x-1)^2=\tfrac12x^3-\tfrac32x+1.
$$

Equivalent forms and other traceable ways of determining the polynomial
receive equal credit.

**4.** Near $-2$, $(x-1)^2$ remains positive while $x+2$ changes sign:
there is a crossing. Near 1, $x+2$ is positive and the square is
nonnegative on both sides, giving touching without a sign change.
For $-2<x<1$, both $x+2$ and $(x-1)^2$ are positive, hence $F(x)>0$,
matching the portion above the x-axis.

**5.** Without an upper degree bound, the retained data give only a
minimum degree and parity. For example,

$$
H(x)=\tfrac12(x+2)(x-1)^2(1+x^2)
$$

has degree 5 with positive leading coefficient. The factor $1+x^2$ is
positive for every real $x$, so no extra real zeros appear and the
multiplicities and crossing/touching behaviour remain unchanged.
Also $H(0)=1$, and the odd degree and positive leading coefficient
preserve the end directions. $H$ need not match the entire drawn curve:
part 5 explicitly removed that additional requirement. Factors
$(1+x^2)^m$ provide arbitrarily larger odd degrees.
