#!/usr/bin/env python3
"""Seal only this owned, append-only technical candidate namespace."""
import datetime
import hashlib
import importlib.util
import json
import pathlib
import subprocess

ROOT = pathlib.Path.cwd()
P = pathlib.Path(__file__).resolve().parent.relative_to(ROOT)
A = pathlib.Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/biologie-health-sexuality-addiction-twelve-whole-material-raster-source-author-candidate-v1')
ENTRY = P / 'neutral-current353-native-twelve-health.entry.json'
FREEZE = P / 'FINAL.current353-normal-P12-native12-source186.technical.freeze.json'
assert not ENTRY.exists() and not FREEZE.exists(), 'Never overwrite a sealed entry or freeze'

def read(p):
    return json.loads(pathlib.Path(p).read_text())

def binding(p):
    p = pathlib.Path(p)
    assert p.is_file() and not p.is_symlink(), str(p)
    b = p.read_bytes()
    return {'path': str(p), 'sha256': 'sha256:' + hashlib.sha256(b).hexdigest(), 'bytes': len(b)}

def write(p, j):
    pathlib.Path(p).write_text(json.dumps(j, ensure_ascii=False, indent=2) + '\n')

ae = read(A / 'neutral-health-sexuality-addiction-twelve.author-candidate.entry.json')
af = read(A / 'FINAL.health-sexuality-addiction-twelve.author-candidate.freeze.json')
for b in af['ownBindings'] + af['externalBindings']:
    assert binding(b['path']) == b, 'Frozen AUTHOR bytes changed: ' + b['path']

baseline = {
    'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json': 'e803f423ef74b1c7618d72da2170e1e2686a3529a50785caa382053813fc3bfe',
    'curricula/DE/Gymnasium/quality/goal-visualization-qa/biologie.qa.json': '27504e7592b6102d7d8cee698acafa32c4d584f15727733a810cc39bcc190126',
    'curricula/DE/Gymnasium/quality/goal-book-publication/biologie.semantic-kinds.json': 'e614517680f6e5eb5ed03f334fbbd9d153f6d1dddd9f0aa23f0c6387b3aec177',
}
for path, sha in baseline.items():
    assert binding(path)['sha256'] == 'sha256:' + sha, 'Root current baseline changed: ' + path

def own(rel):
    return binding(P / rel)

