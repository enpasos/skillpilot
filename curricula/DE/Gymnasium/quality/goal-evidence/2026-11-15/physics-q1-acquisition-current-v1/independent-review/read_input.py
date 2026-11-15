from pathlib import Path
import json,sys
B=Path('tmp/physics-q1-current-acquisition-20261115-v1');tasks=json.loads((B/'content-candidate.json').read_text())['tasks'];profiles={r['ordinaryGoal']['id']:r for r in json.load(open('tmp/physics-release809-20261115/q1-whole-goal-review-priorities.actual.json'))['rows']};ctx=json.loads((B/'native-review-contexts.json').read_text());ordinary={r['goal']['id']:r for r in ctx['actualCurrentOrdinaryContexts']};candidate={r['goal']['id']:r for r in ctx['candidateTaskContexts']};full={r['id']:r for r in ctx['fullGoalTextsForEveryCurrentSecuredOrdinaryAndCandidate']}
for i in map(int,sys.argv[1:]):
 t=tasks[i];print('\n===== TASK',i,t['id'],t['title'],'=====');c=candidate[t['id']];print('NATIVE_CANDIDATE_CONTEXT',json.dumps({'goal':c['goal'],'buildsOn':c['buildsOn'],'securedCount':c['securedCount']},ensure_ascii=False))
 for gid in t['examData']['coveredGoalIds']:
  p=profiles[gid];c=ordinary[gid];print('\nNATIVE_ORDINARY_CONTEXT',json.dumps({'goal':c['goal'],'buildsOn':c['buildsOn'],'securedCount':c['securedCount'],'leadsTo':c['leadsTo']},ensure_ascii=False));print('WHOLEGOAL',json.dumps({k:v for k,v in p['ordinaryGoal'].items() if k not in ['resourceLinks','sourceRef','applicability']},ensure_ascii=False));print('FULL_P',json.dumps(p['positiveEvidenceProfile']['record']['profile'],ensure_ascii=False))
 print('\nFULL_TASK',json.dumps(t,ensure_ascii=False))
