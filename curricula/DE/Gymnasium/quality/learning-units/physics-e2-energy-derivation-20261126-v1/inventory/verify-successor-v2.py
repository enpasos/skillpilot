#!/usr/bin/env python3
"""Verify the single fixed post-CI test repair and its unchanged native parent."""
from pathlib import Path
import argparse, difflib, hashlib, json, re, subprocess, sys

PARENT = 'b503e5d949388af2aa5e32557c17e359b520a310'
D = 'curricula/DE/Gymnasium/quality/learning-units/physics-e2-energy-derivation-20261126-v1/inventory'
TEST = 'app/scripts/testHessePhysicsFlashcardActions.ts'
VERIFIER, RECEIPT, MANIFEST = (D + '/' + name for name in
    ['verify-successor-v2.py', 'successor-v2.actual.json', 'record-lifecycle.actual.json'])
OLD = '94b2ec3af628e97c79e18d82d56c59e55076cdd689aabd32dc5035019285e044'
NEW = '15d736bb45a77cc299da882b0fabe6cbe6f0c168bc7ec748a8202f6daa5a1bc9'
PARENT_SHA = '8ad5e2540bfa808fe7986274abbf802f4598eb9e2f71cc376542972f6154f0ae'
CONTRACT = 'task-n-post-ci-test-expectation-supplement-v2'
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--repo', required=True, type=Path)
parser.add_argument('--head', required=True)
parser.add_argument('--external-root', action='append', default=[])
args = parser.parse_args()
repo = args.repo.resolve()

def check(ok, reason):
    if not ok:
        raise RuntimeError(reason)

def git(*command):
    return subprocess.check_output(['git', *command], cwd=repo)

def sha(raw):
    return hashlib.sha256(raw).hexdigest()

head = args.head
check(re.fullmatch(r'[0-9a-f]{40}', head) and head != PARENT, 'Exact successor commit required')
check(git('cat-file', '-t', head).strip() == b'commit', 'Anchor must be a commit')
git('merge-base', '--is-ancestor', PARENT, head)
check(git('rev-parse', 'HEAD').decode().strip() == head, 'Checkout is not at the exact successor')
check(not git('diff', '--name-only', '--ignore-submodules=none').strip(), 'Working changes remain')
check(not git('diff', '--cached', '--name-only', 'HEAD', '--ignore-submodules=none').strip(), 'Staged changes remain')
check(not git('ls-files', '--others', '--exclude-standard').strip(), 'Untracked paths remain')
parts = git('diff', '--name-status', '--no-renames', '--ignore-submodules=none', '-z', PARENT, head).split(b'\0')
check(len(parts) == 7 and parts[-1] == b'', 'Expected exactly three changed paths')
changes = {parts[i + 1].decode(): parts[i].decode() for i in range(0, 6, 2)}
check(changes == {TEST: 'M', VERIFIER: 'A', RECEIPT: 'A'}, 'Unexpected successor path or change type')
for path in changes:
    check(git('ls-tree', head, '--', path).startswith(b'100644 blob '), 'File mode must remain 100644')
old, new = (git('show', commit + ':' + TEST) for commit in [PARENT, head])
check(sha(old) == OLD and sha(new) == NEW, 'The fixed test before/after bytes differ')
check((repo / TEST).read_bytes() == new, 'Working test differs from its committed blob')
parent = git('show', PARENT + ':' + MANIFEST)
check(sha(parent) == PARENT_SHA and git('show', head + ':' + MANIFEST) == parent, 'Sealed parent manifest changed')
code = git('show', head + ':' + VERIFIER)
check(Path(__file__).read_bytes() == code, 'Use the exact committed verifier')
raw = git('show', head + ':' + RECEIPT)
check((repo / RECEIPT).read_bytes() == raw, 'Working receipt differs from its committed blob')
patch = ''.join(difflib.unified_diff(old.decode().splitlines(True), new.decode().splitlines(True),
    fromfile='a/' + TEST, tofile='b/' + TEST)).encode()
counts = {'inheritedRecords': 300, 'newTestRecords': 1, 'bootstrapFiles': 10, 'cumulativeTrackedPaths': 311}
expected = {
    'schemaVersion': 2, 'contract': CONTRACT,
    'parent': {'head': PARENT, 'manifest': {'path': MANIFEST, 'sha256': PARENT_SHA}},
    'test': {'path': TEST, 'beforeSha256': OLD, 'afterSha256': NEW,
             'deltaEncoding': 'python-difflib-unified-utf8-v1', 'deltaSha256': sha(patch)},
    'verifier': {'path': VERIFIER, 'sha256': sha(code)},
    'self': {'path': RECEIPT, 'recursiveSelfHash': False},
    'exactChangedPaths': sorted(changes), 'counts': counts,
}
check(json.loads(raw) == expected, 'Finite successor receipt differs')
command = [sys.executable, str(repo / D / 'verify-lifecycle.py'), '--repo', str(repo),
           '--anchor', PARENT, '--native']
for root in args.external_root:
    command.extend(['--external-root', root])
subprocess.run(command, cwd=repo, check=True)
check(git('rev-parse', 'HEAD').decode().strip() == head, 'HEAD changed during the native audit')
check(not git('diff', '--name-only', '--ignore-submodules=none').strip()
      and not git('diff', '--cached', '--name-only', 'HEAD', '--ignore-submodules=none').strip()
      and not git('ls-files', '--others', '--exclude-standard').strip(), 'Successor changed during the native audit')
print(json.dumps({'status': 'PASS', 'contract': CONTRACT, 'head': head, 'parentHead': PARENT,
    'parentManifestSha256': PARENT_SHA, 'changedTestFiles': 1, 'otherChangedPaths': 0,
    'parentNativeVerified': True, 'counts': counts, 'scientificOrHumanApprovalGranted': False}))
