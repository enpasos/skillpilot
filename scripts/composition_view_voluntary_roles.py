"""Validate the graph constraints of a format 1.3 view against actual canonical goals."""
from collections import Counter, defaultdict, deque
from collections.abc import Mapping
from copy import deepcopy
from typing import Any


def validate_voluntary_roles(view: Mapping[str, Any], goals: Mapping[str, Any],
                             root_by_landscape: Mapping[str, str]) -> None:
    offers: set[str] = set()
    references: list[tuple[str, str, int]] = []
    nodes = list(view["rootNodes"])
    while nodes:
        node = nodes.pop()
        kind = node["kind"]
        if kind == "structure":
            nodes.extend(node["children"])
            continue
        if kind == "landscapeEntry":
            root = root_by_landscape.get(node["landscapeId"])
            if root is None:
                raise ValueError(f"Unknown landscape root: {node['landscapeId']}")
            references.append((root, "target", 0))
            continue
        goal_id = node["goalId"]
        role = node.get("projectionRole", "target")
        if role == "voluntary":
            goal = goals.get(goal_id)
            if kind != "goalEntry" or not goal or goal.get("type") != "atomic" or goal.get("contains"):
                raise ValueError(f"A voluntary entry requires a canonical atomic goal: {goal_id}")
            if "acquisitionPlacement" in node:
                raise ValueError(f"A voluntary entry cannot have acquisitionPlacement: {goal_id}")
            if goal_id in offers:
                raise ValueError(f"Duplicate voluntary learning place: {goal_id}")
            offers.add(goal_id)
        elif role in ("target", "prerequisiteOnly"):
            references.append((goal_id, role, 2 if kind == "goalEntry" else 1))
        else:
            raise ValueError(f"Unknown composition projectionRole: {role}")

    def resolve(ref: str) -> str:
        return ref if ref in goals else ref.partition(":")[2] or ref

    def leaves(identifier: str):
        pending = deque([(resolve(identifier), 0)])
        seen = set()
        while pending:
            atom, distance = pending.popleft()
            if atom in seen:
                continue
            seen.add(atom)
            goal = goals.get(atom) or {}
            children = goal.get("contains", [])
            if children:
                pending.extend((resolve(child), distance + 1) for child in children)
            else:
                yield atom, distance

    # An explicit regular or preparation entry can override a broader subtree
    # under the existing rules. A voluntary place cannot compete with either.
    roles: dict[str, tuple[int, int, bool]] = {}
    explicit_roles = {}
    target_places = Counter()
    for identifier, role, priority in references:
        for atom, distance in leaves(identifier):
            if role == "target":
                target_places[atom] += 1
            if atom in offers:
                raise ValueError(f"Conflicting voluntary learning place: {atom}")
            if priority == 2:
                key = (atom, distance)
                if key in explicit_roles and explicit_roles[key] != role:
                    raise ValueError(f"Conflicting explicit roles for {atom}")
                explicit_roles[key] = role
            rank = (priority, -distance, role == "target")
            if atom not in roles or rank > roles[atom]:
                roles[atom] = rank

    for atom, rank in roles.items():
        if rank[2] and target_places[atom] != 1:
            raise ValueError(f"A regular target requires one visible learning place: {atom}")
    if not offers:
        return

    # A prerequisite authored on any containing cluster also applies when its
    # descendant is the only goal referenced by the view.
    parents = defaultdict(set)
    for parent, goal in goals.items():
        for child in goal.get("contains", []):
            parents[resolve(child)].add(parent)

    def inherited_requirements(atom):
        pending = [atom]
        ancestors = set()
        while pending:
            owner = pending.pop()
            if owner in ancestors:
                continue
            ancestors.add(owner)
            yield from (goals.get(owner) or {}).get("requires", [])
            pending.extend(parents[owner])

    pending = [atom for atom, rank in roles.items() if rank[2]]
    visited = set()
    while pending:
        atom = pending.pop()
        if atom in visited:
            continue
        if atom in offers:
            raise ValueError(f"Mandatory learning path contains voluntary goal {atom}")
        visited.add(atom)
        for ref in inherited_requirements(atom):
            pending.extend(leaf for leaf, _distance in leaves(ref))

    for atom in set(roles) | visited:
        covered = ((goals.get(atom) or {}).get("examData") or {}).get("coveredGoalIds", [])
        if any(leaf in offers for ref in covered for leaf, _distance in leaves(ref)):
            raise ValueError(f"Assessment of a voluntary performance must itself be voluntary: {atom}")


