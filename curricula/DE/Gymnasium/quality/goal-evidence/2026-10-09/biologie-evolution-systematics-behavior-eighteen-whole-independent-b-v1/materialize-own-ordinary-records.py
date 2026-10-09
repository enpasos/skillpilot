import json,datetime
from pathlib import Path
own=Path(__file__).parent;au=own.parent/'biologie-evolution-systematics-behavior-eighteen-whole-author-v1'
def load(p):return json.loads(p.read_text())
def write(p,x):assert not p.exists();p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
v=load(own/'eighteen-whole-science-source-P-A-M.independent-b.first.verdict.json');m=load(au/'eighteen-whole36-bilingual-cases-and-P.author-candidate.json');review='biologie-evolution-systematics-behavior-eighteen-independent-b-v1';stamp=datetime.datetime.now(datetime.timezone.utc).isoformat()
config=load(au/'eighteen-whole-positive.author-candidate.config.json');config['reviewId']=review;config['reviewPath']=str(own/'P18.independent-b.ordinary.review.jsonl');config['scope']['label']='Own independently read whole18 science/P candidate scope; no native/image/source or human approval';write(own/'P18.independent-b.ordinary.config.json',config)
candidates=[]
for e,j in zip(m['entries'],v['goals18']):
 reason='Own whole DE/EN goal, complete profile and two whole bilingual cases read before first seal. '+j['positiveUnderstanding']['expectationEvidence'][0]['actualEvidence']+' '+j['positiveUnderstanding']['expectationEvidence'][1]['actualEvidence']+' Decision: '+j['positiveUnderstanding']['decision']+'. Candidate only; no learner or physical experiment receipt.'
 dissent=['Whole-source/course, current images and native D/P remain separately pending; scope E1/G1 text/material candidate only.']
 dissent.extend(x['findingId']+': '+x['observation']+' Remedy: '+x['remedy'] for x in v['findings'] if x['goalId']==j['goalId'])
 candidates.append({'goalId':e['goalId'],'reason':reason,'evidenceLevel':'E1','maximumClaimScope':'G1','dissent':dissent,'profile':e['wholeProfile']})
write(own/'P18.independent-b.ordinary.candidate-set.json',{'schemaVersion':1,'authoringContract':'positive-understanding-evidence-candidates-v1','reviewId':review,'reviewedAt':v['reviewedAt'],'reviewer':'bio_science14_independent_b','goals':candidates})
for lane,rule in [('A','semantic-atomicity-v1'),('M','memory-card-review-v1')]:
 conf={'schemaVersion':1,'reviewId':review,'ruleVersion':rule,'landscapeId':config['landscapeId'],'landscapePath':config['landscapePath'],'reviewPath':str(own/(lane+'18.independent-b.ordinary.review.jsonl')),'scope':{'label':'Own whole18 goal-level '+lane+' judgments; no full card/deck/stage/visibility approval','leafGoalIds':config['scope']['goalIds']}}
 if lane=='M':
  conf['cardReviewPath']=str(own/'M18.scope-no-required-memory.empty.cards.review.jsonl')
  Path(conf['cardReviewPath']).write_text('')
 records=[]
 for j in v['goals18']:
  d=j['atomicity' if lane=='A' else 'memory'];record={'schemaVersion':1,'reviewId':review,'ruleVersion':rule,'landscapeId':config['landscapeId'],'goalId':j['goalId'],'fingerprint':'pending-own-completed-first-judgment-bookkeeping','status':d['status'],'reviewedAt':v['reviewedAt'],'reviewer':'bio_science14_independent_b','reason':d['reason']+' Own immutable first science judgment completed; no human approval and no full card/deck visibility review claim.'}
  record['semanticAtomic' if lane=='A' else 'memoryUseful']=d['semanticAtomic' if lane=='A' else 'memoryUseful']
  if lane=='A' and j['ordinal']==14:record['suggestedAction']=v['findings'][2]['remedy']
  records.append(record)
 Path(conf['reviewPath']).write_text(''.join(json.dumps(r,ensure_ascii=False)+'\n' for r in records))
 write(own/(lane+'18.independent-b.ordinary.config.json'),conf)
print('own P18/A18/M18 candidate metadata materialized from prior genuine first decisions; FP bookkeeping and ordinary checks pending')
