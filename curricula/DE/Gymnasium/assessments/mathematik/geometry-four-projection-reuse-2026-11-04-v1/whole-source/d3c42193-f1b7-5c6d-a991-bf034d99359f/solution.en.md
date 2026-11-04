# Reference solution: complete fixed-point sets

**1.** For a position vector $\vec x$,
$$
M\vec x=\vec x\ \Longleftrightarrow\ M\vec x-I\vec x=\vec0
\ \Longleftrightarrow\ (M-I)\vec x=\vec0.
$$
This is a homogeneous linear system. $\vec x=\vec0$ is always a solution
because $M\vec0=\vec0$, so the origin always stays fixed.

**2.** With $\vec x=\begin{pmatrix}x_1\\x_2\\x_3\end{pmatrix}$,
$A\vec x=\vec x$ gives
$$
x_1+x_2=x_1,\qquad x_2=x_2,\qquad 2x_3=x_3.
$$
Thus $x_2=0$, $x_3=0$ and $x_1$ is free. Hence
$$
\operatorname{Fix}(A)=\left\{t\begin{pmatrix}1\\0\\0\end{pmatrix}:t\in\mathbb R\right\}.
$$
This is the whole $x_1$-axis. For every real parameter,
$A\begin{pmatrix}t\\0\\0\end{pmatrix}=\begin{pmatrix}t\\0\\0\end{pmatrix}$.
The solved system also proves that there are no further fixed points.

**3.** For $B$ the system is
$$
-x_3=x_1,\qquad x_2=x_2,\qquad -x_1=x_3.
$$
The first and third equations are equivalent: $x_1=-x_3$ is the only
condition, while $x_2$ and $x_3$ are free. Thus
$$
\operatorname{Fix}(B)=\left\{
\lambda\begin{pmatrix}0\\1\\0\end{pmatrix}
+\mu\begin{pmatrix}-1\\0\\1\end{pmatrix}:
\lambda,\mu\in\mathbb R\right\}.
$$
This is the origin plane $x_1+x_3=0$. Substituting
$\begin{pmatrix}-\mu\\\lambda\\\mu\end{pmatrix}$ returns the same vector.
Every point in this plane stays individually in place; this says more
than merely mapping the plane onto itself as a set.

**4.** For $C$ we obtain
$$
-x_2=x_1,\qquad x_1=x_2,\qquad 2x_3=x_3.
$$
The first two equations give $x_1=-x_1$, hence $x_1=x_2=0$; the last gives
$x_3=0$. Therefore $\operatorname{Fix}(C)=\{\vec0\}$.
None of the standard unit vectors is fixed, but the origin still is.
The claim is false: a linear map always has at least that fixed point.
The system proves that here it is the only one.

**5.** $D=I$, so $(D-I)\vec x=\vec0$ is the system
$0=0$, $0=0$, $0=0$. All three coordinates are free, giving
$\operatorname{Fix}(D)=\mathbb R^3$. The map is the identity; every point
in space stays fixed. There is no extra condition restricting the solution
to a line or plane.
