import json,hashlib
from datetime import datetime,timezone
from pathlib import Path
R=Path.cwd().resolve()
B=Path(__file__).resolve().parent.relative_to(R)
assert B.name=='biologie-he-q4-evolution-eighteen-whole-science-independent-b-20261008-v1'
def digest(p):return hashlib.sha256(p.read_bytes()).hexdigest()
first=B/'eighteen-whole-source-science-independent-b.first-judgment.freeze.json'
assert digest(first)=='ea101ffe0e68e97fd341aa063740270700be18439a822adcfd066a7da15601c6'
for item in json.loads(first.read_text())['files']:
    p=Path(item['path']);assert digest(p)==item['sha256'] and p.stat().st_size==item['bytes']
entry=B/'final-eighteen-whole-source-science-independent-b.portable.entry.json'
d=json.loads(entry.read_text())
for key in ['readableReview','finalPortableIntegrity','finalPortableIntegrityScript']:
    assert Path(d[key]).is_file()
assert json.loads(Path(d['finalPortableIntegrity']).read_text())['pass'] is True
output=B/'eighteen-whole-source-science-independent-b.final-portable.freeze.json'
assert not output.exists()
files=[{'path':str(p),'sha256':digest(p),'bytes':p.stat().st_size} for p in sorted(B.rglob('*')) if p.is_file()]
freeze={'schemaVersion':1,'sealedAt':datetime.now(timezone.utc).isoformat(),'kind':'independent-b-final-whole-source-science-portable-review','packetId':B.name,'entryPath':str(entry),'entrySha256':digest(entry),'authorInputFreezeSha256':'5c85c1f442a80caa01e4107eea1c8788e72b03df1256605a57e0fddc44c3462b','independentFirstJudgmentFreezeSha256':digest(first),'independentFirstJudgmentFilesStillByteExact':113,'currentPeerReviewsRead':0,'fileCount':len(files),'files':files,'wholeGoalCount':18,'wholeDEENCaseCount':36,'wholeNativeProfileCount':18,'wholeOriginalSourcePageCount':13,'scienceKEEP':18,'sourceOperationalizationConditionalKEEP':15,'sourceNamedEnrichmentHOLD':3,'sourceOperativeBindingsNotYetAccepted':18,'nativeRunsPassed':10,'canonicalCurricularAtomicDenominatorPreserved':391,'status':'needs_human_review','reviewAuthority':'ai_candidate','evidenceLevel':'E1','maximumClaimScope':'G1','actualImagesInspected':0,'newStrictClosures':0,'humanApproval':False,'humanTrial':False,'practicalLearnerEvidence':False,'activeWrites':0,'runtimeWrites':0,'scopeLimit':'No final current native D/P/V or raster/image acceptance; source rebind remains a real guarded schema-valid integration step.'}
with output.open('x') as f:json.dump(freeze,f,ensure_ascii=False,indent=2);f.write('\n')
actual=json.loads(output.read_text())
assert actual['fileCount']==len(actual['files'])
for item in actual['files']:
    p=Path(item['path']);assert p.is_relative_to(B)
    assert p.stat().st_size==item['bytes'] and digest(p)==item['sha256']
print(json.dumps({'finalFreeze':str(output),'sha256':digest(output),'fileCount':actual['fileCount'],'verified':True,'firstSealedFilesUnchanged':113,'entrySha256':digest(entry)},ensure_ascii=False))
