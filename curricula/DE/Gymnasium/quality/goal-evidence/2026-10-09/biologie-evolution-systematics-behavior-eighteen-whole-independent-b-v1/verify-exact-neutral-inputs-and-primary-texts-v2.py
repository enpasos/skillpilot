import json,hashlib,subprocess,re,datetime
from pathlib import Path
own=Path(__file__).parent
au=own.parent/'biologie-evolution-systematics-behavior-eighteen-whole-author-v1'
def load(p):return json.loads(Path(p).read_text())
def binding(p):
 p=Path(p);d=p.read_bytes();return {'path':str(p),'sha256':'sha256:'+hashlib.sha256(d).hexdigest(),'bytes':len(d)}
def verify(b):
 a=binding(b['path']);assert a['sha256'].removeprefix('sha256:')==b['sha256'].removeprefix('sha256:') and a['bytes']==b['bytes'],b['path'];return a
f=load(au/'input/whole-current18-source35-and-whole-partners30.exact-neutral-input.json')
mat=load(au/'eighteen-whole36-bilingual-cases-and-P.author-candidate.json')
can=load(f['canonicalSnapshot']['path']);goals={g['id']:g for g in can['goals']}
assert len(goals)==479
assert len(f['selectedGoalIds'])==18
for row,entry in zip(f['wholeCurrentGoalRows'],mat['entries']):
 assert row['wholeActiveGoal']==entry['wholeCurrentGoal']==goals[row['goalId']]
for r in f['wholeOriginalAndCurrentPartnerGoals']:
 assert r['wholeCurrentGoal']==r['wholeOriginalFrameGoal']==goals[r['goalId']]
sourcebindings=[verify(r['expected']) for r in f['sourceBindingsActual']]
rows=[]
for r in f['wholeOriginalSourceDutyRows']:
 m=load(r['mappingBinding']['path']);obj=m
 for k in r['decisionJsonPointer'].split('/')[1:]:obj=obj[int(k)] if isinstance(obj,list) else obj[k]
 assert obj==r['wholeOriginalDecision']
 ex=load(r['extractionBinding']['path']);source=next(g for g in ex['sourceGoals'] if g['id']==r['wholeResolvedSourceGoal']['id'])
 assert source==r['wholeResolvedSourceGoal']
 if r['wholeResolvedPassage'] is not None:assert next(p for p in ex['passages'] if p['id']==source['passageId'])==r['wholeResolvedPassage']
 edges=[e for e in m['mappings'] if e['legacyGoalId']==source['id']]
 assert edges==r['wholeOriginalMatchingEdges']
 assert set(r['wholeCanonicalPartnerGoalIds'])==set(e['canonicalGoalId'] for e in edges)
 rows.append({'rowId':r['rowId'],'decisionAndWholeSourceAndPassageAndAllEdgesExact':True,'partnerIds':r['wholeCanonicalPartnerGoalIds'],'wholeEdgeCount':len(edges)})
primary=[]
for r in load(au/'primary/ten-original-primary-topic-contexts.author-reading.receipt.json')['rows']:
 verify(r['originalPDF']);verify(r['actualWholeTopicText']);texts=[]
 for page in r['actualPhysicalPages']:
  p=subprocess.run(['pdftotext','-f',str(page),'-l',str(page),'-layout',r['originalPDF']['path'],'-'],capture_output=True,check=True)
  texts.append('ACTUAL PHYSICAL PDF PAGE '+str(page)+'\n'+p.stdout.decode().replace('\f','').strip()+'\n')
 text='\n'.join(texts);dest=own/(r['key']+'.independent-actual-primary-topic-text.txt')
 if dest.exists():assert dest.read_text()==text
 else:dest.write_text(text)
 normalize=lambda s:re.sub(r'\s+',' ',s).strip()
 primary.append({'key':r['key'],'originalPDF':r['originalPDF'],'physicalPages':r['actualPhysicalPages'],'ownActualExtraction':binding(dest),'normalizedActualPDFTextEqualsReadTopicText':normalize(text)==normalize(Path(r['actualWholeTopicText']['path']).read_text())})
assert all(r['normalizedActualPDFTextEqualsReadTopicText'] for r in primary)
old=load(f['centralStable276Report']['path']);bio=next(s for s in old['subjects'] if s['subject']=='biologie');mol=load(f['molecular23ExclusionBinding']['path']);protected=set(bio['strictCompleteGoalIds'])|set(mol['selectedGoalIds'])
assert len(protected)==299 and not protected.intersection(f['selectedGoalIds'])
checks=[]
def check(label,actual,expected):
 assert abs(actual-expected)<1e-7,(label,actual,expected)
 checks.append({'label':label,'ownComputedValue':actual,'expectedMaterialValue':expected,'equal':True})
for label,a,e in [('founder',14/20,.7),('origin',80/200,.4),('primates migration',.8*.2+.2*.8,.32),('kin rB-C',.5*3-1,.5),('nonkin rB-C',0*3-1,-1),('kin lowB',.5*1-1,-.5),('care dry intensive',4+1,5),('care dry low',2+4,6),('care wet intensive',6+1,7),('GA A energy',20-(4+2*1.5+1*2+2*2+1*.5),6.5),('GA B energy',18-(2+3*1.5+1*2+3*2+1*.5),3),('X',12-4-2*3,2),('Y',9-2-2*1,5),('XRisk',12-4-2*.5,7),('EA A energy',20-(4+2*1.5+1*2+3*2),5),('EA B energy',18-(2+3*1.5+2*2+3*2),1.5),('warning threat',16/20,.8),('warning control',4/20,.2),('clock cm life',100*3500/4600,76.08695652173913),('clock cm Cambrian',100*540/4600,11.73913043478261),('clock cm dinosaur',100*230/4600,5),('clock human mm',1000*.3/4600,.06521739130435),('day human seconds',86400*.3/4600,5.6347826087),('600my clockhumanmm',1000*.3/600,.5),('fossil young bound',1.8-.1,1.7),('fossil old bound',2.4+.1,2.5),('half life',1/(1+3),.25),('flow allele copies',80*2*.25+20*2*.75,70),('flow p',70/200,.35),('flow halfgametes',(80*.25+10*.75)/90,.30555555555556),('flow fresh',.9*.1+.1*.9,.18)]:check(label,a,e)
receipt={'schemaVersion':1,'role':'independent actual input/primary/finite numeric audit; no scientific approval inferred from equality','createdAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'input':binding(au/'input/whole-current18-source35-and-whole-partners30.exact-neutral-input.json'),'whole479Exact':True,'selected18AndWhole30PartnersExact':True,'protected299Disjoint':True,'sourceBindings26':sourcebindings,'wholeSourceRows35':rows,'primaryActualPDFExtractions10':primary,'finiteOwnNumericChecks':checks,'actualLearnerPerformance':False,'actualExperimentPerformed':False,'activeWrites':[],'strictGain':0}
(own/'exact-input-primary-and-finite-numeric-audit.actual.json').write_text(json.dumps(receipt,ensure_ascii=False,indent=2)+'\n')
print('actual receipt',binding(own/'exact-input-primary-and-finite-numeric-audit.actual.json'))
