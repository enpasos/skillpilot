import copy, datetime, hashlib, json
from pathlib import Path

O = Path(__file__).resolve().parent
B = O.parent
F = B/'current650-all-seven-current439-native-central-preparation-technical-a-v1/capsule'
N = O/'capsule'
Q = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/chemie-current439-AV-native-registry-root-v1')
C = Path('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json')
QA = Path('curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json')
def pin(p):
    p=Path(p);b=p.read_bytes()
    return {'path':str(p),'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def write(p,d):
    p=Path(p);p.parent.mkdir(parents=True,exist_ok=True)
    with p.open('x') as f: json.dump(d,f,ensure_ascii=False,indent=2);f.write('\n')
    json.loads(p.read_text())
    return pin(p)
def own_dir(p):
    if p==N: return
    own_dir(p.parent)
    if p.is_symlink():
        old=p.resolve(strict=True);p.unlink();p.mkdir()
        for child in old.iterdir(): (p/child.name).symlink_to(child,target_is_directory=child.is_dir())
    elif not p.exists(): p.mkdir()
    assert p.is_dir() and not p.is_symlink()
def overlay(rel,data):
    p=N/rel;own_dir(p.parent)
    if p.is_symlink(): p.unlink()
    else: assert not p.exists(),p
    p.write_bytes(data)
    return pin(p)

assert not N.exists(),'Never repeat an existing integration preparation'
N.mkdir()
for child in F.iterdir(): (N/child.name).symlink_to(child,target_is_directory=child.is_dir())
source_pins=[pin(F/C),pin(F/QA)]
hand=json.loads((F.parent/'HANDOFF.actual-current439-model-and-prepared-full-capsule.json').read_text())
source_config=Path(hand['preparedCentralConfig']['path'])
before=json.loads(source_config.read_text());after=copy.deepcopy(before)
s=after['subjects'][0];assert s['subject']=='chemie'
assert len(s['semanticAtomicityConfigPaths'])==75
assert len(s['resolutionIndexPaths'])==105
assert len(s['resolutionSupersessions'])==214
assert len(s['resolutionWithdrawals'])==7
aprep=json.loads((B/'9b-current-angle-atomicity-independent-c-v1/PREPARATION.post-FIRST.fresh-A1-and-exact-rest24.json').read_text())
assert aprep['firstDecisionSealedBeforeFingerprint'] and aprep['old9bFingerprintNotCopied']
assert aprep['current9bFingerprint']=='sha256:562e6873795ee31dc7eb1cc5b92faff6a243f8946059856eb8a7166c1618f864'
for role in ['retained24','new1']:
    e=json.loads((B/f'9b-current-angle-atomicity-independent-c-v1/{role}.stock-check.execution.json').read_text())
    assert e['exitCode']==0 and e['allInputsUnchanged']
a_files=[]
for x in aprep['configs']:
    src=Path(x['pin']['path']);assert pin(src)['sha256']==x['pin']['sha256'].removeprefix('sha256:')
    a_files.append(overlay(Path(x['relativePath']),src.read_bytes()))
for x in aprep['recordPins']:
    src=Path(x['path']);assert pin(src)['sha256']==x['sha256'].removeprefix('sha256:')
    a_files.append(overlay(src.relative_to(Path(aprep['physicalCheckCapsule'])),src.read_bytes()))
old_a='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-16/chemie-current437-paired-nine-five-gate-owner-integration-technical-20261016-v1/config/A-retained-009.original-review-identity.config.json'
old_refs=list(s['semanticAtomicityConfigPaths']);pos=old_refs.index(old_a)
new_refs=[x['relativePath'] for x in aprep['configs']]
s['semanticAtomicityConfigPaths']=old_refs[:pos]+new_refs+old_refs[pos+1:]
assert len(s['semanticAtomicityConfigPaths'])==76
assert [x for x in old_refs if x!=old_a]==[x for x in s['semanticAtomicityConfigPaths'] if x not in new_refs]

q_source=B/'9b-current-angle-image-targeted-root-review-v1/chemie.qa.stock-order-current-angle-image-revalidation.candidate.json'
assert pin(q_source)['sha256']=='bc2e35e0db01b675e1e1ab13f29e1819f40a715a17a5a96763dffd5848fb780f'
old_qa=json.loads((F/QA).read_text());new_qa=json.loads(q_source.read_text())
old_by_id={x['goalId']:x for x in old_qa['records']};new_by_id={x['goalId']:x for x in new_qa['records']}
assert old_by_id.keys()==new_by_id.keys()
assert [g for g in old_by_id if old_by_id[g]!=new_by_id[g]]==['9b56d01e-c2d7-51d8-b78e-237592c1ed20']
q_pin=overlay(QA,q_source.read_bytes())

# Preserve the actual scientific decisions and failed/successful targeted-check provenance.
proofs=[]
for folder,names in [
 ('9b-current-angle-atomicity-independent-c-v1',['FIRST.semantic-decision.independent-c.json','SEAL.FIRST.semantic-decision.sha256.json','PREPARATION.post-FIRST.fresh-A1-and-exact-rest24.json','retained24.stock-check.execution.json','retained24.stock-check.stdout.txt','new1.stock-check.execution.json','new1.stock-check.stdout.txt']),
 ('9b-current-angle-image-targeted-root-review-v1',['REVIEW.actual-current-angle-goal-and-unchanged-image.json','MEASUREMENT.actual-browser-render-sizes.json','EXECUTION.single-QA-stock-freshness.json','ADDENDUM.stock-record-order-and-byte-serialization.json','EXECUTION.stock-order-QA-freshness.json','CHECK.final-targeted-review-source-guards-and-stock-freshness.json'])]:
    for name in names: proofs.append(overlay(Q/'original-proof-bytes'/folder/name,(B/folder/name).read_bytes()))

after['reportId']='chemie-current439-AV-current-native-registry-root-v1'
new_config_rel=Q/'central.current439.A76.V-current.D105-original.private.config.json'
config_pin=write(N/new_config_rel,after)
sem=json.loads((N/s['semanticKindLedgerPath']).read_text())
expected={x['goalId'] for x in sem['decisions'] if x['semanticKind']=='curricularAtomic' and x['decisionStatus']=='authoritative'}
owners={};all_records=[]
for path in s['semanticAtomicityConfigPaths']:
    cfg=json.loads((N/path).read_text())
    records=[json.loads(line) for line in (N/cfg['reviewPath']).read_text().splitlines() if line.strip()]
    for row in records:
        owners.setdefault(row['goalId'],[]).append(path);all_records.append(row)
assert len(expected)==439
assert set(owners)==expected and all(len(v)==1 for v in owners.values())
assert len(all_records)==439
source_pins.append(pin(source_config))
for x in source_pins: assert pin(Path(x['path']))==x
assert {k:v for k,v in before['subjects'][0].items() if k!='semanticAtomicityConfigPaths'}=={k:v for k,v in s.items() if k!='semanticAtomicityConfigPaths'}
receipt={
 'role':'Guarded exact current439 AV successor; no changed descriptions or new D readiness assertion',
 'createdAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'sourceCapsule':str(F),'newCapsule':str(N),
 'sourcePinsStillExact':source_pins,'centralConfig':config_pin,'centralConfigRelativePath':str(new_config_rel),
 'AConfigCountBeforeAfter':[75,76],'oldA25OriginalUnchanged':True,'retained24OriginalLinesExact':True,
 'currentARecordCoverage':439,'currentAOwnerMultiplicityExactlyOne':True,'newActualAtomicityReviewCount':1,
 'newActualImageReviewCount':1,'originalQAUnchanged':True,'newQa':q_pin,'onlyQaGoalUpdated':'9b56d01e-c2d7-51d8-b78e-237592c1ed20',
 'aFiles':a_files,'actualProofBytes':proofs,'DIndicesSupersessionsWithdrawalsRetirementsUnchanged':[105,214,7,3],
 'currentCanonicalAndPAndSEMUnchanged':True,'fullCentralAfterAVIntegrationRun':False,'humanApproval':False,
 'M7Claim':False,'newFullFiveGateScientificClosuresCounted':0,'mainAndOriginalCapsulesWritten':False,
 'next':'Append only genuinely current paired nativeD results and guarded resolution chains; then one shared full central diagnosis.'}
out=write(O/'RECEIPT.current439-actual-A1-V1-integrated-original-D-preserved.json',receipt)
print(json.dumps({'receipt':out,'centralConfig':config_pin,'capsule':str(N),'aRecords':len(all_records),'duplicateOwners':0,'oldSourceWrites':0}))
