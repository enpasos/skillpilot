# SPDX-License-Identifier: Apache-2.0
"""Adopt the sealed genuine pair over current Bio202 and current Chem source state.

Only this exclusive inactive packet is written. Historical artifacts remain exact.
"""
from pathlib import Path
import copy,hashlib,json

R=Path.cwd();D=Path(__file__).resolve().parent;DATE=D.parent
AUTHOR=DATE/'biologie-he9-split-four-final-raster-native-author-technical-20261008-v1'
A=DATE/'biologie-he9-split-four-final-raster-native-independent-a-20261008-v1'
B=DATE/'biologie-he9-split-four-final-raster-native-independent-b-20261008-v1'
OLD='3ee4b55c-81c3-5826-9d26-1a8c22cbd0b8'
CHILDREN=['9d3f71d7-5273-5e50-b1ba-4e291edbf114','dd923eeb-eef0-5796-b372-a5d4f5be21f7']
COMPANIONS=['249f4c5d-fd23-57c7-ac62-773d62c33b49','4b7fdc2c-9dbe-5439-8d84-295abc240eec'];IDS=CHILDREN+COMPANIONS
DECLARED={}
sha=lambda p:hashlib.sha256(Path(p).read_bytes()).hexdigest()
rel=lambda p:str(Path(p).relative_to(R))
def bind(p):
 p=Path(p);x={'path':rel(p),'sha256':sha(p),'bytes':p.stat().st_size};DECLARED[x['path']]=x;return x
def read(p):bind(p);return json.loads(Path(p).read_text())
def put(name,o):
 p=D/name;p.parent.mkdir(parents=True,exist_ok=True)
 b=o if isinstance(o,bytes)else (o if isinstance(o,str)else json.dumps(o,ensure_ascii=False,indent=2))+'\n'
 if not isinstance(b,bytes):b=b.encode()
 with p.open('xb')as f:f.write(b)
 return bind(p)
def seal(p,expected):
 assert sha(p)==expected,(p,'sealed digest')
 j=read(p);rows=j.get('frozenFiles',j.get('ownFiles'));assert rows is not None
 for row in rows:
  q=R/row['path'];assert sha(q)==row['sha256'].removeprefix('sha256:'),(q,'sealed content drift')
  if 'bytes'in row:assert q.stat().st_size==row['bytes']
  bind(q)
 return {'seal':bind(p),'actualExactFiles':len(rows)}
seals={
 'author':seal(AUTHOR/'current-four-raster-native-author-input.first.freeze.json','eabe2f79c398c86a0c6ef3ff134e16009f9d2e82f251593295162cd2dfb710da'),
 'provenance':seal(AUTHOR/'exact-original-raster-source-provenance.append-only.freeze.json','586c8f02b8f00ce7288da5d6972e9aabb042e90ba95396918cd5b5893d3ff9bc'),
 'A':seal(A/'completed-current-four-D-P-V-source-class-AM.independent-a.final.freeze.json','7ab284e38b5e8eccc7015b4e28d3ae7c18f9233b0d83e4841d40ff3436030925'),
 'B':seal(B/'completed-four-D-P-V-native-checks-portability.independent-b.final.freeze.json','13871cac7f1fc932a102a3139b0b818eda11e082c90b15e31ab314c1faca72e8')}
afirst=bind(A/'first-four-genuine-current-D-P-V.independent-a.exact.freeze.json');assert afirst['sha256']=='f6b5f1be328bdb7124330a000a1f7752475fb99edb4a641bb52abb432333a8fc'
bfirst=bind(B/'four-genuine-current-D-P-V.independent-b.first.freeze.json');assert bfirst['sha256']=='f49b18a482efcd9d70720b341ae07b9f31b8f746018b3a86181af8f0591d9937'
paths={
 'canonical':'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json',
 'kinds':'curricula/DE/Gymnasium/quality/goal-book-publication/biologie.semantic-kinds.json',
 'qa':'curricula/DE/Gymnasium/quality/goal-visualization-qa/biologie.qa.json',
 'atomicityConfig':'curricula/DE/Gymnasium/quality/semantic-atomicity/canonical-biology-full.config.json',
 'memoryConfig':'curricula/DE/Gymnasium/quality/memory-card-review/canonical-biology-full.config.json',
 'registry':'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json',
 'ledger':'curricula/DE/Gymnasium/quality/goal-description-review/in-flight-work-ledger.json',
 'floors':'app/scripts/config/curriculum-maturity-floor-policy.json',
 'atlasInputs':'app/scripts/config/goal-books/de-gym-biology-national-atlas.inputs.json',
 'atlasManifest':'app/scripts/config/goal-books/de-gym-biology-national-atlas.sources.json'}
