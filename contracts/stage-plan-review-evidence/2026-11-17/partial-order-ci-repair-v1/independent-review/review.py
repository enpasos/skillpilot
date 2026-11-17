"""Independent, read-only semantic verification of the focused PR-160 repair."""
import hashlib
import json
import subprocess
import sys
from pathlib import Path

ROOT = Path.cwd()
OUT = ROOT / 'tmp/pipeline/laender-stufen/gesamt/ci/repair-v1/independent-review'
REPAIR = OUT.parent
OUT.mkdir(parents=True, exist_ok=True)

def read(path):
    return json.loads((ROOT / path).read_text())

def sha(data):
    return hashlib.sha256(data).hexdigest()

def git(*args):
    return subprocess.check_output(['git', *args])

def write(name, obj):
    (OUT / name).write_text(json.dumps(obj, ensure_ascii=False, indent=2) + '\n')

diff = git('diff', '--binary')
(OUT / 'reviewed.diff').write_bytes(diff)
changed = git('diff','--name-only').decode().splitlines()
docs = [json.loads(p.read_text()) for p in (ROOT/'curricula/DE/Gymnasium/canonical').glob('*.json')]
goals = {g['id']: g for d in docs for g in d['goals']}
sys.path.insert(0, str(ROOT / 'scripts'))
from normalize_mathematics_stage_views import Normalizer
applicability_index = Normalizer()
canon_checks = []
for p in sorted((ROOT/'curricula/DE/Gymnasium/canonical').glob('*.json')):
    rel = str(p.relative_to(ROOT))
    canon_checks.append({'path':rel,'sha256':sha(p.read_bytes()),'exactHeadBytes':p.read_bytes()==git('show','HEAD:'+rel)})

def closure(seeds):
    seen = set(seeds)
    queue = list(seeds)
    while queue:
        atom = queue.pop()
        for reference in goals[atom].get('requires', []):
            prerequisite = reference.split(':')[-1]
            if prerequisite not in seen:
                seen.add(prerequisite)
                queue.append(prerequisite)
    return seen

scopes = read(str((REPAIR/'native/backend-scopes.json').relative_to(ROOT)))
previous_scopes = {s['key']:s for s in read('tmp/pipeline/laender-stufen/gesamt/final-metadata-v1/native/backend-scopes.json')}
native = read(str((REPAIR/'native/native-views.json').relative_to(ROOT)))
contexts = {c['id']:c for c in native['contexts']}
removed_ids = ['09f47964-2cd0-410e-93ee-9632b582fc91', 'c65ecabf-d00b-4e2d-99ae-b64692325ffb',
               '71cec9fb-3751-4d61-8b34-c5adbbf6e5f2','571793bd-34f1-539e-969c-dfcc2dfa96b3',
               '19f170e4-b88f-4c06-b72a-ce6923748bb4','94b48b93-473f-4bc5-8c93-8c1a5e2cd1a6']
native_results=[]
for scope in scopes:
    key=scope['key']; previous=previous_scopes[key]
    placements={gid:[] for gid in removed_ids}
    def walk(nodes, trail, owner):
        for node in nodes:
            path=trail+[node.get('label') or node.get('id') or node.get('goalId')]
            gid=node.get('goalId')
            if gid in placements:
                placements[gid].append({'owner':owner,'path':path,'role':node.get('projectionRole','target'),
                                        'acquisitionPlacement':node.get('acquisitionPlacement') is True})
            walk(node.get('children', []),path,owner)
    for owner,field in [('math','mathViewKey'),('physics','physicsViewKey')]:
        walk(native['views'][contexts[key][field]]['rootNodes'],[],owner)
    native_results.append({'context':key,
       'seedCount':len(scope['seedAtomicGoalIds']),'learningCount':len(scope['learningAtomicGoalIds']),
       'seedExactPrevious':set(scope['seedAtomicGoalIds'])==set(previous['seedAtomicGoalIds']),
       'learningExactPrevious':set(scope['learningAtomicGoalIds'])==set(previous['learningAtomicGoalIds']),
       'ownUnprunedClosureMatchesNativeL':closure(scope['seedAtomicGoalIds'])==set(scope['learningAtomicGoalIds']),
       'affectedAtoms':[{'goalId':gid,'title':goals[gid]['title'],'inS':gid in scope['seedAtomicGoalIds'],
                         'inL':gid in scope['learningAtomicGoalIds'],'currentAuthoredPlaces':placements[gid]}
                        for gid in removed_ids]})
write('native-scope-and-placement-analysis.json',native_results)

capture=read(str((REPAIR/'native/capture.actual.json').relative_to(ROOT)))
capture_drift=[p for p,digest in capture['sourcePins'].items() if sha((ROOT/p).read_bytes())!=digest]

