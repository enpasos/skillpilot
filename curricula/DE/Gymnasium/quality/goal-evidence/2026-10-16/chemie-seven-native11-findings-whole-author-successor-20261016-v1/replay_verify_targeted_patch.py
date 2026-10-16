"""Verify the finite RFC6902 patch in memory; never write a full landscape."""
from pathlib import Path
from copy import deepcopy
import argparse
import hashlib
import json

parser=argparse.ArgumentParser(description=__doc__)
parser.add_argument('--baseline',required=True,type=Path)
args=parser.parse_args()
here=Path(__file__).resolve().parent
expected='b60881489f399dacd38bf6c48a14d6284e4f672c781855eb61ace34bc4590b20'
assert hashlib.sha256(args.baseline.read_bytes()).hexdigest()==expected,'Different baseline: refusing patch replay'
original=json.loads(args.baseline.read_text())
candidate=deepcopy(original)
for operation in json.loads((here/'PATCH.five-bilingual-descriptions.rfc6902.json').read_text()):
    parts=operation['path'].strip('/').split('/')
    parent=candidate
    for part in parts[:-1]:parent=parent[int(part)] if isinstance(parent,list) else parent[part]
    key=parts[-1]
    if operation['op']=='test':assert parent[key]==operation['value'],operation['path']
    elif operation['op']=='replace':parent[key]=operation['value']
    else:raise ValueError('Unexpected operation')
expected_goals={g['id']:g for g in json.loads((here/'GOALS7.after.author.json').read_text())['goals']}
changed=[]
for old,new in zip(original['goals'],candidate['goals']):
    if old!=new:
        changed.append(new['id'])
        assert {k for k in old if old[k]!=new[k]}=={'description','descriptionEn'}
    if new['id'] in expected_goals:assert new==expected_goals[new['id']],new['id']
assert len(changed)==5
assert len(original['goals'])==len(candidate['goals'])==578
assert {k:v for k,v in original.items() if k!='goals'}=={k:v for k,v in candidate.items() if k!='goals'}
print(json.dumps({'targetedReplay':'PASS','baselineGoals':578,'wholeSuccessorGoalsChecked':7,'onlyBilingualDescriptionChanges':5,'unchangedGoalObjects':573,'fullCanonicalWritten':False,'HModified':False},ensure_ascii=False))
