/** Preserve only reviewed B034 reference nodes and their exact stage paths on template replay.
 * No whole view or broad preserved subtree is copied. Missing non-B034 stage anchors fail closed.
 */
import {readFileSync} from 'node:fs'
import {preserveFinalDiodePlacementsFromCurrent} from './physicsFinalDiodeViewPlacements'
import {resolve} from 'node:path'
const ids=new Set([
 'ea17b0af-3d53-5a10-acda-7fd9348537ce','49872cc0-401f-5464-9235-4763df4db5cf','7df923a0-6470-595e-8cea-53126fad9506','d36727cc-ce42-51a3-9425-41afb0b9acdd',
 '922f32ba-f214-5a82-be5c-1111aca51d4a','f505f039-3f07-5afe-88b8-f02532e9c2f0','7d4d6a39-0c78-5fb0-b7bf-182ed00972f7','c2af45aa-e3fc-5119-9159-c5a260b4135a',
 'e1b21fe9-ab6f-58c4-a0b6-9895061fbabb','69280706-5af6-5788-85b7-93287c2ffe74','68034218-8f3e-5f7f-ae4e-ed057dd4e44e','af50bb9a-fd7b-50f5-9698-48c4efe99032',
 '50877233-7abf-54df-b347-6d3224678fc9','7d78da7f-6af5-440a-9d6b-6cab4bee8dd2','bb5c5eab-2fc1-5336-b8cf-14d147695487','7e719cc2-0866-5267-a252-e7e7ac0d03f1','6f896466-e0ec-5f8d-82ad-2890433c82ba',
 '51af53cb-8866-52cd-b2ca-af8bd8a836e0','4dbe6eb9-4d77-58a9-a15c-f0b8bb110a65','5902ebe8-2025-5a7c-b95d-13057398d6e6','6da29199-f086-512c-89f2-1b5ca865eef9',
 '6c87a996-9166-5c6e-8cda-01d40720f9c8','74a32716-2b46-5d96-8b57-3f6edb90e088','144007cb-e2bc-5c82-bf9d-dda705b15257','88f27aab-8724-5a4d-8543-e49ebcb54b8e',
 'c64820e1-c0ee-4342-9225-f981650f0c52','f74c691b-0b76-54e0-8fd6-a22211994e0a',
 '7badac4d-2874-5b3a-87e8-bf8f4440b2a6','70b358bf-da6d-53ba-8393-51d5c2365b04','ca13e9cd-6377-540e-88c8-0308cddc8a7e',
])
type Node = {kind?:string,id?:string,goalId?:string,children?:Node[],[key:string]:unknown}
type Ancestor = {node:Node,index:number}
type View = Record<string,unknown>&{rootNodes:Node[]}
function assert(value:unknown,message:string):asserts value{if(!value)throw Error('B034 view protection: '+message)}
const ownWrapper=(id:string|undefined)=>id?.startsWith('physics-b034-')||id?.startsWith('b034-preserved-')
export function preserveB034PlacementsFromCurrent(draftInput:Record<string,unknown>,currentInput:Record<string,unknown>){
 assert(Array.isArray(draftInput.rootNodes)&&Array.isArray(currentInput.rootNodes),'root node arrays required')
 const draft=draftInput as View,current=currentInput as View
 const draftScope=(draft.scope??{}) as Record<string,unknown>,currentScope=(current.scope??{}) as Record<string,unknown>
 assert(draftScope.jurisdiction===currentScope.jurisdiction&&draftScope.stage===currentScope.stage&&draftScope.courseProfile===currentScope.courseProfile,'source/target scope mismatch')
 const placements:{node:Node,ancestors:Ancestor[],index:number}[]=[]
 const collect=(nodes:Node[],ancestors:Ancestor[]=[])=>nodes.forEach((node,index)=>{
  if(ids.has(node.goalId??''))placements.push({node:structuredClone(node),ancestors,index})
  collect(node.children??[],[...ancestors,{node,index}])
 })
 collect(current.rootNodes)
 const remove=(nodes:Node[]):Node[]=>nodes.filter(node=>!ids.has(node.goalId??'')).map(node=>node.children?{...node,children:remove(node.children)}:node).filter(node=>!(node.kind==='structure'&&ownWrapper(node.id)&&node.children?.length===0))
 draft.rootNodes=remove(draft.rootNodes)
 for(const placement of placements){
  let siblings=draft.rootNodes
  for(const {node:ancestor,index} of placement.ancestors){
   assert(ancestor.kind==='structure'&&ancestor.id,'explicit structure path required')
   let found=siblings.find(node=>node.kind==='structure'&&node.id===ancestor.id)
   if(!found){
    assert(ownWrapper(ancestor.id),'missing reviewed non-B034 stage anchor '+ancestor.id)
    found={...structuredClone(ancestor),children:[]}
    siblings.splice(Math.min(index,siblings.length),0,found)
   }
   assert(Array.isArray(found.children),'structure children required')
   siblings=found.children
  }
  siblings.splice(Math.min(placement.index,siblings.length),0,placement.node)
 }
 return draft
}
export function preservePhysicsB034ViewPlacements(root:string,path:string,draft:Record<string,unknown>){
 const current=JSON.parse(readFileSync(resolve(root,path),'utf8'))
 preserveB034PlacementsFromCurrent(draft,current)
 return preserveFinalDiodePlacementsFromCurrent(draft,current)
}
