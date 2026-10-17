from pathlib import Path
from hashlib import sha256
from datetime import datetime,timezone
import json,os
O=Path(__file__).resolve().parent
F=Path('/mnt/e/skillpilot-chemie-L7-20261017/current650-all-seven-current439-native-central-preparation-technical-a-v1/capsule');C=O/'capsule'
R=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/chemie-current439-jurisdiction-only-native20-preparation-technical-c-v1')
L=Path('curricula/DE/Gymnasium/quality/goal-description-review/in-flight-work-ledger.json');Q=Path('curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json')
def read(p):return json.loads(p.read_text())
def pin(p):
 b=p.read_bytes();return {'path':str(p),'sha256':sha256(b).hexdigest(),'bytes':len(b)}
def write(p,obj):
 assert p.is_relative_to(O) and not p.exists(),p;p.parent.mkdir(parents=True,exist_ok=True);text=json.dumps(obj,ensure_ascii=False,indent=2)+'\n';json.loads(text);p.write_text(text)
s=read(O/'SELECTION.actual-open-pure-jurisdiction-first20-and-ownership-plan.json');ids=s['selectedGoalIds'];selected=set(ids);assert len(ids)==len(selected)==20
assert not selected.intersection(s['excludedNative6']) and not selected.intersection(s['excludedAll36NewerOwners'])
audit=read(O/'ownership-audit/AUDIT.native20-owner-roster.current.json')
trie={}
for path,kind in [(R,'directory'),(L,'file'),(Q,'file')]:
 node=trie
 for part in path.parts:node=node.setdefault(part,{})
 node['@kind']=kind
links=[]
def clone(src,dst,node):
 if node.get('@kind')=='file':return
 dst.mkdir()
 names={p.name for p in src.iterdir()} if src.is_dir() else set()
 for name in sorted(names|{k for k in node if k!='@kind'}):
  if name in node:clone(src/name,dst/name,node[name])
  else:(dst/name).symlink_to(src/name,target_is_directory=(src/name).is_dir());links.append({'path':str(dst/name),'target':str(src/name)})
clone(F,C,trie)
(C/Q).write_bytes(Path(s['QARequiredPin']['path']).read_bytes());assert pin(C/Q)['sha256']=='bc2e35e0db01b675e1e1ab13f29e1819f40a715a17a5a96763dffd5848fb780f'
history=C/R/'history';history.mkdir();(history/'original15-configs').mkdir();(C/R/'rest-claims').mkdir()
original_bytes=(F/L).read_bytes();assert sha256(original_bytes).hexdigest()=='5009d76ffc70449b9df727161c5499277115b72830b59793f489c25add17f72a'
original=json.loads(original_bytes);assert len(original['activeBatchConfigPaths'])==15
(history/'in-flight-work-ledger.original15.exact.json').write_bytes(original_bytes)
ledger=json.loads(original_bytes);ledger['activeBatchConfigPaths']=[];changes=[];originals=[];removed=[];globalClaims={}
for n,path in enumerate(original['activeBatchConfigPaths'],1):
 data=(F/path).read_bytes();config=json.loads(data);arch=history/'original15-configs'/f'{n:02d}.{Path(path).name}';arch.write_bytes(data)
 originals.append({'originalPath':path,'originalPin':pin(F/path),'archivedPin':pin(arch),'originalWholeObject':config})
 taken=[gid for gid in config['goalIds'] if gid in selected];remaining=[gid for gid in config['goalIds'] if gid not in selected]
 if not taken:ledger['activeBatchConfigPaths'].append(path);continue
 output=F/config['outputDirectory'];assert not output.exists(),f'Cannot administratively retire materialized old writer/output: {output}'
 rest=json.loads(data);rest['goalIds']=remaining;restored=json.loads(json.dumps(rest));restored['goalIds']=config['goalIds'];assert restored==config
 successor=str(R/'rest-claims'/f'old-{n:02d}.same-original-fields-minus-native20.config.json') if remaining else None
 if successor:write(C/successor,rest);ledger['activeBatchConfigPaths'].append(successor)
 changes.append({'oldActiveReference':path,'oldOriginalPin':pin(F/path),'oldOutputDirectory':config['outputDirectory'],'oldOutputAbsent':True,'removedNative20GoalIds':taken,'remainingGoalIdsExactOriginalOrder':remaining,'allOtherWholeConfigFieldsExact':True,'successorActiveReference':successor,'emptyRestActiveReferenceRetired':not remaining,'archivedOriginalPin':pin(arch)})
 removed.extend(taken)
