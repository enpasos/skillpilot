from pathlib import Path
from datetime import datetime, timezone
import json
import hashlib
from collections import Counter

FINAL = Path(__file__).resolve().parent
OWN = FINAL.parent
REPO = Path('/home/enpasos/projects/skillpilot')
SOURCE = REPO / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-energy20-nernst-alt-context-author-and-native-final-preparation-20261015-v1'
ROUND = FINAL / 'assigned-round-b'


def sha(path):
    return 'sha256:' + hashlib.sha256(path.read_bytes()).hexdigest()


def artifact(path):
    return {'path': str(path.resolve()), 'sha256': sha(path), 'bytes': path.stat().st_size}


def write_new(path, value):
    assert not path.exists(), path
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')


now = datetime.now(timezone.utc).isoformat(timespec='milliseconds').replace('+00:00', 'Z')
source_selector = SOURCE / 'INPUTS.final-native20-v3.physical-selector.json'
source_seal = SOURCE / 'FILES.finite-alt-author-native-preparation.seal.json'
assert sha(source_selector) == 'sha256:b2256d041c6d442900b506f7d7ef0efa3a2cc4702db10fe19776c324ff4c7b12'
assert sha(source_seal) == 'sha256:f739e9d80555c5c9421078249593be7ae963448668949523e7b489a3a7a99d77'
selected = json.loads(source_selector.read_text())
sealed = json.loads(source_seal.read_text())
checked_source = []
for item in sealed['files']:
    path = REPO / item['path']
    assert sha(path) == item['sha256'], path
    assert path.stat().st_size == item['bytes'], path
    checked_source.append(item)
checked_science = []
for item in selected['scientificReviewInputs']:
    path = REPO / item['path']
    assert sha(path) == item['sha256'], path
    assert path.stat().st_size == item['bytes'], path
    checked_science.append(item)
copied = []
for original_directory, copy_directory in [
    (SOURCE / 'native-twenty/bundle', FINAL / 'native-bundle'),
    (SOURCE / 'native-twenty/round-b', ROUND),
]:
    for original in sorted(original_directory.rglob('*')):
        if not original.is_file():
            continue
        copy = copy_directory / original.relative_to(original_directory)
        assert original.read_bytes() == copy.read_bytes(), copy
        copied.append(artifact(copy))
early = OWN / 'FIRST20.genuine-independent-b.scientific.json'
assert sha(early) == 'sha256:963f8efa66d5daa30461dac9e2c0109dcd3d5ee46f0e3ba5ba1f5a89d330880b'
first = FINAL / 'FIRST20.final-v3.independent-b.scientific.json'
assert sha(first) == 'sha256:a063cd590f7e3883195ecd194f804c37b9ea8cf0c4b76abcaa04e5bc3377a833'
first_data = json.loads(first.read_text())
records_path = next((ROUND / 'results').glob('*.records.jsonl'))
run_path = next((ROUND / 'results').glob('*.run.json'))
records = [json.loads(line) for line in records_path.read_text().splitlines()]
run = json.loads(run_path.read_text())
assert len(records) == 20
assert run['outputDigest'] == sha(records_path)
for science, record in zip(first_data['perGoalScientificFirst'], records):
    for field in ['goalId', 'decision', 'rationale', 'understandingEvidence', 'evidenceProfileRecommendation']:
        assert science[field] == record[field]
