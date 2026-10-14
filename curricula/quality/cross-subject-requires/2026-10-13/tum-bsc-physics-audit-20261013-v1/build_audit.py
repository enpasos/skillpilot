#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Build an inert author audit. Never writes active curricula or QA state."""
import collections
import hashlib
import json
from pathlib import Path

ROOT = Path('/home/enpasos/projects/skillpilot')
OUT = Path(__file__).parent
BASE = 'curricula/DE/BY/TUM/Physics/BSc_Physics'
INVENTORY = 'curricula/quality/cross-subject-requires/math-physics.inventory.json'
CONFIG = 'curricula/quality/cross-subject-requires/math-physics.config.json'

def sha_bytes(b):
    return 'sha256:' + hashlib.sha256(b).hexdigest()

def sha_file(p):
    return sha_bytes((ROOT / p).read_bytes())

def dump(name, data):
    (OUT / name).write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')

inventory = json.loads((ROOT / INVENTORY).read_text())
family = next(f for f in inventory['families'] if f['familyId'] == 'tum-bsc-physics')
landscapes = {l['path']: json.loads((ROOT / l['path']).read_text()) for l in family['landscapes']}
degree_path = BASE + '/json/DE_BAY_U_TUM_BSC_PHYSIK.de.json'
degree = landscapes[degree_path]

