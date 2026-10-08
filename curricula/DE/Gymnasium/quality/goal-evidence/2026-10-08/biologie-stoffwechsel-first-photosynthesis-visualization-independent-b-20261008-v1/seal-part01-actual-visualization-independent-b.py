from pathlib import Path
import datetime
import hashlib
import json
import subprocess
from PIL import Image

BASE = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08')
OUT = BASE / 'biologie-stoffwechsel-first-photosynthesis-visualization-independent-b-20261008-v1'
AUTHOR = BASE / 'biologie-stoffwechsel-first-three-images-author-20261008-v1'
SOURCE_AUTHOR = BASE / 'biologie-stoffwechsel-first-three-regional-source-remediation-author-20261008-v1'
SOURCE_B = BASE / 'biologie-stoffwechsel-first-three-source-roles-independent-b-20261008-v1'
GOAL_ID = '32f47903-0788-5c27-ac88-7464f481f2f7'


def receipt(path):
    path = Path(path)
    raw = path.read_bytes()
    return {'path': path.as_posix(), 'sha256': hashlib.sha256(raw).hexdigest(), 'bytes': len(raw)}


def write(name, data):
    path = OUT / name
    with path.open('x') as handle:
        json.dump(data, handle, ensure_ascii=False, indent=2)
        handle.write('\n')
    return path


def load(path):
    return json.loads(Path(path).read_text())


now = datetime.datetime.now(datetime.timezone.utc).isoformat()
entry_path = AUTHOR / 'part-01-first-photosynthesis-image.neutral.author.entry.json'
entry = load(entry_path)
image_record = entry['images'][0]
assert image_record['goalId'] == GOAL_ID and image_record['sha256'] == 'a0e5ad59e128ab313e9b884c9ec01156a82ee41c3f9b2473bf4639a28233652d'
first_input = load(OUT / 'part-01-visualization-b.first-input.freeze.json')
for item in first_input['inputs']:
    assert receipt(item['path']) == item, item['path']

author_freeze = load(AUTHOR / 'part-01-first-photosynthesis-image.author.first-binding.freeze.json')
author_checks = [author_freeze['entry'], *author_freeze['files']]
for item in author_checks:
    assert receipt(item['path']) == item, item['path']

baseline = load(entry['wholeCurrentGoalBaseline']['path'])
whole_goal = next(row['wholeCurrentGoal'] for row in baseline['goals'] if row['goalId'] == GOAL_ID)
canonical_path = Path(baseline['canonicalPath'])
canonical = load(canonical_path)
current_goal = next(goal for goal in canonical['goals'] if goal['id'] == GOAL_ID)
assert current_goal == whole_goal
snapshot = write('actual-current-whole-goal01.first-read.snapshot.json', {
    'schemaVersion': 1, 'readAt': now,
    'originalCanonicalReadReceipt': receipt(canonical_path),
    'wholeCurrentGoal': current_goal,
    'exactAuthorWholeGoalMatch': True,
    'note': 'The whole selected goal is frozen here. Concurrent unrelated active canonical integration does not change this portable exact goal snapshot.'
})

profile_path = SOURCE_AUTHOR / 'science/whole-three-P-profiles.exact-KEEP.json'
cases_path = SOURCE_AUTHOR / 'science/whole-six-DEEN-cases-and-fresh-transfers.exact-KEEP.json'
profile = next(row for row in load(profile_path)['goals'] if row['goalId'] == GOAL_ID)
cases = [row for row in load(cases_path)['cases'] if row['goalId'] == GOAL_ID]
assert len(cases) == 2 and all(case['wholeCurrentGoal'] == current_goal for case in cases)
assert all(case['evidence']['status'] == 'ai_candidate' and case['evidence']['humanReviewStatus'] == 'needs_human_review' and not case['freshTransfer']['performed'] for case in cases)
assert profile['evidenceLevel'] == 'E1' and profile['maximumClaimScope'] == 'G1'
scope_snapshot = write('whole-profile01-two-DEEN-cases.exact-KEEP.read-snapshot.json', {
    'schemaVersion': 1, 'profileInput': receipt(profile_path), 'casesInput': receipt(cases_path),
    'wholeCurrentGoal': current_goal, 'wholeProfile': profile, 'wholeTwoDEENCases': cases,
    'status': 'Exact unchanged valid scientific/P inputs retained; this is a new raster review only.'
})

