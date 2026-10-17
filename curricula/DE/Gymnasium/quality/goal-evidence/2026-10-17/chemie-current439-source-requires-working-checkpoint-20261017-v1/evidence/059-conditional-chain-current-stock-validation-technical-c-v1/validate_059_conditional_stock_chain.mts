import fs from 'node:fs'
import fsPromises from 'node:fs/promises'
import { syncBuiltinESMExports } from 'node:module'
import { createHash } from 'node:crypto'
import { dirname, resolve, relative, sep, extname } from 'node:path'
import { fileURLToPath } from 'node:url'
import assert from 'node:assert/strict'

const F='/mnt/e/skillpilot-chemie-L7-20261017/current650-all-seven-current439-native-central-preparation-technical-a-v1/capsule'
const O=dirname(fileURLToPath(import.meta.url))
const B='/mnt/e/skillpilot-chemie-L7-20261017/059-withdrawn-to-current-D-chain-prospective-diagnostic-technical-b-v1'
const configRel='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/chemie-current650-all-seven-current439-native-central-preparation-technical-a-v1/central.current439.all-seven-HB7f.prepared.private.config.json'
const goalId='059acb11-29b3-5645-ac4c-b4214dc41a2d'
const sha=(bytes:any)=>'sha256:'+createHash('sha256').update(bytes).digest('hex')
const rawRead=fs.readFileSync.bind(fs)
const rawAsyncRead=fsPromises.readFile.bind(fsPromises)
const observed=new Map<string,any>()
const observedChanges:any[]=[]
const failedReads:any[]=[]
let phase='bootstrap'
function observe(p:any,data:any,options:any){
 if(typeof p!=='string' && !(p instanceof URL)) return
 const path=typeof p==='string'?resolve(p):fileURLToPath(p)
 const encoding=typeof options==='string'?options:options?.encoding
 const bytes=Buffer.isBuffer(data)?data:Buffer.from(data,encoding??'utf8')
 const item={path,sha256:sha(bytes),bytes:bytes.length,firstPhase:phase,phases:[phase],reads:1}
 const prev=observed.get(path)
 if(prev){
  if(prev.sha256!==item.sha256 || prev.bytes!==item.bytes) observedChanges.push({before:prev,after:item})
  prev.reads++
  if(!prev.phases.includes(phase))prev.phases.push(phase)
 }else observed.set(path,item)
}
;(fs as any).readFileSync=function(p:any,options:any){
 try{const data=rawRead(p,options);observe(p,data,options);return data}catch(error){failedReads.push({path:String(p),phase,error:String(error)});throw error}
}
;(fsPromises as any).readFile=async function(p:any,options:any){
 try{const data=await rawAsyncRead(p,options);observe(p,data,options);return data}catch(error){failedReads.push({path:String(p),phase,error:String(error)});throw error}
}
syncBuiltinESMExports()
const stock=await import('/mnt/e/skillpilot-chemie-L7-20261017/current650-all-seven-current439-native-central-preparation-technical-a-v1/capsule/app/scripts/reportDeepUnderstandingRollout.ts')
const model=await import('/mnt/e/skillpilot-chemie-L7-20261017/current650-all-seven-current439-native-central-preparation-technical-a-v1/capsule/app/scripts/goalBookModel.ts')
const campaignModule=await import('/mnt/e/skillpilot-chemie-L7-20261017/current650-all-seven-current439-native-central-preparation-technical-a-v1/capsule/app/scripts/validateGoalDescriptionReviewCampaign.ts')
const resultModule=await import('/mnt/e/skillpilot-chemie-L7-20261017/current650-all-seven-current439-native-central-preparation-technical-a-v1/capsule/app/scripts/validateGoalDescriptionReviewCampaignResults.ts')
const dualModule=await import('/mnt/e/skillpilot-chemie-L7-20261017/current650-all-seven-current439-native-central-preparation-technical-a-v1/capsule/app/scripts/validateGoalDescriptionReviewDualRound.ts')
const resolutionModule=await import('/mnt/e/skillpilot-chemie-L7-20261017/current650-all-seven-current439-native-central-preparation-technical-a-v1/capsule/app/scripts/validateGoalDescriptionDualRoundResolution.ts')
const evidenceModule=await import('/mnt/e/skillpilot-chemie-L7-20261017/current650-all-seven-current439-native-central-preparation-technical-a-v1/capsule/app/scripts/goalEvidenceProfileModel.ts')
const {fingerprintSemanticKindSourceGoal,stableGoalBookJson}=model
const {duplicateValues,validateResolutionIndex,validateResolutionSemanticRetirements,buildResolutionSupersessionChains,hasIntactResolutionSupersessionChain}=stock
const readFileSync=fs.readFileSync.bind(fs)
const read=(p:string):any=>JSON.parse(readFileSync(p,'utf8'))
const pin=(p:string)=>{const bytes=readFileSync(p);return {path:resolve(p),sha256:sha(bytes),bytes:bytes.length}}
const eq=(a:any,b:any)=>stableGoalBookJson(a??null)===stableGoalBookJson(b??null)
const write=(name:string,obj:any)=>{
 const p=resolve(O,name);assert.equal(dirname(p),O);assert(!fs.existsSync(p));
 const text=JSON.stringify(obj,null,2)+'\n';JSON.parse(text);fs.writeFileSync(p,text)
}
const repoRoot=F
const resolveRepoPath=(configuredPath:string)=>{const p=resolve(repoRoot,configuredPath),r=relative(repoRoot,p);if(r==='..'||r.startsWith(`..${sep}`))throw new Error(`Path leaves repository: ${configuredPath}`);return p}
const loadJson=<T>(configuredPath:string):T=>JSON.parse(readFileSync(resolveRepoPath(configuredPath),'utf8')) as T
const addIssue=(issues:string[],scope:string,message:string)=>issues.push(`${scope}: ${message}`)
const semanticKinds=['curricularAtomic','curricularArea','practiceAssessment','programStructure','memory','runtimeSupport','orientation'] as const
// The following private loader body is copied byte-for-byte from the pinned stock module.
type DeepUnderstandingSubjectConfig=any
type AuthoritativeScope=any
type JsonObject=Record<string,unknown>
type SkillLandscape=any
type SemanticKindLedger=any
const loadAuthoritativeScope = (config: DeepUnderstandingSubjectConfig): AuthoritativeScope => {
  const issues: string[] = []
  let rawLandscape: JsonObject
  let landscape: SkillLandscape
  let ledger: SemanticKindLedger
  try {
    rawLandscape = loadJson<JsonObject>(config.landscapePath)
    landscape = rawLandscape as unknown as SkillLandscape
    ledger = loadJson<SemanticKindLedger>(config.semanticKindLedgerPath)
  } catch (error) {
    addIssue(issues, config.subject, error instanceof Error ? error.message : String(error))
    return {
      landscape: { landscapeId: '', goals: [] } as unknown as SkillLandscape,
      rawLandscape: {},
      goalById: new Map(),
      rawGoalById: new Map(),
      atomicGoalIds: new Set(),
      denominator: null,
      issues,
    }
  }
  const rawGoals = Array.isArray(rawLandscape.goals) ? rawLandscape.goals : []
  if (!Array.isArray(rawLandscape.goals)) addIssue(issues, config.subject, 'canonical goals array is missing')
  const rawGoalById = new Map<string, JsonObject>()
  rawGoals.forEach((candidate, index) => {
    if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate)) {
      addIssue(issues, config.subject, `canonical goal ${index} is not an object`)
      return
    }
    const goal = candidate as JsonObject
    const goalId = typeof goal.id === 'string' ? goal.id : ''
    if (!goalId) {
      addIssue(issues, config.subject, `canonical goal ${index} has no goalId`)
    } else if (rawGoalById.has(goalId)) {
      addIssue(issues, config.subject, `duplicate canonical goalId ${goalId}`)
    } else {
      rawGoalById.set(goalId, goal)
    }
  })
  const goalById = new Map((landscape.goals ?? []).map((goal) => [goal.id, goal]))
  const landscapeId = String(rawLandscape.landscapeId ?? rawLandscape.id ?? '')
  if (ledger.sourceLandscapeId !== landscapeId) {
    addIssue(issues, config.subject, `semantic-kind ledger landscapeId ${ledger.sourceLandscapeId} does not match ${landscapeId}`)
  }
  if (ledger.sourceLandscapePath !== config.landscapePath) {
    addIssue(issues, config.subject, 'semantic-kind ledger landscapePath does not match the configured canonical')
  }
  if (ledger.sourceFingerprintContractId !== 'semantic-kind-source-fingerprint-v1') {
    addIssue(issues, config.subject, `unsupported semantic-kind fingerprint contract ${ledger.sourceFingerprintContractId}`)
  }
  if (!Array.isArray(ledger.decisions)) {
    addIssue(issues, config.subject, 'semantic-kind decisions array is missing')
    ledger.decisions = []
  }
  duplicateValues(ledger.decisions.map(({ goalId }) => goalId)).forEach((goalId) => {
    addIssue(issues, config.subject, `duplicate semantic-kind decision for ${goalId}`)
  })
  const actualCounts = new Map<string, number>(semanticKinds.map((kind) => [kind, 0]))
  const decisionGoalIds = new Set<string>()
  const atomicGoalIds = new Set<string>()
  ledger.decisions.forEach((decision) => {
    const goal = rawGoalById.get(decision.goalId)
    if (!goal) {
      addIssue(issues, config.subject, `semantic-kind decision references unknown goal ${decision.goalId}`)
      return
    }
    decisionGoalIds.add(decision.goalId)
    if (!semanticKinds.includes(decision.semanticKind as typeof semanticKinds[number])) {
      addIssue(issues, config.subject, `unsupported semantic kind ${decision.semanticKind} for ${decision.goalId}`)
      return
    }
    actualCounts.set(decision.semanticKind, (actualCounts.get(decision.semanticKind) ?? 0) + 1)
    if (decision.decisionStatus !== 'authoritative') {
      addIssue(issues, config.subject, `non-authoritative semantic-kind decision for ${decision.goalId}`)
      return
    }
    try {
      const expectedFingerprint = fingerprintSemanticKindSourceGoal(goal)
      if (decision.sourceFingerprint !== expectedFingerprint) {
        addIssue(issues, config.subject, `stale semantic-kind decision for ${decision.goalId}`)
        return
      }
    } catch (error) {
      addIssue(issues, config.subject, `cannot fingerprint semantic-kind source ${decision.goalId}: ${error instanceof Error ? error.message : String(error)}`)
      return
    }
    if (decision.semanticKind === 'curricularAtomic') atomicGoalIds.add(decision.goalId)
  })
  rawGoalById.forEach((_goal, goalId) => {
    if (!decisionGoalIds.has(goalId)) addIssue(issues, config.subject, `missing semantic-kind decision for ${goalId}`)
  })
  semanticKinds.forEach((kind) => {
    if (ledger.counts?.[kind] !== actualCounts.get(kind)) {
      addIssue(issues, config.subject, `declared semantic-kind count for ${kind} does not match decisions`)
    }
  })
  if (ledger.counts?.total !== ledger.decisions.length || ledger.decisions.length !== rawGoalById.size) {
    addIssue(issues, config.subject, 'semantic-kind total does not match complete canonical coverage')
  }
  const denominator = issues.length === 0 ? atomicGoalIds.size : null
  return { landscape, rawLandscape, goalById, rawGoalById, atomicGoalIds, denominator, issues }
}


