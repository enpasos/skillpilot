from pathlib import Path
import json,sys
BASE=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/chemie-current442-five-P-scope-operator-remediation-author-20261018-v1')
x=json.loads((BASE/'AUTHOR.five-current-P-scope-operator-remedies.pending.json').read_text());seen={}
def dedup(v):
 if isinstance(v,str) and len(v)>70:
  if v in seen:return '@'+str(seen[v])
  original=v
  for s,k in sorted(seen.items(),key=lambda t:-len(t[0])):
   if len(s)>110:v=v.replace(s,'@'+str(k))
  seen[original]=len(seen)+1;return '['+str(seen[original])+']'+v
 if isinstance(v,dict):return {k:dedup(z) for k,z in v.items()}
 if isinstance(v,list):return [dedup(z) for z in v]
 return v
kind=sys.argv[1];start=int(sys.argv[2]);end=int(sys.argv[3]) if len(sys.argv)>3 else start+1
if kind=='existing':
 for i,v in enumerate(x['existingWholeGoalAndProfileCandidates'][start:end],start):print(json.dumps(dedup({'index':i,'goalId':v['goalId'],'wholeCurrentGoal':v['wholeCurrentGoal'],'wholeProposedProfile':v['wholeProposedProfile']}),ensure_ascii=False))
elif kind=='new':
 for i,v in enumerate(x['newWholeGoalAndProfileCandidates'][start:end],start):print(json.dumps(dedup({'index':i,**v}),ensure_ascii=False))
elif kind=='material':
 m=json.loads((BASE/'AUTHOR.complete-DE-EN-material-routes.pending.json').read_text())
 for i,v in enumerate(m['materials'][start:end],start):print(json.dumps(dedup({'index':i,**v}),ensure_ascii=False))
elif kind=='source':
 for i,v in enumerate(x['sourceUnionCandidates'][start:end],start):print(json.dumps(dedup({'index':i,**{k:z for k,z in v.items() if k not in ['currentWholeDecision','currentCarrierWholeReferences']},'carrierRefs':[{k:z for k,z in t.items() if 'profile' not in k.lower() and 'decision' not in k.lower()} for t in v['currentCarrierWholeReferences']]}),ensure_ascii=False))
