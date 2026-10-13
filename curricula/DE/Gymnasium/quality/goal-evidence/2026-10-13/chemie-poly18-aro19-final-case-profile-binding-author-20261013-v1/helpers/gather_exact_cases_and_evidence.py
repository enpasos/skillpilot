#!/usr/bin/env python3
"""Finite additive author assembly; no review votes or active writes."""
from pathlib import Path
from collections import Counter
import hashlib
import json
import shutil

REPO = Path(__file__).resolve().parents[8]
OWN = Path(__file__).resolve().parents[1]
OLD = REPO / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12'

def digest(path):
    data = path.read_bytes()
    return 'sha256:' + hashlib.sha256(data).hexdigest()

def binding(path):
    return {'path': str(path.relative_to(REPO)), 'sha256': digest(path), 'bytes': path.stat().st_size}

def read(path):
    return json.loads(path.read_text())

def rows(path):
    return [json.loads(line) for line in path.read_text().splitlines() if line.strip()]

def write(rel, value):
    path = OWN / rel
    path.parent.mkdir(parents=True, exist_ok=True)
    if path.exists():
        raise FileExistsError(path)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')
    return binding(path)

def write_lines(rel, values):
    path = OWN / rel
    path.parent.mkdir(parents=True, exist_ok=True)
    if path.exists():
        raise FileExistsError(path)
    path.write_text(''.join(json.dumps(value, ensure_ascii=False, separators=(',', ':')) + '\n' for value in values))
    return binding(path)

poly_root = OLD / 'chemie-polymers17-original-native-current231-inactive-adoption-root-20261013-v9'
ne_root = OLD / 'chemie-f947-three-primary-source-and-nucleophile-case-remediation-author-20261013-v13'
aro_root = OLD / 'chemie-aromatics20-bounded-partner-source-field-and-Ar-remediation-author-20261013-v9'
checkpoint = OLD / 'chemie231-source-first-inactive-checkpoint-root-20261013-v1'
poly_plan_path = poly_root / 'INTEGRATION_PLAN.current231-original17-selected.pending-root.json'
poly_ids = read(poly_plan_path)['eligibleOriginalGoalIds'] + ['f947cd04-952a-5a9d-9445-3ffc70e02c3c']
aro_selector_path = aro_root / 'NEUTRAL.targeted-v9-fix-verification.input-selector.json'
aro_selector = read(aro_selector_path)
aro_ids = [x for x in aro_selector['goalIds'] if x != 'b7b5df21-78f3-5408-89f1-36deed450695']
all_ids = poly_ids + aro_ids
assert len(poly_ids) == 18 and len(aro_ids) == 19 and len(set(all_ids)) == 37

inputs = [binding(poly_plan_path), binding(aro_selector_path)]
portable_transports = []
def portable_exact(ref):
    original = REPO / ref['path']
    assert digest(original) == ref['sha256'], original
    if not ref['path'].startswith('tmp/'):
        inputs.append(binding(original))
        return original
    # Existing checkpoint preserves source/mapping scratch payloads, but does not
    # contain these two complete Aro case/profile files. Preserve their exact bytes.
    target = OWN / 'parent-exact' / original.name
    target.parent.mkdir(parents=True, exist_ok=True)
    if target.exists():
        assert digest(target) == ref['sha256']
    else:
        shutil.copyfile(original, target)
    assert digest(target) == ref['sha256']
    portable_transports.append({'originalBinding': binding(original), 'portableBinding': binding(target), 'exactBytes': True, 'newScientificVote': False})
    inputs.append(binding(target))
    return target

poly_case_path = OLD / 'chemie-polymers-three-visual-Pscope-atomicity-author-successor-20261013-v3/whole40.expanded-cases.author-successor.json'
ne_case_path = ne_root / 'positive/whole-two-cases.nucleophile-electrophile.author-successor.json'
poly_cases = [x for x in read(poly_case_path)['cases'] if x['goalId'] in poly_ids[:-1]]
ne_cases = read(ne_case_path)['cases']
assert len(poly_cases) == 34 and len(ne_cases) == 2
poly_cases += ne_cases
inputs += [binding(poly_case_path), binding(ne_case_path)]