asset = Path(image_record['path'])
with Image.open(asset) as original:
    original.load()
    assert original.format == 'PNG' and original.size == (1672, 941)
    preview_checks = []
    for width in (360, 680):
        preview_path = asset.with_name(asset.stem + f'.width-{width}.preview.png')
        with Image.open(preview_path) as preview:
            preview.load()
            expected_size = (width, round(original.height * width / original.width))
            assert preview.size == expected_size
            expected_pixels = original.resize(expected_size, Image.Resampling.LANCZOS).tobytes()
            assert preview.tobytes() == expected_pixels
            preview_checks.append({**receipt(preview_path), 'dimensions': {'width': preview.width, 'height': preview.height}, 'actualViewedWithViewImageOriginalDetail': True, 'exactLANCZOSDerivativePixels': True})
    png_details = {'format': original.format, 'dimensions': {'width': original.width, 'height': original.height}, 'mode': original.mode, 'metadataKeys': sorted(original.info), 'actualViewedWithViewImageOriginalDetail': True}

provenance = load(image_record['provenancePath'])
provider_original = Path(provenance['originalOutputLocation'])
original_copy_match = provider_original.exists() and provider_original.read_bytes() == asset.read_bytes()
assert original_copy_match
supplemental = write('part-01-visualization-b.supplemental-input.freeze.json', {
    'schemaVersion': 1, 'createdAt': now,
    'inputs': [receipt(snapshot), receipt(scope_snapshot), receipt(AUTHOR / 'archive-actual-integrated-output.author.py'), receipt(asset.parent / 'prompt.de.md')],
    'localProviderOriginal': {'originalLocation': str(provider_original), 'sha256': hashlib.sha256(provider_original.read_bytes()).hexdigest(), 'bytes': provider_original.stat().st_size, 'exactPortablePNGCopy': True, 'requiredPortableArtifact': False},
    'peerCurrentVisualAReadBeforeFirstSeal': False
})

verification = write('actual-PNG-current-goal-profile-author-freeze.independent-b.check.json', {
    'schemaVersion': 1, 'checkedAt': now, 'authorReceiptChecks': len(author_checks),
    'ownOriginalFrozenInputChecks': len(first_input['inputs']), 'hashFailures': [],
    'actualPNG': {**receipt(asset), **png_details}, 'actualPreviews': preview_checks,
    'providerOriginalByteExact': original_copy_match,
    'wholeCurrentGoalAuthorBaselineExact': True, 'wholeCurrentProfileAndTwoDEENCasesReadExactKEEP': True,
    'sourceRoleConstraintsBoundToOwnPriorFirstSeal': receipt(SOURCE_B / 'three-source-roles-b.first-verdict.seal.json'),
    'activeWrites': 0
})

