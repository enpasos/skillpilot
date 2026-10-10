# SPDX-License-Identifier: Apache-2.0
"""Author SC-01 grading remediation without changing runtime, source or material data."""
from pathlib import Path
import copy
import hashlib
import importlib.util
import json
import subprocess
import sys
import jsonschema

sys.dont_write_bytecode = True
ROOT = Path(__file__).resolve().parents[8]
PACKAGE = Path(__file__).resolve().parents[1]
REL = PACKAGE.relative_to(ROOT).as_posix()
A01 = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/chemie-b008-modelportfolio-a01-targeted-author-successor-20261010-v1'
ORIGINAL = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/chemie-b008-phase-local-inquiry-model-society-terminal-author-20261010-v1'

def read(p):
    return json.loads(p.read_text())

def bind(p):
    b = p.read_bytes()
    return {'path': p.relative_to(ROOT).as_posix(), 'sha256': hashlib.sha256(b).hexdigest(), 'bytes': len(b)}

def write(name, value):
    p = PACKAGE / name
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')

# Each listed phrase is an individually required performance/dimension.
# Its complete absence gives ZERO for its entire existing rubric step.
# These are author instructions carried in ordinary scoring.steps.description;
# no new runtime or schema field is used to enforce a hidden minimum.
SPECS = [
    {
        'goalId': '2f53dea4-1ea9-59ad-bd2d-0492107627ee', 'key': 'sek1-eigene-salzwasser-untersuchung',
        'passing': 37,
        'requirements': {
            's1': ['eigener begründeter Untersuchungsplan'],
            's2': ['tatsächlich selbst ausgeführte sichere Untersuchung', 'eigene zeitnahe Rohmesswerte und Beobachtungen'],
            's3': ['Auswertung der eigenen Daten', 'Bezug des eigenen Ergebnisses auf die eigene Frage und Vermutung', 'Begründung der eigenen Methode', 'konkrete eigene Unsicherheiten oder Grenzen', 'konkrete Verbesserung der eigenen Folgeuntersuchung'],
            's4': ['tatsächlich selbst gehaltene adressatengerechte Präsentation', 'selbst erstelltes tatsächlich eingesetztes analoges Medium', 'selbst erstelltes tatsächlich eingesetztes digitales Medium', 'Begründung von Darstellungswahl, Aufbau und Medium', 'eigene inhaltliche Antwort auf tatsächlich gestellte Rückfragen'],
            's5': ['konkrete eigene Darstellungsüberarbeitung aus einer tatsächlichen Rückfrage'],
        },
        'taskReplacements': [('Bestehensgrenze 24 BE', 'Bestehensgrenze 37 BE')],
        'solutionReplacements': [('40 BE insgesamt; 24 BE als numerische', '40 BE insgesamt; 37 BE als numerische')],
    },
    {
        'goalId': 'ab315f52-a9e3-5c1c-a404-7fb1a96a3eaf', 'key': 'q3-eigene-saeure-untersuchung',
        'passing': 51,
        'requirements': {
            's1': ['selbst formulierte chemisch untersuchbare Frage', 'selbst formulierte theoriegestützte Hypothese', 'abgeleiteter qualitativer erwartbarer Befund', 'abgeleiteter quantitativer erwartbarer Befund', 'geeigneter möglicher Gegenbefund'],
            's2': ['eigene begründete Auswahl einer qualitativen Analysenmethode', 'eigene begründete Auswahl einer quantitativen Analysenmethode', 'eigener Plan mit Vergleichs- und Kontrollbedingungen'],
            's3': ['tatsächlich überwiegend selbstständig und sicher durchgeführter qualitativer Untersuchungsanteil', 'tatsächlich überwiegend selbstständig und sicher durchgeführter quantitativer Untersuchungsanteil', 'eigene zeitnahe qualitative Rohbeobachtungen', 'eigene zeitnahe quantitative Rohmesswerte'],
            's4': ['eigene begründete Auswahl und Anwendung mathematischer Auswertungsverfahren', 'eigene begründete Auswahl und tatsächliche Nutzung eines digitalen Auswertungswerkzeugs', 'auf eigenen Daten beruhendes Hypothesenurteil unter den Untersuchungsbedingungen', 'chemisch und mathematisch begründeter fachübergreifender Schluss', 'konkrete Einschätzung von Streuung oder Messunsicherheit', 'Unterscheidung eines belastbaren Gegenbefunds von Mess- oder Verfahrensfehlern'],
            's5': ['Reflexion des eigenen Ergebnisses zur eigenen Frage und Hypothese', 'rückblickende Begründung der eigenen Methode', 'konkrete eigene Untersuchungsgrenzen', 'konkrete verbesserte eigene Folgeuntersuchung'],
        },
        'taskReplacements': [('Bestehensgrenze 36 BE', 'Bestehensgrenze 51 BE')],
        'solutionReplacements': [('auch wenn schriftliche Teile rechnerisch 36 BE erreichen könnten', 'wenn ohne Anwendung der operativen Nullregeln aus anderen Teilen genügend Punkte zusammengezählt werden könnten'), ('60 BE insgesamt; 36 BE erst', '60 BE insgesamt; 51 BE erst')],
    },
    {
        'goalId': '7bfe515c-e59f-521c-9781-b75e33caf0ec', 'key': 'oberstufe-modellportfolio',
        'passing': 69,
        'requirements': {
            's1': ['eigene tatsächlich genutzte Modellarbeit zu Atombau', 'eigene tatsächlich genutzte Modellarbeit zu Periodizität', 'eigene Modellvorhersage und Prüfung für diese Modellfamilie', 'begründete Grenze und Weiterentwicklung für diese Modellfamilie'],
            's2': ['eigene tatsächlich genutzte analoge dynamische Gleichgewichtsmodellarbeit', 'eigene tatsächlich genutzte digitale Gleichgewichtsmodellarbeit', 'eigene Gleichgewichtsvorhersage und Prüfung', 'begründete Gleichgewichtsmodellgrenze und Weiterentwicklung'],
            's3': ['eigene tatsächlich genutzte Bindungsmodellarbeit', 'eigene tatsächlich genutzte Molekülgeometriemodellarbeit', 'eigene Vorhersage und Prüfung zu Dipolen und Wechselwirkungen', 'begründete Grenze und Weiterentwicklung dieser Modelle'],
            's4': ['eigene tatsächlich genutzte analoge Rezeptormodellarbeit für Fall A', 'eigene tatsächlich genutzte digitale Rezeptormodellarbeit für Fall A', 'eigene Hypothese samt Modellprüfung für Rezeptorfall A', 'eigene tatsächlich genutzte analoge Enzymmodellarbeit für Fall B', 'eigene tatsächlich genutzte digitale Enzymmodellarbeit für Fall B', 'eigene Hypothese samt Modellprüfung für Enzymfall B', 'räumliche und wechselwirkungsbezogene Modellierung eines komplexen Moleküls', 'begründete Grenzen und Weiterentwicklungen für beide komplexen Fälle'],
            's5': ['tatsächlich selbst gehaltene adressatengerechte Präsentation eigener Modellarbeit', 'selbst erstelltes tatsächlich eingesetztes analoges Präsentationsmedium', 'selbst erstelltes tatsächlich eingesetztes digitales Präsentationsmedium', 'Begründung von Darstellungswahl, Aufbau und Medium', 'eigene inhaltliche Antwort auf tatsächlich gestellte Rückfragen', 'konkrete eigene Darstellungsüberarbeitung aus einer tatsächlichen Rückfrage'],
        },
        'taskReplacements': [('Bestehensgrenze 48 BE', 'Bestehensgrenze 69 BE')],
        'solutionReplacements': [('80 BE insgesamt; 48 BE nur', '80 BE insgesamt; 69 BE nur')],
    },
    {
        'goalId': 'b406eff8-3cd9-551b-a913-c6dda7223645', 'key': 'by-q4-ammoniak-validitaet-nachhaltigkeit',
        'passing': 46,
        'requirements': {
            's1': ['materialbezogene Bearbeitung der Reproduzierbarkeit', 'materialbezogene Bearbeitung der Falsifizierbarkeit', 'materialbezogene Bearbeitung der Intersubjektivität', 'materialbezogene Bearbeitung der logischen Konsistenz', 'materialbezogene Bearbeitung der Vorläufigkeit', 'begründete Unterscheidung des belastbaren Gegenbefunds von fehlgeschlagener Durchführung oder unzuverlässiger Messung'],
            's2': ['historischer chemischer Wirkungszusammenhang', 'aktueller chemischer Wirkungszusammenhang', 'Wirkungen der Herstellung', 'Wirkungen der Nutzung'],
            's3': ['konkrete ökologische Nachhaltigkeitsperspektive', 'konkrete ökonomische Nachhaltigkeitsperspektive', 'konkrete soziale Nachhaltigkeitsperspektive', 'begründete Abwägung von Handlungsoptionen mit offener Kriteriengewichtung'],
            's4': ['konkrete Reflexion eigenen oder hypothetischen eigenen Handelns mit chemischem Bezug und Einflussgrenze'],
        },
        'taskReplacements': [('Bestehensgrenze 30 BE', 'Bestehensgrenze 46 BE')],
        'solutionReplacements': [('50 BE insgesamt; 30 BE numerische', '50 BE insgesamt; 46 BE numerische')],
    },
    {
        'goalId': 'eed5eda3-2daf-5d48-b935-23dadd622d9b', 'key': 'by-c11-wissensentwicklung-HOLD',
        'passing': 37,
        'requirements': {
            's1': ['belegter historischer chemischer Erkenntnisweg mit Trennung unbelegter Motive'],
            's2': ['konkrete Beschreibung und Bewertung sozialer Einflüsse', 'konkrete Beschreibung und Bewertung kultureller Einflüsse', 'konkrete Beschreibung und Bewertung technologischer Einflüsse', 'konkrete Beschreibung und Bewertung historischer Einflüsse', 'konkrete Beschreibung und Bewertung ökologischer Einflüsse', 'konkrete Beschreibung und Bewertung ökonomischer Einflüsse'],
            's3': ['materialbezogene Unterscheidung empirischer Gültigkeit von gesellschaftlicher Zustimmung'],
            's4': ['eigene prüfbare nächste chemische Forschungsfrage mit begründetem nächsten Schritt und reflektiertem Einfluss'],
        },
        'taskReplacements': [('Bestehensgrenze 24 BE', 'Bestehensgrenze 37 BE')],
        'solutionReplacements': [('40 BE insgesamt; 24 BE erst', '40 BE insgesamt; 37 BE erst')],
    },
]

