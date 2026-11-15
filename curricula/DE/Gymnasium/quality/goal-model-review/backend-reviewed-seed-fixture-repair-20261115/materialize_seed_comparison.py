#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Bind reviewed fixture deltas to actual native/API observations, fail closed on other IDs."""
import argparse
import gzip
import hashlib
import json
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[6]
HERE = Path(__file__).resolve().parent
BASE = 'a7c7e9ceb26f06194e25f29e32941d4e4cb17c32'
FIRST = '5bf8228635aed4eee780fdb98f4b7ee2af6d480a'
FIRST_TASKS = {'57bf531d-0920-5424-bef4-f704f5462477', 'c76fae5e-70e6-5f20-9abe-e9e790d95324', 'd9c49084-084e-5142-859c-33c53403ccf1', 'f4fda40d-dca5-510b-bd6d-f7874b3d7b9b'}
ELEMENTARY = {'54ce7136-5bdd-5d36-b0a5-f9a781bff82a', '148a0b27-5895-5331-ab90-bf40c0ee5d5c', '4f265904-c805-57c3-8b40-25a1d32c7e7f'}
ADVANCED = {'496f16a0-c031-5753-b988-d6cd3cab595e', '80c232f1-8f72-5829-9dbe-5a610ccab3be', 'd668c22d-caeb-5e91-8980-721c931a2bcf', 'fcfbff12-bd03-52ec-b242-a693212b3d2b'}
CONSTRUCT = 'f39c49c7-003b-471a-a33e-6cfea1d7b7b1'
PHYSICS_BASIC = {'7badac4d-2874-5b3a-87e8-bf8f4440b2a6', '9f265f49-1342-5ba7-9c5d-54e97fdb2f19', 'a8d99168-62cc-5771-bb5d-9ba833d84193'}
DIODE = {'dc55adac-91a5-5cc3-ab47-be008480616f', '8670cff6-fe9c-5f7e-8cba-d170134965a6'}
TRANSISTOR = {'77ab31a9-8961-511c-8637-06e98023d869', '2cfd5c6a-a16a-5f90-aab7-b27b29271f72'}
BAND_EXAM = {'1abfd5ef-1f42-5b71-8c9a-80c0a6b0322e'}

def read(path):
    path = Path(path)
    return json.loads(gzip.decompress(path.read_bytes()) if path.suffix == '.gz' else path.read_text())

def digest(path):
    return 'sha256:' + hashlib.sha256(Path(path).read_bytes()).hexdigest()

def pin(path):
    path = Path(path).resolve()
    return {'path': str(path.relative_to(ROOT)), 'sha256': digest(path)}

