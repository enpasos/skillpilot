# SPDX-License-Identifier: Apache-2.0
"""Bind the completed local gates and truthful unfinished M7 boundaries."""
import hashlib
import importlib.util
import json
import subprocess
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path.cwd()
OWN = Path(__file__).resolve().parent
receipt = OWN / 'commit-ready-checkpoint.actual.json'
assert not receipt.exists()


def binding(path):
    return {'path': str(path.relative_to(ROOT)),
            'sha256': hashlib.sha256(path.read_bytes()).hexdigest(),
            'bytes': path.stat().st_size}


def verify_bound_file(record):
    assert binding(ROOT / record['path']) == record, record['path']


labels = [
    'current-central-all-four-stable',
    'current-memory-reports-all',
    'current-chemistry-rollout-freshness',
    'current-visualization-coverage-parity',
    'current-deep-understanding-transition-regressions',
    'current-goal-book-mandatory-source-inputs',
    'current-complete-application-build-after-ordinary-output-restoration-v2',
    'current-goal-book-model-after-current394-publication-v2',
    'current-full-validate-schemas',
    'current-normal-schema-symlink-regressions',
    'current-normal-authored-composition-validation',
    'current-duration-readiness-after-authored-view-integration',
    'current-source-coverage-audit-after-authored-view-integration',
    'current-final-curriculum-status-after-authored-view-integration',
    'current-final-all-nine-maturity-floors',
    'current-final-installed-image-copies-after-build',
    'current-final-ai-transparency-after-build',
    'current-docs-links-after-checkpoint-document',
    'current-docs-index-coverage-after-checkpoint-document',
]
gates = []
for label in labels:
    path = OWN / f'{label}.terminal.actual.json'
    data = json.loads(path.read_text())
    assert data['actualExitCode'] == 0, label
    verify_bound_file(data['stdout'])
    verify_bound_file(data['stderr'])
    gates.append({'check': label, 'actualExitCode': 0, 'terminal': binding(path)})

backend_path = OWN.parent / 'biologie-basis2-reviewed-backend-projection-checkpoint-root-v1' / 'targeted-backend-42-scope-junit-terminal.actual.json'
backend = json.loads(backend_path.read_text())
assert backend['actualExitCode'] == 0
assert {key: backend['junit'][key] for key in ('tests', 'failures', 'errors', 'skipped')} == {
    'tests': 1, 'failures': 0, 'errors': 0, 'skipped': 0}
assert backend['reviewedScopeAssertions']['scopeRows'] == 42
assert backend['reviewedScopeAssertions']['g8G9TotalAtomicCounterAssertions'] == 84
assert backend['reviewedScopeAssertions']['biologyG8G9TargetSetChecks'] == 32

central = json.loads((OWN / 'current-central-all-four-stable.stdout.actual.txt').read_text())
progress = json.loads((OWN / 'current-strict-eighteen-new-closures.actual.json').read_text())
assert central['blockingIssueCount'] == 0
assert progress['netStrictGain'] == len(progress['newScientificClosures']) == 18
status_path = ROOT / 'docs/qa-ci/status/curriculum-quality-status.json'
status = json.loads(status_path.read_text())
expected = {'Biologie': (262, 394, 'M6'), 'Chemie': (177, 378, 'M6'),
            'Mathematik': (807, 807, 'M7'), 'Physik': (478, 478, 'M7')}
canonical_ids = {'08a43a1b-d97e-522c-9dfa-c950a493364e', 'c436b994-8f44-5134-b9f8-0c9f5d6a5ba0',
                 'de0f0a4e-0922-11ee-be56-0242ac120002'}
matched = {}
for curriculum in status['curricula']:
    subject = curriculum.get('subject')
    if subject not in expected:
        continue
    deep = next((rule for rule in curriculum['rules'] if rule['id'] == 'CQR-303'), None)
    if deep is None or deep.get('metrics', {}).get('strictComplete') != expected[subject][0]:
        continue
    metrics = deep['metrics']
    assert (metrics['strictComplete'], metrics['expectedGoals'], curriculum['maturity']) == expected[subject]
    assert metrics['requiredChecksPassed'] == metrics['requiredChecksTotal'] == 6
    assert metrics['blockingIssues'] == 0
    matched[subject] = {'strictComplete': metrics['strictComplete'], 'denominator': metrics['expectedGoals'],
                        'maturity': curriculum['maturity'], 'CQR303': deep['status']}
assert set(matched) == set(expected), matched

index_proof = json.loads((OWN / 'final-staged-index-bytes-and-new-json.actual.json').read_text())
assert index_proof['allStagedFilesEqualExactWorkingBytes']
assert index_proof['editableFileWhitespaceCheckActualExitCode'] == 0
assert index_proof['whitespaceWarningsConfinedToEvidenceArtifacts']
doc_path = ROOT / 'docs/qa-ci/chemie-biologie-m7-chemie177-biologie262-commit-checkpoint-2026-10-08.md'

receipt.write_text(json.dumps({'schemaVersion': 1, 'endedAt': datetime.now(timezone.utc).isoformat(),
    'status': 'local-commit-ready-checkpoint', 'subjects': matched,
    'netScientificClosures': 18, 'bindingOnlyNetClosures': 0, 'biologyDenominatorDelta': 2,
    'currentCentralReport': binding(OWN / 'current-central-all-four-stable.stdout.actual.txt'),
    'currentGeneratedCurriculumStatus': binding(status_path), 'documentation': binding(doc_path),
    'completedOrdinaryGates': gates, 'completedTargetedBackendGate': binding(backend_path),
    'exactStagedBytesProof': binding(OWN / 'final-staged-index-bytes-and-new-json.actual.json'),
    'earlierFailedBuildAndOldModelReadRetainedAsHistory': True,
    'firstBackendInterruptionRetainedAndNotCountedAsPass': True,
    'protectedMaturityFloors': 9, 'mathAndPhysicsM7Retained': True,
    'allPrevious244BiologyStrictIdsRetained': True,
    'inFlightChemistryB008': {'active': False, 'newStrictClosures': 0,
        'currentPairedImageRoles': 15, 'totalImageRoles': 26, 'independentBImageRolesStillOpen': 11,
        'candidateSourceGaps': 38, 'source19CandidatesWritten': 0, 'source19Approvals': 0},
    'goal100PercentReached': False, 'humanApprovalClaim': False, 'humanTrialClaim': False,
    'newGitHubCiStillRequiredAfterCommitAndPush': True,
    'commitPerformed': False, 'pushPerformed': False, 'deploymentPerformed': False,
    'privateDataExported': False, 'validatorOrQualityFloorChanges': False,
}, ensure_ascii=False, indent=2) + '\n')
spec = importlib.util.spec_from_file_location('ordinary_final_validator', ROOT / 'scripts/validate_schemas.py')
validator = importlib.util.module_from_spec(spec)
spec.loader.exec_module(validator)
assert validator.validate_file(receipt, json.loads((ROOT / 'docs/landscape-runtime.schema.json').read_text()))
print(json.dumps({'localCommitReady': True, 'completedOrdinaryGates': len(gates),
    'targetedBackendPassed': True, 'subjects': matched}, ensure_ascii=False))
