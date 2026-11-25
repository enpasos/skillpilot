#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Two new, deterministic cart vector diagrams; never reads or edits an earlier image.

Narrow AGENTS §7.3 precision exception: the approved image-generation attempts
twice failed the quantitative vector-length requirement. Quantity arrows are
fixed at exactly 360 and 120 px from body anchor to apex; the separate, non-arrow
unit scale is 120 px. Position space is explicitly schematic.
"""
import argparse
import hashlib
import json
from pathlib import Path
import PIL
from PIL import Image, ImageDraw, ImageFont

SIZE = (1600, 900)
S = 3
REGULAR = Path('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf')
BOLD = Path('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf')
CREAM = '#FBF8F0'
INK = '#254D49'
OUTLINE = '#345D57'
TEAL = '#88C8BD'
TEAL_LIGHT = '#A7DBCE'
CORAL = '#B74E3F'
MOMENTUM = '#126E78'
DOT = '#1C3436'
IDS = {'imp': '53afbda1-5776-502b-8867-471975d7b766',
       'mean': 'ecbaa101-cb10-5da3-9368-ae40ff587d74'}
ANCHORS = [(240, 407), (1285, 407)]
TIPS = [(600, 407), (1165, 407)]
BODIES = [(155, 356, 435, 520), (1200, 356, 1480, 520)]

def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def font(size, bold=False):
    return ImageFont.truetype(str(BOLD if bold else REGULAR), round(size*S))

class Canvas:
    def __init__(self):
        self.image = Image.new('RGB', (SIZE[0]*S, SIZE[1]*S), CREAM)
        self.draw = ImageDraw.Draw(self.image)

    def xy(self, values):
        return tuple(round(v*S) for v in values)

    def line(self, points, fill=OUTLINE, width=4):
        self.draw.line([self.xy(p) for p in points], fill=fill, width=round(width*S), joint='curve')

    def roundbox(self, box, radius=20, fill=TEAL, outline=OUTLINE, width=4):
        self.draw.rounded_rectangle(self.xy(box), radius=round(radius*S), fill=fill,
                                    outline=outline, width=round(width*S))

    def ellipse(self, box, fill, outline=None, width=1):
        self.draw.ellipse(self.xy(box), fill=fill, outline=outline, width=round(width*S))

    def text(self, position, value, size=48, bold=False, color=INK, anchor='mm'):
        self.draw.text(self.xy(position), value, fill=color, font=font(size, bold), anchor=anchor)

    def fit_text(self, position, value, max_width, size=64, bold=True, color=INK):
        while self.draw.textlength(value, font=font(size, bold)) > max_width*S:
            size -= 1
        self.text(position, value, size, bold, color)
        return size

def cart(c, box, badge):
    left, top, right, bottom = box
    # Rounded toy-cart body, two quiet material tones and a slightly uneven top seam.
    c.roundbox((left-11, top+91, left+8, top+126), 5, '#A2ADA3', OUTLINE, 4)
    c.roundbox((right-8, top+91, right+11, top+126), 5, '#A2ADA3', OUTLINE, 4)
    c.roundbox(box, 24, TEAL, OUTLINE, 5)
    c.roundbox((left+9, top+9, right-9, top+64), 16, TEAL_LIGHT, None, 0)
    c.line([(left+13, top+65), (left+98, top+62), (right-14, top+65)], '#69AFA4', 3)
    c.line([(left+18, bottom-14), (right-17, bottom-12)], '#5AA194', 4)
    for x in (left+62, right-62):
        c.ellipse((x-37, bottom-18, x+37, bottom+56), '#6D8278', OUTLINE, 5)
        c.ellipse((x-25, bottom-6, x+25, bottom+44), '#BFC9B9', OUTLINE, 3)
        c.ellipse((x-10, bottom+9, x+10, bottom+29), '#EBECDD', OUTLINE, 2)
    badge_width = 164 if badge == '1 kg' else 218
    center = (left+right)/2
    c.roundbox((center-badge_width/2, top+88, center+badge_width/2, bottom-17),
               15, '#FCFAEE', OUTLINE, 3)
    c.text((center, top+116), badge, 47 if badge == '1 kg' else 39, True)

def quantity_arrow(c, anchor, tip, color):
    x, y = anchor
    tx, ty = tip
    assert y == ty
    direction = 1 if tx > x else -1
    head = 47
    c.line([anchor, (tx-direction*(head-2), y)], color, 14)
    c.draw.polygon([c.xy(tip), c.xy((tx-direction*head, y-23)),
                    c.xy((tx-direction*head, y+23))], fill=color)
    c.ellipse((x-12, y-12, x+12, y+12), DOT)

def scale_bar(c, unit):
    label = 'Eigener Pfeilmaßstab:'
    size = 46
    label_width = c.draw.textlength(label, font=font(size))/S
    unit_width = c.draw.textlength(unit, font=font(size))/S
    gap, length, y = 30, 120, 650
    start = (SIZE[0]-(label_width+gap+length+gap+unit_width))/2
    c.text((start, y), label, size, False, anchor='lm')
    bar_start = start+label_width+gap
    bar_end = bar_start+length
    c.line([(bar_start, y), (bar_end, y)], INK, 6)
    c.line([(bar_start, y-11), (bar_start, y+11)], INK, 5)
    c.line([(bar_end, y-11), (bar_end, y+11)], INK, 5)
    c.text((bar_end+gap, y), unit, size, False, anchor='lm')
    c.text((800, 714), 'Orte schematisch', 46)
    return {'quantity': unit, 'start': [bar_start, y], 'end': [bar_end, y],
            'tickCenterDistancePx': length, 'arrowheads': False}

def raster_measure(image, anchor, tip, color):
    # Measure the visible JPEG dot and apex independently of the source coordinates.
    ar = tuple(int(color.lstrip('#')[i:i+2],16) for i in (0,2,4))
    pixels = image.load()
    ax, ay = anchor
    dots = [(x,y) for y in range(ay-15,ay+16) for x in range(ax-15,ax+16)
            if pixels[x,y][0] < 65 and pixels[x,y][1] < 78 and pixels[x,y][2] < 80]
    center = [sum(p[i] for p in dots)/len(dots) for i in (0,1)]
    direction = 1 if tip[0] > ax else -1
    candidates = [(x,y) for y in range(ay-2,ay+3)
                  for x in range(min(ax,tip[0])-8,max(ax,tip[0])+9)
                  if sum((pixels[x,y][i]-ar[i])**2 for i in range(3)) < 65**2]
    apex_x = (max if direction>0 else min)(p[0] for p in candidates)
    return {'dotCentroidPx': center, 'visibleApexX': apex_x,
            'dotToApexLengthPx': abs(apex_x-center[0]), 'sourceApexPx': list(tip)}

def render(kind, directory):
    c = Canvas()
    momentum = kind == 'mean'
    color = MOMENTUM if momentum else CORAL
    title = 'Impuls · rechts positiv' if momentum else 'Geschwindigkeit · rechts positiv'
    title_size = c.fit_text((800, 72), title, 1490, 68)
    c.text((800, 153), 'Ein Wagen, zwei Zeitpunkte' if momentum else 'Beide Wagen: gleicher Zeitpunkt', 46)
    if momentum:
        # Time panels are diagram frames, not walls or position boundaries.
        for box in [(80,197,755,600),(845,197,1520,600)]:
            c.roundbox(box, 30, '#F3F8F0', '#CBDCD0', 3)
    for i,box in enumerate(BODIES):
        c.text((407 if i==0 else 1235, 235), ('t = 1 s' if i==0 else 't = 3 s') if momentum
               else ('Wagen A' if i==0 else 'Wagen B'), 48, True)
        value = ('p = +3 kg·m/s' if i==0 else 'p = −1 kg·m/s') if momentum else ('v = +3 m/s' if i==0 else 'v = −1 m/s')
        c.fit_text((407 if i==0 else 1235, 303), value, 660, 59, True, color)
        cart(c, box, 'Wagen A' if momentum else '1 kg')
    if momentum:
        c.line([(100,579),(735,580)], '#C0CDBD', 5)
        c.line([(865,579),(1500,580)], '#C0CDBD', 5)
    else:
        c.line([(80,579),(700,580),(1520,579)], '#C0CDBD', 5)
    for anchor,tip in zip(ANCHORS,TIPS):
        quantity_arrow(c,anchor,tip,color)
    scale = scale_bar(c, '1 kg·m/s' if momentum else '1 m/s')
    result = 'Mittlere Kraft: −2 N' if momentum else 'Gesamtimpuls beider Wagen: +2 kg·m/s'
    result_size = c.fit_text((800,807),result,1480,70 if momentum else 57)
    if momentum:
        c.text((800,866), 'Δp = −4 kg·m/s   ·   Δt = 2 s', 43)
    image = c.image.resize(SIZE,Image.Resampling.LANCZOS)
    target = directory/(IDS[kind]+'.jpg')
    image.save(target,'JPEG',quality=96,subsampling=0,optimize=False,progressive=False)
    thumbnail = directory/(kind+'.360.png')
    image.resize((360,203),Image.Resampling.LANCZOS).save(thumbnail)
    measured = [raster_measure(Image.open(target).convert('RGB'),a,t,color) for a,t in zip(ANCHORS,TIPS)]
    source_lengths = [abs(t[0]-a[0]) for a,t in zip(ANCHORS,TIPS)]
    ratio = measured[0]['dotToApexLengthPx']/measured[1]['dotToApexLengthPx']
    assert source_lengths == [360,120]
    assert abs(ratio-3)<0.05,ratio
    for anchor,tip,body in zip(ANCHORS,TIPS,BODIES):
        assert body[0]+12 < anchor[0] < body[2]-12 and body[1]+12 < anchor[1] < body[3]-12
        assert not(body[0] <= tip[0] <= body[2])
        assert 80 < tip[0] < SIZE[0]-80
    return {'goalId':IDS[kind],'image':target.name,'sha256':sha(target),'size':list(SIZE),
            'thumbnail360':thumbnail.name,'thumbnailSha256':sha(thumbnail),'vectorQuantity':'momentum' if momentum else 'velocity',
            'anchorsPx':[list(a) for a in ANCHORS],'apicesPx':[list(t) for t in TIPS],
            'sourceDotToApexLengthsPx':source_lengths,'sourceRatio':3,'nonArrowUnitScale':scale,
            'cartBodyBoundsPx':[list(b) for b in BODIES],
            'ownBodyFreeTipClearancePx':[TIPS[0][0]-BODIES[0][2],BODIES[1][0]-TIPS[1][0]],
            'rasterJPEGMeasurements':measured,'rasterJPEGLengthRatio':ratio,
            'titleFontPx':title_size,'quantityLabelFontPx':59,'resultFontPx':result_size,
            'caption':'Orte schematisch','systemResultDrawnAsVector':False,
            'physicalValues':{'massesKg':[1,1],'velocitiesMPerS':[3,-1],'totalMomentumKgMPerS':2} if not momentum else {'timesS':[1,3],'momentaKgMPerS':[3,-1],'meanResultantForceN':-2}}

def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output-dir',type=Path,default=Path(__file__).resolve().parent/'rendered')
    args=parser.parse_args();args.output_dir.mkdir(parents=True,exist_ok=False)
    rows=[render(kind,args.output_dir) for kind in ('imp','mean')]
    report={'schemaVersion':1,'status':'draft-for-independent-image-review','newDrawingsOnly':True,
            'method':'Pillow source geometry at 3x, deterministic fonts, Lanczos reduction, JPEG 4:4:4 quality96. No earlier image is loaded or edited.',
            'precisionException':'AGENTS §7.3; owner-authorized narrow precise diagrams after two unsuccessful built-in scale attempts. Root owns source-bound approval/import/alt metadata.',
            'sourceScriptSha256':sha(Path(__file__)),'pillowVersion':PIL.__version__,
            'fonts':[{'file':p.name,'sha256':sha(p)} for p in (REGULAR,BOLD)],'images':rows}
    (args.output_dir/'geometry.actual.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps(report,ensure_ascii=False,indent=2))

if __name__=='__main__':main()