function captureSourceModules(path:string,seen=new Set<string>()){
 if(seen.has(path))return;seen.add(path)
 const text=readFileSync(path,'utf8')
 for(const match of text.matchAll(/(?:from\s*|import\s*\()\s*['"](\.[^'"]+)['"]/g)){
  const base=resolve(dirname(path),match[1]);
  const found=[base,base+'.ts',base+'.tsx',resolve(base,'index.ts')].find(p=>fs.existsSync(p)&&fs.statSync(p).isFile())
  if(found&&['.ts','.tsx','.js','.mjs'].includes(extname(found)))captureSourceModules(found,seen)
 }
}
function serialResult(path:string,result:any,superseded:Set<string>,withdrawn:Map<string,string>,milliseconds:number){return {
 path,elapsedMilliseconds:milliseconds,
 supersededGoalIds:[...superseded],withdrawnResolutionDigests:[...withdrawn].map(([goalId,digest])=>({goalId,digest})),
 historicalClaimedGoalIds:[...result.historicalClaimedGoalIds],claimedGoalIds:[...result.claimedGoalIds],ready:[...result.ready],issues:[...result.issues],
 target059:{historicalClaimed:result.historicalClaimedGoalIds.has(goalId),claimed:result.claimedGoalIds.has(goalId),ready:result.ready.has(goalId)}
}}
const startedAt=new Date().toISOString(),started=performance.now()
const report:any={schemaVersion:1,role:'Conditional read-only three-index stock validation; no activation or scientific votes',goalId,startedAt,
 applicationPerformed:false,activeWithdrawalRemoved:false,inMemoryProspectiveWithdrawalRemoved:false,newScientificVotes:0,strictCurrentValidCountAdded:0,
 sourceRoot:F,stockModulePath:resolve(F,'app/scripts/reportDeepUnderstandingRollout.ts'),exactValidateResolutionIndexCallCount:0,
 sourceEvidenceRetained:true,findings:[],limitations:[
 'This is a conditional three-index D diagnostic, not a complete central run or an M7 claim.',
 'The prospective configuration exists only in process memory. All other declared supersessions, withdrawals, retirements and registered indices are exact.',
 'Superseded entries receive stock index/history checks; separate fresh original dual-round campaign checks verify their original records and dual summaries.',
 'The semantic-retirement-only historical resolution helper is not invoked for still-atomic 059.',
 'No BookModel compilation, PDF rendering, source-science review or native materialization is performed.'
]}
let exitCode=0
try{
 phase='source-pins'
 captureSourceModules(report.stockModulePath)
 pin(fileURLToPath(import.meta.url))
 for(const path of [resolve(F,'app/package.json'),'/home/enpasos/projects/skillpilot/app/node_modules/tsx/package.json','/home/enpasos/projects/skillpilot/app/node_modules/tsx/dist/loader.mjs'])if(fs.existsSync(path))pin(path)
 const stockText=readFileSync(report.stockModulePath,'utf8')
 const loaderStart=stockText.indexOf('const loadAuthoritativeScope = '),loaderEnd=stockText.indexOf('\nconst loadAtomicityReadyGoals = ',loaderStart)
 const expectedLoader=stockText.slice(loaderStart,loaderEnd)
 assert.equal(readFileSync(resolve(O,'STOCK.loadAuthoritativeScope.exact-source.ts.txt'),'utf8'),expectedLoader+'\n')
 const thisText=readFileSync(fileURLToPath(import.meta.url),'utf8');assert(thisText.includes(expectedLoader))
 report.scopeLoader={method:'Exact stock private loadAuthoritativeScope body reproduced; imports stock fingerprintSemanticKindSourceGoal and duplicateValues',stockBodySha256:sha(expectedLoader),exactBodyIncluded:true}
 phase='plan-and-current-configuration'
 const selectorPath=resolve(B,'SELECTOR.technical-unapplied.sealed.json'),selectorPin=pin(selectorPath)
 assert.equal(selectorPin.sha256,'sha256:e243e32b6e5aaa5eac73c1bfa4016feca84523f9197b29383eb5cb184b71ed62')
 const selector=read(selectorPath)
 report.prospectivePlanSelector=selectorPin
 const referencedPins=selector.outputs.map((p:any)=>{const actual=pin(p.path);assert.equal(actual.sha256,'sha256:'+p.sha256.replace(/^sha256:/,''));assert.equal(actual.bytes,p.bytes);return actual})
 report.previousSealedEvidencePins=referencedPins
 const plan=read(resolve(B,'PLAN.059-prospective-three-index-chain.CONDITIONAL-NOT-APPLIED.json'))
 const priorDiagnostic=read(resolve(B,'DIAGNOSTIC.059-three-whole-original-claims-source-records-and-byte-pins.json'))
 const configPath=resolve(F,configRel),originalBytes=readFileSync(configPath),original=JSON.parse(originalBytes.toString())
 report.originalConfigPin=pin(configPath)
 const config=original.subjects.find((s:any)=>s.subject==='chemie');assert(config)
 const count=(s:any)=>({supersessions:s.resolutionSupersessions.length,withdrawals:s.resolutionWithdrawals.length,semanticRetirements:s.resolutionSemanticRetirements.length,DIndices:s.resolutionIndexPaths.length})
 assert.deepEqual(count(config),{supersessions:214,withdrawals:7,semanticRetirements:3,DIndices:105})
 const prospective=structuredClone(original),pconfig=prospective.subjects.find((s:any)=>s.subject==='chemie')
 const withdrawal=config.resolutionWithdrawals.filter((w:any)=>w.goalId===goalId);assert.equal(withdrawal.length,1)
 assert(eq(withdrawal[0],plan.preservedWithdrawalHistory));report.preservedHistoricalWithdrawal=withdrawal[0]
 const chainPaths=plan.stockProspectiveChain.indexPaths;assert.equal(chainPaths.length,3)
 const addedEdges=plan.prospectiveOnlyAppendEdges;assert.equal(addedEdges.length,2)
 assert(!config.resolutionSupersessions.some((e:any)=>e.goalId===goalId))
 pconfig.resolutionWithdrawals=pconfig.resolutionWithdrawals.filter((w:any)=>w.goalId!==goalId)
 pconfig.resolutionSupersessions.push(...addedEdges)
 assert.deepEqual(count(pconfig),{supersessions:216,withdrawals:6,semanticRetirements:3,DIndices:105})
 assert(eq(pconfig.resolutionSupersessions.slice(0,-2),config.resolutionSupersessions))
 assert(eq(pconfig.resolutionWithdrawals,config.resolutionWithdrawals.filter((w:any)=>w.goalId!==goalId)))
 assert(eq(pconfig.resolutionSemanticRetirements,config.resolutionSemanticRetirements))
 assert(eq(pconfig.resolutionIndexPaths,config.resolutionIndexPaths))
 const pcopy=structuredClone(prospective);const restored=pcopy.subjects.find((s:any)=>s.subject==='chemie');restored.resolutionSupersessions=config.resolutionSupersessions;restored.resolutionWithdrawals=config.resolutionWithdrawals;assert(eq(pcopy,original))
 report.inMemoryProspectiveWithdrawalRemoved=true
 report.configDelta={before:count(config),prospectiveOnly:count(pconfig),removedWithdrawal:withdrawal[0],addedEdges,allOtherFieldsExact:true,prospectiveObjectSha256:sha(stableGoalBookJson(prospective)),writtenConfigFiles:0}
 phase='authoritative-scope'
 const scope=loadAuthoritativeScope(pconfig),ledger=read(resolve(F,pconfig.semanticKindLedgerPath))
 report.authoritativeScope={landscapePin:pin(resolve(F,pconfig.landscapePath)),ledgerPin:pin(resolve(F,pconfig.semanticKindLedgerPath)),landscapeId:scope.landscape.landscapeId,
 denominator:scope.denominator,totalCanonicalGoals:scope.rawGoalById.size,atomicGoalIds:[...scope.atomicGoalIds],issues:scope.issues,allCurrentSourcesActuallyFingerprinted:true}
 if(scope.issues.length)report.findings.push(...scope.issues)
 phase='semantic-retirement-proof'
 const indices=pconfig.resolutionIndexPaths.map((path:string)=>({path,index:read(resolve(F,path))}))
 const proof=validateResolutionSemanticRetirements({config:pconfig,landscape:scope.rawLandscape,semanticKindLedger:ledger,indices,scopeIssues:scope.issues})
 report.semanticRetirementProof={registeredIndicesRead:indices.length,retirementCount:pconfig.resolutionSemanticRetirements.length,issues:[...proof.issues],digestsByIndex:[...proof.digestsByIndex].map(([path,digests]:any)=>({path,bindings:[...digests].map(([goalId,historicalResolutionDigest]:any)=>({goalId,historicalResolutionDigest}))}))}
 if(proof.issues.length)report.findings.push(...proof.issues)
 phase='prospective-supersession-structure'
 const chains=buildResolutionSupersessionChains(pconfig.resolutionSupersessions,pconfig.resolutionIndexPaths,scope.atomicGoalIds,proof)
 const chain=chains.chains.find((c:any)=>c.goalId===goalId);assert(chain);assert.deepEqual(chain.indexPaths,chainPaths)
 report.supersessionStructure={declaredEdges:pconfig.resolutionSupersessions.length,chainCount:chains.chains.length,issues:chains.issues,invalidGoalIds:[...chains.invalidGoalIds],targetChain:chain}
 report.findings.push(...chains.issues)
 const supersededByIndex=new Map<string,Set<string>>()
 for(const {goalId,indexPaths} of chains.chains)for(const path of indexPaths.slice(0,-1)){const ids=supersededByIndex.get(path)??new Set<string>();ids.add(goalId);supersededByIndex.set(path,ids)}
 const withdrawnByIndex=new Map<string,Map<string,string>>(),withdrawnOwners=new Set<string>(),supersededOwners=new Set(pconfig.resolutionSupersessions.map((e:any)=>e.goalId)),withdrawalIssues:string[]=[]
 for(const w of pconfig.resolutionWithdrawals){
  if(!pconfig.resolutionIndexPaths.includes(w.indexPath)||!scope.atomicGoalIds.has(w.goalId)||supersededOwners.has(w.goalId)||withdrawnOwners.has(w.goalId)||!/^sha256:[0-9a-f]{64}$/u.test(w.historicalResolutionDigest)||w.reason.trim().length===0){withdrawalIssues.push(`invalid description-resolution withdrawal for ${w.goalId}`);continue}
  withdrawnOwners.add(w.goalId);const m=withdrawnByIndex.get(w.indexPath)??new Map();m.set(w.goalId,w.historicalResolutionDigest);withdrawnByIndex.set(w.indexPath,m)
 }
 report.prospectiveWithdrawalCoherence={issues:withdrawalIssues,preservedCount:pconfig.resolutionWithdrawals.length};report.findings.push(...withdrawalIssues)
 const validatedIndices:any[]=[];report.indexValidations=[];report.originalRoundProvenance=[]
 for(const [position,path] of chainPaths.entries()){
  phase=`index-${position+1}-stock-validation`;console.log(JSON.stringify({event:'validateResolutionIndex-begin',path,at:new Date().toISOString()}))
  const superseded=supersededByIndex.get(path)??new Set<string>(),withdrawn=withdrawnByIndex.get(path)??new Map<string,string>(),t=performance.now()
  report.exactValidateResolutionIndexCallCount++
  const result=await validateResolutionIndex(path,pconfig,scope,superseded,withdrawn,proof)
  const serialized=serialResult(path,result,superseded,withdrawn,performance.now()-t)
  validatedIndices.push({path,...result});report.indexValidations.push(serialized)
  console.log(JSON.stringify({event:'validateResolutionIndex-end',path,issues:result.issues.length,ready:result.ready.size,target059:serialized.target059,elapsedMilliseconds:serialized.elapsedMilliseconds,at:new Date().toISOString()}))
  write(`INDEX-${position+1}.stock-validation.json`,serialized)
  report.findings.push(...result.issues)
  phase=`index-${position+1}-original-round-provenance`
  const prior=priorDiagnostic.history.find((h:any)=>h.indexPath===path);assert(prior)
  const index=read(resolve(F,path));assert.equal(pin(resolve(F,path)).sha256,prior.indexPin.sha256)
  const entry=index.resolutions.find((e:any)=>e.goalId===goalId),group=index.groups.find((g:any)=>g.groupId===entry.groupId),groupRoot=resolve(F,dirname(path),group.artifactDirectory??group.groupId)
  const resolutionPath=resolve(F,dirname(path),entry.resolutionPath),resolution=read(resolutionPath)
  assert.equal(pin(resolutionPath).sha256,prior.resolutionPin.sha256)
  const summaryPath=resolve(F,dirname(path),group.dualSummaryPath),dualSummaryBytes=readFileSync(summaryPath),dualSummary=JSON.parse(dualSummaryBytes.toString());assert.equal(sha(dualSummaryBytes),group.dualSummaryDigest)
  const rounds:any[]=[]
  for(const name of ['round-a','round-b']){
   const roundRoot=resolve(groupRoot,name),bundle=read(resolve(roundRoot,'review-bundle-manifest.json')),input=read(resolve(roundRoot,'description-review-input.json')),campaign=read(resolve(roundRoot,'description-review-campaign.json'))
   const loaded=await resultModule.loadGoalDescriptionReviewCampaignResultDirectories({campaign,batchesDirectory:resolve(roundRoot,'batches'),resultsDirectory:resolve(roundRoot,'results')})
   const artifacts={bundle,input,campaign,resultPairs:loaded.resultPairs}
   const extracted=resolutionModule.extractGoalDescriptionDualRoundResolutionSource({artifacts,goalId,label:name})
   const which=name==='round-a'?'first':'second',bindingMatches=extracted.source?eq(extracted.source.binding,resolution.rounds[which]):false
   rounds.push({name,artifacts,loadErrors:loaded.errors,sourceErrors:extracted.errors,actualSource:extracted.source,bindingMatchesArchivedResolution:bindingMatches})
  }
  const dualValidation=await dualModule.validateGoalDescriptionReviewDualRound({first:rounds[0].artifacts,second:rounds[1].artifacts,diversityPolicy:dualSummary.diversity?.policy==='require_distinct_provider_or_model'?'require_distinct_provider_or_model':'report_only'})
  const freshSummaryMatches=eq(dualSummary,dualValidation.summary)
  const bundleArtifacts=rounds[0].artifacts.bundle.artifacts.map((a:any)=>{const physical=resolve(groupRoot,'bundle',a.path),actual=pin(physical);return {role:a.role,path:a.path,declaredDigest:a.digest,actualPin:actual,matches:a.digest===actual.sha256&&a.bytes===actual.bytes}})
  const issues=[...rounds.flatMap((r:any)=>[...r.loadErrors,...r.sourceErrors,...(!r.bindingMatchesArchivedResolution?['Actual source binding differs from archived resolution']:[])]),...dualValidation.errors,...(!freshSummaryMatches?['Persisted dual summary differs from fresh stock dual-round validation']:[]),...bundleArtifacts.filter((a:any)=>!a.matches).map((a:any)=>`Original bundle artifact differs: ${a.path}`)]
  const inputGoal=rounds[0].artifacts.input.goals.find((g:any)=>g.goalId===goalId)
  const actualCanonical=scope.rawGoalById.get(goalId)
  const provenance={path,indexPin:pin(resolve(F,path)),resolutionPin:pin(resolutionPath),issues,freshDualSummaryMatchesPersisted:freshSummaryMatches,
   actualOriginalSourceRecords:rounds.map((r:any)=>({name:r.name,loadErrors:r.loadErrors,sourceErrors:r.sourceErrors,bindingMatchesArchivedResolution:r.bindingMatchesArchivedResolution,actualSource:r.actualSource})),
   originalBundleArtifacts:bundleArtifacts,declaredResolutionStatus:resolution.status,declaredResolutionDecision:resolution.decision,
   currentCanonicalBinding:{currentCanonicalGoal:actualCanonical,currentSemanticDecision:ledger.decisions.find((d:any)=>d.goalId===goalId),resolutionGoal:resolution.goal,inputGoal,
    expectedCurrentGoalFingerprint:evidenceModule.fingerprintGoalForEvidence(actualCanonical,model.GOAL_BOOK_GOAL_FINGERPRINT_RULE_VERSION,'curricularAtomic'),currentInputGoalFingerprintMatches:inputGoal.goalFingerprint===evidenceModule.fingerprintGoalForEvidence(actualCanonical,model.GOAL_BOOK_GOAL_FINGERPRINT_RULE_VERSION,'curricularAtomic'),
    canonicalContextMatchesCurrent:eq(inputGoal.canonicalContext,campaignModule.buildGoalDescriptionCanonicalContext(actualCanonical)),
    finalBilingualTextMatchesCurrent:eq(resolution.goal.finalText,{titleDe:actualCanonical.title,titleEn:actualCanonical.titleEn,descriptionDe:actualCanonical.description,descriptionEn:actualCanonical.descriptionEn}),
    pageSelfFingerprintMatches:resolutionModule.fingerprintGoalDescriptionReviewPage(inputGoal.reviewContext.page)===inputGoal.pageFingerprint,
    nativeCurrentReadinessFromActualStockIndex:result.ready.has(goalId)}}
  report.originalRoundProvenance.push(provenance);report.findings.push(...issues)
 }
 assert.equal(report.exactValidateResolutionIndexCallCount,3)
 phase='chain-result'
 const holds=hasIntactResolutionSupersessionChain(chain,validatedIndices,proof)
 report.chainResult={intact:holds,computedFromActualReturnedHistoricalClaimedClaimedReadyAndIssues:true,target059ByIndex:report.indexValidations.map((r:any)=>({path:r.path,...r.target059,issueCount:r.issues.length})),historicalReady:false,
  currentEndpointReady:validatedIndices.at(-1).ready.has(goalId),endpoint:chainPaths.at(-1),originalSourceRoundIssues:report.originalRoundProvenance.flatMap((p:any)=>p.issues)}
 const endpoint=report.originalRoundProvenance.at(-1).currentCanonicalBinding
 report.currentEndpointActualCanonicalBinding=endpoint
 const technicalJustification=scope.issues.length===0&&proof.issues.length===0&&chains.issues.length===0&&withdrawalIssues.length===0&&holds&&report.findings.length===0&&endpoint.currentInputGoalFingerprintMatches&&endpoint.canonicalContextMatchesCurrent&&endpoint.finalBilingualTextMatchesCurrent&&endpoint.pageSelfFingerprintMatches
 report.withdrawalRetirementAssessment={technicalCurrentReplacementJustifiesProspectiveRetirement:technicalJustification,actualWithdrawalRetired:false,
  historicalReason:withdrawal[0].reason,
  interpretation:technicalJustification?'Actual stock validation supports the conditional current replacement and chronological chain. The historical withdrawal reason remains preserved; applying a withdrawal retirement remains a separate root decision.':'The conditional chain or current binding failed; the actual validation does not justify retirement of the active withdrawal.',
  noNegativeScienceOrUnresolvedDissentWaived:true,newScientificVotes:0}
 if(!holds)report.findings.push('Conditional 059 supersession chain is not intact under actual three-index stock results')
 if(!technicalJustification)exitCode=2
 assert.equal(sha(readFileSync(configPath)),sha(originalBytes))
 report.originalConfigBytesUnchanged=true
}catch(error){
 exitCode=1;report.executionError=error instanceof Error?{name:error.name,message:error.message,stack:error.stack}:{message:String(error)}
 console.error(error)
}finally{
 phase='final-observed-source-recheck'
 const changedAfter:any[]=[]
 for(const value of [...observed.values()]){
  if(value.path.startsWith(O+sep))continue
  try{const bytes=rawRead(value.path);if(sha(bytes)!==value.sha256||bytes.length!==value.bytes)changedAfter.push({before:value,after:{sha256:sha(bytes),bytes:bytes.length}})}catch(error){changedAfter.push({path:value.path,error:String(error)})}
 }
 report.observedSourceIntegrity={observedInputCount:observed.size,changesDuringRead:observedChanges,changesAtEnd:changedAfter,allObservedSourcesUnchanged:observedChanges.length===0&&changedAfter.length===0}
 if(observedChanges.length||changedAfter.length)exitCode=3
 report.finishedAt=new Date().toISOString();report.elapsedMilliseconds=performance.now()-started;report.scriptExitCode=exitCode
 write('RESULT.059-conditional-three-index-actual-stock-validation.json',report)
 write('INPUTS.observed-read-pins.json',{sourceRoot:F,mode:'Observed exact sync/async file reads plus static relative source-module closure',pins:[...observed.values()].sort((a,b)=>a.path.localeCompare(b.path)),failedReads,changesDuringRead:observedChanges,changesAtEnd:changedAfter})
 console.log(JSON.stringify({event:'complete',exitCode,durationMilliseconds:report.elapsedMilliseconds,scopeDenominator:report.authoritativeScope?.denominator,indexCalls:report.exactValidateResolutionIndexCallCount,chainIntact:report.chainResult?.intact,currentEndpointReady:report.chainResult?.currentEndpointReady,technicalRetirementJustified:report.withdrawalRetirementAssessment?.technicalCurrentReplacementJustifiesProspectiveRetirement,findings:report.findings.length,observedInputs:observed.size,applicationPerformed:false},null,2))
 process.exitCode=exitCode
}
