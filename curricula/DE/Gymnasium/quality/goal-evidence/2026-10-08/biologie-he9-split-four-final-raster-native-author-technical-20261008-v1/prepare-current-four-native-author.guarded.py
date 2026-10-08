# SPDX-License-Identifier: Apache-2.0
"""Prepare an inert current-snapshot HE12 split and four-page author handoff.

Supply the exact current canonical SHA, terminal central JSON and strict count.
No active file, historical scientific receipt or approval is written.
"""
from pathlib import Path
import copy, datetime, hashlib, json, os, shutil, struct, subprocess, sys

R=Path.cwd(); D=Path(__file__).resolve().parent; DATE=D.parent
TECH=DATE/'biologie-he9-contraception-parenthood-split-current191-inactive-technical-rebase-20261008-v1'
AUTHOR=DATE/'biologie-he9-contraception-parenthood-scope-preserving-split-author-20261008-v1'
HE19=DATE/'biologie-he9-nineteen-targeted-alternatives-and-materials-author-root-v2'
IMAGES=R/'curricula/DE/Gymnasium/quality/goal-visualization-review/biologie-he9-two-child-image-author-root-20261008-v1'
OLD='3ee4b55c-81c3-5826-9d26-1a8c22cbd0b8'
CHILDREN=['9d3f71d7-5273-5e50-b1ba-4e291edbf114','dd923eeb-eef0-5796-b372-a5d4f5be21f7']
COMPANIONS=['249f4c5d-fd23-57c7-ac62-773d62c33b49','4b7fdc2c-9dbe-5439-8d84-295abc240eec']
IDS=CHILDREN+COMPANIONS
read=lambda p:json.loads(Path(p).read_text())
sha=lambda p:hashlib.sha256(Path(p).read_bytes()).hexdigest()
rel=lambda p:str(Path(p).relative_to(R))
def binding(p):
 p=Path(p);return {'path':rel(p),'sha256':sha(p),'bytes':p.stat().st_size}
def write(p,o):
 p=Path(p);p.parent.mkdir(parents=True,exist_ok=True)
 b=o if isinstance(o,bytes) else (o if isinstance(o,str) else json.dumps(o,ensure_ascii=False,indent=2))+'\n'
 with p.open('xb') as f:f.write(b if isinstance(b,bytes) else b.encode())
 return binding(p)
def seal(p,expected):
 assert sha(p)==expected,(p,'historical seal drift')
 j=read(p);rows=j.get('frozenFiles',j.get('files'));assert rows is not None
 for row in rows:
  q=R/row['path'];assert sha(q)==row['sha256'].removeprefix('sha256:'),(q,'sealed bytes drift')
  if 'bytes'in row:assert q.stat().st_size==row['bytes']
 return {'seal':binding(p),'exactSealedBindingsVerified':len(rows)}
assert len(sys.argv)==4,'Exact current canonical SHA, terminal current central JSON and strict count required'
expected_sha,central_path,strict_count=sys.argv[1:];strict_count=int(strict_count)
canon='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json'
kinds='curricula/DE/Gymnasium/quality/goal-book-publication/biologie.semantic-kinds.json'
qa_path='curricula/DE/Gymnasium/quality/goal-visualization-qa/biologie.qa.json'
manifest='app/scripts/config/goal-books/de-gym-biology-national-atlas.sources.json'
acfg='curricula/DE/Gymnasium/quality/semantic-atomicity/canonical-biology-full.config.json'
mcfg='curricula/DE/Gymnasium/quality/memory-card-review/canonical-biology-full.config.json'
registry='curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'
assert sha(R/canon)==expected_sha,'Wait for the acknowledged current integration baseline'
central=read(R/central_path);assert central['blockingIssueCount']==0
bio=next(s for s in central['subjects']if s['subject']=='biologie')
assert bio['denominator']==391 and bio['strictComplete']==strict_count and OLD not in bio['strictCompleteGoalIds']
assert next(s for s in central['subjects']if s['subject']=='mathematik')['strictComplete']==807
assert next(s for s in central['subjects']if s['subject']=='physik')['strictComplete']==478
verified=seal(TECH/'completed-current191-inactive392-reviewed-science-technical-rebase.first.freeze.json','582186eff479faee612f6ad87859b5c82a7b7f0092eb589f338be6388a9fc1b9')
entry=read(TECH/'neutral-inactive-current191-to392-technical-rebase.entry.json')
science=entry['exactPairedGenuineScienceSeals']
for item in science:
 seal(R/item['seal']['path'],item['seal']['sha256'])
