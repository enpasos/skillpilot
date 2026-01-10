import json
import uuid
from pathlib import Path

NS = uuid.uuid5(uuid.NAMESPACE_DNS, "skillpilot.io")


def root_id(code: str) -> str:
    return str(uuid.uuid5(NS, f"tum-module/{code}"))


def goal_id(namespace: str, short_key: str) -> str:
    return str(uuid.uuid5(NS, f"{namespace}/{short_key}"))


def build_module(code: str, title_de: str, title_en: str, ects: int, description_de: str, description_en: str, root_desc_de: str, root_desc_en: str, categories: list, requires_map: dict) -> dict:
    namespace = f"tum-{code.lower()}"

    goals = []

    # Root
    root_contains = [goal_id(namespace, cat["shortKey"]) for cat in categories]
    goals.append({
        "id": root_id(code),
        "shortKey": f"tum_{code.lower()}_module",
        "title": f"{title_de} (Modul {code})",
        "titleEn": f"{title_en} (Module {code})",
        "description": root_desc_de,
        "descriptionEn": root_desc_en,
        "core": True,
        "weight": float(ects),
        "phase": "Modul",
        "area": "Gesamtkompetenz",
        "tags": [f"module:{code}", f"ects:{ects}"],
        "contains": root_contains,
        "requires": [],
        "sourceRef": f"https://academics.nat.tum.de/org/mh/details/mod/{code}",
    })

    # Categories and leaves
    for cat in categories:
        cat_id = goal_id(namespace, cat["shortKey"])
        child_ids = [goal_id(namespace, child["shortKey"]) for child in cat["children"]]
        goals.append({
            "id": cat_id,
            "shortKey": cat["shortKey"],
            "title": cat["title"],
            "titleEn": cat["titleEn"],
            "description": cat["description"],
            "descriptionEn": cat["descriptionEn"],
            "core": True,
            "weight": 2.0,
            "phase": "Modul",
            "area": "Kompetenz",
            "tags": [f"module:{code}"],
            "contains": child_ids,
            "requires": [],
        })
        for child in cat["children"]:
            goals.append({
                "id": goal_id(namespace, child["shortKey"]),
                "shortKey": child["shortKey"],
                "title": child["title"],
                "titleEn": child["titleEn"],
                "description": child["description"],
                "descriptionEn": child["descriptionEn"],
                "core": True,
                "weight": 1.0,
                "phase": "Modul",
                "area": "Kompetenz",
                "tags": [f"module:{code}"],
                "contains": [],
                "requires": [],
            })

    # Apply requires
    short_to_goal = {g["shortKey"]: g for g in goals}
    for short_key, req_short_keys in requires_map.items():
        if short_key not in short_to_goal:
            raise SystemExit(f"Missing shortKey for requires: {short_key}")
        req_ids = []
        for req_short in req_short_keys:
            if req_short not in short_to_goal:
                raise SystemExit(f"Missing required shortKey: {req_short}")
            req_ids.append(short_to_goal[req_short]["id"])
        short_to_goal[short_key]["requires"] = req_ids

    return {
        "title": f"{title_de} (TUM, Modul {code})",
        "titleEn": f"{title_en} (TUM, Module {code})",
        "description": description_de,
        "descriptionEn": description_en,
        "locale": "de-DE",
        "subject": "TUM-Module",
        "frameworkId": f"tum-{code.lower()}",
        "goals": goals,
    }


nat3034_description_en = (
    "Quantum Hardware introduces different physical implementations of quantum systems. "
    "It covers light-matter interaction, cavity and circuit QED, superconducting and semiconductor qubits, "
    "control and readout techniques, and approaches to building larger quantum processors. "
    "It also introduces quantum sensing, including noise sources, sensitivity limits, optomechanics, and defect-based sensors."
)

nat3034_description_de = (
    "Quantenhardware fuehrt in verschiedene physikalische Implementierungen von Quantensystemen ein. "
    "Behandelt werden Licht-Materie-Wechselwirkung, Hohlraum- und Schaltkreis-QED, supraleitende und halbleitende Qubits, "
    "Methoden zur Kontrolle und Auslese sowie Wege zum Aufbau groesserer Quantenprozessoren. "
    "Zudem werden Grundlagen der Quantensensorik wie Rauschquellen, Empfindlichkeitsgrenzen, Optomechanik und Defektsensoren erlaeutert."
)

