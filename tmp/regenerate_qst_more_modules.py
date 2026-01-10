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


def build_goals(code: str, module_meta, translations):
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
    for idx, _node in enumerate(nodes):
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

    # auto requires: chain leaf siblings within the same parent
    parent_map = {}
    for parent_idx, node in enumerate(nodes):
        for child_idx in node['children']:
            parent_map[child_idx] = parent_idx

    for parent_idx, node in enumerate(nodes):
        children = node['children']
        for i in range(1, len(children)):
            child_idx = children[i]
            prev_idx = children[i - 1]
            if nodes[child_idx]['children']:
                continue
            if nodes[prev_idx]['children']:
                continue
            child_goal = goals[child_idx]
            prev_goal = goals[prev_idx]
            child_goal['requires'] = [prev_goal['id']]

    return goals


MODULES = {
    'CH3337': {
        'meta': {
            'title': 'Symmetrie und Gruppentheorie (TUM, Modul CH3337)',
            'title_en': 'Symmetry and Group Theory (TUM, Module CH3337)',
            'description': (
                'Das Modul behandelt Grundlagen der Gruppentheorie, molekulare Symmetrie, Darstellungen, Symmetrie in der '
                'Quantenmechanik sowie Anwendungen in MO- und Ligandenfeldtheorie, Schwingungen und Kristallsymmetrie.'
            ),
            'description_en': (
                'The module covers group theory basics, molecular symmetry, representations, symmetry in quantum mechanics, '
                'and applications in MO and ligand field theory, vibrations, and crystal symmetry.'
            ),
            'framework_id': 'tum-ch3337',
        },
        'translations': {
            'Symmetry and Group Theory (CH3337)': {
                'title_de': 'Symmetrie und Gruppentheorie (CH3337)',
                'description_de': 'Die lernende Person kann Gruppen- und Symmetrieargumente nutzen, um molekulare und festkoerperphysikalische Systeme zu analysieren.',
            },
            'Group theory foundations': {
                'title_de': 'Grundlagen der Gruppentheorie',
                'description_de': 'Die lernende Person kann Gruppen definieren und grundlegende Symmetrieoperationen sowie Darstellungen anwenden.',
            },
            'Group axioms, subgroups, and symmetry operations': {
                'title_de': 'Gruppenaxiome, Untergruppen und Symmetrieoperationen',
                'description_de': 'Die lernende Person kann Symmetrieoperationen klassifizieren und Untergruppen sowie Erzeuger bestimmen.',
            },
            'Representations and character tables': {
                'title_de': 'Darstellungen und Charaktertafeln',
                'description_de': 'Die lernende Person kann Darstellungen aufbauen und Charaktertafeln fuer Punktgruppen nutzen.',
            },
            'Molecular symmetry and spectroscopy': {
                'title_de': 'Molekuelsymmetrie und Spektroskopie',
                'description_de': 'Die lernende Person kann Molekuele nach Punktgruppen klassifizieren und spektrale Aktivitaet vorhersagen.',
            },
            'Point group classification of molecules': {
                'title_de': 'Punktgruppenklassifikation von Molekuelen',
                'description_de': 'Die lernende Person kann Symmetrieelemente bestimmen und die Punktgruppe eines Molekuels ableiten.',
            },
            'Vibrational modes and selection rules': {
                'title_de': 'Schwingungsmoden und Auswahlregeln',
                'description_de': 'Die lernende Person kann Normalmoden herleiten und IR-/Raman-Aktivitaet aus Symmetrie ableiten.',
            },
            'Symmetry in quantum chemistry and solids': {
                'title_de': 'Symmetrie in Quantenchemie und Festkoerpern',
                'description_de': 'Die lernende Person kann Symmetrie auf quantenmechanische Modelle und Festkoerperstrukturen anwenden.',
            },
            'Symmetry in quantum mechanics and MO theory': {
                'title_de': 'Symmetrie in Quantenmechanik und MO-Theorie',
                'description_de': 'Die lernende Person kann Symmetrieargumente zur Vereinfachung der MO-Analyse und von Quantenzustaenden nutzen.',
            },
            'Crystal and lattice symmetry': {
                'title_de': 'Kristall- und Gittersymmetrie',
                'description_de': 'Die lernende Person kann Raumgruppen beschreiben und deren Einfluss auf Festkoerpereigenschaften erklaeren.',
            },
        },
    },
    'CIT4330012': {
        'meta': {
            'title': 'Software fuer Quantum Computing (TUM, Modul CIT4330012)',
            'title_en': 'Software for Quantum Computing (TUM, Module CIT4330012)',
            'description': (
                'Das Modul vermittelt den Software-Stack fuer Quantum Computing, inklusive Design-Flow, Datenstrukturen, '
                'Simulation, Kompilierung und Verifikation sowie praktische Toolnutzung fuer Quantenschaltungen.'
            ),
            'description_en': (
                'The module introduces the software stack for quantum computing, including design flow, data structures, '
                'simulation, compilation, verification, and hands-on use of tools for quantum circuits.'
            ),
            'framework_id': 'tum-cit4330012',
        },
        'translations': {
            'Software for Quantum Computing (CIT4330012)': {
                'title_de': 'Software fuer Quantum Computing (CIT4330012)',
                'description_de': 'Die lernende Person kann Anwendungen des Quantum Computing bewerten und Software-Tools zum Entwurf, zur Simulation, zur Kompilierung und zur Verifikation von Quantenschaltungen nutzen.',
            },
            'Quantum computing paradigm and suitability': {
                'title_de': 'Quantum-Computing-Paradigma und Eignung',
                'description_de': 'Die lernende Person kann Quantum- und klassische Berechnung gegenueberstellen und die Eignung von Anwendungen beurteilen.',
            },
            'Quantum vs classical computation': {
                'title_de': 'Quantum- vs. klassische Berechnung',
                'description_de': 'Die lernende Person kann erklaeren, wie sich Quantum Computing von klassischen Modellen unterscheidet.',
            },
            'Application suitability assessment': {
                'title_de': 'Bewertung der Anwendungseignung',
                'description_de': 'Die lernende Person kann beurteilen, ob ein Problem von Quantum-Computing-Ansaetzen profitiert.',
            },
            'Design flow and data structures': {
                'title_de': 'Design-Flow und Datenstrukturen',
                'description_de': 'Die lernende Person kann Design-Flows und Datenstrukturen fuer Quantum-Software anwenden.',
            },
            'Quantum application design flow': {
                'title_de': 'Design-Flow fuer Quantum-Anwendungen',
                'description_de': 'Die lernende Person kann die Schritte von Algorithmus bis Hardware-Implementierung darstellen.',
            },
            'Data structures for quantum design': {
                'title_de': 'Datenstrukturen fuer Quantum-Design',
                'description_de': 'Die lernende Person kann Datenstrukturen fuer Schaltungen, Zustaende und Entscheidungsdiagramme nutzen.',
            },
            'Core software tools': {
                'title_de': 'Zentrale Software-Tools',
                'description_de': 'Die lernende Person kann Tools fuer Simulation, Kompilierung und Verifikation einsetzen.',
            },
            'Circuit simulation and verification': {
                'title_de': 'Schaltungssimulation und Verifikation',
                'description_de': 'Die lernende Person kann Quantenschaltungen simulieren und funktionale Korrektheit pruefen.',
            },
            'Compilation and mapping to hardware': {
                'title_de': 'Kompilierung und Mapping auf Hardware',
                'description_de': 'Die lernende Person kann Schaltungen kompilieren und auf Zielhardware abbilden.',
            },
            'Hands-on implementation': {
                'title_de': 'Praktische Implementierung',
                'description_de': 'Die lernende Person kann Quantenschaltungen in Software-Toolchains implementieren und ausfuehren.',
            },
            'Implementing circuits in toolkits': {
                'title_de': 'Implementieren von Schaltungen in Toolkits',
                'description_de': 'Die lernende Person kann Schaltungen in Tools wie Qiskit-aehnlichen Umgebungen realisieren.',
            },
            'Executing and evaluating results': {
                'title_de': 'Ausfuehren und Auswerten von Ergebnissen',
                'description_de': 'Die lernende Person kann Schaltungen auf Simulatoren oder Hardware ausfuehren und Ergebnisse analysieren.',
            },
        },
    },
    'CIT4330013': {
        'meta': {
            'title': 'Designautomatisierung und Simulation fuer mikrofluidische Systeme (TUM, Modul CIT4330013)',
            'title_en': 'Design Automation and Simulation for Microfluidic Devices (TUM, Module CIT4330013)',
            'description': (
                'Das Modul behandelt Anwendungen der Mikrofluidik und fuehrt in Designautomatisierung, Simulation und '
                'Fertigung von Lab-on-a-Chip-Systemen ein.'
            ),
            'description_en': (
                'The module covers microfluidics applications and introduces design automation, simulation, and fabrication '
                'of lab-on-a-chip systems.'
            ),
            'framework_id': 'tum-cit4330013',
        },
        'translations': {
            'Design Automation and Simulation for Microfluidic Devices (CIT4330013)': {
                'title_de': 'Designautomatisierung und Simulation fuer mikrofluidische Systeme (CIT4330013)',
                'description_de': 'Die lernende Person kann mikrofluidische Lab-on-a-Chip-Geraete von Anforderungen bis Prototypen entwerfen, simulieren und bewerten.',
            },
            'Microfluidics applications and platforms': {
                'title_de': 'Mikrofluidik-Anwendungen und Plattformen',
                'description_de': 'Die lernende Person kann Anwendungen analysieren und geeignete Mikrofluidik-Plattformen auswaehlen.',
            },
            'Application potential and use cases': {
                'title_de': 'Anwendungspotenziale und Use Cases',
                'description_de': 'Die lernende Person kann Einsatzfelder identifizieren, in denen Mikrofluidik Vorteile bietet.',
            },
            'Platform types and components': {
                'title_de': 'Plattformtypen und Komponenten',
                'description_de': 'Die lernende Person kann kontinuierliche und digitale Mikrofluidikplattformen sowie deren Komponenten vergleichen.',
            },
            'Design automation workflow': {
                'title_de': 'Designautomatisierungs-Workflow',
                'description_de': 'Die lernende Person kann Designschritte und Automatisierungsmethoden fuer mikrofluidische Layouts anwenden.',
            },
            'Layout synthesis and channel design': {
                'title_de': 'Layout-Synthese und Kanaldesign',
                'description_de': 'Die lernende Person kann Kanaele dimensionieren und fluidische Verbindungen planen.',
            },
            'Control of flow, mixing, and incubation': {
                'title_de': 'Steuerung von Fluss, Mischen und Inkubation',
                'description_de': 'Die lernende Person kann Steuerparameter fuer Mischen, Heizen und Timing spezifizieren.',
            },
            'Simulation methods': {
                'title_de': 'Simulationsmethoden',
                'description_de': 'Die lernende Person kann Transport modellieren und Geraete mittels Simulation bewerten.',
            },
            'Flow and transport modeling': {
                'title_de': 'Modellierung von Fluss und Transport',
                'description_de': 'Die lernende Person kann druckgetriebenen Fluss und Diffusion modellieren.',
            },
            'Simulation tools and validation': {
                'title_de': 'Simulationswerkzeuge und Validierung',
                'description_de': 'Die lernende Person kann Simulationswerkzeuge nutzen, um Leistung und Randbedingungen zu bewerten.',
            },
            'Fabrication and prototyping': {
                'title_de': 'Fertigung und Prototyping',
                'description_de': 'Die lernende Person kann Fertigungsschritte und die Integration zu Prototypen skizzieren.',
            },
            'Fabrication processes and materials': {
                'title_de': 'Fertigungsprozesse und Materialien',
                'description_de': 'Die lernende Person kann gaengige Fertigungsverfahren fuer Mikrofluidik-Chips beschreiben.',
            },
            'Testing and iteration': {
                'title_de': 'Testen und Iteration',
                'description_de': 'Die lernende Person kann Testverfahren planen und Designs anhand der Ergebnisse verbessern.',
            },
        },
    },
    'CIT4430005': {
        'meta': {
            'title': 'Photonische Quantentechnologien (TUM, Modul CIT4430005)',
            'title_en': 'Photonic Quantum Technologies (TUM, Module CIT4430005)',
            'description': (
                'Das Modul behandelt Grundlagen der Quantenphotonik, photonische Plattformen und Anwendungen in '
                'Quantenkommunikation und Quantencomputing.'
            ),
            'description_en': (
                'The module covers quantum photonics fundamentals, photonic platforms, and applications in quantum '
                'communication and quantum computing.'
            ),
            'framework_id': 'tum-cit4430005',
        },
        'translations': {
            'Photonic Quantum Technologies (CIT4430005)': {
                'title_de': 'Photonische Quantentechnologien (CIT4430005)',
                'description_de': 'Die lernende Person kann Prinzipien der Quantenphotonik erklaeren und photonenbasierte Plattformen fuer Kommunikation und Computing analysieren.',
            },
            'Quantum photonics fundamentals': {
                'title_de': 'Grundlagen der Quantenphotonik',
                'description_de': 'Die lernende Person kann Einzelphotonen, Verschraenkung und optische Quantenzustaende beschreiben.',
            },
            'Single-photon and entangled states': {
                'title_de': 'Einzelphotonen- und verschraenkte Zustaende',
                'description_de': 'Die lernende Person kann Einzelphotonenquellen und verschraenkte Photonen-Zustaende charakterisieren.',
            },
            'Coherent light-matter interaction': {
                'title_de': 'Kohaerente Licht-Materie-Wechselwirkung',
                'description_de': 'Die lernende Person kann Resonator-QED und kohaerente Kopplungsmechanismen erklaeren.',
            },
            'Semiconductor photonic platforms': {
                'title_de': 'Halbleiterbasierte photonische Plattformen',
                'description_de': 'Die lernende Person kann halbleiterbasierte Photonquellen und Qubits bewerten.',
            },
            'Optically active semiconductor qubits': {
                'title_de': 'Optisch aktive Halbleiter-Qubits',
                'description_de': 'Die lernende Person kann Halbleiter-Spin- und Defekt-Qubits vergleichen.',
            },
            'Photon generation and detection': {
                'title_de': 'Photonenerzeugung und -detektion',
                'description_de': 'Die lernende Person kann erklaeren, wie Quantenlicht erzeugt und detektiert wird.',
            },
            'Photonic quantum communication': {
                'title_de': 'Photonische Quantenkommunikation',
                'description_de': 'Die lernende Person kann photonenbasierte Protokolle fuer Kommunikation und Networking anwenden.',
            },
            'Quantum communication protocols': {
                'title_de': 'Quantenkommunikationsprotokolle',
                'description_de': 'Die lernende Person kann QKD- und Verschraenkungsverteilungsprotokolle beschreiben.',
            },
            'Performance analysis of photonic devices': {
                'title_de': 'Leistungsanalyse photonischer Bauelemente',
                'description_de': 'Die lernende Person kann Effizienz, Verluste und Rauschen in photonischen Systemen analysieren.',
            },
            'Photonic quantum computing': {
                'title_de': 'Photonisches Quantencomputing',
                'description_de': 'Die lernende Person kann photonische Gatter und Architekturen beschreiben.',
            },
            'Photonic gates and circuits': {
                'title_de': 'Photonische Gatter und Schaltungen',
                'description_de': 'Die lernende Person kann erklaeren, wie photonische Gatter implementiert werden.',
            },
            'Scalability and integration challenges': {
                'title_de': 'Skalierbarkeit und Integrationsherausforderungen',
                'description_de': 'Die lernende Person kann Integrations- und Skalierungsfragen photonischer Prozessoren diskutieren.',
            },
        },
    },
    'EI70760': {
        'meta': {
            'title': 'Simulation von Quantenbauelementen (TUM, Modul EI70760)',
            'title_en': 'Simulation of Quantum Devices (TUM, Module EI70760)',
            'description': (
                'Das Modul fuehrt in quantenmechanische Modelle von Nano-Bauelementen und numerische '
                'Simulationsmethoden bis hin zu Quantentransport ein.'
            ),
            'description_en': (
                'The module introduces quantum-mechanical models of nanoscale devices and numerical simulation methods '
                'including quantum transport.'
            ),
            'framework_id': 'tum-ei70760',
        },
        'translations': {
            'Simulation of Quantum Devices (EI70760)': {
                'title_de': 'Simulation von Quantenbauelementen (EI70760)',
                'description_de': 'Die lernende Person kann quantennaoelektronische Bauelemente modellieren und numerische Simulationen ihres Verhaltens implementieren.',
            },
            'Quantum device modeling': {
                'title_de': 'Modellierung von Quantenbauelementen',
                'description_de': 'Die lernende Person kann physikalische Modelle fuer nanoskalige Quantenbauelemente formulieren.',
            },
            'Schrodinger equation for nanodevices': {
                'title_de': 'Schroedinger-Gleichung fuer Nanobauelemente',
                'description_de': 'Die lernende Person kann Schroedinger-Gleichungen fuer eingeschlossene Strukturen aufstellen.',
            },
            'Device physics and boundary conditions': {
                'title_de': 'Bauelementphysik und Randbedingungen',
                'description_de': 'Die lernende Person kann Bauelementparameter und Randbedingungen festlegen.',
            },
            'Numerical solution methods': {
                'title_de': 'Numerische Loesungsmethoden',
                'description_de': 'Die lernende Person kann numerische Verfahren zur Loesung der Modellgleichungen anwenden.',
            },
            'Discretization and eigenvalue problems': {
                'title_de': 'Diskretisierung und Eigenwertprobleme',
                'description_de': 'Die lernende Person kann Gleichungen diskretisieren und Eigenzustaende berechnen.',
            },
            'Quantum transport simulations': {
                'title_de': 'Quantentransportsimulationen',
                'description_de': 'Die lernende Person kann Transportprozesse mit geeigneten numerischen Methoden modellieren.',
            },
            'Implementation and validation': {
                'title_de': 'Implementierung und Validierung',
                'description_de': 'Die lernende Person kann grundlegende Simulationscodes implementieren und Ergebnisse validieren.',
            },
            'Coding basic simulators': {
                'title_de': 'Programmierung einfacher Simulatoren',
                'description_de': 'Die lernende Person kann einfache numerische Solver programmieren.',
            },
            'Result interpretation and verification': {
                'title_de': 'Ergebnisinterpretation und Verifikation',
                'description_de': 'Die lernende Person kann Simulationsergebnisse interpretieren und Modellkonsistenz pruefen.',
            },
        },
    },
    'EI77006': {
        'meta': {
            'title': 'Aktuelle Themen der photonischen Quantentechnologien (TUM, Modul EI77006)',
            'title_en': 'Current Topics in Photonic Quantum Technologies (TUM, Module EI77006)',
            'description': (
                'Seminar zu aktuellen Forschungsthemen der photonischen Quantentechnologien mit Literaturarbeit '
                'und Praesentation.'
            ),
            'description_en': (
                'Seminar on current research topics in photonic quantum technologies with literature review and presentation.'
            ),
            'framework_id': 'tum-ei77006',
        },
        'translations': {
            'Current Topics in Photonic Quantum Technologies (EI77006)': {
                'title_de': 'Aktuelle Themen der photonischen Quantentechnologien (EI77006)',
                'description_de': 'Die lernende Person kann neue Forschungsthemen der Quantenphotonik selbstaendig erschliessen und kritisch praesentieren.',
            },
            'Literature research and topic selection': {
                'title_de': 'Literaturrecherche und Themenwahl',
                'description_de': 'Die lernende Person kann relevante Forschungsfragen und Quellen identifizieren.',
            },
            'Finding and summarizing papers': {
                'title_de': 'Finden und Zusammenfassen von Publikationen',
                'description_de': 'Die lernende Person kann aktuelle Publikationen finden und zusammenfassen.',
            },
            'Positioning research in the field': {
                'title_de': 'Einordnung der Forschung im Feld',
                'description_de': 'Die lernende Person kann Ergebnisse im Stand der Forschung einordnen.',
            },
            'Critical evaluation': {
                'title_de': 'Kritische Bewertung',
                'description_de': 'Die lernende Person kann Methoden, Ergebnisse und Grenzen von Studien beurteilen.',
            },
            'Assessing experimental and theoretical methods': {
                'title_de': 'Bewertung experimenteller und theoretischer Methoden',
                'description_de': 'Die lernende Person kann Methoden und Annahmen kritisch pruefen.',
            },
            'Comparing approaches and results': {
                'title_de': 'Vergleich von Ansaetzen und Ergebnissen',
                'description_de': 'Die lernende Person kann konkurrierende Ansaetze vergleichen.',
            },
            'Scientific presentation': {
                'title_de': 'Wissenschaftliche Praesentation',
                'description_de': 'Die lernende Person kann einen klaren wissenschaftlichen Vortrag vorbereiten und halten.',
            },
            'Structuring and visualizing a talk': {
                'title_de': 'Strukturieren und Visualisieren eines Vortrags',
                'description_de': 'Die lernende Person kann Vortraege strukturieren und verstaendliche Visualisierungen erstellen.',
            },
            'Responding to questions and discussion': {
                'title_de': 'Auf Fragen und Diskussion eingehen',
                'description_de': 'Die lernende Person kann Fragen beantworten und Interpretationen verteidigen.',
            },
        },
    },
    'NAT3036': {
        'meta': {
            'title': 'Quantencomputing mit supraleitenden Qubits: Grundkonzepte (TUM, Modul NAT3036)',
            'title_en': 'Quantum Computing with Superconducting Qubits: Basic Concepts (TUM, Module NAT3036)',
            'description': (
                'Das Modul behandelt supraleitende Qubits, Kontroll- und Auslesetechniken, Fehlerkorrektur und '
                'hardwarebewusste Abbildung von Algorithmen.'
            ),
            'description_en': (
                'The module covers superconducting qubits, control and readout techniques, error correction, and '
                'hardware-aware mapping of algorithms.'
            ),
            'framework_id': 'tum-nat3036',
        },
        'translations': {
            'Quantum Computing with Superconducting Qubits: Basic Concepts (NAT3036)': {
                'title_de': 'Quantencomputing mit supraleitenden Qubits: Grundkonzepte (NAT3036)',
                'description_de': 'Die lernende Person kann supraleitende Qubit-Hardware erklaeren, Algorithmen auf Hardware abbilden und Anforderungen der Fehlertoleranz mit Experimenten verknuepfen.',
            },
            'Quantum algorithms and hardware mapping': {
                'title_de': 'Quantenalgorithmen und Hardware-Mapping',
                'description_de': 'Die lernende Person kann grundlegende Quantenalgorithmen mit Hardware-Restriktionen verknuepfen.',
            },
            'Core protocols and algorithmic building blocks': {
                'title_de': 'Kernprotokolle und algorithmische Bausteine',
                'description_de': 'Die lernende Person kann Teleportation, Grover und QFT als motivierende Beispiele beschreiben.',
            },
            'Hardware-aware algorithm mapping': {
                'title_de': 'Hardwarebewusstes Algorithmus-Mapping',
                'description_de': 'Die lernende Person kann Algorithmen auf native Gatter und Konnektivitaet abbilden.',
            },
            'Superconducting qubit hardware': {
                'title_de': 'Supraleitende Qubit-Hardware',
                'description_de': 'Die lernende Person kann supraleitende Schaltkreise und deren Betrieb beschreiben.',
            },
            'Qubit types and couplers': {
                'title_de': 'Qubit-Typen und Koppler',
                'description_de': 'Die lernende Person kann Transmon-, Fluxonium- und Kopplerelemente vergleichen.',
            },
            'Control and readout techniques': {
                'title_de': 'Steuerungs- und Auslesetechniken',
                'description_de': 'Die lernende Person kann Mikrowellensteuerung und Messschemata erklaeren.',
            },
            'Characterization and benchmarking': {
                'title_de': 'Charakterisierung und Benchmarking',
                'description_de': 'Die lernende Person kann Qubits und Gatter mit Charakterisierungsmethoden bewerten.',
            },
            'Coherence and noise metrics': {
                'title_de': 'Kohaerenz- und Rauschmetriken',
                'description_de': 'Die lernende Person kann T1/T2 und Fehlermetriken interpretieren.',
            },
            'Gate and processor benchmarking': {
                'title_de': 'Gatter- und Prozessor-Benchmarking',
                'description_de': 'Die lernende Person kann Benchmarking- und Kalibrierkonzepte anwenden.',
            },
            'Error correction and scaling': {
                'title_de': 'Fehlerkorrektur und Skalierung',
                'description_de': 'Die lernende Person kann QEC-Codes und Fehlertoleranzschwellen erklaeren.',
            },
            'Codes and decoding basics': {
                'title_de': 'Grundlagen von Codes und Decoding',
                'description_de': 'Die lernende Person kann Surface Codes und Decoding-Schritte skizzieren.',
            },
            'Scaling challenges and platform comparison': {
                'title_de': 'Skalierungsherausforderungen und Plattformvergleich',
                'description_de': 'Die lernende Person kann supraleitende Plattformen mit Ionen- und Atomplattformen vergleichen.',
            },
        },
    },
    'NAT5008m': {
        'meta': {
            'title': 'Aktuelle Themen zu Quantennetzwerken (TUM, Modul NAT5008m)',
            'title_en': 'Current Topics in Quantum Networks (TUM, Module NAT5008m)',
            'description': (
                'Seminar zu aktuellen Publikationen in Quantennetzwerken mit Paper-Reading, Praesentationen und '
                'Diskussion von Hardwareplattformen und Protokollen.'
            ),
            'description_en': (
                'Seminar on recent publications in quantum networks with paper reading, presentations, and discussion '
                'of hardware platforms and protocols.'
            ),
            'framework_id': 'tum-nat5008m',
        },
        'translations': {
            'Current Topics in Quantum Networks (NAT5008m)': {
                'title_de': 'Aktuelle Themen zu Quantennetzwerken (NAT5008m)',
                'description_de': 'Die lernende Person kann aktuelle Forschung zu Quantennetzwerken analysieren und Ergebnisse praesentieren.',
            },
            'Research literacy and presentation': {
                'title_de': 'Forschungsliteratur und Praesentation',
                'description_de': 'Die lernende Person kann aktuelle Arbeiten lesen, zusammenfassen und praesentieren.',
            },
            'Weekly paper analysis': {
                'title_de': 'Woechentliche Paper-Analyse',
                'description_de': 'Die lernende Person kann Kernergebnisse aus zugewiesenen Arbeiten herausarbeiten.',
            },
            'Scientific presentation preparation': {
                'title_de': 'Vorbereitung wissenschaftlicher Praesentationen',
                'description_de': 'Die lernende Person kann klare Praesentationen von Forschungsergebnissen erstellen.',
            },
            'Quantum network hardware and scaling': {
                'title_de': 'Quantennetzwerk-Hardware und Skalierung',
                'description_de': 'Die lernende Person kann Hardwareplattformen und Skalierungsprobleme vergleichen.',
            },
            'Hardware platforms for networking': {
                'title_de': 'Hardwareplattformen fuer Netzwerke',
                'description_de': 'Die lernende Person kann Atome, Ionen, supraleitende Schaltkreise und Festkoerperplattformen vergleichen.',
            },
            'Nanofabrication and scaling challenges': {
                'title_de': 'Nanofabrikation und Skalierungsherausforderungen',
                'description_de': 'Die lernende Person kann Fertigungsansaetze und Skalierungsgrenzen beschreiben.',
            },
            'Distributed quantum information': {
                'title_de': 'Verteilte Quanteninformation',
                'description_de': 'Die lernende Person kann Protokolle fuer verteilte Quantenverarbeitung erlaeutern.',
            },
            'Entanglement distribution and memories': {
                'title_de': 'Verschraenkungsverteilung und Quanten-Speicher',
                'description_de': 'Die lernende Person kann Verschraenkungsverteilung und die Rolle von Quantenspeichern erklaeren.',
            },
            'Communication and computation protocols': {
                'title_de': 'Kommunikations- und Rechenprotokolle',
                'description_de': 'Die lernende Person kann Protokolle fuer Quantenkommunikation und verteiltes Rechnen beschreiben.',
            },
            'State-of-the-art assessment': {
                'title_de': 'Stand-der-Technik-Bewertung',
                'description_de': 'Die lernende Person kann Trends und offene Herausforderungen bewerten.',
            },
            'Evaluating recent developments': {
                'title_de': 'Bewertung aktueller Entwicklungen',
                'description_de': 'Die lernende Person kann die Bedeutung aktueller Ergebnisse einschaetzen.',
            },
            'Identifying open challenges': {
                'title_de': 'Identifizieren offener Herausforderungen',
                'description_de': 'Die lernende Person kann zentrale offene Probleme benennen.',
            },
        },
    },
    'NAT5030m': {
        'meta': {
            'title': 'Cavity-, Circuit- und Waveguide-QED (TUM, Modul NAT5030m)',
            'title_en': 'Cavity-, Circuit- and Waveguide QED (TUM, Module NAT5030m)',
            'description': (
                'Seminar zu aktuellen Themen der Licht-Materie-Wechselwirkung in Cavity-, Circuit- und Waveguide-QED '
                'mit Schwerpunkt auf Theorie, Trends und Praesentation.'
            ),
            'description_en': (
                'Seminar on current topics in light-matter interaction in cavity, circuit, and waveguide QED with emphasis '
                'on theory, trends, and presentation.'
            ),
            'framework_id': 'tum-nat5030m',
        },
        'translations': {
            'Cavity-, Circuit- and Waveguide QED (NAT5030m)': {
                'title_de': 'Cavity-, Circuit- und Waveguide-QED (NAT5030m)',
                'description_de': 'Die lernende Person kann Literatur zu quantenmechanischer Licht-Materie-Wechselwirkung verstehen und aktuelle Forschungstrends vermitteln.',
            },
            'Fundamentals of light-matter interaction': {
                'title_de': 'Grundlagen der Licht-Materie-Wechselwirkung',
                'description_de': 'Die lernende Person kann grundlegende QED-Modelle fuer Hohlraeume, Schaltkreise und Wellenleiter erklaeren.',
            },
            'Jaynes-Cummings and related models': {
                'title_de': 'Jaynes-Cummings- und verwandte Modelle',
                'description_de': 'Die lernende Person kann grundlegende QED-Hamiltonoperatoren und Kopplungsregime beschreiben.',
            },
            'Coupling regimes and decay processes': {
                'title_de': 'Kopplungsregime und Zerfallsprozesse',
                'description_de': 'Die lernende Person kann schwache/starke Kopplung und Verlustmechanismen unterscheiden.',
            },
            'Current research in QED platforms': {
                'title_de': 'Aktuelle Forschung zu QED-Plattformen',
                'description_de': 'Die lernende Person kann Themen der Forschung zu Cavity-, Circuit- und Waveguide-QED identifizieren.',
            },
            'Quantum information and simulation schemes': {
                'title_de': 'Quanteninformations- und Simulationsschemata',
                'description_de': 'Die lernende Person kann aktuelle Schemata fuer Verarbeitung und Simulation beschreiben.',
            },
            'Experimental implementations': {
                'title_de': 'Experimentelle Implementierungen',
                'description_de': 'Die lernende Person kann experimentelle Aufbauten und Fortschritte zusammenfassen.',
            },
            'Scientific communication': {
                'title_de': 'Wissenschaftliche Kommunikation',
                'description_de': 'Die lernende Person kann Literatur kritisch lesen und Ergebnisse praesentieren.',
            },
            'Critical reading of papers': {
                'title_de': 'Kritische Lektuere von Publikationen',
                'description_de': 'Die lernende Person kann aktuelle Publikationen interpretieren und kritisch beurteilen.',
            },
            'Presenting results to non-experts': {
                'title_de': 'Ergebnisse fuer Nicht-Expertinnen und -Experten praesentieren',
                'description_de': 'Die lernende Person kann Ergebnisse verstaendlich fuer ein breites Publikum erklaeren.',
            },
        },
    },
    'NAT7003': {
        'meta': {
            'title': 'Ultrakalte Quantengase (TUM, Modul NAT7003)',
            'title_en': 'Ultra-Cold Quantum Gases (TUM, Module NAT7003)',
            'description': (
                'Das Modul fuehrt in ultrakalte Quantengase ein und behandelt Kuehlung, Bose-Kondensation, '
                'Wechselwirkungen, Superfluiditaet und optische Gitter.'
            ),
            'description_en': (
                'The module introduces ultracold quantum gases and covers cooling, Bose-Einstein condensation, '
                'interactions, superfluidity, and optical lattices.'
            ),
            'framework_id': 'tum-nat7003',
        },
        'translations': {
            'Ultra-Cold Quantum Gases (NAT7003)': {
                'title_de': 'Ultrakalte Quantengase (NAT7003)',
                'description_de': 'Die lernende Person kann die Praeparation ultrakalter Gase beschreiben und interagierende Bose-Gase sowie Gittermodelle analysieren.',
            },
            'Cooling, trapping, and statistics': {
                'title_de': 'Kuehlung, Fallen und Statistik',
                'description_de': 'Die lernende Person kann Laser-Kuehlung, Fallen und Quantenstatistik erklaeren.',
            },
            'Laser cooling and trapping methods': {
                'title_de': 'Laser-Kuehlung und Fangmethoden',
                'description_de': 'Die lernende Person kann zentrale Techniken zur Praeparation ultrakalter Atome beschreiben.',
            },
            'Quantum statistics and Bose-Einstein condensation': {
                'title_de': 'Quantenstatistik und Bose-Einstein-Kondensation',
                'description_de': 'Die lernende Person kann Bose-Kondensation und Thermodynamik erklaeren.',
            },
            'Interacting Bose gases': {
                'title_de': 'Interagierende Bose-Gase',
                'description_de': 'Die lernende Person kann Wechselwirkungen modellieren und resultierende Phaenomene erklaeren.',
            },
            'Low-energy scattering and mean-field theory': {
                'title_de': 'Niederenergie-Streuung und Mean-Field-Theorie',
                'description_de': 'Die lernende Person kann Streukonzepte und die Gross-Pitaevskii-Theorie herleiten.',
            },
            'Superfluidity and nonlinear excitations': {
                'title_de': 'Superfluiditaet und nichtlineare Anregungen',
                'description_de': 'Die lernende Person kann Superfluiditaet, Solitonen und Wirbel erklaeren.',
            },
            'Lattice systems and strong correlations': {
                'title_de': 'Gitterssysteme und starke Korrelationen',
                'description_de': 'Die lernende Person kann optische Gitter und korrelierte Phasen analysieren.',
            },
            'Optical lattices and Mott transition': {
                'title_de': 'Optische Gitter und Mott-Uebergang',
                'description_de': 'Die lernende Person kann Gitterpotenziale und Mott-Uebergaenge erklaeren.',
            },
            'Coherence and applications': {
                'title_de': 'Kohaerenz und Anwendungen',
                'description_de': 'Die lernende Person kann Kohaerenzeigenschaften und Anwendungen in der Quanten-Simulation beschreiben.',
            },
        },
    },
    'NAT7026': {
        'meta': {
            'title': 'Einfuehrung in Graphen und 2D-Materialien (TUM, Modul NAT7026)',
            'title_en': 'Introduction to Graphene and 2D Materials (TUM, Module NAT7026)',
            'description': (
                'Das Modul fuehrt in Graphen und 2D-Materialien ein und behandelt Transport, Dirac-Physik, '
                'Topologie, Moire-Supergitter und korrelierte Phasen.'
            ),
            'description_en': (
                'The module introduces graphene and 2D materials and covers transport, Dirac physics, topology, '
                'moire superlattices, and correlated phases.'
            ),
            'framework_id': 'tum-nat7026',
        },
        'translations': {
            'Introduction to Graphene and 2D Materials (NAT7026)': {
                'title_de': 'Einfuehrung in Graphen und 2D-Materialien (NAT7026)',
                'description_de': 'Die lernende Person kann elektronische Struktur und experimentelle Techniken fuer Graphen und Moire-Materialien erklaeren.',
            },
            'Experimental techniques and transport': {
                'title_de': 'Experimentelle Techniken und Transport',
                'description_de': 'Die lernende Person kann zentrale Nano-Fertigungs- und Charakterisierungsmethoden anwenden.',
            },
            'Nanofabrication and characterization': {
                'title_de': 'Nanofabrikation und Charakterisierung',
                'description_de': 'Die lernende Person kann Fertigung, Mikroskopie und kryogene Techniken beschreiben.',
            },
            'Electronic transport models': {
                'title_de': 'Elektronische Transportmodelle',
                'description_de': 'Die lernende Person kann Drude-, Hall- und Boltzmann-Transportkonzepte anwenden.',
            },
            'Electronic structure and Dirac physics': {
                'title_de': 'Elektronische Struktur und Dirac-Physik',
                'description_de': 'Die lernende Person kann Bandstrukturen und Dirac-Fermionen in Graphen modellieren.',
            },
            'Tight-binding band structure': {
                'title_de': 'Tight-Binding-Bandstruktur',
                'description_de': 'Die lernende Person kann Bandstrukturen fuer Graphen und verwandte Materialien berechnen.',
            },
            'Dirac equation and pseudospin': {
                'title_de': 'Dirac-Gleichung und Pseudospin',
                'description_de': 'Die lernende Person kann masselose Dirac-Fermionen und Pseudospin-Textur erklaeren.',
            },
            'Topology and moire superlattices': {
                'title_de': 'Topologie und Moire-Supergitter',
                'description_de': 'Die lernende Person kann topologische Effekte und Moire-Band-Engineering erklaeren.',
            },
            'Quantum Hall and topological concepts': {
                'title_de': 'Quanten-Hall-Effekt und topologische Konzepte',
                'description_de': 'Die lernende Person kann Berry-Phase, Chern-Zahlen und topologische Isolatoren erklaeren.',
            },
            'Moire patterns and flat bands': {
                'title_de': 'Moire-Muster und flache Baender',
                'description_de': 'Die lernende Person kann Moire-Supergitter, Hofstadter-Physik und flache Baender erklaeren.',
            },
            'Correlation effects and phase transitions': {
                'title_de': 'Korrelationseffekte und Phasenuebergaenge',
                'description_de': 'Die lernende Person kann korrelierte Phasen in verdrehtem Bilayer-Graphen analysieren.',
            },
            'Symmetry breaking and phase transitions': {
                'title_de': 'Symmetriebrechung und Phasenuebergaenge',
                'description_de': 'Die lernende Person kann Symmetriebrechung und Viele-Teilchen-Grundzustaende beschreiben.',
            },
            'Strong correlations and superconductivity': {
                'title_de': 'Starke Korrelationen und Supraleitung',
                'description_de': 'Die lernende Person kann Hubbard-Physik, Supraleitung und stranges metallisches Verhalten erklaeren.',
            },
        },
    },
    'PH2127': {
        'meta': {
            'title': 'Oberflaechenphysik (TUM, Modul PH2127)',
            'title_en': 'Surface Physics (TUM, Module PH2127)',
            'description': (
                'Das Modul behandelt Oberflaechenstruktur, elektronische Eigenschaften, Adsorption, '
                'Oberflaechenanalytik und duenne Filme.'
            ),
            'description_en': (
                'The module covers surface structure, electronic properties, adsorption, surface analysis, and thin films.'
            ),
            'framework_id': 'tum-ph2127',
        },
        'translations': {
            'Surface Physics (PH2127)': {
                'title_de': 'Oberflaechenphysik (PH2127)',
                'description_de': 'Die lernende Person kann Oberflaechenstruktur, elektronische Eigenschaften und experimentelle Sonden von Oberflaechen beschreiben.',
            },
            'Surface structure and reconstruction': {
                'title_de': 'Oberflaechenstruktur und Rekonstruktion',
                'description_de': 'Die lernende Person kann Oberflaechenkristallographie und Rekonstruktionen analysieren.',
            },
            'Surface symmetry and reconstruction patterns': {
                'title_de': 'Oberflaechensymmetrie und Rekonstruktionsmuster',
                'description_de': 'Die lernende Person kann Oberflaechen-Einheitszellen und Rekonstruktionsmotive identifizieren.',
            },
            'Defects and adsorption sites': {
                'title_de': 'Defekte und Adsorptionsstellen',
                'description_de': 'Die lernende Person kann Defekte und Adsorption auf Oberflaechen beschreiben.',
            },
            'Surface electronic properties': {
                'title_de': 'Elektronische Oberflaecheneigenschaften',
                'description_de': 'Die lernende Person kann Oberflaechenzustaende und Aenderungen der Austrittsarbeit erklaeren.',
            },
            'Surface states and band bending': {
                'title_de': 'Oberflaechenzustaende und Bandbiegung',
                'description_de': 'Die lernende Person kann elektronische Oberflaechenzustaende und Bandbiegung analysieren.',
            },
            'Adsorption and charge transfer': {
                'title_de': 'Adsorption und Ladungstransfer',
                'description_de': 'Die lernende Person kann Ladungstransfer und Adsorptionseffekte beschreiben.',
            },
            'Surface characterization methods': {
                'title_de': 'Methoden der Oberflaechencharakterisierung',
                'description_de': 'Die lernende Person kann Konzepte zentraler Oberflaechenmessmethoden anwenden.',
            },
            'Scanning probe methods (STM/AFM)': {
                'title_de': 'Rastersondenmethoden (STM/AFM)',
                'description_de': 'Die lernende Person kann Funktionsprinzipien von STM und AFM erklaeren.',
            },
            'Diffraction and spectroscopy': {
                'title_de': 'Beugung und Spektroskopie',
                'description_de': 'Die lernende Person kann LEED- und spektroskopische Techniken beschreiben.',
            },
            'Thin films and interfaces': {
                'title_de': 'Duenne Filme und Grenzflaechen',
                'description_de': 'Die lernende Person kann Duennfilmwachstum und Grenzflaechenphaenomene erklaeren.',
            },
            'Growth modes and epitaxy': {
                'title_de': 'Wachstumsmoden und Epitaxie',
                'description_de': 'Die lernende Person kann Schicht- und Inselwachstum beschreiben.',
            },
            'Interface effects and applications': {
                'title_de': 'Grenzflaecheneffekte und Anwendungen',
                'description_de': 'Die lernende Person kann Grenzflaecheneigenschaften mit Geraeteverhalten verknuepfen.',
            },
        },
    },
    'PH2141': {
        'meta': {
            'title': 'Nanotechnologie (TUM, Modul PH2141)',
            'title_en': 'Nanotechnology (TUM, Module PH2141)',
            'description': (
                'Das Modul behandelt Nanofertigung, Nanomaterialien, Charakterisierungsmethoden und Anwendungen '
                'der Nanotechnologie.'
            ),
            'description_en': (
                'The module covers nanofabrication, nanomaterials, characterization methods, and applications of nanotechnology.'
            ),
            'framework_id': 'tum-ph2141',
        },
        'translations': {
            'Nanotechnology (PH2141)': {
                'title_de': 'Nanotechnologie (PH2141)',
                'description_de': 'Die lernende Person kann Nanofertigung, Eigenschaften von Nanomaterialien und Charakterisierungsmethoden erklaeren.',
            },
            'Nanofabrication methods': {
                'title_de': 'Nanofabrikationsmethoden',
                'description_de': 'Die lernende Person kann Top-down- und Bottom-up-Fertigungsansaetze vergleichen.',
            },
            'Lithography, etching, deposition': {
                'title_de': 'Lithografie, Aetzen und Abscheidung',
                'description_de': 'Die lernende Person kann gaengige Lithografie- und Abscheideverfahren skizzieren.',
            },
            'Self-assembly and bottom-up synthesis': {
                'title_de': 'Selbstorganisation und Bottom-up-Synthese',
                'description_de': 'Die lernende Person kann Bottom-up-Assemblierungstechniken beschreiben.',
            },
            'Nanomaterials and properties': {
                'title_de': 'Nanomaterialien und Eigenschaften',
                'description_de': 'Die lernende Person kann groessenabhaengige Eigenschaften von Nanomaterialien analysieren.',
            },
            'Quantum dots, nanowires, and 2D materials': {
                'title_de': 'Quantenpunkte, Nanodraehte und 2D-Materialien',
                'description_de': 'Die lernende Person kann zentrale Klassen von Nanomaterialien beschreiben.',
            },
            'Quantum confinement and size effects': {
                'title_de': 'Quantenkonfinierung und Groesseneffekte',
                'description_de': 'Die lernende Person kann Konfinierung und Oberflaecheneffekte erklaeren.',
            },
            'Characterization techniques': {
                'title_de': 'Charakterisierungstechniken',
                'description_de': 'Die lernende Person kann geeignete Charakterisierungsmethoden auswaehlen.',
            },
            'Electron and scanning probe microscopy': {
                'title_de': 'Elektronen- und Rastersondenmikroskopie',
                'description_de': 'Die lernende Person kann Prinzipien von SEM/TEM/AFM erklaeren.',
            },
            'Optical and electrical measurements': {
                'title_de': 'Optische und elektrische Messungen',
                'description_de': 'Die lernende Person kann spektroskopische und Transportmessungen beschreiben.',
            },
            'Applications and integration': {
                'title_de': 'Anwendungen und Integration',
                'description_de': 'Die lernende Person kann Nanotechnologie mit Geraeteanwendungen verknuepfen.',
            },
            'Nanoelectronics and sensors': {
                'title_de': 'Nanoelektronik und Sensoren',
                'description_de': 'Die lernende Person kann Anwendungen in Elektronik und Sensorik beschreiben.',
            },
            'Nanophotonics and bioapplications': {
                'title_de': 'Nanophotonik und Bioanwendungen',
                'description_de': 'Die lernende Person kann photonik- und biomedizinische Anwendungen diskutieren.',
            },
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

    goals = build_goals(code, module_meta, cfg['translations'])

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
