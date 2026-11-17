#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Minimal explicit child orders shared by Physics view authoring tools."""
import re


def course_seeds(selected, goals, scope):
    """The native course filter restricts seeds, never their prerequisite closure."""
    profile = scope.get("courseProfile")
    if profile not in ("GK", "LK"):
        return set(selected)
    def applies(atom):
        goal = goals[atom]
        tags = goal.get("tags", [])
        if not tags or profile in tags:
            return True
        release = str((goal.get("release") or {}).get("courseLevel") or "").strip().upper()
        if release == profile:
            return True
        return not (set(tags) & {"GK", "LK"} or release)
    return {atom for atom in selected if applies(atom)}


def calendar_barrier(identifier):
    return identifier in ("physics-seki", "physics-bw-seki", "physics-e-phase", "physics-q1", "physics-q2", "physics-q3", "physics-q4", "physics-abitur", "physics-he-abitur") or identifier.startswith("physics-sekii-") or bool(re.search(r"(?:-unit-|-year-|-seki-j)", identifier))


def contextual_targets(view, goals, raw_selected, prerequisites, extract, structure, within_consumer_unit=False):
    """Place a filtered-out, necessary intermediate beside its actual seed demand.

    The original target role remains exact. In GK a necessary LK intermediate
    may be preparation for Q2 without importing its LK E-phase teaching plan.
    """
    seeds = course_seeds(raw_selected, goals, view["scope"])
    learning = seeds | {p for atom in seeds for p in prerequisites(atom)}
    positions = {}
    def visit(nodes, trail=()):
        for node in nodes:
            if node["kind"] == "structure":
                visit(node["children"], (*trail, node))
            elif node.get("projectionRole") != "prerequisiteOnly":
                def expand(identifier):
                    children = goals[identifier].get("contains", []) if node["kind"] == "canonicalSubtree" else []
                    return set().union(*(expand(c) for c in children)) if children else {identifier}
                for atom in expand(node["goalId"]) & set(raw_selected):
                    positions.setdefault(atom, trail)
    visit(view["rootNodes"])
    def temporal(path):
        return next((node for node in reversed(path) if calendar_barrier(node["id"])), path[-1]) if path else None
    shifts = []
    for atom in sorted((set(raw_selected) - seeds) & learning):
        uses = [(seed, path) for seed, path in positions.items() if seed in seeds and atom in prerequisites(seed)]
        if not uses:
            raise ValueError("Necessary intermediate has no applicable seed witness")
        consumer, path = uses[0]
        destination = temporal(path)
        placement_path = path
        if within_consumer_unit:
            # A broad final assessment can require an intermediate that is
            # introduced by an earlier topic in the same phase. Use that
            # genuine necessary step's existing unit, rather than putting its
            # foundations into the final assessment and creating a unit cycle.
            steps = [(step, trail) for step, trail in positions.items()
                     if step in learning and atom in prerequisites(step) and temporal(trail) is destination
                     and trail and not trail[-1]["id"].startswith("physics-context-acquisition-")]
            if steps:
                placement_path = steps[0][1]
        current_path = positions.get(atom, ())
        current = temporal(current_path)
        consumer_unit = placement_path[-1] if within_consumer_unit and placement_path and placement_path[-1] is not destination else None
        old_singleton = bool(current_path and current_path[-1]["id"].startswith("physics-context-acquisition-"))
        if destination is None or (current_path and current_path[-1] is consumer_unit) or (current is destination and not (consumer_unit and old_singleton)):
            continue
        reference = extract(atom)
        if reference is None:
            raise ValueError("Cannot relocate a necessary scoped intermediate")
        unit = consumer_unit
        if unit is None:
            identifier = "physics-context-acquisition-" + atom
            unit = next((n for n in destination["children"] if n.get("id") == identifier), None)
            if unit is None:
                unit = structure(identifier, "Vorbereitung: " + goals[atom]["title"], [])
                destination["children"].insert(0, unit)
        unit["children"].append(reference)
        shifts.append({"goalId": atom, "neededBy": consumer, "from": current["id"] if current else None,
                       "to": destination["id"], "learningPlace": unit["id"],
                       "basis": "applicable seed demand; source target role and requires unchanged"})
    return seeds, learning, shifts

