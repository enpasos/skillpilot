from pathlib import Path
from datetime import datetime,timezone
import json,hashlib,copy
root=Path.cwd(); base=Path('curricula/DE/Gymnasium/quality/goal-evidence'); own=base/'2026-10-07/chemie-next25-reviewed-integration-preparation-root-v1'; own.mkdir(exist_ok=False)
author=base/'2026-10-07/chemie-next25-orbital-nano-targeted-author-v3'; am=base/'2026-10-06/chemie-next25-current-atomicity-memory-impact-independent-a-v1'; one=base/'2026-10-07/chemie-next25-orbital-targeted-independent-a-v3'; mem=base/'2026-10-06/chemie-next25-regional-all-required-memory-placement-author-v3'; pb=base/'2026-10-06/chemie-next25-current-positive-profile-independent-b-v2/native-review-root/inputs'
def load(p):return json.loads(Path(p).read_text())
def write(p,obj):
 p=own/p;p.parent.mkdir(parents=True,exist_ok=True)
 with p.open('x') as f:f.write(json.dumps(obj,ensure_ascii=False,indent=2)+'\n')
def pin(p):
 p=Path(p);b=p.read_bytes();return {'path':str(p),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def lines(p):return Path(p).read_text().splitlines()
def recordLines(p):return [json.loads(x) for x in lines(p)]
def replaceOne(original,row,out):
 raw=lines(original); matches=[i for i,x in enumerate(raw) if json.loads(x)['goalId']==row['goalId']];assert len(matches)==1
 raw[matches[0]]=json.dumps(row,ensure_ascii=False,separators=(',',':'))
 (own/out).parent.mkdir(parents=True,exist_ok=True)
 with (own/out).open('x') as f:f.write('\n'.join(raw)+'\n')
 return {'source':pin(original),'new':pin(own/out),'changedGoalIds':[row['goalId']],'allOtherWholeRecordLinesExact':True}
regpath=Path('curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json');reg=load(regpath);s=next(s for s in reg['subjects'] if s['subject']=='chemie');canon=s['landscapePath'];kind=s['semanticKindLedgerPath'];orb='0acc8cd2-be6d-567e-a023-1d9e90475510';bc='3bc48951-025c-5144-99b1-924db611a5f9'
assert pin(canon)['sha256']=='sha256:4f3e7abaf7233c36b6e36a09ad2e03f1335dcb6d7fed6c1e7ec99fcca73751a6'
for path in [canon,kind,s['visualizationQaPath'],str(regpath),'curricula/DE/Gymnasium/input/BW/lower-secondary/source-extraction/DE_BW_CHEMIE_SEKI_BP2016_V2.source-extraction.json']:
 dest=own/'before'/path;dest.parent.mkdir(parents=True,exist_ok=True);dest.write_bytes(Path(path).read_bytes())
rows=load(am/'current25-native-A-M-fingerprints-and-prospective-deltas.actual.json')['records'];source={r['goalId']:r for r in rows};receipts=[]
for goal,name,record in [(bc,'quantum-rules',recordLines(am/'fixtures/a-candidate-one-fresh-independent-preview.review.jsonl')[0]),(orb,'orbitals',recordLines(one/'independent-a.final.atomicity.review.jsonl')[0])]:
 config=load(source[goal]['atomicityConfigPath']);sourceRecord=config['reviewPath'];newRecord=Path('atomicity')/(name+'.review.jsonl');receipts.append(replaceOne(sourceRecord,record,newRecord));config['reviewPath']=str(own/newRecord);config['reportPath']=str(own/'reports'/(name+'.atomicity.md'));write('atomicity/'+name+'.future-active.config.json',config)
 config['landscapePath']=str(author/'canonical.targeted-final-complete-alttext.candidate.json');write('atomicity/'+name+'.inert-candidate-check.config.json',config)
# Preserve independently reviewed 3bc Memory row, add the final independently reviewed orbital row.
record=recordLines(one/'independent-a.final.memory.review.jsonl')[0];receipts.append(replaceOne(mem/'full378-plus-reviewed-3bc-EN.memory.review.author-candidate.jsonl',record,Path('memory/current378.review.jsonl')))
config=load(mem/'full378-memory.future-active-config.author-candidate.json');config['reviewPath']=str(own/'memory/current378.review.jsonl');config['reportPath']=str(own/'reports/current378-memory.md');write('memory/current378-seven-real-scopes.future-active.config.json',config)
# Exactly retain the 24 valid independent B whole record lines; original 25-run/output bytes remain immutable and referenced, no fabricated new run.
config=load(pb/'independent-p.config.json');raw=lines(pb/'independent-p.records.jsonl');selected=[x for x in raw if json.loads(x)['goalId']!=orb];assert len(selected)==24
with (own/'positive24.exact-independent-b.review.jsonl').open('x') as f:f.write('\n'.join(selected)+'\n')
config['landscapePath']=canon;config['semanticKindLedgerPath']=kind;config['reviewCriteriaPath']='curricula/DE/Gymnasium/quality/goal-evidence/prompts/chemistry-positive-understanding-evidence-profile-criteria-v1.md'
assert pin(config['reviewCriteriaPath'])['sha256']==pin(pb/'criteria.md')['sha256']
config['reviewPath']=str(own/'positive24.exact-independent-b.review.jsonl');config['reviewRunManifestPaths']=[str(pb/'independent-p.run.json')];config['scope']['goalIds']=[i for i in config['scope']['goalIds'] if i!=orb];config['scope']['label']='24 current unchanged whole independent P-B record lines; orbital separately corrected and independently followed up; no new scientific run or Human Approval'
write('positive24.future-active.config.json',config)
config['landscapePath']=str(author/'canonical.targeted-final-complete-alttext.candidate.json');config['semanticKindLedgerPath']=str(author/'semantic-kinds.targeted-final-native-bindings.candidate.json');write('positive24.inert-candidate-check.config.json',config)
# Full current Ledger declarations unchanged; only routing and exact native source fingerprints follow the three actually changed goals.
ledger=load(author/'semantic-kinds.targeted-final-native-bindings.candidate.json');ledger['landscapePath']=canon;write('semantic-kinds.future-active.current479.json',ledger)
write('exact-native-reviewed-record-subset-and-targeted-replacement.receipt.json',{'role':'Root technical integrator, no extra science vote','atomicityAndMemoryTargetedReplacements':receipts,'whole24PositiveRecordLinesExact':True,'originalB25RunStillWholeHistorical':pin(pb/'independent-p.run.json'),'originalB25ActualWholeOutput':pin(pb/'independent-p.records.jsonl'),'newReviewRunClaim':False,'finalOrbitalPFollowupPending':True,'allFourRegionalViewBodiesStillInert':True,'sourceLocatorMetadataNotNewScience':True,'protectedWhole127StillActiveExact':True,'strictNetGain':0,'activeWrites':False,'humanApproval':False})
print('Inert integration preparation ready',own)
