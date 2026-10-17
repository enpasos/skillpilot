#!/usr/bin/env python3
"""Serialize this reviewer's already frozen finite P/source scientific opinion."""
import datetime
import hashlib
import json
from pathlib import Path

OUT = Path(__file__).resolve().parent
GUARD = OUT / 'INPUT-GUARDS.before-science.json'
FIRST = OUT / 'FIRST.SN-P1-source66.informed-B.scientific.frozen.md'
FIRST_SHA = 'dee4c7789ed154ba40c4a29b27b1a7b62cdc277a2da2b758d5182a31a6f98c9c'
RUN_ID = 'chemie-current439-SN-P1-source66-informed-independent-b-20261017-v1'


def sha(raw):
    return hashlib.sha256(raw).hexdigest()


def pin(path):
    path = Path(path)
    raw = path.read_bytes()
    return {'path': str(path), 'sha256': sha(raw), 'bytes': len(raw)}


def objsha(value):
    return sha(json.dumps(value, ensure_ascii=False, sort_keys=True,
                          separators=(',', ':')).encode())


def write(name, value):
    path = OUT / name
    assert not path.exists(), name
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')
    return pin(path)


assert pin(FIRST)['sha256'] == FIRST_SHA
guards = json.loads(GUARD.read_text())['pins']
assert len(guards) == 24
for item in guards:
    assert pin(item['path']) == item

pselector = json.loads(Path(guards[0]['path']).read_text())
sselector = json.loads(Path(guards[1]['path']).read_text())
root = Path(guards[0]['path']).parent
p_row = json.loads(Path(pselector['currentP1']['path']).read_text())
profile = json.loads((root / 'science/candidate/P1.successor.whole-profile.body.json').read_text())
assert p_row['profile'] == profile
cases = [json.loads((root / f'science/candidate/CASE-{i}.complete.operative.json').read_text())
         for i in [1, 2]]
assert [c['case'] for c in cases] == profile['applicationCaseBriefs']
blank = json.loads((root / 'science/candidate/RAW-OBSERVATIONS.unperformed.template.json').read_text())
assert blank['actualPerformanceEstablished'] is False
assert all(v is None for k, v in blank.items()
           if k not in ['kind', 'actualPerformanceEstablished'])
goal = json.loads((root / 'science/archive/current-goal.whole.exact-structure.json').read_text())
canonical = json.loads(Path(pselector['currentCanonical']['path']).read_text())
canonical_goals = {g['id']: g for g in canonical['goals']}
assert goal == canonical_goals[goal['id']]
prior_ids = [
    '1351706f-4ea6-56e9-951b-87b24cbcdee8',
    '416dfd33-8b43-5c49-903c-9847b95e4208',
    '13d4f336-ab16-54a7-9479-c920b458f385',
]
source = json.loads(Path(sselector['candidate']['path']).read_text())
old = json.loads(Path(sselector['previousWholeSource']['path']).read_text())
assert len(source['sourceGoals']) == len(old['sourceGoals']) == 176
assert len(source['passages']) == len(old['passages']) == 28
changed_rows = [i for i, (a, b) in enumerate(zip(source['sourceGoals'], old['sourceGoals'])) if a != b]
assert changed_rows == [66]
source_row = source['sourceGoals'][66]
previous_row = old['sourceGoals'][66]
passage_idx = next(i for i, p in enumerate(source['passages']) if p['id'] == source_row['passageId'])
passage = source['passages'][passage_idx]
previous_passage = old['passages'][passage_idx]
assert [i for i, (a, b) in enumerate(zip(source['passages'], old['passages'])) if a != b] == [passage_idx]
assert all(a['text'] == b['text'] for a, b in zip(source['passages'], old['passages']))
passage_without_qualification = json.loads(json.dumps(passage))
del passage_without_qualification['metadata']['currentSourceCellQualification']
assert passage_without_qualification == previous_passage
assert {k: v for k, v in source.items() if k not in ['sourceGoals', 'passages']} == {
    k: v for k, v in old.items() if k not in ['sourceGoals', 'passages']}
assert all(source_row[k] == previous_row[k] for k in [
    'id', 'passageId', 'topicCode', 'bulletIndex', 'aspectIndex',
    'courseLevel', 'granularity', 'tags', 'rawSourceText', 'rawSourceSpan', 'rawParentBulletText'])

