import json
import re
import uuid
from pathlib import Path

BASE = Path('/home/enpasos/projects/skillpilot')
RAW_DIR = BASE / 'curricula/DE/BY/TUM/Quantum_Science_and_Technology/MSc_QST/input/raw'
RAWGRAPH_DIR = BASE / 'curricula/DE/BY/TUM/Quantum_Science_and_Technology/MSc_QST/input/rawgraph'
JSON_DIR = BASE / 'curricula/DE/BY/TUM/Quantum_Science_and_Technology/MSc_QST/json'

NS = uuid.uuid5(uuid.NAMESPACE_DNS, 'skillpilot.io')


def slugify(text: str) -> str:
    slug = text.lower().replace('&', 'and')
    slug = re.sub(r"[^a-z0-9]+", "_", slug).strip('_')
    return slug


def parse_raw_meta(code: str):
    path = RAW_DIR / f'DE_BAY_U_TUM_{code}.txt'
    data = {
        'code': code,
        'title': '',
        'title_en': '',
        'ects': '',
    }
    for line in path.read_text(encoding='utf-8').splitlines():
        if line.startswith('title: '):
            data['title'] = line.replace('title: ', '', 1).strip()
        elif line.startswith('title_en: '):
            data['title_en'] = line.replace('title_en: ', '', 1).strip()
        elif line.startswith('ects: '):
            data['ects'] = line.replace('ects: ', '', 1).strip()
    return data


def parse_rawgraph(code: str):
    path = RAWGRAPH_DIR / f'DE_BAY_U_TUM_{code}.txt'
    lines = path.read_text(encoding='utf-8').splitlines()
    nodes = []
    i = 0
    while i < len(lines):
        line = lines[i]
        stripped = line.strip()
        if not stripped or stripped.startswith('#'):
            i += 1
            continue
        if stripped.startswith('Node:'):
            indent = len(line) - len(line.lstrip(' '))
            level = indent // 2
            title = stripped[len('Node:'):].strip()
            desc = ''
            j = i + 1
            while j < len(lines):
                candidate = lines[j].strip()
                if not candidate:
                    j += 1
                    continue
                if candidate.startswith('Description:'):
                    desc = candidate[len('Description:'):].strip()
                    j += 1
                    break
                if candidate.startswith('Node:'):
                    break
                j += 1
            nodes.append({
                'title_en': title,
                'description_en': desc,
                'level': level,
                'children': [],
            })
            i = j
            continue
        i += 1

    stack = []
    for idx, node in enumerate(nodes):
        level = node['level']
        while stack and stack[-1][0] >= level:
            stack.pop()
        if stack:
            parent_idx = stack[-1][1]
            nodes[parent_idx]['children'].append(idx)
        stack.append((level, idx))
    return nodes


def build_goals(code: str, module_meta, translations, requires_map):
    nodes = parse_rawgraph(code)

    used_keys = set()
    short_keys = []
    for idx, node in enumerate(nodes):
        if idx == 0:
            short_key = f"tum_{code.lower()}_module"
        else:
            base = slugify(node['title_en'])
            short_key = f"tum_{code.lower()}_{base}"
            if short_key in used_keys:
                suffix = 2
                while f"{short_key}_{suffix}" in used_keys:
                    suffix += 1
                short_key = f"{short_key}_{suffix}"
        used_keys.add(short_key)
        short_keys.append(short_key)

    goals = []
    id_map = {}
    for idx, node in enumerate(nodes):
        short_key = short_keys[idx]
        if idx == 0:
            goal_id = str(uuid.uuid5(NS, f"tum-module/{code}"))
        else:
            goal_id = str(uuid.uuid5(NS, f"tum-{code.lower()}/{short_key}"))
        id_map[short_key] = goal_id

    for idx, node in enumerate(nodes):
        short_key = short_keys[idx]
        translation = translations.get(node['title_en'])
        if not translation:
            raise SystemExit(f"Missing translation for {code}: {node['title_en']}")
        title_de = translation['title_de']
        desc_de = translation['description_de']

        contains = [id_map[short_keys[child_idx]] for child_idx in node['children']]
        if idx == 0:
            weight = float(module_meta['ects']) if module_meta['ects'] else 1.0
            area = 'Gesamtkompetenz'
        else:
            weight = 2.0 if node['children'] else 1.0
            area = 'Kompetenz'

        goals.append({
            'id': id_map[short_key],
            'shortKey': short_key,
            'title': title_de,
            'titleEn': node['title_en'],
            'description': desc_de,
            'descriptionEn': node['description_en'],
            'core': True,
            'weight': weight,
            'phase': 'Modul',
            'area': area,
            'tags': [f"module:{code}"],
            'contains': contains,
            'requires': [],
        })

    if goals:
        root = goals[0]
        if module_meta['ects']:
            root['tags'].append(f"ects:{module_meta['ects']}")
        root['sourceRef'] = f"https://academics.nat.tum.de/org/mh/details/mod/{code}"

    short_key_to_index = {g['shortKey']: i for i, g in enumerate(goals)}
    for short_key, reqs in requires_map.items():
        if short_key not in short_key_to_index:
            raise SystemExit(f"Missing shortKey in requires map ({code}): {short_key}")
        goal = goals[short_key_to_index[short_key]]
        goal['requires'] = [id_map[req] for req in reqs]

    return goals


