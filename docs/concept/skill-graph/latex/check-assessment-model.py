#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Check direct-demand completion independently of the Java implementation.

Enumerates all DAGs in topological order on up to four vertices and every
target/support, mastery and protected/ordinary assignment. Every finite DAG
admits such an ordering. Checks the demand fixed point against independent
removal of unused consumers, including hidden protected support, the mastery
barrier and zero-mastery route validity. No learner data or output files.
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


def fixed_point(vertices, edges, mastered, protected, targets):
    needed = (protected & targets) - mastered
    while True:
        following = needed | {v for u, v in edges if u in needed and v not in mastered}
        if following == needed:
            return needed, vertices - mastered - protected - needed
        needed = following


def prune_consumers(vertices, edges, mastered, protected, targets):
    """Independent dual algorithm: remove unused demand, not goal outcomes."""
    active = vertices - mastered
    roots = protected & targets
    while True:
        removable = {v for v in active - roots
                     if not any(u in active for u, p in edges if p == v)}
        if not removable:
            return active, vertices - mastered - protected - active
        active -= removable


def uncovered_targets(vertices, edges, targets, protected):
    """Independent authoring check: targets must be demanded at zero mastery."""
    needed, _ = fixed_point(vertices, edges, set(), protected, targets)
    return targets - needed


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
            for targets in subsets(vertices):
                for protected in subsets(vertices):
                    results = {frozenset(mastered): fixed_point(vertices, edges, mastered, protected, targets)
                               for mastered in subsets(vertices)}
                    for mastered in subsets(vertices):
                        needed, implicit = results[frozenset(mastered)]
                        require((needed, implicit) == prune_consumers(vertices, edges, mastered, protected, targets),
                                "Consumer pruning differs from demand fixed point")
                        require(not implicit & protected, "Protected assessment or memory was implicit")
                        require(not needed & mastered, "Mastery did not stop demand")
                        require(not implicit & mastered, "Implicit and explicit overlap")
                        done = mastered | implicit
                        for v in vertices - mastered:
                            following_mastery = mastered | {v}
                            _, following_implicit = results[frozenset(following_mastery)]
                            require(done <= following_mastery | following_implicit, "Mastery reopened work")
                        checked += 1
    vertices = {"C", "B", "A"}
    chain = {("C", "B"), ("B", "A")}
    require(fixed_point(vertices, chain, {"B"}, {"C"}, vertices)[1] == {"A"}, "Mastery barrier missing")
    require(not fixed_point(vertices, chain | {("C", "A")}, {"B"}, {"C"}, vertices)[1], "Independent direct demand lost")
    require(not uncovered_targets(vertices, chain, vertices, {"C"}), "Anchored route rejected")
    require(uncovered_targets(vertices, chain, vertices, set()) == vertices, "Unprotected curriculum accepted")
    require(uncovered_targets(vertices, chain, vertices, {"B"}) == {"C"}, "Unprotected terminal accepted")
    # A memory-only curriculum can anchor its full preparation route. Passing
    # an independent exam cannot erase that memory obligation or its demand.
    require(not uncovered_targets(vertices, chain, vertices, {"C"}), "Memory-root route rejected")
    both = {"Q", "K", "A"}
    shared = {("Q", "A"), ("K", "A")}
    require(fixed_point(both, shared, {"Q"}, {"Q", "K"}, both) == ({"K", "A"}, set()),
            "Exam success erased selected memory demand")
    support_chain = {("Q", "K"), ("K", "A")}
    require(fixed_point(both, support_chain, {"Q"}, {"Q", "K"}, {"Q", "A"}) == (set(), {"A"}),
            "Hidden protected support became an independent obligation or implicit outcome")
    require(fixed_point(both, support_chain, set(), {"Q", "K"}, {"Q", "A"}) == (both, set()),
            "Actually needed hidden support lost its demand")
    require(uncovered_targets(both, support_chain, {"A"}, {"Q", "K"}) == {"A"},
            "Hidden support was treated as an independent authoring root")
    for invalid in [{("C", "B"), ("B", "C")}, {("C", "unknown")}]:
        try:
            validate(vertices, invalid)
        except AssertionError:
            pass
        else:
            raise AssertionError("Invalid graph accepted")
    print(f"PASS: {checked:,} DAG/target/support/mastery/protection cases; hidden support, direct demand, route validity and invalid inputs.")


if __name__ == "__main__":
    main()
