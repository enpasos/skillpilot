// SPDX-License-Identifier: Apache-2.0
import {readFileSync,writeFileSync,existsSync} from 'node:fs'
import {resolve} from 'node:path'
import {pathToFileURL} from 'node:url'
import {createHash} from 'node:crypto'
import {execFileSync} from 'node:child_process'
const root=process.cwd(),dir='curricula/DE/Gymnasium/quality/learning-units/physics-directed-quantity-arrows-20261126-v1/routes'
const output=process.argv.find(x=>x.startsWith('--output='))?.slice('--output='.length)
if(!output||existsSync(output))throw Error('Choose a fresh output; retained evidence is immutable')
const {measurePhysicsArrowRoutes}=await import(pathToFileURL(resolve(root,'scripts/physics_arrow_route_validation.ts')).href)
const canonical='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json'
const oldBytes=execFileSync('git',['show',`eb77c4fb68:${canonical}`],{cwd:root,maxBuffer:16*1024*1024})
const oldById=new Map(JSON.parse(oldBytes.toString()).goals.map((g:any)=>[g.id,g]))
const ids=['4ca83b3f-3605-5c0d-abc4-9f24b9e29bbe','d61ea362-f6c3-5eab-ac30-2d0e265ac0f6']
const before=measurePhysicsArrowRoutes(root,{mutateCatalog:catalog=>catalog.map(d=>({...d,goals:d.goals.map((g:any)=>ids.includes(g.id)?{...g,description:(oldById.get(g.id)as any).description,descriptionEn:(oldById.get(g.id)as any).descriptionEn}:g)}))})
const currentPath=`${dir}/native-90-routes.actual.json`,currentRaw=readFileSync(resolve(root,currentPath)),current=JSON.parse(currentRaw.toString())
const hash=(raw:any)=>createHash('sha256').update(typeof raw==='string'||Buffer.isBuffer(raw)?raw:JSON.stringify(raw)).digest('hex')
const currentById=new Map(current.views.map((r:any)=>[r.viewId,r]))
const rows=before.views.map((r:any)=>{const after:any=currentById.get(r.viewId);if(!after)throw Error('Missing current view '+r.viewId);return {viewId:r.viewId,file:r.file,scope:r.scope,beforeValueSha256:hash(r),currentValueSha256:hash(after),rolesPlacesFrontiersAndConsumerTimingUnchanged:JSON.stringify(r)===JSON.stringify(after)}})
const report={schema:'physics-arrow-native-description-counterfactual-v1',method:'Controlled native projection counterfactual on final genuinely released K4 and all current inputs: replace only the two approved goals DE/EN descriptions by their exact earlier texts, hold every goal identity, prerequisite, target, marker and view fixed, rerun all90 productive role/personal/navigation/unit-map/frontier projections, and compare each complete native result with the sealed actual final result.',counts:{views:rows.length,changedNativeViews:rows.filter(r=>!r.rolesPlacesFrontiersAndConsumerTimingUnchanged).length,beforeViolations:before.violations.length,currentViolations:current.violations.length},currentMeasurement:{path:currentPath,sha256:hash(currentRaw)},oldDescriptionSource:{baseCommit:'eb77c4fb68',path:canonical,sha256:hash(oldBytes)},goalIds:ids,views:rows,boundaries:['Counterfactual old text is synthetic diagnostic input, not a released or independently reapproved old-text catalog.','This complements the actual pre-text scratch versus final-generator byte comparison; it does not replace the current content reviews.']}
writeFileSync(output,JSON.stringify(report,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify(report.counts))
if(rows.length!==90||report.counts.changedNativeViews||before.violations.length||current.violations.length)throw Error('Description counterfactual changed actual native routes')
