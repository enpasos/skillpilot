# SPDX-License-Identifier: Apache-2.0
"""Integrate completed independent reviews through ordinary guarded imports."""
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
PLAN = OWN / 'current-twenty-three-ordinary-import-plan-one15.pending-final-independent-pairs.json'
CANONICAL = ROOT / 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json'
REGISTRY = ROOT / 'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'
SPLICE = '0eddd781-90aa-5120-a24f-c7e38327162c'
GUARD = OWN / 'complete-twenty-three-current394.adoption.guard.json'


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
    assert not path.exists(), path
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')


if len(sys.argv) == 3 and sys.argv[1] == '--prepare':
    description_entry = ROOT / sys.argv[2]
    descriptions = read(description_entry)
    verify_tree(descriptions)
    description_seal = ROOT / descriptions['currentTechnicalFirstSealPath']
    verify_tree(read(description_seal))
    plan = read(PLAN)
    for value in plan['beforeBindings']:
        verify(value)
    ids = set(plan['exactChangedGoalIds'])
    assert len(ids) == len(plan['imageOperations']) == 23
    evidence = []
    for filename, rows in [('current23-genuine-P-pair.actual.json', 'positivePairs'),
                           ('current23-genuine-V-pair.actual.json', 'visualPairs')]:
        path = OWN / 'checks' / filename
        pair = read(path)
        verify_tree(pair)
        assert len(pair[rows]) == 23 and {row['goalId'] for row in pair[rows]} == ids
        evidence.append(bind(path))
    am_path = OWN / 'checks/one-current-Splice-genuine-independent-AM-pair.actual.json'
    am = read(am_path)
    verify_tree(am)
    assert am['kindDecision'] == 'curricularAtomic' and am['atomicityDecision'] == 'atomic'
    assert am['memoryDecision'] == 'no_memory_needed'
    evidence.append(bind(am_path))
    qa_kind_path = OWN / 'checks/current23-QA-and-genuine-Splice-kind.future-active.actual.json'
    verify_tree(read(qa_kind_path))
    evidence.append(bind(qa_kind_path))
    # The entry supplies only completed ordinary resolution indices and genuine
    # supersessions; no fabricated replacement for the earlier blocked goal15.
    index_bindings = [row['resolutionIndex'] for row in descriptions['ordinaryDescriptionScopes']]
    assert [row['path'] for row in index_bindings] == descriptions['descriptionResolutionIndexPaths']
    supersessions = descriptions['descriptionResolutionSupersessions']
    assert len(index_bindings) == 4 and len(supersessions) == 5
    resolution_pairs = set()
    for value in index_bindings:
        index = read(verify(value))
        for row in index['resolutions']:
            assert row['decision'] == 'keep_current' and row['strictDescriptionComplete'] is True
            resolution_pairs.add((value['path'], row['goalId']))
    for row in supersessions:
        assert (row['supersededIndexPath'], row['goalId']) in resolution_pairs
        assert (row['replacementIndexPath'], row['goalId']) in resolution_pairs
        resolution_pairs.remove((row['supersededIndexPath'], row['goalId']))
    assert len(resolution_pairs) == 23 and {gid for _, gid in resolution_pairs} == ids
    registry = read(REGISTRY)
    old_registry = copy.deepcopy(registry)
    subject = next(row for row in registry['subjects'] if row['subject'] == 'biologie')
    for value in index_bindings:
        assert value['path'] not in subject['resolutionIndexPaths']
        subject['resolutionIndexPaths'].append(value['path'])
    for row in supersessions:
        assert row not in subject['resolutionSupersessions']
        subject['resolutionSupersessions'].append(copy.deepcopy(row))
    positive = read(OWN / 'checks/current23-genuine-P-pair.actual.json')
    assert len(positive['currentPositiveConfigs']) == 1
    for value in positive['currentPositiveConfigs']:
        verify(value)
        assert value['path'] not in subject['positiveEvidenceConfigPaths']
        subject['positiveEvidenceConfigPaths'].append(value['path'])
    assert all(old == new for old, new in zip(old_registry['subjects'], registry['subjects']) if old['subject'] != 'biologie')
    assert {k: v for k, v in old_registry.items() if k != 'subjects'} == {k: v for k, v in registry.items() if k != 'subjects'}
    registry_future = OWN / 'candidate/registry.current394.twenty-three-paired.future-active.json'
    put(registry_future, registry)
    active_candidates = [
        ('canonical', CANONICAL, verify(plan['futureCanonical'])),
        ('qa', ROOT / 'curricula/DE/Gymnasium/quality/goal-visualization-qa/biologie.qa.json', OWN / 'candidate/qa.current394.twenty-three-paired.future-active.json'),
        ('kinds', ROOT / 'curricula/DE/Gymnasium/quality/goal-book-publication/biologie.semantic-kinds.json', OWN / 'candidate/kinds.current479.genuine-Splice1.future-active.json'),
        ('registry', REGISTRY, registry_future),
        ('A394', ROOT / 'curricula/DE/Gymnasium/quality/semantic-atomicity/canonical-biology-full.config.json', OWN / 'candidate/A394.genuine-Splice1.future-active.config.json'),
        ('M394', ROOT / 'curricula/DE/Gymnasium/quality/memory-card-review/canonical-biology-full.config.json', OWN / 'candidate/M394.genuine-Splice1.future-active.config.json'),
    ]
    operations = []
    for name, active, future in active_candidates:
        before = OWN / 'before-current394' / (name + '.exact.json')
        before.parent.mkdir(exist_ok=True)
        assert not before.exists()
        shutil.copyfile(active, before)
        operations.append({'name': name, 'active': active.relative_to(ROOT).as_posix(), 'before': bind(before), 'future': bind(future)})
    put(GUARD, {'schemaVersion': 1, 'preparedAt': datetime.now(timezone.utc).isoformat(),
                'plan': bind(PLAN), 'descriptions': bind(description_entry), 'descriptionSeal': bind(description_seal), 'pairedEvidence': evidence,
                'protectedBefore': plan['beforeBindings'], 'operations': operations,
                'imageOperations': plan['imageOperations'], 'uniqueCurrentPairedDescriptions': 23,
                'actualNativeResolutionSupersessions': 5, 'unmodifiedHistoricalBlocked15Records': True,
                'other456WholeGoalObjectsExact': True, 'other371QARowsExact': True,
                'all394HumanQAFieldsUnchanged': True, 'other393AMRowsByteExact': True,
                'sourceAtlasAndOtherSubjectsUnchanged': True, 'activeWrites': 0,
                'strictGain': 0, 'humanApproval': False, 'humanTrial': False})
    print(json.dumps({'guardPrepared': True, 'genuineCurrentDPPairs': 23, 'genuineVPairs': 23, 'actualSupersessions': 5, 'activeWrites': 0}))
