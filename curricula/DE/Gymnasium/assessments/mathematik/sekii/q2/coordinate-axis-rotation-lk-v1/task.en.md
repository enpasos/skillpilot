# Coordinate-axis rotation: advanced-course assessment candidate

Status: machine-reviewed content; no human approval or human trial. See the independent review and integration receipt in the corresponding QA package.

## Task

A point on a rigid component has coordinates $P(2,-1,3)$ in a fixed right-handed Cartesian coordinate system. The unit is arbitrary but identical on all axes. In each experiment the component is rotated about a coordinate axis through the origin; the coordinate system remains fixed. Position vectors are column vectors and the transformation acts by multiplication from the left.

Positive angles follow the right-hand rule: the thumb points along the positive axis and the curled fingers indicate the positive direction of rotation. Viewed from the positive end of the axis towards the origin, this is counterclockwise. $\vec e_1,\vec e_2,\vec e_3$ denote the standard basis.

1. The component is rotated by $+90^\circ$ about the $z$-axis. Determine the images of all three basis vectors and derive the transformation matrix $A$. Explain how the basis images enter the matrix. (6 points)
2. Calculate the image $P_z$ of $P$ under $A$. Also justify, for an arbitrary point $X(x,y,z)$, that the entire $z$-axis is fixed pointwise and that distance from the origin is preserved. (5 points)
3. In a second, independent experiment, the component is rotated from its original position by $-90^\circ$ about the $x$-axis. Determine and justify the transformation matrix $B$, and calculate the image $P_x$ of the original point $P$. These two rotations are not performed in sequence. (5 points)
4. Someone instead proposes
   $$
   C=\begin{pmatrix}0&1&0\\-1&0&0\\0&0&1\end{pmatrix}
   $$
   for the first experiment and argues: “The $z$-axis is fixed and distances from the origin are preserved; therefore $C$ is the required rotation by $+90^\circ$.” Evaluate this argument. Test the claimed direction using a point or vector of your choice outside the $z$-axis, identify the actual rotation, and explain the limitation of the two stated checks. (4 points)

Suggested time: about 25 minutes. No aids required. Total: 20 points.

## Reference solution and scoring

1. $A\vec e_1=\vec e_2$, $A\vec e_2=-\vec e_1$, and $A\vec e_3=\vec e_3$. The images of the standard basis are the columns of the matrix, so
   $$
   A=\begin{pmatrix}0&-1&0\\1&0&0\\0&0&1\end{pmatrix}.
   $$
   Scoring: 1 point for each correct basis image (3 points), 2 for the correct matrix, and 1 for explaining the column convention.
2. $A(2,-1,3)^{\mathsf T}=(1,2,3)^{\mathsf T}$, hence $P_z(1,2,3)$. In general, $A(x,y,z)^{\mathsf T}=(-y,x,z)^{\mathsf T}$. Every vector $(0,0,z)^{\mathsf T}$ is unchanged, and
   $$
   \|A\vec x\|^2=(-y)^2+x^2+z^2=x^2+y^2+z^2=\|\vec x\|^2.
   $$
   Since norms are nonnegative, distance from the origin is preserved.
   Scoring: 1 point for the multiplication setup, 1 for the image point, 1 for a pointwise fixed axis for arbitrary $z$, 1 for the general squared-norm comparison, and 1 for the distance-preservation conclusion.
3. The negative quarter-turn about $x$ fixes $\vec e_1$, sends $\vec e_2$ to $-\vec e_3$, and sends $\vec e_3$ to $\vec e_2$. Therefore
   $$
   B=\begin{pmatrix}1&0&0\\0&0&1\\0&-1&0\end{pmatrix},
   \qquad B(2,-1,3)^{\mathsf T}=(2,3,1)^{\mathsf T},
   $$
   giving $P_x(2,3,1)$.
   Scoring: 1 point per correct matrix column (3 points), 1 for a geometric justification of the direction/basis images, and 1 for the image point.
4. For example, $C\vec e_1=-\vec e_2$, whereas the required positive quarter-turn sends $\vec e_1$ to $\vec e_2$. The claim is false: $C$ represents rotation by $-90^\circ$ about the $z$-axis (equivalently $+270^\circ$). It does preserve the $z$-axis and the norm, since $C(x,y,z)^{\mathsf T}=(y,-x,z)^{\mathsf T}$. These properties do not determine the signed angle; in particular both opposite quarter-turns satisfy them.
   Scoring: 1 point for a valid test outside the axis, 1 for justified rejection, 1 for the actual angle and axis, and 1 for explaining why the criteria are insufficient.

Give equal credit for mathematically equivalent representations and alternative correct justifications; the basis images explicitly requested in part 1 remain mandatory. Do not penalize a propagated error repeatedly: later methodologically correct work with an earlier incorrect matrix may earn method points, while correct final values require the correct rotation. This solution is non-exclusive. Total: 20 points; proposed pass threshold: 10 points.

