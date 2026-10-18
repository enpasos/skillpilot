#!/usr/bin/env python3
"""Verify the inactive Chemistry checkpoint without scratch files or network."""
import argparse
import hashlib
import json
from pathlib import Path

ARCHIVE = Path(__file__).resolve().parent
ROOT = next(p for p in ARCHIVE.parents if (p / 'AGENTS.md').is_file())


def digest(data):
    return hashlib.sha256(data).hexdigest()


def load_manifest():
    return json.loads((ARCHIVE / 'MANIFEST.inactive-current450.json').read_bytes())


def safe_file(relative):
    path = ROOT / relative
    assert not path.is_symlink(), f'Symlink: {relative}'
    assert path.resolve().is_relative_to(ROOT), f'Outside repository: {relative}'
    return path


def verify(snapshots_only=False):
    manifest = load_manifest()
    assert all(manifest[k] is False for k in ('activation', 'M7Claim', 'HumanApproval', 'HumanTrial'))
    assert manifest['goalPausedByOwner'] is True
    overrides_path = ARCHIVE / 'CORRECTIONS.immutable-generated-report.json'
    overrides = json.loads(overrides_path.read_bytes())['retainedEvidencePathOverrides'] if overrides_path.exists() else {}
    paths = set()
    for entry in manifest['files']:
        assert entry['path'] not in paths, entry['path']
        paths.add(entry['path'])
        data = safe_file(entry['storedPath']).read_bytes()
        assert (len(data), digest(data)) == (entry['bytes'], entry['sha256']), entry['storedPath']
        if 'earlierIndexSnapshot' in entry:
            older = entry['earlierIndexSnapshot']
            data = safe_file(older['storedPath']).read_bytes()
            assert (len(data), digest(data)) == (older['bytes'], older['sha256'])
        if not snapshots_only and entry['restoreDuringM7Resumption']:
            current = ROOT / entry['path']
            if entry['presentAtBaseline']:
                assert digest(current.read_bytes()) == entry['baselineSha256'], entry['path']
            else:
                assert not current.exists(), f'Inactive candidate unexpectedly active: {entry["path"]}'
    for entry in manifest['retainedEvidence']:
        data = safe_file(overrides.get(entry['path'], entry['path'])).read_bytes()
        assert (len(data), digest(data)) == (entry['bytes'], entry['sha256']), entry['path']
    for entry in manifest['materializedEvidenceAliases']:
        data = safe_file(entry['path']).read_bytes()
        assert (len(data), digest(data)) == (entry['bytes'], entry['sha256']), entry['path']
    for entry in manifest['protectedActiveFiles']:
        data = safe_file(entry['path']).read_bytes()
        assert (len(data), digest(data)) == (entry['bytes'], entry['sha256']), entry['path']
    by_path = {e['path']: e for e in manifest['files']}
    canonical_path = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
    semantic_path = 'curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json'
    canonical = json.loads(safe_file(by_path[canonical_path]['storedPath']).read_bytes())
    semantic = json.loads(safe_file(by_path[semantic_path]['storedPath']).read_bytes())
    goals = canonical['goals']
    assert len(goals) == 662 and len({g['id'] for g in goals}) == 662
    atoms = {d['goalId'] for d in semantic['decisions'] if d['semanticKind'] == 'curricularAtomic'}
    assert len(atoms) == 450 and atoms <= {g['id'] for g in goals}
    assert manifest['counts']['overlayFiles'] == len(manifest['files'])
    assert manifest['counts']['retainedEvidenceFiles'] == len(manifest['retainedEvidence'])
    return {'status': 'PASS', 'overlayFiles': len(manifest['files']), 'retainedEvidenceFiles': len(manifest['retainedEvidence']),
            'regularEvidenceAliases': len(manifest['materializedEvidenceAliases']), 'candidate': '662 nodes / 450 curricularAtomic; INACTIVE',
            'activeBaselineVerified': not snapshots_only, 'M7Claim': False}


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--snapshots-only', action='store_true')
    print(json.dumps(verify(parser.parse_args().snapshots_only), ensure_ascii=False))
