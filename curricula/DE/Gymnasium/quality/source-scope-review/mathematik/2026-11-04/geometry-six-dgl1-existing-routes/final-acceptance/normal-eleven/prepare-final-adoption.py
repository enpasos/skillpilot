from pathlib import Path
import hashlib,json,os,shutil,subprocess
R=Path('/home/enpasos/projects/skillpilot');H=R/'tmp/approach-review-20261101';N=H/'geometry-six-dgl1-final-handoff-20261104-v1';B=H/'geometry-six-dgl1-snapshot-packaging-followup-20261104-v1';A=H/'astra-g5-final-stage-review-20261104-v1';V=H/'geometry-six-dgl1-existing-routes-native-20261104-v2';HEAD='e9f318a5d850da68ad4e7db888b41ea1fec25f2b';sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest();read=lambda p:json.loads(p.read_text())
def write(p,v):
 p.parent.mkdir(parents=True,exist_ok=True);t=p.with_name(p.name+'.new');t.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n');t.replace(p)
def put(root,rel,source):
 target=root/rel
 for parent in reversed(target.parent.parents):
  if parent==root or root in parent.parents:
   assert not parent.is_symlink(),('Directory symlink would escape private host',str(parent))
 target.parent.mkdir(parents=True,exist_ok=True);t=target.with_name(target.name+'.new');shutil.copyfile(source,t);t.replace(target)
def pin(p):return {'path':str(p.relative_to(R)),'sha256':sha(p)}
assert not N.exists();assert subprocess.check_output(['git','rev-parse','HEAD'],cwd=R,text=True).strip()==HEAD
mf=B/'manifest.snapshot-packaging-successor.json';af=A/'manifest.independent-final-review.json';assert sha(mf)=='4c99a20c8ae30d91b74d6610cf0002bc35f15747296fcd2121ac203faf94ffcf';assert sha(af)=='d0ff5010e50b6eb5b1d0c7e7790d7537b926c0fa5cb24f2bb34d6100604ab26e';m=read(mf);a=read(af);assert len(m['files'])==640 and len(a['files'])==15
assert not ({e['path']for e in m['files']}&{e['path']for e in a['files']})
for row in m['files']+a['files']:assert sha(R/row['candidatePath'])==row['candidateSha256'],row['path']
assert sha(V/'candidate-input-hashes.json')=='76855b65857d0edf8a9009ebc81d827efc96ee31dadc06aa86239c9e94d6e71e';assert sha(V/'candidate.json.gz')=='f72905184ef1c9b7ce98b3c9aacdb58d0e45ac5759fe26e4618097d4691b14b3';native=read(V/'candidate-input-hashes.json');assert len(native)==11118
N.mkdir();C=N/'check-host';O=N/'final-reviewed-overlay';O.mkdir();subprocess.run(['cp','--reflink=auto','-a',str(B/'check-host'),str(C)],check=True)
# Materialize the source directory before copying the offered-scope index; no
# write may traverse the predecessor's read-only Root application symlink.
if(C/'app/src').is_symlink():
 target=(C/'app/src').resolve();(C/'app/src').unlink();shutil.copytree(target,C/'app/src',symlinks=True)
for rel,digest in native.items():
 source=V/'candidate-data'/rel;assert sha(source)==digest,rel
 put(C,rel,source)
for row in m['files']+a['files']:
 put(C,row['path'],R/row['candidatePath']);put(O,row['path'],R/row['candidatePath'])
owned=['app/scripts/generateCurriculumQualityStatus.ts','app/scripts/testHardLearningRouteValidation.ts','app/scripts/markdownSourceArchives.ts','app/scripts/testMathReviewedAssessmentPlacements.ts','app/scripts/testMathCountrySekICompositionViews.ts','app/scripts/testMathDistanceReflectionStructure.ts','scripts/curriculum_completion_inputs.py','scripts/test_curriculum_completion_integrity_report.py'];own=[]
for rel in owned:
 put(C,rel,R/rel);own.append({'path':rel,'sha256':sha(R/rel),'ownedByPayload':False})
for rel,digest in native.items():assert sha(C/rel)==digest,('Final host differs from actual Native5 input',rel)
for row in m['files']+a['files']:assert sha(C/row['path'])==sha(O/row['path'])==row['candidateSha256']
assert len([p for p in O.rglob('*') if p.is_file()])==655
stage=a['stageReceipt'];assert sha(C/stage['path'])==stage['sha256']=='aad952551ac28fdc4dcb87e7dd138658ac10846e40d6a75c1118291c67f9792d';receipt=read(C/stage['path']);assert receipt['authorIndependent'] is True
# The private index is prepared before the first source-atlas/goalbook command.
assert not(C/'.git').exists();gitcommands=[]
def git(*argv):
 result=subprocess.run(['git',*argv],cwd=C,capture_output=True,text=True);assert result.returncode==0,(argv,result.stderr);gitcommands.append({'argv':['git',*argv],'exitCode':result.returncode});return result.stdout
