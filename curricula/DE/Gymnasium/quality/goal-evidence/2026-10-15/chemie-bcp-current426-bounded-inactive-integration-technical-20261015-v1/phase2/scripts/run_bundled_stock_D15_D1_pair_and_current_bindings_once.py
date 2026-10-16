# SPDX-License-Identifier: Apache-2.0
"""One necessary stock closure sequence for each genuine D15 and D1 pair."""
from pathlib import Path
import datetime
import hashlib
import json
import subprocess
import time

REPO = Path.cwd()
OWN = Path(__file__).resolve().parents[1]


def load(path):
    return json.loads(path.read_text())


def ref(path):
    b = path.read_bytes()
    return {'path': path.relative_to(REPO).as_posix(), 'sha256': 'sha256:' + hashlib.sha256(b).hexdigest(), 'bytes': len(b)}


def put(path, value):
    assert not path.exists(), path
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')


transport_path = OWN / 'TRANSPORT.genuine-D15-D1-own-original-science.exact.json'
transport = load(transport_path)
assert transport['normalRecords'] == 32 and transport['ownUnderstandingFieldsWordExact'] == 192
assert not (OWN / 'checks/STOCK.D15-D1.bundled-pair-and-current-binding.started.json').exists()
put(OWN / 'checks/STOCK.D15-D1.bundled-pair-and-current-binding.started.json', {
    'startedAtUTC': datetime.datetime.now(datetime.timezone.utc).isoformat(),
    'rootRelease': transport['rootRelease'], 'genuineTransport': ref(transport_path),
    'allowedBatches': [15, 1], 'normalRecords': 32, 'additionalRenders': 0, 'CentralRuns': 0,
})
receipts = []
for batch in transport['batches']:
    label = batch['batch']
    config = batch['configPath']
    root = REPO / batch['batchDirectory']
    assert not (root / 'resolution-index.json').exists()
    assert 'deferredGoals' not in load(root / 'synthesis-authoring.json')
    commands = [
        ('summarize', 'materializeGoalDescriptionRolloutBatch.ts', ['summarize', '--config', config, '--write']),
        ('synthesis', 'materializeGoalDescriptionRolloutSynthesisManifest.ts', ['--config', config, '--authoring',
             (root / 'synthesis-authoring.json').relative_to(REPO).as_posix(), '--write']),
        ('resolutions', 'materializeGoalDescriptionRolloutResolutions.ts', ['--config', config, '--synthesis-manifest',
             (root / 'synthesis-decisions.json').relative_to(REPO).as_posix(), '--write']),
        ('finalize', 'materializeGoalDescriptionRolloutBatch.ts', ['finalize', '--config', config, '--write']),
    ]
    for name, module, args in commands:
        key = label + '.' + name
        argv = [str(REPO / 'app/node_modules/.bin/tsx'), str(REPO / 'app/scripts' / module), *args]
        started = datetime.datetime.now(datetime.timezone.utc).isoformat()
        clock = time.monotonic()
        proc = subprocess.run(argv, cwd=REPO, capture_output=True)
        out = OWN / ('checks/STOCK.' + key + '.stdout.actual.txt')
        err = OWN / ('checks/STOCK.' + key + '.stderr.actual.txt')
        assert not out.exists() and not err.exists()
        out.write_bytes(proc.stdout)
        err.write_bytes(proc.stderr)
        receipt = OWN / ('checks/STOCK.' + key + '.command.actual.json')
        put(receipt, {'role': 'Actual unchanged stock original-pair/current-binding/index operation; no new science',
             'argv': argv, 'cwd': '.', 'startedAtUTC': started,
             'completedAtUTC': datetime.datetime.now(datetime.timezone.utc).isoformat(),
             'elapsedSeconds': round(time.monotonic() - clock, 3), 'exitCode': proc.returncode,
             'stdout': ref(out), 'stderr': ref(err), 'stockModule': ref(REPO / 'app/scripts' / module),
             'invocationForThisBatchAndStep': 1, 'newScienceVotes': 0, 'newRenderRuns': 0, 'CentralRuns': 0})
        receipts.append(ref(receipt))
        print(json.dumps({'step': key, 'exitCode': proc.returncode, 'elapsedSeconds': round(time.monotonic() - clock, 3)}), flush=True)
        if proc.returncode:
            raise SystemExit(proc.stderr.decode() + proc.stdout.decode())
    index = load(root / 'resolution-index.json')
    assert len(index['resolutions']) == batch['goalCount']
    assert all(row['strictDescriptionComplete'] for row in index['resolutions'])
put(OWN / 'checks/STOCK.D15-D1.actual-bundled-pair-current-bindings-and-indices.PASS.json', {
    'schemaVersion': 1, 'role': 'Actual unchanged stock checks/materialization complete for only16 genuine pairs',
    'commandReceipts': receipts, 'allExitCodes': [load(REPO / row['path'])['exitCode'] for row in receipts],
    'descriptionResolutionIndexPaths': [batch['batchDirectory'] + '/resolution-index.json' for batch in transport['batches']],
    'genuineKeepKeepPairs': 16, 'strictCurrentDescriptionResolutions': 16,
    'oldNineTransportActivated': False, 'newScientificVotes': 0, 'additionalRenders': 0, 'CentralRuns': 0,
})
print(json.dumps({'actualStockStepsPASS': len(receipts), 'strictCurrentDescriptions': [15, 1], 'CentralRuns': 0}), flush=True)
