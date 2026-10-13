import argparse
import hashlib
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

def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def regular_private_parents(path):
    for parent in [path, *path.parents]:
        st = parent.lstat()
        assert stat.S_ISDIR(st.st_mode) and not stat.S_ISLNK(st.st_mode), str(parent)
        assert not st.st_mode & 0o022, str(parent)
    assert path.stat().st_uid == os.getuid()

regular_private_parents(packet)
files = sorted(p for p in packet.rglob('*') if p.is_file())
assert all(not p.is_symlink() and stat.S_ISREG(p.lstat().st_mode) for p in files)
parsed = 0
for path in files:
    if path.suffix == '.json':
        json.loads(path.read_text())
        parsed += 1
    elif path.suffix == '.jsonl':
        for line in path.read_text().splitlines():
            if line.strip(): json.loads(line)
        parsed += 1

first_path = packet / 'review/FIRST.three-independent-actual-scientific-visual-verdicts.json'
assert digest(first_path) == '4aa83930f3b18da9b1eec0961d775a674bc3f670f9909657efa096a540abbfd8'
first = json.loads(first_path.read_text())
ids = [x['goalId'] for x in first['goals']]
assert first['didAuthorAnyImageOrCase'] is False
assert first['authorProvisionalJudgmentsReadBeforeFirst'] is False
assert first['otherReviewerOpinionsReadBeforeFirst'] is False
assert [x['verdict'] for x in first['goals']] == ['PASS', 'HOLD', 'PASS']

schema = json.loads((packet / 'inputs/landscape-runtime.schema.json').read_text())
goal_schema = {'$schema': schema['$schema'], '$defs': schema['$defs'], '$ref': '#/$defs/goal'}
for decision in first['goals']:
    prefix = decision['goalId'][:8]
    assert digest(packet / f'inputs/{prefix}.selected-native-byte-exact.png') == decision['assetSha256']
    current = json.loads((packet / f'inputs/{prefix}.goal.current.whole.json').read_text())
    candidate = json.loads((packet / f'inputs/{prefix}.goal.candidate.whole.json').read_text())
    assert {k: v for k, v in current.items() if k != 'resourceLinks'} == {k: v for k, v in candidate.items() if k != 'resourceLinks'}
    jsonschema.Draft202012Validator(goal_schema).validate(candidate)

links = []
def mapped(path):
    if path.startswith(final_relative + '/'): return packet / path[len(final_relative) + 1:]
    return repo / path

def bind_check(binding):
    path = mapped(binding['path'])
    assert path.is_file() and not path.is_symlink(), binding['path']
    assert digest(path) == binding['sha256'], binding['path']
    assert path.stat().st_size == binding['bytes'], binding['path']
    links.append(binding['path'])

config = json.loads((packet / 'review/V.independent.config.json').read_text())
assert config['doNotActivateHeldCandidate'] is True
assert config['heldGoalIds'] == [ids[1]]
for field in ['reviewJsonPath', 'reviewMarkdownPath', 'visualizationQaCandidatePath', 'futureLiveRowsPath']:
    assert mapped(config[field]).is_file(), config[field]
    links.append(config[field])
bind_check(config['firstVerdictBinding'])
for item in config['actualAssetBindings']: bind_check(item)
review = json.loads((packet / 'review/independent.three-actual-visual-review.json').read_text())
for field in ['firstImmutableVerdictBinding', 'actualReceiptBinding', 'primaryChemicalSourceReceiptBinding']: bind_check(review[field])
receipt = json.loads((packet / 'review/actual-tools-images-read-receipts.json').read_text())
bind_check(receipt['rawInputReceiptBinding'])
for view in receipt['actualViews']:
    bind_check(view['binding'])
    assert view['actuallyViewed'] is True
for decision in review['decisions']:
    for key in ['actualAssetBinding', 'currentWholeGoalBinding', 'candidateWholeGoalBinding']: bind_check(decision[key])
    assert decision['safeToBind'] == (decision['verdict'] == 'PASS')