def acquisition_placements(view, goals, selected, prerequisites, structure, consumer_seeds=None):
    """Place only proven L-S atoms beside their first authored consumer.

    The marker authorizes a location template, never a target or mastery write.
    Existing unmarked support/exclusion records remain untouched.
    """
    selected = set(selected)
    consumers_selected = selected if consumer_seeds is None else set(consumer_seeds)
    required = {p for atom in consumers_selected for p in prerequisites(atom)} - selected
    old_templates = {node["goalId"] for node in _walk(view["rootNodes"])
                     if node.get("acquisitionPlacement") is True}
    view["rootNodes"] = [n for n in view["rootNodes"] if n.get("acquisitionPlacement") is not True]
    consumers = {}
    def atoms(node):
        if node.get("projectionRole") == "prerequisiteOnly":
            return set()
        if node["kind"] == "structure":
            return set().union(*(atoms(c) for c in node["children"])) if node["children"] else set()
        def descend(identifier):
            children = goals[identifier].get("contains", []) if node["kind"] == "canonicalSubtree" else []
            return set().union(*(descend(c) for c in children)) if children else {identifier} & consumers_selected
        return descend(node["goalId"])
    def visit(node, trail=()):
        if node["kind"] != "structure":
            return
        node["children"] = [c for c in node["children"] if c.get("acquisitionPlacement") is not True]
        for child in node["children"]:
            if child["kind"] == "structure":
                visit(child, (*trail, node))
            else:
                for consumer in sorted(atoms(child)):
                    for prerequisite in sorted(prerequisites(consumer) & required):
                        consumers.setdefault(prerequisite, []).append(((*trail, node), consumer))
        node["children"] = [c for c in node["children"] if c["kind"] != "structure" or c["children"]]
    for root in view["rootNodes"]:
        visit(root)
    witnesses, places = [], {}
    for prerequisite, uses in sorted(consumers.items()):
        first_path, consumer = uses[0]
        parent = first_path[-1]
        # Shared foundations belong to their common topic parent rather than
        # making the first consuming topic a prerequisite of its independent
        # sibling. Keep them inside the first source year/phase: a later use
        # does not require advanced foundations before all of SekI.
        if not prerequisites(prerequisite) & selected:
            barriers = [n for n in first_path if calendar_barrier(n["id"])]
            barrier = barriers[-1] if barriers else first_path[0]
            relevant = [path for path, _ in uses if any(n is barrier for n in path)]
            common = list(first_path)
            for path in relevant:
                common = common[:next((i for i, (a, b) in enumerate(zip(common, path)) if a is not b), min(len(common), len(path)))]
            parent = common[-1]
        places[prerequisite] = (parent, consumer)
    preparation_groups = {}
    for prerequisite, (parent, consumer) in sorted(places.items()):
        if any(c["kind"] == "structure" and atoms(c) for c in parent["children"]):
            group = preparation_groups.get(parent["id"])
            if group is None:
                identifier = "physics-required-preparation-" + parent["id"]
                group = next((c for c in parent["children"] if c.get("id") == identifier), None)
            if group is None:
                group = structure(identifier, "Notwendige Grundlagen", [])
                parent["children"].insert(0, group)
            if parent["id"] not in preparation_groups:
                preparation_groups[parent["id"]] = group
            parent = group
        parent["children"].insert(0, {"kind": "goalEntry", "goalId": prerequisite,
            "projectionRole": "prerequisiteOnly", "acquisitionPlacement": True})
        queue, seen = [[consumer]], {consumer}
        while queue:
            path = queue.pop(0)
            if path[-1] == prerequisite:
                break
            for previous in goals[path[-1]].get("requires", []):
                if previous not in seen:
                    seen.add(previous)
                    queue.append(path + [previous])
        else:
            raise ValueError("Missing acquisition placement witness")
        witnesses.append({"goalId": prerequisite, "consumerGoalId": consumer,
            "requiredByPath": path, "learningPlace": parent["id"],
            "sourceClaim": "canonical preparation demand only; not an official source assignment"})
    if set(places) != required:
        raise ValueError("A required acquisition atom has no authored consumer")
    # A narrower applicable S can retire a location template. Retain its old
    # support role without granting that obsolete position acquisition authority.
    support = {node["goalId"] for node in _walk(view["rootNodes"])
               if node.get("projectionRole") == "prerequisiteOnly"}
    root = next((node for node in view["rootNodes"] if node.get("id") == "physics-root"), None)
    retained_support = root["children"] if root is not None else view["rootNodes"]
    retained_support.extend({"kind": "goalEntry", "goalId": atom, "projectionRole": "prerequisiteOnly"}
                            for atom in sorted(old_templates - support))
    return witnesses


def _walk(nodes):
    for node in nodes:
        yield node
        if node["kind"] == "structure":
            yield from _walk(node["children"])

def partial_order(groups, atoms, prerequisites, fixed=()):
    """Transitive reduction of complete actual demands plus explicit time order."""
    groups = [group for group in groups if group["kind"] == "structure"]
    identifiers = [group["id"] for group in groups]
    ownership = {}
    for group in groups:
        for atom in atoms(group):
            if atom in ownership:
                raise ValueError("Repeated atomic learning place: " + atom)
            ownership[atom] = group["id"]
    needs = {identifier: set() for identifier in identifiers}
    witnesses = {}
    for atom, dependent in sorted(ownership.items()):
        for required in sorted(prerequisites(atom)):
            previous = ownership.get(required)
            if previous is not None and previous != dependent:
                needs[dependent].add(previous)
                witnesses.setdefault((dependent, previous), {"kind": "canonicalRequirement", "dependentGoalId": atom,
                                                            "requiredGoalId": required})
    for dependent, previous in fixed:
        if dependent not in needs or previous not in needs:
            raise ValueError("Unknown explicit temporal order endpoint")
        needs[dependent].add(previous)
        witnesses.setdefault((dependent, previous), {"kind": "explicitPlanningPolicy"})
    closure, active = {}, set()
    def ancestors(identifier):
        if identifier in active:
            raise ValueError("Cyclic Physics thematic grouping: " + identifier)
        if identifier in closure:
            return closure[identifier]
        active.add(identifier)
        closure[identifier] = set(needs[identifier])
        for previous in needs[identifier]:
            closure[identifier].update(ancestors(previous))
        active.remove(identifier)
        return closure[identifier]
    for identifier in identifiers:
        ancestors(identifier)
    pairs = [{"unit": dependent, "after": previous} for dependent in identifiers for previous in identifiers
             if previous in closure[dependent] and not any(intermediate != previous and previous in closure[intermediate]
                                                           for intermediate in closure[dependent])]
    return {"after": pairs}, [{**pair, "witness": witnesses[(pair["unit"], pair["after"])]} for pair in pairs]

