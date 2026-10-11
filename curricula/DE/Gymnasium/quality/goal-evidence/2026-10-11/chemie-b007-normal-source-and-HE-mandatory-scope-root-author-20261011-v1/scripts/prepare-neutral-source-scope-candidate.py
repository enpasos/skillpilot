#!/usr/bin/env python3
"""Prepare bounded, inactive source/scope inputs for independent reviews.

This script creates an author candidate, never a scientific approval. It does
not write canonical, normal mapping, view, registry or publication inputs.
"""
import copy
import datetime
import hashlib
import json
from pathlib import Path

BASE = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-11/chemie-b007-normal-source-and-HE-mandatory-scope-root-author-20261011-v1')
INTEGRATION = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-11/chemie-b007-v7-root-normal-final-integration-20261011-v1')
LANDSCAPE = Path('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json')
SOURCE_INPUTS = Path('app/scripts/config/goal-books/de-gym-chemistry-national-atlas.inputs.json')
SOLUBILITY = '413040cd-ba74-5227-948c-a778b0bd0f56'
PREPARATION = '1351706f-4ea6-56e9-951b-87b24cbcdee8'
BY_SOURCE = 'd6ad6ab1-1c9a-5101-9b26-d2ed456d3089'
FOUNDATIONS = '3588c15e-adbe-5b81-b3a7-10da20574e3d'
SOLUTIONS = '53fd1bfd-facb-54ae-b2dc-f667ed1414fc'


def read(path):
    return json.loads(Path(path).read_text())


def digest(path):
    return 'sha256:' + hashlib.sha256(Path(path).read_bytes()).hexdigest()


def write(relative, value):
    path = BASE / relative
    assert not path.exists(), f'Refuse to overwrite an author input: {path}'
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')
    assert read(path) == value
    return str(path)


assert not (BASE / 'FIRST.neutral-whole-source-scope-author-inputs.json').exists()
before = read(LANDSCAPE)
candidate = copy.deepcopy(before)
goals = {goal['id']: goal for goal in candidate['goals']}
assert len(goals) == 523
assert goals[SOLUBILITY]['applicability']['jurisdiction'] == ['DE-HE']
goals[SOLUBILITY]['applicability']['jurisdiction'] = ['DE-TH']
assert all(goal == goals[goal['id']] for goal in before['goals'] if goal['id'] != SOLUBILITY)
landscape_candidate = write('candidate/whole523-TH413-source-scope.inactive.json', candidate)
baseline_bindings = [{'path': str(LANDSCAPE), 'sha256': digest(LANDSCAPE)}]
mapping_rows = []
normal_targets = []
source_inputs = read(SOURCE_INPUTS)
inactive_inputs = copy.deepcopy(source_inputs)

for adoption in read(INTEGRATION / 'active-adoption-plan.actual.json')['sourceMappingSuccessors']:
    source = Path(adoption['operativeExactCopy'])
    original_normal = Path(adoption['originalPathPreserved'])
    mapping = read(source)
    baseline_bindings += [{'path': str(source), 'sha256': digest(source)}, {'path': str(original_normal), 'sha256': digest(original_normal)}]
    edits = []
    if 'DE-BY/' in str(original_normal):
        decision = next(item for item in mapping['decisions'] if item['sourceGoalId'] == BY_SOURCE)
        assert decision['canonicalGoalIds'] == ['f1ed86f0-534d-57d7-8952-a004a331cc54']
        assert not any(item['legacyGoalId'] == BY_SOURCE and item['canonicalGoalId'] == PREPARATION for item in mapping['mappings'])
        decision['canonicalGoalIds'].append(PREPARATION)
        decision['rationale'] += ' B007 gezielter Autor-Nachfolger: 1351706f ergänzt ausschließlich den praktischen Teil der Herstellung einer vorgegebenen Lösung nach Arbeitsanweisung. Die amtlichen C10-HG/SG/MuG/WWG/SWG.4.8 und C10-NTG.2.9 verlangen Berechnungen zur Herstellung definierter saurer oder basischer Stoffmengenkonzentrationen; benachbarte Inhalte benennen die praktische Herstellung. Diese zusätzliche Kante ist ausdrücklich PARTIAL. Mengenrechnung, Genauigkeit der Zielkonzentration, eigene Planung und Auswertung sowie tatsächliche Durchführung sind dadurch nicht vollständig nachgewiesen. Die bisherige Zuordnung bleibt als historische Entscheidung erhalten; ihre Ganzzeilenaussage wird hier nicht erneut freigegeben.'
        mapping['mappings'].append({'legacyGoalId': BY_SOURCE, 'canonicalGoalId': PREPARATION, 'matchType': 'partial', 'reviewDecisionId': BY_SOURCE})
        edits.append({'sourceGoalId': BY_SOURCE, 'canonicalGoalId': PREPARATION, 'matchType': 'partial', 'scientificScope': 'prescribed practical component only; independent source acceptance pending'})
    if 'DE-TH/' in str(original_normal):
        for decision in mapping['decisions']:
            if decision['sourceGoalId'].startswith(('th-chem-sekii-th-ch-sekii-4-1-3-loslichkeitsgleichgewichte-067-', 'th-chem-sekii-th-ch-sekii-4-1-3-loslichkeitsgleichgewichte-069-01-')):
                assert decision['decision'] == 'needs_canonical_goal'
                assert decision['canonicalGoalIds'] == []
                decision['decision'] = 'needsCanonicalGoal'
                edits.append({'sourceGoalId': decision['sourceGoalId'], 'onlyChangedField': 'decision', 'before': 'needs_canonical_goal', 'after': 'needsCanonicalGoal', 'remainingDuty': 'unchanged actual fractional precipitation content or experiment, no target added'})
        assert len(edits) == 2
    name = original_normal.name.replace('.review.json', '.b007-normal-source-scope-20261011-v1.review.json')
    relative_normal = original_normal.parent / name
    path = write(Path('candidate/mapping') / relative_normal.relative_to('curricula/DE/Gymnasium/mapping'), mapping)
    inactive_inputs['mappingPaths'] = [path if entry == str(source) else entry for entry in inactive_inputs['mappingPaths']]
    mapping_rows.append({'operativeInput': str(source), 'originalNormalPreserved': str(original_normal), 'inactiveCandidate': path, 'candidateSha256': digest(path), 'normalSuccessorTarget': str(relative_normal), 'onlyEdits': edits})
    normal_targets.append({'candidate': path, 'target': str(relative_normal)})


