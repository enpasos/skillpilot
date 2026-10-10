"""Whole-object guards for the independently read national placements and prerequisites.

The content decisions below are bounded Root judgments. These guards verify their
exact current inputs; they do not make source, performance or human approvals.
"""
import hashlib
import importlib.util
import json
from pathlib import Path
import subprocess

import jsonschema

ROOT = Path.cwd()
DATE = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09')
SOURCE = DATE / 'wirtschaft-current125-native-mapping-and-explicit-BE-course-author-20261009-v1'
OUT = DATE / 'wirtschaft-national31-and-two-GK-prerequisites-independent-root-v1'


def read(path):
    return json.loads(Path(path).read_text())


def binding(path):
    path = Path(path)
    raw = path.read_bytes()
    return {'path': path.as_posix(), 'sha256': hashlib.sha256(raw).hexdigest(), 'wholeBytes': len(raw)}


def check_binding(value):
    actual = binding(value['path'])
    assert actual['sha256'] == value['sha256'], value['path']
    if 'wholeBytes' in value:
        assert actual['wholeBytes'] == value['wholeBytes'], value['path']
    return actual


def write(name, payload):
    p = OUT / name
    assert not p.exists(), f'Immutable output exists: {p}'
    p.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + '\n')
    assert read(p) == payload


