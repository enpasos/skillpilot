# SPDX-License-Identifier: Apache-2.0
"""Package honest completed image judgments; never integrate active records."""
from datetime import datetime, timezone
import hashlib
import importlib.util
import json
from pathlib import Path
import subprocess

ROOT = Path.cwd()
OWN = Path(__file__).resolve().parent
BASE = OWN.parent
AUTHOR = BASE / 'chemie-q3-three-BW-practical-companion-rasters-author-candidate-v1'
SUCCESSOR = BASE / 'chemie-q3-three-BW-practical-companion-raster-device-metadata-author-successor-v2'


def load(p):
    return json.loads(p.read_text())


def binding(p):
    raw = p.read_bytes()
    return {'path': str(p.relative_to(ROOT)),
            'sha256': hashlib.sha256(raw).hexdigest(), 'bytes': len(raw)}


def write(name, value):
    p = OWN / name
    assert not p.exists(), p
    p.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')
    load(p)
    return p


pixel_path = OWN / 'three-actual-rasters.independent-b.pixel-FIRST.verdict.json'
metadata_path = OWN / 'three-actual-rasters.independent-b.metadata-targeted-FIRST.verdict.json'
technical_path = OWN / 'actual-targeted-metadata-word-deltas-schema-and-portability.independent-b.json'
pixel, metadata, technical = map(load, [pixel_path, metadata_path, technical_path])
actual_meta_path = SUCCESSOR / 'candidate/three-selected-assets-and-accessible-metadata.device-word-only.successor.json'
actual_meta = load(actual_meta_path)
terminal_path = OWN / 'metadata-schema-portability-correct-actual-request-successor-v2.terminal.actual.json'
assert load(terminal_path)['actualExitCode'] == 0
assert binding(pixel_path)['sha256'] == 'a6fd4c57469220e88ecb7d088715093aae47a5dc1444e86bd2285288d61bc82a'
assert binding(metadata_path)['sha256'] == 'dafef23d0074e59939ce0dc26fc4c09fe32a23bff5db0f84a6d61e4f6dcb398d'

decisions = []
for row in actual_meta['rows']:
    gid = row['goalId']
    own_pixel = next(j for j in pixel['judgments'] if j['goalId'] == gid)
    own_metadata = next(j for j in metadata['judgments'] if j['goalId'] == gid)
    decisions.append({
        'goalId': gid, 'decision': 'KEEP',
        'authority': 'independent_machine_visual_review_candidate',
        'asset': row['selectedPNG'], 'display360': row['display360'],
        'display680': row['display680'],
        'wholeGoalBodies': next(j['wholeGoalTextsAndSemanticContext'] for j in pixel['wholeGoalBodiesRead'] if j['goalId'] == gid),
        'actualPixelJudgment': own_pixel, 'actualMetadataJudgment': own_metadata,
        'wholeFinalAltTextDe': row['altTextDe'], 'wholeFinalCaptionDe': row['captionDe'],
        'actualRawGeneratorRequestHistory': [j for j in technical['sixActualAuthorGenerationRequestsBound']
                                            if load(ROOT / j['trace']['path'])['goalId'] == gid],
        'storedVersusTransmittedPromptDifferences': [j for j in technical['storedVersusActualTransmittedPromptRepresentationDeltas']
                                                    if j['goalId'] == gid],
        'provider': row['provider'], 'modelVersion': row['modelVersion'],
        'license': row['license'], 'formatDecision': 'KEEP native1672x941 PNG, near16:9; no format exception',
        'noNewPixelViewsClaimedForWordSuccessor': True,
        'independentMachineVisualJudgmentCompleted': True,
        'activeQAApprovalWritten': False, 'humanApproval': False,
        'sourceAndNativeDPGatesClosedByImage': False})

