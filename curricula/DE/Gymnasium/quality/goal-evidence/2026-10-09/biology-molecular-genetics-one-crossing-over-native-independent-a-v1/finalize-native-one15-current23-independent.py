import datetime
import hashlib
import json
from pathlib import Path


ROOT = Path('/home/enpasos/projects/skillpilot')
BASE = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09'
OWN = BASE / 'biology-molecular-genetics-one-crossing-over-native-independent-a-v1'
AUTHOR = BASE / 'biologie-molecular-genetics-one-crossing-over-native-successor-preparation-author-v1'
OLD = BASE / 'biology-molecular-genetics-twenty-three-native-independent-a-v1'
SIX = BASE / 'biology-molecular-genetics-six-current-native-independent-a-v1'
VONE = BASE / 'biology-molecular-genetics-one-crossing-over-locus-marker-independent-v-a-v1'
TARGET = '183f3c47-ec20-5b98-8024-77ebd1c48abf'
NOW = datetime.datetime.now(datetime.timezone.utc).isoformat()


def read(path):
    return json.loads(path.read_text())


def bind(path):
    content = path.read_bytes()
    return {'path': str(path.relative_to(ROOT)), 'sha256': 'sha256:' + hashlib.sha256(content).hexdigest(), 'bytes': len(content)}


def write(name, data):
    path = OWN / name
    assert not path.exists(), path
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')
    return path


def records(path):
    return [json.loads(line) for line in path.read_text().splitlines() if line]


def verify_bound_first_values(value):
    if isinstance(value, dict):
        if isinstance(value.get('path'), str) and isinstance(value.get('sha256'), str):
            path = ROOT / value['path']
            assert path.is_file(), path
            actual = bind(path)
            assert actual['sha256'] == value['sha256'], (path, 'sha256')
            if 'bytes' in value:
                assert actual['bytes'] == value['bytes'], (path, 'bytes')
        for item in value.values():
            verify_bound_first_values(item)
    elif isinstance(value, list):
        for item in value:
            verify_bound_first_values(item)


firsts = [
    OWN / 'native-one15.actual-input.FIRST.independent-A.freeze.json',
    OWN / 'native-one15-description.actual-FIRST.independent-A.freeze.json',
    OWN / 'native-one15-current-P23-frame.actual-FIRST.independent-A.freeze.json',
]
for first in firsts:
    verify_bound_first_values(read(first))

dc = read(OWN / 'checks/ordinary-native1-D-campaign-results.terminal.actual.json')
pc = read(OWN / 'checks/ordinary-current-native1-P23.terminal.actual.json')
assert dc['actualExecution'] and dc['exitCode'] == 0 and not dc['stderr']
assert dc['stdout'].strip() == 'Goal-description review campaign results valid: 1'
assert pc['actualExecution'] and pc['exitCode'] == 0 and not pc['stderr']
for text in ['Configured goals: 23', 'Approved: 0', 'Needs human review: 23', 'Rejected: 0', 'Blocking issues: 0']:
    assert text in pc['stdout'], text

frame = read(OWN / 'normal-current-one15-native-P23.actual-neutral-review-frame.json')
values = read(OWN / 'one15-native-current394-P23-actual-whole-value-retention-checks.independent-A.json')
assert values['errors'] == []
assert values['other393WholePagesExact'] and values['other22Native23ContextsExact']
assert values['all23WholeProfilesAndAll46WholeCasesLiteralExact']
assert values['actualResourceReviewInputFPChangedOnlyOne15']
assert values['wholeSource38Partner44FrameExact'] and values['479KindDecisionObjectsExact']

normal_one_records = next((OWN / 'normal-native-one15-round-a-results').glob('*.records.jsonl'))
normal_one_run = next((OWN / 'normal-native-one15-round-a-results').glob('*.run.json'))
one_record = records(normal_one_records)[0]
assert one_record['goalId'] == TARGET and one_record['decision'] == 'keep'
assert normal_one_records.read_bytes() == (OWN / 'native-one15-description.actual-FIRST.independent-A.records.jsonl').read_bytes()
all_p = records(OWN / 'normal-current-one15-native-P23.independent-A.records.jsonl')
assert len(all_p) == 23 and len({record['goalId'] for record in all_p}) == 23
assert all(record['status'] == 'needs_human_review' and record['reviewAuthority'] == 'ai_candidate' for record in all_p)
assert all(record['evidenceLevel'] == 'E1' and record['maximumClaimScope'] == 'G1' for record in all_p)

