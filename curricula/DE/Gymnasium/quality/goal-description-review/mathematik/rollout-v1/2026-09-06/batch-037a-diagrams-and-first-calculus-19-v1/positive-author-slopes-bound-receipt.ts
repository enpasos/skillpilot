import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
import {readFileSync} from 'node:fs'
import {buildPositiveGoalEvidenceCandidateRecords} from '../../../../../../../../../app/scripts/materializePositiveGoalEvidenceCandidates'
import {reviewPositiveGoalEvidenceConfig} from '../../../../../../../../../app/scripts/positiveGoalEvidenceReview'

async function main(){
const prefix='curricula/DE/Gymnasium/quality/goal-evidence/canonical-math-positive-understanding-evidence-rollout-v1-batch-037r-slopes-repaired-1-v1',base='curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-09-06/batch-037a-diagrams-and-first-calculus-19-v1'
const json=(p:string)=>JSON.parse(readFileSync(p,'utf8'))
const sha=(x:Buffer|string)=>'sha256:'+createHash('sha256').update(x).digest('hex')
const config=json(prefix+'.config.json'),candidateSet=json(prefix+'.candidates.json')
const historicalPath=base+'/positive-author-unbound-7c0dee9b-draft.json'
const historical=json(historicalPath)
assert.deepEqual(candidateSet.goals[0].profile,historical.goal.profile)
assert.equal(candidateSet.goals.length,1)
assert.equal(candidateSet.goals[0].goalId,'7c0dee9b-a827-456d-9f88-b196fc4e9a13')
const landscape=json(config.landscapePath),ledger=json(config.semanticKindLedgerPath)
const goal=landscape.goals.find((g:any)=>g.id===candidateSet.goals[0].goalId)
assert.equal(goal.titleEn,'Determine secant, tangent, and normal slopes')
assert.equal(goal.descriptionEn,'The learner can determine secant, tangent, and normal slopes on function graphs and interpret the calculated slopes using appropriate mathematical terminology.')
assert.equal(goal.description,'Die lernende Person kann Sekanten-, Tangenten- und Normalensteigungen an Funktionsgraphen bestimmen und die berechneten Steigungen fachsprachlich deuten.')
assert.equal(goal.resourceLinks.find((r:any)=>r.type==='goal-visualization').url,'/assets/goal-visualizations/mathematik/7c0dee9b-a827-456d-9f88-b196fc4e9a13/7c0dee9b-a827-456d-9f88-b196fc4e9a13.png')
const kind=ledger.decisions.find((g:any)=>g.goalId===goal.id)
assert.equal(kind.decisionStatus,'authoritative');assert.equal(kind.semanticKind,'curricularAtomic')
const near=(a:number,b:number)=>assert.ok(Math.abs(a-b)<1e-12)
near((8-0)/(2-0),4);near(3*1**2,3);near(3*(-1/3),-1)
near(((3-2)**2-(2-2)**2)/(3-2),1);near(2*(2-2),0)
const records=await buildPositiveGoalEvidenceCandidateRecords({config,candidateSet})
const record=records[0]
assert.equal(records.length,1);assert.equal(record.status,'needs_human_review');assert.equal(record.reviewAuthority,'ai_candidate')
assert.equal(record.evidenceLevel,'E1');assert.equal(record.maximumClaimScope,'G1');assert.deepEqual(record.reviewRunIds,[])
assert.equal(record.profile.applicationCaseBriefs.length,2)
const reviewText=JSON.stringify(record)+'\n'
if(process.argv.includes('--review-only')){console.log(JSON.stringify({reviewText}));return}
assert.equal(readFileSync(config.reviewPath,'utf8'),reviewText)
const result=reviewPositiveGoalEvidenceConfig(prefix+'.config.json');assert.deepEqual(result.errors,[])
const paths=[prefix+'.candidates.json',prefix+'.config.json',prefix+'.review.jsonl',historicalPath,config.landscapePath,config.semanticKindLedgerPath,config.reviewCriteriaPath,'curricula/DE/Gymnasium/quality/goal-evidence/prompts/positive-understanding-evidence-profile-authoring-v2.md']
console.log(JSON.stringify({
 receiptKind:'math-b037r-slopes-current-positive-binding-v1',
 boundAt:new Date().toISOString(),
 reviewedAt:record.reviewedAt,
 originalDraftStatus:'historical unbound draft preserved byte-for-byte; this separate record is now current-bound',
 profileContentUnchanged:true,
 originalDraftSha256:sha(readFileSync(historicalPath)),
 currentGoal:goal,
 authoritativeSemanticKind:kind.semanticKind,
 artifactBindings:paths.map(path=>({path,rawSha256:sha(readFileSync(path))})),
 goalFingerprint:record.goalFingerprint,reviewInputFingerprint:record.reviewInputFingerprint,profileFingerprint:record.profileFingerprint,criteriaFingerprint:record.reviewCriteriaFingerprint,
 reviewOutputDigest:sha(reviewText),
 mathematicsChecks:[{caseId:'cubic-three-slopes',secantSlope:4,tangentSlope:3,normalSlope:-1/3,interpretation:'interval versus local slope; no angle demand'},{caseId:'vertex-three-slopes',secantSlope:1,tangentSlope:0,normalSlope:null,normalDirection:'vertical; no finite slope'}],
 nativeValidation:{status:'PASS',records:result.records.length,counts:result.counts,errors:result.errors},
 reviewRunIds:[],reviewedResourceTypes:[],
 authority:'needs_human_review / ai_candidate / E1 / G1; no human, image, normative-source or real-learner approval',
 sourceScope:'Current bilingual canonical goal and direct prerequisite/successor context reread after stable metadata signal; no new book-run binding or fresh independent authoring run claimed.'
},null,2))
}
void main().catch(error=>{console.error(error);process.exitCode=1})