aro_case_parent = portable_exact(aro_selector['wholeCases']['base'])
aro_profile_parent = portable_exact(aro_selector['wholeProfiles']['base'])
aro_cases = read(aro_case_parent)['cases']
aro_profiles = read(aro_profile_parent)['profiles']
case_overlay_path = portable_exact(aro_selector['wholeCases']['overlay'])
profile_overlay_path = portable_exact(aro_selector['wholeProfiles']['overlay'])
case_deltas = read(case_overlay_path)['cases']
profile_deltas = read(profile_overlay_path)['profiles']
for delta in case_deltas:
    index = int(delta['pointer'].rsplit('/', 1)[1])
    assert aro_cases[index] == delta['before']
    aro_cases[index] = delta['after']
for delta in profile_deltas:
    index = int(delta['pointer'].rsplit('/', 1)[1])
    assert aro_profiles[index] == delta['before']
    aro_profiles[index] = delta['after']
aro_cases = [x for x in aro_cases if x['goalId'] in aro_ids]
aro_profiles = [x for x in aro_profiles if x['goalId'] in aro_ids]
assert len(aro_cases) == 38 and len(aro_profiles) == 19

p17_path = poly_root / 'positive/P17.original-author-native-bound.raw-exact.jsonl'
p1_path = ne_root / 'source/converged-polymer20-source-author/positive/P1.primary-and-NE.author.normal.jsonl'
p20_path = portable_exact(aro_selector['P20AuthorCandidates']['base'])
ar_p1_path = portable_exact(aro_selector['P20AuthorCandidates']['oneUpdatedRecord'])
p17 = rows(p17_path)
ne_p1 = rows(p1_path)
aro_p = {r['goalId']: r for r in rows(p20_path)}
for r in rows(ar_p1_path):
    aro_p[r['goalId']] = r
assert len(p17) == 17 and len(ne_p1) == 1
records = {r['goalId']: r for r in p17 + ne_p1 + [aro_p[x] for x in aro_ids]}
records = [records[x] for x in all_ids]
profiles = [{'goalId': r['goalId'], 'profile': r['profile']} for r in records]
assert {x['goalId']: x['profile'] for x in aro_profiles} == {r['goalId']: r['profile'] for r in records if r['goalId'] in aro_ids}
inputs += [binding(p17_path), binding(p1_path)]

cases = poly_cases + aro_cases
assert len(cases) == 74 and Counter(x['goalId'] for x in cases) == Counter({x: 2 for x in all_ids})
case_index = {x['caseId']: x for x in cases}
joins = []
for r in records:
    profile = r['profile']
    goal_cases = [x for x in cases if x['goalId'] == r['goalId']]
    briefs = profile['applicationCaseBriefs']
    assert len(briefs) == 2
    assert {x['id'] for x in briefs} == {x['caseId'] for x in goal_cases}
    for brief in briefs:
        case = case_index[brief['id']]
        for case_key, brief_key in [('taskDe', 'taskDemandDe'), ('taskEn', 'taskDemandEn'), ('modelAnswerDe', 'expectedPerformanceDe'), ('modelAnswerEn', 'expectedPerformanceEn')]:
            if case_key.startswith('task') and r['goalId'] in aro_ids:
                lang = case_key[-2:]
                assert case['data' + lang] + '\n' + case[case_key] == brief[brief_key], (r['goalId'], brief['id'], case_key)
            else:
                assert case[case_key] == brief[brief_key], (r['goalId'], brief['id'], case_key)
        assert case['maximumPoints'] == sum(c['maximumPoints'] for c in case['rubric'])
    joins.append({'goalId': r['goalId'], 'caseIds': [x['caseId'] for x in goal_cases], 'exactWholeProfileCaseTaskAndAnswerJoins': True, 'authorStatus': r['status'], 'authorReviewAuthority': r['reviewAuthority'], 'authorReviewId': r['reviewId'], 'actualLearnerOrLaboratoryEvidence': False})

