import assert from 'node:assert/strict'
import { readFileSync,writeFileSync,mkdirSync,mkdtempSync,rmSync,copyFileSync,renameSync,symlinkSync } from 'node:fs'
import { resolve,dirname } from 'node:path'
import { tmpdir } from 'node:os'
import { createHash } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { buildApplicabilityCompilation } from './applicabilityCompiler'
import { accountAdmittedCompositionSupplements, readCompositionSupplementCoverage, withSupplementSourceInputSnapshot, mathematicsSourceMaterialContextDigest, supplementQaDigest as digest, SUPPLEMENT_MATH as M, SUPPLEMENT_PHYSICS as P } from './compositionSupplementSourceCoverage'
import { evaluateSelectedPreparationCoverage, generateQualityNativeReport } from './generateCurriculumQualityStatus'
import { collectAuditProblems } from './generateCurriculumSourceCoverageAudit'
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TEST_ONLY_Json=Record<string,any>
// This suite enters ONLY the explicit post-native interface. TEST_ONLY review and
// native result rows are synthetic; this never asserts real scientific/M7 approval.
// Canonical goals, role compiler, Math mapping/extraction and ordinary evidence are real.
const source=resolve(dirname(fileURLToPath(import.meta.url)),'../..'),root=mkdtempSync(resolve(tmpdir(),'TEST_ONLY-selected-source-qa-'))
const sha=(bytes:Buffer|string)=>createHash('sha256').update(bytes).digest('hex')
const json=(p:string)=>JSON.parse(readFileSync(resolve(root,p),'utf8'))
const write=(p:string,value:unknown)=>{const target=resolve(root,p);mkdirSync(dirname(target),{recursive:true});writeFileSync(target,JSON.stringify(value,null,2)+'\n')}
const copy=(p:string)=>{const target=resolve(root,p);mkdirSync(dirname(target),{recursive:true});copyFileSync(resolve(source,p),target)}
const compilation=buildApplicabilityCompilation()
const mathPath='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json',physicsPath='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json'
const kindPath='curricula/DE/Gymnasium/quality/release-model/mathematik.semantic-kinds.json'
const nativeConfigPath='curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'
const physicsKindPath='curricula/DE/Gymnasium/quality/release-model/physik.semantic-kinds.json'
const mappingPath='curricula/DE/Gymnasium/mapping/DE-HE/lower-secondary/hessen_math_lower_secondary_source_extraction_to_canonical_math.review.json'
for(const p of [mathPath,physicsPath,kindPath,physicsKindPath,nativeConfigPath,mappingPath,'curricula/DE/Gymnasium/provenance/canonical-goal-surrogate-evidence-registry.json'])copy(p)
const mapping=json(mappingPath);copy(mapping.sourceExtractionPath)
const scope={schoolForm:'Gymnasium',jurisdiction:'DE-HE',stage:'SekI',durationModel:'G9'}
const regular='4b67bed9-06da-40b2-a306-24e9e7dfd390',inference='d07ef7b1-8bd2-56e0-9e74-d90c3c3e02fe',physicsGoal='4c919da9-157a-5a14-a725-f7343975c9ab'
const math=json(mathPath),goal=math.goals.find((g:TEST_ONLY_Json)=>g.id===regular)
const entry=(goalId:string,projectionRole='target')=>({kind:'goalEntry',goalId,projectionRole})
const view=(id:string,owner:string,children:TEST_ONLY_Json[])=>({viewId:id,landscapeId:owner,scope,rootNodes:[{kind:'structure',id:id+'_root',label:'TEST_ONLY reviewed fixture',children}]})
const mathBase=view('TEST_ONLY_math_base',M,[entry(regular)]),physicsView=view('TEST_ONLY_physics_base',P,[entry(physicsGoal)])
const authored={supplementId:'TEST_ONLY_preparation',label:'TEST_ONLY bounded preparation',reviewPath:'DE/Gymnasium/composition-supplements/mathematik/TEST_ONLY_native_export.review.json'}
const supplementalView=view('supplement:TEST_ONLY_preparation',M,[entry(regular),entry(inference)])
const binding=(p:string)=>({path:p.replace(/^curricula\//,''),sha256:sha(readFileSync(resolve(root,p)))})
const regularPath='curricula/DE/Gymnasium/composition-supplements/mathematik/TEST_ONLY_regular_review.json'
const contextPath='curricula/DE/Gymnasium/composition-supplements/mathematik/TEST_ONLY_whole_context.json'
const sourceId='he-math-seki-g9-6-1-01-f25eef13'
const context={$schema:'https://skillpilot.com/schemas/composition-supplement/v1/whole-mathematics-source-scope-review.schema.json',reviewFormatVersion:'1.0',ownerLandscapeId:M,goalId:regular,goalSha256:digest(goal),scope,decision:'accepted',authorId:'TEST_ONLY_author',reviewerId:'TEST_ONLY_independent_peer',conditions:[],coverageScope:'whole-goal-in-entire-declared-scope',sourceEdition:'TEST_ONLY bound edition interpretation',sourceCohort:'TEST_ONLY whole offering interpretation',contextRestrictionResolution:'TEST_ONLY scientific decision fixture, not an actual accepted source review',sourceContexts:[{sourceGoalId:sourceId,mappingPath,sourceExtractionPath:mapping.sourceExtractionPath,materialContextSha256:mathematicsSourceMaterialContextDigest(root,mappingPath,sourceId)}]}
write(contextPath,context)
const regularReview={$schema:'https://skillpilot.com/schemas/composition-supplement/v1/regular-mathematics-source-review.schema.json',reviewFormatVersion:'1.0',reviewId:'TEST_ONLY_regular_source_review',ownerLandscapeId:M,conditions:[],decision:'accepted',authorId:context.authorId,reviewerId:context.reviewerId,goalId:regular,goalSha256:digest(goal),scope,wholeGoalCoverage:'TEST_ONLY whole-goal source mechanics fixture',reviewEvidence:binding(contextPath),sourceBinding:{sourceId,subject:'Mathematics',edition:context.sourceEdition,cohort:context.sourceCohort,officialUrl:'https://kultus.hessen.de/sites/kultus.hessen.de/files/2021-06/g9-mathematik.pdf',anchor:'Lehrplan Gymnasium G9 Mathematik, G9 6.1 Zahlbereiche',retainedEvidence:binding(mappingPath)}}
write(regularPath,regularReview)
const authoredPath='curricula/DE/Gymnasium/composition-supplements/mathematik/TEST_ONLY.supplement.json';write(authoredPath,authored)
const kindIds=(path:string)=>json(path).decisions.filter((d:TEST_ONLY_Json)=>d.semanticKind==='curricularAtomic').map((d:TEST_ONLY_Json)=>d.goalId)
const ids=kindIds(kindPath),pids=kindIds(physicsKindPath)
assert.equal(ids.length,807);assert.equal(pids.length,478)
const owner=(landscapeId:string,currentGoalIds:string[])=>({landscapeId,denominator:currentGoalIds.length,strictComplete:currentGoalIds.length,currentGoalIds,strictCompleteGoalIds:currentGoalIds,strictCompletionReady:true,requiredChecks:[{id:'TEST_ONLY_explicit_post_native_interface'}]})
const receipt:TEST_ONLY_Json={receiptFormatVersion:'2.0',producerContract:'registered-gymnasium-native-acceptance-v2',report:{subjects:[owner(M,ids),owner(P,pids)]},goals:Object.fromEntries([regular,inference,physicsGoal].map(goalId=>[goalId,{positiveEvidenceOwner:{profileFingerprint:'TEST_ONLY_P',reviewInputFingerprint:'TEST_ONLY_goal_P_binding'}}]))}
const snapshot={receipt,receiptSha256:digest(receipt)}
const goalBinding=(goalId:string)=>({goalId,semanticKind:'curricularAtomic',nativeAcceptanceSha256:digest({receiptSha256:snapshot.receiptSha256,nativeGoal:receipt.goals[goalId]})})
const review:TEST_ONLY_Json={scope,physicsContext:{scope},mathGoalBindings:[goalBinding(regular),goalBinding(inference)],physicsGoalBindings:[goalBinding(physicsGoal)],targetAuthorizations:[{goalId:regular,physicsDependentGoalIds:[physicsGoal],classification:'regular-mathematics-source-backed',regularMathematicsSourceReview:binding(regularPath)},{goalId:inference,physicsDependentGoalIds:[physicsGoal],classification:'reviewed-didactic-mathematics-supplement-motivated-by-physics'}]}
const supplement:TEST_ONLY_Json={id:'TEST_ONLY_preparation',document:supplementalView,scope,physicsScope:scope,targetGoalIds:[regular,inference],physicsDependentGoalIds:[physicsGoal],baseViewSha256:{[mathBase.viewId]:digest(mathBase)},physicsViewSha256:digest(physicsView),authorizationSha256:digest({supplement:authored,review})}
const exported:TEST_ONLY_Json={contractVersion:'registered-composition-supplement-qa-v3',nativeSnapshot:snapshot,orientationContextBindings:{},bundles:[{supplement,authoredDocument:authored,review,mathBaseView:mathBase,physicsView}]}
// Construct the explicit TEST_ONLY post-native export fixture BEFORE accounting.
// Production never refreshes bindings or writes authorization files here. Drift
// controls below call accountCurrent directly and preserve the exported snapshot.
const stagePostNativeTestInputs=(value:TEST_ONLY_Json)=>{
 for(const bundle of value.bundles){
  const primary=bundle.supplement.id==='TEST_ONLY_preparation'
  bundle.authoredPath=primary?authoredPath:'curricula/DE/Gymnasium/composition-supplements/mathematik/'+bundle.supplement.id+'.supplement.json'
  bundle.reviewPath=primary?'curricula/'+authored.reviewPath:'curricula/DE/Gymnasium/composition-supplements/mathematik/'+bundle.supplement.id+'.review.json'
  bundle.authoredDocument.reviewPath=bundle.reviewPath.slice('curricula/'.length)
  bundle.supplement.authorizationSha256=digest({supplement:bundle.authoredDocument,review:bundle.review})
  write(bundle.authoredPath,bundle.authoredDocument);write(bundle.reviewPath,bundle.review)
  bundle.authoredInputBindings={authoredDocument:{path:bundle.authoredPath,sha256:sha(readFileSync(resolve(root,bundle.authoredPath)))},review:{path:bundle.reviewPath,sha256:sha(readFileSync(resolve(root,bundle.reviewPath)))}}
 }
 return value
}
const accountCurrent=(value:TEST_ONLY_Json)=>accountAdmittedCompositionSupplements(root,value,compilation)
const account=(value=exported)=>accountCurrent(stagePostNativeTestInputs(value))
let cases=0;const check=(name:string,fn:()=>void)=>{fn();cases++;console.log('PASS '+name)}
const reject=(name:string,mutate:(value:TEST_ONLY_Json)=>void)=>check(name,()=>{const value=structuredClone(exported);mutate(value);assert.throws(()=>account(value))})
try{
 const empty=mkdtempSync(resolve(tmpdir(),'TEST_ONLY-empty-source-qa-'))
 await readCompositionSupplementCoverage(empty,compilation).then(result=>assert.equal(result,undefined));cases++;console.log('PASS no artifacts skips Java/runtime/engine even when backend is absent');rmSync(empty,{recursive:true,force:true})
 for(const marker of ['SKILLPILOT_SUPPLEMENT_QA_ACTIVE','SKILLPILOT_NATIVE_ADMISSION_ACTIVE']){
  const before=process.env[marker];process.env[marker]='1'
  try{await assert.rejects(readCompositionSupplementCoverage(root,compilation),/recursion blocked/);cases++;console.log('PASS aggregate/native recursion guard '+marker)}finally{if(before===undefined)delete process.env[marker];else process.env[marker]=before}
 }
 await assert.rejects(readCompositionSupplementCoverage(root,compilation),/required repository QA runtime is missing/);cases++;console.log('PASS authored artifacts require actionable missing-runtime failure')
 check('actual compiler data reads bind mapping and provenance inputs',()=>{
  const tracked=withSupplementSourceInputSnapshot(source,buildApplicabilityCompilation)
  assert.equal(digest(tracked.value),digest(compilation))
  assert(tracked.inputs.some(input=>input.kind==='file'&&input.path==='curricula/DE/Gymnasium/provenance/canonical-goal-provenance-registry.json'))
  assert(tracked.inputs.some(input=>input.kind==='file'&&input.path===mappingPath))
  assert(tracked.inputs.some(input=>input.kind==='directory'&&input.path==='curricula/DE/Gymnasium/canonical'))
 })
 check('actual source snapshot rejects changed data and changed absence facts',()=>{
  const path='TEST_ONLY_source_snapshot.json';write(path,{TEST_ONLY:'before'})
  assert.throws(()=>withSupplementSourceInputSnapshot(root,()=>{readFileSync(resolve(root,path));write(path,{TEST_ONLY:'after'})}),/source compilation file drift/)
  const missing='TEST_ONLY_new_resolution.json'
  assert.throws(()=>withSupplementSourceInputSnapshot(root,()=>{try{readFileSync(resolve(root,missing))}catch{/* expected absent read */}write(missing,{TEST_ONLY:'created-after-missing-read'})}),/source compilation absence drift/)
 })
 check('mixed regular and inference remain separate with Math selected:false',()=>{
  const result=account(),config=result.configurations.find(c=>!c.mathBaseSelected)!
  assert.equal(config.totalAuthoredTargetAtomicGoals,2);assert.equal(config.regularSourceBackedAtomicGoals,1);assert.equal(config.reviewedDidacticSupplementAtomicGoals,1);assert.equal(config.targetAuthorizationStatus,'pass')
  assert.equal(config.officialMathematicsObligationsSatisfiedByInference,0);assert.equal(config.officialReverseSourceMappingsAddedByInference,0)
  assert(config.targetFacts.find(f=>f.goalId===inference)!.existingMathematicsSourceCompatibilityEvidence)
  assert(!config.targetFacts.find(f=>f.goalId===inference)!.regularMathematicsSourceCoverageClaim)
  assert.deepEqual(result.canonicalOrdinaryDenominators.map(s=>s.denominator),[807,478])
 })
 check('independent base overlaps supplement target exactly once',()=>{const c=account().configurations.find(c=>c.mathBaseSelected)!;assert.equal(c.totalAuthoredTargetAtomicGoals,2);assert.equal(c.ordinaryBaseTargetAtomicGoals,1);assert.equal(c.additionalSupplementAtomicGoals,1);assert(c.targetFacts.find(f=>f.goalId===regular)!.ordinaryBaseTarget)})
 reject('globally owned Physics dependent outside selected target set rejects',value=>{const b=value.bundles[0];b.physicsView.rootNodes[0].children=[entry(pids.find((id:string)=>id!==physicsGoal)!)];b.supplement.physicsViewSha256=digest(b.physicsView)})
 reject('support-only Physics justification rejects',value=>{const b=value.bundles[0];b.physicsView.rootNodes[0].children=[entry(physicsGoal,'prerequisiteOnly')];b.supplement.physicsViewSha256=digest(b.physicsView)})
 reject('ordinary target promotion outside reviewed supplemental set rejects',value=>{value.bundles[0].supplement.document.rootNodes[0].children.push(entry('01217f4a-5221-5df9-b379-7b241fccf809'))})
 for(const [key,val]of [['schoolForm','TEST_ONLY_other'],['jurisdiction','DE-BY'],['stage','SekII'],['durationModel','G8'],['courseProfile','LK']])reject('exact selected '+key+' boundary',value=>{value.bundles[0].supplement.scope={...scope,[key]:val}})
 reject('stale current native P evidence rejects',value=>{value.bundles[0].review.mathGoalBindings[0].nativeAcceptanceSha256='f'.repeat(64);value.bundles[0].supplement.authorizationSha256=digest({supplement:authored,review:value.bundles[0].review})})
 check('missing or stale whole-source restriction resolution fails closed',()=>{
  const changed=structuredClone(context);changed.sourceContexts[0].materialContextSha256='f'.repeat(64);write(contextPath,changed)
  const rr={...regularReview,reviewEvidence:binding(contextPath)};write(regularPath,rr)
  const value=structuredClone(exported);value.bundles[0].review.targetAuthorizations[0].regularMathematicsSourceReview=binding(regularPath);value.bundles[0].supplement.authorizationSha256=digest({supplement:authored,review:value.bundles[0].review});assert.throws(()=>account(value),/stale whole-source context/)
  write(contextPath,context);write(regularPath,regularReview)
 })
 check('inference cannot turn existing ordinary CQR failure into pass',()=>{const selected=account();const ordinary:Parameters<typeof evaluateSelectedPreparationCoverage>[0]={id:'CQR-003',status:'fail',summary:'TEST_ONLY existing official-source failure',metrics:{totalAtomicGoals:807}};const result=evaluateSelectedPreparationCoverage(ordinary,selected);assert.equal(result.status,'fail');assert.equal(result.metrics!.totalAtomicGoals,807);assert.equal(result.metrics!.officialReverseMappingsAddedByPreparationInference,0);assert.equal(evaluateSelectedPreparationCoverage(ordinary,undefined),ordinary)})
 check('overlapping independent supplements count targets once in each exact configuration',()=>{
  const value=structuredClone(exported),second=structuredClone(value.bundles[0]);second.authoredDocument.supplementId='TEST_ONLY_second';second.supplement.id='TEST_ONLY_second';second.supplement.document.viewId='supplement:TEST_ONLY_second';second.supplement.document.rootNodes[0].id='TEST_ONLY_second_root';second.supplement.authorizationSha256=digest({supplement:second.authoredDocument,review:second.review});value.bundles.push(second)
  const path='curricula/DE/Gymnasium/composition-supplements/mathematik/TEST_ONLY_second.supplement.json';write(path,second.authoredDocument)
  try{const result=account(value);assert.equal(result.configurations.length,6);for(const config of result.configurations){assert.equal(config.totalAuthoredTargetAtomicGoals,2);assert.equal(config.regularSourceBackedAtomicGoals,1);assert.equal(config.reviewedDidacticSupplementAtomicGoals,1)}assert.equal(result.configurations.find(c=>c.selectedSupplementIds.length===2)!.targetFacts[0].selectedSupplementIds.length,2)}finally{rmSync(resolve(root,path))}
 })
 check('ordinary base missing source duty is not repaired by reviewed inference',()=>{
  const value=structuredClone(exported);value.bundles[0].mathBaseView.rootNodes[0].children.push(entry(inference));value.bundles[0].supplement.baseViewSha256[mathBase.viewId]=digest(value.bundles[0].mathBaseView)
  const missing=structuredClone(compilation);missing.reports.find(r=>r.landscapeId===M)!.goals.find(g=>g.goalId===inference)!.evidence=[]
  const result=accountAdmittedCompositionSupplements(root,stagePostNativeTestInputs(value),missing),config=result.configurations.find(c=>c.mathBaseSelected)!
  assert.equal(config.targetAuthorizationStatus,'fail');assert.deepEqual(config.ordinaryTargetSourceObligationMissingGoalIds,[inference]);assert.equal(result.configurations.find(c=>!c.mathBaseSelected)!.targetAuthorizationStatus,'pass')
 })
 check('prospective820 ordinary denominator remains full while selected target union stays bounded',()=>{
  const originalMath=json(mathPath),originalKinds=json(kindPath),value=structuredClone(exported)
  const extra=Array.from({length:13},(_,i)=>'TEST_ONLY_prospective_ordinary_'+i),future=structuredClone(originalMath)
  for(const id of extra)future.goals.push({...goal,id,title:'TEST_ONLY prospective denominator sentinel'})
  const kinds=structuredClone(originalKinds);for(const goalId of extra)kinds.decisions.push({goalId,semanticKind:'curricularAtomic'})
  write(mathPath,future);write(kindPath,kinds)
  const mathOwner=value.nativeSnapshot.receipt.report.subjects.find((s:TEST_ONLY_Json)=>s.landscapeId===M);Object.assign(mathOwner,owner(M,[...ids,...extra]));value.nativeSnapshot.receiptSha256=digest(value.nativeSnapshot.receipt)
  for(const b of value.bundles){for(const binding of [...b.review.mathGoalBindings,...b.review.physicsGoalBindings])binding.nativeAcceptanceSha256=digest({receiptSha256:value.nativeSnapshot.receiptSha256,nativeGoal:value.nativeSnapshot.receipt.goals[binding.goalId]});b.supplement.authorizationSha256=digest({supplement:b.authoredDocument,review:b.review})}
  try{const result=account(value);assert.equal(result.canonicalOrdinaryDenominators.find(s=>s.landscapeId===M)!.denominator,820);assert(result.configurations.every(c=>c.totalAuthoredTargetAtomicGoals===2));Object.assign(mathOwner,owner(M,ids));value.nativeSnapshot.receiptSha256=digest(value.nativeSnapshot.receipt);assert.throws(()=>account(value),/denominator cannot shrink/)}finally{write(mathPath,originalMath);write(kindPath,originalKinds)}
 })
 // Real canonical orientation/Kind/source bytes, explicit TEST_ONLY post-native
 // context. The small fixture is not a genuine admitted teaching closure/bundle.
 const orientation='65365dce-f33f-49d8-9516-42f75883aa86'
 const nativeInput=(path:string)=>({path,kind:'file',sha256:sha(readFileSync(resolve(root,path)))})
 const orientationExport=()=>{
  const value=structuredClone(exported),b=value.bundles[0],r=value.nativeSnapshot.receipt
  r.sourceInputs=[mathPath,kindPath,nativeConfigPath].map(nativeInput)
  r.report.subjects.find((row:TEST_ONLY_Json)=>row.landscapeId===M).landscapePath=mathPath
  value.nativeSnapshot.receiptSha256=digest(r)
  const raw=json(mathPath).goals.find((row:TEST_ONLY_Json)=>row.id===orientation),kind=json(kindPath).decisions.find((row:TEST_ONLY_Json)=>row.goalId===orientation)
  const proof={bindingContract:'registered-math-orientation-context-v1',receiptSha256:value.nativeSnapshot.receiptSha256,landscapeId:M,goalId:orientation,rawGoalSha256:digest(raw),kindDecisionSha256:digest(kind),completionContract:'orientation-binary-completion-v1',canonicalSourceBinding:nativeInput(mathPath),semanticKindSourceBinding:nativeInput(kindPath)}
  value.orientationContextBindings={[orientation]:proof}
  b.supplement.document.rootNodes[0].children.push(entry(orientation));b.supplement.targetGoalIds.push(orientation)
  b.review.reviewFormatVersion='1.1';b.review.mathGoalBindings.push({goalId:orientation,semanticKind:'orientation',orientationContextBindingSha256:digest(proof)})
  b.review.targetAuthorizations.push({goalId:orientation,physicsDependentGoalIds:[physicsGoal],classification:'reviewed-mathematics-orientation-preparation',regularMathematicsSourceCoverageClaim:false,orientationRationale:'TEST_ONLY motivating context only; no performance assessment or real source/native approval',completionContract:'orientation-binary-completion-v1'})
  for(const binding of [...b.review.mathGoalBindings,...b.review.physicsGoalBindings])if(binding.goalId!==orientation)binding.nativeAcceptanceSha256=digest({receiptSha256:value.nativeSnapshot.receiptSha256,nativeGoal:r.goals[binding.goalId]})
  b.supplement.authorizationSha256=digest({supplement:b.authoredDocument,review:b.review});return value
 }
 const rebindAuth=(value:TEST_ONLY_Json)=>{for(const b of value.bundles)b.supplement.authorizationSha256=digest({supplement:b.authoredDocument,review:b.review})}
 const orientationReject=(name:string,mutate:(value:TEST_ONLY_Json)=>void)=>check(name,()=>{
  const value=orientationExport();mutate(value)
  value.nativeSnapshot.receiptSha256=digest(value.nativeSnapshot.receipt)
  for(const proof of Object.values(value.orientationContextBindings) as TEST_ONLY_Json[])proof.receiptSha256=value.nativeSnapshot.receiptSha256
  for(const b of value.bundles)for(const binding of [...b.review.mathGoalBindings,...b.review.physicsGoalBindings]){
   const proof=value.orientationContextBindings[binding.goalId]
   if(proof)binding.orientationContextBindingSha256=digest(proof)
   else if(binding.semanticKind==='curricularAtomic')binding.nativeAcceptanceSha256=digest({receiptSha256:value.nativeSnapshot.receiptSha256,nativeGoal:value.nativeSnapshot.receipt.goals[binding.goalId]})
  }
  rebindAuth(value);assert.throws(()=>account(value))
 })
 check('real canonical orientation is a distinct learnable target without807 denominator promotion',()=>{
  const result=account(orientationExport()),c=result.configurations.find(c=>!c.mathBaseSelected)!
  assert.equal(c.totalAuthoredTargetAtomicGoals,3);assert.equal(c.curricularAtomicTargetGoals,2);assert.equal(c.orientationTargetGoals,1);assert.equal(c.regularSourceBackedAtomicGoals,1);assert.equal(c.reviewedDidacticSupplementAtomicGoals,1);assert.equal(c.unresolvedTargetAtomicGoals,0)
  const fact=c.targetFacts.find(f=>f.goalId===orientation)!;assert.equal(fact.semanticKind,'orientation');assert.equal(fact.regularMathematicsSourceCoverageClaim,false);assert.equal(fact.existingMathematicsSourceCompatibilityEvidence,false);assert(!c.regularSourceClaimStillUnestablishedGoalIds.includes(orientation));assert.deepEqual(result.canonicalOrdinaryDenominators.map(row=>row.denominator),[807,478])
  assert.equal(c.targetAuthorizationStatus,'pass');assert.equal(c.officialMathematicsObligationsSatisfiedByInference,0)
 })
 check('ordinary base orientation plus memory/support retains targets without invented official duties',()=>{
  const value=orientationExport(),b=value.bundles[0],noncontent=json(kindPath).decisions.filter((row:TEST_ONLY_Json)=>['memory','runtimeSupport','practiceAssessment'].includes(row.semanticKind)).map((row:TEST_ONLY_Json)=>row.goalId)
  const leaves=noncontent.filter((id:string)=>!json(mathPath).goals.find((row:TEST_ONLY_Json)=>row.id===id).contains?.length).slice(0,3)
  assert.equal(leaves.length,3);for(const id of [orientation,...leaves])b.mathBaseView.rootNodes[0].children.push(entry(id));b.supplement.baseViewSha256[b.mathBaseView.viewId]=digest(b.mathBaseView)
  const c=account(value).configurations.find(c=>c.mathBaseSelected)!
  assert.equal(c.totalAuthoredTargetAtomicGoals,6);assert.equal(c.curricularAtomicTargetGoals,2);assert.equal(c.orientationTargetGoals,1);assert.equal(c.ordinaryNonCurricularTargetGoals,3);assert.equal(c.ordinaryTargetSourceObligationMissingGoalIds.length,0);assert(!c.regularSourceClaimStillUnestablishedGoalIds.some(id=>[orientation,...leaves].includes(id)));assert.equal(c.targetAuthorizationStatus,'pass')
 })
 orientationReject('orientation cannot reuse content native evidence',value=>{value.bundles[0].review.mathGoalBindings.at(-1).nativeAcceptanceSha256='f'.repeat(64)})
 orientationReject('orientation requires typed current context instead of missing receipt',value=>{delete value.orientationContextBindings[orientation]})
 orientationReject('orientation context cannot carry unknown waiver authority',value=>{value.orientationContextBindings[orientation].unreviewedWaiver=true})
 orientationReject('orientation whole raw Goal drift fails closed',value=>{value.orientationContextBindings[orientation].rawGoalSha256='f'.repeat(64)})
 orientationReject('orientation Kind decision drift fails closed',value=>{value.orientationContextBindings[orientation].kindDecisionSha256='f'.repeat(64)})
 orientationReject('orientation cannot claim official source coverage',value=>{value.bundles[0].review.targetAuthorizations.at(-1).regularMathematicsSourceCoverageClaim=true})
 orientationReject('orientation cannot use graded operation semantics',value=>{value.bundles[0].review.targetAuthorizations.at(-1).mandatoryOperation='TEST_ONLY forbidden graded content'})
 orientationReject('old review version cannot authorize orientation',value=>{value.bundles[0].review.reviewFormatVersion='1.0'})
 orientationReject('orientation binding cannot use another goal context',value=>{value.orientationContextBindings[orientation].goalId=regular})
 orientationReject('orientation proof requires exact registered full-source native input',value=>{value.nativeSnapshot.receipt.sourceInputs=value.nativeSnapshot.receipt.sourceInputs.filter((row:TEST_ONLY_Json)=>row.path!==kindPath)})
 orientationReject('orientation cannot enter native curricularAtomic goal set',value=>{value.nativeSnapshot.receipt.goals[orientation]={TEST_ONLY:'not a content assessment'}})
 orientationReject('other noncontent supplement target is not blanket-authorized',value=>{
  const id=json(kindPath).decisions.find((row:TEST_ONLY_Json)=>row.semanticKind==='memory').goalId,b=value.bundles[0]
  b.supplement.document.rootNodes[0].children.push(entry(id));b.supplement.targetGoalIds.push(id);b.review.mathGoalBindings.push({goalId:id,semanticKind:'memory',orientationContextBindingSha256:'f'.repeat(64)})
 })
 check('orientation current native source fingerprint is independently checked against actual Goal bytes',()=>{
  const value=orientationExport(),before=json(kindPath),changed=structuredClone(before);changed.decisions.find((row:TEST_ONLY_Json)=>row.goalId===orientation).sourceFingerprint='sha256:'+'f'.repeat(64);write(kindPath,changed)
  try{assert.throws(()=>account(value),/stale current Math Kind source/)}finally{write(kindPath,before)}
 })
 const realNativeConfig=JSON.parse(readFileSync(resolve(source,'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'),'utf8'))
 const TEST_ONLY_nativeSubjects=realNativeConfig.subjects.map((subject:TEST_ONLY_Json)=>({subject:subject.subject,issues:subject.subject==='chemie'?['TEST_ONLY retained ordinary blocker']:[]}))
 const TEST_ONLY_admittedNative={schemaVersion:1,reportId:realNativeConfig.reportId,subjects:TEST_ONLY_nativeSubjects.slice(0,2),blockingIssueCount:0} as Parameters<typeof generateQualityNativeReport>[0]
 let TEST_ONLY_otherCalls=0
 const mergedNative=await generateQualityNativeReport(TEST_ONLY_admittedNative,async(_path,_observer,selected)=>{
  TEST_ONLY_otherCalls++;assert.deepEqual([...selected!].sort(),['biologie','chemie','wirtschaftswissenschaften']);return {schemaVersion:1,reportId:realNativeConfig.reportId,subjects:TEST_ONLY_nativeSubjects.slice(2),blockingIssueCount:1} as Awaited<ReturnType<typeof generateQualityNativeReport>>
 })
 check('native Math/Physics reuse preserves every other registered subject and blocker',()=>{assert.equal(TEST_ONLY_otherCalls,1);assert.deepEqual(mergedNative.subjects.map(subject=>subject.subject),realNativeConfig.subjects.map((subject:TEST_ONLY_Json)=>subject.subject));assert.equal(mergedNative.blockingIssueCount,1)})
 await assert.rejects(generateQualityNativeReport(TEST_ONLY_admittedNative,async()=>({...mergedNative,subjects:[]})),/cannot omit or duplicate/);cases++;console.log('PASS native reuse rejects omitted non-Math/Physics subjects')
 check('audit checks selected unresolved targets conjunctively',()=>{const selected=account();selected.configurations[0].targetAuthorizationStatus='fail';selected.configurations[0].unresolvedTargetAtomicGoals=1;assert(collectAuditProblems({curricula:[{title:'TEST_ONLY',totalAtomicGoals:807,jurisdictions:[],selectedMathematicsPreparation:selected}]} as unknown as Parameters<typeof collectAuditProblems>[0]).some(p=>p.includes('lack current authorization')))})

 // Complete post-export drift controls. Real canonical/compiler/source fixtures;
 // explicit TEST_ONLY already-admitted objects. No scientific/native authority.
 const reviewPath='curricula/'+authored.reviewPath
 const testCurrent=()=>stagePostNativeTestInputs(structuredClone(exported))
 const control=(name:string,run:(value:TEST_ONLY_Json)=>void)=>check(name,()=>{
  const value=testCurrent();try{run(value)}finally{rmSync(resolve(root,authoredPath),{force:true});rmSync(resolve(root,reviewPath),{force:true});stagePostNativeTestInputs(structuredClone(exported))}
 })
 control('fixed Java authored and review bytes participate in both report/source snapshots',value=>{
  const tracked=withSupplementSourceInputSnapshot(root,()=>accountCurrent(value))
  assert(tracked.value.configurations.every(row=>row.targetAuthorizationStatus==='pass'))
  for(const [field,path]of [['authoredDocument',authoredPath],['review',reviewPath]]){
   assert(tracked.value.inputBindings.some(row=>row.path===path&&row.sha256===value.bundles[0].authoredInputBindings[field].sha256))
   assert(tracked.inputs.some(row=>row.path===path&&row.kind==='file'&&row.sha256===value.bundles[0].authoredInputBindings[field].sha256))
  }
 })
 control('same-count authored unknown authorization drift rejects',value=>{write(authoredPath,{...json(authoredPath),unknownAuthorization:true});assert.throws(()=>accountCurrent(value),/bytes changed after registered Java export/)})
 control('same-count rejected review drift rejects',value=>{write(reviewPath,{...json(reviewPath),decision:'rejected'});assert.throws(()=>accountCurrent(value),/bytes changed after registered Java export/)})
 control('same-count unresolved review conditions drift rejects',value=>{write(reviewPath,{...json(reviewPath),conditions:['TEST_ONLY_not_accepted']});assert.throws(()=>accountCurrent(value),/bytes changed after registered Java export/)})
 for(const path of [authoredPath,reviewPath])control('raw byte formatting drift rejects '+path,value=>{writeFileSync(resolve(root,path),readFileSync(resolve(root,path),'utf8')+'\n');assert.throws(()=>accountCurrent(value),/bytes changed after registered Java export/)})
 control('missing authored file rejects',value=>{rmSync(resolve(root,authoredPath));assert.throws(()=>accountCurrent(value),/authored path set differs|authored supplement omitted/)})
 control('missing review file rejects',value=>{rmSync(resolve(root,reviewPath));assert.throws(()=>accountCurrent(value),/ENOENT/)})
 control('same-count renamed authored path cannot substitute another discovery',value=>{
  const changed='curricula/DE/Gymnasium/composition-supplements/mathematik/TEST_ONLY_renamed.supplement.json';renameSync(resolve(root,authoredPath),resolve(root,changed))
  try{assert.throws(()=>accountCurrent(value),/authored path set differs/)}finally{rmSync(resolve(root,changed))}
 })
 for(const path of [authoredPath,reviewPath])control('atomic changed-byte replacement rejects '+path,value=>{
  const replacement=resolve(root,'TEST_ONLY_replacement');writeFileSync(replacement,JSON.stringify({...json(path),TEST_ONLY_changed_after_export:true}));renameSync(replacement,resolve(root,path));assert.throws(()=>accountCurrent(value),/bytes changed after registered Java export/)
 })
 control('missing closed byte binding rejects instead of trusting count',value=>{delete value.bundles[0].authoredInputBindings.review;assert.throws(()=>accountCurrent(value))})
 control('exported current binding cannot add arbitrary authorization path',value=>{value.bundles[0].authoredInputBindings.review.path='curricula/../TEST_ONLY_other.json';assert.throws(()=>accountCurrent(value),/path mismatch/)})
 control('review traversal is rejected before reading an unowned path',value=>{value.bundles[0].reviewPath='curricula/../../TEST_ONLY_other.json';value.bundles[0].authoredInputBindings.review.path=value.bundles[0].reviewPath;assert.throws(()=>accountCurrent(value),/noncanonical or escaping/)})
 control('same-byte external review symlink rejects',value=>{
  const outside=mkdtempSync(resolve(tmpdir(),'TEST_ONLY_external_review-')),file=resolve(outside,'review.json');copyFileSync(resolve(root,reviewPath),file);rmSync(resolve(root,reviewPath));symlinkSync(file,resolve(root,reviewPath))
  try{assert.throws(()=>accountCurrent(value),/symbolic (authorization path|authored input)/)}finally{rmSync(resolve(root,reviewPath));rmSync(outside,{recursive:true})}
 })
 for(const path of [authoredPath,reviewPath])control('snapshot-end changed bytes reject after accounting returns '+path,value=>{
  const changed={...json(path),TEST_ONLY_changed_after_accounting:true} // prepare outside snapshot: mutation must not itself create a read binding
  assert.throws(()=>withSupplementSourceInputSnapshot(root,()=>{const result=accountCurrent(value);write(path,changed);return result}),/source compilation file drift/)
 })
 control('snapshot-end same-byte external review symlink rejects before following it',value=>{
  const outside=mkdtempSync(resolve(tmpdir(),'TEST_ONLY_external_late_review-')),file=resolve(outside,'review.json');copyFileSync(resolve(root,reviewPath),file)
  try{assert.throws(()=>withSupplementSourceInputSnapshot(root,()=>{const result=accountCurrent(value);rmSync(resolve(root,reviewPath));symlinkSync(file,resolve(root,reviewPath));return result}),/symbolic (authorization path|authored input)/)}finally{rmSync(resolve(root,reviewPath),{force:true});rmSync(outside,{recursive:true})}
 })

 const bindReviewOutsideArtifacts=(value:TEST_ONLY_Json)=>{
  const bundle=value.bundles[0],path='curricula/DE/Gymnasium/quality/TEST_ONLY_current_export.review.json'
  bundle.reviewPath=path;bundle.authoredDocument.reviewPath=path.slice('curricula/'.length)
  write(authoredPath,bundle.authoredDocument);write(path,bundle.review)
  bundle.authoredInputBindings={authoredDocument:{path:authoredPath,sha256:sha(readFileSync(resolve(root,authoredPath)))},review:{path,sha256:sha(readFileSync(resolve(root,path)))}}
  bundle.supplement.authorizationSha256=digest({supplement:bundle.authoredDocument,review:bundle.review});return path
 }
 control('currently owned declared review outside artifact directory remains supported',value=>{
  const path=bindReviewOutsideArtifacts(value)
  try{assert(accountCurrent(value).configurations.every(row=>row.targetAuthorizationStatus==='pass'))}finally{rmSync(resolve(root,path),{force:true})}
 })
 control('declared review outside artifact directory still rejects external symlink',value=>{
  const path=bindReviewOutsideArtifacts(value),outside=mkdtempSync(resolve(tmpdir(),'TEST_ONLY_external_declared_review-')),file=resolve(outside,'review.json');copyFileSync(resolve(root,path),file);rmSync(resolve(root,path));symlinkSync(file,resolve(root,path))
  try{assert.throws(()=>accountCurrent(value),/symbolic authorization path/)}finally{rmSync(resolve(root,path),{force:true});rmSync(outside,{recursive:true})}
 })
 control('snapshot-end declared review outside artifact directory remains owned',value=>{
  const path=bindReviewOutsideArtifacts(value),outside=mkdtempSync(resolve(tmpdir(),'TEST_ONLY_external_late_declared_review-')),file=resolve(outside,'review.json');copyFileSync(resolve(root,path),file)
  try{assert.throws(()=>withSupplementSourceInputSnapshot(root,()=>{const result=accountCurrent(value);rmSync(resolve(root,path));symlinkSync(file,resolve(root,path));return result}),/symbolic authorization path/)}finally{rmSync(resolve(root,path),{force:true});rmSync(outside,{recursive:true})}
 })
 control('same-byte owned replacement retains the same exact file content authority',value=>{
  const tracked=withSupplementSourceInputSnapshot(root,()=>{const result=accountCurrent(value),replacement=resolve(root,'TEST_ONLY_same_byte_replacement');copyFileSync(resolve(root,reviewPath),replacement);renameSync(replacement,resolve(root,reviewPath));return result})
  assert(tracked.value.configurations.every(row=>row.targetAuthorizationStatus==='pass'))
 })
 console.log(`${cases} selected-source QA regression cases passed; TEST_ONLY post-native interface, no scientific/native approval claim`)
}finally{rmSync(root,{recursive:true,force:true})}