beforegit={row['path']:row['candidateSha256']for row in m['files']+a['files']}
git('init','--quiet');alternates=C/'.git/objects/info/alternates';alternates.parent.mkdir(parents=True,exist_ok=True);alternates.write_text(str(R/'.git/objects')+'\n');git('read-tree',HEAD);git('update-ref','HEAD',HEAD);git('add','--force','--',*sorted(beforegit))
assert git('rev-parse','--show-toplevel').strip()==str(C)
assert git('rev-parse','HEAD').strip()==HEAD
tracked=git('ls-files','--cached','--','app/scripts/config/goal-books/de-gym-biology-national-atlas.inputs.json').strip();assert tracked=='app/scripts/config/goal-books/de-gym-biology-national-atlas.inputs.json'
for rel,digest in native.items():assert sha(C/rel)==digest,rel
rootmap={};files=[]
for row in m['files']+a['files']:
 rel=row['path'];root_before=sha(R/rel)if(R/rel).is_file()else None
 if row in m['files']:assert root_before==row['beforeSha256'],('Root before changed',rel)
 rootmap[rel]=root_before;files.append({'path':rel,'candidatePath':str((O/rel).relative_to(R)),'candidateSha256':sha(O/rel),'beforeSha256':root_before,'bytes':(O/rel).stat().st_size})
assert len(files)==655
original=H/'math-geometry-six-dgl1-existing-route-integration-20261104-v1/manifest.source-and-producer-freeze.json';assert sha(original)=='fc2f047ff6d55a772cc65aa1c83a31d76ee36301725da192556fd2765e417f26';old=read(original)
for row in old['files']:
 assert sha(R/row['candidatePath'])==row['candidateSha256'];assert sha(original.parent/'check-host'/row['path'])==row['candidateSha256']
g4=H/'geometry-four-final-handoff-20261104-v1/manifest.final-normal-checks.json';assert sha(g4)=='20460b7a24abee367cc52f3fcc539d57c57ef3fc1803f7f2b1dc89068684eada';g4m=read(g4)
for row in g4m['files']:assert sha(R/row['candidatePath'])==row['candidateSha256'];assert sha(R/row['path'])==row['candidateSha256'],('G4 Root baseline drift',row['path'])
indexproof={'status':'OWN_PRIVATE_GIT_INDEX_PREPARED_BEFORE_FIRST_NORMAL_CHECK','baseRootHead':HEAD,'privateRoot':str(C),'commands':gitcommands,'objectAlternateIsReadOnlyRootObjectSource':str(R/'.git/objects'),'noRootGitWrites':True,'knownMandatoryBiologyAtlasPath':tracked,'all655PayloadAnd11118NativeInputBytesUnchanged':True,'preventsEnclosingRepositoryFallback':True,'notARepairOfFailedCheckThisSequence':True};write(N/'private-check-index.actual.json',indexproof)
plan=H/'space-geometry-four-integration-preparation-20261103-v1/normal-checks.plan.json';shutil.copyfile(plan,N/'agreed-normal-checks.plan.json')
manifest={'schemaVersion':1,'status':'GENUINE_G5_FINAL_STAGE_ADOPTED_READY_FOR_ELEVEN_NORMAL_CHECKS','candidateRoot':str(O.relative_to(R)),'candidateHost':str(C.relative_to(R)),'files':sorted(files,key=lambda e:e['path']),'sourceManifest':pin(mf),'independentFinalReviewManifest':pin(af),'genuineStageReceipt':{'path':stage['path'],'sha256':stage['sha256']},'canonicalSha256':m['canonicalSha256'],'ledgerSha256':m['ledgerSha256'],'policySha256':m['policySha256'],'layoutSha256':m['layoutSha256'],'planSha256':m['planSha256'],'rootOwnedCheckSources':own,'rootHeadBeforeImport':HEAD,'actualNative5Archive':pin(V/'candidate.json.gz'),'actualNative5InputMap':pin(V/'candidate-input-hashes.json'),'actualNative5InputCount':11118,'allNative5InputBytesUnchangedAtFinalAdoption':True,'addedIndependentAcceptanceLeavesOutsideNative5Map':sorted(e['path']for e in a['files']if e['path']not in native),'originalG4And639AndNative4AndFailedNative5AndActualNative5FreezesPreserved':True,'normalChecks':'PENDING','noRootGitWrites':True}
assert len(manifest['addedIndependentAcceptanceLeavesOutsideNative5Map'])==11
write(N/'manifest.quality-stage-adopted.json',manifest);write(N/'integration-config.json',{'qualityRoot':'curricula/DE/Gymnasium/quality/source-scope-review/mathematik/2026-11-04/geometry-six-dgl1-existing-routes/final-acceptance','rootHead':HEAD,'source640Manifest':pin(mf),'review15Manifest':pin(af),'native5Directory':str(V.relative_to(R)),'normalCheckPlan':pin(plan),'rootOwnedCheckSources':own});print(json.dumps({'status':manifest['status'],'payloadLeaves':len(files),'nativeInputsByteEqual':len(native),'privateIndexReady':True,'manifestSha256':sha(N/'manifest.quality-stage-adopted.json')}),flush=True)