# Editorial decisions, keyed to the actual module and its source section.
# The generator only expands occurrence evidence; these decisions do not come
# from the inventory's owner, reviewRequired, subject name, or filename alone.
MODULES = {
 'CH1104': ('chemistry', 'general-and-inorganic-chemistry',
     'Der Outcome nennt chemisches Gleichgewicht, Bindung, Redox, Säuren/Basen, Stoffchemie und chemische Energetik. Das Physik-Degree macht diese Kompetenzen nicht zu Physik.',
     'Breites Chemie-Modulbündel; Anwendungen sind prüfbar, aber nicht ein einzelnes atomares Lernziel.',
     ['chemisches Gleichgewicht', 'Bindungsmodelle', 'Redox und Säure/Base', 'Elemente und technische Verfahren', 'chemische Energetik und Kinetik']),
 'CIT513016': ('mathematics', 'linear-algebra',
     'Der Outcome fordert abstrakte Argumentation, Isomorphien, lineare Strukturen und Matrizen; der Inhalt spezifiziert Vektorräume bis Eigenwerttheorie und Hauptachsentransformation.',
     'Mehrere unabhängig prüfbare Kompetenzen; der Outcome belegt weder Eigenwertverfahren noch Skalarprodukte individuell.',
     ['Vektorräume und lineare Unabhängigkeit', 'lineare Abbildungen und Matrizen', 'LGS', 'Eigenwerte und Diagonalisierung', 'Skalarprodukte und orthogonale Projektion']),
 'CIT513017': ('mathematics', 'single-variable-analysis',
     'Funktionen einer Veränderlichen und Approximation sind mathematische Kompetenzen. Die lokale Inhaltsquelle enthält mehr als das im Graph übrig gebliebene Zahlen-Fragment.',
     'Approximation und einfache Anwendungen sind zu unbestimmt für einen vollständigen Analysis-1-Masterybeleg.',
     ['Folgen und Reihen', 'Differenzieren einer Veränderlichen', 'integrieren einer Veränderlichen', 'Taylor- und Fourierreihen', 'einfache gewöhnliche Differentialgleichungen']),
 'CIT513018': ('mathematics', 'multivariable-analysis-and-ode',
     'Mehrdimensionale Analysis und Differentialgleichungsverfahren bleiben Mathematik; physikalische Situationen sind Anwendungsfälle, keine notwendige vorausgehende Fachbeherrschung für alle abstrakten Fälle.',
     'Mehrdimensionale Differentiation, Extremwertverfahren, Kurvenintegrale und ODE-Verfahren verlangen getrennte Nachweise.',
     ['mehrdimensionale Ableitungen und Taylorentwicklung', 'implizite Funktionen und Extremwerte', 'Kurvenintegrale und Vektoranalysis', 'Theorie gewöhnlicher Differentialgleichungen']),
 'CIT513019': ('mathematics', 'advanced-analysis',
     'Integration im R^n, Integralsätze, Fouriertransformation, Funktionentheorie, Hilberträume und PDE sind mathematische Methoden für spätere Physik.',
     'Der abstrakte Outcome bezeichnet keine einzelnen Resultate; das Inhaltsblatt enthält nur die erste Zeile der vollständigen Quelle.',
     ['mehrdimensionale Integration und Integralsätze', 'Fouriertransformation', 'komplexe Analysis', 'Hilbertraumtheorie', 'einfache partielle Differentialgleichungen']),
 'PH0001': ('physics', 'experimental-mechanics-and-measurement',
     'Der vorhandene Outcome behandelt physikalische Methodik und Messvorgänge. Die Quelle enthält zusätzlich eigenständige mathematische Ergänzungen; diese fehlen als mathematische Goals.',
     'Der Graph erfasst nur den ersten Outcome; Mechanik, Wellen und drei mathematische Outcomes fehlen.',
     ['Messvorgänge und Unsicherheiten', 'Mechanik des Massepunkts und Schwingungen', 'Systeme und starre Körper', 'Fluide und Wellen', 'partielle Ableitungen', 'Integrale physikalischer Anwendungen', 'einfache ODE']),
 'PH0002': ('physics', 'experimental-electromagnetism',
     'Elektrostatik, elektrischer Strom und Magnetostatik sind physikalische Fachkompetenzen; die mathematische Methode hängt vom quantitativ beziehungsweise konzeptionell verlangten Teil ab.',
     'Nur der erste Outcome ist im Graph: zeitabhängige Felder, EM-Schwingungen/Wellen, Elektrochemie und Relativität fehlen.',
     ['Elektrostatik, Strom und Magnetostatik', 'zeitabhängige Felder', 'elektromagnetische Schwingungen/Wellen', 'Elektrochemie', 'spezielle Relativität']),
 'PH0003': ('physics', 'optics-and-quantum-phenomena',
     'Der Outcome verbindet geometrische Optik, Beugung/Interferenz und Einführung in Quantenphänomene; Mathematikbedarf unterscheidet sich zwischen diesen Teilzielen.',
     'Vollständiger, aber sehr breiter Outcome; geometrische und Fourieroptik benötigen verschiedene Voraussetzungen.',
     ['geometrische Optik und Instrumente', 'Interferenz und Beugung', 'Fourieroptik und Holographie', 'Quantenphänomene']),
 'PH0004': ('physics', 'atomic-molecular-physics-and-thermodynamics',
     'Die aktuelle Goalbeschreibung ist Atom-/Molekülphysik; die Modulquelle hat einen weiteren Thermodynamik-Outcome, den der Graph nicht enthält.',
     'Viele Atom-/Molekülkompetenzen in einem Blatt; Thermodynamik ist als eigenständiger Outcome verloren.',
     ['quantenmechanische Atommodelle', 'Symmetrien und optische Übergänge', 'Molekülgrundzustände und Anregungen', 'Thermodynamik']),
 'PH0005': ('physics', 'theoretical-mechanics',
     'Die vorhandene Outcome-ID ist nur ein Einleitungssatz ohne Kompetenz. Der Fachkontext ist klassische/relativistische theoretische Mechanik.',
     'Outcome-Extraktion abgebrochen; vor Requires-Freigabe müssen die vier im Rohtext folgenden Kompetenzen wieder modelliert werden.',
     ['mechanische Dynamik formulieren', 'geeigneten Lagrange-Formalismus wählen', 'energetische Dynamik interpretieren', 'Grenzen bei hohen Geschwindigkeiten']),
 'PH0006': ('physics', 'electrodynamics-with-mathematical-methods',
     'Feld- und Wellenrechnung sowie Relativität sind Physik. Randwertlösungen und Tensor-/Kugelflächenrechnung sind ausdrücklich mitgeforderte mathematische Methoden, nicht durch den Landscape-Namen fachlich geklärt.',
     'Sechs Outcome-Teile in einem Blatt, einschließlich Mathematik; ein Split muss Methodenkompetenz von Anwendung trennen.',
     ['Randwertprobleme', 'Maxwell-Feldrechnung', 'Wellengleichungen', 'Green-Funktionen bewegter Ladungen', 'Bezugssystemwechsel', 'Tensoren und Kugelflächenfunktionen']),
 'PH0007': ('physics', 'quantum-mechanics',
     'Wellenfunktionen, Potentialprobleme, Bra-Ket, Wasserstoff und Spin sind quantenphysikalische Kompetenzen mit verschiedenen mathematischen Methoden.',
     'Die letzten Quelle-Outcomes Zwei-Niveau-Systeme, Näherungsverfahren und Dichtematrix/Verschränkung fehlen im Graph.',
     ['Zustände und Schrödingergleichung', 'eindimensionale Potentiale', 'Bra-Ket-Formalismus', 'Zentralpotentiale und Wasserstoff', 'Spin', 'Zwei-Niveau-Systeme', 'Näherungsverfahren', 'Dichtematrix und Verschränkung']),
 'PH0008': ('physics', 'statistical-mechanics-and-thermodynamics',
     'Statistische Begründung, ideale Quantengase, wechselwirkende Systeme und Nichtgleichgewicht sind Physik; Wahrscheinlichkeiten und Analysis sind Methoden.',
     'Fünf breite Teilgebiete; Zustandssummen, thermodynamische Ableitungen und bloß qualitative Überblicke dürfen nicht dieselbe Mathematics-Schranke bekommen.',
     ['Thermodynamik', 'statistische Ensembles', 'ideale Quantengase', 'wechselwirkende Systeme und Phasenübergänge', 'Nichtgleichgewicht']),
 'PH0009': ('physics', 'laboratory-mechanics-and-thermodynamics',
     'Versuchsdurchführung in Mechanik/Thermodynamik ist eine physikalische Prozesskompetenz. Messunsicherheiten und Datenanalyse sind weitere Quelle-Outcomes, nicht schon durch diesen ersten Outcome nachgewiesen.',
     'Nur Versuchsdurchführung im Graph; wissenschaftlicher Bericht, Messunsicherheit und Datenanalyse fehlen.',
     ['Versuchsdurchführung', 'wissenschaftlicher Bericht', 'Messunsicherheiten', 'Experiment-Modell-Beziehung', 'manuelle und softwaregestützte Datenanalyse']),
 'PH0010': ('physics', 'laboratory-electromagnetism',
     'Versuchsdurchführung in Thermodynamik, Elektrodynamik/Magnetismus ist Physik, mit experimentabhängiger Mathematik.',
     'Nur erster Outcome; breite Labormethoden und Auswertung aus der Quelle fehlen.',
     ['Versuchsdurchführung', 'Messunsicherheiten', 'Experiment-Modell-Beziehung', 'manuelle und softwaregestützte Datenanalyse', 'wissenschaftlicher Bericht']),
 'PH0011': ('physics', 'laboratory-optics-atomic-nuclear',
     'Versuchsdurchführung in Optik, Atom-/Kernphysik ist eine Physik-Prozesskompetenz; mathematische Vorbereitung richtet sich nach ausgewählten Versuchen.',
     'Nur erster Outcome; quantitative Auswertung und wissenschaftliches Schreiben fehlen.',
     ['Versuchsdurchführung', 'Messunsicherheiten', 'Experiment-Modell-Beziehung', 'manuelle und softwaregestützte Datenanalyse', 'wissenschaftlicher Bericht']),
 'PH0014': ('physics', 'nuclear-particle-and-astrophysics-i',
     'Der Outcome fordert Standardmodell-Anwendungen und Experimentverständnis, nicht bloß Mathematik oder allein Administration eines Studienkatalogs.',
     'Breites Physikbündel; konzeptionelle Experimente und quantitative Streuung/Gruppensymmetrien brauchen getrennte Nachweise.',
     ['Beschleuniger und Detektoren', 'Streuung und Wirkungsquerschnitte', 'Symmetrien und relativistische Gleichungen', 'Standardmodell und Wechselwirkungen']),
 'PH0015': ('physics', 'nuclear-particle-and-astrophysics-ii',
     'Schwache Wechselwirkung, Kernmodelle/Zerfälle und Kosmologie sind Physik; der Quarkflavour-Inhaltsfetzen belegt nicht alle diese Kompetenzen.',
     'Breites Folge-Modul; Matrixmixing, Zerfälle und kosmologische Konzepte müssen getrennt operationalisiert werden.',
     ['Flavourmixing und CP', 'Kernmodelle und Zerfälle', 'Kernreaktionen', 'Sternentwicklung und Kosmologie']),
 'PH0016': ('physics', 'conceptual-nuclear-particle-and-astrophysics',
     'Die einzige vorhandene Kompetenz ist konzeptionelles Beschleuniger-/Detektorverständnis; die Quelle enthält weitere konzeptionelle Fachziele.',
     'Nur erster von fünf Outcomes; mathematisch anspruchsvolle Expert-Module dürfen nicht aus dem Modultitel hineingelesen werden.',
     ['Beschleuniger/Detektoren', 'Theoriekonzepte', 'Wechselwirkungen und Standardexperimente', 'Kernphysik', 'Astronomie und Astrophysik']),
 'PH0017': ('physics', 'condensed-matter-i',
     'Die vorhandene Outcome-ID endet beim Einleitungssatz; die Quelle fordert anschließend Kristallstruktur, Gitterdynamik, Thermik und Elektronentransport.',
     'Kein prüfbarer Inhalt in der Outcome-ID. Die nachfolgenden vollständigen Quelle-Outcomes fehlen.',
     ['Struktur-Eigenschaft-Beziehungen', 'experimentelle Methoden', 'quantitative klassische/Quanten-/thermodynamische Modelle', 'Transfer zu Materialien']),
 'PH0018': ('physics', 'condensed-matter-ii',
     'Beobachtete Festkörpereigenschaften mit Kristall-/Bandstruktur zu erklären ist Physik. Die Quelle spezifiziert mehr Material- und Methodenkompetenzen als das erste Blatt.',
     'Nur erster von sieben Outcomes; einzelne Stoffklassen, quantitative Modelle und Bauelemente fehlen.',
     ['Struktur und elektronische Bänder', 'Materialklassen', 'elektrische/magnetische/optische Experimente', 'quantitative Modelle', 'Bauelemente']),
 'PH0019': ('physics', 'conceptual-condensed-matter',
     'Bindungsarten gegebenen Stoffen zuzuordnen ist im Festkörperkontext Physik mit chemischem Überschneidungsbereich; kein mathematischer Operator wird im vorhandenen Outcome verlangt.',
     'Nur erster von sechs Outcomes; Intro-Kompetenz nicht mit dem ganzen quantitativen Festkörperkurs gleichsetzen.',
     ['Bindungsarten', 'Strukturanalyse', 'Gitterdynamik', 'Elektronen und Transport', 'Halbleiter/Supraleiter/Magnetismus', 'Dielektrika']),
 'PH0020': ('physics', 'biophysics',
     'Naturbausteine und ihre Beziehungen sind der einzige vorhandene Outcome; Biologie/Chemie überschneiden sich mit dem physikalischen Modellkontext.',
     'Sehr allgemeiner erster Outcome; vollständige Quelle-Outcomes fehlen und bestimmen erst den tatsächlichen Mathematikbedarf.',
     ['Naturbausteine und Beziehungen', 'biophysikalische Modelle und Methoden']),
 'PH0021': ('physics', 'energy-science',
     'Energetische und exergetische Effizienz zu bestimmen ist eine klar quantitative thermodynamische Physikkompetenz.',
     'Prüfbarer erster Outcome; technische Systeme unterscheiden Algebra von Integralbilanz. Weitere Energiesystem-Outcomes fehlen.',
     ['energetische und exergetische Effizienz', 'Energiebilanzen', 'Wärmekraftmaschinen', 'Solarthermie und Photovoltaik']),
 'PH0022': ('physics', 'materials-science',
     'Mikro-/Nanostruktur mit Eigenschaften und Belastungsgrenzen zu verknüpfen ist Materialphysik mit Chemieanteilen; das AEP/Semester-Fragment ist Administration.',
     'Breites Struktur/Eigenschaften/Phasendiagramm/Bewertungsbündel; quantitative Zusatzmodelle nicht als allgemeine Pflicht voraussetzen.',
     ['Struktur-Eigenschaft-Beziehungen', 'Phasendiagramme und Umwandlungen', 'Materialien bewerten und Belastungsgrenzen']),
 'PH0023': ('physics', 'introductory-biophysics',
     'Strukturbestimmungsmethoden für Biomoleküle sind physikalische Messmethoden mit biologischem Objekt; die quantitative Diffusions/PDE-Quelle darf nicht pauschal Voraussetzung für diesen ersten Beschreibungs-Outcome sein.',
     'Nur erster von neun Outcomes; quantitative Transport-, Elektrolyt-, Membran- und Reaktions-Diffusionskompetenzen fehlen.',
     ['Biomolekül-Strukturbestimmung', 'Transport und Diffusion', 'Elektrolyte und Membranpotentiale', 'Reaktions-Diffusion', 'Bildgebung und Bildverarbeitung']),
 'PH0024': ('physics', 'advanced-quantum-mechanics',
     'Fermis goldene Regel herzuleiten und Übergangswahrscheinlichkeiten auszurechnen ist eine konkrete Physikkompetenz mit Operatoralgebra und zeitabhängigen Integralen.',
     'Nur erster von acht Outcomes; Streuamplitude, optisches Theorem, Partialwellen und Multipole fehlen.',
     ['goldene Regel und Übergangswahrscheinlichkeiten', 'Streuamplituden und Wirkungsquerschnitte', 'optisches Theorem', 'Partialwellen, Resonanzen und Multipole']),
 'PH0031': ('physics', 'research-and-experimental-process-skills',
     'Selbstständige fachliche Experimentvorbereitung ist prüfbar, aber nicht identisch mit schon erfolgreicher quantitativer Datenanalyse. Der Workload-Prosaabschnitt ist Programmorganisation.',
     'Nur erster von sechs Outcomes; Aufbau, Dokumentation, Auswertung/Bericht, Recherche und Vortrag müssen als eigene Prozessziele folgen.',
     ['Experimentvorbereitung', 'Aufbau und Durchführung', 'Dokumentation', 'Auswertung und Bericht', 'Literaturrecherche', 'wissenschaftlicher Vortrag']),
 'PH8016': ('physics', 'conceptual-nuclear-particle-and-astrophysics-en',
     'Englischer Intro-Outcome zu Beschleunigern/Detektoren entspricht fachlich PH0016; der Spracheintrag schafft keine neue Mathematikkompetenz.',
     'Nur erster von fünf Outcomes; Gleichwertigkeit zu PH0016 fachlich plausibel, aber Stable-ID-Mastery wird nicht automatisch übertragen.',
     ['Beschleuniger/Detektoren', 'Theoriekonzepte', 'Wechselwirkungen', 'Kernphysik', 'Astrophysik']),
 'PH8019': ('physics', 'conceptual-condensed-matter-en',
     'Festkörperbindungen zuordnen ist der Intro-Outcome; obwohl Modul englisch benannt ist, sind diese Goaltexte deutsch.',
     'Nur erster von sechs Outcomes; Sprachmetadaten und fachliche Äquivalenz zu PH0019 separat klären.',
     ['Bindungsarten', 'Strukturanalyse', 'Gitterdynamik', 'Elektronen und Transport', 'Materialklassen', 'Dielektrika']),
}

