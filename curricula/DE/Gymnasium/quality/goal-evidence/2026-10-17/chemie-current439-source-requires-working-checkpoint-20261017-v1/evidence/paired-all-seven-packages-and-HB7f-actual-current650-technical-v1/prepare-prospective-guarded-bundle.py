import pathlib,json,hashlib,shutil,os,datetime
E=pathlib.Path('/mnt/e/skillpilot-chemie-L7-20261017');O=pathlib.Path(__file__).resolve().parent;B=E/'paired-package03-04-05-and-HB7f-actual-current650-technical-v1';S=B/'capsule';F=O/'capsule';U=E/'explicit-overlap75e503-combination-preparation-technical-v1'
r=lambda p:json.loads(pathlib.Path(p).read_text());sha=lambda p:hashlib.sha256(pathlib.Path(p).read_bytes()).hexdigest()
def pin(p):p=pathlib.Path(p);return dict(path=str(p),sha256=sha(p),bytes=p.stat().st_size)
def dig(x):return hashlib.sha256(json.dumps(x,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest()
def dump(p,x):p=pathlib.Path(p);p.parent.mkdir(parents=True,exist_ok=True);assert not p.exists();p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
u=r(U/'CAS.two-whole-overlap-75e503-explicit-combination.unapplied.json');assert sha(U/'SELECTOR.unapplied-explicit-overlap-combination.json')=='35de28f204412cc61a833f031f2868d76fcd00f6f52a22b08de705860937e04c';assert sha(U/'CAS.two-whole-overlap-75e503-explicit-combination.unapplied.json')=='ea31feb887e823930b88b620137dd966c7b0396e77a6797dbc05e5310cf03d9c'
for p in u['inputPins'].values():assert pin(p['path'])==p
bm=r(B/'ASSEMBLY.exact-guards-and-inputs.json');bb=r(B/'BINDING.actual439-P-and-fifteen-SEM-source-FPs.json');assert sha(S/bm['canonicalRelative'])=='4eca52fe0e2fa45f2c4aa0780a38c3f78b1f0da6d6cff7eb379815c170104837';c=r(S/bm['canonicalRelative']);gm={g['id']:g for g in c['goals']};views=r(bb['whole39Views']['path']);vm={v['viewId']:v for v in views};a=r(u['inputPins']['package01and02WholeCAS']['path']);z=r(u['inputPins']['package06and07WholeCAS']['path']);d1=a['ordinaryWholeGoalChanges'];d2=z['wholeObjects'];over={d['goalId']for d in d1}&{d['goalId']for d in d2};assert over=={d['goalId']for d in u['wholeGoalChanges']};assert len(over)==2
allorig=d1+d2
for d in allorig:assert gm[d['goalId']]==d['before'];assert dig(d['before'])==d['beforeDigest'].removeprefix('sha256:')and dig(d['after'])==d['afterDigest'].removeprefix('sha256:')
combined=[]
for d in allorig:
 if d['goalId']not in over:combined.append(dict(goalId=d['goalId'],before=d['before'],after=d['after'],beforeDigest=dig(d['before']),afterDigest=dig(d['after']),operation='exact original disjoint whole CAS'))
for d in u['wholeGoalChanges']:
 assert gm[d['goalId']]==d['currentBaselineWholeGoal']==d['originalBaseWholeGoal'];assert dig(gm[d['goalId']])==d['currentBaselineWholeGoalDigest'];after=d['combinedAfterWholeGoal'];assert dig(after)==d['combinedAfterWholeGoalDigest'];assert pin(d['combinedAfterFile']['path'])==d['combinedAfterFile'];assert r(d['combinedAfterFile']['path'])==after
 for key,ds in [('package01and02',d1),('package06and07',d2)]:
  orig=next(t for t in ds if t['goalId']==d['goalId']);assert orig['before']==d[key]['wholeBefore']and orig['after']==d[key]['wholeAfter'];assert dig(orig['after'])==d[key]['sourceAfterDigest'].removeprefix('sha256:')
 ex=after['extendedData']['skillPilotAcquisitionExtensions'];expected=d['package01and02']['wholeAfter']['extendedData']['skillPilotAcquisitionExtensions']+d['package06and07']['wholeAfter']['extendedData']['skillPilotAcquisitionExtensions'];assert ex==expected
 allowed=['DE-HE']if d['goalId'].startswith('75e')else['DE-HE','DE-NW'];assert after['extendedData']['applicabilityOverrides']['jurisdiction']==allowed
 combined.append(dict(goalId=d['goalId'],before=gm[d['goalId']],after=after,beforeDigest=dig(gm[d['goalId']]),afterDigest=dig(after),operation='explicit lossless whole union, pending final root/author approval',originalWholeUnionSourcePin=pin(U/'CAS.two-whole-overlap-75e503-explicit-combination.unapplied.json')))
assert len(combined)==20 and len({d['goalId']for d in combined})==20;assert not set(bm['changedGoalIds'])&{d['goalId']for d in combined}
for d in combined:
 t=json.loads(json.dumps(d['after']));ed=t['extendedData'];base=d['before']['extendedData'];
 for k in ['applicabilityOverrides','skillPilotAcquisitionExtensions']:
  if k in base:ed[k]=base[k]
  else:ed.pop(k,None)
 assert t==d['before'],d['goalId'];gm[d['goalId']]=d['after']
prospective={**c,'goals':[gm[g['id']]for g in c['goals']]}
for d in a['wholeHEViewChanges']:
 assert vm[d['viewId']]==d['before'];assert dig(d['before'])==d['beforeDigest']and dig(d['after'])==d['afterDigest'];vm[d['viewId']]=d['after']
assert len(a['wholeHEViewChanges'])==4;pv=[vm[v['viewId']]for v in views]
pp={rr['goalId']:rr['profile']for rr in [json.loads(l)for l in pathlib.Path(bb['P439']['path']).read_text().splitlines()if l.strip()]}
cl1=r(u['inputPins']['package01and02Clean']['path']);cl2=r(u['inputPins']['package06and07Clean']['path']);contexts=[]
for d in cl1['wholeTwelveUnchangedCurrentPositiveProfiles']+cl2['wholeTenUnchangedCurrentProfiles']:
 gid=d['goalId'];profile=d.get('wholeProfile',d.get('profile'));assert profile is not None,d.keys();assert pp[gid]==profile,gid;contexts.append(gid)
proofs={E/'arrhenius-and-HE-practice-informed-root-review-v1/REVIEW.informed-root.package01-02.json':'2bd1a9d52f8614720fc04879b15be4e0b41f05252d7cc976aec48f2231c7db70',E/'arrhenius-and-HE-practice-informed-root-review-v1/SEAL.informed-root.package01-02.json':'3ab471f0f9708d0f14140a5ab2d260e1ddb0187c679329f56419ff3584e6d7b2',E/'arrhenius-and-HE-practice-independent-b-v1/FIRST.review.json':'3242573c5756e274c604452141ab4d674b4738874acfd884ae2dbdcf845a10df',E/'arrhenius-and-HE-practice-independent-b-v1/FIRST.seal.sha256.json':'2b7ba40757779b4f7887ad2a8c969a1a6386a6a1a4ef1068ed648dcf31ebe639',E/'nano-aromatics-and-methods-independent-a-v1/FIRST.independent-a.packages06-07.json':'ce5d973947ec75d47eb87d5a9e1a73a938b626135124c276e6c6717bd113d056',E/'nano-aromatics-and-methods-independent-a-v1/SEAL.independent-a.FIRST.json':'8142d13f64e652ad9aa8b72ae4defa326a0a46a75eb559b0b47f4817ec4d7df9',E/'nano-aromatics-and-methods-informed-root-review-v1/REVIEW.informed-root.package06-07.json':'3dee1190a818177affbe6f044bb508e59f891aa2a286880361d4b878b4fd53e8',E/'nano-aromatics-and-methods-informed-root-review-v1/SEAL.informed-root.package06-07.json':'0e6ac3348f501cef482f56fbbf919098ef71e2b90e6169d71c2938cacb614414'}
resolved=[]
for p,h in proofs.items():
 if not p.exists():
  ps=[q for q in p.parent.iterdir()if q.is_file()and sha(q)==h];assert len(ps)==1,(p,h);p=ps[0]
 assert sha(p)==h;resolved.append(pin(p))
resolved+=[pin(U/'SELECTOR.unapplied-explicit-overlap-combination.json'),pin(U/'CAS.two-whole-overlap-75e503-explicit-combination.unapplied.json')]+list(u['inputPins'].values())[:4]
cp=O/'PROSPECTIVE.canonical650.all-seven-and-HB7f.PENDING-final-union-approval.json';vp=O/'PROSPECTIVE.whole39views.all-seven-and-HB7f.PENDING-final-union-approval.json';dump(cp,prospective);dump(vp,pv)
plan=dict(role='Prepared prospective20-goal/four-view guarded bundle; not applied to physical capsule; compiler forbidden until final root union approval',baseO=str(B),baseCapsule=str(S),physicalRoot=str(F),canonicalRelative=bm['canonicalRelative'],baseCanonical=pin(S/bm['canonicalRelative']),baseViews=bb['whole39Views'],currentP439=bb['P439'],currentSEM650=bb['SEM650'],currentNamespaceIndex=bb['namespaceIndex'],currentViewFiles=bm['currentViewFiles'],prospectiveCanonical=pin(cp),prospectiveWhole39Views=pin(vp),wholeGoalChanges=combined,wholeViewChanges=a['wholeHEViewChanges'],inputPins=resolved,overlapGoalIds=sorted(over),sourceGoalChanges=22,uniqueGoalChanges=20,current20PProfilesExact=True,wholePChanges=0,requiresChanges=0,authorConfirmationsAndRootFinalApprovalPending=True,actualCompilerInvocations=0,M7=False,HumanApproval=False)
dump(O/'PLAN.prospective20-and-four-views.pending-final-root-approval.json',plan)
print('20 unique whole guards and22 actual P contexts passed; copying immutable base capsule. No20-goal change applied yet.',flush=True)
shutil.copytree(S,F,symlinks=True,copy_function=os.link);(O/'cache').mkdir()
assert sha(F/bm['canonicalRelative'])==plan['baseCanonical']['sha256'];print(json.dumps(dict(plan=pin(O/'PLAN.prospective20-and-four-views.pending-final-root-approval.json'),prospectiveCanonical=pin(cp),prospectiveViews=pin(vp),basePhysicalCapsuleExact=True,compilerInvocations=0),indent=2),flush=True)
