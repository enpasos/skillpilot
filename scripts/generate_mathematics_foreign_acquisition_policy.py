#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Bind reviewed actual foreign consumers to conditional Mathematics places.

The input is an immutable actual-backend witness inventory. Current authored
Physics views supply timing; the old runtime container is never a time source.
No source seed or canonical requirement is created by this policy.
"""
import argparse
from collections import defaultdict
import hashlib
from pathlib import Path
import re

from normalize_mathematics_stage_views import Normalizer, ROOT, read, encode


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def time_unit(node, stage):
    """Interpret only explicit authored time units, not topic text or IDs."""
    label = node.get('label', '')
    if label.startswith('Einführungsphase'):
        return ('SekII', 'E')
    if re.match(r'^Q[1-4]\b', label):
        return ('SekII', label[:2])
    if label.startswith(('Jahrgangsstufe ', 'Jahrgangsstufen ', 'Doppeljahrgang',
                         'Klassenstufe', 'Schuljahrgang', 'Schuljahrgänge', 'Kursstufe:',
                         'Qualifikationsphase: Jahrgangsstufe')):
        years = re.findall(r'\d+', label.split('(')[0])
        if years:
            return (stage, 'J' + '_'.join(years))
    if label.startswith(('Qualifikationsphase', 'Studienstufe', 'Hauptphase')):
        return ('SekII', 'Q')
    # A block or learning-year source does not by itself identify an absolute
    # school year. Keep its path as evidence without inventing a year bound.
    return None


def authored_places(view, normalizer):
    roles = normalizer.atomic_roles(view['rootNodes'])
    seeds = {g for g, role in roles.items() if role == 'target'
             and normalizer.goal_applies(g, view['scope'])}
    result = {}
    def visit(nodes, stage=None, unit=None, trail=()):
        for node in nodes:
            if node['kind'] == 'structure':
                next_stage = normalizer.stage(node) or stage
                next_unit = None if normalizer.stage(node) else unit
                # The first explicit time unit inside the current stage is
                # the authored acquisition place. A nested topic may retain
                # an older source-year title; it cannot replace that place.
                next_unit = next_unit or time_unit(node, next_stage)
                visit(node['children'], next_stage, next_unit, trail + (node['id'],))
            elif node.get('projectionRole', 'target') == 'target':
                atoms = normalizer.atoms(node['goalId']) if node['kind'] == 'canonicalSubtree' else {node['goalId']}
                for atom in atoms & seeds:
                    result.setdefault(atom, {'path': list(trail), 'place': unit})
    visit(view['rootNodes'])
    return result


def earliest_consumer(places, atom, normalizer):
    """Select a current authored consumer at the earliest explicit time unit."""
    consumers = [(goal, location) for goal, location in places.items()
                 if atom in normalizer.prerequisite_closure(goal)]
    bounded = [(goal, location) for goal, location in consumers if location['place']]
    return min(bounded or consumers, default=None, key=lambda item:
               (normalizer.placement_rank(item[1]['place']) if item[1]['place'] else (9, 99, ''), item[0]))


def build(witness_path, native_path, physics_dir, retired_demands=None):
    n = Normalizer()
    actual = read(native_path)
    contexts = {c['id']: c for c in actual['contexts']}
    input_witnesses = read(witness_path)
    current = {}
    for path in physics_dir.glob('*.view.json'):
        view = read(path)
        current[view['viewId']] = (view, path, authored_places(view, n))
    requests = defaultdict(lambda: defaultdict(set))
    for entry in input_witnesses['entries']:
        atom = entry['goalId']
        if atom not in n.math_atoms:
            raise ValueError('Foreign witness is not an atomic Mathematics goal: ' + atom)
        for proof in entry['proofs']:
            context = contexts[proof['context']]
            if context['scope'].get('courseProfile') == 'GK+LK':
                continue  # both actual single-course authorities are bound below
            math = actual['views'][context['mathViewKey']]['viewId']
            physics = actual['views'][context['physicsViewKey']]['viewId']
            requests[math][(physics, atom)].add(proof['context'])
    views, source_pins = {}, {}
    for math, demands in sorted(requests.items()):
        rows = []
        for (physics, atom), context_ids in sorted(demands.items()):
            view, path, places = current[physics]
            source_pins[str(path.relative_to(ROOT))] = digest(path)
            selected = earliest_consumer(places, atom, n)
            if selected is None:
                if retired_demands is None:
                    raise ValueError(f'Actual foreign consumer no longer has source authority: {physics}/{atom}')
                # A reviewed source-scope correction can retire an old observed
                # demand. Never retain a fictitious consumer or silently drop
                # the request: an explicitly requested report binds the full
                # current seed set and its unpruned learning closure.
                learning = set(places)
                for target in places:
                    learning.update(n.prerequisite_closure(target))
                if atom in learning:
                    raise ValueError(f'Cannot retire a still-selected learning atom: {physics}/{atom}')
                retired_demands.append(dict(mathViewId=math, physicsViewId=physics,
                    goalId=atom, actualContexts=sorted(context_ids),
                    currentPhysicsSourcePath=str(path.relative_to(ROOT)),
                    currentPhysicsSourceSha256=digest(path),
                    currentAtomicTargets=sorted(places),
                    currentLearningClosure=sorted(learning)))
                continue
            consumer, location = selected
            pending, seen = [[consumer]], {consumer}
            for chain in pending:
                if chain[-1] == atom:
                    break
                for ref in n.goals[chain[-1]].get('requires', []):
                    prerequisite = ref.split(':')[-1]
                    if prerequisite not in seen:
                        seen.add(prerequisite); pending.append(chain + [prerequisite])
            if chain[-1] != atom:
                raise ValueError('No canonical witness for foreign acquisition')
            rows.append(dict(goalId=atom, physicsViewId=physics, consumerGoalId=consumer,
                requiresPath=chain, consumerStructurePath=location['path'],
                demandPlace=location['place'], actualContexts=sorted(context_ids)))
        views[math] = rows
    return dict(schemaVersion=1,
        policy='Conditional acquisition for actual selected Physics consumers; Mathematics source targets and authoritative learner L remain unchanged.',
        actualWitnessSha256=digest(witness_path), actualNativeViewsSha256=digest(native_path),
        currentPhysicsSourcePins=source_pins, views=views)


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('--witnesses', type=Path, required=True)
    p.add_argument('--native-views', type=Path, required=True)
    p.add_argument('--physics-dir', type=Path, default=ROOT / 'curricula/DE/Gymnasium/composition-views/physik')
    p.add_argument('--output', type=Path, required=True)
    p.add_argument('--retirement-report', type=Path,
                   help='Explicitly audit formerly observed demands that no current selected Physics target needs; otherwise fail closed.')
    args = p.parse_args()
    retired = [] if args.retirement_report else None
    value = build(args.witnesses, args.native_views, args.physics_dir, retired)
    args.output.write_text(encode(value))
    if args.retirement_report:
        args.retirement_report.write_text(encode(dict(
            actualWitnessSha256=digest(args.witnesses),
            actualNativeViewsSha256=digest(args.native_views),
            policySha256=digest(args.output), retiredDemands=retired)))
    print(f"Foreign acquisition policy: {len(value['views'])} Mathematics views; "
          f"{sum(len(rows) for rows in value['views'].values())} witnessed demands")


if __name__ == '__main__':
    main()
