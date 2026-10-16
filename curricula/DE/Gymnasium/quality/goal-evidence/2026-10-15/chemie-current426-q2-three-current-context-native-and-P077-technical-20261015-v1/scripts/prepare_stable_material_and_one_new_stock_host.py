# SPDX-License-Identifier: Apache-2.0
"""Pin final b47 material, preserve exact science, prepare one private host."""
from pathlib import Path
import copy,hashlib,json,shutil
REPO=Path.cwd();OWN=Path(__file__).resolve().parents[1];E=OWN.parent
HOST=REPO/'tmp/chemie-m7-resumed-20261015/current426-q2-native6-P077-own-host-v1'
def load(p):return json.loads(p.read_text())
def ref(p):
 b=p.read_bytes();return {'path':p.relative_to(REPO).as_posix(),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def verify(r):
 p=REPO/r['path'];assert ref(p)==r,p;return p
def put(p,d):
 assert not p.exists(),p;p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
plan=load(OWN/'PREPARED.exact-six-body-composition-and-current-binding-inventory.awaiting-b47.json')
v8=load(verify(plan['V8Selector']));checkpoint=load(verify(plan['checkpointSelector']))
bsp=E/'chemie-b47-glutamate-one-case-synthetic-observations-informed-independent-P1-20261015-v1/OUTPUTS.finite-informed-b47-case2-independent-P1.selector.json'
assert ref(bsp)['sha256']=='sha256:35cdd0158e26134057320b237db4b2e9e93216ef256279c64857067181c0e7ab'
bs=load(bsp)
for r in load(REPO/bs['sealPath'])['files']:verify(r)
pair=load(verify(bs['exactPair']));corrected=load(verify(bs['wholeCorrectedCase']));assert pair['cases'][1]==corrected
routes=load(verify(plan['Q2OriginalSevenRoutes']));b47=next(x for x in routes['wholeCaseRoutes'] if x['goalId']==bs['goalId'])
assert b47['wholeCases'][0]==pair['cases'][0]
b47['wholeCases']=copy.deepcopy(pair['cases']);b47['source']=bs['exactPair'];b47['caseCount']=2
assert sum(x['caseCount'] for x in routes['wholeCaseRoutes'])==7
routes['selectionClarification']='Seven actual full routes:3 assay cases,2 current b47 cases (case1 exact, case2 exact final supplied-fictional-data successor),2 nomenclature cases. Original obsolete case2 remains in its sealed source.'
routes['finalB47Material']=bs['exactPair'];routes['b47MaterialIsFictionalNotMeasured']=True
routep=OWN/'inputs/Q2.final-seven-whole-DEEN-material-rubric-routes.json';put(routep,routes)
profiles=copy.deepcopy(routes['wholeThreeAuthorProfiles'])
profile=next(x for x in profiles if x['goalId']==bs['goalId'])['profile']
oldbrief=copy.deepcopy(profile['applicationCaseBriefs'][1]);newbrief={k:v for k,v in corrected['case'].items() if k in oldbrief}
for lang in ['De','En']:newbrief['taskDemand'+lang]=corrected['case']['materials'+lang]+'\n\n'+corrected['case']['taskDemand'+lang]
assert set(newbrief)==set(oldbrief)
profile['applicationCaseBriefs'][1]=newbrief
rawp=OWN/'profiles/Q2.three-original-author-profiles.exact-successor-material.unbound.json';put(rawp,profiles)
put(OWN/'inputs/B47.brief-literal-material-composition.provenance.json',{'schemaVersion':1,'originalWholeProfile':plan['Q2OriginalSevenRoutes'],'originalObsoleteBrief':oldbrief,'actualFinalWholeMaterial':bs['wholeCorrectedCase'],'literalNewBrief':newbrief,'serializationRule':'All schema brief fields copied literally from corrected case; taskDemand is exact materials + two newlines + exact taskDemand, separately for DE and EN. Other original profile expectations/coverage/variation/case1 retained exactly.','technicalCompositionOnly':True,'newScientificJudgment':False})
canonical=load(verify(plan['canonical']));by={g['id']:g for g in canonical['goals']}
pav=load(verify(plan['PAVSourceSelector']));v2=load(verify(plan['Q2RawV2Original']));assert len(v2['records'])==2
recipe=load(verify(load(verify(plan['authorQ2Selector']))['sparseWholeGoalRecipe']))
images={r['goalId']:r['existingGoodPngToKeep'][0] for r in recipe['goals'] if r['existingGoodPngToKeep']}
qa=load(verify(plan['baselineQA']));qarows={r['goalId']:r for r in qa['records']}
for d in v2['records']:
 gid=d['goalId'];assert d['verdict']=='KEEP' and d['wholeSelectedGoalWithLink']==by[gid];verify(images[gid])
 link=next(l for l in by[gid]['resourceLinks'] if l['type']=='goal-visualization' and l.get('role','primary')=='primary')
 r=qarows[gid];r.update(imageUrl=link['url'],publicAssetPath='app/public'+link['url'],canonicalAssetPath='curricula/DE/Gymnasium/visualizations/'+link['url'].split('/assets/goal-visualizations/',1)[1],assetSha256=images[gid]['sha256'],aiApproved='yes',aiApprovedAssetSha256=images[gid]['sha256'],aiReviewer=v2['reviewer'],aiReviewedAt=v2['observedAtUTC'],aiNotes=json.dumps({'originalFIRST':plan['Q2RawV2Original'],'originalOwnRecord':d,'technicalBoundary':'Original independent V only; no new science or human approval.'},ensure_ascii=False,separators=(',',':')))
qap=OWN/'qa/QA443.exact-V8-plus-two-original-Q2-V.bindings.inactive.json';put(qap,qa)
base_map=load(verify(checkpoint['exactRebuildRecipe']));v8map=load(verify(plan['baseRebuildMap']));modules=v8map['stockPhysicalModules'];assets={r['goalId']:copy.deepcopy(r) for r in v8map['selectedCurrentAssetRows']}
for gid,image in images.items():
 link=next(l for l in by[gid]['resourceLinks'] if l['type']=='goal-visualization' and l.get('role','primary')=='primary')
 assets[gid]={'goalId':gid,'physicalRepositorySource':image,'normalPublicDestination':'app/public'+link['url'],'normalCanonicalDestination':'curricula/DE/Gymnasium/visualizations/'+link['url'].split('/assets/goal-visualizations/',1)[1]}
assert not HOST.exists();HOST.mkdir(parents=True)
for p in REPO.iterdir():
 if p.name not in ['app','tmp','.git']:(HOST/p.name).symlink_to(p,target_is_directory=p.is_dir())
(HOST/'app').mkdir();(HOST/'app/scripts').mkdir();(HOST/'app/public').mkdir()
for p in (REPO/'app').iterdir():
 if p.name not in ['scripts','public']:(HOST/'app'/p.name).symlink_to(p,target_is_directory=p.is_dir())
def branch(p):
 if p.is_symlink():
  entries=list(p.resolve().iterdir());p.unlink();p.mkdir()
  for c in entries:(p/c.name).symlink_to(c,target_is_directory=c.is_dir())
 elif not p.exists():p.mkdir()
def install(src,rel,physical=False):
 p=HOST/rel;par=HOST
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
for a in base_map['aliases']:
 install(verify(a['physicalRepositorySource']),a['normalHostAlias'])
normal_c='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json';normal_s='curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json';normal_q='curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json'
semanticp=OWN/'candidate/semantic570.current426.three-mechanical-source-FPs.inactive.json'
install(verify(plan['canonical']),normal_c,True);install(semanticp,normal_s);install(qap,normal_q,True)
for r in assets.values():
 src=verify(r['physicalRepositorySource']);install(src,r['normalPublicDestination']);install(src,r['normalCanonicalDestination'])
native_root=E/'chemie-bcp-current426-native24-preparation-technical-20261015-v1'
baseconfig=load(native_root/'config/full426.normal-stock-base.config.json')
baseconfig.update(bookId='chemie-current426-Q2-six-source-only-20261015-v1-full-base',title='Chemie – vollständige aktuelle Basis für sechs Seiten',evidenceReviewPaths=[(OWN/'profiles/four-exact-current-candidate-book-inputs.jsonl').relative_to(REPO).as_posix()],outputPath=(OWN/'not-written-full-model.json').relative_to(REPO).as_posix())
basecfgp=OWN/'config/native-six.stock-base.config.json';put(basecfgp,baseconfig)
config=load(native_root/'config/native-bcp-fifteen.normal-stock-prepare.config.json');config.update(batchId='chemie-current426-Q2-three-plus-three-image-contexts-technical-20261015-v1',bookId='chemie-current426-Q2-three-plus-three-image-contexts-technical-20261015-v1',title='Chemie – sechs aktuelle Lernzielkontexte',baseGoalBookConfigPath=basecfgp.relative_to(REPO).as_posix(),goalIds=plan['goalIds'],outputDirectory=(OWN/'native-six').relative_to(REPO).as_posix())
cfgp=OWN/'config/native-six.normal-stock-prepare.config.json';put(cfgp,config)
put(OWN/'INPUTS.final-six-stable-bodies-images-and-successor-material.json',{'schemaVersion':1,'preparation':ref(OWN/'PREPARED.exact-six-body-composition-and-current-binding-inventory.awaiting-b47.json'),'b47FinalSuccessorSelector':ref(bsp),'b47FinalScience':bs['firstFinding'],'b47CompletePair':bs['exactPair'],'currentSevenWholeRoutes':ref(routep),'rawQ2ProfilesBeforeMechanicalFP':ref(rawp),'canonical':plan['canonical'],'semanticOutputPath':semanticp.relative_to(REPO).as_posix(),'visualizationQA':ref(qap),'normalCanonicalPath':normal_c,'normalSemanticPath':normal_s,'normalQAPath':normal_q,'executionHost':HOST.relative_to(REPO).as_posix(),'stockModules':modules,'imageRows':list(assets.values()),'nativeConfig':ref(cfgp),'baseConfig':ref(basecfgp),'finalBookProfilesPath':(OWN/'profiles/four-exact-current-candidate-book-inputs.jsonl').relative_to(REPO).as_posix(),'otherWholeCasesAndRubrics':plan['otherWholeCasesAndRubrics'],'finalQA444Or446Invented':False,'physicalRasterCopies':0,'priorHostWrites':0,'currentP077Source':plan['selectedCurrentPConfigurations'][0]})
put(OWN/'REBUILD.new-six-contexts-and-P077.private-host.initial-map.json',{'schemaVersion':1,'executionHost':HOST.relative_to(REPO).as_posix(),'baselineMap':checkpoint['exactRebuildRecipe'],'stockPhysicalModules':modules,'inheritedAliases':base_map['aliases'],'imageRows':list(assets.values()),'canonical':plan['canonical'],'semanticOutputPath':semanticp.relative_to(REPO).as_posix(),'qa':ref(qap),'physicalRasterCopies':0,'oldHostWrites':0,'activeWrites':0})
print(json.dumps({'privateHosts':1,'imageCopies':0,'NativeScope':6,'Q2Routes':7,'b47Case1Exact':True,'b47ActualFinalMaterialPinned':True,'NativeCalls':0}),flush=True)
