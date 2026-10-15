# SPDX-License-Identifier: Apache-2.0
"""Run unchanged Stock image importer in a new private host; no active writes."""
import hashlib
import json
import shutil
import subprocess
import sys
from pathlib import Path

REPO = Path.cwd()
OWN = Path(__file__).resolve().parents[1]
manifest = json.loads((OWN/'REBUILD.private-stock-import.inputs.json').read_text())
host = REPO/(sys.argv[1] if len(sys.argv)>1 else manifest['defaultExecutionHost'])
assert host.is_relative_to(REPO/'tmp') and not host.exists(), host

def verified(row):
    p = REPO/row['path']
    data = p.read_bytes()
    assert len(data) == row['bytes']
    assert 'sha256:'+hashlib.sha256(data).hexdigest() == row['sha256'], p
    return p

for row in manifest['stockModules']:
    p = host/row['path']
    p.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(verified(row), p)
landscape = host/manifest['normalLandscapePath']
landscape.parent.mkdir(parents=True, exist_ok=True)
shutil.copyfile(verified(manifest['wholeBefore']), landscape)
argv = ['node', str(host/'scripts/import_goal_visualization.mjs'),
        manifest['goalId'], str(verified(manifest['image'])),
        '--landscape', str(landscape), '--subject', 'chemie',
        '--provider', 'OpenAI / ChatGPT-Codex image generation',
        '--review-status', 'candidate', '--license', 'CC-BY-4.0',
        '--prompt', str(verified(manifest['generationPrompt'])),
        '--reconstruction-prompt', str(verified(manifest['reconstructionPrompt'])),
        '--alt-text', manifest['altText']]
run = subprocess.run(argv, cwd=host, capture_output=True, text=True)
(host/'IMPORT.stdout.actual.txt').write_text(run.stdout)
(host/'IMPORT.stderr.actual.txt').write_text(run.stderr)
assert run.returncode == 0, run.stderr
before = json.loads(verified(manifest['wholeBefore']).read_text())
after = json.loads(landscape.read_text())
B = {g['id']:g for g in before['goals']}
A = {g['id']:g for g in after['goals']}
changed = [i for i in B if A[i] != B[i]]
assert changed == [manifest['goalId']]
assert {k:v for k,v in A[changed[0]].items() if k!='resourceLinks'} == B[changed[0]]
image = verified(manifest['image'])
native_hash = hashlib.sha256(image.read_bytes()).hexdigest()
for relative in manifest['normalImageDestinations']:
    assert hashlib.sha256((host/relative).read_bytes()).hexdigest() == native_hash
receipt = {'role':'Unmodified Stock importer in a private new host; not a V vote',
           'exitCode':run.returncode, 'changedWholeGoalIds':changed,
           'other553WholeGoalsUnchanged':True, 'allNonResourceFieldsUnchanged':True,
           'nativePNGAndAllThreeImportedCopiesExact':True,
           'wholeAfterSHA256':'sha256:'+hashlib.sha256(landscape.read_bytes()).hexdigest(),
           'imageSHA256':'sha256:'+native_hash, 'activeIntegration':False,
           'independentApprovals':0, 'humanApproval':False, 'humanTrial':False}
(host/'IMPORT.CAS.actual.json').write_text(json.dumps(receipt,indent=2)+'\n')
print(json.dumps(receipt))