def replace_exact(text, replacements):
    for a, b in replacements:
        assert text.count(a) == 1, (a, text.count(a))
        text = text.replace(a, b)
    return text

def null_rule(requirements):
    alternatives = '; '.join('„' + x + '“' for x in requirements)
    return ('0 BE für diesen gesamten Schritt, sobald mindestens eine der folgenden Pflichtleistungen oder Pflichtdimensionen vollständig fehlt: ' + alternatives + '. '
            'Das Fehlen darf nicht durch andere Teilpunkte dieses Schritts ausgeglichen werden. '
            'Sind alle Pflichtdimensionen substanziell vorhanden, werden für fachlich unvollkommene Ausführungen weiterhin die ursprünglichen Teilpunkte nach Qualität vergeben; gleichwertige alternative Lösungen sind zulässig. '
            'Eine bloße Namensnennung, ein fremdes Produkt oder ein erfundener Leistungsbeleg ersetzt keine eigene verlangte Leistung.')

old_freeze = read(A01 / 'A01-author-successor.final.freeze.json')
for b in old_freeze['files']:
    assert bind(ROOT / b['path']) == b
old_whole = A01 / 'candidate/whole517.inactive.modelportfolio-A01-author-successor.json'
assert bind(old_whole)['sha256'] == '8a4bcc2a8c1cfdabbbced5a5340451b4a94821304190222d07ae256b3d91c8a0'
original = read(old_whole)
candidate = copy.deepcopy(original)
by_old = {g['id']: g for g in original['goals']}
by_new = {g['id']: g for g in candidate['goals']}
input_sources = []
changes = []
negatives = []
positive_examples = []