prior_files = []
for directory in [OLD / 'part-1-normal-round-a-results', OLD / 'part-2-normal-round-a-results']:
    prior_files.extend(sorted(directory.glob('*.records.jsonl')))
six_file = next((SIX / 'normal-native-six-round-a-results').glob('*.records.jsonl'))
old_records = {record['goalId']: (record, path) for path in prior_files for record in records(path)}
six_records = {record['goalId']: (record, six_file) for record in records(six_file)}
current_pages = {page['goalId']: page for page in read(ROOT / frame['actualWhole394Model']['path'])['pages']}
selection = []
counts = {'ownOriginalNative23ExactReuse': 0, 'ownNative6UnchangedCurrentExactReuse': 0, 'ownFreshActualNative1': 0}
for goal_id in frame['goalIds']:
    if goal_id == TARGET:
        record, path, role = one_record, normal_one_records, 'ownFreshActualNative1'
    elif goal_id in six_records:
        record, path = six_records[goal_id]
        role = 'ownNative6UnchangedCurrentExactReuse'
    else:
        record, path = old_records[goal_id]
        role = 'ownOriginalNative23ExactReuse'
    assert record['decision'] == 'keep', goal_id
    assert record['goalFingerprint'] == current_pages[goal_id]['goalFingerprint'], goal_id
    counts[role] += 1
    selection.append({
        'goalId': goal_id, 'ownCurrentDecision': record['decision'], 'selectionRole': role,
        'originalNormalRecordId': record['recordId'], 'originalNormalCampaignId': record['campaignId'],
        'originalNormalRecords': bind(path), 'originalActualSubsetPageFingerprint': record['pageFingerprint'],
        'actualCurrentWhole394GoalFingerprint': current_pages[goal_id]['goalFingerprint'],
        'actualCurrentWhole394PageFingerprint': current_pages[goal_id]['pageFingerprint'],
        'normalRecordRewrittenOrRebound': False,
        'actualReviewEvidence': 'Actual new one15 PDF page3/whole HTML/current DEEN read before own FIRST.' if goal_id == TARGET else 'Own actual earlier page/context review retained; current whole-page/material comparison is exact.',
    })
assert counts == {'ownOriginalNative23ExactReuse': 17, 'ownNative6UnchangedCurrentExactReuse': 5, 'ownFreshActualNative1': 1}
selection_path = write('current23-native-description-judgment-selection.independent-A.json', {
    'schemaVersion': 1, 'role': 'Additive selection of actual own normal D23/6/1 records, without artificial campaign/page rebinding',
    'createdAt': NOW, 'actualCurrentWhole394Model': frame['actualWhole394Model'], 'actualCurrentWhole394Digest': frame['bookDigest'],
    'retentionEvidence': bind(OWN / 'one15-native-current394-P23-actual-whole-value-retention-checks.independent-A.json'),
    'selectionCounts': counts, 'rows': selection, 'keepCount': 23, 'blockCount': 0,
    'subsetVersusFullFrameDisclosure': 'Normal records retain each actually reviewed subset native page fingerprint and campaign. A full394 page fingerprint is separately identified; subset external-prerequisite representation can differ by book membership and is not silently rebound.',
    'freshWhole23ReviewClaimed': False, 'currentWholeNativeDApproved': False,
    'reviewAuthority': 'ai_candidate', 'humanApproval': False, 'humanTrial': False, 'activeWrites': [], 'strictGain': 0,
})

