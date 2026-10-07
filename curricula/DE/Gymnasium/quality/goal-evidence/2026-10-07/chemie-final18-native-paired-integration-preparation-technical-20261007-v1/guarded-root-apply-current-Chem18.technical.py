from pathlib import Path
from datetime import datetime,timezone
import json,hashlib,sys,os
ROOT=Path(__file__).resolve().parents[7];B=Path(__file__).resolve().parent;j=lambda p:json.loads(p.read_text());sha=lambda p:'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest();logical=lambda x:'sha256:'+hashlib.sha256(json.dumps(x,sort_keys=True,ensure_ascii=False,separators=(',',':')).encode()).hexdigest();plan=j(B/'guarded-root-current-Chem18-integration-plan.technical.json');protected=j(ROOT/plan['protected151']);apply='--apply' in sys.argv[1:];assert all(a in ['--check','--apply']for a in sys.argv[1:])
finalSeal=B/'technical-preparation.final.freeze.json'
if finalSeal.exists():
 for row in j(finalSeal)['files']:
  item=B/row['path'];assert sha(item).removeprefix('sha256:')==row['sha256'].removeprefix('sha256:')and item.stat().st_size==row['bytes'],str(item)
seal=plan['incrementalPacketSeal'];assert sha(ROOT/seal['path'])==seal['digest']
for row in j(ROOT/seal['path'])['files']:
 p=B/row['path'];assert sha(p).removeprefix('sha256:')==row['sha256'].removeprefix('sha256:')and p.stat().st_size==row['bytes'],str(p)
for operation in plan['fileOperations']:
 source=ROOT/operation['source'];target=ROOT/operation['target'];assert sha(source)==operation['sourceDigest']
 if operation['expectedOldDigest']is None:assert not target.exists(),str(target)
 else:assert target.exists()and sha(target)==operation['expectedOldDigest'],str(target)
registryOperation=plan['sharedRegistryOperation'];registryPath=ROOT/registryOperation['target'];registry=j(registryPath);chem=next(s for s in registry['subjects']if s['subject']=='chemie');assert logical(chem)==registryOperation['expectedOldValueDigest']
for r in protected['MathPhysicsSubjectValues']:assert logical(next(s for s in registry['subjects']if s['subject']==r['subject']))==r['valueDigest']
canon=j(ROOT/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json');by={g['id']:g for g in canon['goals']}
for r in protected['protectedWholeGoals']:assert logical(by[r['goalId']])==r['logicalDigest']
private=protected['privateOperativeViewUnchanged'];assert sha(ROOT/private['path'])==private['digest']
inflight=protected['allEightInflightRetained'];assert j(ROOT/inflight['path'])==inflight['value']
if not apply:
 print(json.dumps({'mode':'read-only preflight','all21OldTargetGuardsPass':True,'allSourceBytesPass':True,'protected151WholeGoalsPass':True,'ChemRegistryOldValuePass':True,'MathPhysicsSubjectValuesPass':True,'privateOperativeViewExact':True,'allEightInflightExact':True,'activeWrites':False,'strictGain':0}));raise SystemExit(0)
# Root only: preserve exact former bytes, then atomically replace each explicit target.
history=B/'root-applied-history';assert not history.exists(),'Do not apply twice';history.mkdir();records=[]
for op in plan['fileOperations']:
 source=ROOT/op['source'];target=ROOT/op['target'];data=source.read_bytes()
 if target.exists():
  old=history/op['target'];old.parent.mkdir(parents=True,exist_ok=True);old.write_bytes(target.read_bytes())
 target.parent.mkdir(parents=True,exist_ok=True);temporary=target.with_name(target.name+'.root-chem18-new');assert not temporary.exists();temporary.write_bytes(data);os.replace(temporary,target);assert sha(target)==op['newDigest'];records.append({'target':op['target'],'digest':sha(target)})
oldRegistry=registryPath.read_bytes();archive=history/registryOperation['target'];archive.parent.mkdir(parents=True,exist_ok=True);archive.write_bytes(oldRegistry)
for i,s in enumerate(registry['subjects']):
 if s['subject']=='chemie':registry['subjects'][i]=registryOperation['newValue']
registryPath.write_text(json.dumps(registry,ensure_ascii=False,indent=2)+'\n')
for r in protected['MathPhysicsSubjectValues']:assert logical(next(s for s in registry['subjects']if s['subject']==r['subject']))==r['valueDigest']
receipt={'role':'Actual Root invocation of reviewed guarded integration only','completedAt':datetime.now(timezone.utc).isoformat(),'fileOperations':records,'sharedRegistryChemOnly':True,'allFormerBytesArchived':True,'inflightUntouched':True,'humanApproval':False,'humanTrial':False,'strictGain':0,'remainingNativeTargetedCommands':plan['postIntegrationNativeTargetedCommands'],'centralRunStillRequired':True};(B/'root-actual-apply.receipt.json').write_text(json.dumps(receipt,indent=2)+'\n');print(json.dumps({'appliedFiles':len(records),'registryChemOnly':True,'centralRunStillRequired':True,'strictGainClaimed':0}))
