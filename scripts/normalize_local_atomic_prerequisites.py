# SPDX-License-Identifier: Apache-2.0
"""Normalize a self-contained landscape's existing prerequisite statements.

Report only by default; --write changes only requires. Foreign references and
cycles fail closed. Self-pair removal requires an explicit goal-ID allowlist.
This is authoring support, not a historical-preservation milestone contract.
"""
from __future__ import annotations

import argparse
import copy
import hashlib
import json
from functools import cache
from pathlib import Path


def normalize(document: dict, allowed_self_pairs: set[str]) -> tuple[dict, dict]:
    result = copy.deepcopy(document)
    goals = {goal['id']: goal for goal in document['goals']}
    if len(goals) != len(document['goals']):
        raise ValueError('Duplicate goal identity')
    parents = {key: [] for key in goals}
    for key, goal in goals.items():
        expected = 'cluster' if goal.get('contains') else 'atomic'
        if 'type' in goal and goal['type'] != expected:
            raise ValueError(f'Explicit type mismatch: {key}')
        for field in ('contains', 'requires'):
            for target in goal.get(field, []):
                if target not in goals:
                    raise ValueError(f'Non-local or unresolved reference: {key} -> {target}')
        for child in goal.get('contains', []):
            parents[child].append(key)

    def closures(adjacency):
        active = set()

        @cache
        def visit(key):
            if key in active:
                raise ValueError(f'Cycle: {key}')
            active.add(key)
            reachable = set(adjacency[key])
            for target in adjacency[key]:
                reachable.update(visit(target))
            active.remove(key)
            return frozenset(reachable)

        return {key: visit(key) for key in adjacency}

    descendants = closures({key: goal.get('contains', []) for key, goal in goals.items()})
    ancestors = closures(parents)
    leaves = {key for key, goal in goals.items() if not goal.get('contains')}
    basis = {key: ({key} if key in leaves else set(descendants[key]) & leaves) for key in goals}
    expanded = {
        key: set().union(*(basis[target] for origin in {key} | set(ancestors[key])
                          for target in goals[origin].get('requires', [])))
        for key in leaves
    }
    self_pairs = {key for key, targets in expanded.items() if key in targets}
    if self_pairs != allowed_self_pairs:
        raise ValueError(f'Self-pair allowlist differs: actual={sorted(self_pairs)}')
    for key in self_pairs:
        expanded[key].remove(key)
    closure = closures(expanded)
    reduced = {key: {target for target in targets
                     if not any(target in closure[other] for other in targets if other != target)}
               for key, targets in expanded.items()}
    if closures(reduced) != closure:
        raise ValueError('Reduction changed atomic reachability')
    changes = []
    for goal in result['goals']:
        before = goal.get('requires', [])
        targets = reduced.get(goal['id'], set())
        # Keep existing ordering for surviving edges; append new edges by ID.
        after = list(dict.fromkeys(target for target in before if target in targets))
        after.extend(sorted(targets - set(after)))
        if before != after:
            changes.append({'goalId': goal['id'], 'before': before, 'after': after})
            goal['requires'] = after
    return result, {
        'landscapeId': document['landscapeId'], 'goalCount': len(goals),
        'atomicGoalCount': len(leaves), 'removedSelfPairs': sorted(self_pairs),
        'originalEdgeCount': sum(len(goal.get('requires', [])) for goal in goals.values()),
        'expandedEdgeCount': sum(map(len, expanded.values())),
        'reducedEdgeCount': sum(map(len, reduced.values())),
        'atomicReachabilityPreservedAfterSelfRemoval': True, 'changes': changes,
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('source', type=Path)
    parser.add_argument('--allow-self-pair', action='append', default=[])
    parser.add_argument('--write', action='store_true')
    parser.add_argument('--report', type=Path, required=True)
    args = parser.parse_args()
    if args.source.resolve() == args.report.resolve() or (args.report.exists() and args.source.samefile(args.report)):
        parser.error('--report must not name or alias the source document')
    original = args.source.read_bytes()
    document = json.loads(original)
    normalized, report = normalize(document, set(args.allow_self_pair))
    rendered = (json.dumps(normalized, ensure_ascii=False, indent=2) + '\n').encode()
    report.update(source=str(args.source), originalSha256=hashlib.sha256(original).hexdigest(),
                  normalizedSha256=hashlib.sha256(rendered).hexdigest(), write=args.write)
    args.report.write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
    if args.write:
        args.source.write_bytes(rendered)
    print(json.dumps({key: value for key, value in report.items() if key != 'changes'}))


if __name__ == '__main__':
    main()
