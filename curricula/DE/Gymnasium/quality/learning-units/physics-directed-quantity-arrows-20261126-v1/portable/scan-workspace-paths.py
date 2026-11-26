#!/usr/bin/env python3
"""Compare all Git blob contents and names against the actual checkout prefixes."""
import argparse
import hashlib
import json
from pathlib import Path
import os
import subprocess
import tempfile

parser = argparse.ArgumentParser()
parser.add_argument('--repo', type=Path, required=True)
parser.add_argument('--anchor', required=True)
parser.add_argument('--baseline', default='eb77c4fb68ef701f9c188e0a66411dbfb76dfd26')
parser.add_argument('--fresh', action='store_true', help='Repeat the full baseline Git scan without reusing cached results')
args = parser.parse_args()
root = args.repo.resolve()
def git(*argv):
    return subprocess.check_output(['git', '-C', str(root), *argv])
primary = Path(os.fsdecode(git('rev-parse', '--path-format=absolute', '--git-common-dir').strip())).parent
prefixes = sorted({os.fsencode(primary), os.fsencode(root)})
def digest(data):
    return hashlib.sha256(data).hexdigest()
def tree(ref):
    return git('rev-parse', '--verify', ref+'^{tree}').decode().strip()
def records(oid):
    rows = git('ls-tree', '-r', '-z', oid).split(b'\0')
    result = {}
    for row in filter(None, rows):
        head, path = row.split(b'\t', 1)
        _, kind, obj = head.split(b' ')
        if kind == b'blob':
            result[path] = obj
    return result
def hits(oid, rows):
    # Git's binary-as-text search looks at raw bytes for every tracked blob.
    # Cache only the baseline and validate its payload before reuse.
    key = digest(b'v1\0'+oid.encode()+b'\0'+b'\0'.join(prefixes))
    cache = Path(tempfile.gettempdir()) / ('skillpilot-workspace-scan-'+key+'.json')
    if cache.is_file() and not args.fresh:
        c = json.loads(cache.read_bytes()); paths = bytes.fromhex(c['names'])
        if digest(paths) == c['sha256']:
            match = set(filter(None, paths.split(b'\0')))
            if match <= set(rows):return match
    cmd = ['git','-C',str(root),'grep','--no-textconv','--threads=3','-a','-F','-l','-z']
    for p in prefixes:cmd.extend(['-e',os.fsdecode(p)])
    r = subprocess.run([*cmd,oid,'--'],stdout=subprocess.PIPE)
    if r.returncode not in (0,1):raise SystemExit('Git could not scan all blobs')
    match = {s.split(b':',1)[1] for s in r.stdout.split(b'\0') if s}
    match.update(path for path in rows if any(prefix in path for prefix in prefixes))
    paths = b'\0'.join(sorted(match))
    with tempfile.NamedTemporaryFile(mode='w',dir=cache.parent,delete=False) as f:
        json.dump({'names':paths.hex(),'sha256':digest(paths)},f)
    os.replace(f.name,cache)
    return match
base, current = tree(args.baseline), tree(args.anchor)
old, new = records(base), records(current)
old_hits = hits(base, old)
# Every unchanged Git object inherits the exact full scan. Inspect every changed blob byte.
new_hits = {p for p in old_hits if new.get(p)==old[p]}
changed = {p:v for p,v in new.items() if old.get(p)!=v}
for p,v in changed.items():
    blob = git('cat-file','blob',v.decode())
    if any(prefix in p or prefix in blob for prefix in prefixes):
        new_hits.add(p)
added = sorted(p for p in new_hits if p not in old_hits or old.get(p)!=new[p])
def witness(names, rows):
    return digest(b''.join(p+b'\0'+rows[p]+b'\0' for p in sorted(names)))
print(json.dumps({'contract':'workspace-path-scan-git-blobs-v1','tree':current,'baselineTree':base,'baselineBlobPaths':len(old),'currentBlobPaths':len(new),'changedBlobPathsRead':len(changed),'prefixCount':len(prefixes),'inheritedHitCount':len(new_hits)-len(added),'currentWholeTreeHitCount':len(new_hits),'baselineHitCount':len(old_hits),'newOrChangedHitCount':len(added),'newOrChangedHitPaths':[os.fsdecode(i) for i in added],'currentHitSetSha256':witness(new_hits,new),'baselineHitSetSha256':witness(old_hits,old),'wholeTreeClean':not new_hits},indent=2))
raise SystemExit(3 if added else 2 if new_hits else 0)
