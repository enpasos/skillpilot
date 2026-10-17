import json,hashlib,sys
from pathlib import Path
ROOT=Path('/home/enpasos/projects/skillpilot')
INP=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/chemie-current439-HB-remaining162-term27-clean-input-20261017-v2/INPUT.remaining162-term27.neutral.json'
J=json.loads(INP.read_text()); C=json.loads((ROOT/J['centralInputs']['C54']['path']).read_text()); C={g['id']:g for g in C['goals']}; P={r['goalId']:r for r in map(json.loads,(ROOT/J['centralInputs']['P439']['path']).read_text().splitlines())}; IDX={x['goalId']:x for x in J['wholeBodyIndex']}
TS=set(i for t in J['mandatoryTermSets'] for b in t['unreviewedTermBindingProposals'] for i in b['proposedCarrierIds']); CS=set(i for c in J['sourceClauses'] for i in c['proposedUnionCarrierIds']); ONLY=sorted(TS-CS)
def de(v):
 if isinstance(v,dict): return {k:de(x) for k,x in v.items() if not k.endswith('En')}
 if isinstance(v,list): return [de(x) for x in v]
 return v
for arg in sys.argv[1:]:
 ids=ONLY[int(arg.split(':')[0]):int(arg.split(':')[1])] if ':' in arg else [next(i for i in C if i.startswith(arg))]
 for i in ids:
  print('\nCARRIER',i)
  print('C',json.dumps({k:C[i].get(k) for k in ['id','title','description','tags','requires','dimensionTags','applicability']},ensure_ascii=False))
  print('P',json.dumps(de(P[i]['profile']),ensure_ascii=False))
