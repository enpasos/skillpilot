#!/usr/bin/env python3
"""Replay the reviewed Memory-only Math pilot against the current pinned 21-subject base."""
import argparse
import copy
import json
from pathlib import Path
import subprocess
import sys

sys.dont_write_bytecode = True
HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
sys.path.insert(0, str(HERE))
import verify_math_pilot_repairs as pilot

BASE_COMMIT = '5cb5e567d08bc9f640942529d9099cbce03a4747'
PROPOSAL = HERE / 'math-memory-prerequisites-repair-proposal-2026-11-06.json'
OPERATIONS_SHA = 'c5afb519c5561cac90962f761403bb343e45d2332a1feeee2d87c242a6f7ea04'


def verify():
    raw = PROPOSAL.read_bytes()
    proposal = json.loads(raw)
    assert proposal['status'] == 'independently-reviewed-proposal-no-application'
    assert len(proposal['operations']) == 5
    assert pilot.graph.sha256(pilot.graph.stable(proposal['operations'])) == OPERATIONS_SHA
    assert proposal['independentReview']['reviewedOperationsCanonicalJsonSha256'] == OPERATIONS_SHA
    paths = subprocess.check_output(['git', 'ls-tree', '-r', '--name-only', BASE_COMMIT,
                                     'curricula/DE/Gymnasium/canonical'], cwd=ROOT, text=True).splitlines()
    documents, bindings = [], []
    for path in paths:
        if not path.endswith('.de.json') or '_deck' in path:
            continue
        data = subprocess.check_output(['git', 'show', BASE_COMMIT + ':' + path], cwd=ROOT)
        documents.append(json.loads(data))
        bindings.append({'path': path, 'sha256': pilot.graph.sha256(data)})
    assert len(documents) == 21
    assert next(row['sha256'] for row in bindings if row['path'] == pilot.SOURCE) == proposal['source']['sha256']
    rendered, result = pilot.run_scenario(copy.deepcopy(documents), [proposal], 'memory')
    assert result['crossSubjectChangedGoalClosures'] == 0
    assert result['crossSubjectChangedAtomicClosures'] == 0
    candidate = json.loads(rendered)
    return candidate, rendered, {
        'schemaVersion': 1,
        'status': 'verified-current-global-memory-hypothesis-no-application',
        'baseCommit': BASE_COMMIT,
        'proposal': {'path': str(PROPOSAL.relative_to(ROOT)), 'sha256': pilot.graph.sha256(raw)},
        'operationsCanonicalSha256': OPERATIONS_SHA,
        'catalogSources': bindings,
        'helpers': [{'path': str(Path(module.__file__).relative_to(ROOT)),
                     'sha256': pilot.graph.sha256(Path(module.__file__).read_bytes())}
                    for module in [pilot, pilot.graph]],
        'candidateRawSha256': pilot.graph.sha256(rendered),
        'result': result,
        'sourceApplied': False,
        'semanticKindReviewsRefreshed': False,
        'qaValidityClaimed': False,
        'milestoneRestorationClaimed': False,
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output-candidate', type=Path)
    parser.add_argument('--output-proof', type=Path)
    args = parser.parse_args()
    _, raw, result = verify()
    if args.output_candidate:
        pilot.write_hypothesis(ROOT, args.output_candidate, raw)
    output = (json.dumps(result, ensure_ascii=False, indent=2) + '\n').encode()
    if args.output_proof:
        pilot.write_hypothesis(ROOT, args.output_proof, output)
    print(json.dumps({'status': result['status'], 'baseCommit': BASE_COMMIT,
                      'candidateSha256': result['candidateRawSha256'], 'sourceApplied': False,
                      'qaValidityClaimed': False, 'resultKeys': list(result['result'])}))


if __name__ == '__main__':
    main()
