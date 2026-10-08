// Apache-2.0. Author-only native technical smoke check on inert authored P candidates.
import { readFile, writeFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { createRequire } from 'node:module'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { fingerprintGoalForPositiveEvidence, fingerprintPositiveGoalEvidenceProfile,
  fingerprintPositiveGoalEvidenceReviewInput, validatePositiveGoalEvidenceRecordSemantics,
} from '../../../../../../../app/scripts/positiveGoalEvidenceProfileModel.ts'
const directory=dirname(fileURLToPath(import.meta.url)), root=resolve(directory,'../../../../../../..')
const author=directory
const require=createRequire(resolve(root,'app/package.json'))
const Ajv2020=require('ajv/dist/2020.js').default, addFormats=require('ajv-formats').default
const hash=(b:string|Buffer)=>`sha256:${createHash('sha256').update(b).digest('hex')}`
const goalsBytes=await readFile(resolve(author,'whole-goals.candidate.json'))
const candidatesBytes=await readFile(resolve(author,'positive.candidates.author-v1.json'))
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
 const record={$schema:schema.$id,schemaVersion:2,reviewId:'wirtschaft-by-ten-bounded-positive-author-successor-20261008-v3',
  goalFingerprintRuleVersion:'goal-evidence-v1',profileRuleVersion:'positive-understanding-evidence-v2',
  reviewCriteriaFingerprint:hash(criteriaBytes),landscapeId:'605bdaf6-32d5-56fd-8d92-5a80c2fd2901',goalId:goal.id,
  goalFingerprint:fingerprintGoalForPositiveEvidence(goal,'curricularAtomic'),
  reviewInputFingerprint:fingerprintPositiveGoalEvidenceReviewInput(goal,hash(criteriaBytes),{},'curricularAtomic'),
  profileFingerprint:fingerprintPositiveGoalEvidenceProfile(candidate.profile),status:'needs_human_review',reviewAuthority:'ai_candidate',
  reviewedAt,reviewer:'/root/economics_visual_memory_audit original author; /root/economics_gate_audit bounded successor author only; no independent self-review',
  reason:'Candidate authored from bounded actual source reading; no independent substantive approval has occurred. This inert technical record has no final image resource digest or human approval.',
  evidenceLevel:candidate.evidenceLevel,maximumClaimScope:candidate.maximumClaimScope,reviewRunIds:[],dissent:[],profile:candidate.profile}
 if(!validate(record))errors.push({goalId:goal.id,schemaErrors:validate.errors})
 const semanticErrors=validatePositiveGoalEvidenceRecordSemantics(record as any,goal,{},'curricularAtomic')
 if(semanticErrors.length)errors.push({goalId:goal.id,semanticErrors})
 records.push(record)
}

const {normalizeCanonicalLandscape,validateCanonicalLandscape}=await import('../../../../../../../app/src/utils/authoring/canonicalAuthoring.ts')
const fullBytes=await readFile(resolve(directory,'whole-current-root-with-only-ten-specific-profile-candidates.inert.json'))
const full=JSON.parse(fullBytes.toString()), graphDiagnostics=validateCanonicalLandscape(normalizeCanonicalLandscape(full))
const goalMap=new Map(full.goals.map((g:any)=>[g.id,g])),done=new Set<string>(),active=new Set<string>(),requiresDiagnostics:any[]=[]
const visit=(id:string)=>{if(active.has(id)){requiresDiagnostics.push({goalId:id,error:'requires cycle'});return};if(done.has(id))return;active.add(id);for(const ref of (goalMap.get(id) as any)?.requires??[]){if(!goalMap.has(ref)){requiresDiagnostics.push({goalId:id,error:'missing requires',ref});continue};visit(ref)};active.delete(id);done.add(id)}
for(const id of goalMap.keys())visit(id as string)
if(graphDiagnostics.length||requiresDiagnostics.length)errors.push({graphDiagnostics,requiresDiagnostics})
const receipt={role:'actual_author_only_native_schema_semantics_smoke_check_on_inert_candidates',createdAt:reviewedAt,
 candidateCount:records.length,wholeCandidateGoalCount:full.goals.length,containsNativeDiagnostics:graphDiagnostics,requiresExplicitDAGDiagnostics:requiresDiagnostics,wholeInertCandidateSha256:hash(fullBytes),passed:errors.length===0,errors,
 wholeCurrentTaxonomyGoalSha256:hash(goalsBytes),positiveProfileCandidateSha256:hash(candidatesBytes),schemaSha256:hash(schemaBytes),
 reviewCriteriaSha256:hash(criteriaBytes),actualSemanticKindLedgerPath:subject.semanticKindLedgerPath,actualSemanticKindLedgerSha256:hash(kindBytes),
 nativeFunctions:'app/scripts/positiveGoalEvidenceProfileModel.ts',authorHistoricalAB1SmokeReused:false,
 resourceDigestsSupplied:{},finalImageBoundPositiveGateClaim:false,regionalSourceProjectionApprovalClaim:false,
 activeWrites:0,newStrictClosures:0,humanApprovalClaim:false,
 limits:['Candidate status remains inert; all content/source/A/M/tax proposals require independent substantive review.',
 'Current taxonomy fields are included in real native goal/input fingerprints.',
 'Final PNG/source/page integration needs exact applicable current inputs; this is not an active Gate P record.']}
await writeFile(resolve(directory,'native-authored-ten-positive.actual.receipt.json'),JSON.stringify(receipt,null,2)+'\n',{flag:'wx'})
if(errors.length){console.error(JSON.stringify(errors,null,2));process.exit(1)}
await writeFile(resolve(directory,'native-authored-ten-positive.records.inert.jsonl'),records.map(x=>JSON.stringify(x)).join('\n')+'\n',{flag:'wx'})
console.log(`PASS ${records.length} author-only inert closed-v2 records against current individual taxonomy and authoritative curricularAtomic kinds; active strict closures 0.`)