registry_path = REPO / 'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'
registry = next(x for x in read(registry_path)['subjects'] if x['subject'] == 'chemie')
active_a = {}
active_a_configs = []
for cp in registry['semanticAtomicityConfigPaths']:
    config_path = REPO / cp
    config = read(config_path)
    review_path = REPO / config['reviewPath']
    for r in rows(review_path):
        if r['goalId'] in all_ids:
            active_a[r['goalId']] = {'config': binding(config_path), 'records': binding(review_path), 'record': r}
            if cp not in active_a_configs:
                active_a_configs.append(cp)
am_v5 = OLD / 'chemie-aromatics-two-body-A-M-targeted-independent-20261013-v5'
d61 = 'd61ce84f-1d0d-555f-be05-aedb589225ce'
a17_path = poly_root / 'atomicity/A17.original-independentA.raw-exact.jsonl'
d61_a_path = am_v5 / 'A2.compatible.record-proposals.jsonl'
d61_m_path = am_v5 / 'M2.compatible.record-proposals.jsonl'
retained_a = rows(a17_path) + [r for r in rows(d61_a_path) if r['goalId'] == d61]
for goal_id, source in active_a.items():
    if goal_id not in {x['goalId'] for x in retained_a}:
        retained_a.append(source['record'])
missing_a = [x for x in all_ids if x not in {r['goalId'] for r in retained_a}]
memory_config_path = REPO / registry['memoryReviewConfigPath']
memory_config = read(memory_config_path)
memory_path = REPO / memory_config['reviewPath']
memory = rows(memory_path)
assert len(memory) == 402
d61_m = next(r for r in rows(d61_m_path) if r['goalId'] == d61)
final_memory = [d61_m if r['goalId'] == d61 else r for r in memory]
assert sum(a != b for a, b in zip(memory, final_memory)) == 1

all_inputs = inputs + [binding(registry_path), binding(a17_path), binding(d61_a_path), binding(d61_m_path), binding(memory_config_path), binding(memory_path), binding(REPO / memory_config['cardReviewPath'])]
all_inputs += [source['records'] for source in active_a.values()]
all_inputs += [binding(REPO / x['viewPath']) for x in memory_config['visibilityScopes']]
all_inputs = list({x['path']: x for x in all_inputs}.values())
canonical_path = checkpoint / 'receipts/compiler-canonical523.current402.final-compiled.json'
assert digest(canonical_path) == 'sha256:fee87a4e8049429b7361d6f5957d5a5d7ce9022206ef7116b67d4239c0aa0c5d'

