#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Pair retained actual visual reviews and a bounded reconstruction correction."""
import copy
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

def read(path):
    return json.loads(path.read_text())

def bind(path):
    data = path.read_bytes()
    return {'path': str(path.relative_to(ROOT)), 'sha256': hashlib.sha256(data).hexdigest(), 'bytes': len(data)}

def write(path, value):
    assert not path.exists(), path
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')
    assert read(path) == value

a = BASE / 'biologie-evolution-six-root-rasters-independent-v-a-v1'
b = BASE / 'biologie-evolution-six-root-rasters-independent-v-b-v1'
author = BASE / 'biologie-evolution-systematics-behavior-six-raster-author-root-v1'
successor = BASE / 'biologie-evolution-six-root-raster-reconstruction-only-successor-root-v1'
ae = a / 'neutral-completed-six-root-raster-independent-A.review.entry.json'
be = b / 'completed-six-actual-root-rasters.independent-b.review.entry.json'
af = a / 'reconstruction-only-followup-v2/neutral-completed-one-reconstruction-only-followup.independent-A.review.entry.json'
bf = b / 'reconstruction-only-count-followup-v1/completed-one-reconstruction-count-only-independent-b.followup.entry.json'
aj, bj, afj, bfj = [read(p) for p in (ae, be, af, bf)]
assert aj['reviewerId'] != bj['reviewer']
assert aj['exposure']['authorOfThese6Rasters'] is False
assert aj['exposure']['freshPeerVResultsRead'] is False
assert bj['freshPeerOutcomeRead'] is False
ap = read(ROOT / aj['outputs']['pixelFIRST']['path'])
bp = read(ROOT / bj['ownWholePixelVerdict']['path'])
ar, br = ap['rows'], bp['entries']
assert len(ar) == len(br) == 6
assert [r['goalId'] for r in ar] == [r['goalId'] for r in br]
assert all(r['decision'] == 'KEEP' and not r['findings'] for r in ar)
assert all(r['pixelDecision'] == 'KEEP' and not r['findings'] for r in br)
assert afj['targetedFindingResolution']['id'] == 'EVO6-V-A-META-001'
assert afj['targetedFindingResolution']['state'] == 'RESOLVED'
assert afj['currentSixCombination']['currentFullCandidateKEEP'] == 6
assert bfj['historicalFiveCountNotCurrentEvidence'] is True
bfirst = read(ROOT / bfj['ownTargetedFirstVerdict']['path'])
assert bfirst['decision'] == 'KEEP_EXACT_RECONSTRUCTION_ONLY_SUCCESSOR'
assert bfirst['pixelEvidenceReuse']['newIndividualViews'] == 0
old = read(author / 'six-selected-PNGs.actual-metadata-and-reconstruction.candidates.json')
new_path = successor / 'six-original-PNGs.one-reconstruction-count-only.successor.metadata.json'
new = read(new_path)
old_mask, new_mask = copy.deepcopy(old), copy.deepcopy(new)
assert [r['goalId'] for r in new['images']] == [r['goalId'] for r in ar]
assert len(new['images']) == 6
for rows in (old_mask['images'], new_mask['images']):
    for row in rows:
        if row['ordinal'] == 18:
            row['reconstructionPrompt'] = 'SINGLE_TARGETED_RECONSTRUCTION_BINDING'
assert old_mask == new_mask
canon_path = ROOT / 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json'
canon = {g['id']: g for g in read(canon_path)['goals']}
for row, ra, rb in zip(new['images'], ar, br):
    assert row['wholeGoal'] == ra['wholeGoal'] == rb['wholeGoal'] == canon[row['goalId']]
    assert row['asset'] == ra['asset'] == rb['asset']
    assert row['provider'] == 'built-in ChatGPT/Codex image_gen'
    assert row['resourceLinkCandidate']['license'] == 'CC-BY-4.0'

