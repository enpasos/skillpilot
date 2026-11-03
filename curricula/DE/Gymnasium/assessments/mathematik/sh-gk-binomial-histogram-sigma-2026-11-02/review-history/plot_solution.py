from pathlib import Path
import csv,math,hashlib,json
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.patches import Patch
from matplotlib.lines import Line2D
H=Path(__file__).resolve().parent;rows=list(csv.DictReader((H/'expected-histogram.csv').open()));x=[int(r['k']) for r in rows];y=[float(r['P_X_equals_k']) for r in rows];sigma=math.sqrt(14.1)
for lang,labels in [('de',('Verspätete Pakete k','Einzelwahrscheinlichkeit P(X = k)','Binomialverteilung B(250; 0,06) – Lösungsausschnitt','Mittelwert μ = 15','Balken 8 bis 22: zusammen 95,60 %')),('en',('Late parcels k','Single-value probability P(X = k)','Binomial distribution B(250, 0.06) – solution excerpt','Mean μ = 15','Bars 8 to 22: total 95.60%'))]:
 fig,ax=plt.subplots(figsize=(10,4.8),layout='constrained');ax.bar(x,y,width=1,color=['#397baf' if 8<=k<=22 else '#c8d8e6' for k in x],edgecolor='white',linewidth=.4);ax.axvline(15,color='#b04432',linewidth=1.4)
 for val in [15-sigma,15+sigma]:ax.axvline(val,color='#555555',linestyle='--',linewidth=1)
 ax.text(15-sigma,.117,'μ − σ',ha='center',fontsize=9);ax.text(15+sigma,.117,'μ + σ',ha='center',fontsize=9);ax.set(xlim=(-.7,35.7),ylim=(0,.124),xlabel=labels[0],ylabel=labels[1],title=labels[2]);ax.set_xticks(range(0,36,5));ax.grid(axis='y',alpha=.2);ax.legend(handles=[Line2D([0],[0],color='#b04432',label=labels[3]),Patch(facecolor='#397baf',label=labels[4])],loc='upper right',fontsize=8);fig.savefig(H/('solution-histogram.'+lang+'.png'),dpi=150);plt.close(fig)
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest();files=['expected-histogram.csv','numeric-and-source-authoring-leads.json','solution-histogram.de.png','solution-histogram.en.png','plot_solution.py'];(H/'solution-figure-bindings.json').write_text(json.dumps({'status':'AUTHOR_SOLUTION_FIGURES_ONLY_NOT_LEARNER_PROMPT','bindings':{name:sha(H/name) for name in files},'method':'Binomial bars from independently checked numerical table; no fitted or formal Normal-density curve; plot includes full display range0..35 and central integer bars8..22.','displayTailBoundary':'Full probability law remains0..250; no renormalisation of displayed bars.'},ensure_ascii=False,indent=2)+'\n');print('DE/EN figures and source bindings written')
