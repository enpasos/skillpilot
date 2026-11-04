# Reference solution: Dividing a tetrahedron

This is one complete solution. Mathematically equivalent methods and representations are equally valid.

**a) Planes and lines.** The three non-collinear points $O$, $A$ and $B$ have third coordinate $0$. Thus $F:\ z=0$. Planes $E$ and $F$ have the same normal direction, for example $\vec n=\begin{pmatrix}0\\0\\1\end{pmatrix}$, but different constant $z$-coordinates. They are distinct parallel planes and have no common point. Geometrically, $E$ runs parallel to the base halfway up the tetrahedron.

On $g$, the third coordinate is $z=6-t$. Substituting into $E$ gives
$$
6-t=3\quad\Longrightarrow\quad t=3,\qquad P(6\mid0\mid3).
$$
The direction vector has third component $-1$, so exactly one parameter satisfies the equation. Line $g$ intersects $E$ at the unique point $P$; it is neither contained in nor parallel to $E$.

On $h$, the third coordinate is $z=0$ for every parameter. The equation $0=3$ has no solution. The line shares no point with $E$ and its direction is parallel to the plane: $h$ is parallel to $E$ and lies outside it.

On $k$, the third coordinate is $z=3$ for every parameter. The plane equation holds for all $r$, so the entire line $k$ lies in $E$. A constant $z$-coordinate alone does not distinguish a line contained in the plane from a parallel line outside it: the value must be checked against the plane equation.

**b) Pairs of lines.** Lines $h$ and $k$ have the same direction vector. They are distinct because every point on $h$ has $z=0$, whereas every point on $k$ has $z=3$. They are therefore distinct parallel lines.

The claim about $g$ and $k$ is false. Any common point would lie in $E$, so it would have to be the previously calculated unique intersection $P$ of $g$ with $E$. However, a point of $k$ with second coordinate $0$ must satisfy $2r=0$, hence $r=0$. This gives $(0\mid0\mid3)$ rather than $P(6\mid0\mid3)$. Thus $P$ does not lie on $k$, and $g$ and $k$ do not intersect. Their direction vectors $\begin{pmatrix}2\\0\\-1\end{pmatrix}$ and $\begin{pmatrix}-3\\2\\0\end{pmatrix}$ are not scalar multiples, so the lines are not parallel either. They are **skew**. A line may meet a plane at a point that does not belong to a particular line within that plane.

**c) Cross-section.** Use a parameter $\lambda\in[0,1]$ on each segment from $C$ to the base:
$$
\begin{aligned}
\overrightarrow{CX}&=\lambda\overrightarrow{CO},&X&=(0\mid0\mid6-6\lambda),\\
\overrightarrow{CY}&=\lambda\overrightarrow{CA},&Y&=(12\lambda\mid0\mid6-6\lambda),\\
\overrightarrow{CZ}&=\lambda\overrightarrow{CB},&Z&=(0\mid8\lambda\mid6-6\lambda).
\end{aligned}
$$
Setting $z=3$ gives $\lambda=\frac12$ in each case. Therefore
$$
U(0\mid0\mid3),\qquad V(6\mid0\mid3),\qquad W(0\mid4\mid3).
$$
These parameters belong to the segment interval. The other three edges, $OA$, $OB$ and $AB$, lie entirely in $z=0$ and do not meet $E$. The cross-section of the convex tetrahedron connects the three identified edge points: the entire cross-section is the filled triangle $UVW$. It is right-angled at $U$, since $\overrightarrow{UV}=(6,0,0)^{\mathsf T}$ and $\overrightarrow{UW}=(0,4,0)^{\mathsf T}$ are perpendicular. Describing it as a triangle parallel to the base with half the side lengths also justifies the shape.

**d) Volumes.** Base $OAB$ is a right triangle with perpendicular side lengths $12$ and $8$; the tetrahedron has height $6$. Hence
$$
\begin{aligned}
G&=\frac12\cdot12\cdot8=48\,\mathrm{LU}^2,\\
V_{\mathrm{whole}}&=\frac13\cdot48\cdot6=96\,\mathrm{LU}^3.
\end{aligned}
$$
The solid containing apex $C$ is pyramid $CUVW$. Its base $UVW$ has perpendicular side lengths $6$ and $4$, and its height is the distance from $C$ to $E$, namely $3$. Thus
$$
\begin{aligned}
G_{UVW}&=\frac12\cdot6\cdot4=12\,\mathrm{LU}^2,\\
V_{\mathrm{upper}}&=\frac13\cdot12\cdot3=12\,\mathrm{LU}^3.
\end{aligned}
$$
The remaining solid is a truncated pyramid. Subtraction gives its volume:
$$
\begin{aligned}
V_{\mathrm{lower}}&=96-12=84\,\mathrm{LU}^3,\\
V_{\mathrm{upper}}:V_{\mathrm{lower}}&=12:84=1:7.
\end{aligned}
$$
The part containing $C$ occupies $\frac18$ of the whole volume, and the remainder occupies $\frac78$. The remainder has seven times the volume of the upper part.

**e) Half the height does not mean half the volume.** The claim is false. Each of the three segments from $C$ to the base is halved in the same ratio. The upper part is therefore a pyramid similar to the whole tetrahedron, with length factor $\frac12$, base-area factor $\frac14$ and height factor $\frac12$. From $V=\frac13Gh$,
$$
\frac{V_{\mathrm{upper}}}{V_{\mathrm{whole}}}
=\frac14\cdot\frac12=\frac18.
$$
The lower and upper parts have equal heights, but cross-sections become smaller towards the apex. Equal heights therefore do not give equal volumes here. The remaining $\frac78$ produces the division ratio $1:7$.

Alternatively, the known volume-scaling rule $\left(\frac12\right)^3$ can be used directly if the similarity of the upper pyramid to the whole tetrahedron is explained. No cross product, scalar triple product, integral or special formula for a truncated pyramid is needed.
