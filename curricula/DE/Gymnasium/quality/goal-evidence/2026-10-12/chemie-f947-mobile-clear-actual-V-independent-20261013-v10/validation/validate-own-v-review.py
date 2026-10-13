import argparse
import hashlib
import importlib.util
import json
import os
from pathlib import Path
import stat
import subprocess

import jsonschema

parser = argparse.ArgumentParser()
parser.add_argument('packet')
parser.add_argument('repo')
parser.add_argument('final_relative')
args = parser.parse_args()
packet = Path(args.packet).absolute()
repo = Path(args.repo).absolute()
final_relative = args.final_relative.rstrip('/')
goal_id = 'f947cd04-952a-5a9d-9445-3ffc70e02c3c'
candidate_hash = '1704dabc275aea63e09ed793fe211d110a45a30a0ab09b013d32231a74dd7372'

def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def regular_chain(path):
    for parent in [path, *path.parents]:
        st = parent.lstat()
        assert stat.S_ISDIR(st.st_mode), str(parent)
        assert not stat.S_ISLNK(st.st_mode), str(parent)
        assert not st.st_mode & 0o022, str(parent)
    assert path.stat().st_uid == os.getuid()

regular_chain(packet)
files = sorted(p for p in packet.rglob('*') if p.is_file())
assert all(not p.is_symlink() and stat.S_ISREG(p.lstat().st_mode) for p in files)
parsed = 0
for path in files:
    if path.suffix == '.json':
        json.loads(path.read_text())
        parsed += 1
    elif path.suffix == '.jsonl':
        for line in path.read_text().splitlines():
            if line.strip():
                json.loads(line)
        parsed += 1

first_path = packet / 'review/FIRST.independent-scientific-visual-assessment.json'
assert digest(first_path) == '4510a2559da4b14e3b5197b9dca5aed470dcfc3e8e309e7d0a926e857c55859e'
first = json.loads(first_path.read_text())
assert first['verdict'] == 'PASS' and first['didAuthorImage'] is False
assert first['readOtherCurrentVisualVerdictsBeforeOwnAssessment'] is False
assert first['goalIds'] == [goal_id]
assert digest(packet / 'inputs/candidate.actual-byte-exact.png') == candidate_hash
current_goal = json.loads((packet / 'inputs/goal.current.whole.json').read_text())
candidate_goal = json.loads((packet / 'inputs/goal.candidate.whole.json').read_text())
assert {k: v for k, v in current_goal.items() if k != 'resourceLinks'} == {k: v for k, v in candidate_goal.items() if k != 'resourceLinks'}
schema = json.loads((packet / 'inputs/landscape-runtime.schema.json').read_text())
goal_schema = {'$schema': schema['$schema'], '$defs': schema['$defs'], '$ref': '#/$defs/goal'}
jsonschema.Draft202012Validator(goal_schema).validate(candidate_goal)

links = []
def mapped(path):
    if path.startswith(final_relative + '/'):
        return packet / path[len(final_relative) + 1:]
    return repo / path

def bind_check(binding):
    path = mapped(binding['path'])
    assert path.is_file() and not path.is_symlink(), binding['path']
    assert digest(path) == binding['sha256'], binding['path']
    assert path.stat().st_size == binding['bytes'], binding['path']
    links.append(binding['path'])

config = json.loads((packet / 'review/V.independent.config.json').read_text())
for field in ['reviewJsonPath', 'reviewMarkdownPath', 'visualizationQaCandidatePath', 'futureLiveRowPath']:
    assert mapped(config[field]).is_file(), config[field]
    links.append(config[field])
for field in ['firstVerdictBinding', 'actualAssetBinding']:
    bind_check(config[field])
review = json.loads((packet / 'review/independent.actual-visual-review.json').read_text())
for field in ['firstImmutableVerdictBinding', 'toolAndReadReceiptBinding', 'sourceToolProvenanceBinding']:
    bind_check(review[field])
