#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Own bounded provenance, arithmetic and portability check; no builds or QA writes."""
import ast
from datetime import datetime, timezone
from decimal import Decimal as D, getcontext
import hashlib
import json
import os
from pathlib import Path
import subprocess
from bisect import bisect_left
from pathlib import PureWindowsPath

import jsonschema

ROOT = Path(__file__).resolve().parents[8]
HERE = Path(__file__).resolve().parents[1]
AUTHOR = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-rp-kp-gas-law-whole-source-closure-author-20261015-v1'
SELECTOR = AUTHOR / 'OUTPUTS.finite-RP-Kp-gas-law-whole-source-author.selector.json'
NEW = '5db51274-dc1e-5e5a-80ad-4df26add7d42'
KP = 'a8ddb351-3501-5b6d-a908-c82a5d2f14d4'
SOURCE = 'rp-chem-sekii-rp-ch-sekii-2022-baustein-7-5-010-d11b3fc1'


def load(path):
    return json.loads(path.read_text(encoding='utf-8'))


def digest(path):
    b = path.read_bytes()
    return {'path': path.relative_to(ROOT).as_posix(), 'sha256': 'sha256:' + hashlib.sha256(b).hexdigest(), 'bytes': len(b)}


def write(name, data):
    path = HERE / name
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    assert load(path) == data


def pinned(entry):
    actual = digest(ROOT / entry['path'])
    assert actual['sha256'] == entry['sha256'], (actual, entry)
    if 'bytes' in entry:
        assert actual['bytes'] == entry['bytes'], (actual, entry)
    return actual


assert digest(SELECTOR)['sha256'] == 'sha256:e617e618dd2f84c77aa89d27429cc80e2cb197c95046fc07cd8e3996a7b54772'
selector = load(SELECTOR)
protected = [digest(SELECTOR)]
protected += [pinned(v) for v in selector['files'].values()]
protected.append(pinned(selector['baseInactiveCanonical']))
source_refs = load(AUTHOR / 'inputs/finite-original-source-and-contract-selection.json')
for entry in [source_refs['sourceExtraction'], *source_refs['mappingCopies'], *source_refs['defaultRPViews'], *source_refs['contracts']]:
    protected.append(pinned(entry))
pdf = ROOT / 'curricula/DE/Gymnasium/input/RP/Chemie_Sekundarstufe_II_MSS_2022.pdf'
assert digest(pdf)['sha256'] == 'sha256:8d701aad7c4de870d6e20075ec49c04601d5cb51a90f51443a15be8efd62c4e3'
protected.append(digest(pdf))
protected = list({r['path']: r for r in protected}.values())

goal = load(AUTHOR / 'candidate/one-new-whole-ideal-gas-model-goal.unreviewed-author.json')
cases = load(AUTHOR / 'materials/two-whole-ideal-gas-DEEN-cases.unreviewed-author.json')
profile = load(AUTHOR / 'materials/raw-positive-understanding-profile.unreviewed-author.json')
partners = load(AUTHOR / 'inputs/six-whole-canonical-partners-and-context.exact.json')
kp_cases = load(AUTHOR / 'inputs/a8-two-whole-cases-and-original-profile.exact.json')
base = load(ROOT / selector['baseInactiveCanonical']['path'])
goals = {g['id']: g for g in base['goals']}
assert NEW not in goals and goal['id'] == NEW and goal['contains'] == []
assert all(g in goals for g in goal['requires'])
assert next(g for g in partners['wholeGoals'] if g['id'] == KP) == goals[KP]
assert {c['id'] for c in cases['cases']} == {'rp-ideal-gas-a', 'rp-ideal-gas-b'}
assert {c['id'] for c in kp_cases['cases']} == {'eqrk16-07-a', 'eqrk16-07-b'}
assert profile['goalId'] == NEW
assert {e['id'] for e in profile['profile']['expectations']} == {'e1', 'e2', 'e3'}
extraction = load(ROOT / source_refs['sourceExtraction']['path'])
inventory = extraction.get('goals', extraction.get('sourceGoals'))
assert inventory is not None and len(inventory) == 325
assert sum(g['id'] == SOURCE for g in inventory) == 1

schema = load(ROOT / 'contracts/curriculum-package/v1/composition-view.schema.json')
views = []
for course in ('gk', 'lk'):
    proposed = load(AUTHOR / f'candidate/unregistered-optional-{course}.view.author.json')
    default = load(ROOT / f'curricula/DE/Gymnasium/composition-views/chemie/de-rp-{course}.view.json')
    jsonschema.Draft202012Validator(schema).validate(proposed)
    entries = [x for root in proposed['rootNodes'] for x in root['children']]
    assert {e['goalId'] for e in entries if e['projectionRole'] == 'target'} == {NEW, KP}
    assert proposed['scope'] != default['scope']
    assert proposed['scope']['stage'] == 'SekII' and default['scope']['stage'] == 'CrossStage'
    views.append({'course': course.upper(), 'schemaValid': True, 'candidateScope': proposed['scope'], 'defaultScope': default['scope'], 'sameLiteralScopeAsCurrentDefault': False, 'explicitOptInProven': False, 'registered': False})

