#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Apply W1's reviewed whole-view roles for several forces at one body.

A source-backed target receives its own released check. A preparation is an
acquisition template only. Voluntary, branch-only and unverified cohort offers
are deliberately absent until the product model can represent their scope.
"""

import copy
import functools
import gzip
import hashlib
import json
from pathlib import Path

from legacy_composition_view import assert_supported_composition_view

ROOT = Path(__file__).resolve().parents[1]
PLAN = json.loads(
    (ROOT / "scripts/generate_laender_physics_stage_views.sources.json").read_text()
)["reviewedSeveralForcesBindings"]
DECISIONS = json.loads((ROOT / PLAN["sourceDecisionsPath"]).read_text())
BY_VIEW = {row["viewId"]: row for row in DECISIONS["views"]}
GOALS = set(DECISIONS["goalIds"].values())
ASSESSMENTS = set(DECISIONS["assessmentGoalIds"].values())
IDS = GOALS | ASSESSMENTS
B = DECISIONS["goalIds"]["B"]
# Created by W1 acquisition reconstruction; absent from the retained baseline.
W1_EMPTY_WRAPPERS = {"physics-required-preparation-physics-e2-newton-and-conservation"}


def unit_precedes(left, right):
    """Whether authored sibling reachability puts left before right."""
    for index, (a, b) in enumerate(zip(left, right)):
        if a is b:
            continue
        parent = left[index - 1] if index else None
        pairs = parent.get("childOrder", {}).get("after", []) if parent else []
        needs = {}
        for pair in pairs:
            needs.setdefault(pair["unit"], set()).add(pair["after"])

        def predecessors(unit, seen=None):
            seen = set() if seen is None else seen
            for previous in needs.get(unit, set()) - seen:
                seen.add(previous)
                predecessors(previous, seen)
            return seen

        return a["id"] in predecessors(b["id"])
    return False


def without_force_places(view):
    assert_supported_composition_view(view)
    result = copy.deepcopy(view)

    def trim(nodes):
        kept = []
        for node in nodes:
            if node.get("goalId") in IDS:
                continue
            if node["kind"] == "structure":
                original_ids = {
                    c.get("id") for c in node["children"] if c["kind"] == "structure"
                }
                node = dict(node, children=trim(node["children"]))
                if node["id"] in W1_EMPTY_WRAPPERS and not node["children"]:
                    continue
                removed = original_ids - {
                    c.get("id") for c in node["children"] if c["kind"] == "structure"
                }
                if removed and "childOrder" in node:
                    node["childOrder"] = dict(
                        node["childOrder"],
                        after=[
                            p
                            for p in node["childOrder"]["after"]
                            if p["unit"] not in removed and p["after"] not in removed
                        ],
                    )
            kept.append(node)
        return kept

    result["rootNodes"] = trim(result["rootNodes"])
    return result


def with_clean_force_input(generate, clean_seed_ids=False):
    @functools.wraps(generate)
    def wrapped(view, *args, **kwargs):
        if clean_seed_ids and args:
            args = (type(args[0])(a for a in args[0] if a not in IDS), *args[1:])
        return generate(without_force_places(view), *args, **kwargs)

    return wrapped


def apply_force_places(view, goals):
    result = without_force_places(view)

    def legacy_references(nodes, trail=()):
        return [
            item
            for node in nodes
            for item in (
                legacy_references(node["children"], trail + (node["id"],))
                if node["kind"] == "structure"
                else [] if node.get("goalId") in IDS else [(trail, node)]
            )
        ]

    legacy_before = legacy_references(result["rootNodes"])
    decision = BY_VIEW[result["viewId"]]
    if decision["scope"] != result["scope"]:
        raise ValueError("Unreviewed W1 force scope: " + result["viewId"])

    def find(identifier, nodes=None):
        for node in result["rootNodes"] if nodes is None else nodes:
            if node.get("id") == identifier:
                return node
            if node["kind"] == "structure":
                found = find(identifier, node["children"])
                if found is not None:
                    return found
        return None

    placed = set()
    for row in decision["placements"]:
        atom, task = row["goalId"], row["assessmentGoalId"]
        if atom not in goals or task not in goals:
            raise ValueError("W1 content/task is missing: " + atom)
        if row["assessmentOffered"]:
            exam = goals[task].get("examData", {})
            if (
                goals[task].get("requires") != [atom]
                or exam.get("coveredGoalIds") != [atom]
                or exam.get("reviewStatus") != "released"
                or not exam.get("taskContent")
            ):
                raise ValueError("W1 closing contract is not released: " + task)
        for spec in row.get("newStructures", []):
            if find(spec["id"]) is None:
                parent = find(spec["parent"])
                if parent is None:
                    raise ValueError("Missing W1 source parent: " + spec["parent"])
                parent["children"].append(
                    dict(
                        kind="structure",
                        id=spec["id"],
                        label=spec["label"],
                        children=[],
                    )
                )
        nodes = result["rootNodes"]
        for identifier in row["place"]:
            matched = [
                n
                for n in nodes
                if n.get("id") == identifier and n["kind"] == "structure"
            ]
            if len(matched) != 1:
                raise ValueError(
                    "Missing W1 place: " + result["viewId"] + "/" + identifier
                )
            parent = matched[0]
            nodes = parent["children"]
        entry = dict(
            kind="goalEntry", goalId=atom, projectionRole=row["projectionRole"]
        )
        if row["projectionRole"] == "prerequisiteOnly":
            entry.update(
                acquisitionPlacement=True,
                displayLabel=goals[atom]["title"]
                + " (eigene Vorbereitung von SkillPilot)",
            )
        nodes.extend([entry])
        if row["assessmentOffered"]:
            nodes.append(dict(kind="goalEntry", goalId=task))
        placed.add(atom)
    # An official source place and a required learning place are different
    # facts. Only the new B entry may move: every existing reference and unit
    # remains in its exact place. Put each stage's B before its first actual
    # applicable target user, including an earlier source section or year.
    from functools import cache
    from generate_physics_partial_orders import course_seeds

    @cache
    def requires(atom):
        direct = {x.split(":")[-1] for x in goals[atom].get("requires", [])}
        return direct | {p for x in direct for p in requires(x)}

    def references(nodes, trail=()):
        for node in nodes:
            if node["kind"] == "structure":
                yield from references(node["children"], trail + (node,))
            else:
                yield nodes, node, trail

    def atoms(node):
        def descend(atom):
            children = (
                goals[atom].get("contains", [])
                if node["kind"] == "canonicalSubtree"
                else []
            )
            return {p for c in children for p in descend(c)} if children else {atom}

        return descend(node["goalId"])

    refs = list(references(result["rootNodes"]))
    from generate_hessen_physics_stage_views import role_atoms as resolved_roles

    selected = (
        course_seeds(resolved_roles(result)["target"], goals, result["scope"]) - IDS
    )
    learning = selected | {p for atom in selected for p in requires(atom)}

    def placed_users(node):
        if node.get("projectionRole") == "prerequisiteOnly":
            return (
                {node["goalId"]} & learning
                if node.get("acquisitionPlacement") is True
                else set()
            )
        return atoms(node) & selected

    def stage(trail):
        return next(
            (
                n["id"]
                for n in trail
                if n["id"] in ("physics-seki", "physics-bw-seki")
                or n["id"].startswith("physics-sekii-")
            ),
            None,
        )

    has_regular_B = any(
        node.get("goalId") == B and node.get("projectionRole") != "prerequisiteOnly"
        for _, node, _ in refs
    )
    users = [
        (siblings, node, trail)
        for siblings, node, trail in refs
        if any(B in requires(atom) for atom in placed_users(node))
    ]
    for current_stage in dict.fromkeys(stage(trail) for _, _, trail in users):
        current_refs = list(references(result["rootNodes"]))
        b_refs = [
            x
            for x in current_refs
            if x[1].get("goalId") == B and stage(x[2]) == current_stage
        ]
        stage_users = [x for x in users if stage(x[2]) == current_stage]
        earlier = [
            x for x in stage_users if b_refs and unit_precedes(x[2], b_refs[0][2])
        ]
        first = (earlier or stage_users)[0]
        first_index = next(i for i, x in enumerate(current_refs) if x[1] is first[1])
        before = [
            x
            for x in b_refs
            if next(i for i, y in enumerate(current_refs) if y[1] is x[1]) < first_index
            and not unit_precedes(first[2], x[2])
        ]
        if before or (has_regular_B and not b_refs):
            continue
        if b_refs:
            siblings, entry, _ = b_refs[0]
            siblings.remove(entry)
        else:
            entry = dict(
                kind="goalEntry",
                goalId=B,
                projectionRole="prerequisiteOnly",
                acquisitionPlacement=True,
                displayLabel=goals[B]["title"]
                + " (eigene Vorbereitung von SkillPilot)",
            )
        first[0].insert(next(i for i, n in enumerate(first[0]) if n is first[1]), entry)
    if legacy_references(result["rootNodes"]) != legacy_before:
        raise ValueError(
            "W1 changed an existing reference place or order: " + result["viewId"]
        )
    result["$schema"] = (
        "https://skillpilot.com/schemas/composition-view/v1.2/composition-view.schema.json"
    )
    result["viewFormatVersion"] = "1.2"
    result.setdefault("language", "de")
    return result


@functools.cache
def legacy_regular_reference_order():
    path = ROOT / PLAN["legacyReferenceBaselinePath"]
    if (
        hashlib.sha256(path.read_bytes()).hexdigest()
        != PLAN["legacyReferenceBaselineSha256"]
    ):
        raise ValueError("The retained Physics reference baseline changed")
    return {
        row["viewId"]: row["references"]
        for row in json.loads(gzip.decompress(path.read_bytes()))["views"]
    }


@functools.cache
def legacy_unit_orders():
    path = ROOT / PLAN["legacyUnitOrderBaselinePath"]
    if (
        hashlib.sha256(path.read_bytes()).hexdigest()
        != PLAN["legacyUnitOrderBaselineSha256"]
    ):
        raise ValueError("The retained Physics unit-order baseline changed")
    return {
        row["viewId"]: row["orders"]
        for row in json.loads(gzip.decompress(path.read_bytes()))["views"]
    }


def complete_force_authoring(view, goals):
    """Complete the accepted delta without rebuilding unrelated legacy places.

    Keep every old regular reference in its exact parent and relative order.
    Only genuine required non-target acquisitions may be added or advanced;
    explicit after hulls include the newly introduced B/G demand.
    """
    from generate_physics_partial_orders import course_seeds, partial_order

    assert_supported_composition_view(view)
    result = copy.deepcopy(view)
    old = legacy_regular_reference_order()[result["viewId"]]
    # The national upper-stage reconstruction has no Land source quotient.
    # Retain its established acquisition templates and common course calendar
    # before introducing new prerequisite demand into that same quotient.
    national_upper = (
        result["scope"].get("jurisdiction", "DE") == "DE"
        and result["scope"]["stage"] == "SekII"
    )
    old_orders = legacy_unit_orders()[result["viewId"]] if national_upper else {}
    containers = {(): result["rootNodes"]}
    existing_acquisitions = {}

    def index_legacy_places(nodes, trail=()):
        for node in nodes:
            if node["kind"] == "structure":
                path = trail + (node["id"],)
                containers[path] = node["children"]
                index_legacy_places(node["children"], path)
                if node["id"] in old_orders:
                    known = {
                        n["id"] for n in node["children"] if n["kind"] == "structure"
                    }
                    pairs = [
                        p
                        for p in old_orders[node["id"]]
                        if p["unit"] in known and p["after"] in known
                    ]
                    if pairs:
                        node["childOrder"] = {"after": copy.deepcopy(pairs)}
                    elif "childOrder" in node:
                        node["childOrder"] = {"after": []}
            elif (
                node.get("acquisitionPlacement") is True
                and node.get("goalId") not in IDS
            ):
                existing_acquisitions[node["goalId"]] = (nodes, node)

    index_legacy_places(result["rootNodes"])
    # Base reconstruction must not advance old preparation merely because B/G
    # temporarily occur in its acquisition inventory. Restore the retained
    # templates first; actual new demand is evaluated below against the final
    # owners and the unchanged authored unit constraints.
    for row in old if national_upper else []:
        reference = row["reference"]
        if reference.get("acquisitionPlacement") is not True:
            continue
        current = existing_acquisitions.get(reference["goalId"])
        destination = containers.get(tuple(row["path"]))
        if (
            current is not None
            and destination is not None
            and current[0] is not destination
        ):
            siblings, node = current
            siblings.remove(node)
            destination.append(node)
    encoded = lambda n: json.dumps(
        n, ensure_ascii=True, sort_keys=True, separators=(",", ":")
    )
    order = {}
    for row in old:
        order.setdefault(tuple(row["path"]), []).append(encoded(row["reference"]))

    def restore(nodes, trail=()):
        expected = order.get(trail, [])
        keys = set(expected)
        positions = [
            i
            for i, n in enumerate(nodes)
            if n["kind"] != "structure"
            and n.get("goalId") not in IDS
            and encoded(n) in keys
        ]
        from collections import defaultdict, deque

        available = defaultdict(deque)
        for i in positions:
            available[encoded(nodes[i])].append(nodes[i])
        fixed = [available[key].popleft() for key in expected if available[key]]
        # Identical unmarked inventory references can occur more than once;
        # retain their exact old occurrence sequence, rather than rank them
        # by their final occurrence and accidentally group duplicates.
        for i in positions:
            key = encoded(nodes[i])
            if available[key] and nodes[i] is available[key][0]:
                fixed.append(available[key].popleft())
        for i, n in zip(positions, fixed):
            nodes[i] = n
        for n in nodes:
            if n["kind"] == "structure":
                restore(n["children"], trail + (n["id"],))

    restore(result["rootNodes"])
    result = apply_force_places(result, goals)

    @functools.cache
    def required(atom):
        direct = {r.split(":")[-1] for r in goals[atom].get("requires", [])}
        return direct | {p for r in direct for p in required(r)}

    def references(nodes, trail=()):
        for n in nodes:
            if n["kind"] == "structure":
                yield from references(n["children"], trail + (n,))
            else:
                yield nodes, n, trail

    def atoms(n):
        if n["kind"] == "structure":
            return {a for c in n["children"] for a in atoms(c)}
        if n.get("projectionRole") == "prerequisiteOnly":
            return set()

        def expand(a):
            cs = goals[a].get("contains", []) if n["kind"] == "canonicalSubtree" else []
            return {x for c in cs for x in expand(c)} if cs else {a}

        return expand(n["goalId"])

    from generate_hessen_physics_stage_views import role_atoms as resolved_roles

    raw = resolved_roles(result)["target"]
    selected = course_seeds(raw, goals, result["scope"])
    learning = selected | {p for a in selected for p in required(a)}
    force_need = {p for a in GOALS & learning for p in required(a)} - raw
    # Reconstruction without the new owners can retire their existing
    # templates into unmarked root inventory. That intermediate inventory is
    # neither a new exclusion nor an additional learning place. Retain every
    # original occurrence and discard only newly introduced duplicates.
    from collections import Counter

    retained_inventory = Counter(
        (tuple(row["path"]), encoded(row["reference"]))
        for row in old
        if row["reference"].get("projectionRole") == "prerequisiteOnly"
        and row["reference"].get("acquisitionPlacement") is not True
    )

    def retain_inventory(nodes, trail=()):
        kept = []
        for node in nodes:
            if node["kind"] == "structure":
                node["children"] = retain_inventory(
                    node["children"], trail + (node["id"],)
                )
            elif (
                node.get("goalId") in force_need
                and node.get("projectionRole") == "prerequisiteOnly"
                and node.get("acquisitionPlacement") is not True
            ):
                key = (trail, encoded(node))
                if not retained_inventory[key]:
                    continue
                retained_inventory[key] -= 1
            kept.append(node)
        return kept

    result["rootNodes"] = retain_inventory(result["rootNodes"])
    repairs = []
    for atom in sorted(force_need):
        current = list(references(result["rootNodes"]))
        uses = [
            (i, s, n, tr, n["goalId"])
            for i, (s, n, tr) in enumerate(current)
            if n.get("goalId") in GOALS
            and n["goalId"] in learning
            and atom in required(n["goalId"])
        ]
        if not uses:
            continue
        first, siblings, consumer, trail, user = uses[0]
        # Keep the accepted preparation block before this source unit's new
        # force goals and checks. Its actual authority remains the genuine
        # B/G consumer above; an earlier neighbouring check adds no authority.
        anchor = next((n for n in siblings if n.get("goalId") in IDS), consumer)
        if siblings.index(anchor) < siblings.index(consumer):
            consumer = anchor
            first = next(i for i, (_, n, _) in enumerate(current) if n is anchor)
        markers = [
            (i, s, n, tr)
            for i, (s, n, tr) in enumerate(current)
            if n.get("goalId") == atom and n.get("acquisitionPlacement") is True
        ]
        if markers:
            marker_index, _, _, marker_trail = markers[0]
            same_place = [n["id"] for n in marker_trail] == [n["id"] for n in trail]
            actually_late = unit_precedes(trail, marker_trail) or (
                same_place and marker_index >= first
            )
            if not actually_late:
                continue
        if markers:
            _, old_siblings, entry, old_trail = markers[0]
            old_siblings.remove(entry)
            origin = [n["id"] for n in old_trail]
        else:
            entry = dict(
                kind="goalEntry",
                goalId=atom,
                projectionRole="prerequisiteOnly",
                acquisitionPlacement=True,
            )
            origin = None
        siblings.insert(next(i for i, n in enumerate(siblings) if n is consumer), entry)
        repairs.append(
            dict(
                goalId=atom,
                consumerGoalId=user,
                fromPlace=origin,
                toPlace=[n["id"] for n in trail],
                basis="genuine current B/G prerequisite demand, before its first selected consumer",
            )
        )
    # Fresh reconstruction can retain weight while vector addition is newly
    # acquired, or retain both in the opposite intermediate order. Give the
    # shared G preparation block one stable order from G's authored requires
    # list, visiting genuine prerequisites before their users. Only existing
    # acquisition slots are sorted; every regular reference stays untouched.
    g = DECISIONS["goalIds"]["G"]
    preparation_order = []
    visited = set()

    def visit_requirement(atom):
        if atom in visited:
            return
        visited.add(atom)
        for reference in goals[atom].get("requires", []):
            visit_requirement(reference.split(":")[-1])
        preparation_order.append(atom)

    visit_requirement(g)
    preparation_rank = {atom: index for index, atom in enumerate(preparation_order)}

    def order_g_preparation(nodes):
        if any(
            node.get("goalId") == g and node.get("projectionRole") != "prerequisiteOnly"
            for node in nodes
        ):
            positions = [
                index
                for index, node in enumerate(nodes)
                if node.get("goalId") in force_need & preparation_rank.keys()
                and node.get("acquisitionPlacement") is True
            ]
            ordered = sorted(
                (nodes[index] for index in positions),
                key=lambda node: preparation_rank[node["goalId"]],
            )
            for index, node in zip(positions, ordered):
                nodes[index] = node
        for node in nodes:
            if node["kind"] == "structure":
                order_g_preparation(node["children"])

    order_g_preparation(result["rootNodes"])
    # MV's source topic and its earlier-methods bundle otherwise quotient the
    # new G demand into a false cycle through the existing modelling user.
    # Place only new G/KG beside their weight prerequisite; source assignment
    # remains in the reviewed decision and no old target moves.
    if (
        result["scope"].get("jurisdiction") == "DE-MV"
        and result["scope"]["stage"] == "SekII"
    ):
        current = list(references(result["rootNodes"]))
        weight = "9c328f68-41ed-55dd-9e02-34414a6246f2"
        g = DECISIONS["goalIds"]["G"]
        kg = DECISIONS["assessmentGoalIds"]["G"]
        weight_ref = next(
            ((s, n, tr) for s, n, tr in current if weight in atoms(n)), None
        )
        g_refs = [
            (s, n, tr)
            for s, n, tr in current
            if n.get("goalId") in (g, kg)
            and n.get("projectionRole") != "prerequisiteOnly"
        ]
        if weight_ref and g_refs:
            destination, weight_node, tr = weight_ref
            for siblings, n, old_trail in g_refs:
                if siblings is destination:
                    continue
                siblings.remove(n)
                destination.append(n)
                repairs.append(
                    dict(
                        goalId=n["goalId"],
                        fromPlace=[x["id"] for x in old_trail],
                        toPlace=[x["id"] for x in tr],
                        basis="new G/KG beside the actual selected weight prerequisite; avoids a grouping cycle through existing friction modelling",
                    )
                )

    # Complete sibling reachability with real direct atomic edges and retain
    # explicit old calendar/order constraints; transitive reduction is exact.
    def learning_atoms(n):
        if n.get("projectionRole") == "prerequisiteOnly":
            return (
                {n["goalId"]} & learning
                if n.get("acquisitionPlacement") is True
                else set()
            )
        if n["kind"] == "structure":
            return {a for c in n["children"] for a in learning_atoms(c)}
        return atoms(n) & raw & learning

    def finish(n):
        if n["kind"] != "structure":
            return
        for child in n["children"]:
            finish(child)
        groups = [c for c in n["children"] if c["kind"] == "structure"]
        if len(groups) < 2:
            return
        known = {c["id"] for c in groups}
        fixed = [
            (p["unit"], p["after"])
            for p in n.get("childOrder", {}).get("after", [])
            if p["unit"] in known and p["after"] in known
        ]
        n["childOrder"], _ = partial_order(
            groups,
            learning_atoms,
            lambda a: {r.split(":")[-1] for r in goals[a].get("requires", [])},
            fixed,
        )

    for n in result["rootNodes"]:
        finish(n)
    return result
