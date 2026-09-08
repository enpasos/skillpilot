/** Preserve only current reviewed B040 placements when a source generator copies a state template.
 * This is an explicit field overlay, never a whole-file/history restore.
 */
import {readFileSync} from 'node:fs'
import {resolve} from 'node:path'
import type {PhysicsPlacementNode, PhysicsPlacementView} from './physicsViewPlacementTypes'
const ids=new Set([
 'af5dfdbc-5fd6-5c3e-a81b-093cb7c14b93','37013646-f13a-5faf-954c-940f2fd7502f',
 'c52d55c3-b687-586c-b0f9-8ffcd1069424','3d466956-04fb-58d7-9008-ad8090f8706d',
 'b4772b06-b10c-52dd-841b-a96ffb7c7e28','1b060e79-dc2d-5e4e-abb5-42eca39f9cc7',
 'db0394ca-297c-5892-b414-525ec186f928','d44eb772-acb3-5449-accc-36a1fb7a25a5',
 'e99d87ac-0024-5f2b-ab47-d4d1cebba027','b34f3e03-bbe7-5ede-941c-3f26c9b07bb8',
 '2874902d-eccd-513e-ab60-98892497911d','c518e9dc-8514-5fde-9811-19caa85cfb1a',
 'c77d28e5-a03e-5518-8c3a-55e9e9a2cea3','b3b365f4-4988-57d5-97cd-5d8446483ef7',
 '335a75b0-f691-5867-8ce3-3c971d541b9f',
 '04832ee1-648a-5421-a01d-0a15c3536c5f','71af215d-c6d5-59ce-a3f6-4a2e60f1216d','f61c424e-f091-5f9d-9d58-c1bd29733fc8',
])
const oldParents=new Set(['c9405043-bdc0-5995-8b4d-5bb56d97d05d','e5b3d86c-0a74-5fa7-b9c4-7964bcb5ebc9','5db07785-8cca-50d5-81a9-e0264d344af9'])
const assert=(v:unknown,message:string)=>{if(!v)throw Error('B040 view protection: '+message)}
export function preserveB040PlacementsFromCurrent<T extends PhysicsPlacementView>(draft:T,current:PhysicsPlacementView){
 assert(draft.scope?.jurisdiction===current.scope?.jurisdiction&&draft.scope?.stage===current.scope?.stage&&draft.scope?.courseProfile===current.scope?.courseProfile,'source/target scope mismatch')
 const placements:{node:PhysicsPlacementNode;ancestors:PhysicsPlacementNode[]}[]=[]
 const collect=(nodes:PhysicsPlacementNode[],ancestors:PhysicsPlacementNode[]=[])=>nodes.forEach(n=>{
  if(ids.has(n.goalId as string))placements.push({node:structuredClone(n),ancestors})
  collect(n.children??[],[...ancestors,n])
 })
 collect(current.rootNodes)
 const remove=(nodes:PhysicsPlacementNode[]):PhysicsPlacementNode[]=>nodes.filter(n=>!ids.has(n.goalId as string)&&!oldParents.has(n.goalId as string)).map(n=>{
  assert(n.goalId!=='b59cb1ef-05c2-5b09-abb3-8b6903ca0fd6','legacy aggregate requires explicit expansion, not implicit child promotion')
  return n.children?{...n,children:remove(n.children)}:n
 })
 draft.rootNodes=remove(draft.rootNodes)
 for(const placement of placements){
  let siblings=draft.rootNodes
  for(const ancestor of placement.ancestors){
   assert(ancestor.kind==='structure'&&ancestor.id,'explicit structure path required')
   let found=siblings.find(n=>n.kind==='structure'&&n.id===ancestor.id)
   if(!found){
    // Only the B040-owned wrapper may be created. Missing pre-existing stage
    // anchors fail closed instead of moving a prerequisite to the root.
    assert(ancestor.id!.startsWith('physics-b040-'),'missing reviewed stage anchor '+ancestor.id)
    found={...structuredClone(ancestor),children:[]};siblings.push(found)
   }
   siblings=found.children!
  }
  siblings.push(placement.node)
 }
 return draft
}
export function preservePhysicsB040ViewPlacements<T extends PhysicsPlacementView>(root:string,path:string,draft:T){
 const current=JSON.parse(readFileSync(resolve(root,path),'utf8'))
 return preserveB040PlacementsFromCurrent(draft,current)
}
