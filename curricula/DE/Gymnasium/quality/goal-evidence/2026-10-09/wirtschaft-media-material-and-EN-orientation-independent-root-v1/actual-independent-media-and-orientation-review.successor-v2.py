import copy
import hashlib
import json
import re
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[7]
OUT = Path(__file__).resolve().parent
BASE = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/wirtschaft-all-open-route-extension-author-20261009-v1'
V9 = BASE / 'final-thirteen-routes-readable-material-credit-author-successor-v9'
SOURCE = V9 / 'whole-four-final-material-image-bound-three-released-one-DRAFT.inert.candidate.json'
ORI = BASE / 'orientation-EN-only-author-successor-v6'
IMAGE = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/wirtschaft-media-terminal-one-assessment-cartoon-root-author-v1/tariff-domestic-inputs-and-consumer-costs.assessment-material.candidate.png'
FOREIGN = BASE / 'assessment-cartoon-independent-three-size-image-review-v7/actual-independent-native-360-680-assessment-cartoon-KEEP.receipt.json'
MEDIA = '4aa00667-174c-5dc3-a621-c92185ea9830'

def sha(p):
    return hashlib.sha256(p.read_bytes()).hexdigest()

def binding(p):
    return {'path': str(p.relative_to(ROOT)), 'sha256': sha(p)}

assert sha(SOURCE) == '9fe1477f81de6236bfbe54933910b8a482f7848b0a207feb041e62858f0b25fb'
all_four = json.loads(SOURCE.read_text())
goal = next(g for g in all_four if g['id'] == MEDIA)
e = goal['examData']
assert goal['requires'] == e['coveredGoalIds'] == ['7f1d5e9f-65ef-5d1d-83e5-5e2534772720']
assert e['reviewStatus'] == 'draft'
assert sum(s['points'] for s in e['scoring']['steps']) == e['scoring']['maxPoints'] == 24
assert e['scoring']['passingPoints'] == 15
assert sha(IMAGE) == 'b3174f9e21ee7fea3fbfc507e1d92c17f879c8f6b59fabbf674a969f8e62c7b1'
assert sha(FOREIGN) == 'a8d55d4b8824bf82ff20060acdef65ec1eb3cb17583400e8baf0d051f1166364'
for item in json.loads(FOREIGN.read_text())['files']:
    assert sha(ROOT / item['path']) == item['sha256']
assert 'https://github.com/enpasos/skillpilot/blob/main/' not in e['taskContent']
assert 'SHA256' not in e['taskContent'] and 'menschliche Freigabe' not in e['taskContent']
assert 'eigene KI-generierte didaktische Karikatur von SkillPilot, 9. Oktober 2026, CC-BY-4.0' in e['taskContent']
original_quote_lines = [x[2:] for x in e['taskContent'].splitlines() if x.startswith('> ')]
original_word_count = sum(len(re.findall(r'[A-Za-zÄÖÜäöüß]+', x)) for x in original_quote_lines)
assert original_word_count == 22 and original_word_count <= 25
original_whitespace_word_count = sum(len([w for w in x.split() if re.search(r"[A-Za-zÄÖÜäöüß]", w)]) for x in original_quote_lines)
assert original_whitespace_word_count == 21

approved_three_path = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/wirtschaft-three-additional-terminal-materials-independent-root-v1/whole-three-material-reviewed-machine-released.inert.candidate.json'
for prior in json.loads(approved_three_path.read_text()):
    assert prior == next(g for g in all_four if g['id'] == prior['id'])

orientation_file = ORI / 'whole-orientation-goal-before-and-EN-only-after.author.candidate.json'
orientation = json.loads(orientation_file.read_text())
back = copy.deepcopy(orientation['after'])
back['descriptionEn'] = orientation['before']['descriptionEn']
assert back == orientation['before']
assert orientation['after']['semanticKind'] == 'orientation'
impact = json.loads((ORI / 'actual-EN-only-incremental-current311-whole-ownerpage-context-impact.receipt.json').read_text())
before_book = json.loads((ROOT / impact['beforeModel']['path']).read_text())
after_book = json.loads((ROOT / impact['afterModel']['path']).read_text())
assert before_book['pages'] == after_book['pages'] and len(before_book['pages']) == 311

