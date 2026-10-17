from pathlib import Path
import copy,datetime,hashlib,importlib.util,json,os,shutil,subprocess
O=Path(__file__).parent;K=O/'capsule';E=O.parent
stage=json.loads((O/'STAGE.actual-native12-original-byte-copies.json').read_text())
Q=Path(stage['committableTechnicalRoot']);native=Path(stage['nativeRootRelativePath'])
src=E/'current439-remediation14-guarded-root-integration-technical-v1/capsule/curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/chemie-current439-remediation14-guarded-root-integration-technical-v1/current4-v3-root-successor/central.current439.D113-P439V3.PROSPECTIVE.config.json'
def pin(p):
 p=Path(p);b=p.read_bytes();return {'path':str(p),'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def put(p,obj):
 assert O in p.parents
 p.parent.mkdir(parents=True,exist_ok=True)
 assert not p.exists() and not p.is_symlink(),str(p)
 p.write_text(json.dumps(obj,ensure_ascii=False,indent=2)+'\n');return pin(p)
assert pin(src)['sha256']=='ab71b7955ddfedca35dba08afcb9b3e6f05e911d8a8d33904d158b94adb9bf6c'
cfg=json.loads(src.read_text());out=copy.deepcopy(cfg);s=out['subjects'][0]
idx=json.loads((K/native/'resolution-index.json').read_text());assert idx['schemaVersion']==2 and len(idx['resolutions'])==12 and set(idx['batchGoalIds'])==set(stage['goalIds'])
assert all(r['strictDescriptionComplete'] is True for r in idx['resolutions'])
guards={str(src):pin(src)};claims={}
for path in s['resolutionIndexPaths']:
 p=K/path;guards[str(p)]=pin(p)
 for r in json.loads(p.read_text())['resolutions']:claims.setdefault(r['goalId'],[]).append(path)
assert len(s['resolutionIndexPaths'])==113 and len(s['resolutionSupersessions'])==360
newindex=str(native/'resolution-index.json');assert newindex not in s['resolutionIndexPaths'];s['resolutionIndexPaths'].append(newindex)
added=[]
for gid in stage['goalIds']:
 assert not any(w['goalId']==gid for w in s.get('resolutionWithdrawals',[]))
 oldnodes={e['supersededIndexPath'] for e in s['resolutionSupersessions'] if e['goalId']==gid}
 terminal=set(claims.get(gid,[]))-oldnodes;assert len(terminal)==1,(gid,terminal)
 edge={'goalId':gid,'supersededIndexPath':terminal.pop(),'replacementIndexPath':newindex};s['resolutionSupersessions'].append(edge);added.append(edge)
expected=copy.deepcopy(cfg);expected['subjects'][0]['resolutionIndexPaths'].append(newindex);expected['subjects'][0]['resolutionSupersessions'].extend(added);assert out==expected
configrel=Q/'central.current439.D114-native12-P439V3.PROSPECTIVE.P1-open.config.json'
configpin=put(K/configrel,out)
commands=[]
for name in ['create-manifest','materialize-resolutions','materialize-index','validate-index']:
 p=O/(name+'.command.json');d=json.loads(p.read_text());assert d['exitCode']==0,(name,d);commands.append({'command':pin(p),'stdout':pin(Path(d['stdoutPath'])),'stderr':pin(Path(d['stderrPath'])),'exitCode':0})
for p,g in {**{x['path']:x for x in stage['sourceGuards']},**guards}.items():assert pin(p)==g,p
for c in stage['byteExactCopies']:assert pin(Path(c['copy']['path']))==c['copy'],c
assert not any(p.is_symlink() for root in [K/native.parent,K/Q] for p in root.rglob('*'))
# A separate, finite packaging projection exercises the repository's stock symlink rule.
port=O/'portability-projection';port.mkdir()
for root in [K/native.parent,K/Q]:
 dest=port/root.relative_to(K)
 shutil.copytree(root,dest,copy_function=os.link)
g=subprocess.run(['git','init','--quiet',str(port)],text=True,capture_output=True);assert g.returncode==0,g.stderr
spec=importlib.util.spec_from_file_location('stock_schema_validation','/home/enpasos/projects/skillpilot/scripts/validate_schemas.py');module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
errors=module.curriculum_symlink_errors(port);assert errors==[],errors
portpin=put(O/'PORTABILITY.stock-curriculum-symlink-check.json',{'function':'scripts/validate_schemas.py:curriculum_symlink_errors','projection':str(port),'scope':[str(native.parent),str(Q)],'projectionUsesExactMaterializedOwnFileBytes':True,'errors':errors,'errorCount':0,'fullSchemaOrCentralValidationRun':False})
parsed=0
for root in [K/native.parent,K/Q]:
 for p in root.rglob('*'):
  if p.suffix=='.json':json.loads(p.read_text());parsed+=1
  elif p.suffix=='.jsonl':
   for line in p.read_text().splitlines():
    if line.strip():json.loads(line)
   parsed+=1
main=Path('/home/enpasos/projects/skillpilot')
head=subprocess.run(['git','rev-parse','HEAD'],cwd=main,capture_output=True,text=True,check=True).stdout.strip();status=subprocess.run(['git','status','--porcelain'],cwd=main,capture_output=True,text=True,check=True).stdout
assert head=='d486510229aa923e9a4de86eb95551de887e4ba0' and status==''
plan=put(K/Q/'PLAN.native12-only-exact-current-terminal-edges.P1-open.json',{'role':'Prospective only; append one actual native D12 index and 12 exact current-terminal supersession edges','source':pin(src),'candidate':configpin,'candidateRelativePath':str(configrel),'index':pin(K/newindex),'addedEdges':added,'counts':{'descriptionIndexes':114,'descriptionSupersessionEdges':372,'withdrawals':len(s['resolutionWithdrawals'])},'onlyChangedJSONLocations':['subjects[0].resolutionIndexPaths + one','subjects[0].resolutionSupersessions + twelve'],'allOtherConfigurationValuesUnchanged':True,'BP01Open':True,'targetedD1AfterSeparatePCorrectionStillRequired':True,'activated':False})
receipt={'schemaVersion':1,'role':'Sealed finite technical actual-native paired D12 handoff; no new scientific review','sealedAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'capsule':str(K),'nativeRootRelativePath':str(native),'reviewPackageRelativePath':str(native.parent),'technicalRootRelativePath':str(Q),'index':pin(K/newindex),'synthesisManifest':pin(K/native/'synthesis-decision-manifest.json'),'prospectiveCentral':configpin,'prospectiveCentralRelativePath':str(configrel),'exactTerminalEdgePlan':plan,'counts':{'goals':12,'nativeIndependentDescriptionRecords':24,'keepKeepPairs':12,'stockDescriptionResolutions':12,'schemaVersion':2,'prospectiveDescriptionIndexes':114,'prospectiveDescriptionSupersessionEdges':372,'exactOriginalFileCopies':len(stage['byteExactCopies']),'originalSourceGuards':len(stage['sourceGuards']),'originalRegistryIndexGuards':len(guards),'parsedJSONOrJSONLArtifacts':parsed},'stockCommands':commands,'portabilityCheck':portpin,'originalInputsUnchanged':True,'byteExactCopiesUnchanged':True,'main':{'head':head,'statusPorcelain':status,'mutated':False},'remainingHolds':[{'id':'B-P-01','goalId':'f79f15c0-e848-5e17-9eb5-26753d35c93b','status':'OPEN','lane':'P','issue':'A/B demand versus B/A=2 reference; A/B would equal0.5','DKeepDoesNotApproveP':True},{'lane':'D1 successor','status':'REQUIRED_AFTER_SEPARATE_P_CORRECTION','goalId':'f79f15c0-e848-5e17-9eb5-26753d35c93b'}],'newScientificReviewVotes':0,'newPApprovals':0,'newAApprovals':0,'newMApprovals':0,'newVApprovals':0,'humanApproval':False,'strictFiveGateClosureClaimed':False,'globalM7GainClaimed':0,'centralActivated':False,'fullCentralOrGlobalOrBookBuildRun':False,'timestampNote':'Stock synthesis time=max(completedAt)+1sec is deterministic binding, not actual technical assembly time; sealedAtUTC records assembly completion.'}
selector=put(O/'SELECTOR.actual-native12-paired-technical.D114-prospective.P1-open.sealed.json',receipt)
for root in [K/native.parent,K/Q]:
 for p in root.rglob('*'):
  if p.is_file():p.chmod(0o444)
Path(selector['path']).chmod(0o444)
print(json.dumps({'selector':selector,'index':receipt['index'],'config':configpin,'counts':receipt['counts'],'holds':['B-P-01 OPEN','new D1 after separate P correction'],'mainClean':True}))
