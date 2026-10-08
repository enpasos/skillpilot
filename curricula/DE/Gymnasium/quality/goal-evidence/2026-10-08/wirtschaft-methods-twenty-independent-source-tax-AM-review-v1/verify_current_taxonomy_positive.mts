// Apache-2.0. Independent native technical check on inert reviewed P candidates.
import { readFile, writeFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { createRequire } from 'node:module'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { fingerprintGoalForPositiveEvidence, fingerprintPositiveGoalEvidenceProfile,
  fingerprintPositiveGoalEvidenceReviewInput, validatePositiveGoalEvidenceRecordSemantics,
} from '../../../../../../../app/scripts/positiveGoalEvidenceProfileModel.ts'
const directory=dirname(fileURLToPath(import.meta.url)), root=resolve(directory,'../../../../../../..')
const author=resolve(directory,'../wirtschaft-project-markets-international-methods-twenty-bilingual-author-v1')
const require=createRequire(resolve(root,'app/package.json'))
const Ajv2020=require('ajv/dist/2020.js').default, addFormats=require('ajv-formats').default
const hash=(b:string|Buffer)=>`sha256:${createHash('sha256').update(b).digest('hex')}`
const goalsBytes=await readFile(resolve(author,'whole-goals.with-individual-taxonomy.candidate.json'))
const candidatesBytes=await readFile(resolve(author,'positive.candidates.author-v3.json'))
const criteriaBytes=await readFile(resolve(author,'authoring-review.criteria.md'))
const schemaBytes=await readFile(resolve(root,'contracts/goal-evidence/v2/goal-evidence-profile.schema.json'))
const goals=JSON.parse(goalsBytes.toString()), candidates=JSON.parse(candidatesBytes.toString()), schema=JSON.parse(schemaBytes.toString())
const ajv=new Ajv2020({allErrors:true,strict:false});addFormats(ajv);const validate=ajv.compile(schema)
const registry=JSON.parse(await readFile(resolve(root,'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'),'utf8'))
const subject=registry.subjects.find((x:any)=>x.landscapePath==='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json')
if(!subject)throw new Error('No registered Economics semantic ledger')
const kindBytes=await readFile(resolve(root,subject.semanticKindLedgerPath)), ledger=JSON.parse(kindBytes.toString())
const kinds=new Map(ledger.decisions.filter((x:any)=>x.decisionStatus==='authoritative').map((x:any)=>[x.goalId,x.semanticKind]))
const records:any[]=[],errors:any[]=[]
const reviewedAt=new Date().toISOString()
for(let i=0;i<goals.length;i++){
 const goal=goals[i],candidate=candidates.goals[i]
 if(goal.id!==candidate.goalId||kinds.get(goal.id)!=='curricularAtomic')throw new Error(`Input mismatch ${goal.id}`)
 const record={$schema:schema.$id,schemaVersion:2,reviewId:'wirtschaft-methods-twenty-independent-content-20261008-v1',
  goalFingerprintRuleVersion:'goal-evidence-v1',profileRuleVersion:'positive-understanding-evidence-v2',
  reviewCriteriaFingerprint:hash(criteriaBytes),landscapeId:'605bdaf6-32d5-56fd-8d92-5a80c2fd2901',goalId:goal.id,
  goalFingerprint:fingerprintGoalForPositiveEvidence(goal,'curricularAtomic'),
  reviewInputFingerprint:fingerprintPositiveGoalEvidenceReviewInput(goal,hash(criteriaBytes),{},'curricularAtomic'),
  profileFingerprint:fingerprintPositiveGoalEvidenceProfile(candidate.profile),status:'needs_human_review',reviewAuthority:'ai_candidate',
  reviewedAt,reviewer:'/root/economics_visual_memory_audit; independent machine substantive inspection; OpenAI/Codex session exact serving model not exposed',
  reason:'Entire bilingual goal, both complete profile cases and expectations were independently inspected; see the goal-specific whole substantive receipt. This inert technical record has no final image resource digest or human approval.',
  evidenceLevel:candidate.evidenceLevel,maximumClaimScope:candidate.maximumClaimScope,reviewRunIds:[],dissent:[],profile:candidate.profile}
 if(!validate(record))errors.push({goalId:goal.id,schemaErrors:validate.errors})
 const semanticErrors=validatePositiveGoalEvidenceRecordSemantics(record as any,goal,{},'curricularAtomic')
 if(semanticErrors.length)errors.push({goalId:goal.id,semanticErrors})
 records.push(record)
}
const receipt={role:'actual_independent_native_technical_check_on_current_taxonomy_inert_candidates',createdAt:reviewedAt,
 candidateCount:records.length,passed:errors.length===0,errors,
 wholeCurrentTaxonomyGoalSha256:hash(goalsBytes),positiveProfileCandidateSha256:hash(candidatesBytes),schemaSha256:hash(schemaBytes),
 reviewCriteriaSha256:hash(criteriaBytes),actualSemanticKindLedgerPath:subject.semanticKindLedgerPath,actualSemanticKindLedgerSha256:hash(kindBytes),
 nativeFunctions:'app/scripts/positiveGoalEvidenceProfileModel.ts',authorHistoricalAB1SmokeReused:false,
 resourceDigestsSupplied:{},finalImageBoundPositiveGateClaim:false,regionalSourceProjectionApprovalClaim:false,
 activeWrites:0,newStrictClosures:0,humanApprovalClaim:false,
 limits:['Candidate status remains inert; the separate machine substantive disposition accepts content only.',
 'Current taxonomy fields are included in real native goal/input fingerprints.',
 'Final PNG/source/page integration needs exact applicable current inputs; this is not an active Gate P record.']}
await writeFile(resolve(directory,'native-current-taxonomy-positive-twenty.actual.receipt.json'),JSON.stringify(receipt,null,2)+'\n',{flag:'wx'})
if(errors.length){console.error(JSON.stringify(errors,null,2));process.exit(1)}
await writeFile(resolve(directory,'native-current-taxonomy-positive-twenty.records.inert.jsonl'),records.map(x=>JSON.stringify(x)).join('\n')+'\n',{flag:'wx'})
console.log(`PASS ${records.length} independent inert closed-v2 records against current individual taxonomy and authoritative curricularAtomic kinds; active strict closures 0.`)
