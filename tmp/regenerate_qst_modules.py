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
    slug = text.lower()
    slug = slug.replace('&', 'and')
    slug = re.sub(r"[^a-z0-9]+", "_", slug)
    slug = slug.strip('_')
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

    # Build parent-child relationships using a stack
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

    # Assign shortKeys deterministically
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

    # Add ECTS tag + sourceRef to root
    if goals:
        root = goals[0]
        if module_meta['ects']:
            root['tags'].append(f"ects:{module_meta['ects']}")
        root['sourceRef'] = f"https://academics.nat.tum.de/org/mh/details/mod/{code}"

    # Apply requires
    short_key_to_index = {g['shortKey']: i for i, g in enumerate(goals)}
    for short_key, reqs in requires_map.items():
        if short_key not in short_key_to_index:
            raise SystemExit(f"Missing shortKey in requires map ({code}): {short_key}")
        goal = goals[short_key_to_index[short_key]]
        goal['requires'] = [id_map[req] for req in reqs]

    return goals


MODULES = {
    'MA3001': {
        'meta': {
            'title': 'Funktionalanalysis (TUM, Modul MA3001)',
            'title_en': 'Functional Analysis (TUM, Module MA3001)',
            'description': (
                'Das Modul Funktionalanalysis behandelt Banach- und Hilbert-Räume, '
                'beschränkte lineare Operatoren und zentrale Sätze wie den Satz der offenen Abbildung. '
                'Es umfasst Dualität und Hahn-Banach, schwache und schwach* Konvergenz, '
                'Spektraltheorie kompakter selbstadjungierter Operatoren sowie eine Einführung in unbeschränkte Operatoren.'
            ),
            'description_en': (
                'The module Functional Analysis covers Banach and Hilbert spaces, bounded linear operators '
                'and key theorems such as the open mapping theorem. It includes duality and Hahn-Banach, '
                'weak and weak* convergence, spectral theory of compact selfadjoint operators, and an introduction to unbounded operators.'
            ),
            'framework_id': 'tum-ma3001',
        },
        'translations': {
            'Functional Analysis (MA3001)': {
                'title_de': 'Funktionalanalysis (MA3001)',
                'description_de': 'Die lernende Person kann zentrale Werkzeuge der Funktionalanalysis nutzen, um lineare Funktionale und Operatoren auf Banach- und Hilbert-Räumen zu untersuchen.',
            },
            'Normed, Banach, and Hilbert spaces': {
                'title_de': 'Normierte, Banach- und Hilbert-Räume',
                'description_de': 'Die lernende Person kann normierte Räume definieren und Banach- sowie Hilbert-Strukturen unterscheiden.',
            },
            'Banach spaces and completeness': {
                'title_de': 'Banachräume und Vollständigkeit',
                'description_de': 'Die lernende Person kann Vollständigkeit erklären und Banachraum-Eigenschaften in Beispielen nachweisen.',
            },
            'Hilbert spaces, inner products, and orthogonality': {
                'title_de': 'Hilberträume, Skalarprodukte und Orthogonalität',
                'description_de': 'Die lernende Person kann mit Skalarprodukten, Orthogonalität und Projektionen in Hilberträumen arbeiten.',
            },
            'Bounded linear operators and fundamental theorems': {
                'title_de': 'Beschränkte lineare Operatoren und grundlegende Sätze',
                'description_de': 'Die lernende Person kann beschränkte lineare Operatoren analysieren und zentrale Existenzsätze anwenden.',
            },
            'Bounded operators and operator norms': {
                'title_de': 'Beschränkte Operatoren und Operatornormen',
                'description_de': 'Die lernende Person kann Operatornormen berechnen und Beschränktheit bestimmen.',
            },
            'Open mapping and bounded inverse theorems': {
                'title_de': 'Satz der offenen Abbildung und Satz vom beschränkten Inversen',
                'description_de': 'Die lernende Person kann den Satz der offenen Abbildung und seine Folgerungen anwenden.',
            },
            'Duality and Hahn-Banach': {
                'title_de': 'Dualität und Hahn-Banach',
                'description_de': 'Die lernende Person kann Dualräume und Erweiterungssätze für lineare Funktionale nutzen.',
            },
            'Dual spaces and linear functionals': {
                'title_de': 'Dualräume und lineare Funktionale',
                'description_de': 'Die lernende Person kann Dualräume identifizieren und lineare Funktionale interpretieren.',
            },
            'Hahn-Banach extension theorems': {
                'title_de': 'Hahn-Banach-Fortsetzungssätze',
                'description_de': 'Die lernende Person kann Hahn-Banach zur Fortsetzung von Funktionalen und zur Separierung von Mengen anwenden.',
            },
            'Weak and weak* convergence': {
                'title_de': 'Schwache und schwach* Konvergenz',
                'description_de': 'Die lernende Person kann schwache und schwach* Topologien und Konvergenz analysieren.',
            },
            'Weak convergence in Banach spaces': {
                'title_de': 'Schwache Konvergenz in Banachräumen',
                'description_de': 'Die lernende Person kann schwache Konvergenz mithilfe beschränkter linearer Funktionale testen.',
            },
            'Weak* convergence and duality': {
                'title_de': 'Schwach* Konvergenz und Dualität',
                'description_de': 'Die lernende Person kann schwache und schwach* Konvergenz unterscheiden und Kompaktheitsergebnisse nutzen.',
            },
            'Spectral theory of compact selfadjoint operators': {
                'title_de': 'Spektraltheorie kompakter selbstadjungierter Operatoren',
                'description_de': 'Die lernende Person kann Spektren kompakter selbstadjungierter Operatoren in Hilberträumen analysieren.',
            },
            'Compact operators and spectral properties': {
                'title_de': 'Kompakte Operatoren und spektrale Eigenschaften',
                'description_de': 'Die lernende Person kann kompakte Operatoren charakterisieren und deren Spektrum bestimmen.',
            },
            'Selfadjoint operators and spectral decompositions': {
                'title_de': 'Selbstadjungierte Operatoren und Spektralzerlegungen',
                'description_de': 'Die lernende Person kann die Spektralzerlegung kompakter selbstadjungierter Operatoren anwenden.',
            },
            'Introduction to unbounded operators': {
                'title_de': 'Einführung in unbeschränkte Operatoren',
                'description_de': 'Die lernende Person kann grundlegende Begriffe unbeschränkter Operatoren und ihrer Definitionsbereiche erläutern.',
            },
        },
        'requires': {
            'tum_ma3001_bounded_linear_operators_and_fundamental_theorems': ['tum_ma3001_normed_banach_and_hilbert_spaces'],
            'tum_ma3001_duality_and_hahn_banach': ['tum_ma3001_normed_banach_and_hilbert_spaces'],
            'tum_ma3001_weak_and_weak_convergence': ['tum_ma3001_duality_and_hahn_banach'],
            'tum_ma3001_spectral_theory_of_compact_selfadjoint_operators': ['tum_ma3001_bounded_linear_operators_and_fundamental_theorems'],
            'tum_ma3001_introduction_to_unbounded_operators': ['tum_ma3001_bounded_linear_operators_and_fundamental_theorems'],
            'tum_ma3001_hilbert_spaces_inner_products_and_orthogonality': ['tum_ma3001_banach_spaces_and_completeness'],
            'tum_ma3001_open_mapping_and_bounded_inverse_theorems': ['tum_ma3001_bounded_operators_and_operator_norms'],
            'tum_ma3001_hahn_banach_extension_theorems': ['tum_ma3001_dual_spaces_and_linear_functionals'],
            'tum_ma3001_weak_convergence_in_banach_spaces': [],
            'tum_ma3001_weak_convergence_and_duality': ['tum_ma3001_weak_convergence_in_banach_spaces'],
            'tum_ma3001_selfadjoint_operators_and_spectral_decompositions': ['tum_ma3001_compact_operators_and_spectral_properties'],
        },
    },
    'IN2381': {
        'meta': {
            'title': 'Einführung in Quantum Computing (TUM, Modul IN2381)',
            'title_en': 'Introduction to Quantum Computing (TUM, Module IN2381)',
            'description': (
                'Das Modul führt in den mathematischen Formalismus der Quantenmechanik für das Quantencomputing ein '
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
                'title_de': 'Quantenmechanischer Formalismus für das Quantencomputing',
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
                'title_de': 'Anwendungsfälle und Grenzen des Quantencomputings',
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
    'NAT5040m': {
        'meta': {
            'title': 'Seminar: Fortgeschrittene Themen des Quantencomputings (TUM, Modul NAT5040m)',
            'title_en': 'Seminar: Topics of Quantum Computing (TUM, Module NAT5040m)',
            'description': (
                'Im Seminar werden fortgeschrittene Themen des Quantencomputings anhand aktueller Forschung behandelt. '
                'Studierende wählen ein Thema (z. B. Hardware, Simulation, Tensornetzwerke, Qubitisierung, variationale Algorithmen, '
                'Optimierung, Fehlerkorrektur, Quantenautomaten, Kryptographie), analysieren Methoden, implementieren oder simulieren Ansätze '
                'und präsentieren Ergebnisse.'
            ),
            'description_en': (
                'The seminar covers advanced topics in quantum computing based on current research. '
                'Students select a topic (e.g., hardware, simulation, tensor networks, qubitization, variational algorithms, '
                'optimization, error correction, cellular automata, cryptography), analyze methods, implement or simulate approaches, '
                'and present results.'
            ),
            'framework_id': 'tum-nat5040m',
        },
        'translations': {
            'Seminar: Advanced Topics of Quantum Computing (NAT5040m)': {
                'title_de': 'Seminar: Fortgeschrittene Themen des Quantencomputings (NAT5040m)',
                'description_de': 'Die lernende Person kann ein fortgeschrittenes Thema des Quantencomputings untersuchen, theoretisch analysieren und Ergebnisse kommunizieren.',
            },
            'Seminar orientation and goals': {
                'title_de': 'Seminarausrichtung und Ziele',
                'description_de': 'Die lernende Person kann übergeordnete Ziele und Herausforderungen im Quantencomputing erklären.',
            },
            'Quantum computing landscape and challenges': {
                'title_de': 'Landschaft und Herausforderungen des Quantencomputings',
                'description_de': 'Die lernende Person kann zentrale Herausforderungen wie Skalierung, Rauschen und algorithmische Grenzen zusammenfassen.',
            },
            'Advanced topic exploration': {
                'title_de': 'Erkundung fortgeschrittener Themen',
                'description_de': 'Die lernende Person kann ein ausgewähltes fortgeschrittenes Thema vertiefen und einordnen.',
            },
            'Quantum hardware and physical realizations': {
                'title_de': 'Quantenhardware und physikalische Realisierungen',
                'description_de': 'Die lernende Person kann wichtige Hardware-Plattformen und ihre Trade-offs beschreiben.',
            },
            'Quantum circuits and models of computation': {
                'title_de': 'Quantenschaltungen und Rechenmodelle',
                'description_de': 'Die lernende Person kann Schaltungsmodelle erklären, die in fortgeschrittenen Algorithmen verwendet werden.',
            },
            'Quantum simulation': {
                'title_de': 'Quantensimulation',
                'description_de': 'Die lernende Person kann die Simulation von Quantensystemen mit Quantencomputern erklären.',
            },
            'Tensor network methods': {
                'title_de': 'Tensornetzwerkmethoden',
                'description_de': 'Die lernende Person kann Tensornetzwerk-Ansätze für Simulation und Kompression erläutern.',
            },
            'Qubitization and quantum eigenvalue transformation': {
                'title_de': 'Qubitisierung und Quanteneigenwerttransformation',
                'description_de': 'Die lernende Person kann Qubitisierung und QET als algorithmische Bausteine skizzieren.',
            },
            'Variational algorithms and quantum machine learning': {
                'title_de': 'Variationale Quantenalgorithmen und Quantenmaschinelles Lernen',
                'description_de': 'Die lernende Person kann variationale Methoden und Lernanwendungen beschreiben.',
            },
            'Quantum optimization': {
                'title_de': 'Quantenoptimierung',
                'description_de': 'Die lernende Person kann Optimierungsprobleme formulieren und Quantenansätze erläutern.',
            },
            'Quantum error correction': {
                'title_de': 'Quantenfehlerkorrektur',
                'description_de': 'Die lernende Person kann Fehlermodelle und grundlegende Korrekturideen erklären.',
            },
            'Quantum cellular automata': {
                'title_de': 'Quantenzelluläre Automaten',
                'description_de': 'Die lernende Person kann zelluläre Automaten in Quantenkontexten beschreiben.',
            },
            'Quantum cryptography': {
                'title_de': 'Quantenkryptographie',
                'description_de': 'Die lernende Person kann kryptographische Grundideen und Sicherheitsaspekte erläutern.',
            },
            'Research and communication': {
                'title_de': 'Recherche und Kommunikation',
                'description_de': 'Die lernende Person kann eine fokussierte Literaturrecherche durchführen und Ergebnisse präsentieren.',
            },
            'Literature study and critical evaluation': {
                'title_de': 'Literaturstudium und kritische Bewertung',
                'description_de': 'Die lernende Person kann Fachartikel zusammenfassen und kritisch bewerten.',
            },
            'Seminar presentation and discussion': {
                'title_de': 'Seminarpräsentation und Diskussion',
                'description_de': 'Die lernende Person kann Ergebnisse klar präsentieren und Fragen beantworten.',
            },
            'Implementation or analysis': {
                'title_de': 'Implementierung oder Analyse',
                'description_de': 'Die lernende Person kann eine ausgewählte Methode implementieren oder theoretisch analysieren.',
            },
            'Algorithm implementation or simulation': {
                'title_de': 'Algorithmus-Implementierung oder Simulation',
                'description_de': 'Die lernende Person kann einen gewählten Algorithmus implementieren oder eine Simulation durchführen.',
            },
            'Theoretical analysis of the selected method': {
                'title_de': 'Theoretische Analyse der ausgewählten Methode',
                'description_de': 'Die lernende Person kann Annahmen, Komplexität und Grenzen erläutern.',
            },
        },
        'requires': {
            'tum_nat5040m_advanced_topic_exploration': ['tum_nat5040m_seminar_orientation_and_goals'],
            'tum_nat5040m_research_and_communication': ['tum_nat5040m_advanced_topic_exploration'],
            'tum_nat5040m_implementation_or_analysis': ['tum_nat5040m_advanced_topic_exploration'],
            'tum_nat5040m_seminar_presentation_and_discussion': ['tum_nat5040m_literature_study_and_critical_evaluation'],
        },
    },
}

for code, cfg in MODULES.items():
    meta = parse_raw_meta(code)
    module_meta = cfg['meta']
    module_meta = {
        **module_meta,
        'ects': meta['ects'],
        'title': module_meta['title'],
        'title_en': module_meta['title_en'],
        'description': module_meta['description'],
        'description_en': module_meta['description_en'],
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
