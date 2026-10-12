#!/usr/bin/env python3
"""Read-only active dependency audit; writes only this new technical package."""
import collections
import datetime
import hashlib
import json
import pathlib
import re
import subprocess

ROOT = pathlib.Path.cwd()
OUT = pathlib.Path(__file__).resolve().parent
DAY = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12/'
TRACKED = set(subprocess.check_output(['git', 'ls-files', '-z']).decode().split('\0'))
CHANGED = set(subprocess.check_output(['git', 'diff', '--name-only', '-z']).decode().split('\0'))
GOALS = {'014e6d85-eecf-5228-9031-52a39981cd0d', '127e2fc9-23f3-5ce8-a1c9-8c9e014c8a8a', '197bc2c5-835e-59e7-9263-5684e89799cc', '7b477c2b-0919-5d70-810b-188a88c55ffc', '2fdd759f-8349-5f7e-b29a-6ac7fb0299f9'}
PREFIXES = ('curricula/', 'app/', 'docs/', 'contracts/', 'scripts/', 'backend/')
queue = collections.deque()
paths = {}
missing = []
ignored_outputs = []
nonportable = []
executable_metadata = []
edges = []
digest_bindings = []
parsed = set()
bundle_cache = {}

def relative(p):
    try:
        return p.resolve().relative_to(ROOT).as_posix()
    except ValueError:
        return None

def add(p, reason):
    rel = relative(p)
    if rel is None:
        nonportable.append({'path': str(p), 'reason': reason})
        return
    if rel.startswith('app/node_modules/'):
        executable_metadata.append({'path': rel, 'reason': reason})
        return
    if not p.exists():
        missing.append({'path': rel, 'reason': reason})
        return
    if p.is_dir():
        return  # A packagePath is identity metadata, not permission to stage a directory.
    if rel not in paths:
        paths[rel] = {'path': rel, 'bytes': p.stat().st_size, 'tracked': rel in TRACKED, 'changed': rel in CHANGED, 'reasons': []}
        if rel not in TRACKED:
            queue.append(p)
    if reason not in paths[rel]['reasons']:
        paths[rel]['reasons'].append(reason)

def resolve_ref(value, parent, key):
    if value.startswith(('http:', 'https:', 'sha256:', 'data:')):
        return []
    if value.startswith('/assets/goal-visualizations/'):
        tail = value.removeprefix('/assets/goal-visualizations/')
        return [ROOT / ('app/public' + value), ROOT / ('backend/src/main/resources/static' + value), ROOT / ('curricula/DE/Gymnasium/visualizations/' + tail)]
    if value.startswith(str(ROOT) + '/'):
        return [pathlib.Path(value)]
    if parent.name == 'review-bundle-manifest.json' and key == 'path':
        if str(parent) not in bundle_cache:
            fingerprint = json.loads(parent.read_text()).get('bundleFingerprint')
            candidates = []
            for manifest in parent.parent.parent.glob('*/manifest.json'):
                try:
                    if json.loads(manifest.read_text()).get('bundleFingerprint') == fingerprint:
                        candidates.append(manifest.parent)
                except json.JSONDecodeError:
                    pass
            bundle_cache[str(parent)] = candidates
        for bundle in bundle_cache[str(parent)]:
            target = bundle / value
            if target.exists():
                return [target]
    if value.startswith(PREFIXES):
        local = parent.parent / value
        if not (ROOT / value).exists() and local.exists():
            return [local]
        if value.startswith('contracts/') and parent.name == 'review-bundle-manifest.json':
            bundle = parent.parent.parent / 'bundle' / value
            if bundle.exists():
                return [bundle]
        return [ROOT / value]
    if value.startswith('/'):
        if any(x in key.lower() for x in ('path', 'file', 'dir')):
            nonportable.append({'path': value, 'declaredIn': relative(parent), 'key': key})
        return []
    if not any(x in key.lower() for x in ('path', 'file', 'directory', 'asset', 'image')):
        return []
    if '\n' in value or ' ' in value or '*' in value or not re.search(r'\.(?:jsonl?|md|png|jpe?g|pdf|html|txt|ts|ya?ml|svg)$', value):
        return []
    # D resolutions live below their artifact group; bundle manifests copied into
    # round directories still bind the sibling bundle rather than local files.
    bases = [parent.parent]
    if parent.parent.name == 'resolutions':
        bases.append(parent.parent.parent)
    if parent.name == 'review-bundle-manifest.json':
        bases.insert(0, parent.parent.parent / 'bundle')
    candidates = [base / value for base in bases]
    existing = [p for p in candidates if p.exists()]
    return existing[:1] or candidates[:1]

