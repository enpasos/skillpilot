#!/usr/bin/env python3
"""Read-only working-tree portability inventory; writes only this evidence package."""
import collections
import datetime
import hashlib
import json
import os
import pathlib
import re
import subprocess

ROOT = pathlib.Path(__file__).resolve().parents[7]
OUT = pathlib.Path(__file__).resolve().parent
STAMP = datetime.datetime.now(datetime.timezone.utc).isoformat()


def git(*args):
    return subprocess.check_output(['git', *args], cwd=ROOT)


def digest(value):
    return hashlib.sha256(value).hexdigest()


def write(name, value):
    (OUT / name).write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')


raw = git('status', '--porcelain=v1', '-z', '-uall').split(b'\0')
items = []
i = 0
while i < len(raw):
    entry = raw[i]
    i += 1
    if not entry:
        continue
    status, path = entry[:2].decode(), os.fsdecode(entry[3:])
    if str(OUT.relative_to(ROOT)) in path:
        continue
    item = {'status': status, 'path': path}
    if 'R' in status or 'C' in status:
        item['oldPath'] = os.fsdecode(raw[i])
        i += 1
    full = ROOT / path
    if full.is_symlink():
        item.update(kind='symlink', target=os.readlink(full), bytes=full.lstat().st_size)
    elif full.is_file():
        value = full.read_bytes()
        item.update(kind='file', bytes=len(value), sha256=digest(value))
    elif full.is_dir():
        item.update(kind='directory', bytes=0)
    else:
        item.update(kind='missing', bytes=0)
    items.append(item)

(OUT / 'working-files.actual.jsonl').write_text(''.join(json.dumps(x, ensure_ascii=False) + '\n' for x in items))
images = [x for x in items if pathlib.Path(x['path']).suffix.lower() in {'.png', '.jpg', '.jpeg', '.webp'}]
by_image_digest = collections.defaultdict(list)
for item in images:
    by_image_digest[item['sha256']].append(item)
image_duplicates = []
for sha, group in by_image_digest.items():
    if len(group) < 2:
        continue
    paths = [x['path'] for x in group]
    public = [p for p in paths if p.startswith('app/public/')]
    sources = [p for p in paths if p.startswith('curricula/DE/Gymnasium/visualizations/')]
    image_duplicates.append({'sha256': sha, 'bytesEach': group[0]['bytes'], 'count': len(group), 'publicCount': len(public), 'sourceCount': len(sources), 'paths': paths})
write('duplicate-images.actual.json', image_duplicates)

# Extract only local path strings; do not surface review rationale or judgments.
public_refs = collections.defaultdict(set)
repo_refs = collections.defaultdict(set)
absolute_refs = []
parse_errors = []
repo_prefixes = ('app/', 'curricula/', 'docs/', 'scripts/', 'contracts/', 'backend/')


def inspect_string(value, owner, key):
    for asset in re.findall(r'''(?<![A-Za-z0-9])(/assets/[^\s`"'<>\)\]]+)''', value):
        public_refs[asset.split('?', 1)[0].split('#', 1)[0].rstrip('.,;')].add(owner)
    if value.startswith(repo_prefixes) and '\n' not in value and len(value) < 1800:
        repo_refs[value].add(owner)
    if value.startswith(('/home/', '/tmp/')) and '\n' not in value and len(value) < 1800:
        absolute_refs.append({'owner': owner, 'key': key, 'value': value, 'existsHere': pathlib.Path(value).exists()})


def walk(value, owner, key=''):
    if isinstance(value, dict):
        for k, v in value.items():
            walk(v, owner, k)
    elif isinstance(value, list):
        for v in value:
            walk(v, owner, key)
    elif isinstance(value, str):
        inspect_string(value, owner, key)


for item in items:
    if item['kind'] != 'file':
        continue
    path = item['path']
    suffix = pathlib.Path(path).suffix.lower()
    if suffix not in {'.json', '.jsonl', '.md', '.ts', '.java'}:
        continue
    try:
        text = (ROOT / path).read_text()
        if suffix == '.json':
            walk(json.loads(text), path)
        elif suffix == '.jsonl':
            for line_no, line in enumerate(text.splitlines(), 1):
                if line.strip():
                    walk(json.loads(line), path)
        else:
            for asset in re.findall(r'''(?<![A-Za-z0-9])(/assets/[^\s`"'<>\)\]]+)''', text):
                public_refs[asset.rstrip('.,;')].add(path)
    except (ValueError, UnicodeError) as exc:
        parse_errors.append({'path': path, 'error': str(exc)})

missing_public = [{'reference': p, 'expectedFile': 'app/public' + p, 'owners': sorted(owners)} for p, owners in sorted(public_refs.items()) if not (ROOT / 'app/public' / p.lstrip('/')).exists()]
missing_repo = [{'reference': p, 'owners': sorted(owners)} for p, owners in sorted(repo_refs.items()) if not (ROOT / p).exists()]
write('missing-public-references.actual.json', missing_public)
write('missing-repository-references.actual.json', missing_repo)
write('absolute-path-metadata.actual.json', absolute_refs)
write('json-parse-errors.actual.json', parse_errors)