nat3034_root_de = (
    "Die lernende Person kann zentrale Konzepte der Quantenhardware erklaeren und grundlegende Eigenschaften wichtiger Hardware-Plattformen analysieren."
)

nat3034_root_en = (
    "The learner can explain core concepts of quantum hardware and analyze key properties of major hardware platforms."
)

nat3034_categories = [
    {
        "shortKey": "tum_nat3034_foundations",
        "title": "Grundlagen und Motivation",
        "titleEn": "Foundations and motivation",
        "description": "Die lernende Person kann grundlegende Begriffe der Quantenhardware einordnen und Motivation sowie Anwendungen benennen.",
        "descriptionEn": "The learner can situate key concepts of quantum hardware and name motivations and applications.",
        "children": [
            {
                "shortKey": "tum_nat3034_quantum_1_2",
                "title": "Quantum 1.0 und Quantum 2.0",
                "titleEn": "Quantum 1.0 vs Quantum 2.0",
                "description": "Die lernende Person kann historische und moderne Quantentechnologien unterscheiden und deren Ziele einordnen.",
                "descriptionEn": "The learner can distinguish historical and modern quantum technologies and relate them to hardware goals.",
            },
            {
                "shortKey": "tum_nat3034_two_level_oscillator",
                "title": "Zwei-Niveau-System und harmonischer Oszillator",
                "titleEn": "Two-level system and harmonic oscillator",
                "description": "Die lernende Person kann grundlegende Quantensysteme modellieren, die als Qubits oder Resonatoren dienen.",
                "descriptionEn": "The learner can model basic quantum systems used as qubits and resonators.",
            },
            {
                "shortKey": "tum_nat3034_coherence_relaxation",
                "title": "Überlagerung, Verschränkung, Relaxation und Dephasierung",
                "titleEn": "Superposition, entanglement, relaxation, and dephasing",
                "description": "Die lernende Person kann Kohärenz- und Dekohärenzprozesse für Qubits erklären.",
                "descriptionEn": "The learner can explain coherence and decoherence processes relevant for qubits.",
            },
            {
                "shortKey": "tum_nat3034_quantum_vs_classical",
                "title": "Quanten- vs. klassische Information und Anwendungen",
                "titleEn": "Quantum vs classical information and applications",
                "description": "Die lernende Person kann Quanten- und klassische Information vergleichen und Anwendungen benennen.",
                "descriptionEn": "The learner can contrast quantum and classical information and name key application areas.",
            },
        ],
    },
    {
        "shortKey": "tum_nat3034_light_matter_qed",
        "title": "Licht-Materie-Wechselwirkung und QED",
        "titleEn": "Light-matter interaction and QED",
        "description": "Die lernende Person kann Licht-Materie-Wechselwirkung in Hohlraum- und Schaltkreis-QED analysieren.",
        "descriptionEn": "The learner can analyze light-matter interaction in cavity and circuit QED settings.",
        "children": [
            {
                "shortKey": "tum_nat3034_field_quantization",
                "title": "Quantisierung des elektromagnetischen Feldes und Photonenzustände",
                "titleEn": "Quantization of the electromagnetic field and photon states",
                "description": "Die lernende Person kann Feldquantisierung und Eigenschaften von Photonenzuständen beschreiben.",
                "descriptionEn": "The learner can describe field quantization and properties of photon states.",
            },
            {
                "shortKey": "tum_nat3034_sources_detectors",
                "title": "Photonenquellen, Detektoren und verschränkte Photonen",
                "titleEn": "Photon sources, detectors, and entangled photons",
                "description": "Die lernende Person kann Erzeugung, Detektion und Verschränkung von Photonen erklären.",
                "descriptionEn": "The learner can explain how photons are generated, detected, and entangled.",
            },
            {
                "shortKey": "tum_nat3034_two_level_jc",
                "title": "Zwei-Niveau-Atome, Dipolmomente, Jaynes-Cummings und Rabi-Dynamik",
                "titleEn": "Two-level atoms, dipole moments, Jaynes-Cummings, and Rabi dynamics",
                "description": "Die lernende Person kann Atom-Feld-Kopplung modellieren und Rabi-Oszillationen vorhersagen.",
                "descriptionEn": "The learner can model atom-field coupling and predict Rabi oscillations.",
            },
            {
                "shortKey": "tum_nat3034_cavity_circuit_qed",
                "title": "Hohlraum- und Schaltkreis-QED, Kooperativität und AC-Stark-Effekt",
                "titleEn": "Cavity and circuit QED, cooperativity, and AC Stark effect",
                "description": "Die lernende Person kann starke Kopplungskriterien und cavity-induzierte Niveauverschiebungen erklären.",
                "descriptionEn": "The learner can explain strong coupling criteria and cavity-induced level shifts.",
            },
        ],
    },
    {
        "shortKey": "tum_nat3034_superconducting_circuits",
        "title": "Supraleitende Quantenschaltungen",
        "titleEn": "Superconducting quantum circuits",
        "description": "Die lernende Person kann supraleitende Hardwareplattformen für Qubits analysieren.",
        "descriptionEn": "The learner can analyze superconducting hardware platforms for qubits.",
        "children": [
            {
                "shortKey": "tum_nat3034_sc_resonators",
                "title": "Supraleitende Resonatoren und Qualitätsfaktoren",
                "titleEn": "Superconducting resonators and quality factors",
                "description": "Die lernende Person kann Resonatorgeometrie mit Frequenz und Qualitätsfaktor verknüpfen.",
                "descriptionEn": "The learner can relate resonator geometry to frequency and quality factor.",
            },
            {
                "shortKey": "tum_nat3034_josephson_qubits",
                "title": "Josephson-Junction-Qubits und Anharmonizität",
                "titleEn": "Josephson junction qubits and anharmonicity",
                "description": "Die lernende Person kann erklären, wie Josephson-Kontakte nichtlineare Qubits ermöglichen.",
                "descriptionEn": "The learner can explain how Josephson junctions create nonlinear qubits.",
            },
            {
                "shortKey": "tum_nat3034_qubit_hamiltonian",
                "title": "Engineering von Qubit-Hamiltonianen",
                "titleEn": "Qubit Hamiltonian engineering",
                "description": "Die lernende Person kann effektive Hamiltonianen für supraleitende Qubits herleiten.",
                "descriptionEn": "The learner can derive effective Hamiltonians for superconducting qubits.",
            },
            {
                "shortKey": "tum_nat3034_sc_gates_readout",
                "title": "Ein- und Zwei-Qubit-Gatter, Kontrolle und Auslese",
                "titleEn": "Single- and two-qubit gates with control and readout",
                "description": "Die lernende Person kann Gate-Operationen und Messschemata für supraleitende Qubits skizzieren.",
                "descriptionEn": "The learner can outline gate operations and measurement schemes for superconducting qubits.",
            },
            {
                "shortKey": "tum_nat3034_sc_decoherence",
                "title": "Dekohärenzmechanismen in supraleitenden Schaltungen",
                "titleEn": "Decoherence mechanisms in superconducting circuits",
                "description": "Die lernende Person kann dominante Dekohärenzkanäle und Gegenmaßnahmen benennen.",
                "descriptionEn": "The learner can identify dominant decoherence channels and mitigation strategies.",
            },
        ],
    },
    {
        "shortKey": "tum_nat3034_semiconductor_circuits",
        "title": "Halbleiter-Quantenschaltungen",
        "titleEn": "Semiconductor quantum circuits",
        "description": "Die lernende Person kann Halbleiterplattformen für Qubits und Resonatoren analysieren.",
        "descriptionEn": "The learner can analyze semiconductor platforms for qubits and resonators.",
        "children": [
            {
                "shortKey": "tum_nat3034_semiconductor_qubits",
                "title": "Halbleiter-Qubits (Quantenpunkte, Donatoren, Defekte)",
                "titleEn": "Semiconductor qubits (quantum dots, donors, defects)",
                "description": "Die lernende Person kann erklären, wie Halbleiter-Qubits realisiert und kontrolliert werden.",
                "descriptionEn": "The learner can explain how semiconductor qubits are realized and controlled.",
            },
            {
                "shortKey": "tum_nat3034_semiconductor_resonators",
                "title": "Resonatoren und Kopplungsstärken in Halbleitern",
                "titleEn": "Resonators and coupling strength in semiconductors",
                "description": "Die lernende Person kann Geräteparameter mit Kopplungsstärke und Kontrolltreue verknüpfen.",
                "descriptionEn": "The learner can relate device parameters to coupling strength and control fidelity.",
            },
            {
                "shortKey": "tum_nat3034_semiconductor_gates",
                "title": "Gatter, Kontrolle und Auslese in Halbleitersystemen",
                "titleEn": "Gate operations, control, and readout",
                "description": "Die lernende Person kann Gate- und Messschemata für Halbleiter-Qubits skizzieren.",
                "descriptionEn": "The learner can outline gate and measurement schemes for semiconductor qubits.",
            },
            {
                "shortKey": "tum_nat3034_semiconductor_decoherence",
                "title": "Dekohärenz und Dephasierung in Halbleitern",
                "titleEn": "Decoherence and dephasing in semiconductors",
                "description": "Die lernende Person kann Rauschquellen und Dephasierungsmechanismen in Halbleitersystemen beschreiben.",
                "descriptionEn": "The learner can describe noise sources and dephasing mechanisms in semiconductor devices.",
            },
        ],
    },
    {
        "shortKey": "tum_nat3034_atoms_gases",
        "title": "Atome und Quantengase",
        "titleEn": "Atoms and quantum gases",
        "description": "Die lernende Person kann erklären, wie ultrakalte Atome und Quantengase als Hardwareplattformen genutzt werden.",
        "descriptionEn": "The learner can explain how ultracold atoms and quantum gases are used as hardware platforms.",
        "children": [
            {
                "shortKey": "tum_nat3034_ultracold_preparation",
                "title": "Präparation ultrakalter Gase",
                "titleEn": "Ultracold gas preparation",
                "description": "Die lernende Person kann Laserkühlung, Einfangen und Verdampfungskühlung beschreiben.",
                "descriptionEn": "The learner can describe laser cooling, trapping, and evaporative cooling techniques.",
            },
            {
                "shortKey": "tum_nat3034_interactions_lattices",
                "title": "Wechselwirkungen und optische Gitter",
                "titleEn": "Interactions and optical lattices",
                "description": "Die lernende Person kann Wechselwirkungen in optischen Gittern erklären und steuern.",
                "descriptionEn": "The learner can explain interactions in optical lattices and their control.",
            },
            {
                "shortKey": "tum_nat3034_hubbard_models",
                "title": "Bose-Hubbard- und Hubbard-Modelle",
                "titleEn": "Bose-Hubbard and Hubbard models",
                "description": "Die lernende Person kann Gittermodelle auf ultrakalte Atomsysteme anwenden.",
                "descriptionEn": "The learner can apply lattice models to describe cold-atom systems.",
            },
        ],
    },
    {
        "shortKey": "tum_nat3034_quantum_sensing",
        "title": "Quantensensorik",
        "titleEn": "Quantum sensing",
        "description": "Die lernende Person kann Hardwarekonzepte der Quantensensorik und ihre Grenzen erklären.",
        "descriptionEn": "The learner can explain hardware concepts for quantum sensing and their limits.",
        "children": [
            {
                "shortKey": "tum_nat3034_noise_sql",
                "title": "Rauschquellen und Sensitivitätsgrenzen (SQL)",
                "titleEn": "Noise sources and sensitivity limits (SQL)",
                "description": "Die lernende Person kann Rauschquellen analysieren und sie mit der Standardquantengrenze verknüpfen.",
                "descriptionEn": "The learner can analyze noise sources and relate them to the standard quantum limit.",
            },
            {
                "shortKey": "tum_nat3034_optomechanics",
                "title": "Optomechanik und Positionsmessung",
                "titleEn": "Optomechanics and position measurements",
                "description": "Die lernende Person kann optomechanische Messungen und Positionsauslese beschreiben.",
                "descriptionEn": "The learner can describe optomechanical sensing and position readout.",
            },
            {
                "shortKey": "tum_nat3034_backaction_shot_noise",
                "title": "Quantenrückwirkung und Schrotrauschen",
                "titleEn": "Quantum backaction and shot noise",
                "description": "Die lernende Person kann Quantenrückwirkung und Schrotrauschen als Messgrenzen erklären.",
                "descriptionEn": "The learner can explain measurement backaction and shot-noise limits.",
            },
            {
                "shortKey": "tum_nat3034_nv_centers",
                "title": "NV-Zentren und Spin-Qubit-Sensoren",
                "titleEn": "NV centers and spin-qubit sensors",
                "description": "Die lernende Person kann Sensorik mit Defektzentren in Diamant und Halbleitern beschreiben.",
                "descriptionEn": "The learner can describe sensing with defect centers in diamond and semiconductors.",
            },
            {
                "shortKey": "tum_nat3034_beyond_sql",
                "title": "Jenseits des SQL: Squeezing und QND",
                "titleEn": "Beyond SQL with squeezing and QND",
                "description": "Die lernende Person kann erklären, wie Squeezing und quanten-nicht-destruktive Messungen das SQL übertreffen.",
                "descriptionEn": "The learner can explain how squeezing and quantum non-demolition techniques surpass the SQL.",
            },
        ],
    },
]

