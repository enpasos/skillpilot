#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Freeze neutral actual pixel inputs before the independent root review."""
import copy
import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[7]
OUT = Path(__file__).resolve().parent
AUTHOR = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/biologie-molecular-genetics-twenty-three-whole-author-v1'

def binding(path):
    path = Path(path)
    data = path.read_bytes()
    return {'path': path.relative_to(ROOT).as_posix(), 'sha256': hashlib.sha256(data).hexdigest(), 'bytes': len(data)}

def write(name, data):
    path = OUT / name
    if path.exists():
        raise FileExistsError(path)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')
    return binding(path)

entry_path = AUTHOR / 'images-author-v1/all-twenty-three-current-readable-metadata-v2/neutral-all23-current-selected-images-and-readable-metadata-v2.author-review.entry.json'
science_path = AUTHOR / 'remediation-v5/twenty-three-whole46-bilingual-cases-and-P.v5.author-candidate.json'
entry = json.loads(entry_path.read_text())
science = json.loads(science_path.read_text())
canonical_path = ROOT / 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json'
canonical = {goal['id']: goal for goal in json.loads(canonical_path.read_text())['goals']}
sciences = {item['goalId']: item for item in science['entries']}
selected = []
pixel_bindings = []
for original in entry['entries'][16:]:
    item = copy.deepcopy(original)
    for key in ['actualAuthorInspection', 'status', 'humanApproval', 'independentReviews', 'activeIntegration']:
        item.pop(key, None)
    goal_id = item['goalId']
    assert item['wholeCurrentGoal'] == canonical[goal_id] == sciences[goal_id]['wholeCurrentGoal']
    asset = ROOT / item['assetPath']
    actual = binding(asset)
    assert actual['sha256'] == item['sha256'] and actual['bytes'] == item['bytes']
    with Image.open(asset) as im:
        assert im.format == 'PNG' and list(im.size) == item['dimensions']
        im.load()
        views = []
        for width in [360, 680]:
            folder = OUT / 'inspection'
            folder.mkdir(exist_ok=True)
            preview = folder / f"{item['ordinal']:02d}-width-{width}.png"
            if preview.exists():
                raise FileExistsError(preview)
            resized = im.resize((width, round(im.height * width / im.width)), Image.Resampling.LANCZOS)
            resized.save(preview)
            views.append(binding(preview))
    item['rootActualPreviewBindings'] = views
    selected.append(item)
    pixel_bindings.extend([actual, *views])
assert len(selected) == 7
neutral = write('seven-actual-rasters-current-whole-goals.neutral-root-input.json', {
    'schemaVersion': 1, 'role': 'Neutral actual last-seven PNG inputs; no root verdict yet',
    'createdAt': datetime.now(timezone.utc).isoformat(),
    'authorEntryBinding': binding(entry_path), 'operativeScienceV5Binding': binding(science_path),
    'canonicalBinding': binding(canonical_path), 'entries': selected,
    'wholeGoalIdentityChecks': 7, 'actualPixelBindingChecks': 21,
    'reviewState': 'pending actual original/360/680 root inspection',
    'strictGain': 0, 'activeWrites': 0, 'humanApproval': False,
})
seal = write('seven-actual-rasters.own-input-FIRST.freeze.json', {
    'schemaVersion': 1, 'role': 'Independent root input FIRST before pixel decisions or fresh peer verdicts',
    'createdAt': datetime.now(timezone.utc).isoformat(),
    'inputs': [binding(entry_path), binding(science_path), binding(canonical_path)],
    'outputs': [neutral, *pixel_bindings],
    'freshPeerResultsReadBeforeOwnFIRST': False,
    'rootIsImageAuthor': False, 'rootPixelVerdictExists': False,
})
print(json.dumps({'input': neutral, 'first': seal, 'actualPNGs': 7, 'actualViews': 14}, ensure_ascii=False))
