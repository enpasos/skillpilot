// Technical helper Apache-2.0. Selected author content remains CC-BY-4.0.
import { readFileSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { resolve, dirname, relative } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
const repo=process.cwd(), out=resolve(dirname(fileURLToPath(import.meta.url)),'..')
const read=(p:string)=>JSON.parse(readFileSync(resolve(repo,p),'utf8'))
const hash=(p:string)=>'sha256:'+createHash('sha256').update(readFileSync(resolve(repo,p))).digest('hex')
const write=(p:string,x:any)=>writeFileSync(resolve(out,p),JSON.stringify(x,null,2)+'\n')
const rel=(p:string)=>relative(repo,p).split('\\').join('/')
async function main(){
const models=await import(pathToFileURL(resolve(repo,'app/scripts/positiveGoalEvidenceProfileModel.ts')).href)
const stable=await import(pathToFileURL(resolve(repo,'app/scripts/goalEvidenceProfileModel.ts')).href)
const Ajv=(await import(pathToFileURL(resolve(repo,'app/node_modules/ajv/dist/2020.js')).href)).default
const formats=(await import(pathToFileURL(resolve(repo,'app/node_modules/ajv-formats/dist/index.js')).href)).default
const startedAt=new Date().toISOString()
const base=read(rel(resolve(out,'author/current20.base-goal-tuples.json')))
const canonicalBefore=hash(base.canonicalBinding.path)
if(canonicalBefore!==base.canonicalBinding.sha256)throw new Error('Current canonical drifted from selected base')
const canonical=read(base.canonicalBinding.path)
const payloads=read(rel(resolve(out,'author/whole20.profile-payloads.author.json')))
const cases=read(rel(resolve(out,'author/whole40.expanded-cases.author.json')))
const ids:string[]=base.goalIds
if(JSON.stringify(payloads.goalIds)!==JSON.stringify(ids)||JSON.stringify(cases.goalIds)!==JSON.stringify(ids))throw new Error('Scope/order mismatch')
const claim=read(base.claimBinding.path)
if(JSON.stringify(claim.goalIds)!==JSON.stringify(ids))throw new Error('Registered claim/order mismatch')
const semanticPath='curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json'
const semantic=read(semanticPath)
const sem=new Map(semantic.decisions.filter((d:any)=>d.decisionStatus==='authoritative').map((d:any)=>[d.goalId,d.semanticKind]))
const criteriaPath='curricula/DE/Gymnasium/quality/goal-evidence/prompts/chemistry-positive-understanding-evidence-profile-criteria-v1.md'
const criteriaFingerprint=hash(criteriaPath)
const schemaPath='contracts/goal-evidence/v2/goal-evidence-profile.schema.json'
const schema=read(schemaPath), ajv=new Ajv({allErrors:true,strict:false});formats(ajv);const validate=ajv.compile(schema)
const delta=read(rel(resolve(out,'author/e560.additive-resource-link.candidate.json')))
const records:any[]=[], joins:any[]=[], errors:string[]=[]
for(const gid of ids){
 const actual=canonical.goals.find((g:any)=>g.id===gid),baseGoal=base.goals.find((g:any)=>g.id===gid)
 if(JSON.stringify(actual)!==JSON.stringify(baseGoal))throw new Error(gid+': tuple drift')
 const goal=structuredClone(actual)
 if(gid===delta.goalId)goal.resourceLinks=delta.candidateResourceLinks
 const resources:Record<string,string>={},resourceBindings:any[]=[]
 for(const link of goal.resourceLinks??[]){
  if(link.type!=='goal-visualization')continue
  const activePath='app/public'+link.url
  const inputPath=gid===delta.goalId?rel(resolve(out,'visual-candidate',activePath)):activePath
  resources[link.url]=hash(inputPath)
  resourceBindings.push({futureUrl:link.url,actualAuthorInputPath:inputPath,sha256:resources[link.url],activation:gid===delta.goalId?'inactive candidate only':'unchanged existing asset'})
 }
 const profile=payloads.profiles.find((p:any)=>p.goalId===gid).profile
 const record={ $schema:'https://skillpilot.com/schemas/goal-evidence/v2/goal-evidence-profile.schema.json',schemaVersion:2,reviewId:'chemie-polymers-materials20-current402-whole-author-20261012-v1',goalFingerprintRuleVersion:'goal-evidence-v1',profileRuleVersion:'positive-understanding-evidence-v2',reviewCriteriaFingerprint:criteriaFingerprint,landscapeId:canonical.landscapeId,goalId:gid,goalFingerprint:models.fingerprintGoalForPositiveEvidence(goal,sem.get(gid)),reviewInputFingerprint:models.fingerprintPositiveGoalEvidenceReviewInput(goal,criteriaFingerprint,resources,sem.get(gid)),profileFingerprint:models.fingerprintPositiveGoalEvidenceProfile(profile),status:'needs_human_review',reviewAuthority:'ai_candidate',reviewedAt:startedAt,reviewer:'Codex author /root/chemistry_five_stable_dependency_qs/checkpoint_dependencies_readonly',reason:'Original whole bilingual author profile with two complete idealized application cases. Scoped schema/input binding only; no independent scientific review, practical execution, learner result or human approval claimed.',evidenceLevel:'E1',maximumClaimScope:'G1',reviewRunIds:[],dissent:[],profile}
 if(!validate(record))errors.push(gid+': '+ajv.errorsText(validate.errors))
 errors.push(...models.validatePositiveGoalEvidenceRecordSemantics(record,goal,resources,sem.get(gid)))
 const expanded=cases.cases.filter((c:any)=>c.goalId===gid)
 if(expanded.length!==2)errors.push(gid+': needs exact two expanded cases')
 for(const b of profile.applicationCaseBriefs){
  const c=expanded.find((c:any)=>c.caseId===b.id)
  if(!c)errors.push(gid+': case join missing '+b.id)
  else {
   for(const [bf,cf]of [['taskDemandDe','taskDe'],['taskDemandEn','taskEn'],['expectedPerformanceDe','modelAnswerDe'],['expectedPerformanceEn','modelAnswerEn']]){
    if(b[bf]!==c[cf])errors.push(gid+': brief/full case mismatch '+bf)
   }
   if(c.visualizationRequired!==false||c.rubric.length!==3||c.maximumPoints!==6)errors.push(gid+': expanded case completeness mismatch')
  }
 }
 records.push(record)
 joins.push({goalId:gid,goalFingerprint:record.goalFingerprint,reviewInputFingerprint:record.reviewInputFingerprint,profileFingerprint:record.profileFingerprint,sourceGoalTuplePath:rel(resolve(out,'author/current20.base-goal-tuples.json')),fullCasesPath:rel(resolve(out,'author/whole40.expanded-cases.author.json')),caseIds:expanded.map((c:any)=>c.caseId),resourceBindings,effectiveSemanticKind:sem.get(gid),textOrGraphChanged:false,resourceLinkChanged:gid===delta.goalId})
}
writeFileSync(resolve(out,'author/whole20.normal-v2.author-candidates.jsonl'),records.map(r=>JSON.stringify(r)).join('\n')+'\n')
write('author/whole20.exact-profile-case-input-joins.json',{schemaVersion:1,goalIds:ids,caseFileSha256:hash(rel(resolve(out,'author/whole40.expanded-cases.author.json'))),joins})
const rollout=read('curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json')
const subject=rollout.subjects.find((s:any)=>s.subject==='chemie'), mcPath=subject.memoryReviewConfigPath,mc=read(mcPath)
const raw=readFileSync(resolve(repo,mc.reviewPath),'utf8').split(/\r?\n/).filter(Boolean)
const rawById=new Map(raw.map(l=>[JSON.parse(l).goalId,l]))
const retained=ids.map(id=>rawById.get(id))
if(retained.some(l=>!l))throw new Error('Current M row missing')
const normalize=(x:any)=>String(x??'').normalize('NFKC').replace(/\s+/g,' ').trim()
for(const l of retained){
 const row=JSON.parse(l!),g=canonical.goals.find((g:any)=>g.id===row.goalId)
 const semanticPayload={ruleVersion:mc.ruleVersion,goalId:g.id,shortKey:g.shortKey??'',title:normalize(g.title),titleEn:normalize(g.titleEn),description:normalize(g.description),descriptionEn:normalize(g.descriptionEn),phase:normalize(g.dimensionTags?.phase),area:normalize(g.dimensionTags?.area),topicCode:normalize(g.dimensionTags?.topicCode),nodeKind:normalize(g.nodeKind)}
 const fp='sha256:'+createHash('sha256').update(stable.stableGoalEvidenceJson(semanticPayload)).digest('hex')
 if(fp!==row.fingerprint||row.status!=='no_memory_needed'||row.memoryUseful!==false||(row.memoryGoalIds??[]).length||(row.deckIds??[]).length)errors.push(row.goalId+': retained M current/necessity mismatch')
}
writeFileSync(resolve(out,'author/current20.memory.raw-exact-retained.jsonl'),retained.join('\n')+'\n')
write('author/current20.memory-retention.bindings.json',{schemaVersion:1,inputConfig:{path:mcPath,sha256:hash(mcPath)},inputReview:{path:mc.reviewPath,sha256:hash(mc.reviewPath)},goalIds:ids,rawRowsRetainedExactly:true,currentFingerprintMatched:20,noMemoryNeeded:20,additionalCardsOrDecks:0,newReviewVotes:0})
const canonicalAfter=hash(base.canonicalBinding.path)
if(canonicalAfter!==canonicalBefore)errors.push('Canonical changed during bounded check')
write('author/scoped-normal-v2-schema-and-semantic-input-check.actual.json',{schemaVersion:1,startedAt,completedAt:new Date().toISOString(),checks:['normal v2 Ajv schema','normal exported goal/profile/input fingerprint functions','normal exported positive record semantic validator with actual candidate resource bytes','exact ordered registered20 claim','current20 base tuple parity','40 brief/full-case joins','20 raw exact current M rows with normal fingerprint construction'],inputBindings:[{path:base.canonicalBinding.path,sha256:canonicalBefore},{path:base.claimBinding.path,sha256:hash(base.claimBinding.path)},{path:criteriaPath,sha256:criteriaFingerprint},{path:schemaPath,sha256:hash(schemaPath)},{path:semanticPath,sha256:hash(semanticPath)}],counts:{profiles:20,cases:40,expectations:60,retainedCurrentM:20,independentScientificReviews:0,nativeDVotes:0,humanApprovals:0},canonicalBefore,canonicalAfter,errors,passed:errors.length===0,limitations:['No normal full native book build, no campaign run, no independent science/V review or active adoption.','Future e560 resource is checked using owned actual byte path; ordinary live P CLI would correctly fail until root prepares a private native candidate with this asset.','A/M author rationale is not an independent native vote.']})
console.log(JSON.stringify({profiles:20,cases:40,retainedM:20,errors:errors.length,passed:errors.length===0,receipt:rel(resolve(out,'author/scoped-normal-v2-schema-and-semantic-input-check.actual.json'))}))
if(errors.length){console.error(errors.join('\n'));process.exitCode=1}
}
main().catch(error=>{console.error(error);process.exitCode=1})
