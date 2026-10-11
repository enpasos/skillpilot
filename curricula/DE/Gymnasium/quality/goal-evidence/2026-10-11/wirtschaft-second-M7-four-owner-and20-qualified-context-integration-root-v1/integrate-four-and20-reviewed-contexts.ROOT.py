from pathlib import Path
from datetime import datetime, timezone
import copy, hashlib, json, os

R = Path('/home/enpasos/projects/skillpilot')
Q = R / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-11'
O = Path(__file__).parent
F = Q / 'wirtschaft-four-current-D56-native-owner-context-scoping-AUTHOR-INERT-c-v1/current-root-P15-QA346-qualified-native-followers-v2'
REG = R / 'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'
def sha(b): return 'sha256:' + hashlib.sha256(b).hexdigest()
def obj(p): return json.loads(p.read_text())
def bind(p): return {'path': str(p.relative_to(R)), 'sha256': sha(p.read_bytes())}
before_bytes = REG.read_bytes()
assert sha(before_bytes) == 'sha256:0128dc4b54d237bf57c5c6827bcbe1597b774f52a60a348003e6d1d144b11fbb'
before = json.loads(before_bytes)
candidate_path = F / 'candidate-current-four-owner-only-Root09-registry49-prefix105.INERT-v3.config.json'
candidate_bytes = candidate_path.read_bytes()
assert sha(candidate_bytes) == 'sha256:f701e0df2062efb227badca4396151f35a1b45cf99acad3492a4965bacb9f62f'
candidate = json.loads(candidate_bytes)
old = next(s for s in before['subjects'] if s['subject'] == 'wirtschaftswissenschaften')
new = next(s for s in candidate['subjects'] if s['subject'] == 'wirtschaftswissenschaften')
assert len(before['subjects']) == len(candidate['subjects'])
assert all(x == y for x, y in zip(before['subjects'], candidate['subjects']) if x['subject'] != 'wirtschaftswissenschaften')
assert {k:v for k,v in old.items() if k not in ('resolutionIndexPaths', 'resolutionSupersessions')} == {k:v for k,v in new.items() if k not in ('resolutionIndexPaths', 'resolutionSupersessions')}
assert new['resolutionIndexPaths'][:45] == old['resolutionIndexPaths'] and len(new['resolutionIndexPaths']) == 49
assert new['resolutionSupersessions'][:101] == old['resolutionSupersessions'] and len(new['resolutionSupersessions']) == 105
checks = obj(O / '01-actual-native-four-owner-and20-context-candidate-nonloss-qualified-checks.receipt.json')
assert all(c['exitCode'] == 0 for c in checks['nativeChecks']) and len(checks['nativeChecks']) == 6
assert checks['before'] == 225 and checks['candidate'] == 246 and checks['lostGoalIds'] == []
actual = obj(F / 'actual-current4-final-native-group-configs-original-criteria-parity.INERT.json')
whitelist = {'campaignId', 'roundId', 'bundleFingerprint', 'bookDigest', 'pageFingerprint'}
parity = []
for group in actual['groups']:
    out, hist = R / group['outputDirectory'], R / group['exactWholeScienceHistoryDirectory']
    for label, role in [('round-a','first'), ('round-b','second')]:
        old_input, new_input = obj(hist / label / 'description-review-input.json'), obj(out / label / 'description-review-input.json')
        new_records = [json.loads(l) for p in (out / label / 'results').glob('*.records.jsonl') for l in p.read_text().splitlines() if l.strip()]
        for goal_id in group['goalIds']:
            source = next(x for x in group['originalPairs'][goal_id]['existingIndependentRounds'] if x['round'] == role)
            raw = next(l.rstrip(b'\r') for l in (R / source['actualResults']['path']).read_bytes().split(b'\n') if l.strip() and json.loads(l)['goalId'] == goal_id)
            assert sha(raw) == source['actualRecordDigest']
            old_record, new_record = json.loads(raw), next(x for x in new_records if x['goalId'] == goal_id)
            assert {k:v for k,v in old_record.items() if k not in whitelist} == {k:v for k,v in new_record.items() if k not in whitelist}
            oi, ni = next(x for x in old_input['goals'] if x['goalId']==goal_id), next(x for x in new_input['goals'] if x['goalId']==goal_id)
            for key in ['canonicalContext','goalFingerprint','currentTitleDe','currentTitleEn','currentDescriptionDe','currentDescriptionEn']:
                assert oi[key] == ni[key]
            assert oi['reviewContext']['evidenceProfile'] == ni['reviewContext']['evidenceProfile']
            for key in ['title','description','visualization']:
                assert oi['reviewContext']['page'][key] == ni['reviewContext']['page'][key]
            old_run = obj(R / source['runManifest']['path'])
            new_run = obj(next((out / label / 'results').glob('*.run.json')))
            for key in ['runId','provider','model','startedAt','completedAt','generationParametersFingerprint','blindToOtherRuns']:
                assert old_run[key] == new_run[key]
            parity.append({'goalId':goal_id,'round':role,'wholeOriginalScienceExact':True,'wholeCurrentCanonicalContextExact':True,'wholeCurrentPExact':True,'wholeVisualizationExact':True,'originalReviewRunId':old_run['runId'],'newScientificReview':False})
