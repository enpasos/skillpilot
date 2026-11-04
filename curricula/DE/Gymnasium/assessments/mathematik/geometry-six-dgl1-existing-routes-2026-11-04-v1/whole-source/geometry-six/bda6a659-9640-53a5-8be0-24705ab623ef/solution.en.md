# Worked solution: angle between planes

**1.** For $E$, use $\vec n=(1,2,2)^{\mathsf T}$.
For $F$, require $\vec m\cdot(1,1,0)^{\mathsf T}=0$ and
$\vec m\cdot(2,0,1)^{\mathsf T}=0$, giving $m_1+m_2=0$ and
$2m_1+m_3=0$. Set $m_1=1$ to obtain $\vec m=(1,-1,-2)^{\mathsf T}$.
Both dot products vanish and the vector is nonzero. The independent
spanning directions determine the plane, so this is a normal to $F$.
Any nonzero scalar multiple is equally suitable.

**2.** We have $\vec n\cdot\vec m=-5$, $\|\vec n\|=3$ and
$\|\vec m\|=\sqrt6$. The nonobtuse plane angle satisfies
$$
\cos\varphi=\frac{|\vec n\cdot\vec m|}{\|\vec n\|\|\vec m\|}
=\frac5{3\sqrt6},\qquad
\varphi=\arccos\!\left(\frac5{3\sqrt6}\right)\approx47.1^\circ.
$$
Without the absolute value, these normals give the obtuse angle
$132.9^\circ$. The unoriented normal directions and planes use the
smaller supplementary angle, $180^\circ-132.9^\circ\approx47.1^\circ$.

**3.** The normals are nonparallel, so $E$ and $F$ meet in a line.
A cross-section perpendicular to that line shows two intersecting
trace lines from $E$ and $F$. Both normal directions are parallel to
this cross-section, each perpendicular to its own trace line.
Rotating both trace directions through $90^\circ$ preserves their
smaller angle. Thus the smaller angle between normal directions equals
the plane angle. A precise suitable sketch can express this argument.

**4.** For $\vec m'=-2\vec m$,
$$
\frac{|\vec n\cdot\vec m'|}{\|\vec n\|\|\vec m'\|}
=\frac{2|\vec n\cdot\vec m|}{2\|\vec n\|\|\vec m\|}
=\frac5{3\sqrt6}.
$$
Thus changing a normal’s orientation or length does not change the
plane angle. $G$ has a normal parallel to that of $E$, but division by
$2$ gives $x+2y+2z=5$, rather than $3$. The planes are distinct and
parallel, not identical, and their directional angle is $0^\circ$.
This angle alone does not imply identical point sets; here there is
no common intersection line.


## One overall assessment

There is one total score out of **20 points** and one binary overall
result: **pass at 15 points or more**, otherwise not passed.
Part scores have no separate pass thresholds and create no partial
mastery or mastery of prerequisite goals.

Credit traceable mathematical work wherever it occurs. Equivalent
methods and representations receive equal credit; count the same
performance once. Award partial credit as specified, otherwise 0.5
points for meaningful but incomplete work. Do not repeatedly penalise
one local arithmetic or copying error; credit correct traceable
follow-through. Concise correct explanations count, with no prescribed
keywords or order.

| Criterion | Points |
|---|---:|
| Suitable E normal (1); both F orthogonality equations (2); a correct nonzero solution (1); both checks (1 each). | 6 |
| Dot product (1); both norms (1 together); suitable orientation-independent cosine setup (2); exact expression (1); degree value or correct nonobtuse supplementary angle (1). | 6 |
| Describes a perpendicular cross-section and both plane traces (2); locates normals perpendicular to their traces in that section (1); justifies equality of smaller angles by a common 90° rotation or equivalent reasoning (1). | 4 |
| Algebraically justifies invariance under negative scaling (2); proportional normals for G and angle 0° (1); explains different constants and hence distinct parallel planes rather than identity (1). | 4 |

Cap the ordinary total at 14 if the whole submission contains no sound calculation of the nonobtuse angle using suitable plane normals, or no geometric interpretation at all of that angle as the angle between planes. Concise correct cross-section/perpendicular reasoning counts; no particular sketch or wording is prescribed. A local arithmetic slip in an otherwise sound angle calculation does not trigger the cap.

Multiple cap reasons give the same upper limit of 14 points. There is one overall pass without additional part-pass conditions.
