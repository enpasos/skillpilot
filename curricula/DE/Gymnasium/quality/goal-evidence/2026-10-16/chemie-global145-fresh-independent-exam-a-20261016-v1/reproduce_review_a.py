#!/usr/bin/env python3
"""Technical record of a pre-existing frozen scientific review; no curriculum writes.

Run once in the repository. Output files are created exclusively so this script
cannot replace a historical review. The scientific judgment is read from the
first-written Markdown artifact; automatic checks do not grant that judgment.
"""
from datetime import datetime, timezone
from fractions import Fraction
import hashlib
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = next(path for path in HERE.parents if (path / 'AGENTS.md').is_file())
E16 = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-16'
AUTHOR = E16 / 'chemie-global145-current435-concrete-exam-material-and-coverage-author-20261016-v1'
CANONICAL_REL = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
H = ROOT / 'tmp/chemie-m7-resumed-20261016/current578-one-sparse-own-host-v1' / CANONICAL_REL
SOURCE = E16 / 'chemie-current435-shared-narrow-memory-units-and-acquisition-placement-author-successor-20261016-v1/CANONICAL.whole-base593-plus-shared-narrow-memory.author-inactive.json'
GOAL_ID = '14577339-9e0c-5b44-8e47-91e1a4947367'
SCIENCE = HERE / 'SCIENCE145.independent-a.frozen-first.md'
PINS = {
    'GOAL145.after.whole.author-draft.json': '251afcd83ecae4b658b90357a31f2740b3dd6370a804f9680ab9e852f4d64dba',
    'GOAL145.before.whole.exact.json': 'a39a3cfed5a8d46bf3079bb848a77a632a275033e6468feaf0d555a79bd85eaa',
}
H_PIN = '2974f50212c692811f432fc9ba026c28115507cb384fe4e5e44c451481156bb7'
SCIENCE_PIN = 'b0f64c532822b25be65017ce71c63eee4f5b86900b02b3bd109bd2d96129fb16'


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def rel(path):
    return str(path.relative_to(ROOT))


def load(path):
    return json.loads(path.read_text(encoding='utf-8'))


def new_json(name, value):
    path = HERE / name
    with path.open('xb') as output:
        output.write((json.dumps(value, ensure_ascii=False, indent=2) + '\n').encode('utf-8'))
    assert load(path) == value
    return path


assert SCIENCE.is_file() and sha(SCIENCE) == SCIENCE_PIN
for name, digest in PINS.items():
    assert sha(AUTHOR / name) == digest, name
assert sha(SOURCE) == H_PIN, 'Immutable author snapshot differs from the context read for science; do not rebind automatically'
all_author_json = {p.name: load(p) for p in sorted(AUTHOR.glob('*.json'))}
before = all_author_json['GOAL145.before.whole.exact.json']
after = all_author_json['GOAL145.after.whole.author-draft.json']
matrix = all_author_json['COVERAGE145.actual-task-rubric-to-seven-goal-matrix.author.json']
historic = all_author_json['HISTORICAL145.lists-and-scope.exact-preserved.json']
exam_artifact = all_author_json['EXAM145.complete-material-task-solution-and-coverage.author.json']
canonical = load(SOURCE)
goals = {g['id']: g for g in canonical['goals']}
assert goals[GOAL_ID] == before
changed_top = [k for k in after if after[k] != before.get(k)]
assert changed_top == ['extendedData', 'examData']
protected_top = [k for k in before if k not in changed_top]
assert all(before[k] == after[k] for k in protected_top)
assert before['requires'] == after['requires'] == historic['requires']
assert before['examData']['coveredGoalIds'] == historic['coveredGoalIds']
route = after['extendedData']['routeCoverage']
assert route['historicalCoveredGoalIdsBeforeConcreteMaterial'] == historic['coveredGoalIds']
assert route['historicalDirectRequiresBeforeConcreteMaterial'] == historic['requires']
assert len(after['requires']) == 273
atomic = [i for i in after['requires'] if not goals[i].get('contains')]
cluster = [i for i in after['requires'] if goals[i].get('contains')]
assert len(atomic) == 259 and len(cluster) == 14
assert set(historic['requiresNotInOldCovered']) == set(historic['requires']) - set(historic['coveredGoalIds'])
assert set(historic['oldCoveredNotInRequires']) == set(historic['coveredGoalIds']) - set(historic['requires'])
assert len(historic['requiresNotInOldCovered']) == 4 and len(historic['oldCoveredNotInRequires']) == 2
exam = after['examData']
assert exam_artifact['examData'] == exam
coverage = exam['coveredGoalIds']
assert len(coverage) == len(set(coverage)) == 7
assert set(coverage) <= set(atomic)
assert matrix['coveredGoalIds'] == coverage == route['concreteMaterialAssessedGoalIds']
assert set(coverage) == {i for s in exam['scoring']['steps'] for i in s.get('coveredGoalIds', [])}
assert set(coverage) == {i for r in matrix['rows'] for i in r['directlyAssessedGoalIds']}
for row in matrix['coveredGoals']:
    current = goals[row['goalId']]
    for key in ['title', 'description', 'requires', 'tags']:
        assert row[key] == current[key], (row['goalId'], key)
