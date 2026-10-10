#!/usr/bin/env python3
"""Materialize only this inactive B007 author namespace; never activate a gate."""
from copy import deepcopy
from datetime import datetime, timezone
from hashlib import sha256
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[6]
PREFIX = HERE.relative_to(ROOT).as_posix()
OLD = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/chemie-b007-current480-atomic-prerequisite-remediation-author-v7'
MATERIALS = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/chemie-b007-seven-routines-four-material-corrections-author-v2'
NATIVE = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/chemie-b007-seven-native-source-preparation-author-v3'
CANON = ROOT / 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
KINDS = ROOT / 'curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json'
PRIOR_REPORT = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/chemie-b008-current517-source7-normal37-reviewed-inactive-j-private-completion-technical-successor-20261010-v2/checks/candidate-current398-central.attempt5.actual.report.json'

def read(path):
    return json.loads(path.read_text())

def write(name, value):
    path = HERE / name
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')

def bind(path):
    raw = path.read_bytes()
    return {'path': path.relative_to(ROOT).as_posix(), 'sha256': sha256(raw).hexdigest(), 'bytes': len(raw)}

def value_digest(value):
    return sha256(json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode()).hexdigest()

now = datetime.now(timezone.utc).isoformat()
current = read(CANON)
assert len(current['goals']) == 517
assert read(KINDS)['counts']['curricularAtomic'] == 398
report = next(row for row in read(PRIOR_REPORT)['subjects'] if row['subject'] == 'chemie')
assert report['denominator'] == 398 and report['strictComplete'] == 206
assert set(report['currentGoalIds']) == {d['goalId'] for d in read(KINDS)['decisions'] if d['semanticKind'] == 'curricularAtomic'}
baseline_path = HERE / 'candidate/canonical.baseline517.snapshot.json'
baseline_path.parent.mkdir(parents=True, exist_ok=True)
baseline_path.write_bytes(CANON.read_bytes())
baseline_kinds = read(KINDS)
baseline_kinds['sourceLandscapePath'] = baseline_path.relative_to(ROOT).as_posix()
write('candidate/semantic-kinds.baseline517.snapshot.json', baseline_kinds)
prior = {goal['id']: goal for goal in read(OLD / 'candidate/canonical.current480-seven-atomic-route-proposals.json')['goals']}
binder = read(NATIVE / 'seven-routine-uuid-and-fourteen-case-two-card-binders.author-candidate.json')
routine_ids = {key: value for key, value in binder['routineGoalIds'].items() if key != 'label'}
new_ids = list(routine_ids.values())
candidate = deepcopy(current)
goals = {goal['id']: goal for goal in candidate['goals']}
assert not set(new_ids) & set(goals)
for key, goal_id in routine_ids.items():
    goal = deepcopy(prior[goal_id])
    goal['extendedData']['provenance']['authorCandidatePackage'] = PREFIX
    candidate['goals'].append(goal)
    goals[goal_id] = goal
parents = ['7be6f951-a614-52dc-94d3-2ce0d33765ff', '53fd1bfd-facb-54ae-b2dc-f667ed1414fc']
for goal_id in parents:
    assert not goals[goal_id]['contains']
    for key in ['contains', 'requires', 'weight', 'type']:
        goals[goal_id][key] = deepcopy(prior[goal_id][key])

intents = read(OLD / 'seven-atomic-prerequisite-proposals.author.json')
for intent in intents:
    goal = goals[intent['goalId']]
    assert goal['requires'] == intent['beforeRequires'], f"Changed current route: {goal['id']}"
    goal['requires'] = deepcopy(intent['candidateRequires'])
    intent['reviewStatus'] = 'author_candidate_requires_independent_current_context_review'
