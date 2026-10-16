# SPDX-License-Identifier: Apache-2.0
"""One root-authorized proper e7 Native Prepare/Check; no scientific records."""
from pathlib import Path
import datetime
import hashlib
import json
import subprocess
import time

REPO = Path.cwd()
OWN = Path(__file__).resolve().parents[1]
NATIVE = OWN.parents[2] / 'chemie-bcp-current426-native24-preparation-technical-20261015-v1'
GID = 'e7c3d20e-4b13-560b-b8ee-c5abca8cc624'


def load(path):
    return json.loads(path.read_text())


def ref(path):
    b = path.read_bytes()
    return {'path': path.relative_to(REPO).as_posix(), 'sha256': 'sha256:' + hashlib.sha256(b).hexdigest(), 'bytes': len(b)}


def verify(row):
    p = REPO / row['path']
    assert ref(p) == row, p
    return p


def put(path, value):
    assert not path.exists(), path
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')


assert not (OWN / 'native-one').exists()
source = load(NATIVE / 'NEUTRAL.finite-final-full426-native24-technical-handoff.selector.json')
for row in [source['canonical'], source['semantic'], source['qa']]:
    verify(row)
full_before = source['full426Model']
verify(full_before)
old_model = ref(NATIVE / 'native-relations-nine/bundle/book-model.json')
old_pdf = ref(NATIVE / 'native-relations-nine/bundle/book.pdf')
old_plan = load(NATIVE / 'checks/INPUTS.two-proper-stock-batches15-and9.technical.json')
HOST = REPO / old_plan['executionHost']
host_map = load(NATIVE / 'checks/REBUILD.final-native24.private-readonly-host.physical-map.json')
for row in host_map['stockPhysicalModules']:
    assert ref(HOST / row['path'])['sha256'] == row['sha256']
old_source = load(NATIVE / 'native-relations-nine/round-a/description-review-input.json')
old_goal = next(row for row in old_source['goals'] if row['goalId'] == GID)
assert old_goal['reviewContext']['evidenceProfile'] is None
assert old_goal['reviewContext']['page']['evidenceReview'] is None
old_config = load(REPO / next(row for row in old_plan['batches'] if row['label'] == 'relations-nine')['configPath'])
config = dict(old_config)
config.update(batchId='chemie-bcp-current426-e7-required-D1-technical-20261015-v1',
              bookId='chemie-bcp-current426-e7-required-D1-technical-20261015-v1',
              title='Chemie – e7: aktueller Vorbedingungskontext', goalIds=[GID],
              outputDirectory=(OWN / 'native-one').relative_to(REPO).as_posix())
config_path = OWN / 'config/native-e7-one.proper-normal-stock.config.json'
put(config_path, config)
put(OWN / 'INPUTS.one-required-proper-e7-native.root-authorized.json', {
    'schemaVersion': 1, 'role': 'One needed additional proper D1 Native explicitly authorized by Root; no FIRSTs or scientific records',
    'goalId': GID, 'oneNeededAdditionalD1NativeAllowed': True,
    'canonical': source['canonical'], 'semantic': source['semantic'], 'qa': source['qa'],
    'savedFull426Model': full_before, 'existingNineModel': old_model, 'existingNinePdf': old_pdf,
    'readOnlyExecutionHost': old_plan['executionHost'], 'nativeConfig': ref(config_path),
    'existingE7EvidenceProfile': None, 'newRawE7ProfileCreated': False,
    'maximumNativePrepareCalls': 1, 'maximumNativeCheckCalls': 1,
    'explicitFull426Builds': 0, 'oldNineRerenders': 0,
    'stockPrepareInternallyLoadsSameFullBase': True, 'FIRSTsRead': False,
})


def command(label, argv):
    started = datetime.datetime.now(datetime.timezone.utc).isoformat()
    clock = time.monotonic()
    p = subprocess.run(argv, cwd=HOST, capture_output=True)
    out = OWN / (label + '.stdout.actual.txt')
    err = OWN / (label + '.stderr.actual.txt')
    assert not out.exists() and not err.exists()
    out.write_bytes(p.stdout)
    err.write_bytes(p.stderr)
    put(OWN / (label + '.command.actual.json'), {'argv': argv, 'cwd': old_plan['executionHost'],
        'startedAtUTC': started, 'completedAtUTC': datetime.datetime.now(datetime.timezone.utc).isoformat(),
        'elapsedSeconds': round(time.monotonic() - clock, 3), 'exitCode': p.returncode,
        'stdout': ref(out), 'stderr': ref(err), 'actualInvocation': 1, 'newScienceVotes': 0})
    print(json.dumps({'label': label, 'exitCode': p.returncode, 'elapsedSeconds': round(time.monotonic() - clock, 3)}), flush=True)
    if p.returncode:
        raise SystemExit(p.stderr.decode() + p.stdout.decode())


tsx = str(REPO / 'app/node_modules/.bin/tsx')
command('PRECHECK.e7-config-and-subset', [tsx, str(OWN / 'scripts/preflight_e7_config_no_build.mts')])
for mode in ['prepare', 'check']:
    command('NATIVE.e7-one.' + mode, [tsx, str(HOST / 'app/scripts/materializeGoalDescriptionRolloutBatch.ts'), mode, '--config', config_path.relative_to(REPO).as_posix()])
for row in [source['canonical'], source['semantic'], source['qa'], full_before, old_model, old_pdf]:
    verify(row)
print(json.dumps({'actualD1Pages': 1, 'prepare': 'PASS', 'check': 'PASS', 'savedFull426AndOldNineExact': True,
                  'newRawE7Profile': False, 'FIRSTsRead': False, 'normalRecords': 0}), flush=True)
