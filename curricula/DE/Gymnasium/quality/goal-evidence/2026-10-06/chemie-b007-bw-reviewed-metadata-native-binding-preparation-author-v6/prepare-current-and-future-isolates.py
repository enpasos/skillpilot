"""Current/future inert metadata-only isolates for native binding measurements."""
from pathlib import Path
import copy
import hashlib
import json
import shutil
import datetime

OWN = Path(__file__).resolve().parent
ROOT = Path(__file__).resolve().parents[7]
BASE = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06'
V5 = BASE / 'chemie-b007-bw-three-source-locator-targeted-author-v5'
URL = 'https://www.bildungsplaene-bw.de/site/bildungsplan-rebrush2024/get/documents/lsbw/export-pdf/depot-pdf/ALLG/BP2016BW_ALLG_GYM_CH.V2%20(2022-03-25).pdf'
CANON = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
LEDGER = 'curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json'
ATLAS = 'app/scripts/config/goal-books/de-gym-chemistry-national-atlas.inputs.json'
FULL = 'curricula/DE/Gymnasium/quality/goal-description-review/chemie/review-book-full.config.json'
PUBLIC = 'app/scripts/config/goal-books/de-gym-chemistry-national-atlas.json'
LOWER = 'curricula/DE/Gymnasium/input/BW/lower-secondary/source-extraction/DE_BW_CHEMIE_SEKI_BP2016_V2.source-extraction.json'
UPPER = 'curricula/DE/Gymnasium/input/BW/upper-secondary/source-extraction/DE_BW_CHEMIE_SEKII_BP2016_V2.source-extraction.json'
inputs = {}

def hash_bytes(data):
    return hashlib.sha256(data).hexdigest()

def bind(relative):
    data = (ROOT / relative).read_bytes()
    inputs[relative] = {'path': relative, 'sha256': hash_bytes(data), 'bytes': len(data)}
    return data

def load(relative):
    return json.loads(bind(relative))

