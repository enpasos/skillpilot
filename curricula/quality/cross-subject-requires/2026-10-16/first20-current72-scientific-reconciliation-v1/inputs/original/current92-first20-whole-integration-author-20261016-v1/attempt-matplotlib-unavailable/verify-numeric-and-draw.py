# SPDX-License-Identifier: Apache-2.0
from pathlib import Path
from fractions import Fraction as F
import json, math, os, datetime
os.environ["MPLCONFIGDIR"]="/tmp/current20-mpl"
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import Circle,Rectangle
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
ck("galaxy distance Mpc",math.sqrt(1e36/(4*math.pi*8.36e-13))/3.085677581491367e22,10.0000595221269,2e-5)
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
# All plots are own reviewer constructions, not original learner material or hardware records.
P=L/"own-figures";P.mkdir(exist_ok=True)
def save(fig,name):
 fig.tight_layout();fig.savefig(P/name,metadata={"Creator":"SkillPilot current20 informed author; own construction; CC-BY-4.0"});plt.close(fig)
fig,axs=plt.subplots(2,2,figsize=(10,6.8))
for col,(U,hi,lo,title) in enumerate([(U1,IH1,IL1,"Supplied case 1"),(U2,IH2,IL2,"Supplied case 2")]):
 for row in [0,1]:
  ax=axs[row,col]
  for I,color,label in [(hi,"#1760aa","high irradiance"),(lo,"#ba5909","low irradiance")]:
   y=I if row==0 else [u*i for u,i in zip(U,I)];ax.plot(U,y,"o-",color=color,label=label)
   if col==1:
    if row==0:ax.errorbar(U,y,xerr=.01,yerr=5,fmt="none",color=color,alpha=.5)
    else:ax.errorbar(U,y,xerr=.01,yerr=[[v-(u-.01)*(i-5) for v,u,i in zip(y,U,I)],[(u+.01)*(i+5)-v for v,u,i in zip(y,U,I)]],fmt="none",color=color,alpha=.5)
  ax.set(xlabel="U / V",ylabel="I / mA" if row==0 else "P / mW",title=title+(" U-I" if row==0 else " P-U"));ax.grid(alpha=.25);ax.legend(fontsize=7)
fig.suptitle("Own plots of supplied PV data; joining lines guide reading, not exact continuous MPP",fontsize=10);save(fig,"PV-supplied-UI-and-PU.svg")
fig,axs=plt.subplots(1,2,figsize=(10,3.5))
for filename,style in [("PV-virtual-acquisition-coarse.actual.json","o--"),("PV-virtual-acquisition-refined.actual.json",".-")]:
 for acq in json.loads((L/filename).read_text())["acquisitions"]:
  for ax,ykey in zip(axs,["I_mA","P_mW"]):ax.plot([r["U_V"] for r in acq["readings"]],[r[ykey] for r in acq["readings"]],style,label=str(acq["irradiance_Wm2"])+" W/m² "+("coarse" if "coarse" in filename else "refined"))
for ax,y in zip(axs,["I / mA","P / mW"]):ax.set(xlabel="controlled U / V",ylabel=y);ax.grid(alpha=.3);ax.legend(fontsize=6)
fig.suptitle("Own controllable virtual acquisition, T=25°C; no hardware measurement",fontsize=10);save(fig,"PV-own-virtual-coarse-and-refined.svg")
fig,axs=plt.subplots(1,2,figsize=(9,3.8))
for ax,x,y,err,mm,bb,yl in [(axs[0],[5,6,7],[.30,.97,1.62],.04,m,b,"E / 10^-19 J"),(axs[1],[6,7,8],[.48,.89,1.30],.03,m2,b2,"U_stop / V")]:
 ax.errorbar(x,y,yerr=err,fmt="o",label="synthetic supplied values + absolute bounds");xx=[min(x)-.5,max(x)+.5];ax.plot(xx,[mm*t+bb for t in xx],label="own best-fit line");ax.set(xlabel="f / 10^14 Hz",ylabel=yl);ax.grid(alpha=.3);ax.legend(fontsize=6)
