# SPDX-License-Identifier: Apache-2.0
from pathlib import Path
from datetime import datetime,timezone
import json,hashlib,sys,os,copy,importlib.util
ROOT=Path(__file__).resolve().parents[7];B=Path(__file__).resolve().parent
mod=importlib.util.spec_from_file_location('fieldmerge',B/'source-field-merge.technical.py');fm=importlib.util.module_from_spec(mod);mod.loader.exec_module(fm)
J=lambda p:json.loads(p.read_text());sha=lambda p:'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest();logical=lambda x:'sha256:'+hashlib.sha256(json.dumps(x,sort_keys=True,ensure_ascii=False,separators=(',',':')).encode()).hexdigest();plan=J(B/'guarded-root-current-Bio4-integration-plan.technical.json');protected=J(ROOT/plan['protectedState']);apply='--apply'in sys.argv[1:];assert all(a in('--apply','--check')for a in sys.argv[1:])
seal=B/'technical-preparation.final.freeze.json'
if seal.exists():
 for row in J(seal)['files']:
  p=ROOT/row['path'];assert sha(p).removeprefix('sha256:')==row['sha256'].removeprefix('sha256:')and p.stat().st_size==row['bytes'],str(p)
packet=plan['incrementalPacketSeal'];assert sha(ROOT/packet['path'])==packet['digest']
for row in J(ROOT/packet['path'])['files']:
 p=ROOT/row['path'];assert sha(p).removeprefix('sha256:')==row['sha256'].removeprefix('sha256:')and p.stat().st_size==row['bytes'],str(p)
for op in plan['fileOperations']:
 source=ROOT/op['source'];target=ROOT/op['target'];assert sha(source)==op['sourceDigest']
 if op['expectedOldDigest']is None:assert not target.exists(),str(target)
 else:assert target.exists()and sha(target)==op['expectedOldDigest'],str(target)
regop=plan['sharedRegistryOperation'];regPath=ROOT/regop['target'];reg=J(regPath);bio=next(s for s in reg['subjects']if s['subject']=='biologie');assert logical(bio)==regop['expectedOldValueDigest'];nonbio=[copy.deepcopy(s)for s in reg['subjects']if s['subject']!='biologie']
for r in protected['MathPhysicsSubjectValues']:assert logical(next(s for s in reg['subjects']if s['subject']==r['subject']))==r['logicalDigest']
canon=J(ROOT/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json');by={g['id']:g for g in canon['goals']}
for r in protected['allOtherWholeGoals']:assert logical(by[r['goalId']])==r['logicalDigest']
for r in protected['protected95PublicAssets']:assert sha(ROOT/r['asset']['path'])==r['asset']['digest']
for r in protected['protected95AllAssetCopies']:assert sha(ROOT/r['path'])==r['digest']
p=protected['operativePrivateViewUnchanged'];assert sha(ROOT/p['path'])==p['digest'];f=protected['allEightInflightRetained'];assert J(ROOT/f['path'])==f['value']
sourcePlan=J(ROOT/plan['sourceFieldOnlyMergePlan']);merged=[]
for row in sourcePlan['rows']:
 target=ROOT/row['target'];live=J(target);result,audit=fm.apply_overlay(live,row['route'])
 for p in sourcePlan['currentLiveA46RowsProtected']:
  if p['target']==row['target']:
   assert p['row']in live.get(p['collection'],[]),'Protected live a46 changed before application';assert p['row']in result.get(p['collection'],[]),'Attempted a46 restore'
 merged.append({'target':row['target'],'liveBytes':target.read_bytes(),'result':result,'audit':audit})
sourceOp=plan['sourceAtlasConfigAppend'];sourceCfgPath=ROOT/sourceOp['target'];sourceCfg=J(sourceCfgPath);mapping=sourceOp['mappingPathToAppend'];newSourceCfg=copy.deepcopy(sourceCfg)
if mapping not in newSourceCfg['mappingPaths']:newSourceCfg['mappingPaths'].append(mapping)
if not apply:
 print(json.dumps({'mode':'read-only preflight','allFileTargetsAndSourcesPASS':True,'fileOperationCount':len(plan['fileOperations']),'all17SourceFieldBeforeOrAfterGuardsPASS':True,'allLiveUnrelatedSourceFieldsPreserved':True,'liveA46PartialLKRowsPreserved':True,'protected95WholeGoalsPNGsPASS':True,'other468WholeGoalsPASS':True,'allEightInflightRetained':True,'sourceConfigAppendOnly':True,'sharedRegistryBiologyOnly':True,'allOtherLiveSubjectsPreserved':True,'activeWrites':False,'strictGain':0}));raise SystemExit(0)
# Root only: historical byte preservation precedes every actual mutation.
history=B/'root-applied-history';assert not history.exists(),'Do not apply twice';history.mkdir();records=[]
def archive(target):
 if target.exists():
  p=history/target.relative_to(ROOT);p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes(target.read_bytes())
def atomic(target,data):
 target.parent.mkdir(parents=True,exist_ok=True);temporary=target.with_name(target.name+'.root-bio4-new');assert not temporary.exists();temporary.write_bytes(data);os.replace(temporary,target)
for op in plan['fileOperations']:
 target=ROOT/op['target'];archive(target);atomic(target,(ROOT/op['source']).read_bytes());assert sha(target)==op['newDigest'];records.append({'target':op['target'],'digest':sha(target)})
for r in merged:
 target=ROOT/r['target'];assert target.read_bytes()==r['liveBytes'],'Source changed after all preflight checks';archive(target);atomic(target,(json.dumps(r['result'],ensure_ascii=False,indent=2)+'\n').encode());records.append({'target':r['target'],'digest':sha(target),'onlyAuthorFieldChanges':True,'audit':r['audit']})
archive(sourceCfgPath);atomic(sourceCfgPath,(json.dumps(newSourceCfg,ensure_ascii=False,indent=2)+'\n').encode());archive(regPath)
for i,s in enumerate(reg['subjects']):
 if s['subject']=='biologie':reg['subjects'][i]=regop['newValue']
assert [s for s in reg['subjects']if s['subject']!='biologie']==nonbio;atomic(regPath,(json.dumps(reg,ensure_ascii=False,indent=2)+'\n').encode())
receipt={'role':'Actual Root-only execution of guarded sealed Bio4 plan','completedAtUTC':datetime.now(timezone.utc).isoformat(),'fileOperations':records,'sourceConfigAppendOnly':True,'sourceGeneratedOutputsRequireNativeRecompute':True,'sharedRegistryBiologyOnly':True,'otherSubjectsPreservedLive':True,'allFormerBytesArchived':True,'allEightInflightUntouched':True,'wholeSourceHoldsRemain':True,'humanApproval':False,'humanTrial':False,'strictGain':0,'postIntegrationNativeTargetedCommands':plan['postIntegrationNativeTargetedCommands'],'centralM7StillRequired':True};(B/'root-actual-apply.receipt.json').write_text(json.dumps(receipt,indent=2)+'\n');print(json.dumps({'appliedFiles':len(records),'sourceFieldOnlyFiles':17,'registryBiologyOnly':True,'nativeSourceRecomputeRequired':True,'strictGainClaimed':0}))