tracked_symlinks = []
for line in git('ls-files', '-s', '-z').split(b'\0'):
    if line.startswith(b'120000'):
        _, path = line.split(b'\t', 1)
        p = os.fsdecode(path)
        tracked_symlinks.append({'path': p, 'target': os.readlink(ROOT / p)})

historical = []
for item in items:
    if item['status'] == '??' or '/goal-evidence/' not in item['path'] or not item['path'].endswith('.md'):
        continue
    p = item['path']
    before = git('show', 'HEAD:' + p)
    after = (ROOT / p).read_bytes()
    header = after.decode().splitlines()[:16]
    if '> Generated by: `app/scripts/memoryCardReview.ts`' in header:
        owners = [line.removeprefix('> Source of truth: `').removesuffix('`') for line in header if line.startswith('> Source of truth: `')]
        historical.append({'path': p, 'headSha256': digest(before), 'workingSha256': digest(after), 'headBytes': len(before), 'workingBytes': len(after), 'owners': owners, 'ownerChangedAgainstHead': [{'path': x, 'changed': x in {i['path'] for i in items if i['status'] != '??'}} for x in owners], 'finding': 'historical_generated_original_drift; preserve HEAD original and record current successor separately'})
write('historical-generated-original-drift.actual.json', historical)

packages = collections.defaultdict(lambda: {'files': 0, 'bytes': 0})
for item in items:
    path = item['path']
    parts = path.split('/')
    if '/goal-evidence/' in path and len(parts) > 6:
        group = '/'.join(parts[:7])
        packages[group]['files'] += 1
        packages[group]['bytes'] += item['bytes']

diff_check = subprocess.run(['git', 'diff', '--check'], cwd=ROOT, capture_output=True, text=True)
summary = {
    'observedAt': STAMP, 'reviewerId': '/root/chemie_final_native_round_b_20261018',
    'scope': 'technical read-only working-tree inventory; excludes this evidence package; no content verdicts, build, normal mutation, external write, whole-subject, M7 or human-approval claim',
    'head': git('rev-parse', 'HEAD').decode().strip(),
    'statusFileCount': len(items), 'statusCounts': dict(collections.Counter(x['status'] for x in items)),
    'workingFileBytes': sum(x['bytes'] for x in items),
    'changedOrNewSymlinks': [x for x in items if x['kind'] == 'symlink'],
    'unchangedTrackedSymlinks': {'count': len(tracked_symlinks), 'absoluteTargetCount': sum(os.path.isabs(x['target']) for x in tracked_symlinks), 'tmpTargetCount': sum('tmp/' in x['target'] for x in tracked_symlinks), 'note': 'Existing symlink destinations were not exhaustively revalidated; no symlinks are added or changed in the inspected status set.'},
    'largestFiles': sorted(items, key=lambda x: x['bytes'], reverse=True)[:30],
    'filesOverGitHub100MiB': [x for x in items if x['bytes'] > 100 * 1024 * 1024],
    'imageFiles': len(images), 'imageBytes': sum(x['bytes'] for x in images),
    'duplicateImageGroups': len(image_duplicates),
    'imageBytesBeyondFirstInDigestGroups': sum(x['bytesEach'] * (x['count'] - 1) for x in image_duplicates),
    'publicReferenceCount': len(public_refs), 'missingPublicReferenceCount': len(missing_public),
    'repositoryReferenceCount': len(repo_refs), 'missingRepositoryReferenceCount': len(missing_repo),
    'absolutePathMetadataCount': len(absolute_refs), 'jsonParseErrorCount': len(parse_errors),
    'evidencePackagesBySize': sorted(({'path': k, **v} for k, v in packages.items()), key=lambda x: x['bytes'], reverse=True)[:25],
    'historicalGeneratedOriginalDriftCount': len(historical),
    'diffCheck': {'exitCode': diff_check.returncode, 'stdout': diff_check.stdout, 'stderr': diff_check.stderr},
    'limits': ['Working tree was live; later concurrent changes are outside this observation.', 'Path extraction checks existence, not source fidelity or semantic validity.', 'Missing evidence paths may be planned outputs or historical environment metadata; classify before treating as a blocker.', 'No exhaustive CI or full build was run.']
}
write('inspection.actual.json', summary)
print(json.dumps({k: summary[k] for k in ['observedAt', 'statusFileCount', 'workingFileBytes', 'imageFiles', 'imageBytes', 'duplicateImageGroups', 'imageBytesBeyondFirstInDigestGroups', 'missingPublicReferenceCount', 'missingRepositoryReferenceCount', 'absolutePathMetadataCount', 'jsonParseErrorCount', 'historicalGeneratedOriginalDriftCount', 'diffCheck']}, indent=2))
