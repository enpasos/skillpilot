#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Current authored places and full canonical closure; no native acceptance claim."""
import copy
import hashlib
import json
from pathlib import Path
import subprocess
import sys

HERE = Path(__file__).resolve().parent
ROOT = next(p for p in HERE.parents if (p / 'scripts/generate_laender_physics_stage_views.py').exists())
sys.path.insert(0, str(ROOT / 'scripts'))
import generate_hessen_physics_stage_views as g
from normalize_mathematics_stage_views import Normalizer
from generate_mathematics_foreign_acquisition_policy import authored_places, earliest_consumer

BASE = '1001aa2c7f'
IDS = ['53afbda1-5776-502b-8867-471975d7b766', 'ecbaa101-cb10-5da3-9368-ae40ff587d74',
       '059c1adc-e4d2-5222-a923-15abc417d59f', 'a94cfe1c-6f87-47ff-b4f3-31a58d4c6c20',
       '839ecc8f-3a60-418b-bc92-64bfeef33824', 'f524f05c-4456-4fc3-a1f7-f40741fc1f16']

def sha(raw):
    return hashlib.sha256(raw).hexdigest()

def old(path):
    return subprocess.check_output(['git', 'show', BASE + ':' + str(path)], cwd=ROOT)

def write(path, value):
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')

def closure(seeds, goals):
    found, queue = set(), list(seeds)
    while queue:
        atom = queue.pop()
        if atom in found:
            continue
        assert atom in goals and not goals[atom].get('contains'), atom
        found.add(atom)
        queue.extend(ref.split(':')[-1] for ref in goals[atom].get('requires', []))
    return found

def paths(view, identifier):
    found = []
    def visit(nodes, trail=()):
        for node in nodes:
            if node['kind'] == 'structure':
                visit(node['children'], (*trail, dict(id=node['id'], label=node['label'])))
            elif node.get('goalId') == identifier:
                found.append(dict(path=list(trail), role=node.get('projectionRole', 'target'),
                    acquisitionPlacement=node.get('acquisitionPlacement') is True))
    visit(view['rootNodes'])
    return found


def main():
    n = Normalizer(ROOT)
    previous = copy.copy(n)
    previous.goals = dict(n.goals)
    physics = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json'
    for goal in json.loads((ROOT / physics).read_bytes())['goals']:
        previous.goals.pop(goal['id'])
    previous.goals.update({x['id']: x for x in json.loads(old(physics))['goals']})
    previous.cache, previous.depth_cache, previous.prerequisite_cache = {}, {}, {}
    rows, by_land = [], {}
    for path in sorted(g.DIRECTORY.glob('*.view.json')):
        rel = str(path.relative_to(ROOT))
        raw = path.read_bytes()
        view, before = json.loads(raw), json.loads(old(rel))
        current_places, old_places = authored_places(view, n), authored_places(before, previous)
        learning, old_learning = closure(current_places, n.goals), closure(old_places, previous.goals)
        roles = g.role_atoms(view)
        tracked = [dict(goalId=atom, target=atom in current_places, inLearning=atom in learning,
            authoredRole='target' if atom in roles['target'] else 'prerequisiteOnly' if atom in roles['prerequisiteOnly'] else 'absent',
            before=paths(before, atom), after=paths(view, atom)) for atom in IDS]
        row = dict(file=rel, viewId=view['viewId'], scope=view['scope'], beforeSha256=sha(old(rel)), sha256=sha(raw),
            beforeTargetCount=len(old_places), targetCount=len(current_places),
            addedTargetIds=sorted(set(current_places)-set(old_places)), removedTargetIds=sorted(set(old_places)-set(current_places)),
            beforeLearningCount=len(old_learning), learningCount=len(learning),
            addedLearningIds=sorted(learning-old_learning), removedLearningIds=sorted(old_learning-learning),
            beforeMathLearningCount=len(old_learning & n.math_atoms), mathLearningCount=len(learning & n.math_atoms),
            addedMathLearningIds=sorted((learning-old_learning) & n.math_atoms), removedMathLearningIds=sorted((old_learning-learning) & n.math_atoms), goals=tracked)
        assert set(row['addedTargetIds']) <= set(IDS[:3]), row
        assert not row['removedTargetIds'], row
        rows.append(row)
        land = view['scope'].get('jurisdiction', 'DE')
        summary = by_land.setdefault(land, dict(viewCount=0, targets={x:0 for x in IDS[:3]}, learning={x:0 for x in IDS[:3]}))
        summary['viewCount'] += 1
        for atom in IDS[:3]:
            summary['targets'][atom] += atom in current_places
            summary['learning'][atom] += atom in learning
    write(HERE / 'placements.actual.json', dict(schemaVersion=1, baseline=BASE,
        method='Authored Python role projection with applicability and complete canonical prerequisite closure. These are current view records, not native backend/frontier or learner-result acceptance.',
        canonicalPhysicsSha256=sha((ROOT / physics).read_bytes()), byLand=by_land, views=rows))
    frozen = 'curricula/DE/Gymnasium/quality/learning-units/physics-he-e2-child-structures-2026-11-25/regrouping.actual.json'
    predecessor = (ROOT / frozen).read_bytes()
    assert predecessor == old(frozen), 'Sealed HE predecessor changed'
    hesse = []
    for row in rows:
        if row['scope'].get('jurisdiction') != 'DE-HE' or row['scope']['stage'] == 'SekI':
            continue
        view = json.loads((ROOT / row['file']).read_bytes())
        children=[]
        for unit_id, label, label_en, members in g.HESSEN_E2_CHILD_UNITS:
            node=next(x for x in g.walk(view['rootNodes']) if x.get('id')==unit_id)
            own=g.role_atoms({'rootNodes':[node]})['target']
            children.append(dict(id=unit_id,label=label,targetGoalIds=[m for m in members if m in own],
                targetCount=len(own), eligibleCourseTargetGoalIds=sorted(g.course_seeds(own, g.GOALS, view['scope'])), eligibleCourseTargetCount=len(g.course_seeds(own, g.GOALS, view['scope'])), acquiredPrerequisiteIds=[x['goalId'] for x in g.walk(node['children']) if x.get('acquisitionPlacement') is True]))
        hesse.append(dict(file=row['file'],sha256=row['sha256'],childStructures=children))
    write(HERE / 'hessen-children.successor.actual.json',dict(schema='physics-hessian-e2-child-structures-successor-v1',
        countDefinition='targetCount is the raw authored target role; eligibleCourseTargetCount additionally applies the current native course filter. Neither count reads individual learner choices or results.',
        predecessor=dict(path=frozen,sha256=sha(predecessor),unchanged=True),
        delta='One new IMP target in child 6; RATE-M and RATE-I are acquisition prerequisites before the LK derivation, no new declared learning unit.',
        source=dict(path='curricula/DE/Gymnasium/input/HE/upper-secondary/kernkurriculum_gymnasiale_oberstufe-physik.pdf',
            sha256=sha((ROOT/'curricula/DE/Gymnasium/input/HE/upper-secondary/kernkurriculum_gymnasiale_oberstufe-physik.pdf').read_bytes()),pages=[30]),views=hesse))
    print(json.dumps(dict(views=len(rows),byLand=by_land),ensure_ascii=False))

if __name__ == '__main__':
    main()
