import copy, datetime, hashlib, json
from pathlib import Path

O=Path(__file__).resolve().parent;B=O.parent;N=O/'capsule'
F=B/'current650-all-seven-current439-native-central-preparation-technical-a-v1/capsule'
S=B/'current439-jurisdiction-only-native20-preparation-technical-c-v1/UNAPPLIED.future26-ledger-union.exact-whole-CAS-inputs.json'
L=Path('curricula/DE/Gymnasium/quality/goal-description-review/in-flight-work-ledger.json')
Q=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/chemie-current439-AV-native-registry-root-v1')
def pin(p):
 p=Path(p);b=p.read_bytes();return {'path':str(p),'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def own_dir(p):
 if p==N:return
 own_dir(p.parent)
 if p.is_symlink():
  old=p.resolve(strict=True);p.unlink();p.mkdir()
  for child in old.iterdir():(p/child.name).symlink_to(child,target_is_directory=child.is_dir())
 elif not p.exists():p.mkdir()
 assert p.is_dir() and not p.is_symlink()
def put(rel,data):
 p=N/rel;own_dir(p.parent)
 if p.is_symlink():p.unlink()
 else:assert not p.exists(),p
 p.write_bytes(data);return pin(p)
def dump(data):return (json.dumps(data,ensure_ascii=False,indent=2)+'\n').encode()
assert not (O/'RECEIPT.actual-native26-disjoint-ledger-union.json').exists()
d=json.loads(S.read_text());assert pin(S)['sha256']=='ce3cb1bdde14d5565a5f7b61d63bec05c971ec9b8bdeacb9c51b7085916ec132'
before=(N/L).read_bytes();assert before==(F/L).read_bytes()
assert pin(N/L)['sha256']==d['beforeLedgerPin']['sha256'].removeprefix('sha256:')
assert json.loads(before)==d['beforeWholeLedgerObject']
source_pins=[pin(F/L),pin(S)];created=[];config_sources=[]
for x in d['plannedRestConfigWholeObjects']:
 original=(F/x['oldOriginalPath']).read_bytes();bp=json.loads(original)
 assert hashlib.sha256(original).hexdigest()==x['compareBeforePin']['sha256'].removeprefix('sha256:')
 removed=set(x['removedGoalIdsInOriginalOrder']);expected=[g for g in bp['goalIds'] if g not in removed]
 assert expected==x['remainingGoalIdsExactOriginalOrder']
 ap=x['afterWholeConfigObject'];assert ap=={**bp,'goalIds':expected}
 assert not x['emptyRestReferenceRetired'] and expected
 created.append(put(Path(x['plannedReference']),dump(ap)));source_pins.append(pin(F/x['oldOriginalPath']))
for role in ['new6Config','new20Config']:
 x=d[role];p=Path(x['sourcePin']['path'])
 assert pin(p)['sha256']==x['sourcePin']['sha256'].removeprefix('sha256:')
 created.append(put(Path(x['relativePath']),p.read_bytes()));config_sources.append(pin(p))
 config=json.loads(p.read_text());out_rel=Path(config['outputDirectory'])
 # The actual frozen native inputs remain read-only at their owning preparation root.
 # This explicit alias keeps their materialized state visible in the common active ledger.
 source_root=p
 for unused in Path(x['relativePath']).parts:source_root=source_root.parent
 source_out=source_root/out_rel
 assert (source_out/'batch-manifest.json').is_file()
 out=N/out_rel;own_dir(out.parent);assert not out.exists() and not out.is_symlink()
 out.symlink_to(source_out,target_is_directory=True)
 created.append({'readOnlyFrozenNativeAlias':str(out),'source':str(source_out),'batchManifest':pin(source_out/'batch-manifest.json')})
after=d['afterWholeLedgerObject'];assert len(after['activeBatchConfigPaths'])==17
assert {k:v for k,v in after.items() if k!='activeBatchConfigPaths'}=={k:v for k,v in json.loads(before).items() if k!='activeBatchConfigPaths'}
owners={};total=0
for ref in after['activeBatchConfigPaths']:
 cfg=json.loads((N/ref).read_text())
 for gid in cfg['goalIds']:owners.setdefault(gid,[]).append(ref);total+=1
assert total==185 and len(owners)==185 and all(len(x)==1 for x in owners.values())
created.append(put(Q/'admin-history/in-flight.original15.exact.json',before))
created.append(put(Q/'admin-history/future26-union.original-unapplied-CAS.exact.json',S.read_bytes()))
ledger_pin=put(L,dump(after))
for x in source_pins+config_sources:assert pin(x['path'])==x
receipt={'role':'Actual guarded private native26 ledger union, no description readiness claim',
 'createdAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'capsule':str(N),
 'sourceCAS':pin(S),'sourcePinsUnchanged':source_pins+config_sources,'oldLedgerExact':pin(F/L),
 'newLedger':ledger_pin,'originalActiveRefs':15,'newActiveRefs':17,'originalClaims':171,'newClaims':185,
 'all185OwnersGloballyUnique':True,'bothNewNativeBatchesActuallyMaterializedAtFrozenReadOnlyAliases':True,
 'createdOutputs':created,'dIndicesSupersessionsWithdrawalsUnchanged':[105,214,7],
 'oldClaimsOrReviewsDeleted':False,'oldFOrMainWritten':False,'newScienceVotes':0,
 'stockLedgerLoaderPending':True,'M7Claim':False,'humanApprovalClaim':False}
p=O/'RECEIPT.actual-native26-disjoint-ledger-union.json';p.write_bytes(dump(receipt))
print(json.dumps({'receipt':pin(p),'ledger':ledger_pin,'claims':185,'refs':17,'globalDuplicates':0}))