changed_ids = set(parents) | {r['goalId'] for r in intents}
baseline_goals = {goal['id']: goal for goal in current['goals']}
assert all(goals[i] == goal for i, goal in baseline_goals.items() if i not in changed_ids)
assert not any(parent in goal.get('requires', []) for goal in candidate['goals'] for parent in parents)
assert len(candidate['goals']) == 523
write('candidate/canonical.candidate523.inactive.json', candidate)
write('seven-current-prerequisite-proposals.author.json', intents)
write('current-inputs-and-preservation.author.json', {
    'schemaVersion': 1, 'createdAtUTC': now,
    'role': 'inactive author successor; no independent scientific or machine gate approval',
    'activeWrites': False, 'baseline': bind(baseline_path), 'liveBaselineAtAuthoring': bind(CANON),
    'baselineKinds': bind(HERE / 'candidate/semantic-kinds.baseline517.snapshot.json'),
    'liveKindsAtAuthoring': bind(KINDS), 'baselineKindsChange': 'repository-local snapshot path only; every decision and source fingerprint retained',
    'priorPassedCentral206': bind(PRIOR_REPORT), 'priorReportRole': 'already sealed normal central execution, not re-executed here',
    'baselineWholeGoals': 517, 'candidateWholeGoals': 523,
    'baselineCurricularAtomic': 398, 'candidateCurricularAtomicIntent': 402,
    'currentStrictGoalIds': report['strictCompleteGoalIds'],
    'changedExistingWholeGoalIds': sorted(changed_ids), 'sixPriorCandidateGoalIds': new_ids,
    'unchangedExistingWholeGoalCount': 517 - len(changed_ids),
    'parentWholeDescriptionsImagesAndProvenanceRetained': True,
    'labelCurrentGoalUnchanged': goals[binder['routineGoalIds']['label']] == baseline_goals[binder['routineGoalIds']['label']],
    'strictCompletionsAdded': 0, 'restoredActiveBindings': 0,
    'nativeIndependentApproval': False, 'humanApproval': False, 'humanTrial': False,
})

# Copy the complete selected bodies without changing an old candidate's identity/status.
all_cases = read(MATERIALS / 'cases.de-en.author-candidate.json')
cases = [c for c in all_cases['cases'] if c['routineLocalKey'] in routine_ids]
assert len(cases) == 12
write('materials/twelve-whole-cases.de-en.unchanged.json', {
    'schemaVersion': 1, 'role': 'complete unchanged author material; current goal binding is in separate binders',
    'sourceBinding': bind(MATERIALS / 'cases.de-en.author-candidate.json'),
    'recordStatus': 'ai_candidate', 'validationStatus': 'needs_human_review', 'evidenceLevel': 'E1', 'generalizationLevel': 'G1',
    'licenseExpression': 'CC-BY-4.0', 'attribution': all_cases['attribution'],
    'humanApproval': False, 'humanTrial': False, 'caseCount': 12, 'cases': cases,
})
case_bindings = [{
    'caseLocalKey': c['caseLocalKey'], 'routineLocalKey': c['routineLocalKey'],
    'candidateGoalId': routine_ids[c['routineLocalKey']], 'wholeCaseBodySha256': value_digest(c),
    'wholeCaseBodyUnchanged': True, 'actualLearnerPerformanceRecorded': False,
} for c in cases]
write('materials/current-six-goal-twelve-case.binders.json', {
    'schemaVersion': 1, 'role': 'current UUID bindings for unchanged reviewed material; not a review verdict',
    'routineGoalIds': routine_ids, 'caseBinders': case_bindings,
    'materialBinding': bind(HERE / 'materials/twelve-whole-cases.de-en.unchanged.json'),
    'nativeIndependentReviewRequired': True,
})
cards = read(MATERIALS / 'primary-cards.de-en.author-candidate.json')
write('materials/two-whole-primary-cards.de-en.unchanged.json', cards)
memory = read(NATIVE / 'seven-memory-decisions-and-two-narrow-card-intents.author-candidate.json')
memory['createdAtUTC'] = now
memory['role'] = 'six individual author Memory decisions; origin/deck binders are inactive and require actual visibility review'
memory['routineDecisions'] = [d for d in memory['routineDecisions'] if d['routineLocalKey'] in routine_ids]
for decision in memory['routineDecisions']:
    for card in decision['cardBindingIntents']:
        card['materialFileBinding'] = bind(HERE / 'materials/two-whole-primary-cards.de-en.unchanged.json')
