# Q2.5 advanced-course assessment: scaling area and volume

## Task

A rectangular prism has vertex $O(0,0,0)$ and three mutually perpendicular edge endpoints adjacent to $O$: $A(3,0,0)$, $B(0,6,0)$, and $C(0,0,9)$. Its base is the rectangle in the $xy$-plane spanned by $OA$ and $OB$. All lengths are measured in centimetres. The prism is dilated about the origin by a positive factor $k$. In the concrete case, $k=\frac{2}{3}$.

1. Determine the images $A'$, $B'$, and $C'$ for the concrete factor. Use them to explain what happens to the three edge lengths. (1 point)
2. Explain from the scaling of two edges why the area of the base is multiplied by $k^2$ for **any $k>0$**. Calculate the original and new base areas for $k=\frac{2}{3}$. (5 points)
3. Similarly, explain from all three edge lengths why the volume is multiplied by $k^3$ for **any $k>0$**. Calculate the original and new volumes for $k=\frac{2}{3}$. (5 points)
4. A classmate says, “Since $k=\frac{2}{3}$, both the base area and the volume shrink to two thirds of their original values.” Evaluate the claim using the correct fractions and explain the difference. (1 point)

Suggested time: about 15 minutes. No aids required. Total: 12 points.

## Solution and scoring

1. Dilation about the origin is $S_k(x,y,z)=(kx,ky,kz)$. For $k=\frac{2}{3}$, $A'(2,0,0)$, $B'(0,4,0)$, and $C'(0,0,6)$; the edge lengths change from $3$, $6$, $9$ to $2$, $4$, $6$ cm. Award 1 point for the three image points together with interpreting the new edge lengths. An equivalent derivation without writing the transformation rule explicitly is acceptable.
2. The original base area is $A_B=3\cdot6=18\,\mathrm{cm}^2$. Both base edges receive the same factor $k$, so $A'_B=(3k)(6k)=18k^2\,\mathrm{cm}^2$. Thus $A'_B/A_B=k^2$ for every $k>0$. When $k=\frac{2}{3}$, $A'_B=2\cdot4=8\,\mathrm{cm}^2$, so $A'_B/A_B=\frac{4}{9}$. Award 4 points for the general derivation from both scaled base edges to the ratio $k^2$: at most 1 point for a merely correct start with scaled edges; award at least 2 points only when the area factor $k^2$ is actually justified from their product; use further points for a complete argument valid for any $k>0$. Award 1 point for both concrete areas.
3. The original volume is $V=3\cdot6\cdot9=162\,\mathrm{cm}^3$. The three scaled edges give $V'=(3k)(6k)(9k)=162k^3\,\mathrm{cm}^3$, hence $V'/V=k^3$ for every $k>0$. At $k=\frac{2}{3}$, $V'=2\cdot4\cdot6=48\,\mathrm{cm}^3$ and $V'/V=\frac{8}{27}$. Award 4 points for the general derivation from the three scaled edges to the ratio $k^3$: at most 1 point for a merely correct start with scaled edges; award at least 2 points only when the volume factor $k^3$ is actually justified from their product; use further points for a complete argument valid for any $k>0$. Award 1 point for both concrete volumes.
4. The claim is false: the base area is $\frac{4}{9}$ and the volume $\frac{8}{27}$ of the respective original value, not $\frac{2}{3}$ in each case. A length factor occurs twice in a rectangular area and three times in a prism volume. Award 1 point for the correct verdict, both fractions, and the dimension-based explanation together. Fractions correctly stated in parts 2 and 3 can be carried over here; the verdict and explanation are still required.

Accept mathematically equivalent methods and explanations. Do not penalize one propagated error in an image point again when the scaling-law argument is mathematically sound. Justifying $k^2$ and $k^3$ are separate scoring criteria; merely substituting into memorised formulas does not earn those explanation points. Total: 12 points; pass threshold: 10 points. If either general derivation receives fewer than 2 of 4 points, at most 9 points can be earned overall; a pass thus requires both scaling laws to be justified from the edges.
