# From pyramid volume to cone volume

A right circular cone has base radius $r=4\,\mathrm{cm}$ and perpendicular
height $h=9\,\mathrm{cm}$. Its apex $S$ is directly above the base-circle
centre $M$. You may use the pyramid formula $V=\frac13Gh$.
A total of **20 points** is available.

**1. Describe suitable pyramids (6 points)**

In the base plane, consider regular polygons with $4,8,16,32,\ldots$ sides.
In one sequence all vertices lie on the circle; in a second sequence the
sides are tangent to the circle from outside. Join each polygonal base
to **the same apex $S$**.

Describe which pyramids lie inside the cone and which surround it.
Explain what changes and what stays fixed when the side count doubles.
Justify why these solids are suitable approximations to this cone.
A sketch may support your explanation.

**2. Compare the volumes (4 points)**

Base areas are supplied; no trigonometric derivation is required.
All entries are in $\mathrm{cm}^2$ and rounded where necessary.

| Side count $n$ | inner base area $G_n^-$ | outer base area $G_n^+$ |
|---:|---:|---:|
| 4 | 32.000 | 64.000 |
| 8 | 45.255 | 53.019 |
| 16 | 48.983 | 50.922 |
| 32 | 49.943 | 50.428 |

Calculate both pyramid volumes for every row using the supplied values.
Explain the resulting lower and upper bounds on the cone volume and
how the enclosure improves.

**3. Explain the limiting case (6 points)**

Explain intuitively which area the inner and outer polygonal bases
approach under continued refinement. Use the pyramid volumes to make
$V_K=\frac13\pi r^2h$ plausible for the cone. Explicitly address the fixed
height and the factor $\frac13$. An analytic limit proof is not required;
merely repeating the cone formula does not supply the justification.

**4. Apply and distinguish (4 points)**

Calculate the cone volume exactly and to two decimal places in
$\mathrm{cm}^3$. Evaluate with reasons: “With more and more sides we
eventually obtain a cylinder, so the factor $\frac13$ disappears.”
