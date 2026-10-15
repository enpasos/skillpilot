"""Finite portable seal; run after targeted stock checks and never mutate after."""
import hashlib
import importlib.util
import json
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path
import subprocess

ROOT = Path.cwd().resolve()
OWN = Path(__file__).resolve().parent.parent
DAY = OWN.parent
ORIGINAL = DAY / 'chemie-acid-analytics-ten-current419-successor-fresh-independent-a-20261015-v1'
NATIVE = DAY / 'chemie-acid-analytics-ten-current419-native-preparation-technical-20261015-v1'
AUTHOR = DAY / 'chemie-acid-analytics-ten-current419-bounded-author-remediation-20261015-v1'
SEAL_NAME = 'FILES.finite-native-A-technical.seal.json'


def load(path):
    return json.loads(path.read_text())


def rel(path):
    return path.resolve().relative_to(ROOT).as_posix()


def binding(path):
    data = path.read_bytes()
    return {'path': rel(path), 'sha256': 'sha256:' + hashlib.sha256(data).hexdigest(), 'bytes': len(data)}


def write(name, obj):
    path = OWN / name
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(obj, ensure_ascii=False, indent=2) + '\n')


def rows(path):
    return [json.loads(line) for line in path.read_text().splitlines() if line.strip()]


def verify(ref):
    path = Path(ref['path'])
    if not path.is_absolute():
        path = ROOT / path
    actual = binding(path)
    assert actual['sha256'] == ref['sha256'], (actual, ref)
    if 'bytes' in ref:
        assert actual['bytes'] == ref['bytes'], (actual, ref)
    return actual


