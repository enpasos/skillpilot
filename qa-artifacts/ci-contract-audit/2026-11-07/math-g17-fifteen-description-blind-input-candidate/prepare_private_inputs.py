#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Prepare exactly fifteen native D pages; never select or run a rollout producer."""
from pathlib import Path
import gzip
import hashlib
import json
import os
import shutil
import subprocess
import tempfile
import time
from datetime import datetime, timezone

ROOT = Path(__file__).resolve().parents[4]
PACKAGE = Path(__file__).resolve().parent
REL = PACKAGE.relative_to(ROOT).as_posix()
SOURCE = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json'
KINDS = 'curricula/DE/Gymnasium/quality/release-model/mathematik.semantic-kinds.json'
PRIOR = ROOT / 'qa-artifacts/ci-contract-audit/2026-11-07/math-g17-fifteen-p-route-cold132-successor-candidate'
KIND_REVIEW = ROOT / 'qa-artifacts/ci-contract-audit/2026-11-07/math-g17-fifteen-semantic-kind-independent-review'
SOURCE_PACKAGE = ROOT / 'qa-artifacts/ci-contract-audit/2026-11-07/math-g17-fifteen-source-revision-candidate'
SOURCE_SHA = '9f3945e209e0cef503428e0a20c3c2302261346e35f533bf1264e525f16cdf96'
KINDS_SHA = 'b231f6fce8a1fe9a205ffd09d109d92362f89440bb55dec996b538b347c2cea4'


def sha(data):
    return hashlib.sha256(data).hexdigest()


