# Worked solution: family of planes

**1. Normal vector and individual planes**

A normal vector is

$$
\vec n_a=\begin{pmatrix}a-1\\1\\a\end{pmatrix}.
$$

Its second component is $1$, so it is nonzero for every $a$.
The equation therefore defines a genuine plane for every $a$.
In particular,

$$
E_0:\ -x+y=1,\qquad E_1:\ y+z=2.
$$

**2. Position relative to $F$**

Subtracting the equation of $F$ from that of $E_a$ gives

$$
 (a-1)x+(a-1)z=a-1,
$$

or $(a-1)(x+z-1)=0$.

For $a=1$, this equation holds for every point of $F$, and $E_1$ is
exactly $F$. Their intersection is the entire plane.

For $a\neq1$, division by $a-1$ is valid. The simultaneous conditions are

$$
x+z=1,\qquad y+z=2.
$$

Putting $x=t$ gives $z=1-t$ and $y=1+t$. The intersection line is

$$
L:\quad\vec x=\begin{pmatrix}0\\1\\1\end{pmatrix}
+t\begin{pmatrix}1\\1\\-1\end{pmatrix},\qquad t\in\mathbb R.
$$

Exactly these points lie in both planes. Thus, for every $a\neq1$,
$E_a$ and $F$ intersect in this same line $L$.
There is no case of distinct parallel planes relative to $F$.

**3. Common line**

For an arbitrary point $(t,1+t,1-t)$ on $L$,

$$
(a-1)t+(1+t)+a(1-t)=a+1
$$

holds for every $a$. Thus every plane in the family contains the whole line.
Conversely, any point belonging to all family members must in particular
belong to $E_0$ and $E_1$. Their equations $-x+y=1$ and $y+z=2$ give
exactly $y=1+x$ and $z=1-x$, which describe $L$.
There are therefore no further points common to every plane.
The different planes share one common axis, like open book pages around
the same line. The family members are indeed different planes: since
the coefficient of $y$ is always $1$, two equations can be proportional,
and hence define the same plane, only when their parameters are equal.

**4. Point condition and parallelism to $G$**

Substituting $P$ gives

$$
2(a-1)+a=a+1\quad\Longleftrightarrow\quad2a=3,
$$

so $a=\frac32$. Checking in
$E_{3/2}:\ \frac12x+y+\frac32z=\frac52$ gives
$1+0+\frac32=\frac52$.

The normal vector of $G$ is $(0,1,1)^{\mathsf T}$.
Parallel planes must have parallel normal vectors. Both normal vectors
have second component $1$, so the proportionality factor would have to
be $1$. Thus $a-1=0$ and $a=1$ are required, giving exactly $a=1$.
Then $E_1:\ y+z=2$ differs from $G:\ y+z=3$, so the planes are
**distinct and parallel**. For $a\neq1$, their normals are not parallel,
so the planes intersect in a line. No parameter makes $E_a$ identical
to $G$.
