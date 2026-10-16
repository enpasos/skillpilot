# SPDX-License-Identifier: Apache-2.0
"""Compose exactly three author links and bind eight genuine V FIRSTs, technically."""
from pathlib import Path
import copy, datetime, hashlib, json, shutil

REPO=Path.cwd(); OWN=Path(__file__).resolve().parents[1]; E=OWN.parent
HOST=REPO/'tmp/chemie-m7-resumed-20261015/current426-eight-V-own-stock-host-v1'
def load(p): return json.loads(p.read_text())
def ref(p):
 b=p.read_bytes(); return {'path':p.relative_to(REPO).as_posix(),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def verify(r):
 p=REPO/r['path']; assert ref(p)==r,p; return p
def put(p,x):
 assert not p.exists(),p; p.parent.mkdir(parents=True,exist_ok=True); p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
def pinned(rel,h):
 p=E/rel; assert ref(p)['sha256']=='sha256:'+h; return p,load(p)
assert not HOST.exists() and not (OWN/'INPUTS.frozen-original-eight-V-and-three-link-authors.json').exists()
basep,base=pinned('chemie-bcp-current426-bounded-inactive-integration-technical-20261015-v1/OUTPUTS.finite-current426-measured-inactive-checkpoint.final-selector.json','31c913a579fea1e21eb494d44329a41b1d844936b1305e84d3c98dddb5ba1bff')
v_specs=[('V5','chemie-five-existing-context-and-atom-images-independent-V5-20261015-v1/OUTPUTS.finite-five-existing-image-FIRST5.selector.json','7d6e6e2f21919a7f75be749d952fdd23800b4d5e6879878b7f27ffde79614a3a','FIRST5'),('V2','chemie-two-reused-digestion-polarimetry-images-independent-V2-20261015-v1/OUTPUTS.finite-two-reused-image-FIRST2.selector.json','dc16cc42188e6e760ad5ddbf95df9b6c8a33bf4c4da0566a1774da2999ddd37c','FIRST2'),('V1','chemie-tensid-letter-free-successor-independent-V1-20261015-v1/OUTPUTS.finite-letter-free-tensid-independent-FIRST1.selector.json','104c292134e4a66fcc56ea8bf451a7c172c8de33b18940a95305b64d4c216fd5','FIRST1')]
sources=[]; decisions=[]; snapshots=[]
for label,rel,h,key in v_specs:
 p,s=pinned(rel,h); first=load(verify(s[key])); seal=REPO/s['finalSealPath']; rawseal=load(seal)
 for r in rawseal['files']: verify(r)
 receipt_ref=s.get('captureReceipt',s.get('actualGoalCardReceipt')); receipt=load(verify(receipt_ref))
 for k in ['goalCardComponent','sourceCss','input']: verify(receipt[k]); snapshots.append({'source':label,'snapshotKind':k,'reference':receipt[k]})
 for row in receipt['records']: verify(row['screenshot']); verify(row['sourceImage'])
 rows=first.get('records',[first])
 assert len(rows)==int(label[1:]) and all(r['verdict']=='KEEP' for r in rows)
 for r in rows:
  image=r.get('actualUnchangedImage',r.get('actualReusedImage',r.get('exactReviewedPng'))); verify(image)
  goal=r.get('wholeCurrentGoal',r.get('wholeCurrentGoalWithCandidateLink'))
  decisions.append({'goalId':r['goalId'],'originalFIRST':s[key],'originalFIRSTSelector':ref(p),'originalRecord':r,
                    'image':image,'wholeReviewedGoal':goal,'reviewer':first['reviewer'],'reviewedAt':first['observedAtUTC'],'label':label})
 sources.append({'label':label,'selector':ref(p),'first':s[key],'seal':ref(seal),'sealPayloads':rawseal['files'],'captureReceipt':receipt_ref})
assert len(decisions)==len({r['goalId'] for r in decisions})==8
ap,a=pinned('chemie-two-existing-missing-image-links-author-successor-20261015-v1/NEUTRAL.finite-two-existing-images-current-context-author.selector.json','0a30960ad4cca0f8781f1a5fd80e0558ce14d2a85ac616b94339a03b685d4c04')
tp,t=pinned('chemie-tensid-two-letter-removal-image-author-successor-20261015-v1/OUTPUTS.finite-letter-free-tensid-image-author-successor.selector.json','cecac7d9c7278ee05b295be4266ee5e8b116902b600a4c513d35e76d7b1d2e32')
for author in [a,t]:
 for r in load(REPO/author['finalSealPath'])['files']: verify(r)
old=load(verify(base['canonical'])); new=copy.deepcopy(old); oldby={g['id']:g for g in old['goals']}
two={g['id']:g for g in load(verify(a['canonical']))['goals']}; single=load(verify(t['wholeGoalWithCurrentLink']))
selected={gid:two[gid] for gid in a['goals']}; selected[single['id']]=single
assert set(selected)=={'0b5342b9-512d-573f-90d5-7522aee35efa','f4d5a02d-711b-5a6b-a41d-971359c1f64d','0773a104-aaeb-5e96-a615-2a2bec3eb096'}
for gid,g in selected.items(): assert {k:v for k,v in g.items() if k!='resourceLinks'}=={k:v for k,v in oldby[gid].items() if k!='resourceLinks'}
new['goals']=[copy.deepcopy(selected.get(g['id'],g)) for g in old['goals']]; newby={g['id']:g for g in new['goals']}
assert len(newby)==570 and sum(oldby[gid]==newby[gid] for gid in oldby)==567
for row in decisions: assert row['wholeReviewedGoal']==newby[row['goalId']],row['goalId']
cp=OWN/'candidate/canonical570.current426.exact-three-author-image-links.inactive.json'; put(cp,new)
semantic=load(verify(base['semantic'])); assert len(semantic['decisions'])==570 and semantic['counts']['curricularAtomic']==426
sp=OWN/'candidate/semantic570.current426.original-decisions-normal-address.inactive.json'; put(sp,semantic)
assert load(sp)==load(REPO/base['semantic']['path'])
qa=load(verify(base['visualizationQA'])); assert len(qa['records'])==443
assert sum(r['visualizationState']=='available' for r in qa['records'])==440
seed=copy.deepcopy(qa); byqa={r['goalId']:r for r in seed['records']}
notes_keys=['nativeConcreteFindings','didacticCurrentContext','currentContextFinding','anatomyAndResorptionCheck','mobile360Finding','desktop680Finding','mobile360','desktop680','formatDecision','knownScopeAndReadingLimits','scopeLimits','scientificAndScopeLimits','wholeCaseConsistency','altAndGoalFit','caseBoundary','separateRuntimeObservations','noTransferredChildVApproval','noNewPOrDApproval','provenanceBoundary','provenance']
for d in decisions:
 r=byqa[d['goalId']]; g=newby[d['goalId']]; link=next(x for x in g['resourceLinks'] if x['type']=='goal-visualization' and x.get('role','primary')=='primary')
 r.update(visualizationState='available',missingReason='',imageUrl=link['url'],publicAssetPath='app/public'+link['url'],canonicalAssetPath='curricula/DE/Gymnasium/visualizations/'+link['url'].split('/assets/goal-visualizations/',1)[1],assetSha256=d['image']['sha256'])
 evidence={k:d['originalRecord'][k] for k in notes_keys if k in d['originalRecord']}
 notes=json.dumps({'originalFIRST':d['originalFIRST'],'verdict':'KEEP','originalOwnFindingsAndLimits':evidence,'technicalBoundary':'Exact original independent V only; no new D/P/A/M, human approval or runtime acceptance.'},ensure_ascii=False,separators=(',',':'))
 r.update(aiApproved='yes',aiApprovedAssetSha256=d['image']['sha256'],aiReviewedAt=d['reviewedAt'],aiReviewer=d['reviewer'],aiNotes=notes)
 d['notesSourceFields']=evidence
seedp=OWN/'qa/QA443.eight-genuine-original-V.seed-before-stock.json'; put(seedp,seed)
mp=load(verify(base['exactRebuildRecipe'])); assets={r['goalId']:copy.deepcopy(r) for r in mp['selectedCurrentAssetRows']}
for d in decisions:
 gid=d['goalId']; link=next(x for x in newby[gid]['resourceLinks'] if x['type']=='goal-visualization' and x.get('role','primary')=='primary')
 assets[gid]={'goalId':gid,'physicalRepositorySource':d['image'],'normalPublicDestination':'app/public'+link['url'],'normalCanonicalDestination':'curricula/DE/Gymnasium/visualizations/'+link['url'].split('/assets/goal-visualizations/',1)[1]}
modules=mp['stockPhysicalModules']+[ref(REPO/'app/scripts/checkGoalVisualizationQaApprovalCoverage.ts')]
for r in modules: verify(r)
HOST.mkdir(parents=True)
for p in REPO.iterdir():
 if p.name not in ['app','tmp','.git']: (HOST/p.name).symlink_to(p,target_is_directory=p.is_dir())
(HOST/'app').mkdir()
for p in (REPO/'app').iterdir():
 if p.name not in ['scripts','public']: (HOST/'app'/p.name).symlink_to(p,target_is_directory=p.is_dir())
(HOST/'app/scripts').mkdir(); (HOST/'app/public').mkdir()
def branch(p):
 if p.is_symlink():
  entries=list(p.resolve().iterdir());p.unlink();p.mkdir()
  for c in entries:(p/c.name).symlink_to(c,target_is_directory=c.is_dir())
 elif not p.exists():p.mkdir()
def install(src,rel,physical=False):
 p=HOST/rel; par=HOST
 for part in p.relative_to(HOST).parts[:-1]:par/=part;branch(par)
 if p.is_symlink() or p.is_file():p.unlink()
 if physical:shutil.copyfile(src,p)
 else:p.symlink_to(src)
for rel in ['curricula/DE/Gymnasium/canonical','curricula/DE/Gymnasium/quality/goal-visualization-qa','curricula/DE/Gymnasium/quality/goal-visualization-review']:
 p=HOST/rel;par=HOST
 for part in p.relative_to(HOST).parts[:-1]:par/=part;branch(par)
 if p.is_symlink():p.unlink()
 assert not p.exists();p.mkdir()
for r in modules:install(verify(r),r['path'],True)
normal_c='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'; normal_s='curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json';normal_q='curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json'
install(cp,normal_c,True);install(sp,normal_s);install(seedp,normal_q,True)
for r in assets.values():
 src=REPO/r['physicalRepositorySource']['path'];assert src.is_file(),src
 install(src,r['normalPublicDestination']);install(src,r['normalCanonicalDestination'])
assert len(list((HOST/'curricula/DE/Gymnasium/canonical').glob('*.json')))==1
legacy=load(verify(mp['legacyQaDispositionDiscoveryInput']));assert legacy['selectedChemistryLegacyMarkdownCount']==0 and legacy['rows']==[]
model_snapshot=[ref(REPO/p) for p in ['app/scripts/goalBookModel.ts','app/scripts/reportDeepUnderstandingRollout.ts','app/scripts/generateGoalVisualizationQaLedgers.ts','app/scripts/goalVisualizationQaModel.ts','app/src/components/GoalCard.tsx','app/src/index.css']]
plan={'schemaVersion':1,'role':'Exact technical V8 inputs and three author links; no new scientific decisions','baselineSelector':ref(basep),'canonical':ref(cp),'semantic':ref(sp),'baselineQA':base['visualizationQA'],'seedQA':ref(seedp),'sourceReviews':sources,'authorSelectors':[ref(ap),ref(tp)],'originalDecisions':decisions,'sourceSnapshotReferences':snapshots,'stockModelAndComponentSnapshot':model_snapshot,'basePhysicalMap':base['exactRebuildRecipe'],'executionHost':HOST.relative_to(REPO).as_posix(),'normalCanonicalPath':normal_c,'normalSemanticPath':normal_s,'normalQAPath':normal_q,'imageRows':list(assets.values()),'modules':modules,'normalCanonicalAndQaPhysicalCopies':2,'physicalRasterCopies':0,'changedWholeGoalIds':list(selected),'unchangedWholeGoals':567,'unchangedSemanticDecisions':570,'finalQAOutputPath':(OWN/'qa/QA443.three-links-eight-original-V.stock-generated.inactive.json').relative_to(REPO).as_posix(),'noCentralOrNative':True}
put(OWN/'INPUTS.frozen-original-eight-V-and-three-link-authors.json',plan)
put(OWN/'REBUILD.one-own-minimal-stock-V-host.exact-map.json',{'schemaVersion':1,'executionHost':plan['executionHost'],'sourceMap':base['exactRebuildRecipe'],'modules':modules,'normalAliases':[{'alias':normal_c,'source':ref(cp),'materialization':'private regular JSON copy for unchanged stock discovery'},{'alias':normal_s,'source':ref(sp),'materialization':'immutable reference'},{'alias':normal_q,'source':ref(seedp),'materialization':'private writable QA copy only'}],'imageRows':plan['imageRows'],'canonicalDiscoveryRegularJsonFiles':1,'legacySelectedReviewMarkdown':0,'physicalRasterCopies':0,'imageBodiesDuplicated':0,'oldHostWrites':0,'activeWrites':0})
print(json.dumps({'goals':570,'atoms':426,'wholeGoalChanges':3,'unchangedGoals':567,'genuineVBindings':8,'qaScope':443,'privateHostCreated':1,'imageCopies':0}),flush=True)
