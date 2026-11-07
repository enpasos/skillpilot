// SPDX-License-Identifier: Apache-2.0
// Read-only semantic/partition proof; does not create new P judgments or records.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from 'node:fs'
import { resolve, relative } from 'node:path'
import Ajv2020 from '../../../app/node_modules/ajv/dist/2020.js'
import { reviewPositiveGoalEvidenceConfig } from '../../../app/scripts/positiveGoalEvidenceReview'
import { validatePositiveGoalEvidenceRecordSemantics } from '../../../app/scripts/positiveGoalEvidenceProfileModel'

const root=process.cwd(),sha=(b:Uint8Array|string)=>createHash('sha256').update(b).digest('hex')
const load=(path:string)=>JSON.parse(readFileSync(path,'utf8'))
const candidatePath='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json'
assert.equal(sha(readFileSync(candidatePath)),'b2155f4167f104e5b8eef183f7bb9a7a792a873a9e5d009d5083e0bc84c68cfd','Run only in the declared read-only candidate overlay')
const candidate=load(candidatePath),byId=new Map(candidate.goals.map((g:any)=>[g.id,g]))
const rollout=load('curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json').subjects.find((r:any)=>r.subject==='mathematik')
const ids=new Set(['0c2ddfcd-1399-41ad-aaed-4f061812602a','ce198bc9-b014-52ba-814f-25cc3e020668','d07ef7b1-8bd2-56e0-9e74-d90c3c3e02fe'])
const schema=load('contracts/goal-evidence/v2/goal-evidence-review-config.schema.json')
const validate=new Ajv2020({allErrors:true,strict:true}).compile(schema)
const ledger=load(rollout.semanticKindLedgerPath),kinds=new Map(ledger.decisions.map((r:any)=>[r.goalId,r.semanticKind]))
const temporary=mkdtempSync(resolve(root,'tmp/math-three-description-preparer-20261106/positive-plan-'))
const carriers:any[]=[],oldScope:string[]=[],retainedAll:string[]=[],freshAll:string[]=[],allOldGlobal:string[]=[]
try {
 for(const configPath of rollout.positiveEvidenceConfigPaths){
  const config=load(configPath);allOldGlobal.push(...config.scope.goalIds)
  const changed=config.scope.goalIds.filter((id:string)=>ids.has(id));if(!changed.length)continue
  assert.equal(changed.length,1)
  const originalBytes=readFileSync(config.reviewPath)
  assert.deepEqual(Buffer.from(originalBytes.toString('utf8'),'utf8'),originalBytes,'The retained-line proof requires exact UTF-8 roundtrip')
  const lines=originalBytes.toString('utf8').split(/(?<=\n)/u).filter(Boolean)
  const rows=lines.map((line:string,index:number)=>({line,index,record:JSON.parse(line)}))
  assert.deepEqual(rows.map((r:any)=>r.record.goalId),config.scope.goalIds)
  oldScope.push(...config.scope.goalIds);freshAll.push(...changed)
  const retained=rows.filter((r:any)=>!ids.has(r.record.goalId)),removed=rows.filter((r:any)=>ids.has(r.record.goalId))
  const retainedBytes=Buffer.from(retained.map((r:any)=>r.line).join(''),'utf8')
  const retainedPath=resolve(temporary,`retained-${carriers.length}.review.jsonl`);writeFileSync(retainedPath,retainedBytes)
  const retainedIds=retained.map((r:any)=>r.record.goalId);retainedAll.push(...retainedIds)
  const privateConfig={...config,reviewPath:relative(root,retainedPath),scope:{...config.scope,label:'Unchanged exact retained subset',goalIds:retainedIds}}
  const privateConfigPath=resolve(temporary,`retained-${carriers.length}.config.json`);writeFileSync(privateConfigPath,JSON.stringify(privateConfig))
  assert.ok(validate(privateConfig),JSON.stringify(validate.errors))
  const native=reviewPositiveGoalEvidenceConfig(relative(root,privateConfigPath))
  assert.deepEqual(native.errors,[])
  const oldNative=reviewPositiveGoalEvidenceConfig(configPath)
  assert.equal(oldNative.errors.length,1);assert.ok(oldNative.errors[0].includes('stale reviewInputFingerprint'))
  const resources=(goal:any)=>Object.fromEntries((config.reviewedResourceTypes.includes('goal-visualization')?goal.resourceLinks??[]:[]).filter((l:any)=>l.type==='goal-visualization').map((l:any)=>[l.url,'sha256:'+sha(readFileSync('app/public'+l.url))]))
  for(const row of retained){const goal:any=byId.get(row.record.goalId);assert.deepEqual(validatePositiveGoalEvidenceRecordSemantics(row.record,goal,resources(goal),kinds.get(goal.id)as string),[])}
  const badConfig={...privateConfig,reviewPath:config.reviewPath};const badPath=resolve(temporary,`outside-${carriers.length}.config.json`);writeFileSync(badPath,JSON.stringify(badConfig))
  const rejected=reviewPositiveGoalEvidenceConfig(relative(root,badPath));assert.ok(rejected.errors.some((error:string)=>error.includes('outside the configured scope')))
  const slug=changed[0]==='0c2ddfcd-1399-41ad-aaed-4f061812602a'?'diagrams':changed[0]==='ce198bc9-b014-52ba-814f-25cc3e020668'?'inverse-matrices':'integer-order'
  const futureRoot='curricula/DE/Gymnasium/quality/goal-evidence/2026-11-06/math-three-current'
  const plannedConfig={...config,reviewPath:`${futureRoot}/retained-${slug}.review.jsonl`,scope:{...config.scope,label:`Exact unchanged retained ${slug} rows`,goalIds:retainedIds}}
  assert.ok(validate(plannedConfig))
  carriers.push({oldConfigPath:configPath,oldConfigSha256:sha(readFileSync(configPath)),oldReviewPath:config.reviewPath,oldReviewRawSha256:sha(originalBytes),oldScope:config.scope.goalIds,removedGoalIds:changed,
   retainedGoalIds:retainedIds,retainedRowCount:retained.length,retainedCarrierRawSha256:sha(retainedBytes),retainedCarrierRawBytes:retainedBytes.length,
   retainedRows:retained.map((r:any)=>({originalLine:r.index+1,goalId:r.record.goalId,rawLineSha256:sha(r.line)})),
   futureConfigPath:`${futureRoot}/retained-${slug}.config.json`,futureConfig:plannedConfig,
   nativeCandidateRetainedErrors:native.errors,nativeOldCompleteCarrierOnCandidateErrors:oldNative.errors,
   narrowedConfigWithUnfilteredOldJsonlRejected:true,nativeOutsideScopeErrors:rejected.errors,
   existingRecordsRewritten:false})
 }
 assert.equal(carriers.length,3);assert.equal(oldScope.length,31);assert.equal(retainedAll.length,28);assert.deepEqual([...new Set(freshAll)].sort(),[...ids].sort())
 const freshIds=[['0c2ddfcd-1399-41ad-aaed-4f061812602a','ce198bc9-b014-52ba-814f-25cc3e020668'],['d07ef7b1-8bd2-56e0-9e74-d90c3c3e02fe']]
 const fresh=freshIds.map((goalIds,index)=>{
  const sample=carriers.find(c=>c.oldScope.includes(goalIds[0])).futureConfig
  const name=index===0?'image-two':'image-free-one',base='curricula/DE/Gymnasium/quality/goal-evidence/2026-11-06/math-three-current'
  const config={...sample,reviewId:`mathematik-three-current-${name}-20261106-v1`,reviewPath:`${base}/fresh-${name}.review.jsonl`,reviewRunManifestPaths:[],scope:{label:`New independently authored current ${name} candidates`,goalIds}}
  assert.ok(validate(config));assert.deepEqual(config.reviewedResourceTypes,index===0?['goal-visualization']:[])
  return {futureConfigPath:`${base}/fresh-${name}.config.json`,futureConfig:config,requiredNewCandidateGoalIds:goalIds,candidateSetNotAuthored:true,reviewRecordsNotMaterialized:true}
 })
 const complete=[...retainedAll,...fresh.flatMap(f=>f.requiredNewCandidateGoalIds)]
 assert.equal(new Set(complete).size,31);assert.deepEqual([...complete].sort(),[...oldScope].sort())
 const unaffected=allOldGlobal.filter(id=>!oldScope.includes(id)),newGlobal=[...unaffected,...complete]
 assert.equal(new Set(allOldGlobal).size,allOldGlobal.length);assert.deepEqual([...newGlobal].sort(),[...allOldGlobal].sort())
 const result={schemaVersion:1,status:'exact-replacement-plan-native-retained-proof-fresh-three-not-yet-authored',candidateSha256:sha(readFileSync(candidatePath)),carriers,freshConfigs:fresh,
  partition:{oldScopeCount:31,retainedByteIdenticalRows:28,requiredNewRows:3,plannedUnionCount:31,plannedDuplicateGoalIds:0,activeGlobalPositiveScopeBefore:allOldGlobal.length,plannedActiveGlobalPositiveScopeAfter:newGlobal.length,activeGlobalGoalSetPreserved:true},
  activationSteps:['Preserve all original configs/JSONL files as history. Reconstruct exactly the guarded retained raw lines; keep reviewId and unchanged resource policy.','Actually author and date three current P candidate contents/reasons against the exact candidate context. Use two narrow resource-policy configs and the existing native candidate materializer. Do not update old fingerprints in place.','Validate all five candidate carriers/configs natively. Only then coordinate replacing exactly three active config paths with three retained plus two fresh paths; preserve every other configured goal.'],
  fullReplacementCurrentlyReady:false,missingActuallyAuthoredFreshCandidateRows:[...ids],activeSourceQaOrRegistryWrites:false}
 writeFileSync('qa-artifacts/ci-contract-audit/2026-11-06/math-orientation-three-normalization-plan/positive-replacement-plan.json',JSON.stringify(result,null,2)+'\n')
 console.log(JSON.stringify({retainedNativeValid:28,oldCarriersNativelyStale:3,unfilteredSubsetNegatives:3,plannedUnion:31,globalPositiveScope:allOldGlobal.length,freshCandidatesAuthored:0,ready:false}))
} finally {rmSync(temporary,{recursive:true,force:true})}