body=read(AUTHOR/'whole-stable-cluster-and-two-child-goals.author.json')
before=read(R/canon);by={g['id']:g for g in before['goals']};assert len(by)==474
assert by[OLD]==body['originalWholeGoal'] and all(i not in by for i in CHILDREN)
after=copy.deepcopy(before);afterby={g['id']:g for g in after['goals']}
afterby[OLD].update(type='cluster',contains=CHILDREN,weight=2)
assert afterby[OLD]==body['proposedStableCluster']
after['goals'].extend(copy.deepcopy(body['proposedTwoWholeAtomicChildren']))
afterby={g['id']:g for g in after['goals']}
assert all(afterby[i]==g for i,g in by.items()if i!=OLD)

# Freeze actual live inputs, including the active new19 A/M version paths.
am=read(R/acfg);mm=read(R/mcfg);man=read(R/manifest)
techguards=read(TECH/'exact-current191-input-snapshots-and-rebase-guards.technical.json')
view_paths=sorted(set(v['activePath']for v in techguards['viewGuards']))
assert len(view_paths)==31
paths=sorted(set([canon,kinds,qa_path,manifest,acfg,mcfg,am['reviewPath'],mm['reviewPath'],mm['cardReviewPath'],registry,man['durationModelPolicyPath'],central_path]+view_paths))
snapshots=[];snapshot_map={}
for p in paths:
 dst=D/'before'/p;write(dst,(R/p).read_bytes());snapshot_map[p]=rel(dst)
 snapshots.append({'original':binding(R/p),'exactSnapshot':binding(dst)})
proposals=read(AUTHOR/'scope-preserving-view-reference-proposals.author.json')['proposals'];assert len(proposals)==21
prop={p['activePath']:p for p in proposals}
def pointer(o,p):
 for k in p.split('/')[1:]:o=o[int(k)]if isinstance(o,list)else o[k.replace('~1','/').replace('~0','~')]
 return o
view_map={};view_guards=[]
for p in view_paths:
 v=read(R/p);candidate=copy.deepcopy(v)
 for change in prop.get(p,{}).get('changes',[]):
  node=pointer(candidate,change['jsonPointer']);assert node==change['before']
  assert change['after']=={**node,'kind':'canonicalSubtree'};node['kind']='canonicalSubtree'
 # Uniform paths preserve native source ordering; all current unmodified views
 # are exact bytes, including the additional unchanged atlas source.
 dst=D/'candidate/views'/p
 write(dst,candidate if p in prop else (R/p).read_bytes());view_map[p]=rel(dst)
 view_guards.append({'activePath':p,'beforeSnapshotPath':snapshot_map[p],'inactiveCandidatePath':view_map[p],'changedNodes':prop.get(p,{}).get('changes',[])})
newman=copy.deepcopy(man);newman.update(expectedCurricularAtomicGoalCount=392,sourcePaths=[view_map[p]for p in man['sourcePaths']],navigationViewPath=view_map[man['navigationViewPath']],durationModelPolicyPath=snapshot_map[man['durationModelPolicyPath']])
write(D/'candidate/atlas.sources.current392.uniform-view-paths.inactive.json',newman)
futureman=copy.deepcopy(man);futureman['expectedCurricularAtomicGoalCount']=392
write(D/'candidate/atlas.sources.current392.future-active.json',futureman)

# Exact scientific A/M adoption: only the replaced atom and its two new children.
for kind,cfgpath in [('A',acfg),('M',mcfg)]:
 cfg=read(R/cfgpath);lines=(R/cfg['reviewPath']).read_text().splitlines()
 assert len(lines)==391 and sum(json.loads(l)['goalId']==OLD for l in lines)==1
 retained=[l for l in lines if json.loads(l)['goalId']!=OLD]
 child_lines=[l for l in (TECH/f'candidate/{kind}.current-full-reviewed.namespace-v2.inactive.jsonl').read_text().splitlines()if json.loads(l)['goalId']in CHILDREN]
 assert [json.loads(l)['goalId']for l in child_lines]==CHILDREN
 ledger=D/f'candidate/{kind}.current-full-reviewed.current-baseline.inactive.jsonl'
 write(ledger,'\n'.join(retained+child_lines))
 newcfg=copy.deepcopy(cfg);newcfg.update(landscapePath=rel(D/'candidate/canonical.current476.reviewed-split.actual-raster.inactive.json'),reviewPath=rel(ledger),reportPath=rel(D/f'checks/{kind}.current392.report.md'))
 if kind=='M':
  newcfg['cardReviewPath']=snapshot_map[cfg['cardReviewPath']]
  for scope in newcfg['visibilityScopes']:scope['viewPath']=view_map[scope['viewPath']]
 write(D/f'candidate/{kind}.current392.inactive.config.json',newcfg)

