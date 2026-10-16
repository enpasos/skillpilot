import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { existsSync, lstatSync, readFileSync, readdirSync, realpathSync } from 'node:fs'
import { isAbsolute, relative, resolve, sep } from 'node:path'
import { spawnSync } from 'node:child_process'
import { createRequire, syncBuiltinESMExports } from 'node:module'
import type { SkillLandscape } from '../src/landscapeTypes'
import type { DeepUnderstandingRolloutReport } from './reportDeepUnderstandingRollout'
import { fingerprintSemanticKindSourceGoal, type GoalBookModel } from './goalBookModel'
import { normalizeCanonicalLandscape } from '../src/utils/authoring/canonicalAuthoring'
import { normalizeCompositionView, compileCompositionView } from '../src/utils/authoring/compositionViewAuthoring'
import { collectAuthoritativeTargetAtomicGoalIds } from './compositionViewSourceCoverage'
import { buildGoalBookOriginalSources } from './goalBookOriginalSources'
import { hasDirectSourceCoverageEvidence, createReviewedRequiresClosureCoverageChecker, sourceCoverageSurrogateKey } from './sourceCoverageEvidence'
import { buildApplicabilityCompilation } from './applicabilityCompiler'

export const SUPPLEMENT_MATH='68a8ac50-f5f5-4e24-8aa9-5e408ca01ced'
export const SUPPLEMENT_PHYSICS='7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a'
const CONTRACT='registered-composition-supplement-qa-v3'
const PREFIX='SKILLPILOT_SUPPLEMENT_QA_V3='
const ACTIVE='SKILLPILOT_SUPPLEMENT_QA_ACTIVE'
// The fixed Java bridge validates heterogeneous authored JSON against closed
// schemas. This internal read/accounting alias grants no source/native authority.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row=Record<string,any>
type Compilation=ReturnType<typeof buildApplicabilityCompilation>
export interface SupplementalTargetFact {
  goalId:string
  semanticKind:string
  ordinaryBaseTarget:boolean
  selectedSupplementIds:string[]
  classification:'regular-mathematics-source-backed'|'reviewed-didactic-mathematics-supplement-motivated-by-physics'|'orientation-target'|'ordinary-non-curricular-target'|'unresolved'
  existingMathematicsSourceCompatibilityEvidence:boolean
  regularMathematicsSourceCoverageClaim:boolean
  authorizations:{supplementId:string,classification:string,physicsDependentGoalIds:string[],nativeContextBindingSha256:string,regularMathematicsSourceReview?:{path:string,sha256:string}}[]
}
export interface SupplementalConfigurationCoverage {
  configurationId:string
  ownerLandscapeId:string
  scope:Record<string,string>
  physicsScope:Record<string,string>
  mathBaseSelected:boolean
  mathBaseViewId:string
  physicsViewId:string
  selectedSupplementIds:string[]
  totalAuthoredTargetAtomicGoals:number
  ordinaryBaseTargetAtomicGoals:number
  selectedSupplementTargetAtomicGoals:number
  additionalSupplementAtomicGoals:number
  regularSourceBackedAtomicGoals:number
  reviewedDidacticSupplementAtomicGoals:number
  curricularAtomicTargetGoals:number
  orientationTargetGoals:number
  ordinaryNonCurricularTargetGoals:number
  unresolvedTargetAtomicGoals:number
  regularSourceClaimStillUnestablishedGoalIds:string[]
  ordinaryTargetSourceObligationMissingGoalIds:string[]
  exactSelectedProjectionIds:string[]
  targetFacts:SupplementalTargetFact[]
  targetAuthorizationStatus:'pass'|'fail'
  officialMathematicsObligationsSatisfiedByInference:0
  officialReverseSourceMappingsAddedByInference:0
}
export interface CompositionSupplementCoverage {
  contractVersion:'selected-mathematics-preparation-source-qa-v2'
  nativeReceiptSha256:string
  canonicalOrdinaryDenominators:{landscapeId:string,denominator:number,strictComplete:number}[]
  requiredNativeChecks:string[]
  authoredSupplementIds:string[]
  configurations:SupplementalConfigurationCoverage[]
  inputBindings:{path:string,sha256:string}[]
  applicabilityCompilationSha256:string
  compilationInputBindings?:CompilationInputBinding[]
}
const hash=(bytes:Buffer|string)=>createHash('sha256').update(bytes).digest('hex')
const canonical=(v:unknown):unknown=>Array.isArray(v)?v.map(canonical):v&&typeof v==='object'?Object.fromEntries(Object.entries(v).sort(([a],[b])=>a<b?-1:a>b?1:0).map(([k,x])=>[k,canonical(x)])):v
export const supplementQaDigest=(v:unknown)=>hash(JSON.stringify(canonical(v)))
const sort=(values:Iterable<string>)=>[...new Set(values)].sort()
const fail=(message:string):never=>{throw new Error('COMPOSITION_SUPPLEMENT_SOURCE_QA: '+message)}
const owned=(root:string,path:string):string=>{
  const absolute=resolve(root,path),child=relative(root,absolute)
  if(!path||isAbsolute(path)||child==='..'||child.startsWith('..'+sep)||isAbsolute(child))fail('input escapes repository: '+path)
  let current=root
  for(const part of child.split(sep)){current=resolve(current,part);if(lstatSync(current).isSymbolicLink())fail('symbolic authorization path: '+path)}
  if(!realpathSync(absolute).startsWith(realpathSync(root)+sep))fail('input real path escapes repository: '+path)
  return absolute
}
const files=(directory:string,suffix:string,strict=false):string[]=>!existsSync(directory)?[]:readdirSync(directory,{withFileTypes:true}).sort((a,b)=>a.name.localeCompare(b.name)).flatMap(entry=>{
  const path=resolve(directory,entry.name)
  if(entry.isSymbolicLink()){if(strict)fail('symbolic authored input: '+path);return []}
  return entry.isDirectory()?files(path,suffix,strict):entry.isFile()&&entry.name.endsWith(suffix)?[path]:[]
})
/** Discovery is cheap and never launches Java/native validation without an authored artifact. */
export const authoredCompositionSupplementPaths=(root:string):string[]=>{
  const directory=resolve(root,'curricula/DE/Gymnasium/composition-supplements/mathematik')
  if(!existsSync(directory))return []
  owned(resolve(root,'curricula'),'DE/Gymnasium/composition-supplements/mathematik')
  return files(directory,'.supplement.json',true)
}
const checkedFiles=new Map<string,string>()
type OwnedRead={root:string,path:string,boundary:string,boundaryRealPath:string}
const ownedReadObservers=new Set<(read:OwnedRead)=>void>()
const currentOwnedPath=(root:string,path:string):{file:string,boundary:string}=>{
  const boundary=path.startsWith('curricula/')?resolve(root,'curricula'):root
  return {file:owned(boundary,path.startsWith('curricula/')?path.slice('curricula/'.length):path),boundary}
}
const currentJson=(root:string,path:string,strict=false):Row=>{
  const checked=strict?currentOwnedPath(root,path):undefined,file=checked?.file??resolve(root,path)
  if(checked)for(const observe of ownedReadObservers)observe({root,path,boundary:checked.boundary,boundaryRealPath:realpathSync(checked.boundary)})
  const bytes=readFileSync(file),digest=hash(bytes)
  if(strict)currentOwnedPath(root,path)
  const key=root+'\0'+path,previous=checkedFiles.get(key)
  if(previous&&previous!==digest)fail('source changed during selected-configuration accounting: '+path)
  checkedFiles.set(key,digest);return JSON.parse(bytes.toString('utf8')) as Row
}
export type CompilationInputBinding={path:string,kind:'file',sha256:string}|{path:string,kind:'directory',entries:string[]}|{path:string,kind:'absent'}
/** The existing compiler is synchronous/read-only. Bind its actual data reads and
 * resolution directory/absence facts on active-artifact QA only. No recursive
 * inventory, native authority, child execution or learner/DB state is introduced. */
