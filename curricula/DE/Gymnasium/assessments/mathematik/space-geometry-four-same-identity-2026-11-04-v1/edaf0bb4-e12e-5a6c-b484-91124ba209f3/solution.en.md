# Worked solution: family of lines

**1. Family parameter and line parameter**

Choosing one fixed value of $a$ selects one line from the family.
On that line, $r$ ranges over all real numbers.

$$
g_0:\quad\vec x=\begin{pmatrix}0\\-1\\0\end{pmatrix}
+r\begin{pmatrix}1\\0\\0\end{pmatrix},
$$

$$
g_1:\quad\vec x=\begin{pmatrix}0\\0\\0\end{pmatrix}
+r\begin{pmatrix}1\\1\\0\end{pmatrix},
$$

$$
g_2:\quad\vec x=\begin{pmatrix}0\\1\\2\end{pmatrix}
+r\begin{pmatrix}1\\2\\0\end{pmatrix}.
$$

The direction vector $(1,a,0)^{\mathsf T}$ is never zero because its
first component is $1$. Thus $g_a$ is a genuine line for every $a$.

**2. Position relative to $h$**

Equating coordinates gives

$$
r=s,\qquad a-1+ar=0,\qquad a(a-1)=0.
$$

The last equation allows an intersection only for $a=0$ or $a=1$.

For $a=0$, the second equation is $-1=0$, which is impossible.
The direction vectors of $g_0$ and $h$ are equal, but $g_0$ has $y=-1$
instead of $y=0$. They are **distinct parallel lines**.

For $a=1$, the second equation gives $r=0$, and hence $s=0$.
The lines intersect at the origin $O=(0,0,0)$. Their directions are not
parallel, so the lines are different.

For $a\notin\{0,1\}$, the constant third coordinate $a(a-1)$ is nonzero,
preventing an intersection with $h$. At the same time, $(1,a,0)^{\mathsf T}$
is not parallel to $(1,0,0)^{\mathsf T}$ because $a\neq0$.
The lines are therefore **skew**.

There are no identical lines in this comparison for any $a$. Parallel
directions would require $a=0$, where the lines are distinct.
In three dimensions, not intersecting does not by itself prove parallelism;
as for $a\notin\{0,1\}$ here, the lines may be skew.

**3. Intersection with $k$**

The coordinates of $k$ require $x=0$ and $z=2$. Since $x=r=0$, we obtain

$$
a(a-1)=2\quad\Longleftrightarrow\quad
a^2-a-2=(a-2)(a+1)=0.
$$

Thus $a=2$ or $a=-1$.

For $a=2$, substituting $r=0$ in $g_2$ gives $(0,1,2)$, which also lies
on $k$ at $u=1$.
For $a=-1$, substituting $r=0$ in $g_{-1}$ gives $(0,-2,2)$, which lies
on $k$ at $u=-2$.
Both intersection points have therefore been checked on both relevant lines.
There are no further family members intersecting $k$, as the necessary
quadratic condition has no further solutions.
The two family members meet $k$ at **different** points.
