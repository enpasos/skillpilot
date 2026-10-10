# SPDX-License-Identifier: Apache-2.0
"""Assemble this author-only successor. Does not edit live source or review ledgers."""
from pathlib import Path
import copy
import hashlib
import json
import uuid

ROOT = Path(__file__).resolve().parents[8]
PACKAGE = Path(__file__).resolve().parents[1]
REL = PACKAGE.relative_to(ROOT).as_posix()
OLD = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/chemie-b008-whole22-targeted-current-route-author-checkpoint-20261010-v1'
NEUTRAL = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/chemie-b008-current-route-HOLD-whole22-input-technical-20261010-v1'
SOURCES = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/chemie-b008-source24-dual-bounded-scope-technical-20261010-v1'

def read(p):
    return json.loads(p.read_text())

def write(name, data):
    p = PACKAGE / name
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')

def binding(p):
    b = p.read_bytes()
    return {'path': p.relative_to(ROOT).as_posix(), 'sha256': hashlib.sha256(b).hexdigest(), 'bytes': len(b)}

def uid(key):
    return str(uuid.uuid5(uuid.NAMESPACE_URL, 'https://skillpilot.org/canonical/de-gymnasium-chemistry/assessment/b008/' + key))

whole_path = OLD / 'candidate/whole511.inactive.route-author-four-edges.json'
assert binding(whole_path)['sha256'] == 'be33f5cb6095570300972b27f20ac331754b25524a8f25693888789d59db00af'
old = read(whole_path)
candidate = copy.deepcopy(old)
by = {g['id']: g for g in candidate['goals']}
assert len(by) == 511
nine = read(OLD / 'author/nine-terminal-goals.still-HOLD.json')['wholeUnchangedGoals']
assert len(nine) == 9
for g in nine:
    assert by[g['id']] == g

goals = {
    'presentation': '38e30bb9-6145-5da0-80b8-36e3c45e15d0',
    'question': '503dedcb-0efc-5e6b-bbc9-20761a0951f5',
    'models': '86d34f1f-692d-5522-a9a4-a71c65b24de7',
    'reflection': '99d41b0f-e958-54cf-a077-9bed1704a303',
    'quantitative': '9e3fae29-84d5-5600-bfb3-82d49ea3f1b5',
    'sustainability': '9f892457-c4e5-56da-830c-bf6cac0c98d7',
    'validity': 'a0080b5f-13ff-56bc-b8ff-2ff6273e2ec1',
    'knowledge': 'e5a5dcd8-053c-55fd-b5c7-bba93779da53',
    'experiment': 'f79f15c0-e848-5e17-9eb5-26753d35c93b',
}

