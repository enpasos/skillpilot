from pathlib import Path
from copy import deepcopy
import hashlib,json,os,shutil,uuid,gzip
R=Path('/home/enpasos/projects/skillpilot');H=Path(__file__).resolve().parent;T=H.parent
G=T/'statistics-pyramid-existing-route-producer-bindings-20261104-v1';B=G/'check-host';C=H/'check-host';O=H/'overlay'
P=T/'geometry-projection-fixpoints-vectorproduct-four-whole-forms-20261104-v1';W=T/'astra-geometry-projection-fixpoints-vectorproduct-four-review-20261104-v1'
CAN='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json';LED='curricula/DE/Gymnasium/quality/release-model/mathematik.semantic-kinds.json';POL='app/scripts/config/math-country-seki-stage-policy.json';LAY='app/scripts/config/math-duration-split-spanning-tree-policy.json';PLAN='curricula/DE/Gymnasium/assessments/mathematik/contextual-terminal-assessments-2026-11-04-v1/finite-scope-operations.json'
ART='curricula/DE/Gymnasium/assessments/mathematik/geometry-four-projection-reuse-2026-11-04-v1';Q='curricula/DE/Gymnasium/quality/source-scope-review/mathematik/2026-11-04/geometry-four-projection-reuse';AUTHOR=Q+'/author-exact-geometry-four-integration.json';ALLOW=Q+'/exact-separate-assessment-placement.json';REVIEW=ART+'/reviews/review-handoff.json';STAGE='curricula/DE/Gymnasium/quality/source-scope-review/mathematik/2026-11-04/stage-scope-implementation-geometry-four-projection-reuse.review.json'
SAME=['803d910d-96d1-5118-b9ca-29e93d0da76d','d3c42193-f1b7-5c6d-a991-bf034d99359f','7bb3c312-f714-55e6-a31f-f31605a93760'];ORD='5748633c-113f-5ea8-9041-24da55919de7';E3='e3c70a12-7886-51f7-8bcd-ed54865415d6';NEW=str(uuid.uuid5(uuid.NAMESPACE_URL,'skillpilot:canonical-math:assessment:geometry-coordinate-projections-by-lk:2026-11-04:v1'))
N=T/'statistics-pyramid-existing-route-native-20261104-v1/candidate.json.gz'
def read(p):return json.loads(p.read_text())
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def put(p,b):p.parent.mkdir(parents=True,exist_ok=True);t=p.with_name(p.name+'.new');t.write_bytes(b);t.replace(p)
def save(p,v):put(p,(json.dumps(v,ensure_ascii=False,indent=2)+'\n').encode())
def install(rel,b):put(C/rel,b);put(O/rel,b)
def both(rel,v):install(rel,(json.dumps(v,ensure_ascii=False,indent=2)+'\n').encode())
def pin(rel):return {'path':rel,'sha256':sha(C/rel)}
assert sha(G/'manifest.final-normal-checks.json')=='a9dc13539a66e124b7ebb21e29211ad6382bbba189899460c8c296e4269af307'
for row in read(G/'manifest.final-normal-checks.json')['files']:assert sha(B/row['path'])==row['candidateSha256']
assert sha(B/CAN)=='30c95213b0a6b7debc6b9a470c924c31cc7b733612bc11cf3e559d394dcdc891';assert sha(R/CAN)==sha(B/CAN)
assert sha(B/LED)=='dda509e859d9a936d30b7f5dd9e0470e81efec8b7290850359f732f6f75a8c7d'
assert sha(B/POL)=='795a97e647d335c3a9edf341f067131b16318163992dec0d84f622f8e69f3587';assert sha(B/LAY)=='daa70c1b77ad9092982fe9ef304d02a1e5d38669e4ecf45ac971f46c3f55de86'
assert sha(P/'review-input-manifest.json')=='481ac457449b2a2f62ddd90b62c14f9631e7b09706c88d0bdd03c50c14cee434';assert sha(W/'review-handoff.json')=='7dd5e3e75c289c0b994e4d53bc65ace0971bc4b112b46600c956374a22376049'
for row in read(P/'review-input-manifest.json')['files']:assert sha(P/row['path'])==row['sha256']
for row in read(P/'review-input-manifest.json')['externalInputBindings']:assert sha(R/row['inputRoot']/row['path'])==row['sha256']
assert sha(N)=='e0b466350b58395c0440a8b1af837044ee143c6bbb36d5f8c5a3a6a2f65708ab'
assert not C.exists() and not O.exists();shutil.copytree(B,C,copy_function=os.link,symlinks=True,ignore=lambda p,n:[x for x in n if Path(p)==B and x in{'.git','tmp'}]);(C/'tmp').mkdir();O.mkdir()
if(B/'.git').exists():shutil.copytree(B/'.git',C/'.git',symlinks=True)
qa=[]
for rel in ['app/scripts/generateCurriculumQualityStatus.ts','app/scripts/testHardLearningRouteValidation.ts','app/scripts/markdownSourceArchives.ts','app/scripts/testMathReviewedAssessmentPlacements.ts','app/scripts/testMathCountrySekICompositionViews.ts','app/scripts/testMathDistanceReflectionStructure.ts']:
 assert sha(R/rel)==sha(B/rel);qa.append({'path':rel,'sha256':sha(R/rel),'ownedByThisPayload':False})
