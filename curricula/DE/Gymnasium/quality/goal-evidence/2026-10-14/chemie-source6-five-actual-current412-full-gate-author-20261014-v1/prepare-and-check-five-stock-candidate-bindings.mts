// Apache-2.0. Author records and unchanged stock schemas/models, not independent science.
import {createHash} from 'node:crypto'
import {readFileSync,writeFileSync} from 'node:fs'
import {createRequire} from 'node:module'
import {fileURLToPath} from 'node:url'
import {resolve,relative} from 'node:path'
import {
 fingerprintGoalForPositiveEvidence,fingerprintPositiveGoalEvidenceReviewInput,fingerprintPositiveGoalEvidenceProfile,
 validatePositiveGoalEvidenceRecordSemantics,
} from '/home/enpasos/projects/skillpilot/app/scripts/positiveGoalEvidenceProfileModel.ts'
import {normalizeGoalEvidenceText,stableGoalEvidenceJson} from '/home/enpasos/projects/skillpilot/app/scripts/goalEvidenceProfileModel.ts'
import {reviewPositiveGoalEvidenceConfig} from '/home/enpasos/projects/skillpilot/app/scripts/positiveGoalEvidenceReview.ts'
import {normalizeCanonicalLandscape,validateCanonicalLandscape} from '/home/enpasos/projects/skillpilot/app/src/utils/authoring/canonicalAuthoring.ts'
const R='/home/enpasos/projects/skillpilot',O=resolve(fileURLToPath(new URL('.',import.meta.url)))
const require=createRequire(resolve(R,'app/package.json'));const Ajv=require('ajv/dist/2020').default,addFormats=require('ajv-formats')
const ajv=new Ajv({allErrors:true,strict:true});addFormats(ajv)
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8')),rel=(p:string)=>relative(R,p)
const write=(n:string,x:unknown)=>writeFileSync(resolve(O,n),JSON.stringify(x,null,2)+'\n')
const hash=(s:string|Buffer)=>'sha256:'+createHash('sha256').update(s).digest('hex')
const canonicalPath=resolve(O,'candidate/canonical539.prospective-current412-on-actual280.author-only.json')
const landscape=read(canonicalPath),by=new Map(landscape.goals.map((g:any)=>[g.id,g]))
const source=read(resolve(O,'P/five-whole-author-profile-bodies.before-stock-fingerprint.json'))
const criteriaPath=resolve(O,'P/criteria.whole-five-author-E0-G0.md'),criteriaFingerprint=hash(readFileSync(criteriaPath))
const reviewId='chemie-source6-five-current412-full-gate-author-20261014-v1',now=new Date().toISOString()
const validateProfile=ajv.compile(read(resolve(R,'contracts/goal-evidence/v2/goal-evidence-profile.schema.json')))
const records=source.profiles.map((p:any)=>{
 const g=by.get(p.goalId) as any
 const record={$schema:'https://skillpilot.com/schemas/goal-evidence/v2/goal-evidence-profile.schema.json',schemaVersion:2,reviewId,
  goalFingerprintRuleVersion:'goal-evidence-v1',profileRuleVersion:'positive-understanding-evidence-v2',reviewCriteriaFingerprint:criteriaFingerprint,
  landscapeId:landscape.landscapeId,goalId:g.id,goalFingerprint:fingerprintGoalForPositiveEvidence(g,'curricularAtomic'),
  reviewInputFingerprint:fingerprintPositiveGoalEvidenceReviewInput(g,criteriaFingerprint,{},'curricularAtomic'),
  profileFingerprint:fingerprintPositiveGoalEvidenceProfile(p.profile),status:'needs_human_review',reviewAuthority:'ai_candidate',
  reviewedAt:now,reviewer:'Codex Source6 author successor; historical Source-B and conditional-plan author roles disclosed; not independent',
  reason:'Author design only: complete bilingual inline materials, tasks, solutions and rubrics are bound through the criteria digest. No execution, learner work, independent acceptance or new source/course grant. Prospective curricularAtomic classification is explicit input to low-level fingerprinting only and remains unapproved for operative selection.',
  evidenceLevel:'E0',maximumClaimScope:'G0',reviewRunIds:[],dissent:[],profile:p.profile}
 if(!validateProfile(record))throw new Error(JSON.stringify(validateProfile.errors))
 const errors=validatePositiveGoalEvidenceRecordSemantics(record as any,g,{},'curricularAtomic');if(errors.length)throw new Error(JSON.stringify(errors))
 return record
})
writeFileSync(resolve(O,'P/five-current-whole-goal-author-E0-G0.profiles.jsonl'),records.map((x:any)=>JSON.stringify(x)).join('\n')+'\n')
const input=read(resolve(O,'INPUTS.actual280-whole-source-conditions-and-protected-readonly-bindings.json'))
const pconfig={$schema:'https://skillpilot.com/schemas/goal-evidence/v2/goal-evidence-review-config.schema.json',schemaVersion:2,
 reviewId,goalFingerprintRuleVersion:'goal-evidence-v1',profileRuleVersion:'positive-understanding-evidence-v2',
 reviewCriteriaPath:rel(criteriaPath),reviewedResourceTypes:['goal-visualization'],requireApproved:false,
 landscapeId:landscape.landscapeId,landscapePath:rel(canonicalPath),
 semanticKindLedgerPath:rel(resolve(O,'inputs/semantic533.actual407-base.immutable-hardlink.json')),
 reviewPath:rel(resolve(O,'P/five-current-whole-goal-author-E0-G0.profiles.jsonl')),
 scope:{label:'Five unapproved author candidates; current407 semantic ledger has no authoritative decisions for these five',goalIds:records.map((r:any)=>r.goalId)}}
