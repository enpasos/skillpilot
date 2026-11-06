#!/usr/bin/env python3
"""Read-only replay of the pinned 39-array Informatics hypothesis; no application."""
from pathlib import Path
import copy
import hashlib
import json
import sys

sys.dont_write_bytecode = True
ROOT = Path(__file__).resolve().parents[3]
sys.path.insert(0, str(ROOT / 'scripts'))
import canonical_goal_identity_migration as canonical_json
sys.path.insert(0, str(Path(__file__).resolve().parent))
import verify_german_minimality_review as graph

BASE = Path(__file__).resolve().parent
PROPOSAL = BASE / 'informatics-whole-exam-foundation-successor-proposal-2026-11-06.json'
DEMAND = BASE / 'informatics-whole-exam-foundation-successor-demand-hypothesis-2026-11-06.json'


def sha(data):
    return hashlib.sha256(data).hexdigest()


def pinned(binding):
    data = (ROOT / binding['path']).read_bytes()
    assert sha(data) == binding['sha256'], f"Source changed: {binding['path']}"
    return data


def relations(documents):
    catalog = graph.Catalog(copy.deepcopy(documents))
    effective, _ = catalog.effective()
    goal_closure, goal_cycles = graph.closure(catalog.keys, effective)
    atomic_closure, atomic_cycles = graph.closure(catalog.atom_keys, catalog.atomic(effective))
    return catalog, goal_closure, atomic_closure, [goal_cycles, atomic_cycles]


def changes(keys, before, after):
    return [
        {'sourceKey': key,
         'removed': [target for j, target in enumerate(keys) if old & ~new & (1 << j)],
         'added': [target for j, target in enumerate(keys) if new & ~old & (1 << j)]}
        for key, old, new in zip(keys, before, after) if old != new
    ]


def main():
    manifest = json.loads(PROPOSAL.read_bytes())
    expected = json.loads(DEMAND.read_bytes())
    assert sha(PROPOSAL.read_bytes()) == expected['proposal']['sha256']
    pinned(manifest['previousHypothesis'])
    pinned(expected['helper'])
    source = json.loads(pinned(manifest['source']))
    candidate = copy.deepcopy(source)
    operations = manifest['operations']
    assert len(operations) == 39
    assert len({operation['guardGoalId'] for operation in operations}) == 39
    assert sha(canonical_json.stable(operations)) == manifest['operationCanonicalSha256']
    for operation in operations:
        assert operation['op'] == 'replace' and operation['file'] == manifest['source']['path']
        pieces = operation['path'].split('/')
        assert len(pieces) == 4 and pieces[:2] == ['', 'goals'] and pieces[3] == 'requires'
        goal = candidate['goals'][int(pieces[2])]
        assert goal['id'] == operation['guardGoalId']
        assert sha(canonical_json.stable(goal)) == operation['guardGoalCanonicalSha256']
        assert goal['requires'] == operation['guardRequiresBefore']
        assert len(operation['value']) == len(set(operation['value']))
        goal['requires'] = copy.deepcopy(operation['value'])
    rendered = (json.dumps(candidate, ensure_ascii=False, indent=2) + '\n').encode()
    assert sha(rendered) == manifest['hypotheticalOutput']['sha256']
    # Reconstruct in memory; the temporary candidate file is not an input.
    documents = [json.loads(pinned(binding)) for binding in expected['catalogSources']]
    assert len(documents) == 21
    owner = manifest['source']['landscapeId']
    assert sum(document['landscapeId'] == owner for document in documents) == 1
    before, bg, ba, bc = relations(documents)
    after, ag, aa, ac = relations([candidate if document['landscapeId'] == owner else document
                                 for document in documents])
    assert before.keys == after.keys and before.atom_keys == after.atom_keys
    actual_goal = changes(before.keys, bg, ag)
    actual_atomic = changes(before.atom_keys, ba, aa)
    for actual, key in [(actual_goal, 'globalGoalDeltas'), (actual_atomic, 'globalAtomicDeltas')]:
        recorded = [{field: row[field] for field in ['sourceKey', 'removed', 'added']}
                    for row in expected[key]]
        assert actual == recorded, f'Demand mismatch: {key}'
    assert bc == expected['cycleComponentCountsBefore'] == ac == expected['cycleComponentCountsAfter']
    assert not [row for row in actual_goal + actual_atomic if not row['sourceKey'].startswith(owner + ':')]
    assert all({key: value for key, value in old.items() if key != 'requires'}
               == {key: value for key, value in new.items() if key != 'requires'}
               for old, new in zip(source['goals'], candidate['goals']))
    print(json.dumps({'status': 'PASS-read-only-hypothesis-replay', 'dataApplied': False,
                      'sourceFiles': len(documents), 'operations': len(operations),
                      'changedGoalSources': len(actual_goal), 'changedAtomicSources': len(actual_atomic),
                      'foreignChanges': 0, 'temporaryCandidateRequired': False,
                      'scopeMaterializationApproved': False, 'qaApprovalClaimed': False}))


if __name__ == '__main__':
    main()
