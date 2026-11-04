# Reference solution: coordinate views

**1.** The images are $Q_{12}(2|-1|0)$, $Q_{13}(2|0|3)$ and
$Q_{23}(0|-1|3)$. Generally,
$$
\begin{pmatrix}x_1\\x_2\\x_3\end{pmatrix}
\longmapsto\begin{pmatrix}x_1\\x_2\\0\end{pmatrix},\quad
\begin{pmatrix}x_1\\0\\x_3\end{pmatrix},\quad
\begin{pmatrix}0\\x_2\\x_3\end{pmatrix},
$$
for the three planes in that order. The perpendicular coordinate direction
is set to zero; the two coordinates within the plane are retained.
Different heights can therefore have the same top view.

**2.** Projecting every line point gives
$$
g_{12}:\vec x=\begin{pmatrix}1\\2\\0\end{pmatrix}
+t\begin{pmatrix}2\\-1\\0\end{pmatrix},\quad t\in\mathbb R.
$$
The image direction is nonzero, so this image is a line. At $t=1$ it
gives $R(3|1|0)$, so $R$ belongs to the image. All points on $h$ have
first coordinates $2$ and $1$, so all map to $H(2|1|0)$. The image set is
the single point $\{H\}$, not a line with a zero direction vector.
The line $h$ is perpendicular to the target plane, along the viewing direction.

**3.** The top view gives $A_{12}(1|1|0)$, $B_{12}(5|1|0)$ and
$C_{12}(1|4|0)$. The whole filled sail maps to the filled triangle
$A_{12}B_{12}C_{12}$. This also follows by applying projection componentwise
to $\vec a+s(\vec b-\vec a)+t(\vec c-\vec a)$ with $s,t\ge0$,
$s+t\le1$. Its perpendicular image sides have lengths $4$ and $3$,
so its area is $\frac12\cdot4\cdot3=6\,\mathrm m^2$.

The side view gives $A_{23}=B_{23}=(0|1|2)$ and $C_{23}=(0|4|5)$.
The **entire image set** is the segment
$$
\vec x=\begin{pmatrix}0\\1\\2\end{pmatrix}
+\lambda\begin{pmatrix}0\\3\\3\end{pmatrix},\quad 0\le\lambda\le1.
$$
Its area is $0\,\mathrm m^2$. Edge $AB$ lies in the $x_1$ viewing direction
and disappears, so the whole sail collapses to a segment in this view.
The sketches show the right triangle with the stated $x_1,x_2$ coordinates
and the segment from $(1|2)$ to $(4|5)$ in the $x_2x_3$ view, with both
$A_{23},B_{23}$ at the first endpoint.
The claim is false: the original triangle has two independent edges and
positive area, yet one view has area zero. Projection generally does not
preserve spatial area; calculating the original area is not required here.

![Reference sketches: filled image triangle in the top view and collapsed image segment in the side view.](/assets/assessment-materials/mathematik/5748633c-113f-5ea8-9041-24da55919de7/coordinate-views-solution-v1.png)

**4.** The light ray is on
$$
\vec x=\begin{pmatrix}2\\1\\4\end{pmatrix}
+t\begin{pmatrix}1\\0\\-2\end{pmatrix},\quad t\ge0.
$$
The ground condition is $4-2t=0$, so $t=2\ge0$. The shadow point is
$S_L(4|1|0)$, whereas the orthogonal top view is $S_{12}(2|1|0)$.
The light rays are oblique to the ground: as $x_3$ decreases, $x_1$ also
changes. Perpendicular viewing would keep $x_1,x_2$ unchanged, so the
actual light direction must be used.
