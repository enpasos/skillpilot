"""Apache-2.0 technical transport. No active/Git/scientific-review writes."""
from pathlib import Path
import json,hashlib,copy,datetime
R=Path.cwd(); E=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12')
O=E/'chemie-polymers18-current231-inactive-normal-preparation-technical-20261013-v1'
S=E/'chemie-polymers-three-visual-Pscope-atomicity-author-successor-20261013-v3'
ISO=E/'chemie-polymers18-peer-input-isolation-technical-20261013-v1/REVIEW_INPUTS.independent18.isolated.json'
LIVE=Path('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json')
SEM=Path('curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json')
QA=Path('curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json')
REG=Path('curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json')
CENTRAL=E/'chemie-q4-eleven-final-frozen-V-source-native-root-20261012-v10/active-checks/central-after-eleven.actual.json'
def rd(p):return json.loads(p.read_text())
def h(p):return 'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest()
def wr(n,x):
 p=O/n;p.parent.mkdir(parents=True,exist_ok=True);assert not p.exists(),p;p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n');return p
assert not O.exists();O.mkdir(parents=True)
iso=rd(ISO);ids=iso['futureNativeReviewGoalIds'];held=iso['heldGoalIds'];assert len(ids)==18 and len(held)==2
for b in iso['scientificMandatoryInputBindings']:assert h(Path(b['path']))==b['sha256'],b['path']
base=rd(LIVE);assert len(base['goals'])==523;before=h(LIVE);candidate=copy.deepcopy(base);selected=rd(S/'selected20.resource-only-future-tuples.inactive.json');selectedby={g['id']:g for g in selected['goals']};asset=rd(S/'six.additive-resource-links-and-original-png-bindings.json');assetby={b['goalId']:b for b in asset['bindings']};baseby={g['id']:g for g in base['goals']}
for id in ids:
 wanted=copy.deepcopy(selectedby[id]);current=copy.deepcopy(baseby[id]);wanted.pop('resourceLinks',None);current.pop('resourceLinks',None);assert wanted==current,('scientific/body/graph drift',id)
for g in candidate['goals']:
 if g['id']in ids and g['id']in assetby:g['resourceLinks']=assetby[g['id']]['candidateResourceLinks']
changed=[g['id']for g in candidate['goals']if g!=baseby[g['id']]];assert set(changed)==set(assetby)and len(changed)==6
assert all(g==baseby[g['id']]for g in candidate['goals']if g['id']not in ids)
assert all(next(g for g in candidate['goals']if g['id']==id)==baseby[id]for id in held)
can=wr('candidate/canonical523.current402.six-resource-only.inactive.json',candidate)
# One shared full current-base canonical copy is required for normal baseline proof.
basepath=wr('baseline/canonical523.current402.actual-base.exact.json',base)
semantic=rd(SEM);assert semantic['counts']['curricularAtomic']==402
sem=copy.deepcopy(semantic);sem['sourceLandscapePath']=str(can);sp=wr('candidate/semantic523.current-decisions.inactive.json',sem)
base_sem=copy.deepcopy(semantic);base_sem['sourceLandscapePath']=str(basepath);bsp=wr('baseline/semantic523.current-decisions.base-path.json',base_sem)
qa=rd(QA);qa_candidate=copy.deepcopy(qa);oldqa={q['goalId']:q for q in qa['records']};now=datetime.datetime.now(datetime.timezone.utc).isoformat()
for b in asset['bindings']:
 row=next(q for q in qa_candidate['records']if q['goalId']==b['goalId']);link=b['candidateResourceLinks'][0]
 row.update(visualizationState='available',missingReason='',imageUrl=link['url'],publicAssetPath='app/public'+link['url'],canonicalAssetPath=b['generatorOriginalPath'],assetSha256=b['generatorOriginalSha256'],aiApproved='no',aiApprovedAssetSha256='',aiReviewedAt=None,aiReviewer='',aiNotes='Author replacement pending actual independent V6 decisions. Human and historical legacy fields retained without transferring approval to the new PNG.')
 for field in ['humanApproved','humanIssueIdentified','humanIssueDescription','humanReviewedAt','humanReviewer','umlautsCorrectChatGpt','contentApprovedChatGpt','chatGptReviewedAt','chatGptReviewer','chatGptNotes']:
  assert row.get(field)==oldqa[b['goalId']].get(field)
for q in qa_candidate['records']:
 if q['goalId']not in assetby:assert q==oldqa[q['goalId']]
qp=wr('candidate/QA.current-plus-six-pending-actualV.inactive.json',qa_candidate)
reg=rd(REG);subject=next(s for s in reg['subjects']if s['subject']=='chemie');central=next(s for s in rd(CENTRAL)['subjects']if s['subject']=='chemie');protected=central['strictCompleteGoalIds'];assert len(protected)==231 and not set(ids)&set(protected)
byid={};rawbindings=[];cache={}
for path in subject['positiveEvidenceConfigPaths']:
 c=rd(Path(path));scope=set(c['scope']['goalIds']);rp=c['reviewPath'];lines=cache.setdefault(rp,Path(rp).read_bytes().splitlines(keepends=True));hits=[]
 for line in lines:
  r=json.loads(line)
  if r['goalId']in set(protected)&scope:
   assert r['goalId']not in byid;byid[r['goalId']]=line;hits.append(r['goalId'])
 rawbindings.append(dict(configPath=path,configSha256=h(Path(path)),reviewPath=rp,reviewSha256=h(Path(rp)),protectedGoalIds=hits))