for spec in SPECS:
    before = by_old[spec['goalId']]
    after = by_new[spec['goalId']]
    scoring = after['examData']['scoring']
    old_scoring = before['examData']['scoring']
    assert sum(s['points'] for s in scoring['steps']) == scoring['maxPoints']
    assert spec['passing'] == scoring['maxPoints'] - min(s['points'] for s in scoring['steps']) + 1
    assert set(spec['requirements']) == {s['id'] for s in scoring['steps']}
    scoring['passingPoints'] = spec['passing']
    for step in scoring['steps']:
        old_step = next(s for s in old_scoring['steps'] if s['id'] == step['id'])
        step['description'] = old_step['description'] + '. ' + null_rule(spec['requirements'][step['id']])
        assert (step['id'], step['points']) == (old_step['id'], old_step['points'])

    heading = '\n\n## Verbindliche Punktbewertung der Pflichtteile\n\n'
    general = ('Die folgenden Nullregeln gelten für den jeweils **ganzen** Bewertungsabschnitt, auch wenn andere Leistungen in diesem Abschnitt vorhanden sind. '
               'Vollständig fehlend bedeutet: Zu der bezeichneten Dimension liegt keine substanzielle verlangte Bearbeitung bzw. kein tatsächlicher eigener Leistungsbeleg vor. '
               'Eine vorhandene, aber fachlich noch unvollkommene Bearbeitung ist damit nicht gleichgesetzt; dafür gelten weiterhin die Teilpunkte des ursprünglichen fachlichen Erwartungshorizonts. '
               'Gleichwertige alternative Methoden und Lösungen erhalten dieselben Punkte. Erfindungen oder fremde Leistungen werden nicht als eigene Arbeit bewertet.\n\n')
    step_text = '\n\n'.join('**' + s['id'] + ' (' + str(s['points']) + ' BE):** ' + s['description'] for s in scoring['steps'])
    minimum = min(s['points'] for s in scoring['steps'])
    bound = scoring['maxPoints'] - minimum
    final = ('\n\nBei einem wegen fehlender Pflichtleistung mit 0 BE bewerteten Abschnitt können selbst bei voller Punktzahl in allen anderen Abschnitten höchstens '
             + str(bound) + ' von ' + str(scoring['maxPoints']) + ' BE erreicht werden. Bestehen erfordert '
             + str(spec['passing']) + ' BE. Die hohe Grenze hält die Pflichtteile mit den vorhandenen gebündelten Bewertungsschritten unverzichtbar. '
             'Die tatsächlich vergebene Gesamtpunktzahl muss aus diesen Regeln und den belegten Leistungen nachvollziehbar berechnet werden; eine Rückmeldung „unvollständig“ allein ersetzt die Punkteberechnung nicht. '
             'Dieser Entwurf bleibt `needs_review` und ist nicht freigegeben.')
    extension = heading + general + step_text + final
    task_core = replace_exact(before['examData']['taskContent'], spec['taskReplacements'])
    solution_core = replace_exact(before['examData']['solutionContent'], spec['solutionReplacements'])
    after['examData']['taskContent'] = task_core + extension
    after['examData']['solutionContent'] = solution_core + extension
    old_task = ROOT / before['examData']['sourceArtifactPath']
    old_solution = ORIGINAL / 'author/assessments' / (spec['key'] + '.solution.de.md')
    assert old_task.read_text().split('\n', 1)[1].strip() == before['examData']['taskContent']
    assert old_solution.read_text().split('\n', 1)[1].strip() == before['examData']['solutionContent']
    input_sources.extend([old_task, old_solution])
    new_task = PACKAGE / 'author/assessments' / (spec['key'] + '.task.de.md')
    new_solution = PACKAGE / 'author/assessments' / (spec['key'] + '.solution.de.md')
    new_task.parent.mkdir(parents=True, exist_ok=True)
    new_task.write_text('<!-- SPDX-License-Identifier: CC-BY-4.0 -->\n' + after['examData']['taskContent'] + '\n')
    new_solution.write_text('<!-- SPDX-License-Identifier: CC-BY-4.0 -->\n' + after['examData']['solutionContent'] + '\n')
    after['examData']['sourceArtifactPath'] = new_task.relative_to(ROOT).as_posix()
    assert after['examData']['reviewStatus'] == 'needs_review'
    assert before['examData']['taskContent'] == replace_exact(task_core, [(b, a) for a, b in reversed(spec['taskReplacements'])])
    assert before['examData']['solutionContent'] == replace_exact(solution_core, [(b, a) for a, b in reversed(spec['solutionReplacements'])])
    # All scientific material and old rubric allocation remains byte-exact in
    # these core texts except the explicitly listed scoring-only replacements.
    changes.append({
        'goalId': spec['goalId'], 'wholeBefore': before, 'wholeAfter': after,
        'changedJsonPointers': ['/examData/taskContent', '/examData/solutionContent', '/examData/scoring/passingPoints', '/examData/scoring/steps/*/description', '/examData/sourceArtifactPath'],
        'taskCoreScoringOnlyReplacements': spec['taskReplacements'], 'solutionCoreScoringOnlyReplacements': spec['solutionReplacements'],
        'scienceAndMaterialCorePreservedExact': True, 'maxPointsAndStepIdsAndWeightsExact': True,
        'allOtherWholeGoalFieldsExact': True,
    })
    for step in scoring['steps']:
        # Pessimistic case: only this missing subdimension is absent; every
        # other step earns full marks. Coarser bundled-step null rule applies.
        for requirement in spec['requirements'][step['id']]:
            assert '„' + requirement + '“' in step['description']
            assert step['description'].startswith(next(s for s in old_scoring['steps'] if s['id'] == step['id'])['description'] + '. 0 BE für diesen gesamten Schritt, sobald mindestens eine')
            values = {s['id']: (0 if s['id'] == step['id'] else s['points']) for s in scoring['steps']}
            maximum_without = sum(values.values())
            assert maximum_without == scoring['maxPoints'] - step['points']
            assert maximum_without < scoring['passingPoints']
            negatives.append({
                'goalId': spec['goalId'], 'missingRequiredPerformanceOrDimension': requirement,
                'zeroStepId': step['id'], 'zeroRuleFromActualRubricDescription': step['description'],
                'actualStepPoints': step['points'], 'actualMaxPoints': scoring['maxPoints'],
                'actualPassingPoints': scoring['passingPoints'], 'worstCaseOtherStepsAllFull': values,
                'maximumEarnedPointsWithoutRequired': maximum_without,
                'passingMargin': scoring['passingPoints'] - maximum_without,
                'sumGateRejectsWithRubricFaithfulGrading': True,
            })
    full = {s['id']: s['points'] for s in scoring['steps']}
    slight = dict(full)
    first = scoring['steps'][0]['id']
    slight[first] -= 1
    assert sum(slight.values()) >= scoring['passingPoints']
    positive_examples.append({
        'goalId': spec['goalId'], 'constructedExampleOnly': True, 'allRequiredPerformancesSubstantivelyPresent': True,
        'fullyCorrectStepPoints': full, 'fullTotal': sum(full.values()),
        'completeWithOnePointQualityDeduction': slight, 'partialQualityTotal': sum(slight.values()),
        'passingPoints': scoring['passingPoints'], 'bothPass': True,
        'actualStudentPerformanceClaimed': False,
    })

