# SPDX-License-Identifier: Apache-2.0
"""Run unmodified normal import in a disposable repository; publish only own candidates."""
import copy
import datetime
import hashlib
import importlib.util
import json
import os
import pathlib
import shutil
import subprocess
import tempfile

ROOT = pathlib.Path.cwd()
OWN = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/chemie-q3-three-BW-practical-companion-rasters-author-candidate-v1'
NORMAL = OWN / 'normal'
NORMAL.mkdir(exist_ok=True)


def binding(path):
    data = path.read_bytes()
    return {'path': str(path.relative_to(ROOT)), 'sha256': hashlib.sha256(data).hexdigest(), 'bytes': len(data)}


def write_json(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    text = json.dumps(value, ensure_ascii=False, indent=2) + '\n'
    json.loads(text)
    temporary = pathlib.Path(str(path) + '.writing')
    temporary.write_text(text, encoding='utf-8')
    os.replace(temporary, path)


source = OWN / 'candidate/full484-381.before-images.inactive-canonical.json'
destination = OWN / 'candidate/full484-381.with-three-image-candidates.inactive-canonical.json'
before = json.loads(source.read_text())
rows = json.loads((OWN / 'three-selected-assets-and-accessible-metadata.author-candidate.json').read_text())['rows']
keep_receipt = json.loads((OWN / 'before-generation-whole-goal-material-and-KEEP-style.actual-read.json').read_text())
for frozen in keep_receipt['actualWholeDEENGoalsAndSixDEENCasesRead'] + keep_receipt['wholeTheoryParentImagesKEEP'] + [keep_receipt['actualFriendlyChemistryStylePNGSeen']]:
    assert binding(ROOT / frozen['path']) == frozen

active_paths = [ROOT / 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json']
active_before = [binding(p) for p in active_paths]
for row in rows:
    for prefix in ['curricula/DE/Gymnasium/visualizations/chemie', 'app/public/assets/goal-visualizations/chemie', 'backend/src/main/resources/static/assets/goal-visualizations/chemie']:
        assert not (ROOT / prefix / row['goalId']).exists()

import_results = []
with tempfile.TemporaryDirectory(prefix='skillpilot-chem3-image-import-', dir=ROOT / 'tmp') as temporary_directory:
    capsule = pathlib.Path(temporary_directory)
    (capsule / 'scripts').mkdir()
    (capsule / 'candidate').mkdir()
    for name in ['import_goal_visualization.mjs', 'goal_visualization_common.mjs']:
        shutil.copyfile(ROOT / 'scripts' / name, capsule / 'scripts' / name)
        assert (capsule / 'scripts' / name).read_bytes() == (ROOT / 'scripts' / name).read_bytes()
    shutil.copyfile(source, capsule / 'candidate/landscape.json')
    for row in rows:
        gid = row['goalId']
        for key, filename in [('selectedPNG', gid + '.png'), ('actualFinalPrompt', 'actual-final-prompt.txt'), ('actualImageReconstruction', 'actual-image-reconstruction.txt')]:
            original = ROOT / row[key]['path']
            assert binding(original) == row[key]
            target = capsule / 'inputs' / gid / filename
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(original, target)
            assert original.read_bytes() == target.read_bytes()
        argv = ['node', 'scripts/import_goal_visualization.mjs', gid, f'inputs/{gid}/{gid}.png',
                '--landscape=candidate/landscape.json', '--subject=chemie',
                '--provider=OpenAI / ChatGPT-Codex built-in image_gen', '--review-status=pilot',
                '--license=CC-BY-4.0', f'--prompt=inputs/{gid}/actual-final-prompt.txt',
                f'--reconstruction-prompt=inputs/{gid}/actual-image-reconstruction.txt',
                '--alt-text=' + row['altTextDe'], '--description=' + row['captionDe']]
        actual = subprocess.run(argv, cwd=capsule, capture_output=True)
        stdout = NORMAL / gid / 'import.stdout.actual.txt'
        stderr = NORMAL / gid / 'import.stderr.actual.txt'
        stdout.parent.mkdir(parents=True, exist_ok=True)
        stdout.write_bytes(actual.stdout)
        stderr.write_bytes(actual.stderr)
        assert actual.returncode == 0, actual.stderr.decode()
        write_json(NORMAL / gid / 'import.terminal.actual.json', {
            'schemaVersion': 1, 'codeLicense': 'Apache-2.0', 'kind': 'captured-command-output',
            'command': {'argv': argv, 'cwd': '.', 'exitCode': actual.returncode},
            'executionDirectoryMeaning': 'Root of disposable isolated repository, not active workspace; inputs and helpers are exact regular-file copies',
            'capturedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(),
            'stdout': binding(stdout), 'stderr': binding(stderr),
            'unmodifiedNormalImportScript': binding(ROOT / 'scripts/import_goal_visualization.mjs'),
            'unmodifiedNormalCommonScript': binding(ROOT / 'scripts/goal_visualization_common.mjs')})
        generated_source = capsule / 'curricula/DE/Gymnasium/visualizations/chemie' / gid
        own_source = OWN / 'source-assets/chemie' / gid
        own_source.mkdir(parents=True, exist_ok=True)
        copies = []
        for path in generated_source.iterdir():
            assert path.is_file() and not path.is_symlink()
            own_path = own_source / path.name
            shutil.copyfile(path, own_path)
            assert path.read_bytes() == own_path.read_bytes()
            copies.append(binding(own_path))
        actual_png = generated_source / (gid + '.png')
        assert actual_png.read_bytes() == (ROOT / row['selectedPNG']['path']).read_bytes()
        for prefix in ['app/public/assets/goal-visualizations/chemie', 'backend/src/main/resources/static/assets/goal-visualizations/chemie']:
            assert (capsule / prefix / gid / (gid + '.png')).read_bytes() == actual_png.read_bytes()
        import_results.append({'goalId': gid, 'actualNormalImportExitCode': actual.returncode,
                               'sourcePublicBackendCapsulePNGBytesEqual': True,
                               'ownSourceAssets': copies})
    after = json.loads((capsule / 'candidate/landscape.json').read_text())
    write_json(destination, after)

masked = copy.deepcopy(after)
by_old = {g['id']: g for g in before['goals']}
selected = {r['goalId'] for r in rows}
changed = []
for goal in masked['goals']:
    old = by_old[goal['id']]
    if goal != old:
        changed.append(goal['id'])
        assert goal['id'] in selected
        assert {k for k in set(goal) | set(old) if goal.get(k) != old.get(k)} == {'resourceLinks'}
        assert len(goal['resourceLinks']) == 1 and not old['resourceLinks']
        link = goal['resourceLinks'][0]
        assert link['skillpilotId'] == goal['id'] and link['reviewStatus'] == 'pilot'
        assert link['license'] == 'CC-BY-4.0'
        goal['resourceLinks'] = old['resourceLinks']
assert set(changed) == selected and masked == before
assert [binding(p) for p in active_paths] == active_before
for frozen in keep_receipt['wholeTheoryParentImagesKEEP']:
    assert binding(ROOT / frozen['path']) == frozen

spec = importlib.util.spec_from_file_location('existing_validator', ROOT / 'scripts/validate_schemas.py')
validator = importlib.util.module_from_spec(spec)
spec.loader.exec_module(validator)
schema = json.loads((ROOT / 'docs/landscape-runtime.schema.json').read_text())
jsons = list(OWN.rglob('*.json'))
for path in jsons:
    assert validator.validate_file(str(path.relative_to(ROOT)), schema), path
for path in OWN.rglob('*'):
    assert not path.is_symlink(), path
write_json(NORMAL / 'actual-normal-import-and-whole-preservation.result.json', {
    'schemaVersion': 1, 'codeLicense': 'Apache-2.0', 'contentLicense': 'CC-BY-4.0',
    'status': 'PASS_normal_isolated_import_and_exact_candidate_preservation',
    'checkedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(),
    'fullBeforeLandscape': binding(source), 'fullAfterLandscape': binding(destination),
    'wholeGoalCount': len(before['goals']), 'changedOnlyThreeNewResourceLinks': changed,
    'remaining481WholeGoalBodiesExact': True, 'everyOtherFieldOfThreeNewGoalsExact': True,
    'actualUnmodifiedImportResults': import_results, 'temporaryCapsuleRemoved': True,
    'noSymlinks': True, 'normalExistingValidatorUnmodified': True, 'qualityJSONFilesParsed': len(jsons),
    'activeChemistryCanonicalByteExact': True, 'allThreeTheoryParentPNGBytesKEEP': True,
    'noActiveSourcePublicBackendCandidatesWritten': True,
    'authorReviewDoesNotSupplyIndependentV': True, 'independentVAndNativeDPReviewPending': True,
    'newStrictClosures': 0, 'restoredBindings': 0, 'humanApproval': False, 'humanTrial': False,
    'publicationOrDeployment': False, 'fullRepositorySchemaRunClaim': False})
print('PASS: 3 genuine normal isolated imports; only three new candidate resourceLinks; every other whole field preserved; active canonical and parent images exact.')