for row in read(P/'review-input-manifest.json')['files']:install(ART+'/whole-source/'+row['path'],(P/row['path']).read_bytes())
install(ART+'/whole-source/review-input-manifest.json',(P/'review-input-manifest.json').read_bytes())
for p in sorted(W.iterdir()):
 if p.is_file():install(ART+'/reviews/'+p.name,p.read_bytes())
before=read(B/CAN);after=deepcopy(before);goals={g['id']:g for g in after['goals']};assert NEW not in goals
for gid in SAME:
 g=goals[gid];assert not g.get('examData');g['nodeKind']='exam';ed=deepcopy(read(P/gid/'whole-form-content.draft.json')['examDataContent']);ed.update({'reviewStatus':'released','reviewNote':'Genuine independent whole-content review accepted conditionally on 2026-11-04; exact same-ID role, semantic-ledger and final fingerprint/source/scope bindings await independent implementation Stage. One ordinary 20/15 binary result; no prerequisite or coverage mastery writes.','sourceArtifactPath':ART+'/forms/'+gid+'.exam-data.json'});g['examData']=ed;both(ed['sourceArtifactPath'],ed)
goals[ORD]['requires']=['075f1ef2-6860-4b20-9df2-878157eb395e'];goals[E3]['requires'].append(ORD);goals[E3]['examData']['coveredGoalIds'].append(ORD)
ed=deepcopy(read(P/ORD/'whole-form-content.draft.json')['examDataContent']);ed.update({'reviewStatus':'released','reviewNote':'Whole DE/EN content genuinely reviewed on 2026-11-04; new ID and exact four BY-LK/union target pairs are author proposals awaiting independent implementation Stage. This SkillPilot-authored assessment is not an assertion of a new universal official BY/HE curriculum requirement. One ordinary 20/15 result only.','sourceArtifactPath':ART+'/forms/'+NEW+'.exam-data.json'})
new={'id':NEW,'title':'Prüfung: Koordinatenansichten und schrägen Schatten einer Konstruktion deuten','titleEn':'Assessment: Interpret coordinate views and an oblique shadow of a construction','description':'Die lernende Person kann in einer vollständigen SkillPilot-Prüfungsaufgabe Punkte, Geraden und eine Dreiecksfläche auf Koordinatenebenen projizieren, die Bildmengen geometrisch deuten und eine orthogonale Ansicht von einem schrägen Schatten unterscheiden.','descriptionEn':'The learner can project points, lines and a triangular surface onto coordinate planes in a complete SkillPilot assessment, interpret the image sets geometrically and distinguish an orthogonal view from an oblique shadow.','weight':1,'tags':['LK','canonical','Practice','Assessment'],'contains':[],'requires':[ORD,'effe43eb-cabe-56cb-a228-35887d7915c1'],'dimensionTags':deepcopy(goals[ORD]['dimensionTags']),'applicability':{'jurisdiction':['DE-BY'],'courseProfile':['LK']},'extendedData':{'applicabilityMappingInheritance':'boundary'},'sourceRef':ART+'/README.md','type':'atomic','nodeKind':'exam','examData':ed}
new['dimensionTags']['topicCode']='CANONICAL.MATH.SEK2.Q2.PRACTICE.BY_COORDINATE_PROJECTION_VIEWS';after['goals'].append(new);goals[NEW]=new;both(ed['sourceArtifactPath'],ed);both(CAN,after)
fig=read(P/'solution-figure-boundary.json');install(fig['futurePublicPath'],(P/fig['sourcePng']).read_bytes());assert sha(C/fig['futurePublicPath'])==fig['pngSha256']
# New target placement: two existing authored LK source views, their two ordinary unions; no canonical contains mutation.
views={read(p)['viewId']:(p,read(p)) for p in (B/'curricula/DE/Gymnasium/composition-views/mathematik').glob('*.json')};ops=[];rules=[]
for vid,anchor in [('de-by-gym-sekii-math-lk','lk-sek-ii-only-q2'),('de-by-gym-math-lk','lk-sek-ii-q2')]:
 p,v=views[vid];op={'id':'geometry-four-coordinate-projection-'+vid,'viewId':vid,'goalIds':[NEW],'action':'include-target','anchorStructureId':anchor,'label':'SkillPilot-Prüfung: Koordinatenansichten und schräger Schatten','sourceDecision':AUTHOR+'#separate574'};ops.append(op);rules.append({'viewId':vid,'scope':v['scope'],'operation':op,'baselineView':{'path':p.relative_to(B).as_posix(),'sha256':sha(p)}})