getcontext().prec = 28
r = D('8.314')
calculations = {
    'gasA': {
        'pressure1Pa': D('.0800') * r * D('293.15') / D('.00200'),
        'pressure2Pa': D('.0800') * r * D('323.15') / D('.00200'),
        'pressureRatio': D('323.15') / D('293.15'),
        'pressureIncreasePercent': (D('323.15') / D('293.15') - 1) * 100,
        'temperatureFor1_20barK': D('120000') * D('.00200') / (D('.0800') * r),
        'transferPressurePa': D('.0800') * r * D('323.15') / D('.00400'),
    },
    'gasB': {
        'initialAbsolutePressureBar': D('.20') + D('1.00'),
        'amountMol': D('1.20') * D('1.50') / (D('.08314') * D('300.15')),
        'volume2L': D('1.20') * D('1.50') * D('320.15') / (D('.90') * D('300.15')),
        'temperature3K': D('1.00') * D('2.00') * D('300.15') / (D('1.20') * D('1.50')),
        'densePVJ': D('4e6') * D('.000500'),
        'denseNRTJ': r * D('300'),
        'denseZ': D('2000') / (r * D('300')),
        'denseDeviationPercent': (1 - D('2000') / (r * D('300'))) * 100,
        'transferAbsolutePressureBar': D('1.20') * D('1.50') / D('1.00'),
        'transferGaugePressureBar': D('1.20') * D('1.50') / D('1.00') - D('1.00'),
    },
    'kpA': {
        'deltaNu': D('1'),
        'normalisedFactor': D('.08314') * D('298'),
        'Kp': D('.00500') * D('.08314') * D('298'),
        'doubledDeltaNu': D('2'),
        'doubledKc': D('.00500') ** 2,
        'doubledKp': (D('.00500') * D('.08314') * D('298')) ** 2,
    },
    'kpB': {
        'modelIdeltaNu': D('0'), 'modelIKp': D('4.00'),
        'modelIIdeltaNu': D('1'),
        'normalisedFactor': D('.08314') * D('500'),
        'modelIIKc': D('.200') / (D('.08314') * D('500')),
    },
}
serialised = {case: {k: str(v) for k, v in values.items()} for case, values in calculations.items()}
assert calculations['gasB']['denseDeviationPercent'] > D('2')
write('checks/ACTUAL.own-independent-arithmetic.json', {
    'role': 'Independent deterministic model calculations, never a physical measurement or learner action',
    'precisionDigits': 28, 'suppliedRUsedRatherThanSubstitutedModernConstant': True,
    'formulas': ['p=nRT/V', 'p1V1/T1=p2V2/T2 at fixed n', 'Z=pV/(nRT)', 'Kp=Kc(RTc0/p0)^deltaNu'],
    'results': serialised, 'numericCorrectionsRequired': 0,
})

# Extract and execute only the required portability helper, not validate_schemas main.
module = ast.parse((ROOT / 'scripts/validate_schemas.py').read_text(encoding='utf-8'))
helper = next(n for n in module.body if isinstance(n, ast.FunctionDef) and n.name == 'curriculum_symlink_errors')
namespace = {'Path': Path, 'PureWindowsPath': PureWindowsPath, 'os': os, 'subprocess': subprocess, 'bisect_left': bisect_left, 'CURRICULA_DIR': 'curricula'}
exec(compile(ast.Module(body=[helper], type_ignores=[]), 'bounded-curriculum-symlink-helper', 'exec'), namespace)
symlinks = namespace['curriculum_symlink_errors'](ROOT)
assert not symlinks, symlinks
for expected in protected:
    assert digest(ROOT / expected['path']) == expected
write('INPUTS.finite-exact-bindings.json', {
    'schemaVersion': 1, 'role': 'Finite exact input integrity only; hashes do not import peer judgments',
    'reviewedScientifically': [
        'whole new gas atom; both complete DE/EN gas cases; full raw gas P profile',
        'whole existing Kp atom; both complete DE/EN Kp cases; original scientific Kp profile body',
        'official local RP PDF physical/printed pages 19,20,50,51,52 viewed in full',
        'whole source cell, corrected cell, enrichment passage, two partial contributor recipe, two optional views and explicit-selection recipe',
        'six whole canonical contextual partner goals except out-of-scope capstone assessment',
    ],
    'notReadAsScientificAuthority': [
        'prior independent FIRST reviewer verdicts linked by author input index',
        'a8-current-selected-P-whole-row.exact.json normal peer judgment',
        'author preflight outcomes and source-closure assertions',
    ],
    'bindings': protected,
})
write('checks/ACTUAL.finite-integrity-and-portability.json', {
    'schemaVersion': 1, 'completedAtUtc': datetime.now(timezone.utc).isoformat(),
    'inputBindingsVerified': len(protected), 'protectedInputsRemainByteExact': True,
    'sourceInventory': 325, 'other324SourceDecisionsReReviewed': False,
    'views': views, 'curriculumSymlinkErrors': symlinks,
    'centralQualityRuns': 0, 'fullBuilds': 0, 'runtimeWrites': 0,
    'registryWrites': 0, 'normalQaWrites': 0, 'gitWrites': 0,
    'scope': 'Own finite bytes, independent model arithmetic, two candidate view schemas and mandatory symlink helper only',
})
stdout = json.dumps({'protectedInputsVerified': len(protected), 'candidateViewSchemasValid': 2, 'curriculumSymlinkErrors': len(symlinks), 'independentArithmetic': 'completed', 'sourceOrCourseIntegrationAccepted': False, 'normalVotesWritten': 0}, ensure_ascii=False)
(HERE / 'checks/ACTUAL.command-output.txt').write_text(stdout + '\n', encoding='utf-8')
print(stdout)