native_file = V9 / 'actual-native-all-thirteen-before-after-global-local-graph-and-type.report.json'
native = json.loads(native_file.read_text())
after = next(x for x in native['results'] if x['label'] == 'allThirteenAuthorCandidate')
before = next(x for x in native['results'] if x['label'] == 'beforeRoot300')
rules = {r['id']: r for r in after['route']['rules']}
for rule in ['CQR-101','CQR-102','CQR-103','CQR-104','CQR-201']:
    assert rules[rule]['status'] == 'pass'
assert rules['CQR-202']['metrics']['weakExamData'] == 1
assert rules['CQR-203']['metrics']['releaseCoverageIncompleteExamData'] == 1
assert rules['CQR-104']['metrics']['projectionLocalRouteChecksEnabled'] == 0
role_checks = []
for actual in after['local']:
    course = actual['courseProfile']
    original = next(x for x in before['local'] if x['courseProfile'] == course)
    assert actual['wholeSelectedTargetCount'] == original['wholeSelectedTargetCount']
    assert actual['wholeVisibleOnlyMissingTerminal'] == []
    v3 = json.loads((BASE / f'eight-a-LK-only-supported-course-successor-v3/national-{course}.bounded-route-author.candidate.view.json').read_text())
    v9 = json.loads((V9 / f'national-{course}.bounded-route-author.candidate.view.json').read_text())
    original_children = v3['rootNodes'][0]['children']
    assert v9['rootNodes'][0]['children'][:len(original_children)] == original_children
    additions = v9['rootNodes'][0]['children'][len(original_children):]
    assert all(x == {'kind': 'goalEntry', 'goalId': x['goalId'], 'projectionRole':'prerequisiteOnly'} for x in additions)
    role_checks.append({'course': course, 'oldTargetCountExact': actual['wholeSelectedTargetCount'], 'oldWholeV3ReferencesExactPrefix': True, 'newExplicitSupportOnly': [x['goalId'] for x in additions], 'localMissingTerminal': []})

negative = [
    {'case': 'misattribution-and-invented-statistics', 'syntheticWholeAnswerDe': '1. Der Text ist ein aktuelles Gesetz von2026 und die Redaktion sagt selbst, dass eine Einigung erreicht wurde; journalistische Zuschreibung braucht man nicht zu prüfen. 2. Die Schranke zeigt, dass alle heimischen Firmen profitieren, die Münzen beweisen eine gemessene Preisänderung von50%. Der leere Stuhl ist eine echte Person. 3. Nachricht und Karikatur sind neutrale wissenschaftliche Beweise, jeder Zoll nützt allen und die Ministerin garantiert das. Andere Gruppen und Daten fehlen nicht.', 'stepPoints': [0,0,0], 'rubricReasonDe': 'Historie, Textsorte/Zuschreibung, sichtbare Objekte, Bildmittel und Evidenzstatus sind falsch. Keine der tatsächlich verlangten Analysen wird durch bloße Materialnamen erfüllt.'},
    {'case': 'observation-without-evidential-limits', 'syntheticWholeAnswerDe': '1. ARD-aktuell berichtet2025 über den Zollstreit. Die zitierte Belastung ist aber automatisch eine bewiesene Meinung der Redaktion; sprachliche Mittel und Zuschreibung sind egal. 2. Ich sehe die Zollschranke, Holzvorprodukte, Stuhl und Münzen sowie den rückkehrenden Pfeil. Eine Schranke kann Vorprodukte und den Konsum belasten; die Münzen beweisen deren genaue Verdopplung. Intention und andere Bildmittel kann man nicht erkennen. 3. Es handelt sich bei beiden um den gleichen neutralen Datennachweis. Ich lehne alle Zölle immer ab; Einwände und weitere Informationen sind unnötig.', 'stepPoints': [2,4,0], 'rubricReasonDe': 'Historischer Nachrichtenrahmen und vier reale Bilddetails mit einem wirtschaftlichen Mechanismus erhalten Punkte. Die geforderten Zuschreibungs-/Sprachmittelanalysen, Intention, Aussagegrenzen und bedingte politische Einordnung fehlen.'},
]
for c in negative:
    c['total'] = sum(c['stepPoints'])
    c['passingPoints'] = 15
    c['actualLearnerData'] = False
    assert c['total'] < 15

