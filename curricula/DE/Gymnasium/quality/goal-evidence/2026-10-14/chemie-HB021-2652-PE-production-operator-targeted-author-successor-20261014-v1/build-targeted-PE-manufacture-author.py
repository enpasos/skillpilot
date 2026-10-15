"""CC-BY-4.0 content authoring with a small Apache-2.0 reproducibility helper.

This is an author successor based on this agent's sealed HB021 finding. It is
not an independent review, a learner execution or an operative P replacement.
"""
import copy
import hashlib
import json
from pathlib import Path

REPO = Path('/home/enpasos/projects/skillpilot')
OWN = Path(__file__).resolve().parent
E = REPO / 'curricula/DE/Gymnasium/quality/goal-evidence'
TARGET = '2652caef-b557-58b9-9b28-70db62625ce5'
REVIEW_ID = 'chemie-hb021-2652-pe-production-operator-author-candidate-20261014-v1'
AUTHOR_AT = '2026-10-14T00:12:18Z'
T = E / '2026-10-14/chemie-current407-corrected-P8-targeted-native4-technical-20261014-v1'
CASE_SOURCE = E / '2026-10-13/chemie-poly18-aro19-final-case-profile-binding-author-20261013-v1/positive/whole74.exact-bilingual-cases.author.json'
C402_CONFIG = E / '2026-10-13/chemie-current402-native47-finite-slice-technical-20261013-v1/configs/P34-group-1.existing-exact.config.json'
C402_RECORDS = C402_CONFIG.parent.parent / 'positive/P34-group-1.existing-exact.jsonl'
T407_RECORDS = E / '2026-10-13/chemie-accepted-successors-current403-normal-composition-author-root-20261013-v1/positive/current-valid-retained-2.unchanged.jsonl'
LANDSCAPE = T / 'candidate/canonical533.current407.corrected-P8-resources.inactive.json'
LEDGER = T / 'candidate/semantic533.current407.corrected-P8.inactive.json'
CRITERIA = E / 'prompts/chemistry-positive-understanding-evidence-profile-criteria-v1.md'
B = E / '2026-10-14/chemie-HB19-neighbor021-original-operator-source-cell-independent-b-20261014-v1'

def read(path):
    return json.loads(path.read_text())

def rel(path):
    return str(path.relative_to(REPO))

