import copy,datetime,hashlib,json,pathlib
O=pathlib.Path(__file__).resolve().parent
N=O/'capsule'
Q=pathlib.Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/chemie-current439-AV-native-registry-root-v1')
base=N/Q/'central.current439.A76.V-current.D105-original.private.config.json'
def pin(p):
 b=p.read_bytes();return {'path':str(p),'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)}
guards={str(base):pin(base)}
cfg=json.loads(base.read_text());s=cfg['subjects'][0];assert s['subject']=='chemie'
out=copy.deepcopy(cfg);t=out['subjects'][0]
planpath=O/'PLAN.conditional-D107-paired26-and66-edges-no-activation.json';guards[str(planpath)]=pin(planpath)
oldplan=json.loads(planpath.read_text())
edgekey=lambda e:(e['goalId'],e['supersededIndexPath'],e['replacementIndexPath'])
edgeset={edgekey(e) for e in t['resolutionSupersessions']}
addedold=[]
for e in oldplan['original35MissingAdministrativeEdges']:
 if edgekey(e) not in edgeset:t['resolutionSupersessions'].append(e);edgeset.add(edgekey(e));addedold.append(e)
prefix='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/'
specs=[('native20',prefix+'chemie-current439-jurisdiction-only-native20-preparation-technical-c-v1/native20/resolution-index.json',20),('native6',prefix+'chemie-current439-native6-actual-context-remediation-technical-v1/native-six/resolution-index.json',6),('native14',prefix+'chemie-current439-jurisdiction-only-native14-preparation-technical-c-v1/native14/resolution-index.json',14),('P13',prefix+'chemie-current439-P13-native-preparation-technical-root-v1/native13/resolution-index.json',13),('requires20-partial',prefix+'chemie-current439-requires-only-native20-preparation-technical-c-v1/native20/resolution-index.json',18),('mixed18-partial',prefix+'chemie-current439-remaining-mixed18-preparation-technical-c-v1/native18/resolution-index.json',16)]
claims={}
for path in s['resolutionIndexPaths']:
 p=N/path;guards[str(p)]=pin(p)
 for r in json.loads(p.read_text())['resolutions']:claims.setdefault(r['goalId'],[]).append(path)
newedges=[];newgoals=set();owners=[]
for key,path,count in specs:
 p=N/path;guards[str(p)]=pin(p);index=json.loads(p.read_text());assert len(index['resolutions'])==count
 assert path not in t['resolutionIndexPaths'];t['resolutionIndexPaths'].append(path)
 for r in index['resolutions']:
  goal=r['goalId'];assert goal not in newgoals;newgoals.add(goal)
  old=set(claims.get(goal,[]));superseded={e['supersededIndexPath'] for e in t['resolutionSupersessions'] if e['goalId']==goal};leaves=sorted(old-superseded)
  assert len(leaves)<=1,(goal,leaves)
  for leaf in leaves:
   e={'goalId':goal,'supersededIndexPath':leaf,'replacementIndexPath':path};assert edgekey(e) not in edgeset;t['resolutionSupersessions'].append(e);edgeset.add(edgekey(e));newedges.append(e)
  owners.append({'goalId':goal,'historicalTerminal':leaves[0] if leaves else None,'currentPairedIndex':path,'package':key})
assert len(newgoals)==87 and len(t['resolutionIndexPaths'])==111
conditional=[]
for w in s['resolutionWithdrawals']:
 if w['goalId'] in newgoals:
  p=N/w['indexPath'];j=json.loads(p.read_text());r=next(r for r in j['resolutions'] if r['goalId']==w['goalId']);assert r['resolutionDigest']==w['historicalResolutionDigest'];conditional.append(w)
t['resolutionWithdrawals']=[w for w in s['resolutionWithdrawals'] if w not in conditional]
assert len(conditional)==5 and len(t['resolutionWithdrawals'])==2
for k in s:
 if k not in {'resolutionIndexPaths','resolutionSupersessions','resolutionWithdrawals'}:assert s[k]==t[k]
out['reportId']=cfg['reportId']+'-prospective-actual-paired-D87-not-activated'
target=N/Q/'central.current439.A76.V-current.D111.actual87.PROSPECTIVE-whole-chain-check-required.private.config.json'
assert not target.exists();target.write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n')
for p,g in guards.items():assert pin(pathlib.Path(p))==g,p
receipt={'role':'Prospective additive D111 registry based only on actual stock-finalized independent paired87 indices; NO ACTIVATION','createdAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'sourceConfig':guards[str(base)],'prospectiveConfig':pin(target),'prospectiveConfigRelativePath':str(target.relative_to(N)),'packages':[{'key':key,'path':path,'resolved':count} for key,path,count in specs],'exactHistoricalAdministrativeEdgesAdded':addedold,'newCurrentPairedEdgesAdded':newedges,'newCurrentPairedOwners':owners,'conditionalWithdrawalRetirements':conditional,'condition':'Existing stock validator must prove EVERY historical and current whole-index chain intact. Do not activate on this mechanical plan alone. All accepted D4 revisions and P6/V4 review dependencies remain independent; no M7 claim.','counts':{'indices':[len(s['resolutionIndexPaths']),len(t['resolutionIndexPaths'])],'supersessionEdges':[len(s['resolutionSupersessions']),len(t['resolutionSupersessions'])],'conditionalWithdrawals':[len(s['resolutionWithdrawals']),len(t['resolutionWithdrawals'])],'currentPairedDescriptions':87},'allGuardsUnchanged':True,'sourceGuards':list(guards.values()),'activeBaseConfigChanged':False,'humanApproval':False,'strictGlobalNetIncreaseNotMeasured':True,'newScienceVotesGeneratedByThisScript':0}
rp=O/'PLAN.prospective-D111-actual-paired87-exact-owners-not-activated.json';assert not rp.exists();rp.write_text(json.dumps(receipt,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'plan':pin(rp),'candidate':pin(target),'counts':receipt['counts'],'activeBaseChanged':False}))
