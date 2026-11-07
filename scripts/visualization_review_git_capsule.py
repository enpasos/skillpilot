#!/usr/bin/env python3
"""Selective, externally pinned original-review Git objects for a private shallow reader probe.

This component neither qualifies reviews nor activates a learner/QA migration.
It never fetches history. Existing current inputs remain separately byte-bound.
"""
import argparse
import hashlib
import json
import os
from pathlib import Path
import shutil
import subprocess
import zlib


def require(value, message):
    if not value:
        raise ValueError(message)


def sha(raw):
    return hashlib.sha256(raw).hexdigest()


def relative(path):
    require(isinstance(path, str) and path and not path.startswith('/') and '\\' not in path and '\0' not in path
            and all(p not in ('', '.', '..') for p in path.split('/')), 'Unsafe relative evidence path')
    return path


def framed(kind, raw):
    return kind.encode() + b' ' + str(len(raw)).encode() + b'\0' + raw


def oid(kind, raw):
    return hashlib.sha1(framed(kind, raw)).hexdigest()


def environment():
    env = dict(os.environ)
    for key in ('GIT_DIR', 'GIT_WORK_TREE', 'GIT_COMMON_DIR', 'GIT_INDEX_FILE', 'GIT_OBJECT_DIRECTORY', 'GIT_ALTERNATE_OBJECT_DIRECTORIES'):
        env.pop(key, None)
    env.update(GIT_NO_REPLACE_OBJECTS='1', GIT_GRAFT_FILE=os.devnull)
    return env


def git(root, *args, check=True):
    run = subprocess.run(['git', '--no-replace-objects', '-C', str(root), '--literal-pathspecs', *args],
                         env=environment(), capture_output=True)
    require(not check or run.returncode == 0, 'Git object operation failed: ' + args[0])
    return run.stdout if check else run.returncode


def read_bound(root, path, digest):
    source = (root / relative(path)).resolve(strict=True)
    require(source.is_relative_to(root), 'Input leaves source repository')
    raw = source.read_bytes()
    require(sha(raw) == digest, 'Bound current input differs: ' + path)
    return raw


def originals(root, census_path, accepted_census):
    census = json.loads(read_bound(root, census_path, accepted_census))
    refs, receipts, working = {}, [], {}
    def add_working(path, digest):
        raw = read_bound(root, path, digest)
        row = {'path': path, 'sha256': digest, 'bytes': len(raw)}
        require(path not in working or working[path] == row, 'Conflicting working input')
        working[path] = row
    add_working(census_path, accepted_census)
    source_files = {}
    for entry in census['activeInputPins']:
        if entry['path'].startswith('curricula/DE/Gymnasium/canonical/'):
            add_working(entry['path'], entry['sha256'])
            source = json.loads(read_bound(root, entry['path'], entry['sha256']))
            source_files[source['landscapeId']] = source
    for entry in census['candidateReceipts']:
        add_working(entry['path'], entry['sha256'])
        receipt = json.loads(read_bound(root, entry['path'], entry['sha256']))
        receipts.append({'path': entry['path'], 'sha256': entry['sha256']})
        for role in ('originalReview', 'originalInput', 'ownerSource', 'reviewedAsset'):
            ref = receipt[role]
            key = (ref['gitCommit'], ref['path'])
            require(key not in refs or refs[key] == ref, 'Contradictory original binding')
            refs[key] = ref
            if role != 'ownerSource':
                add_working(ref['path'], ref['sha256'])
        source = source_files[receipt['context']['landscapeId']]
        goals = [g for g in source['goals'] if g['id'] == receipt['context']['goalId']]
        require(len(goals) == 1, 'Current owner/goal is ambiguous')
        links = [link for link in goals[0].get('resourceLinks', [])
                 if link.get('type') == 'goal-visualization' and link.get('role', 'primary') == 'primary']
        require(len(links) == 1 and links[0]['url'].startswith('/assets/goal-visualizations/'), 'Current primary image is ambiguous')
        url = links[0]['url']
        digest = receipt['context']['assetSha256'].removeprefix('sha256:')
        add_working('app/public' + url, digest)
        add_working('curricula/DE/Gymnasium/visualizations/' + url.removeprefix('/assets/goal-visualizations/'), digest)
    return census, [refs[key] for key in sorted(refs)], receipts, [working[path] for path in sorted(working)]


