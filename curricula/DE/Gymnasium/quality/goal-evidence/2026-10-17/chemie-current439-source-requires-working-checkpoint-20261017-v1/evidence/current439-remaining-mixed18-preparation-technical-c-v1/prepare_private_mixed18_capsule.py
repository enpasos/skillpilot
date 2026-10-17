from pathlib import Path
from hashlib import sha256
from datetime import datetime,timezone
import json
O=Path(__file__).resolve().parent;G=Path('/mnt/e/skillpilot-chemie-L7-20261017/current439-AV-and-native-registry-integration-root-v1/capsule');C=O/'capsule';R=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/chemie-current439-remaining-mixed18-preparation-technical-c-v1');L=Path('curricula/DE/Gymnasium/quality/goal-description-review/in-flight-work-ledger.json')
read=lambda p:json.loads(p.read_text())
def pin(p):
 b=p.read_bytes();return {'path':str(p),'sha256':sha256(b).hexdigest(),'bytes':len(b)}
def write(p,x):
 assert p.is_relative_to(O) and not p.exists();p.parent.mkdir(parents=True,exist_ok=True);text=json.dumps(x,ensure_ascii=False,indent=2)+'\n';json.loads(text);p.write_text(text)
s=read(O/'SELECTION.remaining-mixed18-current-root18-196.json');ids=s['selectedGoalIds'];chosen=set(ids);assert len(chosen)==18
beforeBytes=(G/L).read_bytes();assert sha256(beforeBytes).hexdigest()==s['sourceLedgerPin']['sha256'];before=json.loads(beforeBytes);assert len(before['activeBatchConfigPaths'])==18
for ref in s['frozenConfigRefs']:assert ref in before['activeBatchConfigPaths'] and not chosen&set(read(G/ref)['goalIds'])
trie={}
for p,kind in [(R,'dir'),(L,'file')]:
 node=trie
 for part in p.parts:node=node.setdefault(part,{})
 node['@kind']=kind
links=[]
def clone(src,dst,node):
 if node.get('@kind')=='file':return
 dst.mkdir();names={p.name for p in src.iterdir()} if src.is_dir() else set()
 for name in sorted(names|{k for k in node if k!='@kind'}):
  if name in node:clone(src/name,dst/name,node[name])
  else:(dst/name).symlink_to(src/name,target_is_directory=(src/name).is_dir());links.append({'path':str(dst/name),'target':str(src/name)})
clone(G,C,trie)
history=C/R/'history';(history/'original18-configs').mkdir(parents=True);(history/'in-flight.original18.exact.json').write_bytes(beforeBytes);(C/R/'rest-claims').mkdir()
after=json.loads(beforeBytes);after['activeBatchConfigPaths']=[];originals=[];changes=[];taken=[]
for n,ref in enumerate(before['activeBatchConfigPaths'],1):
 raw=(G/ref).read_bytes();obj=json.loads(raw);arch=history/'original18-configs'/f'{n:02d}.{Path(ref).name}';arch.write_bytes(raw);originals.append({'originalPath':ref,'originalPin':pin(G/ref),'archivedPin':pin(arch),'originalWholeObject':obj})
 removed=[g for g in obj['goalIds'] if g in chosen];remaining=[g for g in obj['goalIds'] if g not in chosen]
 if not removed:after['activeBatchConfigPaths'].append(ref);continue
 assert ref not in s['frozenConfigRefs'];rest=json.loads(raw);rest['goalIds']=remaining;restored=json.loads(json.dumps(rest));restored['goalIds']=obj['goalIds'];assert restored==obj
 successor=str(R/'rest-claims'/f'old-{n:02d}.same-original-fields-minus-mixed18.config.json') if remaining else None
 if successor:write(C/successor,rest);after['activeBatchConfigPaths'].append(successor)
 changes.append({'oldActiveReference':ref,'oldOriginalPin':pin(G/ref),'oldOutputDirectory':obj['outputDirectory'],'oldOutputExists':(G/obj['outputDirectory']).exists(),'removedGoalIds':removed,'remainingGoalIdsExactOriginalOrder':remaining,'successorActiveReference':successor,'allOtherWholeConfigFieldsExact':True,'emptyRestActiveReferenceRetired':not remaining,'afterWholeConfigObject':rest if remaining else None});taken.extend(removed)
