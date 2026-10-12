import csv,json,math,pathlib,hashlib
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
R=pathlib.Path('/home/enpasos/projects/skillpilot');B=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12/chemie-q4-thermodynamics-eleven-current402-P-A-source-author-20261012-v2';M=B/'cases/materials';M.mkdir(exist_ok=True)
def write(p,x):p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
x=np.linspace(0,80,16001);dens={T:2/math.sqrt(math.pi)*np.sqrt(x)/(.008314*T)**1.5*np.exp(-x/(.008314*T))for T in (300,450)}
tail=lambda T,E: math.erfc(math.sqrt(E/(.008314*T)))+2/math.sqrt(math.pi)*math.sqrt(E/(.008314*T))*math.exp(-E/(.008314*T))
a={(T,E):tail(T,E)for T,E in [(300,15),(450,15),(300,10)]}
with (M/'Boltzmann.normalized-energy-data.synthetic.csv').open('w')as f:
 w=csv.writer(f);w.writerow(['E_kJ_per_mol','f300_per_kJ_per_mol','f450_per_kJ_per_mol']);w.writerows(zip(x,dens[300],dens[450]))
for lang in ['de','en']:
 for typ in ['temperature','catalyst']:
  fig,ax=plt.subplots(figsize=(9,5.2),layout='constrained')
  for T in ([300,450]if typ=='temperature'else[300]):
   ax.plot(x,dens[T],label=f'{T} K',lw=2,color='#2366b4'if T==300 else'#b73c2c')
  for E,col in ([(15,'#734596')]if typ=='temperature'else[(15,'#734596'),(10,'#b76809')]):
   ax.axvline(E,label=f'Eₐ = {E} kJ/mol',ls='--',color=col)
   T=450 if typ=='temperature'else 300
   ax.fill_between(x,dens[T],where=x>=E,color=col,alpha=.13)
  ax.set(xlim=(0,30),ylim=(0,.22),xlabel='Energie E / (kJ mol⁻¹)'if lang=='de'else'Energy E / (kJ mol⁻¹)',ylabel='Normierte Dichte f(E) / (kJ mol⁻¹)⁻¹'if lang=='de'else'Normalised density f(E) / (kJ mol⁻¹)⁻¹')
  ax.grid(alpha=.2);ax.legend(loc='upper right');ax.set_title(('Berechnetes ideales Modell, keine Messung'if lang=='de'else'Calculated ideal model, not measured data')+'\n'+('Gleiche Teilchenzahl: ∫₀∞f(E)dE = 1'if lang=='de'else'Equal particle number: ∫₀∞f(E)dE = 1'))
  lab=(f'P(E≥15): 300 K = {a[300,15]:.5f}; 450 K = {a[450,15]:.5f}'if typ=='temperature'else f'300 K: P(E≥15) = {a[300,15]:.5f}; P(E≥10) = {a[300,10]:.5f}')
  ax.text(.99,.58,lab,transform=ax.transAxes,ha='right',fontsize=9,bbox=dict(facecolor='white',edgecolor='.8'));fig.savefig(M/f'Boltzmann.{typ}.{lang}.png',dpi=160);plt.close(fig)
