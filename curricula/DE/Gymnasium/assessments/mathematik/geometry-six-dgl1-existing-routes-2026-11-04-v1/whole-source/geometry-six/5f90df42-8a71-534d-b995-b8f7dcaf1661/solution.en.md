# Worked solution: parameter-dependent angles

**1.** Use $\vec n_F=(0,1,1)^{\mathsf T}$,
$\vec n_a=(a,1,0)^{\mathsf T}$ and $\vec u_a=(1,0,a)^{\mathsf T}$.
Their fixed components $1$ keep the latter two vectors nonzero, so the
plane and line are defined for every real $a$. Choosing $a$ selects a
configuration; afterwards $t$ runs through the points of that one line.

**2.** We have $\vec u_a\cdot\vec n_F=a$,
$\|\vec u_a\|=\sqrt{1+a^2}$ and $\|\vec n_F\|=\sqrt2$, hence
$$
\sin\alpha_a=\frac{|a|}{\sqrt2\sqrt{1+a^2}}.
$$
For $\alpha_a=30^\circ$ this equals $1/2$. Both sides are nonnegative
and the denominator is positive, so squaring is equivalent:
$$
\frac{a^2}{2(1+a^2)}=\frac14
\quad\Longleftrightarrow\quad a^2=1.
$$
Thus $a=-1$ or $1$. In the original quotient, both give
$1/(\sqrt2\sqrt2)=1/2$, hence the required nonobtuse angle $30^\circ$.
Equivalent transformations exclude further solutions.

**3.** Since $\vec n_a\cdot\vec n_F=1$ and
$\|\vec n_a\|=\sqrt{1+a^2}$,
$$
\cos\beta_a=\frac1{\sqrt2\sqrt{1+a^2}}.
$$
The absolute value does not change the dot product $1$ here. In a
cross-section perpendicular to the intersection line, the normals are
perpendicular to their respective plane traces, so their smaller angle
equals the plane angle. The normals can never be parallel: their third
components are $0$ and $1$, while both second components are $1$.
Thus the planes really do intersect for every $a$.

For $\beta_a=60^\circ$, set the quotient to $1/2$. Positivity makes
squaring equivalent:
$$
\frac1{2(1+a^2)}=\frac14
\quad\Longleftrightarrow\quad a^2=1.
$$
Again $a=\pm1$, both giving the original cosine $1/2$ and hence
$\beta_a=60^\circ$. There are no other solutions.

**4.** $g_0$ has direction $(1,0,0)^{\mathsf T}$ and satisfies
$y+z=1$ at every point. Its direction is perpendicular to $\vec n_F$
and thus parallel to $F$, but its position point is outside $F$.
The line is distinct and parallel to the plane, rather than contained in it.

**5.** For two nonobtuse angles,
$\alpha_a+\beta_a=90^\circ$ is equivalent to
$\sin\alpha_a=\cos\beta_a$. Their positive common denominator gives
$|a|=1$, so exactly $a=\pm1$. The angles are then $30^\circ$ and
$60^\circ$. At $a=0$, for example, the angles instead are $0^\circ$
and $45^\circ$. Using sine and cosine with different geometric
vectors does not create a universal complementary-angle relationship.


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
| Both normals and line direction correct (1 together); justifies validity for all a with nonzero vectors (1); distinguishes roles of a and t (1). | 3 |
| Derives line–plane sine from dot product and norms (2); equation for 30° and equivalent squaring (1); both parameter values and completeness (2); checks original quotient (1). | 6 |
| Derives plane–plane cosine using suitable normals (2); correctly solves 60° condition (2); checks both values in original quotient (1); geometrically relates normal angle to plane angle (1). | 6 |
| Justifies parallel direction (1); uses outside position point to justify strict parallelism rather than containment (1). | 2 |
| Reduces complementary-angle condition to equality of quotients (1); derives exactly \|a\|=1 (1); interprets the restricted validity, e.g. with counterexample a=0 (1). | 3 |

Cap the ordinary total at 14 if the whole submission contains no parameter-dependent angle investigation for one of the two stated configuration types, all parameter values are obtained solely by trial rather than derived from an angle/position condition, or every geometric interpretation of the angles used or the position investigated is absent. The OR-list of possible condition types in the original competency does not require separate passes for every angle, orthogonality, parallelism and positional variant. This form has one overall pass for the actual tasks set. Concise general derivations count; local arithmetic errors do not trigger the cap.

Multiple cap reasons give the same upper limit of 14 points. There is one overall pass without additional part-pass conditions.
