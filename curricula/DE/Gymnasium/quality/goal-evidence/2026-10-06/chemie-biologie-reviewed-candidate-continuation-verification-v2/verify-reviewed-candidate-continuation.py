import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path

root = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06')
out = root / 'chemie-biologie-reviewed-candidate-continuation-verification-v2'
out.mkdir(exist_ok=True)
assert not (out / 'reviewed-candidate-continuation.final.freeze.json').exists()
now = datetime.now(timezone.utc).isoformat()


def read(path):
    return json.loads(Path(path).read_text())


def bind(path):
    path = Path(path)
    return {'path': path.as_posix(), 'sha256': hashlib.sha256(path.read_bytes()).hexdigest(), 'bytes': path.stat().st_size}


def write(name, data):
    (out / name).write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')


manifests = {
    'chemistryB008AuthorV7': root / 'chemie-b008-twenty-six-literal-operator-prerequisite-author-v7/four-targeted-prototypes.author-v7.final.freeze.json',
    'chemistryB008IndependentA': root / 'chemie-b008-four-products-v7-independent-a-followup-v1/same-independent-a.v7-followup.complete.final.freeze.json',
    'chemistryB008IndependentB': root / 'chemie-b008-four-products-v7-independent-b-followup-v1/independent-b-v7-followup.final.freeze.json',
    'biologyQ1AuthorV5': root / 'biologie-q1-four-source-operator-author-remediation-v5/author-source-operator-v5.final.freeze.json',
    'biologyQ1IndependentA': root / 'biologie-q1-four-operator-v5-independent-a-v1/independent-a.final.freeze.json',
    'biologyQ1IndependentB': root / 'biologie-q1-four-operator-v5-independent-b-v1/independent-b-v5.final.freeze.json',
    'chemistryB007AuthorV2': root / 'chemie-b007-seven-routines-four-material-corrections-author-v2/targeted-materials.author-v2.final.freeze.json',
    'biologyNeuroSourceAuthorV3': root / 'biologie-neuro-he-original-spelling-nw-two-source-components-author-v3/he-raw-nw-two-components.author-v3.final.freeze.json',
    'biologyNeuroOutsideSourceWorklist': root / 'biologie-neuro-outside-fifty-two-source-restoration-worklist-v1/outside-source-worklist.final.freeze.json',
}
results = []
for label, path in manifests.items():
    manifest = read(path)
    for row in manifest['files']:
        file_path = Path(row['path'])
        if not file_path.is_absolute() and file_path.parts[0] not in ('curricula', 'app', 'docs', 'tmp', 'qa-artifacts'):
            file_path = path.parent / file_path
        actual = bind(file_path)
        assert actual['sha256'] == row['sha256'], row['path']
        if 'bytes' in row:
            assert actual['bytes'] == row['bytes'], row['path']
    results.append({'package': label, 'freeze': bind(path), 'ownFilesVerifiedExactly': len(manifest['files'])})
b008author = bind(manifests['chemistryB008AuthorV7'])['sha256']
bioauthor = bind(manifests['biologyQ1AuthorV5'])['sha256']
chemA = read(manifests['chemistryB008IndependentA'])
chemB = read(manifests['chemistryB008IndependentB'])
bioA = read(manifests['biologyQ1IndependentA'])
bioB = read(manifests['biologyQ1IndependentB'])
assert chemA['authorV7FreezeSha256'] == b008author == chemB['authorV7FreezeSha256']
assert chemA['scientificRevisionBlockers'] == 0
assert chemB['remainingScientificBlockersInTargetedFollowup'] == 0
assert chemB['fourOwnBlockingV6FindingsResolved'] is True
assert bioA['inputAuthorFinalFreezeSHA256'] == bioauthor == bioB['authorFinalFreezeSHA256']
assert bioA['newWordingMaterialDefects'] == 0
assert bioB['unresolvedV5WordingOrScienceDefects'] == 0
checkpoint_path = root / 'chemie-q1-current378-active-integration-verification-v1/final-current-machine-checks-and-inputs.actual.json'
checkpoint = read(checkpoint_path)
for row in checkpoint['currentInputs']:
    assert bind(row['path']) == row, row['path']