export const withSupplementSourceInputSnapshot=<T>(root:string,run:()=>T):{value:T,inputs:CompilationInputBinding[]}=>{
  const fs=createRequire(import.meta.url)('node:fs') as typeof import('node:fs')
  const originals={readFileSync:fs.readFileSync,readdirSync:fs.readdirSync,existsSync:fs.existsSync}
  const rows=new Map<string,CompilationInputBinding>()
  const record=(input:unknown,kind:'file'|'directory'|'absent',data?:Buffer|string|Array<string|{name:string}>)=>{
    if(typeof input!=='string')return
    const path=relative(root,resolve(input)).replaceAll('\\','/')
    if(!path||path==='..'||path.startsWith('../')||isAbsolute(path))return
    const row:CompilationInputBinding=kind==='file'?{path,kind,sha256:hash(data as Buffer|string)}:kind==='directory'?{path,kind,entries:(data as Array<string|{name:string}>).map(item=>typeof item==='string'?item:item.name).sort()}:{path,kind}
    const key=kind+':'+path,old=rows.get(key);if(old)assert.deepEqual(row,old,'source compilation input changed during accounting: '+path);rows.set(key,row)
  }
  fs.readFileSync=((input:unknown,...args:unknown[])=>{try{const data=Reflect.apply(originals.readFileSync,fs,[input,...args]);record(input,'file',data);return data}catch(error){if((error as NodeJS.ErrnoException).code==='ENOENT')record(input,'absent');throw error}}) as typeof fs.readFileSync
  fs.readdirSync=((input:unknown,...args:unknown[])=>{const data=Reflect.apply(originals.readdirSync,fs,[input,...args]);record(input,'directory',data);return data}) as typeof fs.readdirSync
  fs.existsSync=((input:unknown)=>{const exists=Reflect.apply(originals.existsSync,fs,[input]);if(!exists)record(input,'absent');return exists}) as typeof fs.existsSync
  syncBuiltinESMExports()
  const ownedReads=new Map<string,OwnedRead>()
  const observe=(read:OwnedRead)=>{if(resolve(read.root)===resolve(root)){const prior=ownedReads.get(read.path);if(prior)assert.equal(prior.boundaryRealPath,read.boundaryRealPath,'authorization root changed during accounting');ownedReads.set(read.path,read)}}
  ownedReadObservers.add(observe)
  let value:T
  try{value=run()}finally{ownedReadObservers.delete(observe);Object.assign(fs,originals);syncBuiltinESMExports()}
  // Recheck confinement before any final byte read, including same-byte symlink
  // replacement after accounting. Only paths actually read as owned are included.
  for(const read of ownedReads.values()){assert.equal(realpathSync(read.boundary),read.boundaryRealPath,'authorization root changed during source snapshot');currentOwnedPath(read.root,read.path)}
  const inputs=[...rows.values()].sort((a,b)=>a.path.localeCompare(b.path)||a.kind.localeCompare(b.kind))
  for(const input of inputs){const path=resolve(root,input.path);if(input.kind==='file')assert.equal(hash(originals.readFileSync(path)),input.sha256,'source compilation file drift: '+input.path);else if(input.kind==='directory')assert.deepEqual(originals.readdirSync(path).sort(),input.entries,'source compilation directory drift: '+input.path);else assert.equal(originals.existsSync(path),false,'source compilation absence drift: '+input.path)}
  return {value,inputs}
}
/** Freshness check after the fixed Java validator, not another acceptance lane.
 * Its receipt paths have already passed the registered closed Java contract. */
