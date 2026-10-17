#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Check the sealed source8 CAS, or apply it only to an authorized private clone.

Default operation is read-only. --apply requires a separate preexisting capsule
under project tmp; neither R, L4, the author candidate nor history may be targets.
No compiler, CLI generation, independent review, source acceptance or release is
performed by this mechanical helper.
"""
from pathlib import Path
import argparse
import hashlib
import json
import os
import shutil

HERE = Path(__file__).parent.resolve()
MANIFEST = HERE / 'CAS.guarded-thirty-whole-files.source8.AUTHOR.inactive.json'
sha = lambda p: 'sha256:' + hashlib.sha256(Path(p).read_bytes()).hexdigest()

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--target-root', type=Path)
    parser.add_argument('--apply', action='store_true')
    args = parser.parse_args()
    data = json.loads(MANIFEST.read_text())
    repo = Path(data['repoRoot']).resolve()
    baseline = Path(data['baselineRoot']).resolve()
    target = args.target_root.absolute() if args.target_root else baseline
    if args.apply:
        if args.target_root is None:
            raise SystemExit('--apply requires an explicit separate private --target-root')
        if target.is_symlink() or not target.is_dir():
            raise SystemExit('Target must be an existing real private capsule directory')
        resolved_target = target.resolve()
        if not resolved_target.is_relative_to(repo / 'tmp'):
            raise SystemExit('Writes are restricted to private capsules under project tmp')
        protected = [Path(p).resolve() for p in data['protectedRoots'] if Path(p).resolve() != repo]
        for p in protected:
            if resolved_target == p or resolved_target.is_relative_to(p) or p.is_relative_to(resolved_target):
                raise SystemExit('Protected capsule, candidate, or preparation target rejected')
        target = resolved_target
    else:
        target = target.resolve()

    # Validate every before/after input first, before any mutation.
    canonical_rel = Path(data['baselineCanonical']['path']).relative_to(Path(data['baselineRoot']).relative_to(repo))
    if sha(target / canonical_rel) != data['baselineCanonical']['sha256']:
        raise SystemExit('Canonical guard failed; never silently rebase this candidate')
    seen = set()
    prepared = []
    for op in data['fileOperations']:
        relative = Path(op['logicalPath'])
        if relative.is_absolute() or '..' in relative.parts or not str(relative).startswith('curricula/DE/Gymnasium/'):
            raise SystemExit('Invalid logical target path')
        if relative in seen:
            raise SystemExit('Duplicate file operation')
        seen.add(relative)
        current = target / relative
        source = repo / op['after']['path']
        if not source.resolve().is_relative_to(HERE):
            raise SystemExit('Whole-after input escaped author candidate')
        if sha(current) != op['before']['sha256']:
            raise SystemExit('Before hash mismatch: ' + str(relative))
        if sha(source) != op['after']['sha256']:
            raise SystemExit('After hash mismatch: ' + str(relative))
        json.loads(source.read_text())
        prepared.append((relative, source, op['after']['sha256']))
    cells = repo / data['selectedCellPairs']['path']
    if sha(cells) != data['selectedCellPairs']['sha256']:
        raise SystemExit('Selected whole-cell audit guard failed')

    if not args.apply:
        print(json.dumps({'mode':'CHECK_ONLY','checkedWholeFileGuards':len(prepared),'writes':0,'reviewVotes':0}))
        return

    for relative, source, expected in prepared:
        parent = target
        for part in relative.parts[:-1]:
            parent = parent / part
            if parent.is_symlink():
                original = parent.resolve(strict=True)
                children = list(original.iterdir())
                parent.unlink()
                parent.mkdir()
                for child in children:
                    (parent / child.name).symlink_to(child)
            elif not parent.exists():
                parent.mkdir()
            elif not parent.is_dir():
                raise SystemExit('Non-directory parent in private target')
        destination = target / relative
        # Unlink symlinks and hardlinks before writing, protecting R/L4/history.
        if destination.is_symlink() or destination.exists():
            destination.unlink()
        with destination.open('xb') as stream:
            stream.write(source.read_bytes())
        if destination.stat().st_nlink != 1 or sha(destination) != expected:
            raise SystemExit('Physical private after-file check failed')
    if sha(target / canonical_rel) != data['baselineCanonical']['sha256']:
        raise SystemExit('Canonical changed unexpectedly')
    print(json.dumps({'mode':'APPLY_PRIVATE_CLONE','wholeFilesWritten':len(prepared),'canonicalUnchanged':True,'reviewVotes':0,'HumanApproval':False}))

if __name__ == '__main__':
    main()