definitions = [
    {
        'key': 'sek1-eigene-salzwasser-untersuchung', 'stage': 'SekI', 'phase': 'GLOBAL',
        'title': 'Eigene Salzwasser-Untersuchung vorstellen',
        'titleEn': 'Present an own salt-water investigation',
        'description': 'Die lernende Person kann eine tatsächlich ausgeführte eigene Salzwasser-Untersuchung anhand eigener Daten reflektieren und ihre eigenen Arbeitsergebnisse mit begründet gewählten analogen und digitalen Medien für eine passende Zielgruppe tatsächlich präsentieren.',
        'descriptionEn': 'The learner can reflect on an actually performed own salt-water investigation using own data and actually present their own results to an appropriate audience with justified analogue and digital media.',
        'covered': ['presentation', 'reflection'], 'max': 40, 'pass': 24,
        'steps': [(6, 'Eigener begründeter Untersuchungsplan'), (8, 'Tatsächliche eigene sichere Untersuchung und Rohprotokoll'), (10, 'Auswertung und konkrete Reflexion der eigenen Untersuchung'), (12, 'Tatsächlich gehaltene eigene adressatengerechte Präsentation'), (4, 'Überarbeitung aus tatsächlicher Rückfrage')],
        'parent': uid('sek1-process-local-cluster'),
        'sourceScope': 'Own local Sek-I task authoring; existing canonical cross-stage duties retained unchanged. No new Bundesland/year source coverage is granted.',
        'requiredEvidence': ['own actual investigation and raw data', 'reflection on own question, methods, concrete limits and improvement', 'actual own presentation using analogue and digital media', 'observed substantive audience questions and own answers'],
        'process': ['PK1_EXPERIMENTIEREN', 'PK4_KOMMUNIZIEREN'],
    },
    {
        'key': 'q3-eigene-saeure-untersuchung', 'stage': 'SekII', 'phase': 'Q3',
        'title': 'Eigene saure Proben qualitativ und quantitativ untersuchen',
        'titleEn': 'Independently investigate acidic samples qualitatively and quantitatively',
        'description': 'Die lernende Person kann aus einem Alltagskontext eine theoriegestützte Frage und Hypothese selbst formulieren, passende qualitative und quantitative Analysen selbst planen und im betreuten Schullabor tatsächlich durchführen, eigene Daten mit begründet gewählten mathematischen und digitalen Verfahren auswerten und den eigenen Erkenntnisweg reflektieren.',
        'descriptionEn': 'The learner can independently formulate a theory-based question and hypothesis from an everyday context, plan suitable qualitative and quantitative analyses and actually perform them in a supervised school laboratory, analyse own data with justified mathematical and digital methods, and reflect on their own inquiry.',
        'covered': ['question', 'experiment', 'quantitative', 'reflection'], 'max': 60, 'pass': 36,
        'steps': [(10, 'Selbst formulierte theoriegestützte Frage/Hypothese und Gegenbefund'), (12, 'Eigene begründete qualitative/quantitative Methodenwahl und Planung'), (12, 'Tatsächliche überwiegend selbstständige sichere Durchführung und eigene Rohdaten'), (16, 'Eigene mathematische/digitale Auswertung und begründetes Hypothesenurteil'), (10, 'Reflexion und konkrete verbesserte Folgeuntersuchung')],
        'parent': '8ee41a31-2b8e-5dd5-9496-86aab61cdf27',
        'sourceScope': 'Local Q3 protolysis/analysis module authoring, not a new state-wide placement. Original C11 course-partner holds and all bounded C12/13 source partners remain unchanged.',
        'requiredEvidence': ['own question and theory-based hypothesis before execution', 'own selection/planning of qualitative AND quantitative analyses', 'actual largely independent safe supervised performance of both parts', 'own contemporaneous qualitative observations and quantitative raw measurements', 'reproducible own mathematical/digital analysis and hypothesis judgement', 'reflection on own inquiry and improved next investigation'],
        'process': ['PK1_EXPERIMENTIEREN', 'PK3_MATHEMATISIEREN', 'PK4_KOMMUNIZIEREN'],
    },
    {
        'key': 'oberstufe-modellportfolio', 'stage': 'SekII', 'phase': 'GLOBAL',
        'title': 'Chemische Modelle prüfen und eigene Modellarbeit präsentieren',
        'titleEn': 'Test chemical models and present own modelling work',
        'description': 'Die lernende Person kann im vollständigen Oberstufen-Modellportfolio eigene analoge und digitale Modelle zu Atombau und Periodizität, Gleichgewichten, Bindung und Geometrie sowie komplexen Rezeptor- und Enzymwechselwirkungen begründet auswählen und nutzen, Vorhersagen prüfen und Grenzen sowie Weiterentwicklungen begründen und eigene Ergebnisse tatsächlich adressatengerecht präsentieren.',
        'descriptionEn': 'The learner can select and use own analogue and digital models for atomic structure and periodicity, equilibria, bonding and geometry, and complex receptor and enzyme interactions across a complete upper-secondary portfolio, test predictions, justify limitations and developments, and actually present own results to an appropriate audience.',
        'covered': ['models', 'presentation'], 'max': 80, 'pass': 48,
        'steps': [(12, 'Eigene Atombau-/Periodizitäts-Modellwahl, Prüfung und Grenze'), (14, 'Eigene Gleichgewichtsmodelle, dynamische Prüfung und Weiterentwicklung'), (14, 'Eigene Bindungs-/Geometrie-Modelle, Dipolaussagen und Grenzen'), (20, 'Eigene analoge/digitale Rezeptor- UND Enzymmodellprüfung komplexer Moleküle'), (20, 'Eigene tatsächliche adressatengerechte Präsentation und Reflexion')],
        'parent': '5964272f-e835-5a24-b2b1-c162be6b75cb',
        'sourceScope': 'Cross-phase process module allowed by AGENTS 6.3; no artificial nationwide topic phase inferred. All model families and original experiment/model source alternatives retained.',
        'requiredEvidence': ['own selected and actually used analogue/digital models', 'all four complete model families', 'complex interactions include BOTH receptor and enzyme case', 'tested own hypotheses/predictions plus explicit limits and developments', 'own actual audience-specific presentation with analogue/digital media and questions'],
        'process': ['PK2_MODELLIEREN', 'PK4_KOMMUNIZIEREN'],
    },
    {
        'key': 'by-q4-ammoniak-validitaet-nachhaltigkeit', 'stage': 'SekII', 'phase': 'Q4',
        'title': 'Ammoniak: Erkenntnisse prüfen und Folgen abwägen',
        'titleEn': 'Ammonia: evaluate findings and weigh impacts',
        'description': 'Die lernende Person kann anhand eines konkreten Ammoniakfalls alle fünf wissenschaftlichen Gültigkeitskriterien begründet anwenden, belastbare Gegenbefunde von Durchführungsfehlern unterscheiden und historische sowie aktuelle chemische Wirkungen aus ökologischer, ökonomischer und sozialer Perspektive einschließlich eigenen Handelns beurteilen.',
        'descriptionEn': 'The learner can apply all five scientific validity criteria with justification to an ammonia case, distinguish robust counterevidence from procedural failure, and assess historical and current chemical impacts from environmental, economic and social perspectives, including own action.',
        'covered': ['validity', 'sustainability'], 'max': 50, 'pass': 30,
        'steps': [(20, 'Alle fünf Gültigkeitskriterien mit Gegenbefund/Fehler-Unterscheidung'), (10, 'Historische UND aktuelle gesellschaftliche/ökologische chemische Wirkungen'), (15, 'Ökologische, ökonomische UND soziale Nachhaltigkeitsentscheidung samt Grenzen'), (5, 'Begründete Reflexion möglichen eigenen Handelns')],
        'parent': 'b5f0201a-bc5b-5159-a36c-0925f198c32f',
        'sourceScope': 'DE-BY C12/13 bounded duty contributions only. Q4 is a local authored sustainability unit; it does not resolve any C11 course hold and it does not cover e5a5 knowledge influences.',
        'requiredEvidence': ['all five validity criteria', 'robust counterevidence vs failed or unreliable measurement', 'historical AND current impacts', 'ecological AND economic AND social perspectives', 'reflection on possible own action'],
        'process': ['PK1_EXPERIMENTIEREN', 'PK5_BEWERTEN', 'PK4_KOMMUNIZIEREN'],
    },
    {
        'key': 'by-c11-wissensentwicklung-HOLD', 'stage': 'SekII', 'phase': 'J11',
        'title': 'Chemische Wissensentwicklung bewerten (C11-Kurszuordnung offen)',
        'titleEn': 'Evaluate chemical knowledge development (C11 course placement unresolved)',
        'description': 'Die lernende Person kann am Ammoniakbeispiel soziale, kulturelle, technologische, historische, ökologische und ökonomische Einflüsse auf chemische Wissensentwicklung konkret beschreiben und bewerten und empirische Gültigkeit von gesellschaftlicher Zustimmung unterscheiden. Die amtliche C11-Kurszuordnung dieses Entwurfs bleibt ungeklärt.',
        'descriptionEn': 'The learner can describe and assess social, cultural, technological, historical, environmental and economic influences on chemical knowledge development using an ammonia example and distinguish empirical validity from social agreement. The official C11 course placement of this draft remains unresolved.',
        'covered': ['knowledge'], 'max': 40, 'pass': 24,
        'steps': [(8, 'Belegter historischer chemischer Erkenntnisweg mit Quellen-/Motivgrenze'), (18, 'Alle sechs Einflüsse konkret beschrieben und begründet bewertet'), (10, 'Empirische Gültigkeit von Zustimmung unterschieden'), (4, 'Prüfbarer nächster Forschungsschritt mit reflektiertem Einfluss')],
        'parent': '5964272f-e835-5a24-b2b1-c162be6b75cb',
        'sourceScope': 'Only DE-BY C11.1.11; source course=unspecified, explicitScopeKeys=[], P unselected. J11 from source is not a course proof. No GK/LK assignment, no C12 proxy, no source clearance.',
        'requiredEvidence': ['all six influence dimensions', 'historical statements distinguished from unproven motives', 'empirical validity vs social agreement', 'actual official course placement remains HOLD independent of task quality'],
        'process': ['PK5_BEWERTEN', 'PK4_KOMMUNIZIEREN'],
        'courseHold': True,
    },
]