qa=read(R/qa_path);source_qa=copy.deepcopy(qa);oldq=next(q for q in qa['records']if q['goalId']==OLD)
assert oldq['visualizationState']=='missing';qa['records']=[q for q in qa['records']if q['goalId']!=OLD]
images=read(IMAGES/'selected-two-child-author-images.exact.json')['images'];assert [i['goalId']for i in images]==CHILDREN
image_records=[]
for gid in IDS:
 if gid in CHILDREN:
  image=next(i for i in images if i['goalId']==gid);src=R/image['path'];assert sha(src)==image['sha256']
  g=afterby[gid];assert not any(l.get('type')=='goal-visualization'for l in g.get('resourceLinks',[]))
  url=f'/assets/goal-visualizations/biologie/{gid}/{gid}.png';alt=image['altDe']
  g['resourceLinks']=g.get('resourceLinks',[])+[{'type':'goal-visualization','resourceType':'image','role':'primary','skillpilotId':gid,'title':'Visualisierung: '+g['title'],'url':url,'provider':image['provider'],'description':alt,'altText':alt,'lang':'de','license':'CC-BY-4.0','reviewStatus':'pilot'}]
  q=copy.deepcopy(oldq);q.update(goalId=gid,title=g['title'],description=g['description'],visualizationState='available',missingReason='',imageUrl=url,assetSha256='sha256:'+sha(src),chatGptNotes='Actual new-child author PNG; two independent final native D/P/V reviews pending. Generation is not approval.')
  qa['records'].append(q)
 else:
  q=next(q for q in qa['records']if q['goalId']==gid);src=R/q['publicAssetPath'];url=q['imageUrl'];assert q['assetSha256']=='sha256:'+sha(src)
  assert (R/q['canonicalAssetPath']).read_bytes()==src.read_bytes()
  image={'goalId':gid,'path':rel(src),'sha256':sha(src),'provider':'KEEP exact current approved PNG','authorDecision':'KEEP existing reviewed PNG; context only'}
 dst=D/'selected-images'/f'{gid}.png';write(dst,src.read_bytes())
 raw=dst.read_bytes();assert raw[:8]==b'\x89PNG\r\n\x1a\n';w,h=struct.unpack('>II',raw[16:24])
 if gid in CHILDREN:q.update(publicAssetPath=rel(dst),canonicalAssetPath=rel(dst))
 alias=D/url.lstrip('/');alias.parent.mkdir(parents=True,exist_ok=True);alias.symlink_to(os.path.relpath(dst,alias.parent));assert alias.resolve(strict=True)==dst
 image_records.append({**image,'selectedPath':rel(dst),'aliasPath':rel(alias),'width':w,'height':h,'newImage':gid in CHILDREN,'noNewApprovalClaim':True})
assert len(qa['records'])==392
assert all(next(q for q in qa['records']if q['goalId']==r['goalId'])==r for r in source_qa['records']if r['goalId']!=OLD)
write(D/'candidate/visualization-qa.current392.actual-raster-author.json',qa)
write(D/'candidate/canonical.current476.reviewed-split.actual-raster.inactive.json',after)
write(D/'selected-four-images.exact.json',{'images':image_records,'newImages':2,'KEEPunchangedExistingImages':2,'generationIsNotApproval':True,'humanApproval':False})
write(D/'current4-whole-DEEN-goals.actual.json',{'goals':[afterby[i]for i in IDS],'authorCandidate':True,'strictGainClaimed':0})

