from pathlib import Path
import gzip,json,hashlib,tarfile
R=Path('/home/enpasos/projects/skillpilot');D=Path(__file__).resolve().parent;P=D.parent/'informatics-material-context-bound-candidate';W=Path('/dev/shm/informatics-material-context-20261107');O=Path('/dev/shm/informatics-e-reviewed-current-20261107');h=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
assert h(P/'seal.json')=='157269c7eec4805477c50e9fdd92f67488742b7a0ae11344489baa9c1886b6e2';assert h(P/'inventory.json')=='7802c03ee631d2ce023c7bd54ff31d22a6de999fa97c3cf73dcab8cc0fef7b49';inv=json.loads((P/'inventory.json').read_bytes())
for row in inv['payloads']:assert h(P/row['path'])==row['sha256'] and (P/row['path']).stat().st_size==row['bytes']
for name,seal in [('informatics-current-code-independent-review','f38fd7f6f2e18fe67c05a37e09a67c687fa02dcf41a03800b377b3c0134895a4'),('informatics-e-reviewed-current-definition-candidate','47ae9d47d191cb5144cefbe17bb6b235b82bf0eea9f6f946aeec84bd95fef513')]:
 p=D.parent/name;assert h(p/'seal.json')==seal;si=json.loads((p/'seal.json').read_bytes());assert h(p/'inventory.json')==si['inventorySha256']
 for row in json.loads((p/'inventory.json').read_bytes())['payloads']:assert h(p/row['path'])==row['sha256']
changes={r['path']:r for r in json.loads((P/'changed-files.json').read_bytes())['files']};delta=[]
for path,row in changes.items():
 assert h(W/'candidate'/path)==row['afterSha256'];assert (h(R/path) if (R/path).exists() else None)==row['activeBeforeSha256'];assert h(O/'native-code'/path if path.startswith('app/scripts/') else O/'candidate'/path)==row['predecessorSha256']
 if path.startswith(('app/scripts/','contracts/curriculum-assessment-coverage/')):assert h(W/'native-code'/path)==row['afterSha256']
 if row['afterSha256']!=row['predecessorSha256']:delta.append(row)
assert len(delta)==6;assert all(row['afterSha256']==row['predecessorSha256'] for row in changes.values() if row['path'].startswith(('curricula/','contracts/')))
for archive,expected in [('candidate-overlay.tar.gz',changes),('material-context-delta-overlay.tar.gz',{r['path']:r for r in delta})]:
 with tarfile.open(P/archive) as t:files={x.name:hashlib.sha256(t.extractfile(x).read()).hexdigest() for x in t.getmembers() if x.isfile()}
 assert files=={p:r['afterSha256'] for p,r in expected.items()}
f=json.loads(gzip.decompress((P/'input-pins-and-postguards.json.gz').read_bytes()))
for rel,sha in f['activeCodeInputs'].items():
 assert h(R/rel)==sha;assert h(W/'native-code'/rel)==(changes[rel]['afterSha256'] if rel in changes else sha)
for rel,sha in f['canonicalInputs'].items():assert h(R/rel)==sha and h(W/'candidate'/rel)==(changes[rel]['afterSha256'] if rel in changes else sha)
for rel,sha in f['parentFiles'].items():assert h(R/rel)==sha
oldgen=(O/'candidate/app/scripts/generateCurriculumQualityStatus.ts').read_text();newgen=(W/'candidate/app/scripts/generateCurriculumQualityStatus.ts').read_text();oldhelper=(O/'candidate/app/scripts/lib/retainedAssessmentCoverage.ts').read_text();newhelper=(W/'candidate/app/scripts/lib/retainedAssessmentCoverage.ts').read_text()
body=oldgen[oldgen.index('function normalizeExamTextForInspection'):oldgen.index('\nexport function evaluateExamTaskReadiness')];newbody=newhelper[newhelper.index('function normalizeExamTextForInspection'):newhelper.index('\n/** Only these exact fields')];assert body==newbody.replace('export function concreteExamReadinessIssues','function concreteExamReadinessIssues')
for a,b in [('const CURRENT_INFO_REVISION =','\n\nexport function createRetainedCoverageContext')]:assert oldhelper[oldhelper.index(a):oldhelper.index(b)]==newhelper[newhelper.index(a):newhelper.index(b)]
def maturity(s):return s[s.index('export function deriveCurriculumMaturity('):s.index('\nfunction ',s.index('export function deriveCurriculumMaturity('))]
assert maturity(oldgen)==maturity(newgen)
floor='app/scripts/checkCurriculumMaturityFloors.ts';assert (R/floor).read_bytes()==(W/'native-code'/floor).read_bytes()
r={'status':'PASS','candidatePayloads':len(inv['payloads']),'cumulativeOverlayFiles':len(changes),'deltaFiles':len(delta),'exactDeltaPins':delta,'activeCodeInputsVerified':len(f['activeCodeInputs']),'canonicalInputsVerified':len(f['canonicalInputs']),'predecessorAndOldReviewImmutable':True,'sourceViewsMaterialsCoverageIdentityArchivesRevisionAndFirstBindingsUnchanged':True,'existingReadinessFunctionMovedVerbatimExceptExport':True,'maturityFunctionUnchanged':True,'floorUnchangedSha256':h(R/floor),'sourceSha256':h(W/'candidate/curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_INFORMATIK.de.json'),'activeSourceSha256':h(R/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_INFORMATIK.de.json')}
(D/'input-verification.json').write_text(json.dumps(r,indent=2)+'\n');print(json.dumps({k:v for k,v in r.items() if k!='exactDeltaPins'},indent=2))
