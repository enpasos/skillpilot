"""Replace the position curve alone on the normalized generated sheet; leave axes and other panels intact."""
from pathlib import Path
import sys
from PIL import Image, ImageDraw

source, output = map(Path, sys.argv[1:])
original = Image.open(source).convert("RGB")
canvas = original.copy()
origin = (65, 665)
end = (444, 309)
for x in range(65, 452):
    for y in range(298, 668):
        r, g, b = original.getpixel((x, y))
        if b > r + 8 and b > g + 5:
            # The old stroke directly adjoins the horizontal axis for the first few samples.
            sample = (x, y - 27) if y < 664 else (215 + x % 25, y)
            canvas.putpixel((x, y), original.getpixel(sample))

scale = 4
mask = Image.new("L", (460*scale, 680*scale))
pen = ImageDraw.Draw(mask)
points = []
for step in range(1201):
    t = step / 1200
    points.append((round(scale * (origin[0] + (end[0]-origin[0])*t)),
                   round(scale * (origin[1] + 0.75 + (end[1]-origin[1])*t*t))))
pen.line(points, fill=255, width=8*scale, joint="curve")
for x,y in [points[0],points[-1]]:
    radius = 4*scale
    pen.ellipse((x-radius, y-radius, x+radius, y+radius), fill=255)
canvas.paste((8,53,146), (0,0,460,680), mask.resize((460,680),Image.Resampling.LANCZOS))
canvas.save(output, quality=97, subsampling=0)
