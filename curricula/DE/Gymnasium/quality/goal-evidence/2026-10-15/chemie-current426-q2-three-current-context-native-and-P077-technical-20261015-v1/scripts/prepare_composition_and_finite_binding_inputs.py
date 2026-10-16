# SPDX-License-Identifier: Apache-2.0
"""Prepare exact six-goal inputs; no review judgments and no Native invocation."""
from pathlib import Path
import copy, hashlib, json
REPO=Path.cwd();OWN=Path(__file__).resolve().parents[1];E=OWN.parent
def load(p):return json.loads(p.read_text())
def ref(p):
 b=p.read_bytes();return {'path':p.relative_to(REPO).as_posix(),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def verify(r):
 p=REPO/r['path'];assert ref(p)==r,p;return p
def pinned(rel,h):
 p=E/rel;assert ref(p)['sha256']=='sha256:'+h;return p,load(p)
def put(p,d):
 assert not p.exists(),p;p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
v8p,v8=pinned('chemie-current426-eight-current-V-bindings-technical-20261015-v1/OUTPUTS.finite-current426-three-links-eight-genuine-V.technical-selector.json','a889c6defbb916e2f9b4c1a52a5b2c6b3818858df14061f10963ab855ef50717')
for r in load(REPO/v8['finalSealPath'])['files']:verify(r)
ap,a=pinned('chemie-q2-three-reviewed-candidate-bodies-current426-author-selection-20261015-v1/NEUTRAL.finite-q2-three-actual-context-author-selection.selector.json','55c5a303580bb72d84c5e5f0a708767d3c69b86248ca2c4e92a2c4506005e231')
pp,pav=pinned('chemie-q2-three-current426-targeted-informed-PAV-review-20261015-v1/OUTPUTS.finite-targeted-informed-P3-A3-V2.selector.json','272eb8f28b0c20b6dfaa19542df1f7f69011e4f2252a1dff24cb289090c4d77c')
for source in [a,pav]:
 for r in load(REPO/source['finalSealPath'])['files']:verify(r)
recipe=load(verify(a['sparseWholeGoalRecipe']));old=load(verify(v8['canonical']));new=copy.deepcopy(old);before={g['id']:g for g in old['goals']}
selected={r['goalId']:r['wholeAuthorSelectedAfter'] for r in recipe['goals']}
assert len(selected)==3
for r in recipe['goals']:
 assert before[r['goalId']]==r['wholeBefore']
 assert [k for k in before[r['goalId']] if before[r['goalId']].get(k)!=r['wholeAuthorSelectedAfter'].get(k)]==r['onlyChangedFields']
new['goals']=[copy.deepcopy(selected.get(g['id'],g)) for g in old['goals']];after={g['id']:g for g in new['goals']}
assert len(after)==570 and sum(before[g]==after[g] for g in before)==567
checkpoint=load(verify(v8['baselineSelector']));checkpoint_goals={g['id']:g for g in load(verify(checkpoint['canonical']))['goals']}
allchanges={g for g in after if after[g]!=checkpoint_goals[g]};assert len(allchanges)==6
canonical=OWN/'candidate/canonical570.current426.three-image-links-and-three-Q2-whole-author-bodies.inactive.json';put(canonical,new)
scope=a['goalIds']+['0b5342b9-512d-573f-90d5-7522aee35efa','f4d5a02d-711b-5a6b-a41d-971359c1f64d','0773a104-aaeb-5e96-a615-2a2bec3eb096']
routes=load(verify(pav['wholeActualCaseRoutesAndProfiles']));assert sum(r['caseCount'] for r in routes['wholeCaseRoutes'])==7
put(OWN/'inputs/Q2.whole-seven-original-routes-and-three-author-profiles.before-b47-successor.json',routes)
neighbours={g['id'] for g in new['goals'] if set(g.get('requires',[]))&set(scope)}
own_neighbours=set(scope)|neighbours|{i for g in scope for i in after[g].get('requires',[])}
put(OWN/'inputs/six-whole-current-goals-and-immediate-canonical-contexts.json',{'schemaVersion':1,'goalIds':scope,'wholeGoals':{g:after[g] for g in sorted(own_neighbours)},'directReverseGoalIds':sorted(neighbours),'noScientificJudgments':True})
subject=next(s for s in load(verify(checkpoint['actualCentralConfig']))['subjects'] if s['subject']=='chemie')
superseded={(s['goalId'],s['supersededIndexPath']) for s in subject.get('resolutionSupersessions',[])}
withdrawn={(s['goalId'],s['indexPath']) for s in subject.get('resolutionWithdrawals',[])}
owners=[]
for indexpath in subject['resolutionIndexPaths']:
 idx=load(REPO/indexpath)
 for row in idx['resolutions']:
  gid=row['goalId']
  if gid not in own_neighbours or (gid,indexpath) in superseded or (gid,indexpath) in withdrawn:continue
  owners.append({'goalId':gid,'index':ref(REPO/indexpath),'resolution':ref((REPO/indexpath).parent/row['resolutionPath']),
                 'groupDirectory':(REPO/indexpath).parent.relative_to(REPO).as_posix()})
pmatches=[]
for path in subject['positiveEvidenceConfigPaths']:
 cfg=load(REPO/path)
 if not set(scope)&set(cfg['scope']['goalIds']):continue
 pmatches.append({'config':ref(REPO/path),'scopeGoalIds':[g for g in scope if g in cfg['scope']['goalIds']],'records':ref(REPO/cfg['reviewPath']),'runs':[ref(REPO/p) for p in cfg.get('reviewRunManifestPaths',[])]})
assert not any('f4d5a02d-711b-5a6b-a41d-971359c1f64d' in p['scopeGoalIds'] for p in pmatches)
extra=[E/'chemie-two-reused-digestion-polarimetry-images-independent-V2-20261015-v1/inputs/existing-source-author-whole-DEEN-cases-and-rubrics.json',
       E/'chemie-tensid-letter-free-successor-independent-V1-20261015-v1/inputs/whole-P2-cases-and-source-edit-prompts.exact.json']
for p in extra:assert p.is_file()
plan={'schemaVersion':1,'role':'Finite exact current composition and technical binding inventory; Native waits for final b47 selection',
 'V8Selector':ref(v8p),'checkpointSelector':v8['baselineSelector'],'authorQ2Selector':ref(ap),'PAVSourceSelector':ref(pp),
 'canonical':ref(canonical),'baselineSemantic':v8['semantic'],'baselineQA':v8['visualizationQA'],'baseRebuildMap':v8['exactRebuildRecipe'],
 'goalIds':scope,'Q2GoalIds':a['goalIds'],'wholeCurrentGoalContext':ref(OWN/'inputs/six-whole-current-goals-and-immediate-canonical-contexts.json'),
 'Q2OriginalSevenRoutes':pav['wholeActualCaseRoutesAndProfiles'],'rawLiteralSourceAndMemory':pav['literalSourceAndMemoryBoundary'],
 'otherWholeCasesAndRubrics':[ref(p) for p in extra],'Q2RawV2Original':pav['FIRSTV2'],
 'affectedOrImmediateCurrentDOwners':owners,'selectedCurrentPConfigurations':pmatches,'currentF4PConfigCount':0,
 'additionalQ2WholeBodyChanges':3,'unchangedWholeGoalsComparedToV8':567,'unchangedWholeGoalsComparedToCheckpoint':564,
 'semanticDecisionChangesAuthorized':0,'requiredMechanicalSourceFingerprintRefreshGoalIds':a['goalIds'],
 'awaitingFinalB47Successor':True,'NativePrepareCalls':0,'NativeCheckCalls':0,'newDescriptionRecords':0,'newScienceVotes':0}
put(OWN/'PREPARED.exact-six-body-composition-and-current-binding-inventory.awaiting-b47.json',plan)
print(json.dumps({'goals':570,'atomic':426,'newQ2WholeBodies':3,'allCheckpointWholeBodyChanges':6,'other564Exact':True,'NativeScope':len(scope),'currentDOwnersInspected':len(owners),'currentF4PConfigurations':0,'renderCalls':0}),flush=True)
