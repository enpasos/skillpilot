#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Physical writable candidate inputs with small, read-only directory mirrors."""
from pathlib import Path
from datetime import datetime, timezone
import hashlib, json, shutil, subprocess

ROOT = Path.cwd().resolve()
OWN = Path(__file__).resolve().parent
REL = OWN.relative_to(ROOT)
PRIOR = OWN.parent / 'chemie-b010-five-prospective-current-candidate-v1'
ISO = ROOT / 'tmp/chemie-b010-five-corrected-native-isolated-20261005-v3'

def sha(p):
    return hashlib.sha256(Path(p).read_bytes()).hexdigest()

def read(p):
    return json.loads(Path(p).read_text())

def physical_parent(relative):
    current = ISO
    for name in Path(relative).parts[:-1]:
        current = current / name
        if current.is_symlink():
            original = current.resolve()
            current.unlink()
            current.mkdir()
            for child in original.iterdir():
                (current / child.name).symlink_to(child, target_is_directory=child.is_dir())
        else:
            current.mkdir(exist_ok=True)
    return ISO / relative

def physical_copy(src, relative):
    dest = physical_parent(relative)
    source = Path(src).resolve(strict=True)
    if source == dest and not dest.is_symlink():
        return dest
    if dest.is_symlink():
        dest.unlink()
    shutil.copy2(source, dest)
    assert not dest.is_symlink()
    assert sha(source) == sha(dest)
    return dest

def write(relative, value):
    dest = physical_parent(relative)
    if dest.is_symlink():
        dest.unlink()
    dest.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')
    return dest

assert not ISO.exists(), 'Never overwrite an existing candidate isolate'
ISO.mkdir(parents=True)
(ISO / 'app').mkdir()
code = []
for directory in ['app/scripts', 'scripts']:
    shutil.copytree(ROOT / directory, ISO / directory, symlinks=False)
    for p in sorted((ROOT / directory).rglob('*')):
        if p.is_file():
            assert sha(p) == sha(ISO / p.relative_to(ROOT))
            code.append({'path': str(p.relative_to(ROOT)), 'sha256': sha(p)})
for directory in ['curricula', 'docs', 'contracts', 'backend', 'app/src', 'app/node_modules', 'app/public']:
    p = ISO / directory
    p.parent.mkdir(parents=True, exist_ok=True)
    p.symlink_to(ROOT / directory, target_is_directory=True)
for relative in ['app/package.json', 'app/tsconfig.json', 'app/tsconfig.node.json', 'package.json', 'AGENTS.md', 'LICENSING.md', 'LICENSE']:
    if (ROOT / relative).exists():
        (ISO / relative).symlink_to(ROOT / relative)
freeze = read(PRIOR / 'prepared.freeze.manifest.json')
assert sha(PRIOR / 'prepared.freeze.manifest.json') == '773bfb3a5f8c95ecc44e8f0e361fc9e9ae65b2eca7392e3ed33bdcac5d623cc9'
for row in freeze['ownFiles']:
    assert sha(ROOT / row['path']) == row['sha256'], row['path']
for row in freeze['exactFutureChangedInputs']:
    src = ROOT / row['prospectiveCopyPath']
    assert sha(src) == row['sha256']
    active = ROOT / row['futureActivePath']
    actual = sha(active) if active.exists() else None
    assert actual == row['activeSHA256Before'], row['futureActivePath']
    physical_copy(src, row['futureActivePath'])
for row in freeze['exactUnchangedPlannedInputs']:
    assert sha(ROOT / row['futureActivePath']) == row['sha256'], row['futureActivePath']
    physical_copy(ROOT / row['futureActivePath'], row['futureActivePath'])

