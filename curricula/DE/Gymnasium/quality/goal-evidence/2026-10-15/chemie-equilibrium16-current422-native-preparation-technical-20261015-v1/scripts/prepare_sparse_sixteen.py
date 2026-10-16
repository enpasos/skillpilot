# SPDX-License-Identifier: Apache-2.0
"""Sparse exact native16 preparation; no scientific decisions, active writes or full copy."""
from pathlib import Path
import json,hashlib,shutil,copy,os,datetime
R=Path.cwd();O=Path(__file__).resolve().parents[1];REL=str(O.relative_to(R));E=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15')
AUTHOR=E/'chemie-equilibrium-redox-kinetics16-current422-whole-material-author-20261015-v1';BASE=E/'chemie-energy18-current422-bounded-inactive-integration-technical-20261015-v1/checks/REBUILD.energy18-final.physical-exact-map.v3.json';TEMPLATE=E/'chemie-energy-four-final-contexts-native-preparation-technical-20261015-v1'
assert not (O/'FILES.finite-native16-technical.seal.json').exists()
def j(p):return json.loads(Path(p).read_text())
def art(p):
 p=Path(p);b=p.read_bytes();return {'path':str(p.relative_to(R) if p.is_absolute() else p),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def verified(d):
 p=R/d['path'];a=art(p);assert a['sha256']==d['sha256'],p
 if 'bytes'in d:assert a['bytes']==d['bytes'],p
 return p
def write(n,x):
 p=O/n;p.parent.mkdir(parents=True,exist_ok=True);assert not p.exists(),p;p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
def exactcopy(source,target):
 p=O/target;p.parent.mkdir(parents=True,exist_ok=True);assert not p.exists();shutil.copyfile(source,p);assert p.read_bytes()==Path(source).read_bytes()
sel=j(AUTHOR/'INPUTS.final-equilibrium-redox-kinetics16-whole-material.author-selector.json');authorseal=j(AUTHOR/'FILES.finite-whole-material-author.seal.json')
for r in authorseal['files']:verified(r)
ids=sel['goalIds'];assert len(ids)==16 and len(set(ids))==16
can=verified(sel['canonical560']);sem=verified(sel['semantic560']);G={g['id']:g for g in j(can)['goals']}
Vsel=j(sel['independentV1IsExternalOnly']['path']);v=verified(Vsel['normalV1']);q1=j(v)['records'];assert len(q1)==1;newrow=q1[0];gid=newrow['goalId'];assert gid=='13838147-c26d-54ca-b9be-5f2f0b8e9de5' and newrow['aiApproved']=='yes' and newrow['humanApproved']=='no'
mp=j(BASE);oldmp=copy.deepcopy(mp);H=R/'tmp/chemie-m7-resumed-20261015/equilibrium16-current422-native560-final-host-v1';assert not H.exists()
qaAlias=next(r for r in mp['aliases'] if r['normalHostAlias'].endswith('/goal-visualization-qa/chemie.qa.json'));oldqa=j(verified(qaAlias['physicalRepositorySource']));assert len(oldqa['records'])==438
qa=copy.deepcopy(oldqa);before=next(x for x in qa['records'] if x['goalId']==gid);qa['records']=[copy.deepcopy(newrow) if x['goalId']==gid else x for x in qa['records']]
assert sum(a==b for a,b in zip(oldqa['records'],qa['records']))==437
write('candidate/QA438.original437-plus-exact-independent-138-V1.json',qa)
write('checks/CAS.QA438-one-genuine-V1-row-exact.json',{'role':'One exact original independent V row selected for technical native input; no new V vote','beforeWholeRow':before,'afterWholeRow':newrow,'originalQA':qaAlias['physicalRepositorySource'],'originalIndependentNormalV1':art(v),'other437WholeRowsExact':True,'newVVotesByTechnicalAuthor':0})
changes=[]
for row in mp['aliases']:
 alias=row['normalHostAlias'];old=copy.deepcopy(row['physicalRepositorySource'])
 if alias=='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json':row['physicalRepositorySource']=art(can)
 elif alias=='curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json':row['physicalRepositorySource']=art(sem)
 elif alias.endswith('/goal-visualization-qa/chemie.qa.json'):row['physicalRepositorySource']=art(O/'candidate/QA438.original437-plus-exact-independent-138-V1.json')
 if old!=row['physicalRepositorySource']:changes.append({'normalAlias':alias,'before':old,'after':row['physicalRepositorySource']})
assert len(changes)==3
newassets=j(AUTHOR/'inputs/fifteen-final-assets.exact-bindings.json');png=next(a for a in newassets['assets'] if a['goalId']==gid);verified(png)
assetcas=[]
for row in mp['selectedCurrentAssetRows']:
 if row['goalId']==gid:
  beforeAsset=copy.deepcopy(row);row['physicalRepositorySource']={k:png[k] for k in ['path','sha256','bytes']};row['normalCanonicalDestination']=newrow['canonicalAssetPath'];row['normalPublicDestination']=newrow['publicAssetPath'];assetcas.append({'before':beforeAsset,'afterAssetSourceAndDestinations':copy.deepcopy(row)})
 row['publicMustBePhysicalWithinHostPublicRoot']=row['goalId'] in ids
 row['publicMaterialization']='physical exact selected source copy' if row['goalId'] in ids else 'read-only exact source symlink'
assert len(assetcas)==1
assert sum(r['goalId']in ids for r in mp['selectedCurrentAssetRows'])==15
mp.update({'role':'Native16 technical review preparation, no scientific decisions','executionHost':str(H.relative_to(R)),'sourceCurrent338Map':art(BASE),'fullCentralAllowed':False,'pendingD4V4':False,'nativeRendererAssigned':True,'selectedSixteenGoalIds':ids,'physicalPublicSelectedCount':15,'physicalPublicSelectedBytes':sum(r['physicalRepositorySource']['bytes'] for r in mp['selectedCurrentAssetRows'] if r['goalId']in ids),'normalImagesReadThroughExactImmutableSources':True,'maxCacheBytes':80*1024*1024,'buildReceiptPath':'checks/HOST.actual-sparse-sixteen.json','normalStockCommands':0,'newScientificVotes':0})
for row in mp['stockPhysicalModules']:
 verified(row);assert art(R/row['path'])==row
assert len(mp['stockPhysicalModules'])==31
for row in mp['aliases']:verified(row['physicalRepositorySource'])
for row in mp['selectedCurrentAssetRows']:verified(row['physicalRepositorySource'])
H.mkdir(parents=True)
for p in R.iterdir():
 if p.name not in ('app','tmp','.git'):(H/p.name).symlink_to(p,target_is_directory=p.is_dir())
(H/'app').mkdir();(H/'app/scripts').mkdir();(H/'app/public').mkdir()
for p in (R/'app').iterdir():
 if p.name not in ('scripts','public'):(H/'app'/p.name).symlink_to(p,target_is_directory=p.is_dir())
def branch(p):
 if p.is_symlink():
  children=list(p.resolve().iterdir());p.unlink();p.mkdir()
  for c in children:(p/c.name).symlink_to(c,target_is_directory=c.is_dir())
 elif not p.exists():p.mkdir()
 assert p.is_dir() and not p.is_symlink()
def install(source,rel,physical):
 target=H/rel;parent=H
 for part in target.relative_to(H).parts[:-1]:parent/=part;branch(parent)
 if target.is_file() or target.is_symlink():target.unlink()
 else:assert not target.exists()
 if physical:shutil.copyfile(source,target)
 else:target.symlink_to(source)
for r in mp['stockPhysicalModules']:install(verified(r),r['path'],True)
for r in mp['aliases']:install(verified(r['physicalRepositorySource']),r['normalHostAlias'],True)
for r in mp['selectedCurrentAssetRows']:
 source=verified(r['physicalRepositorySource']);install(source,r['normalCanonicalDestination'],False);install(source,r['normalPublicDestination'],r['publicMustBePhysicalWithinHostPublicRoot'])
legacy=verified(mp['legacyQaDispositionDiscoveryInput']);assert j(legacy)['rows']==[]
review=H/'curricula/DE/Gymnasium/quality/goal-visualization-review';parent=H
for part in review.relative_to(H).parts[:-1]:parent/=part;branch(parent)
assert review.is_symlink();review.unlink();review.mkdir()
write('checks/REBUILD.native16.current338-exact-physical-map.json',mp)
write('checks/CAS.three-normal-aliases-one-asset-transport.json',{'role':'Technical alias/asset transport only','aliasChanges':changes,'wholeAssetChange':assetcas,'other433AssetSourcesAndDestinationsExact':all({k:r[k] for k in ['goalId','physicalRepositorySource','normalCanonicalDestination','normalPublicDestination']}=={k:o[k] for k in ['goalId','physicalRepositorySource','normalCanonicalDestination','normalPublicDestination']} for r,o in zip(mp['selectedCurrentAssetRows'],oldmp['selectedCurrentAssetRows']) if r['goalId']!=gid),'selectedPublicPhysicalCopies':15,'sourceImageEdits':0})
base=j(TEMPLATE/'config/whole422.normal-stock-base.config.json');base.update({'bookId':'chemie-equilibrium16-full560-current422-20261015-v1','title':'Chemie – Gleichgewicht, Redox und Kinetik: 16 Lernziele','evidenceReviewPaths':[str(AUTHOR/'candidate/sixteen-unreviewed-E0G0.author-profiles.jsonl')],'outputPath':REL+'/candidate/full422.in-memory-only.not-materialized.json'})
write('config/whole422.normal-stock-base.config.json',base)
config=j(TEMPLATE/'config/native4.normal-prepare-only.config.json');config.update({'batchId':'chemie-equilibrium16-current422-native560-20261015-v1','bookId':'chemie-equilibrium16-current422-native560-20261015-v1','title':'Chemie – Gleichgewicht, Redox und Kinetik: 16 Lernziele','baseGoalBookConfigPath':REL+'/config/whole422.normal-stock-base.config.json','goalIds':ids,'outputDirectory':REL+'/native-sixteen'})
write('config/native16.normal-prepare-only.config.json',config)
# Blind scientific companion copies contain no author-FIRST, judgment dossier or V/reviewer output.
copyrows=[]
for s,t in [('materials/thirty-two-whole-DE-EN-cases.final-science-and-prose.author.json','blind-inputs/thirty-two-whole-DE-EN-cases.raw-author.json'),('materials/thirty-two-blank-future-observation-records.json','blind-inputs/thirty-two-blank-future-observation-records.json'),('candidate/sixteen-unreviewed-E0G0.author-profiles.jsonl','blind-inputs/sixteen-raw-E0G0-author-profiles.jsonl'),('sources/eighty-seven-whole-passages.exact.json','blind-inputs/eighty-seven-whole-source-passages.exact.json'),('sources/targeted-official-HE-BW-whole-pages.read.json','blind-inputs/targeted-official-HE-BW-whole-pages.exact.json')]:
 exactcopy(AUTHOR/s,t);copyrows.append({'source':art(AUTHOR/s),'blindCopy':art(O/t),'wholeBytesExact':True})
contexts=j(AUTHOR/'inputs/sixteen-whole-final-contexts.exact.json');blindcontexts={'schemaVersion':1,'role':'Exact whole current goals, prerequisite and parent/dependent objects for fresh scientific review','rows':[{k:v for k,v in r.items() if k!='currentStrictCompletionInActualCentral338'} for r in contexts['rows']]};write('blind-inputs/sixteen-whole-current-goals-prerequisites-parents.exact.json',blindcontexts)
raw=j(AUTHOR/'sources/whole-source-cells-and-canonical-partner-unions.exact.json');routes=[];partnercas=[]
for r in raw['routes']:
 rr={k:copy.deepcopy(v) for k,v in r.items() if k!='useBoundary'}
 for i,g in enumerate(rr['wholeCanonicalPartnerGoals']):
  if g!=G[g['id']]:partnercas.append({'goalId':g['id'],'beforeWholePartner':g,'currentWholePartner':G[g['id']]});rr['wholeCanonicalPartnerGoals'][i]=G[g['id']]
 routes.append(rr)
write('blind-inputs/whole-source-cells-and-current-partner-unions.exact.json',{'schemaVersion':1,'role':'Raw complete source cells, current whole canonical partners and full existing mapping unions; no new source approval','routes':routes,'primaryDocuments':raw['primaryDocuments'],'selectionBoundary':raw['selectionBoundary']})
write('checks/BLIND.actual-input-separation-and-current-partner-transport.json',{'role':'Blind-input transport audit only; no scientific votes','exactWholeCopies':copyrows,'removedContextMetadata':['currentStrictCompletionInActualCentral338'],'removedRouteMetadata':['useBoundary'],'sourceCellsAndEdgesUnchanged':True,'onlyCurrentPartnerChangeFromRawRouting':partnercas,'authorFirstOrAssessmentDossiersCopied':False,'reviewerVJudgmentsCopiedIntoBlindInputs':False,'historicalReviewFilesCopiedIntoBlindInputs':False,'QAIsTechnicalInputNotBlindScientificCompanion':True,'allActualPrimaryFilesRemainBound':True})
physical=[]
for basepath,dirs,files in os.walk(H,followlinks=False):
 dirs[:]=[d for d in dirs if not (Path(basepath)/d).is_symlink()]
 physical.extend(Path(basepath)/f for f in files if not (Path(basepath)/f).is_symlink())
bytes_=sum(p.stat().st_size for p in physical);assert bytes_<80*1024*1024
write('checks/HOST.actual-sparse-sixteen.json',{'host':str(H.relative_to(R)),'physicalStockModules':31,'physicalDataAliases':len(mp['aliases']),'physicalSelectedPublicImages':15,'readOnlyGlobalAssetReferences':434,'physicalRegularFiles':len(physical),'physicalRegularBytes':bytes_,'maxBytes':80*1024*1024,'fullTreeCopies':0,'earlierHostWrites':0,'activeWrites':0,'newScientificVotes':0})
write('INPUTS.technical-native16-preparation.original-physical-selector.json',{'schemaVersion':1,'role':'Technical normal input provenance, not blind scientific reading list','authorSelector':art(AUTHOR/'INPUTS.final-equilibrium-redox-kinetics16-whole-material.author-selector.json'),'authorSeal':art(AUTHOR/'FILES.finite-whole-material-author.seal.json'),'current338Map':art(BASE),'canonical':art(can),'semantic':art(sem),'normalV1':art(v),'rawAuthorProfiles':art(AUTHOR/'candidate/sixteen-unreviewed-E0G0.author-profiles.jsonl'),'goalIds':ids,'sourcePrimaryDocuments':raw['primaryDocuments'],'newVotes':0})
print(json.dumps({'host':str(H.relative_to(R)),'physicalBytes':bytes_,'physicalModules':31,'selectedPhysicalImages':15,'ordinaryGoals':422,'sourceAssetRows':434,'sourceQAOther437Exact':True,'blindSourceCopiesOnly':True}))
