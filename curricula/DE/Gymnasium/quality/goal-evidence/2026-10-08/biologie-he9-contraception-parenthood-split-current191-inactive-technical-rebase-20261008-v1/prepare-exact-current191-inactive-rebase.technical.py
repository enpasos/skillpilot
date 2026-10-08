"""Apache-2.0: inactive exact technical adoption of genuine paired split reviews."""
from pathlib import Path
import copy,datetime,hashlib,json,subprocess

ROOT=Path.cwd(); OWN=Path(__file__).resolve().parent
DATED=OWN.parent
AUTHOR=DATED/'biologie-he9-contraception-parenthood-scope-preserving-split-author-20261008-v1'
A=DATED/'biologie-he9-contraception-parenthood-scope-preserving-split-independent-a-20261008-v1'
B=DATED/'biologie-he9-contraception-parenthood-split-whole-science-independent-b-20261008-v1'
OLD='3ee4b55c-81c3-5826-9d26-1a8c22cbd0b8'
CHILDREN=['9d3f71d7-5273-5e50-b1ba-4e291edbf114','dd923eeb-eef0-5796-b372-a5d4f5be21f7']
def rel(p):return str(Path(p).relative_to(ROOT))
def read(p):return json.loads(Path(p).read_text())
def bind(p):
 p=Path(p);b=p.read_bytes();return {'path':rel(p),'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def write(p,o):
 p=Path(p);p.parent.mkdir(parents=True,exist_ok=True)
 b=o if isinstance(o,bytes) else (o if isinstance(o,str) else json.dumps(o,ensure_ascii=False,indent=2))+'\n'
 with p.open('xb') as f:f.write(b if isinstance(b,bytes) else b.encode())
 return bind(p)
def verify_seal(p,expected):
 assert bind(p)['sha256']==expected,(str(p),'seal digest')
 j=read(p); rows=j.get('frozenFiles',j.get('files'))
 assert rows is not None
 for r in rows:
  q=ROOT/r['path'];actual=bind(q)
  assert actual['sha256']==r['sha256'].removeprefix('sha256:'),(r,actual)
  if 'bytes'in r:assert actual['bytes']==r['bytes']
 return {'seal':bind(p),'verifiedExactFrozenFiles':len(rows),'allActualFileBytesMatch':True}

seals=[verify_seal(A/'completed-science-source-class-A2-M2-native-bindings.independent-a.exact.freeze.json','d06c4fd0662b35cb223cdc2561c6351f06bb2fc18ab2bb2c9c0d82ea38a02512'),verify_seal(B/'two-child-whole-science-source-class-AM.independent-b.first.freeze.json','3c4ad7b90820d0998576b7515b108fd579f41d4ba344876529764a3e70fda744')]
av=read(A/'first-whole-two-child-source-class-AM-split.independent-a.verdict.json')
bv=read(B/'two-child-whole-source-P-class-AM-scientific-first.independent-b.verdict.json')
ar={x['goalId']:x for x in av['records']};br={x['goalId']:x for x in bv['childVerdicts']}
assert set(ar)==set(br)==set(CHILDREN)
for id in CHILDREN:
 assert ar[id]['semanticKindDecision']['semanticKind']==br[id]['semanticKindDecision']['semanticKind']=='curricularAtomic'
 assert ar[id]['atomicityDecision']['status']==br[id]['atomicityDecision']['status']=='atomic'
 assert ar[id]['memoryDecision']['status']==br[id]['memoryDecision']['status']=='no_memory_needed'
 assert ar[id]['requiredNewCards']==br[id]['memoryDecision']['newRequiredCards']==0
assert av['parentDecision']['semanticKind']=='curricularArea'
body=read(AUTHOR/'whole-stable-cluster-and-two-child-goals.author.json')
canon='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json'
kinds='curricula/DE/Gymnasium/quality/goal-book-publication/biologie.semantic-kinds.json'
qa='curricula/DE/Gymnasium/quality/goal-visualization-qa/biologie.qa.json'
manifest='app/scripts/config/goal-books/de-gym-biology-national-atlas.sources.json'
acfg='curricula/DE/Gymnasium/quality/semantic-atomicity/canonical-biology-full.config.json'
mcfg='curricula/DE/Gymnasium/quality/memory-card-review/canonical-biology-full.config.json'
registry='curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'
central=DATED/'biologie-he9-seventeen-reviewed-active-integration-root-v1'
exitj=read(central/'active-after-he17-central.exit.actual.json');assert exitj['exitCode']==0
delta=read(central/'exact-current-strict-plus17-delta.actual.json')
assert delta['currentBiologyStrict']==191 and delta['currentBiologyDenominator']==391
before=read(ROOT/canon);assert bind(ROOT/canon)['sha256']=='a1aa2550071a797e0f03084ea6aa2c77ad8bceb25e980af9bf96fad66f3e60fe'
by={g['id']:g for g in before['goals']};assert len(by)==474
assert by[OLD]==body['originalWholeGoal']
assert all(id not in by for id in CHILDREN)
after=copy.deepcopy(before)
for g in after['goals']:
 if g['id']==OLD:g.update(type='cluster',contains=CHILDREN,weight=2)
assert next(g for g in after['goals']if g['id']==OLD)==body['proposedStableCluster']
after['goals'].extend(copy.deepcopy(body['proposedTwoWholeAtomicChildren']))
for id,g in by.items():
 if id!=OLD:assert next(x for x in after['goals']if x['id']==id)==g
for g in body['proposedTwoWholeAtomicChildren']:assert ar[g['id']]['wholeCurrentProposedGoal']==g

# All live dependencies are byte-snapshotted first; later compiler uses only them.
am=read(ROOT/acfg);mm=read(ROOT/mcfg);man=read(ROOT/manifest)
old_inputs=read(AUTHOR/'author-input-snapshot-manifest.actual.json')
view_paths=sorted(set([x['path']for x in old_inputs['inputs']if x['path'].endswith('.view.json')]+man['sourcePaths']+[man['navigationViewPath']]+[x['viewPath']for x in mm['visibilityScopes']]))
assert len(view_paths)==31
paths=sorted(set([canon,kinds,qa,manifest,acfg,mcfg,am['reviewPath'],mm['reviewPath'],mm['cardReviewPath'],registry,man['durationModelPolicyPath']]+view_paths+[rel(central/x)for x in ['active-after-he17-central.actual.json','active-after-he17-central.exit.actual.json','exact-current-strict-plus17-delta.actual.json']]+['curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json','curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json','curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json']))
snapshots=[];sn={}
for p in paths:
 dst=OWN/'before'/p;write(dst,(ROOT/p).read_bytes());sn[p]=rel(dst);snapshots.append({'original':bind(ROOT/p),'exactSnapshot':bind(dst)})
afterpath=OWN/'candidate/canonical.current476.reviewed-split.inactive.json';write(afterpath,after)
proposals=read(AUTHOR/'scope-preserving-view-reference-proposals.author.json');assert len(proposals['proposals'])==21
prop={p['activePath']:p for p in proposals['proposals']}
def pointer(o,p):
 for k in p.split('/')[1:]:o=o[int(k)]if isinstance(o,list)else o[k.replace('~1','/').replace('~0','~')]
 return o
view_map={};view_guards=[]
for p in view_paths:
 v=read(ROOT/p);a=copy.deepcopy(v)
 if p in prop:
  for change in prop[p]['changes']:
   n=pointer(a,change['jsonPointer']);assert n==change['before'],(p,change['jsonPointer'])
   assert change['after']=={**n,'kind':'canonicalSubtree'}
   n['kind']='canonicalSubtree'
  dst=OWN/'candidate/views'/p;write(dst,a);view_map[p]=rel(dst)
 else:view_map[p]=sn[p]
 view_guards.append({'activePath':p,'beforeSnapshotPath':sn[p],'inactiveCandidatePath':view_map[p],'onlyGuardedKindChanged':p in prop,'changedNodes':prop[p]['changes']if p in prop else[]})
new_manifest=copy.deepcopy(man);new_manifest.update(expectedCurricularAtomicGoalCount=392,sourcePaths=[view_map[p]for p in man['sourcePaths']],navigationViewPath=view_map[man['navigationViewPath']],durationModelPolicyPath=sn[man['durationModelPolicyPath']])
write(OWN/'candidate/atlas.sources.current392.inactive.json',new_manifest)

# Adopt exact already-scientific A/M child rows byte-for-byte; keep all unrelated rows.
for kind,src,cfgname in [('A',A/'A2.genuine-scientific-current-row.independent-a.jsonl',acfg),('M',A/'M2.genuine-scientific-current-row.independent-a.jsonl',mcfg)]:
 c=read(ROOT/cfgname);lines=(ROOT/c['reviewPath']).read_text().splitlines()
 retained=[l for l in lines if json.loads(l)['goalId']!=OLD]
 childlines=src.read_text().splitlines();assert [json.loads(l)['goalId']for l in childlines]==CHILDREN
 rp=OWN/f'candidate/{kind}.current-full-reviewed.inactive.jsonl';write(rp,'\n'.join(retained+childlines))
 nc=copy.deepcopy(c);nc.update(landscapePath=rel(afterpath),reviewPath=rel(rp),reportPath=rel(OWN/f'checks/{kind}.current-full-native.report.md'))
 if kind=='M':
  nc['cardReviewPath']=sn[c['cardReviewPath']]
  for scope in nc['visibilityScopes']:scope['viewPath']=view_map[scope['viewPath']]
 write(OWN/f'candidate/{kind}.current-full.inactive.config.json',nc)
 scoped=read(A/('A2.genuine-inactive-native.config.json'if kind=='A'else'M2.scoped-no-cards.native.config.json'))
 scoped.update(landscapePath=rel(afterpath),reportPath=rel(OWN/f'checks/{kind}2.current-scoped-native.report.md'))
 write(OWN/f'candidate/{kind}2.current-scoped.inactive.config.json',scoped)

write(OWN/'exact-current191-input-snapshots-and-rebase-guards.technical.json',{'artifactKind':'inactive technical rebase after genuine paired whole split science, no new scientific review','recordedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'genuinePairedSealsActuallyVerified':seals,'baseline':{'canonical':bind(ROOT/canon),'strict':191,'currentCurricularAtomic':391,'actualCentralExit':0,'actualCentralReport':bind(central/'active-after-he17-central.actual.json'),'actualDelta':bind(central/'exact-current-strict-plus17-delta.actual.json')},'snapshots':snapshots,'snapshotMap':sn,'viewGuards':view_guards,'exactCurrentOther473WholeGoalsRetained':True,'twoWholeChildBodiesExactlyReviewed':True,'childScientificClassAM':{id:{'semanticKind':'curricularAtomic','atomicity':'atomic','memory':'no_memory_needed','newCards':0}for id in CHILDREN},'stableAggregateScientificKind':'curricularArea','noNewAMReviewOrRehashClaim':True,'classificationTechnicalAdoptionPendingNative':True,'actualCandidateCounts':{'wholeGoals':476,'curricularAtomicAfterReviewedPartition':392},'pending':['current paired native D2/P2/V2 after actual child images','actual HE11 and HE13 native page/context independent reviews','legacy old-ID history and progress semantics','all affected page/source/position bindings and guarded strict retention before any active integration'],'activeWrites':0,'humanApproval':False,'strictGainClaimed':0})
print(json.dumps({'inactiveCurrentCanonical':bind(afterpath),'snapshots':len(snapshots),'guardedChangedViews':len(prop),'wholeCurrentOtherGoalsRetained':473,'actualPairedSeals':seals,'activeWrites':0,'strictGain':0}))
