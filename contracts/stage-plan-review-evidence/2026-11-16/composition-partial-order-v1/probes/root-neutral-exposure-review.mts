import assert from 'node:assert/strict'
import { readFileSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { materializeNationalStageProjection } from '/home/enpasos/projects/skillpilot/app/scripts/lib/nationalStageProjection.ts'
const file='app/scripts/lib/nationalStageProjection.ts'
const hash=()=>createHash('sha256').update(readFileSync(file)).digest('hex')
const before=hash(), ids=['a','b','c']
const projection=(v:number)=>{const targetGoalIds=new Set<string>(), visibleGoalIds=new Set<string>();for(const id of ids){const role=v%3;v=Math.floor(v/3);if(role)visibleGoalIds.add(id);if(role===2)targetGoalIds.add(id)}return{targetGoalIds,visibleGoalIds}}
const source=(v:number,courseProfile:string)=>({...projection(v),viewId:courseProfile,landscapeId:'physics',scope:{schoolForm:'Gymnasium',stage:'CrossStage',courseProfile}})
const make=(a:number,g:number,l:number)=>({landscapeId:'physics',scope:{schoolForm:'Gymnasium',stage:'SekI'},defaultProjection:projection(0),jurisdiction:'DE-HE',sourceViewIds:['GK','LK'],nationalExposureFamily:[source(g,'GK'),source(l,'LK')],stageAuthorities:[projection(a)]})
let checks=0
for(let a=0;a<27;a++)for(let g=0;g<27;g++)for(let l=0;l<27;l++){
 const input=make(a,g,l), got=materializeNationalStageProjection(input)
 assert.deepEqual(got.errors,[])
 for(const kind of ['targetGoalIds','visibleGoalIds'] as const){
  const expected=ids.filter(id=>input.stageAuthorities[0][kind].has(id)&&input.nationalExposureFamily.some(s=>s[kind].has(id)))
  assert.deepEqual([...got.projection[kind]].sort(),expected)
 }
 checks++
}
const mutations=[
 (x:ReturnType<typeof make>)=>x.nationalExposureFamily.pop(),
 (x:ReturnType<typeof make>)=>x.sourceViewIds.pop(),
 (x:ReturnType<typeof make>)=>x.sourceViewIds.push('GK'),
 (x:ReturnType<typeof make>)=>x.nationalExposureFamily.push(source(26,'GK')),
 (x:ReturnType<typeof make>)=>x.nationalExposureFamily[1].scope.courseProfile='other',
 (x:ReturnType<typeof make>)=>x.nationalExposureFamily[1].landscapeId='other',
 (x:ReturnType<typeof make>)=>x.nationalExposureFamily[1].scope.stage='SekII',
 (x:ReturnType<typeof make>)=>x.stageAuthorities.push(projection(0)),
 (x:ReturnType<typeof make>)=>x.stageAuthorities.splice(0),
]
for(const mutate of mutations){const input=make(26,26,26);mutate(input);assert(materializeNationalStageProjection(input).errors.length)}
assert.equal(hash(),before)
const report={at:new Date().toISOString(),status:'PASS',sourceFile:file,sha256:before,roleCombinations:checks,negativeCases:mutations.length,semantics:'Only pinned complete GK/LK exposure is united, then intersected independently with unique target/visible stage authority; no support promotion or authority union'}
writeFileSync('tmp/pipeline/laender-stufen/gesamt/review/root-neutral-exposure.actual.json',JSON.stringify(report,null,2)+'\n');console.log(report)