placement_path = SOURCE / 'thirty-one-existing311-current-whole-Goal-qualified-P-and-specific-source-national-DE-pool-only-placement.author-v2.json'
placements = read(placement_path)
check_binding(placements['canonical'])
canonical = read(placements['canonical']['path'])
goals = {g['id']: g for g in canonical['goals']}
assert len(goals) == 485
positive_path = DATE / 'wirtschaft-current-P336-V336-qualified-input-and-selective-native-binding-author-v1/current-Root-qualified485-v12-SEM485-final-binding-only-v2/whole-P336-qualified-original-content-status-and-current-goal-resource-bindings-only.jsonl'
positive = {r['goalId']: r for r in map(json.loads, positive_path.read_text().splitlines())}
assert len(positive) == 336
assert sum(len(r['profile']['applicationCaseBriefs']) for r in positive.values()) == 685
source_binding = placements['wholePlacementRows'][0]['currentBYSourceExtraction']
check_binding(source_binding)
extraction = read(source_binding['path'])
source_goals = {g['id']: g for g in extraction['sourceGoals']}
passages = {p['id']: p for p in extraction['passages']}
reasons = [
    'Aktuelle wirtschaftliche und rechtliche Entwicklungen einschließlich Digitalisierung sind ein konkreter bereits qualifizierter Bestand mit direktem J11.14-Ursprung.',
    'Zukunftsszenarien und ihre Voraussetzungen bilden einen eigenen qualifizierten Vertrag mit J11.15-Ursprung und gültigem Anschluss an die Entwicklungsanalyse.',
    'Verantwortliche ökonomische Zukunftsgestaltung hat einen bestehenden messbaren Vertrag und J11.16-Ursprung; die Platzierung ändert die vorhandene Kompetenz nicht.',
    'Spieltheoretische Handlungsstrategien gehören als eigenständiges WWG-Quellenelement zum nationalen Pool; diese Herkunft macht sie nicht allgemein verpflichtend.',
    'Preis- und Zinsniveauwirkungen für drei Sektoren sind konkret in J13.9 grundlegend verankert; bestehende Modellfälle und Kursmetadaten bleiben erhalten.',
    'Mandatsbezogene EZB-Entscheidungen sind konkret in J13.11 verankert; der nationale Target ergänzt keine unbewiesene Länderpflicht.',
    'Die aktuelle Geldpolitik-Erörterung ist im erhöhten bayerischen Quellenniveau verankert. Ihre alten technischen GK/LK-Tags werden hier nicht als bayerische Kursbezeichnung ausgegeben.',
    'Vernetzte makroökonomische Problembearbeitung hat den vorhandenen qualifizierten Vertrag mit erhöhtem J13.36-Ursprung; die Länder- und Kursabgrenzung bleibt gesondert.',
    'Statische Rohstoffreichweite ist ein bereits qualifizierter optionaler WWG-Profilinhalt. Nationaler Pool-Target bedeutet keine Pflicht jedes Landes oder jedes Profils.',
    'Die konkrete statistische Auswertung wirtschaftlicher, sozialer und ökologischer Daten hat direkten J11.5-Ursprung und wird ohne neue Leistungsbehauptung sichtbar.',
    'Dezentrale Koordination durch Preisfunktionen ist konkret in J11.1 verankert; vorhandene Verständnisfälle und Begriffsscope bleiben exakt.',
    'Faktorproportionentheorie ist als konkreter vorhandener optionaler WWG-Profilvertrag geeignet für den nationalen Pool; keine allgemeine Wahlpflicht wird behauptet.',
    'Der Vergleich spieltheoretischer Vorhersagen mit Versuchsdaten ist ein qualifizierter optionaler WWG-Profilvertrag; die explizite Platzierung erweitert nur den nationalen Pool.',
    'Das Kreislaufmodell mit fachsprachlichen Ursachen und Wirkungen hat direkten J11.4-Ursprung und einen bereits qualifizierten eigenständigen Vertrag.',
    'Akteure des Geld- und Kapitalmarkts sind ein konkret qualifiziertes WWG-Quellenelement mit J11.30-Ursprung; nationale Sicht und Länderpflicht bleiben getrennt.',
    'Alternative soziale Sicherung wird gemäß erhöhtem J12.33 nach Gerechtigkeit und Finanzierbarkeit diskutiert; bestehende Fälle und Kursmetadaten bleiben unverändert.',
    'Modellgestützte intendierte Wachstum- und Beschäftigungswirkungen sind direkt grundlegend in J12.7 verankert; nationaler Target behauptet keine garantierte Wirkung.',
    'Portfolioertrag und Diversifikationsgrenzen sind ein konkret qualifizierter optionaler WWG-Profilinhalt; die Platzierung hebt dessen Wahlgrenze nicht auf.',
    'Deutschlands internationale Verflechtung samt Kreislaufwirkungen hat direkten WWG-J11.26-Ursprung und einen qualifizierten vorhandenen Vertrag.',
    'Medien zur internationalen Verflechtung werden gemäß J11.13 hinsichtlich Evidenz und Intention beurteilt; der Pool-Target ändert keinen historischen Quellenbefund.',
    'Leistungsbilanz, außenwirtschaftliches Gleichgewicht und Kapitalbilanz haben einen vorhandenen qualifizierten Vertrag mit erhöhtem J13.32-Ursprung; keine bayerische GK-Gleichsetzung.',
    'Tarifpolitische Forderungen werden gemäß erhöhtem J12.31 an Wachstum, Beschäftigung und Verteilung beurteilt; vorhandene Leistungsfälle bleiben exakt.',
    'Perspektivische Politikbewertung verbindet gemäß erhöhtem J12.29 Wirkungsrichtung, Frist, Haushalt und Umwelt in einem bestehenden qualifizierten Vertrag.',
    'Wechselkurseffekte für Haushalte und Unternehmen sind konkret in J11.11 verankert; vorhandene Wechselkurskonventionen und Fälle werden nicht verändert.',
    'Nutzen und Grenzen volkswirtschaftlicher Modelle sind ein bestehender konkreter Vertrag mit erhöhtem J12.28-Ursprung; Poolrolle und Kursnorm werden getrennt.',
    'Wirtschaftspolitische Texte und Karikaturen werden gemäß J11.6 an Belegen, Intention und sozialer Marktwirtschaft beurteilt; die vorhandene Qualifikation wird erhalten.',
    'Spieltheoretische Grundmodelle sind gemäß WWG-J11.33 auf echte Entscheidungsbedingungen bezogen; nationale Platzierung schafft keine zusätzliche Länderpflicht.',
    'Institutionenökonomische Regelanalyse der sozialen Marktwirtschaft hat direkten WWG-J11.32-Ursprung und einen bereits qualifizierten aktuellen Vertrag.',
    'Finanzierung und Gerechtigkeit der gesetzlichen Sozialversicherung haben den vorhandenen qualifizierten Vertrag mit erhöhtem J12.32-Ursprung.',
    'Umweltmaßnahmen zwischen Wachstum und Umwelt sind direkt in erhöhtem J12.30 verankert; vorhandene Modelle und Konfliktgrenzen bleiben unverändert.',
    'Der Gemeinwohlökonomie-Vergleich ist ein konkret qualifizierter optionaler WWG-Profilinhalt. Seine nationale Poolplatzierung behauptet keine Pflicht aller Kurse.',
]
assert len(placements['wholePlacementRows']) == len(reasons) == 31
placement_decisions = []
for row, reason in zip(placements['wholePlacementRows'], reasons):
    goal = goals[row['goalId']]
    assert goal == row['wholeCurrentGoal']
    assert positive[goal['id']] == row['wholeCurrentQualifiedPositiveRecord']
    assert positive[goal['id']]['status'] == 'needs_human_review'
    assert positive[goal['id']]['reviewAuthority'] == 'ai_candidate'
    assert positive[goal['id']]['evidenceLevel'] == 'E1'
    assert positive[goal['id']]['maximumClaimScope'] == 'G1'
    assert row['nationalAuthoredRole'] == 'target'
    assert not goal.get('contains') and not goal.get('examData') and goal.get('nodeKind') != 'memory'
    sg = source_goals[row['sourceGoalId']]
    passage = passages[row['passageId']]
    assert sg['passageId'] == row['passageId']
    assert sg['sourceSpan'] == row['sourceSpan']
    assert goal['extendedData']['provenance']['sourceGoalId'] == sg['id']
    assert goal['extendedData']['provenance']['sourceLandscapeId'] == extraction['sourceLandscapeId']
    assert sg['id'] in passage['sourceGoalIds']
    assert row['actualSourceTitleAndCourseBoundary'] == passage['title']
    placement_decisions.append({'goalId': goal['id'], 'decision': 'KEEP', 'approvedScope': 'Explicit national DE pool target placement, with unchanged real course filters and separate country obligations', 'reasonDe': reason, 'sourceGoalId': sg['id'], 'passageId': passage['id'], 'sourceSpan': sg['sourceSpan'], 'currentWholeGoalExact': True, 'currentWholeQualifiedPositiveRecordExact': True, 'newScientificPositiveOrSourceApproval': False, 'newOrdinaryIds': 0, 'humanApproval': False})

