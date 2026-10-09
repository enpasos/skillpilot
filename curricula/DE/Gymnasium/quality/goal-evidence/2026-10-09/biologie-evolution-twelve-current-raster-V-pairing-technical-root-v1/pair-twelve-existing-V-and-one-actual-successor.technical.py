#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Pair actual independent V opinions, with one actual image correction reviewed separately."""
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
def read(p): return json.loads(p.read_text())
def bind(p):
    data = p.read_bytes()
    return {'path': str(p.relative_to(ROOT)), 'sha256': hashlib.sha256(data).hexdigest(), 'bytes': len(data)}
def write(p, obj):
    assert not p.exists(), p
    p.write_text(json.dumps(obj, ensure_ascii=False, indent=2) + '\n')
    assert read(p) == obj

ad = BASE / 'biologie-evolution-twelve-rasters-independent-v-a-v1'
bd = BASE / 'biologie-evolution-twelve-rasters-independent-v-b-v1'
ae = ad / 'neutral-completed-twelve-actual-rasters-independent-A.review.entry.json'
be = bd / 'neutral-completed-twelve-current-rasters-independent-b.review.entry.json'
af = ad / 'one-book-perspective-followup-v1/neutral-completed-one-closed-book-independent-A.followup.entry.json'
bf = bd / 'one-book-perspective-followup-v1/neutral-completed-one-closed-book-independent-b.followup.entry.json'
aj, bj, afj, bfj = [read(p) for p in (ae, be, af, bf)]
av = ROOT / aj['fullVerdict']['path']
bv = ROOT / bj['actualMetadataAndVVerdict']['path']
ap, bp = read(av), read(bv)
assert aj['reviewer'] != bj['reviewer']
assert aj['noPeerReviewRead'] and aj['noImageAuthorshipByReviewer']
assert not bp['peerReviewsRead'] and not bp['authorOfTheseImages']
ar, br = ap['images'], bp['judgments']
assert len(ar) == len(br) == 12
assert [r['goalId'] for r in ar] == [r['goalId'] for r in br]
assert afj['machineVisualDecisionForExactCandidate'] == 'KEEP'
assert afj['resolvedOwnFindingIdForThisNewAsset'] == 'EVO12-V-A-PIXEL-001'
assert bfj['combinedVDecision'] == 'KEEP'
assert afj['newActualAsset'] == bfj['newActualAsset']
author_entry = BASE / 'biologie-evolution-systematics-behavior-twelve-raster-author-a-v1/neutral-twelve-current-whole-goals-and-actual-PNGs.author-independent-visual-review.entry.json'
metadata = read(author_entry)['images']
successor = BASE / 'biologie-evolution-one-culture-book-perspective-correction-author-root-v1/one-selected-generated-v2.whole-goal-and-operative-metadata.candidate.json'
replacement = read(successor)['image']
assert replacement['asset'] == afj['newActualAsset']
canon_path = ROOT / 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json'
canon = {g['id']: g for g in read(canon_path)['goals']}
pairs = []
for ra, rb, row in zip(ar, br, metadata):
    assert ra['goalId'] == rb['goalId'] == row['goalId']
    assert ra['wholeCurrentGoal'] == rb['wholeGoal'] == row['wholeGoal'] == canon[row['goalId']]
    assert ra['metadataDecision'] == rb['metadataDecision'] == 'KEEP'
    if row['ordinal'] == 14:
        assert ra['pixelDecision'] == 'HOLD' and rb['pixelDecision'] == 'KEEP'
        row = replacement
        assert row['wholeGoal'] == canon[row['goalId']]
    else:
        assert ra['pixelDecision'] == rb['pixelDecision'] == 'KEEP'
        assert row['asset']['sha256'].removeprefix('sha256:') == ra['asset']['sha256'].removeprefix('sha256:') == rb['selectedActualPNG']['sha256'].removeprefix('sha256:')
    pairs.append({'ordinal': row['ordinal'], 'goalId': row['goalId'], 'metadata': row, 'currentIndependentAPixelAndMetadata': 'KEEP', 'currentIndependentBPixelAndMetadata': 'KEEP', 'actualNewThreeViewCorrectionReview': row['ordinal'] == 14, 'unchangedOriginalThreeViewReviewReused': row['ordinal'] != 14, 'wholeSourceAtomarityNativeStillPending': True})