entry = {
    'schemaVersion': 1,
    'role': 'Neutral current353 whole-twelve source/raster/P/native technical preparation; preparer is AUTHOR, never independent reviewer',
    'createdAt': datetime.datetime.now(datetime.timezone.utc).isoformat(),
    'subject': 'biologie', 'goalIds': ae['goalIds'],
    'currentCanonicalGoals': 479, 'currentCurricularAtomicGoals': 394, 'protectedStrictCurrentGoalIds': 353,
    'authorEntry': binding(A / 'neutral-health-sexuality-addiction-twelve.author-candidate.entry.json'),
    'authorFreeze': binding(A / 'FINAL.health-sexuality-addiction-twelve.author-candidate.freeze.json'),
    'wholeDeEnGoals': ae['wholeGoalInput'], 'wholeDeEnMaterialsAnd24Cases': ae['materials'],
    'wholeProfiles': 12, 'wholeDeEnCases': 24, 'expectations': 36,
    'atomicityAndMemoryAuthorCandidates': 12,
    'currentInactiveWholeCanonical': own('candidate/current479-only-twelve-resourceLinks.inactive.json'),
    'currentInactiveKinds': own('candidate/current394-kinds.path-only.json'),
    'currentInactiveQa': own('candidate/current394-QA-plus-twelve-pending.inactive.json'),
    'protectedIds': own('inputs/current353-protected.ids.json'),
    'actualRasterOriginal360680': own('inputs/twelve-current-raster-bindings.neutral.json'),
    'selectedOriginalRasterCount': 12, 'actualOriginalPixels': [1672, 941], 'proportionalViewCount': 24,
    'normalP12Config': own('positive/twelve-current-raster.P.pending.config.json'),
    'normalP12Review': own('positive/twelve-current-raster.P.pending.review.jsonl'),
    'normalP12MaterializeReproduceCheckExit0': True,
    'positiveEvidenceState': {'status': 'needs_human_review', 'reviewAuthority': 'ai_candidate', 'evidenceLevel': 'E1', 'maximumClaimScope': 'G1', 'approved': 0},
    'original187WholeWitnesses': own('sources/original187-whole-witnesses.history.exact.json'),
    'current186WholeWitnessesAndActualPrimaries': own('sources/current186-whole-direct-witnesses-and-selected-actual-primaries.neutral.json'),
    'actualOperatorPrimaryDocuments': 17,
    'current31AdditiveSourceMergeAndPreservation': own('sources/actual-current31-additive-merge-and-preservation.json'),
    'normalCurrentSourceAtlasConfig': own('sources/after394-atlas.current-summary.normal.config.json'),
    'normalRawSourceReceipt': own('sources/after-raw-normal-output/source-projection.final-summary.receipt.json'),
    'portableNormalSourceAtlas': own('sources/after-portable-normal-atlas.sources.json'),
    'actualSource24AndProtected353Proof': own('checks/actual-final-normal-source24-membership-and-protected353-witnesses.json'),
    'actualSourceDelta': {'threeSelectedHeExactToPartial': True, 'unsupportedSlVegetativeHumanPairRemoved': 1, 'old31PairAndRootByV5HeSixDecisionsPreservedExceptNamedDeltas': True, 'newWholeCourseApproval': False},
    'currentWhole394BeforeModel': own('native/current394-before.actual-normal-model.json'),
    'currentWhole394AfterModel': own('native/current394-after.actual-normal-model.json'),
    'affectedClosure': own('checks/actual-whole394-twelve-page-closure-and-protected353.json'),
    'affectedPageCount': 12, 'additionalNeighborContextCount': 0, 'exactOtherWholePages': 382, 'exactProtectedWholePages': 353,
    'normalNativeBatchConfig': own('native/twelve-current-prerequisite-safe.batch.config.json'),
    'normalNativeBatchManifest': own('native/twelve-current-native/batch-manifest.json'),
    'actualWholeHtml': own('native/twelve-current-native/bundle/book.html'),
    'actualWholePdf': own('native/twelve-current-native/bundle/book.pdf'),
    'actualWholeNativeModel': own('native/twelve-current-native/bundle/book-model.json'),
    'actualCurrentReviewInput': own('native/twelve-current-native/bundle/review-input.json'),
    'actualHtmlCaptures': own('checks/native-twelve-html-captures.actual.json'),
    'actualPdfCaptures': own('checks/native-twelve-pdf-captures.actual.json'),
    'actualWholeHtmlPageCaptures': 12, 'actualWholePdfPageCaptures': 12, 'actualPhysicalPdfPages': 14,
    'normalNativePrepareCheckExit0': True,
    'roundA': own('native/twelve-current-native/round-a/description-review-campaign.json'),
    'roundB': own('native/twelve-current-native/round-b/description-review-campaign.json'),
    'actualEmptyCampaignProof': own('checks/actual-two-normal-empty-review-campaigns.json'),
    'portableOriginalLinkedHtml': own('native/portable-current-rasters/bundle/book.html'),
    'actual569PortableInputBindings': own('inputs/all-current-portable-external-bindings.neutral.json'),
    'logicalAliasesDiagnosticOnly': True, 'noIgnoredAliasOrSymlinkPortableDependency': True,
    'readme': own('README.technical-neutral-handoff.md'),
    'targetedNormalSchemaProofPath': str(P / 'checks/FINAL.targeted-normal-schema-and-committability.actual.json'),
    'freezePath': str(FREEZE),
    'requiredIndependentWholeReviews': ['A: entire science/material/source/actual rasters/current native HTML-PDF and contexts', 'B: entire science/material/source/actual rasters/current native HTML-PDF and contexts'],
    'D': 'PENDING independent review', 'P': 'PENDING independent substantive review',
    'A': 'AUTHOR candidate only', 'M': 'AUTHOR candidate only', 'V': 'PENDING independent actual raster review', 'SOURCE': 'PENDING independent operators and partial-scope review',
    'approved': 0, 'strictGain': 0, 'newScientificStrictClosures': 0,
    'restoredOperativeBindings': 0, 'activeIntegration': False,
    'humanApproval': False, 'humanTrial': False, 'wholeCourseSourceApproval': False,
    'protectedMathPhysicsM7': True,
    'contentLicense': 'CC-BY-4.0', 'technicalLicense': 'Apache-2.0',
}
write(ENTRY, entry)

