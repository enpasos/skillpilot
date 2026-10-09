# SPDX-License-Identifier: Apache-2.0
"""Verify bounded visual inputs; this does not issue scientific judgments."""
import datetime
import hashlib
import json
from pathlib import Path
import subprocess
import sys

from PIL import Image

OUT = Path(__file__).resolve().parent.relative_to(Path.cwd().resolve())
SOURCE = OUT.parent / 'biologie-evolution-systematics-behavior-twelve-raster-author-a-v1' / 'neutral-twelve-current-whole-goals-and-actual-PNGs.author-independent-visual-review.entry.json'
CANON = Path('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json')
stamp = datetime.datetime.now(datetime.timezone.utc).isoformat()


def binding(path):
    path = Path(path)
    assert not path.is_absolute(), path
    assert path.is_file(), path
    assert not any(part.is_symlink() for part in [path, *path.parents]), path
    data = path.read_bytes()
    return {'path': str(path), 'sha256': 'sha256:' + hashlib.sha256(data).hexdigest(), 'bytes': len(data)}


def write(name, value):
    path = OUT / name
    assert not path.exists(), path
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')
    assert json.loads(path.read_text()) == value
    return binding(path)


verified = {}


def verify(expected):
    actual = binding(expected['path'])
    assert actual['sha256'] == expected['sha256'], (actual, expected)
    assert actual['bytes'] == expected['bytes'], (actual, expected)
    verified[actual['path']] = actual
    if actual['path'].endswith('.json'):
        json.loads(Path(actual['path']).read_text())
    return actual


data = json.loads(SOURCE.read_text())
pixel = json.loads((OUT / 'twelve-whole-goals-and-actual-raster-bindings.pixel-only.input.json').read_text())
first = json.loads((OUT / 'twelve-actual-rasters.independent-A.pixel-FIRST.freeze.json').read_text())
verify(first['pixelVerdict'])
verify(first['pixelInputFirst'])
canon = json.loads(CANON.read_text())
goals = {g['id']: g for g in canon['goals']}
assert [r['ordinal'] for r in data['images']] == [3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 14, 17]
metadata = []
raw_copy_checks = []
for row, p_row in zip(data['images'], pixel['images']):
    assert row['wholeGoal'] == goals[row['goalId']] == p_row['wholeGoal']
    assert row['asset'] == p_row['selectedPng']
    verify(row['asset'])
    assert row['format'] == 'png'
    with Image.open(row['asset']['path']) as im:
        assert im.format == 'PNG'
        assert im.size == (row['dimensions']['width'], row['dimensions']['height'])
        assert im.size[0] == 1672 and im.size[1] in [940, 941]
    for screen, p_screen in zip(row['actualNativeAndPhoneDesktopRasterViews']['screenshots'], p_row['displayCaptures']):
        assert screen['binding'] == p_screen['binding']
        assert screen['width'] == screen['renderedWidth'] == screen['documentWidth']
        assert screen['width'] in [360, 680]
        verify(screen['binding'])
    for b in row['originalPrompts']:
        verify(b)
        prompt = Path(b['path']).read_text()
        assert row['goalId'] not in prompt and 'SkillPilot' not in prompt
    verify(row['reconstructionPrompt'])
    assert not row['reconstructionPrompt']['generationExecuted']
    verify(row['provenance'])
    provenance = json.loads(Path(row['provenance']['path']).read_text())
    assert provenance['provider'] == row['provider'] == 'Built-in ChatGPT/Codex image_gen'
    assert provenance['model'] is row['model'] is None
    assert provenance['actualTool'] == 'image_gen__imagegen'
    assert provenance['selectedPortableBytes'] == row['asset']
    assert provenance['programmaticSelectedRasterEdits'] == 0
    assert not provenance['reconstructionGenerationExecuted']
    if provenance['actualSelectedEditReference']:
        verify(provenance['actualSelectedEditReference'])
    receipts = []
    for b in provenance['actualGenerationReceipts']:
        verify(b)
        receipt = json.loads(Path(b['path']).read_text())
        verify(receipt['actualOriginalPrompt'])
        verify(receipt['portableOutput'])
        raw = Path(receipt['historicalRawOutputPath'])
        assert raw.is_absolute() and raw.is_file()
        raw_bytes = raw.read_bytes()
        assert raw_bytes == Path(receipt['portableOutput']['path']).read_bytes()
        raw_copy_checks.append({'ordinal': row['ordinal'], 'receipt': b, 'portableOutput': receipt['portableOutput'], 'rawOriginalEqualsPortableCopy': True, 'historicalAbsolutePathIsDocumentaryOnly': True, 'portableReviewDoesNotDependOnRawOriginal': True})
        receipts.append(b)
    link = row['resourceLinkCandidate']
    assert link['skillpilotId'] == row['goalId']
    assert link['type'] == 'goal-visualization' and link['resourceType'] == 'image'
    assert link['url'] == '/assets/goal-visualizations/biologie/' + row['goalId'] + '/' + row['goalId'] + '.png'
    assert link['license'] == 'CC-BY-4.0' and link['lang'] == 'de'
    assert link['reviewStatus'] == 'pilot'
    assert link['description'] == row['descriptionDe'] and link['altText'] == row['altTextDe']
    verify(row['wholeGoalProfileTwoCasesSourcePartnersInput'])
    metadata.append({k: row[k] for k in ['ordinal', 'goalId', 'asset', 'format', 'dimensions', 'provider', 'model', 'originalPrompts', 'descriptionDe', 'altTextDe', 'reconstructionPrompt', 'provenance', 'resourceLinkCandidate', 'wholeGoalProfileTwoCasesSourcePartnersInput']})

