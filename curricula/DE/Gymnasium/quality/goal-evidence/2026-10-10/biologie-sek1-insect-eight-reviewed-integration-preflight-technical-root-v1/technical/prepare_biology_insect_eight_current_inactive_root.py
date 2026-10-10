# SPDX-License-Identifier: Apache-2.0
import copy
import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path('/home/enpasos/projects/skillpilot')
BASE = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10'
OUT = BASE / 'biologie-sek1-insect-eight-reviewed-integration-preflight-technical-root-v1'
ORIGINAL = BASE / 'biologie-sek1-insect-eight-raster-native-technical-author-20261010-v1'
CURRENT = BASE / 'biologie-sek1-insect-eight-frog-adult-targeted-raster-native-author-successor-v2'
CANON = ROOT / 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json'
KINDS = ROOT / 'curricula/DE/Gymnasium/quality/goal-book-publication/biologie.semantic-kinds.json'
REGISTRY = ROOT / 'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'
ATLAS = ROOT / 'app/scripts/config/goal-books/de-gym-biology-national-atlas.inputs.json'
bindings = {}


def bind(path):
    p = Path(path)
    if not p.is_absolute():
        p = ROOT / p
    assert p.is_file() and not p.is_symlink(), p
    data = p.read_bytes()
    row = {'path': str(p.relative_to(ROOT)), 'sha256': 'sha256:' + hashlib.sha256(data).hexdigest(), 'bytes': len(data)}
    assert bindings.setdefault(row['path'], row) == row
    return row


def read(path):
    bind(path)
    return json.loads(Path(path).read_text())


def verify(row):
    actual = bind(row['path'])
    assert actual['sha256'] == 'sha256:' + row['sha256'].removeprefix('sha256:'), row['path']
    if 'bytes' in row:
        assert actual['bytes'] == row['bytes']


def put(name, value):
    path = OUT / name
    path.parent.mkdir(parents=True, exist_ok=True)
    data = value if isinstance(value, bytes) else (json.dumps(value, ensure_ascii=False, indent=2) + '\n').encode()
    with path.open('xb') as f:
        f.write(data)
    return {'path': str(path.relative_to(ROOT)), 'sha256': 'sha256:' + hashlib.sha256(data).hexdigest(), 'bytes': len(data)}


assert not OUT.exists(), 'Do not overwrite earlier preparation'
original_entry = read(ORIGINAL / 'neutral-eight-current-insect-native.independent-review.entry.json')
current_entry = read(CURRENT / 'neutral-current-fcc-adult-raster-native.independent-review.entry.json')
ids = original_entry['goalIds']
assert len(ids) == 8 and current_entry['goalIds'] == ['fcc20f50-8eb3-5d6c-b37f-5be13c7d314e']
original_seal = read(ORIGINAL / 'author.final.freeze.json')
current_seal = read(CURRENT / 'author.targeted.final.freeze.json')
for seal in [original_seal, current_seal]:
    for value in seal.values():
        if isinstance(value, list):
            for row in value:
                if isinstance(row, dict) and isinstance(row.get('path'), str) and isinstance(row.get('sha256'), str):
                    verify(row)
for row in current_entry['wholeInputs']:
    verify(row)
before = read(CANON)
candidate_path = CURRENT / 'candidate/whole479-with-eight-rasters-fcc-adult.inactive.json'
candidate = read(candidate_path)
old = {g['id']: g for g in before['goals']}
new = {g['id']: g for g in candidate['goals']}
assert old.keys() == new.keys() and len(old) == 479
changed = [gid for gid in old if old[gid] != new[gid]]
assert set(changed) == set(ids)
for gid in changed:
    assert [key for key in old[gid].keys() | new[gid].keys() if old[gid].get(key) != new[gid].get(key)] == ['resourceLinks']
    restore = copy.deepcopy(new[gid])
    if 'resourceLinks' in old[gid]:
        restore['resourceLinks'] = old[gid]['resourceLinks']
    else:
        restore.pop('resourceLinks', None)
    assert restore == old[gid]