finding = {
    'findingId': 'CHEM3-V-B-PROVENANCE-REPRESENTATION-001',
    'type': 'precise stored-versus-transmitted prompt serialization disclosure',
    'status': 'RESOLVED_BY_EXACT_ADDITIVE_RAW_REQUEST_BINDING_WITH_HISTORY_RETAINED',
    'scope': 'Only three edit prompt records: d2attempt2, a0attempt2, a0attempt3',
    'observation': 'Each stored standalone edit prompt has an extra literal backslash+n trailer; retained actual raw tool request does not. Substantive body is exact. Original files and author seals remain byte-exact.',
    'resolution': 'Actual transmitted strings are identified by retained raw request files and separately computed UTF8 body digests. Standalone file bytes are explicitly different. No normalized string is represented as byte equality; neither actual history nor pixels is rewritten.',
    'actualDeltas': technical['storedVersusActualTransmittedPromptRepresentationDeltas'],
    'failedInitialExactEqualityCheckPreserved': binding(OWN / 'metadata-exact-prompt-string-failed-v1.terminal.actual.json'),
    'scientificOrPixelDefect': False, 'generationRequired': False,
    'actualAuthorInputClaimCorrectedByThisAdditiveReview': True,
    'noAuthorOriginalQCOrPeerJudgmentOverwritten': True}

final = write('three-current-actual-rasters-and-word-successor.independent-b.completed.verdict.json', {
    'schemaVersion': 1, 'contentLicense': 'CC-BY-4.0',
    'reviewId': 'chemie-q3-three-bw-practical-current-visual-independent-b-v1',
    'recordedAt': datetime.now(timezone.utc).isoformat(),
    'status': 'Completed independent machine V candidate:3KEEP, narrow device-word finding resolved, exact additive provenance disclosure',
    'knowledgeDisclosure': metadata['knowledgeDisclosure'],
    'immutableOwnPixelFIRST': binding(pixel_path),
    'immutableOwnPixelFIRSTFreeze': binding(OWN / 'three-actual-rasters.independent-b.pixel-FIRST.freeze.json'),
    'immutableOwnMetadataFIRST': binding(metadata_path),
    'immutableOwnMetadataFIRSTFreeze': binding(OWN / 'three-actual-rasters.independent-b.metadata-targeted-FIRST.freeze.json'),
    'originalAuthorEntry': binding(AUTHOR / 'neutral-three-whole-BW-practical-goal-actual-rasters.independent-V-review.entry.json'),
    'wordSuccessorEntry': binding(SUCCESSOR / 'neutral-a0f6-device-word-only-metadata-successor.independent-targeted-review.entry.json'),
    'finalInactiveWhole484Candidate': binding(SUCCESSOR / 'candidate/whole484.only-a0f6-accessibility-device-word.inactive.json'),
    'finalWholeAccessibleMetadata': binding(actual_meta_path),
    'decisions': decisions,
    'resolvedKnownFinding': {'findingId': 'CHEM3-ROOT-META-001', 'status': 'RESOLVED',
        'resolution': 'Messpipetten→Messspritzen only in a0f6alt/reconstruction; authentic selected pixel tools support the corrected wording; no regeneration.',
        'exactModelDeltas': technical['modelDeltas'], 'exactMetadataDeltas': technical['metadataDeltas']},
    'additionalProvenanceFinding': finding,
    'technicalChecks': binding(technical_path), 'actualNormalTerminal': binding(terminal_path),
    'actualOwnImagesViewed': 9, 'newImageViewsForWordSuccessor': 0,
    'oldRejectedAttemptsReviewedAsGoodPixels': False,
    'currentScientificSourceMaterialJudgmentsReused': binding(BASE / 'chemie-q3-three-BW-practical-companions-independent-b-v1/neutral-completed-three-whole-BW-practical-and-source002.independent-b.entry.json'),
    'reviewAuthority': 'independent_ai_candidate',
    'noHumanApprovalOrTrial': True, 'actualLearnerExperiments': 0,
    'noFullProgrammeApproval': True, 'noActiveIntegration': True,
    'nativePreparationStarted': False, 'nativeDApproval': False,
    'currentPResourceRebindApproval': False,
    'newStrictClosures': 0, 'restoredBindings': 0,
    'nextStep': 'After checkpoint resume, prepare ordinary whole381 native current model with three new image goals and exactly measured old page/context deltas. Root plus another reviewer perform genuine independent native D; preserve all current equal historical bindings. No native preparation or D review is claimed by this V result.'})

