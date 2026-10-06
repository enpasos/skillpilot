#!/usr/bin/env python3
"""SPDX-License-Identifier: Apache-2.0
Prepare a physically separate inactive BIO v3 using exact frozen v2 inputs.
"""
from pathlib import Path
import hashlib, json, os, shutil, subprocess, sys
from datetime import datetime, timezone

ROOT = Path.cwd()
REL = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/biologie-q1-tf-methylation-current-source-consumer-candidate-v3'
OWN = ROOT / REL
PRIOR = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/biologie-q1-tf-methylation-source-version-correction-current-candidate-v2'
OLD_ISO = ROOT / 'tmp/biologie-q1-tf-methylation-source-v2-native-isolated-20261005-v2'
ISO = ROOT / 'tmp/biologie-q1-tf-methylation-current-source-consumer-native-isolated-20261005-v3'

def read(p): return json.loads(Path(p).read_text())
def sha(p): return 'sha256:' + hashlib.sha256(Path(p).read_bytes()).hexdigest()
def write(p, value):
    p = Path(p); p.parent.mkdir(parents=True, exist_ok=True)
    assert not p.is_symlink(), p
    p.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')
def copy_physical(src, dst):
    src, dst = Path(src), Path(dst)
    dst.parent.mkdir(parents=True, exist_ok=True)
    assert dst.parent.resolve().is_relative_to(ISO), dst
    if dst.is_symlink(): dst.unlink()
    shutil.copy2(src, dst)
    assert not dst.is_symlink() and sha(src) == sha(dst)
def both(name, value):
    write(OWN / name, value); write(ISO / REL / name, value)

resume = sys.argv[1:] == ['--resume-after-parent-isolation-guard']
assert OLD_ISO.is_dir() and (not ISO.exists() or resume), 'Never replace existing native work'
freeze = read(PRIOR / 'prepared-inputs.freeze.json')
for item in freeze['files']:
    assert sha(ROOT / item['preparedPath']) == item['sha256']
    assert sha(OLD_ISO / item['path']) == item['sha256']
boundary = read(PRIOR / 'active-input-boundary.before.json')
current_boundary = [{'path': item['path'], 'sha256': sha(ROOT / item['path'])} for item in boundary['paths']]
write(OWN / 'active-input-boundary.before.json', {'recordedAtUTC': datetime.now(timezone.utc).isoformat(), 'paths': current_boundary})
if not resume:
    shutil.copytree(OLD_ISO, ISO, symlinks=True)
    assert not (ISO / REL).exists()
    (ISO / REL).mkdir(parents=True)
# The old safe v2 preparation shares app/src read-only. This new compiler copy
# requires a physical parent before any leaf may be replaced.
for directory in ['app/scripts', 'app/src', 'scripts']:
    destination = ISO / directory
    if destination.is_symlink():
        assert destination.parent.resolve().is_relative_to(ISO)
        destination.unlink()
        shutil.copytree(ROOT / directory, destination, symlinks=True)
code = []
# Copy native code physically, and retain all unchanged historical data leaves.
for directory in ['app/scripts', 'app/src', 'scripts']:
    for base, directories, files in os.walk(ROOT / directory):
        directories[:] = [name for name in directories if name not in ['node_modules', '__pycache__']]
        for name in files:
            src = Path(base) / name
            if src.suffix in ['.ts', '.tsx', '.mjs', '.js', '.py', '.json']:
                path = src.relative_to(ROOT).as_posix()
                copy_physical(src, ISO / path)
                code.append({'path': path, 'sha256': sha(src)})
# Snapshot active canonical graphs and central selection before applying BIO-only candidate bytes.
for src in (ROOT / 'curricula/DE/Gymnasium/canonical').glob('*.json'):
    copy_physical(src, ISO / src.relative_to(ROOT))
registry_path = 'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'
copy_physical(ROOT / registry_path, ISO / registry_path)
for item in freeze['files']:
    copy_physical(ROOT / item['preparedPath'], ISO / item['path'])
    assert sha(ISO / item['path']) == item['sha256']
    target = OWN / 'prospective-input-tree' / item['path']
    target.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(ROOT / item['preparedPath'], target)
native_needed = ['app/public/assets/goal-visualizations/biologie/8eb86a82-122d-5cae-8f80-bb2850b29c2f/8eb86a82-122d-5cae-8f80-bb2850b29c2f.png']
for path in native_needed: copy_physical(ROOT / path, ISO / path)
for name in ['positive-evidence.candidates.json', 'positive.validation-only.review.jsonl',
             'full-atomicity.candidate.review.jsonl', 'full-memory.candidate.review.jsonl']:
    src = PRIOR / name
    if src.is_file():
        shutil.copy2(src, OWN / name)
        copy_physical(src, ISO / REL / name)
book = read(PRIOR / 'book.config.json'); book['outputPath'] = REL + '/prospective-full.book-model.json'
both('book.config.json', book)
batch = read(PRIOR / 'batch.config.json')
batch.update(batchId='biologie-q1-tf-methylation-current-source-consumer-20261005-v3',
             bookId='de-gym-biologie-q1-tf-methylation-current-source-consumer-20261005-v3',
             title='Biologie Q1 – TF und DNA-Methylierung mit aktueller Originalquellenbindung',
             baseGoalBookConfigPath=REL + '/book.config.json', outputDirectory=REL + '/native-finalbook')
both('batch.config.json', batch)
source_code_path = 'app/scripts/goalBookOriginalSources.ts'
assert sha(ISO / source_code_path) == sha(ROOT / source_code_path)
both('native-isolation-and-exact-v2-reuse.actual.receipt.json', {
    'recordedAtUTC': datetime.now(timezone.utc).isoformat(), 'isolationRoot': str(ISO),
    'sourceFreezePath': str((PRIOR / 'prepared-inputs.freeze.json').relative_to(ROOT)),
    'sourceFreezeSha256': sha(PRIOR / 'prepared-inputs.freeze.json'),
    'all38ProspectiveInputBytesExact': True, 'rootCandidateInputsWritten': 0,
    'nativeCodeBindings': code, 'physicalThreeGoalImageLeaves': native_needed + [item['path'] for item in freeze['files'] if item['path'].startswith('app/public/assets/')],
    'historicalLeafMirrorReadOnly': True, 'compilerUsesCurrentConfiguredSourceSelection': True,
    'humanApproval': False, 'newStrictClosures': 0,
})
print(json.dumps({'status': 'inactive_v3_prepared', 'isolationRoot': str(ISO), 'nativeCodeFiles': len(code), 'futureInputsVerified': len(freeze['files'])}))