assert len(matrix['rows']) == 16
assert sum(r['points'] for r in matrix['rows']) == 44
assert [s['points'] for s in exam['scoring']['steps']] == [8, 10, 8, 10, 8]
assert sum(s['points'] for s in exam['scoring']['steps']) == exam['scoring']['maxPoints'] == 44
assert exam['scoring']['passingPoints'] == 27
for step in exam['scoring']['steps']:
    assert sum(r['points'] for r in matrix['rows'] if r['scoringStep'] == step['id']) == step['points']
marker = '**Zusätzliches Material und Teilaufgabe 5: Ethanolwirkungen (HE E.3)**'
assert before['examData']['taskContent'].split(marker, 1)[1] == exam['taskContent'].split(marker, 1)[1]
assert before['examData']['solutionContent'].split('\n\n5.', 1)[1] == exam['solutionContent'].split('\n\n5.', 1)[1]
assert before['examData']['scoring']['steps'][-1] == exam['scoring']['steps'][-1]
assert after['extendedData']['currentSourcePerformanceScope'] == before['extendedData']['currentSourcePerformanceScope']
assert exam['reviewStatus'] == 'draft'
assert route['wholeTerminalCoverageValidated'] is False
assert after['extendedData']['concreteExamAuthorScope']['routeDutiesStatus'] == 'HOLD'

# Independent rational arithmetic, with every quantity explicitly supplied.
acid = ethanol = Fraction(1, 5)
ester = water = Fraction(2, 5)
k = ester * water / (acid * ethanol)
q = (ester / 2) * water / (acid * ethanol)
delta_h = 2 * -394 + 3 * -286 - -278
q_water = Fraction(1) * Fraction(418, 100) * Fraction(5)
n_ethanol = Fraction(9, 10) / 46
apparent_h = -q_water / n_ethanol
assert k == 4 and q == 2 and q < k
assert delta_h == -1368 and q_water == Fraction(209, 10)
assert apparent_h == Fraction(-9614, 9)
assert Fraction(240, 100) <= Fraction(250, 100)
assert Fraction(200, 100) <= Fraction(250, 100)
assert Fraction(4) < Fraction(6)

# Stoichiometric C, H, O and charge vectors for the three evaluated equations.
vectors = {
    'ethanol': (2, 6, 1, 0), 'ethanoic_acid': (2, 4, 2, 0),
    'ethyl_ethanoate': (4, 8, 2, 0), 'water': (0, 2, 1, 0),
    'hydroxide': (0, 1, 1, -1), 'ethanoate': (2, 3, 2, -1),
    'oxygen': (0, 0, 2, 0), 'carbon_dioxide': (1, 0, 2, 0),
}
equations = {
    'esterification': {'ethanol': -1, 'ethanoic_acid': -1, 'ethyl_ethanoate': 1, 'water': 1},
    'alkaline_hydrolysis': {'ethyl_ethanoate': -1, 'hydroxide': -1, 'ethanoate': 1, 'ethanol': 1},
    'complete_combustion': {'ethanol': -1, 'oxygen': -3, 'carbon_dioxide': 2, 'water': 3},
}
residuals = {name: [sum(coef * vectors[species][axis] for species, coef in eq.items()) for axis in range(4)] for name, eq in equations.items()}
assert all(v == [0, 0, 0, 0] for v in residuals.values())

