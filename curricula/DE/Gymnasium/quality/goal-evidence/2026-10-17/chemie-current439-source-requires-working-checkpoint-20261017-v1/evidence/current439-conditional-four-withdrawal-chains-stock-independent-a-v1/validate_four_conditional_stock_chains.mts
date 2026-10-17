import fs from 'node:fs'
import fsp from 'node:fs/promises'
import {syncBuiltinESMExports} from 'node:module'
import {createHash} from 'node:crypto'
import {dirname,resolve,relative,sep,extname} from 'node:path'
import {fileURLToPath} from 'node:url'
import assert from 'node:assert/strict'
const N='/mnt/e/skillpilot-chemie-L7-20261017/current439-AV-and-native-registry-integration-root-v1/capsule'
const O=dirname(fileURLToPath(import.meta.url))
const planPath=resolve(N,'../PLAN.conditional-D107-paired26-and66-edges-no-activation.json')
const modulePath=resolve(N,'app/scripts/reportDeepUnderstandingRollout.ts')
const previousLoaderPath='/mnt/e/skillpilot-chemie-L7-20261017/059-conditional-chain-current-stock-validation-technical-c-v1/STOCK.loadAuthoritativeScope.exact-source.ts.txt'
const sha=(b:any)=>'sha256:'+createHash('sha256').update(b).digest('hex')
const rawRead=fs.readFileSync.bind(fs),rawAsyncRead=fsp.readFile.bind(fsp)
const observed=new Map<string,any>(),changesDuringRead:any[]=[],failedReads:any[]=[]
let phase='bootstrap'
function observe(p:any,data:any,opt:any){
 if(typeof p!=='string' && !(p instanceof URL))return
 const path=typeof p==='string'?resolve(p):fileURLToPath(p)
 assert(!(/native14[^/]*\/(round-[ab]|.*results)|native14-independent-[ab]/.test(path)),'Upcoming native14 review output must not be read')
 const encoding=typeof opt==='string'?opt:opt?.encoding
 const bytes=Buffer.isBuffer(data)?data:Buffer.from(data,encoding??'utf8')
 const value={path,sha256:sha(bytes),bytes:bytes.length,firstPhase:phase,phases:[phase],reads:1}
 const old=observed.get(path)
 if(old){if(old.sha256!==value.sha256||old.bytes!==value.bytes)changesDuringRead.push({before:old,after:value});old.reads++;if(!old.phases.includes(phase))old.phases.push(phase)}else observed.set(path,value)
}
;(fs as any).readFileSync=function(p:any,opt:any){try{const d=rawRead(p,opt);observe(p,d,opt);return d}catch(e){failedReads.push({path:String(p),phase,error:String(e)});throw e}}
;(fsp as any).readFile=async function(p:any,opt:any){try{const d=await rawAsyncRead(p,opt);observe(p,d,opt);return d}catch(e){failedReads.push({path:String(p),phase,error:String(e)});throw e}}
syncBuiltinESMExports()
const stock=await import('/mnt/e/skillpilot-chemie-L7-20261017/current439-AV-and-native-registry-integration-root-v1/capsule/app/scripts/reportDeepUnderstandingRollout.ts')
const model=await import('/mnt/e/skillpilot-chemie-L7-20261017/current439-AV-and-native-registry-integration-root-v1/capsule/app/scripts/goalBookModel.ts')
const {fingerprintSemanticKindSourceGoal,stableGoalBookJson}=model
const {duplicateValues,loadDeepUnderstandingRolloutConfig,validateResolutionIndex,validateResolutionSemanticRetirements,buildResolutionSupersessionChains,hasIntactResolutionSupersessionChain}=stock
const readFileSync=fs.readFileSync.bind(fs)
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'))
const pin=(p:string)=>{const b=readFileSync(p);return {path:resolve(p),sha256:sha(b),bytes:b.length}}
const write=(name:string,obj:any)=>{const p=resolve(O,name);assert.equal(dirname(p),O);assert(!fs.existsSync(p));fs.writeFileSync(p,JSON.stringify(obj,null,2)+'\n')}
const repoRoot=N
const resolveRepoPath=(configuredPath:string)=>{const p=resolve(repoRoot,configuredPath),r=relative(repoRoot,p);if(r==='..'||r.startsWith(`..${sep}`))throw new Error(`Path leaves repository: ${configuredPath}`);return p}
const loadJson=<T>(configuredPath:string):T=>JSON.parse(readFileSync(resolveRepoPath(configuredPath),'utf8')) as T
const addIssue=(issues:string[],scope:string,message:string)=>issues.push(`${scope}: ${message}`)
const semanticKinds=['curricularAtomic','curricularArea','practiceAssessment','programStructure','memory','runtimeSupport','orientation'] as const
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
 for(const m of text.matchAll(/(?:from\s*|import\s*\()\s*['"](\.[^'"]+)['"]/g)){
  const base=resolve(dirname(path),m[1]);const found=[base,base+'.ts',base+'.tsx',resolve(base,'index.ts')].find(p=>fs.existsSync(p)&&fs.statSync(p).isFile())
  if(found&&['.ts','.tsx','.js','.mjs'].includes(extname(found)))captureSourceModules(found,seen)
 }
}
const serial=(r:any)=>({...r,ready:[...r.ready],claimedGoalIds:[...r.claimedGoalIds],historicalClaimedGoalIds:[...r.historicalClaimedGoalIds]})
const startedAt=new Date().toISOString(),start=performance.now()
const report:any={schemaVersion:1,role:'Independent read-only targeted four conditional withdrawal chain validation against current N using unchanged stock functions',sourceRoot:N,startedAt,newScienceVotes:0,activeWithdrawalRemoved:false,configActivationPerformed:false,fullCentralRun:false,compilerOrBuildRun:false,humanApprovalClaim:false,indexValidationCalls:[],findings:[],limitations:['Only entire stock-valid indices count. Raw per-goal ready values in an index with any issue do not clear a current claim.','No claims about the other51 stale contexts, full439 readiness or M7. Holds remain outside this exact targeted check.','No native14 A/B review outputs read.']}
let exitCode=0
try{
 phase='stock-source-and-exact-loader';captureSourceModules(modulePath);pin(fileURLToPath(import.meta.url));pin(resolve(N,'app/package.json'));const st=readFileSync(modulePath,'utf8');const a=st.indexOf('const loadAuthoritativeScope = '),b=st.indexOf('\nconst loadAtomicityReadyGoals = ',a);const exact=st.slice(a,b);assert.equal(readFileSync(previousLoaderPath,'utf8'),exact+'\n');assert.equal(readFileSync(resolve(O,'STOCK.loadAuthoritativeScope.exact-source.ts.txt'),'utf8'),exact+'\n');assert(readFileSync(fileURLToPath(import.meta.url),'utf8').includes(exact));report.scopeLoader={bodySha256:sha(exact),unchangedExactBodyVerified:true,previousExactBodyMatches:true,method:'Byte-identical private stock body; unchanged stock fingerprint helper and duplicateValues; repoRoot=N'}
 phase='conditional-plan-and-stock-config-load';const planPin=pin(planPath);assert.equal(planPin.sha256,'sha256:a1bb4745578b7509b0887ed32cd7aa6abb5c075d28428aa7392122481b0218d5');const plan=read(planPath);report.planPin=planPin;for(const k of ['sourceConfig','candidateConfig']){const expected=plan[k],actual=pin(expected.path);assert.equal(actual.sha256,'sha256:'+expected.sha256);assert.equal(actual.bytes,expected.bytes);report[k+'Pin']=actual}
 const loaded=loadDeepUnderstandingRolloutConfig(plan.candidateConfigRelativePath);const config=loaded.subjects.find((x:any)=>x.subject==='chemie');assert(config);assert.equal(loaded.subjects.length,1);assert.equal(config.resolutionIndexPaths.length,107);assert.equal(config.resolutionSupersessions.length,280);assert.equal(config.resolutionWithdrawals.length,3);assert.equal(config.resolutionSemanticRetirements.length,3);assert.deepEqual(config,read(plan.candidateConfig.path).subjects[0]);report.stockConfigLoad={reportId:loaded.reportId,indices:107,supersessionEdges:280,withdrawals:config.resolutionWithdrawals,semanticRetirements:3,loadedWithoutMutation:true,nodeOptions:process.env.NODE_OPTIONS}
 const original=read(plan.sourceConfig.path).subjects.find((x:any)=>x.subject==='chemie');report.originalSevenActiveWithdrawalHistory=original.resolutionWithdrawals;assert.equal(original.resolutionWithdrawals.length,7);assert.deepEqual(config.resolutionWithdrawals,original.resolutionWithdrawals.filter((w:any)=>!plan.conditionalWithdrawalRetirements.some((t:any)=>t.goalId===w.goalId)));assert.deepEqual(config.resolutionWithdrawals,plan.originalSevenWithdrawalsPreservedInHistory.filter((w:any)=>!plan.conditionalWithdrawalRetirements.some((t:any)=>t.goalId===w.goalId)))
 phase='actual-authoritative-scope';const scope=loadAuthoritativeScope(config);report.authoritativeScope={denominator:scope.denominator,totalCanonicalGoals:scope.rawGoalById.size,atomicGoalIds:[...scope.atomicGoalIds],issues:scope.issues,landscapePin:pin(resolve(N,config.landscapePath)),ledgerPin:pin(resolve(N,config.semanticKindLedgerPath))};assert.equal(scope.denominator,439);assert.equal(scope.issues.length,0)
 phase='semantic-retirement-proof';const indices=config.resolutionIndexPaths.map((path:string)=>({path,index:read(resolve(N,path))}));const proof=validateResolutionSemanticRetirements({config,landscape:scope.rawLandscape,semanticKindLedger:read(resolve(N,config.semanticKindLedgerPath)),indices,scopeIssues:scope.issues});report.semanticRetirementProof={registeredIndicesRead:indices.length,issues:proof.issues,digestsByIndex:[...proof.digestsByIndex].map(([path,digests]:any)=>({path,bindings:[...digests].map(([goalId,historicalResolutionDigest]:any)=>({goalId,historicalResolutionDigest}))}))};assert.equal(proof.issues.length,0)
 phase='all-candidate-chains';const all=buildResolutionSupersessionChains(config.resolutionSupersessions,config.resolutionIndexPaths,scope.atomicGoalIds,proof);report.allCandidateChainStructure={chainCount:all.chains.length,invalidGoalIds:[...all.invalidGoalIds],issues:all.issues};const supersededByIndex=new Map<string,Set<string>>();for(const c of all.chains)for(const path of c.indexPaths.slice(0,-1)){const set=supersededByIndex.get(path)??new Set<string>();set.add(c.goalId);supersededByIndex.set(path,set)};report.supersededByIndexFromAllCandidateChains=[...supersededByIndex].map(([path,set])=>({path,goalIds:[...set]}));const withdrawnByIndex=new Map<string,Map<string,string>>();const supersededGoals=new Set(config.resolutionSupersessions.map((e:any)=>e.goalId)),seenWithdrawn=new Set<string>();for(const w of config.resolutionWithdrawals){assert(config.resolutionIndexPaths.includes(w.indexPath));assert(scope.atomicGoalIds.has(w.goalId));assert(!supersededGoals.has(w.goalId));assert(!seenWithdrawn.has(w.goalId));assert(/^sha256:[0-9a-f]{64}$/.test(w.historicalResolutionDigest));assert(w.reason.trim());seenWithdrawn.add(w.goalId);const map=withdrawnByIndex.get(w.indexPath)??new Map<string,string>();map.set(w.goalId,w.historicalResolutionDigest);withdrawnByIndex.set(w.indexPath,map)}
 const targets=plan.conditionalWithdrawalRetirements;assert.equal(targets.length,4);const chains=targets.map((t:any)=>{const c=all.chains.find((c:any)=>c.goalId===t.goalId);assert(c);assert(c.indexPaths.includes(t.indexPath));assert(!all.invalidGoalIds.has(t.goalId));return c});report.targetChains=chains;const native6=config.resolutionIndexPaths.find((x:string)=>x.includes('chemie-current439-native6-actual-context-remediation-technical-v1/native-six/resolution-index.json'));assert(native6);const union=[...new Set([...chains.flatMap((c:any)=>c.indexPaths),native6])];report.targetIndexUnion=union;console.log(JSON.stringify({phase:'target-union',indexCount:union.length,chainLengths:chains.map((c:any)=>({goalId:c.goalId,length:c.indexPaths.length})),native6}))
 phase='actual-whole-index-stock-validation';const validation:any[]=[];for(const [i,path] of union.entries()){const started=performance.now();const res=await validateResolutionIndex(path,config,scope,supersededByIndex.get(path),withdrawnByIndex.get(path),proof);const row={path,...res};validation.push(row);const raw={path,elapsedMilliseconds:Math.round(performance.now()-started),supersededGoalIds:[...(supersededByIndex.get(path)??[])],withdrawnDigests:[...(withdrawnByIndex.get(path)??[])],wholeIndexValid:res.issues.length===0,...serial(res)};write(`INDEX-${String(i+1).padStart(2,'0')}.actual-stock-validation.json`,raw);report.indexValidationCalls.push(raw);console.log(JSON.stringify({phase:'index-completed',number:i+1,total:union.length,path,wholeIndexValid:raw.wholeIndexValid,readyCount:raw.ready.length,issues:raw.issues.length,elapsedMilliseconds:raw.elapsedMilliseconds}))}
 phase='exact-four-chain-integrity-and-original-digests';report.conditionalWithdrawalAssessments=targets.map((t:any)=>{const c=chains.find((c:any)=>c.goalId===t.goalId);const originalIndex=indices.find((i:any)=>i.path===t.indexPath)!.index;const ent=originalIndex.resolutions.filter((e:any)=>e.goalId===t.goalId);assert.equal(ent.length,1);const originalResolution=resolve(dirname(resolve(N,t.indexPath)),ent[0].resolutionPath);const originalPin=pin(originalResolution);const digestMatches=originalPin.sha256===t.historicalResolutionDigest&&ent[0].resolutionDigest===t.historicalResolutionDigest;const owner=c.indexPaths.at(-1)!;const ownerVal=validation.find(v=>v.path===owner);const wholeChainValid=c.indexPaths.every((p:string)=>{const x=validation.find(v=>v.path===p);return x&&x.issues.length===0});const intact=hasIntactResolutionSupersessionChain(c,validation,proof);return {goalId:t.goalId,preservedHistoricalWithdrawal:t,originalResolutionPin:originalPin,originalIndexResolutionDigest:ent[0].resolutionDigest,originalClaimDigestMatchesExactly:digestMatches,chain:c,allWholeChainIndicesValid:wholeChainValid,hasIntactResolutionSupersessionChain:intact,currentOwnerIndexPath:owner,currentOwnerWholeIndexValid:ownerVal?.issues.length===0,currentOwnerClaims:ownerVal?.claimedGoalIds.has(t.goalId)??false,currentOwnerReady:ownerVal?.ready.has(t.goalId)??false,conditionalTechnicalRetirementJustified:scope.issues.length===0&&proof.issues.length===0&&digestMatches&&intact,activeWithdrawalRemoved:false}})
 const six=validation.find(v=>v.path===native6);report.native6EndpointChecks=['93b914d4-747d-5b22-90ff-ac6320514b44','e22a34d4-ac1e-5afe-8f77-0dfa4fd9f44f'].map(goalId=>{const c=all.chains.find((c:any)=>c.goalId===goalId);return {goalId,candidateChain:c,currentOwnerIndexPath:c?.indexPaths.at(-1),ownerIsNative6:c?.indexPaths.at(-1)===native6,wholeNative6IndexValid:six.issues.length===0,claimed:six.claimedGoalIds.has(goalId),ready:six.ready.has(goalId),currentReplacementEndpointProved:c?.indexPaths.at(-1)===native6&&six.issues.length===0&&six.claimedGoalIds.has(goalId)&&six.ready.has(goalId),fullEarlierChainValidationClaim:false}});report.summary={wholeIndexCount:validation.length,wholeValidIndices:validation.filter(x=>x.issues.length===0).length,invalidIndices:validation.filter(x=>x.issues.length>0).length,conditionalFourChains:report.conditionalWithdrawalAssessments.map((x:any)=>({goalId:x.goalId,intact:x.hasIntactResolutionSupersessionChain,originalDigestExact:x.originalClaimDigestMatchesExactly,currentOwnerReady:x.currentOwnerReady,wholeOwnerValid:x.currentOwnerWholeIndexValid,conditionalRetirementJustified:x.conditionalTechnicalRetirementJustified})),native6WholeIndexValid:six.issues.length===0,native6ReplacementEndpointsProved:report.native6EndpointChecks.every((x:any)=>x.currentReplacementEndpointProved),other51RemainHolds:true,newScienceVotes:0,activationPerformed:false};console.log(JSON.stringify(report.summary,null,2))
}catch(e){exitCode=2;report.executionError={error:String(e),stack:(e as Error).stack};console.error(e)}
phase='endguard';const changesAtEnd:any[]=[];for(const value of observed.values()){if(value.path.startsWith(O+sep))continue;try{const b=rawRead(value.path);const now={sha256:sha(b),bytes:b.length};if(now.sha256!==value.sha256||now.bytes!==value.bytes)changesAtEnd.push({before:value,after:now})}catch(e){changesAtEnd.push({path:value.path,error:String(e)})}};report.endguard={observedInputCount:observed.size,changesDuringRead,changesAtEnd,allObservedSourceInputsUnchanged:changesDuringRead.length===0&&changesAtEnd.length===0};if(changesDuringRead.length||changesAtEnd.length)exitCode=3;report.completedAt=new Date().toISOString();report.elapsedMilliseconds=Math.round(performance.now()-start);report.exitCode=exitCode;write('INPUTS.observed-read-pins.json',{sourceRoot:N,pins:[...observed.values()].sort((a,b)=>a.path.localeCompare(b.path)),failedReads,changesDuringRead,changesAtEnd});write('RESULT.actual-stock-four-withdrawal-chains-and-native6.json',report);write('EXECUTION.completed.json',{startedAt,completedAt:report.completedAt,elapsedMilliseconds:report.elapsedMilliseconds,exitCode,allObservedSourceInputsUnchanged:report.endguard.allObservedSourceInputsUnchanged});process.exitCode=exitCode
