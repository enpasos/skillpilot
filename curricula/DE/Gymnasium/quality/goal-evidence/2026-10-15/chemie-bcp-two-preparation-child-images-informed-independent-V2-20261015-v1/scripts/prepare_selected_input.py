# SPDX-License-Identifier: Apache-2.0
"""Read and bind only selected whole bodies and exact image references."""
from pathlib import Path
from datetime import datetime, timezone
import hashlib
import json
import os

repo = next(p for p in Path(__file__).resolve().parents if (p / 'AGENTS.md').is_file())
own = Path(__file__).resolve().parents[1]
author = own.parent / 'chemie-bcp-two-preparation-child-images-author-root-20261015-v1'
selector_path = author / 'NEUTRAL.scientific-images-and-two-goals.author.selector.json'


def read(p):
    return json.loads(p.read_text())


def ref(p):
    b = p.read_bytes()
    return {'path': p.relative_to(repo).as_posix(), 'sha256': 'sha256:' + hashlib.sha256(b).hexdigest(), 'bytes': len(b)}


assert ref(selector_path)['sha256'] == 'sha256:ef602ad0bda5e2f946409e0d0ddf61e15df693743453c228e422db14a7193c1f'
selector = read(selector_path)
seal_path = repo / selector['finiteSealPath']
assert ref(seal_path)['sha256'] == 'sha256:d3f471f90f51a056eba1192b715a70b631689268ebb497de54b6ecfd3304190d'
for key in ['wholeGoals', 'correctedCaseUniverse', 'correctedEightWholeCases', 'originalOtherWholeCases']:
    assert ref(repo / selector[key]['path']) == selector[key]
goal_bundle = read(repo / selector['wholeGoals']['path'])
goals = goal_bundle['wholeGoals']
assert len(goals) == 2
base_ref = goal_bundle['baseCanonical']
assert ref(repo / base_ref['path']) == base_ref
base = read(repo / base_ref['path'])
by_id = {g['id']: g for g in base['goals']}
by_id.update({g['id']: g for g in goals})
case_base = read(repo / selector['originalOtherWholeCases']['path'])['cases']
case_new = read(repo / selector['correctedEightWholeCases']['path'])['cases']
cases = {c['caseId']: c for c in case_base}
cases.update({c['caseId']: c for c in case_new})
asset_by_goal = {Path(a['path']).parent.name: a for a in selector['assets']}
contexts = []
for goal in goals:
    image = asset_by_goal[goal['id']]
    assert ref(repo / image['path']) == image
    selected_cases = [c for c in cases.values() if c['goalId'] == goal['id']]
    assert len(selected_cases) == 2
    contexts.append({'goal': goal, 'wholeDirectPrerequisites': [by_id[p] for p in goal['requires']],
                     'wholeDirectParents': [g for g in base['goals'] if goal['id'] in g.get('contains', [])],
                     'wholeCases': selected_cases, 'actualNativeImage': image})
for folder in ['inputs', 'browser', 'science', 'checks']:
    (own / folder).mkdir(exist_ok=True)
output = own / 'inputs/two-whole-child-contexts-four-cases-and-image-references.actual.json'
assert not output.exists()
value = {'schemaVersion': 1, 'role': 'Actual neutral selected V input; no canonical/media copies or expected verdict',
         'preparedAtUTC': datetime.now(timezone.utc).isoformat(), 'neutralAuthorSelector': ref(selector_path),
         'wholeAuthorSeal': ref(seal_path), 'wholeTwoGoalSource': selector['wholeGoals'],
         'baseGoalContextReferenceOnly': base_ref,
         'correctedCaseSelector': selector['correctedCaseUniverse'],
         'correctedCases': selector['correctedEightWholeCases'], 'otherOriginalCases': selector['originalOtherWholeCases'],
         'wholeContexts': contexts,
         'roleIndependence': 'Reviewer is not the author of these images or materials; informed full-context V role only.',
         'notAdopted570_426': True, 'normalVRecords': 0, 'QA438Writes': 0,
         'sourceImageCopies': 0, 'fullCanonicalCopies': 0, 'DPAMOrSourceCourseReview': False,
         'actualLearnerLabTrial': False}
temporary = output.with_name(output.name + '.partial')
temporary.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')
os.replace(temporary, output)
print(json.dumps({'input': ref(output), 'wholeGoals': 2, 'wholeCases': 4,
                  'sourceImageCopies': 0, 'fullCanonicalCopies': 0}, indent=2))
