# Justify the fundamental theorem using continuity (advanced course)

Let f be continuous on [a,b] and $F(x)=\int_a^x f(t)\,dt$.

1. Express $[F(x+h)-F(x)]/h$ as an integral at an interior point x. Use intuitive continuity to justify why this mean value approaches f(x) as h approaches 0, for both signs of h, and deduce $F'=f$. (6 points)
2. Deduce $\int_a^b f=G(b)-G(a)$ for any antiderivative G, using the fact that zero derivative implies a constant. Apply this to $\int_0^1(3t^2+1)\,dt$. (4 points)

## Solution

The quotient is $\frac1h\int_x^{x+h}f(t)\,dt$. It lies between the smallest and largest f values on the short interval, for either sign of h; when h is negative both orientation and divisor change sign. Continuity forces these values and their average towards f(x), proving $F'=f$. Then $(G-F)'=0$, so $G-F=G(a)$ because F(a)=0. Therefore the definite integral is G(b)-G(a). Using G(t)=t³+t gives 2.
