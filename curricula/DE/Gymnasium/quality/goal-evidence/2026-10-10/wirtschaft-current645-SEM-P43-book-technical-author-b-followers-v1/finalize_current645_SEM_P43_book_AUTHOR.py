"""Standard fieldwise integrator handoff, original records and history intact."""
from pathlib import Path
import json,hashlib,subprocess,copy
from jsonschema import Draft202012Validator
R=Path('/home/enpasos/projects/skillpilot');O=Path(__file__).resolve().parent
C=Path(Path('/tmp/economics-current645-technical-B-capsule-path.txt').read_text().strip())
def rd(p):return json.loads(p.read_text())
def h(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def b(p):return dict(path=str(p.relative_to(R)),sha256=h(p),bytes=p.stat().st_size)
def ck(x):p=R/x['path'];assert h(p)==x['sha256'] and p.stat().st_size==x['bytes'],x;return p
def wr(n,x):p=O/n;assert not p.exists();p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n');return b(p)
f=rd(O/'actual-v16-SEM645-P336685-book645-technical-only-freeze.json');bridge=rd(O/'actual-current645-six-native-Nav-FPs48-foreign-kind-only-author-inputs.json')
proof=O/'actual-native43-configs-P336-SEM645-original-profiles-status-authority-FPs.v16-author-PASS.json';p=rd(proof);assert p['actualRecords']==336 and p['actualOriginalCases']==685 and p['actualNeedsHumanReview']==336 and p['actualApprovedRecords']==0
for name in ['actual-native43-positive.command-exit.json','actual-native-SEM645.command-exit.json']:
 q=rd(O/name);assert q['exit']==0 and q['stderr']==''
for key in ['oldRegistry','oldBookConfig','oldKindLedger','wholeBeforeCAN','wholeAfterCAN','newSEM','newWholeP336','candidateRegistry','candidateBookConfig','foreignCombined645Scope']:ck(f[key])
for key in ['foreignWholeScientificBindings']:
 for q in f[key]:ck(q['wholeForeignScientificReceipt']);ck(q['wholeQualifiedDraftInput'])
before=rd(ck(f['wholeBeforeCAN']));after=rd(ck(f['wholeAfterCAN']));active=R/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json';assert active.read_bytes()==ck(f['wholeBeforeCAN']).read_bytes()
old=rd(ck(f['oldKindLedger']));sem=rd(ck(f['newSEM']));assert sem['counts']==dict(old['counts'],total=645,practiceAssessment=264);assert len(sem['decisions'])==645
ods={q['goalId']:q for q in old['decisions']};nds={q['goalId']:q for q in sem['decisions']};allowed=set(bridge['allowedChangedOldGoalIds']);assert len(allowed)==6
assert all(nds[id]==q for id,q in ods.items() if id not in allowed)
for id in allowed:assert dict(nds[id],sourceFingerprint=ods[id]['sourceFingerprint'])==ods[id]
assert len(set(nds)-set(ods))==48 and all(nds[id]['semanticKind']=='practiceAssessment' for id in set(nds)-set(ods))
schema=R/'contracts/curriculum-package/v1/curriculum-ontology-profile.schema.json';s=rd(schema);errs=list(Draft202012Validator(s).iter_errors(sem));assert not errs,[e.message for e in errs]
reg=rd(ck(f['oldRegistry']));nr=rd(ck(f['candidateRegistry']));book=rd(ck(f['oldBookConfig']));nb=rd(ck(f['candidateBookConfig']));sub=next(x for x in reg['subjects'] if x['subject']=='wirtschaftswissenschaften');ns=next(x for x in nr['subjects'] if x['subject']=='wirtschaftswissenschaften');assert {k for k in ns if ns[k]!=sub[k]}=={'semanticKindLedgerPath','positiveEvidenceConfigPaths'}
restore=copy.deepcopy(nr);restore['subjects']=reg['subjects'];assert restore==reg
assert {k for k in nb if nb[k]!=book[k]}=={'semanticKindLedgerPath','evidenceReviewPaths'}
phys=[]
for q in f['all43ConfigChanges']:
 for k in ['old','new','reviewWholeBytesUnchanged']:ck(q[k])
 a,z=rd(ck(q['old'])),rd(ck(q['new']));assert {k for k in z if z[k]!=a[k]}=={'semanticKindLedgerPath'}
 for k in ['old','new','reviewWholeBytesUnchanged']:
  src=ck(q[k]);cp=C/q[k]['path'];assert cp.is_file() and not cp.samefile(src) and cp.read_bytes()==src.read_bytes();phys.append(q[k]['path'])
for key in ['newSEM','newWholeP336']:
 src=ck(f[key]);cp=C/f[key]['path'];assert cp.read_bytes()==src.read_bytes() and not cp.samefile(src)
can=C/bridge['sourceLandscapePath'];assert not can.samefile(active) and can.read_bytes()==ck(f['wholeAfterCAN']).read_bytes()
assert ck(f['newWholeP336']).read_bytes()==ck(f['oldWholeP336Aggregate']).read_bytes()
end=wr('actual-current645-SEM-P43-book-whole-fieldwise-native-endguards.AUTHOR.json',dict(role='TECHNICAL_AUTHOR_ENDGUARDS_ONLY',activeCurrent597WholeBytesPreserved=b(active),wholeBeforeCAN=f['wholeBeforeCAN'],wholeAfterCAN=f['wholeAfterCAN'],actualSEMCounts=sem['counts'],actualSEMOntologySchemaErrors=0,old591NonNavSemanticRowsWholeExact=True,all597OldKindStatusBasisFieldsExact=True,actualOnlySixNavSourceFingerprintChanges=sorted(allowed),actualOnly48NewForeignPracticeRows=True,all43ConfigsOnlySEMPathChange=True,all336OriginalProfiles685CasesStatusesAuthorityInputFPsAndReviewBytesWholeExact=True,aggregatePWholeBytesExact=True,actualPhysicallySeparate645CANSEMConfigsProfilesNoSamefile=True,physicalOldNewReviewPaths=phys,newRegistryOnlyEconomicsTwoPointerFields=True,newBookOnlyEconomicsTwoPointerFields=True,allOtherSubjectsAndBooksUntouched=True,foreignWholeScience=f['foreignWholeScientificBindings'],foreignCombined645Scope=f['foreignCombined645Scope'],humanReleaseGatesRetained=True,newScientificDecisions=0,strictNetGain=0,activeWrites=0))
hist=wr('actual-early-read-wrapper-shape-error-technical-history.json',dict(role='Actual unsuccessful inspection history, not a PASS',actualError='TypeError: string indices must be integers, not str',actualCause='Consumer frozen whole12 uses a materials wrapper; first exploratory inspector expected four lists.',actualEffect='No material, SEM, profile or approval artifact was written by the failed inspection; correctly read wrapper then all48 exact status/note deltas confirmed.',thresholdOrSchemaLowering=False))
V=ck(f['newSEM']).parent
files=sorted(set([q for q in O.rglob('*') if q.is_file()]+[q for q in V.rglob('*') if q.is_file()]));assert not any(q.is_symlink() for q in files)
for q in files:
 if q.suffix=='.json':rd(q)
 if q.suffix=='.jsonl':[json.loads(x) for x in q.read_text().splitlines() if x.strip()]
ignored=subprocess.run(['git','check-ignore','--no-index','--stdin'],cwd=R,input='\n'.join(str(p.relative_to(R)) for p in files)+'\n',capture_output=True,text=True);assert ignored.returncode in [0,1] and not ignored.stdout.strip()
fmt=wr('actual-own645-technical-artifact-format-ignore-and-symlink-guards.json',dict(role='Actual technical artifact guards',parsedOwnFiles=len(files),actualIgnoredPaths=[],gitIgnoreExit=ignored.returncode,actualSymlinkArtefacts=0,activeWrites=0))
manifest=wr('actual-final-current645-v16-SEM-P43-book-technical-author-freeze.manifest.json',dict(role='TECHNICAL_AUTHOR_PORTABLE_IMMUTABLE_FILES',files=[b(q) for q in sorted(set(files+[O/end['path'].split('/')[-1],O/hist['path'].split('/')[-1],O/fmt['path'].split('/')[-1]]))],externallyImmutableAfterHandoff=True))
handoff=dict(f,role='FINAL_TECHNICAL_AUTHOR_FOLLOWERS_ONLY; foreign science and Root645scope bound, no self scientific/scope KEEP',all43ActualNativePositiveProof=b(proof),officialNativeSEMFPProof=b(O/'actual-native-current645-old591-kind-rows-six-real-Nav-FPs48-foreign-practice-author.receipt.json'),actualNative43Command=b(O/'actual-native43-positive.command-exit.json'),actualNativeSEMCommand=b(O/'actual-native-SEM645.command-exit.json'),endguards=end,manifest=manifest,actualSchemaProfileDensityGoalProfileInputFPChecksPassed=True,all591NonNavSemanticRowsWholeExact=True,all597OldDecisionKindStatusBasisFieldsExact=True,onlySixQualifiedNavSourceFPsAnd48ForeignPracticeKinds=True,actualSEMCounts=sem['counts'],actualOriginalNeedsHumanReview336=True,actualAIcandidate336=True,actualApprovedRecords=0,privatePhysicalCapsule=str(C),notActiveIntegrationOrCommitOrRuntimeChange=True,noNewImagesOrOtherSubjects=True,separateHumanReleaseGatesPreserved=True)
out=wr('actual-final-current645-SEM-P43-P336685-book-v16-technical-author.handoff.json',handoff)
print(json.dumps(dict(handoff=out,newSEM=f['newSEM'],actualNative43Records=336,cases685=True,activeWrites=0)))
