# SPDX-License-Identifier: Apache-2.0
from pathlib import Path
from fractions import Fraction as F
import json, math, os, datetime
os.environ["MPLCONFIGDIR"]="/tmp/current20-mpl"
from xml.sax.saxutils import escape
L=Path.cwd();checks=[]
def ck(name,actual,expected,tol=1e-10):
 ok=abs(float(actual)-float(expected))<=tol*max(1,abs(float(expected)));checks.append(dict(name=name,actual=float(actual),expected=float(expected),ok=ok));assert ok,name
ck("entropy hot-cold",-F(100,400)+F(100,300),F(1,12));ck("entropy reverse",-F(80,250)+F(80,500),-F(4,25));ck("firstlaw fresh",-F(3,5)+F(5,8),F(1,40))
ck("collision sticking",F(2*3,3),2);ck("collision separate energy",F(3*3+1,2)-F(2*2,2),3);ck("collision fresh velocity",F(1*4+3*(-2),4),-F(1,2));ck("collision fresh energy",F(1*4**2+3*(-2)**2,2)-F(4,2)*F(1,2)**2,F(27,2))
ck("relativity overtaking",(F(4,5)-F(3,5))/(1-F(4,5)*F(3,5)),F(5,13));ck("relativity inverse negative",(-F(4,5)+F(3,5))/(1-F(4,5)*F(3,5)),-F(5,13));ck("relativity fresh positive",(F(3,4)+F(1,2))/(1+F(3,4)*F(1,2)),F(10,11));ck("relativity fresh negative",(-F(3,4)+F(1,2))/(1-F(3,4)*F(1,2)),-F(2,5))
ck("wire field",4*math.pi*1e-7*10/(2*math.pi*.02),1e-4);ck("solenoid field",4*math.pi*1e-7*100*1000*.5,.0628318530717959)
ck("nerve electric field",.024/.002,12);ck("nerve speed",.18/.003,60);ck("nerve flux field",2e-6/(4e-4),.005);ck("nerve channel offset",.18/.0035,51.42857142857)
ck("nucleus ratio",1.2e-10/1e-15,120000);ck("scale analogy",.001*100000,100);ck("fresh scale analogy",.002*(2.4e-10/3e-15),160)
ck("HRD48",12*math.sqrt(16),48);ck("HRD class ratio",math.sqrt(100),10);ck("HRD dust bias",math.sqrt(4),2)
ck("galaxy distance Mpc",math.sqrt(1e36/(4*math.pi*8.36e-13))/3.085677581491367e22,9.998650409,1e-10)
ck("Math18 check root",math.sqrt(18),4.242640687);ck("Math decimal root",math.sqrt(.2),.447213595499958)
ck("force3-4-5",math.hypot(30,40),50);ck("proportional fresh scale",50/2,25)
U1=[0,.2,.4,.5,.6];IH1=[100,98,90,70,0];IL1=[50,48,40,20,0]
U2=[.3,.4,.5];IH2=[80,65,50];IL2=[40,31,22]
PH1=[u*i for u,i in zip(U1,IH1)];PL1=[u*i for u,i in zip(U1,IL1)]
for i,(a,b) in enumerate(zip(PH1,[0,19.6,36,35,0])):ck("PVhigh"+str(i),a,b)
intervals=[]
for label,I in [("high",IH2),("low",IL2)]:
 for u,i in zip(U2,I):intervals.append(dict(level=label,U_V=u,lower_mW=(u-.01)*(i-5),upper_mW=(u+.01)*(i+5)))
ck("PV upper first",intervals[0]["upper_mW"],26.35);ck("PV lower last low",intervals[-1]["lower_mW"],8.33)
def fit(x,y):
 xm=sum(x)/len(x);ym=sum(y)/len(y);m=sum((a-xm)*(b-ym) for a,b in zip(x,y))/sum((a-xm)**2 for a in x);b=ym-m*xm;return m,b,[y0-(m*x0+b) for x0,y0 in zip(x,y)]
