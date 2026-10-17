import fs from 'node:fs'
import crypto from 'node:crypto'
import {getSrsFilterTags} from '/home/enpasos/projects/skillpilot/app/src/utils/srsTags.ts'
import {collectCompositionProjectionRoleGoalIds} from '/home/enpasos/projects/skillpilot/app/src/utils/authoring/compositionViewAuthoring.ts'
const input='/mnt/e/skillpilot-chemie-L7-20261017/eleven-colour-goals-retained-target-scope-author-successor-v2/REVIEW-INPUT.clean-eleven-colours-plus-one188-DE-task-successor.v2.json'
const out='/mnt/e/skillpilot-chemie-L7-20261017/eleven-colour-goals-independent-b-v2/CHECK.own-bounded-content-roles-and-stock67-selector.json'
const j=JSON.parse(fs.readFileSync(input,'utf8'))
const c=JSON.parse(fs.readFileSync(j.baseCanonical.path,'utf8'))
const goals=new Map<string,any>(c.goals.map((g:any)=>[g.id,g]))
const a=j.actualCurrent43RoleAndCompilerContent
const views=new Map<string,any>(j.wholeTenCurrentAffectedViews.map((x:any)=>[x.wholeView.viewId,x.wholeView]))
const roleMaps=new Map<string,any>()
for(const [id,v] of views)roleMaps.set(id,collectCompositionProjectionRoleGoalIds(v.rootNodes,goals))
const role=(v:string,id:string)=>{const r=roleMaps.get(v);return r.targetGoalIds.has(id)?'target':r.prerequisiteOnlyGoalIds.has(id)?'prerequisiteOnly':'absent'}
const roleChecks=a.rows.map((r:any)=>({viewId:r.viewId,goalId:r.goalId,actualRole:role(r.viewId,r.goalId),claimedRole:r.currentRawRole,closureMismatches:r.wholeClosureRoles.filter((x:any)=>role(r.viewId,x.goalId)!==x.role)}))
const selectorChecks=a.all67MemorySelections.map((s:any)=>{const g=goals.get(s.goalId);const d=JSON.parse(fs.readFileSync(s.deckPin.path,'utf8'));const tags=getSrsFilterTags(g.tags);const cards=tags.length?d.cards.filter((x:any)=>x.tags?.some((t:string)=>tags.includes(t))):d.cards;return {goalId:g.id,filterTags:tags,cardIds:cards.map((x:any)=>x.id),matches:JSON.stringify(tags)===JSON.stringify(s.filterTags)&&JSON.stringify(cards.map((x:any)=>x.id))===JSON.stringify(s.cardIds)}})
const byId=new Map(a.all67MemorySelections.map((s:any)=>[s.goalId,s]))
const activeMemory=new Map<string,any>()
for(const r of a.rows)for(const m of r.existingRelatedMemoryRoles)if(m.role==='target')activeMemory.set(r.viewId+'|'+m.goalId,{viewId:r.viewId,goalId:m.goalId})
const memoryContexts=[...activeMemory.values()].map((m:any)=>{const g=goals.get(m.goalId);const s:any=byId.get(g.id);const d=JSON.parse(fs.readFileSync(s.deckPin.path,'utf8'));return {...m,title:g.title,requires:g.requires.map((id:string)=>({goalId:id,title:goals.get(id)?.title,actualRole:role(m.viewId,id)})),selectedCards:d.cards.filter((x:any)=>s.cardIds.includes(x.id)).map((x:any)=>({id:x.id,front:x.front,back:x.back,globalOriginTags:x.tags.filter((t:string)=>t.startsWith('goal:'))}))}})
const sort=(v:any):any=>Array.isArray(v)?v.map(sort):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,sort(v[k])])):v
const digest=(v:any)=>crypto.createHash('sha256').update(JSON.stringify(sort(v))).digest('hex')
const leaves=(x:any,y:any,p=''):string[]=>JSON.stringify(x)===JSON.stringify(y)?[]:x&&y&&typeof x==='object'&&typeof y==='object'?[...new Set([...Object.keys(x),...Object.keys(y)])].flatMap(k=>leaves(x[k],y[k],p+'/'+k)):[p]
const before=j.wholeElevenCurrentBeforeScientificProfiles,after=j.wholeElevenProposedScientificProfiles
const pChanges=after.map((x:any,i:number)=>({goalId:x.goalId,leaves:leaves(before[i].wholeProfile,x.wholeProfile),beforeDigest:digest(before[i].wholeProfile),afterDigest:digest(x.wholeProfile)}))
const goalChecks=j.wholeElevenBeforeAndAfterGoals.map((x:any)=>({goalId:x.goalId,baseExact:JSON.stringify(goals.get(x.goalId))===JSON.stringify(x.before),changedLeaves:leaves(x.before,x.after),beforeDigest:digest(x.before),afterDigest:digest(x.after)}))
const view=j.wholeBWPost20ViewLabelChange
const result={role:'INDEPENDENT_B_BOUNDED_CONTENT_DIAGNOSTIC_NOT_APV_M_OR_SCIENCE_PASS',inputSha256:crypto.createHash('sha256').update(fs.readFileSync(input)).digest('hex'),stockFunctions:['getSrsFilterTags','collectCompositionProjectionRoleGoalIds'],roleChecks,selectorChecks,memoryContexts,pChanges,goalChecks,viewChangedLeaves:leaves(view.before,view.after),oldSixAbsentPairs:a.uniqueNonTargetPredecessorRolePairs.filter((x:any)=>x.role==='absent').map((x:any)=>({...x,actualRole:role(x.viewId,x.goalId)})),BW266ActualRole:role('de-bw-gym-chemistry-lk','266a2b2a-9ee2-52f6-ae09-59343da9a60b'),summary:{roleRows:roleChecks.length,roleMismatches:roleChecks.filter((r:any)=>r.actualRole!==r.claimedRole||r.closureMismatches.length).length,selectors:selectorChecks.length,selectorMismatches:selectorChecks.filter((s:any)=>!s.matches).length,activeRelevantMemoryViewPairs:memoryContexts.length,missingActualMemoryDirectRequires:memoryContexts.flatMap((m:any)=>m.requires.filter((r:any)=>r.actualRole==='absent').map((r:any)=>({viewId:m.viewId,memoryGoalId:m.goalId,...r}))),changedProfiles:pChanges.filter((p:any)=>p.leaves.length).length,wholeBaselineGoalMismatches:goalChecks.filter((g:any)=>!g.baseExact).length},M7:false,HumanApproval:false,actualAfterCompilerRun:false}
const step=j.separate188ScientificWholeGoalChange
const scope188=j.wholeElevenBeforeAndAfterGoals.find((x:any)=>x.goalId===step.goalId)
Object.assign(result,{sequential188Guard:{baseEqualsScienceBefore:JSON.stringify(goals.get(step.goalId))===JSON.stringify(step.before),scienceChangedLeaves:leaves(step.before,step.after),scienceAfterEqualsScopeBefore:JSON.stringify(step.after)===JSON.stringify(scope188.before),expectedIntermediateMismatchOnly:goalChecks.filter((g:any)=>!g.baseExact).every((g:any)=>g.goalId===step.goalId)}})
Object.assign(result,{selectedCardOriginRoleContext:memoryContexts.map((m:any)=>({...m,selectedCards:m.selectedCards.map((x:any)=>({...x,originContext:x.globalOriginTags.map((t:string)=>{const id=t.slice(5),g=goals.get(id);return {goalId:id,title:g?.title,description:g?.description,actualRole:role(m.viewId,id)}})}))}))})
fs.writeFileSync(out,JSON.stringify(result,null,2)+'\n')
console.log(JSON.stringify(result.summary,null,2))
