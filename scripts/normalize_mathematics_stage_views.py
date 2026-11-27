#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Expose source-backed Mathematics stages and explicit topic partial orders.

This is a presentation transform. Canonical prerequisites, source inputs and
reference roles are never edited. Source-extraction mappings take precedence
over canonical phase hints; unallocated source content retains a documented
editorial placement. Run --check to enforce normalization, --write to apply it.
"""
from __future__ import annotations

import argparse
from collections import defaultdict
from copy import deepcopy
import hashlib
import json
from pathlib import Path

from legacy_composition_view import assert_supported_composition_view, read_composition_view
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
VIEW_DIR = ROOT / 'curricula/DE/Gymnasium/composition-views/mathematik'
SCHEMA = 'https://skillpilot.com/schemas/composition-view/v1.2/composition-view.schema.json'


def read(path):
    return json.loads(Path(path).read_text())


def encode(value):
    return json.dumps(value, ensure_ascii=False, indent=2) + '\n'


def structure(identifier, label, children):
    return dict(kind='structure', id=identifier, label=label.replace(' (Bestands-ID)', ''), children=children,
                childOrder={'after': []})


class Normalizer:
    def __init__(self, root=ROOT):
        self.root = Path(root)
        self.goals = {}
        self.math_atoms = set()
        for path in (self.root / 'curricula/DE/Gymnasium/canonical').glob('*.json'):
            goals = read(path).get('goals', [])
            self.goals.update({g['id']: g for g in goals})
            if 'MATHEMATIK' in path.name:
                self.math_atoms.update(g['id'] for g in goals if not g.get('contains'))
        self.cache = {}
        self.depth_cache = {}
        self.parents = defaultdict(list)
        for goal in self.goals.values():
            for child in goal.get('contains', []):
                self.parents[child.split(':')[-1]].append(goal['id'])
        self.evidence = defaultdict(lambda: defaultdict(list))
        self.sources = {}
        self.decisions = {}
        self.moves = []
        self.placements = {}
        self.support_places = {}
        self.acquisitions = []
        self.order_conflicts = []
        self.acquisition_repairs = []
        self.prerequisite_cache = {}
        self.learning_window_conflicts = []
        foreign_policy = self.root / 'app/scripts/config/math-foreign-acquisition-demand.json'
        self.foreign_demands = read(foreign_policy).get('views', {}) if foreign_policy.exists() else {}
        self.preparation_topic_repairs = read(self.root / 'app/scripts/config/math-preparation-topic-repairs.json')['rules']
        topic_labels = read(self.root / 'app/scripts/config/math-single-skill-topic-labels.json')
        self.single_skill_topic_labels = topic_labels['labels']
        self.common_unit_labels = topic_labels.get('unitLabels', {})
        self.common_family_labels = topic_labels.get('familyLabels', {})
        self.reviewed_topic_hierarchy = read(self.root / 'app/scripts/config/math-reviewed-topic-hierarchy.json')['rules']
        self.reviewed_topic_cuts = read(self.root / 'app/scripts/config/math-reviewed-topic-reference-cuts.json')['rules']
        bremen_policy = read(self.root / 'app/scripts/config/math-bremen-current-stage-placements.json')
        self.bremen_placements = {row['goalId']: row for row in bremen_policy['rows']}
        for path, expected in bremen_policy['sourcePins'].items():
            actual = hashlib.sha256((self.root / path).read_bytes()).hexdigest()
            if actual != expected:
                raise ValueError('Changed Bremen source-time authority: ' + path)
            self.sources[path] = actual
        authority_manifest = read(self.root / 'app/scripts/config/math-stage-view-authority.manifest.json')
        authority = read(self.root / authority_manifest['baseViewsPath'])['baseViews']
        external = read(self.root / authority_manifest['externalBaseViewsPath'])['baseViews']
        authority.update({name: external[name] for name in authority_manifest['externalBaseViewFiles']})
        if len(authority) != 70:
            raise ValueError('Incomplete Mathematics base-view authoring authority')
        for name, value in authority.items():
            assert_supported_composition_view(value, name)
            digest = hashlib.sha256(json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode()).hexdigest()
            if digest != authority_manifest['original88CanonicalJsonSha256'][name]:
                raise ValueError('Changed original Mathematics authoring authority: ' + name)
        self.authority_views = {value['viewId']: value for value in authority.values()}
        self.authority_files = authority
        self.full_view_inputs = dict(self.authority_views)
        for path in sorted((self.root / 'curricula/DE/Gymnasium/mapping').glob('DE-*/**/*math*source_extraction*.json')):
            mapping = read(path)
            source_path = mapping.get('sourceExtractionPath')
            if not source_path:
                continue
            source = read(self.root / source_path)
            source_goals = {g['id']: g for g in source.get('sourceGoals', [])}
            state = source.get('jurisdiction', mapping.get('jurisdiction', ''))[-2:]
            self.sources[source_path] = hashlib.sha256((self.root / source_path).read_bytes()).hexdigest()
            self.sources[str(path.relative_to(self.root))] = hashlib.sha256(path.read_bytes()).hexdigest()
            for row in mapping.get('mappings', []):
                original = source_goals.get(row.get('legacyGoalId'))
                goal_id = row.get('canonicalGoalId')
                if not original or goal_id not in self.goals:
                    continue
                tags = original.get('tags', [])
                stage = original.get('stage') or next((t[6:] for t in tags if t.startswith('stage:')), source.get('stage'))
                if stage not in ('SekI', 'SekII'):
                    continue
                unit = self.source_unit(state, stage, original)
                if not unit:
                    continue
                for atom in self.atoms(goal_id):
                    self.evidence[(state, stage)][atom].append(dict(unit=unit, source=source_path,
                        sourceGoalId=original['id'], sourceSpan=original.get('sourceSpan'),
                        topicCode=original.get('topicCode'), mappedCanonicalGoalId=goal_id,
                        canonicalDistance=self.depths(goal_id)[atom],
                        matchType=row.get('matchType'),
                        sourcePhase=original.get('phase'),
                        specialAccess=state == 'TH' and original.get('phase') == '11S',
                        durationModels=[t.split(':', 1)[1] for t in tags if t.startswith('durationModel:')]))

    def atoms(self, goal_id):
        goal_id = goal_id.split(':')[-1]
        if goal_id not in self.cache:
            goal = self.goals.get(goal_id, {})
            children = goal.get('contains', [])
            self.cache[goal_id] = set().union(*(self.atoms(c) for c in children)) if children else {goal_id}
        return self.cache[goal_id]

    def phase(self, goal_id):
        """GLOBAL is not a year; use the nearest authored subject parent.

        E.g. the GLOBAL scalar-product projection definition belongs to its Q2
        scalar-product cluster, not to the default first lower-secondary year.
        """
        original = self.goals.get(goal_id, {})
        if 'Orientation' in original.get('tags', []) and 'phase:SekI' in original.get('tags', []):
            # Editorial entry to the lower stage, not an official year claim.
            # GLOBAL must never fall through to a late upper-stage semester.
            return 'J5'
        primary = original.get('authoringMetadata', {}).get('primaryAssessedGoalId')
        original_phase = original.get('phase') or original.get('dimensionTags', {}).get('phase', '')
        if original.get('nodeKind') == 'exam' and primary in self.goals and primary != goal_id and original_phase in ('', 'GLOBAL'):
            # The explicit assessment binding is a concrete acquisition context.
            # A GLOBAL own assessment must not pull its J9 skill into default J5.
            return self.phase(primary)
        queue = [goal_id]
        seen = set()
        for current in queue:
            if current in seen:
                continue
            seen.add(current)
            goal = self.goals.get(current, {})
            phase = goal.get('phase') or goal.get('dimensionTags', {}).get('phase', '')
            if phase and phase not in ('GLOBAL', 'SekI', 'SekII'):
                return phase
            queue.extend(sorted(self.parents[current]))
        return ''

    def depths(self, goal_id):
        if goal_id not in self.depth_cache:
            distances = {goal_id: 0}
            queue = [goal_id]
            for current in queue:
                for child in self.goals[current].get('contains', []):
                    child = child.split(':')[-1]
                    if child not in distances:
                        distances[child] = distances[current] + 1
                        queue.append(child)
            self.depth_cache[goal_id] = distances
        return self.depth_cache[goal_id]

    def source_evidence(self, state, stage, atom, duration):
        matches = [e for e in self.evidence[(state, stage)].get(atom, [])
                   if (not e['durationModels'] or (duration or 'G9') in e['durationModels'])
                   and not (e.get('matchType') == 'partial' and e['canonicalDistance'] > 0)]
        explicit_duration = [e for e in matches if (duration or 'G9') in e['durationModels']]
        matches = explicit_duration or matches
        if matches:
            distance = min(e['canonicalDistance'] for e in matches)
            matches = [e for e in matches if e['canonicalDistance'] == distance]
        return matches

    def atomic_roles(self, nodes):
        assignments = {}
        def visit(items):
            for node in items:
                if node['kind'] == 'structure':
                    visit(node['children'])
                    continue
                if 'goalId' not in node:
                    raise ValueError('Unexpected non-goal reference')
                role = node.get('projectionRole', 'target')
                queue = [(node['goalId'], 0)]
                seen = set()
                for goal_id, distance in queue:
                    if goal_id in seen:
                        continue
                    seen.add(goal_id)
                    candidate = (2 if node['kind'] == 'goalEntry' else 1, -distance, role == 'target')
                    if candidate > assignments.get(goal_id, ((-1,), None))[0]:
                        assignments[goal_id] = (candidate, role)
                    if node['kind'] == 'canonicalSubtree':
                        queue.extend((c.split(':')[-1], distance + 1) for c in self.goals.get(goal_id, {}).get('contains', []))
        visit(nodes)
        return {g: a[1] for g, a in assignments.items() if not self.goals.get(g, {}).get('contains')}

    def source_unit(self, state, stage, goal):
        tags = goal.get('tags', [])
        if state == 'BE' and stage == 'SekII' and re.fullmatch(r'Q[1-4](?:/[1-4])*', goal.get('phase', '')):
            # Berlin RLP 3.2.2 prints the course-half-year allocation beside
            # the competencies. Its retained extraction uses a phase field,
            # unlike Brandenburg's phase tags. A repeated competency receives
            # one acquisition place in its first named course half-year.
            return 'Q' + min(re.findall(r'[1-4]', goal['phase']))
        for prefix in ('gradeBand:', 'grade:', 'phase:', 'semester:'):
            values = [t[len(prefix):] for t in tags if t.startswith(prefix)]
            if values:
                value = values[0].replace('J', '').replace('_', '/').replace('S', 'Q')
                if value == '5-12':
                    return None
                if value == '11Q':
                    return 'E'
                return 'J' + value.replace('/', '_') if value[0].isdigit() else value.replace('/', '_')
        code = goal.get('topicCode', '')
        if state == 'RP' and stage == 'SekI':
            for tag, unit in [('orientierungsstufe', 'J5_6'), ('klasse7-8', 'J7_8'), ('klasse9-10-msa', 'J9_10')]:
                if 'rpStage:' + tag in tags:
                    return unit
        if state == 'MV' and stage == 'SekI':
            match = re.search(r'-J(5|6|7|8|9|10)(?:-|$)', code)
            return 'J' + match[1] if match else None
        if state == 'NW':
            if stage == 'SekI':
                return next((unit for token, unit in [('ERPROBUNG', 'J5_6'), ('STUFE-1', 'J7_8'), ('STUFE-2', 'J9_10')] if token in code), None)
            return 'E' if '-E-' in code else 'Q' if '-GK-' in code or '-LK-' in code else None
        if state == 'NI' and stage == 'SekII':
            return 'E' if '-E-' in code else 'Q' if '-Q-' in code else None
        if stage == 'SekII' and state in ('BW', 'RP', 'SH', 'HB', 'MV'):
            return None  # the retained source does not prescribe semesters
        return None

    @staticmethod
    def rank(unit):
        if unit.startswith('J'):
            return int(re.match(r'J(\d+)', unit)[1])
        return {'E': 11, 'Q': 12, 'Q1': 12, 'Q1_Q2': 12, 'Q2': 13,
                'Q3': 14, 'Q3_Q4': 14, 'Q4': 15, 'Abitur': 20}.get(unit, 16)

    def unit(self, atom, state, stage, duration):
        goal = self.goals.get(atom, {})
        phase = self.phase(atom)
        if goal.get('nodeKind') == 'exam' and ('abitur' in goal.get('title', '').lower() or 'abitur' in phase.lower()):
            return 'Abitur'
        matches = self.source_evidence(state, stage, atom, duration)
        if matches:
            unit = min((m['unit'] for m in matches), key=self.rank)
        elif stage == 'SekI':
            year = int(re.search(r'(\d+)', phase)[1]) if re.search(r'\d+', phase) and phase.startswith('J') else 5
            year = min(10, max(5, year))
            if state in ('BW', 'HH', 'TH', 'RP', 'NW'):
                unit = 'J5_6' if year < 7 else 'J7_8' if year < 9 else 'J9_10'
            elif state == 'ST':
                unit = 'J5_6' if year < 7 else 'J7_8' if year < 9 else 'J' + str(year)
            elif state == 'SL':
                unit = 'J5_6' if year < 7 else 'J' + str(year)
            elif state == 'SH':
                unit = 'J5_6' if year < 7 else ('J6_7_8' if duration == 'G8' else 'J7_8_9') if year < 10 else ('J9' if duration == 'G8' else 'J10')
            else:
                unit = 'J' + str(year)
        elif state in ('SN', 'ST', 'TH'):
            unit = 'J11_12'
        elif state == 'BW':
            unit = 'Q'
        elif state == 'HH':
            unit = 'Q1_Q2' if phase in ('E', 'Q1', 'Q2') else 'Q3_Q4'
        elif state in ('BE', 'BB', 'DE', 'HE'):
            unit = phase if phase in ('E', 'Q1', 'Q2', 'Q3', 'Q4') else 'E'
        elif state == 'BY':
            unit = 'J11' if phase == 'E' else 'J12' if phase in ('Q1', 'Q2') else 'J13'
        else:
            unit = 'E' if phase == 'E' else 'Q'
        if state == 'RP' and duration == 'G8' and unit == 'J9_10':
            unit = 'J9'
        self.decisions[(state, stage, duration, atom)] = dict(goalId=atom, state=state, stage=stage,
            durationModel=duration, unit=unit, evidence=matches,
            excludedPartialClusterSourceGoalIds=sorted({e['sourceGoalId'] for e in self.evidence[(state, stage)].get(atom, [])
                if e.get('matchType') == 'partial' and e['canonicalDistance'] > 0}),
            basis=('special-access-editorial-placement' if matches and all(m.get('specialAccess') for m in matches)
                   else 'source-mapping' if matches else 'retained-editorial-placement'))
        return unit

    def nominal_place(self, atom, state, stage, duration):
        if state == 'HB' and stage == 'SekI':
            reviewed = getattr(self, 'bremen_placements', {}).get(atom, {})
            if reviewed.get('decision', '').startswith('J9_'):
                return 'SekI', 'J9'
            if reviewed.get('decision', '').startswith('upper_') or self.phase(atom) == 'J10':
                return 'SekII', 'E'
        return stage, self.unit(atom, state, stage, duration)

    @staticmethod
    def stage(node):
        if node.get('kind') != 'structure':
            return None
        label = node.get('label', '')
        if re.match(r'^Sekundarstufe II(?:\b|\s|\()', label):
            return 'SekII'
        if re.match(r'^Sekundarstufe I(?:\b|\s|\()', label):
            return 'SekI'
        return None

    @staticmethod
    def year_structure(node):
        label = node.get('label', '')
        return node.get('kind') == 'structure' and bool(re.match(
            r'^(?:Jahrgangsstufe|Jahrgangsband|Klassenstufe|Klassen |Orientierungsstufe|Einführungsphase|Qualifikationsphase|Q[1-4](?!\.\d)(?:\b|:)|Abiturprüfung|Semester|E-Phase|Q-Phase|Mathematik: Kursstufe)', label))

    def classify_stage(self, node):
        if node.get('kind') == 'structure':
            values = [self.classify_stage(c) for c in node['children']]
            return 'SekI' if values.count('SekI') >= values.count('SekII') else 'SekII'
        goal = self.goals.get(node.get('goalId'), {})
        phase = self.phase(node.get('goalId'))
        return 'SekI' if phase.startswith('J') and re.match(r'J(?:[5-9]|10)(?:\b|$)', phase) else 'SekII'

    def partition(self, node, state, stage, duration):
        if node.get('projectionRole') == 'prerequisiteOnly':
            goal_id = node.get('goalId')
            if goal_id in self.goals and not self.goals[goal_id].get('contains'):
                place = self.support_places.get(goal_id, self.nominal_place(goal_id, state, stage, duration))
                clone = deepcopy(node)
                # Runtime acquisition templates are explicit atomic goal entries;
                # broad global support declarations remain separate below.
                if self.original_roles.get(goal_id) == 'prerequisiteOnly':
                    clone['kind'] = 'goalEntry'
                return {':'.join(place): [clone]}
            return {'support': [deepcopy(node)]}
        if node['kind'] == 'structure':
            groups = defaultdict(list)
            for child in node['children']:
                for unit, parts in self.partition(child, state, stage, duration).items():
                    groups[unit].extend(parts)
            if self.year_structure(node) or self.stage(node):
                return groups
            result = {}
            for unit, children in groups.items():
                if unit == 'support':
                    result[unit] = children
                else:
                    clone = deepcopy(node)
                    clone['id'] = node['id'] + '-' + unit.lower().replace('_', '-').replace(':', '-')
                    clone['children'] = children
                    clone.pop('childOrder', None)
                    result[unit] = [clone]
            identity = node.get('canonicalSourceGoalId')
            if identity and 'Assessment' in self.goals.get(identity, {}).get('tags', []) and len(result) > 1:
                owner = min((unit for unit in result if unit != 'support'),
                    key=lambda unit: (-len(groups[unit]), self.placement_rank(unit)), default=None)
                for unit, clones in result.items():
                    if unit != owner:
                        for clone in clones:
                            if clone['kind'] == 'structure':
                                clone.pop('canonicalSourceGoalId', None)
                                clone.pop('originalCanonicalSubtree', None)
            return result
        goal_id = node.get('goalId')
        if not goal_id or goal_id not in self.goals:
            raise ValueError(f'Unresolved Mathematics reference {node}')
        atoms = self.atoms(goal_id)
        units = {':'.join(self.placements.get(atom, self.nominal_place(atom, state, stage, duration))) for atom in atoms}
        if node['kind'] == 'goalEntry':
            # A goalEntry on a cluster assigns that cluster only. Expanding it
            # would incorrectly enroll its descendants as new atomic targets.
            return {min(units, key=self.placement_rank): [deepcopy(node)]}
        goal = self.goals[goal_id]
        temporal = self.year_structure(dict(kind='structure', label=goal['title'])) or self.stage(
            dict(kind='structure', label=goal['title']))
        if len(units) == 1 and not temporal:
            return {next(iter(units)): [deepcopy(node)]}
        # Partition the authored contains hierarchy, not its sorted atomic
        # closure. Otherwise a split year silently destroys its subject units
        # and real assessment collections, mixing all tasks with subject atoms.
        by_unit = defaultdict(list)
        for child_id in goal.get('contains', []):
            child = dict(kind='canonicalSubtree', goalId=child_id.split(':')[-1],
                **({'projectionRole': node['projectionRole']} if 'projectionRole' in node else {}))
            for unit, parts in self.partition(child, state, stage, duration).items():
                by_unit[unit].extend(parts)
        if temporal:
            return by_unit
        result = {}
        assessment = 'Assessment' in goal.get('tags', [])
        # A collection has one canonical identity even if one of its existing
        # tasks must be acquired earlier. Its main remaining task group owns
        # the identity; moved task refs retain their own exact goal identities.
        collection_unit = min(by_unit, key=lambda unit: (-sum(len(self.atoms(c['goalId'])) if 'goalId' in c else 1
            for c in by_unit[unit]), self.placement_rank(unit))) if assessment else None
        for unit, children in by_unit.items():
            if unit == 'support':
                result[unit] = children
                continue
            replacement = structure('math-source-' + goal_id + '-' + unit.lower().replace(':', '-').replace('_', '-'),
                                    node.get('displayLabel', goal['title']), children)
            if not assessment or unit == collection_unit:
                replacement['canonicalSourceGoalId'] = goal_id
                replacement['originalCanonicalSubtree'] = deepcopy(node)
            result[unit] = [replacement]
        return result

    def placement_rank(self, key):
        stage, unit = key.split(':') if isinstance(key, str) else key
        return (0 if stage == 'SekI' else 1, self.rank(unit), unit)

    def plan_learning_places(self, stage_nodes, view):
        state = view['scope'].get('jurisdiction', 'DE-DE')[-2:]
        duration = view['scope'].get('durationModel')
        roles = self.atomic_roles(view['rootNodes'])
        self.original_roles = roles
        self.placements = {}
        self.support_places = {}
        def visit(nodes, stage, hint=None):
            for node in nodes:
                if node['kind'] == 'structure':
                    nested_hint = hint
                    if state == 'SH' and duration:
                        nested_hint = next((unit for prefix, unit in [
                            ('sh-jg5-6-', 'J5_6'),
                            ('sh-jg7-9-', 'J6_7_8' if duration == 'G8' else 'J7_8_9'),
                            ('sh-jg10-', 'J9' if duration == 'G8' else 'J10'),
                        ] if node['id'].startswith(prefix)), hint)
                    if nested_hint is None:
                        label = node.get('label', '')
                        year = re.match(r'^Jahrgangsstufe (\d+)\b', label)
                        if year:
                            nested_hint = 'J' + year[1]
                        elif label.startswith('Einführungsphase'):
                            nested_hint = 'E'
                        elif re.match(r'^Q[1-4]\b', label):
                            nested_hint = label[:2]
                    visit(node['children'], stage, nested_hint)
                    continue
                if node.get('projectionRole') == 'prerequisiteOnly':
                    goal_id = node.get('goalId')
                    if goal_id in self.goals and not self.goals[goal_id].get('contains'):
                        self.support_places[goal_id] = (stage, hint) if hint and state != 'HB' else self.nominal_place(goal_id, state, stage, duration)
                    continue
                atoms = {node['goalId']} if node['kind'] == 'goalEntry' else self.atoms(node['goalId'])
                for atom in atoms:
                    if roles.get(atom) != 'target':
                        continue
                    actual_stage = stage
                    phase = self.phase(atom)
                    if stage == 'SekI' and phase in ('E', 'Q1', 'Q2', 'Q3', 'Q4') and (
                            not self.evidence[(state, stage)].get(atom)
                            or (phase == 'Q4' and 'Assessment' in self.goals[atom].get('tags', [])
                                and self.goals[atom].get('nodeKind') != 'exam')):
                        actual_stage = 'SekII'
                        self.moves.append(dict(viewId=view['viewId'], goalId=atom, sourcePlacement=[stage],
                            learningPlacement=[actual_stage], reason='Reused upper-secondary process assessment; prerequisites require upper-secondary acquisition. Source target membership retained.'))
                    place = (actual_stage, hint) if state == 'SH' and duration and hint and actual_stage == stage else self.nominal_place(atom, state, actual_stage, duration)
                    if atom not in self.placements or self.placement_rank(place) < self.placement_rank(self.placements[atom]):
                        self.placements[atom] = place
        for stage, nodes in stage_nodes.items():
            visit(nodes, stage)
        changed = True
        while changed:
            changed = False
            for dependent in sorted(self.placements):
                place = self.placements[dependent]
                for required in sorted(self.prerequisite_closure(dependent)):
                    previous = self.placements.get(required)
                    if previous and self.placement_rank(previous) > self.placement_rank(place):
                        self.moves.append(dict(viewId=view['viewId'], goalId=required, requiredBy=dependent,
                            sourcePlacement=list(previous), learningPlacement=list(place),
                            reason='Existing canonical prerequisite needed before this target; source membership and role retained.'))
                        self.placements[required] = place
                        changed = True

    def wrap_topics(self, nodes, parent_id):
        result, loose = [], defaultdict(list)
        for node in nodes:
            if node['kind'] == 'structure':
                result.append(node)
            else:
                goal = self.goals.get(node.get('goalId'), {})
                if goal.get('contains'):
                    result.append(structure(parent_id + '-topic-' + node['goalId'],
                        node.get('displayLabel', goal['title']), [node]))
                elif goal.get('nodeKind') == 'memory' or any(t.lower() in ('motivation', 'orientation') for t in goal.get('tags', [])):
                    result.append(node)
                else:
                    parents = [p for p in self.parents[node['goalId']]
                               if 'root' not in self.goals[p].get('tags', [])
                               and not re.match(r'^(?:Jahrgang|Sekundarstufe|Einführungsphase|Qualifikationsphase)', self.goals[p]['title'])]
                    topic = min(parents, key=lambda p: (len(self.atoms(p)), p)) if parents else node['goalId']
                    loose[topic].append(node)
        for topic, children in sorted(loose.items()):
            result.append(structure(parent_id + '-content-' + topic, self.goals[topic]['title'], children))
        return result

    def sort_topics(self, node, targets):
        if node['kind'] != 'structure':
            if node.get('goalId') not in self.goals:
                return set()
            return ({node['goalId']} if node['kind'] == 'goalEntry' else self.atoms(node['goalId'])) & targets
        children = node['children']
        atoms = [self.sort_topics(child, targets) for child in children]
        owners = {atom: i for i, group in enumerate(atoms) for atom in group}
        incoming = [set() for child in children]
        for i, group in enumerate(atoms):
            for atom in group:
                for required in self.goals[atom].get('requires', []):
                    owner = owners.get(required.split(':')[-1])
                    if owner is not None and owner != i:
                        incoming[i].add(owner)
        ordered = []
        remaining = set(range(len(children)))
        while remaining:
            ready = [i for i in sorted(remaining) if not (incoming[i] & remaining)]
            if not ready:
                # Real group cycles are retained for the independent review;
                # removing an authored after chain never hides prerequisites.
                ordered.extend(sorted(remaining))
                break
            ordered.extend(ready)
            remaining.difference_update(ready)
        node['children'] = [children[i] for i in ordered]
        return set().union(*atoms) if atoms else set()

    @staticmethod
    def label(unit):
        if unit.startswith('J'):
            return ('Jahrgangsstufen ' if '_' in unit else 'Jahrgangsstufe ') + unit[1:].replace('_', '/')
        return {'E': 'Einführungsphase', 'Q': 'Qualifikationsphase',
                'Q1_Q2': 'Semester 1/2', 'Q3_Q4': 'Semester 3/4',
                'Abitur': 'Abiturprüfung'}.get(unit, unit)

    def goal_applies(self, goal_id, scope):
        goal = self.goals[goal_id]
        values = {t.upper() for t in goal.get('tags', [])}
        for entries in goal.get('applicability', {}).values():
            values.update(str(v).upper() for v in entries)
        courses = values & {'GK', 'LK', 'GK+LK'}
        if 'GK+LK' in courses:
            courses.update(('GK', 'LK'))
        course = scope.get('courseProfile')
        bavarian_math_scope = scope.get('jurisdiction') == 'DE-BY' and goal_id in getattr(self, 'math_atoms', set())
        if not bavarian_math_scope and course and courses and not (set(course.split('+')) & courses):
            return False
        durations = values & {'G8', 'G9'}
        if scope.get('durationModel') and durations and scope['durationModel'] not in durations:
            return False
        jurisdictions = {v for v in values if re.fullmatch(r'DE-[A-Z]{2}', v)}
        jurisdiction = scope.get('jurisdiction')
        return not jurisdiction or not jurisdictions or jurisdiction in jurisdictions

    def declare_orders(self, view, report_conflicts=True):
        self.report_order_conflicts = report_conflicts
        roles = self.atomic_roles(view['rootNodes'])
        seeds = {g for g, role in roles.items()
                 if role == 'target' and self.goal_applies(g, view['scope'])}
        # Reviewed actual Physics consumers authorize conditional own-subject
        # acquisition, including its complete preparation chain. This is order
        # authority only: source target membership is unchanged.
        seeds.update(row['goalId'] for row in getattr(self, 'foreign_demands', {}).get(view['viewId'], []))
        learning = set(seeds)
        queue = list(seeds)
        for atom in queue:
            for reference in self.goals[atom].get('requires', []):
                required = reference.split(':')[-1]
                if required not in learning:
                    learning.add(required)
                    queue.append(required)
        self.order_learning = learning
        self.order_targets = {g for g, role in roles.items() if role == 'target' and g in learning}
        self.order_view_id = view['viewId']
        for node in view['rootNodes']:
            self.explicit_orders(node)

    def explicit_orders(self, node):
        if node['kind'] != 'structure':
            if node.get('projectionRole') == 'prerequisiteOnly':
                atom = node['goalId']
                return {atom} if node.get('acquisitionPlacement') is True and atom in getattr(self, 'order_learning', {atom}) else set()
            if node.get('goalId') not in self.goals:
                return set()
            atoms = self.atoms(node['goalId']) if node['kind'] == 'canonicalSubtree' else {node['goalId']}
            return atoms & getattr(self, 'order_targets', atoms)
        if node['id'] == 'sek2' and self.stage(node) == 'SekII':
            node['id'] = 'sek-ii'
        groups = []
        for child in node['children']:
            atoms = self.explicit_orders(child)
            if child['kind'] == 'structure':
                groups.append((child['id'], atoms, child['label']))
            else:
                # Canonical references are individual own atoms, not invented
                # contiguous sibling units. Only authored structures are units.
                groups.extend((None, {atom}, self.goals[atom]['title']) for atom in sorted(atoms))
        children = [c for c in node['children'] if c['kind'] == 'structure']
        chronological = (self.stage(node) and all(self.year_structure(c) for c in children)) or (
            bool(children) and all(self.stage(c) for c in children))
        positions = {key: i for i, (key, _, _) in enumerate(groups) if key}
        owners = {atom: i for i, (_, atoms, _) in enumerate(groups) for atom in atoms}
        adjacency = [set() for _ in groups]
        for dependent, (_, atoms, _) in enumerate(groups):
            for atom in atoms:
                for required in self.goals[atom].get('requires', []):
                    prerequisite = owners.get(required.split(':')[-1])
                    if prerequisite is not None and prerequisite != dependent:
                        adjacency[prerequisite].add(dependent)
        chronological_edges = [(positions[a['id']], positions[b['id']])
                               for a, b in zip(children, children[1:])] if chronological else []
        for a, b in chronological_edges:
            adjacency[a].add(b)
        def reachable(start):
            seen, queue = set(), list(adjacency[start])
            while queue:
                current = queue.pop()
                if current not in seen:
                    seen.add(current); queue.extend(adjacency[current])
            return seen
        closure = [reachable(i) for i in range(len(groups))]
        cyclic = [i for i, descendants in enumerate(closure) if i in descendants]
        if cyclic and getattr(self, 'report_order_conflicts', True):
            self.order_conflicts.append(dict(viewId=getattr(self, 'order_view_id', ''),
                parentId=node['id'], children=[groups[i][2] for i in cyclic],
                reason='Grouping is not learnable as contiguous units; no cyclic after is authored.'))
        unit_indices = list(positions.values())
        edges = {(a, b) for a in unit_indices for b in unit_indices if a != b
                 and b in adjacency[a] and a not in closure[b]}
        edges.update(chronological_edges)
        # E3 covers direct atomic demand cuts whose two children are units.
        # Paths through own atoms carry their canonical demand without imposing
        # extra whole-unit completion (the explicit E3 own-atom exception).
        unit_adjacency = {a: {b for source, b in edges if source == a} for a in unit_indices}
        edge_closure = set()
        for a in unit_indices:
            seen, pending = set(), list(unit_adjacency[a])
            while pending:
                b = pending.pop()
                if b not in seen:
                    seen.add(b); pending.extend(unit_adjacency[b])
            edge_closure.update((a, b) for b in seen)
        # E4: only the transitive reduction, never topic array adjacency.
        reduced = {(a, b) for a, b in edge_closure if not any((a, m) in edge_closure and (m, b) in edge_closure
                    for m in unit_indices if m not in (a, b))}
        node['childOrder'] = {'after': [dict(unit=groups[b][0], after=groups[a][0])
            for a, b in sorted(reduced)]}
        return set().union(*(atoms for _, atoms, _ in groups)) if groups else set()

    def repair_fraction_topic(self, view):
        """Keep the two arithmetic steps with their prerequisites/applications.

        Independent content review: the old 'additional competences' group
        separated these intermediate steps from both ends of the same chain.
        """
        structures = {}
        def visit(nodes):
            for node in nodes:
                if node['kind'] == 'structure':
                    structures[node['id']] = node
                    visit(node['children'])
        visit(view['rootNodes'])
        source, destination = structures.get('j8-additional-competencies'), structures.get('j8-fractions')
        if not source or not destination:
            return
        ids = ['15512e77-31e3-5222-8a6b-84791618e5ce', '76478e47-5ff9-5de1-b601-5e6e436ad855']
        moved = [node for goal_id in ids for node in source['children'] if node.get('goalId') == goal_id]
        if not moved:
            return
        if len(moved) != 2:
            raise ValueError('Incomplete fraction-operation placement repair')
        source['children'] = [node for node in source['children'] if node.get('goalId') not in ids]
        destination['children'][2:2] = moved

    def repair_he_probability_place(self, view):
        """G8 6G.3 explicitly contains Laplace probability; 5G.1 has counts.

        Keep the source target and its role, but do not put its full probability
        comparison in the natural-number unit merely because no place existed.
        """
        if view['viewId'] != 'de-he-gym-seki-math-g8':
            return
        structures = {}
        def collect(nodes):
            for node in nodes:
                if node['kind'] == 'structure':
                    structures[node['id']] = node
                    collect(node['children'])
        collect(view['rootNodes'])
        origin = structures['he-lower-5-g8-5g-1']
        destination = structures['he-lower-6-g8-6g-3']
        goal = '5a2371fd-74ce-5013-932e-35d3713aeaf7'
        moved = [node for node in origin['children'] if node.get('goalId') == goal]
        origin['children'] = [node for node in origin['children'] if node.get('goalId') != goal]
        destination['children'].extend(moved)

    def ensure_stage_root(self, view):
        stages = [node for node in view['rootNodes'] if self.stage(node)]
        if len(stages) < 2:
            return
        if any(node.get('id') == 'math-root' for node in view['rootNodes']):
            raise ValueError('Stage roots conflict with existing Mathematics wrapper')
        stages.sort(key=lambda node: self.stage(node) == 'SekII')
        wrapper = structure('math-root', 'Mathematik', stages)
        result = []
        inserted = False
        for node in view['rootNodes']:
            if self.stage(node):
                if not inserted:
                    result.append(wrapper); inserted = True
            else:
                result.append(node)
        view['rootNodes'] = result

    def repair_he_neutral_preparation(self, view):
        """Retain neutral HE targets while honoring their actual early consumers."""
        if view['viewId'] not in ('de-he-gym-math-gk', 'de-he-gym-math-lk'):
            return
        reviewed = {'f242a3e8-55a3-492e-8354-b81b24cdbb78', 'd668c22d-caeb-5e91-8980-721c931a2bcf',
                    '9278bc5e-a77f-5f72-8636-0d0d3e3d32ae', 'fcfbff12-bd03-52ec-b242-a693212b3d2b',
                    '496f16a0-c031-5753-b988-d6cd3cab595e', '647ec09d-68ae-57db-9ca4-aeb2da4218f1'}
        roles = self.atomic_roles(view['rootNodes'])
        places, refs = {}, {}
        def visit(nodes, parent=None, stage=None, unit=None):
            for node in nodes:
                if node['kind'] == 'structure':
                    next_stage = self.stage(node) or stage
                    next_unit = None if self.stage(node) else unit
                    title = node['label']
                    year = re.match(r'^Jahrgangsstufe (\d+)\b', title)
                    if year:
                        next_unit = 'J' + year[1]
                    elif title.startswith('Einführungsphase'):
                        next_unit = 'E'
                    elif re.match(r'^Q[1-4]\b', title):
                        next_unit = title[:2]
                    visit(node['children'], node, next_stage, next_unit)
                elif node.get('projectionRole') != 'prerequisiteOnly' and stage and unit:
                    values = self.atoms(node['goalId']) if node['kind'] == 'canonicalSubtree' else {node['goalId']}
                    for atom in values:
                        if roles.get(atom) == 'target' and self.goal_applies(atom, view['scope']):
                            places[atom] = (stage, unit, parent)
                    if node.get('goalId') in reviewed:
                        refs[node['goalId']] = (node, parent)
        visit(view['rootNodes'])
        for atom, (reference, origin) in refs.items():
            consumers = [(consumer, place) for consumer, place in places.items()
                         if atom in self.prerequisite_closure(consumer)]
            if not consumers:
                continue
            consumer, place = min(consumers, key=lambda row: (self.placement_rank(row[1][:2]), row[0]))
            if self.placement_rank(place[:2]) >= self.placement_rank(places[atom][:2]):
                continue
            origin['children'].remove(reference)
            place[2]['children'].append(reference)
            self.moves.append(dict(viewId=view['viewId'], goalId=atom, requiredBy=consumer,
                sourcePlacement=list(places[atom][:2]), learningPlacement=list(place[:2]),
                reason='Reviewed neutral HE target preparation follows its earliest actual canonical consumer; source membership and reference role retained.'))
        # KC2024 E.2 explicitly teaches graphical differentiation. The J10
        # canonical task collection is provenance, not an official HE year.
        assessment = '632a3837-7381-5701-9cfa-4ae15ccae8ba'
        found, destination = [], []
        def find(nodes, parent=None):
            for node in nodes:
                if node['kind'] == 'structure':
                    if node['id'] == 'he-upper-0-e-2':
                        destination.append(node)
                    find(node['children'], node)
                elif node.get('goalId') == assessment and node.get('projectionRole') != 'prerequisiteOnly':
                    found.append((node, parent))
        find(view['rootNodes'])
        if found and destination:
            reference, origin = found[0]
            if origin is not destination[0]:
                origin['children'].remove(reference)
                reference.setdefault('placementEvidence', dict(role='canonicalDefault',
                    classification='Existing graphical-derivative assessment at its source-backed preparation',
                    sourceInterpretation='HE KC2024 E.2, p.32: graphical differentiation. The former canonical J10 collection is retained provenance, not an official HE J10 assignment.',
                    references=['canonical-collection:cb20dd6b-c4ff-4a1b-9636-3b3d6ea86aa8',
                        'https://kultus.hessen.de/sites/kultus.hessen.de/files/2024-11/kerncurriculum_gymnasiale_oberstufe-mathematik.pdf']))
                destination[0]['children'].append(reference)
                self.moves.append(dict(viewId=view['viewId'], goalId=assessment,
                    sourcePlacement=['canonical-collection:cb20dd6b-c4ff-4a1b-9636-3b3d6ea86aa8'],
                    learningPlacement=['SekII', 'E'],
                    reason='HE KC2024 E.2 preparation; canonical task collection is not official temporal source membership.'))
        if self.atomic_roles(view['rootNodes']) != roles:
            raise ValueError('Neutral HE preparation changed source membership')

    def prerequisite_closure(self, atom):
        if not hasattr(self, 'prerequisite_cache'):
            self.prerequisite_cache = {}
        if atom not in self.prerequisite_cache:
            seen, pending = set(), [r.split(':')[-1] for r in self.goals[atom].get('requires', [])]
            for current in pending:
                if current not in seen:
                    seen.add(current)
                    pending.extend(r.split(':')[-1] for r in self.goals[current].get('requires', []))
            self.prerequisite_cache[atom] = seen
        return self.prerequisite_cache[atom]

    def integrate_acquisition_contexts(self, view):
        """Do not bundle interleaved topic applications as one foundation unit.

        An intermediate step belongs in its consumer topic, not automatically
        in the topic that teaches its prerequisites. Shared preparation keeps a
        concrete canonical subject grouping. Neither rule changes source roles.
        """
        if not hasattr(self, 'prerequisite_cache'):
            self.prerequisite_cache = {}
            self.acquisition_repairs = []
        self.declare_orders(view, report_conflicts=False)
        def atoms(node):
            if node['kind'] == 'structure':
                return set().union(*(atoms(child) for child in node['children'])) if node['children'] else set()
            if node.get('projectionRole') == 'prerequisiteOnly':
                return {node['goalId']} & self.order_learning if node.get('acquisitionPlacement') else set()
            values = self.atoms(node['goalId']) if node['kind'] == 'canonicalSubtree' else {node['goalId']}
            return values & self.order_targets
        def visit(parent, trail):
            if parent['kind'] != 'structure':
                return
            for child in list(parent['children']):
                visit(child, trail + [parent['id']])
            foundation = next((child for child in parent['children']
                if child.get('id') == parent['id'] + '-required-foundations'), None)
            if foundation is None:
                return
            candidates = []
            def topics(node, depth=0):
                if node['kind'] == 'structure':
                    candidates.append((node, atoms(node), depth))
                    for child in node['children']:
                        topics(child, depth + 1)
            for child in parent['children']:
                if child is not foundation:
                    topics(child)
            contextual_atoms = set().union(*(values for _, values, _ in candidates)) if candidates else set()
            own_atoms = set().union(*(atoms(child) for child in parent['children']
                if child['kind'] != 'structure')) if parent['children'] else set()
            contextual_atoms.update(own_atoms)
            retained = []
            for node in foundation['children']:
                if node['kind'] != 'goalEntry' or node.get('acquisitionPlacement') is not True:
                    retained.append(node)
                    continue
                required = self.prerequisite_closure(node['goalId']) & contextual_atoms
                interleaved = [(topic, values, depth) for topic, values, depth in candidates
                    if required & values and any(node['goalId'] in self.prerequisite_closure(value) for value in values)]
                smallest_interleaved = [item for item in interleaved
                    if not any(other[1] < item[1] for other in interleaved)]
                # A step between two parts of the same topic belongs inside
                # that topic even if it also uses an earlier sibling topic.
                own_consumer = any(node['goalId'] in self.prerequisite_closure(value) for value in own_atoms)
                if own_consumer:
                    destination = parent if not self.year_structure(parent) and not self.stage(parent) else None
                elif len(smallest_interleaved) == 1:
                    destination = smallest_interleaved[0][0]
                else:
                    consumers = [(topic, values, depth) for topic, values, depth in candidates
                        if any(node['goalId'] in self.prerequisite_closure(value) for value in values)]
                    smallest = [item for item in consumers
                        if not any(other[1] < item[1] for other in consumers)]
                    destination = smallest[0][0] if len(smallest) == 1 else None
                if destination is None:
                    retained.append(node)
                    continue
                destination['children'].append(node)
                self.acquisition_repairs.append(dict(viewId=view['viewId'], goalId=node['goalId'],
                    fromParent=foundation['id'], toParent=destination['id'],
                    prerequisiteWitnesses=sorted(required),
                    rationale='Acquire an intermediate step with its concrete consumer, never place a later application in a prerequisite-only context.'))
            foundation['children'] = retained
            # A catch-all foundation unit can itself interleave unrelated
            # concepts. Keep the actual subject families as separate units.
            position = parent['children'].index(foundation)
            parent['children'][position:position + 1] = self.wrap_topics(retained, foundation['id'])
        for root in view['rootNodes']:
            visit(root, [])
        self.repair_preparation_topics(view)

    def repair_preparation_topics(self, view):
        """Rejoin independently reviewed concrete elementary skill families."""
        def visit(parent):
            if parent['kind'] != 'structure':
                return
            for child in parent['children']:
                visit(child)
            for rule in getattr(self, 'preparation_topic_repairs', []):
                if rule.get('viewIds') and view.get('viewId') not in rule['viewIds']:
                    continue
                widened = rule.get('allowCanonicalAtomicRefs', False)
                def matches(child, family):
                    return child.get('id', '').endswith('-content-' + family) or (widened and (
                        child.get('canonicalSourceGoalId') == family or ('-' + family + '-') in child.get('id', '')))
                left = next((c for c in parent['children'] if matches(c, rule['leftFamily'])), None)
                if left is None:
                    continue
                prefix = left['id'].rsplit('-content-', 1)[0]
                right = next((c for c in parent['children'] if matches(c, rule['rightFamily'])
                    and (widened or c['id'] == prefix + '-content-' + rule['rightFamily'])), None)
                if right is None:
                    continue
                if any(c['kind'] not in ('goalEntry', 'canonicalSubtree') or self.goals.get(c['goalId'], {}).get('contains')
                       for c in left['children'] + right['children']):
                    continue
                if not widened and any(c['kind'] != 'goalEntry' for c in left['children'] + right['children']):
                    continue
                if not {c['goalId'] for c in left['children']} <= set(rule['leftAllowedGoalIds']):
                    continue
                if not {c['goalId'] for c in right['children']} <= set(rule['rightAllowedGoalIds']):
                    continue
                left['label'] = rule['label']
                left['children'].extend(right['children'])
                parent['children'].remove(right)
        for root in view['rootNodes']:
            visit(root)

    def repair_reviewed_intermediate_refs(self, view):
        """Keep atomically reviewed missing steps in their existing topics."""
        rules = [
            ('cafd6520-c4af-4109-9863-cc49ba6fad4d', '8dd5199b-f614-4ebd-8819-b5ff37326524'),
            ('c2831918-26f1-421e-90fb-ce707689594e', 'f1a95baf-b91f-44db-bcb1-70a4d2e3f7d1'),
            ('5518ceb3-f668-5b52-a9b1-57653b16ca98', '0fd96c54-c629-45aa-a640-e2718890ddf9'),
            ('36e0de23-1e3b-5c69-888f-e5e19e79cbbe', '1a84cea4-d2a2-4527-b914-1a03e56e0814'),
            ('ecd13e54-ab0e-550f-9400-66e13306635d', '862e3334-6c47-5270-944d-3a8829c8d1ea'),
            ('4af3dfb9-7e15-5da5-8b86-0aac6c80e266', 'dd14916c-1bd5-57be-8867-250866066d55'),
            ('17c9e061-fe52-5553-be81-fec7a525fcbd', '2fb12329-9160-5c44-af5b-8731ecb05ba4'),
            ('647ec09d-68ae-57db-9ca4-aeb2da4218f1', '2fb12329-9160-5c44-af5b-8731ecb05ba4'),
            ('9278bc5e-a77f-5f72-8636-0d0d3e3d32ae', '2fb12329-9160-5c44-af5b-8731ecb05ba4'),
            ('2f565855-bcd6-4da5-bc80-4b72a2d93d50', 'de39c9fe-5940-4320-aca8-2be85d6ada8f'),
            ('87c55be5-06a9-41e2-a0d4-c60f7c8b8078', 'b40bebc2-91e3-5aac-916d-43247ee08d09'),
            ('265af6af-8eac-5632-b730-800aafcde26a', 'f04e101a-3dbc-4742-8a70-09d715ecd7c0'),
            ('94d63ad9-ae1c-5ff2-b05e-188a0f5ebec6', '93ac7fc8-6d83-5394-bbea-80758b463da1'),
            ('d78946f9-1f5f-462c-a99c-fe01054042dd', '38234acf-d0f8-4ff9-a6f8-852d1596a692'),
        ]
        def take(nodes, atom):
            for index, child in enumerate(nodes):
                if child.get('goalId') == atom and (child.get('projectionRole') != 'prerequisiteOnly' or child.get('acquisitionPlacement')):
                    return nodes.pop(index)
                if child['kind'] == 'structure' and (found := take(child['children'], atom)):
                    return found
            return None
        def prune(node):
            if node['kind'] == 'structure':
                for child in node['children']:
                    prune(child)
                node['children'] = [c for c in node['children'] if c['kind'] != 'structure' or c['children']]
        def visit(parent):
            if parent['kind'] != 'structure':
                return
            for child in parent['children']:
                visit(child)
            for atom, family in rules:
                destination = next((c for c in parent['children'] if
                    c.get('canonicalSourceGoalId') == family or c.get('goalId') == family
                    or c.get('id', '').endswith('-content-' + family)
                    or ('-' + family + '-') in c.get('id', '')
                    or (family == '862e3334-6c47-5270-944d-3a8829c8d1ea'
                        and c.get('label') == 'Periodische Funktionen und trigonometrische Ableitungen')), None)
                if destination is None:
                    continue
                for sibling in list(parent['children']):
                    if sibling is destination:
                        continue
                    refs = sibling['children'] if sibling['kind'] == 'structure' else [sibling]
                    reference = take(refs, atom)
                    if reference is None:
                        continue
                    if sibling['kind'] != 'structure':
                        parent['children'].remove(sibling)
                    if destination['kind'] != 'structure':
                        original = destination
                        destination = structure(parent['id'] + '-reviewed-' + family, self.goals[family]['title'], [original])
                        parent['children'][parent['children'].index(original)] = destination
                    destination['children'].append(reference)
                    if family == '2fb12329-9160-5c44-af5b-8731ecb05ba4':
                        destination['label'] = 'Terme umformen und Lösungswege prüfen'
                    getattr(self, 'acquisition_repairs', []).append(dict(viewId=view['viewId'], goalId=atom,
                        toParent=destination['id'], rationale='Independently reviewed intermediate step belongs between prerequisites and applications of this same concrete subject family.'))
            def direct_goals(node):
                return {c.get('goalId') for c in node.get('children', [])}
            angle = 'fc047e6e-5d6d-460f-99fc-ade3a23b9a8e'
            symmetry = '8da730f1-8947-498d-9e78-7fb20b00a994'
            intercept = 'ffd1ae26-c461-4439-9b18-d835c8f38e1a'
            early = next((c for c in parent['children'] if direct_goals(c) == {angle}), None)
            later = next((c for c in parent['children'] if direct_goals(c) == {symmetry, intercept}), None)
            if early and later and (reference := take(later['children'], symmetry)):
                early['children'].append(reference)
                early['label'] = 'Symmetrie und Winkelbeziehungen'
                later['label'] = 'Ähnlichkeit und Strahlensatz'
            geometry_steps = {'2331caf2-ccb2-5492-9fc6-48763b848bae', '2231c29b-eb4e-51ae-9cb1-eb033bf16099'}
            geometry_endpoints = {'25593605-5e13-55cc-9a05-8f3d737e15e9', 'd98849c7-bd0b-50d4-90aa-6293a3adb211'}
            basics = next((c for c in parent['children'] if geometry_endpoints <= direct_goals(c)
                and direct_goals(c) <= geometry_endpoints | geometry_steps), None)
            if basics:
                for sibling in parent['children']:
                    if sibling is basics or sibling['kind'] != 'structure':
                        continue
                    moved = [c for c in sibling['children'] if c.get('goalId') in geometry_steps
                             and c.get('projectionRole') == 'prerequisiteOnly' and c.get('acquisitionPlacement') is True]
                    sibling['children'] = [c for c in sibling['children'] if c not in moved]
                    basics['children'].extend(moved)
                basics['label'] = 'Koordinaten, Winkel und Vierecke: geometrische Grundlagen'
            for child in list(parent['children']):
                if child['kind'] != 'structure':
                    continue
                if direct_goals(child) == {'0c7bbd3f-0a04-4f0e-888b-40ab7841fb76'}:
                    child['label'] = 'Newton-Verfahren zur Nullstellenbestimmung'
                if child['id'].startswith('scalar-product-distances') and direct_goals(child) <= {
                        '79c4cd21-af64-5925-968e-9bc1f74cd0ad', '8eb14d81-353a-4909-9464-61be7b1ba5b8',
                        '509ae03b-96b1-4bb1-b015-b83d14569dae'}:
                    child['label'] = 'Abstände zwischen Punkten, Geraden und Ebenen'
                line_location = '69beb31d-5d02-4505-9500-3ec81af86f1e'
                intersection = '3def350a-c01c-51c3-be74-b3de20ee53e1'
                if direct_goals(child) == {line_location, intersection}:
                    reference = take(child['children'], intersection)
                    if reference:
                        child['label'] = 'Lagebeziehungen von Geraden'
                        parent['children'].append(structure(child['id'] + '-intersection-applications',
                            'Schnittberechnungen zwischen Geraden und Ebenen', [reference]))
            if view.get('scope', {}).get('jurisdiction') == 'DE-BW':
                measuring = next((c for c in parent['children'] if c.get('id', '').startswith('jg5_6_messen-')), None)
                space = next((c for c in parent['children'] if c.get('id', '').startswith('jg5_6_raum_form-')), None)
                numeric = next((c for c in parent['children'] if c.get('id', '').startswith('jg5_6_zahl-')), None)
                if measuring and space:
                    for destination, atoms in [(measuring, {'0bd7dc9b-c7f9-52e6-b374-a019edfd821c',
                            '03a87896-088d-4b21-a37b-d0604d784540', 'b44f038c-fb1f-527e-b9ad-382214d0328a'}),
                            (space, {'c823b5a2-82e3-5e22-9c27-c0f41cc5eac6', '11c88ea2-8502-5008-bec2-3e491c75ace4'})]:
                        for atom in atoms:
                            for sibling in parent['children']:
                                if sibling is destination or sibling['kind'] != 'structure':
                                    continue
                                if reference := take(sibling['children'], atom):
                                    destination['children'].append(reference)
                    for child in parent['children']:
                        if direct_goals(child) == {'8a691345-3216-522c-a898-d65e8e94db28'}:
                            child['label'] = 'Kreiszahl π'
                if numeric:
                    allowed = self.atoms('8dd5199b-f614-4ebd-8819-b5ff37326524') | {'cafd6520-c4af-4109-9863-cc49ba6fad4d', '6ff61721-b2cc-5b1b-ade5-b3c1fd7f7077'}
                    for sibling in list(parent['children']):
                        if sibling is numeric or '-physics-needed-' in sibling.get('id', ''):
                            continue
                        if sibling.get('id', '').endswith('-content-8dd5199b-f614-4ebd-8819-b5ff37326524') and direct_goals(sibling) <= allowed:
                            numeric['children'].extend(sibling['children'])
                            parent['children'].remove(sibling)
                    numeric['label'] = 'Natürliche und ganze Zahlen: Grundoperationen'
            sphere = any(c.get('canonicalSourceGoalId') == '1ea06c0c-5c60-45cd-8f31-638de98820b4' or
                         {'7b01d3d8-1fff-5924-b133-5a4825dc742e', 'bb227e31-0b0b-544a-b5e0-548256a70dec'} <= direct_goals(c)
                         for c in parent['children'])
            body = next((c for c in parent['children'] if c.get('id', '').endswith('-content-6248bbd7-c7e8-4f91-b3dc-de885cf5abce')), None)
            if sphere and body:
                application = take(body['children'], '6c122f0e-8017-4ec1-91d6-0d7a1c75f8c9')
                if application:
                    body['label'] = 'Pyramiden, Kegel und Rotationskörper'
                    parent['children'].append(structure(body['id'] + '-applications',
                        'Anwendungen der Körpergeometrie', [application]))
            prune(parent)
        for root in view['rootNodes']:
            visit(root)
        self.repair_preparation_topics(view)

    def repair_reviewed_stage_topic_refs(self, view):
        """Apply exact independently reviewed cuts inside their source year/phase."""
        def walk(node):
            yield node
            for child in node.get('children', []):
                yield from walk(child)
        def direct(node, goal):
            return any(child.get('goalId') == goal for child in node.get('children', []))
        before = self.atomic_roles(view['rootNodes'])
        if view.get('scope', {}).get('jurisdiction') == 'DE-BY' and view['scope'].get('stage') == 'SekII' and view['scope'].get('courseProfile') == 'LK':
            # Both complete BY course views acquire Laplace in J8. Its retained
            # SekII target membership does not make the excerpt's old J11
            # folder a later acquisition authority in a combined course.
            nodes = [node for root in view['rootNodes'] for node in walk(root)]
            atom = '5ab17678-bba7-4e6b-9aff-5a909e24d40e'
            origin = next((node for node in nodes if node.get('id') == 'math-source-1769fcdc-33a6-586f-9b15-17f6f32579cf-sekii-j11'), None)
            reference = next((child for child in origin.get('children', []) if child.get('goalId') == atom), None) if origin else None
            if reference:
                year = next(node for node in nodes if node.get('id') == 'math-acquisition-seki-j8')
                identifier = year['id'] + '-required-foundations-content-3823e90d-a34b-46d2-a0f8-3168138d3a95'
                destination = next((node for node in year['children'] if node.get('id') == identifier), None)
                if destination is None:
                    destination = structure(identifier, 'Laplace-Vorstellungen und Wahrscheinlichkeit aus Häufigkeiten', [])
                    year['children'].append(destination)
                origin['children'].remove(reference)
                destination['children'].append(reference)
                self.moves.append(dict(viewId=view['viewId'], goalId=atom,
                    sourcePlacement=['SekII', 'J11'], learningPlacement=['SekI', 'J8'],
                    reason='Same J8 acquisition place as both complete BY course views; SekII target membership retained, before the combined-course J9 linked-events demand.'))
        for parent in [node for root in view['rootNodes'] for node in walk(root) if node['kind'] == 'structure']:
            for rule in getattr(self, 'reviewed_topic_cuts', []):
                if view.get('scope', {}).get('jurisdiction') not in rule['jurisdictions'] or parent['id'] not in rule['parentIds']:
                    continue
                for container in list(walk(parent)):
                    if container['kind'] != 'structure':
                        continue
                    for index, reference in enumerate(list(container['children'])):
                        if reference.get('kind') != 'canonicalSubtree' or reference['goalId'] not in rule.get('materializeGoalIds', []):
                            continue
                        goal = self.goals[reference['goalId']]
                        opened = structure(container['id'] + '-source-' + reference['goalId'], goal['title'],
                            [dict(kind='canonicalSubtree', goalId=child.split(':')[-1],
                                **({'projectionRole': reference['projectionRole']} if 'projectionRole' in reference else {}))
                             for child in goal['contains']])
                        opened.update(canonicalSourceGoalId=reference['goalId'], originalCanonicalSubtree=deepcopy(reference))
                        container['children'][index] = opened
                matches = [node for node in walk(parent) if node is not parent and node['kind'] == 'structure'
                    and (node['id'] == rule['destinationId'] if 'destinationId' in rule else direct(node, rule['anchorGoalId']))]
                if not matches:
                    continue
                if len(matches) != 1:
                    raise ValueError('Ambiguous reviewed subject anchor: ' + rule['anchorGoalId'])
                destination = matches[0]
                if suffix := rule.get('createUnitSuffix'):
                    identity = parent['id'] + '-reviewed-' + suffix
                    # A reviewed surface hierarchy may already contain this
                    # exact unit below a subject domain. Keep that identity and
                    # position on replay instead of recreating it at the year.
                    destination = next((node for node in walk(parent) if node.get('id') == identity), None)
                    if destination is None:
                        destination = structure(identity, rule['label'], [])
                        parent['children'].append(destination)
                for container in list(walk(parent)):
                    if container['kind'] != 'structure' or container is destination:
                        continue
                    for reference in list(container['children']):
                        if reference.get('goalId') in rule['moveGoalIds'] and (
                                'requiredProjectionRole' not in rule or reference.get('projectionRole', 'target') == rule['requiredProjectionRole']) and (
                                not rule.get('requiresAcquisitionPlacement') or reference.get('acquisitionPlacement') is True):
                            container['children'].remove(reference)
                            destination['children'].append(reference)
                if 'label' in rule:
                    destination['label'] = rule['label']
            def clean(node):
                for child in node.get('children', []):
                    clean(child)
                if node['kind'] == 'structure':
                    node['children'] = [child for child in node['children'] if child['kind'] != 'structure' or child['children']]
            if view.get('scope', {}).get('jurisdiction') == 'DE-SL' and parent['id'] == 'j10-spatial-geometry-seki-j10':
                body = next((child for child in parent['children'] if child.get('canonicalSourceGoalId') == '6248bbd7-c7e8-4f91-b3dc-de885cf5abce'), None)
                if body:
                    sphere = next((child for child in body['children'] if child.get('canonicalSourceGoalId') == '1ea06c0c-5c60-45cd-8f31-638de98820b4'), None)
                    if sphere:
                        body['children'].remove(sphere)
                        parent['children'].append(sphere)
                        body['label'] = 'Pyramiden, Kegel und Rotationskörper'
                        application = next((child for child in body['children'] if child.get('goalId') == '6c122f0e-8017-4ec1-91d6-0d7a1c75f8c9'), None)
                        if application:
                            body['children'].remove(application)
                            parent['children'].append(structure(body['id'] + '-applications', 'Anwendungen der Körpergeometrie', [application]))
            if view['viewId'] == 'de-mv-gym-seki-math' and parent['id'] == 'math-layout-seki-j9':
                # The excerpt can inherit and independently request the same
                # two conditional coordinate foundations. They have one own
                # acquisition unit; duplicate offers must not select different
                # owners in the actual map and the declared prerequisite cut.
                prefix = parent['id']
                family = '78bcc25b-e48c-471b-9236-6c3b23d48a8b'
                source = next((c for c in parent['children'] if c.get('id') == prefix + '-physics-needed-content-' + family), None)
                target = next((c for c in parent['children'] if c.get('id') == prefix + '-required-foundations-content-' + family), None)
                if source and target:
                    reviewed = {'19f170e4-b88f-4c06-b72a-ce6923748bb4', '94b48b93-473f-4bc5-8c93-8c1a5e2cd1a6'}
                    if {c.get('goalId') for c in source['children']} != reviewed or any(
                            c.get('projectionRole') != 'prerequisiteOnly' or c.get('acquisitionPlacement') is not True
                            for c in source['children']):
                        raise ValueError('Changed reviewed MV coordinate acquisition subset')
                    for reference in source['children']:
                        if reference not in target['children']:
                            target['children'].append(reference)
                    parent['children'].remove(source)
            clean(parent)
        if self.atomic_roles(view['rootNodes']) != before:
            raise ValueError('Reviewed stage-topic cut changed source roles: ' + view['viewId'])

    def group_reviewed_topic_hierarchy(self, view):
        """Keep original topics inside bounded reviewed subject domains."""
        def visit(node):
            if node['kind'] != 'structure':
                return
            for child in node['children']:
                visit(child)
            for rule in getattr(self, 'reviewed_topic_hierarchy', []):
                if view.get('scope', {}).get('jurisdiction') != rule['jurisdiction'] or node['id'] != rule['parentId']:
                    continue
                for group in rule['groups']:
                    selected = [child for child in node['children'] if child.get('id') in group['childIds']
                                or child.get('goalId') in group.get('referenceGoalIds', [])]
                    if not selected:
                        continue
                    identifier = group.get('id', node['id'] + '-domain-' + group['key'])
                    existing = next((child for child in node['children'] if child.get('id') == identifier), None)
                    position = min(node['children'].index(child) for child in selected)
                    node['children'] = [child for child in node['children'] if child not in selected]
                    if existing:
                        existing['children'].extend(selected)
                    else:
                        node['children'].insert(position, structure(identifier, group['label'], selected))
        for root in view['rootNodes']:
            visit(root)

    def wrap_year_topics(self, view):
        """Expose concrete subject families below every actual year and phase."""
        def visit(node):
            if node['kind'] != 'structure':
                return
            for child in node['children']:
                visit(child)
            if self.year_structure(node):
                node['children'] = self.wrap_topics(node['children'], node['id'] + '-topics')
        for root in view['rootNodes']:
            visit(root)

    def repair_line_distance_context(self, view):
        """The reviewed line-distance intermediate belongs with scalar metrics."""
        atom = '509ae03b-96b1-4bb1-b015-b83d14569dae'
        def find_metric(node):
            if node['kind'] != 'structure':
                return None
            if node['id'].startswith('scalar-product-distances'):
                return node
            return next((found for child in node['children'] if (found := find_metric(child))), None)
        def take(nodes):
            for index, node in enumerate(nodes):
                if node.get('goalId') == atom and (node.get('projectionRole') != 'prerequisiteOnly' or node.get('acquisitionPlacement')):
                    return nodes.pop(index)
                if node['kind'] == 'structure':
                    found = take(node['children'])
                    if found:
                        return found
            return None
        def visit(parent):
            if parent['kind'] != 'structure':
                return
            for child in parent['children']:
                visit(child)
            geometry = next((child for child in parent['children']
                if child.get('id', '').startswith('geometry-and-advanced-analysis')), None)
            destination = find_metric(geometry) if geometry else None
            if destination:
                for child in parent['children']:
                    if child is geometry or child['kind'] != 'structure':
                        continue
                    reference = take(child['children'])
                    if reference:
                        destination['children'].append(reference)
                        self.acquisition_repairs.append(dict(viewId=view['viewId'], goalId=atom,
                            fromParent=child['id'], toParent=destination['id'],
                            prerequisiteWitnesses=[ref.split(':')[-1] for ref in self.goals[atom].get('requires', [])],
                            rationale='Reviewed line-distance intermediate: directions and scalar-product angles precede the skew-line application in the existing metric topic.'))
            parent['children'] = [child for child in parent['children']
                if child['kind'] != 'structure' or child['children']]
        for root in view['rootNodes']:
            visit(root)

    def repair_periodic_chain_rule_context(self, view):
        """Keep the reviewed chain-rule step between trig derivatives and models."""
        atoms = {'58d2f963-4fb9-550d-a832-f5ac60808900', 'ecd13e54-ab0e-550f-9400-66e13306635d'}
        family = {'2411b2e9-75d7-5e8f-8eb4-f37c4ac555c2', '3401d95d-2191-5929-ac78-4de51d71a6be',
                  '6acd79f5-9447-5ea1-8127-6dbb72bd057d'}
        def values(node):
            if node['kind'] == 'structure':
                return set().union(*(values(child) for child in node['children'])) if node['children'] else set()
            return self.atoms(node['goalId']) if node['kind'] == 'canonicalSubtree' else {node['goalId']}
        def destination(node):
            if node['kind'] != 'structure' or not family <= values(node):
                return None
            return next((found for child in node['children'] if (found := destination(child))), node)
        def take(nodes, atom):
            for index, node in enumerate(nodes):
                if node.get('goalId') == atom and (node.get('projectionRole') != 'prerequisiteOnly' or node.get('acquisitionPlacement')):
                    return nodes.pop(index)
                if node['kind'] == 'structure':
                    found = take(node['children'], atom)
                    if found:
                        return found
            return None
        def visit(parent):
            if parent['kind'] != 'structure':
                return
            for child in parent['children']:
                visit(child)
            if not self.year_structure(parent):
                return
            analysis = next((child for child in parent['children'] if destination(child)), None)
            target = destination(analysis) if analysis else None
            if target:
                for atom in sorted(atoms):
                    for child in parent['children']:
                        if child is analysis or child['kind'] != 'structure':
                            continue
                        reference = take(child['children'], atom)
                        if reference:
                            target['children'].append(reference)
                            self.acquisition_repairs.append(dict(viewId=view['viewId'], goalId=atom,
                                fromParent=child['id'], toParent=target['id'],
                                prerequisiteWitnesses=[ref.split(':')[-1] for ref in self.goals[atom].get('requires', [])],
                                rationale='Reviewed periodic-function intermediate joins its existing concrete consumer topic within this same phase, including nested source topics.'))
            parent['children'] = [child for child in parent['children'] if child['kind'] != 'structure' or child['children']]
        for root in view['rootNodes']:
            visit(root)

    def repair_canonical_quadratic_steps(self, view):
        if view['viewId'] != 'de-de-gym-seki-math':
            return
        rules = [
            ('9023226b-fc17-412b-807c-2bb45cd551d5',
             {'3e4032bd-4d8c-4e72-bfdd-64a34df053c9', 'e322310f-f33a-485d-bc23-2412a6b8fa12'}, None,
             'Quadratische Gleichungen und Scheitelpunkte'),
            ('f7dcf8c8-06c1-5972-b02a-9d35e5ab7600', set(), 'j9-quadratics-basics', None),
        ]
        structures = []
        def collect(node):
            if node['kind'] == 'structure':
                structures.append(node)
                for child in node['children']:
                    collect(child)
        for root in view['rootNodes']:
            collect(root)
        for atom, witnesses, prefix, title in rules:
            candidates = []
            for node in structures:
                direct = set().union(*(self.atoms(child['goalId']) if child['kind'] == 'canonicalSubtree'
                    else {child['goalId']} for child in node['children'] if child.get('goalId')))
                if (prefix and node['id'].startswith(prefix)) or (witnesses and witnesses <= direct):
                    candidates.append(node)
            if len(candidates) != 1:
                continue
            target = candidates[0]
            for parent in structures:
                if parent is target:
                    continue
                moved = [child for child in parent['children'] if child.get('goalId') == atom
                         and child.get('projectionRole') == 'prerequisiteOnly' and child.get('acquisitionPlacement')]
                for reference in moved:
                    parent['children'].remove(reference)
                    target['children'].append(reference)
                if moved and title:
                    target['label'] = title
            for parent in structures:
                parent['children'] = [child for child in parent['children'] if child['kind'] != 'structure' or child['children']]

    def repair_topic_boundaries(self, view):
        """Small subject-reviewed cuts, with untouched references and roles."""
        before_roles = self.atomic_roles(view['rootNodes'])
        body = '211fa3c8-9e74-5c82-8863-0d51700185cd'
        early_branches = {'4af3dfb9-7e15-5da5-8b86-0aac6c80e266', 'dd14916c-1bd5-57be-8867-250866066d55'}
        equation = 'ecd13e54-ab0e-550f-9400-66e13306635d'
        def visit(parent):
            if parent['kind'] != 'structure':
                return
            for child in list(parent['children']):
                visit(child)
            for child in list(parent['children']):
                if child['kind'] != 'structure':
                    continue
                if child['id'].startswith('shared-vector-operations-'):
                    refs = [item for item in child['children'] if item.get('goalId') == body]
                    if refs:
                        child['children'] = [item for item in child['children'] if item not in refs]
                        original = refs[0]
                        opened = [dict(kind='canonicalSubtree', goalId=goal,
                            **({'projectionRole': original['projectionRole']} if 'projectionRole' in original else {}))
                            for goal in self.goals[body]['contains']]
                        early = structure('spatial-figures-foundations-' + child['id'],
                            'Figuren, Kongruenz und Ähnlichkeit', [ref for ref in opened if ref['goalId'] in early_branches])
                        applications = structure('spatial-applications-' + child['id'],
                            'Körper, Flächen und Volumen im Raum', [ref for ref in opened if ref['goalId'] not in early_branches])
                        applications.update(canonicalSourceGoalId=body, originalCanonicalSubtree=deepcopy(original))
                        position = parent['children'].index(child) + 1
                        parent['children'][position:position] = [early, applications]
                if child.get('label') == 'Periodische Funktionen und trigonometrische Ableitungen':
                    refs = [item for item in parent['children'] if item.get('goalId') == equation]
                    if refs:
                        parent['children'] = [item for item in parent['children'] if item not in refs]
                        child['children'].extend(refs)
        for root in view['rootNodes']:
            visit(root)
        after_roles = self.atomic_roles(view['rootNodes'])
        for atom, role in before_roles.items():
            if after_roles.get(atom) != role and role == 'prerequisiteOnly':
                view['rootNodes'].insert(0, dict(kind='goalEntry', goalId=atom, projectionRole=role))
        if self.atomic_roles(view['rootNodes']) != before_roles:
            raise ValueError('Topic-boundary repair changed source atomic roles')

    def repair_spatial_movement_context(self, view):
        atom = '492463cf-6cb2-5a5a-98e0-c1d77c36c256'
        def visit(parent):
            if parent['kind'] != 'structure':
                return
            for child in parent['children']:
                visit(child)
            vector = next((child for child in parent['children']
                if child.get('id', '').startswith('shared-vector-operations')), None)
            application = next((child for child in parent['children']
                if '1a84cea4-' in child.get('id', '') or child.get('label') == 'Abstände, Schnittwinkel, Spiegelungen und Anwendungen im Raum'), None)
            if vector and application:
                moved = [child for child in vector['children'] if child.get('goalId') == atom]
                vector['children'] = [child for child in vector['children'] if child not in moved]
                application['children'].extend(moved)
        for root in view['rootNodes']:
            visit(root)

    def stable_editorial_ids(self, view):
        """A shared topic's identity cannot depend on its GK/LK array index."""
        def visit(node, parent='root'):
            if node['kind'] != 'structure':
                return
            if re.match(r'^v3-preserved-\d+(?:-|$)', node['id']):
                identity = parent + '\n' + node['label']
                node['id'] = 'math-topic-' + hashlib.sha256(identity.encode()).hexdigest()[:16]
            for child in node['children']:
                visit(child, node['id'])
        for root in view['rootNodes']:
            visit(root)

    def subject_titles(self, view):
        """Editorial provenance belongs in metadata, not in learner titles."""
        generic = {'Lernziele am geprüften Erwerbsort', 'Vorbereitung am tatsächlichen Bedarf',
                   'Prüfungsaufgaben zu den tatsächlich benötigten Kompetenzen', 'Weitere Kompetenzen', 'GLOBAL',
                   'Lernziele und Prüfungsaufgaben',
                   'Analytische Geometrie, lineare Algebra und vertiefte Analysis'}
        def visit(node):
            if node['kind'] != 'structure':
                if 'displayLabel' in node:
                    node['displayLabel'] = node['displayLabel'].replace(' (Bestands-ID)', '')
                elif ' (Bestands-ID)' in self.goals.get(node.get('goalId'), {}).get('title', ''):
                    node['displayLabel'] = self.goals[node['goalId']]['title'].replace(' (Bestands-ID)', '')
                return
            node['label'] = node['label'].replace(' (Bestands-ID)', '').removeprefix('SH-Quellanker: ')
            children = []
            for child in node['children']:
                visit(child)
                if (child.get('label') in generic or re.match(r'^Weitere lehrplanbelegte ', child.get('label', ''))
                    or (child.get('label', '').startswith('Lehrplanbelegte Kompetenzen') and '-subject-' not in child.get('id', ''))
                    or (child.get('id', '').startswith(('mv-source-extraction-supplements', 'ni-source-extraction-supplements', 'th-source-extraction-supplements'))
                        and '-subject-' not in child.get('id', ''))):
                    # The old provenance wrapper does not define a coherent
                    # learning unit. Its concrete subject families become the
                    # actual siblings, preserving every reference verbatim.
                    children.extend(self.wrap_topics(child['children'], child['id'] + '-subject')
                        if self.year_structure(node) or self.stage(node) else child['children'])
                else:
                    children.append(child)
            node['children'] = children
        for root in view['rootNodes']:
            visit(root)

    def clean_redundant_wrappers(self, view):
        """Remove duplicate presentation levels while retaining source identity."""
        roles = self.atomic_roles(view['rootNodes'])
        def label(value):
            value = re.sub(r'^Q[1-4][.:]\s*', '', value, flags=re.I)
            value = re.sub(r'\s+\((?:Sek(?:undarstufe)?\s*I{1,2}|GK|LK)\)$', '', value, flags=re.I)
            return ' '.join(value.casefold().split())
        def visit(node):
            if node['kind'] != 'structure':
                return
            for child in node['children']:
                visit(child)
            changed = True
            while changed:
                changed = False
                children = []
                for child in node['children']:
                    child_label = child.get('label') if child['kind'] == 'structure' else child.get('displayLabel', self.goals.get(child.get('goalId'), {}).get('title', ''))
                    if label(node['label']) != label(child_label):
                        children.append(child)
                        continue
                    if child['kind'] == 'structure':
                        identity = child.get('canonicalSourceGoalId')
                        if identity and node.get('canonicalSourceGoalId') not in (None, identity):
                            children.append(child)
                            continue
                        for key in ('canonicalSourceGoalId', 'originalCanonicalSubtree', 'sourceMetadata', 'placementEvidence'):
                            if key in child and key not in node:
                                node[key] = deepcopy(child[key])
                        opened = child['children']
                        if (view.get('scope', {}).get('jurisdiction', 'DE-DE') == 'DE-DE'
                                and node['id'] in ('math-layout-sekii-q1', 'math-layout-sekii-q3')):
                            opened = self.wrap_topics(opened, node['id'] + '-topics')
                            for part in opened:
                                visit(part)
                        children.extend(opened)
                        changed = True
                    elif child['kind'] == 'canonicalSubtree' and self.goals[child['goalId']].get('contains'):
                        if node.get('canonicalSourceGoalId') not in (None, child['goalId']):
                            children.append(child)
                            continue
                        node.setdefault('canonicalSourceGoalId', child['goalId'])
                        node.setdefault('originalCanonicalSubtree', deepcopy(child))
                        opened = [dict(kind='canonicalSubtree', goalId=goal.split(':')[-1],
                                       **({'projectionRole': child['projectionRole']} if 'projectionRole' in child else {}))
                                  for goal in self.goals[child['goalId']]['contains']]
                        if self.year_structure(node) or self.stage(node):
                            opened = self.wrap_topics(opened, node['id'] + '-topics')
                            for part in opened:
                                visit(part)
                        children.extend(opened)
                        changed = True
                    else:
                        # A genuine single-skill unit uses its distinct subject
                        # family as title; the child keeps the exact goal text.
                        atom = child.get('goalId')
                        goal = self.goals.get(atom, {})
                        primary = goal.get('authoringMetadata', {}).get('primaryAssessedGoalId', atom)
                        families = [p for p in self.parents[primary]
                            if 'root' not in self.goals[p].get('tags', [])
                            and not re.match(r'^(?:Jahrgang|Sekundarstufe|Einführungsphase|Qualifikationsphase|Mathematik$)', self.goals[p]['title'])
                            and label(self.goals[p]['title']) != label(child_label)]
                        if not families:
                            seen = {primary}
                            frontier = list(self.parents[primary])
                            while frontier and not families:
                                following = []
                                for ancestor in frontier:
                                    if ancestor in seen:
                                        continue
                                    seen.add(ancestor)
                                    title = self.goals[ancestor]['title']
                                    if 'root' not in self.goals[ancestor].get('tags', []) and not re.match(r'^(?:Jahrgang|Sekundarstufe|Einführungsphase|Qualifikationsphase|Mathematik$)', title) and label(title) != label(child_label):
                                        families.append(ancestor)
                                    following.extend(self.parents[ancestor])
                                frontier = following
                        if families and len(node['children']) == 1:
                            family = min(families, key=lambda p: (len(self.atoms(p)), p))
                            node['label'] = self.goals[family]['title'].replace(' (Bestands-ID)', '')
                        elif atom in getattr(self, 'single_skill_topic_labels', {}):
                            node['label'] = self.single_skill_topic_labels[atom]
                        children.append(child)
                node['children'] = children
            if re.fullmatch(r'Q[1-4]', node['label']):
                # A phase label names its actual visible topic families, not a
                # copied Hessen semester assignment for another Land.
                topics = [c['label'] for c in node['children'] if c['kind'] == 'structure']
                node['label'] += ': ' + (' / '.join(dict.fromkeys(topics[:2])) if topics else 'Mathematische Anwendungen')
            for family, title in getattr(self, 'common_family_labels', {}).items():
                if node.get('canonicalSourceGoalId') == family or node['id'].endswith('-content-' + family):
                    node['label'] = title
            shared = getattr(self, 'common_unit_labels', {}).get(view.get('scope', {}).get('jurisdiction'), {})
            if node['id'] in shared:
                node['label'] = shared[node['id']]
        for root in view['rootNodes']:
            visit(root)
        after_roles = self.atomic_roles(view['rootNodes'])
        for atom, role in roles.items():
            if after_roles.get(atom) != role and role == 'prerequisiteOnly':
                view['rootNodes'].insert(0, dict(kind='goalEntry', goalId=atom, projectionRole=role))
        if self.atomic_roles(view['rootNodes']) != roles:
            raise ValueError('Presentation cleanup changed canonical atomic roles: ' + view['viewId'])

    def add_acquisition_places(self, view):
        """Add honest support places only for proven canonical prerequisites.

        The runtime opt-in never changes enrollment: only authoritative L may
        materialize these references. No 'target + override' trick is used.
        """
        roles = self.atomic_roles(view['rootNodes'])
        authored_targets = {g for g, role in roles.items() if role == 'target'}
        def applicable(goal_id):
            return self.goal_applies(goal_id, view['scope'])
        seeds = {g for g in authored_targets if applicable(g)}
        math_learning = seeds | {p for seed in seeds for p in self.prerequisite_closure(seed)}
        paths = {g: [g] for g in sorted(seeds)}
        foreign_rows = getattr(self, 'foreign_demands', {}).get(view['viewId'], [])
        for row in foreign_rows:
            atom = row['goalId']
            if atom not in paths:
                paths[atom] = row['requiresPath']
        queue = list(paths)
        for dependent in queue:
            for ref in self.goals.get(dependent, {}).get('requires', []):
                required = ref.split(':')[-1]
                if required not in paths:
                    paths[required] = paths[dependent] + [required]
                    queue.append(required)
        needed = (set(paths) - authored_targets) & getattr(self, 'math_atoms', set(self.goals))
        if not needed:
            return
        state = view['scope'].get('jurisdiction', 'DE-DE')[-2:]
        duration = view['scope'].get('durationModel')
        occurrences = defaultdict(list)
        year_nodes = {}
        stage_nodes = {}
        seed_places = {}
        def visit(nodes, trail=(), stage=None, unit=None):
            for node in nodes:
                if node['kind'] == 'structure':
                    current_stage = self.stage(node) or stage
                    if self.stage(node):
                        stage_nodes[current_stage] = node
                    current_unit = None if self.stage(node) else unit
                    label = node.get('label', '')
                    if current_unit is None and re.match(r'^(?:Jahrgangsstufe|Jahrgangsband|Klassenstufe|Klassen |Orientierungsstufe)', label):
                        years = re.findall(r'\d+', label.split('(')[0])
                        if years:
                            current_unit = 'J' + '_'.join(years)
                    elif current_unit is None and label.startswith('Einführungsphase'):
                        current_unit = 'E'
                    elif current_unit is None and label.startswith('Qualifikationsphase'):
                        current_unit = 'Q'
                    elif current_unit is None and label.startswith('Semester '):
                        semesters = re.findall(r'\d+', label)
                        if semesters:
                            current_unit = '_'.join('Q' + number for number in semesters)
                    elif current_unit is None and re.match(r'^Q[1-4]\b', label):
                        current_unit = label[:2]
                    if current_stage and current_unit and current_unit != unit:
                        year_nodes.setdefault((current_stage, current_unit), node)
                    visit(node['children'], trail + (node['id'],), current_stage, current_unit)
                    continue
                goal_id = node.get('goalId')
                if goal_id not in self.goals:
                    continue
                if node['kind'] == 'goalEntry' and not self.goals[goal_id].get('contains') and len(trail) >= 2:
                    occurrences[goal_id].append((node, trail, stage, unit))
                atoms = self.atoms(goal_id) if node['kind'] == 'canonicalSubtree' else {goal_id}
                if stage and unit and node.get('projectionRole') != 'prerequisiteOnly':
                    for atom in atoms & authored_targets & set(paths):
                        seed_places.setdefault(atom, (stage, unit))
        visit(view['rootNodes'])
        # A prerequisite may serve several consumers. Its place must precede
        # the earliest actual consumer, not whichever seed UUID BFS saw first.
        # Propagate this bound through intermediate prerequisites as well.
        demand_places = dict(seed_places)
        demand_paths = {atom: [atom] for atom in seed_places}
        for row in foreign_rows:
            if not row.get('demandPlace'):
                continue
            atom, proposed = row['goalId'], tuple(row['demandPlace'])
            current = demand_places.get(atom)
            if current is None or self.placement_rank(proposed) < self.placement_rank(current):
                demand_places[atom] = proposed
                demand_paths[atom] = row['requiresPath']
        demand_queue = list(demand_places)
        for dependent in demand_queue:
            for reference in self.goals[dependent].get('requires', []):
                prerequisite = reference.split(':')[-1]
                proposed = demand_places[dependent]
                current = demand_places.get(prerequisite)
                if current is None or self.placement_rank(proposed) < self.placement_rank(current):
                    demand_places[prerequisite] = proposed
                    demand_paths[prerequisite] = demand_paths[dependent] + [prerequisite]
                    demand_queue.append(prerequisite)
        retained_he_places = {}
        if state == 'HE' and view['scope'].get('stage') != 'CrossStage':
            # The reviewed HE excerpts intentionally retain the full view's
            # lower-stage learning places as support. An exclusion elsewhere in
            # a GK tree is not enough: require a real applicable full-view target.
            course = view['scope'].get('courseProfile', 'GK').lower()
            suffix = '-' + duration.lower() if duration else ''
            source_id = f'de-he-gym-math-{course}{suffix}'
            source = deepcopy(getattr(self, 'full_view_inputs', {}).get(source_id))
            if source is None and duration:
                raise ValueError('HE duration excerpt requires its matching full-view authoring input: ' + source_id)
            if source is not None:
                self.repair_he_probability_place(source)
                self.repair_he_neutral_preparation(source)
                full_targets = {g for g, role in self.atomic_roles(source['rootNodes']).items()
                                if role == 'target' and applicable(g)}
                def retained(nodes, stage=None, unit=None):
                    for item in nodes:
                        if item['kind'] == 'structure':
                            next_stage = self.stage(item) or stage
                            next_unit = unit
                            label = item.get('label', '')
                            year = re.match(r'^Jahrgangsstufe (\d+)\b', label)
                            if year:
                                next_unit = 'J' + year[1]
                            elif label.startswith('Einführungsphase'):
                                next_unit = 'E'
                            elif re.match(r'^Q[1-4]\b', label):
                                next_unit = label[:2]
                            retained(item['children'], next_stage, next_unit)
                        elif item.get('projectionRole') != 'prerequisiteOnly' and stage and unit:
                            atoms = self.atoms(item['goalId']) if item['kind'] == 'canonicalSubtree' else {item['goalId']}
                            for atom in atoms & full_targets:
                                retained_he_places.setdefault(atom, (stage, unit))
                retained(source['rootNodes'])
        roots = [node for node in view['rootNodes'] if node['kind'] == 'structure' and not self.stage(node)]
        acquisition_places = dict(seed_places)
        # A prerequisite's own preparation is real acquisition as well. Resolve
        # the DAG from prerequisites to applications before selecting any place;
        # source UUID order must not leave a dependent before its support.
        for atom in sorted(needed, key=lambda goal: (len(self.prerequisite_closure(goal)), goal)):
            phase = self.phase(atom)
            stage = 'SekI' if phase.startswith('J') and self.rank(phase) <= 10 else 'SekII'
            place = retained_he_places.get(atom, self.nominal_place(atom, state, stage, duration))
            if state == 'HE' and duration == 'G8' and place[0] == 'SekI' and self.rank(place[1]) > 9:
                # G8 has no lower-secondary year 10. Unmapped canonical J10
                # preparation starts in E unless an actual earlier need bounds it.
                place = ('SekII', 'E')
            required_at = demand_places.get(atom)
            if atom in demand_paths:
                paths[atom] = demand_paths[atom]
            if required_at and self.placement_rank(required_at) < self.placement_rank(place):
                place = required_at
            prerequisite_places = [(goal, acquisition_places[goal]) for goal in self.prerequisite_closure(atom) if goal in acquisition_places]
            if prerequisite_places:
                latest_goal, earliest_place = max(prerequisite_places, key=lambda item: self.placement_rank(item[1]))
                if self.placement_rank(earliest_place) > self.placement_rank(place):
                    place = earliest_place
                if required_at and self.placement_rank(earliest_place) > self.placement_rank(required_at):
                    self.learning_window_conflicts.append(dict(viewId=view['viewId'], goalId=atom,
                        prerequisiteGoalId=latest_goal, afterPlace=list(earliest_place),
                        requiredByPath=paths[atom], beforePlace=list(required_at)))
            acquisition_places[atom] = place
            for node, _, old_stage, old_unit in occurrences[atom]:
                if node.get('acquisitionPlacement') and old_stage and old_unit and self.placement_rank((old_stage, old_unit))[:2] != self.placement_rank(place)[:2]:
                    node.pop('acquisitionPlacement')
            candidates = [item for item in occurrences[atom]
                if item[0].get('projectionRole') == 'prerequisiteOnly' and item[2] and item[3]
                and self.placement_rank((item[2], item[3]))[:2] == self.placement_rank(place)[:2]
                and (atom in math_learning or '-physics-needed-' in item[1][-1])]
            if candidates:
                # Preserve an existing concrete authored acquisition position;
                # generic scope-wide/global support declarations are excluded.
                node, trail, stage, unit = candidates[0]
                if node.get('acquisitionPlacement') is True:
                    continue
                node['acquisitionPlacement'] = True
                self.acquisitions.append(dict(viewId=view['viewId'], goalId=atom, path=list(trail),
                    source='existing-nested-support', requiredByPath=paths[atom]))
                continue
            stage, unit = place
            stage_node = stage_nodes.get(stage)
            if stage_node is None:
                stage_node = structure('sek1' if stage == 'SekI' else 'sek-ii',
                    'Sekundarstufe I' if stage == 'SekI' else 'Sekundarstufe II', [])
                if roots:
                    if stage == 'SekI':
                        roots[0]['children'].insert(0, stage_node)
                    else:
                        roots[0]['children'].append(stage_node)
                else:
                    if stage == 'SekI':
                        view['rootNodes'].insert(0, stage_node)
                    else:
                        view['rootNodes'].append(stage_node)
                stage_nodes[stage] = stage_node
            year = year_nodes.get(place) or next((node for (s, u), node in year_nodes.items()
                if s == stage and self.rank(u) == self.rank(unit)), None)
            if year is None:
                year = structure('math-acquisition-' + stage.lower() + '-' + unit.lower().replace('_', '-'),
                                 self.label(unit), [])
                successor = next((i for i, child in enumerate(stage_node['children'])
                    if any(node is child and s == stage and self.rank(u) > self.rank(unit)
                           for (s, u), node in year_nodes.items())), len(stage_node['children']))
                stage_node['children'].insert(successor, year)
                year_nodes[place] = year
            reference = dict(kind='goalEntry', goalId=atom,
                projectionRole='prerequisiteOnly', acquisitionPlacement=True)
            foreign_only = atom not in math_learning
            if foreign_only:
                # A conditional atom must not add completion prerequisites to
                # a unit that survives without the foreign consumer. Give its
                # canonical subject family a wholly conditional sibling unit.
                proposal = self.wrap_topics([reference], year['id'] + '-physics-needed')[0]
                if proposal['kind'] != 'structure':
                    proposal = structure(year['id'] + '-physics-needed-' + atom,
                                         self.goals[atom]['title'], [reference])
                topic_id = proposal['id']
                topic = next((child for child in year['children'] if child.get('id') == topic_id), None)
                if topic is None:
                    topic = {**proposal, 'children': []}
                    year['children'].insert(0, topic)
            else:
                topic_id = year['id'] + '-required-foundations'
                topic = next((child for child in year['children'] if child.get('id') == topic_id), None)
                if topic is None:
                    topic = structure(topic_id, 'Benötigte Grundlagen', [])
                    year['children'].insert(0, topic)
            topic['children'].append(reference)
            self.acquisitions.append(dict(viewId=view['viewId'], goalId=atom,
                path=[stage_node['id'], year['id'], topic_id],
                source='foreign-consumer-canonical-requirement-closure' if foreign_only else 'canonical-requirement-closure',
                requiredByPath=paths[atom]))
        after = self.atomic_roles(view['rootNodes'])
        if any(after.get(g) != role for g, role in roles.items()) or any(role != 'prerequisiteOnly' for g, role in after.items() if g not in roles):
            raise ValueError(f'Acquisition placement changed source roles: {view["viewId"]}')

    def restore_selected_examination_unit(self, view):
        """Keep existing examination offers separate from instructional phases."""
        scope = view['scope']
        state = scope.get('jurisdiction', 'DE-DE')
        if not (state in {'DE-BB', 'DE-BE', 'DE-HB', 'DE-HH'} and scope['stage'] != 'SekI'
                or state == 'DE-DE' and scope['stage'] == 'SekII'):
            return
        examination_atoms = self.atoms('9ad83149-3cb7-5b87-a617-3eae3715a50c') | self.atoms(
            '464a6024-a2f8-53b4-84e0-d7b9df22a0b1')
        before = self.atomic_roles(view['rootNodes'])
        selected = examination_atoms & {g for g, role in before.items() if role == 'target'}
        if not selected:
            return

        def atoms(node):
            if node['kind'] == 'structure':
                return set().union(*(atoms(c) for c in node['children']))
            return self.atoms(node['goalId']) if node.get('goalId') in self.goals else set()

        def walk(node):
            yield node
            for child in node.get('children', []):
                yield from walk(child)

        stages = [node for root in view['rootNodes'] for node in walk(root) if self.stage(node) == 'SekII']
        if len(stages) != 1:
            raise ValueError(f'Examination offer needs one explicit SekII stage: {view["viewId"]}')
        stage = stages[0]
        existing = next((c for c in stage['children'] if c.get('id') == 'math-layout-sekii-abitur'), None)
        if existing is not None:
            if not selected <= atoms(existing):
                raise ValueError(f'Incomplete existing examination unit: {view["viewId"]}')
            return
        moved = []

        def extract(parent, path):
            retained = []
            for child in parent['children']:
                content = atoms(child)
                if content and content <= examination_atoms and not self.year_structure(child) and not self.stage(child):
                    moved.append(child)
                    self.acquisition_repairs.append(dict(viewId=view['viewId'],
                        kind='existing-examination-offer-unit', originalPath=path,
                        movedNodeId=child.get('id', child.get('goalId')), atomIds=sorted(content),
                        destination='math-layout-sekii-abitur',
                        reason='Existing authored examination offer follows the instructional phases; no new target or official examination claim.'))
                    continue
                if child['kind'] == 'structure':
                    extract(child, path + [child['id']])
                    if not child['children']:
                        continue
                retained.append(child)
            parent['children'] = retained

        extract(stage, [stage['id']])
        if not selected <= set().union(*(atoms(node) for node in moved)):
            raise ValueError(f'Examination references are mixed with unrelated content: {view["viewId"]}')
        stage['children'].append(structure('math-layout-sekii-abitur', 'Abiturprüfung', moved))
        if self.atomic_roles(view['rootNodes']) != before:
            raise ValueError(f'Examination grouping changed atomic roles: {view["viewId"]}')

    def normalize(self, value):
        assert_supported_composition_view(value)
        # Rebuild genuine bases from their preserved authoring inputs. Replaying
        # a normalized display tree would keep obsolete time/source choices.
        value = getattr(self, 'authority_views', {}).get(value['viewId'], value)
        view = deepcopy(value)
        self.repair_fraction_topic(view)
        self.repair_he_probability_place(view)
        self.repair_he_neutral_preparation(view)
        self.repair_topic_boundaries(view)
        self.stable_editorial_ids(view)
        state = view['scope'].get('jurisdiction', 'DE-DE')[-2:]
        duration = view['scope'].get('durationModel')
        if state == 'HE' and view['scope'].get('stage') == 'CrossStage' and hasattr(self, 'full_view_inputs'):
            self.full_view_inputs[view['viewId']] = deepcopy(view)
        view.update({'$schema': SCHEMA, 'viewFormatVersion': '1.2', 'language': view.get('language', 'de')})
        if state == 'HE' or (state == 'DE' and view['scope'].get('stage') == 'CrossStage') or any(n.get('id') == 'math-layout-root' for n in view['rootNodes']):
            self.add_acquisition_places(view)
            self.ensure_stage_root(view)
            self.subject_titles(view)
            self.wrap_year_topics(view)
            self.integrate_acquisition_contexts(view)
            self.repair_line_distance_context(view)
            self.repair_periodic_chain_rule_context(view)
            self.repair_canonical_quadratic_steps(view)
            self.repair_spatial_movement_context(view)
            self.clean_redundant_wrappers(view)
            self.repair_reviewed_intermediate_refs(view)
            self.repair_reviewed_stage_topic_refs(view)
            self.clean_redundant_wrappers(view)
            self.group_reviewed_topic_hierarchy(view)
            self.restore_selected_examination_unit(view)
            self.declare_orders(view)
            return view
        supports, contents = [], []
        for node in view['rootNodes']:
            if node.get('projectionRole') == 'prerequisiteOnly':
                supports.append(node)
            elif node['kind'] == 'structure' and node.get('label') == 'Mathematik':
                contents.extend(node['children'])
            else:
                contents.append(node)
        stage_nodes = defaultdict(list)
        for node in contents:
            stage = self.stage(node)
            if stage:
                stage_nodes[stage].extend(node['children'])
            else:
                stage = view['scope'].get('stage')
                if stage not in ('SekI', 'SekII'):
                    stage = 'SekI' if 'seki' in node.get('id', '') and 'sekii' not in node.get('id', '') else self.classify_stage(node)
                stage_nodes[stage].append(node)
        self.plan_learning_places(stage_nodes, value)
        all_groups = defaultdict(list)
        for stage in ('SekI', 'SekII'):
            for node in stage_nodes[stage]:
                for unit, pieces in self.partition(node, state, stage, duration).items():
                    all_groups[unit].extend(pieces)
        supports.extend(all_groups.pop('support', []))
        stages = []
        for stage in ('SekI', 'SekII'):
            groups = {key.split(':')[1]: children for key, children in all_groups.items() if key.startswith(stage + ':')}
            years = []
            for unit in sorted(groups, key=lambda u: (self.rank(u), u)):
                identifier = 'math-layout-' + stage.lower() + '-' + unit.lower().replace('_', '-')
                years.append(structure(identifier, self.label(unit), self.wrap_topics(groups[unit], identifier)))
            if years:
                stages.append(structure('sek1' if stage == 'SekI' else 'sek-ii',
                    'Sekundarstufe I' if stage == 'SekI' else 'Sekundarstufe II', years))
        view['rootNodes'] = supports + [structure('math-layout-root', 'Mathematik', stages)]
        before_roles = self.atomic_roles(value['rootNodes'])
        after_roles = self.atomic_roles(view['rootNodes'])
        # Splitting a canonical subtree changes its distance to explicit support
        # overrides. Preserve the original specificity result with atomic support
        # references instead of accidentally enrolling descendants as targets.
        for goal_id, role in sorted(before_roles.items()):
            if after_roles.get(goal_id) != role:
                if role != 'prerequisiteOnly':
                    raise ValueError(f'Target lost during stage partition: {goal_id}')
                view['rootNodes'].insert(0, dict(kind='goalEntry', goalId=goal_id, projectionRole=role))
        if self.atomic_roles(view['rootNodes']) != before_roles:
            raise ValueError(f'Atomic role set changed: {view["viewId"]}')
        self.add_acquisition_places(view)
        self.ensure_stage_root(view)
        self.subject_titles(view)
        self.wrap_year_topics(view)
        self.integrate_acquisition_contexts(view)
        self.repair_line_distance_context(view)
        self.repair_periodic_chain_rule_context(view)
        self.repair_canonical_quadratic_steps(view)
        self.repair_spatial_movement_context(view)
        self.clean_redundant_wrappers(view)
        self.repair_reviewed_intermediate_refs(view)
        self.repair_reviewed_stage_topic_refs(view)
        self.clean_redundant_wrappers(view)
        for node in view['rootNodes']:
            self.sort_topics(node, {g for g, role in before_roles.items() if role == 'target'})
        self.group_reviewed_topic_hierarchy(view)
        self.restore_selected_examination_unit(view)
        self.declare_orders(view)
        return view


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--write', action='store_true')
    parser.add_argument('--check', action='store_true')
    parser.add_argument('--input-dir', type=Path, default=VIEW_DIR)
    parser.add_argument('--output-dir', type=Path, default=VIEW_DIR)
    parser.add_argument('--report', type=Path)
    parser.add_argument('--stdin', action='store_true', help='Normalize a JSON array supplied on stdin; write only JSON on stdout.')
    parser.add_argument('--from-authority', action='store_true', help='Regenerate the 70 genuine base views from their pinned original authoring inputs; duration and new stage excerpts are separate generator outputs.')
    args = parser.parse_args()
    normalizer = Normalizer()
    if args.stdin:
        batch = json.load(sys.stdin)
        for view in batch:
            assert_supported_composition_view(view, 'stdin')
        normalizer.full_view_inputs.update({view['viewId']: view for view in batch})
        print(encode([normalizer.normalize(view) for view in batch]), end='')
        return
    changes = []
    args.output_dir.mkdir(parents=True, exist_ok=True)
    inputs = sorted(normalizer.authority_files.items()) if args.from_authority else [
        (path.name, read_composition_view(path)) for path in sorted(args.input_dir.glob('*.view.json'))]
    for filename, _ in inputs:
        destination = args.output_dir / filename
        if destination.exists():
            read_composition_view(destination)
    normalizer.full_view_inputs.update({view['viewId']: view for _, view in inputs})
    for filename, original in inputs:
        value = normalizer.normalize(original)
        result = encode(value)
        destination = args.output_dir / filename
        if not destination.exists() or destination.read_text() != result:
            changes.append(filename)
            if args.write:
                destination.write_text(result)
    if args.report:
        args.report.parent.mkdir(parents=True, exist_ok=True)
        decisions = []
        for decision in normalizer.decisions.values():
            compact = {k: v for k, v in decision.items() if k != 'evidence'}
            compact['sourceGoalIds'] = sorted({e['sourceGoalId'] for e in decision['evidence']})
            compact['sourcePaths'] = sorted({e['source'] for e in decision['evidence']})
            decisions.append(compact)
        args.report.write_text(encode(dict(changed=changes, sources=normalizer.sources,
            placementDecisions=decisions, earlierLearningPlaces=normalizer.moves,
            prerequisiteAcquisitionPlacements=normalizer.acquisitions,
            acquisitionContextRepairs=normalizer.acquisition_repairs,
            unresolvedLearningWindows=normalizer.learning_window_conflicts,
            unresolvedContiguousGrouping=normalizer.order_conflicts,
            policy='Source mappings take precedence; no source semester is invented. Unspecified content retains an editorial placement.')))
    print(f'Mathematics stage views: {len(changes)} differences')
    print(f'Unresolved learning windows: {len(normalizer.learning_window_conflicts)}; grouping conflicts: {len(normalizer.order_conflicts)}')
    if args.check and (changes or normalizer.learning_window_conflicts or normalizer.order_conflicts):
        raise SystemExit(1)


if __name__ == '__main__':
    main()
