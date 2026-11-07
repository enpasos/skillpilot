import assert from 'node:assert/strict'
import{readFileSync,writeFileSync}from'node:fs'
import{gunzipSync}from'node:zlib'
import{captureCurriculumSource,createRetainedCoverageContext,INFO_HELD as HE,RETAINED_INFO_OWNER as OWNER}from'/home/enpasos/projects/skillpilot/app/scripts/lib/retainedAssessmentCoverage.ts'
import{normalizeCompositionView,compileCompositionView,collectCompositionProjectionRoleGoalIds}from'/home/enpasos/projects/skillpilot/app/src/utils/authoring/compositionViewAuthoring.ts'
import{normalizeCanonicalLandscape}from'/home/enpasos/projects/skillpilot/app/src/utils/authoring/canonicalAuthoring.ts'
const W='/dev/shm/informatics-q2-source-scope-v3-20261107',R='/home/enpasos/projects/skillpilot',label=process.argv[2],isOriginal=label.endsWith('original'),hist=JSON.parse(gunzipSync(readFileSync(R+'/contracts/curriculum-assessment-coverage/v1/informatics/historical-informatics-source.json.gz')).toString()),normal=hist.goals.find((g:any)=>!g.examData&&!(g.contains?.length)).id,foreign='11111111-1111-4111-8111-111111111111'
const base=()=>({viewId:'private-p2-native-test',landscapeId:OWNER,scope:{schoolForm:'Gymnasium',stage:'CrossStage'},rootNodes:[{kind:'structure',id:'private',label:'An explicit learning route',children:[{kind:'goalEntry',goalId:normal}]}]})
const rows:any[]=[]
function test(name:string,view:any,shouldHeld:boolean,s=hist,compilePositive=false,expectedInvalid=false){
 const raw=typeof view==='string'?Buffer.from(view):Buffer.from(JSON.stringify(view)),source:any=captureCurriculumSource('private-p2-current.json',JSON.stringify(s)),defs=source.goals.filter((g:any)=>g.examData||g.nodeKind==='exam').map((g:any)=>g.id).sort(),path='private-p2/'+name+'.json',ctx=createRetainedCoverageContext(R,source,defs,[],[path],new Map([[path,raw]]))!
 const issues=ctx.manifest.discoveryIssues,held=issues.includes('held-introduction: active view'),invalid=issues.some((i:string)=>i.startsWith('current-frame-invalid:'))
 let compileErrors:any[]=[],roles:any
 if(typeof view!=='string'){const v=normalizeCompositionView(view),canonical=normalizeCanonicalLandscape(source);compileErrors=compileCompositionView(v,canonical).findings.filter((f:any)=>f.severity==='error');const r=collectCompositionProjectionRoleGoalIds(v.rootNodes,new Map(source.goals.map((g:any)=>[g.id,g])));roles={heldTarget:r.targetGoalIds.has(HE),heldPrerequisite:r.prerequisiteOnlyGoalIds.has(HE)}}
 if(isOriginal){assert.equal(held,raw.includes(HE),name+' characterizes original raw-byte predicate')}else{assert.equal(held,shouldHeld,name)}
 if(compilePositive){assert.equal(compileErrors.length,0,name);assert.equal(roles.heldTarget,false);assert.equal(roles.heldPrerequisite,false)}
 if(expectedInvalid&&!isOriginal)assert.equal(invalid,true)
 rows.push({name,expectedHeld:shouldHeld,actualHeld:held,contextStatus:ctx.manifest.status,issues,compileErrors,roles,compilePositive,expectedInvalid})
}
let v=base();test('no-held-control',v,false,hist,true)
v=base();v.title='Historical '+HE;test('historical-title',v,false,hist,true)
v=base();v.rootNodes[0].label='Historical '+HE;test('historical-structure-label',v,false,hist,true)
v=base();(v.rootNodes[0].children[0]as any).displayLabel='Do not register '+HE;test('historical-display-label',v,false,hist,true)
v=base();(v as any).description='Unregistered historical contract '+HE;test('historical-description',v,false,hist,true)
v=base();(v as any).audit={goalId:HE,rootNodes:[{kind:'goalEntry',goalId:HE}]};test('historical-metadata-goal-shaped-json',v,false,hist,true)
v=base();v.viewId='mention-'+HE;test('historical-view-id',v,false,hist,true)
for(const kind of ['goalEntry','canonicalSubtree'])for(const role of ['target','prerequisiteOnly'])for(const form of ['bare','qualified','qualified-uppercase']){v=base();(v.rootNodes[0].children as any)=[{kind,goalId:form==='bare'?HE:form==='qualified'?OWNER+':'+HE:(OWNER+':'+HE).toUpperCase(),projectionRole:role}];test(kind+'-'+role+'-'+form,v,true)}
for(const role of ['target','prerequisiteOnly']){v=base();(v.rootNodes[0].children as any)=[{kind:'goalEntry',goalId:foreign+':'+HE,projectionRole:role}];test('foreign-owner-'+role,v,false)}
v=base();(v.rootNodes[0].children as any)=[{kind:'structure',id:'deep',label:'Deep',children:[{kind:'goalEntry',goalId:HE,projectionRole:'prerequisiteOnly'}]}];test('nested-prerequisite-reference',v,true)
const ancestry=structuredClone(hist),root=ancestry.goals.find((g:any)=>g.tags?.includes('root'));root.contains.push(HE);v=base();(v.rootNodes[0].children as any)=[{kind:'canonicalSubtree',goalId:root.id,projectionRole:'prerequisiteOnly'}];test('native-subtree-inherited-held',v,true,ancestry)
v=base();(v.rootNodes[0].children as any)=[{kind:'landscapeEntry',landscapeId:OWNER}];test('native-landscape-entry-held',v,true,ancestry)
test('malformed-json','{',false,hist,false,true)
// A real source definition remains rejected independently of all view labels.
const introduced=structuredClone(hist),exam=structuredClone(introduced.goals.find((g:any)=>g.examData));exam.id=HE;introduced.goals.push(exam);const src:any=captureCurriculumSource('private-p2-held-source.json',JSON.stringify(introduced)),ids=src.goals.filter((g:any)=>g.examData||g.nodeKind==='exam').map((g:any)=>g.id).sort(),context=createRetainedCoverageContext(R,src,ids,[],[])!;assert.ok(context.manifest.discoveryIssues.includes('held-introduction: active source'));assert.equal(context.manifest.rows.find((r:any)=>r.goalId===HE).decision,'fail')
writeFileSync(W+'/'+label+'.json',JSON.stringify({label,status:'All finite native expectations passed',productionSourceWrites:false,original13CiFilesPreserved:true,sourceC824Unchanged:true,ordinary875BindingUnchanged:true,cases:rows,heldSourceRejected:true},null,2)+'\n');console.log(JSON.stringify({label,cases:rows.length,zeroCompileErrorMetadataControls:rows.filter(r=>r.compilePositive).length,historicalMentionFalsePositives:rows.filter(r=>!r.expectedHeld&&r.actualHeld).length,heldSourceRejected:true,status:'pass'}))
