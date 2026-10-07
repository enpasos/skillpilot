import json, pathlib, hashlib, datetime

root = pathlib.Path('/home/enpasos/projects/skillpilot')
base = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/'
own = base + 'chemie-current-fifteen-native-positive-independent-b-v1/'
author = base + 'chemie-current-atomic-description-positive-gap-author-v1/'
previous = base + 'chemie-current-fifteen-native-d-independent-b-v1/'
inputs = {}

def bind(path, role, expected=None):
    data = (root / path).read_bytes()
    entry = dict(path=path, sha256=hashlib.sha256(data).hexdigest(), bytes=len(data))
    if expected:
        assert entry['sha256'] == expected['sha256'].removeprefix('sha256:'), path
        if 'bytes' in expected:
            assert entry['bytes'] == expected['bytes'], path
    old = inputs.setdefault(path, dict(**entry, roles=[]))
    assert old['sha256'] == entry['sha256'], path
    if role not in old['roles']:
        old['roles'].append(role)
    return data

d_path = previous + 'native-d-fifteen.independent-b.final.freeze.json'
d = json.loads(bind(d_path, 'Own unchanged valid final D-stage reuse', dict(sha256='e8c46706e1f2dfabd6a2989db6cc88318079e3d873d528a4b6b3e7de50446f5c')))
for entry in d['inputs']:
    bind(entry['path'], 'Own D-stage input reuse byte revalidation only; no restarted/global source review', entry)
for entry in d['outputs']:
    bind(entry['path'], 'Own previously completed actual D-stage evidence byte preservation', entry)

a_path = author + 'description-positive-gap-author-v1.final.freeze.json'
a = json.loads(bind(a_path, 'Explicitly authorized immutable author material/profile stage', dict(sha256='bfa6a010a5216ca0caec371a2d7b826406a73fcaf00b0f5bf41be7527082eb14')))
author_byte_bindings = []
excluded_round_a = []
for entry in a['files']:
    if '/round-a/' in entry['path']:
        excluded_round_a.append(entry['path'])
        continue
    bind(entry['path'], 'Authorized author artifact byte binding; no adoption of authored judgments', entry)
    author_byte_bindings.append(entry['path'])
assert len(author_byte_bindings) == 42 and len(excluded_round_a) == 7

science = json.loads((root / own / 'actual-thirty-materials-fifteen-profiles.science-independent-b.json').read_text())
native = json.loads((root / own / 'actual-current-native-p-bindings-and-contract-check.independent-b.json').read_text())
for entry in science['actualInputs'] + native['actualInputs']:
    if not entry['path'].startswith(own):
        bind(entry['path'], 'Actual current P helper/material/profile input byte revalidation', entry)
for path in [
    'app/scripts/materializePositiveGoalEvidenceCandidates.ts',
    'app/scripts/positiveGoalEvidenceProfileModel.ts',
    'app/scripts/positiveGoalEvidenceReview.ts',
    'contracts/goal-evidence/v2/goal-evidence-profile.schema.json',
    'contracts/goal-evidence/v2/goal-evidence-review-config.schema.json',
    'contracts/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json',
]:
    bind(path, 'Unmodified native P helper/validator/contract actually used')

cfg = json.loads((root / own / 'positive.fifteen.independent-b.config.json').read_text())
records_bytes = (root / cfg['reviewPath']).read_bytes()
records = [json.loads(line) for line in records_bytes.decode().splitlines()]
run = json.loads((root / cfg['reviewRunManifestPaths'][0]).read_text())
assert run['outputDigest'] == 'sha256:' + hashlib.sha256(records_bytes).hexdigest()
assert len(records) == 15 and len(science['cases']) == 30
assert science['profileScientificCounts'] == {'KEEP': 9, 'REVISE': 6}
assert len([r for r in records if r['dissent']]) == 6
assert all(r['status'] == 'needs_human_review' and r['reviewAuthority'] == 'ai_candidate' and r['evidenceLevel'] == 'E1' and r['maximumClaimScope'] == 'G1' for r in records)
assert run['role'] == 'synthesizer' and run['blindToOtherRuns'] is False
assert native['nativeContractErrors'] == []
assert json.loads((root / own / 'results/native-contract-check.execution.actual.json').read_text())['actualExitCode'] == 0
keep_p = [r['goalId'] for r in science['goals'] if r['profileScientificDecision'] == 'KEEP']
joint = [id for id in keep_p if id in d['reusableUnchangedNativeDKeepGoalIds']]
assert len(keep_p) == 9 and len(joint) == 7
outputs = []
freeze_name = 'native-positive-fifteen.independent-b.final.freeze.json'
for path in sorted((root / own).rglob('*')):
    if not path.is_file() or path.name == freeze_name:
        continue
    assert not path.is_symlink(), path
    data = path.read_bytes()
    outputs.append(dict(path=str(path.relative_to(root)), sha256=hashlib.sha256(data).hexdigest(), bytes=len(data)))
