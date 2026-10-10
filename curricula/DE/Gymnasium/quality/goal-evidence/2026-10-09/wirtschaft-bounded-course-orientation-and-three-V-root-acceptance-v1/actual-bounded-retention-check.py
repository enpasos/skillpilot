import copy
import hashlib
import json
import subprocess
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[7]
OUT = Path(__file__).resolve().parent
BASE = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/wirtschaft-all-open-route-extension-author-20261009-v1'
V3 = BASE / 'eight-a-LK-only-supported-course-successor-v3'
V4 = BASE / 'two-orientation-requires-bounded-sequence-successor-v4'
VIS = ROOT / 'curricula/DE/Gymnasium/quality/goal-visualization-review/wirtschaft-BE18-three-elasticities-levels-independent-native-phone-desktop-review-20261009-v1'

def read(p):
    return json.loads(p.read_text())

def sha(p):
    return hashlib.sha256(p.read_bytes()).hexdigest()

def binding(p):
    return {'path': str(p.relative_to(ROOT)), 'sha256': sha(p)}

live = ROOT / 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json'
assert sha(live) == 'ced16a782bd880239011f33731c57cf59d54d02b923c55c31c918492610ebfaa'
can3 = V3 / 'whole-current300-plus-Generic11-and-nine-root-machine-released-terminals.inert.candidate.json'
can4 = V4 / can3.name
old = {g['id']: g for g in read(can3)['goals']}
new = {g['id']: g for g in read(can4)['goals']}
assert old.keys() == new.keys()
changed = [i for i in old if old[i] != new[i]]
expected = ['575c08d4-204f-5f78-8f2f-1994db6f19ee', '055ef95c-0b64-5675-8f14-2524c3438009']
assert set(changed) == set(expected)
for i in expected:
    g = copy.deepcopy(old[i])
    assert g['requires'] == []
    g['requires'] = ['6bf2d1cc-e745-50dd-a617-71c06a6c6945']
    assert g == new[i]

material_base = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09'
material_files = [
    material_base / 'wirtschaft-four-terminal-materials-independent-root-20261009-v1/whole-four-material-reviewed-machine-released.inert.candidate.json',
    material_base / 'wirtschaft-five-additional-terminal-materials-independent-root-20261009-v1/whole-five-material-reviewed-machine-released.inert.candidate.json',
]
material_checks = []
lk_exam = '6a5efa74-66c8-5682-8371-b0a93d17f986'
for p in material_files:
    for goal in read(p):
        approved = copy.deepcopy(goal)
        if goal['id'] == lk_exam:
            assert approved['tags'] == ['GK', 'LK', 'Practice', 'Assessment']
            approved['tags'] = ['LK', 'Practice', 'Assessment']
        assert approved == new[goal['id']]
        assert goal['examData'] == new[goal['id']]['examData']
        material_checks.append({'goalId': goal['id'], 'wholeBodyExactExceptAcceptedLKTag': True, 'examDataWholeExact': True})
assert len(material_checks) == 9