v={'firstLaw_U_J':1200-350,'expansionWorkOn_J':-100000*.002,'expansion_U_J':500-200,'hessCO_kJmol':-393.5+283,'halfMolCO_kJ':(-393.5+283)*.5,'saltCaCl2_kJmol':-(40.555*4.18+25)*1.7/.005/1000,'saltHex_kJmol':(41.095*4.18+25)*.5/.005/1000,'Mg_kJmol':-(20.0243*4.18+25)*4.2/.001/1000,'NH4HCO3_kJmol':(20.0791*4.18+25)*.350/.001/1000,'neutralisation_Q_J':(40*4.18+20)*1.2,'neutralisation_kJmol':-(40*4.18+20)*1.2/.004/1000,'neutralisation_percentDifference':(57-56.16)/57*100,'methaneFormationH_kJmol':-393.5+2*(-241.8)-(-74.8),'bondBroken_kJmol':4*413+2*498,'bondFormed_kJmol':2*799+4*463,'cycle_Qout_J':1000-300,'cycle_Sres_JK':-1000/500+700/300,'singleReservoir_Sres_JK':-1000/500,'isothermalWork_J':8.314*300*math.log(2),'isothermalS_JK':8.314*math.log(2),'CaCO3S_JmolK':39.8+213.8-92.9,'CaCO3_0p2mol_S_JK':.2*(39.8+213.8-92.9),'CaCO3Ssur':-178300/298,'CaCO3Stotal':160.7-178300/298,'saltModel_Ssur_JmolK':-19680/293.15,'saltModel_Stotal_JmolK':80-19680/293.15,'saltModel_G_Jmol':19680-293.15*80,'dissolution_G_Jmol':20000-300*80,'freezing_G260_Jmol':-6000-260*(-22),'freezing_G290_Jmol':-6000-290*(-22),'freezing_Stotal260':-22+6000/260,'freezing_Stotal290':-22+6000/290,'statistical_S_JK':1.380649e-23*math.log(6),'RTln100_kJmol':8.314*298*math.log(100)/1000,'G_Q100_kJmol':-4.30+8.314*298*math.log(100)/1000,'K_298':math.exp(4300/(8.314*298)),'Tstar_K':178.3/.1607,'CaCO3G_298':178.3-298*.1607,'CaCO3G_1200':178.3-1200*.1607,'methaneFormationG_kJmol':-394.4+2*(-237.1)-(-50.8),'methaneQuarterMol_G_kJ':.25*(-394.4+2*(-237.1)-(-50.8)),'redoxG_Jmol':-2*96485*1.10,'redoxFromH_S_Jmol':-200347-298*40,'redoxIdealWork_J':2*96485*1.1*.01,'redoxLoadWork_J':2*96485*.85*.01,'redoxLostWork_J':2*96485*(1.10-.85)*.01,'RGT_10K_ratio':.025/.01,'RGT_20K_ratio':.0625/.01,'RGT_changedPrediction':.052*2.60,'coupledG_kJmol':15-30,'coupledS_JmolK':15000/300,'hexokinaseG_kJmol':14-31,'hexokinaseS_JmolK':17000/310,'peak300_kJmol':.008314*300/2,'peak450_kJmol':.008314*450/2,'etaNet_percent':840/802*100,'etaGross_percent':840/890*100,'waterCondensation_kJmol':(890-802)/2}
fuels={k:dict(netMJkg=net/m,grossMJkg=gross/m,massGramPerNetMJ=1000/net*m,costEURPerNetMJ=1000/net*m/1000*cost,directCO2gPerNetMJ=1000/net*co2)for k,m,gross,net,cost,co2 in [('H2',2,286,242,5,0),('CH4',16,890,802,1,44),('C',12,394,394,.3,44)]}
areas={f'T{T}_Ea{E}':dict(analyticalArea=p,analyticMethod='erfc(sqrt(Ea/RT))+2/sqrt(pi)*sqrt(Ea/RT)*exp(-Ea/RT)',numericTrapezoidTo80=float(np.trapz(dens[T][x>=E],x[x>=E])))for(T,E),p in a.items()}
write(B/'checks/scientific-arithmetic-and-actual-plot-calculations.json',dict(schemaVersion=1,syntheticFixture=True,actualCalculations=v,fuels=fuels,boltzmann=dict(areaMethod='analytical improper integral; CSV sampling at 0.005 kJ/mol to80',areas=areas,areaRatio10to15_300=a[300,10]/a[300,15],wholeAreaAnalytical=1,wholeAreaTrapezoidFinite={str(T):float(np.trapz(dens[T],x))for T in(300,450)},finiteRangeNotRenormalized=True),reportedRoundingConsistent=True,actualLabMeasurement=False))
casep=B/'cases/whole11.DEEN.cases-material-data-modelanswers-rubrics.json';p=B/'positive/P11.author.candidate-set.json';c=json.loads(casep.read_text());ps=json.loads(p.read_text());g='d4720a9a-65e2-5661-aaaa-c393d144419a'
for row in c['cases']:
 if row['goalId']!=g:continue
 typ='temperature'if row['case']['id']=='actual-boltzmann-curves'else'catalyst'
 row['boundMaterialFiles']=[str((M/f'Boltzmann.{typ}.{lang}.png').relative_to(R))for lang in('de','en')]+[str((M/'Boltzmann.normalized-energy-data.synthetic.csv').relative_to(R)),str((B/'checks/scientific-arithmetic-and-actual-plot-calculations.json').relative_to(R))]
 tailde=f' Konkrete Flächen: P300(E≥15)={a[300,15]:.5f}; P450(E≥15)={a[450,15]:.5f}.'if typ=='temperature'else f' Konkrete Flächen bei300 K: P(E≥15)={a[300,15]:.5f}; P(E≥10)={a[300,10]:.5f}; Verhältnis≈{a[300,10]/a[300,15]:.3f}.'
 tailen=tailde.replace('Konkrete Flächen','Concrete areas').replace('bei300 K','at300 K').replace('Verhältnis','ratio')
 for lang,t in [('De',tailde),('En',tailen)]:
  row['case']['expectedPerformance'+lang]+=t;row['modelAnswer'][lang.lower()]+=t;row['rubric']['fullCreditEvidence'+lang]+=t
 for goal in ps['goals']:
  if goal['goalId']!=g:continue
  for brief in goal['profile']['applicationCaseBriefs']:
   if brief['id']==row['case']['id']:brief.update(row['case'])
  for exp in goal['profile']['expectations']:
   if exp['id']=='expectation-'+row['case']['id']:
    exp['observablePerformanceDe']=row['case']['expectedPerformanceDe'];exp['observablePerformanceEn']=row['case']['expectedPerformanceEn']
write(casep,c);write(p,ps)
methods=B/'sources/primary-method-and-thermodynamic-reference-log.json';m=json.loads(methods.read_text());m['references'].append(dict(url='https://edu.rsc.org/experiments/the-rate-of-reaction-of-magnesium-with-hydrochloric-acid/1916.article',supports='Named gas-volume rate method and self-heating limitation. Temperature-controlled microscale task and all comparison values are explicitly own adaptations/synthetic fixtures.'));write(methods,m)
(B/'author/plot-and-calculate.py').write_bytes(pathlib.Path(__file__).read_bytes())
print(json.dumps(dict(arithmeticExpressions=len(v),fuelRows=len(fuels),plots=4,dataRows=len(x),areas=areas),indent=2))
