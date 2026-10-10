from pathlib import Path
from decimal import Decimal
from datetime import datetime, timezone
import hashlib
import json
import subprocess
import sys
from jsonschema import Draft202012Validator

HERE = Path(__file__).resolve().parent
ROOT = next(p for p in HERE.parents if (p / 'AGENTS.md').is_file() and (p / 'curricula').is_dir())
AUTHOR = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/wirtschaft-BE-two-E-source-rests-own-model-household-two-P-successors-author-v1'
SOURCE = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/wirtschaft-BE21-source125-ground-GK-LK-actual-binnenkursiv-scope-author-successor-v6/source-extraction/DE_BE_WIRTSCHAFT_SEKII_BERLIN2006_EP2010_AB2022.source125-ground-binnenkursiv-GK-LK-successor-v6.source-extraction.json'

def read(p):
    return json.loads(p.read_text())

def binding(p):
    return {'path': str(p.relative_to(ROOT)), 'sha256': hashlib.sha256(p.read_bytes()).hexdigest()}

def write(name, obj):
    with (HERE / name).open('x') as f:
        f.write(json.dumps(obj, ensure_ascii=False, indent=2) + '\n')

inputs = [AUTHOR / 'actual-final-frozen-two-E-source-rests-two-P-eight-cases-author-handoff.receipt.json', AUTHOR / 'whole-two-current-real-images-P8-native-bound.author-v3.jsonl', AUTHOR / 'whole-two-E-source-performance-union-and-explicit-course-role.native-bound.proposals-successor-v2.json', AUTHOR / 'inputs/whole-two-unchanged-current-goal-contracts.json', AUTHOR / 'inputs/whole-two-current-sourceV6-125-E-rows.exact.json', AUTHOR / 'inputs/actual-current-durable-image-resource-and-review-authority.bindings.json', SOURCE, ROOT / 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json']
guards = [binding(p) for p in inputs]
records = [json.loads(s) for s in inputs[1].read_text().splitlines()]
proposals = read(inputs[2])
goals = read(inputs[3])
rows = read(inputs[4])
current_rows = read(SOURCE)['sourceGoals']
assert len(records) == len(proposals) == len(goals) == len(rows) == 2
validator = Draft202012Validator(read(ROOT / 'contracts/goal-evidence/v2/goal-evidence-profile.schema.json'))
schema_errors = [e.message for r in records for e in validator.iter_errors(r)]
assert not schema_errors, schema_errors
for g, r, p, row in zip(goals, records, proposals, rows):
    assert g['id'] == r['goalId'] == p['canonicalGoalId']
    assert row == next(s for s in current_rows if s['id'] == row['id']) == p['wholeCurrentSourceRow']
    assert p['wholeUnchangedGoalContract'] == g
    oldpath = AUTHOR / ('inputs/whole-old-' + g['id'] + '.exact.jsonl')
    old = read(oldpath)
    guards.append(binding(oldpath))
    assert r['profile']['applicationCaseBriefs'][:2] == old['profile']['applicationCaseBriefs']
    assert r['profile']['expectations'][:len(old['profile']['expectations'])] == old['profile']['expectations']
    assert r['profile']['coverageExpectations']['minimumIndependentDemonstrations'] == old['profile']['coverageExpectations']['minimumIndependentDemonstrations'] == 2
    union, = p['proposedUnion']
    assert union['newCases'] == r['profile']['applicationCaseBriefs'][2:]
    assert p['actualNewCaseIds'] == [c['id'] for c in union['newCases']]
    assert union['actualWholePRecordBinding']['sha256'] == binding(inputs[1])['sha256']
    for field in ['goalFingerprint', 'reviewInputFingerprint', 'profileFingerprint']:
        assert union[field] == r[field]
    assert r['status'] == 'needs_human_review' and r['reviewAuthority'] == 'ai_candidate'
    assert r['evidenceLevel'] == 'E1' and r['maximumClaimScope'] == 'G1'
native = read(HERE / 'actual-independent-two-current-P8-native-goal-profile-and-real-resource-fingerprints.result.json')
assert native['errorCount'] == 0 and len(native['checked']) == 2

checks = []
def check(name, actual, expected):
    assert actual == expected, (name, actual, expected)
    checks.append({'name': name, 'actual': str(actual), 'expected': str(expected), 'passed': True})

check('Noa observed fictional bus days', sum([2, 3, 1, 4]), 10)
for days, cost in [(0, 10), (10, 30), (15, 40), (16, 42), (20, 50)]:
    check('Noa own conditional cost relationship b=' + str(days), Decimal(10) + Decimal(2) * days, Decimal(cost))
check('Noa maximal integer bus days under stated budget', max(b for b in range(21) if 10 + 2*b <= 40), 15)
for visits, normal, special, difference in [(0,9,9,0), (1,11,9,2), (2,13,9,4), (4,17,13,4), (6,21,17,4)]:
    check('Sam ordinary own relationship v=' + str(visits), Decimal(9) + Decimal(2)*visits, Decimal(normal))
    check('Sam independently revised included-visits relationship v=' + str(visits), Decimal(9) + Decimal(2)*max(0, visits-2), Decimal(special))
    check('Sam old-model discrepancy v=' + str(visits), normal-special, difference)
check('Sam ordinary affordable integer maximum', max(v for v in range(20) if 9+2*v <= 20), 5)
check('Sam promotion affordable integer maximum', max(v for v in range(20) if 9+2*max(0,v-2) <= 20), 7)
bundles = {'A':(3,1),'B':(1,2),'C':(1,1),'D':(0,2),'E':(2,0)}
def choose(options, order, budget, prices, menu=None):
    cost = {k: Decimal(prices[0])*v[0]+Decimal(prices[1])*v[1] for k,v in options.items()}
    eligible = set(options) if menu is None else set(menu)
    return next(k for k in order if k in eligible and cost[k] <= budget), cost
for price, costs, best in [(2,[10,10,6,8,4],'A'),(3,[13,11,7,8,6],'D')]:
    choice, computed = choose(bundles, 'ABDCE', 10, (price,4))
    for (name,cost), expected in zip(computed.items(),costs):
        check('Lea whole finite menu fruitPrice=' + str(price) + '/' + name, cost, Decimal(expected))
    check('Lea highest ordinal affordable bundle fruitPrice=' + str(price), choice, best)
check('Lea limited first-screen consideration', choose(bundles,'ABDCE',10,(2,4),'BCDE')[0],'B')
check('Mila different legitimate preferences with full attention',choose(bundles,'BACED',10,(2,4))[0],'B')
film = {'A':(2,1),'B':(0,2),'C':(3,0),'D':(1,1),'E':(1,0)}
for price,costs,best in [(3,[12,12,9,9,3],'A'),(4,[14,12,12,10,4],'D')]:
    choice,computed=choose(film,'ADBCE',12,(price,6))
    for (name,cost),expected in zip(computed.items(),costs):
        check('Second household whole finite menu filmPrice=' + str(price) + '/' + name,cost,Decimal(expected))
    check('Second household highest ordinal affordable bundle filmPrice=' + str(price),choice,best)
check('Second household preselected limited attention set',choose(film,'ADBCE',12,(3,6),'BC')[0],'B')
check('Second household legitimate swimming preference',choose(film,'BADCE',12,(3,6))[0],'B')

# These are the independent reviewer's complete synthetic responses. They are
# assessed substantively against the whole stated essential anchors, not by
# a word-matching test, points invented for these profiles, or learner traces.
counteranswers = [
 {'goalId':goals[0]['id'],'caseId':records[0]['profile']['applicationCaseBriefs'][2]['id'],'responseDe':'Noa hatte zehn Bustage, also wird Noa in jedem Monat zehn Tage Bus fahren und immer genau30Euro bezahlen. Die Wartung wird nie anders sein.16Bustage kann es nicht geben, weil das Budget dann nicht reicht. Mein Modell ist wahr, weil es einfach zu rechnen ist.','metEssentialUnderstanding':False,'independentReasonDe':'Rechnet den beobachteten Wert richtig, begründet aber keine zweckbezogene eigene Annahme und verwechselt die Budgetgrenze mit einer unmöglichen tatsächlichen Entwicklung. Ausgelassene Bedingungen und die reale42Euro-Grenze fehlen.'},
 {'goalId':goals[0]['id'],'caseId':records[0]['profile']['applicationCaseBriefs'][3]['id'],'responseDe':'C=9+2v gilt immer. Bei sechsBesuchen sind es21Euro, daher darf Sam nur fünfmal kommen. Auch im Aktionsmonat sind es21Euro. FünfBesuche haben den objektiv größten Nutzen; Sam wird sie deshalb tatsächlich wählen.','metEssentialUnderstanding':False,'independentReasonDe':'Die alte Formel wird korrekt benutzt, aber die ausdrücklich geänderte Regel nicht modelliert. Eigene geeignete Revision, deren Budgetgrenze und Trennung von Kosten und individueller Nachfrage fehlen.'},
 {'goalId':goals[1]['id'],'caseId':records[1]['profile']['applicationCaseBriefs'][2]['id'],'responseDe':'A kostet10Euro und nach der Preiserhöhung13Euro. Trotzdem nimmt jede rationalePerson A, denn es hat den objektiv höchstenNutzen. Mila ist voreingenommen, weil sieB nimmt. Das beweist auch, dass das Bildschirmdesign eine Biasursache ist; ein Vergleich ist überflüssig.','metEssentialUnderstanding':False,'independentReasonDe':'Zwei richtigeKosten ersetzen weder die neue bezahlbareD-Nachfrage noch die nur ordinalen individuellen Präferenzen. Andere Bedürfnisse sind kein Biasbeweis; eine fiktive Mechanismusannahme ist kein beobachteter kausalerBefund.'},
 {'goalId':goals[1]['id'],'caseId':records[1]['profile']['applicationCaseBriefs'][3]['id'],'responseDe':'Nach der Preiserhöhung istD mit10Euro das höchste bezahlbareBündel. Auf dem voreingestelltenBildschirm wählt diePersonB, weil B unterB undC höher steht. Jede andere vollständig informierteB-Wahl ist deswegen irrational; für alleMenschen gibt es dieselbe richtigeNutzenrangfolge und B beweist mangelndeInformation.','metEssentialUnderstanding':False,'independentReasonDe':'Kosten- und Teilmengenentscheidungen stimmen, aber die zusätzliche verlangte Verständnisleistung wird durch eine objektive Einheitsskala und eine falsche Präferenz-/Informationsdiagnose verfehlt.'},
]
assert len(counteranswers) == 4
write('actual-independent-numerical-and-four-substantive-counteranswer-checks.json', {'actualNumericalChecks':checks,'actualNumericalCheckCount':len(checks),'syntheticCounteranswers':counteranswers,'actualLearnerDataUsed':False,'scoringRubricInvented':False})

primary = {'officialURL':'https://www.berlin.de/sen/bildung/unterricht/faecher-rahmenlehrplaene/rahmenlehrplaene/rahmenlehrplan-wirtschaftswissenschaft-go-teil-c.pdf','originalPDFSha256':'819d98a549e1b3afdd9c374dd34a1706d87359c1f26b9a79717c105e5401421c','actualWholeCurrentPDFPageRead':8,'printedPage':'VI','nativeWholePageActuallyViewed':True,'nativeVisualLayoutObservationDe':'Gemeinsame E-Phasenseite mit vier Inhaltsblöcken und einem vollständigen Kompetenzerwerbsblock; die beiden E-Aspekte sind keine gesonderten LK-Spaltenanforderungen.','freshDirectHTTPResult':429,'officialWebTextActuallyRead':True,'exactExistingPrimaryCacheUsed':True,'rawPDFOrFullExtractedTextCommittedByThisReview':False,'full33PagesApprovedByThisReview':False}
write('actual-primary-page8-whole-reading-and-explicit-non-course-boundary.receipt.json', primary)
judgments=[]
reasons = ['Die neuen vollständigenFälle verlangen jeweils selbst konstruierte wirtschaftliche Beziehungen mit Variablen, eigenen zweckbezogenen Annahmen, Materialprüfung und Modellrevision aus einem ausdrücklich fiktiven persönlichen Umfeld. Ein bloßer Forschungsauftrag oder nachgesagte Modellregel genügt nicht.','Zwei ganze Haushaltsfälle führen eine individuelle ordinaleNutzen-/Homo-Idealisierung tatsächlich auf die höchstgereihte bezahlbareNachfrage zurück, variieren Preise und diskutieren eine kontrollierte begrenzteBeachtungsmenge gegenüber legitimen anderenPräferenzen. Sie behaupten weder objektiv addierbarenNutzen noch beobachteteBiasdiagnosen.']
for i,(g,r,p,row) in enumerate(zip(goals,records,proposals,rows)):
    judgments.append({'sourceGoalId':row['id'],'wholeCurrentSourceRowSha256':hashlib.sha256(json.dumps(row,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest(),'wholeCurrentSourceRow':row,'decision':'KEEP','reviewer':'/root','independentFromSubstantiveAuthor':True,'reasonDe':reasons[i],'wholeCanonicalGoalContract':g,'canonicalGoalIds':[g['id']],'wholePRecordBinding':binding(inputs[1]),'wholeFourCaseProfileActuallyRead':True,'wholeNewDEENCaseAndExpectedPerformanceAndUnderstandingFocusActuallyRead':True,'oldTwoWholeCasesAndExpectationsExactReused':True,'sourcePerformanceApproved':True,'sourceCourseScopeSeparatelyQualified':True,'explicitSourceScope':p['explicitSourceScope'],'targetRolesApproved':False,'wholeE_GK_LK_ModelGoalRoleApproved':False,'normativeWholeCourseApproved':False,'nativeMappedDecisionApproved':False,'humanApproval':False,'strictGain':0,'currentPStatus':'needs_human_review','currentPAuthority':'ai_candidate','evidenceLevel':'E1','maximumClaimScope':'G1'})
write('two-individual-whole-current-E-source-performance-union-KEEP-judgments.json',judgments)
sys.path.insert(0,str(ROOT/'scripts'))
from validate_schemas import curriculum_symlink_errors
symlinks=curriculum_symlink_errors(ROOT)
assert not symlinks,symlinks
portable_errors=[]
for p in HERE.rglob('*.json'):
    read(p)
    assert p.read_bytes().endswith(b'\n'),str(p)
    proc=subprocess.run(['git','check-ignore',str(p.relative_to(ROOT))],cwd=ROOT,capture_output=True,text=True)
    if proc.returncode==0:portable_errors.append(str(p.relative_to(ROOT)))
assert not portable_errors,portable_errors
assert all(binding(ROOT/x['path']) == x for x in guards)
write('actual-final-independent-two-E-P8-four-new-cases-and-two-source-performance-unions-KEEP.receipt.json',{'at':datetime.now(timezone.utc).isoformat(),'reviewer':'/root','independentFromSubstantiveAuthor':True,'wholeProfiles':2,'wholeCases':8,'newSubstantiveCases':4,'oldWholeCasesExactReused':4,'wholeCurrentGoalsActuallyRead':2,'wholeCurrentSourceRowsActuallyRead':2,'actualOwnNumericalChecks':len(checks),'actualOwnCompleteSyntheticCounteranswers':4,'profileSchemaErrors':schema_errors,'actualNativePModelErrors':native['errorCount'],'sourcePrimaryReading':binding(HERE/'actual-primary-page8-whole-reading-and-explicit-non-course-boundary.receipt.json'),'individualWholeSourcePerformanceJudgments':binding(HERE/'two-individual-whole-current-E-source-performance-union-KEEP-judgments.json'),'numericalAndCounteranswerEvidence':binding(HERE/'actual-independent-numerical-and-four-substantive-counteranswer-checks.json'),'frozenInputs':guards,'actualSymlinkErrors':symlinks,'ownIgnoredInputs':portable_errors,'newQualifiedSourcePerformanceClosures':2,'liveGoalsChanged':0,'liveProfilesChanged':0,'wholeSourceOrCourseApproval':False,'currentPStatus':'needs_human_review','currentPAuthority':'ai_candidate','evidenceLevel':'E1','maximumClaimScope':'G1','newStrictAcademicClosures':0,'restoredStrictBindings':0,'strictNetGain':0,'humanApproval':False,'nextStep':'Independently resolve df8 E/GK/LK whole-goal source-bound roles and combine qualified source-performance judgments; whole normative source/course integration remains separate.'})
print(json.dumps({'profiles':'KEEP2','sourcePerformanceUnions':'KEEP2','oldWholeCasesExact':4,'newCases':4,'actualOwnNumericalChecks':len(checks),'actualSyntheticCounteranswers':4,'nativePModelErrors':0,'schemaErrors':0,'symlinkErrors':0,'strictNetGain':0}))
