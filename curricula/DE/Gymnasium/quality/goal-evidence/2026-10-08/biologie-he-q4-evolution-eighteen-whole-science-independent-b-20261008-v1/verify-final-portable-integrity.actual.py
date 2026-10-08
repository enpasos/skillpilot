import hashlib, json
from pathlib import Path
from datetime import datetime, timezone
R=Path.cwd().resolve()
B=Path(__file__).resolve().parent.relative_to(R)
assert str(B).startswith('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/biologie-he-q4-evolution-eighteen-whole-science-independent-b-20261008-v1')
def digest(p): return hashlib.sha256(p.read_bytes()).hexdigest()
def read(p): return json.loads(p.read_text())
def rows(p): return [json.loads(s) for s in p.read_text().splitlines() if s]
def strings(value):
    if isinstance(value,str): yield value
    elif isinstance(value,list):
        for item in value: yield from strings(item)
    elif isinstance(value,dict):
        for item in value.values(): yield from strings(item)
entry=read(B/'final-eighteen-whole-source-science-independent-b.portable.entry.json')
first=read(B/'eighteen-whole-source-science-independent-b.first-judgment.freeze.json')
assert digest(B/'eighteen-whole-source-science-independent-b.first-judgment.freeze.json')==entry['independentFirstJudgmentFreeze']['sha256']
assert first['fileCount']==len(first['files'])==113
for item in first['files']:
    p=Path(item['path']); assert p.is_relative_to(B)
    assert p.stat().st_size==item['bytes'] and digest(p)==item['sha256'],str(p)
author=read(B/'input-snapshots/eighteen-whole-science-native-P18-author-input.first.freeze.json')
assert digest(B/'input-snapshots/eighteen-whole-science-native-P18-author-input.first.freeze.json')==entry['inputAuthorFreeze']['sha256']
author_root=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/biologie-he-q4-evolution-eighteen-whole-science-author-20261008-v1')
assert author['fileCount']==len(author['files'])==100
for item in author['files']:
    p=B/'input-snapshots/author'/Path(item['path']).relative_to(author_root)
    assert p.stat().st_size==item['bytes'] and digest(p)==item['sha256'],str(p)
entry_paths=[]
for value in strings(entry):
    if value.startswith(str(B)+'/'):
        p=Path(value); assert p.is_file(),value; entry_paths.append(value)
configs=['P18.whole-original-independent-b.config.json','targeted-two-wording/P18.corrected.config.json','A18.retained-native.config.json','M18.retained-native.config.json','targeted-two-wording/A2.config.json','targeted-two-wording/M2.config.json']
operative_paths=[]
def config_refs(value):
    if isinstance(value,dict):
        for key,item in value.items():
            if key.endswith('Path') and key!='reportPath':
                if isinstance(item,str) and not item.startswith('http'): yield item
            else: yield from config_refs(item)
    elif isinstance(value,list):
        for item in value: yield from config_refs(item)
for name in configs:
    for path in config_refs(read(B/name)):
        p=Path(path); assert p.is_relative_to(B),path; assert p.is_file(),path
        operative_paths.append({'path':path,'sha256':digest(p)})
original=rows(B/'P18.whole-original-independent-b.review.jsonl')
corrected=rows(B/'targeted-two-wording/P18.corrected.review.jsonl')
ids=read(B/'P18.whole-original-independent-b.config.json')['scope']['goalIds']
assert len(ids)==len(set(ids))==len(original)==len(corrected)==18
assert [row['goalId'] for row in original]==[row['goalId'] for row in corrected]==ids
for row in original+corrected:
    assert row['status']=='needs_human_review' and row['reviewAuthority']=='ai_candidate'
    assert row['evidenceLevel']=='E1' and row['maximumClaimScope']=='G1'
    assert row['reviewRunIds']==[]
assert sum(len(row['profile']['applicationCaseBriefs']) for row in original)==36
changed=[]
for before,after in zip(original,corrected):
    assert before['profile']==after['profile'] and before['profileFingerprint']==after['profileFingerprint']
    if before['goalFingerprint']!=after['goalFingerprint']:
        assert before['reviewInputFingerprint']!=after['reviewInputFingerprint'];changed.append(before['goalId'])
    else: assert before['reviewInputFingerprint']==after['reviewInputFingerprint']
assert set(changed)=={'302c6d6d-bf10-5dbc-adda-65e4b5c63e49','35b016d8-ed2c-570c-ab64-ac39f8f962b2'}
source=read(B/'whole18-operative-source-decision-requirements.independent-b.json')['decisions']
assert [item['goalId'] for item in source]==ids
holds=[item['goalId'] for item in source if item['sourceRequiredWholeGoalDecision']=='HOLD_NAMED_ENRICHMENT_BINDING']
assert set(holds)=={'80b42b5f-4b20-5035-907f-974a4a88618b','28b4ae51-e3f7-5abc-a363-022114f50f0f','3accc03b-3daf-5119-9f33-93af6f709919'}
assert all(item['operativeDecision']=='HOLD_UNTIL_SCHEMA_VALID_SOURCE_REBIND' and not item['canBePresentedAsVerbatimOriginal'] for item in source)
assert len(entry['actualNativeReceipts'])==10
for receipt in entry['actualNativeReceipts']:
    actual=read(Path(receipt['receiptPath'])); assert actual['exitCode']==receipt['exitCode']==0
for item in entry['nativeValidatorBindings']:
    assert digest(Path(item['snapshotPath']))==item['sha256']
assert entry['counts']['canonicalCurricularAtomicDenominatorPreserved']==391
assert entry['currentPeerReviewsRead']==0
report={'schemaVersion':1,'checkedAt':datetime.now(timezone.utc).isoformat(),'pass':True,'authorFilesByteExact':100,'independentFirstSealedFilesByteExact':113,'firstSealSha256':entry['independentFirstJudgmentFreeze']['sha256'],'entryInternalExistingReferences':len(entry_paths),'operativeConfigPaths':operative_paths,'wholeGoals':18,'wholeDEENCases':36,'wholeNativeProfiles':18,'changedWholeGoalIds':changed,'unchangedProfileFingerprints':18,'sourceNamedEnrichmentHoldGoalIds':holds,'allOperativeSourceBindingsStillHeld':18,'nativeRunsPassed':10,'canonicalCurricularAtomicDenominatorPreserved':391,'currentPeerReviewsRead':0,'actualImagesInspected':0,'newStrictClosures':0,'humanApproval':False,'practicalLearnerEvidence':False,'limitation':'Portable artifact inspection and exact native-input bindings, not a standalone dependency installation or final D/P/V/image acceptance.'}
output=B/'final-portable-integrity.actual.json'
with output.open('x') as f: json.dump(report,f,ensure_ascii=False,indent=2);f.write('\n')
print(json.dumps({key:report[key] for key in ['pass','authorFilesByteExact','independentFirstSealedFilesByteExact','wholeGoals','wholeDEENCases','nativeRunsPassed','sourceNamedEnrichmentHoldGoalIds']},ensure_ascii=False))
