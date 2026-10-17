from pathlib import Path
import os,json,hashlib,re,copy,datetime

R=Path('/home/enpasos/projects/skillpilot');B=Path('/mnt/e/skillpilot-chemie-L7-20261017')
F=B/'current650-all-seven-current439-native-central-preparation-technical-a-v1';FC=F/'capsule'
O=Path(__file__).parent;C=O/'capsule'
Q=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/chemie-current439-native6-actual-context-remediation-technical-v1')
ledgerRel=Path('curricula/DE/Gymnasium/quality/goal-description-review/in-flight-work-ledger.json')
ids=['9b56d01e-c2d7-51d8-b78e-237592c1ed20','6966df95-f125-5ecc-af8e-0442545d9f17','f0f67a7a-b06a-50b9-8edc-1f2a0d97520d','17ab1148-7383-5cab-8b91-73aff795f1e4','93b914d4-747d-5b22-90ff-ac6320514b44','e22a34d4-ac1e-5afe-8f77-0dfa4fd9f44f']
H=lambda b:hashlib.sha256(b).hexdigest()
stable=lambda x:json.dumps(x,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()
def pin(p):
 p=Path(p);b=p.read_bytes();return {'path':str(p),'sha256':H(b),'bytes':len(b)}
def own_dir(p):
 p=Path(p)
 if p==C:assert p.is_dir() and not p.is_symlink();return
 own_dir(p.parent)
 if p.is_symlink():
  src=p.resolve(strict=True);children=list(src.iterdir());p.unlink();p.mkdir()
  for q in children:(p/q.name).symlink_to(q,target_is_directory=q.is_dir())
 elif not p.exists():p.mkdir()
 assert p.is_dir() and not p.is_symlink()
def own_bytes(rel,b):
 p=C/rel;own_dir(p.parent)
 if p.exists() or p.is_symlink():
  assert not p.is_dir();p.unlink()
 p.write_bytes(b);return pin(p)
def write(p,x):
 p=Path(p);p.parent.mkdir(parents=True,exist_ok=True)
 with p.open('x') as f:json.dump(x,f,ensure_ascii=False,indent=2);f.write('\n')
 return pin(p)

assert (O/'CLONE.completed.json').is_file(),'Wait on existing clone handle; never duplicate/restart it.'
assert H((F/'SEAL.prepared-current439-model-and-central-config.json').read_bytes())=='70d5a4157c323713fed84e2ff32789cf8acaa0c5edf03380554b04ef7c6cad0e'
audit=B/'current439-native6-inflight-schema-readonly-audit-v1/AUDIT.current439-native6-inflight-schema-readonly.json'
assert pin(audit)['sha256']=='e5196b8e499c219e1f6986c3b42d403f98a02f86ccc503bebad1f9a638d84a7e'
oldBytes=(FC/ledgerRel).read_bytes();assert oldBytes==(R/ledgerRel).read_bytes()==(C/ledgerRel).read_bytes()
assert H(oldBytes)=='5009d76ffc70449b9df727161c5499277115b72830b59793f489c25add17f72a'
old=json.loads(oldBytes);assert len(old['activeBatchConfigPaths'])==15
history=C/Q/'admin-history';own_dir(history)
(history/'in-flight-ledger.original15.exact.json').write_bytes(oldBytes)
originals=[];bygoal={};wholeSources=[]
for number,rel in enumerate(old['activeBatchConfigPaths'],1):
 data=(FC/rel).read_bytes();assert data==(R/rel).read_bytes()==(C/rel).read_bytes()
 x=json.loads(data);dest=history/f'claim-{number:02d}.original.exact.config.json';dest.write_bytes(data)
 originals.append({'relativePath':rel,'sourceF':pin(FC/rel),'sourceR':pin(R/rel),'historicalExactCopy':pin(dest),'wholeConfig':x})
 for gid in x['goalIds']:bygoal.setdefault(gid,[]).append(rel)
assert sum(len(x['wholeConfig']['goalIds']) for x in originals)==171
assert all(not bygoal.get(gid) for gid in [ids[0],ids[1],ids[3]])
assert all(len(bygoal.get(gid,[]))==1 for gid in [ids[2],ids[4],ids[5]])
after=copy.deepcopy(old);claimChanges=[]
for gid,stem in [(ids[2],'aromatics-dyes-without-f0f67'),(ids[4],'q3-without-93b9'),(ids[5],'acids-analytics-without-e22a')]:
 rel=bygoal[gid][0];data=(FC/rel).read_bytes();text=data.decode();before=json.loads(data)
 assert before['goalIds'].count(gid)==1
 # Remove exactly the UUID line from the original goalIds array, retaining all other bytes.
 key=re.search(r'"goalIds"\s*:\s*',text);assert key
 arr,used=json.JSONDecoder().raw_decode(text[key.end():]);assert arr==before['goalIds']
 start=key.end();end=start+used;oldArray=text[start:end]
 lines=oldArray.splitlines(keepends=True);hit=[i for i,line in enumerate(lines) if '"'+gid+'"' in line];assert len(hit)==1
 del lines[hit[0]]
 newArray=''.join(lines)
 # The selected UUIDs are not last in these actual source arrays. Verify rather than normalize elsewhere.
 try:newGoals=json.loads(newArray)
 except json.JSONDecodeError:
  newArray=re.sub(r',\s*\]$',lambda m:m.group(0).replace(',', '', 1),newArray);newGoals=json.loads(newArray)
 successorBytes=(text[:start]+newArray+text[end:]).encode()
 successor=json.loads(successorBytes)
 expected=[v for v in before['goalIds'] if v!=gid]
 assert newGoals==expected and successor=={**before,'goalIds':expected}
 assert text[:start]==successorBytes.decode()[:start]
 assert successorBytes.decode()[start+len(newArray):]==text[end:]
 newRel=Q/'admin-restscope-successors'/f'{stem}.restscope.successor.config.json'
 pp=own_bytes(newRel,successorBytes)
 idx=after['activeBatchConfigPaths'].index(rel);after['activeBatchConfigPaths'][idx]=str(newRel)
 oldOut=FC/before['outputDirectory'];assert not oldOut.exists(),oldOut
 claimChanges.append({'removedGoalId':gid,'originalRelativePath':rel,'successorRelativePath':str(newRel),'originalWholeConfig':before,'successorWholeConfig':successor,'originalBytes':pin(FC/rel),'successorBytes':pp,'onlyObjectFieldChanged':'goalIds','onlyExactUUIDLineRemovedInsideGoalIdsArray':True,'allBytesOutsideGoalIdsArrayExact':True,'remainingGoalIdsExactAndOrdered':True,'configuredOldClaimOutputMissing':str(oldOut),'administrativeHandoffOnlyNoOldPackageScientificClosure':True})

fh=json.loads((F/'HANDOFF.actual-current439-model-and-prepared-full-capsule.json').read_text())
baseRel=str(Path(fh['baseConfig']['path']).relative_to(FC))
assert (C/baseRel).read_bytes()==Path(fh['baseConfig']['path']).read_bytes()
model=json.loads(Path(fh['model']['path']).read_text());assert [p['goalId'] for p in model['pages'] if p['goalId'] in ids]==ids
newConfigRel=Q/'native6.stock.config.json'
config={'$schema':'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-rollout-batch-config.schema.json','schemaVersion':1,'batchId':'chemie-current439-native6-actual-context-remediation-20261017-v1','subject':'chemie','subjectLabel':'Chemie','bookId':'chemie-current439-native6-actual-context-remediation-20261017-v1','title':'Chemie – sechs aktuelle Lernzielkontexte','baseGoalBookConfigPath':baseRel,'goalIds':ids,'outputDirectory':str(Q/'native-six'),'feedbackBaseUrl':'https://skillpilot.com/lernziel-feedback','promptPath':'curricula/DE/Gymnasium/quality/goal-evidence/prompts/goal-description-understanding-evidence-review-v2.md','criteriaPath':'curricula/DE/Gymnasium/quality/goal-evidence/prompts/chemistry-goal-description-understanding-evidence-review-criteria-v1.md','printDerivativeProfile':'bounded-atlas','publicRoot':'app/public'}
own_dir((C/newConfigRel).parent);newConfigPin=write(C/newConfigRel,config)
after['activeBatchConfigPaths'].append(str(newConfigRel));assert len(after['activeBatchConfigPaths'])==16
newBytes=(json.dumps(after,ensure_ascii=False,indent=2)+'\n').encode()
ledgerPin=own_bytes(ledgerRel,newBytes)
afterCopy=own_bytes(Q/'admin-active-ledger.after16.exact.json',newBytes)
owners={}
for rel in after['activeBatchConfigPaths']:
 x=json.loads((C/rel).read_text())
 for gid in x['goalIds']:owners.setdefault(gid,[]).append(rel)
assert all(owners[gid]==[str(newConfigRel)] for gid in ids)
assert sum(len(json.loads((C/rel).read_text())['goalIds']) for rel in after['activeBatchConfigPaths'])==174
unchanged=[rel for rel in old['activeBatchConfigPaths'] if rel not in {x['originalRelativePath'] for x in claimChanges}]
assert len(unchanged)==12 and all((C/rel).read_bytes()==(FC/rel).read_bytes() for rel in unchanged)
assert {k:v for k,v in old.items() if k!='activeBatchConfigPaths'}=={k:v for k,v in after.items() if k!='activeBatchConfigPaths'}

qa=B/'9b-current-angle-image-targeted-root-review-v1/chemie.qa.stock-order-current-angle-image-revalidation.candidate.json'
assert pin(qa)['sha256']=='bc2e35e0db01b675e1e1ab13f29e1819f40a715a17a5a96763dffd5848fb780f'
qaRel=Path('curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json')
qaBefore=pin(FC/qaRel);qaAfter=own_bytes(qaRel,qa.read_bytes())
# Make the four independently prepared A files available without changing the active A75 selection.
aprepPath=B/'9b-current-angle-atomicity-independent-c-v1/PREPARATION.post-FIRST.fresh-A1-and-exact-rest24.json'
aprep=json.loads(aprepPath.read_text());aFiles=[]
for row in aprep['configs']:
 pp=row['pin'];src=Path(pp['path']);assert pin(src)['sha256']==pp['sha256'].removeprefix('sha256:')
 aFiles.append(own_bytes(row['relativePath'],src.read_bytes()))
for pp in aprep['recordPins']:
 src=Path(pp['path']);assert pin(src)['sha256']==pp['sha256'].removeprefix('sha256:')
 rel=src.relative_to(Path(aprep['physicalCheckCapsule']));aFiles.append(own_bytes(rel,src.read_bytes()))
centralRel=Path(fh['preparedCentralConfig']['path']).relative_to(FC)
assert (C/centralRel).read_bytes()==(FC/centralRel).read_bytes()
assert len(json.loads((C/centralRel).read_text())['subjects'][0]['semanticAtomicityConfigPaths'])==75
guards=[]
for key in ['latestCanonical','latestP439','latestSEM650']:
 pp=fh[key];rel=Path(pp['path']).relative_to(FC);assert (C/rel).read_bytes()==Path(pp['path']).read_bytes();guards.append({'kind':key,'source':pp,'newCapsule':pin(C/rel)})
viewRoot=Path('curricula/DE/Gymnasium/composition-views/chemie')
for pp in sorted((FC/viewRoot).glob('*.json')):
 rel=pp.relative_to(FC);assert (C/rel).read_bytes()==pp.read_bytes();guards.append({'kind':'unchangedView','source':pin(pp),'newCapsule':pin(C/rel)})
for key in ['promptPath','criteriaPath']:
 rel=config[key];assert (C/rel).read_bytes()==(FC/rel).read_bytes()==(R/rel).read_bytes();guards.append({'kind':'unchanged-'+key,'source':pin(FC/rel),'newCapsule':pin(C/rel)})
cas={'role':'Explicit Root-authorized private administrative handoff; no old package closure, Science/native vote or integration','createdAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'originalLedgerWholeBefore':old,'newLedgerWholeAfter':after,'originalLedgerPin':pin(FC/ledgerRel),'historicalOriginalLedgerCopy':pin(history/'in-flight-ledger.original15.exact.json'),'newActiveLedgerPin':ledgerPin,'afterExactCopy':afterCopy,'wholeThreeClaimChanges':claimChanges,'all15OriginalClaimBytesPreserved':originals,'twelveOtherActiveReferencesAndWholeBytesUnchanged':unchanged,'newNative6Config':newConfigPin,'newNative6WholeConfig':config,'claimPathCountsBeforeAfter':[15,16],'claimGoalCountsBeforeAfter':[171,174],'globalActiveOwnersForAllSix':{gid:owners[gid] for gid in ids},'newQAOnlyPermittedInputSuccessor':{'before':qaBefore,'after':qaAfter,'source':pin(qa)},'fourAArtifactsAvailableWithoutActiveA75Change':aFiles,'originalFRegistryAndOld25Preserved':True,'unchangedCoreInputsAnd39ViewsAndPrompts':guards,'inflightWriterOutputAudit':pin(audit),'noClaimMaterializationOrHistoricalNativeRevalidationHere':True,'oldFAndRAndL6Writes':False,'scientificVotesAdded':0,'nativePrepareRunYet':False,'M7':False,'HumanApproval':False}
write(O/'CAS.explicit-three-claim-admin-handoff-and-new6.whole-before-after.json',cas)
argv=['node','--preserve-symlinks','--preserve-symlinks-main','--import','/home/enpasos/projects/skillpilot/app/node_modules/tsx/dist/loader.mjs','app/scripts/materializeGoalDescriptionRolloutBatch.ts','prepare','--config',str(newConfigRel)]
command={'role':'One intended stock native6 prepare after explicit administrative handoff and stock ledger/API check','argv':argv,'cwd':str(C),'config':newConfigPin,'baseConfig':pin(C/baseRel),'activeLedger':ledgerPin,'oldLedgerHistoricalPin':pin(FC/ledgerRel),'stockEntry':pin(C/'app/scripts/materializeGoalDescriptionRolloutBatch.ts'),'batchConfigSchema':pin(C/'contracts/goal-description-review/v1/goal-description-rollout-batch-config.schema.json'),'unchangedPrompt':pin(C/config['promptPath']),'unchangedCriteria':pin(C/config['criteriaPath']),'exactSixOrder':ids,'fullBaseGoalCount':439,'onlySixGoalPagesRenderedWithStockFrontMatter':True,'QA':qaAfter,'noPDF439CompilerCentralOrVote':True,'prepareNotYetRun':True}
cp=write(O/'COMMAND.intended-exactly-one-native6-prepare.after-admin-ledger-check.json',command)
print('ADMINCAS',json.dumps(pin(O/'CAS.explicit-three-claim-admin-handoff-and-new6.whole-before-after.json')))
print('COMMAND',json.dumps(cp));print('CONFIG',json.dumps(newConfigPin));print('LEDGER',json.dumps(ledgerPin));print('QA',json.dumps(qaAfter));print('global6owners unique;15->16,171->174; actual prepare0')
