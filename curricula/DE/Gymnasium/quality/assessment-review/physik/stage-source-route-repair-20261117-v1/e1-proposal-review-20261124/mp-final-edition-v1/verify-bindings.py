from pathlib import Path
import json,hashlib,itertools,jsonschema
base=Path(__file__).resolve().parent;root=next(p for p in base.parents if (p/'curricula/curriculum_manifest.json').is_file());H=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
manifest=json.loads((base/'evidence-manifest.actual.json').read_text())
for row in manifest['files']:assert H(root/row['path'])==row['sha256'],row['path']
assert H(base/'blind-inputs/exam-mp-model-check-edition.goal.json')=='2f8fb6bacb78981267337e03a9d947cdc8144f51633c7f90f9eab2a419ea423d'
assert H(base/'author-inputs/exam-mp-model-check-edition.README.md')=='6a4c37e00aba6dfabd0bf918f3c3787782d746368f8dbfd1b2d6364246b24923'
capsule=json.loads((base/'blind-inputs/input.json').read_text());goal=capsule['proposal'];assert goal==json.loads((base/'blind-inputs/exam-mp-model-check-edition.goal.json').read_text());ctx={r['goal']['id']:r['goal']for r in capsule['fullContextGoals']};closure=set();stack=goal['requires'].copy()
while stack:
 i=stack.pop()
 if i in closure:continue
 closure.add(i);assert i in ctx;stack+=ctx[i].get('requires',[])
assert closure==set(ctx)==set(capsule['fullActualPrerequisiteGoalIds']) and len(closure)==72
runs=[];decisions=[]
for q,m in [('a','gpt-6.1-sol'),('b','gpt-6.2-astra')]:
 d=base/f'round-{q}';run=json.loads((d/'run.actual.json').read_text());response=json.loads((d/'response.json').read_text());schema=json.loads((base/'blind-inputs/output.schema.json').read_text());jsonschema.Draft202012Validator(schema).validate(response)
 assert run['model']==m and run['reasoningEffort']=='ultra' and run['sandbox']['type']=='read-only' and run['exitCode']==0
 ev=[json.loads(s)for s in(d/'events.jsonl').read_text().splitlines()if s.strip()];assert ev[0]['thread_id']==run['threadId'] and ev[-1]['type']=='turn.completed'
 assert run['literalDecision']==response['exactProposalDecision'];runs.append(run);decisions.append(response['exactProposalDecision'])
 for row in run['inputArtifacts']+run['outputArtifacts']:assert H(root/row['path'])==row['sha256']
summary=json.loads((base/'dual-disposition.actual.json').read_text());assert summary['actualLiteralDecisions']==decisions
assert runs[0]['threadId']!=runs[1]['threadId']
scorer=json.loads((base/'independent-scorer-and-numerics.actual.json').read_text());vec=list(itertools.product(range(8),range(7),range(8),range(7),[0,1,7,8,9,10]));passing=[v for v in vec if sum(v)>=28];assert len(vec)==18816 and len(passing)==1147 and not any(v[-1]<7 for v in passing);assert scorer['newEdition']['passingVectorCount']==len(passing)
assert goal['examData']['scoring']['maxPoints']==36 and goal['examData']['scoring']['passingPoints']==28
assert goal['examData']['coveredGoalIds']==['d6dc0e02-831d-4894-a61a-852bcc74f147']
print('PASS: exact final MP2f8/README6a4,2 actual disjoint ultra/read-only CLI runs, raw outcomes/hashes/schema, full native P72 and 18,816-score boundary independently verified. No content approval or integration is inferred.')
