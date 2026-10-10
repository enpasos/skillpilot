"""Seal the stable intended commit files and actual successful check results."""
import datetime
import hashlib
import json
import os
import shutil
import subprocess
from pathlib import Path

root = Path('/home/enpasos/projects/skillpilot')
base = root / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10'
own = base / 'chemie180-biologie335-commit-checkpoint-technical-root-v1'
document = root / 'docs/qa-ci/chemie-biologie-m7-chemie180-biologie335-commit-checkpoint-2026-10-10.md'
final = own / 'COMMIT-READY.current335.actual.json'
freeze = own / 'FINAL.commit-ready.current335.technical.freeze.json'
manifest = own / 'FINAL.prospective-content-and-candidate-files.actual.json'
assert not any(p.exists() for p in [final, freeze, manifest])

def bind(path):
    data = os.fsencode(os.readlink(path)) if path.is_symlink() else path.read_bytes()
    return {'path': path.relative_to(root).as_posix(), 'sha256': 'sha256:' + hashlib.sha256(data).hexdigest(), 'bytes': len(data)}

def verify(binding):
    actual = bind(root / binding['path'])
    assert actual['bytes'] == binding['bytes'], binding['path']
    assert actual['sha256'].removeprefix('sha256:') == binding['sha256'].removeprefix('sha256:'), binding['path']

source_path = own / 'final-complete-prospective-file-set.syntax-and-normal-portability.actual.json'
source = json.loads(source_path.read_text())
assert not source['issues']
bindings = source['changedOrNewApplicationContentAndCandidateFiles']
doc_path = document.relative_to(root).as_posix()
doc_before = next(b for b in bindings if b['path'] == doc_path)
doc_after = bind(document)
for binding in bindings:
    if binding['path'] == doc_path:
        binding.update(doc_after)
    verify(binding)
manifest_value = {
    'schemaVersion': 1,
    'createdAt': datetime.datetime.now(datetime.timezone.utc).isoformat(),
    'role': 'Final byte-exact intended content and candidate file set, with the latest observed CI count in the checkpoint document',
    'normalSyntaxAndPortableLinkInspection': bind(source_path),
    'files': bindings,
    'fileCount': len(bindings),
    'technicalCheckpointSelfFilesExcludedAndSealedSeparately': own.relative_to(root).as_posix(),
    'documentationOnlyUpdateAfterInspection': {'before': {k: v for k, v in doc_before.items() if k in ['path', 'sha256', 'bytes']}, 'after': doc_after, 'reason': 'Latest actual committed-main CI changed from 27 to 28 successful checks; no content or candidate mutation'},
    'allOtherFileBindingsExact': True,
    'sourceInputsIncluded': True,
    'scientificApprovalInferred': False,
}
manifest.write_text(json.dumps(manifest_value, ensure_ascii=False, indent=2) + '\n')

labels = ['publication-and-applicability', 'goal-book-model-source-portability', 'composition-views', 'composition-projection-roles', 'backend-current-publication-and-canonical-projections', 'source-inventory', 'repository-source-availability', 'docs-links-corrected', 'docs-indexes-corrected', 'final-stable-whole-schema', 'final-file-set-normal-portable-links', 'final-git-diff-check']
terminals = []
for label in labels:
    p = own / 'checks' / (label + '.terminal.actual.json')
    x = json.loads(p.read_text())
    assert x['exitCode'] == 0, label
    terminals.append({'label': label, 'terminal': bind(p), 'command': x['command'], 'exitCode': 0, 'durationSeconds': x['durationSeconds'], 'stdout': bind(root / x['stdoutPath']), 'stderr': bind(root / x['stderrPath'])})
assert 'Checked 57483 files.' in (own / 'checks/final-stable-whole-schema.stdout.actual.txt').read_text()
assert json.loads((own / 'checks/backend-current-publication-and-canonical-projections.junit-counts.actual.json').read_text())['totalTests'] == 59

stable = base / 'biologie-sek1-insect-eight-reviewed-active-adoption-technical-root-v1/FINAL.stable-current335.technical.freeze.json'
for binding in json.loads(stable.read_text())['files']:
    verify(binding)
proof = json.loads((base / 'biologie-sek1-insect-eight-reviewed-active-adoption-technical-root-v1/current335-exact-strict-ID-gain-and-protected-subjects.actual.json').read_text())
subjects = {s['subject']: s for s in proof['subjects']}
assert subjects['biologie']['strictComplete'] == 335 and subjects['chemie']['strictComplete'] == 180
assert subjects['mathematik']['strictComplete'] == 807 and subjects['physik']['strictComplete'] == 478

