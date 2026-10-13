import hashlib
import json
import os
from pathlib import Path
import stat
import subprocess
import sys
import jsonschema

packet, repo = [Path(path).absolute() for path in sys.argv[1:3]]

def sha(path):
    return 'sha256:' + hashlib.sha256(path.read_bytes()).hexdigest()

def load(path):
    return json.loads(path.read_text())

def exact(binding):
    path = repo / binding['path']
    assert path.is_file() and not path.is_symlink(), str(path)
    assert sha(path) == binding['sha256'], str(path)
    if 'bytes' in binding:
        assert path.stat().st_size == binding['bytes'], str(path)

private = Path(load(packet / 'checks/private-validation-capsule.actual.json')['privateValidationCapsule'])
for path in [private, *private.parents]:
    mode = path.lstat().st_mode
    assert stat.S_ISDIR(mode) and not stat.S_ISLNK(mode), str(path)
    assert not mode & 0o022, str(path)
assert private.stat().st_uid == os.getuid()
assert not private.is_relative_to(repo / 'curricula')

files = sorted(path for path in packet.rglob('*') if path.is_file())
assert all(stat.S_ISREG(path.lstat().st_mode) and not path.is_symlink() for path in files)
parsed = 0
for path in files:
    if path.suffix == '.json':
        load(path)
        parsed += 1
    elif path.suffix == '.jsonl':
        for line in path.read_text().splitlines():
            if line.strip(): json.loads(line)
        parsed += 1

first_seal = load(packet / 'FIRST.three-actual-native-mobile-V.seal.json')
exact(first_seal['binding'])
first = load(packet / 'FIRST.three-actual-native-mobile-V.frozen.json')
assert not first['authoredAnySelectedAsset']
assert not first['readAuthorActualSelfinspection'] and not first['readTargetPeerVerdicts']
assert [row['verdict'] for row in first['findings']] == ['HOLD', 'PASS', 'HOLD']
ids = [row['goalId'] for row in first['findings']]
for binding in first['guidanceBindings']: exact(binding)
for binding in first['viewed']: exact(binding)

author_path = packet / 'inputs/FINAL.author-three-raster.seal.json'
assert sha(author_path) == 'sha256:4eb60f7e338c9b93b3ae3d5edc4f3f3e64db54f448a0e2a51742cea574c79484'
author = load(author_path)
for binding in author['fileBindings']: exact(binding)

current = load(packet / 'inputs/current-three-whole-goals.json')
candidate = load(packet / 'inputs/candidate-three-whole-goals.json')
schema = load(packet / 'inputs/landscape-runtime.schema.json')
goal_schema = {'$schema': schema['$schema'], '$defs': schema['$defs'], '$ref': '#/$defs/goal'}
for goal_id in ids:
    old = next(goal for goal in current if goal['id'] == goal_id)
    new = next(goal for goal in candidate if goal['id'] == goal_id)
    assert {key: value for key, value in old.items() if key != 'resourceLinks'} == {
        key: value for key, value in new.items() if key != 'resourceLinks'}
    jsonschema.Draft202012Validator(goal_schema).validate(new)

guards = load(packet / 'checks/current-active-and-protected-source-public-backend-byte-guards.json')
for binding in guards['protectedActiveFiles'] + guards['existingAssetCopies']: exact(binding)
assert len(guards['existingAssetCopies']) == guards['existingActiveResourceCount'] * 3
config = load(packet / 'review/V.independent.config.json')
assert config['acceptedGoalIds'] == [ids[1]]
assert config['heldGoalIds'] == [ids[0], ids[2]]
assert config['doNotActivateHeldCandidate'] and config['inactive']
exact(config['firstVerdictBinding'])
exact(config['candidateLandscapeBinding'])
for binding in config['actualAssetBindings']: exact(binding)
for key in ['visualizationQaCandidatePath', 'futureLiveRowsPath']:
    assert (repo / config[key]).is_file()

namespace = {'__name__': 'scoped_existing_curriculum_guard', '__file__': str(repo / 'scripts/validate_schemas.py')}
exec(compile((repo / 'scripts/validate_schemas.py').read_text(), namespace['__file__'], 'exec'), namespace)
symlink_errors = namespace['curriculum_symlink_errors'](str(repo))
assert not symlink_errors, symlink_errors

links = set(binding['path'] for binding in first['guidanceBindings'] + first['viewed']
    + author['fileBindings'] + config['actualAssetBindings'])
links.update(binding['path'] for binding in guards['protectedActiveFiles'] + guards['existingAssetCopies']
    if not binding['path'].startswith('backend/src/main/resources/static/'))
links.update(config[key] for key in ['visualizationQaCandidatePath', 'futureLiveRowsPath'])
links.update(path.relative_to(repo).as_posix() for path in files)
ignored = subprocess.run(['git', 'check-ignore', '--no-index', '--stdin'], input='\n'.join(sorted(links)) + '\n',
    cwd=repo, text=True, capture_output=True)
assert ignored.returncode in [0, 1] and not ignored.stdout.strip(), ignored.stdout
for relative in links:
    path = repo / relative
    assert path.is_file() and not path.is_symlink() and path.resolve().is_relative_to(repo), relative

print(json.dumps({'schemaVersion': 1, 'scope': 'three selected Chemistry V candidates and owned evidence closure',
    'selectedGoalRuntimeSchemaValid': True, 'structuredFilesParsed': parsed, 'ownRegularFilesValidated': len(files),
    'firstVerdictUnchanged': True, 'authorOwnSealBindingsValid': len(author['fileBindings']),
    'globalCurriculumCommittableSymlinkGuardErrors': symlink_errors, 'globalCommittableReferenceCount': len(links),
    'privateCapsuleParentsRegularAndNoGroupWorldWrite': True,
    'existing397ActiveImagesAnd1191CopiesByteExact': True, 'eightActiveContextBindingsByteExact': True,
    'normalIgnoredBackendRuntimeGuardBindings': guards['existingActiveResourceCount'],
    'original466JpgRetained': True, 'nineOtherKeepAndThreeOtherMobileHoldBytesRetained': True,
    'candidateNonVisualizationGoalFieldsUnchanged': True, 'fullBuildOrNativeDCampaignRun': False,
    'activeWrites': 0, 'gitWrites': 0, 'humanApproval': False, 'humanTrial': False, 'strictM7Gain': 0}, indent=2))