assert set(byid)==set(protected);p231=O/'positive/current231.actual-active.raw-exact.jsonl';p231.parent.mkdir();p231.write_bytes(b''.join(byid[i]for i in protected))
p18=O/'positive/P18.author.frozen-v3.raw-exact.jsonl';p18.write_bytes((S/'reviewable18.normal-v2.author-successor.jsonl').read_bytes());assert [json.loads(l)['goalId']for l in p18.read_bytes().splitlines()]==ids
mcpath=Path(subject['memoryReviewConfigPath']);mc=rd(mcpath);m402=Path(mc['reviewPath']);mrows=m402.read_bytes().splitlines(keepends=True);assert len(mrows)==402
mp=O/'memory/M402.current-raw-exact.jsonl';mp.parent.mkdir();mp.write_bytes(m402.read_bytes());card=Path(mc['cardReviewPath']);newmc=copy.deepcopy(mc);newmc.update(landscapePath=str(can),reviewPath=str(mp),reportPath=str(O/'checks/M402.normal.report.md'));wr('configs/M402.inactive.config.json',newmc)
necessity=rd(S/'reviewable18.atomicity-memory-necessity.author-retained.json');wr('memory/M18.goal-specific-author-necessity.retained.json',necessity)
baseconfig=rd(E/'chemie-q4-eleven-final-frozen-V-source-native-root-20261012-v10/configs/whole402.inactive.config.json');baseconfig.update(bookId='chemie-polymers18-current231-normal-base',title='Chemie – aktueller Gesamtumfang vor Polymer-Nachweisergänzung',landscapePath=str(basepath),semanticKindLedgerPath=str(bsp),goalVisualizationQaPath=str(QA),evidenceReviewPaths=[str(p231)],outputPath=str(O/'models/whole402.current231.normal-base.json'));wr('configs/whole402.normal-base.config.json',baseconfig)
candidateconfig=copy.deepcopy(baseconfig);candidateconfig.update(bookId='chemie-polymers18-current231-inactive-preparation',title='Chemie – achtzehn Polymerziele zur unabhängigen Prüfung',landscapePath=str(can),semanticKindLedgerPath=str(sp),goalVisualizationQaPath=str(qp),evidenceReviewPaths=[str(p231),str(p18)],outputPath=str(O/'models/whole402.current231-plus-author18.pending-V.normal.json'));wr('configs/whole402.inactive.config.json',candidateconfig)
pc=dict(schemaVersion=2,reviewId='chemie-polymers-six-visual40-rubric-author-successor-20261013-v3',goalFingerprintRuleVersion='goal-evidence-v1',profileRuleVersion='positive-understanding-evidence-v2',landscapeId=base['landscapeId'],landscapePath=str(can),semanticKindLedgerPath=str(sp),reviewCriteriaPath='curricula/DE/Gymnasium/quality/goal-evidence/prompts/chemistry-positive-understanding-evidence-profile-criteria-v1.md',reviewPath=str(p18),reviewedResourceTypes=['goal-visualization'],requireApproved=False,scope=dict(label='Inactive author18; genuine independent reviews pending',goalIds=ids));wr('configs/P18.author.inactive.config.json',pc)
after=h(LIVE);assert after==before
wr('checks/FIRST.current523-rowwise-six-merge-and-raw-retention.actual.json',dict(schemaVersion=1,preparedAtUTC=now,currentCanonicalBefore=before,currentCanonicalAfter=after,currentCanonicalPath=str(LIVE),sourceSemanticBinding=dict(path=str(SEM),sha256=h(SEM)),activeRegistryBinding=dict(path=str(REG),sha256=h(REG)),currentQaBinding=dict(path=str(QA),sha256=h(QA)),central231Binding=dict(path=str(CENTRAL),sha256=h(CENTRAL)),isolatedInputBinding=dict(path=str(ISO),sha256=h(ISO)),candidateCanonicalBinding=dict(path=str(can),sha256=h(can)),counts=dict(canonicalGoals=523,curricularAtomic=402,selected18=18,changedResourceOnly6=6,allOther505WholeGoalsExact=505,held2WholeGoalsAndCurrentEdgeExact=2,currentP231RawExact=231,authorP18RawExact=18,currentM402RawExact=402,currentCards75RawUnchanged=len(card.read_bytes().splitlines()),newScientificOrPeerVotes=0),changedGoalIds=changed,heldGoalIds=held,protected231GoalIds=protected,currentPInputBindings=rawbindings,memoryBindings=[dict(path=str(mcpath),sha256=h(mcpath)),dict(path=str(m402),sha256=h(m402)),dict(path=str(card),sha256=h(card))],QAChanges='Six images pending: historical human/legacy fields unchanged, AI approval cleared and not transferred',noActiveOrGitWrites=True,dcbad16MetadataAdoptionPendingCAS=True,finalNativeFreezeAllowed=False,reason='Root actualV6 decisions and final dcbad current-base CAS still required; no finalPDF/nativebundle created'))
print(json.dumps(dict(preparationRoot=str(O),canonical=523,atomic=402,selected=18,changed=6,other505Exact=True,P231rawExact=True,M402rawExact=True,QA6pending=True,finalNativeFreeze=False)))
