# SPDX-License-Identifier: Apache-2.0
"""Freeze this review after exact bounded input checks. No author/active writes."""
import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path

OWN = Path(__file__).resolve().parent
ROOT = OWN.parents[6]
DATE = OWN.parent
AUTHOR = DATE / 'chemie-b007-seven-native-source-preparation-author-v3'
V2 = DATE / 'chemie-b007-seven-routines-four-material-corrections-author-v2'

def read(path):
    return json.loads(path.read_text())

def bind(path):
    data = path.read_bytes()
    return {'path': str(path.relative_to(ROOT)) if path.is_relative_to(ROOT) else str(path), 'sha256': hashlib.sha256(data).hexdigest(), 'bytes': len(data)}

def valhash(value):
    return hashlib.sha256(json.dumps(value, ensure_ascii=False, sort_keys=True).encode()).hexdigest()

def check_binding(binding):
    actual = bind(ROOT / binding['path'])
    assert actual['sha256'] == binding['sha256'].removeprefix('sha256:'), binding['path']
    if 'bytes' in binding:
        assert actual['bytes'] == binding['bytes'], binding['path']
    return actual

def dump(path, value):
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')

stamp = datetime.now(timezone.utc).isoformat()
freeze_path = AUTHOR / 'native-source-preparation-author-v3.final.freeze.json'
assert bind(freeze_path)['sha256'] == 'eacf8f185662b53414e77e3e7fa23aab9091e21b24fd335d026768ad6ed84f3a'
author_freeze = read(freeze_path)
author_file_checks = [check_binding(b) for b in author_freeze['files']]
author_input_checks = []
policy_delta = []
for b in author_freeze['inputBindings']:
    actual = bind(ROOT / b['path'])
    if b['path'] == 'AGENTS.md' and actual['sha256'] != b['sha256']:
        policy_delta.append({'historicalAuthorBinding': b, 'currentBinding': actual, 'equality': False, 'classification': 'Current AGENTS changed externally during this independent review; historical source remains immutable. Current Gemini integration notes were read. Exact old policy bytes not reconstructed here; no complete policy-diff or historical input equality claim.', 'subjectSourceOrGoalReviewReplacedByHashUpdate': False})
        author_input_checks.append(actual)
    else:
        author_input_checks.append(check_binding(b))
placements = read(AUTHOR / 'seven-source-placement-intents-and-national-holds.author-candidate.json')
source_checks = [check_binding(b) for b in placements['allOriginalSourceInputFileBindings']]
guard = read(AUTHOR / 'current378-and-protected112-author-input-guard.actual.json')
active_checks = [check_binding(guard[k]) for k in ['baselineActiveCanon', 'baselineKinds', 'baselineVisualizationQa']]
binders = read(AUTHOR / 'seven-routine-uuid-and-fourteen-case-two-card-binders.author-candidate.json')
cases = {c['caseLocalKey']: c for c in read(V2 / 'cases.de-en.author-candidate.json')['cases']}
cards = {c['cardLocalKey']: c for c in read(V2 / 'primary-cards.de-en.author-candidate.json')['cards']}
prototypes = {c['localKey']: c for c in read(V2 / 'seven-routines.de-en.author-candidate.json')['prototypes']}
candidate = read(AUTHOR / 'qa-artifacts/DE_DEU_S_GYM_CANONICAL_CHEMIE.four-route-proposals.author-candidate.json')
goals = {g['id']: g for g in candidate['goals']}
case_rows = []
for b in binders['caseBinders']:
    c = cases[b['caseLocalKey']]
    assert valhash(c) == b['wholeCaseValueSha256']
    assert b['nativeCandidateGoalId'] == binders['routineGoalIds'][c['routineLocalKey']]
    assert c['candidateGoalId'] == b['bodyCandidateGoalIdNotRewritten']
    check_binding(b['materialFileBinding'])
    case_rows.append({'caseLocalKey': c['caseLocalKey'], 'nativeBinderGoalId': b['nativeCandidateGoalId'], 'wholeCaseValueSha256': b['wholeCaseValueSha256'], 'bodyCandidateGoalId': c['candidateGoalId'], 'decision': 'KEEP_PRIOR_V2_SCIENCE_EXACT_BODY_REUSE', 'nativePositiveGateApproval': False})
card_rows = []
for b in binders['primaryCardBinders']:
    c = cards[b['cardLocalKey']]
    assert valhash(c) == b['wholeCardValueSha256']
    assert b['nativeCandidateOriginGoalId'] == binders['routineGoalIds'][c['originRoutineLocalKey']]
    check_binding(b['materialFileBinding'])
    card_rows.append({'cardLocalKey': c['cardLocalKey'], 'nativeBinderOriginGoalId': b['nativeCandidateOriginGoalId'], 'wholeCardValueSha256': b['wholeCardValueSha256'], 'memoryGoalIds': b['candidateMemoryGoalIds'], 'decision': 'KEEP_PRIOR_V2_CARD_CONTENT_EXACT_BODY_REUSE', 'nativeMemoryGateApproval': False})
assert len(case_rows) == 14 and len(card_rows) == 2
goal_text_rows = []
for key, gid in binders['routineGoalIds'].items():
    for field in ['title', 'titleEn', 'description', 'descriptionEn']:
        assert goals[gid][field] == prototypes[key][field], (key, field)
    assert valhash({f: goals[gid][f] for f in ['title', 'titleEn', 'description', 'descriptionEn']}) == next(p['goalTextBindingSha256'] for p in placements['placements'] if p['routineLocalKey'] == key)
    goal_text_rows.append({'routineLocalKey': key, 'goalId': gid, 'fourBilingualTextFieldsExactV2': True})
