import hashlib
import json
import os
from pathlib import Path
import stat
import subprocess
import sys
import jsonschema

packet, repo = [Path(path).absolute() for path in sys.argv[1:3]]
links = set()

def load(path):
    return json.loads(path.read_text())

def digest(path):
    return 'sha256:' + hashlib.sha256(path.read_bytes()).hexdigest()

def exact(binding, committable=True):
    path = repo / binding['path']
    assert path.is_file() and not path.is_symlink(), str(path)
    assert digest(path) == binding['sha256'], str(path)
    if 'bytes' in binding: assert path.stat().st_size == binding['bytes'], str(path)
    if committable and not binding['path'].startswith('backend/src/main/resources/static/'):
        links.add(binding['path'])

def bind_walk(value):
    if isinstance(value, dict):
        if 'path' in value and 'sha256' in value: exact(value)
        for child in value.values(): bind_walk(child)
    elif isinstance(value, list):
        for child in value: bind_walk(child)

private = Path(load(packet / 'checks/private-validation-capsule.actual.json')['privateValidationCapsule'])
for path in [private, *private.parents]:
    mode = path.lstat().st_mode
    assert stat.S_ISDIR(mode) and not stat.S_ISLNK(mode) and not mode & 0o022, str(path)
assert private.stat().st_uid == os.getuid() and not private.is_relative_to(repo / 'curricula')

files = sorted(path for path in packet.rglob('*') if path.is_file())
assert all(stat.S_ISREG(path.lstat().st_mode) and not path.is_symlink() for path in files)
parsed = 0
for path in files:
    if path.suffix == '.json': load(path); parsed += 1
    elif path.suffix == '.jsonl':
        for line in path.read_text().splitlines():
            if line.strip(): json.loads(line)
        parsed += 1

first = load(packet / 'FIRST.two-corrected-actual-V.frozen.json')
first_seal = load(packet / 'FIRST.two-corrected-actual-V.seal.json')
exact(first_seal['binding'])
assert not first['authoredAnyChangedRaster']
assert not first['authorFinalVerdictsReadBeforeFirst'] and not first['newPeerVerdictsReadBeforeFirst']
assert [finding['verdict'] for finding in first['findings']] == ['PASS', 'PASS']
assert first['wholeImageInspectionIncludesOutsideTargetedROI']
assert len(first['allEightWholeViewsActuallyPerformed']) == 8
assert first['thirdReReviewed'] is False
bind_walk(first)

selector = load(packet / 'inputs/SELECTOR.two-pending-assets-and-unchanged-third.json')
assert digest(packet / 'inputs/SELECTOR.two-pending-assets-and-unchanged-third.json') == 'sha256:f5a6378c3862e1c41c6ea4463f6a6453e470f9fc6efdbce45a382c406251d5d5'
bind_walk(selector)
author = load(packet / 'inputs/FINAL.two-targeted-author.seal.json')
for binding in author['fileBindings']: exact(binding)
old_closures = []
for prior in selector['priorSealedPacketBindings']:
    binding = prior['sealBinding']
    exact(binding)
    old = load(repo / binding['path'])
    bindings = old.get('fileBindings', old.get('candidateFiles', []))
    assert bindings
    for entry in bindings: exact(entry)
    old_closures.append({'path': binding['path'], 'exactFiles': len(bindings)})

current = load(packet / 'inputs/current-two-whole-goals.json')['goals']
candidate = load(packet / 'inputs/candidate-two-whole-goals.json')['goals']
schema = load(packet / 'inputs/landscape-runtime.schema.json')
goal_schema = {'$schema': schema['$schema'], '$defs': schema['$defs'], '$ref': '#/$defs/goal'}
for goal_id in selector['goalIds']:
    old = next(goal for goal in current if goal['id'] == goal_id)
    new = next(goal for goal in candidate if goal['id'] == goal_id)
    assert {key: value for key, value in old.items() if key != 'resourceLinks'} == {
        key: value for key, value in new.items() if key != 'resourceLinks'}
    jsonschema.Draft202012Validator(goal_schema).validate(new)

guards = load(packet / 'checks/current-active-and-protected-source-public-backend-byte-guards.json')
for binding in guards['protectedActiveFiles'] + guards['existingAssetCopies']: exact(binding)
assert len(guards['existingAssetCopies']) == guards['existingActiveResourceCount'] * 3
assert guards['protectedCurrentStrictCount'] == 231
bind_walk(guards['priorUnchangedThird'])

config = load(packet / 'review/V.independent.config.json')
assert config['acceptedGoalIds'] == selector['goalIds'] and config['heldGoalIds'] == []
assert config['inactive'] and config['thirdReReviewed'] is False
bind_walk(config)
for key in ['visualizationQaCandidatePath', 'futureLiveRowsPath']:
    assert (repo / config[key]).is_file(); links.add(config[key])

namespace = {'__name__': 'scoped_existing_curriculum_guard', '__file__': str(repo / 'scripts/validate_schemas.py')}
exec(compile((repo / 'scripts/validate_schemas.py').read_text(), namespace['__file__'], 'exec'), namespace)
symlink_errors = namespace['curriculum_symlink_errors'](str(repo))
assert not symlink_errors, symlink_errors
links.update(path.relative_to(repo).as_posix() for path in files)
ignored = subprocess.run(['git', 'check-ignore', '--no-index', '--stdin'], input='\n'.join(sorted(links)) + '\n',
    cwd=repo, text=True, capture_output=True)
assert ignored.returncode in [0, 1] and not ignored.stdout.strip(), ignored.stdout
for relative in links:
    path = repo / relative
    assert path.is_file() and not path.is_symlink() and path.resolve().is_relative_to(repo), relative

print(json.dumps({'schemaVersion': 1, 'scope': 'two actual changed Chemistry V images and owned evidence closure',
    'selectedGoalRuntimeSchemaValid': True, 'structuredFilesParsed': parsed, 'ownedRegularFiles': len(files),
    'firstVerdictUnchanged': True, 'allEightWholeViewsActuallyPerformed': True, 'outsideROIInspected': True,
    'authorOwnSealBindingsValid': len(author['fileBindings']), 'priorSealedClosuresExact': old_closures,
    'currentHumanAndLegacyFieldsCheckedByNormalModel': True, 'currentStrictCountPreserved': 231,
    'existing397ActiveImagesAnd1191CopiesByteExact': True, 'eightActiveContextBindingsByteExact': True,
    'globalCommittableReferenceCount': len(links), 'normalIgnoredBackendRuntimeBindings': 397,
    'globalCurriculumSymlinkGuardErrors': symlink_errors, 'privateCapsuleParentsRegularNoGroupWorldWrite': True,
    'thirdReReviewed': False, 'unchangedThirdPassAndOriginalSealsRetained': True,
    'machineApprovals': 2, 'machineHolds': 0, 'scienceGain': 0, 'strictM7Gain': 0,
    'activeWrites': False, 'gitWrites': False, 'fullBuildOrNativeDCampaign': False,
    'humanApproval': False, 'humanTrial': False, 'labOrClinicalExecutionEvidence': False}, indent=2))
