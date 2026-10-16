# SPDX-License-Identifier: Apache-2.0
"""Finite integrity and actual-preview checks only; no app/build/QA mutation."""
import ast
from bisect import bisect_left
import hashlib
import json
import os
from pathlib import Path, PureWindowsPath
import subprocess

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[6]
DAY = HERE.parent
AUTHOR = DAY / 'chemie-rp-ideal-gas-one-missing-image-author-20261015-v1'
PREVIEW = ROOT / 'tmp/chemie-m7-resumed-20261015/ideal-gas-informed-independent-V1-own-preview'


def load(p):
    return json.loads(p.read_text())


def bind(p):
    b = p.read_bytes()
    return {'path': p.relative_to(ROOT).as_posix(), 'sha256': 'sha256:' + hashlib.sha256(b).hexdigest(), 'bytes': len(b)}


def pin(row):
    assert bind(ROOT / row['path']) == row
    return row


def write(p, x):
    p.write_text(json.dumps(x, ensure_ascii=False, indent=2) + '\n')
    assert load(p) == x


entrypath = AUTHOR / 'NEUTRAL.finite-ideal-gas-one-image-author.selector.json'
assert bind(entrypath)['sha256'] == 'sha256:97c17bc0e41434f6f430fe6c244890a8324101f469fa130e89e9b139aaf87c14'
entry = load(entrypath)
protected = [bind(entrypath)] + [pin(entry[k]) for k in ('originalGoal', 'wholeGoalWithImage', 'image', 'promptSpecification', 'provenanceAndFormat', 'seal')]
original = load(ROOT / entry['originalGoal']['path'])
with_image = load(ROOT / entry['wholeGoalWithImage']['path'])
without_image = {k: v for k, v in with_image.items() if k != 'resourceLinks'}
assert original == without_image and len(with_image['resourceLinks']) == 1
ctxpath = HERE / 'inputs/one-whole-goal-image-and-corrected-transfers.exact.json'
ctx = load(ctxpath)
assert ctx['wholeContexts'][0]['goal'] == with_image
protected.extend([pin(ctx['correctedFullCases']), pin(ctx['correctedRawProfile'])])
current_cases = load(ROOT / ctx['correctedFullCases']['path'])
current_profile = load(ROOT / ctx['correctedRawProfile']['path'])
for lang in ('De', 'En'):
    actual = current_cases['cases'][0]['freshIndependentTransfer' + lang]
    assert actual == ctx['correctedTransferStrings']['case' + lang]
    assert actual == ctx['correctedTransferStrings']['profileAxis' + lang]
    assert actual == ctx['correctedTransferStrings']['profileBrief' + lang]
    assert actual == current_profile['profile']['variationAxes'][0]['text' + lang]
    assert actual == current_profile['profile']['applicationCaseBriefs'][0]['understandingFocus' + lang]
receiptpath = HERE / 'browser/RECEIPT.actual-unchanged-GoalCard-360-680.json'
receipt = load(receiptpath)
protected += [pin(receipt['goalCardComponent']), pin(receipt['sourceCss'])]
assert receipt['sourceUnmodified'] is True and receipt['cssOverrides'] is False
for name, field in [('capture.mjs', 'captureScript'), ('index.html', 'preview'), ('style.css', 'temporaryCssSourceDirective')]:
    archived = HERE / 'preview-sources' / name
    assert archived.read_bytes() == (PREVIEW / name).read_bytes()
    assert bind(archived) == receipt[field]
imagepath = ROOT / entry['image']['path']
asset = PREVIEW / 'assets' / (entry['goalId'] + '.png')
assert asset.is_symlink() and os.path.samefile(asset, imagepath)
assert {r['containerWidth'] for r in receipt['records']} == {360, 680}
for row in receipt['records']:
    m = row['metrics']
    assert m['naturalWidth'] == 1672 and m['naturalHeight'] == 941
    assert m['objectFit'] == 'contain' and m['complete'] is True
    assert m['imageElementWidth'] == row['containerWidth'] - 44
    assert m['imageElementHeight'] < 448
    assert row['pageErrors'] == []
    pin(row['screenshot'])
    assert row['sourceImage'] == entry['image']
module = ast.parse((ROOT / 'scripts/validate_schemas.py').read_text())
helper = next(n for n in module.body if isinstance(n, ast.FunctionDef) and n.name == 'curriculum_symlink_errors')
ns = {'Path': Path, 'PureWindowsPath': PureWindowsPath, 'os': os, 'subprocess': subprocess, 'bisect_left': bisect_left, 'CURRICULA_DIR': 'curricula'}
exec(compile(ast.Module(body=[helper], type_ignores=[]), 'bounded-portability-helper', 'exec'), ns)
errors = ns['curriculum_symlink_errors'](ROOT)
assert not errors, errors
for row in protected:
    pin(row)
write(HERE / 'INPUTS.finite-source-and-actual-GoalCard-bindings.json', {
    'schemaVersion': 1,
    'role': 'Exact whole candidate/source/transfer and actual unchanged GoalCard bindings; no inherited judgments',
    'bindings': protected,
    'actualPreviewReceipt': bind(receiptpath),
    'sourceRasterCopies': 0, 'relativePrivateAssetSymlinkUsesExactSourceFile': True,
    'archivedPreviewSourceCopiesMatchExecutedPrivatePreview': True,
    'curriculumSymlinkErrors': errors,
    'wholeGoalExceptImageLinkExact': True,
    'sixCorrectedTransferStringsExact': True,
    'actualGoalCardAndCssRemainExactAfterCapture': True,
    'unintegratedGoalCardOnly': True,
    'sourceCourseOptInHOLD': True,
    'newStrict': 0, 'normalVGranted': False,
})
stdout = json.dumps({'sourceRasterCopies': 0, 'wholeGoalExceptImageLinkExact': True, 'sixCorrectedTransferStringsExact': True, 'actualGoalCardScreenshots': [360, 680], 'goalCardAndCssUnchanged': True, 'pageErrors': [], 'curriculumSymlinkErrors': errors, 'normalVGranted': False, 'newStrict': 0}, ensure_ascii=False)
(HERE / 'ACTUAL.finite-integrity-command-output.txt').write_text(stdout + '\n')
print(stdout)