released = copy.deepcopy(goal)
released['examData']['reviewStatus'] = 'released'
back = copy.deepcopy(released); back['examData']['reviewStatus'] = 'draft'
assert back == goal
released_path = OUT / 'whole-media-material-reviewed-machine-released.inert.candidate.json'
assert not released_path.exists(); released_path.write_text(json.dumps(released, ensure_ascii=False, indent=2)+'\n')
receipt = {
    'schemaVersion': 1,
    'previousActualCountAssertionFailure': binding(OUT / 'actual-first-quote-count-convention-assertion-failure-preserved.json'),
    'createdAt': datetime.now(timezone.utc).isoformat(),
    'reviewer': '/root',
    'examAndOrientationAuthorReviewed': '/root/economics_independent_continuation_a',
    'reviewRole': 'independent complete media task/solution/rubric/source review and targeted whole bilingual orientation successor',
    'input': binding(SOURCE),
    'wholeMediaGoalActuallyRead': MEDIA,
    'wholeOriginAndActualSupportContractsActuallyRead': ['7f1d5e9f-65ef-5d1d-83e5-5e2534772720','bd9ec397-86ee-58ec-8327-7e1f28550026','26ebbe6e-6512-520d-80a4-2e7e80f29f72'],
    'actualWholePrimaryJournalismRead': {'url':'https://www.tagesschau.de/wirtschaft/reiche-handelsstreit-usa-zoelle-100.html','eventDate':'2025-06-20','sourceTime':'21:55','rootRead':'actual web full article body and byline area on 2026-10-09','originalConservativeLetterGroupCount':original_word_count,'originalWhitespaceWordCount':original_whitespace_word_count,'ownParaphraseIsNotOriginal':True,'present2026TariffRulesClaim':False},
    'actualWholeSourceFindingDe': 'Die tatsächlichen beiden kurzen Stellen attribuieren Dringlichkeit und Belastung der Ministerin. Textsorte, ARD-aktuell und historischer Anlass stimmen; keine individuelle Autorenzeile wird erfunden. Beide verkürzten Stellen bleiben inhaltlich richtig, 21 mit Leerzeichen getrennte Originalwörter bzw22 konservativ gezählte Buchstabengruppen, beide innerhalb der25-Wort-Grenze. Die Aufgabe trennt Original, eigene Kontextparaphrase und eigene Satire. Keine bewiesenen quantitativen Zollfolgen oder vollzogene Einigung aus der Quelle abgeleitet.',
    'actualWholeMaterialAndRubricFindingDe': 'KEEP: reale journalistische Sprach-/Zuschreibungsanalyse, tatsächliche sichtbare Bildmittel/Intention/Aussagegrenzen und bedingte politische Gruppenabwägung werden jeweils konkret mit8BE bewertet. Der vorhandene Hersteller zeigt tatsächlich gemischte Geste/Miene und leeres Regal. Die Karikatur ersetzt weder Statistik noch neutralen Originalartikel. Alternative materialgebundene Interpretationen/Urteile sind gleichwertig. Sichtbare-Element-Punkte verlangen die tatsächliche PNG und dürfen nicht aus einem fehlenden oder anderen Bild entstehen.',
    'resolvedMaterialMetadataFinding': {'decision':'resolved KEEP','technicalSHAAndQASizeOrHumanStatusRemovedFromStudentTask':True,'unpublishedMainProvenanceLinkRemoved':True,'ownAICreditAndCCBYLicenseRetained':True,'wholeOtherThreeReleasedMaterialsExact':True,'taskSolutionRubricChangedForThisTechnicalFinding':False},
    'assessmentImageIndependence': {'rootImageAuthor':True,'foreignImageReviewer':'/root/economics_independent_continuation_a','foreignReviewerIsExamAuthor':True,'foreignScope':'exact assessment PNG native/360/680 and provenance only; not self-exam review','foreignReceipt':binding(FOREIGN),'asset':binding(IMAGE),'rootActualNative360680AuthorViews':True,'rootSelfImageApprovalClaim':False,'ordinaryGoalVisualizationVClaim':False},
    'twoActuallyAuthoredAndRubricScoredSyntheticFaultySubmissions': negative,
    'syntheticScoringLimit': 'Two concrete author-created faulty submissions only, not real learner behavior or exhaustive/runtime acceptance.',
    'orientationFindingResolution': {'wholeCandidate':binding(orientation_file),'goalId':orientation['after']['id'],'onlyField':'descriptionEn','wholeBeforeAndAfterActuallyRead':True,'allOtherFieldsExact':True,'decision':'KEEP resolved','reasonDe':'Die englische Fassung zeigt nun wie die unveränderte deutsche positive Möglichkeiten und Interesse/Weiterlernen, ohne Vorwissen, Erklärungstest oder fachliche Leistung zu verlangen. semanticKind orientation und eigenständige Abschlusspersistenz bleiben unverändert.','actual311WholeOwnerPagesExact':True,'incrementalOwnerOrPageContextCount':0,'wholeModelSourceAndDigestChangeAcknowledged':True,'runtimeOrHumanAcceptanceClaim':False},
    'boundedAdditionalSupportRoles':role_checks,
    'supportRoleScope': 'Exactly declared prerequisiteOnly ancestry supports the new supplementary assessments. No previous curricular targets removed or new source coverage inferred; this is not learner-flow acceptance or a replacement for country-source coverage.',
    'actualNativeBeforeMediaRelease':{'report':binding(native_file),'globalMissingMotivation':0,'globalMissingTerminal':0,'localGKandLKMissingTerminal':0,'37RegisteredExams36ReleasedOneMediaDraft':True,'CQR202':'fail one genuine DRAFT','CQR203':'warn one genuine DRAFT','CQR104ScopeLimit':'projectionLocalRouteChecksEnabled=0; separately actual native course-filtered proof used'},
    'machineMaterialRelease': {'candidate':binding(released_path),'onlyDelta':'one complete examData.reviewStatus draft to released','meaning':'machine curriculum-content material release only, independent of D rounds, human release, publication, learner mastery and real-host acceptance'},
    'strictProgress':{'currentComplete':300,'currentDenominator':311,'newFachlicheClosures':0,'restoredLiveBindings':0,'netGain':0},
    'truthfulness':{'liveWrites':[],'DApproval':False,'fullCountrySourceApproval':False,'humanApproval':False,'M7Claim':False},
    'next':'Create final inert native37-material/403-frame with all thirteen accepted bodies. Embed current native P11 and genuinely review the46 affected curricular ownerpages in two independent rounds. Correct actual BE source/course defects separately before M7 completion.'
}
p=OUT/'actual-independent-whole-media-source-rubric-release-and-EN-orientation-finding-resolution.receipt.json'
assert not p.exists();p.write_text(json.dumps(receipt,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'receipt':binding(p),'releasedMedia':binding(released_path),'originalSourceQuoteWords':original_word_count,'orientationResolved':True,'existingTargetCountsRetained':[x['oldTargetCountExact'] for x in role_checks],'strictNetGain':0},ensure_ascii=False))
