"""Deterministic scientific figure through the existing static Markdown path."""
from pathlib import Path
from hashlib import sha256
import json
import shutil
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np

HERE=Path(__file__).resolve().parent
assert not (HERE/'content-review-handoff.json').exists(), 'Frozen author batch.'
folder=HERE/'6a4716bd-8038-46bb-b647-0db4a254fee7'
assets=folder/'assets';assets.mkdir(exist_ok=True)
plt.rcParams.update({'font.family':'DejaVu Sans','font.size':15,'svg.hashsalt':'skillpilot-polynomial-graph-v1'})
fig,ax=plt.subplots(figsize=(8,8),dpi=160)
ax.set_xlim(-3,3);ax.set_ylim(-6.4,6.4)
ax.set_xticks(np.arange(-3,4,1));ax.set_yticks(np.arange(-6,7,1))
ax.grid(color='#ccd4df',linewidth=.8)
ax.set_axisbelow(True)
ax.spines[['top','right']].set_visible(False)
ax.spines[['left','bottom']].set_position('zero')
ax.spines[['left','bottom']].set_color('#293548')
ax.spines[['left','bottom']].set_linewidth(1.4)
ax.tick_params(axis='both',labelsize=12,pad=7)
ax.set_xticklabels(['−3','−2','−1','','1','2','3'])
ax.set_yticklabels(['−6','−5','−4','−3','−2','−1','','1','2','3','4','5','6'])
f=lambda x:.5*(x+2)*(x-1)**2
x=np.linspace(-2.8,2.6,1201)
ax.plot(x,f(x),color='#175cb5',linewidth=3)
for start,end in [(-2.69,-2.8),(2.49,2.6)]:
    ax.annotate('',xy=(end,f(end)),xytext=(start,f(start)),arrowprops={'arrowstyle':'-|>','color':'#175cb5','lw':3,'mutation_scale':20})
for label,xx,yy,offset in [('A',-2,0,(-17,-28)),('B',1,0,(9,-28)),('P',0,1,(11,9))]:
    ax.scatter([xx],[yy],s=60,c='#152b49',zorder=5)
    ax.annotate(label,(xx,yy),xytext=offset,textcoords='offset points',fontsize=17,fontweight='bold',color='#152b49',bbox={'facecolor':'white','edgecolor':'none','alpha':.85,'pad':1.5})
ax.annotate('x',xy=(3,0),xytext=(-3,13),textcoords='offset points',ha='right',fontsize=17)
ax.annotate('y',xy=(0,6.4),xytext=(13,-3),textcoords='offset points',fontsize=17)
ax.text(1.55,4.65,'F',color='#175cb5',fontsize=21,fontweight='bold')
fig.tight_layout(pad=1.4)
png=assets/'polynomial-graph-v1.png';svg=assets/'polynomial-graph-v1.svg'
fig.savefig(png,metadata={'Software':'SkillPilot original scientific plot; matplotlib'})
fig.savefig(svg,metadata={'Date':None,'Creator':'SkillPilot original scientific plot; matplotlib'})
plt.close(fig)
url='/assets/assessment-materials/mathematik/6a4716bd-8038-46bb-b647-0db4a254fee7/polynomial-graph-v1.png'
public=HERE/'public'/url.lstrip('/');public.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(png,public)
(HERE/'task-graph-delivery-proposal.json').write_text(json.dumps({'status':'PRIVATE_STATIC_ASSET_AUTHOR_PROPOSAL_NOT_ROOT_DEPLOYMENT_OR_HOST_ACCEPTANCE','goalId':folder.name,'sourcePng':str(png.relative_to(HERE)),'sourceSvg':str(svg.relative_to(HERE)),'runtimeUrl':url,'futurePublicPath':'app/public'+url,'privatePublicFixturePath':str(public.relative_to(HERE)),'pngSha256':sha256(png.read_bytes()).hexdigest(),'svgSha256':sha256(svg.read_bytes()).hexdigest(),'pixelSize':[1280,1280],'delivery':'Existing ReactMarkdown image in taskContent/taskContentEn; Coach cockpit image route. No runtime code or goal visualization replaced.','data':{'privateGenerationFunction':'.5*(x+2)*(x-1)^2','domainWindow':[-3,3],'rangeWindow':[-6.4,6.4],'gridStepBothAxes':1,'markedPoints':{'A':[-2,0],'B':[1,0],'P':[0,1]},'knownTrueEndBehaviour':'left down/right up explicitly stipulated in task, not inferred from finite window'},'licence':'CC-BY-4.0; original SkillPilot scientific graph; no third-party task copied.','pending':['Independent mathematical/image review','Exact public file materialisation at integration','Real app/host acceptance']},ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'pngSha256':sha256(png.read_bytes()).hexdigest(),'runtimeUrl':url}))
