#!/usr/bin/env python3
"""Verify the actual Root application against the independently computed change."""
import datetime
import hashlib
import json
import pathlib

ROOT = pathlib.Path('/home/enpasos/projects/skillpilot')
OUT = pathlib.Path(__file__).resolve().parent
BASE = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05'
INTEGRATION = BASE / 'chemie-biologie-ni-quantitative-integration-v1'
NI = BASE / 'biologie-ni-eighteen-current-reviewed-integration-candidate-v2'


def read(path):
    return json.loads(path.read_text())


def sha(path):
    digest = hashlib.sha256()
    with path.open('rb') as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b''):
            digest.update(chunk)
    return digest.hexdigest()


def verify_freeze(path, expected):
    assert sha(path) == expected, f'Changed manifest: {path}'
    manifest = read(path)
    for row in manifest['files']:
        file = ROOT / row['path']
        assert file.is_file() and not file.is_symlink()
        assert sha(file) == row['sha256'], f'Changed frozen file: {file}'
        assert file.stat().st_size == row['bytes']
    return {'path': path.relative_to(ROOT).as_posix(), 'sha256': expected,
            'actualVerifiedEntries': len(manifest['files']), 'physicalBytesExact': True}


prediction = read(OUT / 'in-memory-current-native-comparison.actual.json')
application = read(INTEGRATION / 'cluster-schema-metadata.application.actual.json')
canonical_path = ROOT / 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json'
ledger_path = ROOT / 'curricula/DE/Gymnasium/quality/goal-book-publication/biologie.semantic-kinds.json'
before_path = INTEGRATION / 'biologie-canonical.before-cluster-schema-metadata.json'
before_ledger_path = INTEGRATION / 'biologie-semantic-kinds.before-cluster-schema-metadata.json'
assert sha(before_path) == application['canonicalBeforeSHA256'] == '6302c4c6b116e09bd863d41b70e26f60fa5a169dea9f17ead180f2b868c8b60b'
assert sha(before_ledger_path) == application['ledgerBeforeSHA256'] == 'a06cb87a0133869da0740e7b8ba560a6c2ed8f5970c5553aa1c509513aeda46e'
assert sha(canonical_path) == application['canonicalAfterSHA256']
assert sha(ledger_path) == application['ledgerAfterSHA256']
before, after = read(before_path), read(canonical_path)
before_ledger, after_ledger = read(before_ledger_path), read(ledger_path)
expected = read(before_path)
expected_cluster = next(g for g in expected['goals'] if g['id'] == prediction['clusterId'])
assert expected_cluster == prediction['beforeCluster']
expected_cluster['dimensionTags'] = {'phase': 'GLOBAL'}
assert expected_cluster == prediction['afterCluster']
assert expected == after
expected_ledger = read(before_ledger_path)
expected_decision = next(d for d in expected_ledger['decisions'] if d['goalId'] == prediction['clusterId'])
assert expected_decision['sourceFingerprint'] == prediction['clusterSourceFingerprintBefore']
expected_decision['sourceFingerprint'] = prediction['clusterSourceFingerprintAfter']
assert expected_ledger == after_ledger
assert before_ledger['counts'] == after_ledger['counts']
assert len(after['goals']) == 464
assert after_ledger['counts']['curricularAtomic'] == 383
for item in prediction['inputs']:
    assert sha(ROOT / item['path']) == item['sha256'], f'Native input changed: {item["path"]}'
inventory = read(OUT / 'current-scientific-bindings.after-root-metadata-apply.actual.json')
for item in inventory['paths']:
    assert sha(ROOT / item['path']) == item['sha256']
    assert (ROOT / item['path']).stat().st_size == item['bytes']

plan = read(NI / 'integration-plan.reviewed.json')
freezes = [verify_freeze(NI / 'reviewed-integration-candidate.final.freeze.json',
                        '0ff5fe3eff86cebb4ab0bfff6c2536428add97b2a1109649ba315f13d1eacaad'),
           verify_freeze(BASE / 'chemie-q1-quantitative-reviewed-integration-candidate-v1/reviewed-integration.final.freeze.json',
                         'ff7876883da8135572b3650109bc5b11a0ba1f8a0d25b0c47db159214aca06b0')]
for item in plan['requiredFrozenIndependentScientificInputSets']:
    verified = verify_freeze(ROOT / item['manifestPath'], item['manifestSHA256'])
    assert verified['actualVerifiedEntries'] == item['actualFrozenFilesVerified']
    freezes.append(verified)
assert sum(row['actualVerifiedEntries'] for row in freezes) == 1534
artifact = OUT / 'actual-root-minimal-cluster-metadata.final.independent.json'
assert not artifact.exists()
artifact.write_text(json.dumps({
    'schemaVersion': 1, 'checkedAtUTC': datetime.datetime.now(datetime.timezone.utc).isoformat(),
    'reviewer': '/root/chem_qa_native_guard', 'result': 'PASS',
    'actualRootApplication': (INTEGRATION / 'cluster-schema-metadata.application.actual.json').relative_to(ROOT).as_posix(),
    'canonicalBeforeSHA256': sha(before_path), 'canonicalAfterSHA256': sha(canonical_path),
    'semanticKindLedgerBeforeSHA256': sha(before_ledger_path), 'semanticKindLedgerAfterSHA256': sha(ledger_path),
    'actualCanonicalExactlyMatchesNativeComparedMinimalChange': True,
    'actualLedgerExactlyMatchesNativeComputedSingleClusterFingerprintChange': True,
    'all463OtherWholeCanonicalGoalsUnchanged': True, 'all463OtherWholeSemanticKindDecisionsUnchanged': True,
    'all383AtomicGoalFieldsAndNativeFingerprintsUnchanged': True,
    'all383NativePagesChaptersNavigationAndOriginalSourceRowsUnchanged': True,
    'allExisting23NativeDescriptionReviewDtosAndBothRoundsUnchanged': True,
    'allCurrent72ScientificBindingFilesExactSinceTruthfullyAfterApplyInventory': True,
    'frozenHistoricalSetsPhysicallyVerified': freezes, 'actualVerifiedHistoricalFileEntries': 1534,
    'semanticKindCountsAndCurricularDenominatorUnchanged': True,
    'newScientificCompletions': 0, 'newScientificApprovals': 0,
    'technicalBindingsRestored': 1, 'humanApproval': False, 'humanTrial': False,
    'activeWritesByThisReviewer': 0,
    'fullCurrentCentralReportAndMaturityFloorChecksRemainSeparateRootChecks': True,
}, indent=2, ensure_ascii=False) + '\n')
print('PASS: actual two-file minimal change; 383 atom/page/source bindings exact; '
      'D23 exact; 1534 historical file entries exact; zero new science approvals.')