SOURCE_RECORDS = {}
module_landscapes = {}
for path, land in landscapes.items():
    if path == degree_path:
        continue
    code = Path(path).name.removeprefix('DE_BAY_U_TUM_').removesuffix('.de.json')
    module_landscapes[code] = (path, land)
    rawpath = BASE + '/input/raw/DE_BAY_U_TUM_' + code + '.txt'
    raw = (ROOT / rawpath).read_text()
    sections = {}
    for section in ('content', 'outcomes', 'preconditions'):
        start = raw.index(section + ':') + len(section) + 1
        ends = [raw.find('\n' + s + ':', start) for s in ('content', 'outcomes', 'preconditions')]
        end = min([x for x in ends if x >= 0], default=len(raw))
        text = raw[start:end].strip()
        sections[section] = {'textSha256': sha_bytes(text.encode()), 'startLine': raw[:start].count('\n') + 1,
                             'endLine': raw[:end].count('\n') + 1}
    SOURCE_RECORDS[code] = {'localExtractPath': rawpath, 'localExtractSha256': sha_file(rawpath),
        'officialUrlCandidate': 'https://academics.nat.tum.de/org/mh/details/mod/' + code,
        'officialUrlBasis': 'Existing sourceRef on both occurrences of the actual module container; locally retained degree URL template and current official degree links use same module code.',
        'retrievalDateAndSourceVersionInExtract': None,
        'sourceVerification': 'local-extract-inspected-official-module-body-not-currently-verified',
        'sections': sections,
        'preconditionsLocalText': raw.split('preconditions:', 1)[1].strip(),
        'subjectDecision': MODULES[code][0]}

