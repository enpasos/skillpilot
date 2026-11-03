# Worked solution: trace points

On $g$, the simultaneous coordinate equations are $x=2+r$, $y=-3+2r$,
and $z=6-2r$.

**1. Intersections and checks**

For the $xy$-plane, $6-2r=0$, so $r=3$. Thus $T_{xy}=(5,3,0)$.
Checking the line gives

$$
\begin{pmatrix}2\\-3\\6\end{pmatrix}
+3\begin{pmatrix}1\\2\\-2\end{pmatrix}
=\begin{pmatrix}5\\3\\0\end{pmatrix}.
$$

The third coordinate is zero, so the point also lies in the $xy$-plane.

For the $xz$-plane, $-3+2r=0$, so $r=\frac32$. Thus
$T_{xz}=(\frac72,0,3)$. The line check is

$$
\begin{pmatrix}2\\-3\\6\end{pmatrix}
+\frac32\begin{pmatrix}1\\2\\-2\end{pmatrix}
=\begin{pmatrix}\frac72\\0\\3\end{pmatrix}.
$$

The second coordinate is zero, satisfying the plane condition as well.

For the $yz$-plane, $2+r=0$, so $r=-2$. Thus $T_{yz}=(0,-7,10)$.
The line check is

$$
\begin{pmatrix}2\\-3\\6\end{pmatrix}
-2\begin{pmatrix}1\\2\\-2\end{pmatrix}
=\begin{pmatrix}0\\-7\\10\end{pmatrix}.
$$

The first coordinate is zero, so the plane condition also holds.
Here, each plane condition determines exactly one value of the line parameter.

**2. Geometric meaning**

A trace point lies both on the line and in the relevant coordinate plane.
It is where $g$ crosses that plane. Changing $r$ changes all three
coordinates together in this example. Replacing just one coordinate of
an arbitrary point on the line by zero gives a point in the plane, but
generally takes it off the line.
For example, $(2,-3,0)$ is in the $xy$-plane but not on $g$: its first
coordinate would require $r=0$, for which the line gives $z=6$.

**3. Special cases**

On $h$, the third coordinate is zero for every $s$. The plane condition
is $0=0$ and holds for every parameter. The entire line lies in the
$xy$-plane, so there are infinitely many common points and no single
unique trace point.

On $k$, the third coordinate is always $4$. The condition $z=0$ would
require $4=0$, which holds for no parameter. The line is parallel to
the $xy$-plane and lies outside it. There is no common point and hence
no trace point.
