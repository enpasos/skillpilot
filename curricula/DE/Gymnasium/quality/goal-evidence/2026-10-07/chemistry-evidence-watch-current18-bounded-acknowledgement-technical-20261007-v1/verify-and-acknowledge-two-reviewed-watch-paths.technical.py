"""Acknowledge exactly the already reviewed Chemistry integration watch delta."""
from pathlib import Path
import copy
import datetime
import hashlib
import importlib.util
import json
import sys

root = Path.cwd()
out = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location('native_watch', root / 'scripts/canonical_chemistry_evidence_watch.py')
watch = importlib.util.module_from_spec(spec)
spec.loader.exec_module(watch)
baseline_path = root / 'curricula/DE/Gymnasium/provenance/chemistry-evidence-watch-baseline.json'
old_baseline_path = out / 'before/chemistry-evidence-watch-baseline.json'
assert baseline_path.read_bytes() == old_baseline_path.read_bytes(), 'Preserve the existing baseline and stop on concurrent drift.'
manifest = watch.load_json(watch.MANIFEST_PATH)
assert watch.MANIFEST_PATH.read_bytes() == (out / 'before/chemistry-evidence-watch-manifest.json').read_bytes()
baseline = watch.load_json(baseline_path)
delta, changed, added, removed, unchanged = watch.diff_records(manifest, baseline)
expected = [
    'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json',
    'curricula/DE/Gymnasium/mapping/DE-BY/gymnasium/bavaria_chemistry_source_extraction_to_canonical_chemistry.review.json',
]
assert changed == expected and not added and not removed and len(unchanged) == 144
packet = root / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/chemie-final18-native-paired-integration-preparation-technical-20261007-v1'
plan_path = packet / 'guarded-root-current-Chem18-integration-plan.technical.json'
plan = watch.load_json(plan_path)
operations = {operation['target']: operation for operation in plan['fileOperations']}
history = packet / 'root-applied-history'
sha = lambda path: 'sha256:' + hashlib.sha256(path.read_bytes()).hexdigest()
verified = []
for relative_path in expected:
    operation = operations[relative_path]
    previous = history / relative_path
    current = root / relative_path
    assert sha(current) == operation['newDigest'] == operation['sourceDigest'] == sha(root / operation['source'])
    assert sha(previous) == operation['expectedOldDigest']
    previous_watch = hashlib.sha256(watch.canonical_evidence_payload(watch.load_json(previous))).hexdigest() if watch.hash_mode(relative_path) == watch.CANONICAL_EVIDENCE_HASH_MODE else watch.sha256(previous)
    assert previous_watch == delta['baselineRecords'][relative_path]['sha256']
    verified.append({'relativePath': relative_path, 'reviewedIntegrationPlanOperation': operation, 'historicalBeforePath': str(previous.relative_to(root)), 'historicalBeforeRawSha256': sha(previous), 'baselineWatchHash': previous_watch, 'currentWatchHash': delta['currentRecords'][relative_path]['sha256']})
old_canonical = watch.load_json(history / expected[0])
new_canonical = watch.load_json(root / expected[0])
assert {key: value for key, value in old_canonical.items() if key != 'goals'} == {key: value for key, value in new_canonical.items() if key != 'goals'}
old_goals = {goal['id']: goal for goal in json.loads(watch.canonical_evidence_payload(copy.deepcopy(old_canonical)))['goals']}
new_goals = {goal['id']: goal for goal in json.loads(watch.canonical_evidence_payload(copy.deepcopy(new_canonical)))['goals']}
assert list(old_goals) == list(new_goals) and len(old_goals) == 479
canonical_deltas = []
for goal_id in old_goals:
    fields = {key: {'before': old_goals[goal_id].get(key), 'after': new_goals[goal_id].get(key)} for key in sorted(set(old_goals[goal_id]) | set(new_goals[goal_id])) if old_goals[goal_id].get(key) != new_goals[goal_id].get(key)}
    if fields:
        canonical_deltas.append({'goalId': goal_id, 'fields': fields})
