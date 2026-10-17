"""Verify archived bytes and explicit checkpoint boundaries without scratch inputs."""
from pathlib import Path
import hashlib
import json

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[6]
manifest = json.loads((HERE / 'MANIFEST.inactive-current439.json').read_text())
assert manifest['activation'] is False and manifest['M7Claim'] is False
assert manifest['HumanApproval'] is False and manifest['HumanTrial'] is False
assert manifest['currentL6CentralResult'] is None
assert manifest['activeNetNewStrictClosures'] == 0
assert manifest['newStrictDescriptionCompletions'] == 2
assert manifest['native20CentralFinalization'].startswith('pending;')
normal = ROOT / 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
assert hashlib.sha256(normal.read_bytes()).hexdigest() == manifest['normalChemistrySha256']
seen = set()
json_files = jsonl_records = total = 0
for row in manifest['files']:
    relative = Path(row['storedPath'])
    assert not relative.is_absolute() and '..' not in relative.parts
    path = HERE / relative
    assert path.resolve().is_relative_to(HERE)
    assert not any(p.is_symlink() for p in [path, *path.parents] if p.is_relative_to(HERE))
    assert path.is_file() and row['storedPath'] not in seen, path
    seen.add(row['storedPath'])
    data = path.read_bytes()
    assert len(data) == row['bytes'] and hashlib.sha256(data).hexdigest() == row['sha256'], path
    total += len(data)
    if path.suffix == '.json':
        json.loads(data)
        json_files += 1
    elif path.suffix == '.jsonl':
        for line in data.decode().splitlines():
            if line.strip():
                json.loads(line)
                jsonl_records += 1
for row in manifest['reusedPreviousFiles']:
    relative = Path(row['repositoryPath'])
    assert not relative.is_absolute() and '..' not in relative.parts
    path = ROOT / relative
    assert path.resolve().is_relative_to(ROOT) and not path.is_symlink()
    data = path.read_bytes()
    assert len(data) == row['bytes'] and hashlib.sha256(data).hexdigest() == row['sha256']
candidate = HERE / 'candidate-delta/curricula/DE/Gymnasium'
goals = json.loads((candidate / 'canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json').read_text())['goals']
sem = json.loads((candidate / 'quality/goal-book-publication/chemie.semantic-kinds.json').read_text())['decisions']
ids = {g['id'] for g in goals}
assert len(goals) == len(ids) == manifest['candidateWholeGoals'] == 641
assert sum(s['goalId'] in ids and s['semanticKind'] == 'curricularAtomic' for s in sem) == manifest['candidateCurricularAtomicGoals'] == 439
assert hashlib.sha256((candidate / 'canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json').read_bytes()).hexdigest() == manifest['candidateCanonicalSha256']
p_path = candidate / ('quality/goal-evidence/2026-10-16/'
    'chemie-current439-paired-generic-SekI-and-NI-private-L6-technical-20261016-v1/'
    'P439.exact437-retained-whole-lines-two-own-b-contexts.for-native-model.jsonl')
profiles = [json.loads(line) for line in p_path.read_text().splitlines() if line.strip()]
assert len(profiles) == len({p['goalId'] for p in profiles}) == manifest['candidatePRecords'] == 439
assert {p['goalId'] for p in profiles} == {s['goalId'] for s in sem if s['goalId'] in ids and s['semanticKind'] == 'curricularAtomic'}
print(json.dumps({'result': 'PASS', 'files': len(seen), 'bytes': total,
                  'JSONFiles': json_files, 'JSONLRecords': jsonl_records,
                  'normalChemistryUnchanged': True, 'wholeGoals': len(goals),
                  'curricularAtomicGoals': 439, 'PRecords': len(profiles), 'M7Claim': False}))
