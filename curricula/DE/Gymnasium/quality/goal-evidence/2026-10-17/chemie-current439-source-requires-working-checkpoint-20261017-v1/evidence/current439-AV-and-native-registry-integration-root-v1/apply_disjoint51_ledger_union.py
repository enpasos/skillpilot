import copy,datetime,hashlib,json
from pathlib import Path
O=Path(__file__).resolve().parent;B=O.parent;N=O/'capsule'
Q=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/chemie-current439-AV-native-registry-root-v1')
L=Path('curricula/DE/Gymnasium/quality/goal-description-review/in-flight-work-ledger.json')
S=B/'current439-remaining-mixed18-preparation-technical-c-v1/PLAN.future-disjoint51-administrative-union-from-original18-scopes.json'
def read(p):return json.loads(Path(p).read_text())
def pin(p):
 p=Path(p);b=p.read_bytes();return {'path':str(p),'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def dump(j):return (json.dumps(j,ensure_ascii=False,indent=2)+'\n').encode()
def own(p):
 if p==N:return
 own(p.parent)
 if p.is_symlink():
  src=p.resolve(strict=True);p.unlink();p.mkdir()
  for c in src.iterdir():(p/c.name).symlink_to(c,target_is_directory=c.is_dir())
 elif not p.exists():p.mkdir()
 assert p.is_dir() and not p.is_symlink()
def new(rel,b):
 p=N/rel;own(p.parent);assert not p.exists() and not p.is_symlink(),p
 p.write_bytes(b);return pin(p)
assert pin(S)['sha256']=='f44c307fa757448f33f3cc2b7d93852c1b48b15b3c667021f589cae56729edfc'
plan=read(S);before=(N/L).read_bytes();assert hashlib.sha256(before).hexdigest()=='1269d3db20df75623ea8f73f34f5822bb1d81e0250f2893cd1e069ef1b1bc675'
ledger=json.loads(before);assert len(ledger['activeBatchConfigPaths'])==18
selectors=[
 (B/'current439-requires-only-native20-preparation-technical-c-v1/SELECTOR.clean-current-native20-reviewer-inputs.sealed.json','1d7d28b1ca939583b38a2760e871746770fa4d0920b482b1443c326f1bb79e6d',20),
 (B/'current439-P13-native-preparation-technical-root-v1/SELECTOR.clean-current-native13-reviewer-inputs.sealed.json','45ac7189db1533bbda09ca83b03f007a78269903a57db3e80b51cd4e855be3c7',13),
 (B/'current439-remaining-mixed18-preparation-technical-c-v1/SELECTOR.clean-current-native18-reviewer-inputs.sealed.json','b31969c32adc7b450881d87d6f7243bc6150194febfcbc979b79fe5c1f774492',18)]
selected=set();sources=[];guards=[pin(S)]
for p,sha,count in selectors:
 assert pin(p)['sha256']==sha;guards.append(pin(p));s=read(p);assert len(s['goalIds'])==count
 assert not selected.intersection(s['goalIds']);selected.update(s['goalIds']);sources.append((p,s))
assert len(selected)==51
bydelta={x['originalActiveReference']:x for x in plan['combinedOriginalScopeDeltas']}
after=copy.deepcopy(ledger);after['activeBatchConfigPaths']=[];created=[];removed=[]
for n,ref in enumerate(ledger['activeBatchConfigPaths'],1):
 p=N/ref;raw=p.read_bytes();cfg=json.loads(raw);guards.append(pin(p));taken=[g for g in cfg['goalIds'] if g in selected]
 if not taken:after['activeBatchConfigPaths'].append(ref);continue
 x=bydelta[ref];assert pin(p)['sha256']==x['compareBeforePin']['sha256'];assert taken==x['removedAll51IDsExactOriginalOrder']
 rest=[g for g in cfg['goalIds'] if g not in selected];assert rest==x['remainingGoalIdsExactOriginalOrder'];removed+=taken
 created.append(new(Q/'admin-history/original18-before-disjoint51'/f'{n:02d}.exact.config.json',raw))
 if not rest:assert x['combinedRemainderWholeObject'] is None;continue
 successor={**cfg,'goalIds':rest};assert successor==x['combinedRemainderWholeObject']
 rel=Q/'disjoint51-union-rests'/f'old-{n:02d}.all-original-fields-minus-disjoint51.config.json'
 created.append(new(rel,dump(successor)));after['activeBatchConfigPaths'].append(str(rel))
assert len(removed)==len(set(removed))==26
aliases=[]
for sel,s in sources:
 src=Path(s['configPin']['path']);assert pin(src)['sha256']==s['configPin']['sha256'];guards.append(pin(src))
 root=Path(s['capsule']);rel=src.relative_to(root);cfg=read(src);assert cfg['goalIds']==s['goalIds']
 created.append(new(rel,src.read_bytes()));after['activeBatchConfigPaths'].append(str(rel))
 out_rel=Path(cfg['outputDirectory']);source_out=root/out_rel
 guards.append(pin(source_out/'batch-manifest.json'))
 out=N/out_rel;own(out.parent);assert not out.exists() and not out.is_symlink();out.symlink_to(source_out,target_is_directory=True)
 aliases.append({'relativePath':str(out_rel),'frozenReadOnlySource':str(source_out),'manifest':pin(source_out/'batch-manifest.json')})
 created.append(new(Q/'admin-history/disjoint51-original-clean-selectors'/sel.parent.name/sel.name,sel.read_bytes()))
owners={}
for ref in after['activeBatchConfigPaths']:
 for g in read(N/ref)['goalIds']:owners.setdefault(g,[]).append(ref)
assert len(after['activeBatchConfigPaths'])==20 and len(owners)==221 and all(len(v)==1 for v in owners.values())
assert all(g in owners for g in selected)
for p in guards:assert pin(p['path'])==p
created.append(new(Q/'admin-history/in-flight.original18.before-disjoint51.exact.json',before))
created.append(new(Q/'admin-history/disjoint51.original-unapplied-plan.exact.json',S.read_bytes()))
assert not (N/L).is_symlink();(N/L).write_bytes(dump(after))
receipt={'role':'Actual guarded administrative disjoint51 union from original18; no overwritten parallel remainders',
 'createdAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'sourcePlan':pin(S),'sourceGuards':guards,
 'beforeRefsClaims':[18,196],'afterRefsClaims':[20,221],'removedOldClaims':26,'newClaims':51,
 'globallyUniqueCurrentClaims':221,'frozenPrevious40ClaimsUnchanged':True,'allOriginalScientificArtifactsRetained':True,
 'exactNewFrozenNativeAliases':aliases,'newLedger':pin(N/L),'created':created,
 'activeD105BaseUnchanged':True,'sevenBaseWithdrawalsUnchanged':True,'currentDescriptionsNewlyApprovedByThisMutation':0,
 'mainFOrOtherCapsulesWritten':False,'humanApproval':False,'M7Claim':False}
p=O/'RECEIPT.actual-disjoint51-ledger20-221-union.json';assert not p.exists();p.write_bytes(dump(receipt))
print(json.dumps({'receipt':pin(p),'ledger':pin(N/L),'refs':20,'globallyUniqueClaims':221,'aliases':len(aliases),'newScienceVotes':0}))