newRef=str(R/'mixed18.batch.config.json');new={'$schema':'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-rollout-batch-config.schema.json','schemaVersion':1,'batchId':'chemie-current439-remaining-mixed-native18-technical-c-20261017-v1','subject':'chemie','subjectLabel':'Chemie','bookId':'chemie-current439-remaining-mixed-native18-technical-c-20261017-v1','title':'Chemie – aktuelle Lernzielseiten und konkrete Kontext-/P-/Bildänderungen (18 Ziele)','baseGoalBookConfigPath':s['baseConfigPath'],'goalIds':ids,'outputDirectory':str(R/'native18'),'feedbackBaseUrl':'https://skillpilot.com/lernziel-feedback','promptPath':'curricula/DE/Gymnasium/quality/goal-evidence/prompts/goal-description-understanding-evidence-review-v2.md','criteriaPath':'curricula/DE/Gymnasium/quality/goal-evidence/prompts/chemistry-goal-description-understanding-evidence-review-criteria-v1.md','printDerivativeProfile':'bounded-atlas'}
write(C/newRef,new);after['activeBatchConfigPaths'].append(newRef);write(C/L,after)
claims={}
for ref in after['activeBatchConfigPaths']:
 for gid in read(C/ref)['goalIds']:assert gid not in claims;claims[gid]=ref
assert all(claims[g]==newRef for g in ids)
for ref in s['frozenConfigRefs']:assert ref in after['activeBatchConfigPaths'] and (C/ref).read_bytes()==(G/ref).read_bytes()
assert (G/L).read_bytes()==beforeBytes
for p in originals:assert pin(Path(p['originalPin']['path']))==p['originalPin']
frozen=[]
for ref in s['frozenConfigRefs']:
 cfg=read(G/ref);root=G/cfg['outputDirectory'];frozen.append({'configRef':ref,'configPin':pin(G/ref),'manifestPin':pin(root/'batch-manifest.json'),'sourceOutputDirectory':str(root),'goalIds':cfg['goalIds']})
h={'schemaVersion':1,'role':'Own private mixed18 scope handoff and guarded future root CAS only','atUTC':datetime.now(timezone.utc).isoformat(),'sourceRoot':str(G),'capsule':str(C),'reviewRoot':str(R),'newBatchConfigPath':newRef,'newOutputDirectory':str(C/new['outputDirectory']),'beforeLedgerPin':pin(G/L),'afterLedgerPin':pin(C/L),'beforeLedgerWholeObject':before,'afterLedgerWholeObject':after,'source18OriginalConfigs':originals,'changedOldClaimScopes':changes,'newNative18GoalIds':ids,'removedFromOldClaimCount':len(taken),'previouslyUnclaimedSelectedGoalIds':[g for g in ids if g not in taken],'remainingOldClaimCount':196-len(taken),'currentTotalClaims':len(claims),'currentActiveConfigCount':len(after['activeBatchConfigPaths']),'globalDuplicateCurrentClaimCount':0,'sourceReadonlyLinks':links,'frozen40ConfigAndManifestPins':frozen,'frozen40ClaimsUntouched':True,'immutableSourcePins':[s['canonicalPin'],s['P439Pin'],s['SEMPin'],s['currentModel'],s['baseConfigPin'],s['QARequiredPin'],*s['actualAssetPins']],'allOtherWholeConfigFieldsAndRemainingIDOrderExact':True,'original18AndLedgerArchivedExactly':True,'oldScientificTextsAndVotesUnchanged':True,'rootMutationPerformed':False,'stockPrepareInvocations':0,'newScienceVotes':0}
write(O/'HANDOFF.private-mixed18-and-guarded-root18-CAS.json',h)
print(json.dumps({'sourceRefsClaims':[18,196],'ownRefsClaims':[h['currentActiveConfigCount'],len(claims)],'removedOldClaims':len(taken),'affectedScopes':[{'old':x['oldActiveReference'],'removed':x['removedGoalIds'],'rest':len(x['remainingGoalIdsExactOriginalOrder'])} for x in changes]},indent=2))