source_record_checks = []
for p in placements['placements']:
    for w in p['sourceWitnesses']:
        if 'sourceExtractionPath' not in w:
            assert w['isExistingOfficialExtractionRecord'] is False
            assert w['curricularRequirement'] == 'facultative'
            continue
        extraction = read(ROOT / w['sourceExtractionPath'])
        record = next(g for g in extraction['sourceGoals'] if g['id'] == w['sourceGoalId'])
        assert valhash(record) == w['sourceRecordValueSha256']
        source_record_checks.append({'routineLocalKey': p['routineLocalKey'], 'sourceGoalId': record['id'], 'sourceRecordExact': True})
historical_review_packages = [
    DATE/'chemie-b007-seven-routines-fourteen-cases-independent-a-v1/independent-a.final.freeze.json',
    DATE/'chemie-b007-five-case-v2-independent-a-followup-v1/independent-a-followup.final.freeze.json',
    DATE/'chemie-b007-seven-routines-fourteen-cases-v2-independent-b-v1/independent-b.final.freeze.json',
]
historical_checks = []
for f in historical_review_packages:
    d = read(f)
    rows = d.get('files', d.get('artifacts', []))
    assert rows, f
    historical_checks.append({'freeze': bind(f), 'wholeFrozenFileCountVerified': len(rows), 'files': [check_binding(b) for b in rows]})
native = read(OWN/'actual-native-all112-and-seven-source-candidate-independent-a.json')
source_views = read(OWN/'actual-affected-source-view-compiler-holds-independent-a.json')
for receipt in [native, source_views]:
    for b in receipt['inputBindings']:
        check_binding(b)
assert native['nativePureModelReproduction']['base382'] == 'PASS_EXACT_FROZEN_MODEL'
assert native['nativePureModelReproduction']['fourRoute382'] == 'PASS_EXACT_FROZEN_MODEL'
assert len(native['all112ActualEffectiveRequiresAndReferenceKinds']) == 112
assert len(native['actualProtectedConvertedClusterExposureAfterFourRouteVariant']) == 4
assert len(native['additionalThreeInheritedContextsOutsideAuthorSixPlan']) == 3
integrity = {'schemaVersion': 1, 'createdAtUTC': stamp, 'role': 'Independent exact bounded-input and continuity verification; equality alone is not a subject review', 'authorFreeze': bind(freeze_path), 'authorFrozenFilesVerified': len(author_file_checks), 'authorFrozenInputBindingsExamined': len(author_input_checks), 'authorFrozenInputBindingsExact': len(author_input_checks)-len(policy_delta), 'externalCurrentPolicyDelta': policy_delta, 'allOriginalSourceInputFilesVerified': len(source_checks), 'activeChemistryCanonKindsVisualizationOnly': active_checks, 'noClaimAboutUnrelatedBiologyOrGlobalInputs': True, 'authorFileBindings': author_file_checks, 'currentAuthorInputBindings': author_input_checks, 'originalSourceInputBindings': source_checks, 'historicalReviewContinuity': historical_checks, 'sevenTextContinuity': goal_text_rows, 'fourteenCaseBinderContinuity': case_rows, 'twoCardBinderContinuity': card_rows, 'sixExistingSourceRecordUsesExact': source_record_checks, 'activeWrites': False, 'nativeGateApproval': False, 'humanApproval': False, 'strictNetGain': 0}
dump(OWN/'actual-exact-inputs-and-prior-review-continuity-independent-a.json', integrity)
review = read(OWN/'independent-a.source-native.review.json')
assert review['overallDecision'] == 'REVISE'
assert len(review['goalReviews']) == 7
assert all(r['sourceDecision'] == 'KEEP' for r in review['goalReviews'])
assert review['strictNetGain'] == 0
files = [bind(p) for p in sorted(OWN.rglob('*')) if p.is_file() and p.name != 'source-native-independent-a.final.freeze.json']
input_bindings = {b['path']: b for b in [bind(freeze_path), *author_file_checks, *author_input_checks, *source_checks, *active_checks, bind(ROOT/'backend/src/main/java/com/skillpilot/backend/service/LearnerService.java'), bind(ROOT/'AGENTS.md'), bind(Path('/home/enpasos/.codex/attachments/b77af694-ca1d-42ad-a722-1a0b77a18fe8/goal-objective.md'))] if not b['path'].startswith('..')}
for receipt in [native, source_views]:
    for b in receipt['inputBindings']:
        actual = check_binding(b)
        input_bindings[actual['path']] = actual
dump(OWN/'source-native-independent-a.final.freeze.json', {'schemaVersion': 1, 'createdAtUTC': stamp, 'freezeId': 'chemie-b007-seven-native-source-independent-a-v3-20261006', 'role': 'Independent targeted source/native A, not a native D/P/A/M/V completion', 'overallDecision': 'REVISE', 'files': files, 'inputBindings': list(input_bindings.values()), 'packageFileCountExcludingFreeze': len(files), 'nativeGateApproval': False, 'humanApproval': False, 'humanTrial': False, 'activeWrites': False, 'strictCompletionsAdded': 0, 'restoredActiveBindings': 0})
print(json.dumps({'freeze': bind(OWN/'source-native-independent-a.final.freeze.json'), 'ownFiles': len(files), 'boundedInputs': len(input_bindings), 'sourceKEEP': 7, 'unresolvedNativeFinding': 1, 'overall': 'REVISE', 'activeWrites': False}))