before={}
for key,path in paths.items():before[key]=bind(R/path);put('before/'+key+'.json',(R/path).read_bytes())
assert before['canonical']['sha256']=='d524850cf83cdb70b3b1105c1bac5b93b08e42272893320392f160f52a4e35d5'
centralroot=DATE/'chemie-b014-eight-reviewed-source-roles-active-integration-root-v1'
centralpath=centralroot/'active-after-eight-source-roles-central.actual.json';central=read(centralpath)
assert read(centralroot/'active-after-eight-source-roles-central.exit.actual.json')['exitCode']==0 and central['blockingIssueCount']==0
subjects={s['subject']:s for s in central['subjects']}
assert [(subjects[s]['strictComplete'],subjects[s]['denominator'])for s in ['biologie','chemie','mathematik','physik']]==[(202,391),(173,378),(807,807),(478,478)]
put('before/current202-after-current-Chem-source-central.actual.json',centralpath.read_bytes())
live=read(R/paths['canonical']);candidate=read(AUTHOR/'candidate/canonical.current476.reviewed-split.actual-raster.inactive.json')
by={g['id']:g for g in live['goals']};after={g['id']:g for g in candidate['goals']}
assert len(by)==474 and len(after)==476
for gid,g in by.items():
 if gid!=OLD:assert after[gid]==g
parentbefore=copy.deepcopy(by[OLD]);parentafter=copy.deepcopy(after[OLD])
for k in ['contains','type','weight']:parentbefore.pop(k,None);parentafter.pop(k,None)
assert parentbefore==parentafter and after[OLD]['contains']==CHILDREN and after[OLD]['type']=='cluster'
put('candidate/canonical.current476-reviewed.future-active.json',candidate)
kindlive=read(R/paths['kinds']);kindreviewed=read(AUTHOR/'candidate/semantic-kinds.current476.actual-paired-science.future-active.json')
kb={r['goalId']:r for r in kindlive['decisions']};ka={r['goalId']:r for r in kindreviewed['decisions']}
assert all(kb[i]==ka[i]for i in kb if i!=OLD)
assert kindreviewed['counts']['curricularAtomic']==392 and kindreviewed['counts']['total']==476
put('candidate/semantic-kinds.current476-reviewed.future-active.json',kindreviewed)
inert=copy.deepcopy(kindreviewed);inert['sourceLandscapePath']=rel(D/'candidate/canonical.current476-reviewed.future-active.json')
put('candidate/semantic-kinds.current476-reviewed.inactive.json',inert)

# Current active A/M pointers contain the true new19 reviewed rows. Do not use
# the obsolete whole191 versions, and do not edit an historical review ledger.
amguards={};viewops=[];protected=[];views={}
author_guards=read(AUTHOR/'exact-current-input-snapshots-and-four-author-guards.technical.json')
for vg in author_guards['viewGuards']:
 path=vg['activePath'];current=read(R/path);assert current==read(R/vg['beforeSnapshotPath'])
 nextview=read(R/vg['inactiveCandidatePath']);views[path]=nextview
 if nextview!=current:
  source=put('candidate/views/'+path,nextview)
  viewops.append({'target':path,'source':source,'expectedBefore':bind(R/path),'reviewedOnlyChanges':vg['changedNodes']})
