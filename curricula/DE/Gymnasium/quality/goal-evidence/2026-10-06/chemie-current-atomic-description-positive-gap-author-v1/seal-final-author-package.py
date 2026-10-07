import pathlib,json,hashlib,datetime
R=pathlib.Path('.');P=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/chemie-current-atomic-description-positive-gap-author-v1'
F=P/'description-positive-gap-author-v1.final.freeze.json';assert not F.exists(),'Immutable package; use a new continuation'
def read(p):return json.loads(p.read_text())
def sha(p):return 'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest()
def bind(p):return {'path':str(p),'sha256':sha(p),'bytes':p.stat().st_size}
df=read(P/'native-d-stage-v1.final.freeze.json')
for b in df['files']:assert sha(R/b['path'])==b['sha256'],b['path']
externalDrift=[]
for b in df['externalNativeInputBindings']:
 if sha(R/b['path'])!=b['sha256']:externalDrift.append(b['path'])
assert not externalDrift,externalDrift
scope=read(P/'current-amv-gap-and-selected-fifteen.author-readiness.json');before=read(P/'actual-inputs.before-native-preparation.json')
canonical=R/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json';now=read(canonical);gs={g['id']:g for g in now['goals']}
for row in scope['rows']:assert gs[row['goalId']]==row['wholeCurrentGoal']
for id,d in before['protected112WholeGoalDigests'].items():assert 'sha256:'+hashlib.sha256(json.dumps(gs[id],sort_keys=True,ensure_ascii=False,separators=(',',':')).encode()).hexdigest()==d,id
baselineChemEntry=read(P/'actual-current378-national359-subset15-page-source-context-bindings.json')['actualCurrentSubjectRegistryConfig']
registry=R/'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json';currentChemEntry=next(s for s in read(registry)['subjects'] if s['subject']=='chemie');assert currentChemEntry==baselineChemEntry
tech=read(P/'native-fifteen-current-positive-schema-material-binding-checks.actual.json');assert tech['nativeCheckerCounts']=={'approved':0,'needsHumanReview':15,'rejected':0};assert tech['nativeCheckerErrors']==[]
materials=read(P/'thirty-complete-materials.de-en.author-candidates.json')['materials'];specs=read(P/'fifteen-positive-profile-specifications.author-candidates.json')['goals'];profiles=[json.loads(l) for l in (P/'positive-evidence.fifteen.author-candidates.review.jsonl').read_text().splitlines() if l.strip()]
assert len(materials)==30 and len(specs)==15 and len(profiles)==15
assert all(p['status']=='needs_human_review' and p['reviewAuthority']=='ai_candidate' and p['evidenceLevel']=='E1' and p['maximumClaimScope']=='G1' and not p['reviewRunIds'] for p in profiles)
for row in tech['rows']:
 for b in row['actualAssetBindings']:assert sha(R/b['path'])==b['sha256']
protectedOtherCanon=[b for b in before['files'] if '/canonical/' in b['path'] and 'BIOLOGIE' not in b['path']]
# Original current inputs are preserved as inputs; no historical fixture is rewritten.
critical=[b for b in before['files'] if ('CHEMIE.de.json' in b['path'] or 'chemie.semantic-kinds.json' in b['path'] or 'chemie.qa.json' in b['path'])]
assert all(sha(R/b['path'])==b['sha256'] for b in critical)
otherCanonBindings=[]
for name in ['MATHEMATIK','PHYSIK']:
 p=R/('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_'+name+'.de.json');otherCanonBindings.append(bind(p))
receipt={'schemaVersion':1,'createdAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'role':'AUTHOR final actual preservation and candidacy check, no independent approval','immutableDStage':bind(P/'native-d-stage-v1.final.freeze.json'),'frozenDStageFilesStillExact':len(df['files']),'currentSourceAtlas103InputBindingsStillExact':True,'all15CurrentWholeGoalPayloadsExact':True,'currentChemistryCanonicalKindsVisualizationQaExactBeforeAfter':True,'activeChemistryRegistryEntryUnchanged':True,'protected112WholeGoalPayloadsExact':True,'protectedOtherSubjectCanonActualReadOnlyBindings':otherCanonBindings,'currentFullCanonicalReviewPages':378,'nationalSourceAtlasPages':359,'subsetReviewPages':15,'sourceScopeWholeNationalApproval':False,'actualMaterialBodies':30,'actualProfiles':15,'nativeMaterializerAndFullProfileChecker':'PASS15','nativeAtomicityConfigsActualProductionChecks':'PASS3; 8/15/28 scoped atoms, no stale or missing records','candidateStatusCounts':tech['nativeCheckerCounts'],'independentMaterialAndProfileReviews':'PENDING','independentDescriptionReviews':'PENDING_SEPARATE_ROLES','newScientificClosures':0,'restoredActiveBindings':0,'strictNetGain':0,'humanApproval':False,'humanTrial':False,'actualLearnerEvidence':False,'activeWrites':False,'gitOperations':False,'publicationOrDeployment':False,'fullBuildOrGlobalQS':False}
(P/'final-author-preservation-and-candidacy.actual.json').write_text(json.dumps(receipt,ensure_ascii=False,indent=2)+'\n')
files=sorted(p for p in P.rglob('*') if p.is_file() and p!=F)
freeze={'schemaVersion':1,'createdAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'packageRole':'AUTHOR inactive current fifteen actual materials/nativeDdualinputs/Pv2 profiles; independent science reviews pending','immutableDStageFreeze':bind(P/'native-d-stage-v1.final.freeze.json'),'scopeGoalIds':scope['scopeGoalIds'],'currentChemistryStrictBaseline':112,'currentChemistryAtomicDenominator':378,'currentAMVWithoutDPGapCount':85,'frozenFileCount':len(files),'frozenBytes':sum(p.stat().st_size for p in files),'newScientificClosures':0,'restoredActiveBindings':0,'strictNetGain':0,'humanApproval':False,'humanTrial':False,'activeWrites':False,'files':[bind(p) for p in files]}
F.write_text(json.dumps(freeze,ensure_ascii=False,indent=2)+'\n');print(json.dumps({'finalFreeze':str(F),'sha256':sha(F),'files':len(files),'bytes':freeze['frozenBytes'],'DStageStillExact':True,'actualPProfiles':15,'actualMaterials':30,'nativeP':'PASS15','strictGain':0}))
