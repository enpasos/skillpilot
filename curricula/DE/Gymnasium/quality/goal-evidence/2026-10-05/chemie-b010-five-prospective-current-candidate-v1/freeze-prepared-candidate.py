#!/usr/bin/env python3
"""Apache-2.0: freeze the already prepared inactive author package."""
import datetime
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[7]
OWN = Path(__file__).resolve().parent
BASE = OWN.parent
ISO = ROOT / 'tmp/chemie-b010-five-native-isolated-20261005-v1'
FREEZE = OWN / 'prepared.freeze.manifest.json'
SHA_FILE = OWN / 'prepared.freeze.manifest.sha256'

def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def clean(value):
    return value.removeprefix('sha256:')

def write(path, value):
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')

assert ROOT.name == 'skillpilot', ROOT
assert not FREEZE.exists() and not SHA_FILE.exists(), 'Never overwrite a freeze'
prior_specs = [
    ('chemie-b010-seven-source-hold-remediation-candidate-v1', 'author-remediation.freeze.manifest.json', '3291d5cb9e27792ae823b2ac2cfe4ca6fbf8575b9b32b13a3445318812d9fbed', 'files', 39),
    ('chemie-b014-five-prospective-book-current-v1', 'prepared.freeze.manifest.json', '11ceb8d594d934bbe02733bc6cb3c83767309c0e2ffa0c22daf806b41508f70c', 'ownFiles', 159),
    ('chemie-b014-five-current-independent-d-b-v1', 'independent-d-b.freeze.json', 'a60832332ce2a20775d02cfea4c3d679439408ee5961c8c5cedb113093c869ec', 'files', 34),
    ('chemie-b014-five-current-independent-p-b-v1', 'independent-p-b.freeze.json', 'ed8fc82391fa35aa656dabd29c37c3763033219abe5ee4eecf840b06cbfe9db2', 'files', 14),
    ('chemie-b014-five-current-positive-candidate-v1', 'author-candidate.freeze.json', '72ab980238255764cf9832ef00cd04d26d9ca93223b773cc1eda09dd50ade9db', 'files', 10),
]
prior = []
for directory, name, expected, key, count in prior_specs:
    manifest = BASE / directory / name
    assert digest(manifest) == expected, manifest
    rows = json.loads(manifest.read_text())[key]
    assert len(rows) == count, (manifest, len(rows))
    mismatches = [r['path'] for r in rows if digest(ROOT / r['path']) != clean(r['sha256'])]
    assert not mismatches, mismatches
    prior.append({'manifestPath': str(manifest.relative_to(ROOT)), 'manifestSHA256': expected,
                  'verifiedFileCount': count, 'mismatches': []})
b014_receipt = BASE / 'chemie-b014-five-prospective-book-current-v1/prepared-prospective-input-tree.receipt.json'
b014_rows = json.loads(b014_receipt.read_text())['files']
assert len(b014_rows) == 69
for row in b014_rows:
    assert digest(ROOT / row['prospectiveCopyPath']) == clean(row['sha256']), row
    assert digest(ROOT / row['futureActivePath']) == clean(row['sha256']), row
write(OWN / 'prior-frozen-evidence-preservation.actual.receipt.json', {
    'status': 'PASS_exact_original_frozen_bytes_preserved', 'checkedAtUTC': datetime.datetime.now(datetime.timezone.utc).isoformat(),
    'manifests': prior, 'B014OriginalFutureCopiesVerified': 69, 'B014ActiveFuture69Exact': True,
    'mismatches': [], 'humanApproval': False, 'activeWrites': 0})

future = json.loads((OWN / 'prepared-prospective-input-tree.receipt.json').read_text())
assert future['fileCount'] == len(future['files']) == 16
assert sum(r['bytes'] for r in future['files']) == future['totalBytes'] == 15134315
for row in future['files']:
    exported = ROOT / row['prospectiveCopyPath']
    assert exported.is_file() and not exported.is_symlink(), exported
    assert digest(exported) == clean(row['sha256']), exported
    assert digest(ISO / row['futureActivePath']) == clean(row['sha256']), row
    active = ROOT / row['futureActivePath']
    before = row['activeSHA256Before']
    assert (digest(active) if active.exists() else None) == before, active
for row in future['plannedInputsUnchanged']:
    assert digest(ROOT / row['futureActivePath']) == clean(row['sha256']), row
assert len(future['plannedInputsUnchanged']) == 49

terminal = json.loads((OWN / 'native-preparation-terminal.receipt.json').read_text())
assert terminal['nativeNinePrepareObservedExitCode'] == 0
assert all(r['actualExitCode'] == 0 for r in terminal['commands'])
excluded = []
for round_name in ['round-a', 'round-b']:
    result_dir = OWN / 'native-finalbook' / round_name / 'results'
    assert result_dir.is_dir() and not any(result_dir.iterdir()), result_dir
    campaign = json.loads((result_dir.parent / 'description-review-campaign.json').read_text())
    assert campaign['goalCount'] == 9
    excluded.append(str(result_dir.relative_to(ROOT)))
