import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import assert from 'node:assert/strict'
import Ajv2020 from '../../../../../../../app/node_modules/ajv/dist/2020.js'
import { compileCompositionView, collectCompositionProjectionRoleGoalIds } from '../../../../../../../app/src/utils/authoring/compositionViewAuthoring.ts'
import { sourceAtlasDescendants } from '../../../../../../../app/scripts/goalBookSourceAtlasInputs.ts'
import { evaluateCourseLevelMappingConsistency } from '../../../../../../../app/scripts/generateCurriculumQualityStatus.ts'
const root='/home/enpasos/projects/skillpilot',out=path.dirname(new URL(import.meta.url).pathname)
const read=(p:string)=>JSON.parse(fs.readFileSync(p,'utf8'))
const hash=(p:string)=>'sha256:'+crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex')
const inputs=read(out+'/INPUTS.finite-actual-H635-and-owner-scope-author.json')
const gc=read(out+'/CAS.four-whole-goals.current-H635.AUTHOR.inactive.json')
const vc=read(out+'/CAS.two-whole-SH-GK-LK-views.AUTHOR.inactive.json')
const mc=read(out+'/CAS.two-whole-Source032-mapping-aliases.AUTHOR.inactive.json')
const history=read(out+'/HISTORY.actual-prior-AMPV-material-PNG-and-selected-scope-limits.NOT-NEW-VOTES.json')
const base=read(root+'/'+gc.frozenCanonicalBase.path)
assert.equal(hash(root+'/'+gc.frozenCanonicalBase.path),gc.actualCanonicalBase.sha256)
assert.equal(base.goals.length,635)
const byBefore=new Map<string,any>(base.goals.map((g:any)=>[g.id,g]))
assert.equal(gc.items.length,4)
for(const item of gc.items){if(item.before===null)assert.ok(!byBefore.has(item.goalId));else assert.deepEqual(byBefore.get(item.goalId),item.before);assert.equal(hash(root+'/'+item.afterFile.path),item.afterFile.sha256)}
const afters=new Map<string,any>(gc.items.map((c:any)=>[c.goalId,c.after]))
const canonical={...base,goals:base.goals.map((g:any)=>afters.get(g.id)??g).concat(gc.items.filter((i:any)=>i.before===null).map((i:any)=>i.after))}
const byAfter=new Map<string,any>(canonical.goals.map((g:any)=>[g.id,g]));assert.equal(byAfter.size,637)
// These are raw canonical-authoring goals with permitted provenance/proposal
// metadata, not normalized compiled-package goals with a semantic ledger.
const schema=read(root+'/docs/landscape-runtime.schema.json')
const ajv=new Ajv2020({strict:false,allErrors:true})
const goalSchema=ajv.compile({$schema:schema.$schema,$defs:schema.$defs,$ref:'#/$defs/goal'})
const viewSchema=ajv.compile(read(root+'/contracts/curriculum-package/v1/composition-view.schema.json'))
for(const item of gc.items)assert.ok(goalSchema(item.after),JSON.stringify(goalSchema.errors))
for(const relation of ['requires','contains']){
 const active=new Set<string>(),done=new Set<string>();const visit=(id:string)=>{if(done.has(id))return;assert.ok(!active.has(id),relation+' cycle '+id);active.add(id);for(const r of byAfter.get(id)?.[relation]??[]){const local=r.includes(':')?r.split(':').at(-1):r;if(byAfter.has(local))visit(local)}active.delete(id);done.add(id)};for(const id of byAfter.keys())visit(id)
}
const G='3eb2a06c-d283-57aa-9eb4-088940c4801a',A='69928892-ac71-553d-a35c-4f96f16b6d6e',B='6b6bceca-e1d9-56f7-ae6c-d7f7c2fa9338',T='5964272f-e835-5a24-b2b1-c162be6b75cb'
const ordinary=byAfter.get(G),assessment=byAfter.get(A)
const oldOrd=read(root+'/'+inputs.newOrdinaryGoalPrior.path),oldAss=read(root+'/'+inputs.newAssessmentPrior.path)
const except=(o:any,key:string)=>Object.fromEntries(Object.entries(o).filter(([k])=>k!==key))
assert.deepEqual(except(ordinary,'extendedData'),except(oldOrd,'extendedData'));assert.deepEqual(except(assessment,'extendedData'),except(oldAss,'extendedData'))
assert.deepEqual(assessment.requires,[G]);assert.deepEqual(assessment.examData.coveredGoalIds,[G]);assert.equal(assessment.examData.scoring.passingPoints,16);assert.equal(assessment.extendedData.applicabilityFromRequires,true)
assert.deepEqual(byAfter.get(B).contains,byBefore.get(B).contains.concat(G));assert.equal(byAfter.get(B).weight,10)
assert.deepEqual(byAfter.get(T).contains,byBefore.get(T).contains.concat(A));assert.ok(byAfter.get(T).contains.includes('32705a3a-9b7f-5cc0-ba41-881d13d0c45b'))
assert.deepEqual(except(byAfter.get(T),'contains'),except(byBefore.get(T),'contains'))
assert.equal(byAfter.get(B).extendedData.applicabilityMappingInheritance,'boundary')
for(const goal of [ordinary,assessment]){
 const ap=goal.extendedData.authorProposal;assert.ok(!Object.hasOwn(ap,'themeSelectionRequired'));assert.ok(!Object.hasOwn(ap,'selectedThemeOnly'))
 assert.equal(ap.officialSourceScope.officialSourceThemeOptional,true);assert.equal(ap.interimSkillPilotTargetPolicy.allAuthoredThemesInCurrentTarget,true);assert.equal(ap.interimSkillPilotTargetPolicy.persistedThemeSelectionImplemented,false)
}
const viewReports=[]
const sorted=(s:Set<string>)=>[...s].sort()
for(const item of vc.items){
 assert.ok(viewSchema(item.after),JSON.stringify(viewSchema.errors));assert.deepEqual(item.before.scope,item.after.scope)
 const beforeRoles=collectCompositionProjectionRoleGoalIds(item.before.rootNodes,byBefore),afterRoles=collectCompositionProjectionRoleGoalIds(item.after.rootNodes,byAfter)
 assert.deepEqual(sorted(afterRoles.targetGoalIds),sorted(new Set([...beforeRoles.targetGoalIds,G,A])))
 assert.deepEqual(sorted(afterRoles.prerequisiteOnlyGoalIds),sorted(beforeRoles.prerequisiteOnlyGoalIds))
 const stripped=structuredClone(item.after);const node=stripped.rootNodes.find((n:any)=>n.id==='chemistry-root');assert.deepEqual(node.children.pop(),item.soleAppendedSection);assert.deepEqual(stripped,item.before)
 const compiled=compileCompositionView(item.after,canonical);assert.equal(compiled.findings.filter((f:any)=>f.severity==='error').length,0,JSON.stringify(compiled.findings))
 viewReports.push({path:item.normalPath,schemaErrors:0,stockCompilerErrors:0,scopeExact:true,beforeTargetGoalIds:sorted(beforeRoles.targetGoalIds),afterTargetGoalIds:sorted(afterRoles.targetGoalIds),addedTargetIds:[G,A],allOtherTargetsAndRolesExact:true,prerequisiteOnlyGoalIds:sorted(afterRoles.prerequisiteOnlyGoalIds)})
}
const source=read(root+'/'+inputs.actualSourceExtraction.path),beforeMaps=[],afterMaps=[],sourceMap=new Map()
const S=mc.wholeOfficialSource032.id
for(const c of mc.items){
 const before=read(root+'/'+c.before.path),after=read(root+'/'+c.after.path);assert.equal(hash(root+'/'+c.before.path),c.before.sha256);assert.equal(hash(root+'/'+c.after.path),c.after.sha256)
 assert.deepEqual(after.decisions.filter((d:any)=>d.sourceGoalId!==S),before.decisions.filter((d:any)=>d.sourceGoalId!==S))
 const old=before.decisions.find((d:any)=>d.sourceGoalId===S),d=after.decisions.find((d:any)=>d.sourceGoalId===S)
 assert.equal(d.decision,'unreviewed');assert.deepEqual(d.canonicalGoalIds,old.canonicalGoalIds.concat(G))
 assert.deepEqual(after.mappings.slice(0,-1),before.mappings);assert.deepEqual(after.mappings.at(-1),{legacyGoalId:S,canonicalGoalId:G,matchType:'partial',reviewDecisionId:S})
 assert.deepEqual(d.source032BeforeAllAuthoredThemesAuthorSuccessor.wholeDecision,old)
 assert.deepEqual(d.source032HistoricalAllocationBeforeBYPracticumCorrection,old.source032HistoricalAllocationBeforeBYPracticumCorrection)
 assert.ok(!d.canonicalGoalIds.includes('cf2631d9-da24-50e8-9e50-db625e6efaad'))
 assert.equal(d.source032OfficialSourceScope.courseLevel,'GK_LK');assert.equal(d.source032OfficialSourceScope.stage,'SekII');assert.equal(d.source032OfficialSourceScope.officialSourceThemeOptional,true)
 beforeMaps.push({...before,file:c.normalPath});afterMaps.push({...after,file:c.normalPath});sourceMap.set(after.sourceExtractionPath,source)
}
const courseBefore=evaluateCourseLevelMappingConsistency(base,beforeMaps,sourceMap),courseAfter=evaluateCourseLevelMappingConsistency(canonical,afterMaps,sourceMap)
assert.equal(courseBefore.status,'pass');assert.equal(courseAfter.status,'pass')
const ledgerPath=path.join(root,path.dirname(inputs.globalInput.path),'../quality/goal-book-publication/chemie.semantic-kinds.json')
const ledger=read(ledgerPath),atoms=new Set<string>(ledger.decisions.filter((d:any)=>d.semanticKind==='curricularAtomic').map((d:any)=>d.goalId));atoms.add(G)
assert.ok(!sourceAtlasDescendants('442c31c5-c561-5c7a-90bb-2335d779175c',byAfter,atoms,base.landscapeId).includes(G))
assert.ok(!sourceAtlasDescendants('4a98bbee-41cb-5aef-91c6-f18d7bf2a214',byAfter,atoms,base.landscapeId).includes(G))
assert.ok(sourceAtlasDescendants(B,byAfter,atoms,base.landscapeId).includes(G))
for(const h of history.files){assert.equal(hash(root+'/'+h.original.path),h.original.sha256);if(h.exactHistoricalCopy)assert.equal(hash(root+'/'+h.exactHistoricalCopy.path),h.original.sha256)}
assert.equal(hash(root+'/'+history.wholeMaterialsExactCopy.path),history.wholeMaterialsOriginal.sha256);assert.equal(hash(root+'/'+history.actualPNG.path),'sha256:cd665cb625e4768188b89295859a3104851112731c237c2b18884a8933dce79d')
const nowPin=hash(root+'/'+inputs.globalInput.path)
const report={role:'AUTHOR finite technical checks only; no independent science or scope acceptance',actualBase:gc.actualCanonicalBase,frozenBaseExact:true,currentCanonicalSha256AtCheck:nowPin,currentGlobalInputUnchangedAtCheck:nowPin===gc.actualCanonicalBase.sha256,wholeGoalSchemas:4,wholeGoalSchemaErrors:0,bothDAGsAcyclic:true,scienceFieldsMaterialsImageExact:true,views:viewReports,courseBefore,courseAfter,twoWholeSource032DecisionsStillUnreviewed:true,allThreeOldPartialPartnersEdgesAndNestedHistoryExact:true,retained327HELK:true,existingBoundaryBlocksBroadSourceInheritance:true,priorAMPVOnlyHistory:true,noAssessmentPriorAMPVClaimed:true,normalWrites:0,newIndependentVotes:0,newSourceApprovals:0,HumanApproval:false,HumanTrial:false,fullBuildOrWholeM7Claim:false}
const p=out+'/CHECKS.four-goal-schema-two-stock-views-DAG-mapping-history.AUTHOR.actual.json';assert.ok(!fs.existsSync(p));fs.writeFileSync(p,JSON.stringify(report,null,2)+'\n')
console.log(JSON.stringify({goalSchemaErrors:0,stockViews:2,stockViewErrors:0,DAGs:'acyclic',source032:'unreviewed',courseAfter:courseAfter.status,retained327:true,currentInputUnchanged:report.currentGlobalInputUnchangedAtCheck,newIndependentVotes:0}))
