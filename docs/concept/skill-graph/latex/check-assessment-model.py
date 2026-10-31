#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Check direct-demand completion independently of the Java implementation.

Enumerates all DAGs in topological order on up to four vertices and every
mastery/assessment assignment (16,932 cases). Every finite DAG admits such an
ordering. Checks the fixed-point definition against assessment-root traversal,
including the mastery barrier. No learner data or output files are used.
"""
from itertools import combinations


def require(condition, message):
    if not condition:
        raise AssertionError(message)


def validate(vertices, edges):
    require(all(a in vertices and b in vertices for a, b in edges), "Unknown reference")
    pending = {v: {b for a, b in edges if a == v} for v in vertices}
    while pending:
        leaves = {v for v, targets in pending.items() if not targets}
        require(leaves, "Cycle")
        pending = {v: targets - leaves for v, targets in pending.items() if v not in leaves}


def fixed_point(vertices, edges, mastered, exams):
    done = set(mastered) & vertices
    while True:
        following = done | {v for v in vertices - exams
                            if all(u in done for u, p in edges if p == v)}
        if following == done:
            return done
        done = following


def traverse(vertices, edges, mastered, exams):
    needed = set()
    pending = list(exams - mastered)
    while pending:
        goal = pending.pop()
        if goal in mastered or goal in needed:
            continue
        needed.add(goal)
        pending.extend(p for g, p in edges if g == goal)
    return vertices - needed


def subsets(items):
    items = list(items)
    for mask in range(1 << len(items)):
        yield {item for bit, item in enumerate(items) if mask & (1 << bit)}


def main():
    checked = 0
    for size in range(1, 5):
        vertices = set(range(size))
        for edges in subsets(combinations(range(size), 2)):
            validate(vertices, edges)
            for mastered in subsets(vertices):
                for exams in subsets(vertices):
                    done = fixed_point(vertices, edges, mastered, exams)
                    require(done == traverse(vertices, edges, mastered, exams), "Traversal differs from fixed point")
                    require(done & exams == mastered & exams, "Assessment was implicitly passed")
                    require(mastered <= done, "Mastery disappeared")
                    for v in vertices - mastered:
                        require(done <= fixed_point(vertices, edges, mastered | {v}, exams), "Mastery reopened work")
                    checked += 1
    vertices = {"C", "B", "A"}
    chain = {("C", "B"), ("B", "A")}
    require(fixed_point(vertices, chain, {"B"}, {"C"}) == {"B", "A"}, "Mastery barrier missing")
    require(fixed_point(vertices, chain | {("C", "A")}, {"B"}, {"C"}) == {"B"}, "Independent direct demand lost")
    for invalid in [{("C", "B"), ("B", "C")}, {("C", "unknown")}]:
        try:
            validate(vertices, invalid)
        except AssertionError:
            pass
        else:
            raise AssertionError("Invalid graph accepted")
    print(f"PASS: {checked:,} DAG/mastery/assessment cases; direct-demand examples and invalid inputs.")


if __name__ == "__main__":
    main()
