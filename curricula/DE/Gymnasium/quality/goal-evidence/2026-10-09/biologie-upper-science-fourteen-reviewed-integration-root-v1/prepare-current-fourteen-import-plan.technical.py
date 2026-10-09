# SPDX-License-Identifier: Apache-2.0
"""Prepare exact ordinary import operations; does not approve or adopt candidates."""
import copy
import hashlib
import json
from pathlib import Path

ROOT = Path.cwd()
OWN = Path(__file__).resolve().parent
BASE = OWN.parent
AUTHOR = BASE / 'biologie-upper-science-fourteen-whole-author-v1'
NATIVE = AUTHOR / 'native-targeted-two-v2'
IMAGES = BASE / 'biologie-upper-science-fourteen-image-author-root-v1'


def read(path):
    return json.loads(path.read_text())


def binding(path):
    raw = path.read_bytes()
    return {'path': str(path.relative_to(ROOT)),
            'sha256': 'sha256:' + hashlib.sha256(raw).hexdigest(), 'bytes': len(raw)}


def verify(value):
    path = ROOT / value['path']
    actual = binding(path)
    assert actual['sha256'] == 'sha256:' + value['sha256'].removeprefix('sha256:'), path
    if 'bytes' in value:
        assert actual['bytes'] == value['bytes'], path
    return path


