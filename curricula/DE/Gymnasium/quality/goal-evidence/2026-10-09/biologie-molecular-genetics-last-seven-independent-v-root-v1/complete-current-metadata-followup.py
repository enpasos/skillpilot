#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Bind actual final metadata after independent pixel FIRST, preserving defects."""
import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[7]
OUT = Path(__file__).resolve().parent
AUTHOR = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/biologie-molecular-genetics-twenty-three-whole-author-v1/images-author-v1'

def binding(path):
    data = path.read_bytes()
    return {'path': path.relative_to(ROOT).as_posix(), 'sha256': hashlib.sha256(data).hexdigest(), 'bytes': len(data)}

def write(name, data):
    path = OUT / name
    if path.exists():
        raise FileExistsError(path)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')
    return binding(path)

old_path = AUTHOR / 'all-twenty-three-current-readable-metadata-v2/neutral-all23-current-selected-images-and-readable-metadata-v2.author-review.entry.json'
current_path = AUTHOR / 'all-twenty-three-current-readable-metadata-v3/neutral-all23-current-selected-images-and-visible-content-metadata-v3.author-review.entry.json'
old = json.loads(old_path.read_text())
current = json.loads(current_path.read_text())
assert all(a['sha256'] == b['sha256'] for a, b in zip(old['entries'], current['entries']))
assert all(a == b for i, (a, b) in enumerate(zip(old['entries'], current['entries'])) if i != 17)
original_pixel = json.loads((OUT / 'seven-actual-rasters.pixel-FIRST.independent-root.verdict.json').read_text())
neutral = json.loads((OUT / 'seven-actual-rasters-current-whole-goals.neutral-root-input.json').read_text())
results = []
bound_files = []
raw_checks = []
for item, own_input, own_pixel in zip(current['entries'][16:], neutral['entries'], original_pixel['results']):
    assert item['wholeCurrentGoal'] == own_input['wholeCurrentGoal']
    assert item['sha256'] == own_pixel['actualAssetBinding']['sha256']
    selected_bindings = [item['assetBinding'], item['originalPromptBinding'], item['reconstructionPromptBinding']]
    if 'selectedEditPromptBinding' in item:
        selected_bindings.append(item['selectedEditPromptBinding'])
    actual_bound = []
    for expected in selected_bindings:
        actual = binding(ROOT / expected['path'])
        assert actual['sha256'] == expected['sha256'].removeprefix('sha256:')
        assert actual['bytes'] == expected['bytes']
        actual_bound.append(actual)
        bound_files.append(actual)
    raw = Path(item['actualGenerationProvenance']['originalGeneratedFile'])
    data = raw.read_bytes()
    assert hashlib.sha256(data).hexdigest() == item['sha256']
    raw_checks.append({'ordinal': item['ordinal'], 'localRawFile': str(raw), 'sameActualPNGSha256': item['sha256'], 'sameBytes': len(data)})
    assert item['provider'] == 'built-in ChatGPT/Codex image_gen'
    assert item['tool'] == 'image_gen__imagegen' and item['model'] is None
    assert item['resourceLinkCandidate']['description'] == item['descriptionDe']
    assert item['resourceLinkCandidate']['altText'] == item['altTextDe']
    results.append({
        'ordinal': item['ordinal'], 'goalId': item['goalId'], 'actualAssetBinding': item['assetBinding'],
        'pixelFIRSTResultRetained': own_pixel, 'caption': item['descriptionDe'], 'altText': item['altTextDe'],
        'actualPromptBindings': actual_bound[1:],
        'actualOriginalEditReconstructionPromptBodiesRead': True,
        'captionAltAndReconstructionComparedWithSeenActualPNG': True,
        'originalPromptIsGenerationIntentionNotPixelApproval': True,
        'reconstructionIsActualViewDerivedNotOriginalGeneratorInput': True,
        'provider': item['provider'], 'tool': item['tool'], 'model': None,
        'modelDisclosure': 'Tool does not expose model ID; no inferred identifier.',
        'decision': 'KEEP_candidate_after_actual_pixel_and_metadata_review',
        'independentNativePageAndCurrentVRecord': 'pending', 'humanApproval': False,
    })
verdict = write('last-seven-current-v3-metadata.actual-independent-root.followup.json', {
    'schemaVersion': 1, 'role': 'Actual independent root metadata/prompt/provenance followup after genuine pixel FIRST',
    'createdAt': datetime.now(timezone.utc).isoformat(),
    'inputs': [binding(current_path), binding(old_path), binding(OUT / 'seven-actual-rasters.pixel-FIRST.independent-root.freeze.json')],
    'oldMetadataFinding': {
        'goalId': current['entries'][17]['goalId'], 'findingId': 'root-last-seven-meta-001',
        'observedOldDefect': 'Old18 alt and reconstruction claimed a visible4×4 table; actual PNG shows two four-gamete strips and phenotype icons.',
        'oldMetadataRetained': True, 'oldPixelsKept': True,
        'actualCurrentResolution': 'Read new18 caption, alt and reconstruction completely and compared with the already-seen original/360/680. They now describe the visible strips; ratio conditions remain explicit.',
        'currentResolution': 'resolved_by_actual_metadata_successor',
    },
    'actualReading': {'originalPrompts': 7, 'selectedEditPrompts': 5, 'currentReconstructionPrompts': 7, 'captions': 7, 'altTexts': 7},
    'technicalActualBoundFiles': bound_files, 'technicalLocalRawChecks': raw_checks,
    'all23PNGsExactOldMetadataVersion': True, 'other22WholeEntriesExactOldMetadataVersion': True,
    'results': results, 'KEEP_candidates': 7, 'openPixelFindings': 0, 'openMetadataFindings': 0,
    'freshIndependentAPixelOrMetadataVerdictsReadBeforeOwnFinal': False,
    'currentNativePageOrVRecordApproval': False, 'sourceOrCourseApproval': False,
    'strictGain': 0, 'activeWrites': 0, 'humanApproval': False, 'humanTrial': False,
})
entry = write('neutral-completed-last-seven-actual-pixels-and-current-v3-metadata.independent-root.review.entry.json', {
    'schemaVersion': 1, 'role': 'Completed actual independent root last-seven candidate review, machine only',
    'pixelFIRSTVerdict': binding(OUT / 'seven-actual-rasters.pixel-FIRST.independent-root.verdict.json'),
    'pixelFIRSTSeal': binding(OUT / 'seven-actual-rasters.pixel-FIRST.independent-root.freeze.json'),
    'currentMetadataFollowup': verdict, 'currentAuthorEntry': binding(current_path),
    'currentNativeOrVRecordApproval': False, 'strictGain': 0, 'activeWrites': 0, 'humanApproval': False,
})
seal = write('last-seven-current-pixels-and-metadata.independent-root.final.freeze.json', {
    'schemaVersion': 1, 'role': 'Independent root candidate V final freeze preserving original FIRST',
    'createdAt': datetime.now(timezone.utc).isoformat(), 'outputs': [verdict, entry],
    'freshIndependentAPixelOrMetadataVerdictsReadBeforeOwnFinal': False,
})
print(json.dumps({'entry': entry, 'final': seal, 'KEEP_candidates': 7, 'activeWrites': 0}))
