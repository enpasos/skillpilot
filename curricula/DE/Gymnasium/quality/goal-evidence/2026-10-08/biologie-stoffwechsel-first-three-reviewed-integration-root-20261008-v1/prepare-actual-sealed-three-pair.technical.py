# SPDX-License-Identifier: Apache-2.0
"""Verify actual independent native seals; preserve original mutable inputs."""
from datetime import datetime, timezone
import hashlib
import json
from pathlib import Path
import shutil
import sys

ROOT = Path.cwd()
OWN = Path(__file__).resolve().parent
EXPECTED = {'32f47903-0788-5c27-ac88-7464f481f2f7', '135447a0-5d55-564a-afc3-3e3fbed77819', 'ec782ce3-475e-5628-b3fe-947d72e74a74'}


def bind(p):
    b = p.read_bytes()
    return {'path': str(p.relative_to(ROOT)), 'sha256': hashlib.sha256(b).hexdigest(), 'bytes': len(b)}


def read(p):
    return json.loads(p.read_text())


def verify(b):
    p = ROOT / b['path']
    data = p.read_bytes()
    assert len(data) == b['bytes'] and hashlib.sha256(data).hexdigest() == b['sha256'].removeprefix('sha256:'), p
    return p


def all_bindings(v):
    if isinstance(v, dict):
        if {'path', 'sha256', 'bytes'} <= v.keys():
            yield v
        for x in v.values():
            yield from all_bindings(x)
    elif isinstance(v, list):
        for x in v:
            yield from all_bindings(x)


assert len(sys.argv) == 5, 'Supply actual entry A, seal A, entry B, seal B, only after both first seals'
entries = [read(ROOT / sys.argv[n]) for n in [1, 3]]
seals = {}
mutable = {}
results = []
for name, entry_arg, seal_arg, e in zip(['a', 'b'], [sys.argv[1], sys.argv[3]], [sys.argv[2], sys.argv[4]], entries):
    seal_path = ROOT / seal_arg
    seal = read(seal_path)
    verified = {}
    for b in all_bindings(seal):
        verify(b)
        verified[b['path']] = b
    if name == 'a':
        assert str(ROOT / entry_arg) in {str(ROOT / p) for p in verified}, 'A original decision entry must be first-sealed'
    else:
        # B's neutral routing handoff follows its seal; verify its claims against
        # B's actual first-sealed decision and original result files.
        core_path = (ROOT / entry_arg).parent / 'D3-P3-actual-native.independent-b.first-verdict.json'
        assert str(core_path.relative_to(ROOT)) in verified
        core = read(core_path)
        assert core['descriptionKEEP'] == e['Dkeep'] == 3
        assert core['positiveNativePASS'] == e['PpassCurrentBinding'] == 3
        assert core['nativeBlockingFindings'] == e['nativeBlockingFindings'] == []
        assert core['ordinaryDescriptionResultsDirectory'] == e['resultsDirectory']
        assert core['positiveReviewPath'] == e['positiveReviewPath']
        assert core['peerNativeDPReadBeforeFirstSeal'] is False and seal['peerNativeDPReadBeforeFirstSeal'] is False
        assert {r['goalId'] for r in core['perGoal']} == EXPECTED
    summary = e['ownFirstVerdicts'] if name == 'a' else e
    assert summary['Dkeep'] == 3 and summary['nativeBlockingFindings'] in (0, [])
    blind_field = 'newPeerNativeResultsReadBeforeFirstSeal' if name == 'a' else 'peerNativeDPReadBeforeFirstSeal'
    assert e[blind_field] is False
    record_paths = list((ROOT / e['resultsDirectory']).glob('*.records.jsonl'))
    assert len(record_paths) == 1
    actual_records = [json.loads(line) for line in record_paths[0].read_text().splitlines()]
    assert len(actual_records) == 3 and {r['goalId'] for r in actual_records} == EXPECTED
    assert str(record_paths[0].relative_to(ROOT)) in verified, 'Actual D records must be first-sealed'
    assert e['humanApproval'] is False and e['activeWrites'] == 0
    seals[name] = {'seal': bind(seal_path), 'entry': bind(ROOT / entry_arg), 'verifiedOriginalFiles': list(verified.values())}
    results.append(e['resultsDirectory'])
    for p, b in verified.items():
        if p.startswith(('curricula/DE/Gymnasium/canonical/', 'curricula/DE/Gymnasium/quality/goal-visualization-qa/')) or p in {
            'app/scripts/config/goal-books/de-gym-biology-national-atlas.inputs.json',
            'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json',
            'curricula/DE/Gymnasium/quality/goal-book-publication/biologie.semantic-kinds.json'}:
            mutable[p] = b
assert results[0] != results[1]
snapshots = []
for n, (p, b) in enumerate(sorted(mutable.items())):
    target = OWN / 'before' / f'independent-native-original-mutable-input-{n:02}.exact.json'
    target.parent.mkdir(parents=True, exist_ok=True)
    assert not target.exists()
    shutil.copyfile(verify(b), target)
    snapshots.append({'originalPath': p, 'originalBinding': b, 'immutableHistoricalCopy': bind(target),
                      'reason': 'Exact input present at actual first independent seal; future reviewed integration must preserve this historical before-input without editing the original seal.'})
target = OWN / 'pending/original-seal-verification.actual.json'
target.parent.mkdir(parents=True, exist_ok=True)
assert not target.exists()
target.write_text(json.dumps({'observedAt': datetime.now(timezone.utc).isoformat(), 'seals': seals,
                             'bothActualIndependentNativeFirstSealsVerified': True,
                             'originalMutableBeforeInputsPreserved': snapshots,
                             'resultsDirectories': results, 'activeWrites': 0,
                             'newScientificReviewByIntegrator': False, 'humanApproval': False}, ensure_ascii=False, indent=2) + '\n')
print(json.dumps({'actualIndependentNativePair': 'PASS', 'seals': 2, 'immutableMutableBeforeCopies': len(snapshots), 'activeWrites': 0}))
