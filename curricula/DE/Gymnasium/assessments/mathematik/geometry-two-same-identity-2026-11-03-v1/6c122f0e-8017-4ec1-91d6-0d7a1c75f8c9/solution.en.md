# Expected solution: rainwater tank

1. The model consists of a right circular cylinder of radius r=2 m and
   height $h_Z=3\,\mathrm m$, and a right circular cone of the same radius
   and height $h_K=1.5\,\mathrm m$. The vertical wall above an unchanged
   circular cross-section supports the cylinder model; straight roof lines
   to a central apex support the cone model. The axial section has a rectangle
   4 m wide and 3 m high below an isosceles triangle with base 4 m and height
   1.5 m. Overall height is 4.5 m. The internal parts meet without a gap or
   positive-volume overlap. Their common circle is not an additional
   internal wall.
2. Half of the roof section is a right triangle: radius and vertical cone
   height are its legs, and the roof line s is its hypotenuse. Hence
   $$
   s=\sqrt{r^2+h_K^2}=\sqrt{2^2+1.5^2}=2.50\,\mathrm m.
   $$
3. The required angle lies between the roof line and the horizontal radius.
   Thus
   $$
   \tan\alpha=\frac{h_K}{r}=\frac{1.5}{2}=0.75,\qquad
   \alpha\approx36.9^\circ.
   $$
   Sine or cosine in the same right triangle is equally acceptable.
   The angle to the vertical axis is the complementary angle, not the
   required quantity.
4. The external boundary comprises the cylinder's curved surface, the cone's
   curved surface, and the bottom base:
   $$
   O=2\pi rh_Z+\pi rs+\pi r^2
    =12\pi+5\pi+4\pi=21\pi
    \approx65.97\,\mathrm{m}^2.
   $$
   The common circle lies inside the union of the solids. It is not another
   external face; adding it twice would be wrong. The complete external base
   counts towards O but is not coated under the stated purpose. Therefore
   $$
   A_{\text{coating}}=2\pi rh_Z+\pi rs
   =17\pi\approx53.41\,\mathrm{m}^2.
   $$
5. Add the two internal volumes:
   $$
   V=\pi r^2h_Z+\frac13\pi r^2h_K
    =12\pi+2\pi=14\pi
    \approx43.98\,\mathrm{m}^3.
   $$
   The factor one third applies only to the cone; its vertical height 1.5 m,
   not its slant length 2.5 m, enters that formula. Using unrounded values:
   $$
   V=14\pi\cdot1000\,\mathrm L
     \approx43,982\,\mathrm L.
   $$
   Even the theoretical model cannot hold 45,000 litres. The shortfall is
   approximately $45,000-14,000\pi\approx1,018$ litres.
   Converting an already rounded 43.98 m³ would give 43,980 litres; premature
   rounding explains that small discrepancy.
6. Operational headspace below the apex reduces usable capacity.
   Pipes or other fittings can also occupy part of the internal space.
   Another concrete limitation with a correct explanation of its effect
   receives equal credit. Because the internal dimensions are given, a wall
   added outside cannot simply be subtracted from the calculated internal
   volume.

Accept suitable decompositions, other valid trigonometric approaches,
and transparent equivalent calculations. Formulas for unrelated solids or
adding internal joining faces do not produce a suitable overall model.
No sphere calculation, general sine/cosine rule, or fresh derivation of
the cone-volume formula is required: those broader prerequisites are not
additionally assessed here.
