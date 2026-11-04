# Investigate an oblique parallel projection

In a spatial model, projection onto the plane through the origin
$E:x_1+2x_2-x_3=0$ is along the direction
$$
\vec{d}=\begin{pmatrix}1\\1\\1\end{pmatrix}.
$$
Each point $X$ is mapped to the intersection of its projection line with
$E$. These are full lines, not light rays restricted to one direction.
Show your setups and justify your results. Total: **20 points**.

**1. Determine the matrix from the geometry (6 points)**

For an arbitrary position vector
$\vec{x}=\begin{pmatrix}x_1\\x_2\\x_3\end{pmatrix}$, set up the
projection line. Find its intersection parameter with $E$, then its image
vector. State the mapping matrix $P$ in the standard basis. Justify why
every starting point has exactly one intersection.

**2. Check an image point (3 points)**

Calculate the image of $X(4|1|2)$. Check both that the image belongs to
$E$ and that the displacement follows the prescribed projection direction.

**3. Analyze the matrix as a projection (6 points)**

Show that every point in $E$ stays fixed and that $P^2=P$.
Also determine all vectors mapped to $\vec{0}$ and the entire image space.
Interpret both sets geometrically.

**4. Transfer to any plane through the origin (5 points)**

Let $F:\vec{n}\cdot\vec{x}=0$, with $\vec{n}\ne\vec{0}$, be any
plane through the origin. Projection is to be along a direction
$\vec{v}\ne\vec{0}$. Derive a matrix formula from the line intersection
when $\vec{n}\cdot\vec{v}\ne0$. Here $I$ is the identity matrix and
$\vec{n}^{\mathsf T}$ is the row vector associated with $\vec n$.
A memorised formula alone is insufficient.

Explain also why $\vec{n}\cdot\vec{v}=0$ does not give a uniquely defined
projection on the whole space by this construction. Distinguish starting
points in $F$ from those outside $F$.