case_bind = write('positive/whole74.exact-bilingual-cases.author.json', {'schemaVersion': 1, 'license': 'CC-BY-4.0', 'authorOnly': True, 'goalIds': all_ids, 'cases': cases, 'scientificCompletionClaim': False, 'newIndependentVotes': 0})
profile_bind = write('positive/whole37.exact-profiles.author.json', {'schemaVersion': 1, 'license': 'CC-BY-4.0', 'authorOnly': True, 'goalIds': all_ids, 'profiles': profiles, 'newIndependentVotes': 0})
record_input_bind = write_lines('positive/P37.source-author-records.before-final-normal-bind.jsonl', records)
a_bind = write_lines('atomicity/A19.existing-independent-and-retained.raw-exact.jsonl', retained_a)
m_bind = write_lines('memory/M402.current401-exact-plus-genuine-d61.raw-records.jsonl', final_memory)
write('checks/whole74-profile37.exact-join-and-rubric-mechanics.actual.json', {'schemaVersion': 1, 'kind': 'Mechanical exact object and profile join checks, not independent scientific review', 'goals': joins, 'wholeBilingualCases': len(cases), 'wholeProfiles': len(profiles), 'retainedAroCasesOutsideArOverlay': 36, 'retainedAroWhole40OutsideArOverlayBeforeHeldExclusion': 38, 'P17ProfilesUnchanged': True, 'F947NECasesExactlyAuthorV13': True, 'Aro19ProfilesExactlyV7PlusV9OneWholeObjectOverlay': True, 'newIndependentVotes': 0})
write('checks/available-A-M-current-registry-audit.actual.json', {'schemaVersion': 1, 'activeAtomicityConfigCountRead': len(registry['semanticAtomicityConfigPaths']), 'activeARecordsForSelected37': active_a, 'additionalValidOriginalPolyA17': binding(a17_path), 'additionalAcceptedD61A': binding(d61_a_path), 'retainedARecordCountBeforeFinalFingerprintValidation': len(retained_a), 'missingAGoalIdsBeforeFinalFingerprintValidation': missing_a, 'semanticFingerprintValidationPendingFinalNormalizedLandscape': True, 'memoryExactUnchangedRecordCount': 401, 'memoryOnlyChangedGoalId': d61, 'memorySource': binding(memory_path), 'memoryReplacementIndependentSource': binding(d61_m_path), 'cardRecordsUnchanged': 75, 'visibilityScopesUnchanged': len(memory_config['visibilityScopes']), 'newIndependentVotes': 0})
neutral = {'schemaVersion': 1, 'kind': 'Neutral whole case and profile author inputs; status metadata are source facts, not independent acceptance', 'candidateCanonical': binding(canonical_path), 'groups': {'polymer18': poly_ids, 'aromatics19': aro_ids}, 'goalIds': all_ids, 'wholeCases': case_bind, 'wholeProfiles': profile_bind, 'PSourceAuthorRecords': record_input_bind, 'excludedHeldGoalIds': read(poly_plan_path)['heldGoalIds'] + ['b7b5df21-78f3-5408-89f1-36deed450695'], 'originalToPortableExactCaseProfileTransports': portable_transports, 'caseSourceBindings': [binding(poly_case_path), binding(ne_case_path), binding(aro_case_parent), binding(case_overlay_path)], 'profileSourceBindings': [binding(p17_path), binding(p1_path), binding(aro_profile_parent), binding(profile_overlay_path)], 'normalPFinalBindingPending': True, 'newIndependentVotes': 0, 'humanApproval': False, 'actualLearnerPerformanceClaim': False}
write('NEUTRAL.whole74-cases-37-profiles.input-selector.json', neutral)
write('INTEGRATION_PLAN.pending-final-normal-P-and-real-A-D.json', {'schemaVersion': 1, 'kind': 'Author integration proposal, no active writes', 'eligibleGoalIds': all_ids, 'positiveOutputDeclaredPath': str((OWN / 'positive/P37.final-normal.author-candidates.jsonl').relative_to(REPO)), 'positiveOriginalRecords': record_input_bind, 'positiveFinalProductionBindingPending': True, 'positiveStatusMustRemain': 'needs_human_review / ai_candidate', 'retainedAtomicity': a_bind, 'missingGenuineAtomicityGoalIds': missing_a, 'memoryCurrent401PlusGenuineD61': m_bind, 'originalMemoryConfig': binding(memory_config_path), 'retainedCardReview': binding(REPO / memory_config['cardReviewPath']), 'retainedVisibilityScopes': memory_config['visibilityScopes'], 'sourceAndNativeFinalPairedIndependentDStillRequired': True, 'positiveOriginalCaseProfileJudgmentsRemainScoped': {'polymer17': 'Existing genuine paired description/positive records; source metadata/context changed, final current D required', 'F947': 'Whole N/E written-case fitness reviewed in early independent A14; no final D or normal A vote in that source receipt', 'aromatics19': 'Author cases/profile candidates with bounded actual source and Ar fix verification; no final paired D or missing semantic A votes invented'}, 'allInputBindings': all_inputs, 'newIndependentVotes': 0, 'activeStrictGain': 0, 'humanApproval': False, 'humanTrial': False})
print(json.dumps({'root': str(OWN.relative_to(REPO)), 'goals': len(all_ids), 'wholeCases': len(cases), 'profiles': len(profiles), 'retainedA': len(retained_a), 'missingA': len(missing_a), 'memoryExact401': True, 'normalMaterializationPending': True}, indent=2))
