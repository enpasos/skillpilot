import { readFileSync, writeFileSync } from 'node:fs'
import { resolve,relative } from 'node:path'
import { pathToFileURL } from 'node:url'
import { createHash } from 'node:crypto'
import assert from 'node:assert/strict'
const [rootArg,capArg,outArg,hArg,canArg] = process.argv.slice(2)
const root=resolve(rootArg),cap=resolve(capArg)
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'))
const bind=(p:string)=>{const b=readFileSync(p);return {path:relative(root,p),sha256:createHash('sha256').update(b).digest('hex'),bytes:b.length}}
const {collectGenericTreeFindings,collectDuplicateDirectPhaseStructureFindings,collectLearnerFacingCompositionLabelFindings}=await import(pathToFileURL(resolve(cap,'app/scripts/independentB_twoNationalReadonlyValidatorExports.ts')).href)
const {compileCompositionView,normalizeCompositionView,collectCompositionProjectionRoleGoalIds}=await import(pathToFileURL(resolve(root,'app/src/utils/authoring/compositionViewAuthoring.ts')).href)
const {normalizeCanonicalLandscape,buildCanonicalGraphIndex}=await import(pathToFileURL(resolve(root,'app/src/utils/authoring/canonicalAuthoring.ts')).href)
const can=normalizeCanonicalLandscape(read(resolve(root,canArg))),graph=buildCanonicalGraphIndex(can),h=read(resolve(root,hArg))
const validate=(v:any)=>{const c=compileCompositionView(normalizeCompositionView(v),can);return {compiledRootNodes:c.compiledRootNodes,findings:[...c.findings,...collectGenericTreeFindings(c.compiledRootNodes),...collectDuplicateDirectPhaseStructureFindings(c.compiledRootNodes),...collectLearnerFacingCompositionLabelFindings(c.compiledRootNodes)]}}
const sort=(xs:Iterable<string>)=>[...xs].sort()
const roles=(v:any)=>{const r=collectCompositionProjectionRoleGoalIds(v.rootNodes,graph.goalById);return {target:sort(r.targetGoalIds),prerequisiteOnly:sort(r.prerequisiteOnlyGoalIds)}}
const rows=h.whole2Views.map((row:any)=>{
 const before=read(resolve(root,row.wholeBefore.path)),after=read(resolve(root,row.wholeAfter.path))
 const b=validate(before),a=validate(after)
 assert.deepEqual(roles(before),roles(after))
 assert.equal(b.findings.filter((f:any)=>f.severity==='error').length,row.courseProfile==='GK'?156:234)
 assert.equal(a.findings.filter((f:any)=>f.severity==='error').length,0)
 const first=b.findings.find((f:any)=>f.code==='CPV-005')!.goalId
 const originalNodes:any[]=[]
 const refs=(nodes:any[])=>nodes.forEach(n=>n.kind==='structure'?refs(n.children):originalNodes.push(n))
 refs(before.rootNodes)
 const direct=originalNodes.find(n=>n.kind==='goalEntry'&&n.goalId===first)
 assert.ok(direct)
 const duplicate=JSON.parse(JSON.stringify(after));duplicate.rootNodes[0].children.push(direct)
 const dn=validate(duplicate),errors=dn.findings.filter((f:any)=>f.severity==='error')
 assert.deepEqual(errors.map((f:any)=>f.code).sort(),['CPV-005','CPV-006'])
 assert.ok(errors.every((f:any)=>f.goalId===first))
 const wrongRole=JSON.parse(JSON.stringify(after));let changed=false
 const mutate=(nodes:any[])=>nodes.forEach(n=>{if(n.kind==='structure')mutate(n.children);else if(n.kind==='canonicalSubtree'&&n.goalId==='14c05eec-87af-5fd6-832a-4f5d9d280e66'){n.projectionRole='prerequisiteOnly';changed=true}})
 mutate(wrongRole.rootNodes);assert.ok(changed)
 const correct=roles(after),wrong=roles(wrongRole),lost=correct.target.filter(id=>!wrong.target.includes(id))
 assert.ok(lost.length>0);assert.notDeepEqual(correct,wrong)
 return {courseProfile:row.courseProfile,before:bind(resolve(root,row.wholeBefore.path)),after:bind(resolve(root,row.wholeAfter.path)),beforeFindings:b.findings,afterFindings:a.findings,wholeNativeTargetAndPrerequisiteOnlySetsExact:true,duplicateNegative:{wholeAddedOriginalNode:direct,actualErrorFindings:errors,expectedTwoErrors:true},roleSpecificityNegative:{mutatedCanonicalSubtreeGoalId:'14c05eec-87af-5fd6-832a-4f5d9d280e66',actualLostTargetGoalIds:lost,actualWrongRoleSets:wrong,targetPreservationGuardRejects:true},afterNativeRoles:correct}
})
writeFileSync(resolve(root,outArg),JSON.stringify({authority:'Independent native applicable Economics tree validation and actual in-memory contract negatives; no production logic edits',authorHandoff:bind(resolve(root,hArg)),canonical:bind(resolve(root,canArg)),rows},null,2)+'\n')
console.log(JSON.stringify(rows.map(r=>({course:r.courseProfile,beforeErrors:r.beforeFindings.filter((f:any)=>f.severity==='error').length,afterErrors:r.afterFindings.filter((f:any)=>f.severity==='error').length,afterWarnings:r.afterFindings.filter((f:any)=>f.severity==='warning').length,duplicateNegativeErrors:r.duplicateNegative.actualErrorFindings.length,wrongRoleLostTargets:r.roleSpecificityNegative.actualLostTargetGoalIds.length}))))