first_pin = pin(FIRST)
now = datetime.datetime.now(datetime.timezone.utc).isoformat()
common = {
    'runId': RUN_ID,
    'reviewMode': 'independent-informed-scientific-followup',
    'reviewerRole': 'B',
    'frozenScientificFirst': first_pin,
    'reviewAuthority': 'ai_candidate',
    'evidenceLevel': 'E1',
    'maximumClaimScope': 'G1',
    'humanApproval': False,
    'actualLearnerPerformanceEstablished': False,
    'schoolSafetyOrPracticalReleaseGranted': False,
    'nativeBlindDReviewClaimed': False,
}
p_record = {
    **common,
    'recordKind': 'bounded-whole-P1-scientific-opinion',
    'verdict': 'accepted',
    'recommendation': 'KEEP_PROFILE_EXACT',
    'acceptedScope': 'Prospective whole profile plus both complete operative cases, defined material specification, blank raw template and rubric',
    'goalId': goal['id'],
    'landscapeId': p_row['landscapeId'],
    'currentPRow': pselector['currentP1'],
    'declaredCurrentBindings': {k: p_row[k] for k in [
        'reviewId', 'goalFingerprint', 'reviewInputFingerprint', 'profileFingerprint',
        'goalFingerprintRuleVersion', 'profileRuleVersion', 'reviewCriteriaFingerprint']},
    'currentProfileScientificObjectSha256': objsha(profile),
    'currentGoalObjectSha256': objsha(goal),
    'wholeProfileExactInCurrentPRow': True,
    'completeCompanionCasesExactInProfile': True,
    'cases': [
        {'id': c['case']['id'], 'scientificObjectSha256': objsha(c['case']),
         'path': str(root / f'science/candidate/CASE-{i}.complete.operative.json'),
         'verdict': 'accepted-prospective-experiment-contract'}
        for i, c in enumerate(cases, 1)
    ],
    'positiveEvidence': [
        'Personally attributable supervised sampling, indicator application and chart use are required in both cases.',
        'Own raw colours/patterns, product and preparation identity, conditions and known control precede interpretation and answer-key reveal.',
        'New 90201 paper/product-specific chart and application method plus fresh citric acid material require genuine fresh practical transfer.',
        'Exact defined products and teacher-only final-volume preparations replace unspecified household mixtures; current original charts and stock preflight are explicit pre-use requirements.',
        'Coarse pH regions and approximately neutral classification are limited by actual chart match; ambiguous results remain unresolved.',
        'Blank raw template and rubric do not fabricate actual performance or allow supplied/model colours to count as own observations.',
    ],
    'priorCompetencyScopeObservation': {
        'wholeCurrentGoalIdsRead': prior_ids,
        'learnerPreparesSolidStockSolutionsInTheseCases': False,
        'wholeBroaderPreparationCompetenceProvenNecessaryByThisP': False,
        'routineHandlingComponentsDoNotProveNeedForWholeBroaderLabGoalMastery': True,
        'prerequisiteGraphVerdict': 'NOT_REVIEWED',
    },
    'executionRequirementsStillUnproven': [
        'Actual school stock/lot, original matching chart/instructions, expiry/storage and preparation identity.',
        'Actual relevant supplier safety information, school risk assessment, teacher release and stock preflight.',
        'Actual supervised personal learner actions and contemporaneous own observations/control.',
    ],
    'substantiveAuthoringRevisionFindings': [],
    'humanTrialRequiredForThisMachineScientificOpinion': False,
    'nativeDPageContextBinding': 'NOT_REVIEWED',
    'currentSourceCanonicalBinding': 'OPEN',
    'wholeSourceUnion': 'OPEN',
    'globalM7': 'OPEN',
    'currentPRecordMutated': False,
}
s_record = {
    **common,
    'recordKind': 'bounded-source66-left-right-SE-fidelity-opinion',
    'verdict': 'accepted',
    'sourceGoalIndex': 66,
    'sourceGoalId': source_row['id'],
    'passageId': source_row['passageId'],
    'currentWholeSourceCandidate': sselector['candidate'],
    'originalPrimary': sselector['originalPrimary'],
    'originalPrimaryPhysicalPagesViewed': [4, 14, 24],
    'originalPrintedPages': ['IV', '2', '12'],
    'currentSourceRowScientificObjectSha256': objsha(source_row),
    'currentPassageScientificObjectSha256': objsha(passage),
    'wholeCurrentSourceRow': source_row,
    'wholeCurrentAffectedPassage': passage,
    'positiveEvidence': [
        'Original binding left-column introduction and indented experimental indicator investigation are retained separately with faithful objects/operators.',
        'Right-column classifications, behavioural examples, acid rain and cross-curricular references retain guidance/reference status without new universal mandatory topics.',
        'SE refers to pupil experiments; it does not make the separately binding left experimental operator optional.',
        'Unchanged legacy merged passage/raw fields retain historical nonverbatim status; explicit new qualification points to current separated source fragments.',
    ],
    'otherSourceRowsExactUnchanged': 175,
    'allPassageTextValuesExactUnchanged': 28,
    'otherWholePassagesExactUnchanged': 27,
    'otherTopLevelSourceComponentsExactUnchanged': True,
    'substantiveSourceCellRevisionFindings': [],
    'wholeEverydayIntroductionCoveredByIndicatorPAlone': False,
    'currentSourceCanonicalBinding': 'OPEN',
    'wholeSourceUnion': 'OPEN',
    'globalM7': 'OPEN',
    'sourceActivated': False,
}
proof = {
    'kind': 'bounded-input-equality-and-scope-proof',
    'frozenScientificFirst': first_pin,
    'inputCanonical': pselector['currentCanonical'],
    'currentPRow': pselector['currentP1'],
    'wholeCurrentPProfileEqualsScientificCompanion': True,
    'bothWholeCaseBodiesEqualCurrentPProfileCases': True,
    'rawTemplateAllPerformanceFieldsBlankAndAttainmentFalse': True,
    'wholeCurrentGoalEqualsFrozenCanonicalGoal': True,
    'wholePriorGoalBodiesRead': [{
        'id': g, 'scientificObjectSha256': objsha(canonical_goals[g]),
        'wholeGoal': canonical_goals[g]} for g in prior_ids],
    'sourceCurrent': sselector['candidate'],
    'sourcePrevious': sselector['previousWholeSource'],
    'sourceChangedRowIndices': changed_rows,
    'sourceChangedRowFields': sorted(k for k in set(source_row) | set(previous_row)
                                    if source_row.get(k) != previous_row.get(k)),
    'sourceOther175Rows': [{'index': i, 'id': a['id'],
                           'currentObjectSha256': objsha(a), 'previousObjectSha256': objsha(b),
                           'valueExact': a == b}
                          for i, (a, b) in enumerate(zip(source['sourceGoals'], old['sourceGoals'])) if i != 66],
    'selectedSourceRawFieldsIdentityAndQualifiersExact': True,
    'affectedPassageIndex': passage_idx,
    'onlyAffectedPassageChange': 'metadata.currentSourceCellQualification added',
    'all28PassageTextValuesExact': True,
    'other27WholePassageObjectsExact': True,
    'otherAllTopLevelSourceComponentsExact': True,
    'nativeDPreparedInputsRead': False,
}

