from pathlib import Path
import json,hashlib,shutil,os,subprocess
R=Path('/home/enpasos/projects/skillpilot');H=Path(__file__).resolve().parent;T=H.parent;G=T/'geometry-four-source-and-guard-followup-20261104-v1';B=G/'check-host';C=H/'check-host';O=H/'post-stage-overlay';A=T/'astra-geometry-four-projection-reuse-final-stage-20261104-v1';N=T/'geometry-four-projection-reuse-native-20261104-v1';Q='curricula/DE/Gymnasium/quality/source-scope-review/mathematik/2026-11-04/geometry-four-projection-reuse/final-acceptance';CAN='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json';POL='app/scripts/config/math-country-seki-stage-policy.json';LAY='app/scripts/config/math-duration-split-spanning-tree-policy.json';LED='curricula/DE/Gymnasium/quality/release-model/mathematik.semantic-kinds.json'
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def read(p):return json.loads(p.read_text())
def put(p,b):p.parent.mkdir(parents=True,exist_ok=True);q=p.with_name(p.name+'.new');q.write_bytes(b);q.replace(p)
def save(p,v):put(p,(json.dumps(v,ensure_ascii=False,indent=2)+'\n').encode())
def both(rel,v):save(C/rel,v);save(O/rel,v)
def install(rel,b):put(C/rel,b);put(O/rel,b)
def pin(p):return{'path':p.relative_to(R).as_posix(),'sha256':sha(p)}
manifestPath=G/'manifest.effective-source-guard-followup.json';assert sha(manifestPath)=='183a61e98de85a48ad70931cdb05a4a61ebfda63439a23d78daa862a008cabd0';base=read(manifestPath);assert len(base['files'])==306
assert sha(A/'review-handoff.json')=='8c6bf6eea94577f4f056923d91284beca1682e1e02b0fa3fc6b157cb5e788734';assert sha(A/'final-review-output-manifest.json')=='4a9ba768ca1e46cba96c777af366930ccbf779ace68e1c7f4f0ea58b2cf65d02';assert sha(A/'portable-export.json')=='5c97dd8bb4ee54f4bf9a5be3b19e236fffffd0918b80d6205637e65a164c2269';handoff=read(A/'review-handoff.json');export=read(A/'portable-export.json');assert len(export['files'])==189
for row in base['files']:assert sha(B/row['path'])==sha(R/row['candidatePath'])==row['candidateSha256']
assert not C.exists()and not O.exists();shutil.copytree(B,C,copy_function=os.link,symlinks=True,ignore=lambda p,n:[x for x in n if Path(p)==B and x in{'.git','tmp'}]);(C/'tmp').mkdir();O.mkdir()
if(B/'.git').exists():shutil.copytree(B/'.git',C/'.git',symlinks=True)
for row in base['files']:put(O/row['path'],(B/row['path']).read_bytes())
basePaths={r['path']for r in base['files']};reviewPaths={r['path']for r in export['files']};overlap=basePaths&reviewPaths;expected={'curricula/DE/Gymnasium/quality/memory-card-review/canonical-math-full.config.json','curricula/DE/Gymnasium/quality/semantic-atomicity/canonical-math-full.config.json'};assert overlap==expected
reviewRows=[]
for row in export['files']:
 rel=row['path'];src=R/row['candidatePath'];assert sha(src)==row['candidateSha256'];assert src==(R/export['candidateRoot']/rel)
 if row.get('beforeSha256')is not None:assert sha(B/rel)==row['beforeSha256'],('Reviewer before differs from effective306',rel)
 else:assert not(B/rel).exists(),('Unexpected reviewer overwrite',rel)
 rootBefore=sha(R/rel)if(R/rel).is_file()else None;assert rootBefore==row.get('rootBeforeSha256'),('Root before changed reviewer leaf',rel)
 install(rel,src.read_bytes());reviewRows.append({'path':rel,'sha256':sha(C/rel),'layer':'genuine-independent-final-review-quality'})
