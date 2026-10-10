from pathlib import Path
import json,gzip,hashlib
R=Path('/home/enpasos/projects/skillpilot');O=R/Path('/tmp/economics-ops14-independent-own-path.txt').read_text().strip();D=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/wirtschaft-M4-fourteen-finance-business-and-representation-KEEP-first-current597-author-b-v1';src=O/'actual-two-entire-customer-perspective-and-targeted-improvement-absence-whole-counterworks-independent-REVISE.json';before=src.read_bytes();doc=json.loads(before);I=D/'actual-current597-fourteen-whole-contracts-original-P28-ten-existing-materials-and64-scope-KEEP-first.AUTHOR-intake.json.gz';rs=json.loads(gzip.decompress(I.read_bytes()))['whole14CurrentDEENContractsAndOriginalP28'];by={r['goalId']:r for r in rs};deltas=[]
for w in doc['works']:
 actual=w['frozenWholeMaterial']['requires'][0];r=by[actual]
 for field,value in [('goalId',actual),('currentWholeGoal',r['wholeCurrentDEENGoal']),('wholeOriginalPositiveRecord',r['wholeOriginalPositiveRecord'])]:
  if w[field]!=value:deltas.append({'materialId':w['materialId'],'field':field,'before':w[field],'after':value});w[field]=value
 assert w['goalId']==w['frozenWholeMaterial']['examData']['coveredGoalIds'][0]==w['currentWholeGoal']['id']
assert len(deltas)==3
out=O/'actual-two-whole-counterworks-correct-e905-current-contract-and-P-binding-only-independent-successor-v2.json';doc['originalFindingHistory']={'path':str(src.relative_to(R)),'sha256':hashlib.sha256(before).hexdigest(),'mistake':'Three embedded fields accidentally indexed an intake row by material position, although intake order differs. The written e905 stakeholder work and marks were for the actually read e905/P case. Original remains protected; no original work or verdict is rewritten.'};doc['actualThreeMetadataBindingDeltas']=deltas;out.write_text(json.dumps(doc,ensure_ascii=False,indent=2)+'\n');assert src.read_bytes()==before;print(str(out.relative_to(R)));print(hashlib.sha256(out.read_bytes()).hexdigest())
