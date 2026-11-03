#!/usr/bin/env python3
"""Materialize only independently reviewed selected Math assessment references."""
import argparse
import collections
import copy
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_CAPSULE = Path('docs/qa-ci/evidence/curriculum-completion-integrity/2026-11-01/existing-endpoint-restoration')
LEGACY_RECEIPT_SHA256 = 'bd51126f07965a470e5b0ad9b2a485dcc43c043492dec791e9cccf1be284a1e4'
LEGACY_RAW_REPORT = 'backend/build/reports/curriculum-completion-integrity.json'
LEGACY_RAW_REPORT_SHA256 = 'b2ce7e8bd94000a7ced80d052b8f7ec39cad2394d2335b5039f72c2a84ee8b98'


def require(condition, message):
    if not condition:
        raise ValueError(message)


def file_sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def repository_path(value):
    path = (ROOT / value).resolve()
    require(path.is_relative_to(ROOT), f'Path escapes repository: {value}')
    return path


def read(path):
    return json.loads(path.read_text())


def sha(value):
    return hashlib.sha256(json.dumps(value, sort_keys=True, ensure_ascii=False,
                                     separators=(',', ':')).encode()).hexdigest()


def structures(nodes, structure_id):
    result = []
    for node in nodes:
        if node.get('kind') == 'structure':
            if node['id'] == structure_id:
                result.append(node)
            result.extend(structures(node['children'], structure_id))
    return result


def anchor_for(view, operation):
    found = structures(view['rootNodes'], operation['placement']['anchorStructureId'])
    require(len(found) == 1, f"Missing or ambiguous anchor in {operation['path']}")
    return found[0]


def already_applied(view, operation):
    placement = operation['placement']
    anchor = anchor_for(view, operation)
    children = anchor['children']
    if placement['mode'] == 'append-selected-folder':
        folders = [node for node in children if node.get('id') == placement['folderStructureId']]
        if len(folders) != 1:
            return False
        if folders[0].get('label') != placement['canonicalFolderLabel']:
            return False
        children = folders[0]['children']
    return children.count(placement['node']) == 1


def verified_capsule(capsule):
    review_path = capsule / 'scope-review.receipt.json'
    review = read(review_path)
    require(review.get('verdict') == 'PASS' and review.get('authorIndependent') is True,
            'Independent PASS review is required')
    relocation = read(capsule / 'capsule-relocation.json')
    verified = {}
    for original, entry in relocation['files'].items():
        retained = repository_path(entry['durablePath'])
        require(retained.is_relative_to(capsule), f'Retained file escapes capsule: {original}')
        require(retained.is_file() and file_sha(retained) == entry['sha256'],
                f'Retained evidence changed or missing: {original}')
        verified[original] = retained
    bindings = review['files']
    bindings = list(bindings.items()) if isinstance(bindings, dict) else [
        (entry['path'], entry['sha256']) for entry in bindings]
    for original, expected in bindings:
        if original in verified:
            require(file_sha(verified[original]) == expected, f'Review binding changed: {original}')
            continue
        # One old raw report was not retained. It is historical context, never
        # an operative plan/task/view guard. This exact exception replaces the
        # former blanket skip; no new capsule can declare missing files optional.
        historical = relocation.get('externalHistoricalReferences', {}).get(original, {})
        require(capsule == (ROOT / DEFAULT_CAPSULE).resolve()
                and file_sha(review_path) == LEGACY_RECEIPT_SHA256
                and original == LEGACY_RAW_REPORT and expected == LEGACY_RAW_REPORT_SHA256
                and historical.get('sha256') == expected
                and historical.get('operative') is False
                and historical.get('retentionStatus') == 'full-raw-report-not-retained-not-rechecked',
                f'Receipt-bound evidence is not retained: {original}')
        require(any(path.endswith('/projection-delta-validation.json') for path in verified)
                and any(path.endswith('/actual-backend-scope-evidence.json') for path in verified),
                'Legacy operative projection evidence must remain retained')

    def retained(name):
        matches = [path for original, path in verified.items() if original.endswith('/' + name)]
        require(len(matches) == 1, f'Missing or ambiguous retained path: {name}')
        return matches[0]

    return review, verified, retained


def normalize_plan(capsule, review, verified, retained):
    """Adapt the original reviewed plan in memory; never issue a replacement plan."""
    plan_path = retained('candidate-operations.json')
    plan = read(plan_path)
    if 'sourceOperations' in plan:
        evidence = read(retained('view-input-evidence.json'))
        task_hashes = {operation['goalId']: operation['goalSha256'] for operation in plan['operations']}
        return plan['sourceOperations'], evidence, task_hashes, {}

    require(plan.get('goalFieldWhitelist') == [] and plan.get('goalBeforeAfterIdentical') is True
            and review.get('canonicalFieldChangesApproved') == [], 'View-only review forbids goal-field edits')
    before_goal, after_goal = retained('goal-before.json'), retained('goal-after-view-only.json')
    require(before_goal.read_bytes() == after_goal.read_bytes(), 'Reviewed goal bytes differ')
    goal = read(before_goal)
    require(goal['id'] == plan['goalId'] == review['goalId'], 'Reviewed stable goal identity differs')
    inputs = read(retained('input-hashes.json'))
    source = read(retained('source-and-whole-task-evidence.json'))
    for path in {goal['examData']['sourceArtifactPath'], source['sourceExtractionPath'],
                 source['reviewedMappingPath'], source['officialSource']['cachedPdfPath']}:
        require(path in inputs['files'] and file_sha(repository_path(path)) == inputs['files'][path],
                f'Reviewed task/source input changed: {path}')
    original_plan = next(original for original, path in verified.items() if path == plan_path)
    prefix = str(Path(original_plan).parent)
    operations, evidence, expected_after = [], {}, {}
    for raw in plan['operations']:
        require(raw['operation'] == 'append-explicit-authored-structure', 'Unsupported reviewed view operation')
        relative = Path('DE/Gymnasium/composition-views/mathematik') / Path(raw['viewFile']).name
        before_path = verified.get(f'{prefix}/before/{relative}')
        after_path = verified.get(f'{prefix}/after-view-only/{relative}')
        require(before_path is not None and after_path is not None, 'Exact before/after view snapshots are required')
        require(file_sha(before_path) == inputs['beforeViews'][relative.name], 'Reviewed before-view input changed')
        before = read(before_path)
        require(before['viewId'] == raw['viewId'], 'Reviewed view identity differs')
        entry = raw['entry']
        require(entry.get('kind') == 'structure' and entry.get('children') == [
            {'kind': 'goalEntry', 'goalId': goal['id'], 'projectionRole': 'target'}],
            'View-only structure must contain exactly the reviewed existing assessment')
        operation = {'path': raw['viewFile'], 'viewId': raw['viewId'], 'goalId': goal['id'],
                     'placement': {'mode': 'append-existing-structure',
                                   'anchorStructureId': raw['parentStructureId'], 'node': entry}}
        operation['placement']['anchorSha256'] = sha(anchor_for(before, operation))
        operations.append(operation)
        evidence[raw['viewFile']] = {'fileSha256': file_sha(before_path)}
        expected_after[raw['viewFile']] = after_path
    return operations, evidence, {goal['id']: sha(goal)}, expected_after