external = {}
for b in af['ownBindings'] + af['externalBindings'] + [binding(A / 'FINAL.health-sexuality-addiction-twelve.author-candidate.freeze.json')]:
    external[b['path']] = b
for r in read(P / 'inputs/all-current-portable-external-bindings.neutral.json')['records']:
    b = r['actualRegularPortableBinding']
    if not b['path'].startswith(str(P) + '/'):
        if b['path'] in external:
            assert external[b['path']] == b
        external[b['path']] = b
for path, b in external.items():
    assert binding(path) == b, 'Portable bytes changed: ' + path

files = sorted(x for x in P.rglob('*') if x.is_file())
all_paths = [str(x) for x in files] + list(external)
proc = subprocess.run(['git', 'check-ignore', '--stdin'], input='\n'.join(all_paths) + '\n', text=True, capture_output=True)
assert proc.returncode in [0, 1] and not proc.stdout.strip(), 'Ignored dependency: ' + proc.stdout
assert all(not pathlib.Path(x).is_symlink() for x in all_paths)
spec = importlib.util.spec_from_file_location('normal_validate_schemas', ROOT / 'scripts/validate_schemas.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
schema = read(ROOT / 'docs/landscape-runtime.schema.json')
json_files = [x for x in files if x.suffix == '.json']
assert all(module.validate_file(str(x), schema) for x in json_files)
proof = {
    'schemaVersion': 1, 'actualNormalFunction': 'scripts/validate_schemas.py:validate_file',
    'ownJsonCheckedBeforeThisProofAndFreeze': len(json_files), 'allPassed': True,
    'ownRegularCommittableFilesBeforeThisProofAndFreeze': len(files), 'externalRegularCommittableBindings': len(external),
    'symlinkDependencyCount': 0, 'ignoredDependencyCount': 0, 'allExternalActualSha256Verified': True,
    'rootCurrent353CanQaKindsStillExact': True, 'authorFreezeStillExact': True,
    'normalP12Exit0': True, 'normalNative12Exit0': True, 'normalSource394Views24Unresolved0': True,
    'affectedPages12Protected353Other382Exact': True, 'independentReviewCompleted': False,
    'approved': 0, 'strictGain': 0, 'humanApproval': False,
}
proof_path = P / 'checks/FINAL.targeted-normal-schema-and-committability.actual.json'
write(proof_path, proof)
assert module.validate_file(str(proof_path), schema)
own_bindings = [binding(x) for x in sorted(x for x in P.rglob('*') if x.is_file())]
freeze = {
    'schemaVersion': 1, 'freezeRole': 'Neutral current353 ordinary P12/native12/source186 technical candidate, AUTHOR-owned preparation, no independent approval',
    'frozenAt': datetime.datetime.now(datetime.timezone.utc).isoformat(),
    'neutralEntry': binding(ENTRY), 'ownBindings': own_bindings,
    'externalBindings': sorted(external.values(), key=lambda b: b['path']),
    'ownBindingCount': len(own_bindings), 'externalBindingCount': len(external),
    'normalInputBindingCount': 569, 'allRegularAndCommittable': True,
    'ignoredOrSymlinkDependencyCount': 0, 'approved': 0, 'strictGain': 0,
    'status': 'needs_human_review', 'reviewAuthority': 'ai_candidate', 'evidenceLevel': 'E1', 'maximumClaimScope': 'G1',
    'humanApproval': False, 'humanTrial': False, 'independentReviews': 'PENDING: both generated campaigns have empty results',
    'activeCanonicalRegistrySourceQaReportsChanged': False, 'protected353AndMathPhysicsFloorsPreserved': True,
}
write(FREEZE, freeze)
assert module.validate_file(str(FREEZE), schema)
assert subprocess.run(['git', 'check-ignore', str(FREEZE)], capture_output=True).returncode == 1
for b in own_bindings + list(external.values()):
    assert binding(b['path']) == b
print(json.dumps({'entry': binding(ENTRY), 'freeze': binding(FREEZE), 'own': len(own_bindings), 'external': len(external), 'normalBindingRecords': 569, 'approved': 0, 'strictGain': 0}, indent=2))
