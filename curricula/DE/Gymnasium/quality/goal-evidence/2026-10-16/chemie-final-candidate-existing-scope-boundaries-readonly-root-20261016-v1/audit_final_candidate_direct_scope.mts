// SPDX-License-Identifier: Apache-2.0
// Finite read-only candidate audit. Existing pinned applicability is reused explicitly;
// this is neither a new applicability compilation nor an executed Java learning session.
import fs from 'node:fs'
import path from 'node:path'
import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
const R=process.cwd(), E='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-16'
const L=path.join(R,'tmp/chemie-m7-resumed-20261016/chemie-combined639-current-type-corrected-review-capsule-v1')
const S=E+'/chemie-shared-carrier-three-boundaries-and-generic-four-view-author-successor-20261016-v1'
const X=E+'/chemie-seven-HE-historical-exam-atomic-interface-and-material-author-successor-20261016-v1'
const O=E+'/chemie-final-candidate-existing-scope-boundaries-readonly-root-20261016-v1'
const read=(p:string)=>JSON.parse(fs.readFileSync(p,'utf8'))
const sha=(p:string)=>'sha256:'+createHash('sha256').update(fs.readFileSync(p)).digest('hex')
const canonical=L+'/curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
const land=read(canonical), by=new Map<string,any>(land.goals.map((g:any)=>[g.id,g]))
const changed=[]
for(const f of [S+'/CAS.six-whole-goal-operations.author-inactive-v3.json',X+'/CAS.seven-WHOLE-exams.current639.AUTHOR.inactive.json']){
 for(const op of read(f).operations){assert.deepEqual(by.get(op.goalId),op.beforeWhole??op.before);by.set(op.goalId,op.afterWhole??op.after);changed.push(op.goalId)}
}
const {collectCompositionProjectionRoleGoalIds,compileCompositionView}=await import(R+'/app/src/utils/authoring/compositionViewAuthoring.ts')
const {convertLearningGoal}=await import(R+'/app/src/goalTypes.ts')
const {goalMatchesFilters}=await import(R+'/app/src/utils/goalFilters.ts')
const D=E+'/chemie-current437-nine-targeted-native-pages-combined639-technical-20261016-v1/CHECK.actual-combined639-stock82-and39views.before-Fruit-practical-placement.json'
const apv=new Map<string,any>(read(D).stockChemistryReport.goals.map((g:any)=>[g.goalId,g.compiledApplicability]))
const views=new Map<string,any>()
for(const f of fs.readdirSync(L+'/curricula/DE/Gymnasium/composition-views/chemie').filter(f=>f.endsWith('.json')))views.set(f,read(L+'/curricula/DE/Gymnasium/composition-views/chemie/'+f))
for(const op of read(S+'/CAS.eight-whole-views.author-inactive.json').operations){const file=path.basename(op.beforePath);assert.deepEqual(views.get(file),op.beforeWhole);views.set(file,op.afterWhole)}
const rows=[]
for(const [file,view] of views){
 const roles=collectCompositionProjectionRoleGoalIds(view.rootNodes,by),filters=[view.scope.courseProfile,view.scope.jurisdiction].filter(Boolean)
 const matches=(id:string)=>{const g=by.get(id);return g&&goalMatchesFilters(convertLearningGoal({...g,applicability:{...g.applicability,...apv.get(id)}},{landscapeId:land.landscapeId}),filters)}
 const target=new Set([...roles.targetGoalIds].filter(matches)),support=new Set(roles.prerequisiteOnlyGoalIds),allowed=new Set([...target,...support])
 const directMissing=[]
 for(const id of allowed){const g=by.get(id);if(!g)continue;for(const req of g.requires??[])if(!allowed.has(req))directMissing.push({from:id,title:g.title,fromRole:target.has(id)?'target':'prerequisiteOnly',to:req,toTitle:by.get(req)?.title,toTags:by.get(req)?.tags,fromKind:g.nodeKind??g.type,fromTags:g.tags,isExam:!!g.examData})}
 const checks=compileCompositionView(view,{...land,goals:[...by.values()]}).findings.filter((f:any)=>f.severity==='error')
 rows.push({file,scope:view.scope,stockCompileErrors:checks,targetCount:target.size,supportCount:support.size,directMissing,foundationMembership:['266a2b2a-9ee2-52f6-ae09-59343da9a60b','416dfd33-8b43-5c49-903c-9847b95e4208','13d4f336-ab16-54a7-9479-c920b458f385','8a2ad724-df5e-5986-8de9-560ba43caac2'].map(id=>({id,title:by.get(id)?.title,target:target.has(id),support:support.has(id)}))})
}
const out={role:'Read-only source-based scope boundary audit of exactly composed inactive candidates',baseCanonical:{path:canonical,sha256:sha(canonical)},wholeGoalCAS:changed,scopeCASCount:8,reusedPinnedApplicability:{path:D,sha256:sha(D),freshCompilation:false,limits:'No mappings or ordinary applicability changed in these operations. New memory acquisition metadata and view scope require a fresh stock applicability/memory run before integration.'},views:rows,notExecutedBackendSession:true,HumanApproval:false,HumanTrial:false,M7Claim:false}
fs.mkdirSync(O,{recursive:true});const p=O+'/AUDIT.source-based-current-type-plus-shared6-seven7-eightViews.before-additional-fixes.json';assert(!fs.existsSync(p));fs.writeFileSync(p,JSON.stringify(out,null,2)+'\n')
console.log(JSON.stringify({path:p,views:rows.length,viewErrors:rows.flatMap(x=>x.stockCompileErrors).length,scopeBoundaryRows:rows.filter(x=>x.directMissing.length).map(x=>({file:x.file,count:x.directMissing.length,examples:x.directMissing.slice(0,12)}))}))
