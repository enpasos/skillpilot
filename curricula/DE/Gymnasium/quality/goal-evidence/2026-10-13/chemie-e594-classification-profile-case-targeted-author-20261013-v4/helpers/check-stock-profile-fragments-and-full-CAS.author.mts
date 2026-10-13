// Apache-2.0. Fragment and whole-cell guards; no review records or active writes.
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { isDeepStrictEqual as same } from 'node:util'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
const own='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-13/chemie-e594-classification-profile-case-targeted-author-20261013-v4'
if(existsSync(own+'/FINAL.finite-targeted-profile-case-author.freeze.json'))throw new Error('Immutable sealed root')
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'))
const bind=(path:string)=>{const b=readFileSync(path);return{path,sha256:'sha256:'+createHash('sha256').update(b).digest('hex'),bytes:b.length}}
const check=(v:unknown,s:string)=>{if(!v)throw new Error(s)}
const {default:Ajv}=await import(pathToFileURL(resolve('app/node_modules/ajv/dist/2020.js')).href)
const {fingerprintPositiveGoalEvidenceProfile}=await import(pathToFileURL(resolve('app/scripts/positiveGoalEvidenceProfileModel.ts')).href)
const schemaPath='contracts/goal-evidence/v2/goal-evidence-profile.schema.json'
const schema=read(schemaPath),ajv=new Ajv({strict:false,allErrors:true})
ajv.addFormat('date-time',{type:'string',validate:(v:string)=>!Number.isNaN(Date.parse(v))})
ajv.addSchema(schema)
const validate=ajv.compile({$schema:schema.$schema,$ref:schema.$id+'#/$defs/profile'})
const pcas=read(own+'/candidate/two-whole-DEEN-profile-CAS.targeted-author.json')
const ccas=read(own+'/candidate/four-whole-bilingual-case-CAS.targeted-author.json')
check(same(bind(pcas.expectedWholeProfileArrayBinding.path),pcas.expectedWholeProfileArrayBinding),'whole profile input binding')
check(same(bind(ccas.expectedWholeCaseArrayBinding.path),ccas.expectedWholeCaseArrayBinding),'whole case input binding')
const pbase=read(pcas.expectedWholeProfileArrayBinding.path),cbase=read(ccas.expectedWholeCaseArrayBinding.path)
const target=ccas.specificScientificCorrection.caseId,old=ccas.specificScientificCorrection.oldExactDESentence,newText=ccas.specificScientificCorrection.newExactDESentence
const caseChecks=ccas.wholeCaseCAS.map((row:any)=>{
 const before=row.expectedBeforeWholeCase,after=row.proposedAfterWholeCase
 check(same(cbase.cases[Number(row.sourceWholeArrayPointer.split('/').at(-1))],before),'whole before case')
 const expected=structuredClone(before);expected.gradingBoundary=after.gradingBoundary
 if(before.caseId===target){expected.modelAnswerDe=before.modelAnswerDe.replace(old,newText);const r=expected.rubric.find((r:any)=>r.criterionId===target+'-r3');r.criterionDe=r.criterionDe.replace(old,newText)}
 check(same(expected,after),'only specified whole case changes')
 for(const lang of ['De','En'])for(const r of after.rubric)check(after['task'+lang].slice(r['taskSpan'+lang].start,r['taskSpan'+lang].end)===r['taskClause'+lang],'exact bilingual task spans')
 check(after.maximumPoints===after.rubric.reduce((s:number,r:any)=>s+r.maximumPoints,0),'rubric point sum')
 return{caseId:after.caseId,wholeBeforeMatchesV3:true,onlyAuthorizedChanges:true,tasksDataScientificENAndAllDemandSpansUnchanged:true}
})
const profileChecks=pcas.wholeProfileCAS.map((row:any)=>{
 const before=row.expectedBeforeWholeProfileRow,after=row.proposedAfterWholeProfileRow
 check(same(pbase.profiles[Number(row.sourceWholeArrayPointer.split('/').at(-1))],before),'whole before profile')
 check(validate(before.profile)===false,'V3 minimum failure reproduced')
 const errors=structuredClone(validate.errors)
 check(errors.length===1&&errors[0].instancePath==='/coverageExpectations/minimumIndependentDemonstrations'&&errors[0].keyword==='minimum','only stock minimum schema failure')
 check(validate(after.profile),'whole original stock profile fragment '+JSON.stringify(validate.errors))
 const expected=structuredClone(before);expected.profile.coverageExpectations.minimumIndependentDemonstrations=2
 for(const b of expected.profile.applicationCaseBriefs)if(b.id===target)b.expectedPerformanceDe=b.expectedPerformanceDe.replace(old,newText)
 check(same(expected,after),'only specified whole profile changes')
 for(const b of after.profile.applicationCaseBriefs){const c=ccas.wholeCaseCAS.find((r:any)=>r.caseId===b.id).proposedAfterWholeCase;for(const lang of ['De','En']){check(b['taskDemand'+lang]===c['data'+lang]+'\n'+c['task'+lang],'whole brief task join');check(b['expectedPerformance'+lang]===c['modelAnswer'+lang],'whole brief answer join')}check(same(c.expectationIds,after.profile.coverageExpectations.requiredExpectationIds),'whole expectation join')}
 return{goalId:after.goalId,beforeOriginalStockFragmentErrors:errors,afterOriginalStockFragmentValid:true,minimumIndependentDemonstrations:2,stockProfileFingerprintBefore:fingerprintPositiveGoalEvidenceProfile(before.profile),stockProfileFingerprintAfter:fingerprintPositiveGoalEvidenceProfile(after.profile),wholeGoalBodiesUnchanged:true,onlyAuthorizedChanges:true}
})
const design=read(own+'/two-distinct-evidence-pieces-and-whole-case-expectation-coherence.author.json')
for(const d of design.caseDesigns){const c=ccas.wholeCaseCAS.find((r:any)=>r.caseId===d.caseId).proposedAfterWholeCase;const first=d.piece1.wholeRubricCriterionIds,second=d.piece2.wholeRubricCriterionIds;check(first.length&&second.length&&!first.some((id:string)=>second.includes(id)),'two distinct rubric-bound pieces');const r=c.rubric.filter((r:any)=>[...first,...second].includes(r.criterionId));check(r.length===c.rubric.length,'all whole criteria assigned');const ex=[...new Set(r.flatMap((r:any)=>r.expectationIds))].sort();check(same(ex,[...d.requiredExpectationIds].sort()),'complete e1-e3 union')}
const output={checkedAtUTC:new Date().toISOString(),role:'AUTHOR stock fragment/schema and exact whole-row checks only; not scientific review or acceptance',stockSchemaBinding:bind(schemaPath),stockProfileModelBinding:bind('app/scripts/positiveGoalEvidenceProfileModel.ts'),profileChecks,caseChecks,twoDistinctCriterionBoundPiecesPerWholeCase:true,allExpectationUnionsAndWholeDEENJoinsExact:true,noGoalSourceViewOrImageChanges:true,compiledPageAndGoalEvidenceFingerprintBindingsPending:true,scientificRecheckPending:true,activeWrites:false}
writeFileSync(own+'/checks/stock-profile-fragments-whole-CAS-and-DEEN-joins.actual.json',JSON.stringify(output,null,2)+'\n')
console.log(JSON.stringify({profilesValidated:profileChecks.length,wholeCasesGuarded:caseChecks.length,exactDEENJoins:true,onlyTwoTargetedFindings:true,activeWrites:false}))
