# SPDX-License-Identifier: Apache-2.0
"""Preserve current live inputs before genuine two-new-goal/one-context adoption."""
from datetime import datetime, timezone
import hashlib
import json
from pathlib import Path
import shutil

ROOT = Path.cwd()
OWN = Path(__file__).resolve().parent
AUTHOR = OWN.parent / 'biologie-stoffwechsel-two-basic-companions-complete-author-20261008-v2'
SELECTED = {'0f50cad3-8c4e-5bc4-8833-3a1ecdd71d38', '32483d30-2162-50a5-a6cc-05b7f2467ab1'}
WORD = '576d59e2-397a-5654-b853-7c0c4870fbd3'
PARENT = '860c80f9-275e-5e5b-8586-cb6b38f6937d'

def load(path):
    return json.loads(path.read_text())

def bind(path):
    data = path.read_bytes()
    return {'path': str(path.relative_to(ROOT)), 'sha256': hashlib.sha256(data).hexdigest(), 'bytes': len(data)}

def exact(row):
    path = ROOT / row['path']
    data = path.read_bytes()
    assert hashlib.sha256(data).hexdigest() == row['sha256'].removeprefix('sha256:'), path
    assert len(data) == row['bytes'], path

def put(path, value):
    assert path.is_relative_to(OWN) and not path.exists(), path
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')

entry_path = AUTHOR / 'neutral-final-primary-refined-basis2.author.entry.json'
seal_path = AUTHOR / 'two-basic-complete.author.first-binding.freeze.json'
entry, seal = load(entry_path), load(seal_path)
assert bind(entry_path)['sha256'] == 'e816bf8e18821eda82749b3fc65cfd38dfe656d4e8905ed2bda70838bcd1b4fd'
assert bind(seal_path)['sha256'] == '390f6418d1d83486caed46bb6c3b0c91dd897012127b2d8d46663f2a1873975c'
assert set(entry['selectedGoalIds']) == SELECTED

registry_path = ROOT / 'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'
registry = load(registry_path)
biology = next(row for row in registry['subjects'] if row['subject'] == 'biologie')
paths = {
    'canonical': ROOT / biology['landscapePath'], 'qa': ROOT / biology['visualizationQaPath'],
    'kinds': ROOT / biology['semanticKindLedgerPath'], 'registry': registry_path,
    'sourceInputs': ROOT / 'app/scripts/config/goal-books/de-gym-biology-national-atlas.inputs.json',
    'atomicityConfig': ROOT / biology['semanticAtomicityConfigPath'],
    'memoryConfig': ROOT / biology['memoryReviewConfigPath'],
}
paths['atomicityRows'] = ROOT / load(paths['atomicityConfig'])['reviewPath']
paths['memoryRows'] = ROOT / load(paths['memoryConfig'])['reviewPath']
baseline = OWN.parent / 'biologie-stoffwechsel-first-three-reviewed-integration-root-20261008-v1/affected-central.stdout.actual.txt'
current_report = load(baseline)
bio_report = next(row for row in current_report['subjects'] if row['subject'] == 'biologie')
assert bio_report['denominator'] == 392 and bio_report['strictComplete'] == 244

current = load(paths['canonical'])
candidate_path = ROOT / entry['currentCanonicalPath']
candidate = load(candidate_path)
old_goals = {g['id']: g for g in current['goals']}
new_goals = {g['id']: g for g in candidate['goals']}
assert len(old_goals) == 476 and len(new_goals) == 478
assert set(new_goals) - set(old_goals) == SELECTED and not (set(old_goals) - set(new_goals))
changed = [gid for gid in old_goals if old_goals[gid] != new_goals[gid]]
assert len(changed) == 1, changed
parent = changed[0]
assert parent.startswith('860c80f9-'), parent
assert {k: v for k, v in old_goals[parent].items() if k not in {'contains', 'weight'}} == {
    k: v for k, v in new_goals[parent].items() if k not in {'contains', 'weight'}}
assert set(new_goals[parent]['contains']) - set(old_goals[parent]['contains']) == SELECTED
assert old_goals[WORD] == new_goals[WORD]

