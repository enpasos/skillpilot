// Apache-2.0. Bounded independent checks; no canonical output or gate writes.
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { isDeepStrictEqual as same } from 'node:util'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
const load=async(p:string)=>await import(pathToFileURL(resolve(p)).href)
const {default:Ajv}=await load('app/node_modules/ajv/dist/2020.js')
const {fingerprintSemanticKindSourceGoal}=await load('app/scripts/goalBookModel.ts')
const {collectCompositionProjectionRoleGoalIds}=await load('app/src/utils/authoring/compositionViewAuthoring.ts')
const e='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-13/'
const own=e+'chemie-e594-residual-source-duty-scientific-independent-a-20261013-v3'
const author=e+'chemie-e594-residual-source-duty-author-20261013-v3'
const v1=e+'chemie-e594-two-synthesis-routes-scope-preserving-author-20261013-v1'
const v2=e+'chemie-e594-two-route-source-and-view-remediation-author-20261013-v2'
if(existsSync(own+'/FINAL.independent-residual-source-duty.freeze.json')) throw Error('Sealed root')
const inputPaths=new Set<string>()
const read=(p:string)=>{inputPaths.add(p);return JSON.parse(readFileSync(p,'utf8'))}
const bind=(path:string)=>{inputPaths.add(path);const b=readFileSync(path);return {path,sha256:'sha256:'+createHash('sha256').update(b).digest('hex'),bytes:b.length}}
const check=(v:unknown,label:string)=>{if(!v)throw Error(label)}
const stable=(v:any):string=>v&&typeof v==='object'?(Array.isArray(v)?'['+v.map(stable).join(',')+']':'{'+Object.keys(v).sort().map(k=>JSON.stringify(k)+':'+stable(v[k])).join(',')+'}'):JSON.stringify(v)
const hash=(v:any)=>'sha256:'+createHash('sha256').update(stable(v)).digest('hex')
const first=read(own+'/FIRST.neutral-residual-source-duty-input-seal.json')
check(same(bind(first.neutralSelector.path),first.neutralSelector),'selector')
check(same(bind(first.authorFinalSeal.path),first.authorFinalSeal),'author final')
first.directNeutralBindings.forEach((r:any)=>check(same(bind(r.expected.path),r.expected),'neutral '+r.selectorPointer))
const one=read(v1+'/candidate/three-existing-whole-goal-CAS-and-two-new-whole-children.inactive-author.json')
check(same(bind(one.sourceCanonicalBinding.path),one.sourceCanonicalBinding),'old canonical')
const base=read(one.sourceCanonicalBinding.path)
for(const r of one.existingGoals){const i=base.goals.findIndex((g:any)=>g.id===r.expectedBeforeWholeGoal.id);check(same(base.goals[i],r.expectedBeforeWholeGoal),'whole V1 before');base.goals[i]=r.proposedAfterWholeGoal}
base.goals.push(...one.newChildren)
const cas=read(author+'/candidate/two-full-classification-goals-and-dye-parent-whole-CAS.author.json')
cas.expectedBaseBindings.forEach((r:any)=>check(same(bind(r.path),r),'V3 base'))
const by=new Map<string,any>(base.goals.map((g:any)=>[g.id,g]))
for(const r of cas.existingWholeGoalCAS){check(same(by.get(r.expectedBeforeWholeGoalAfterV1.id),r.expectedBeforeWholeGoalAfterV1),'whole parent');by.set(r.proposedAfterWholeGoal.id,r.proposedAfterWholeGoal)}
for(const g of cas.newWholeGoals){check(!by.has(g.id),'new unique id');by.set(g.id,g)}
const graph=[]
for(const edge of ['requires','contains']){const done=new Set<string>(),open=new Set<string>();let refs=0;const visit=(id:string)=>{check(!open.has(id),edge+' cycle');if(done.has(id))return;open.add(id);for(const t of by.get(id)[edge]??[]){check(by.has(t),edge+' dangling');refs++;visit(t)}open.delete(id);done.add(id)};for(const id of by.keys())visit(id);graph.push({edge,nodes:done.size,references:refs,cycles:0,dangling:0})}
const dye='fa21e8e1-b430-54ad-9647-f763bc4137ba'
const leaves=(id:string):Set<string>=>new Set(by.get(id).contains.length?by.get(id).contains.flatMap((c:string)=>[...leaves(c)]):[id])
check(leaves(dye).size===14&&by.get(dye).weight===14,'weight14 unique leaves')
const unchanged=base.goals.filter((g:any)=>g.id!==dye);unchanged.forEach((g:any)=>check(same(g,by.get(g.id)),'whole old goal retained'))
const sem=read(author+'/candidate/three-bounded-semantic-fingerprint-transport-proposals.author.json')
const fp=fingerprintSemanticKindSourceGoal
check(sem.parentWholeDecisionCAS.expectedBeforeWholeDecisionAfterV1.sourceFingerprint===fp(base.goals.find((g:any)=>g.id===dye)),'stock before parent fp')
check(sem.parentWholeDecisionCAS.authorProposedSemanticFields.sourceFingerprint===fp(by.get(dye)),'stock after parent fp')
for(const row of sem.newGoalClassificationFields)check(row.sourceFingerprint===fp(by.get(row.goalId)),'stock new atom fp')
const stockProfilePath='contracts/goal-evidence/v2/goal-evidence-profile.schema.json'
const stock=read(stockProfilePath), ajv=new Ajv({strict:false,allErrors:true})
ajv.addSchema(stock)
const validateProfile=ajv.compile({$ref:stock.$id+'#/$defs/profile'})
const profiles=read(author+'/positive/two-full-DEEN-classification-profiles.author.json').profiles
const cases=read(author+'/positive/four-full-DEEN-classification-transfer-cases.author.json').cases
const profileResults=profiles.map((p:any)=>{
 const g=by.get(p.goalId);check(same(p.wholeGoal,g)&&hash(g)===p.wholeGoalStableJsonSha256,'whole profile goal')
 check(same(bind(p.wholeGoalCASBinding.path),p.wholeGoalCASBinding),'profile CAS')
 const valid=validateProfile(p.profile);const errors=structuredClone(validateProfile.errors)
 const alternatives=cases.filter((c:any)=>c.goalId===p.goalId)
 const checks=alternatives.map((c:any)=>{
  check(same(bind(c.wholeGoalCASBinding.path),c.wholeGoalCASBinding),'case CAS')
  check(c.wholeGoalStableJsonSha256===hash(g),'case whole goal')
  check(same(c.expectationIds,p.profile.coverageExpectations.requiredExpectationIds),'all expectations')
  check(c.maximumPoints===c.rubric.reduce((n:number,r:any)=>n+r.maximumPoints,0),'point sums')
  const brief=p.profile.applicationCaseBriefs.find((b:any)=>b.id===c.caseId)
  for(const lang of ['De','En']){
   check(brief['taskDemand'+lang]===c['data'+lang]+'\n'+c['task'+lang],'whole task brief')
   check(brief['expectedPerformance'+lang]===c['modelAnswer'+lang],'whole model brief')
   for(const r of c.rubric)check(c['task'+lang].slice(r['taskSpan'+lang].start,r['taskSpan'+lang].end)===r['taskClause'+lang],'exact rubric task span')
  }
  return {caseId:c.caseId,bilingualRubricSpans:c.rubric.length*2,maximumPoints:c.maximumPoints,wholeGoalHashExact:true,allDEENBriefJoinsExact:true}
 })
 return {goalId:p.goalId,wholeGoalStableJsonSha256:hash(g),actualStockSemanticSourceFingerprint:fp(g),profileFragmentValid:valid,profileFragmentErrors:errors,minimumIndependentDemonstrations:p.profile.coverageExpectations.minimumIndependentDemonstrations,cases:checks}
})
const source2=read(v2+'/source-component-five-cell-and-three-mapping-CAS.author.json')
const source3=read(author+'/candidate/three-conditional-full-source-decision-and-mapping-CAS.author.json')
const mappings=new Map<string,any>()
for(const r of source3.conditionalSourceDecisionCAS){
 const path=r.expectedWholeMappingBaseBinding.path
 if(!mappings.has(path)){
  check(same(bind(path),r.expectedWholeMappingBaseBinding),'mapping bytes');const m=read(path)
  const old=source2.wholeMappingGuardsAndCellCAS.find((v:any)=>v.expectedWholeMappingBinding.path===path)
  for(const row of old.decisionCellCompareAndSwap){const i=Number(row.jsonPointer.split('/').at(-1));check(same(m.decisions[i],row.expectedBeforeWholeCell),'whole V2 decision');m.decisions[i]=row.proposedAfterWholeCell}
  for(const row of [...old.mappingCellReplacements].sort((a:any,b:any)=>Number(b.jsonPointer.split('/').at(-1))-Number(a.jsonPointer.split('/').at(-1)))){const i=Number(row.jsonPointer.split('/').at(-1));check(same(m.mappings[i],row.expectedBeforeWholeCell),'whole V2 mapping');m.mappings.splice(i,1,...row.replacementWholeCells)}
  mappings.set(path,m)
 }
 const m=mappings.get(path),i=Number(r.jsonPointer.split('/').at(-1));check(same(m.decisions[i],r.expectedAfterV2WholeDecisionCell),'V3 source before')
 check(same(r.conditionalProposedWholeDecisionCell.canonicalGoalIds.slice(0,-1),r.expectedAfterV2WholeDecisionCell.canonicalGoalIds),'old source partners')
}
const count=(m:any)=>({sourceDecisionRows:m.decisions.length,distinctSourceGoalIdsInDecisions:new Set(m.decisions.map((d:any)=>d.sourceGoalId)).size,decisionStatusRowCounts:m.decisions.reduce((a:any,d:any)=>({...a,[d.decision]:(a[d.decision]??0)+1}),{}),rawDecisionTargetEdges:m.decisions.reduce((n:number,d:any)=>n+d.canonicalGoalIds.length,0),compatibilityMappingEdgeRows:m.mappings.length,compatibilityMappingExactEdgeRows:m.mappings.filter((r:any)=>r.matchType==='exact').length,compatibilityMappingPartialEdgeRows:m.mappings.filter((r:any)=>r.matchType==='partial').length})
const mappingCounts=[]
for(const guard of source3.namedConditionalCountUnitsAndWholeMappingGuards){const path=guard.expectedWholeMappingBaseBinding.path,m=mappings.get(path);check(same(count(m),guard.afterReviewedV2NamedCountUnits),'measured V2 units');const before=count(m);const summary=m.summary;for(const r of source3.conditionalSourceDecisionCAS.filter((r:any)=>r.expectedWholeMappingBaseBinding.path===path)){m.decisions[Number(r.jsonPointer.split('/').at(-1))]=r.conditionalProposedWholeDecisionCell;m.mappings.push(r.conditionalCompatibilityMappingAddition)}const after=count(m);for(const status of Object.keys(before.decisionStatusRowCounts))after.decisionStatusRowCounts[status]??=0;check(same(after,guard.conditionalV3NamedCountUnitsIfActualSelectionRegistrationResolved),'conditional units');check(same(summary,m.summary),'summary exact');mappingCounts.push({mapping:path,measuredBefore:before,measuredConditionalAfter:after,operative:false})}
const source=read(author+'/exact-whole-source-cells-and-distinct-operators.author.json')
const cells=[...source.wholeRP62SourceCellsAfterExactV2LocatorCAS,...source.wholeSN12LKWB1SourceCellsAfterExactV2LocatorCAS,source.wholeOptionalRP33SourceCellAfterV2LocatorCAS]
for(const r of source3.conditionalSourceDecisionCAS)check(same(r.wholeSourceCell,cells.find((c:any)=>c.id===r.wholeSourceCell.id)),'complete source cell join')
const views=read(author+'/selected-module-review-view-bodies-and-registration-HOLD.author.json')
const validateView=new Ajv({strict:false,allErrors:true}).compile(read('contracts/curriculum-package/v1/composition-view.schema.json'))
const viewResults=views.wholeValidReviewViewBindings.map((r:any)=>{check(same(bind(r.wholeView.path),r.wholeView),'view bytes');const v=read(r.wholeView.path);check(validateView(v),'closed view schema');const roles=collectCompositionProjectionRoleGoalIds(v.rootNodes,by);check(same([...roles.targetGoalIds].sort(),r.intendedModuleOnlyTargetGoalIds.slice().sort()),'module target union');return {view:r.wholeView,closedSchemaValid:true,actualTargetIds:[...roles.targetGoalIds],registered:false,actualSelectionKnown:false}})
const held=read(author+'/whole-RP33-source-and-two-entire-optional-duty-HOLD.author.json')
held.heldWholeGoalDrafts.forEach((g:any)=>check(!by.has(g.id),'optional draft excluded'))
const result={schemaVersion:1,checkedAtUTC:new Date().toISOString(),role:'Independent finite binding, graph, count and stock-positive-profile-fragment checks; scientific decisions remain separate',inputs:[...inputPaths].sort().map(bind),neutralRecheckExact:true,fullCanonicalModelWritten:false,privateProposedGoalCount:by.size,graph,wholeOldGoalsExactExceptDyeParent:unchanged.length,dyeUniqueAtomicDescendants:leaves(dye).size,dyeWeight:by.get(dye).weight,stockSemanticFingerprints:[{goalId:dye,sourceFingerprint:fp(by.get(dye))},...profileResults.map((p:any)=>({goalId:p.goalId,sourceFingerprint:p.actualStockSemanticSourceFingerprint}))],profileResults,totalRubrics:cases.reduce((n:number,c:any)=>n+c.rubric.length,0),totalBilingualTaskSpans:cases.reduce((n:number,c:any)=>n+2*c.rubric.length,0),conditionalWholeSourceCells:source3.conditionalSourceDecisionCAS.length,allWholeSourceCellJoinsExact:true,mappingCounts,reviewViews:viewResults,optionalDraftsOutsideCanonical:held.heldWholeGoalDrafts.length,normalSourceCompilerExecuted:false,pageContextOrRuntimeProof:false,authorAndPeerOpinionsUsedAsOwnEvidence:false,activeOrHistoricalFilesWritten:false,gitOperations:false,humanApproval:false,humanTrial:false}
writeFileSync(own+'/checks/bounded-inputs-and-stock-profile-fragments.actual.json',JSON.stringify(result,null,2)+'\n')
console.log(JSON.stringify({privateProposedGoalCount:by.size,profiles:profileResults.map(p=>({goalId:p.goalId,valid:p.profileFragmentValid,errors:p.profileFragmentErrors})),wholeCases:cases.length,bilingualRubricSpans:result.totalBilingualTaskSpans,conditionalSourceCAS:3,unregisteredViews:2,optionalDraftsOutsideCanonical:2}))