new = []
for d in definitions:
    key = d['key']
    covered = [goals[k] for k in d['covered']]
    task = (PACKAGE / 'author/assessments' / (key + '.task.de.md')).read_text()
    solution = (PACKAGE / 'author/assessments' / (key + '.solution.de.md')).read_text()
    task = task.split('\n', 1)[1].strip()
    solution = solution.split('\n', 1)[1].strip()
    node = {
        'id': uid(key), 'shortKey': 'canonical_chemistry_b008_assessment_' + key.lower().replace('-', '_'),
        'title': d['title'], 'titleEn': d['titleEn'], 'description': d['description'], 'descriptionEn': d['descriptionEn'],
        'weight': 1, 'type': 'atomic', 'nodeKind': 'exam',
        'tags': ([] if d.get('courseHold') else ['GK', 'LK']) + ['canonical', 'Practice', 'Assessment', d['stage']],
        'phase': d['phase'], 'contains': [], 'requires': covered, 'examples': [],
        'dimensionTags': {'framework': 'canonical-gymnasium-chemistry', 'demandLevel': 'AB3', 'processCompetencies': d['process'], 'guidingIdeas': ['BC_REAKTION'], 'phase': d['phase'], 'area': 'Übungen Prozesskompetenzen', 'topicCode': 'CANONICAL.CHEMISTRY.B008.ASSESSMENT.' + key.upper().replace('-', '_')},
        'extendedData': {
            'applicabilityMappingInheritance': 'boundary',
            'provenance': {'authorCandidatePackage': REL, 'authorRole': 'AUTHOR candidate only', 'license': 'CC-BY-4.0', 'sourceScopeRationale': d['sourceScope']},
            'assessmentEvidenceRequirements': {'status': 'AUTHOR proposed, operational verification pending', 'required': d['requiredEvidence'], 'absentEssentialEvidence': 'incomplete; no positive total decision; numeric passing points do not compensate'},
            'sourceCoverageStatus': 'no new source/course clearance',
            'localPlacementStatus': 'AUTHOR candidate; independent learner-facing composition review pending',
        },
        'examData': {
            'reviewStatus': 'needs_review',
            'reviewNote': 'Unreleased AUTHOR draft. Independent current context/assessment review and truthful operational evidence handling pending; no learner execution or Human Approval claimed.',
            'coveredGoalIds': covered, 'coveredStrands': ['Erkenntnisgewinnung', 'Kommunikation' if key != 'by-c11-wissensentwicklung-HOLD' else 'Bewertung'],
            'demandLevels': ['AB2', 'AB3'], 'sourceArtifactPath': REL + '/author/assessments/' + key + '.task.de.md',
            'taskContent': task, 'solutionContent': solution,
            'scoring': {'maxPoints': d['max'], 'passingPoints': d['pass'], 'steps': [{'id': 's' + str(i+1), 'points': points, 'description': label} for i, (points, label) in enumerate(d['steps'])]},
        },
    }
    if d.get('courseHold'):
        node['applicability'] = {'jurisdiction': ['DE-BY']}
        node['extendedData']['courseScopeHold'] = {'status': 'HOLD_UNSPECIFIED_C11', 'sourceSpan': 'C11.1.11', 'sourceStage': 'SekII', 'sourceCourseLevel': 'unspecified', 'explicitScopeKeys': [], 'PSelected': False, 'noGKOrLKCourseAssignment': True}
    elif key.startswith('by-'):
        node['applicability'] = {'jurisdiction': ['DE-BY']}
        node['extendedData']['applicabilityFromRequires'] = True
    else:
        node['extendedData']['applicabilityFromRequires'] = True
    assert sum(s['points'] for s in node['examData']['scoring']['steps']) == d['max']
    assert node['requires'] == node['examData']['coveredGoalIds']
    assert node['id'] not in by
    new.append(node)