write('materials/six-individual-memory-decisions-and-two-card-bindings.author.json', memory)

base = read(ROOT / 'curricula/DE/Gymnasium/quality/goal-description-review/chemie/review-book-full.config.json')
base['bookId'] = 'chemie-b007-current517-baseline-author-review-universe'
base['landscapePath'] = f'{PREFIX}/candidate/canonical.baseline517.snapshot.json'
base['semanticKindLedgerPath'] = f'{PREFIX}/candidate/semantic-kinds.baseline517.snapshot.json'
base['compositionViewPath'] = f'{PREFIX}/candidate/all-atoms.review-only.view.json'
base['outputPath'] = f'{PREFIX}/native/baseline-whole-model.not-materialized.json'
write('candidate/baseline-native-book.config.json', base)
cand = deepcopy(base)
cand['bookId'] = 'chemie-b007-current523-candidate-author-review-universe'
cand['landscapePath'] = f'{PREFIX}/candidate/canonical.candidate523.inactive.json'
cand['semanticKindLedgerPath'] = f'{PREFIX}/candidate/semantic-kinds.candidate523.inactive.json'
cand['evidenceReviewPaths'] = [f'{PREFIX}/materials/six-positive-evidence-v2.author.jsonl']
cand['outputPath'] = f'{PREFIX}/native/candidate-whole-model.not-materialized.json'
write('candidate/candidate-native-book.config.json', cand)
for old_name, new_name in [('all-atoms.review-only.view.json', 'all-atoms.review-only.view.json'), ('he8-seven-routines.prospective-source.view.json', 'he8-six-routines.prospective-source.view.json')]:
    view = read(OLD / 'candidate' / old_name)
    view['viewId'] = 'chemie-b007-current206-author-' + ('all-atoms' if 'all-atoms' in new_name else 'he8-six-routines')
    write('candidate/' + new_name, view)

