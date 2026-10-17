import pathlib,json,hashlib,shutil,os,datetime
E=pathlib.Path('/mnt/e/skillpilot-chemie-L7-20261017');O=pathlib.Path(__file__).resolve().parent;B=E/'paired-package03-and04-actual-current650-technical-v1';S=B/'capsule';F=O/'capsule';N=E/'NI-organics-materials-retained-target-scope-author-root-v1';H=E/'HB7f-retained-application-target-after-correct188-prior-removal-author-root-v1'
read=lambda p:json.loads(pathlib.Path(p).read_text());sha=lambda p:hashlib.sha256(pathlib.Path(p).read_bytes()).hexdigest()
def pin(p):p=pathlib.Path(p);return dict(path=str(p),sha256=sha(p),bytes=p.stat().st_size)
def dig(x):return hashlib.sha256(json.dumps(x,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest()
def dump(p,x):p=pathlib.Path(p);p.parent.mkdir(parents=True,exist_ok=True);assert not p.exists();p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
def replace(p,b):p=pathlib.Path(p);assert p.is_relative_to(F);t=p.with_name(p.name+'.new-owned');assert not t.exists();t.write_bytes(b);t.replace(p)
bm=read(B/'ASSEMBLY.exact-guards-and-inputs.json');bb=read(B/'BINDING.actual-two-P-and-thirteen-SEM-source-FPs.json');assert sha(S/bm['canonicalRelative'])=='d9835ea71c19876bc0aa15319a1fce54eb02953d6268563f067cd57f5daeeb62'
proofs={N/'SELECTOR.clean-current-paired-context-v2.json':'e05eb2b3eaa1365ebb7a4b57de8c013c14f5801cc3aee691da3aad5fee94ac3c',N/'REVIEW-INPUT.clean-NI-package05-current-paired-cc5a-context-v2.json':'b4c5289c8e11ad442998c18baf0086947d80fd8eeee7f76fb687dc29ca498839',N/'CAS.whole14-NI-acquisition-goals-and-one-teacher-view.unapplied.json':'723f727077c65a16a7e41fb43b5a9808ffd3ef5fd03f443fd9de936f0d14eb5e',H/'SELECTOR.clean-one-goal-plus-exact-source-views-and-role-check.json':'3f7842c52490145a418275a1b1b64e5425675c11ff7768deca6f63fa160d1c6e',H/'REVIEW-INPUT.clean-whole-HB7f-own-target-source-and-three-goal-context.json':'d7d5182ba1a64d12e50ab03077e98928e73db65f8c3c8c5848ee66f7a34043c2',H/'CAS.one-whole-HB7f-own-scope-no-edges-or-views.unapplied.json':'54ea64ae0d5af11abb1e85826fd1c805fb7b2f711c7ce5e567067fab6d6b0d07',E/'NI-organics-materials-independent-a-v1/FIRST.independent-a.NI-package05.json':'bbcb5f477e9c0520d3f5a5c7737a30987266a89e60bfb503fa379ca05faf051a',E/'NI-organics-materials-independent-a-v1/SEAL.independent-a.FIRST.json':'6d74fda4f174fdce82157c6aa94577af5c777bee90dda1b05af950f0d00a41e0',E/'NI-organics-materials-independent-b-v1/FIRST.review.json':'5c3794c8dbcced908f274dc4cecea1718762a93004b274728bc8204031e6f1cd',E/'NI-organics-materials-independent-b-v1/FIRST.seal.sha256.json':'641f59c455d36b502fee81067b6c3a50c1c92cc1d6207532d391ec4e73cc4a65',E/'HB7f-retained-application-independent-a-v1/FIRST.independent-a.HB7f.json':'25f0a9626d3ac316521cd50afe1c78aa815e30c9b9d087d662393bf944bb28e9',E/'HB7f-retained-application-independent-a-v1/SEAL.independent-a.FIRST.json':'b26558c5a091177b5f75b9954d41052a4e71d913584b7f7905502ed65b2d0e39',E/'HB7f-retained-application-independent-b-v1/FIRST.informed-foreign-b.HB7f.json':'ddded0696599e488a66ccf527e4b8b54d174493a7225f012bec460296d6b6fbe',E/'HB7f-retained-application-independent-b-v1/FIRST.informed-foreign-b.HB7f.seal.json':'b9f7dce96fd3b16a2e9fdc5010d94fe2aa04c2656f93757d6dce4e29631ecb3c'}
# Resolve a seal by its exact supplied digest if it has a descriptive filename.
resolved={}
for p,h in proofs.items():
 if not p.exists():
  match=[q for q in p.parent.iterdir() if q.is_file() and sha(q)==h];assert len(match)==1,(p,h);p=match[0]
 assert sha(p)==h,(p,h);resolved[p]=h
assert read(E/'NI-organics-materials-independent-a-v1/FIRST.independent-a.NI-package05.json')['decision']=='KEEP'
assert read(E/'HB7f-retained-application-independent-a-v1/FIRST.independent-a.HB7f.json')['decision']=='KEEP'
n=read(N/'REVIEW-INPUT.clean-NI-package05-current-paired-cc5a-context-v2.json');h=read(H/'REVIEW-INPUT.clean-whole-HB7f-own-target-source-and-three-goal-context.json');casn=n['wholeGuardedProposal'];cash=h['wholeGuardedProposal'];assert casn==read(N/'CAS.whole14-NI-acquisition-goals-and-one-teacher-view.unapplied.json');assert cash==read(H/'CAS.one-whole-HB7f-own-scope-no-edges-or-views.unapplied.json')
c=read(S/bm['canonicalRelative']);gm={g['id']:g for g in c['goals']};before=read(S/bm['canonicalRelative']);changes=casn['canonicalWholeGoalChanges']+cash['canonicalWholeGoalChanges'];assert len(changes)==15 and len({d['goalId']for d in changes})==15;old13=set(bb['changedGoalIds']);assert not old13&{d['goalId']for d in changes}
for d in changes:
 assert gm[d['goalId']]==d['before'],d['goalId'];assert dig(d['before'])==d['beforeDigest'] and dig(d['after'])==d['afterDigest'];z=json.loads(json.dumps(d['after']));del z['extendedData']['applicabilityOverrides'];del z['extendedData']['skillPilotAcquisitionExtensions'];assert z==d['before'];gm[d['goalId']]=d['after']
c['goals']=[gm[g['id']]for g in c['goals']];assert len(c['goals'])==650
views=read(bb['whole39Views']['path']);vm={v['viewId']:v for v in views};assert len(views)==39
for d in casn['wholeViewChanges']:
 assert vm[d['viewId']]==d['before'];assert dig(d['before'])==d['beforeDigest'] and dig(d['after'])==d['afterDigest'];vm[d['viewId']]=d['after']
assert len(casn['wholeViewChanges'])==1 and not cash['wholeViewChanges'];views=[vm[v['viewId']]for v in views]
rows=[json.loads(l)for l in pathlib.Path(bb['P439']['path']).read_text().splitlines()if l.strip()];pp={r['goalId']:r['profile']for r in rows};assert len(pp)==439
for d in n['wholeCurrentPositiveProfilesContentOnly']+h['wholeCurrentPositiveProfilesContentOnly']:assert pp[d['goalId']]==d['wholeProfile'],d['goalId']
assert not casn['positiveProfileWholeBodyChanges'] and not cash['positiveProfileWholeBodyChanges'];assert not next(g for g in c['goals']if g['id'].startswith('188'))['requires'].__contains__('7f140b34-ed26-59e7-8ad2-ccb6b56bc9d6')
protected=[pin(S/bm['canonicalRelative']),bb['whole39Views'],bb['P439'],bb['SEM650'],bb['namespaceIndex'],pin(B/'SEAL.immutable-partial73-HOLD-two-new-HB-exclusions.json')]+[pin(S/v['relative'])for v in bm['currentViewFiles']]
protected+=bm['sourceGuard'];dump(O/'GUARD.protected-inputs.before.json',dict(protected=protected,reviewProofs=[pin(p)for p in resolved],previousBaseO=str(B)))
print('Exact15 whole-goal guards and1 whole-view guard passed; all76 supplied current P-context copies match actual combined P439. Cloning immutable inherited inputs.',flush=True)
shutil.copytree(S,F,symlinks=True,copy_function=os.link)
replace(F/bm['canonicalRelative'],(json.dumps(c,ensure_ascii=False,indent=2)+'\n').encode())
for d in casn['wholeViewChanges']:
 rel=next(v['relative']for v in bm['currentViewFiles']if v['viewId']==d['viewId']);replace(F/rel,(json.dumps(d['after'],ensure_ascii=False,indent=2)+'\n').encode())
cp=O/'candidate.canonical650.paired03-04-plus-NI05-and-HB7f.private.json';vp=O/'candidate.whole39views.paired03-04-plus-one-NI-LK-teacher.private.json';dump(cp,c);dump(vp,views)
idir=F/'candidate-inputs/PAIRED-NI05-HB7F';idir.mkdir();inputpins=[]
for i,p in enumerate(resolved):
 q=idir/(str(i).zfill(2)+'-'+p.name);shutil.copyfile(p,q);inputpins.append({**pin(p),'copyRelative':str(q.relative_to(F))})
meta=dict(physicalRoot=str(F),outputRoot=str(O),canonicalRelative=bm['canonicalRelative'],baseCanonical=pin(S/bm['canonicalRelative']),baseViews=bb['whole39Views'],newCanonical=pin(cp),wholeViewCollection=pin(vp),currentViewFiles=bm['currentViewFiles'],baseCapsule=str(S),baseO=str(B),currentP439=bb['P439'],currentSEM650=bb['SEM650'],currentNamespaceIndex=bb['namespaceIndex'],outputsRelative='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/chemie-paired03-04-NI05-HB7f-current650-technical-v1',inputs=inputpins,sourceGuard=protected,wholeGoalChanges=changes,wholeViewChanges=casn['wholeViewChanges'],changedGoalIds=[d['goalId']for d in changes],retained03And04GoalIds=bb['changedGoalIds'],earlierActualMeasurement=pin(B/'MEASUREMENT.actual650-compiled-course-jurisdiction-duration-frontend-targets.not-backend-acceptance.json'),earlierAPV=pin(B/'STOCK.actual650-C20-plus-paired-package03-and04-applicability.json'),NIContextCopiesMatchCurrent74=True,HBContextCopiesMatchCurrent2=True,wholePBodyChanges=0,all439WholePRecordsExpectedUnchanged=True,newScientificVotes=0,newFormalRunIds=[],M7=False,HumanApproval=False)
dump(O/'ASSEMBLY.exact-guards-and-inputs.json',meta);(O/'cache').mkdir()
for p in protected:assert sha(p['path'])==p['sha256']
print(json.dumps(dict(canonical=pin(cp),views=pin(vp),wholeGoalChanges=15,newTeacherTargetPairs=1,wholePBodyChanges=0,provenanceInputs=len(inputpins)),indent=2),flush=True)