SOURCE_SCHEMA = "https://skillpilot.com/schemas/composition-view/v1.3/composition-view.schema.json"


def regular_authoring_input(view):
    """Read the regular authoring input for a single view or its derived views."""
    version = view.get("viewFormatVersion")
    if version not in (None, "1.0", "1.2", "1.3"):
        raise ValueError(f"Unsupported composition view version: {version}")
    successor = version == "1.3"
    if (view.get("$schema") == SOURCE_SCHEMA) != successor:
        raise ValueError("The voluntary composition schema and version must agree")

    def select(nodes):
        result = []
        for node in nodes:
            if node.get("projectionRole") == "voluntary":
                if not successor or node["kind"] != "goalEntry" or "acquisitionPlacement" in node:
                    raise ValueError("A voluntary offer needs an atomic learning place in view format 1.3")
                continue
            if node.get("projectionRole", "target") not in ("target", "prerequisiteOnly"):
                raise ValueError(f"Unknown projectionRole: {node['projectionRole']}")
            if node["kind"] == "structure":
                children = select(node["children"])
                if node["children"] and not children:
                    continue
                node = dict(node, children=children)
                if "childOrder" in node:
                    visible = {c["id"] for c in children if c["kind"] == "structure"}
                    node["childOrder"] = dict(node["childOrder"], after=[
                        p for p in node["childOrder"]["after"]
                        if p["unit"] in visible and p["after"] in visible])
            result.append(node)
        return result

    # A Land offer is authored per view. Regular scope reconstruction, including
    # derived course/stage projections, may use only the regular input.
    if successor:
        result = dict(view)
        result["rootNodes"] = select(view["rootNodes"])
        result["viewFormatVersion"] = "1.2"
        result["$schema"] = SOURCE_SCHEMA.replace("/v1.3/", "/v1.2/")
        return result
    pending = list(view["rootNodes"])
    while pending:
        node = pending.pop()
        if node.get("projectionRole", "target") not in ("target", "prerequisiteOnly"):
            raise ValueError("Unknown projectionRole in legacy composition view")
        pending.extend(node.get("children", []))
    return view


def restore_view_offers(generated, original, goals, root_by_landscape=None):
    """Restore only offers authored for this exact view, at their original parent."""
    if original.get("viewFormatVersion") != "1.3":
        return generated
    if original["viewId"] != generated["viewId"]:
        raise ValueError("Cannot transfer voluntary offers between views")
    regular_authoring_input(original)
    validate_voluntary_roles(original, goals, root_by_landscape or {})
    result = deepcopy(generated)
    result.update({"$schema": SOURCE_SCHEMA, "viewFormatVersion": "1.3"})
    by_id = {}
    def index(nodes):
        for node in nodes:
            if node["kind"] == "structure":
                by_id[node["id"]] = node
                index(node["children"])
    index(result["rootNodes"])

    def only_offers(node):
        return (node.get("projectionRole") == "voluntary" or
                (node["kind"] == "structure" and bool(node["children"]) and all(map(only_offers, node["children"]))))

    def identity(node):
        return node.get("id", node.get("goalId", node.get("landscapeId")))

    def restore(nodes, parent):
        destination = result["rootNodes"] if parent is None else by_id.get(parent["id"], {}).get("children")
        for i, node in enumerate(nodes):
            if only_offers(node):
                if destination is None:
                    raise ValueError(f"Lost the authored parent of a voluntary offer: {parent['id']}")
                # Insert before the next retained sibling to keep runs of offers in order.
                followers = {identity(other) for other in nodes[i + 1:]}
                at = next((n for n, other in enumerate(destination) if identity(other) in followers), len(destination))
                destination.insert(at, deepcopy(node))
            elif node["kind"] == "structure":
                restore(node["children"], node)
        if parent is not None and parent.get("childOrder") and destination is not None:
            offered_sections = {n["id"] for n in nodes if n["kind"] == "structure" and only_offers(n)}
            added = [p for p in parent["childOrder"]["after"] if {p["unit"], p["after"]} & offered_sections]
            if added:
                after = by_id[parent["id"]].setdefault("childOrder", {"after": []})["after"]
                for pair in added:
                    if pair not in after:
                        after.append(deepcopy(pair))

    restore(original["rootNodes"], None)
    validate_voluntary_roles(result, goals, root_by_landscape or {})
    return result
