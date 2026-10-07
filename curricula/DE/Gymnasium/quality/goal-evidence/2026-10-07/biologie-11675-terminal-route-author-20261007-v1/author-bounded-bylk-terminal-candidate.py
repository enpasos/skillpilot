# SPDX-License-Identifier: Apache-2.0
"""Inactive, narrowly scoped assessment candidate. Existing texts and evidence stay exact."""
from pathlib import Path
import copy, hashlib, json, re

ROOT = Path.cwd()
OWN = Path(__file__).resolve().parent
CANONICAL = ROOT / 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json'
TARGET = '11675f1a-5de2-5926-be78-1e8275f19f5b'
ENDPOINT = 'e8caebd4-57bc-5c2f-881d-0b1693777c64'
PARENT = '28788f27-f079-5d78-936f-b7684760ff31'
OLD_GLOBAL = '1cfb2f8b-d44b-57f4-aae0-c5d9f55a1c6a'
PROFILE = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/biologie-cqr003-five-reviewed-integration-preparation-technical-20261007-v1/positive/e70d8a85.other-two.exact.records.jsonl'

def write(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open('x') as f:
        f.write(value if isinstance(value, str) else json.dumps(value, ensure_ascii=False, indent=2) + '\n')

current = json.loads(CANONICAL.read_text())
by = {g['id']: g for g in current['goals']}
assert len(by) == 473 and ENDPOINT not in by
assert by[TARGET]['tags'] == ['LK']
assert by[TARGET]['applicability']['jurisdiction'] == ['DE-BY']
record = next(json.loads(line) for line in PROFILE.read_text().splitlines() if json.loads(line).get('goalId') == TARGET)
cases = record['profile']['applicationCaseBriefs']
assert len(cases) == 2
write(OWN / 'reused-reviewed-two-whole-bilingual-cases.exact.json', {'originalActiveRecordPath': str(PROFILE.relative_to(ROOT)), 'originalActiveRecordFileSha256': hashlib.sha256(PROFILE.read_bytes()).hexdigest(), 'goalId': TARGET, 'cases': cases, 'caseBodiesChanged': False, 'sourceGoalUnchanged': True, 'newLearnerEvidenceClaimed': False})
task = ('**Rahmen und Kursgrenze:**\n\nBayern, Biologie auf erhöhtem Anforderungsniveau (SkillPilot-Projektionsmarker LK). Ausschließlich die gegebenen vereinfachten ENG- und EKG-Modelle; keine echte Untersuchung, keine Krankheitsdiagnose und kein Hirnbild. Alle Zahlen sind didaktische Modellwerte.\n\n'
        '**Material und Fall ENG:**\n\n' + cases[0]['taskDemandDe'] + '\n\n'
        '**Material und frischer Transferfall EKG:**\n\n' + cases[1]['taskDemandDe'] + '\n\n'
        '**Bewertete Teilaufgaben:**\n\n'
        '1. Erklären Sie für beide Fälle Oberflächenableitung, Spannungsdifferenz und räumlich sowie zeitlich gewichtete Beiträge vieler Zellen. Grenzen Sie ein Einzelzell-Membranpotenzial ab. (6 BE)\n'
        '2. Berechnen und vergleichen Sie die beiden ENG-Leitungsgeschwindigkeiten aus den kontrollierten Weg- und Zeitdifferenzen. Ordnen Sie den langsameren Modellvergleich als begrenzten Funktionshinweis ein. (7 BE)\n'
        '3. Berechnen Sie die EKG-Spannung vor und nach Leitungswechsel sowie beide Frequenzen. Unterscheiden Sie die unveränderte Herzerregung von der geänderten Polung und vergleichen Sie Signalquelle und Auswertung mit ENG. (7 BE)\n'
        '4. Nennen Sie für ENG und EKG jeweils einen begrenzten medizinischen Nutzen. Begründen Sie, warum die vier genannten Behauptungen über Einzelzellpotenzial, MS, krankes Herz und sichere Gesundheit nicht folgen. Leiten Sie aus der Amplitude keine genaue Zellzahl ab. (4 BE)')
solution = ('**Modelllösung ENG:**\n\n' + cases[0]['expectedPerformanceDe'] + '\n\n'
            '**Modelllösung EKG und Vergleich:**\n\n' + cases[1]['expectedPerformanceDe'] + '\n\n'
            '**Punktezuordnung ohne Doppelwertung:**\n\n'
            '1. Zwei extrazelluläre Oberflächenpotenziale mit gleicher Referenz als Differenz: 2 BE; Beiträge vieler räumlich/zeitlich gewichteter Zellen: 2 BE; Abgrenzung zum innen/außen bezogenen Einzelzell-Membranpotenzial: 2 BE.\n'
            '2. Wegdifferenz 0,060 m: 1 BE; Zeitdifferenzen 0,0012 s und 0,0024 s: 2 BE; korrekte Ergebnisse 50 m/s und 25 m/s: 2 BE; langsameres B unter den genannten Kontrollen: 1 BE; begrenzter Funktionsvergleich, nicht Krankheitsermittlung: 1 BE.\n'
            '3. +0,7 mV und −0,7 mV: 2 BE; 60/min und 75/min: 2 BE; Vorzeichenwechsel ohne veränderte Herzerregung: 1 BE; Herzgewebe/Rhythmus gegenüber peripherem Nerv/Leitungslaufzeit: 2 BE.\n'
            '4. ENG als Hinweis auf periphere Nervenleitung und EKG als Aufzeichnung elektrischer Herzfrequenz/Rhythmus: zusammen 1 BE; Einzelzellpotenzial- und MS-Behauptung begründet verworfen: 1 BE; Krankheit aus Minuszeichen und Gesundheit aus Einzelwert begründet verworfen: 1 BE; keine genaue Zellzahl und keine weitergehende Diagnose/Hirnabbildung ohne entsprechende weitere Befunde: 1 BE. Bereits in 1–3 bepunktete Aussagen erhalten hier keine erneuten Punkte; hier wird ihre begründete Anwendung auf die ausdrücklich behaupteten Schlussfolgerungen bewertet.')
goal = {
    'id': ENDPOINT,
    'title': 'ENG und EKG in begrenzten Modellen vergleichen',
    'titleEn': 'Compare Nerve-Conduction and ECG Models with Bounded Inferences',
    'description': 'Die lernende Person kann zwei gegebene materialgestützte ENG- und EKG-Modellfälle selbstständig bearbeiten, Oberflächenableitung und elektrische Summensignale erklären, kontrollierte Zeit- und Polungsvergleiche auswerten und den begrenzten medizinischen Funktionsnutzen von Einzelzellmessung, Hirnbild und Krankheitsdiagnose abgrenzen.',
    'descriptionEn': 'The learner can independently solve two supplied material-based nerve-conduction and ECG model cases, explain surface recordings and electrical aggregate signals, interpret controlled timing and polarity comparisons, and distinguish bounded medical information about function from single-cell measurements, brain imaging and disease diagnosis.',
    'weight': 1, 'tags': ['LK', 'Practice', 'Assessment', 'SekII', 'canonical'],
    'type': 'atomic', 'contains': [], 'requires': [TARGET], 'examples': [],
    'dimensionTags': {'framework': 'canonical-gymnasium-biology', 'demandLevel': 'AB3', 'phase': 'Q2', 'area': 'Übungen', 'topicCode': 'CANONICAL.BIOLOGY.BY.EA.ENG_EKG.ASSESSMENT', 'processCompetencies': ['E4', 'E5', 'E6'], 'guidingIdeas': ['BIO_INFORMATION_KOMMUNIKATION', 'BIO_STEUERUNG_REGELUNG']},
    'applicability': {'jurisdiction': ['DE-BY']},
    'extendedData': {
        'treeOrder': 4, 'applicabilityFromRequires': True, 'applicabilityMappingInheritance': 'boundary',
        'routeCoverage': {'profileId': 'canonical-biology-sek2', 'role': 'terminal-autonomy-goal', 'selectedAtomicGoals': 1},
        'assessmentBasis': {'materialOrigin': 'SkillPilot didactic models; exact reuse of independently reviewed current ENG/EKG case briefs', 'sourceGoalId': TARGET, 'caseIds': [c['id'] for c in cases], 'requiredCourseProfile': 'BY elevated level; technical SkillPilot LK', 'machineReviewStatus': 'author_candidate_needs_two_independent_reviews', 'humanApproval': False, 'humanTrial': False},
    },
    'examData': {'reviewStatus': 'needs_review', 'coveredGoalIds': [TARGET], 'coveredStrands': ['BIO_INFORMATION_KOMMUNIKATION', 'BIO_STEUERUNG_REGELUNG'], 'demandLevels': ['AB1', 'AB2', 'AB3'], 'taskContent': task, 'solutionContent': solution, 'scoring': {'maxPoints': 24, 'passingPoints': 16, 'steps': [
        {'id': 'surface-aggregate', 'points': 6, 'description': 'Oberflächen-Differenzmessung und gewichtete Summenbildung mit Einzelzellabgrenzung erklärt'},
        {'id': 'controlled-eng', 'points': 7, 'description': 'Kontrollierte ENG-Modellwerte korrekt berechnet und als begrenzten Funktionsvergleich eingeordnet'},
        {'id': 'fresh-ecg', 'points': 7, 'description': 'EKG-Polung und Frequenzen berechnet und methodenspezifisch mit ENG verglichen'},
        {'id': 'bounded-medical-use', 'points': 4, 'description': 'Begrenzten medizinischen Nutzen und unzulässige konkrete Schlussfolgerungen begründet'},
    ]}},
}
future = copy.deepcopy(current)
parent = next(g for g in future['goals'] if g['id'] == PARENT)
parent['contains'].append(ENDPOINT)
future['goals'].append(goal)
assert next(g for g in future['goals'] if g['id'] == TARGET) == by[TARGET]
assert next(g for g in future['goals'] if g['id'] == OLD_GLOBAL) == by[OLD_GLOBAL]
assert sum(s['points'] for s in goal['examData']['scoring']['steps']) == goal['examData']['scoring']['maxPoints']
write(OWN / 'source-canonical.current473.exact.json', current)
write(OWN / 'candidate/canonical.current474-bylk-terminal.inactive.json', future)
write(OWN / 'bounded-bylk-terminal.whole-goal.candidate.json', goal)
write(OWN / 'bounded-bylk-terminal.task-solution-and-rubric.candidate.md', '# Inaktiver maschineller Prüfungskandidat\n\n' + task + '\n\n## Modelllösung und Bewertungsraster\n\n' + solution + '\n')
write(OWN / 'guarded-two-structural-patches-and-source-preservation.author.json', {
    'sourceCanonicalPath': str(CANONICAL.relative_to(ROOT)), 'sourceCanonicalSha256': hashlib.sha256(CANONICAL.read_bytes()).hexdigest(),
    'targetCurricularGoalId': TARGET, 'newAssessmentId': ENDPOINT, 'parentClusterId': PARENT,
    'beforeWholeParentCluster': by[PARENT], 'afterWholeParentCluster': parent,
    'newWholeAssessment': goal, 'unchangedWholeTarget': by[TARGET], 'unchangedWholeGlobalTerminal': by[OLD_GLOBAL],
    'currentWholeGoals': 473, 'candidateWholeGoals': 474, 'curricularAtomicBeforeAndAfter': 391,
    'all391CurricularGoalFieldsPreserved': True, 'targetOwnPositiveEvidencePreserved': True,
    'targetImagePreserved': True, 'onlyExistingGoalChanged': PARENT,
    'globalAppendRejectedBecauseNativeScopeWouldChangeDEHEToEmpty': True,
    'courseBoundary': 'BY elevated level / technical LK only; no new HE or common-GK prerequisite',
    'examReviewStatus': 'needs_review', 'requiredIndependentReviews': 2, 'activeWrites': 0, 'newStrictClosuresClaimed': 0,
})

# Execute the original applicability algorithm over a single inactive source substitution.
source = ROOT / 'app/scripts/applicabilityCompiler.ts'
text = source.read_text()
adapted = re.sub(r"from '(\.[^']+)'", lambda m: "from '" + str((source.parent / m[1]).resolve()) + "'", text)
adapted = adapted.replace("const repoRoot = resolve(scriptDir, '../..')", 'const repoRoot = ' + json.dumps(str(ROOT)))
needle = "const landscape = JSON.parse(readFileSync(file, 'utf8')) as SkillLandscape"
assert adapted.count(needle) == 1
candidate = OWN / 'candidate/canonical.current474-bylk-terminal.inactive.json'
adapted = adapted.replace(needle, 'const landscape = JSON.parse(readFileSync(file === ' + json.dumps(str(CANONICAL)) + ' ? ' + json.dumps(str(candidate)) + " : file, 'utf8')) as SkillLandscape")
write(OWN / 'native-applicability-single-inactive-input-probe.ts', adapted)
write(OWN / 'native-applicability-probe-provenance.json', {'originalPath': str(source.relative_to(ROOT)), 'originalSha256': hashlib.sha256(text.encode()).hexdigest(), 'probeSha256': hashlib.sha256(adapted.encode()).hexdigest(), 'allowedCopyChanges': ['resolve relative imports against original source files', 'repoRoot read-only original repository', 'load only Biology canonical bytes from inactive candidate path'], 'applicabilityAlgorithmChanged': False, 'mappingMemoryAndProvenanceInputs': 'actual current originals', 'activeSourceWrites': False})
print(json.dumps({'candidateWholeGoals': 474, 'newAssessmentId': ENDPOINT, 'existingGoalChanged': PARENT, 'curricularAtomic': 391, 'examReviewStatus': 'needs_review', 'all391WholeGoalsExact': True, 'activeWrites': 0}))
