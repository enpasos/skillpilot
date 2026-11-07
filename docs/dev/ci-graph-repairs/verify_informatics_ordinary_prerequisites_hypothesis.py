#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Read-only replay of individually reviewed ordinary prerequisite proposals.

Loads the declared complete canonical catalog from its exact Git commit, checks
all source and field guards, and measures goal/atomic demand independently.
There is no apply command, mastery input, personalization scope or QA bypass.
"""
import argparse
import copy
import hashlib
import json
from pathlib import Path
import subprocess
import sys

sys.dont_write_bytecode = True
ROOT = Path(__file__).resolve().parents[3]
sys.path.insert(0, str(ROOT / 'scripts'))
import canonical_goal_identity_migration as canonical_json
sys.path.insert(0, str(Path(__file__).resolve().parent))
import verify_german_minimality_review as graph


def require(value, message):
    if not value:
        raise ValueError(message)


def sha(raw):
    return hashlib.sha256(raw).hexdigest()


def definition_delta(keys, old_values, new_values, catalog):
    rows = []
    for source, old, new in zip(keys, old_values, new_values):
        if old == new:
            continue
        def targets(bits):
            return [{'goalKey': target, 'title': catalog.nodes[target][1].get('title', '')}
                    for index, target in enumerate(keys) if bits & (1 << index)]
        rows.append({'sourceKey': source, 'sourceTitle': catalog.nodes[source][1].get('title', ''),
                     'beforeDemandCount': old.bit_count(), 'afterDemandCount': new.bit_count(),
                     'removed': targets(old & ~new), 'added': targets(new & ~old)})
    return rows


def relations(documents):
    catalog = graph.Catalog(copy.deepcopy(documents))
    effective, _ = catalog.effective()
    goal, goal_cycles = graph.closure(catalog.keys, effective)
    atomic, atomic_cycles = graph.closure(catalog.atom_keys, catalog.atomic(effective))
    return catalog, effective, goal, atomic, [goal_cycles, atomic_cycles]


def cyclic_keys(keys, values):
    return [key for index, (key, value) in enumerate(zip(keys, values)) if value & (1 << index)]


def replay(repo, manifest):
    commit = manifest['baseCommit']
    require(len(commit) == 40 and all(c in '0123456789abcdef' for c in commit), 'Invalid base commit')
    require(subprocess.check_output(['git', '-C', str(repo), 'rev-parse', commit + '^{commit}'], text=True).strip() == commit,
            'Base commit differs')
    source_binding = manifest['source']
    require(sha((repo / source_binding['path']).read_bytes()) == source_binding['sha256'],
            'Current source changed; this guarded proposal is stale')
    source = None
    documents = []
    for binding in manifest['catalogSources']:
        raw = subprocess.check_output(['git', '-C', str(repo), 'show', commit + ':' + binding['path']])
        require(sha(raw) == binding['sha256'], 'Git catalog source pin differs: ' + binding['path'])
        require(sha((repo / binding['path']).read_bytes()) == binding['sha256'], 'Current canonical catalog changed: ' + binding['path'])
        document = json.loads(raw)
        require(document['landscapeId'] == binding['landscapeId'], 'Catalog owner differs')
        documents.append(document)
        if binding['path'] == source_binding['path']:
            require(source is None, 'Duplicate primary source')
            require(sha(raw) == source_binding['sha256'], 'Primary source pin differs')
            source = document
    require(len(documents) == 21 and source is not None, 'Complete declared canonical catalog required')
    require(len({document['landscapeId'] for document in documents}) == 21, 'Duplicate canonical owner')
    review = manifest['previousReview']
    require(sha((repo / review['path']).read_bytes()) == review['sha256'], 'Historical review pin differs')
    for name in ('operations', 'reviewCases'):
        values = manifest['operations'] if name == 'operations' else manifest['cases']
        require(sha(canonical_json.stable(values)) == manifest[name + 'CanonicalSha256'], 'Review/operation digest differs')
    candidate = copy.deepcopy(source)
    terminals = {case['terminal']['goalId'] for case in manifest['cases']}
    require(len(manifest['cases']) == 27 and len(terminals) == 6, 'Bounded case set differs')
    used = set()
    for operation in manifest['operations']:
        require(operation['op'] == 'replace' and operation['file'] == source_binding['path'], 'Only guarded primary-source replacements allowed')
        pieces = operation['path'].split('/')
        require(len(pieces) == 4 and pieces[:2] == ['', 'goals'] and pieces[3] == 'requires', 'Only exact requires field pointers allowed')
        goal = candidate['goals'][int(pieces[2])]
        id = operation['guardGoalId']
        require(id == goal['id'] and id not in used and id not in terminals and not id.startswith('875cb53c-'), 'Repeated, terminal or held author')
        require(not goal.get('contains') and not goal.get('extendedData', {}).get('examData') and not goal.get('examData'), 'Only ordinary atomic authors allowed')
        require(goal.get('semanticKind') not in ['orientation', 'memory', 'integrativeAssessment'], 'Nonordinary author')
        require(sha(canonical_json.stable(goal)) == operation['guardGoalCanonicalSha256'], 'Goal payload guard differs: ' + id)
        require(goal.get('requires', []) == operation['guardRequiresBefore'], 'Old requires guard differs: ' + id)
        require(isinstance(operation['value'], list) and len(set(operation['value'])) == len(operation['value']), 'Duplicate or malformed replacement')
        goal['requires'] = copy.deepcopy(operation['value'])
        used.add(id)
    require(len(used) == 27, 'Expected 26 ordinary held-case authors plus the explicit debug support correction')
    for before, after in zip(source['goals'], candidate['goals']):
        require({k: v for k, v in before.items() if k != 'requires'} == {k: v for k, v in after.items() if k != 'requires'},
                'A non-requires goal field changed')
    require({k: v for k, v in source.items() if k != 'goals'} == {k: v for k, v in candidate.items() if k != 'goals'}, 'Landscape metadata changed')
    before, be, bg, ba, bc = relations(documents)
    after, ae, ag, aa, ac = relations([candidate if document['landscapeId'] == source_binding['landscapeId'] else document for document in documents])
    require(before.keys == after.keys and before.atom_keys == after.atom_keys, 'Identity/atom universe changed')
    goal_delta = definition_delta(before.keys, bg, ag, before)
    atomic_delta = definition_delta(before.atom_keys, ba, aa, before)
    goal_cyclic_before, goal_cyclic_after = cyclic_keys(before.keys, bg), cyclic_keys(after.keys, ag)
    atomic_cyclic_before, atomic_cyclic_after = cyclic_keys(before.atom_keys, ba), cyclic_keys(after.atom_keys, aa)
    require(not (set(goal_cyclic_after) - set(goal_cyclic_before)), 'New goal-effective cycle participation')
    require(not (set(atomic_cyclic_after) - set(atomic_cyclic_before)), 'New atomic-normalized cycle participation')
    owner = source_binding['landscapeId']
    index = {key: i for i, key in enumerate(before.keys)}
    atom_index = {key: i for i, key in enumerate(before.atom_keys)}
    terminal_rows = []
    for id in sorted(terminals):
        key = owner + ':' + id
        require(before.nodes[key][1] == after.nodes[key][1], 'Terminal payload changed')
        terminal_rows.append({'goalId': id, 'title': before.nodes[key][1]['title'], 'authoredPayloadUnchanged': True,
                              'goalDemandUnchanged': bg[index[key]] == ag[index[key]],
                              'atomicDemandUnchanged': ba[atom_index[key]] == aa[atom_index[key]]})
    witnesses = []
    for case in manifest['cases']:
        path = [owner + ':' + id for id in case['originalWitnessGoalIds']]
        before.validate_path(be, path)
        survives = all(target in ae.get(source, set()) for source, target in zip(path, path[1:]))
        require(survives == case.get('sourcePlacementHold', False), 'Reviewed wrong witness disposition differs: ' + case['caseId'])
        witnesses.append({'caseId': case['caseId'], 'originalWitnessValidBefore': True, 'originalWitnessSurvives': survives,
                          'terminalDirectEdgeUnchanged': True})
    result = {'status': 'guarded-hypothesis-replayed-NOT-global-QA-approval', 'dataApplied': False, 'qaApprovalClaimed': False,
              'baseCommit': commit, 'source': source_binding, 'catalogFiles': 21, 'goalKeys': len(before.keys), 'atomicKeys': len(before.atom_keys),
              'ordinaryRequiresReplacements': len(used), 'operationsCanonicalSha256': manifest['operationsCanonicalSha256'],
              'reviewCasesCanonicalSha256': manifest['reviewCasesCanonicalSha256'],
              'hypotheticalSourcePrettySha256': sha((json.dumps(candidate, ensure_ascii=False, indent=2) + '\n').encode()),
              'cycleComponentCountsBefore': bc, 'cycleComponentCountsAfter': ac,
              'goalCyclicKeysBefore': goal_cyclic_before, 'goalCyclicKeysAfter': goal_cyclic_after,
              'atomicCyclicKeysBefore': atomic_cyclic_before, 'atomicCyclicKeysAfter': atomic_cyclic_after,
              'globalGoalDeltas': goal_delta, 'globalAtomicDeltas': atomic_delta,
              'changedForeignGoalSources': sum(not row['sourceKey'].startswith(owner + ':') for row in goal_delta),
              'changedForeignAtomicSources': sum(not row['sourceKey'].startswith(owner + ':') for row in atomic_delta),
              'terminalDemands': terminal_rows, 'reviewedWitnesses': witnesses,
              'applicabilityAndScopeApproval': False, 'masteryInputsUsed': False,
              'note': 'Existing unrelated canonical cycles are measured, never accepted as a passing graph. Goal-node effective and atomic-normalized demand remain distinct.'}
    expected = manifest.get('expectedAnalysis')
    if expected:
        require(sha((json.dumps(result, ensure_ascii=False, indent=2) + '\n').encode()) == expected['sha256'], 'Demand analysis differs from recorded exact expectation')
    return result


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--repo-root', type=Path, default=ROOT)
    parser.add_argument('--manifest', type=Path, default=Path(__file__).with_name('informatics-ordinary-prerequisites-proposal-2026-11-06.json'))
    args = parser.parse_args()
    try:
        print(json.dumps(replay(args.repo_root.resolve(), json.loads(args.manifest.read_bytes())), ensure_ascii=False, indent=2))
    except (ValueError, KeyError, IndexError, OSError, subprocess.CalledProcessError) as error:
        print(str(error), file=sys.stderr)
        raise SystemExit(1)


if __name__ == '__main__':
    main()