changed_ids = {s['goalId'] for s in SPECS}
assert len(candidate['goals']) == len(original['goals']) == 517
for old_g, new_g in zip(original['goals'], candidate['goals']):
    assert old_g['id'] == new_g['id']
    if old_g['id'] not in changed_ids:
        assert old_g == new_g
    else:
        expected = copy.deepcopy(old_g)
        for k in ['taskContent', 'solutionContent', 'scoring', 'sourceArtifactPath']:
            expected['examData'][k] = new_g['examData'][k]
        assert expected == new_g
        assert set(old_g['examData']) == set(new_g['examData'])
        assert set(old_g['examData']['scoring']) == set(new_g['examData']['scoring'])
        assert all(set(a) == set(b) for a, b in zip(old_g['examData']['scoring']['steps'], new_g['examData']['scoring']['steps']))
assert len(original['goals']) - len(changed_ids) == 512
assert all(by_new[g]['examData']['reviewStatus'] == 'needs_review' for g in changed_ids)
assert 'Prüfen Sie für **beide Fälle A und B jeweils eine eigene Hypothese**' in by_new['7bfe515c-e59f-521c-9781-b75e33caf0ec']['examData']['taskContent']
assert by_new['eed5eda3-2daf-5d48-b935-23dadd622d9b']['extendedData']['courseScopeHold'] == by_old['eed5eda3-2daf-5d48-b935-23dadd622d9b']['extendedData']['courseScopeHold']