resolution_path = write('one15-corrected-native-marker-and-current-P-frame-targeted-resolution.independent-A.json', {
    'schemaVersion': 1, 'role': 'Own targeted historical marker/native hold successor resolution only', 'createdAt': NOW,
    'goalId': TARGET, 'oldFindingIds': ['BIO23-V6-A-001', 'BIO23-V6-A-META-001'],
    'oldActualNative6First': bind(SIX / 'native-six-description.actual-FIRST.independent-A.verdict.json'),
    'oldActualNative6FirstSeal': bind(SIX / 'native-six-description.actual-FIRST.independent-A.freeze.json'),
    'oldActualNative6Decision': 'block',
    'actualNewNative1First': bind(OWN / 'native-one15-description.actual-FIRST.independent-A.verdict.json'),
    'actualNewNative1FirstSeal': bind(OWN / 'native-one15-description.actual-FIRST.independent-A.freeze.json'),
    'actualNewNative1Decision': 'keep',
    'ownCorrectedRasterFirst': bind(VONE / 'one-marker-raster.pixel-FIRST.independent-A.verdict.json'),
    'ownCorrectedRasterFirstSeal': bind(VONE / 'one-marker-raster.pixel-FIRST.independent-A.freeze.json'),
    'ownCorrectedRasterAndMetadataCompleted': bind(VONE / 'neutral-completed-one-marker-actual-V-independent-A.review.entry.json'),
    'ownPortableIdenticalRasterMetadataTransition': bind(VONE / 'portable-binding-successor-v2/one-marker-portable-metadata-binding-only.actual-independent-followup.json'),
    'actualSelectedPNG': read(OWN / 'native-one15-current-P23-frame.actual-FIRST.independent-A.verdict.json')['actualTargetNativePage']['actualPortableAlias'],
    'actualNativePDF': frame['actualNativePDF'], 'actualNativeHTML': frame['actualNativeHTML'],
    'actualPhysicalTargetPageSeen': 3, 'currentOwnTarget15HoldResolved': True,
    'actualResolutionReason': 'The actual new native page shows green at the central blue-upper/red-distal lower locus. Every input/exchange/output stage preserves two green and two orange lower markers; reciprocal paths and unchanged outer chromatids agree with truthful actual caption/alt/reconstruction. The actual page is legible and unclipped. The unchanged bilingual competence, original P cases and conditional biodiversity bridge remain bounded.',
    'wholeCurrent23ProfilesAnd46CasesLiteralExactReuse': True,
    'firstSealsChanged': False, 'oldNative6BlockRemainsHistorical': True,
    'freshPeerDRead': False, 'freshPeerPRead': False, 'freshPeerV1Read': False,
    'currentWholeV23Approved': False, 'wholeSourceCourseAtlasApproved': False,
    'reviewAuthority': 'ai_candidate', 'status': 'needs_human_review', 'evidenceLevel': 'E1', 'maximumClaimScope': 'G1',
    'humanApproval': False, 'humanTrial': False, 'actualLearnerPerformance': False,
    'actualExperimentPerformed': False, 'activeWrites': [], 'strictGain': 0,
})

check_path = write('checks/ordinary-native1-current-P23-and-retained-AM-final-summary.actual.json', {
    'schemaVersion': 1, 'createdAt': NOW,
    'actualNormalD1CampaignResults': {'terminal': bind(OWN / 'checks/ordinary-native1-D-campaign-results.terminal.actual.json'), 'exitCode': 0, 'validatedRecordCount': 1, 'CLIReportedValid': True, 'validatorErrors': [], 'errorsDerivation': 'Actual normal CLI success; the validator emits success only when its returned errors array and directory errors are empty.'},
    'actualNormalP23': {'terminal': bind(OWN / 'checks/ordinary-current-native1-P23.terminal.actual.json'), 'exitCode': 0, 'configuredGoals': 23, 'approved': 0, 'needsHumanReview': 23, 'rejected': 0, 'blockingIssues': 0},
    'ownFreshNative1': {'keep': 1, 'block': 0, 'actualTargetPDFPageIndividuallySeen': 3},
    'ownCurrentNativeD23Selection': {'keep': 23, 'block': 0, **counts},
    'current23PositiveMaterialJudgments': 'Exact own genuine prior whole material judgments reused; actual changed one15 page/resource binding independently read.',
    'whole394Other393PagesExact': True, 'whole479CanonicalGoalsExact': True,
    'whole38Source44PartnersExact': True, 'all23ProfilesAll46CasesLiteralExact': True,
    'all479KindDecisionObjectsExact': True, '393PlusGenuineOwnSpliceOneAMRetained': True,
    'ownExistingInputAndDFirstAndPFirstBindingsVerifiedUnchanged': [bind(path) for path in firsts],
    'errors': [], 'humanApproval': False, 'humanTrial': False, 'activeWrites': [], 'strictGain': 0,
})

