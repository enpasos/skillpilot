#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Replay the unchanged duration generator against the exact five-field draft.

All source, policy, kind and generated-view writes are private RAM candidates.
This contains no live-application mode, and never refreshes historical reviews.
"""
import copy
import hashlib
import json
import re
import shutil
import subprocess
import sys
import time
from pathlib import Path

sys.dont_write_bytecode = True
ROOT = Path(__file__).resolve().parents[4]
HERE = Path(__file__).resolve().parent
RAM = Path('/dev/shm/skillpilot-math-final967a-duration-20261106')
SOURCE = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json'
KINDS = 'curricula/DE/Gymnasium/quality/release-model/mathematik.semantic-kinds.json'
POLICY = 'app/scripts/config/math-duration-split-spanning-tree-policy.json'
GENERATOR = 'app/scripts/generateMathDurationCompositionViews.ts'
VIEWS = 'curricula/DE/Gymnasium/composition-views/mathematik'
BASE_SOURCE_SHA = 'da4724ae0db70d85cae68eb273df663f59b17b2ca761a86181fa462299a123b6'
CANDIDATE_SOURCE_SHA = '967a9cf8f27c5ee678777401697ba8b69874dbc889f7cfe753267f7c5a05c318'
BASE_POLICY_SHA = '4415411350eabee64077f9c4769603814a428b9d3f3421cfaa7ceda1339f3227'


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def load(path):
    return json.loads(path.read_bytes())


def dump(path, value):
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')


def pin(path):
    return {'path': str(path.relative_to(ROOT)) if path.is_relative_to(ROOT) else str(path),
            'sha256': sha(path), 'bytes': path.stat().st_size}


def main():
    assert not RAM.exists(), 'Never overwrite an existing private replay'
    RAM.mkdir()
    (RAM / 'logs').mkdir()
    assert sha(ROOT / SOURCE) == BASE_SOURCE_SHA
    assert sha(ROOT / POLICY) == BASE_POLICY_SHA
    assert sha(ROOT / KINDS) == '78a5f2d9b4f48f35f2871b2c8b59f51c60bea5e2e2dde7857f6bdad85672472b'
    assert sha(ROOT / GENERATOR) == '817a3652b44ef182608d8277ae6a57aa2ac68d2d5401cb480079f010e420c79d'
    field_plan = ROOT / 'qa-artifacts/ci-contract-audit/2026-11-06/math-diagram-description-resolution-2026-11-06/source-field-plan.json'
    plan = load(field_plan)
    original_source = load(ROOT / SOURCE)
    candidate = copy.deepcopy(original_source)
    assert len(plan['operations']) == 5
    for operation in plan['operations']:
        _, array, index, field = operation['pointer'].split('/')
        assert array == 'goals' and field in {'requires', 'description', 'descriptionEn'}
        goal = candidate[array][int(index)]
        assert goal['id'] == operation['goalId'] and goal[field] == operation['oldValue']
        goal[field] = operation['newValue']
    dump(RAM / 'candidate-source.json', candidate)
    assert sha(RAM / 'candidate-source.json') == CANDIDATE_SOURCE_SHA
    (RAM / 'baseline-source.json').write_bytes((ROOT / SOURCE).read_bytes())
    (RAM / 'baseline-kinds.json').write_bytes((ROOT / KINDS).read_bytes())
    candidate_kinds = ROOT / 'tmp/math-diagram-recheck-preparer-20261106/kind-ledger.json'
    (RAM / 'candidate-kinds.json').write_bytes(candidate_kinds.read_bytes())
    old_kinds, new_kinds = load(RAM / 'baseline-kinds.json'), load(RAM / 'candidate-kinds.json')
    kind_projection = lambda obj: [(row['goalId'], row['semanticKind'], row['decisionStatus']) for row in obj['decisions']]
    assert kind_projection(old_kinds) == kind_projection(new_kinds)
    assert old_kinds['counts'] == new_kinds['counts']
    original_policy = load(ROOT / POLICY)
    policy = copy.deepcopy(original_policy)
    assert policy['inputs']['canonical']['sha256'] == BASE_SOURCE_SHA
    policy['inputs']['canonical']['sha256'] = CANDIDATE_SOURCE_SHA
    dump(RAM / 'candidate-policy.json', policy)
    (RAM / 'baseline-policy.json').write_bytes((ROOT / POLICY).read_bytes())
    back = copy.deepcopy(policy)
    back['inputs']['canonical']['sha256'] = BASE_SOURCE_SHA
    assert back == original_policy
    assert (json.dumps(original_policy, ensure_ascii=False, indent=2) + '\n').encode() == (ROOT / POLICY).read_bytes()
    dump(HERE / 'candidate-policy.json', policy)
    output_names = [row['fileName'] for row in policy['sek1Templates']] + [row['outputFileName'] for row in policy['crossStageTemplates']]
    base_names = [row['baseViewFileName'] for row in policy['crossStageTemplates']]
    files = sorted(set(output_names + base_names))
    assert len(output_names) == len(set(output_names)) == 18 and len(files) == 24
    live_pins = {name: sha(ROOT / VIEWS / name) for name in files}
    for label in ['baseline', 'candidate']:
        dest = RAM / (label + '-views')
        dest.mkdir()
        for name in files:
            shutil.copyfile(ROOT / VIEWS / name, dest / name)
    # Check every actually bound adjudication/decision, not just policy equality.
    bound = []
    for row in policy['inputs']['additiveAdjudications']:
        path = ROOT / row['path']
        assert sha(path) == row['fileSha256']
        obj = load(path)
        digest = obj.pop('adjudicationDigest')
        assert digest == row['adjudicationDigest'] == 'sha256:' + hashlib.sha256(json.dumps(obj, ensure_ascii=False, separators=(',', ':')).encode()).hexdigest()
        bound.append(pin(path))
    for row in policy['inputs']['sourceScopeDecisions']:
        path = ROOT / row['path']
        assert sha(path) == row['sha256']
        bound.append(pin(path))
    parent = policy['inputs']['parentDerivativeReceipt']
    assert sha(ROOT / parent['path']) == parent['fileSha256']
    assert load(ROOT / parent['path'])['receiptDigest'] == parent['receiptDigest']
    bound.append(pin(ROOT / parent['path']))
    assert len(bound) == 13
    original_active_pins = {name: sha(ROOT / name) for name in [SOURCE, KINDS, POLICY, GENERATOR]}
    records = []

    def run(label, source, kinds, policy_path, views, write=False, expected_error=None, extra=()):
        cmd = ['bwrap', '--die-with-parent', '--unshare-net', '--ro-bind', '/', '/', '--proc', '/proc', '--dev', '/dev', '--tmpfs', '/tmp',
               '--ro-bind', str(RAM), str(RAM), '--ro-bind', str(source), str(ROOT / SOURCE),
               '--ro-bind', str(kinds), str(ROOT / KINDS), '--ro-bind', str(policy_path), str(ROOT / POLICY),
               '--bind' if write else '--ro-bind', str(views), str(ROOT / VIEWS),
               '--bind', str(RAM / 'logs'), str(RAM / 'logs')]
        for private, active in extra:
            cmd += ['--ro-bind', str(private), str(active)]
        cmd += ['--chdir', str(ROOT), '--', 'strace', '-f', '-qq', '-s', '4096', '-e', 'trace=openat', '-o',
                str(RAM / 'logs' / (label + '.openat.trace')), str(ROOT / 'app/node_modules/.bin/tsx'), GENERATOR,
                '--write' if write else '--check']
        t = time.monotonic()
        with (HERE / (label + '.log')).open('wb') as out:
            code = subprocess.run(cmd, stdout=out, stderr=subprocess.STDOUT).returncode
        log = (HERE / (label + '.log')).read_text()
        row = {'case': label, 'exitCode': code, 'seconds': time.monotonic() - t,
               'sourceSha256': sha(source), 'kindSha256': sha(kinds), 'policySha256': sha(policy_path),
               'expectedError': expected_error, 'log': pin(HERE / (label + '.log')), 'command': cmd,
               'trace': pin(RAM / 'logs' / (label + '.openat.trace'))}
        records.append(row)
        dump(HERE / 'execution.json', records)
        assert code == (1 if expected_error else 0), (label, code, log)
        if expected_error:
            assert expected_error in log, (label, log)
        assert all(sha(ROOT / name) == value for name, value in original_active_pins.items())
        assert all(sha(ROOT / VIEWS / name) == value for name, value in live_pins.items())
        print(json.dumps({'case': label, 'exitCode': code, 'seconds': row['seconds']}), flush=True)

    # Genuine unchanged-policy RED before creating any candidate output.
    run('candidate-original-policy-red', RAM / 'candidate-source.json', RAM / 'candidate-kinds.json', RAM / 'baseline-policy.json', RAM / 'candidate-views',
        expected_error='Invalid reviewed split-layout plan')
    for label in ['baseline', 'candidate']:
        for write in [True, False]:
            run(label + ('-generate' if write else '-check'), RAM / (label + '-source.json'), RAM / (label + '-kinds.json'),
                RAM / (label + '-policy.json'), RAM / (label + '-views'), write)
    outputs = []
    for name in output_names:
        old, new, live = RAM / 'baseline-views' / name, RAM / 'candidate-views' / name, ROOT / VIEWS / name
        assert old.read_bytes() == new.read_bytes() == live.read_bytes(), name
        outputs.append({'fileName': name, 'baselineGeneratedSha256': sha(old), 'candidateGeneratedSha256': sha(new),
                        'liveSha256': sha(live), 'bytes': live.stat().st_size, 'allThreeRawBytesEqual': True})
    for name in set(files) - set(output_names):
        assert sha(RAM / 'baseline-views' / name) == sha(RAM / 'candidate-views' / name) == live_pins[name]
    # Existing hard guards remain real negatives under the fresh candidate pin.
    changed = copy.deepcopy(candidate)
    changed['goals'][0]['title'] += ' unreviewed source mutation'
    dump(RAM / 'negative-source.json', changed)
    run('unreviewed-canonical-text', RAM / 'negative-source.json', RAM / 'candidate-kinds.json', RAM / 'candidate-policy.json', RAM / 'candidate-views',
        expected_error='Invalid reviewed split-layout plan')
    for key, expected in [('additiveAdjudications', 'Invalid additive split-layout adjudication'), ('sourceScopeDecisions', 'Stale source-scope decision')]:
        actual = ROOT / policy['inputs'][key][0]['path']
        private = RAM / (key + '.negative')
        private.write_bytes(actual.read_bytes() + b' ')
        run('changed-' + key, RAM / 'candidate-source.json', RAM / 'candidate-kinds.json', RAM / 'candidate-policy.json', RAM / 'candidate-views',
            expected_error=expected, extra=[(private, actual)])
    stale = RAM / 'stale-views'
    shutil.copytree(RAM / 'candidate-views', stale)
    obj = load(stale / output_names[0])
    obj['viewId'] += '-stale-output'
    dump(stale / output_names[0], obj)
    run('stale-generated-output', RAM / 'candidate-source.json', RAM / 'candidate-kinds.json', RAM / 'candidate-policy.json', stale,
        expected_error='1 generated Mathematik G8/G9 composition view file(s) are not up to date')
    dump(HERE / 'output-comparison.json', {'outputs': outputs, 'all18BaselineCandidateLiveRawBytesEqual': True,
                                         'allSixOtherBaseViewsUnchanged': True, 'activeSourceKindPolicyAnd24ViewsUnchanged': True})
    dump(HERE / 'input-binding-review.json', {
        'sourceFieldPlan': pin(field_plan), 'exactlyFiveSourceFieldsReconstructed': True,
        'candidateSourceSha256': CANDIDATE_SOURCE_SHA, 'originalPolicy': pin(ROOT / POLICY), 'candidatePolicy': pin(HERE / 'candidate-policy.json'),
        'onlyPolicyChange': '/inputs/canonical/sha256', 'allTemplatePlacementScopeRoleDescriptorsUnchanged': True,
        'sixSek1Templates': len(policy['sek1Templates']), 'splitPlacements': sum(len(row['placements']) for row in policy['sek1Templates']),
        'crossStageTemplates': len(policy['crossStageTemplates']), 'originalKind': pin(ROOT / KINDS), 'candidateKind': pin(RAM / 'candidate-kinds.json'),
        'authoritativeSemanticKindLabelsStatusesAndCountsIdentical': True, 'all13CurrentBoundOriginalReviewFilesValidated': bound,
        'historicalExtractionProvenanceNotRebound': policy['inputs']['extractionProvenance'],
        'baseline24ViewPins': live_pins, 'unchangedGenerator': pin(ROOT / GENERATOR),
        'noLiveSourceQaPolicyViewOrHistoricalReviewWrites': True,
    })
    print('Finite generator/guard replay complete. Native layout/scope comparison remains separate.', flush=True)


if __name__ == '__main__':
    main()