viewed = json.loads((OWN / 'actual-nine-PDF-and-HTML-viewed.receipt.json').read_text())
assert len(viewed['rows']) == 9
assert all(r['PDFActuallyViewed'] and r['HTMLActuallyViewed'] for r in viewed['rows'])
profiles = [json.loads(line) for line in (OWN / 'positive-evidence.review.jsonl').read_text().splitlines() if line.strip()]
assert len(profiles) == 5
assert all(r['status'] == 'needs_human_review' for r in profiles)

files = []
for path in sorted(OWN.rglob('*')):
    if not path.is_file() or path in (FREEZE, SHA_FILE):
        continue
    assert not path.is_symlink(), path
    rel = str(path.relative_to(ROOT))
    assert not any(rel.startswith(directory + '/') for directory in excluded), path
    files.append({'path': rel, 'sha256': digest(path), 'bytes': path.stat().st_size})
manifest = {
    'schemaVersion': 1, 'status': 'inactive_exact_prepared_author_candidate',
    'authority': 'informed_ai_author_candidate', 'frozenAtUTC': datetime.datetime.now(datetime.timezone.utc).isoformat(),
    'ownFiles': files, 'fileCount': len(files), 'exactFutureChangedInputs': future['files'],
    'exactFutureChangedInputCount': 16, 'exactFutureChangedInputBytes': 15134315,
    'exactUnchangedPlannedInputs': future['plannedInputsUnchanged'], 'unchangedPlannedInputCount': 49,
    'nativeModelDigest': terminal['nativeModelDigest'], 'nativeBundleFingerprint': terminal['bundleFingerprint'],
    'nativeReviewInputFingerprint': terminal['reviewInputFingerprint'],
    'newScientificCandidateGoalIds': future['fiveNewScientificGoalIds'],
    'existingTargetedBindingGoalIds': future['fourExistingBindingGoalIds'],
    'curricularAtomicDenominator': 376, 'newAtomicGoalIds': [],
    'nativeNinePrepareAndCheckActualExit': 0, 'nativeP5CheckActualExit': 0,
    'nativeCurrentFullM376CheckActualExit': 0, 'other371MRawLinesPreserved': True,
    'allCurrentStrictPageComparisonCount': 85, 'affectedExistingStrictBindings': 4,
    'allCurrentStrictComparatorActualExit': 1,
    'allCurrentStrictComparatorStatus': 'HOLD_authoritative_stored_d726_image_page_not_current',
    'd726AcceptedCurrentPNGComparedInActualBeforeAndAfter': True,
    'd726StoredPhysicalDPageGapClosed': False,
    'nativeD2ResultDirectoriesEmpty': True, 'reviewerResultsAndNewRunManifestsExcludedFromPreparedInputFreeze': excluded,
    'positiveProfilesCandidateOnly': 5,
    'positiveProfileBindings': [{'goalId': r['goalId'], 'profileFingerprint': r['profileFingerprint'],
                                 'status': r['status'], 'reviewAuthority': r['reviewAuthority']} for r in profiles],
    'independentFinalDReviewsPending': True, 'independentPositiveSemanticReviewsPending': True,
    'fourUnchangedImageCandidateBindingsIndependentVReviewPending': True,
    'residualSourceOperatorHOLD': 'HE9.2#B02A03 hydrogen-halogen / HCl synthesis',
    'splitCompanionGoalsRemainHOLD': ['72236f2c-771e-4ab6-933a-e549ee49d15b', 'e0e201bd-a1fd-5985-ab08-fd24c8655f3d'],
    'strictClosuresActual': 0, 'scientificClosuresActual': 0, 'restoredBindingsActual': 0,
    'humanApproval': False, 'realLearnerOrLaboratoryPerformanceObserved': False,
    'activeCanonRegistryQALedgerWrites': 0,
    'selfHashPolicy': 'Manifest and SHA sidecar excluded from ownFiles; all prepared input files are covered.'
}
write(FREEZE, manifest)
sha = digest(FREEZE)
SHA_FILE.write_text(sha + '  ' + FREEZE.name + '\n')
for row in manifest['ownFiles']:
    assert digest(ROOT / row['path']) == row['sha256'], row['path']
print(json.dumps({'freezePath': str(FREEZE.relative_to(ROOT)), 'freezeSHA256': sha,
                  'ownFileCount': len(files), 'futureChangedInputCount': 16, 'futureBytes': 15134315,
                  'futureReceiptSHA256': digest(OWN / 'prepared-prospective-input-tree.receipt.json'),
                  'modelDigest': terminal['nativeModelDigest'], 'bundleFingerprint': terminal['bundleFingerprint'],
                  'priorFrozenFilesAndFuture69Exact': True, 'D2Empty': True}, ensure_ascii=False))