const assertNativeSnapshotStillCurrent=(root:string,snapshot:Row):void=>{
  for(const input of snapshot.receipt.sourceInputs){
    const path=resolve(root,input.path),child=relative(root,path)
    assert.ok(child&&child!=='..'&&!child.startsWith('..'+sep)&&!isAbsolute(child),'native input escapes current repository')
    if(input.kind==='file')assert.equal(hash(readFileSync(path)),input.sha256,'registered native source/P/asset drift: '+input.path)
    else if(input.kind==='directory')assert.deepEqual(readdirSync(path).sort(),input.entries,'registered native source directory drift: '+input.path)
    else if(input.kind==='absent')assert.equal(existsSync(path),false,'registered native absence drift: '+input.path)
    else fail('unsupported registered native source-input kind')
  }
  for(const executable of snapshot.receipt.executableInputs){assert.equal(realpathSync(executable.path),executable.realPath,'registered executable path drift');assert.equal(hash(readFileSync(executable.path)),executable.sha256,'registered executable bytes drift')}
}
/** Fixed local execution, never a caller-selected receipt/config/classpath. */
export interface CompositionSupplementAssessment { coverage:CompositionSupplementCoverage; nativeReport:DeepUnderstandingRolloutReport }
export const readCompositionSupplementAssessment=async(root:string,compilation:Compilation):Promise<CompositionSupplementAssessment|undefined>=>{
  if(process.env[ACTIVE]==='1'||process.env.SKILLPILOT_NATIVE_ADMISSION_ACTIVE==='1')fail('aggregate QA recursion blocked; registered native validation must not invoke aggregate source QA')
  if(!authoredCompositionSupplementPaths(root).length)return undefined
  const launcher=resolve(root,'backend/gradlew')
  if(!existsSync(launcher))fail('required repository QA runtime is missing; install Amazon Corretto JDK from .java-version and run backend/gradlew exportCompositionSupplementQa')
  const environment:NodeJS.ProcessEnv={...process.env,[ACTIVE]:'1'};delete environment.NODE_OPTIONS
  const run=spawnSync(launcher,['--quiet','exportCompositionSupplementQa','-x','processResources','-x','generateClaudePluginPublication'],{
    cwd:resolve(root,'backend'),encoding:'utf8',env:environment,maxBuffer:100*1024*1024,timeout:10*60*1000,
  })
  if(run.error||run.status!==0)fail('required read-only Java/native admission failed. Install Amazon Corretto JDK '+readFileSync(resolve(root,'.java-version'),'utf8').trim()+' and run ./backend/gradlew -p backend exportCompositionSupplementQa; no supplement/source approval was granted. '+String(run.error??run.stderr).slice(-4000))
  const payloads=run.stdout.split('\n').filter(line=>line.startsWith(PREFIX))
  if(payloads.length!==1)fail('fixed Java/native admission did not return exactly one closed QA result')
  const exported=JSON.parse(payloads[0].slice(PREFIX.length))
  assertNativeSnapshotStillCurrent(root,exported.nativeSnapshot)
  const tracked=withSupplementSourceInputSnapshot(root,()=>{
    const currentCompilation=buildApplicabilityCompilation()
    assert.equal(supplementQaDigest(currentCompilation),supplementQaDigest(compilation),'applicability/source scope changed during native admission; regenerate the report')
    return accountAdmittedCompositionSupplements(root,exported,currentCompilation)
  })
  assertNativeSnapshotStillCurrent(root,exported.nativeSnapshot)
  return {coverage:{...tracked.value,compilationInputBindings:tracked.inputs},nativeReport:exported.nativeSnapshot.receipt.report}
}
/** Source-audit convenience. Quality status reuses the same native report instead
 * of invoking the registered70s engine for a second time in this run. */
export const readCompositionSupplementCoverage=async(root:string,compilation:Compilation):Promise<CompositionSupplementCoverage|undefined>=>(await readCompositionSupplementAssessment(root,compilation))?.coverage
/** Bind the fixed Java export to its two current, confined files. This grants
 * no new authority: native admission already validated these exact JSON objects. */
const assertCurrentAuthoredReviewInputs=(root:string,bundle:Row):void=>{
  assert.deepEqual(Object.keys(bundle).sort(),['supplement','authoredDocument','review','authoredPath','reviewPath','authoredInputBindings','mathBaseView','physicsView'].sort(),'unsupported closed supplement export row')
  const bindings=bundle.authoredInputBindings
  assert.ok(bindings&&typeof bindings==='object'&&!Array.isArray(bindings),'missing current authored/review byte bindings')
  assert.deepEqual(Object.keys(bindings).sort(),['authoredDocument','review'])
  for(const path of [bundle.authoredPath,bundle.reviewPath])assert.ok(typeof path==='string'&&path.startsWith('curricula/')&&path===relative(root,resolve(root,path)).replaceAll('\\','/'),'noncanonical or escaping authorization path')
  assert.ok(bundle.authoredPath.startsWith('curricula/DE/Gymnasium/composition-supplements/mathematik/')&&bundle.authoredPath.endsWith('.supplement.json'),'unexpected authored supplement path')
  assert.equal(bundle.authoredDocument.supplementId,bundle.supplement.id,'current authored identity differs')
  assert.ok(typeof bundle.authoredDocument.reviewPath==='string'&&bundle.authoredDocument.reviewPath.length>0,'missing authored review path')
  assert.equal(relative(root,resolve(root,'curricula',bundle.authoredDocument.reviewPath)).replaceAll('\\','/'),bundle.reviewPath,'authored review path differs from exported current review')
  // The first read proves the current authored object before its declared review is read.
  for(const [field,path]of [['authoredDocument',bundle.authoredPath],['review',bundle.reviewPath]] as const){
    const binding=bindings[field]
    assert.ok(binding&&typeof binding==='object'&&!Array.isArray(binding),'missing owned authorization file binding')
    assert.deepEqual(Object.keys(binding).sort(),['path','sha256'])
    assert.equal(binding.path,path,'exported authorization path mismatch');assert.match(binding.sha256,/^[a-f0-9]{64}$/)
    const current=currentJson(root,path,true)
    assert.equal(checkedFiles.get(root+'\0'+path),binding.sha256,'authored/review bytes changed after registered Java export: '+path)
    assert.equal(supplementQaDigest(current),supplementQaDigest(bundle[field]),'exported authorization object differs from current bytes: '+path)
  }
  assert.equal(bundle.supplement.authorizationSha256,supplementQaDigest({supplement:bundle.authoredDocument,review:bundle.review}),'current authorization semantic digest differs')
}
const assertExactAuthoredPathSet=(root:string,bundles:Row[]):void=>{
  const expected=bundles.map(bundle=>bundle.authoredPath)
  assert.equal(new Set(expected).size,expected.length,'duplicate exported authored path')
  assert.deepEqual(authoredCompositionSupplementPaths(root).map(path=>relative(root,path).replaceAll('\\','/')).sort(),expected.slice().sort(),'current authored path set differs from registered Java export')
}
/** Post-admission accounting boundary. Production only receives the fixed Java
 * process result above; explicit tests may supply clearly labelled synthetic rows. */
