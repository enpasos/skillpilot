"""Condense actual coach and plan runs, personal course flags and the E-phase demand witnesses."""
import json
from pathlib import Path
import subprocess
p=Path(__file__).resolve().parents[1]
def read(f):return json.loads(f.read_bytes())
def write(f,d):f.write_text(json.dumps(d,indent=2,ensure_ascii=False)+'\n')
s=read(p.parent/'structure.actual.json')
phys='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json'
canon=json.loads(subprocess.check_output(['git','show','4f963b4b78:'+phys]))
goals={g['id']:g for g in canon['goals']}
demands={}
for v in s['changed']:
    for move in v['acquisitionPlacementMoves']:
        if move['subject']!='68a8ac50-f5f5-4e24-8aa9-5e408ca01ced': continue
        topics=move['demandingTopicsInEPhase']
        assert len(topics)==1
        section,ids=next(iter(topics.items()))
        item={'title':move['title'],'section':section,'dependentGoals':[
            {'id':g,'title':goals[g]['title'],'exam':bool(goals[g].get('examData'))} for g in ids]}
        assert move['id'] not in demands or demands[move['id']]==item
        demands[move['id']]=item
assert len(demands)==6
for prefix in ['16caf92e','89cadf81']:
    assert sum(any(x['id'].startswith(prefix) for x in m['dependentGoals']) for m in demands.values())==5
write(p/'math-demand.actual.json',demands)
native=read(p/'probes/native/actual.json')
grav='eb0ffdea-c12d-56df-b7e8-c0297d2f8aff'
active,plans=[],[]
for r in native['activeRows']:
    before,after=r['before'],r['after']
    assert r['exactMasteryDelta']=={grav:1.0} and before['activeGoal']==grav and after['activeGoal'] is None
    assert len(before['planned'])==1 and before['planned']==after['planned']==before['storedFocus']==after['storedFocus']
    active.append({'course':r['course'],'pilot':r['unitPilot'],'prerequisites':r['prerequisiteCount'],
                   'requiredActionBeforePass':before['stateMachine']['requiredAction'],
                   'stateBefore':before['learningState'],'beforeGoal':before['activeGoal'],'afterGoal':after['activeGoal'],
                   'exactMasteryDelta':r['exactMasteryDelta'],'storedSelectionBeforeAndAfter':before['storedFocus']})
for r in native['planRows']:
    assert r['exactStoredCount']==32 and not r['stale'] and not r['restoredStale']
    plans.append({k:r[k] for k in ('course','unitPilot','variant','exactStoredCount','currentSelectionCount','stale','restoredStale','storedFingerprint','moved','offeredAndStarted','freshNativePredecessorCaptureMatchesOriginal')})
write(p/'plan-and-coach.actual.json',{'active':active,'plans':plans})
