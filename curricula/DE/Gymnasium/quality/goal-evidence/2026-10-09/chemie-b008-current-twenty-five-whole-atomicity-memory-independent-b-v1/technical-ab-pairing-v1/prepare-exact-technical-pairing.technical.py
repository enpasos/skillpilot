# SPDX-License-Identifier: Apache-2.0
from pathlib import Path
from datetime import datetime,timezone
import json,hashlib,copy
ROOT=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09');A=ROOT/'chemie-b008-current-twenty-five-whole-atomicity-memory-independent-a-v1';B=ROOT/'chemie-b008-current-twenty-five-whole-atomicity-memory-independent-b-v1';OWN=B/'technical-ab-pairing-v1'
def read(p):return json.loads(Path(p).read_bytes())
def rows(p):return [json.loads(x)for x in Path(p).read_text().splitlines()if x.strip()]
def bind(p):
 p=Path(p);b=p.read_bytes();return {'path':str(p),'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def write(name,x):
 p=OWN/name;p.open('x').write(json.dumps(x,ensure_ascii=False,indent=2)+'\n');return bind(p)
def exact(r):
 actual=bind(r['path']);assert actual['sha256']==r['sha256'].removeprefix('sha256:') and actual['bytes']==r['bytes'];return actual
def all_bindings(x):
 if isinstance(x,dict):
  if {'path','sha256','bytes'}<=x.keys():yield x
  else:
   for v in x.values():yield from all_bindings(v)
 elif isinstance(x,list):
  for v in x:yield from all_bindings(v)
now=datetime.now(timezone.utc).isoformat();ae=read(A/'completed-twenty-five-whole-AM-independent-a.integration-entry.json');be=read(B/'completed-twenty-five-whole-A-M.independent-b.review.entry.json')
assert bind(A/'completed-twenty-five-whole-AM-independent-a.integration-entry.json')['sha256']=='1b26f39b3cdf0412bb2a24c94930316044ffc7664bdeb22bed60272eacf50aa4';assert bind(B/'completed-twenty-five-whole-A-M.independent-b.review.entry.json')['sha256']=='9d8a2933b67846a7bd231d86a87bb10be48fc4e38a1510615e1f5ddcc8c5d71f'
actuals={}
for e in [ae,be]:
 for b in all_bindings(e):actuals[b['path']]=exact(b)
seal_paths=[A/'twenty-five-whole-A-M.actual-input.first.freeze.json',A/'twenty-five-whole-A-M.first.independent-A.freeze.json',A/'twenty-five-whole-AM-independent-a.final.freeze.json',B/'twenty-five-whole-A-M.independent-b.input.first.freeze.json',B/'twenty-five-whole-A-M.independent-b.first.freeze.json',B/'twenty-five-whole-A-M.independent-b.actual-final.freeze.json']
for p in seal_paths:
 for b in all_bindings(read(p)):actuals[b['path']]=exact(b)
input_binding=write('whole25-AM-A-B.actual-input.first.freeze.json',{'schemaVersion':1,'role':'Technical pairing intake of already independently firstsealed A/B materials; no new science verdict or active adoption','sealedAt':now,'entryA':bind(A/'completed-twenty-five-whole-AM-independent-a.integration-entry.json'),'entryB':bind(B/'completed-twenty-five-whole-A-M.independent-b.review.entry.json'),'actualEntryAndFirstFinalBoundFiles':list(actuals.values()),'bindingErrors':[],'freshScienceReview':False,'humanApproval':False,'strictGain':0,'activeWrites':[]})
# The real B M26+cards attempt had failed because origin decisions were outside scope.
# A new ordinary configuration adds the one literal1f line to the already valid relevant 80-record witness.
# It retains all 55 unchanged original card origins, seven current memory nodes and seven actual views.
oldcfg=read(B/'normal80-memory-actual25-and-existing55-card-origins.config.json');cfg=copy.deepcopy(oldcfg);gid='1f354a60-be44-512b-8f8b-f67c8c456035'
assert gid not in cfg['scope']['leafGoalIds'];cfg['scope']['leafGoalIds'].insert(25,gid);cfg['scope']['label']='Technical exact26 witness:25 independently firstsealed B records plus literal existing1f plus55 unchanged current card origins and7 memory nodes; no fresh science'
base_lines=(B/'normal80-memory-own25-and-exact55-card-origins.records.jsonl').read_bytes().splitlines(keepends=True)
reuse_lines=[l for l in (B/'normal26.memory.own25-plus-literal1f.records.jsonl').read_bytes().splitlines(keepends=True)if json.loads(l)['goalId']==gid];assert len(reuse_lines)==1
recordpath=OWN/'normal81-memory-exact25-plus1f-and55-card-origins.records.jsonl';recordpath.open('xb').write(b''.join(base_lines)+reuse_lines[0]);assert len(rows(recordpath))==81
cfg['reviewPath']=str(recordpath);cfg['reportPath']=str(OWN/'normal81-memory-current73cards-sevenviews.actual.report.md');write('normal81-memory-exact26-and-existing55-card-origins.config.json',cfg)
write('normal81-memory.exact-context-preparation.receipt.json',{'schemaVersion':1,'role':'Technical exact existing record/context witness, no generated review verdict','original80Config':bind(B/'normal80-memory-actual25-and-existing55-card-origins.config.json'),'new81Config':bind(OWN/'normal81-memory-exact26-and-existing55-card-origins.config.json'),'original80Records':bind(B/'normal80-memory-own25-and-exact55-card-origins.records.jsonl'),'new81Records':bind(recordpath),'first80LiteralLinesExact':recordpath.read_bytes().startswith(b''.join(base_lines)),'oneAddedLiteral1fLineSha256':hashlib.sha256(reuse_lines[0]).hexdigest(),'oneAdded1fFieldsUnchanged':True,'actualAllSevenVisibilityScopesUnchanged':cfg['visibilityScopes']==oldcfg['visibilityScopes'],'actualWholeCurrentCardReviewPathUnchanged':cfg['cardReviewPath']==oldcfg['cardReviewPath'],'actualLandscapeContextUnchanged':cfg['landscapePath']==oldcfg['landscapePath'],'oldFailedB_M25_M26ReceiptsPreserved':True,'newScientificDecisions':0,'humanApproval':False,'strictGain':0,'activeWrites':[]})
print(json.dumps({'inputFirst':input_binding,'exactBoundInputFiles':len(actuals),'ordinaryExact81Config':str(OWN/'normal81-memory-exact26-and-existing55-card-origins.config.json'),'ordinaryExact81Records':len(rows(recordpath))}))
