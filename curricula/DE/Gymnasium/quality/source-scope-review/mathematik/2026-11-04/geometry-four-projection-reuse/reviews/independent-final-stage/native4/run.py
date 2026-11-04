"""Reuse the existing finite native sampler; record actual unchanged-input runs."""
from pathlib import Path
import argparse
import gzip
import hashlib
import json
import subprocess
import time

ROOT = Path('/home/enpasos/projects/skillpilot')
HERE = Path(__file__).resolve().parent
H = ROOT / 'tmp/approach-review-20261101'
JAVA = Path('/tmp/skillpilot-curriculum-ci-corretto-25.0.2.10.1/bin')
CP = (HERE / 'classpath-current.txt').read_text().strip()

def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def write(path, value):
    with path.open('x') as f:
        json.dump(value, f, indent=2)
        f.write('\n')

parser = argparse.ArgumentParser()
parser.add_argument('mode', choices=['baseline', 'candidate'])
parser.add_argument('data_root', type=Path)
args = parser.parse_args()
data = args.data_root.resolve()
classes = json.loads((HERE / 'runtime-class-hashes.json').read_text())
sources = json.loads((HERE / 'main-source-hashes.json').read_text())
assert classes and sources
for p, digest in {**classes, **sources}.items():
    assert sha(Path(p)) == digest, p
# This private host contains the exact tracked runtime JSON/snapshot inputs,
# the current authored overlay and the offered-scope index. Bind every actual
# file, including new inputs not present in the earlier historical inventory.
def input_paths():
    return sorted(str(p.relative_to(data)) for p in data.rglob('*') if p.is_file())

inputs = {rel: sha(data / rel) for rel in input_paths()}
assert 'app/src/generated/gymnasiumDurationOfferings.ts' in inputs
assert 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json' in inputs
write(HERE / (args.mode + '-input-hashes.json'), inputs)
own = {p.name: sha(p) for p in [HERE / 'run.py', HERE / 'MatrixFiniteNativeProbe.java', HERE / 'decisions.json', HERE / 'classpath-current.txt', HERE / 'runtime-class-hashes.json', HERE / 'main-source-hashes.json', HERE / 'runtime-origin.json']}

def guard():
    assert input_paths() == sorted(inputs), 'Input files added or removed during measurement'
    for p, digest in inputs.items():
        assert sha(data / p) == digest, p
    for p, digest in {**classes, **sources}.items():
        assert sha(Path(p)) == digest, p
    for p, digest in own.items():
        assert sha(HERE / p) == digest, p

def run(name, command):
    guard()
    start = time.monotonic()
    with gzip.open(HERE / (name + '.log.gz'), 'xb') as log:
        p = subprocess.Popen([str(x) for x in command], cwd=ROOT / 'backend', stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
        write(HERE / (name + '.started.json'), {'pid': p.pid, 'argv': [str(x) for x in command]})
        print(json.dumps({'phase': name, 'pid': p.pid}), flush=True)
        for block in iter(lambda: p.stdout.read(65536), b''):
            log.write(block)
        code = p.wait()
    guard()
    result = {'exitCode': code, 'seconds': round(time.monotonic() - start, 2), 'inputCount': len(inputs),
              'dataRoot': str(data), 'ownSourceHashes': own, 'inputsSourcesAndRuntimeClassesUnchanged': True, 'runtimeClassCount': len(classes), 'mainSourceCount': len(sources)}
    write(HERE / (name + '.execution.json'), result)
    print(json.dumps({'phase': name, **result}), flush=True)
    if code:
        raise SystemExit(code)

private = HERE / 'classes'
if args.mode == 'baseline':
    private.mkdir()
    empty = HERE / 'empty-sourcepath'
    empty.mkdir()
    run('compile', [JAVA / 'javac', '-J-Xmx1200m', '-encoding', 'UTF-8', '-implicit:none',
                    '-sourcepath', empty, '-cp', CP, '-d', private, HERE / 'MatrixFiniteNativeProbe.java'])
    write(HERE / 'sampler-class-hashes.json', {str(p.relative_to(private)): sha(p) for p in private.rglob('*.class')})
else:
    expected = json.loads((HERE / 'sampler-class-hashes.json').read_text())
    assert expected == {str(p.relative_to(private)): sha(p) for p in private.rglob('*.class')}
archive = HERE / (args.mode + '.json.gz')
assert not archive.exists()
run(args.mode, [JAVA / 'java', '-Xmx1800m', '-cp', str(private) + ':' + CP,
                'com.skillpilot.backend.completion.MatrixFiniteNativeProbe', data, archive,
                HERE / 'decisions.json', json.loads((HERE / 'runtime-origin.json').read_text())['mainClasses']])
with gzip.open(archive, 'rt') as f:
    report = json.load(f)
assert len(report['scopes']) == report['actualScopeCount'] == 161
assert report['actualUnionCount'] == 46
assert report['measurementRepositoryMutationCount'] == report['measurementEventCount'] == 0
assert report['inertLearnerUnchanged'] and report['publicFocusClaimsExcluded']
guard()
write(HERE / (args.mode + '.summary.json'), {'archiveSha256': sha(archive), 'scopeCount': 161,
      'unionCount': 46, 'failedScopes': report['failedScopes'], 'noLearnerWrites': True,
      'sourceDataAndClassesUnchanged': True, 'doesNotClaimM7OrDeployment': True})
