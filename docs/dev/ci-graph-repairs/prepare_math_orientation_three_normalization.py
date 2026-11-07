#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Verify/reconstruct only the three reviewed Math requires arrays; never apply."""
import argparse
import copy
import hashlib
import importlib.util
import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
DEFAULT_PLAN = Path(__file__).with_name('math-orientation-three-normalization-plan-2026-11-06.json')


def digest(raw):
    return hashlib.sha256(raw).hexdigest()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--plan', type=Path, default=DEFAULT_PLAN)
    parser.add_argument('--candidate-out', type=Path)
    args = parser.parse_args()
    plan = json.loads(args.plan.read_bytes())
    if plan['status'] != 'reviewed-proposal-unapplied-no-qa-approval':
        raise ValueError('Unexpected plan state')
    if len(plan['operations']) != 3:
        raise ValueError('This verifier accepts exactly three operations')
    helper_path = ROOT / plan['graphHelper']['path']
    if digest(helper_path.read_bytes()) != plan['graphHelper']['sha256']:
        raise ValueError('Graph helper differs from the reviewed implementation')
    spec = importlib.util.spec_from_file_location('reviewed_math_graph_helper', helper_path)
    graph = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(graph)
    documents = []
    for binding in plan['catalogSources']:
        raw = (ROOT / binding['path']).read_bytes()
        if digest(raw) != binding['sha256']:
            raise ValueError('Source pin differs: ' + binding['path'])
        documents.append(json.loads(raw))
    original = next(d for d in documents if d['landscapeId'] == plan['source']['landscapeId'])
    baseline = graph.Catalog(copy.deepcopy(documents))
    effective, _ = baseline.effective()
    goal_before, goal_cycles = graph.closure(baseline.keys, effective)
    atom_before, atom_cycles = graph.closure(baseline.atom_keys, baseline.atomic(effective))
    if (goal_cycles, atom_cycles) != (0, 0):
        raise ValueError('The bound global baseline has cycles')
    scenarios = []
    groups = [[operation] for operation in plan['operations']] + [plan['operations']]
    candidate_raw = None
    for operations in groups:
        current_documents = copy.deepcopy(documents)
        candidate = next(d for d in current_documents if d['landscapeId'] == original['landscapeId'])
        catalog = graph.Catalog(current_documents)
        steps = []
        for operation in operations:
            parts = operation['path'].split('/')
            if len(parts) != 4 or parts[:2] != ['', 'goals'] or parts[-1] != 'requires' or operation['operation'] != 'replace':
                raise ValueError('Only guarded requires replacements are permitted')
            goal = candidate['goals'][int(parts[2])]
            if goal['id'] != operation['guardGoalId'] or goal.get('requires') != operation['guardRequiresBefore']:
                raise ValueError('Goal ID/array guard differs')
            if digest(graph.stable(goal)) != operation['guardGoalCanonicalJsonSha256']:
                raise ValueError('Source goal payload guard differs')
            source_key = original['landscapeId'] + ':' + goal['id']
            before_refs = set(catalog.authored[source_key])
            after_refs = {catalog.resolve(ref, original['landscapeId']) for ref in operation['value']}
            removed = before_refs - after_refs
            if after_refs - before_refs or len(removed) != 1:
                raise ValueError('Exactly one existing reference must be removed')
            catalog.remove_origin(source_key, next(iter(removed)))
            after, _ = catalog.effective()
            goals, gc = graph.closure(catalog.keys, after)
            atoms, ac = graph.closure(catalog.atom_keys, catalog.atomic(after))
            if goals != goal_before or atoms != atom_before or (gc, ac) != (0, 0):
                raise ValueError('Full global Goal/Atomic demand differs')
            witness = next(row for row in plan['cases'] if row['sourceGoalId'] == goal['id'])
            catalog.validate_path(after, witness['witnessKeys'])
            catalog.validate_origins(witness['witnessKeys'], witness['witnessHops'])
            steps.append({'caseId': witness['caseId'], 'globalGoalClosureEqual': True, 'globalAtomicClosureEqual': True})
        expected = copy.deepcopy(original)
        for operation in operations:
            expected['goals'][int(operation['path'].split('/')[2])]['requires'] = operation['value']
        if candidate != expected:
            raise ValueError('A field outside the reviewed requires arrays changed')
        raw = (json.dumps(candidate, ensure_ascii=False, indent=2) + '\n').encode()
        scenarios.append({'caseIds': [s['caseId'] for s in steps], 'steps': steps, 'candidateSha256': digest(raw)})
        candidate_raw = raw
    if digest(candidate_raw) != plan['candidate']['sha256']:
        raise ValueError('Cumulative candidate bytes differ')
    for binding in plan['catalogSources']:
        if digest((ROOT / binding['path']).read_bytes()) != binding['sha256']:
            raise ValueError('Input changed during verification')
    if args.candidate_out:
        target = args.candidate_out.resolve()
        if not target.is_relative_to(ROOT / 'tmp'):
            raise ValueError('Candidate output must be below repository tmp/; live application is unsupported')
        target.parent.mkdir(parents=True, exist_ok=True)
        with target.open('xb') as stream:
            stream.write(candidate_raw)
    print(json.dumps({'status': 'exact-three-candidate-verified-no-application', 'catalogs': len(documents),
                      'goalKeys': len(baseline.keys), 'atomicKeys': len(baseline.atom_keys), 'scenarios': scenarios,
                      'candidateSha256': digest(candidate_raw), 'activeWrites': False}, indent=2))


if __name__ == '__main__':
    import sys
    sys.dont_write_bytecode = True
    main()