cluster = {
    'id': uid('sek1-process-local-cluster'), 'shortKey': 'canonical_chemistry_b008_sek1_process_local_assessment_cluster',
    'title': 'Übungen Prozesskompetenzen: eigenes Untersuchungsprojekt (Sek I)',
    'titleEn': 'Practice process skills: own inquiry project (lower secondary)',
    'description': 'Lokaler Modulzweig für die eigene tatsächliche Untersuchung, Prozessreflexion und Präsentation in der Sekundarstufe I. Eine landesweite Jahrgangs- oder Kurszuordnung ist damit nicht festgelegt.',
    'descriptionEn': 'Local module branch for an actual own investigation, inquiry reflection and presentation in lower secondary education. It does not establish a statewide year or course placement.',
    'weight': 1, 'type': 'cluster', 'tags': ['GK', 'LK', 'canonical', 'Practice', 'Assessment', 'SekI'],
    'contains': [uid('sek1-eigene-salzwasser-untersuchung')], 'requires': [], 'examples': [],
    'dimensionTags': {'framework': 'canonical-gymnasium-chemistry', 'demandLevel': 'AB3', 'processCompetencies': ['PK1_EXPERIMENTIEREN', 'PK4_KOMMUNIZIEREN'], 'guidingIdeas': ['BC_REAKTION'], 'phase': 'GLOBAL', 'area': 'Übungen Prozesskompetenzen'},
    'extendedData': {'applicabilityMappingInheritance': 'boundary', 'provenance': {'authorCandidatePackage': REL, 'authorRole': 'AUTHOR candidate only', 'license': 'CC-BY-4.0'}, 'localPlacementStatus': 'AUTHOR candidate; no national year inference; composition review pending'},
}
new.append(cluster)

