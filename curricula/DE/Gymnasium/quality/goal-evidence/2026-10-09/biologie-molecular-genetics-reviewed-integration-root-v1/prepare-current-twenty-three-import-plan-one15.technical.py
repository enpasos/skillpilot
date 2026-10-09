# SPDX-License-Identifier: Apache-2.0
"""Prepare ordinary imports and exact guards, without approval or active writes."""
import copy
import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path.cwd()
OWN = Path(__file__).resolve().parent
BASE = OWN.parent
IMAGE_ENTRY = BASE / 'biologie-molecular-genetics-twenty-three-whole-author-v1/images-author-v1/one-crossing-over-locus-marker-remedy-v2-portable/neutral-all23-current-selected-images-with-one-marker-successor.author-review.entry.json'
NATIVE = BASE / 'biologie-molecular-genetics-one-crossing-over-native-successor-preparation-author-v1'
CANONICAL = ROOT / 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json'

def read(path):
    return json.loads(path.read_text())

def bind(path):
    data = path.read_bytes()
    return {'path': path.relative_to(ROOT).as_posix(), 'sha256': 'sha256:' + hashlib.sha256(data).hexdigest(), 'bytes': len(data)}

def verify(value):
    path = ROOT / value['path']
    actual = bind(path)
    assert actual['sha256'].removeprefix('sha256:') == value['sha256'].removeprefix('sha256:'), path
    assert 'bytes' not in value or actual['bytes'] == value['bytes'], path
    return path

def put(path, value):
    assert not path.exists(), path
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')

images = read(IMAGE_ENTRY)['entries']
ids = {row['goalId'] for row in images}
assert len(images) == len(ids) == 23
before = read(CANONICAL)
future_path = NATIVE / 'candidate/canonical.current479.one15-raster-successor.inactive.json'
future = read(future_path)
old = {row['id']: row for row in before['goals']}
new = {row['id']: row for row in future['goals']}
assert len(old) == len(new) == 479 and old.keys() == new.keys()
splice = '0eddd781-90aa-5120-a24f-c7e38327162c'
for gid, row in old.items():
    changed = {key for key in set(row) | set(new[gid]) if row.get(key) != new[gid].get(key)}
    expected = {'resourceLinks', 'description', 'descriptionEn'} if gid == splice else {'resourceLinks'} if gid in ids else set()
    assert changed == expected, (gid, changed, expected)

operations = []
for image in images:
    gid = image['goalId']
    raster = verify(image['assetBinding'])
    original_prompt = verify(image['originalPromptBinding'])
    final_prompt = verify(image.get('selectedEditPromptBinding', image['originalPromptBinding']))
    reconstruction = verify(image['reconstructionPromptBinding'])
    link = next(v for v in new[gid]['resourceLinks'] if v.get('type') == 'goal-visualization' and v.get('role') == 'primary')
    assert link['title'] == f"Visualisierung: {new[gid]['title']}"
    assert link['description'] == image['descriptionDe'] and link['altText'] == image['altTextDe']
    assert link['provider'] == image['provider'] and link['license'] == 'CC-BY-4.0'
    assert link['url'] == f'/assets/goal-visualizations/biologie/{gid}/{gid}.png'
    for asset_root in ['curricula/DE/Gymnasium/visualizations/biologie', 'app/public/assets/goal-visualizations/biologie', 'backend/src/main/resources/static/assets/goal-visualizations/biologie']:
        assert not (ROOT / asset_root / gid / f'{gid}.png').exists(), gid
    prepare = ['node', 'scripts/prepare_goal_visualization.mjs', gid, '--landscape', CANONICAL.relative_to(ROOT).as_posix(), '--subject', 'biologie', '--provider', image['provider'], '--review-status', 'pilot']
    import_argv = ['node', 'scripts/import_goal_visualization.mjs', gid, raster.relative_to(ROOT).as_posix(), '--landscape', CANONICAL.relative_to(ROOT).as_posix(), '--subject', 'biologie', '--provider', image['provider'], '--review-status', 'pilot', '--license', 'CC-BY-4.0', '--description', link['description'], '--alt-text', link['altText'], '--prompt', final_prompt.relative_to(ROOT).as_posix(), '--reconstruction-prompt', reconstruction.relative_to(ROOT).as_posix()]
    operations.append({'ordinal': image['ordinal'], 'goalId': gid, 'actualImage': bind(raster), 'originalGenerationPrompt': bind(original_prompt), 'actualFinalSubmittedPrompt': bind(final_prompt), 'actualReferenceImage': image.get('referenceOriginalImageBinding'), 'actualGenerationProvenance': copy.deepcopy(image['actualGenerationProvenance']), 'generationReceiptBinding': image.get('generationReceiptBinding'), 'reconstructionPrompt': bind(reconstruction), 'reconstructionWasSubmittedGenerationPrompt': False, 'reviewedResourceLink': copy.deepcopy(link), 'prepareArgv': prepare, 'importArgv': import_argv})

protected_paths = [CANONICAL,
    ROOT / 'curricula/DE/Gymnasium/quality/goal-visualization-qa/biologie.qa.json',
    ROOT / 'curricula/DE/Gymnasium/quality/goal-book-publication/biologie.semantic-kinds.json',
    ROOT / 'curricula/DE/Gymnasium/quality/semantic-atomicity/canonical-biology-full.config.json',
    ROOT / 'curricula/DE/Gymnasium/quality/memory-card-review/canonical-biology-full.config.json',
    ROOT / 'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json',
    ROOT / 'curricula/DE/Gymnasium/quality/goal-description-review/in-flight-work-ledger.json',
    ROOT / 'app/scripts/config/goal-books/de-gym-biology-national-atlas.inputs.json',
    ROOT / 'app/scripts/config/curriculum-maturity-floor-policy.json',
]
for subject in ['MATHEMATIK', 'PHYSIK', 'CHEMIE']:
    protected_paths.append(ROOT / f'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_{subject}.de.json')
put(OWN / 'current-twenty-three-ordinary-import-plan-one15.pending-final-independent-pairs.json', {
    'schemaVersion': 1, 'preparedAt': datetime.now(timezone.utc).isoformat(),
    'role': 'Technical ordinary import plan; actual independent current final D/P/A/M/V pairs required before use',
    'imageEntry': bind(IMAGE_ENTRY), 'futureCanonical': bind(future_path),
    'beforeBindings': [bind(path) for path in protected_paths], 'imageOperations': operations,
    'exactChangedGoalIds': sorted(ids), 'onlyChangedDEENDescription': splice,
    'other456WholeGoalObjectsExact': True, 'current394DenominatorRetained': True,
    'protected276CurrentGoalsExact': True,
    'actualIndependentCurrentPairsRequired': True, 'activeWrites': 0,
    'strictGain': 0, 'newScientificClosures': 0, 'humanApproval': False, 'humanTrial': False,
})
print(json.dumps({'ordinaryImportOperations': 23, 'other456WholeGoalsExact': True, 'onlyDescriptionChange': splice, 'activeWrites': 0, 'strictGain': 0}))