candidates = [
    ('chemistryRoutePartial', base / 'chemie-b008-whole22-targeted-current-route-author-checkpoint-20261010-v1/author-checkpoint.final.freeze.json', 'files'),
    ('biologyWhole8Author', base / 'biologie-stoffwechsel-eight-whole-material-and-raster-author-candidate-v1/author.checkpoint.final.freeze.json', 'ownFiles'),
    ('biologyNativePending', base / 'biologie-stoffwechsel-eight-current335-native-preparation-pending-technical-20261010-v1/FINAL.current335-before-only-Stoffwechsel8-pending.technical.freeze.json', 'ownFiles'),
]
candidate_bindings = []
for role, path, key in candidates:
    value = json.loads(path.read_text())
    actual_key = key if key in value else ('files' if 'files' in value else 'ownFiles')
    assert actual_key in value, list(value)
    for binding in value[actual_key]:
        verify(binding)
    candidate_bindings.append({'role': role, 'freeze': bind(path), 'verifiedFrozenOwnFiles': len(value[actual_key]), 'active': False, 'strictGain': 0, 'independentQAComplete': False})

ci_path = own / 'checks/main-CI-final-committed-head.actual.json'
ci = json.loads(ci_path.read_text())
head = subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=root, text=True).strip()
assert head == source['baseCommit'] == ci['headSha']
assert ci['success'] == 28 and ci['skipped'] == 1 and ci['failed'] == ci['pending'] == 0

technical = own / 'technical'
technical.mkdir(exist_ok=True)
for name in ['run_commit_checkpoint_command.py', 'inspect_commit_checkpoint_files.py', 'seal_commit_checkpoint_current335.py']:
    target = technical / name
    assert not target.exists()
    shutil.copyfile(root / 'tmp/m7-resumption-20261010' / name, target)

result = {
    'schemaVersion': 1,
    'completedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(),
    'role': 'Stable commit-ready technical checkpoint; actual selected checks, complete file closure and openly inactive candidates',
    'baseCommit': head,
    'finalPlannedContentAndCandidateFileManifest': bind(manifest),
    'successfulNormalTerminals': terminals,
    'successfulNormalTerminalCount': len(terminals),
    'activeCurrent335IntegrationSeal': bind(stable),
    'actualStrictProgress': {name: {k: s[k] for k in ['denominator', 'strictComplete', 'percentage', 'remaining']} for name, s in subjects.items()},
    'newScientificChemistryClosuresSinceHEAD': 3,
    'newScientificBiologyClosuresSinceHEAD': 20,
    'strictNetGainSinceHEAD': 23,
    'restoredPriorStrictBindingsCountedAsGain': 0,
    'lostPriorStrictIDs': 0,
    'separateChemistryNativeContextRebindingsNotNewScientificClosures': 3,
    'protectedMathAndPhysicsM7AndNineMaturityFloorsRetained': True,
    'schemas': {'fullNormalCheckPassed': True, 'actualFilesChecked': 57483},
    'ownNewFinalMetadataJSONValidationRequiredSeparately': True,
    'backendSelectedTestsPassed': 59,
    'allFiveGoalBooksVerified': True,
    'frozenInactiveCandidatePackages': candidate_bindings,
    'allPackageWritersStopped': True,
    'currentCommittedMainCI': bind(ci_path),
    'remoteResultsCoverUncommittedWorktree': False,
    'initialFailedAndCorrectedTechnicalChecksRetained': ['docs-links', 'docs-indexes', 'final-complete-file-syntax-portability'],
    'productCheckersSchemasAndQualityLimitsChangedForThisCheckpoint': False,
    'humanApproval': False,
    'humanTrial': False,
    'actualLearnerEvidence': False,
    'separateHumanReleaseGatesRetained': True,
    'goal100PercentComplete': False,
    'realGitIndexModifiedByRoot': False,
    'committedOrPushedByRoot': False,
    'document': bind(document),
}
final.write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n')
own_files = [bind(p) for p in sorted(own.rglob('*')) if p.is_file()]
seal_value = {'schemaVersion': 1, 'sealedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'role': 'Immutable commit checkpoint evidence; frozen own results plus all planned content files', 'ownFiles': own_files, 'contentAndCandidateManifest': bind(manifest), 'document': bind(document), 'commitReadyResult': bind(final), 'goal100PercentComplete': False, 'humanApproval': False}
freeze.write_text(json.dumps(seal_value, ensure_ascii=False, indent=2) + '\n')
for binding in own_files:
    verify(binding)
print(json.dumps({'commitReady': bind(final), 'freeze': bind(freeze), 'plannedContentFiles': len(bindings), 'ownEvidenceFiles': len(own_files), 'schemaFiles': 57483, 'normalSuccessfulChecks': len(terminals), 'strictChemistry': 180, 'strictBiology': 335, 'newScientificClosuresSinceHEAD': 23, 'humanApproval': False, 'committedOrPushed': False}))
