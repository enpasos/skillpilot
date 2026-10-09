import json,hashlib,datetime,math,subprocess
from pathlib import Path
ROOT=Path.cwd()
BASE=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09')
AUTHOR=BASE/'chemie-b008-kp-kc-actual-MV-primary-author-root-v1'
OWN=BASE/'chemie-b008-one-MV-KpKc-source-independent-a-v1'
entry_path=AUTHOR/'neutral-one-MV-KpKc-primary-clause-and-preserved-original-gas-goal.author-review.entry.json'
input_path=AUTHOR/'one-whole-KpKc-goal-actual-MV-clause-and-original-gas-partner.author-candidate.json'
x=json.loads(input_path.read_text())
def ref(p):
 p=Path(p);b=p.read_bytes();return dict(path=str(p),sha256=hashlib.sha256(b).hexdigest(),bytes=len(b))
checks=[]
def check(name,ok,details=None):
 checks.append(dict(name=name,pass_=bool(ok),details=details))
for r in x['actualInputs']:
 check('input exact bytes '+r['path'],ref(r['path'])==r)
canonical=json.loads(Path(x['actualInputs'][1]['path']).read_text())
extraction=json.loads(Path(x['actualInputs'][2]['path']).read_text())
mapping=json.loads(Path(x['actualInputs'][3]['path']).read_text())
for key in ['wholeCurrentProspectiveTarget','wholeOriginalPartner']:
 g=x[key];hits=[(i,a)for i,a in enumerate(canonical['goals'])if a['id']==g['id']]
 check(key+' exact current full goal',len(hits)==1 and hits[0][1]==g,{'canonicalPointer':'/goals/'+str(hits[0][0]) if hits else None})
sg=x['wholeOriginalSourceGoal'];sid=sg['id'];hits=[(i,a)for i,a in enumerate(extraction['sourceGoals'])if a['id']==sid]
check('whole original source clause exact',len(hits)==1 and hits[0][1]==sg,{'sourcePointer':'/sourceGoals/'+str(hits[0][0])if hits else None})
p=x['wholeOriginalPassage'];hits=[(i,a)for i,a in enumerate(extraction['passages'])if a['id']==p['id']]
check('whole original passage exact',len(hits)==1 and hits[0][1]==p,{'sourcePointer':'/passages/'+str(hits[0][0]) if hits else None})
check('old decision exact /decisions/60',mapping['decisions'][60]==x['wholeOriginalDecision'])
check('old wrong edge exact /mappings/268',mapping['mappings'][268]==x['wholeOriginalEdges'][0]['wholeOriginalEdge'])
gid=x['wholeOriginalPartner']['id']
other=[a for a in mapping['mappings']if a['canonicalGoalId']==gid and a['legacyGoalId']!=sid]
check('all 12 other original MV gas-goal mapping edges exact',other==x['allOtherOriginalGasPartnerMappingEdgesUnchanged'],{'count':len(other),'semanticsApproved':False})
check('proposed edge is precisely one partial KpKc contribution',x['proposedCurrentEdge']=={'legacyGoalId':sid,'canonicalGoalId':x['wholeCurrentProspectiveTarget']['id'],'matchType':'partial','reviewDecisionId':sid})
for n in [26,27]:
 actual=OWN/'source-reading'/f'MV-actual-physical-page-{n:03d}.independent.txt'
 supplied=AUTHOR/'primary'/f'MV-actual-physical-page-{n:03d}.txt'
 check(f'physical page {n} own whole extraction identical supplied primary text',actual.read_bytes()==supplied.read_bytes())
 txt=actual.read_text();check(f'physical page {n} printed folio',str(n-4) in txt)
text27=(OWN/'source-reading/MV-actual-physical-page-027.independent.txt').read_text()
check('actual page27 has ideal-gas derivation and explicit LK block',all(q in text27 for q in ['zusätzlich für den Leistungskurs','idealer Gase','abzuleiten']))
# These are independently computed reviewer checks, not authored P cases, learner work or an experiment.
R=0.08314462618;T=298.15;RT=R*T
# Stoichiometric exponents signed positive products/negative reactants.
model_inputs=[('2NO2 <=> N2O4',{'NO2':-2,'N2O4':1},{'NO2':0.2,'N2O4':0.08}),('N2O4 <=> 2NO2',{'N2O4':-1,'NO2':2},{'NO2':0.2,'N2O4':0.08}),('H2 + I2(g) <=> 2HI',{'H2':-1,'I2':-1,'HI':2},{'H2':0.2,'I2':0.1,'HI':0.3}),('CaCO3(s) <=> CaO(s) + CO2(g), gas quotient only',{'CO2':1},{'CO2':0.02})]
math_rows=[]
for name,nu,c in model_inputs:
 d=sum(nu.values());kc=math.prod(c[s]**v for s,v in nu.items());press={s:c[s]*RT for s in c};kp=math.prod(press[s]**v for s,v in nu.items());converted=kc*RT**d
 row=dict(reaction=name,gasExponents=nu,deltaNuGas=d,concentrations_mol_per_L=c,pressure_bar=press,R_L_bar_per_mol_K=R,temperature_K=T,dimensionalKc=kc,dimensionalKp=kp,derivedKp=converted,relativeError=abs(kp-converted)/max(abs(kp),1e-300),reviewerSyntheticCalculation=True)
 math_rows.append(row);check('independent quotient comparison '+name,math.isclose(kp,converted,rel_tol=1e-12),row)
 # Pick nonunit standards to test explicitly normalized dimensionless quotients.
 c0=0.5;p0=2.0
 kcn=math.prod((c[s]/c0)**v for s,v in nu.items());kpn=math.prod((press[s]/p0)**v for s,v in nu.items());derived=kcn*(RT*c0/p0)**d
 check('dimensionless standard-normalized comparison '+name,math.isclose(kpn,derived,rel_tol=1e-12),{'c0_mol_per_L':c0,'p0_bar':p0,'dimensionlessKc':kcn,'dimensionlessKp':kpn,'derived':derived})
check('reverse balanced reactions have reciprocal Kc/Kp',math.isclose(math_rows[0]['dimensionalKc']*math_rows[1]['dimensionalKc'],1.0)and math.isclose(math_rows[0]['dimensionalKp']*math_rows[1]['dimensionalKp'],1.0))
out={'schemaVersion':1,'role':'actual independent input and numerical model consistency checks; no new source/course/P approval','createdAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'entry':ref(entry_path),'wholeInput':ref(input_path),'checks':checks,'checkCount':len(checks),'errors':[a for a in checks if not a['pass_']],'mathematicalReviewInputsAreSynthetic':True,'actualLearnerWork':False,'physicalExperiment':False,'currentOrdinary395SourceAtlasValidated':False,'freshPeerOrAuthorVerdictsRead':False,'activeWrites':False,'strictGain':0}
(OWN/'actual-source-binding-and-independent-gas-quotient-countercheck.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'checks':len(checks),'errors':out['errors'],'RT':RT,'modelRows':math_rows},ensure_ascii=False,indent=2))