input_ = read(PRIOR / 'native-finalbook/round-a/description-review-input.json')
images = []
for goal in input_['goals']:
    vis = goal['reviewContext']['page']['visualization']
    public_path = 'app/public' + vis['url']
    src = ROOT / public_path
    if not src.exists():
        src = PRIOR / 'prospective-input-tree' / public_path
    assert sha(src) == vis['originalDigest'].removeprefix('sha256:')
    physical_copy(src, public_path)
    images.append({'path': public_path, 'sha256': sha(src), 'bytes': src.stat().st_size})

# Importer leaf parents must be writable inside the isolate. The JPG remains
# historic until an explicitly accepted replacement is actually imported.
for gid in ['16a80de2-b5e0-5467-a9b3-5860730d7d8b', '1f5ee84f-245a-5a1e-a260-f960f26523e9']:
    for prefix in ['curricula/DE/Gymnasium/visualizations/chemie', 'app/public/assets/goal-visualizations/chemie', 'backend/src/main/resources/static/assets/goal-visualizations/chemie']:
        physical_parent(f'{prefix}/{gid}/{gid}.png')
    for leaf in ['prompt.de.md', 'image-reconstruction-prompt.de.md']:
        relative = f'curricula/DE/Gymnasium/visualizations/chemie/{gid}/{leaf}'
        if (ISO / relative).exists():
            physical_copy(ISO / relative, relative)

# Detach every SourceAtlas output before the native producer runs. The native
# CLI writes through leaf paths and must never reach a source worktree symlink.
atlas = read(ISO / 'app/scripts/config/goal-books/de-gym-chemistry-national-atlas.inputs.json')
for relative in [atlas['manifestPath'], atlas['navigationViewPath']]:
    physical_copy(ISO / relative, relative)
directory = ISO / atlas['outputDirectory']
if directory.is_symlink():
    original = directory.resolve()
    directory.unlink()
    shutil.copytree(original, directory, symlinks=False)
for p in list(directory.iterdir()):
    if p.is_file() and p.is_symlink():
        physical_copy(p, str(p.relative_to(ISO)))

book = read(PRIOR / 'book.config.json')
book['outputPath'] = str(REL / 'future-full.book-model.json')
batch = read(PRIOR / 'batch.config.json')
batch.update({'batchId': 'chemie-b010-five-corrected-image-current-20261005-v3', 'bookId': 'de-gym-chemie-b010-five-corrected-image-current-20261005-v3', 'baseGoalBookConfigPath': str(REL / 'book.config.json'), 'outputDirectory': str(REL / 'native-finalbook')})
for name, value in [('book.config.json', book), ('batch.config.json', batch)]:
    (OWN / name).write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')
    write(str(REL / name), value)

receipt = {'schemaVersion': 1, 'preparedAtUTC': datetime.now(timezone.utc).isoformat(), 'head': subprocess.check_output(['git', 'rev-parse', 'HEAD'], text=True).strip(), 'isolationRoot': str(ISO), 'status': 'physical_isolate_ready_waiting_final_two_PNGs', 'priorPreparedFreezeSHA256': sha(PRIOR / 'prepared.freeze.manifest.json'), 'priorFrozenInputFilesVerified': len(freeze['ownFiles']), 'futureChangedInputsCopied': len(freeze['exactFutureChangedInputs']), 'plannedUnchangedInputsCopied': len(freeze['exactUnchangedPlannedInputs']), 'nativeCurrentCodeFiles': code, 'physicallyCopiedNineReviewImages': images, 'physicallyCopiedReviewImageBytes': sum(r['bytes'] for r in images), 'otherImagesReadOnlyMirrors': True, 'sourceAtlasNotYetGenerated': True, 'canonicalOwnScientificTextAuthorshipChanges': 0, 'humanApproval': False, 'activeWrites': 0}
(OWN / 'isolation-ready.actual.receipt.json').write_text(json.dumps(receipt, ensure_ascii=False, indent=2) + '\n')
print(json.dumps({'isolate': str(ISO), 'nativeCodeFiles': len(code), 'physicalReviewImageBytes': receipt['physicallyCopiedReviewImageBytes'], 'status': receipt['status']}))
