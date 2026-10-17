import copy,datetime,hashlib,json
from pathlib import Path
O=Path(__file__).resolve().parent;B=O.parent;N=O/'capsule'
Q=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/chemie-current439-AV-native-registry-root-v1')
base=N/Q/'central.current439.A76.V-current.D105-original.private.config.json'
def read(p):return json.loads(Path(p).read_text())
def pin(p):
 p=Path(p);b=p.read_bytes();return {'path':str(p),'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def dump(x):return (json.dumps(x,ensure_ascii=False,indent=2)+'\n').encode()
before=read(base);after=copy.deepcopy(before);s=after['subjects'][0]
assert len(s['resolutionIndexPaths'])==105 and len(s['resolutionSupersessions'])==214 and len(s['resolutionWithdrawals'])==7
c35=B/'selected-D35-supersession-unapplied-CAS-technical-b-v1/CAS.UNAPPLIED.append-exact35-supersession-edges.whole-central-config.json'
assert pin(c35)['sha256']=='cfaca74a62d606c31be9d45383c4356307f7e76ac8760eba42d9dfd18ce9435c'
j=read(c35);assert len(j['appendEdges'])==35
assert j['beforeWholeObject']['subjects'][0]['resolutionIndexPaths']==s['resolutionIndexPaths']
assert j['beforeWholeObject']['subjects'][0]['resolutionSupersessions']==s['resolutionSupersessions']
edges=list(j['appendEdges']);s['resolutionSupersessions']+=edges
guards=[pin(base),pin(c35)];indices={p:read(N/p) for p in s['resolutionIndexPaths']}
guards += [pin(N/p) for p in s['resolutionIndexPaths']]
sup={(x['supersededIndexPath'],x['goalId']) for x in s['resolutionSupersessions']}
wd={(x['indexPath'],x['goalId']) for x in s['resolutionWithdrawals']}
owners={}
for p,index in indices.items():
 for r in index['resolutions']:
  if (p,r['goalId']) not in sup|wd:owners.setdefault(r['goalId'],[]).append(p)
stage=read(O/'RECEIPT.exact-independent-native20-native6-output-staging.json')
target_map={};current_replacements=[]
for st in stage['staged']:
 target=str(Path(st['rootRelativePath'])/'resolution-index.json');idx=read(N/target)
 assert len(idx['resolutions'])==len(st['goalIds']) and all(r['strictDescriptionComplete'] for r in idx['resolutions'])
 assert {r['goalId'] for r in idx['resolutions']}==set(st['goalIds'])
 guards.append(pin(N/target));s['resolutionIndexPaths'].append(target)
 for g in st['goalIds']:
  assert len(owners[g])==1,(g,owners[g]);old=owners[g][0]
  edge={'goalId':g,'supersededIndexPath':old,'replacementIndexPath':target}
  edges.append(edge);s['resolutionSupersessions'].append(edge);target_map[g]=target
  current_replacements.append({'goalId':g,'previousUniqueOwner':old,'newCurrentPairedOwner':target})
p59=B/'059-withdrawn-to-current-D-chain-prospective-diagnostic-technical-b-v1/PLAN.059-prospective-three-index-chain.CONDITIONAL-NOT-APPLIED.json'
assert pin(p59)['sha256']=='9da8fbf244e440679a2d6bf20817d4518f86034b1f2117a508f810c31bfac0ca'
guards.append(pin(p59));a59=read(p59)['prospectiveOnlyAppendEdges'];assert len(a59)==2
s['resolutionSupersessions']+=a59;edges+=a59
retired_active_withdrawals=[]
g59='059acb11-29b3-5645-ac4c-b4214dc41a2d'
conditional_ids={g59,*[g for g in target_map if any(w['goalId']==g for w in s['resolutionWithdrawals'])]}
assert conditional_ids=={g59,'54bc6ca0-b770-5f10-ac54-bcc1d04298f5','87d8cc68-fe82-5273-9e43-c18b566ecb6c','64b03eff-a967-54a1-ace3-89cb7650a65c'}
for w in s['resolutionWithdrawals']:
 if w['goalId'] not in conditional_ids:continue
 retired_active_withdrawals.append(w)
 if w['goalId']!=g59:
  # No prior supersession exists for an active withdrawal. Preserve its exact
  # historical claim by connecting it to the existing later unique owner,
  # then to the genuinely fresh current paired review above.
  g=w['goalId'];assert not any(e['goalId']==g for e in before['subjects'][0]['resolutionSupersessions'])
  old=owners[g][0];assert old!=w['indexPath']
  historical=indices[w['indexPath']]
  row=next(r for r in historical['resolutions'] if r['goalId']==g)
  assert row['resolutionDigest']==w['historicalResolutionDigest']
  edge={'goalId':g,'supersededIndexPath':w['indexPath'],'replacementIndexPath':old}
  s['resolutionSupersessions'].append(edge);edges.append(edge)
s['resolutionWithdrawals']=[w for w in s['resolutionWithdrawals'] if w['goalId'] not in conditional_ids]
assert len(s['resolutionIndexPaths'])==107 and len(s['resolutionSupersessions'])==280 and len(s['resolutionWithdrawals'])==3
assert len(edges)==66
assert s['resolutionSemanticRetirements']==before['subjects'][0]['resolutionSemanticRetirements']
for k,v in before['subjects'][0].items():
 if k not in ['resolutionIndexPaths','resolutionSupersessions','resolutionWithdrawals']:assert s[k]==v,k
after['reportId']='chemie-current439-D107-conditional-exact-paired26-successor-root-v1'
rel=Q/'central.current439.A76.V-current.D107.conditional-chain-validation-only.private.config.json'
p=N/rel;assert not p.exists();p.write_bytes(dump(after))
for g in guards:assert pin(g['path'])==g
plan={'role':'Conditional D107 prospective exact successor; not activated until genuine full chains validate',
 'createdAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'sourceConfig':pin(base),'candidateConfig':pin(p),'candidateConfigRelativePath':str(rel),
 'sourceGuards':guards,'newCurrentPairedReplacements':current_replacements,
 'original35MissingAdministrativeEdges':j['appendEdges'],'allNewEdges':edges,
 'conditionalWithdrawalRetirements':retired_active_withdrawals,
 'originalSevenWithdrawalsPreservedInHistory':before['subjects'][0]['resolutionWithdrawals'],
 'counts':{'indices':[105,107],'supersessionEdges':[214,280],'activeWithdrawalsIfJustified':[7,3]},
 'condition':'Stock validation must prove every exact historical claim and current replacement in each affected chain; preserve holds if unrelated whole-index issues remain.',
 'activeBaseConfigChanged':False,'humanApproval':False,'newScienceVotes':0,'M7Claim':False}
q=O/'PLAN.conditional-D107-paired26-and66-edges-no-activation.json';assert not q.exists();q.write_bytes(dump(plan))
print(json.dumps({'plan':pin(q),'candidateConfig':pin(p),'conditionalRetirements':len(retired_active_withdrawals),'newPairedOwners':len(current_replacements),'baseUnchanged':True}))
