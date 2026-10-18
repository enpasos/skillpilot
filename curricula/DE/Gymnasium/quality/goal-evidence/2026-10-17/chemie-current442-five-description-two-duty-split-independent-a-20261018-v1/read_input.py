from pathlib import Path
import json,sys
B=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/chemie-current442-five-description-two-duty-split-author-20261017-v1')
x=json.loads((B/'AUTHOR.five-current-remediations-and-two-narrow-duty-candidates.pending.json').read_text());seen={}
def dd(v):
 if isinstance(v,str) and len(v)>70:
  if v in seen:return '@'+str(seen[v])
  original=v
  for s,k in sorted(seen.items(),key=lambda t:-len(t[0])):
   if len(s)>110:v=v.replace(s,'@'+str(k))
  seen[original]=len(seen)+1;return '['+str(seen[original])+']'+v
 if isinstance(v,dict):return {k:dd(z) for k,z in v.items()}
 if isinstance(v,list):return [dd(z) for z in v]
 return v
kind=sys.argv[1];start=int(sys.argv[2]);end=int(sys.argv[3]) if len(sys.argv)>3 else start+1
if kind=='existing':
 for i,v in enumerate(x['records'][start:end],start):print(json.dumps(dd({'index':i,**{k:v[k] for k in ['goalId','beforeGoal','afterGoal','afterWholeProfile','authorReasoning','changedTopLevelFields','memoryBoundary']}}),ensure_ascii=False))
elif kind=='new':
 for i,v in enumerate(x['newCandidateGoals'][start:end],start):print(json.dumps(dd({'index':i,**v}),ensure_ascii=False))
