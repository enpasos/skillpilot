#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Materialize missing Land Sek-I routes from independent source membership.

The full view determines learning places; the pinned source-membership policy
alone determines seeds. An earlier prerequisite never becomes a source seed.
"""
import argparse
from copy import deepcopy
import hashlib
from pathlib import Path

from normalize_mathematics_stage_views import Normalizer, ROOT, VIEW_DIR, encode, read, structure

from composition_view_voluntary_roles import regular_authoring_input, restore_view_offers

POLICY = ROOT / 'app/scripts/config/math-seki-source-membership.json'


def build_excerpt(full_view, membership, normalizer):
    full_view = regular_authoring_input(full_view)
    seeds = set(membership['seedAtomicGoalIds'])
    seen = set()
    serial = 0

    def visit(node):
        nonlocal serial
        if node['kind'] == 'structure':
            result = deepcopy(node)
            result['children'] = [part for child in node['children'] if (part := visit(child)) is not None]
            return result if result['children'] else None
        goal_id = node.get('goalId')
        if goal_id not in normalizer.goals:
            raise ValueError(f'Unresolved excerpt reference: {goal_id}')
        if node['kind'] == 'goalEntry' and normalizer.goals[goal_id].get('contains'):
            return {**deepcopy(node), 'projectionRole': 'prerequisiteOnly'}
        if node['kind'] == 'canonicalSubtree' and normalizer.goals[goal_id].get('contains'):
            # Keep the real canonical subject/assessment hierarchy while assigning
            # source roles atom by atom. Flattening here would undo the full-view
            # partition and erase reviewed collection identities in the excerpt.
            children = []
            for child_id in normalizer.goals[goal_id]['contains']:
                child = visit(dict(kind='canonicalSubtree', goalId=child_id.split(':')[-1]))
                if child is not None:
                    children.append(child)
            if not children:
                return None
            serial += 1
            result = structure(f'math-seki-membership-{goal_id}-{serial}',
                node.get('displayLabel', normalizer.goals[goal_id]['title']), children)
            result['canonicalSourceGoalId'] = goal_id
            result['originalCanonicalSubtree'] = deepcopy(node)
            return result
        if goal_id in seen:
            return None
        seen.add(goal_id)
        child = dict(kind='goalEntry', goalId=goal_id,
                     projectionRole='target' if goal_id in seeds else 'prerequisiteOnly')
        if node.get('acquisitionPlacement') is True and child['projectionRole'] == 'prerequisiteOnly':
            child['acquisitionPlacement'] = True
        for key in ('displayLabel', 'placementEvidence'):
            if key in node:
                child[key] = deepcopy(node[key])
        return child

    excerpt = deepcopy(full_view)
    excerpt['viewId'] = membership['viewId']
    excerpt['scope'] = dict(jurisdiction='DE-' + membership['state'], schoolForm='Gymnasium', stage='SekI')
    # Global support declarations are not learning-place templates. Process the
    # actual tree first, so an explicit source seed cannot land at the root.
    globals_ = [deepcopy(n) for n in full_view['rootNodes'] if n.get('projectionRole') == 'prerequisiteOnly']
    roots = [part for node in full_view['rootNodes'] if node.get('projectionRole') != 'prerequisiteOnly'
             if (part := visit(node)) is not None]
    missing = seeds - seen
    if missing:
        # Rare GK/LK source differences have an explicit shared source target.
        # Its placement follows its canonical subject phase, never vice versa.
        main = next(n for n in roots if n['kind'] == 'structure')
        for atom in sorted(missing):
            phase = normalizer.phase(atom)
            stage_key = 'SekI' if phase.startswith('J') else 'SekII'
            stage = next((n for n in main['children'] if normalizer.stage(n) == stage_key), None)
            if stage is None:
                stage = structure('sek1' if stage_key == 'SekI' else 'sek-ii',
                    'Sekundarstufe I' if stage_key == 'SekI' else 'Sekundarstufe II', [])
                main['children'].append(stage)
            unit = normalizer.unit(atom, membership['state'], stage_key, None)
            label = normalizer.label(unit)
            year = next((n for n in stage['children'] if n.get('label') == label), None)
            if year is None:
                year = structure('math-seki-source-unit-' + unit.lower().replace('_', '-'), label, [])
                stage['children'].append(year)
            year['children'].append(structure('math-seki-source-' + atom, normalizer.goals[atom]['title'],
                [dict(kind='goalEntry', goalId=atom, projectionRole='target')]))
    excerpt['rootNodes'] = globals_ + roots
    # Atom-role materialization can expose a formerly nested reviewed ref.
    # Apply the same reference-boundary repair as the full-view normalizer.
    normalizer.repair_topic_boundaries(excerpt)
    applicable = {g for g in seeds if normalizer.goal_applies(g, excerpt['scope'])}
    applicable.update(row['goalId'] for row in getattr(normalizer, 'foreign_demands', {}).get(excerpt['viewId'], []))
    learning = applicable | {p for goal in applicable for p in normalizer.prerequisite_closure(goal)}
    def retain_intent(nodes):
        for node in nodes:
            if node['kind'] == 'structure':
                retain_intent(node['children'])
            elif node.get('goalId') not in learning:
                node.pop('acquisitionPlacement', None)
    retain_intent(excerpt['rootNodes'])
    # The full normalization pipeline also owns reviewed cuts, hierarchy and
    # presentation cleanup. A private shortened copy would drift on replay.
    excerpt = normalizer.normalize(excerpt)
    actual = {g for g, role in normalizer.atomic_roles(excerpt['rootNodes']).items() if role == 'target'}
    if actual != seeds:
        raise ValueError(f'Incorrect source membership for {excerpt["viewId"]}: missing={seeds-actual}, added={actual-seeds}')
    return excerpt


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true')
    parser.add_argument('--write', action='store_true')
    parser.add_argument('--input-dir', type=Path, default=VIEW_DIR)
    parser.add_argument('--output-dir', type=Path, default=VIEW_DIR)
    args = parser.parse_args()
    policy = read(POLICY)
    if policy['schemaVersion'] != 1 or len(policy['views']) != 12:
        raise ValueError('Invalid source-membership policy')
    normalizer = Normalizer()
    differences = []
    args.output_dir.mkdir(parents=True, exist_ok=True)
    for row in policy['views']:
        for path, sha in row['sourcePins'].items():
            if hashlib.sha256((ROOT / path).read_bytes()).hexdigest() != sha:
                raise ValueError(f'Stale source-membership evidence: {path}')
        full = read(args.input_dir / f'de-{row["state"].lower()}-gk.view.json')
        excerpt = build_excerpt(full, row, normalizer)
        source = args.input_dir / row['filename']
        result = encode(restore_view_offers(excerpt, read(source), normalizer.goals, normalizer.root_by_landscape) if source.exists() else excerpt)
        output = args.output_dir / row['filename']
        if not output.exists() or output.read_text() != result:
            differences.append(row['filename'])
            if args.write:
                output.write_text(result)
    print(f'Mathematics source-stage excerpts: {len(differences)} differences / 12 routes')
    if args.check and differences:
        raise SystemExit(1)


if __name__ == '__main__':
    main()
