#!/usr/bin/env python3
# Apache-2.0. Two specified author corrections; V3 is immutable.
import copy, hashlib, json
from pathlib import Path
E13 = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-13')
BASE = E13 / 'chemie-e594-residual-source-duty-author-20261013-v3'
OWN = E13 / 'chemie-e594-classification-profile-case-targeted-author-20261013-v4'
assert not (OWN / 'FINAL.finite-targeted-profile-case-author.freeze.json').exists()
def read(p): return json.loads(Path(p).read_text())
def bind(p):
    b = Path(p).read_bytes()
    return {'path': str(p), 'sha256': 'sha256:' + hashlib.sha256(b).hexdigest(), 'bytes': len(b)}
def write(name, obj):
    p = OWN / name; p.parent.mkdir(parents=True, exist_ok=True)
    with p.open('x') as f: f.write(obj if isinstance(obj, str) else json.dumps(obj, ensure_ascii=False, indent=2) + '\n')
seal = read(BASE / 'FINAL.finite-residual-source-duty-author.freeze.json')
for b in seal['outputFiles']: assert bind(b['path']) == b
profile_input = BASE / 'positive/two-full-DEEN-classification-profiles.author.json'
case_input = BASE / 'positive/four-full-DEEN-classification-transfer-cases.author.json'
profiles = read(profile_input)
cases = read(case_input)
target_case = 'd72cbb62-classification-transfer-2'
old = 'Z wird nach der beschriebenen Küpenmethode und nicht allein nach dem sichtbaren Endergebnis als Direktfarbstoff eingeordnet.'
new = 'Z wird nach der beschriebenen Küpenmethode als Küpenfarbstoff eingeordnet; das sichtbare Endergebnis allein rechtfertigt keine Einordnung als Direktfarbstoff.'
boundary = 'Require two substantively different independent evidence pieces, which may occur within one rich task. Classification/application and a distinct contrast, correction or non-example explanation can provide these pieces; do not count a repeated answer twice. The paired case designs are alternatives, not a mandatory task quota. Stop assessing when all aspects have sufficient evidence. No learner performance or mastery occurred.'
case_rows = []
for i, before in enumerate(cases['cases']):
    after = copy.deepcopy(before)
    after['gradingBoundary'] = 'Credit only the explicit classification demands. The profile requires two substantively different evidence pieces, which can be shown within one rich task. Count classification/model application and a distinct contrast, correction or non-example explanation when each is actually demonstrated; never count a repeated answer twice. The paired case designs remain alternatives without an extra-task quota. No automatic mastery or learner evidence is claimed.'
    if before['caseId'] == target_case:
        assert before['modelAnswerDe'].count(old) == 1
        after['modelAnswerDe'] = before['modelAnswerDe'].replace(old, new)
        rubric = next(r for r in after['rubric'] if r['criterionId'] == target_case + '-r3')
        assert rubric['criterionDe'].count(old) == 1
        rubric['criterionDe'] = rubric['criterionDe'].replace(old, new)
    case_rows.append({'caseId': before['caseId'], 'sourceWholeArrayPointer': '/cases/' + str(i), 'expectedBeforeWholeCase': before, 'proposedAfterWholeCase': after})
profile_rows = []
for i, before in enumerate(profiles['profiles']):
    after = copy.deepcopy(before)
    assert after['profile']['coverageExpectations']['minimumIndependentDemonstrations'] == 1
    after['profile']['coverageExpectations']['minimumIndependentDemonstrations'] = 2
    for brief in after['profile']['applicationCaseBriefs']:
        if brief['id'] == target_case:
            assert brief['expectedPerformanceDe'].count(old) == 1
            brief['expectedPerformanceDe'] = brief['expectedPerformanceDe'].replace(old, new)
    profile_rows.append({'goalId': before['goalId'], 'sourceWholeArrayPointer': '/profiles/' + str(i), 'expectedBeforeWholeProfileRow': before, 'proposedAfterWholeProfileRow': after})
