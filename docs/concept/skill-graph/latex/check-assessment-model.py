#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Finite mathematical reference for the 2026-11-06 qualified-proof concept.

Independent pointwise witnesses check the union definition on every DAG up to
four vertices and every ordinary/exam typing, valid coverage and mastery set.
Static history and unit-contract fixtures are illustrative claims, not a
qualification of real tasks, learner data, source coverage or runtime code.
"""
from itertools import combinations, permutations


def require(condition, message):
    if not condition:
        raise AssertionError(message)


def rejected(action, message):
    try:
        action()
    except AssertionError:
        return
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
    containment = closure(vertices, contains)
    closure(vertices, requires)
    return requires | {(child, p) for ancestor, child in containment
                       for g, p in requires if g == ancestor}


def authored_minimal(vertices, contains, requires):
    return all(edge not in closure(vertices, effective_requirements(
        vertices, contains, requires - {edge})) for edge in requires)


def validate_coverage(vertices, ordinary, exams, edges, coverage):
    require(ordinary <= vertices and exams <= vertices and not ordinary & exams,
            "Invalid goal typing")
    require(set(coverage) <= exams, "Coverage belongs to a non-assessment")
    reach = closure(vertices, edges)
    for q, covered in coverage.items():
        require(covered <= ordinary, "Coverage includes a protected or unknown goal")
        require(all((q, a) in reach for a in covered), "Proof has no prerequisite path")


def implicit(mastered, exams, coverage):
    # Only explicit q results participate. The empty default is intentional.
    return set().union(*(coverage.get(q, set()) for q in mastered & exams)) - mastered


def effective(mastered, exams, coverage):
    return mastered | implicit(mastered, exams, coverage)


def missing_prerequisites(vertices, edges, goal, done):
    return {b for a, b in closure(vertices, edges) if a == goal} - done


def history_supports(claimed, passing_variants):
    """Static authoring fixture: every historically permitted pass must imply C.

    None represents unknown historical meaning, not a learner qualification.
    A current hash or a union of partial variants cannot prove this universal.
    """
    return bool(passing_variants) and all(
        guarantee is not None and claimed <= guarantee for guarantee in passing_variants)


def learning_units(vertices, ordinary, exams, coverage, own, children, mastered):
    units = set(own)
    require(set(children) == units, "Missing child definition")
    closure(units, {(u, v) for u, nested in children.items() for v in nested})
    memberships = [goal for goals in own.values() for goal in goals]
    require(set(memberships) <= vertices, "Unknown target")
    require(len(memberships) == len(set(memberships)), "Ambiguous acquisition owner")
    # Inputs represent one resolved permitted variant. All its own Q are required.
    for goals in own.values():
        covered = set().union(*(coverage.get(q, set()) for q in goals & exams))
        require(goals & ordinary <= covered, "Own ordinary promise lacks required own proof")
    done = effective(mastered, exams, coverage)
    totals, completed = {}, {}

    def visit(unit):
        if unit not in totals:
            for child in children[unit]:
                visit(child)
            totals[unit] = own[unit] | set().union(*(totals[v] for v in children[unit]))
            require(bool(totals[unit]), "Empty navigation marker is not a learning unit")
            completed[unit] = own[unit] <= done and all(completed[v] for v in children[unit])
        return completed[unit]

    for unit in units:
        visit(unit)
        require(completed[unit] == (totals[unit] <= done), "Recursive target-union mismatch")
    return done, completed


def block_dependencies(vertices, edges, own):
    owner = {goal: unit for unit, goals in own.items() for goal in goals}
    require(set(owner) == vertices, "Incomplete block partition")
    return {(owner[a], owner[b]) for a, b in edges if owner[a] != owner[b]}


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
            for exams in subsets(vertices):
                ordinary = vertices - exams
                possibilities = [(q, a) for q, a in reach if q in exams and a in ordinary]
                for assertions in subsets(possibilities):
                    coverage = {q: {a for p, a in assertions if p == q} for q in exams}
                    for relation in (edges, reduction, reach):
                        validate_coverage(vertices, ordinary, exams, relation, coverage)
                    for mastered in subsets(vertices):
                        got = implicit(mastered, exams, coverage)
                        # Pointwise existential witness is independent of set subtraction.
                        expected = {a for a in ordinary - mastered if any(
                            q in mastered and (q, a) in assertions for q in exams)}
                        require(got == expected, "Recognition lacks an explicit qualified witness")
                        require(not got & exams, "Assessment implicitly passed")
                        done = mastered | got
                        require(effective(done, exams, coverage) == done, "Feedback changed proof")
                        for goal in vertices - mastered:
                            require(done <= effective(mastered | {goal}, exams, coverage),
                                    "Additional explicit outcome revoked global credit")
                        checked += 1

    vertices = {"q1", "q2", "a", "b", "k", "h", "o"}
    exams, ordinary = {"q1", "q2"}, {"a", "b"}
    edges = {("q1", "b"), ("b", "a"), ("q1", "h"), ("q2", "a"), ("k", "a")}
    coverage = {"q1": frozenset({"a", "b"}), "q2": frozenset({"a"})}
    validate_coverage(vertices, ordinary, exams, edges, coverage)
    done = effective({"q1"}, exams, coverage)
    require(done == {"q1", "a", "b"}, "Q1 proof delayed by open Q2 or dependent card")
    require(not done & {"q2", "k", "h", "o"}, "Q/K/orientation manufactured")
    require(missing_prerequisites(vertices, edges, "q1", {"b"}) == {"a", "h"},
            "Mastered intermediate cut off transitive demand")
    require(implicit({"b"}, exams, coverage) == set(), "Direct understanding fabricated proof")
    require(implicit({"q1"}, exams, {}) == set(), "Legacy unknown Q fabricated proof")
    require(implicit({"q1"}, exams, {"q1": {"b"}}) == {"b"},
            "Prerequisite path incorrectly treated as coverage")
    require(not minimal(vertices, edges | {("q1", "a")}), "Redundant direct edge accepted")
    require(implicit({"q1"}, exams, coverage) == implicit({"q1"}, exams, dict(reversed(list(coverage.items())))),
            "Contract ordering changed recognition")
    # A new display/target scope intersects global evidence; it does not generate it.
    for target in [{"q1", "a", "b"}, {"q2", "a"}, {"a"}]:
        require(target & done == {a for a in target if a in done}, "Target counting changed proof")
    require(len({"q2", "a"} & done) == 1 and "a" in done,
            "Scope switch lost hidden-support proof or counted outside targets")
    for bad in [{("a", "b"), ("b", "a")}, {("a", "missing")}]:
        rejected(lambda: closure(vertices, bad), "Invalid graph accepted")
    for invalid in [{"q1": {"k"}}, {"q1": {"o"}}, {"q1": {"missing"}}, {"k": {"a"}}]:
        rejected(lambda: validate_coverage(vertices, ordinary, exams, edges, invalid),
                 "Protected/unknown evidence accepted")
    rejected(lambda: validate_coverage(vertices, ordinary, exams, {("q1", "b")}, coverage),
             "Coverage outside prerequisite hull accepted")

    # The authoring coverage is immutable ordinary atoms, independent of mutable
    # cluster membership, official source mapping and selected subject scope.
    frozen = frozenset({"a"})
    old_cluster, expanded_cluster = {"a"}, {"a", "b"}
    require(frozen == old_cluster and frozen != expanded_cluster, "Dynamic cluster expansion upgraded C")
    source_mapping = {"a", "b"}
    require(effective({"q1"}, exams, {"q1": frozen}) == {"q1", "a"}
            and "b" in source_mapping, "Source mapping awarded assessment proof")
    require(history_supports({"a"}, [{"a"}, {"a", "b"}]), "Equivalent guarantee rejected")
    require(not history_supports({"a", "b"}, [{"a"}, {"a", "b"}]), "Stronger history upgraded old pass")
    require(not history_supports({"a"}, [None, {"a"}]), "Unknown historic meaning qualified")
    require(effective({"q1"}, {"q1", "newQ"}, {"newQ": {"a", "b"}}) == {"q1"},
            "New Q-ID inherited an old result")
    # Neither isolated partial Q guarantees the complete experiment+analysis atom.
    require(implicit({"experimentQ", "analysisQ"}, {"experimentQ", "analysisQ", "wholeQ"},
                     {"wholeQ": {"whole"}}) == set(), "Partial passes assembled fictitious whole proof")
    require(implicit({"wholeQ"}, {"wholeQ"}, {"wholeQ": {"whole"}}) == {"whole"},
            "Single multipart complete proof failed")
    # Illustrative normal grade: missing core cannot reach 7, incidental error can.
    passing_points, max_without_core, correct_with_slip = 7, 6, 8
    require(max_without_core < passing_points <= correct_with_slip,
            "Rubric cannot distinguish missing core from incidental arithmetic error")

    # Removing authored edges must recompute inheritance before minimality checks.
    inherited_vertices = {"cluster", "b", "a", "g"}
    contains = {("cluster", "b")}
    authored = {("cluster", "a"), ("g", "b"), ("g", "a")}
    require(minimal(inherited_vertices, authored), "Fixture must be raw-R minimal")
    require(not authored_minimal(inherited_vertices, contains, authored), "Inherited redundancy escaped")
    require(authored_minimal(inherited_vertices, contains, authored - {("g", "a")}),
            "Valid inherited reduction rejected")

    unit_vertices = {"a", "b", "d", "qK", "kK", "qD", "qS"}
    unit_exams, unit_ordinary = {"qK", "qD", "qS"}, {"a", "b", "d"}
    unit_edges = {("qK", "b"), ("b", "a"), ("qD", "d"), ("d", "b"), ("qS", "d")}
    unit_coverage = {"qK": {"a", "b"}, "qD": {"d"}, "qS": {"a", "b", "d"}}
    validate_coverage(unit_vertices, unit_ordinary, unit_exams, unit_edges, unit_coverage)
    own = {"kinematics": {"a", "b", "qK", "kK"},
           "dynamics": {"d", "qD"}, "mechanics": {"qS"}}
    children = {"kinematics": set(), "dynamics": set(), "mechanics": {"kinematics", "dynamics"}}

    def units(mastered, ownership=own, proof=unit_coverage):
        return learning_units(unit_vertices, unit_ordinary, unit_exams, proof,
                              ownership, children, mastered)

    require(units({"qK", "kK", "qD"})[1] ==
            {"kinematics": True, "dynamics": True, "mechanics": False}, "Open parent revoked children")
    parent_done, parent_complete = units({"qS"})
    require(parent_done == {"qS", "a", "b", "d"} and not any(parent_complete.values()),
            "Valid parent proof lost ordinary credit or passed child Q/K")
    require(units({"qK"})[0] >= {"a", "b"} and not units({"qK"})[1]["kinematics"],
            "Open recall blocked proof or passed implicitly")
    require(units({"qK", "kK", "qD"}, dict(own, mechanics=set()))[1]["mechanics"],
            "Aggregate demanded redundant exam")
    # Even direct mastery of every ordinary goal must not mask a deficient own Q.
    rejected(lambda: units(unit_vertices, proof=dict(unit_coverage, qK={"b"})),
             "Direct understanding concealed missing own application coverage")
    # Each permitted resolved alternative must independently satisfy the invariant.
    for variant_coverage in [{"qK": {"a", "b"}}, {"qK": {"b"}}]:
        valid = "a" in variant_coverage["qK"]
        if valid:
            units(set(), proof=dict(unit_coverage, **variant_coverage))
        else:
            rejected(lambda: units(set(), proof=dict(unit_coverage, **variant_coverage)),
                     "Union of alternatives concealed an invalid passing variant")
    rejected(lambda: learning_units(unit_vertices, unit_ordinary, unit_exams, unit_coverage,
                                   {"empty": set()}, {"empty": set()}, set()),
             "Empty unit completed vacuously")
    unit_cases = 0
    for mastered in subsets(unit_vertices):
        done, completed = units(mastered)
        require(done & (unit_exams | {"kK"}) == mastered & (unit_exams | {"kK"}),
                "Recursive unit fabricated explicit outcome")
        for goal in unit_vertices - mastered:
            more_done, more_complete = units(mastered | {goal})
            require(done <= more_done and all(not completed[u] or more_complete[u] for u in own),
                    "New valid outcome reopened unit credit")
        unit_cases += 1

    twisted = block_dependencies({"a", "b", "c"}, {("a", "b"), ("b", "c")},
                                 {"U": {"a", "c"}, "V": {"b"}})
    rejected(lambda: closure({"U", "V"}, twisted), "Atomic DAG proved impossible block order")
    grouping_cases = 0
    for size in range(2, 5):
        vertices = set(range(size))
        for edges in subsets(combinations(range(size), 2)):
            for left in subsets(vertices):
                if not left or left == vertices:
                    continue
                dependencies = block_dependencies(vertices, edges, {"U": left, "V": vertices-left})
                witness = any(all(order.index(b) < order.index(a) for a, b in dependencies)
                              for order in permutations(["U", "V"]))
                try:
                    closure({"U", "V"}, dependencies)
                    acyclic = True
                except AssertionError:
                    acyclic = False
                require(acyclic == witness, "Block DAG differs from complete traversal order")
                grouping_cases += 1
    print(f"PASS: {checked:,} DAG/typing/coverage/mastery cases: explicit witness, monotonicity,")
    print("closure/reduction consistency; no Q/K/orientation proof, no mastery path cut.")
    print("PASS: history/variants, unknown legacy, immutable atom scope, source separation,")
    print("partial versus multipart Q, ordinary grading and required-own coverage counterexamples.")
    print(f"PASS: {unit_cases} recursive-unit states; {grouping_cases} block groupings.")
    print("No real assessment qualification, learner-history or runtime-acceptance claim.")


if __name__ == "__main__":
    main()
