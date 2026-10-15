# SPDX-License-Identifier: Apache-2.0
"""Actual finite preservation checks; no semantic reviews or active writes."""
import hashlib
import importlib.util
import json
import sys
from datetime import datetime, timezone
from pathlib import Path

REPO = Path.cwd()
PREFIX = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-14')
OUT = PREFIX / 'chemie-rest6-two-whole-atoms-on-final-source6-current412-minimal-inactive-technical-20261014-v1'
AUTHOR = PREFIX / 'chemie-source-six-original-residual-duty-author-20261014-v1'

def read(path):
    return json.loads(path.read_text())

def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def binding(path):
    return {'path': str(path), 'sha256': sha(path), 'bytes': path.stat().st_size}

def dump(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')

def diffs(left, right, pointer=''):
    if type(left) is not type(right):
        return [pointer]
    if isinstance(left, dict):
        result = [f'{pointer}/{key}' for key in left.keys() ^ right.keys()]
        for key in left.keys() & right.keys():
            result += diffs(left[key], right[key], f'{pointer}/{key}')
        return result
    if isinstance(left, list):
        if len(left) != len(right):
            return [pointer]
        return [item for index, pair in enumerate(zip(left, right)) for item in diffs(*pair, f'{pointer}/{index}')]
    return [] if left == right else [pointer]

def main():
    started = datetime.now(timezone.utc).isoformat()
    captured = read(OUT / 'INPUTS.exact-final539-existing-science-and-stock-contracts.actual.json')
    for row in captured['files']:
        path = Path(row['path'])
        assert path.is_file() and sha(path) == row['sha256'] and path.stat().st_size == row['bytes'], row
    canonical_path = OUT / 'candidate/canonical542.prospective414.on-final-source6-539.minimal-inactive.json'
    canonical = read(canonical_path)
    goal_by_id = {g['id']: g for g in canonical['goals']}
    hold = read(AUTHOR / 'HOLD.BB-BE-c307-exact52-current-ordinary-acquisition-goals.no-blanket-scope-grant.json')
    assert len(hold['exactUniqueMissingOrdinaryIds']) == 52
    held_by_id = {g['id']: g for g in hold['wholeCurrentGoalBodies']}
    assert set(hold['exactUniqueMissingOrdinaryIds']) == set(held_by_id)
    assert all(goal_by_id[gid] == old for gid, old in held_by_id.items())
    current_cases = PREFIX / 'chemie-residual-e5d-case2-complete-material-targeted-author-successor-20261014-v1/candidate/four-whole-DEEN-cases.only-e5d-case2-material-D-completed.author.json'
    original_cases = AUTHOR / 'cases/two-pending-whole-goals-four-complete-DEEN-cases.author.json'
    material_differences = sorted(diffs(read(original_cases), read(current_cases)))
    assert material_differences == ['/goals/1/cases/1/materialDe', '/goals/1/cases/1/materialEn']
    # Bind exactly the eight files actually loaded by the unchanged scoped M CLI's
    # global deck discovery. This grants no card, M311 or visibility decision.
    decks = []
    for goal in canonical['goals']:
        if goal.get('nodeKind') != 'memory' and 'memorization' not in goal.get('tags', []) and not any(t.startswith('srs-deck:') for t in goal.get('tags', [])):
            continue
        for key in ['vocabularySource', 'vocabularySourceEn']:
            source = goal.get('extendedData', {}).get(key)
            if isinstance(source, str) and source.strip():
                source_path = Path('app/public') / source.lstrip('/') if source.startswith('/data/') else Path(source.lstrip('/'))
                decks.append({**binding(source_path), 'memoryGoalId': goal['id'], 'sourceValue': source})
    assert len(decks) == 8
    dump(OUT / 'checks/BOUND.stock-M-global-deck-discovery-inputs.no-new-card-or-M311-review.json', {
        'schemaVersion': 1, 'files': decks, 'onlyAutomaticStockDiscovery': True,
        'scopePrimaryCards': 0, 'newMemoryCardOrVisibilityOrM311Decisions': 0,
    })
    parsed_inputs = []
    for name in dict.fromkeys([row['path'] for row in captured['files']] + [row['path'] for row in decks]):
        path = Path(name)
        if path.suffix == '.json':
            read(path)
            parsed_inputs.append(name)
        elif path.suffix == '.jsonl':
            for line in path.read_text().splitlines():
                if line.strip():
                    json.loads(line)
            parsed_inputs.append(name)
    own_parsed = []
    for path in sorted(OUT.rglob('*')):
        assert not path.is_symlink(), path
        if path.suffix == '.json':
            read(path)
            own_parsed.append(str(path))
        elif path.suffix == '.jsonl':
            for line in path.read_text().splitlines():
                if line.strip():
                    json.loads(line)
            own_parsed.append(str(path))
    spec = importlib.util.spec_from_file_location('stock_schemas', REPO / 'scripts/validate_schemas.py')
    module = importlib.util.module_from_spec(spec)
    sys.modules[spec.name] = module
    spec.loader.exec_module(module)
    guard_errors = module.curriculum_symlink_errors(str(REPO))
    assert not guard_errors, guard_errors
    result = {
        'schemaVersion': 1, 'startedAtUTC': started, 'endedAtUTC': datetime.now(timezone.utc).isoformat(),
        'status': 'PASS', 'capturedImmutableInputHashesVerified': len(captured['files']),
        'oldExact52AcquisitionHeldGoalBodiesStillIdentical': True,
        'sourceAcquisitionHeld52NotRemovedOrGranted': True,
        'correctedWholeCaseCarrier': binding(current_cases), 'actualCaseMaterialOnlyDifferences': material_differences,
        'inputJsonAndJsonlFilesParsed': parsed_inputs, 'ownJsonAndJsonlFilesParsedBeforeSeal': own_parsed,
        'stockSymlinkGuard': {'function': 'scripts/validate_schemas.py:curriculum_symlink_errors', 'errors': guard_errors, 'status': 'PASS'},
        'ownSymlinks': 0, 'ignoredTmpInputLinks': 0, 'activeOrHHostOrRegistryWrites': 0,
        'newScientificDecisions': 0,
    }
    dump(OUT / 'checks/FINAL.finite-input-preservation-parse-and-global-stock-symlink-guard.actual.json', result)
    print(json.dumps({k: v for k, v in result.items() if k not in ['inputJsonAndJsonlFilesParsed', 'ownJsonAndJsonlFilesParsedBeforeSeal']}, ensure_ascii=False))

if __name__ == '__main__':
    main()
