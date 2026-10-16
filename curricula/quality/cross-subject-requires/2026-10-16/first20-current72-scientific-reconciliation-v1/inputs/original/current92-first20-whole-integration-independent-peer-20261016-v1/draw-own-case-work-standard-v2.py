import pathlib,math,json,datetime,html
from PIL import Image,ImageDraw,ImageFont
D=pathlib.Path("own-graphical-case-work");D.mkdir(exist_ok=True)
font="/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
class Canvas:
 def __init__(self,w,h):
  self.w=w;self.h=h;self.im=Image.new("RGB",(w,h),"white");self.d=ImageDraw.Draw(self.im);self.svg=[f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}"><rect width="100%" height="100%" fill="white"/>']
 def line(self,a,b,c="#333333",width=2):
  self.d.line([tuple(a),tuple(b)],fill=c,width=width);self.svg.append(f'<line x1="{a[0]}" y1="{a[1]}" x2="{b[0]}" y2="{b[1]}" stroke="{c}" stroke-width="{width}"/>')
 def text(self,p,t,size=16,c="#222222"):
  self.d.text(p,t,font=ImageFont.truetype(font,size),fill=c);self.svg.append(f'<text x="{p[0]}" y="{p[1]+size}" font-family="DejaVu Sans,sans-serif" font-size="{size}" fill="{c}">{html.escape(t)}</text>')
 def dot(self,p,c="#1f77b4",r=4):
  self.d.ellipse([p[0]-r,p[1]-r,p[0]+r,p[1]+r],fill=c);self.svg.append(f'<circle cx="{p[0]}" cy="{p[1]}" r="{r}" fill="{c}"/>')
 def arrow(self,a,b,c="#1f77b4"):
  self.line(a,b,c,3);ang=math.atan2(b[1]-a[1],b[0]-a[0])
  for off in [.45,-.45]:self.line(b,(b[0]-12*math.cos(ang+off),b[1]-12*math.sin(ang+off)),c,3)
 def circle(self,p,r,c="#1f77b4"):
  self.d.ellipse([p[0]-r,p[1]-r,p[0]+r,p[1]+r],outline=c,width=2);self.svg.append(f'<circle cx="{p[0]}" cy="{p[1]}" r="{r}" fill="none" stroke="{c}" stroke-width="2"/>')
 def save(self,name):
  self.im.save(D/(name+".png"));(D/(name+".svg")).write_text("\n".join(self.svg+["</svg>"])+"\n")
def panel(c,box,title,xrange,yrange,xlab,ylab,equal=False):
 x0,y0,w,h=box;L=x0+65;T=y0+45;W=w-90;H=h-95
 if equal:
  scale=min(W/(xrange[1]-xrange[0]),H/(yrange[1]-yrange[0]));newW=scale*(xrange[1]-xrange[0]);newH=scale*(yrange[1]-yrange[0]);L+=(W-newW)/2;T+=(H-newH)/2;W=newW;H=newH
 def p(x,y):return(L+(x-xrange[0])/(xrange[1]-xrange[0])*W,T+H-(y-yrange[0])/(yrange[1]-yrange[0])*H)
 c.text((x0+12,y0+4),title,16);c.line(p(xrange[0],yrange[0]),p(xrange[1],yrange[0]));c.line(p(xrange[0],yrange[0]),p(xrange[0],yrange[1]))
 for k in range(5):
  x=xrange[0]+k*(xrange[1]-xrange[0])/4;y=yrange[0]+k*(yrange[1]-yrange[0])/4
  c.line(p(x,yrange[0]),p(x,yrange[1]),"#eeeeee",1);c.line(p(xrange[0],y),p(xrange[1],y),"#eeeeee",1)
  c.text((p(x,yrange[0])[0]-12,T+H+3),f"{x:g}",11);c.text((L-55,p(xrange[0],y)[1]-7),f"{y:g}",11)
 c.text((L,T+H+20),xlab,13);c.text((x0+8,y0+27),ylab,12)
 return p
c=Canvas(1200,950);c.text((18,10),"Reviewer graphical work: frozen cases; no performed experiment or learner mastery",18)
p=panel(c,(0,55,600,420),"19: native force construction (1 cm : 10 N)",(-1,6),(-2,5),"paper x / cm","paper y / cm",equal=True)
c.arrow(p(0,0),p(3,0));c.arrow(p(3,0),p(3,4),"#d67b19");c.arrow(p(0,0),p(3,4),"#228833");c.text(p(.5,.2),"30 N",14);c.text(p(3.1,2),"40 N",14);c.text(p(.2,3),"5 cm = 50 N; ~53 degrees",13)
c.arrow(p(0,-1),p(2.5,-1));c.arrow(p(2.5,-1),p(0,-1),"#d67b19");c.text(p(.2,-1.8),"25 N opposite: resultant 0",12)
p=panel(c,(600,55,600,420),"9: oblique airflow / wing (reviewer realization)",(-5,2),(-5,4),"same arbitrary spatial units","orientation",equal=True)
c.arrow(p(0,0),p(-3,-4));c.arrow(p(0,0),p(-4,3),"#228833");c.text(p(-4,-3.6),"drag follows airflow",13);c.text(p(-4.7,3.2),"lift perpendicular / marked upper side",12)
p=panel(c,(0,500,600,420),"10A: phi=-100x V, field right", (0,.06),(-.02,.02),"x / m","y / m",equal=True)
for k in range(1,6):c.line(p(k*.01,-.02),p(k*.01,.02),"#336699",2);c.text(p(k*.01,.015),f"−{k} V",12)
for x in [.01,.03,.05]:c.arrow(p(x,0),p(x+.007,0),"#bb3344")
c.dot(p(.02,0));c.dot(p(.05,.01));c.text(p(.005,-.015),"A: −2 V; B: −5 V; U_AB=+3 V",13)
p=panel(c,(600,500,600,420),"10B: point-charge realization; kQ=9 V m",(-.35,.35),(-.35,.35),"x / m","y / m",equal=True)
for val,col in [(30,"#225588"),(45,"#337799"),(60,"#4499aa"),(90,"#66aabb")]:
 pts=[p(9/val*math.cos(i*math.pi/100),9/val*math.sin(i*math.pi/100)) for i in range(201)]
 for a,b in zip(pts,pts[1:]):c.line(a,b,col,2)