export const accountAdmittedCompositionSupplements=(root:string,exported:Row,compilation:Compilation):CompositionSupplementCoverage=>{
  for(const key of checkedFiles.keys())if(key.startsWith(root+'\0'))checkedFiles.delete(key)
  assert.equal(exported.contractVersion,CONTRACT,'unsupported supplement QA export contract')
  assert.deepEqual(Object.keys(exported).sort(),['bundles','contractVersion','nativeSnapshot','orientationContextBindings'])
  assert.ok(Array.isArray(exported.bundles)&&exported.bundles.length>0,'authored supplements cannot be omitted from QA')
  const snapshot=exported.nativeSnapshot,receipt=snapshot.receipt
  assert.equal(receipt.receiptFormatVersion,'2.0');assert.equal(receipt.producerContract,'registered-gymnasium-native-acceptance-v2')
  assert.equal(snapshot.receiptSha256,supplementQaDigest(receipt),'native snapshot digest')
  const math=currentJson(root,'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json') as SkillLandscape
  const physics=currentJson(root,'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json') as SkillLandscape
  assert.equal(math.landscapeId,SUPPLEMENT_MATH);assert.equal(physics.landscapeId,SUPPLEMENT_PHYSICS)
  const owners=new Map<string,Row>(receipt.report.subjects.map((s:Row)=>[s.landscapeId,s]))
  for(const [id,floor]of [[SUPPLEMENT_MATH,807],[SUPPLEMENT_PHYSICS,478]] as const){
    const s=owners.get(id)!;assert.ok(s&&s.denominator>=floor&&s.strictCompletionReady&&s.strictComplete===s.denominator)
    assert.equal(new Set(s.currentGoalIds).size,s.denominator);assert.deepEqual(sort(s.currentGoalIds),sort(s.strictCompleteGoalIds))
  }
  const nativeKinds=currentJson(root,'curricula/DE/Gymnasium/quality/release-model/mathematik.semantic-kinds.json')
  const goalById=new Map(math.goals.map(goal=>[goal.id,goal]))
  const kindById=new Map<string,Row>()
  for(const decision of nativeKinds.decisions){assert.ok(!kindById.has(decision.goalId),'duplicate current authoritative Math Kind');kindById.set(decision.goalId,decision)}
  const currentKind=(id:string):string=>{
    const decision=kindById.get(id),goal=goalById.get(id)
    assert.ok(goal&&decision&&decision.decisionStatus==='authoritative','missing current authoritative Math Kind')
    assert.equal(decision.sourceFingerprint,fingerprintSemanticKindSourceGoal(goal as unknown as Row),'stale current Math Kind source')
    assert.ok(['curricularAtomic','curricularArea','practiceAssessment','programStructure','memory','runtimeSupport','orientation'].includes(decision.semanticKind),'unsupported authoritative Math Kind')
    return decision.semanticKind
  }
  const ordinary=new Set<string>(nativeKinds.decisions.filter((d:Row)=>d.semanticKind==='curricularAtomic').map((d:Row)=>d.goalId))
  const orientationBindings=exported.orientationContextBindings
  assert.ok(orientationBindings&&typeof orientationBindings==='object'&&!Array.isArray(orientationBindings),'missing closed orientation context bindings')
  const usedOrientationIds=new Set<string>()
  const requireOrientationBinding=(binding:Row):void=>{
    const goal=goalById.get(binding.goalId)!,decision=kindById.get(binding.goalId)!,proof=orientationBindings[binding.goalId]
    assert.ok(proof&&typeof proof==='object'&&!Array.isArray(proof),'missing registered orientation context')
    assert.deepEqual(Object.keys(proof).sort(),['bindingContract','canonicalSourceBinding','completionContract','goalId','kindDecisionSha256','landscapeId','rawGoalSha256','receiptSha256','semanticKindSourceBinding'])
    assert.equal(proof.bindingContract,'registered-math-orientation-context-v1');assert.equal(proof.completionContract,'orientation-binary-completion-v1')
    assert.equal(proof.landscapeId,SUPPLEMENT_MATH);assert.equal(proof.goalId,binding.goalId);assert.equal(proof.receiptSha256,snapshot.receiptSha256)
    assert.equal(proof.rawGoalSha256,supplementQaDigest(goal));assert.equal(proof.kindDecisionSha256,supplementQaDigest(decision))
    assert.equal(binding.orientationContextBindingSha256,supplementQaDigest(proof));assert.ok(!('nativeAcceptanceSha256'in binding),'orientation has no content P/D/A/M/V binding')
    assert.ok(!receipt.goals[binding.goalId]&&!ordinary.has(binding.goalId),'orientation cannot enter ordinary content denominator')
    const configPath='curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'
    const config=currentJson(root,configPath),subjects=config.subjects.filter((row:Row)=>row.subject==='mathematik');assert.equal(subjects.length,1)
    const nativeOwner=owners.get(SUPPLEMENT_MATH)!;assert.equal(nativeOwner.landscapePath,subjects[0].landscapePath,'registered orientation canonical owner')
    for(const [record,path]of [[proof.canonicalSourceBinding,subjects[0].landscapePath],[proof.semanticKindSourceBinding,subjects[0].semanticKindLedgerPath]]){
      assert.deepEqual(Object.keys(record).sort(),['kind','path','sha256']);assert.equal(record.path,path);assert.equal(record.kind,'file');assert.equal(hash(readFileSync(resolve(root,path))),record.sha256)
      const inputs=receipt.sourceInputs.filter((input:Row)=>input.path===path);assert.equal(inputs.length,1,'orientation source must be bound to native snapshot');assert.deepEqual(inputs[0],record)
    }
    const configInputs=receipt.sourceInputs.filter((input:Row)=>input.path===configPath);assert.equal(configInputs.length,1);assert.equal(configInputs[0].kind,'file');assert.equal(configInputs[0].sha256,hash(readFileSync(resolve(root,configPath))))
    usedOrientationIds.add(binding.goalId)
  }
  assert.equal(ordinary.size,owners.get(SUPPLEMENT_MATH)!.denominator,'full ordinary Math denominator cannot shrink to selected/source-backed atoms')
  const groups=new Map<string,Row[]>()
  const allIds=new Set<string>()
  const global={...math,goals:[...math.goals,...physics.goals]}
  assertExactAuthoredPathSet(root,exported.bundles)
  for(const bundle of exported.bundles){
    assertCurrentAuthoredReviewInputs(root,bundle)
    const s=bundle.supplement,review=bundle.review
    assert.ok(!allIds.has(s.id),'duplicate authored supplement');allIds.add(s.id)
    assert.equal(s.authorizationSha256,supplementQaDigest({supplement:bundle.authoredDocument,review}))
    assert.equal(s.document.landscapeId,SUPPLEMENT_MATH)
    assert.deepEqual(s.document.scope,s.scope,'selected supplement scope')
    assert.deepEqual(review.scope,s.scope,'reviewed Math scope')
    assert.deepEqual(review.physicsContext.scope,s.physicsScope,'reviewed Physics scope')
    assert.equal(supplementQaDigest(bundle.mathBaseView),s.baseViewSha256[bundle.mathBaseView.viewId])
    assert.equal(supplementQaDigest(bundle.physicsView),s.physicsViewSha256)
    // Uses the actual compiler/runtime role resolution, including rendered-parent rules.
    for(const [view,landscape]of [[s.document,math],[bundle.mathBaseView,math],[bundle.physicsView,physics]] as const){
      const errors=compileCompositionView(normalizeCompositionView(view),normalizeCanonicalLandscape(landscape),normalizeCanonicalLandscape(global)).findings.filter(f=>f.severity==='error');assert.deepEqual(errors,[],'invalid exact selected projection')
    }
    assert.deepEqual(sort(collectAuthoritativeTargetAtomicGoalIds(math,s.document)),sort(s.targetGoalIds))
    const physicsTargets=collectAuthoritativeTargetAtomicGoalIds(physics,bundle.physicsView)
    assert.ok(s.physicsDependentGoalIds.every((id:string)=>physicsTargets.has(id)),'Physics justification must be a current selected TARGET')
    assert.deepEqual(sort(review.mathGoalBindings.map((binding:Row)=>binding.goalId)),sort(s.targetGoalIds),'every supplemental target needs exactly one typed binding')
    assert.equal(review.mathGoalBindings.length,s.targetGoalIds.length,'duplicate Math target binding')
    for(const binding of review.mathGoalBindings){
      const kind=currentKind(binding.goalId);assert.equal(binding.semanticKind,kind,'reviewed current Math Kind')
      if(kind==='orientation'){
        assert.equal(review.reviewFormatVersion,'1.1');requireOrientationBinding(binding)
        const auth=review.targetAuthorizations.find((row:Row)=>row.goalId===binding.goalId)
        assert.ok(auth&&auth.classification==='reviewed-mathematics-orientation-preparation'&&auth.regularMathematicsSourceCoverageClaim===false,'explicit orientation authorization cannot claim official content coverage')
        assert.equal(auth.completionContract,'orientation-binary-completion-v1');assert.ok(typeof auth.orientationRationale==='string'&&auth.orientationRationale.trim())
        for(const key of ['mandatoryOperation','mathematicalInference','inputAvailability','wholePerformanceAlternatives','minimality','regularMathematicsSourceReview'])assert.ok(!(key in auth),'orientation has no content-assessment/source-review authority')
      }else{
        assert.equal(kind,'curricularAtomic','unsupported supplemental noncontent kind')
        assert.ok(!('orientationContextBindingSha256'in binding),'content cannot use orientation context')
        const native=receipt.goals[binding.goalId];assert.ok(native&&native.positiveEvidenceOwner?.profileFingerprint&&native.positiveEvidenceOwner?.reviewInputFingerprint,'missing current native external P owner')
        assert.equal(binding.nativeAcceptanceSha256,supplementQaDigest({receiptSha256:snapshot.receiptSha256,nativeGoal:native}))
      }
    }
    for(const binding of review.physicsGoalBindings){
      assert.equal(binding.semanticKind,'curricularAtomic','Physics justification must retain content native evidence')
      const native=receipt.goals[binding.goalId];assert.ok(native&&native.positiveEvidenceOwner?.profileFingerprint&&native.positiveEvidenceOwner?.reviewInputFingerprint,'missing current native external P owner')
      assert.equal(binding.nativeAcceptanceSha256,supplementQaDigest({receiptSha256:snapshot.receiptSha256,nativeGoal:native}))
    }
    const key=supplementQaDigest([s.scope,s.physicsScope,bundle.mathBaseView.viewId,bundle.physicsView.viewId]);groups.set(key,[...(groups.get(key)??[]),bundle])
  }
  assert.deepEqual(sort(Object.keys(orientationBindings)),sort(usedOrientationIds),'unused or omitted orientation context binding')
  // Every discovery must be accounted, even an artifact absent from all ordinary views.
  assertExactAuthoredPathSet(root,exported.bundles)
  const configurations:SupplementalConfigurationCoverage[]=[]
  for(const group of groups.values()){
    group.sort((a,b)=>a.supplement.id.localeCompare(b.supplement.id))
    if(group.length>12)fail('more than12 jointly compatible authored supplements require an explicitly bounded configuration enumeration contract')
    const first=group[0],scope=first.supplement.scope
    const sourceFacts=mathematicsSourceCitationsForScope(root,math,scope,compilation)
    const ordinarySourceCoverage=ordinaryMathematicsSourceCoverage(root,math,scope,compilation)
    const ordinaryBase=collectAuthoritativeTargetAtomicGoalIds(math,first.mathBaseView)
    for(const bundle of group)for(const auth of bundle.review.targetAuthorizations){
      if(auth.classification==='regular-mathematics-source-backed')validateRegularSourceFact(root,auth,scope,sourceFacts)
    }
    for(let mask=1;mask<(1<<group.length);mask++)for(const mathBaseSelected of [false,true]){
      const selected=group.filter((_,i)=>mask&(1<<i)),selectedIds=selected.map(b=>b.supplement.id)
      const supplementTargets=new Set<string>(selected.flatMap(b=>b.supplement.targetGoalIds))
      const targets=new Set<string>([...(mathBaseSelected?ordinaryBase:[]),...supplementTargets])
      const facts:SupplementalTargetFact[]=sort(targets).map(goalId=>{
        const base=mathBaseSelected&&ordinaryBase.has(goalId),own=selected.filter(b=>b.supplement.targetGoalIds.includes(goalId))
        const auth=own.map(b=>b.review.targetAuthorizations.find((a:Row)=>a.goalId===goalId))
        const semanticKind=currentKind(goalId),content=semanticKind==='curricularAtomic',orientation=semanticKind==='orientation'
        const sourceBacked=content&&(base?ordinarySourceCoverage.has(goalId):sourceFacts.has(goalId))
        const regular=content&&((base&&sourceBacked)||auth.some(a=>a.classification==='regular-mathematics-source-backed'))
        // Independent base noncontent keeps its existing target/completion semantics.
        // It cannot create official content obligations or authorize new supplemental kinds.
        const classification=orientation?'orientation-target':!content&&base?'ordinary-non-curricular-target':base&&!sourceBacked?'unresolved':regular?'regular-mathematics-source-backed':auth.some(a=>a.classification==='reviewed-didactic-mathematics-supplement-motivated-by-physics')?'reviewed-didactic-mathematics-supplement-motivated-by-physics':'unresolved'
        const authorizations=own.map(bundle=>{
          const authorization=bundle.review.targetAuthorizations.find((row:Row)=>row.goalId===goalId)
          return {supplementId:bundle.supplement.id,classification:authorization.classification,physicsDependentGoalIds:authorization.physicsDependentGoalIds,nativeContextBindingSha256:(()=>{const binding=bundle.review.mathGoalBindings.find((binding:Row)=>binding.goalId===goalId);return semanticKind==='orientation'?binding.orientationContextBindingSha256:binding.nativeAcceptanceSha256})(),...(authorization.regularMathematicsSourceReview?{regularMathematicsSourceReview:authorization.regularMathematicsSourceReview}:{})}
        })
        return {goalId,semanticKind,ordinaryBaseTarget:base,selectedSupplementIds:own.map(b=>b.supplement.id),classification,existingMathematicsSourceCompatibilityEvidence:content&&sourceFacts.has(goalId),regularMathematicsSourceCoverageClaim:classification==='regular-mathematics-source-backed',authorizations}
      })
      const identity={ownerLandscapeId:SUPPLEMENT_MATH,scope,physicsScope:first.supplement.physicsScope,mathBaseSelected,mathBaseViewId:first.mathBaseView.viewId,physicsViewId:first.physicsView.viewId,selectedSupplementIds:selectedIds}
      const unresolved=facts.filter(f=>f.classification==='unresolved')
      configurations.push({...identity,configurationId:'selected-math-preparation:'+supplementQaDigest(identity),totalAuthoredTargetAtomicGoals:targets.size,ordinaryBaseTargetAtomicGoals:mathBaseSelected?ordinaryBase.size:0,selectedSupplementTargetAtomicGoals:supplementTargets.size,additionalSupplementAtomicGoals:[...supplementTargets].filter(id=>!mathBaseSelected||!ordinaryBase.has(id)).length,regularSourceBackedAtomicGoals:facts.filter(f=>f.classification==='regular-mathematics-source-backed').length,reviewedDidacticSupplementAtomicGoals:facts.filter(f=>f.classification==='reviewed-didactic-mathematics-supplement-motivated-by-physics').length,curricularAtomicTargetGoals:facts.filter(f=>f.semanticKind==='curricularAtomic').length,orientationTargetGoals:facts.filter(f=>f.semanticKind==='orientation').length,ordinaryNonCurricularTargetGoals:facts.filter(f=>f.classification==='ordinary-non-curricular-target').length,unresolvedTargetAtomicGoals:unresolved.length,regularSourceClaimStillUnestablishedGoalIds:facts.filter(f=>f.semanticKind==='curricularAtomic'&&!f.regularMathematicsSourceCoverageClaim).map(f=>f.goalId),ordinaryTargetSourceObligationMissingGoalIds:unresolved.filter(f=>f.ordinaryBaseTarget).map(f=>f.goalId),exactSelectedProjectionIds:[...(mathBaseSelected?[first.mathBaseView.viewId]:[]),...selected.map(b=>b.supplement.document.viewId),first.physicsView.viewId],targetFacts:facts,targetAuthorizationStatus:unresolved.length?'fail':'pass',officialMathematicsObligationsSatisfiedByInference:0,officialReverseSourceMappingsAddedByInference:0})
    }
  }
  // Revalidate the same two current owned files after all selected configurations.
  // Their actual reads also participate in the enclosing source snapshot.
  assertExactAuthoredPathSet(root,exported.bundles)
  for(const bundle of exported.bundles)assertCurrentAuthoredReviewInputs(root,bundle)
  // Every input actually read for source facts remains exact, separate from native inputs.
  const inputBindings=[...checkedFiles].filter(([key])=>key.startsWith(root+'\0')).map(([key,sha256])=>({path:key.slice(root.length+1),sha256})).sort((a,b)=>a.path.localeCompare(b.path))
  for(const binding of inputBindings)assert.equal(hash(readFileSync(resolve(root,binding.path))),binding.sha256,'source input drift')
  return {contractVersion:'selected-mathematics-preparation-source-qa-v2',nativeReceiptSha256:snapshot.receiptSha256,canonicalOrdinaryDenominators:[...owners.values()].map(s=>({landscapeId:s.landscapeId,denominator:s.denominator,strictComplete:s.strictComplete})),requiredNativeChecks:owners.get(SUPPLEMENT_MATH)!.requiredChecks.map((c:Row)=>c.id),authoredSupplementIds:sort(allIds),configurations,inputBindings,applicabilityCompilationSha256:supplementQaDigest(compilation)}
}
interface ExactSourceFact {sourceGoalId:string;officialUrl:string;anchor:string;mappingPaths:string[];kind:'mapping'|'reviewed-requires-closure';displayScopeMatch:'exact'|'source-context';unspecifiedDisplayDimensions:string[]}
/** These are current source citations compatible with the existing three display
 * facets (including explicitly visible unspecified source-context facets). They are not independent proof of whole-program/AG/A2/cohort coverage. */