before = {g['id']: g for g in old['goals']}
parents = {'442c31c5-c561-5c7a-90bb-2335d779175c': [cluster['id']]}
for d in definitions:
    if d['parent'] != cluster['id']:
        parents.setdefault(d['parent'], []).append(uid(d['key']))
changes = []
for parent_id, children in parents.items():
    by[parent_id]['contains'].extend(children)
    changes.append({'goalId': parent_id, 'changedFields': ['contains'], 'wholeBefore': before[parent_id], 'wholeAfter': copy.deepcopy(by[parent_id]), 'addedChildren': children, 'rationale': 'Actual new local assessment child bodies, not requires edges to unrelated old exams. Existing content and scope text retained; parent context requires independent review.'})
candidate['goals'].extend(new)
assert len(candidate['goals']) == 517
assert len({g['id'] for g in candidate['goals']}) == 517
unchanged = [g['id'] for g in old['goals'] if g == by[g['id']]]
assert len(unchanged) == 507
assert all(by[g['id']] == g for g in nine)

write('candidate/whole517.inactive.terminal-assessment-author.json', candidate)
write('author/new-six-goal-bodies.whole.json', {'schemaVersion': 1, 'role': 'AUTHOR only, not current semantic-kind decisions', 'status': 'needs_review / inactive', 'newGoals': new})
write('author/four-existing-parent-changes.whole-before-after.json', {'schemaVersion': 1, 'role': 'AUTHOR only', 'baseline': binding(whole_path), 'changes': changes, 'existingGoalsUnchangedExact': 507, 'changedExistingGoalIds': list(parents), 'allNineWholeDutiesUnchanged': True, 'allExisting507UntouchedIncludingImages': True})
rows = read(SOURCES / 'paired24-literal-independent-source-decisions.actual.json')['rows']
operators = [json.loads(line) for line in (SOURCES / 'paired63-literal-independent-partial-edge-decisions.actual.jsonl').read_text().splitlines() if line.strip()]
write('inputs/nine-frozen-source-scope-extracts.exact.json', {'schemaVersion': 1, 'role': 'Literal selected existing input rows, NOT a new source review/adoption', 'selectedGoalIds': [g['id'] for g in nine], 'rows': [r for r in rows if r['goalId'] in goals.values()], 'operators': [r for r in operators if r['goalId'] in goals.values()], 'allOriginalPartnersRetained': True, 'newSourceCoverageClearance': False, 'C11PSelected': False})
write('author/nine-whole-goals-and-terminal-rationales.json', {
    'schemaVersion': 1, 'role': 'AUTHOR candidate rationale, not independent D/P/context review',
    'wholeNineBefore': nine, 'wholeNineAfter': [by[g['id']] for g in nine],
    'dutiesChanged': False,
    'routes': [{
        'goalId': g['id'], 'newTerminalCandidates': [{
            'id': uid(d['key']), 'key': d['key'], 'stage': d['stage'], 'phase': d['phase'],
            'requiredEvidence': d['requiredEvidence'], 'sourceAndPlacementRationale': d['sourceScope'],
            'releaseStatus': 'needs_review', 'actualOwnPerformanceClaimed': False,
        } for d in definitions if g['id'] in [goals[k] for k in d['covered']]],
        'wholeSourceCoverage': 'unchanged bounded partial, no national clearance',
        'courseHold': g['id'] == goals['knowledge'],
    } for g in nine],
    'noUnrelatedOldExamRequires': True, 'noOldFixedInstructionPracticalsReused': True,
    'noSourceOrKindFingerprintRelabeling': True, 'strictGain': 0, 'currentStrictDenominator': None,
})
inputs = [
    OLD / 'author-checkpoint.final.entry.json', OLD / 'author-checkpoint.final.freeze.json', whole_path,
    OLD / 'author/nine-terminal-goals.still-HOLD.json',
    NEUTRAL / 'neutral-whole22-current-route-HOLD-authoring-input.entry.json',
    NEUTRAL / 'inputs/all-twenty-two-normal-route-findings-complete.actual.json',
    NEUTRAL / 'inputs/current-unmodified-normal-route-profile.actual.json',
    SOURCES / 'paired24-literal-independent-source-decisions.actual.json',
    SOURCES / 'paired63-literal-independent-partial-edge-decisions.actual.jsonl',
    ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/chemie-b008-source24-targeted-parent-split-author-successor-20261010-v1/source-atlas/C11-e5a5-whole-current-primary-programme-duration-and-course-HOLD.actual.json',
    ROOT / 'AGENTS.md', ROOT / 'docs/landscape-runtime.schema.json',
]
write('inputs/actual-input-bindings.json', {'schemaVersion': 1, 'inputs': [binding(p) for p in inputs], 'source24Status': 'bounded partial retained; no source review reauthored', 'C11PSelected': False, 'existingCapsuleMutated': False, 'liveInputsWritten': []})
print(json.dumps({'package': REL, 'wholeGoalCount': 517, 'newAssessmentIds': [n['id'] for n in new if n.get('examData')], 'newClusterId': cluster['id'], 'changedExistingParents': list(parents), 'existingUnchangedExact': len(unchanged), 'allNineDutiesUnchanged': True, 'currentStrictDenominator': None}, ensure_ascii=False))
