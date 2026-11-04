#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Finite reference checks for the 2026-11-04 concept, not runtime acceptance.

Every labelled topologically ordered DAG of up to four vertices, every explicit
mastery set and protected exam/card set with complete local assessment routes.
Independent closure and traversal formulations; no mastery stopping barrier.
Only structural contracts are checked; real task quality needs content review.
"""
from itertools import combinations


def require(condition, message):
    if not condition:
        raise AssertionError(message)


def subsets(items):
    items = list(items)
    for mask in range(1 << len(items)):
        yield {item for bit, item in enumerate(items) if mask & (1 << bit)}


def closure(vertices, edges):
    require(all(a in vertices and b in vertices for a, b in edges), "Unknown reference")
    result = set(edges)
    while True:
        following = result | {(a, d) for a, b in result for c, d in result if b == c}
        if following == result:
            require(not any(a == b for a, b in result), "Cycle")
            return result
        result = following


def minimal(vertices, edges):
    reach = closure(vertices, edges)
    return not any((a, c) in reach and (c, b) in reach
                   for a, b in edges for c in vertices)


def effective_requirements(vertices, contains, requires):
    """Recompute contains inheritance; caller handles atomic expansion separately."""
    containment = closure(vertices, contains)
    closure(vertices, requires)
    return requires | {(child, p) for ancestor, child in containment
                       for g, p in requires if g == ancestor}


def authored_minimal(vertices, contains, requires):
    for edge in requires:
        changed = effective_requirements(vertices, contains, requires - {edge})
        if edge in closure(vertices, changed):
            return False
    return True


def implicit(vertices, targets, protected, edges, mastered, exams=None):
    require(targets <= vertices and protected <= vertices and mastered <= vertices,
            "Invalid target/protected/mastery reference")
    reach = closure(vertices, edges)
    local = targets & protected
    if exams is None:
        exams = protected  # Exhaustive untyped cases model every endpoint as an exam.
    require(exams <= protected, "Assessment is not protected")
    require(all(any((p, a) in reach for p in targets & exams) for a in targets - protected),
            "Ordinary target lacks local exam route; recall alone is insufficient")
    needed = set(local - mastered)
    pending = list(needed)
    while pending:
        goal = pending.pop()
        # Mastered intermediate nodes remain traversable.
        for a, b in edges:
            if a == goal and b not in needed:
                needed.add(b)
                pending.append(b)
    return targets - mastered - local - needed


def effective(vertices, contracts, protected, edges, mastered, exams=None):
    return mastered | set().union(*(implicit(vertices, t, protected, edges, mastered, exams)
                                   for t in contracts))


def main():
    checked = 0
    for size in range(1, 5):
        vertices = set(range(size))
        for edges in subsets(combinations(range(size), 2)):
            reach = closure(vertices, edges)
            reduction = {(a, b) for a, b in reach if not any(
                (a, c) in reach and (c, b) in reach for c in vertices)}
            require(minimal(vertices, reduction), "Reduction not minimal")
            require(closure(vertices, reduction) == reach, "Reduction changed reachability")
            for protected in subsets(vertices):
                if any(not any((p, a) in reach for p in protected)
                       for a in vertices - protected):
                    continue
                for mastered in subsets(vertices):
                    got = implicit(vertices, vertices, protected, edges, mastered)
                    needed = (protected - mastered) | {b for a, b in reach if a in protected - mastered}
                    expected = vertices - mastered - protected - needed
                    require(got == expected, "Traversal differs from closure")
                    require(not got & protected, "Exam/card implicitly passed")
                    require(got == implicit(vertices, vertices, protected, reduction, mastered),
                            "Transitive reduction changed recognition")
                    require(got == implicit(vertices, vertices, protected, reach, mastered),
                            "Transitive closure changed recognition")
                    done = mastered | got
                    for v in vertices - mastered:
                        more = mastered | {v}
                        require(done <= more | implicit(vertices, vertices, protected, edges, more),
                                "More explicit mastery reopened effective completion")
                    require((done == vertices) == (protected <= mastered), "Protected completion mismatch")
                    checked += 1
    # Orientation is not a third protected class; deriving its entry marker
    # makes no assertion that a motivational conversation actually happened.
    require(implicit({"q", "a", "o"}, {"q", "a", "o"}, {"q"},
                     {("q", "a"), ("a", "o")}, {"q"}, {"q"}) == {"a", "o"},
            "Orientation marker was incorrectly protected from derived completion")
    # Removing an authored edge requires recomputing inherited requirements.
    inherited_vertices = {"k", "b", "a", "g"}
    contains = {("k", "b")}
    authored = {("k", "a"), ("g", "b"), ("g", "a")}
    require(minimal(inherited_vertices, authored), "Fixture must be raw-R minimal")
    require(not authored_minimal(inherited_vertices, contains, authored),
            "Inherited alternate path escaped authored minimality")
    require(authored_minimal(inherited_vertices, contains, authored - {("g", "a")}),
            "Valid inherited minimal graph rejected")
    vertices = {"q1", "q2", "a", "b", "k", "h"}
    edges = {("q1", "b"), ("b", "a"), ("q1", "h"), ("q2", "a")}
    protected = {"q1", "q2", "k", "h"}
    first = {"q1", "a", "b", "k"}
    exams = {"q1", "q2"}
    require(implicit(vertices, first, protected, edges, {"b"}, exams) == set(),
            "Mastered intermediate hid an open exam's transitive need")
    mastered = {"q1"}
    require(implicit(vertices, first, protected, edges, mastered, exams) == {"a", "b"},
            "Local recognition blocked by later level or unrelated card")
    require("k" not in effective(vertices, [first], protected, edges, mastered, exams), "Card passed implicitly")
    require("h" not in effective(vertices, [first], protected, edges, mastered, exams), "Support implicitly recognised")
    durable = [first, {"q2", "a"}]
    before = effective(vertices, durable, protected, edges, mastered, exams)
    selected_plan = {"q2", "a"}
    require("a" in before and ("q2", "a") in closure(vertices, edges),
            "Local recognition failed to fulfil future prerequisite")
    current_only = effective(vertices, [selected_plan], protected, edges, mastered, exams)
    require("a" not in current_only and "a" in before,
            "Fixture must expose the error of evaluating only the newly selected plan")
    require(len(selected_plan & before) == 1, "Target intersection counted unrelated work")
    require(not minimal(vertices, edges | {("q1", "a")}), "Redundant direct edge accepted")
    # Card-only coverage must not turn verified recall into application proof.
    try:
        implicit({"k", "a"}, {"k", "a"}, {"k"}, {("k", "a")}, {"k"}, set())
    except AssertionError:
        pass
    else:
        raise AssertionError("Card recall treated as application assessment")
    # An unrelated open card preserves recognition; a dependent card retains need.
    require(implicit(vertices, first, protected, edges | {("k", "a")}, mastered, exams) == {"b"},
            "Open dependent memory endpoint lost transitive preparation")
    # All contracts remain evaluable independently of displayed plan and ordering.
    require(before == effective(vertices, list(reversed(durable)), protected, edges, mastered, exams),
            "Contract order changed global result")
    # Recognition remains global while each plan only intersects its own targets.
    require(before & {"q1", "a", "b"} == {"q1", "a", "b"}, "Earlier plan credit lost")
    require(before & {"q2", "a"} == {"a"}, "Future plan did not inherit global credit")
    require(before & {"q2", "k"} == set(), "New protected plan was implicitly passed")
    for bad in [{("a", "b"), ("b", "a")}, {("a", "missing")}]:
        try:
            closure(vertices, bad)
        except AssertionError:
            pass
        else:
            raise AssertionError("Invalid graph accepted")
    try:
        implicit(vertices, {"a"}, protected, edges, set())
    except AssertionError:
        pass
    else:
        raise AssertionError("Isolated ordinary target accepted")
    print(f"PASS: {checked:,} valid DAG/mastery/protected cases; closure/reduction invariance,")
    print("global monotonicity, mastery intermediate, durable local recognition, protected cards,")
    print("future prerequisites, plan target counting and invalid inputs. No content-review claim.")


if __name__ == "__main__":
    main()
