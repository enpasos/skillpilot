#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Recheck every retained demand; bound the two reviewed E.1 scope deltas.

This follows the 23 November current-state procedure. It does not replay the
historical native observation, create demands, or change a quality gate.
Run without --write after activation to reproduce recheck.actual.json exactly.
"""
import argparse
import copy
from collections import deque
import hashlib
import json
from pathlib import Path
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[4]
HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(ROOT / 'scripts'))
from generate_mathematics_foreign_acquisition_policy import authored_places, earliest_consumer
from normalize_mathematics_stage_views import Normalizer, encode

BASE = '8df38a054a15a6c3fc4036c35324c277bf68f628'
CURRENT = 'aa5ac41808a97c6f7ca1c2886382a4a98b61693b'
POLICY = 'app/scripts/config/math-foreign-acquisition-demand.json'
PHYSICS = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json'
MATH = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json'
RP = 'curricula/DE/Gymnasium/composition-views/physik/de-rp-seki.view.json'
MP = '2b9e565f-d9b4-5e23-b5b7-b7977cecff06'
DFD = 'dfd2628f-b44e-51b3-86e8-99158861be8c'
WW = '89a8cf15-7ba4-46c1-b1dc-fd161b20d9c2'
FRAME = '68c90ba6-c438-463c-9a53-cf61062d416a'
VECTOR_ADD = 'c63bbffd-8d1c-5fe2-a428-db194e6fe592'
RP_REMOVED = {VECTOR_ADD, '19f170e4-b88f-4c06-b72a-ce6923748bb4', '94b48b93-473f-4bc5-8c93-8c1a5e2cd1a6'}
CUT = '42af44fbc3297e64ecd271df7c8e0dc1559f956d'
RETIREMENT = 'd7d1759bd0c29e102360d0add0faf712b4352dd9'
ALLOWED_ADDED = {
 '0fee53f2-1c02-5b12-9b6c-aa9fa462d921': 'New separate projectile-velocity vector atom; E.1 cut and reviewed placements.',
 '1e459a1b-4159-5049-84eb-9928129c1610': 'New separate velocity graph/displacement atom; E.1 cut and reviewed placements.',
 '262f807a-30d0-503e-986f-856cbd048e8e': 'New separate motion-laws atom; E.1 cut and reviewed placements.',
 'd9a6ea85-f7e8-5cbd-afe9-62596e22040d': 'New separate light/heavy fall atom; E.1 cut and reviewed placements.',
 '4ea1b93f-2dba-59ac-87ab-29af6c55cc37': 'Existing reviewed vector-velocity practice offer exposed with its separate atom.',
 'f41e4e30-794e-5ce4-ba5e-cc72712cd691': 'Existing reviewed free-fall practice offer exposed with the E.1 cut.'}
MP_REMOVED_FILES = {
 'de-bb-lk.view.json', 'de-bb-sekii-lk.view.json', 'de-be-lk.view.json', 'de-be-sekii-lk.view.json',
 'de-de-gym-sekii-physics-lk.view.json', 'de-hb-lk.view.json', 'de-hb-sekii-lk.view.json',
 'de-he-lk-g8.view.json', 'de-he-lk-g9.view.json', 'de-he-sekii-lk.view.json',
 'de-hh-sekii-lk.view.json', 'de-mv-lk.view.json', 'de-mv-sekii-lk.view.json',
 'de-ni-sekii-lk.view.json', 'de-nw-sekii-lk.view.json', 'de-rp-lk.view.json',
 'de-rp-sekii-lk.view.json', 'de-sh-lk.view.json', 'de-sh-sekii-lk.view.json',
 'de-sl-sekii-lk.view.json', 'de-sn-sekii-lk.view.json', 'de-st-sekii-lk.view.json',
 'de-th-lk.view.json', 'de-th-sekii-lk.view.json'}
PRIOR = 'contracts/stage-plan-review-evidence/2026-11-23/math-foreign-acquisition-current/'
REFERENCES = [PRIOR + 'verify-current-policy.py', PRIOR + 'recheck.actual.json',
 'scripts/test_mathematics_stage_views.py', 'scripts/test_mathematics_foreign_acquisition_policy.py',
 'scripts/generate_mathematics_foreign_acquisition_policy.py', 'scripts/normalize_mathematics_stage_views.py']


def sha(value):
    return hashlib.sha256(value).hexdigest()


def historical(path, revision=BASE):
    return subprocess.check_output(['git', 'show', revision + ':' + path], cwd=ROOT)


def set_digest(values):
    return sha(('\n'.join(sorted(values)) + '\n').encode())


def closure(seeds, goals):
    """Full atomic requires graph, including foreign subjects, without pruning."""
    seen, pending = set(), list(seeds)
    while pending:
        goal_id = pending.pop()
        if goal_id in seen:
            continue
        seen.add(goal_id)
        assert goal_id in goals, ('unresolved', goal_id)
        goal = goals[goal_id]
        assert not goal.get('contains'), ('non-atomic', goal_id)
        pending.extend(ref.split(':')[-1] for ref in goal.get('requires', []))
    return seen


def shortest_path(source, target, goals):
    pending, seen = deque([[source]]), {source}
    while pending:
        chain = pending.popleft()
        if chain[-1] == target:
            return chain
        for ref in goals[chain[-1]].get('requires', []):
            goal = ref.split(':')[-1]
            if goal not in seen:
                seen.add(goal)
                pending.append(chain + [goal])
    return None


def markers(nodes):
    result = set()
    for node in nodes:
        if node['kind'] == 'structure':
            result.update(markers(node['children']))
        elif node.get('acquisitionPlacement') is True:
            result.add(node['goalId'])
    return result


def inventory(revision, prefix, suffix):
    paths = subprocess.check_output(['git', 'ls-tree', '-r', '--name-only', revision, '--', prefix], cwd=ROOT, text=True).splitlines()
    return {p for p in paths if p.endswith(suffix)}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--write', action='store_true', help='Write only verified source pins and this new dated evidence.')
    args = parser.parse_args()
    before_raw = historical(POLICY)
    before = json.loads(before_raw)
    current_policy = json.loads((ROOT / POLICY).read_bytes())
    without_pins = lambda value: {k: v for k, v in value.items() if k != 'currentPhysicsSourcePins'}
    assert without_pins(before) == without_pins(current_policy), 'Historical identities or retained demand rows changed'
    assert historical(MATH) == (ROOT / MATH).read_bytes(), 'Mathematics canonical changed'
    # Record every actual JSON/source input opened by the native Python model.
    input_paths = set(REFERENCES)
    original_text, original_bytes = Path.read_text, Path.read_bytes
    def track(path):
        try:
            input_paths.add(str(path.resolve().relative_to(ROOT)))
        except ValueError:
            pass
    def tracked_text(path, *a, **kw):
        track(path)
        return original_text(path, *a, **kw)
    def tracked_bytes(path, *a, **kw):
        track(path)
        return original_bytes(path, *a, **kw)
    Path.read_text, Path.read_bytes = tracked_text, tracked_bytes
    try:
        n = Normalizer()
        previous = copy.copy(n)
        previous.goals = dict(n.goals)
        for goal in json.loads((ROOT / PHYSICS).read_bytes())['goals']:
            previous.goals.pop(goal['id'])
        previous.goals.update({g['id']: g for g in json.loads(historical(PHYSICS))['goals']})
        previous.cache, previous.depth_cache, previous.prerequisite_cache = {}, {}, {}
        math_views, math_markers = {}, {}
        math_dir = 'curricula/DE/Gymnasium/composition-views/mathematik'
        math_paths = {str(p.relative_to(ROOT)) for p in (ROOT / math_dir).glob('*.view.json')}
        assert math_paths == inventory(BASE, math_dir, '.view.json')
        for path in sorted(math_paths):
            raw = (ROOT / path).read_bytes()
            assert raw == historical(path), path
            view = json.loads(raw)
            math_views[view['viewId']] = n.atomic_roles(view['rootNodes'])
            math_markers[view['viewId']] = markers(view['rootNodes'])
        canonical_dir = 'curricula/DE/Gymnasium/canonical'
        assert {str(p.relative_to(ROOT)) for p in (ROOT / canonical_dir).glob('*.json')} == inventory(BASE, canonical_dir, '.json')
        # Current Normalizer reads these exact mapping files and their sourceExtractionPath inputs.
        mapping_paths = {str(p.relative_to(ROOT)) for p in (ROOT / 'curricula/DE/Gymnasium/mapping').glob('DE-*/**/*math*source_extraction*.json')}
        old_mapping_paths = {p for p in inventory(BASE, 'curricula/DE/Gymnasium/mapping', '.json') if 'math' in Path(p).name and 'source_extraction' in Path(p).name}
        assert mapping_paths == old_mapping_paths
        expected = copy.deepcopy(before)
        view_checks, places, changed_pins, rp_details = [], {}, [], []
        removed_mp_files, added_ids = set(), set()
        for path, old_pin in before['currentPhysicsSourcePins'].items():
            old_raw, new_raw = historical(path), (ROOT / path).read_bytes()
            assert sha(old_raw) == old_pin, path
            old_view, new_view = json.loads(old_raw), json.loads(new_raw)
            bp, ap = authored_places(old_view, previous), authored_places(new_view, n)
            old_math, new_math = closure(bp, previous.goals) & n.math_atoms, closure(ap, n.goals) & n.math_atoms
            removed, added = set(bp) - set(ap), set(ap) - set(bp)
            assert removed <= {MP}, (path, removed)
            if removed:
                removed_mp_files.add(Path(path).name)
            assert added <= ALLOWED_ADDED.keys(), (path, added)
            added_ids.update(added)
            if path == RP:
                assert set(bp) == set(ap) and len(bp) == 143
                assert len(old_math) == 88 and len(new_math) == 85
                assert old_math - new_math == RP_REMOVED and not new_math - old_math
                for atom in sorted(RP_REMOVED):
                    old_consumers = [s for s in bp if shortest_path(s, atom, previous.goals)]
                    assert old_consumers == [DFD], old_consumers
                    assert not any(shortest_path(s, atom, n.goals) for s in ap)
                    chain = shortest_path(DFD, atom, previous.goals)
                    removed_edges = [(a, b) for a, b in zip(chain, chain[1:]) if b not in [x.split(':')[-1] for x in n.goals[a].get('requires', [])]]
                    assert removed_edges == [(WW, FRAME)]
                    assert not any(row['goalId'] == atom for rows in before['views'].values() for row in rows)
                    # These are still ordinary RP Mathematics targets. No foreign route may suppress them.
                    math_roles = {view_id: math_views[view_id][atom] for view_id in ['de-rp-gym-seki-math-g8', 'de-rp-gym-seki-math-g9']}
                    assert set(math_roles.values()) == {'target'}
                    rp_details.append(dict(goalId=atom, title=n.goals[atom]['title'], previousOnlyConsumer=DFD,
                        previousRequiresPath=chain, removedEdge=list(removed_edges[0]), currentConsumers=[],
                        policyMembershipBeforeAndAfter=0, ordinaryRPSekIMathematicsRoles=math_roles,
                        classification='No longer a Physics preparation demand; remains an ordinary Mathematics target; no demand row retired or created.',
                        changeCommit=CUT))
            else:
                assert old_math == new_math, ('unreviewed Mathematics learning-set delta', path)
            place_changes = [dict(goalId=g, before=bp[g], after=ap[g]) for g in sorted(set(bp) & set(ap)) if bp[g] != ap[g]]
            places[new_view['viewId']] = ap
            expected['currentPhysicsSourcePins'][path] = sha(new_raw)
            if old_pin != sha(new_raw):
                changed_pins.append(dict(path=path, beforeSha256=old_pin, afterSha256=sha(new_raw)))
            view_checks.append(dict(path=path, viewId=new_view['viewId'],
                selectedAtomicTargetsBefore=len(bp), selectedAtomicTargetsAfter=len(ap),
                removedAtomicTargets=[dict(goalId=g, cause='Explicit no-successor retirement of the voluntary historical 30/18 MP assessment.', changeCommit=RETIREMENT) for g in sorted(removed)],
                addedAtomicTargets=[dict(goalId=g, title=n.goals[g]['title'], cause=ALLOWED_ADDED[g]) for g in sorted(added)],
                changedRetainedTargetPlaces=place_changes,
                mathLearningGoalCountBefore=len(old_math), mathLearningGoalCountAfter=len(new_math),
                beforeMathLearningGoalIdsSha256=set_digest(old_math), afterMathLearningGoalIdsSha256=set_digest(new_math),
                removedMathLearningGoalIds=sorted(old_math-new_math), addedMathLearningGoalIds=sorted(new_math-old_math),
                currentSelectedAtomicTargetIds=sorted(ap), currentMathLearningGoalIds=sorted(new_math)))
        assert removed_mp_files == MP_REMOVED_FILES, removed_mp_files ^ MP_REMOVED_FILES
        assert added_ids == ALLOWED_ADDED.keys()
        assert len(changed_pins) == 59 and len(view_checks) == 63
        row_count, seeds, conditional, witnessed, all_row_checks = 0, 0, 0, set(), []
        for mv, rows in before['views'].items():
            for index, row in enumerate(rows):
                atom = row['goalId']
                assert atom in n.math_atoms and atom in math_views[mv]
                if math_views[mv][atom] == 'target':
                    seeds += 1
                    role = 'target'
                else:
                    assert atom in math_markers[mv], (mv, atom)
                    conditional += 1
                    role = 'explicit-acquisition-marker'
                selected = earliest_consumer(places[row['physicsViewId']], atom, n)
                assert selected is not None, row
                consumer, loc = selected
                assert consumer == row['consumerGoalId']
                assert loc['path'] == row['consumerStructurePath']
                assert (list(loc['place']) if loc['place'] else None) == row['demandPlace']
                chain = row['requiresPath']
                assert chain[0] == consumer and chain[-1] == atom
                for dependent, prerequisite in zip(chain, chain[1:]):
                    assert prerequisite in [ref.split(':')[-1] for ref in n.goals[dependent].get('requires', [])], row
                all_row_checks.append(dict(mathViewId=mv, rowIndex=index, goalId=atom, physicsViewId=row['physicsViewId'],
                    consumerGoalId=consumer, mathematicsPlaceType=role, unchangedRowSha256=sha(encode(row).encode()),
                    currentEarliestConsumerPlaceAndEveryRequiresEdgeValid=True))
                witnessed.add(atom)
                row_count += 1
        assert (len(math_views), len(before['views']), row_count, len(witnessed), seeds, conditional) == (100, 69, 1036, 47, 15, 1021)
    finally:
        Path.read_text, Path.read_bytes = original_text, original_bytes
    # Exact historical cut proves that the recorded edge disappeared in that cut, not in this pin refresh.
    cut_prior = {g['id']: g for g in json.loads(historical(PHYSICS, CUT + '^'))['goals']}
    cut_after = {g['id']: g for g in json.loads(historical(PHYSICS, CUT))['goals']}
    assert FRAME in cut_prior[WW]['requires'] and FRAME not in cut_after[WW]['requires']
    current_mp = n.goals[MP]
    assert current_mp['extendedData']['applicabilityProjection'] == 'excluded' and current_mp['applicability'] == {}
    assert current_mp['examData']['scoring']['maxPoints'] == 30 and current_mp['examData']['scoring']['passingPoints'] == 18
    assert current_mp['examData']['coveredGoalIds'] == []
    output = encode(expected).encode()
    # Exhaustive actual input footprint: the only graph change is Physics; all remaining
    # canonical subjects, mappings, retained sources, Mathematics views, helpers and gates are unchanged.
    inputs = []
    for path in sorted(input_paths | {POLICY, PHYSICS, MATH}):
        old_raw = historical(path)
        new_raw = output if path == POLICY else (ROOT / path).read_bytes()
        assert path == POLICY or new_raw == historical(path, CURRENT), ('not the reviewed current input', path)
        changed = old_raw != new_raw
        allowed = path in {POLICY, PHYSICS} or path.startswith('curricula/DE/Gymnasium/composition-views/physik/')
        assert not changed or allowed, ('other input changed', path)
        inputs.append(dict(path=path, beforeSha256=sha(old_raw), currentSha256=sha(new_raw), changed=changed))
    lineage = []
    for rev in ['c8d12f1cc79a9463c759b188347ae163e5b0b32b', BASE]:
        parent_policy = json.loads(historical(POLICY, rev + '^'))
        at_policy = json.loads(historical(POLICY, rev))
        assert without_pins(parent_policy) == without_pins(at_policy)
        deltas = [p for p in parent_policy['currentPhysicsSourcePins'] if parent_policy['currentPhysicsSourcePins'][p] != at_policy['currentPhysicsSourcePins'][p]]
        assert len(deltas) == 6 and all('/de-he-' in p for p in deltas)
        lineage.append(dict(commit=rev, changedSourcePinCount=6, policyRowsChanged=0, changedPaths=deltas))
    native = json.loads((HERE / 'native-rp-closure.actual.json').read_bytes())
    assert native['removed'] == sorted(RP_REMOVED) and native['added'] == []
    assert [len(v['seeds']) for v in native['results']] == [143, 143]
    assert [len(v['mathIds']) for v in native['results']] == [88, 85]
    assert native['results'][0]['seeds'] == native['results'][1]['seeds']
    for v in native['consumers']:
        assert len(v['previous']) == 1 and v['previous'][0]['seed'] == DFD and v['current'] == []
    report = dict(status='PASS', evidenceDate='2026-11-24', baseCommit=BASE, currentInputCommit=CURRENT,
        method='23 November full retained-witness recheck, with explicit bounded E.1 cut and voluntary-MP retirement deltas; independent native TypeScript RP crosscheck. No replay of the immutable historical backend observation.',
        priorEvidence=[dict(path=p, sha256=sha((ROOT/p).read_bytes())) for p in REFERENCES[:2]],
        priorPinRefreshLineage=lineage,
        retainedActualWitnessSha256=before['actualWitnessSha256'], retainedActualNativeViewsSha256=before['actualNativeViewsSha256'],
        baselinePolicySha256=sha(before_raw), currentPolicySha256=sha(output),
        currentCanonicalPhysicsSha256=sha((ROOT/PHYSICS).read_bytes()), unchangedCanonicalMathematicsSha256=sha((ROOT/MATH).read_bytes()),
        verifiedDemandRows=row_count, witnessedMathAtoms=len(witnessed), verifiedMathViews=len(before['views']), unchangedMathSourceViews=len(math_views),
        verifiedMathSeedTargetPlaces=seeds, verifiedExplicitMathAcquisitionPlaces=conditional,
        verifiedPhysicsSourceViews=63, changedSourcePins=changed_pins, policyRowChanges=[], policyRowChangeCount=0,
        allRetainedWitnessesAndDemandPlacesUnchanged=True, allPhysicsMathLearningSetsUnchanged=False,
        unchangedPhysicsMathLearningSetCount=62, explicitlyExplainedPhysicsMathLearningSetChanges=rp_details,
        removedVoluntaryMPSelectedPlaces=len(removed_mp_files), otherRemovedPhysicsSeedCount=0,
        currentInputFiles=inputs, allRetainedRowChecks=all_row_checks, physicsViewChecks=view_checks,
        independentNativeRPProof=dict(path=str((HERE/'native-rp-closure.actual.json').relative_to(ROOT)), sha256=sha((HERE/'native-rp-closure.actual.json').read_bytes())),
        boundaries=['No Mathematics source target, prerequisite, mapping, acquisition row, floor, gate or test assertion changed.',
          'Three RP Mathematics atoms remain ordinary Mathematics targets; no new foreign acquisition row is justified.',
          'MP removal is a real deliberate offer retirement; all 24 removed effective seeds within these 63 pinned views are enumerated.',
          'This current-state recheck does not certify unchanged Physics payloads or replay the historical backend session.'])
    report_bytes = encode(report).encode()
    if args.write:
        (ROOT/POLICY).write_bytes(output)
        (HERE/'recheck.actual.json').write_bytes(report_bytes)
    else:
        assert (ROOT/POLICY).read_bytes() == output, 'Verified live pin refresh missing'
        assert (HERE/'recheck.actual.json').read_bytes() == report_bytes, 'Saved recheck differs'
    print(json.dumps(dict(status='PASS', changedPins=len(changed_pins), verifiedPins=63, verifiedRows=row_count,
        rowChanges=0, mathAtoms=len(witnessed), unchangedMathViews=len(math_views), currentInputFiles=len(inputs),
        changedInputFiles=sum(p['changed'] for p in inputs), rpMathBefore=88, rpMathAfter=85,
        policySha256=sha(output), reportSha256=sha(report_bytes)), indent=2))


if __name__ == '__main__':
    main()