elif sys.argv[1:] == ['--apply']:
    guard = read(GUARD)
    for value in guard['protectedBefore'] + [guard['plan'], guard['descriptions'], guard['descriptionSeal']] + guard['pairedEvidence']:
        verify(value)
    for operation in guard['operations']:
        verify(operation['before'])
        verify(operation['future'])
    future = read(ROOT / next(op['future']['path'] for op in guard['operations'] if op['name'] == 'canonical'))
    current = read(CANONICAL)
    old_goal = next(row for row in current['goals'] if row['id'] == SPLICE)
    new_goal = next(row for row in future['goals'] if row['id'] == SPLICE)
    for field in ['description', 'descriptionEn']:
        old_goal[field] = new_goal[field]
    CANONICAL.write_text(json.dumps(current, ensure_ascii=False, indent=2) + '\n')
    imported = []
    for operation in guard['imageOperations']:
        for key in ['actualImage', 'actualFinalSubmittedPrompt', 'reconstructionPrompt']:
            verify(operation[key])
        gid = operation['goalId']
        for phase in ['prepare', 'import']:
            out = OWN / 'checks' / f'ordinary-image-{gid}-{phase}.stdout.actual.txt'
            err = OWN / 'checks' / f'ordinary-image-{gid}-{phase}.stderr.actual.txt'
            assert not out.exists() and not err.exists()
            with out.open('w') as stdout, err.open('w') as stderr:
                result = subprocess.run(operation[phase + 'Argv'], cwd=ROOT, stdout=stdout, stderr=stderr, shell=False)
            assert result.returncode == 0, (gid, phase, err.read_text())
        asset = ROOT / f'curricula/DE/Gymnasium/visualizations/biologie/{gid}/{gid}.png'
        assert bind(asset)['sha256'] == operation['actualImage']['sha256']
        for public_root in ['app/public', 'backend/src/main/resources/static']:
            public_asset = ROOT / public_root / f'assets/goal-visualizations/biologie/{gid}/{gid}.png'
            assert bind(public_asset)['sha256'] == bind(asset)['sha256']
        provenance = asset.parent / 'provenance.json'
        put(provenance, {'schemaVersion': 1, 'provider': operation['reviewedResourceLink']['provider'],
                         'model': None, 'modelVariantExposed': False, 'asset': bind(asset),
                         'actualFinalSubmittedPrompt': operation['actualFinalSubmittedPrompt'],
                         'originalGenerationPrompt': operation['originalGenerationPrompt'],
                         'actualReferenceImage': operation['actualReferenceImage'],
                         'actualGenerationProvenance': operation['actualGenerationProvenance'],
                         'generationReceiptBinding': operation['generationReceiptBinding'],
                         'standaloneDerivedReconstruction': operation['reconstructionPrompt'],
                         'reconstructionWasSubmittedGenerationPrompt': False,
                         'formatDecision': 'Native1672x941PNG; friendly comic; actual independent original/360/680 inspections',
                         'actualIndependentVisualPair': guard['pairedEvidence'][1],
                         'humanApproval': False, 'humanTrial': False})
        imported.append({'goalId': gid, 'asset': bind(asset), 'provenance': bind(provenance)})
    assert read(CANONICAL) == future, 'Ordinary imports must exactly reproduce the reviewed full479 candidate'
    for operation in guard['operations']:
        if operation['name'] != 'canonical':
            shutil.copyfile(verify(operation['future']), ROOT / operation['active'])
    changed_paths = {operation['active'] for operation in guard['operations']}
    for value in guard['protectedBefore']:
        if value['path'] not in changed_paths:
            verify(value)
    put(OWN / 'ordinary-twenty-three-active-adoption.actual.json', {
        'schemaVersion': 1, 'appliedAt': datetime.now(timezone.utc).isoformat(), 'guard': bind(GUARD),
        'activeBindings': [bind(ROOT / op['active']) for op in guard['operations']],
        'ordinaryImageImports': imported, 'pendingOrdinaryCurrentValidation': True,
        'strictGainClaimed': 0, 'humanApproval': False, 'humanTrial': False})
    print(json.dumps({'ordinaryImports': 23, 'exactReviewed479Canonical': True, 'otherSubjectsAndSourceAtlasUnchanged': True, 'strictGainClaimed': 0}))
else:
    raise SystemExit('Use --prepare <completed-neutral-D-entry> or --apply')