def save(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')

def differences(a, b, pointer=''):
    assert type(a) is type(b), pointer
    if isinstance(a, dict):
        assert a.keys() == b.keys(), pointer
        return sum((differences(a[k], b[k], pointer + '/' + k) for k in a), [])
    if isinstance(a, list):
        assert len(a) == len(b), pointer
        return sum((differences(x, y, pointer + '/' + str(i)) for i, (x, y) in enumerate(zip(a, b))), [])
    return [] if a == b else [{'pointer': pointer, 'before': a, 'after': b}]

for folder, filename, expected in [
    ('chemie-b007-bw-source-locator-version-independent-a-v5', 'bw-source-locator-version-independent-a-v5.final.freeze.json', 'c969392b908639d9aaf83f75a2f71a688b36261e57f998886233da8735408afa'),
    ('chemie-b007-bw-source-locator-version-independent-b-v5', 'independent-b-bw-source-locator-version.final.freeze.json', '6ba654676e37e0ee7d69b598bc11387960fef8f1b5c891ae0dcdb16a57f7a23e'),
]:
    path = BASE / folder / filename
    assert hash_bytes(bind(str(path.relative_to(ROOT)))) == expected
for name in ['chemie-b007-bw-source-locator-version-independent-a-v5/actual-own-primary-raster-sight-and-bounded-science-verdict.independent-a.json', 'chemie-b007-bw-source-locator-version-independent-b-v5/independent-b-source-locator-version-verdict.json']:
    bind(str((BASE / name).relative_to(ROOT)))
bind(str((V5 / 'bw-b007-locator-and-version-targeted-author-v5.final.freeze.json').relative_to(ROOT)))

canonical = load(CANON)
assert len(canonical['goals']) == 479
candidate = copy.deepcopy(canonical)
source_id = 'bw-chem-seki-3-2-1-2-b03-a01-1f9ce38a'
five = []
for goal in candidate['goals']:
    provenance = goal.get('extendedData', {}).get('provenance', {})
    if provenance.get('sourceGoalId') == source_id:
        assert provenance['sourceRef'].endswith('S. 15.')
        provenance['sourceRef'] = provenance['sourceRef'].replace('S. 15.', 'S. 16.')
        five.append(goal['id'])
assert len(five) == 5
report_path = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/chemie-current-fifteen-reviewed-active-integration-v1/current-central-five-gate.actual.report.json'
report = load(report_path)
chemistry = next(s for s in report['subjects'] if s['subject'] == 'chemie')
protected = set(chemistry['strictCompleteGoalIds'])
assert len(protected) == 127 and chemistry['denominator'] == 378
old_v4_path = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/chemie-b007-one-inherited-prerequisite-targeted-author-v4/qa-artifacts/DE_DEU_S_GYM_CANONICAL_CHEMIE.one-inherited-prerequisite.author-candidate.json'
old_v4 = {g['id']: g for g in load(old_v4_path)['goals']}
current_goals = {g['id']: g for g in canonical['goals']}
old_v4_protected_differences = [i for i in sorted(protected) if old_v4.get(i) != current_goals[i]]
assert old_v4_protected_differences, 'The historical v4 base must not be mistaken for the current active base.'

lower = load(LOWER)
upper = load(UPPER)
lower_candidate_path = str((V5 / 'raw-candidates/BW-SekI-eight-paragraph-locators-and-V2-URL.separate-author-candidate.json').relative_to(ROOT))
upper_candidate_path = str((V5 / 'raw-candidates/BW-SekII-URL-only.source-extraction.author-candidate.json').relative_to(ROOT))
lower_candidate = load(lower_candidate_path)
upper_candidate = load(upper_candidate_path)
lower_differences = differences(lower, lower_candidate)
upper_differences = differences(upper, upper_candidate)
assert len(lower_differences) == 9 and len(upper_differences) == 1
atlas = load(ATLAS)
atlas_candidate = copy.deepcopy(atlas)
bw_snapshot = next(r for r in atlas_candidate['sourceDocumentSnapshots'] if r['path'] == lower['sourceDocument']['path'])
bw_snapshot['url'] = URL
assert len(differences(atlas, atlas_candidate)) == 1
actual_pdf = bind(lower['sourceDocument']['path'])
assert 'sha256:' + hash_bytes(actual_pdf) == bw_snapshot['sha256']

required = {CANON, LEDGER, ATLAS, FULL, PUBLIC, LOWER, UPPER, atlas['durationModelPolicyPath'], 'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'}
for path in [FULL, PUBLIC]:
    cfg = load(path)
    required.update(cfg[k] for k in ['landscapePath', 'semanticKindLedgerPath', 'goalVisualizationQaPath', 'compositionViewPath', 'compositionViewManifestPath'] if cfg.get(k))
    if cfg.get('compositionViewManifestPath'):
        manifest = load(cfg['compositionViewManifestPath'])
        required.add(manifest['navigationViewPath'])
        required.update(manifest['sourcePaths'])
for path in atlas['mappingPaths']:
    required.add(path)
    extraction_path = load(path)['sourceExtractionPath']
    required.add(extraction_path)
    extraction = load(extraction_path)
    documents = extraction.get('sourceDocuments', []) or [extraction['sourceDocument']]
    snapshot_paths = {r['path'] for r in atlas['sourceDocumentSnapshots']}
    for document in documents:
        if document.get('path') and document['path'] not in snapshot_paths:
            required.add(document['path'])
required.update(atlas.get('fallbackViewPaths', []))

for lane in ['baseline-current', 'future-metadata-only']:
    checkout = OWN / lane / 'checkout'
    for relative in sorted(required):
        path = checkout / relative
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(bind(relative))
    asset_link = checkout / 'app/public/assets'
    asset_link.parent.mkdir(parents=True, exist_ok=True)
    if not asset_link.is_symlink():
        asset_link.symlink_to(ROOT / 'app/public/assets', target_is_directory=True)
    assert asset_link.resolve() == ROOT / 'app/public/assets'
    # The baseline/future full canonical book gets current127 evidence rows only
    # through later explicit existing gate binding probes; this model is pure.
    if lane == 'future-metadata-only':
        save(checkout / CANON, candidate)
        save(checkout / LOWER, lower_candidate)
        save(checkout / UPPER, upper_candidate)
        save(checkout / ATLAS, atlas_candidate)

scalar_deltas = [
    {'path': CANON, 'changes': differences(canonical, candidate), 'claim': 'Exactly five provenance locators; whole current479 base preserved'},
    {'path': LOWER, 'changes': lower_differences, 'claim': 'Explicit selected eight-paragraph proposal, not paragraph3-only subset'},
    {'path': UPPER, 'changes': upper_differences, 'claim': 'Only proven same-V2 URL, no SekII paragraph science'},
    {'path': ATLAS, 'changes': differences(atlas, atlas_candidate), 'claim': 'Technical URL snapshot synchronization; identical retained PDF hash'},
]
save(OWN / 'current479-127-and-exact-selected-metadata-delta.raw-author.json', {'schemaVersion': 1, 'createdAtUTC': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'role': 'Technical author/native integration preparation; no new independent science review', 'currentWholeGoalCount': 479, 'currentStrictIDs': sorted(protected), 'currentStrictCount': 127, 'currentCurricularAtomicCount': 378, 'currentProvenanceLocatorGoalIds': five, 'fourProtectedOnlyProvenanceLocatorGoalIds': sorted(protected.intersection(five)), 'oldV4ProtectedWholeGoalDifferenceCount': len(old_v4_protected_differences), 'oldV4ProtectedWholeGoalDifferenceIDs': old_v4_protected_differences, 'oldV4FullCanonicalNotUsedAsFutureBase': True, 'exactScalarDeltas': scalar_deltas, 'nativeSemanticKindSourceFingerprintPendingTechnicalRebind': five, 'sourceHoldsCleared': 0, 'strictCompletionsAdded': 0, 'humanApproval': False, 'activeWrites': 0})
save(OWN / 'actual-initial-current-input-bindings.author.json', {'schemaVersion': 1, 'inputs': list(inputs.values()), 'copiedNativeInputCountPerLane': len(required), 'sharedAssets': 'Only read-only source access through own app/public/assets symlink. Actual raster hashes measured by unchanged production model loader and separately pinned; no asset writes.'})
print(json.dumps({'own': str(OWN.relative_to(ROOT)), 'baselineAndFutureNativeIsolates': 2, 'copiedInputsPerLane': len(required), 'actualBoundInputs': len(inputs), 'currentStrict': len(protected), 'oldV4ProtectedWholeDifferences': len(old_v4_protected_differences), 'selectedScalarFieldChangesBeforeLedgerTechnicalRebind': sum(len(r['changes']) for r in scalar_deltas)}))
