# Reference solution: cross product and areas

**1.** We have
$$
\vec a=\begin{pmatrix}2\\1\\0\end{pmatrix},\qquad
\vec b=\begin{pmatrix}0\\2\\2\end{pmatrix},\qquad
\vec n=\vec a\times\vec b=
\begin{pmatrix}1\cdot2-0\cdot2\\0\cdot0-2\cdot2\\2\cdot2-1\cdot0\end{pmatrix}
=\begin{pmatrix}2\\-4\\4\end{pmatrix}.
$$
It is nonzero and, by the cross-product property, perpendicular to both
spanning vectors, hence normal to the plane. The checks give
$\vec n\cdot\vec a=4-4+0=0$ and
$\vec n\cdot\vec b=0-8+8=0$.
Other nonzero multiples are also valid plane normals; the requested
cross product itself has the stated value.

**2.** Using $A$,
$$
2(x_1-1)-4x_2+4(x_3-1)=0,
\qquad E:x_1-2x_2+2x_3=3.
$$
For $B$, $3-2+2=3$; for $C$, $1-4+6=3$. Both belong to $E$.

**3.** The magnitude is
$$
\|\vec a\times\vec b\|=\sqrt{2^2+(-4)^2+4^2}=6.
$$
The spanned parallelogram has area $6\,\mathrm m^2$ and the triangle
half that, $3\,\mathrm m^2$. Geometrically,
$\|\vec a\times\vec b\|=\|\vec a\|\,\|\vec b\|\sin\theta$, where
$\theta$ is the angle between the spanning vectors: base times height.
The cross product is a directed vector; its magnitude is a nonnegative
number. Reversing order gives $\vec b\times\vec a=-\vec n$, leaving
magnitude and areas unchanged. The claim is false.

**4.** Linearity in one factor gives
$$
\vec a\times(t\vec b)=t\begin{pmatrix}2\\-4\\4\end{pmatrix},
\qquad F_\triangle(t)=\frac12\|t\vec n\|=3|t|\,\mathrm m^2.
$$
Componentwise calculation is equally valid. For $t<0$, $C_t$ is on the
opposite side of $A$ along line $AC$; the ordered cross-product normal
reverses direction, while area remains positive and scales by $|t|$.
For $t=0$, $C_t=A$, the cross product is $\vec0$ and triangle area is zero.
The zero vector has no normal direction and is not a plane normal vector.
The remaining distinct points $A,B$ determine only a line, through which
infinitely many planes pass. Thus no unique plate plane is determined.
For $t\ne0$, the spanning vectors remain independent and the plane is still $E$.
