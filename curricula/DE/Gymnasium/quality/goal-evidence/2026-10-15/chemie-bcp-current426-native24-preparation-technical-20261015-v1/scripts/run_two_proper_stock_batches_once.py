# SPDX-License-Identifier: Apache-2.0
"""Exactly two valid stock batches after preserving the max20 schema rejection."""
from pathlib import Path
import datetime
import hashlib
import json
import subprocess
import time

REPO = Path.cwd()
OWN = Path(__file__).resolve().parents[1]
REL = OWN.relative_to(REPO).as_posix()


def load(path):
    return json.loads(path.read_text())


def ref(path):
    body = path.read_bytes()
    return {'path': path.relative_to(REPO).as_posix(), 'sha256': 'sha256:' + hashlib.sha256(body).hexdigest(), 'bytes': len(body)}


def put(path, value):
    assert not path.exists(), path
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')


failed = OWN / 'checks/NATIVE24.prepare.command.actual.json'
assert load(failed)['exitCode'] == 1
assert 'must NOT have more than 20 items' in (OWN / 'checks/NATIVE24.prepare.stderr.actual.txt').read_text()
assert not (OWN / 'native-twenty-four').exists()
full_path = OWN / 'full426/book-model.json'
full_before = ref(full_path)
full = load(full_path)
assert len(full['pages']) == 426
plan = load(OWN / 'checks/INPUTS.final-stable-native24.exact-source-address.technical.json')
HOST = REPO / plan['executionHost']
all_config = load(REPO / plan['nativeConfigPath'])
subsets = [('bcp-fifteen', plan['newTenGoalIds'] + plan['retainedFiveGoalIds'], 15),
           ('relations-nine', plan['changedRelationNineGoalIds'], 9)]
batches = []
for label, ids, expected in subsets:
    chosen = set(ids)
    ordered = [row['goalId'] for row in full['pages'] if row['goalId'] in chosen]
    assert len(ordered) == expected
    cfg = dict(all_config)
    cfg.update(batchId='chemie-bcp-current426-' + label + '-technical-20261015-v1',
               bookId='chemie-bcp-current426-' + label + '-technical-20261015-v1',
               title='Chemie – BcP: ' + ('15 Lernziele' if expected == 15 else 'neun Beziehungskontexte'),
               goalIds=ordered, outputDirectory=REL + '/native-' + label)
    config_path = OWN / ('config/native-' + label + '.normal-stock-prepare.config.json')
    put(config_path, cfg)
    batches.append({'label': label, 'expectedGoalCount': expected, 'goalIds': ordered,
                    'configPath': config_path.relative_to(REPO).as_posix(),
                    'outputDirectory': cfg['outputDirectory']})
plan['batches'] = batches
plan['single24StockConfigRejectedBeforeRender'] = ref(failed)
plan['rootAuthorizedProperNativeBatchSizes'] = [15, 9]
new_plan = OWN / 'checks/INPUTS.two-proper-stock-batches15-and9.technical.json'
put(new_plan, plan)
put(OWN / 'checks/CORRECTION.stock-max20-respected-two-batches.before-render.actual.json', {
    'role': 'Root-authorized proper15+9 split; unchanged max20 contract retained',
    'rejected24Config': ref(REPO / plan['nativeConfigPath']), 'rejectionReceipt': ref(failed),
    'stockConfigSchema': ref(REPO / 'contracts/goal-description-review/v1/goal-description-rollout-batch-config.schema.json'),
    'existingSuccessfulFull426ModelRetained': full_before,
    'twoProperConfigs': [ref(REPO / row['configPath']) for row in batches],
    'additionalExplicitFullModelBuilds': 0, 'newScientificVotes': 0,
})


def command(label, argv):
    started = datetime.datetime.now(datetime.timezone.utc).isoformat()
    clock = time.monotonic()
    proc = subprocess.run(argv, cwd=HOST, capture_output=True)
    stdout = OWN / 'checks' / (label + '.stdout.actual.txt')
    stderr = OWN / 'checks' / (label + '.stderr.actual.txt')
    assert not stdout.exists() and not stderr.exists()
    stdout.write_bytes(proc.stdout)
    stderr.write_bytes(proc.stderr)
    put(OWN / 'checks' / (label + '.command.actual.json'), {
        'argv': argv, 'cwd': plan['executionHost'], 'startedAtUTC': started,
        'completedAtUTC': datetime.datetime.now(datetime.timezone.utc).isoformat(),
        'elapsedSeconds': round(time.monotonic() - clock, 3), 'exitCode': proc.returncode,
        'stdout': ref(stdout), 'stderr': ref(stderr), 'actualInvocationNumberForThisLabel': 1,
        'newScientificVotes': 0, 'centralRuns': 0,
    })
    print(json.dumps({'label': label, 'exitCode': proc.returncode, 'elapsedSeconds': round(time.monotonic() - clock, 3)}), flush=True)
    if proc.returncode:
        raise SystemExit(proc.stderr.decode() + proc.stdout.decode())


tsx = str(REPO / 'app/node_modules/.bin/tsx')
command('PRECHECK.two-proper-stock-configs', [tsx, str(OWN / 'scripts/preflight_two_stock_batches_no_build.mts')])
for batch in batches:
    for mode in ['prepare', 'check']:
        command('NATIVE.' + batch['label'] + '.' + mode, [tsx, str(HOST / 'app/scripts/materializeGoalDescriptionRolloutBatch.ts'), mode, '--config', batch['configPath']])
assert ref(full_path) == full_before
for field in ['canonical', 'semantic', 'qa']:
    assert ref(REPO / plan[field]['path']) == plan[field]
for asset in plan['assets']:
    if asset['goalId'] in plan['selectedGoalIds']:
        assert ref(REPO / asset['physicalRepositorySource']['path']) == asset['physicalRepositorySource']
print(json.dumps({'actualSuccessfulNativeBatches': [15, 9], 'full426ModelRetainedByteExact': True, 'newExplicitFullModelBuilds': 0, 'newScientificVotes': 0}), flush=True)