def append_operation(view, operation):
    placement = operation['placement']
    anchor = anchor_for(view, operation)
    if placement['mode'] == 'append-existing-structure':
        anchor['children'].append(copy.deepcopy(placement['node']))
        return
    require(placement['mode'] == 'append-selected-folder', 'Unsupported placement mode')
    folders = [node for node in anchor['children'] if node.get('id') == placement['folderStructureId']]
    if not folders:
        folders = [{'kind': 'structure', 'id': placement['folderStructureId'],
                    'label': placement['canonicalFolderLabel'], 'children': []}]
        anchor['children'].append(folders[0])
    require(len(folders) == 1 and folders[0]['label'] == placement['canonicalFolderLabel'],
            'Missing, ambiguous or relabelled selected folder')
    folders[0]['children'].append(copy.deepcopy(placement['node']))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--capsule', default=str(DEFAULT_CAPSULE), help='Exact retained independent-review capsule')
    mode = parser.add_mutually_exclusive_group()
    mode.add_argument('--write', action='store_true')
    mode.add_argument('--check', action='store_true', help='Validate pending writes without changing source views')
    args = parser.parse_args()
    capsule = repository_path(args.capsule)
    review, verified, retained = verified_capsule(capsule)
    operations, evidence, task_hashes, expected_after = normalize_plan(capsule, review, verified, retained)
    reference_count = len(operations)
    task_label = 'task' if len(task_hashes) == 1 else 'tasks'
    canonical_path = ROOT / 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json'
    goals = {goal['id']: goal for goal in read(canonical_path)['goals']}
    for goal_id, expected in task_hashes.items():
        goal = goals[goal_id]
        require(sha(goal) == expected, f'Reviewed task changed: {goal_id}')
        require(goal['examData']['reviewStatus'] == 'released', f'Reviewed task is not released: {goal_id}')
    grouped = collections.defaultdict(list)
    for operation in operations:
        grouped[operation['path']].append(operation)
    current = {path: read(repository_path(path)) for path in grouped}
    # For view-only candidates, the original reviewed operation must reproduce
    # the complete bound after-view, not merely contain a plausible goal ID.
    for path, expected in expected_after.items():
        original = next(file for key, file in verified.items()
                        if key.endswith('/before/DE/Gymnasium/composition-views/mathematik/' + Path(path).name))
        candidate = read(original)
        for operation in grouped[path]:
            append_operation(candidate, operation)
        require(candidate == read(expected), f'Original plan does not reproduce reviewed after-view: {path}')
    if all(already_applied(current[path], operation)
           for path, operations in grouped.items() for operation in operations):
        print(f'Existing Math completion routes CHECK: {reference_count} selected references already materialized; '
              f'{len(task_hashes)} {task_label} unchanged.')
        return
    # Validate every untouched input and anchor before making any mutation.
    for path, operations in grouped.items():
        require(file_sha(repository_path(path)) == evidence[path]['fileSha256'], f'Reviewed source view changed: {path}')
        for operation in operations:
            require(current[path]['viewId'] == operation['viewId'], f'Reviewed source view identity differs: {path}')
            require(sha(anchor_for(current[path], operation)) == operation['placement']['anchorSha256'],
                    f'Reviewed anchor changed: {path}')
    outputs = {}
    for path, operations in grouped.items():
        view = copy.deepcopy(current[path])
        for operation in operations:
            append_operation(view, operation)
        outputs[path] = json.dumps(view, ensure_ascii=False, indent=2) + '\n'
        if path in expected_after:
            require(outputs[path].encode() == expected_after[path].read_bytes(), f'Reviewed output bytes differ: {path}')
    if args.check:
        print(f'Existing Math completion routes DRY-RUN: {len(outputs)} reviewed source views; '
              f'{reference_count} selected refs; {len(task_hashes)} {task_label} unchanged; no files written.')
        return
    if not args.write:
        raise SystemExit(f'{len(outputs)} reviewed source views need materialization; use --write.')
    for path, content in outputs.items():
        repository_path(path).write_text(content)
    print(f'Existing Math completion routes WRITE: {len(outputs)} source views; {reference_count} selected refs; '
          f'{len(task_hashes)} {task_label} unchanged.')


if __name__ == '__main__':
    main()
