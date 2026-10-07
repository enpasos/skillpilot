"""Guarded integration of frozen independent science, images and native bindings.

This script copies reviewed artifacts and records the exact integration. It is
not a description, positive-evidence, atomicity, memory or visual reviewer.
"""
import copy
import datetime
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[7]
OUT = Path(__file__).resolve().parent
QUALITY = ROOT / 'curricula/DE/Gymnasium/quality'
PLAN = QUALITY / 'goal-evidence/2026-10-07/biologie-neuro21-final-native-d-campaigns-integration-plan-author-20261007-v1/concrete-native-integration-plan.author.json'
PAIRED = QUALITY / 'goal-evidence/2026-10-07/biologie-neuro21-final-native-paired-d-synthesis-technical-preparation-20261007-v1'
VRECEIPT = QUALITY / 'goal-visualization-review/biologie-neuro21-paired-current-visual-synthesis-root-20261007-v1/twenty-one-exact-rasters-paired-visual-decisions.actual.receipt.json'
REGISTRY = QUALITY / 'deep-understanding-rollout/de-gymnasium-math-physics.config.json'
LEDGER = QUALITY / 'goal-description-review/in-flight-work-ledger.json'


def load(path):
    return json.loads(path.read_text())


def digest(path):
    return 'sha256:' + hashlib.sha256(path.read_bytes()).hexdigest()


def binding(path):
    return {'path': str(path.relative_to(ROOT)), 'sha256': digest(path), 'bytes': path.stat().st_size}


def verify(record):
    path = ROOT / record['path']
    assert digest(path) == record['sha256'] and path.stat().st_size == record['bytes'], record['path']


def write(path, data):
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')


assert (ROOT / 'AGENTS.md').is_file(), ROOT
assert not (OUT / 'reviewed-active-integration.actual.receipt.json').exists()
plan = load(PLAN)
old_registry = load(REGISTRY)
old_ledger = load(LEDGER)
routes = [plan['canonical'], plan['semanticKindLedger']]
routes += [row for row in plan['sourceRoutes'] if row['action'] != 'reuse_exact_existing']
routes += plan['currentAM']['recordRoutes']
for kind in ['atomicity', 'memory']:
    route = plan['currentAM'][kind + 'Config']
    routes.append({
        'destination': route['destination'],
        'source': binding(PAIRED / f'operative/future-active-{kind}.config.author.json'),
        'currentDestination': route['currentDestination'],
    })
for row in plan['imageRoutes']:
    routes += row['nativeCopyRoutes'] + row['nativeMetadataRoutes']
assert len(plan['imageRoutes']) == 21
selected = {row['goalId'] for row in plan['imageRoutes']}
for route in routes:
    verify(route['source'])
    destination = ROOT / route['destination']
    if route['currentDestination']:
        verify(route['currentDestination'])
    else:
        assert not destination.exists(), destination
for row in plan['sourceRoutes']:
    verify(row['source'])
verify(plan['D_P_registry']['currentDestination'])
verify(plan['visualizationQa']['currentDestination'])
for view in plan['currentAM']['memoryEightViewBindings']:
    verify(view)

# Unchanged reviewed decisions are reused; twelve substantive A/M decisions
# were independently reviewed in the named earlier dossier.
bio_before = next(s for s in old_registry['subjects'] if s['subject'] == 'biologie')
am_review = QUALITY / 'goal-evidence/2026-10-07/biologie-neuro-twelve-current-semantic-memory-independent-root-v2'
am_reuse = []
for index, key, name in [(0, 'semanticAtomicityConfigPath', 'atomicity'), (1, 'memoryReviewConfigPath', 'memory')]:
    current_config = load(ROOT / bio_before[key])
    current = {r['goalId']: r for r in map(json.loads, (ROOT / current_config['reviewPath']).read_text().splitlines())}
    next_path = ROOT / plan['currentAM']['recordRoutes'][index]['source']['path']
    next_records = {r['goalId']: r for r in map(json.loads, next_path.read_text().splitlines())}
    actual_independent_records = {r['goalId']: r for r in map(json.loads, (am_review / f'{name}.full390.review.jsonl').read_text().splitlines())}
    assert next_records == actual_independent_records
    changed = [g for g in next_records if next_records[g] != current[g]]
    assert len(current) == len(next_records) == 390 and len(changed) == 12
    assert set(changed) <= selected
    am_reuse.append({'kind': name, 'unchangedWholeRecords': 378, 'actualPreviouslyIndependentlyReviewedChangedGoalIds': changed, 'independentRecordBinding': binding(am_review / f'{name}.full390.review.jsonl')})
