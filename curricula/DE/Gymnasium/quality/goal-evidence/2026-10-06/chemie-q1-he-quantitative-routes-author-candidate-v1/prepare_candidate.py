# SPDX-License-Identifier: Apache-2.0
"""Create an additive inactive routing candidate; never write active inputs."""
from pathlib import Path
import copy
import hashlib
import json
import uuid
from datetime import datetime, timezone

ROOT = Path(__file__).resolve().parents[7]
OWN = Path(__file__).resolve().parent
OLD = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-q1-quantitative-reviewed-integration-candidate-v1'
BASE = OLD / 'prospective-input-tree'
CANON = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
REGISTRY = 'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'
SK = 'curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json'
CHILDREN = ['3d6699ae-ebbd-5a55-8798-b809a9d74f0a', '18819a59-2442-530f-a7c3-26755398ec66']
AGGREGATE = 'd3cd250f-5221-589d-aa1c-44a4692d1acb'
Q1 = 'a0893975-1677-5dae-bbfb-675789be4f17'
PRACTICE = '4beeb141-2a59-5093-b599-e513403221b0'
LOCAL = ['00139854-e5a7-5c12-ab50-2268c80bf776', 'c91350bc-7d2e-523c-bd50-0324bccfcf98', 'bf6c39f0-1e44-53b2-8ff6-025f2e36e125']
CAPSTONE = '14577339-9e0c-5b44-8e47-91e1a4947367'
PARABEN = '0d59b62e-d3f9-5969-b961-0c5e26316c04'
QUANT_TERMINAL = str(uuid.uuid5(uuid.NAMESPACE_URL, 'skillpilot:chemistry:he:q1:assessment:quantitative-two-analytes:v1'))

def read(path):
    return json.loads(Path(path).read_text())

