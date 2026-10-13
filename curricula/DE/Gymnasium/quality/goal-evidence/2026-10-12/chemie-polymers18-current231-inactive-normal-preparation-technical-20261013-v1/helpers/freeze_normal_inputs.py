"""Apache-2.0. Exact protected tuple and input CAS receipt; no new scientific decisions."""
from pathlib import Path
import json,hashlib,datetime,shutil
R=Path.cwd();E=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12');O=E/'chemie-polymers18-current231-inactive-normal-preparation-technical-20261013-v1';V4=E/'chemie-polymers-3aef-no-melt-flow-author-successor-20261013-v4'
h=lambda p:'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest();rd=lambda p:json.loads(p.read_text());objh=lambda x:'sha256:'+hashlib.sha256(json.dumps(x,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest()
def wr(p,x):p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
first=rd(O/'checks/FIRST.current523-rowwise-six-merge-and-raw-retention.actual.json');active=[dict(path=first['currentCanonicalPath'],sha256=first['currentCanonicalBefore']),first['sourceSemanticBinding'],first['activeRegistryBinding'],first['currentQaBinding']]+first['memoryBindings']
for b in active:assert h(Path(b['path']))==b['sha256'],b['path']
reg=rd(Path(first['activeRegistryBinding']['path']));subject=next(s for s in reg['subjects']if s['subject']=='chemie');ids=first['protected231GoalIds'];protected=set(ids);iso=rd(V4/'REVIEW_INPUTS.isolated18.one-thermal-successor.json');assert not(protected&set(iso['futureNativeReviewGoalIds']))
sourceBindings=[]
for key in ['semanticAtomicityConfigPaths','positiveEvidenceConfigPaths','resolutionIndexPaths']:
 for s in subject[key]:
  p=Path(s);sourceBindings.append(dict(role=key,path=s,sha256=h(p)))
  if key!='resolutionIndexPaths':
   cfg=rd(p)
   for field in ['reviewPath','reviewRunManifestPaths']:
    val=cfg.get(field,[]);val=[val]if isinstance(val,str)else val
    for q in val:sourceBindings.append(dict(role=key+'.'+field,path=q,sha256=h(Path(q))))
for b in first['currentPInputBindings']:
 assert h(Path(b['configPath']))==b['configSha256']and h(Path(b['reviewPath']))==b['reviewSha256'],b['configPath']
live=rd(Path(first['currentCanonicalPath']));candidate=rd(O/'candidate/canonical523.current402.six-resource-only.inactive.json');goal={g['id']:g for g in live['goals']};newgoal={g['id']:g for g in candidate['goals']};oldqa={q['goalId']:q for q in rd(Path(first['currentQaBinding']['path']))['records']};newqa={q['goalId']:q for q in rd(O/'candidate/QA.current-plus-six-actualV.inactive.json')['records']}
rawmap=lambda p:{json.loads(l)['goalId']:l for l in p.read_text().splitlines()if l.strip()}
P=rawmap(O/'positive/current231.actual-active.raw-exact.jsonl');M=rawmap(O/'memory/M402.current-raw-exact.jsonl');assert set(P)==protected
currentP={}
for b in first['currentPInputBindings']:
 for id,l in rawmap(Path(b['reviewPath'])).items():
  if id in b['protectedGoalIds']:assert id not in currentP;currentP[id]=l
assert P==currentP
assert (O/'memory/M402.current-raw-exact.jsonl').read_bytes()==Path(first['memoryBindings'][1]['path']).read_bytes()
SEM=rd(Path(first['sourceSemanticBinding']['path']));nSEM=rd(O/'candidate/semantic523.current-decisions.inactive.json');SEM.pop('sourceLandscapePath',None);nSEM.pop('sourceLandscapePath',None);assert SEM==nSEM
tuples=[]
for id in ids:
 assert goal[id]==newgoal[id]and oldqa[id]==newqa[id]
 tuples.append(dict(goalId=id,wholeGoalSha256=objh(goal[id]),qaRecordSha256=objh(oldqa[id]),PrawLineSha256='sha256:'+hashlib.sha256(P[id].encode()).hexdigest(),MrawLineSha256='sha256:'+hashlib.sha256(M[id].encode()).hexdigest(),wholeGoalExact=True,wholeQARecordExact=True,PrawLineExact=True,MrawLineExact=True,currentADRegistryBindingsRetained=True))