CONTENT_ROLES = {
 'CH1104': [('contentList', 'Die vollständige Stichwortliste nennt Themen, aber keine separat prüfbare Lernhandlung.')],
 'CIT513016': [('contentList', 'Vollständige Liste vieler mathematischer Themen, keine individuelle assessable Kompetenz.')],
 'CIT513017': [('truncatedContent', 'Nur Reelle und komplexe Zahlen; sechs weitere Inhaltszeilen sind im Raw-Extrakt vorhanden.')],
 'CIT513018': [('truncatedContent', 'Nur erste Inhaltszeile zu mehreren Veränderlichen; Taylor, implizite Funktionen, Kurvenintegrale und ODE fehlen.')],
 'CIT513019': [('truncatedContent', 'Nur Integrationstheorie im R^n; Integralsätze, Fourier, Funktionentheorie, Hilberträume und PDE fehlen.')],
 'PH0001': [('emptyContentHeading', 'Experimentalphysik: benennt lediglich eine Abschnittsüberschrift; weder Mechanik noch mathematische Ergänzungen sind operationalisiert.')],
 'PH0002': [('emptyContentHeading', 'Elektrizitätslehre: ist nur die Überschrift vor der eigentlichen Themenliste.')],
 'PH0003': [('truncatedContent', 'Die erste Themenzeile Elektromagnetische Wellen ersetzt weder die vollständige Liste noch eine assessable Kompetenz.')],
 'PH0004': [('moduleScopeDescription', 'Der Zwei-Drittel/Ein-Drittel-Satz ist Stoffverteilung, keine Lernkompetenz.')],
 'PH0005': [('truncatedContent', 'Erste Themenzeile der Mechanik; sie enthält keine Lernhandlung und nicht die gesamte Quelle.')],
 'PH0006': [('truncatedContent', 'Erste Themenzeile; Elektrostatik/Magnetostatik ist keine eigenständig operationalisierte Kompetenz.')],
 'PH0008': [('truncatedContent', 'Nur Überschrift der statistischen Begründung; kein assessable Ensemble- oder Zustandssummenziel.')],
 'PH0009': [('courseActivity', 'Sechs Gruppenversuche ist ein Workload-/Aktivitätsauftrag; er spezifiziert kein separates Lernkriterium.')],
 'PH0010': [('courseActivity', 'Sechs Gruppenversuche ist Aktivitätsumfang, keine individuelle erfolgreiche Kompetenz.')],
 'PH0011': [('courseActivity', 'Sechs Gruppenversuche ist Aktivitätsumfang, keine atomare Versuchs-/Auswertungskompetenz.')],
 'PH0014': [('emptyContentHeading', 'Experimentelle Grundlagen ist eine Themenabschnittsüberschrift ohne Kompetenz.')],
 'PH0015': [('truncatedContent', 'Flavourphysik ist nur der erste Abschnitt des Stoffplans; kein assessable Mixing-Goal.')],
 'PH0016': [('teachingDescription', 'Dieser Satz beschreibt Vermittlungsabsicht, keine Handlung der lernenden Person.'),
             ('teachingDescription', 'Der Schwerpunkt von Theorie/Experiment beschreibt Lehrinhalt, kein separates Lernergebnis.')],
 'PH0017': [('truncatedContent', 'Bindungstypen/-kräfte ist die erste Themenüberschrift, kein prüfbares Zuordnungs-/Modellziel.')],
 'PH0018': [('truncatedContent', 'Dielektrische ist ein abgebrochener Adjektivfetzen ohne Gegenstand oder Kompetenz.')],
 'PH0019': [('truncatedContent', 'Bindungstypen/-kräfte ist die erste Themenüberschrift; der Outcome daneben ist erst die Zuordnungskompetenz.')],
 'PH0020': [('teachingDescription', 'Der Einführungssatz beschreibt den Kurs, keine überprüfbare Fähigkeit.')],
 'PH0022': [('programMetadata', 'AEP und 6. Semester geben die Adressatengruppe an; dies ist Administration, kein Fachziel.'),
             ('moduleScopeDescription', 'Der Satz beschreibt Design/Funktionalität/Materialeigenschaften als Lehrstoff, keine Lernhandlung.'),
             ('moduleScopeDescription', 'Die Liste von Eigenschaftsklassen beschreibt Schwerpunktsetzung des Kurses.'),
             ('truncatedDescription', 'Der Satz endet bei z.; kein vollständiger Gegenstand und keine Lernhandlung.'),
             ('contentList', 'Materialklassen-Aufzählung ist Taxonomie, keine eigenständige Kompetenz.'),
             ('teachingDescription', 'Erörtern durch den Kurs beschreibt Vermittlung, nicht einen Nachweis der lernenden Person.')],
 'PH0023': [('teachingDescription', 'Der Kurs-Einführungssatz spezifiziert kein einzelnes Biophysik-Lernziel.')],
 'PH0024': [('truncatedContent', 'Hamilton-Operator und Näherungen sind eine Themenliste, keine individuell assessable Handlung.')],
 'PH0031': [('programMetadata', 'Lehrveranstaltungen und 60/40-Arbeitslast sind Programmorganisation, kein individuelles Lernergebnis.'),
             ('courseActivity', 'Durchlaufen der Forschungsphasen ist eine breite Kursaktivität, keine atomare Prozesskompetenz mit Erfolgskriterium.')],
 'PH8016': [('teachingDescription', 'Englische Vermittlungsabsicht des Intro-Kurses, keine individuelle Kompetenz.'),
             ('teachingDescription', 'Theorie/Experiment-Schwerpunkt beschreibt das Lehrangebot, keine separate Fähigkeit.')],
 'PH8019': [('truncatedContent', 'Nur erste Themenzeile, nicht der vollständige Festkörper-Stoffplan oder eine Lernhandlung.')],
}