def expected_delta(request):
    subject, scope = request['subject'], request['scope']
    state, duration = scope['jurisdiction'], scope['durationModel']
    if subject in {'Biologie', 'Chemie'}:
        return set(), set()
    if subject == 'Physik':
        added = PHYSICS_BASIC | (DIODE if state in {'DE-BW', 'DE-BY', 'DE-HE', 'DE-SL', 'DE-SN'} else set())
        if state == 'DE-BY':
            added |= TRANSISTOR
        return added, BAND_EXAM
    assert subject == 'Mathematik'
    if state == 'DE-RP':
        return set(), ADVANCED
    if state == 'DE-HE' and duration == 'G9':
        return ELEMENTARY - {'54ce7136-5bdd-5d36-b0a5-f9a781bff82a'}, ADVANCED | {CONSTRUCT}
    if state in {'DE-HE', 'DE-SH'}:
        return ELEMENTARY, ADVANCED
    if state == 'DE-BY':
        return FIRST_TASKS, set()
    return FIRST_TASKS | ELEMENTARY, set()

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--baseline-results', type=Path, required=True)
    parser.add_argument('--first-results', type=Path, required=True)
    parser.add_argument('--write', action='store_true')
    args = parser.parse_args()
    requests = read(HERE / 'requested-fixture-scopes.actual.json')['requests']
    before = {row['key']: row for row in read(args.baseline_results)}
    first = {row['key']: row for row in read(args.first_results)}
    current = {row['key']: row for row in read(HERE / 'current-api-seed-scopes-before.actual.json')['scopes']}
    keys = {row['key'] for row in requests}
    assert len(keys) == 128 and keys == before.keys() == first.keys() == current.keys()
    failures = read(HERE / 'backend-original-failed-counts.actual.json')['cases']
    labels = {}
    rows = {}
    all_added, all_removed = set(), set()
    for request in requests:
        key = request['key']
        b, f, c = (set(group[key]['seedAtomicGoalIds']) for group in (before, first, current))
        assert before[key]['learningScopeApplied'] and first[key]['learningScopeApplied']
        assert len(b) == request['existingExpectedSeeds'], key
        added, removed = expected_delta(request)
        assert c - b == added and b - c == removed, (key, c - b, b - c)
        if request['subject'] != 'Mathematik':
            assert c == f, key
        else:
            expected_later_added = added & ELEMENTARY
            expected_later_removed = removed & {CONSTRUCT}
            assert c - f == expected_later_added and f - c == expected_later_removed, key
        s = request['scope']
        label = (request['subject'] + ' ' if 'Science' in request['fixtureMethod'] else '') + s['jurisdiction']
        if 'CrossStage' in request['fixtureMethod']:
            label += ' ' + s['courseProfile']
        label += ' ' + s['durationModel'] + ' reviewed seeds'
        labels[label] = (request['fixtureMethod'], len(b), len(f))
        base_preparation = set(before[key]['closureAddedTargetGoalIds'])
        first_preparation = set(first[key]['closureAddedTargetGoalIds'])
        current_preparation = set(current[key]['targetGoalIds']) - c
        rows[key] = {
            'subject': request['subject'], 'scope': s, 'fixtureMethod': request['fixtureMethod'],
            'baselineSeedCount': len(b), 'firstReviewedSeedCount': len(f), 'currentSeedCount': len(c),
            'baselineSeedAtomicGoalIds': sorted(b), 'firstReviewedSeedAtomicGoalIds': sorted(f),
            'currentSeedAtomicGoalIds': sorted(c), 'addedSeedAtomicGoalIds': sorted(added),
            'removedSeedAtomicGoalIds': sorted(removed),
            'baselineRequiredPreparationGoalIds': sorted(base_preparation),
            'firstReviewedRequiredPreparationGoalIds': sorted(first_preparation),
            'currentRequiredPreparationGoalIds': sorted(current_preparation),
            'currentClosedLearningCount': len(current[key]['targetGoalIds']),
        }
        all_added |= added
        all_removed |= removed
    assert len(failures) == 64
    for failure in failures:
        assert labels[failure['label']] == (failure['test'], failure['expected'], failure['actual'])
    assert sum(b != f for _, b, f in labels.values()) == 64
    assert sum(row['baselineSeedCount'] != row['currentSeedCount'] for row in rows.values()) == 64
    # No production logic is changed to obtain the fixture updates.
    for reference in (BASE, FIRST):
        assert not subprocess.check_output(['git', 'diff', reference, '--', 'backend/src/main'], cwd=ROOT).strip()
    witnesses = []
    changed_ids = all_added | all_removed
    for path in sorted((ROOT / 'curricula/DE/Gymnasium/canonical').glob('*.json')):
        document = read(path)
        for goal in document.get('goals', []):
            if goal['id'] in changed_ids:
                witnesses.append({'goalId': goal['id'], 'title': goal['title'], 'canonical': pin(path),
                                  'goalSha256': 'sha256:' + hashlib.sha256(json.dumps(goal, sort_keys=True, ensure_ascii=False, separators=(',', ':')).encode()).hexdigest()})
    assert {row['goalId'] for row in witnesses} == changed_ids
    payload = {
        'status': 'reviewed-source-deltas-reproduced-with-native-backend-and-current-API',
        'baselineCommit': BASE, 'firstReviewedCommit': FIRST, 'scopeCount': 128,
        'historicalCIFailurePairsReproduced': 64, 'changedScopeCount': 64,
        'unchangedBiologyChemistryScopes': 64, 'backendProductionChanges': [],
        'addedSeedGoalIdsUnion': sorted(all_added), 'removedSeedGoalIdsUnion': sorted(all_removed),
        'inputs': [pin(HERE / 'requested-fixture-scopes.actual.json'), pin(HERE / 'current-api-seed-scopes-before.actual.json'),
                   pin(HERE / 'backend-original-failed-counts.actual.json'), pin(args.baseline_results), pin(args.first_results)],
        'sourceWitnesses': witnesses,
        'separateSeedAndClosureContract': 'Counts pin S only; canonical required preparation is measured separately and the existing independent DTO/closure assertions remain in force.',
        'scopes': rows,
    }
    output = HERE / 'seed-scope-comparison.actual.json'
    rendered = json.dumps(payload, ensure_ascii=False, indent=2) + '\n'
    if args.write:
        output.write_text(rendered)
    else:
        assert output.read_text() == rendered, 'Comparison receipt differs; do not refresh without reviewing the actual delta'
    print(json.dumps({'scopes': 128, 'baselineMatches': 128, 'oldCIFailurePairsReproduced': 64,
                      'changedScopes': 64, 'unchangedBioChemScopes': 64, 'addedGoalIds': len(all_added),
                      'removedGoalIds': len(all_removed), 'receipt': str(output.relative_to(ROOT))}))

if __name__ == '__main__':
    main()