write('actual-current-manifest-and-input-verification.json', {
    'schemaVersion': 1, 'createdAtUTC': now, 'manifests': results,
    'activeCurrentCheckpointInputsExactlyRehashed': checkpoint['currentInputs'],
    'historicalReviewedIntegrationReceipt': bind(checkpoint_path),
    'fullMachineChecksRerun': False,
    'reason': 'No active goal/evidence/source/projection inputs changed in this candidate pass; full runs reserved for the next stable actual integration.',
    'gitHubCIVerified': False,
})
write('targeted-independent-candidate-synthesis-and-open-gates.json', {
    'schemaVersion': 1, 'createdAtUTC': now,
    'chemistryB008': {'authorFreeze': bind(manifests['chemistryB008AuthorV7']),
        'independentA': bind(manifests['chemistryB008IndependentA']),
        'independentB': bind(manifests['chemistryB008IndependentB']),
        'fourCurrentPrototypeDeltasScientificallyAccepted': True,
        'twentyTwoWholeUnchangedPrototypeContinuitiesVerified': True,
        'ownEarlierFindingsResolvedInBoundedScope': True,
        'pending': ['52 substantive material cases and independent review', 'native IDs', 'source/target/route bindings', 'native D/P/A/M/V'],
        'operativeDApproval': False, 'nativePApproval': False, 'strictGain': 0},
    'biologyQ1': {'authorFreeze': bind(manifests['biologyQ1AuthorV5']),
        'independentA': bind(manifests['biologyQ1IndependentA']),
        'independentB': bind(manifests['biologyQ1IndependentB']),
        'fourAffectedMaterialCasesAndMutagenPrototypeScientificallyAccepted': True,
        'twentyWholeCasesUnchanged': True,
        'pending': ['7 source-bounded goal IDs/placements/routes', 'held3417 whole source', 'ST stage/course', 'SH cohort', 'BY EA oncology/PCR', 'native D/P/A/M/V'],
        'operativeApproval': False, 'strictGain': 0},
    'chemistryB007': {'authorFreeze': bind(manifests['chemistryB007AuthorV2']),
        'fiveCompleteCasesChanged': True, 'nineCompleteCasesExact': True,
        'oneRoutineEssentialChanged': True, 'sixWholeRoutinesExact': True,
        'bothPrimaryCardsByteExact': True, 'independentTargetedAAndFreshBPending': True,
        'nativeCardOriginAndVisibilityPending': True, 'strictGain': 0},
    'biologyNeuro': {'sourceAuthorV3Freeze': bind(manifests['biologyNeuroSourceAuthorV3']),
        'outsideSourceWorklistFreeze': bind(manifests['biologyNeuroOutsideSourceWorklist']),
        'twoNWTargetsRestoredInAuthorNativeCandidateOnly': True,
        'independentAAndBPendingAtSynthesisTime': True,
        'original383AtlasStatus': 'FAIL375', 'outsideDistinctGoalIds': 52,
        'outsideLostGoalViewPairs': 187, 'wholeOriginalSourceHolds': 31,
        'wholeOriginalSourceClearance': False, 'restoredActiveBindings': 0, 'strictGain': 0},
    'currentStrict': {'chemistry': {'strict': 112, 'atoms': 378, 'remaining': 266},
                      'biology': {'strict': 67, 'atoms': 383, 'remaining': 316},
                      'mathematics': {'strict': 807, 'atoms': 807, 'M7': True},
                      'physics': {'strict': 478, 'atoms': 478, 'M7': True}},
    'newScientificStrictClosures': 0, 'restoredActiveBindings': 0,
    'humanApproval': False, 'humanTrial': False, 'unboundedGoalComplete': False,
})
write('current-continuation-document-bindings.json', {
    'schemaVersion': 1, 'createdAtUTC': now,
    'files': [bind('docs/qa-ci/chemie-biologie-m7-reviewed-candidate-continuation-2026-10-06.md'),
              bind('docs/qa-ci/index.md'),
              bind('curricula/DE/Gymnasium/quality/deep-understanding-rollout/README.md')],
    'currentRoutingDocumentsMayReceiveFutureContinuationLinks': True,
    'historical383And378ActiveCheckpointArtifactsRemainExact': True,
})
(out / 'README.md').write_text('''# Reviewed candidate continuation verification v2

This receipt verifies the exact current author/independent freezes for B008 v7 and Biology Q1 v5, preserves the earlier review histories and binds their bounded scientific candidate acceptance. Native operative approval and all remaining source/stage/route/card/visual gates stay open. B007 v2 and Neuro v3 are new bounded authors, not approvals.

All 19 current active checkpoint input bytes remain exact. The recorded machine checks therefore continue to describe the same active integration, without claiming a newly run build or GitHub CI. New candidate cases, source components and documentary routing do not count in the central strict intersection.

Current strict coverage remains Chemistry 112/378 and Biology 67/383. Math807/807 and Physics478/478 M7 remain preserved. Strict science gain0 and restored active binding0. Human review, approval, trial and release remain separate. The unbounded goal remains active.
''')
(out / 'verify-reviewed-candidate-continuation.py').write_bytes(Path(__file__).read_bytes())
files = [bind(p) for p in sorted(out.iterdir()) if p.is_file()]
write('reviewed-candidate-continuation.final.freeze.json', {
    'schemaVersion': 1, 'createdAtUTC': now,
    'freezeId': 'chemie-biologie-reviewed-candidate-continuation-verification-v2-20261006',
    'files': files, 'strictChemistry': 112, 'denominatorChemistry': 378,
    'strictBiology': 67, 'denominatorBiology': 383, 'activeInputHashesExact': 19,
    'candidateScientificReviewIsNotOperativeApproval': True,
    'strictCompletionsAdded': 0, 'restoredActiveBindings': 0,
    'humanApproval': False, 'humanTrial': False, 'unboundedGoalComplete': False,
})
print(json.dumps({'freeze': bind(out / 'reviewed-candidate-continuation.final.freeze.json'),
                  'ownFrozenFilesVerified': sum(x['ownFilesVerifiedExactly'] for x in results),
                  'activeCheckpointInputsExact': 19, 'newStrictClosures': 0}))
