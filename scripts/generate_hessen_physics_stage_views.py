#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Regroup Hessen Physics views; never author goal content.

The existing views are the reviewed scope inputs, supplemented by the two
Hessen E.1 assessments and two replacements for the assessments of the nested unit.
This bounded, idempotent authoring migration opens a
canonical group only where its parts need different learning places. --check
verifies stable placements and atomic target/support roles on replay.
--duration-views derives explicit G8/G9 views without writing those four inputs.
"""
import argparse
import copy
import hashlib
import json
from functools import cache
from pathlib import Path
from generate_physics_partial_orders import partial_order, acquisition_placements, contextual_targets, course_seeds
from generate_physics_arrow_places import apply_arrow_places, with_arrow_places

ROOT = Path(__file__).resolve().parents[1]
DIRECTORY = ROOT / "curricula/DE/Gymnasium/composition-views/physik"
FILES = [f"de-he-{prefix}{profile}.view.json" for prefix in ("", "sekii-") for profile in ("gk", "lk")]
HORIZONTAL_THROW = "82b5df3d-b1a7-4c6f-bd62-18fbbbe097a3"
PARTIAL_ORDER_SCHEMA = "https://skillpilot.com/schemas/composition-view/v1.2/composition-view.schema.json"
E_PHASE_TOPICS = {
    "physics-e1-motion": "E.1 Bewegungen und ihre Beschreibung",
    "physics-e2-newton-and-conservation": "E.2 Newton'sche Axiome und Erhaltungssätze",
    "he-physics-topic-287739a3-6143-55d0-abe7-1a08889e9b49": "E.3 Kreisbewegung (Wurf bei E.1)",
    "he-physics-topic-04d1d2df-a94b-5db4-8d07-cbb512c2e0b9": "E.4 Weitere Bewegungen (nicht verbindlich)",
    "he-physics-topic-0ade0d10-8b32-5a95-a1a9-8ac64e2a8089": "E.5 Gravitation (nicht verbindlich)",
    "he-physics-topic-df11eb33-4900-52bf-93b3-eb82ff0f9a28": "E.6 Grundlagen der Thermodynamik (nicht verbindlich)",
    "he-physics-topic-9743baad-9371-52b6-98ee-72bc6dc68701": "E.7 Drehbewegungen (nicht verbindlich)",
}
E_PHASE_PLANNING_POLICY = [
    ("physics-e2-newton-and-conservation", "physics-e1-motion"),
    ("he-physics-topic-287739a3-6143-55d0-abe7-1a08889e9b49", "physics-e2-newton-and-conservation"),
    ("he-physics-topic-04d1d2df-a94b-5db4-8d07-cbb512c2e0b9", "he-physics-topic-287739a3-6143-55d0-abe7-1a08889e9b49"),
    ("he-physics-topic-0ade0d10-8b32-5a95-a1a9-8ac64e2a8089", "he-physics-topic-287739a3-6143-55d0-abe7-1a08889e9b49"),
    ("he-physics-topic-df11eb33-4900-52bf-93b3-eb82ff0f9a28", "physics-e2-newton-and-conservation"),
    ("he-physics-topic-9743baad-9371-52b6-98ee-72bc6dc68701", "he-physics-topic-287739a3-6143-55d0-abe7-1a08889e9b49"),
]
E_PHASE_CROSS_TOPIC_ASSESSMENTS = "physics-he-ephase-cross-topic-assessments"
HESSEN_E1_ASSESSMENTS = (
    "ee7d5f3d-858f-59d6-89b0-e5a7f437f458",
    "39f52dcb-ff1d-5cad-9ccb-30da803cfa85",
)
HESSEN_E1_VERTICAL_THROW_ASSESSMENT = "c933b7d2-edcb-5747-9378-9762659f260a"
HESSEN_E1_ACCELERATION_LOG_ASSESSMENT = "f13ca187-b680-5f47-b4ad-76bd474bd8a2"
HESSEN_E1_CHILD_ASSESSMENT_VARIANTS = {
    "c5807a37-129e-5df6-8989-482bc7f5683e": HESSEN_E1_VERTICAL_THROW_ASSESSMENT,
    "a8dc0290-9f80-5763-8943-e16b8d2aa860": HESSEN_E1_ACCELERATION_LOG_ASSESSMENT,
}
# E.1 cut accepted by the Product Owner on 23 Nov 2026: four child units in
# learning order, each starting from an experiment. They group the reviewed
# targets of E.1 for learning; they are structure children, not declared
# learning units, and their order follows the actual atomic demand.
E3_TOPIC = "he-physics-topic-287739a3-6143-55d0-abe7-1a08889e9b49"
E2_TOPIC = "physics-e2-newton-and-conservation"
HESSEN_E1_FREE_FALL_ASSESSMENT = "f41e4e30-794e-5ce4-ba5e-cc72712cd691"
HESSEN_E1_CHILD_UNITS = (
    ("physics-e1-uniform-motion", "Gleichförmige Bewegung", "Uniform motion", (
        "ce431132-dfc4-42c2-aff6-bd72035190f8", "971beafa-6ba5-4c82-ac8b-7ebf66eec3dd",
        # "Eigene Bewegungsmessung und unabhängiges Geschwindigkeitsprotokoll" stays in
        # the E-phase methods: it is not released, so it cannot be offered in E.1.
        "bf8517a9-142b-5789-826a-767f3b277998", "ee7d5f3d-858f-59d6-89b0-e5a7f437f458")),
    ("physics-e1-accelerated-and-free-fall", "Freier Fall schwerer Kugeln", "Free fall of heavy balls", (
        "b4e95dce-8537-5e38-8aa6-0d9cfaa2b19e", "e0004439-ed34-5caf-858a-6107918224eb",
        "1e459a1b-4159-5049-84eb-9928129c1610", "e4b38061-1f28-43ad-8371-a3e7c0e81856",
        "262f807a-30d0-503e-986f-856cbd048e8e", "8aff7aac-321b-5172-ac55-877876bfd2cd",
        "f6b1d812-ce8b-5852-b417-e6c29b533c7a", "09029573-864f-40ca-bf8a-cee7bf6dcb73",
        HESSEN_E1_ACCELERATION_LOG_ASSESSMENT, HESSEN_E1_FREE_FALL_ASSESSMENT)),
    ("physics-e1-air-and-vacuum", "Kugel und Feder, Luft und Vakuum", "Ball and feather, air and vacuum", (
        "d9a6ea85-f7e8-5cbd-afe9-62596e22040d", "d6dc0e02-831d-4894-a61a-852bcc74f147",
        HESSEN_E1_VERTICAL_THROW_ASSESSMENT)),
    ("physics-e1-two-motions", "Zwei Bewegungen zugleich", "Two motions at once", (
        "89a8cf15-7ba4-46c1-b1dc-fd161b20d9c2", "39f52dcb-ff1d-5cad-9ccb-30da803cfa85",
        "bcc56921-7107-5f5f-b721-3d5e0d7e1cd9")),
)
# E.2 cut accepted by the Product Owner on 24 Nov 2026: six child structures in
# learning order (three axioms, one interplay of forces, two conservation
# laws). Like the E.1 children they group reviewed targets for learning; they
# are structure children, not declared learning units.
E5_TOPIC = "he-physics-topic-0ade0d10-8b32-5a95-a1a9-8ac64e2a8089"
HESSEN_MOMENTUM = "53afbda1-5776-502b-8867-471975d7b766"
HESSEN_ENERGY_DERIVATION = "2d3f849e-20b1-5b3e-90d0-63d98c6b2b1b"
HESSEN_ENERGY_DERIVATION_ASSESSMENT = "e0085acf-af64-5c73-8abf-85a5bbfbdaa6"
HESSEN_E2_CHILD_UNITS = (
    ("physics-e2-inertia", "Trägheit: Was ohne Kraft geschieht", "Inertia: what happens without a force", (
        "31a2ef52-114b-4d2c-a720-6ef5a390b6dc", "32b896b9-f2f1-4d4e-96ad-e869ac3d3759",
        "00245a43-eb89-47d2-92d7-21799dbec9f3")),
    ("physics-e2-force-mass-acceleration", "Kraft, Masse und Beschleunigung", "Force, mass and acceleration", (
        "a94cfe1c-6f87-47ff-b4f3-31a58d4c6c20", "5f289cdc-fda1-4058-b44f-041ba1398e79")),
    ("physics-e2-force-and-counterforce", "Kraft und Gegenkraft", "Force and counterforce", (
        "ad984bb6-e225-432a-952d-d83cda40b7f8", "a0aaedcb-41f8-4891-af77-a69a76b8c10d")),
    ("physics-e2-several-forces", "Mehrere Kräfte zugleich: schiefe Ebene, Reibung, Bremsen",
     "Several forces at once: inclined plane, friction, braking", (
        "5fd45dbc-0eb1-591b-99a9-7386336f1456", "4a2bf015-052b-4af0-aed7-324259fa1a8a")),
    ("physics-e2-energy", "Energie bleibt erhalten", "Energy is conserved", (
        "c1c71daa-042b-4f4c-8c31-0ac366f5149e", HESSEN_ENERGY_DERIVATION,
        HESSEN_ENERGY_DERIVATION_ASSESSMENT, "7eeff2de-6015-49a6-a96e-a488d886dc9f",
        "6affc2ea-ecd2-4fcd-8877-3ffa15b0425b", "94784e0a-7ddc-48be-91fb-dc82b78eb322",
        "91c49019-ea51-4ce5-a919-c91c45b25e83", "253a71d2-e751-4c63-acbe-238b71463cd8")),
    ("physics-e2-momentum", "Impuls und Stöße", "Momentum and collisions", (
        HESSEN_MOMENTUM, "839ecc8f-3a60-418b-bc92-64bfeef33824", "e790de73-f8e5-4027-bc05-9f12a0e8c9cb",
        "d168ae5d-f36f-4ad4-b070-d5931f8d70d1", "0da13365-02c2-44f1-8a81-d524ca0ac3ae",
        "2eecd0e2-a7ca-4568-9b12-3d47706c65fb", "1232febe-868a-4dac-b4c2-e35789434601",
        # Stays until the mixed exams that require it have their successors (E.2 step 3).
        "d30fd37b-1f05-44e3-a40a-4c5a88fa28c2",
        # Leistungskurs deepening; the E.5 Leistungskurs exam requires it in the Einführungsphase.
        "f524f05c-4456-4fc3-a1f7-f40741fc1f16")),
)
# Gravitation is E.5 content. The Leistungskurs energy goal needs the
# potential and follows it; it stands after the three gravitation goals.
E2_TO_E5 = ("eb0ffdea-c12d-56df-b7e8-c0297d2f8aff", "a42f91a4-0d21-5aa9-ae11-f48be6f2e431",
            "594f7f21-6b8a-531c-8424-5f1dcbaf0f23", "e359f8bb-6106-44aa-9edf-694528d2d2a9")
# Vectors leave E.1: reference frames and the velocity vector of the throw are
# learned with E.3 (KC 2024 E.3 "Bezugssysteme, Superpositionsprinzip").
E1_TO_E3 = ("68c90ba6-c438-463c-9a53-cf61062d416a", "0fee53f2-1c02-5b12-9b6c-aa9fa462d921")
# The traffic goal follows the Hessian friction content; it has no KC 2024 route.
TRAFFIC = "4a2bf015-052b-4af0-aed7-324259fa1a8a"
FRICTION = "5fd45dbc-0eb1-591b-99a9-7386336f1456"
# Learning places follow the work actually assessed in the task and rubric.
# In particular, a supplied physical context does not turn a measurement or
# linearisation assessment into a thermodynamics or oscillations assessment.
E_PHASE_ASSESSMENT_PLACEMENTS = {
    "physics-e1-motion": (
        "bcc56921-7107-5f5f-b721-3d5e0d7e1cd9",
        HESSEN_E1_VERTICAL_THROW_ASSESSMENT,
        *HESSEN_E1_ASSESSMENTS,
    ),
    "physics-e2-newton-and-conservation": (
        "22561c66-3957-5d55-b07a-25de1f359930",
        "72649cf5-893c-5f03-88bd-a2497171d434",
        "be6d4895-65ab-545b-8df9-84e5a308a5e3",
    ),
    "he-physics-topic-287739a3-6143-55d0-abe7-1a08889e9b49": (
        "8320bb17-e6ab-50ea-a965-aa331bfd33e1",
    ),
    "he-physics-topic-04d1d2df-a94b-5db4-8d07-cbb512c2e0b9": (
        "dd99528a-bae5-5b78-89e6-c6092c927f8d",
        "3791c574-2194-52fa-846b-ee1d4e2c5877",
    ),
    "he-physics-topic-0ade0d10-8b32-5a95-a1a9-8ac64e2a8089": (
        "1b432223-3d59-5586-86a9-2214b4844101",
        "7e0308d8-a239-5c0f-b2c0-724f21e4da60",
        "8a1d4093-9832-5010-b1ca-9d32d8c05afa",
    ),
    "he-physics-topic-df11eb33-4900-52bf-93b3-eb82ff0f9a28": ("6ba2e47f-7e88-5d30-8f1a-3f4b4f785ca1",),
    "he-physics-topic-9743baad-9371-52b6-98ee-72bc6dc68701": ("6d25344c-35d7-5853-925d-2bccbaf50630",),
    "he-physics-topic-1e9ec823-384b-5e5f-974c-4ce224d05c19": (
        "0521c3ce-999b-5b35-bb3c-7042f24a30ce",
        "de1ed3f0-80b2-5544-9971-c8392f76a3e8",
        "16bfb017-53d6-5328-a4e3-2e2b4e4398a9",
    ),
    E_PHASE_CROSS_TOPIC_ASSESSMENTS: (
        # Optional individual measurement assessment outside the E.1 unit contract.
        "c6e2942d-1ff4-5e86-a52a-4ca4c8568291",
        "5773ccbe-cd20-5ba0-99a5-7ccd5f42be51",
        "879491c0-7153-570b-91f4-c61d9fe8a143",
        "7c0b94b9-2af7-59d4-bfae-278a3418f6a8",
    ),
}
G8_SOURCE = ROOT / "curricula/DE/Gymnasium/input/HE/lower-secondary/source-extraction/DE_HE_PHYSIK_SEKI_G8.source-extraction.json"
G8_SOURCE_SHA256 = "f7d038fb1c3aba9e4bea7b29e21431f49d138cee6297b048cc9024267337217e"
GOALS = {}
GOAL_OWNERS = {}
for source in (ROOT / "curricula/DE/Gymnasium/canonical").glob("*.json"):
    document = json.loads(source.read_text())
    GOALS.update({goal["id"]: goal for goal in document["goals"]})
    GOAL_OWNERS.update({goal["id"]: document["landscapeId"] for goal in document["goals"]})


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
    scope = view["scope"]
    if scope.get("jurisdiction") != "DE-HE" or scope.get("stage") not in ("CrossStage", "SekII"):
        raise ValueError("Hessen Physics authoring requires an HE CrossStage or SekII view")
    result = copy.deepcopy(view)
    result["$schema"] = PARTIAL_ORDER_SCHEMA
    result["viewFormatVersion"] = "1.2"
    result.setdefault("language", "de")
    motion = next((node for node in walk(result["rootNodes"]) if node.get("id") == "physics-e1-motion"), None)
    if motion is not None:
        for historical, variant in HESSEN_E1_CHILD_ASSESSMENT_VARIANTS.items():
            references = [node for node in walk(motion["children"])
                          if node.get("goalId") in (historical, variant) and node.get("projectionRole", "target") == "target"]
            if len(references) != 1 or not GOALS.get(variant, {}).get("examData"):
                raise ValueError(f"{view['viewId']}: expected one E.1 child assessment reference and a canonical variant for {historical}")
            references[0]["goalId"] = variant
    e2 = next((node for node in walk(result["rootNodes"]) if node.get("id") == E2_TOPIC), None)
    if e2 is not None and HESSEN_MOMENTUM not in role_atoms(result)["target"]:
        e2["children"].append({"kind": "goalEntry", "goalId": HESSEN_MOMENTUM})
    if e2 is not None:
        # Shared E.2 requires the graphical formula derivation. K3 is its own
        # ordinary goal assessment, not the closing check of the child unit.
        for identifier in (HESSEN_ENERGY_DERIVATION, HESSEN_ENERGY_DERIVATION_ASSESSMENT):
            if identifier not in role_atoms(result)["target"]:
                e2["children"].append({"kind": "goalEntry", "goalId": identifier})
    before = role_atoms(result)
    if motion is not None and set(HESSEN_E1_CHILD_ASSESSMENT_VARIANTS) & (before["target"] | before["prerequisiteOnly"]):
        raise ValueError(f"{view['viewId']}: a historical child assessment is still projected in Hessen E.1")
    before["target"].update(HESSEN_E1_ASSESSMENTS)
    if motion is not None:
        before["target"].add(HESSEN_E1_FREE_FALL_ASSESSMENT)
    # Opening Gravitation must retain its three reviewed GK scope exclusions,
    # including their authored reference kinds, once each. In particular, a
    # same-distance target reference must not expose the LK worldview container.
    if view["scope"]["courseProfile"] == "GK":
        exclusions = {
            "16caf92e-2800-57d1-946c-5b92ce848a96": "goalEntry",
            "89cadf81-143b-5f6b-82bd-29ba20d92a1b": "goalEntry",
            "423e21b9-0d0c-5709-899d-7ab738b55e36": "canonicalSubtree",
        }
        retained_exclusions = set()
        def retain_gravitation_exclusions(nodes):
            kept = []
            for node in nodes:
                identifier = node.get("goalId")
                if identifier in exclusions:
                    if identifier in retained_exclusions:
                        continue
                    node["kind"] = exclusions[identifier]
                    node["projectionRole"] = "prerequisiteOnly"
                    retained_exclusions.add(identifier)
                if node["kind"] == "structure":
                    node["children"] = retain_gravitation_exclusions(node["children"])
                kept.append(node)
            return kept
        result["rootNodes"] = retain_gravitation_exclusions(result["rootNodes"])
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

    if view["scope"]["stage"] == "SekII":
        stage_id = "physics-sekii-" + view["scope"]["courseProfile"].lower()
        existing = find(stage_id)
        if existing:
            upper = existing[2]
        else:
            upper = structure(stage_id, root["label"], root["children"])
            if "labelEn" in root:
                upper["labelEn"] = root["labelEn"]
            root["children"] = [upper]
        root["label"], root["labelEn"] = "Physik", "Physics"
        # A sole subject wrapper is anchored onto the existing canonical root.
        # Keep its global support records outside the stage but inside that
        # authoring wrapper, so the product exposes Physik -> SekII directly.
        extra_roots = [node for node in result["rootNodes"] if node is not root]
        if any(node.get("projectionRole") != "prerequisiteOnly"
               for node in walk(extra_roots) if node["kind"] != "structure"):
            raise ValueError("Upper-only Physics has an unexpected target outside its subject root")
        root["children"].extend(extra_roots)
        result["rootNodes"] = [root]
    else:
        upper = next(node for node in root["children"] if node.get("id", "").startswith("physics-sekii-"))
    phases = [find(identifier)[2] for identifier in ("physics-e-phase", "physics-q1", "physics-q2", "physics-q3", "physics-q4")]
    phases[0]["label"] = "Einführungsphase: Mechanik"
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
    if view["scope"]["stage"] == "SekII":
        # In an upper-only map, necessary SekI atoms are acquired beside their
        # first actual consumer. Keeping late risk evaluation inside the same
        # reaction bundle coarsens that genuine DAG into a visible cycle:
        # reaction foundations -> applications -> risk evaluation -> bundle.
        # The risk goal remains in the same reviewed Q4 nuclear-physics field.
        risk = take("bb5c5eab-2fc1-5336-b8cf-14d147695487")
        field("Kernphysik")["children"].append(risk)
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
    # KC 2024, printed pp.25, 27, 30--31: E.1--E.3 are binding topics;
    # E.4--E.7 are not binding. A different learning order is permitted where
    # subject requirements allow it. Kinematic superposition needs no Newtonian
    # dynamics, so its existing reviewed subtree is acquired alongside E.1.
    # Its canonical E.3 source identity remains intact; the display label makes
    # the earlier learning place explicit. E.3 names its remaining content.
    for identifier, label in E_PHASE_TOPICS.items():
        matches = [node for node in walk(phases[0]["children"])
                   if node.get("id") == identifier and node["kind"] == "structure"]
        if len(matches) != 1:
            raise ValueError(f"{view['viewId']}: expected one E-phase authoring topic {identifier}")
        matches[0]["label"] = label
    motion = find("physics-e1-motion")[2]
    # Before the E.1 cut the reviewed horizontal-throw subtree was acquired
    # whole inside E.1. Open it once: the throw stays in E.1 (child unit 4),
    # reference frames and the velocity vector go to E.3.
    throws = [node for node in walk(phases[0]["children"]) if node.get("goalId") == HORIZONTAL_THROW]
    if len(throws) > 1 or (throws and throws[0]["kind"] != "canonicalSubtree"):
        raise ValueError(f"{view['viewId']}: expected at most one reviewed horizontal-throw subtree in E phase")
    if throws:
        take(HORIZONTAL_THROW)
        motion["children"].extend({"kind": "canonicalSubtree", "goalId": identifier}
                                  for identifier in GOALS[HORIZONTAL_THROW]["contains"])
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
    cross_topic = topic(E_PHASE_CROSS_TOPIC_ASSESSMENTS, "Themenübergreifende Prüfungen")
    cross_topic["labelEn"] = "Cross-topic assessments"
    phases[0]["children"].append(cross_topic)
    for destination, assessment_ids in E_PHASE_ASSESSMENT_PLACEMENTS.items():
        target = find(destination)[2]
        for identifier in assessment_ids:
            references = [node for node in walk(phases[0]["children"])
                          if node.get("goalId") == identifier and node.get("projectionRole") != "prerequisiteOnly"]
            if (identifier in HESSEN_E1_ASSESSMENTS and not references and find(identifier) is None
                    and GOALS.get(identifier, {}).get("examData")):
                target["children"].append({"kind": "canonicalSubtree", "goalId": identifier})
                continue
            if len(references) != 1 or not GOALS[identifier].get("examData"):
                raise ValueError(f"{view['viewId']}: expected one reviewed E-phase assessment {identifier}")
            target["children"].append(take(identifier))
    author_e1_child_units(view["viewId"], phases[0], motion, find)
    author_e2_child_units(view["viewId"], find, extract, atoms, selected)
    pull_earlier(phases, atoms, lambda identifier: extract(identifier, upper["children"]), shifts)
    for phase in phases:
        pull_earlier([node for node in phase["children"] if node["kind"] == "structure" and atoms(node)], atoms,
                     lambda identifier: extract(identifier, phase["children"]), shifts, nested=False)
    result["rootNodes"] = clean(result["rootNodes"])
    sort_tree(result["rootNodes"], atoms)
    _, applicable_learning, contextual_shifts = contextual_targets(result, GOALS,
        selected, prerequisites, extract, structure, within_consumer_unit=True)
    shifts.extend(contextual_shifts)
    acquisition_placements(result, GOALS, selected, prerequisites, structure,
                           consumer_seeds=selected & applicable_learning)
    # Guided-entry bindings are authored in the shared material catalog. Keep
    # each orientation at its own learning place, including before a generated
    # preparation group; an orientation is not a subject-matter prerequisite.
    material_catalog = json.loads((ROOT / "curricula/unit-learning-materials.json").read_text())
    for material_path in material_catalog["materials"]:
        material = json.loads((ROOT / "curricula" / material_path).read_text())
        binding = material["unit"]
        orientation_id = binding.get("orientationGoalId")
        if view["viewId"] not in binding["viewIds"] or not orientation_id:
            continue
        unit = find(binding["compositionNodeId"])
        if unit is None:
            raise ValueError(f"{view['viewId']}: missing guided-entry unit {binding['compositionNodeId']}")
        children = unit[2]["children"]
        references = [node for node in children if node.get("goalId") == orientation_id]
        if len(references) != 1 or GOALS[orientation_id].get("semanticKind") != "orientation":
            raise ValueError(f"{view['viewId']}: expected one atomic orientation in its own unit")
        children.remove(references[0])
        children.insert(0, references[0])
    author_partial_orders(result, lambda node: learning_atoms(node, selected & applicable_learning, applicable_learning))
    after = role_atoms(result)
    # Opening a subtree changes reference distance. Retain the reviewed atomic
    # exclusion explicitly whenever that change would otherwise win a role tie.
    for identifier in sorted(before["prerequisiteOnly"] & after["target"]):
        result["rootNodes"].append({"kind": "goalEntry", "goalId": identifier, "projectionRole": "prerequisiteOnly"})
    after = role_atoms(result)
    if before["target"] != after["target"] or not before["prerequisiteOnly"] <= after["prerequisiteOnly"] or not (after["prerequisiteOnly"] - before["prerequisiteOnly"]) <= {p for atom in selected for p in prerequisites(atom)}:
        raise ValueError(f"{view['viewId']}: atomic projection roles changed: " + str({role: (before[role] - after[role], after[role] - before[role]) for role in before}))
    return result, shifts


def author_e1_child_units(view_id, phase, motion, find):
    """Group E.1 into its four child units and move the goals that leave E.1.

    Only existing target references of the E phase move; roles stay exact.
    The free-fall assessment with two own measurement series is brought into
    child unit 2 (its applicability names Hesse since the E.1 cut).
    """
    def take_target(identifier):
        containers = [phase] + [node for node in walk(phase["children"]) if node["kind"] == "structure"]
        for container in containers:
            for index, child in enumerate(container["children"]):
                if (child.get("goalId") == identifier and child["kind"] != "structure"
                        and child.get("projectionRole") != "prerequisiteOnly"):
                    return container["children"].pop(index)
        return None

    e3 = find(E3_TOPIC)[2]
    for identifier in E1_TO_E3:
        node = take_target(identifier)
        if node is None:
            raise ValueError(f"{view_id}: expected a target reference of {identifier} in the E phase")
        e3["children"].append(node)
    traffic = take_target(TRAFFIC)
    if traffic is None:
        raise ValueError(f"{view_id}: expected the traffic goal as an E-phase target")
    # The traffic goal follows friction; the E.2 child structures place both
    # in "Mehrere Kräfte zugleich" (author_e2_child_units).
    find(E2_TOPIC)[2]["children"].append(traffic)

    collected = []
    for unit_id, label, label_en, members in HESSEN_E1_CHILD_UNITS:
        nodes = []
        for identifier in members:
            node = take_target(identifier)
            if node is None and identifier == HESSEN_E1_FREE_FALL_ASSESSMENT and GOALS[identifier].get("examData"):
                node = {"kind": "canonicalSubtree", "goalId": identifier}
            if node is None:
                raise ValueError(f"{view_id}: missing E.1 child-unit target {identifier}")
            nodes.append(node)
        collected.append(structure(unit_id, label, nodes) | {"labelEn": label_en})
    unit_ids = {unit_id for unit_id, *_ in HESSEN_E1_CHILD_UNITS}
    for node in motion["children"]:
        remaining = [child for child in walk(node.get("children", []))
                     if child["kind"] != "structure" and child.get("projectionRole") != "prerequisiteOnly"]
        if node.get("id") in unit_ids and remaining:
            raise ValueError(f"{view_id}: {node['id']} keeps targets outside the declared child-unit members: "
                             + str([child["goalId"] for child in remaining]))
    leftovers = [node for node in motion["children"] if node.get("id") not in unit_ids]
    # Generated preparation groups hold support references only; they stay.
    support = [node for node in leftovers if node["kind"] == "structure"
               and all(child["kind"] != "structure" and child.get("projectionRole") == "prerequisiteOnly"
                       for child in walk(node["children"]))]
    stray = [node for node in leftovers if node["kind"] == "structure" and node["children"] and node not in support]
    orientation = [node for node in leftovers if node["kind"] != "structure"]
    if stray or [node.get("goalId") for node in orientation] != ["a4d4efe1-7d30-526b-ac9c-806113da4363"]:
        raise ValueError(f"{view_id}: unexpected E.1 content outside its child units: "
                         + str([node.get("id", node.get("goalId")) for node in leftovers]))
    motion["children"] = orientation + [node for node in support if node["children"]] + collected


def author_e2_child_units(view_id, find, extract, atoms, selected):
    """Group E.2 into its six child structures and move the gravitation goals to E.5.

    Only existing atomic targets move; a goal that is no target of the view
    (a Leistungskurs goal in a Grundkurs view) keeps its reviewed support role.
    The canonical group "Erhaltungssätze" is opened where its parts need
    different learning places. The mixed E.2 exams stay at E.2 level.
    """
    e2, e5 = find(E2_TOPIC)[2], find(E5_TOPIC)[2]
    # Re-append on every run, so that the following sort starts from the same order.
    moved = []
    for identifier in E2_TO_E5:
        node = extract(identifier, e2["children"]) or extract(identifier, e5["children"])
        if node is not None:
            moved.append(node)
        elif identifier in selected:
            raise ValueError(f"{view_id}: expected the target {identifier} in E.2 or E.5")
    e5["children"].extend(moved)
    collected = []
    for unit_id, label, label_en, members in HESSEN_E2_CHILD_UNITS:
        nodes = []
        for identifier in members:
            node = extract(identifier, e2["children"])
            if node is None and identifier in selected:
                raise ValueError(f"{view_id}: missing E.2 child-structure target {identifier}")
            if node is not None:
                nodes.append(node)
        collected.append(structure(unit_id, label, nodes) | {"labelEn": label_en})
    unit_ids = {unit_id for unit_id, *_ in HESSEN_E2_CHILD_UNITS}
    leftovers, exclusions = [], []
    for node in e2["children"]:
        if node.get("id") in unit_ids:
            continue
        if node["kind"] == "structure" and node["id"].startswith("he-physics-open-") and not atoms(node):
            # All targets of this opened canonical group have their child structure. What is left
            # are reviewed scope exclusions (a Leistungskurs goal in a Grundkurs view): keep each
            # as one explicit support reference at E.2 level, not as a group of its own.
            exclusions.extend(child["goalId"] for child in walk(node["children"]) if child["kind"] != "structure")
            continue
        leftovers.append(node)
    explicit = {node["goalId"] for node in leftovers
                if node["kind"] != "structure" and node.get("projectionRole") == "prerequisiteOnly"}
    for identifier in exclusions:
        if identifier not in explicit:
            leftovers.append({"kind": "goalEntry", "goalId": identifier, "projectionRole": "prerequisiteOnly"})
            explicit.add(identifier)
    stray = sorted(identifier for node in leftovers for identifier in atoms(node)
                   if not GOALS[identifier].get("examData"))
    if stray:
        raise ValueError(f"{view_id}: E.2 content outside its child structures: {stray}")
    e2["children"] = ([node for node in leftovers if not atoms(node)] + collected
                      + [node for node in leftovers if atoms(node)])


@cache
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


def ephase_child_order(phase, atoms):
    """Minimal explicit planning DAG: real demands plus reviewed E.1--E.3 order.

    Array order remains display order. In particular no E.4--E.7 total order
    follows from their numbering or their nonbinding official source status.
    """
    groups = [node for node in phase["children"] if node["kind"] == "structure"]
    identifiers = [node["id"] for node in groups]
    ownership = {}
    for node in groups:
        for identifier in atoms(node):
            if identifier in ownership:
                raise ValueError("Repeated E-phase atomic learning place: " + identifier)
            ownership[identifier] = node["id"]
    needs = {identifier: set() for identifier in identifiers}
    witnesses = {}
    for dependent, unit in sorted(ownership.items()):
        for required in sorted(prerequisites(dependent)):
            previous = ownership.get(required)
            if previous is None or previous == unit:
                continue
            needs[unit].add(previous)
            witnesses.setdefault((unit, previous), {"kind": "canonicalRequirement", "dependentGoalId": dependent,
                                                     "requiredGoalId": required})
    fixed = [("physics-e2-newton-and-conservation", "physics-e1-motion"),
             ("he-physics-topic-287739a3-6143-55d0-abe7-1a08889e9b49", "physics-e2-newton-and-conservation")]
    for unit, previous in fixed:
        if unit not in needs or previous not in needs:
            raise ValueError("Missing reviewed E.1--E.3 planning anchor")
        needs[unit].add(previous)
        witnesses.setdefault((unit, previous), {"kind": "reviewedLearningOrder", "basis": "E.1 before E.2 before E.3"})

    closure = {}
    def ancestors(identifier, active=None):
        if identifier in closure:
            return closure[identifier]
        active = set() if active is None else active
        if identifier in active:
            raise ValueError("Cyclic E-phase planning order")
        active.add(identifier)
        result = set(needs[identifier])
        for previous in needs[identifier]:
            result.update(ancestors(previous, active))
        active.remove(identifier)
        closure[identifier] = result
        return result
    for identifier in identifiers:
        ancestors(identifier)
    pairs = [{"unit": unit, "after": previous} for unit in identifiers for previous in identifiers
             if previous in closure[unit]
             and not any(intermediate != previous and previous in closure[intermediate]
                         for intermediate in closure[unit])]
    return {"after": pairs}, [{**pair, "witness": witnesses[(pair["unit"], pair["after"])]} for pair in pairs]


def learning_atoms(node, selected, learning=None):
    if node.get("acquisitionPlacement") is True:
        return {node["goalId"]} if learning is None else {node["goalId"]} & learning
    if node["kind"] == "structure":
        return set().union(*(learning_atoms(c, selected, learning) for c in node["children"])) if node["children"] else set()
    return role_atoms({"rootNodes": [node]})["target"] & selected


def author_partial_orders(view, atoms):
    """No thematic sibling acquires a planning edge from display order.

    Only the source's stages, school years and E/Q phases have a calendar order.
    Other structures declare no whole-unit order unless a separately reviewed
    policy says so. Atomic demand remains independently visible on the map.
    """
    def visit(node):
        if node["kind"] != "structure":
            return
        for child in node["children"]:
            visit(child)
        groups = [child for child in node["children"] if child["kind"] == "structure"]
        if len(groups) < 2:
            node.pop("childOrder", None)
            return
        if node["id"] == "physics-e-phase" and view["scope"].get("jurisdiction") == "DE-HE":
            # Explicit owner-reviewed whole-topic plan: mandatory kinematics,
            # then dynamics, then the mandatory combined-motion topic; optional
            # branches follow their chosen introductory topic. Atomic requires
            # alone never create a whole-topic completion policy.
            node["childOrder"], _ = partial_order(groups, atoms, lambda atom: set(GOALS[atom].get("requires", [])), E_PHASE_PLANNING_POLICY)
            return
        temporal = []
        if node["id"] == "physics-root":
            temporal = [child["id"] for child in groups if child["id"] == "physics-seki" or child["id"].startswith("physics-sekii-")]
        elif node["id"] == "physics-seki":
            temporal = [child["id"] for child in groups if child["id"].startswith("physics-he-seki-j")]
        elif node["id"].startswith("physics-sekii-"):
            temporal = [child["id"] for child in groups if child["id"] in
                        ("physics-e-phase", "physics-q1", "physics-q2", "physics-q3", "physics-q4", "physics-he-abitur")]
        node["childOrder"], _ = partial_order(groups, atoms, lambda atom: set(GOALS[atom].get("requires", [])), list(zip(temporal[1:], temporal[:-1])))
    for root in view["rootNodes"]:
        visit(root)


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


def check_g8_working_copy(path, expected_digest):
    """Official PDFs are optional ignored caches; a supplied copy must be exact.

    The committed extraction pins the official URL and digest for reproduction.
    Deterministic authoring/CI never downloads a source or requires its cache.
    """
    if not path.exists():
        return False
    if hashlib.sha256(path.read_bytes()).hexdigest() != expected_digest:
        raise ValueError("G8 Physics source digest mismatch")
    return True


def generate_g8(view):
    """Use the official G8 topic/year placement, retaining the reviewed scope.

    This is deliberately independent of the G9 regrouping. The input is a
    reviewed CrossStage view; only its SekI children and duration identity change.
    Source years stay in the extraction even when a real prerequisite needs an
    earlier acquisition place. No source/goal/prerequisite record is rewritten.
    """
    if hashlib.sha256(G8_SOURCE.read_bytes()).hexdigest() != G8_SOURCE_SHA256:
        raise ValueError("G8 Physics placement extraction digest mismatch")
    source = json.loads(G8_SOURCE.read_text())
    pdf = ROOT / source["sourceDocument"]["path"]
    check_g8_working_copy(pdf, source["sourceDocument"]["sha256"])
    if view["scope"].get("stage") != "CrossStage" or view["scope"].get("jurisdiction") != "DE-HE":
        raise ValueError("G8 Physics authoring requires a reviewed HE CrossStage view")
    result = copy.deepcopy(view)
    result["viewId"] = "de-he-gym-physics-" + view["scope"]["courseProfile"].lower() + "-g8"
    result["scope"]["durationModel"] = "G8"
    before = role_atoms(view)
    stage = next(node for node in walk(result["rootNodes"]) if node.get("id") == "physics-seki")
    original_stage = copy.deepcopy(stage)
    shifts = []

    def atoms(node):
        if node.get("projectionRole") == "prerequisiteOnly":
            return set()
        if node["kind"] == "structure":
            return set().union(*(atoms(child) for child in node["children"])) if node["children"] else set()
        def descend(identifier):
            children = GOALS[identifier].get("contains", [])
            return set().union(*(descend(child) for child in children)) if children else {identifier} & before["target"]
        return descend(node["goalId"])

    def take(identifier, nodes=None):
        siblings = stage["children"] if nodes is None else nodes
        for index, node in enumerate(siblings):
            if node.get("id", node.get("goalId")) == identifier:
                return siblings.pop(index)
            if node["kind"] == "structure":
                found = take(identifier, node["children"])
                if found:
                    return found
        return None

    def extract(identifier, nodes=None):
        siblings = stage["children"] if nodes is None else nodes
        for index, node in enumerate(siblings):
            if identifier not in atoms(node):
                continue
            if node.get("goalId") == identifier and not GOALS[identifier].get("contains"):
                return siblings.pop(index)
            if node["kind"] != "structure":
                original = node["goalId"]
                children = [{"kind": "canonicalSubtree", "goalId": child,
                             **({"projectionRole": node["projectionRole"]} if "projectionRole" in node else {})}
                            for child in GOALS[original].get("contains", [])]
                node = structure("physics-he-g8-open-" + original, GOALS[original]["title"], children)
                siblings[index] = node
            found = extract(identifier, node["children"])
            if found:
                return found
        return None

    # Exercises do not determine the source year of their prerequisites. Place
    # them after their latest required selected learning goal after the repair.
    tasks = [extract(identifier) for identifier in sorted(atoms(stage))
             if GOALS[identifier]["title"].startswith("Prüfungsaufgabe:")]
    years = [structure(f"physics-he-seki-j{year}-g8", f"Jahrgangsstufe {year}G", []) for year in range(6, 10)]
    source_placement = {}
    for topic in source["placementTopics"]:
        children = []
        for identifier in topic["placementReferences"]:
            node = take(identifier)
            if node is None:
                raise ValueError(f"{view['viewId']}: missing G8 authoring reference {identifier}")
            children.append(node)
            for atom in atoms(node):
                if atom in source_placement:
                    raise ValueError("Duplicate G8 source placement for " + atom)
                source_placement[atom] = {"topicCode": topic["topicCode"], "year": topic["year"],
                                          "printedPage": topic["printedPage"]}
        label = topic["topicCode"] + " " + topic["title"] + (" (fakultativ)" if topic["status"] == "optional" else "")
        years[topic["year"] - 6]["children"].append(structure(
            "physics-he-g8-topic-" + topic["topicCode"].lower().replace(".", "-"), label, children))
    if atoms(stage):
        raise ValueError("Unassigned reviewed G8 targets: " + str(sorted(atoms(stage))))
    # Preserve all authored support references; only emptied structure shells go.
    support = [copy.deepcopy(node) for node in walk(stage["children"])
               if node["kind"] != "structure"]
    stage["children"] = years + support
    pull_earlier(years, atoms, extract, shifts)
    for shift in shifts:
        shift["sourcePlacement"] = source_placement[shift["goalId"]]
    ownership = {identifier: index for index, year in enumerate(years) for identifier in atoms(year)}
    for task in tasks:
        index = max((ownership[identifier] for identifier in prerequisites(task["goalId"])
                     if identifier in ownership), default=0)
        practice_id = f"physics-he-g8-practice-{index + 6}"
        practice = next((node for node in years[index]["children"] if node.get("id") == practice_id), None)
        if practice is None:
            practice = structure(practice_id, "Übungen " + years[index]["label"], [])
            years[index]["children"].append(practice)
        practice["children"].append(task)
    for year in years:
        sort_tree(year["children"], atoms)
    applicable_seeds = course_seeds(before["target"], GOALS, result["scope"])
    applicable_learning = applicable_seeds | {p for a in applicable_seeds for p in prerequisites(a)}
    acquisition_placements(result, GOALS, before["target"], prerequisites, structure,
                           consumer_seeds=before["target"] & applicable_learning)
    author_partial_orders(result, lambda node: learning_atoms(node, before["target"] & applicable_learning, applicable_learning))
    if role_atoms(result) != before:
        raise ValueError("G8 authoring changed reviewed atomic target/support roles")
    if role_atoms({"rootNodes": [original_stage]}) != role_atoms({"rootNodes": [stage]}):
        raise ValueError("G8 authoring changed reviewed SekI atomic roles")
    return result, {"earlierDemandPlacements": shifts, "sourcePlacements": source_placement,
                    "exercisePlacements": {task["goalId"]: years[max((ownership[identifier]
                        for identifier in prerequisites(task["goalId"]) if identifier in ownership), default=0)]["id"]
                        for task in tasks}}


def seki_excerpt(view, duration):
    """Keep the resolved stage, not global support freed by removing SekII.

    The complete course view shadows or course-filters several global Physics
    support references. A course-neutral SekI excerpt must not expose those
    upper-secondary atoms after deleting that branch. Stage-local references
    stay exact; outer own-subject support must serve the canonical SekI basis.
    Foreign support references stay byte-identical and never become targets.
    """
    excerpt = copy.deepcopy(view)
    excerpt["viewId"] = f"de-he-gym-seki-physics-{duration}"
    excerpt["scope"]["stage"] = "SekI"
    del excerpt["scope"]["courseProfile"]
    stage = next(node for node in walk(excerpt["rootNodes"]) if node.get("id") == "physics-seki")
    stage_roles = role_atoms({"rootNodes": [stage]})
    required = stage_roles["target"] | {required for seed in stage_roles["target"] for required in prerequisites(seed)}
    allowed_own_support = required | stage_roles["prerequisiteOnly"]
    removed = set()

    def canonical_atoms(identifier):
        children = GOALS[identifier].get("contains", [])
        return set().union(*(canonical_atoms(child) for child in children)) if children else {identifier}

    def trim(nodes):
        result = []
        for node in nodes:
            if node.get("id", "").startswith("physics-sekii-"):
                continue
            if node is stage:
                result.append(node)
            elif node["kind"] == "structure":
                node["children"] = trim(node["children"])
                result.append(node)
            elif node.get("projectionRole") == "prerequisiteOnly" and GOAL_OWNERS[node["goalId"]] == view["landscapeId"]:
                atoms = canonical_atoms(node["goalId"])
                retained = atoms & allowed_own_support
                removed.update(atoms - retained)
                if retained == atoms:
                    result.append(node)
                else:
                    result.extend({"kind": "goalEntry", "goalId": identifier, "projectionRole": "prerequisiteOnly"}
                                  for identifier in sorted(retained))
            else:
                result.append(node)
        return result

    excerpt["rootNodes"] = trim(excerpt["rootNodes"])
    # Removing the upper stage also removes its calendar-order endpoint. The
    # excerpt declares only the surviving stage/year/topic partial orders.
    acquisition_placements(excerpt, GOALS, stage_roles["target"], prerequisites, structure)
    author_partial_orders(excerpt, lambda node: learning_atoms(node, stage_roles["target"]))
    # The retained stage-only source excerpt is headerless and carries no
    # partial-order declaration. Do not upgrade its unused contract metadata.
    if excerpt.get("$schema") == PARTIAL_ORDER_SCHEMA and not any("childOrder" in node for node in walk(excerpt["rootNodes"])):
        for field in ("$schema", "viewFormatVersion", "language"):
            excerpt.pop(field, None)
    if role_atoms(excerpt)["target"] != stage_roles["target"]:
        raise ValueError("SekI excerpt changed selected target atoms")
    if removed & required:
        raise ValueError("SekI excerpt removed necessary acquisition support")
    return excerpt, {"stageResolvedSupportPruning": [{"goalId": identifier, "title": GOALS[identifier]["title"],
        "reason": "Global upper-secondary/course support is outside both the SekI canonical learning basis and explicit local SekI support"}
        for identifier in sorted(removed)]}


def duration_outputs():
    outputs = []
    for profile in ("gk", "lk"):
        current = json.loads((DIRECTORY / f"de-he-{profile}.view.json").read_text())
        g8, report = generate_g8(current)
        repeated, _ = generate_g8(g8)
        if repeated != g8:
            raise ValueError("G8 Physics authoring is not idempotent")
        g9 = copy.deepcopy(current)
        g9["viewId"] += "-g9"
        g9["scope"]["durationModel"] = "G9"
        for duration, generated in (("g8", g8), ("g9", g9)):
            generated = apply_arrow_places(generated, GOALS)
            outputs.append((DIRECTORY / f"de-he-{profile}-{duration}.view.json", generated,
                            report if duration == "g8" else {}))
            if profile == "gk":
                excerpt, excerpt_report = seki_excerpt(generated, duration)
                outputs.append((DIRECTORY / f"de-he-seki-{duration}.view.json", excerpt, excerpt_report))
    return outputs


# A2 remains own preparation in every Hessen view, with its own reviewed place.
generate = with_arrow_places(generate, GOALS)
generate_g8 = with_arrow_places(generate_g8, GOALS)
seki_excerpt = with_arrow_places(seki_excerpt, GOALS)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    mode = parser.add_mutually_exclusive_group(required=True)
    mode.add_argument("--write", action="store_true")
    mode.add_argument("--check", action="store_true")
    parser.add_argument("--report", type=Path)
    parser.add_argument("--duration-views", action="store_true", help="derive only explicit G8/G9 views; retained inputs stay byte-identical")
    args = parser.parse_args()
    outputs = []
    report = []
    for name in ([] if args.duration_views else FILES):
        path = DIRECTORY / name
        current = json.loads(path.read_text())
        generated, shifts = generate(current)
        repeated, _ = generate(generated)
        if generated != repeated:
            raise ValueError(name + ": generator is not idempotent")
        outputs.append((path, generated))
        phase = next(node for node in walk(generated["rootNodes"]) if node.get("id") == "physics-e-phase")
        raw_seeds = role_atoms(generated)["target"]
        applicable_seeds = course_seeds(raw_seeds, GOALS, generated["scope"])
        applicable_learning = applicable_seeds | {p for seed in applicable_seeds for p in prerequisites(seed)}
        current_atoms = lambda node: learning_atoms(node, raw_seeds & applicable_learning, applicable_learning)
        report.append({"file": name, "changed": current != generated, "earlierDemandPlacements": shifts,
                       "ephaseRequirementOrderCandidates": ephase_child_order(phase, current_atoms)[1],
                       "declaredPartialOrders": [{"parentId": node["id"], "declaredOrderPairs": node["childOrder"]["after"], "requirementOrderCandidates": partial_order(
                           node["children"], current_atoms, prerequisites,
                           [(pair["unit"], pair["after"]) for pair in node["childOrder"]["after"]])[1]}
                           for node in walk(generated["rootNodes"]) if "childOrder" in node]})
    if args.duration_views:
        for path, generated, details in duration_outputs():
            outputs.append((path, generated))
            report.append({"file": path.name, "changed": not path.exists() or json.loads(path.read_text()) != generated, **details})
    # All four outputs pass preflight before any write.
    for path, generated in outputs:
        if args.write:
            payload = (json.dumps(generated, ensure_ascii=False, indent=2) + "\n").encode("utf-8")
            if not path.exists() or path.read_bytes() != payload:
                path.write_bytes(payload)
        elif not path.exists() or json.loads(path.read_text()) != generated:
            raise ValueError(path.name + ": stale Hessen Physics stage placement")
    if args.report:
        args.report.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n")
    print(f"Hessen Physics stage views: {len(outputs)} checked; atomic target/support roles verified.")


if __name__ == "__main__":
    main()