def walk(obj, parent, key=''):
    if isinstance(obj, dict):
        # Explicit path+digest records form immutable snapshot bindings.
        if isinstance(obj.get('path'), str) and isinstance(obj.get('sha256'), str):
            for p in resolve_ref(obj['path'], parent, 'path'):
                if p.is_file():
                    actual = hashlib.sha256(p.read_bytes()).hexdigest()
                    wanted = obj['sha256'].removeprefix('sha256:')
                    digest_bindings.append({'declaredIn': relative(parent), 'path': relative(p), 'expected': wanted, 'actual': actual, 'matches': wanted == actual})
        for k, v in obj.items():
            walk(v, parent, k)
    elif isinstance(obj, list):
        for v in obj:
            walk(v, parent, key)
    elif isinstance(obj, str):
        if any(x in key.lower() for x in ('reportpath', 'outputpath', 'outputdirectory')):
            for p in resolve_ref(obj, parent, key):
                ignored_outputs.append({'path': relative(p), 'declaredIn': relative(parent), 'exists': p.exists()})
            return
        for p in resolve_ref(obj, parent, key):
            edges.append({'from': relative(parent), 'key': key, 'to': relative(p)})
            add(p, relative(parent) + ':' + key)

# Active changed source/configuration files. Global canonical and QA files are
# scanned only for the five changed goals, not unrelated historical assets.
for rel in sorted(CHANGED - {''}):
    if rel.startswith(PREFIXES):
        add(ROOT / rel, 'active-worktree-change')

registry = 'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'
current = json.loads((ROOT / registry).read_text())
old = json.loads(subprocess.check_output(['git', 'show', 'HEAD:' + registry]))
c = next(s for s in current['subjects'] if s['subject'] == 'chemie')
o = next(s for s in old['subjects'] if s['subject'] == 'chemie')
for k, v in c.items():
    if v != o.get(k):
        vals = [x for x in v if x not in o.get(k, [])] if isinstance(v, list) else v
        walk(vals, ROOT / registry, k)

for rel in ['curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json', 'curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json']:
    data = json.loads((ROOT / rel).read_text())
    for item in data.get('goals', data.get('records', [])):
        if item.get('id', item.get('goalId')) in GOALS:
            walk(item, ROOT / rel)

for rel in ['app/scripts/config/goal-books/de-gym-chemistry-national-atlas.inputs.json']:
    data = json.loads((ROOT / rel).read_text())
    before = json.loads(subprocess.check_output(['git', 'show', 'HEAD:' + rel]))
    def diff(a, b, k=''):
        if isinstance(a, dict) and isinstance(b, dict):
            for key, value in a.items():
                diff(value, b.get(key), key)
        elif isinstance(a, list) and isinstance(b, list):
            for value in a:
                if value not in b:
                    walk(value, ROOT / rel, k)
        elif a != b:
            walk(a, ROOT / rel, k)
    diff(data, before)

# The actual first-current reviews, the neutral reviewed source packages and
# adoption/import records are evidence roots; their seals carry exact files.
roots = [
 'chemie-q2-four-final-current402-normal-first-independent-a-20261012-v3/FINAL.first-current-independent-a.manifest.json',
 'chemie-q2-four-final-current402-normal-first-independent-b-20261012-v3/FINAL.original-first-independent-b.manifest.json',
 'chemie-q2-four-final-current402-normal-first-independent-b-20261012-v3/ORIGINAL.first-pass-judgment-seal.json',
 'chemie-manganometry-literal-current402-normal-first-independent-a-20261012-v3/FINAL.first-current-independent-a.manifest.json',
 'chemie-manganometry-literal-current402-normal-first-independent-b-20261012-v3/FINAL.original-first-independent-b.manifest.json',
 'chemie-manganometry-literal-current402-normal-first-independent-b-20261012-v3/ORIGINAL.first-pass-judgment-seal.json',
 'chemie-q2-four-current402-normal-integration-root-20261012-v3/APPLIED.selected-four-active-adoption.actual.json',
 'chemie-q2-four-current402-normal-integration-root-20261012-v3/native-D4/batch-manifest.json',
 'chemie-manganometry-current402-normal-integration-root-20261012-v4/native-D1/batch-manifest.json',
 'chemie-manganometry-current402-active-adoption-root-20261012-v5/APPLIED.one-current-scientific-adoption.actual.json',
 'chemie-manganometry-current402-active-adoption-root-20261012-v5/checks/central-current402-after-five.actual.json',
 'chemie-manganometry-current402-active-adoption-root-20261012-v5/checks/central-current402-after-five.run.actual.json',
]
for rel in roots:
    add(ROOT / (DAY + rel), 'five-checkpoint-evidence-root')