def put(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    assert not path.exists(), path
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')


entry_path = NATIVE / 'neutral-targeted-two-native-independent-review.entry.json'
entry = read(entry_path)
image_path = IMAGES / 'neutral-final-fourteen-actual-pngs-v4-one-visible-rate-label.entry.json'
image_entry = read(image_path)
images = image_entry['entries']
ids = [image['goalId'] for image in images]
assert len(ids) == len(set(ids)) == 14
canonical_path = ROOT / 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json'
before = read(canonical_path)
candidate = read(ROOT / entry['candidateCanonicalPath'])
old_goals = {goal['id']: goal for goal in before['goals']}
new_goals = {goal['id']: goal for goal in candidate['goals']}
assert len(old_goals) == len(new_goals) == 479
assert set(old_goals) == set(new_goals)
en_id = '8375310d-1f7e-542d-9969-55ad4bd37f7c'
for gid, goal in old_goals.items():
    if gid not in ids:
        assert goal == new_goals[gid], gid
    else:
        changed = {key for key in set(goal) | set(new_goals[gid])
                   if goal.get(key) != new_goals[gid].get(key)}
        assert changed == ({'resourceLinks', 'descriptionEn'} if gid == en_id else {'resourceLinks'}), (gid, changed)

operations = []
for image in images:
    gid = image['goalId']
    raster = verify(image['image'])
    chain = image.get('actualPromptChain', [image['generationPrompt']])
    prompts = [verify(value) for value in chain]
    reconstruction = verify(image['reconstructionPrompt'])
    link = next(link for link in new_goals[gid]['resourceLinks']
                if link.get('type') == 'goal-visualization' and link.get('role') == 'primary')
    assert link['description'] == image['descriptionDe']
    assert link['altText'] == image['altTextDe']
    assert link['provider'] == image['provider']
    assert link['license'] == 'CC-BY-4.0'
    assert link['url'] == f'/assets/goal-visualizations/biologie/{gid}/{gid}.png'
    for root in ('curricula/DE/Gymnasium/visualizations/biologie',
                 'app/public/assets/goal-visualizations/biologie',
                 'backend/src/main/resources/static/assets/goal-visualizations/biologie'):
        assert not (ROOT / root / gid / f'{gid}.png').exists(), gid
    prepare = ['node', 'scripts/prepare_goal_visualization.mjs', gid,
               '--landscape', str(canonical_path.relative_to(ROOT)), '--subject', 'biologie',
               '--provider', image['provider'], '--review-status', 'pilot']
    command = ['node', 'scripts/import_goal_visualization.mjs', gid, str(raster.relative_to(ROOT)),
               '--landscape', str(canonical_path.relative_to(ROOT)), '--subject', 'biologie',
               '--provider', image['provider'], '--review-status', 'pilot', '--license', 'CC-BY-4.0',
               '--description', link['description'], '--alt-text', link['altText'],
               '--prompt', str(prompts[-1].relative_to(ROOT)),
               '--reconstruction-prompt', str(reconstruction.relative_to(ROOT))]
    operations.append({'goalId': gid, 'actualImage': binding(raster), 'originalPromptChain': chain,
                       'actualFinalGenerationPrompt': binding(prompts[-1]),
                       'reconstructionPrompt': binding(reconstruction),
                       'reconstructionIsSubmittedGenerationPrompt': False,
                       'actualGenerationReceipt': copy.deepcopy(image['actualGenerationReceipt']),
                       'reviewedResourceLink': copy.deepcopy(link),
                       'prepareArgv': prepare, 'importArgv': command})

source_path = ROOT / 'app/scripts/config/goal-books/de-gym-biology-national-atlas.inputs.json'
source = read(source_path)
shadow_source = read(NATIVE / 'source-atlas/atlas.inputs.book-local.inactive.json')
source_candidate = copy.deepcopy(source)
mapping_diff = [(n, old, new) for n, (old, new) in enumerate(zip(source['mappingPaths'], shadow_source['mappingPaths']))
                if old != new]
assert len(source['mappingPaths']) == len(shadow_source['mappingPaths'])
assert len(mapping_diff) == 1, mapping_diff
mapping_n, old_mapping, new_mapping = mapping_diff[0]
assert new_mapping.endswith('/remediation-v2/source/NI.same-partial-partners.candidate.mapping.json')
source_candidate['mappingPaths'][mapping_n] = new_mapping
assert {key for key in source if source[key] != source_candidate[key]} == {'mappingPaths'}
put(OWN / 'candidate/source-atlas-one-NI-primary-correction.future-active.json', source_candidate)

protected = [canonical_path, source_path,
             ROOT / 'curricula/DE/Gymnasium/quality/goal-book-publication/biologie.semantic-kinds.json',
             ROOT / 'curricula/DE/Gymnasium/quality/goal-visualization-qa/biologie.qa.json',
             ROOT / 'curricula/DE/Gymnasium/quality/semantic-atomicity/canonical-biology-full.config.json',
             ROOT / 'curricula/DE/Gymnasium/quality/memory-card-review/canonical-biology-full.config.json',
             ROOT / 'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json',
             ROOT / 'curricula/DE/Gymnasium/quality/goal-description-review/in-flight-work-ledger.json',
             ROOT / 'app/scripts/config/curriculum-maturity-floor-policy.json']
for subject in ('MATHEMATIK', 'PHYSIK', 'CHEMIE'):
    protected.append(ROOT / f'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_{subject}.de.json')
put(OWN / 'current-fourteen-ordinary-import-plan.pending-independent-final-pair.json', {
    'schemaVersion': 1, 'role': 'Technical guarded ordinary import plan; final actual independent pair required before application',
    'beforeBindings': [binding(path) for path in protected],
    'nativeEntry': binding(entry_path), 'imageEntry': binding(image_path),
    'futureCanonical': binding(ROOT / entry['candidateCanonicalPath']),
    'imageOperations': operations, 'exactGoalChanges': ids,
    'exactEN1DescriptionChange': en_id, 'other465GoalsExact': True,
    'sourceMappingDelta': {'index': mapping_n, 'before': old_mapping, 'after': new_mapping,
                           'wholeDecisionBodiesAndBothPartnersPreserved': True},
    'actualIndependentFinalPairRequired': True, 'activeWrites': 0,
    'strictGain': 0, 'humanApproval': False, 'humanTrial': False})
print(json.dumps({'ordinaryImportOperations': 14, 'expectedGoalChanges': 14,
                  'other465GoalsExact': True, 'sourceMappingPointerDelta': 1,
                  'activeWrites': 0, 'strictGain': 0}))