receipt=export['receipt'];stage=read(C/receipt['path']);assert sha(C/receipt['path'])==receipt['sha256']=='97f7dba1cf0a36af2ad911a310b5991ba2516181b280d27f691ccbaf1d72749b';assert stage['verdict']=='PASS'and stage['authorIndependent']is True;assert stage['policySha256']==sha(C/POL)==base['policySha256'];assert stage['layoutPolicySha256']==sha(C/LAY)==base['layoutSha256']
# Genuine source/review manifests and original Native proofs are additive evidence.
for name in ['review-handoff.json','final-review-output-manifest.json','portable-export.json']:install(Q+'/independent-stage/'+name,(A/name).read_bytes())
for name in ['candidate-input-hashes.json','candidate.summary.json','candidate.execution.json','finite-delta.root-verified.actual.json','main-source-hashes.json','runtime-class-hashes.json','runtime-origin.json','input-manifest.json']:install(Q+'/original-native4/'+name,(N/name).read_bytes())
assert sha(N/'candidate-input-hashes.json')=='57a94ebcc308cfc05ce01a0452f91e9cafa6febafcc66c40e028b503cf475cca';assert sha(N/'candidate.json.gz')=='2017f30338bdc5efea5124241c937d9cb2b60d4fbded84b35ad83aed6491d4d2';inputMap=read(N/'candidate-input-hashes.json');assert len(inputMap)==3582;exceptions=handoff['exactPostNativeExistingInputExceptions'];assert{r['path']for r in exceptions}==expected
changes=[]
for rel,digest in inputMap.items():
 assert sha(B/rel)==digest,('Effective306 not Native4 input',rel)
 actual=sha(C/rel)
 if actual!=digest:
  row=next((r for r in exceptions if r['path']==rel),None);assert row and row['native4Sha256']==digest and row['reviewedFinalSha256']==actual,(rel,'unauthorized post-Native difference');changes.append(row)
assert len(changes)==2
rootCheckPaths=['app/scripts/generateCurriculumQualityStatus.ts','app/scripts/testHardLearningRouteValidation.ts','app/scripts/markdownSourceArchives.ts','app/scripts/testMathReviewedAssessmentPlacements.ts','app/scripts/testMathCountrySekICompositionViews.ts','app/scripts/testMathDistanceReflectionStructure.ts'];rootChecks=[]
for rel in rootCheckPaths:assert sha(C/rel)==sha(R/rel);rootChecks.append({'path':rel,'sha256':sha(R/rel),'ownedByThisPayload':False})
for rel in ['scripts/curriculum_completion_inputs.py','scripts/test_curriculum_completion_integrity_report.py']:assert sha(C/rel)==sha(R/rel)
additions=sorted(p.relative_to(O).as_posix()for p in O.rglob('*')if p.is_file()and p.relative_to(O).as_posix()not in inputMap)
boundary={'status':'ACTUAL_G4_POST_GENUINE_STAGE_DIFFERENCES_TO_UNMODIFIED_ORIGINAL_NATIVE4_INPUT_MAP','originalNative4Archive':pin(N/'candidate.json.gz'),'originalNative4InputMap':pin(N/'candidate-input-hashes.json'),'originalInputCount':3582,'unchangedOriginalInputs':3580,'exactReviewedExistingInputDifferences':changes,'allOtherOriginalInputHashesIdentical':True,'additionalQualityEvidencePathsOutsideOriginalNativeMap':additions,'canonicalLedgerAll147ViewsMainSourceGuardPolicyLayoutSourceGeneratorExtractionUnchangedFromOriginalNative4':True,'genuineReviewerAMConfigAndRowsAreQualityOnly':True,'doesNotClaimAll3582InputsBitIdenticalOrAFreshPostReviewNative':True,'freshNativeRuns':0,'rootGitWrites':False};both(Q+'/actual-original-native4-input-differences.json',boundary)
adoption={'status':'ALL189_GENUINE_FINAL_REVIEWER_LEAVES_ADOPTED_BYTE_EXACT_NO_NEW_JUDGMENTS','effective306Manifest':pin(manifestPath),'reviewHandoff':pin(A/'review-handoff.json'),'reviewOutputManifest':pin(A/'final-review-output-manifest.json'),'portableExport':pin(A/'portable-export.json'),'stageReceipt':receipt,'reviewerLeafCount':189,'overlapPathsOnlyTwoAMConfigs':sorted(overlap),'additiveReviewerLeaves':187,'reviewerFiles':reviewRows,'originalNative4MapUnchanged':pin(N/'candidate-input-hashes.json'),'originalRootVerifiedNativeDelta':pin(N/'finite-delta.root-verified.actual.json'),'normalElevenChecksPending':True,'normalQASourcesRootOwnedByteIdentical':rootChecks,'noStagePassAuthoredOrExpanded':True,'noRootGitNativeRuntimeWrites':True};both(Q+'/genuine-final-review-adoption.actual.json',adoption)
oldByPath={r['path']:r for r in base['files']};rows=[]
for p in sorted(O.rglob('*')):
 if not p.is_file():continue
 rel=p.relative_to(O).as_posix();assert sha(C/rel)==sha(p);rootBefore=sha(R/rel)if(R/rel).is_file()else None
 if rel in oldByPath:assert rootBefore==oldByPath[rel]['beforeSha256'],('Root before drift',rel)
 rows.append({'path':rel,'candidatePath':p.relative_to(R).as_posix(),'candidateSha256':sha(p),'beforeSha256':rootBefore,'bytes':p.stat().st_size})
