# Expected solution: triangle images

These are mathematical reference values, not a claim that a software
construction or human review has been performed.

| Figure | Image of A | Image of B | Image of C | AB, AC, BC in LU |
|---|---|---|---|---|
| Original | (1,1) | (5,1) | (1,4) | 4; 3; 5 |
| Rotation about A | (1,1) | (1,5) | (−2,1) | 4; 3; 5 |
| Dilation factor 2 | (2,2) | (10,2) | (2,8) | 8; 6; 10 |
| Dilation factor 1/2 | (0.5,0.5) | (2.5,0.5) | (0.5,2) | 2; 1.5; 2.5 |

In all four figures, the corresponding interior angles are approximately
\(90^\circ\), \(36.9^\circ\), and \(53.1^\circ\), in A-, B-, and C-image order.
The non-right angles are measured with the software; deriving them
trigonometrically is outside the task.

A suitable construction first creates the three points and polygon. A
rotation tool with centre A, angle 90°, and the correct direction produces
the congruent image. Dilating the original about O with factors 2 and 1/2
produces the two scale images. Equivalently, image points may be determined
independently and created in the software: rotation maps vector AB=(4,0)
to (0,4) and AC=(0,3) to (−3,0); dilation multiplies the position coordinates
by its factor. Labels and point correspondences remain identifiable.

Rotation preserves every distance and angle, so the rotated image is
congruent. A dilation with positive factor k preserves angles and ratios of
corresponding side lengths while multiplying every length by k. This
justifies similarity. For k=2 and k=1/2, the nonzero side lengths change,
so neither image is congruent to the original.

AB and AC are perpendicular. The transformations preserve their included
angle, so it stays 90°. Measurements show that the specific construction
agrees with these properties. Finitely many measurements or rounded values
do not prove the general distance- and angle-preserving properties of the
types of transformation.

The submission must show actual figures created in the software and suitable
measurements made by the learner. Correct coordinates in a written list
alone are insufficient. Different colours, overlapping figures, or another
arrangement of views are accepted if correspondence stays legible.
Alternative rounding and mathematically equivalent explanations receive
equal credit.