assert first_data['firstWrittenAt'] < run['completedAt']
validation = FINAL / 'VALIDATION.normal-D-campaign.receipt.json'
assert json.loads(validation.read_text())['exitCode'] == 0
audit = {
    'schemaVersion': 1, 'checkedAt': now,
    'sourcePreparationSeal': artifact(source_seal),
    'sourcePreparationPayloadFilesVerifiedUnchanged': len(checked_source),
    'scientificInputFilesVerifiedUnchanged': checked_science,
    'exactAssignedRoundAndNativeCopies': copied,
    'otherRoundResultsRead': False,
    'foreignDOrPJudgmentsRead': False,
    'earlierOwnCheckpointUnchanged': artifact(early),
    'finalFirstUnchanged': artifact(first),
    'recordScienceExactlyMatchesSealedOwnFinalFirst': True,
    'recordsCount': len(records),
    'normalValidationExitCode': 0,
    'centralWrites': 0,
    'sourceWrites': 0,
    'parentSealedBlankRoundResultsStillEmpty': not list((SOURCE / 'native-twenty/round-b/results').iterdir()),
}
audit_path = FINAL / 'CLOSURE.actual-input-integrity-and-own-output.json'
write_new(audit_path, audit)
read_receipt = {
    'schemaVersion': 1,
    'reviewer': '/root/chemie_energy20_successor_native_fresh_independent_b_20261015',
    'sameOngoingReview': True,
    'earlierOwnV2Checkpoint': artifact(early),
    'finalV3ReadStartedAt': '2026-10-15T12:02:10Z',
    'finalV3ScienceWrittenAt': first_data['firstWrittenAt'],
    'finalV3ActualRead': first_data['actualNativeRead'],
    'scientificPrereadScope': first_data['scientificRead'],
    'targetedFinalA338Context': first_data['finalTargetedContextRead'],
    'scopeOfPrimaryReading': '22 mapping lanes and151 complete mapping cells are not151 complete official-primary readings.56 supplied rawText values are empty. Full official source blocks read separately for HE49-51,BB22-25,HB19/28/31/32/34,BW26/30/40-43 and complete related BY units/children; additionally supplied nonempty primary passages were read. Full national source/course closure remains unclaimed.',
    'actualFutureAcquisitionBoundary': 'Where the goal demands independent research or practical work, real future learner performance must provide it. Blank protocols and fictional supplied data are neither executed learner research nor lab execution. Already conducted human/lab trials are not a machine-M7 prerequisite.',
    'externalPrimaryScientificCrosschecksActuallyReadEarlierInThisReview': [
        'https://www.energy.gov/cmei/fuels/types-fuel-cells',
        'https://www.acs.org/green-chemistry-sustainability/research-innovation/engineerings-metrics.html',
        'https://www.epa.gov/saferchoice/safer-choice-criteria-surfactants',
    ],
    'blindToOtherRuns': True,
    'blindnessDisclosure': first_data['ownEarlierCheckpoint']['disclosure'],
    'noPAMVOrHumanVerdicts': True,
}
read_path = FINAL / 'READ.actual-scope-times-and-blinding.json'
write_new(read_path, read_receipt)
counts = Counter(record['decision'] for record in records)
selector = {
    'schemaVersion': 1,
    'role': 'Finite independent B final native20-v3 D review selection; local candidates only',
    'selectedAt': now,
    'reviewer': read_receipt['reviewer'],
    'assignedRound': 'native-twenty/round-b',
    'exactParentSelector': artifact(source_selector),
    'exactParentPreparationSeal': artifact(source_seal),
    'ownEarlierScienceCheckpoint': artifact(early),
    'finalFirstScience': artifact(first),
    'finalFirstSeal': artifact(FINAL / 'FIRST20.final-v3.scientific.seal.json'),
    'actualReadReceipt': artifact(read_path),
    'actualGenerationParametersAndProvenance': artifact(FINAL / 'actual-generation-parameters-and-provenance.json'),
    'campaign': artifact(ROUND / 'description-review-campaign.json'),
    'reviewInput': artifact(ROUND / 'description-review-input.json'),
    'bundle': artifact(ROUND / 'review-bundle-manifest.json'),
    'batchInput': artifact(next((ROUND / 'batches').glob('*.input.jsonl'))),
    'actualRunManifest': artifact(run_path),
    'normalDRecords': artifact(records_path),
    'normalCampaignValidation': artifact(validation),
    'normalCampaignValidationStdout': artifact(FINAL / 'VALIDATION.normal-D-campaign.stdout.txt'),
    'inputAndOutputClosure': artifact(audit_path),
    'counts': {decision: counts[decision] for decision in ['keep', 'revise', 'split_review', 'block']},
    'blockGoalIds': [r['goalId'] for r in records if r['decision'] == 'block'],
    'splitReviewGoalIds': [r['goalId'] for r in records if r['decision'] == 'split_review'],
    'preservedHolds': [
        'e64 whole-goal GK/LK course boundary: additional HE50 methanol-transesterification/biodiesel duty cannot silently become GK',
        'c21 independent zeolite-ion-exchange and microbial-surfactant-degradation competencies require separate atomicity review',
        '0773 own bounded optimisation wording is clear; source/optional-selection scope and absent visual remain unclosed',
        'all partial/broad national source mappings, full source reading deficits, cross-stage mappings and course/selection duties remain unwaived',
        'BW further-material-group selection does not impose universal extra detergent duty; BB/BE zwitterionic and practical surfactant partners remain',
        'six M text stales are not refreshed; 16b/a338 independent V contexts are outside this D assignment and not cleared here',
    ],
    'normalValidationExitCode': 0,
    'blindToOtherRuns': True,
    'priorNormalRunsOrRecords': 0,
    'newDRecords': 20,
    'newP': 0, 'newA': 0, 'newM': 0, 'newV': 0, 'newStrict': 0,
    'centralExecuted': False, 'activeIntegration': False,
    'humanApproval': False, 'humanTrial': False, 'M7': False,
    'STOP': True,
}
selector_path = OWN / 'NEUTRAL.final-native20-v3-independent-b.json'
write_new(selector_path, selector)
seal_path = OWN / 'FILES.finite-independent-b.seal.json'
assert not seal_path.exists()
files = [artifact(p) for p in sorted(OWN.rglob('*')) if p.is_file() and p != seal_path]
seal = {
    'schemaVersion': 1, 'role': 'Finite independent B final review seal; self excluded; STOP',
    'sealedAt': now, 'selection': artifact(selector_path),
    'payloadFiles': len(files), 'payloadBytes': sum(f['bytes'] for f in files), 'files': files,
    'counts': selector['counts'], 'normalCampaignValidationExitCode': 0,
    'earlierV2FirstPreserved': True, 'foreignResultsRead': False,
    'allSourceCourseAtomicityAndOtherGateHoldsUnwaived': True,
    'newPAMV': 0, 'newStrict': 0,
    'centralExecuted': False, 'activeIntegration': False,
    'humanApproval': False, 'humanTrial': False, 'M7': False, 'STOP': True,
}
write_new(seal_path, seal)
for item in files:
    assert sha(Path(item['path'])) == item['sha256']
print(json.dumps({'selector': artifact(selector_path), 'seal': artifact(seal_path), 'counts': selector['counts'], 'sealedPayloadFiles': len(files), 'sourceSealFilesVerified': len(checked_source), 'STOP': True}, ensure_ascii=False))
