# SPDX-License-Identifier: Apache-2.0
"""Correct only private config source addressing after the pre-Native failure."""
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


failed_receipt = OWN / 'checks/FULL426.stock-function-and-RAW15.command.actual.json'
assert load(failed_receipt)['exitCode'] == 1
assert 'semantic-kind ledger binds' in (OWN / 'checks/FULL426.stock-function-and-RAW15.stderr.actual.txt').read_text()
assert not (OWN / 'native-twenty-four').exists()
assert not (OWN / 'full426/book-model.json').exists()
assert not (OWN / 'checks/NATIVE24.prepare.command.actual.json').exists()
original_plan_path = OWN / 'checks/INPUTS.final-stable-native24.technical.json'
plan = load(original_plan_path)
HOST = REPO / plan['executionHost']
before_raw = ref(OWN / 'profiles/fifteen-whole-author-bodies.raw-E0G0.actual-resources.technical.jsonl')
original_base = REPO / plan['fullBaseConfigPath']
base = load(original_base)
base['landscapePath'] = plan['canonical']['path']
base['semanticKindLedgerPath'] = plan['semantic']['path']
base['goalVisualizationQaPath'] = plan['qa']['path']
semantic = load(REPO / base['semanticKindLedgerPath'])
assert semantic['sourceLandscapePath'] == base['landscapePath']
correct_base = OWN / 'config/full426.exact-final-semantic-source-address.stock-base.config.json'
put(correct_base, base)
draft = load(REPO / plan['nativeConfigDraftPath'])
draft['baseGoalBookConfigPath'] = correct_base.relative_to(REPO).as_posix()
correct_draft = OWN / 'config/native24.exact-source-address.draft-before-actual-order.config.json'
put(correct_draft, draft)
plan['fullBaseConfigPath'] = correct_base.relative_to(REPO).as_posix()
plan['nativeConfigDraftPath'] = correct_draft.relative_to(REPO).as_posix()
correct_plan = OWN / 'checks/INPUTS.final-stable-native24.exact-source-address.technical.json'
put(correct_plan, plan)
put(OWN / 'checks/CORRECTION.semantic-source-address-only.before-any-Native.actual.json', {
    'role': 'Own configuration address correction only; exact final semantic file remains unchanged',
    'originalFailedStockFunctionReceipt': ref(failed_receipt), 'originalPlan': ref(original_plan_path),
    'originalBaseConfig': ref(original_base), 'correctedBaseConfig': ref(correct_base),
    'correctedPlan': ref(correct_plan), 'existingRaw15Unchanged': before_raw,
    'firstFailureBeforeActualModelReturned': True, 'NativePrepareRunsBeforeCorrection': 0,
    'NativeCheckRunsBeforeCorrection': 0, 'PdfRendersBeforeCorrection': 0,
    'allowedAdditionalExplicitFullModelAttempt': 1, 'allowedNativePrepareRuns': 1,
    'allowedNativeCheckRuns': 1, 'canonicalSemanticQaSourceChanges': 0,
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
command('FULL426.correct-source-address.stock-function', [tsx, str(OWN / 'scripts/bind_raw15_and_build_full426.mts'), 'checks/INPUTS.final-stable-native24.exact-source-address.technical.json'])
assert ref(OWN / 'profiles/fifteen-whole-author-bodies.raw-E0G0.actual-resources.technical.jsonl') == before_raw
for mode in ['prepare', 'check']:
    command('NATIVE24.' + mode, [tsx, str(HOST / 'app/scripts/materializeGoalDescriptionRolloutBatch.ts'), mode, '--config', plan['nativeConfigPath']])
for field in ['canonical', 'semantic', 'qa']:
    assert ref(REPO / plan[field]['path']) == plan[field]
for asset in plan['assets']:
    if asset['goalId'] in plan['selectedGoalIds']:
        assert ref(REPO / asset['physicalRepositorySource']['path']) == asset['physicalRepositorySource']
print(json.dumps({'fullModelPages': 426, 'NativePages': 24, 'failedPreNativeModelAttempts': 1, 'successfulExplicitModelCalls': 1, 'NativePrepareCalls': 1, 'NativeCheckCalls': 1, 'newScientificVotes': 0}), flush=True)