old_policy=read('tmp/pipeline/laender-stufen/gesamt/mathematik/final-v7/foreign-policy.before.json')
policy=read('app/scripts/config/math-foreign-acquisition-demand.json')
old_set={r['goalId'] for rows in old_policy['views'].values() for r in rows}
new_set={r['goalId'] for rows in policy['views'].values() for r in rows}
retirement=read('tmp/pipeline/laender-stufen/gesamt/mathematik/final-v7/retired-demands.final.actual.json')
retired=[]
for row in retirement['retiredDemands']:
    source=row['currentPhysicsSourcePath']
    view=read(source)
    physics_targets=[]
    def atoms(gid):
        children=goals[gid].get('contains',[])
        return set().union(*(atoms(g.split(':')[-1]) for g in children)) if children else {gid}
    def find_targets(nodes,role='target'):
        for node in nodes:
            actual=node.get('projectionRole',role)
            if node['kind']=='structure':find_targets(node['children'],actual)
            elif actual!='prerequisiteOnly':physics_targets.extend(atoms(node['goalId']))
    find_targets(view['rootNodes'])
    # Source roles precede applicability filtering; an unfiltered role union
    # is not the actual selectable native seed scope. Use current canonical
    # applicability, then close on the unpruned graph.
    physics_targets=[g for g in physics_targets if applicability_index.goal_applies(g,
        {**view['scope'],'durationModel':'G8','courseProfile':'GK'})]
    current_l=closure(physics_targets)
    retired.append({'goalId':row['goalId'],'source':source,
      'sourcePinCurrent':sha((ROOT/source).read_bytes())==row['currentPhysicsSourceSha256'],
      'ownCurrentPhysicsSeedCount':len(set(physics_targets)),'ownCurrentPhysicsLearningCount':len(current_l),
      'notCurrentPhysicsTarget':row['goalId'] not in physics_targets,
      'notCurrentPhysicsLearning':row['goalId'] not in current_l,
      'retirementFullCurrentSeedsExact':set(row['currentAtomicTargets'])==set(physics_targets),
      'retirementFullCurrentLearningExact':set(row['currentLearningClosure'])==current_l})
write('independent-retirement-analysis.json',{'oldCount':len(old_set),'newCount':len(new_set),
  'removed':sorted(old_set-new_set),'added':sorted(new_set-old_set),'retiredDemands':retired,
  'allCurrentPolicyWitnessesValid':all(
     row['requiresPath'][0]==row['consumerGoalId'] and row['requiresPath'][-1]==row['goalId'] and
     all(b in [r.split(':')[-1] for r in goals[a].get('requires',[])] for a,b in zip(row['requiresPath'],row['requiresPath'][1:]))
     for rows in policy['views'].values() for row in rows)})

rollout_path='curricula/DE/Gymnasium/quality/goal-visualization-review/physik-rollout-status.json'
old_rollout=json.loads(git('show','HEAD:'+rollout_path));new_rollout=read(rollout_path)
rollout_delta={}
for key in set(old_rollout)|set(new_rollout):
    if old_rollout.get(key)!=new_rollout.get(key):
        if key=='summary':
            rollout_delta['summary']={k:[old_rollout['summary'].get(k),new_rollout['summary'].get(k)] for k in set(old_rollout['summary'])|set(new_rollout['summary']) if old_rollout['summary'].get(k)!=new_rollout['summary'].get(k)}
        else:rollout_delta[key]=[old_rollout.get(key),new_rollout.get(key)]
physics=next(d for d in docs if d['subject']=='Physik')
write('current-catalog-and-rollout-analysis.json',{'canonicalHeadEquality':canon_checks,
 'allCanonicalGoalsTasksAndPrerequisitesExactHead':all(x['exactHeadBytes'] for x in canon_checks),
 'actualPhysicsGoalCount':len(physics['goals']),'reportedPhysicsGoalCount':new_rollout['summary']['totalGoals'],
 'rolloutSemanticDelta':rollout_delta,'nativeCaptureSourcePinsChecked':len(capture['sourcePins']),
 'nativeCaptureSourceDrift':capture_drift,'nativeCaptureSourceStableClaim':capture['sourceStable']})

pins=changed+['app/scripts/config/math-foreign-acquisition-demand.json','app/scripts/config/math-seki-source-membership.json',
 'scripts/generate_mathematics_seki_excerpts.py','scripts/normalize_mathematics_stage_views.py',
 'scripts/generate_mathematics_foreign_acquisition_policy.py',
 'tmp/pipeline/laender-stufen/gesamt/mathematik/final-v7/foreign-policy.before.json',
 'tmp/pipeline/laender-stufen/gesamt/mathematik/final-v7/retired-demands.final.actual.json',
 'tmp/pipeline/laender-stufen/gesamt/final-metadata-v1/native/backend-scopes.json']
pins += [str(p.relative_to(ROOT)) for p in (REPAIR/'native').glob('*.json')]
pins += [str(p.relative_to(ROOT)) for p in (REPAIR/'map').glob('*.json')]
pins += [str(p.relative_to(ROOT)) for p in (ROOT/'curricula/DE/Gymnasium/canonical').glob('*.json')]
pins += ['app/scripts/reportGoalVisualizationRolloutStatus.ts',
 'curricula/DE/Gymnasium/composition-views/mathematik/de-he-sekii-lk.view.json',
 'tmp/pipeline/laender-stufen/gesamt/ci/math-duration-repair-v2.log',
 'tmp/pipeline/laender-stufen/gesamt/ci/repair-v1/offering-source.log']
write('review-input-manifest.json',{'reviewer':'kinematics_math_inventory, independent of this CI repair authorship',
 'head':git('rev-parse','HEAD').decode().strip(),'diffSha256':sha(diff),'changedFiles':changed,
 'inputs':[{'path':p,'sha256':sha((ROOT/p).read_bytes()),'bytes':(ROOT/p).stat().st_size} for p in sorted(set(pins))]})
print(json.dumps({'changedFiles':len(changed),'nativeContexts':len(native_results),
 'allSeedLearningExact':all(x['seedExactPrevious'] and x['learningExactPrevious'] and x['ownUnprunedClosureMatchesNativeL'] for x in native_results),
 'captureDrift':capture_drift,'oldPolicyCount':len(old_set),'currentPolicyCount':len(new_set),
 'globalRemoved':sorted(old_set-new_set),'retirementChecks':retired,'canonicalFilesExact':sum(c['exactHeadBytes'] for c in canon_checks)},ensure_ascii=False))
