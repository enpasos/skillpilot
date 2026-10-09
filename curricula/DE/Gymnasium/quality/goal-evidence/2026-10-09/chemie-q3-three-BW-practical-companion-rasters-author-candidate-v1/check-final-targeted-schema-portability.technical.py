# SPDX-License-Identifier: Apache-2.0
"""Validate complete own JSON and exact bound inputs without rebuilding publications."""
import hashlib
import importlib.util
import json
import pathlib
import subprocess

root = pathlib.Path.cwd()
own = pathlib.Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location('normal_validator', root / 'scripts/validate_schemas.py')
validator = importlib.util.module_from_spec(spec)
spec.loader.exec_module(validator)
schema = json.loads((root / 'docs/landscape-runtime.schema.json').read_text())
count = 0
bound = 0


def verify(value):
    global bound
    if isinstance(value, dict):
        if {'path', 'sha256', 'bytes'} <= value.keys():
            path = root / value['path']
            assert not pathlib.Path(value['path']).is_absolute()
            data = path.read_bytes()
            assert hashlib.sha256(data).hexdigest() == value['sha256'] and len(data) == value['bytes'], path
            for ancestor in [path, *path.parents]:
                assert not ancestor.is_symlink()
                if ancestor == root:
                    break
            bound += 1
        for child in value.values():
            verify(child)
    elif isinstance(value, list):
        for child in value:
            verify(child)


for path in sorted(own.rglob('*')):
    assert not path.is_symlink(), path
    if path.is_file() and path.suffix == '.json':
        value = json.loads(path.read_text())
        verify(value)
        assert validator.validate_file(str(path.relative_to(root)), schema), path
        count += 1
    if path.is_file() and path.name.endswith('.raw.txt') and 'request-and-output-hint' in path.name:
        verify(json.loads(path.read_text()))

paths = [str(path.relative_to(root)) for path in own.rglob('*') if path.is_file()]
ignored = subprocess.run(['git', 'check-ignore', '--stdin'], input='\n'.join(paths) + '\n', text=True, capture_output=True)
assert ignored.returncode in [0, 1] and not ignored.stdout.strip(), ignored.stdout
for argv in [['git', 'diff', '--check', '--', str(own.relative_to(root))],
             ['git', 'diff', '--cached', '--check', '--', str(own.relative_to(root))]]:
    actual = subprocess.run(argv, text=True, capture_output=True)
    assert actual.returncode == 0, actual.stdout + actual.stderr

entry = json.loads((own / 'neutral-three-whole-BW-practical-goal-actual-rasters.independent-V-review.entry.json').read_text())
assert len(entry['selectedGoalIds']) == 3
assert entry['newIndependentVApproval'] is False and entry['newStrictClosures'] == 0
assert entry['humanApproval'] is False and entry['humanTrial'] is False
pixel = json.loads((own / entry['pixelFirstNeutralInput']['path'].split(own.name + '/')[1]).read_text())
assert len(pixel['images']) == 3
assert all(len(image['wholeGoal']['resourceLinks']) == 1 for image in pixel['images'])
print(f'PASS: complete targeted normal schema for {count} JSON; {bound} exact portable input/PNG/prompt/capture bindings; all own regular files portable; honest independent-V/native-DP pending.')
