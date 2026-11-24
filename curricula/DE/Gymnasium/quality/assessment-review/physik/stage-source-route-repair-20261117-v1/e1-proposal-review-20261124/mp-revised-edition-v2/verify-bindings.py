from pathlib import Path
import json,hashlib,itertools,jsonschema
base=Path(__file__).resolve().parent;root=next(p for p in base.parents if (p/'curricula/curriculum_manifest.json').is_file());H=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
manifest=json.loads((base/'evidence-manifest.actual.json').read_text())
for row in manifest['files']:assert H(root/row['path'])==row['sha256'],row['path']
assert H(base/'blind-inputs/exam-mp-model-check-edition.goal.json')=='00da776e5807fc11c602914f326fc3f86b88cc279e00c8f4d0190e03b5dae0a6'
assert H(base/'author-inputs/exam-mp-model-check-edition.README.md')=='e1f41767f2cf05009ba60461f6d0c17e9655726e0d40d7306e3ec60415e2aabf'
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
scorer=json.loads((base/'independent-scorer-and-numerics.actual.json').read_text());vec=list(itertools.product(range(8),range(7),range(8),range(7),[0,1,7,8,9,10]));passing=[v for v in vec if sum(v)>=28];assert len(vec)==18816 and len(passing)==1147 and not any(v[-1]<7 for v in passing);assert scorer['passBoundary']['uniquePassingVectors']==len(passing)
assert goal['examData']['scoring']['maxPoints']==36 and goal['examData']['scoring']['passingPoints']==28
assert goal['examData']['coveredGoalIds']==['d6dc0e02-831d-4894-a61a-852bcc74f147']
assert decisions==['revise','revise']
for q in ['a','b']:
 response=json.loads((base/f'round-{q}/response.json').read_text());assert len(response['semanticKindReviews'])==7
 assert all(r['semanticKind']=='practiceAssessment'and r['metadataSemanticallyCoherent']for r in response['semanticKindReviews'])
activation=json.loads((base/'stop-semantic-kind-activation.actual.json').read_text());native=json.loads((base/'stop-native-current-kind-check.actual.json').read_text());assert native['status']=='PASS'and native['goalCount']==863 and native['newAssessmentPresent']==False
assert native['currentLedgerRawSha256']==activation['afterLedgerRawSha256'];assert activation['explicitSemanticCorrection']['before']=='curricularArea'and activation['explicitSemanticCorrection']['after']=='practiceAssessment'
assert activation['afterCounts']['curricularAtomic']==490 and activation['afterCounts']['total']==863
print('PASS: exact00da/READMEe1f4, two actual disjoint ultra/read-only reviews revise/revise, P72, 18,816-score boundary, all7 paired conditional kinds, explicit151kind correction and actual native863/863 STOP check are hash-bound. No new assessment release or coverage is inferred.')
