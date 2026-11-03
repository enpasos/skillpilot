**A · Central dilation**

Each standard basis vector maps to twice itself. The columns are therefore $2\vec e_1,2\vec e_2,2\vec e_3$, giving
$$Z=\begin{pmatrix}2&0&0\\0&2&0\\0&0&2\end{pmatrix}.$$
Equivalently, the geometric requirement gives $(x,y,z)\mapsto(2x,2y,2z)$ directly. Thus
$$Z\vec p=\begin{pmatrix}4\\2\\6\end{pmatrix}.$$
The origin is fixed because $Z\vec0=\vec0$. For every nonzero position vector, $Z\vec v=2\vec v$: the positive factor preserves the ray from the origin. Also $\lVert Z\vec v\rVert=2\lVert\vec v\rVert$. For $P$, the distance changes from $\sqrt{14}$ to $2\sqrt{14}$. The general distance statement suffices; these two square-root values are not additionally required.

**B · Parallel projections**

Points on the line have coordinates $(x+t,y,z+t)$. The $xy$-plane requires $z+t=0$, hence $t=-z$. Therefore
$$Q\vec v=\begin{pmatrix}x-z\\y\\0\end{pmatrix},\qquad Q=\begin{pmatrix}1&0&-1\\0&1&0\\0&0&0\end{pmatrix}.$$
Its columns are the images $(1,0,0)^{\mathsf T}$, $(0,1,0)^{\mathsf T}$ and $(-1,0,0)^{\mathsf T}$ of the three standard basis vectors. For $P$, this gives $Q\vec p=(-1,1,0)^{\mathsf T}$.

Every point $(x,y,0)$ is fixed because its last coordinate is already zero. We have $\vec p+\vec r=(3,1,4)^{\mathsf T}$ and $Q(\vec p+\vec r)=(-1,1,0)^{\mathsf T}=Q\vec p$. In general, changing a vector by $s\vec r$ does not change its image, since $(x+s)-(z+s)=x-z$. Information about position along this direction is lost. As the first image lies in the fixed target plane, a second projection has no effect: $Q(Q\vec v)=Q\vec v$. An appropriate general calculation, or $Q^2=Q$ together with its interpretation, is equally acceptable.

Orthogonal projection onto the $xz$-plane sets the $y$-coordinate to zero; orthogonal projection onto the $yz$-plane sets the $x$-coordinate to zero. Thus
$$Q_{xz}=\begin{pmatrix}1&0&0\\0&0&0\\0&0&1\end{pmatrix},\quad Q_{xz}\vec p=\begin{pmatrix}2\\0\\3\end{pmatrix},$$
$$Q_{yz}=\begin{pmatrix}0&0&0\\0&1&0\\0&0&1\end{pmatrix},\quad Q_{yz}\vec p=\begin{pmatrix}0\\1\\3\end{pmatrix}.$$

**C · Directional stretch**

Linearity and the geometric requirements give
$$M\vec e_1=\frac{3\vec d+\vec n}{2}=\begin{pmatrix}2\\1\\0\end{pmatrix},\quad M\vec e_2=\frac{3\vec d-\vec n}{2}=\begin{pmatrix}1\\2\\0\end{pmatrix},\quad M\vec e_3=\begin{pmatrix}0\\0\\1\end{pmatrix}.$$
These three image columns give
$$M=\begin{pmatrix}2&1&0\\1&2&0\\0&0&1\end{pmatrix}.$$
The tests yield $M\vec d=(3,3,0)^{\mathsf T}=3\vec d$, $M\vec n=(1,-1,0)^{\mathsf T}=\vec n$ and $M\vec e_3=(0,0,1)^{\mathsf T}=\vec e_3$.

By linearity, every vector parallel to $\vec d$ satisfies $M(t\vec d)=3t\vec d$. A vector is perpendicular to $\vec d$ exactly when its first two coordinates are opposites, so it has form $(a,-a,b)^{\mathsf T}$. Direct substitution gives
$$M\begin{pmatrix}a\\-a\\b\end{pmatrix}=\begin{pmatrix}a\\-a\\b\end{pmatrix}.$$
Equivalently, $\vec n$ and $\vec e_3$ span all perpendicular directions, and both are fixed. This covers the full required directional components, not just isolated test points. No eigenvalue argument is needed.

For the given point,
$$M\vec p=\begin{pmatrix}2\cdot2+1\\2+2\cdot1\\3\end{pmatrix}=\begin{pmatrix}5\\4\\3\end{pmatrix}.$$
This is not a central dilation with factor $3$: for example, $\vec n$ remains unchanged, whereas $3I$ would triple this nonzero vector. The vector $\vec e_3$ is an equally valid counterexample.

