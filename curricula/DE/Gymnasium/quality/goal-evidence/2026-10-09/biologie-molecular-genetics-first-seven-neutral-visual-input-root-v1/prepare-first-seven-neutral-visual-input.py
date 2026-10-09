#!/usr/bin/env python3
"""Check actual raster bindings and prepare neutral independent visual inputs."""
# SPDX-License-Identifier: Apache-2.0
import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[7]
OUT = Path(__file__).resolve().parent
ENTRY = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/biologie-molecular-genetics-twenty-three-whole-author-v1/images-author-v1/portable-first-seven-successor-v2/neutral-first-seven-portable-actual-images.author-entry.json'


def binding(path):
    data = path.read_bytes()
    return {'path': path.relative_to(ROOT).as_posix(), 'sha256': hashlib.sha256(data).hexdigest(), 'bytes': len(data)}


def check(bound):
    path = ROOT / bound['path']
    assert not Path(bound['path']).is_absolute()
    assert path.resolve().is_relative_to(ROOT)
    actual = binding(path)
    assert actual['sha256'] == bound['sha256'].removeprefix('sha256:'), bound['path']
    assert actual['bytes'] == bound['bytes'], bound['path']
    return actual


def write(name, value):
    path = OUT / name
    with path.open('x', encoding='utf-8') as stream:
        stream.write(json.dumps(value, ensure_ascii=False, indent=2) + '\n')
    return binding(path)


def main():
    assert (ROOT / 'AGENTS.md').is_file()
    entry = json.loads(ENTRY.read_text())
    refs = [binding(ENTRY)]
    for key in ['wholeScienceEntry', 'originalScienceFirstSeal', 'wholeScienceMaterialCases', 'sourceReadingBindings']:
        refs.append(check(entry[key]))
    canonical = ROOT / 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json'
    landscape = json.loads(canonical.read_text())
    current = {g['id']: g for g in landscape['goals']}
    assert len(entry['images']) == 7 and len(set(entry['selectedGoalIds'])) == 7
    rows = []
    for item in entry['images']:
        assert item['goalId'] in current
        assert item['wholeCurrentGoal'] == current[item['goalId']]
        assert item['path'] == item['assetBinding']['path']
        asset = check(item['assetBinding'])
        with Image.open(ROOT / asset['path']) as image:
            assert image.format == 'PNG'
            dimensions = list(image.size)
            image.verify()
        assert dimensions == item['dimensions']
        assert 1.70 <= dimensions[0] / dimensions[1] <= 1.85
        assert dimensions[0] >= 1500 and dimensions[1] >= 850
        refs.extend([asset, check(item['originalPromptBinding']), check(item['reconstructionPromptBinding'])])
        rows.append({key: item[key] for key in [
            'ordinal', 'goalId', 'wholeCurrentGoal', 'assetBinding', 'dimensions',
            'provider', 'tool', 'model', 'modelDisclosure', 'originalPromptBinding',
            'reconstructionPromptBinding', 'reconstructionRole', 'descriptionDe',
            'altTextDe', 'resourceLinkCandidate']})
    content = write('seven-actual-current-rasters.neutral-independent-visual-input.json', {
        'schemaVersion': 1, 'role': 'Neutral first-seven actual-image review input; technical preparation only',
        'preparedAt': datetime.now(timezone.utc).isoformat(), 'preparedBy': '/root',
        'images': rows, 'actualCurrentCanonical': binding(canonical),
        'wholeScienceEntry': entry['wholeScienceEntry'],
        'wholeScienceMaterialCases': entry['wholeScienceMaterialCases'],
        'sourceReadingBindings': entry['sourceReadingBindings'],
        'authorEntry': binding(ENTRY), 'originalAndSuccessorHistoricalAssetsPreserved': True,
        'reviewRequirements': ['Actually view every selected original PNG',
                               'Actually view at 360 and 680 pixel image width',
                               'Check scientific form, geometry, labels, main idea and readability',
                               'Check actor perspective where relevant',
                               'Seal own FIRST before reading fresh peer verdicts'],
        'authorInspectionOmittedFromNeutralRows': True,
        'rootActualVisualOrScientificReviewPerformed': False,
        'generationIsApproval': False, 'nativeApproval': False,
        'activeWrites': False, 'strictNetGain': 0, 'humanApproval': False, 'humanTrial': False})
    receipt = write('actual-seven-PNG-bindings-and-current-goal-identity.technical-check.json', {
        'schemaVersion': 1, 'role': 'Technical bytes, PNG dimensions and current whole-goal identity only',
        'checkedAt': datetime.now(timezone.utc).isoformat(), 'inputBindings': refs,
        'neutralInput': content, 'actualCanonical': binding(canonical),
        'selectedGoalIds': entry['selectedGoalIds'], 'actualPNGs': 7,
        'wholeCurrentGoalBodiesEqual': True, 'PNGFormatAndDimensionsVerified': True,
        'bindingErrors': [], 'actualRasterViewingByRoot': False,
        'independentScientificOrVisualApproval': False, 'newStrictClosures': 0})
    sealed = write('neutral-first-seven.actual-input.first.freeze.json', {
        'schemaVersion': 1, 'role': 'Technical input FIRST, not a review verdict',
        'createdAt': datetime.now(timezone.utc).isoformat(), 'outputs': [content, receipt],
        'script': binding(Path(__file__)), 'sourceAuthorEntry': binding(ENTRY)})
    print(json.dumps({'neutralInput': content, 'technicalReceipt': receipt, 'firstFreeze': sealed}))


if __name__ == '__main__':
    main()