write('candidate/two-whole-DEEN-profile-CAS.targeted-author.json', {
    'license': 'CC-BY-4.0', 'authorOnly': True, 'role': 'Two whole profile rows after two specified targeted V3 findings',
    'immutableV3Seal': bind(BASE / 'FINAL.finite-residual-source-duty-author.freeze.json'),
    'expectedWholeProfileArrayBinding': bind(profile_input), 'wholeProfileCAS': profile_rows,
    'proposedMasteryDecisionBoundary': boundary, 'goalBodiesSourceViewsAndImagesUnchanged': True,
    'onlyMinimumEvidenceCountAndCoupledRP2DEBriefCorrection': True,
    'compiledPageAndGoalEvidenceFingerprintBindingPending': True, 'noGateStatusOrScientificApproval': True,
    'activeWrites': False
})
write('candidate/four-whole-bilingual-case-CAS.targeted-author.json', {
    'license': 'CC-BY-4.0', 'authorOnly': True, 'role': 'Four whole cases with coherent two-piece assessment interpretation and one targeted RP2 DE chemistry correction',
    'immutableV3Seal': bind(BASE / 'FINAL.finite-residual-source-duty-author.freeze.json'),
    'expectedWholeCaseArrayBinding': bind(case_input), 'wholeCaseCAS': case_rows,
    'proposedMasteryDecisionBoundary': boundary, 'specificScientificCorrection': {'caseId': target_case, 'oldExactDESentence': old, 'newExactDESentence': new, 'coupledLocations': ['modelAnswerDe', 'rubric/r3/criterionDe', 'profile/applicationCaseBrief/expectedPerformanceDe']},
    'allCaseTasksDataAndScientificENFieldsUnchanged': True, 'allExistingTaskRubricDemandSpansUnchanged': True,
    'noGateStatusOrScientificApproval': True, 'activeWrites': False
})
design = []
for row in case_rows:
    case = row['proposedAfterWholeCase']; rp = case['goalId'].startswith('d72cbb62')
    ids = [r['criterionId'] for r in case['rubric']]
    primary = ids[:2] if rp or case['caseId'].endswith('-1') else ids[:1]
    contrast = ids[2:] if rp or case['caseId'].endswith('-1') else ids[1:]
    design.append({'caseId': case['caseId'], 'goalId': case['goalId'],
        'piece1': {'wholeRubricCriterionIds': primary, 'roleDe': 'Selbst begründete Klassifikation/Modellanwendung an den gegebenen variierten Strukturen und Akten.', 'roleEn': 'Independently justified classification/model application to the supplied varied structures and records.'},
        'piece2': {'wholeRubricCriterionIds': contrast, 'roleDe': 'Eigenständige Kontrast-, Fehlerkorrektur- oder Nichtbeispielbegründung; keine Wiederholung der ersten Zuordnung.', 'roleEn': 'A distinct contrast, error-correction or non-example explanation; not repetition of the first assignment.'},
        'requiredExpectationIds': ['e1', 'e2', 'e3'], 'wholeTaskContainsBothOpportunities': True,
        'actualEvidenceMustBeObservedBeforeCounting': True, 'sameAnswerNotCountedTwice': True,
        'noRequiredSecondCaseOrAdditionalTask': True})
write('two-distinct-evidence-pieces-and-whole-case-expectation-coherence.author.json', {
    'role': 'Bounded interpretation of existing assessment opportunities, no new curricular demand',
    'stockMinimumIndependentDemonstrations': 2, 'caseDesigns': design,
    'richTaskCanContainTwoDifferentEvidencePieces': True, 'allGoalAspectsStillRequired': True,
    'freshVariationAndIndependentTransferStillRequired': True, 'noAutomaticAcceptanceFromTwoLabels': True,
    'noExtraTaskQuota': True, 'noPerformanceMasteryOrReviewVoteOccurred': True
})
write('rationale.only-two-targeted-findings.author.md', '# V4: zwei gezielte Korrekturen\n\nV3 bleibt mit allen 22 versiegelten Outputs unverändert. Beide ganzen Profile setzen den normalen Mindestwert von zwei unterschiedlichen Beweisstücken. Eine reichhaltige Aufgabe kann beide liefern: begründete Anwendung/Klassifikation und eine eigenständige Kontrast-, Fehlerkorrektur- oder Nichtbeispielbegründung. Eine bloße Wiederholung zählt nicht zweimal. Es entsteht keine Pflicht, beide Fallalternativen oder zusätzliche Aufgaben abzuarbeiten; alle Zielaspekte, echte frische Variation und unabhängiger Transfer bleiben nötig. Die vorhandenen ganzen Tasks und Rubriken enthalten beide Gelegenheiten. Der separate Kohärenznachweis verbindet ihre ganzen Kriterien mit e1/e2/e3; das ist ein Autorentwurf, kein Lernleistungs- oder Gatebeleg.\n\nIm zweiten RP-Fall benennt die deutsche Lösung Z jetzt ausdrücklich als Küpenfarbstoff; das sichtbare Endergebnis erlaubt keine Direktfarbstoff-Zuordnung. Dieselbe Änderung steht im deutschen r3-Kriterium und im positiven Fallbrief. Aufgaben, Daten, englische fachliche Inhalte und alle Aufgaben-Spans bleiben exakt erhalten. Ziele, Quellen-/View-CAS, optionale HOLDs und Bilder bleiben bytegenau in V3 bzw. dessen gebundenen Vorständen.\n\nV4 enthält nur ganze Vorher-/Nachher-Zeilen für zwei Profile und vier bilinguale Fälle, exakte Vorstandsbindungen und begrenzte Prüfungen. Es schreibt keine aktiven Daten und behauptet keine unabhängige Qualitätsfreigabe. Root bindet spätere kompilierte Seiten und finale Evidenz-Fingerprints; der gezielte unabhängige Nachcheck steht aus.\n')
print(json.dumps({'wholeProfileCAS': len(profile_rows), 'wholeCaseCAS': len(case_rows), 'V3Immutable': True, 'newScientificCorrectionCases': 1, 'activeWrites': False}))
