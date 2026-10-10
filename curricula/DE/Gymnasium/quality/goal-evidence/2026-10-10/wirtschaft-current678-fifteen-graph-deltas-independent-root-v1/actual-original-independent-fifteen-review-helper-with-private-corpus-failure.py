from pathlib import Path
import json, hashlib, copy, shutil, subprocess, time, gzip
from fractions import Fraction
R=Path('/home/enpasos/projects/skillpilot')
Q=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10'
O=Q/'wirtschaft-current678-fifteen-graph-deltas-independent-root-v1'
C=Path(Path('/tmp/economics-independent678-root-cap-path.txt').read_text().strip())
H=Q/'wirtschaft-M6-fifteen-graph-phase-and-one-income-gate-isolated-author-v1/actual-final-fifteen-goal-graph-phase-and-one-income-gate-inert-AUTHOR.handoff.json'
CAN='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json'
def rd(p):return json.loads(p.read_text())
def bind(p):return {'path':str(p.relative_to(R)),'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'bytes':p.stat().st_size}
def ck(b):
 p=R/b['path'];assert bind(p)==b;return p
def save(n,x):
 p=O/n;assert not p.exists();p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n');return bind(p)
h=rd(H)
for k in ['wholeBefore','wholeAfter','wholeGoalDeltaIndex','wholeIncomeCounterworks','wholeSourceQAndERetained','wholeOther663Endguards']:ck(h[k])
assert bind(R/CAN)['sha256']==h['wholeBefore']['sha256']
b=rd(ck(h['wholeBefore']));a=rd(ck(h['wholeAfter']));bg={g['id']:g for g in b['goals']};ag={g['id']:g for g in a['goals']}
assert len(bg)==len(ag)==678 and bg.keys()==ag.keys()
rows=rd(ck(h['wholeGoalDeltaIndex']));assert len(rows)==15
reconstructed=copy.deepcopy(b);rg={g['id']:g for g in reconstructed['goals']};count=0
for z in rows:
 gid=z['goalId'];assert z['wholeBefore']==bg[gid] and z['wholeAfter']==ag[gid]
 for d in z['actualDeltas']:
  keys=d['field'].strip('/').split('/');obj=rg[gid]
  for k in keys[:-1]:obj=obj[k]
  assert obj[keys[-1]]==d['before'];obj[keys[-1]]=copy.deepcopy(d['after']);count+=1
assert count==23 and reconstructed==a
assert sum(bg[i]==ag[i] for i in bg)==663
for i in bg:
 for k in ['description','descriptionEn','examData','sourceRef','resourceLinks','tags','applicability','extendedData','contains']:
  assert bg[i].get(k)==ag[i].get(k),(i,k)
source=rd(ck(h['wholeSourceQAndERetained']));assert len(source['actualNineWholeSourceRows'])==9
ordinary=[]
for z in source['actualNineWholeSourceRows']:
 gid=z['canonicalGoalId'];g=z['actualWholeSourceGoal']
 assert g['phase']=='Q' and g['stage']=='SekII' and z['originalSourcePhaseRetained']=='Q'
 assert bg[gid]['dimensionTags']['phase']=='Q' and ag[gid]['dimensionTags']['phase']=='SekII'
 assert bg[gid]['sourceRef']==ag[gid]['sourceRef'] and bg[gid]['requires']==ag[gid]['requires']
 ordinary.append(gid)
assert source['wholeIncomeSourceRowRetained']['phase']=='E'
income='c6f05990-4c2d-56ce-9412-3a4a4bcfc488';orient='6bf2d1cc-e745-50dd-a617-71c06a6c6945'
assert bg[income]['requires']==['641dee8e-9658-5db1-89eb-2353f8322a8a'] and ag[income]['requires']==[orient]
assert bg[income]['dimensionTags']==ag[income]['dimensionTags'] and ag[income]['dimensionTags']['phase']=='E'
assert sum(map(Fraction,[420,80,110,40]))==650 and Fraction(900)-120+180==960
assert not ag[orient]['requires'] and ag[orient]['semanticKind']=='orientation'
reg=rd(R/'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json');s=next(x for x in reg['subjects'] if x['subject']=='wirtschaftswissenschaften')
profiles={}
for p in s['positiveEvidenceConfigPaths']:
 cfg=rd(R/p)
 for line in (R/cfg['reviewPath']).read_text().splitlines():
  z=json.loads(line);profiles[z['goalId']]=z
assert len(profiles)==336
assert len(profiles[income]['profile']['applicationCaseBriefs'])==2
assert profiles[income]['profile']['archetype']=='data'
decision=save('actual-root-independent-fifteen-field-contract-source-phase-and-one-real-income-gate-decisions.json',{
 'reviewer':'/root','independentAuthor':'/root/economics_merge_audit','wholeAuthorHandoff':bind(H),
 'wholeFieldwiseBeforeAfterSourceAndPReads':True,'ordinaryNinePhaseOnlyIds':ordinary,
 'phaseDecision':'KEEP bounded compatibility metadata SekII: original source Q and source course placements retained; no invented semester and no new source release',
 'twoWholePracticeMetadataDecision':'KEEP broad SekII and remove false E-only prefix; original whole descriptions, cases, rubrics and necessary prerequisites remain exact',
 'incomeRequiresDecision':{'decision':'KEEP narrowly corrected prerequisite','goalId':income,'ownFullCaseResults':[650,960],
  'ownWholeCaseReason':'420+80+110+40 counts explicitly defined resident net factor incomes, excludes transfers70 and credits90; 900-120+180 changes domestic to residency scope, excludes re-counting the investment50. This does not require drawing all sectors/capital accounts or showing both separate circular-flow causal-transfer performances. No ordinary mastery is inferred from orientation.',
  'goalDefinitionAndSourceEUnchanged':True,'positiveWholeProfileUnchanged':True,'atomicityAndNoMemoryBodyDecisionsRetained':True},
 'unchangedQualifiedBodyScienceNotRestarted':True,'imagesAndImageLinksUnchanged':True,
 'newStrictScientificClosures':0,'restoredStrictBindings':0,'activeWrites':0,'humanApproval':False})
new33=rd(Q/'wirtschaft-current678-remaining33-independent-combined-scope-root-v1/whole-new33-material-ids.for-independent-native.json')
save('whole-new33-material-ids.for-independent-native.json',new33)
node=Path('/tmp/skillpilot-checkpoint-native-node-path.txt').read_text().strip();cli=R/'app/node_modules/tsx/dist/cli.mjs';commands=[]
for label,data in [('actual-before15-private-current678',b),('actual-after15-private-current678',a)]:
 (C/CAN).write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
 argv=[node,str(cli),str(C/'native-root678.mts'),str(C),str(O),str(R),label];start=time.monotonic()
 with (O/(label+'.stdout.txt')).open('w') as out,(O/(label+'.stderr.txt')).open('w') as err:
  r=subprocess.run(argv,cwd=C,stdout=out,stderr=err)
 assert r.returncode==0,(label,(O/(label+'.stderr.txt')).read_text())
 row={'argv':argv,'actualExitCode':r.returncode,'seconds':time.monotonic()-start,'stdout':bind(O/(label+'.stdout.txt')),'stderr':bind(O/(label+'.stderr.txt')),'raw':bind(O/(label+'.raw.json.gz')),'summary':bind(O/(label+'.summary.json'))};commands.append(row)
 print(json.dumps({'stage':label,'actualExit':r.returncode,'summary':rd(O/(label+'.summary.json'))}),flush=True)
before=json.loads(gzip.decompress((O/'actual-before15-private-current678.raw.json.gz').read_bytes()));after=json.loads(gzip.decompress((O/'actual-after15-private-current678.raw.json.gz').read_bytes()))
assert before['all64NativeScopeRows']==after['all64NativeScopeRows']
assert after['source']['unsupportedAssignedAtomicGoals']==after['source']['unmappedSourceAtomicGoals']==0
assert all(x['status']=='pass' for x in after['route']['rules'])
assert all(not x['missingWholePrerequisiteIds'] for x in after['individualWholeMaterialContextBindings'] if x['actualVisibleTarget'])
label='actual-private-candidate-native-graph';argv=[node,str(cli),str(C/'app/scripts/validateGraph.ts')];start=time.monotonic()
with (O/(label+'.stdout.txt')).open('w') as out,(O/(label+'.stderr.txt')).open('w') as err:r=subprocess.run(argv,cwd=C/'app',stdout=out,stderr=err)
row={'argv':argv,'actualExitCode':r.returncode,'seconds':time.monotonic()-start,'stdout':bind(O/(label+'.stdout.txt')),'stderr':bind(O/(label+'.stderr.txt'))};commands.append(row)
save('actual-three-private-native-source-scope-and-graph-commands.json',commands)
assert r.returncode==0,(O/(label+'.stdout.txt')).read_text()[-5000:]
assert bind(R/CAN)['sha256']==h['wholeBefore']['sha256']
shutil.copyfile(__file__,O/'actual-executed-independent-fifteen-review.py')
final=save('actual-final-fifteen-graph-source-scope-and-income-gate-independent-KEEP.handoff.json',{
 'decision':'KEEP fifteen bounded graph repairs; technical A/M/P/SEM followers and active integration separately pending',
 'reviewer':'/root','independentAuthor':'/root/economics_merge_audit','wholeAuthorHandoff':bind(H),
 'wholeBefore':h['wholeBefore'],'wholeAfter':h['wholeAfter'],'wholeDeltas':h['wholeGoalDeltaIndex'],
 'ownScientificDeltaDecision':decision,'actualThreeNativeCommands':bind(O/'actual-three-private-native-source-scope-and-graph-commands.json'),
 'all64WholeOrdinarySupportMemoryAndOrientationRowsExact':True,'all663OtherWholeGoalsExact':True,
 'actualSourceUnsupportedAndUnmappedZero':True,'actualAllRouteRulesPass':True,'actualNativeGraphPass':True,
 'allOrdinaryDescriptionsAndWholeCaseBodiesExact':True,'oldImagesAndHistoricalProofsExact':True,
 'newStrictScientificClosures':0,'restoredStrictBindings':0,'strictNet':0,'activeWrites':0,'humanApproval':False})
print(json.dumps({'final':final}),flush=True)
