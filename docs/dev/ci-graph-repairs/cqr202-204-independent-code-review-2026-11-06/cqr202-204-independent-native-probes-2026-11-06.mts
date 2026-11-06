import assert from 'node:assert/strict'
import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { resolve } from 'node:path'
import { normalizeCanonicalLandscape } from '../app/src/utils/authoring/canonicalAuthoring.ts'
import { normalizeCompositionView, collectCompositionProjectionRoleGoalIds, compileCompositionView } from '../app/src/utils/authoring/compositionViewAuthoring.ts'
const repo=resolve(import.meta.dirname,'..')
const A='00000000-0000-4000-8000-000000000001',B='00000000-0000-4000-8000-000000000002',C='00000000-0000-4000-8000-000000000003',R='00000000-0000-4000-8000-000000000004',F='00000000-0000-4000-8000-000000000005',FR='00000000-0000-4000-8000-000000000006'
const goal=(id:string, contains:string[]=[],tags:string[]=[])=>({id,title:id,description:'Independent compiler fixture',weight:1,contains,requires:[],tags})
const own:any={landscapeId:'own-fixture',title:'Own',goals:[goal(R,[C],['root']),goal(C,[A,B]),goal(A),goal(B)]}
own.goals[1].semanticKind='curricularArea'
const foreign:any={landscapeId:'foreign-fixture',title:'Foreign',goals:[goal(FR,[F],['root']),goal(F)]}
const cases:any[]=[
 ['target-subtree',[{kind:'canonicalSubtree',goalId:C}]],
 ['support-subtree-direct-target-override',[{kind:'canonicalSubtree',goalId:C,projectionRole:'prerequisiteOnly'},{kind:'goalEntry',goalId:A}]],
 ['target-subtree-direct-support-override',[{kind:'canonicalSubtree',goalId:C},{kind:'goalEntry',goalId:A,projectionRole:'prerequisiteOnly'}]],
 ['duplicate-subtree-error',[{kind:'canonicalSubtree',goalId:C},{kind:'canonicalSubtree',goalId:C}]],
 ['overlap-error',[{kind:'canonicalSubtree',goalId:C},{kind:'canonicalSubtree',goalId:A}]],
 ['opaque-cluster-error',[{kind:'goalEntry',goalId:C}]],
 ['missing-goal-error',[{kind:'goalEntry',goalId:'missing'}]],
 ['foreign-landscape-entry',[{kind:'landscapeEntry',landscapeId:foreign.landscapeId}]],
 ['foreign-target-atom',[{kind:'goalEntry',goalId:F}]],
 ['foreign-support-atom',[{kind:'goalEntry',goalId:F,projectionRole:'prerequisiteOnly'}]],
 ['missing-landscape-error',[{kind:'landscapeEntry',landscapeId:'missing-owner'}]],
 ['empty-structure-error',[{kind:'structure',id:'empty',label:'Empty',children:[]}]],
 ['invalid-role-error',[{kind:'goalEntry',goalId:A,projectionRole:'invented'}]],
].map(([name,rootNodes])=>({name,view:{viewId:name,landscapeId:own.landscapeId,scope:{schoolForm:'Gymnasium',stage:'SekII'},rootNodes},landscape:own,catalog:[own,foreign]}))
const canonicalDir=resolve(repo,'curricula/DE/Gymnasium/canonical')
const paths=readdirSync(canonicalDir).filter(p=>p.endsWith('.json')&&!/_deck/i.test(p)).sort()
const catalog=paths.map(p=>JSON.parse(readFileSync(resolve(canonicalDir,p),'utf8')))
const info=catalog.find(p=>p.landscapeId==='7d51b38c-a149-5407-bddc-d2ce7878b020')
const actualViewPath=resolve(repo,'curricula/DE/Gymnasium/composition-views/informatik/de-he-gym-informatics-crossstage.view.json')
cases.push({name:'actual-current-informatics-he-crossstage',view:JSON.parse(readFileSync(actualViewPath,'utf8')),landscape:info,catalog})
const results=[]
for(const input of cases){
 const canonical=normalizeCanonicalLandscape(input.landscape)
 const owners=new Map(input.catalog.map((p:any)=>[p.landscapeId,normalizeCanonicalLandscape(p)]))
 const full:any={landscapeId:'canonical-assessment-view-universe',title:'Canonical view inputs',goals:[...owners.values()].flatMap((p:any)=>p.goals)}
 const byId=new Map(full.goals.map((g:any)=>[g.id,g]))
 const roots=new Map([...owners].flatMap(([id,p]:any)=>{const root=p.goals.find((g:any)=>g.tags?.includes('root'));return root?[[id,root.id]]:[]}))
 const view=normalizeCompositionView(input.view)
 const roles=collectCompositionProjectionRoleGoalIds(view.rootNodes,byId as any,roots as any)
 const refs=new Set([...roles.targetGoalIds,...roles.prerequisiteOnlyGoalIds])
 const reduced={...full,goals:full.goals.filter((g:any)=>refs.has(g.id))}
 const t=performance.now();const before=compileCompositionView(view,canonical,full,owners as any);const fullMs=performance.now()-t
 const u=performance.now();const after=compileCompositionView(view,canonical,reduced,owners as any);const reducedMs=performance.now()-u
 assert.deepEqual(after.compiledRootNodes,before.compiledRootNodes,input.name+' complete tree/order')
 assert.deepEqual(after.findings,before.findings,input.name+' full error/warning findings')
 const reducedRoles=collectCompositionProjectionRoleGoalIds(view.rootNodes,new Map(reduced.goals.map((g:any)=>[g.id,g])) as any,roots as any)
 assert.deepEqual([...reducedRoles.targetGoalIds].sort(),[...roles.targetGoalIds].sort(),input.name+' target membership')
 assert.deepEqual([...reducedRoles.prerequisiteOnlyGoalIds].sort(),[...roles.prerequisiteOnlyGoalIds].sort(),input.name+' support membership')
 if(input.name.endsWith('-error'))assert(before.findings.some(f=>f.severity==='error'),input.name+' genuine negative')
 results.push({case:input.name,fullGoalDefinitions:full.goals.length,reducedGoalDefinitions:reduced.goals.length,targetGoals:roles.targetGoalIds.size,supportGoals:roles.prerequisiteOnlyGoalIds.size,errors:before.findings.filter(f=>f.severity==='error').map(f=>f.code),warnings:before.findings.filter(f=>f.severity==='warning').map(f=>f.code),fullMs,reducedMs,treeExact:true,allFindingsExact:true,targetMembershipExact:true,supportMembershipExact:true})
 console.log('PASS',input.name)
}
const pins=paths.map(p=>({path:'curricula/DE/Gymnasium/canonical/'+p,sha256:createHash('sha256').update(readFileSync(resolve(canonicalDir,p))).digest('hex')}))
const out={status:'PASS',method:'Both paths invoke the same native role collector and native compiler; compare entire compiled trees, all findings and target/support membership. No projected tree or scope engine was reimplemented.',cases:results,sourcePins:pins,actualView:{path:actualViewPath,sha256:createHash('sha256').update(readFileSync(actualViewPath)).digest('hex')},fullCqrProducerInvoked:false,sourceFilesWritten:false}
writeFileSync(resolve(repo,'tmp/cqr202-204-independent-native-probes-2026-11-06.json'),JSON.stringify(out,null,2)+'\n')
console.log(JSON.stringify({status:out.status,cases:results.length,sourcePins:pins.length}))
