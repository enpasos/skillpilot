#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Combine completed V pairs into inactive native-review inputs; no new verdict."""
import hashlib
import json
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[7]
OUT = Path(__file__).resolve().parent
BASE = OUT.parent
sys.path.insert(0, str(ROOT / 'scripts'))
from validate_schemas import curriculum_symlink_errors

def read(p):
    return json.loads(p.read_text())

def bind(p):
    data = p.read_bytes()
    return {'path': str(p.relative_to(ROOT)), 'sha256': hashlib.sha256(data).hexdigest(), 'bytes': len(data)}

def write(name, value):
    p = OUT / name
    assert not p.exists(), p
    p.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')
    assert read(p) == value
    return bind(p)

pair_paths = [
    BASE / 'biologie-evolution-six-root-raster-current-V-pairing-technical-root-v1/six-current-candidate-visualizations.genuine-independent-V-pair.actual.json',
    BASE / 'biologie-evolution-twelve-current-raster-V-pairing-technical-root-v1/twelve-current-candidate-rasters.genuine-V-pair.actual.json',
]
author_path = BASE / 'biologie-evolution-systematics-behavior-eighteen-whole-author-v1/neutral-whole18-source35-partners30-P18-cases36.author-independent-review.entry.json'
canon_path = ROOT / 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json'
author = read(author_path)
canon = {g['id']: g for g in read(canon_path)['goals']}
inputs = [author_path, canon_path, *pair_paths]
verified = []
seen = set()

def verify(value):
    if isinstance(value, dict):
        path, sha = value.get('path'), value.get('sha256')
        if isinstance(path, str) and isinstance(sha, str) and len(sha.removeprefix('sha256:')) == 64:
            assert not Path(path).is_absolute(), path
            key = (path, sha)
            if key not in seen:
                seen.add(key)
                p = ROOT / path
                assert p.is_file() and not p.is_symlink(), path
                actual = bind(p)
                assert actual['sha256'] == sha.removeprefix('sha256:'), path
                if isinstance(value.get('bytes'), int):
                    assert actual['bytes'] == value['bytes'], path
                tracked = subprocess.run(['git', 'ls-files', '--error-unmatch', '--', path], cwd=ROOT, capture_output=True).returncode == 0
                ignored = subprocess.run(['git', 'check-ignore', '--quiet', '--', path], cwd=ROOT).returncode == 0
                assert tracked or not ignored, path
                if p.suffix == '.json':
                    read(p)
                verified.append(actual)
        for child in value.values():
            verify(child)
    elif isinstance(value, list):
        for child in value:
            verify(child)

images = []
for pair_path in pair_paths:
    pair = read(pair_path)
    assert pair['strictGain'] == 0 and len(set(pair['reviewers'])) == 2
    for row in pair['pairs']:
        metadata = row['metadata']
        goal_id = metadata['goalId']
        assert metadata['wholeGoal'] == canon[goal_id]
        assert metadata['asset']['path'].endswith('.png')
        assert metadata['model'] is None
        assert metadata['resourceLinkCandidate']['license'] == 'CC-BY-4.0'
        assert metadata['resourceLinkCandidate']['skillpilotId'] == goal_id
        data = (ROOT / metadata['asset']['path']).read_bytes()
        assert data[:8] == b'\x89PNG\r\n\x1a\n'
        assert {'width': int.from_bytes(data[16:20], 'big'), 'height': int.from_bytes(data[20:24], 'big')} == metadata['dimensions']
        if len(pair['pairs']) == 6:
            assert row['independentAPixelDecision'] == row['independentBPixelDecision'] == 'KEEP'
            assert row['currentIndependentAMetadataDecision'] == row['currentIndependentBMetadataDecision'] == 'KEEP'
        else:
            assert row['currentIndependentAPixelAndMetadata'] == row['currentIndependentBPixelAndMetadata'] == 'KEEP'
        images.append({'ordinal': metadata['ordinal'], 'goalId': goal_id, 'metadata': metadata,
                       'currentActualIndependentVPair': bind(pair_path), 'actualIndependentReviewers': pair['reviewers'],
                       'currentBoundedMachineVDecision': 'KEEP', 'authorStatusPreservedAsHistoricalInput': True,
                       'wholeSourceCourseAtomarityAndNativeApproval': False, 'activeImport': False})
images.sort(key=lambda row: row['ordinal'])
assert [row['ordinal'] for row in images] == list(range(1, 19))
assert [row['goalId'] for row in images] == author['selectedGoalIds']
assert len({row['goalId'] for row in images}) == 18
for p in inputs:
    verify(bind(p))
    verify(read(p))
assert not curriculum_symlink_errors(ROOT)
first = write('eighteen-reviewed-rasters.technical-input.freeze.json', {
    'schemaVersion': 1, 'role': 'Existing actual independent V pairs, no new scientific review',
    'inputs': [bind(p) for p in inputs], 'verifiedBindings': verified, 'normalSymlinkErrors': [],
})
entry = write('neutral-eighteen-current-independently-reviewed-rasters.native-preparation.entry.json', {
    'schemaVersion': 1, 'createdAt': datetime.now(timezone.utc).isoformat(),
    'role': 'Complete inactive PNG handoff for subsequent current native/source review',
    'inputFirst': first, 'images': images, 'exactCurrentWholeGoalCount': 18,
    'actualCurrentBoundedVKeep': 18, 'newScienceReviewsPerformed': 0,
    'resolvedActualPixelCorrectionOrdinal': 14, 'resolvedReconstructionOnlyOrdinal': 18,
    'historicalFirstsAndRejectedImagesUnchanged': True,
    'pending': ['whole source and course successors', 'ordinal14 semantic atomarity', 'current native D/P/context bindings', 'reviewed active integration'],
    'strictGain': 0, 'newScientificM7Closures': 0, 'restoredM7Bindings': 0,
    'humanApproval': False, 'humanTrial': False, 'activeWrites': [],
})
seal = write('eighteen-reviewed-rasters.technical.final.freeze.json', {
    'schemaVersion': 1, 'entry': entry,
    'outputs': [bind(p) for p in sorted(OUT.iterdir()) if p.is_file()],
    'strictGain': 0,
})
print(json.dumps({'entry': entry, 'seal': seal, 'verifiedBindings': len(verified), 'boundedVKeep': 18, 'strictGain': 0}))