freeze = dict(
    schemaVersion=1, stageId='chemie-current-fifteen-native-positive-independent-b-v1',
    createdAtUTC=datetime.datetime.now(datetime.timezone.utc).isoformat(),
    role='Own independent B actual P science, completed blind first-pass preserved; final 622 coverage follow-up after disclosed root finding cue',
    authorFreeze=dict(path=a_path, sha256=hashlib.sha256((root / a_path).read_bytes()).hexdigest()),
    ownReusedDStageFreeze=dict(path=d_path, sha256=hashlib.sha256((root / d_path).read_bytes()).hexdigest()),
    scopeGoalIds=cfg['scope']['goalIds'], profileScientificCounts={'KEEP':9,'REVISE':6},
    completeMaterialScientificCounts={'KEEP':30,'REVISE':0},
    reusableUnchangedPositiveKeepGoalIds=keep_p, reusableUnchangedJointDPositiveKeepGoalIds=joint,
    sixExplicitProfileDissents=True, all15WholeProfilesAnd30CompleteDEENCasesActuallyReviewed=True,
    actualCurrentPureNativeHelperRecomputedAll15=True, all30WholeNativeCaseBindingsExact=True,
    all45CurrentOriginalAppBackendAssetByteBindingsPreserved=True,
    nativeContractValidatorExitCode=0, nativeContractCounts=native['nativeContractCounts'],
    contractPassDoesNotApproveSixScientificRevisions=True,
    ownAromaticDBlockAndThreeDTextRevisionsNotOverruled=True,
    ownBlindFirstPassScientificCounts={'KEEP':10,'REVISE':5},
    ownBlindFirstPassPreservedPath=own+'pre-final-blind-first-pass/history-receipt.json',
    rootTransmitted622PeerFindingCueAfterCompletedBlindFirstPass=True,
    finalWholeStageFullyBlind=False, finalNativeRunRole=run['role'],
    peerAResultFilesRead=False, excludedUnreadAuthorRoundAPaths=excluded_round_a,
    exactly42AllowedAuthorArtifactsByteVerified=True, historicalReviewBytesUnchanged=True,
    wholeOriginalSourceCoverage=False, allNationalCourseAndStageScopesReviewed=False,
    sourceAtlas48ScopesAnd496UnresolvedDecisionsNotClosed=True,
    actualLearnerEvidence=False, humanApproval=False, humanTrial=False,
    activeWrites=False, GitOperations=False, fullBuildOrFullQS=False,
    newStrictScientificClosures=0, restoredActiveBindings=0, strictNetGain=0,
    actualFinalInputsAndOwnOutputsReverified=True, inputs=list(inputs.values()), outputs=outputs,
)
target = root / own / freeze_name
target.write_text(json.dumps(freeze, ensure_ascii=False, indent=2) + '\n')
for entry in list(inputs.values()) + outputs:
    data = (root / entry['path']).read_bytes()
    assert hashlib.sha256(data).hexdigest() == entry['sha256'] and len(data) == entry['bytes'], entry['path']
print(json.dumps(dict(path=str(target.relative_to(root)), sha256=hashlib.sha256(target.read_bytes()).hexdigest(), inputs=len(inputs), ownOutputs=len(outputs), profileScientificCounts={'KEEP':9,'REVISE':6}, completeMaterialScientificCounts={'KEEP':30}, reusableUnchangedJointDPositiveKeepGoalIds=joint), ensure_ascii=False))