config_path=str(R/'native20.batch.config.json')
new_config={'$schema':'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-rollout-batch-config.schema.json','schemaVersion':1,'batchId':'chemie-current439-jurisdiction-only-native20-technical-c-20261017-v1','subject':'chemie','subjectLabel':'Chemie','bookId':'chemie-current439-jurisdiction-only-native20-technical-c-20261017-v1','title':'Chemie – aktuelle Lernzielseiten und Kontexte (20 Ziele)','baseGoalBookConfigPath':s['baseConfigPath'],'goalIds':ids,'outputDirectory':str(R/'native20'),'feedbackBaseUrl':'https://skillpilot.com/lernziel-feedback','promptPath':'curricula/DE/Gymnasium/quality/goal-evidence/prompts/goal-description-understanding-evidence-review-v2.md','criteriaPath':'curricula/DE/Gymnasium/quality/goal-evidence/prompts/chemistry-goal-description-understanding-evidence-review-criteria-v1.md','printDerivativeProfile':'bounded-atlas'}
write(C/config_path,new_config);ledger['activeBatchConfigPaths'].append(config_path);write(C/L,ledger)
for path in ledger['activeBatchConfigPaths']:
 cfg=read(C/path)
 for gid in cfg['goalIds']:
  assert gid not in globalClaims,f'Global duplicate current claim: {gid} / {path} / {globalClaims.get(gid)}';globalClaims[gid]=path
assert selected.issubset(globalClaims) and all(globalClaims[gid]==config_path for gid in ids)
assert len(removed)==len(set(removed))
for p in originals:assert pin(F/p['originalPath'])==p['originalPin']
assert (F/L).read_bytes()==original_bytes
manifest={'schemaVersion':1,'role':'Root-authorized administrative claim handoff only in own private capsule','atUTC':datetime.now(timezone.utc).isoformat(),'capsule':str(C),'reviewRoot':str(R),'newBatchConfigPath':config_path,'newOutputDirectory':str(C/new_config['outputDirectory']),'beforeLedgerPin':pin(F/L),'afterLedgerPin':pin(C/L),'beforeLedgerWholeObject':original,'afterLedgerWholeObject':ledger,'source15OriginalConfigs':originals,'changedOldClaimScopes':changes,'newNative20GoalIds':ids,'removedFromOldClaimCount':len(removed),'previouslyUnclaimedSelectedGoalIds':[gid for gid in ids if gid not in removed],'remainingOldClaimCount':171-len(removed),'currentTotalClaims':len(globalClaims),'currentActiveConfigCount':len(ledger['activeBatchConfigPaths']),'globalDuplicateCurrentClaimCount':0,'sourceReadonlyLinks':links,'QAByteExactPin':pin(C/Q),'immutableSourcePins':[s['canonicalPin'],s['P439Pin'],s['SEMPin'],s['currentModel'],s['baseConfigPin'],*s['actualAssetPins']],'sourceFilesWritten':False,'original15AndLedgerArchivedExactly':True,'allUnrelatedConfigFieldsAndRemainingIDOrderExact':True,'parallel6GoalIds':s['excludedNative6'],'parallel6CapsuleNotWritten':True,'futureLedgerUnion':'Build a guarded union from the common original15/171 ledger: remove my20 and peer6 IDs from each original old claim object once, preserve remaining order/all other fields, retain all original history, register nonempty union-rest successors and both new config references. Do not overwrite either private ledger or one rest successor with the other. Stock loader and global subject-independent duplicate check must pass the union.','stockLoaderPending':True,'prepareExecutions':0,'newScienceVotes':0,'appliedToMainOrF':False}
write(O/'HANDOFF.private-administrative-ledger-20-and-future-union.json',manifest)
print(json.dumps({'newConfig':config_path,'newCapsule':str(C),'affectedOldScopes':len(changes),'removedOldClaims':len(removed),'oldRemaining':171-len(removed),'currentTotalClaims':len(globalClaims),'currentActiveConfigs':len(ledger['activeBatchConfigPaths']),'changes':[{'old':x['oldActiveReference'],'removed':x['removedNative20GoalIds'],'rest':len(x['remainingGoalIdsExactOriginalOrder'])} for x in changes]},indent=2))