const validateConfig=ajv.compile(read(resolve(R,'contracts/goal-evidence/v2/goal-evidence-review-config.schema.json')))
if(!validateConfig(pconfig))throw new Error(JSON.stringify(validateConfig.errors))
write('config/P5.author-E0-G0.NONOPERATIVE-pending-five-classifications.config.json',pconfig)
const authorAdvice=read(resolve(O,'AUTHOR.five-semantic-atomicity-and-memory-proposals.not-independent.json'))
const fingerprint=(g:any,ruleVersion:string)=>hash(stableGoalEvidenceJson({ruleVersion,goalId:g.id,shortKey:g.shortKey??'',title:normalizeGoalEvidenceText(g.title),titleEn:normalizeGoalEvidenceText(g.titleEn),
 description:normalizeGoalEvidenceText(g.description),descriptionEn:normalizeGoalEvidenceText(g.descriptionEn),phase:normalizeGoalEvidenceText(g.dimensionTags?.phase),
 area:normalizeGoalEvidenceText(g.dimensionTags?.area),topicCode:normalizeGoalEvidenceText(g.dimensionTags?.topicCode),nodeKind:normalizeGoalEvidenceText(g.nodeKind)}))
for(const lane of ['A','M']){
 const ruleVersion=lane==='A'?'semantic-atomicity-v1':'memory-card-review-v1'
 const rs=authorAdvice.rows.map((a:any)=>{
  const g=by.get(a.goalId)as any
  return {schemaVersion:1,reviewId,ruleVersion,landscapeId:landscape.landscapeId,goalId:g.id,fingerprint:fingerprint(g,ruleVersion),
   status:'needs_developer_review',...(lane==='A'?{semanticAtomic:null}:{memoryUseful:null}),reviewedAt:now,
   reviewer:'Codex author proposal only; independent A/M decision pending',
   reason:(lane==='A'?'AUTHOR recommends atomic: '+a.semanticAtomicityReasonDe:'AUTHOR recommends no_memory_needed: '+a.memoryReasonDe)+' Pending genuine independent review; not an accepted gate decision.'}
 })
 writeFileSync(resolve(O,`${lane}/five-${lane}-unapproved-author-candidates.jsonl`),rs.map((x:any)=>JSON.stringify(x)).join('\n')+'\n')
 if(lane==='M')writeFileSync(resolve(O,'M/empty-new-card-review-stream.jsonl'),'')
 write(`config/${lane}5.author-pending-review.config.json`,{schemaVersion:1,reviewId,ruleVersion,landscapeId:landscape.landscapeId,landscapePath:rel(canonicalPath),
  reviewPath:rel(resolve(O,`${lane}/five-${lane}-unapproved-author-candidates.jsonl`)),
  ...(lane==='M'?{cardReviewPath:rel(resolve(O,'M/empty-new-card-review-stream.jsonl'))}:{}),
  scope:{label:'Five author proposals, all needs_developer_review; no A/M gate grant',leafGoalIds:rs.map((r:any)=>r.goalId)}})
}
const baseline=read(resolve(O,'inputs/canonical533.actual280-base.immutable-hardlink.json'))
const before=validateCanonicalLandscape(normalizeCanonicalLandscape(baseline)),after=validateCanonicalLandscape(normalizeCanonicalLandscape(landscape))
const newErrors=after.filter((x:any)=>x.severity==='error'&&!before.some((b:any)=>JSON.stringify(x)===JSON.stringify(b)))
if(newErrors.length)throw new Error(JSON.stringify(newErrors))
// Run the actual normal P configuration function: it must HOLD the five unapproved classifications.
const fullP=reviewPositiveGoalEvidenceConfig(rel(resolve(O,'config/P5.author-E0-G0.NONOPERATIVE-pending-five-classifications.config.json')))
write('checks/STOCK.normal-P5-configuration-actual-HOLD-missing-five-authoritative-classifications.json',fullP)
const errors=(fullP as any).errors??[]
if(!records.every((r:any)=>errors.some((e:string)=>e.includes(r.goalId)&&e.includes('no authoritative semantic-kind decision'))))throw new Error('Expected five classification HOLDs not present')
write('checks/STOCK.P5-exact-original-schemas-model-fingerprints-and-canonical-DAG.author-only.actual.json',{
 schemaVersion:1,checkedAt:now,unchangedStockFunctions:true,lowLevelP5SchemasAndSemanticFingerprintsPass:true,
 explicitEffectiveKindForLowLevelAuthorCandidateOnly:'curricularAtomic',operativeSemanticAuthorityCreated:false,
 normalConfigSchemaPass:true,normalP5FullSelection:'HOLD_MISSING_FIVE_AUTHORITATIVE_CLASSIFICATIONS',
 actualNormalP5Errors:errors,wholeCanonicalBeforeNodes:533,wholeCanonicalAfterNodes:539,newCanonicalErrors:newErrors,
 semanticAtomicityAndMemoryRowsAll:'needs_developer_review',newIndependentScienceVotes:0,
 allProfilesE0G0CandidateOnly:records.every((r:any)=>r.evidenceLevel==='E0'&&r.maximumClaimScope==='G0'&&r.status==='needs_human_review'&&r.reviewAuthority==='ai_candidate'&&r.reviewRunIds.length===0),
 authorModelAndStructureOnlyNotGatePass:true})
console.log(JSON.stringify({profiles:records.length,schemaAndCurrentFP:5,normalPClassificationHolds:errors.filter((e:string)=>e.includes('no authoritative semantic-kind decision')).length,newCanonicalErrors:newErrors.length,A5Pending:true,M5Pending:true,newGateClosures:0}))