assert len(viewops)==21
for key,letter in [('atomicityConfig','A'),('memoryConfig','M')]:
 cfg=read(R/paths[key]);lines=(R/cfg['reviewPath']).read_text().splitlines();bind(R/cfg['reviewPath'])
 assert len(lines)==391 and sum(json.loads(l)['goalId']==OLD for l in lines)==1
 retained=[l for l in lines if json.loads(l)['goalId']!=OLD]
 originalauthorlines=(AUTHOR/f'candidate/{letter}.current-full-reviewed.current-baseline.inactive.jsonl').read_text().splitlines()
 assert [l for l in originalauthorlines if json.loads(l)['goalId']not in CHILDREN]==retained
 childlines=[l for l in originalauthorlines if json.loads(l)['goalId']in CHILDREN]
 assert [json.loads(l)['goalId']for l in childlines]==CHILDREN
 future_ledger=put(f'candidate/{letter}.current392-reviewed.future-active.jsonl','\n'.join(retained+childlines))
 future_cfg=copy.deepcopy(cfg);future_cfg['reviewPath']=future_ledger['path']
 cfgbind=put(f'candidate/{letter}.current392-reviewed.future-active.config.json',future_cfg)
 inactive_cfg=copy.deepcopy(future_cfg);inactive_cfg['landscapePath']=rel(D/'candidate/canonical.current476-reviewed.future-active.json');inactive_cfg['reportPath']=rel(D/f'checks/{letter}.current392-reviewed.native.report.md')
 for scope in inactive_cfg.get('visibilityScopes',[]):
  if any(v['target']==scope['viewPath']for v in viewops):scope['viewPath']=rel(D/'candidate/views'/scope['viewPath'])
 put(f'candidate/{letter}.current392-reviewed.inactive.config.json',inactive_cfg)
 amguards[key]={'actualCurrentConfig':before[key],'actualCurrentReview':bind(R/cfg['reviewPath']),'futureImmutableLedger':future_ledger,'futureConfig':cfgbind,'other390RowsExact':True}
 if 'cardReviewPath'in cfg:protected.append(bind(R/cfg['cardReviewPath']))
for path in ['curricula/DE/Gymnasium/quality/semantic-atomicity/canonical-biology-full.review.jsonl','curricula/DE/Gymnasium/quality/memory-card-review/canonical-biology-full.review.jsonl','app/public/data/de_gymnasium_biology_flashcards_core.de.json','app/public/data/de_gymnasium_biology_flashcards_core.en.json']:
 protected.append(bind(R/path))
for s in ['MATHEMATIK','PHYSIK','CHEMIE']:protected.append(bind(R/f'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_{s}.de.json'))
ledger=read(R/paths['ledger']);assert len(ledger['activeBatchConfigPaths'])==7
for path in ledger['activeBatchConfigPaths']:protected.append(bind(R/path))
# Protect the latest actually integrated Chem source mapping/view/receipt state.
chem_inputs=read(R/'app/scripts/config/goal-books/de-gym-chemistry-national-atlas.inputs.json')
chem_manifest=read(R/'app/scripts/config/goal-books/de-gym-chemistry-national-atlas.sources.json')
chem_paths=set(chem_inputs['mappingPaths']+chem_manifest['sourcePaths']+[chem_manifest['navigationViewPath'],chem_inputs['outputDirectory']+'/source-projection.receipt.json','app/scripts/config/goal-books/de-gym-chemistry-national-atlas.inputs.json','app/scripts/config/goal-books/de-gym-chemistry-national-atlas.sources.json'])
for path in sorted(chem_paths):protected.append(bind(R/path))
images=read(AUTHOR/'selected-four-images.exact.json')['images'];copies=[]
for im in images:
 gid=im['goalId'];assert sha(R/im['selectedPath'])==im['sha256']
 if gid not in CHILDREN:
  assert sha(R/f'app/public/assets/goal-visualizations/biologie/{gid}/{gid}.png')==im['sha256'];continue
 for path in [f'curricula/DE/Gymnasium/visualizations/biologie/{gid}/{gid}.png',f'app/public/assets/goal-visualizations/biologie/{gid}/{gid}.png',f'backend/src/main/resources/static/assets/goal-visualizations/biologie/{gid}/{gid}.png']:
  assert not(R/path).exists();copies.append({'source':bind(R/im['selectedPath']),'target':path,'expectedBefore':'missing'})
 for source,name in [(im['promptPath'],'prompt.de.md'),(im['toolProvenancePath'],'generation.provenance.json')]:
  path=f'curricula/DE/Gymnasium/visualizations/biologie/{gid}/{name}';assert not(R/path).exists();copies.append({'source':bind(R/source),'target':path,'expectedBefore':'missing'})