current_m = load(ROOT / bio_before['memoryReviewConfigPath'])
assert (ROOT / current_m['cardReviewPath']).read_bytes() == (ROOT / plan['currentAM']['recordRoutes'][2]['source']['path']).read_bytes()

canonical_before = load(ROOT / plan['canonical']['destination'])
canonical_next = load(ROOT / plan['canonical']['source']['path'])
before_goals = {g['id']: g for g in canonical_before['goals']}
next_goals = {g['id']: g for g in canonical_next['goals']}
assert before_goals.keys() == next_goals.keys() and len(next_goals) == 472
assert all(before_goals[g] == next_goals[g] for g in before_goals if g not in selected)
assert all(before_goals[g].get(k) == next_goals[g].get(k) for g in before_goals for k in ['id', 'requires', 'contains'])

# Merge actual paired PNG judgments while retaining all human fields verbatim.
qa_path = ROOT / plan['visualizationQa']['destination']
qa_before = load(qa_path)
qa_next = copy.deepcopy(qa_before)
scaffold = load(ROOT / plan['visualizationQa']['candidateScaffold']['path'])
candidate_rows = {r['goalId']: r for r in scaffold['records']}
verdicts = {r['goalId']: r for r in load(VRECEIPT)['entries']}
assert verdicts.keys() == selected
now = datetime.datetime.now(datetime.timezone.utc).isoformat()
for row in qa_next['records']:
    goal_id = row['goalId']
    if goal_id not in selected:
        continue
    old_human = {k: v for k, v in row.items() if k.lower().startswith('human')}
    v = verdicts[goal_id]
    assert v['pairedVisualDecision'] in ['KEEP', 'KEEP_after_targeted_regeneration']
    assert v['actualWidthsReviewedByBoth'] == [360, 680]
    for field in ['asset', 'reviewA', 'reviewB']:
        record = {**v[field], 'sha256': 'sha256:' + v[field]['sha256'].removeprefix('sha256:')}
        verify(record)
    row.update(candidate_rows[goal_id])
    assert {k: x for k, x in row.items() if k.lower().startswith('human')} == old_human
    assert row['humanApproved'] == 'no' and row['humanIssueIdentified'] == 'no'
    assert row['assetSha256'] == 'sha256:' + v['asset']['sha256'].removeprefix('sha256:')
    row.update({
        'aiApproved': 'yes',
        'aiApprovedAssetSha256': row['assetSha256'],
        'aiReviewedAt': now,
        'aiReviewer': 'Two independent Codex science and actual-raster reviewers, A and B',
        'aiNotes': f"Paired KEEP for this exact PNG after actual scientific and visual review at 360 and 680 pixels. Current final native D/P bindings independently checked. Decisions: {VRECEIPT.relative_to(ROOT)}; A={v['reviewA']['path']}; B={v['reviewB']['path']}. Machine visualization approval; Human Approval and Human Trial remain open.",
    })
assert [r for r in qa_next['records'] if r['goalId'] not in selected] == [r for r in qa_before['records'] if r['goalId'] not in selected]
assert len(qa_next['records']) == len(qa_before['records'])