context_ids = [
    GOAL_ID, 'e22a34d4-ac1e-5afe-8f77-0dfa4fd9f44f',
    '978a6f25-0601-5457-9211-aab206c95603',
    'c91350bc-7d2e-523c-bd50-0324bccfcf98', '973c12d9-d863-5292-8c68-9c80cdacf9e2',
    'bf6c39f0-1e44-53b2-8ff6-025f2e36e125', '6765f741-42a6-55c5-a218-81b883b1f5ae',
    '9746ff9a-c423-5504-9d4d-0fced93fa382', '02634fdd-c8ba-591a-b240-77129b1bebb8',
    '00139854-e5a7-5c12-ab50-2268c80bf776',
] + coverage
context_ids = list(dict.fromkeys(context_ids))
all_exams = [g for g in goals.values() if g.get('examData')]
assert len(all_exams) == 35
assert not [g['id'] for g in all_exams if g['id'] != GOAL_ID and '978a6f25-0601-5457-9211-aab206c95603' in g['examData'].get('coveredGoalIds', [])]
assert goals['e22a34d4-ac1e-5afe-8f77-0dfa4fd9f44f']['applicability']['jurisdiction'] == ['DE-BY']
assert goals['e22a34d4-ac1e-5afe-8f77-0dfa4fd9f44f']['tags'] == ['LK', 'canonical']
fruit_scoring = goals['00139854-e5a7-5c12-ab50-2268c80bf776']['examData']['scoring']
assert sum(s['points'] for s in fruit_scoring['steps']) == 28
assert fruit_scoring['maxPoints'] == 30
normal = ROOT / CANONICAL_REL
now = datetime.now(timezone.utc).isoformat()