nat3034_requires = {
    "tum_nat3034_light_matter_qed": ["tum_nat3034_foundations"],
    "tum_nat3034_superconducting_circuits": ["tum_nat3034_light_matter_qed"],
    "tum_nat3034_semiconductor_circuits": ["tum_nat3034_light_matter_qed"],
    "tum_nat3034_atoms_gases": ["tum_nat3034_light_matter_qed"],
    "tum_nat3034_quantum_sensing": ["tum_nat3034_light_matter_qed"],

    "tum_nat3034_coherence_relaxation": ["tum_nat3034_two_level_oscillator"],

    "tum_nat3034_sources_detectors": ["tum_nat3034_field_quantization"],
    "tum_nat3034_two_level_jc": ["tum_nat3034_field_quantization"],
    "tum_nat3034_cavity_circuit_qed": ["tum_nat3034_two_level_jc"],

    "tum_nat3034_josephson_qubits": ["tum_nat3034_sc_resonators"],
    "tum_nat3034_qubit_hamiltonian": ["tum_nat3034_josephson_qubits"],
    "tum_nat3034_sc_gates_readout": ["tum_nat3034_qubit_hamiltonian"],
    "tum_nat3034_sc_decoherence": ["tum_nat3034_josephson_qubits"],

    "tum_nat3034_semiconductor_resonators": ["tum_nat3034_semiconductor_qubits"],
    "tum_nat3034_semiconductor_gates": ["tum_nat3034_semiconductor_resonators"],
    "tum_nat3034_semiconductor_decoherence": ["tum_nat3034_semiconductor_qubits"],

    "tum_nat3034_interactions_lattices": ["tum_nat3034_ultracold_preparation"],
    "tum_nat3034_hubbard_models": ["tum_nat3034_interactions_lattices"],

    "tum_nat3034_optomechanics": ["tum_nat3034_noise_sql"],
    "tum_nat3034_backaction_shot_noise": ["tum_nat3034_optomechanics"],
    "tum_nat3034_beyond_sql": ["tum_nat3034_backaction_shot_noise"],
}

