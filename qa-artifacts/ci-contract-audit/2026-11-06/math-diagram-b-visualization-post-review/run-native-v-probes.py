#!/usr/bin/env python3
"""Four read-only overlays; never writes an active source or ledger."""
import hashlib
import json
import pathlib
import subprocess
import time

ROOT = pathlib.Path(__file__).resolve().parents[4]
PACKET = pathlib.Path(__file__).resolve().parent
inputs = json.loads((PACKET / 'inputs.json').read_bytes())
RAM = pathlib.Path(inputs['ramDirectory'])
SOURCE = ROOT / inputs['sourcePath']
QA = ROOT / inputs['qaPath']
CANDIDATE = RAM / 'candidate-source.json'


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


assert sha(SOURCE) == inputs['sourceSha256']
assert sha(QA) == inputs['qaSha256']
RAM.mkdir(exist_ok=True)
# Reconstruct from the two guarded originals plus this packet's immutable rows.
# A future replay does not require the coordinator's original RAM directory.
source_value = json.loads(SOURCE.read_bytes())
for operation in json.loads((PACKET / 'candidate-source-operations.json').read_bytes()):
    index = int(operation['pointer'].split('/')[2])
    goal = source_value['goals'][index]
    assert goal['id'] == operation['goalId']
    assert goal[operation['field']] == operation['before']
    goal[operation['field']] = operation['after']
CANDIDATE.write_text(json.dumps(source_value, ensure_ascii=False, indent=2) + '\n')
assert sha(CANDIDATE) == inputs['candidateSha256']
for name in ['metadata-only', 'fresh']:
    value = json.loads(QA.read_bytes())
    index = next(i for i, row in enumerate(value['records']) if row['goalId'] == inputs['goalId'])
    if name == 'fresh':
        value['records'][index] = json.loads((PACKET / 'fresh-record-candidate.json').read_bytes())
    else:
        value['records'][index]['description'] = json.loads((PACKET / 'candidate-goal.json').read_bytes())['description']
    path = RAM / (name + '.qa.json')
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')
    expected = inputs['candidateQaSha256'] if name == 'fresh' else inputs['metadataOnlyQaSha256']
    assert sha(path) == expected
results = []
for name, source, qa in [
    ('original', SOURCE, QA),
    ('b-with-historical-row', CANDIDATE, QA),
    ('b-metadata-only-counterexample', CANDIDATE, RAM / 'metadata-only.qa.json'),
    ('b-fresh-ai-review-candidate', CANDIDATE, RAM / 'fresh.qa.json'),
]:
    command = ['bwrap', '--die-with-parent', '--unshare-net', '--ro-bind', '/', '/',
               '--proc', '/proc', '--dev', '/dev', '--tmpfs', '/tmp']
    if source != SOURCE:
        command += ['--ro-bind', str(source), str(SOURCE)]
    if qa != QA:
        command += ['--ro-bind', str(qa), str(QA)]
    command += ['--chdir', str(ROOT), '--', str(ROOT / 'app/node_modules/.bin/tsx'),
                str(PACKET / 'native-v-probe.mts'), name]
    start = time.monotonic()
    result = subprocess.run(command, capture_output=True)
    (PACKET / (name + '.stdout.json')).write_bytes(result.stdout)
    (PACKET / (name + '.stderr.txt')).write_bytes(result.stderr)
    row = {'scenario': name, 'command': command, 'exitCode': result.returncode,
           'seconds': time.monotonic() - start,
           'stdoutSha256': hashlib.sha256(result.stdout).hexdigest(),
           'stderrSha256': hashlib.sha256(result.stderr).hexdigest()}
    results.append(row)
    (PACKET / 'execution.json').write_text(json.dumps(results, indent=2) + '\n')
    print(json.dumps({key: row[key] for key in ['scenario', 'exitCode', 'seconds']}), flush=True)
    assert result.returncode == 0, result.stderr.decode(errors='replace')
    assert sha(SOURCE) == inputs['sourceSha256']
    assert sha(QA) == inputs['qaSha256']
