# SPDX-License-Identifier: Apache-2.0
"""Prepare ordinary image imports; genuine source and native pairs remain required."""
import copy
import hashlib
import json
from pathlib import Path

ROOT = Path.cwd()
OWN = Path(__file__).resolve().parent
BASE = OWN.parent
CANONICAL = ROOT / 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json'
NATIVE = BASE / 'biologie-evolution-current17-and-protected-contexts-native-preparation-author-v1'
ENTRY = NATIVE / 'neutral-current17-and-protected-contexts.native-independent-review.final.entry.json'
RASTERS = BASE / 'biologie-evolution-eighteen-current-reviewed-raster-handoff-root-v1/neutral-eighteen-current-independently-reviewed-rasters.native-preparation.entry.json'


def read(path):
    return json.loads(path.read_text())


def bind(path):
    raw = path.read_bytes()
    return {'path': path.relative_to(ROOT).as_posix(), 'sha256': 'sha256:' + hashlib.sha256(raw).hexdigest(), 'bytes': len(raw)}


def verify(binding):
    path = ROOT / binding['path']
    actual = bind(path)
    assert actual['sha256'].removeprefix('sha256:') == binding['sha256'].removeprefix('sha256:'), path
    assert 'bytes' not in binding or actual['bytes'] == binding['bytes'], path
    assert not path.is_symlink(), path
    return path


def put(path, data):
    assert not path.exists(), path
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')
    assert read(path) == data


native, rasters = read(ENTRY), read(RASTERS)
current = read(CANONICAL)
future_path = ROOT / native['candidateCanonicalPath']
future = read(future_path)
old = {row['id']: row for row in current['goals']}
new = {row['id']: row for row in future['goals']}
images = rasters['images']
image_ids = {row['goalId'] for row in images}
assert len(image_ids) == len(images) == 18
assert len(old) == len(new) == 479 and old.keys() == new.keys()
assert set(native['goalIds']) == image_ids - {native['heldGoalId']}
for goal_id, row in old.items():
    changed = {key for key in set(row) | set(new[goal_id]) if row.get(key) != new[goal_id].get(key)}
    assert changed == ({'resourceLinks'} if goal_id in image_ids else set()), (goal_id, changed)
assert {k: v for k, v in current.items() if k != 'goals'} == {k: v for k, v in future.items() if k != 'goals'}

operations = []
for image in images:
    goal_id, metadata = image['goalId'], image['metadata']
    assert image['currentBoundedMachineVDecision'] == 'KEEP'
    assert len(set(image['actualIndependentReviewers'])) == 2
    raster = verify(metadata['asset'])
    prompts = metadata.get('actualProviderPrompts', metadata.get('originalPrompts'))
    assert prompts
    original_prompt = verify(prompts[0])
    final_prompt = ROOT / metadata['selectedEditPromptPath'] if metadata.get('selectedEditPromptPath') else original_prompt
    reconstruction = verify(metadata['reconstructionPrompt'])
    provenance = verify(metadata.get('actualToolProvenance', metadata.get('provenance')))
    link = next(row for row in new[goal_id]['resourceLinks'] if row.get('type') == 'goal-visualization' and row.get('role') == 'primary')
    assert link == metadata['resourceLinkCandidate']
    assert link['license'] == 'CC-BY-4.0' and link['provider'] == metadata['provider']
    assert link['description'] == metadata['descriptionDe'] and link['altText'] == metadata['altTextDe']
    for asset_root in ['curricula/DE/Gymnasium/visualizations/biologie', 'app/public/assets/goal-visualizations/biologie', 'backend/src/main/resources/static/assets/goal-visualizations/biologie']:
        assert not (ROOT / asset_root / goal_id / f'{goal_id}.png').exists(), goal_id
    shared = ['--landscape', CANONICAL.relative_to(ROOT).as_posix(), '--subject', 'biologie', '--provider', metadata['provider'], '--review-status', 'pilot']
    operations.append({
        'ordinal': image['ordinal'], 'goalId': goal_id, 'actualImage': bind(raster),
        'actualFinalSubmittedPrompt': bind(final_prompt), 'originalGenerationPrompt': bind(original_prompt),
        'originalSubmittedPromptBindings': [bind(verify(value)) for value in prompts],
        'actualGenerationProvenance': bind(provenance), 'reconstructionPrompt': bind(reconstruction),
        'reconstructionWasSubmittedGenerationPrompt': False,
        'actualIndependentVPair': image['currentActualIndependentVPair'],
        'actualIndependentReviewers': image['actualIndependentReviewers'], 'reviewedResourceLink': link,
        'prepareArgv': ['node', 'scripts/prepare_goal_visualization.mjs', goal_id, *shared],
        'importArgv': ['node', 'scripts/import_goal_visualization.mjs', goal_id, raster.relative_to(ROOT).as_posix(), *shared, '--license', 'CC-BY-4.0', '--description', link['description'], '--alt-text', link['altText'], '--prompt', final_prompt.relative_to(ROOT).as_posix(), '--reconstruction-prompt', reconstruction.relative_to(ROOT).as_posix()],
    })

