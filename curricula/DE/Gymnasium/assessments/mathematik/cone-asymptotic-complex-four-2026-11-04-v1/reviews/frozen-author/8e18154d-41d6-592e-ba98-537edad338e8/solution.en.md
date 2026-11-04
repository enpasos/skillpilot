# Reference solution: roots of unity

**1.** Since $|z|^6=1$, we get $|z|=1$. Writing $z=e^{i\varphi}$
gives $e^{6i\varphi}=1$, hence $6\varphi=2\pi k$ for integer $k$.
Distinct solutions are

$$
z_k=e^{ik\pi/3},\qquad k=0,1,2,3,4,5.
$$

The angles $0,\pi/3,2\pi/3,\pi,4\pi/3,5\pi/3$ are distinct in one
full turn. Other integers repeat these points by period $2\pi$.
The modulus and argument conditions leave no other solutions. Equivalent
angle representatives, including negative angles, receive full credit
if no solution is missing or counted twice.

**2.** In the same order:

$$
1,\quad\frac12+\frac{\sqrt3}{2}i,\quad
-\frac12+\frac{\sqrt3}{2}i,\quad-1,\quad
-\frac12-\frac{\sqrt3}{2}i,\quad
\frac12-\frac{\sqrt3}{2}i.
$$


**3.** The sketch has a horizontal real axis and vertical imaginary
axis. Its six points have coordinates $(1,0)$, $(1/2,\sqrt3/2)$,
$(-1/2,\sqrt3/2)$, $(-1,0)$, $(-1/2,-\sqrt3/2)$,
$(1/2,-\sqrt3/2)$ on the circle centred at the origin with radius 1.
Modulus is distance from the origin. Adjacent angles differ by
$\pi/3=60^\circ$, forming a regular hexagon. Multiplication by
$e^{i\pi/3}$ adds $\pi/3$ to the argument without changing modulus 1:
it rotates every point $60^\circ$ anticlockwise to the next point,
with the last returning to the first. These details fully describe
the expected sketch.

![Reference sketch for the solution only: six labelled sixth roots with their arguments on the unit circle, forming a regular hexagon.](/assets/assessment-materials/mathematik/8e18154d-41d6-592e-ba98-537edad338e8/sixth-roots-solution-v1.png)

**4.** Similarly, angles $0,\pi/2,\pi,3\pi/2$ give $1,i,-1,-i$,
forming a square centred at the origin with vertices on the axes.

**5.** We have $z_k^3=e^{ik\pi}=(-1)^k$, so exactly $k=0,2,4$ work:

$$
1,\qquad-\frac12+\frac{\sqrt3}{2}i,\qquad
-\frac12-\frac{\sqrt3}{2}i.
$$

Their angular spacing is $2\pi/3$, forming an equilateral triangle.
In particular $e^{i\pi/3}$ is a sixth root but not a third root,
since its cube is $-1$.
