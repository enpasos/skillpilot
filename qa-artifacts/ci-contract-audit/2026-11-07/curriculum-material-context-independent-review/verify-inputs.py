from pathlib import Path
import gzip,json,hashlib,tarfile
R=Path('/home/enpasos/projects/skillpilot');D=Path(__file__).resolve().parent;P=D.parent/'curriculum-material-context-candidate';W=Path('/dev/shm/curriculum-material-context-20261107');h=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
assert h(P/'seal.json')=='e62888a070b607d3333be466dc6aa6d30e6ace7c019bfd2cb655331ccc790e2d';assert h(P/'inventory.json')=='4c1888cd8d06f9300df5e73befba05a72006fc8160c15ffc24a0f556c1ee512a';inv=json.loads((P/'inventory.json').read_bytes())
for row in inv['payloads']:assert h(P/row['path'])==row['sha256'] and (P/row['path']).stat().st_size==row['bytes']
for name,seal in [('informatics-current-code-independent-review','f38fd7f6f2e18fe67c05a37e09a67c687fa02dcf41a03800b377b3c0134895a4'),('informatics-material-context-independent-review','069ff6ca36b6a1c3f22ada543ea384d5d572506a1163e576b0f9b40ce23a3777')]:
 p=D.parent/name;assert h(p/'seal.json')==seal;si=json.loads((p/'seal.json').read_bytes());assert h(p/'inventory.json')==si['inventorySha256']
 for row in json.loads((p/'inventory.json').read_bytes())['payloads']:assert h(p/row['path'])==row['sha256']
changes={r['path']:r for r in json.loads((P/'changed-files.json').read_bytes())['files']}
for path,row in changes.items():
 assert h(W/'candidate'/path)==row['afterSha256'];assert (h(R/path) if (R/path).exists() else None)==row['beforeSha256']
 if path.startswith('app/scripts/'):assert h(W/'native-code'/path)==row['afterSha256']
assert len(changes)==8 and not any(p.startswith('curricula/') for p in changes)
with tarfile.open(P/'candidate-overlay.tar.gz') as t:files={x.name:hashlib.sha256(t.extractfile(x).read()).hexdigest() for x in t.getmembers() if x.isfile()}
assert files=={p:r['afterSha256'] for p,r in changes.items()}
f=json.loads(gzip.decompress((P/'input-pins-and-postguards.json.gz').read_bytes()))
for rel,sha in f['activeCodeInputFiles'].items():assert h(R/rel)==sha and h(W/'native-code'/rel)==(changes[rel]['afterSha256'] if rel in changes else sha)
for rel,sha in f['canonicalInputFiles'].items():assert h(R/rel)==sha and h(W/'candidate'/rel)==sha
for rel,sha in f['priorH1AndIndependentReviewFiles'].items():assert h(R/rel)==sha
for rel,sha in f['rawGermanCountercasePins'].items():assert h(Path('/dev/shm/root-german-material-scope-countercase-20261107')/rel)==sha and h(W/'prior-german-countercase'/rel)==sha
oldgen=(R/'app/scripts/generateCurriculumQualityStatus.ts').read_text();newgen=(W/'candidate/app/scripts/generateCurriculumQualityStatus.ts').read_text();oldhelper=(R/'app/scripts/lib/retainedAssessmentCoverage.ts').read_text();newhelper=(W/'candidate/app/scripts/lib/retainedAssessmentCoverage.ts').read_text()
def readiness(s):return s[s.index('function normalizeExamTextForInspection'):s.index('\n/**',s.index('export function concreteExamReadinessIssues'))]
assert readiness(oldhelper)==readiness(newhelper)
def maturity(s):return s[s.index('export function deriveCurriculumMaturity('):s.index('\nfunction ',s.index('export function deriveCurriculumMaturity('))]
assert maturity(oldgen)==maturity(newgen)
def info(s):return s[s.index('export function createRetainedCoverageContext'):].replace("contexts.set(context, { kind: 'retained', ",'contexts.set(context, { ')
assert info(oldhelper)==info(newhelper)
floor='app/scripts/checkCurriculumMaturityFloors.ts';assert (R/floor).read_bytes()==(W/'native-code'/floor).read_bytes()
r={'status':'PASS','candidatePayloads':len(inv['payloads']),'overlayFiles':len(changes),'exactCodePins':list(changes.values()),'activeCodeInputsVerified':len(f['activeCodeInputFiles']),'canonicalInputsVerified':len(f['canonicalInputFiles']),'previousIndependentReviewsImmutable':True,'sourceViewsMaterialsCoverageIdentityEdits':0,'existingReadinessFunctionAndHelpersUnchanged':True,'infoConstructorUnchangedExceptWeakMapKindTag':True,'maturityFunctionUnchanged':True,'floorUnchangedSha256':h(R/floor),'infoSourceSha256':h(R/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_INFORMATIK.de.json'),'germanSourceSha256':h(R/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_DEUTSCH.de.json')}
(D/'input-verification.json').write_text(json.dumps(r,indent=2)+'\n');print(json.dumps({k:v for k,v in r.items() if k!='exactCodePins'},indent=2))
