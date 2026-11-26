#!/usr/bin/env python3
"""Reproduce Task A2's finite file, path-binding and digest-contract inventory.

The default verifies; --refresh writes only the compact v3 successor inventory.
External roots are command-line aliases, never account-specific stored paths.
"""
from pathlib import Path, PurePosixPath
import argparse
import collections
import fnmatch
import hashlib
import json
import re
import subprocess
import sys
import gzip
import os
import atexit
import tempfile
import difflib
from functools import lru_cache

HERE = Path(__file__).resolve().parent
POLICY = json.loads((HERE / 'lifecycle-policy.json').read_text())
HEX = re.compile(r'^(?:sha256:)?([a-fA-F0-9]{64})$')
ap = argparse.ArgumentParser(description=__doc__)
ap.add_argument('--repo', type=Path, required=True)
ap.add_argument('--external-root', action='append', default=[], metavar='ALIAS=DIRECTORY')
ap.add_argument('--anchor', help='finite implementation commit; omits later worktree changes')
ap.add_argument('--refresh', action='store_true')
ap.add_argument('--native', action='store_true', help='also run native book/profile integrity functions')
ap.add_argument('--cache-dir', type=Path, help='private disposable hash cache outside the inventory')
a = ap.parse_args()
R = a.repo.resolve()
CACHE_DIR = a.cache_dir or Path(tempfile.gettempdir()) / ('skillpilot-a2-inventory-' + hashlib.sha256(str(R).encode()).hexdigest()[:16])
CACHE_DIR.mkdir(parents=True, exist_ok=True)
CACHE_FILE = CACHE_DIR / 'file-sha256-cache.json'
try:
    file_hash_cache = json.loads(CACHE_FILE.read_text())
except (OSError, ValueError):
    file_hash_cache = {}
file_signatures = {}
atexit.register(lambda: CACHE_FILE.write_text(json.dumps(file_hash_cache, separators=(',', ':'))))
D = POLICY['dossier']
roots = {'repo': R}
for arg in a.external_root:
    alias, sep, location = arg.partition('=')
    if not sep or alias in roots:
        raise SystemExit('Invalid or duplicate external root alias')
    roots[alias] = Path(location).resolve()
allowed_roots = {'repo', *POLICY['externalRoots'], *POLICY.get('optionalExternalRoots', {})}
if set(roots) - allowed_roots:
    raise SystemExit('Unrecognized external root alias')

def check(ok, why):
    if not ok:
        raise RuntimeError(why)

def sha(raw):
    return hashlib.sha256(raw).hexdigest()

def raw_file_info(path):
    before = path.stat()
    signature = [before.st_dev, before.st_ino, before.st_size, before.st_mtime_ns, before.st_ctime_ns]
    key = str(path)
    old = file_hash_cache.get(key)
    if old and old['signature'] == signature:
        digest = old['sha256']
    else:
        h = hashlib.sha256()
        with path.open('rb') as stream:
            for block in iter(lambda: stream.read(1024 * 1024), b''):
                h.update(block)
        digest = h.hexdigest()
    after = path.stat()
    check(signature == [after.st_dev, after.st_ino, after.st_size, after.st_mtime_ns, after.st_ctime_ns], 'Input changed while hashing')
    file_hash_cache[key] = {'signature': signature, 'sha256': digest}
    file_signatures[key] = signature
    return {'sha256': digest, 'bytes': before.st_size}

class GitBlobs:
    def __init__(self):
        self.process = subprocess.Popen(['git', 'cat-file', '--batch'], cwd=R, stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.DEVNULL)
        self.cache_path = CACHE_DIR / 'git-object-sha256-cache.json'
        try:
            self.infos = json.loads(self.cache_path.read_text())
        except (OSError, ValueError):
            self.infos = {}
        atexit.register(lambda: self.cache_path.write_text(json.dumps(self.infos, separators=(',', ':'))))
    def read(self, specification, retain=True):
        self.process.stdin.write((specification + '\n').encode())
        self.process.stdin.flush()
        header = self.process.stdout.readline().decode().strip()
        if header.endswith(' missing'):
            return None
        oid, kind, length = header.split()
        check(kind == 'blob', 'Expected a Git blob')
        h = hashlib.sha256(); blocks = []; remaining = int(length)
        while remaining:
            block = self.process.stdout.read(min(1024 * 1024, remaining))
            check(block, 'Truncated Git blob')
            remaining -= len(block); h.update(block)
            if retain: blocks.append(block)
        check(self.process.stdout.read(1) == b'\n', 'Malformed Git batch framing')
        self.infos[oid] = {'sha256': h.hexdigest(), 'bytes': int(length)}
        return b''.join(blocks) if retain else self.infos[oid]
    def info(self, oid):
        return self.infos.get(oid) or self.read(oid, False)

blobs = GitBlobs()

def git(*args, optional=False):
    p = subprocess.run(['git', *args], cwd=R, stdout=subprocess.PIPE, stderr=subprocess.DEVNULL)
    if optional and p.returncode:
        return None
    check(p.returncode == 0, 'Git operation failed: ' + args[0])
    return p.stdout

