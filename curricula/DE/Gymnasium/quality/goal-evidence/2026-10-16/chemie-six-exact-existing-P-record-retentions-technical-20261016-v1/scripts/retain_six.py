import hashlib
import json
import shutil
from pathlib import Path

REPO = Path('/home/enpasos/projects/skillpilot')
ROOT = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-16/chemie-six-exact-existing-P-record-retentions-technical-20261016-v1')
REPORT = Path('tmp/chemie-m7-resumed-20261016/remaining21-existing-P-reuse-readonly/REPORT.existing-P-reuse-for21.readonly.json')
HOST = Path('tmp/chemie-m7-resumed-20261016/current578-one-sparse-own-host-v1')
EXPECTED_REPORT = 'c37e0385edd8d3353e6ccadf5bcdc431a775e86aa75ab98cdfe46e122ed6381d'

def sha(b): return 'sha256:' + hashlib.sha256(b).hexdigest()
def pin(p):
    p=Path(p); b=p.read_bytes()
    return {'path':str(p),'sha256':sha(b),'bytes':len(b)}
def read(p): return json.loads(Path(p).read_text())
def write(rel,x):
    p=ROOT/rel; p.parent.mkdir(parents=True,exist_ok=True)
    p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
def copy_exact(source,relative):
    dest=ROOT/relative;dest.parent.mkdir(parents=True,exist_ok=True)
    assert not dest.exists(),dest
    dest.write_bytes(Path(source).read_bytes())
    assert dest.read_bytes()==Path(source).read_bytes()
    return pin(dest)

assert hashlib.sha256(REPORT.read_bytes()).hexdigest()==EXPECTED_REPORT
report=read(REPORT)
groups=[
 ('q3-original-b-four','curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12/chemie-q3-thirteen-current402-targeted-independent-b-20261012-v3/positive/P13.independent-b.inactive.config.json',{'20f92ba0-f7f4-5407-bb96-07e30da9002f','3ce81f96-4fbb-5022-88b7-337a000315ed','56bc6377-1291-58bc-b433-5b9f673888e9','93b914d4-747d-5b22-90ff-ac6320514b44'}),
 ('q2-original-b-one','curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12/chemie-q2-naturstoffe-current407-independent-b-20261012-v2/positive/P29.independent-b.inactive.config.json',{'c245d5fd-ce46-5b45-ab2e-e610547b5f7c'}),
 ('d8-original-one','curricula/DE/Gymnasium/quality/goal-evidence/canonical-chemistry-positive-understanding-evidence-b004r-d8-current-png-v3.config.json',{'d8bdf486-7295-5393-b6f7-54f6e485c848'}),
]
inputs=[pin(REPORT)];origins=[];configs=[];allids=set();copies=[]
for label,configpath,ids in groups:
    c=read(configpath);inputs.append(pin(configpath));inputs.append(pin(c['reviewPath']))
    source=Path(c['reviewPath']);selected=[];scope=[]
    for line_no,line in enumerate(source.read_bytes().splitlines(keepends=True),1):
        if not line.strip():continue
        r=json.loads(line)
        if r['goalId'] not in ids:continue
        assert r['reviewId']==c['reviewId']
        checked=next(x for x in report['rows'] if x['goalId']==r['goalId'])
        assert checked['reuseDisposition']=='EXACT_EXISTING_REVIEWED_P_BODY_AND_INPUT'
        exact=next(x for x in checked['wholeProfileAndBindingReferences'] if x['source']['path']==str(source))
        assert exact['currentGoalFingerprintExact'] and exact['currentReviewInputFingerprintExact'] and exact['profileSelfFingerprintExact']
        selected.append(line);scope.append(r['goalId'])
        origins.append({'goalId':r['goalId'],'source':pin(source),'sourceLine':line_no,'exactWholeLineSha256IncludingOriginalTerminator':sha(line),'originalReviewId':r['reviewId'],'originalReviewRunIds':r['reviewRunIds'],'originalCriteriaFingerprint':r['reviewCriteriaFingerprint'],'originalGoalFingerprint':r['goalFingerprint'],'originalReviewInputFingerprint':r['reviewInputFingerprint'],'originalProfileFingerprint':r['profileFingerprint'],'status':r['status'],'reviewAuthority':r['reviewAuthority'],'evidenceLevel':r['evidenceLevel'],'maximumClaimScope':r['maximumClaimScope'],'retainedRecordPath':str(ROOT/f'records/{label}.whole-original-lines.jsonl'),'retainedLine':len(selected),'byteExact':True,'scientificJudgmentUnchanged':True})
    assert set(scope)==ids and not(allids&ids)
    allids|=ids
    record=ROOT/f'records/{label}.whole-original-lines.jsonl';record.parent.mkdir(parents=True,exist_ok=True)
    assert not record.exists()
    record.write_bytes(b''.join(selected))
    for original_line,new_line in zip(selected,record.read_bytes().splitlines(keepends=True),strict=True):assert original_line==new_line
    criteria=copy_exact(c['reviewCriteriaPath'],f'criteria/{label}.whole-original.md');copies.append({'origin':pin(c['reviewCriteriaPath']),'copy':criteria,'byteExact':True});inputs.append(pin(c['reviewCriteriaPath']))
    runpaths=[]
    for j,original in enumerate(c.get('reviewRunManifestPaths',[]),1):
        cp=copy_exact(original,f'original-runs/{label}.{j}.whole-original.run.json');runpaths.append(cp['path']);inputs.append(pin(original));copies.append({'origin':pin(original),'copy':cp,'byteExact':True,'wholeOriginalManifestPreserved':True})
    current={**c,'landscapePath':'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json','semanticKindLedgerPath':'curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json','reviewCriteriaPath':criteria['path'],'reviewPath':str(record),'reviewRunManifestPaths':runpaths,'scope':{'label':'Technical byte-exact retention of original genuine P rows for current578; no new scientific review or human approval','goalIds':scope}}
    write(f'config/{label}.current578.exact-retention.config.json',current)
    configs.append({'label':label,'path':str(ROOT/f'config/{label}.current578.exact-retention.config.json'),'reviewId':c['reviewId'],'goalIds':scope,'recordPath':str(record),'originalConfig':pin(configpath),'runManifestsWholeAndUnchanged':runpaths})