export const mathematicsSourceCitationsForScope=(root:string,landscape:SkillLandscape,scope:Row,compilation:Compilation):Map<string,ExactSourceFact[]>=>{
  const mappingPaths=files(resolve(root,'curricula/DE/Gymnasium/mapping'),'.review.json').map(p=>relative(root,p).replaceAll('\\','/')).filter(path=>currentJson(root,path).targetLandscapeId===SUPPLEMENT_MATH)
  const pathsBySourceGoal=new Map<string,string[]>()
  for(const path of mappingPaths){const mapping=currentJson(root,path),extraction=currentJson(root,mapping.sourceExtractionPath)
    assert.equal(mapping.sourceLandscapeId,extraction.sourceLandscapeId)
    assert.ok(['Mathematik','Mathematics','mathematik'].includes(extraction.subject),'Physics provenance is not Mathematics evidence')
    for(const decision of mapping.decisions??[])if(decision.decision==='mapped'){
      assert.ok(decision.reviewer&&decision.reviewedAt&&decision.rationale,'unreviewed source mapping')
      pathsBySourceGoal.set(decision.sourceGoalId,[...(pathsBySourceGoal.get(decision.sourceGoalId)??[]),path])
    }
  }
  const profiles=scope.courseProfile==='GK+LK'?['GK','LK']:[scope.courseProfile??null]
  const model={book:{id:'de-gym-mathematik-bundesweit',landscapeId:SUPPLEMENT_MATH},digest:'source-qa:'+supplementQaDigest(scope),source:{landscapePath:'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json'},pages:landscape.goals.map(goal=>({goalId:goal.id,applicability:[{jurisdiction:scope.jurisdiction,scopes:profiles.map(courseProfile=>({stage:scope.stage,durationModel:scope.durationModel??null,courseProfile}))}]}))} as unknown as GoalBookModel
  const index=buildGoalBookOriginalSources(model,root,mappingPaths)
  const evidence=new Map(index.evidence.map(e=>[e.id,e])),documents=new Map(index.documents.map(d=>[d.id,d]))
  const result=new Map<string,ExactSourceFact[]>()
  for(const [id,tuples]of Object.entries(index.goals)){
    const facts=tuples.map(tuple=>tuple.evidenceIds.flatMap(ref=>{const e=evidence.get(ref)!;return [{sourceGoalId:e.sourceGoalId,officialUrl:documents.get(e.documentId)!.url,anchor:e.sourceRef,mappingPaths:pathsBySourceGoal.get(e.sourceGoalId)??[],kind:'mapping' as const,displayScopeMatch:e.scopeMatch,unspecifiedDisplayDimensions:e.unspecifiedDimensions}]} ))
    if(facts.length===profiles.length&&facts.every(rows=>rows.length))result.set(id,facts.flat())
  }
  const report=compilation.reports.find(r=>r.landscapeId===SUPPLEMENT_MATH)
  const registryPath='curricula/DE/Gymnasium/provenance/canonical-goal-surrogate-evidence-registry.json'
  const entries=currentJson(root,registryPath).entries??[]
  const byKey=new Map<string,Row[]>()
  for(const entry of entries)if(entry.status==='accepted'&&entry.landscapeId===SUPPLEMENT_MATH){const key=sourceCoverageSurrogateKey(entry.landscapeId,entry.goalId,entry.jurisdiction);byKey.set(key,[...(byKey.get(key)??[]),entry])}
  if(report){const checker=createReviewedRequiresClosureCoverageChecker({landscapeId:SUPPLEMENT_MATH,jurisdiction:scope.jurisdiction,goals:report.goals,canonicalGoalById:new Map(landscape.goals.map(g=>[g.id,g])),surrogateEntriesByKey:byKey,isEligibleCanonicalGoal:g=>!!g&&(g.contains?.length??0)===0})
    let changed=true
    while(changed){changed=false;for(const goal of report.goals)if(!result.has(goal.goalId)&&!hasDirectSourceCoverageEvidence(goal,scope.jurisdiction)&&checker.hasReviewedRequiresClosureSurrogateEvidence(goal)){
      const available=(byKey.get(sourceCoverageSurrogateKey(SUPPLEMENT_MATH,goal.goalId,scope.jurisdiction))??[]).flatMap(entry=>(result.get(entry.requiredByGoalId)??[]).map(f=>({...f,kind:'reviewed-requires-closure' as const})))
      if(available.length){result.set(goal.goalId,available);changed=true}
    }}
  }
  return result
}
/** Preserve the native ordinary CQR/source predicate for independently selected
 * ordinary targets. Supplemental inference cannot satisfy this separate duty. */