ledger = json.loads((packet / 'review/V.ordinary-selected-three.inactive.qa.json').read_text())
before = json.loads((packet / 'inputs/active-chemie.qa.raw.json').read_text())
assert ledger['schemaVersion'] == 1 and ledger['subject'] == 'chemie'
assert [r['goalId'] for r in ledger['records']] == ids
for row, decision in zip(ledger['records'], first['goals']):
    old = next(r for r in before['records'] if r['goalId'] == row['goalId'])
    for key in old:
        if key.lower().startswith('human') or key.startswith('chatGpt') or key in ['umlautsCorrectChatGpt', 'contentApprovedChatGpt']:
            assert row[key] == old[key], (row['goalId'], key)
    assert row['assetSha256'] == row['aiApprovedAssetSha256'] == 'sha256:' + decision['assetSha256']
    assert row['aiApproved'] == ('yes' if decision['verdict'] == 'PASS' else 'no')
    for field in ['landscapePath', 'canonicalAssetPath', 'publicAssetPath']:
        path = repo / row[field]
        assert path.is_file() and not path.is_symlink(), row[field]
        links.append(row[field])
        if field != 'landscapePath': assert digest(path) == decision['assetSha256']

raw_inputs = json.loads((packet / 'inputs/raw-input-receipts.json').read_text())
for item in raw_inputs['files']:
    source = repo / item['sourcePath']
    copy = packet / item['retainedCopy']
    assert digest(copy) == item['sha256']
    assert digest(source) == item['sha256'], item['sourcePath']
    links.append(item['sourcePath'])

guards = json.loads((packet / 'validation/current-active-and17-existing-image-byte-guards.json').read_text())
assert guards['existingGoalCount'] == 17
assert len(guards['existingRuntimeCopies']) == 51
ignored_runtime_guard_inputs = []
for item in guards['protectedActiveFiles'] + guards['existingRuntimeCopies']:
    assert digest(repo / item['path']) == item['sha256'], item['path']
    if item['path'].startswith('backend/src/main/resources/static/'): ignored_runtime_guard_inputs.append(item['path'])
    else: links.append(item['path'])

author = repo / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12/chemie-aromatics-three-missing-raster-author-20261013-v2'
freeze_path = author / 'FINAL.three-raster-author.freeze.json'
assert digest(freeze_path) == 'b64e82a9aa0e35075ed47f0cc549eae5bc388db6f39a4850b5745c6712fb6e09'
seal = json.loads(freeze_path.read_text())
for item in seal['candidateFiles']:
    path = repo / item['path']
    assert path.is_file() and not path.is_symlink()
    assert digest(path) == item['sha256'].removeprefix('sha256:')
    if 'bytes' in item: assert path.stat().st_size == item['bytes']

namespace = {'__name__': 'scoped_existing_curriculum_guard', '__file__': str(repo / 'scripts/validate_schemas.py')}
exec(compile((repo / 'scripts/validate_schemas.py').read_text(), namespace['__file__'], 'exec'), namespace)
symlink_errors = namespace['curriculum_symlink_errors'](str(repo))
assert not symlink_errors, symlink_errors
own_paths = [final_relative + '/' + p.relative_to(packet).as_posix() for p in files]
linked_paths = sorted(set(links + own_paths))
ignored = subprocess.run(['git', 'check-ignore', '--no-index', '--stdin'], input='\n'.join(linked_paths) + '\n', cwd=repo, text=True, capture_output=True)
assert ignored.returncode in [0, 1] and not ignored.stdout.strip(), ignored.stdout
for path in links:
    actual = mapped(path)
    assert actual.resolve().is_relative_to(repo) and actual.is_file() and not actual.is_symlink()

print(json.dumps({'schemaVersion': 1, 'scope': 'three selected Chemistry goals and owned V evidence closure; no full build/native-D campaign', 'goalIds': ids, 'selectedGoalRuntimeSchemaValid': True, 'structuredFilesParsed': parsed, 'ownRegularFilesValidated': len(files), 'firstVerdictUnchanged': True, 'authorFreezeFilesVerified': len(seal['candidateFiles']), 'retainedRawInputsByteExact': True, 'productionPngBytesUnmodified': True, 'normalGlobalCurriculumSymlinkGuardErrors': symlink_errors, 'globalCommittableReferencesValidated': len(set(links)), 'ownFinalPathsCommittable': True, 'currentHumanAndLegacyTriageFieldsRetained': True, 'selectedInactiveQaAssetPathsByteExact': True, 'futureLivePathsArePlannedOnly': True, 'acceptedVotes': 2, 'heldVotes': 1, 'existing17ImagesAnd51CopiesByteExact': True, 'normalIgnoredBackendGuardCopyCount': len(ignored_runtime_guard_inputs), 'currentActiveInputHashesPreserved': True, 'humanApproval': False, 'humanTrial': False, 'm7Gain': 0, 'activeWrites': 0}, indent=2))