editorial = {}
for code, (path, land) in module_landscapes.items():
    domain, topic, why, quality, covered = MODULES[code]
    nonorient = [g for g in land['goals'] if not g.get('contains') and not g['title'].startswith('Warum ')]
    outcome = nonorient[0]
    for g in land['goals']:
        if g.get('contains'):
            role = 'programModuleContainer'
            rational = 'Bündelt das Modul und seine Quellen-/Outcome-Fragmente; trotz technischem contains-Cluster keine dauerhafte atomare Fachkompetenz. ' + why
            assess = False
            granular = 'program-unit'
        elif g['title'].startswith('Warum '):
            role = 'orientation'
            rational = 'Expliziter Motivationseinstieg, kein fachlicher Leistungsnachweis. TUM-Module ist die technische Sammelbezeichnung; der konkrete Fachkontext ist ' + domain + '/' + topic + '.'
            assess = False
            granular = 'non-assessment-completion'
        elif g['id'] == outcome['id']:
            role = 'truncatedOutcomePreamble' if code in ('PH0005', 'PH0017') else 'assessableOutcomeCandidate'
            rational = why
            assess = code not in ('PH0005', 'PH0017')
            granular = 'missing-assessable-text' if not assess else 'assessable-module-bundle-needs-atomic-authoring'
            if code in ('PH0016','PH0019','PH0020','PH0021','PH0023','PH0024','PH0031','PH8016','PH8019'):
                granular = 'one-assessable-outcome-currently-present-rest-of-module-missing'
        else:
            idx = [x['id'] for x in nonorient[1:]].index(g['id'])
            role, rational = CONTENT_ROLES[code][idx]
            assess = False
            granular = 'not-a-competency-as-written'
        editorial[g['id']] = {'ownerPath': path, 'ownerLandscapeId': land['landscapeId'],
            'moduleCode': code, 'subjectRole': 'administration' if role == 'programMetadata' else domain,
            'competencySubject': domain if assess else None, 'subjectComponents': [domain],
            'semanticRole': role, 'assessableAsWritten': assess,
            'granularity': granular, 'roleRationale': rational, 'qualityGap': quality if g['id'] == outcome['id'] else None,
            'sourceContentTopicCoverage': covered if g['id'] == outcome['id'] else None,
            'ownerRationale': 'Own module ' + code + ' is the explicit content authoring unit: its local content/outcomes source matches this definition. The degree occurrence is a program embedding. The selected owner is an author recommendation, not a runtime collision-resolution rule.'}
        if code == 'PH0006' and g['id'] == outcome['id']:
            editorial[g['id']]['subjectComponents'] = ['physics','mathematics']
            editorial[g['id']]['subjectRole'] = 'physics-with-assessable-mathematical-method-components'
        if code == 'PH0001' and g.get('contains'):
            editorial[g['id']]['subjectComponents'] = ['physics','mathematics']
        if code in ('PH0019','PH8019') and g['id'] == outcome['id']:
            editorial[g['id']]['subjectComponents'] = ['physics','chemistry']
        if code in ('PH0020','PH0023','PH0022') and g['id'] == outcome['id']:
            editorial[g['id']]['subjectComponents'] = ['physics','biology' if code != 'PH0022' else 'chemistry']

