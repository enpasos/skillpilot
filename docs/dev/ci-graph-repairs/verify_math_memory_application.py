#!/usr/bin/env python3
"""Replay five reviewed Math Memory operations and four fresh kind decisions."""
import argparse
import json
from pathlib import Path
import subprocess
import sys

sys.dont_write_bytecode = True
HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
sys.path.insert(0, str(HERE))
import verify_math_memory_pilot_current as hypothesis

BASE = hypothesis.BASE_COMMIT
SOURCE = hypothesis.pilot.SOURCE
LEDGER = 'curricula/DE/Gymnasium/quality/release-model/mathematik.semantic-kinds.json'
REVIEW = HERE / 'math-memory-semantic-kind-independent-review-2026-11-06.json'
REVIEW_SHA = 'd0e611091fe5adc48b5d491d959a192627713e74a7209f52204e295e3f6d229c'


def git_bytes(path):
    return subprocess.check_output(['git', 'show', BASE + ':' + path], cwd=ROOT)


def verify(active):
    assert hypothesis.pilot.graph.sha256(REVIEW.read_bytes()) == REVIEW_SHA
    review = json.loads(REVIEW.read_bytes())
    assert len(review['reviews']) == 4
    proposal = json.loads(hypothesis.PROPOSAL.read_bytes())
    assert hypothesis.pilot.graph.sha256(hypothesis.pilot.graph.stable(proposal['operations'])) == hypothesis.OPERATIONS_SHA
    paths = subprocess.check_output(['git', 'ls-tree', '-r', '--name-only', BASE,
                                     'curricula/DE/Gymnasium/canonical'], cwd=ROOT, text=True).splitlines()
    originals, bindings = [], []
    for path in paths:
        if not path.endswith('.de.json') or '_deck' in path:
            continue
        raw = (ROOT / path).read_bytes() if active and path != SOURCE else git_bytes(path)
        originals.append(json.loads(raw))
        bindings.append({'path': path, 'sha256': hypothesis.pilot.graph.sha256(raw)})
    assert len(originals) == 21
    original_math = next(row for row in originals if row['landscapeId'] == hypothesis.pilot.OWNER)
    assert hypothesis.pilot.graph.sha256(git_bytes(SOURCE)) == proposal['source']['sha256']
    candidate, result = hypothesis.pilot.run_scenario(originals, [proposal], 'memory')
    assert result['crossSubjectChangedGoalClosures'] == result['crossSubjectChangedAtomicClosures'] == 0
    assert len(result['globalGoalClosureChanges']) == len(result['globalAtomicClosureChanges']) == 3
    assert len(result['normalizationSteps']) == 2
    assert hypothesis.pilot.graph.sha256(candidate) == 'da4724ae0db70d85cae68eb273df663f59b17b2ca761a86181fa462299a123b6'
    candidate_by_id = {goal['id']: goal for goal in json.loads(candidate)['goals']}
    original_by_id = {goal['id']: goal for goal in original_math['goals']}
    ledger = json.loads(git_bytes(LEDGER))
    assert len(ledger['decisions']) == 1252
    for row in review['reviews']:
        assert row['decision'] == 'approve-memory-kind-for-exact-candidate'
        assert original_by_id[row['goalId']] == row['originalGoal']
        assert candidate_by_id[row['goalId']] == row['proposedGoal']
        pointer = row['ledgerDecisionPointer'].split('/')
        assert pointer[:2] == ['', 'decisions'] and len(pointer) == 3
        index = int(pointer[2])
        assert ledger['decisions'][index] == row['oldDecision']
        assert row['proposedDecision']['semanticKind'] == 'memory'
        assert {key: value for key, value in row['oldDecision'].items() if key != 'sourceFingerprint'} == {
            key: value for key, value in row['proposedDecision'].items() if key != 'sourceFingerprint'}
        ledger['decisions'][index] = row['proposedDecision']
    ledger_raw = (json.dumps(ledger, ensure_ascii=False, indent=2) + '\n').encode()
    assert hypothesis.pilot.graph.sha256(ledger_raw) == '78a5f2d9b4f48f35f2871b2c8b59f51c60bea5e2e2dde7857f6bdad85672472b'
    if active:
        assert (ROOT / SOURCE).read_bytes() == candidate
        assert (ROOT / LEDGER).read_bytes() == ledger_raw
        assert all(hypothesis.pilot.graph.sha256((ROOT / row['path']).read_bytes()) == row['sha256']
                   for row in bindings if row['path'] != SOURCE), 'Context changed during verification'
    return {'status': 'PASS-reviewed-Math-Memory-and-fresh-kind-replay',
            'activeVerified': active, 'originalMathSnapshot': BASE,
            'foreignCatalogMode': 'current-live-context' if active else 'original-fixed-snapshot',
            'contextBindings': bindings, 'result': result,
            'requiresArrays': 4, 'reviewedOperations': 5, 'freshKindDecisions': 4,
            'reviewSha256': REVIEW_SHA, 'newDpOrMasteryApprovalClaimed': False}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--verify-active', action='store_true')
    args = parser.parse_args()
    result = verify(args.verify_active)
    print(json.dumps(result, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()