m,b,res=fit([5,6,7],[.30,.97,1.62]);ck("energy slope scaled",m,.66);ck("energy intercept scaled",b,-2.996666666666667);ck("energy maxres",max(abs(x) for x in res),.006666666666667)
m2,b2,res2=fit([6,7,8],[.48,.89,1.30]);ck("voltage slope scaled",m2,.41);ck("voltage intercept",b2,-1.98);ck("voltage h scaled",1.60*m2, .656)
# All diagrams are own reviewer constructions, not original learner material/hardware records.
P=L/"own-figures";P.mkdir(exist_ok=True)
def panel(ox,oy,w,h,xmax,ymax,curves,title,xlab,ylab,bounds=False):
 left,bottom=ox+52,oy+h-42;ww,hh=w-72,h-88
 def X(x):return left+x/xmax*ww
 def Y(y):return bottom-y/ymax*hh
 parts=[f'<text x="{ox+w/2}" y="{oy+20}" text-anchor="middle" font-size="13">{escape(title)}</text>',f'<path d="M{left},{oy+40}V{bottom}H{left+ww}" fill="none" stroke="#222"/>']
 for j in range(6):
  x=xmax*j/5;y=ymax*j/5
  parts.extend([f'<path d="M{X(x)},{bottom}v4 M{left-4},{Y(y)}h{ww+4}" stroke="#bbb" stroke-width=".5"/>',f'<text x="{X(x)}" y="{bottom+16}" text-anchor="middle" font-size="10">{x:.2g}</text>',f'<text x="{left-7}" y="{Y(y)+3}" text-anchor="end" font-size="10">{y:.3g}</text>'])
 parts.extend([f'<text x="{left+ww/2}" y="{oy+h-7}" text-anchor="middle" font-size="12">{escape(xlab)}</text>',f'<text transform="translate({ox+12},{oy+h/2}) rotate(-90)" text-anchor="middle" font-size="12">{escape(ylab)}</text>'])
 for k,(xs,ys,color,label,err) in enumerate(curves):
  pts=' '.join(f'{X(x):.3f},{Y(y):.3f}' for x,y in zip(xs,ys));parts.append(f'<polyline points="{pts}" fill="none" stroke="{color}" stroke-width="1.7"/>')
  for i,(x,y) in enumerate(zip(xs,ys)):
   parts.append(f'<circle cx="{X(x)}" cy="{Y(y)}" r="3" fill="{color}"/>')
   if err:
    lo,hi=err[i];parts.append(f'<path d="M{X(x)},{Y(lo)}V{Y(hi)} M{X(x)-3},{Y(lo)}h6 M{X(x)-3},{Y(hi)}h6" stroke="{color}" fill="none" opacity=".6"/>')
  parts.append(f'<text x="{left+12}" y="{oy+40+13*k}" fill="{color}" font-size="10">{escape(label)}</text>')
 return ''.join(parts)
def svg(name,width,height,body):
 (P/name).write_text(f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}"><metadata>Own reviewer construction; CC-BY-4.0; no hardware/learner evidence.</metadata><rect width="100%" height="100%" fill="white"/><g font-family="sans-serif">'+body+'</g></svg>\n')
body='<text x="480" y="20" text-anchor="middle" font-size="14">Supplied PV data — connecting segments guide reading, no exact continuous MPP</text>'
for col,(U,hi,lo,title) in enumerate([(U1,IH1,IL1,"case1"),(U2,IH2,IL2,"case2")]):
 for row in range(2):
  curves=[]
  for I,color,label in [(hi,"#1760aa","high"),(lo,"#ba5909","low")]:
   yy=I if row==0 else [u*i for u,i in zip(U,I)];err=None
   if col==1:err=[(i-5,i+5) for i in I] if row==0 else [((u-.01)*(i-5),(u+.01)*(i+5)) for u,i in zip(U,I)]
   curves.append((U,yy,color,label,err))
  body+=panel(col*480,30+row*310,480,310,.6,110 if row==0 else 40,curves,title+(' U-I' if row==0 else' P-U'),'U / V','I / mA' if row==0 else'P / mW')
svg('PV-supplied-UI-and-PU.svg',960,660,body)
curvesI=[];curvesP=[]
for filename in ['PV-virtual-acquisition-coarse.actual.json','PV-virtual-acquisition-refined.actual.json']:
 for acq in json.loads((L/filename).read_text())['acquisitions']:
  label=str(acq['irradiance_Wm2'])+' W/m² '+('coarse' if'coarse'in filename else'refined');color='#1760aa' if acq['irradiance_Wm2']==800 else'#ba5909';xs=[r['U_V'] for r in acq['readings']]
  curvesI.append((xs,[r['I_mA'] for r in acq['readings']],color,label,None));curvesP.append((xs,[r['P_mW'] for r in acq['readings']],color,label,None))