qa_path = ROOT / 'curricula/DE/Gymnasium/quality/goal-visualization-qa/biologie.qa.json'
old_qa = read(qa_path)
qa = copy.deepcopy(read(ROOT / native['portableVisualizationQAPath']))
assert len(old_qa['records']) == len(qa['records']) == 394
for before, after in zip(old_qa['records'], qa['records']):
    assert before['goalId'] == after['goalId']
    goal_id = after['goalId']
    if goal_id in image_ids:
        after['publicAssetPath'] = f'app/public/assets/goal-visualizations/biologie/{goal_id}/{goal_id}.png'
        after['canonicalAssetPath'] = f'curricula/DE/Gymnasium/visualizations/biologie/{goal_id}/{goal_id}.png'
        assert after['aiApproved'] == 'yes' and after['aiApprovedAssetSha256'] == after['assetSha256']
        assert after['assetSha256'] == bind(verify(next(row['metadata']['asset'] for row in images if row['goalId'] == goal_id)))['sha256']
    else:
        assert before == after, goal_id
    assert {k: v for k, v in before.items() if k.startswith('human')} == {k: v for k, v in after.items() if k.startswith('human')}, goal_id
future_qa = OWN / 'candidate/qa.current394.eighteen-genuine-V.future-active.json'
put(future_qa, qa)

protected_paths = [CANONICAL, qa_path,
    ROOT / 'curricula/DE/Gymnasium/quality/goal-book-publication/biologie.semantic-kinds.json',
    ROOT / 'curricula/DE/Gymnasium/quality/semantic-atomicity/canonical-biology-full.config.json',
    ROOT / 'curricula/DE/Gymnasium/quality/memory-card-review/canonical-biology-full.config.json',
    ROOT / 'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json',
    ROOT / 'curricula/DE/Gymnasium/quality/goal-description-review/in-flight-work-ledger.json',
    ROOT / 'app/scripts/config/goal-books/de-gym-biology-national-atlas.inputs.json',
    ROOT / 'app/scripts/config/curriculum-maturity-floor-policy.json']
for subject in ['MATHEMATIK', 'PHYSIK', 'CHEMIE']:
    protected_paths.append(ROOT / f'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_{subject}.de.json')
plan = OWN / 'eighteen-ordinary-import-plan.pending-final-source-native-pairs.json'
put(plan, {
    'schemaVersion': 1, 'role': 'Actual ordinary import preparation; no active adoption or new scientific review',
    'nativeEntry': bind(ENTRY), 'rasterEntry': bind(RASTERS), 'futureCanonical': bind(future_path),
    'futureVisualizationQA': bind(future_qa), 'beforeBindings': [bind(path) for path in protected_paths],
    'imageOperations': operations, 'exactResourceLinkChangedGoalIds': sorted(image_ids),
    'currentNativeDAndPGoalIds': native['goalIds'], 'protectedSourceContextGoalIds': native['actualProtectedSourceOrPageReviewIds'],
    'heldGoalId': native['heldGoalId'], 'heldAtomarityFinding': native['heldAtomarityFinding'],
    'all479DescriptionsAndRelationsExact': True, 'all394HumanQAFieldsExact': True, 'other376QARowsExact': True,
    'sourceAndCourseApproval': False, 'nativeDAndPApproval': False,
    'requiredBeforeAdoption': ['actual independent final source-role corrections and course boundaries', 'two independent current native D/P17 reviews with resolved findings', 'actual targeted protected15 source/page/context reviews', 'ordinary guarded active import and current validations'],
    'activeWrites': [], 'strictGain': 0, 'newScientificM7Closures': 0, 'restoredM7Bindings': 0,
    'humanApproval': False, 'humanTrial': False,
})
print(json.dumps({'ordinaryImportPlan': bind(plan), 'independentlyReviewedRasterOperations': len(operations), 'pendingNativeGoals': len(native['goalIds']), 'protectedSourceContexts': len(native['actualProtectedSourceOrPageReviewIds']), 'activeWrites': 0, 'strictGain': 0}))
