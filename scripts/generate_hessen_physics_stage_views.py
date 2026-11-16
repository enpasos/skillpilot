#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Regroup only the four retained Hessen Physics views; never author goal content.

The existing views are the reviewed scope inputs. This bounded, idempotent
authoring migration opens a canonical group only where its parts need different
learning places. --check verifies that replay changes neither placements nor
atomic target/support roles. The HE duration policy remains G9-only.
"""
import argparse
import copy
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DIRECTORY = ROOT / "curricula/DE/Gymnasium/composition-views/physik"
FILES = [f"de-he-{prefix}{profile}.view.json" for prefix in ("", "sekii-") for profile in ("gk", "lk")]
GOALS = {}
for source in (ROOT / "curricula/DE/Gymnasium/canonical").glob("*.json"):
    GOALS.update({goal["id"]: goal for goal in json.loads(source.read_text())["goals"]})


def walk(nodes):
    for node in nodes:
        yield node
        yield from walk(node.get("children", []))


def role_atoms(view):
    assignments = {}
    def assign(identifier, role, priority, distance):
        candidate = (priority, -distance, role == "target")
        if identifier not in assignments or candidate > assignments[identifier][0]:
            assignments[identifier] = (candidate, role)
    for node in walk(view["rootNodes"]):
        if "goalId" not in node:
            continue
        role = node.get("projectionRole", "target")
        def visit(identifier, distance=0):
            assign(identifier, role, 2 if node["kind"] == "goalEntry" else 1, distance)
            if node["kind"] == "canonicalSubtree":
                for child in GOALS[identifier].get("contains", []):
                    visit(child, distance + 1)
        visit(node["goalId"])
    return {role: {identifier for identifier, (_, assigned) in assignments.items()
                   if assigned == role and not GOALS[identifier].get("contains")}
            for role in ("target", "prerequisiteOnly")}


def structure(identifier, label, children):
    return {"kind": "structure", "id": identifier, "label": label, "children": children}


def generate(view):
    result = copy.deepcopy(view)
    before = role_atoms(view)
    selected = before["target"]
    shifts = []
    def atoms(node):
        if node.get("projectionRole") == "prerequisiteOnly":
            return set()
        if node["kind"] == "structure":
            return set().union(*(atoms(child) for child in node["children"])) if node["children"] else set()
        def descend(identifier):
            children = GOALS[identifier].get("contains", [])
            return set().union(*(descend(child) for child in children)) if children else {identifier} & selected
        return descend(node["goalId"])

    def find(identifier, nodes=None):
        for siblings in [result["rootNodes"] if nodes is None else nodes]:
            for index, node in enumerate(siblings):
                if node.get("id") == identifier or node.get("goalId") == identifier:
                    return siblings, index, node
                if node["kind"] == "structure":
                    found = find(identifier, node["children"])
                    if found:
                        return found
        return None

    def take(identifier, optional=False):
        found = find(identifier)
        if not found:
            if optional:
                return None
            raise ValueError(f"{view['viewId']}: missing authoring anchor {identifier}")
        siblings, index, node = found
        return siblings.pop(index)

    def expand(node):
        if node["kind"] == "structure":
            return node["children"]
        return [{"kind": "canonicalSubtree", "goalId": identifier,
                 **({"projectionRole": "prerequisiteOnly"} if identifier in before["prerequisiteOnly"]
                    else {"projectionRole": node["projectionRole"]} if "projectionRole" in node else {})}
                for identifier in GOALS[node["goalId"]].get("contains", [])]

    def extract(identifier, nodes=None):
        siblings = result["rootNodes"] if nodes is None else nodes
        for index, node in enumerate(siblings):
            if identifier not in atoms(node):
                continue
            if node.get("goalId") == identifier and not GOALS[identifier].get("contains"):
                return siblings.pop(index)
            if node["kind"] != "structure":
                original = node["goalId"]
                node = structure("he-physics-open-" + original, GOALS[original]["title"], expand(node))
                siblings[index] = node
            found = extract(identifier, node["children"])
            if found:
                return found
        return None

    def topic(identifier, label, source_id=None):
        old = take(identifier, True)
        if old:
            old["label"] = label
            return old
        source = (take(source_id, True) or take("he-physics-open-" + source_id)) if source_id else None
        return structure(identifier, label, expand(source) if source else [])

    def clean(nodes):
        cleaned = []
        for node in nodes:
            if node["kind"] == "structure":
                node["children"] = clean(node["children"])
                if not node["children"]:
                    continue
            cleaned.append(node)
        return cleaned

    root = find("physics-root")[2]
    seki = find("physics-seki")
    if seki:
        stage = seki[2]
        # Source: HE G9 Teil B S.5; official topic details S.6--17.
        # These existing combined goals need an earlier learning place; their
        # source mappings are untouched. Mechanical energy supports 7.2 heat.
        moved = {identifier: extract(identifier) for identifier in (
            "722857cf-f327-5740-8151-64eb92195ec8", "eeba6bf8-a2b9-4d7d-a1d6-67286c923cef",
            "30a936ec-e427-57fe-bf3e-4abd64b1f0c1", "5a3716dd-ec67-5c48-ba3d-1a29f05ba2ce",
            "5be98160-5189-58aa-8183-1df1c400cc8c", "6a4c6042-052b-502b-a39a-0ed8941247ac",
            "1ab5f599-0927-579d-94cc-feecdf3b5603", "71b51afd-c71b-506f-8128-d6de36b509d1",
        )}
        task_ids = [identifier for identifier in atoms(stage)
                    if GOALS[identifier]["title"].startswith("Prüfungsaufgabe:")]
        tasks = [extract(identifier) for identifier in sorted(task_ids)]
        orientation = take("5c44b9ba-9b05-4774-95d5-073230d3fc4f")
        methods = take("physics-methods-k3-preparation")
        method_topic = topic("physics-he-seki-methods", "Denk- und Arbeitsweisen der Physik")
        method_topic["children"] = [methods]
        mechanics = topic("physics-he-seki-mechanics", "7.4 Mechanik", "9645f0d8-43a3-5f29-873c-daa5ace638db")
        energy = take("he-physics-open-" + "6416dd87-8ba4-531f-ac6c-687c355e7ee1", True)
        # Locate the canonical energy bundle by its invariant authored title.
        energy_title = "Arbeit und Energie qualitativ deuten"
        energy_goal = next(goal["id"] for goal in GOALS.values() if goal["title"] == energy_title)
        for node in walk(mechanics["children"]):
            if node.get("goalId") == energy_goal or node.get("id") == "he-physics-open-" + energy_goal:
                energy = node
                break
        if energy:
            def remove_energy(nodes):
                return [({**node, "children": remove_energy(node["children"])} if node["kind"] == "structure" else node)
                        for node in nodes if node is not energy]
            mechanics["children"] = remove_energy(mechanics["children"])
        energy_topic = topic("physics-he-seki-energy", "10.1 Arbeit und Energie")
        if energy:
            energy_topic["children"] = expand(energy)
        mechanics["children"].append(moved["722857cf-f327-5740-8151-64eb92195ec8"])
        heat = topic("physics-he-seki-heat", "7.2 Wärmelehre", "2d3d42ae-492b-4795-a22f-eeca03aaed38")
        heat["children"].append(moved["eeba6bf8-a2b9-4d7d-a1d6-67286c923cef"])
        light = topic("physics-he-seki-light", "7.1 Optik 1", "051cedc5-d380-4716-9751-b18f2e67a912")
        light["children"].extend(moved[identifier] for identifier in (
            "6a4c6042-052b-502b-a39a-0ed8941247ac", "1ab5f599-0927-579d-94cc-feecdf3b5603", "71b51afd-c71b-506f-8128-d6de36b509d1"))
        magnetism = topic("physics-he-seki-magnetism", "7.3 Magnetismus und Elektrizität 1", "4924d83e-5e4b-4819-9d70-86cda3496195")
        optics = topic("physics-he-seki-optics", "8.1 Optik 2", "84b1bc70-dadf-449b-a8d4-8bcee1da1fea")
        electricity = topic("physics-seki-voltage-circuits-safety-batch-011", "8.2 Elektrizität 2")
        pressure = topic("physics-he-seki-pressure", "8.3a Druck und Auftrieb (fakultativ)", "84096c02-0767-4725-8956-37ce7e4b9bbf")
        acoustics = topic("physics-he-seki-acoustics", "8.3b Akustik (fakultativ)", "41fd5575-b1a6-40e7-8ea2-66b75a597a79")
        colors = topic("physics-he-seki-colors", "8.3c Farben (fakultativ)", "48fb4a0b-62a0-4c8f-9792-3aeef6316885")
        nuclear = topic("b034-preserved-rootNodes-0-children-10-children-9", "10.2 Radioaktivität")
        nuclear_extra = take("physics-b034-nuclear-seki", True)
        if nuclear_extra:
            nuclear["children"].append(nuclear_extra)
        supply = topic("physics-he-seki-supply", "10.3 Energieversorgung")
        supply["children"] = [moved[identifier] for identifier in (
            "30a936ec-e427-57fe-bf3e-4abd64b1f0c1", "5a3716dd-ec67-5c48-ba3d-1a29f05ba2ce", "5be98160-5189-58aa-8183-1df1c400cc8c")]
        years = [structure("physics-he-seki-j7", "Jahrgangsstufe 7", [orientation, method_topic, light, magnetism, mechanics, heat]),
                 structure("physics-he-seki-j8", "Jahrgangsstufe 8", [optics, electricity, pressure, acoustics, colors]),
                 structure("physics-he-seki-j10", "Jahrgangsstufe 10", [energy_topic, nuclear, supply])]
        leftovers = clean(stage["children"])
        # Existing year wrappers and exercise shells are emptied during replay.
        stage["children"] = years + [node for node in leftovers if atoms(node)] + [node for node in leftovers if not atoms(node) and node.get("projectionRole") == "prerequisiteOnly"]
        # Move later prerequisites to the existing theme of their first actual
        # demand. This does not rewrite the retained source assignment.
        pull_earlier(years, atoms, lambda identifier: extract(identifier, stage["children"]), shifts)
        year_for = {identifier: index for index, year in enumerate(years) for identifier in atoms(year)}
        for task in tasks:
            required = prerequisites(task["goalId"])
            index = max((year_for[identifier] for identifier in required if identifier in year_for), default=0)
            practice_id = f"physics-he-seki-practice-{index}"
            practice = next((node for node in years[index]["children"] if node.get("id") == practice_id), None)
            if not practice:
                practice = structure(practice_id, "Übungen " + years[index]["label"], [])
                years[index]["children"].append(practice)
            practice["children"].append(task)

    upper = root if view["scope"]["stage"] == "SekII" else next(node for node in root["children"] if node.get("id", "").startswith("physics-sekii-"))
    phases = [find(identifier)[2] for identifier in ("physics-e-phase", "physics-q1", "physics-q2", "physics-q3", "physics-q4")]
    phases[0]["label"] = "Einführungsphase (E1/E2): Mechanik"
    # Existing independently reviewed supplements retain their field wrappers.
    field = lambda label: next(node for node in walk(phases[4]["children"]) if node["kind"] == "structure" and node.get("label") == label)
    for identifier, label in (
        ("physics-b034-transistor", "Festkörperphysik"), ("physics-final-diode-sekii", "Festkörperphysik"),
        ("physics-b034-stars", "Astrophysik"), ("physics-b034-nuclear-sekii", "Kernphysik"),
        ("physics-b034-nuclear", "Kernphysik"), ("physics-semiconductor-sekii", "Festkörperphysik"),
    ):
        node = take(identifier, True)
        if node:
            if identifier == "physics-final-diode-sekii":
                node["label"], node["labelEn"] = "Dioden", "Diodes"
            field(label)["children"].append(node)
    for phase in phases:
        # Each canonical field lists its parts, never its identically named root.
        for index, node in enumerate(phase["children"]):
            if node["kind"] == "canonicalSubtree" and GOALS[node["goalId"]].get("contains") and node.get("projectionRole") != "prerequisiteOnly":
                phase["children"][index] = structure("he-physics-topic-" + node["goalId"], GOALS[node["goalId"]]["title"], expand(node))
        loose = [node for node in phase["children"] if node["kind"] != "structure" and atoms(node)
                 and not GOALS[node["goalId"]]["title"].startswith("Lernkarten")]
        for node in loose:
            phase["children"].remove(node)
        if loose:
            practice = next((node for node in phase["children"] if node.get("id") == "physics-he-practice-" + phase["id"]), None)
            if not practice:
                practice = structure("physics-he-practice-" + phase["id"], "Weitere Übungen und Anwendungen", [])
                phase["children"].append(practice)
            practice["children"].extend(loose)
    exam_id = "61684ca7-b725-534f-944b-c7645cea1792" if view["scope"]["courseProfile"] == "GK" else "79028c45-90ae-57eb-8016-f5a96af18fa2"
    exam = take("physics-he-abitur", True)
    if not exam:
        exam = structure("physics-he-abitur", "Abiturprüfung", expand(take(exam_id)))
    orientation = take("5c44b9ba-9b05-4774-95d5-073230d3fc4f", True) if view["scope"]["stage"] == "SekII" else None
    if orientation:
        phases[0]["children"].insert(0, orientation)
    preparation = take("physics-methods-k3-upper-preparation-assessments", True)
    if preparation:
        preparation["label"] = "Grundlagen und methodische Übungen"
        phases[0]["children"].insert(0, preparation)
    extras = [node for node in upper["children"] if node not in phases and node is not exam and atoms(node)]
    for node in extras:
        upper["children"].remove(node)
        destination = phases[4] if node.get("id") == "physics-b034-assessments" else phases[1]
        if node["kind"] != "structure":
            node = structure("physics-he-upper-additional-" + node["goalId"], "Übungen zur Elektrizität", [node])
        destination["children"].append(node)
    retained = [node for node in upper["children"] if node not in phases and not atoms(node)]
    upper["children"] = phases + [exam] + retained
    pull_earlier(phases, atoms, lambda identifier: extract(identifier, upper["children"]), shifts)
    for phase in phases:
        pull_earlier([node for node in phase["children"] if node["kind"] == "structure" and atoms(node)], atoms,
                     lambda identifier: extract(identifier, phase["children"]), shifts, nested=False)
    result["rootNodes"] = clean(result["rootNodes"])
    sort_tree(result["rootNodes"], atoms)
    after = role_atoms(result)
    # Opening a subtree changes reference distance. Retain the reviewed atomic
    # exclusion explicitly whenever that change would otherwise win a role tie.
    for identifier in sorted(before["prerequisiteOnly"] & after["target"]):
        result["rootNodes"].append({"kind": "goalEntry", "goalId": identifier, "projectionRole": "prerequisiteOnly"})
    after = role_atoms(result)
    if before != after:
        raise ValueError(f"{view['viewId']}: atomic projection roles changed: " + str({role: (before[role] - after[role], after[role] - before[role]) for role in before}))
    return result, shifts


def prerequisites(identifier):
    found = set()
    queue = list(GOALS[identifier].get("requires", []))
    while queue:
        required = queue.pop()
        if required in found:
            continue
        found.add(required)
        queue.extend(GOALS[required].get("requires", []))
    return found


def pull_earlier(groups, atoms, extract, shifts, nested=True):
    changed = True
    while changed:
        changed = False
        ownership = {identifier: index for index, group in enumerate(groups) for identifier in atoms(group)}
        for dependent, index in sorted(ownership.items(), key=lambda item: (item[1], item[0])):
            for required in sorted(prerequisites(dependent)):
                if ownership.get(required, -1) <= index:
                    continue
                destination = next((child for child in groups[index]["children"] if child["kind"] == "structure" and dependent in atoms(child)), groups[index]) if nested else groups[index]
                node = extract(required)
                if not node:
                    raise ValueError("Cannot place necessary goal " + required)
                destination["children"].insert(0, node)
                shifts.append({"goalId": required, "title": GOALS[required]["title"], "from": groups[ownership[required]]["label"], "to": groups[index]["label"], "neededBy": dependent})
                changed = True
                break
            if changed:
                break


def sort_tree(nodes, atoms):
    for node in nodes:
        if node["kind"] == "structure":
            sort_tree(node["children"], atoms)
    # Program order is source-defined; pull_earlier has already removed demand
    # from a later year/phase. Other siblings follow their actual requirements.
    if any(node.get("id", "").startswith("physics-he-seki-j") or node.get("id") == "physics-e-phase" for node in nodes):
        return
    ownership = {identifier: index for index, node in enumerate(nodes) for identifier in atoms(node)}
    needs = {index: {ownership[required] for identifier in atoms(node) for required in prerequisites(identifier)
                     if required in ownership and ownership[required] != index} for index, node in enumerate(nodes)}
    pending = list(range(len(nodes)))
    ordered = []
    while pending:
        ready = next((index for index in pending if not needs[index] & set(pending)), None)
        if ready is None:
            opened = next((index for index in pending if nodes[index]["kind"] == "canonicalSubtree"
                           and GOALS[nodes[index]["goalId"]].get("contains")), None)
            if opened is not None:
                node = nodes[opened]
                children = [{"kind": "canonicalSubtree", "goalId": identifier,
                    **({"projectionRole": node["projectionRole"]} if "projectionRole" in node else {})}
                    for identifier in GOALS[node["goalId"]]["contains"]]
                for child in children:
                    if not GOALS[child["goalId"]].get("contains") and not atoms(child):
                        child["projectionRole"] = "prerequisiteOnly"
                nodes[opened:opened + 1] = children
                sort_tree(nodes, atoms)
                return
            # A coarsened group cycle is evidence, never silently accepted.
            raise ValueError("Cyclic thematic grouping: " + "; ".join(str(nodes[index].get("label", nodes[index].get("goalId"))) + " needs " + str(sorted(needs[index] & set(pending))) for index in pending))
        pending.remove(ready)
        ordered.append(nodes[ready])
    nodes[:] = ordered


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    mode = parser.add_mutually_exclusive_group(required=True)
    mode.add_argument("--write", action="store_true")
    mode.add_argument("--check", action="store_true")
    parser.add_argument("--report", type=Path)
    args = parser.parse_args()
    outputs = []
    report = []
    for name in FILES:
        path = DIRECTORY / name
        current = json.loads(path.read_text())
        generated, shifts = generate(current)
        repeated, _ = generate(generated)
        if generated != repeated:
            raise ValueError(name + ": generator is not idempotent")
        outputs.append((path, generated))
        report.append({"file": name, "changed": current != generated, "earlierDemandPlacements": shifts})
    # All four outputs pass preflight before any write.
    for path, generated in outputs:
        if args.write:
            path.write_text(json.dumps(generated, ensure_ascii=False, indent=2) + "\n")
        elif json.loads(path.read_text()) != generated:
            raise ValueError(path.name + ": stale Hessen Physics stage placement")
    if args.report:
        args.report.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n")
    print(f"Hessen Physics stage views: {len(outputs)} checked; atomic target/support roles preserved.")


if __name__ == "__main__":
    main()
