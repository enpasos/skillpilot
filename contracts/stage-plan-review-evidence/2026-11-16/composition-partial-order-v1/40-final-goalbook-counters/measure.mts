import assert from 'node:assert/strict'
import {readFileSync,readdirSync,writeFileSync} from 'node:fs'
import {createHash} from 'node:crypto'
import {evaluateRouteProfile,createRouteProfiles} from '/home/enpasos/projects/skillpilot/app/scripts/generateCurriculumQualityStatus.ts'
import {buildApplicabilityCompilation} from '/home/enpasos/projects/skillpilot/app/scripts/applicabilityCompiler.ts'
const root='/home/enpasos/projects/skillpilot',out=root+'/tmp/pipeline/laender-stufen/gesamt/review/physics-goalbook-final-counters'
const files=readdirSync(root+'/curricula/DE/Gymnasium/canonical').filter(f=>f.endsWith('.json')).map(f=>root+'/curricula/DE/Gymnasium/canonical/'+f)
const catalog=files.map(f=>JSON.parse(readFileSync(f,'utf8')))
const viewFiles=readdirSync(root+'/curricula/DE/Gymnasium/composition-views/physik').filter(f=>f.endsWith('.view.json')).map(f=>root+'/curricula/DE/Gymnasium/composition-views/physik/'+f)
const newViews=viewFiles.filter(f=>/de-(bb|be|bw|by|hb|hh|mv|ni|nw|rp|sh|sl|sn|st|th)-seki\.view\.json$/.test(f));assert.equal(newViews.length,15)
const paths=[...files,...viewFiles,...['app/scripts/testPhysicsGoalBookInputs.ts','app/scripts/generateCurriculumQualityStatus.ts','app/scripts/applicabilityCompiler.ts','app/scripts/lib/compositionStageRouteMembership.ts','app/scripts/lib/explicitAtomicRouteEndpoints.ts'].map(p=>root+'/'+p)]
const pins=()=>Object.fromEntries(paths.map(f=>[f.slice(root.length+1),createHash('sha256').update(readFileSync(f)).digest('hex')]))
const before=pins(),start=Date.now(),physics=catalog.find(l=>l.landscapeId==='7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a')
const applicability=buildApplicabilityCompilation(catalog.map((landscape,i)=>({file:files[i],landscape})))
const profile=createRouteProfiles(root).find(p=>p.profileId==='canonical-physics-sek1')!
const ids=['2084b7d4-300d-5fa0-8b8d-c480c40f853e','3857891b-d328-585b-9936-85c7aff122ee','3b586f2a-60e2-5019-aa08-6a47616a1f1f','7d4d6a39-0c78-5fb0-b7bf-182ed00972f7','68034218-8f3e-5f7f-ae4e-ed057dd4e44e']
const total=evaluateRouteProfile(physics,profile,applicability,catalog,viewFiles).rules.find(r=>r.id==='CQR-104')!
const rows=[]
for (const id of ids) {
 const one={...profile,goalSelector:goal=>goal.id===id}
 const all=evaluateRouteProfile(physics,one,applicability,catalog,viewFiles).rules.find(r=>r.id==='CQR-104')!
 const added=evaluateRouteProfile(physics,one,applicability,catalog,newViews).rules.find(r=>r.id==='CQR-104')!
 rows.push({id,totalOccurrences:all.metrics?.visibleProfileSelectedAtomicGoalOccurrences,newLowerViewOccurrences:added.metrics?.visibleProfileSelectedAtomicGoalOccurrences,originalViewOccurrences:(all.metrics?.visibleProfileSelectedAtomicGoalOccurrences??0)-(added.metrics?.visibleProfileSelectedAtomicGoalOccurrences??0),allRule:all,newLowerRule:added})
 console.log(JSON.stringify({id,total:rows.at(-1)?.totalOccurrences,newLower:rows.at(-1)?.newLowerViewOccurrences}))
}
const after=pins(),drift=Object.keys(before).filter(p=>before[p]!==after[p]);assert.deepEqual(drift,[])
assert.equal(total.status,'pass');assert.deepEqual(rows.map(r=>r.totalOccurrences),[30,24,12,6,6]);assert.deepEqual(rows.map(r=>r.newLowerViewOccurrences),[5,4,2,1,1]);assert.deepEqual(rows.map(r=>r.originalViewOccurrences),[25,20,10,5,5])
writeFileSync(out+'/counts.actual.json',JSON.stringify({status:'PASS',seconds:(Date.now()-start)/1000,inputPins:before,inputDrift:drift,aggregate:total,rows},null,2)+'\n')
console.log(JSON.stringify({status:'PASS',seconds:(Date.now()-start)/1000,counts:rows.map(r=>r.totalOccurrences),aggregate:total.metrics}))
