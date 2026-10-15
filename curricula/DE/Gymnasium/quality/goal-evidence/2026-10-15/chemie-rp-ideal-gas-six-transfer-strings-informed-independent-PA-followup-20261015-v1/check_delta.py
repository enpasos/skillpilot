# SPDX-License-Identifier: Apache-2.0
"""Finite six-string independent followup, writes only its own review root."""
import ast
from bisect import bisect_left
from decimal import Decimal as D
import hashlib
import json
import os
from pathlib import Path, PureWindowsPath
import subprocess

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[6]
DAY = HERE.parent
AUTHOR = DAY / 'chemie-rp-ideal-gas-variable-volume-transfer-author-successor-20261015-v1'
ORIGINAL = DAY / 'chemie-rp-kp-gas-law-whole-source-closure-author-20261015-v1'
PREVIOUS = DAY / 'chemie-rp-gas-law-whole-source-informed-independent-PA-20261015-v1'
ENTRY = AUTHOR / 'NEUTRAL.finite-six-string-gas-transfer-author.selector.json'


def load(p):
    return json.loads(p.read_text())


def bind(p):
    data = p.read_bytes()
    return {'path': p.relative_to(ROOT).as_posix(), 'sha256': 'sha256:' + hashlib.sha256(data).hexdigest(), 'bytes': len(data)}


def pin(row):
    assert bind(ROOT / row['path']) == row
    return row


def write(p, data):
    p.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')
    assert load(p) == data


def delta(a, b, path=''):
    assert type(a) == type(b)
    if isinstance(a, dict):
        assert set(a) == set(b)
        return [d for k in sorted(a) for d in delta(a[k], b[k], path + '/' + k)]
    if isinstance(a, list):
        assert len(a) == len(b)
        return [d for i, (x, y) in enumerate(zip(a, b)) for d in delta(x, y, path + '/' + str(i))]
    return [] if a == b else [{'path': path, 'before': a, 'after': b}]


assert bind(ENTRY)['sha256'] == 'sha256:bd7778cab102fcebfe4230fe30e04b1a58ef07265488ea9c740a291bb9e8ac40'
entry = load(ENTRY)
protected = [bind(ENTRY)] + [pin(entry[k]) for k in ('cases', 'rawProfile', 'delta', 'seal')]
author_delta = load(ROOT / entry['delta']['path'])
old_cases = ROOT / author_delta['originalCases']['path']
old_profile = ROOT / author_delta['originalRawProfile']['path']
protected += [pin(author_delta['originalCases']), pin(author_delta['originalRawProfile'])]
prior_seal = PREVIOUS / 'FILES.finite-informed-independent-PA.seal.json'
assert bind(prior_seal)['sha256'] == 'sha256:c22da3bb61d97a65f9f77a6dd30c2756a160b2ae85a5c68b90adf2ee67c4b542'
protected += [bind(prior_seal)] + [pin(r) for r in load(prior_seal)['payloadFiles']]
oldc, newc = load(old_cases), load(ROOT / entry['cases']['path'])
oldp, newp = load(old_profile), load(ROOT / entry['rawProfile']['path'])
dc, dp = delta(oldc, newc), delta(oldp, newp)
expectedc = {'/cases/0/freshIndependentTransferDe', '/cases/0/freshIndependentTransferEn'}
expectedp = {'/profile/variationAxes/0/textDe', '/profile/variationAxes/0/textEn', '/profile/applicationCaseBriefs/0/understandingFocusDe', '/profile/applicationCaseBriefs/0/understandingFocusEn', '/fullCasesPath'}
assert {d['path'] for d in dc} == expectedc
assert {d['path'] for d in dp} == expectedp
assert oldc['cases'][1] == newc['cases'][1]
assert newp['fullCasesPath'] == entry['cases']['path']
for lang in ('De', 'En'):
    text = newc['cases'][0]['freshIndependentTransfer' + lang]
    assert text == newp['profile']['variationAxes'][0]['text' + lang]
    assert text == newp['profile']['applicationCaseBriefs'][0]['understandingFocus' + lang]
p = D('.0800') * D('8.314') * D('323.15') / D('.00400')
assert p == D('53733.382')
# Required portability helper only; no full schema or central check.
module = ast.parse((ROOT / 'scripts/validate_schemas.py').read_text())
helper = next(n for n in module.body if isinstance(n, ast.FunctionDef) and n.name == 'curriculum_symlink_errors')
ns = {'Path': Path, 'PureWindowsPath': PureWindowsPath, 'os': os, 'subprocess': subprocess, 'bisect_left': bisect_left, 'CURRICULA_DIR': 'curricula'}
exec(compile(ast.Module(body=[helper], type_ignores=[]), 'bounded-portability-helper', 'exec'), ns)
errors = ns['curriculum_symlink_errors'](ROOT)
assert not errors, errors
for row in protected:
    pin(row)
write(HERE / 'ACTUAL.exact-six-string-delta-and-independent-result.json', {
    'schemaVersion': 1, 'role': 'Targeted informed independent P-material followup',
    'exactCaseDeltas': dc, 'exactProfileDeltas': dp,
    'allOtherScienceAndCaseBExact': True, 'transferPa': str(p), 'transferBar': str(p / D('100000')),
    'caseAndTwoProfileCopiesIdenticalInEachLanguage': True,
    'F1ResolvedForSuccessorOnly': True, 'correctedRawPScientificSuitabilityAccepted': True,
    'normalPGranted': False, 'newDReview': False,
    'sourceCourseOptInHOLD': True, 'newStrict': 0,
    'humanApproval': False, 'humanTrial': False, 'measurementOrLearnerAction': False,
    'runtimeWrites': 0, 'normalQaWrites': 0, 'registryWrites': 0, 'gitWrites': 0,
    'centralRuns': 0, 'fullBuilds': 0, 'curriculumSymlinkErrors': errors,
    'protectedInputBindings': protected,
})
stdout = json.dumps({'caseTransferStringsChanged': len(dc), 'profileTransferStringsChanged': len(dp) - 1, 'fullCasesPathOnlyAdditionalChange': True, 'F1Resolved': True, 'correctedRawPScientificSuitabilityAccepted': True, 'sourceCourseOptIn': 'HOLD', 'normalVotes': 0, 'newStrict': 0}, ensure_ascii=False)
(HERE / 'ACTUAL.command-output.txt').write_text(stdout + '\n')
print(stdout)