out={'schemaVersion':1,'status':'G4_GENUINE_FINAL_STAGE_ADOPTED_READY_FOR_AGREED_ELEVEN_NORMAL_CHECKS','candidateRoot':O.relative_to(R).as_posix(),'candidateHost':C.relative_to(R).as_posix(),'files':rows,'canonicalSha256':sha(C/CAN),'ledgerSha256':sha(C/LED),'policySha256':sha(C/POL),'layoutSha256':sha(C/LAY),'genuineStageReceipt':{'path':receipt['path'],'sha256':receipt['sha256']},'baseEffective306Manifest':pin(manifestPath),'originalG4Manifest':base['originalG4Manifest'],'guardAmendmentManifest':base['guardAmendmentManifest'],'genuineFinalReviewHandoff':pin(A/'review-handoff.json'),'genuineFinalReviewPortableExport':pin(A/'portable-export.json'),'rootOwnedCheckSources':rootChecks,'rootHeadBeforeImport':subprocess.check_output(['git','rev-parse','HEAD'],cwd=R,text=True).strip(),'nativeDifferenceReport':{'path':Q+'/actual-original-native4-input-differences.json','sha256':sha(C/(Q+'/actual-original-native4-input-differences.json'))},'normalElevenChecks':'PENDING','rootOwnsImportGitAndNative':True,'allPreviousFreezesPreserved':True};save(H/'manifest.quality-stage-adopted.json',out)
config={'baseHost':B.relative_to(R).as_posix(),'canonicalPath':CAN,'ledgerPath':LED,'policyPath':POL,'layoutPath':LAY,'qualityRoot':Q,'stageReceipt':receipt['path'],'baseNative':pin(N/'candidate.json.gz'),'originalNativeInputMap':pin(N/'candidate-input-hashes.json'),'rootQASourceSync':rootChecks,'baseEffectiveManifest':pin(manifestPath)};save(H/'integration-config.json',config)
print(json.dumps({'status':out['status'],'files':len(rows),'reviewerLeaves':189,'overlaps':2,'manifestSha256':sha(H/'manifest.quality-stage-adopted.json'),'nativeUnchangedInputs':3580,'exactNativeExceptions':2}))