context_path = new_json('CONTEXT145.independent-a.exact-selected-goals.json', {
    'role': 'Exact selected public canonical goal bodies captured after scientific decision; no replacement canonical',
    'capturedAt': now,
    'sourceCanonicalFileSha256': 'sha256:' + H_PIN,
    'sourceCanonicalPath': rel(SOURCE),
    'sourceCanonicalGoalCount': len(goals),
    'capturedGoalIds': context_ids,
    'goals': [goals[i] for i in context_ids],
})
verify_path = new_json('VERIFY145.independent-a.reproducible-checks.json', {
    'role': 'Technical checks after frozen science; arithmetic and binding checks are not the scientific decision',
    'checkedAt': now,
    'authorJsonFilesParsed': len(all_author_json),
    'wholeCandidateFileSha256': 'sha256:' + PINS['GOAL145.after.whole.author-draft.json'],
    'wholeBeforeFileSha256': 'sha256:' + PINS['GOAL145.before.whole.exact.json'],
    'scienceFileSha256': 'sha256:' + SCIENCE_PIN,
    'immutableSourceCanonicalPath': rel(SOURCE),
    'immutableSourceCanonicalSha256': 'sha256:' + sha(SOURCE),
    'HAtScienceReadSha256': 'sha256:' + H_PIN,
    'HCurrentObservedSha256': 'sha256:' + sha(H),
    'HChangedAfterScience': sha(H) != H_PIN,
    'HBeforeGoalExactAtScienceRead': goals[GOAL_ID] == before,
    'HBeforeGoalExactAtTechnicalCapture': next(g for g in load(H)['goals'] if g['id'] == GOAL_ID) == before,
    'sourceCanonicalGoalCount': len(goals),
    'contextRecovery': 'The first verification stopped on changed mutable H before JSON writes. Exact same immutable author canonical2974f502 was then independently located and used; no scientific judgment or pin changed.',
    'normalObservedFileSha256': 'sha256:' + sha(normal),
    'normalObservedGoalCount': len(load(normal)['goals']),
    'changedTopLevelFields': changed_top,
    'protectedUnchangedTopLevelFields': protected_top,
    'directRequiresObjects': 273, 'directRequiresAtomicObjects': len(atomic), 'directRequiresClusterObjects': len(cluster),
    'historicalCovered271PreservedExactly': True,
    'historicalRequires273PreservedExactly': True,
    'historicalFourNewRequiresAndTwoLegacyCoveredDifferencesPreserved': True,
    'directCoverageCount': len(coverage),
    'coverageEqualsMatrixAndScoringUnion': True,
    'sevenMatrixGoalTextsCurrentExact': True,
    'subcriteriaCount': len(matrix['rows']),
    'subcriterionAndScoringPointsAgree': True,
    'scoringPoints': [8, 10, 8, 10, 8], 'maximumPoints': 44, 'passingPoints': 27,
    'task5SuffixExact': True, 'solution5SuffixExact': True, 'scoring5ObjectExact': True,
    'sourceAndApplicabilityUnchanged': True,
    'arithmetic': {'K': str(k), 'Q': str(q), 'standardReactionEnthalpyKJPerMol': delta_h, 'waterHeatKJ': str(q_water), 'ethanolMoles': str(n_ethanol), 'apparentReactionEnthalpyKJPerMolExact': str(apparent_h), 'apparentReactionEnthalpyKJPerMolDecimal': float(apparent_h), 'chosenOption': 'A'},
    'stoichiometryResidualOrder': ['C', 'H', 'O', 'charge'],
    'stoichiometryResiduals': residuals,
    'otherExistingExamCount': len(all_exams) - 1,
    'existingFruitExamScoringSum': 28, 'existingFruitExamMaxPoints': 30,
    'automaticChecksPassed': True,
    'candidateStillDraft': True, 'wholeTerminalCoverageValidated': False,
    'curriculumWrites': 0, 'normalAliasWrites': 0, 'HWrites': 0,
    'HumanApproval': False, 'HumanTrial': False,
})
review_path = new_json('REVIEW145.independent-a.machine-exam-content-and-scope.json', {
    'role': 'One independent machine content and scope review; not author self-review, release, or human approval',
    'reviewId': HERE.name,
    'reviewerAgent': '/root/chemie_global145_fresh_exam_review_a_20261016',
    'actualIndependentAgentExecution': True,
    'otherIndependentExamReviewOutputsRead': False,
    'knownModelFamily': 'GPT-6', 'modelVersion': 'unknown', 'seed': 'unknown', 'temperature': 'unknown',
    'frozenSciencePath': rel(SCIENCE), 'frozenScienceSha256': 'sha256:' + SCIENCE_PIN,
    'candidatePath': rel(AUTHOR / 'GOAL145.after.whole.author-draft.json'),
    'candidateSha256': 'sha256:' + PINS['GOAL145.after.whole.author-draft.json'],
    'goalId': GOAL_ID,
    'machineExamContentDecision': 'KEEP',
    'boundedMachineContentApproval': True,
    'directlyAssessedGoalIds': coverage,
    'mandatoryEditsWithinExamContentCandidate': [],
    'materialCompleteForAllAskedSolutions': True,
    'factualChemistryDecision': 'KEEP', 'numericalCalculationsDecision': 'KEEP',
    'assessmentValidityDecision': 'KEEP', 'safetyAndIndividualInferenceBoundariesDecision': 'KEEP',
    'wholeTerminalCoverageDecision': 'BLOCK', 'wholeTerminalCoverageValidated': False,
    'findings': [
        {'id': 'KEEP-CONTENT-A0', 'decision': 'KEEP', 'scope': 'Five tasks, materials, nonexclusive worked solutions, 44 BE scoring and seven actual assessed competencies'},
        {'id': 'BLOCK-ROUTE-A1', 'decision': 'BLOCK', 'scope': 'Broad source/course/access legitimacy', 'evidenceGoalIds': [GOAL_ID, 'e22a34d4-ac1e-5afe-8f77-0dfa4fd9f44f'], 'reason': 'HE GK/LK endpoint still requires BY-only LK practical EDTA competency; preserved graph does not validate reachability in the target course.'},
        {'id': 'BLOCK-ROUTE-A2', 'decision': 'BLOCK', 'scope': 'Practical acquisition and terminal duties', 'evidenceGoalIds': ['c91350bc-7d2e-523c-bd50-0324bccfcf98', '973c12d9-d863-5292-8c68-9c80cdacf9e2', 'bf6c39f0-1e44-53b2-8ff6-025f2e36e125', '6765f741-42a6-55c5-a218-81b883b1f5ae', '9746ff9a-c423-5504-9d4d-0fced93fa382', '02634fdd-c8ba-591a-b240-77129b1bebb8', '978a6f25-0601-5457-9211-aab206c95603'], 'reason': 'Existing paper endpoints claim full practical competencies without requiring execution; planar chromatography has no other direct assessed contract. Real matching local routes or practical evidence remain necessary.'},
        {'id': 'REVISE-ROUTE-A3', 'decision': 'REVISE', 'scope': 'Existing neighboring fruit-juice exam; outside this candidate change', 'evidenceGoalIds': ['00139854-e5a7-5c12-ab50-2268c80bf776'], 'reason': 'Task and solution announce 8+6+8+8=30, scoring holds 6+6+8+8=28 with maxPoints30.'},
        {'id': 'KEEP-ROUTE-A4', 'decision': 'KEEP', 'scope': 'Requires and assessed coverage semantics', 'reason': 'Prerequisites need not all be examined in one sitting. New seven-goal coverage is truthful; unchanged edges preserve structural paths only, and the route HOLD must remain open.'},
    ],
    'automaticEvidencePath': rel(verify_path), 'exactSelectedContextPath': rel(context_path),
    'independentMachineReviewOrdinal': 'A', 'independentMachineReviewCountProvidedByThisArtifact': 1,
    'HumanApproval': False, 'HumanTrial': False,
    'releaseStatusMutated': False, 'normalAliasesMutated': False, 'historicalBytesMutated': False,
    'CQR202RunClaim': 'none; candidate remains draft', 'CQR203RunClaim': 'none; candidate remains draft',
    'M7Claim': False, 'learnerPerformanceClaim': False,
})
files = [SCIENCE, Path(__file__).resolve(), HERE / 'ATTEMPT145.mutable-H-guard-stop.actual.txt', context_path, verify_path, review_path]
manifest = new_json('MANIFEST.independent-a.science-first.inactive.json', {
    'role': 'Inactive independent review A manifest', 'sealedAt': datetime.now(timezone.utc).isoformat(),
    'scienceWrittenBeforeTechnicalRecords': True,
    'scienceMtimeNs': SCIENCE.stat().st_mtime_ns,
    'machineExamContentDecision': 'KEEP', 'wholeTerminalCoverageDecision': 'BLOCK',
    'normalWrites': 0, 'HWrites': 0, 'sourceCandidateWrites': 0,
    'HumanApproval': False, 'HumanTrial': False,
    'inputs': [{'path': rel(p), 'sha256': 'sha256:' + sha(p), 'bytes': p.stat().st_size} for p in sorted(AUTHOR.iterdir()) if p.is_file()],
    'files': [{'path': rel(p), 'sha256': 'sha256:' + sha(p), 'bytes': p.stat().st_size} for p in files],
})
assert sha(SCIENCE) == SCIENCE_PIN and sha(SOURCE) == H_PIN
for p in HERE.glob('*.json'):
    load(p)
print(json.dumps({'reviewDirectory': rel(HERE), 'scienceSha256': 'sha256:' + SCIENCE_PIN, 'machineExamContentDecision': 'KEEP', 'wholeTerminalCoverageDecision': 'BLOCK', 'technicalChecksPassed': True, 'manifest': rel(manifest)}, ensure_ascii=False))
