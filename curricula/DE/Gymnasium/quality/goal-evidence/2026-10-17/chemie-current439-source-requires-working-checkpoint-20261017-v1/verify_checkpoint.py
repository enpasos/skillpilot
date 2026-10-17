#!/usr/bin/env python3
"""Verify inactive checkpoint bytes from the repository alone; no scratch/cache access."""
import collections
import hashlib
import json
from pathlib import Path
import sys

ARCHIVE = Path(__file__).resolve().parent
REPO = next(p for p in ARCHIVE.parents if (p / 'AGENTS.md').is_file() and (p / 'curricula').is_dir())
MANIFEST = ARCHIVE / 'MANIFEST.inactive-current439-source-requires.json'


def require(condition, message):
    if not condition:
        raise ValueError(message)


def read_json(path):
    return json.loads(path.read_bytes())


def read_jsonl(path):
    return [json.loads(line) for line in path.read_text(encoding='utf-8-sig').splitlines() if line.strip()]


def main():
    manifest = read_json(MANIFEST)
    for flag in ('activation', 'M7Claim', 'HumanApproval', 'HumanTrial'):
        require(manifest[flag] is False, f'Unexpected acceptance/activation flag: {flag}')
    require(manifest['normalChemistrySha256'] == '9a68501347031f266572dea551e71c3507b66fb5ed94142a1a99f6a282708960', 'Frozen normal canonical identity changed')
    require(manifest['candidateWholeGoals'] == 650 and manifest['candidateCurricularAtomicGoals'] == 439 and manifest['candidatePRecords'] == 439, 'Candidate declared counts changed')
    checked_paths = {}
    parsed = set()
    originals = set()
    for entry in manifest['files'] + manifest['aliases'] + manifest.get('supportFiles', []):
        original = entry['originalPath']
        require(original not in originals, f'Duplicate original-path mapping: {original}')
        originals.add(original)
        unresolved = ARCHIVE / entry['storedPath']
        for ancestor in [unresolved, *unresolved.parents]:
            require(not ancestor.is_symlink(), f'Symlink in stored evidence path: {ancestor}')
        target = unresolved.resolve()
        require(target.is_relative_to(REPO), f'Non-repository reuse: {entry["storedPath"]}')
        # Reject symlinks in the stored resolution path, including parent directories.
        relative = target.relative_to(REPO)
        current = REPO
        for part in relative.parts:
            current = current / part
            require(not current.is_symlink(), f'Symlink in stored evidence path: {current}')
        if target not in checked_paths:
            data = target.read_bytes()
            checked_paths[target] = (hashlib.sha256(data).hexdigest(), len(data))
        require(checked_paths[target] == (entry['sha256'], entry['bytes']), f'Byte mismatch: {entry["storedPath"]}')
        kind = entry['artifactType']
        require(kind in {'json', 'jsonl', 'opaque-evidence', 'historical-unparsed-bytes'}, f'Unknown artifact type: {kind}')
        if (target, kind) not in parsed:
            if kind == 'json':
                read_json(target)
            elif kind == 'jsonl':
                read_jsonl(target)
            parsed.add((target, kind))
    for entry in manifest['protectedActiveFiles']:
        target = REPO / entry['path']
        data = target.read_bytes()
        require((hashlib.sha256(data).hexdigest(), len(data)) == (entry['sha256'], entry['bytes']), f'Protected active file changed: {entry["path"]}')
    canonical = read_json(ARCHIVE / 'candidate/DE_DEU_S_GYM_CANONICAL_CHEMIE.C650.inactive.json')
    semantic = read_json(ARCHIVE / 'candidate/SEM650.inactive.json')
    profiles = read_jsonl(ARCHIVE / 'candidate/P439.f79-and-SN-corrected.inactive.jsonl')
    goals = canonical['goals']
    require(len(goals) == 650 and len({g['id'] for g in goals}) == 650, 'Candidate must have exactly 650 unique goals')
    decisions = semantic['decisions']
    require(len(decisions) == 650 and {d['goalId'] for d in decisions} == {g['id'] for g in goals}, 'SEM650/canonical goal identity mismatch')
    require(len({d['goalId'] for d in decisions}) == 650, 'Duplicate semantic-kind decision')
    atoms = {d['goalId'] for d in decisions if d['semanticKind'] == 'curricularAtomic'}
    require(len(atoms) == 439 and semantic['counts']['curricularAtomic'] == 439, 'Candidate must have exactly 439 curricularAtomic decisions')
    require(len(profiles) == 439 and {p['goalId'] for p in profiles} == atoms, 'P439 must cover the exact 439 curricularAtomic goal IDs once')
    require(len({p['goalId'] for p in profiles}) == 439, 'Duplicate P439 goal')
    status = read_json(REPO / 'docs/qa-ci/status/curriculum-quality-status.json')
    expected = {'Chemie': ('M6', 231, 402), 'Mathematik': ('M7', 807, 807), 'Physik': ('M7', 478, 478), 'Biologie': ('M7', 397, 397)}
    for subject, values in expected.items():
        row = next(c for c in status['curricula'] if c['subject'] == subject)
        qa = next(r for r in row['rules'] if r['id'] == 'CQR-303')['metrics']
        require((row['maturity'], qa['strictComplete'], qa['expectedGoals']) == values, f'Protected quality baseline changed: {subject}')
    counts = manifest['counts']
    require(counts['physicalEvidenceFiles'] == len(manifest['files']), 'Physical evidence count mismatch')
    require(counts['aliasMappings'] == len(manifest['aliases']), 'Alias count mismatch')
    require(counts['supportFiles'] == len(manifest['supportFiles']), 'Support file count mismatch')
    require(counts['physicalEvidenceBytes'] == sum(e['bytes'] for e in manifest['files']), 'Physical bytes count mismatch')
    require(counts['aliasBytesAvoided'] == sum(e['bytes'] for e in manifest['aliases']), 'Alias bytes count mismatch')
    require(counts['historicalSyntaxExceptions'] == len(manifest['historicalSyntaxExceptions']), 'Historical syntax exception count mismatch')
    require(len(manifest['reusedPreviousFiles']) == sum(e.get('reuseKind') == 'previous-checkpoint' for e in manifest['aliases']), 'Previous-checkpoint reuse count mismatch')
    print(json.dumps({'status': 'PASS', 'physicalEvidenceFiles': len(manifest['files']), 'aliasMappings': len(manifest['aliases']), 'uniqueRepositoryFilesVerified': len(checked_paths), 'physicalEvidenceBytes': counts['physicalEvidenceBytes'], 'historicalSyntaxExceptionsPreserved': counts['historicalSyntaxExceptions'], 'candidate': '650 goals / 439 curricularAtomic / P439', 'activeChemistry': 'M6, 231/402; canonical unchanged', 'protectedM7': 'Mathematik807 / Physik478 / Biologie397'}, ensure_ascii=False))


if __name__ == '__main__':
    try:
        main()
    except (OSError, ValueError, KeyError, StopIteration) as error:
        print(f'FAIL: {error}', file=sys.stderr)
        sys.exit(1)
