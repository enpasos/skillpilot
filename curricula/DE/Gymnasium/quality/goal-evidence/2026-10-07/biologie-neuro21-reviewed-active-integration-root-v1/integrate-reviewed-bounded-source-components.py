"""Route independently reviewed bounded components into the national atlas.

The original broad source HOLDs and immutable candidate mappings are retained.
The denominator and unresolved-scope assertions are not changed.
"""
import datetime
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[7]
OUT = Path(__file__).resolve().parent
SOURCE = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/biologie-neuro-eight-missing-primary-scope-remediation-author-v2/native-input-candidates'
ATLAS = ROOT / 'app/scripts/config/goal-books/de-gym-biology-national-atlas.inputs.json'
PLAN = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/biologie-neuro21-final-native-d-campaigns-integration-plan-author-20261007-v1/concrete-native-integration-plan.author.json'


def load(path):
    return json.loads(path.read_text())


def binding(path):
    data = path.read_bytes()
    return {'path': str(path.relative_to(ROOT)), 'sha256': 'sha256:' + hashlib.sha256(data).hexdigest(), 'bytes': len(data)}


def write(path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    assert not path.exists()
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')


assert not (OUT / 'four-reviewed-source-components-active-atlas.actual.receipt.json').exists()
config = load(ATLAS)
before = json.loads(json.dumps(config))
assert config['expectedCurricularAtomicGoalCount'] == 390
backup = OUT / 'before-integration/biology-national-atlas.inputs.json'
if backup.exists():
    assert load(backup) == before
else:
    write(backup, before)
plan = load(PLAN)
routes = {row['destination']: row for row in plan['sourceRoutes']}
selected = set(load(OUT / 'reviewed-active-integration.actual.receipt.json')['currentGoalIds'])
now = datetime.datetime.now(datetime.timezone.utc).isoformat()
new_routes = []
for name, state in [('BY-GA', 'DE-BY'), ('BY-EA', 'DE-BY'), ('HE-GK-LK', 'DE-HE'), ('HE-LK', 'DE-HE')]:
    original = SOURCE / f'{name}.mapping.candidate.json'
    mapping = load(original)
    original_extraction = ROOT / mapping['sourceExtractionPath']
    expected = routes[mapping['sourceExtractionPath']]['source']
    assert binding(original_extraction)['sha256'] == expected['sha256']
    assert all(set(row['canonicalGoalIds']) <= selected for row in mapping['decisions'])
    for row in mapping['decisions']:
        assert row['sourceKind'] in ['boundedPrimaryCompetencyComponent', 'authoredModelSpecialisation']
        assert row['matchType'] == 'partial'
        assert row['wholeOriginalSourceCoverage'] is False
        for key in ['independentSourceAReceipt', 'independentSourceBReceipt']:
            proof = row[key]
            actual = binding(ROOT / proof['path'])
            assert actual['sha256'] == proof['sha256'] and actual['bytes'] == proof['bytes']
        row['active'] = True
        row['reviewer'] = 'Root integration of paired independent bounded-primary-component reviews and current final D21 reviews'
        row['reviewedAt'] = now
        if row['sourceKind'] == 'authoredModelSpecialisation':
            row['rationale'] = 'This remains an explicitly declared authored model specialisation of the cited cellular-plasticity competency, not a separately named official Hebb/LTP/LTD obligation. Final independent D/P and substantive atomicity reviews now bind the supplied model, observable performance and distinction from the neighbouring goals. The source course/stage is the cited broader competency; whole original source coverage remains HOLD. No blanket source or human approval.'
        else:
            row['rationale'] = 'Only this exact independently reviewed primary competency component supplies the named direct target and explicit source course/stage. Whole original source-row coverage remains a separate HOLD. Current final D/P reviews bind the full target, current source component and image; no blanket source or human approval.'
        row['currentFinalIndependentDescriptionAReceipt'] = binding(ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/biologie-neuro21-final-images-current-bindings-independent-root-a-v1/independent-final-native-current-d-a-v1.final.freeze.json')
        row['currentFinalIndependentDescriptionBReceipt'] = binding(ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/biologie-neuro21-final-native-independent-d-b-p-binding-20261007-v1/reviewer.final.freeze.json')
    mapping['reviewStatus'] = 'machine-reviewed bounded components and declared model specialisations; whole original source coverage remains open'
    mapping['activeWrites'] = True
    mapping['wholeOriginalSourceCoverage'] = False
    destination = ROOT / f'curricula/DE/Gymnasium/mapping/{state}/source-components/{name.lower()}_biology_neurobiology_bounded_components.reviewed-20261007-v1.review.json'
    write(destination, mapping)
    assert {k: v for k, v in load(original).items() if k not in ['decisions', 'reviewStatus', 'activeWrites']} == {k: v for k, v in mapping.items() if k not in ['decisions', 'reviewStatus', 'activeWrites']}
    config['mappingPaths'].append(str(destination.relative_to(ROOT)))
    new_routes.append({'originalCandidate': binding(original), 'exactCurrentExtraction': binding(original_extraction), 'activeMapping': binding(destination), 'directBoundedGoalIds': sorted({g for row in mapping['decisions'] for g in row['canonicalGoalIds']}), 'wholeOriginalSourceCoverage': False})
assert {k: v for k, v in config.items() if k != 'mappingPaths'} == {k: v for k, v in before.items() if k != 'mappingPaths'}
ATLAS.write_text(json.dumps(config, ensure_ascii=False, indent=2) + '\n')
write(OUT / 'four-reviewed-source-components-active-atlas.actual.receipt.json', {
    'role': 'Native source-atlas routing of independently reviewed exact bounded primary components',
    'completedAtUTC': now, 'newRoutes': new_routes,
    'expectedCurricularAtomicGoalCountPreserved': 390,
    'unresolvedScopeAssertionPreserved': before['expectedUnresolvedScopeDecisionCount'],
    'originalWholeCountrySourcePairsHOLD': 189,
    'newScientificReviewByHash': False, 'humanApproval': False, 'humanTrial': False,
    'activeAtlasInput': binding(ATLAS),
})
print(json.dumps({'newBoundedSourceMappings': 4, 'unchangedExpectedCurrentGoalCount': 390, 'humanApproval': False}))