live_qa = load(paths['qa'])
qa_by_id = {row['goalId']: row for row in live_qa['records']}
assert len(qa_by_id) == 392
live_three = {'32f47903-0788-5c27-ac88-7464f481f2f7', '135447a0-5d55-564a-afc3-3e3fbed77819', 'ec782ce3-475e-5628-b3fe-947d72e74a74'}
assert all(qa_by_id[gid]['aiApproved'] == 'yes' for gid in live_three)
author_qa = {row['goalId']: row for row in load(ROOT / entry['currentQaPath'])['records']}
assert set(author_qa) - set(qa_by_id) == SELECTED
assert all(author_qa[gid] == qa_by_id[gid] for gid in qa_by_id if gid not in live_three)

retained_rows = {}
for label, config_key, path_key in [
    ('atomicity', 'atomicityAuthorConfigPath', 'atomicityRows'),
    ('memory', 'memoryAuthorConfigPath', 'memoryRows'),
]:
    active_rows = [json.loads(s) for s in paths[path_key].read_text().splitlines() if s.strip()]
    author_config = load(ROOT / entry[config_key])
    author_rows = [json.loads(s) for s in (ROOT / author_config['reviewPath']).read_text().splitlines() if s.strip()]
    active_by_id = {x['goalId']: x for x in active_rows}
    author_by_id = {x['goalId']: x for x in author_rows}
    assert len(active_by_id) == 392 and len(author_by_id) == 394
    assert set(author_by_id) - set(active_by_id) == SELECTED
    assert all(active_by_id[gid] == author_by_id[gid] for gid in active_by_id)
    retained_rows[label] = {'old392WholeRowsExact': True, 'newTwoActualAuthorDecisionsPendingIndependentWholeDP':
        [author_by_id[gid] for gid in sorted(SELECTED)], 'authorConfig': bind(ROOT / entry[config_key])}

word_owner = []
for path in biology['resolutionIndexPaths']:
    index = load(ROOT / path)
    if WORD in index.get('batchGoalIds', []):
        word_owner.append(path)
assert len(word_owner) == 1, word_owner
copies = {}
for label, path in paths.items():
    target = OWN / 'before' / (label + '.exact' + ('.jsonl' if path.suffix == '.jsonl' else '.json'))
    assert not target.exists()
    target.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(path, target)
    assert bind(target)['sha256'] == bind(path)['sha256']
    copies[label] = {'liveOriginal': bind(path), 'immutableBeforeCopy': bind(target)}

source_diff = load(ROOT / entry['finalSourceDiff']['path'])
assert source_diff['actualFinalChangedDutyCount'] == 9 and source_diff['actualFinalNewEdgeCount'] == 10
assert source_diff['allFourOriginalOperatorHoldsRetained'] is True
put(OWN / 'pending/current244-live-preservation-and-two-new-guard.actual.json', {
    'schemaVersion': 1, 'observedAtUtc': datetime.now(timezone.utc).isoformat(),
    'role': 'Actual pre-adoption preservation only; no scientific or active approval',
    'neutralFinalAuthorEntry': bind(entry_path), 'authorFirstSeal': bind(seal_path),
    'currentStrictReport': bind(baseline), 'currentStrictBiology': 244, 'currentDenominator': 392,
    'proposedNewGoalIds': sorted(SELECTED), 'proposedDenominator': 394,
    'exactCandidateCanonical': bind(candidate_path), 'immutableBeforeInputs': copies,
    'wholeCurrent475OtherGoalsExact': True, 'oneParentContainsWeightDelta': parent,
    'existingWordWholeGoalExact': True, 'existingWordGenuineNewExternalReverseRequiresReviewRequired': WORD,
    'existingWordOriginalDIndexPreserveImmutable': word_owner[0],
    'futureRegistryRequiresExplicitWordSupersessionNotHistoricalRewrite': True,
    'current392QARowsIncludingThreeNewMachineApprovalsMustBePreserved': True,
    'current392HumanFieldsMustBePreserved': True, 'exactExistingAtomicityAndMemoryReuse': retained_rows,
    'actualFinal9Duties10Edges': entry['finalSourceDiff'], 'originalFourOperatorHoldsRetained': True,
    'pairedWholeSourceDPNativeContextApproval': 'PENDING_ACTUAL_INDEPENDENT_A_B_FIRST_SEALS',
    'activeWrites': 0, 'strictGainClaimed': 0, 'humanApproval': False, 'humanTrial': False,
})
print(json.dumps({'current244BaselinePreserved': True, 'old392AMRowsExact': True,
    'live392QAIncludingNative3Preserved': True, 'newAtoms': 2, 'oneExistingWordContextReviewPending': WORD,
    'activeWrites': 0, 'strictGain': 0}))
