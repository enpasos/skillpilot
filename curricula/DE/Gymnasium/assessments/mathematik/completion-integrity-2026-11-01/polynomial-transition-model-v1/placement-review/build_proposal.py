"""Write only the bounded, inert placement proposal in this tmp directory."""
from pathlib import Path
from copy import deepcopy
import hashlib
import json

ROOT = Path(__file__).resolve().parents[3]
OUT = Path(__file__).resolve().parent
CONTENT = OUT.parent / 'route-actions-batch2'
CANON = ROOT / 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json'
AUDIT = ROOT / 'backend/build/reports/curriculum-completion-integrity/68a8ac50-f5f5-4e24-8aa9-5e408ca01ced/audit.json'
LEDGER = ROOT / 'curricula/DE/Gymnasium/quality/release-model/mathematik.semantic-kinds.json'
VIEWS = ROOT / 'curricula/DE/Gymnasium/composition-views/mathematik'
PARENT = '28b45b93-11e1-5a96-97a1-4cfee171802b'
SKILLS = {'8e1b0d9c-fa32-5ccd-9c11-77e788ae0941', 'b88cbf71-5e3e-55e3-ba94-6789408d38d6', '4b16fce6-84cc-52ae-98ca-f88cc518cc28'}
LGS = '546bf0b3-6921-416b-a2ef-8fd37d429dc7'

def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def write(name, value):
    (OUT / name).write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')

assert sha(CANON) == '3a3792d14057854c79a3d8c4d38cd98dd6e28e936865ebd3447107404b58474c'
assert sha(AUDIT) == '7ac71b4187ca24522dadd796aa2a4d8671e21856dc36a0d30ea1fac87e523848'
assert sha(CONTENT / 'candidate.new-goal.json') == '5924e6184fc405d7e2fa2c0a8e06b969e23b03e1c55590c2a91893a03d71645b'
canonical = json.loads(CANON.read_text())
goals = {g['id']: g for g in canonical['goals']}
original = json.loads((CONTENT / 'candidate.new-goal.json').read_text())
candidate = deepcopy(original)
new_id = candidate['id']
assert new_id not in goals
candidate['extendedData']['applicabilityMappingInheritance'] = 'boundary'
# This is an explicit proposed cache of the existing all-of-requires rule,
# not source evidence and not a rule selecting any target goals.
jurisdictions = sorted(set.intersection(*(set(goals[i]['applicability']['jurisdiction']) for i in candidate['requires'])))
assert len(jurisdictions) == 16
candidate['applicability'] = {'jurisdiction': jurisdictions}
assert candidate['examData'] == original['examData']
write('candidate.goal.json', candidate)
write('goal-metadata-delta.json', {
    'status': 'PROPOSED_METADATA_ONLY_CONTENT_BYTES_UNCHANGED',
    'contentInputSha256': sha(CONTENT / 'candidate.new-goal.json'),
    'independentContentReviewSha256': sha(CONTENT / 'independent-model-content-rereview.json'),
    'goalId': new_id,
    'changes': [
        {'path': '/extendedData/applicabilityMappingInheritance', 'before': None, 'after': 'boundary',
         'reason': 'Existing boundary convention, as on8d314e15; broad canonical ancestor mappings must not become source evidence for this independently authored task.'},
        {'path': '/applicability', 'before': None, 'after': candidate['applicability'],
         'reason': 'Proposed jurisdiction cache: intersection of the four existing prerequisite applicability caches. Native applicability/source review remains pending; assessment-requires is eligibility evidence only.'},
    ],
    'preserved': ['entire examData including DE/EN task/solution/scoring', 'requires', 'coveredGoalIds', 'phase E and dimensionTags', 'draft status', 'stable goal ID'],
    'applicabilityFromRequires': True,
    'newSourceMappingClaims': 0,
})

parent_after = deepcopy(goals[PARENT])
parent_after['contains'].append(new_id)
parent_after['weight'] = 14
write('parent-before-after.json', {'goalId': PARENT, 'before': goals[PARENT], 'after': parent_after})
ancestors = {PARENT}
todo = [PARENT]
while todo:
    child = todo.pop()
    for goal in goals.values():
        if child in goal.get('contains', []) and goal['id'] not in ancestors:
            ancestors.add(goal['id'])
            todo.append(goal['id'])

def atoms(goal_id, graph, visiting=frozenset()):
    assert goal_id not in visiting, 'contains cycle'
    goal = graph[goal_id]
    if not goal.get('contains'):
        return {goal_id}
    return set().union(*(atoms(i, graph, visiting | {goal_id}) for i in goal['contains']))