proof = read(BASE / 'biologie-q1-four-reviewed-active-adoption-technical-root-v1/current327-exact-strict-ID-gain-and-protected-subjects.actual.json')
bio_proof = next(s for s in proof['subjects'] if s['subject'] == 'biologie')
protected = bio_proof['strictCompleteGoalIds']
assert len(protected) == 327 and not set(ids).intersection(protected)
assert all(old[gid] == new[gid] for gid in protected)
put('inputs/whole479-before-active.exact.json', CANON.read_bytes())
candidate_ref = put('candidate/whole479-current-eight-raster-fcc-adult.inactive.json', candidate_path.read_bytes())
kinds = read(KINDS)
candidate_kinds = read(CURRENT / 'candidate/after394-kinds.path-only.json')
restore = copy.deepcopy(candidate_kinds)
restore['sourceLandscapePath'] = kinds['sourceLandscapePath']
assert restore == kinds
candidate_kinds['sourceLandscapePath'] = candidate_ref['path']
kinds_ref = put('candidate/whole479-semantic-kinds.path-only.inactive.json', candidate_kinds)
put('inputs/current394-kinds.exact.json', KINDS.read_bytes())
registry = read(REGISTRY)
bio = next(s for s in registry['subjects'] if s['subject'] == 'biologie')
for name, key in [('A', 'semanticAtomicityConfigPath'), ('M', 'memoryReviewConfigPath')]:
    config_path = ROOT / bio[key]
    config = read(config_path)
    original_review = ROOT / config['reviewPath']
    bind(original_review)
    rows = [json.loads(line) for line in original_review.read_text().splitlines() if line.strip()]
    assert len(rows) == 394 and set(ids).issubset({r['goalId'] for r in rows})
    config['landscapePath'] = candidate_ref['path']
    config['reportPath'] = str((OUT / f'checks/{name}394-normal-current-inactive.md').relative_to(ROOT))
    put(f'atomicity-memory/{name}394-exact-existing-current-science.inactive.config.json', config)
    if name == 'M':
        for path in [config['cardReviewPath'], *[s['viewPath'] for s in config['visibilityScopes']]]:
            bind(path)
    put(f'atomicity-memory/{name}394-original-lines-retained.actual.json', {
        'schemaVersion': 1,
        'role': 'Existing current scientific records retained exactly; only candidate landscape/report paths selected for normal technical check',
        'originalActiveConfig': bind(config_path),
        'originalCurrent394ReviewRawLines': bind(original_review),
        'selectedEightOriginalGoalIds': ids,
        'newScientificReview': False,
        'reviewIdOrScientificRowChanges': False,
        'all479SemanticFieldsUnchanged': True,
        'strictNet': 0,
        'humanApproval': False,
    })
put('inputs/registry-before-eight-active.exact.json', REGISTRY.read_bytes())
put('inputs/atlas-before-eight-active.exact.json', ATLAS.read_bytes())
put('inactive-current-eight-preflight.actual.json', {
    'schemaVersion': 1,
    'createdAt': datetime.now(timezone.utc).isoformat(),
    'role': 'Inactive technical preflight of whole8 original science and targeted current FCC successor; root authored P8 and is not an independent D/P reviewer',
    'normalDescriptionReviewIndicesPending': True,
    'independentFinalAndCurrentVisualizationAdoptionPending': True,
    'candidate': candidate_ref,
    'candidateKinds': kinds_ref,
    'goalIds': ids,
    'protected327WholeGoalBodiesExact': True,
    'other386WholeGoalBodiesExact': True,
    'onlyChangedFields': ['resourceLinks'],
    'denominatorBeforeAndAfter': 394,
    'all394CurrentAAndMScientificRowsUnchanged': True,
    'normalRequiredMCardReviewsAndEightVisibilityViewsRetained': True,
    'whole8ProfilesAnd16BilingualCasesUnchanged': True,
    'twoSeparateOriginalReviewIdsForP7AndP1Retained': True,
    'originalSource31AndCurrentSourceScope24Unchanged': True,
    'historical3312PartialOperationalizationAndSourceLimitsRetained': True,
    'actualOriginalAndCurrentAuthorSeals': [bind(ORIGINAL / 'author.final.freeze.json'), bind(CURRENT / 'author.targeted.final.freeze.json')],
    'currentRegularInputBindings': list(bindings.values()),
    'activeWrites': [],
    'strictNew': 0,
    'strictRestored': 0,
    'strictNet': 0,
    'humanApproval': False,
    'actualLearnerPerformanceEvidence': False,
})
print(json.dumps({'inactiveEightPreflight': 'READY', 'wholeGoals': 479, 'curricularAtomic': 394, 'changedRasterBindings': 8, 'protected327Exact': True, 'sourceInputs': len(bindings), 'activeWrites': 0, 'strictNet': 0}))
