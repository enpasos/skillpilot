#!/usr/bin/env python3
"""Replace only an inaccurate generated s(t) stroke by an exact quadratic.

Usage: python3 correct_quadratic_curve.py --base base.png --recipe recipe.json --output result.png --report report.json
The supplied 1600x900 base is retained unchanged. No generation, API, or network call occurs.
"""
import argparse
import hashlib
import json
from pathlib import Path

from PIL import Image, ImageDraw, ImageChops, ImageFilter


def sha(p):
    return hashlib.sha256(Path(p).read_bytes()).hexdigest()


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--base', required=True)
    parser.add_argument('--recipe', required=True)
    parser.add_argument('--output', required=True)
    parser.add_argument('--report', required=True)
    args = parser.parse_args()
    recipe = json.loads(Path(args.recipe).read_text())
    source = Image.open(args.base).convert('RGB')
    assert list(source.size) == recipe['dimensions'], source.size
    assert sha(args.base) == recipe['baseSha256'], 'Base bytes differ from reviewed input'
    result = source.copy()
    pixels = source.load()
    output = result.load()
    left, top, right, bottom = recipe['oldCurveSearchBox']
    removed_pixels = 0
    mask = Image.new('L', source.size, 0)
    mask_pixels = mask.load()
    # Orange-only detection excludes black axes and the paper's warm beige.
    for x in range(left, right + 1):
        for y in range(top, bottom + 1):
            r, g, b = pixels[x, y]
            if r > 100 and r - g > 14 and r - b > 35:
                mask_pixels[x, y] = 255
    # Include the old antialias fringe. Preserve dark neutral axis pixels.
    mask = mask.filter(ImageFilter.MaxFilter(recipe['removalDilationSize']))
    mask_pixels = mask.load()
    for x in range(left - 2, right + 3):
        for y in range(top - 2, bottom + 3):
            original = pixels[x, y]
            if not mask_pixels[x, y] or (max(original) - min(original) < 40 and min(original) < 180):
                continue
            # Interpolate nearest clean paper above/below the removed stroke.
            candidates = []
            for direction in (-1, 1):
                for distance in range(1, 40):
                    yy = y + direction * distance
                    sample = pixels[x, yy]
                    if not mask_pixels[x, yy] and min(sample) > 185:
                        candidates.append((yy, sample))
                        break
            assert len(candidates) == 2, (x, y, candidates)
            (above_y, above), (below_y, below) = candidates
            ratio = (y - above_y) / (below_y - above_y)
            output[x, y] = tuple(
                round(upper * (1 - ratio) + lower * ratio)
                for upper, lower in zip(above, below)
            )
            removed_pixels += 1
    x0, y0 = recipe['origin']
    xe, ye = recipe['endpoint']
    scale = recipe['supersampling']
    # A separate tight local overlay leaves all unrelated base pixels bit-identical.
    region = recipe['overlayBox']
    ox, oy, rx, by = region
    overlay = Image.new('RGBA', ((rx - ox) * scale, (by - oy) * scale), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    points = []
    center_offset = (scale - 1) / 2
    for i in range(recipe['segments'] + 1):
        u = i / recipe['segments']
        points.append(((x0 + (xe - x0) * u - ox) * scale + center_offset,
                       (y0 - (y0 - ye) * u * u - oy) * scale + center_offset))
    # Two concentric orange strokes retain the generated illustration's soft ink edge.
    for color, width in [(recipe['outerColor'], recipe['outerWidth']),
                         (recipe['innerColor'], recipe['innerWidth'])]:
        draw.line(points, fill=tuple(color), width=round(width * scale), joint='curve')
        radius = width * scale / 2
        for x, y in (points[0], points[-1]):
            draw.ellipse((x - radius, y - radius, x + radius, y + radius), fill=tuple(color))
    overlay = overlay.resize((rx - ox, by - oy), Image.Resampling.LANCZOS)
    result.paste(Image.alpha_composite(result.crop(tuple(region)).convert('RGBA'), overlay).convert('RGB'), (ox, oy))
    result.save(args.output)
    difference = ImageChops.difference(source, result)
    changed_bounds = difference.getbbox()
    assert changed_bounds is not None
    left, top, right, bottom = changed_bounds
    assert ox <= left < right <= rx and oy <= top < bottom <= by
    changed_pixels = sum(
        pixel != (0, 0, 0) for pixel in difference.crop(changed_bounds).get_flattened_data()
    )
    report = {
        'baseSha256': sha(args.base),
        'recipeSha256': sha(args.recipe),
        'scriptSha256': sha(__file__),
        'outputSha256': sha(args.output),
        'removedOrangePixels': removed_pixels,
        'changedPixels': changed_pixels,
        'changedBoundingBox': changed_bounds,
    }
    Path(args.report).write_text(json.dumps(report, indent=2) + '\n')


if __name__ == '__main__':
    main()
