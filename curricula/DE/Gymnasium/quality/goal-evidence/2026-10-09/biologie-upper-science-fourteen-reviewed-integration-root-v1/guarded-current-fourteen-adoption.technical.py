# SPDX-License-Identifier: Apache-2.0
"""Apply actual paired evidence with ordinary image import and exact change guards."""
import copy
import hashlib
import json
import shutil
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path.cwd()
OWN = Path(__file__).resolve().parent
AUTHOR = OWN.parent / 'biologie-upper-science-fourteen-whole-author-v1'


def read(path):
    return json.loads(path.read_text())


def bind(path):
    raw = path.read_bytes()
    return {'path': str(path.relative_to(ROOT)), 'sha256': 'sha256:' + hashlib.sha256(raw).hexdigest(), 'bytes': len(raw)}


def verify(value):
    path = ROOT / value['path']
    actual = bind(path)
    assert actual['sha256'] == 'sha256:' + value['sha256'].removeprefix('sha256:'), path
    if 'bytes' in value:
        assert actual['bytes'] == value['bytes'], path
    return path


def verify_tree(value):
    if isinstance(value, dict):
        if isinstance(value.get('path'), str) and isinstance(value.get('sha256'), str):
            verify(value)
        for child in value.values():
            verify_tree(child)
    elif isinstance(value, list):
        for child in value:
            verify_tree(child)