nat3035_description_en = (
    "Quantum Information introduces the theoretical foundations of quantum science and technology. "
    "It covers formalism (states, channels, measurements), entanglement and nonlocality, quantum communication protocols, "
    "quantum computation and algorithms, simulation and metrology, and decoherence with error correction."
)

nat3035_description_de = (
    "Quanteninformation fuehrt in die theoretischen Grundlagen der Quantenwissenschaft und -technologie ein. "
    "Behandelt werden Formalismus (Zustaende, Kanaele, Messungen), Verschränkung und Nichtlokalitaet, "
    "Quantenkommunikationsprotokolle, Quantenrechnung und Algorithmen, Simulation und Metrologie sowie "
    "Dekohärenz und Fehlerkorrektur."
)

nat3035_root_de = (
    "Die lernende Person kann zentrale Konzepte der Quanteninformation erklaeren und auf typische Anwendungen anwenden."
)

nat3035_root_en = (
    "The learner can explain core concepts of quantum information and apply them to typical applications."
)

nat3035_categories = [
    {
        "shortKey": "tum_nat3035_foundations",
        "title": "Grundlagen und Formalismus",
        "titleEn": "Foundations and formalism",
        "description": "Die lernende Person kann den grundlegenden Formalismus der Quanteninformation anwenden.",
        "descriptionEn": "The learner can use the basic formalism of quantum information theory.",
        "children": [
            {
                "shortKey": "tum_nat3035_pure_mixed",
                "title": "Reine und gemischte Zustaende",
                "titleEn": "Pure vs mixed states",
                "description": "Die lernende Person kann reine und gemischte Zustaende unterscheiden und mathematisch darstellen.",
                "descriptionEn": "The learner can distinguish pure and mixed states and represent them mathematically.",
            },
            {
                "shortKey": "tum_nat3035_cp_maps",
                "title": "Quantenentwicklung und vollstaendig positive Abbildungen",
                "titleEn": "Quantum evolution and completely positive maps",
                "description": "Die lernende Person kann unitäre Entwicklung, Kanaele und vollstaendig positive Abbildungen beschreiben.",
                "descriptionEn": "The learner can describe unitary evolution, channels, and completely positive maps.",
            },
            {
                "shortKey": "tum_nat3035_measurements",
                "title": "Messungen und POVMs",
                "titleEn": "Measurements and POVMs",
                "description": "Die lernende Person kann Quantenmessungen modellieren und Ergebnisstatistiken interpretieren.",
                "descriptionEn": "The learner can model quantum measurements and interpret outcome statistics.",
            },
            {
                "shortKey": "tum_nat3035_schmidt_purification",
                "title": "Schmidt-Zerlegung und Purifikation",
                "titleEn": "Schmidt decomposition and purification",
                "description": "Die lernende Person kann Schmidt-Zerlegungen berechnen und Purifikationsmethoden nutzen.",
                "descriptionEn": "The learner can compute Schmidt decompositions and use purification techniques.",
            },
            {
                "shortKey": "tum_nat3035_tomography_estimation",
                "title": "Tomographie, Schaetzung und Hypothesentests",
                "titleEn": "Tomography, estimation, and hypothesis testing",
                "description": "Die lernende Person kann grundlegende Methoden der Zustandsrekonstruktion und Schaetzung erklaeren.",
                "descriptionEn": "The learner can explain basic methods of quantum state tomography and estimation.",
            },
            {
                "shortKey": "tum_nat3035_quantum_computation_basics",
                "title": "Quantenmechanische Rechnungen",
                "titleEn": "Quantum mechanical computations",
                "description": "Die lernende Person kann Rechnungen durchführen, die für Quanteninformation relevant sind.",
                "descriptionEn": "The learner can perform computations relevant to quantum information tasks.",
            },
        ],
    },
    {
        "shortKey": "tum_nat3035_entanglement",
        "title": "Verschränkung und Nichtlokalität",
        "titleEn": "Entanglement theory and nonlocality",
        "description": "Die lernende Person kann Verschränkung in reinen und gemischten Zustaenden analysieren.",
        "descriptionEn": "The learner can analyze entanglement in pure and mixed states and its signatures.",
        "children": [
            {
                "shortKey": "tum_nat3035_entanglement_types",
                "title": "Verschränkung in reinen und gemischten Zuständen",
                "titleEn": "Pure and mixed-state entanglement",
                "description": "Die lernende Person kann Verschränkung in reinen und gemischten Zuständen klassifizieren.",
                "descriptionEn": "The learner can classify entanglement in pure and mixed states.",
            },
            {
                "shortKey": "tum_nat3035_entanglement_entropy",
                "title": "Verschränkungsentropie und Maße",
                "titleEn": "Entanglement entropy and measures",
                "description": "Die lernende Person kann Verschraenkungsentropie und verwandte Maße berechnen.",
                "descriptionEn": "The learner can compute entanglement entropy and related measures.",
            },
            {
                "shortKey": "tum_nat3035_entanglement_distillation",
                "title": "Verschränkungsumwandlung und Destillation",
                "titleEn": "Entanglement conversion and distillation",
                "description": "Die lernende Person kann Distillation, Umwandlung und Purifikation beschreiben.",
                "descriptionEn": "The learner can describe distillation, conversion, and purification protocols.",
            },
            {
                "shortKey": "tum_nat3035_bell_inequalities",
                "title": "Bell-Ungleichungen und Nichtlokalität",
                "titleEn": "Bell inequalities and nonlocality",
                "description": "Die lernende Person kann Bell-Tests und deren Bedeutung für Nichtlokalität erklären.",
                "descriptionEn": "The learner can explain Bell tests and their implications for nonlocality.",
            },
        ],
    },
    {
        "shortKey": "tum_nat3035_communication",
        "title": "Quantenkommunikation",
        "titleEn": "Quantum communication protocols",
        "description": "Die lernende Person kann erklären, wie Verschränkung Kommunikationsprotokolle ermöglicht.",
        "descriptionEn": "The learner can explain how entanglement enables communication protocols.",
        "children": [
            {
                "shortKey": "tum_nat3035_dense_coding",
                "title": "Dichte Kodierung",
                "titleEn": "Dense coding",
                "description": "Die lernende Person kann dichte Kodierung und ihre Ressourcen beschreiben.",
                "descriptionEn": "The learner can explain dense coding and its resource requirements.",
            },
            {
                "shortKey": "tum_nat3035_teleportation",
                "title": "Quanten-Teleportation",
                "titleEn": "Quantum teleportation",
                "description": "Die lernende Person kann das Teleportationsprotokoll skizzieren und Ressourcen benennen.",
                "descriptionEn": "The learner can outline the teleportation protocol and required resources.",
            },
            {
                "shortKey": "tum_nat3035_quantum_cryptography",
                "title": "Quantenkryptographie (QKD)",
                "titleEn": "Quantum cryptography (QKD)",
                "description": "Die lernende Person kann grundlegende QKD-Protokolle erklären.",
                "descriptionEn": "The learner can explain basic quantum key distribution protocols.",
            },
        ],
    },
    {
        "shortKey": "tum_nat3035_computation",
        "title": "Quantenrechnung und Algorithmen",
        "titleEn": "Quantum computation and algorithms",
        "description": "Die lernende Person kann Rechenmodelle und zentrale Algorithmen erklären.",
        "descriptionEn": "The learner can explain computational models and key quantum algorithms.",
        "children": [
            {
                "shortKey": "tum_nat3035_circuits",
                "title": "Quantenschaltkreise und Gattermodell",
                "titleEn": "Quantum circuits and gate model",
                "description": "Die lernende Person kann Berechnungen mit Quantenschaltkreisen und Gattern modellieren.",
                "descriptionEn": "The learner can model computations using quantum circuits and gates.",
            },
            {
                "shortKey": "tum_nat3035_algorithms",
                "title": "Deutsch-, Grover- und Shor-Algorithmen",
                "titleEn": "Deutsch, Grover, and Shor algorithms",
                "description": "Die lernende Person kann zentrale Schritte und Speedups dieser Algorithmen beschreiben.",
                "descriptionEn": "The learner can describe core steps and speedups of standard algorithms.",
            },
        ],
    },
    {
        "shortKey": "tum_nat3035_simulation_metrology",
        "title": "Quantensimulation und Metrologie",
        "titleEn": "Quantum simulation and metrology",
        "description": "Die lernende Person kann Simulation und Metrologie als Anwendungen der Quanteninformation erklären.",
        "descriptionEn": "The learner can explain simulation and metrology as central applications.",
        "children": [
            {
                "shortKey": "tum_nat3035_simulation",
                "title": "Grundlagen der Quantensimulation",
                "titleEn": "Quantum simulation basics",
                "description": "Die lernende Person kann erklären, wie Quantensysteme andere Quantensysteme simulieren.",
                "descriptionEn": "The learner can explain how quantum systems simulate other quantum systems.",
            },
            {
                "shortKey": "tum_nat3035_metrology",
                "title": "Quantenmetrologie und Schätzung",
                "titleEn": "Quantum metrology and estimation",
                "description": "Die lernende Person kann den Zusammenhang zwischen Präzision und Quantenressourcen erklären.",
                "descriptionEn": "The learner can relate estimation precision to quantum resources.",
            },
        ],
    },
    {
        "shortKey": "tum_nat3035_decoherence_ec",
        "title": "Dekohärenz und Fehlerkorrektur",
        "titleEn": "Decoherence and error correction",
        "description": "Die lernende Person kann Dekohärenz und Gegenmaßnahmen für fragile Quanteninformation analysieren.",
        "descriptionEn": "The learner can analyze decoherence and countermeasures for fragile quantum information.",
        "children": [
            {
                "shortKey": "tum_nat3035_decoherence",
                "title": "Dekohärenzmechanismen",
                "titleEn": "Decoherence mechanisms",
                "description": "Die lernende Person kann Quellen und Folgen der Dekohärenz erklären.",
                "descriptionEn": "The learner can explain sources and consequences of decoherence.",
            },
            {
                "shortKey": "tum_nat3035_lindblad",
                "title": "Lindblad-Meistergleichung",
                "titleEn": "Lindblad master equation",
                "description": "Die lernende Person kann offene Quantensysteme mit Lindblad-Gleichungen modellieren.",
                "descriptionEn": "The learner can model open-system dynamics using Lindblad equations.",
            },
            {
                "shortKey": "tum_nat3035_error_correction",
                "title": "Fehlerkorrekturcodes und Strategien",
                "titleEn": "Error correction codes and strategies",
                "description": "Die lernende Person kann grundlegende Fehlerkorrekturschemata erklären.",
                "descriptionEn": "The learner can explain elementary error correction schemes.",
            },
        ],
    },
    {
        "shortKey": "tum_nat3035_advanced_topics",
        "title": "Fortgeschrittene Themen",
        "titleEn": "Advanced and optional topics",
        "description": "Die lernende Person kann Bezüge der Quanteninformation zu fortgeschrittenen Themen herstellen.",
        "descriptionEn": "The learner can relate quantum information to advanced topics in many-body physics.",
        "children": [
            {
                "shortKey": "tum_nat3035_many_body_entanglement",
                "title": "Vielteilchen-Verschränkung",
                "titleEn": "Many-body entanglement",
                "description": "Die lernende Person kann Verschränkung in Vielteilchensystemen erklären.",
                "descriptionEn": "The learner can explain entanglement in many-body systems.",
            },
            {
                "shortKey": "tum_nat3035_topological_qc",
                "title": "Topologische Quantenrechnung",
                "titleEn": "Topological quantum computation",
                "description": "Die lernende Person kann topologische Ansätze für robuste Quantenrechnung beschreiben.",
                "descriptionEn": "The learner can describe topological approaches to robust quantum computation.",
            },
            {
                "shortKey": "tum_nat3035_quantum_complexity",
                "title": "Quantenkomplexität",
                "titleEn": "Quantum complexity",
                "description": "Die lernende Person kann Komplexitätsklassen und Ressourcenskalierung erklären.",
                "descriptionEn": "The learner can explain complexity classes and resource scaling in quantum computing.",
            },
            {
                "shortKey": "tum_nat3035_tensor_networks",
                "title": "Tensor-Netzwerke",
                "titleEn": "Tensor networks",
                "description": "Die lernende Person kann Tensor-Netzwerk-Darstellungen für Quantenzustände erläutern.",
                "descriptionEn": "The learner can explain tensor-network representations for quantum states.",
            },
        ],
    },
]

