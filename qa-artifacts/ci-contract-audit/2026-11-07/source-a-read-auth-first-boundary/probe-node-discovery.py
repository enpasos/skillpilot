#!/usr/bin/env python3
"""Real tiny Node discovery measurement; blocked authentication is NOT a pass."""
import copy
import hashlib
import importlib.util
import json
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile

sys.dont_write_bytecode = True
ROOT = Path(__file__).resolve().parents[4]
HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(ROOT / 'scripts'))
from identity_qa_read_trace import FileBinding, ReadContract, TRACE_OPTIONS, authenticate_trace, digest


def main():
    out = HERE / 'node-current'
    out.mkdir(exist_ok=False)
    ram = Path(tempfile.mkdtemp(prefix='skillpilot-node-read-auth-final-', dir='/dev/shm'))
    bundle = HERE / 'required-discovery-final/native-cases/fixture.git.bundle'
    original, candidate = ram / 'original', ram / 'candidate'
    subprocess.run(['git', '-c', 'advice.detachedHead=false', 'clone', '-q', str(bundle), str(original)], check=True)
    shutil.copytree(original, candidate)
    kernel_path = ROOT / 'scripts/canonical_goal_identity_migration.py'
    spec = importlib.util.spec_from_file_location('node_fixture_kernel', kernel_path)
    kernel = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(kernel)
    data = kernel.parse_json((original / 'data/goal.json').read_bytes())
    after = copy.deepcopy(data)
    fields = [{'pointer': '/goals/0/id', 'kind': 'value', 'before': 'legacy', 'after': '00000000-0000-4000-8000-000000000001'}]
    kernel.set_field(after, fields[0])
    kernel.inverse_proof(data, after, fields)
    (candidate / 'data/goal.json').write_bytes(kernel.stable(after))
    js = ram / 'discovery.mjs'
    js.write_text("import {readFileSync,readdirSync} from 'node:fs'; const names=readdirSync('data',{withFileTypes:true}).filter(e=>e.isFile()).map(e=>e.name).sort(); const inputs=names.map(name=>({name,bytes:readFileSync('data/'+name).length})); console.log(JSON.stringify({inputs}));\n")
    (out / 'discovery.mjs').write_bytes(js.read_bytes())
    node = Path(shutil.which('node')).resolve()
    runtime = {str(node), '/etc/ld.so.cache', str(js)}
    for token in subprocess.check_output(['ldd', str(node)], text=True).split():
        if token.startswith('/') and Path(token).is_file():
            runtime.add(token)
    external = {name: FileBinding('tool' if name in {str(node), '/etc/ld.so.cache', str(js)} else 'dependency', digest(name),
                                  'explicit native Node fixture runtime bytes bound before execution') for name in runtime}
    results = []
    for role, root in [('original', original), ('candidate', candidate)]:
        files = {str(path.relative_to(root)): FileBinding('source', digest(path),
                 'actual preserved Git fixture blob' if role == 'original' else 'actual existing-kernel typed fixture projection with inverse equality')
                 for path in (root / 'data').iterdir() if path.is_file()}
        selector = sorted((path.name, 'file') for path in (root / 'data').iterdir())
        contract = ReadContract(root, role, files, {'data': selector}, external_files=external,
                                expected_tool_failures={('access', '/etc/ld.so.preload', 'ENOENT')}, required_discovery={'data'})
        logs = ram / (role + '-logs')
        logs.mkdir()
        trace = logs / 'node.strace'
        command = ['bwrap', '--die-with-parent', '--unshare-net', '--clearenv', '--setenv', 'PATH', '/usr/bin:/bin', '--setenv', 'LC_ALL', 'C',
                   '--ro-bind', '/', '/', '--proc', '/proc', '--dev', '/dev', '--tmpfs', '/tmp', '--ro-bind', str(ram), str(ram),
                   '--bind', str(logs), str(logs), '--chdir', str(root), '--', '/usr/bin/strace', *TRACE_OPTIONS, '-o', str(trace), str(node), str(js)]
        producer = subprocess.run(command, capture_output=True, text=True, stdin=subprocess.DEVNULL)
        (out / (role + '.strace')).write_bytes(trace.read_bytes())
        (out / (role + '.stdout.json')).write_text(producer.stdout)
        (out / (role + '.stderr.txt')).write_text(producer.stderr)
        assert producer.returncode == 0, producer.stderr
        expected = [{'name': name, 'bytes': (root / 'data' / name).stat().st_size} for name, _ in selector]
        assert json.loads(producer.stdout)['inputs'] == expected
        row = {'role': role, 'producerExitCode': producer.returncode, 'command': command,
               'traceSha256': digest(trace), 'traceBytes': trace.stat().st_size,
               'actualNodeDiscoveryMatchesExpectedFixtureNamesAndByteLengths': True,
               'sourceBindings': {name: binding.sha256 for name, binding in files.items()},
               'qaReadinessClaimed': False}
        try:
            row['authenticationFacts'] = authenticate_trace(trace.read_text(), root, contract)
            row['authenticationOutcome'] = 'bounded-read-facts'
        except ValueError as error:
            row['authenticationOutcome'] = 'blocked-fail-closed'
            row['blockingReason'] = str(error)
        results.append(row)
    result = {'purpose': 'actual-two-role-native-Node-discovery-measurement-not-SourceA-QA-acceptance',
              'originalGitBundleSha256': digest(bundle), 'existingKernelSha256': digest(kernel_path),
              'authenticatorSha256': digest(ROOT / 'scripts/identity_qa_read_trace.py'),
              'nodeSha256': digest(node), 'discoveryCodeSha256': digest(js),
              'runtimeBindings': {name: {'sha256': binding.sha256, 'category': binding.category} for name, binding in external.items()},
              'runs': results, 'fullProductionSourceAValidationClaimed': False, 'largeCaptureStarted': False}
    (out / 'probe.json').write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps([{'role': row['role'], 'producerExitCode': row['producerExitCode'], 'authenticationOutcome': row['authenticationOutcome'],
                       'blockingReason': row.get('blockingReason')} for row in results]))


if __name__ == '__main__':
    main()