verdict = write('part-01-actual-visualization.independent-b.first-verdict.json', {
    'schemaVersion': 1, 'reviewedAt': now, 'reviewer': 'independent-b',
    'reviewType': 'Actual current PNG and two true-size derivatives; independent visualization only',
    'goalId': GOAL_ID, 'wholeCurrentGoal': current_goal, 'decision': 'KEEP',
    'imageInput': receipt(asset), 'wholeProfileAndCasesInput': receipt(scope_snapshot),
    'scientificObservations': [
        'Light-dependent processes are at the drawn thylakoid stack/membranes; Calvin-cycle processes are in the chloroplast stroma. This is a schematic organelle perspective, not an electron micrograph or scale diagram.',
        'Water enters the light-reaction side and oxygen leaves there; CO2 enters the Calvin-cycle side and organic building blocks leave there. The image does not falsely source photosynthetic oxygen from CO2.',
        'The upper ATP + NADPH arrow points from the light reactions to the Calvin cycle. The lower ADP + Pi + NADP+ arrow points back. Return chemistry and process coupling agree with the complete profile and both DE/EN cases.',
        'Both groups appear in one illuminated chloroplast; no moon/night panel claims that the Calvin cycle runs only at night or is cellular respiration.',
        'Light, CO2 and temperature are represented as influencing factors. No universal monotone response, yield number or false all-limitation claim is drawn.',
        'The green faceted sugar-building block is an abstract pictogram, not a glucose ring or asserted atom/bond structure. Water drop and gas clouds are also schematic signs.'
    ],
    'actualWidthObservations': [
        {'width': 1672, 'height': 941, 'finding': 'Original inspected. Main process names, locations, chemical carrier labels, all arrowheads and three factor labels are clear.'},
        {'width': 680, 'height': 383, 'finding': 'The process groups, directions, carrier coupling, factor labels and supporting locations remain readable.'},
        {'width': 360, 'height': 203, 'finding': 'The two process groups, ATP/NADPH direction, material inputs/outputs and factor row remain recognizable. Small thylakoid/stroma and return-arrow subscripts are supporting detail; comfortable reading of every small label needs the enlarged original. This is a retained practical limit, not evidence that a full-size diagram fits as mobile prose.'}
    ],
    'metadataAndAccessibility': {
        'descriptionDe': image_record['descriptionDe'], 'altTextDe': image_record['altTextDe'],
        'altTextDecision': 'KEEP: accurately names location, directed materials/carriers, factors and schematic non-structural nature; NADP plus denotes NADP+.',
        'providerAndModelClaimAccurate': True, 'exactOriginalPNGAndPromptPreserved': True,
        'modelNotExposedAndNotInferred': True,
        'projectOwnedDidacticContentLicenseAllocation': 'CC-BY-4.0 under current LICENSING.md; generation provenance is not a separate rights approval.',
        'needsHumanReview': True
    },
    'scopeLimits': [
        'The image supports the whole current photosynthesis goal but is not the entire P profile or an assessment solution: Calvin fixation/reduction/regeneration, changing limiting factors and net-versus-gross CO2 transfer remain in the unchanged complete learning cases.',
        'This new V KEEP does not relabel the exact valid scientific/P/A/M decisions as newly reviewed, supply native D/P page review, prove experiments, or authorize Human approval.',
        'Own already sealed SOURCE B accepts only bounded contributions. Four original operators and BIO123-B-OPERATIVE-PROJECTION-UNCHANGED remain open; this raster cannot remediate ordinary regional target projections or prove whole mandatory regional coverage.'
    ],
    'blockingFindings': [], 'newPeerVisualAReadBeforeFirstSeal': False,
    'scientificPInputsRetainedNotNewReview': True, 'evidenceLevel': 'E1', 'maximumClaimScope': 'G1',
    'status': 'ai_candidate', 'humanReviewStatus': 'needs_human_review',
    'humanApproval': False, 'humanTrial': False, 'performedExperiment': False,
    'activeWrites': 0, 'strictGainClaimed': 0
})

handoff = write('neutral-part01-visualization-independent-b.handoff.entry.json', {
    'schemaVersion': 1, 'reviewer': 'independent-b', 'goalId': GOAL_ID,
    'firstSealPath': (OUT / 'part-01-visualization-b.first-verdict.seal.json').as_posix(),
    'resultsDirectory': OUT.as_posix(), 'visualizationReviewPath': verdict.as_posix(),
    'visualizationDecision': 'KEEP', 'imagePath': asset.as_posix(), 'imageSha256': receipt(asset)['sha256'],
    'peerVisualReadBeforeFirstSeal': False, 'nativeBlockingFindings': [],
    'reviewRunIds': [], 'nativeDPReviewSupplied': False,
    'sourceWholeCoverageApprovalClaimed': False,
    'sourceConstraintsPreserved': ['four-original-operator-HOLDs', 'BIO123-B-OPERATIVE-PROJECTION-UNCHANGED'],
    'status': 'ai_candidate', 'humanReviewStatus': 'needs_human_review', 'evidenceLevel': 'E1', 'maximumClaimScope': 'G1',
    'humanApproval': False, 'humanTrial': False, 'activeWrites': 0, 'strictGainClaimed': 0
})