const ordinaryMathematicsSourceCoverage=(root:string,landscape:SkillLandscape,scope:Row,compilation:Compilation):Set<string>=>{
  const report=compilation.reports.find(r=>r.landscapeId===SUPPLEMENT_MATH)
  if(!report)return new Set()
  const entries=currentJson(root,'curricula/DE/Gymnasium/provenance/canonical-goal-surrogate-evidence-registry.json').entries??[]
  const byKey=new Map<string,Row[]>()
  for(const entry of entries)if(entry.status==='accepted'){const key=sourceCoverageSurrogateKey(entry.landscapeId,entry.goalId,entry.jurisdiction);byKey.set(key,[...(byKey.get(key)??[]),entry])}
  const checker=createReviewedRequiresClosureCoverageChecker({landscapeId:SUPPLEMENT_MATH,jurisdiction:scope.jurisdiction,goals:report.goals,canonicalGoalById:new Map(landscape.goals.map(g=>[g.id,g])),surrogateEntriesByKey:byKey,isEligibleCanonicalGoal:g=>!!g&&(g.contains?.length??0)===0})
  return new Set(report.goals.filter(g=>checker.hasCoverageBackedJurisdictionEvidence(g)).map(g=>g.goalId))
}
/** Full mapping/extraction bytes carry every material qualifier, including ones
 * not represented by GoalBook display facets. An independent exact-scope decision
 * must resolve them explicitly; no keyword guess converts a hold into coverage. */
