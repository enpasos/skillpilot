// Explicit reviewed Layer-A diode placements, not runtime inference or a new profile selector.
import {readFileSync} from 'node:fs'
import {resolve} from 'node:path'
import type {GoalPlacementContext} from '../../src/landscapeTypes'
import type {PhysicsPlacementNode, PhysicsPlacementView} from './physicsViewPlacementTypes'
export const diodeParent='7f0798cb-5966-5dcb-beb3-84f637ab6139'
export const diodeChildren=['2084b7d4-300d-5fa0-8b8d-c480c40f853e','3857891b-d328-585b-9936-85c7aff122ee','3b586f2a-60e2-5019-aa08-6a47616a1f1f']
export const diodeTasks=['c61b2a69-b5cd-5785-bb04-5d6bca53b218','4ac5a07c-fff0-5eae-890d-89e13eaf69c3','18fb1470-5a03-5277-9486-ae74c63c8a8c']
export const diodeOwnedIds=new Set([diodeParent,...diodeChildren,...diodeTasks])
const diodePrerequisiteSupportIds=new Set(['df010b2b-b182-5f7e-bbe4-49b72e48c27a','7badac4d-2874-5b3a-87e8-bf8f4440b2a6'])
const ownedDiodeReference=(node:PhysicsPlacementNode,inDiodeSekI:boolean,inPrerequisitePractice=false)=>diodeOwnedIds.has(node.goalId as string)||(inDiodeSekI&&node.projectionRole==='prerequisiteOnly'&&diodePrerequisiteSupportIds.has(node.goalId as string))||(inPrerequisitePractice&&node.projectionRole==='target'&&node.goalId==='1abfd5ef-1f42-5b71-8c9a-80c0a6b0322e')
const own=(id:string|undefined)=>id?.startsWith('physics-final-diode-')
const assert=(ok:unknown,message:string)=>{if(!ok)throw Error('Final diode view protection: '+message)}
export function expectedDiodeTargets(scope:GoalPlacementContext):number[]{
 if(!scope.jurisdiction||scope.jurisdiction==='DE')return [0,1,2] // national union, including goal-book atlas; not sixteen state claims
 const lower=scope.stage!=='SekII'
 const matrix:Record<string,number[]> = lower?{'DE-BY':[0,1],'DE-BW':[1],'DE-SL':[0,1,2],'DE-SN':[0,1,2],'DE-ST':[0],'DE-TH':[0],'DE-HE':[0,1,2],'DE-RP':[0]}:{'DE-HE':[0,1,2],'DE-RP':[0],'DE-TH':[0],'DE-SN':scope.courseProfile==='LK'?[0]:[]}
 return matrix[scope.jurisdiction]??[]
}
// Fresh generator drafts must preserve the exact current explicit references.
// Different stage/jurisdiction/duration/profile or missing foreign anchors fail closed.
export function preserveFinalDiodePlacementsFromCurrent<T extends PhysicsPlacementView>(draft:T,current:PhysicsPlacementView){
 for(const key of ['jurisdiction','stage','courseProfile','durationModel'] as const)assert(draft.scope?.[key]===current.scope?.[key],'scope mismatch '+key)
 const placements:{node:PhysicsPlacementNode;index:number;ancestors:{node:PhysicsPlacementNode;index:number}[]}[]=[]
 const collect=(nodes:PhysicsPlacementNode[],ancestors:{node:PhysicsPlacementNode;index:number}[]=[])=>nodes.forEach((n,index)=>{if(ownedDiodeReference(n,ancestors.some(a=>a.node.id==='physics-final-diode-seki'),ancestors.some(a=>a.node.id==='physics-final-diode-prerequisite-practice')))placements.push({node:structuredClone(n),index,ancestors});collect(n.children??[],[...ancestors,{node:n,index}])})
 collect(current.rootNodes)
 const actual=placements.filter(p=>diodeChildren.includes(p.node.goalId as string)&&p.node.projectionRole!=='prerequisiteOnly').map(p=>diodeChildren.indexOf(p.node.goalId as string)).sort()
 assert(JSON.stringify(actual)===JSON.stringify(expectedDiodeTargets(current.scope)),'current explicit target-role matrix incomplete or wrong')
 assert(placements.some(p=>p.node.goalId===diodeParent&&p.node.projectionRole==='prerequisiteOnly'),'parent subtree guard missing')
 assert(placements.filter(p=>p.node.goalId===diodeParent).every(p=>p.node.projectionRole==='prerequisiteOnly'),'legacy parent target would promote unreviewed children')
 const remove=(nodes:PhysicsPlacementNode[],inDiodeSekI=false,inPrerequisitePractice=false):PhysicsPlacementNode[]=>nodes.filter(n=>!ownedDiodeReference(n,inDiodeSekI,inPrerequisitePractice)).map(n=>n.children?{...n,children:remove(n.children,inDiodeSekI||n.id==='physics-final-diode-seki',inPrerequisitePractice||n.id==='physics-final-diode-prerequisite-practice')}:n).filter(n=>!(own(n.id)&&!n.children?.length))
 draft.rootNodes=remove(draft.rootNodes)
 for(const p of placements){let siblings=draft.rootNodes;for(const a of p.ancestors){assert(a.node.kind==='structure'&&a.node.id,'structure path required');let found=siblings.find(n=>n.id===a.node.id);if(!found){assert(own(a.node.id),'missing reviewed stage anchor '+a.node.id);found={...structuredClone(a.node),children:[]};siblings.splice(Math.min(a.index,siblings.length),0,found)}siblings=found.children!}siblings.splice(Math.min(p.index,siblings.length),0,p.node)}
 return draft
}
export function preservePhysicsFinalDiodeViewPlacements<T extends PhysicsPlacementView>(root:string,path:string,draft:T){return preserveFinalDiodePlacementsFromCurrent(draft,JSON.parse(readFileSync(resolve(root,path),'utf8')))}