source_pdf = root / 'science/archive/lehrplan-gymnasium-chemie-sachsen-2025.pdf'
sds_pdf = root / 'science/sources/manufacturer/SDB-0965.original.pdf'
viewed = []
for label, pdf, numbers in [('SN', source_pdf, [4, 14, 24]), ('ROTH-0965-SDS', sds_pdf, [1, 2])]:
    for n in numbers:
        viewed.append({'source': pin(pdf), 'physicalPage': n,
                       'actualRenderedImageViewed': pin(OUT / f'viewed/{label}-physical-{n}.png'),
                       'actualPageTextRead': pin(OUT / f'viewed/{label}-physical-{n}.actual-text.txt')})
viewed.append({'role': 'actual unchanged retained goal visualization viewed',
               'originalImage': pin(root / 'science/archive/d2ccd1d5-56f7-583f-9724-e97441367f91.png'),
               'goodImagePreserved': True, 'usedAsProductChartOrPerformanceEvidence': False})
web_observations = {
    'role': 'Independent bounded primary-web verification observations; not original PDF byte pins or safety release',
    'atUTC': now,
    'verifiedSources': [
        {'url': 'https://www.mn-net.com/media/pdf/Instruction-92110-pH-test-strips-pH-Fix-0-14-fixed-indicator.pdf',
         'retrieval': 'Web opened official 9-page PDF; German and English pages1–2 read',
         'observedFacts': ['REF92110', 'All-fields one-second immersion, excess removal and matching reference scale', 'Colour constancy in sample when buffering insufficient', 'Revision10/2026'],
         'originalBytesArchivedByThisReview': False},
        {'url': 'https://www.mn-net.com/media/pdf/9b/88/e0/Instruction-902xx-Universal-and-special-indicator-pH-test-paper.pdf',
         'retrieval': 'Official search extraction read independently; direct open failed',
         'observedFacts': ['Damp chart comparison', 'Weak/unbuffered procedure: paper at inside tube wall, fill to brim, compare through glass after about one minute'],
         'originalBytesArchivedByThisReview': False},
        {'url': 'https://www.mn-net.com/Universal-indicator-paper-pH-1-11-reel-90201',
         'retrieval': 'Official product page content/search result read',
         'observedFacts': ['REF90201', 'pH1–11 in integer steps', 'Own paper product chart'],
         'originalBytesArchivedByThisReview': False},
        {'url': 'https://www.carlroth.com/downloads/spez/en/P/SPEZ_P712_EN.pdf',
         'retrieval': 'Official primary specification search extraction read',
         'observedFacts': ['P712 ready-made pH4.00±0.01 at20C', 'Citric acid/sodium hydroxide/sodium chloride citrate mixture'],
         'originalBytesArchivedByThisReview': False},
        {'url': 'https://www.carlroth.com/medias/SDB-P712-GB-EN.pdf',
         'retrieval': 'Official primary SDS search extraction read; not German school release',
         'observedFacts': ['P712 ready-made laboratory buffer', 'Colourless liquid'],
         'originalBytesArchivedByThisReview': False},
        {'url': 'https://www.carlroth.com/en/en/rotistar-ph-buffer-solutions/buffer-solution-ph-7-00-%C2%B10-01-%2820-%C2%B0c%29/p/9977.1',
         'retrieval': 'Official product search extraction read; direct open failed',
         'observedFacts': ['9977 pH7.00±0.01 at20C', 'Colourless potassium dihydrogen phosphate/disodium hydrogen phosphate mixture'],
         'originalBytesArchivedByThisReview': False},
        {'url': 'https://www.carlroth.com/downloads/sdb/en/X/SDB_X863_MT_EN.pdf',
         'retrieval': 'Official primary SDS search extraction read; foreign jurisdiction is not local release',
         'observedFacts': ['X863 anhydrous citric acid≥99.5%', 'Eye/respiratory irritation warnings concern stock material'],
         'originalBytesArchivedByThisReview': False},
    ],
    'failedDirectOpensAlsoIncluded': ['902xx instruction PDF', 'P712 and9977 product direct opens', 'Guessed German SDS direct URLs for9977/P712/X863'],
    'failedOpenDoesNotMeanSourceOrMaterialAbsent': True,
    'localOriginal0965SDSActuallyViewed': pin(sds_pdf),
    'actualManufacturerProductChartsPhysicallyInspected': False,
    'actualSchoolStockLotOrSafetyReleaseInspected': False,
}
run = {
    'kind': 'standalone-finite-scientific-review-run-manifest',
    'runId': RUN_ID,
    'serializedAtUTC': now,
    'reviewerRole': 'B',
    'reviewMode': 'independent-informed-followup',
    'informedFollowup': True,
    'blindToOtherRuns': False,
    'independenceBoundary': 'Own prior Source9 scientific reading and findings known; no other reviewer substantive results or author error checklist read',
    'previousReviewerPathsSeenOnlyAsInputSourcePinMetadata': True,
    'otherReviewerSubstantiveOutputsRead': False,
    'subagentsUsed': False,
    'nativeToolAvailability': ['exec_command', 'local Python/JSON/hash comparison', 'PyMuPDF actual PDF page rendering/text', 'view_image', 'web primary-source content access'],
    'modelAvailability': {'family': 'GPT-6', 'host': 'Codex agent',
                          'exactBackendRevisionExposed': False,
                          'secondIndependentModelInvoked': False,
                          'crossModelDiversityClaimed': False},
    'firstFrozenBeforeSerialization': first_pin,
    'E1_G1MachineCandidateOnly': True,
    'humanApproval': False,
    'actualLearnerExperimentObserved': False,
    'schoolSafetyReleaseGranted': False,
    'nativeBlindDManifestsEmitted': False,
    'nativeDPageContextBindingsChecked': False,
    'prerequisiteGraphReviewedOrModified': False,
    'inputSourceMainKMutations': False,
    'activationPerformed': False,
    'fullCentralBuildOrValidation': False,
    'stockPOrDValidationClaimed': False,
    'boundedOutputChecksOnly': True,
}