def write(path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open('xb') as stream:
        stream.write(data)
        stream.flush()
        os.fsync(stream.fileno())


def js(path, data):
    write(path, (json.dumps(data, ensure_ascii=False, indent=2) + '\n').encode())


def pin(path):
    data = path.read_bytes()
    return {'path': path.relative_to(ROOT).as_posix(), 'sha256': sha(data), 'bytes': len(data)}


def assert_sealed(directory, receipt_sha=None, inventory_sha=None):
    if receipt_sha:
        assert sha((directory / 'receipt.json').read_bytes()) == receipt_sha
    if inventory_sha:
        assert sha((directory / 'inventory.json').read_bytes()) == inventory_sha
    rows = json.loads((directory / 'inventory.json').read_bytes())
    if isinstance(rows, dict):
        rows = rows['files']
    for row in rows:
        path = directory / row['path']
        assert path.is_file() and not path.is_symlink(), str(path)
        data = path.read_bytes()
        assert sha(data) == row['sha256'] and len(data) == row['bytes'], str(path)


def main():
    assert not (PACKAGE / 'packet').exists()
    assert_sealed(PRIOR, '1686711c3df95a7a7a376809ba88075b5dfa4388f977b94db93063c6c0c56ef0',
                  'a0ff2d286f89f9c2261906bf02042329e03e4730bf74684cb52cd3a87c701e0b')
    assert_sealed(KIND_REVIEW, inventory_sha='9b038283748baa976b473b6260ac5b43627f82fc36d4fd321a22c6bcf27249bb')
    source_bytes = gzip.decompress((SOURCE_PACKAGE / 'after-source.json.gz').read_bytes())
    assert sha(source_bytes) == SOURCE_SHA
    kinds_bytes = (KIND_REVIEW / 'mathematik.semantic-kinds.candidate.json').read_bytes()
    assert sha(kinds_bytes) == KINDS_SHA
    assert sha((ROOT / SOURCE).read_bytes()) == 'e4de3c3e3a294a1751d7ebcd70fa4e63a457a63e51016996055c0e78f4510a06'
    assert sha((ROOT / KINDS).read_bytes()) == '188ff969598df64e6f455c761f30f65240cba6ad6304558baaefd15b8d82baea'
    hold = json.loads((KIND_REVIEW / 'additional-D-freshness-hold.json').read_bytes())
    goal_ids = [row['goalId'] for row in hold['rows']]
    assert len(goal_ids) == len(set(goal_ids)) == 15
    source = json.loads(source_bytes)
    # Facts from the current source, with no earlier D/P review or source diff.
    write(PACKAGE / 'inputs/current-source.json', source_bytes)
    write(PACKAGE / 'inputs/current-semantic-kind-ledger.json', kinds_bytes)
    overview_path = ROOT / 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_OVERVIEW.de.json'
    overview = json.loads(overview_path.read_bytes())
    nodes = {}
    for landscape, path in [(source, SOURCE), (overview, overview_path.relative_to(ROOT).as_posix())]:
        for goal in landscape['goals']:
            assert goal['id'] not in nodes
            nodes[goal['id']] = (landscape, path, goal)
    parents = {key: [] for key in nodes}
    successors = {key: [] for key in nodes}
    for key, (_, _, goal) in nodes.items():
        for child in goal.get('contains', []):
            if child in nodes:
                parents[child].append(key)
        for prerequisite in goal.get('requires', []):
            if prerequisite in nodes:
                successors[prerequisite].append(key)
    direct_successors = set().union(*(set(successors[key]) for key in goal_ids))
    selected = set(goal_ids) | direct_successors
    todo = list(selected)
    while todo:
        key = todo.pop()
        goal = nodes[key][2]
        for other in parents[key] + goal.get('requires', []):
            if other in nodes and other not in selected:
                selected.add(other)
                todo.append(other)
    contexts = []
    for key in sorted(selected):
        landscape, path, goal = nodes[key]
        contexts.append({'goalId': key, 'landscapeId': landscape['landscapeId'],
                         'sourcePath': path, 'goal': goal,
                         'containingParentIds': parents[key],
                         'authoredPrerequisiteIds': goal.get('requires', []),
                         'isAssignedGoal': key in goal_ids,
                         'isDirectSuccessorOfAssignedGoal': key in direct_successors})
    js(PACKAGE / 'material-context/current-goal-and-parent-context.json', {
        'schemaVersion': 1, 'currentSourceSha256': SOURCE_SHA, 'assignedGoalIds': goal_ids,
        'selection': 'Assigned goals and their direct successors; recursive current contains ancestors and authored prerequisite closure in Mathematics plus canonical Overview. No personalization projection is inferred.',
        'sourcePins': [pin(PACKAGE / 'inputs/current-source.json'), pin(overview_path)],
        'goalContexts': contexts,
        'programUnits': source.get('programUnits', []),
        'goalPlacements': [p for p in source.get('goalPlacements', []) if p['goalId'] in selected],
        'competencyCatalog': source.get('competencyCatalog'),
        'descriptionOrPositiveReviewResultsIncluded': False,
        'scopeLimit': 'Canonical source payload and placement context only. sourceRef/applicability are not a complete source-mapping or effective projection proof.'})
    config = {
        '$schema': 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-rollout-batch-config.schema.json',
        'schemaVersion': 1, 'batchId': 'mathematik-fifteen-current-20261107-v1',
        'subject': 'mathematik', 'subjectLabel': 'Mathematik',
        'bookId': 'de-gym-math-fifteen-current-20261107-v1', 'title': 'Mathematik – fünfzehn Lernziele',
        'baseGoalBookConfigPath': 'app/scripts/config/goal-books/de-gym-math-national-atlas.json',
        'goalIds': goal_ids, 'outputDirectory': REL + '/packet',
        'feedbackBaseUrl': 'https://skillpilot.com/lernziel-feedback',
        'promptPath': 'curricula/DE/Gymnasium/quality/goal-evidence/prompts/goal-description-understanding-evidence-review-v2.md',
        'criteriaPath': 'curricula/DE/Gymnasium/quality/goal-evidence/prompts/mathematik-goal-description-understanding-evidence-review-criteria-v2.md',
        'printDerivativeProfile': 'bounded-atlas'}
    js(PACKAGE / 'batch.config.json', config)
    paths = {ROOT / row['path'] for row in json.loads(gzip.decompress((SOURCE_PACKAGE / 'protected-active-inputs.json.gz').read_bytes()))}
    for row in hold['rows']:
        for path in (ROOT / row['registeredIndex']['path']).parent.rglob('*'):
            if path.is_file():
                paths.add(path)
    paths.update(p for p in (ROOT / 'app/scripts').rglob('*') if p.is_file() and p.suffix in ('.ts', '.json'))
    protected = [pin(path) for path in sorted(paths)]
    write(PACKAGE / 'protected-before.json.gz', gzip.compress((json.dumps(protected) + '\n').encode(), mtime=0))
    W = Path(tempfile.mkdtemp(prefix='math-d15-prepare-', dir='/dev/shm'))
    old_workspace = Path(json.loads((PRIOR / 'private-workspace.json').read_bytes())['workspace'])
    # Exact prior finite transport/runtime candidates are present in this private frame.
    # prepare/check do not invoke V authority or the combined rollout producer.
    overlays = [(PACKAGE / 'inputs/current-source.json', ROOT / SOURCE),
                (PACKAGE / 'inputs/current-semantic-kind-ledger.json', ROOT / KINDS),
                (old_workspace / 'contracts-v1', ROOT / 'contracts/goal-visualization-context/v1'),
                (PRIOR / 'visualization_qualified_context_capsule.candidate.py', ROOT / 'scripts/visualization_qualified_context_capsule.py'),
                (PRIOR / 'goalVisualizationMath58Contexts.candidate.ts', ROOT / 'app/scripts/lib/goalVisualizationMath58Contexts.ts'),
                (PRIOR / 'qualifiedVisualizationContextAuthority.candidate.ts', ROOT / 'app/scripts/lib/qualifiedVisualizationContextAuthority.ts'),
                (PRIOR / 'registry.json', ROOT / 'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json')]
    commands = []
    js(PACKAGE / 'private-frame.json', {'workspace': str(W), 'sourceSha256': SOURCE_SHA, 'kindLedgerSha256': KINDS_SHA,
        'exactPredecessor': {'receipt': pin(PRIOR / 'receipt.json'), 'inventory': pin(PRIOR / 'inventory.json')},
        'kindReview': {'receipt': pin(KIND_REVIEW / 'receipt.json'), 'inventory': pin(KIND_REVIEW / 'inventory.json')},
        'overlays': [{'input': str(a), 'target': str(b), **({'sha256': sha(a.read_bytes()), 'bytes': a.stat().st_size} if a.is_file() else {'kind': 'directory'})} for a, b in overlays],
        'producerRuns': 0, 'reviewRecordsAuthored': 0, 'nativeContextGoalCount': len(contexts)})
    for mode in ('prepare', 'check'):
        command = ['bwrap', '--die-with-parent', '--unshare-net', '--ro-bind', '/', '/', '--proc', '/proc', '--dev-bind', '/dev', '/dev',
                   '--tmpfs', '/tmp', '--bind', str(PACKAGE), str(PACKAGE), '--bind', str(W), str(W), '--setenv', 'TMPDIR', str(W)]
        for a, b in overlays:
            command += ['--ro-bind', str(a), str(b)]
        command += ['--chdir', str(ROOT), '--', str(ROOT / 'app/node_modules/.bin/tsx'),
                    'app/scripts/materializeGoalDescriptionRolloutBatch.ts', mode, '--config', REL + '/batch.config.json']
        started = datetime.now(timezone.utc).isoformat()
        begin = time.monotonic()
        with (PACKAGE / (mode + '.stdout')).open('xb') as out, (PACKAGE / (mode + '.stderr')).open('xb') as err:
            result = subprocess.run(command, stdout=out, stderr=err)
        commands.append({'mode': mode, 'command': command, 'startedAtActualUTC': started,
                         'finishedAtActualUTC': datetime.now(timezone.utc).isoformat(), 'exitCode': result.returncode,
                         'elapsedSeconds': time.monotonic() - begin})
        (PACKAGE / 'preparation.execution.json').write_text(json.dumps(commands, indent=2) + '\n')
        print(mode, result.returncode, 'elapsed', commands[-1]['elapsedSeconds'], flush=True)
        assert result.returncode == 0, (PACKAGE / (mode + '.stderr')).read_text()[-6000:]
    for row in protected:
        assert pin(ROOT / row['path']) == row, row['path']
    js(PACKAGE / 'postguard.json', {'protectedFiles': len(protected), 'allBytesUnchanged': True,
        'activeSourceOrCodeOrLedgerWrites': False, 'reviewRecordsAuthored': 0, 'combinedProducerRuns': 0,
        'fullCqrProducerRuns': 0, 'sourceAProbes': 0, 'gitWrites': 0})


if __name__ == '__main__':
    main()
