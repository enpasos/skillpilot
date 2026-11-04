# Worked solution: special line positions

**1.** $g$ consists of all $(t,0,0)$ and is the $x$-axis itself.
Its only common point with the $y$-axis and the $z$-axis is the origin.
It is contained in both $xy$ and $xz$ because $z=0$ and $y=0$ hold
throughout. For $yz$, $x=t=0$ gives exactly the origin. These conclusions
use the point sets, not just parallel directions.

**2.** Points on $h$ have $(x,y,z)=(r,2,0)$.

- It is distinct and parallel to the $x$-axis: the directions agree,
  but $y=2$ rather than $0$, so there is no common point.
- The $y$-axis requires $x=z=0$. At $r=0$ the unique common point is
  $Y=(0,2,0)$. Their directions differ, so they intersect there.
- The $z$-axis requires $x=y=0$. Since $y=2$, no intersection is possible.
  Directions $(1,0,0)^{\mathsf T}$ and $(0,0,1)^{\mathsf T}$ are not
  parallel. The lines are therefore skew, rather than parallel.
- $h$ is contained in $xy$ because $z=0$ for every $r$.
- It is strictly parallel to $xz$: its direction has zero $y$ component,
  while every point has $y=2\ne0$.
- For $yz$, $x=0$ gives $r=0$ and exactly the intersection point $Y$.

**3.** On $k$, $z=2$ is constant, so the line is strictly parallel to
the $xy$-plane, rather than contained in it. For the $z$-axis we require
both $x=1+s=0$ and $y=1+s=0$. Both give $s=-1$, producing $Z=(0,0,2)$.
The directions are not parallel, so this is a unique line intersection.
Both parts of the claim are false. $d_3=0$ only means that height stays
constant along a line; the position vector determines that height.
Such a line can certainly intersect a vertical axis.

**4.** The plane condition on $l$ is $p_3+ud_3=0$.

- If $d_3=0$ and $p_3=0$, every $u$ solves it: the line is in the plane.
- If $d_3=0$ and $p_3\ne0$, there is no solution: it is strictly parallel.
- If $d_3\ne0$, exactly $u=-p_3/d_3$ solves it: there is one intersection.

Thus for $d_3=0$, the position vector must also be checked.


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
| Justifies g as the entire x-axis (1); y/z intersections both at O (1 together); containment in xy and xz justified (1 together); unique yz intersection at O (1). | 4 |
| Distinct parallel position to x-axis using direction and disjointness (1); unique y-axis intersection and point (2: conditions/parameter 1, point/interpretation 1); skewness relative to z-axis from disjointness AND nonparallel directions (2, 1 each). | 5 |
| Contained in xy since z=0 for all r (1); strictly parallel to xz since y=2 throughout (1); meets yz at r=0 and Y (1). | 3 |
| Justifies constant z=2 and strict parallelism to xy (2); both axis conditions and s=-1 (1); point Z (1); explains both false inferences using position and direction appropriately (1). | 5 |
| Plane condition p3+u d3=0 and all three cases (2: 0.5 per case, 0.5 for the common setup); explains the position vector’s additional role (1). | 3 |

Cap the ordinary total at 14 if the whole submission contains either no algebraically justified axis-position investigation or no algebraically justified coordinate-plane investigation. Also apply the cap if every positional claim is inferred solely from direction components without checking any relevant point or position-vector condition. One mistaken case does not trigger the cap; concise valid coordinate reasoning counts.

Multiple cap reasons give the same upper limit of 14 points. There is one overall pass without additional part-pass conditions.
