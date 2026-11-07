#!/usr/bin/env python3
"""Small read-only native V calls with private shallow/authority/input overlays."""
import hashlib
import json
import os
from pathlib import Path
import subprocess
import tempfile

root = Path(__file__).resolve().parents[4]
output = Path(os.environ['SKILLPILOT_V_PROBE_OUTPUT']).resolve()
output.mkdir(parents=True, exist_ok=True)
index_path = 'contracts/goal-visualization-context/v1/qualified-context-index.json'
capsule_path = 'qa-artifacts/ci-contract-audit/2026-11-07/visualization-qualified-context-index/capsule'
index = json.loads((root / index_path).read_bytes())
capsule = json.loads((root / capsule_path / 'capsule.json').read_bytes())
results = []
with tempfile.TemporaryDirectory(prefix='v-native-authority-', dir=output) as directory:
    work = Path(directory)
    source, shallow = work / 'host-origin', work / 'host-shallow'
    subprocess.run(['git', 'init', '-q', str(source)], check=True)
    for _ in range(2):
        subprocess.run(['git', '-C', str(source), '-c', 'user.name=Fixture', '-c', 'user.email=fixture@example.invalid',
                        'commit', '--quiet', '--allow-empty', '-m', 'Private shallow fixture'], check=True)
    subprocess.run(['git', 'clone', '--quiet', '--depth=1', source.as_uri(), str(shallow)], check=True)
    assert subprocess.check_output(['git', '-C', str(shallow), 'rev-parse', '--is-shallow-repository']).strip() == b'true'
    def run(name, overlays, negative):
        args = ['bwrap', '--ro-bind', '/', '/', '--dev-bind', '/dev', '/dev', '--proc', '/proc',
                '--bind', str(work), str(work), '--chdir', str(root), '--setenv', 'TMPDIR', str(work),
                '--ro-bind', str(shallow / '.git'), str(root / '.git')]
        for original, target in overlays:
            args += ['--ro-bind', str(original), str(root / target)]
        args += ['--', str(root / 'app/node_modules/.bin/tsx'), str(root / 'app/scripts/testVisualizationContextMaturity.ts')]
        if negative:
            args += ['--reject-external-authority-mutation']
        result = subprocess.run(args, capture_output=True)
        (output / (name + '.stdout.txt')).write_bytes(result.stdout)
        (output / (name + '.stderr.txt')).write_bytes(result.stderr)
        results.append({'case': name, 'exitCode': result.returncode, 'genuineShallowHost': True,
                        'sourceOrQaWrites': False, 'stdoutSha256': hashlib.sha256(result.stdout).hexdigest(),
                        'stderrSha256': hashlib.sha256(result.stderr).hexdigest()})
        assert result.returncode == 0, (name, result.stderr.decode(errors='replace'))
    run('complete54-on-actually-shallow-host', [], False)
    bad_index = work / 'empty-index.json'
    bad_index.write_text(json.dumps({**index, 'rows': []}))
    run('empty-index-cannot-self-authorize', [(bad_index, index_path)], True)
    bad_capsule = work / 'empty-capsule.json'
    bad_capsule.write_text(json.dumps({**capsule, 'originalReferences': []}))
    run('self-claimed-empty-capsule-is-not-external-authority', [(bad_capsule, capsule_path + '/capsule.json')], True)
    auxiliary = next(row for row in index['originalReferences'] if row['currentCopyRequired'] and row['path'].endswith('.json'))
    bad_input = work / 'changed-original-input.json'
    bad_input.write_bytes((root / auxiliary['path']).read_bytes() + b'\n')
    run('changed-physical-original-input', [(bad_input, auxiliary['path'])], True)
    embedded = next(row for row in capsule['objects'] if row['storage'] == 'embedded')
    bad_object = work / 'bad-raw-object'
    bad_object.write_bytes(b'not the authenticated compressed Git object')
    run('changed-raw-capsule-object', [(bad_object, capsule_path + '/' + embedded['path'])], True)
(output / 'results.json').write_text(json.dumps({'cases': results, 'passed': len(results), 'skipped': 0}, indent=2) + '\n')
print(json.dumps({'passed': len(results), 'skipped': 0}))