for pack, native in [('chemie-q2-four-current402-normal-integration-root-20261012-v3', 'native-D4'), ('chemie-manganometry-current402-normal-integration-root-20261012-v4', 'native-D1')]:
    for p in (ROOT / (DAY + pack) / native).rglob('*'):
        if p.is_file():
            add(p, 'actual-active-native-artifact-set')
for gid in ['127e2fc9-23f3-5ce8-a1c9-8c9e014c8a8a', '197bc2c5-835e-59e7-9263-5684e89799cc', '2fdd759f-8349-5f7e-b29a-6ac7fb0299f9']:
    add(ROOT / f'curricula/DE/Gymnasium/visualizations/chemie/{gid}/prompt.de.md', 'actual-imported-three-image-prompt')
add(ROOT / 'docs/qa-ci/chemie217-five-scientific-closures-2026-10-12.md', 'root-authored-actual217-checkpoint-document')
for pack in ['chemie-q2-four-current402-normal-integration-root-20261012-v3', 'chemie-manganometry-current402-active-adoption-root-20261012-v5']:
    for p in (ROOT / (DAY + pack) / 'checks').glob('*'):
        if p.is_file():
            add(p, 'normal-adoption-and-import-actual-record')

while queue:
    p = queue.popleft()
    rel = relative(p)
    if rel in parsed or p.is_symlink():
        continue
    parsed.add(rel)
    if p.suffix == '.json':
        try:
            walk(json.loads(p.read_text()), p)
        except (UnicodeDecodeError, json.JSONDecodeError):
            pass
    elif p.suffix == '.jsonl':
        for line in p.read_text().splitlines():
            if line.strip():
                walk(json.loads(line), p)

for rel in list(paths):
    p = (ROOT / rel).parent
    while p != ROOT:
        f = p / '.gitignore'
        if f.is_file():
            add(f, 'ancestor-ignore-policy-for:' + rel)
        p = p.parent

ignored_raw = subprocess.run(['git', 'check-ignore', '--stdin', '-z'], input='\0'.join(paths) + '\0', text=True, capture_output=True).stdout
ignored = set(ignored_raw.split('\0')) - {''}
for rel, row in paths.items():
    row['ignored'] = rel in ignored
    row['generatedBackendRuntime'] = rel.startswith('backend/src/main/resources/static/') and rel not in TRACKED
    row['symlink'] = (ROOT / rel).is_symlink()
    row['stageRequired'] = (not row['tracked'] or row['changed']) and not row['generatedBackendRuntime']
    if row['stageRequired']:
        row['sha256'] = hashlib.sha256((ROOT / rel).read_bytes()).hexdigest()

stage = sorted(rel for rel, row in paths.items() if row['stageRequired'])
force = [rel for rel in stage if paths[rel]['ignored']]
historical = [r for r in missing if r['reason'].endswith((':argv', ':removedPropertyValue'))]
missing = [r for r in missing if r not in historical]
summary = {'atUTC': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'headSHA': subprocess.check_output(['git','rev-parse','HEAD']).decode().strip(), 'auditDidNotMutateActiveFilesOrIndex': True, 'requiredPathCount': len(paths), 'stagePathCount': len(stage), 'stageBytes': sum(paths[p]['bytes'] for p in stage), 'forceAddCount': len(force), 'missingInputReferences': missing, 'historicalFailedCommandPathLocatorsPreserved': historical, 'excludedExecutableMetadata': executable_metadata, 'outputReferences': ignored_outputs, 'nonportableReferences': nonportable, 'untrackedGeneratedRuntimePaths': [p for p,r in paths.items() if r['generatedBackendRuntime']], 'over50MiB': [r for r in paths.values() if r['stageRequired'] and r['bytes'] > 50 * 1024 * 1024], 'over100MiB': [r for r in paths.values() if r['stageRequired'] and r['bytes'] > 100 * 1024 * 1024], 'paths': sorted(paths.values(),key=lambda r:r['path']), 'edges': edges, 'digestBindings': digest_bindings}
(OUT / 'dependency-closure.actual.json').write_text(json.dumps(summary, indent=2, ensure_ascii=False)+'\n')
(OUT / 'stage-required-paths.actual.txt').write_text('\n'.join(stage)+'\n')
(OUT / 'stage-force-required-paths.actual.txt').write_text('\n'.join(force)+'\n')
print(json.dumps({k:v for k,v in summary.items() if k not in ['paths','edges','digestBindings']},indent=2))
print('Snapshot digest mismatch count', sum(not r['matches'] for r in digest_bindings))
print('Stage dependency packages')
counts=collections.Counter('/'.join(p.split('/')[:7]) if p.startswith(DAY) else '/'.join(p.split('/')[:-1]) for p in stage)
for p,n in sorted(counts.items()):
    print(n,p)
