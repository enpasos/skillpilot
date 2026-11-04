# Worked solution: parabolic trajectory

**1.** The parameterisation is
$$
\vec x(t)=\begin{pmatrix}1+4t\\-2+3t\\2+6t-2t^2\end{pmatrix},
\qquad0\le t\le3.
$$
$t$ is elapsed time in seconds, and $\vec x(0)=(1,-2,2)^{\mathsf T}$
is the starting position. The coefficients $4$ and $3$ are constant
horizontal velocities in metres per second. The height change is
$6t-2t^2$: its negative quadratic term increasingly lowers the ball
relative to the initial linear rise. It is not a constant velocity
vector. This simplified model gives a parabolic arc without claiming
an exact real flight path.

**2.** At $1\,\mathrm s$ the ball is at $P=(5,1,6)$; at
$3\,\mathrm s$ the catch point is $C=(13,7,2)$.
The given completed square shows a maximum height of $13/2=6.5$
at $t=3/2$: the subtracted squared expression is zero there and
nonnegative elsewhere. This time is inside the interval.
The highest spatial point is $H=(7,5/2,13/2)$. Height is its $z$
coordinate, rather than the distance travelled along the path.

**3.** From $x=1+4t$, $t=(x-1)/4$, hence
$$
y=-2+\frac34(x-1),
$$
$$
z=2+\frac32(x-1)-\frac18(x-1)^2,\qquad1\le x\le13.
$$
The $y$ relation is independent of $z$ and defines a vertical plane.
Within that plane the ball travels horizontally in one fixed direction.
Its horizontal distance $q$ from the starting position is $q=5t$,
$0\le q\le15$, since $\sqrt{4^2+3^2}=5$. In orthogonal coordinates
of that vertical plane,
$$
z=2+\frac65q-\frac2{25}q^2.
$$
The nonzero quadratic coefficient establishes a parabolic arc. Using
$q$ explicitly shows a parabola in the spatial plane, rather than only
a quadratic relation in a projection. Equivalent reasoning using the
linear scaling of the horizontal coordinate is valid.

**4.** Substituting $t=u/2$ gives
$$
\vec x(u)=\begin{pmatrix}1+2u\\-2+\frac32u\\2+3u-\frac12u^2\end{pmatrix},
\qquad0\le u\le6.
$$
For example $u=2$ corresponds to $t=1$, and both give $P=(5,1,6)$.
The parameter intervals correspond bijectively, giving the same entire
point set. The new parameter runs twice as fast as the numerical time
in seconds. The coefficients $2$ and $3/2$ are changes per unit of $u$,
rather than per second. The physical horizontal velocities in the same
model remain $4$ and $3\,\mathrm{m/s}$; only the parameter has changed.


## One overall assessment

There is one total score out of **20 points** and one binary overall
result: **pass at 15 points or more**, otherwise not passed.
Part scores have no separate pass thresholds and create no partial
mastery or mastery of prerequisite goals.

Credit traceable mathematical work wherever it occurs. Equivalent
methods and representations receive equal credit; count the same
performance once. Award partial credit as specified, otherwise 0.5
points for meaningful but incomplete work. Do not repeatedly penalise
one local arithmetic or copying error; credit correct traceable
follow-through. Concise correct explanations count, with no prescribed
keywords or order.

| Criterion | Points |
|---|---:|
| Combines all three coordinates into a spatial parameterisation (3, 1 per coordinate); time domain [0,3] (1); interprets time/start and horizontal coefficients (1); explains the negative quadratic height term in the motion (1). | 6 |
| Position at 1 s (1); catch point (1); justifies maximum time inside the interval using the square form (1); height (1); remaining spatial coordinates of the highest point (1 together). | 5 |
| Obtains t=(x−1)/4 and correct y relation (1); correct z(x) (1); domain 1≤x≤13 (1); explains vertical plane (1); justifies the parabola in it using a nonzero quadratic term and a linear horizontal coordinate (1). | 5 |
| Complete new vector parameterisation (1); u domain [0,6] (1); checks a corresponding numerical example (1); distinguishes changed parameter from unchanged velocities per second (1). | 4 |

Cap the ordinary total at 14 if the whole submission contains no sound spatial parameterisation with a genuinely quadratic height component, or no interpretation at all of the parameter in the temporal motion context. Isolated points or a parameter-free locus z(x) alone do not replace that core action. Concise valid parameterisation and interpretation count. A local coefficient, substitution or copying error in a recognisable quadratic model does not trigger the cap.

Multiple cap reasons give the same upper limit of 14 points. There is one overall pass without additional part-pass conditions.
