import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync,writeFileSync } from 'node:fs'
import { diodeChildren, expectedDiodeTargets, preserveFinalDiodePlacementsFromCurrent } from '/home/enpasos/projects/skillpilot/app/scripts/lib/physicsFinalDiodeViewPlacements.ts'
import type { PhysicsPlacementNode, PhysicsPlacementView } from '/home/enpasos/projects/skillpilot/app/scripts/lib/physicsViewPlacementTypes.ts'
const files=['app/scripts/lib/physicsFinalDiodeViewPlacements.ts','app/scripts/testPhysicsSemiconductorSourceRepair.ts'];
const hash=(p:string)=>createHash('sha256').update(readFileSync(p)).digest('hex');const pins=Object.fromEntries(files.map(p=>[p,hash(p)]))
const load=(file:string)=>JSON.parse(readFileSync('curricula/DE/Gymnasium/composition-views/physik/'+file+'.view.json','utf8')) as PhysicsPlacementView
const rows=[]
for(const name of ['de-he-gk-g8','de-he-lk-g9','de-he-seki-g8','de-he-seki-g9','de-rp-seki','de-bw-gk','de-bw-seki','de-by-gk','de-by-seki']){
 const v=load(name);const result=preserveFinalDiodePlacementsFromCurrent(structuredClone(v),v);assert.deepEqual(result,v)
 rows.push({name,status:'PASS',sha256:hash('curricula/DE/Gymnasium/composition-views/physik/'+name+'.view.json')})
}
for(const name of ['de-he-seki-g8','de-he-seki-g9','de-rp-seki']){
 const v=load(name);v.rootNodes.push({kind:'goalEntry',goalId:diodeChildren[0],projectionRole:'target'});
 assert.throws(()=>preserveFinalDiodePlacementsFromCurrent(structuredClone(v),v),/target-role matrix/)
}
for(const name of ['de-bw-seki','de-bw-gk']){
 const v=load(name);v.rootNodes.push({kind:'canonicalSubtree',goalId:'7f0798cb-5966-5dcb-beb3-84f637ab6139',projectionRole:'prerequisiteOnly'})
 assert.throws(()=>preserveFinalDiodePlacementsFromCurrent(structuredClone(v),v),/unneeded BW lower parent/)
}
const he=load('de-he-gk-g8')
const find=(nodes:PhysicsPlacementNode[],id:string):PhysicsPlacementNode|undefined=>nodes.find(n=>n.id===id)??nodes.flatMap(n=>{const f=find(n.children??[],id);return f?[f]:[]})[0]
const prep=find(he.rootNodes,'physics-semiconductor-sekii')!;assert(prep)
const remove=(nodes:PhysicsPlacementNode[])=>{for(let i=nodes.length-1;i>=0;i--){if(nodes[i]===prep)nodes.splice(i,1);else remove(nodes[i].children??[])}}
remove(he.rootNodes);find(he.rootNodes,'physics-e-phase')!.children!.push(prep)
assert.throws(()=>preserveFinalDiodePlacementsFromCurrent(structuredClone(he),he),/inside Q4/)
assert.deepEqual(expectedDiodeTargets({jurisdiction:'DE-HE',stage:'CrossStage'}),[0,1,2])
assert.deepEqual(expectedDiodeTargets({jurisdiction:'DE-RP',stage:'CrossStage'}),[0])
assert.deepEqual(Object.fromEntries(files.map(p=>[p,hash(p)])),pins)
writeFileSync('tmp/pipeline/laender-stufen/gesamt/review/root-diode-preservation.actual.json',JSON.stringify({at:new Date().toISOString(),status:'PASS',sourcePins:pins,actualViews:rows,negativeCases:6,notes:'Independent real-view preservation and role boundaries; full source mapping, payload and after tests additionally run in required suite.'},null,2)+'\n');console.log('PASS nine real views, six separate invalid scope/placement cases')
