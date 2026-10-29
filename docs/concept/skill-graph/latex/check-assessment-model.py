#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Finite mathematical checks for assessment-gated-completion.md.

Run with Python 3.10+ from any working directory. Only the standard library is
used. This is a reference check of the proposed formulas, not a runtime
implementation, curriculum validator, assessment-quality test or acceptance
test. It reads no learner data and modifies no files.

The exhaustive check covers every labelled DAG on one to four vertices, every
scoped-mastery set and every disjoint protected/eligible-set assignment.
It compares simultaneous fixed-point iteration with an independent one-pass
topological evaluation and checks leastness by enumerating all containing
fixed points. A second enumeration covers all permitted rule behaviours on
one to three vertices, including conjunctions and multiple rules. Multi-output
rules are equivalent here to a collection of rules with singleton outputs.
These finite checks support the examples; they do not replace general proofs.
"""

from itertools import combinations, product


def require(condition, message):
    """Use explicit failures so python -O cannot disable the checks."""
    if not condition:
        raise AssertionError(message)


def closure(vertices, edges):
    """Non-reflexive transitive closure; cycles retain their reflexive pairs."""
    vertices = frozenset(vertices)
    result = set(edges)
    require(all(a in vertices and b in vertices for a, b in result),
            "Unresolved reference")
    for middle in vertices:
        result |= {(a, b) for a in vertices for b in vertices
                   if (a, middle) in result and (middle, b) in result}
    return frozenset(result)


def context(vertices, atomic_requirements, targets):
    """Resolve H after atomic expansion; base-graph validation is external."""
    vertices, targets = frozenset(vertices), frozenset(targets)
    require(targets <= vertices, "Target outside resolved atomic graph")
    demands = closure(vertices, atomic_requirements)
    members = targets | {b for a, b in demands if a in targets}
    local = frozenset((a, b) for a, b in demands
                      if a in members and b in members)
    require(not any(a == b for a, b in local),
            "Atomic cycle reachable from the targets")
    return members, local


def scope_mastery(mastered_goal_ids, vertices):
    """E is only the restriction of existing global mastery M to V_H.

    The input set represents goals fulfilled under their ordinary goal-type
    contract. This model neither invents a numeric threshold nor accepts a
    second qualification/evidence status. Existing exam mastery counts without
    additional form, attempt or grading metadata.
    """
    return frozenset(mastered_goal_ids) & frozenset(vertices)


def resolve(vertices, demands, targets, assessments, protected, rules, mastery):
    """Derive scoped waivers from global mastery without changing that mastery."""
    vertices, targets = frozenset(vertices), frozenset(targets)
    assessments, protected = frozenset(assessments), frozenset(protected)
    mastery = scope_mastery(mastery, vertices)
    require(bool(assessments) and assessments <= targets <= vertices,
            "Required assessment scope")
    require(assessments <= protected <= vertices, "Assessment protection")
    require(demands == closure(vertices, demands), "Demand relation not closed")
    require(not any(a == b for a, b in demands), "Cyclic demand relation")
    eligible = set()
    for support, waived in rules:
        support, waived = frozenset(support), frozenset(waived)
        require(bool(support) and support <= assessments, "Rule support")
        require(waived <= vertices - protected, "Protected or foreign waiver")
        require(all(any((q, v) in demands for q in support) for v in waived),
                "Waiver without supporting assessment reachability")
        if support <= mastery:
            eligible.update(waived)
    resolved = set(mastery)
    rounds = []
    while True:
        new = {v for v in eligible - resolved
               if {u for u, p in demands if p == v} <= resolved}
        if not new:
            break
        rounds.append(frozenset(new))
        resolved.update(new)
    return (frozenset(resolved - mastery), tuple(rounds),
            assessments <= mastery and targets <= resolved)


def must_reject(action, message):
    try:
        action()
    except AssertionError:
        return
    raise AssertionError(message)


def worked_examples():
    checks = 0
    vertices, demands = context("ABCD", {("B", "A"), ("C", "A"),
                                          ("A", "D")}, "ABCD")
    require(demands == frozenset({("B", "A"), ("C", "A"), ("A", "D"),
                                  ("B", "D"), ("C", "D")}),
            "Example transitive demands")
    rules = [("BC", "AD")]
    expected = [('', '', (), False), ('B', '', (), False),
                ('BC', 'AD', ('A', 'D'), True), ('A', '', (), False),
                ('ABC', 'D', ('D',), True)]
    for mastery, waived, rounds, complete in expected:
        actual = resolve(vertices, demands, vertices, "BC", "BC", rules, mastery)
        require(actual == (frozenset(waived), tuple(map(frozenset, rounds)), complete),
                f"Worked example E={mastery!r}")
        checks += 1

    # A new in-level consumer blocks D. A future consumer outside the
    # prerequisite-closed context has no influence on the earlier profile.
    edges = {("B", "A"), ("C", "A"), ("A", "D"), ("Z", "D")}
    full_v, full_r = context("ABCDZ", edges, "ABCDZ")
    require(resolve(full_v, full_r, full_v, "BC", "BC", rules, "BC")[0]
            == frozenset("A"), "In-level shared consumer must block D")
    local_v, local_r = context("ABCDZ", edges, "ABCD")
    require((local_v, local_r) == (vertices, demands),
            "Future consumer must not enter earlier context")
    checks += 2

    # Supporting B is not a target, but remains a consumer of target A.
    support_v, support_r = context("QBA", {("Q", "B"), ("B", "A")}, "QA")
    support_rules = [("Q", "A")]
    require(resolve(support_v, support_r, "QA", "Q", "Q", support_rules,
                    "Q") == (frozenset(), (), False), "Supporting blocker")
    require(resolve(support_v, support_r, "QA", "Q", "Q", support_rules,
                    "QA")[2], "Explicit target completion suffices")
    require(resolve(support_v, support_r, "QA", "Q", "Q", support_rules,
                    "QB") == (frozenset("A"), (frozenset("A"),), True),
            "Explicit supporting completion releases target waiver")
    checks += 3

    # Reverse the supporting node's role in the chain: Q -> A -> B.
    # B remains an open prerequisite, but is not a consumer of target A.
    # It therefore blocks neither A's enabled waiver nor target completion.
    bottom_v, bottom_r = context("QAB", {("Q", "A"), ("A", "B")}, "QA")
    expected_bottom = (frozenset("A"), (frozenset("A"),), True)
    require(resolve(bottom_v, bottom_r, "QA", "Q", "Q", support_rules,
                    "Q") == expected_bottom,
            "Open supporting prerequisite must not block target waiver")
    require(resolve(bottom_v, bottom_r, "QA", "Q", "QB", support_rules,
                    "Q") == expected_bottom,
            "Protection alone must not turn supporting B into a target")
    require(resolve(bottom_v, bottom_r, "QAB", "Q", "QB", support_rules,
                    "Q") == (frozenset("A"), (frozenset("A"),), False),
            "Required protected B must remain an explicit completion obligation")
    checks += 3

    # B's explicit result does not erase open C's indirect demand on A.
    chain_v, chain_r = context("QCBA", {("Q", "A"), ("C", "B"),
                                        ("B", "A")}, "QCA")
    require(not resolve(chain_v, chain_r, "QCA", "Q", "Q", [("Q", "A")],
                        "QB")[0], "Indirect open consumer")
    checks += 1

    # K contains B, A requires K, B requires A: the effective goal relation
    # is acyclic, but atomisation introduces A <-> B. K is not an atom.
    goal_relation = closure("ABKpq", {("A", "K"), ("B", "A"), ("q", "p")})
    require(not any(a == b for a, b in goal_relation),
            "Counterexample must have no effective-requires cycle")
    atom_edges = {("A", "B"), ("B", "A"), ("q", "p")}
    require(context("ABpq", atom_edges, "pq")
            == (frozenset("pq"), frozenset({("q", "p")})),
            "Unrelated expansion cycle must not reject local context")
    must_reject(lambda: context("ABpq", atom_edges, "A"),
                "Reachable expansion cycle must be rejected")
    must_reject(lambda: context("ABpq", atom_edges, "qA"),
                "One cyclic branch invalidates the whole reached context")
    must_reject(lambda: context("pq", {("q", "missing")}, "q"),
                "Unresolved reference must be rejected")
    checks += 4

    must_reject(lambda: resolve(vertices, demands, vertices, "BC", "BCD",
                                rules, "BC"), "Protected D must not be waivable")
    isolated_v, isolated_r = context("ABCDZ", set(demands), "ABCDZ")
    must_reject(lambda: resolve(isolated_v, isolated_r, isolated_v, "BC", "BC",
                                [("BC", "ADZ")], "BC"),
                "Isolated target must not be eligible")
    require(not resolve(isolated_v, isolated_r, isolated_v, "BC", "BC",
                        rules, "BC")[2], "Isolated target stays open")
    must_reject(lambda: resolve(vertices, demands, vertices, "", "BC", [], ""),
                "An assessment-free level is outside this profile")
    checks += 4
    return checks


def masks_within(mask):
    subset = mask
    while True:
        yield subset
        if not subset:
            break
        subset = (subset - 1) & mask


def mastery_regressions():
    """Mastery is the sole stored goal-result status; waivers stay derived."""
    vertices, demands = context("ABCD", {("B", "A"), ("C", "A"),
                                          ("A", "D")}, "ABCD")
    rules = [("BC", "AD")]

    # Existing mastered assessments count directly. No attempt, form,
    # exposure, grading or separate acceptance metadata is supplied.
    mastery = {"B", "C"}
    expected = (frozenset("AD"), (frozenset("A"), frozenset("D")), True)
    result = resolve(vertices, demands, vertices, "BC", "BC", rules, mastery)
    require(result == expected, "Existing assessment mastery must count")

    # Other scopes' mastered goals neither enter E nor alter this result.
    require(scope_mastery(mastery | {"outside"}, vertices) == frozenset("BC"),
            "Scoped input must be exactly global mastery restricted to V_H")
    require(resolve(vertices, demands, vertices, "BC", "BC", rules,
                    mastery | {"outside"}) == expected,
            "External mastery must not change this context")

    require(mastery == {"B", "C"} and not (set(result[0]) & mastery),
            "Derived waivers must not create or mutate stored mastery")
    require(resolve(vertices, demands, vertices, "BC", "BC", rules, mastery)
            == result, "Repeated evaluation must yield the same derived state")

    # A correction is a fresh calculation from the corrected global state.
    # Previously waived A and D never become mastery inputs on this path.
    corrected_mastery = mastery - {"C"}
    require(resolve(vertices, demands, vertices, "BC", "BC", rules,
                    corrected_mastery) == (frozenset(), (), False),
            "Mastery correction must remove unsupported derived waivers")
    require(corrected_mastery == {"B"} and mastery == {"B", "C"},
            "Recalculation must preserve both caller-owned mastery snapshots")
    return 5


def labelled_dags(size):
    """All labelled directed graphs without loops or opposite edge pairs."""
    pairs = list(combinations(range(size), 2))
    for choices in product(range(3), repeat=len(pairs)):
        rows = [0] * size
        for (left, right), choice in zip(pairs, choices):
            if choice == 1:
                rows[left] |= 1 << right
            elif choice == 2:
                rows[right] |= 1 << left
        for middle in range(size):
            for source in range(size):
                if rows[source] & (1 << middle):
                    rows[source] |= rows[middle]
        if any(row & (1 << index) for index, row in enumerate(rows)):
            continue
        consumers = [sum(1 << source for source, row in enumerate(rows)
                         if row & (1 << target)) for target in range(size)]
        # Independent Kahn ordering, consumers before prerequisites.
        order, seen = [], 0
        while len(order) < size:
            candidates = [v for v in range(size)
                          if not seen & (1 << v) and consumers[v] & ~seen == 0]
            require(bool(candidates), "Acyclic graph lost topological order")
            for vertex in candidates:
                order.append(vertex)
                seen |= 1 << vertex
        yield tuple(rows), tuple(consumers), tuple(order)


def iterate_mask(consumers, mastery, eligible):
    current, rounds = mastery, 0
    while True:
        following = current
        for vertex, incoming in enumerate(consumers):
            if eligible & (1 << vertex) and incoming & ~current == 0:
                following |= 1 << vertex
        if following == current:
            return current, rounds
        current, rounds = following, rounds + 1


def topological_mask(consumers, order, mastery, eligible):
    current = mastery
    for vertex in order:
        if eligible & (1 << vertex) and consumers[vertex] & ~current == 0:
            current |= 1 << vertex
    return current


def exhaustive_core():
    graph_count = assignment_count = leastness_count = 0
    expected_graph_counts = {1: 1, 2: 3, 3: 25, 4: 543}
    for size in range(1, 5):
        universe = (1 << size) - 1
        size_count = 0
        for _, consumers, order in labelled_dags(size):
            graph_count += 1
            size_count += 1
            results = {}
            for eligible in range(universe + 1):
                for mastery in range(universe + 1):
                    result, rounds = iterate_mask(consumers, mastery, eligible)
                    results[mastery, eligible] = result
                    require(result == topological_mask(consumers, order, mastery, eligible),
                            "Fixed point differs from topological evaluation")
                    require(mastery & ~result == 0, "Mastery input disappeared")
                    waived = result & ~mastery
                    require(waived & ~eligible == 0, "Ineligible goal was waived")
                    require(rounds <= size - mastery.bit_count(), "Round bound exceeded")
                    require(all(not waived & (1 << v) or incoming & ~result == 0
                                for v, incoming in enumerate(consumers)),
                            "Waived goal has an open consumer")
                    require(iterate_mask(consumers, result, eligible)[0] == result,
                            "Result is not a fixed point")
                    for candidate in masks_within(universe & ~mastery):
                        candidate |= mastery
                        # Test the defining one-step condition directly, rather
                        # than using the iterator to identify its competitors.
                        is_fixed = all(not eligible & (1 << vertex)
                                       or candidate & (1 << vertex)
                                       or incoming & ~candidate
                                       for vertex, incoming in enumerate(consumers))
                        if is_fixed:
                            require(result & ~candidate == 0,
                                    "Result is not the least containing fixed point")
                            leastness_count += 1
            for protected in range(universe + 1):
                for eligible in masks_within(universe & ~protected):
                    for mastery in range(universe + 1):
                        assignment_count += 1
                        result = results[mastery, eligible]
                        require((result & ~mastery) & protected == 0,
                                "Protected goal was derived")
                        for vertex in range(size):
                            bit = 1 << vertex
                            require(result & ~results[mastery | bit, eligible] == 0,
                                    "Mastery addition reopened work")
                            if not protected & bit:
                                require(result & ~results[mastery, eligible | bit] == 0,
                                        "Eligibility addition reopened work")
            # Repeated authored edge configurations with the same closure are
            # deliberately included: a relation's reachability drives the result.
        require(size_count == expected_graph_counts[size], "DAG enumeration incomplete")
    return graph_count, assignment_count, leastness_count


def exhaustive_policies():
    policy_count = mastery_count = 0
    for size in range(1, 4):
        universe = (1 << size) - 1
        for rows, consumers, _ in labelled_dags(size):
            for assessments in range(1, universe + 1):
                for extra_protection in masks_within(universe & ~assessments):
                    protected = assessments | extra_protection
                    # Every finite rule behaviour can be expressed by these
                    # supported singleton-output rules (empty outputs do nothing).
                    possible = []
                    for support in masks_within(assessments):
                        if not support:
                            continue
                        reachable = 0
                        for vertex in range(size):
                            if support & (1 << vertex):
                                reachable |= rows[vertex]
                        for vertex in range(size):
                            bit = 1 << vertex
                            if reachable & bit and not protected & bit:
                                possible.append((support, bit))
                    for family in range(1 << len(possible)):
                        policy_count += 1
                        rules = [rule for index, rule in enumerate(possible)
                                 if family & (1 << index)]
                        results = {}
                        for mastery in range(universe + 1):
                            mastery_count += 1
                            eligible = 0
                            for support, output in rules:
                                if support & ~mastery == 0:
                                    eligible |= output
                            result = iterate_mask(consumers, mastery, eligible)[0]
                            results[mastery] = result
                            require((result & ~mastery) & protected == 0,
                                    "Rule family waived a protected goal")
                            require(all(not (result & ~mastery) & (1 << vertex)
                                        or any(output == (1 << vertex) and
                                               support & ~mastery == 0
                                               for support, output in rules)
                                        for vertex in range(size)),
                                    "Derived work enabled an assessment rule")
                        for mastery, result in results.items():
                            for vertex in range(size):
                                require(result & ~results[mastery | (1 << vertex)] == 0,
                                        "Policy mastery monotonicity failed")
    return policy_count, mastery_count


def main():
    examples = worked_examples()
    regressions = mastery_regressions()
    graphs, assignments, leastness = exhaustive_core()
    policies, policy_mastery = exhaustive_policies()
    print(f"PASS: {examples} worked-example and rejection checks.")
    print(f"PASS: {regressions} global-mastery integration checks.")
    print(f"PASS: {graphs} labelled DAGs (1-4 vertices); "
          f"{assignments} mastery/protection/eligibility assignments.")
    print(f"PASS: {leastness} containing-fixed-point comparisons; "
          "leastness, topological equivalence, protection, round bound, "
          "no open consumer and monotonicity.")
    print(f"PASS: {policies} reviewed-rule behaviours (1-3 vertices); "
          f"{policy_mastery} mastery snapshots; mastery-only rule activation "
          "and mastery monotonicity.")
    print("Scope: finite formula checks only; no runtime, assessment-quality "
          "or learner-benefit acceptance claim.")


if __name__ == "__main__":
    main()