def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def write(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')

def exact_line(path):
    for i, raw in enumerate(path.read_bytes().splitlines(keepends=True), 1):
        value = json.loads(raw)
        if value['goalId'] == TARGET:
            return i, raw, value
    raise AssertionError('missing actual configured record')

line402, raw402, old_record = exact_line(C402_RECORDS)
line407, raw407, retained_record = exact_line(T407_RECORDS)
assert old_record == retained_record
assert TARGET in read(C402_CONFIG)['scope']['goalIds']
assert rel(T407_RECORDS) in read(T / 'configs/whole407.corrected-P8.inactive.config.json')['evidenceReviewPaths']
whole_before = read(CASE_SOURCE)
before = [c for c in whole_before['cases'] if c['goalId'] == TARGET]
assert len(before) == 2
assert before[0]['caseId'] == '2652caef-case-1'
assert before[1]['caseId'] == '2652caef-case-2'
goal = next(g for g in read(LANDSCAPE)['goals'] if g['id'] == TARGET)
active_goal = next(g for g in read(REPO / 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json')['goals'] if g['id'] == TARGET)
assert goal == active_goal

write(OWN / 'INPUT.exact-402-and-T407-existing-positive-record-comparison.actual.json', {
    'schemaVersion': 1, 'actualComparedAt': AUTHOR_AT, 'goalId': TARGET,
    'current402': {'config': rel(C402_CONFIG), 'records': rel(C402_RECORDS), 'lineNumber': line402, 'includedInConfiguredScope': True, 'fullRecordLineSha256': hashlib.sha256(raw402).hexdigest()},
    'T407': {'bookConfig': rel(T / 'configs/whole407.corrected-P8.inactive.config.json'), 'records': rel(T407_RECORDS), 'lineNumber': line407, 'directConfiguredEvidenceOwner': True, 'fullRecordLineSha256': hashlib.sha256(raw407).hexdigest()},
    'wholeRecordsObjectEqual': old_record == retained_record,
    'wholeRecordBytesEqual': raw402 == raw407,
    'currentActiveAndT407WholeGoalObjectsEqual': goal == active_goal,
    'existingEvidenceLevel': old_record['evidenceLevel'], 'existingMaximumClaimScope': old_record['maximumClaimScope'],
    'existingGoalFingerprint': old_record['goalFingerprint'], 'existingReviewInputFingerprint': old_record['reviewInputFingerprint'], 'existingProfileFingerprint': old_record['profileFingerprint'],
    'action': 'Preserve both existing operative input records and their original evidence claims unchanged. Prepare a separate unexecuted E0/G0 successor candidate only; no automatic supersession or invalidation of prior positive evidence.',
    'measurementCorrection': 'Actual scope.goalIds and actual record ownership were read. An earlier technical integration search that inspected scope.leafGoalIds did not establish absence of this existing configured positive owner.'
})
(OWN / 'inputs').mkdir(exist_ok=True)
(OWN / 'inputs/2652.previous-whole-positive-record.byte-exact.jsonl').write_bytes(raw402)
write(OWN / 'inputs/2652.whole-current-goal.exact.json', goal)
write(OWN / 'inputs/2652.two-full-cases.before.exact.json', before)

task_de = 'Erläutere zusätzlich auf Teilchen- und Bindungsebene die Herstellung des ausgewählten Polyethens aus Ethen: Wie werden viele Ethenmoleküle zu einer Kette verknüpft, was geschieht mit C=C, wie heißt die Reaktionsart und werden kleine Moleküle abgespalten?'
task_en = 'Additionally explain, at particle and bond level, how the selected polyethene is made from ethene: how are many ethene molecules linked into a chain, what happens to C=C, what is the reaction type called, and are small molecules eliminated?'
answer_de = 'Bei der Herstellung von PE werden viele Ethenmoleküle durch Polymerisation zu langen Ketten verknüpft. Der π-Anteil der C=C-Doppelbindungen wird umgesetzt; zwischen den Bausteinen entstehen neue C–C-Einfachbindungen, und die ursprünglichen C=C-Bindungen liegen im Kettenrückgrat als C–C-Einfachbindungen vor. So entsteht das bereits abgeleitete Repetiermotiv –CH₂–CH₂–. Diese Verknüpfung ist eine Polymerisation ohne Abspaltung kleiner Moleküle; insbesondere wird dabei kein Wasser abgespalten.'
answer_en = 'In making PE, many ethene molecules are linked into long chains by polymerisation. The π component of the C=C double bonds reacts; new C–C single bonds form between the units, while the original C=C bonds become C–C single bonds in the backbone. This produces the already derived –CH₂–CH₂– repeat motif. This linking is polymerisation without elimination of small molecules; in particular, no water is eliminated.'
criterion_de = 'Erläutert die ausgewählte PE-Herstellung aus vielen Ethenmolekülen: Umsetzung des π-Anteils von C=C zu C–C-Einfachbindungen im Rückgrat und neue C–C-Verknüpfungen zwischen Bausteinen; Polymerisation; keine Abspaltung kleiner Moleküle.'
criterion_en = 'Explains the selected manufacture of PE from many ethene molecules: reaction of the π component of C=C to give C–C single bonds in the backbone and new C–C links between units; polymerisation; no elimination of small molecules.'
new_rubric = {
    'expectationId': 'e1', 'maximumPoints': 2,
    'criterionDe': criterion_de, 'criterionEn': criterion_en,
    'fullCreditDe': '2 Punkte: erläutert zusammenhängend alle vier Beziehungen: viele Ethenmoleküle werden verknüpft; C=C wird unter Umsetzung des π-Anteils zur C–C-Einfachbindung im Rückgrat und neue C–C-Bindungen verbinden Bausteine; die Reaktion heißt Polymerisation; keine kleinen Moleküle werden abgespalten. Gleichwertige korrekte Formulierungen zur Öffnung der Doppelbindung genügen; π-Terminologie ist nicht zwingend.',
    'fullCreditEn': '2 points: coherently explains all four relationships: many ethene molecules are linked; reaction of the π component converts C=C to a C–C single bond in the backbone and new C–C bonds connect units; the reaction is called polymerisation; no small molecules are eliminated. Equivalent correct descriptions of double-bond opening suffice; π terminology is not mandatory.',
    'partialCreditDe': '1 Punkt: eine fachlich richtige Verknüpfung vieler Ethenbausteine unter Öffnung der Doppelbindung und Bildung der C–C-Kette wird erklärt, aber der Name Polymerisation oder die Aussage zur fehlenden Abspaltung kleiner Moleküle fehlt. Eine bloße Benennung oder abgeschriebene Repetiereinheit genügt nicht.',
    'partialCreditEn': '1 point: correctly explains the linking of many ethene units by opening the double bond and forming the C–C chain, but omits the name polymerisation or the absence of small-molecule elimination. A bare reaction name or copied repeat unit is insufficient.',
    'zeroCreditDe': '0 Punkte: keine Erklärung der chemischen Kettenbildung, nur Repetiermotiv oder Reaktionsname, oder eine widersprüchliche Erklärung wie Wasserabspaltung bei dieser PE-Herstellung bzw. vollständige Trennung der beiden C-Atome jedes Ethenmoleküls.',
    'zeroCreditEn': '0 points: no explanation of chemical chain formation, only a repeat motif or reaction name, or a contradictory explanation such as water elimination in this PE manufacture or complete separation of the two carbon atoms of each ethene molecule.'
}
after = copy.deepcopy(before)
case1 = after[0]
case1['taskDe'] += ' ' + task_de
case1['taskEn'] += ' ' + task_en
case1['modelAnswerDe'] += ' ' + answer_de
case1['modelAnswerEn'] += ' ' + answer_en
case1['rubric'].append(new_rubric)
case1['maximumPoints'] = 8
case1['gradingBoundary'] = case1['gradingBoundary'].replace('Six points alone', 'Eight points alone')
assert case1['rubric'][:3] == before[0]['rubric']
assert case1['dataDe'] == before[0]['dataDe'] and case1['dataEn'] == before[0]['dataEn']
assert after[1] == before[1]
write(OWN / 'candidate/2652.two-full-cases.PE-production-addition.author-only.json', after)
whole_after = copy.deepcopy(whole_before)
whole_after['cases'] = [case1 if c['caseId'] == case1['caseId'] else c for c in whole_after['cases']]
write(OWN / 'candidate/whole74.exact-bilingual-cases.PE-production-addition.author-only.json', whole_after)

profile = copy.deepcopy(old_record['profile'])
profile['expectations'][0]['observablePerformanceDe'] += ' Erläutert außerdem die Herstellung von PE durch Polymerisation aus Ethen mit Doppelbindungsöffnung, C–C-Kettenbildung und ohne Abspaltung kleiner Moleküle.'
profile['expectations'][0]['observablePerformanceEn'] += ' Also explains manufacture of PE by polymerisation from ethene, with double-bond opening, C–C chain formation and no elimination of small molecules.'
brief = profile['applicationCaseBriefs'][0]
brief['taskDemandDe'], brief['taskDemandEn'] = case1['taskDe'], case1['taskEn']
brief['expectedPerformanceDe'], brief['expectedPerformanceEn'] = case1['modelAnswerDe'], case1['modelAnswerEn']
old_tail_de = ' Die Verknüpfung zu Erwartungs-IDs behauptet keine vollständige Erfüllung jeder Gesamtprofilerwartung in diesem Einzelfall.'
old_tail_en = ' Links to expectation IDs do not assert complete fulfilment of every whole-profile expectation in this one case.'
assert brief['understandingFocusDe'].endswith(old_tail_de) and brief['understandingFocusEn'].endswith(old_tail_en)
brief['understandingFocusDe'] = brief['understandingFocusDe'][:-len(old_tail_de)] + ' / ' + criterion_de + old_tail_de
brief['understandingFocusEn'] = brief['understandingFocusEn'][:-len(old_tail_en)] + ' / ' + criterion_en + old_tail_en
assert profile['applicationCaseBriefs'][1] == old_record['profile']['applicationCaseBriefs'][1]
spec = {
    'schemaVersion': 1, 'authoringContract': 'positive-understanding-evidence-candidates-v1',
    'reviewId': REVIEW_ID, 'reviewedAt': AUTHOR_AT,
    'reviewer': 'Codex author /root/chemie_native8_fresh_independent_b; same author as preceding sealed HB021 source-B finding; no new independent vote',
    'goals': [{
        'goalId': TARGET,
        'reason': 'Unexecuted author-only successor: add an explicitly graded PE-from-ethene manufacture explanation to the complete existing PE/PA case, preserve all original case demands/data/rubrics and the full second case. Based on the same agent’s sealed HB021 source finding. E0/G0 only; no learner execution, new independent review, active supersession, whole-source approval or human approval.',
        'evidenceLevel': 'E0', 'maximumClaimScope': 'G0',
        'dissent': ['Whole HB021 manufacture duty remains HOLD until two independent targeted checks and regular integration. Existing source partners remain partial; no whole2652 grant from the source bullet.'],
        'profile': profile
    }]
}
write(OWN / 'positive/2652.PE-production-addition.author-candidate-spec.json', spec)
config = read(C402_CONFIG)
config.update({
    'reviewId': REVIEW_ID, 'landscapePath': rel(LANDSCAPE), 'semanticKindLedgerPath': rel(LEDGER),
    'reviewPath': rel(OWN / 'positive/2652.PE-production-addition.E0-G0.ai-candidate.needs-human-review.jsonl'),
    'scope': {'label': 'One unexecuted targeted PE manufacture addition, whole2652 retained; no operative replacement', 'goalIds': [TARGET]}
})
write(OWN / 'configs/2652.targeted-PE-production.E0-G0.inactive.config.json', config)

def changes(old, new, prefix=''):
    if type(old) is not type(new): return [prefix]
    if isinstance(old, dict):
        result = []
        for key in sorted(set(old) | set(new)):
            name = f'{prefix}/{key}'
            result.extend([name] if key not in old or key not in new else changes(old[key], new[key], name))
        return result
    if isinstance(old, list):
        result = [f'{prefix}/length'] if len(old) != len(new) else []
        for i, (left, right) in enumerate(zip(old, new)): result.extend(changes(left, right, f'{prefix}/{i}'))
        if len(new) > len(old): result.extend(f'{prefix}/{i}' for i in range(len(old), len(new)))
        return result
    return [] if old == new else [prefix]

write(OWN / 'CAS.exact-one-case-PE-manufacture-and-unreviewed-profile-addition.author-only.json', {
    'schemaVersion': 1, 'authorOnly': True, 'license': 'CC-BY-4.0', 'goalId': TARGET,
    'authorBasis': {'priorRole': 'same-agent independent source-B reviewer', 'newRole': 'author', 'independentVoteProduced': False,
        'scientificFindingPath': rel(B / 'SCIENCE.HB021-literal-partial-partner-and-whole-duty.independent-b.actual.json'),
        'scientificSealPath': rel(B / 'SEAL.scientific-HB021-independent-b.before-any-peer-judgment.json'),
        'finiteSealPath': rel(B / 'SEAL.finite-HB021-independent-b-source-review.actual.json')},
    'sourceDutyId': 'hb-chemistry-sekii-gyo2022-3-2-e-kunststoffe-021-1788da45',
    'sourceLiteral': 'erläutern die Herstellung ausgewählter Kunststoffe',
    'sourceBoundary': 'Common E-phase duty; selected PE chemical linking explanation only. No industrial plant, practical manufacture, advanced LK chain mechanism or whole2652 property/use breadth inferred.',
    'beforeFullCase1': before[0], 'afterFullCase1': case1,
    'changedCase1JsonPointers': changes(before[0], case1),
    'beforeWholeProfile': old_record['profile'], 'afterWholeProfile': profile,
    'changedProfileJsonPointers': changes(old_record['profile'], profile),
    'preservation': {'wholeGoalUnchanged': True, 'oldThreeRubricsAndTheirSixPointsUnchanged': True,
        'allOriginalTaskAndModelTextPreservedAsPrefixes': True, 'dataAndMaterialStructuresUnchanged': True,
        'secondFullCaseUnchanged': True, 'other73FullCasesUnchanged': True,
        'e2e3CoverageVariationTransferAndIndependentDemonstrationRulesUnchanged': True,
        'original402T407FullPositiveRecordsUnchanged': True},
    'grading': {'oldMaximumPoints': 6, 'newMaximumPoints': 8, 'newRubricPoints': 2,
        'newRubricExpectationId': 'e1', 'fullCreditRequiresAllFourProductionRelations': True,
        'repeatUnitAloneCannotEarnProductionPoints': True,
        'noNewTaskQuota': True, 'pointsAreNotMasteryOrIndependentScientificAcceptance': True},
    'authority': {'candidateEvidenceLevel': 'E0', 'candidateMaximumClaimScope': 'G0',
        'reviewAuthority': 'ai_candidate', 'status': 'needs_human_review',
        'newIndependentVotes': 0, 'newLearnerOrLaboratoryExecutions': 0,
        'operativeSupersession': False, 'sourceDuty021Closure': 'HOLD',
        'requiredNext': ['two independent targeted scientific checks', 'regular bounded P/source integration'],
        'D_AM_V_Human_releaseClosureClaim': False}
})

input_paths = [CASE_SOURCE, C402_CONFIG, C402_RECORDS, T407_RECORDS,
    T / 'configs/whole407.corrected-P8.inactive.config.json', LANDSCAPE, LEDGER, CRITERIA,
    REPO / 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json',
    B / 'SCIENCE.HB021-literal-partial-partner-and-whole-duty.independent-b.actual.json',
    B / 'SEAL.scientific-HB021-independent-b.before-any-peer-judgment.json',
    B / 'SEAL.finite-HB021-independent-b-source-review.actual.json',
    B / 'inputs/HB89.whole-after.exact.json',
    B / 'INPUT.exact-four-complete-current-partner-goals.actual.json',
    B / 'PRIMARY.actual-four-whole-page-captures.json',
    *[B / f'primary/HB.physical{page}.full-layout.txt' for page in [15,18,19,20]],
    REPO / 'curricula/DE/Gymnasium/input/HB/GyO_Chemie_2022.pdf',
    REPO / 'app/scripts/materializePositiveGoalEvidenceCandidates.ts',
    REPO / 'app/scripts/positiveGoalEvidenceProfileModel.ts', REPO / 'app/scripts/positiveGoalEvidenceReview.ts',
    REPO / 'contracts/goal-evidence/v2/goal-evidence-profile.schema.json',
    REPO / 'contracts/goal-evidence/v2/goal-evidence-review-config.schema.json']
write(OWN / 'INPUTS.exact-full-case-source-current-profile-and-author-basis-bindings.json', {
    'schemaVersion': 1, 'selectedAt': AUTHOR_AT,
    'bindings': [{'path': rel(p), 'sha256': digest(p), 'bytes': p.stat().st_size} for p in input_paths],
    'targetedWholeCasesProfilesAndCurrentGoalRead': True,
    'otherWholeCasesComparedForPreservationOnly': True,
    'independence': 'No new independent review. Same-agent prior source-B finding is transparently used as author basis.',
    'newProfileClaim': 'E0/G0 unexecuted candidate; no active replacement; source021 HOLD'
})
print(json.dumps({'wholeCases': len(whole_after['cases']), 'unchangedOtherCases': sum(c == n for c,n in zip(whole_before['cases'], whole_after['cases'])), 'newRubricRows': len(case1['rubric']), 'newMax': case1['maximumPoints'], 'recordObjectEquality': old_record == retained_record, 'recordByteEquality': raw402 == raw407, 'caseChangedPointers': changes(before[0],case1), 'profileChangedPointers': changes(old_record['profile'],profile)}))
