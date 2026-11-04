# Worked solution: roof and light ray

**1.** The edge vectors are $\overrightarrow{AB}=(6,0,3)^{\mathsf T}$
and $\overrightarrow{AD}=(0,4,0)^{\mathsf T}$, giving
$$
E:\quad\vec x=\begin{pmatrix}0\\0\\3\end{pmatrix}
+u\begin{pmatrix}6\\0\\3\end{pmatrix}
+w\begin{pmatrix}0\\4\\0\end{pmatrix}.
$$
For the whole plane, $u,w\in\mathbb R$ independently; the roof surface
requires $0\le u\le1$, $0\le w\le1$. The nonparallel directions span
a plane. From $x=6u$, $y=4w$, $z=3+3u$ we obtain
$$
E:\quad z=3+\frac{x}{2},\qquad\text{equivalently }x-2z=-6.
$$
For example, $C$ satisfies $6-2\cdot6=-6$ and has $u=w=1$.
Accept another valid corner check.

**2.** The mast tip is $S=(8,2,9)$. Its light ray is
$$
\vec x=\begin{pmatrix}8\\2\\9\end{pmatrix}
+t\begin{pmatrix}-1\\0\\-1\end{pmatrix},\qquad t\ge0.
$$
Negative values travel against the specified light direction. A complete
line allows $t\in\mathbb R$. Here $t$ is a geometric parameter, not a
specified elapsed time.

**3.** Substitution gives
$$
9-t=3+\frac{8-t}{2},\qquad t=4.
$$
Thus $P=(4,2,5)$. Substituting $t=4$ into the ray gives this point,
and $4-2\cdot5=-6$ checks the plane equation. Since $t\ge0$, the point
is on the ray. Moreover $u=2/3$, $w=1/2$ satisfy both finite-surface
restrictions. In this model, the mast-tip shadow falls on the roof.
Uniqueness also follows because the light direction is not parallel
to the plane.

**4.** The new tip is $S'=(8,5,9)$. Only the constant $y$ coordinate
changes, and the plane equation does not involve $y$. Hence $t=4$
again and $P'=(4,5,5)$. It is on the correct ray and the infinite plane,
but $y=5>4$, or $w=5/4>1$, violates the roof boundary. It is not a
shadow point on this finite roof surface.

**5.** For example, perfectly parallel rays simplify the light from the spatially
extended Sun: a real shadow has a
transition region rather than an arbitrarily sharp boundary. Or the
roof is assumed perfectly flat; real roof structures or curvature could
change the hit point or intercept a ray first. Accept another concrete
explanation consistent with the model. Merely saying “it is only a
model” does not explain an effect.


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
| Sound plane parameterisation using independent roof edges (2); correct restrictions on both parameters (2); coordinate equation (1); valid corner check (1). | 6 |
| Mast tip (1); ray equation with appropriate position and direction vectors (2); explains t≥0 versus a full line (1). | 4 |
| Intersection equation from the models (1); calculates t and P (1); checks ray and plane (1); correct ray domain (1); justified finite-roof check (1). | 5 |
| Justifies the new tip and unchanged parameter, or correctly recalculates (1); P′ (1); uses y or a surface parameter to distinguish plane intersection from a roof hit (1). | 3 |
| Identifies a concrete appropriate idealisation (1); explains a possible effect on the shadow claim (1). | 2 |

Cap the ordinary total at 14 if the whole submission contains no sound pair of a learner-constructed roof-plane model and light line/ray model, or if interpretation using the ray and roof restrictions is entirely absent or conceptually replaced by “a plane intersection always hits the roof”. Concise valid modelling and context checks count; equivalent equations are equally valid. A local arithmetic slip with sound models and traceable contextual checking does not trigger the cap.

Multiple cap reasons give the same upper limit of 14 points. There is one overall pass without additional part-pass conditions.
