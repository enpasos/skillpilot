# SPDX-License-Identifier: Apache-2.0
"""Prepare/apply only the sixteen reviewed resource and machine-QA changes."""
import copy
import hashlib
import json
import shutil
import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path.cwd()
OWN = Path(__file__).resolve().parent
BASE = OWN.parent

def read(path):
    return json.loads(path.read_text())

def bind(path):
    return {'path': str(path.relative_to(ROOT)), 'sha256': hashlib.sha256(path.read_bytes()).hexdigest(), 'bytes': path.stat().st_size}

def verify(value):
    path = ROOT / value['path']
    assert bind(path)['sha256'] == value['sha256'].removeprefix('sha256:'), path
    if 'bytes' in value:
        assert path.stat().st_size == value['bytes'], path
    return path

def put(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    assert not path.exists(), path
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')

canonical = ROOT / 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json'
qa_path = ROOT / 'curricula/DE/Gymnasium/quality/goal-visualization-qa/biologie.qa.json'
registry_path = ROOT / 'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'
native_path = BASE / 'biologie-upper-communication-evaluation-sixteen-native-author-technical-resumed-v1/neutral-sixteen-native-independent-review.entry.json'
entry = read(native_path)
pair_path = OWN / 'checks/current-sixteen-PV-pair.actual.json'
pair = read(pair_path)
ids = [r['goalId'] for r in pair['pairedWholeProfiles']]
assert len(ids) == 16 and pair['activeWrites'] == 0 and not pair['humanApproval']
assert (OWN / 'native-d-sixteen-current/resolution-index.json').is_file()

if sys.argv[1:] == ['--prepare']:
    before = read(canonical)
    current = {g['id']: g for g in before['goals']}
    assert len(current) == 479, 'Integrate the independently reviewed Basis2 supplement first'
    assert {'0f50cad3-8c4e-5bc4-8833-3a1ecdd71d38', '32483d30-2162-50a5-a6cc-05b7f2467ab1'} <= set(current)
    candidate = copy.deepcopy(before)
    original_reviewed = {g['id']: g for g in read(ROOT / entry['candidateCanonicalPath'])['goals']}
    for goal in candidate['goals']:
        gid = goal['id']
        if gid not in ids:
            continue
        assert {k: v for k, v in goal.items() if k != 'resourceLinks'} == {k: v for k, v in original_reviewed[gid].items() if k != 'resourceLinks'}, gid
        goal['resourceLinks'] = copy.deepcopy(original_reviewed[gid]['resourceLinks'])
    next_goals = {g['id']: g for g in candidate['goals']}
    assert {gid for gid in current if current[gid] != next_goals[gid]} == set(ids)

    qa_before = read(qa_path)
    patch = {r['goalId']: r for r in read(OWN / 'candidate/visualization-qa.sixteen-reviewed-rows.future-active.patch.json')['records']}
    qa = copy.deepcopy(qa_before)
    assert len(qa['records']) == 394
    for n, row in enumerate(qa['records']):
        if row['goalId'] in ids:
            assert row['visualizationState'] == 'missing', row['goalId']
            new = copy.deepcopy(patch[row['goalId']])
            assert {k: v for k, v in row.items() if k.startswith('human')} == {k: v for k, v in new.items() if k.startswith('human')}
            new['chatGptNotes'] = 'Two completed independent machine image reviews paired; current evidence in aiNotes. No human approval.'
            qa['records'][n] = new

    registry_before = read(registry_path)
    registry = copy.deepcopy(registry_before)
    sub = next(s for s in registry['subjects'] if s['subject'] == 'biologie')
    for key, path in [('resolutionIndexPaths', OWN / 'native-d-sixteen-current/resolution-index.json'),
                      ('positiveEvidenceConfigPaths', OWN / 'positive/current-sixteen.future-active.config.json')]:
        relative = str(path.relative_to(ROOT))
        assert relative not in sub[key]
        sub[key].append(relative)
    for old, new in zip(registry_before['subjects'], registry['subjects']):
        if old['subject'] != 'biologie':
            assert old == new

    operations = []
    roots = [ROOT / 'curricula/DE/Gymnasium/visualizations/biologie', ROOT / 'app/public/assets/goal-visualizations/biologie',
             ROOT / 'backend/src/main/resources/static/assets/goal-visualizations/biologie']
    for row in entry['rasterBindings']:
        gid = row['goalId']
        image = verify(row['actualOriginalImage'])
        prompts = [verify(value) for value in row['originalPrompts']]
        assert len(prompts) == 1
        reconstruction = verify(row['reconstructionPrompt']) if row['reconstructionPrompt'] else None
        for root in roots:
            assert not (root / gid / f'{gid}.png').exists()
        for name in ('prompt.de.md', 'image-reconstruction-prompt.de.md', 'provenance.json'):
            assert not (roots[0] / gid / name).exists()
        operations.append({'goalId': gid, 'image': bind(image), 'prompt': bind(prompts[0]),
                           'reconstruction': bind(reconstruction) if reconstruction else None,
                           'originalRasterBinding': row, 'resourceLink': row['resourceLinkCandidate']})
    for name, path in [('canonical', canonical), ('qa', qa_path), ('registry', registry_path)]:
        backup = OWN / 'before-current394' / f'{name}.exact.json'
        backup.parent.mkdir(exist_ok=True)
        assert not backup.exists()
        shutil.copyfile(path, backup)
    put(OWN / 'candidate/canonical479.reviewed-sixteen.future-active.json', candidate)
    put(OWN / 'candidate/qa394.reviewed-sixteen.future-active.json', qa)
    put(OWN / 'candidate/registry.reviewed-sixteen.future-active.json', registry)
    protected = [ROOT / 'curricula/DE/Gymnasium/quality/goal-book-publication/biologie.semantic-kinds.json',
                 ROOT / 'app/scripts/config/goal-books/de-gym-biology-national-atlas.inputs.json',
                 ROOT / 'app/scripts/config/curriculum-maturity-floor-policy.json',
                 ROOT / 'curricula/DE/Gymnasium/quality/goal-description-review/in-flight-work-ledger.json']
    for subject in ('MATHEMATIK', 'PHYSIK', 'CHEMIE'):
        protected.append(ROOT / f'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_{subject}.de.json')
    put(OWN / 'reviewed-sixteen-current394.guard.json', {
        'schemaVersion': 1, 'preparedAt': datetime.now(timezone.utc).isoformat(),
        'before': [bind(p) for p in (canonical, qa_path, registry_path)],
        'candidates': [bind(OWN / 'candidate' / name) for name in ('canonical479.reviewed-sixteen.future-active.json', 'qa394.reviewed-sixteen.future-active.json', 'registry.reviewed-sixteen.future-active.json')],
        'pair': bind(pair_path), 'nativeD': bind(OWN / 'native-d-sixteen-current/resolution-index.json'),
        'positive': bind(OWN / 'positive/current-sixteen.future-active.config.json'),
        'protected': [bind(p) for p in protected], 'imageOperations': operations,
        'other463WholeGoalsAnd378QARowsExact': True, 'all394HumanFieldsExact': True,
        'activeWrites': 0, 'strictGain': 0, 'humanApproval': False})
    print(json.dumps({'guardPrepared': True, 'wholeGoals': 479, 'atoms': 394, 'onlyReviewedResourceChanges': 16, 'activeWrites': 0}))
elif sys.argv[1:] == ['--apply']:
    guard = read(OWN / 'reviewed-sixteen-current394.guard.json')
    for value in guard['before'] + guard['candidates'] + guard['protected'] + [guard['pair'], guard['nativeD'], guard['positive']]:
        verify(value)
    roots = [ROOT / 'curricula/DE/Gymnasium/visualizations/biologie', ROOT / 'app/public/assets/goal-visualizations/biologie',
             ROOT / 'backend/src/main/resources/static/assets/goal-visualizations/biologie']
    for op in guard['imageOperations']:
        gid = op['goalId']
        image = verify(op['image'])
        for root in roots:
            destination = root / gid / f'{gid}.png'
            assert not destination.exists()
            destination.parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(image, destination)
        shutil.copyfile(verify(op['prompt']), roots[0] / gid / 'prompt.de.md')
        if op['reconstruction']:
            shutil.copyfile(verify(op['reconstruction']), roots[0] / gid / 'image-reconstruction-prompt.de.md')
        put(roots[0] / gid / 'provenance.json', {
            'schemaVersion': 1, 'provider': op['resourceLink']['provider'], 'actualAsset': bind(roots[0] / gid / f'{gid}.png'),
            'originalNativeAuthorEntry': bind(native_path), 'originalRasterBinding': op['originalRasterBinding'],
            'actualGenerationPrompt': op['prompt'], 'actualRasterDerivedReconstructionPrompt': op['reconstruction'],
            'reconstructionPromptStatus': op['originalRasterBinding']['reconstructionPromptStatus'],
            'pairedIndependentActualVisualEvidence': guard['pair'], 'license': 'CC-BY-4.0',
            'machineVisualApproval': True, 'generationIsApproval': False, 'humanApproval': False})
    for before, candidate in zip(guard['before'], guard['candidates']):
        shutil.copyfile(verify(candidate), ROOT / before['path'])
    for value in guard['protected']:
        verify(value)
    put(OWN / 'sixteen-applied-current394.central-pending.actual.json', {
        'schemaVersion': 1, 'appliedAt': datetime.now(timezone.utc).isoformat(), 'goalIds': ids,
        'currentActiveBindings': [bind(p) for p in (canonical, qa_path, registry_path)],
        'wholeGoals': 479, 'atoms': 394, 'newImageTargetBindings': 16,
        'actualNewGenerationMotifs': 9, 'goodExistingImageTargetBindingsKept': 7,
        'all394HumanFieldsExact': True, 'activeCentralChecks': 'pending', 'strictGainClaimed': 0, 'humanApproval': False})
    print(json.dumps({'guardedApply': 'PASS', 'imageTargetBindings': 16, 'currentCentral': 'pending', 'strictGainClaimed': 0}))
else:
    raise SystemExit('Use --prepare or --apply')