assert len(parity) == 8
A = Q / 'wirtschaft-twenty-indirect-D-current-P-page-neighbor-context-independent-a-READONLY-v1'
a = obj(A / 'actual-twenty-current-whole-context-and-historical-dual-proof-independent-KEEP.READONLY.json')
assert len(a['rows']) == 20 and all(row['decision'] == 'KEEP' for row in a['rows'])
assert len(a['actualOldPAbsentIds17']) == 17 and len(a['actualOldPWholeExactPresentIds3']) == 3
assert len(a['actualInputAndEndguards']) == 175
for guard in a['actualInputAndEndguards']:
    assert sha((R / guard['path']).read_bytes()) == guard['sha256'], guard['path']
correction = F / 'three-embedded-positive-profile-presence-only-additive-correction/SEALED-three-embedded-positive-profile-presence-only-additive-correction.READONLY.json'
assert correction.exists() and sha(correction.read_bytes()) == 'sha256:3a774555c25d97fa3e5be7730d8fbd0851e6aaccac7a1c5631a4d4cf65b5a662'
assert not (O / '02-actual-four-owner-and20-context-registry-activation.receipt.json').exists()
(O / 'registry-before225.EXACT.json').write_bytes(before_bytes)
(O / 'registry-qualified246.EXACT.json').write_bytes(candidate_bytes)
assert REG.read_bytes() == before_bytes
temp = REG.with_name(REG.name + '.root-qualified-four-owner.tmp')
with temp.open('xb') as f: f.write(candidate_bytes)
os.replace(temp, REG)
receipt = {
    'status':'ACTUAL_FOUR_CURRENT_OWNER_REGISTRY_AND_TWENTY_INDEPENDENT_CONTEXTS_ACTIVATED_NATIVE246',
    'recordedAt':datetime.now(timezone.utc).isoformat(),
    'nativeAffectedChecks':bind(O / '01-actual-native-four-owner-and20-context-candidate-nonloss-qualified-checks.receipt.json'),
    'activeRegistry':bind(REG),'oldRegistry':bind(O / 'registry-before225.EXACT.json'),
    'originalEightWholeScienceComparisons':parity,'independentTwentyCurrentContexts':bind(A / 'actual-twenty-current-whole-context-and-historical-dual-proof-independent-KEEP.READONLY.json'),
    'authorAggregatePMetadataCorrection':bind(correction),
    'originalPAbsentCount':17,'originalWholePEmbeddedExactCount':3,
    'historical860AcceptedFirstEvidencePreserved':True,
    'changedNeighborTitles95fAndAa9ActuallyReviewed':True,
    'activeNativeScopedStrictCount':246,'previousCount':225,'netStrictGrowth':21,
    'restoredExistingValidScienceBindings':21,'newScientificDescriptionReviews':0,
    'newIndependentReviewsRegistered':0,'lostGoalIds':[],
    'allForeignSubjectConfigurationsWholeExact':True,
    'sourceCoverageOrHumanReleaseNewApproval':False,
    'centralWholeStatusStill225UntilBundledStableRegeneration':True,
    'GitHubGreenHead434DoesNotQualifyThisLocalM7Package':True,
}
(O / '02-actual-four-owner-and20-context-registry-activation.receipt.json').write_text(json.dumps(receipt,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'registryActivated':True,'nativeAffectedStrict':246,'net':21,'newScience':0,'foreignSubjectsExact':True}))