**Grading:** This reference is not exclusive. Accept correct equivalent representations, methods and traceable follow-through. Grade only reliably legible submitted work; do not assume work that has not been shown.

**One ordinary total-score cap:** First add the partial credit below to obtain one raw score out of 30. Before comparing it with the threshold of 22, cap the total at 21 if any of the following core actions is entirely absent or supported only by a conceptually unsuitable model:

- In any of A, B or C, there is no mathematically sound derivation of the relevant matrix from the geometric requirements. Merely writing down a matrix with no visible connection to those requirements does not replace the requested derivation. Examples of conceptually unsuitable models are an orthogonal $xy$-projection in B despite the oblique direction, or $3I$ in C despite the perpendicular directions having to remain fixed.
- In A or B, there is no genuine application to an image point: neither a correct image nor a traceable matrix-vector setup with mathematically sound follow-through is present.
- In A, there is no sound explanation of the directional and distance effects of the central dilation; simply noting that the origin is fixed is insufficient. In B, there is no sound, justified investigation of the projection, for example its fixed target plane, the information lost along the projection direction, or repeated projection. The cap also applies if both short variants onto the other coordinate planes are entirely missing or handled only through conceptually incorrect models.
- In C, there is no actual calculated test of the constructed matrix against the geometric requirements, or no sound explanation of why its action covers the required parallel and perpendicular directions. A single image-point calculation replaces neither a direction test nor the justification.

Judge evidence across the entire submission, not its location or a particular keyword. Relevant work elsewhere counts, but the same content does not earn points twice. A concise correct calculation or explanation suffices. The cap does not require flawless arithmetic: an isolated arithmetic, sign or copying error within a suitable model and traceable method does not trigger it. Deduct for the same local error only once; assess subsequent correctly executed operations and logically consistent explanations by their respective criteria, without treating the original incorrect result as correct. A missing individual detail is graded by the rubric and triggers the cap only if a core action listed above is absent as a whole. There is one total score and one threshold, with no part-pass fields or second qualification.

a-basis · 2 points: Derives the three basis images from the central dilation, or equivalently justifies the general coordinate action: complete 2, meaningful partial work 1.

a-matrix · 1 points: Correctly assembles Z=diag(2,2,2).

a-point · 2 points: Traceable matrix-vector application to p 1; correct image (4,2,6) 1. Credit sound follow-through separately.

a-origin · 1 points: Justifies that the origin is fixed.

a-direction-distance · 2 points: Justifies preservation of the ray because the factor is positive 1; justifies doubling the distance from the origin 1. One concise general explanation can cover both.

b-line-plane · 2 points: Line and plane condition z+t=0 with t=-z 1; derives image formula (x-z,y,0) 1. Accept an equivalent geometric derivation.

b-columns-matrix · 2 points: Basis images or correct coefficient matching to the image formula 1; correct Q with rows (1,0,-1),(0,1,0),(0,0,0) 1.

b-point · 1 points: Correct image (-1,1,0); a sound setup with a local arithmetic error can earn 0.5 points.

b-fixed-plane · 1 points: Justifies that all points in the xy-plane are fixed using z=0.

b-lost-direction · 1 points: Justifies the equal images of p and p+r by calculation or geometry, recognising loss of distinguishability along this direction.

b-repeat · 1 points: Justifies that applying the projection again does not change the image, using the fixed target plane or a suitable calculation.

b-xz · 1 points: Orthogonal xz matrix diag(1,0,1) 0.5; image of P (2,0,3) 0.5.

b-yz · 1 points: Orthogonal yz matrix diag(0,1,1) 0.5; image of P (0,1,3) 0.5.

c-column-one · 1 points: Derives first basis column (2,1,0) from e1=(d+n)/2, or an equivalent method.

c-column-two · 1 points: Derives second basis column (1,2,0) from e2=(d-n)/2, or an equivalent method.

c-column-three · 1 points: Derives third basis column (0,0,1) from its unchanged perpendicular direction.

c-matrix · 1 points: Correctly assembles the derived columns into M with rows (2,1,0),(1,2,0),(0,0,1).

c-test-d · 1 points: Calculates Md=(3,3,0)=3d and relates it to the requirement as an actual test.

c-test-n · 1 points: Calculates Mn=(1,-1,0)=n and relates it to the requirement as an actual test.

c-test-e3 · 1 points: Calculates Me3=(0,0,1)=e3 and relates it to the requirement as an actual test.

c-all-directions · 2 points: Explains the action on all t*d by linearity or calculation 1; justifies that the full perpendicular plane is fixed using (a,-a,b) or the span of n,e3 1.

c-point · 2 points: Traceable matrix-vector application to p 1; correct result (5,4,3) 1.

c-not-central · 1 points: Uses a nonzero perpendicular vector to justify the difference from 3I.