def jsontext(value):
    return json.dumps(value, ensure_ascii=False, indent=2) + '\n'

def jsonlines(rows):
    return ''.join(json.dumps(row, ensure_ascii=False, separators=(',', ':')) + '\n' for row in rows)

def sequence_delta(before, after):
    """Exact ordered edits; all unchanged rows stay in the sealed v2 data."""
    serialize = lambda row: json.dumps(row, ensure_ascii=False, separators=(',', ':'))
    matcher = difflib.SequenceMatcher(None, [serialize(row) for row in before], [serialize(row) for row in after], autojunk=False)
    edits = [{'start': i, 'delete': j - i, 'insert': after[k:l]}
             for tag, i, j, k, l in matcher.get_opcodes() if tag != 'equal']
    delta = {'baseRows': len(before), 'effectiveRows': len(after), 'edits': edits}
    check(apply_sequence_delta(before, delta) == after, 'Ordered successor delta does not reconstruct the measured rows')
    return delta

def apply_sequence_delta(before, delta):
    check(len(before) == delta['baseRows'], 'Successor base row count differs')
    result, cursor = [], 0
    for edit in delta['edits']:
        start, deleted = edit['start'], edit['delete']
        check(isinstance(start, int) and isinstance(deleted, int) and cursor <= start <= len(before)
              and 0 <= deleted <= len(before) - start, 'Invalid or overlapping successor edit')
        result.extend(before[cursor:start]); result.extend(edit['insert']); cursor = start + deleted
    result.extend(before[cursor:])
    check(len(result) == delta['effectiveRows'], 'Successor effective row count differs')
    return result

def pointer(parts):
    return ''.join('/' + str(x).replace('~', '~0').replace('/', '~1') for x in parts)

def document(raw, path):
    if path.endswith('.jsonl'):
        return [json.loads(x) if x.strip() else None for x in raw.splitlines()]
    return json.loads(raw)

def leaves(value, parts=(), ancestors=()):
    if isinstance(value, dict):
        for key, child in value.items():
            yield from leaves(child, (*parts, key), (*ancestors, value))
    elif isinstance(value, list):
        for index, child in enumerate(value):
            yield from leaves(child, (*parts, index), (*ancestors, value))
    elif isinstance(value, str) and HEX.fullmatch(value):
        yield parts, HEX.fullmatch(value).group(1).lower(), ancestors

check(not (a.anchor and a.refresh), 'An anchored verification cannot refresh manifests')
anchor = git('rev-parse', '--verify', (a.anchor or 'HEAD') + '^{commit}').decode().strip()
base = POLICY['baselineCommit']
predecessor = POLICY['previousSnapshot']
git('merge-base', '--is-ancestor', base, predecessor['commit'])
git('merge-base', '--is-ancestor', predecessor['commit'], anchor)
previous_manifests = []
for snapshot in [predecessor, POLICY['sealedSnapshot']]:
    git('merge-base', '--is-ancestor', snapshot['commit'], anchor)
    for old, new in snapshot['outputs'].items():
        path = D + '/inventory/' + old
        committed = blobs.read(snapshot['commit'] + ':' + path, False)
        check(committed and raw_file_info(R / path) == committed, 'Immutable earlier inventory changed: ' + path)
        previous_manifests.append({'path': path, **committed, 'lifecycle': 'earlier_state', 'preservedAt': snapshot['commit'],
            'preservationEpoch': snapshot['epoch'], 'successorPath': D + '/inventory/' + new, 'currentApprovalClaim': False})
commits = git('rev-list', '--first-parent', base + '..' + anchor).decode().splitlines()
scope = set()
historical_versions = collections.defaultdict(list)
nonmerge_commits = []
for commit in commits:
    if len(git('rev-list', '--parents', '-n', '1', commit).split()) == 2:
        nonmerge_commits.append(commit)
        scope.update(git('diff-tree', '--no-commit-id', '--name-only', '-r', commit).decode().splitlines())
        parent = git('rev-parse', commit + '^').decode().strip()
        raw = git('diff-tree', '--no-commit-id', '--raw', '-r', '-z', commit).split(b'\0')
        for index in range(0, len(raw) - 1, 2):
            header, path = raw[index].decode(), raw[index + 1].decode()
            _old_mode, _new_mode, old_oid, new_oid, _status = header.split()
            for revision, oid in [(parent, old_oid), (commit, new_oid)]:
                if oid.strip('0') and (revision, oid) not in historical_versions[path]:
                    historical_versions[path].append((revision, oid))
if not a.anchor:
    scope.update(git('diff', '--name-only', 'HEAD').decode().splitlines())
    scope.update(git('ls-files', '--others', '--exclude-standard').decode().splitlines())
