# Reference solution: transformation families

**1.** $G_t$ shifts the standard parabola by $t$ horizontally and 1
upward; negative $t$ means leftward. A base point maps as

$$
(u,u^2)\longmapsto(u+t,u^2+1),
$$

since $G_t(u+t)=u^2+1$. The domain is $\mathbb R$, range $[1,\infty)$,
vertex $S_t=(t,1)$ and symmetry axis $x=t$. For $t=-2$ and $t=3$
the vertices are $(-2,1)$ and $(3,1)$. Every point is translated by
the same vector, preserving distances and parabola shape. The parameter
changes only horizontal position; the vertical shift of 1 is fixed.

**2.** $H_a$ multiplies y-coordinates by $a$:

$$
(u,e^u)\longmapsto(u,ae^u).
$$

This is a vertical stretch for $a>1$ and a vertical compression for
$0<a<1$; x-coordinates stay fixed. Domain $\mathbb R$, range
$(0,\infty)$, y-intercept $(0,a)$, horizontal asymptote $y=0$ as
$x\to-\infty$. We have $H_2(0)=2$ and $H_{1/2}(0)=\tfrac12$.
They do not intersect: $2e^x=\tfrac12e^x$ is impossible since $e^x>0$.
The first graph lies above the second everywhere. This is a pure vertical
transformation, with no change to the exponential function type.

**3.** From $u=bx$ we get $x=u/b$, hence

$$
(u,\sin u)\longmapsto(u/b,\sin u).
$$

The horizontal scale factor is $1/b$. The range is $[-1,1]$, amplitude 1,
period $2\pi/b$, and zeros $x=k\pi/b$ for $k\in\mathbb Z$.
For $b=2$, the horizontal factor is $\tfrac12$, period $\pi$, and first
maximum $(\pi/4,1)$. For $b=\tfrac12$, the factor is 2, period $4\pi$,
and first maximum $(\pi,1)$. Only x-coordinates change in the mapping,
so the extreme values $-1,1$ and amplitude remain unchanged.

**4.** The claim is false. For example, $G_3$ shifts the parabola right
and up without changing its shape; $K_{1/2}$ is horizontally wider than
$\sin x$ (factor 2), although its parameter is positive. Other correctly
explained examples also count, such as vertical compression in $H_{1/2}$.
The parameter's position in the expression and its range determine
the actual effect.