def is_ancestor_of_solubility(goal_id):
    if goal_id == SOLUBILITY:
        return True
    return any(is_ancestor_of_solubility(child) for child in goals[goal_id].get('contains', []))


def mandatory_node(goal_id):
    if goal_id == SOLUBILITY:
        return None
    goal = goals[goal_id]
    if not is_ancestor_of_solubility(goal_id):
        return {'kind': 'canonicalSubtree' if goal.get('contains') else 'goalEntry', 'goalId': goal_id}
    assert goal_id in [FOUNDATIONS, SOLUTIONS]
    return {
        'kind': 'structure',
        'id': 'he-chemistry-mandatory-foundations' if goal_id == FOUNDATIONS else 'he-chemistry-prescribed-solutions',
        'label': goal['title'] if goal_id == FOUNDATIONS else 'Herstellung und Zusammensetzung von Lösungen',
        'children': [entry for child in goal['contains'] if (entry := mandatory_node(child)) is not None],
    }


view_rows = []
for profile in ['gk', 'lk']:
    view_path = Path(f'curricula/DE/Gymnasium/composition-views/chemie/de-he-{profile}.view.json')
    view = read(view_path)
    assert view['rootNodes'][0]['children'][1]['children'][0] == {'kind': 'canonicalSubtree', 'goalId': FOUNDATIONS}
    authored = copy.deepcopy(view)
    authored['rootNodes'][0]['children'][1]['children'][0] = mandatory_node(FOUNDATIONS)
    assert view['scope'] == authored['scope']
    path = write(f'candidate/composition-views/de-he-{profile}.view.json', authored)
    baseline_bindings.append({'path': str(view_path), 'sha256': digest(view_path)})
    view_rows.append({'originalNormalPreservedUntilReview': str(view_path), 'inactiveCandidate': path, 'candidateSha256': digest(path), 'intendedTargetDelta': {'removed': [SOLUBILITY], 'added': []}, 'noPrerequisiteOnlyIntroduced': True})
    normal_targets.append({'candidate': path, 'target': str(view_path)})

input_path = write('candidate/source-atlas.inactive.inputs.json', inactive_inputs)
baseline_bindings.append({'path': str(SOURCE_INPUTS), 'sha256': digest(SOURCE_INPUTS)})
normal_targets.append({'candidate': landscape_candidate, 'target': str(LANDSCAPE)})
manifest = {
    'schemaVersion': 1,
    'createdAtUTC': datetime.datetime.now(datetime.timezone.utc).isoformat(),
    'role': 'root author; whole neutral candidate inputs, no independent verdicts',
    'status': 'inactive_candidate_needs_independent_targeted_reviews',
    'landscape': {'path': landscape_candidate, 'sha256': digest(landscape_candidate), 'wholeGoals': 523, 'intendedCurricularAtomicCountUnchanged': 402, 'onlyChangedGoal': SOLUBILITY, 'onlyChangedField': 'applicability.jurisdiction', 'before': ['DE-HE'], 'after': ['DE-TH']},
    'mappingSuccessors': mapping_rows,
    'mandatoryHEViewSuccessors': view_rows,
    'sourceAtlasInput': {'path': input_path, 'sha256': digest(input_path)},
    'baselineBindings': baseline_bindings,
    'futureNormalTargetsAfterReviews': normal_targets,
    'rationale': ['Normal mapping discovery excludes quality input snapshots; adopt additive reviewed successors in the ordinary mapping tree without changing discovery code.', 'HE obligatory dissolving and fractions do not make the facultative saturation/temperature material obligatory. The mandatory HE views omit only 413; the canonical goal and reviewed TH/LK contribution remain.', 'BY135 has a direct registered prescribed practical-component source contribution; requires closure alone is not source evidence.', 'The two TH source duties remain open, with empty canonical targets; only use the normal schema spelling needsCanonicalGoal.'],
    'sourceUnionApproval': False,
    'humanApproval': False,
    'humanTrial': False,
    'historicalFilesOverwritten': [],
    'activeFilesWritten': [],
    'requiredTargetedWork': ['independent A/B source/scope judgments', 'current 413 description-context transfer and resolved findings', 'current BY135 page/context/source bindings', 'normal composition/source/quality/maturity checks and strict-ID protections'],
}
write('FIRST.neutral-whole-source-scope-author-inputs.json', manifest)
print(json.dumps({'wholeGoals': 523, 'curricularAtomicCount': 402, 'mappingCandidates': len(mapping_rows), 'viewCandidates': len(view_rows), 'activeWrites': 0, 'candidateManifest': str(BASE / 'FIRST.neutral-whole-source-scope-author-inputs.json')}, ensure_ascii=False))
