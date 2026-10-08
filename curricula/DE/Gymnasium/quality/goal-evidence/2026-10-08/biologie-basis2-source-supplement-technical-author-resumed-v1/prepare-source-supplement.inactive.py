# SPDX-License-Identifier: Apache-2.0
"""Change only the existing inactive TMP capsule and write portable author inputs."""
from pathlib import Path
from datetime import datetime, timezone
import copy
import hashlib
import json
import shutil
import uuid

ROOT = Path.cwd()
OWN = Path(__file__).resolve().parent
PREP = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/biologie-basis2-current-reviewed-integration-preparation-resumed-v1'
REMED = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/biologie-basis2-source-applicability-integration-remediation-root-v1'
CAP = ROOT / 'tmp/biologie-basis2-reviewed394-resumed-20261008-v1-capsule'
CANON_REL = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json'
KINDS_REL = 'curricula/DE/Gymnasium/quality/goal-book-publication/biologie.semantic-kinds.json'
ROOT_ID = 'e8d54127-d42e-51f5-bfa5-51d826069f95'
SHARED = '860c80f9-e463-598b-8ef8-79f65c12f235'
FOUNDATIONS = 'b530a382-2786-5794-8821-3e01a62d88fd'
IDS = ['0f50cad3-8c4e-5bc4-8833-3a1ecdd71d38', '32483d30-2162-50a5-a6cc-05b7f2467ab1']
SUPPLEMENT = str(uuid.uuid5(uuid.NAMESPACE_URL, 'https://skillpilot.com/canonical/biology/sek1/source-supplement/metabolic-foundations-basic2'))
assert not (OWN / 'before/current-active.guard.json').exists()


def read(path):
    return json.loads(Path(path).read_text())


def bind(path):
    path = Path(path)
    data = path.read_bytes()
    return {'path': str(path.relative_to(ROOT)), 'sha256': hashlib.sha256(data).hexdigest(), 'bytes': len(data)}


def put(path, value):
    path = Path(path)
    assert path.is_relative_to(OWN), path
    assert not path.exists(), path
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')


def archive(source, relative):
    destination = OWN / relative
    destination.parent.mkdir(parents=True, exist_ok=True)
    assert not destination.exists(), destination
    shutil.copyfile(source, destination)
    return bind(destination)


old = read(PREP / 'before/canonical.exact.json')
assert read(ROOT / CANON_REL) == old, 'Current active Biology baseline must remain the old476 graph.'
old_by_id = {g['id']: g for g in old['goals']}
original_reviewed = read(PREP / 'candidate/canonical478.exact-reviewed.future-active.json')
reviewed_by_id = {g['id']: g for g in original_reviewed['goals']}
capsule_before = read(CAP / CANON_REL)
assert len(capsule_before['goals']) == 478
old_guard = read(PREP / 'reviewed-basis2-current-final-adoption.guard.json')
active_bindings = [bind(ROOT / item['active']['path']) for item in old_guard['before'].values()]
for name in ['MATHEMATIK', 'PHYSIK', 'CHEMIE']:
    active_bindings.append(bind(ROOT / f'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_{name}.de.json'))
put(OWN / 'before/current-active.guard.json', {'schemaVersion': 1, 'bindings': active_bindings, 'activeBiologyBaseline': '244/392', 'activeWrites': 0})
archive(ROOT / CANON_REL, 'before/canonical476.current-active.exact.json')
archive(CAP / CANON_REL, 'before/canonical478.failed-leaf-boundary-capsule.exact.json')
archive(CAP / KINDS_REL, 'before/kinds478.capsule.exact.json')
archive(CAP / 'tmp/basis2-ordinary-diagnostic.actual.json', 'before/failed-requires-closure.actual-diagnostic.json')
for path in REMED.glob('ordinary-applicability-isolated-after-full-discovery.*'):
    archive(path, 'before/' + path.name)
archive(REMED / 'candidate-preparation.actual.json', 'before/root-ten-source-bindings.original-preparation.json')

candidate = copy.deepcopy(original_reviewed)
candidate_by_id = {g['id']: g for g in candidate['goals']}
candidate_by_id[SHARED].clear()
candidate_by_id[SHARED].update(copy.deepcopy(old_by_id[SHARED]))
assert candidate_by_id[ROOT_ID] == old_by_id[ROOT_ID]
candidate_by_id[ROOT_ID]['contains'].append(SUPPLEMENT)
assert candidate_by_id[ROOT_ID]['weight'] == 1
supplement = {
    'id': SUPPLEMENT,
    'shortKey': 'canonical_biology_sek1_metabolic_foundations_source_supplement_cluster',
    'title': 'Ergänzende Grundlagen der Stoff- und Energieumwandlung (Sek I)',
    'titleEn': 'Additional Foundations of Matter and Energy Conversion (Lower Secondary)',
    'description': 'Cluster für eine grundlegende Darstellung der Zellatmung als Energieumwandlung und für die vereinfachte Kopplung lichtabhängiger und lichtunabhängiger Fotosynthesereaktionen aus konkret zugeordneten Lehrplananforderungen der Sekundarstufe I.',
    'descriptionEn': 'Cluster for a basic account of cell respiration as energy conversion and for the simplified coupling of light-dependent and light-independent photosynthesis reactions from specifically mapped lower-secondary curriculum requirements.',
    'type': 'cluster', 'weight': 2, 'tags': ['canonical', 'SekI', 'GK', 'LK'],
    'contains': IDS, 'requires': [FOUNDATIONS],
    'dimensionTags': {
        'framework': 'canonical-gymnasium-biology', 'phase': 'GLOBAL', 'area': 'Grundlagen',
        'topicCode': 'CANONICAL.BIOLOGY.SEK1.METABOLIC_FOUNDATIONS_SUPPLEMENT',
        'demandLevel': 'AB1', 'processCompetencies': [],
        'guidingIdeas': ['BIO_STOFF_ENERGIE'],
    },
    'applicability': {'jurisdiction': ['DE-BB', 'DE-BE', 'DE-MV', 'DE-NW', 'DE-SH', 'DE-SN', 'DE-ST', 'DE-TH']},
    'extendedData': {'applicabilityMappingInheritance': 'boundary'},
}
candidate['goals'].append(supplement)
assert len(candidate['goals']) == 479
candidate_by_id[SUPPLEMENT] = supplement
for gid, goal in old_by_id.items():
    expected = copy.deepcopy(goal)
    if gid == ROOT_ID:
        expected['contains'].append(SUPPLEMENT)
    assert candidate_by_id[gid] == expected, gid
    assert candidate_by_id[gid].get('requires', []) == goal.get('requires', []), gid