whole_after = PACKAGE / 'candidate/whole517.inactive.SC01-five-assessment-author-successor.json'
write(whole_after.relative_to(PACKAGE), candidate)
write('author/five-whole-goals-before-after-and-exact-scoring-delta.json', {'schemaVersion': 1, 'role': 'Original AUTHOR SC-01 successor, not independent approval', 'wholeBefore': bind(old_whole), 'changes': changes, 'other512WholeGoalsExact': True, 'allScienceAndMaterialCoresExact': True, 'A01TaskCorrectionRetained': True, 'originalMaxPointsAndStepWeightsExact': True, 'newSchemaOrRuntimeFields': 0, 'sourceHoldsAndImagesExact': True, 'reviewStatus': 'needs_review', 'C11PSelected': False, 'currentStrictDenominator': None, 'strictGain': 0, 'activeWrites': []})
write('checks/negative-subdimension-bounds-from-actual-rubrics.actual.json', {
    'schemaVersion': 1, 'role': 'AUTHOR numerical proof under the actual total-score gate, not host/learner acceptance',
    'candidateBinding': bind(whole_after), 'negativeScenarios': negatives, 'negativeScenarioCount': len(negatives),
    'allIndividualRequiredAbsencesReject': True, 'missingSubdimensionsInsideStepsCovered': True,
    'derivation': 'Actual step.points/description and scoring.maxPoints/passingPoints read from whole517. For each fully absent individually named requirement the operative actual description awards 0 to its whole step. All other steps get full points; sum=maxPoints-step.points<passingPoints.',
    'positiveCompleteConstructedExamples': positive_examples,
    'highThresholdReason': 'With unchanged bundled step weights, maxPoints-min(step.points)+1 is the smallest integer total threshold that excludes every zero-step absence. A lower threshold could accept at least one fully missing required step.',
    'adapterActuallyKnowsMissingPerformance': False,
    'limitation': 'The server checks only a supplied total. Rubric-faithful recognition and evidence-based scoring are still required; this arithmetic does not prove actual coach grading, supervised work, presentation, client/host acceptance or Human Approval.',
    'newRuntimeFields': 0, 'reviewStatus': 'needs_review', 'currentStrictDenominator': None, 'strictGain': 0, 'humanApproval': False,
})
input_paths = [
    A01 / 'A01-author-successor.final.entry.json', A01 / 'A01-author-successor.final.freeze.json', old_whole,
    ORIGINAL / 'author-successor.final.entry.json', ORIGINAL / 'author-successor.final.freeze.json',
    ROOT / 'backend/src/main/java/com/skillpilot/backend/connectors/claude/v1/mcp/ClaudeV1McpContractAdapter.java',
    ROOT / 'backend/src/main/java/com/skillpilot/backend/landscape/ExamData.java',
    ROOT / 'docs/qa-ci/math-antiderivative-exam-candidate-review-2026-09-28.md',
    ROOT / 'docs/landscape-runtime.schema.json', ROOT / 'scripts/validate_schemas.py',
] + input_sources
write('inputs/portable-exact-input-and-adapter-bindings.json', {'schemaVersion': 1, 'inputs': [bind(p) for p in input_paths], 'actualAdapterMethodRead': 'ClaudeV1McpContractAdapter.applyExamMasteryRules: capability, finite/range, earnedPoints<passingPoints; no per-step minima', 'actualScoringFieldsRead': 'ExamData.Scoring maxPoints/passingPoints/steps{id,points,description}', 'A01SealNineFilesVerifiedExact': True, 'sourceSnapshotsNotDuplicated': True, 'oldSealsWritten': False, 'activeWrites': []})

