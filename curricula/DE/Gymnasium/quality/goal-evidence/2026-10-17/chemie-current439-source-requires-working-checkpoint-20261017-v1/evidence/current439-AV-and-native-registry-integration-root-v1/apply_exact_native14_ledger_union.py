import datetime, hashlib, json
from pathlib import Path

O=Path(__file__).resolve().parent;B=O.parent;N=O/'capsule'
S=B/'current439-jurisdiction-only-native14-preparation-technical-c-v1/UNAPPLIED.root17-185-to-native14-18-196.exact-whole-CAS-inputs.json'
L=Path('curricula/DE/Gymnasium/quality/goal-description-review/in-flight-work-ledger.json')
Q=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/chemie-current439-AV-native-registry-root-v1')
def pin(p):
 p=Path(p);b=p.read_bytes();return {'path':str(p),'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def dump(x):return (json.dumps(x,ensure_ascii=False,indent=2)+'\n').encode()
def own_dir(p):
 if p==N:return
 own_dir(p.parent)
 if p.is_symlink():
  src=p.resolve(strict=True);p.unlink();p.mkdir()
  for c in src.iterdir():(p/c.name).symlink_to(c,target_is_directory=c.is_dir())
 elif not p.exists():p.mkdir()
 assert p.is_dir() and not p.is_symlink()
def new(rel,b):
 p=N/rel;own_dir(p.parent)
 assert not p.exists() and not p.is_symlink(),p
 p.write_bytes(b);return pin(p)
assert pin(S)['sha256']=='5c8d8785297776ce46f495db5c98b2f02a22aeb72257cb02f301302d4642949e'
j=json.loads(S.read_text());assert j['compareBeforeRoot']==str(N)
before=(N/L).read_bytes();assert pin(N/L)['sha256']==j['compareBeforeLedgerPin']['sha256']
assert json.loads(before)==j['beforeWholeLedgerObject']
guards=[pin(S)];created=[]
for x in j['remainderWholeObjects']:
 p=N/x['beforeActiveReference'];guards.append(pin(p));assert pin(p)['sha256']==x['beforePin']['sha256']
 old=json.loads(p.read_text());ids=[g for g in old['goalIds'] if g not in x['removedNative14GoalIds']]
 assert ids==x['remainingGoalIdsExactOriginalOrder']
 assert x['afterWholeConfigObject']=={**old,'goalIds':ids}
 created.append(new(Path(x['afterActiveReference']),dump(x['afterWholeConfigObject'])))
source=Path(j['new14ConfigPin']['path']);guards.append(pin(source));assert pin(source)['sha256']==j['new14ConfigPin']['sha256']
assert json.loads(source.read_text())==j['new14WholeConfigObject']
created.append(new(Path(j['new14ConfigRelativePath']),source.read_bytes()))
out=N/j['native14AliasTargetRelative'];own_dir(out.parent);assert not out.exists() and not out.is_symlink()
frozen=Path(j['native14ReadOnlyAliasSource']);assert (frozen/'batch-manifest.json').is_file()
out.symlink_to(frozen,target_is_directory=True);guards.append(pin(frozen/'batch-manifest.json'))
after=j['afterWholeLedgerObject'];assert len(after['activeBatchConfigPaths'])==18
owners={}
for ref in after['activeBatchConfigPaths']:
 for g in json.loads((N/ref).read_text())['goalIds']:owners.setdefault(g,[]).append(ref)
assert len(owners)==196 and all(len(v)==1 for v in owners.values())
new(Q/'admin-history/in-flight.original17.exact.json',before)
new(Q/'admin-history/native14-union.original-unapplied-CAS.exact.json',S.read_bytes())
# This is the single authorized private ledger mutation after exact whole-object CAS.
assert not (N/L).is_symlink();(N/L).write_bytes(dump(after))
for p in guards:assert pin(p['path'])==p
for x in j['frozenAliasGuards']:
 p=x['batchManifestPin'];assert pin(p['path'])['sha256']==p['sha256']
receipt={'role':'Actual guarded native14 private ledger union; unchanged review inputs and no science votes',
 'createdAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'sourceCAS':pin(S),'sourceGuards':guards,
 'ledger':pin(N/L),'beforeRefsClaims':[17,185],'afterRefsClaims':[18,196],
 'allClaimsGloballyUnique':True,'exactFrozen6And20BatchManifestsUnchanged':True,
 'created':created,'DIndicesSupersessionsWithdrawalsUnchanged':[105,214,7],
 'humanApproval':False,'newScienceVotes':0,'mainOrFChanges':False}
p=O/'RECEIPT.actual-native14-ledger18-196.json';assert not p.exists();p.write_bytes(dump(receipt))
print(json.dumps({'receipt':pin(p),'ledger':pin(N/L),'refs':18,'claims':196,'duplicates':0}))
