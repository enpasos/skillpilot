#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Apply the accepted source-bound arrow roles to reviewed Physics places.

This is the narrow post-projection authoring layer shared by both Physics
view generators. Official lower-stage scope, own acquisition placement and
upper-stage preparation remain separately recorded facts. The existing view
schema supplies target/prerequisiteOnly and acquisitionPlacement semantics.
"""
import copy
import functools
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PLAN = json.loads((ROOT / 'scripts/generate_laender_physics_stage_views.sources.json').read_text())['reviewedDirectedQuantityArrowBindings']
DECISIONS = json.loads((ROOT / PLAN['sourceDecisionsPath']).read_text())
ARROW = PLAN['goalId']
ASSESSMENT = PLAN['assessmentGoalId']
IDS = {ARROW, ASSESSMENT}
BY_VIEW = {row['viewId']: row for row in DECISIONS['views']}


def validate_source_decisions(decisions):
    states = {row['land']: row for row in decisions['states']}
    if set(states) != {'BB', 'BE', 'BW', 'BY', 'HB', 'HE', 'HH', 'MV', 'NI', 'NW', 'RP', 'SH', 'SL', 'SN', 'ST', 'TH'}:
        raise ValueError('Incomplete directed-quantity arrow Land source decisions')
    for state, row in states.items():
        expected = 'ownPreparation' if state in ('HE', 'BW') else 'lowerStageTargetOperationalisation'
        rationale = row.get('sourceRationale', '')
        if row.get('decision') != expected or not row.get('officialUrl') or not row.get('sha256') or not row.get('pages') or not all(x in rationale for x in ('SkillPilot', 'Maßstäbe', 'Spitze')):
            raise ValueError('Missing or overstated directed-quantity arrow source rationale: ' + state)
    if len(decisions['views']) != 90 or len({row['viewId'] for row in decisions['views']}) != 90:
        raise ValueError('Incomplete directed-quantity arrow view decision inventory')


validate_source_decisions(DECISIONS)


def without_arrow_places(view, preserve_preparation=False):
    """Replay the retained authoring scope before this explicit narrow delta."""
    result = copy.deepcopy(view)
    def trim(nodes):
        kept = []
        for node in nodes:
            if node.get('goalId') in IDS:
                if not (preserve_preparation and node.get('goalId') == ARROW
                        and node.get('projectionRole') == 'prerequisiteOnly'):
                    continue
            if node['kind'] == 'structure':
                node['children'] = trim(node['children'])
            kept.append(node)
        return kept
    result['rootNodes'] = trim(result['rootNodes'])
    return result


def apply_arrow_places(view, goals, intermediate_preparation=False):
    result = without_arrow_places(view)
    row = BY_VIEW.get(result['viewId'])
    if row is None or row['scope'] != result['scope']:
        raise ValueError('Unreviewed directed-quantity arrow view scope: ' + result['viewId'])
    expected_role = ('target' if row['scope']['stage'] in ('CrossStage', 'SekI')
        and row['scope'].get('jurisdiction', 'DE') not in ('DE-HE', 'DE-BW') else 'prerequisiteOnly')
    if row['projectionRole'] != expected_role or row['assessmentOffered'] != (expected_role == 'target'):
        raise ValueError('Directed-quantity arrow source role changed: ' + result['viewId'])
    if ARROW not in goals or ASSESSMENT not in goals:
        raise ValueError('Directed-quantity arrow goal or released K4 is missing')
    task = goals[ASSESSMENT]
    if (goals[ARROW].get('requires') != ['5c44b9ba-9b05-4774-95d5-073230d3fc4f']
            or task.get('requires') != [ARROW]
            or task.get('examData', {}).get('coveredGoalIds') != [ARROW]
            or task['examData'].get('reviewStatus') != 'released'
            or not task['examData'].get('taskContent')):
        raise ValueError('Directed-quantity arrow admission lost its ordinary goal/assessment contract')
    nodes = result['rootNodes']
    for identifier in row['place']:
        matches = [n for n in nodes if n.get('id') == identifier and n['kind'] == 'structure']
        if len(matches) != 1:
            if intermediate_preparation and expected_role == 'prerequisiteOnly':
                # Course-local reconstruction can temporarily use the union's
                # topic taxonomy. Keep its real prerequisite-derived place;
                # main() must apply the exact reviewed place after projection.
                provisional = copy.deepcopy(view)
                found = []
                def collect(items):
                    for item in items:
                        if item.get('goalId') == ARROW and item.get('acquisitionPlacement') is True:
                            found.append(item)
                        if item['kind'] == 'structure':
                            collect(item['children'])
                collect(provisional['rootNodes'])
                if len(found) == 1 and found[0].get('projectionRole') == 'prerequisiteOnly':
                    found[0]['displayLabel'] = goals[ARROW]['title'] + ' (eigene Vorbereitung von SkillPilot)'
                    return provisional
            raise ValueError('Missing reviewed arrow acquisition place: ' + result['viewId'] + '/' + identifier)
        destination = matches[0]
        nodes = destination['children']
    reference = {'kind': 'goalEntry', 'goalId': ARROW, 'projectionRole': expected_role}
    if expected_role == 'prerequisiteOnly':
        reference.update({'acquisitionPlacement': True,
            'displayLabel': goals[ARROW]['title'] + ' (eigene Vorbereitung von SkillPilot)'})
    elif row['sourceDecision'] == 'ownNationalOffer':
        reference['displayLabel'] = goals[ARROW]['title'] + ' (eigenes bundesweites Angebot von SkillPilot)'
    # Same native unit as the first reviewed actual consumer; the requires
    # frontier orders competence acquisition within it. JSON position alone
    # makes no claim of a calendar order among independent sibling units.
    nodes.insert(0, reference)
    if row['assessmentOffered']:
        nodes.insert(1, {'kind': 'goalEntry', 'goalId': ASSESSMENT,
            'displayLabel': task['title'] + ' (eigene Aufgabe von SkillPilot)'})
    result['$schema'] = 'https://skillpilot.com/schemas/composition-view/v1.2/composition-view.schema.json'
    result['viewFormatVersion'] = '1.2'
    result.setdefault('language', 'de')
    return result


def with_arrow_places(generate, goals, intermediate_preparation=False):
    """Keep the original generator's semantic checks before adding the delta."""
    @functools.wraps(generate)
    def wrapped(view, *args, **kwargs):
        # Existing preparation roles belong to the prerequisite-derived input
        # contract (notably G8 exact role preservation); retain them during
        # source reconstruction, then replace only their location afterwards.
        result, evidence = generate(without_arrow_places(view, preserve_preparation=True), *args, **kwargs)
        return apply_arrow_places(result, goals, intermediate_preparation=intermediate_preparation), evidence
    return wrapped