inputs = [ae, be, af, bf, av, bv, author_entry, successor, canon_path,
          ad / 'twelve-actual-rasters.independent-A.final.freeze.json',
          bd / 'twelve-current-raster-independent-b.final.freeze.json',
          ad / 'one-book-perspective-followup-v1/one-closed-book.independent-A.followup.final.freeze.json',
          bd / 'one-book-perspective-followup-v1/one-closed-book-independent-b.followup.final.freeze.json']
verified, seen = [], set()
def verify(obj):
    if isinstance(obj, dict):
        path, sha = obj.get('path'), obj.get('sha256')
        if isinstance(path, str) and isinstance(sha, str) and len(sha.removeprefix('sha256:')) == 64:
            assert not Path(path).is_absolute(), path
            key = (path, sha)
            if key not in seen:
                seen.add(key)
                p = ROOT / path
                assert not p.is_symlink(), path
                actual = bind(p)
                assert actual['sha256'] == sha.removeprefix('sha256:'), path
                if isinstance(obj.get('bytes'), int): assert actual['bytes'] == obj['bytes'], path
                tracked = subprocess.run(['git', 'ls-files', '--error-unmatch', '--', path], cwd=ROOT, capture_output=True).returncode == 0
                ignored = subprocess.run(['git', 'check-ignore', '--quiet', '--', path], cwd=ROOT).returncode == 0
                assert tracked or not ignored, path
                if p.suffix == '.json': read(p)
                verified.append(actual)
        for x in obj.values(): verify(x)
    elif isinstance(obj, list):
        for x in obj: verify(x)
for p in inputs:
    verify(bind(p)); verify(read(p))
assert not curriculum_symlink_errors(ROOT)
first = OUT / 'twelve-genuine-V-and-one-pixel-successor.technical-input.freeze.json'
write(first, {'schemaVersion': 1, 'role': 'Actual original independent FIRSTs plus separately reviewed replacement, no invented science judgment', 'inputs': [bind(p) for p in inputs], 'verifiedBindings': verified, 'ignoredBoundInputs': [], 'normalSymlinkErrors': []})
pair = OUT / 'twelve-current-candidate-rasters.genuine-V-pair.actual.json'
write(pair, {'schemaVersion': 1, 'createdAt': datetime.now(timezone.utc).isoformat(), 'role': 'Technical pairing of actual independent candidate V judgments and resolved actor-perspective correction', 'inputFirst': bind(first), 'reviewers': [aj['reviewer'], bj['reviewer']], 'pairs': pairs, 'historicalOriginalDissentPreserved': ap['openFindings'], 'currentFindingResolution': 'EVO12-V-A-PIXEL-001 resolved only for actual50591969 replacement, originalb20b0029 remains held', 'currentBoundedVKeep': 12, 'oldIndependentAFirstHoldCount': 1, 'newOriginal360680ViewsByEachForReplacement': 3, 'unchangedElevenNotViewedAgain': True, 'wholeSourceAndNativeApproved': False, 'ordinal14AtomicSplitApproved': False, 'strictGain': 0, 'newScientificM7Closures': 0, 'restoredM7Bindings': 0, 'humanApproval': False, 'humanTrial': False, 'activeWrites': []})
entry = OUT / 'neutral-completed-twelve-current-raster-candidate-V-pair.entry.json'
write(entry, {'schemaVersion': 1, 'role': 'Completed candidate-only actual V pair, original opinions preserved', 'pair': bind(pair), 'inputFirst': bind(first), 'currentBoundedVKeep': 12, 'remainingCurrentSourceNativeAndAtomicityGates': True, 'strictGain': 0, 'humanApproval': False, 'humanTrial': False, 'activeWrites': []})
seal = OUT / 'twelve-current-candidate-V-pair.technical.final.freeze.json'
write(seal, {'schemaVersion': 1, 'entry': bind(entry), 'outputs': [bind(p) for p in sorted(OUT.iterdir()) if p.is_file() and p != seal], 'strictGain': 0})
print(json.dumps({'entry': bind(entry), 'seal': bind(seal), 'verifiedBindings': len(verified), 'currentVKeep': 12, 'strictGain': 0}))