for g in degree['goals']:
    if g['id'] in editorial:
        continue
    orientation = g['title'].startswith('Warum ')
    role = 'orientation' if orientation else ('programDegreeContainer' if g['id'] == degree['landscapeId'] else 'programStructure')
    editorial[g['id']] = {'ownerPath': degree_path, 'ownerLandscapeId': degree['landscapeId'], 'moduleCode': None,
        'subjectRole': 'physics' if orientation else 'structure', 'competencySubject': None,
        'subjectComponents': ['physics'] if orientation else [], 'semanticRole': role,
        'assessableAsWritten': False, 'granularity': 'non-assessment-completion' if orientation else 'program-unit',
        'roleRationale': ('Motivation für den Physik-Degree, keine Prüfung fachlicher Beherrschung.' if orientation else
            'Die Definition "' + g['description'] + '" ordnet Semester, Phase, Abschluss oder Wahlkatalog; sie spezifiziert keine atomare Kompetenz. Die Pflicht/Wahl-/Alternativwahl ist eine Programmscope-Regel, kein requires-Nachweis.'),
        'qualityGap': ('Bachelorarbeit PH0041 und Kolloquium PH0040 stehen im Degree-Extrakt, sind aber nicht als Kompetenzen enthalten.' if g['title'] == 'Abschluss' else None),
        'sourceContentTopicCoverage': None,
        'ownerRationale': 'Degree-specific structure or motivation has no independent module content owner; retain degree ownership as a proposed program-layer decision.'}

# Independently enumerate all active occurrences, not only the selected files.
selected_ids = {g['goalId'] for g in family['goals']}
all_hits = collections.defaultdict(list)
for p in (ROOT / 'curricula').rglob('*.json'):
    if {'quality','input','archive'} & set(p.relative_to(ROOT / 'curricula').parts):
        continue
    try:
        d = json.loads(p.read_text())
    except (ValueError, UnicodeError):
        continue
    if not isinstance(d, dict):
        continue
    for g in d.get('goals', []):
        if isinstance(g, dict) and g.get('id') in selected_ids:
            all_hits[g['id']].append({'path': str(p.relative_to(ROOT)), 'landscapeId': d.get('landscapeId'), 'goal': g})