def main():
    assert not (OWN / SEAL_NAME).exists(), 'Sealed packages must remain immutable.'
    first = load(ORIGINAL / 'FIRST.independent-scientific-result.json')
    provenance = load(OWN / 'provenance/ORIGINAL-A.provenance-and-field-serialization.json')
    original_seal = load(ORIGINAL / 'FIRST.files.immutable-seal.json')
    external_checks = [verify(ref) for ref in original_seal['files']]
    original_source_checks = load(OWN / 'checks/CHECK.original-FIRST-seal-and-exact-input-bindings.before-serialization.json')
    external_checks += [verify(ref) for ref in original_source_checks['checks']]
    assert (OWN / 'provenance/ORIGINAL-A.scientific-result.exact.json').read_bytes() == (ORIGINAL / 'FIRST.independent-scientific-result.json').read_bytes()
    assert (OWN / 'reuse/current-ten-M-V-and-HH.exact.json').read_bytes() == (NATIVE / 'inputs/current-ten-M-V-whole-records-and-HH-card.exact-reuse.json').read_bytes()
    assert (OWN / 'materials/twenty-complete-DEEN-cases.author.json').read_bytes() == (AUTHOR / 'materials/twenty-complete-DEEN-cases.author.json').read_bytes()

    round_path = OWN / 'native/round-a'
    original_round = NATIVE / 'native-ten-current/round-a'
    assert not list((round_path / 'results').iterdir())
    assert not list((original_round / 'results').iterdir())
    native_copy_checks = []
    for path in sorted(original_round.rglob('*')):
        if path.is_file():
            copied = round_path / path.relative_to(original_round)
            assert copied.read_bytes() == path.read_bytes(), path
            native_copy_checks.append(binding(copied))

    d = rows(OWN / 'D/D10.original-A-native-shaped-UNBOUND.records.jsonl')
    p = rows(OWN / 'P/P10.E1G1.design-only.ai-candidate.records.jsonl')
    a = rows(OWN / 'A/A10.original-A-current-native.records.jsonl')
    first_by_id = {row['goalId']: row for row in first['rows']}
    raw = load(AUTHOR / 'author-profiles.ten.raw.json')
    raw_by_id = {row['goalId']: row for row in raw['profiles']}
    assert len(d) == len(p) == len(a) == 10
    assert [row['goalId'] for row in d] == [row['goalId'] for row in first['rows']]
    for row in d:
        science = first_by_id[row['goalId']]
        assert row['decision'] == science['D'] and row['rationale'] == science['rationaleDe']
    for row in a:
        science = first_by_id[row['goalId']]
        assert row['status'] == science['A'] and row['reason'] == science['rationaleDe']
        assert row['semanticAtomic'] == (True if science['A'] == 'atomic' else None)
    for row in p:
        assert row['profile'] == raw_by_id[row['goalId']]['profile']
        assert row['evidenceLevel'] == 'E1' and row['maximumClaimScope'] == 'G1'
        assert row['status'] == 'needs_human_review' and row['reviewAuthority'] == 'ai_candidate'
        assert row['reviewRunIds'] == [] and row['dissent'] == first['retainedHolds']

    # Invoke only the repository's link-portability function, not its full build
    # or curriculum schema validation entry point. No B outcome is opened.
    spec = importlib.util.spec_from_file_location('native_a_portability', ROOT / 'scripts/validate_schemas.py')
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    symlink_errors = module.curriculum_symlink_errors(ROOT)
    assert not symlink_errors, symlink_errors
    write('checks/CHECK.final-unchanged-source-science-native-copy-and-portability.actual.json', {
        'schemaVersion': 1, 'passed': True,
        'originalSealedFilesAndInputBindingsRechecked': len(external_checks),
        'externalBindings': external_checks,
        'originalScientificResultExactCopy': True,
        'nativeRoundCopyExactFiles': native_copy_checks,
        'originalAndOwnedNativeRoundResultsRemainEmpty': True,
        'DOriginalVotesAndWordsUnchanged': True, 'AOriginalVotesAndWordsUnchanged': True,
        'PRawProfilesUnchangedAndAllTenWarrantedByOriginalFIRST': True,
        'portabilityFunction': 'scripts/validate_schemas.py:curriculum_symlink_errors',
        'curriculumSymlinkErrors': symlink_errors,
        'peerBOutcomesRead': False,
        'strictGain': 0, 'newScientificVotes': 0,
    })
    receipt = {
        'schemaVersion': 1, 'createdAtUTC': datetime.now(timezone.utc).isoformat(),
        'status': 'inactive-technical-P-A-serialization-complete-D-native-run-held',
        'role': 'technical serialization of exact existing original independent A findings',
        'boundCanonicalDenominator': 419,
        'originalScientificSource': binding(ORIGINAL / 'FIRST.independent-scientific-result.json'),
        'originalImmutableSeal': binding(ORIGINAL / 'FIRST.files.immutable-seal.json'),
        'originalScienceCounts': first['counts'],
        'technicalArtifactCounts': {
            'DNativeShapedRows': len(d), 'DSelectableIndependentRoundRecords': 0,
            'DNativeReviewerRunManifestsCreated': 0,
            'PStockV2Records': len(p), 'PNeedsHumanReview': 10, 'PApproved': 0,
            'AStockRecords': len(a), 'AAtomic': 7, 'ADeveloperReviewHolds': 3,
            'existingMExactReused': 10, 'existingVExactReused': 10, 'existingHHKeptCardReused': 1,
            'newMOrVVotes': 0, 'newIndependentScientificReviews': 0,
        },
        'normalTargetedPAndAValidatorsPassed': True,
        'DRecordShapeAndCurrentBindingsPassed': True,
        'DIndependentCampaignValidation': 'expected-technical-hold-missing-original-genuine-reviewer-run',
        'DIndependentCampaignResultsRemainEmpty': True,
        'sourceAndCourseAndAcquisitionAndMinimalityHoldsCleared': 0,
        'retainedHoldsVerbatim': first['retainedHolds'],
        'newScientificVotes': 0, 'newStrictClosures': 0, 'strictGain': 0,
        'actualLearnerOrLaboratoryExecutions': 0,
        'humanApproval': False, 'humanTrial': False, 'activeIntegration': False,
        'centralMeasurementPerformed': False,
        'hostOrPDFOrFullBuildPerformed': False,
        'protectedOtherSubjectsChanged': False,
        'activeCanonicalRegistryLedgerGitCIBackendChanges': False,
        'peerBOutcomesRead': False,
        'stopBoundary': 'No package writes after finite seal. New original reviewer-run work belongs to a separate owned package.',
    }
    write('FINAL.native-A-technical.receipt.json', receipt)
    batch_input = next((round_path / 'batches').glob('*.input.jsonl'))
    selector = {
        'schemaVersion': 1, 'createdAtUTC': receipt['createdAtUTC'],
        'role': receipt['role'], 'status': receipt['status'],
        'goalIds': [row['goalId'] for row in first['rows']],
        'originalScientificResult': receipt['originalScientificSource'],
        'originalImmutableSeal': receipt['originalImmutableSeal'],
        'originalActualReadInventory': provenance['originalActualReadInventory'],
        'originalIndependentCalculations': provenance['originalIndependentCalculations'],
        'originalPeerOutcomesReadBeforeFirst': False,
        'serializationIsFreshIndependentReview': False,
        'originalScientificRoleVerbatim': first['role'],
        'originalReviewerIdentityAndModel': 'not recorded in sealed FIRST; no identity invented',
        'provenance': binding(OWN / 'provenance/ORIGINAL-A.provenance-and-field-serialization.json'),
        'exactScientificWords': binding(OWN / 'provenance/ORIGINAL-A.scientific-result.exact.json'),
        'sourceNativeSelector': provenance['nativeSelector'],
        'sourceAuthorSuccessorSelector': provenance['successorSelector'],
        'currentWholeCanonical': provenance['wholeCanonical'],
        'currentSemanticLedger': provenance['semanticLedger'],
        'completeReviewedRawProfiles': provenance['rawProfiles'],
        'completeReviewedDEENCases': binding(OWN / 'materials/twenty-complete-DEEN-cases.author.json'),
        'D': {
            'nativeShapedUnboundRecords': binding(OWN / 'D/D10.original-A-native-shaped-UNBOUND.records.jsonl'),
            'nativeRoundCopyCampaign': binding(round_path / 'description-review-campaign.json'),
            'nativeRoundCopyInput': binding(round_path / 'description-review-input.json'),
            'nativeRoundCopyBundleManifest': binding(round_path / 'review-bundle-manifest.json'),
            'nativeRoundCopyBatchInput': binding(batch_input),
            'nativeWholeBookModel': load(NATIVE / 'NEUTRAL.exact-ten-current419-native-pages-whole-material-and-profile-review-inputs.json')['nativeBookModel'],
            'nativeOriginalPagesReusedUnchanged': True,
            'nativeIndependentResultsDirectory': rel(round_path / 'results'),
            'nativeIndependentResultsDirectoryIsEmpty': True,
            'nativeIndependentRunManifest': None,
            'stockNativeReviewerAuthorityEstablished': False,
            'nativeRowShapeAndCurrentBindingCheck': binding(OWN / 'checks/CHECK.D10.schema-current-text-and-original-science.actual.json'),
            'expectedTechnicalHold': binding(OWN / 'checks/CHECK.D.native-independent-round-EXPECTED-TECHNICAL-HOLD.actual.json'),
            'originalDecisions': dict(Counter(row['decision'] for row in d)),
        },
        'P': {
            'normalConfig': binding(OWN / 'config/P10.normal-E1G1-ai-candidate.inactive.config.json'),
            'normalRecords': binding(OWN / 'P/P10.E1G1.design-only.ai-candidate.records.jsonl'),
            'normalCandidateSet': binding(OWN / 'P/P10.sealed-A-warranted-candidate-set.json'),
            'stockValidation': binding(OWN / 'checks/CHECK.P10.normal-targeted-commands.actual.json'),
            'counts': {'records': 10, 'needsHumanReview': 10, 'approved': 0},
            'evidenceLevel': 'E1', 'maximumClaimScope': 'G1', 'reviewAuthority': 'ai_candidate',
            'claim': 'Reviewed goal-bound design only; no actual learner or laboratory observation.',
            'originalScientificWarrant': receipt['originalScientificSource'],
        },
        'A': {
            'normalConfig': binding(OWN / 'config/A10.normal-original-A-with-three-holds.inactive.config.json'),
            'normalRecords': binding(OWN / 'A/A10.original-A-current-native.records.jsonl'),
            'stockValidation': binding(OWN / 'checks/CHECK.A10.normal-targeted-command-and-three-holds.actual.json'),
            'counts': {'atomic': 7, 'needsDeveloperReview': 3, 'missing': 0, 'stale': 0},
        },
        'unchangedMAndVAndHHCard': binding(OWN / 'reuse/current-ten-M-V-and-HH.exact.json'),
        'unchangedMVAndHHVerification': binding(OWN / 'checks/CHECK.M10-V10-HH-existing-exact-reuse.actual.json'),
        'sourceSealAndWholeInputHashVerification': binding(OWN / 'checks/CHECK.original-FIRST-seal-and-exact-input-bindings.before-serialization.json'),
        'finalIntegrityCheck': binding(OWN / 'checks/CHECK.final-unchanged-source-science-native-copy-and-portability.actual.json'),
        'retainedHoldsVerbatim': first['retainedHolds'],
        'receipt': binding(OWN / 'FINAL.native-A-technical.receipt.json'),
        'resume': binding(OWN / 'README.neutral-resume.md'),
        'finiteSealPath': rel(OWN / SEAL_NAME),
        'newScientificVotes': 0, 'newStrictClosures': 0, 'strictGain': 0,
        'humanApproval': False, 'humanTrial': False, 'activeIntegration': False,
        'peerBOutcomesRead': False,
        'nextStep': 'Use a separate package to recover a genuine original reviewer run or execute an actual independent native A round with complete evidence. This technical package cannot be counted as independent D.',
    }
    write('NEUTRAL.exact-ten-original-A-native-technical-artifacts-and-holds.json', selector)

    parsed_files = []
    total_jsonl_rows = 0
    for path in sorted(OWN.rglob('*')):
        if not path.is_file():
            continue
        assert not path.is_symlink(), path
        if path.suffix in ('.json', '.jsonl'):
            data = path.read_bytes()
            assert data.endswith(b'\n'), path
            assert b'/home/' not in data and b'file://' not in data, path
            if path.suffix == '.json':
                json.loads(data)
            else:
                count = len(rows(path))
                total_jsonl_rows += count
            parsed_files.append(rel(path))
    write('checks/CHECK.finite-full-JSON-JSONL-newlines-and-portable-paths.actual.json', {
        'schemaVersion': 1, 'passed': True, 'parsedFullFilesBeforeThisCheckAndSeal': parsed_files,
        'jsonlRows': total_jsonl_rows, 'actualNewlineSerialization': True,
        'absoluteLocalPathsInNewJSONOrJSONL': 0,
        'ownPackageSymlinks': 0, 'curriculumSymlinkErrors': [],
        'finiteSealExcludedFromOwnFileList': True,
    })
    seal = {
        'schemaVersion': 1, 'sealedAtUTC': datetime.now(timezone.utc).isoformat(),
        'mustRemainImmutable': True,
        'role': 'finite portable technical serialization; no new independent scientific review',
        'packagePath': rel(OWN),
        'originalScientificSource': receipt['originalScientificSource'],
        'originalImmutableSeal': receipt['originalImmutableSeal'],
        'files': [binding(path) for path in sorted(OWN.rglob('*')) if path.is_file() and path.name != SEAL_NAME],
        'selfExclusion': SEAL_NAME,
        'peerBOutcomesRead': False,
        'newScientificVotes': 0, 'newStrictClosures': 0,
        'DIndependentNativeRunHold': True,
    }
    write(SEAL_NAME, seal)
    parsed_seal = load(OWN / SEAL_NAME)
    for ref in parsed_seal['files']:
        verify(ref)
    result = {'sealedFiles': len(seal['files']), 'DNativeShapedUnbound': 10, 'DIndependentNativeResults': 0,
              'P': 10, 'AAtomic': 7, 'ADeveloperReview': 3, 'strictGain': 0,
              'seal': binding(OWN / SEAL_NAME),
              'selector': binding(OWN / 'NEUTRAL.exact-ten-original-A-native-technical-artifacts-and-holds.json')}
    print(json.dumps(result))


if __name__ == '__main__':
    main()