registry_next = copy.deepcopy(old_registry)
bio_next = next(s for s in registry_next['subjects'] if s['subject'] == 'biologie')
new_indices = [str((PAIRED / f'native-d-{name}/resolution-index.json').relative_to(ROOT)) for name in ['twenty', 'one']]
assert not any(p in bio_next['resolutionIndexPaths'] for p in new_indices)
all_new_ids = []
for path in new_indices:
    idx = load(ROOT / path)
    assert all(r['strictDescriptionComplete'] for r in idx['resolutions'])
    all_new_ids += idx['batchGoalIds']
assert len(all_new_ids) == 21 and set(all_new_ids) == selected
bio_next['resolutionIndexPaths'] += new_indices
positive_path = str((OUT / 'positive21.current-image-bound.config.json').relative_to(ROOT))
assert positive_path not in bio_next['positiveEvidenceConfigPaths']
bio_next['positiveEvidenceConfigPaths'].append(positive_path)
bio_next['semanticAtomicityConfigPath'] = plan['currentAM']['atomicityConfig']['destination']
bio_next['memoryReviewConfigPath'] = plan['currentAM']['memoryConfig']['destination']
assert [s for s in old_registry['subjects'] if s['subject'] != 'biologie'] == [s for s in registry_next['subjects'] if s['subject'] != 'biologie']

ledger_next = copy.deepcopy(old_ledger)
completed_paths = [p for p in old_ledger['activeBatchConfigPaths'] if 'm7-q2-neurobiology-' in p]
assert len(completed_paths) == 2
reserved = []
for p in completed_paths:
    reserved += load(ROOT / p)['goalIds']
assert len(reserved) == 21 and set(reserved) == selected
ledger_next['activeBatchConfigPaths'] = [p for p in old_ledger['activeBatchConfigPaths'] if p not in completed_paths]

# Preserve exact pre-integration state in this new dossier, never historical edits.
backup = OUT / 'before-integration'
assert not backup.exists()
backup.mkdir()
for label, path in [('canonical.json', ROOT / plan['canonical']['destination']), ('semantic-kinds.json', ROOT / plan['semanticKindLedger']['destination']), ('registry.json', REGISTRY), ('in-flight-ledger.json', LEDGER), ('visualization-qa.json', qa_path)]:
    (backup / label).write_bytes(path.read_bytes())

integrated = []
for route in routes:
    path = ROOT / route['destination']
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes((ROOT / route['source']['path']).read_bytes())
    integrated.append({'source': route['source'], 'previousDestination': route['currentDestination'], 'activeDestination': binding(path)})
write(qa_path, qa_next)
write(REGISTRY, registry_next)
write(LEDGER, ledger_next)
write(OUT / 'reviewed-active-integration.actual.receipt.json', {
    'role': 'Integration of independently reviewed machine curriculum evidence',
    'completedAtUTC': now,
    'currentGoalIds': sorted(selected),
    'integratedRoutes': integrated,
    'canonicalUnselectedWholeGoalsPreserved': 451,
    'current472IDsAndAllRequiresContainsPreserved': True,
    'amReuse': am_reuse,
    'memoryCardRecordsAndEightViewsPreserved': True,
    'allUnselectedVisualizationQaRecordsAndAllHumanFieldsPreserved': True,
    'newNativeDescriptionIndexPaths': new_indices,
    'newPositiveEvidenceConfigPath': positive_path,
    'completedInFlightBatchPaths': completed_paths,
    'mathPhysicsChemistryRegistryDeclarationsPreserved': True,
    'remainingWholeCountrySourcePairsHOLD': 189,
    'humanApproval': False, 'humanTrial': False,
    'strictProgress': 'Pending actual completed central five-gate report',
    'activeCanonical': binding(ROOT / plan['canonical']['destination']),
    'activeQa': binding(qa_path), 'activeRegistry': binding(REGISTRY), 'activeLedger': binding(LEDGER),
})
print(json.dumps({'integratedGoalCount': len(selected), 'copyRoutes': len(routes), 'strictGain': 'pending central report', 'humanApproval': False}))
