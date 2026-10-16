# SPDX-License-Identifier: Apache-2.0
"""Guarded final full426 model + one unchanged bounded Native Prepare/Check.

Run only after the root explicitly releases stable final inputs. No reviews,
resolutions, source registrations, Central report, active writes or git commands.
"""
from pathlib import Path
import datetime
import hashlib
import json
import os
import shutil
import subprocess
import sys
import time

REPO = Path.cwd()
OWN = Path(__file__).resolve().parents[1]
REL = OWN.relative_to(REPO).as_posix()
E = OWN.parent
HOST = REPO / 'tmp/chemie-m7-resumed-20261015/bcp-current426-native24-final-own-host-v1'


def load(path):
    return json.loads(path.read_text())


def ref(path):
    body = path.read_bytes()
    return {'path': path.relative_to(REPO).as_posix(), 'sha256': 'sha256:' + hashlib.sha256(body).hexdigest(), 'bytes': len(body)}


def verify(value):
    path = REPO / value['path']
    actual = ref(path)
    assert actual['sha256'] == value['sha256'] and actual['bytes'] == value['bytes'], path
    return path


def put(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    assert not path.exists(), path
    with path.open('x') as handle:
        json.dump(value, handle, ensure_ascii=False, indent=2)
        handle.write('\n')


assert REPO.joinpath('AGENTS.md').is_file()
assert len(sys.argv) == 2, 'Usage: python scripts/run_final_once.py <exact-final-input-release.json>'
release_path = Path(sys.argv[1]).resolve()
released = load(release_path)
assert released['finalInputsExplicitlyReleased'] is True
assert released['authorizedNativePrepareRuns'] == released['authorizedNativeCheckRuns'] == 1
assert released['allowPrivateReadOnlySelectedImageHardlinks'] is True
assert not HOST.exists()
assert not (OWN / 'native-twenty-four').exists()
assert not (OWN / 'checks/FINAL.exactly-once.started.json').exists()
for key in ['canonical', 'semantic', 'qa', 'finalInputSelector']:
    verify(released[key])

frozen_selector_path = E / 'chemie-bcp-current426-ten-images-final-candidate-freeze-technical-20261015-v1/INPUTS.frozen-current426-ten-child-images.technical.selector.json'
frozen = load(frozen_selector_path)
original = load(verify(frozen['canonical']))
current = load(verify(released['canonical']))
old_by = {row['id']: row for row in original['goals']}
new_by = {row['id']: row for row in current['goals']}
assert len(old_by) == len(new_by) == 570 and old_by.keys() == new_by.keys()
allowed_removed = set(released['withdrawnClusterImageGoalIds'])
assert len(allowed_removed) == 5
changed = {gid for gid in old_by if old_by[gid] != new_by[gid]}
assert changed == allowed_removed, changed
for gid in changed:
    expected = dict(old_by[gid])
    links = [row for row in expected['resourceLinks'] if row['type'] != 'goal-visualization']
    expected['resourceLinks'] = links
    assert expected == new_by[gid], gid

context_path = E / 'chemie-bcp-full426-single-placement-qs-view-pure-context-author-20261015-v1/NEUTRAL.finite-full426-single-placement-QS-context.selector.json'
context = load(context_path)
view = context['singlePlacementWhole426View']
verify(view)
relation_info = load(verify(context['result']))
nine = relation_info['old373D']['newWholeBookContextActualRelationDifferences']
assert len(nine) == len(set(nine)) == 9
pam_path = E / 'chemie-bcp-current426-normal-PAM-preparation-technical-20261015-v1/FIRST.technical-input-selection.before-normal-binding.json'
pam = load(pam_path)
profiles = pam['profileSelection']
fifteen = [row['goalId'] for row in profiles]
assert len(fifteen) == len(set(fifteen)) == 15 and not set(fifteen).intersection(nine)
for row in profiles:
    verify(row['container'])
selected = fifteen + nine
assert len(selected) == len(set(selected)) == 24

baseline_selector_path = E / 'chemie-source4-current422-bounded-inactive-integration-technical-20261015-v1/OUTPUTS.finite-source4-current422-inactive-integration.final-selector.json'
baseline_selector = load(baseline_selector_path)
base_map_path = verify(baseline_selector['finalHostMap'])
base_map = load(base_map_path)
image_map = load(verify(context['tenActualImageSources']))
assets_by_id = {row['goalId']: dict(row) for row in base_map['selectedCurrentAssetRows']}
for image in image_map['rows']:
    url = image['imageUrl']
    assets_by_id[image['goalId']] = {
        'goalId': image['goalId'], 'physicalRepositorySource': image['physicalRepositorySource'],
        'normalPublicDestination': 'app/public' + url,
        'normalCanonicalDestination': 'curricula/DE/Gymnasium/visualizations/' + url.split('/assets/goal-visualizations/', 1)[1],
    }
assets = list(assets_by_id.values())
assert all(gid in assets_by_id for gid in selected)
for gid in selected:
    verify(assets_by_id[gid]['physicalRepositorySource'])
for row in assets:
    assert (REPO / row['physicalRepositorySource']['path']).is_file(), row
assets_by_public = {row['normalPublicDestination']: row for row in assets}
for record in load(verify(released['qa']))['records']:
    if record['visualizationState'] == 'available':
        assert record['publicAssetPath'] == 'app/public' + record['imageUrl'], record['goalId']
        assert record['publicAssetPath'] in assets_by_public, record['publicAssetPath']

# Only exact copies of stock code are executable below the private root. Module
# real paths must remain here because unchanged tools derive repository root there.
modules = base_map['stockPhysicalModules']
for row in modules:
    verify(row)
aliases = [
    {'normalHostAlias': 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json', 'physicalRepositorySource': released['canonical']},
    {'normalHostAlias': 'curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json', 'physicalRepositorySource': released['semantic']},
    {'normalHostAlias': 'curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json', 'physicalRepositorySource': released['qa']},
    {'normalHostAlias': 'curricula/DE/Gymnasium/quality/goal-description-review/chemie/review-views/chemie-m7-full-canonical.view.json', 'physicalRepositorySource': view},
]
positive_criteria = ref(REPO / 'curricula/DE/Gymnasium/quality/goal-evidence/prompts/chemistry-positive-understanding-evidence-profile-criteria-v1.md')
plan = {
    'schemaVersion': 1, 'role': 'Stable final Native24 technical inputs only; no scientific votes',
    'finalInputsExplicitlyReleased': True,
    'technicalInputBoundAtUTC': datetime.datetime.now(datetime.timezone.utc).isoformat(),
    'executionHost': HOST.relative_to(REPO).as_posix(),
    'canonical': released['canonical'], 'semantic': released['semantic'], 'qa': released['qa'],
    'globalQaApprovalCoverage': released['globalQaApprovalCoverage'],
    'finalRelease': ref(release_path), 'frozenSelector': ref(frozen_selector_path),
    'contextSelector': ref(context_path), 'contextView': view,
    'baselineSelector': ref(baseline_selector_path), 'baselinePhysicalMap': baseline_selector['finalHostMap'],
    'profileSelection': profiles, 'positiveCriteria': positive_criteria,
    'newTenGoalIds': fifteen[:10], 'retainedFiveGoalIds': fifteen[10:],
    'changedRelationNineGoalIds': nine, 'selectedGoalIds': selected, 'assets': assets,
    'fullBaseConfigPath': REL + '/config/full426.normal-stock-base.config.json',
    'nativeConfigDraftPath': REL + '/config/native24.draft-before-actual-order.config.json',
    'nativeConfigPath': REL + '/config/native24.final-once.normal-prepare.config.json',
    'scientificVotes': 0, 'oldDRewrites': 0, 'activeChanges': False,
}
put(OWN / 'checks/INPUTS.final-stable-native24.technical.json', plan)
put(OWN / 'checks/FINAL.exactly-once.started.json', {
    'finalStableInputs': ref(OWN / 'checks/INPUTS.final-stable-native24.technical.json'),
    'fullModelFunctionCallsMaximum': 1, 'NativePrepareMaximum': 1, 'NativeCheckMaximum': 1,
    'historicalDReadOrRewritten': False,
})
HOST.mkdir(parents=True)
for item in REPO.iterdir():
    if item.name not in ['app', 'tmp', '.git']:
        (HOST / item.name).symlink_to(item, target_is_directory=item.is_dir())
(HOST / 'app').mkdir()
for item in (REPO / 'app').iterdir():
    if item.name not in ['scripts', 'public']:
        (HOST / 'app' / item.name).symlink_to(item, target_is_directory=item.is_dir())
(HOST / 'app/scripts').mkdir()
(HOST / 'app/public').mkdir()


def branch(path):
    if path.is_symlink():
        entries = list(path.resolve().iterdir())
        path.unlink()
        path.mkdir()
        for entry in entries:
            (path / entry.name).symlink_to(entry, target_is_directory=entry.is_dir())
    elif not path.exists():
        path.mkdir()


def install(source, relative, mode='symlink'):
    path = HOST / relative
    parent = HOST
    for part in path.relative_to(HOST).parts[:-1]:
        parent /= part
        branch(parent)
    if path.is_symlink() or path.is_file():
        path.unlink()
    if mode == 'stock-code-copy':
        shutil.copyfile(source, path)
    elif mode == 'immutable-selected-image-hardlink':
        # Renderer only reads these. Never chmod or open them for writing.
        os.link(source, path)
        assert source.stat().st_ino == path.stat().st_ino
    else:
        path.symlink_to(source)


for row in modules:
    install(verify(row), row['path'], 'stock-code-copy')
for row in aliases:
    install(verify(row['physicalRepositorySource']), row['normalHostAlias'])
for row in assets:
    source = REPO / row['physicalRepositorySource']['path']
    assert source.is_file()
    install(source, row['normalPublicDestination'], 'immutable-selected-image-hardlink' if row['goalId'] in selected else 'symlink')
    install(source, row['normalCanonicalDestination'])
legacy = load(verify(base_map['legacyQaDispositionDiscoveryInput']))
assert legacy['selectedChemistryLegacyMarkdownCount'] == 0 and legacy['rows'] == []
legacy_dir = HOST / 'curricula/DE/Gymnasium/quality/goal-visualization-review'
assert legacy_dir.is_symlink()
legacy_dir.unlink()
legacy_dir.mkdir()
put(OWN / 'checks/REBUILD.final-native24.private-readonly-host.physical-map.json', {
    'executionHost': plan['executionHost'], 'stockPhysicalModules': modules,
    'aliases': aliases, 'assets': assets, 'selectedHardlinkGoalIds': selected,
    'stockCodeRegularBytes': sum(row['bytes'] for row in modules),
    'duplicatedImageBytes': 0, 'immutableHardlinkedImageLogicalBytes': sum(assets_by_id[gid]['physicalRepositorySource']['bytes'] for gid in selected),
    'canonicalSemanticQACopies': 0, 'sourceMediaWrites': 0,
    'legacyQaDispositionDiscoveryInput': base_map['legacyQaDispositionDiscoveryInput'],
})
book_id = 'chemie-bcp-current426-native24-technical-20261015-v1'
put(OWN / 'config/full426.normal-stock-base.config.json', {
    'schemaVersion': 1, 'bookId': book_id + '-full-base', 'title': 'Chemie – vollständiger aktueller QS-Kontext',
    'landscapePath': aliases[0]['normalHostAlias'], 'compositionViewPath': aliases[3]['normalHostAlias'],
    'semanticKindLedgerPath': aliases[1]['normalHostAlias'], 'goalVisualizationQaPath': aliases[2]['normalHostAlias'],
    'publicationMode': 'review', 'atlasBaseUrl': 'https://skillpilot.com/lernzielbuch',
    'evidenceReviewPaths': [REL + '/profiles/fifteen-whole-author-bodies.raw-E0G0.actual-resources.technical.jsonl'],
    'outputPath': REL + '/full426/book-model.json',
})
put(OWN / 'config/native24.draft-before-actual-order.config.json', {
    '$schema': 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-rollout-batch-config.schema.json',
    'schemaVersion': 1, 'batchId': book_id, 'subject': 'chemie', 'subjectLabel': 'Chemie',
    'bookId': book_id, 'title': 'Chemie – 15 BcP-Ziele und neun Beziehungskontexte',
    'baseGoalBookConfigPath': plan['fullBaseConfigPath'], 'goalIds': selected,
    'outputDirectory': REL + '/native-twenty-four', 'feedbackBaseUrl': 'https://skillpilot.com/lernziel-feedback',
    'promptPath': 'curricula/DE/Gymnasium/quality/goal-evidence/prompts/goal-description-understanding-evidence-review-v2.md',
    'criteriaPath': 'curricula/DE/Gymnasium/quality/goal-evidence/prompts/chemistry-goal-description-understanding-evidence-review-criteria-v1.md',
    'printDerivativeProfile': 'bounded-atlas',
})


def command(label, argv):
    start = datetime.datetime.now(datetime.timezone.utc).isoformat()
    clock = time.monotonic()
    proc = subprocess.run(argv, cwd=HOST, capture_output=True)
    stdout = OWN / 'checks' / (label + '.stdout.actual.txt')
    stderr = OWN / 'checks' / (label + '.stderr.actual.txt')
    stdout.write_bytes(proc.stdout)
    stderr.write_bytes(proc.stderr)
    put(OWN / 'checks' / (label + '.command.actual.json'), {
        'argv': argv, 'cwd': plan['executionHost'], 'startedAtUTC': start,
        'completedAtUTC': datetime.datetime.now(datetime.timezone.utc).isoformat(),
        'elapsedSeconds': round(time.monotonic() - clock, 3), 'exitCode': proc.returncode,
        'stdout': ref(stdout), 'stderr': ref(stderr), 'actualInvocationNumber': 1,
        'newScientificVotes': 0, 'centralRuns': 0,
    })
    print(json.dumps({'label': label, 'exitCode': proc.returncode, 'elapsedSeconds': round(time.monotonic() - clock, 3)}), flush=True)
    if proc.returncode:
        raise SystemExit(proc.stderr.decode() + proc.stdout.decode())


tsx = str(REPO / 'app/node_modules/.bin/tsx')
command('FULL426.stock-function-and-RAW15', [tsx, str(OWN / 'scripts/bind_raw15_and_build_full426.mts')])
for mode in ['prepare', 'check']:
    command('NATIVE24.' + mode, [tsx, str(HOST / 'app/scripts/materializeGoalDescriptionRolloutBatch.ts'), mode, '--config', plan['nativeConfigPath']])
for value in [released['canonical'], released['semantic'], released['qa']]:
    verify(value)
for gid in selected:
    verify(assets_by_id[gid]['physicalRepositorySource'])
print(json.dumps({'technicalPreparationComplete': True, 'fullModelPages': 426, 'NativePages': 24, 'prepareRuns': 1, 'checkRuns': 1, 'newScienceVotes': 0, 'oldDRewrites': 0, 'activeWrites': 0}), flush=True)