assert {entry['goalId'] for entry in canonical_deltas} == {'fd309753-4d48-5570-a4ec-09dfeb20ff9c', '22133f29-ef02-4408-8f8d-2bbea3275d91', '9751b6d8-cde3-527b-b37c-babb6cee79d2'}
old_mapping = watch.load_json(history / expected[1])
new_mapping = watch.load_json(root / expected[1])
assert {key: value for key, value in old_mapping.items() if key not in ['mappings', 'decisions']} == {key: value for key, value in new_mapping.items() if key not in ['mappings', 'decisions']}
assert new_mapping['mappings'][:len(old_mapping['mappings'])] == old_mapping['mappings'] and len(new_mapping['mappings']) == len(old_mapping['mappings']) + 2
new_routes = new_mapping['mappings'][len(old_mapping['mappings']):]
assert [(row['legacyGoalId'], row['canonicalGoalId'], row['matchType']) for row in new_routes] == [('7b5310e2-3b69-5a45-8966-f8523ea42fb9', '597ac03c-d25f-5c34-a87c-52c059c87295', 'partial'), ('7c68f201-5b73-5b1f-8576-cc1a23fafb83', '9751b6d8-cde3-527b-b37c-babb6cee79d2', 'exact')]
assert len(old_mapping['decisions']) == len(new_mapping['decisions'])
mapping_deltas = []
for index, (before, after) in enumerate(zip(old_mapping['decisions'], new_mapping['decisions'])):
    fields = {key: {'before': before.get(key), 'after': after.get(key)} for key in sorted(set(before) | set(after)) if before.get(key) != after.get(key)}
    if fields:
        assert set(fields) == {'canonicalGoalIds', 'rationale', 'reviewedAt', 'reviewer'}
        mapping_deltas.append({'index': index, 'fields': fields})
assert len(mapping_deltas) == 2
updated = copy.deepcopy(baseline)
for index, record in enumerate(updated['watchedFiles']):
    relative_path = record['relativePath']
    if relative_path in expected:
        updated['watchedFiles'][index] = delta['currentRecords'][relative_path]
old_rows = {record['relativePath']: record for record in baseline['watchedFiles']}
new_rows = {record['relativePath']: record for record in updated['watchedFiles']}
assert all(old_rows[relative_path] == new_rows[relative_path] for relative_path in unchanged)
updated['updatedAt'] = datetime.datetime.now(datetime.timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')
assert {key: value for key, value in updated.items() if key not in ['updatedAt', 'watchedFiles']} == {key: value for key, value in baseline.items() if key not in ['updatedAt', 'watchedFiles']}
receipt = {'documentType': 'Bounded technical acknowledgement of already independently reviewed Chemistry integration; zero new review', 'verifiedAtUTC': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'baselineBeforePath': str(old_baseline_path.relative_to(root)), 'baselineBeforeRawSha256': sha(old_baseline_path), 'reviewedIntegrationPlan': str(plan_path.relative_to(root)), 'reviewedIntegrationPlanSha256': sha(plan_path), 'exactChangedWatchPaths': verified, 'normalizedCanonicalDelta': canonical_deltas, 'unchangedCanonicalGoals': 476, 'wholeCanonicalGoalCount': 479, 'canonicalIdentityAndAllGraphEdgesScopesAndCountsUnchanged': True, 'addedBoundedSourceRoutes': new_routes, 'sourceDecisionDeltas': mapping_deltas, 'allOtherSourceDecisionsAndMappingsAndGlobalSummaryUnchanged': True, 'unchangedCompleteBaselineRecords': 144, 'watchedPathCountUnchanged': 146, 'watchManifestHashAlgorithmAndChecksUnchanged': True, 'scientificReviewsAdded': 0, 'scientificCompletionsAdded': 0, 'humanApprovalAdded': False, 'humanTrialAdded': False, 'strictGainClaim': 0, 'wholeSourceClosureClaim': False}
if '--apply' not in sys.argv:
    print(json.dumps({'result': 'PASS', 'mode': 'check only', 'changed': 2, 'added': 0, 'removed': 0, 'unchangedCompleteBaselineRecords': 144}))
else:
    receipt_path = out / 'bounded-watch-baseline-acknowledgement.actual.receipt.json'
    assert not receipt_path.exists()
    baseline_path.write_text(json.dumps(updated, indent=2, ensure_ascii=True) + '\n')
    receipt['baselineAfterRawSha256'] = sha(baseline_path)
    receipt_path.write_text(json.dumps(receipt, indent=2, ensure_ascii=False) + '\n')
    print(json.dumps({'result': 'PASS', 'mode': 'applied two reviewed baseline records', 'changed': 2, 'unchangedCompleteBaselineRecords': 144}))
