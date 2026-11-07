// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import { readFileSync, writeFileSync } from 'node:fs'
import { gunzipSync } from 'node:zlib'
import { resolve } from 'node:path'
import { tmpdir } from 'node:os'
import type { SkillLandscape } from '../src/landscapeTypes'
import { captureCurriculumSource, createRetainedCoverageContext, INFO_HELD as HE, RETAINED_INFO_OWNER as OWNER } from './lib/retainedAssessmentCoverage'
import { normalizeCompositionView, compileCompositionView, collectCompositionProjectionRoleGoalIds,
  type CompositionView, type CompositionStructureNode, type CompositionGoalEntryNode, type CompositionViewFinding } from '../src/utils/authoring/compositionViewAuthoring'
import { normalizeCanonicalLandscape } from '../src/utils/authoring/canonicalAuthoring'

type FixtureView = CompositionView & { rootNodes: CompositionStructureNode[] }
interface CaseResult { name: string; expectedHeld: boolean; actualHeld: boolean; contextStatus: string;
  issues: string[]; compileErrors: CompositionViewFinding[]; roles?: { heldTarget: boolean; heldPrerequisite: boolean };
  compilePositive: boolean; expectedInvalid: boolean }
const W=tmpdir(),R=resolve(import.meta.dirname,'../..'),label='retained-held-view-successor'
const hist=JSON.parse(gunzipSync(readFileSync(R+'/contracts/curriculum-assessment-coverage/v1/informatics/historical-informatics-source.json.gz')).toString()) as SkillLandscape
const normal=hist.goals.find(g=>!g.examData&&!(g.contains?.length))!.id,foreign='11111111-1111-4111-8111-111111111111'
const base=():FixtureView=>({viewId:'private-p2-native-test',landscapeId:OWNER,scope:{schoolForm:'Gymnasium',stage:'CrossStage'},rootNodes:[{kind:'structure',id:'private',label:'An explicit learning route',children:[{kind:'goalEntry',goalId:normal}]}]})
const rows:CaseResult[]=[]
function test(name:string,view:FixtureView|string,shouldHeld:boolean,s=hist,compilePositive=false,expectedInvalid=false){
 const raw=typeof view==='string'?Buffer.from(view):Buffer.from(JSON.stringify(view)),source=captureCurriculumSource<SkillLandscape>('private-p2-current.json',JSON.stringify(s)),defs=source.goals.filter(g=>g.examData||g.nodeKind==='exam').map(g=>g.id).sort(),path='private-p2/'+name+'.json',ctx=createRetainedCoverageContext(R,source,defs,[],[path],new Map([[path,raw]]))!
 const issues=ctx.manifest.discoveryIssues,held=issues.includes('held-introduction: active view'),invalid=issues.some(i=>i.startsWith('current-frame-invalid:'))
 let compileErrors:CompositionViewFinding[]=[],roles:CaseResult['roles']
 if(typeof view!=='string'){const v=normalizeCompositionView(view),canonical=normalizeCanonicalLandscape(source);compileErrors=compileCompositionView(v,canonical).findings.filter(f=>f.severity==='error');const r=collectCompositionProjectionRoleGoalIds(v.rootNodes,new Map(source.goals.map(g=>[g.id,g])));roles={heldTarget:r.targetGoalIds.has(HE),heldPrerequisite:r.prerequisiteOnlyGoalIds.has(HE)}}
 assert.equal(held,shouldHeld,name)
 if(compilePositive){assert.equal(compileErrors.length,0,name);assert.ok(roles);assert.equal(roles.heldTarget,false);assert.equal(roles.heldPrerequisite,false)}
 if(expectedInvalid)assert.equal(invalid,true)
 rows.push({name,expectedHeld:shouldHeld,actualHeld:held,contextStatus:ctx.manifest.status,issues,compileErrors,roles,compilePositive,expectedInvalid})
}
let v=base();test('no-held-control',v,false,hist,true)
v=base();v.title='Historical '+HE;test('historical-title',v,false,hist,true)
v=base();v.rootNodes[0].label='Historical '+HE;test('historical-structure-label',v,false,hist,true)
v=base();(v.rootNodes[0].children[0] as CompositionGoalEntryNode).displayLabel='Do not register '+HE;test('historical-display-label',v,false,hist,true)
v=base();v.description='Unregistered historical contract '+HE;test('historical-description',v,false,hist,true)
v=base();v.audit={goalId:HE,rootNodes:[{kind:'goalEntry',goalId:HE}]};test('historical-metadata-goal-shaped-json',v,false,hist,true)
v=base();v.viewId='mention-'+HE;test('historical-view-id',v,false,hist,true)
for(const kind of ['goalEntry','canonicalSubtree'] as const)for(const role of ['target','prerequisiteOnly'] as const)for(const form of ['bare','qualified','qualified-uppercase']){v=base();v.rootNodes[0].children=[{kind,goalId:form==='bare'?HE:form==='qualified'?OWNER+':'+HE:(OWNER+':'+HE).toUpperCase(),projectionRole:role}];test(kind+'-'+role+'-'+form,v,true)}
for(const role of ['target','prerequisiteOnly'] as const){v=base();v.rootNodes[0].children=[{kind:'goalEntry',goalId:foreign+':'+HE,projectionRole:role}];test('foreign-owner-'+role,v,false)}
v=base();v.rootNodes[0].children=[{kind:'structure',id:'deep',label:'Deep',children:[{kind:'goalEntry',goalId:HE,projectionRole:'prerequisiteOnly'}]}];test('nested-prerequisite-reference',v,true)
const ancestry=structuredClone(hist),root=ancestry.goals.find(g=>g.tags?.includes('root'))!;root.contains.push(HE);v=base();v.rootNodes[0].children=[{kind:'canonicalSubtree',goalId:root.id,projectionRole:'prerequisiteOnly'}];test('native-subtree-inherited-held',v,true,ancestry)
v=base();v.rootNodes[0].children=[{kind:'landscapeEntry',landscapeId:OWNER}];test('native-landscape-entry-held',v,true,ancestry)
test('malformed-json','{',false,hist,false,true)
// A real source definition remains rejected independently of all view labels.
const introduced=structuredClone(hist),exam=structuredClone(introduced.goals.find(g=>g.examData)!);exam.id=HE;introduced.goals.push(exam)
const src=captureCurriculumSource<SkillLandscape>('private-p2-held-source.json',JSON.stringify(introduced)),ids=src.goals.filter(g=>g.examData||g.nodeKind==='exam').map(g=>g.id).sort(),context=createRetainedCoverageContext(R,src,ids,[],[])!
assert.ok(context.manifest.discoveryIssues.includes('held-introduction: active source'));assert.equal(context.manifest.rows.find(r=>r.goalId===HE)!.decision,'fail')
writeFileSync(W+'/'+label+'.json',JSON.stringify({label,status:'All finite native expectations passed',productionSourceWrites:false,cases:rows,heldSourceRejected:true},null,2)+'\n')
console.log(JSON.stringify({label,cases:rows.length,zeroCompileErrorMetadataControls:rows.filter(r=>r.compilePositive).length,historicalMentionFalsePositives:rows.filter(r=>!r.expectedHeld&&r.actualHeld).length,heldSourceRejected:true,status:'pass'}))
