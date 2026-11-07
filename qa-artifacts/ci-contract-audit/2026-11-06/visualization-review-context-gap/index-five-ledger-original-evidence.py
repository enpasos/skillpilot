#!/usr/bin/env python3
"""Finite discovery only; matching text/hash is never a V approval.

Index committed review-like artifacts, all visualization-review text artifacts,
and exact/basename locators present in the five actual current ledger notes.
Inputs referenced by those documents are followed during qualification, not
declared reviews by filename. Large aggregate QA snapshots remain metadata.
"""
from pathlib import Path
import collections
import gzip
import hashlib
import json
import re
import subprocess
import time

ROOT = Path(__file__).resolve().parents[4]
OUT = ROOT / 'qa-artifacts/ci-contract-audit/2026-11-06/visualization-five-ledger-original-evidence-census'
CENSUS = ROOT / 'qa-artifacts/ci-contract-audit/2026-11-06/visualization-review-context-gap/five-ledger-field-census.json'
BASE = json.loads(CENSUS.read_bytes())


def digest(raw):
    return hashlib.sha256(raw).hexdigest()


def main():
    OUT.mkdir(exist_ok=False)
    head = subprocess.check_output(['git', '--no-replace-objects', 'rev-parse', 'HEAD'], cwd=ROOT).decode().strip()
    tree = subprocess.check_output(['git', '--no-replace-objects', 'ls-tree', '-r', '-z', head, '--',
        'curricula/DE/Gymnasium/quality', 'docs'], cwd=ROOT).decode().split('\0')
    paths = {}
    basename = collections.defaultdict(list)
    for item in tree:
        if not item:
            continue
        mode_type, path = item.split('\t', 1)
        mode, kind, blob = mode_type.split(' ')
        if kind == 'blob' and Path(path).suffix in ('.json', '.jsonl', '.md', '.txt'):
            paths[path] = (mode, blob)
            basename[Path(path).name].append(path)
    goals = {}
    ledger_pins = []
    locators = {}
    direct_paths = set()
    for subject in BASE['subjects']:
        path = subject['inputs'][0]['path']
        raw = (ROOT / path).read_bytes()
        assert digest(raw) == subject['inputs'][0]['sha256']
        ledger_pins.append({'path': path, 'sha256': digest(raw)})
        for row in json.loads(raw)['records']:
            goal_id = row['goalId']
            assert goal_id not in goals
            goals[goal_id] = row
            exact = set(re.findall(r'(?:curricula|qa-artifacts|docs)/[^\s`\"\)\],;]+\.(?:jsonl?|md|txt)', row['aiNotes']))
            short = set(re.findall(r'(?<![/\w-])([a-zA-Z0-9][a-zA-Z0-9_.-]*\.(?:jsonl?|md|txt))', row['aiNotes']))
            resolved = {p for p in exact if p in paths}
            ambiguous = {}
            for name in short:
                options = basename.get(name, [])
                if len(options) == 1:
                    resolved.add(options[0])
                elif options:
                    ambiguous[name] = options
            # Directory locators are explicit routing hints, not approvals.
            directories = set(re.findall(r'curricula/DE/Gymnasium/quality/(?:goal-visualization-review/[^\s`\"\)\],;]+|goal-evidence/[^\s`\"\)\],;]+)', row['aiNotes']))
            for directory in directories:
                directory = directory.rstrip('.,;:')
                if (ROOT / directory).is_dir():
                    resolved.update(p for p in paths if p.startswith(directory + '/'))
            locators[goal_id] = {'exactNotesLocators': sorted(exact), 'resolvedFiles': sorted(resolved),
                                 'ambiguousBasenames': ambiguous,
                                 'unresolvedExactLocators': sorted(exact - paths.keys())}
            direct_paths.update(resolved)
    assert len(goals) == 2562
    # A filename only establishes the finite discovery boundary; every eventual
    # approval still requires an original actual-review decision and input edge.
    selected = {}
    for path, value in paths.items():
        name = Path(path).name.lower()
        relevant = '/goal-visualization-review/' in path or path in direct_paths
        relevant |= (path.startswith('curricula/DE/Gymnasium/quality/')
                     and Path(path).suffix in ('.json', '.jsonl')
                     and any(word in name for word in ('review', 'receipt', 'result', 'verdict', 'dossier', 'synthes')))
        if relevant:
            selected[path] = value
    hashes = {r['assetSha256'].removeprefix('sha256:').encode() for r in goals.values()}
    uuids = {g.encode(): g for g in goals}
    uuid_re = re.compile(rb'[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}')
    hash_re = re.compile(rb'(?<![0-9a-f])[0-9a-f]{64}(?![0-9a-f])')
    candidates = collections.defaultdict(list)
    file_inventory = []
    issues = []
    started = time.time()
    for number, (path, (mode, blob)) in enumerate(sorted(selected.items()), 1):
        file = ROOT / path
        if mode not in ('100644', '100755'):
            issues.append({'path': path, 'kind': 'non-regular-git-input', 'mode': mode})
            continue
        raw = file.read_bytes()
        object_id = hashlib.sha1(b'blob ' + str(len(raw)).encode() + b'\0' + raw).hexdigest()
        if object_id != blob:
            issues.append({'path': path, 'kind': 'worktree-differs-from-accepted-git-blob'})
            continue
        ids = sorted({uuids[value] for value in uuid_re.findall(raw) if value in uuids})
        matching_hashes = set(hash_re.findall(raw)) & hashes if ids else set()
        if not ids:
            continue
        file_sha = digest(raw)
        entry = {'path': path, 'gitBlob': blob, 'sha256': file_sha, 'size': len(raw),
                 'currentGoalIdMentions': len(ids), 'currentImageHashMentions': len(matching_hashes)}
        # Pure aggregates do not become evidence of the text a reviewer saw.
        aggregate = False
        root_keys = []
        structured_kind = None
        if path.endswith('.json') and matching_hashes:
            try:
                value = json.loads(raw)
                if isinstance(value, dict):
                    root_keys = sorted(value)
                    recs = value.get('records')
                    aggregate = (isinstance(recs, list) and bool(recs)
                                 and isinstance(recs[0], dict) and 'aiApproved' in recs[0]
                                 and 'chatGptNotes' in recs[0])
                    structured_kind = value.get('kind', value.get('schemaVersion'))
                elif isinstance(value, list):
                    structured_kind = 'array'
            except (ValueError, UnicodeDecodeError) as error:
                issues.append({'path': path, 'kind': 'parse-failure', 'message': str(error)})
        entry['aggregateOnly'] = aggregate
        if root_keys:
            entry['rootKeys'] = root_keys
        entry['declaredKind'] = structured_kind
        file_inventory.append(entry)
        # Store only possible same-current-asset relationships and explicit note
        # references. Not all IDs mentioned by a broad dossier are its subjects.
        for gid in ids:
            image_matches = goals[gid]['assetSha256'].removeprefix('sha256:').encode() in matching_hashes
            explicit = path in locators[gid]['resolvedFiles']
            if image_matches or explicit:
                candidates[gid].append({'path': path, 'sha256': file_sha, 'sameCurrentImageHashMentioned': image_matches,
                    'explicitNotesLocator': explicit, 'aggregateOnly': aggregate})
        if number % 4000 == 0:
            print(json.dumps({'scanned': number, 'selected': len(selected), 'seconds': round(time.time()-started),
                              'nonAggregateCandidates': sum(not r['aggregateOnly'] for rs in candidates.values() for r in rs)}), flush=True)
    # Lossless compressed discovery data avoids multiplying source/asset bytes.
    def write(name, value):
        raw = (json.dumps(value, ensure_ascii=False, separators=(',', ':')) + '\n').encode()
        compressed = gzip.compress(raw, compresslevel=6, mtime=0)
        (OUT / name).write_bytes(compressed)
        return {'path': str((OUT / name).relative_to(ROOT)), 'sha256': digest(compressed),
                'uncompressedSha256': digest(raw), 'uncompressedBytes': len(raw)}
    inventory_ref = write('artifact-discovery.json.gz', {'files': file_inventory, 'issues': issues})
    rows_ref = write('goal-evidence-candidates.json.gz', {'rows': [{'goalId': gid, 'subject': goals[gid]['subject'],
        'locatorDiscovery': locators[gid], 'candidates': candidates[gid]} for gid in goals]})
    summary = {'schemaVersion': 1, 'kind': 'five-ledger-finite-original-evidence-discovery',
        'acceptedRepositoryCommit': head, 'ledgerInputs': ledger_pins, 'goalCount': len(goals),
        'selectedTextArtifacts': len(selected), 'artifactsMentioningCurrentGoals': len(file_inventory),
        'goalsWithNonAggregateCandidate': sum(any(not r['aggregateOnly'] for r in candidates[g]) for g in goals),
        'inventory': inventory_ref, 'candidateIndex': rows_ref, 'issues': issues,
        'scope': 'Discovery only. A textual current goal/image hash occurrence and a current note locator do not prove an original reviewed context. No qualification or fresh-review count is claimed here.',
        'selectionRule': 'All tracked visualization-review text artifacts; all exact/uniquely resolved basename/current-note directory locators; all tracked quality JSON/JSONL whose basename contains review, receipt, result, verdict, dossier or synthes. Original inputs referenced by an actual review remain follow-up dependencies, not automatically approved reviews.',
        'activeSourceQaWrites': False, 'elapsedSeconds': round(time.time()-started)}
    (OUT / 'discovery-summary.json').write_text(json.dumps(summary, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps(summary), flush=True)


if __name__ == '__main__':
    main()
