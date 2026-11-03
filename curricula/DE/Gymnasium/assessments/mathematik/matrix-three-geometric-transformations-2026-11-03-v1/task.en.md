Work in three-dimensional coordinate space using column vectors and the standard basis $\vec e_1,\vec e_2,\vec e_3$. A point is mapped by applying the matrix to its position vector. In all three parts, use $P=(2,1,3)$ with position vector $\vec p$. Construct the matrices yourself from the geometric requirements and show your method. Mathematically correct equivalent methods are accepted.

**A · Central dilation about the origin (8 points)**

A central dilation has centre $O=(0,0,0)$ and scale factor $2$.

A1. Derive its matrix $Z$ from the images of the standard basis vectors or from a general coordinate formula. (3 points)

A2. Use your matrix to calculate the image of $P$. (2 points)

A3. Investigate and explain what happens to the origin, the direction of a ray from the origin, and a point's distance from the origin. (3 points)

**B · Parallel projections onto coordinate planes (10 points)**

A parallel projection onto the $xy$-plane is taken along direction $\vec r=(1,0,1)^{\mathsf T}$. The image of an arbitrary point with position vector $\vec v=(x,y,z)^{\mathsf T}$ lies both on the line $\vec v+t\vec r$ and in the $xy$-plane.

B1. Use these conditions to find the coordinates of the image of $\vec v$, and derive its matrix $Q$. (4 points)

B2. Calculate the image of $P$. (1 point)

B3. Explain which points in the target plane remain fixed, why $\vec p$ and $\vec p+\vec r$ have the same image, and what a second application of $Q$ does to the first image. (3 points)

B4. For each of two short variants, find the matrix and the image of $P$: orthogonal projection onto the $xz$-plane, and orthogonal projection onto the $yz$-plane. In each case the projection direction is perpendicular to the target plane. (2 points)

**C · Construct a directional stretch (12 points)**

Construct a linear transformation that stretches every vector parallel to $\vec d=(1,1,0)^{\mathsf T}$ by factor $3$. Every vector perpendicular to $\vec d$ must remain unchanged. The vectors $\vec n=(1,-1,0)^{\mathsf T}$ and $\vec e_3=(0,0,1)^{\mathsf T}$ are perpendicular to $\vec d$.

C1. Construct a suitable matrix $M$ and justify its columns in the standard basis. You may use the hints $\vec e_1=(\vec d+\vec n)/2$ and $\vec e_2=(\vec d-\vec n)/2$. (4 points)

C2. Test your matrix against the requirements by calculating $M\vec d$, $M\vec n$ and $M\vec e_3$. (3 points)

C3. Explain why your matrix satisfies the requirements for every direction parallel or perpendicular to $\vec d$. A short calculation using $(a,-a,b)^{\mathsf T}$, or a suitable decomposition into directions, suffices. (2 points)

C4. Calculate $M\vec p$ and use a suitable vector to explain why this is not a central dilation with scale factor $3$. (3 points)

Eigenvalues, matrix inversion and determinants are not required.