svg('PV-own-virtual-coarse-and-refined.svg',960,350,panel(0,0,480,350,.6,90,curvesI,'Own virtual acquisition, T=25°C','controlled U / V','I / mA')+panel(480,0,480,350,.6,32,curvesP,'Coarse then adaptive refined scan','controlled U / V','P / mW'))
body=panel(0,0,480,350,8,2.2,[([5,6,7],[.3,.97,1.62],'#1760aa','synthetic energy data',[(.26,.34),(.93,1.01),(1.58,1.66)])],'Own photoelectric energy fit','f / 10^14 Hz','E / 10^-19 J')
body+=panel(480,0,480,350,9,1.7,[([6,7,8],[.48,.89,1.30],'#1760aa','synthetic voltage data',[(.45,.51),(.86,.92),(1.27,1.33)])],'Own photoelectric voltage fit','f / 10^14 Hz','U_stop / V')
svg('photoelectric-own-linear-evaluations.svg',960,350,body)
angles=list(range(181));v1=[.5+10*math.cos(math.radians(a))**2 for a in angles];v2=[2.2+8*math.cos(math.radians(a-25))**2 for a in angles]
svg('malus-own-instantiated-curves.svg',960,350,panel(0,0,480,350,180,12,[(angles,v1,'#1760aa','synthetic I=.5+10cos²α',None)],'Own Malus instance, dark=.5','angle / degrees','intensity / units')+panel(480,0,480,350,180,12,[(angles,v2,'#1760aa','synthetic I=2.2+8cos²(α−25°)',None)],'Own changed instance, dark=.2','angle / degrees','intensity / units'))
def arrow(x1,y1,x2,y2,color,label,tx,ty):
 return f'<path d="M{x1},{y1}L{x2},{y2}" stroke="{color}" stroke-width="3" marker-end="url(#arrow)"/><text x="{tx}" y="{ty}" font-size="13" fill="{color}">{escape(label)}</text>'
head='<defs><marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="#333"/></marker></defs>'
body=head+'<text x="20" y="25" font-size="15">Own force construction: 1 cm : 10 N</text>'+arrow(60,290,210,290,'#1760aa','30 N / 3 cm',90,315)+arrow(210,290,210,90,'#ba5909','40 N / 4 cm',218,190)+arrow(60,290,210,90,'#222','50 N / 5 cm',65,160)
body+='<text x="480" y="25" font-size="15">Oblique airflow: own direction sketch</text>'+arrow(750,180,630,300,'#ba5909','airflow; drag',485,315)+arrow(750,180,630,60,'#1760aa','lift to marked upper side',485,48)+'<path d="M727,203L704,180L727,157" fill="none" stroke="#333"/>'
svg('force-resultant-and-oblique-wing.svg',960,350,body)
body=head+'<text x="20" y="25" font-size="15">Own equipotentials: φ=20−100x (V)</text>'
for k in range(5):
 x=65+k*65;body+=f'<path d="M{x},60V290" stroke="#1760aa"/><text x="{x}" y="315" text-anchor="middle" font-size="12">{20-10*k} V</text>'
body+=arrow(80,170,300,170,'#ba5909','E along +x',140,155)+'<text x="600" y="25" font-size="15">Point charge: φ=12 V m / r</text>'
for rad in [40,80,120]:body+=f'<circle cx="740" cy="180" r="{rad}" fill="none" stroke="#1760aa"/><text x="{744+rad}" y="180" font-size="12">{4800/rad:g} V</text>'
for a in range(0,360,45):
 z=math.radians(a);body+=arrow(740+15*math.cos(z),180+15*math.sin(z),740+105*math.cos(z),180+105*math.sin(z),'#ba5909','',740,180)
svg('potential-own-equipotentials.svg',960,350,body)

# Verify actual virtual acquisitions and distinguish largest sample from continuous optimum.
for filename in ["PV-virtual-acquisition-coarse.actual.json","PV-virtual-acquisition-refined.actual.json"]:
 for acq in json.loads((L/filename).read_text())["acquisitions"]:
  for i,r in enumerate(acq["readings"]):ck(filename+str(acq["irradiance_Wm2"])+str(i),r["P_mW"],r["U_V"]*r["I_mA"])
report={"createdUTC":datetime.datetime.now(datetime.timezone.utc).isoformat(),"checks":checks,"checkCount":len(checks),"failures":[x for x in checks if not x["ok"]],"pvAbsoluteProductBounds":intervals,"fitDetails":{"energyScaledSlope":m,"energyScaledIntercept":b,"energyScaledResiduals":res,"voltageScaledSlope":m2,"voltageIntercept":b2},"scope":"Arithmetic/geometry corroboration of personally worked science; not a substitute for20whole-context judgment, actual learner mastery, real measurements or nativeRequiresapproval."}
(L/"NUMERICAL-AND-GRAPHICAL-CHECKS.actual.json").write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n")
print("checks",len(checks),"failures",len(report["failures"]),"figures",len(list(P.glob("*.svg"))))
