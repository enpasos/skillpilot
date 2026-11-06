"""Independent small Git/bwrap counterprobe for declared directory aliases."""
import copy
import hashlib
import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile
from types import SimpleNamespace

repo_root = Path(os.environ['SKILLPILOT_CAPTURE_REVIEW_REPO']).resolve()
sys.path.insert(0, str(repo_root / 'scripts'))
import prepare_identity_qa_candidate as p

k = p.load_kernel(repo_root)
with tempfile.TemporaryDirectory(prefix='capture-alias-peer-', dir='/dev/shm') as directory:
    top = Path(directory)
    host, base = top / 'host', top / 'pair'
    subprocess.run(['git', 'init', '-q', str(host)], check=True)
    graph_path = 'curricula/DE/Gymnasium/canonical/capture-fixture.json'
    graph = {'landscapeId': 'capture-fixture-owner', 'goals': [{'id': 'capture-old-goal', 'title': 'Original', 'requires': [], 'contains': []}]}
    files = {
        'app/package-lock.json': b'{"lockfileVersion":3}\n',
        'app/package.json': b'{"name":"capture-alias-fixture"}\n',
        'cases/real/review-input.json': b'{"review":"authentic-for-alias"}\n',
        'cases/other/review-input.json': b'{"review":"different-valid-input"}\n',
        graph_path: json.dumps(graph).encode(),
    }
    for path, raw in files.items():
        target = host / path
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(raw)
    (host / 'cases/alias').symlink_to('real', target_is_directory=True)
    (host / 'app/node_modules/pkg').mkdir(parents=True)
    (host / 'app/node_modules/pkg/tool.js').write_text('dependency')
    subprocess.run(['git', 'add', *files, 'cases/alias'], cwd=host, check=True)
    subprocess.run(['git', '-c', 'user.name=Fixture', '-c', 'user.email=fixture@example.invalid', 'commit', '-qm', 'Private alias review fixture'], cwd=host, check=True)
    commit = subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=host, text=True).strip()
    after = copy.deepcopy(graph)
    after['goals'][0]['id'] = '00000000-0000-4000-8000-000000000001'
    proof = {'catalog': {'sourceFiles': [{'path': graph_path, 'sha256': k.digest(files[graph_path])}]}, 'documents': [
        {'path': graph_path, 'handling': 'project-typed-fields', 'sourceSha256': k.digest(files[graph_path]),
         'hypotheticalCanonicalSha256': k.digest(k.stable(after)), 'fields': [
             {'pointer': '/goals/0/id', 'kind': 'value', 'before': 'capture-old-goal', 'after': after['goals'][0]['id']}]}]}
    raw = json.dumps(proof).encode()
    trace = top / 'read-trace.txt'
    trace.write_text(''.join('1 openat(AT_FDCWD, ' + json.dumps(str(host / path)) + ', O_RDONLY) = 3\n'
                             for path in ['cases/alias/review-input.json', 'cases/other/review-input.json']))
    args = SimpleNamespace(expected_base_commit=commit, accepted_manifest_sha256=k.digest(raw), extend=False,
        max_private_bytes=10000, max_binary_bytes=10000, max_dependency_bytes=10000, reserve_bytes=0,
        accepted_dependency_tree_sha256=p.inventory_digest(p.dependency_inventory(host / 'app/node_modules')),
        output_paths=None, read_trace=[trace])
    base.mkdir()
    snapshot = k.GitSnapshot(host, commit)
    try:
        p.materialize(args, host, k, proof, {}, snapshot, base, False, raw)
    finally:
        snapshot.close()
    receipt_raw = (base / 'preparation.json').read_bytes()
    receipt = json.loads(receipt_raw)
    pin = hashlib.sha256(receipt_raw).hexdigest()
    alias = base / 'original80/cases/alias'
    def execute():
        code = "from pathlib import Path;print((Path.cwd().parent/'cases/alias/review-input.json').read_text(),end='')"
        run = subprocess.run([sys.executable, str(base / 'run-isolated.py'), '--accepted-preparation-sha256', pin,
            'original', '--', sys.executable, '-c', code], capture_output=True, text=True)
        return {'exitCode': run.returncode, 'stdout': run.stdout, 'stderr': run.stderr}
    baseline = execute()
    original_target = os.readlink(alias)
    alias.unlink()
    alias.symlink_to('other', target_is_directory=True)
    changed = execute()
    result = {
        'kind': 'actual-independent-declared-directory-alias-probe',
        'boundary': 'Tiny genuine Git snapshot, native materialize and bwrap launcher; not a full Source-A authority fixture.',
        'sourceWritesPerformed': False,
        'declaredAliases': receipt['directorySymlinks'],
        'baseline': baseline,
        'afterAliasReplacement': changed,
        'originalTarget': original_target,
        'replacementTarget': os.readlink(alias),
        'receiptByteIdentical': (base / 'preparation.json').read_bytes() == receipt_raw,
        'allSelectedPhysicalInputsStillMatch': all(
            p.file_binding(base / 'original80' / row['path']) == {key: row[key] for key in ('sha256', 'bytes')}
            for row in receipt['selectedFiles']),
    }
    Path(os.environ['SKILLPILOT_CAPTURE_REVIEW_OUTPUT']).write_text(json.dumps(result, indent=2) + '\n')
    print(json.dumps(result, indent=2))