def put(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    assert not path.exists(), path
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')


plan_path = OWN / 'current-fourteen-ordinary-import-plan.pending-independent-final-pair.json'
pair_path = OWN / 'checks/current-fourteen-genuine-PV-AM-pair.actual.json'
d_path = AUTHOR / 'integration-preparation-v1/neutral-genuine-D14-D2-and-final-P14.integration-ready.entry.json'
canonical_path = ROOT / 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json'
qa_path = ROOT / 'curricula/DE/Gymnasium/quality/goal-visualization-qa/biologie.qa.json'
kinds_path = ROOT / 'curricula/DE/Gymnasium/quality/goal-book-publication/biologie.semantic-kinds.json'
registry_path = ROOT / 'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'
source_path = ROOT / 'app/scripts/config/goal-books/de-gym-biology-national-atlas.inputs.json'
en_id = '8375310d-1f7e-542d-9969-55ad4bd37f7c'

if sys.argv[1:] == ['--prepare']:
    plan, pair, descriptions = read(plan_path), read(pair_path), read(d_path)
    verify_tree(descriptions)
    verify_tree(read(ROOT / descriptions['firstFreezePath']))
    verify_tree(pair)
    for value in plan['beforeBindings']:
        verify(value)
    assert len(pair['positivePairs']) == len(pair['visualPairs']) == len(plan['imageOperations']) == 14
    ids = set(plan['exactGoalChanges'])
    canonical = read(verify(plan['futureCanonical']))
    current_qa = read(qa_path)
    patch_path = OWN / 'candidate/visualization-qa.fourteen-actual-paired.future-active.patch.json'
    patch = {row['goalId']: row for row in read(patch_path)['records']}
    assert set(patch) == ids and len(current_qa['records']) == 394
    qa = copy.deepcopy(current_qa)
    for n, row in enumerate(qa['records']):
        if row['goalId'] in ids:
            new = patch[row['goalId']]
            assert {k: v for k, v in row.items() if k.startswith('human')} == {k: v for k, v in new.items() if k.startswith('human')}
            qa['records'][n] = copy.deepcopy(new)
    kinds = read(kinds_path)
    candidate_kinds = read(AUTHOR / 'native-targeted-two-v2/candidate/semantic-kinds.current394.path-only.inactive.json')
    target_kind = next(row for row in candidate_kinds['decisions'] if row['goalId'] == en_id)
    old_kind = next(row for row in kinds['decisions'] if row['goalId'] == en_id)
    assert target_kind['semanticKind'] == old_kind['semanticKind'] == 'curricularAtomic'
    assert {key for key in target_kind if target_kind[key] != old_kind[key]} == {'sourceFingerprint'}
    next(row for row in kinds['decisions'] if row['goalId'] == en_id)['sourceFingerprint'] = target_kind['sourceFingerprint']
    registry = read(registry_path)
    before_registry = copy.deepcopy(registry)
    subject = next(row for row in registry['subjects'] if row['subject'] == 'biologie')
    for key in ['originalD14Index', 'currentTargetedD2Index']:
        value = descriptions[key]
        verify(value)
        assert value['path'] not in subject['resolutionIndexPaths']
        subject['resolutionIndexPaths'].append(value['path'])
    for supersession in descriptions['resolutionSupersessions']:
        assert supersession['goalId'] in {'b66372fc-f72d-5686-9570-1939ed3fbd2a', en_id}
        assert supersession not in subject['resolutionSupersessions']
        subject['resolutionSupersessions'].append(copy.deepcopy(supersession))
    assert len(descriptions['resolutionSupersessions']) == 2
    for value in pair['currentPositiveConfigs']:
        verify(value)
        assert value['path'] not in subject['positiveEvidenceConfigPaths']
        subject['positiveEvidenceConfigPaths'].append(value['path'])
    assert all(old == new for old, new in zip(before_registry['subjects'], registry['subjects']) if old['subject'] != 'biologie')
    operations = []
    for name, active, candidate in [
        ('canonical', canonical_path, canonical), ('qa', qa_path, qa), ('kinds', kinds_path, kinds),
        ('registry', registry_path, registry),
        ('source-inputs', source_path, read(OWN / 'candidate/source-atlas-one-NI-primary-correction.future-active.json')),
    ]:
        before = OWN / 'before-current394' / f'{name}.exact.json'
        before.parent.mkdir(exist_ok=True)
        assert not before.exists()
        shutil.copyfile(active, before)
        future = OWN / 'candidate' / f'{name}.current394.paired.future-active.json'
        put(future, candidate)
        operations.append({'name': name, 'active': str(active.relative_to(ROOT)), 'before': bind(before), 'future': bind(future)})
    for item in pair['genuineEN1AtomicityMemoryPairs']:
        active = ROOT / ('curricula/DE/Gymnasium/quality/semantic-atomicity/canonical-biology-full.config.json' if item['label'] == 'A394'
                         else 'curricula/DE/Gymnasium/quality/memory-card-review/canonical-biology-full.config.json')
        cfg = read(active)
        assert cfg['reviewPath'] == item['original']['path']
        cfg['reviewPath'] = item['adopted']['path']
        before = OWN / 'before-current394' / f"{item['label']}-config.exact.json"
        shutil.copyfile(active, before)
        future = OWN / 'candidate' / f"{item['label']}-config.future-active.json"
        put(future, cfg)
        operations.append({'name': item['label'], 'active': str(active.relative_to(ROOT)), 'before': bind(before), 'future': bind(future)})
    put(OWN / 'complete-fourteen-current394.adoption.guard.json', {
        'schemaVersion': 1, 'preparedAt': datetime.now(timezone.utc).isoformat(),
        'plan': bind(plan_path), 'pair': bind(pair_path), 'descriptions': bind(d_path),
        'protectedBefore': plan['beforeBindings'], 'operations': operations,
        'imageOperations': plan['imageOperations'], 'unchanged465GoalObjects': True,
        'unchanged380QARows': True, 'all394HumanQAFieldsUnchanged': True,
        'other393AtomicityAndMemoryRowsByteExact': True, 'unmodifiedHistoricalFirstReviews': True,
        'activeWrites': 0, 'strictGain': 0, 'humanApproval': False, 'humanTrial': False})
    print(json.dumps({'guardPrepared': True, 'actualPVPairs': 14, 'actualD14andD2': True, 'activeWrites': 0}))
elif sys.argv[1:] == ['--apply']:
    guard = read(OWN / 'complete-fourteen-current394.adoption.guard.json')
    for value in guard['protectedBefore'] + [guard['plan'], guard['pair'], guard['descriptions']]:
        verify(value)
    for operation in guard['operations']:
        verify(operation['before'])
        verify(operation['future'])
    future_canon = read(ROOT / next(op['future']['path'] for op in guard['operations'] if op['name'] == 'canonical'))
    current = read(canonical_path)
    current_goal = next(row for row in current['goals'] if row['id'] == en_id)
    current_goal['descriptionEn'] = next(row for row in future_canon['goals'] if row['id'] == en_id)['descriptionEn']
    canonical_path.write_text(json.dumps(current, ensure_ascii=False, indent=2) + '\n')
    imported = []
    for operation in guard['imageOperations']:
        verify(operation['actualImage'])
        verify(operation['actualFinalGenerationPrompt'])
        verify(operation['reconstructionPrompt'])
        for phase, argv in [('prepare', operation['prepareArgv']), ('import', operation['importArgv'])]:
            out = OWN / 'checks' / f"ordinary-image-{operation['goalId']}-{phase}.stdout.actual.txt"
            err = OWN / 'checks' / f"ordinary-image-{operation['goalId']}-{phase}.stderr.actual.txt"
            assert not out.exists() and not err.exists()
            with out.open('w') as stdout, err.open('w') as stderr:
                result = subprocess.run(argv, cwd=ROOT, stdout=stdout, stderr=stderr, shell=False)
            assert result.returncode == 0, (argv, err.read_text())
        gid = operation['goalId']
        actual = ROOT / f'curricula/DE/Gymnasium/visualizations/biologie/{gid}/{gid}.png'
        assert bind(actual)['sha256'] == operation['actualImage']['sha256']
        provenance = actual.parent / 'provenance.json'
        put(provenance, {'schemaVersion': 1, 'provider': operation['reviewedResourceLink']['provider'],
                         'model': None, 'modelVariantExposed': False, 'asset': bind(actual),
                         'actualFinalGenerationPrompt': operation['actualFinalGenerationPrompt'],
                         'originalPromptChain': operation['originalPromptChain'],
                         'actualGenerationReceipt': operation['actualGenerationReceipt'],
                         'standaloneDerivedReconstruction': operation['reconstructionPrompt'],
                         'reconstructionWasSubmittedGenerationPrompt': False,
                         'formatDecision': 'Native1672x941PNG, friendly comic, actual original/360/680 independent inspections',
                         'independentMachinePair': guard['pair'], 'humanApproval': False, 'humanTrial': False})
        imported.append({'goalId': gid, 'asset': bind(actual), 'provenance': bind(provenance)})
    assert read(canonical_path) == future_canon, 'Ordinary imported full479 canonical must exactly equal the reviewed candidate'
    for operation in guard['operations']:
        if operation['name'] != 'canonical':
            shutil.copyfile(verify(operation['future']), ROOT / operation['active'])
    put(OWN / 'ordinary-fourteen-active-adoption.actual.json', {
        'schemaVersion': 1, 'appliedAt': datetime.now(timezone.utc).isoformat(),
        'guard': bind(OWN / 'complete-fourteen-current394.adoption.guard.json'),
        'activeBindings': [bind(ROOT / op['active']) for op in guard['operations']],
        'ordinaryImageImports': imported, 'pendingOrdinaryCurrentValidation': True,
        'strictGainClaimed': 0, 'humanApproval': False, 'humanTrial': False})
    print(json.dumps({'ordinaryImports': 14, 'exactReviewed479Canonical': True, 'whole394QAAndKinds': True,
                      'unchanged380OtherQAAnd465Goals': True, 'humanApproval': False, 'strictGainClaimed': 0}))
else:
    raise SystemExit('Use --prepare or --apply')