schema = read(ROOT / 'docs/landscape-runtime.schema.json')
jsonschema.Draft202012Validator(schema).validate(candidate)
sp = importlib.util.spec_from_file_location('skillpilot_validate_schemas', ROOT / 'scripts/validate_schemas.py')
m = importlib.util.module_from_spec(sp)
sp.loader.exec_module(m)
json_files = sorted(PACKAGE.rglob('*.json'))
assert all(m.validate_file(str(p), schema) for p in json_files)
for b in read(PACKAGE / 'inputs/portable-exact-input-and-adapter-bindings.json')['inputs']:
    assert bind(ROOT / b['path']) == b
for old_package, freeze_name in [(A01, 'A01-author-successor.final.freeze.json'), (ORIGINAL, 'author-successor.final.freeze.json')]:
    for b in read(old_package / freeze_name)['files']:
        assert bind(ROOT / b['path']) == b
assert not any(p.is_symlink() for p in PACKAGE.rglob('*'))
ignored = subprocess.run(['git', 'check-ignore', '--no-index', *[p.relative_to(ROOT).as_posix() for p in PACKAGE.rglob('*') if p.is_file()]], cwd=ROOT, text=True, capture_output=True)
assert ignored.returncode == 1 and not ignored.stdout
write('checks/normal-targeted-schema-portability-and-preservation.actual.json', {'schemaVersion': 1, 'actualExitCode': 0, 'wholeAfter': bind(whole_after), 'normalValidateFileJsonCount': len(json_files), 'runtimeSchemaStatus': 'PASS', 'portableExactInputBindings': len(input_paths), 'wholeGoalCount': 517, 'other512WholeGoalsExact': True, 'allOtherFieldsOfFiveGoalsExact': True, 'scienceAndMaterialCoreExact': True, 'newSchemaAndRuntimeFields': 0, 'negativeScenarioCount': len(negatives), 'allIndividualRequiredAbsencesRejectWithRubricFaithfulScoring': True, 'old38SealedFilesExact': True, 'sourceHoldsAndImagesExact': True, 'C11PSelected': False, 'allFiveReviewStatus': 'needs_review', 'symlinks': 0, 'ignoredPackageFiles': 0, 'currentStrictDenominator': None, 'strictGain': 0, 'activeWrites': []})
print(json.dumps({'wholeAfter': bind(whole_after), 'other512WholeGoalsExact': True, 'thresholds': [{'goalId': s['goalId'], 'passingPoints': s['passing'], 'maxPoints': by_new[s['goalId']]['examData']['scoring']['maxPoints']} for s in SPECS], 'negativeScenarios': len(negatives), 'allRejectUnderRubricFaithfulTotal': True, 'newRuntimeFields': 0, 'normalRuntimeSchema': 'PASS', 'old38SealFilesExact': True, 'strictGain': 0}, ensure_ascii=False))