after_goals = deepcopy(goals)
after_goals[new_id] = candidate
after_goals[PARENT] = parent_after
weights = []
for goal_id in [PARENT, 'a668ea17-9226-4074-8f8e-051acbe839eb', 'c01b1ce9-a667-4a46-b251-ec33ae602b15']:
    assert goal_id in ancestors
    before_atoms = atoms(goal_id, goals)
    after_atoms = atoms(goal_id, after_goals)
    assert after_atoms - before_atoms == {new_id} and before_atoms <= after_atoms
    weights.append({'goalId': goal_id, 'title': goals[goal_id]['title'],
                    'storedWeightBefore': goals[goal_id]['weight'], 'uniqueAtomsBefore': len(before_atoms),
                    'uniqueAtomsAfter': len(after_atoms), 'proposedWeightAfter': len(after_atoms),
                    'newTaskContribution': 1,
                    'preExistingUndercountCorrection': len(before_atoms) - goals[goal_id]['weight']})
assert len(ancestors) == 3
write('ancestor-weight-deltas.json', {'method': 'Unique atomic contains descendants; each shared atom counted once. Only the three actual ancestors are considered.',
                                    'deltas': weights,
                                    'rootBaselineMismatch': '979 stored versus980 actual before the new task;979→981 consists of1 existing undercount plus1 new atom. No general weight cleanup proposed.'})

def nodes_with_paths(nodes, path=('rootNodes',), structure_path=()):
    for index, node in enumerate(nodes):
        here = path + (index,)
        yield node, here, structure_path
        structure = structure_path + (({'id': node['id'], 'label': node['label']},) if node['kind'] == 'structure' else ())
        yield from nodes_with_paths(node.get('children', []), here + ('children',), structure)

def contains_paths(goal_id, target_id, trail=()):
    assert goal_id not in trail
    if goal_id == target_id:
        return [trail + (goal_id,)]
    return [p for child in goals[goal_id].get('contains', []) for p in contains_paths(child, target_id, trail + (goal_id,))]

view_map = {}
view_anchors = []
for path in sorted(VIEWS.glob('*.view.json')):
    view = json.loads(path.read_text())
    parent_refs = []
    skill_refs = []
    for node, node_path, structure_path in nodes_with_paths(view['rootNodes']):
        if node.get('kind') == 'canonicalSubtree' and node['goalId'] in ancestors:
            parent_refs.append({'nodePath': list(node_path), 'structurePath': structure_path, 'reference': node})
        for skill in sorted(SKILLS):
            if node['kind'] == 'goalEntry' and node['goalId'] == skill:
                skill_refs.append({'goalId': skill, 'nodePath': list(node_path), 'structurePath': structure_path, 'reference': node, 'canonicalPath': [skill]})
            elif node['kind'] == 'canonicalSubtree':
                for trail in contains_paths(node['goalId'], skill):
                    skill_refs.append({'goalId': skill, 'nodePath': list(node_path), 'structurePath': structure_path, 'reference': node, 'canonicalPath': list(trail)})
    entry = {'viewId': view['viewId'], 'path': str(path.relative_to(ROOT)), 'sha256': sha(path), 'scope': view['scope'], 'parentTransportReferences': parent_refs}
    view_map[view['viewId']] = {**entry, 'view': view, 'skillRefs': skill_refs}
    view_anchors.append(entry)

audit = json.loads(AUDIT.read_text())
rows = [r for r in audit['scopes'] if r['scope'] != 'canonical']
assert len(rows) == 154
expected = [r for r in rows if SKILLS <= set(r['targetGoalIds'])]
assert len(expected) == 132 and all(r['scope'].split('/')[1] in ('SekII', 'CrossStage') for r in expected)
expected_ids = {r['scope'] for r in expected}
assert sum(LGS in r['targetGoalIds'] for r in expected) == 60
assert sum(LGS not in r['targetGoalIds'] for r in expected) == 72

def members(row):
    return [i for value in row['compositionViewIds'] for i in value.removeprefix('merged:').split('+')]

def transports(view_id):
    return any(e['reference'].get('projectionRole', 'target') == 'target' for e in view_map[view_id]['parentTransportReferences'])

missing = [r for r in expected if not any(transports(i) for i in members(r))]
assert len(missing) == 6 and all(r['scope'].startswith('DE-BY/') for r in missing)
missing_source_ids = sorted({i for r in missing for i in members(r)})
assert len(missing_source_ids) == 4
view_operations = []
for view_id in missing_source_ids:
    entry = view_map[view_id]
    refs = entry['skillRefs']
    assert {r['goalId'] for r in refs} == SKILLS
    locations = {tuple(x['id'] for x in r['structurePath']) for r in refs}
    assert len(locations) == 1, 'Placement review must handle different actual years explicitly'
    common = refs[0]['structurePath']
    anchor_id = common[-1]['id']
    anchor, node_path, _ = next(e for e in nodes_with_paths(entry['view']['rootNodes']) if e[0].get('id') == anchor_id)
    view_operations.append({'viewId': view_id, 'path': entry['path'], 'beforeSha256': entry['sha256'],
                            'operation': 'appendAuthoredNode', 'childrenPath': list(node_path) + ['children'],
                            'anchorStructureId': anchor_id, 'anchorStructurePath': common,
                            'beforeChildCount': len(anchor['children']), 'afterNode': {'kind': 'goalEntry', 'goalId': new_id, 'projectionRole': 'target'},
                            'existingThreeSkillPlacements': refs,
                            'reason': 'All three assessed goals are already placed in this same actualJ11/WeitereKompetenzen branch. This is a proposal based on those concrete placements, never inferred from phaseE. Official source/year acceptance remains pending.'})
