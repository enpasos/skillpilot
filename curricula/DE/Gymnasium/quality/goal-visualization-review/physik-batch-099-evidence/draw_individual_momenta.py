"""Render the signed momenta of two carts using the reviewed quantitative cart artwork."""
import argparse
import hashlib
import importlib.util
import json
import sys
from pathlib import Path

sys.dont_write_bytecode = True
previous = Path(__file__).resolve().parent.parent / 'physik-batch-098-evidence/draw_cart_vector_diagrams.py'
spec = importlib.util.spec_from_file_location('cart_diagram', previous)
art = importlib.util.module_from_spec(spec)
spec.loader.exec_module(art)

def render(directory):
    directory.mkdir(parents=True, exist_ok=True)
    c = art.Canvas()
    c.text((800, 66), 'Einzelimpulse und Gesamtimpuls', 69, True)
    c.text((800, 150), 'p = m · v      Ein Zeitpunkt · rechts positiv', 52)
    carts = [
        ('A', 2, 3, 6, 410, (155, 363, 435, 527), (350, 415)),
        ('B', 8, -1, -8, 1190, (1195, 363, 1475, 527), (1290, 415)),
    ]
    def signed(value):
        return f'{value:+}'.replace('-', '−')

    for name, mass, velocity, momentum, cx, box, anchor in carts:
        assert mass * velocity == momentum
        c.text((cx, 235), f'Wagen {name} · v = {signed(velocity)} m/s', 52, True)
        c.text((cx, 311), f'p = {signed(momentum)} kg·m/s', 60, True, art.MOMENTUM)
        art.cart(c, box, f'{mass} kg')
        tip = (anchor[0] + 60 * momentum, anchor[1])
        assert box[0] < anchor[0] < box[2] and box[1] < anchor[1] < box[3]
        assert carts[0][5][2] < tip[0] < carts[1][5][0]
        art.quantity_arrow(c, anchor, tip, art.MOMENTUM)

    c.line([(80, 585), (710, 586), (1520, 585)], '#C0CDBD', 5)
    scale = art.scale_bar(c, '2 kg·m/s')
    assert scale['tickCenterDistancePx'] == 2 * 60
    c.text((800, 784), 'Gesamtimpuls beider Wagen', 52, True)
    c.text((800, 851), '(+6 − 8) kg·m/s = −2 kg·m/s', 58, True)
    image = c.image.resize(art.SIZE, art.Image.Resampling.LANCZOS)
    jpeg = directory / 'individual-momenta.jpg'
    image.save(jpeg, 'JPEG', quality=96, subsampling=0, optimize=False, progressive=False)
    raster = art.Image.open(jpeg).convert('RGB')
    raster.resize((360, 203), art.Image.Resampling.LANCZOS).save(directory / 'individual-momenta.360.png')
    rows = []
    for name, mass, velocity, value, _, box, start in carts:
        tip = (start[0] + 60 * value, start[1])
        measured = art.raster_measure(raster, start, tip, art.MOMENTUM)
        assert abs(measured['dotToApexLengthPx'] - 60 * abs(value)) <= 2
        rows.append(dict(cart=name, massKg=mass, signedVelocityMPerS=velocity,
                         signedMomentumKgMPerS=value, bodyBox=box, start=start, tip=tip, raster=measured))
    report = dict(carts=rows, scale=scale, totalMomentumKgMPerS=sum(x[3] for x in carts),
                  jpegSha256=hashlib.sha256(jpeg.read_bytes()).hexdigest())
    (directory / 'geometry.json').write_text(json.dumps(report, indent=2) + '\n')

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('output', type=Path)
    render(parser.parse_args().output)
