# Reference solution: parallel projection

**1.** The line through $X$ is $\vec y=\vec x+t\vec d$, $t\in\mathbb R$.
Substitution into $E$ gives
$$
x_1+t+2(x_2+t)-(x_3+t)=0,
\qquad t=-\frac{x_1+2x_2-x_3}{2}.
$$
The coefficient of $t$ is $2$, so every $\vec x$ has exactly one solution.
With $\vec n=\begin{pmatrix}1\\2\\-1\end{pmatrix}$,
$\vec n\cdot\vec d=2$, so the direction does not lie in $E$.
Thus
$$
P\vec x=\vec x-\frac{x_1+2x_2-x_3}{2}\begin{pmatrix}1\\1\\1\end{pmatrix},
\qquad P=\begin{pmatrix}
\frac12&-1&\frac12\\
-\frac12&0&\frac12\\
-\frac12&-1&\frac32
\end{pmatrix}.
$$
The columns are the ordered standard-basis images. Deriving them individually
is an equally valid method.

**2.** For $\vec x=\begin{pmatrix}4\\1\\2\end{pmatrix}$, $t=-2$, hence
$$
P\vec x=\begin{pmatrix}2\\-1\\0\end{pmatrix}.
$$
We have $2+2(-1)-0=0$ and
$\overrightarrow{XX'}=\begin{pmatrix}-2\\-2\\-2\end{pmatrix}=-2\vec d$.
Both conditions hold.

**3.** For $\vec x\in E$, $x_1+2x_2-x_3=0$, so $P\vec x=\vec x$.
Every image lies in $E$, since the general image satisfies
$\vec n\cdot(P\vec x)=\vec n\cdot\vec x-(\vec n\cdot\vec x)(\vec n\cdot\vec d)/2=0$.
Projecting again therefore changes nothing: $P(P\vec x)=P\vec x$ for all
$\vec x$, hence $P^2=P$. Direct matrix multiplication is equally valid.

If $P\vec x=\vec0$, then
$\vec x=\frac{x_1+2x_2-x_3}{2}\vec d$, so $\vec x$ is a multiple of
$\vec d$. Conversely, $P\vec d=\vec0$. Thus
$$
\ker P=\left\{\lambda\begin{pmatrix}1\\1\\1\end{pmatrix}:\lambda\in\mathbb R\right\}.
$$
This is the origin line in the projection direction. All images lie in
$E$ and every plane vector is its own image, so $\operatorname{im}P=E$:
every target-plane point actually occurs as an image.
Here the projection is oblique rather than orthogonal because $\vec d$
is not parallel to $\vec n$; this extra observation is not required for credit.

**4.** On $\vec y=\vec x+t\vec v$, the plane condition becomes
$\vec n\cdot\vec x+t(\vec n\cdot\vec v)=0$. Hence
$$
t=-\frac{\vec n\cdot\vec x}{\vec n\cdot\vec v},\qquad
\vec y=\left(I-\frac{\vec v\vec n^{\mathsf T}}{\vec n\cdot\vec v}\right)\vec x.
$$
The matrix is $P_F=I-\frac{\vec v\vec n^{\mathsf T}}{\vec n\cdot\vec v}$.
When $\vec n\cdot\vec v=0$, the value
$\vec n\cdot\vec y=\vec n\cdot\vec x$ stays constant on the line.
If $X$ is outside $F$, there is no intersection; if $X$ is in $F$, the
whole line is in $F$, with infinitely many intersections. Therefore the
intersection does not define a unique map on the whole space. An undefined
division alone would not yet explain the geometry.