# Preserve the complete cases/profiles; no selective paragraphs or new companion science.
child_profiles=read(AUTHOR/'P2.whole-child-scope.author.candidates.json')
other_profiles=read(HE19/'P19.targeted-or-and-materials-closed-contract.author.candidates.json')
profiles=[next(p for p in (child_profiles['goals']if i in CHILDREN else other_profiles['goals'])if p['goalId']==i)for i in IDS]
p4=copy.deepcopy(child_profiles);p4.update(reviewId='biologie-he9-split-native-four-author-v1',goals=profiles)
write(D/'P4.whole-reviewed-science.actual-raster-author.candidates.json',p4)
child_cases=read(AUTHOR/'two-child-four-complete-DEEN-cases.author.json')
other_cases=read(HE19/'nineteen-whole-goals-forty-two-complete-DEEN-cases.author.json')
whole_cases=[next(p for p in (child_cases['goals']if i in CHILDREN else other_cases['goals'])if p['goalId']==i)for i in IDS]
write(D/'four-whole-goals-eight-complete-DEEN-cases.author.json',{'artifactKind':'Actual original whole bilingual science cases retained; native image/context binding pending','goals':whole_cases,'syntheticOnly':True,'humanApproval':False,'strictGainClaimed':0})
md=['# Biologie: zwei neue Teilziele und zwei betroffene Kontextseiten','', 'Vollständige ursprüngliche Materialien, Aufgaben und Musterantworten. Synthetische Autor-Kandidaten; keine Lernendenleistung oder menschliche Freigabe.','']
for row in whole_cases:
 md.extend(['## '+afterby[row['goalId']]['title'],'',row['goalId'],''])
 for case in row['cases']:
  md.extend(['### '+case['id'],''])
  for lang in ['de','en']:
   for k in ['material','task','modelAnswer']:
    md.extend([f'**{lang} {k}**',case[k][lang],''])
write(D/'four-whole-goals-eight-complete-DEEN-cases.author.md','\n'.join(md))

# Bounded complete original physical pages are portable evidence. PDF is a local
# official observation, never a hidden required fresh-clone input.
pdf=Path('/tmp/skillpilot-bio-he-nine-primary-root-20261008/g9-biologie.official.pdf')
assert sha(pdf)=='93257f9be96e9bd288d187eb63e3e33ca28debdb2511dcd068e9abf82bc5b5f1'
source_rows=[]
for n in [25,26]:
 p=D/f'whole-official-source-pages/HE-physical-page-{n:03d}.whole-official.txt';p.parent.mkdir(parents=True,exist_ok=True)
 command=['pdftotext','-f',str(n),'-l',str(n),'-layout',str(pdf),str(p)]
 result=subprocess.run(command,capture_output=True);assert result.returncode==0
 source_rows.append({'physicalPage':n,'wholeOriginalPage':binding(p),'actualCommand':command,'exitCode':0})
write(D/'whole-official-source-pages/actual-complete-page-extraction.provenance.json',{'officialSourceURL':'https://kultus.hessen.de/sites/kultus.hessen.de/files/2021-06/g9-biologie.pdf','officialPDFSha256':sha(pdf),'localObservationPath':str(pdf),'operativeCompletePhysicalPages':source_rows,'licenseGrantInferred':False})
write(D/'exact-current-input-snapshots-and-four-author-guards.technical.json',{'role':'Inactive engineering author; genuine completed source/class/AM adoption, no new scientific approval','recordedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'actualBaseline':{'canonical':binding(R/canon),'currentCurricularAtomic':391,'strict':strict_count,'actualCentralReport':binding(R/central_path)},'actualVerifiedTechnicalSeal':verified,'actualGenuineScienceSeals':science,'snapshots':snapshots,'snapshotMap':snapshot_map,'viewGuards':view_guards,'allCurrentOther473WholeGoalsRetained':True,'currentAandM390OtherRowsByteExact':True,'newReviewedChildRows':2,'onlyNewChildPNGs':2,'KEEPExistingCompanionPNGs':2,'nativeFinalReviewGoalIds':IDS,'newCards':0,'currentTargetDenominatorAfterPartition':392,'activeWrites':0,'humanApproval':False,'strictGainClaimed':0})
print(json.dumps({'inactiveWholeGoals':476,'currentOtherWholeGoalsExact':473,'nativeSubsetRequested':4,'newImages':2,'KEEPImages':2,'currentAandMRetainedRows':390,'baselineStrict':strict_count,'activeWrites':0,'strictGainClaimed':0}))
