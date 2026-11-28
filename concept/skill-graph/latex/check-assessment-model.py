#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Finite checks for the confirmed recognition contract and the 19 November proposal.

Every labelled topologically ordered DAG of up to four vertices, every explicit
mastery set and protected exam/card set with complete local assessment routes.
Independent closure and traversal formulations; no mastery stopping barrier.
Own-only acquisition contracts, recursive unit completion and optional block
ordering are checked separately. Real task quality needs content review.
"""
import json
from itertools import combinations, permutations
from pathlib import Path


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


def learning_units(vertices, own, children, protected, edges, mastered, exams):
    """Recognize only Own(U); aggregate completion cannot award child outcomes."""
    units = set(own)
    require(set(children) == units, "Missing unit children definition")
    hierarchy = {(u, v) for u, nested in children.items() for v in nested}
    closure(units, hierarchy)
    memberships = [goal for goals in own.values() for goal in goals]
    require(len(memberships) == len(set(memberships)), "Ambiguous first acquisition")
    recognized = {u: implicit(vertices, goals, protected, edges, mastered, exams)
                  for u, goals in own.items()}
    mastered_effectively = mastered | set().union(*recognized.values())
    totals, completed = {}, {}
    def visit(unit):
        if unit not in totals:
            for child in children[unit]:
                visit(child)
            totals[unit] = own[unit] | set().union(*(totals[v] for v in children[unit]))
            require(bool(totals[unit]), "Empty navigation marker is not a learning unit")
            completed[unit] = own[unit] <= mastered_effectively and all(
                completed[v] for v in children[unit])
        return completed[unit]
    for unit in units:
        visit(unit)
        require(completed[unit] == (totals[unit] <= mastered_effectively),
                "Recursive completion differs from unique target union")
    return recognized, mastered_effectively, completed


def block_dependencies(vertices, edges, own):
    """Diagnostic for a claimed indivisible block order, not authored UnitRequires."""
    owner = {goal: unit for unit, goals in own.items() for goal in goals}
    require(set(owner) == vertices, "Incomplete block partition")
    return {(owner[a], owner[b]) for a, b in edges if owner[a] != owner[b]}


def check_versioned_unit_evidence():
    """Check the proposed E.1 contract against independently listed pass cases."""
    fixture = Path(__file__).resolve().parents[1] / "examples/hessen-physik-e1/umfang.json"
    scope = json.loads(fixture.read_text(encoding="utf-8"))
    child = frozenset((goal, 1) for goal in scope["childAssessmentGoalIds"])
    parent_own = frozenset((goal, 1) for goal in scope["ownAssessmentGoalIds"])
    required = child | parent_own
    require(len(child) == len(parent_own) == 2 and len(required) == 4, "Expected four distinct assessments")
    child_pass_cases = {child | extra for extra in subsets(parent_own)}
    idealisation = "d6dc0e02-831d-4894-a61a-852bcc74f147"
    acceleration = "e4b38061-1f28-43ad-8371-a3e7c0e81856"
    child_content = {idealisation, acceleration}
    child_release = set(scope["childPlanningGoalIds"])
    parent_release = set(scope["unitPlanningGoalIds"])
    open_goals = set(scope["otherContentGoalIds"])
    require(child_release == child_content and not parent_release, "Only the two reviewed child goals qualify")
    require(len(open_goals) == 9 and child_content.isdisjoint(open_goals), "Expected nine other open goals")
    own_revisions = scope["ownAssessmentRevisions"].values()
    require(all(not revision["planningEvidence"] for revision in own_revisions),
            "Neither parent assessment has whole-goal evidence")
    require(scope["rules"]["individualMastery"] == "unchanged", "Explicit mastery must remain independent")
    observed = {item["goalId"] for revision in own_revisions
                for item in revision.get("partialObservations", [])}
    require(observed == {"8aff7aac-321b-5172-ac55-877876bfd2cd", "f6b1d812-ce8b-5852-b417-e6c29b533c7a"}
            and observed <= open_goals, "Both measurement goals must remain open")
    parent_content = open_goals | parent_release
    free_fall = "09029573-864f-40ca-bf8a-cee7bf6dcb73"
    experiment = ("fall-experiment", 1)
    # A second, hypothetical version also requires a practical performance.
    # Adding this obligation never changes the evidence of the first version.
    parent_versions = {
        1: (parent_own, parent_release),
        2: (parent_own | {experiment}, parent_release | {free_fall}),
    }

    def evaluate(passed, versions=parent_versions):
        require(child_release <= child_content, "Child releases a goal it does not own")
        for _, release in versions.values():
            require(release <= parent_content, "E.1 release exceeds its own ordinary content")
        completed, released = set(), set()
        if child <= passed:
            completed.add(("child", 1))
            released.update(child_release)
            for version, (own, atoms) in versions.items():
                if own <= passed:
                    completed.add(("E.1", version))
                    released.update(atoms)
        return completed, released

    for passed in subsets(required):
        original = passed.copy()
        completed, released = evaluate(passed)
        child_done = frozenset(passed) in child_pass_cases
        parent_done = passed == required
        require((("child", 1) in completed) == child_done, "Unexpected child completion")
        require((("E.1", 1) in completed) == parent_done, "Unexpected E.1 completion")
        expected = child_content if child_done else set()
        require(released == expected, "Release before completion or outside the reviewed scope")
        require(("E.1", 2) not in completed and free_fall not in released,
                "The newer version broadened a historical result")
        require(passed == original, "A planning release altered an explicit result")
    completed, released = evaluate(required | {experiment})
    require(completed == {("child", 1), ("E.1", 1), ("E.1", 2)} and free_fall in released,
            "Fresh evidence did not qualify for its own revision")
    for forbidden in ("mathematics-derivative", idealisation, "orientation", "flashcard-recall"):
        try:
            evaluate(required, {1: (parent_own, parent_release | {forbidden})})
        except AssertionError as error:
            require(str(error) == "E.1 release exceeds its own ordinary content",
                    "Invalid release failed for an unrelated reason")
        else:
            raise AssertionError(f"Parent subject unit permitted release of {forbidden}")
    print("PASS: 16 E.1 pass combinations, two child planning releases, nine open goals, revision-bound practical evidence and four invalid releases.")


def main():
    check_versioned_unit_evidence()
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
    # Recursive units have separate child contracts and an optional parent
    # synthesis. Parent Own contains no newly acquired ordinary competency.
    unit_vertices = {"a", "b", "d", "qK", "kK", "qD", "qS"}
    unit_edges = {("qK", "b"), ("b", "a"), ("qD", "d"),
                  ("d", "b"), ("qS", "d")}
    unit_protected = {"qK", "kK", "qD", "qS"}
    unit_exams = {"qK", "qD", "qS"}
    own = {"kinematics": {"a", "b", "qK", "kK"},
           "dynamics": {"d", "qD"}, "mechanics": {"qS"}}
    children = {"kinematics": set(), "dynamics": set(),
                "mechanics": {"kinematics", "dynamics"}}
    def units(mastered, ownership=own):
        return learning_units(unit_vertices, ownership, children, unit_protected,
                              unit_edges, mastered, unit_exams)
    recognized, done, completed = units({"qK", "kK", "qD"})
    require(recognized == {"kinematics": {"a", "b"}, "dynamics": {"d"}, "mechanics": set()},
            "Parent stole acquisition from child contracts")
    require(completed == {"kinematics": True, "dynamics": True, "mechanics": False},
            "Open synthesis did not preserve independently completed children")
    parent_only = units({"qS"})
    require(parent_only[1] == {"qS"} and not any(parent_only[2].values()),
            "Parent synthesis manufactured child mastery or recall")
    require(units({"qK"})[0]["kinematics"] == {"a", "b"}
            and not units({"qK"})[2]["kinematics"],
            "Independent recall blocked early ordinary recognition or was passed implicitly")
    aggregate = dict(own, mechanics=set())
    require(units({"qK", "kK", "qD"}, aggregate)[2]["mechanics"],
            "Aggregate unit wrongly required an extra examination")
    require(units({"qK", "kK", "qD", "qS"})[2]["mechanics"],
            "Valid synthesis with no new ordinary acquisition was rejected")
    try:
        learning_units(unit_vertices, {"empty": set()}, {"empty": set()},
                       unit_protected, unit_edges, set(), unit_exams)
    except AssertionError:
        pass
    else:
        raise AssertionError("Empty unit completed vacuously")
    unit_cases = 0
    for mastered in subsets(unit_vertices):
        recognized, done, completed = units(mastered)
        require(all(recognized[u] <= own[u] - unit_protected for u in own),
                "Recognition escaped own ordinary acquisition")
        require(done & unit_protected == mastered & unit_protected,
                "Recursive completion fabricated a protected result")
        for goal in unit_vertices - mastered:
            more_recognized, more_done, more_complete = units(mastered | {goal})
            require(done <= more_done, "Recursive unit credit is not monotone")
            require(all(not completed[u] or more_complete[u] for u in own),
                    "Additional result reopened a completed unit")
            if goal == "qS":
                require(all(recognized[u] == more_recognized[u] for u in children["mechanics"]),
                        "Parent result changed independently owned child recognition")
        unit_cases += 1
    # Atomic acyclicity alone does not prove that a chosen grouping can be
    # traversed as whole blocks. Such diagnostics never promote atomic edges
    # automatically into an unresolved technical unit-access policy.
    twisted = block_dependencies({"a", "b", "c"}, {("a", "b"), ("b", "c")},
                                 {"U": {"a", "c"}, "V": {"b"}})
    require(twisted == {("U", "V"), ("V", "U")}, "Twisted grouping fixture changed")
    try:
        closure({"U", "V"}, twisted)
    except AssertionError:
        pass
    else:
        raise AssertionError("Atomic DAG incorrectly proved whole-block order")
    grouping_cases = 0
    for size in range(2, 5):
        vertices = set(range(size))
        for edges in subsets(combinations(range(size), 2)):
            for left in subsets(vertices):
                if not left or left == vertices:
                    continue
                dependencies = block_dependencies(vertices, edges,
                                                  {"U": left, "V": vertices-left})
                witness = any(all(order.index(b) < order.index(a) for a, b in dependencies)
                              for order in permutations(["U", "V"]))
                try:
                    closure({"U", "V"}, dependencies)
                    acyclic = True
                except AssertionError:
                    acyclic = False
                require(acyclic == witness, "Block DAG and complete traversal order differ")
                grouping_cases += 1
    print(f"PASS: {checked:,} valid DAG/mastery/protected cases; closure/reduction invariance,")
    print("global monotonicity, mastery intermediate, durable local recognition, protected cards,")
    print("future prerequisites, plan target counting and invalid inputs. No content-review claim.")
    print(f"PASS: {unit_cases} recursive-unit states and {grouping_cases} block-grouping cases;")
    print("Own-only recognition, aggregate/synthesis cases, protected children and unit-order diagnostics.")


if __name__ == "__main__":
    main()
