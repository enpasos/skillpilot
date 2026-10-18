# SPDX-License-Identifier: Apache-2.0
"""Finite lossless reading aid: repeated rubric cores are already printed in full solutions."""
import json,sys
from pathlib import Path
P=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-18/chemie-current450-T2-terminal-exams-author-20261018-v4')
goals=json.loads((P/'AUTHOR.new-goals.full.draft.json').read_text())['newGoals']
for i in range(int(sys.argv[1]),int(sys.argv[2])):
    g=goals[i];e=g['examData']
    print('WHOLE GOAL',i)
    print(json.dumps({k:v for k,v in g.items() if k!='examData'},ensure_ascii=False))
    for k,v in e.items():
        if k!='scoring':print(k+'\n'+(v if isinstance(v,str) else json.dumps(v,ensure_ascii=False)))
    print('WHOLE RUBRIC',e['scoring']['maxPoints'],e['scoring']['passingPoints'])
    for s in e['scoring']['steps']:
        q=dict(s)
        for field,solution in [('description','solutionContent'),('descriptionEn','solutionContentEn')]:
            text=s[field];colon=text.find(': ');core=text[colon+2:] if colon>=0 else text
            if core in e[solution]:q[field]={'entireExactCoreAlreadyPrintedIn':solution,'exactPrefix':text[:colon+2] if colon>=0 else '', 'coreLengthCharacters':len(core)}
        print(json.dumps(q,ensure_ascii=False))
