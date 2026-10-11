import {readFileSync,writeFileSync} from 'node:fs'
import {createHash} from 'node:crypto'
import {resolve,join} from 'node:path'
import {normalizeCanonicalLandscape} from '../../../../../../../app/src/utils/authoring/canonicalAuthoring.ts'
import {compileCompositionView,normalizeCompositionView,collectCompositionProjectionRoleGoalIds} from '../../../../../../../app/src/utils/authoring/compositionViewAuthoring.ts'
const root=process.cwd();const own=resolve(root,'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/wirtschaft-dd38-543b-f08-036ea-explicit-existing-role-retention-ADDENDUM-INERT-round-b-v1')
const hash=(p:string)=>`sha256:${createHash('sha256').update(readFileSync(p)).digest('hex')}`
const landscapePath=join(own,'candidates/landscape.author-only.INERT.json');const scopePath=join(own,'source-notes/seventeen-explicit-existing-learner-scope-role-proposals.INERT.json')
const landscape=normalizeCanonicalLandscape(JSON.parse(readFileSync(landscapePath,'utf8')));const scopes=JSON.parse(readFileSync(scopePath,'utf8')).scopes
const goalMap=new Map(landscape.goals.map(g=>[g.id,g]));const results:any[]=[];const fragments:any[]=[]
for(const s of scopes){
 const id=`own-inert-dd543-${s.scope.jurisdiction.toLowerCase()}-${s.scope.courseProfile.toLowerCase()}`
 const entries=[...s.practiceGoalEntries,...s.contentGoalEntries,...s.prerequisiteOnlyGoalEntries]
 const fragment={viewId:id,landscapeId:landscape.landscapeId,scope:s.scope,rootNodes:[{kind:'structure',id:`${id}-group`,label:'Arbeitszeit und Entwicklung: erhaltene Übungsziele',children:entries}],authorArtifact:'Bounded additive merge fragment, never a replacement complete learner scope',activationState:'INERT',standaloneCompleteScope:false}
 const normalized=normalizeCompositionView(fragment);const checked=compileCompositionView(normalized,landscape)
 if(checked.findings.some(x=>x.severity==='error'))throw new Error(JSON.stringify(checked.findings))
 const roles=collectCompositionProjectionRoleGoalIds(normalized.rootNodes,goalMap)
 const expected=new Set([...s.practiceGoalEntries,...s.contentGoalEntries].map((x:any)=>x.goalId));const expectedPre=new Set(s.prerequisiteOnlyGoalEntries.map((x:any)=>x.goalId))
 if(JSON.stringify([...roles.targetGoalIds].sort())!==JSON.stringify([...expected].sort())||JSON.stringify([...roles.prerequisiteOnlyGoalIds].sort())!==JSON.stringify([...expectedPre].sort()))throw new Error('Native role collection changed the authored whole role sets')
 fragments.push(fragment);results.push({scope:s.scope,errorCount:0,findings:checked.findings,targetGoalIds:[...roles.targetGoalIds].sort(),prerequisiteOnlyGoalIds:[...roles.prerequisiteOnlyGoalIds].sort(),directGKda734TargetPreserved:s.scope.courseProfile==='GK'?roles.targetGoalIds.has('da73483a-2c18-5d42-b4f3-6ac6bcd6b5b0'):null,scopeIsBoundedAdditiveFragmentOnly:true})
}
writeFileSync(join(own,'candidates/seventeen-bounded-additive-role-fragments.INERT.json'),JSON.stringify({activationState:'INERT',standaloneCompleteScope:false,mustMergeWithExistingWholeScope:true,fragments},null,2)+'\n')
writeFileSync(join(own,'checks/native-bounded-composition-role-fragments.actual.json'),JSON.stringify({status:'passed_local_native_bounded_compile_and_projection_roles',checkedAt:new Date().toISOString(),node:process.version,inputArtifacts:[{path:'candidates/landscape.author-only.INERT.json',digest:hash(landscapePath)},{path:'source-notes/seventeen-explicit-existing-learner-scope-role-proposals.INERT.json',digest:hash(scopePath)},{path:'app/src/utils/authoring/compositionViewAuthoring.ts',digest:hash(join(root,'app/src/utils/authoring/compositionViewAuthoring.ts'))}],boundedScopesChecked:results.length,results,noWholeNativeM6OrCurrentViewReleaseClaim:true,activeViewWrites:false},null,2)+'\n')
process.stdout.write(JSON.stringify({status:'passed_local_bounded_native_role_compile',boundedScopes:results.length,activeViewWrites:false})+'\n')