entry = write('neutral-completed-three-current-rasters-device-word-and-provenance.independent-b.entry.json', {
    'schemaVersion': 1, 'contentLicense': 'CC-BY-4.0',
    'status': 'SEALED_SCOPED_MACHINE_VISUAL_CANDIDATE_NO_ACTIVE_WRITES',
    'verdict': binding(final), 'pixelFIRST': binding(pixel_path),
    'pixelFIRSTFreeze': binding(OWN / 'three-actual-rasters.independent-b.pixel-FIRST.freeze.json'),
    'metadataFIRST': binding(metadata_path),
    'metadataFIRSTFreeze': binding(OWN / 'three-actual-rasters.independent-b.metadata-targeted-FIRST.freeze.json'),
    'actualTechnicalResult': binding(technical_path), 'actualTerminal': binding(terminal_path),
    'finalInactiveWhole484Candidate': binding(SUCCESSOR / 'candidate/whole484.only-a0f6-accessibility-device-word.inactive.json'),
    'finalWholeAccessibleMetadata': binding(actual_meta_path),
    'KEEPGoalIds': [row['goalId'] for row in decisions],
    'actualRawRequestHistories': technical['sixActualAuthorGenerationRequestsBound'],
    'exactStoredTrailerDeltasDisclosed': technical['storedVersusActualTransmittedPromptRepresentationDeltas'],
    'resolvedDeviceWordFindingId': 'CHEM3-ROOT-META-001',
    'provenanceRepresentationFindingId': finding['findingId'],
    'nativePreparationNotStarted': True, 'currentPResourceRebindStillPending': True,
    'noSourceWholeProgrammeApproval': True, 'noHumanApproval': True,
    'newStrictClosures': 0, 'restoredBindings': 0,
    'finalSealPath': str((OWN / 'independent-b.final.freeze.json').relative_to(ROOT))})

# Normal end parsing of the completed own payload and exact bindings, not a new
# curriculum review or a repeat of broad builds/checks.
spec = importlib.util.spec_from_file_location('normal_validator', ROOT / 'scripts/validate_schemas.py')
validator = importlib.util.module_from_spec(spec)
spec.loader.exec_module(validator)
schema = load(ROOT / 'docs/landscape-runtime.schema.json')
parsed = []
for p in sorted(OWN.rglob('*')):
    assert not p.is_symlink(), p
    if p.suffix == '.json':
        assert validator.validate_file(str(p.relative_to(ROOT)), schema)
        parsed.append(binding(p))
    elif p.suffix == '.jsonl':
        for line in p.read_text().splitlines():
            if line.strip():
                json.loads(line)
        parsed.append(binding(p))
paths = [str(p.relative_to(ROOT)) for p in OWN.rglob('*') if p.is_file()]
ignored = subprocess.run(['git', 'check-ignore', '--stdin'], cwd=ROOT,
                         input=('\n'.join(paths) + '\n').encode(), capture_output=True)
assert ignored.returncode == 1 and not ignored.stdout, ignored.stdout
assert not validator.curriculum_symlink_errors(ROOT)
payloads = [binding(p) for p in sorted(OWN.rglob('*')) if p.is_file()]
seal = write('independent-b.final.freeze.json', {
    'schemaVersion': 1, 'contentLicense': 'CC-BY-4.0',
    'sealedAt': datetime.now(timezone.utc).isoformat(),
    'status': 'COMPLETE_SCOPED_MACHINE_V_CANDIDATE_NO_NATIVE_OR_ACTIVE_INTEGRATION',
    'entry': binding(entry), 'verdict': binding(final), 'allOwnPackageFiles': payloads,
    'normalOwnEndJSONJSONLParsed': parsed,
    'allPriorPixelMetadataFIRSTAndHistoricalAuthorSealsExact': True,
    'actualTechnicalExitCode': 0, 'initialActualExit1Preserved': True,
    'threeSelectedRasterKEEP': True, 'nineActualIndividualPixelViews': True,
    'literalBackslashNTrailerDifferencesNotCalledByteEquality': True,
    'exactRawToolRequestHistoryBound': True,
    'normalSchemaPortabilityChecked': True, 'newNativePreparationStarted': False,
    'newStrictClosures': 0, 'restoredBindings': 0, 'humanApproval': False,
    'activeWrites': 0})
assert validator.validate_file(str(seal.relative_to(ROOT)), schema)
for row in load(seal)['allOwnPackageFiles']:
    assert binding(ROOT / row['path']) == row
print(json.dumps({'entry': binding(entry), 'seal': binding(seal),
                  'payloadCount': len(payloads), 'ownParsedJSONJSONL': len(parsed),
                  'KEEP': 3, 'newStrictClosures': 0, 'nativePreparationStarted': False}))
