"""Original scientific reference graphic, for solutions only; no root writes."""
from pathlib import Path
from hashlib import sha256
import json
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np
H=Path(__file__).resolve().parent;assert not (H/'content-review-handoff.json').exists()
p=H/'8e18154d-41d6-592e-ba98-537edad338e8/solution-assets';p.mkdir(exist_ok=True)
plt.rcParams.update({'font.family':'DejaVu Sans','font.size':15,'svg.hashsalt':'skillpilot-sixth-unity-solution-v1'})
fig,ax=plt.subplots(figsize=(9,7.2),dpi=160);ax.set_aspect('equal');ax.set_xlim(-1.85,1.85);ax.set_ylim(-1.4,1.4)
ax.spines[['top','right']].set_visible(False);ax.spines[['left','bottom']].set_position('zero');ax.spines[['left','bottom']].set_color('#45556b')
ax.set_xticks([-1,0,1]);ax.set_yticks([-1,0,1]);ax.set_xticklabels(['−1','','1']);ax.set_yticklabels(['−1','','1']);ax.tick_params(pad=7)
t=np.linspace(0,2*np.pi,721);ax.plot(np.cos(t),np.sin(t),color='#1c67b6',lw=2)
angles=np.arange(6)*np.pi/3;xx=np.cos(angles);yy=np.sin(angles)
ax.plot(np.r_[xx,xx[0]],np.r_[yy,yy[0]],'--',color='#bd7122',lw=1.5)
ax.scatter(xx,yy,s=65,color='#133f70',zorder=4)
labels=[r'$z_0=1$',r'$z_1=e^{i\pi/3}$',r'$z_2=e^{2i\pi/3}$',r'$z_3=-1$',r'$z_4=e^{4i\pi/3}$',r'$z_5=e^{5i\pi/3}$']
for j,(x,y,label) in enumerate(zip(xx,yy,labels)):
 dx=12 if x>0 else -12;dy=12 if y>0.1 else -22 if y<-.1 else 13
 ax.annotate(label,(x,y),xytext=(dx,dy),textcoords='offset points',ha='left' if dx>0 else 'right',va='center',fontsize=16,color='#153a63',bbox={'facecolor':'white','edgecolor':'none','alpha':.9,'pad':1})
ax.annotate(r'$\mathrm{Re}\,z$',(1.8,0),xytext=(-10,12),textcoords='offset points',ha='right',fontsize=17)
ax.annotate(r'$\mathrm{Im}\,z$',(0,1.35),xytext=(10,-6),textcoords='offset points',fontsize=17)
ax.annotate('0',(0,0),xytext=(-18,-20),textcoords='offset points')
fig.tight_layout(pad=1.3);png=p/'sixth-roots-solution-v1.png';svg=p/'sixth-roots-solution-v1.svg'
fig.savefig(png,metadata={'Software':'SkillPilot original mathematical solution graphic; matplotlib'});fig.savefig(svg,metadata={'Date':None,'Creator':'SkillPilot original mathematical solution graphic; matplotlib'});plt.close(fig)
url='/assets/assessment-materials/mathematik/8e18154d-41d6-592e-ba98-537edad338e8/sixth-roots-solution-v1.png'
(H/'solution-figure-boundary.json').write_text(json.dumps({'status':'SOLUTION_ONLY_ORIGINAL_REFERENCE_GRAPHIC_NOT_TASK_ASSET_OR_ACTIVATION','sourcePng':str(png.relative_to(H)),'sourceSvg':str(svg.relative_to(H)),'pngSha256':sha256(png.read_bytes()).hexdigest(),'svgSha256':sha256(svg.read_bytes()).hexdigest(),'runtimeUrl':url,'futurePublicPath':'app/public'+url,'onlyAllowedFields':['solutionContent','solutionContentEn'],'taskFieldsMustNotReferenceImage':True,'neverAddAsGoalVisualization':True,'data':{'angles':[0,'pi/3','2pi/3','pi','4pi/3','5pi/3'],'pointCount':6,'radius':1,'figure':'regular hexagon'},'license':'CC-BY-4.0, original SkillPilot mathematical reference figure','rootPublicFileWritten':False},ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'solutionFigure':str(png.relative_to(H)),'sha256':sha256(png.read_bytes()).hexdigest(),'taskImage':False}))