profile_id = 'chemie-b007-six-current206-inactive-author-v1'
existing_p_config = read(ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/canonical-chemistry-positive-understanding-evidence-b007-separation-current-1-v1.config.json')
p_config = {
    '$schema': 'https://skillpilot.com/schemas/goal-evidence/v2/goal-evidence-review-config.schema.json',
    'schemaVersion': 2, 'reviewId': profile_id, 'goalFingerprintRuleVersion': 'goal-evidence-v1',
    'profileRuleVersion': 'positive-understanding-evidence-v2', 'landscapeId': current['landscapeId'],
    'landscapePath': cand['landscapePath'], 'semanticKindLedgerPath': cand['semanticKindLedgerPath'],
    'reviewCriteriaPath': existing_p_config['reviewCriteriaPath'],
    'reviewPath': f'{PREFIX}/materials/six-positive-evidence-v2.author.jsonl',
    'reviewedResourceTypes': [], 'requireApproved': False,
    'scope': {'label': 'B007 two original families: six inactive successor routines', 'goalIds': new_ids},
}
write('materials/six-positive-evidence-v2.config.json', p_config)
profiles = []
for key, goal_id in routine_ids.items():
    local_cases = [c for c in cases if c['routineLocalKey'] == key]
    assert len(local_cases) == 2
    case0 = local_cases[0]
    expectations = [{
        'id': 'understanding', 'essentialUnderstandingDe': case0['essentialUnderstanding']['de'],
        'essentialUnderstandingEn': case0['essentialUnderstanding']['en'],
        'observablePerformanceDe': 'Die Leistung begründet die Fallentscheidung und die Bezugsbedingungen; eine richtige Bezeichnung oder isolierte Zahl allein genügt nicht.',
        'observablePerformanceEn': 'Performance justifies the case decision and its reference conditions; a correct label or isolated number alone is insufficient.',
    }]
    if key == 'preparation':
        expectations[0]['observablePerformanceDe'] = 'Ein tatsächlich betreutes Ausführungsprotokoll oder ein vollständiger moderierter Simulator-Aktionslog belegt die angegebenen Schritte und bestätigte Endkontrolle; eine Planung oder Erklärung allein ersetzt die Durchführung nicht.'
        expectations[0]['observablePerformanceEn'] = 'An actual supervised execution record or complete facilitator-mediated simulator action log shows the stated steps and confirmed final inspection; a plan or explanation alone cannot replace execution.'
    briefs = [{
        'id': c['caseLocalKey'], 'taskDemandDe': c['learnerTask']['de'], 'taskDemandEn': c['learnerTask']['en'],
        'expectedPerformanceDe': c['expectedResponseOrSolution']['de'], 'expectedPerformanceEn': c['expectedResponseOrSolution']['en'],
        'understandingFocusDe': c['essentialUnderstanding']['de'], 'understandingFocusEn': c['essentialUnderstanding']['en'],
    } for c in local_cases]
    profiles.append({
        'goalId': goal_id,
        'reason': 'Inactive author materialization of complete current DE/EN routine and unchanged two-case materials. Current native D/P, source/curriculum scope, atomarity, card visibility and visualization decisions require two independent successor reviews. No human approval or learner performance claimed.',
        'evidenceLevel': 'E1', 'maximumClaimScope': 'G1',
        'profile': {
            'archetype': 'experiment' if key == 'preparation' else ('data' if key in ['solubility', 'mass_fraction', 'volume_fraction'] else 'procedure'),
            'expectations': expectations,
            'coverageExpectations': {'requiredExpectationIds': ['understanding'], 'alternativeExpectationGroups': [], 'minimumIndependentDemonstrations': 2, 'freshVariationRequired': True, 'independentTransferRequired': True},
            'variationAxes': [{
                'id': 'changed-conditions',
                'textDe': local_cases[1]['transferOrCountercase']['de']['task'],
                'textEn': local_cases[1]['transferOrCountercase']['en']['task'],
            }],
            'applicationCaseBriefs': briefs,
        },
    })
write('materials/six-positive-evidence-v2.candidates.json', {
    'schemaVersion': 1, 'authoringContract': 'positive-understanding-evidence-candidates-v1',
    'reviewId': profile_id, 'reviewedAt': now, 'reviewer': 'Codex B007 author; no independent review', 'goals': profiles,
})

old_batch = read(ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/chemie-four-reviewed-active-integration-checks-technical-20261007-v1/remaining-open/b007-two-current-open-20261007-v2.config.json')
for name, config, goal_ids, suffix in [('baseline-two.batch.config.json', base, parents, 'two-baseline'), ('candidate-six.batch.config.json', cand, new_ids, 'six-candidate')]:
    batch = deepcopy(old_batch)
    batch['batchId'] = 'chemie-b007-current206-author-' + suffix
    batch['bookId'] = batch['batchId']
    batch['title'] = 'B007 current author inputs: ' + suffix
    batch['baseGoalBookConfigPath'] = f'{PREFIX}/candidate/' + ('baseline' if 'baseline' in suffix else 'candidate') + '-native-book.config.json'
    batch['goalIds'] = goal_ids
    batch['outputDirectory'] = f'{PREFIX}/native/' + suffix
    write('candidate/' + name, batch)
print(json.dumps({'role': 'author candidate only', 'baseline': 517, 'candidate': 523, 'atomicIntent': 402, 'caseBodies': 12, 'cards': 2, 'activeWrites': False, 'strictGain': 0}))