inputs = [ae, be, af, bf, canon_path, new_path,
          a / 'six-root-raster-independent-A.completed.final.freeze.json',
          b / 'completed-six-actual-root-rasters.independent-b.final.freeze.json',
          a / 'reconstruction-only-followup-v2/one-reconstruction-only-followup.independent-A.completed.final.freeze.json',
          b / 'reconstruction-only-count-followup-v1/completed-one-reconstruction-count-only-independent-b.followup.first.freeze.json']
verified, seen = [], set()
def verify(value):
    if isinstance(value, dict):
        path, sha = value.get('path'), value.get('sha256')
        if isinstance(path, str) and isinstance(sha, str) and len(sha.removeprefix('sha256:')) == 64:
            assert not Path(path).is_absolute(), path
            key = (path, sha)
            if key not in seen:
                seen.add(key)
                p = ROOT / path
                assert not p.is_symlink(), path
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
        for item in value.values():
            verify(item)
    elif isinstance(value, list):
        for item in value:
            verify(item)

for p in inputs:
    verify(bind(p))
    verify(read(p))
assert not curriculum_symlink_errors(ROOT)
first = OUT / 'six-existing-independent-V-and-resolved-reconstruction.technical-input.freeze.json'
write(first, {'schemaVersion': 1, 'role': 'Existing genuine independent V inputs; no new scientific verdict', 'inputs': [bind(p) for p in inputs], 'verifiedBindings': verified, 'ignoredBoundInputs': [], 'normalSymlinkErrors': []})
result = OUT / 'six-current-candidate-visualizations.genuine-independent-V-pair.actual.json'
write(result, {'schemaVersion': 1, 'createdAt': datetime.now(timezone.utc).isoformat(), 'role': 'Technical pairing of current bounded candidate V after targeted reconstruction correction', 'inputFirst': bind(first), 'reviewers': [aj['reviewerId'], bj['reviewer']], 'pairs': [{'ordinal': r['ordinal'], 'goalId': r['goalId'], 'wholeGoal': r['wholeGoal'], 'asset': r['asset'], 'originalAnd360And680ActuallyReviewedByEach': True, 'independentAPixelDecision': 'KEEP', 'independentBPixelDecision': 'KEEP', 'currentIndependentAMetadataDecision': 'KEEP', 'currentIndependentBMetadataDecision': 'KEEP', 'metadata': r, 'boundedOrientationOnly': True} for r in new['images']], 'resolvedMetadataFinding': afj['targetedFindingResolution'], 'historicalBCountErrorSuperseded': bfirst['ownHistoricalErrorCorrection'], 'historicalFirstsAndSealsPreserved': True, 'newPixelReviewPerformed': False, 'newScientificM7Closures': 0, 'restoredM7Bindings': 0, 'strictGain': 0, 'activeImport': False, 'pending': ['whole source/course corrections', 'whole P material and atomarity findings', 'actual current native D/P/V review and root integration'], 'humanApproval': False, 'humanTrial': False, 'activeWrites': []})
entry = OUT / 'neutral-completed-six-current-raster-candidate-V-pair.entry.json'
write(entry, {'schemaVersion': 1, 'role': 'Completed candidate-only technical pairing of existing actual independent machine V reviews', 'pair': bind(result), 'inputFirst': bind(first), 'currentMetadata': bind(new_path), 'currentBoundedVKeep': 6, 'wholeCurrentM7Completions': 0, 'strictGain': 0, 'humanApproval': False, 'humanTrial': False, 'activeWrites': []})
seal = OUT / 'six-current-candidate-V-pair.technical.final.freeze.json'
write(seal, {'schemaVersion': 1, 'role': 'Immutable technical pair handoff; current native gates remain open', 'entry': bind(entry), 'outputs': [bind(p) for p in sorted(OUT.iterdir()) if p.is_file() and p != seal], 'strictGain': 0})
print(json.dumps({'entry': bind(entry), 'seal': bind(seal), 'verifiedBindings': len(verified), 'candidateVKeep': 6, 'strictGain': 0}))
