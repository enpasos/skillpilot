# Reference solution: the cone as a limiting case

**1.** All pyramids share the same apex, base plane and perpendicular
height of $9\,\mathrm{cm}$. The inner polygons lie inside the circular
disc and the outer polygons contain it. Every segment joining $S$ to an
inner-base point therefore also lies inside the cone; similarly, the
cone lies inside each outer pyramid. Increasing the side count refines
the base and lateral faces. Height stays fixed and the solids retain a
common apex. Thus they approach the cone without introducing another
height or a second circular end face.

**2.** With $h=9$, each volume is $V_n^-=3G_n^-$ or $V_n^+=3G_n^+$.
Using the explicitly rounded table entries:

| $n$ | $V_n^-$ in $\mathrm{cm}^3$ | $V_n^+$ in $\mathrm{cm}^3$ |
|---:|---:|---:|
| 4 | 96.000 | 192.000 |
| 8 | 135.765 | 159.057 |
| 16 | 146.949 | 152.766 |
| 32 | 149.829 | 151.284 |

Geometrically, $V_n^-\leq V_K\leq V_n^+$. The displayed numbers are
rounded approximations to those bounds, not exact bounds to their last
decimal place. The gap shrinks substantially, for example from 96 to
approximately $1.455\,\mathrm{cm}^3$.

**3.** As the side count doubles, the inner polygons fill the disc more
closely and the projecting outer corners become smaller. Both base areas
approach the circle area $\pi r^2$. Since the height and one-third factor
stay fixed for every pyramid, both volume sequences approach the same value:

$$
V_n^-=\frac13G_n^-h\ \longrightarrow\ \frac13\pi r^2h,
\qquad
V_n^+=\frac13G_n^+h\ \longrightarrow\ \frac13\pi r^2h.
$$

The enclosed cone plausibly has this volume. The established pyramid
formula is applied to progressively finer bases; the one-third factor
need not be derived again. A concise equivalent argument using suitable
pyramids is equally acceptable. A finite numerical table alone does not
prove convergence: the essential justification is the geometric process
of increasingly close approximation to the circle.

**4.**

$$
V_K=\frac13\pi\cdot4^2\cdot9
=48\pi\,\mathrm{cm}^3\approx150.80\,\mathrm{cm}^3.
$$

The claim is false. The fixed apex remains, producing a cone rather than
a cylinder with a second parallel circular face. Each pyramid occupies
one third of the corresponding prism with the same base and height;
refining the base does not change that factor. The comparison cylinder
would have volume $144\pi\,\mathrm{cm}^3$.