MODULES = {
    'IN2381': {
        'meta': {
            'title': 'Einführung in Quantum Computing (TUM, Modul IN2381)',
            'title_en': 'Introduction to Quantum Computing (TUM, Module IN2381)',
            'description': (
                'Das Modul führt in den mathematischen Formalismus der Quantenmechanik für das Quantum Computing ein '
                'und behandelt Quantenschaltungen, Teleportation, Bellsche Ungleichungen sowie grundlegende Quantenalgorithmen. '
                'Studierende analysieren einfache Algorithmen, entwerfen Schaltungen und nutzen Tools wie Qiskit oder Cirq.'
            ),
            'description_en': (
                'The module introduces the quantum-mechanical formalism for quantum computing and covers quantum circuits, '
                'teleportation, Bell inequalities, and fundamental quantum algorithms. Students analyze simple algorithms, '
                'design circuits, and use tools such as Qiskit or Cirq.'
            ),
            'framework_id': 'tum-in2381',
        },
        'translations': {
            'Introduction to Quantum Computing (IN2381)': {
                'title_de': 'Einführung in Quantum Computing (IN2381)',
                'description_de': 'Die lernende Person kann den mathematischen Formalismus des Quantum Computing erklären, einfache Quantenalgorithmen analysieren und grundlegende Quantenschaltungen entwerfen.',
            },
            'Quantum mechanics formalism for computing': {
                'title_de': 'Quantenmechanischer Formalismus für das Quantum Computing',
                'description_de': 'Die lernende Person kann den Zustands- und Operatorformalismus für Qubits und Messungen anwenden.',
            },
            'Qubit states and Dirac notation': {
                'title_de': 'Qubit-Zustände und Dirac-Notation',
                'description_de': 'Die lernende Person kann Ein- und Mehrqubit-Zustände darstellen und Amplituden berechnen.',
            },
            'Quantum measurements and probabilities': {
                'title_de': 'Quantenmessungen und Wahrscheinlichkeiten',
                'description_de': 'Die lernende Person kann Messungen modellieren und Ergebnisstatistiken berechnen.',
            },
            'Quantum circuits and gates': {
                'title_de': 'Quantenschaltungen und Gatter',
                'description_de': 'Die lernende Person kann Schaltungen aus elementaren Quantengattern aufbauen.',
            },
            'Single- and two-qubit gates': {
                'title_de': 'Ein- und Zwei-Qubit-Gatter',
                'description_de': 'Die lernende Person kann gängige Gatter anwenden und ihre Matrixdarstellungen verstehen.',
            },
            'Circuit construction and execution': {
                'title_de': 'Schaltungsentwurf und Ausführung',
                'description_de': 'Die lernende Person kann Schaltungen für einfache Aufgaben entwerfen und Ausgaben vorhersagen.',
            },
            'Entanglement and communication protocols': {
                'title_de': 'Verschränkung und Kommunikationsprotokolle',
                'description_de': 'Die lernende Person kann Verschränkung und ihre Rolle in grundlegenden Protokollen erklären.',
            },
            'Bell inequalities and nonlocality': {
                'title_de': 'Bellsche Ungleichungen und Nichtlokalität',
                'description_de': 'Die lernende Person kann Bell-Tests erklären und ihre Konsequenzen für Nichtlokalität beschreiben.',
            },
            'Quantum teleportation': {
                'title_de': 'Quantenteleportation',
                'description_de': 'Die lernende Person kann das Teleportationsprotokoll skizzieren und benötigte Ressourcen benennen.',
            },
            'Fundamental quantum algorithms': {
                'title_de': 'Grundlegende Quantenalgorithmen',
                'description_de': 'Die lernende Person kann zentrale Quantenalgorithmen und ihre Beschleunigungen analysieren.',
            },
            'Grover search and basic algorithmic ideas': {
                'title_de': 'Grover-Suche und grundlegende algorithmische Ideen',
                'description_de': 'Die lernende Person kann Grovers Algorithmus beschreiben und dessen Komplexität analysieren.',
            },
            'Software tools and applications': {
                'title_de': 'Software-Tools und Anwendungen',
                'description_de': 'Die lernende Person kann grundlegende Software-Tools für Quantenschaltungen nutzen und Einsatzfelder einschätzen.',
            },
            'Circuit simulation with Qiskit or Cirq': {
                'title_de': 'Schaltungssimulation mit Qiskit oder Cirq',
                'description_de': 'Die lernende Person kann einfache Schaltungen in gängigen Toolkits implementieren und ausführen.',
            },
            'Use cases and limitations of quantum computing': {
                'title_de': 'Anwendungsfälle und Grenzen des Quantum Computing',
                'description_de': 'Die lernende Person kann Anwendungsdomänen benennen und Grenzen diskutieren.',
            },
        },
        'requires': {
            'tum_in2381_quantum_circuits_and_gates': ['tum_in2381_quantum_mechanics_formalism_for_computing'],
            'tum_in2381_entanglement_and_communication_protocols': ['tum_in2381_quantum_mechanics_formalism_for_computing'],
            'tum_in2381_fundamental_quantum_algorithms': ['tum_in2381_quantum_circuits_and_gates'],
            'tum_in2381_software_tools_and_applications': ['tum_in2381_quantum_circuits_and_gates'],
            'tum_in2381_quantum_measurements_and_probabilities': ['tum_in2381_qubit_states_and_dirac_notation'],
            'tum_in2381_circuit_construction_and_execution': ['tum_in2381_single_and_two_qubit_gates'],
            'tum_in2381_quantum_teleportation': ['tum_in2381_bell_inequalities_and_nonlocality'],
            'tum_in2381_circuit_simulation_with_qiskit_or_cirq': ['tum_in2381_circuit_construction_and_execution'],
        },
    },
    'IN2388': {
        'meta': {
            'title': 'Tensornetzwerke (TUM, Modul IN2388)',
            'title_en': 'Tensor Networks (TUM, Module IN2388)',
            'description': (
                'Das Modul behandelt Grundlagen und grafische Darstellung von Tensornetzwerken, Approximationstheorie, '
                'Backpropagation durch Netzwerke sowie die Simulation stark korrelierter Quantensysteme und digitaler Quantencomputer. '
                'Außerdem werden Sampling und probabilistische Modellierung mit Tensornetzwerken behandelt.'
            ),
            'description_en': (
                'The module covers fundamentals and graphical representations of tensor networks, approximation theory, '
                'backpropagation through networks, and simulation of strongly correlated quantum systems and digital quantum computers. '
                'It also addresses sampling and probabilistic modeling with tensor networks.'
            ),
            'framework_id': 'tum-in2388',
        },
        'translations': {
            'Tensor Networks (IN2388)': {
                'title_de': 'Tensornetzwerke (IN2388)',
                'description_de': 'Die lernende Person kann Tensornetzwerkdarstellungen nutzen, um hochdimensionale Daten zu approximieren und Quantensysteme zu simulieren.',
            },
            'Tensor network fundamentals': {
                'title_de': 'Grundlagen der Tensornetzwerke',
                'description_de': 'Die lernende Person kann Tensoren und Netzwerke grafisch darstellen.',
            },
            'Tensor notation and contractions': {
                'title_de': 'Tensornotation und Kontraktionen',
                'description_de': 'Die lernende Person kann Tensordiagramme interpretieren und Kontraktionen berechnen.',
            },
            'Common network structures (MPS, MPO, PEPS)': {
                'title_de': 'Gängige Netzwerkstrukturen (MPS, MPO, PEPS)',
                'description_de': 'Die lernende Person kann Standardarchitekturen und ihre Eigenschaften beschreiben.',
            },
            'Approximation theory and optimization': {
                'title_de': 'Approximationstheorie und Optimierung',
                'description_de': 'Die lernende Person kann Niedrigrang-Approximationen anwenden und Tensornetzwerke optimieren.',
            },
            'Low-rank approximations and truncation': {
                'title_de': 'Niedrigrang-Approximationen und Trunkierung',
                'description_de': 'Die lernende Person kann Trunkierungen durchführen und Approximationsfehler abschätzen.',
            },
            'Backpropagation through tensor network operations': {
                'title_de': 'Backpropagation durch Tensornetzwerk-Operationen',
                'description_de': 'Die lernende Person kann Gradienten berechnen und Tensornetzwerk-Modelle trainieren.',
            },
            'Simulation of quantum systems and circuits': {
                'title_de': 'Simulation von Quantensystemen und -schaltungen',
                'description_de': 'Die lernende Person kann Tensornetzwerke zur Simulation stark korrelierter Systeme und Quantenschaltungen einsetzen.',
            },
            'Simulation of many-body quantum systems': {
                'title_de': 'Simulation von Vielteilchen-Quantensystemen',
                'description_de': 'Die lernende Person kann stark korrelierte Systeme mit Tensornetzwerken modellieren.',
            },
            'Simulation of digital quantum circuits': {
                'title_de': 'Simulation digitaler Quantenschaltungen',
                'description_de': 'Die lernende Person kann Schaltungsdynamik mit Tensornetzwerk-Methoden simulieren.',
            },
            'Probabilistic modeling and sampling': {
                'title_de': 'Probabilistische Modellierung und Sampling',
                'description_de': 'Die lernende Person kann Tensornetzwerke für Sampling und Wahrscheinlichkeitsverteilungen nutzen.',
            },
            'Sampling from tensor network models': {
                'title_de': 'Sampling aus Tensornetzwerk-Modellen',
                'description_de': 'Die lernende Person kann Stichproben erzeugen und probabilistische Ausgaben interpretieren.',
            },
        },
        'requires': {
            'tum_in2388_approximation_theory_and_optimization': ['tum_in2388_tensor_network_fundamentals'],
            'tum_in2388_simulation_of_quantum_systems_and_circuits': ['tum_in2388_tensor_network_fundamentals'],
            'tum_in2388_probabilistic_modeling_and_sampling': ['tum_in2388_tensor_network_fundamentals'],
            'tum_in2388_common_network_structures_mps_mpo_peps': ['tum_in2388_tensor_notation_and_contractions'],
            'tum_in2388_backpropagation_through_tensor_network_operations': ['tum_in2388_low_rank_approximations_and_truncation'],
            'tum_in2388_sampling_from_tensor_network_models': ['tum_in2388_tensor_notation_and_contractions'],
        },
    },
    'IN2400': {
        'meta': {
            'title': 'Fortgeschrittene Konzepte des Quantum Computing (TUM, Modul IN2400)',
            'title_en': 'Advanced Concepts of Quantum Computing (TUM, Module IN2400)',
            'description': (
                'Das Modul behandelt fortgeschrittene Konzepte des Quantum Computing wie Quanten-Fouriertransformation, '
                'Shor-Algorithmus, Quantenoperationen und Quanten-Fehlerkorrektur inklusive Stabilizer-Formalismus.'
            ),
            'description_en': (
                'The module covers advanced quantum computing concepts such as the quantum Fourier transform, Shor’s algorithm, '
                'quantum operations, and quantum error correction including the stabilizer formalism.'
            ),
            'framework_id': 'tum-in2400',
        },
        'translations': {
            'Advanced Concepts of Quantum Computing (IN2400)': {
                'title_de': 'Fortgeschrittene Konzepte des Quantum Computing (IN2400)',
                'description_de': 'Die lernende Person kann fortgeschrittene Konzepte des Quantum Computing wie QFT, Shor-Algorithmus, Quantenoperationen und Fehlerkorrektur anwenden.',
            },
            'Quantum Fourier transform and period finding': {
                'title_de': 'Quanten-Fouriertransformation und Periodenfindung',
                'description_de': 'Die lernende Person kann die Quanten-Fouriertransformation in algorithmischen Zusammenhängen erklären und einsetzen.',
            },
            'Quantum Fourier transform fundamentals': {
                'title_de': 'Grundlagen der Quanten-Fouriertransformation',
                'description_de': 'Die lernende Person kann QFT-Schaltungen herleiten, implementieren und Ergebnisse interpretieren.',
            },
            "Period finding and Shor's algorithm": {
                'title_de': 'Periodenfindung und Shor-Algorithmus',
                'description_de': 'Die lernende Person kann QFT-basierte Periodenfindung mit der Ganzzahlfaktorisierung verbinden.',
            },
            'Advanced quantum operations': {
                'title_de': 'Fortgeschrittene Quantenoperationen',
                'description_de': 'Die lernende Person kann Quantenoperationen über unitäre Gatter hinaus modellieren.',
            },
            'Quantum operations and channels': {
                'title_de': 'Quantenoperationen und Kanäle',
                'description_de': 'Die lernende Person kann CPTP-Abbildungen beschreiben und Quantenoperationen kombinieren.',
            },
            'Circuit synthesis for advanced algorithms': {
                'title_de': 'Schaltungssynthese für fortgeschrittene Algorithmen',
                'description_de': 'Die lernende Person kann Schaltungsstrukturen für fortgeschrittene Algorithmen entwerfen.',
            },
            'Quantum error correction': {
                'title_de': 'Quanten-Fehlerkorrektur',
                'description_de': 'Die lernende Person kann Fehlermodelle erklären und Fehlerkorrektur-Formalismen anwenden.',
            },
            'Error models and syndrome extraction': {
                'title_de': 'Fehlermodelle und Syndromextraktion',
                'description_de': 'Die lernende Person kann Fehler modellieren und Syndrommessungen beschreiben.',
            },
            'Stabilizer formalism and codes': {
                'title_de': 'Stabilisatorformalismus und Codes',
                'description_de': 'Die lernende Person kann den Stabilisatorformalismus zur Beschreibung von Codes nutzen.',
            },
        },
        'requires': {
            'tum_in2400_period_finding_and_shor_s_algorithm': ['tum_in2400_quantum_fourier_transform_fundamentals'],
            'tum_in2400_quantum_error_correction': ['tum_in2400_advanced_quantum_operations'],
            'tum_in2400_error_models_and_syndrome_extraction': ['tum_in2400_quantum_operations_and_channels'],
            'tum_in2400_stabilizer_formalism_and_codes': ['tum_in2400_error_models_and_syndrome_extraction'],
        },
    },
    'EI76471': {
        'meta': {
            'title': 'Quanteninformationstheorie (TUM, Modul EI76471)',
            'title_en': 'Quantum Information Theory (TUM, Module EI76471)',
            'description': (
                'Das Modul führt in die mathematische Modellierung von Quanten-Kommunikationssystemen ein und behandelt '
                'Quantenhypothesentests, Quellen- und Kanalcodierung sowie fortgeschrittene Themen wie Sicherheit und Verschränkung.'
            ),
            'description_en': (
                'The module introduces mathematical modeling of quantum communication systems and covers quantum hypothesis testing, '
                'source and channel coding, as well as advanced topics such as security and entanglement.'
            ),
            'framework_id': 'tum-ei76471',
        },
        'translations': {
            'Quantum Information Theory (EI76471)': {
                'title_de': 'Quanteninformationstheorie (EI76471)',
                'description_de': 'Die lernende Person kann Quantenkommunikationssysteme informationstheoretisch modellieren und Kodierungssätze anwenden.',
            },
            'Foundations of quantum information modeling': {
                'title_de': 'Grundlagen der Modellierung in der Quanteninformationstheorie',
                'description_de': 'Die lernende Person kann Quanteninformationstheorie mit Shannon-Konzepten und operativen Beschreibungen verbinden.',
            },
            'Operational description of finite-dimensional quantum systems': {
                'title_de': 'Operationelle Beschreibung endlichdimensionaler Quantensysteme',
                'description_de': 'Die lernende Person kann endlichdimensionale Quantensysteme operativ modellieren.',
            },
            'Connections to classical information theory': {
                'title_de': 'Verbindungen zur klassischen Informationstheorie',
                'description_de': 'Die lernende Person kann Quantenmodelle mit klassischen informationstheoretischen Größen verknüpfen.',
            },
            'Quantum hypothesis testing': {
                'title_de': 'Quantenhypothesentests',
                'description_de': 'Die lernende Person kann Hypothesentests im Quantenkontext analysieren.',
            },
            "Quantum hypothesis tests and Stein's lemma": {
                'title_de': 'Quantenhypothesentests und Quanten-Stein-Lemma',
                'description_de': 'Die lernende Person kann das Quanten-Stein-Lemma zur Zustandsdiskriminierung anwenden.',
            },
            'Source coding for quantum sources': {
                'title_de': 'Quellenkodierung für Quantenquellen',
                'description_de': 'Die lernende Person kann gedächtnislose Quantenquellen komprimieren.',
            },
            'Compression of memoryless quantum sources': {
                'title_de': 'Kompression gedächtnisloser Quantenquellen',
                'description_de': 'Die lernende Person kann Schumacher-Kompression und verwandte Resultate erklären.',
            },
            'Channel coding for quantum channels': {
                'title_de': 'Kanalcodierung für Quantenkanäle',
                'description_de': 'Die lernende Person kann Kodierungssätze für klassische Kommunikation über Quantenkanäle analysieren.',
            },
            'Classical messages over semiclassical and quantum channels': {
                'title_de': 'Klassische Nachrichten über semiklassische und Quantenkanäle',
                'description_de': 'Die lernende Person kann die Übertragung klassischer Nachrichten über gedächtnislose Kanäle beschreiben.',
            },
            'Coding theorems for memoryless quantum channels': {
                'title_de': 'Kodierungssätze für gedächtnislose Quantenkanäle',
                'description_de': 'Die lernende Person kann Kodierungssätze und Beweisstrategien für Quantenkanäle skizzieren.',
            },
            'Advanced topics and communication resources': {
                'title_de': 'Fortgeschrittene Themen und Kommunikationsressourcen',
                'description_de': 'Die lernende Person kann fortgeschrittene Themen wie Sicherheit und Verschränkung als Ressourcen erklären.',
            },
            'Information-theoretic security for quantum channels': {
                'title_de': 'Informationstheoretische Sicherheit für Quantenkanäle',
                'description_de': 'Die lernende Person kann Sicherheitskonzepte für Quantenkanäle und -quellen erläutern.',
            },
            'Entanglement theory and resource generation protocols': {
                'title_de': 'Verschränkungstheorie und Ressourcengenerierung',
                'description_de': 'Die lernende Person kann Verschränkung als Ressource und zugehörige Protokolle beschreiben.',
            },
        },
        'requires': {
            'tum_ei76471_quantum_hypothesis_testing': ['tum_ei76471_foundations_of_quantum_information_modeling'],
            'tum_ei76471_source_coding_for_quantum_sources': ['tum_ei76471_foundations_of_quantum_information_modeling'],
            'tum_ei76471_channel_coding_for_quantum_channels': ['tum_ei76471_foundations_of_quantum_information_modeling'],
            'tum_ei76471_advanced_topics_and_communication_resources': ['tum_ei76471_channel_coding_for_quantum_channels'],
            'tum_ei76471_quantum_hypothesis_tests_and_stein_s_lemma': ['tum_ei76471_quantum_hypothesis_testing'],
            'tum_ei76471_compression_of_memoryless_quantum_sources': ['tum_ei76471_source_coding_for_quantum_sources'],
            'tum_ei76471_coding_theorems_for_memoryless_quantum_channels': ['tum_ei76471_classical_messages_over_semiclassical_and_quantum_channels'],
        },
    },
    'NAT3011': {
        'meta': {
            'title': 'Fortgeschrittene Themen in der Quanteninformationstheorie (TUM, Modul NAT3011)',
            'title_en': 'Advanced Topics in Quantum Information Theory (TUM, Module NAT3011)',
            'description': (
                'Das Modul vertieft fortgeschrittene Themen der Quanteninformationstheorie wie Kommunikationsprotokolle, '
                'Verschränkung, klassische Simulation und Verifizierung von Quantenprozessoren.'
            ),
            'description_en': (
                'The module deepens advanced topics in quantum information theory such as communication protocols, entanglement, '
                'classical simulation, and verification of quantum processors.'
            ),
            'framework_id': 'tum-nat3011',
        },
        'translations': {
            'Advanced Topics in Quantum Information Theory (NAT3011)': {
                'title_de': 'Fortgeschrittene Themen in der Quanteninformationstheorie (NAT3011)',
                'description_de': 'Die lernende Person kann fortgeschrittene Konzepte der Quanteninformationstheorie anwenden und kritisch einordnen.',
            },
            'Foundations of quantum information theory': {
                'title_de': 'Grundlagen der Quanteninformationstheorie',
                'description_de': 'Die lernende Person kann Kernkonzepte der Quanteninformationstheorie in fortgeschrittenen Kontexten anwenden.',
            },
            'Core concepts and formalism': {
                'title_de': 'Kernkonzepte und Formalismus',
                'description_de': 'Die lernende Person kann zentrale QIT-Konzepte und formale Werkzeuge erläutern.',
            },
            'Quantum communication protocols': {
                'title_de': 'Quantenkommunikationsprotokolle',
                'description_de': 'Die lernende Person kann fortgeschrittene Kommunikationsprotokolle und ihre Ressourcen erklären.',
            },
            'Key protocols and resources': {
                'title_de': 'Zentrale Protokolle und Ressourcen',
                'description_de': 'Die lernende Person kann zentrale Protokolle und benötigte Ressourcen beschreiben.',
            },
            'Entanglement theory': {
                'title_de': 'Verschränkungstheorie',
                'description_de': 'Die lernende Person kann bipartite und multipartite Verschränkung analysieren.',
            },
            'Bipartite entanglement': {
                'title_de': 'Bipartite Verschränkung',
                'description_de': 'Die lernende Person kann bipartite Verschränkung charakterisieren und quantifizieren.',
            },
            'Multipartite entanglement': {
                'title_de': 'Multipartite Verschränkung',
                'description_de': 'Die lernende Person kann Strukturen und Maße multipartiter Verschränkung beschreiben.',
            },
            'Quantum computing and advantage': {
                'title_de': 'Quantencomputing und Quanten-Vorteil',
                'description_de': 'Die lernende Person kann Quantencomputing-Konzepte mit quantenmechanischem Vorteil verknüpfen.',
            },
            'Quantum computing concepts and algorithms': {
                'title_de': 'Konzepte und Algorithmen des Quantencomputings',
                'description_de': 'Die lernende Person kann Konzepte und algorithmische Ideen des Quantencomputings erläutern.',
            },
            'Classical simulation and quantum advantage': {
                'title_de': 'Klassische Simulation und Quanten-Vorteil',
                'description_de': 'Die lernende Person kann klassische Simulationen mit Aussagen zum Quanten-Vorteil vergleichen.',
            },
            'Verification of quantum processors': {
                'title_de': 'Verifizierung von Quantenprozessoren',
                'description_de': 'Die lernende Person kann Herausforderungen und Methoden der Verifizierung erklären.',
            },
            'Verification challenges and methods': {
                'title_de': 'Verifizierungsprobleme und Methoden',
                'description_de': 'Die lernende Person kann Verifizierungsprobleme benennen und Lösungsansätze skizzieren.',
            },
        },
        'requires': {
            'tum_nat3011_quantum_communication_protocols': ['tum_nat3011_foundations_of_quantum_information_theory'],
            'tum_nat3011_entanglement_theory': ['tum_nat3011_foundations_of_quantum_information_theory'],
            'tum_nat3011_quantum_computing_and_advantage': ['tum_nat3011_foundations_of_quantum_information_theory'],
            'tum_nat3011_verification_of_quantum_processors': ['tum_nat3011_quantum_computing_and_advantage'],
            'tum_nat3011_multipartite_entanglement': ['tum_nat3011_bipartite_entanglement'],
            'tum_nat3011_classical_simulation_and_quantum_advantage': ['tum_nat3011_quantum_computing_concepts_and_algorithms'],
        },
    },
    'NAT3013': {
        'meta': {
            'title': 'Theoretische Quantenoptik (TUM, Modul NAT3013)',
            'title_en': 'Theoretical Quantum Optics (TUM, Module NAT3013)',
            'description': (
                'Das Modul vermittelt theoretische Werkzeuge zur Modellierung von Licht-Materie-Wechselwirkungen '
                'und offenen Quantensystemen, inklusive Hohlraum-QED, Mastergleichungen, Photodetektion, Optomechanik und Lasertheorie.'
            ),
            'description_en': (
                'The module provides theoretical tools to model light-matter interactions and open quantum systems, '
                'including cavity QED, master equations, photodetection, optomechanics, and laser theory.'
            ),
            'framework_id': 'tum-nat3013',
        },
        'translations': {
            'Theoretical Quantum Optics (NAT3013)': {
                'title_de': 'Theoretische Quantenoptik (NAT3013)',
                'description_de': 'Die lernende Person kann Quanten-Licht-Materie-Wechselwirkungen und offene Quantensysteme modellieren.',
            },
            'Light-matter interaction fundamentals': {
                'title_de': 'Grundlagen der Licht-Materie-Wechselwirkung',
                'description_de': 'Die lernende Person kann semiklassische Wechselwirkungen und Quantenzustände des Lichts beschreiben.',
            },
            'Semi-classical light-matter interaction': {
                'title_de': 'Semiklassische Licht-Materie-Wechselwirkung',
                'description_de': 'Die lernende Person kann semiklassische Modelle der Licht-Materie-Wechselwirkung erklären.',
            },
            'Quantum states of light': {
                'title_de': 'Quantenzustände des Lichts',
                'description_de': 'Die lernende Person kann kohärente, gequetschte und weitere nichtklassische Zustände beschreiben.',
            },
            'Cavity QED and atom-photon models': {
                'title_de': 'Hohlraum-QED und Atom-Photon-Modelle',
                'description_de': 'Die lernende Person kann Hohlraum-QED-Modelle auf Atom-Photon-Wechselwirkungen anwenden.',
            },
            'Jaynes-Cummings model': {
                'title_de': 'Jaynes-Cummings-Modell',
                'description_de': 'Die lernende Person kann das Jaynes-Cummings-Modell herleiten und interpretieren.',
            },
            'Cavity QED effects': {
                'title_de': 'Hohlraum-QED-Effekte',
                'description_de': 'Die lernende Person kann starke Kopplungseffekte in der Hohlraum-QED erklären.',
            },
            'Open quantum systems': {
                'title_de': 'Offene Quantensysteme',
                'description_de': 'Die lernende Person kann Dissipation und Rauschen in quantenoptischen Systemen modellieren.',
            },
            'Master equation techniques': {
                'title_de': 'Mastergleichungs-Methoden',
                'description_de': 'Die lernende Person kann Mastergleichungen für offene Systemdynamik anwenden.',
            },
            'Quantum Langevin equations': {
                'title_de': 'Quanten-Langevin-Gleichungen',
                'description_de': 'Die lernende Person kann Langevin-Gleichungen zur Beschreibung von Rauschen verwenden.',
            },
            'Quantum optical effects and measurements': {
                'title_de': 'Quantenoptische Effekte und Messungen',
                'description_de': 'Die lernende Person kann Photodetektion, Korrelationen und nichtlineare Prozesse analysieren.',
            },
            'Photodetection and correlations': {
                'title_de': 'Photodetektion und Korrelationen',
                'description_de': 'Die lernende Person kann Korrelationsfunktionen berechnen und Messschemata interpretieren.',
            },
            'Nonlinear processes and EIT': {
                'title_de': 'Nichtlineare Prozesse und EIT',
                'description_de': 'Die lernende Person kann nichtlineare Prozesse, EIT und langsames Licht erklären.',
            },
            'Optomechanics and laser cooling': {
                'title_de': 'Optomechanik und Laserkühlung',
                'description_de': 'Die lernende Person kann quantenoptische Werkzeuge auf optomechanische Systeme anwenden.',
            },
            'Optomechanical systems': {
                'title_de': 'Optomechanische Systeme',
                'description_de': 'Die lernende Person kann optomechanische Kopplung und Dynamik beschreiben.',
            },
            'Laser cooling and trapping': {
                'title_de': 'Laserkühlung und -einfang',
                'description_de': 'Die lernende Person kann Mechanismen der Laserkühlung und des Einfangs erklären.',
            },
            'Phase-space methods and laser theory': {
                'title_de': 'Phasenraum-Methoden und Lasertheorie',
                'description_de': 'Die lernende Person kann Phasenraum-Methoden nutzen und Lasertheorie verstehen.',
            },
            'Phase-space methods': {
                'title_de': 'Phasenraum-Methoden',
                'description_de': 'Die lernende Person kann Phasenraumdarstellungen in der Quantenoptik anwenden.',
            },
            'Laser theory': {
                'title_de': 'Lasertheorie',
                'description_de': 'Die lernende Person kann Grundzüge der Lasertheorie und Schwellverhalten erklären.',
            },
            'Numerical simulation of quantum optics': {
                'title_de': 'Numerische Simulation der Quantenoptik',
                'description_de': 'Die lernende Person kann quantenoptische Systeme numerisch simulieren.',
            },
            'Numerical modeling with Python or Matlab': {
                'title_de': 'Numerische Modellierung mit Python oder Matlab',
                'description_de': 'Die lernende Person kann quantenoptische Dynamik mit Standardwerkzeugen simulieren.',
            },
        },
        'requires': {
            'tum_nat3013_cavity_qed_and_atom_photon_models': ['tum_nat3013_light_matter_interaction_fundamentals'],
            'tum_nat3013_open_quantum_systems': ['tum_nat3013_light_matter_interaction_fundamentals'],
            'tum_nat3013_quantum_optical_effects_and_measurements': ['tum_nat3013_open_quantum_systems'],
            'tum_nat3013_optomechanics_and_laser_cooling': ['tum_nat3013_light_matter_interaction_fundamentals'],
            'tum_nat3013_phase_space_methods_and_laser_theory': ['tum_nat3013_open_quantum_systems'],
            'tum_nat3013_numerical_simulation_of_quantum_optics': ['tum_nat3013_open_quantum_systems'],
            'tum_nat3013_cavity_qed_effects': ['tum_nat3013_jaynes_cummings_model'],
            'tum_nat3013_quantum_langevin_equations': ['tum_nat3013_master_equation_techniques'],
            'tum_nat3013_laser_theory': ['tum_nat3013_phase_space_methods'],
        },
    },
    'NAT5018m': {
        'meta': {
            'title': 'Verschränkung in Vielteilchensystemen (TUM, Modul NAT5018m)',
            'title_en': 'Entanglement in Many-Body System (TUM, Module NAT5018m)',
            'description': (
                'Seminar zu Verschränkung in Vielteilchensystemen mit Schwerpunkten auf Entanglement-Maßen, Area-Laws, '
                'Matrixproduktzuständen sowie topologischer Verschränkung. Studierende erarbeiten Themen und präsentieren Ergebnisse.'
            ),
            'description_en': (
                'Seminar on entanglement in many-body systems focusing on entanglement measures, area laws, matrix product states, '
                'and topological entanglement. Students develop topics and present results.'
            ),
            'framework_id': 'tum-nat5018m',
        },
        'translations': {
            'Entanglement in Many-Body System (NAT5018m)': {
                'title_de': 'Verschränkung in Vielteilchensystemen (NAT5018m)',
                'description_de': 'Die lernende Person kann Verschränkung in Vielteilchensystemen analysieren und Forschungsergebnisse im Seminar kommunizieren.',
            },
            'Entanglement measures and diagnostics': {
                'title_de': 'Verschränkungsmaße und Diagnostik',
                'description_de': 'Die lernende Person kann quantitative Maße zur Charakterisierung von Verschränkung nutzen.',
            },
            'Measures of entanglement': {
                'title_de': 'Verschränkungsmaße',
                'description_de': 'Die lernende Person kann grundlegende Verschränkungsmaße definieren und vergleichen.',
            },
            'Computable measures and entanglement negativity': {
                'title_de': 'Berechenbare Maße und Verschränkungsnegativität',
                'description_de': 'Die lernende Person kann berechenbare Maße wie die Verschränkungsnegativität anwenden.',
            },
            'Entanglement structure in one-dimensional systems': {
                'title_de': 'Verschränkungsstruktur in eindimensionalen Systemen',
                'description_de': 'Die lernende Person kann Verschränkungsstrukturen in 1D-Systemen und Tensor-Netzwerken einordnen.',
            },
            'Area laws and matrix product states': {
                'title_de': 'Flächengesetze und Matrixproduktzustände',
                'description_de': 'Die lernende Person kann Flächengesetze und MPS-Darstellungen in 1D-Systemen erklären.',
            },
            'Entanglement spectra in one dimension': {
                'title_de': 'Verschränkungsspektren in einer Dimension',
                'description_de': 'Die lernende Person kann Verschränkungsspektren für 1D-Phasen interpretieren.',
            },
            'Topological entanglement and order': {
                'title_de': 'Topologische Verschränkung und Ordnung',
                'description_de': 'Die lernende Person kann entanglement-basierte Diagnostik topologischer Phasen erläutern.',
            },
            'Topological entanglement entropy': {
                'title_de': 'Topologische Verschränkungsentropie',
                'description_de': 'Die lernende Person kann topologische Verschränkungsentropie erklären und einordnen.',
            },
            'Detecting topological order via entanglement': {
                'title_de': 'Topologische Ordnung über Verschränkung nachweisen',
                'description_de': 'Die lernende Person kann Verfahren beschreiben, die topologische Ordnung über Verschränkung sichtbar machen.',
            },
            'Research and presentation skills': {
                'title_de': 'Recherche- und Präsentationskompetenzen',
                'description_de': 'Die lernende Person kann Seminarinhalte recherchieren und effektiv präsentieren.',
            },
            'Literature review and topic synthesis': {
                'title_de': 'Literaturrecherche und Themenaufbereitung',
                'description_de': 'Die lernende Person kann Literatur auswerten und ein Thema strukturiert aufbereiten.',
            },
            'Scientific presentation and discussion': {
                'title_de': 'Wissenschaftliche Präsentation und Diskussion',
                'description_de': 'Die lernende Person kann Ergebnisse klar präsentieren und fachlich diskutieren.',
            },
        },
        'requires': {
            'tum_nat5018m_entanglement_structure_in_one_dimensional_systems': ['tum_nat5018m_entanglement_measures_and_diagnostics'],
            'tum_nat5018m_topological_entanglement_and_order': ['tum_nat5018m_entanglement_measures_and_diagnostics'],
            'tum_nat5018m_entanglement_spectra_in_one_dimension': ['tum_nat5018m_area_laws_and_matrix_product_states'],
            'tum_nat5018m_detecting_topological_order_via_entanglement': ['tum_nat5018m_topological_entanglement_entropy'],
            'tum_nat5018m_scientific_presentation_and_discussion': ['tum_nat5018m_literature_review_and_topic_synthesis'],
        },
    },
    'NAT5020m': {
        'meta': {
            'title': 'Fortgeschrittene Themen in der Theorie der Quantenmaterie (TUM, Modul NAT5020m)',
            'title_en': 'Advanced Topics in the Theory of Quantum Matter (TUM, Module NAT5020m)',
            'description': (
                'Das Modul behandelt fortgeschrittene Themen der nichtgleichgewichtigen Vielteilchenphysik, '
                'darunter Boltzmann-Transport, Integrabilität, Hydrodynamik und Thermalisation, ergänzt durch Seminarpräsentationen.'
            ),
            'description_en': (
                'The module covers advanced topics in non-equilibrium many-body physics, including Boltzmann transport, '
                'integrability, hydrodynamics, and thermalization, complemented by seminar presentations.'
            ),
            'framework_id': 'tum-nat5020m',
        },
        'translations': {
            'Advanced Topics in the Theory of Quantum Matter (NAT5020m)': {
                'title_de': 'Fortgeschrittene Themen in der Theorie der Quantenmaterie (NAT5020m)',
                'description_de': 'Die lernende Person kann fortgeschrittene Themen der Quantenmaterie analysieren und Forschungsergebnisse präsentieren.',
            },
            'Semiclassical dynamics and Boltzmann transport': {
                'title_de': 'Semiklassische Dynamik und Boltzmann-Transport',
                'description_de': 'Die lernende Person kann kinetische Theorie für Transport in klassischen und quantenmechanischen Systemen anwenden.',
            },
            'Boltzmann equation and transport': {
                'title_de': 'Boltzmann-Gleichung und Transport',
                'description_de': 'Die lernende Person kann die Boltzmann-Gleichung für Teilchen-, Ladungs- und Energietransport nutzen.',
            },
            'Linear response and topological effects': {
                'title_de': 'Lineare Antwort und topologische Effekte',
                'description_de': 'Die lernende Person kann kinetische Theorie mit linearer Antwort und topologischen Effekten verknüpfen.',
            },
            'Integrable models out of equilibrium': {
                'title_de': 'Integrable Modelle außerhalb des Gleichgewichts',
                'description_de': 'Die lernende Person kann Konzepte der Integrabilität für nichtgleichgewichtigen Transport anwenden.',
            },
            'Integrability and transport in 1D systems': {
                'title_de': 'Integrabilität und Transport in 1D-Systemen',
                'description_de': 'Die lernende Person kann integrabilitätsbasierten Transport in Vielteilchensystemen erklären.',
            },
            'Generalized hydrodynamics': {
                'title_de': 'Generalisierte Hydrodynamik',
                'description_de': 'Die lernende Person kann die Grundidee der generalisierten Hydrodynamik skizzieren.',
            },
            'Hydrodynamic transport in constrained systems': {
                'title_de': 'Hydrodynamischer Transport in beschränkten Systemen',
                'description_de': 'Die lernende Person kann Transport in Systemen mit Erhaltungseinschränkungen analysieren.',
            },
            'Diffusive and unconventional hydrodynamics': {
                'title_de': 'Diffusive und ungewöhnliche Hydrodynamik',
                'description_de': 'Die lernende Person kann diffusive und ungewöhnliche Hydrodynamik voneinander unterscheiden.',
            },
            'Methods for constrained transport': {
                'title_de': 'Methoden für Transport in beschränkten Systemen',
                'description_de': 'Die lernende Person kann Methoden für hydrodynamischen Transport in beschränkten Systemen zusammenfassen.',
            },
            'Quantum many-body dynamics and thermalization': {
                'title_de': 'Quanten-Vielteilchendynamik und Thermalisation',
                'description_de': 'Die lernende Person kann Thermalisation und deren Ausbleiben in Vielteilchensystemen analysieren.',
            },
            'Thermalization signatures and ETH': {
                'title_de': 'Thermalisationssignaturen und ETH',
                'description_de': 'Die lernende Person kann Thermalisation und die Eigenzustandsthermalisierungshypothese erläutern.',
            },
            'Avoiding thermalization (MBL, scars)': {
                'title_de': 'Thermalisation vermeiden (MBL, Scars)',
                'description_de': 'Die lernende Person kann Mechanismen wie Many-Body-Localization und Quanten-Scars beschreiben.',
            },
            'Research and presentation skills': {
                'title_de': 'Recherche- und Präsentationskompetenzen',
                'description_de': 'Die lernende Person kann Literatur recherchieren und fortgeschrittene Themen präsentieren.',
            },
            'Literature research and topic framing': {
                'title_de': 'Literaturrecherche und Themenfokussierung',
                'description_de': 'Die lernende Person kann ein Thema anhand von Forschungsliteratur fokussieren.',
            },
            'Seminar presentation and discussion': {
                'title_de': 'Seminarpräsentation und Diskussion',
                'description_de': 'Die lernende Person kann fortgeschrittene Inhalte präsentieren und diskutieren.',
            },
        },
        'requires': {
            'tum_nat5020m_generalized_hydrodynamics': ['tum_nat5020m_integrability_and_transport_in_1d_systems'],
            'tum_nat5020m_methods_for_constrained_transport': ['tum_nat5020m_diffusive_and_unconventional_hydrodynamics'],
            'tum_nat5020m_avoiding_thermalization_mbl_scars': ['tum_nat5020m_thermalization_signatures_and_eth'],
            'tum_nat5020m_seminar_presentation_and_discussion': ['tum_nat5020m_literature_research_and_topic_framing'],
        },
    },
    'NAT7011': {
        'meta': {
            'title': 'Festkörper-Quantenvielteilchenphysik und Feldtheorie 2 (TUM, Modul NAT7011)',
            'title_en': 'Condensed Matter Many-Body Physics and Field Theory 2 (TUM, Module NAT7011)',
            'description': (
                'Die Vorlesung behandelt fortgeschrittene Themen der Vielteilchenphysik und Feldtheorie in der Festkörperphysik, '
                'einschließlich RG, linearer Antwort, Supraleitung, Magnetismus, topologischer Phasen und starker Korrelationen.'
            ),
            'description_en': (
                'The lecture covers advanced topics in condensed matter many-body physics and field theory, '
                'including RG, linear response, superconductivity, magnetism, topological phases, and strong correlations.'
            ),
            'framework_id': 'tum-nat7011',
        },
        'translations': {
            'Condensed Matter Many-Body Physics and Field Theory 2 (NAT7011)': {
                'title_de': 'Festkörper-Quantenvielteilchenphysik und Feldtheorie 2 (NAT7011)',
                'description_de': 'Die lernende Person kann feldtheoretische Werkzeuge auf fortgeschrittene Probleme der Vielteilchenphysik anwenden.',
            },
            'Field-theory tools and renormalization': {
                'title_de': 'Feldtheoretische Werkzeuge und Renormalisierung',
                'description_de': 'Die lernende Person kann Pfadintegrale, Diagramme und RG-Methoden einsetzen.',
            },
            'Path integrals and diagrammatic techniques': {
                'title_de': 'Pfadintegrale und diagrammatische Techniken',
                'description_de': 'Die lernende Person kann Pfadintegrale und Feynman-Diagramme für Vielteilchensysteme verwenden.',
            },
            'Renormalization group flows and fixed points': {
                'title_de': 'Renormierungsgruppenflüsse und Fixpunkte',
                'description_de': 'Die lernende Person kann RG-Transformationen erklären und perturbative Rechnungen durchführen.',
            },
            'Fermi liquids and linear response': {
                'title_de': 'Fermi-Flüssigkeiten und lineare Antwort',
                'description_de': 'Die lernende Person kann geladene Fermi-Flüssigkeiten und Transportantwort analysieren.',
            },
            'Charged Fermi liquids and screening': {
                'title_de': 'Geladene Fermi-Flüssigkeiten und Abschirmung',
                'description_de': 'Die lernende Person kann RPA-Abschirmung und Plasmamoden analysieren.',
            },
            'Linear response theory and Kubo formalism': {
                'title_de': 'Lineare Antworttheorie und Kubo-Formalismus',
                'description_de': 'Die lernende Person kann Antwortfunktionen und Kubo-Formeln für Transport nutzen.',
            },
            'Superconductivity and charged superfluids': {
                'title_de': 'Supraleitung und geladene Suprafluide',
                'description_de': 'Die lernende Person kann BCS-Theorie und Ginzburg-Landau-Beschreibungen analysieren.',
            },
            'BCS theory and mean-field approaches': {
                'title_de': 'BCS-Theorie und Mean-Field-Ansätze',
                'description_de': 'Die lernende Person kann BCS-Theorie und Mean-Field-Methoden formulieren.',
            },
            'Ginzburg-Landau theory and Anderson-Higgs mechanism': {
                'title_de': 'Ginzburg-Landau-Theorie und Anderson-Higgs-Mechanismus',
                'description_de': 'Die lernende Person kann Meissner-Effekt und Anderson-Higgs-Mechanismus erklären.',
            },
            'Quantum magnetism and Hubbard models': {
                'title_de': 'Quantenmagnetismus und Hubbard-Modelle',
                'description_de': 'Die lernende Person kann Magnetismus in Hubbard- und Heisenberg-Systemen modellieren.',
            },
            'Hubbard and Heisenberg models': {
                'title_de': 'Hubbard- und Heisenberg-Modelle',
                'description_de': 'Die lernende Person kann Phasen der Hubbard- und Heisenberg-Modelle analysieren.',
            },
            'Field-theory approaches and RVB states': {
                'title_de': 'Feldtheoretische Ansätze und RVB-Zustände',
                'description_de': 'Die lernende Person kann Sigma-Modelle und RVB-Konzepte auf frustrierte Magneten anwenden.',
            },
            'Topological phases and quantum Hall physics': {
                'title_de': 'Topologische Phasen und Quanten-Hall-Physik',
                'description_de': 'Die lernende Person kann topologische Ordnung und Quanten-Hall-Effekte analysieren.',
            },
            'Topological invariants and edge states': {
                'title_de': 'Topologische Invarianten und Randzustände',
                'description_de': 'Die lernende Person kann Berry-/Zak-Phasen berechnen und Randzustände einordnen.',
            },
            'Integer and fractional quantum Hall effects': {
                'title_de': 'Integerer und fraktionaler Quanten-Hall-Effekt',
                'description_de': 'Die lernende Person kann QHE-Phänomene und Chern-Simons-Beschreibungen erklären.',
            },
            'Strong correlations and lattice gauge theories': {
                'title_de': 'Starke Korrelationen und Gittereichtheorien',
                'description_de': 'Die lernende Person kann Kondo-Physik und exotische korrelierte Systeme analysieren.',
            },
            'Kondo physics and heavy fermions': {
                'title_de': 'Kondo-Physik und schwere Fermionen',
                'description_de': 'Die lernende Person kann Kondo-Abschirmung und schwere Fermionen erklären.',
            },
            'Lattice gauge theories and doped Hubbard model': {
                'title_de': 'Gittereichtheorien und dotiertes Hubbard-Modell',
                'description_de': 'Die lernende Person kann Gittereichtheorien und dotierte Hubbard-Systeme beschreiben.',
            },
        },
        'requires': {
            'tum_nat7011_fermi_liquids_and_linear_response': ['tum_nat7011_field_theory_tools_and_renormalization'],
            'tum_nat7011_superconductivity_and_charged_superfluids': ['tum_nat7011_fermi_liquids_and_linear_response'],
            'tum_nat7011_quantum_magnetism_and_hubbard_models': ['tum_nat7011_field_theory_tools_and_renormalization'],
            'tum_nat7011_topological_phases_and_quantum_hall_physics': ['tum_nat7011_field_theory_tools_and_renormalization'],
            'tum_nat7011_strong_correlations_and_lattice_gauge_theories': ['tum_nat7011_quantum_magnetism_and_hubbard_models'],
            'tum_nat7011_renormalization_group_flows_and_fixed_points': ['tum_nat7011_path_integrals_and_diagrammatic_techniques'],
            'tum_nat7011_linear_response_theory_and_kubo_formalism': ['tum_nat7011_charged_fermi_liquids_and_screening'],
            'tum_nat7011_ginzburg_landau_theory_and_anderson_higgs_mechanism': ['tum_nat7011_bcs_theory_and_mean_field_approaches'],
            'tum_nat7011_field_theory_approaches_and_rvb_states': ['tum_nat7011_hubbard_and_heisenberg_models'],
            'tum_nat7011_integer_and_fractional_quantum_hall_effects': ['tum_nat7011_topological_invariants_and_edge_states'],
            'tum_nat7011_lattice_gauge_theories_and_doped_hubbard_model': ['tum_nat7011_kondo_physics_and_heavy_fermions'],
        },
    },
    'NAT7030': {
        'meta': {
            'title': 'Quantencomputing und Quantenfehlerkorrektur aus experimenteller Sicht (TUM, Modul NAT7030)',
            'title_en': 'Experimental Quantum Computing and Quantum Error Correction (TUM, Module NAT7030)',
            'description': (
                'Das Modul vermittelt experimentelle Grundlagen des Quantencomputings und der Quanten-Fehlerkorrektur, '
                'einschließlich Plattformen, Fehlermodelle, Codes und fehlertoleranter Implementierung.'
            ),
            'description_en': (
                'The module introduces experimental quantum computing and quantum error correction, '
                'including platforms, error models, codes, and fault-tolerant implementation.'
            ),
            'framework_id': 'tum-nat7030',
        },
        'translations': {
            'Experimental Quantum Computing and Quantum Error Correction (NAT7030)': {
                'title_de': 'Quantencomputing und Quantenfehlerkorrektur aus experimenteller Sicht (NAT7030)',
                'description_de': 'Die lernende Person kann experimentelle Quantenplattformen erklären und Fehlerkorrekturkonzepte anwenden.',
            },
            'Quantum circuits and gate operations': {
                'title_de': 'Quantenschaltungen und Gatteroperationen',
                'description_de': 'Die lernende Person kann Qubits, Gatter und Schaltungsmodelle für Experimente beschreiben.',
            },
            'Qubits, gates, and circuit descriptions': {
                'title_de': 'Qubits, Gatter und Schaltungsbeschreibungen',
                'description_de': 'Die lernende Person kann elementare Gatter und Schaltungen beschreiben.',
            },
            'Universal gate sets and logical operations': {
                'title_de': 'Universelle Gattermengen und logische Operationen',
                'description_de': 'Die lernende Person kann universelle Gattermengen und logische Operationen erläutern.',
            },
            'Quantum computing hardware platforms': {
                'title_de': 'Quantencomputing-Hardwareplattformen',
                'description_de': 'Die lernende Person kann führende experimentelle Plattformen vergleichen.',
            },
            'Superconducting qubits': {
                'title_de': 'Supraleitende Qubits',
                'description_de': 'Die lernende Person kann Architekturen und Kontrolle supraleitender Qubits skizzieren.',
            },
            'Trapped ions and neutral atoms': {
                'title_de': 'Gefangene Ionen und neutrale Atome',
                'description_de': 'Die lernende Person kann Ionenfallen- und Neutralatom-Plattformen beschreiben.',
            },
            'Quantum error models': {
                'title_de': 'Quanten-Fehlermodelle',
                'description_de': 'Die lernende Person kann Rauschquellen und Fehlerkanäle in Experimenten beschreiben.',
            },
            'Error channels and noise characterization': {
                'title_de': 'Fehlerkanäle und Rauschcharakterisierung',
                'description_de': 'Die lernende Person kann Fehler modellieren und Rauschen charakterisieren.',
            },
            'Syndrome extraction and diagnostics': {
                'title_de': 'Syndromextraktion und Diagnostik',
                'description_de': 'Die lernende Person kann Syndrommessungen und Diagnostik erklären.',
            },
            'Quantum error correction codes': {
                'title_de': 'Quanten-Fehlerkorrekturcodes',
                'description_de': 'Die lernende Person kann experimentelle Codes vergleichen und Fehlertoleranz einordnen.',
            },
            'Repetition, surface, and color codes': {
                'title_de': 'Wiederholungs-, Surface- und Color-Codes',
                'description_de': 'Die lernende Person kann gängige Codes aus Experimenten beschreiben.',
            },
            'qLDPC codes and fault-tolerant thresholds': {
                'title_de': 'qLDPC-Codes und fehlertolerante Schwellen',
                'description_de': 'Die lernende Person kann qLDPC-Codes und Fehlertoleranzschwellen erläutern.',
            },
            'Experimental progress and evaluation': {
                'title_de': 'Experimentelle Fortschritte und Bewertung',
                'description_de': 'Die lernende Person kann aktuelle experimentelle Fortschritte in der Fehlerkorrektur bewerten.',
            },
            'Evaluating experimental QEC demonstrations': {
                'title_de': 'Bewertung experimenteller QEC-Demonstrationen',
                'description_de': 'Die lernende Person kann Experimente beurteilen und ihre Grenzen diskutieren.',
            },
        },
        'requires': {
            'tum_nat7030_quantum_computing_hardware_platforms': ['tum_nat7030_quantum_circuits_and_gate_operations'],
            'tum_nat7030_quantum_error_models': ['tum_nat7030_quantum_circuits_and_gate_operations'],
            'tum_nat7030_quantum_error_correction_codes': ['tum_nat7030_quantum_error_models'],
            'tum_nat7030_experimental_progress_and_evaluation': ['tum_nat7030_quantum_error_correction_codes'],
            'tum_nat7030_universal_gate_sets_and_logical_operations': ['tum_nat7030_qubits_gates_and_circuit_descriptions'],
            'tum_nat7030_syndrome_extraction_and_diagnostics': ['tum_nat7030_error_channels_and_noise_characterization'],
            'tum_nat7030_qldpc_codes_and_fault_tolerant_thresholds': ['tum_nat7030_repetition_surface_and_color_codes'],
        },
    },
}

for code, cfg in MODULES.items():
    meta = parse_raw_meta(code)
    module_meta = cfg['meta']
    module_meta = {
        **module_meta,
        'ects': meta['ects'],
    }

    goals = build_goals(code, module_meta, cfg['translations'], cfg['requires'])

    landscape = {
        'title': module_meta['title'],
        'titleEn': module_meta['title_en'],
        'description': module_meta['description'],
        'descriptionEn': module_meta['description_en'],
        'locale': 'de-DE',
        'subject': 'TUM-Module',
        'frameworkId': module_meta['framework_id'],
        'goals': goals,
    }

    out_path = JSON_DIR / f'DE_BAY_U_TUM_{code}.de.json'
    out_path.write_text(json.dumps(landscape, ensure_ascii=False, indent=4) + '\n', encoding='utf-8')
    print(f'Wrote {out_path}')
