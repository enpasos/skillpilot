# Apache-2.0. Technical YesNo serialization of actual bound V decisions, no new approval.
import copy,datetime,hashlib,json,pathlib,subprocess
R=pathlib.Path('/home/enpasos/projects/skillpilot');O=pathlib.Path(__file__).parent;H=R/'tmp/checkpoint-chemie-20261013/current407-corrected-P8-native4-physical-host'
read=lambda p:json.loads(p.read_text())
def bind(p):return {'path':str(p.relative_to(R)),'bytes':p.stat().st_size,'sha256':'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest()}
proof=read(O/'PREFLIGHT.exact-N7-I274-canonical-QA-P-A-M-and-NI3-preservation.actual.json');ids=set(proof['scopeGoalIds'])
qpath=H/'curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json';before=qpath.read_bytes();data=json.loads(before);changes=[]
for row in data['records']:
 if row['goalId'] in ids:
  assert row['aiApproved'] is True
  x=next(x for x in proof['selectedCurrentPhysicalAssetsAndOriginalVApprovals'] if x['goalId']==row['goalId'])
  assert row['aiApprovedAssetSha256']==row['assetSha256']==x['sha256']
  row['aiApproved']='yes';changes.append({'goalId':row['goalId'],'onlyField':'aiApproved','before':True,'after':'yes','sameActualBoundOriginalVApprovalAndExactAsset':True})
assert len(changes)==7
new=O/'candidate/QA.current407.N7.I274-other412-exact-and-seven-stock-YesNo-bindings.inactive.json';assert not new.exists();new.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
old=O/'inputs/N7.first-attempt-QA.boolean-approval-serialization.byte-exact.json';old.write_bytes(before)
qpath.unlink();qpath.write_bytes(new.read_bytes())
command=[str(R/'app/node_modules/.bin/tsx'),'app/scripts/generateGoalVisualizationQaLedgers.ts','--check','--subject=chemie'];started=datetime.datetime.now(datetime.timezone.utc).isoformat();p=subprocess.run(command,cwd=H,text=True,capture_output=True)
receipt={'schemaVersion':1,'startedAt':started,'completedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'command':command,'cwd':str(H),'exitCode':p.returncode,'stdout':p.stdout,'stderr':p.stderr,
 'exactInitialUnnormalizedQA':bind(old),'newOperativeQACandidate':bind(new),'exactSevenApprovalSerializationDeltas':changes,
 'stockContract':'generateGoalVisualizationQaLedgers.normalizeYesNo and goalVisualizationQaModel.normalizeGoalVisualizationAiReview require yes/no strings; raw N7 technical packet used boolean true. Existing actual V-science verdicts and all hashes/dates/reviewers/reasons remain identical.',
 'allOther412WholeRecordsExact':True,'newPixelOrVVotes':0,'activeWrites':False}
(O/'checks/STOCK.seven-existing-V-approval-YesNo-serialization-and-freshness.actual.json').write_text(json.dumps(receipt,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'exitCode':p.returncode,'stdout':p.stdout,'stderr':p.stderr,'onlySevenBooleanToStockYesNoChanges':True}));raise SystemExit(p.returncode)
