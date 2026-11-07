#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Read-only replay of the exact reviewed and applied Informatics candidate."""
import copy
import hashlib
import json
from pathlib import Path
import subprocess
import sys

sys.dont_write_bytecode = True
HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
sys.path.insert(0, str(HERE))
from verify_informatics_ordinary_prerequisites_hypothesis import (
    canonical_json, definition_delta, relations,
)

BASE = '0f86df880a24f366d7d357160271dceeb6ce94c0'
VARIANT = 'ordinary24-turing-documentation26'
PINS = {
    'informatics-bounded26-prerequisites-proposal-2026-11-06.json':
        'a2228853304f3fa457fa19fb914d11c2ed16a22022329379342fd0b3eab341d6',
    'informatics-bounded-current-demand-analysis-2026-11-06.json':
        '26c9f7cb88d8c116ba1cfd3e955a0739689077b7ad525141196a78d54bf1931d',
}


def sha(raw):
    return hashlib.sha256(raw).hexdigest()


def verify():
    for name, expected in PINS.items():
        assert sha((HERE / name).read_bytes()) == expected
    proposal = json.loads((HERE / next(iter(PINS))).read_bytes())
    measured = json.loads((HERE / list(PINS)[1]).read_bytes())
    expected = measured['variants'][VARIANT]
    owner, source = proposal['source']['landscapeId'], proposal['source']['path']
    paths = {row['path'] for row in measured['catalogSources']}
    assert paths == {p.relative_to(ROOT).as_posix() for p in
                     (ROOT / 'curricula/DE/Gymnasium/canonical').glob('*.de.json')}
    assert len(paths) == 21
    documents, active_pins = [], []
    for row in measured['catalogSources']:
        raw = subprocess.check_output(['git', 'show', BASE + ':' + row['path']], cwd=ROOT)
        assert sha(raw) == row['sha256']
        active = (ROOT / row['path']).read_bytes()
        assert sha(active) == (proposal['hypotheticalSourceSha256']
                               if row['path'] == source else row['sha256'])
        active_pins.append({'path': row['path'], 'sha256': sha(active)})
        documents.append(json.loads(raw))
    original = copy.deepcopy(documents)
    document = next(d for d in documents if d['landscapeId'] == owner)
    operations = proposal['operations']
    assert len(operations) == 26
    assert sha(canonical_json.stable(operations)) == proposal['operationsCanonicalSha256']
    for operation in operations:
        assert operation['op'] == 'replace' and operation['file'] == source
        parts = operation['path'].split('/')
        assert parts[:2] == ['', 'goals'] and parts[3:] == ['requires']
        goal = document['goals'][int(parts[2])]
        assert goal['id'] == operation['guardGoalId']
        assert goal['requires'] == operation['guardRequiresBefore']
        assert sha(canonical_json.stable(goal)) == operation['guardGoalCanonicalSha256']
        goal['requires'] = copy.deepcopy(operation['value'])
    raw = (json.dumps(document, ensure_ascii=False, indent=2) + '\n').encode()
    assert (ROOT / source).read_bytes() == raw
    before, _, bg, ba, bc = relations(original)
    after, _, ag, aa, ac = relations(documents)
    assert before.keys == after.keys and before.atom_keys == after.atom_keys
    assert bc == ac == [0, 0]
    goal_delta = definition_delta(before.keys, bg, ag, before)
    atomic_delta = definition_delta(before.atom_keys, ba, aa, before)
    assert goal_delta == expected['goalDemandDeltas']
    assert atomic_delta == expected['atomicDemandDeltas']
    assert len(goal_delta) == len(atomic_delta) == 52
    assert all(row['sourceKey'].startswith(owner + ':') for row in goal_delta + atomic_delta)
    assert all(sha((ROOT / pin['path']).read_bytes()) == pin['sha256'] for pin in active_pins)
    return {'status': 'PASS-active-reviewed-bounded26-global-replay', 'activeVerified': True,
            'originalSnapshot': BASE, 'activeSources': active_pins, 'operations': 26,
            'sourceSha256': sha(raw), 'goalDemandDeltas': goal_delta,
            'atomicDemandDeltas': atomic_delta, 'cycleComponents': ac,
            'foreignGoalOrAtomicChanges': 0, 'qaOrMaturityApprovalClaimed': False}


if __name__ == '__main__':
    print(json.dumps(verify(), ensure_ascii=False, indent=2))
