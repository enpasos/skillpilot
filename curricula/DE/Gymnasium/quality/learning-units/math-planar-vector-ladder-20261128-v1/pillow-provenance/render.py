"""Render the exact planar displacements used in the four V1 figures."""
import math
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
out = Path(__file__).parent
dark, teal, plum, amber, grid = "#182D3A", "#006C66", "#79458F", "#A84415", "#DBE3DE"
paper="#FAF6E9"
font_dir=Path('/usr/share/fonts/truetype/dejavu')
def font(sz, bold=False):
    return ImageFont.truetype(str(font_dir / ('DejaVuSans-Bold.ttf' if bold else 'DejaVuSans.ttf')),sz)
def txt(x,y,s,sz=50,c=dark,bold=False,anchor='la'):
    draw.text((x,y),s,font=font(sz,bold),fill=c,anchor=anchor,stroke_width=0)
def line(p,q,c,w):
    draw.line((p,q),fill=c,width=w)
def arrow(p,q,c,width=13,head=29):
    dx,dy=q[0]-p[0],q[1]-p[1]
    mag=math.hypot(dx,dy); ux,uy=dx/mag,dy/mag
    back=(q[0]-ux*head,q[1]-uy*head)
    line(p,back,c,width)
    draw.polygon((q,(back[0]-uy*head*.47,back[1]+ux*head*.47),(back[0]+uy*head*.47,back[1]-ux*head*.47)),fill=c)
def dot(p,c=dark,r=9):
    x,y=p;draw.ellipse((x-r,y-r,x+r,y+r),fill=c)
def plot(x0,y0,scale,rx,ry,axes=False):
    def pp(x,y): return (x0+x*scale,y0-y*scale)
    for x in range(rx[0],rx[1]+1):line(pp(x,ry[0]),pp(x,ry[1]),grid,3)
    for y in range(ry[0],ry[1]+1):line(pp(rx[0],y),pp(rx[1],y),grid,3)
    if axes:
        arrow(pp(rx[0],0),pp(rx[1]+.2,0),dark,5,16)
        arrow(pp(0,ry[0]),pp(0,ry[1]+.24),dark,5,16)
    return pp
def new(title,left,right):
    global canvas,draw
    canvas=Image.new('RGB',(1600,900),paper);draw=ImageDraw.Draw(canvas)
    txt(60,37,title,70,bold=True)
    for x,w in [(48,732),(816,736)]:
        draw.rounded_rectangle((x,150,x+w,803),radius=30,fill="#FFFEF8",outline="#BCCDC6",width=4)
    txt(79,175,left,46,teal,True);txt(849,175,right,46,teal,True)
def save(n,footer):
    txt(64,825,footer,46,bold=False)
    canvas.save(out/f'{n}.png',optimize=True)
    canvas.resize((360,203),Image.Resampling.LANCZOS).save(out/f'{n}-360.png')
new('Verschiebungen verketten','Dieselbe Verschiebung','Start und Ziel verbinden')
p=plot(182,640,81,(-1,6),(0,4))
for a in [(0,0),(2,2)]:
    b=(a[0]+3,a[1]+1);arrow(p(*a),p(*b),teal);dot(p(*a),teal)
txt(88,706,'3 nach rechts, 1 nach oben',45)
p=plot(961,656,82,(-1,6),(0,4))
a,b,c=p(0,0),p(3,1),p(4,4)
arrow(a,b,teal);arrow(b,c,plum);arrow(a,c,amber,9);dot(a);dot(b);dot(c)
txt(892,663,'Start',42);txt(1315,289,'Ziel',42);txt(856,707,'Orange verbindet Start und Ziel.',42)
save(1,'Eine Kästchenseite entspricht einer Längeneinheit.')
new('Komponenten und Pfeile','Pfeile addieren','Mit −½ multiplizieren')
p=plot(193,626,80,(-1,6),(0,4));a,b,c=p(0,0),p(3,1),p(2,3)
arrow(a,b,teal);arrow(b,c,plum);arrow(a,c,amber);dot(a)
txt(83,690,'(3 | 1) + (−1 | 2) = (2 | 3)',45)
p=plot(1100,530,77,(-2,5),(-2,3),axes=True);a=p(0,0)
arrow(a,p(2,2),teal);arrow(a,p(-1,-1),plum);dot(a)
txt(855,692,'−½ · (2 | 2) = (−1 | −1)',46)
save(2,'Negativer Faktor: Gegenrichtung. Faktor 0: Nullvektor.')
new('Betrag einer Verschiebung','Senkrechte Komponenten','Gleiche Richtung')
p=plot(178,652,80,(-1,6),(0,4));a,b,c=p(0,0),p(3,0),p(3,4)
arrow(a,b,teal);arrow(b,c,plum);arrow(a,c,amber)
line(p(2.7,0),p(2.7,.3),dark,4);line(p(2.7,.3),p(3,.3),dark,4)
txt(273,659,'3',43);txt(440,454,'4',43);txt(222,441,'5',48,amber,True)
txt(83,712,'√(3² + 4²) = 5 < 3 + 4',51)
a,b,c=(879,451),(1211,451),(1433,451)
arrow(a,b,teal);arrow(b,c,plum);dot(a);dot(b);dot(c)
txt(1016,369,'3',48,teal,True);txt(1292,369,'2',48,plum,True)
arrow((879,561),(1433,561),amber);txt(1124,580,'5',48,amber,True)
txt(850,715,'Hier gilt  |u + v| = |u| + |v|.',43)
save(3,'Gleichheit gilt auch, wenn ein Vektor der Nullvektor ist.')
new('Komponenten und Richtungswinkel','Vom Pfeil zum Winkel','Vom Winkel zum Pfeil')
p=plot(451,654,72,(-4,3),(-1,5),axes=True);a,b=p(0,0),p(-3,4)
line(p(-3,0),p(-3,4),plum,5);line(p(-3,4),p(0,4),plum,5)
arrow(a,b,teal);dot(a)
ang=math.atan2(4,-3)
arc=[(a[0]+86*math.cos(ang*i/80),a[1]-86*math.sin(ang*i/80)) for i in range(81)]
draw.line(arc,fill=amber,width=7);arrow(arc[-11],arc[-1],amber,6,14)
txt(482,591,'α',40,amber,True);txt(679,652,'x',39);txt(469,257,'y',39)
txt(236,666,'−3',40,plum,anchor='ma');txt(466,345,'4',40,plum)
txt(849,285,'Länge: 5',59,bold=True)
txt(849,390,'α ≈ 126,9°',59,amber,True)
txt(849,510,'x = 5 · cos α ≈ −3',50)
txt(849,594,'y = 5 · sin α ≈ 4',50)
txt(849,704,'Nullvektor: kein Winkel',43)
save(4,'Winkelbezug: ab der positiven x-Achse gegen den Uhrzeigersinn.')