plan=deepcopy(read(B/PLAN));oldplan=read(B/PLAN);unionRules=[]
for pair in plan['combinedMaterializations']:
 if any(v in [r['viewId']for r in rules] for v in pair['sourceViewIds']):unionRules.append({k:deepcopy(pair[k])for k in ['outputViewId','scope','scopeRows','sourceViewIds']})
assert len(unionRules)==2
pairs=['DE-BY/SekII/G9/LK','DE-BY/SekII/G9/GK+LK','DE-BY/CrossStage/G9/LK','DE-BY/CrossStage/G9/GK+LK']
allow={'schemaVersion':1,'kind':'exact-reviewed-content-conditional-geometry-placement','status':'AUTHOR_PROPOSED_EXACT_ID_AND_SCOPE_AWAITING_IMPLEMENTATION_STAGE','contentReview':pin(REVIEW),'newAssessmentId':NEW,'ordinaryGoalId':ORD,'sameIdAssessmentGoalIds':SAME,'requires':new['requires'],'coveredGoalIds':[ORD],'approvedTargetScopePairs':pairs,'sourceRules':rules,'combinedRules':unionRules,'globalApplicabilityFromRequires':False,'positiveReferenceShape':{'kind':'goalEntry','goalId':NEW},'noOtherNewReferencesOrMasks':True}
both(ALLOW,allow)
for op in ops:
 plan['assessmentScopeOperations'].append(deepcopy(op));plan['bindings'].append({'originalGoalId':ORD,'newAssessmentId':NEW,'scopeOperation':deepcopy(op),'assessmentIdentityAlreadyExists':False,'supportingActualSingleViewGapScopes':[s for s in pairs if s.endswith('/LK')and ('/SekII/'in s)==('sekii'in op['viewId'])],'exactFourScopeBinding':pin(ALLOW),'identityAndIndependentDecisionBindingPending':True})