delta_path = SOURCE / 'two-existing-GK-motivation-actual-prerequisite-content-remedy-author-v1/two-individual-whole-current-contract-P-and-actual-prerequisite-content-author-proposals.json'
delta = read(delta_path)
check_binding(delta['canonicalBefore'])
check_binding(delta['canonicalAfter'])
check_binding(delta['exactWholePInput'])
after = read(delta['canonicalAfter']['path'])
after_goals = {g['id']: g for g in after['goals']}
changed = [gid for gid in goals if goals[gid] != after_goals[gid]]
assert changed == [r['goalId'] for r in delta['rows']]
assert len(changed) == 2
requires_reasons = [
    'Beide ganzen Ziel-Fälle bewerten Zugang und längerfristige Ressourcen-, Betriebs- und Finanzierungsbedingungen bereitgestellter Entwicklungsprojekte. Das aktuelle gemeinsame Armut/Entwicklungsziel prüft monetäre und nichtmonetäre Engpässe, Transfer, Produktionsförderung und Grundversorgung einschließlich Teilhabe. Es ist eine echte direkte Voraussetzung. Der spezielle Importsubstitution/Exportorientierungs-Vergleich bleibt als eigener LK-Inhalt erhalten, ist für diese Projekturteile aber keine notwendige Vorleistung. Die Änderung erhält Zielanspruch und beide Transferfälle.',
    'Beide ganzen Mitbestimmungsfälle verlangen die strukturierte Anwendung bereitgestellter gesetzlicher Rechte, Tatbestandsgrenzen und Beteiligungswege sowie ein begründetes Urteil aus beiden Perspektiven. Das aktuelle Subsumtionsziel liefert genau diese Methode. Arbeitsstunden/Kopfzahl und finanzielle Gewinnbeteiligung des entfernten LK-Vorgängers sind eigenständige Beschäftigungsanalysen, deren ganze Leistung die vorgegebenen Normfälle nicht benötigen. Schutz-, Mitsprache- und Urteilskriterien des Mitbestimmungsziels bleiben ungekürzt.',
]
requires_decisions = []
for row, reason in zip(delta['rows'], requires_reasons):
    before_goal = row['wholeBeforeGoal']
    after_goal = row['wholeAfterGoal']
    assert before_goal == goals[row['goalId']]
    assert after_goal == after_goals[row['goalId']]
    assert {k: v for k, v in before_goal.items() if k != 'requires'} == {k: v for k, v in after_goal.items() if k != 'requires'}
    assert before_goal['requires'] == [row['wholeRemovedRequirementGoal']['id']]
    assert after_goal['requires'] == [row['wholeReplacementRequirementGoal']['id']]
    for gkey, pkey in [('wholeBeforeGoal','wholeCurrentPositiveRecordExact'), ('wholeRemovedRequirementGoal','wholeRemovedRequirementPositiveExact'), ('wholeReplacementRequirementGoal','wholeReplacementRequirementPositiveExact')]:
        g, p = row[gkey], row[pkey]
        assert g == goals[g['id']]
        assert p == positive[g['id']]
    requires_decisions.append({'goalId': row['goalId'], 'decision': 'KEEP', 'approvedDelta': 'Only the actual direct prerequisite edge', 'removedRequires': before_goal['requires'], 'acceptedRequires': after_goal['requires'], 'reasonDe': reason, 'wholeSixContextGoalAndPositiveObjectsCompared': True, 'goalTextTagsCasesLegalSourcesMemoryAndSourceScopeExact': True, 'newGKTags': 0, 'newCountryTargets': 0, 'dualDescriptionClosureClaimed': False, 'humanApproval': False})

