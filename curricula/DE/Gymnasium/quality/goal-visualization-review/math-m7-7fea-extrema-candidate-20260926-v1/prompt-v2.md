# Kandidat v2: tatsächlicher Bereinigungsprompt

Built-in `image_gen.imagegen` was called once with `candidate-v1.png` as its sole edit target (input SHA-256 `d03ecb5ec4443474c3abacced18fc3b793b1c976c5c29d0a616f5497bc97494e`). The tool did not expose an exact model version or seed. No other image was sent with this edit.

```text
Use case: precise-object-edit
Asset type: existing German mathematics educational PNG.
Input image: Image 1 is the exact edit target.
Primary request: Remove ONLY the broad grey, blurred erased-object smudge in the EMPTY LOWER HALF OF THE MIDDLE CARD, below the equation "f′_a(x)=0 ⇒ x=a". Replace that smudged region with the same clean, pale blue-white background as the rest of the middle card, matching its gentle existing light gradient. The middle card should be visually empty and clean below the equation.
Pixel-content invariants: Keep all three rounded card borders, heading, card headers, every letter and mathematical glyph, x/y axes, the two blue parabolas, their vertices on the x-axis, the orange "a wächst" arrow, and orange check mark in exactly their current places. Do not alter any existing formula, subscript, prime, relation sign, line, color, size, alignment, or layout. Do not add any object or text.
Exact formulas that must remain unchanged: "f_a(x)=(x−a)²"; "f′_a(x)=2(x−a)"; "f′_a(x)=0 ⇒ x=a"; "f″_a(x)=2>0"; "Tiefpunkt: T_a=(a|0)".
Constraints: One localized background cleanup only. Preserve the opaque full-frame pale-blue canvas and current dimensions/aspect ratio. No crop, watermark, extra icon, blur, grey shadow, or ghost object.
```

Output: `candidate-v2.png`, SHA-256 `b6febfc994fc347e2ed2c71543b5bca797a2059c7980f92d259eda367cd63920`, 1672 × 941 RGB PNG.