bootstrap = {D + '/inventory/' + name for name in POLICY['bootstrapNames']}
scope -= bootstrap
# Ignored generated book/PDF files are retained physical evidence, not Git records.
git_tracked = set(git('ls-files').decode().splitlines())
retained = []
for p in sorted((R / D).rglob('*')):
    if p.is_file() and p.relative_to(R).as_posix() not in scope | bootstrap | git_tracked:
        # Bytecode is retained and explicitly classified below, never silently omitted.
        retained.append(('repo', p.relative_to(R).as_posix()))
external_rules = {**POLICY['externalRoots'], **{k: v for k, v in POLICY.get('optionalExternalRoots', {}).items() if k in roots}}
for alias, rule in external_rules.items():
    check(alias in roots, 'Required preserved external root: ' + alias)
    check(roots[alias].is_dir(), 'Missing preserved external root: ' + alias)
    selected = set()
    for pattern in rule['include']:
        selected.update(p for p in roots[alias].glob(pattern) if p.is_file())
    retained.extend((alias, p.relative_to(roots[alias]).as_posix()) for p in sorted(selected))

physical = {}
suffix_index = collections.defaultdict(list)
relative_index = collections.defaultdict(list)
missing_locations = set()
raw_index = collections.defaultdict(list)
file_cache = {}

def add_info(info):
    key = (info['root'], info['path'])
    if key not in physical:
        relative_index[info['path']].append(info)
        parts = PurePosixPath(info['path']).parts
        for start in range(len(parts)):
            suffix_index['/'.join(parts[start:])].append(info)
    physical[key] = info
    if info not in raw_index[info['sha256']]: raw_index[info['sha256']].append(info)
    return info

def file_info(root, path):
    key = (root, path)
    if key in missing_locations: return None
    if key not in physical:
        p = (roots[root] / path).resolve()
        if not p.is_relative_to(roots[root]) or not p.is_file():
            missing_locations.add(key)
            return None
        return add_info({'root': root, 'path': path, **raw_file_info(p)})
    return physical[key]

for root, path in [('repo', p) for p in sorted(scope) if (R / p).is_file()] + retained:
    file_info(root, path)

# Exact compressed prior registers are explicit origins for their original raw
# UTF-8 bytes. The compressed container and decoded payload remain distinct.
decoded_index = collections.defaultdict(list)
for (root, path), info in list(physical.items()):
    if path.endswith(('.json.gz', '.jsonl.gz')):
        with gzip.open(roots[root] / path, 'rb') as stream:
            h = hashlib.sha256(); count = 0
            for block in iter(lambda: stream.read(1024 * 1024), b''):
                h.update(block); count += len(block)
        decoded_index[h.hexdigest()].append({'kind': 'gzip_decoded_raw', **info,
            'containerSha256': info['sha256'], 'sha256': h.hexdigest(), 'bytes': count,
            'containerBytes': info['bytes'], 'locationClaim': 'exact decoded prior bytes; no original operational path is inferred'})

@lru_cache(maxsize=8192)
def candidates(record, text):
    if text in POLICY['semanticPathLabels']:
        return []
    for prefix in POLICY.get('logicalRepositoryPrefixes', []):
        if text.startswith(prefix):
            info = file_info('repo', text[len(prefix):])
            return [info] if info else []
    path = PurePosixPath(text)
    public_url = file_info('repo', 'app/public' + text) if text.startswith('/assets/') else None
    # Absolute historical literals are resolved through retained aliases by suffix,
    # and are never copied into this dossier's operational locations.
    result = [public_url] if public_url else []
    if not path.is_absolute():
        parent = PurePosixPath(record).parent
        while True:
            q = str(parent / path)
            info = file_info('repo', q)
            if info and info not in result:
                result.append(info)
            if str(parent) == '.':
                break
            parent = parent.parent
    for info in suffix_index.get(text.lstrip('/'), []):
        if info not in result: result.append(info)
    if path.is_absolute():
        parts = path.parts[1:]
        for start in range(len(parts)):
            for info in relative_index.get('/'.join(parts[start:]), []):
                if info not in result: result.append(info)
    return result

def stable_json_hash(raw, path):
    # This is only a candidate detector; --native uses stableGoalBookJson itself.
    try:
        value = document(raw, path)
        return sha((json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(',', ':'))).encode())
    except (ValueError, UnicodeDecodeError):
        return None

native_hash_cache = {}
def native_file_hash(info):
    key = info['sha256']
    if key not in native_hash_cache:
        native_hash_cache[key] = stable_json_hash((roots[info['root']] / info['path']).read_bytes(), info['path'])
    return native_hash_cache[key]

historical_cache = {}
def historical(path, expected):
    key = (path, expected)
    if key in historical_cache:
        return historical_cache[key]
    versions = historical_versions.get(path, [])
    for commit, oid in reversed(versions):
        info = blobs.info(oid)
        if info['sha256'] == expected:
            out = {'kind': 'historical_git_raw', 'commit': commit, 'path': path, 'gitObjectId': oid, **info}
            historical_cache[key] = out
            return out
    for revision in [base, *POLICY.get('preservedGitCommits', [])]:
        info = blobs.read(revision + ':' + path, False)
        if info and info['sha256'] == expected:
            out = {'kind': 'historical_git_raw', 'commit': revision, 'path': path, **info}
            historical_cache[key] = out
            return out
    historical_cache[key] = None
    return None