entry = {
    'schemaVersion': 1, 'role': 'Neutral completed actual one15 native independent round-A D/current394 P23 frame successor review with exact previous22 native contexts and all23 material judgments retained',
    'createdAt': NOW,
    'actualAuthorNeutralEntry': frame['actualNeutralEntry'],
    'actualAuthorFirstSeal': bind(AUTHOR / 'native-one15-successor.technical.first.freeze.json'),
    'ownInputFirst': bind(firsts[0]), 'ownNativeD1First': bind(OWN / 'native-one15-description.actual-FIRST.independent-A.verdict.json'),
    'ownNativeD1FirstSeal': bind(firsts[1]),
    'normalD1Campaign': bind(AUTHOR / 'native-one15/round-a/description-review-campaign.json'),
    'normalD1Input': bind(AUTHOR / 'native-one15/round-a/description-review-input.json'),
    'normalD1Bundle': bind(AUTHOR / 'native-one15/bundle/review-bundle-manifest.json'),
    'normalD1BatchesDirectory': str((AUTHOR / 'native-one15/round-a/batches').relative_to(ROOT)),
    'normalD1ResultsDirectory': str((OWN / 'normal-native-one15-round-a-results').relative_to(ROOT)),
    'normalD1Records': bind(normal_one_records), 'normalD1Run': bind(normal_one_run),
    'ownCurrentP23TargetedFrameFirst': bind(OWN / 'native-one15-current-P23-frame.actual-FIRST.independent-A.verdict.json'),
    'ownCurrentP23TargetedFrameFirstSeal': bind(firsts[2]),
    'normalP23Config': bind(OWN / 'normal-current-one15-native-P23.independent-A.config.json'),
    'normalP23Records': bind(OWN / 'normal-current-one15-native-P23.independent-A.records.jsonl'),
    'normalP23Run': bind(OWN / 'normal-current-one15-native-P23.independent-A.run.json'),
    'normalP23NeutralActualFrame': bind(OWN / 'normal-current-one15-native-P23.actual-neutral-review-frame.json'),
    'actualSmallPortableP23CapsuleBindings': bind(OWN / 'ordinary-current-P23-capsule.actual-portable-bindings.json'),
    'actualCurrentWhole394Model': frame['actualWhole394Model'], 'actualCurrentWhole394BookDigest': frame['bookDigest'],
    'actualCurrentCanonical': frame['actualCurrentCanonical'], 'actualCurrentKinds': frame['actualCurrentKinds'],
    'actualCurrentWhole23Profiles46Cases': frame['actualWhole23P46Cases'],
    'actualWhole38Source44PartnerFrame': frame['actualWhole38Source44PartnerFrame'],
    'actualNativePDF': frame['actualNativePDF'], 'actualNativeHTML': frame['actualNativeHTML'],
    'actualNativePDFPagesIndividuallySeen': [3], 'wholeOneCurrentDEENInputAndHTMLContextActuallyRead': True,
    'whole394And23P22NativeReuseChecks': bind(OWN / 'one15-native-current394-P23-actual-whole-value-retention-checks.independent-A.json'),
    'ownCurrentNative23DescriptionSelection': bind(selection_path),
    'ownTargetedHoldResolution': bind(resolution_path), 'actualFinalNormalChecks': bind(check_path),
    'ownPreviousNative6CompletedReview': bind(SIX / 'neutral-completed-native-six-D-current-P23-and-retained-AM.independent-A.review.entry.json'),
    'ownPreviousNative6FinalSeal': bind(SIX / 'native-six-completed-independent-A.final.freeze.json'),
    'ownPreviousNative23CompletedReview': bind(OLD / 'neutral-completed-current-native23-D-P-and-one-Splice-AM.independent-A.review.entry.json'),
    'ownPreviousNative23FinalSeal': bind(OLD / 'current-native23-D-P-Splice-completed-independent-A.final.freeze.json'),
    'ownPriorNormalD23ResultsDirectories': [str((OLD / name).relative_to(ROOT)) for name in ['part-1-normal-round-a-results', 'part-2-normal-round-a-results']],
    'ownPriorNormalD6ResultsDirectory': str((SIX / 'normal-native-six-round-a-results').relative_to(ROOT)),
    'ownCorrectedV1CompletedReview': bind(VONE / 'neutral-completed-one-marker-actual-V-independent-A.review.entry.json'),
    'ownCorrectedV1FinalSeal': bind(VONE / 'one-marker-completed-independent-A.final.freeze.json'),
    'ownCorrectedPortableV1BindingFollowup': bind(VONE / 'portable-binding-successor-v2/one-marker-portable-metadata-binding-only.actual-independent-followup.json'),
    'ownCorrectedPortableV1BindingSeal': bind(VONE / 'portable-binding-successor-v2/one-marker-portable-metadata-binding-only.independent-A.freeze.json'),
    'ownRetainedSpliceKindAMFirst': bind(OLD / 'one-current-Splice-kind-atomicity-memory.actual-FIRST.independent-A.verdict.json'),
    'ownRetainedSpliceKindAMFirstSeal': bind(OLD / 'one-current-Splice-kind-atomicity-memory.actual-FIRST.independent-A.freeze.json'),
    'ownRetainedNormalSpliceAConfig': bind(OLD / 'normal-Splice-A1.independent-A.config.json'),
    'ownRetainedNormalSpliceARecords': bind(OLD / 'normal-Splice-A1.independent-A.records.jsonl'),
    'ownRetainedNormalSpliceMConfig': bind(OLD / 'normal-Splice-M1.independent-A.v2.config.json'),
    'ownRetainedNormalSpliceMRecords': bind(OLD / 'normal-Splice-M1.independent-A.records.jsonl'),
    'currentNativeDCombination': {'ownPrior17ActualNativeDescriptionsReused': 17, 'ownNative6FiveUnchangedActualDescriptionsReused': 5, 'freshActualNative1Keep': 1, 'ownCurrentD23CombinationKeep': 23, 'ownCurrentD23CombinationBlock': 0, 'normalRecordsArtificiallyRebound': False},
    'currentPositiveMaterial23': {'decision': 'KEEP_REUSED_POSITIVE_MATERIAL_AS_AI_CANDIDATE', 'freshWhole23ScienceClaim': False, 'whole23ProfileBodiesAndFPsExact': True, 'whole46CasesLiteralExact': True, 'currentResourceReviewInputFPChangedOnlyOne15': True},
    'normalP23Approved': 0, 'normalP23NeedsHumanReview': 23, 'ownCurrentTarget15ResourceHoldResolved': True,
    'other393PlusOwnSpliceGenuineKindAMRetained': True,
    'currentWholeNativeDApproved': False, 'currentWholeV23Approved': False, 'wholeSourceCourseAtlasApproved': False,
    'oldFirstSealsChanged': False, 'freshPeerNativeDRead': False, 'freshPeerPRead': False, 'freshPeerCurrentV1Read': False,
    'authorInspectionLabelsRead': False, 'actualNormalDAndPValidatorsExecuted': True,
    'normalPReasonReuseDisclosure': 'Twenty-two ordinary reasons retain own genuine previous material judgments. Only one15 current-resource reason is newly written. No unchanged material science or pixel inspection is claimed anew; previous FIRSTs are immutable.',
    'reviewAuthority': 'ai_candidate', 'status': 'needs_human_review', 'evidenceLevel': 'E1', 'maximumClaimScope': 'G1',
    'actualLearnerPerformance': False, 'actualExperimentPerformed': False, 'humanApproval': False, 'humanTrial': False,
    'activeWrites': [], 'strictGain': 0,
}
entry_path = write('neutral-completed-native-one15-D-current-P23-and-retained-AM.independent-A.review.entry.json', entry)
verify_bound_first_values(entry)
frozen_outputs = [bind(path) for path in sorted(OWN.rglob('*')) if path.is_file() and not path.is_symlink() and 'ordinary-current-P23-validation-capsule' not in path.parts]
seal = write('native-one15-completed-independent-A.final.freeze.json', {
    'schemaVersion': 1, 'role': 'Additive immutable final independent actual Native1 D/currentP23 frame completion; earlier own FIRSTs retained',
    'createdAt': NOW, 'completedEntry': bind(entry_path), 'outputs': frozen_outputs,
    'validatorCapsuleRegularCodeAnd23ImageBytesBoundSeparately': bind(OWN / 'ordinary-current-P23-capsule.actual-portable-bindings.json'),
    'capsuleRuntimeCacheExcluded': True, 'oldFirstSealsChanged': False,
    'reviewAuthority': 'ai_candidate', 'humanApproval': False, 'humanTrial': False, 'activeWrites': [], 'strictGain': 0,
})
verify_bound_first_values(read(seal))
print(json.dumps({'completedEntry': bind(entry_path), 'finalSeal': bind(seal), 'ownCurrentD23Keep': 23, 'ownFreshD1Keep': 1, 'normalP23NeedsHumanReview': 23, 'actualValidatorExitCodes': [dc['exitCode'], pc['exitCode']], 'freshPeerResultsRead': False}, ensure_ascii=False, indent=2))
