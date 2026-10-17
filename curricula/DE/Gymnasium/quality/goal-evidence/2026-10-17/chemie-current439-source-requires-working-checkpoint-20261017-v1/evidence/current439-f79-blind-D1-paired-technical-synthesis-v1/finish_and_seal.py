from pathlib import Path
import copy,datetime,hashlib,importlib.util,json,os,shutil,subprocess
O=Path(__file__).parent;K=O/'capsule'
stagepath=O/'STAGE.actual-fresh-blind-native-D1-original-byte-copies.json';stage=json.loads(stagepath.read_text())
Q=Path(stage['committableTechnicalRoot']);native=Path(stage['nativeRootRelativePath']);gid=stage['goalIds'][0]
src=Path(stage['sourceCentral']['path']);guards={str(src):stage['sourceCentral']}
def pin(p):
 p=Path(p);b=p.read_bytes();return {'path':str(p),'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def put(p,obj):
 assert O in p.parents
 p.parent.mkdir(parents=True,exist_ok=True);assert not p.exists() and not p.is_symlink(),str(p)
 p.write_text(json.dumps(obj,ensure_ascii=False,indent=2)+'\n');return pin(p)
assert pin(src)==stage['sourceCentral']
cfg=json.loads(src.read_text());out=copy.deepcopy(cfg);s=out['subjects'][0]
assert len(s['resolutionIndexPaths'])==114 and len(s['resolutionSupersessions'])==372 and len(s['positiveEvidenceConfigPaths'])==124
memory=json.loads((K/s['memoryReviewConfigPath']).read_text());assert len(memory['visibilityScopes'])==41
idx=json.loads((K/native/'resolution-index.json').read_text());assert idx['schemaVersion']==2 and idx['batchGoalIds']==[gid] and len(idx['resolutions'])==1
assert idx['resolutions'][0]['goalId']==gid and idx['resolutions'][0]['strictDescriptionComplete'] is True
claims=[]
for path in s['resolutionIndexPaths']:
 p=K/path;guards[str(p)]=pin(p)
 if any(r['goalId']==gid for r in json.loads(p.read_text())['resolutions']):claims.append(path)
assert not any(w['goalId']==gid for w in s.get('resolutionWithdrawals',[]))
oldnodes={e['supersededIndexPath'] for e in s['resolutionSupersessions'] if e['goalId']==gid};terminal=set(claims)-oldnodes
expectedold='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/chemie-current439-b008-terminal12-native-preparation-technical-c-v1/native12/resolution-index.json'
assert terminal=={expectedold},terminal
newindex=str(native/'resolution-index.json');assert newindex not in s['resolutionIndexPaths']
edge={'goalId':gid,'supersededIndexPath':expectedold,'replacementIndexPath':newindex}
s['resolutionIndexPaths'].append(newindex);s['resolutionSupersessions'].append(edge)
expected=copy.deepcopy(cfg);expected['subjects'][0]['resolutionIndexPaths'].append(newindex);expected['subjects'][0]['resolutionSupersessions'].append(edge);assert out==expected
configrel=Q/'central.current439.D115-blind-D1-P1paired-M41.PROSPECTIVE.Source-open.config.json';configpin=put(K/configrel,out)
commands=[]
for name in ['create-manifest','materialize-resolutions','materialize-index','validate-index']:
 p=O/(name+'.command.json');d=json.loads(p.read_text());assert d['exitCode']==0,(name,d)
 pointers={}
 for source in [p,Path(d['stdoutPath']),Path(d['stderrPath'])]:
  dest=K/Q/'stock-validation-original-bytes'/source.name;dest.parent.mkdir(parents=True,exist_ok=True);dest.write_bytes(source.read_bytes());assert pin(dest)['sha256']==pin(source)['sha256'];pointers[source.name]=pin(dest)
 commands.append({'originalCommand':pin(p),'committableExactOriginals':pointers,'exitCode':0})
stagecopy=K/Q/'STAGE.actual-fresh-blind-native-D1-original-byte-copies.exact.json';stagecopy.write_bytes(stagepath.read_bytes());assert pin(stagecopy)['sha256']==pin(stagepath)['sha256']
for p,g in {**{x['path']:x for x in stage['sourceGuards']},**guards}.items():assert pin(p)==g,p
for c in stage['byteExactCopies']:assert pin(Path(c['copy']['path']))==c['copy'],c
holds=['Source9','HB97','104-source','A/P/V lower gates']
plan=put(K/Q/'PLAN.blind-D1-only-exact-current-terminal-edge.Source-open.json',{'role':'Prospective only; append one actual fresh blind D1 index and exactly one edge from the current D12 terminal','source':pin(src),'candidate':configpin,'candidateRelativePath':str(configrel),'index':pin(K/newindex),'addedEdge':edge,'counts':{'descriptionIndexes':115,'descriptionSupersessionEdges':373,'positiveEvidenceConfigs':124,'positiveEvidenceUniqueGoalsPreserved':439,'memoryVisibilityScopes':41},'onlyChangedJSONLocations':['subjects[0].resolutionIndexPaths + one','subjects[0].resolutionSupersessions + one'],'allOtherConfigurationValuesUnchanged':True,'informedP1RunsUsedAsDEvidence':False,'nativeP1WholeRecordExactToCompositeP1':True,'nativeP1ReviewId':stage['nativeP1ReviewId'],'remainingHolds':holds,'activated':False})
roots=[K/native.parent,K/Q]
assert not any(p.is_symlink() for root in roots for p in root.rglob('*'))
port=O/'portability-projection';port.mkdir()
for root in roots:shutil.copytree(root,port/root.relative_to(K),copy_function=os.link)
g=subprocess.run(['git','init','--quiet',str(port)],text=True,capture_output=True);assert g.returncode==0,g.stderr
spec=importlib.util.spec_from_file_location('stock_schema_validation','/home/enpasos/projects/skillpilot/scripts/validate_schemas.py');module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
errors=module.curriculum_symlink_errors(port);assert errors==[],errors
portpin=put(O/'PORTABILITY.stock-curriculum-symlink-check.json',{'function':'scripts/validate_schemas.py:curriculum_symlink_errors','projection':str(port),'scope':[str(native.parent),str(Q)],'projectionUsesExactMaterializedOwnFileBytes':True,'errors':errors,'errorCount':0,'fullSchemaOrCentralValidationRun':False})
parsed=0
for root in roots:
 for p in root.rglob('*'):
  if p.suffix=='.json':json.loads(p.read_text());parsed+=1
  elif p.suffix=='.jsonl':
   for line in p.read_text().splitlines():
    if line.strip():json.loads(line)
   parsed+=1
main=Path('/home/enpasos/projects/skillpilot');head=subprocess.run(['git','rev-parse','HEAD'],cwd=main,capture_output=True,text=True,check=True).stdout.strip();status=subprocess.run(['git','status','--porcelain'],cwd=main,capture_output=True,text=True,check=True).stdout
assert head=='d486510229aa923e9a4de86eb95551de887e4ba0' and status==''
receipt={'schemaVersion':1,'role':'Sealed finite technical actual fresh blind paired D1 successor; no new scientific review','sealedAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'capsule':str(K),'nativeRootRelativePath':str(native),'reviewPackageRelativePath':str(native.parent),'technicalRootRelativePath':str(Q),'stagingExactOriginalReceipt':pin(stagecopy),'index':pin(K/newindex),'synthesisManifest':pin(K/native/'synthesis-decision-manifest.json'),'prospectiveCentral':configpin,'prospectiveCentralRelativePath':str(configrel),'exactTerminalEdgePlan':plan,'counts':{'goals':1,'freshBlindIndependentDescriptionRecords':2,'keepKeepPairs':1,'profileNoneNonePairs':1,'stockDescriptionResolutions':1,'schemaVersion':2,'prospectiveDescriptionIndexes':115,'prospectiveDescriptionSupersessionEdges':373,'positiveEvidenceConfigsUnchanged':124,'positiveEvidenceUniqueGoalsPreserved':439,'memoryVisibilityScopesUnchanged':41,'exactOriginalFileCopies':len(stage['byteExactCopies']),'originalSourceGuards':len(stage['sourceGuards']),'originalRegistryIndexGuards':len(guards),'parsedJSONOrJSONLArtifacts':parsed},'stockCommands':commands,'portabilityCheck':portpin,'originalInputsUnchanged':True,'byteExactCopiesUnchanged':True,'nativeP1WholeRecordExactToCompositeP1':True,'nativeP1ReviewId':stage['nativeP1ReviewId'],'freshBlindRoundSources':stage['rounds'],'informedP1RunsUsedAsDEvidence':False,'P1CompositeAndM41ConfigurationValuesUnchanged':True,'previousD12AndOtherHistoryPreserved':True,'main':{'head':head,'statusPorcelain':status,'mutated':False},'remainingHolds':holds,'newScientificReviewVotes':0,'newPApprovals':0,'newAApprovals':0,'newMApprovals':0,'newVApprovals':0,'humanApproval':False,'strictFiveGateClosureClaimed':False,'globalM7GainClaimed':0,'centralActivated':False,'fullCentralOrGlobalOrBookBuildRun':False,'timestampNote':'Stock synthesis time=max(completedAt)+1sec is deterministic binding, not actual technical assembly time; sealedAtUTC records assembly completion.'}
selector=put(O/'SELECTOR.actual-fresh-blind-D1-paired.D115-prospective.Source-open.sealed.json',receipt)
for root in roots:
 for p in root.rglob('*'):
  if p.is_file():p.chmod(0o444)
Path(selector['path']).chmod(0o444)
print(json.dumps({'selector':selector,'index':receipt['index'],'config':configpin,'edge':edge,'counts':receipt['counts'],'remainingHolds':holds,'mainClean':True}))