write('view-reference-proposal.json', {'status': 'FOUR_AUTHORING_ADDITIONS_PROPOSED_NO_VIEW_WRITES', 'onlyParentInsertionTransports': 126,
                                      'expectedOfferings': 132, 'missingOfferIdsBeforeFourEntries': [r['scope'] for r in missing],
                                      'operations': view_operations,
                                      'scopeBoundary': 'No new subtree references, no other goal role changes, no132 profiles and no prerequisite-only promotion.'})
write('program-and-view-anchors.json', {
    'canonicalParentChain': [{'id': i, 'title': goals[i]['title']} for i in [PARENT, 'a668ea17-9226-4074-8f8e-051acbe839eb', 'c01b1ce9-a667-4a46-b251-ec33ae602b15']],
    'existingProgramUnits': [u for u in canonical['programUnits'] if u['id'] in {'de-gym-math-program', 'de-gym-math-sek2', 'de-gym-math-e'}],
    'existingAncestorPlacements': [p for p in canonical['goalPlacements'] if p['goalId'] in ancestors],
    'existingParentDirectPlacements': [p for p in canonical['goalPlacements'] if p['goalId'] == PARENT],
    'existingThirteenTasksDirectPlacements': [p for p in canonical['goalPlacements'] if p['goalId'] in goals[PARENT]['contains']],
    'proposedNewGoalPlacements': [],
    'interpretation': 'Existing E-analysis ancestor has a primary SekII program placement. Parent and its13 own tasks have no direct program placements. E-phase unit exists but has no placement for these objects; do not manufacture an official year allocation from titles/phase.',
    'physicalViewAnchors': view_anchors,
})
offer_rows = []
for row in rows:
    eligible = row['scope'] in expected_ids
    offer_rows.append({'offerId': row['scope'], 'compositionViewIds': row['compositionViewIds'],
                       'threeAssessedSkillsAlreadyTarget': eligible,
                       'lgsPreparationAlreadyTarget': LGS in row['targetGoalIds'],
                       'lgsSupportOnlyRetained': eligible and LGS not in row['targetGoalIds'],
                       'expectedNewAssessmentTarget': eligible,
                       'transportByParentOnly': any(transports(i) for i in members(row)),
                       'fourEntryFixRequired': row['scope'] in {r['scope'] for r in missing}})
write('expected-offerings.json', {'status': 'EXACT_BASELINE_DERIVED_QA_EXPECTATION_NOT_A_RUNTIME_PROFILE',
                                 'auditPath': str(AUDIT.relative_to(ROOT)), 'auditSha256': sha(AUDIT),
                                 'offeringCount': 154, 'expectedNewAssessmentOfferCount': 132,
                                 'expectedOfferIds': sorted(expected_ids),
                                 'excludedOfferIds': sorted(r['scope'] for r in rows if r['scope'] not in expected_ids),
                                 'allFourPreparationGoalsTargetOfferCount': 60,
                                 'lgsRemainsSupportOnlyOfferCount': 72,
                                 'offers': offer_rows})
source_paths = sorted({*ROOT.glob('curricula/DE/Gymnasium/mapping/**/*.json'), *ROOT.glob('curricula/DE/Gymnasium/provenance/*.json')})
write('input-bindings.json', {'canonical': {'path': str(CANON.relative_to(ROOT)), 'sha256': sha(CANON)},
                              'audit': {'path': str(AUDIT.relative_to(ROOT)), 'sha256': sha(AUDIT)},
                              'ledger': {'path': str(LEDGER.relative_to(ROOT)), 'sha256': sha(LEDGER)},
                              'content': {'path': str((CONTENT / 'candidate.new-goal.json').relative_to(ROOT)), 'sha256': sha(CONTENT / 'candidate.new-goal.json')},
                              'unchangedMappingAndProvenanceFiles': {str(p.relative_to(ROOT)): sha(p) for p in source_paths},
                              'unchangedViewFiles': {e['path']: e['sha256'] for e in view_anchors}})
print(json.dumps({'expectedOfferings': 132, 'parentOnly': 126, 'fourViewEntries': 4, 'additionalOffersReachedByThoseEntries': 6, 'weightDeltas': weights}, ensure_ascii=False, indent=2))