plan['counts']['individualTaskReferences']+=2;plan['counts']['individualProxyReferences']+=2;plan['counts']['newAssessmentIdentities']+=1;plan['counts']['separateAssessmentTargetPairs']+=4;plan['counts']['totalReplacementTargetPairs']+=4
plan['geometryFourAssessmentPlacement']=pin(ALLOW);plan['independentDecisionBindings'].append(pin(REVIEW));both(PLAN,plan)
policy=read(B/POL);policy['assessmentScopeOperations']+=deepcopy(ops);policy['revision']='geometry-four-projection-reuse-20261104-v1';policy['reviewReceiptPath']=STAGE;both(POL,policy)
readme='''# Geometry four and genuine projection reuse\n\nSkillPilot-authored tasks, solutions, rubrics and solution figure: CC-BY-4.0, SkillPilot contributors, 2026. The retained official curriculum passages/PDF references retain their original rights.\n\nThe independent content review accepts three same-ID forms, the common-preparation correction of ordinary 574 and actual scored point-projection reuse of existing e3. New assessment %s is deliberately authored only for four existing Bavarian LK/union SekII/CrossStage G9 gaps. Its coordinate-view form and parameter-line prerequisite are SkillPilot preparation/assessment choices. This adds no official Bavarian universal object-variant claim and no extra Hessian assessment obligation. Target membership does not establish a learner's elective selection.\n\nExact final identity, roles, scope, producer guards and hashes await genuine implementation Stage. No new Stage receipt or Native result is asserted.\n'''%NEW
install(ART+'/README.md',readme.encode())
cfg={'baseHost':str(B.relative_to(R)),'baseManifest':{'path':str((G/'manifest.final-normal-checks.json').relative_to(R)),'sha256':sha(G/'manifest.final-normal-checks.json')},'baseNative':{'path':str(N.relative_to(R)),'sha256':sha(N)},'canonicalPath':CAN,'ledgerPath':LED,'policyPath':POL,'layoutPath':LAY,'planPath':PLAN,'artifactRoot':ART,'qualityRoot':Q,'authorPath':AUTHOR,'allowancePath':ALLOW,'roleReviewPath':REVIEW,'stageReceipt':STAGE,'newAssessmentId':NEW,'sameIdAssessmentIds':SAME,'ordinaryGoalId':ORD,'existingReuseAssessmentId':E3,'sourceOperations':ops,'approvedNewTargetScopePairs':pairs,'rootQASourceSync':qa}
save(H/'integration-config.json',cfg)
both(Q+'/exact-fieldwise-merge.actual.json',{'status':'AUTHOR_EXACT_WHOLE_FORM_INTEGRATION_CONTENT_CONDITIONAL_STAGE_PENDING','baseManifest':cfg['baseManifest'],'baseNative':cfg['baseNative'],'contentReview':pin(REVIEW),'newAssessmentId':NEW,'sameIdAssessmentGoalIds':SAME,'changedExistingGoalIds':SAME+[ORD,E3],'all807CurricularIdentitiesPreserved':True,'existingRawRolesAndAllContainsUnchanged':True,'onlyExistingRequiresChanges':{ORD:goals[ORD]['requires'],E3:goals[E3]['requires']},'existingE3CoverageSeparateAddition':ORD,'allOtherGoalsWholeEqual':True,'previous773PolicyOpsAnd411FiniteOpsAnd12IdentitiesPreserved':True,'additionalSourceOperations':ops,'newTargetScopePairs':pairs,'noRootGitNativeLearnerWrites':True})
print(json.dumps({'status':'PRIVATE_G4_FINITE_FIELDS_READY_BINDINGS_PENDING','newAssessmentId':NEW,'goals':len(after['goals']),'policyOps':len(policy['assessmentScopeOperations']),'finiteOps':len(plan['assessmentScopeOperations'])}))