for view in review['actualViews']:
    bind_check(view['binding'])
    assert view['actuallyViewed'] is True

ledger = json.loads((packet / 'review/V.ordinary-selected-one.inactive.qa.json').read_text())
assert ledger['schemaVersion'] == 1 and ledger['subject'] == 'chemie'
assert len(ledger['records']) == 1
row = ledger['records'][0]
assert row['goalId'] == goal_id
assert row['assetSha256'] == row['aiApprovedAssetSha256'] == 'sha256:' + candidate_hash
assert row['aiApproved'] == 'yes' and row['humanApproved'] == 'no'
for field in ['landscapePath', 'canonicalAssetPath', 'publicAssetPath']:
    path = repo / row[field]
    assert path.is_file() and not path.is_symlink(), row[field]
    links.append(row[field])
    if field != 'landscapePath':
        assert digest(path) == candidate_hash

raw_inputs = json.loads((packet / 'inputs/raw-input-receipts.json').read_text())
for item in raw_inputs['files']:
    source = repo / item['sourcePath']
    copy = packet / item['retainedCopy']
    assert digest(copy) == item['sha256']
    assert digest(source) == item['sha256'], item['sourcePath']
    links.append(item['sourcePath'])

protected = json.loads((packet / 'validation/protected-active-inputs.final-snapshot.json').read_text())
ignored_runtime_guard_inputs = []
for item in protected['paths']:
    assert digest(repo / item['path']) == item['sha256'], item['path']
    if item['path'].startswith('backend/src/main/resources/static/'):
        ignored_runtime_guard_inputs.append(item['path'])
    else:
        links.append(item['path'])

author = repo / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12/chemie-f947-mobile-clear-PU-raster-author-20261013-v9'
seal = json.loads((author / 'FINAL.mobile-clear-author.seal.json').read_text())
for item in seal['ownedFiles']:
    path = author / item['path']
    assert path.is_file() and not path.is_symlink()
    assert digest(path) == item['sha256']
    assert path.stat().st_size == item['bytes']

spec = importlib.util.spec_from_file_location('validate_schemas', repo / 'scripts/validate_schemas.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
symlink_errors = module.curriculum_symlink_errors(str(repo))
assert not symlink_errors, symlink_errors
own_paths = [final_relative + '/' + p.relative_to(packet).as_posix() for p in files]
linked_paths = sorted(set(links + own_paths))
ignored = subprocess.run(['git', 'check-ignore', '--no-index', '--stdin'], input='\n'.join(linked_paths) + '\n', cwd=repo, text=True, capture_output=True)
assert ignored.returncode in [0, 1]
assert not ignored.stdout.strip(), ignored.stdout
for path in links:
    actual = mapped(path)
    assert actual.resolve().is_relative_to(repo)
    assert actual.is_file() and not actual.is_symlink()

print(json.dumps({'schemaVersion': 1, 'scope': 'one Chemistry goal and owned review closure; no full build/native-D campaign', 'goalIds': [goal_id], 'targetGoalRuntimeSchemaValid': True, 'structuredFilesParsed': parsed, 'ownRegularFilesValidated': len(files), 'firstVerdictUnchanged': True, 'neutralAuthorSealFilesVerified': len(seal['ownedFiles']), 'retainedRawInputsByteExact': True, 'productionPngUnmodified': True, 'normalGlobalCurriculumSymlinkGuardErrors': symlink_errors, 'globalCommittableReferencesValidated': len(set(links)), 'ownFinalPathsCommittable': True, 'selectedInactiveQaAssetPathsByteExact': True, 'futureLivePathsArePlannedOnly': True, 'currentActiveAndHistoricalInputHashesPreserved': True, 'normalIgnoredRuntimeGuardInputsStillByteExact': ignored_runtime_guard_inputs, 'humanApproval': False, 'humanTrial': False, 'm7Gain': 0, 'activeWrites': 0}, indent=2))