def tree_entries(raw):
    result, index = {}, 0
    while index < len(raw):
        space, zero = raw.index(b' ', index), raw.index(b'\0', index)
        mode, name = raw[index:space].decode(), raw[space + 1:zero].decode()
        require(name not in result and zero + 21 <= len(raw), 'Malformed or duplicate Git tree entry')
        result[name] = (mode, raw[zero + 1:zero + 21].hex())
        index = zero + 21
    return result


def inclusion(ref, get_object):
    commit = get_object(ref['gitCommit'], 'commit')
    tree = commit.split(b'\n', 1)[0].removeprefix(b'tree ').decode()
    parts = relative(ref['path']).split('/')
    for index, part in enumerate(parts):
        entries = tree_entries(get_object(tree, 'tree'))
        require(part in entries, 'Original Git path missing')
        mode, selected = entries[part]
        if index + 1 < len(parts):
            require(mode == '40000', 'Original Git parent is not a tree')
            tree = selected
        else:
            require(mode in ('100644', '100755'), 'Original Git input is not a regular file')
            raw = get_object(selected, 'blob')
            require(sha(raw) == ref['sha256'], 'Original inclusion blob digest differs')
            return selected


def build(args):
    root = args.repository_root.resolve(strict=True)
    census, refs, receipts, working = originals(root, args.census_path, args.accepted_census_sha256)
    require(census['acceptedRepositoryCommit'] == args.accepted_commit, 'External original-history anchor differs')
    commits = sorted({r['gitCommit'] for r in refs})
    require(all(git(root, 'merge-base', '--is-ancestor', c, args.accepted_commit, check=False) == 0 for c in commits), 'Original commit outside accepted history')
    oldest = [c for c in commits if all(git(root, 'merge-base', '--is-ancestor', c, other, check=False) == 0 for other in commits)]
    require(len(oldest) == 1, 'This bounded capsule requires a single oldest original-history boundary')
    lines = git(root, 'rev-list', '--parents', '--ancestry-path', oldest[0] + '..' + args.accepted_commit).decode().splitlines()
    graph = {line.split()[0]: line.split()[1:] for line in lines}
    internal = set(graph)
    boundaries = ({parent for parents in graph.values() for parent in parents} - internal) | {oldest[0]}
    wanted_commits = internal | boundaries
    require(set(commits) <= wanted_commits and args.accepted_commit in wanted_commits, 'Incomplete bounded commit graph')
    output = args.output.resolve()
    require(not output.exists(), 'Capsule output already exists')
    output.mkdir(parents=True)
    objects, payloads, embedded_bytes = {}, {}, 0
    current_sources = {r['sha256']: r['path'] for r in working}
    def capture(object_id, kind):
        nonlocal embedded_bytes
        if object_id in objects:
            require(objects[object_id]['type'] == kind, 'Object type conflict')
            return payloads[object_id]
        raw = git(root, 'cat-file', kind, object_id)
        require(oid(kind, raw) == object_id, 'Git object content does not hash to its actual OID')
        row = {'oid': object_id, 'type': kind, 'bytes': len(raw), 'sha256': sha(raw)}
        source = current_sources.get(row['sha256']) if kind == 'blob' else None
        if source:
            row.update(storage='current-file', path=source)
        else:
            embedded_bytes += len(raw)
            require(embedded_bytes <= args.maximum_embedded_bytes, 'Selective capsule exceeds measured embedding budget')
            path = 'objects/' + object_id[:2] + '/' + object_id[2:]
            destination = output / path
            destination.parent.mkdir(parents=True, exist_ok=True)
            destination.write_bytes(zlib.compress(framed(kind, raw), 9))
            row.update(storage='embedded', path=path)
        objects[object_id] = row
        payloads[object_id] = raw
        return raw
    for commit in sorted(wanted_commits):
        capture(commit, 'commit')
    for ref in refs:
        inclusion(ref, capture)
    body = {'schemaVersion': 1, 'kind': 'selective-visual-review-original-git-capsule',
            'acceptedRepositoryCommit': args.accepted_commit, 'censusPath': args.census_path,
            'censusSha256': args.accepted_census_sha256, 'originalReferences': refs, 'receiptReferences': receipts,
            'shallowBoundaries': sorted(boundaries), 'objects': [objects[key] for key in sorted(objects)],
            'workingInputs': working, 'newReviewClaimed': False, 'runtimeActivationAllowed': False}
    raw = (json.dumps(body, indent=2) + '\n').encode()
    (output / 'capsule.json').write_bytes(raw)
    print(json.dumps({'manifestRawSha256': sha(raw), 'objects': len(objects), 'commitObjects': len(wanted_commits),
                      'embeddedUncompressedBytes': embedded_bytes,
                      'capsuleStoredBytes': sum(p.stat().st_size for p in output.rglob('*') if p.is_file()),
                      'workingPathCount': len(working), 'workingUniqueBytes': sum({r['sha256']: r['bytes'] for r in working}.values()),
                      'fullHistoryFetchPerformed': False, 'sourceWritesPerformed': False}))


