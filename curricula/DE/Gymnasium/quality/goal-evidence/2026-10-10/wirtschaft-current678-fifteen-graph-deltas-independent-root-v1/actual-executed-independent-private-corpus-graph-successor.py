from pathlib import Path
import json,hashlib,shutil,subprocess,time,os
R=Path('/home/enpasos/projects/skillpilot');O=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/wirtschaft-current678-fifteen-graph-deltas-independent-root-v1';C=Path(Path('/tmp/economics-independent678-root-cap-path.txt').read_text().strip())
CAN='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json'
H=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/wirtschaft-M6-fifteen-graph-phase-and-one-income-gate-isolated-author-v1/actual-final-fifteen-goal-graph-phase-and-one-income-gate-inert-AUTHOR.handoff.json'
def rd(p):return json.loads(p.read_text())
def bind(p):return {'path':str(p.relative_to(R)),'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'bytes':p.stat().st_size}
def save(n,x):
 p=O/n;assert not p.exists();p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n');return bind(p)
h=rd(H);assert bind(R/CAN)['sha256']==h['wholeBefore']['sha256'];assert hashlib.sha256((C/CAN).read_bytes()).hexdigest()==h['wholeAfter']['sha256']
copies=[]
for base,dirs,files in os.walk(R/'curricula'):
 dirs[:]=[d for d in dirs if d!='quality']
 for n in files:
  if not n.endswith('.json'):continue
  p=Path(base)/n;rel=p.relative_to(R)
  if str(rel)==CAN:continue
  dest=C/rel;dest.parent.mkdir(parents=True,exist_ok=True)
  if dest.is_symlink():dest.unlink()
  dest.write_bytes(p.read_bytes());copies.append(bind(p))
assert all(hashlib.sha256((C/x['path']).read_bytes()).hexdigest()==x['sha256'] for x in copies)
save('actual-private-graph-corpus-repair-after16-nonEconomics-missing-copy-errors.json',{'reason':'First private graph used an incomplete older runtime corpus:15 missing overview IDs and missing curriculum_manifest; no Economics finding after bounded15 repair. Corrected only private copies of exact current runtimeJSON, with no active writes, no other-subject authoring and no validator changes. Original actual exit1 retained.','copiedCurrentRuntimeInputs':copies,'oldActualGraphExit':1,'activeWrites':0})
node=Path('/tmp/skillpilot-checkpoint-native-node-path.txt').read_text().strip();argv=[node,str(R/'app/node_modules/tsx/dist/cli.mjs'),str(C/'app/scripts/validateGraph.ts')];label='actual-private-full-current-corpus-candidate-native-graph-v2';start=time.monotonic()
with (O/(label+'.stdout.txt')).open('w') as out,(O/(label+'.stderr.txt')).open('w') as err:r=subprocess.run(argv,cwd=C/'app',stdout=out,stderr=err)
command=save(label+'.command-exit.json',{'argv':argv,'cwd':str(C/'app'),'actualExitCode':r.returncode,'seconds':time.monotonic()-start,'stdout':bind(O/(label+'.stdout.txt')),'stderr':bind(O/(label+'.stderr.txt'))})
assert r.returncode==0,(O/(label+'.stdout.txt')).read_text()[-3000:]
assert bind(R/CAN)['sha256']==h['wholeBefore']['sha256'];assert all(bind(R/x['path'])==x for x in copies)
shutil.copyfile('/tmp/economics-current678-fifteen-root-review-v1.py',O/'actual-original-independent-fifteen-review-helper-with-private-corpus-failure.py');shutil.copyfile(__file__,O/'actual-executed-independent-private-corpus-graph-successor.py')
final=save('actual-final-fifteen-graph-source-scope-and-income-gate-independent-KEEP.handoff.json',{'decision':'KEEP fifteen bounded graph repairs; technical A/M/P/SEM followers and active integration separately pending','reviewer':'/root','independentAuthor':'/root/economics_merge_audit','wholeAuthorHandoff':bind(H),'wholeBefore':h['wholeBefore'],'wholeAfter':h['wholeAfter'],'wholeDeltas':h['wholeGoalDeltaIndex'],'ownScientificDeltaDecision':bind(O/'actual-root-independent-fifteen-field-contract-source-phase-and-one-real-income-gate-decisions.json'),'actualBeforeAfterNativeSourceScopeCommandsAndPreservedFailedPrivateGraph':bind(O/'actual-three-private-native-source-scope-and-graph-commands.json'),'actualRepairedCurrentPrivateCorpusGraphCommand':command,'all64WholeOrdinarySupportMemoryAndOrientationRowsExact':True,'all663OtherWholeGoalsExact':True,'actualSourceUnsupportedAndUnmappedZero':True,'actualAllRouteRulesPass':True,'actualNativeGraphPass':True,'allOrdinaryDescriptionsAndWholeCaseBodiesExact':True,'oldImagesAndHistoricalProofsExact':True,'newStrictScientificClosures':0,'restoredStrictBindings':0,'strictNet':0,'activeWrites':0,'humanApproval':False})
print(json.dumps({'final':final}),flush=True)