# These are exact documentary bindings, not source/P/content approvals.
for key in ['whole18ScienceAndP36', 'wholeSource35AndPartner30OriginalFrame', 'currentCanonical479Root23Baseline', 'ordinaryPrepareInputFirst', 'scopedTechnicalBindings']:
    verify(data[key])
assert binding(CANON) == {**data['currentCanonical479Root23Baseline'], 'path': str(CANON)}
all_paths = list(verified)
ignored = subprocess.run(['git', 'check-ignore', '--no-index', '--stdin'], input='\n'.join(all_paths) + '\n', text=True, capture_output=True)
assert ignored.returncode in [0, 1], ignored.stderr
assert not ignored.stdout.strip(), ignored.stdout
sys.path.insert(0, 'scripts')
import validate_schemas
symlink_errors = validate_schemas.curriculum_symlink_errors('.')
assert not symlink_errors, symlink_errors
own_json = []
for path in sorted(OUT.glob('*.json')):
    parsed = json.loads(path.read_text())
    assert not validate_schemas.looks_like_runtime_landscape(str(path), parsed)
    own_json.append(binding(path))

snapshot = write('twelve-actual-provenance-caption-alt-reconstruction.metadata-input.snapshot.json', {'schemaVersion': 'evo12-scoped-V-metadata-input-v1', 'createdAt': stamp, 'reviewer': '/root/evo12_visual_independent_a', 'pixelFirstSeal': binding(OUT / 'twelve-actual-rasters.independent-A.pixel-FIRST.freeze.json'), 'metadataReadOnlyAfterPixelFirst': True, 'sourceEntry': binding(SOURCE), 'currentWholeCanonical': binding(CANON), 'images': metadata})
receipt = write('twelve-scoped-V-bindings-raw-copy-and-portability.actual.json', {'schemaVersion': 'evo12-scoped-V-technical-verification-v1', 'createdAt': stamp, 'reviewer': '/root/evo12_visual_independent_a', 'technicalStatus': 'PASS', 'verifiedBindingCount': len(verified), 'bindings': list(verified.values()), 'rawOriginalByteExactCopies': raw_copy_checks, 'rawCopyCount': len(raw_copy_checks), 'wholeCurrentGoalsEqualCount': 12, 'pngDimensionsNear16x9Count': 12, 'exact360And680BindingCount': 24, 'SPDXLicenseCount': 12, 'ignoredMandatoryPortableTargets': [], 'symlinkErrorsUsingNormalValidator': symlink_errors, 'fullyParsedOwnJson': own_json, 'normalQualityDiscoveryBoundaryUsed': True, 'technicalChecksIssueNoScientificOrHumanApproval': True, 'activeWrites': False, 'strictGain': 0, 'metadataSnapshot': snapshot})
print(json.dumps({'technicalStatus': 'PASS', 'verifiedBindingCount': len(verified), 'rawCopyCount': len(raw_copy_checks), 'receipt': receipt}, ensure_ascii=False))
