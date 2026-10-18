# SPDX-License-Identifier: Apache-2.0
"""Lossless input display with exact-value duplicate locators; no verdicts."""
import json
import sys
from pathlib import Path

BASE=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-18/chemie-current450-T1-terminal-exams-author-20261018-v6')
seen={}
containers=[]
def emit(value, path):
    key=json.dumps(value,sort_keys=True,ensure_ascii=False)
    if len(key)>160 and key in seen:
        return {'EXACT_REPEATED_VALUE_AT':seen[key]}
    if isinstance(value,str) and len(value)>100:
        for location,text in containers:
            start=text.find(value)
            if start>=0:return {'EXACT_SUBSTRING_IN_ALREADY_READ':location,'start':start,'characters':len(value)}
    if len(key)>160:seen[key]=path
    if isinstance(value,dict):return {k:emit(v,path+'/'+k) for k,v in value.items()}
    if isinstance(value,list):return [emit(v,path+'/'+str(i)) for i,v in enumerate(value)]
    return value
mode,start,end=sys.argv[1],int(sys.argv[2]),int(sys.argv[3])
goals=json.loads((BASE/'AUTHOR.new-goals.full.draft.json').read_text())['newGoals']
ordinary=json.loads((BASE/'INPUT.ordinary-goals.selected-only.json').read_text())
if mode=='exams':
    rows=goals
elif mode=='ordinary':
    rows=ordinary['goals'] if isinstance(ordinary,dict) else ordinary
elif mode=='profiles':
    rows=[json.loads(p.read_text()) for p in sorted((BASE/'inputs').glob('whole-P.*.json'))]
    for i,g in enumerate(goals):
        for field in ['taskContent','taskContentEn','solutionContent','solutionContentEn']:
            containers.append((f'/exams/{i}/examData/{field}',g['examData'][field]))
else:raise ValueError(mode)
for i in range(start,min(end,len(rows))):
    print('RECORD',i)
    print(json.dumps(emit(rows[i],f'/{mode}/{i}'),ensure_ascii=False,indent=2))