rows = []
for inv in family['goals']:
    gid = inv['goalId']
    ed = editorial[gid]
    occurrences = []
    definitions = []
    for o in inv['occurrences']:
        n = next(g for g in landscapes[o['path']]['goals'] if g['id'] == gid)
        definitions.append(n)
        origin_indices = inventory['prerequisiteOriginSets'][o['prerequisiteOriginsRef']]
        origins = [inventory['prerequisiteOriginTable'][i] for i in origin_indices]
        occurrence = {**o, 'originalDefinition': n,
            'resolvedEffectiveRequires': inventory['effectivePrerequisiteSets'][o['effectiveRequiresRef']],
            'resolvedPrerequisiteOrigins': origins,
            'proposedOccurrenceRole': 'authoring-owner' if o['path'] == ed['ownerPath'] else 'program-embedding',
            'sourceBindingsResolvedFileList': inventory['sourceBindingFileSets'][o['scope']['sourceBindingFilesRef']]}
        occurrences.append(occurrence)
    differences = {}
    for k in sorted(set().union(*(set(n) for n in definitions))):
        values = [n.get(k) for n in definitions]
        if any(v != values[0] for v in values[1:]):
            differences[k] = [{'path': o['path'], 'value': v} for o,v in zip(inv['occurrences'],values)]
    rows.append({'goalId': gid, 'title': definitions[0]['title'],
        'inventoryReviewRequired': inv['reviewRequired'], 'inventoryReviewStatusUnchanged': inv['reviewStatus'],
        'originalDefinitionStatus': inv['definitionStatus'], 'originalAuthoritativeOwner': inv.get('authoritativeOwner'),
        'allActiveOccurrencesIndependentlyEnumerated': [{'path': h['path'], 'landscapeId': h['landscapeId']} for h in all_hits[gid]],
        'roleAndOwnershipAuthorProposal': ed,
        'ownershipResolutionStatus': 'proposed-owner-selected-independent-review-pending',
        'definitionConflictAnalysis': {'differentFields': differences,
             'technicalKindsAcrossOccurrences': sorted({o['technicalRole'] for o in inv['occurrences']}),
             'kindConflictPresent': len({o['technicalRole'] for o in inv['occurrences']}) != 1,
             'resolution': ('Retain the module as authoring owner and represent the degree placement by reference. Reconcile contains/requires to a single identical shared definition only after independent review; no source bytes changed.' if differences else
                'No different raw definition fields. Explicit owner is still required for duplicated stable IDs.'),
             'requiresDoNotProveCompetency': 'The differing edges point to local orientation. Degree descendants also inherit degree orientation. Neither is a mathematics/physics content prerequisite; preserve the difference as evidence, not mastery.'},
        'occurrences': occurrences})

assert len(rows) == 142
assert len(editorial) == 142
assert sum(len(g['allActiveOccurrencesIndependentlyEnumerated']) for g in rows) == 238
assert all(len(g['allActiveOccurrencesIndependentlyEnumerated']) == len(g['occurrences']) for g in rows)
conflicting = [g for g in rows if g['definitionConflictAnalysis']['differentFields']]
assert len(conflicting) == 60
assert all(set(g['definitionConflictAnalysis']['differentFields']) <= {'contains','requires'} for g in conflicting)

