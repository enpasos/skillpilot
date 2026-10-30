#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Reproducible independent check of the proposed linear completion evaluator.

Run: python3 scripts/check_assessment_completion_linear.py
Python 3.10+, standard library only; no learner data or file writes.
The reference explicitly computes transitive closure and simultaneous fixed
points. The candidate traverses direct edges once, propagating open consumers.
This checks the mathematical algorithm, not runtime integration, curriculum
validation, performance, grading quality or host acceptance.
"""
from itertools import combinations
from random import Random


def require(condition, detail):
    """Do not silently disable verification when Python runs with -O."""
    if not condition:
        raise AssertionError(detail)


def reference(adjacency, mastered, eligible):
    n = len(adjacency)
    reach = [sum(1 << j for j in row) for row in adjacency]
    for k in range(n):
        for i in range(n):
            if reach[i] >> k & 1:
                reach[i] |= reach[k]
    require(not any(reach[i] >> i & 1 for i in range(n)), "Cyclic input")
    ancestors = [sum(1 << i for i in range(n) if reach[i] >> j & 1)
                 for j in range(n)]
    result = mastered
    while True:
        nxt = result
        for v in range(n):
            if eligible >> v & 1 and ancestors[v] & ~result == 0:
                nxt |= 1 << v
        if nxt == result:
            return result
        result = nxt


def order_of(adjacency):
    incoming = [0] * len(adjacency)
    for row in adjacency:
        for p in row:
            incoming[p] += 1
    queue = [v for v, count in enumerate(incoming) if count == 0]
    result = []
    while queue:
        v = queue.pop()
        result.append(v)
        for p in adjacency[v]:
            incoming[p] -= 1
            if incoming[p] == 0:
                queue.append(p)
    require(len(result) == len(adjacency), "Incomplete topological ordering")
    return result


def linear(adjacency, order, mastered, eligible):
    blocked = [False] * len(adjacency)
    result = mastered
    for v in order:
        if eligible >> v & 1 and not blocked[v]:
            result |= 1 << v
        unresolved = blocked[v] or not (result >> v & 1)
        for p in adjacency[v]:
            blocked[p] |= unresolved
    return result


def exhaustive():
    checks = 0
    graphs = 0
    for n in range(1, 6):
        pairs = list(combinations(range(n), 2))
        for emask in range(1 << len(pairs)):
            adjacency = [[] for _ in range(n)]
            for k, (a, b) in enumerate(pairs):
                if emask >> k & 1:
                    adjacency[a].append(b)
            order = order_of(adjacency)
            graphs += 1
            for mastered in range(1 << n):
                for eligible in range(1 << n):
                    actual = linear(adjacency, order, mastered, eligible)
                    expected = reference(adjacency, mastered, eligible)
                    require(actual == expected, (
                        adjacency, mastered, eligible, actual, expected))
                    checks += 1
    return graphs, checks


def randomized():
    rng = Random(20261030)
    checks = 0
    max_edges = 0
    for n in (6, 10, 20, 40, 80, 160):
        for _ in range(100):
            labels = list(range(n))
            rng.shuffle(labels)
            density = rng.choice((0.01, 0.05, 0.15, 0.5, 0.9))
            adjacency = [[] for _ in range(n)]
            for a, b in combinations(labels, 2):
                if rng.random() < density:
                    adjacency[a].append(b)
            max_edges = max(max_edges, sum(map(len, adjacency)))
            order = order_of(adjacency)
            for _ in range(8):
                mastered = rng.getrandbits(n)
                eligible = rng.getrandbits(n)
                actual = linear(adjacency, order, mastered, eligible)
                expected = reference(adjacency, mastered, eligible)
                require(actual == expected, (
                    adjacency, mastered, eligible, actual, expected))
                checks += 1
    return checks, max_edges


if __name__ == '__main__':
    graphs, cases = exhaustive()
    print(f'Exhaustive: {graphs} topologically labelled DAGs with 1..5 nodes; '
          f'{cases} E/W assignments matched.', flush=True)
    cases, max_edges = randomized()
    print(f'Random: 600 independently relabelled DAGs, 6..160 nodes, '
          f'up to {max_edges} edges; {cases} E/W assignments matched; '
          'seed 20261030.', flush=True)