schema_path = Path('docs/landscape-runtime.schema.json')
schema = read(schema_path)
for frame in [canonical, after]:
    jsonschema.validate(frame, schema)
spec = importlib.util.spec_from_file_location('schema_portability', ROOT / 'scripts/validate_schemas.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
symlinks = module.curriculum_symlink_errors(ROOT)
assert not symlinks, symlinks
native_path = OUT / 'actual-independent-native-two-national-projections-31-roles-336-union-memory-and-two-requires-deltas.json'
native = read(native_path)
assert len(native['frames']) == 2
assert native['frames'][1]['national'][0]['actualHardRouteFindings']
write('actual-thirty-one-individual-national-pool-placement-independent-KEEP-decisions.json', placement_decisions)
write('actual-two-content-prerequisite-independent-KEEP-decisions.json', requires_decisions)
required_paths = [placement_path, positive_path, Path(source_binding['path']), delta_path, Path(delta['canonicalBefore']['path']), Path(delta['canonicalAfter']['path']), native_path, schema_path, Path('scripts/validate_schemas.py'), OUT / 'inspect_native_national_and_two_requires.ts', OUT / 'inspect_whole_contract_source_and_requires_bindings.py']
ignored = subprocess.run(['git','check-ignore','--stdin','-z'], input=b'\0'.join(str(p).encode() for p in required_paths) + b'\0', capture_output=True)
assert ignored.returncode in (0, 1)
assert not ignored.stdout, ignored.stdout
write('actual-whole-31-contract-positive-source-and-two-requires-current-bindings-guard.result.json', {'whole31GoalPositiveSourceBindings': 31, 'wholeSixPrerequisiteContexts': 6, 'exactOtherWholeGoals': 483, 'currentWholeProfiles': 336, 'currentWholeCases': 685, 'schema485BeforeAndAfter': 'PASS', 'curriculumSymlinkErrors': symlinks, 'ignoredRequiredInputPaths': [], 'requiredWholeByteInputs': [binding(p) for p in required_paths], 'newScientificPositiveReviews': 0, 'newStrictClosures': 0, 'strictNetGain': 0, 'humanApproval': False})
print(json.dumps({'nationalPlacementKEEP': 31, 'contentPrerequisiteDeltaKEEP': 2, 'wholeContexts': 6, 'otherWholeGoalsExact': 483, 'schemas': 2, 'ignoredRequiredInputs': 0, 'curriculumSymlinkErrors': 0, 'stillOpenGKTerminalFindings': 14, 'wholeViewRouteClosureClaimed': False, 'strictNetGain': 0}))