export const mathematicsSourceMaterialContextDigest=(root:string,mappingPath:string,sourceGoalId:string):string=>{
  const mapping=currentJson(root,mappingPath)
  assert.equal(mapping.targetLandscapeId,SUPPLEMENT_MATH)
  assert.ok(mapping.decisions.some((d:Row)=>d.sourceGoalId===sourceGoalId&&d.decision==='mapped'))
  currentJson(root,mapping.sourceExtractionPath)
  return supplementQaDigest({mappingPath,mappingSha256:hash(readFileSync(resolve(root,mappingPath))),sourceExtractionPath:mapping.sourceExtractionPath,sourceExtractionSha256:hash(readFileSync(resolve(root,mapping.sourceExtractionPath))),sourceGoalId})
}
const validateRegularSourceFact=(root:string,auth:Row,scope:Row,facts:Map<string,ExactSourceFact[]>):void=>{
  const binding=auth.regularMathematicsSourceReview
  assert.ok(binding&&binding.path&&binding.sha256,'regular Math target requires independent whole-goal source review')
  const path='curricula/'+binding.path,bytes=readFileSync(owned(resolve(root,'curricula'),binding.path));assert.equal(hash(bytes),binding.sha256,'stale regular whole-goal review')
  const review=currentJson(root,path,true),source=review.sourceBinding
  assert.equal(review.decision,'accepted');assert.notEqual(review.authorId,review.reviewerId);assert.deepEqual(review.scope,scope);assert.equal(review.goalId,auth.goalId)
  assert.equal(source.subject,'Mathematics');assert.ok(review.wholeGoalCoverage)
  const retained='curricula/'+source.retainedEvidence.path
  const matches=(facts.get(auth.goalId)??[]).filter(f=>f.sourceGoalId===source.sourceId&&f.officialUrl===source.officialUrl&&f.anchor===source.anchor&&f.mappingPaths.includes(retained))
  assert.ok(matches.length,'regular Math source claim lacks a current compatible reviewed Math mapping/source witness: '+auth.goalId)
  assert.equal(hash(readFileSync(owned(resolve(root,'curricula'),source.retainedEvidence.path))),source.retainedEvidence.sha256,'stale current Math mapping source binding')
  const contextPath='curricula/'+review.reviewEvidence.path
  assert.equal(hash(readFileSync(owned(resolve(root,'curricula'),review.reviewEvidence.path))),review.reviewEvidence.sha256,'stale whole-source material-context review')
  const context=currentJson(root,contextPath,true)
  assert.equal(context.$schema,'https://skillpilot.com/schemas/composition-supplement/v1/whole-mathematics-source-scope-review.schema.json')
  assert.equal(context.reviewFormatVersion,'1.0');assert.equal(context.ownerLandscapeId,SUPPLEMENT_MATH)
  assert.equal(context.goalId,auth.goalId);assert.equal(context.goalSha256,review.goalSha256);assert.deepEqual(context.scope,scope)
  assert.equal(context.decision,'accepted');assert.equal(context.authorId,review.authorId);assert.equal(context.reviewerId,review.reviewerId)
  assert.notEqual(context.authorId,context.reviewerId);assert.deepEqual(context.conditions,[])
  assert.equal(context.coverageScope,'whole-goal-in-entire-declared-scope')
  assert.equal(context.sourceEdition,source.edition);assert.equal(context.sourceCohort,source.cohort)
  assert.ok(typeof context.contextRestrictionResolution==='string'&&context.contextRestrictionResolution.trim(),'material context restrictions remain unresolved')
  const witness=context.sourceContexts?.find((candidate:Row)=>candidate.sourceGoalId===source.sourceId&&candidate.mappingPath===retained)
  assert.ok(witness,'missing exact current source material-context witness')
  const mapping=currentJson(root,retained)
  assert.equal(witness.sourceExtractionPath,mapping.sourceExtractionPath)
  assert.equal(witness.materialContextSha256,mathematicsSourceMaterialContextDigest(root,retained,source.sourceId),'stale whole-source context (AG/A2/edition/cohort qualifiers cannot be omitted)')

}
