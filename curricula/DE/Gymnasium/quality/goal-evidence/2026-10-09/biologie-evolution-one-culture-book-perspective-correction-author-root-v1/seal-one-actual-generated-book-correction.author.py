#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Record an actual targeted generator edit as an inactive reviewed-author candidate."""
import copy
import hashlib
import json
import struct
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[7]
OUT = Path(__file__).resolve().parent
BASE = OUT.parent
sys.path.insert(0, str(ROOT / 'scripts'))
from validate_schemas import curriculum_symlink_errors, validate_file

def read(p):
    return json.loads(p.read_text())
def bind(p):
    data = p.read_bytes()
    return {'path': str(p.relative_to(ROOT)), 'sha256': hashlib.sha256(data).hexdigest(), 'bytes': len(data)}
def write(p, obj):
    assert not p.exists(), p
    p.write_text(json.dumps(obj, ensure_ascii=False, indent=2) + '\n')
    assert read(p) == obj

old_entry = BASE / 'biologie-evolution-systematics-behavior-twelve-raster-author-a-v1/neutral-twelve-current-whole-goals-and-actual-PNGs.author-independent-visual-review.entry.json'
old = next(r for r in read(old_entry)['images'] if r['ordinal'] == 14)
canon = ROOT / 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json'
assert old['wholeGoal'] == next(g for g in read(canon)['goals'] if g['id'] == old['goalId'])
raw = Path('/home/enpasos/.codex/generated_images/01a0f2c0-2182-78f3-8b44-9fcdfd2c8634/exec-e46c9962-1f3f-4a5b-aacd-50e1ac6b5f0e.png')
asset = OUT / 'candidate-v2.png'
assert asset.read_bytes() == raw.read_bytes()
assert asset.read_bytes()[:8] == b'\x89PNG\r\n\x1a\n'
width, height = struct.unpack('>II', asset.read_bytes()[16:24])
capture = OUT / 'one-actual-v2-360680-browser-capture.receipt.json'
views = read(capture)
assert [v['renderedWidth'] for v in views['screenshots']] == [360, 680]
assert (width, height) == (views['screenshots'][0]['naturalWidth'], views['screenshots'][0]['naturalHeight'])
first = OUT / 'one-book-perspective-correction.author-input.freeze.json'
write(first, {'schemaVersion': 1, 'role': 'Original immutable whole-goal author input and actual edit target; two independent reviews still required', 'inputTwelveEntry': bind(old_entry), 'wholeGoal': old['wholeGoal'], 'originalAsset': old['asset'], 'wholeOriginalGoalProfileSourcePartnerInput': old['wholeGoalProfileTwoCasesSourcePartnersInput'], 'originalNormalPreparationReuse': 'The unchanged whole goal was prepared by the original twelve-image author before initial generation; this successor reuses that unchanged preparation. No new pre-generation prepare command is claimed.', 'actualEditPrompt': bind(OUT / 'edit-one-book.original.prompt.en.md'), 'recordedAfterActualEdit': True, 'sourceAndAtomarityApproval': False})
provenance = OUT / 'one-book-correction.actual-generation-provenance.json'
write(provenance, {'schemaVersion': 1, 'provider': 'Built-in ChatGPT/Codex image_gen', 'model': None, 'tool': 'image_gen.imagegen', 'toolInvocationCompleted': True, 'requestedTransparentBackground': False, 'actualGeneratorOriginalLocalPathDiagnosticOnly': str(raw), 'diagnosticPathNotRequiredForRepositoryReplay': True, 'generatorOriginalAndRepositoryCopyByteExact': True, 'asset': bind(asset), 'format': 'png', 'dimensions': {'width': width, 'height': height}, 'actualEditPrompt': bind(OUT / 'edit-one-book.original.prompt.en.md'), 'actualReferencedImage': old['asset'], 'programmaticRasterEdits': 0, 'historicalOriginalPromptsUntouched': old['originalPrompts'], 'generationIsNotApproval': True, 'humanApproval': False})
row = copy.deepcopy(old)
row.update({'asset': bind(asset), 'path': bind(asset)['path'], 'assetPath': bind(asset)['path'], 'sha256': bind(asset)['sha256'], 'bytes': bind(asset)['bytes'], 'dimensions': {'width': width, 'height': height}, 'selectedEditPromptPath': str((OUT / 'edit-one-book.original.prompt.en.md').relative_to(ROOT)), 'originalPrompts': old['originalPrompts'] + [bind(OUT / 'edit-one-book.original.prompt.en.md')], 'provenance': bind(provenance), 'reconstructionPromptPath': str((OUT / 'image-reconstruction-prompt.selected-v2.actual-seen.de.md').relative_to(ROOT)), 'reconstructionPrompt': {**bind(OUT / 'image-reconstruction-prompt.selected-v2.actual-seen.de.md'), 'derivedFromActualSeenImage': True, 'generationExecuted': False}, 'actualNativeAndPhoneDesktopRasterViews': {'original': bind(asset), 'screenshots': views['screenshots'], 'rasterEdits': 0}, 'independentVisualStatus': 'PENDING', 'independentVisualApproval': False})
row['altTextDe'] = old['altTextDe'].replace('einem Buch unter', 'einem geschlossenen Buch unter')
row['resourceLinkCandidate']['altText'] = row['altTextDe']
metadata = OUT / 'one-selected-generated-v2.whole-goal-and-operative-metadata.candidate.json'
write(metadata, {'schemaVersion': 1, 'role': 'Neutral one-actual-raster successor metadata, author judgments omitted', 'image': row, 'otherElevenMetadataNotChanged': True, 'originalTwelveInput': bind(old_entry), 'sourceAndNativeApproval': False, 'humanApproval': False})
pixel = OUT / 'one-selected-generated-v2.pixel-FIRST-neutral-input.json'
write(pixel, {'schemaVersion': 1, 'role': 'Neutral whole-goal and actual views only for independent pixel FIRST before metadata', 'ordinal': 14, 'goalId': old['goalId'], 'wholeGoal': old['wholeGoal'], 'asset': bind(asset), 'actualDisplayCaptures': views['screenshots'], 'sourceAndAtomarityApproval': False})
qc = OUT / 'one-book-correction.actual-original-360680.author-QC.json'
write(qc, {'schemaVersion': 1, 'role': 'Actual root author visual QC, not independent V', 'createdAt': datetime.now(timezone.utc).isoformat(), 'asset': bind(asset), 'viewedOriginalAtOriginalDetail': True, 'actuallyViewedIndividual360And680': True, 'decision': 'AUTHOR_CANDIDATE_READY_FOR_INDEPENDENT_V', 'actualObservations': ['The exposed directional book drawings are replaced by a clearly closed plain cream book, with bound edge and page block. No actor must read reversed internal pages.', 'The two people retain direct stone-tool demonstration, speech-bubble tool, hand geometry and social learning relation.', 'All three friendly comic panels retain fossil fragments, uncertainty-marked branching diagram, relative older/younger line and original German headings.', 'At360 the headings and fossil/branching/social-learning main motifs remain clear. The long secondary explanation is small; no required assessment datum depends on it.', 'The book scene is a contemporary symbol; no prehistoric literacy, actual fossil identity, measured dating, proven ancestry or performed human trial is claimed.'], 'formatDecision': 'Actual PNG near16:9 at native generator dimensions; friendly comic fit retained.', 'wholeAtomicSplitStillOpen': True, 'wholeSource35Partner30StillOpen': True, 'independentReviewCount': 0, 'strictGain': 0, 'humanApproval': False})
assert not curriculum_symlink_errors(ROOT)
schema = read(ROOT / 'docs/landscape-runtime.schema.json')
for p in OUT.glob('*.json'):
    assert validate_file(str(p), schema)
    assert subprocess.run(['git', 'check-ignore', '--quiet', '--', str(p.relative_to(ROOT))], cwd=ROOT).returncode != 0