save(fig,"photoelectric-own-linear-evaluations.svg")
fig,axs=plt.subplots(1,2,figsize=(9,3.8))
angles=list(range(181));axs[0].plot(angles,[.5+10*math.cos(math.radians(a))**2 for a in angles]);axs[0].plot([0,30,45,60,90,120,150,180],[10.5,8,5.5,3,.5,3,8,10.5],"o");axs[0].axhline(.5,color="gray",ls="--",label="dark .5")
axs[1].plot(angles,[2.2+8*math.cos(math.radians(a-25))**2 for a in angles]);axs[1].axhline(.2,color="gray",ls="--",label="dark .2; curve minimum 2.2")
for ax in axs:ax.set(xlabel="analyzer angle / degrees",ylabel="synthetic intensity / units");ax.grid(alpha=.3);ax.legend(fontsize=7)
fig.suptitle("Author-instantiated Malus cases; not observed laboratory data",fontsize=10);save(fig,"malus-own-instantiated-curves.svg")
fig,axs=plt.subplots(1,2,figsize=(9,4))
ax=axs[0];ax.quiver([0,3,0],[0,0,0],[3,0,3],[0,4,4],angles="xy",scale_units="xy",scale=1,color=["#1760aa","#ba5909","#171717"]);ax.set(xlim=(-.5,4),ylim=(-.5,5),aspect="equal",xlabel="length / cm; 1 cm : 10 N",ylabel="length / cm",title="30 N east + 40 N north → 50 N");ax.grid(alpha=.3)
ax=axs[1];ax.quiver([0,0,0],[0,0,0],[-2,-2,-2],[-2,-2,2],angles="xy",scale_units="xy",scale=1,color=["gray","#ba5909","#1760aa"]);ax.text(-2.4,-1.3,"airflow / drag");ax.text(-2.4,2.3,"lift, marked upper side");ax.set(xlim=(-3,1),ylim=(-3,3),aspect="equal",title="Own oblique-flow directions",xlabel="reviewer diagram coordinates",ylabel="reviewer diagram coordinates");ax.grid(alpha=.2)
save(fig,"force-resultant-and-oblique-wing.svg")
fig,axs=plt.subplots(1,2,figsize=(9,4))
ax=axs[0]
for x in [.0,.1,.2,.3,.4]:ax.axvline(x,color="#1760aa");ax.text(x,.8,f"{20-100*x:g} V",rotation=90)
ax.arrow(.06,.5,.24,0,head_width=.08,head_length=.015,length_includes_head=True,color="#ba5909");ax.set(xlim=(-.03,.45),ylim=(0,1),xlabel="x / m",yticks=[],title="Uniform E toward +x; φ=20−100x")
ax=axs[1]
for rad in [.1,.2,.3]:ax.add_patch(Circle((0,0),rad,fill=False,color="#1760aa"));ax.text(rad,0,f"{12/rad:g} V")
for a in range(0,360,45):
 z=math.radians(a);ax.arrow(.03*math.cos(z),.03*math.sin(z),.22*math.cos(z),.22*math.sin(z),head_width=.012,length_includes_head=True,color="#ba5909")
ax.set(xlim=(-.35,.35),ylim=(-.35,.35),aspect="equal",xlabel="x / m",ylabel="y / m",title="Point-charge model φ=12 V m / r")
save(fig,"potential-own-equipotentials.svg")
# Verify actual virtual acquisitions and distinguish largest sample from continuous optimum.
for filename in ["PV-virtual-acquisition-coarse.actual.json","PV-virtual-acquisition-refined.actual.json"]:
 for acq in json.loads((L/filename).read_text())["acquisitions"]:
  for i,r in enumerate(acq["readings"]):ck(filename+str(acq["irradiance_Wm2"])+str(i),r["P_mW"],r["U_V"]*r["I_mA"])
report={"createdUTC":datetime.datetime.now(datetime.timezone.utc).isoformat(),"checks":checks,"checkCount":len(checks),"failures":[x for x in checks if not x["ok"]],"pvAbsoluteProductBounds":intervals,"fitDetails":{"energyScaledSlope":m,"energyScaledIntercept":b,"energyScaledResiduals":res,"voltageScaledSlope":m2,"voltageIntercept":b2},"scope":"Arithmetic/geometry corroboration of personally worked science; not a substitute for20whole-context judgment, actual learner mastery, real measurements or nativeRequiresapproval."}
(L/"NUMERICAL-AND-GRAPHICAL-CHECKS.actual.json").write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n")
print("checks",len(checks),"failures",len(report["failures"]),"figures",len(list(P.glob("*.svg"))))
