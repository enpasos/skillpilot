#!/usr/bin/env python3
"""Reproduce Task N's finite file, path-binding and digest-contract inventory.

The default verifies; --refresh replaces only the three generated inventories.
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

HERE = Path(__file__).resolve().parent
POLICY = json.loads((HERE / 'lifecycle-policy.json').read_text())
HEX = re.compile(r'^(?:sha256:)?([a-fA-F0-9]{64})$')
ap = argparse.ArgumentParser(description=__doc__)
ap.add_argument('--repo', type=Path, required=True)
ap.add_argument('--external-root', action='append', default=[], metavar='ALIAS=DIRECTORY')
ap.add_argument('--anchor', help='finite implementation commit; omits later worktree changes')
ap.add_argument('--refresh', action='store_true')
ap.add_argument('--native', action='store_true', help='also run native book/profile integrity functions')
a = ap.parse_args()
R = a.repo.resolve()
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

def git(*args, optional=False):
    p = subprocess.run(['git', *args], cwd=R, stdout=subprocess.PIPE, stderr=subprocess.DEVNULL)
    if optional and p.returncode:
        return None
    check(p.returncode == 0, 'Git operation failed: ' + args[0])
    return p.stdout

def jsontext(value):
    return json.dumps(value, ensure_ascii=False, indent=2) + '\n'

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

anchor = a.anchor or git('rev-parse', 'HEAD').decode().strip()
base = POLICY['baselineCommit']
commits = git('rev-list', '--first-parent', base + '..' + anchor).decode().splitlines()
scope = set()
for commit in commits:
    if len(git('rev-list', '--parents', '-n', '1', commit).split()) == 2:
        scope.update(git('diff-tree', '--no-commit-id', '--name-only', '-r', commit).decode().splitlines())
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
        check('__pycache__' not in p.parts, 'Remove Python bytecode from the finite dossier')
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
raw_index = collections.defaultdict(list)
for root, path in [('repo', p) for p in sorted(scope) if (R / p).is_file()] + retained:
    raw = (roots[root] / path).read_bytes()
    info = {'root': root, 'path': path, 'sha256': sha(raw), 'bytes': len(raw)}
    physical[(root, path)] = info
    raw_index[info['sha256']].append(info)

cache = {}
def file_info(root, path):
    key = (root, path)
    if key not in physical:
        p = (roots[root] / path).resolve()
        if not p.is_relative_to(roots[root]) or not p.is_file():
            return None
        raw = p.read_bytes()
        physical[key] = {'root': root, 'path': path, 'sha256': sha(raw), 'bytes': len(raw)}
    return physical[key]

def candidates(record, text):
    if text in POLICY['semanticPathLabels']:
        return []
    path = PurePosixPath(text)
    # Absolute historical literals are resolved through retained aliases by suffix,
    # and are never copied into this dossier's operational locations.
    result = []
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
    for (root, q), info in physical.items():
        if q == text or q.endswith('/' + text) or (path.is_absolute() and text.endswith('/' + q)):
            if info not in result:
                result.append(info)
    return result

def stable_json_hash(raw, path):
    # This is only a candidate detector; --native uses stableGoalBookJson itself.
    try:
        value = document(raw, path)
        return sha((json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(',', ':'))).encode())
    except (ValueError, UnicodeDecodeError):
        return None

historical_cache = {}
def historical(path, expected):
    key = (path, expected)
    if key in historical_cache:
        return historical_cache[key]
    for commit in [anchor, *commits, base]:
        raw = git('show', commit + ':' + path, optional=True)
        if raw is not None and sha(raw) == expected:
            out = {'kind': 'historical_git_raw', 'commit': commit, 'path': path, 'sha256': expected, 'bytes': len(raw)}
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
            if info and stable_json_hash((roots[loc['root']] / loc['path']).read_bytes(), loc['path']) == expected:
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
problems = []
documents = {}
semantic_fields = {'sourceFingerprint', 'goalFingerprint', 'pageFingerprint', 'profileFingerprint', 'reviewInputFingerprint', 'reviewCriteriaFingerprint', 'projectionFingerprint', 'baseProjectionFingerprint', 'originalDigest', 'taskRevision', 'rubricRevision', 'currentRowSha256', 'normalizedSha256', 'beforeOrderedReferencePlacesSha256', 'afterOrderedReferencePlacesSha256', 'priorGoalDigest', 'currentGoalDigest', 'currentSemanticSourceFingerprint'}
for path in sorted(scope):
    relative = path.removeprefix(D + '/')
    rec = {'path': path, 'present': (R / path).is_file(), 'lifecycle': 'current'}
    rule = POLICY['earlierRecords'].get(relative)
    if rule is None:
        for prefix, prefix_rule in POLICY.get('earlierPrefixes', {}).items():
            if relative.startswith(prefix):
                successor = prefix_rule['successorPrefix'] + relative.removeprefix(prefix)
                if not (R / D / successor).is_file():
                    successor = prefix_rule['successorPrefix'] + 'batch-manifest.json'
                rule = {'successor': successor, 'epoch': prefix_rule['epoch']}
                break
    if rule:
        successor = D + '/' + rule['successor']
        check((R / successor).is_file(), 'Missing actual lifecycle successor: ' + successor)
        rec.update(lifecycle='earlier_state', preservationEpoch=rule['epoch'], successorPath=successor, currentApprovalClaim=False)
    if rec['present']:
        info = file_info('repo', path)
        rec.update(sha256=info['sha256'], bytes=info['bytes'])
    records.append(rec)
    if not rec['present'] or not path.endswith(('.json', '.jsonl')):
        continue
    value = document((R / path).read_bytes(), path)
    documents[path] = value
    for parts, digest, ancestors in leaves(value):
        ptr = pointer(parts)
        field = str(parts[-1])
        row = {'record': path, 'pointer': ptr, 'sha256': digest}
        parent = ancestors[-1]
        declared = None
        if isinstance(parent, dict):
            if field in {'sha256', 'digest', 'rawSha256'}:
                for k in ['path', 'file', 'externalArtifact', 'canonicalPath']:
                    if isinstance(parent.get(k), str):
                        declared = parent[k]
                        break
            if declared is None and field.endswith(('.json', '.jsonl', '.md', '.jpg', '.png', '.pdf', '.html')):
                declared = field
            if declared is None:
                special_paths = {
                    'priorRawSha256': ['priorLedgerPath'],
                    'currentRawSha256': ['ledgerPath'],
                    'beforeSha256': ['path'],
                    'afterSha256': ['path'],
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
        if declared in POLICY['semanticPathLabels']:
            row.update(contract='native_scoped_value', nativeField=field, pathLabel=declared)
        elif declared and field not in semantic_fields:
            locations = candidates(path, declared)
            matches = [v for v in locations if v['sha256'] == digest]
            if matches:
                row.update(contract='raw_path_binding')
                bindings.append({**row, 'declaredPath': declared, 'origin': {'kind': 'current_raw' if matches[0]['root'] == 'repo' and matches[0]['path'] in git_tracked else 'retained_raw', **matches[0]}})
            else:
                native = [v for v in locations if v['path'].endswith(('.json', '.jsonl')) and stable_json_hash((roots[v['root']] / v['path']).read_bytes(), v['path']) == digest]
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

# An exact recovered working-state raw file is a real historical origin even if
# the original operational path no longer exists. It never substitutes a path.
for problem in problems[:]:
    matches = raw_index.get(problem['sha256'], [])
    if matches:
        problem_key = (problem['record'], problem['pointer'])
        for row in digests:
            if (row['record'], row['pointer']) == problem_key:
                row['contract'] = 'recovered_raw_path_binding'
                row.pop('declaredPath', None)
                bindings.append({**row, 'declaredPath': problem['declaredPath'], 'origin': {'kind': 'recovered_raw', **matches[0]}, 'locationClaim': 'exact bytes recovered; original operational location is not asserted'})
                break
        problems.remove(problem)

# Literals already present unchanged at the Task N baseline remain retained
# pre-N evidence. No new reproduction or new binding to unavailable old media
# is manufactured merely because N updated another part of the same document.
for problem in problems[:]:
    path, ptr = problem['record'], problem['pointer']
    raw = git('show', base + ':' + path, optional=True)
    if raw is None:
        continue
    try:
        value = document(raw, path)
        for part in ptr.split('/')[1:]:
            key = part.replace('~1', '/').replace('~0', '~')
            value = value[int(key)] if isinstance(value, list) else value[key]
        same = isinstance(value, str) and HEX.fullmatch(value) and HEX.fullmatch(value).group(1).lower() == problem['sha256']
    except (ValueError, KeyError, IndexError, TypeError):
        same = False
    if same:
        for row in digests:
            if row['record'] == path and row['pointer'] == ptr:
                row.update(contract='unchanged_pre_n_literal', baselineCommit=base, currentRawReproductionClaim=False)
                break
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

manifest = {
    'schemaVersion': 1, 'contract': 'physics-e2-energy-record-lifecycle-v1',
    'baselineCommit': base,
    'scope': 'Union of non-merge first-parent Task N changed files after baseline; plus uncommitted/untracked additions unless --anchor supplied. Ignored and external preserved evidence is listed separately.',
    'bootstrapPaths': sorted(bootstrap),
    'records': records,
    'retainedOffTree': [{**physical[key], 'lifecycle': 'retained_off_tree', 'currentApprovalClaim': False} for key in sorted(set(retained))],
    'counts': {'records': len(records), 'current': sum(x['lifecycle'] == 'current' for x in records), 'earlierState': sum(x['lifecycle'] == 'earlier_state' for x in records), 'retainedOffTree': len(set(retained)), 'pathBindings': len(bindings), 'digestLeaves': len(digests), 'unresolvedDeclaredPaths': len(problems)},
    'boundaries': POLICY['boundaries'],
}
if problems:
    print(jsontext({'status': 'UNSEALED', 'unresolved': [portable_declared(row) for row in problems]}))
    raise SystemExit(1)
# A refresh is a snapshot, not permission to seal a mixture of concurrent file
# versions. The coordinator can rerun after other evidence writers finish.
for (root, path), info in physical.items():
    current = roots[root] / path
    check(current.is_file() and sha(current.read_bytes()) == info['sha256'], 'Input changed during inventory; rerun after writers finish: @' + root + '/' + path)
outputs = {
    'record-lifecycle.actual.json': jsontext(manifest),
    'path-bindings.actual.jsonl': ''.join(json.dumps(v, ensure_ascii=False, separators=(',', ':')) + '\n' for v in bindings),
    'digest-contracts.actual.jsonl': ''.join(json.dumps(v, ensure_ascii=False, separators=(',', ':')) + '\n' for v in digests),
}
for name, content in outputs.items():
    if a.refresh:
        (HERE / name).write_text(content)
    else:
        check((HERE / name).is_file() and (HERE / name).read_text() == content, 'Inventory drift: ' + name + '; inspect changes and run --refresh')
if a.anchor:
    for path in sorted(bootstrap):
        check(git('show', a.anchor + ':' + path, optional=True) == (R / path).read_bytes(), 'Bootstrap differs from anchor: ' + path)
if a.native:
    subprocess.run([str(R / 'app/node_modules/.bin/tsx'), str(HERE / 'verify-native-values.mts'), str(R), str(HERE)], cwd=R, check=True)
print(json.dumps({'status': 'PASS', **manifest['counts'], 'nativeRequested': a.native, 'scientificOrHumanApprovalGranted': False}))