entry = OUT / 'neutral-one-actual-closed-book-correction.independent-V-followup.entry.json'
write(entry, {'schemaVersion': 1, 'role': 'Targeted actual image-generator correction candidate; preserve original twelve-image reviews and all open source/atomarity duties', 'inputFirst': bind(first), 'pixelFirstNeutralInput': bind(pixel), 'metadataReadOnlyAfterOwnPixelFIRST': bind(metadata), 'provenance': bind(provenance), 'actualBrowserCapture': bind(capture), 'wholeOriginalProfileSourcePartners': old['wholeGoalProfileTwoCasesSourcePartnersInput'], 'historicalTwelveAuthorEntry': bind(old_entry), 'requestedIndependentReview': 'Inspect one actual original plus360/680, freeze own pixel FIRST, then read new caption/alt/reconstruction/provenance and judge actual replacement.', 'independentVRequired': 2, 'wholeSourceAndAtomarityAndNativeRemainPending': True, 'strictGain': 0, 'humanApproval': False, 'humanTrial': False, 'activeWrites': []})
seal = OUT / 'one-closed-book-correction.author.final.freeze.json'
write(seal, {'schemaVersion': 1, 'role': 'Actual selected PNG author handoff, no independent approval', 'entry': bind(entry), 'outputs': [bind(p) for p in sorted(OUT.iterdir()) if p.is_file() and p != seal], 'strictGain': 0})
print(json.dumps({'entry': bind(entry), 'seal': bind(seal), 'actualAsset': bind(asset), 'dimensions': [width, height], 'humanApproval': False, 'strictGain': 0}))