artifacts = [
    write('P1.whole-prospective-contract.informed-B.scientific-opinion.json', p_record),
    write('SOURCE66.left-right-SE.informed-B.scientific-opinion.json', s_record),
    write('PROOF.current-P-cases-and-source66-exact-bounded-delta.json', proof),
    write('VIEWED.actual-finite-artifacts.json', viewed),
    write('WEB.independent-primary-verification.observations.json', web_observations),
    write('RUN.SN-P1-source66.truthful-informed-availability.json', run),
]

for item in artifacts:
    json.loads(Path(item['path']).read_text())
    assert pin(item['path']) == item
for item in guards:
    assert pin(item['path']) == item
assert pin(FIRST)['sha256'] == FIRST_SHA
assert len(p_record['cases']) == 2
assert p_record['recommendation'] == 'KEEP_PROFILE_EXACT'
assert s_record['sourceGoalIndex'] == 66
assert len(proof['sourceOther175Rows']) == 175
assert all(x['valueExact'] and x['currentObjectSha256'] == x['previousObjectSha256']
           for x in proof['sourceOther175Rows'])
checks = {
    'kind': 'finite-output-and-input-immutability-checks',
    'result': 'PASS',
    'checkedAtUTC': datetime.datetime.now(datetime.timezone.utc).isoformat(),
    'frozenFirstExactUnchanged': first_pin,
    'guardedInputCount': len(guards),
    'allDirectInputsExactUnchanged': True,
    'boundedArtifactsParseAndDigestPinsMatch': artifacts,
    'wholeProfileAndBothCaseBodiesExact': True,
    'currentWholeGoalCanonicalEquality': True,
    'rawTemplateBlankNoAttainment': True,
    'sourceOnlyIndex66ChangedOther175Exact': True,
    'all28PassageTextsExactOnlyOneQualificationAddition': True,
    'otherAllTopLevelSourceComponentsExact': True,
    'semanticVerdictRewrittenByValidator': False,
    'stockPOrDCheckRun': False,
    'nativeBlindDCampaignClaimed': False,
    'fullCentralOrBuildRun': False,
}
check_pin = write('CHECKS.SN-P1-source66.bounded-output-and-immutability.json', checks)
selector = {
    'role': 'Sealed finite independent informed scientific B handoff; current SN P1 prospective contract and Source66 cell qualification only',
    'sealedAtUTC': datetime.datetime.now(datetime.timezone.utc).isoformat(),
    'runId': RUN_ID,
    'scientificFirst': first_pin,
    'inputSelectors': [guards[0], guards[1]],
    'inputGuards': pin(GUARD),
    'finiteArtifacts': artifacts,
    'boundedChecks': check_pin,
    'reviewReproductionScript': pin(__file__),
    'decisions': {
        'P1': 'KEEP_PROFILE_EXACT / accepted prospective E1/G1 whole material contract',
        'Source66': 'accepted original left/right/SE fidelity qualification',
        'substantiveAuthoringRevisionFindings': 0,
        'actualPersonalLearnerExperiment': 'UNPROVEN',
        'actualStockLotPreflightSchoolRelease': 'UNPROVEN / required before use',
        'currentNativeDPageContextBinding': 'NOT_REVIEWED',
        'prerequisiteGraph': 'NOT_REVIEWED',
        'currentSourceCanonicalBinding': 'OPEN',
        'wholeSourceUnion': 'OPEN',
        'globalM7': 'OPEN',
    },
    'machineCandidateOnly': True,
    'evidenceLevel': 'E1',
    'maximumClaimScope': 'G1',
    'humanApproval': False,
    'newNativeBlindDClaim': False,
    'sourceInputMainKMutations': False,
}
result = write('SELECTOR.SN-P1-source66-informed-independent-b.sealed.json', selector)
for item in [first_pin, pin(GUARD), *artifacts, check_pin, pin(__file__), *guards]:
    assert pin(item['path']) == item
print(json.dumps({'selector': result, 'FIRST': first_pin, 'records': artifacts[:2],
                  'boundedChecks': check_pin, 'runId': RUN_ID}, indent=2))