assert len(allids)==6
p19_path=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-16/chemie-nineteen-current-normal-P-bindings-technical-20261016-v1/P19.current-resource-bindings.config.json')
p19=read(p19_path);inputs.append(pin(p19_path));assert not allids.intersection(p19['scope']['goalIds'])
counterreview='curricula/DE/Gymnasium/quality/goal-evidence/2026-09-30/chemistry-b004r-b005-independent-p-review-v1/review.json'
cp=copy_exact(counterreview,'original-science/d8.whole-original-independent-counterreview.json');inputs.append(pin(counterreview));copies.append({'origin':pin(counterreview),'copy':cp,'byteExact':True,'meaning':'Original independent P-body-sound/source-route-HOLD preserved, not a new review or closure.'})
write('ORIGIN.six-whole-byte-exact-original-P-lines.json',{'role':'Technical original-row reselection only; no profile, review identity, scientific status or historical claim changed','reuseReport':pin(REPORT),'recordCount':6,'configCount':3,'grouping':'Three original reviewIds; complete scope6, disjoint fromP19','goalIds':sorted(allids),'P19ScopeDisjoint':True,'rows':origins,'wholeOriginalCopies':copies,'newScienceVotes':0,'newProfiles':0,'HumanApproval':False,'HumanTrial':False})
write('INPUTS.finite-original-P-config-record-criteria-and-run-pins.json',{'role':'Finite actual source pins; no hashes-as-science inference','pins':inputs})
write('CONFIGS.six-goals-three-original-reviewIds.current578.selector.json',{'role':'Exact existing P row retention config selector; no new science or Central closure','currentSemanticDenominator':429,'scopeCount':6,'configCount':3,'configs':configs,'newReviewIdCount':0,'newRunManifestCount':0,'P19ScopeDisjoint':True,'HumanApproval':False,'HumanTrial':False})

hostroot=HOST/ROOT
assert not hostroot.exists() and not hostroot.is_symlink()
for parent in hostroot.parents:
    if parent==HOST.parent:break
    assert not parent.is_symlink(),parent
shutil.copytree(ROOT,hostroot)
assert hostroot.resolve()==(REPO/hostroot).resolve() and not hostroot.is_symlink()
for p in hostroot.rglob('*'):
    assert not p.is_symlink(),p
print(json.dumps({'scope':6,'configs':3,'reviewIdsPreserved':True,'wholeLinesByteExact':True,'wholeOriginalRunManifestsCopied':2,'newScienceVotes':0,'hostBranchPhysical':True,'selector':pin(ROOT/'CONFIGS.six-goals-three-original-reviewIds.current578.selector.json')},ensure_ascii=False,indent=2))
