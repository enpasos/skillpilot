// Apache-2.0. Small stock checks, no active writes.
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { pathToFileURL } from 'node:url'
import { resolve } from 'node:path'
import { isDeepStrictEqual as same } from 'node:util'
const own='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-13/chemie-e594-residual-source-duty-author-20261013-v3'
const v1='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-13/chemie-e594-two-synthesis-routes-scope-preserving-author-20261013-v1'
const v2='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-13/chemie-e594-two-route-source-and-view-remediation-author-20261013-v2'
if(existsSync(own+'/FINAL.finite-residual-source-duty-author.freeze.json')) throw new Error('Immutable sealed author root; use a new root for a successor.')
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'))
const bind=(path:string)=>{const b=readFileSync(path);return {path,sha256:'sha256:'+createHash('sha256').update(b).digest('hex'),bytes:b.length}}
const check=(v:unknown,label:string)=>{if(!v)throw new Error(label)}
const save=(p:string,v:unknown)=>writeFileSync(own+'/'+p,JSON.stringify(v,null,2)+'\n')
const stable=(v:any):string=>v&&typeof v==='object'?Array.isArray(v)?'['+v.map(stable).join(',')+']':'{'+Object.keys(v).sort().map(k=>JSON.stringify(k)+':'+stable(v[k])).join(',')+'}':JSON.stringify(v)
const hash=(v:unknown)=>'sha256:'+createHash('sha256').update(stable(v)).digest('hex')
const load=async(p:string)=>await import(pathToFileURL(resolve(p)).href)
const {normalizeCanonicalLandscape,validateCanonicalLandscape}=await load('app/src/utils/authoring/canonicalAuthoring.ts')
const {collectCompositionProjectionRoleGoalIds,compileCompositionView}=await load('app/src/utils/authoring/compositionViewAuthoring.ts')
const {fingerprintSemanticKindSourceGoal:fp}=await load('app/scripts/goalBookModel.ts')
const {default:Ajv}=await load('app/node_modules/ajv/dist/2020.js')
const one=read(v1+'/candidate/three-existing-whole-goal-CAS-and-two-new-whole-children.inactive-author.json')
check(same(bind(one.sourceCanonicalBinding.path),one.sourceCanonicalBinding),'baseline binding')
const base=read(one.sourceCanonicalBinding.path)
for(const r of one.existingGoals){const i=base.goals.findIndex((g:any)=>g.id===r.expectedBeforeWholeGoal.id);check(same(base.goals[i],r.expectedBeforeWholeGoal),'V1 whole CAS');base.goals[i]=r.proposedAfterWholeGoal}
base.goals.push(...one.newChildren)
const casPath=own+'/candidate/two-full-classification-goals-and-dye-parent-whole-CAS.author.json'
const cas=read(casPath),cand=structuredClone(base)
for(const r of cas.existingWholeGoalCAS){const i=cand.goals.findIndex((g:any)=>g.id===r.expectedBeforeWholeGoalAfterV1.id);check(same(cand.goals[i],r.expectedBeforeWholeGoalAfterV1),'V3 whole parent CAS');cand.goals[i]=r.proposedAfterWholeGoal}
cand.goals.push(...cas.newWholeGoals)
const by=new Map<string,any>(cand.goals.map((g:any)=>[g.id,g]))
check(by.size===527&&cand.goals.length===527,'unique count')
const normalized=normalizeCanonicalLandscape(cand)
check(same(JSON.parse(JSON.stringify(normalized)),cand),'stock normalization')
const diag=validateCanonicalLandscape(normalized)
check(!diag.some((d:any)=>d.severity==='error'),'stock graph validation')
const edges=[]
for(const edge of ['contains','requires']){const done=new Set<string>(),visiting=new Set<string>();let refs=0;const visit=(id:string)=>{check(!visiting.has(id),edge+' cycle');if(done.has(id))return;visiting.add(id);for(const t of by.get(id)[edge]??[]){refs++;check(by.has(t),edge+' dangling');visit(t)}visiting.delete(id);done.add(id)};by.forEach((_g,id)=>visit(id));edges.push({edge,checkedNodes:done.size,references:refs,cycles:0,danglingReferences:0})}
const dye='fa21e8e1-b430-54ad-9647-f763bc4137ba'
const leaves=(id:string):Set<string>=>new Set(by.get(id).contains.length?by.get(id).contains.flatMap((c:string)=>[...leaves(c)]):[id])
check(leaves(dye).size===14&&by.get(dye).weight===14,'dye weight')
const unchanged=base.goals.filter((g:any)=>g.id!==dye);unchanged.forEach((g:any)=>check(same(g,by.get(g.id)),'whole old goal retained'))
const semPath=v1+'/candidate/five-semantic-decision-CAS.stock-fingerprints.inactive-author.json'
const sem=read(semPath),parent=sem.rows.find((r:any)=>r.proposedAfterWholeDecision.goalId===dye).proposedAfterWholeDecision
check(parent.sourceFingerprint===fp(base.goals.find((g:any)=>g.id===dye)),'semantic parent guard')
save('candidate/three-bounded-semantic-fingerprint-transport-proposals.author.json',{sourceV1LedgerCASBinding:bind(semPath),parentWholeDecisionCAS:{expectedBeforeWholeDecisionAfterV1:parent,authorProposedSemanticFields:{goalId:dye,sourceFingerprint:fp(by.get(dye)),semanticKind:'curricularArea'},noKindChange:true},newGoalClassificationFields:cas.newWholeGoals.map((g:any)=>({goalId:g.id,sourceFingerprint:fp(g),semanticKind:'curricularAtomic'})),classificationRole:'AUTHOR fields only; no authoritative ledger write or science vote',countUnits:{checkpointGoals:523,checkpointCurricularAtoms:402,privateV1Goals:525,privateV1ProposedCurricularAtoms:403,V3ProposedGoalsIfIntegrated:527,V3ProposedCurricularAtomsIfIntegrated:405,optionalFormationDraftsInCanonical:0},integratedPublicDenominatorsUnchanged:true,activeWrites:false})
const validate=new Ajv({strict:false,allErrors:true}).compile(read('contracts/curriculum-package/v1/composition-view.schema.json'))
const views=read(own+'/selected-module-review-view-bodies-and-registration-HOLD.author.json').wholeValidReviewViewBindings.map((r:any)=>{check(same(bind(r.wholeView.path),r.wholeView),'view binding');const view=read(r.wholeView.path);check(validate(view),'closed release schema '+JSON.stringify(validate.errors));const c=compileCompositionView(view,normalized);check(!c.findings.some((f:any)=>f.severity==='error'),'stock preview');const role=collectCompositionProjectionRoleGoalIds(view.rootNodes,by);check(same([...role.targetGoalIds].sort(),[...r.intendedModuleOnlyTargetGoalIds].sort()),'target union');check(role.prerequisiteOnlyGoalIds.size===0,'no proxy');return{wholeView:r.wholeView,closedSchemaValid:true,stockPreviewFindings:c.findings,stockTargetIds:[...role.targetGoalIds],registered:false,actualSelectionKnown:false}})
const source2=read(v2+'/source-component-five-cell-and-three-mapping-CAS.author.json')
const decisions=read(own+'/candidate/three-conditional-full-source-decision-and-mapping-CAS.author.json').conditionalSourceDecisionCAS.map((r:any)=>{check(same(bind(r.expectedWholeMappingBaseBinding.path),r.expectedWholeMappingBaseBinding),'whole mapping binding');const m=read(r.expectedWholeMappingBaseBinding.path),f=source2.wholeMappingGuardsAndCellCAS.find((f:any)=>f.expectedWholeMappingBinding.path===r.expectedWholeMappingBaseBinding.path);for(const row of f.decisionCellCompareAndSwap){const i=Number(row.jsonPointer.split('/').at(-1));check(same(m.decisions[i],row.expectedBeforeWholeCell),'V2 whole source CAS');m.decisions[i]=row.proposedAfterWholeCell}check(same(m.decisions[Number(r.jsonPointer.split('/').at(-1))],r.expectedAfterV2WholeDecisionCell),'V3 exact source before');check(same(r.conditionalProposedWholeDecisionCell.canonicalGoalIds.slice(0,-1),r.expectedAfterV2WholeDecisionCell.canonicalGoalIds),'all source partners retained');return{sourceGoalId:r.wholeSourceCell.id,wholeBeforeMatchesV2:true,partnersRetained:true,conditionalAddition:r.conditionalCompatibilityMappingAddition,operative:false}})
const profiles=read(own+'/positive/two-full-DEEN-classification-profiles.author.json').profiles,cases=read(own+'/positive/four-full-DEEN-classification-transfer-cases.author.json').cases
const positive=profiles.map((p:any)=>{const g=by.get(p.goalId);check(same(p.wholeGoal,g)&&p.wholeGoalStableJsonSha256===hash(g),'exact whole profile');check(same(bind(p.wholeGoalCASBinding.path),p.wholeGoalCASBinding),'positive binding');const cs=cases.filter((c:any)=>c.goalId===p.goalId);check(cs.length===2,'two alternatives');for(const c of cs){check(c.wholeGoalStableJsonSha256===hash(g),'whole case goal');check(same(bind(c.wholeGoalCASBinding.path),c.wholeGoalCASBinding),'case binding');check(same(c.expectationIds,p.profile.coverageExpectations.requiredExpectationIds),'full expectations');check(c.maximumPoints===c.rubric.reduce((a:number,r:any)=>a+r.maximumPoints,0),'point sum');const b=p.profile.applicationCaseBriefs.find((b:any)=>b.id===c.caseId);for(const lang of ['De','En']){check(c['data'+lang]&&c['task'+lang]&&c['modelAnswer'+lang],'bilingual fields');for(const r of c.rubric)check(c['task'+lang].slice(r['taskSpan'+lang].start,r['taskSpan'+lang].end)===r['taskClause'+lang],'exact rubric span');check(b['taskDemand'+lang]===c['data'+lang]+'\n'+c['task'+lang]&&b['expectedPerformance'+lang]===c['modelAnswer'+lang],'whole case profile joins')}}return{goalId:g.id,wholeGoalStableJsonSha256:hash(g),stockSemanticSourceFingerprint:fp(g),fullDEENProfiles:1,fullDEENAlternativeCases:cs.length,allRubricSpansExact:true,compiledPageFingerprintBound:false,scientificReviewComplete:false}})
save('checks/stock-bounded-canonical-view-CAS-and-positive-bindings.actual.json',{checkedAtUTC:new Date().toISOString(),role:'Limited AUTHOR checks, not full source/scopes compiler or science approval',stockInputs:['app/src/utils/authoring/canonicalAuthoring.ts','app/src/utils/authoring/compositionViewAuthoring.ts','app/scripts/goalBookModel.ts','contracts/curriculum-package/v1/composition-view.schema.json'].map(bind),inMemoryV1Goals:base.goals.length,inMemoryV3ProposedGoals:cand.goals.length,stockNormalizationStable:true,canonicalDiagnostics:diag,edgeChecks:edges,wholeExistingGoalsUnchangedExceptDyeParent:unchanged.length,dyeUniqueAtomicDescendants:leaves(dye).size,dyeWeight:by.get(dye).weight,reviewViews:views,conditionalWholeSourceCASGuards:decisions,positiveBindings:positive,completeNormalCompilerOrAPIExecuted:false,actualSelectedModuleAndScientificReviewPending:true,noDPAorMVOrHumanStatus:true,activeWrites:false})
console.log(JSON.stringify({proposedGoals:cand.goals.length,unchangedWholeExistingGoals:unchanged.length,views:views.length,sourceCAS:decisions.length,profiles:profiles.length,cases:cases.length,boundedTechnicalChecks:'complete',selectedModuleAndScienceHoldsRemain:true}))
