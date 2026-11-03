# Worked solution: camera drone

**1. Model**

The time between the observations is $5-2=3$ seconds. The displacement is

$$
\overrightarrow{PQ}=\begin{pmatrix}11-5\\0-3\\5-8\end{pmatrix}
=\begin{pmatrix}6\\-3\\-3\end{pmatrix}\,\mathrm m.
$$

Thus

$$
\vec v=\frac{1}{3}\overrightarrow{PQ}
=\begin{pmatrix}2\\-1\\-1\end{pmatrix}\,\frac{\mathrm m}{\mathrm s}.
$$

The first observation occurs at $t=2$, so $\overrightarrow{OP}$ is not
the required initial vector. Instead,

$$
\vec x_0=\begin{pmatrix}5\\3\\8\end{pmatrix}
-2\begin{pmatrix}2\\-1\\-1\end{pmatrix}
=\begin{pmatrix}1\\5\\10\end{pmatrix}\,\mathrm m.
$$

Using numerical values in the stated units, the model is

$$
\vec x(t)=\begin{pmatrix}1\\5\\10\end{pmatrix}
+t\begin{pmatrix}2\\-1\\-1\end{pmatrix},\qquad0\leq t\leq8.
$$

Substitution gives $\vec x(2)=(5,3,8)^{\mathsf T}$ and
$\vec x(5)=(11,0,5)^{\mathsf T}$, exactly reproducing the observations.

**2. Position and displacement**

$$
\vec x(6)=\begin{pmatrix}13\\-1\\4\end{pmatrix}.
$$

The drone is at $(13,-1,4)$.
Also, $\vec x(1)=(3,4,9)^{\mathsf T}$ and
$\vec x(4)=(9,1,6)^{\mathsf T}$. Hence its displacement is

$$
\vec x(4)-\vec x(1)=\begin{pmatrix}6\\-3\\-3\end{pmatrix}\,\mathrm m.
$$

The direct calculation $(4-1)\vec v=3\vec v$ is equivalent.

**3. Meaning**

Each second, the first coordinate increases by $2\,\mathrm m$, while the
second and third coordinates each decrease by $1\,\mathrm m$. The signs
indicate the direction of motion along the respective coordinate axes.
All three changes occur simultaneously. The constant vector $\vec v$
is the displacement per unit time.
$\vec x_0$ points from the origin to the drone's position at $t=0$ and
has unit metres. The vector $\vec v$ describes change in position over
time and has unit metres per second; it is not the position vector of a
fixed point.

**4. Reachability**

For $R$, the first coordinate gives $1+2t=15$, so $t=7$, which is within
the model's interval. The other coordinates also agree: $5-7=-2$ and
$10-7=3$. Thus the drone reaches $R$ at $t=7\,\mathrm s$.
For $S$, the first and third coordinates again require $t=7$.
At that time the second coordinate is $-2$, not $-1$. No single time
satisfies all three coordinates, so the drone does not reach $S$.