readme = OUT / 'README.md'
with readme.open('x') as handle:
    handle.write('# Actual photosynthesis visualization B\n\nIndependent first review of Bio1 v1: KEEP for the exact original PNG and inspected 360/680 previews. The complete current goal and retained full P profile/two DEEN cases are bound. Small supporting labels require enlargement for comfortable reading at 360 pixels. No new peer V-A judgment was read before the first seal.\n\nThe own SOURCE B bounded-role judgment and four operator HOLDs plus ordinary-projection constraint remain intact. No native page D/P, whole regional mandatory coverage, performed experiment, Human approval, active integration or strict closure is supplied. All statuses remain ai_candidate / needs_human_review / E1 / G1.\n')

eligible_paths = {item['path'] for item in first_input['inputs']} | {item['path'] for item in author_checks} | {item['path'] for item in load(supplemental)['inputs']}
eligible_paths.update(path.as_posix() for path in OUT.rglob('*') if path.is_file())
result = subprocess.run(['git', 'check-ignore', '--stdin'], input=''.join(path + '\n' for path in sorted(eligible_paths)), text=True, capture_output=True)
assert result.returncode in (0, 1), result.stderr
ignored = result.stdout.splitlines()
assert not ignored, ignored
portability = write('part-01-normal-index-aware-portability.independent-b.check.json', {
    'schemaVersion': 1, 'eligiblePortableArtifacts': len(eligible_paths),
    'method': 'normal git check-ignore --stdin, without --no-index; existing index membership respected',
    'ignoredPortableArtifacts': ignored, 'missingPortableArtifacts': [path for path in sorted(eligible_paths) if not Path(path).is_file()],
    'localProviderOriginalNotRequiredForPortableReview': True,
    'portableExactPNGAndPromptExist': True
})
assert not load(portability)['missingPortableArtifacts']
for item in first_input['inputs']:
    assert receipt(item['path']) == item, item['path']
for item in author_checks:
    assert receipt(item['path']) == item, item['path']
assert next(goal for goal in load(canonical_path)['goals'] if goal['id'] == GOAL_ID) == current_goal

sealed_outputs = [receipt(path) for path in sorted(OUT.rglob('*')) if path.is_file()]
seal_path = write('part-01-visualization-b.first-verdict.seal.json', {
    'schemaVersion': 1, 'firstSealedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(),
    'reviewer': 'independent-b', 'immutableFirstVerdict': True,
    'firstInputFreeze': receipt(OUT / 'part-01-visualization-b.first-input.freeze.json'),
    'supplementalInputFreeze': receipt(supplemental), 'outputs': sealed_outputs,
    'authorReceiptChecks': len(author_checks), 'ownOriginalFrozenInputChecks': len(first_input['inputs']),
    'hashFailures': [], 'currentActualPNGDecision': 'KEEP',
    'peerCurrentVisualAReadBeforeFirstSeal': False,
    'activeWrites': 0, 'strictGainClaimed': 0, 'humanApproval': False
})
for item in load(seal_path)['outputs']:
    assert receipt(item['path']) == item, item['path']
print(json.dumps({'firstSeal': receipt(seal_path), 'outputs': len(sealed_outputs), 'authorReceiptChecks': len(author_checks), 'ownFrozenInputs': len(first_input['inputs']), 'decision': 'KEEP', 'hashFailures': []}, ensure_ascii=False))