for i in range(8):
 q=i*math.pi/4;c.arrow(p(.04*math.cos(q),.04*math.sin(q)),p(.33*math.cos(q),.33*math.sin(q)),"#bb3344")
c.text((680,900),"Equal potential steps: denser contours near source",12);c.save("force-wing-potential-standard-v2")
c=Canvas(1200,1100);c.text((18,10),"Reviewer plotted evaluations of frozen native data / marked reviewer realizations",18)
p=panel(c,(0,45,600,330),"0: supplied native1 U-I pairs", (0,.6),(0,100),"U / V","I / mA")
u=[0,.2,.4,.5,.6];hi=[100,98,90,70,0];lo=[50,48,40,20,0]
for v,col in [(hi,"#225588"),(lo,"#cc7733")]:
 pts=[p(x,y) for x,y in zip(u,v)]
 for a,b in zip(pts,pts[1:]):c.line(a,b,col)
 for a in pts:c.dot(a,col)
p=panel(c,(600,45,600,330),"0: sampled P-U maxima 36 / 16 mW",(0,.6),(0,40),"U / V","P / mW")
for v,col in [(hi,"#225588"),(lo,"#cc7733")]:
 pts=[p(x,x*y) for x,y in zip(u,v)]
 for a,b in zip(pts,pts[1:]):c.line(a,b,col)
 for a in pts:c.dot(a,col)
p=panel(c,(0,400,600,330),"12 native1: fitted slope 6.6e−34 J s",(4.5,7.5),(0,2),"frequency / 1e14 Hz","energy / 1e−19 J")
for x,y in zip([5,6,7],[.30,.97,1.62]):c.dot(p(x,y));c.line(p(x,y-.04),p(x,y+.04))
c.line(p(4.6,.66*4.6-2.9966667),p(7.4,.66*7.4-2.9966667),"#cc7733")
p=panel(c,(600,400,600,330),"12 native2: fitted U slope 4.1e−15 V s",(5.5,8.5),(.2,1.6),"frequency / 1e14 Hz","stopping voltage / V")
for x,y in zip([6,7,8],[.48,.89,1.30]):c.dot(p(x,y));c.line(p(x,y-.03),p(x,y+.03))
c.line(p(5.5,.41*5.5-1.98),p(8.5,.41*8.5-1.98),"#cc7733")
p=panel(c,(0,755,600,330),"17: reviewer realization I=5+100 cos²(alpha)",(0,180),(0,120),"angle / degree","intensity / model units")
pts=[p(a,5+100*math.cos(math.radians(a))**2) for a in range(181)]
for a,b in zip(pts,pts[1:]):c.line(a,b)
for a in [0,30,45,60,90,120,150,180]:
 y=5+100*math.cos(math.radians(a))**2;c.dot(p(a,y));c.line(p(a,y-2),p(a,y+2))
p=panel(c,(600,755,600,330),"18: illustrative response, not learner formula",(.2,2),(0,11),"drive / eigenfrequency","relative stationary amplitude")
for z,col in [(.05,"#225588"),(.2,"#cc7733")]:
 pts=[]
 for k in range(451):
  r=.2+1.8*k/450;v=1/math.sqrt((1-r*r)**2+(2*z*r)**2);pts.append(p(r,v))
 for a,b in zip(pts,pts[1:]):c.line(a,b,col)
c.save("pv-planck-malus-resonance-standard-v2")
receipt={"createdUTC":datetime.datetime.now(datetime.timezone.utc).isoformat(),"ownLockSHA":"868f5ff7444ea0f60d5cfc1cf9eb57c88b71fb61814609b842a5164639b72144","renderingAfterLockOnly":True,"newScientificDecision":False,"geometry":{"nativeForce1DrawingCentimetres":[3,4,5],"forceResultantN":50,"angleDegrees":math.degrees(math.atan2(4,3)),"nativeForce2OppositeN":[25,25],"nativeForce2ResultantN":0},"extent":"Pillow and standard SVG from identical data/coordinates; actual drawings inspected separately. No new Math prerequisite imposed by reviewer response generator. PV own acquisition/simulation remains an assessment demand, not falsely performed here."}
(D/"GRAPHICAL-WORK-RECEIPT.v2.actual.json").write_text(json.dumps(receipt,ensure_ascii=False,indent=2)+"\n")
print("2PNG+2SVG+receipt")
