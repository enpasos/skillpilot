#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Recheck retained foreign-demand witnesses before refreshing live source pins.

This does not recreate the historical backend observation or amend its evidence.
It verifies the retained policy against the current graph and authored views.
"""
import argparse
import copy
import hashlib
import json
from pathlib import Path
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[4]
sys.path.insert(0, str(ROOT / 'scripts'))
from generate_mathematics_foreign_acquisition_policy import authored_places, earliest_consumer
from normalize_mathematics_stage_views import Normalizer, encode

BASE = 'ebdd229938e771dd9e18976f54ddea54fb1a14ea'
POLICY = 'app/scripts/config/math-foreign-acquisition-demand.json'
PHYSICS = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json'
MATH = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json'


def sha(data):
    return hashlib.sha256(data).hexdigest()


def historical(path):
    return subprocess.check_output(['git', 'show', BASE + ':' + path], cwd=ROOT)


def set_digest(values):
    return sha(('\n'.join(sorted(values)) + '\n').encode())


def closure(seeds, goals):
    """Independent full-graph traversal, without source/course pruning."""
    seen, pending = set(), list(seeds)
    while pending:
        goal_id = pending.pop()
        if goal_id in seen:
            continue
        seen.add(goal_id)
        goal = goals[goal_id]
        assert not goal.get('contains'), goal_id
        pending.extend(ref.split(':')[-1] for ref in goal.get('requires', []))
    return seen


def acquisition_markers(nodes):
    result = set()
    for node in nodes:
        if node['kind'] == 'structure':
            result.update(acquisition_markers(node['children']))
        elif node.get('acquisitionPlacement') is True:
            result.add(node['goalId'])
    return result


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--write', action='store_true', help='Refresh only the verified live Physics source pins.')
    args = parser.parse_args()
    old_bytes = historical(POLICY)
    old_policy = json.loads(old_bytes)
    live_policy = json.loads((ROOT / POLICY).read_bytes())
    old_content, live_content = copy.deepcopy(old_policy), copy.deepcopy(live_policy)
    old_content.pop('currentPhysicsSourcePins')
    live_content.pop('currentPhysicsSourcePins')
    assert old_content == live_content, 'Historical observation identities or retained demands changed'
    assert historical(MATH) == (ROOT / MATH).read_bytes(), 'Mathematics graph changed'
    current = Normalizer()
    previous = copy.copy(current)
    previous.goals = dict(current.goals)
    current_physics = json.loads((ROOT / PHYSICS).read_bytes())
    for goal in current_physics['goals']:
        previous.goals.pop(goal['id'])
    previous.goals.update({goal['id']: goal for goal in json.loads(historical(PHYSICS))['goals']})
    previous.cache, previous.prerequisite_cache = {}, {}
    math_views, math_acquisitions = {}, {}
    for path in (ROOT / 'curricula/DE/Gymnasium/composition-views/mathematik').glob('*.view.json'):
        relative = str(path.relative_to(ROOT))
        assert path.read_bytes() == historical(relative), relative
        view = json.loads(path.read_bytes())
        math_views[view['viewId']] = current.atomic_roles(view['rootNodes'])
        math_acquisitions[view['viewId']] = acquisition_markers(view['rootNodes'])
    expected = copy.deepcopy(old_policy)
    places, view_checks, changed_pins = {}, [], []
    for path, old_pin in old_policy['currentPhysicsSourcePins'].items():
        before_bytes = historical(path)
        assert sha(before_bytes) == old_pin, 'Baseline does not reproduce the retained source pin: ' + path
        after_bytes = (ROOT / path).read_bytes()
        before, after = json.loads(before_bytes), json.loads(after_bytes)
        before_places = authored_places(before, previous)
        after_places = authored_places(after, current)
        before_math = closure(before_places, previous.goals) & current.math_atoms
        after_math = closure(after_places, current.goals) & current.math_atoms
        assert before_math == after_math, 'Mathematics acquisition demand changed: ' + path
        assert not (set(before_places) - set(after_places)), 'A Physics seed was removed: ' + path
        places[after['viewId']] = after_places
        new_pin = sha(after_bytes)
        expected['currentPhysicsSourcePins'][path] = new_pin
        view_checks.append(dict(path=path, selectedAtomicTargetsBefore=len(before_places),
            selectedAtomicTargetsAfter=len(after_places), addedAtomicTargets=sorted(set(after_places) - set(before_places)),
            mathLearningGoalCount=len(after_math), unchangedMathLearningGoalIdsSha256=set_digest(after_math)))
        if old_pin != new_pin:
            changed_pins.append(dict(path=path, beforeSha256=old_pin, afterSha256=new_pin))
    row_count, witnessed_math = 0, set()
    seed_places, conditional_places = 0, 0
    for math_view, rows in old_policy['views'].items():
        assert math_view in math_views, math_view
        for row in rows:
            goal_id = row['goalId']
            assert goal_id in current.math_atoms
            assert goal_id in math_views[math_view], (math_view, goal_id, 'no authored Mathematics place')
            if math_views[math_view][goal_id] == 'target':
                seed_places += 1
            else:
                assert goal_id in math_acquisitions[math_view], (math_view, goal_id, 'no acquisition marker')
                conditional_places += 1
            selected = earliest_consumer(places[row['physicsViewId']], goal_id, current)
            assert selected is not None, row
            consumer, location = selected
            assert consumer == row['consumerGoalId'], row
            assert location['path'] == row['consumerStructurePath'], row
            assert (list(location['place']) if location['place'] else None) == row['demandPlace'], row
            chain = row['requiresPath']
            assert chain[0] == consumer and chain[-1] == goal_id, row
            for dependent, prerequisite in zip(chain, chain[1:]):
                assert prerequisite in [ref.split(':')[-1] for ref in current.goals[dependent].get('requires', [])], row
            witnessed_math.add(goal_id)
            row_count += 1
    output = encode(expected).encode()
    if args.write:
        (ROOT / POLICY).write_bytes(output)
    else:
        assert json.loads((ROOT / POLICY).read_bytes()) == expected, 'Live source pins need the verified refresh'
    print(json.dumps(dict(status='PASS', baseCommit=BASE,
        method='Current-state recheck of all retained policy witnesses and all 63 selected Physics prerequisite closures; no replay of the historical backend observation.',
        retainedActualWitnessSha256=old_policy['actualWitnessSha256'],
        retainedActualNativeViewsSha256=old_policy['actualNativeViewsSha256'],
        baselinePolicySha256=sha(old_bytes), currentPolicySha256=sha(output),
        currentCanonicalPhysicsSha256=sha((ROOT / PHYSICS).read_bytes()),
        unchangedCanonicalMathematicsSha256=sha((ROOT / MATH).read_bytes()),
        verifiedMathViews=len(old_policy['views']), unchangedMathSourceViews=len(math_views),
        verifiedDemandRows=row_count, witnessedMathAtoms=len(witnessed_math),
        verifiedMathSeedTargetPlaces=seed_places, verifiedExplicitMathAcquisitionPlaces=conditional_places,
        verifiedPhysicsSourceViews=len(view_checks), changedSourcePins=changed_pins,
        allRetainedWitnessesAndDemandPlacesUnchanged=True, allPhysicsMathLearningSetsUnchanged=True,
        physicsViewChecks=view_checks), ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()
