import os,pathlib,json,math,datetime
os.environ["MPLCONFIGDIR"]=str(pathlib.Path("plot-cache").resolve())
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
D=pathlib.Path("own-graphical-case-work");D.mkdir(exist_ok=True)
def arrow(ax,a,b,color,label):
 ax.annotate("",xy=b,xytext=a,arrowprops=dict(arrowstyle="->",color=color,lw=2));m=((a[0]+b[0])/2,(a[1]+b[1])/2);ax.text(*m,label,color=color,fontsize=8)
fig,axs=plt.subplots(2,2,figsize=(10,8))
ax=axs[0,0];arrow(ax,(0,0),(3,0),"tab:blue","30 N = 3 cm");arrow(ax,(3,0),(3,4),"tab:orange","40 N = 4 cm");arrow(ax,(0,0),(3,4),"tab:green","5 cm = 50 N");arrow(ax,(0,-1),(2.5,-1),"tab:blue","25 N");arrow(ax,(2.5,-1),(0,-1),"tab:orange","25 N opposite: resultant 0");ax.set(xlim=(-.7,4.5),ylim=(-1.8,5),xlabel="drawing length / cm",ylabel="drawing length / cm",title="19: graphic native cases; scale 1 cm : 10 N");ax.set_aspect("equal");ax.grid()
ax=axs[0,1];arrow(ax,(0,0),(-3,-4),"tab:blue","relative airflow / drag direction");arrow(ax,(0,0),(-4,3),"tab:green","lift: perpendicular, side marked");ax.set(xlim=(-5,2),ylim=(-5,4),title="9: reviewer realization of oblique wing case");ax.set_aspect("equal");ax.grid()
ax=axs[1,0];xx=np.linspace(0,.06,100);yy=np.linspace(-.02,.02,100);X,Y=np.meshgrid(xx,yy);cs=ax.contour(X,Y,-100*X,levels=np.arange(-6,1,1));ax.clabel(cs,inline=True,fontsize=8);ax.quiver([.01,.03,.05],[0,0,0],[1,1,1],[0,0,0],color="tab:red");ax.scatter([.02,.05],[0,.01]);ax.set(xlabel="x / m",ylabel="y / m",title="10A: phi=-100x V; field right, contours perpendicular");ax.set_aspect("equal")
ax=axs[1,1];t=np.linspace(0,2*np.pi,200)
for v in [30,45,60,90]:
 r=9/v;ax.plot(r*np.cos(t),r*np.sin(t),label=f"{v} V")
for q in np.linspace(0,2*np.pi,8,endpoint=False):arrow(ax,(.055*np.cos(q),.055*np.sin(q)),(.32*np.cos(q),.32*np.sin(q)),"tab:red","")
ax.set(xlim=(-.34,.34),ylim=(-.34,.34),xlabel="x / m",ylabel="y / m",title="10B: reviewer point-charge realization, kQ=9 V m");ax.set_aspect("equal");ax.legend(fontsize=7)
fig.suptitle("Reviewer case work after frozen solutions; no learner or experimental execution",fontsize=10);fig.tight_layout();fig.savefig(D/"force-wing-potential.png",dpi=150);fig.savefig(D/"force-wing-potential.svg");plt.close(fig)
fig,axs=plt.subplots(2,2,figsize=(10,7))
u=np.array([0,.2,.4,.5,.6]);ih=np.array([100,98,90,70,0]);il=np.array([50,48,40,20,0])
for i,label in [(ih,"higher irradiation"),(il,"lower irradiation")]:axs[0,0].plot(u,i,"o-",label=label);axs[0,1].plot(u,u*i,"o-",label=label)
axs[0,0].set(xlabel="U / V",ylabel="I / mA",title="0 native1: supplied pairs, acquisition still mandatory");axs[0,1].set(xlabel="U / V",ylabel="P / mW",title="0 native1: sampled maxima 36 and 16 mW")
for ax in axs[0]:ax.legend(fontsize=8);ax.grid()
f=np.array([5,6,7]);e=np.array([.30,.97,1.62]);fit=np.polyfit(f,e,1);axs[1,0].errorbar(f,e,yerr=.04,fmt="o");axs[1,0].plot(f,np.polyval(fit,f));axs[1,0].set(xlabel="frequency / 10^14 Hz",ylabel="energy / 10^-19 J",title="12 native1: slope .66 scaled = 6.6e-34 J s")
f=np.array([6,7,8]);u=np.array([.48,.89,1.30]);fit=np.polyfit(f,u,1);axs[1,1].errorbar(f,u,yerr=.03,fmt="o");axs[1,1].plot(f,np.polyval(fit,f));axs[1,1].set(xlabel="frequency / 10^14 Hz",ylabel="stopping voltage / V",title="12 native2: slope .41 scaled, h = e slope")
for ax in axs[1]:ax.grid()
fig.suptitle("Frozen native data evaluated by reviewer; finite samples and stated error bounds",fontsize=10);fig.tight_layout();fig.savefig(D/"pv-planck.png",dpi=150);fig.savefig(D/"pv-planck.svg");plt.close(fig)
fig,axs=plt.subplots(1,3,figsize=(13,4))
a=np.array([0,30,45,60,90,120,150,180]);iv=5+100*np.cos(np.deg2rad(a))**2
axs[0].errorbar(a,iv,yerr=2,fmt="o",label="reviewer-realized native1");grid=np.linspace(0,180,400);axs[0].plot(grid,5+100*np.cos(np.deg2rad(grid))**2);axs[0].set(xlabel="angle / degree",ylabel="intensity / model units",title="17: dark 5; projection squared")
x=np.cos(np.deg2rad(a))**2;axs[1].errorbar(x,iv,yerr=2,fmt="o");axs[1].plot([0,1],[5,105]);axs[1].set(xlabel="cos²(alpha)",ylabel="intensity / model units",title="17: linearized data, offset preserved")
rr=np.linspace(.2,2,600)
for z in [.05,.2]:
 response=1/np.sqrt((1-rr**2)**2+(2*z*rr)**2);axs[2].plot(rr,response,label=f"damping parameter {z}")
axs[2].set(xlabel="drive / eigenfrequency",ylabel="stationary amplitude / relative units",title="18: reviewer-only illustrative model");axs[2].legend(fontsize=7)
for ax in axs:ax.grid()
fig.suptitle("Reviewer-realized illustrations; formulas/data are not extra learner prerequisites",fontsize=10);fig.tight_layout();fig.savefig(D/"malus-resonance.png",dpi=150);fig.savefig(D/"malus-resonance.svg");plt.close(fig)
receipt={"createdUTC":datetime.datetime.now(datetime.timezone.utc).isoformat(),"ownLockSHA":"868f5ff7444ea0f60d5cfc1cf9eb57c88b71fb61814609b842a5164639b72144","afterLockRenderingOnly":True,"newScienceDecision":False,"graphicForceMeasuredFromConstruction":{"native1":{"horizontalCm":3,"verticalCm":4,"resultantCm":math.hypot(3,4),"resultantN":10*math.hypot(3,4),"angleDegree":math.degrees(math.atan2(4,3))},"native2":{"oppositeArrowsCm":[2.5,2.5],"resultantCm":0}},"limits":"No learner mastery/real experiment/image-quality/D claim. Malus/forced values are reviewer realizations of generic case briefs. Graphs implement alreadyfrozen case solutions."}
(D/"GRAPHICAL-WORK-RECEIPT.actual.json").write_text(json.dumps(receipt,ensure_ascii=False,indent=2)+"\n")
print("threePNG andthreeSVG technicalcaseartifacts written")