assert len(copies)==10
av=read(A/'actual-whole-four-D-P-V-first.independent-a.verdict.json');bv=read(B/'four-actual-PNG-widths-native-pages-V.independent-b.first.verdicts.json')
ap=read(A/'P4.actual-native-current-raster-and-retained-AM.independent-a.json');bp=read(B/'P4.actual-inactive-schema-semantics-original-PNG.independent-b.receipt.json')
assert av['peerCurrentFinalBReadBeforeSeal'] is False and bv['peerAFinalOutputsRead'] is False
assert av['blockingFindings']==[] and bv['newBlockingFindings']==[]
assert {r['goalId']for r in av['records']}=={r['goalId']for r in bv['records']}==set(IDS)
paired=[]
for gid in IDS:
 ar=next(r for r in av['records']if r['goalId']==gid);br=next(r for r in bv['records']if r['goalId']==gid)
 assert ar['descriptionDecision']=='KEEP' and ar['wholeScienceDecision']=='PASS' and ar['actualVisualizationDecision']=='KEEP'
 assert br['decision']=='KEEP' and br['fachlich']==br['visual']=='PASS'
 assert ar['actualFullPNG']['sha256']==br['exactSelectedPNG']['sha256']
 assert ar['actualCompleteNativePage']['sha256']==br['actualNativePage']['sha256']
 assert [r['sha256']for r in ar['actualWidthCaptures']]==[r['sha256']for r in br['actualWidths']]
 assert ar['wholeGoalBody']==after[gid]
 paired.append({'goalId':gid,'actualA':ar,'actualB':br,'descriptionKEEP':True,'wholePositiveScopedSciencePASS':True,'actualVisualKEEP':True,'newScienceReviewRuns':0})
put('checks/genuine-current-four-pair-ready.technical.json',{'role':'Actual sealed pair technical adoption only; no new scientific review','selectedGoalIds':IDS,'newChildGoalIds':CHILDREN,'contextCompanionGoalIds':COMPANIONS,'oldStableParentId':OLD,'beforeBindings':before,'protectedOtherFiles':protected,'currentAMGuards':amguards,'currentActualAllSevenChemistryClaims':ledger['activeBatchConfigPaths'],'seals':seals,'independentFirstSeals':{'A':afirst,'B':bfirst},'actualReviewerResults':{'a':rel(A/'round-a/results'),'b':rel(B/'round-b/results')},'actualPairedV':paired,'actualPairedPAPISource':{'A':bind(A/'P4.actual-native-current-raster-and-retained-AM.independent-a.json'),'B':bind(B/'P4.actual-inactive-schema-semantics-original-PNG.independent-b.receipt.json')},'actualSourceAuthor':rel(AUTHOR),'views':viewops,'copies':copies,'baselineCurrentStrict':202,'baselineCurrentDenominator':391,'currentOther473WholeGoalsExact':True,'candidateAtomicDenominator':392,'unchangedOther390AMRows':True,'activeWrites':0,'strictGainClaimed':0,'humanApproval':False})
put('checks/initial-current202-genuine-pair-declared-inputs.technical.json',{'files':list(DECLARED.values())})
print(json.dumps({'actualBaseline':'202/391 after currentChem8source','genuineD4P4V4Pair':'KEEP/PASS','other473WholeGoalsExact':True,'AMother390RowsExact':True,'reviewedViews':21,'assetCopies':10,'activeWrites':0,'strictGainClaimed':0}))