sets_file = V3 / 'actual-exact-GK-LK-target-set-and-four-LK-support-role-closure.json'
role_rows = read(sets_file)['rows']
view_checks = []
support = ['3bcb976d-3e45-5c62-81ac-5ed909df202b', '641dee8e-9658-5db1-89eb-2353f8322a8a', '7cbcca15-e93b-57ce-8f14-ffd1a557e288', '8a453b6b-4f28-54bc-8614-4ec8d5384a85']
for row in role_rows:
    course = row['courseProfile']
    assert row['currentCurricularAtomicTargetsBefore'] == row['currentCurricularAtomicTargetsAfter']
    assert row['addedCurricularAtomicTargets'] == row['removedCurricularAtomicTargets'] == []
    assert row['explicitSupportOnlyIds'] == (support if course == 'LK' else [])
    terminal = next(x for x in row['actualNewAssessmentTargets'] if x['goalId'] == lk_exam)
    assert terminal['targetVisible'] == (course == 'LK') and not terminal['prerequisiteOnly']
    original = read(ROOT / f'curricula/DE/Gymnasium/composition-views/wirtschaft/de-de-gym-economics-{course.lower()}.view.json')
    candidate_path = V3 / f'national-{course}.bounded-route-author.candidate.view.json'
    candidate = read(candidate_path)
    retained = copy.deepcopy(candidate)
    extra = retained['rootNodes'][0]['children'][len(original['rootNodes'][0]['children']):]
    retained['rootNodes'][0]['children'] = retained['rootNodes'][0]['children'][:len(original['rootNodes'][0]['children'])]
    assert retained == original
    assert extra[0] == {'kind': 'canonicalSubtree', 'goalId': '5317d078-413b-58bb-9262-d57387d51655', 'displayLabel': 'Ergänzende materialgestützte Wirtschaftsübungen'}
    assert {x['goalId'] for x in extra[1:]} == (set(support) if course == 'LK' else set())
    assert all(x == {'kind': 'goalEntry', 'goalId': x['goalId'], 'projectionRole': 'prerequisiteOnly'} for x in extra[1:])
    assert sha(candidate_path) == sha(V4 / candidate_path.name)
    view_checks.append({'courseProfile': course, 'oldWholeViewRetainedAsExactPrefix': True, 'currentCurricularAtomicTargetCount': len(row['currentCurricularAtomicTargetsAfter']), 'targetAdded': [], 'targetRemoved': [], 'newLKExamVisible': terminal['targetVisible'], 'explicitSupportOnlyIds': row['explicitSupportOnlyIds']})

native = read(V4 / 'actual-native-all-nine-before-after-global-local-graph-and-type.report.json')
after = next(x for x in native['results'] if x['label'] == 'allNineCandidate')
rules = {x['id']: x for x in after['route']['rules']}
assert rules['CQR-101']['metrics']['missingMotivationPath'] == 0
assert rules['CQR-101']['metrics']['missingTerminalPath'] == 4
for rule in ['CQR-103', 'CQR-104', 'CQR-201', 'CQR-202', 'CQR-203']:
    assert rules[rule]['status'] == 'pass'
assert rules['CQR-104']['metrics']['projectionLocalRouteChecksEnabled'] == 0
assert after['graph']['status'] == after['type']['status'] == 'pass'
for local in after['local']:
    assert [x['goalId'] for x in local['wholeVisibleOnlyMissingTerminal']] == ['099086bb-5100-5ce0-8334-0aab8850a48e']

vis_receipt = VIS / 'actual-final-independent-three-native-PNG-phone-desktop-V-content-review.receipt.json'
assert sha(vis_receipt) == 'ca428ed98ce66cdc6668379472915d65420a954e1d5be7100fe751fbb11416a3'
guard = read(VIS / 'actual-inputs-after.guard.json')['files']
for row in guard:
    p = Path(row['path'])
    if not p.is_absolute():
        p = ROOT / p
    assert sha(p) == row['sha256'].removeprefix('sha256:')
assert len(guard) == 23
visuals = read(VIS / 'three-individual-independent-actual-native-360-680-visual-content-judgments.json')
assert len(visuals) == 3 and all(x['decision'] == 'KEEP' and x['findings'] == [] for x in visuals)
for row in visuals:
    for item in row['actualViews']:
        assert sha(ROOT / item['path']) == item['sha256'].removeprefix('sha256:')
    assert sha(Path(row['provenance']['originalToolFile'])) == row['provenance']['originalToolSha256'].removeprefix('sha256:')
    assert sha(ROOT / row['provenance']['promptPath']) == row['provenance']['promptSha256'].removeprefix('sha256:')

