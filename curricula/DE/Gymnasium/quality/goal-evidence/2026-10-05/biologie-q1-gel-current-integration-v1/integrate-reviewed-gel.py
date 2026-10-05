# Apache-2.0. Adopt the independently reviewed exact native candidate inputs.
import copy
import hashlib
import json
import shutil
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[7]
OWN = Path(__file__).resolve().parent
PREP = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/biologie-q1-gel-prospective-book-current-v1'
REGISTRY = ROOT / 'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'
GOAL = '8eb86a82-122d-5cae-8f80-bb2850b29c2f'
def sha(p):
    return 'sha256:' + hashlib.sha256(Path(p).read_bytes()).hexdigest()
def load(p):
    return json.loads(Path(p).read_text())
def put(p,x):
    Path(p).write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')

assert not (OWN/'operative-integration.actual.receipt.json').exists(), 'Already integrated'
freeze=load(PREP/'prepared.freeze.manifest.json')
for row in freeze['ownFiles']:
    path=ROOT/row['path']
    assert sha(path)==row['sha256'], path
future=load(PREP/'prepared-prospective-input-tree.receipt.json')['files']
for row in future:
    assert sha(ROOT/row['prospectiveCopyPath'])==row['sha256'], row['futureActivePath']

report=load(ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/biologie-q1-gel-source-current-candidate-v1/current-versus-prospective-book-bindings.actual.receipt.json')
assert report['currentStrictCount']==37 and report['affectedStrictPages']==[]
assert report['currentCurricularAtomic']==report['prospectiveCurricularAtomic']==363
index=load(PREP/'native-finalbook/resolution-index.json')
assert len(index['resolutions'])==1 and index['resolutions'][0]['goalId']==GOAL
positive=json.loads((OWN/'positive-evidence.review.jsonl').read_text())
assert positive['goalId']==GOAL and positive['status']=='needs_human_review' and positive['reviewAuthority']=='ai_candidate'
assert positive['profileFingerprint']=='sha256:df872e49d73ecdaad178e944167659cbe4c2df79befff6db7f3cf0bbc34fd554'
assert positive['goalFingerprint']=='sha256:6b1a4628773ecd79c837fb81cd066b1ebfb8eeea3d99ddb318f00cd8d706aa57'
old_canon=load(ROOT/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json')
new_canon=load(PREP/'prospective-input-tree/curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json')
assert len(old_canon['goals'])==len(new_canon['goals'])==441
assert [x for x in old_canon['goals'] if x['id']!=GOAL]==[x for x in new_canon['goals'] if x['id']!=GOAL]

before=load(REGISTRY);after=copy.deepcopy(before)
bio=next(s for s in after['subjects'] if s['subject']=='biologie')
bio['semanticAtomicityConfigPath']='curricula/DE/Gymnasium/quality/semantic-atomicity/biologie-q1-gel-current-20261005-v1/canonical-biology-full.config.json'
bio['memoryReviewConfigPath']='curricula/DE/Gymnasium/quality/memory-card-review/biologie-q1-gel-current-20261005-v1/canonical-biology-full.config.json'
new_index=str((PREP/'native-finalbook/resolution-index.json').relative_to(ROOT))
new_positive=str((OWN/'positive-evidence.config.json').relative_to(ROOT))
assert new_index not in bio['resolutionIndexPaths'] and new_positive not in bio['positiveEvidenceConfigPaths']
bio['resolutionIndexPaths'].append(new_index);bio['positiveEvidenceConfigPaths'].append(new_positive)
assert [s for s in before['subjects'] if s['subject']!='biologie']==[s for s in after['subjects'] if s['subject']!='biologie']

protected=[ROOT/f'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_{s}.de.json' for s in ['MATHEMATIK','PHYSIK','CHEMIE']]
protected_before=[{'path':str(p.relative_to(ROOT)),'sha256':sha(p)} for p in protected]
before_bindings=[]
for row in future:
    path=ROOT/row['futureActivePath'];exists=path.exists()
    before_bindings.append({'path':row['futureActivePath'],'sha256Before':sha(path) if exists else None,'sha256After':row['sha256'],'changed':not exists or sha(path)!=row['sha256']})
    if exists and sha(path)!=row['sha256']:
        dest=OWN/'before-active-inputs'/row['futureActivePath'];dest.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(path,dest)
shutil.copy2(REGISTRY,OWN/'registry.before-gel.snapshot.json')
put(OWN/'registry.prospective.json',after)
put(OWN/'operative-integration.preflight.json',{'status':'reviewed_preflight','goalId':GOAL,'expectedNewScientificClosures':1,'expectedRestoredStrictBindings':0,'all37OldStrictPageBindingsUnchanged':True,'other440GoalsUnchanged':True,'protectedInputs':protected_before,'inputs':before_bindings,'humanApprovalClaimed':False,'centralReportPending':True})

for row in future:
    target=ROOT/row['futureActivePath'];source=ROOT/row['prospectiveCopyPath']
    if not target.exists() or sha(target)!=row['sha256']:
        target.parent.mkdir(parents=True,exist_ok=True)
        assert not target.is_symlink(), target
        shutil.copy2(source,target)
put(REGISTRY,after)
for row in protected_before:
    assert sha(ROOT/row['path'])==row['sha256']
for row in future:
    assert sha(ROOT/row['futureActivePath'])==row['sha256']
put(OWN/'operative-integration.actual.receipt.json',{'integratedAtUTC':datetime.now(timezone.utc).isoformat(),'goalId':GOAL,'status':'actual_reviewed_inputs_integrated_central_pending','adoptedExactFutureInputs':len(future),'changedInputFiles':sum(r['changed'] for r in before_bindings),'newScientificClosuresExpected':1,'restoredBindingsExpected':0,'centralReportPending':True,'humanApprovalClaimed':False,'registryBeforeSha256':sha(OWN/'registry.before-gel.snapshot.json'),'registryAfterSha256':sha(REGISTRY),'otherSubjectRegistryEntriesUnchanged':True,'all37OldStrictPageBindingsUnchanged':True,'protectedInputs':protected_before})
print('Integrated reviewed exact Gel target/source/PNG/QA/A/M/D/P bindings. All other goals and protected subject registry entries preserved; central report pending.')
