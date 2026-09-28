# Tatsächlicher Provider-Prompt: Versuch 2

Provider/Werkzeug: eingebautes OpenAI/Codex-Bildwerkzeug. Eine genaue Modellvariante wurde nicht offengelegt. Eingabe: 944dd479-attempt-1.png als Bearbeitungsziel. Der folgende Text wurde als Prompt unverändert an das Werkzeug übergeben; technische Ziel-IDs standen nur in den lokalen Dateinamen, nicht im Prompt.

```text
Use case: precise-object-edit
Asset type: German Gymnasium mathematics goal PNG, viewed as a 360-pixel-wide card.
Input image 1 is the exact edit target and candidate. Preserve its overall friendly comic style, landscape canvas, title, all four mathematically correct formula cards, axis directions and labels, three colored arrows from O, arrow coordinate labels, colors, and white spacing.
Change the transparent yellow parallelepiped geometry ONLY so that it is a precise translated parallelepiped spanned by the three existing arrows. The red a arrow is the full O-to-A bottom edge, green b arrow the full O-to-B bottom edge, and blue c arrow the full O-to-C vertical edge. Make exactly eight coherent vertices O,A,B,A+B,C,A+C,B+C,A+B+C. Every edge parallel to red a has the same direction and length; every edge parallel to green b has the same direction and length; every edge parallel to blue c is VERTICAL and has the same direction and length. In particular, top vertices C,A+C,B+C,A+B+C are each the SAME vertical upward translation of their corresponding base vertex by vector c; top face is an exact translated copy of base face. Do not let the yellow body cross or warp the vector arrows. Keep hidden edges thin dashed.
For small-card legibility, remove the tiny optional purple explanatory box beneath the formulas, leaving clean white space; all essential mathematics remains in the four big cards.
No new text, equations, arrows, decoration, logo, watermark, technical ID, or photorealism. Output a complete new PNG raster image.
```