def digest(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()

def write(name, value):
    path = OWN / name
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open('x') as handle:
        handle.write(json.dumps(value, ensure_ascii=False, indent=2) + '\n')

now = datetime.now(timezone.utc).isoformat()
previous_freeze = read(OLD / 'reviewed-integration.final.freeze.json')
for row in previous_freeze['files']:
    assert digest(ROOT / row['path']) == row['sha256'], row['path']
active_paths = [CANON, REGISTRY, SK,
    'curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json',
    'curricula/DE/Gymnasium/quality/goal-description-review/in-flight-work-ledger.json',
    'app/scripts/config/curriculum-maturity-floor-policy.json',
    'app/scripts/config/goal-books/de-gym-chemistry-national-atlas.inputs.json',
    'app/scripts/config/goal-books/de-gym-chemistry-national-atlas.sources.json']
for subject in ['MATHEMATIK', 'PHYSIK', 'BIOLOGIE']:
    active_paths.append(f'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_{subject}.de.json')
bindings = []
for relative in active_paths:
    path = ROOT / relative
    snapshot = OWN / 'current-376-inputs' / relative
    snapshot.parent.mkdir(parents=True, exist_ok=True)
    if snapshot.exists():
        assert snapshot.read_bytes() == path.read_bytes(), relative
    else:
        with snapshot.open('xb') as handle:
            handle.write(path.read_bytes())
    bindings.append({'path': relative, 'sha256': digest(path), 'snapshotPath': str(snapshot.relative_to(ROOT)), 'bytes': path.stat().st_size})
if (OWN / 'current-376-inputs.freeze.json').exists():
    assert read(OWN / 'current-376-inputs.freeze.json')['files'] == bindings
else:
    write('current-376-inputs.freeze.json', {'schemaVersion': 1, 'createdAtUTC': now, 'status': 'exact active baseline snapshot; no candidate approval', 'files': bindings, 'activeWrites': False, 'humanApproval': False})

before = read(BASE / CANON)
assert digest(BASE / CANON) == '82ebe1f0eeb46674f9dfb8f31e91df8e6bad46c144cf7e9fca0ddb01aee02abd'
future = copy.deepcopy(before)
goals = {goal['id']: goal for goal in future['goals']}
original_goals = {goal['id']: goal for goal in before['goals']}

def closure(goal_id):
    goal = original_goals[goal_id]
    children = goal.get('contains', [])
    if not children:
        return [goal_id]
    return list(dict.fromkeys(child for current in children for child in closure(current)))

q1_atoms = closure(Q1)
q1_compatible = [goal for goal in q1_atoms if goal not in CHILDREN]
changes = []
for goal_id in CHILDREN + [AGGREGATE]:
    goal = goals[goal_id]
    old = copy.deepcopy(goal['applicability'])
    goal['applicability'] = {'jurisdiction': ['DE-HE']}
    changes.append({'goalId': goal_id, 'field': 'applicability', 'before': old, 'after': goal['applicability'], 'reason': 'HE-specific authored analytical cases; no literal compulsory BY analyte-source claim'})
for goal_id in LOCAL:
    goal = goals[goal_id]
    assert Q1 in goal['requires']
    old_requires = goal['requires'][:]
    goal['requires'] = list(dict.fromkeys([x for old in old_requires for x in (q1_compatible if old == Q1 else [old])]))
    assert set(goal['requires']) == (set(old_requires) - {Q1}) | set(q1_compatible)
    old_covered = goal['examData']['coveredGoalIds'][:]
    assert Q1 in old_covered
    goal['examData']['coveredGoalIds'] = [goal for goal in old_covered if goal != Q1]
    # Material, solution, scoring and prior released evidence are preserved.
    # Broad prior prerequisite scope is retained except the two HE-only children;
    # no new assessment coverage is attributed to the other inherited atoms.
    for field in ['taskContent', 'solutionContent', 'scoring', 'reviewStatus']:
        assert goal['examData'][field] == original_goals[goal_id]['examData'][field]
    changes.extend([
        {'goalId': goal_id, 'field': 'requires', 'before': old_requires, 'after': goal['requires'], 'reason': 'expand existing whole-Q1 prerequisite to its exact atomic set minus only HE-only quantitative children'},
        {'goalId': goal_id, 'field': 'examData.coveredGoalIds', 'before': old_covered, 'after': goal['examData']['coveredGoalIds'], 'reason': 'remove unsupported whole-topic assessment claim; retain existing individually named assessment coverage'}])
capstone = goals[CAPSTONE]
for field, container in [('requires', capstone), ('coveredGoalIds', capstone['examData'])]:
    old = container[field][:]
    if field == 'requires':
        assert set(CHILDREN).issubset(old)
    excluded = CHILDREN + ([AGGREGATE] if field == 'coveredGoalIds' else [])
    container[field] = [goal for goal in old if goal not in excluded]
    if old != container[field]:
        changes.append({'goalId': CAPSTONE, 'field': field if field == 'requires' else 'examData.' + field, 'before': old, 'after': container[field], 'reason': 'generic common assessment must not import HE-specific analyte cases into BY'})

paraben_source = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-q1-paraben-lk-terminal-route-candidate-v1/paraben-lk-terminal.goal-template.candidate.json'
paraben = copy.deepcopy(read(paraben_source)['goalTemplate'])
paraben['examData']['scoring']['passingPoints'] = 24
paraben['examData']['taskContent'] = paraben['examData']['taskContent'].split('**Vorläufiger Bewertungsentwurf')[0].rstrip() + '\n\n**Vorläufiger Bewertungsentwurf, keine Freigabe:** 24 von 24 BE. Die frühere Grenze 21/24 erlaubte 5/8 BE in Aufgabe 3 ohne den entscheidenden Löslichkeitskonflikt von P. Vollständige Punkte verlangen auch diesen Gegenbefund und die begrenzte Schlussfolgerung. Die unabhängige Prüfung des Punkteschlüssels und der Lernzielabdeckung steht aus; needs_review bleibt erhalten.'
paraben['examData']['solutionContent'] = paraben['examData']['solutionContent'].split('Der vorgeschlagene Punkteschlüssel')[0].rstrip() + '\n\nDie vorläufige Bestehensgrenze 24/24 verlangt vollständige Leistungen auch zum Löslichkeitskonflikt von P. Unabhängige fachliche Prüfung und Freigabe stehen aus; keine Lernendenleistung oder Mastery wird behauptet.'
paraben['extendedData']['terminalRouteCandidate']['package'] = str(OWN.relative_to(ROOT))
paraben['applicability'] = {'jurisdiction': ['DE-BY', 'DE-HE']}
paraben['extendedData']['terminalRouteCandidate']['purpose'] = 'Local Q1-LK terminal whose BY/HE practice applicability derives from the existing paraben-use prerequisite; no source-coverage evidence is asserted'

task = '''**Fiktiver analytischer Fall:**

Ein Modelllabor untersucht eine wässrige Modellgrundlage mit Ascorbinsäure und einem vorgegebenen Methylparaben. Alle Werte sind frei gewählte didaktische Messprotokolle. Es handelt sich weder um echte Laborarbeit noch um Sicherheits-, Rechts- oder Produktfreigaben. Die beiden Analyten werden unabhängig bestimmt.

**Material 1 – Strukturen und Methoden:**

Ascorbinsäure besitzt eine reduzierende Enediol-Struktur. Unter den ausdrücklich vorgegebenen Bedingungen gilt C₆H₈O₆ + I₂ → C₆H₆O₆ + 2 I⁻ + 2 H⁺. M(Ascorbinsäure) = 176,12 g/mol. Für die Modellmatrix ist die Reaktion mit Iod im angegebenen Medium geprüft; andere reduzierende Matrixbestandteile sind nicht nachgewiesen. Daraus folgt keine allgemeine Matrixselektivität.

Methylparaben hat HO–C₆H₄–C(=O)–O–CH₃; OH und Estergruppe stehen para am Benzolring. Für diesen Ester ist unter denselben Bedingungen kein stöchiometrisch definierter Iodumsatz gegeben. Eine HPLC-Methode trennt den dem Standard zugeordneten Methylparabenpeak von den angegebenen Matrixpeaks. Identität und Reinheit werden hier als Fallzuordnung vorausgesetzt; die Retentionszeit allein würde sie nicht beweisen. Die Peakfläche wird unter den gegebenen konstanten Bedingungen über eine Standardkalibrierung ausgewertet.

**Material 2 – Ascorbinsäureprotokoll:**

5,00 mL ursprüngliche Modellprobe werden auf 100,0 mL verdünnt. 10,00 mL dieser verdünnten Probe werden mit einer Iodlösung der Konzentration 0,000500 mol/L bis zum vorgegebenen Endpunkt titriert. Die drei Verbrauchswerte betragen 16,00; 16,10; 15,90 mL. Ein gleich behandelter Matrixblindwert beträgt 1,00 mL und wird vom Probenverbrauch abgezogen. Eine positive Referenzkontrolle erreicht 99 % des vorgegebenen Sollwerts; ein gespikter Ansatz erreicht 100 % der erwarteten zusätzlichen Ascorbinsäuremenge. Diese zwei Kontrollen ersetzen keine vollständige Validierung sämtlicher möglicher Interferenzen.

**Material 3 – Methylparabenprotokoll:**

1,00 mL ursprüngliche Modellprobe werden auf 100,0 mL verdünnt. Unter identischen HPLC-Bedingungen gelten folgende Standards: 0,0; 5,0; 15,0; 25,0 mg/L mit den Peakflächen 100; 6 100; 18 100; 30 100. Für diesen Fall gilt innerhalb 0–25 mg/L das lineare Modell A = 1 200 · c + 100, mit c in mg/L. Die drei Probenflächen betragen 24 100; 24 220; 23 980. Die Matrixkontrolle hat am zugeordneten Peakfenster nur den Basiswert 100; eine Wiederfindungskontrolle ergibt 100 %. Die Matrixpeaks sind getrennt. Es gibt keine Belege für andere Stoffe, Matrizes oder einen größeren Messbereich.

**Material 4 – Durchführung und Grenzen:**

Zur Verfügung stehen Messkolben, Vollpipetten, Bürette beziehungsweise das vorgegebene HPLC-System, Matrixblindprobe, jeweiliger Standard und Wiederfindungskontrolle. Durchführung bedeutet hier die nachvollziehbare Ausführung und Prüfung des vorgegebenen simulierten Analysenablaufs. Eine echte Laborleistung wird weder verlangt noch behauptet. Ein unverdünnter Ansatz, ein fehlender Blindwert oder das Übertragen einer Kalibrierung auf andere Bedingungen wären neue, hier unbelegte Verfahren.

**Aufgaben – 24 BE:**

1. Wählen und begründen Sie für jeden Analyten die passende Methode anhand von Struktur und gegebenen Methodenbedingungen. Erklären Sie, warum nicht beide Gehalte mit derselben ungeprüften Iodstöchiometrie berechnet werden dürfen. (6 BE)
2. Planen und führen Sie den simulierten Ablauf für jeden Analyten nachvollziehbar durch: Verdünnung, jeweilige Messung, Kontrollen und die Reaktion auf einen nicht bestandenen Kontrollwert. Verwenden Sie alle vorgegebenen Kontrollbefunde. (6 BE)
3. Bestimmen Sie aus allen drei Messungen den Ascorbinsäuregehalt in g/L und den Methylparabengehalt in mg/L der ursprünglichen Modellprobe. Zeigen Sie Blindwert beziehungsweise Kalibrierung und beide Verdünnungsfaktoren getrennt. (8 BE)
4. Benennen Sie für jede Methode eine durch das Material nicht ausgeschlossene Verfahrensgrenze. Grenzen Sie analytischen Gehalt, Wirksamkeit und Verwendungsentscheidung ausdrücklich voneinander ab. (4 BE)

**Ungeprüfter Bewertungsentwurf:** 24/24 BE. Beide Analyten müssen vollständig bearbeitet sein. needs_review; keine maschinelle Inhaltsfreigabe und keine Lernendenmastery.''' 

solution = '''1. Ascorbinsäure: reduzierende Enediol-Struktur und vorgegebenes stöchiometrisches 1:1-Verhältnis zu Iod unter den dokumentierten Modellbedingungen. Methylparaben: für den phenolischen Ester ist keine verwendbare Iodstöchiometrie gegeben; getrennte Standardkalibrierung der HPLC-Peakfläche unter konstanten Bedingungen. Eine bloße phenolische OH-Gruppe rechtfertigt keine Übernahme der Ascorbinsäure-Stöchiometrie. Je begründete Methodenauswahl 2 BE, ausdrückliche Ablehnung der ungeprüften gemeinsamen Iodstöchiometrie 2 BE.

2. Ascorbinsäure: quantitativ 5,00 mL auf 100,0 mL, 10,00-mL-Aliquot, drei Titrationen bis zum gleichen definierten Endpunkt, Matrixblindwert und positive Referenz-/Wiederfindungskontrolle berücksichtigen. Methylparaben: quantitativ 1,00 mL auf 100,0 mL, Standards und Matrix-/Wiederfindungskontrolle unter identischen HPLC-Bedingungen, drei Probenflächen, Bereich und Peakzuordnung prüfen. Die gegebenen Kontrollen sind innerhalb der beschriebenen Fallannahmen konsistent; bei einer fehlgeschlagenen Kontrolle dürfen keine gültigen Gehalte behauptet werden, sondern Ursache prüfen und validen Ablauf erneut herstellen. Je vollständiger Ablauf inklusive Verdünnung und Kontrolle 2 BE, begründeter Umgang mit Kontrollversagen 2 BE. Die Simulation ist keine echte Laborleistung.

3. Ascorbinsäure: mittlerer Probenverbrauch 16,00 mL; korrigiert 15,00 mL. n = 0,000500 mol/L · 0,01500 L = 7,50·10⁻⁶ mol im 10,00-mL-Aliquot. c(verdünnt) = 7,50·10⁻⁴ mol/L. Verdünnungsfaktor 100,0/5,00 = 20,0; c(ursprünglich) = 0,0150 mol/L. Massenkonzentration = 0,0150 · 176,12 = 2,6418 g/L, entsprechend etwa 2,64 g/L unter den Fallannahmen. Methylparaben: mittlere Fläche 24 100; c(verdünnt) = (24 100 − 100)/1 200 = 20,0 mg/L, innerhalb des Kalibrierbereichs. Verdünnungsfaktor 100,0/1,00 = 100; c(ursprünglich) = 2 000 mg/L = 2,00 g/L. Je Analyt 4 BE: korrektes Mess-/Korrekturmodell 1, Konzentrationsrechnung 1, eigener Verdünnungsfaktor 1, ursprünglicher Gehalt mit Einheit 1. Keine gemeinsame Kalibrierung oder doppelte Blindwertkorrektur.

4. Iodbestimmung: andere reduzierende Matrixbestandteile oder ein anders bestimmter Endpunkt könnten den Gehalt verfälschen; die vorgegebenen Kontrollen schließen nicht jede denkbare Störung aus. HPLC: unerkannte Koelution, andere Matrix oder Messbedingungen beziehungsweise Extrapolation außerhalb des Kalibrierbereichs wären nicht abgesichert. Ein analytischer Gehalt beweist weder konservierende Wirkung noch gesundheitliche oder rechtliche Zulässigkeit; dafür fehlen eigene Wirksamkeits-, Verträglichkeits- und Verwendungsnachweise. Je methodenspezifische Grenze 1 BE, Gehalt gegenüber Wirksamkeit und Verwendung korrekt begrenzen 2 BE. Bewertungsentwurf needs_review, keine Inhaltsfreigabe oder tatsächliche Lernendenleistung.''' 

quantitative = {
    'id': QUANT_TERMINAL, 'title': 'Zwei Analyten in einer Modellprobe quantitativ bestimmen (LK)',
    'titleEn': 'Quantify two analytes in a model sample (LK)',
    'description': 'Die lernende Person kann einen materialgestützten HE-Q1-LK-Fall zur unabhängigen quantitativen Bestimmung von Ascorbinsäure und Methylparaben selbstständig bearbeiten, Methoden strukturbezogen auswählen, den simulierten Ablauf mit Kontrollen ausführen und beide ursprünglichen Gehalte sowie Verfahrensgrenzen begründen.',
    'descriptionEn': 'The learner can independently solve a material-based HE Q1 LK case involving separate quantitative assays of ascorbic acid and methylparaben, select methods from structure and stated conditions, execute the simulated controlled procedures, and justify both original concentrations and method limits.',
    'weight': 1, 'tags': ['LK', 'Practice', 'Assessment', 'SekII'], 'contains': [], 'requires': CHILDREN[:], 'type': 'atomic', 'examples': [],
    'dimensionTags': {'framework': 'hessen-kc-2024-chemistry', 'demandLevel': 'AB3', 'processCompetencies': ['PK2_MODELLIEREN', 'PK5_BEWERTEN'], 'guidingIdeas': ['BC_AUFBAU', 'BC_REAKTION'], 'phase': 'Q1'},
    'applicability': {'jurisdiction': ['DE-HE']},
    'extendedData': {'applicabilityFromRequires': True, 'treeOrder': 5, 'terminalRouteCandidate': {'package': str(OWN.relative_to(ROOT)), 'purpose': 'authored HE analytical transfer; no compulsory BY analyte claim', 'machineContentReview': 'pending-independent-review', 'humanApproval': False}},
    'examData': {'reviewStatus': 'needs_review', 'coveredGoalIds': CHILDREN[:], 'coveredStrands': ['BC_AUFBAU', 'BC_REAKTION'], 'demandLevels': ['AB2', 'AB3'], 'taskContent': task, 'solutionContent': solution, 'scoring': {'maxPoints': 24, 'passingPoints': 24, 'steps': [{'id': 's1', 'points': 6, 'description': 'Beide Methoden anhand von Struktur und Bedingungen getrennt begründen'}, {'id': 's2', 'points': 6, 'description': 'Beide simulierten Abläufe mit Kontrollen ausführen und Kontrollversagen korrekt behandeln'}, {'id': 's3', 'points': 8, 'description': 'Beide ursprünglichen Gehalte mit eigener Korrektur und Verdünnung berechnen'}, {'id': 's4', 'points': 4, 'description': 'Je Methodengrenze und Grenzen von Wirkung und Verwendung begründen'}]}}
}
for addition in [paraben, quantitative]:
    assert addition['id'] not in goals
    future['goals'].append(addition)
    goals[addition['id']] = addition
    goals[PRACTICE]['contains'].append(addition['id'])
goals[PRACTICE]['weight'] = original_goals[PRACTICE]['weight'] + 2

active = read(ROOT / CANON)
active_goals = {g['id']: g for g in active['goals']}
strict = read(ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-biologie-ni-quantitative-integration-v1/stable-checkpoint-four-subject-central.stdout.txt')['subjects']
strict_ids = next(s for s in strict if s['subject'] == 'chemie')['strictCompleteGoalIds']
assert len(strict_ids) == 104
assert all(goals[g] == active_goals[g] for g in strict_ids)
changed = [g for g in original_goals if original_goals[g] != goals[g]]
assert set(changed) == set(CHILDREN + [AGGREGATE, PRACTICE, CAPSTONE] + LOCAL)
write('proposed-active-tree/' + CANON, future)
write('paraben-terminal.goal-template.candidate.json', {'schemaVersion': 1, 'documentType': 'inactive-practice-assessment-candidate', 'goalTemplate': paraben, 'status': 'needs independent content review', 'historicalSourceSHA256': digest(paraben_source), 'humanApproval': False})
write('quantitative-two-terminal.goal-template.candidate.json', {'schemaVersion': 1, 'documentType': 'inactive-practice-assessment-candidate', 'goalTemplate': quantitative, 'status': 'needs independent content review', 'humanApproval': False})
write('native-safe-route-source-patch.author-candidate.json', {
    'schemaVersion': 1, 'createdAtUTC': now, 'status': 'inactive authored structural/source-scope candidate; no native PASS or independent approval yet',
    'current376CanonicalSHA256': digest(ROOT / CANON), 'priorReviewed378CanonicalSHA256': digest(BASE / CANON),
    'historical407FreezeSHA256': digest(OLD / 'reviewed-integration.final.freeze.json'), 'allHistorical407Exact': True,
    'proposedCanonicalPath': str((OWN / 'proposed-active-tree' / CANON).relative_to(ROOT)),
    'proposedCanonicalSHA256': digest(OWN / 'proposed-active-tree' / CANON),
    'changedExistingCandidateGoalIds': changed, 'fieldDeltas': changes,
    'Q1OriginalAtomicPrerequisiteSet': q1_atoms, 'Q1PreservedAtomicPrerequisiteSet': q1_compatible,
    'exactlyTwoHEChildrenExcludedFromCommonBYImportRoutes': CHILDREN,
    'newPracticeAssessmentIds': [paraben['id'], quantitative['id']], 'newCurricularAtomicIdsByThisRouteCandidate': [],
    'protected104WholeGoalsExact': True, 'allOther469ReviewedCandidateWholeGoalsExact': len(original_goals) - len(changed),
    'newSourceMappings': [], 'inventedBYSourceClaims': False, 'oldScientificDescriptionsImagesPositiveProfilesReused': True,
    'independentReviewGaps': ['both new assessments content/scoring and machine release', 'all changed prerequisite and source-scope contexts in actual native D pages', 'actual native source coverage and regional projection closure', 'native semantic-kind classification and source fingerprints', 'native A/M/P/V affected payload comparison and bindings', 'unchanged nine maturity floors after later reviewed integration'],
    'currentStrictCount': 104, 'currentDenominator': 376, 'provisionalPreviouslyReviewedFutureStrict': 112, 'provisionalPreviouslyReviewedFutureDenominator': 378,
    'futureStrictCertifiedAfterThisPatch': False, 'newScientificCompletions': 0, 'activeWrites': False, 'humanApproval': False, 'humanTrial': False,
})
assert all(digest(ROOT / x['path']) == x['sha256'] for x in bindings)
print('Prepared inactive route/source candidate: 8 existing candidate goals changed, 2 assessment additions; 104 current WholeGoals exact; no active writes or approvals.')
