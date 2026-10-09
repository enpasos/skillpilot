# SPDX-License-Identifier: Apache-2.0
import copy
import hashlib
import importlib.util
import json
import os
import pathlib
import shutil
import subprocess
import tempfile

root = pathlib.Path.cwd()
own = pathlib.Path(__file__).resolve().parent
old = own.parent / 'chemie-q3-three-BW-practical-companion-rasters-author-candidate-v1'
gid = 'a0f6ba09-f072-5887-a797-fa369453c62a'


def b(p):
    d = p.read_bytes()
    return {'path': str(p.relative_to(root)), 'sha256': hashlib.sha256(d).hexdigest(), 'bytes': len(d)}


def w(p, x):
    t = json.dumps(x, ensure_ascii=False, indent=2) + '\n'
    json.loads(t)
    q = pathlib.Path(str(p) + '.writing')
    q.write_text(t)
    os.replace(q, p)


receipt = json.loads((own / 'word-only-original-and-successor-neutral-input.json').read_text())
old_seal = json.loads((old / 'three-image-candidate-author.final.freeze.json').read_text())
for row in old_seal['allOwnPackageFiles']:
    assert b(root / row['path']) == row
for row in receipt['exactPNGKeepBindings']:
    assert b(root / row['path']) == row
meta = json.loads((own / 'candidate/three-selected-assets-and-accessible-metadata.device-word-only.successor.json').read_text())
row = next(x for x in meta['rows'] if x['goalId'] == gid)
before = json.loads((own / 'candidate/whole484.before-word-correction.inactive.json').read_text())
with tempfile.TemporaryDirectory(prefix='skillpilot-chem3-device-word-', dir=root / 'tmp') as d:
    cap = pathlib.Path(d)
    (cap / 'scripts').mkdir()
    (cap / 'inputs').mkdir()
    for name in ['import_goal_visualization.mjs', 'goal_visualization_common.mjs']:
        shutil.copyfile(root / 'scripts' / name, cap / 'scripts' / name)
        assert (cap / 'scripts' / name).read_bytes() == (root / 'scripts' / name).read_bytes()
    shutil.copyfile(own / 'candidate/whole484.before-word-correction.inactive.json', cap / 'landscape.json')
    for key, name in [('selectedPNG', 'image.png'), ('actualFinalPrompt', 'prompt.txt'), ('actualImageReconstruction', 'recon.txt')]:
        p = root / row[key]['path']
        assert b(p) == row[key]
        shutil.copyfile(p, cap / 'inputs' / name)
    argv = ['node', 'scripts/import_goal_visualization.mjs', gid, 'inputs/image.png', '--landscape=landscape.json', '--subject=chemie',
            '--provider=OpenAI / ChatGPT-Codex built-in image_gen', '--review-status=pilot', '--license=CC-BY-4.0',
            '--prompt=inputs/prompt.txt', '--reconstruction-prompt=inputs/recon.txt', '--alt-text=' + row['altTextDe'], '--description=' + row['captionDe']]
    actual = subprocess.run(argv, cwd=cap, capture_output=True)
    stdout = own / 'normal/normal-import.stdout.actual.txt'
    stderr = own / 'normal/normal-import.stderr.actual.txt'
    stdout.write_bytes(actual.stdout)
    stderr.write_bytes(actual.stderr)
    assert actual.returncode == 0, actual.stderr
    w(own / 'normal/normal-import.terminal.actual.json', {'schemaVersion': 1, 'codeLicense': 'Apache-2.0', 'kind': 'captured-command-output',
        'command': {'argv': argv, 'cwd': '.', 'exitCode': actual.returncode},
        'executionDirectoryMeaning': 'Disposed isolated repository with byte-exact regular helper/input copies, not active workspace',
        'stdout': b(stdout), 'stderr': b(stderr), 'normalUnmodifiedImportScript': b(root / 'scripts/import_goal_visualization.mjs')})
    src = cap / 'curricula/DE/Gymnasium/visualizations/chemie' / gid
    for file in src.iterdir():
        target = own / 'source-assets/chemie' / gid / file.name
        shutil.copyfile(file, target)
        if file.suffix == '.png':
            assert file.read_bytes() == (root / row['selectedPNG']['path']).read_bytes()
        elif file.name == 'prompt.de.md':
            assert file.read_bytes() == (old / 'source-assets/chemie' / gid / file.name).read_bytes()
        else:
            assert file.name == 'image-reconstruction-prompt.de.md'
            assert file.read_text() == (old / 'source-assets/chemie' / gid / file.name).read_text().replace('Messpipetten', 'Messspritzen')
    for prefix in ['app/public/assets/goal-visualizations/chemie', 'backend/src/main/resources/static/assets/goal-visualizations/chemie']:
        assert (cap / prefix / gid / (gid + '.png')).read_bytes() == (root / row['selectedPNG']['path']).read_bytes()
    after = json.loads((cap / 'landscape.json').read_text())
    w(own / 'candidate/whole484.only-a0f6-accessibility-device-word.inactive.json', after)
masked = copy.deepcopy(after)
old_by = {g['id']: g for g in before['goals']}
changes = []
for goal in masked['goals']:
    original = old_by[goal['id']]
    if goal != original:
        changes.append(goal['id'])
        assert goal['id'] == gid
        assert goal['resourceLinks'][0]['altText'] == original['resourceLinks'][0]['altText'].replace('Messpipetten', 'Messspritzen')
        goal['resourceLinks'][0]['altText'] = original['resourceLinks'][0]['altText']
assert changes == [gid] and masked == before
for frozen in old_seal['allOwnPackageFiles'] + receipt['exactPNGKeepBindings']:
    assert b(root / frozen['path']) == frozen
spec = importlib.util.spec_from_file_location('normal_validator', root / 'scripts/validate_schemas.py')
validator = importlib.util.module_from_spec(spec)
spec.loader.exec_module(validator)
schema = json.loads((root / 'docs/landscape-runtime.schema.json').read_text())
for path in own.rglob('*.json'):
    assert validator.validate_file(str(path.relative_to(root)), schema)
print('PASS: one exact device-word correction through unmodified normal isolated import; all3PNG KEEP; old95-file seal and all other484-goal fields exact; normal schema.')