def preserved_native(declared_path, expected):
    for hint in POLICY.get('nativeValueOrigins', []):
        if hint['declaredPath'] != declared_path:
            continue
        if 'commit' in hint:
            raw = git('show', hint['commit'] + ':' + hint['path'])
            if stable_json_hash(raw, hint['path']) == expected:
                return {'kind': 'historical_native_parsed_json', 'commit': hint['commit'], 'path': hint['path'], 'sha256': sha(raw), 'bytes': len(raw), 'valueSha256': expected}
        else:
            loc = hint['location']
            info = file_info(loc['root'], loc['path'])
            if info and hint.get('encoding') == 'gzip-json':
                raw = gzip.decompress((roots[loc['root']] / loc['path']).read_bytes())
                if stable_json_hash(raw, loc['path'].removesuffix('.gz')) == expected:
                    return {'kind': 'gzip_native_parsed_json', **info, 'decodedSha256': sha(raw), 'valueSha256': expected, 'locationClaim': 'exact preserved compressed source body; original operational location is not asserted'}
            elif info and native_file_hash(info) == expected:
                return {'kind': 'native_parsed_json', **info, 'valueSha256': expected, 'locationClaim': 'exact preserved source body; original operational location is not asserted'}
    return None

def fingerprinted_native(locations, field, expected):
    if field not in {'resolutionFingerprint', 'manifestFingerprint'}:
        return None
    for info in locations:
        if not info['path'].endswith('.json'):
            continue
        value = json.loads((roots[info['root']] / info['path']).read_bytes())
        if not isinstance(value, dict) or value.get(field, '').removeprefix('sha256:') != expected:
            continue
        payload = {k: v for k, v in value.items() if k != field}
        encoded = json.dumps(payload, ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode()
        if sha(encoded) == expected:
            return {'kind': 'native_fingerprinted_json', **info, 'fingerprintField': field, 'valueSha256': expected}
    return None

records = []
bindings = []
digests = []
digest_by_key = {}
problems = []
documents = {}
semantic_fields = {'sourceFingerprint', 'goalFingerprint', 'pageFingerprint', 'profileFingerprint', 'reviewInputFingerprint', 'reviewCriteriaFingerprint', 'projectionFingerprint', 'baseProjectionFingerprint', 'originalDigest', 'taskRevision', 'rubricRevision', 'currentRowSha256', 'normalizedSha256', 'beforeOrderedReferencePlacesSha256', 'afterOrderedReferencePlacesSha256', 'priorGoalDigest', 'currentGoalDigest', 'currentSemanticSourceFingerprint', 'contractFingerprint', 'nativeSourceFingerprint', 'arrowContractFingerprint', 'goalBeforeFingerprint', 'goalAfterFingerprint'}
for path in sorted(scope):
    relative = path.removeprefix(D + '/')
    rec = {'path': path, 'present': (R / path).is_file(), 'lifecycle': 'current'}
    rule = POLICY['earlierRecords'].get(relative)
    if rule is None:
        for prefix, prefix_rule in POLICY.get('earlierPrefixes', {}).items():
            if relative.startswith(prefix):
                successor = prefix_rule['successorPrefix'] + relative.removeprefix(prefix)
                if not (R / D / successor).is_file():
                    successor = prefix_rule.get('fallbackSuccessor', prefix_rule['successorPrefix'] + 'batch-manifest.json')
                rule = {'successor': successor, 'epoch': prefix_rule['epoch']}
                break
    mixed = POLICY.get('mixedRoleRecords', {}).get(relative)
    if mixed:
        check((R / D / mixed['successor']).is_file(), 'Missing concrete mixed-role successor')
        rec.update(lifecycle='current_support_with_historical_use', preservationEpoch=mixed['epoch'], successorPath=D + '/' + mixed['successor'], currentApprovalClaim=False)
    if '__pycache__' in PurePosixPath(path).parts or path.endswith('.pyc'):
        rec.update(lifecycle='transient_local_derivative', currentApprovalClaim=False)
    if rule:
        successor = D + '/' + rule['successor']
        check((R / successor).is_file(), 'Missing actual lifecycle successor: ' + successor)
        rec.update(lifecycle='earlier_state', preservationEpoch=rule['epoch'], successorPath=successor, currentApprovalClaim=False)
    if relative in POLICY['retiredRepositoryOriginals']:
        archived = POLICY['retiredRepositoryOriginals'][relative]
        original = file_info(archived['root'], archived['path'])
        original_blob = blobs.read(predecessor['commit'] + ':' + path, False)
        check(not rec['present'] and original and original_blob and original_blob == {k: original[k] for k in ('bytes', 'sha256')},
              'Retired original must match the prior Git blob at its exact retained location: ' + path)
        rec.update(priorGitCommit=predecessor['commit'], priorRawOrigin=original)
    if rec['present']:
        info = file_info('repo', path)
        rec.update(sha256=info['sha256'], bytes=info['bytes'])
    records.append(rec)
    if not rec['present'] or not path.endswith(('.json', '.jsonl')):
        continue
    value = document((R / path).read_bytes(), path)
    # Parse and release one potentially large JSON record at a time.
    for parts, digest, ancestors in leaves(value):
        ptr = pointer(parts)
        field = str(parts[-1])
        row = {'record': path, 'pointer': ptr, 'sha256': digest}
        parent = ancestors[-1]
        declared = None
        if isinstance(parent, dict):
            if field in {'sha256', 'digest', 'rawSha256', 'sha', 'hash', 'assetSha256'}:
                for k in ['path', 'file', 'externalArtifact', 'externalPath', 'canonicalPath', 'canonicalAssetPath', 'assetPath', 'publicAssetPath', 'sourcePath']:
                    if isinstance(parent.get(k), str):
                        declared = parent[k]
                        break
            if declared is None and field.endswith(('.json', '.jsonl', '.md', '.jpg', '.jpeg', '.png', '.webp', '.svg', '.pdf', '.html', '.py', '.ts', '.mts', '.mjs', '.cjs', '.js', '.txt', '.gz', '.sh', '.yaml', '.yml', '.zip', '.csv', '.tsv', '.log', '.xml', '.sha256')):
                declared = field
            if declared is None:
                special_paths = {
                    'priorRawSha256': ['priorLedgerPath'],
                    'currentRawSha256': ['ledgerPath'],
                    'beforeSha256': ['path'],
                    'afterSha256': ['path'],
                    'externalOriginalSha256': ['path'],
                    'retainedSha256': ['path'],
                }
                for name in special_paths.get(field, []):
                    if isinstance(parent.get(name), str):
                        declared = parent[name]
                        break
            if declared is None:
                for suffix in ['RawSha256', 'Sha256', 'RawDigest', 'Digest', 'Fingerprint']:
                    if field.endswith(suffix):
                        prefix = field[:-len(suffix)]
                        names = [prefix + 'Path', prefix + 'File', prefix]
                        if prefix == 'candidate':
                            names.append('inputFile')
                        for name in names:
                            if isinstance(parent.get(name), str):
                                declared = parent[name]
                                break
                    if declared:
                        break
        if isinstance(parent, dict) and 'externalRoot' in parent and field == 'sha256' and isinstance(parent.get('path'), str):
            alias = parent['externalRoot']
            check(alias in roots, 'Unknown explicitly declared external root: ' + str(alias))
            origin = file_info(alias, parent['path'])
            check(origin and origin['sha256'] == digest, 'Exact designated external path mismatch: @' + alias + '/' + parent['path'])
            row.update(contract='raw_path_binding')
            bindings.append({**row, 'declaredPath': '@' + alias + '/' + parent['path'], 'origin': {'kind': 'retained_raw', **origin}})
        elif declared in POLICY['semanticPathLabels']:
            row.update(contract='native_scoped_value', nativeField=field, pathLabel=declared)
        elif declared and field not in semantic_fields:
            locations = candidates(path, declared)
            matches = [v for v in locations if v['sha256'] == digest]
            if matches:
                row.update(contract='raw_path_binding')
                bindings.append({**row, 'declaredPath': declared, 'origin': {'kind': 'current_raw' if matches[0]['root'] == 'repo' and matches[0]['path'] in git_tracked else 'retained_raw', **matches[0]}})
            else:
                native = [v for v in locations if v['path'].endswith(('.json', '.jsonl')) and native_file_hash(v) == digest]
                model = [v for v in locations if v['path'].endswith('/book-model.json') and json.loads((roots[v['root']] / v['path']).read_bytes()).get('digest', '').removeprefix('sha256:') == digest]
                native_prior = preserved_native(declared, digest) if not native and not model else None
                native_fingerprint = fingerprinted_native(locations, field, digest) if not native and not model and not native_prior else None
                old = next((found for v in locations if v['root'] == 'repo' and (found := historical(v['path'], digest))), None)
                if native:
                    row.update(contract='native_parsed_json_path_binding')
                    bindings.append({**row, 'declaredPath': declared, 'origin': {'kind': 'native_parsed_json', **native[0], 'valueSha256': digest}})
                elif model:
                    row.update(contract='native_book_model_path_binding')
                    bindings.append({**row, 'declaredPath': declared, 'origin': {'kind': 'native_book_model', **model[0], 'valueSha256': digest}})
                elif native_prior:
                    row.update(contract='preserved_native_json_path_binding')
                    bindings.append({**row, 'declaredPath': declared, 'origin': native_prior})
                elif native_fingerprint:
                    row.update(contract='native_fingerprinted_json_path_binding')
                    bindings.append({**row, 'declaredPath': declared, 'origin': native_fingerprint})
                elif old:
                    row.update(contract='historical_raw_path_binding')
                    bindings.append({**row, 'declaredPath': declared, 'origin': old})
                else:
                    # Report a missing typed origin without calling a value digest a
                    # raw mismatch. Each row must be resolved before refresh seals.
                    row.update(contract='unresolved_declared_path', declaredPath=declared)
                    problems.append({**row, 'availableCandidateCount': len(locations)})
        else:
            asset_copies = parent.get('assetCopies', []) if isinstance(parent, dict) and field == 'assetSha256' else []
            exact_raw = raw_index.get(digest, []) if field not in semantic_fields else []
            if asset_copies:
                row.update(contract='raw_path_binding')
                for copy in asset_copies:
                    matched = [v for v in candidates(path, copy) if v['sha256'] == digest]
                    check(matched, 'Asset copy raw binding does not reproduce: ' + copy)
                    bindings.append({**row, 'declaredPath': copy, 'origin': {'kind': 'current_raw', **matched[0]}})
            elif exact_raw:
                row.update(contract='raw_content_digest')
                bindings.append({**row, 'origin': {'kind': 'retained_raw' if exact_raw[0]['root'] != 'repo' else 'current_raw', **exact_raw[0]}, 'locationClaim': 'exact content match; no original operational path is inferred'})
            else:
                # Known scoped fingerprints retain their native role. Other
                # literals are recorded honestly without inventing a raw-path
                # assertion or an unimplemented native verification contract.
                if field in semantic_fields or field.endswith('Fingerprint'):
                    row.update(contract='native_scoped_value', nativeField=field)
                else:
                    row.update(contract='recorded_value_digest', recordedField=field, currentRawReproductionClaim=False)
        digests.append(row)
        digest_by_key[(path, ptr)] = row

# An exact recovered working-state raw file is a real historical origin even if
# the original operational path no longer exists. It never substitutes a path.
for problem in problems[:]:
    matches = raw_index.get(problem['sha256'], [])
    decoded = decoded_index.get(problem['sha256'], [])
    if matches or decoded:
        problem_key = (problem['record'], problem['pointer'])
        row = digest_by_key[problem_key]
        row['contract'] = 'recovered_raw_path_binding'
        row.pop('declaredPath', None)
        bindings.append({**row, 'declaredPath': problem['declaredPath'], 'origin': {'kind': 'recovered_raw', **matches[0]} if matches else decoded[0], 'locationClaim': 'exact bytes recovered; original operational location is not asserted'})
        problems.remove(problem)

# Literals already present unchanged at the Task A2 baseline remain retained
# pre-A2 evidence. No new reproduction or new binding to unavailable old media
# is manufactured merely because N updated another part of the same document.
baseline_documents = {}
for problem in problems[:]:
    path, ptr = problem['record'], problem['pointer']
    if path not in baseline_documents:
        raw = blobs.read(base + ':' + path)
        try:
            baseline_documents[path] = document(raw, path) if raw is not None else None
        except (ValueError, UnicodeDecodeError):
            baseline_documents[path] = None
    if baseline_documents[path] is None: continue
    try:
        value = baseline_documents[path]
        for part in ptr.split('/')[1:]:
            key = part.replace('~1', '/').replace('~0', '~')
            value = value[int(key)] if isinstance(value, list) else value[key]
        same = isinstance(value, str) and HEX.fullmatch(value) and HEX.fullmatch(value).group(1).lower() == problem['sha256']
    except (ValueError, KeyError, IndexError, TypeError):
        same = False
    if same:
        row = digest_by_key[(path, ptr)]
        row.update(contract='unchanged_pre_a2_literal', baselineCommit=base, currentRawReproductionClaim=False)
        problems.remove(problem)

for problem in problems[:]:
    key = problem['record'].removeprefix(D + '/') + '#' + problem['pointer']
    exception = POLICY.get('historicalUnavailable', {}).get(key)
    if not exception:
        continue
    check(exception['sha256'] == problem['sha256'], 'Historical unavailable exception does not match its exact digest')
    successor = D + '/' + exception['successor']
    check((R / successor).is_file(), 'Missing historical-unavailable successor')
    for row in digests:
        if row['record'] == problem['record'] and row['pointer'] == problem['pointer']:
            row.update(contract='historical_unavailable_raw', rawShaWasReproduced=False, currentApprovalClaim=False, successorPath=successor, preservationEpoch=exception['epoch'])
            break
    problems.remove(problem)

# Referenced ignored repository artifacts outside the dossier (for example the
# generated backend image copy) remain explicit retained origins as well.
for binding in bindings:
    origin = binding['origin']
    if origin.get('root') == 'repo' and origin['path'] not in git_tracked | scope | bootstrap:
        retained.append(('repo', origin['path']))

def portable_declared(row):
    value = row.get('declaredPath')
    if not isinstance(value, str) or not PurePosixPath(value).is_absolute():
        return row
    literal = Path(value)
    for alias, root in sorted(roots.items(), key=lambda item: len(str(item[1])), reverse=True):
        if literal.is_relative_to(root):
            return {**row, 'declaredPath': '@' + alias + '/' + literal.relative_to(root).as_posix(), 'recordedPathKind': 'absolute literal in the immutable source, normalized to the supplied root alias'}
    return {**row, 'declaredPath': '@source-record' + row['pointer'], 'recordedPathKind': 'absolute historical literal retained only in the immutable source; origin location is separate'}

bindings = [portable_declared(row) for row in bindings]


raw_voices = []
for pair in POLICY.get('rawVoiceBindings', []):
    source = pair['source']
    original = file_info(source['root'], source['path'])
    retained_root = pair.get('retainedRoot', 'repo')
    retained_voice = file_info(retained_root, pair['retainedPath'])
    check(original and retained_voice and original['sha256'] == retained_voice['sha256'] and original['bytes'] == retained_voice['bytes'],
          'An unchanged raw voice no longer equals its retained original: ' + pair['retainedPath'])
    raw_voices.append({'source': original, 'retainedPath': pair['retainedPath'], 'retainedSha256': retained_voice['sha256'],
                       'retainedRoot': retained_root, **({'publicSuccessorPath': pair['publicSuccessorPath']} if 'publicSuccessorPath' in pair else {}),
                       'byteIdentical': True, 'role': pair['role'], 'scientificDecisionReinterpreted': False})

operational_literals = []
def portable_literal(value, record, ptr):
    literal = Path(value)
    for alias, root in sorted(roots.items(), key=lambda item: len(str(item[1])), reverse=True):
        if literal.is_relative_to(root): return '@' + alias + '/' + literal.relative_to(root).as_posix()
    return '@source-record:' + record + '#' + ptr

def literal_leaves(value, parts=()):
    if isinstance(value, dict):
        for key, child in value.items(): yield from literal_leaves(child, (*parts, key))
    elif isinstance(value, list):
        for index, child in enumerate(value): yield from literal_leaves(child, (*parts, index))
    elif isinstance(value, str) and value.startswith(('/home/', '/tmp/')):
        yield pointer(parts), value

for path in sorted(scope):
    if not (R / path).is_file() or not path.endswith(('.json', '.jsonl', '.md')): continue
    raw = (R / path).read_bytes()
    if b'/home/' not in raw and b'/tmp/' not in raw: continue
    info = file_info('repo', path)
    sealed = historical(path, info['sha256'])
    if path.endswith(('.json', '.jsonl')):
        found = literal_leaves(document(raw, path))
    else:
        found = [('line:' + str(number), match.group()) for number, line in enumerate(raw.decode('utf8').splitlines(), 1)
                 for match in re.finditer(r'/(?:home|tmp)/[^\s<>`]+', line)]
    for ptr, literal in found:
        operational_literals.append({'record': path, 'pointer': ptr, 'recordRawSha256': info['sha256'],
            'literalUtf8Sha256': sha(literal.encode()), 'portableReference': portable_literal(literal, path, ptr),
            'lifecycle': 'retained_historical_operational_literal' if sealed else 'current_operational_literal',
            'historicalOrigin': sealed, 'originalLiteralRewritten': False, 'newAbsoluteLiteralPublished': False})

manifest = {
    'schemaVersion': 3, 'contract': 'physics-directed-quantity-arrow-record-lifecycle-v3',
    'earlierInventoryManifests': previous_manifests,
    'baselineCommit': base,
    'domainContract': 'Finite first-parent nonmerge path union; optional current worktree additions before anchoring. The invocation supplies the final anchor, avoiding a self-referential commit digest.',
    'scope': 'Union of non-merge first-parent Task A2 changed files after baseline; plus uncommitted/untracked additions unless --anchor supplied. Ignored and external preserved evidence is listed separately.',
    'bootstrapPaths': sorted(bootstrap),
    'records': records,
    'rawVoiceIntegrity': raw_voices,
    'operationalLiteralOrigins': operational_literals,
    'retainedOffTree': [{**physical[key], 'lifecycle': 'transient_local_derivative' if '__pycache__' in PurePosixPath(key[1]).parts or key[1].endswith('.pyc') else 'retained_off_tree', 'currentApprovalClaim': False} for key in sorted(set(retained))],
    'counts': {'records': len(records), 'current': sum(x['lifecycle'] == 'current' for x in records), 'earlierState': sum(x['lifecycle'] == 'earlier_state' for x in records), 'retainedOffTree': len(set(retained)), 'pathBindings': len(bindings), 'digestLeaves': len(digests), 'unresolvedDeclaredPaths': len(problems), 'unchangedRawVoices': len(raw_voices), 'operationalLiterals': len(operational_literals)},
    'boundaries': POLICY['boundaries'],
}
if problems:
    print(jsontext({'status': 'UNSEALED', 'counts': manifest['counts'], 'unresolved': [portable_declared(row) for row in problems]}))
    raise SystemExit(1)
# A refresh is a snapshot, not permission to seal a mixture of concurrent file
# versions. The coordinator can rerun after other evidence writers finish.
check(a.anchor or git('rev-parse', 'HEAD').decode().strip() == anchor, 'Git HEAD changed during the development snapshot; refresh after writers finish')
if a.anchor:
    for record in records:
        committed = blobs.read(anchor + ':' + record['path'], False)
        check((committed is not None) == record['present'] and (not committed or committed['sha256'] == record.get('sha256')),
              'Anchored record differs from the selected commit: ' + record['path'])
    # Check the exact selected tree for every in-repository Git-backed binding,
    # including unchanged imports outside the delivery's changed-file domain.
    checked = {record['path'] for record in records}
    git_paths = {p.decode() for p in git('ls-tree', '-r', '-z', '--name-only', anchor).split(b'\0') if p}
    for binding in bindings:
        origin = binding['origin']
        path = origin.get('path')
        if origin.get('root') != 'repo' or path in checked or path not in git_paths:
            continue
        expected = file_info('repo', path)
        committed = blobs.read(anchor + ':' + path, False)
        check(expected and committed and committed == {k: expected[k] for k in ('sha256', 'bytes')},
              'Referenced repository bytes differ from the selected commit: ' + path)
        checked.add(path)
for (root, path), info in physical.items():
    current = roots[root] / path
    check(current.is_file() and raw_file_info(current)['sha256'] == info['sha256'], 'Input changed during inventory; rerun after writers finish: @' + root + '/' + path)
sealed = POLICY['sealedSnapshot']
base_name = 'record-lifecycle.v2.actual.json'
base_manifest = json.loads((HERE / base_name).read_bytes())
collections_reused = ('earlierInventoryManifests', 'bootstrapPaths', 'records', 'rawVoiceIntegrity', 'operationalLiteralOrigins', 'retainedOffTree', 'boundaries')
successor = {key: value for key, value in manifest.items() if key not in collections_reused}
successor['storageContract'] = 'sealed-v2-exact-ordered-deltas-v1'
successor['manifestFieldOrder'] = list(manifest)
successor['baseManifest'] = {'path': base_name, **raw_file_info(HERE / base_name), 'preservedAt': sealed['commit']}
successor['collections'] = {key: sequence_delta(base_manifest[key], manifest[key]) for key in collections_reused}
successor['effectiveManifestSha256'] = sha(jsontext(manifest).encode('utf-8'))
successor['tables'] = {}
for key, name, rows in [('pathBindings', 'path-bindings.v2.actual.jsonl', bindings), ('digestContracts', 'digest-contracts.v2.actual.jsonl', digests)]:
    prior_rows = document((HERE / name).read_bytes(), name)
    successor['tables'][key] = {'basePath': name, **raw_file_info(HERE / name), 'preservedAt': sealed['commit'],
                              **sequence_delta(prior_rows, rows), 'effectiveSha256': sha(jsonlines(rows).encode('utf-8'))}
outputs = {'record-lifecycle.v3.actual.json': jsontext(successor)}
for name, content in outputs.items():
    if a.refresh:
        (HERE / name).write_text(content)
    else:
        check((HERE / name).is_file() and (HERE / name).read_bytes() == content.encode('utf-8'), 'Inventory drift: ' + name + '; inspect changes and run --refresh')
CACHE_FILE.write_text(json.dumps(file_hash_cache, separators=(',', ':')))
if a.anchor:
    for path in sorted(bootstrap):
        check(git('show', anchor + ':' + path, optional=True) == (R / path).read_bytes(), 'Bootstrap differs from anchor: ' + path)
if a.native:
    subprocess.run([str(R / 'app/node_modules/.bin/tsx'), str(HERE / 'verify-native-values.mts'), str(R), str(HERE), json.dumps({key: str(value) for key, value in roots.items()})], cwd=R, check=True)
# The checkout and its selected Git tree are independent evidence. A later
# inventory commit is verified by rerunning this scan at its exact object.
scan = subprocess.run([sys.executable, '-B', str(R / D / 'portable/scan-workspace-paths.py'),
    '--repo', str(R), '--anchor', anchor], cwd=R, stdout=subprocess.PIPE, check=False)
check(scan.returncode in (0, 2, 3), 'Whole-tree workspace scanner did not complete')
scan_result = json.loads(scan.stdout)
check(scan_result.get('tree') == git('rev-parse', anchor + '^{tree}').decode().strip()
      and scan_result.get('baselineTree') == git('rev-parse', base + '^{tree}').decode().strip(),
      'Workspace scan reported a different target or baseline tree')
hits, changes = scan_result['currentWholeTreeHitCount'], scan_result['newOrChangedHitCount']
check(0 <= changes <= hits and scan.returncode == (3 if changes else 2 if hits else 0),
      'Workspace scan counts and exit status disagree')
check(not changes, 'Whole-tree workspace scan found ' + str(changes) + ' new or changed paths (' + str(hits) + ' in the selected tree)')
print(json.dumps({'status': 'PASS', 'inventoryStatus': 'PASS', 'workspaceScanExitCode': scan.returncode,
    'workspaceTreeGloballyClean': scan.returncode == 0, 'workspaceScan': scan_result, **manifest['counts'], 'nativeRequested': a.native, 'domainMode': 'anchored_commit' if a.anchor else 'current_worktree_development_snapshot', 'scientificOrHumanApprovalGranted': False}))