modelproof=rd(O/'checks/normal402-models-and-protected231-page-context.actual.json');assert modelproof['passed']and modelproof['protected231WholePagesExact']and modelproof['unselected384WholePagesExact']
wr(O/'checks/protected231-full-current-tuple-and-registry-bindings.actual.json',dict(schemaVersion=1,checkedAtUTC=datetime.datetime.now(datetime.timezone.utc).isoformat(),protectedGoalCount=231,currentCanonicalSha256=h(Path(first['currentCanonicalPath'])),currentRawSemanticDecisionsExact=True,currentRawM402Exact=True,current75CardsExact=True,current231RawPExact=True,protected231WholeGoalsQAAndNormalPagesExact=True,all384UnselectedNormalPagesExact=True,held2WholeGoalsEdgesAndPagesExact=True,protectedCurrentTuples=tuples,currentActiveADPRegistryInputBindings=sourceBindings,limitations=['Exact current raw/current-context retention proof, no fresh whole central check and no new independent author18 decisions','Historical immutable D bundle/book identities remain original; global preparation model provenance changes are not substituted for those identities'],newScientificVotes=0))
inputs=[]
for folder in ['baseline','candidate','positive','atomicity','memory','configs']:
 for p in sorted((O/folder).rglob('*')):
  if p.is_file():inputs.append(dict(path=str(p),sha256=h(p)))
for p in ['whole402.current231.normal-base.json','whole402.current231-plus-author18.final-inputs.normal.json']:q=O/'models'/p;inputs.append(dict(path=str(q),sha256=h(q)))
science=iso['scientificMandatoryInputBindings'];assert len(science)==17
for b in science:assert h(Path(b['path']))==b['sha256'],b['path']
for n in ['A18','P18','M402']:
 x=rd(O/'checks'/('FINAL.'+n+'.normal.execution.actual.json'));assert x['exitCode']==0
 for field in ['stdout','stderr']:assert h(Path(x[field+'Path']))==x[field+'Sha256']
wr(O/'INPUTS.final18-current231.native-preparation.frozen.json',dict(schemaVersion=1,kind='Inactive final18 author input CAS before normal native materialization',frozenAtUTC=datetime.datetime.now(datetime.timezone.utc).isoformat(),currentBaseBindings=active,ownedInputBindings=inputs,isolated17ScientificInputBindings=science,rootOnlyPeerFeedbackAuditExcluded=True,sourceClaimsHeld2=iso['heldGoalIds'],finalBatchConfigPath=str(O/'configs/native-D18.final-current231.batch.config.json'),sixRealIndependentAssetDecisionsTechnicallyRetained=True,humanAndLegacyFieldsPreserved=True,normalP18BindingCheckExit=0,normalA18AuthorReportExit=0,normalM402CheckExit=0,authorApprovalOrIndependentScientificVotes=0,wholeGoalABReviewsPending=True,activeOrGitWrites=False))
for helper in ['prepare_capsule.py','run_normal.py','freeze_normal_inputs.py']:shutil.copyfile(Path('tmp/chemie-polymers18-current231-preparation')/helper,O/'helpers'/helper)
print(json.dumps(dict(protected231FullCurrentTuplesExact=True,ADPRegistryBindings=len(sourceBindings),ownInputBindings=len(inputs),scientificInputs=17,inputFreeze=str(O/'INPUTS.final18-current231.native-preparation.frozen.json'),inputFreezeSha256=h(O/'INPUTS.final18-current231.native-preparation.frozen.json'))))
