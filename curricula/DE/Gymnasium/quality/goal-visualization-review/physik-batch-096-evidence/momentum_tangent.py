# SPDX-License-Identifier: Apache-2.0
"""Render the marked tangent of p(t) = 4 - t²/2 in SI units."""
from pathlib import Path
import sys
from PIL import Image, ImageDraw, ImageFont

canvas = Image.new("RGB", (1600, 900), "#fff9eb")
pen = ImageDraw.Draw(canvas)
ink, curve, tangent = "#202d35", "#116261", "#a63618"

def label(point, text, size, color=ink, anchor="mm", bold=False):
    family = "DejaVuSans-Bold.ttf" if bold else "DejaVuSans.ttf"
    font = ImageFont.truetype(family, size)
    pen.text(point, text, fill=color, font=font, anchor=anchor)

# The horizontal and vertical scales encode the printed units.
def pos(t, p):
    return (round(146 + 246 * t), round(648 - 92 * p))

def segment(points, color, width):
    pen.line([pos(t, p) for t, p in points], fill=color, width=width, joint="curve")

for p in (2, 4):
    segment([(0, p), (3.3, p)], "#ded7c6", 3)
for t in (1, 2, 3):
    segment([(t, -1.1), (t, 5.3)], "#ded7c6", 3)
segment([(0, -1.1), (0, 5.5)], ink, 5)
segment([(0, 0), (3.38, 0)], ink, 5)
for t in (0, 1, 2, 3):
    x, y = pos(t, 0)
    pen.line((x, y, x, y+12), fill=ink, width=4)
    label((x if t else x-23, y+19), str(t), 44, anchor="mt")
for p in (2, 4):
    x, y = pos(0, p)
    pen.line((x-10, y, x, y), fill=ink, width=4)
    label((x-18, y), str(p), 44, anchor="rm")

label((85, 73), "p (kg·m/s)", 55, anchor="lm", bold=True)
label((823, 717), "t (s)", 49, bold=True)
# Two points on the tangent give a signed slope independently of the curve.
segment([(1, 4), (3, 4), (3, 0)], "#906b40", 5)
for i in range(55):
    t0 = 0.50 + i * 0.052
    if t0 < 3.34:
        segment([(t0, 6-2*t0), (t0+0.034, 6-2*(t0+0.034))], tangent, 7)
segment([(i/200, 4-(i/200)**2/2) for i in range(641)], curve, 10)
x, y = pos(2, 2)
pen.ellipse((x-14,y-14,x+14,y+14), fill=ink, outline="#fff9eb", width=3)
for t, p in ((1,4), (3,0)):
    x,y=pos(t,p)
    pen.rectangle((x-7,y-7,x+7,y+7), fill=tangent)
pen.rounded_rectangle((1000, 126, 1557, 689), radius=31, fill="#f2eada")
label((1278, 215), "Impuls", 62, curve, bold=True)
label((1278, 323), "Tangente", 62, tangent, bold=True)
label((1278, 426), "bei t = 2 s", 55)
label((1278, 539), "−4 kg·m/s", 60, bold=True)
pen.line((1100, 594, 1456, 594), fill=ink, width=5)
label((1278, 647), "2 s", 56, bold=True)
label((800, 820), "Momentane Kraft bei 2 s: −2 N", 70, bold=True)
canvas.save(Path(sys.argv[1]), quality=95, subsampling=0)
