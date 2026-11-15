#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Apply this exact inactive candidate to an explicitly selected checkout after review."""
from pathlib import Path
import argparse,copy,json,shutil
p=argparse.ArgumentParser();p.add_argument('--target-root',required=True);p.add_argument('--apply',action='store_true');args=p.parse_args()
out=Path(__file__).resolve().parent;target=Path(args.target_root).resolve();payload=json.loads((out/'candidate-payload.json').read_text());canonical=target/payload['canonicalPath'];d=json.loads(canonical.read_text());by={g['id']:g for g in d['goals']}
# Compare concrete objects, so unrelated first-wave integration changes are allowed.
for e in payload['ordinaryGoalEdits']+payload['parentEdits']:
 i=e.get('goalId',e['before']['id']);assert by.get(i)==e['before'],f'Object drift for {i}: review actual changes before applying.'
for g in payload['newAssessments']:assert g['id'] not in by,f'Already-existing assessment ID {g["id"]}'
oldtask=copy.deepcopy(next(g for g in d['goals'] if g['id'].startswith('47c515c9')))
for e in payload['ordinaryGoalEdits']+payload['parentEdits']:
 i=e['before']['id'];j=next(j for j,g in enumerate(d['goals']) if g['id']==i);d['goals'][j]=copy.deepcopy(e['after'])
d['goals']+=copy.deepcopy(payload['newAssessments'])
assert next(g for g in d['goals'] if g['id']==oldtask['id'])==oldtask
files=[x for x in (out/'proposed').rglob('*') if x.is_file() and str(x.relative_to(out/'proposed'))!=payload['canonicalPath']]
for src in files:
 dest=target/src.relative_to(out/'proposed');assert not dest.exists() or dest.read_bytes()==src.read_bytes(),f'Destination drift: {dest}'
print(json.dumps({'target':str(target),'ordinaryGoalEdits':len(payload['ordinaryGoalEdits']),'newAssessments':len(payload['newAssessments']),'materialFiles':len(files),'oldTask6Unchanged':True,'mode':'apply' if args.apply else 'dry-run','releaseStatus':'needs_review; this script never marks tasks released or writes QA approvals'},indent=2))
if args.apply:
 canonical.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
 for src in files:
  dest=target/src.relative_to(out/'proposed');dest.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(src,dest)
