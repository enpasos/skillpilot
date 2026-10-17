import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import vm from 'node:vm'
import ts from '/home/enpasos/projects/skillpilot/app/node_modules/typescript/lib/typescript.js'
import { fingerprintGoalForPositiveEvidence } from '/home/enpasos/projects/skillpilot/app/scripts/positiveGoalEvidenceProfileModel.ts'

const root='/mnt/e/skillpilot-chemie-L7-20261017/chemie-four-description-conditions-independent-A-M-v1'
const repo='/home/enpasos/projects/skillpilot'
const N='/mnt/e/skillpilot-chemie-L7-20261017/current439-AV-and-native-registry-integration-root-v1/capsule'
const read=(file:string)=>JSON.parse(fs.readFileSync(path.join(root,file),'utf8'))
const sha=(bytes:Buffer|string)=>crypto.createHash('sha256').update(bytes).digest('hex')
const first=read('FIRST.independent-A-M-science.json')
const firstSeal=read('FIRST.seal.json')
assert.equal(sha(fs.readFileSync(firstSeal.path)),firstSeal.sha256)
const serializedAtUTC=new Date().toISOString()
assert.ok(new Date(serializedAtUTC)>new Date(firstSeal.sealedAtUTC))
const sourcePins:any[]=[]

function stockFingerprint(lane:'A'|'M') {
 const sourcePath=path.join(repo,'app/scripts',lane==='A'?'semanticAtomicityReview.ts':'memoryCardReview.ts')
 const source=fs.readFileSync(sourcePath,'utf8')
 const names=lane==='A'?['normalizeText','stableJson','getSemanticPayload','fingerprintGoal']:['normalizeText','stableJson','fingerprintGoal']
 const exact=names.map(name=>{
  const start=source.indexOf(`function ${name}(`)
  assert.ok(start>=0)
  const end=source.indexOf('\n}\n',start)
  assert.ok(end>start)
  return source.slice(start,end+2)
 }).join('\n\n')
 const extractPath=path.join(root,`STOCK-${lane}.exact-fingerprint-declarations.ts`)
 fs.writeFileSync(extractPath,exact+'\n')
 const compiled=ts.transpileModule(exact+'\nfingerprintGoal;',{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.None}}).outputText
 const callable=vm.runInNewContext(compiled,{createHash:crypto.createHash})
 sourcePins.push({lane,sourcePath,sourceSha256:sha(source),exactExtractPath:extractPath,exactExtractSha256:sha(fs.readFileSync(extractPath)),execution:'Exact current stock private declarations extracted verbatim, transpiled and evaluated; unmodified CLI verifies generated rows afterwards'})
 return callable
}
const fpA=stockFingerprint('A')
const fpM=stockFingerprint('M')
const goals=JSON.parse(fs.readFileSync(first.authorCandidate.path,'utf8'))
assert.equal(sha(fs.readFileSync(first.authorCandidate.path)),first.authorCandidate.sha256)
const byId=new Map(goals.goals.map((g:any)=>[g.id,g]))
const reviewA='chemie-four-description-conditions-independent-A-20261017-v1'
const reviewM='canonical-chemistry-full'
const aRows:any[]=[],mRows:any[]=[],proof:any[]=[]
for(const observation of first.records){
 const input=JSON.parse(fs.readFileSync(observation.input.path,'utf8'))
 const oldGoal=input.currentWholeGoal
 const goal:any=byId.get(observation.goalId)
 assert.deepEqual(goal,input.newWholeGoal)
 const oldFp=input.safeWholeScientificContext.goalFingerprint
 const candidates=[undefined,'curricularAtomic'].filter(kind=>fingerprintGoalForPositiveEvidence(oldGoal,kind)===oldFp)
 assert.equal(candidates.length,1,'Must recover exact current scientific fingerprint semantic-kind condition')
 const effectiveSemanticKind=candidates[0]
 const newGoalFP=fingerprintGoalForPositiveEvidence(goal,effectiveSemanticKind)
 const common={schemaVersion:1,landscapeId:goals.landscapeId,goalId:goal.id,reviewedAt:first.observationsSealedAtUTC,reviewer:first.reviewer}
 aRows.push({...common,reviewId:reviewA,ruleVersion:'semantic-atomicity-v1',fingerprint:fpA(goal,'semantic-atomicity-v1'),status:'atomic',semanticAtomic:true,reason:observation.atomicityRationale+` Eigene aktuelle Prüfung, FIRST sha256:${firstSeal.sha256}; technische Serialisierung separat ${serializedAtUTC}. Keine D/P- oder Human-Freigabe.`,suggestedSplit:[]})
 mRows.push({...common,reviewId:reviewM,ruleVersion:'memory-card-review-v1',fingerprint:fpM(goal,'memory-card-review-v1'),status:'no_memory_needed',memoryUseful:false,reason:observation.memoryRationale+` Eigene aktuelle Prüfung, FIRST sha256:${firstSeal.sha256}; keine neue Memory-Scope-, Karten- oder Sichtbarkeitsverpflichtung. Technische Serialisierung separat ${serializedAtUTC}.`})
 proof.push({goalId:goal.id,effectiveSemanticKind:effectiveSemanticKind??'unspecified',oldGoalFingerprint:oldFp,newGoalFingerprint:newGoalFP,currentPProfileFingerprint:observation.currentProfileFingerprint,oldAFingerprint:fpA(oldGoal,'semantic-atomicity-v1'),newAFingerprint:fpA(goal,'semantic-atomicity-v1'),oldMFingerprint:fpM(oldGoal,'memory-card-review-v1'),newMFingerprint:fpM(goal,'memory-card-review-v1'),scientificDecisionMadeAgain:true,oldFingerprintMerelyRebound:false,semanticAtomic:true,memoryStatus:'no_memory_needed',newCards:0,newVisibilityObligations:0})
}
const aPath=path.join(root,'A4.independent-current-description.review.jsonl')
const mPath=path.join(root,'M4.independent-current-description.review.jsonl')
fs.writeFileSync(aPath,aRows.map(r=>JSON.stringify(r)).join('\n')+'\n')
fs.writeFileSync(mPath,mRows.map(r=>JSON.stringify(r)).join('\n')+'\n')
fs.writeFileSync(path.join(root,'M4.no-new-cards.review.jsonl'),'')
const ids=first.records.map((r:any)=>r.goalId)
const base={schemaVersion:1,landscapeId:goals.landscapeId,landscapePath:first.authorCandidate.path,scope:{label:'Only four description-condition changes; bounded proof selection, no new authored memory scope',leafGoalIds:ids}}
fs.writeFileSync(path.join(root,'A4.independent-current-description.config.json'),JSON.stringify({...base,reviewId:reviewA,ruleVersion:'semantic-atomicity-v1',reviewPath:aPath},null,2)+'\n')
const existing=read('INPUT.current-central-memory-four-reference.json')
const scopes=existing.config.visibilityScopes.map((scope:any)=>({...scope,viewPath:path.resolve(N,scope.viewPath)}))
fs.writeFileSync(path.join(root,'M4.independent-current-description.config.json'),JSON.stringify({...base,reviewId:reviewM,ruleVersion:'memory-card-review-v1',reviewPath:mPath,cardReviewPath:path.join(root,'M4.no-new-cards.review.jsonl'),reportPath:path.join(root,'M4.stock-proof-report.md'),visibilityScopeCoverageRequired:existing.config.visibilityScopeCoverageRequired,visibilityScopes:scopes},null,2)+'\n')
fs.writeFileSync(path.join(root,'PROOF.current-four-goal-fingerprints-and-decisions.json'),JSON.stringify({schemaVersion:1,role:'Actual stock fingerprint bindings after own sealed scientific A/M decisions',observationsSealedAtUTC:first.observationsSealedAtUTC,firstSealedAtUTC:firstSeal.sealedAtUTC,serializedAtUTC,first:firstSeal,sourcePins,existingVisibilityScopeCount:scopes.length,visibilityScopesScientificallyChanged:false,records:proof,humanApproval:false,DApproval:false,centralIntegration:false},null,2)+'\n')
console.log(JSON.stringify({A:aRows.length,M:mRows.length,newCards:0,retainedExistingVisibilityScopes:scopes.length,serializedAtUTC,records:proof.map(r=>({goalId:r.goalId,newGoalFingerprint:r.newGoalFingerprint}))},null,2))