nat3035_requires = {
    "tum_nat3035_entanglement": ["tum_nat3035_foundations"],
    "tum_nat3035_communication": ["tum_nat3035_entanglement"],
    "tum_nat3035_computation": ["tum_nat3035_foundations"],
    "tum_nat3035_simulation_metrology": ["tum_nat3035_computation"],
    "tum_nat3035_decoherence_ec": ["tum_nat3035_foundations"],
    "tum_nat3035_advanced_topics": ["tum_nat3035_foundations"],

    "tum_nat3035_cp_maps": ["tum_nat3035_pure_mixed"],
    "tum_nat3035_measurements": ["tum_nat3035_pure_mixed"],
    "tum_nat3035_schmidt_purification": ["tum_nat3035_pure_mixed"],
    "tum_nat3035_tomography_estimation": ["tum_nat3035_measurements"],

    "tum_nat3035_entanglement_entropy": ["tum_nat3035_entanglement_types"],
    "tum_nat3035_entanglement_distillation": ["tum_nat3035_entanglement_entropy"],
    "tum_nat3035_bell_inequalities": ["tum_nat3035_entanglement_types"],

    "tum_nat3035_algorithms": ["tum_nat3035_circuits"],

    "tum_nat3035_lindblad": ["tum_nat3035_decoherence"],
    "tum_nat3035_error_correction": ["tum_nat3035_lindblad"],

    "tum_nat3035_many_body_entanglement": ["tum_nat3035_entanglement"],
    "tum_nat3035_topological_qc": ["tum_nat3035_computation"],
    "tum_nat3035_quantum_complexity": ["tum_nat3035_computation"],
    "tum_nat3035_tensor_networks": ["tum_nat3035_entanglement"],
}


def main():
    nat3034 = build_module(
        "NAT3034",
        "Quantenhardware",
        "Quantum Hardware",
        10,
        nat3034_description_de,
        nat3034_description_en,
        nat3034_root_de,
        nat3034_root_en,
        nat3034_categories,
        nat3034_requires,
    )

    nat3035 = build_module(
        "NAT3035",
        "Quanteninformation",
        "Quantum Information",
        10,
        nat3035_description_de,
        nat3035_description_en,
        nat3035_root_de,
        nat3035_root_en,
        nat3035_categories,
        nat3035_requires,
    )

    out_dir = Path("/home/enpasos/projects/skillpilot/curricula/DE/BY/TUM/Quantum_Science_and_Technology/MSc_QST/json")
    out_dir.mkdir(parents=True, exist_ok=True)

    (out_dir / "DE_BAY_U_TUM_NAT3034.de.json").write_text(
        json.dumps(nat3034, ensure_ascii=False, indent=4) + "\n",
        encoding="utf-8",
    )
    (out_dir / "DE_BAY_U_TUM_NAT3035.de.json").write_text(
        json.dumps(nat3035, ensure_ascii=False, indent=4) + "\n",
        encoding="utf-8",
    )


if __name__ == "__main__":
    main()