for gid in IDS:
    assert candidate_by_id[gid] == reviewed_by_id[gid], gid
    assert 'applicabilityMappingInheritance' not in candidate_by_id[gid]['extendedData']

def leaf_ids(goals, gid, visiting=None):
    visiting = set() if visiting is None else visiting
    assert gid not in visiting, ('contains cycle', gid)
    visiting.add(gid)
    goal = goals[gid]
    children = goal.get('contains', [])
    result = {gid} if not children else set().union(*(leaf_ids(goals, child, visiting.copy()) for child in children))
    return result

assert len(leaf_ids(old_by_id, ROOT_ID)) == 422
assert len(leaf_ids(candidate_by_id, ROOT_ID)) == 424
assert leaf_ids(candidate_by_id, SHARED) == leaf_ids(old_by_id, SHARED)
assert leaf_ids(candidate_by_id, SUPPLEMENT) == set(IDS)
candidate_path = OWN / 'candidate/canonical479.source-supplement394.inactive.json'
put(candidate_path, candidate)
assert not (CAP / CANON_REL).is_symlink()
shutil.copyfile(candidate_path, CAP / CANON_REL)

source_installs = read(REMED / 'candidate-preparation.actual.json')['ordinaryMappingInstalls']
for item in source_installs:
    source = ROOT / item['candidate']['path']
    target = CAP / item['destination']
    assert bind(source) == item['candidate']
    assert target.read_bytes() == source.read_bytes()
    archive(source, 'candidate/unchanged-source-bindings/' + item['destination'])
put(OWN / 'checks/structure-and-old-goals.actual-preservation.json', {
    'schemaVersion': 1, 'candidateCanonical': bind(candidate_path),
    'oldWholeGoalCount': 476, 'oldNonRootWholeGoalsExactlyUnchanged': 475,
    'rootOnlyChange': {'addedContainsId': SUPPLEMENT, 'weightBefore': 1, 'weightAfter': 1},
    'allOldRequiresExactlyUnchanged': True,
    'shared860WholeObjectExactlyRestored': True, 'shared860ChildCount': 5, 'shared860Weight': 5,
    'twoNewWholeGoalsExactlyOriginalReviewedObjects': True,
    'supplementId': SUPPLEMENT, 'supplementWeight': 2, 'supplementRequires': [FOUNDATIONS],
    'supplementHasNoBroadProvenance': True, 'supplementIsOnlyNewMappingInheritanceBoundary': True,
    'oldRootUniqueAtomicLeaves': 422, 'newRootUniqueAtomicLeaves': 424,
    'reviewedDirectMappingFilesByteExact': 8, 'reviewedDirectPartialRowsUnchanged': 10,
    'wholeOriginalSourceDutiesAndPartnerRowsPreservedByUnchangedMappings': True,
    'oldRequiresAndOld244StrictGoalSemanticsUntouched': True,
    'activeWrites': 0, 'newScientificReviewByAuthor': False, 'humanApproval': False,
})
put(OWN / 'candidate-preparation.actual.json', {
    'schemaVersion': 1, 'preparedAtUtc': datetime.now(timezone.utc).isoformat(),
    'canonicalCandidate': bind(candidate_path), 'capsuleCanonicalPath': str((CAP / CANON_REL).relative_to(ROOT)),
    'newSupplementId': SUPPLEMENT, 'newGoalIds': IDS,
    'oldSharedCluster': SHARED, 'rootGoalId': ROOT_ID,
    'originalReviewedCanonical': bind(PREP / 'candidate/canonical478.exact-reviewed.future-active.json'),
    'rootRemediationInputs': bind(REMED / 'candidate-preparation.actual.json'),
    'ordinaryMappingInstallsUnchanged': source_installs,
    'requiresNewTwoIndependentContextReviews': True,
    'activeWrites': 0, 'newScientificReviewByAuthor': False, 'humanApproval': False,
})
print(json.dumps({'inactiveCanonicalNodes':479, 'curricularAtomsExpected':394, 'supplementId':SUPPLEMENT, 'oldNonRootWholeGoalsExact':475, 'oldRequiresExact':476, 'activeWrites':0}))