audit = {
 'schemaVersion': 1, 'auditId': 'tum-bsc-physics-role-ownership-author-20261013-v1',
 'createdAt': '2026-10-13', 'familyId': 'tum-bsc-physics', 'inert': True,
 'authorIdentity': 'Codex author /root/noncanonical_subject_scope',
 'reviewStatus': 'author-proposal-independent-review-pending', 'approval': False,
 'licensing': {'auditToolingAndTechnicalMetadata': 'Apache-2.0', 'ownCurricularRecommendations': 'CC-BY-4.0',
      'originalEvidence': 'Original goals/source extracts keep existing rights and provenance; local evidence is not re-licensed. Official sources are referenced, not claimed as SkillPilot-owned content.'},
 'scope': {'coverage': 'All 142 selected stable IDs, every 238 active occurrence, every 31 selected landscape, and 30 local module extracts inspected.',
      'ownershipAndRoles': 'complete-author-proposal', 'requiresIntegration': 'not-complete-not-activated',
      'independentReview': 'pending', 'activeStatusChanges': [], 'activeCurriculumChanges': []},
 'inputBindings': [{'path': CONFIG, 'sha256': sha_file(CONFIG)}, {'path': INVENTORY, 'sha256': sha_file(INVENTORY)},
       {'path': 'AGENTS.md', 'sha256': sha_file('AGENTS.md')},
       {'path': BASE+'/input/DE_BAY_U_TUM_xyz.txt', 'sha256': sha_file(BASE+'/input/DE_BAY_U_TUM_xyz.txt')}],
 'landscapeBindings': [{**l, 'currentSha256': sha_file(l['path']),
                          'matchesInventory': sha_file(l['path']) == l['fileSha256']} for l in family['landscapes']],
 'counts': {'stableGoalIds': len(rows), 'activeOccurrences': 238, 'landscapes': 31, 'technicalLeaves': 98,
      'definitionConflictGroups': 60,
      'conflictFieldsCounts': dict(collections.Counter(k for g in conflicting for k in g['definitionConflictAnalysis']['differentFields'])),
      'technicalKindConflictGroups': sum(g['definitionConflictAnalysis']['kindConflictPresent'] for g in rows),
      'proposedSemanticRoles': dict(collections.Counter(g['roleAndOwnershipAuthorProposal']['semanticRole'] for g in rows)),
      'proposedCompetencySubjects': dict(collections.Counter(g['roleAndOwnershipAuthorProposal']['competencySubject'] or 'not-assessable-as-written' for g in rows)),
      'occurrencesWithSourceRef': sum(o['sourceRef'] is not None for g in rows for o in g['occurrences']),
      'occurrencesWithSourceBindingRecords': sum(o['scope']['sourceBindingRecordCount'] > 0 for g in rows for o in g['occurrences']),
      'reviewApprovalsCreated': 0},
 'semantics': {'landscapeIsNotSubject': True,
      'actualPrerequisites': 'Only atomic necessary competencies qualify for hard requires. Module source prerequisites are context evidence and must be decomposed; recommended modules and alternatives are not AND requirements.',
      'effectiveRequires': 'Current direct declarations plus all contains-ancestor declarations, separately preserved per occurrence. No transitive requires closure is treated as mastery.',
      'requiresTransitiveMastery': False, 'ownerDecisionIsNotActivation': True,
      'noInventedBScMathLink': 'CIT513016–19 and PH0001 mathematical supplements are inspected first. BSc Mathematics cannot be substituted on landscape-title similarity.'},
 'sourceEvidence': SOURCE_RECORDS,
 'officialWebInspection': {
      'checkedOn': '2026-10-13',
      'degree': {'url': 'https://academics.nat.tum.de/bsc/ph/curriculum',
          'observed': 'Current official degree lists CIT513016–19 and integrated mathematical supplements in first-year experimental physics, and labels catalog alternatives. It also lists NAT3070, absent from this 142-ID inventory.'},
      'moduleBodies': [{'url':'https://academics.nat.tum.de/org/mh/details/mod/'+c,
                       'observed':'Web text retrieval returned the module-description site shell without module body; no current verification of the retained extract is claimed.'} for c in ('CIT513018','CIT513019','PH0005')],
      'webEvidenceIsNotFullExtractApproval': True},
 'openGaps': [
    {'gapId':'TUM-PH-SOURCE-BINDINGS', 'kind':'source',
     'description':'All 238 occurrences lack provenance/source-binding records. The 30 module container IDs have direct official sourceRef URLs in their 60 occurrences, while the 178 remaining occurrences have no direct sourceRef. Container URLs identify a source route but do not prove approved individual outcome mappings. Local official-module extracts lack retrieval date/version; establish hash-bound source bindings before QA approval.'},
    {'gapId':'TUM-PH-MA920-CIT-CROSSWALK', 'kind':'source-and-scope',
     'description':'PH0002–8 retained prerequisite text uses MA9201–4 and a separate teacher-training path MA9935 etc.; current degree uses CIT513016–19. Similar sequence is not source proof of equivalence. Need official historic-to-current mapping and curricular version; never import both BSc and teacher-training routes as an AND set.'},
    {'gapId':'TUM-PH-MATH-ATOMS', 'kind':'granularity',
     'description':'CIT module outcomes and raw lists are not individual validated math atoms. Create reviewed derivative/integral/ODE/linear algebra/Fourier/Hilbert/PDE children first; do not require entire modules for every physics goal.'},
    {'gapId':'TUM-PH-EXP1-SUPPLEMENT', 'kind':'missing-mathematics-scope',
     'description':'PH0001 source has three explicit mathematical outcomes plus supplements, but current graph keeps only the first measurement outcome and a section heading. Introductory calculations must remain available via the integrated route instead of waiting for complete later mathematics modules.'},
    {'gapId':'TUM-PH-EXTRACTION-LOSS', 'kind':'granularity-and-source-coverage',
     'description':'PH0005 and PH0017 outcome IDs are empty preambles; many other modules retain only first outcome/content line. Recover all cited outcome lines and individually operationalize them before claiming curriculum/requires completeness.'},
    {'gapId':'TUM-PH-OUTCOME-WEIGHT', 'kind':'modeling-and-progress',
     'description':'Existing 30 outcome candidates retain weight 0 while module containers carry ECTS weights. Role classification and dependency drafting do not settle atomic progress weights or certify a functional learning-progress projection. Any later atomic authoring must decide weights explicitly without converting ECTS directly into competence mastery.'},
    {'gapId':'TUM-PH-CATALOG-SCOPE', 'kind':'scope',
     'description':'Degree contains choice catalogs and parallel intro languages. Do not count every elective/intro/expert as simultaneously mandatory. Degree completion, technical contains and program choices need explicit scope modeling. Current official NAT3070 and terminal PH0041/PH0040 are missing from selected modeled goals.'},
    {'gapId':'TUM-PH-ORIENTATION-KINDS', 'kind':'semantic-role',
     'description':'31 motivational leaves remain unclassified in inventory. Author proposes orientation; no scored mastery or fachliche prerequisite inference. Local orientation and degree orientation currently differ by embedding.'},
    {'gapId':'TUM-PH-DUPLICATE-ACTIVATION', 'kind':'ownership',
     'description':'All 60 differing definitions have proposed content owners and exact field differences retained. A future integration must make shared definitions identical or use references and recheck runtime scope; selecting an owner here changes no live resolution.'},
    {'gapId':'TUM-PH-INDEPENDENT-REVIEW', 'kind':'review',
     'description':'This is author work. A different reviewer must review role/owner decisions, source interpretations, atomic split and every new requires edge. No automatic approval from inventory or this JSON.'}
 ],
 'goals': rows,
}
dump('role-ownership.author.json', audit)
print(json.dumps(audit['counts'], ensure_ascii=False, indent=2))