checker = ROOT / 'app/scripts/generateCurriculumQualityStatus.ts'
head_checker = subprocess.run(['git', 'show', 'HEAD:app/scripts/generateCurriculumQualityStatus.ts'], cwd=ROOT, check=True, capture_output=True).stdout
assert checker.read_bytes() == head_checker
result = {
    'schemaVersion': 1,
    'createdAt': datetime.now(timezone.utc).isoformat(),
    'reviewer': '/root',
    'kind': 'independent-bounded-course-and-two-orientation-sequence-acceptance-plus-three-foreign-V-retention',
    'previousGoalTurnClassification': 'no_progress: commit-message response only; no authoritative QS changes or wait handle',
    'currentLiveCanonical': binding(live),
    'candidateCanonical': binding(can4),
    'actuallyReadWholeGoalIds': support + ['6bf2d1cc-e745-50dd-a617-71c06a6c6945', '5317d078-413b-58bb-9262-d57387d51655'] + expected,
    'actualCurrentPrimaryCourseReads': [
        {'url': 'https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/13/wirtschaft-und-recht/grundlegend', 'section': 'WR13 2.2', 'findingDe': 'Grundlegendes Niveau verlangt die Leistungsbilanz und bedingte Ungleichgewichtsprobleme. Daraus folgt keine vollständige Finanzkonto-Prüfung für dieses neue Material.'},
        {'url': 'https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/13/wirtschaft-und-recht/erhoeht', 'section': 'WR13 2.2', 'findingDe': 'Erhöhtes Niveau bezieht die Kapitalbilanz ausdrücklich ein; die unveränderte vollständige neue Prüfung ist deshalb für LK sachgerecht.'},
    ],
    'independentCourseDecision': 'KEEP bounded LK-only tag for new 6a exam and exactly four explicit LK prerequisiteOnly supports; all previous curricular targets retained',
    'viewChecks': view_checks,
    'ninePreviouslyWholeReviewedMaterialsRetention': material_checks,
    'independentSequenceDecisions': [
        {'goalId': i, 'decision': 'KEEP', 'reasonDe': 'Selbständiges gegebenes Material setzt keine der entfernten breiten Fachroutinen voraus. Der vorhandene unbenotete positive Facheinstieg kann vorherliegen; diese Kante verlangt keine fachliche Leistung in der Orientierung.', 'wholeOtherFieldsExact': True}
        for i in expected
    ],
    'actualOrientationFinding': {
        'goalId': '6bf2d1cc-e745-50dd-a617-71c06a6c6945',
        'field': 'descriptionEn',
        'status': 'open_author_successor_requested',
        'findingDe': 'Die deutsche Orientierung fordert keine fachliche Erklärung, die englische Beschreibung formuliert noch eine erklärbare Kompetenz. Eine gezielte englische Korrektur muss vor dem finalen Kontextfreeze tatsächlich geprüft werden.',
        'semanticKindOrientationWholeRetained': True,
        'fullOrientationReviewOrRuntimeClaim': False,
    },
    'actualNativeEvidence': {
        'report': binding(V4 / 'actual-native-all-nine-before-after-global-local-graph-and-type.report.json'),
        'missingGlobalMotivation': 0,
        'missingGlobalTerminal': 4,
        'remainingLocalGKandLKTerminal': ['099086bb-5100-5ce0-8334-0aab8850a48e'],
        'CQR104ScopeLimit': 'Original Economics CQR104 has projectionLocalRouteChecksEnabled=0; use the separately actually course-filtered local report. No full local proof is inferred from CQR104 PASS.',
        'checkerWholeExactHEAD': binding(checker),
        'thresholdOrFlagChanges': 0,
    },
    'independentThreeVisualAcceptance': {
        'receipt': binding(vis_receipt),
        'foreignReviewer': '/root/economics_be20_independent_need_review',
        'actualForeignDecisions': 'three native originals, three 360 and three 680 views KEEP; no open findings',
        'current23InputsExact': True,
        'rootContentReviewRestart': False,
        'rootOwnImagesSelfApproved': False,
        'actualNativeImportStillRequired': True,
    },
    'strictProgress': {'currentComplete': 300, 'currentDenominator': 311, 'netGain': 0, 'newFachlicheClosures': 0, 'restoredLiveBindings': 0},
    'truthfulness': {'liveWrites': [], 'DApproval': False, 'fullCountrySourceApproval': False, 'humanApproval': False, 'M7Claim': False},
    'next': 'Author four remaining whole assessments, resolve the observed EN orientation finding, finish actual BE source gaps and separate visuals; independently review affected final pages and then native integrate. Human release remains separate.'
}
receipt = OUT / 'actual-independent-bounded-course-two-orientation-edges-and-three-foreign-V-acceptance.receipt.json'
assert not receipt.exists()
receipt.write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n')
print(json.dumps({'receipt': binding(receipt), 'viewChecks': view_checks, 'wholeReleasedExamBodiesRetained': len(material_checks), 'foreignVisualInputsExact': len(guard), 'openOrientationENFinding': True, 'strictNetGain': 0}, ensure_ascii=False))
