import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import assert from 'node:assert/strict'
import Ajv2020 from '../../../../../../../../app/node_modules/ajv/dist/2020.js'
const root='/home/enpasos/projects/skillpilot',out=path.dirname(new URL(import.meta.url).pathname),parent=path.dirname(out)
const read=(p:string)=>JSON.parse(fs.readFileSync(p,'utf8'))
const sha=(p:string)=>'sha256:'+crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex')
const inputs=read(out+'/INPUTS.sealed-main-P-case-and-current596-parent.AUTHOR.json')
const assessment=read(out+'/WHOLEGOAL.one-assessment-endpoint.AUTHOR.inactive.json')
const ordinary=inputs.wholeNewOrdinaryGoal,cas=read(out+'/CAS.current596-parent-append-exact-one-endpoint.AUTHOR.inactive.json')
const schema=read(root+'/contracts/curriculum-package/v1/compiled-landscape.schema.json')
const ajv=new Ajv2020({strict:false,allErrors:true})
const validate=ajv.compile({$schema:schema.$schema,$defs:schema.$defs,$ref:'#/$defs/examData'})
assert.ok(validate(assessment.examData),JSON.stringify(validate.errors))
assert.deepEqual(assessment.requires,[ordinary.id]);assert.deepEqual(assessment.examData.coveredGoalIds,[ordinary.id]);assert.deepEqual(assessment.extendedData.routeCoverage.assessedCoverage,[ordinary.id])
assert.equal(assessment.examData.reviewStatus,'draft');assert.equal(assessment.extendedData.applicabilityFromRequires,true)
assert.deepEqual(assessment.applicability.jurisdiction,['DE-SH']);assert.deepEqual(ordinary.applicability.jurisdiction,['DE-SH'])
assert.equal(assessment.examData.scoring.steps.length,4);assert.equal(assessment.examData.scoring.steps.reduce((n:number,s:any)=>n+s.points,0),16);assert.equal(assessment.examData.scoring.maxPoints,16);assert.equal(assessment.examData.scoring.passingPoints,16)
assert.deepEqual(cas.after.contains,cas.before.contains.concat(assessment.id))
assert.deepEqual({...cas.after,contains:cas.before.contains},cas.before)
const current=read(root+'/'+inputs.currentCanonical.path);assert.equal(sha(root+'/'+inputs.currentCanonical.path),inputs.currentCanonical.sha256)
const boundaryCAS=read(parent+'/CAS.existing-boundary-parent-whole-before-after.AUTHOR.inactive.json')
const goals=current.goals.map((g:any)=>g.id===boundaryCAS.after.id?boundaryCAS.after:g.id===cas.after.id?cas.after:g).concat([ordinary,assessment])
const by=new Map<string,any>(goals.map((g:any)=>[g.id,g]));assert.equal(by.size,current.goals.length+2)
for(const relation of ['contains','requires']){
 const active=new Set<string>(),done=new Set<string>();const visit=(id:string)=>{if(done.has(id))return;assert.ok(!active.has(id),relation+' cycle');active.add(id);for(const raw of by.get(id)?.[relation]??[]){const id=raw.includes(':')?raw.split(':').at(-1):raw;if(by.has(id))visit(id)}active.delete(id);done.add(id)};for(const id of by.keys())visit(id)
}
const originalCase=inputs.wholeOriginalPCase
for(const lang of ['de','en']){
 const t=lang==='de'?assessment.examData.taskContent:assessment.examData.taskContentEn,s=lang==='de'?assessment.examData.solutionContent:assessment.examData.solutionContentEn
 assert.ok(t.includes(originalCase.material[lang]));assert.ok(t.includes(originalCase.tasks[lang]));assert.ok(t.includes(originalCase.freshTransfer.newMaterial[lang]));assert.ok(t.includes(originalCase.freshTransfer.task[lang]));assert.ok(s.includes(originalCase.solution[lang]));assert.ok(s.includes(originalCase.freshTransfer.solution[lang]))
}
const mainSeal=read(parent+'/SEAL.AUTHOR-inactive-package.actual.json');for(const f of mainSeal.files)assert.equal(sha(root+'/'+f.path),f.sha256)
const report={role:'AUTHOR bounded assessment-schema/material/coverage/route-structure checks only',examSchemaErrors:0,ordinaryDirectPrerequisitesExactlyOne:true,assessedCoverageExactlyOne:true,fullExistingMaterialAndSolutionInDEEN:true,noNewTopicOrExperiment:true,maxPoints:16,passingPoints:16,mandatoryRubricCriteria:4,canonicalParent596AppendOnly:true,bothDAGRelationsAcyclic:true,main23SealedFilesExact:true,actualScopeCompilerNotRunInThisAddendum:true,stockApplicabilityImplementationRead:{path:'app/scripts/applicabilityCompiler.ts',sha256:sha(root+'/app/scripts/applicabilityCompiler.ts'),detail:'compileGoal clears own/ancestor jurisdiction evidence for applicabilityFromRequires; refreshRequiresDerivedApplicability intersects only assessed prerequisite scopes. Expected scope of the single SH prerequisite is SH, not inherited HE/BY.'},expectedScopeOnly:['DE-SH'],semanticKindProposal:'practiceAssessment',notCurricularAtomic:true,normalWrites:0,newIndependentVotes:0,noRouteOrM7ReleaseClaim:true}
const p=out+'/CHECKS.additive-one-assessment-author.actual.json';assert.ok(!fs.existsSync(p));fs.writeFileSync(p,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({examSchemaErrors:0,points:'16/16',mainFilesExact:23,bothDAGs:'acyclic',newIndependentVotes:0}))
