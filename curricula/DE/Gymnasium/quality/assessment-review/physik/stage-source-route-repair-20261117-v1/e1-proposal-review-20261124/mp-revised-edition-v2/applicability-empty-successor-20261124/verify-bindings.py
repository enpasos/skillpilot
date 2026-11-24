from pathlib import Path
import json,hashlib
base=Path(__file__).resolve().parent
root=next(p for p in base.parents if (p/'curricula/curriculum_manifest.json').is_file())
H=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
manifest=json.loads((base/'evidence-manifest.actual.json').read_text())
for row in manifest['files']:assert H(root/row['path'])==row['sha256'],row['path']
review=json.loads((base/'review.actual.json').read_text());probe=json.loads((base/'native-probe.actual.json').read_text())
oldPath=root/review['predecessorRawGoalPath'];newPath=base/'current-stop.goal.json'
assert H(oldPath)==review['predecessorRawGoalSha256'] and H(newPath)==review['successorRawGoalSha256']
a=json.loads(oldPath.read_text());b=json.loads(newPath.read_text());assert list(a)==list(b)
assert len(a['applicability']['jurisdiction'])==15 and b['applicability']=={}
assert 'applicability' in b
a.pop('applicability');b.pop('applicability');assert a==b
assert b['id']=='2b9e565f-d9b4-5e23-b5b7-b7977cecff06'
assert b['extendedData']=={'applicabilityProjection':'excluded','applicabilityMappingInheritance':'boundary'}
assert b['examData']['scoring']['maxPoints']==30 and b['examData']['scoring']['passingPoints']==18 and b['examData']['coveredGoalIds']==[]
r=probe['nativeApplicabilityComparison'];assert [x['goalId']for x in r['beforePhysicsAPV203']]==[b['id']] and r['afterPhysicsAPV203']==[]
assert r['beforeGoal']['compiledApplicability']==r['afterGoal']['compiledApplicability']=={}
assert r['all21CompiledGoalApplicabilityAndEvidenceEqual'] and r['allOtherFindingsEqual']
assert probe['nativeSemanticKindFingerprintBefore']==probe['nativeSemanticKindFingerprintAfter']=='sha256:9e04c1c5a3b2fce9a3e27c62daca2282d92b436ad6b8b0865565bc85f0b3d3c2'
assert probe['fullCurrentSemanticKindCheck']=={'status':'PASS','goals':863,'verifiedV9Context':True}
kinds=json.loads((base/'current-three-kind-fingerprints.actual.json').read_text());assert kinds['status']=='PASS' and len(kinds['rows'])==3
assert all(x['unchanged']and x['currentNativeFingerprint']==x['nativeSemanticKindSourceFingerprint']for x in kinds['rows'])
assert kinds['currentKindLedgerRawSha256']==probe['currentKindLedgerRawSha256'] and kinds['currentCanonicalRawSha256']==probe['currentCanonicalRawSha256']
replay=json.loads((base/'readonly-replay-check.actual.json').read_text());assert replay['exitCode']==0 and replay['actualOutput']['status']=='PASS'
assert probe['noWarningAllowlistAdded']and probe['noHistoricalRecordChanged']and not probe['newAssessmentPresent']and not probe['storedLearnerResultsWritten']
print('PASS: explicit{} archival successor differs only at/applicability; native APV2031→0, all21 compiled goal scopes/evidence and other findings unchanged, three SK fingerprints unchanged, current native863/863 kind check PASS. No old evidence or assessment performance changed.')