def materialize(args):
    root, capsule = args.repository_root.resolve(strict=True), args.capsule.resolve(strict=True)
    raw = (capsule / 'capsule.json').read_bytes()
    require(sha(raw) == args.accepted_capsule_sha256, 'External capsule digest differs')
    body = json.loads(raw)
    require(set(body) == {'schemaVersion', 'kind', 'acceptedRepositoryCommit', 'censusPath', 'censusSha256', 'originalReferences',
                         'receiptReferences', 'shallowBoundaries', 'objects', 'workingInputs', 'newReviewClaimed', 'runtimeActivationAllowed'},
            'Unknown or missing capsule field')
    require(body['schemaVersion'] == 1 and body['kind'] == 'selective-visual-review-original-git-capsule', 'Wrong capsule type')
    require(body['newReviewClaimed'] is False and body['runtimeActivationAllowed'] is False, 'A transport cannot claim a review or runtime activation')
    require(body['acceptedRepositoryCommit'] == args.accepted_commit and body['censusSha256'] == args.accepted_census_sha256, 'External capsule authority differs')
    census, refs, receipts, working = originals(root, body['censusPath'], args.accepted_census_sha256)
    require(census['acceptedRepositoryCommit'] == args.accepted_commit and refs == body['originalReferences']
            and receipts == body['receiptReferences'] and working == body['workingInputs'], 'Independent input/receipt inventory differs')
    require(len({r['oid'] for r in body['objects']}) == len(body['objects']), 'Duplicate capsule objects')
    unique_working = sum({r['sha256']: r['bytes'] for r in working}.values())
    object_bytes = sum(r['bytes'] for r in body['objects'])
    require(unique_working <= args.maximum_working_bytes and object_bytes <= args.maximum_object_bytes, 'Private component budget exceeded')
    output = args.output.resolve()
    require(not output.exists() and output != root and not root.is_relative_to(output), 'Mini repository output is not private and new')
    output.parent.mkdir(parents=True, exist_ok=True)
    require(shutil.disk_usage(output.parent).free >= unique_working + object_bytes + args.reserve_bytes, 'Private component reserve would be exhausted')
    output.mkdir()
    git(output, 'init', '--quiet')
    records, payloads = {}, {}
    for row in body['objects']:
        object_id, kind = row['oid'], row['type']
        require(len(object_id) == 40 and set(object_id) <= set('0123456789abcdef') and kind in ('commit', 'tree', 'blob'), 'Invalid capsule object')
        require(set(row) == {'oid', 'type', 'bytes', 'sha256', 'storage', 'path'} and row['storage'] in ('current-file', 'embedded'), 'Invalid object binding shape')
        if row['storage'] == 'current-file':
            payload = read_bound(root, row['path'], row['sha256'])
            data = framed(kind, payload)
        else:
            path = relative(row['path'])
            require(path == 'objects/' + object_id[:2] + '/' + object_id[2:], 'Embedded object locator differs')
            compressed = (capsule / path).read_bytes()
            stream = zlib.decompressobj()
            data = stream.decompress(compressed)
            require(stream.eof and not stream.unused_data, 'Malformed or trailing compressed object bytes')
            header, payload = data.split(b'\0', 1)
            require(header == kind.encode() + b' ' + str(len(payload)).encode(), 'Git object framing differs')
        require(len(payload) == row['bytes'] and sha(payload) == row['sha256'] and hashlib.sha1(data).hexdigest() == object_id, 'Capsule object SHA/type/length differs')
        destination = output / '.git/objects' / object_id[:2] / object_id[2:]
        destination.parent.mkdir(exist_ok=True)
        destination.write_bytes(zlib.compress(data))
        destination.chmod(0o444)
        records[object_id], payloads[object_id] = row, payload
    used = set()
    def get_object(object_id, kind):
        require(object_id in records and records[object_id]['type'] == kind, 'Required original object missing or wrong type')
        used.add(object_id)
        return payloads[object_id]
    boundaries, pending, seen = set(body['shallowBoundaries']), [args.accepted_commit], set()
    while pending:
        commit = pending.pop()
        if commit in seen:
            continue
        seen.add(commit)
        content = get_object(commit, 'commit')
        if commit not in boundaries:
            pending.extend(line[7:].decode() for line in content.split(b'\n\n', 1)[0].splitlines() if line.startswith(b'parent '))
    require(boundaries <= seen, 'Unreachable shallow boundary')
    for ref in refs:
        require(ref['gitCommit'] in seen, 'Original reference commit is not in authenticated parent graph')
        inclusion(ref, get_object)
    require(used == set(records), 'Capsule contains undeclared objects outside exact commit/path closure')
    (output / '.git/shallow').write_text(''.join(commit + '\n' for commit in sorted(boundaries)))
    git(output, 'update-ref', 'refs/heads/qa-originals', args.accepted_commit)
    git(output, 'symbolic-ref', 'HEAD', 'refs/heads/qa-originals')
    own_inodes = {}
    for row in working:
        path = output / relative(row['path'])
        path.parent.mkdir(parents=True, exist_ok=True)
        if row['sha256'] in own_inodes:
            os.link(own_inodes[row['sha256']], path)
        else:
            path.write_bytes(read_bound(root, row['path'], row['sha256']))
            path.chmod(0o444)
            own_inodes[row['sha256']] = path
    require(git(output, 'rev-parse', '--is-shallow-repository').strip() == b'true', 'Mini repository is not actually shallow')
    print(json.dumps({'status': 'private-shallow-component-materialized', 'objects': len(records), 'uniqueWorkingBytes': unique_working,
                      'objectPayloadBytes': object_bytes, 'workingPaths': len(working), 'hostHardlinksCreated': False,
                      'fullRepositoryMaterialized': False, 'sourceWritesPerformed': False}))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('action', choices=('build', 'materialize'))
    parser.add_argument('--repository-root', type=Path, default=Path(__file__).resolve().parents[1])
    parser.add_argument('--accepted-commit', required=True)
    parser.add_argument('--accepted-census-sha256', required=True)
    parser.add_argument('--census-path', default='qa-artifacts/ci-contract-audit/2026-11-06/visualization-context-first-two-families/family-census.json')
    parser.add_argument('--output', type=Path, required=True)
    parser.add_argument('--capsule', type=Path)
    parser.add_argument('--accepted-capsule-sha256')
    parser.add_argument('--maximum-embedded-bytes', type=int, default=16 * 1024 * 1024)
    parser.add_argument('--maximum-working-bytes', type=int, default=64 * 1024 * 1024)
    parser.add_argument('--maximum-object-bytes', type=int, default=64 * 1024 * 1024)
    parser.add_argument('--reserve-bytes', type=int, default=256 * 1024 * 1024)
    args = parser.parse_args()
    require(len(args.accepted_commit) == 40 and set(args.accepted_commit) <= set('0123456789abcdef'), 'Exact accepted commit required')
    require(len(args.accepted_census_sha256) == 64 and set(args.accepted_census_sha256) <= set('0123456789abcdef'), 'Exact accepted census SHA256 required')
    build(args) if args.action == 'build' else materialize(args)


if __name__ == '__main__':
    main()
