# SPDX-License-Identifier: Apache-2.0
"""New mathematical stimulus, not an edit of any existing image."""
from pathlib import Path
import hashlib,json
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np

H=Path(__file__).resolve().parent
plt.rcParams.update({'font.family':'DejaVu Sans','font.size':12,'svg.fonttype':'none','svg.hashsalt':'skillpilot-parabola-stimulus-widget-style-20261102-v2'})
fig,ax=plt.subplots(figsize=(6.4,7.4),dpi=200)
fig.subplots_adjust(left=.10,right=.88,bottom=.08,top=.94)
x=np.linspace(-5,3,1601);y=.5*(x+1)**2-2
ax.set(xlim=(-5,3),ylim=(-3,7),aspect='equal')
ax.set_xticks(np.arange(-5,4));ax.set_yticks(np.arange(-3,8))
ax.grid(True,color='#d1d6da',linewidth=.7,zorder=0)
for name in ['top','right']:ax.spines[name].set_visible(False)
for name in ['left','bottom']:ax.spines[name].set_position('zero');ax.spines[name].set_linewidth(1.1)
ax.tick_params(axis='both',length=3,pad=7,labelsize=22)
ax.set_xticklabels([str(k) if k else '' for k in range(-5,4)])
ax.plot(x,y,color='#164c7e',linewidth=2.6,zorder=3)
ax.plot([-1,1],[-2,0],'o',color='black',markersize=8,zorder=5)
ax.annotate('S',(-1,-2),xytext=(-22,-17),textcoords='offset points',fontsize=24,zorder=6)
ax.annotate('P',(1,0),xytext=(9,9),textcoords='offset points',fontsize=24,zorder=6)
ax.plot(3,0,'>',color='black',markersize=8,clip_on=False)
ax.plot(0,7,'^',color='black',markersize=8,clip_on=False)
ax.text(3.18,.10,'x',ha='left',va='bottom',fontsize=24,clip_on=False)
ax.text(.12,7.17,'y',ha='left',va='bottom',fontsize=24,clip_on=False)
alt_de='Koordinatensystem mit Einheitsgitter. Eine nach oben geöffnete Parabel hat den markierten Scheitel S bei (−1,−2) und den markierten Punkt P bei (1,0). Sie schneidet die x-Achse außerdem bei x=−3. Die Achsenskalierung beträgt auf beiden Achsen eine Einheit je Gitterabstand.'
alt_en='Coordinate system with a unit grid. An upward-opening parabola has the marked vertex S at (−1,−2) and the marked point P at (1,0). It also crosses the x-axis at x=−3. Both axes use one unit per grid spacing.'
assert not ax.get_legend() and not ax.get_title()
texts=[t.get_text() for t in ax.texts]
assert sorted(texts)==['P','S','x','y']
metadata={'Title':'Parabel mit S und P','Description':alt_de,'Creator':'SkillPilot plot_parabola.py','Date':None}
fig.savefig(H/'parabola-stimulus.svg',metadata=metadata,facecolor='white')
fig.savefig(H/'parabola-stimulus.png',metadata={'Description':alt_de,'Copyright':'SkillPilot, CC-BY-4.0'},facecolor='white',dpi=200)
plt.close(fig)
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
(H/'plot-metadata.json').write_text(json.dumps({'status':'PRIVATE_STYLE_ONLY_REVISION_SAME_GIVENS_NOT_HOST_ACCEPTANCE','primaryStimulus':'parabola-stimulus.png','additionalVectorSource':'parabola-stimulus.svg','plotSource':'plot_parabola.py','stimulusLicense':'CC-BY-4.0','plotCodeLicense':'Apache-2.0','imageContainsEquation':False,'visibleAnnotations':texts,'axisUnitSpacing':1,'markedPoints':{'S':[-1,-2],'P':[1,0]},'altTextDe':alt_de,'altTextEn':alt_en,'generatedFiles':{name:{'sha256':sha(H/name),'bytes':(H/name).stat().st_size} for name in ['parabola-stimulus.png','parabola-stimulus.svg']},'codeSha256':sha(Path(__file__))},ensure_ascii=False,indent=2)+'\n')
